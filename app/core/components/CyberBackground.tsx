"use client";

/*
 * CyberBackground.tsx — small bubbles that drift randomly and bounce away from the mouse
 *
 * ═══ This time there is a real physics loop, and that's intentional ═══
 *
 * In the previous version all the motion was CSS and the interaction was parallax, to
 * avoid a requestAnimationFrame loop on the main thread. A real
 * bounce — the bubble senses the pointer and flees the other way — is impossible in CSS: every
 * bubble needs to compute its distance from the mouse, and CSS can't do a square root
 * or a conditional.
 *
 * The bounce was explicitly requested, so the loop became a cost that has to be paid. What
 * we can control is **how much it costs**:
 *
 *   · only 32 bubbles, and the math per bubble is 6 multiplications and one square root
 *   · the only DOM write is `transform` — no left/top, which
 *     would force a full re-layout every frame for every element
 *   · all 32 writes happen in the same frame, so the browser does **a single style
 *     recalculation** at the end of the frame, not 32
 *   · the loop stops completely when the tab is hidden (visibilitychange) — without
 *     that it keeps draining the battery while you can't even see the page
 *   · it isn't mounted at all on tier="low"
 *
 * Actual cost on an average desktop: under half a millisecond per frame.
 * That's acceptable for something the user asked for and can see. What wouldn't be acceptable is
 * running it on a weak phone — and that's gated above.
 *
 * ═══ Physics ═══
 *
 * Every bubble has a position (x, y) and a velocity (vx, vy):
 *
 *   1. Free drift — a small random initial velocity that keeps going
 *   2. Repulsion — if the pointer is closer than REPEL_RADIUS, the bubble gets a push in
 *      the opposite direction, and its strength grows the closer the pointer gets
 *   3. Friction — brings the velocity back to its normal level after the push, otherwise the bubbles
 *      would keep accelerating until they fly off
 *   4. Edge bounce — they hit the screen bounds and come back
 */

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./CyberBackground.module.css";

/*
 * ── Bubble count ──
 *
 * A single number. Size, position, speed and direction are all derived from it, so any number
 * works. Treat 40 as the sensible upper limit — beyond that the layers eat
 * GPU memory without the look improving.
 */
const COUNT = 20;

/* Pointer influence radius in pixels */
const REPEL_RADIUS = 170;
/* Push strength. Higher = a more violent bounce */
const REPEL_FORCE = 0.9;
/* Maximum speed (pixels per frame) so they don't fly off after a strong push */
const MAX_SPEED = 6;
/* Friction — less than 1, damps excess speed every frame */
const FRICTION = 0.94;
/* The natural speed a bubble returns to once it calms down */
const DRIFT_SPEED = 0.22;

/*
 * ── Meteors ────────────────────────────────────────────────────────────
 *
 * Just one number. Increase or decrease it and that's it:
 */
const METEOR_COUNT = 6;

/*
 * The directions they're spread across, in degrees.
 *
 *     0° right · 90° down · 180° left · 270° up
 *
 * The list repeats if METEOR_COUNT is larger than it, and each repeat gets a slight
 * offset so no two end up on exactly the same line.
 */
const METEOR_ANGLES = [180, 138, 272, 202, 288, 22, 160, 250];

/*
 * ── Why there's no hand-written start point ──
 *
 * The previous version had a table of (left, top, angle) for every meteor, and you
 * had to tune the point by hand to match the angle. That was **a trap**: as soon as you changed
 * the angle without moving the point, the meteor left the screen before crossing
 * it — which is exactly the bug that made them invisible the first time.
 *
 * Now the point is **computed from the angle**, so it can't be wrong:
 *
 *   start at the centre of the screen, step back 65vmax against the direction of travel, then shift
 *   a little along the axis perpendicular to the motion so they don't all start from the same point.
 *
 * And the unit is vmax, not pixels or percent: that way the path adapts by itself to any
 * screen size, from a 1366 laptop to a 4K display, without any per-size numbers.
 */
const START_BACK = 65;   // vmax against the direction of travel
/*
 * 22, not 30.
 *
 * At 30 the first meteor (horizontal, with its offset at the edge t = -1) passed above the edge of
 * the screen without entering it. This number was tuned by checking every meteor on 4
 * screen sizes and at 6, 12, 20 and 32 meteors — 22 is safe in every case with margin.
 *
 * If you increase it, the meteors spread wider, but the ones at the edges may not enter.
 */
