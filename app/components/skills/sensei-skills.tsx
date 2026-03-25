"use client";

/*
 * File: sensei-skills.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render skills section with progress metrics and categorized badges
 */

import { memo, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faBrain, faBookOpen, faNetworkWired, faBug, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { faLinux } from "@fortawesome/free-brands-svg-icons";
import styles from "./sensei-skills.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import MotionInView from "@/app/core/components/MotionInView";

const TECHNICAL_SKILLS = [
  { name: "Alert Triage & IOC Analysis", percentage: 90 },
  { name: "SIEM/EDR Investigations", percentage: 88 },
  { name: "Incident Response Handling", percentage: 85 },
  { name: "Threat Hunting & Detection Engineering", percentage: 82 },
  { name: "Malware Analysis", percentage: 78 },
  { name: "Network Security Monitoring", percentage: 80 },
];

const PROFESSIONAL_SKILLS = [
  { name: "Analytical Thinking", percentage: 90 },
  { name: "Problem Solving", percentage: 88 },
  { name: "Team Collaboration", percentage: 87 },
  { name: "Communication & Time Management", percentage: 85 },
];

const BADGES_DATA = [
  { category: "SIEM & EDR", icon: faShieldHalved, skills: "Wazuh, ELK Stack, Splunk, Sysmon, Suricata, pfSense" },
  { category: "Frameworks & SOC Methodologies", icon: faBookOpen, skills: "MITRE ATT&CK, Incident Response Lifecycle, SOC Operations" },
  { category: "Networking & Monitoring", icon: faNetworkWired, skills: "TCP/IP, IDS/IPS, Network Traffic Analysis (NTA)" },
  { category: "Operating Systems", icon: faLinux, skills: "Kali Linux, Ubuntu, Windows Server" },
  { category: "Threat Detection & IR", icon: faUserSecret, skills: "Alert Triage, IOC Analysis, Threat Hunting, Detection Engineering" },
  { category: "Programming & Automation", icon: faBug, skills: "Python, Bash, PowerShell, C++" },
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
        <ul className={styles["skills-list"]}>
          {skillsArray.map((skillItem, i) => (
            <li key={`${category}-${i}`} className={styles["skill-item"]}>{skillItem}</li>
          ))}
        </ul>
      </div>
    </div>
  );
});
SkillCard.displayName = "SkillCard";

const SkillsSection = memo(function SkillsSection() {
  return (
    <section className={styles["skills-section"]} id="Skills">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="技能 スキル" englishText="Skills & Expertise" titleClassName={styles.title} />
        </div>

        <MotionInView
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          threshold={0.12}
          triggerOnce
        >
        <div className={styles["core-skills-wrapper"]}>
          <h3 className={styles["core-title"]}><FontAwesomeIcon icon={faShieldHalved} /> Technical Competencies</h3>
          <div className={styles["progress-grid"]}>
            {TECHNICAL_SKILLS.map((skill, index) => (
              <div key={index} className={styles["progress-item"]}>
                <div className={styles["progress-header"]}>
                  <span>{skill.name}</span><span className={styles["progress-percent"]}>{skill.percentage}%</span>
                </div>
                <div className={styles["progress-bg"]}>
                  <div className={styles["progress-fill"]} style={{ width: `${skill.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        </MotionInView>

        <MotionInView
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          threshold={0.12}
          triggerOnce
        >
        <div className={styles["core-skills-wrapper"]}>
          <h3 className={styles["core-title"]}><FontAwesomeIcon icon={faBrain} /> Professional Skills</h3>
          <div className={styles["progress-grid"]}>
            {PROFESSIONAL_SKILLS.map((skill, index) => (
              <div key={index} className={styles["progress-item"]}>
                <div className={styles["progress-header"]}>
                  <span>{skill.name}</span><span className={styles["progress-percent"]}>{skill.percentage}%</span>
                </div>
                <div className={styles["progress-bg"]}>
                  <div className={styles["progress-fill"]} style={{ width: `${skill.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        </MotionInView>

        <div className={styles["skills-grid"]}>
          {BADGES_DATA.map((skill, index) => (
            <MotionInView
              key={`badge-${index}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.06, 0.24) }}
              threshold={0.12}
              triggerOnce
            >
              <SkillCard category={skill.category} icon={skill.icon} skills={skill.skills} />
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
});

export default SkillsSection;