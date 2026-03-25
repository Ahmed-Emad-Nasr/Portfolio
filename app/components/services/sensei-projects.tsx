"use client";

/*
 * File: sensei-projects.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render GitHub projects section with stats, tags, and external links
 */

import { memo } from "react";
import { faStar, faCodeBranch, faEye, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-services-projects.module.css";
import { useGitHubRepos, type GitHubRepository } from "@/app/core/hooks/useGitHubRepos";
import { getIconForLanguage, formatDate } from "@/app/core/utils/projectsUtils";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import SectionHeader from "@/app/core/components/SectionHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ProjectItemProps = { repo: GitHubRepository };

const ProjectItem = memo<ProjectItemProps>(({ repo }) => {
  const descriptionBullets = toBulletItems(repo.description || "No description available for this repository.");

  return (
    <a
      className={styles["single-project"]}
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open project ${repo.name} on GitHub`}
    >
      <div className={styles["part-1"]}>
        <i className={getIconForLanguage(repo.language)} aria-hidden="true" />
        <h3>
          {repo.name} <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles["link-icon"]} />
        </h3>
      </div>
      
      <div className={styles["part-2"]}>
        <ul className={styles["description-list"]}>
          {descriptionBullets.map((item, index) => (
            <li key={`${repo.id}-${index}`}>{item}</li>
          ))}
        </ul>
        
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
    </a>
  );
}, (prev, next) => prev.repo.id === next.repo.id);

ProjectItem.displayName = "ProjectItem";

const SenseiProjects = memo(function SenseiProjects() {
  const repos = useGitHubRepos();

  return (
    <section className={styles["section-projects"]} id="Projects">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="計画" englishText="Projects" titleClassName={styles.title} />
        </div>
        <div className={styles["grid-container"]}>
          {repos.length > 0 ? (
            repos.map((repo) => <ProjectItem key={repo.id} repo={repo} />)
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", opacity: 0.6 }}>
              <p>Loading projects from GitHub...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default SenseiProjects;