/*
 * scripts/generate-icons.cjs
 *
 * Generates app/core/icons/icon-data.ts from the @fortawesome packages.
 *
 * Run it when you add a new icon:
 *   node scripts/generate-icons.cjs
 *
 * These packages are devDependencies as far as this script is concerned — the site itself doesn't import them
 * at runtime, so not a single byte of them ends up in the bundle.
 */

const fs = require("fs");
const path = require("path");
const solid = require("@fortawesome/free-solid-svg-icons");
const brands = require("@fortawesome/free-brands-svg-icons");

/*
 * Only what the site draws. app/core/icons/Icon.tsx (the only reader of the
 * solid icons) was deleted as unused, and BrandIcons.tsx needs five brand
 * glyphs — the other 32 entries shipped ~20 KB of SVG paths in the hero's
 * client bundle for nothing. Add a name here and re-run when you need one.
 */
const SOLID = [];

const BRANDS = ["faGithub", "faInstagram", "faLinkedin", "faWhatsapp", "faYoutube"];

const rows = [];
let bytes = 0;

for (const [names, pack, label] of [[SOLID, solid, "solid"], [BRANDS, brands, "brands"]]) {
  for (const name of names) {
    const def = pack[name];
    if (!def) throw new Error(`Icon "${name}" not found in ${label} pack.`);
    const [w, h, , , d] = def.icon;
    rows.push(`  ${name}: [${w}, ${h}, ${JSON.stringify(d)}],`);
    bytes += String(d).length;
  }
}

const out = `/*
 * core/icons/icon-data.ts — generated, don't edit by hand
 * Run: node scripts/generate-icons.cjs
 */

type IconGlyph = readonly [width: number, height: number, path: string];

export const ICONS = {
${rows.join("\n")}
} as const satisfies Record<string, IconGlyph>;

export type IconName = keyof typeof ICONS;
`;

const target = path.join(__dirname, "..", "app", "core", "icons", "icon-data.ts");
fs.writeFileSync(target, out);
console.log(`Wrote ${rows.length} icons (${(bytes / 1024).toFixed(1)} KB of path data) to ${target}`);
