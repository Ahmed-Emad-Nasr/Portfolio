// ─── Constants ────────────────────────────────────────────────────────────────

// Milliseconds in an average month (30.44 days). Hoisted so the arithmetic
// is not recomputed on every calculateExperience call.
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const plural = (n: number, word: string): string =>
  `${n} ${word}${n > 1 ? "s" : ""}`;

// ─── Exports ──────────────────────────────────────────────────────────────────

export const calculateExperience = (startDate: string, endDate?: string): string => {
  try {
    const start = new Date(startDate).getTime();
    const end   = endDate ? new Date(endDate).getTime() : Date.now();

    if (isNaN(start) || isNaN(end)) return "Invalid date";

    const totalMonths      = Math.floor((end - start) / MS_PER_MONTH);
    const years            = Math.floor(totalMonths / 12);
    const remainingMonths  = totalMonths % 12;

    if (years > 0 && remainingMonths > 0)
      return `${plural(years, "Year")} ${plural(remainingMonths, "Month")}`;
    if (years > 0)
      return plural(years, "Year");
    if (totalMonths > 0)
      return plural(totalMonths, "Month");

    return "< 1 mo";
  } catch {
    return "Invalid date";
  }
};