/* Brand icons (lucide-react v1 has none), with lucide-like props, drawn
   from the FontAwesome paths in icon-data.ts (npm run icons) */

import type { SVGProps } from "react";
import { ICONS, type IconName } from "@/components/ui/icon-data";

type BrandProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  strokeWidth?: number | string;
};

function make(name: IconName, label: string) {
  function BrandIcon({ size = 24, strokeWidth: _ignored, className, ...rest }: BrandProps) {
    const [w, h, d] = ICONS[name];
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${w} ${h}`}
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={className}
        {...rest}
      >
        <path d={d} />
      </svg>
    );
  }
  BrandIcon.displayName = label;
  return BrandIcon;
}

export const Github = make("faGithub", "Github");
export const Linkedin = make("faLinkedin", "Linkedin");
export const Youtube = make("faYoutube", "Youtube");
export const Instagram = make("faInstagram", "Instagram");

/* X (formerly Twitter) — path from Simple Icons (CC0) */
export function XLogo({ size = 24, strokeWidth: _ignored, className, ...rest }: BrandProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}
