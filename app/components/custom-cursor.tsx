"use client";

import { useEffect, useState } from "react";
import { m, useMotionValue, useSpring } from "framer-motion";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";
import styles from "./custom-cursor.module.css";

export default function CustomCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const tier = useDeviceTier();
  
  // تجميع الـ State لتقليل الـ Re-renders
  const [state, setState] = useState({ hover: false, click: false, text: false });

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // إعدادات زنبرك (Spring) ثابتة وخفيفة
  const smoothX = useSpring(cursorX, { damping: 28, stiffness: 380, mass: 0.45 });
  const smoothY = useSpring(cursorY, { damping: 28, stiffness: 380, mass: 0.45 });

  useEffect(() => {
    // التأكد من دعم الجهاز للماوس قبل تفعيل أي شيء
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // A spring-driven cursor redraws two elements every frame the pointer
    // moves. On a weak machine that competes directly with scroll for the
    // main thread — exactly when smoothness matters most.
    if (tier === "low") return;
    
    setIsEnabled(true);
    document.body.dataset.customCursor = "true";

    /*
     * pointermove fires per input sample, not per frame — a 1000 Hz gaming
     * mouse dispatches it ~1000 times a second, and a 120 Hz trackpad ~120.
     * The old handler ran TWO `closest()` DOM walks on every one of those
     * events, on the main thread, competing with scroll.
     *
     * The motion values still update on every event (they feed the spring and
     * are cheap — no React render). The expensive hit-testing is coalesced
     * into one run per animation frame, so it happens at most 60 times a
     * second regardless of the device's polling rate.
     */
    let frame = 0;
    let latestTarget: EventTarget | null = null;

    const evaluateTarget = () => {
      frame = 0;
      const target = latestTarget;
      if (!(target instanceof Element)) return;

      const hover = !!target.closest('a, button, .interactive');
      const text = !!target.closest('input, textarea, [contenteditable="true"]');

      // Only re-render when a boundary is actually crossed.
      setState((prev) =>
        prev.hover !== hover || prev.text !== text ? { ...prev, hover, text } : prev,
      );
    };

    const handleMove = (e: PointerEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      latestTarget = e.target;
      if (!frame) frame = requestAnimationFrame(evaluateTarget);
    };

    const handleDown = () => setState(p => ({ ...p, click: true }));
    const handleUp = () => setState(p => ({ ...p, click: false }));

    // { passive: true } تمنع التقطيع (Jank) أثناء التمرير السريع
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown, { passive: true });
    window.addEventListener("mouseup", handleUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      if (frame) cancelAnimationFrame(frame);
      document.body.removeAttribute("data-custom-cursor");
    };
  }, [cursorX, cursorY, tier]);

  if (!isEnabled) return null;

  const { hover, click, text } = state;

  return (
    <>
      <m.div
        className={styles.cursorRing}
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: text ? 0 : 1, // إخفاء الدائرة عند الكتابة
        }}
        animate={{
          scale: click ? 0.65 : hover ? 1.5 : 1,
          // The infinite 2s rotation ran for as long as the pointer sat on any
          // link — a permanent rAF subscription for an effect nobody watches
          // while reading. A single 0.6s turn reads the same on entry and then
          // stops.
          rotate: hover && !click ? 360 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 22,
          rotate: { duration: 0.6, ease: "easeOut" },
        }}
      >
        <span className={styles.cursorRingInner} />
      </m.div>

      <m.div
        className={styles.cursorDot}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: text ? 0 : 1,
        }}
        animate={{ scale: click ? 0.5 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className={styles.cursorGlow} />
      </m.div>
    </>
  );
}