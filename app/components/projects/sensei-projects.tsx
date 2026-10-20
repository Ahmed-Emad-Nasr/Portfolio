"use client";

/*
 * sensei-projects.tsx  —  STATIC ULTRA FAST BUILD (MINIMALIST)
 */

import { memo } from "react";

import Icon from "@/app/core/icons/Icon";
import styles from "./sensei-projects.module.css";
import { type GitHubRepository, getIconForLanguage, formatRepoDate, toBulletItems } from "@/app/core/utils/utils";
import SectionHeader from "@/app/core/components/SectionHeader";
import Reveal from "@/app/core/components/Reveal";
import Spotlight from "@/app/core/components/Spotlight";
import { projectBullets, staticProjectFallback } from "@/app/core/config/projects";

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
  /*
   * It was: `Open-source impact: ${stars} stars • ${forks} forks • ${watchers} watchers.`
   *
   * Every number in config/projects.ts is a hand-written zero (except
   * Threat-Intelligence-Tool at 10) — because the GitHub fetch was removed in an
   * earlier version and the line stayed. The result was that the site announced on 6 of 7 projects:
   *
   *     "Open-source impact: 0 stars • 0 forks • 0 watchers."
   *
   * So the line that was supposed to sell the work was saying the work had no impact.
   *
   * Now the line is only shown when there's a real number worth showing. Otherwise it states
   * what was done instead of what was measured — which is right for a project that's still new.
   *
   * ⭐ If you want the real numbers: fetch the data from the GitHub API in a GitHub Action
   *    at build time and write it into config/projects.ts. No need for any fetch
   *    from the browser.
   */
  const engagement = repo.stargazers_count + repo.forks_count;
  const result = engagement > 0
    ? `Open-source traction: ${repo.stargazers_count} stars • ${repo.forks_count} forks.`
    : `Published as open source${repo.language ? ` in ${repo.language}` : ""}, with the full methodology documented in the repository.`;

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
    <Reveal className={`${styles["project-item"]} ${isRight ? styles.right : styles.left}`}>
      <article className={styles["single-project"]} data-fx="card">
        <div className={styles["part-1"]}>
          <Icon name={getIconForLanguage(repo.language)} />
          <h3>
            <a
              className={styles["title-link"]}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open project ${repo.name} on GitHub`}
            >
              {repo.name} <Icon name="faArrowUpRightFromSquare" className={styles["link-icon"]} />
            </a>
          </h3>
        </div>

        <div className={styles["part-2"]}>
          <ul className={styles["description-list"]}>
            {descriptionBullets.map((item, idx) => (
              <li key={`${repo.id}-${idx}`}>{item}</li>
            ))}
          </ul>

          {/* These badges used to be shown always, and the numbers in config/projects.ts
              are all zeros — so the site printed "0 ⭐ 0 🍴 0 👁" on 6 projects
              out of 7. A displayed zero reads as "nobody cares"; a missing badge reads
              as "the number doesn't matter here". The badge only appears when it actually has a number. */}
          <div className={styles["stats-container"]}>
            {repo.stargazers_count > 0 && (
              <span className={styles["stat-badge"]} aria-label={`${repo.stargazers_count} stars`}>
                <Icon name="faStar" aria-hidden="true" /> {repo.stargazers_count}
              </span>
            )}
            {repo.forks_count > 0 && (
              <span className={styles["stat-badge"]} aria-label={`${repo.forks_count} forks`}>
                <Icon name="faCodeBranch" aria-hidden="true" /> {repo.forks_count}
              </span>
            )}
            {repo.watchers_count > 0 && (
              <span className={styles["stat-badge"]} aria-label={`${repo.watchers_count} watchers`}>
                <Icon name="faEye" aria-hidden="true" /> {repo.watchers_count}
              </span>
            )}
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
            <span>Upd: {formatRepoDate(repo.updated_at)}</span>
          </div>

          <div className={styles["case-study"]}>
            <p><strong>Problem:</strong> {caseStudy.problem}</p>
            <p><strong>Action:</strong>  {caseStudy.action}</p>
            <p><strong>Result:</strong>  {caseStudy.result}</p>
          </div>

          <div className={styles["project-actions"]}>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" data-fx="btn" data-btn="ghost" data-tone="main" className={styles.grow} aria-label={`Open live project for ${repo.name}`}>
              <Icon name="faCirclePlay" /> Live
            </a>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" data-fx="btn" data-btn="ghost" className={styles.grow} aria-label={`Open source code for ${repo.name}`}>
              <Icon name="faCode" /> Code
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}, (prev, next) => prev.repo.id === next.repo.id);

ProjectItem.displayName = "ProjectItem";

// ── Main section ───────────────────────────────────────────────────────────
const SenseiProjects = memo(function SenseiProjects() {
  const repos = staticProjectFallback as unknown as GitHubRepository[];

  return (
    <section data-fx="section" id="Projects">
      <div data-fx="container">
        <div data-fx="section-head">
          <SectionHeader japaneseText="計画" englishText="Projects" />
        </div>

        <Spotlight data-fx="timeline" aria-label="Projects Timeline">
          {repos.map((repo, index) => (
            <ProjectItem key={repo.id} repo={repo} isRight={index % 2 !== 0} />
          ))}
        </Spotlight>
      </div>
    </section>
  );
});

export default SenseiProjects;