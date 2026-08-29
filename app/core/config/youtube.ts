/*
 * core/config/youtube.ts
 *
 * جزء من تقسيم portfolio.ts (كان 70KB في موديول واحد). كل حاجة هنا اتنقلت
 * زي ما هي بالحرف — مفيش أي تعديل في الداتا نفسها، التقسيم بس.
 *
 * ليه؟ layout.tsx كان بيعمل import لـ knowledgeEducationItems من الملف
 * الكبير، فبيجرّ معاه في نفس الـ module graph كل الـ 38 case وكل الـ
 * screenshots وكل فيديوهات اليوتيوب — على كل صفحة، حتى اللي مش محتاجاها.
 * الاعتماد على الـ tree-shaking عشان يفصلهم شغّال نظرياً، بس مع موديول واحد
 * فيه كل حاجة هو رهان مش ضمانة. الملفات المنفصلة بتخلي الفصل حقيقي.
 *
 * portfolio.ts لسه موجود كـ barrel بيعيد التصدير، فأي import قديم شغّال زي
 * ما هو ومفيش حاجة اتكسرت.
 */

import type {
  BlogYoutubeVideo,
  FeaturedYoutubeVideo,
  BlogYoutubePlaylist,
} from "./shared";

// -----------------------------------------------------------------------------
// YouTube (from youtube.ts)
// -----------------------------------------------------------------------------

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AhmedEmad-0x3omda";

