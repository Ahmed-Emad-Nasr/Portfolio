"use client";
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faBrain, faBookOpen, faNetworkWired, faBug, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { faLinux } from "@fortawesome/free-brands-svg-icons";
import styles from "./sensei-skills.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";

const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const HEADER_INITIAL     = { opacity: 0, y: -30 } as const;
const HEADER_ANIMATE_IN  = { opacity: 1, y: 0 }   as const;
const HEADER_ANIMATE_OUT = {}                      as const;
const HEADER_TRANSITION  = { duration: 0.8, ease: SLIDE_EASE } as const;

const TECHNICAL_SKILLS = [
  { name: "Incident Handling & Response", percentage: 85 }, { name: "SOC Operations & Monitoring", percentage: 90 },
  { name: "Digital Forensics (DFIR)", percentage: 75 }, { name: "Network Security & CCNA", percentage: 80 },
  { name: "Threat Hunting", percentage: 65 }, { name: "Malware Analysis", percentage: 70 },
];

const PROFESSIONAL_SKILLS = [
  { name: "Analytical & Critical Thinking", percentage: 90 }, { name: "Problem Solving", percentage: 85 },
  { name: "Effective Communication", percentage: 80 }, { name: "Team Collaboration", percentage: 85 },
];

const BADGES_DATA = [
  { category: "SIEM & Security Tools", icon: faShieldHalved, skills: "Splunk, Wazuh, IBM QRadar, Microsoft Sentinel" },
  { category: "Frameworks & Standards", icon: faBookOpen, skills: "MITRE ATT&CK, NIST, Cyber Kill Chain, ISO 27001" },
  { category: "Networking & Traffic Analysis", icon: faNetworkWired, skills: "Wireshark, Zeek, Suricata, Cisco Packet Tracer" },
  { category: "Operating Systems", icon: faLinux, skills: "Kali Linux, Ubuntu, Windows Server, Active Directory" },
  { category: "Threat Intelligence", icon: faUserSecret, skills: "Threat Intel Platforms, Insider Threat Detection, Deception" },
  { category: "Offensive Security", icon: faBug, skills: "Vulnerability Assessment, Penetration Testing, Web App Security" },
];

type SkillCardProps = { category: string; icon: any; skills: string; };

const SkillCard = memo<SkillCardProps>(({ category, icon, skills }) => {
  const skillsArray = useMemo(() => skills.split(",").map(s => s.trim()).filter(Boolean), [skills]);

  return (
    <div className={styles["skill-card"]}>
      <div className={styles["card-header"]}>
        <div>
          <FontAwesomeIcon icon={icon} className={styles.cardIcon} />
        </div>
        <h3 className={styles.category}>{category}</h3>
      </div>
      <div className={styles["card-body"]}>
        <div className={styles["skills-tags-container"]}>
          {skillsArray.map((skillItem, i) => (
            <span key={`${category}-${i}`} className={styles["skill-tag"]}>{skillItem}</span>
          ))}
        </div>
      </div>
    </div>
  );
});
SkillCard.displayName = "SkillCard";

const SkillsSection = memo(function SkillsSection() {
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [techRef, techInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [profRef, profInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [gridRef, gridInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className={styles["skills-section"]} id="Skills">
      <div className={styles.container}>
        <motion.div ref={headerRef} className={styles["header-section"]} initial={HEADER_INITIAL} animate={headerInView ? HEADER_ANIMATE_IN : HEADER_ANIMATE_OUT} transition={HEADER_TRANSITION}>
          <SectionHeader japaneseText="技能 スキル" englishText="Skills & Expertise" titleClassName={styles.title} />
        </motion.div>

        <motion.div ref={techRef} className={styles["core-skills-wrapper"]} initial={{ opacity: 0, y: 20 }} animate={techInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.8, ease: SLIDE_EASE }}>
          <h3 className={styles["core-title"]}><FontAwesomeIcon icon={faShieldHalved} /> Technical Competencies</h3>
          <div className={styles["progress-grid"]}>
            {TECHNICAL_SKILLS.map((skill, index) => (
              <div key={index} className={styles["progress-item"]}>
                <div className={styles["progress-header"]}>
                  <span>{skill.name}</span><span className={styles["progress-percent"]}>{skill.percentage}%</span>
                </div>
                <div className={styles["progress-bg"]}>
                  <motion.div className={styles["progress-fill"]} initial={{ width: 0 }} animate={techInView ? { width: `${skill.percentage}%` } : { width: 0 }} transition={{ duration: 0.8, ease: SLIDE_EASE }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div ref={profRef} className={styles["core-skills-wrapper"]} initial={{ opacity: 0, y: 20 }} animate={profInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.8, ease: SLIDE_EASE }}>
          <h3 className={styles["core-title"]}><FontAwesomeIcon icon={faBrain} /> Professional Skills</h3>
          <div className={styles["progress-grid"]}>
            {PROFESSIONAL_SKILLS.map((skill, index) => (
              <div key={index} className={styles["progress-item"]}>
                <div className={styles["progress-header"]}>
                  <span>{skill.name}</span><span className={styles["progress-percent"]}>{skill.percentage}%</span>
                </div>
                <div className={styles["progress-bg"]}>
                  <motion.div className={styles["progress-fill"]} initial={{ width: 0 }} animate={profInView ? { width: `${skill.percentage}%` } : { width: 0 }} transition={{ duration: 0.8, ease: SLIDE_EASE }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div ref={gridRef} className={styles["skills-grid"]} initial={{ opacity: 0, y: 20 }} animate={gridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.8, ease: SLIDE_EASE }}>
          {BADGES_DATA.map((skill, index) => (
            <SkillCard key={`badge-${index}`} category={skill.category} icon={skill.icon} skills={skill.skills} />
          ))}
        </motion.div>
      </div>
    </section>
  );
});

export default SkillsSection;