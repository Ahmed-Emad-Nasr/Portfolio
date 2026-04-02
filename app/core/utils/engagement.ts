"use client";

import { trackEvent } from "@/app/core/utils/analytics";

export type FunnelEventName =
  | "site_visit"
  | "cv_preview"
  | "resume_preview"
  | "cv_download"
  | "resume_download"
  | "service_detail_view"
  | "service_cta_click"
  | "contact_form_started"
  | "contact_submit_attempt"
  | "contact_submit_success"
  | "section_view_home"
  | "section_view_about"
  | "section_view_trust"
  | "section_view_experience"
  | "section_view_projects"
  | "section_view_services"
  | "section_view_contact"
  | "section_view_certifications";

type FunnelStats = Record<FunnelEventName, number>;

export type RemoteEventItem = {
  timestamp: string;
  event: string;
  details?: string;
};

export type RemoteInsights = {
  stats?: Partial<FunnelStats>;
  recentEvents?: RemoteEventItem[];
};

export type RemoteInsightsResult = {
  ok: boolean;
  reason: "not-configured" | "network-error" | "bad-response" | null;
  data: RemoteInsights | null;
};

type NotificationPayload = {
  subject: string;
  lines: string[];
  cooldownKey?: string;
  cooldownMs?: number;
};

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/mlgpbpdr";
const TELEGRAM_WEBHOOK_URL = process.env.NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL || "";
const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "";
const LOG_INGEST_URL = process.env.NEXT_PUBLIC_LOG_INGEST_URL || "";
const REMOTE_INSIGHTS_URL = process.env.NEXT_PUBLIC_REMOTE_INSIGHTS_URL || "";
const FALLBACK_WEBHOOK_URL = process.env.NEXT_PUBLIC_NOTIFICATION_FALLBACK_WEBHOOK || "";
const FUNNEL_STORAGE_KEY = "portfolio_funnel_stats_v1";
const COOLDOWN_PREFIX = "portfolio_cooldown_";

const defaultStats: FunnelStats = {
  site_visit: 0,
  cv_preview: 0,
  resume_preview: 0,
  cv_download: 0,
  resume_download: 0,
  service_detail_view: 0,
  service_cta_click: 0,
  contact_form_started: 0,
  contact_submit_attempt: 0,
  contact_submit_success: 0,
  section_view_home: 0,
  section_view_about: 0,
  section_view_trust: 0,
  section_view_experience: 0,
  section_view_projects: 0,
  section_view_services: 0,
  section_view_contact: 0,
  section_view_certifications: 0,
};

const canUseStorage = (): boolean => typeof window !== "undefined" && Boolean(window.localStorage);

const postRemoteLog = async (eventType: string, payload: Record<string, unknown>): Promise<void> => {
  if (!LOG_INGEST_URL) return;

  try {
    await fetch(LOG_INGEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        timestamp: new Date().toISOString(),
        payload,
      }),
      keepalive: true,
    });
  } catch {
    // Logging failures should remain silent.
  }
};

const sendTelegramNotification = async (message: string): Promise<void> => {
  try {
    if (TELEGRAM_WEBHOOK_URL) {
      await fetch(TELEGRAM_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
        keepalive: true,
      });
      return;
    }

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          disable_web_page_preview: true,
        }),
        keepalive: true,
      });
    }
  } catch {
    // Telegram failures should not affect UX.
  }
};

export const getFunnelStats = (): FunnelStats => {
  if (!canUseStorage()) return { ...defaultStats };

  try {
    const raw = window.localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return { ...defaultStats };

    const parsed = JSON.parse(raw) as Partial<FunnelStats>;
    return { ...defaultStats, ...parsed };
  } catch {
    return { ...defaultStats };
  }
};

export const recordFunnelEvent = (eventName: FunnelEventName): void => {
  if (canUseStorage()) {
    const stats = getFunnelStats();
    stats[eventName] = (stats[eventName] || 0) + 1;
    window.localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(stats));
  }

  trackEvent("funnel_event", { event_name: eventName });
  void postRemoteLog("funnel_event", {
    eventName,
    path: typeof window !== "undefined" ? window.location.href : "unknown",
  });
};

export const isActionAllowed = (key: string, cooldownMs: number): boolean => {
  if (!canUseStorage()) return true;

  const storageKey = `${COOLDOWN_PREFIX}${key}`;
  const now = Date.now();
  const lastTimestamp = Number(window.localStorage.getItem(storageKey) || "0");

  if (lastTimestamp && now - lastTimestamp < cooldownMs) {
    return false;
  }

  window.localStorage.setItem(storageKey, String(now));
  return true;
};

export const sendNotificationEmail = async ({
  subject,
  lines,
  cooldownKey,
  cooldownMs = 0,
}: NotificationPayload): Promise<void> => {
  if (cooldownKey && cooldownMs > 0 && !isActionAllowed(cooldownKey, cooldownMs)) {
    return;
  }

  const payload = new FormData();
  payload.append("name", "Portfolio Notification");
  payload.append("email", "ahmed.em.nasr@gmail.com");
  payload.append("subject", subject);
  payload.append("message", lines.join("\n"));

  let primaryChannelOk = false;

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" },
      keepalive: true,
    });

    primaryChannelOk = response.ok;
  } catch {
    primaryChannelOk = false;
  }

  if (!primaryChannelOk && FALLBACK_WEBHOOK_URL) {
    try {
      await fetch(FALLBACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          lines,
          timestamp: new Date().toISOString(),
          source: "portfolio",
        }),
        keepalive: true,
      });
    } catch {
      // Ignore fallback failures.
    }
  }

  const mergedMessage = [subject, ...lines].join("\n");
  void sendTelegramNotification(mergedMessage);
  void postRemoteLog("notification", { subject, lines });
};

export const fetchRemoteInsights = async (): Promise<RemoteInsights | null> => {
  const result = await fetchRemoteInsightsWithStatus();
  return result.ok ? result.data : null;
};

export const fetchRemoteInsightsWithStatus = async (): Promise<RemoteInsightsResult> => {
  if (!REMOTE_INSIGHTS_URL) {
    return { ok: false, reason: "not-configured", data: null };
  }

  try {
    const response = await fetch(REMOTE_INSIGHTS_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, reason: "bad-response", data: null };
    }

    const data = (await response.json()) as RemoteInsights;
    return { ok: true, reason: null, data };
  } catch {
    return { ok: false, reason: "network-error", data: null };
  }
};
