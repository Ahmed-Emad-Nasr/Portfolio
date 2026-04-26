
/*
 * File: data.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Central static content for sections (timeline entries and about cards)
 */

export const GITHUB_USERNAME = "Ahmed-Emad-Nasr";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AhmedEmad-0x3omda";

type BlogYoutubeVideo = {
  videoId: string;
  title: string;
  description?: string;
  publishedAt: string;
  tags?: readonly string[];
};

type FeaturedYoutubeVideo = {
  videoId: string;
  title: string;
  description?: string;
  sourceUrl: string;
};

type BlogYoutubePlaylist = {
  playlistId: string;
  title: string;
  description?: string;
  sourceUrl: string;
  tags?: readonly string[];
  videoCount?: number;
};

// ─── New Enhanced Types ───────────────────────────────────────────────────────
export type SkillCategory = "SIEM & Monitoring" | "Incident Response" | "Threat Detection" | "Automation & Programming" | "Cloud & Infrastructure";

 export type Skill = {
  name: string;
  category: SkillCategory;
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  icon?: string;
  relatedTools?: readonly string[];
  yearsExperience?: number;
};

export type Stat = {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  category?: "Impact" | "Performance" | "Achievement" | "Engagement";
  trend?: "up" | "down" | "stable";
};

export const homeSummaryParagraph =
  "Computer Science student and SOC/IR analyst with 10+ trainings and 200+ simulated alerts. Strong in SIEM/EDR investigations, alert triage, IOC analysis, and incident response.";

export const blogYoutubeVideos: BlogYoutubeVideo[] = [
  {
    videoId: "UNlJszq1Xso",
    title: "Session Online 1 Part 1",
    description: "First online session covering foundational security concepts and live demonstrations.",
    publishedAt: "2025-12-02",
    tags: ["Training", "Live Session", "Security Fundamentals"],
  },
  {
    videoId: "pWkodhNwQy8",
    title: "StegCracker شرح بسيط",
    description: "Simple explanation of StegCracker tool for steganography analysis.",
    publishedAt: "2025-12-02",
    tags: ["Steganography", "Tools", "Tutorial"],
  },
  {
    videoId: "dsK-w6G5zdw",
    title: "Session Online 1 Part 2",
    publishedAt: "2025-12-02",
    tags: ["Training", "Live Session", "Advanced Topics"],
  },
  {
    videoId: "tNH1cBceYwY",
    title: "Session 2 Online",
    description: "Second comprehensive online training session.",
    publishedAt: "2025-12-02",
    tags: ["Training", "Live Session"],
  },
  {
    videoId: "256UCPWbSqM",
    title: "StegHide شرح بسيط",
    description: "Tutorial on StegHide tool for digital steganography.",
    publishedAt: "2025-12-02",
    tags: ["Steganography", "Tools", "Tutorial"],
  },
  {
    videoId: "GwPbuYulV1U",
    title: "Configuring and Testing Wazuh With Sysmon",
    description: "Complete guide to integrating Wazuh SIEM with Sysmon for enhanced threat detection.",
    publishedAt: "2025-11-28",
    tags: ["Wazuh", "SIEM", "Sysmon", "Configuration", "Detection"],
  },
];

export const blogFeaturedYoutubeVideo: FeaturedYoutubeVideo = {
  videoId: "orw_kiHZvhU",
  title: "Featured Video",
  description: "Watch our featured security tutorial and learn key techniques.",
  sourceUrl: "https://youtu.be/orw_kiHZvhU?si=0D4Ri-NSCzCB-Bg_",
};

