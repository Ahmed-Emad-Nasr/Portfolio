"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import {
  fetchRemoteInsightsWithStatus,
  getFunnelStats,
  type RemoteEventItem,
} from "@/app/core/utils/engagement";
import { showToast } from "@/app/core/utils/toast";

const STATS_STORAGE_KEY = "portfolio_funnel_stats_v1";
const RETRY_MS = 30_000;
const REMOTE_URL_SET = Boolean(process.env.NEXT_PUBLIC_REMOTE_INSIGHTS_URL);

export default function InsightsClient() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [remoteEvents, setRemoteEvents] = useState<RemoteEventItem[]>([]);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [remoteStatus, setRemoteStatus] = useState<"ok" | "empty" | "error">("empty");
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [localStats, setLocalStats] = useState(() => getFunnelStats());
  const [stats, setStats] = useState(localStats);

  useEffect(() => {
    setLocalStats(getFunnelStats());
  }, [refreshTick]);

  const loadInsights = useCallback(async () => {
    setIsLoadingRemote(true);

    const remoteResult = await fetchRemoteInsightsWithStatus();
    if (!remoteResult.ok || !remoteResult.data) {
      setStats(localStats);
      setRemoteConnected(false);
      setRemoteEvents([]);
      setRemoteStatus(remoteResult.reason === "not-configured" ? "empty" : "error");
      setIsLoadingRemote(false);
      return;
    }

    setStats({ ...localStats, ...(remoteResult.data.stats || {}) });
    setRemoteConnected(true);
    setRemoteEvents(remoteResult.data.recentEvents || []);
    setRemoteStatus("ok");
    setIsLoadingRemote(false);
  }, [localStats]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    if (!REMOTE_URL_SET) return;

    const intervalId = window.setInterval(() => {
      void loadInsights();
    }, RETRY_MS);

    return () => window.clearInterval(intervalId);
  }, [loadInsights]);

  const entries = [
    ["Site visits", stats.site_visit],
    ["CV previews", stats.cv_preview],
    ["Resume previews", stats.resume_preview],
    ["CV downloads", stats.cv_download],
    ["Resume downloads", stats.resume_download],
    ["Contact success", stats.contact_submit_success],
    ["Home section views", stats.section_view_home],
    ["About section views", stats.section_view_about],
    ["Projects section views", stats.section_view_projects],
    ["Services section views", stats.section_view_services],
    ["Contact section views", stats.section_view_contact],
  ] as const;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Portfolio Funnel Dashboard</h1>
        <p className={styles.subtitle}>
          {remoteConnected
            ? "Connected to remote insights source."
            : "Local fallback mode (set NEXT_PUBLIC_REMOTE_INSIGHTS_URL for online dashboard)."}
        </p>

        {isLoadingRemote ? <p className={styles.stateInfo}>Syncing remote data...</p> : null}
        {remoteStatus === "empty" ? (
          <p className={styles.stateWarn}>
            Remote insights are not configured yet. Showing local browser stats only.
          </p>
        ) : null}
        {remoteStatus === "error" ? (
          <p className={styles.stateError}>
            Remote insights endpoint is currently unavailable. Auto-retrying every 30 seconds.
          </p>
        ) : null}

        <section className={styles.grid}>
          {entries.map(([label, value]) => (
            <article key={label} className={styles.card}>
              <p className={styles.label}>{label}</p>
              <p className={styles.value}>{value}</p>
            </article>
          ))}
        </section>

        <div className={styles.actions}>
          <button
            className={styles.btn}
            type="button"
            onClick={() => {
              setRefreshTick((prev) => prev + 1);
              showToast({ type: "info", message: "Dashboard refreshed." });
            }}
          >
            Refresh
          </button>
          <button
            className={styles.btn}
            type="button"
            onClick={() => {
              window.localStorage.removeItem(STATS_STORAGE_KEY);
              setRefreshTick((prev) => prev + 1);
              showToast({ type: "info", message: "Local stats cleared." });
            }}
          >
            Clear Local Stats
          </button>
          <Link className={styles.btn} href="/">
            Back To Portfolio
          </Link>
        </div>

        {remoteEvents.length ? (
          <section className={styles.events}>
            <h2 className={styles.eventsTitle}>Recent Events</h2>
            <div className={styles.eventsList}>
              {remoteEvents.slice(0, 10).map((item, index) => (
                <article className={styles.eventItem} key={`${item.timestamp}-${item.event}-${index}`}>
                  <p className={styles.eventName}>{item.event}</p>
                  <p className={styles.eventTime}>{item.timestamp}</p>
                  {item.details ? <p className={styles.eventDetails}>{item.details}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
