import { ImageResponse } from "next/og";
import { LEVELS } from "./lib/levels";
import { MARK_BODY, MARK_LIMB } from "./lib/mark";
import { litPath, phaseOf } from "./lib/phase";

/* ── The card a shared link shows ──
 *
 * Night, the logo, the product's one claim, and the three levels as three moons, each
 * posed from `LEVELS` and lit in its level's colour, as on the site. Added 2026-11-15;
 * before it a pasted link was a bare address. `twitter-image.tsx` re-exports this.
 *
 * The headline face is Newsreader, fetched from Google Fonts for just the letters used.
 * If that fetch fails the card is drawn in the renderer's own face rather than not at all.
 */

export const alt = "MedTriage: autonomy falls as clinical risk rises";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b0d0c";
const BONE = "#ece9e2";
// --go, --hold, --stop in site.css.
const COLOUR = ["#22c77e", "#ffb01f", "#ff4b2b"];
const CLAIM = "Autonomy falls as clinical risk rises.";

async function newsreader(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400&text=${encodeURIComponent(text)}`
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const names = LEVELS.map((l) => `Level ${l.level} ${l.name}`).join(" ");
  const font = await newsreader(`MedTriage ${CLAIM} ${names}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          color: BONE,
          padding: "64px 72px",
          fontFamily: font ? "Newsreader" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40 }}>
          <svg width="46" height="46" viewBox="0 0 32 32" fill={BONE}>
            <g transform="rotate(-24 16 16)">
              <path d={MARK_BODY} />
              <path d={MARK_LIMB} />
            </g>
          </svg>
          MedTriage
        </div>

        <div style={{ display: "flex", fontSize: 92, lineHeight: 1.02, letterSpacing: -3, maxWidth: 940 }}>
          {CLAIM}
        </div>

        <div style={{ display: "flex", gap: 56 }}>
          {LEVELS.map((l, n) => {
            const phase = phaseOf(l.ai);
            return (
              <div key={l.level} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <svg width="64" height="64" viewBox="-108 -108 216 216">
                  <circle r="100" fill="#1d2320" />
                  <g transform="rotate(24)">
                    <path d={litPath(phase)} fill={COLOUR[n]} />
                  </g>
                  {phase <= -1 && <circle r="100" fill="none" stroke={COLOUR[n]} strokeWidth="12" />}
                </svg>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 21, opacity: 0.6 }}>Level {l.level}</div>
                  <div style={{ display: "flex", fontSize: 28 }}>{l.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Newsreader", data: font, style: "normal", weight: 400 }] : undefined,
    }
  );
}
