import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} : ${site.motto}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage générée automatiquement (remplaçable via `site.shareImage`). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(160deg, #0b4228 0%, #0f5634 60%, #166c42 100%)", color: "#fff", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 9999, background: "rgba(244,180,0,0.35)", display: "flex" }} />
        <div style={{ position: "absolute", right: 90, top: 110, width: 200, height: 200, borderRadius: 9999, background: "#f4b400", display: "flex" }} />
        <div style={{ fontSize: 30, color: "#f8c63a", letterSpacing: 4, textTransform: "uppercase", display: "flex" }}>Sénégal</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, marginTop: 20, maxWidth: 820, display: "flex" }}>{site.name}</div>
        <div style={{ fontSize: 38, marginTop: 28, color: "#d7e8dd", display: "flex" }}>« {site.motto} »</div>
      </div>
    ),
    size,
  );
}
