"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import styles from "./custom-cursor.module.css";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const prefersReducedMotion = useReducedMotion();

  const springConfig = prefersReducedMotion
    ? { damping: 40, stiffness: 250, mass: 0.5 }
    : { damping: 30, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateEnabled = () => {
      const shouldEnable = mediaQuery.matches && !prefersReducedMotion;
      setIsEnabled(shouldEnable);
      document.body.dataset.customCursor = shouldEnable ? "true" : "false";
    };

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
      delete document.body.dataset.customCursor;
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isEnabled) return;

    const moveCursor = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    const handleElementHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) {
        setIsHovering(false);
        return;
      }

      setIsHovering(
        target.tagName.toLowerCase() === "a" ||
          target.tagName.toLowerCase() === "button" ||
          Boolean(target.closest("a")) ||
          Boolean(target.closest("button")) ||
          target.classList.contains("interactive")
      );
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleElementHover);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleElementHover);
    };
  }, [cursorX, cursorY, isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <motion.div
        className={styles.cursorRing}
        style={{ x: smoothX, y: smoothY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: isHovering ? 1.45 : 1,
          rotate: isHovering ? 90 : 0,
          borderRadius: isHovering ? "20%" : "50%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      <motion.div
        className={styles.cursorDot}
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
      >
        <div className={styles.cursorGlow} />
      </motion.div>
    </>
  );
}
