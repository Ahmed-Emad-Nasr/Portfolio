"use client";
import { memo, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { faStar, faCodeBranch, faEye, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { motion, type Variants } from "framer-motion";
import styles from "./sensei-services-projects.module.css";
import { useGitHubRepos, type GitHubRepository } from "@/app/core/hooks/useGitHubRepos";
import { getIconForLanguage, formatDate } from "@/app/core/utils/projectsUtils";
import MotionInView from "@/app/core/components/MotionInView";
import SectionHeader from "@/app/core/components/SectionHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SLIDE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const HEADER_INITIAL     = { opacity: 0, y: -30 } as const;
const HEADER_ANIMATE_IN  = { opacity: 1, y: 0 }   as const;
const HEADER_ANIMATE_OUT = {}                      as const;
const HEADER_TRANSITION  = { duration: 0.8, ease: SLIDE_EASE } as const;

// 🔴 التعديل هنا: إزالة الـ 360 واستبدالها بحركة أفخم
const ICON_ANIMATE    = { rotate: 0, scale: 1 }   as const;
const ICON_HOVER      = { rotate: 10, scale: 1.1 } as const;
const ICON_TRANSITION = { duration: 0.8, ease: SLIDE_EASE } as const;

const SECTION_HEADER_TRANSITION = { duration: 0.8, delay: 0.1, type: "spring" as const, stiffness: 100, damping: 22 } as const;

const MOTION_PROPS_SCALE_IN  = { scale: 1 } as const;
const MOTION_PROPS_SCALE_OUT = {}           as const;
const MOTION_PROPS_INITIAL   = { scale: 0.8 } as const;

type ProjectItemProps = { repo: GitHubRepository; index: number };

const ProjectItem = memo<ProjectItemProps>(({ repo, index }) => {
  const variants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: index * 0.1, ease: SLIDE_EASE } },
  }), [index]);

  return (
    <MotionInView className={styles["single-project"]} variants={variants} onClick={() => window.open(repo.html_url, "_blank")}>
      <div className={styles["part-1"]}>
        <motion.i className={getIconForLanguage(repo.language)} animate={ICON_ANIMATE} whileHover={ICON_HOVER} transition={ICON_TRANSITION} aria-hidden="true" />
        <h3>
          {repo.name} <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles["link-icon"]} />
        </h3>
      </div>
      
      <div className={styles["part-2"]}>
        <p className={styles.description}>{repo.description || "No description available for this repository."}</p>
        
        <div className={styles["stats-container"]}>
          <span className={styles["stat-badge"]} title="Stars"><FontAwesomeIcon icon={faStar} /> {repo.stargazers_count}</span>
          <span className={styles["stat-badge"]} title="Forks/Issues"><FontAwesomeIcon icon={faCodeBranch} /> {repo.open_issues_count}</span>
          <span className={styles["stat-badge"]} title="Watchers"><FontAwesomeIcon icon={faEye} /> {repo.watchers_count}</span>
        </div>

        {repo.topics.length > 0 && (
          <div className={styles["topics-container"]}>
            {repo.topics.slice(0, 4).map((topic, i) => <span key={i} className={styles["topic-tag"]}>{topic}</span>)}
            {repo.topics.length > 4 && <span className={styles["topic-tag"]}>+{repo.topics.length - 4}</span>}
          </div>
        )}

        <div className={styles["meta-info"]}>
          <span>Lang: <strong>{repo.language ?? "N/A"}</strong></span>
          <span>Upd: {formatDate(repo.updated_at)}</span>
        </div>
      </div>
    </MotionInView>
  );
}, (prev, next) => prev.repo.id === next.repo.id && prev.index === next.index);

ProjectItem.displayName = "ProjectItem";

const SenseiProjects = memo(function SenseiProjects() {
  const repos = useGitHubRepos();
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const motionProps = useMemo(() => ({
    initial: MOTION_PROPS_INITIAL, animate: headerInView ? MOTION_PROPS_SCALE_IN : MOTION_PROPS_SCALE_OUT, transition: SECTION_HEADER_TRANSITION,
  }), [headerInView]);

  return (
    <section className={styles["section-projects"]} id="Projects">
      <div className={styles.container}>
        <motion.div ref={headerRef} className={styles["header-section"]} initial={HEADER_INITIAL} animate={headerInView ? HEADER_ANIMATE_IN : HEADER_ANIMATE_OUT} transition={HEADER_TRANSITION}>
          <SectionHeader japaneseText="計画" englishText="Projects" titleClassName={styles.title} japaneseMotionProps={motionProps} englishMotionProps={motionProps} />
        </motion.div>
        <div className={styles["grid-container"]}>
          {repos.map((repo, index) => <ProjectItem key={repo.id} repo={repo} index={index} />)}
        </div>
      </div>
    </section>
  );
});

export default SenseiProjects;