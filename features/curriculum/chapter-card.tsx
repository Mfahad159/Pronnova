import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/types";

const tints: Record<Chapter["tint"], string> = {
  peach: "bg-tint-peach",
  sky: "bg-tint-sky",
  mint: "bg-tint-mint",
  cream: "bg-tint-cream",
};

/** Illustrated chapter tile (the reference's category tiles, with our kids art). */
export function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <Link
      href={`/student/chapters/${chapter.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
        tints[chapter.tint],
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={chapter.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 260px, 45vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <div className="flex items-baseline justify-between gap-2 px-4 py-3">
        <span className="font-heading font-semibold">{chapter.title}</span>
        <span className="text-xs text-muted-foreground">Ch. {chapter.orderNo}</span>
      </div>
    </Link>
  );
}
