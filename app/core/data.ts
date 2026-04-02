
/*
 * File: data.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Central static content for sections (timeline entries and about cards)
 */

export const GITHUB_USERNAME = "Ahmed-Emad-Nasr";

export const homeSummaryParagraph =
  "Computer Science student and SOC/IR analyst with 10+ trainings and 200+ simulated alerts. Strong in SIEM/EDR investigations, alert triage, IOC analysis, and incident response.";

export const aboutSummaryParagraph =
  "SOC and Incident Response analyst with hands-on experience from 10+ trainings and 200+ simulated alerts. Focused on SIEM/EDR investigations, alert triage, IOC analysis, and faster incident handling.";

export const knowledgeEducationItems = [
  {
    tag: "Incident Response Analyst Intern",
    subTag: "Digital Egypt Pioneers Initiative (DEPI)",
    subTagHyperlink: "https://www.depi.gov.eg/",
    desc: "Completed a 6-month DEPI training program, performing hands-on Incident Response across the full IR lifecycle (labs and projects). • Built and tuned a SIEM environment using ELK, Wazuh, and Suricata, reducing false-positive alerts by 9% and improving alert quality.",
    isRight: true,
    startDate: "2026-01-01",
    showDate: true,
  },
  {
    tag: "Information Security Analyst Intern",
    subTag: "Digital Egypt Pioneers Initiative (DEPI)",
    subTagHyperlink: "https://www.depi.gov.eg/",
    desc: "Analyzed and triaged simulated SOC alerts using structured workflows, improving investigation consistency and response speed. • Developed a detection lab using Wazuh, Suricata, VirusTotal, and YARA rules, increasing detection coverage by 12%.",
    isRight: false,
    startDate: "2025-06-01",
    endDate: "2025-12-01",
    showDate: true,
  },
  {
    tag: "Volunteer Cybersecurity Instructor & Technical Trainer",
    subTag: "Google Developer Groups (GDG) and Science in Code (SIC)",
    subTagHyperlink: "https://gdg.community.dev/",
    desc: "Developed and delivered 35+ structured cybersecurity sessions to 120+ learners, achieving a 4.9/5 rating and raising lab scores by 40%.",
    isRight: true,
    startDate: "2024-10-01",
    endDate: "2025-10-01",
    showDate: true,
  },
  {
    tag: "Bachelor of Computer Science",
    desc: "Major: Information Security and Digital Forensics | GPA: 3.7/4.0. • Activities: Cybersecurity Technical Member at GDG and participant in university CTF competitions.",
    subTag: "Benha University",
    subTagHyperlink: "https://www.bu.edu.eg/",
    isRight: false,
    startDate: "2022-10-01",
    endDate: "2026-07-01",
    showDate: true,
  },
  {
    tag: "Cybertalents Penetration Testing Bootcamp",
    subTag: "Cybertalents",
    subTagHyperlink: "https://cybertalents.com/",
    desc: "Completed hands-on penetration testing labs using attack simulation and mitigation workflows. • Discovered and validated 15+ vulnerabilities across lab environments, improving vulnerability identification efficiency by 30%.",
    isRight: true,
    startDate: "2025-11-01",
    endDate: "2025-12-01",
    showDate: true,
  },
  {
    tag: "ITI Summer Cybersecurity Program",
    subTag: "Information Technology Institute",
    subTagHyperlink: "https://www.iti.gov.eg/",
    desc: "Participated in SOC simulations, handling 100+ security alerts and performing incident triage. • Reduced false-positive rate by 25% through improved alert analysis and correlation techniques.",
    isRight: false,
    startDate: "2025-09-01",
    endDate: "2025-11-01",
    showDate: true,
  },
  {
    tag: "Introduction to Cybersecurity Bootcamp",
    subTag: "CyberTalents",
    subTagHyperlink: "https://cybertalents.com/",
    desc: "Gained foundational knowledge in networking, cybersecurity principles, and attack vectors. • Completed 20+ hands-on labs, improving detection accuracy and reducing analysis time by 20%.",
    isRight: true,
    startDate: "2024-11-01",
    endDate: "2025-01-01",
    showDate: true,
  },
  {
    tag: "HCIA-Cloud Computing V5.0",
    subTag: "Huawei ICT Academy",
    subTagHyperlink: "https://www.huawei.com/minisite/ict-academy/en/",
    desc: "Built cloud network setups and configured services, applying cloud security principles. • Deployed and secured 5+ cloud-based services, reducing misconfiguration risks by 20%.",
    isRight: false,
    startDate: "2024-08-01",
    endDate: "2024-09-01",
    showDate: true,
  },
  {
    tag: "Huawei Routing & Switching Summer Training",
    subTag: "Huawei",
    subTagHyperlink: "https://www.huawei.com/",
    desc: "Configured and troubleshooted routers and switches in lab environments. • Configured 10+ network devices and reduced lab downtime by 30% through efficient troubleshooting.",
    isRight: true,
    startDate: "2023-08-01",
    endDate: "2023-09-01",
    showDate: true,
  },
];