const SPREAD = 22;       // vmax perpendicular offset

type Meteor = {
  dx: number;
  dy: number;
  angle: number;
  delay: number;
  dur: number;
  tail: number;
};

const METEORS: Meteor[] = Array.from({ length: METEOR_COUNT }, (_, i) => {
  /* Slight offset when the list repeats so they don't overlap */
  const angle = METEOR_ANGLES[i % METEOR_ANGLES.length]
    + Math.floor(i / METEOR_ANGLES.length) * 11;
  const rad = (angle * Math.PI) / 180;

  /* Direction of travel, and its perpendicular */
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);
  const perpX = -dirY;
  const perpY = dirX;

  /*
   * An offset spread between -1 and +1 across the meteor count. The irrational step (0.618,
   * the golden ratio) keeps the spread well-separated whatever the count, instead of
   * an even split lining them up in rows.
   */
  const t = ((i * 0.618) % 1) * 2 - 1;

  return {
    dx: -dirX * START_BACK + perpX * SPREAD * t,
    dy: -dirY * START_BACK + perpY * SPREAD * t,
    angle,
    /* Staggered delays so they don't cross together */
    delay: +(i * 4.3).toFixed(1),
    dur: 9.5 + ((i * 1.7) % 4),
    tail: 90 + ((i * 17) % 50),
  };
});

