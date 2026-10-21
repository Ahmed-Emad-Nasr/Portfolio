import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge needs to know the site's own font-size names (globals.css
 * @theme): without this it reads `text-md` / `text-2xs` as colours and would
 * drop a real colour class that sits next to them.
 */
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ["2xs", "md"] } },
});

/**
 * Joins class names and resolves Tailwind conflicts (the last one wins):
 *   cn("px-12 text-muted", active && "text-accent") → "px-12 text-accent"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