export const aboutMeCards = [
  {
    icon: "fa-solid fa-earth-americas",
    title: "Languages",
    description:
      "Arabic: Native • English: Professional Working Proficiency (C1)",
  },
  {
    icon: "fa-solid fa-network-wired",
    title: "Core Skills",
    description:
      "SIEM & EDR: Wazuh, ELK Stack, Splunk, Sysmon, Suricata, pfSense • Incident Response & Threat Detection: Alert Triage, IOC Analysis, Threat Hunting, Detection Engineering, Malware Analysis • Programming & Automation: Python, Bash, PowerShell, C++, JavaScript, TypeScript",
  },
  {
    icon: "fa-solid fa-graduation-cap",
    title: "Education",
    description:
      "Bachelor of Computer Science - Benha University (Oct 2022 - Jul 2026) • Major: Information Security and Digital Forensics • GPA: 3.7/4.0",
  },
  {
    icon: "fa-solid fa-certificate",
    title: "Certifications",
    description:
      "eCIR Preparation (INE) • eJPT v2 (INE) • Information Security Analyst & Forensics Investigator (DEPI) • TryHackMe SOC Analyst Path L1/L2 • Cisco Junior Cybersecurity Analyst • HCIA Cloud & Datacom • CCNA 200-301",
  },
  {
    icon: "fa-solid fa-trophy",
    title: "Achievements",
    description:
      "Scored 95% in eJPT v2 • Best Cybersecurity Technical Award at GDG (1st among 200 participants) • Ranked 44th out of 400 in ITI/CyberTalents CTF • Top 5 out of 360 teams in National University CTF • Scored 98% in CCNA • Ranked in top 10% of Information Security & Digital Forensics class",
  },
  {
    icon: "fa-solid fa-user-shield",
    title: "Personal Details",
    description:
      "Location: Cairo, Egypt • Nationality: Egyptian • Age: 21 • Marital Status: Single • Military Status: Postponed (Student) • Open to relocation and remote work",
  }
];

export const trustMetrics = [
  { value: "8k+", label: "LinkedIn Followers" },
  { value: "200+", label: "Simulated SOC Alerts Investigated" },
  { value: "35+", label: "Cybersecurity Sessions Delivered" },
  { value: "120+", label: "Learners Trained in Security Topics" },
  { value: "10+", label: "SOC / DFIR Trainings & Bootcamps" },
  { value: "15+", label: "Validated Vulnerabilities in Labs" },
  { value: "4.9/5", label: "Average Training Feedback Score" },
  { value: "Top 5/360", label: "National University CTF Ranking" },
  { value: "Top 10%", label: "Class Rank (InfoSec & DFIR)" },
  { value: "3.7/4.0", label: "Computer Science GPA" },
  { value: "95%", label: "eJPT v2 Score" },
  { value: "98%", label: "CCNA 200-301 Score" },
];

export const trustTooling = [
  "Wazuh",
  "ELK Stack",
  "Splunk",
  "Suricata",
  "MITRE ATT&CK",
  "YARA",
  "TryHackMe",
  "VirusTotal",
  "Python",
  "PowerShell",
];

export const trustAchievements = [
  "Best Cybersecurity Technical Award at GDG (1st among 200 participants)",
  "Ranked 44th out of 400 in ITI + CyberTalents CTF",
  "Top 5 out of 360 teams in National University CTF (Egypt)",
  "Delivered 35+ cybersecurity sessions to 120+ learners with 40% lab score improvement",
  "Ranked in the top 10% of Information Security and Digital Forensics class",
];

export const trustCertifications = [
  "eCIR Preparation",
  "eJPT v2",
  "SOC Analyst Path L1/L2",
  "DEPI Information Security Analyst & Forensics Investigator",
  "Cisco Junior Cybersecurity Analyst",
  "HCIA Cloud & Datacom",
  "CCNA 200-301",
];

