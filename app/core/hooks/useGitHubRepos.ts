"use client";

/*
 * File: useGitHubRepos.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Fetch and expose GitHub repositories data with retry handling
 */

import { useState, useEffect } from "react";
import { GITHUB_USERNAME, staticProjectFallback } from "@/app/core/data";

// ─── Constants ────────────────────────────────────────────────────────────────

// Constructed once at module load — not rebuilt on every hook call.
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
const REPO_CACHE_KEY = "portfolio_github_repos_cache_v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GitHubRepository {
  id: number;
  name: string;
  description: string;
  language: string;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
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

type RepoSource = "live" | "cache" | "static";

export const useGitHubRepos = (): {
  repos: GitHubRepository[];
  isLoading: boolean;
  source: RepoSource;
  loadError: string | null;
  cacheUpdatedAt: string | null;
} => {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<RepoSource>("live");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cacheUpdatedAt, setCacheUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    // Abort controller prevents a stale setState call if the component unmounts
    // before the fetch resolves (e.g. during fast navigation).
    const controller = new AbortController();

    const fetchRepos = async (): Promise<void> => {
      const maxRetries = 3;
      const baseDelay = 1000;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(API_URL, { signal: controller.signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data: unknown = await response.json();
          // Validate that data is an array before setting state
          if (Array.isArray(data) && data.length > 0) {
            const normalized = data as GitHubRepository[];
            setRepos(normalized);
            setSource("live");
            setLoadError(null);
            try {
              const nowIso = new Date().toISOString();
              window.localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({
                updatedAt: nowIso,
                items: normalized,
              }));
              setCacheUpdatedAt(nowIso);
            } catch {
              // Ignore cache failures.
            }
            setIsLoading(false);
            return; // Success — exit early
          } else {
            console.warn("GitHub API returned unexpected data format");
            setRepos(staticProjectFallback as unknown as GitHubRepository[]);
            setSource("static");
            setLoadError("GitHub returned empty data. Showing curated fallback projects.");
            setIsLoading(false);
            return;
          }
        } catch (error) {
          // Ignore abort errors — they are expected on unmount.
          if (error instanceof Error && error.name === "AbortError") {
            setIsLoading(false);
            return;
          }

          const isLastAttempt = attempt === maxRetries - 1;
          if (isLastAttempt) {
            if (error instanceof Error) {
              console.error("Failed to fetch repositories after retries:", error.message);
              setLoadError(error.message);
            }
            try {
              const raw = window.localStorage.getItem(REPO_CACHE_KEY);
              if (raw) {
                const parsed = JSON.parse(raw) as { updatedAt?: string; items?: GitHubRepository[] };
                if (Array.isArray(parsed.items) && parsed.items.length > 0) {
                  setRepos(parsed.items);
                  setSource("cache");
                  setLoadError("Live GitHub data is unavailable. Showing cached repositories.");
                  setCacheUpdatedAt(parsed.updatedAt || null);
                  setIsLoading(false);
                  return;
                }
              }
            } catch {
              // Ignore cache parse failures.
            }

            setRepos(staticProjectFallback as unknown as GitHubRepository[]);
            setSource("static");
            setLoadError("Live GitHub data is unavailable. Showing curated fallback projects.");
            setIsLoading(false);
          } else {
            // Exponential backoff: 1s, 2s, 4s
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    };

    fetchRepos();
    return () => controller.abort();
  }, []); // No external dependencies — API_URL is a module-level constant.

  return { repos, isLoading, source, loadError, cacheUpdatedAt };
};