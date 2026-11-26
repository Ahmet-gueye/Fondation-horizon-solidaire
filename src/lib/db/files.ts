import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { getBlobStoreId, getBlobToken, getDataDir, isEphemeralHost } from "@/lib/env";

/**
 * Stockage des fichiers téléversés (images optimisées, documents PDF).
 *
 * - Vercel Blob si `BLOB_READ_WRITE_TOKEN` ou `BLOB_STORE_ID` est défini (production sur Vercel).
 *   Avec seulement `BLOB_STORE_ID`, le SDK s'authentifie via le jeton OIDC fourni par Vercel.
 *   Les fichiers sont déposés en accès privé (`BLOB_ACCESS=private`, par défaut) :
 *   ils ne sont lisibles qu'à travers le site, qui vérifie que la fiche est publiée.
 * - Sinon, dossier local `DATA_DIR/uploads/` (développement, serveur avec disque persistant).
 * - Sur Vercel sans magasin Blob : aucun téléversement possible (FilesNotConfigured).
 */

export class FilesNotConfigured extends Error {
  constructor() {
    super("Aucun stockage de fichiers n'est configuré (variable BLOB_READ_WRITE_TOKEN manquante).");
  }
}

export interface FileStore {
  kind: "vercel-blob" | "fichiers";
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<{ body: ReadableStream<Uint8Array> | Buffer; contentType: string | null } | null>;
  remove(keys: string[]): Promise<void>;
}

const KEY_RE = /^[a-z0-9-]+\/[a-z0-9-]+\.(webp|pdf)$/;
function check(key: string) {
  if (!KEY_RE.test(key)) throw new Error("Clé de fichier invalide");
}

function blobAccess(): "private" | "public" {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}

function blobStore(token: string | undefined): FileStore {
  const access = blobAccess();
  return {
    kind: "vercel-blob",
    async put(key, body, contentType) {
      check(key);
      await put(`fhs/${key}`, body, { access, contentType, token, addRandomSuffix: false, allowOverwrite: false, cacheControlMaxAge: 3600 });
    },
    async get(key) {
      check(key);
      const res = await get(`fhs/${key}`, { access, token });
      if (!res || !res.stream) return null;
      return { body: res.stream, contentType: res.blob?.contentType ?? null };
    },
    async remove(keys) {
      keys.forEach(check);
      if (keys.length) await del(keys.map((k) => `fhs/${k}`), { token });
    },
  };
}

function localStore(dir: string): FileStore {
  const root = path.resolve(dir, "uploads");
  const fileOf = (key: string) => path.join(root, key);
  return {
    kind: "fichiers",
    async put(key, body) {
      check(key);
      await fs.mkdir(path.dirname(fileOf(key)), { recursive: true });
      await fs.writeFile(fileOf(key), body, { mode: 0o600, flag: "wx" });
    },
    async get(key) {
      check(key);
      try {
        const body = await fs.readFile(fileOf(key));
        return { body, contentType: key.endsWith(".pdf") ? "application/pdf" : "image/webp" };
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw err;
      }
    },
    async remove(keys) {
      keys.forEach(check);
      await Promise.all(keys.map((k) => fs.rm(fileOf(k), { force: true })));
    },
  };
}

export function filesKind(): FileStore["kind"] | null {
  if (getBlobToken() || getBlobStoreId()) return "vercel-blob";
  if (isEphemeralHost()) return null;
  return "fichiers";
}

export function getFileStore(): FileStore {
  const token = getBlobToken();
  if (token || getBlobStoreId()) return blobStore(token ?? undefined);
  if (isEphemeralHost()) throw new FilesNotConfigured();
  return localStore(getDataDir());
}
