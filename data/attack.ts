/*
 * The case library mapped onto MITRE ATT&CK. Every technique is something
 * the case's report actually shows (alert, command line, registry key …),
 * not a guess from its title.
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

type TacticId = (typeof ATTACK_TACTICS)[number]["id"];

type Technique = {
  /** MITRE id — T1234 or T1234.001 */
  id: string;
  name: string;
  tactic: TacticId;
};

/**
 * Techniques referenced in the mapping below, as PARENT techniques — the matrix
 * shows one tile per parent. Name and tactic from ATT&CK Enterprise v19; where a
 * technique sits under several tactics, the one these reports use it for.
 */
const TECHNIQUES: readonly Technique[] = [
  { id: "T1595", name: "Active Scanning", tactic: "reconnaissance" },
  { id: "T1566", name: "Phishing", tactic: "initial-access" },
  { id: "T1190", name: "Exploit Public-Facing Application", tactic: "initial-access" },
  { id: "T1078", name: "Valid Accounts", tactic: "initial-access" },
  { id: "T1133", name: "External Remote Services", tactic: "initial-access" },
  { id: "T1189", name: "Drive-by Compromise", tactic: "initial-access" },
  { id: "T1204", name: "User Execution", tactic: "execution" },
  { id: "T1059", name: "Command and Scripting Interpreter", tactic: "execution" },
  { id: "T1203", name: "Exploitation for Client Execution", tactic: "execution" },
  { id: "T1047", name: "Windows Management Instrumentation", tactic: "execution" },
  { id: "T1543", name: "Create or Modify System Process", tactic: "persistence" },
  { id: "T1547", name: "Boot or Logon Autostart Execution", tactic: "persistence" },
  { id: "T1098", name: "Account Manipulation", tactic: "persistence" },
  { id: "T1505", name: "Server Software Component", tactic: "persistence" },
  { id: "T1053", name: "Scheduled Task/Job", tactic: "persistence" },
  { id: "T1068", name: "Exploitation for Privilege Escalation", tactic: "privilege-escalation" },
  { id: "T1548", name: "Abuse Elevation Control Mechanism", tactic: "privilege-escalation" },
  { id: "T1134", name: "Access Token Manipulation", tactic: "privilege-escalation" },
  { id: "T1055", name: "Process Injection", tactic: "privilege-escalation" },
  { id: "T1027", name: "Obfuscated Files or Information", tactic: "stealth" },
  { id: "T1070", name: "Indicator Removal", tactic: "stealth" },
  { id: "T1036", name: "Masquerading", tactic: "stealth" },
  { id: "T1218", name: "System Binary Proxy Execution", tactic: "stealth" },
  { id: "T1497", name: "Virtualization/Sandbox Evasion", tactic: "stealth" },
  { id: "T1112", name: "Modify Registry", tactic: "defense-impairment" },
  { id: "T1562", name: "Impair Defenses", tactic: "defense-impairment" },
  { id: "T1110", name: "Brute Force", tactic: "credential-access" },
  { id: "T1003", name: "OS Credential Dumping", tactic: "credential-access" },
  { id: "T1552", name: "Unsecured Credentials", tactic: "credential-access" },
  { id: "T1557", name: "Adversary-in-the-Middle", tactic: "credential-access" },
  { id: "T1040", name: "Network Sniffing", tactic: "credential-access" },
  { id: "T1046", name: "Network Service Discovery", tactic: "discovery" },
  { id: "T1083", name: "File and Directory Discovery", tactic: "discovery" },
  { id: "T1082", name: "System Information Discovery", tactic: "discovery" },
  { id: "T1016", name: "System Network Configuration Discovery", tactic: "discovery" },
  { id: "T1057", name: "Process Discovery", tactic: "discovery" },
  { id: "T1012", name: "Query Registry", tactic: "discovery" },
  { id: "T1069", name: "Permission Groups Discovery", tactic: "discovery" },
  { id: "T1021", name: "Remote Services", tactic: "lateral-movement" },
  { id: "T1550", name: "Use Alternate Authentication Material", tactic: "lateral-movement" },
  { id: "T1210", name: "Exploitation of Remote Services", tactic: "lateral-movement" },
  { id: "T1005", name: "Data from Local System", tactic: "collection" },
  { id: "T1074", name: "Data Staged", tactic: "collection" },
  { id: "T1071", name: "Application Layer Protocol", tactic: "command-and-control" },
  { id: "T1105", name: "Ingress Tool Transfer", tactic: "command-and-control" },
  { id: "T1219", name: "Remote Access Tools", tactic: "command-and-control" },
  { id: "T1090", name: "Proxy", tactic: "command-and-control" },
  { id: "T1041", name: "Exfiltration Over C2 Channel", tactic: "exfiltration" },
  { id: "T1052", name: "Exfiltration Over Physical Medium", tactic: "exfiltration" },
  { id: "T1048", name: "Exfiltration Over Alternative Protocol", tactic: "exfiltration" },
  { id: "T1486", name: "Data Encrypted for Impact", tactic: "impact" },
  { id: "T1490", name: "Inhibit System Recovery", tactic: "impact" },
  { id: "T1491", name: "Defacement", tactic: "impact" },
  { id: "T1657", name: "Financial Theft", tactic: "impact" },
];

