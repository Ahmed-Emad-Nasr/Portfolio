"use client";

import { useEffect } from "react";
import { recordFunnelEvent } from "@/app/core/utils/engagement";
import { trackEvent } from "@/app/core/utils/analytics";

type ServicePageTrackerProps = {
  slug: string;
};

export default function ServicePageTracker({ slug }: ServicePageTrackerProps) {
  useEffect(() => {
    recordFunnelEvent("service_detail_view");
    trackEvent("service_detail_view", { service: slug });
  }, [slug]);

  return null;
}
