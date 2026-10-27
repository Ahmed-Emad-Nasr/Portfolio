"use client";

/*
 * PageLink — next/link prefetched on intent (hover, focus, touch) instead of
 * on sight: the blog has 100+ case links, and prefetching each as it scrolls
 * into view meant dozens of downloads parsed mid-scroll.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "prefetch" | "href"> & { href: string };

export default function PageLink({ href, onMouseEnter, onFocus, onTouchStart, ...rest }: Props) {
  const router = useRouter();
  const done = useRef(false);
  const warm = () => {
    if (done.current) return;
    done.current = true;
    router.prefetch(href);
  };
  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      {...rest}
    />
  );
}
