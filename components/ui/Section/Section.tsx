import type { HTMLAttributes } from "react";

type Tone = "white" | "soft" | "muted" | "green";
type Props = HTMLAttributes<HTMLElement> & { tone?: Tone };

export function Section({ tone = "white", className = "", ...props }: Props) {
  return <section className={`ds-section ds-section--${tone} ${className}`.trim()} {...props} />;
}
