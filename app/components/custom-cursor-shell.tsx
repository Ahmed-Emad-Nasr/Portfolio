"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("./custom-cursor"), {
  ssr: false,
  loading: () => null,
});

export default CustomCursor;