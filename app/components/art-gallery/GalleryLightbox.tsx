"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Zoom, Fullscreen, Thumbnails } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface GalleryLightboxProps {
  open: boolean;
  close: () => void;
  index: number;
  slides: {
    src: string;
    title: string;
    description: string;
  }[];
}

export default function GalleryLightbox({ open, close, index, slides }: GalleryLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={close}
      index={index}
      slides={slides}
      plugins={[Zoom, Fullscreen, Thumbnails]}
      styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.98)" } }}
    />
  );
}
