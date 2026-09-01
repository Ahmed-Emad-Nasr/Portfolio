/*
 * core/config/portfolio.ts — BARREL
 *
 * This file used to be 70KB of data in a single module: experience +
 * projects + YouTube + all 38 cases with every screenshot. Any file
 * importing from it pulled the entire module graph along with it.
 *
 * The data is split across five files now, and this one only re-exports so
 * that existing imports keep working.
 *
 * ⭐ For new code: import from the specific file, not from here.
 *
 *    import { knowledgeEducationItems } from "@/app/core/config/experience";
 *    import { caseEvidenceLibrary }     from "@/app/core/config/cases";
 *
 * A barrel leaves it to tree-shaking to decide what reaches the bundle;
 * importing directly makes it certain rather than up to the bundler.
 */

export * from "./shared";
export * from "./experience";
export * from "./projects";
export * from "./youtube";
export * from "./cases";
