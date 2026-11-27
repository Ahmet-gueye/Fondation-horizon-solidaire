import type { Metadata, Viewport } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { site } from "@/config/site";
import { getLocale } from "@/i18n/server";
import "./globals.css";

// Polices auto-hébergées par Next.js au moment du build : aucune requête vers Google côté visiteur.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["500", "600", "700"],
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === "en";
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} | ${en ? site.en.motto : site.motto}`,
      template: `%s | ${site.name}`,
    },
    description: en ? site.en.description : site.description,
    applicationName: site.name,
    openGraph: {
      siteName: site.name,
      locale: en ? "en_GB" : "fr_SN",
      type: "website",
      ...(site.shareImage
        ? { images: [{ url: site.shareImage, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b4228",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${outfit.variable} ${sourceSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Active les animations d'apparition seulement si JavaScript fonctionne. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
