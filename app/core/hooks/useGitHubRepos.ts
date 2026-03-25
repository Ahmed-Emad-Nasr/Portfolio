"use client";

/*
 * File: useGitHubRepos.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Fetch and expose GitHub repositories data with retry handling
 */

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

export const useGitHubRepos = (): GitHubRepository[] => {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);

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
            setRepos(data as GitHubRepository[]);
            return; // Success — exit early
          } else {
            console.warn("GitHub API returned unexpected data format");
            setRepos([]);
            return;
          }
        } catch (error) {
          // Ignore abort errors — they are expected on unmount.
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          const isLastAttempt = attempt === maxRetries - 1;
          if (isLastAttempt) {
            if (error instanceof Error) {
              console.error("Failed to fetch repositories after retries:", error.message);
            }
            setRepos([]);
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

  return repos;
};