/** Sub-technique names, shown on the case pages ("Phishing: Spearphishing Attachment") */
const SUBTECHNIQUE_NAMES: Record<string, string> = {
  "T1566.001": "Spearphishing Attachment",
  "T1566.002": "Spearphishing Link",
  "T1078.004": "Cloud Accounts",
  "T1204.001": "Malicious Link",
  "T1204.002": "Malicious File",
  "T1204.004": "Malicious Copy and Paste",
  "T1059.001": "PowerShell",
  "T1059.003": "Windows Command Shell",
  "T1059.004": "Unix Shell",
  "T1059.005": "Visual Basic",
  "T1505.003": "Web Shell",
  "T1547.001": "Registry Run Keys / Startup Folder",
  "T1548.002": "Bypass User Account Control",
  "T1027.003": "Steganography",
  "T1070.004": "File Deletion",
  "T1070.006": "Timestomp",
  "T1218.005": "Mshta",
  "T1218.010": "Regsvr32",
  "T1218.011": "Rundll32",
  "T1110.001": "Password Guessing",
  "T1110.002": "Password Cracking",
  "T1003.002": "Security Account Manager",
  "T1552.002": "Credentials in Registry",
  "T1557.002": "ARP Cache Poisoning",
  "T1074.001": "Local Data Staging",
  "T1071.001": "Web Protocols",
  "T1052.001": "Exfiltration over USB",
  "T1491.001": "Internal Defacement",
  "T1090.003": "Multi-hop Proxy",
};

/** T1566.001 → T1566 */
export const parentTechnique = (id: string): string => id.split(".")[0];

/**
 * caseId → the techniques the report covers.
 *
 * Any case not listed here still shows in the library as normal, but doesn't appear in the matrix.
 * That's intentional: better than adding a technique we're not sure about.
 */
