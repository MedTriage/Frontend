/**
 * Adapted from Aceternity UI's "bento-grid".
 *
 * Source: https://ui.aceternity.com/registry/bento-grid.json
 *
 * Not vendored verbatim, unlike `DitherShader`, and the reason is worth writing
 * down. Upstream styles itself with literal Tailwind palette values
 * (`border-neutral-200`, `bg-white`) plus `dark:` variants for the other theme.
 * Neither half of that works here: this project themes by redefining custom
 * properties on a `.light` / `.dark` class and exposing them through
 * `@theme inline`, so `bg-white` would ignore the theme entirely and `dark:`
 * would never match. Keeping the original classes would have produced a
 * component that looked correct in exactly one theme and wrong in the other.
 *
 * So the structure is upstream's — a grid, and an item with header / icon /
 * title / description — and the styling is this repo's tokens. Its listed
 * dependency, `@tabler/icons-react`, belongs to the demo rather than the
 * component; the `icon` prop takes any node, and nothing here needs it.
 *
 * Two changes from upstream, both deliberate:
 *  - `auto-rows` is gone. Upstream pins every row to a fixed height, which works
 *    for its demo's one-line captions and fails here: these cards carry real
 *    copy of very different lengths, so a fixed track either clips the long ones
 *    or leaves the short ones hollow. Rows size to content instead, and the
 *    cards line up because the *image* is a fixed height — see the header in
 *    `RuleGrid`. That also keeps a wide cell's picture the same height as a
 *    narrow one's, which an aspect ratio would not.
 *  - The hover translate on the text block is gone. Upstream nudges the copy
 *    sideways on hover; on cards whose copy is a safety rule, that is motion
 *    that means nothing, and this design system spends motion only on meaning.
 */

import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card transition-shadow duration-200 hover:shadow-[var(--shadow-2)]",
        className
      )}
    >
      {header}
      <div className="p-5">
        {icon}
        <div className="mt-3 text-[15px] font-semibold leading-snug">
          {title}
        </div>
        <div className="mt-2 text-[13px] leading-relaxed text-muted">
          {description}
        </div>
      </div>
    </div>
  );
};
