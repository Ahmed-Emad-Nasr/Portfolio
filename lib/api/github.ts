/*
 * The pinned GitHub repos, read once at build time. A repo the API does not
 * return (or a build without network) falls back to the static copy in
 * data/projects.ts, so the grid is never short.
 */

import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import { staticProjectFallback } from "@/data/projects";

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

const { githubUsername, pinnedRepos, highlights } = PORTFOLIO_DATA.projects;
const repoName = (url: string) => url.replace(/\/+$/, "").split("/").pop() ?? url;

function fallbackRepo(name: string, index: number): Repo {
  const known = staticProjectFallback.find((r) => repoName(r.html_url) === name);
  const highlight = highlights.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return {
    id: 1000 + index,
    name,
    description: known?.description || highlight?.description || "Open-source security project.",
    html_url: known?.html_url || highlight?.link || `https://github.com/${githubUsername}/${name}`,
    homepage: known?.homepage ?? "",
    stargazers_count: known?.stargazers_count ?? 0,
    language: known?.language ?? "Python",
    topics: known ? [...known.topics] : [],
    license: known?.license ? { spdx_id: "MIT" } : null,
  };
}

export async function getGitHubRepos(): Promise<Repo[]> {
  let live = new Map<string, Repo>();
  try {
    const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const data: unknown = await response.json();
    if (Array.isArray(data)) live = new Map((data as Repo[]).map((repo) => [repo.name.toLowerCase(), repo]));
  } catch (error) {
    console.warn("GitHub repos unavailable, using the static copy:", error instanceof Error ? error.message : error);
  }
  return pinnedRepos.map((name, i) => live.get(name.toLowerCase()) ?? fallbackRepo(name, i));
}
