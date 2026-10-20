# Complete Changes Package

> **`ARCHITECTURE.md`** next to this file has a full explanation of the project
> structure: Server/Client boundaries, the tier system, the card system, animation,
> performance, and known pitfalls. Read it if you're going to change anything structural.

Unzip into the **project root**. All files are at their real paths:

```bash
unzip portfolio-complete.zip -d /path/to/Portfolio
```

Then:

```bash
npm run build
```

---

## ⚠️ Read this first

**The project was not built when this package was prepared.** The package that was sent only contained the `app/` folder — there was no
`package.json`, no `next.config` and no `public/`, so it wasn't possible to run
`npm install` or `next build`.

What **was actually verified**:

| Check | Result |
|---|---|
| Every `.ts`/`.tsx` file parses | ✅ 41 files |
| Brackets balanced in every CSS file | ✅ 24 files |
| Every `styles.X` in the JSX exists in its module | ✅ (except 4 pre-existing issues, below) |
| No `MotionInView` left in the render tree | ✅ |
| Every CSS token in `globals.css` is read somewhere | ✅ zero dead |

What **was not verified**: TypeScript types, runtime behaviour, visual appearance.
`esbuild` confirms that a file parses, not that its types are correct.

**Commit before you unzip.**

---

## 4 pre-existing bugs found during the audit (not from these changes)

Classes used in the JSX that don't exist in the CSS — meaning they currently render
`class="undefined"` without any styling:

| File | Class |
|---|---|
| `app/not-found.tsx` | `.suggest` |
| `app/components/experience/experience-section.tsx` | `.desc` |
| `app/blog/[slug]/CaseArticle.tsx` | `.factBlock` |
| `app/core/components/ShortcutsHelp.tsx` | `.group` |

They were left as they are — the intended look isn't known. `node scripts/css-audit.mjs`
catches them.

(A fifth was fixed: `.navDivider` in the blog header — the rule was added.)

---

## What was done

### Performance
- **`data-tier` script in `<head>` before first paint.** It used to be a `useEffect`, so
  the motion budget in `globals.css` only kicked in after hydration —
  the phone paid the full cost exactly in the LCP/TBT window and then
  turned it off. And every phone is now `"low"` (it used to be `"mid"`).
- **`content-visibility: auto` was active on the hero** — Chrome doesn't count
  LCP for content inside a skipped subtree. `#Home` is now excluded.
- **`credentials.tsx` is now a Server Component** — it was `"use client"` with zero
  hooks, and shipped `certifications` + `skills` + `achievements` (~11.7
  KB) to every visitor. Now zero. It's passed as a slot from `page.tsx`.
- **The loader is now CSS + a shared observer** instead of 50 IntersectionObservers.
- **`preload: false` on JetBrains Mono** — it was a fifth high-priority font file
  competing with the LCP image.
- **`cursor-mount` checks for touch before the dynamic import** — the chunk no longer
  loads on phones.

### CSS
- `globals.css`: 24.5K → 28.9K bytes, but 91 → 71 base rules. Removed 47
  dead tokens (42%), 11 unused utility classes and 16 `box-shadow: none`,
  and added the reveal and interaction sections.
- Removed the universal selector `html[data-tier="low"] *` for `backdrop-filter` —
  it forced a style recalculation on every element to cancel 4 declarations that already read
  `var(--card-blur)`.
- **The blog header now uses the main header's file** (they were 98% the same file,
  and the second copy was missing `-webkit-clip-path` — meaning the shape was broken on
  Safari on the blog pages only).
- `.scrollBlurOverlay` had a `transition` on a full-screen `backdrop-filter`.
  It's now `opacity` + `var(--ui-blur)`.
- Removed 8 dead classes.

