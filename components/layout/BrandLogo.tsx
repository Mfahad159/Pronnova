import Image from "next/image";
import Link from "next/link";

export interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md";
}

export function BrandLogo({ href = "/", size = "md" }: BrandLogoProps) {
  const imgSize = size === "sm" ? 36 : 40;
  const textClass = size === "sm" ? "text-xl" : "text-2xl";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 group focus-visible:rounded-full"
    >
      <Image
        src="/icons/logo.svg"
        alt="Pronnova logo"
        width={imgSize}
        height={imgSize}
        className="transition-transform duration-150 group-hover:scale-105"
        priority
      />
      <span className={`${textClass} font-bold tracking-tight text-ink`}>
        Pron<span className="text-cta-coral">nova</span>
      </span>
    </Link>
  );
}
