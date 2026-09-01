/*
 * blog/blog-types.ts — RE-EXPORT SHIM
 *
 * The same story as blog-utils: these types were defined here and in
 * core/config/portfolio.ts at the same time. Two definitions of one type
 * means a field added to one and not the other passes without TypeScript
 * complaining — until the value arrives at runtime incomplete.
 *
 * The single source is core/config/shared.ts now.
 */

export type {
  PdfResource,
  GalleryState,
  ChannelVideo,
} from "@/app/core/config/shared";
