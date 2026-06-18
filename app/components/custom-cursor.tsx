"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import styles from "./custom-cursor.module.css";

export default function CustomCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  
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
    
    setIsEnabled(true);
    document.body.dataset.customCursor = "true";

    const handleMove = (e: PointerEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // استخدام target.closest بدلاً من composedPath لأداء صاروخي مبني على الـ Browser Engine
      const target = e.target as HTMLElement;
      const hover = !!target.closest?.('a, button, .interactive');
      const text = !!target.closest?.('input, textarea, [contenteditable="true"]');
      
      // تحديث الـ State فقط إذا تغيرت القيمة فعلياً
      setState(prev => (prev.hover !== hover || prev.text !== text) ? { ...prev, hover, text } : prev);
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
      document.body.removeAttribute("data-custom-cursor");
    };
  }, [cursorX, cursorY]);

  if (!isEnabled) return null;

  const { hover, click, text } = state;

  return (
    <>
      <motion.div
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
          rotate: hover && !click ? 360 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 22,
          rotate: hover ? { duration: 2, repeat: Infinity, ease: "linear" } : {}
        }}
      >
        <span className={styles.cursorRingInner} />
      </motion.div>

      <motion.div
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
      </motion.div>
    </>
  );
}