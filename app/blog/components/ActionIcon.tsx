/*
 * blog/components/ActionIcon.tsx
 *
 * Small line icons for the action buttons (Open case, View PDF, Download,
 * Screenshots, Copy link). The shared Icon set in core/icons is FontAwesome
 * solid shapes and has no download / link / gallery glyphs — and solid
 * shapes at 12px next to uppercase mono text read as blobs. Strokes stay crisp.
 *
 * No "use client": static SVG, works in Server and Client Components alike.
 *
 * `data-fx-icon` is the hook for the per-icon hover motion in globals.css
 * section 17 (the arrow moves forward, download drops, and so on).
 */

export type ActionIconName = "arrow" | "external" | "download" | "gallery" | "link" | "check" | "alert";

const PATHS: Record<ActionIconName, string[]> = {
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  external: ["M14 4h6v6", "M10 14 20 4", "M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"],
  download: ["M12 4v11", "M7 10l5 5 5-5", "M4 20h16"],
  gallery: ["M4 5h16v14H4z", "M4 16l5-5 4 4 2-2 5 5", "M15.5 9.5h.01"],
  link: [
    "M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2",
    "M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2",
  ],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  alert: ["M12 8v5", "M12 16.5h.01", "M12 3 2.5 20h19z"],
};

export default function ActionIcon({ name }: { name: ActionIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-fx-icon={name}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
