/*
 * scripts/lib/serve-out.mjs — serves the static export (out/) the way
 * GitHub Pages does: under the base path, "/x" → x.html, 404.html for
 * anything missing. Used by the live checks (a11y-audit, layout-audit),
 * which need the built site in a real browser.
 */

import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Portfolio";

/** Starts the server on a free port; resolves { url, close } */
export function serveOut(root = join(process.cwd(), "out")) {
  if (!existsSync(join(root, "index.html"))) {
    console.error("No build in out/ — run `npm run build` first.");
    process.exit(1);
  }
  const server = createServer((req, res) => {
    let path = decodeURIComponent((req.url || "/").split("?")[0]);
    if (BASE_PATH && !path.startsWith(BASE_PATH)) {
      res.writeHead(404);
      return res.end();
    }
    path = path.slice(BASE_PATH.length) || "/";
    const file = join(root, path);
    const hit = [file, `${file}.html`, join(file, "index.html")].find((f) => existsSync(f) && statSync(f).isFile());
    if (!hit) {
      res.writeHead(404, { "content-type": TYPES[".html"] });
      return res.end(readFileSync(join(root, "404.html")));
    }
    res.writeHead(200, { "content-type": TYPES[extname(hit)] || "application/octet-stream" });
    createReadStream(hit).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ url: `http://127.0.0.1:${port}${BASE_PATH}`, close: () => server.close() });
    });
  });
}

/** One page of each kind the site has, from the build itself */
export function samplePages(root = join(process.cwd(), "out")) {
  const pages = ["/", "/blog", "/cv", "/privacy", "/terms", "/collections/web-security-academy", "/this-page-does-not-exist"];
  const blogDir = join(root, "blog");
  const html = (name) => existsSync(join(blogDir, `${name}.html`));
  /* A case with a full case file, one without, and a post if any is published */
  for (const id of ["soc336-report", "3omda-custom-detection-rules", "owasp-juice-shop"]) if (html(id)) pages.push(`/blog/${id}`);
  try {
    const index = JSON.parse(readFileSync(join(root, "palette-index.json"), "utf8"));
    const post = index.find((e) => e.category === "Post");
    if (post) pages.push(`/blog/${post.id}`);
  } catch {
    /* no index: skip posts */
  }
  const tagDir = join(blogDir, "tag");
  if (existsSync(tagDir)) {
    const tag = readdirSync(tagDir).find((f) => f.endsWith(".html") && f !== "_.html");
    if (tag) pages.push(`/blog/tag/${tag.replace(/\.html$/, "")}`);
  }
  return pages;
}
