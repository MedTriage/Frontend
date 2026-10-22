"use client";

/**
 * Adapted from Aceternity UI's "comet-card".
 *
 * Source: https://ui.aceternity.com/registry/comet-card.json
 *
 * A card that tilts toward the cursor and carries a specular highlight across
 * its face as it turns. It arrives with no dependencies of its own — `motion` and
 * this repo's `cn` are both already here — so the structure below is upstream's
 * almost verbatim. Four changes, and the first is not cosmetic.
 *
 * 1. `prefers-reduced-motion`. Upstream has no path for it: the card tilts,
 *    scales and glares unconditionally, and a cursor-tracked 3D transform is
 *    close to the worst case for anyone who has asked the machine to hold still.
 *    `useStillness()` now short-circuits the whole thing to a plain static div —
 *    not a slowed-down tilt, none of it. Unlike the meaning-carrying gestures in
 *    `globals.css`, there is no "finished state" to land in, because the tilt
 *    says nothing; a card lying flat has lost exactly zero information.
 *
 * 2. Shallower defaults. Upstream's 17.5deg and 20px read as a toy at this size.
 *    At 10deg and 12px it reads as a card being turned in the light, which is
 *    the only thing this section wants from it.
 *
 * 3. A quieter glare. Upstream's is white at 0.9 alpha over `mix-blend-overlay`,
 *    which blows out any photograph underneath. Pulled back to a highlight that
 *    passes across the picture rather than erasing it.
 *
 * 4. The shadow is `--shadow-2`. Upstream hardcodes four rgba stacks tuned for a
 *    white page; on this site the card also has to sit on a dark ground in the
 *    other theme, and a fixed black shadow is invisible there.
 *
 * The tilt is honest decoration and worth naming as such — it carries no
 * information, which everywhere else in this codebase would disqualify it. It
 * earns its place by being the last thing on the page: the argument is finished
 * by then, and an object you can turn over is a better invitation to click than
 * another paragraph.
 *
 * One thing to preserve in whatever this wraps: give the card a mount. The
 * children should be inset from its edge, not bled to it. The tilt only reads as
 * a *card turning* if there is a stationary border for the eye to judge the
 * rotation against; a picture running edge to edge just looks like a wobbling
 * picture.
 */

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import { cn } from "@/lib/utils";
import { useStillness } from "../lib/useStillness";

export const CometCard = ({
  rotateDepth = 10,
  translateDepth = 12,
  className,
  children,
}: {
  rotateDepth?: number;
  translateDepth?: number;
  className?: string;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStillness();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`]
  );

  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`]
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`]
  );

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 10%, rgba(255, 255, 255, 0.22) 30%, rgba(255, 255, 255, 0) 75%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  /* Read during render rather than sampled in an effect, per the note in
     `useStillness`. Returning before any motion element mounts means a reader
     who has asked for stillness never has the listeners attached at all, rather
     than having them attached and ignored. */
  if (still) {
    return (
      <div className={className}>
        <div className="relative rounded-2xl shadow-[var(--shadow-2)]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("perspective-distant transform-3d", className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          boxShadow: "var(--shadow-2)",
        }}
        initial={{ scale: 1, z: 0 }}
        whileHover={{ scale: 1.03, z: 40, transition: { duration: 0.2 } }}
        className="relative rounded-2xl"
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 h-full w-full rounded-2xl mix-blend-overlay"
          style={{ background: glareBackground, opacity: 0.55 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  );
};
