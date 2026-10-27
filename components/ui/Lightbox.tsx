"use client";

/* The screenshot / certificate lightbox. Always imported with next/dynamic,
   so the library and its CSS load only when something is opened. */

import YarlLightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Zoom, Fullscreen, Thumbnails } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/thumbnails.css";

type Slide = { src: string; title: string; description?: string };

export default function Lightbox({ close, index, slides }: { close: () => void; index: number; slides: Slide[] }) {
  return (
    <YarlLightbox
      open
      close={close}
      index={index}
      slides={slides}
      plugins={[Zoom, Fullscreen, Thumbnails]}
      styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.98)" } }}
    />
  );
}
