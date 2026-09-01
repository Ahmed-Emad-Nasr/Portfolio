/*
 * core/icons/Icon.tsx
 *
 * A replacement for <FontAwesomeIcon /> — the same visual result without
 * FontAwesome's 94KB engine (see the comment in icon-data.ts).
 *
 * Deliberately a Server Component: no "use client". An icon is a static SVG
 * with no interactivity, so there is no reason for it to load in the
 * browser — it renders to markup at build time and that is the end of it.
 * (If a client component imports it, it works there normally — but then the
 * table gets bundled with it.)
 *
 * Dimensions come from `1em` so the icon follows the font size of whatever
 * surrounds it, exactly like FontAwesome.
 */

import { ICONS, type IconName } from "./icon-data";

type IconProps = {
  name: IconName;
  className?: string;
  /** If the icon carries meaning, put alternative text here — otherwise it is hidden from screen readers */
  title?: string;
};

export default function Icon({ name, className, title }: IconProps) {
  const [width, height, path] = ICONS[name];

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      /* fill="currentColor" makes the icon take the colour of the surrounding
         text with no extra CSS rule — the same behaviour as FontAwesome. */
      fill="currentColor"
      width="1em"
      height="1em"
      /* Every icon here is decorative, sitting next to written text. If one of
         them is the only carrier of meaning, pass title and it becomes
         role="img" with a name. */
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path d={path} />
    </svg>
  );
}

export type { IconName };
