/*
 * Certifications (from the CV): the list on the home page and the CV page,
 * and EducationalOccupationalCredential JSON-LD. `galleryIndex` links a
 * certification to its scan in the proof gallery.
 */

type Certification = {
  /** Stable id — used as the key and in the JSON-LD */
  id: string;
  /** Certification name exactly as written on it */
  name: string;
  /** The abbreviation people search for */
  shortName?: string;
  /** Issuing organisation */
  issuer: string;
  /** Year obtained */
  year: number;
  /** Verification link from the issuer itself */
  verifyUrl?: string;
  /** Image number in image_display/{N}.webp, if known */
  galleryIndex?: number;
  /** false = listed on the site but not on the CV page (it isn't in the PDF) */
  cv?: boolean;
  /** "exam" = passed a proctored/graded exam; "course" = completion of a
      course or learning path. Left out where it isn't certain. */
  credential?: "exam" | "course";
};

/** Ordered newest to oldest — same order as the CV */
/* Order and wording follow the CV PDF. */
export const certifications: readonly Certification[] = [
  { id: "ejpt-v2", credential: "exam", name: "eLearnSecurity Junior Penetration Tester v2", shortName: "eJPT v2", issuer: "INE", year: 2026, galleryIndex: 2 },
  { id: "ccep", name: "Certified Cybersecurity Educator Professional", shortName: "CCEP", issuer: "Red Team Leaders", year: 2026, galleryIndex: 6 },
  { id: "rh124", name: "Red Hat System Administration I (RH124)", shortName: "RH124", issuer: "Red Hat", year: 2026, galleryIndex: 10 },
  { id: "hcia-datacom", name: "HCIA-Datacom V1.0 & HCCDA-Tech Essentials", shortName: "HCIA-Datacom", issuer: "Huawei", year: 2025, galleryIndex: 24 },
  { id: "thm-soc-l1-l2", credential: "course", name: "SOC Level 1 & SOC Level 2 Learning Paths", issuer: "TryHackMe", year: 2025, galleryIndex: 12 },
  { id: "malware-analysis-fundamentals", credential: "course", name: "Malware Analysis Fundamentals", issuer: "Mahara-Tech (ITI)", year: 2025, galleryIndex: 27 },
  { id: "cti-101", credential: "course", name: "Cyber Threat Intelligence 101", issuer: "arcX", year: 2025, galleryIndex: 15 },
  { id: "ccna", credential: "exam", name: "Cisco Certified Network Associate (CCNA 200-301)", shortName: "CCNA", issuer: "Cisco Systems", year: 2024, galleryIndex: 37 },
  { id: "hcia-cloud", name: "HCIA-Cloud Computing V5.0", shortName: "HCIA-Cloud", issuer: "Huawei", year: 2024, cv: false, galleryIndex: 25 },
];

export const GALLERY_IMAGE_COUNT = 98;

export type GalleryCertGroup = "core" | "labs" | "exams" | "badges";

export type GalleryCertificateItem = {
  /** 1-based image index in image_display_thumb/{galleryIndex}.webp */
  galleryIndex: number;
  title: string;
  issuer: string;
  kind: string;
  group: GalleryCertGroup;
  summary: string;
};

/*
 * All 48 documented certificates, diplomas, bootcamps, exam score reports and
 * verified digital badges in the gallery archive (images 1–21 and 23–49).
 */
