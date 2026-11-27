import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, makeT, type Locale } from "./index";

/** Langue du visiteur (cookie), français par défaut. */
export async function getLocale(): Promise<Locale> {
  try {
    const v = (await cookies()).get(LOCALE_COOKIE)?.value;
    return isLocale(v) ? v : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export async function i18n() {
  const locale = await getLocale();
  return { locale, t: makeT(locale) };
}
