"use client";

/*
 * File: useAnimatedBackground.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Manage animated background canvas lifecycle, rendering, and interactions
 */

import { useEffect, useRef, useCallback } from "react";
import { debounce } from "@/app/core/utils/debounceUtils";
import type { RefObject } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Bubble {
  x: number; y: number; radius: number; vx: number; vy: number;
  originalRadius: number; phase: number; pulseSpeed: number;
}

interface MousePosition { x: number; y: number; active: boolean; }

// ─── Constants ────────────────────────────────────────────────────────────────

const MOUSE_INFLUENCE_RADIUS    = 170;
const MOUSE_INFLUENCE_RADIUS_SQ = MOUSE_INFLUENCE_RADIUS * MOUSE_INFLUENCE_RADIUS; 
const MOUSE_INFLUENCE_STRENGTH  = 0.28;
const MAX_RADIUS                = 120;
const MIN_RADIUS                = 60;
const BUBBLE_EXPANSION_FACTOR   = 0.45;
const MAX_SPEED_LIMIT           = 2.4; // تم تقليل السرعة القصوى (كانت 5)
const MAX_SPEED_LIMIT_SQ        = MAX_SPEED_LIMIT * MAX_SPEED_LIMIT;              
const TARGET_FRAME_TIME         = 1000 / 60;
const TARGET_FRAME_TIME_MOBILE  = 1000 / 30;
const MOBILE_MAX_BUBBLES        = 3;
const TWO_PI                    = Math.PI * 2;
const INV_MOUSE_RADIUS          = 1 / MOUSE_INFLUENCE_RADIUS;                     

// ─── Pure render helpers ──────────────────────────────────────────────────────

const drawBubble = (
  ctx: CanvasRenderingContext2D,
  bubble: Pick<Bubble, "x" | "y" | "radius">,
  offscreen: HTMLCanvasElement
): void => {
  const scale    = bubble.radius / MAX_RADIUS;
  const drawSize = offscreen.width * scale;
  ctx.drawImage(
    offscreen,
    (bubble.x - drawSize * 0.5) | 0,
    (bubble.y - drawSize * 0.5) | 0,
    drawSize | 0,
    drawSize | 0
  );
};

