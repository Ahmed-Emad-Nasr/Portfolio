/*
 * blog/blog-utils.ts — RE-EXPORT SHIM
 *
 * This file used to be a second, complete copy of normalizePublicHref,
 * getThumbnail and formatDate — verbatim, including a second
 * `dateFormatter` and `dateCache`.
 *
 * So there were two separate caches for the same dates in memory, and any
 * change to the path logic had to be made in two places or the two pages
 * would quietly diverge in behaviour.
 *
 * There is one source now: core/config/shared.ts. This file remains so the
 * existing imports (CaseArticle, page-client, Terminal, CommandPalette)
 * keep working unchanged.
 */

export {
  normalizePublicHref,
  getThumbnail,
  formatDate,
} from "@/app/core/config/shared";
