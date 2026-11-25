import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getDataDir } from "./env";

/**
 * Stockage minimal en fichiers JSON (dossier `DATA_DIR`, par défaut `./data`).
 *
 * Convient à un hébergement sur serveur Node avec disque persistant (VPS, conteneur
 * avec volume). Sur une plateforme « serverless » (ex. Vercel), le disque n'est pas
 * persistant : remplacez ce module par une base de données (PostgreSQL, SQLite
 * hébergé…) en conservant la même interface. Voir le README.
 */

const locks = new Map<string, Promise<unknown>>();

function filePath(collection: string) {
  if (!/^[a-z-]+$/.test(collection)) throw new Error("Nom de collection invalide");
  return path.resolve(getDataDir(), `${collection}.json`);
}

async function readAll<T>(collection: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(filePath(collection), "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as T[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll<T>(collection: string, rows: T[]) {
  const target = filePath(collection);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, target);
}

/** Exécute une modification en exclusion mutuelle (évite les écritures concurrentes). */
export async function mutate<T, R>(collection: string, fn: (rows: T[]) => { rows: T[]; result: R } | Promise<{ rows: T[]; result: R }>): Promise<R> {
  const previous = locks.get(collection) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((r) => (release = r));
  locks.set(collection, previous.then(() => current));
  await previous.catch(() => undefined);
  try {
    const rows = await readAll<T>(collection);
    const { rows: next, result } = await fn(rows);
    await writeAll(collection, next);
    return result;
  } finally {
    release();
  }
}

export async function findOne<T>(collection: string, predicate: (row: T) => boolean): Promise<T | undefined> {
  const rows = await readAll<T>(collection);
  return rows.find(predicate);
}
