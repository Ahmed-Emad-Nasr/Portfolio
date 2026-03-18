"use client";
import { useState, useEffect } from "react";
import { GITHUB_USERNAME } from "@/app/core/data";

// ─── Constants ────────────────────────────────────────────────────────────────

// Constructed once at module load — not rebuilt on every hook call.
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GitHubRepository {
  id: number;
  name: string;
  description: string;
  language: string;
  html_url: string;
  stargazers_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  topics: string[];
  default_branch: string;
  watchers_count: number;
  license: { name: string } | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGitHubRepos = (): GitHubRepository[] => {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);

  useEffect(() => {
    // Abort controller prevents a stale setState call if the component unmounts
    // before the fetch resolves (e.g. during fast navigation).
    const controller = new AbortController();

    const fetchRepos = async (): Promise<void> => {
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed to fetch repositories");
        const data: unknown = await response.json();
        // Validate that data is an array before setting state
        if (Array.isArray(data) && data.length > 0) {
          setRepos(data as GitHubRepository[]);
        } else {
          console.warn("GitHub API returned unexpected data format");
          setRepos([]);
        }
      } catch (error) {
        // Ignore abort errors — they are expected on unmount.
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching repositories:", error.message);
          setRepos([]);
        }
      }
    };

    fetchRepos();
    return () => controller.abort();
  }, []); // No external dependencies — API_URL is a module-level constant.

  return repos;
};