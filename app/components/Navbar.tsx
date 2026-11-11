"use client";

import "../site.css";
import { Nav } from "./site/SiteShell";
import { LogoMark } from "./site/ui";

/** The mark: a moon part-way through its phase, the same one the public site is built
 *  around (`site/ui.tsx` has the reasoning). Ink here, because inside the app colour is
 *  reserved for the triage level and the logo must not look like one. */
export function Mark() {
  return <LogoMark className="w-[22px] h-[22px] shrink-0" />;
}

/**
 * The app pages' header, which is the public site's header.
 *
 * One header for the whole product: the same logo, the same links, the same button. The
 * `.site.bare` wrapper lends it the site's type and classes without the site's dark
 * field, so it sits on whatever theme the page is in (see `site.css`).
 */
export function Navbar() {
  return (
    <div className="site bare">
      <Nav bare />
    </div>
  );
}
