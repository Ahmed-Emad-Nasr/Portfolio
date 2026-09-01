"use client";

/*
 * ShortcutsHelp.tsx
 * Author: Ahmed Emad Nasr
 *
 * The shortcuts sheet that opens with "?" — the same idea GitHub and Gmail
 * use. Lazy like the rest, so it costs nothing until someone asks for it.
 */

import { useEffect, useRef } from "react";
import styles from "./ShortcutsHelp.module.css";

const GROUPS: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: "General",
    items: [
      { keys: ["Ctrl", "K"], label: "Command palette" },
      { keys: ["/"], label: "Command palette (quick)" },
      { keys: ["?"], label: "This help sheet" },
      { keys: ["Esc"], label: "Close any overlay" },
    ],
  },
  {
    title: "Go to",
    items: [
      { keys: ["g", "h"], label: "Home" },
      { keys: ["g", "e"], label: "Experience" },
      { keys: ["g", "p"], label: "Projects" },
      { keys: ["g", "c"], label: "Certifications" },
      { keys: ["g", "b"], label: "Blog / cases" },
      { keys: ["g", "t"], label: "Back to top" },
    ],
  },
  {
    title: "Hidden",
    items: [{ keys: ["type", "3omda"], label: "…try it" }],
  },
];

export default function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      data-fx="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.head}>
          <h2 className={styles.title}>Keyboard shortcuts</h2>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
            ESC
          </button>
        </div>

        <div className={styles.groups}>
          {GROUPS.map((group) => (
            <section key={group.title} className={styles.group}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item.label} className={styles.row}>
                    <span className={styles.keys}>
                      {item.keys.map((key) => (
                        <kbd key={key} className={styles.key}>
                          {key}
                        </kbd>
                      ))}
                    </span>
                    <span className={styles.label}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
