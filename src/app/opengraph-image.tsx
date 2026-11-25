import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} : ${site.motto}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage générée automatiquement (remplaçable via `site.shareImage`). */
export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public/images/logo/logo-fondation-complet.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(160deg, #0b4228 0%, #0f5634 60%, #166c42 100%)", color: "#fff", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 9999, background: "rgba(244,180,0,0.35)", display: "flex" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={425} height={430} alt="" style={{ position: "absolute", right: 70, top: 100, borderRadius: 28 }} />
        <div style={{ fontSize: 30, color: "#f8c63a", letterSpacing: 4, textTransform: "uppercase", display: "flex" }}>Sénégal</div>
        <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.1, marginTop: 20, maxWidth: 620, display: "flex" }}>{site.name}</div>
        <div style={{ fontSize: 32, marginTop: 28, maxWidth: 620, color: "#d7e8dd", display: "flex" }}>« {site.motto} »</div>
      </div>
    ),
    size,
  );
}
