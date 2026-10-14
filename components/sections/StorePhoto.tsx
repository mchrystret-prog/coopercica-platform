"use client";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./StoreDetailsModal.module.css";
export function StorePhoto({ src, alt, className = "", sizes = "(max-width:600px) 90vw, 600px" }: { src?: string; alt: string; className?: string; sizes?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  return src && failed !== src ? <Image src={src} alt={alt} width={1600} height={1000} sizes={sizes} className={className} loading="lazy" onError={() => setFailed(src)} /> : <span className={`${styles.placeholder} ${className}`}><Icon name="pin" /><span>Foto em breve</span></span>;
}