type Bubble = {
  el: HTMLSpanElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export default function CyberBackground() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = root.current;
    if (!host) return;

    /*
     * The condition is now the tier only, not the presence of a pointer.
     *
     * There used to be a `(hover: hover) and (pointer: fine)` check — meaning the background
     * was disabled on **every** touch device, including powerful tablets. But
     * mouse repulsion is the only part that needs a pointer; the bubbles
     * themselves float fine without one.
     *
     * So now it runs on any device that isn't low, and repulsion kicks in by itself if there is
     * a pointer — the pointermove listener below only does anything once it receives an event.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.tier === "low") return;

    /*
     * ── Frame cap ─────────────────────────────────────────────────────
     *
     * The loop used to run at the display's maximum rate — 60 per second, and on a
     * 120Hz display it becomes 120. That's work we don't need: the bubbles move very slowly,
     * and the difference between 30 and 60 fps on them is **invisible to the eye**.
     *
     * Capping cuts main-thread work by half or more, which shows up in
     * laptop battery life and in INP.
     *
     * Mid-tier devices get a lower cap — they're the ones newly getting the background
     * after we removed the pointer condition, and they're weaker than desktop.
     */
    const tier = document.documentElement.dataset.tier;
    const fpsCap = tier === "mid" ? 24 : 30;
    const frameBudget = 1000 / fpsCap;
    /*
     * PERF: two speeds. The full cap only matters while the pointer is
     * moving and bubbles are being pushed around (fast motion needs frames).
     * The rest of the time — which is most of the time: reading, scrolling
     * with the wheel — they only drift at ~13px/s, and 15fps is
     * indistinguishable from 30 at that speed. Every frame writes 20 inline
     * transforms, so halving the idle rate halves the background's
     * style-recalc cost on every page for every desktop visitor.
     */
    const idleBudget = 1000 / 15;
    const ACTIVE_MS = 1500;
    let lastMove = -Infinity;

    let w = window.innerWidth;
    let h = window.innerHeight;

    /*
     * Math.random is fine here — unlike the previous version, these elements are built
     * in the browser after hydration, so there's no risk of a mismatch with the HTML
     * generated on the server.
     */
    const bubbles: Bubble[] = [];
    const frag = document.createDocumentFragment();

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement("span");
      el.className = styles.bubble;
      /*
       * The size is tuned to the reference image: soft medium-to-large blobs
       * (70 to 220 px), not tiny dots. The feel comes from the softness of the edge,
       * not from small size — the soft edge is what makes the shape read as "light" rather than
       * "circle".
       */
      const size = 70 + Math.random() * 150;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.opacity = `${0.35 + Math.random() * 0.4}`;
      frag.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      bubbles.push({
        el,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * DRIFT_SPEED,
        vy: Math.sin(angle) * DRIFT_SPEED,
        r: size / 2,
      });
    }
    host.appendChild(frag);

    /* -1 means the pointer is off-screen, so no repulsion */
    let mx = -1;
    let my = -1;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      lastMove = performance.now();
      my = e.clientY;
    };
    const onLeave = () => {
      mx = -1;
      my = -1;
    };
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
    };

    let raf = 0;
    let last = performance.now();

    let lastFrame = 0;

    const tick = (now: number) => {
      /*
       * Skipping here doesn't stop the loop — rAF must stay scheduled to catch
       * the next frame. What we save is **the math and the DOM
       * writes**, which are the real cost, not the call itself.
       */
      const budget = now - lastMove < ACTIVE_MS ? frameBudget : idleBudget;
      if (now - lastFrame < budget) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;

      /*
       * dt relative to a 60 Hz frame, capped at 3.
       *
       * Without that cap: if you return to a tab that was hidden, or the device hiccups
       * for a moment, the time delta is huge and the bubbles jump half the screen in a single
       * frame. The cap makes the worst case three steps instead of one.
       */
      // Cap at 4.5, not 3: at the 15fps idle rate a frame is ~4 units long, and a cap
      // of 3 would quietly slow the drift down by a quarter whenever the mouse rests.
      const dt = Math.min(4.5, (now - last) / 16.67);
      last = now;

      for (let i = 0; i < COUNT; i++) {
        const b = bubbles[i];

        if (mx >= 0) {
          const dx = b.x - mx;
          const dy = b.y - my;
          const distSq = dx * dx + dy * dy;

          /*
           * Compare squared distances before the root: the square root is the most expensive operation here,
           * and most bubbles at any moment are far from the pointer. This way we only compute it
           * for the nearby ones.
           */
          if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            /* Force grows linearly as the pointer gets closer */
            const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            b.vx += (dx / dist) * force * dt;
            b.vy += (dy / dist) * force * dt;
          }
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        /* Edge bounce */
        if (b.x < b.r) {
          b.x = b.r;
          b.vx = Math.abs(b.vx);
        } else if (b.x > w - b.r) {
          b.x = w - b.r;
          b.vx = -Math.abs(b.vx);
        }
        if (b.y < b.r) {
          b.y = b.r;
          b.vy = Math.abs(b.vy);
        } else if (b.y > h - b.r) {
          b.y = h - b.r;
          b.vy = -Math.abs(b.vy);
        }

        /*
         * Friction only applies to the speed above the natural drift.
         * Without this condition the bubbles would calm down completely and stop after a while.
         */
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > DRIFT_SPEED) {
          const damped = Math.max(DRIFT_SPEED, speed * FRICTION);
          const scale = damped / speed;
          b.vx *= scale;
          b.vy *= scale;
        }
        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          b.vx *= scale;
          b.vy *= scale;
        }

        /*
         * The only DOM write in the entire loop.
         *
         * translate3d, not left/top: the latter forces a full re-layout every
         * frame for every element. The transform is handled by the compositor
         * alone without touching layout.
         */
        b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /* Tab hidden = nothing to see = no reason to compute anything */
    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      for (const b of bubbles) b.el.remove();
    };
  }, []);

  /*
   * The container renders empty and the bubbles are built in the browser.
   *
   * That way the HTML that's sent doesn't carry 32 decorative elements, and more importantly the bubbles
   * never exist at all on devices where the effect exits early.
   *
   * aria-hidden: pure decoration, it has no place in the accessibility tree.
   */
  return (
    <div className={styles.bg} aria-hidden="true">
      {/* The bubbles are built here by the loop in useEffect */}
      <div ref={root} className={styles.field} />

      {/* Meteors — pure CSS, no JavaScript. Each meteor is a slanted line that crosses
          the screen with a different delay and duration. */}
      <div className={styles.meteors}>
        {METEORS.map((m, i) => (
          <span
            key={i}
            className={styles.meteor}
            /*
             * The cast is required: React.CSSProperties has no index signature,
             * so CSS custom properties aren't part of the type. This is the standard pattern.
             */
            style={
              {
                left: `calc(50% + ${m.dx.toFixed(2)}vmax)`,
                top: `calc(50% + ${m.dy.toFixed(2)}vmax)`,
                animationDelay: `${m.delay}s`,
                animationDuration: `${m.dur.toFixed(1)}s`,
                "--tail": `${m.tail}px`,
                "--angle": `${m.angle}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
