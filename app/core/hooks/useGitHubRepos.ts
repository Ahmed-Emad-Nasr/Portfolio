"use client";

/*
 * File: useGitHubRepos.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Fetch and expose GitHub repositories data with retry handling
 */

import { useEffect, useRef, useState } from "react";
import { GITHUB_USERNAME, staticProjectFallback } from "@/app/core/data/projects";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 4;
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=${PAGE_SIZE}&type=owner&page=`;
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

type RepoSource = "live" | "cache" | "static";

type RepoCachePayload = {
  updatedAt?: string;
  items?: GitHubRepository[];
  hasMore?: boolean;
  nextPage?: number;
};

type ValidCachedRepos = {
  updatedAt: string | null;
  items: GitHubRepository[];
  isFresh: boolean;
  hasMore: boolean;
  nextPage: number;
};

// ─── Pure Utilities (hoisted outside hook — never recreated) ──────────────────

// Fix #3: Hoisted outside hook — defined once, never recreated per render/effect.
function readCachedRepos(): ValidCachedRepos | null {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as RepoCachePayload;
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;

    const updatedAt = parsed.updatedAt ?? null;
    const updatedMs = updatedAt ? new Date(updatedAt).getTime() : NaN;
    const isFresh = Number.isFinite(updatedMs) ? Date.now() - updatedMs <= CACHE_TTL_MS : false;

    return {
      updatedAt,
      items: parsed.items,
      isFresh,
      hasMore: parsed.hasMore ?? parsed.items.length === PAGE_SIZE,
      // Fix #6: Store nextPage in cache payload instead of recalculating from length.
      nextPage: parsed.nextPage ?? Math.ceil(parsed.items.length / PAGE_SIZE) + 1,
    };
  } catch {
    return null;
  }
}

function writeCachePayload(items: GitHubRepository[], hasMore: boolean, nextPage: number): string | null {
  try {
    const nowIso = new Date().toISOString();
    localStorage.setItem(
      REPO_CACHE_KEY,
      JSON.stringify({ updatedAt: nowIso, items, hasMore, nextPage } satisfies RepoCachePayload)
    );
    return nowIso;
  } catch {
    return null;
  }
}

// Fix #1: Hoisted outside hook — plain async function, no useCallback overhead.
async function fetchRepoPage(page: number, signal: AbortSignal): Promise<GitHubRepository[]> {
  const response = await fetch(`${API_URL}${page}`, {
    signal,
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as GitHubRepository[]) : [];
}

// Fix #4: Abort-aware sleep — clears the timer and rejects on unmount signal
// so no ghost setTimeout survives component teardown during retry backoff.
function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("AbortError", "AbortError")); return; }
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("AbortError", "AbortError"));
    }, { once: true });
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGitHubRepos = (): {
  repos: GitHubRepository[];
  isLoading: boolean;
  source: RepoSource;
  loadNotice: string | null;
  loadError: string | null;
  cacheUpdatedAt: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadRemainingRepos: () => Promise<void>;
  refresh: () => void;
} => {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageToLoad, setNextPageToLoad] = useState(2);
  const [source, setSource] = useState<RepoSource>("live");
  const [loadNotice, setLoadNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cacheUpdatedAt, setCacheUpdatedAt] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  // Fix #2: useRef guard instead of useCallback with stale-prone dep array.
  const loadingMoreRef = useRef(false);

  // Fix #7: Lifecycle-linked ref for load-more fetches — aborted on unmount.
  const loadMoreControllerRef = useRef<AbortController | null>(null);

  const refresh = (): void => {
    setIsLoading(true);
    setIsLoadingMore(false);
    setHasMore(true);
    setNextPageToLoad(2);
    setLoadNotice(null);
    setRefreshNonce((n) => n + 1);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchRepos = async (): Promise<void> => {
      const maxRetries = 3;
      const baseDelay = 1000;

      const setCachedState = (cached: ValidCachedRepos, message: string): void => {
        setRepos(cached.items);
        setSource("cache");
        setCacheUpdatedAt(cached.updatedAt);
        setHasMore(cached.hasMore);
        setNextPageToLoad(cached.nextPage);
        setLoadNotice(
          cached.isFresh ? message : `${message} Cached data is older than ${CACHE_TTL_HOURS}h.`
        );
        setLoadError(null);
        setIsLoading(false);
      };

      // Fix #3: Called once, result reused across all fallback paths — no double parse.
      const cachedSnapshot = readCachedRepos();
      if (cachedSnapshot) {
        setCachedState(cachedSnapshot, "Showing cached repositories while checking for updates.");
      }

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const normalized = await fetchRepoPage(1, controller.signal);

          if (normalized.length > 0) {
            const hasMorePages = normalized.length === PAGE_SIZE;
            const nowIso = writeCachePayload(normalized, hasMorePages, 2);
            setRepos(normalized);
            setSource("live");
            setHasMore(hasMorePages);
            setNextPageToLoad(2);
            setLoadNotice(null);
            setLoadError(null);
            if (nowIso) setCacheUpdatedAt(nowIso);
            setIsLoading(false);
            return;
          } else {
            if (process.env.NODE_ENV === "development") {
              console.warn("GitHub API returned unexpected data format");
            }
            if (cachedSnapshot) {
              setCachedState(cachedSnapshot, "GitHub returned empty data. Showing cached repositories.");
              return;
            }
            setRepos(staticProjectFallback as unknown as GitHubRepository[]);
            setSource("static");
            setHasMore(false);
            setNextPageToLoad(2);
            setLoadNotice("GitHub returned empty data. Showing curated fallback projects.");
            setLoadError(null);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            setIsLoading(false);
            return;
          }

          const isLastAttempt = attempt === maxRetries - 1;
          if (isLastAttempt) {
            if (error instanceof Error && process.env.NODE_ENV === "development") {
              console.error("Failed to fetch repositories after retries:", error.message);
            }
            if (cachedSnapshot) {
              setCachedState(cachedSnapshot, "Live GitHub data is unavailable. Showing cached repositories.");
              return;
            }
            setRepos(staticProjectFallback as unknown as GitHubRepository[]);
            setSource("static");
            setHasMore(false);
            setNextPageToLoad(2);
            setLoadNotice(null);
            setLoadError("Live GitHub data is unavailable. Showing curated fallback projects.");
            setIsLoading(false);
          } else {
            // Fix #4: Abort-aware backoff — timer is cleared if component unmounts mid-retry.
            await abortableSleep(baseDelay * Math.pow(2, attempt), controller.signal);
          }
        }
      }
    };

    fetchRepos();
    return () => controller.abort();
  }, [refreshNonce]);

  // Fix #7: Abort load-more fetches on unmount.
  useEffect(() => {
    return () => { loadMoreControllerRef.current?.abort(); };
  }, []);

  // Fix #2: Plain async function — ref guard replaces useCallback with stale dep array.
  const loadRemainingRepos = async (): Promise<void> => {
    if (isLoading || loadingMoreRef.current || !hasMore) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadNotice(null);

    loadMoreControllerRef.current?.abort();
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;

    try {
      const pageItems = await fetchRepoPage(nextPageToLoad, controller.signal);

      if (pageItems.length > 0) {
        // Fix #5: localStorage write outside state updater — no side effects in pure fn.
        const merged = [...repos, ...pageItems];
        const hasMorePages = pageItems.length === PAGE_SIZE;
        const nextPage = nextPageToLoad + 1;
        const nowIso = writeCachePayload(merged, hasMorePages, nextPage);
        setRepos(merged);
        setHasMore(hasMorePages);
        setNextPageToLoad(nextPage);
        if (nowIso) setCacheUpdatedAt(nowIso);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        setLoadError("Could not load more projects right now. Try again later.");
      }
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  };

  return {
    repos,
    isLoading,
    source,
    loadNotice,
    loadError,
    cacheUpdatedAt,
    hasMore,
    isLoadingMore,
    loadRemainingRepos,
    refresh,
  };
};