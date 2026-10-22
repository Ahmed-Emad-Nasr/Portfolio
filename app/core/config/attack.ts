/*
 * core/config/attack.ts
 * Author: Ahmed Emad Nasr
 *
 * Maps the case library onto MITRE ATT&CK.
 *
 * Why is this the most important addition to the whole site? Because 38 reports in a list = an archive, while the same
 * 38 laid out on ATT&CK = **a coverage map**. The difference is that the first says
 * "I've done a lot of things" and the second says "I cover these specific tactics and I have
 * the evidence" — which is exactly the shape of the question in any SOC interview.
 *
 * ⚠️⚠️ Review this file before publishing ⚠️⚠️
 *
 * The mapping below is inferred from the case titles and tags, not from reading the reports
 * themselves — the PDFs weren't reviewed. So it's a sound starting point for the most part, but there are surely
 * techniques covered that aren't listed here, and there may be one or two that aren't
 * accurate. Read every line and correct it against the original report.
 *
 * A wrong coverage map is worse than no map at all: anyone who reads it will open the
 * report and compare.
 */

/**
 * Tactics in Enterprise ATT&CK order — the column order of the matrix.
 *
 * ATT&CK v19 (April 2026): 15 tactics. Defense Evasion was split into
 * Stealth (keeps TA0005) and Defense Impairment (TA0112). `short` is the
 * label used where a full name does not fit (the kill-chain strip).
 */
export const ATTACK_TACTICS = [
  { id: "reconnaissance", ta: "TA0043", name: "Reconnaissance", short: "Recon" },
  { id: "resource-development", ta: "TA0042", name: "Resource Development", short: "Resource Dev" },
  { id: "initial-access", ta: "TA0001", name: "Initial Access", short: "Initial Access" },
  { id: "execution", ta: "TA0002", name: "Execution", short: "Execution" },
  { id: "persistence", ta: "TA0003", name: "Persistence", short: "Persistence" },
  { id: "privilege-escalation", ta: "TA0004", name: "Privilege Escalation", short: "Priv Esc" },
  { id: "stealth", ta: "TA0005", name: "Stealth", short: "Stealth" },
  { id: "defense-impairment", ta: "TA0112", name: "Defense Impairment", short: "Def Impair" },
  { id: "credential-access", ta: "TA0006", name: "Credential Access", short: "Cred Access" },
  { id: "discovery", ta: "TA0007", name: "Discovery", short: "Discovery" },
  { id: "lateral-movement", ta: "TA0008", name: "Lateral Movement", short: "Lateral" },
  { id: "collection", ta: "TA0009", name: "Collection", short: "Collection" },
  { id: "command-and-control", ta: "TA0011", name: "Command and Control", short: "C2" },
  { id: "exfiltration", ta: "TA0010", name: "Exfiltration", short: "Exfil" },
  { id: "impact", ta: "TA0040", name: "Impact", short: "Impact" },
] as const;

export type TacticId = (typeof ATTACK_TACTICS)[number]["id"];

export type Technique = {
  /** MITRE id — T1234 or T1234.001 */
  id: string;
  name: string;
  tactic: TacticId;
};

/** Techniques referenced in the mapping below. Name and tactic from ATT&CK Enterprise v19. */
export const TECHNIQUES: readonly Technique[] = [
  { id: "T1595", name: "Active Scanning", tactic: "reconnaissance" },
  { id: "T1566", name: "Phishing", tactic: "initial-access" },
  { id: "T1190", name: "Exploit Public-Facing Application", tactic: "initial-access" },
  { id: "T1078", name: "Valid Accounts", tactic: "initial-access" },
  { id: "T1204", name: "User Execution", tactic: "execution" },
  { id: "T1059", name: "Command and Scripting Interpreter", tactic: "execution" },
  { id: "T1543", name: "Create or Modify System Process", tactic: "persistence" },
  { id: "T1547", name: "Boot or Logon Autostart Execution", tactic: "persistence" },
  { id: "T1098", name: "Account Manipulation", tactic: "persistence" },
  { id: "T1068", name: "Exploitation for Privilege Escalation", tactic: "privilege-escalation" },
  { id: "T1548", name: "Abuse Elevation Control Mechanism", tactic: "privilege-escalation" },
  { id: "T1027", name: "Obfuscated Files or Information", tactic: "stealth" },
  { id: "T1070", name: "Indicator Removal", tactic: "stealth" },
  { id: "T1112", name: "Modify Registry", tactic: "defense-impairment" },
  { id: "T1110", name: "Brute Force", tactic: "credential-access" },
  { id: "T1003", name: "OS Credential Dumping", tactic: "credential-access" },
  { id: "T1555", name: "Credentials from Password Stores", tactic: "credential-access" },
  { id: "T1557", name: "Adversary-in-the-Middle", tactic: "credential-access" },
  { id: "T1040", name: "Network Sniffing", tactic: "credential-access" },
  { id: "T1046", name: "Network Service Discovery", tactic: "discovery" },
  { id: "T1083", name: "File and Directory Discovery", tactic: "discovery" },
  { id: "T1021", name: "Remote Services", tactic: "lateral-movement" },
  { id: "T1005", name: "Data from Local System", tactic: "collection" },
  { id: "T1071", name: "Application Layer Protocol", tactic: "command-and-control" },
  { id: "T1105", name: "Ingress Tool Transfer", tactic: "command-and-control" },
  { id: "T1041", name: "Exfiltration Over C2 Channel", tactic: "exfiltration" },
  { id: "T1052", name: "Exfiltration Over Physical Medium", tactic: "exfiltration" },
  { id: "T1486", name: "Data Encrypted for Impact", tactic: "impact" },
];

