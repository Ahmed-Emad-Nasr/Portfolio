"use client";

import { useEffect, useState } from "react";
import styles from "./toast-host.module.css";
import { TOAST_EVENT_NAME, type ToastType } from "@/app/core/utils/toast";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  durationMs: number;
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type?: ToastType; durationMs?: number }>;
      const payload = customEvent.detail;
      if (!payload?.message) return;

      const id = Date.now() + Math.floor(Math.random() * 1000);
      const toast: ToastItem = {
        id,
        message: payload.message,
        type: payload.type || "info",
        durationMs: payload.durationMs || 2800,
      };

      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, toast.durationMs);
    };

    window.addEventListener(TOAST_EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(TOAST_EVENT_NAME, handler as EventListener);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className={styles.toastViewport} role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
