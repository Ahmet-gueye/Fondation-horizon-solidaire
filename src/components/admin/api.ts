"use client";

export type ApiResult<T = Record<string, unknown>> =
  | ({ ok: true } & T)
  | { ok: false; message: string; errors?: Record<string, string>; status: number };

/** Appel JSON vers les routes d'administration, avec messages d'erreur lisibles. */
export async function adminApi<T = Record<string, unknown>>(url: string, method: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (res.ok && data?.ok) return data as { ok: true } & T;
    return {
      ok: false,
      status: res.status,
      message: (data?.message as string) || (res.status === 413 ? "Fichier trop lourd." : "Une erreur est survenue. Réessayez."),
      errors: (data?.errors as Record<string, string>) || undefined,
    };
  } catch {
    return { ok: false, status: 0, message: "Connexion impossible. Vérifiez votre accès à Internet puis réessayez." };
  }
}

export async function uploadFile(file: Blob, kind: "image" | "document", filename: string) {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file, filename);
  try {
    const res = await fetch("/api/admin/medias", { method: "POST", body: form, credentials: "same-origin" });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; media?: { id: string; width: number | null; height: number | null } } | null;
    if (res.ok && data?.ok && data.media) return { ok: true as const, media: data.media };
    return { ok: false as const, message: data?.message || (res.status === 413 ? "Fichier trop lourd (4 Mo maximum)." : "L'import a échoué.") };
  } catch {
    return { ok: false as const, message: "Connexion impossible pendant l'import. Réessayez." };
  }
}
