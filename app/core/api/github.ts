import { PORTFOLIO_DATA } from "../config/portfolio-data";
import { staticProjectFallback } from "../config/projects";

export interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  license: { spdx_id: string } | null;
}

const repoName = (url: string) => url.replace(/\/+$/, "").split("/").pop() ?? url;

/* Used when the GitHub API can't be reached at build time: the same repos,
   from the static copy in config/projects.ts (stars as last recorded). */
function getFallbackRepos(): Repo[] {
  const pinnedRepos = PORTFOLIO_DATA.projects.pinnedRepos || [];
  return pinnedRepos.map((name, index) => {
    const known = staticProjectFallback.find((r) => repoName(r.html_url) === name);
    const highlight = PORTFOLIO_DATA.projects.highlights.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return {
      id: 1000 + index,
      name,
      description: known?.description || highlight?.description || "Open-source security project.",
      html_url: known?.html_url || highlight?.link || `https://github.com/${PORTFOLIO_DATA.projects.githubUsername}/${name}`,
      homepage: known?.homepage ?? "",
      stargazers_count: known?.stargazers_count ?? 0,
      language: known?.language ?? "Python",
      topics: known ? [...known.topics] : [],
      license: known?.license ? { spdx_id: "MIT" } : null,
    };
  });
}

export async function getGitHubRepos(): Promise<Repo[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${PORTFOLIO_DATA.projects.githubUsername}/repos?sort=updated&per_page=100`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      // Filter only pinned repos defined in PORTFOLIO_DATA
      /* Matched case-insensitively, and any pinned repo the API did not
         return is filled in from the static copy — so a renamed repo or a
         capital letter can no longer drop a project from the grid (six were
         pinned, five were shown). */
      const pinned = (PORTFOLIO_DATA.projects.pinnedRepos || []).map((n) => n.toLowerCase());
      const live = new Map<string, Repo>(
        data.filter((repo: Repo) => pinned.includes(repo.name.toLowerCase())).map((repo: Repo) => [repo.name.toLowerCase(), repo]),
      );
      if (live.size === 0) return getFallbackRepos();
      const fallback = getFallbackRepos();
      return pinned.map((name, i) => live.get(name) ?? fallback[i]).filter(Boolean);
    }
    return getFallbackRepos();
  } catch (error) {
    console.error("Error fetching GitHub repos, using fallback data:", error);
    return getFallbackRepos();
  }
}
