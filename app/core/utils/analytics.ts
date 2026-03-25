"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

const hasGtag = (): boolean => typeof window !== "undefined" && typeof window.gtag === "function";

const normalizeParams = (params?: AnalyticsParams): Record<string, string | number | boolean> => {
  if (!params) return {};

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  ) as Record<string, string | number | boolean>;
};

export const isAnalyticsEnabled = (): boolean => Boolean(GA_ID && hasGtag());

export const trackEvent = (name: string, params?: AnalyticsParams): void => {
  if (!isAnalyticsEnabled()) return;
  window.gtag?.("event", name, normalizeParams(params));
};

export const trackPageView = (path: string): void => {
  if (!isAnalyticsEnabled()) return;
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};

export const trackSeoSnapshot = (path: string): void => {
  if (!isAnalyticsEnabled()) return;

  const canonical = document.querySelector("link[rel='canonical']")?.getAttribute("href") || "";
  const metaDescription = document
    .querySelector("meta[name='description']")
    ?.getAttribute("content")
    ?.slice(0, 155) || "";
  const robots = document.querySelector("meta[name='robots']")?.getAttribute("content") || "";

  trackEvent("seo_snapshot", {
    path,
    canonical,
    has_description: Boolean(metaDescription),
    robots,
  });
};
