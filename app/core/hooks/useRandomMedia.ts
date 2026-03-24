"use client";
/*
 * File: useRandomMedia.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Provide media interaction handlers for the UI (external video open)
 */

// ─── Statics ──────────────────────────────────────────────────────────────────

// Hoisted at module level — the URL never changes, so there's no reason to
// recreate it inside the hook on every call.
const VIDEO_URL = "https://youtu.be/9gK7uyTGxz8?si=GiQOXFyaSJjVO2HR&t=230";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useRandomMedia = () => {
  // handleImageClick is a stable module-level reference — no closure over
  // component state, so it never needs to be recreated.
  return { handleImageClick };
};

function handleImageClick(): void {
  // Safely open video link with fallback handling
  try {
    const opened = window.open(VIDEO_URL, "_blank");
    // Check if popup was blocked by browser
    if (!opened || opened.closed || typeof opened.closed === "undefined") {
      console.warn("Popup blocked. Consider allowing popups for this site.");
    }
  } catch (e) {
    console.error("Failed to open video:", e instanceof Error ? e.message : String(e));
  }
}