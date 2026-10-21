/*
 * Part of splitting up portfolio.ts (which was 70KB in a single module).
 * Everything here moved across verbatim — no change to the data itself,
 * only the split.
 *
 * Why? layout.tsx imported knowledgeEducationItems from the big file, and
 * that dragged all 38 cases, every screenshot and every YouTube video into
 * the same module graph — on every page, including the ones that need none
 * of it. Relying on tree-shaking to separate them works in theory, but with
 * one module holding everything it is a bet rather than a guarantee.
 * Separate files make the separation real.
 *
 * portfolio.ts still exists as a re-exporting barrel, so every existing
 * import keeps working and nothing broke.
 */

/// -----------------------------------------------------------------------------
// Experience & Education (from experience.ts)
// -----------------------------------------------------------------------------

/*
 * ⚠️ `isRight` was removed from every item.
 *
 * It used to set the left/right side on the timeline. The problem was that it was hand-written:
 * as soon as you add an item in the middle, the alternation breaks and two items end up on the same
 * side — which actually happened with "Penetration Tester".
 *
 * And the component now sorts the items by date before rendering them, so a side
 * written in the data no longer means anything — the order on screen isn't the file
 * order. The side is now computed from the position after sorting.
 *
 * So you can add a new item anywhere in the file and the rest sorts itself out.
 *
 * `kind` was added so the /cv page can separate experience from education.
 * Previously the only difference was that education items had no
 * subTagHyperlink for a company — a fragile inference that would have
 * broken the first time you added a new item.
 *
 * The home page timeline does not use it yet, but it is there if you want
 * to separate them visually later.
 */
