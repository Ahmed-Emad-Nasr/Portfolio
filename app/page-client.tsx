"use client";

/*
 * page-client.tsx — FIXED
 *
 * THE BIG ONE: every section was `dynamic(..., { ssr: false })`. With
 * `output: "export"` that means the generated HTML contains NO CONTENT —
 * just empty placeholder divs. Consequences:
 *
 *   - LCP is gated on downloading + parsing + executing the whole JS bundle.
 *     On a mid-range phone that is 3+ seconds of blank screen.
 *   - Google indexes an empty page. All the JSON-LD in layout.tsx and page.tsx
 *     describes content the crawler cannot see.
 *   - `ssr: false` throws away the entire point of a static export.
 *
 * FIX: the above-the-fold sections (header + hero) are imported statically so
 * they are prerendered into the HTML. Only genuinely below-the-fold, heavy
 * sections stay dynamic — and now WITH prerendering, so their markup still
 * ships in the HTML and only hydration is deferred.
 *
 * Also removed: the `isAppReady` gate that hid ALL content behind opacity:0
 * until a rAF fired. Combined with the loader that was a double delay, and it
 * made every section invisible to a crawler that does not run rAF.
 */

import { memo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import LoadingScreen from "@/app/components/loader/sensei_loader";

// ─── Above the fold: static imports, prerendered into the HTML ──────────────
// These are what the LCP is measured against. They must be in the markup.
import AppBar from "@/app/components/header/sensei-header";
import HomeSection from "@/app/components/home/sensei-home";

// ─── Below the fold: code-split, but STILL prerendered ──────────────────────
// Note the absence of `ssr: false`. The markup is generated at build time and
// included in the export; only the JS chunk is deferred. That is the actual
// win — you get the bytes savings without blanking the page.
const ExperienceSection = dynamic(
  () => import("@/app/components/experience/experience-section"),
);
const ProjectsSection = dynamic(
  () => import("@/app/components/projects/sensei-projects"),
);
const ArtGallerySection = dynamic(
  () => import("@/app/components/art_gallery/sensei-art"),
);
const KanjiDivider = dynamic(
  () => import("@/app/core/components/KanjiDivider"),
);
// الفورم فيه state وfetch، فمنطقي يتأجّل — بس الـ markup بيتولّد وقت الـ
// build زي الباقي (مفيش ssr: false).
const ContactSection = dynamic(
  () => import("@/app/components/contact/contact-section"),
);

const MAIN_STYLE: React.CSSProperties = { position: "relative" };

/*
 * `coverage` بييجي جاهز من page.tsx (Server Component). السبب في التعليق
 * اللي فوق الـ import هناك: خريطة ATT&CK بتقرا مكتبة الـ cases كاملة،
 * واستيرادها من هنا كان هيحوّلها لـ client component ويحزّم الـ 42 كيلوبايت
 * دي في bundle الصفحة الرئيسية.
 */
type MainClientProps = { coverage: ReactNode };

const MainClient = memo(function MainClient({ coverage }: MainClientProps) {
  return (
    <main id="main-content" style={MAIN_STYLE}>
      <LoadingScreen />
      <AppBar />

      {/* Content is no longer hidden behind an opacity gate — it renders
          immediately and the loader simply sits on top until dismissed. */}
      <HomeSection />
      <KanjiDivider text="武士道 • 継続は力なり • 改善 • 不撓不屈" angle={1.5} />
      <ExperienceSection />
      <KanjiDivider text="設計 • 開発 • 構築 • 実装 • 実験" reverse angle={-1.5} />
      <ProjectsSection />
      <KanjiDivider text="認定 • 成就 • 学問 • 知識 • 技能" angle={2} />
      <ArtGallerySection />
      <KanjiDivider text="戦術 • 検知 • 防御 • 対応 • 回復" angle={1.5} />
      {coverage}
      <KanjiDivider text="芸術 • 創造 • 精神 • 表現 • 魂" reverse angle={-2} />
      <ContactSection />
    </main>
  );
});

export default MainClient;