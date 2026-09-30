import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon";

type Shared = { variant?: "primary" | "secondary" | "ghost"; tone?: "default" | "inverse"; children: ReactNode; icon?: ReactNode | false; disabled?: boolean; className?: string };
type LinkProps = Shared & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & { href: string; external?: boolean };
type ActionProps = Shared & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { href?: never; external?: never };
export function Button(props: LinkProps | ActionProps) {
  const { variant = "primary", tone = "default", children, icon, disabled, className = "", href, external, ...rest } = props;
  const classes = `ds-button ds-button--${variant} ${tone === "inverse" ? "ds-button--inverse" : ""} ${className}`.trim();
  const content = <>{children}{icon === false ? null : icon ?? (href ? <Icon name="arrow-up-right" /> : null)}</>;
  if (href !== undefined) {
    const attributes = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    if (disabled) return <a {...attributes} className={classes} role="link" aria-disabled="true" tabIndex={-1}>{content}</a>;
    if (external) return <a {...attributes} href={href} className={classes} target="_blank" rel="noopener noreferrer">{content}</a>;
    return <Link {...attributes} href={href} className={classes}>{content}</Link>;
  }
  return <button type="button" {...rest as ButtonHTMLAttributes<HTMLButtonElement>} className={classes} disabled={disabled}>{content}</button>;
}
