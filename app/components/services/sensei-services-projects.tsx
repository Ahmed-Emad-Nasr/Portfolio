"use client";
import { memo, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import styles from "./sensei-services-projects.module.css";

const SLIDE_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const HEADER_INITIAL    = { opacity: 0, y: -30 } as const;
const HEADER_ANIMATE_IN = { opacity: 1, y: 0 }  as const;
const HEADER_ANIMATE_OUT = {}                    as const;
const HEADER_TRANSITION = { duration: 0.6, ease: SLIDE_EASE } as const;

const ICON_ANIMATE  = { rotate: 0 }   as const;
const ICON_HOVER    = { rotate: 360 } as const;
const ICON_TRANSITION = { duration: 0.6, ease: "easeOut" } as const;

const SERVICES_DATA = [
  { icon: "fa-solid fa-shield-halved", title: "Security Operations Center (SOC) Analysis", description: "Advanced alert triage, threat detection, and security event analysis. Utilize Wazuh, ELK Stack, and Splunk for real-time monitoring. Implement MITRE ATT&CK framework for threat classification and improve detection accuracy.", },
  { icon: "fa-solid fa-fire", title: "Incident Response (IR) & Handling", description: "End-to-end incident response lifecycle management. Perform threat hunting, containment, eradication, and recovery. Execute incident response playbooks using best practices and frameworks.", },
  { icon: "fa-solid fa-magnifying-glass", title: "Threat Hunting & Detection Engineering", description: "Proactive threat hunting using YARA rules, Suricata IDS/IPS, and behavioral analysis. Create custom detection signatures, reduce false positive alerts, and strengthen security posture.", },
  { icon: "fa-solid fa-database", title: "SIEM & EDR Implementation", description: "Deploy and configure enterprise-grade SIEM solutions including ELK Stack and Splunk. Implement EDR tools like Wazuh for endpoint detection and response capabilities.", },
  { icon: "fa-solid fa-file-lines", title: "Log Analysis & Digital Forensics", description: "Comprehensive log analysis, IOC extraction, and digital forensics investigations. Perform memory forensics, malware behavioral analysis, and evidence collection for incident investigations.", },
  { icon: "fa-solid fa-triangle-exclamation", title: "Vulnerability Assessment & Penetration Testing", description: "Identify security weaknesses through systematic vulnerability assessments. Conduct authorized penetration testing, create detailed reports, and recommend remediation strategies.", },
  { icon: "fa-solid fa-person-chalkboard", title: "Cybersecurity Training & Awareness", description: "Deliver comprehensive cybersecurity training programs to technical and non-technical audiences. Build security awareness, improve incident response skills, and foster security culture.", },
  { icon: "fa-solid fa-virus", title: "Malware Analysis & Prevention", description: "Perform static and dynamic malware analysis in isolated environments. Extract indicators of compromise (IOCs), develop detection signatures, and implement prevention strategies using YARA rules.", },
] as const;

type ServiceItemProps = { icon: string; title: string; description: string; index: number; };

const ServiceItem = memo<ServiceItemProps>(({ icon, title, description, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const variants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.05, ease: SLIDE_EASE } },
  }), [index]);

  return (
    <motion.div ref={ref} className={styles["single-service"]} initial="hidden" animate={inView ? "visible" : "hidden"} variants={variants}>
      <div className={styles["part-1"]}>
        <motion.i className={icon} animate={ICON_ANIMATE} whileHover={ICON_HOVER} transition={ICON_TRANSITION} aria-hidden="true" />
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles["part-2"]}>
        <p className={styles.description}>{description}</p>
      </div>
    </motion.div>
  );
});

ServiceItem.displayName = "ServiceItem";

function SenseiServicesProjects() {
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className={styles["section-services"]} id="Services">
      <div className={styles.container}>
        <motion.div ref={headerRef} className={styles["header-section"]} initial={HEADER_INITIAL} animate={headerInView ? HEADER_ANIMATE_IN : HEADER_ANIMATE_OUT} transition={HEADER_TRANSITION}>
          <h2 className={styles.title}><span lang="ja">事業 •</span><span lang="en"> Services</span></h2>
        </motion.div>
        <div className={styles["grid-container"]}>
          {SERVICES_DATA.map((service, index) => <ServiceItem key={index} {...service} index={index} />)}
        </div>
      </div>
    </section>
  );
}

export default memo(SenseiServicesProjects);