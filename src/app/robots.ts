import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/faire-un-don/merci", "/faire-un-don/annule", "/faire-un-don/simulation"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
