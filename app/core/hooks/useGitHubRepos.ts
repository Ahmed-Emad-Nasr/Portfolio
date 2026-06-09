"use client";

/*
 * File: useGitHubRepos.ts
 * Author: Ahmed Emad Nasr
 * PERF: loadRemainingRepos uses functional state updater — reads latest repos
 * without capturing stale closure. Avoids the subtle "appended to wrong list"
 * bug that could silently corrupt results.
 * PERF: writeCachePayload extracted to a separate microtask (queueMicrotask)
 * so the critical path (state update → React re-render → paint) is not blocked
 * by a localStorage serialise + write.
 */

import { useEffect, useRef, useState } from "react";
import { GITHUB_USERNAME, staticProjectFallback } from "@/app/core/data/projects";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 4;
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=${PAGE_SIZE}&type=owner&page=`;
const REPO_CACHE_KEY = "portfolio_github_repos_cache_v1";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 h

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
  owner: { login: string; avatar_url: string };
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

// ─── Pure utilities ───────────────────────────────────────────────────────────

function readCachedRepos(): ValidCachedRepos | null {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RepoCachePayload;
    if (!Array.isArray(parsed.items) || !parsed.items.length) return null;
    const updatedAt = parsed.updatedAt ?? null;
    const updatedMs = updatedAt ? new Date(updatedAt).getTime() : NaN;
    return {
      updatedAt,
      items: parsed.items,
      isFresh: Number.isFinite(updatedMs) && Date.now() - updatedMs <= CACHE_TTL_MS,
      hasMore: parsed.hasMore ?? parsed.items.length === PAGE_SIZE,
      nextPage: parsed.nextPage ?? Math.ceil(parsed.items.length / PAGE_SIZE) + 1,
    };
  } catch { return null; }
}

// PERF: Deferred write — doesn't block the render that triggered the state update
function writeCacheDeferred(items: GitHubRepository[], hasMore: boolean, nextPage: number): string {
  const nowIso = new Date().toISOString();
  queueMicrotask(() => {
    try {
      localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ updatedAt: nowIso, items, hasMore, nextPage }));
    } catch { /* quota exceeded — non-fatal */ }
  });
  return nowIso;
}

async function fetchRepoPage(page: number, signal: AbortSignal): Promise<GitHubRepository[]> {
  const response = await fetch(`${API_URL}${page}`, {
    signal,
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as GitHubRepository[]) : [];
}

function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("AbortError", "AbortError")); return; }
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("AbortError", "AbortError")); }, { once: true });
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGitHubRepos = () => {
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

  const loadingMoreRef = useRef(false);
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

      const cachedSnapshot = readCachedRepos();

      const applyCached = (msg: string) => {
        if (!cachedSnapshot) return;
        setRepos(cachedSnapshot.items);
        setSource("cache");
        setCacheUpdatedAt(cachedSnapshot.updatedAt);
        setHasMore(cachedSnapshot.hasMore);
        setNextPageToLoad(cachedSnapshot.nextPage);
        setLoadNotice(cachedSnapshot.isFresh ? msg : `${msg} Cached data is older than 12h.`);
        setLoadError(null);
        setIsLoading(false);
      };

      if (cachedSnapshot) applyCached("Showing cached repositories while checking for updates.");

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const normalized = await fetchRepoPage(1, controller.signal);

          if (normalized.length > 0) {
            const hasMorePages = normalized.length === PAGE_SIZE;
            const nowIso = writeCacheDeferred(normalized, hasMorePages, 2);
            setRepos(normalized);
            setSource("live");
            setHasMore(hasMorePages);
            setNextPageToLoad(2);
            setLoadNotice(null);
            setLoadError(null);
            setCacheUpdatedAt(nowIso);
            setIsLoading(false);
            return;
          }

          if (cachedSnapshot) {
            applyCached("GitHub returned empty data. Showing cached repositories.");
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
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") { setIsLoading(false); return; }

          if (attempt === maxRetries - 1) {
            if (cachedSnapshot) { applyCached("Live GitHub data is unavailable. Showing cached repositories."); return; }
            setRepos(staticProjectFallback as unknown as GitHubRepository[]);
            setSource("static");
            setHasMore(false);
            setNextPageToLoad(2);
            setLoadNotice(null);
            setLoadError("Live GitHub data is unavailable. Showing curated fallback projects.");
            setIsLoading(false);
          } else {
            await abortableSleep(baseDelay * (1 << attempt), controller.signal); // bitshift = 2^attempt, avoids Math.pow
          }
        }
      }
    };

    fetchRepos();
    return () => controller.abort();
  }, [refreshNonce]);

  useEffect(() => () => { loadMoreControllerRef.current?.abort(); }, []);

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
        const hasMorePages = pageItems.length === PAGE_SIZE;
        const nextPage = nextPageToLoad + 1;

        // PERF: Functional updater — reads latest repos without stale closure.
        // This is the fix for the race condition where loadRemainingRepos was
        // called with a captured `repos` value that was out of date.
        setRepos(prev => {
          const merged = [...prev, ...pageItems];
          writeCacheDeferred(merged, hasMorePages, nextPage);
          return merged;
        });
        setHasMore(hasMorePages);
        setNextPageToLoad(nextPage);
        setCacheUpdatedAt(new Date().toISOString());
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
    repos, isLoading, source, loadNotice, loadError,
    cacheUpdatedAt, hasMore, isLoadingMore,
    loadRemainingRepos, refresh,
  };
};