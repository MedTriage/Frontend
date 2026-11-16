import type { ReactNode } from "react";
import Link from "next/link";
import { PhaseMark } from "./ChatTurn";
import { LogoMark } from "./site/ui";

/* ── A page with nothing on it: not found, or broken ──
 *
 * Night, the logo, and the new moon. At the new moon nothing is lit, which is what these
 * two pages have to say. The moon is posed from `LEVELS` like every other one, but it is
 * bone, not the red of Level 3: colour means clinical risk, and a missing page is not one.
 *
 * The colours are written out, not taken from the theme, so the page is night in either.
 */

export const NIGHT_BTN =
  "inline-flex h-11 items-center gap-2 rounded-full bg-[#ece9e2] px-5 text-[14px] font-medium text-[#0b0d0c] hover:opacity-85 transition-opacity";
export const NIGHT_BTN_QUIET =
  "inline-flex h-11 items-center gap-2 rounded-full border border-[#ece9e2]/30 px-5 text-[14px] text-[#ece9e2] hover:border-[#ece9e2] transition-colors";

export function NightNotice({
  label,
  title,
  children,
  actions,
}: {
  /** The small line above the headline: "404", "Something broke". */
  label: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-[#0b0d0c] text-[#ece9e2] px-6 sm:px-10 py-7">
      <Link href="/" className="inline-flex items-center gap-2.5 self-start text-[20px] text-[#ece9e2]">
        <LogoMark />
        <span className="display text-[#ece9e2]">MedTriage</span>
      </Link>

      <div className="flex-1 grid place-items-center">
        <div className="w-full max-w-[560px] py-16 rise">
          <PhaseMark level={3} className="w-24 h-24 sm:w-28 sm:h-28" />
          <p className="data mt-10 text-[12px] uppercase tracking-[0.14em] text-[#ece9e2]/60">{label}</p>
          <h1 className="display mt-3 text-[2.4rem] sm:text-[3.2rem] leading-[1.04] text-[#ece9e2]">
            {title}
          </h1>
          <div className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-[#ece9e2]/70">{children}</div>
          <div className="mt-9 flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </main>
  );
}
