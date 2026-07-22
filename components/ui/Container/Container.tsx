import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function Container({ className = "", ...props }: Props) {
  return <div className={`ds-container ${className}`.trim()} {...props} />;
}
