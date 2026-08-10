import { ImageResponse } from "next/og";

export const alt = "Label AshB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#faf9f7",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#55575f",
            marginBottom: 24,
          }}
        >
          Handcrafted in India
        </div>
        <div style={{ fontSize: 96, color: "#17181c", lineHeight: 1.05 }}>
          Label AshB
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#34365e",
          }}
        >
          Linen, silk, and cotton pieces, made with care
        </div>
      </div>
    ),
    { ...size },
  );
}
