/*
 * core/config/skills.ts
 * Author: Ahmed Emad Nasr
 *
 * The skill taxonomy from the CV. The site used to show skills only as tags
 * scattered inside individual roles and cases — there was no single place
 * saying "this is what I work with".
 *
 * The advantage of it being data rather than JSX: each group carries
 * `evidence` — the ids of the cases that demonstrate that skill. That turns
 * a skills list (a claim) into an evidence graph (a demonstration). Start by
 * linking the ones you are confident about; the rest render normally without
 * links.
 *
 * The ids must match `caseEvidenceLibrary[].id` in config/cases.ts.
 */

export type SkillGroup = {
  id: string;
  /** Group name exactly as it appears in the CV */
  label: string;
  items: readonly string[];
  /*
   * The cases that demonstrate this group.
   *
   * The label is written out here rather than looked up from
   * caseEvidenceLibrary on purpose: the component that renders skills is a
   * client component, so importing the case library would have bundled
   * 42KB of blog data into the home page just to read 13 titles. This
   * small amount of duplication is far cheaper.
   *
   * The id must match caseEvidenceLibrary[].id — if you change an id in
   * cases.ts, change it here too, or the link becomes a 404.
   */
  evidence?: readonly { id: string; label: string }[];
};

export const skillGroups: readonly SkillGroup[] = [
  {
    /* GRC first: the Banque Misr assessment and VerifAI 360 are the work
       behind it, and it is the area a SOC-only list used to hide. */
    id: "grc",
    label: "Governance, Risk & Compliance",
    items: ["ISO 27001", "PCI DSS", "NIST CSF", "COBIT", "SWIFT CSP", "GDPR", "Risk Assessment", "Gap Analysis", "Security Auditing", "Policy & Procedures", "Remediation Planning"],
    evidence: [
      { id: "legal-considerations-dfir", label: "Policy compliance & AUP review" },
    ],
  },
  {
    id: "siem",
    label: "SIEM & Security Monitoring",
    items: ["Wazuh", "ELK Stack", "Splunk", "Security Onion", "Sysmon", "auditd"],
    evidence: [
      { id: "3omda-custom-detection-rules", label: "Custom Wazuh detection rules" },
      { id: "soc-env-depi-r3-project", label: "SOC environment build" },
    ],
  },
  {
    id: "ir",
    label: "Incident Response & Threat Detection",
    items: ["Alert Triage", "Incident Detection", "IOC Analysis", "Log Analysis", "Threat Hunting", "Containment & Recovery"],
    evidence: [
      { id: "soc326-report", label: "SOC326 — full IR lifecycle" },
      { id: "soc336-report", label: "SOC336 — APT persistence" },
      { id: "soc274-pdf", label: "SOC274 — lateral movement" },
    ],
  },
  {
    id: "forensics",
    label: "Malware Analysis & Forensics",
    items: ["Volatility", "Autopsy", "PEStudio", "CFF Explorer", "YARA", "FakeNet-NG", "Process Hacker"],
    evidence: [
      { id: "data-exfiltration-investigation", label: "Memory forensics — exfiltration" },
      { id: "autopsy", label: "Autopsy data recovery" },
      { id: "ecir-registry-forensics", label: "Windows registry forensics" },
      { id: "malware-analysis-wannacry", label: "WannaCry analysis & response" },
    ],
  },
  {
    id: "identity",
    label: "Identity & Access Management",
    items: ["IAM", "PAM", "RBAC", "ABAC", "Access Control", "Active Directory"],
    evidence: [
      { id: "iam-access-control-room", label: "IAM & access control" },
      { id: "monitoring-active-directory", label: "Active Directory monitoring" },
    ],
  },
  {
    id: "data",
    label: "Data Security",
    items: ["DLP", "DAM", "Encryption", "Key Management", "Data Classification", "Secure Storage"],
    evidence: [
      { id: "soc282-pdf", label: "SOC282 — DLP & data exfiltration" },
      { id: "aws-kms-security", label: "AWS KMS key management" },
      { id: "aws-athena-healthcare", label: "Encrypted healthcare data pipeline" },
    ],
  },
  {
    id: "vuln",
    label: "Vulnerability Management & Hardening",
    items: ["Nessus", "Vulnerability Assessment", "CIS Benchmarks", "System Hardening", "OWASP Top 10", "Burp Suite"],
    evidence: [
      { id: "vulnerability-scanning-tools", label: "Vulnerability scanning tools" },
      { id: "owasp-juice-shop", label: "OWASP Juice Shop" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud Security",
    items: ["AWS GuardDuty", "AWS KMS", "Amazon S3", "Amazon Athena", "Cloud Hardening"],
    evidence: [
      { id: "aws-guardduty-setup", label: "AWS GuardDuty setup" },
      { id: "aws-kms-security", label: "AWS KMS key management" },
    ],
  },
  {
    id: "intel",
    label: "Threat Intelligence",
    items: ["VirusTotal", "Hybrid Analysis", "NVD", "Exploit-DB", "IOC Enrichment", "Dark-Web Monitoring"],
  },
  {
    id: "network",
    label: "Networking & Network Security",
    items: ["TCP/IP", "VPN", "Packet Analysis", "IDS/IPS", "Suricata", "Zeek", "Wireshark", "pfSense"],
    evidence: [
      { id: "ettercap-case", label: "EtterCap MITM analysis" },
      { id: "malicious-web-traffic-room-report", label: "Malicious web traffic" },
    ],
  },
  {
    /* ISO 27001, PCI DSS and NIST CSF live in the GRC group above —
       listing them twice made the same tag appear on two cards. */
    id: "frameworks",
    label: "Security Frameworks",
    items: ["MITRE ATT&CK", "NIST 800-61", "NIST 800-53", "Cyber Kill Chain", "OWASP"],
  },
  {
    /* Was two groups ("Programming & Automation" and "Operating Systems");
       merged so the arsenal grid fills three full rows of four. */
    id: "automation",
    label: "Automation & Platforms",
    items: ["Python", "Bash", "PowerShell", "Regex", "Windows Server", "Linux"],
  },
  {
    // From the CV — a whole group that was missing from the site.
    id: "soft",
    label: "Soft Skills",
    items: ["Analytical Thinking", "Problem Solving", "Team Collaboration", "Communication", "Adaptability", "Attention to Detail"],
  },
];

/* One list for the CV page (full level) and the home page (code + short level) */
export const languages = [
  { code: "AR", name: "Arabic", level: "Native", short: "Native" },
  { code: "EN", name: "English", level: "Professional Working Proficiency", short: "Professional" },
] as const;
