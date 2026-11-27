import { handleIpn } from "@/lib/payments/dons";
import type { IpnPayload } from "@/lib/payments/paytech-signature";
import { logEvent } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Notification de paiement envoyée par PayTech (IPN), de serveur à serveur.
 * C'est la SEULE voie qui marque un don comme payé. Accepte les formats formulaire et JSON.
 */
export async function POST(request: Request) {
  const type = (request.headers.get("content-type") ?? "").toLowerCase();
  const payload: IpnPayload = {};
  try {
    if (type.includes("application/json")) {
      const json = (await request.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(json ?? {})) if (v !== null && v !== undefined) payload[k] = String(v);
    } else {
      const form = await request.formData();
      for (const [k, v] of form.entries()) if (typeof v === "string") payload[k] = v;
    }
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  try {
    const out = await handleIpn(payload);
    return new Response(out.body, { status: out.status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err) {
    logEvent("paytech.ipn.erreur", { message: (err as Error).message });
    return new Response("Error", { status: 500 });
  }
}