export const blogYoutubePlaylists: BlogYoutubePlaylist[] = [
  {
    playlistId: "PLO1VSSKnwZUgbiE0ev1TUr5wPI9kxxbgL",
    title: "Wazuh",
    description: "Complete Wazuh SIEM setup, configuration, and operation tutorials for SOC environments.",
    sourceUrl:
      "https://youtube.com/playlist?list=PLO1VSSKnwZUgbiE0ev1TUr5wPI9kxxbgL&si=nVzc9L5Kmxhlc1Rc",
    tags: ["SIEM", "Wazuh", "Security", "Configuration"],
    videoCount: 12,
  },
  {
    playlistId: "PLO1VSSKnwZUgdrITjagQD0mikt6Xk64yX",
    title: "Wazuh Threat Emulation",
    description: "Threat emulation and attack simulation using Wazuh for advanced security testing.",
    sourceUrl:
      "https://youtube.com/playlist?list=PLO1VSSKnwZUgdrITjagQD0mikt6Xk64yX&si=ANb4u1blPp4gyc5F",
    tags: ["Threat Emulation", "Wazuh", "Testing", "Red Team"],
    videoCount: 8,
  },
  {
    playlistId: "PLO1VSSKnwZUgGaiDZXU-mKuh8CUZx-gAd",
    title: "Malware Analysis", // ⚠️ اكتب اسم البلاي ليست بتاعتك
    description: "A complete walkthrough of my malware analysis project. This series covers the step-by-step methodology, safe environment setup, and the practical use of industry-standard tools for both static and dynamic analysis.", // ⚠️ اكتب وصف قصير
    sourceUrl: "https://youtube.com/playlist?list=PLO1VSSKnwZUgGaiDZXU-mKuh8CUZx-gAd",
    tags: ["SOC", "DFIR", "Cybersecurity"], // ⚠️ تقدر تعدل الكلمات المفتاحية
    videoCount: 5 // ⚠️ اكتب عدد الفيديوهات التقريبي
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

// ─── Enhanced Skills Catalog ──────────────────────────────────────────────────
export const enhancedSkills: readonly Skill[] = [
  // SIEM & Monitoring
  { name: "Wazuh", category: "SIEM & Monitoring", proficiency: "Advanced", icon: "fa-circle-check", yearsExperience: 2 },
  { name: "ELK Stack", category: "SIEM & Monitoring", proficiency: "Advanced", icon: "fa-circle-check", yearsExperience: 2 },
  { name: "Splunk", category: "SIEM & Monitoring", proficiency: "Intermediate", icon: "fa-circle-check", yearsExperience: 1 },
  { name: "Suricata", category: "SIEM & Monitoring", proficiency: "Advanced", icon: "fa-circle-check", yearsExperience: 2 },
  { name: "Sysmon", category: "SIEM & Monitoring", proficiency: "Advanced", icon: "fa-circle-check", yearsExperience: 2 },
  
  // Incident Response
  { name: "MITRE ATT&CK", category: "Incident Response", proficiency: "Advanced", icon: "fa-circle-check", yearsExperience: 2 },
  { name: "Alert Triage", category: "Incident Response", proficiency: "Expert", icon: "fa-shield-check", yearsExperience: 2 },
  { name: "Incident Handling", category: "Incident Response", proficiency: "Advanced", icon: "fa-circle-check", yearsExperience: 2 },
  
  // Threat Detection
  { name: "YARA", category: "Threat Detection", proficiency: "Intermediate", icon: "fa-circle-check", yearsExperience: 1 },
  { name: "IOC Analysis", category: "Threat Detection", proficiency: "Advanced", icon: "fa-circle-check", yearsExperience: 2 },
  { name: "Malware Analysis", category: "Threat Detection", proficiency: "Intermediate", icon: "fa-circle-check", yearsExperience: 1 },
  { name: "Threat Hunting", category: "Threat Detection", proficiency: "Intermediate", icon: "fa-circle-check", yearsExperience: 1 },
  
  // Programming & Automation
  { name: "Python", category: "Automation & Programming", proficiency: "Advanced", icon: "fa-code", yearsExperience: 2 },
  { name: "PowerShell", category: "Automation & Programming", proficiency: "Advanced", icon: "fa-code", yearsExperience: 2 },
  { name: "Bash", category: "Automation & Programming", proficiency: "Intermediate", icon: "fa-code", yearsExperience: 2 },
  { name: "TypeScript", category: "Automation & Programming", proficiency: "Intermediate", icon: "fa-code", yearsExperience: 1 },
  { name: "JavaScript", category: "Automation & Programming", proficiency: "Intermediate", icon: "fa-code", yearsExperience: 1 },
  
  // Cloud & Infrastructure
  { name: "Cloud Security", category: "Cloud & Infrastructure", proficiency: "Intermediate", icon: "fa-cloud", yearsExperience: 1 },
  { name: "Network Security", category: "Cloud & Infrastructure", proficiency: "Intermediate", icon: "fa-network-wired", yearsExperience: 2 },
  { name: "pfSense", category: "Cloud & Infrastructure", proficiency: "Intermediate", icon: "fa-network-wired", yearsExperience: 1 },
] as const;

// ─── Enhanced Stats ───────────────────────────────────────────────────────
export const enhancedStats: readonly Stat[] = [
  { value: "8k+", label: "LinkedIn Followers", category: "Engagement", icon: "fa-users", trend: "up" },
  { value: "200+", label: "Simulated SOC Alerts Investigated", category: "Impact", icon: "fa-bell", trend: "up" },
  { value: "35+", label: "Cybersecurity Sessions Delivered", category: "Impact", icon: "fa-chalkboard-user", trend: "up" },
  { value: "120+", label: "Learners Trained in Security Topics", category: "Engagement", icon: "fa-graduation-cap", trend: "up" },
  { value: "10+", label: "SOC / DFIR Trainings & Bootcamps", category: "Achievement", icon: "fa-book", trend: "stable" },
  { value: "15+", label: "Validated Vulnerabilities in Labs", category: "Performance", icon: "fa-bug", trend: "up" },
  { value: "4.9/5", label: "Average Training Feedback Score", category: "Performance", icon: "fa-star", trend: "stable" },
  { value: "Top 5/360", label: "National University CTF Ranking", category: "Achievement", icon: "fa-trophy", trend: "stable" },
  { value: "Top 10%", label: "Class Rank (InfoSec & DFIR)", category: "Achievement", icon: "fa-crown", trend: "stable" },
  { value: "3.7/4.0", label: "Computer Science GPA", category: "Achievement", icon: "fa-graduation-cap", trend: "stable" },
  { value: "25%", label: "False Positive Reduction", category: "Performance", icon: "fa-arrow-down", trend: "down" },
  { value: "20%", label: "Investigation Time Improvement", category: "Performance", icon: "fa-hourglass-end", trend: "down" },
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
  {
    title: "Email Analysis Room Investigation",
    domain: "Email Security",
    problem:
      "Suspicious inbound email activity required structured triage to quickly separate malicious messages from false alarms.",
    action:
      "Performed header and sender analysis, inspected embedded links and attachments, and documented indicators with a repeatable workflow.",
    result:
      "Improved phishing triage consistency and reduced investigation back-and-forth by using a clear evidence-based playbook.",
  },
  {
    title: "BruteForce Room Investigation",
    domain: "SOC Analysis",
    problem:
      "Authentication alerts indicated repeated login attempts, but source patterns and impact scope were not yet clear.",
    action:
      "Correlated failed authentication events, validated brute-force indicators, and documented escalation steps with timeline evidence.",
    result:
      "Improved brute-force triage speed and reporting quality with a repeatable investigation workflow.",
  },
] as const;

export const caseEvidenceLibrary = [
            {
              id: "soc-env-depi-r3-project",
              title: "SOC Enviroment DEPI R3 Project",
              description: "SOC environment build and configuration for DEPI R3, including SIEM, FIM, and custom dashboards.",
              platform: "DEPI R3",
              type: "PDF Report",
              category: "SOC",
              difficulty: "Hard",
              href: "Assets/Cases/SOC Enviroment DEPI R3 Project/SOC Enviroment.pdf",
              tags: ["SOC", "SIEM", "FIM", "Dashboard", "DEPI"],
              tools: ["Wazuh", "SIEM", "FIM", "Dashboard"],
              skillsGained: ["SOC Build", "SIEM Configuration", "FIM", "Dashboarding"],
              readTime: 16,
              date: "2026-04-20",
              screenshots: [
                "Assets/Cases/SOC Enviroment DEPI R3 Project/1.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/2.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/3.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/4.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/5.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/6.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/7.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/8.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/9.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/create txt file to see if fim is working.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/CustomDashboard1.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/CustomDashboard2.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/edit ossec on win.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/enable fim to folder ahmed.png",
                "Assets/Cases/SOC Enviroment DEPI R3 Project/it works and event appeard .png"
              ],
              image: "Assets/Cases/SOC Enviroment DEPI R3 Project/1.png",
            },
      {
        id: "hidden-backdoor-report",
        title: "Hidden Backdoor Case Study",
        description: "Detection and analysis of a hidden backdoor in a simulated environment, including investigation steps and mitigation.",
        platform: "Blue Team Simulation",
        type: "DOCX & PDF Report",
        category: "Malware Analysis",
        difficulty: "Hard",
        href: "Assets/Cases/Hidden Backdoor/AhmedEmad_HiddenBackdoor.pdf",
        tags: ["Backdoor", "Persistence", "Malware", "Detection"],
        tools: ["Forensics", "SIEM", "Malware Analysis"],
        skillsGained: ["Backdoor Detection", "Persistence Analysis", "Incident Response"],
        readTime: 20,
        date: "2026-04-18",
        screenshots: [
          ...Array.from({ length: 25 }, (_, i) => `Assets/Cases/Hidden Backdoor/Screenshot (${50 + i}).png`),
        ],
        image: "Assets/Cases/Hidden Backdoor/Screenshot (50).png",
      },
      // Depi r4 Project
      {
        id: "depi-r4-project",
        title: "Depi R4 Project",
        description: "Malware analysis and prevention strategy project for DEPI R4, including detection, analysis, and reporting.",
        platform: "DEPI R4",
        type: "DOCX & PDF Report",
        category: "Malware Analysis",
        difficulty: "Hard",
        href: "Assets/Cases/Depi R4 Project/AhmedEmad_MalwareAnalysis_And_Prevention_Strategy.pdf",
        tags: ["Malware", "Prevention", "Analysis", "DEPI"],
        tools: ["Malware Analysis", "Prevention", "Reporting"],
        skillsGained: ["Malware Analysis", "Prevention Strategy", "Reporting"],
        readTime: 18,
        date: "2026-04-20",
        screenshots: [
          "Assets/Cases/Depi R4 Project/Gemini_Generated_Image_2puztk2puztk2puz.png",
          "Assets/Cases/Depi R4 Project/Gemini_Generated_Image_sz9r8zsz9r8zsz9r (1).png"
        ],
        image: "Assets/Cases/Depi R4 Project/Gemini_Generated_Image_2puztk2puztk2puz.png",
      },
    // WannaCry always first (featured)
    {
      id: "malware-analysis-wannacry",
      title: "WannaCry Ransomware Analysis & Response",
      description: "In-depth analysis and incident response for WannaCry ransomware infection, including detection, containment, and recovery steps.",
      platform: "Lab Simulation",
      type: "DOCX & PDF Report",
      category: "Malware Analysis",
      difficulty: "Hard",
      href: "Assets/Cases/Malware Analysis and Prevention Strategy/AhmedEmad_WannaCry.pdf",
      tags: ["WannaCry", "Ransomware", "Malware", "Incident Response"],
      tools: ["YARA", "SIEM", "Static Analysis", "Dynamic Analysis"],
      skillsGained: ["Malware Analysis", "Ransomware Response", "IOC Extraction"],
      readTime: 24,
      date: "2026-03-01",
      screenshots: [
        // 1.png to 38.png
        ...Array.from({length: 38}, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/${i+1}.png`),
        // Screenshot (343).png to Screenshot (366).png
        ...Array.from({length: 24}, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/Screenshot (${343+i}).png`),
      ],
      image: "Assets/Cases/Malware Analysis and Prevention Strategy/ 21.png",
    },
    {
    id: "aws-guardduty-setup",
    title: "Amazon GuardDuty Threat Detection",
    description: "Enabled Amazon GuardDuty, generated sample findings, and analyzed high-severity threat detections including unauthorized S3 access.",
    platform: "AWS Lab",
    type: "Write-up",
    category: "Cloud Security",
    difficulty: "Hard",
    href: "Assets/Cases/Amazon GuardDuty/Amazon_GuardDuty.pdf", // اتأكد إنك تعمل ملف PDF وتسميه كده
    tags: ["AWS", "GuardDuty", "Threat Detection", "Security Monitoring"],
    tools: ["Amazon GuardDuty", "AWS Console"],
    skillsGained: ["Continuous Monitoring", "Alert Triage", "Cloud Threat Detection"],
    readTime: 8,
    date: "2026-04-24",
    screenshots: [
      "Assets/Cases/AWS-GaurdDuty/1.png", 
    ],
    image: "Assets/Cases/AWS-GaurdDuty/1.png",
  },
{
    id: "aws-kms-security",
    title: "AWS Cryptographic Key Management (KMS)",
    description: "Configured Customer Managed Keys (CMK) and analyzed External Key Store (XKS) integration constraints via SCP troubleshooting.",
    platform: "AWS Lab",
    type: "Write-up",
    category: "Cloud Security",
    difficulty: "Medium",
    href: "Assets/Cases/AWS KMS/AWS KMS.pdf",
    tags: ["AWS KMS", "Encryption", "IAM Policies", "Troubleshooting"],
    tools: ["AWS KMS", "AWS IAM", "AWS Organizations (SCP)"],
    skillsGained: ["Cryptographic Key Lifecycle", "IAM Policy Configuration", "SCP Explicit Deny Analysis"],
    readTime: 12,
    date: "2026-04-24",
    screenshots: [
      "Assets/Cases/AWS KMS/1.png",
    ],
    image: "Assets/Cases/AWS KMS/1.png",
  },
 {
    id: "aws-athena-healthcare",
    title: "AWS Healthcare Data Pipeline",
    description: "Serverless data ingestion and querying setup for healthcare data using Amazon S3 and Amazon Athena.",
    platform: "AWS Lab",
    type: "Write-up",
    category: "Cloud Infrastructure",
    difficulty: "Easy",
    // يفضل تعمل فولدر باسم الـ Case وتحط جواه الـ PDF والصور عشان التنظيم
    href: "Assets/Cases/Amazon S3 and Amazon Athena/Amazon S3 and Amazon Athena.pdf", 
    tags: ["AWS", "Data Pipeline", "Cloud Security"],
    tools: ["Amazon S3", "Amazon Athena", "SQL"],
    skillsGained: ["Cloud Storage Management", "Data Cataloging", "Serverless Querying"],
    readTime: 10,
    date: "2026-04-23",
    // ضفتلك الجزء الخاص بالصور عشان يطابق باقي الـ cases
    screenshots: [
      "Assets/Cases/Amazon S3 and Amazon Athena/16.png", 
    ],
    image: "Assets/Cases/Amazon S3 and Amazon Athena/16.png",
  },
  {
    id: "soc-env-pdf",
    title: "SOC Environment Report",
    description: "Complete SOC stack configuration with SIEM, EDR, and network monitoring setup.",
    platform: "Lab Build",
    type: "PDF Report",
    category: "SOC",
    difficulty: "Medium",
    href: "Assets/Cases/SOC Enviroment.pdf",
    tags: ["SIEM", "Configuration", "Blue Team"],
    tools: ["Wazuh", "Suricata", "pfSense"],
    skillsGained: ["SOC Architecture", "SIEM Setup"],
    readTime: 15,
    date: "2025-12-01",
  },
  {
    id: "vt-integration-pdf",
    title: "VirusTotal Integration Report",
    description: "Integration of VirusTotal API with SIEM for malware intelligence and enrichment.",
    platform: "Lab Build",
    type: "PDF Report",
    category: "Threat Intelligence",
    difficulty: "Medium",
    href: "Assets/Cases/Virus Total Integration.pdf",
    tags: ["Threat Intel", "Automation", "API"],
    tools: ["VirusTotal", "API Integration"],
    skillsGained: ["Threat Enrichment", "Integration"],
    readTime: 12,
    date: "2025-12-01",
  },
  {
    id: "soc127-pdf",
    title: "SOC127 Incident Report",
    description: "Incident response case study covering alert triage, threat analysis, and containment.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Incident Response",
    difficulty: "Medium",
    href: "Assets/Cases/SOC127/AhmedEmad_SOC127.pdf",
    tags: ["Alert Triage", "Investigation", "Containment"],
    tools: ["SIEM", "Web Server"],
    skillsGained: ["Alert Analysis", "Incident Handling"],
    readTime: 18,
    date: "2025-11-15",
  },
  {
    id: "soc205-pdf",
    title: "SOC205 Incident Report",
    description: "Advanced threat detection and investigation of suspicious network activity patterns.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Incident Response",
    difficulty: "Medium",
    href: "Assets/Cases/SOC205/AhmedEmad_SOC205.pdf",
    tags: ["Threat Detection", "Network Analysis", "Investigation"],
    tools: ["SIEM", "Network Monitoring"],
    skillsGained: ["Threat Hunting", "Network Forensics"],
    readTime: 20,
    date: "2025-11-10",
  },
  {
    id: "soc257-pdf",
    title: "SOC257 Incident Report",
    description: "Malware distribution incident investigation with IoC extraction and analysis.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Malware Analysis",
    difficulty: "Hard",
    href: "Assets/Cases/SOC257/AhmedEmad_SOC257.pdf",
    tags: ["Malware", "IoC", "Distribution"],
    tools: ["Malware Analysis", "SIEM"],
    skillsGained: ["Malware Investigation", "IoC Analysis"],
    readTime: 25,
    date: "2025-11-05",
  },
  {
    id: "soc274-pdf",
    title: "SOC274 Incident Report",
    description: "Lateral movement detection and containment strategies in compromised environments.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Incident Response",
    difficulty: "Hard",
    href: "Assets/Cases/SOC274/AhmedEmad_SOC274.pdf",
    tags: ["Lateral Movement", "Containment", "Defense"],
    tools: ["EDR", "SIEM"],
    skillsGained: ["Attack Pattern Detection", "Containment"],
    readTime: 22,
    date: "2025-10-28",
  },
  {
    id: "soc282-pdf",
    title: "SOC282 Incident Report",
    description: "Data exfiltration detection and prevention with DLP strategy implementation.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Data Security",
    difficulty: "Hard",
    href: "Assets/Cases/SOC282/AhmedEmad_SOC282.pdf",
    tags: ["Exfiltration", "Data Protection", "DLP"],
    tools: ["DLP", "SIEM", "Network Monitoring"],
    skillsGained: ["Data Loss Prevention", "Exfiltration Detection"],
    readTime: 24,
    date: "2025-10-22",
  },
  {
    id: "soc326-report",
    title: "SOC326 Incident Response Report",
    description: "Complete incident response lifecycle from detection to containment and recovery.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Incident Response",
    difficulty: "Hard",
    href: "Assets/Cases/SOC326/AhmedEmad_SOC326.pdf",
    tags: ["IR Lifecycle", "Recovery", "Post-Incident"],
    tools: ["SIEM", "Forensics", "EDR"],
    skillsGained: ["Full IR Process", "Recovery Planning"],
    readTime: 28,
    date: "2025-10-15",
  },
  {
    id: "soc336-report",
    title: "SOC336 Incident Response Report",
    description: "Advanced persistence threat investigation and eradication strategies.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Incident Response",
    difficulty: "Hard",
    href: "Assets/Cases/SOC336/AhmedEmad_SOC336.pdf",
    tags: ["APT", "Persistence", "Eradication"],
    tools: ["SIEM", "Forensics", "Threat Intel"],
    skillsGained: ["APT Investigation", "Persistence Techniques"],
    readTime: 30,
    date: "2025-10-08",
  },
  {
    id: "soc338-pdf",
    title: "SOC338 Incident Report",
    description: "Web application attack investigation and exploitation analysis.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Web Security",
    difficulty: "Medium",
    href: "Assets/Cases/SOC338/AhmedEmad_SOC338.pdf",
    tags: ["Web Attack", "Application", "Exploitation"],
    tools: ["Web Analysis", "Payload Analysis"],
    skillsGained: ["Web Security", "Attack Analysis"],
    readTime: 19,
    date: "2025-10-01",
  },
  {
    id: "soc342-pdf",
    title: "SOC342 Incident Report",
    description: "Privilege escalation attack chain investigation and prevention.",
    platform: "LetsDefend Simulation",
    type: "PDF Report",
    category: "Incident Response",
    difficulty: "Hard",
    href: "Assets/Cases/SOC342/AhmedEmad_SOC342.pdf",
    tags: ["Privilege Escalation", "Attack Chain", "Defense"],
    tools: ["EDR", "SIEM"],
    skillsGained: ["Privilege Escalation Detection", "Defense Bypass"],
    readTime: 26,
    date: "2025-09-25",
  },
    {
      id: "serpent-stealer",
      title: "Serpent Stealer Case Study",
      description: "Analysis and investigation of the Serpent Stealer malware, including infection chain, behavior, and mitigation steps.",
      platform: "Blue Team Simulation",
      type: "DOCX & PDF Report",
      category: "Malware Analysis",
      difficulty: "Hard",
      href: "Assets/Cases/Serpent Stealer/AhmedEmad_Serpent stealer.pdf",
      tags: ["Serpent Stealer", "Malware", "Stealer", "Forensics"],
      tools: ["Forensics Toolkit", "Malware Analysis"],
      skillsGained: ["Stealer Analysis", "Malware Investigation", "Incident Response"],
      readTime: 19,
      date: "2026-04-21",
        screenshots: [
          "Assets/Cases/Serpent Stealer/Screenshot (1).png",
          "Assets/Cases/Serpent Stealer/Screenshot (2).png",
          "Assets/Cases/Serpent Stealer/Screenshot (3).png",
          "Assets/Cases/Serpent Stealer/Screenshot (4).png",
          "Assets/Cases/Serpent Stealer/Screenshot (5).png",
          "Assets/Cases/Serpent Stealer/Screenshot (6).png",
          "Assets/Cases/Serpent Stealer/Screenshot (7).png",
          "Assets/Cases/Serpent Stealer/Screenshot (8).png",
          "Assets/Cases/Serpent Stealer/Screenshot (9).png",
          "Assets/Cases/Serpent Stealer/Screenshot (10).png",
          "Assets/Cases/Serpent Stealer/Screenshot (11).png",
          "Assets/Cases/Serpent Stealer/Screenshot (12).png",
          "Assets/Cases/Serpent Stealer/Screenshot (13).png",
          "Assets/Cases/Serpent Stealer/Screenshot (14).png",
          "Assets/Cases/Serpent Stealer/Screenshot (15).png"
        ],
        image: "Assets/Cases/Serpent Stealer/Screenshot (1).png",
    },
  {
    id: "ass1-awareness",
    title: "Cybersecurity Awareness Best Practices",
    description: "Training guide on security awareness programs and user education fundamentals.",
    platform: "Security Training",
    type: "PDF Guide",
    category: "Training",
    difficulty: "Easy",
    href: "Assets/Cases/Ass_1/AhmedEmad_Cybersecurity_Awareness_Best_Practices.pdf",
    tags: ["Awareness", "Training", "Best Practices"],
    tools: ["Training Materials"],
    skillsGained: ["User Education", "Security Culture"],
    readTime: 10,
    date: "2025-09-20",
  },
  {
    id: "ass3-exploit",
    title: "Exploit Analysis Assignment",
    description: "Deep analysis of exploit techniques and vulnerability exploitation methods.",
    platform: "Security Simulation",
    type: "PDF Report",
    category: "Exploitation",
    difficulty: "Hard",
    href: "Assets/Cases/Ass_3/Ahmed_Emad_Eldeen_P5432-exploit.pdf",
    tags: ["Exploit", "Vulnerability", "Techniques"],
    tools: ["Exploitation Tools"],
    skillsGained: ["Exploit Analysis", "Vulnerability Understanding"],
    readTime: 23,
    date: "2025-09-10",
  },
  {
    id: "ass6-mitre",
    title: "MITRE Mapping Assignment",
    description: "MITRE ATT&CK framework mapping for attack technique classification and analysis.",
    platform: "Blue Team Simulation",
    type: "PDF Report",
    category: "Threat Analysis",
    difficulty: "Medium",
    href: "Assets/Cases/ass_6/AhmedEmad_MITRE_Report.pdf",
    tags: ["MITRE", "ATT&CK", "Framework"],
    tools: ["MITRE ATT&CK"],
    skillsGained: ["MITRE Mapping", "Threat Classification"],
    readTime: 17,
    date: "2025-09-05",
  },
  {
    id: "unload-malware-report",
    title: "Unload Malware Analysis Report",
    description: "Comprehensive malware analysis including behavioral analysis and IoC extraction.",
    platform: "Blue Team Simulation",
    type: "PDF Report",
    category: "Malware Analysis",
    difficulty: "Hard",
    href: "Assets/Cases/Unload_Malware/AhmedEmad_Unload_Malware_Report.pdf",
    tags: ["Malware", "Analysis", "Behavioral"],
    tools: ["Malware Lab", "Static Analysis", "Dynamic Analysis"],
    skillsGained: ["Malware Analysis", "Behavioral Understanding"],
    readTime: 27,
    date: "2025-08-28",
  },
  {
    id: "malware2-report",
    title: "Malware 2 Analysis Report",
    description: "Hands-on malware investigation covering static and dynamic analysis with IOC extraction and behavior mapping.",
    platform: "Blue Team Simulation",
    type: "PDF Report",
    category: "Malware Analysis",
    difficulty: "Hard",
    href: "Assets/Cases/Malware2/AhmedEmad_Malware2.pdf",
    tags: ["Malware", "Static Analysis", "Dynamic Analysis"],
    tools: ["Malware Lab", "Threat Intel", "Forensics"],
    skillsGained: ["IOC Extraction", "Malware Behavior Analysis"],
    readTime: 22,
    date: "2025-08-24",
  },
  {
    id: "email-analysis-room-report",
    title: "Email Analysis Room Report",
    description: "Email threat analysis including phishing detection, link analysis, and attachment inspection.",
    platform: "Blue Team Simulation",
    type: "PDF Report",
    category: "Email Security",
    difficulty: "Medium",
    href: "Assets/Cases/Email_Analysis_Room/AhmedEmad_EmailAnalysis_Room.pdf",
    tags: ["Email", "Phishing", "Threat Detection"],
    tools: ["Email Analysis", "Link Analysis"],
    skillsGained: ["Email Threat Detection", "Phishing Analysis"],
    readTime: 14,
    date: "2025-08-20",
  },
  {
    id: "bruteforce-room-report",
    title: "BruteForce Room Report",
    description: "Analysis of brute force attack patterns, detection, and mitigation strategies.",
    platform: "Blue Team Simulation",
    type: "PDF Report",
    category: "Access Security",
    difficulty: "Easy",
    href: "Assets/Cases/BruteForce_Room/AhmedEmad_BruteForce_Room.pdf",
    tags: ["Brute Force", "Authentication", "Defense"],
    tools: ["Log Analysis", "SIEM"],
    skillsGained: ["Brute Force Detection", "Access Protection"],
    readTime: 12,
    date: "2025-08-15",
  },
  {
    id: "malicious-web-traffic-room-report",
    title: "Malicious Web Traffic Room Report",
    description: "Investigation of malicious web traffic patterns with log correlation, IOC identification, and response recommendations.",
    platform: "Blue Team Simulation",
    type: "PDF Report",
    category: "Web Security",
    difficulty: "Medium",
    href: "Assets/Cases/MaliciousWebTraffic_Room/AhmedEmad_MaliciousWebTraffic.pdf",
    tags: ["Web Traffic", "Threat Detection", "IOC"],
    tools: ["Web Log Analysis", "SIEM"],
    skillsGained: ["Web Threat Analysis", "Traffic Investigation"],
    readTime: 16,
    date: "2025-08-12",
  },
  {
    id: "iti-network-project-report",
    title: "ITI Network Project Report",
    description: "Network security project report covering infrastructure design, hardening decisions, and monitoring recommendations.",
    platform: "ITI Project",
    type: "PDF Report",
    category: "Network Security",
    difficulty: "Medium",
    href: "Assets/Cases/ITI NEtwork Project/RootedAF_Report.pdf",
    tags: ["Network Security", "Infrastructure", "Monitoring"],
    tools: ["Network Analysis", "Hardening"],
    skillsGained: ["Network Defense", "Infrastructure Security"],
    readTime: 15,
    date: "2025-08-11",
  },
  {
    id: "wifi-cracking-walkthrough",
    title: "Wifi Cracking Walkthrough",
    description: "Step-by-step WiFi security assessment and cracking using real-world tools and techniques.",
    platform: "Security Simulation",
    type: "PDF Report",
    category: "Wireless Security",
    difficulty: "Medium",
    href: "Assets/Cases/Wifi Cracking/AhmedEmad_WifiCracker.pdf",
    tags: ["WiFi", "Cracking", "Security", "Assessment"],
    tools: ["Aircrack-ng", "Handshake Capture", "Wordlist Attack"],
    skillsGained: ["WiFi Security Assessment", "Password Cracking"],
    readTime: 18,
    date: "2026-03-21",
      screenshots: [
        "/Assets/Cases/Wifi Cracking/Screenshot_2026-03-21_111817.webp",
      ],
      image: "/Assets/Cases/Wifi Cracking/Screenshot_2026-03-21_111817.webp",
  },
  {
    id: "usb-forensics-report",
    title: "USB Forensics Case Study",
    description: "Comprehensive forensic analysis of a USB device, including evidence extraction, timeline reconstruction, and reporting.",
    platform: "Blue Team Simulation",
    type: "PDF & DOCX Report",
    category: "Forensics",
    difficulty: "Hard",
    href: "Assets/Cases/Usb Forencics/AhmedEmad_UsbForencics.pdf",
    tags: ["USB", "Forensics", "Evidence", "Timeline"],
    tools: ["Forensics Toolkit", "Timeline Analysis"],
    skillsGained: ["USB Forensics", "Evidence Extraction", "Timeline Reconstruction"],
    readTime: 20,
    date: "2026-04-17",
    screenshots: [
      "Assets/Cases/Usb Forencics/Screenshot (3).png",
      "Assets/Cases/Usb Forencics/Screenshot (4).png",
      "Assets/Cases/Usb Forencics/Screenshot (5).png",
      "Assets/Cases/Usb Forencics/Screenshot (6).png",
      "Assets/Cases/Usb Forencics/Screenshot (7).png",
      "Assets/Cases/Usb Forencics/Screenshot (8).png",
      "Assets/Cases/Usb Forencics/Screenshot (9).png",
      "Assets/Cases/Usb Forencics/Screenshot (10).png",
      "Assets/Cases/Usb Forencics/Screenshot (11).png",
      "Assets/Cases/Usb Forencics/Screenshot (13).png",
      "Assets/Cases/Usb Forencics/Screenshot (14).png",
      "Assets/Cases/Usb Forencics/Screenshot (15).png",
    ],
    image: "Assets/Cases/Usb Forencics/Screenshot (3).png",
  },
  {
    id: "ettercap-case",
    title: "EtterCap Case Study",
    description: "Network sniffing and MITM attack simulation using EtterCap, with analysis and defense recommendations.",
    platform: "Lab Simulation",
    type: "DOCX & PDF Report",
    category: "Network Security",
    difficulty: "Easy",
    href: "Assets/Cases/EtterCap/AhmedEmad_EtterCap.pdf",
    tags: ["EtterCap", "MITM", "Sniffing", "Network"],
    tools: ["EtterCap", "Network Analysis"],
    skillsGained: ["MITM Simulation", "Network Sniffing", "Defense Techniques"],
    readTime: 10,
    date: "2026-04-18",
    screenshots: [
      "Assets/Cases/EtterCap/Screenshot (27).png",
      "Assets/Cases/EtterCap/Screenshot (28).png",
      "Assets/Cases/EtterCap/Screenshot (29).png",
      "Assets/Cases/EtterCap/Screenshot (31).png",
      "Assets/Cases/EtterCap/Screenshot (32).png",
      "Assets/Cases/EtterCap/Screenshot (33).png",
      "Assets/Cases/EtterCap/Screenshot (34).png",
      "Assets/Cases/EtterCap/Screenshot (35).png",
      "Assets/Cases/EtterCap/Screenshot (36).png",
    ],
    image: "Assets/Cases/EtterCap/Screenshot (27).png",
  },
  {
    id: "lockbit-ransomware-forensics",
    title: "LockBit Ransomware Forensics",
    description: "Forensic investigation and incident response for a LockBit ransomware attack, including evidence collection, analysis, and recovery steps.",
    platform: "Blue Team Simulation",
    type: "DOCX & PDF Report",
    category: "Malware Analysis",
    difficulty: "Hard",
    href: "Assets/Cases/LockBit/AhmedEmad_LockBit.pdf",
    tags: ["LockBit", "Ransomware", "Forensics", "Incident Response"],
    tools: ["Forensics Toolkit", "SIEM", "Malware Analysis"],
    skillsGained: ["Ransomware Forensics", "Incident Response", "Evidence Collection"],
    readTime: 23,
    date: "2026-04-18",
    screenshots: [
      ...Array.from({ length: 18 }, (_, i) => `Assets/Cases/LockBit/Screenshot (${85 + i}).png`),
    ],
    image: "Assets/Cases/LockBit/Screenshot (85).png",
  }
    ,
    {
      id: "imagestegano",
      title: "Image Steganography Case Study",
      description: "Analysis and detection of steganography in images, including extraction techniques and forensic investigation.",
      platform: "Blue Team Simulation",
      type: "DOCX & PDF Report",
      category: "Forensics",
      difficulty: "Hard",
      href: "Assets/Cases/ImageStegano/AhmedEmad_ImageStegano.pdf",
      tags: ["Steganography", "Forensics", "Image Analysis"],
      tools: ["StegCracker", "Forensics Toolkit"],
      skillsGained: ["Steganography Detection", "Image Forensics"],
      readTime: 18,
      date: "2026-04-19",
      screenshots: [
        ...Array.from({ length: 13 }, (_, i) => `Assets/Cases/ImageStegano/Screenshot (${104 + i + (i >= 3 ? 1 : 0)}).png`),
      ],
      image: "Assets/Cases/ImageStegano/Screenshot (104).png",
    }
] as const;

export const staticProjectFallback = [
    {
      id: 90007,
      name: "RootedAF Network Security Project",
      description: "Comprehensive report on network infrastructure design, hardening, and monitoring for RootedAF project (ITI Network Project).",
      language: "PDF",
      html_url: null,
      homepage: null,
      stargazers_count: 0,
      forks_count: 0,
      open_issues_count: 0,
      updated_at: "2025-08-11T00:00:00.000Z",
      created_at: "2025-08-11T00:00:00.000Z",
      owner: {
        login: "Ahmed-Emad-Nasr",
        avatar_url: "/Assets/art-gallery/logo/logo.png",
      },
      topics: ["rootedaf", "network", "security", "infrastructure", "iti"],
      default_branch: "main",
      watchers_count: 0,
      license: null,
      pdf: "Assets/Cases/ITI NEtwork Project/RootedAF_Report.pdf",
      image: "/Assets/art-gallery/logo/logo.png",
    },
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
  {
    id: 90005,
    name: "Wifi Cracking Walkthrough",
    description: "Step-by-step WiFi security assessment and cracking using real-world tools and techniques.",
    language: "PDF",
    html_url: null,
    homepage: null,
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-03-21T00:00:00.000Z",
    created_at: "2026-03-21T00:00:00.000Z",
    owner: {
      login: "Ahmed-Emad-Nasr",
      avatar_url: "/Assets/Cases/Wifi Cracking/Screenshot_2026-03-21_111817.webp",
    },
    topics: ["wifi", "cracking", "security", "assessment"],
    default_branch: "main",
    watchers_count: 0,
    license: null,
    pdf: "Assets/Cases/Wifi Cracking/AhmedEmad_WifiCracker.pdf",
    image: "/Assets/Cases/Wifi Cracking/Screenshot_2026-03-21_111817.webp",
  },
] as const;
