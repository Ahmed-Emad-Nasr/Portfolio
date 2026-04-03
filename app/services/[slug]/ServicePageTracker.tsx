"use client";

import { useEffect } from "react";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

type ServicePageTrackerProps = {
  slug: string;
};

export default function ServicePageTracker({ slug }: ServicePageTrackerProps) {
  useEffect(() => {
    recordFunnelEvent("service_detail_view");
  }, [slug]);

  return null;
}
