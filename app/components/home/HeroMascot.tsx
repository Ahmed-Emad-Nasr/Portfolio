"use client";

import { useEffect, useState, type ReactNode } from "react";
import { m as motion, useAnimationControls } from "framer-motion";
import { prefersReducedMotion } from "@/app/core/theme/fx";

interface Mascot {
  id: string;
  name: string;
  role: string;
  art: ReactNode;
}

/*
 * Original artwork, drawn for this site as inline SVG (no image requests).
 * Same idea as the Sensei-Dev language mascots, but for the blue team:
 * the night-shift owl, the threat-hunting fox, and the shield.
 */
const OWL = (
  <svg viewBox="0 0 100 100" className="h-auto w-full" aria-hidden="true">
    <path d="M22 30 L30 12 L40 26 Z" fill="#3a3a3a" />
    <path d="M78 30 L70 12 L60 26 Z" fill="#3a3a3a" />
    <ellipse cx="50" cy="58" rx="32" ry="36" fill="#2b2b2b" />
    <ellipse cx="50" cy="70" rx="20" ry="22" fill="#4a4a4a" />
    <path d="M36 72 q4 4 8 0 M46 78 q4 4 8 0 M56 72 q4 4 8 0" stroke="#2b2b2b" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="37" cy="44" r="12" fill="#f4f1ea" />
    <circle cx="63" cy="44" r="12" fill="#f4f1ea" />
    <circle cx="38" cy="45" r="6" fill="#FFD700" />
    <circle cx="62" cy="45" r="6" fill="#FFD700" />
    <circle cx="38" cy="45" r="3" fill="#111" />
    <circle cx="62" cy="45" r="3" fill="#111" />
    <path d="M46 52 L54 52 L50 60 Z" fill="#BC002D" />
    <rect x="22" y="86" width="56" height="5" fill="#BC002D" />
  </svg>
);

const FOX = (
  <svg viewBox="0 0 100 100" className="h-auto w-full" aria-hidden="true">
    <path d="M16 16 L40 34 L22 50 Z" fill="#e8742a" />
    <path d="M84 16 L60 34 L78 50 Z" fill="#e8742a" />
    <path d="M21 22 L33 33 L24 41 Z" fill="#2b1a10" />
    <path d="M79 22 L67 33 L76 41 Z" fill="#2b1a10" />
    <path d="M18 40 Q50 18 82 40 L64 82 Q50 92 36 82 Z" fill="#f08a3c" />
    <path d="M24 50 Q38 58 50 86 Q34 84 28 70 Z" fill="#fbf5ec" />
    <path d="M76 50 Q62 58 50 86 Q66 84 72 70 Z" fill="#fbf5ec" />
    <path d="M34 52 q6 -5 12 0" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M54 52 q6 -5 12 0" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="50" cy="80" rx="5" ry="4" fill="#1a1a1a" />
    <path d="M44 24 L50 30 L56 24" stroke="#BC002D" strokeWidth="3" fill="none" />
  </svg>
);

const SHIELD = (
  <svg viewBox="0 0 100 100" className="h-auto w-full" aria-hidden="true">
    <path d="M50 6 L86 18 V48 Q86 78 50 94 Q14 78 14 48 V18 Z" fill="#BC002D" />
    <path d="M50 14 L78 24 V48 Q78 72 50 85 Q22 72 22 48 V24 Z" fill="#8f0022" />
    <path d="M50 14 L78 24 V48 Q78 72 50 85 Z" fill="#a8002a" />
    <circle cx="39" cy="46" r="7" fill="#f4f1ea" />
    <circle cx="61" cy="46" r="7" fill="#f4f1ea" />
    <circle cx="40" cy="47" r="3.5" fill="#111" />
    <circle cx="62" cy="47" r="3.5" fill="#111" />
    <path d="M42 60 q8 7 16 0" stroke="#f4f1ea" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M30 30 L42 26" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="20" r="3" fill="#FFD700" />
  </svg>
);

const MASCOTS: Mascot[] = [
  { id: "owl", name: "Fukurou", role: "Night shift", art: OWL },
  { id: "fox", name: "Kitsune", role: "Threat hunt", art: FOX },
  { id: "shield", name: "Tate", role: "Blue team", art: SHIELD },
];

/**
 * Random mascot companion in the hero (randomized after mount so server
 * and client render the same first paint). Idle float + click cycles to
 * the next mascot with a bounce. Static when reduced-motion is on.
 */
export function HeroMascot({ className }: { className?: string }) {
  // Deterministic first paint (hydration-safe), randomize on mount.
  const [index, setIndex] = useState(0);
  const [reduced] = useState(
    () => typeof window !== "undefined" && prefersReducedMotion()
  );

  useEffect(() => {
    setIndex(Math.floor(Math.random() * MASCOTS.length));
  }, []);

  const bounce = useAnimationControls();
  const mascot = MASCOTS[index % MASCOTS.length] ?? MASCOTS[0]!;

  const play = () => {
    setIndex((i) => (i + 1) % MASCOTS.length);
    if (!reduced) {
      bounce.start({
        y: [0, -20, 0],
        scale: [1, 1.08, 1],
        transition: { duration: 0.5, ease: "easeOut" },
      });
    }
  };

  return (
    <motion.div
      className={className}
      animate={reduced ? {} : { y: [0, -7, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.button
        type="button"
        onClick={play}
        animate={bounce}
        title={`${mascot.name}  ${mascot.role}. Click to meet the next one.`}
        aria-label={`${mascot.name}, ${mascot.role} mascot. Activate to meet the next mascot.`}
        className="group relative block w-20 cursor-pointer lg:w-24"
      >
        <span className="block drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]">{mascot.art}</span>
        <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap border border-foreground/15 bg-background/90 px-2 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          {mascot.name} • {mascot.role}
        </span>
      </motion.button>
    </motion.div>
  );
}
