import type { Metadata } from "next";
import Link from "next/link";
import { NIGHT_BTN, NIGHT_BTN_QUIET, NightNotice } from "./components/NightNotice";

export const metadata: Metadata = { title: "Page not found · MedTriage" };

/* Any address the app has no page for. Before 2026-11-15 this was the framework's own
   plain screen. */
export default function NotFound() {
  return (
    <NightNotice
      label="404"
      title="Nothing is lit here."
      actions={
        <>
          <Link href="/" className={NIGHT_BTN}>
            Back to the overview
          </Link>
          <Link href="/chat" className={NIGHT_BTN_QUIET}>
            Start a consultation
          </Link>
        </>
      }
    >
      <p>There is no page at this address. The link may be old, or mistyped.</p>
    </NightNotice>
  );
}
