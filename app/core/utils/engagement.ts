"use client";

export type FunnelEventName =
  | "site_visit"
  | "cv_preview"
  | "resume_preview"
  | "cv_download"
  | "resume_download"
  | "service_detail_view"
  | "service_cta_click"
  | "contact_form_started"
  | "contact_form_abandon"
  | "contact_submit_attempt"
  | "contact_submit_success"
  | "section_view_home"
  | "section_view_about"
  | "section_view_trust"
  | "section_view_experience"
  | "section_view_projects"
  | "section_view_case_studies"
  | "section_view_services"
  | "section_view_contact"
  | "section_view_faq"
  | "section_view_certifications";

type NotificationPayload = {
  subject: string;
  lines: string[];
  cooldownKey?: string;
  cooldownMs?: number;
};

const TELEGRAM_WEBHOOK_URL = process.env.NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL || "";
const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "";
const FUNNEL_STORAGE_KEY = "portfolio_funnel_stats_v1";
const COOLDOWN_PREFIX = "portfolio_cooldown_";

const canUseStorage = (): boolean => typeof window !== "undefined" && Boolean(window.localStorage);

export const recordFunnelEvent = (eventName: FunnelEventName): void => {
  if (canUseStorage()) {
    const raw = window.localStorage.getItem(FUNNEL_STORAGE_KEY);
    const stats = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    stats[eventName] = (stats[eventName] || 0) + 1;
    window.localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(stats));
  }
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
    // Keep UX resilient if external notification channels fail.
  }
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

  const mergedMessage = [subject, ...lines].join("\n");
  await sendTelegramNotification(mergedMessage);
};
