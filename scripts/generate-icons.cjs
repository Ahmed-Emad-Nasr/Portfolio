/*
 * generate-icons.cjs — writes components/ui/icon-data.ts from the
 * @fortawesome packages (dev only: no FontAwesome code ships to the site).
 *
 *   npm run icons
 */

const fs = require("fs");
const path = require("path");
const brands = require("@fortawesome/free-brands-svg-icons");

/* Only the glyphs components/ui/BrandIcons.tsx draws */
const BRANDS = ["faGithub", "faInstagram", "faLinkedin", "faYoutube"];

const rows = [];
let bytes = 0;

for (const name of BRANDS) {
  const def = brands[name];
  if (!def) throw new Error(`Icon "${name}" not found in the brands pack.`);
  const [w, h, , , d] = def.icon;
  rows.push(`  ${name}: [${w}, ${h}, ${JSON.stringify(d)}],`);
  bytes += String(d).length;
}

const out = `/*
 * components/ui/icon-data.ts — generated, don't edit by hand
 * Run: node scripts/generate-icons.cjs
 */

type IconGlyph = readonly [width: number, height: number, path: string];

export const ICONS = {
${rows.join("\n")}
} as const satisfies Record<string, IconGlyph>;

export type IconName = keyof typeof ICONS;
`;

const target = path.join(__dirname, "..", "components", "ui", "icon-data.ts");
fs.writeFileSync(target, out);
console.log(`Wrote ${rows.length} icons (${(bytes / 1024).toFixed(1)} KB of path data) to ${target}`);
