// =============================================================================
// portfolio.ts
// Consolidated data file — merges cases.ts, experience.ts, projects.ts,
// youtube.ts, blog-types.ts, and blog-utils.ts into a single module.
// =============================================================================

// -----------------------------------------------------------------------------
// Types (from blog-types.ts + youtube.ts)
// -----------------------------------------------------------------------------

export type PdfResource = {
  id: string;
  title: string;
  description?: string;
  platform: string;
  type: string;
  category?: string;
  difficulty?: string;
  href: string;
  tags?: readonly string[];
  tools?: readonly string[];
  skillsGained?: readonly string[];
  readTime?: number;
  date?: string;
};

export type GalleryState = {
  title: string;
  screenshots: string[];
  index: number;
};

export type ChannelVideo = {
  videoId: string;
  title: string;
  description?: string;
  publishedAt?: string;
  sourceUrl: string;
};

type CaseStudyHighlight = {
  title: string;
  domain: string;
  problem: string;
  action: string;
  result: string;
};

type CaseEvidence = {
  id: string;
  title: string;
  description: string;
  platform: string;
  type: string;
  category: string;
  difficulty: string;
  href: string;
  tags: readonly string[];
  tools: readonly string[];
  skillsGained: readonly string[];
  readTime: number;
  date: string;
  screenshots?: readonly string[];
  image?: string;
};

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
  thumbnailVideoId?: string;
  tags?: readonly string[];
  videoCount?: number;
};

// -----------------------------------------------------------------------------
// Utils (from blog-utils.ts)
// -----------------------------------------------------------------------------

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const dateCache = new Map<string, string>();
const DATE_CACHE_MAX = 500;

