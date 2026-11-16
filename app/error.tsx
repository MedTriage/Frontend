"use client";

import { useEffect } from "react";
import Link from "next/link";
import { NIGHT_BTN, NIGHT_BTN_QUIET, NightNotice } from "./components/NightNotice";

/* A page that threw while rendering. Someone may have been in the middle of a
   consultation when it did, so it carries the fixed emergency line the chat page shows
   when the service cannot be reached: the one number allowed in client copy. */
export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <NightNotice
      label="Something broke"
      title="This page stopped working."
      actions={
        <>
          <button type="button" onClick={reset} className={NIGHT_BTN}>
            Try again
          </button>
          <Link href="/" className={NIGHT_BTN_QUIET}>
            Back to the overview
          </Link>
        </>
      }
    >
      <p>
        The fault is ours, not yours. Try again, and if it keeps happening, come back in a
        little while.
      </p>
      <p className="mt-3">If this is an emergency, call 112 now.</p>
    </NightNotice>
  );
}
