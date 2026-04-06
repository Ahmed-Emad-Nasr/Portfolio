"use client";

export type ToastType = "success" | "error" | "info";

type ToastPayload = {
  message: string;
  type?: ToastType;
  durationMs?: number;
};

export const TOAST_EVENT_NAME = "portfolio:toast";

export const showToast = ({ message, type = "info", durationMs = 2800 }: ToastPayload): void => {
  if (typeof window === "undefined") return;

  const event = new CustomEvent(TOAST_EVENT_NAME, {
    detail: { message, type, durationMs },
  });

  window.dispatchEvent(event);
};
