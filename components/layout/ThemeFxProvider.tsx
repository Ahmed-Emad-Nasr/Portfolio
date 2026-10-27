"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  getDeviceTier,
  getFxDuration,
  prefersReducedMotion,
  THEME_CANVAS_BG,
} from "@/lib/fx";

interface Origin {
  x: number;
  y: number;
}

interface ThemeFx {
  transitionTo: (theme: "light" | "dark", origin?: Origin) => void;
}

const ThemeFxContext = createContext<ThemeFx>({ transitionTo: () => { } });

export const useThemeFx = () => useContext(ThemeFxContext);

const RING = "188, 0, 45"; // --primary
const DROP = "255, 215, 0"; // --accent (dark). Works on both canvases.

interface Droplet {
  angle: number;
  dist: number;
  speed: number;
  size: number;
  alpha: number;
}

/**
 * Water-drop theme transition. Canvas paints an expanding disc in the
 * incoming theme's background + ripple rings + droplets from the tap
 * origin. The theme class flips mid-flight while a short CSS morph
 * eases every token to its new value (gradual, not a hard cut).
 * Reduced-motion => instant. Low-end device => quick fade.
 */
export function ThemeFxProvider({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const transitionTo = useCallback(
    (theme: "light" | "dark", origin?: Origin) => {
      const canvas = canvasRef.current;
      if (!canvas || runningRef.current) {
        setTheme(theme);
        return;
      }
      if (prefersReducedMotion()) {
        setTheme(theme);
        return;
      }

      const tier = getDeviceTier();
      const duration = tier === "lite" ? 280 : getFxDuration();
      const o: Origin = origin ?? {
        x: window.innerWidth - 40,
        y: 40,
      };
      const maxR =
        Math.hypot(
          Math.max(o.x, window.innerWidth - o.x),
          Math.max(o.y, window.innerHeight - o.y)
        ) + 40;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setTheme(theme);
        return;
      }
      ctx.scale(dpr, dpr);

      runningRef.current = true;
      canvas.style.opacity = "1";
      const bg = THEME_CANVAS_BG[theme];
      const droplets: Droplet[] = Array.from({ length: tier === "lite" ? 0 : 26 }, (_, i) => ({
        angle: (i / 26) * Math.PI * 2 + Math.random() * 0.3,
        dist: 0,
        speed: 0.5 + Math.random() * 1.1,
        size: 1.5 + Math.random() * 3,
        alpha: 0.5 + Math.random() * 0.5,
      }));

      let flipped = false;
      const start = performance.now();

      const frame = (now: number) => {
        // rAF timestamps can predate `start` (vsync vs event clock) 
        // clamp so the radius never goes negative (IndexSizeError).
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - Math.pow(1 - t, 3);
        const r = eased * maxR;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Incoming-theme disc.
        ctx.beginPath();
        ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        if (tier === "full") {
          // Ripple rings trailing the edge.
          for (let k = 1; k <= 3; k++) {
            const rr = r - k * 26 * eased;
            if (rr <= 0) continue;
            ctx.beginPath();
            ctx.arc(o.x, o.y, rr, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${RING},${0.5 - k * 0.12})`;
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
          // Droplets pushed outward.
          for (const d of droplets) {
            d.dist += d.speed * (2 + eased * 6);
            const px = o.x + Math.cos(d.angle) * (r * 0.35 + d.dist);
            const py = o.y + Math.sin(d.angle) * (r * 0.35 + d.dist);
            ctx.beginPath();
            ctx.arc(px, py, d.size * (1 - eased * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${t > 0.45 ? RING : DROP},${d.alpha * (1 - t)})`;
            ctx.fill();
          }
        }

        // Flip the theme class mid-flight; CSS morph eases the tokens.
        if (!flipped && t >= 0.42) {
          flipped = true;
          document.documentElement.classList.add("fx-morph");
          setTheme(theme);
        }

        // Fade the disc out at the end to reveal the morphed page.
        if (t > 0.72) {
          canvas.style.opacity = String(1 - (t - 0.72) / 0.28);
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          canvas.style.opacity = "0";
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          window.setTimeout(
            () => document.documentElement.classList.remove("fx-morph"),
            450
          );
          runningRef.current = false;
        }
      };

      rafRef.current = requestAnimationFrame(frame);
    },
    [setTheme]
  );

  return (
    <ThemeFxContext.Provider value={{ transitionTo }}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[200] opacity-0"
      />
    </ThemeFxContext.Provider>
  );
}
