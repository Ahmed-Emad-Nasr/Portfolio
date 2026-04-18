"use client";

/*
 * File: sensei-projects.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render GitHub projects section with stats, tags, and external links
 */

import { memo, useMemo, useState } from "react";
import { faStar, faCodeBranch, faEye, faArrowUpRightFromSquare, faCirclePlay, faCode } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-projects.module.css";
import { useGitHubRepos, type GitHubRepository } from "@/app/core/hooks/useGitHubRepos";
import { getIconForLanguage, formatDate } from "@/app/core/utils/projectsUtils";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import SectionHeader from "@/app/core/components/SectionHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MotionInView from "@/app/core/components/MotionInView";
import { projectBullets } from "@/app/core/data";

type ProjectItemProps = { repo: GitHubRepository };
type ProjectSkeletonProps = { index: number };
type ProjectCategory = "All" | "SOC" | "DFIR" | "Automation";

const FILTERS: ProjectCategory[] = ["All", "SOC", "DFIR", "Automation"];

const CATEGORY_KEYWORDS: Record<Exclude<ProjectCategory, "All">, string[]> = {
  SOC: ["soc", "siem", "wazuh", "suricata", "elk", "splunk", "monitor", "alert"],
  DFIR: ["forensic", "dfir", "incident", "ioc", "malware", "yara", "response"],
  Automation: ["automation", "script", "python", "powershell", "bash", "bot", "tooling"],
};

const getCategoriesForRepo = (repo: GitHubRepository): ProjectCategory[] => {
  const source = [repo.name, repo.description ?? "", repo.language ?? "", ...repo.topics].join(" ").toLowerCase();
  const categories = (Object.keys(CATEGORY_KEYWORDS) as Array<Exclude<ProjectCategory, "All">>).filter((category) =>
    CATEGORY_KEYWORDS[category].some((keyword) => source.includes(keyword))
  );

  return categories.length > 0 ? categories : ["Automation"];
};

const getFilterCounts = (repos: GitHubRepository[]) => {
  const counts: Record<ProjectCategory, number> = {
    All: repos.length,
    SOC: 0,
    DFIR: 0,
    Automation: 0,
  };

  repos.forEach((repo) => {
    getCategoriesForRepo(repo).forEach((category) => {
      counts[category] += 1;
    });
  });

  return counts;
};

const buildCaseStudy = (repo: GitHubRepository) => {
  const baseProblem = (repo.description || "Security workflow challenge")
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)[0] || "Security workflow challenge";

  const action = repo.topics.length > 0
    ? `Implemented with ${repo.topics.slice(0, 2).join(" + ")}${repo.language ? ` using ${repo.language}` : ""}.`
    : `Implemented secure workflow${repo.language ? ` using ${repo.language}` : ""}.`;

  const result = `Open-source impact: ${repo.stargazers_count} stars • ${repo.forks_count} forks • ${repo.watchers_count} watchers.`;

  return { problem: baseProblem, action, result };
};

const normalizeRepoKey = (name: string): string => name.trim().toLowerCase().replace(/[\s_]+/g, "-");

const getProjectDifficulty = (repo: GitHubRepository): "Beginner" | "Intermediate" | "Advanced" => {
  const source = [repo.name, repo.description ?? "", repo.language ?? "", ...repo.topics].join(" ").toLowerCase();
  const hardKeywords = ["siem", "dfir", "forensic", "malware", "incident", "threat", "edr"];
  const mediumKeywords = ["automation", "script", "tool", "api", "monitor"];

  if (hardKeywords.some((keyword) => source.includes(keyword)) || repo.topics.length >= 5) {
    return "Advanced";
  }

  if (mediumKeywords.some((keyword) => source.includes(keyword)) || repo.topics.length >= 3) {
    return "Intermediate";
  }

  return "Beginner";
};

const formatTimeAgo = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const ProjectItem = memo<ProjectItemProps>(({ repo }) => {
  const customBullets = projectBullets[repo.name] ?? projectBullets[normalizeRepoKey(repo.name)];
  const descriptionBullets = customBullets || toBulletItems(repo.description || "No description available for this repository.");
  const liveUrl = repo.homepage && repo.homepage.trim().length > 0 ? repo.homepage : repo.html_url;
  const caseStudy = buildCaseStudy(repo);
  const difficulty = getProjectDifficulty(repo);

  return (
    <article className={styles["single-project"]}>
      <div className={styles["part-1"]}>
        <i className={getIconForLanguage(repo.language)} aria-hidden="true" />
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
          {descriptionBullets.map((item, index) => (
            <li key={`${repo.id}-desc-${index}`}>{item}</li>
          ))}
        </ul>

        <div className={styles["stats-container"]}>
          <span className={styles["stat-badge"]} aria-label={`${repo.stargazers_count} stars`}><FontAwesomeIcon icon={faStar} aria-hidden="true" /> {repo.stargazers_count}</span>
          <span className={styles["stat-badge"]} aria-label={`${repo.forks_count} forks`}><FontAwesomeIcon icon={faCodeBranch} aria-hidden="true" /> {repo.forks_count}</span>
          <span className={styles["stat-badge"]} aria-label={`${repo.watchers_count} watchers`}><FontAwesomeIcon icon={faEye} aria-hidden="true" /> {repo.watchers_count}</span>
          <span className={`${styles["stat-badge"]} ${styles["difficulty-badge"]}`} aria-label={`Project complexity: ${difficulty}`}>
            {difficulty}
          </span>
        </div>

        {repo.topics.length > 0 && (
          <div className={styles["topics-container"]}>
            {repo.topics.slice(0, 4).map((topic, i) => <span key={`topic-${i}`} className={styles["topic-tag"]}>{topic}</span>)}
            {repo.topics.length > 4 && <span className={styles["topic-tag"]}>+{repo.topics.length - 4}</span>}
          </div>
        )}

        <div className={styles["meta-info"]}>
          <span>Lang: <strong>{repo.language ?? "N/A"}</strong></span>
          <span>Upd: {formatDate(repo.updated_at)}</span>
        </div>

        <div className={styles["case-study"]}>
          <p><strong>Problem:</strong> {caseStudy.problem}</p>
          <p><strong>Action:</strong> {caseStudy.action}</p>
          <p><strong>Result:</strong> {caseStudy.result}</p>
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
  );
}, (prev, next) => prev.repo.id === next.repo.id);

