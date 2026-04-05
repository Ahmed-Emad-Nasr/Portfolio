
/*
 * File: data.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Central static content for sections (timeline entries and about cards)
 */

export const GITHUB_USERNAME = "Ahmed-Emad-Nasr";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AhmedEmad-0x3omda";
export const YOUTUBE_CHANNEL_ID = "UCb9u196eayC3vO9hDqr2ruA";

export type BlogYoutubeVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
};

export type FeaturedYoutubeVideo = {
  videoId: string;
  title: string;
  sourceUrl: string;
};

export type BlogYoutubePlaylist = {
  playlistId: string;
  title: string;
  sourceUrl: string;
};

export const homeSummaryParagraph =
  "Computer Science student and SOC/IR analyst with 10+ trainings and 200+ simulated alerts. Strong in SIEM/EDR investigations, alert triage, IOC analysis, and incident response.";

export const aboutSummaryParagraph =
  "SOC and Incident Response analyst with hands-on experience from 10+ trainings and 200+ simulated alerts. Focused on SIEM/EDR investigations, alert triage, IOC analysis, and faster incident handling.";

export const blogYoutubeVideos: BlogYoutubeVideo[] = [
  {
    videoId: "UNlJszq1Xso",
    title: "Session Online 1 Part 1",
    publishedAt: "2025-12-02",
  },
  {
    videoId: "pWkodhNwQy8",
    title: "StegCracker شرح بسيط",
    publishedAt: "2025-12-02",
  },
  {
    videoId: "dsK-w6G5zdw",
    title: "Session Online 1 Part 2",
    publishedAt: "2025-12-02",
  },
  {
    videoId: "tNH1cBceYwY",
    title: "Session 2 Online",
    publishedAt: "2025-12-02",
  },
  {
    videoId: "256UCPWbSqM",
    title: "StegHide شرح بسيط",
    publishedAt: "2025-12-02",
  },
  {
    videoId: "GwPbuYulV1U",
    title: "Configuring and Testing Wazuh With Sysmon",
    publishedAt: "2025-11-28",
  },
];

export const blogFeaturedYoutubeVideo: FeaturedYoutubeVideo = {
  videoId: "orw_kiHZvhU",
  title: "Featured Video",
  sourceUrl: "https://youtu.be/orw_kiHZvhU?si=0D4Ri-NSCzCB-Bg_",
};

export const blogYoutubePlaylists: BlogYoutubePlaylist[] = [
  {
    playlistId: "PLO1VSSKnwZUgbiE0ev1TUr5wPI9kxxbgL",
    title: "Wazuh.",
    sourceUrl:
      "https://youtube.com/playlist?list=PLO1VSSKnwZUgbiE0ev1TUr5wPI9kxxbgL&si=nVzc9L5Kmxhlc1Rc",
  },
  {
    playlistId: "PLO1VSSKnwZUgdrITjagQD0mikt6Xk64yX",
    title: "Wazuh Threat Emulation",
    sourceUrl:
      "https://youtube.com/playlist?list=PLO1VSSKnwZUgdrITjagQD0mikt6Xk64yX&si=ANb4u1blPp4gyc5F",
  },
];

