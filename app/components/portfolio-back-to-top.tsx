"use client";

import { memo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "@/app/blog/page.module.css";

type PortfolioBackToTopProps = {
  hideOnBlog?: boolean;
};

const PortfolioBackToTop = memo(function PortfolioBackToTop({
  hideOnBlog = false,
}: PortfolioBackToTopProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isBlogRoute = pathname === "/blog" || pathname.startsWith("/blog/");

  useEffect(() => {
    if (hideOnBlog && isBlogRoute) return;

    let rafId = 0;
    let timeoutId: number | undefined;
    let lastRun = 0;

    const updateVisibility = () => {
      setVisible(window.scrollY > 400);
      lastRun = window.performance.now();
      rafId = 0;
      timeoutId = undefined;
    };

    const onScroll = () => {
      const now = window.performance.now();
      const elapsed = now - lastRun;

      if (rafId || timeoutId !== undefined) return;

      if (elapsed >= 180) {
        rafId = window.requestAnimationFrame(updateVisibility);
        return;
      }

      timeoutId = window.setTimeout(() => {
        rafId = window.requestAnimationFrame(updateVisibility);
      }, 180 - elapsed);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [hideOnBlog, isBlogRoute]);

  if ((hideOnBlog && isBlogRoute) || !visible) return null;

  return (
    <button
      type="button"
      className={styles.backToTop}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
});

export default PortfolioBackToTop;
