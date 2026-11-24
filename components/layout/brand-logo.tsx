import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-1 py-1 font-heading text-lg font-bold tracking-tight">
      <Image src="/icons/logo.svg" alt="" width={32} height={32} priority />
      <span>Pronnova</span>
    </Link>
  );
}
