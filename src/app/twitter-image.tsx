import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const alt = `${SITE_NAME} — Precision Surgical Instruments`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background:
            "linear-gradient(145deg, #0f172a 0%, #1e3a5f 45%, #2563eb 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 16,
            width: 96,
            height: 6,
            borderRadius: 999,
            background: "#93c5fd",
          }}
        />
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            opacity: 0.85,
            maxWidth: 800,
          }}
        >
          Precision surgical instruments for hospitals, distributors, and OEM
          partners
        </div>
      </div>
    ),
    { ...size }
  );
}
