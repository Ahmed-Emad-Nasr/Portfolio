"use client";

/*
 * PageLink — next/link for links to post and case pages, prefetched on
 * intent instead of on sight.
 *
 * By default next/link prefetches every link the moment it scrolls into
 * view. The blog holds well over a hundred links to case pages (cards,
 * the ATT&CK matrix, the toolbox, start-here …), so a fast scroll set off
 * dozens of background downloads, each one parsed on the main thread in the
 * middle of the scroll (≈230 ms of a throttled scroll trace). Here a page is
 * fetched when the reader shows interest — the pointer reaches the link, it
 * gets keyboard focus, or a finger lands on it — which still beats the
 * click by a few hundred milliseconds.
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
