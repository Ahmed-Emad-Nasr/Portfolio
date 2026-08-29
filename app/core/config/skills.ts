/*
 * core/config/skills.ts
 * Author: Ahmed Emad Nasr
 *
 * تصنيف المهارات من الـ CV. الموقع كان بيعرض المهارات كتاجات متناثرة جوه
 * كل خبرة وكل case بس — مفيش مكان واحد يقول "ده اللي بشتغل بيه".
 *
 * فايدة إنها داتا مش JSX: كل مجموعة ليها `evidence` — الـ id بتاع الـ cases
 * اللي بتثبت المهارة دي. ده بيحوّل قايمة مهارات (ادّعاء) لشبكة أدلة
 * (إثبات). ابدأ بربط اللي واثق منه، والباقي بيتعرض عادي من غير لينكات.
 *
 * الـ ids لازم تطابق `caseEvidenceLibrary[].id` في config/cases.ts.
 */

export type SkillGroup = {
  id: string;
  /** اسم المجموعة زي ما هو في الـ CV */
  label: string;
  items: readonly string[];
  /** ids من مكتبة الـ cases بتثبت المجموعة دي */
  evidence?: readonly string[];
};

export const skillGroups: readonly SkillGroup[] = [
  {
    id: "siem",
    label: "SIEM & Security Monitoring",
    items: ["Wazuh", "ELK Stack", "Splunk", "Security Onion", "Sysmon", "auditd", "Threat Intelligence"],
    evidence: ["3omda custom detection rules", "soc-env-depi-r3-project"],
  },
  {
    id: "ir",
    label: "Incident Response & Threat Detection",
    items: ["Alert Triage", "IOC Analysis", "Log Analysis", "Incident Response"],
    evidence: ["soc326-report", "soc336-report", "soc274-pdf"],
  },
  {
    id: "identity",
    label: "Identity & Access Security",
    items: ["IAM", "PAM", "DAM", "RBAC", "ABAC"],
    evidence: ["iam-access-control-room", "aws-kms-security"],
  },
  {
    id: "automation",
    label: "Programming & Automation",
    items: ["Python", "Bash", "PowerShell", "Regex"],
  },
  {
    id: "network",
    label: "Networking & Network Security",
    items: ["TCP/IP", "VPN", "Packet Analysis", "IDS/IPS", "Suricata", "Zeek", "Wireshark", "pfSense"],
    evidence: ["ettercap-case", "malicious-web-traffic-room-report"],
  },
  {
    id: "forensics",
    label: "Malware Analysis & Forensics",
    items: ["Volatility", "Autopsy", "PEStudio", "CFF Explorer", "YARA", "FakeNet-NG", "Process Hacker"],
    evidence: ["data-exfiltration-investigation", "autopsy", "ecir-registry-forensics", "malware-analysis-wannacry"],
  },
  {
    id: "frameworks",
    label: "Security Frameworks",
    items: ["MITRE ATT&CK", "NIST CSF", "NIST 800-61", "Cyber Kill Chain", "ISO 27001", "PCI DSS"],
  },
  {
    id: "os",
    label: "Operating Systems",
    items: ["Windows", "Windows Server", "Ubuntu", "Kali Linux", "Arch Linux"],
  },
];

export const languages = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "Professional working proficiency" },
] as const;
