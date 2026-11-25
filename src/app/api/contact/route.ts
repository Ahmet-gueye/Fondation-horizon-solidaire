import { randomUUID } from "node:crypto";
import { getFormsWebhook } from "@/lib/env";
import { clientIp, isJson, isSameOrigin, jsonError, logEvent, looksLikeSpam, rateLimit } from "@/lib/security";
import { mutate } from "@/lib/store";
import { contactTypes, validateContact, type ContactInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StoredMessage = ContactInput & { id: string; receivedAt: string };

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !isJson(request)) return jsonError(403, "Requête refusée.");
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return jsonError(429, "Vous avez envoyé plusieurs messages en peu de temps. Merci de réessayer un peu plus tard.");
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError(400, "Données invalides.");
  if (looksLikeSpam(body)) {
    // Réponse neutre : on ne révèle pas la détection aux robots.
    return Response.json({ ok: true });
  }

  const result = validateContact(body);
  if (!result.ok) return jsonError(422, "Merci de vérifier les champs signalés.", result.errors);

  const message: StoredMessage = { ...result.data, id: randomUUID(), receivedAt: new Date().toISOString() };
  let delivered = false;

  const webhook = getFormsWebhook();
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...message, typeLabel: contactTypes[message.type] }),
        signal: AbortSignal.timeout(10_000),
      });
      delivered = res.ok;
    } catch {
      delivered = false;
    }
  }

  try {
    await mutate<StoredMessage, void>("messages", (rows) => ({ rows: [...rows, message], result: undefined }));
    delivered = true;
  } catch (err) {
    logEvent("contact.stockage.erreur", { message: (err as Error).message });
  }

  logEvent("contact.recu", { type: message.type, transmis: delivered });
  if (!delivered) {
    return jsonError(503, "Votre message n'a pas pu être enregistré pour le moment. Merci de réessayer plus tard.");
  }
  return Response.json({ ok: true });
}