export const ALL_GALLERY_CERTIFICATES: readonly GalleryCertificateItem[] = [
  {
    galleryIndex: 1,
    title: "Banque Misr — Rowad Program, Certificate of Completion",
    issuer: "Banque Misr",
    kind: "Internship Certificate",
    group: "core",
    summary: "Information Security Internship assessing GRC gaps against ISO 27001, PCI DSS, COBIT and SWIFT, plus IAM, PAM and SIEM/DFIR workflows.",
  },
  {
    galleryIndex: 2,
    title: "eJPT — Junior Penetration Tester",
    issuer: "INE Security",
    kind: "Professional Certification",
    group: "core",
    summary: "Proctored hands-on penetration testing certification covering network & web auditing, enumeration, exploitation and pivoting (90% score).",
  },
  {
    galleryIndex: 3,
    title: "Incident Handling & Response Professional",
    issuer: "INE",
    kind: "Professional Credential",
    group: "core",
    summary: "Incident response lifecycle, alert triage, digital forensics investigation, containment and root-cause reporting.",
  },
  {
    galleryIndex: 4,
    title: "DEPI — Information Security Analyst (Infrastructure & Security)",
    issuer: "DEPI",
    kind: "Ministry Track",
    group: "core",
    summary: "Digital Egypt Pioneers Initiative scholarship track focused on enterprise infrastructure security, CIS hardening and SIEM monitoring.",
  },
  {
    galleryIndex: 5,
    title: "DEPI — Cyber Security Incident Response Analyst",
    issuer: "DEPI",
    kind: "Ministry Track",
    group: "core",
    summary: "Intensive incident response and SOC operations track: NIST 800-61 triage, Wazuh + Suricata detection labs, Sysmon and YARA rules.",
  },
  {
    galleryIndex: 6,
    title: "Certified Cybersecurity Educator Professional (CCEP)",
    issuer: "Red Team Leaders",
    kind: "Professional Certification",
    group: "core",
    summary: "Credential validating cybersecurity curriculum design, lab instruction, technical mentoring and learner assessment.",
  },
  {
    galleryIndex: 7,
    title: "CCNA: Introduction to Networks",
    issuer: "Cisco Networking Academy",
    kind: "Course Certificate",
    group: "core",
    summary: "Network architectures, IPv4/IPv6 addressing, Ethernet switching, TCP/IP protocol suite and router/switch configuration.",
  },
  {
    galleryIndex: 8,
    title: "CCNA: Switching, Routing & Wireless Essentials",
    issuer: "Cisco Networking Academy",
    kind: "Course Certificate",
    group: "core",
    summary: "VLANs, inter-VLAN routing, STP, EtherChannel, DHCPv4/v6, FHRP, wireless LANs and Layer 2 security controls.",
  },
  {
    galleryIndex: 9,
    title: "CCNA: Enterprise Networking, Security & Automation",
    issuer: "Cisco Networking Academy",
    kind: "Course Certificate",
    group: "core",
    summary: "Single-area OSPF, ACLs, NAT, WAN concepts, VPNs, QoS, network virtualization and infrastructure automation.",
  },
  {
    galleryIndex: 10,
    title: "Red Hat System Administration I (RH124)",
    issuer: "Red Hat",
    kind: "Official Course Certificate",
    group: "core",
    summary: "Enterprise Linux administration: systemd services, users and permissions, storage, networking, SSH hardening and SELinux basics.",
  },
  {
    galleryIndex: 11,
    title: "SOC Level 1 Learning Path",
    issuer: "TryHackMe",
    kind: "Learning Path",
    group: "labs",
    summary: "Blue-team operations path covering SIEM alert triage, network traffic analysis, endpoint forensics, phishing investigation and threat intel.",
  },
  {
    galleryIndex: 12,
    title: "SOC Level 2 Learning Path",
    issuer: "TryHackMe",
    kind: "Learning Path",
    group: "labs",
    summary: "Advanced security operations path: log analysis, detection engineering, threat hunting, malware analysis and incident response.",
  },
  {
    galleryIndex: 13,
    title: "Introduction to Cybersecurity Bootcamp",
    issuer: "CyberTalents",
    kind: "Bootcamp Certificate",
    group: "labs",
    summary: "Hands-on cybersecurity bootcamp covering attack vectors, defensive controls and 20+ practical security challenges.",
  },
  {
    galleryIndex: 14,
    title: "ITI Universities Pentesting Bootcamp 2025",
    issuer: "CyberTalents & ITI",
    kind: "Bootcamp Certificate",
    group: "labs",
    summary: "Joint ITI & CyberTalents penetration testing bootcamp covering web vulnerabilities, network exploitation and CTF challenges.",
  },
  {
    galleryIndex: 15,
    title: "Cyber Threat Intelligence 101",
    issuer: "arcX",
    kind: "Foundation Certificate",
    group: "core",
    summary: "Threat intelligence lifecycle, strategic vs. tactical intelligence, IOC enrichment, adversary profiling and MITRE ATT&CK mapping.",
  },
  {
    galleryIndex: 16,
    title: "Cybersecurity for Beginners",
    issuer: "Mahara-Tech (ITI)",
    kind: "Course Certificate",
    group: "labs",
    summary: "Foundational information security principles, threat landscape, cryptography basics and defensive operations.",
  },
  {
    galleryIndex: 17,
    title: "SEC450 — Blue Team Fundamentals & GSOC Prep",
    issuer: "NetRiders",
    kind: "SOC Training",
    group: "labs",
    summary: "Security operations center workflows, SIEM architecture, alert triage methodology, network/endpoint telemetry and incident automation.",
  },
  {
    galleryIndex: 18,
    title: "eCIR — Certified Incident Responder Prep",
    issuer: "NetRiders",
    kind: "IR & DFIR Training",
    group: "labs",
    summary: "Preparation track for eCIR: Splunk/ELK investigations, memory and disk forensics, lateral movement detection and packet analysis.",
  },
  {
    galleryIndex: 19,
    title: "CompTIA Security+ (SY0-601) Prep",
    issuer: "NetRiders Academy",
    kind: "Security Training",
    group: "labs",
    summary: "Core security domains: threats, vulnerabilities, enterprise architecture, IAM, cryptography, incident response and GRC.",
  },
  {
    galleryIndex: 20,
    title: "Red Teaming, Ethical Hacking, Bug Hunting & Penetration Testing",
    issuer: "Udemy",
    kind: "Course Certificate",
    group: "labs",
    summary: "Offensive security techniques, reconnaissance, OWASP Top 10 web vulnerabilities, privilege escalation and reporting.",
  },
  {
    galleryIndex: 21,
    title: "SEC504 — Hacker Tools, Techniques & Incident Handling (GCIH Prep)",
    issuer: "NetRiders",
    kind: "Incident Handling",
    group: "labs",
    summary: "NIST 800-61 incident handling steps paired with attacker TTP analysis, memory/network forensics and containment strategies.",
  },
  {
    galleryIndex: 23,
    title: "HCCDA — Tech Essentials",
    issuer: "Huawei ICT Academy",
    kind: "Cloud Credential",
    group: "core",
    summary: "Huawei Cloud developer and architecture essentials: compute, storage, VPC networking, IAM and cloud security controls.",
  },
  {
    galleryIndex: 24,
    title: "HCIA — Datacom V1.0",
    issuer: "Huawei Talent Online",
    kind: "Professional Certification",
    group: "core",
    summary: "Enterprise data communication certification: VRPs, OSPF, VLANs, STP, ACLs, NAT, IPsec VPN and network management.",
  },
  {
    galleryIndex: 25,
    title: "HCIA — Cloud Computing V5.0",
    issuer: "Huawei ICT Academy",
    kind: "Professional Certification",
    group: "core",
    summary: "Virtualization, compute/network/storage virtualization, cloud resource pools and virtual environment hardening.",
  },
  {
    galleryIndex: 26,
    title: "Cyber Security Track (120 Hours)",
    issuer: "Information Technology Institute (ITI)",
    kind: "Intensive Program",
    group: "core",
    summary: "120-hour intensive training at ITI covering network security, operating system hardening, vulnerability assessment and web security labs.",
  },
  {
    galleryIndex: 27,
    title: "Malware Analysis Fundamentals",
    issuer: "Mahara-Tech (ITI)",
    kind: "Course Certificate",
    group: "core",
    summary: "Static and dynamic malware analysis, PE header inspection, string/import analysis, sandbox monitoring and IOC extraction.",
  },
  {
    galleryIndex: 28,
    title: "Jr Penetration Tester Learning Path",
    issuer: "TryHackMe",
    kind: "Learning Path",
    group: "labs",
    summary: "Hands-on offensive path covering web application security, Burp Suite, network enumeration, Metasploit and privilege escalation.",
  },
  {
    galleryIndex: 29,
    title: "Junior Cybersecurity Analyst Career Path",
    issuer: "Cisco Networking Academy",
    kind: "Career Path",
    group: "core",
    summary: "Cisco career path covering network defense, endpoint protection, threat intelligence, vulnerability assessment and risk management.",
  },
  {
    galleryIndex: 30,
    title: "Student SOC Program Foundations",
    issuer: "Microsoft",
    kind: "Program Certificate",
    group: "core",
    summary: "Microsoft Student SOC Program covering modern security operations, SIEM/XDR concepts, KQL hunting and incident triage.",
  },
  {
    galleryIndex: 31,
    title: "DEPI — Forensics Investigator (Infrastructure & Security)",
    issuer: "DEPI",
    kind: "Ministry Track",
    group: "core",
    summary: "Digital forensics track covering evidence acquisition, memory analysis with Volatility, disk/registry forensics with Autopsy and timeline building.",
  },
  {
    galleryIndex: 32,
    title: "DEPI — Business English Track, Round 3",
    issuer: "OTO Courses & DEPI",
    kind: "Professional Communication",
    group: "labs",
    summary: "Professional communication, technical presentation and workplace English completed alongside the DEPI cybersecurity track.",
  },
  {
    galleryIndex: 33,
    title: "Digital Forensics Fundamentals",
    issuer: "NetRiders",
    kind: "DFIR Training",
    group: "labs",
    summary: "Chain of custody, disk imaging, Windows registry and event log artifacts, browser forensics and forensic report writing.",
  },
  {
    galleryIndex: 34,
    title: "eJPTv1 Penetration Testing Prep",
    issuer: "NetRiders Academy",
    kind: "Pentest Training",
    group: "labs",
    summary: "Practical lab preparation covering footprinting, Nmap scanning, web attacks, password cracking and network pivoting.",
  },
  {
    galleryIndex: 35,
    title: "HCIA-Datacom Learning Course — Certificate of Attendance",
    issuer: "Huawei",
    kind: "Course Completion",
    group: "labs",
    summary: "Completed Huawei enterprise routing, switching and network security lab topologies on Huawei eNSP.",
  },
  {
    galleryIndex: 36,
    title: "GDG on Campus Benha BootCamp 24/25 — Cyber Security Technical",
    issuer: "Google Developer Groups (GDG)",
    kind: "Instructor & Bootcamp",
    group: "core",
    summary: "Recognized for delivering 35+ cybersecurity training sessions and co-designing 10+ CTF challenges (ranked 1st among 250 instructors).",
  },
  {
    galleryIndex: 37,
    title: "CCNA (200-301) Certification Practice Exam — 98%",
    issuer: "Cisco Networking Academy",
    kind: "Exam Score · 98%",
    group: "exams",
    summary: "Full CCNA 200-301 certification practice examination completed with a 98% score across networking, security and automation.",
  },
  {
    galleryIndex: 38,
    title: "Network Security — Course Final Exam, 97%",
    issuer: "Cisco Networking Academy",
    kind: "Exam Score · 97%",
    group: "exams",
    summary: "Final examination in Network Security covering firewall policies, AAA, IPS, VPNs and Layer 2/3 mitigation (97% score).",
  },
  {
    galleryIndex: 39,
    title: "CCNA Semester 1 — Course Final Exam, 98%",
    issuer: "Cisco Networking Academy",
    kind: "Exam Score · 98%",
    group: "exams",
    summary: "Introduction to Networks (ITN) final examination completed with a 98% score.",
  },
  {
    galleryIndex: 40,
    title: "CCNA Semester 2 — Course Final Exam, 92%",
    issuer: "Cisco Networking Academy",
    kind: "Exam Score · 92%",
    group: "exams",
    summary: "Switching, Routing, and Wireless Essentials (SRWE) final examination completed with a 92% score.",
  },
  {
    galleryIndex: 41,
    title: "CCNA Semester 3 — Course Final Exam, 88%",
    issuer: "Cisco Networking Academy",
    kind: "Exam Score · 88%",
    group: "exams",
    summary: "Enterprise Networking, Security, and Automation (ENSA) final examination completed with an 88% score.",
  },
  {
    galleryIndex: 42,
    title: "CCNA Semester 1 — Checkpoint Exam: IP Addressing, 100%",
    issuer: "Cisco Networking Academy",
    kind: "Exam Score · 100%",
    group: "exams",
    summary: "Perfect 100% score on IPv4 subnetting, VLSM and IPv6 addressing checkpoint examination.",
  },
  {
    galleryIndex: 43,
    title: "CCNA Semester 2 — Checkpoint Exam: Switching, VLANs & Inter-VLAN Routing, 97%",
    issuer: "Cisco Networking Academy",
    kind: "Exam Score · 97%",
    group: "exams",
    summary: "97% score on VLAN segmentation, trunking (802.1Q) and inter-VLAN routing configuration.",
  },
  {
    galleryIndex: 44,
    title: "CCNA Semester 3 — Checkpoint Exam: OSPF Concepts & Configuration, 100%",
    issuer: "Cisco Networking Academy",
    kind: "Exam Score · 100%",
    group: "exams",
    summary: "Perfect 100% score on OSPF neighbor adjacencies, DR/BDR election and route tuning.",
  },
  {
    galleryIndex: 45,
    title: "eJPT — Junior Penetration Tester Verified Badge",
    issuer: "INE Security",
    kind: "Verified Badge",
    group: "badges",
    summary: "Official digital credential badge issued by INE Security for passing the eJPT v2 examination.",
  },
  {
    galleryIndex: 46,
    title: "Verified Badge — CCNA: Introduction to Networks",
    issuer: "Cisco",
    kind: "Verified Badge",
    group: "badges",
    summary: "Official Cisco Networking Academy digital badge verifying completion of CCNA: Introduction to Networks.",
  },
  {
    galleryIndex: 47,
    title: "Verified Badge — CCNA: Switching, Routing & Wireless Essentials",
    issuer: "Cisco",
    kind: "Verified Badge",
    group: "badges",
    summary: "Official Cisco Networking Academy digital badge verifying completion of CCNA: Switching, Routing & Wireless Essentials.",
  },
  {
    galleryIndex: 48,
    title: "Verified Badge — CCNA: Enterprise Networking, Security & Automation",
    issuer: "Cisco",
    kind: "Verified Badge",
    group: "badges",
    summary: "Official Cisco Networking Academy digital badge verifying completion of CCNA: Enterprise Networking, Security & Automation.",
  },
  {
    galleryIndex: 49,
    title: "Verified Badge — Junior Cybersecurity Analyst Career Path",
    issuer: "Cisco",
    kind: "Verified Badge",
    group: "badges",
    summary: "Official Cisco digital badge verifying completion of the Junior Cybersecurity Analyst Career Path.",
  },
];

