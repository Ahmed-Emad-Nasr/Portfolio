/*
 * The skill groups (from the CV). `evidence` links a group to the cases that
 * demonstrate it — ids from data/cases.ts.
 */

type SkillGroup = {
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
    items: ["Wazuh", "ELK Stack", "Splunk", "Security Onion", "Sysmon", "auditd", "TheHive"],
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
      { id: "soc342-pdf", label: "SOC342 — SharePoint ToolShell web shell" },
      { id: "soc336-report", label: "SOC336 — Outlook zero-click RCE" },
      { id: "soc274-pdf", label: "SOC274 — PAN-OS CVE-2024-3400" },
    ],
  },
  {
    id: "forensics",
    label: "Malware Analysis & Forensics",
    items: ["Volatility", "Autopsy", "Registry Explorer", "FTK Imager", "PEStudio", "dotPeek", "FLOSS", "capa", "YARA", "FakeNet-NG", "Process Hacker"],
    evidence: [
      { id: "data-exfiltration-investigation", label: "Memory forensics — exfiltration" },
      { id: "lockbit-ransomware-forensics", label: "LockBit memory forensics" },
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
      { id: "usb-forensics-report", label: "Payroll PII on USB — DLP gaps" },
      { id: "aws-kms-security", label: "AWS KMS key management" },
      { id: "aws-athena-healthcare", label: "Healthcare data on S3 + Athena" },
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
    evidence: [
      { id: "apt33-threat-intel-brief", label: "APT33 threat intel brief" },
      { id: "unload-malware-report", label: "IcedID C2 attribution" },
    ],
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