const buildBackground = (w: number, h: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (ctx) {
    ctx.fillStyle   = "black";
    ctx.fillRect(0, 0, w, h);
  }
  return canvas;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAnimatedBackground = (
  canvasRef: RefObject<HTMLCanvasElement | null>
): void => {
  const contextRef      = useRef<CanvasRenderingContext2D | null>(null);
  const animFrameRef    = useRef<number | null>(null);
  const bubbleOffscreen = useRef<HTMLCanvasElement | null>(null);
  const bgOffscreen     = useRef<HTMLCanvasElement | null>(null);
  const lastTimeRef     = useRef<number>(0);
  const bubblesRef      = useRef<Bubble[]>([]);
  const mouseRef        = useRef<MousePosition>({ x: 0, y: 0, active: false });
  const isMobileRef     = useRef(false);
  const frameTimeRef    = useRef<number>(TARGET_FRAME_TIME);

  // ── Pre-render bubble sprite once on mount ──────────────────────────────────
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const size   = MAX_RADIUS * 3;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const center   = size / 2;
      ctx.filter     = "blur(30px)";
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, MAX_RADIUS);
      gradient.addColorStop(0, "rgba(111, 234, 178, 0.82)");
      gradient.addColorStop(1, "rgba(111, 234, 178, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center, center, MAX_RADIUS, 0, TWO_PI);
      ctx.fill();
    }
    bubbleOffscreen.current = canvas;
  }, []);

  // ── Canvas + entity setup (also called on resize) ───────────────────────────
  const setupCanvasEnv = useCallback(() => {
    const isMobile = window.innerWidth <= 768;
    isMobileRef.current  = isMobile;
    frameTimeRef.current = isMobile ? TARGET_FRAME_TIME_MOBILE : TARGET_FRAME_TIME;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return; // Safety check: exit if canvas doesn't exist

    mainCanvas.width  = w;
    mainCanvas.height = h;
    const ctx = mainCanvas.getContext("2d", {
      alpha:              false,
      desynchronized:     true,
      willReadFrequently: false,
    });
    
    if (!ctx) {
      // Canvas context failure is a critical error that must be logged
      console.error("CRITICAL: Canvas 2D context initialization failed. Animation rendering disabled.");
      if (process.env.NODE_ENV === "development") {
        console.error("Debug: Ensure browser supports WebGL/Canvas. Check for privacy mode or canvas blocking.");
      }
      return;
    }

    contextRef.current = ctx; // Safe check passed; ctx is guaranteed non-null here

    bgOffscreen.current = buildBackground(w, h);

    if (isMobile) {
      const ctx          = contextRef.current;
      const bubbleSprite = bubbleOffscreen.current;
      if (ctx && bgOffscreen.current) {
        ctx.drawImage(bgOffscreen.current, 0, 0);
        if (bubbleSprite) {
          const radiusRange = MAX_RADIUS - MIN_RADIUS;
          for (let i = 0; i < MOBILE_MAX_BUBBLES; i++) {
            const radius = Math.random() * radiusRange + MIN_RADIUS;
            drawBubble(ctx, { x: Math.random() * w, y: Math.random() * h, radius }, bubbleSprite);
          }
        }
      }

      bubblesRef.current = [];
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const radiusRange = MAX_RADIUS - MIN_RADIUS;
    const bubbleCount = Math.floor((w * h) / 120000);

    bubblesRef.current = Array.from({ length: bubbleCount }, () => {
      const radius = Math.random() * radiusRange + MIN_RADIUS;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        radius,
        originalRadius: radius,
        vx: (Math.random() - 0.5) * 1.1, // Lite mode: calmer cinematic drift
        vy: (Math.random() - 0.5) * 1.1,
        phase: Math.random() * TWO_PI,
        pulseSpeed: 0.004 + Math.random() * 0.006, // Lite mode: slower pulse
      };
    });
  }, [canvasRef]);

  // ── Event listeners ─────────────────────────────────────────────────────────
  useEffect(() => {
    setupCanvasEnv();

    const debouncedSetup = debounce(setupCanvasEnv, 250);
    window.addEventListener("resize", debouncedSetup, { passive: true });

    const handleMouseMove = (e: MouseEvent): void => {
      if (isMobileRef.current) return;
      mouseRef.current.x      = e.clientX;
      mouseRef.current.y      = e.clientY;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = (): void => { mouseRef.current.active = false; };

    window.addEventListener("mousemove",  handleMouseMove,  { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("resize",     debouncedSetup);
      window.removeEventListener("mousemove",  handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      debouncedSetup.cancel();
    };
  }, [setupCanvasEnv]);

  // ── Animation loop ───────────────────────────────────────────────────────────
  const animate = useCallback((timestamp: number): void => {
    if (isMobileRef.current) return;

    const canvas = canvasRef.current;
    const ctx    = contextRef.current;
    if (!canvas || !ctx) return;

    if (document.hidden) {
      animFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const elapsed = timestamp - lastTimeRef.current;

    if (elapsed < frameTimeRef.current) {
      animFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    lastTimeRef.current = timestamp - (elapsed % frameTimeRef.current);
    const dt   = Math.min(elapsed / 16.66, 3);
    const cvsW = canvas.width;
    const cvsH = canvas.height;

    if (bgOffscreen.current) {
      ctx.drawImage(bgOffscreen.current, 0, 0);
    } else {
      ctx.clearRect(0, 0, cvsW, cvsH);
    }

    const mouse        = mouseRef.current;
    const mouseActive  = mouse.active; 
    const mouseX       = mouse.x;
    const mouseY       = mouse.y;
    const bubbles      = bubblesRef.current;
    const bubbleSprite = bubbleOffscreen.current;
    const len          = bubbles.length;

    for (let i = 0; i < len; i++) {
      const b = bubbles[i];

      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x + b.radius > cvsW || b.x - b.radius < 0) b.vx *= -1;
      if (b.y + b.radius > cvsH || b.y - b.radius < 0) b.vy *= -1;

      b.phase += b.pulseSpeed * dt;
      const pulsingRadius = b.originalRadius + Math.sin(b.phase) * (b.originalRadius * 0.12);
      let newRadius = pulsingRadius;

      if (mouseActive) {
        const dx     = mouseX - b.x;
        const dy     = mouseY - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_INFLUENCE_RADIUS_SQ) {
          const dist      = Math.sqrt(distSq);           
          const influence = 1 - dist * INV_MOUSE_RADIUS; 
          newRadius = pulsingRadius * (1 + influence * BUBBLE_EXPANSION_FACTOR);
          const invDist = 1 / dist;                      
          b.vx -= dx * invDist * MOUSE_INFLUENCE_STRENGTH * influence;
          b.vy -= dy * invDist * MOUSE_INFLUENCE_STRENGTH * influence;
        }
      }

      // تم تقليل عشوائية الانحراف عشان الحركة تكون أنعم (كانت 1.2)
      b.vx += (Math.random() - 0.5) * 0.18 * dt;
      b.vy += (Math.random() - 0.5) * 0.18 * dt;
      
      const speedSq = b.vx * b.vx + b.vy * b.vy;
      if (speedSq > MAX_SPEED_LIMIT_SQ) {
        const inv = MAX_SPEED_LIMIT / Math.sqrt(speedSq); 
        b.vx *= inv;
        b.vy *= inv;
      }

      b.radius = newRadius < 10 ? 10 : newRadius; 
      if (bubbleSprite) drawBubble(ctx, b, bubbleSprite);
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [canvasRef]);

  // ── Boot animation loop ──────────────────────────────────────────────────────
  useEffect(() => {
    lastTimeRef.current  = performance.now();
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animate]);

  // ── Pause when tab hidden, resume when visible ───────────────────────────────
  useEffect(() => {
    const handleVisibility = (): void => {
      if (document.hidden) {
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
      } else if (!isMobileRef.current) {
        // Reset lastTimeRef when resuming to prevent huge delta
        lastTimeRef.current = performance.now();
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [animate]);
};