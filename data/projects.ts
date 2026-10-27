/* Projects: the highlights, the pinned repos and a static copy of them for builds without network */

export const GITHUB_USERNAME = "Ahmed-Emad-Nasr";

export const projectBullets: Record<string, string[]> = {
  "SOC-Environment": [
    "Authored a custom Wazuh rule, merged by maintainers into open-source SOC Fortress (1.5k+ stars).",
    "Deployed a Wazuh/Suricata/Zeek/YARA/FIM/auditd/Sysmon lab, expanding detection coverage by 12% across 5+ endpoints.",
    "Simulated 50+ attacks to validate detection rules, achieving a 95%+ true positive rate across TTPs."
  ],
  "insider-threat-detection-deception": [
    "Built a Wazuh honeytoken insider threat lab, detecting 100% of access attempts across 3 scenarios.",
    "Integrated pfSense and Suricata for monitoring, reducing false positive volume by 30% from baseline.",
    "Built a Python script to hash files, query threat intel & auto-quarantine malware, cutting triage time by 10%."
  ],
  "Malware-Analysis-and-Prevention-Strategy": [
    "Deployed an isolated lab; analyzed 20+ malware samples via DIE & CFF Explorer to extract actionable IOCs.",
    "Conducted dynamic analysis using Wireshark & FakeNet-NG to uncover Command and Control (C2) traffic behaviors.",
    "Engineered a parsing utility and leveraged FIM to detect & extract embedded malicious payloads (18+ downloads)."
  ],
  "Attack-Simulation-Security-Assessment": [
    "Conducted Nessus VA and validated vulnerabilities via Kali Linux Pentest POCs on Metasploitable and DVWA.",
    "Simulated 15+ attacks mapped to Cyber Kill Chain & MITRE ATT&CK to assess impact and recommend fixes."
  ],
  "Threat-Intelligence-Tool": [
    "Developed a Python-based threat intelligence utility integrating VirusTotal, Hybrid Analysis, NIST for CVEs, and Exploit DB.",
    "Achieved 10 stars on GitHub, demonstrating community interest and utility in centralizing security data."
  ],
  "Compliance-Framework": [
    "Architected an AI-powered GRC platform to automate evidence validation and regulatory control mapping.",
    "Engineered risk scoring & automated gap analysis generating remediation plans, cutting manual assessment effort by 30%.",
    "Accelerated assessments by 15% via automated control mapping across 150+ frameworks."
  ],
  "Portfolio": [
    "Developed & deployed a technical portfolio & blog, attracting 1,200+ organic visitors.",
    "Published 40+ security cases, CTFs, & complex lab solutions, earning 22+ GitHub stars from the security community."
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
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://github.com/Ahmed-Emad-Nasr.png" },
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
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://github.com/Ahmed-Emad-Nasr.png" },
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
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://github.com/Ahmed-Emad-Nasr.png" },
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
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://github.com/Ahmed-Emad-Nasr.png" },
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
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://github.com/Ahmed-Emad-Nasr.png" },
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
    html_url: "https://github.com/Ahmed-Emad-Nasr/VerifAI360-Compliance-Framwork",
    homepage: "https://youtu.be/G-Ys6VuV91g",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-06-01T10:00:00Z",
    created_at: "2026-01-01T10:00:00Z",
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://github.com/Ahmed-Emad-Nasr.png" },
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
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://github.com/Ahmed-Emad-Nasr.png" },
    topics: ["malware-analysis", "pdf-parser", "security", "forensics"],
    default_branch: "main",
    watchers_count: 0,
    license: null
  },
  {
    // From the CV — the site's own repo, built from SITE_BASE_URL in site.ts.
    id: 8,
    name: "Portfolio",
    description: "Cybersecurity portfolio & technical blog built with Next.js, publishing information security case studies (SOC, DFIR, malware, IAM, cloud) and CTF write-ups.",
    language: "TypeScript",
    html_url: "https://github.com/Ahmed-Emad-Nasr/Portfolio",
    homepage: "https://ahmed-emad-nasr.github.io/Portfolio/",
    stargazers_count: 22,
    forks_count: 0,
    open_issues_count: 0,
    updated_at: "2026-09-01T10:00:00Z",
    created_at: "2025-09-01T10:00:00Z",
    owner: { login: "Ahmed-Emad-Nasr", avatar_url: "https://github.com/Ahmed-Emad-Nasr.png" },
    topics: ["nextjs", "portfolio", "blog", "cybersecurity", "soc", "dfir"],
    default_branch: "main",
    watchers_count: 0,
    license: null
  }
] as const;
