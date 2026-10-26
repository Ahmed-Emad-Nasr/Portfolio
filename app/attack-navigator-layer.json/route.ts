/*
 * /attack-navigator-layer.json — the case library as a MITRE ATT&CK
 * Navigator layer. Load it at https://mitre-attack.github.io/attack-navigator/
 * ("Open Existing Layer" → upload, or the #layerURL= link on the home page)
 * to see the same coverage in the tool every SOC team already uses.
 *
 * Built at export time from core/config/attack.ts: one entry per technique or
 * sub-technique, scored by the number of cases behind it, with the case titles
 * in the comment.
 */

import { caseAttackMapping } from "@/app/core/config/attack";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import { SITE_URL } from "@/app/core/config/seo";

export const dynamic = "force-static";

const TITLE = new Map(caseEvidenceLibrary.map((c) => [c.id, c.title]));

export function GET() {
  const byTechnique = new Map<string, string[]>();
  for (const [caseId, ids] of Object.entries(caseAttackMapping)) {
    if (!TITLE.has(caseId)) continue;
    for (const id of ids) {
      const list = byTechnique.get(id) ?? [];
      list.push(TITLE.get(caseId)!);
      byTechnique.set(id, list);
    }
  }
  const max = Math.max(1, ...[...byTechnique.values()].map((v) => v.length));

  const layer = {
    name: "Ahmed Emad Nasr — case library coverage",
    versions: { attack: "19", navigator: "5.1.0", layer: "4.5" },
    domain: "enterprise-attack",
    description: `Techniques evidenced by the case library at ${SITE_URL} — score = number of cases.`,
    sorting: 3,
    layout: { layout: "side", showID: true, showName: true, hideDisabled: false },
    hideDisabled: false,
    techniques: [...byTechnique.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([techniqueID, titles]) => ({
        techniqueID,
        score: titles.length,
        color: "",
        comment: titles.join(" · "),
        enabled: true,
        showSubtechniques: techniqueID.includes("."),
      })),
    gradient: { colors: ["#ffe5e9ff", "#c8102eff"], minValue: 0, maxValue: max },
    legendItems: [{ label: "Evidenced by a case report", color: "#c8102e" }],
    showTacticRowBackground: true,
    tacticRowBackground: "#1a1a1a",
    selectTechniquesAcrossTactics: true,
    selectSubtechniquesWithParent: false,
  };

  return new Response(JSON.stringify(layer, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
