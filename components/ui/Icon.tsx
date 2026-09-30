import type { SVGProps } from "react";
type IconName = "arrow-right" | "arrow-up-right" | "arrow-up" | "chevron-left" | "chevron-right" | "check" | "pin" | "pause" | "play";
const paths: Record<IconName, string> = {
  "arrow-right": "M4 10h12M11 5l5 5-5 5",
  "arrow-up-right": "M6 14 14 6M6 6h8v8",
  "arrow-up": "M10 16V4M5 9l5-5 5 5",
  "chevron-left": "m12 5-5 5 5 5",
  "chevron-right": "m8 5 5 5-5 5",
  check: "m4 10 4 4 8-8",
  pin: "M10 18s6-6 6-10a6 6 0 0 0-12 0c0 4 6 10 6 10ZM10 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
  pause: "M7 5v10M13 5v10",
  play: "m7 4 9 6-9 6Z",
};
export function Icon({ name, className = "", ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`ds-icon ${className}`} {...props}><path d={paths[name]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
