import { AudioLines } from "lucide-react";
import Link from "next/link";

export interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md";
}

export function BrandLogo({ href = "/", size = "md" }: BrandLogoProps) {
  const iconBoxClass =
    size === "sm" ? "size-9 rounded-[12px]" : "size-10 rounded-[14px]";
  const iconClass = size === "sm" ? "size-5" : "size-5";
  const textClass = size === "sm" ? "text-xl" : "text-2xl";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 group focus-visible:rounded-full"
    >
      <span
        className={`${iconBoxClass} inline-flex items-center justify-center bg-gradient-to-br from-cta-coral to-brand-orange text-white shadow-sm transition-transform duration-150 group-hover:scale-105`}
      >
        <AudioLines className={iconClass} strokeWidth={2.4} aria-hidden="true" />
      </span>
      <span className={`${textClass} font-bold tracking-tight text-ink`}>
        Pron<span className="text-cta-coral">nova</span>
      </span>
    </Link>
  );
}
