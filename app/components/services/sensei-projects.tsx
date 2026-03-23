"use client";
import { memo } from "react";
import { useInView } from "react-intersection-observer";
import { faStar, faCodeBranch, faEye, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import styles from "./sensei-services-projects.module.css";
import { useGitHubRepos, type GitHubRepository } from "@/app/core/hooks/useGitHubRepos";
import { getIconForLanguage, formatDate } from "@/app/core/utils/projectsUtils";
import SectionHeader from "@/app/core/components/SectionHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HEADER_INITIAL     = { opacity: 0, y: -30 } as const;
const HEADER_ANIMATE_IN  = { opacity: 1, y: 0 }   as const;
const HEADER_ANIMATE_OUT = {}                      as const;
const HEADER_TRANSITION  = { duration: 0.8, ease: SLIDE_EASE } as const;

type ProjectItemProps = { repo: GitHubRepository };

const ProjectItem = memo<ProjectItemProps>(({ repo }) => {
  return (
    <div className={styles["single-project"]} onClick={() => window.open(repo.html_url, "_blank")}>
      <div className={styles["part-1"]}>
        <i className={getIconForLanguage(repo.language)} aria-hidden="true" />
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
    </div>
  );
}, (prev, next) => prev.repo.id === next.repo.id);

ProjectItem.displayName = "ProjectItem";

const SenseiProjects = memo(function SenseiProjects() {
  const repos = useGitHubRepos();
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [gridRef, gridInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className={styles["section-projects"]} id="Projects">
      <div className={styles.container}>
        <motion.div ref={headerRef} className={styles["header-section"]} initial={HEADER_INITIAL} animate={headerInView ? HEADER_ANIMATE_IN : HEADER_ANIMATE_OUT} transition={HEADER_TRANSITION}>
          <SectionHeader japaneseText="計画" englishText="Projects" titleClassName={styles.title} />
        </motion.div>
        <motion.div ref={gridRef} className={styles["grid-container"]} initial={{ opacity: 0, y: 20 }} animate={gridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.8, ease: SLIDE_EASE }}>
          {repos.length > 0 ? (
            repos.map((repo) => <ProjectItem key={repo.id} repo={repo} />)
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", opacity: 0.6 }}>
              <p>Loading projects from GitHub...</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
});

export default SenseiProjects;