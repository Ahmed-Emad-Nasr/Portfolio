/*
 * Shared classes for the two "you've hit a wall" pages: not-found.tsx (404)
 * and error.tsx (a client component threw), in the Sensei-Dev design.
 */
export const statusPage = "relative min-h-screen flex items-center px-6 md:px-20 pt-36 pb-24 overflow-hidden";
export const statusInner = "relative z-10 w-full max-w-4xl mx-auto";
export const statusCode =
  "font-display text-[clamp(6rem,18vw,12rem)] font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:2px_#BC002D]";
export const statusTitle =
  "mt-4 font-display text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-foreground";
export const statusLede = "mt-5 mb-10 max-w-2xl text-lg text-foreground/60 font-light leading-relaxed";
export const statusActions = "flex flex-wrap gap-4 mb-14";
export const statusReport =
  "mt-14 font-mono text-[10px] uppercase tracking-[0.25em] leading-relaxed text-foreground/40 [&_a]:text-primary [&_a:hover]:underline [&_a]:underline-offset-4";
