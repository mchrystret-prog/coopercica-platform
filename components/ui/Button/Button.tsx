import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "light";
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  children: ReactNode;
  external?: boolean;
};

export function Button({ href, variant = "primary", children, external, className = "", ...props }: Props) {
  const content = <>{children}<svg className={styles.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 14 14 6M8 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></>;
  const classes = `${styles.button} ${styles[variant]} ${className}`.trim();
  if (external) return <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>{content}</a>;
  return <Link href={href} className={classes} {...props}>{content}</Link>;
}