const GALLERY_TITLES: Readonly<Record<number, string>> = Object.fromEntries(
  ALL_GALLERY_CERTIFICATES.map((c) => [c.galleryIndex, `${c.title} · ${c.issuer}`]),
);

const galleryTitle = (index: number): string =>
  GALLERY_TITLES[index] ?? `Record ${String(index).padStart(2, "0")}`;

type GalleryMetadata = {
  title: string;
  description: string;
  category: string;
  keywords: readonly string[];
  creator: string;
};

const CERTIFICATE_KEYWORDS = ["Ahmed Emad Nasr", "Cybersecurity", "Information Security", "Professional Development"];

export const galleryMetadata = (index: number): GalleryMetadata => {
  const cert = ALL_GALLERY_CERTIFICATES.find((c) => c.galleryIndex === index);
  const title = galleryTitle(index);
  return {
    title,
    description: cert
      ? `${cert.title} (${cert.issuer}) — ${cert.summary}`
      : `Portfolio record ${String(index).padStart(2, "0")} from Ahmed Emad Nasr's information security, teaching and professional development archive.`,
    category: cert ? `${cert.kind} · ${cert.issuer}` : "Professional portfolio record",
    keywords: cert ? [...CERTIFICATE_KEYWORDS, cert.title, cert.issuer] : ["Ahmed Emad Nasr", "Portfolio", "Professional Record", "Cybersecurity"],
    creator: "Ahmed Emad Nasr",
  };
};

export const galleryImagePath = (index: number): string =>
  `Assets/art-gallery/Images/image_display_thumb/${index}.webp`;

export const certificationsJsonLd = (personId: string) =>
  certifications.map((cert) => ({
    "@type": "EducationalOccupationalCredential",
    name: cert.name,
    credentialCategory: "certification",
    educationalLevel: "professional",
    dateCreated: String(cert.year),
    recognizedBy: { "@type": "Organization", name: cert.issuer },
    about: { "@id": personId },
  }));
