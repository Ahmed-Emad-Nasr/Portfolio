"use client";

/*
 * sensei-projects.tsx  —  STATIC ULTRA FAST BUILD (MINIMALIST)
 */

import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar, faCodeBranch, faEye, faArrowUpRightFromSquare,
  faCirclePlay, faCode,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./sensei-projects.module.css";
import { type GitHubRepository, getIconForLanguage, formatDate, toBulletItems } from "@/app/core/utils/utils";
import SectionHeader from "@/app/core/components/SectionHeader";
import MotionInView from "@/app/core/components/MotionInView";
import { projectBullets, staticProjectFallback } from "@/app/core/config/portfolio";

// ── Types ──────────────────────────────────────────────────────────────────
type ProjectItemProps = { repo: GitHubRepository; isRight?: boolean };

// ── Pure module-level helpers ──────────────────────────────────────────────
const normalizeRepoKey = (name: string) => name.trim().toLowerCase().replace(/[\s_]+/g, "-");

const buildCaseStudy = (repo: GitHubRepository) => {
  const baseProblem = (repo.description || "Security workflow challenge")
    .split(".").map((s) => s.trim()).filter(Boolean)[0] || "Security workflow challenge";
  const action = repo.topics.length > 0
    ? `Implemented with ${repo.topics.slice(0, 2).join(" + ")}${repo.language ? ` using ${repo.language}` : ""}.`
    : `Implemented secure workflow${repo.language ? ` using ${repo.language}` : ""}.`;
  const result = `Open-source impact: ${repo.stargazers_count} stars • ${repo.forks_count} forks • ${repo.watchers_count} watchers.`;
  return { problem: baseProblem, action, result };
};

const getProjectDifficulty = (repo: GitHubRepository): "Beginner" | "Intermediate" | "Advanced" => {
  const source = [repo.name, repo.description ?? "", repo.language ?? "", ...repo.topics].join(" ").toLowerCase();
  if (["siem","dfir","forensic","malware","incident","threat","edr"].some((k) => source.includes(k)) || repo.topics.length >= 5) return "Advanced";
  if (["automation","script","tool","api","monitor"].some((k) => source.includes(k))                || repo.topics.length >= 3) return "Intermediate";
  return "Beginner";
};

// ── ProjectItem ────────────────────────────────────────────────────────────
const ProjectItem = memo<ProjectItemProps>(({ repo, isRight }) => {
  const customBullets   = projectBullets[repo.name] ?? projectBullets[normalizeRepoKey(repo.name)];
  const descriptionBullets = customBullets || toBulletItems(repo.description || "No description available for this repository.");
  const liveUrl         = repo.homepage?.trim() ? repo.homepage : repo.html_url;
  const caseStudy       = buildCaseStudy(repo);
  const difficulty      = getProjectDifficulty(repo);

  return (
    <MotionInView className={`${styles["project-item"]} ${isRight ? styles.right : styles.left}`}>
      <article className={styles["single-project"]}>
        <div className={styles["part-1"]}>
          <FontAwesomeIcon icon={getIconForLanguage(repo.language)} aria-hidden="true" />
          <h3>
            <a
              className={styles["title-link"]}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open project ${repo.name} on GitHub`}
            >
              {repo.name} <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles["link-icon"]} />
            </a>
          </h3>
        </div>

        <div className={styles["part-2"]}>
          <ul className={styles["description-list"]}>
            {descriptionBullets.map((item, idx) => (
              <li key={`${repo.id}-${idx}`}>{item}</li>
            ))}
          </ul>

          <div className={styles["stats-container"]}>
            <span className={styles["stat-badge"]} aria-label={`${repo.stargazers_count} stars`}>
              <FontAwesomeIcon icon={faStar} aria-hidden="true" /> {repo.stargazers_count}
            </span>
            <span className={styles["stat-badge"]} aria-label={`${repo.forks_count} forks`}>
              <FontAwesomeIcon icon={faCodeBranch} aria-hidden="true" /> {repo.forks_count}
            </span>
            <span className={styles["stat-badge"]} aria-label={`${repo.watchers_count} watchers`}>
              <FontAwesomeIcon icon={faEye} aria-hidden="true" /> {repo.watchers_count}
            </span>
            <span className={`${styles["stat-badge"]} ${styles["difficulty-badge"]}`} aria-label={`Project complexity: ${difficulty}`}>
              {difficulty}
            </span>
          </div>

          {repo.topics.length > 0 && (
            <div className={styles["topics-container"]}>
              {repo.topics.slice(0, 4).map((t, i) => (
                <span key={i} className={styles["topic-tag"]}>{t}</span>
              ))}
              {repo.topics.length > 4 && <span className={styles["topic-tag"]}>+{repo.topics.length - 4}</span>}
            </div>
          )}

          <div className={styles["meta-info"]}>
            <span>Lang: <strong>{repo.language ?? "N/A"}</strong></span>
            <span>Upd: {formatDate(repo.updated_at)}</span>
          </div>

          <div className={styles["case-study"]}>
            <p><strong>Problem:</strong> {caseStudy.problem}</p>
            <p><strong>Action:</strong>  {caseStudy.action}</p>
            <p><strong>Result:</strong>  {caseStudy.result}</p>
          </div>

          <div className={styles["project-actions"]}>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={`${styles["action-btn"]} ${styles["primary-action"]}`} aria-label={`Open live project for ${repo.name}`}>
              <FontAwesomeIcon icon={faCirclePlay} /> Live
            </a>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className={styles["action-btn"]} aria-label={`Open source code for ${repo.name}`}>
              <FontAwesomeIcon icon={faCode} /> Code
            </a>
          </div>
        </div>
      </article>
    </MotionInView>
  );
}, (prev, next) => prev.repo.id === next.repo.id);

ProjectItem.displayName = "ProjectItem";

// ── Main section ───────────────────────────────────────────────────────────
const SenseiProjects = memo(function SenseiProjects() {
  const repos = staticProjectFallback as unknown as GitHubRepository[];

  return (
    <section className={styles["section-projects"]} id="Projects">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="計画" englishText="Projects" titleClassName={styles.title} />
        </div>

        <div className={styles["projects-timeline"]} aria-label="Projects Timeline">
          {repos.map((repo, index) => (
            <ProjectItem key={repo.id} repo={repo} isRight={index % 2 !== 0} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default SenseiProjects;