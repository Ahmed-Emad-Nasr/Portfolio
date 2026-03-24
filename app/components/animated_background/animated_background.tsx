"use client";

/*
 * File: animated_background.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render the background canvas and connect it to animation hook logic
 */

import { useRef, memo } from "react";
import styles from "./animated_background.module.css";
import { useAnimatedBackground } from "@/app/core/hooks/useAnimatedBackground";
const AnimatedBackground = memo(function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Custom hook manages the requestAnimationFrame loop internally.
  useAnimatedBackground(canvasRef);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
});

export default AnimatedBackground;