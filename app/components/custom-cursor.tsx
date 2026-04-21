"use client";
import { useEffect, useRef } from "react";
import styles from "./custom-cursor.module.css";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    const activate = () => cursor.classList.add(styles["cursor--active"]);
    const deactivate = () => cursor.classList.remove(styles["cursor--active"]);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", activate);
    window.addEventListener("mouseup", deactivate);
    document.querySelectorAll("a, button, input, textarea, select, summary").forEach(el => {
      el.addEventListener("mouseenter", activate);
      el.addEventListener("mouseleave", deactivate);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", activate);
      window.removeEventListener("mouseup", deactivate);
      document.querySelectorAll("a, button, input, textarea, select, summary").forEach(el => {
        el.removeEventListener("mouseenter", activate);
        el.removeEventListener("mouseleave", deactivate);
      });
    };
  }, []);

  return <div ref={cursorRef} className={styles.cursor} />;
}
