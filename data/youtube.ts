/* The YouTube videos and playlists shown on the blog */

import type {
  BlogYoutubeVideo,
  FeaturedYoutubeVideo,
  BlogYoutubePlaylist,
} from "@/lib/shared";

export const blogYoutubeVideos: BlogYoutubeVideo[] = [
  /* ── Security fundamentals series + beginner setup guides (Sep–Oct 2026) ── */
  {
    videoId: "d2eWKWp6cnQ",
    title: "False Positive vs False Negative vs True Positive vs True Negative",
    description: "The four outcomes of every detection, explained with SOC examples. What each one means, which one is the dangerous miss, and why the balance between them drives alert fatigue, rule tuning and how a SIEM is judged — the vocabulary every analyst uses from the first day of triage.",
    publishedAt: "2026-10-21",
    tags: [
      "SOC",
      "Alert Triage",
      "False Positive",
      "False Negative",
      "Detection Engineering",
      "SIEM",
      "Blue Team",
      "Security Fundamentals"
    ],
  },
  {
    videoId: "1VM05WrTkJ0",
    title: "Setting Up Burp Suite on Firefox from Scratch — FoxyProxy, CA Certificate & Proxy",
    description: "A beginner-friendly setup guide for intercepting web traffic with Burp Suite. Covers configuring the Burp proxy listener, routing Firefox through it with the FoxyProxy extension, downloading and trusting the Burp CA certificate so HTTPS can be intercepted, testing the setup, and fixing the most common errors — the starting point for any web application test. For authorized testing only.",
    publishedAt: "2026-10-20",
    tags: [
      "Burp Suite",
      "Firefox",
      "FoxyProxy",
      "Web Security",
      "Penetration Testing",
      "HTTPS Interception",
      "Proxy",
      "Beginners"
    ],
  },
  {
    videoId: "GhzG0_IJqJY",
    title: "Connecting Kali Linux to the TryHackMe VPN with OpenVPN — Step by Step",
    description: "A short, step-by-step guide for beginners: download the VPN configuration file from TryHackMe, connect from Kali Linux with OpenVPN in the terminal (sudo openvpn your-file.ovpn), confirm the tunnel is up and the target machines are reachable, and troubleshoot the usual connection problems.",
    publishedAt: "2026-10-18",
    tags: [
      "TryHackMe",
      "Kali Linux",
      "OpenVPN",
      "VPN",
      "Linux",
      "Lab Setup",
      "Beginners",
      "Cyber Security"
    ],
  },
  {
    videoId: "_NHM4bJwVIg",
    title: "Active Directory, LDAP, RADIUS & TACACS+ Explained — How They Connect in AAA",
    description: "How the four pieces of enterprise authentication fit together. Active Directory as the central store for users, computers and groups; LDAP as the protocol applications use to query it; RADIUS for centralized AAA on network access, VPN and Wi-Fi; and TACACS+ for administrator access and per-command authorization on network devices — with where each one shows up in a real environment and in an analyst's logs.",
    publishedAt: "2026-10-14",
    tags: [
      "Active Directory",
      "LDAP",
      "RADIUS",
      "TACACS+",
      "AAA",
      "Authentication",
      "IAM",
      "Network Security"
    ],
  },
  {
    videoId: "xpRs11z2_3Y",
    title: "Compensating Controls Explained | Cybersecurity Basics",
    description: "What a compensating control is and when an organization needs one: when the primary control isn't feasible, how an alternative control reduces the same risk, a real-world example, and how compensating controls are documented and accepted in compliance frameworks such as PCI DSS. Aimed at beginners in SOC, GRC and information security.",
    publishedAt: "2026-10-11",
    tags: [
      "Compensating Controls",
      "GRC",
      "PCI DSS",
      "Risk Management",
      "Compliance",
      "Security Controls",
      "Security Fundamentals"
    ],
  },
  {
    videoId: "ggD8ON2KZF4",
    title: "Hashing and Salting Explained",
    description: "Why passwords are never stored in plain text. What hashing is and how it differs from encryption and encoding, what a salt adds and how it defeats rainbow-table attacks, and how real systems store credentials with slow hashing algorithms such as bcrypt, scrypt and Argon2.",
    publishedAt: "2026-10-07",
    tags: [
      "Hashing",
      "Salting",
      "Cryptography",
      "Password Security",
      "Rainbow Tables",
      "bcrypt",
      "Argon2",
      "Security Fundamentals"
    ],
  },
  {
    videoId: "Rk3MaVVwUqE",
    title: "Asymmetric Encryption Explained",
    description: "Public and private keys from the ground up: what asymmetric encryption is, how encryption and decryption work with a key pair, how it compares with symmetric encryption, and why protocols such as HTTPS/TLS depend on it — explained to be understood, not memorized.",
    publishedAt: "2026-10-04",
    tags: [
      "Asymmetric Encryption",
      "Public Key",
      "Private Key",
      "Cryptography",
      "TLS",
      "HTTPS",
      "Network Security",
      "Security Fundamentals"
    ],
  },
  {
    videoId: "wf-MPMkr2p8",
    title: "The CIA Triad — Confidentiality, Integrity, Availability (+ Authenticity & Non-Repudiation)",
    description: "The foundation every security decision is measured against. Confidentiality, integrity and availability, each with what breaks it and what protects it — plus authenticity (proving data or an entity is genuine and from its claimed source) and non-repudiation (proving who did what, so it can't be denied later).",
    publishedAt: "2026-09-29",
    tags: [
      "CIA Triad",
      "Confidentiality",
      "Integrity",
      "Availability",
      "Non-Repudiation",
      "Authenticity",
      "Security+",
      "Security Fundamentals"
    ],
  },
  {
    videoId: "IfcbN66k9u8",
    title: "Privileged Access Management (PAM) Explained",
    description: "How organizations secure, control and monitor their most powerful accounts. What PAM is and why attackers go after privileged credentials first, then the controls that answer it: least privilege, just-in-time access, credential vaulting and rotation, and session monitoring and auditing — and how together they cut down privilege abuse and account compromise. Part of the SOC learning series.",
    publishedAt: "2026-09-27",
    tags: [
      "PAM",
      "Privileged Access Management",
      "IAM",
      "Least Privilege",
      "Just-in-Time Access",
      "Credential Management",
      "Session Monitoring",
      "Security Fundamentals"
    ],
  },
  {
    videoId: "PEeh_0QBjmc",
    title: "TryHackMe SOC Simulation: Phishing Analysis Walkthrough",
    caseId: "email-analysis-room-report",
    description: "A practical walkthrough of solving a TryHackMe SOC Simulation focused on phishing analysis. The video demonstrates how to investigate inbound emails, extract IOCs (URLs, Domains, IPs), verify them using threat intelligence platforms, determine true/false positives, and write comprehensive case reports.",
    publishedAt: "2026-08-30",
    tags: [
      "TryHackMe",
      "SOC",
      "Phishing Analysis",
      "Cyber Security",
      "Threat Intelligence",
      "Incident Response",
      "IOC Extraction",
      "Blue Team"
    ],
  },
  {
    videoId: "z4GbIULmsLA",
    title: "Analyzing WannaCry Malware",
    caseId: "malware-analysis-wannacry",
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
    title: "Solving INE Lab: Footprinting and Scanning",
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
    /* Retitled on the site: the video installs the free evaluation edition, and
       "bypassing the license key" reads like piracy on a security portfolio.
       Rename it on YouTube too. */
    title: "Installing Windows Server 2019 (Evaluation) on VMware for a SOC Home Lab",
    description: "A practical tutorial on installing the Windows Server 2019 evaluation edition on VMware without entering a product key. This video walks through creating the virtual machine, selecting the 'install operating system later' option to bypass the prompt, and configuring the Windows Server Desktop Experience. It also highlights how to set up this server for a SOC home lab, including preparing for Active Directory Domain Services (AD DS) installation, Wazuh integration, and Sysmon deployment to simulate and monitor AD attacks.",
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
    caseId: "soc-env-depi-r3-project",
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
    title: "Fix: Can't Access ossec.conf (Permission Problem)",
    description: "A quick tutorial on resolving permission issues when accessing the ossec.conf file in Wazuh.",
    publishedAt: "2025-07-02",
    tags: ["Wazuh", "Troubleshooting", "ossec.conf", "Permissions", "Tutorial"],
  },
  {
    videoId: "4-_XHZa2lVc",
    title: "Trying AWS KMS",
    caseId: "aws-kms-security",
    description: "Exploring and setting up AWS Key Management Service (KMS) for secure key storage and encryption.",
    publishedAt: "2026-05-02",
    tags: ["AWS", "KMS", "Cloud Security", "Encryption", "Tutorial"],
  },
  {
    videoId: "u_hezaAwnmM",
    title: "Demo: Threat Intelligence Platform Tool",
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
  title: "How to Download and Install the Wazuh SIEM",
  description: "A from-scratch walkthrough of downloading and installing Wazuh — the first step of the SOC lab series.",
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
  /*
   * Two playlists are parked here until their full ids are available:
   *
   *   · "Attack Simulation & Security Assessment" (17 videos)
   *       tags: Attack Simulation, Security Assessment, Red Team, Cybersecurity
   *   · "SOC Environment" (10 videos)
   *       tags: SOC, Blue Team, Cybersecurity, Network Monitoring
   *
   * Their ids were stored truncated to 13 characters (PLcw8B9lEwARs…,
   * PLLzq933rD6WE…). A real playlist id is "PL" + 32 characters, so both the
   * "Open on YouTube" link and the embedded player returned an error, and
   * `npm run check:data` failed on them.
   *
   * To restore them: copy the full `list=` value from each playlist's URL on
   * YouTube and add the two entries back to this array, in the same shape as
   * the ones above.
   */
];