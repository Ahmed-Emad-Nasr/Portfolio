"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, trackPageView, trackSeoSnapshot } from "@/app/core/utils/analytics";
import { recordFunnelEvent, sendNotificationEmail } from "@/app/core/utils/engagement";

const VISITOR_SESSION_KEY = "portfolio_visit_notified_v2";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasNotified = window.sessionStorage.getItem(VISITOR_SESSION_KEY) === "1";
    if (hasNotified) return;

    window.sessionStorage.setItem(VISITOR_SESSION_KEY, "1");
    recordFunnelEvent("site_visit");

    void sendNotificationEmail({
      subject: "Portfolio alert: new site visitor",
      cooldownKey: "site_visit_global",
      cooldownMs: 20_000,
      lines: [
        "A new visitor opened the portfolio.",
        `Time (UTC): ${new Date().toISOString()}`,
        `Page: ${window.location.href}`,
        `Referrer: ${document.referrer || "direct"}`,
        `User Agent: ${navigator.userAgent}`,
      ],
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sectionMap = [
      { id: "Home", event: "section_view_home" as const },
      { id: "About", event: "section_view_about" as const },
      { id: "Trust", event: "section_view_trust" as const },
      { id: "Experience", event: "section_view_experience" as const },
      { id: "Projects", event: "section_view_projects" as const },
      { id: "Services", event: "section_view_services" as const },
      { id: "Contact", event: "section_view_contact" as const },
      { id: "Certifications", event: "section_view_certifications" as const },
    ];

    const observedElements = sectionMap
      .map((item) => ({ ...item, element: document.getElementById(item.id) }))
      .filter((item): item is { id: string; event: (typeof sectionMap)[number]["event"]; element: HTMLElement } => Boolean(item.element));

    if (!observedElements.length) return;

    const seenEvents = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const item = observedElements.find((candidate) => candidate.element === entry.target);
          if (!item || seenEvents.has(item.event)) return;

          seenEvents.add(item.event);
          recordFunnelEvent(item.event);
        });
      },
      { threshold: 0.35 }
    );

    observedElements.forEach((item) => observer.observe(item.element));

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const query = typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
    const path = query ? `${pathname}?${query}` : pathname;

    trackPageView(path);
    trackSeoSnapshot(path);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const thresholds = [25, 50, 75, 100] as const;
    const seen = new Set<number>();

    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollableHeight = doc.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const scrolledPercent = Math.round((window.scrollY / scrollableHeight) * 100);
      thresholds.forEach((threshold) => {
        if (scrolledPercent < threshold || seen.has(threshold)) return;
        seen.add(threshold);
        trackEvent("scroll_depth", { percent: threshold, path: pathname });
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return null;
}