### Animation and interaction
- `Reveal.tsx` + `RevealGroup` — CSS transitions + a single observer per page.
- **A unified card look.** The site had four different treatments written at
  different times:

  | | Border | Background | Radius |
  |---|---|---|---|
  | `.single-project` | **2px top** line (transparent → red) | `10,10,10,.6` | `--radius-card` |
  | `.pdfCard` and siblings | **3px left** line (faded red) | `10,10,10,.6` | `--radius-card` |
  | `.relatedCard` / `.card` | **2px left** line (solid red) | `255,255,255,.015` | `--radius-card-sm` |
  | `.art_pic` | **no colour accent** | `10,10,10,.6` | `--radius-card` |

  Now there is **not a single card-appearance declaration in any module file**. No borders,
  no background, no radius, no padding, no hover. It all comes from section 14 in
  `globals.css`.

  ```tsx
  <article data-fx="card">                      {/* 2.5rem */}
  <article data-fx="card" data-card="compact">  {/* 1.8rem 2rem */}
  <article data-fx="card" data-card="tight">    {/* 0.6rem — image frame */}
  ```

  What's left in the modules is internal layout only:

  ```css
  /* All appearance comes from html [data-fx="card"] in globals.css */
  .single-project { display: flex; flex-direction: column; }
  ```

  12 cards on the site carry the attribute, and an audit script confirmed there is no
  leftover appearance code.
- Button shine, link underline, tags, press feedback.
- A custom scrollbar (it was 4px of faded red after the border ate 6).
- `Spotlight.tsx` (optional, not mounted anywhere).

### Reliability and accessibility
- `error.tsx` + `global-error.tsx` — they didn't exist. Any exception in any
  of the 28 client components produced a **blank white page**.
- `lang="ja"` on the Japanese text in the hero and the loader.
- `icons` + `manifest.ts` — the site told iOS it was installable
  (`appleWebApp.capable`) without providing an icon.

---

## Two remaining steps

**1. Multi-size hero images**

```bash
npm i -D sharp
node scripts/generate-hero-sizes.mjs
```

**Not applied in the code.** With `output: "export"`, `images.unoptimized` is required,
and then `<Image>` renders an `<img>` without `srcset` — so a 360px phone
downloads the same file as a 4K screen, and it's the LCP image.

It was left out because it needs `next.config` to confirm `images.unoptimized`, which
wasn't available at the time.

**2. `data-fx` on the remaining elements**

`data-fx="card"` was added to 8 real cards. You can still add:

- `data-fx="tag"` on `.skillTag` · `.chip` · `.attackChip` · `.badge`
- `data-fx="link"` on `.proofLink` · `.backLink` · `.subTagLink`
- `data-fx="social"` on the social icons

They were left out because they're an aesthetic choice, not a fix — it's up to you where they fit.

> `.content` in the experience section was unified as well, as requested. It had
> `translateX(5px)` on hover instead of the lift — that motion was removed so
> it behaves exactly like the other cards.

### A note on selector specificity

The shared rule is written as `html [data-fx="card"]`, not `[data-fx="card"]`
alone. The reason is that the latter has a specificity of (0,1,0) — the same as any class in the
module files — so the winner depended on CSS load order, which isn't guaranteed.
Adding `html` makes it (0,1,1), so it always wins.

The conflicting declarations were also removed from the modules, so this is a safety net
for any card added later that someone forgets to clean up.

---

## After building, check these

```bash
grep -o 'data-tier' out/index.html | head    # did the script reach the HTML?
node scripts/css-audit.mjs                   # CSS audit
npm run verify                               # full lint/type/audit/build/link pipeline
```

And in the browser:

1. **Home page** — the loader boots, the bar moves, the lines appear one after another
2. **Reload from cache** — the loader must jump to 100% and disappear immediately
3. **`npm run dev` + the console** — if a hydration warning about `<html>` appears,
   make sure `suppressHydrationWarning` is present
4. **Disable JavaScript** — all content must be visible (the Reveal safety net)
5. **Cut the network after first paint** — everything should be visible within 4 seconds
6. **Mobile** — `<html>` has `data-tier="low"`, no animated decoration
7. **Hover over a card** — it lifts 3px, a side line extends, a shine passes over
8. **Tab onto a card** — the same response (`:focus-within`)

If something breaks: run `git diff` and inspect the changed file.
