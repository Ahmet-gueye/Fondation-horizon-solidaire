import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/i18n";

/** Change la langue du site puis revient à la page d'origine (chemin interne uniquement). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const raw = req.nextUrl.searchParams.get("retour") ?? "/";
  const back = raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") && !raw.startsWith("/admin") ? raw : "/";
  const res = NextResponse.redirect(new URL(back, req.nextUrl.origin), 303);
  if (isLocale(code)) {
    res.cookies.set(LOCALE_COOKIE, code, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: process.env.NODE_ENV === "production", httpOnly: false });
  }
  res.headers.set("Cache-Control", "no-store");
  return res;
}
