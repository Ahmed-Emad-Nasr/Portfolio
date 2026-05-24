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

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AhmedEmad-0x3omda";

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
    playlistId: "PLO1VSSKnwZUiZqg_WafsnYr7lTb4e3bTv",
    title: "GDG",
    description: "Sessions, workshops, and technical training from GDG (Google Developer Groups) events.",
    sourceUrl: "https://youtube.com/playlist?list=PLO1VSSKnwZUiZqg_WafsnYr7lTb4e3bTv&si=YFhAEQIFGe5ZdsId",
    tags: ["GDG", "Workshops", "Training", "Live Session"],
    videoCount: 10,
  },
];