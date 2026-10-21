/*
 * core/config/build-facts.ts — facts about the deployed files, read once at
 * build time (server only). The layout and the privacy page both use them,
 * so the site never claims something the build does not ship.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

/** public/sw.js is deployed: register it, and say so on the privacy page */
export const HAS_SERVICE_WORKER = existsSync(join(process.cwd(), "public", "sw.js"));
