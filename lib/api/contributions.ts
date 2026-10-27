"use client";

import { useEffect, useState } from "react";

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

type ContributionStatus = "loading" | "ready" | "empty" | "error";

export interface ContributionStats {
  status: ContributionStatus;
  days: ContributionDay[];
  total: number;
}

/** Last-year GitHub contributions (public API), fetched once the section is
 *  near the viewport (`enabled`) */
export function useContributionStats(username: string, enabled = true): ContributionStats {
  const [status, setStatus] = useState<ContributionStatus>("loading");
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const ctrl = new AbortController();
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list: ContributionDay[] = Array.isArray(data?.contributions)
          ? data.contributions
          : [];
        if (list.length === 0) {
          setStatus("empty");
          return;
        }
        setDays(list.slice(-182));
        setTotal(
          Number(data?.total?.lastYear ?? list.reduce((s, d) => s + d.count, 0))
        );
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [username, enabled]);

  return { status, days, total };
}
