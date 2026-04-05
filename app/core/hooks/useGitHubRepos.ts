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
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=24&type=owner`;
const REPO_CACHE_KEY = "portfolio_github_repos_cache_v1";
const CACHE_TTL_HOURS = 12;
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;

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

type RepoCachePayload = {
  updatedAt?: string;
  items?: GitHubRepository[];
};

type ValidCachedRepos = {
  updatedAt: string | null;
  items: GitHubRepository[];
  isFresh: boolean;
};

export const useGitHubRepos = (): {
  repos: GitHubRepository[];
  isLoading: boolean;
  source: RepoSource;
  loadNotice: string | null;
  loadError: string | null;
  cacheUpdatedAt: string | null;
  refresh: () => void;
} => {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<RepoSource>("live");
  const [loadNotice, setLoadNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cacheUpdatedAt, setCacheUpdatedAt] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const refresh = (): void => {
    setIsLoading(true);
    setLoadNotice(null);
    setRefreshNonce((current) => current + 1);
  };

  useEffect(() => {
    // Abort controller prevents a stale setState call if the component unmounts
    // before the fetch resolves (e.g. during fast navigation).
    const controller = new AbortController();

    const fetchRepos = async (): Promise<void> => {
      const maxRetries = 3;
      const baseDelay = 1000;

      const readCachedRepos = (): ValidCachedRepos | null => {
        try {
          const raw = window.localStorage.getItem(REPO_CACHE_KEY);
          if (!raw) return null;

          const parsed = JSON.parse(raw) as RepoCachePayload;
          if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;

          const updatedAt = parsed.updatedAt ?? null;
          const updatedMs = updatedAt ? new Date(updatedAt).getTime() : NaN;
          const isFresh = Number.isFinite(updatedMs) ? (Date.now() - updatedMs) <= CACHE_TTL_MS : false;

          return {
            updatedAt,
            items: parsed.items,
            isFresh,
          };
        } catch {
          return null;
        }
      };

      const setCachedState = (cached: ValidCachedRepos, message: string): void => {
        setRepos(cached.items);
        setSource("cache");
        setCacheUpdatedAt(cached.updatedAt);
        setLoadNotice(
          cached.isFresh
            ? message
            : `${message} Cached data is older than ${CACHE_TTL_HOURS}h.`
        );
        setLoadError(null);
        setIsLoading(false);
      };

      const cachedSnapshot = readCachedRepos();
      if (cachedSnapshot) {
        setCachedState(cachedSnapshot, "Showing cached repositories while checking for updates.");
      }

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(API_URL, {
            signal: controller.signal,
            headers: { Accept: "application/vnd.github+json" },
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data: unknown = await response.json();
          // Validate that data is an array before setting state
          if (Array.isArray(data) && data.length > 0) {
            const normalized = data as GitHubRepository[];
            setRepos(normalized);
            setSource("live");
            setLoadNotice(null);
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
            const cached = readCachedRepos();
            if (cached) {
              setCachedState(cached, "GitHub returned empty data. Showing cached repositories.");
              return;
            }
            setRepos(staticProjectFallback as unknown as GitHubRepository[]);
            setSource("static");
            setLoadNotice("GitHub returned empty data. Showing curated fallback projects.");
            setLoadError(null);
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
            }

            const cached = readCachedRepos();
            if (cached) {
              setCachedState(cached, "Live GitHub data is unavailable. Showing cached repositories.");
              return;
            }

            setRepos(staticProjectFallback as unknown as GitHubRepository[]);
            setSource("static");
            setLoadNotice(null);
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
  }, [refreshNonce]); // API_URL is module-scoped; nonce enables manual refresh.

  return { repos, isLoading, source, loadNotice, loadError, cacheUpdatedAt, refresh };
};