export const caseAttackMapping: Record<string, readonly string[]> = {
  // ── LetsDefend SOC alerts (from each report's own findings) ─────────────
  "soc127-pdf": ["T1190", "T1059"],
  "soc205-pdf": ["T1566.001", "T1204.002", "T1059.005", "T1059.001", "T1105"],
  "soc257-pdf": ["T1110", "T1133", "T1078"],
  "soc274-pdf": ["T1190", "T1059.004"],
  "soc282-pdf": ["T1566.001", "T1204.002", "T1082", "T1057", "T1016"],
  "soc326-report": ["T1566.002", "T1204.001"],
  "soc336-report": ["T1566.001", "T1203", "T1059.003", "T1218.010", "T1105"],
  "soc338-pdf": ["T1566.002", "T1204.004", "T1059.001", "T1027", "T1218.005"],
  "soc342-pdf": ["T1190", "T1059.001", "T1505.003", "T1071.001"],
  // ── Malware ─────────────────────────────────────────────────────────────
  // WannaCry: the report's own ATT&CK table (section 7)
  "malware-analysis-wannacry": ["T1204.002", "T1059.003", "T1547.001", "T1112", "T1036", "T1012", "T1005", "T1090.003", "T1210", "T1486", "T1491.001", "T1657"],
  "depi-r4-project": ["T1204.002", "T1059.003", "T1547.001", "T1112", "T1036", "T1012", "T1005", "T1090.003", "T1210", "T1486", "T1491.001", "T1657"],
  "lockbit-ransomware-forensics": ["T1204.002", "T1547.001", "T1543", "T1486"],
  "serpent-stealer": ["T1497", "T1057", "T1548.002", "T1552.002", "T1074.001", "T1005"],
  "unload-malware-report": ["T1218.011", "T1027", "T1071.001", "T1105"],
  "malware2-report": ["T1036", "T1027", "T1070.006"],
  "hidden-backdoor-report": ["T1189", "T1204.002", "T1071.001"],
  "imagestegano": ["T1027.003", "T1003"],
  // ── DFIR ────────────────────────────────────────────────────────────────
  "ecir-registry-forensics": ["T1070.004", "T1219", "T1046"],
  "data-exfiltration-investigation": ["T1052.001", "T1003.002", "T1110.002"],
  "usb-forensics-report": ["T1052.001", "T1005"],
  // ── Blue-team challenges ────────────────────────────────────────────────
  "email-analysis-room-report": ["T1566.001", "T1204.002"],
  "bruteforce-room-report": ["T1110.001", "T1078"],
  "malicious-web-traffic-room-report": ["T1190", "T1110", "T1083"],
  // ── Network & social engineering labs ───────────────────────────────────
  "ettercap-case": ["T1557.002", "T1040"],
  "wifi-cracking-walkthrough": ["T1110.002"],
  "set-credential-harvesting": ["T1566.002"],
  // ── Offensive / CTF ─────────────────────────────────────────────────────
  "simple-ctf-writeup": ["T1190", "T1110", "T1548"],
  "easy-peasy-ctf-writeup": ["T1595", "T1046", "T1027"],
  "bounty-hacker-ctf-writeup": ["T1110", "T1021", "T1548"],
  "offensive-security-intro": ["T1595", "T1190"],
  "penetration-testing-life-cycle": ["T1595", "T1046", "T1003", "T1550"],
  // ── Detection engineering (the rule pack's own MITRE tags, by parent) ───
  "3omda-custom-detection-rules": [
    "T1110.001", "T1486", "T1490", "T1059.001", "T1548", "T1134", "T1053", "T1021",
    "T1047", "T1550", "T1071", "T1190", "T1048", "T1070", "T1027", "T1055", "T1562",
    "T1098", "T1046", "T1595",
  ],
  "soc-env-depi-r3-project": ["T1110", "T1003", "T1068", "T1069", "T1059", "T1055", "T1041", "T1048"],
  // ── Cloud, IAM & threat intel ───────────────────────────────────────────
  "apt33-threat-intel-brief": ["T1078.004"],
  "iam-access-control-room": ["T1078", "T1098"],
  "aws-guardduty-setup": ["T1078.004", "T1046", "T1005"],
  "aws-kms-security": ["T1098"],
  "monitoring-active-directory": ["T1078", "T1098"],
  // ── Infrastructure, Vuln Scanning & Web Security Academy ────────────────
  "guided-pentest-infrastructure": ["T1046", "T1190", "T1552", "T1078"],
  "vulnerability-scanning-tools": ["T1595", "T1190"],
  "owasp-juice-shop": ["T1595", "T1190"],
  "information-disclosure-module": ["T1552", "T1082", "T1190"],
  "idor-live-chat": ["T1190", "T1005", "T1078"],
  "os-command-injection-simple": ["T1190", "T1059.004"],
  "blind-os-injection-time-delays": ["T1190", "T1059.004"],
  "blind-os-injection-output": ["T1190", "T1059.004"],
  "rce-web-shell-upload": ["T1190", "T1505.003", "T1005"],
  "web-shell-content-type-bypass": ["T1190", "T1505.003"],
  "unprotected-admin-functionality": ["T1595", "T1190"],
  "unprotected-admin-unpredictable-url": ["T1190"],
  "user-role-request-parameter": ["T1078"],
  "user-role-modified-profile": ["T1098"],
  "user-id-controlled": ["T1190", "T1005"],
  "user-id-unpredictable": ["T1190", "T1005"],
  "user-id-data-leakage": ["T1190", "T1005"],
  "user-id-password-disclosure": ["T1190", "T1552"],
  "basic-ssrf-local-server": ["T1190"],
  "sqli-login-bypass": ["T1190", "T1078"],
  "stored-xss-html-context": ["T1189"],
  "xxe-retrieve-files": ["T1190", "T1005"],
  "xxe-ssrf-aws-metadata": ["T1190", "T1552"],
  "jwt-unverified-signature": ["T1078"],
  "jwt-flawed-signature": ["T1078"],
  "oauth-implicit-flow-bypass": ["T1190", "T1078"],
  "2fa-simple-bypass": ["T1078"],
  "password-reset-broken-logic": ["T1190", "T1098"],
};

const TECHNIQUE_BY_ID = new Map(TECHNIQUES.map((t) => [t.id, t]));

type TacticCoverage = {
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
    for (const techniqueId of new Set(techniqueIds.map(parentTechnique))) {
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

/** "Phishing: Spearphishing Attachment" for a sub-technique, the plain name for a parent */
const techniqueName = (id: string): string => {
  const parent = TECHNIQUE_BY_ID.get(parentTechnique(id))?.name ?? id;
  const sub = SUBTECHNIQUE_NAMES[id];
  return sub ? `${parent}: ${sub}` : parent;
};

/** Every technique id a case uses, resolved to its name and tactic */
export const techniquesForCase = (caseId: string) =>
  (caseAttackMapping[caseId] ?? []).flatMap((id) => {
    const parent = TECHNIQUE_BY_ID.get(parentTechnique(id));
    return parent ? [{ id, name: techniqueName(id), tactic: parent.tactic }] : [];
  });

/** Total techniques covered — shown as a number above the matrix */
export const coveredTechniqueCount = (): number =>
  new Set(Object.values(caseAttackMapping).flat().map(parentTechnique)).size;

/* Every mapped id must resolve, or the build stops: a typo here would
   silently drop a tile from the matrix. */
for (const [caseId, ids] of Object.entries(caseAttackMapping)) {
  for (const id of ids) {
    if (!TECHNIQUE_BY_ID.has(parentTechnique(id))) {
      throw new Error(`[attack.ts] ${caseId}: technique ${id} is not in TECHNIQUES`);
    }
  }
}
