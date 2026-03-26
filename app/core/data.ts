
/*
 * File: data.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Central static content for sections (timeline entries and about cards)
 */

export const GITHUB_USERNAME = "Ahmed-Emad-Nasr";

export const homeSummaryParagraph =
  "Computer Science student and SOC Analyst with hands-on experience from 10+ SOC trainings and 200+ simulated alerts across DEPI, ITI, and home labs. Skilled in SIEM/EDR investigations, alert triage, IOC analysis, and incident response.";

export const aboutSummaryParagraph =
  "SOC Analyst with hands-on experience from 10+ SOC trainings and 200+ simulated alerts across DEPI, ITI, and home labs. Skilled in SIEM/EDR investigations, alert triage, IOC analysis, and incident response. Focused on improving detection accuracy, reducing false positives, and accelerating incident investigation workflows. Open to relocation and remote work.";

export const knowledgeEducationItems = [
  {
    tag: "Incident Response Analyst Intern",
    subTag: "Digital Egypt Pioneers Initiative (DEPI)",
    subTagHyperlink: "https://www.depi.gov.eg/",
    desc: "Completed a 6-month DEPI training program performing hands-on Incident Response across the full IR lifecycle (TryHackMe labs). • Built and tuned a SIEM environment using ELK, Wazuh, and Suricata, reducing false-positive alerts by 9% and improving alert quality.",
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
    desc: "Delivered cybersecurity training to 120+ learners, achieving a 4.9/5 rating and improving practical skills by 40%. • Designed structured training sessions on security fundamentals and threat awareness, increasing learner engagement and retention.",
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
    desc: "Completed CyberTalents Universities Penetration Testing Bootcamp (Remote). • Focused on practical penetration testing and offensive security workflows.",
    isRight: true,
    startDate: "2025-11-01",
    endDate: "2025-12-01",
    showDate: true,
  },
  {
    tag: "ITI Summer Cybersecurity Program",
    subTag: "Information Technology Institute",
    subTagHyperlink: "https://www.iti.gov.eg/",
    desc: "Completed ITI Summer Cybersecurity Program (Hybrid). • Hands-on practical labs in SOC operations, incident response, and security tooling.",
    isRight: false,
    startDate: "2025-09-01",
    endDate: "2025-11-01",
    showDate: true,
  },
  {
    tag: "Introduction to Cybersecurity Bootcamp",
    subTag: "CyberTalents",
    subTagHyperlink: "https://cybertalents.com/",
    desc: "Completed foundational cybersecurity bootcamp training (Remote). • Covered core security concepts, threat awareness, and practical defensive workflows.",
    isRight: true,
    startDate: "2024-11-01",
    endDate: "2025-01-01",
    showDate: true,
  },
  {
    tag: "HCIA-Cloud Computing V5.0",
    subTag: "Huawei ICT Academy",
    subTagHyperlink: "https://www.huawei.com/minisite/ict-academy/en/",
    desc: "Completed HCIA cloud computing training track. • Built practical understanding of cloud fundamentals, architecture, and operational security basics.",
    isRight: false,
    startDate: "2024-08-01",
    endDate: "2024-09-01",
    showDate: true,
  },
  {
    tag: "Huawei Routing & Switching Summer Training",
    subTag: "Huawei",
    subTagHyperlink: "https://www.huawei.com/",
    desc: "Completed summer training in routing and switching fundamentals. • Strengthened practical networking skills aligned with enterprise infrastructure operations.",
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
      "SIEM & EDR: Wazuh, ELK Stack, Splunk, Sysmon, Suricata, pfSense • Incident Response & Threat Detection: Alert Triage, IOC Analysis, Threat Hunting, Detection Engineering, Malware Analysis • Programming & Automation: Python, Bash, PowerShell, C++",
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
      "eCIR Preparation (INE) • eJPT v2 (INE) • DEPI Information Security Analyst & Forensics Investigator • TryHackMe SOC Analyst Path L1/L2 • Cisco Junior Cybersecurity Analyst • HCIA Cloud & Datacom • CCNA 200-301",
  },
  {
    icon: "fa-solid fa-trophy",
    title: "Achievements",
    description:
      "Scored 95% in eJPT v2 • Best Cybersecurity Technical Award at GDG (1st among 200 participants) • Ranked 44th out of 400 in ITI/CyberTalents CTF • Top 5 out of 360 teams in National University CTF • Scored 98% in CCNA",
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
  { value: "120+", label: "Learners Trained in Security Topics" },
  { value: "10+", label: "SOC / DFIR Trainings & Bootcamps" },
  { value: "4.9/5", label: "Average Training Feedback Score" },
  { value: "Top 5/360", label: "National University CTF Ranking" },
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
  "Delivered security training with 40% practical skill improvement",
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
    "Integrated pfSense and Suricata for real-time monitoring, enhancing alert reliability and SOC threat visibility.",
  ],
  "Malware-Analysis-and-Prevention-Strategy": [
    "Created an isolated malware lab for analysis and IOC extraction.",
    "Applied YARA rules and threat intelligence feeds, boosting malware detection accuracy and speeding up investigations.",
  ],
  "SOC-Environment": [
    "Deployed a SOC stack using Wazuh, Suricata, and pfSense for centralized log collection.",
    "Automated detection workflows and simulated attacks, reducing manual triage and improving incident response efficiency.",
  ],
  "Threat-Intelligence-Tool": [
    "Developed a Python tool integrating VirusTotal and Hybrid Analysis APIs for IOC enrichment.",
    "Consolidated threat intelligence sources to accelerate malware investigations and enhance detection decisions.",
  ],
};