export const knowledgeEducationItems = [
  {
    // From the CV — the most recent role, and it was completely missing from the site.
    tag: "Cybersecurity Instructor (Part-Time)",
    kind: "work" as const,
    subTag: "AMIT Learning",
    subTagHyperlink: "https://amit-learning.com/",
    desc: "Authored curriculum and instructed 300+ students in Networking, Linux, Security+, and SANS SEC450 / SEC504. • Delivered hands-on SOC, Pentest, IAM, and GRC labs, achieving a 10/10 average student feedback score. • Delivered Red Hat System Administration I & II courses in collaboration with NTI, achieving a 100% student pass rate.",
    startDate: "2026-02-01",
    showDate: true,
    skills: ["Security Training", "Curriculum Design", "Networking", "Linux", "Security+", "Red Hat", "GRC"],
    certificateUrl: "https://amit-learning.com/",
  },
  {
    // Added from the CV — this role was missing from the site entirely, and it
    // is your most recent teaching role and still ongoing.
    tag: "Cybersecurity Instructor (Part-Time)",
    kind: "work" as const,
    subTag: "National Telecommunication Institute (NTI)",
    /* Not a separate entry in the CV PDF — it's AMIT's third bullet there. */
    cv: false,
    subTagHyperlink: "https://nti.sci.eg/",
    desc: "Instructed 42+ students across Linux, Networking, SOC Fundamentals and Penetration Testing, achieving an 85% pass rate. \u2022 Delivered 120+ hours of hands-on labs, advancing practical offensive and defensive skills.",
    startDate: "2026-02-01",
    showDate: true,
    skills: ["Security Training", "Linux", "SOC Fundamentals", "Penetration Testing", "Curriculum Design"],
    certificateUrl: "https://nti.sci.eg/",
  },
  {
    tag: "Information Security Intern",
    kind: "work" as const,
    subTag: "Banque Misr",
    subTagHyperlink: "https://www.banquemisr.com/",
    desc: "Assessed GRC gaps across 3 units via ISO 27001, PCI DSS, COBIT & SWIFT KPIs; delivered 6+ remediation actions. • Audited enterprise architectures across IAM, PAM, & DevSecOps, surfacing 5+ control gaps with remediation plans. • Audited SIEM/DFIR/VAPT workflows, identifying 9 gaps; dark-web intel recommendation adopted for brand protection.",
    startDate: "2026-07-01",
    endDate: "2026-09-01",
    showDate: true,
    skills: ["ISO 27001", "PCI DSS", "COBIT", "SWIFT", "IAM/PAM/DAM", "SIEM", "VAPT"],
    certificateUrl: "https://www.banquemisr.com/",
  },
  {
    tag: "Tutor Assistant (Part-Time)",
    kind: "work" as const,
    subTag: "iSchool",
    cv: false,
    subTagHyperlink: "https://ischool-tech.com/",
    desc: "Facilitated logistics and communication for 150+ students in weekly coding labs, improving session efficiency. • Streamlined session delivery by managing operational logistics and facilitating communication between instructors and students.",
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
    tag: "Incident Response Analyst Intern",
    kind: "work" as const,
    subTag: "Digital Egypt Pioneers Initiative (DEPI)",
    subTagHyperlink: "https://www.depi.gov.eg/",
    desc: "Triaged 30+ SOC alerts via NIST 800-61 on THM & LetsDefend; maintained 95%+ accuracy rate. • Designed detection lab using Wazuh, Suricata, VirusTotal, Sysmon & YARA, increasing log enrichment by 25%. • Implemented CIS Benchmark-based system hardening, achieving 90%+ compliance across secured endpoints.",
    startDate: "2025-06-01",
    endDate: "2026-06-01",
    showDate: true,
    skills: ["Incident Response", "Wazuh", "Suricata", "Sysmon", "NIST 800-61", "CIS Benchmarks"],
    certificateUrl: "https://www.depi.gov.eg/",
  },
  {
    tag: "Penetration Tester Trainee",
    kind: "work" as const,
    subTag: "Information Technology Institute (ITI)",
    subTagHyperlink: "https://www.iti.gov.eg/",
    desc: "Exploited 15+ vulnerabilities in CTFs; mapped privilege escalation and lateral movement to MITRE ATT&CK. • Completed all INE eJPT labs (reconnaissance, enumeration, exploitation, pivoting) & passed the exam with a 90% score. • Solved 100% of assigned labs on PortSwigger, CyberTalents, and Hack The Box (HTB).",
    startDate: "2025-05-01",
    endDate: "2026-01-01",
    showDate: true,
    skills: ["VAPT", "Web Security", "Exploitation", "MITRE ATT&CK"],
    certificateUrl: "https://www.iti.gov.eg/",
  },
  {
    tag: "Cybersecurity Instructor",
    kind: "volunteer" as const,
    subTag: "Google Developer Groups (GDG)",
    subTagHyperlink: "https://gdg.community.dev/",
    desc: "Delivered 35+ sessions to 120+ learners, ranked 1st among 250 instructors, & co-designed 10+ CTF challenges.",
    startDate: "2024-10-01",
    endDate: "2025-10-01",
    showDate: true,
    skills: ["Security Training", "Curriculum Design", "Mentoring"],
    certificateUrl: "https://gdg.community.dev/",
  },
  {
    // From the CV — it was completely missing from the site.
    tag: "Technical Instructor & Committee Member",
    kind: "volunteer" as const,
    subTag: "IEEE",
    subTagHyperlink: "https://www.ieee.org/",
    desc: "Led C/Python training for 5+ engineering teams, enabling 20+ students to build Arduino robotic cars.",
    startDate: "2023-07-01",
    endDate: "2023-12-01",
    showDate: true,
    skills: ["C", "Python", "Mentoring", "Curriculum Design"],
    certificateUrl: "https://www.ieee.org/",
  },
  {
    tag: "Bachelor of Computer Science",
    kind: "education" as const,
    desc: "Major: Information Security & Digital Forensics | GPA: 3.78/4.0. • Ranked 8th out of 900 students.",
    subTag: "Benha University",
    subTagHyperlink: "https://www.bu.edu.eg/",
    startDate: "2022-10-01",
    endDate: "2026-06-01",
    showDate: true,
    skills: ["DFIR", "Information Security", "Cryptography", "Digital Forensics"],
    certificateUrl: "https://www.bu.edu.eg/",
  },
  {
    tag: "ITI Cybersecurity Summer Training",
    cv: false,
    kind: "education" as const,
    subTag: "Information Technology Institute (ITI)",
    subTagHyperlink: "https://www.iti.gov.eg/",
    desc: "Developed foundational knowledge in networking, OS, and attack techniques. • Completed labs on reconnaissance and web security.",
    startDate: "2024-09-01",
    endDate: "2024-11-01",
    showDate: true,
    skills: ["Networking", "OS Security", "Reconnaissance"],
    certificateUrl: "https://www.iti.gov.eg/",
  },
  {
    tag: "Introduction to Cybersecurity Bootcamp",
    cv: false,
    kind: "education" as const,
    subTag: "CyberTalents",
    subTagHyperlink: "https://cybertalents.com/",
    desc: "Strengthened knowledge of attack vectors and threat detection. • Completed 20+ hands-on labs focused on defensive techniques.",
    startDate: "2024-11-01",
    endDate: "2025-01-01",
    showDate: true,
    skills: ["Cybersecurity Fundamentals", "Threat Detection", "Labs"],
    certificateUrl: "https://cybertalents.com/",
  },
  {
    tag: "HCIA-Cloud Computing V5.0",
    cv: false,
    kind: "education" as const,
    subTag: "Huawei",
    subTagHyperlink: "https://www.huawei.com/",
    desc: "Secured virtual environments and deployed 5+ cloud-based services applying security principles.",
    startDate: "2024-08-01",
    endDate: "2024-09-01",
    showDate: true,
    skills: ["Cloud Security", "Cloud Networking", "Platform Hardening"],
    certificateUrl: "https://www.huawei.com/",
  },
  {
    tag: "Network & Cloud Intern",
    cv: false,
    kind: "work" as const,
    subTag: "Huawei",
    subTagHyperlink: "https://www.huawei.com/",
    desc: "Analyzed enterprise network architectures, earning HCIA-Datacom V1.0 and HCIA-Cloud Computing V5.0 with a 95% score. • Configured and simulated 10+ network topologies via Huawei eNSP, validating routing/switching designs.",
    startDate: "2023-07-01",
    endDate: "2023-09-01",
    showDate: true,
    skills: ["Routing", "Switching", "Cloud Computing", "Network Troubleshooting"],
    certificateUrl: "https://www.huawei.com/",
  }
] as const;
