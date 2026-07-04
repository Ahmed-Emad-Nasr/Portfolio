"use client";

/*
 * sensei-projects.tsx  —  ULTRA FAST BUILD
 *
 * Changes:
 * 1. Synced with the new hyper-fast useGitHubRepos hook (removed missing properties like cacheUpdatedAt, loadNotice).
 * 2. Removed unnecessary UI clutter and Date parsing for cache labels to save CPU cycles.
 * 3. Kept WeakMap and stable useMemos for raw filtering performance.
 */

import { memo, useEffect, useMemo, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar, faCodeBranch, faEye, faArrowUpRightFromSquare,
  faCirclePlay, faCode,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./sensei-projects.module.css";
import { useGitHubRepos, type GitHubRepository } from "@/app/core/utils/utils";
import { getIconForLanguage, formatDate } from "@/app/core/utils/utils";
import { toBulletItems } from "@/app/core/utils/utils";
import SectionHeader from "@/app/core/components/SectionHeader";
import MotionInView from "@/app/core/components/MotionInView";
import { projectBullets } from "@/app/core/config/portfolio";

// ── Types ──────────────────────────────────────────────────────────────────
type ProjectItemProps    = { repo: GitHubRepository; isRight?: boolean };
type ProjectSkeletonProps = { index: number };
type ProjectCategory     = "All" | "SOC" | "DFIR" | "Automation";

const FILTERS: ProjectCategory[] = ["All", "SOC", "DFIR", "Automation"];
const PAGE_SIZE = 4;

const CATEGORY_KEYWORDS: Record<Exclude<ProjectCategory, "All">, string[]> = {
  SOC:        ["soc", "siem", "wazuh", "suricata", "elk", "splunk", "monitor", "alert"],
  DFIR:       ["forensic", "dfir", "incident", "ioc", "malware", "yara", "response"],
  Automation: ["automation", "script", "python", "powershell", "bash", "bot", "tooling"],
};

// ── Category cache — avoids re-computing for same repo object ─────────────
const repoCategoryCache = new WeakMap<GitHubRepository, ProjectCategory[]>();

const getCategoriesForRepo = (repo: GitHubRepository): ProjectCategory[] => {
  const cached = repoCategoryCache.get(repo);
  if (cached) return cached;

  const source = [repo.name, repo.description ?? "", repo.language ?? "", ...repo.topics]
    .join(" ")
    .toLowerCase();

  const categories = (Object.keys(CATEGORY_KEYWORDS) as Array<Exclude<ProjectCategory, "All">>)
    .filter((cat) => CATEGORY_KEYWORDS[cat].some((kw) => source.includes(kw)));

  const result: ProjectCategory[] = categories.length > 0 ? categories : ["Automation"];
  repoCategoryCache.set(repo, result);
  return result;
};

const getFilterCounts = (repos: GitHubRepository[]): Record<ProjectCategory, number> => {
  const counts: Record<ProjectCategory, number> = { All: repos.length, SOC: 0, DFIR: 0, Automation: 0 };
  for (const repo of repos) {
    for (const cat of getCategoriesForRepo(repo)) counts[cat]++;
  }
  return counts;
};

// ── Pure module-level helpers (never re-created per render) ────────────────
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
}, (prev, next) => prev.repo.id === next.repo.id); // تحسين بسيط هنا: مقارنة الـ ID فقط بدلاً من الكائن بالكامل

ProjectItem.displayName = "ProjectItem";

// ── ProjectSkeleton ────────────────────────────────────────────────────────
const ProjectSkeleton = memo<ProjectSkeletonProps>(({ index }) => (
  <MotionInView className={`${styles["project-item"]} ${index % 2 !== 0 ? styles.right : styles.left}`}>
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
  </MotionInView>
));

ProjectSkeleton.displayName = "ProjectSkeleton";

const SKELETONS = Array.from({ length: 6 }, (_, i) => (
  <ProjectSkeleton key={`skeleton-${i}`} index={i} />
));

// ── Main section ───────────────────────────────────────────────────────────
const SenseiProjects = memo(function SenseiProjects() {
  // تم تنظيف عملية الاستخراج لتطابق الـ Hook الجديد بالضبط
  const {
    repos, isLoading, source, loadError,
    hasMore, isLoadingMore, loadRemainingRepos, refresh,
  } = useGitHubRepos();

  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filterCounts = useMemo(() => getFilterCounts(repos), [repos]);

  const filteredRepos = useMemo(() => {
    if (activeFilter === "All") return repos;
    return repos.filter((r) => getCategoriesForRepo(r).includes(activeFilter));
  }, [repos, activeFilter]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeFilter]);

  const handleShowMore = useCallback(async () => {
    if (visibleCount < filteredRepos.length) {
      setVisibleCount((n) => Math.min(filteredRepos.length, n + PAGE_SIZE));
      return;
    }
    if (hasMore && !isLoadingMore) {
      await loadRemainingRepos();
      setVisibleCount((n) => n + PAGE_SIZE);
    }
  }, [visibleCount, filteredRepos.length, hasMore, isLoadingMore, loadRemainingRepos]);

  const summaryText = isLoading
    ? "Loading project data from GitHub..."
    : `${filteredRepos.length} project${filteredRepos.length === 1 ? "" : "s"} shown`;

  return (
    <section className={styles["section-projects"]} id="Projects">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="計画" englishText="Projects" titleClassName={styles.title} />
          <p className={styles.sectionLead}>
            GitHub-backed work, grouped by security focus so the right examples are easier to scan.
          </p>
        </div>

        <div className={styles["projects-filter"]} role="group" aria-label="Project category filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles["filter-btn"]} ${activeFilter === f ? styles.active : ""}`}
              aria-pressed={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            >
              <span>{f}</span>
              <span className={styles["filter-count"]}>{filterCounts[f]}</span>
            </button>
          ))}
        </div>

        <div className={styles["section-summary"]} aria-live="polite">
          <p>
            {summaryText} • Focused on SOC, DFIR, and automation work.
            {source === "cache"  ? " Showing cached repositories."        : ""}
            {source === "static" ? " Showing curated fallback projects."   : ""}
          </p>
          {!isLoading && (
            <button type="button" className={styles["refresh-btn"]} onClick={refresh} aria-label="Refresh project data from GitHub">
              Refresh data
            </button>
          )}
        </div>

        {loadError  && <p className={styles["empty-state-hint"]} role="alert">{loadError}</p>}

        <div className={styles["projects-timeline"]} aria-label="Projects Timeline">
          {isLoading ? (
            SKELETONS
          ) : filteredRepos.length > 0 ? (
            filteredRepos.slice(0, visibleCount).map((repo, index) => (
              <ProjectItem key={repo.id} repo={repo} isRight={index % 2 !== 0} />
            ))
          ) : (
            <div className={styles["empty-state"]}>
              <p>{repos.length === 0 ? "Loading projects from GitHub..." : "No projects match this filter yet."}</p>
              <span className={styles["empty-state-hint"]}>Try another category or clear the filter to see the full set.</span>
              {!isLoading && activeFilter !== "All" && (
                <button type="button" className={styles["reset-filter-btn"]} onClick={() => setActiveFilter("All")}>
                  Show all projects
                </button>
              )}
            </div>
          )}
        </div>

        {!isLoading && (filteredRepos.length > visibleCount || hasMore) && (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => void handleShowMore()}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading..." : "Show more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
});

export default SenseiProjects;