export const serviceCatalog = [
  {
    slug: "soc-analysis",
    icon: "fa-solid fa-shield-halved",
    title: "Security Operations Center (SOC) Analysis",
    description:
      "Advanced alert triage, threat detection, and security event analysis. Utilize Wazuh, ELK Stack, and Splunk for real-time monitoring. Implement MITRE ATT&CK framework for threat classification and improve detection accuracy.",
    outcome: "Prioritized alert report and investigation notes within 24h",
    from: "$300",
    deliverables: [
      "Alert triage workbook with severity ranking",
      "Detection quality review and false-positive hotspots",
      "Recommended tuning actions for top noisy rules",
    ],
  },
  {
    slug: "incident-response",
    icon: "fa-solid fa-fire",
    title: "Incident Response (IR) & Handling",
    description:
      "End-to-end incident response lifecycle management. Perform threat hunting, containment, eradication, and recovery. Execute incident response playbooks using best practices and frameworks.",
    outcome: "Actionable response plan and incident timeline",
    from: "$450",
    deliverables: [
      "Incident timeline and attack narrative",
      "Containment and eradication checklist",
      "Post-incident lessons learned and hardening plan",
    ],
  },
  {
    slug: "threat-hunting",
    icon: "fa-solid fa-magnifying-glass",
    title: "Threat Hunting & Detection Engineering",
    description:
      "Proactive threat hunting using YARA rules, Suricata IDS/IPS, and behavioral analysis. Create custom detection signatures, reduce false positive alerts, and strengthen security posture.",
    outcome: "Custom detection rules and tuning package",
    from: "$400",
    deliverables: [
      "Hypothesis-driven hunting report",
      "Detection logic pack (queries, signatures, conditions)",
      "Validation notes with expected telemetry",
    ],
  },
  {
    slug: "siem-edr-implementation",
    icon: "fa-solid fa-database",
    title: "SIEM & EDR Implementation",
    description:
      "Deploy and configure enterprise-grade SIEM solutions including ELK Stack and Splunk. Implement EDR tools like Wazuh for endpoint detection and response capabilities.",
    outcome: "Monitored pipeline with validated detections",
    from: "$600",
    deliverables: [
      "SIEM/EDR deployment checklist and architecture notes",
      "Core detection rules for high-priority threats",
      "Operational handover guide for daily monitoring",
    ],
  },
  {
    slug: "log-analysis-forensics",
    icon: "fa-solid fa-file-lines",
    title: "Log Analysis & Digital Forensics",
    description:
      "Comprehensive log analysis, IOC extraction, and digital forensics investigations. Perform memory forensics, malware behavioral analysis, and evidence collection for incident investigations.",
    outcome: "Forensic findings with IOC package",
    from: "$500",
    deliverables: [
      "Evidence timeline and IOC extraction sheet",
      "Root cause analysis summary",
      "Preservation-ready investigation report",
    ],
  },
  {
    slug: "vapt",
    icon: "fa-solid fa-triangle-exclamation",
    title: "Vulnerability Assessment & Penetration Testing",
    description:
      "Identify security weaknesses through systematic vulnerability assessments. Conduct authorized penetration testing, create detailed reports, and recommend remediation strategies.",
    outcome: "Remediation roadmap with severity ranking",
    from: "$700",
    deliverables: [
      "Executive risk summary",
      "Technical findings with proof of concept",
      "Prioritized remediation plan by business impact",
    ],
  },
  {
    slug: "training-awareness",
    icon: "fa-solid fa-person-chalkboard",
    title: "Cybersecurity Training & Awareness",
    description:
      "Deliver comprehensive cybersecurity training programs to technical and non-technical audiences. Build security awareness, improve incident response skills, and foster security culture.",
    outcome: "Workshop deck, labs, and attendance report",
    from: "$250",
    deliverables: [
      "Customized learning path and session plan",
      "Hands-on labs and challenge exercises",
      "Participation feedback and improvement recommendations",
    ],
  },
  {
    slug: "malware-analysis",
    icon: "fa-solid fa-virus",
    title: "Malware Analysis & Prevention",
    description:
      "Perform static and dynamic malware analysis in isolated environments. Extract indicators of compromise (IOCs), develop detection signatures, and implement prevention strategies using YARA rules.",
    outcome: "Malware behavior report and detection artifacts",
    from: "$450",
    deliverables: [
      "Behavior profile and persistence map",
      "IOC bundle for SIEM/EDR ingestion",
      "Prevention controls and signature recommendations",
    ],
  },
] as const;

export const projectBullets: Record<string, string[]> = {
  "insider-threat-detection-deception": [
    "Designed a deception environment using honeytokens and Wazuh SIEM to detect insider activity and unauthorized access.",
    "Integrated pfSense and Suricata for real-time monitoring, reducing fatigue alerts by 11% and enhancing alert reliability.",
  ],
  "Malware-Analysis-and-Prevention-Strategy": [
    "Created an isolated malware lab with YARA rules and threat intelligence feeds for IOC extraction.",
    "Reduced investigation time by 20% and improved detection accuracy through automated static and dynamic malware analysis.",
  ],
  "SOC-Environment": [
    "Deployed a SOC stack using Wazuh, Suricata, and pfSense, automating detection workflows and log collection.",
    "Simulated 50+ attacks to validate SOC rules, improving incident response and detection efficiency.",
  ],
  "Threat-Intelligence-Tool": [
    "Developed a Python tool integrating VirusTotal and Hybrid Analysis APIs for IOC enrichment and correlation.",
    "Accelerated threat analysis by 25% and reduced email triage time by 5 minutes for faster decision-making.",
  ],
};

export const contactServiceOptions = [
  "SOC monitoring support",
  "Incident response assistance",
  "Threat hunting engagement",
  "Security training workshop",
  "General consultation",
] as const;

export const contactBudgetOptions = [
  "Under $300",
  "$300 - $800",
  "$800 - $2000",
  "$2000+",
  "Not sure yet",
] as const;

export const contactTimelineOptions = [
  "Urgent (within 48 hours)",
  "This week",
  "This month",
  "Exploring options",
] as const;
