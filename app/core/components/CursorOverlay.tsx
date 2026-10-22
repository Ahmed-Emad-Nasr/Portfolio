"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Katana cursor  your blade for browsing the dojo.
 * States: gold blade (default) → red lock-on (interactive) → slash flash (click).
 * Desktop fine-pointers only; touch keeps the native cursor.
 */
export default function CursorOverlay() {
  const [isHovering, setIsHovering] = useState(false);
  const [slashes, setSlashes] = useState<number[]>([]);
  const [enabled, setEnabled] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor-on");

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("interactive")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    // Katana slash on every click
    const handleSlash = () => {
      const id = Date.now() + Math.random();
      setSlashes((prev) => [...prev.slice(-2), id]);
      setTimeout(() => {
        setSlashes((prev) => prev.filter((s) => s !== id));
      }, 400);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleElementHover);
    window.addEventListener("mousedown", handleSlash);

    return () => {
      document.body.classList.remove("custom-cursor-on");
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleElementHover);
      window.removeEventListener("mousedown", handleSlash);
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ring  gold at rest, brackets lock on-hover */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 64 : 40,
          height: isHovering ? 64 : 40,
          rotate: isHovering ? 45 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div
          className={`relative w-full h-full transition-all duration-300 flex items-center justify-center
            ${isHovering ? "rounded-none" : "rounded-full border border-accent/60"}`}
        >
          {/* Inner gold orbit */}
          {!isHovering && (
            <div className="absolute inset-1 rounded-full border border-accent/25 border-dashed animate-[spin_10s_linear_infinite_reverse]" />
          )}

          {/* Red lock-on brackets */}
          <motion.div
            className="absolute inset-[-4px] pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHovering ? 1 : 0,
              scale: isHovering ? 1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary shadow-[0_0_10px_rgba(226,0,26,0.5)]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary shadow-[0_0_10px_rgba(226,0,26,0.5)]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary shadow-[0_0_10px_rgba(226,0,26,0.5)]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary shadow-[0_0_10px_rgba(226,0,26,0.5)]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Lock-on label */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: smoothX,
          y: smoothY,
        }}
      >
        <motion.div
          className="ml-8 mt-6 flex flex-col gap-0.5 bg-background/80 backdrop-blur-md px-2 py-1 border-l-2 border-primary"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : -10 }}
          transition={{ duration: 0.2 }}
        >
          <span className="font-mono text-[0.5rem] text-primary-ink tracking-widest font-black uppercase leading-none">
            Target
          </span>
          <span className="brush-jp text-sm text-foreground/80 leading-none mt-0.5" lang="ja" aria-hidden="true">
            斬
          </span>
        </motion.div>
      </motion.div>

      {/* Blade tip  gold at rest, red on lock-on */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div
          className={`transition-all duration-300 transform rotate-45
            ${isHovering
              ? "w-2 h-2 bg-primary shadow-[0_0_15px_rgba(226,0,26,0.9)]"
              : "w-2 h-2 bg-accent shadow-[0_0_15px_rgba(255,215,0,0.8)]"
            }`}
        />
      </motion.div>

      {/* Trailing gold ghost */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div
          className={`transition-all duration-300 transform rotate-45 border border-accent/40
            ${isHovering ? "w-8 h-8 opacity-0 scale-150" : "w-4 h-4 opacity-100 scale-100"}`}
        />
      </motion.div>

      {/* Click slashes */}
      {slashes.map((id) => (
        <motion.div
          key={id}
          className="fixed top-0 left-0 pointer-events-none z-[10001]"
          style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
        >
          <motion.div
            initial={{ scaleX: 0, opacity: 1, rotate: -30 }}
            animate={{ scaleX: 1.8, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="h-[2px] w-14 origin-center bg-gradient-to-r from-transparent via-primary to-accent"
          />
        </motion.div>
      ))}
    </>
  );
}
