import Image from "next/image";
import { SparkleDoodle } from "@/components/icons/doodle";

/**
 * Friendly placeholder for screens not built yet. User-facing text only — the phase it's planned
 * for lives in specs/fyp1-implementation-plan.md, never on screen.
 */
export function ComingSoon({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center overflow-hidden rounded-3xl border bg-tint-peach sm:grid-cols-[220px_1fr]">
      <Image
        src="/avatar/avatar_staanding.jpg"
        alt=""
        width={440}
        height={330}
        sizes="(min-width: 640px) 220px, 100vw"
        className="h-48 w-full object-cover object-[35%_center] sm:h-full"
      />
      <div className="p-6 md:p-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm font-semibold text-primary">
          <SparkleDoodle className="size-4" /> Coming soon
        </p>
        <h2 className="mt-3 font-heading text-2xl font-bold">{title}</h2>
        <div className="mt-2 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
