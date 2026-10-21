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
      const pinnedRepos = PORTFOLIO_DATA.projects.pinnedRepos || [];
      const filteredRepos = data
        .filter((repo: Repo) => pinnedRepos.includes(repo.name))
        .sort((a, b) => pinnedRepos.indexOf(a.name) - pinnedRepos.indexOf(b.name));

      return filteredRepos.length > 0 ? filteredRepos : getFallbackRepos();
    }
    return getFallbackRepos();
  } catch (error) {
    console.error("Error fetching GitHub repos, using fallback data:", error);
    return getFallbackRepos();
  }
}
