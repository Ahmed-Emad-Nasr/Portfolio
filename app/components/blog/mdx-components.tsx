/*
 * The components a post's MDX can use (server-rendered at build time).
 *
 * Plain Markdown maps onto these automatically (links, images, code,
 * tables, headings). The extra tags, for use inside a post:
 *
 *   <Callout type="tip|note|warning|danger" title="Optional">text</Callout>
 *   <Figure src="Assets/blog/x.webp" alt="…" caption="…" />
 *   <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
 *   <CaseRef id="soc127-pdf" />   a card linking one of the library's cases
 */

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { AlertTriangle, ArrowRight, Info, Lightbulb, Link2, OctagonAlert } from "lucide-react";
import CodeBlock from "@/app/components/blog/CodeBlock";
import { normalizePublicHref } from "@/app/core/config/shared";
import { caseEvidenceLibrary } from "@/app/core/config/cases";

const CALLOUT = {
  note: { icon: Info, label: "Note", tone: "border-tertiary/60 bg-tertiary/[0.06]", text: "text-tertiary" },
  tip: { icon: Lightbulb, label: "Tip", tone: "border-accent/60 bg-accent/[0.06]", text: "text-accent" },
  warning: { icon: AlertTriangle, label: "Warning", tone: "border-accent/70 bg-accent/[0.08]", text: "text-accent" },
  danger: { icon: OctagonAlert, label: "Danger", tone: "border-primary/70 bg-primary/[0.07]", text: "text-primary-ink" },
} as const;

function Callout({ type = "note", title, children }: { type?: keyof typeof CALLOUT; title?: string; children: ReactNode }) {
  const c = CALLOUT[type] ?? CALLOUT.note;
  return (
    <aside className={`callout not-prose my-8 border-s-2 ${c.tone} px-5 py-4`} role="note">
      <p className={`mb-2 flex items-center gap-2 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.25em] ${c.text}`}>
        <c.icon size={14} aria-hidden="true" />
        {title ?? c.label}
      </p>
      <div className="callout-body text-[0.9375rem] leading-relaxed text-foreground/80">{children}</div>
    </aside>
  );
}

function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="not-prose my-10">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser */}
      <img src={normalizePublicHref(src)} alt={alt} loading="lazy" decoding="async" className="w-full border border-foreground/10" />
      {caption && <figcaption className="mt-3 font-mono text-[0.6875rem] tracking-[0.1em] text-foreground/60">{caption}</figcaption>}
    </figure>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-block border border-foreground/20 border-b-2 bg-foreground/[0.04] px-1.5 py-0.5 font-mono text-[0.8em] leading-none text-foreground">
      {children}
    </kbd>
  );
}

function CaseRef({ id }: { id: string }) {
  const item = caseEvidenceLibrary.find((c) => c.id === id);
  if (!item) throw new Error(`<CaseRef id="${id}" />: no case with that id in core/config/cases.ts`);
  return (
    <Link
      href={`/blog/${item.id}`}
      className="not-prose group my-8 flex items-center gap-4 border border-foreground/10 border-s-2 border-s-primary bg-surface/60 px-5 py-4 transition-colors hover:border-primary/50"
      dir="ltr"
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-primary-ink">
          {item.category} · {item.readTime} min
        </span>
        <span className="font-display text-base font-black uppercase leading-tight text-foreground group-hover:text-primary transition-colors">
          {item.title}
        </span>
      </span>
      <ArrowRight size={16} className="ms-auto shrink-0 text-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary-ink" aria-hidden="true" />
    </Link>
  );
}

/* Headings get a hover anchor so a reader can link straight to a section */
function heading(Tag: "h2" | "h3") {
  return function Heading({ id, children, ...rest }: ComponentProps<"h2">) {
    return (
      <Tag id={id} {...rest} className="group/heading scroll-mt-28">
        {children}
        {id && (
          <a href={`#${id}`} className="heading-anchor ms-2 inline-flex align-middle text-foreground/0 transition-colors group-hover/heading:text-primary-ink focus-visible:text-primary-ink" aria-label="Link to this section">
            <Link2 size={16} aria-hidden="true" />
          </a>
        )}
      </Tag>
    );
  };
}

function Anchor({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (href.startsWith("#")) return <a href={href} {...rest}>{children}</a>;
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  /* Site paths: pages go through next/link (base path, prefetch); files
     under public/ (PDFs, images) get the base path by hand */
  if (/\.[a-z0-9]{2,5}$/i.test(href.split(/[?#]/)[0])) return <a href={normalizePublicHref(href)} {...rest}>{children}</a>;
  return <Link href={href.startsWith("/") ? href : `/${href}`} {...rest}>{children}</Link>;
}

function Img({ src = "", alt = "", ...rest }: ComponentProps<"img">) {
  const url = typeof src === "string" && !/^https?:\/\//.test(src) ? normalizePublicHref(src) : src;
  // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
  return <img src={url} alt={alt} loading="lazy" decoding="async" {...rest} />;
}

/* Wide tables scroll sideways inside their own box on a phone */
function Table(props: ComponentProps<"table">) {
  return (
    <div className="table-wrap my-8 overflow-x-auto" tabIndex={0} role="region" aria-label="Table" data-lenis-prevent="">
      <table {...props} />
    </div>
  );
}

export const postComponents: MDXComponents = {
  a: Anchor,
  img: Img,
  pre: CodeBlock as MDXComponents["pre"],
  table: Table,
  h2: heading("h2"),
  h3: heading("h3"),
  Callout,
  Figure,
  Kbd,
  CaseRef,
};