export const knowledgeEducationItems = [
  {
    tag: "Incident Response Analyst Intern",
    subTag: "Digital Egypt Pioneers Initiative (DEPI)",
    subTagHyperlink: "https://www.depi.gov.eg/",
    desc: "Completed a 6-month DEPI training program, performing hands-on Incident Response across the full IR lifecycle (labs and projects). • Built and tuned a SIEM environment using ELK, Wazuh, and Suricata, reducing false-positive alerts by 9% and improving alert quality.",
    isRight: true,
    startDate: "2026-01-01",
    showDate: true,
    skills: ["Incident Response", "Wazuh", "ELK", "Suricata"],
    certificateUrl: "https://www.depi.gov.eg/",
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
    skills: ["SOC Triage", "YARA", "VirusTotal", "Detection Engineering"],
    certificateUrl: "https://www.depi.gov.eg/",
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
    skills: ["Security Training", "Curriculum Design", "Mentoring"],
    certificateUrl: "https://gdg.community.dev/",
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
    skills: ["DFIR", "Information Security", "CTF", "Digital Forensics"],
    certificateUrl: "https://www.bu.edu.eg/",
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
    skills: ["VAPT", "Web Security", "Exploitation", "Reporting"],
    certificateUrl: "https://cybertalents.com/",
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
    skills: ["SOC Simulation", "Alert Correlation", "Incident Triage"],
    certificateUrl: "https://www.iti.gov.eg/",
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
    skills: ["Cybersecurity Fundamentals", "Network Security", "Labs"],
    certificateUrl: "https://cybertalents.com/",
  },
  {
    tag: "HCIA-Cloud Computing V5.0",
    subTag: "Huawei ICT Academy",
    subTagHyperlink: "https://www.huawei.com/minisite/ict-academy/en/",
    desc: "Built cloud network setups and configured infrastructure, applying cloud security principles. • Deployed and secured 5+ cloud environments, reducing misconfiguration risks by 20%.",
    isRight: false,
    startDate: "2024-08-01",
    endDate: "2024-09-01",
    showDate: true,
    skills: ["Cloud Security", "Cloud Networking", "Platform Hardening"],
    certificateUrl: "https://www.huawei.com/minisite/ict-academy/en/",
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
    skills: ["Routing", "Switching", "Network Troubleshooting"],
    certificateUrl: "https://www.huawei.com/",
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
    title: "Work Preferences",
    description:
      "Based in Cairo, Egypt • Open to relocation and remote collaborations • Available for project-based engagements and long-term opportunities • Preferred communication: Email, LinkedIn, and WhatsApp",
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

export const trustTestimonials = [
  {
    quote: "Ahmed helped us reduce noisy detections and made our SOC triage flow much clearer.",
    role: "Blue Team Lead",
    context: "SOC Alert Tuning Sprint",
  },
  {
    quote: "Sessions were practical and structured. Our team improved lab outcomes in a short time.",
    role: "Training Coordinator",
    context: "Security Training Program",
  },
  {
    quote: "Strong investigation mindset with clear reporting and actionable recommendations.",
    role: "Incident Response Mentor",
    context: "DFIR Mentorship",
  },
] as const;

export const projectResponseSla: Record<string, string> = {
  "SOC monitoring support": "Replies in 2-6 hours during Cairo business hours.",
  "Incident response assistance": "Urgent triage reply in 1-3 hours.",
  "Threat hunting engagement": "Replies in 4-8 hours with a scope checklist.",
  "Security training workshop": "Replies within 24 hours with session options.",
  "General consultation": "Replies within 24 hours.",
};

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

export const contactProjectOptions = [
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

export const faqItems = [
  {
    category: "Engagement",
    q: "How quickly can a project start?",
    a: "Most scopes can start within 24-48 hours after confirming access, goals, and communication flow.",
  },
  {
    category: "Engagement",
    q: "Do you work with existing SIEM/EDR deployments?",
    a: "Yes. I can tune and optimize existing Wazuh, ELK, and Splunk setups without requiring a full rebuild.",
  },
  {
    category: "Delivery",
    q: "Is remote collaboration supported?",
    a: "Yes. Delivery is remote-first with structured updates, clear milestones, and documented outcomes.",
  },
  {
    category: "Pricing",
    q: "How is pricing structured?",
    a: "Each project has a starting price, and final scope is based on complexity, timeline, and expected deliverables.",
  },
  {
    category: "Process",
    q: "What do clients receive at the end of an engagement?",
    a: "You receive a concise report, prioritized action items, and practical technical outputs that your team can use immediately.",
  },
  {
    category: "Support",
    q: "Do you provide follow-up after delivery?",
    a: "Yes. Follow-up guidance is available to help with implementation, tuning, and clarification.",
  },
] as const;

export const caseStudyHighlights = [
  {
    title: "SOC Alert Tuning Sprint",
    domain: "SOC Analysis",
    problem:
      "Alert overload made daily triage noisy and delayed response to high-priority events.",
    action:
      "Mapped noisy detections, tuned correlation logic, and introduced severity-first triage flow.",
    result:
      "Reduced false positives by 25% in lab SOC operations and improved investigation focus.",
  },
  {
    title: "Threat Hunting Detection Pack",
    domain: "Threat Hunting",
    problem:
      "Detection coverage had blind spots for stealthy behaviors not captured by baseline rules.",
    action:
      "Built hypothesis-driven hunt queries and validated signatures against expected telemetry.",
    result:
      "Increased practical detection coverage and improved analyst confidence in hunt outcomes.",
  },
  {
    title: "Malware Analysis Workflow",
    domain: "DFIR",
    problem:
      "Malware investigations took too long due to inconsistent IOC extraction and reporting.",
    action:
      "Created a controlled analysis flow with IOC packaging and behavior mapping templates.",
    result:
      "Cut investigation time by 20% and improved containment readiness for follow-up actions.",
  },
  {
    title: "Security Training Program",
    domain: "Awareness",
    problem:
      "Teams needed practical security skills beyond theoretical knowledge.",
    action:
      "Delivered 35+ structured sessions with guided labs and measurable skill checkpoints.",
    result:
      "Reached 120+ learners, average feedback 4.9/5, and improved lab performance by 40%.",
  },
] as const;

export const caseEvidenceLibrary = [
  {
    id: "soc-env-pdf",
    title: "SOC Environment Report",
    platform: "Lab Build",
    type: "PDF Report",
    href: "Assets/Cases/SOC Enviroment.pdf",
  },
  {
    id: "vt-integration-pdf",
    title: "VirusTotal Integration Report",
    platform: "Lab Build",
    type: "PDF Report",
    href: "Assets/Cases/Virus Total Integration.pdf",
  },
  {
    id: "soc127-pdf",
    title: "SOC127 Incident Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC127/AhmedEmad_SOC127.pdf",
  },
  {
    id: "soc205-pdf",
    title: "SOC205 Incident Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC205/AhmedEmad_SOC205.pdf",
  },
  {
    id: "soc257-pdf",
    title: "SOC257 Incident Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC257/AhmedEmad_SOC257.pdf",
  },
  {
    id: "soc274-pdf",
    title: "SOC274 Incident Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC274/AhmedEmad_SOC274.pdf",
  },
  {
    id: "soc282-pdf",
    title: "SOC282 Incident Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC282/AhmedEmad_SOC282.pdf",
  },
  {
    id: "soc326-report",
    title: "SOC326 Incident Response Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC326/AhmedEmad_SOC326.pdf",
  },
  {
    id: "soc336-report",
    title: "SOC336 Incident Response Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC336/AhmedEmad_SOC336.pdf",
  },
  {
    id: "soc338-pdf",
    title: "SOC338 Incident Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC338/AhmedEmad_SOC338.pdf",
  },
  {
    id: "soc342-pdf",
    title: "SOC342 Incident Report",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    href: "Assets/Cases/SOC342/AhmedEmad_SOC342.pdf",
  },
  {
    id: "ass1-awareness",
    title: "Cybersecurity Awareness Best Practices",
    platform: "Security Training",
    type: "PDF Guide",
    href: "Assets/Cases/Ass_1/AhmedEmad_Cybersecurity_Awareness_Best_Practices.pdf",
  },
  {
    id: "ass2-assessment",
    title: "Assessment Write-up",
    platform: "Security Simulation",
    type: "PDF Report",
    href: "Assets/Cases/Ass_2/Ahmed_Emad_Eldeen_P5432.pdf",
  },
  {
    id: "ass3-exploit",
    title: "Exploit Analysis Assignment",
    platform: "Security Simulation",
    type: "PDF Report",
    href: "Assets/Cases/Ass_3/Ahmed_Emad_Eldeen_P5432-exploit.pdf",
  },
  {
    id: "ass6-mitre",
    title: "MITRE Mapping Assignment",
    platform: "Blue Team Simulation",
    type: "PDF Report",
    href: "Assets/Cases/ass_6/AhmedEmad_MITRE_Report.pdf",
  },
  {
    id: "unload-malware-report",
    title: "Unload Malware Analysis Report",
    platform: "Blue Team Simulation",
    type: "PDF Report",
    href: "Assets/Cases/Unload_Malware/AhmedEmad_Unload_Malware_Report.pdf",
  },
] as const;

export const staticProjectFallback = [
  {
    id: 90001,
    name: "SOC-Environment",
    description: "SOC stack with Wazuh, Suricata, and pfSense for detection automation and triage workflows.",
    language: "Python",
    html_url: "https://github.com/Ahmed-Emad-Nasr/SOC-Environment",
    homepage: null,
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-03-01T00:00:00.000Z",
    created_at: "2025-01-01T00:00:00.000Z",
    owner: {
      login: "Ahmed-Emad-Nasr",
      avatar_url: "",
    },
    topics: ["soc", "wazuh", "suricata", "siem"],
    default_branch: "main",
    watchers_count: 0,
    license: null,
  },
  {
    id: 90002,
    name: "Malware-Analysis-and-Prevention-Strategy",
    description: "Isolated malware lab with YARA-based detection and IOC extraction workflow.",
    language: "Python",
    html_url: "https://github.com/Ahmed-Emad-Nasr/Malware-Analysis-and-Prevention-Strategy",
    homepage: null,
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-02-15T00:00:00.000Z",
    created_at: "2025-02-01T00:00:00.000Z",
    owner: {
      login: "Ahmed-Emad-Nasr",
      avatar_url: "",
    },
    topics: ["dfir", "malware", "ioc", "yara"],
    default_branch: "main",
    watchers_count: 0,
    license: null,
  },
  {
    id: 90003,
    name: "insider-threat-detection-deception",
    description: "Insider threat detection environment using honeytokens and SIEM correlation.",
    language: "TypeScript",
    html_url: "https://github.com/Ahmed-Emad-Nasr/insider-threat-detection-deception",
    homepage: null,
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-01-20T00:00:00.000Z",
    created_at: "2025-03-01T00:00:00.000Z",
    owner: {
      login: "Ahmed-Emad-Nasr",
      avatar_url: "",
    },
    topics: ["soc", "deception", "incident-response"],
    default_branch: "main",
    watchers_count: 0,
    license: null,
  },
] as const;