export const blogYoutubeVideos: BlogYoutubeVideo[] = [
  {
    videoId: "z4GbIULmsLA",
    title: "Analyzing WannaCry Malware",
    description: "A comprehensive walkthrough of analyzing the WannaCry ransomware. This video covers static and dynamic analysis techniques, exploring its propagation mechanisms, encryption payload, and network indicators. Essential for DFIR professionals and SOC analysts looking to understand, dissect, and defend against ransomware threats.",
    publishedAt: "2026-07-13",
    tags: [
      "WannaCry",
      "Ransomware",
      "Malware Analysis",
      "DFIR",
      "Cyber Security",
      "Static Analysis",
      "Dynamic Analysis",
      "Threat Intelligence",
      "SOC",
      "Reverse Engineering"
    ],
  },
  {
    videoId: "AUz6clXvwxw",
    title: "Solving eCIR INE Lab: Analyzing PE Header",
    description: "Step-by-step walkthrough of solving the eCIR INE lab focused on analyzing PE headers, understanding executable file structure, and identifying key Portable Executable components for malware analysis and digital forensics.",
    publishedAt: "2026-05-05",
    tags: [
      "eCIR",
      "INE",
      "PE Header",
      "Malware Analysis",
      "Digital Forensics",
      "Portable Executable",
      "Reverse Engineering",
      "Cyber Security Lab",
    ],
  },
  {
    videoId: "Vj8lynVzv2k",
    title: "Solvin INE Lab FootPrinting And Scanning",
    description: "A practical walkthrough of solving the INE Footprinting and Scanning lab for the eJPT/PTS course. The video demonstrates essential network enumeration techniques on a Metasploitable 2 target, covering ping sweeps (fping), basic Nmap scans, SYN scans, service version detection, and OS fingerprinting. Perfect for beginners learning penetration testing.",
    publishedAt: "2026-07-24",
    tags: [
      "INE Lab",
      "eJPT",
      "Footprinting",
      "Scanning",
      "Nmap",
      "Metasploitable 2",
      "Cyber Security",
      "Penetration Testing",
      "Information Gathering",
      "OS Fingerprinting"
    ]
  },
  {
    videoId: "9JR1gbmuYrc",
    title: "Analyzing PDF files",
    description: "A practical walkthrough on analyzing PDF files for malware detection, extracting IOCs, and identifying embedded malicious JavaScript.",
    publishedAt: "2026-07-17",
    tags: ["Malware Analysis", "PDF Parsing", "Cybersecurity", "Phishing Analysis", "Python"]
  },
  {
    videoId: "9LHwl0FpuPM",
    title: "How To Install and Perform Vulnerability Assessments Using Nessus",
    description: "Complete hands-on walkthrough for installing and configuring Nessus, setting up vulnerability scans, and performing practical vulnerability assessments. Covers scan configuration, target analysis, interpreting findings, and understanding remediation steps for cybersecurity and vulnerability management.",
    publishedAt: "2026-05-11",
    tags: [
      "Nessus",
      "Vulnerability Assessment",
      "Cyber Security",
      "Network Security",
      "Penetration Testing",
      "Vulnerability Scanning",
      "Tenable Nessus",
      "Security Assessment",
    ],
  },
  {
    videoId: "Eq_dYmM9y10",
    title: "Adding New Data Set in Splunk SIEM",
    description: "A practical walkthrough of adding a new dataset in Splunk SIEM, configuring data ingestion, setting source types, indexing logs, and validating data visibility for security monitoring and analysis. This tutorial demonstrates how to efficiently onboard new log sources into Splunk for improved threat detection and SOC operations.",
    publishedAt: "2026-05-08",
    tags: [
      "Splunk",
      "Splunk SIEM",
      "Dataset",
      "Data Ingestion",
      "Log Analysis",
      "SOC",
      "Cyber Security",
      "SIEM",
      "Security Monitoring",
      "Splunk Tutorial",
    ],
  },
  {
    videoId: "3v3jbpTspr4",
    title: "Installing Snort On Linux and Difference Between IPS and IDS",
    description: "A practical walkthrough of installing Snort on Linux, covering system updates, network versus host IDS configuration, and modifying the snort.conf file. The tutorial also explains the fundamental differences between Intrusion Detection Systems (IDS) and Intrusion Prevention Systems (IPS), their operation modes (Passive vs. Inline), and their architectural placement relative to firewalls for optimal SOC operations.",
    publishedAt: "2026-07-30",
    tags: [
      "Snort",
      "IDS",
      "IPS",
      "Linux",
      "Intrusion Detection System",
      "Intrusion Prevention System",
      "SOC",
      "Cyber Security",
      "Network Security",
      "Security Architecture"
    ],
  },
  {
    videoId: "XJ9KbMSEqGY",
    title: "Bypassing License Key During Installing Windows Server On VMware",
    description: "A practical tutorial on bypassing the license key requirement during the installation of Windows Server 2019 on VMware. This video walks through creating the virtual machine, selecting the 'install operating system later' option to bypass the prompt, and configuring the Windows Server Desktop Experience. It also highlights how to set up this server for a SOC home lab, including preparing for Active Directory Domain Services (AD DS) installation, Wazuh integration, and Sysmon deployment to simulate and monitor AD attacks.",
    publishedAt: "2026-08-08",
    tags: [
      "Windows Server",
      "VMware",
      "Home Lab",
      "Active Directory",
      "Wazuh",
      "Sysmon",
      "SOC",
      "Cyber Security",
      "Virtualization",
      "IT Administration"
    ],
  },
 {
    videoId: "GwPbuYulV1U",
    title: "Configuring and Testing Wazuh With Sysmon",
    description: "Complete guide to integrating Wazuh SIEM with Sysmon for enhanced threat detection.",
    publishedAt: "2025-11-28",
    tags: ["Wazuh", "SIEM", "Sysmon", "Configuration", "Detection"],
  },
  {
    videoId: "ZoRWT-OJvxY",
    title: "Understanding Malware Types",
    description: "An overview of different malware types and their characteristics.",
    publishedAt: "2025-05-02",
    tags: ["Malware", "Security Fundamentals", "Training"],
  },
  {
    videoId: "J8MNgB-5rMo",
    title: "Fix Cant Access ossec conf Permission Problem",
    description: "A quick tutorial on resolving permission issues when accessing the ossec.conf file in Wazuh.",
    publishedAt: "2025-07-02",
    tags: ["Wazuh", "Troubleshooting", "ossec.conf", "Permissions", "Tutorial"],
  },
  {
    videoId: "4-_XHZa2lVc",
    title: "Trying AWS KMS",
    description: "Exploring and setting up AWS Key Management Service (KMS) for secure key storage and encryption.",
    publishedAt: "2026-05-02",
    tags: ["AWS", "KMS", "Cloud Security", "Encryption", "Tutorial"],
  },
  {
    videoId: "u_hezaAwnmM",
    title: "Demo Threat Inteligence Platform Tool",
    description: "A walkthrough demo of a Python-based threat intelligence utility integrating VirusTotal, Hybrid Analysis, NIST for CVEs, and Exploit DB to centralize threat data for faster analysis.",
    publishedAt: "2026-08-18",
    tags: ["Threat Intelligence", "Python", "VirusTotal", "Hybrid Analysis", "Exploit DB"],
  },
  {
    videoId: "G-Ys6VuV91g",
    title: "VerifAI 360 Compliance Framework Demo",
    description: "A demo of VerifAI 360, an AI-driven GRC platform centralizing Risk, AppSec, Audit, and Privacy operations with automated control mapping across 150+ frameworks.",
    publishedAt: "2026-08-18",
    tags: ["GRC", "AI", "Compliance", "Risk Management", "Security Automation"],
  },
  {
    videoId: "dZs_U8MMV2Q",
    title: "AI-Powered PCI DSS Compliance! VerifAI 360 Showcase",
    description: "A comprehensive showcase of the VerifAI 360 Compliance Framework project. The video demonstrates how the application automates PCI DSS compliance by evaluating security policies, configuration results, and uploaded evidence against standard requirements using local and API-based AI models. It covers features like the Self-Assessment Questionnaire (SAQ), gap reporting, risk assessment, compensating controls, and continuous monitoring dashboards.",
    publishedAt: "2026-08-22",
    tags: [
      "VerifAI 360",
      "PCI DSS",
      "Compliance",
      "AI",
      "GRC",
      "Cyber Security",
      "Information Security",
      "Risk Assessment"
    ]
  }
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
    sourceUrl: "https://youtube.com/playlist?list=PLO1VSSKnwZUgbiE0ev1TUr5wPI9kxxbgL&si=nVzc9L5Kmxhlc1Rc",
    tags: ["SIEM", "Wazuh", "Security", "Configuration"],
    videoCount: 12,
  },
  {
    playlistId: "PLO1VSSKnwZUgdrITjagQD0mikt6Xk64yX",
    title: "Wazuh Threat Emulation",
    description: "Threat emulation and attack simulation using Wazuh for advanced security testing.",
    sourceUrl: "https://youtube.com/playlist?list=PLO1VSSKnwZUgdrITjagQD0mikt6Xk64yX&si=ANb4u1blPp4gyc5F",
    tags: ["Threat Emulation", "Wazuh", "Testing", "Red Team"],
    videoCount: 8,
  },
  {
    playlistId: "PLO1VSSKnwZUgGaiDZXU-mKuh8CUZx-gAd",
    title: "Malware Analysis",
    description: "A complete walkthrough of my malware analysis project. This series covers the step-by-step methodology, safe environment setup, and the practical use of industry-standard tools for both static and dynamic analysis.",
    sourceUrl: "https://youtube.com/playlist?list=PLO1VSSKnwZUgGaiDZXU-mKuh8CUZx-gAd",
    tags: ["SOC", "DFIR", "Cybersecurity"],
    videoCount: 5,
  },
  {
    playlistId: "PLcw8B9lEwARs",
    title: "Attack Simulation & Security Assessment",
    description: "Practical tutorials and methodologies for performing attack simulations and comprehensive security assessments.",
    sourceUrl: "https://youtube.com/playlist?list=PLcw8B9lEwARs&si=gahYoIE2G_X2OwuZ",
    tags: ["Attack Simulation", "Security Assessment", "Red Team", "Cybersecurity"],
    videoCount: 17, 
  },
  {
    playlistId: "PLLzq933rD6WE",
    title: "SOC Environment",
    description: "Practical tutorials and methodologies for building, configuring, and monitoring a complete Security Operations Center (SOC) environment.",
    sourceUrl: "https://youtube.com/playlist?list=PLLzq933rD6WE&si=--gWXu7HDVYInl6v",
    tags: ["SOC", "Blue Team", "Cybersecurity", "Network Monitoring"],
    videoCount: 10,
  }
];
