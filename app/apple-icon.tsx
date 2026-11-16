import { ImageResponse } from "next/og";
import { MARK_BODY, MARK_LIMB } from "./lib/mark";

/* The icon a phone uses when the site is added to its home screen: the logo, bone on
   night. The phone rounds the corners itself. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d0c",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 32 32" fill="#ece9e2">
          <g transform="rotate(-24 16 16)">
            <path d={MARK_BODY} />
            <path d={MARK_LIMB} />
          </g>
        </svg>
      </div>
    ),
    size
  );
}
