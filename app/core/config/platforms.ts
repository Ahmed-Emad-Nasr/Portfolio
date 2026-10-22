/*
 * core/config/platforms.ts
 * Author: Ahmed Emad Nasr
 *
 * The training platforms behind the "Proving Grounds" section: public
 * profiles a recruiter can open and check for themselves.
 *
 * Only numbers that can be verified go here. TryHackMe has a public profile
 * API, so its stats are fetched at build time (core/api/tryhackme.ts) and
 * THM_SNAPSHOT below is only the fallback for a build that can't reach it.
 * Hack The Box and CyberDefenders don't expose stats publicly, so their cards
 * show the profile and what was done there — no invented numbers.
 */

import { caseEvidenceLibrary } from "./cases";

export const TRYHACKME_USERNAME = "Ahmed.Emad.Nasr";

/** Last known TryHackMe stats — used only when the API can't be reached */
export const THM_SNAPSHOT = {
  rank: 10427,
  topPercentage: 1,
  level: 14,
  completedRoomsNumber: 315,
  badgesNumber: 51,
  totalPoints: 35179,
  /** The date these numbers were read */
  asOf: "2026-10-22",
};

export type TryHackMeStats = typeof THM_SNAPSHOT & { live: boolean };

export type PlatformStat = { value: string; label: string };

export type Platform = {
  id: string;
  name: string;
  /** Short monogram for the card's mark box (no brand logos) */
  mark: string;
  japanese: string;
  handle: string;
  url: string;
  /** What this platform was used for — one line */
  focus: string;
  stats: PlatformStat[];
};

/* Write-ups in the case library that came from a platform — real evidence,
   counted from cases.ts so it can never drift. */
const writeUps = (platform: string) => caseEvidenceLibrary.filter((c) => c.platform === platform).length;

const fmt = (n: number) => n.toLocaleString("en-US");

export const tryHackMePlatform = (s: TryHackMeStats): Platform => ({
  id: "tryhackme",
  name: "TryHackMe",
  mark: "THM",
  japanese: "修練",
  handle: TRYHACKME_USERNAME,
  url: `https://tryhackme.com/p/${TRYHACKME_USERNAME}`,
  focus: "Blue-team paths — SOC Level 1 & 2 completed — plus the rooms behind most of the library's write-ups.",
  stats: [
    { value: `Top ${s.topPercentage}%`, label: "Global" },
    { value: `#${fmt(s.rank)}`, label: "Rank" },
    { value: fmt(s.completedRoomsNumber), label: "Rooms" },
    { value: String(s.badgesNumber), label: "Badges" },
    { value: String(writeUps("TryHackMe")), label: "Write-ups here" },
  ],
});

export const STATIC_PLATFORMS: Platform[] = [
  {
    id: "hackthebox",
    name: "Hack The Box",
    mark: "HTB",
    japanese: "攻略",
    handle: "AhmedEmadNasr",
    url: "https://profile.hackthebox.com/profile/01a13b5b-f63f-737f-9adc-91a78153a84f",
    focus: "Offensive labs from the ITI penetration-testing track — enumeration, exploitation and privilege escalation.",
    stats: [],
  },
  {
    id: "cyberdefenders",
    name: "CyberDefenders",
    mark: "CD",
    japanese: "防御",
    handle: "ahmed.em.nasr",
    url: "https://cyberdefenders.org/p/ahmed.em.nasr",
    focus: "Blue-team DFIR labs, investigated the way a real incident would be.",
    stats: [],
  },
  {
    id: "cybertalents",
    name: "CyberTalents",
    mark: "CT",
    japanese: "競技",
    handle: "3omdaa",
    url: "https://cybertalents.com/members/3omdaa",
    focus: "CTF competitions and the Introduction to Cybersecurity bootcamp.",
    stats: [{ value: "44th / 450", label: "ITI × CyberTalents CTF" }],
  },
];
