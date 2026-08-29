/*
 * core/config/experience.ts
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

/// -----------------------------------------------------------------------------
// Experience & Education (from experience.ts)
// -----------------------------------------------------------------------------

/*
 * `kind` مضاف عشان صفحة /cv تقدر تفصل الخبرات عن التعليم. قبل كده الفرق
 * الوحيد كان إن عناصر التعليم مالهاش subTagHyperlink لشركة — استنتاج هش
 * كان هيقع أول ما تضيف عنصر جديد.
 *
 * الـ timeline على الصفحة الرئيسية مبيستخدمهاش دلوقتي، بس هي متاحة لو
 * حبيت تفصلهم بصرياً بعدين.
 */
export const knowledgeEducationItems = [
  {
    // مضاف من الـ CV — الدور ده كان ناقص من الموقع خالص، وهو أحدث دور
    // تدريسي عندك ولسه مستمر.
    tag: "Cybersecurity Instructor (Part-Time)",
    kind: "work" as const,
    subTag: "National Telecommunication Institute (NTI)",
    subTagHyperlink: "https://nti.sci.eg/",
    desc: "Instructed 42+ students across Linux, Networking, SOC Fundamentals and Penetration Testing, achieving an 85% pass rate. \u2022 Delivered 120+ hours of hands-on labs, advancing practical offensive and defensive skills.",
    isRight: false,
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
    kind: "work" as const,
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
    kind: "work" as const,
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
    kind: "work" as const,
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
    kind: "work" as const,
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
    kind: "education" as const,
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
    kind: "education" as const,
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
    kind: "education" as const,
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
    kind: "education" as const,
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
    kind: "work" as const,
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
