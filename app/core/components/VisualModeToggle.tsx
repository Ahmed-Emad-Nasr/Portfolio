"use client";

import { useEffect, useState } from "react";
import styles from "./visual-mode-toggle.module.css";
import {
  type PortfolioVisualMode,
  VISUAL_MODE_EVENT,
  applyVisualModeToDocument,
  getStoredVisualMode,
  persistVisualMode,
} from "@/app/core/utils/visualMode";

export default function VisualModeToggle() {
  const [mode, setMode] = useState<PortfolioVisualMode>("dashboard");

  useEffect(() => {
    const initialMode = getStoredVisualMode();
    setMode(initialMode);
    applyVisualModeToDocument(initialMode);

    const onModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<PortfolioVisualMode>;
      if (customEvent.detail === "dashboard" || customEvent.detail === "magazine") {
        setMode(customEvent.detail);
      }
    };

    window.addEventListener(VISUAL_MODE_EVENT, onModeChange as EventListener);
    return () => {
      window.removeEventListener(VISUAL_MODE_EVENT, onModeChange as EventListener);
    };
  }, []);

  const updateMode = (nextMode: PortfolioVisualMode) => {
    setMode(nextMode);
    persistVisualMode(nextMode);
  };

  return (
    <div className={styles.toggle} role="group" aria-label="Portfolio visual mode">
      <button
        type="button"
        className={mode === "dashboard" ? `${styles.toggleButton} ${styles.active}` : styles.toggleButton}
        onClick={() => updateMode("dashboard")}
        aria-pressed={mode === "dashboard"}
      >
        Dashboard
      </button>
      <button
        type="button"
        className={mode === "magazine" ? `${styles.toggleButton} ${styles.active}` : styles.toggleButton}
        onClick={() => updateMode("magazine")}
        aria-pressed={mode === "magazine"}
      >
        Magazine
      </button>
    </div>
  );
}