ProjectItem.displayName = "ProjectItem";

const ProjectSkeleton = memo<ProjectSkeletonProps>(({ index }) => (
  <div className={styles["single-project"]} aria-hidden="true">
    <div className={styles["part-1"]}>
      <span className={styles["skeleton-icon"]} />
      <span className={`${styles["skeleton-line"]} ${styles["skeleton-title"]}`} />
    </div>
    <div className={styles["part-2"]}>
      <div className={styles["skeleton-stack"]}>
        <span className={`${styles["skeleton-line"]} ${styles["skeleton-text"]}`} />
        <span className={`${styles["skeleton-line"]} ${styles["skeleton-text"]}`} />
        <span className={`${styles["skeleton-line"]} ${styles["skeleton-text-short"]}`} />
      </div>
      <div className={styles["skeleton-badges"]}>
        <span className={styles["skeleton-pill"]} />
        <span className={styles["skeleton-pill"]} />
        <span className={styles["skeleton-pill"]} />
      </div>
      <div className={styles["skeleton-actions"]}>
        <span className={styles["skeleton-button"]} />
        <span className={styles["skeleton-button"]} />
      </div>
    </div>
  </div>
));

ProjectSkeleton.displayName = "ProjectSkeleton";

const SenseiProjects = memo(function SenseiProjects() {
  const { repos, isLoading, source, loadNotice, loadError, cacheUpdatedAt, refresh } = useGitHubRepos();
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("All");
  const filterCounts = useMemo(() => getFilterCounts(repos), [repos]);

  const cacheLabel = useMemo(() => {
    if (!cacheUpdatedAt) return null;
    try {
      const parsedTime = new Date(cacheUpdatedAt).getTime();
      return `${new Date(cacheUpdatedAt).toLocaleString()} (${formatTimeAgo(parsedTime)})`;
    } catch {
      return null;
    }
  }, [cacheUpdatedAt]);

  const filteredRepos = useMemo(() => {
    if (activeFilter === "All") return repos;
    return repos.filter((repo) => getCategoriesForRepo(repo).includes(activeFilter));
  }, [repos, activeFilter]);

  const summaryText = isLoading
    ? "Loading project data from GitHub..."
    : `${filteredRepos.length} project${filteredRepos.length === 1 ? "" : "s"} shown`;

  return (
    <section className={styles["section-projects"]} id="Projects">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="計画" englishText="Projects" titleClassName={styles.title} />
          <p className={styles.sectionLead}>GitHub-backed work, grouped by security focus so the right examples are easier to scan.</p>
        </div>
        
        <div className={styles["projects-filter"]} role="group" aria-label="Project category filters">
          {FILTERS.map((filterItem) => (
            <button
              key={filterItem}
              type="button"
              className={`${styles["filter-btn"]} ${activeFilter === filterItem ? styles.active : ""}`}
              aria-pressed={activeFilter === filterItem}
              onClick={() => setActiveFilter(filterItem)}
            >
              <span>{filterItem}</span>
              <span className={styles["filter-count"]}>{filterCounts[filterItem]}</span>
            </button>
          ))}
        </div>

        <div className={styles["section-summary"]} aria-live="polite">
          <p>
            {summaryText} • Focused on SOC, DFIR, and automation work.
            {source === "cache" ? " Showing cached repositories." : ""}
            {source === "static" ? " Showing curated fallback projects." : ""}
          </p>
          {!isLoading ? (
            <button
              type="button"
              className={styles["refresh-btn"]}
              onClick={refresh}
              aria-label="Refresh project data from GitHub"
            >
              Refresh data
            </button>
          ) : null}
        </div>

        {loadNotice ? <p className={styles["empty-state-hint"]}>{loadNotice}</p> : null}
        {loadError ? <p className={styles["empty-state-hint"]} role="alert">{loadError}</p> : null}
        {source === "cache" && cacheLabel ? (
          <p className={styles["empty-state-hint"]}>Cache last updated: {cacheLabel}</p>
        ) : null}

        <div className={styles["grid-container"]}>
          {isLoading ? (
            Array.from({ length: 6 }, (_, index) => (
              <ProjectSkeleton key={`project-skeleton-${index}`} index={index} />
            ))
          ) : filteredRepos.length > 0 ? (
            filteredRepos.map((repo, index) => (
              <MotionInView
                key={repo.id}
                transition={{ duration: 0.14, delay: Math.min(index * 0.025, 0.1) }}
              >
                <ProjectItem repo={repo} />
              </MotionInView>
            ))
          ) : (
            <div className={styles["empty-state"]}>
              <p>{repos.length === 0 ? "Loading projects from GitHub..." : "No projects match this filter yet."}</p>
              <span className={styles["empty-state-hint"]}>Try another category or clear the filter to see the full set.</span>
              {!isLoading && activeFilter !== "All" ? (
                <button type="button" className={styles["reset-filter-btn"]} onClick={() => setActiveFilter("All")}>Show all projects</button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default SenseiProjects;