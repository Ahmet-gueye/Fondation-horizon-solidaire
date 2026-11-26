import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { getDataDir, getDatabaseUrl, isEphemeralHost } from "@/lib/env";

/**
 * Stockage des données (fiches, comptes, historique, messages).
 *
 * - PostgreSQL si `DATABASE_URL` (ou `POSTGRES_URL`) est défini : c'est le mode
 *   de production (Neon via Vercel, Supabase, ou tout PostgreSQL hébergé).
 * - Sinon, fichiers JSON dans `DATA_DIR/db/` : réservé au développement local ou
 *   à un serveur disposant d'un disque persistant.
 * - Sur Vercel sans base configurée : rien n'est enregistré (StorageNotConfigured),
 *   car le disque y est effacé régulièrement.
 *
 * Chaque document porte un numéro de `version` : une mise à jour échoue
 * (VersionConflict) si quelqu'un a modifié le document entre-temps.
 */

export type Doc<T> = T & { id: string; version: number };

export class StorageNotConfigured extends Error {
  constructor() {
    super("Aucune base de données n'est configurée (variable DATABASE_URL manquante).");
  }
}
export class VersionConflict extends Error {
  constructor() {
    super("Ce contenu a été modifié par quelqu'un d'autre entre-temps.");
  }
}
export class AlreadyExists extends Error {}

export interface DocStore {
  kind: "postgres" | "fichiers";
  list<T>(collection: string): Promise<Doc<T>[]>;
  get<T>(collection: string, id: string): Promise<Doc<T> | null>;
  insert<T>(collection: string, id: string, data: T): Promise<Doc<T>>;
  update<T>(collection: string, id: string, data: T, expectedVersion: number): Promise<Doc<T>>;
  remove(collection: string, id: string): Promise<void>;
}

const COLLECTION_RE = /^[a-z][a-z-]{1,30}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
function check(collection: string, id?: string) {
  if (!COLLECTION_RE.test(collection)) throw new Error("Nom de collection invalide");
  if (id !== undefined && !ID_RE.test(id)) throw new Error("Identifiant invalide");
}

/* ---------------- PostgreSQL ---------------- */

type Row = { id: string; data: Record<string, unknown>; version: number };

function postgresStore(url: string): DocStore {
  const g = globalThis as unknown as { __fhsSql?: postgres.Sql; __fhsSchema?: Promise<unknown> };
  // `prepare: false` : compatible avec les connexions mutualisées (Neon, Supabase).
  const sql = (g.__fhsSql ??= postgres(url, { max: 3, idle_timeout: 20, connect_timeout: 10, prepare: false, onnotice: () => undefined }));
  const ready = () =>
    (g.__fhsSchema ??= sql`
      CREATE TABLE IF NOT EXISTS fhs_documents (
        collection text NOT NULL,
        id text NOT NULL,
        data jsonb NOT NULL,
        version integer NOT NULL DEFAULT 1,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (collection, id)
      )`.catch((err) => {
      g.__fhsSchema = undefined;
      throw err;
    }));
  const toDoc = <T,>(r: Row) => ({ ...(r.data as T), id: r.id, version: r.version }) as Doc<T>;
  const strip = (data: unknown) => {
    const { id: _id, version: _v, ...rest } = data as Record<string, unknown>;
    return rest as postgres.JSONValue;
  };

  return {
    kind: "postgres",
    async list<T>(collection: string) {
      check(collection);
      await ready();
      const rows = await sql<Row[]>`SELECT id, data, version FROM fhs_documents WHERE collection = ${collection}`;
      return rows.map((r) => toDoc<T>(r));
    },
    async get<T>(collection: string, id: string) {
      check(collection, id);
      await ready();
      const rows = await sql<Row[]>`SELECT id, data, version FROM fhs_documents WHERE collection = ${collection} AND id = ${id}`;
      return rows[0] ? toDoc<T>(rows[0]) : null;
    },
    async insert<T>(collection: string, id: string, data: T) {
      check(collection, id);
      await ready();
      const rows = await sql<Row[]>`
        INSERT INTO fhs_documents (collection, id, data) VALUES (${collection}, ${id}, ${sql.json(strip(data))})
        ON CONFLICT DO NOTHING RETURNING id, data, version`;
      if (!rows[0]) throw new AlreadyExists("Ce document existe déjà.");
      return toDoc<T>(rows[0]);
    },
    async update<T>(collection: string, id: string, data: T, expectedVersion: number) {
      check(collection, id);
      await ready();
      const rows = await sql<Row[]>`
        UPDATE fhs_documents SET data = ${sql.json(strip(data))}, version = version + 1, updated_at = now()
        WHERE collection = ${collection} AND id = ${id} AND version = ${expectedVersion}
        RETURNING id, data, version`;
      if (!rows[0]) throw new VersionConflict();
      return toDoc<T>(rows[0]);
    },
    async remove(collection: string, id: string) {
      check(collection, id);
      await ready();
      await sql`DELETE FROM fhs_documents WHERE collection = ${collection} AND id = ${id}`;
    },
  };
}

