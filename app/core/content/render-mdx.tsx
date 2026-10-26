/*
 * core/content/render-mdx.ts — turns a post's MDX into React at build time
 * (SERVER-ONLY). Nothing here reaches the browser: the static export ships
 * the finished HTML, including the highlighted code.
 *
 *   remark-gfm    tables, task lists, footnotes, autolinks, ~~strike~~
 *   rehype-slug   ids on headings (the table of contents links to them —
 *                 core/content/posts.ts computes the same ids)
 *   Shiki         code highlighting with two themes; the CSS picks light or
 *                 dark from the site theme (globals.css, .shiki)
 *
 * Shiki runs on its JavaScript regex engine (no WebAssembly to bundle).
 */

import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { MDXComponents } from "mdx/types";

/* The languages a security blog actually uses. Anything else falls back to
   plain text instead of failing the build. Add one here when you need it. */
const LANGS = [
  import("shiki/langs/bash.mjs"),
  import("shiki/langs/powershell.mjs"),
  import("shiki/langs/bat.mjs"),
  import("shiki/langs/python.mjs"),
  import("shiki/langs/javascript.mjs"),
  import("shiki/langs/typescript.mjs"),
  import("shiki/langs/json.mjs"),
  import("shiki/langs/yaml.mjs"),
  import("shiki/langs/xml.mjs"),
  import("shiki/langs/html.mjs"),
  import("shiki/langs/sql.mjs"),
  import("shiki/langs/ini.mjs"),
  import("shiki/langs/toml.mjs"),
  import("shiki/langs/diff.mjs"),
  import("shiki/langs/http.mjs"),
  import("shiki/langs/markdown.mjs"),
  import("shiki/langs/c.mjs"),
  import("shiki/langs/go.mjs"),
  import("shiki/langs/dockerfile.mjs"),
  import("shiki/langs/nginx.mjs"),
  import("shiki/langs/log.mjs"),
  import("shiki/langs/csv.mjs"),
  import("shiki/langs/kql.mjs"),
  import("shiki/langs/splunk.mjs"),
  import("shiki/langs/regex.mjs"),
  import("shiki/langs/asm.mjs"),
];

const CODE_THEMES = { light: "github-light", dark: "github-dark-dimmed" } as const;

let highlighter: Promise<HighlighterCore> | null = null;
const getHighlighter = () =>
  (highlighter ??= createHighlighterCore({
    themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark-dimmed.mjs")],
    langs: LANGS,
    engine: createJavaScriptRegexEngine(),
  }));

/* Aliases people type in fences */
const ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  ps: "powershell",
  ps1: "powershell",
  cmd: "bat",
  py: "python",
  js: "javascript",
  ts: "typescript",
  yml: "yaml",
  spl: "splunk",
  sigma: "yaml",
  /* No YARA grammar in Shiki; C highlights its strings, hex and braces well */
  yara: "c",
  yar: "c",
  conf: "ini",
};

export async function renderMdx(source: string, components: MDXComponents) {
  const hl = await getHighlighter();
  const known = new Set(hl.getLoadedLanguages());
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeShikiFromHighlighter,
        hl,
        {
          themes: CODE_THEMES,
          defaultColor: false,
          langAlias: ALIASES,
          fallbackLanguage: "text",
          defaultLanguage: "text",
          transformers: [
            {
              /* data-language on <pre>: the code block shows it as its label */
              pre(node: { properties: Record<string, unknown> }) {
                const lang = (this as unknown as { options: { lang: string } }).options.lang;
                node.properties["data-language"] = known.has(lang) || ALIASES[lang] ? lang : "text";
              },
            },
          ],
        },
      ],
    ],
  });
  return <Content components={components} />;
}
