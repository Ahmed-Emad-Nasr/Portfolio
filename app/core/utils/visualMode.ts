export type PortfolioVisualMode = "dashboard" | "magazine";

export const VISUAL_MODE_STORAGE_KEY = "portfolio_blog_visual_mode_v1";
export const VISUAL_MODE_EVENT = "portfolio-visual-mode-change";
export const VISUAL_MODE_ATTRIBUTE = "data-portfolio-mode";

const isMode = (value: string | null): value is PortfolioVisualMode => {
  return value === "dashboard" || value === "magazine";
};

export const getStoredVisualMode = (): PortfolioVisualMode => {
  if (typeof window === "undefined") return "dashboard";

  try {
    const stored = window.localStorage.getItem(VISUAL_MODE_STORAGE_KEY);
    if (isMode(stored)) return stored;
  } catch {
    // Ignore storage read failures.
  }

  return "dashboard";
};

export const applyVisualModeToDocument = (mode: PortfolioVisualMode): void => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(VISUAL_MODE_ATTRIBUTE, mode);
};

export const persistVisualMode = (mode: PortfolioVisualMode): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(VISUAL_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage write failures.
  }

  applyVisualModeToDocument(mode);
  window.dispatchEvent(new CustomEvent<PortfolioVisualMode>(VISUAL_MODE_EVENT, { detail: mode }));
};