export const normalizePublicHref = (href: string): string => {
  if (/^https?:\/\//i.test(href)) return href;
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ??
    (process.env.NODE_ENV === "production" ? "/Portfolio" : "");
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return `${basePath}${normalized}`.replace(/\/\//g, "/");
};

export const getThumbnail = (imgPath: string): string =>
  imgPath.replace(/(\.webp|\.png|\.jpg|\.jpeg)$/i, "-thumb$1");

export const formatDate = (value: string): string => {
  const cached = dateCache.get(value);
  if (cached !== undefined) return cached;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const formatted = dateFormatter.format(parsed);

  // Evict oldest entry when cache exceeds the size limit so it never grows
  if (dateCache.size >= DATE_CACHE_MAX) {
    dateCache.delete(dateCache.keys().next().value!);
  }
  dateCache.set(value, formatted);
  return formatted;
};

/// -----------------------------------------------------------------------------
// Experience & Education (from experience.ts)
// -----------------------------------------------------------------------------

export const knowledgeEducationItems = [
  {
    tag: "Information Security Intern",
    subTag: "Banque Misr",
    subTagHyperlink: "https://www.banquemisr.com/",
    desc: "Assessed 3 units against ISO 27001, PCI DSS, COBIT, and SWIFT, evaluating KPIs to identify governance and risk gaps. • Evaluated enterprise architectures spanning IAM, PAM, DAM, Cloud, AI, and DevSecOps container security. • Analyzed SIEM operations, DFIR, Malware Analysis, VAPT, Threat Intel, and Dark Web monitoring for brand protection.",
    isRight: true,
    startDate: "2026-07-01",
    endDate: "2026-09-01",
    showDate: true,
    skills: ["ISO 27001", "PCI DSS", "COBIT", "SWIFT", "IAM/PAM/DAM", "SIEM", "VAPT"],
    certificateUrl: "https://www.banquemisr.com/",
  },
  {
    tag: "Tutor Assistant (Part-Time)",
    subTag: "iSchool",
    subTagHyperlink: "https://ischool-tech.com/",
    desc: "Facilitated logistics and communication for 150+ students in weekly coding labs, improving session efficiency. • Streamlined session delivery by managing operational logistics and facilitating communication between instructors and students.",
    isRight: false,
    startDate: "2025-07-01",
    showDate: true,
    skills: [
      "Communication",
      "Coordination",
      "Classroom Management",
      "Leadership"
    ],
    certificateUrl: "https://ischool-tech.com/",
  },
  {
    tag: "SOC Analyst Intern",
    subTag: "Digital Egypt Pioneers Initiative (DEPI)",
    subTagHyperlink: "https://www.depi.gov.eg/",
    desc: "Triaged 150+ SOC alerts via NIST 800-61 on THM & LetsDefend, maintaining a 95%+ accuracy rate. • Designed a detection lab using Wazuh, Suricata, VirusTotal & YARA, increasing coverage by 12%. • Investigated 50+ events via log analysis & IOCs, cutting documentation time 20% with standard reports.",
    isRight: true,
    startDate: "2025-06-01",
    endDate: "2026-06-01",
    showDate: true,
    skills: ["Incident Response", "Wazuh", "Suricata", "NIST 800-61", "Threat Hunting"],
    certificateUrl: "https://www.depi.gov.eg/",
  },
  {
    tag: "Penetration Tester",
    subTag: "Information Technology Institute (ITI)",
    subTagHyperlink: "https://www.iti.gov.eg/",
    desc: "Exploited 15+ vulnerabilities in CTFs, mapping privilege escalation/lateral movement to MITRE ATT&CK. • Completed all INE eJPT labs (enumeration, exploitation, pivoting) and passed the exam with a 90% score. • Performed reconnaissance, service enumeration, vulnerability validation, and post-exploitation.",
    isRight: true,
    startDate: "2025-05-01",
    endDate: "2026-01-01",
    showDate: true,
    skills: ["VAPT", "Web Security", "Exploitation", "MITRE ATT&CK"],
    certificateUrl: "https://www.iti.gov.eg/",
  },
  {
    tag: "Cybersecurity Instructor (Volunteer)",
    subTag: "Google Developer Groups (GDG)",
    subTagHyperlink: "https://gdg.community.dev/",
    desc: "Delivered 35+ sessions to 120+ learners, earning 1st place and the Best Technical Instructor Award. • Co-designed custom training materials and practical CTF challenges for offensive & defensive concepts with Cyber Cohesion.",
    isRight: false,
    startDate: "2024-10-01",
    endDate: "2025-10-01",
    showDate: true,
    skills: ["Security Training", "Curriculum Design", "Mentoring"],
    certificateUrl: "https://gdg.community.dev/",
  },
  {
    tag: "Bachelor of Computer Science",
    desc: "Major: Information Security & Digital Forensics | GPA: 3.78/4.0. • Ranked 5th out of 900 students.",
    subTag: "Benha University",
    subTagHyperlink: "https://www.bu.edu.eg/",
    isRight: true,
    startDate: "2022-10-01",
    endDate: "2026-06-01",
    showDate: true,
    skills: ["DFIR", "Information Security", "Cryptography", "Digital Forensics"],
    certificateUrl: "https://www.bu.edu.eg/",
  },
  {
    tag: "ITI Cybersecurity Summer Training",
    subTag: "Information Technology Institute (ITI)",
    subTagHyperlink: "https://www.iti.gov.eg/",
    desc: "Developed foundational knowledge in networking, OS, and attack techniques. • Completed labs on reconnaissance and web security.",
    isRight: false,
    startDate: "2024-09-01",
    endDate: "2024-11-01",
    showDate: true,
    skills: ["Networking", "OS Security", "Reconnaissance"],
    certificateUrl: "https://www.iti.gov.eg/",
  },
  {
    tag: "Introduction to Cybersecurity Bootcamp",
    subTag: "CyberTalents",
    subTagHyperlink: "https://cybertalents.com/",
    desc: "Strengthened knowledge of attack vectors and threat detection. • Completed 20+ hands-on labs focused on defensive techniques.",
    isRight: true,
    startDate: "2024-11-01",
    endDate: "2025-01-01",
    showDate: true,
    skills: ["Cybersecurity Fundamentals", "Threat Detection", "Labs"],
    certificateUrl: "https://cybertalents.com/",
  },
  {
    tag: "HCIA-Cloud Computing V5.0",
    subTag: "Huawei",
    subTagHyperlink: "https://www.huawei.com/",
    desc: "Secured virtual environments and deployed 5+ cloud-based services applying security principles.",
    isRight: false,
    startDate: "2024-08-01",
    endDate: "2024-09-01",
    showDate: true,
    skills: ["Cloud Security", "Cloud Networking", "Platform Hardening"],
    certificateUrl: "https://www.huawei.com/",
  },
  {
    tag: "Network & Cloud Intern",
    subTag: "Huawei",
    subTagHyperlink: "https://www.huawei.com/",
    desc: "Analyzed enterprise network architectures, earning HCIA-Datacom V1.0 and HCIA-Cloud Computing V5.0 with a 95% score. • Configured and simulated 10+ network topologies via Huawei eNSP, validating routing/switching designs.",
    isRight: true,
    startDate: "2023-07-01",
    endDate: "2023-09-01",
    showDate: true,
    skills: ["Routing", "Switching", "Cloud Computing", "Network Troubleshooting"],
    certificateUrl: "https://www.huawei.com/",
  }
] as const;

// -----------------------------------------------------------------------------
// Projects (from projects.ts)
// -----------------------------------------------------------------------------

export const GITHUB_USERNAME = "Ahmed-Emad-Nasr";

export const projectBullets: Record<string, string[]> = {
  "SOC-Environment": [
    "Merged a custom Wazuh detection rule into the open-source SOC Fortress repo via a reviewed PR.",
    "Deployed a Wazuh/Suricata/Zeek/YARA/FIM/auditd/Sysmon lab, expanding detection coverage by 12% across 5+ endpoints.",
    "Simulated 50+ attacks to validate detection rules, achieving a 95%+ true positive rate across TTPs."
  ],
  "insider-threat-detection-deception": [
    "Built a Wazuh honeytoken insider threat lab, detecting 100% of access attempts across 3 scenarios.",
    "Integrated pfSense and Suricata for monitoring, reducing false positive volume by 30% from baseline.",
    "Developed a Python script to hash files, query VirusTotal, and auto-delete files flagged as malicious."
  ],
  "Malware-Analysis-and-Prevention-Strategy": [
    "Deployed an isolated lab, analyzing 20+ malware samples (5+ ransomware) and extracting actionable IOCs.",
    "Used FakeNet-NG and Process Hacker/Explorer for dynamic analysis to uncover C2 traffic behaviors.",
    "Engineered a custom PDF parsing utility to detect and extract embedded JavaScript payloads, downloaded by 18+ users."
  ],
  "Attack-Simulation-Security-Assessment": [
    "Conducted 15+ attack simulations on Metasploitable 2/3 and DVWA using Kali Linux and Nessus.",
    "Applied the Cyber Kill Chain & MITRE ATT&CK to document paths, assess impact, and recommend fixes."
  ],
  "Threat-Intelligence-Tool": [
    "Developed a Python-based threat intelligence utility integrating VirusTotal, Hybrid Analysis, NIST for CVEs, and Exploit DB.",
    "Achieved 10 stars on GitHub, demonstrating community interest and utility in centralizing security data."
  ],
  "Compliance-Framework": [
    "Developed an AI-driven GRC platform centralizing Risk, AppSec, Audit, and Privacy operations.",
    "Accelerated assessments by 15% via automated control mapping across 150+ frameworks (ISO, NIST, PCI DSS, GDPR).",
    "Streamlined continuous compliance by automating evidence validation from security scans and configs."
  ]
};

export const staticProjectFallback = [
  {
    id: 1,
    name: "SOC-Environment",
    description: "Enterprise SOC environment integrating Wazuh, Suricata, Zeek, YARA, FIM, auditd, and Sysmon, with a merged PR into the open-source SOC Fortress repo.",
    language: "Shell",
    html_url: "https://github.com/Ahmed-Emad-Nasr/SOC-Environment",
    homepage: "",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-04-15T10:00:00Z",
    created_at: "2025-10-10T10:00:00Z",
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://avatars.githubusercontent.com/u/Ahmed-Emad-Nasr" },
    topics: ["soc", "siem", "elk", "wazuh", "monitor", "alert"],
    default_branch: "main",
    watchers_count: 0,
    license: { name: "MIT License" }
  },
  {
    id: 2,
    name: "insider-threat-detection-deception",
    description: "Lab environment for detecting insider threats using deception techniques and honeypots.",
    language: "Python",
    html_url: "https://github.com/Ahmed-Emad-Nasr/insider-threat-detection-deception",
    homepage: "",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-03-10T10:00:00Z",
    created_at: "2025-08-20T10:00:00Z",
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://avatars.githubusercontent.com/u/Ahmed-Emad-Nasr" },
    topics: ["soc", "threat-hunting", "monitor", "incident"],
    default_branch: "main",
    watchers_count: 0,
    license: null
  },
  {
    id: 3,
    name: "Malware-Analysis-and-Prevention-Strategy",
    description: "In-depth analysis of malware samples extracting IOCs and deploying YARA rules.",
    language: "Python",
    html_url: "https://github.com/Ahmed-Emad-Nasr/Malware-Analysis-and-Prevention-Strategy",
    homepage: "",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-05-20T10:00:00Z",
    created_at: "2025-11-15T10:00:00Z",
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://avatars.githubusercontent.com/u/Ahmed-Emad-Nasr" },
    topics: ["malware", "dfir", "forensic", "yara", "incident", "response"],
    default_branch: "main",
    watchers_count: 0,
    license: { name: "MIT License" }
  },
  {
    id: 4,
    name: "Attack-Simulation-Security-Assessment",
    description: "End-to-end attack simulation and assessment lab across Metasploitable and DVWA.",
    language: "Shell",
    html_url: "https://github.com/Ahmed-Emad-Nasr/Attack-Simulation-Security-Assessment",
    homepage: "",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-06-10T10:00:00Z",
    created_at: "2026-01-10T10:00:00Z",
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://avatars.githubusercontent.com/u/Ahmed-Emad-Nasr" },
    topics: ["vapt", "metasploit", "nessus", "simulation"],
    default_branch: "main",
    watchers_count: 0,
    license: null
  },
  {
    id: 5,
    name: "Threat-Intelligence-Tool",
    description: "Python-based threat intelligence platform integrating VirusTotal, Hybrid Analysis, NIST CVEs, and Exploit DB.",
    language: "Python",
    html_url: "https://github.com/Ahmed-Emad-Nasr/Threat-Intelligence-Tool",
    homepage: "https://youtu.be/u_hezaAwnmM",
    stargazers_count: 10,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-02-25T10:00:00Z",
    created_at: "2025-12-05T10:00:00Z",
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://avatars.githubusercontent.com/u/Ahmed-Emad-Nasr" },
    topics: ["threat-intelligence", "python", "virustotal", "hybrid-analysis", "nist", "exploit-db"],
    default_branch: "main",
    watchers_count: 0,
    license: { name: "MIT License" }
  },
  {
    id: 6,
    name: "Compliance-Framework",
    description: "AI-driven GRC platform (VerifAI 360) centralizing Risk, AppSec, Audit, and Privacy operations with automated control mapping across 150+ frameworks.",
    language: "Python",
    html_url: "https://github.com/Ahmed-Emad-Nasr/Compliance-Framework",
    homepage: "https://youtu.be/G-Ys6VuV91g",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-06-01T10:00:00Z",
    created_at: "2026-01-01T10:00:00Z",
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://avatars.githubusercontent.com/u/Ahmed-Emad-Nasr" },
    topics: ["grc", "ai", "compliance", "risk", "security-automation"],
    default_branch: "main",
    watchers_count: 0,
    license: { name: "MIT License" }
  },
  {
    id: 7,
    name: "PDFparser-tool",
    description: "PDF parser tool optimized for static malware analysis and document forensics.",
    language: "Python", 
    html_url: "https://github.com/Ahmed-Emad-Nasr/3omda-PDFparser-tool",
    homepage: "",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-07-20T10:00:00Z", 
    created_at: "2026-07-20T10:00:00Z", 
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://avatars.githubusercontent.com/u/Ahmed-Emad-Nasr" },
    topics: ["malware-analysis", "pdf-parser", "security", "forensics"],
    default_branch: "main",
    watchers_count: 0,
    license: null
  }
] as const;

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
    title: "Threat Intelligence Platform Tool Demo",
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

// -----------------------------------------------------------------------------
// Cases (from cases.ts)
// -----------------------------------------------------------------------------

export const EMPTY_SCREENSHOTS: string[] = [];

export const caseStudyHighlights: CaseStudyHighlight[] = [
  {
    title: "SOC Alert Tuning Sprint",
    domain: "SOC Analysis",
    problem: "Alert overload made daily triage noisy and delayed response to high-priority events.",
    action: "Mapped noisy detections, tuned correlation logic, and introduced severity-first triage flow.",
    result: "Reduced false positives by 25% in lab SOC operations and improved investigation focus.",
  },
  {
    title: "Threat Hunting Detection Pack",
    domain: "Threat Hunting",
    problem: "Detection coverage had blind spots for stealthy behaviors not captured by baseline rules.",
    action: "Built hypothesis-driven hunt queries and validated signatures against expected telemetry.",
    result: "Increased practical detection coverage and improved analyst confidence in hunt outcomes.",
  },
  {
    title: "Malware Analysis Workflow",
    domain: "DFIR",
    problem: "Malware investigations took too long due to inconsistent IOC extraction and reporting.",
    action: "Created a controlled analysis flow with IOC packaging and behavior mapping templates.",
    result: "Cut investigation time by 20% and improved containment readiness for follow-up actions.",
  },
  {
    title: "Security Training Program",
    domain: "Awareness",
    problem: "Teams needed practical security skills beyond theoretical knowledge.",
    action: "Delivered 35+ structured sessions with guided labs and measurable skill checkpoints.",
    result: "Reached 120+ learners, average feedback 4.9/5, and improved lab performance by 40%.",
  },
  {
    title: "Email Analysis Room Investigation",
    domain: "Email Security",
    problem: "Suspicious inbound email activity required structured triage to quickly separate malicious messages from false alarms.",
    action: "Performed header and sender analysis, inspected embedded links and attachments, and documented indicators with a repeatable workflow.",
    result: "Improved phishing triage consistency and reduced investigation back-and-forth by using a clear evidence-based playbook.",
  },
  {
    title: "BruteForce Room Investigation",
    domain: "SOC Analysis",
    problem: "Authentication alerts indicated repeated login attempts, but source patterns and impact scope were not yet clear.",
    action: "Correlated failed authentication events, validated brute-force indicators, and documented escalation steps with timeline evidence.",
    result: "Improved brute-force triage speed and reporting quality with a repeatable investigation workflow.",
  },
];

const buildScreenshotRange = (
  folder: string,
  start: number,
  end: number,
  excluded: number[] = []
): string[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i)
    .filter((n) => !excluded.includes(n))
    .map((n) => `Assets/Cases/${folder}/Screenshot (${n}).webp`);

export const caseScreenshotsByEvidenceId: Record<string, string[]> = {
  "iam-access-control-room": Array.from({ length: 12 }, (_, i) => `Assets/Cases/IAM_Access_Control/Screenshot (${141 + i}).webp`),
  "bounty-hacker-ctf-writeup": Array.from({ length: 16 }, (_, i) => `Assets/Cases/Bounty_Hacker/Screenshot (${78 + i}).webp`),
  "easy-peasy-ctf-writeup": Array.from({ length: 13 }, (_, i) => `Assets/Cases/Easy_Peasy/Screenshot (${62 + i}).webp`),
  "simple-ctf-writeup": Array.from({ length: 11 }, (_, i) => `Assets/Cases/Simple_CTF/Screenshot (${49 + i}).webp`),
  "ecir-registry-forensics": Array.from({ length: 14 }, (_, i) => `Assets/Cases/AhmedEmad_RegistryForencics_eCIR/${i + 1}.webp`),
  "3omda custom detection rules": Array.from({ length: 9 }, (_, i) => `Assets/Cases/3omda custom detection rules/${i + 1}.webp`),
  "penetration-testing-life-cycle": Array.from({ length: 4 }, (_, i) => `Assets/Cases/penetration-testing-life-cycle/${i + 1}.webp`),
  autopsy: Array.from({ length: 13 }, (_, i) => `Assets/Cases/Autopsy/${i + 1}.webp`),
  "data-exfiltration-investigation": Array.from({ length: 37 }, (_, i) => `Assets/Cases/Data Exfiltiration Investigation/${i + 1}.webp`),
  "aws-guardduty-setup": Array.from({ length: 9 }, (_, i) => `Assets/Cases/AWS-GaurdDuty/${i + 1}.webp`),
  "aws-athena-healthcare": Array.from({ length: 16 }, (_, i) => `Assets/Cases/Amazon S3 and Amazon Athena/${i + 1}.webp`),
  "aws-kms-security": Array.from({ length: 25 }, (_, i) => `Assets/Cases/AWS KMS/${i + 1}.webp`),
  "soc-env-depi-r3-project": [
    "Assets/Cases/SOC Enviroment DEPI R3 Project/1.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/2.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/3.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/4.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/5.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/6.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/7.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/8.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/9.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/create txt file to see if fim is working.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/CustomDashboard1.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/CustomDashboard2.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/edit ossec on win.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/enable fim to folder ahmed.webp",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/it works and event appeard .webp",
  ],
  "depi-r4-project": [
    "Assets/Cases/Depi R4 Project/1.jpeg",
    "Assets/Cases/Depi R4 Project/1.webp",
  ],
  "lockbit-ransomware-forensics": Array.from({ length: 18 }, (_, i) => `Assets/Cases/LockBit/Screenshot (${85 + i}).webp`),
  "serpent-stealer": Array.from({ length: 12 }, (_, i) => `Assets/Cases/Serpent Stealer/Screenshot (${135 + i}).webp`),
  imagestegano: [
    "Assets/Cases/ImageStegano/Screenshot (104).webp",
    "Assets/Cases/ImageStegano/Screenshot (105).webp",
    "Assets/Cases/ImageStegano/Screenshot (106).webp",
    "Assets/Cases/ImageStegano/Screenshot (108).webp",
    "Assets/Cases/ImageStegano/Screenshot (109).webp",
    "Assets/Cases/ImageStegano/Screenshot (110).webp",
    "Assets/Cases/ImageStegano/Screenshot (112).webp",
    "Assets/Cases/ImageStegano/Screenshot (113).webp",
    "Assets/Cases/ImageStegano/Screenshot (114).webp",
    "Assets/Cases/ImageStegano/Screenshot (115).webp",
    "Assets/Cases/ImageStegano/Screenshot (116).webp",
    "Assets/Cases/ImageStegano/Screenshot (117).webp",
    "Assets/Cases/ImageStegano/Screenshot (118).webp",
    "Assets/Cases/ImageStegano/Screenshot (119).webp",
    "Assets/Cases/ImageStegano/Screenshot (120).webp",
  ],
  "hidden-backdoor-report": Array.from({ length: 25 }, (_, i) => `Assets/Cases/Hidden Backdoor/Screenshot (${50 + i}).webp`),
  "malware-analysis-wannacry": [
    ...Array.from({ length: 38 }, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/${i + 1}.webp`),
    ...Array.from({ length: 24 }, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/Screenshot (${343 + i}).webp`),
  ],
  "wifi-cracking-walkthrough": ["Assets/Cases/Wifi Cracking/1.webp", "Assets/Cases/Wifi Cracking/2.webp"],
  "ass6-mitre": [
    "Assets/Cases/ass_6/1.webp",
    "Assets/Cases/ass_6/2.webp",
    "Assets/Cases/ass_6/3.webp",
    "Assets/Cases/ass_6/4.webp",
  ],
  "soc127-pdf": buildScreenshotRange("SOC127", 131, 134),
  "soc205-pdf": buildScreenshotRange("SOC205", 154, 162),
  "soc257-pdf": buildScreenshotRange("SOC257", 135, 140),
  "soc274-pdf": buildScreenshotRange("SOC274", 122, 130),
  "soc282-pdf": buildScreenshotRange("SOC282", 144, 149),
  "soc326-report": buildScreenshotRange("SOC326", 100, 121),
  "soc336-report": buildScreenshotRange("SOC336", 165, 178, [169]),
  "soc338-pdf": buildScreenshotRange("SOC338", 83, 90),
  "soc342-pdf": buildScreenshotRange("SOC342", 91, 99),
  "unload-malware-report": buildScreenshotRange("Unload_Malware", 201, 211),
  "malware2-report": buildScreenshotRange("Malware2", 245, 256),
  "bruteforce-room-report": buildScreenshotRange("BruteForce_Room", 228, 244),
  "malicious-web-traffic-room-report": buildScreenshotRange("MaliciousWebTraffic_Room", 268, 282),
  "email-analysis-room-report": Array.from({ length: 10 }, (_, i) => `Assets/Cases/Email_Analysis_Room/${i + 1}.webp`),
  "usb-forensics-report": [
    "Assets/Cases/Usb Forencics/Screenshot (3).webp",
    "Assets/Cases/Usb Forencics/Screenshot (4).webp",
    "Assets/Cases/Usb Forencics/Screenshot (5).webp",
    "Assets/Cases/Usb Forencics/Screenshot (6).webp",
    "Assets/Cases/Usb Forencics/Screenshot (7).webp",
    "Assets/Cases/Usb Forencics/Screenshot (8).webp",
    "Assets/Cases/Usb Forencics/Screenshot (9).webp",
    "Assets/Cases/Usb Forencics/Screenshot (10).webp",
    "Assets/Cases/Usb Forencics/Screenshot (11).webp",
    "Assets/Cases/Usb Forencics/Screenshot (13).webp",
    "Assets/Cases/Usb Forencics/Screenshot (14).webp",
    "Assets/Cases/Usb Forencics/Screenshot (15).webp",
  ],
  "ettercap-case": [
    "Assets/Cases/EtterCap/Screenshot (27).webp",
    "Assets/Cases/EtterCap/Screenshot (28).webp",
    "Assets/Cases/EtterCap/Screenshot (29).webp",
    "Assets/Cases/EtterCap/Screenshot (31).webp",
    "Assets/Cases/EtterCap/Screenshot (32).webp",
    "Assets/Cases/EtterCap/Screenshot (33).webp",
    "Assets/Cases/EtterCap/Screenshot (34).webp",
    "Assets/Cases/EtterCap/Screenshot (35).webp",
    "Assets/Cases/EtterCap/Screenshot (36).webp",
  ],
};

export const caseEvidenceLibrary: CaseEvidence[] = [
  {
    id: "ecir-registry-forensics",
    title: "Windows Registry Forensics - eCIR",
    description: "Comprehensive forensic analysis of Windows Registry hives (SYSTEM, SOFTWARE, SAM, NTUSER.DAT) to investigate employee misconduct and anti-forensics tool usage.",
    platform: "INE Labs / eCIR",
    type: "DOCX & PDF Report",
    category: "Digital Forensics",
    difficulty: "Hard",
    href: "Assets/Cases/AhmedEmad_RegistryForencics_eCIR/AhmedEmad_RegistryForencics_eCIR.pdf",
    tags: ["Registry Forensics", "Incident Response", "eCIR", "Anti-Forensics"],
    tools: ["Registry Explorer", "DCode", "Reporting"],
    skillsGained: ["Registry Hive Analysis", "User Activity Profiling", "Forensic Reporting", "Evidence Extraction"],
    readTime: 15,
    date: "2026-05-13",
    image: "Assets/Cases/AhmedEmad_RegistryForencics_eCIR/1.webp",
  },
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
    screenshots: ["Assets/Cases/Depi R4 Project/1.jpeg", "Assets/Cases/Depi R4 Project/1.webp"],
    image: "Assets/Cases/Depi R4 Project/1.jpeg",
  },
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
      "Assets/Cases/SOC Enviroment DEPI R3 Project/1.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/2.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/3.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/4.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/5.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/6.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/7.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/8.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/9.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/create txt file to see if fim is working.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/CustomDashboard1.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/CustomDashboard2.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/edit ossec on win.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/enable fim to folder ahmed.webp",
      "Assets/Cases/SOC Enviroment DEPI R3 Project/it works and event appeard .webp",
    ],
    image: "Assets/Cases/SOC Enviroment DEPI R3 Project/1.webp",
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
    screenshots: [...Array.from({ length: 25 }, (_, i) => `Assets/Cases/Hidden Backdoor/Screenshot (${50 + i}).webp`)],
    image: "Assets/Cases/Hidden Backdoor/Screenshot (50).webp",
  },
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
      ...Array.from({ length: 38 }, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/${i + 1}.webp`),
      ...Array.from({ length: 24 }, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/Screenshot (${343 + i}).webp`),
    ],
    image: "Assets/Cases/Malware Analysis and Prevention Strategy/ 21.webp",
  },
  {
    id: "3omda custom detection rules",
    title: "My Custom Detection Rules in Wazuh SIEM Solution with 92% Detection Rate",
    description: "Custom detection rules for identifying suspicious activities in the network.",
    platform: "SIEM Lab",
    type: "PDF Report",
    category: "Threat Detection",
    difficulty: "Hard",
    href: "Assets/Cases/3omda custom detection rules/3omda custom detection rules.pdf",
    tags: ["Wazuh", "SIEM", "Threat Detection", "Custom Rules", "Blue Team", "SOC", "Network Security"],
    tools: ["Wazuh", "EDR", "SIEM"],
    skillsGained: ["Wazuh Rule Creation", "Threat Hunting", "Log Analysis", "Detecting Defense Evasion", "Privilege Escalation Detection"],
    readTime: 26,
    date: "2026-05-05",
    screenshots: Array.from({ length: 9 }, (_, i) => `Assets/Cases/3omda custom detection rules/${i + 1}.webp`),
    image: "Assets/Cases/3omda custom detection rules/1.webp",
  },
  {
    id: "penetration-testing-life-cycle",
    title: "penetration testing Life Cycle",
    description: "Presentation of a complete penetration testing lifecycle, including planning, execution, and reporting phases.",
    platform: "Kali Linux Lab",
    type: "PDF Report",
    category: "Penetration Testing",
    difficulty: "Easy",
    href: "Assets/Cases/penetration-testing-life-cycle/AhmedEmad.pdf",
    tags: ["Privilege Escalation", "Attack Chain", "Defense"],
    tools: ["EDR", "SIEM"],
    skillsGained: ["Privilege Escalation Detection", "Defense Bypass"],
    readTime: 26,
    date: "2026-05-05",
  },
  {
    id: "autopsy",
    title: "Autopsy ",
    description: "Complete digital forensic data recovery operation using Autopsy 4.23.0 to extract deleted files, analyze unallocated space, and generate formal evidence reports.",
    platform: "Digital Forensics Lab",
    type: "Report",
    category: "Forensics",
    difficulty: "Medium",
    href: "Assets/Cases/Autopsy/AhmedEmad_Autopsy.pdf",
    tags: ["Autopsy", "Data Recovery", "Digital Forensics", "Unallocated Space"],
    tools: ["Autopsy 4.23.0", "Data Recovery Tools"],
    skillsGained: ["Evidence Recovery", "Artifact Analysis", "Troubleshooting", "Forensic Reporting"],
    readTime: 12,
    date: "2026-05-01",
    screenshots: ["Assets/Cases/Autopsy/1.webp"],
    image: "Assets/Cases/Autopsy/1.webp",
  },
  {
    id: "data-exfiltration-investigation",
    title: "Unauthorized Data Exfiltration & Credential Compromise",
    description: "Memory forensics investigation using Volatility Framework to confirm data exfiltration via USB, NTLM credential dumping, and SSH backdoor persistence.",
    platform: "Memory Forensics Lab",
    type: "Report",
    category: "DFIR",
    difficulty: "Hard",
    href: "Assets/Cases/Data Exfiltiration Investigation/AhmedEmad_DataExfiltration.pdf",
    tags: ["Memory Forensics", "Volatility", "Data Exfiltration", "Credential Dumping", "DFIR"],
    tools: ["Volatility Framework", "FTK Imager", "John the Ripper"],
    skillsGained: ["Memory Analysis", "Timeline Reconstruction", "Threat Hunting", "Forensic Reporting"],
    readTime: 15,
    date: "2026-04-28",
    screenshots: ["Assets/Cases/Data Exfiltiration Investigation/1.webp"],
    image: "Assets/Cases/Data Exfiltiration Investigation/1.webp",
  },
  {
    id: "aws-guardduty-setup",
    title: "Amazon GuardDuty Threat Detection",
    description: "Enabled Amazon GuardDuty, generated sample findings, and analyzed high-severity threat detections including unauthorized S3 access.",
    platform: "AWS Lab",
    type: "Write-up",
    category: "Cloud Security",
    difficulty: "Hard",
    href: "Assets/Cases/Amazon GuardDuty/Amazon_GuardDuty.pdf",
    tags: ["AWS", "GuardDuty", "Threat Detection", "Security Monitoring"],
    tools: ["Amazon GuardDuty", "AWS Console"],
    skillsGained: ["Continuous Monitoring", "Alert Triage", "Cloud Threat Detection"],
    readTime: 8,
    date: "2026-04-24",
    screenshots: ["Assets/Cases/AWS-GaurdDuty/1.webp"],
    image: "Assets/Cases/AWS-GaurdDuty/1.webp",
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
    screenshots: ["Assets/Cases/AWS KMS/1.webp"],
    image: "Assets/Cases/AWS KMS/1.webp",
  },
  {
    id: "aws-athena-healthcare",
    title: "AWS Healthcare Data Pipeline",
    description: "Serverless data ingestion and querying setup for healthcare data using Amazon S3 and Amazon Athena.",
    platform: "AWS Lab",
    type: "Write-up",
    category: "Cloud Infrastructure",
    difficulty: "Easy",
    href: "Assets/Cases/Amazon S3 and Amazon Athena/Amazon S3 and Amazon Athena.pdf",
    tags: ["AWS", "Data Pipeline", "Cloud Security"],
    tools: ["Amazon S3", "Amazon Athena", "SQL"],
    skillsGained: ["Cloud Storage Management", "Data Cataloging", "Serverless Querying"],
    readTime: 10,
    date: "2026-04-23",
    screenshots: ["Assets/Cases/Amazon S3 and Amazon Athena/16.webp"],
    image: "Assets/Cases/Amazon S3 and Amazon Athena/16.webp",
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
      "Assets/Cases/Serpent Stealer/Screenshot (1).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (2).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (3).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (4).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (5).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (6).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (7).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (8).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (9).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (10).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (11).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (12).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (13).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (14).webp",
      "Assets/Cases/Serpent Stealer/Screenshot (15).webp",
    ],
    image: "Assets/Cases/Serpent Stealer/Screenshot (1).webp",
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
    screenshots: ["Assets/Cases/Wifi Cracking/1.webp", "Assets/Cases/Wifi Cracking/2.webp"],
    image: "Assets/Cases/Wifi Cracking/1.webp",
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
      "Assets/Cases/Usb Forencics/Screenshot (3).webp",
      "Assets/Cases/Usb Forencics/Screenshot (4).webp",
      "Assets/Cases/Usb Forencics/Screenshot (5).webp",
      "Assets/Cases/Usb Forencics/Screenshot (6).webp",
      "Assets/Cases/Usb Forencics/Screenshot (7).webp",
      "Assets/Cases/Usb Forencics/Screenshot (8).webp",
      "Assets/Cases/Usb Forencics/Screenshot (9).webp",
      "Assets/Cases/Usb Forencics/Screenshot (10).webp",
      "Assets/Cases/Usb Forencics/Screenshot (11).webp",
      "Assets/Cases/Usb Forencics/Screenshot (13).webp",
      "Assets/Cases/Usb Forencics/Screenshot (14).webp",
      "Assets/Cases/Usb Forencics/Screenshot (15).webp",
    ],
    image: "Assets/Cases/Usb Forencics/Screenshot (3).webp",
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
      "Assets/Cases/EtterCap/Screenshot (27).webp",
      "Assets/Cases/EtterCap/Screenshot (28).webp",
      "Assets/Cases/EtterCap/Screenshot (29).webp",
      "Assets/Cases/EtterCap/Screenshot (31).webp",
      "Assets/Cases/EtterCap/Screenshot (32).webp",
      "Assets/Cases/EtterCap/Screenshot (33).webp",
      "Assets/Cases/EtterCap/Screenshot (34).webp",
      "Assets/Cases/EtterCap/Screenshot (35).webp",
      "Assets/Cases/EtterCap/Screenshot (36).webp",
    ],
    image: "Assets/Cases/EtterCap/Screenshot (27).webp",
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
    screenshots: [...Array.from({ length: 18 }, (_, i) => `Assets/Cases/LockBit/Screenshot (${85 + i}).webp`)],
    image: "Assets/Cases/LockBit/Screenshot (85).webp",
  },
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
    screenshots: [...Array.from({ length: 13 }, (_, i) => `Assets/Cases/ImageStegano/Screenshot (${104 + i + (i >= 3 ? 1 : 0)}).webp`)],
    image: "Assets/Cases/ImageStegano/Screenshot (104).webp",
  },
  {
    id: "simple-ctf-writeup",
    title: "Simple CTF Walkthrough",
    description: "End-to-end exploitation of TryHackMe's Simple CTF, including CVE-2019-9053 (CMS Made Simple SQLi), password cracking, and GTFOBins privilege escalation.",
    platform: "TryHackMe",
    type: "Write-up",
    category: "Penetration Testing",
    difficulty: "Easy",
    href: "Assets/Cases/Simple_CTF/AhmedEmad_SimpleCTF.pdf", 
    tags: ["TryHackMe", "CTF", "SQL Injection", "Privilege Escalation", "CVE-2019-9053"],
    tools: ["Exploit-DB", "Python", "SSH", "Vim"],
    skillsGained: ["Vulnerability Exploitation", "Password Cracking", "Linux Privilege Escalation"],
    readTime: 15,
    date: "2026-08-19",
    screenshots: Array.from({ length: 11 }, (_, i) => `Assets/Cases/Simple_CTF/Screenshot (${49 + i}).png`),
    image: "Assets/Cases/Simple_CTF/Screenshot (49).webp",
  },
  {
    id: "easy-peasy-ctf-writeup",
    title: "Easy Peasy CTF Walkthrough",
    description: "Step-by-step walkthrough of TryHackMe's Easy Peasy room. Showcasing nmap port enumeration, web directory brute-forcing with Gobuster, hidden paths discovery, and base64/base62 decoding using CyberChef.",
    platform: "TryHackMe",
    type: "Write-up",
    category: "Penetration Testing",
    difficulty: "Easy",
    href: "Assets/Cases/Easy_Peasy/AhmedEmad_EasyPeasy.pdf", 
    tags: ["TryHackMe", "CTF", "Enumeration", "Gobuster", "Cryptography", "CyberChef"],
    tools: ["Nmap", "Gobuster", "CyberChef"],
    skillsGained: ["Port Scanning", "Web Enumeration", "Encoding/Decoding Analysis", "Source Code Inspection"],
    readTime: 12,
    date: "2026-08-19",
    screenshots: Array.from({ length: 13 }, (_, i) => `Assets/Cases/Easy_Peasy/Screenshot (${62 + i}).webp`),
    image: "Assets/Cases/Easy_Peasy/Screenshot (63).webp",
  },
  {
    id: "bounty-hacker-ctf-writeup",
    title: "Bounty Hacker CTF Walkthrough",
    description: "A complete walkthrough of the Bounty Hacker CTF on TryHackMe. The process includes anonymous FTP access to retrieve a custom wordlist, SSH brute-forcing using Hydra, and Linux privilege escalation by exploiting sudo rights on the tar command via GTFOBins.",
    platform: "TryHackMe",
    type: "Write-up",
    category: "Penetration Testing",
    difficulty: "Easy",
    href: "Assets/Cases/Bounty_Hacker/AhmedEmad_BountyHacker.pdf", 
    tags: ["TryHackMe", "CTF", "FTP", "Brute Force", "Hydra", "Privilege Escalation", "GTFOBins"],
    tools: ["Nmap", "Hydra", "SSH", "Tar"],
    skillsGained: ["Service Enumeration", "Password Brute-forcing", "Linux Privilege Escalation"],
    readTime: 12,
    date: "2026-08-21",
    screenshots: Array.from({ length: 16 }, (_, i) => `Assets/Cases/Bounty_Hacker/Screenshot (${78 + i}).webp`),
    image: "Assets/Cases/Bounty_Hacker/Screenshot (78).webp",
  },
  {
    id: "iam-access-control-room",
    title: "IAM & Access Control Concepts",
    description: "Completed the Identity and Access Management room on TryHackMe. Explored core security concepts including Identification, Authentication, Authorization, and Accountability. Deep dive into Access Control Models (DAC, RBAC, MAC), Single Sign-On (SSO), and authentication vulnerabilities like Replay Attacks.",
    platform: "TryHackMe",
    type: "Walkthrough",
    category: "Access Security",
    difficulty: "Easy",
    href: "Assets/Cases/IAM_Access_Control/AhmedEmad_IAM_Access_Control.pdf", 
    tags: ["TryHackMe", "IAM", "Access Control", "RBAC", "MAC", "Authentication", "SSO"],
    tools: ["Security Principles", "Identity Management"],
    skillsGained: ["Identity & Access Management", "Access Control Modeling", "Authentication Mechanisms", "Threat Mitigation"],
    readTime: 10,
    date: "2026-08-27",
    screenshots: Array.from({ length: 12 }, (_, i) => `Assets/Cases/IAM_Access_Control/Screenshot (${141 + i}).webp`),
    image: "Assets/Cases/IAM_Access_Control/Screenshot (152).webp",
  },
] as const;