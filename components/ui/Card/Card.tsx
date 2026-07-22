import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CardVariant = "default" | "soft" | "elevated" | "outline";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: CardVariant;
  as?: "article" | "div" | "section";
};

export function Card({ children, variant = "default", as: Component = "article", className = "", ...props }: CardProps) {
  const variantClass = variant === "default" ? "" : styles[variant];

  return (
    <Component className={`${styles.card} ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
