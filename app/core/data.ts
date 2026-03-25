
/*
 * File: data.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Central static content for sections (timeline entries and about cards)
 */

export const GITHUB_USERNAME = "Ahmed-Emad-Nasr";

export const homeSummaryParagraph =
  "Computer Science student at Benha University, specializing in SOC, Incident Response, and Cybersecurity. Experienced in monitoring, alert triage, DFIR, and system defense through DEPI & ITI training and SOC projects. Passionate about securing digital environments.";

export const aboutSummaryParagraph =
  "SOC Analyst with hands-on experience from 10+ SOC trainings and 200+ simulated alerts through DEPI, ITI, SOC projects, and home labs. Skilled in SIEM/EDR investigations, alert triage, log & IOC analysis, incident handling, and team collaboration. Focused on improving detection accuracy, reducing alert fatigue via continuous tuning and threat-driven analysis. Open to relocation and remote work.";

export const knowledgeEducationItems = [
  {
    tag: "Incident Response Analyst Intern",
    subTag: "Digital Egypt Pioneers Initiative (DEPI)",
    subTagHyperlink: "https://www.depi.gov.eg/",
    desc: "Completed a 6-month DEPI training program and solved TryHackMe labs simulating the full Incident Response lifecycle. • Implemented a DEPI graduation project using ELK SIEM, Wazuh EDR, and Suricata, reducing false-positive alerts by 9%.",
    isRight: true,
    startDate: "2026-01-01",
    showDate: true,
  },
  {
    tag: "Information Security Analyst Intern",
    subTag: "Digital Egypt Pioneers Initiative (DEPI)",
    subTagHyperlink: "https://www.depi.gov.eg/",
    desc: "Analyzed and triaged simulated security alerts within TryHackMe environments using SOC lifecycle methodologies. • Developed a DEPI capstone project with Wazuh, Suricata, VirusTotal, and YARA rules, increasing detection capabilities by 12%.",
    isRight: false,
    startDate: "2025-06-01",
    endDate: "2025-12-01",
    showDate: true,
  },
  {
    tag: "Volunteer Cybersecurity Instructor & Technical Trainer",
    subTag: "Google Developer Groups (GDG) and Science in Code (SIC)",
    subTagHyperlink: "https://gdg.community.dev/",
    desc: "Delivered cybersecurity training to 120+ learners, achieving a 40% improvement in practical skills and a 4.9/5 overall rating. • Conducted sessions on security fundamentals, threat awareness, and online safety for diverse audiences.",
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
