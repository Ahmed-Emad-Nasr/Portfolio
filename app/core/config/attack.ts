/*
 * core/config/attack.ts
 * Author: Ahmed Emad Nasr
 *
 * ربط مكتبة الـ cases بـ MITRE ATT&CK.
 *
 * ليه ده أهم إضافة في الموقع كله؟ لأن 38 تقرير في ليستة = أرشيف، ونفس
 * الـ 38 معروضين على ATT&CK = **خريطة تغطية**. الفرق إن الأولى بتقول
 * "عملت حاجات كتير" والتانية بتقول "بغطّي التكتيكات دي بالتحديد وعندي
 * الدليل" — وده بالظبط شكل السؤال في أي إنترفيو SOC.
 *
 * ⚠️⚠️ لازم تراجع الملف ده قبل ما تنشره ⚠️⚠️
 *
 * الربط اللي تحت مستنتج من عناوين وتاجات الـ cases، مش من قراية التقارير
 * نفسها — أنا مشوفتش الـ PDFs. يعني هو نقطة بداية صح في أغلبه، بس أكيد
 * فيه تكنيكات غطّيتها ومش مكتوبة هنا، وممكن يكون فيه واحد أو اتنين مش
 * دقيقين. اقرا كل سطر وعدّله من التقرير الأصلي.
 *
 * خريطة تغطية غلط أسوأ من عدم وجود خريطة أصلاً: أي حد هيقراها هيفتح
 * التقرير ويقارن.
 */

/** التكتيكات بترتيب Enterprise ATT&CK — ده ترتيب أعمدة المصفوفة */
export const ATTACK_TACTICS = [
  { id: "reconnaissance", name: "Reconnaissance" },
  { id: "initial-access", name: "Initial Access" },
  { id: "execution", name: "Execution" },
  { id: "persistence", name: "Persistence" },
  { id: "privilege-escalation", name: "Privilege Escalation" },
  { id: "defense-evasion", name: "Defense Evasion" },
  { id: "credential-access", name: "Credential Access" },
  { id: "discovery", name: "Discovery" },
  { id: "lateral-movement", name: "Lateral Movement" },
  { id: "collection", name: "Collection" },
  { id: "command-and-control", name: "Command and Control" },
  { id: "exfiltration", name: "Exfiltration" },
  { id: "impact", name: "Impact" },
] as const;

export type TacticId = (typeof ATTACK_TACTICS)[number]["id"];

export type Technique = {
  /** معرّف MITRE — T1234 أو T1234.001 */
  id: string;
  name: string;
  tactic: TacticId;
};

/** التكنيكات المذكورة في الربط تحت. الاسم والتكتيك من ATT&CK Enterprise. */
export const TECHNIQUES: readonly Technique[] = [
  { id: "T1595", name: "Active Scanning", tactic: "reconnaissance" },
  { id: "T1590", name: "Gather Victim Network Information", tactic: "reconnaissance" },
  { id: "T1566", name: "Phishing", tactic: "initial-access" },
  { id: "T1190", name: "Exploit Public-Facing Application", tactic: "initial-access" },
  { id: "T1078", name: "Valid Accounts", tactic: "initial-access" },
  { id: "T1133", name: "External Remote Services", tactic: "initial-access" },
  { id: "T1204", name: "User Execution", tactic: "execution" },
  { id: "T1059", name: "Command and Scripting Interpreter", tactic: "execution" },
  { id: "T1543", name: "Create or Modify System Process", tactic: "persistence" },
  { id: "T1547", name: "Boot or Logon Autostart Execution", tactic: "persistence" },
  { id: "T1098", name: "Account Manipulation", tactic: "persistence" },
  { id: "T1068", name: "Exploitation for Privilege Escalation", tactic: "privilege-escalation" },
  { id: "T1548", name: "Abuse Elevation Control Mechanism", tactic: "privilege-escalation" },
  { id: "T1027", name: "Obfuscated Files or Information", tactic: "defense-evasion" },
  { id: "T1070", name: "Indicator Removal", tactic: "defense-evasion" },
  { id: "T1112", name: "Modify Registry", tactic: "defense-evasion" },
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
 * caseId → التكنيكات اللي التقرير بيغطيها.
 *
 * أي case مش موجود هنا بيتعرض عادي في المكتبة، بس مش بيظهر في المصفوفة.
 * ده مقصود: أحسن ما نحط تكنيك مش متأكدين منه.
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
    /** ids بتاعة الـ cases اللي بتغطي التكنيك ده */
    caseIds: string[];
  }[];
};

/**
 * بيقلب الـ mapping (case → techniques) للاتجاه اللي المصفوفة محتاجاه
 * (tactic → technique → cases). بيتحسب مرة واحدة وقت الـ build.
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

/** إجمالي التكنيكات المغطّاة — بيتعرض كرقم فوق المصفوفة */
export const coveredTechniqueCount = (): number =>
  new Set(Object.values(caseAttackMapping).flat()).size;
