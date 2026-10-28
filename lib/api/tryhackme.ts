/* TryHackMe's public profile, read once at build time; without network (or
   an unexpected answer) the snapshot in data/platforms.ts is used. */

import { THM_SNAPSHOT, TRYHACKME_USERNAME, type TryHackMeStats } from "@/data/platforms";

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

export async function getTryHackMeStats(): Promise<TryHackMeStats> {
  try {
    const response = await fetch(
      `https://tryhackme.com/api/v2/public-profile?username=${encodeURIComponent(TRYHACKME_USERNAME)}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) throw new Error(`TryHackMe API error: ${response.status}`);

    const data = await response.json();
    /* The API is undocumented: accept the answer only if every field we
       show is a real number, otherwise keep the snapshot. */
    const fields = ["rank", "topPercentage", "level", "completedRoomsNumber", "badgesNumber", "totalPoints"] as const;
    if (!data || data.isPrivateProfile || !fields.every((f) => isCount(data[f]))) {
      throw new Error("TryHackMe API returned an unexpected shape");
    }

    return {
      rank: data.rank,
      topPercentage: data.topPercentage,
      level: data.level,
      completedRoomsNumber: data.completedRoomsNumber,
      badgesNumber: data.badgesNumber,
      totalPoints: data.totalPoints,
      asOf: new Date().toISOString().slice(0, 10),
      live: true,
    };
  } catch (error) {
    if (!(error instanceof Error && error.message === "TryHackMe API error: 429")) {
      console.warn("TryHackMe stats unavailable, using the snapshot:", error instanceof Error ? error.message : error);
    }
    return { ...THM_SNAPSHOT, live: false };
  }
}
