"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from "framer-motion";
import styles from "./custom-cursor.module.css";

export default function CustomCursor() {
  const [isHovering, setIsHovering]   = useState(false);
  const [isClicking, setIsClicking]   = useState(false);
  const [isVisible,  setIsVisible]    = useState(true);
  const [isTextInput, setIsTextInput] = useState(false);
  const [rippleKey,  setRippleKey]    = useState(0);

  const [isEnabled, setIsEnabled] = useState(false);

  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  const prefersReducedMotion = useReducedMotion();

  const springConfig = prefersReducedMotion
    ? { damping: 40, stiffness: 250, mass: 0.5 }
    : { damping: 28, stiffness: 380, mass: 0.45 };

  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  /* ── Enable / disable based on pointer capability ── */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateEnabled = () => {
      const shouldEnable = mediaQuery.matches && !prefersReducedMotion;
      setIsEnabled(shouldEnable);
      if (shouldEnable) {
        document.body.dataset.customCursor = "true";
      } else {
        document.body.removeAttribute("data-custom-cursor");
      }
    };

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
      document.body.removeAttribute("data-custom-cursor");
    };
  }, [prefersReducedMotion]);

  /* ── Pointer move: single listener for position + hover detection ── */
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const path = e.composedPath() as Element[];

      const textInput = path.some(
        (el) =>
          el instanceof HTMLElement &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            (el as HTMLElement).isContentEditable)
      );

      const interactive = path.some(
        (el) =>
          el instanceof HTMLElement &&
          (el.tagName === "A" ||
            el.tagName === "BUTTON" ||
            el.closest?.("a") !== null ||
            el.closest?.("button") !== null ||
            el.classList?.contains("interactive"))
      );

      setIsTextInput(textInput);
      setIsHovering(!textInput && interactive);
    },
    [cursorX, cursorY]
  );

  /* ── Visibility on window enter / leave ── */
  const handleMouseEnter = useCallback(() => setIsVisible(true),  []);
  const handleMouseLeave = useCallback(() => setIsVisible(false), []);

  /* ── Click state + ripple trigger ── */
  const handleMouseDown = useCallback(() => {
    setIsClicking(true);
    setRippleKey((k) => k + 1);
  }, []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);

  /* ── Attach / detach listeners ── */
  useEffect(() => {
    if (!isEnabled) return;

    const root = document.documentElement;
    let attached = false;

    const attach = () => {
      if (attached) return;
      attached = true;
      window.addEventListener("pointermove", handlePointerMove);
      root.addEventListener("mouseenter", handleMouseEnter);
      root.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("mouseenter", handleMouseEnter);
      root.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    // Pause everything when the tab is in the background — saves CPU/battery.
    const handleVisibility = () => {
      if (document.hidden) {
        detach();
        setIsVisible(false);
      } else {
        attach();
        setIsVisible(true);
      }
    };

    attach();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      detach();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isEnabled, handlePointerMove, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp]);

  if (!isEnabled) return null;

  /* ── Derived animation values ── */
  const ringScale   = isClicking ? 0.65 : isHovering ? 1.5 : 1;
  const ringOpacity = isVisible  ? (isTextInput ? 0 : 1) : 0;
  const dotOpacity  = isVisible  ? (isTextInput ? 0 : 1) : 0;

  /* Scanning rotation when hovering — continuous spin */
  const ringRotate = isHovering && !isClicking ? [0, 360] : 0;
  const ringTransition = isHovering && !isClicking
    ? {
        scale:   { type: "spring" as const, stiffness: 280, damping: 22 },
        rotate:  { duration: 2, repeat: Infinity, ease: "linear" },
        opacity: { duration: 0.2 },
      }
    : {
        type: "spring" as const,
        stiffness: 280,
        damping: 22,
      };

  return (
    <>
      {/* ── Targeting brackets ring ── */}
      <motion.div
        aria-hidden="true"
        className={styles.cursorRing}
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: ringOpacity,
        }}
        animate={{
          scale:  ringScale,
          rotate: ringRotate,
        }}
        transition={ringTransition}
      >
        {/* Four-corner effect needs two pseudo-element sources */}
        <span className={styles.cursorRingInner} />
      </motion.div>

      {/* ── Center dot with glow ── */}
      <motion.div
        aria-hidden="true"
        className={styles.cursorDot}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: dotOpacity,
        }}
        animate={{ scale: isClicking ? 0.5 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className={styles.cursorGlow} />
      </motion.div>

      {/* ── Click ripple ── */}
      <AnimatePresence>
        {isClicking && (
          <motion.div
            key={rippleKey}
            aria-hidden="true"
            className={styles.clickRipple}
            style={{
              x: cursorX,
              y: cursorY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}