
/*
 * File: data.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Central static content for sections (timeline entries and about cards)
 */

export const GITHUB_USERNAME = "Ahmed-Emad-Nasr";

export const homeSummaryParagraph =
  "Computer Science student, SOC Analyst and Incident Response Analyst with hands-on experience from 10+ SOC trainings and 200+ simulated alerts across DEPI, ITI, and home labs. Skilled in SIEM/EDR investigations, alert triage, IOC analysis, and incident response.";

export const aboutSummaryParagraph =
  "SOC Analyst and Incident Response Analyst with hands-on experience from 10+ SOC trainings and 200+ simulated alerts across DEPI, ITI, and home labs. Skilled in monitoring, SIEM/EDR investigations, alert triage, IOC analysis, and incident response. Focused on improving detection accuracy, reducing false positives, and accelerating incident investigation workflows in security operations center environments.";

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