/**
 * caseId → the techniques the report covers.
 *
 * Any case not listed here still shows in the library as normal, but doesn't appear in the matrix.
 * That's intentional: better than adding a technique we're not sure about.
 */
export const caseAttackMapping: Record<string, readonly string[]> = {
  // ── Ransomware ──────────────────────────────────────────────────────────
  "malware-analysis-wannacry": ["T1486", "T1105", "T1071", "T1204"],
  "lockbit-ransomware-forensics": ["T1486", "T1070", "T1005"],

  // ── Malware & stealers ──────────────────────────────────────────────────
  "serpent-stealer": ["T1555", "T1005", "T1041", "T1027"],
  "unload-malware-report": ["T1027", "T1059", "T1071"],
  "malware2-report": ["T1027", "T1059", "T1105"],
  "hidden-backdoor-report": ["T1543", "T1547", "T1071"],
  "depi-r4-project": ["T1204", "T1027", "T1105"],
  "imagestegano": ["T1027"],

  // ── DFIR ────────────────────────────────────────────────────────────────
  "ecir-registry-forensics": ["T1112", "T1070", "T1083"],
  "data-exfiltration-investigation": ["T1052", "T1003", "T1021"],
  "usb-forensics-report": ["T1052", "T1083"],
  "autopsy": ["T1070", "T1083"],

  // ── LetsDefend SOC rooms ────────────────────────────────────────────────
  "soc127-pdf": ["T1190"],
  "soc205-pdf": ["T1071", "T1046"],
  "soc257-pdf": ["T1204", "T1105"],
  "soc274-pdf": ["T1021", "T1078"],
  "soc282-pdf": ["T1041", "T1005"],
  "soc326-report": ["T1566", "T1204"],
  "soc336-report": ["T1547", "T1543"],
  "soc338-pdf": ["T1190", "T1059"],
  "soc342-pdf": ["T1068", "T1548"],

  // ── Blue-team rooms ─────────────────────────────────────────────────────
  "email-analysis-room-report": ["T1566"],
  "bruteforce-room-report": ["T1110", "T1078"],
  "malicious-web-traffic-room-report": ["T1190", "T1071"],

  // ── Network ─────────────────────────────────────────────────────────────
  "ettercap-case": ["T1557", "T1040"],
  "wifi-cracking-walkthrough": ["T1110"],

  // ── Offensive / CTF ─────────────────────────────────────────────────────
  "simple-ctf-writeup": ["T1190", "T1110", "T1548"],
  "easy-peasy-ctf-writeup": ["T1595", "T1046", "T1027"],
  "bounty-hacker-ctf-writeup": ["T1110", "T1021", "T1548"],
  "offensive-security-intro": ["T1595", "T1190"],
  "penetration-testing-life-cycle": ["T1595", "T1046", "T1068"],

  // ── Detection engineering / infrastructure ──────────────────────────────
  "3omda-custom-detection-rules": ["T1059", "T1547", "T1110", "T1112"],
  "soc-env-depi-r3-project": ["T1059", "T1547", "T1046"],

  // ── Cloud & IAM ─────────────────────────────────────────────────────────
  "iam-access-control-room": ["T1078", "T1098"],
  "aws-kms-security": ["T1078"],
  "aws-guardduty-setup": ["T1078", "T1046"],
};

const TECHNIQUE_BY_ID = new Map(TECHNIQUES.map((t) => [t.id, t]));

export type TacticCoverage = {
  tactic: (typeof ATTACK_TACTICS)[number];
  techniques: {
    technique: Technique;
    /** ids of the cases that cover this technique */
    caseIds: string[];
  }[];
};

/**
 * Inverts the mapping (case → techniques) into the direction the matrix needs
 * (tactic → technique → cases). Computed once at build time.
 */
export const buildCoverage = (): TacticCoverage[] => {
  const byTechnique = new Map<string, string[]>();

  for (const [caseId, techniqueIds] of Object.entries(caseAttackMapping)) {
    for (const techniqueId of techniqueIds) {
      const list = byTechnique.get(techniqueId);
      if (list) list.push(caseId);
      else byTechnique.set(techniqueId, [caseId]);
    }
  }

  return ATTACK_TACTICS.map((tactic) => ({
    tactic,
    techniques: TECHNIQUES.filter((t) => t.tactic === tactic.id)
      .map((technique) => ({
        technique,
        caseIds: byTechnique.get(technique.id) ?? [],
      }))
      .filter((entry) => entry.caseIds.length > 0)
      .sort((a, b) => b.caseIds.length - a.caseIds.length),
  })).filter((column) => column.techniques.length > 0);
};

export const techniqueName = (id: string): string =>
  TECHNIQUE_BY_ID.get(id)?.name ?? id;

/** Total techniques covered — shown as a number above the matrix */
export const coveredTechniqueCount = (): number =>
  new Set(Object.values(caseAttackMapping).flat()).size;
