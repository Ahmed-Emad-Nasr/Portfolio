export const toBulletItems = (text: string): string[] => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const bulletSplit = normalized.split("•").map((item) => item.trim()).filter(Boolean);
  if (bulletSplit.length > 1) return bulletSplit;

  const sentenceSplit = normalized
    .split(/[.;](?=\s|$)/)
    .map((item) => item.trim().replace(/[.;]$/, ""))
    .filter(Boolean);
  if (sentenceSplit.length > 1) return sentenceSplit;

  const commaSplit = normalized.split(",").map((item) => item.trim()).filter(Boolean);
  if (commaSplit.length > 1) return commaSplit;

  return [normalized];
};