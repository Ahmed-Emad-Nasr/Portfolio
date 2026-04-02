"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/app/core/utils/analytics";

export default function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    trackEvent("web_vital", {
      metric_name: metric.name,
      metric_value: Number(metric.value.toFixed(2)),
      metric_id: metric.id,
      metric_rating: metric.rating,
      metric_delta: Number(metric.delta.toFixed(2)),
      navigation_type: metric.navigationType,
    });
  });

  return null;
}