/* ---------------- Fichiers JSON (local) ---------------- */

type FileRow = { data: Record<string, unknown>; version: number };
const locks = new Map<string, Promise<unknown>>();

function fileStore(dir: string): DocStore {
  const fileOf = (collection: string) => path.resolve(dir, "db", `${collection}.json`);
  async function readAll(collection: string): Promise<Record<string, FileRow>> {
    try {
      return JSON.parse(await fs.readFile(fileOf(collection), "utf8")) as Record<string, FileRow>;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw err;
    }
  }
  async function writeAll(collection: string, rows: Record<string, FileRow>) {
    const target = fileOf(collection);
    await fs.mkdir(path.dirname(target), { recursive: true });
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 1), { encoding: "utf8", mode: 0o600 });
    await fs.rename(tmp, target);
  }
  async function exclusive<R>(collection: string, fn: (rows: Record<string, FileRow>) => Promise<{ rows?: Record<string, FileRow>; result: R }>) {
    const previous = locks.get(collection) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((r) => (release = r));
    locks.set(collection, previous.then(() => current));
    await previous.catch(() => undefined);
    try {
      const rows = await readAll(collection);
      const { rows: next, result } = await fn(rows);
      if (next) await writeAll(collection, next);
      return result;
    } finally {
      release();
    }
  }
  const toDoc = <T,>(id: string, r: FileRow) => ({ ...(r.data as T), id, version: r.version }) as Doc<T>;
  const strip = (data: unknown) => {
    const { id: _id, version: _v, ...rest } = data as Record<string, unknown>;
    return JSON.parse(JSON.stringify(rest)) as Record<string, unknown>;
  };

  return {
    kind: "fichiers",
    async list<T>(collection: string) {
      check(collection);
      const rows = await readAll(collection);
      return Object.entries(rows).map(([id, r]) => toDoc<T>(id, r));
    },
    async get<T>(collection: string, id: string) {
      check(collection, id);
      const rows = await readAll(collection);
      return Object.hasOwn(rows, id) ? toDoc<T>(id, rows[id]) : null;
    },
    insert<T>(collection: string, id: string, data: T) {
      check(collection, id);
      return exclusive(collection, async (rows) => {
        if (Object.hasOwn(rows, id)) throw new AlreadyExists("Ce document existe déjà.");
        rows[id] = { data: strip(data), version: 1 };
        return { rows, result: toDoc<T>(id, rows[id]) };
      });
    },
    update<T>(collection: string, id: string, data: T, expectedVersion: number) {
      check(collection, id);
      return exclusive(collection, async (rows) => {
        const cur = Object.hasOwn(rows, id) ? rows[id] : null;
        if (!cur || cur.version !== expectedVersion) throw new VersionConflict();
        rows[id] = { data: strip(data), version: cur.version + 1 };
        return { rows, result: toDoc<T>(id, rows[id]) };
      });
    },
    remove(collection: string, id: string) {
      check(collection, id);
      return exclusive(collection, async (rows) => {
        delete rows[id];
        return { rows, result: undefined };
      });
    },
  };
}

/* ---------------- Sélection ---------------- */

export function databaseKind(): DocStore["kind"] | null {
  if (getDatabaseUrl()) return "postgres";
  if (isEphemeralHost()) return null;
  return "fichiers";
}

export function getStore(): DocStore {
  const url = getDatabaseUrl();
  if (url) return postgresStore(url);
  if (isEphemeralHost()) throw new StorageNotConfigured();
  return fileStore(getDataDir());
}
