"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GITHUB_USERNAME, staticProjectFallback } from "@/app/core/data/projects";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 4;
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=${PAGE_SIZE}&type=owner&page=`;
const REPO_CACHE_KEY = "github_repos_fast_cache";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

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

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useGitHubRepos = () => {
  const [state, setState] = useState({
    repos: [] as GitHubRepository[],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    nextPageToLoad: 2,
    source: "live" as "live" | "cache" | "static",
    loadError: null as string | null,
  });

  // نستخدم Ref لتتبع التحديثات بدون التسبب في Re-renders إضافية
  const refreshNonce = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    refreshNonce.current += 1;
    setState(p => ({ ...p, isLoading: true, loadError: null, nextPageToLoad: 2, hasMore: true }));
  }, []);

  useEffect(() => {
    // إلغاء أي طلب سابق لضمان عدم استهلاك الذاكرة
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchInitial = async () => {
      // 1. عرض الكاش فوراً إن وجد (Zero Loading Time)
      const rawCache = typeof window !== "undefined" ? localStorage.getItem(REPO_CACHE_KEY) : null;
      if (rawCache) {
        try {
          const parsed = JSON.parse(rawCache);
          if (Date.now() - parsed.ts <= CACHE_TTL_MS) {
            setState(p => ({
              ...p, repos: parsed.items, source: "cache", isLoading: false, 
              hasMore: parsed.hasMore, nextPageToLoad: parsed.nextPage 
            }));
            
            // تحديث صامت في الخلفية (Stale-While-Revalidate)
            fetch(`${API_URL}1`, { signal: controller.signal })
              .then(res => res.ok ? res.json() : Promise.reject())
              .then(data => {
                if (data.length) {
                  const hasMore = data.length === PAGE_SIZE;
                  setTimeout(() => localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: data, hasMore, nextPage: 2 })), 0);
                  setState(p => ({ ...p, repos: data, source: "live", hasMore, nextPageToLoad: 2 }));
                }
              }).catch(() => {}); // تجاهل أخطاء التحديث الصامت
            return;
          }
        } catch {} // تجاهل الأخطاء وتخطي الكاش إذا كان تالفاً
      }

      // 2. إذا لم يوجد كاش، قم بجلب البيانات (محاولة واحدة فقط، بدون تأخير)
      try {
        const res = await fetch(`${API_URL}1`, { signal: controller.signal });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const hasMore = data.length === PAGE_SIZE;
        
        setTimeout(() => localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: data, hasMore, nextPage: 2 })), 0);
        setState({ repos: data, source: "live", isLoading: false, isLoadingMore: false, hasMore, nextPageToLoad: 2, loadError: null });
      } catch (err: any) {
        if (err.name === "AbortError") return;
        
        // 3. في حال فشل الطلب فوراً يتم عرض الـ Fallback
        setState({
          repos: staticProjectFallback as unknown as GitHubRepository[],
          source: "static", isLoading: false, isLoadingMore: false, hasMore: false, 
          nextPageToLoad: 2, loadError: "GitHub data unavailable. Showing static fallback."
        });
      }
    };

    fetchInitial();
    return () => controller.abort();
  }, [refreshNonce.current]); // الاعتماد على الـ Ref لتجنب مشاكل الـ Dependencies

  const loadRemainingRepos = async () => {
    if (state.isLoading || state.isLoadingMore || !state.hasMore) return;
    setState(p => ({ ...p, isLoadingMore: true }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}${state.nextPageToLoad}`, { signal: controller.signal });
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      if (data.length > 0) {
        const hasMore = data.length === PAGE_SIZE;
        const nextPage = state.nextPageToLoad + 1;
        
        setState(p => {
          const merged = [...p.repos, ...data];
          // تحديث الكاش في الخلفية
          setTimeout(() => localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: merged, hasMore, nextPage })), 0);
          return { ...p, repos: merged, hasMore, nextPageToLoad: nextPage };
        });
      } else {
        setState(p => ({ ...p, hasMore: false }));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState(p => ({ ...p, loadError: "Failed to load more projects." }));
      }
    } finally {
      setState(p => ({ ...p, isLoadingMore: false }));
    }
  };

  return { ...state, loadRemainingRepos, refresh };
};