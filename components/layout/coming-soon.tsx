import Image from "next/image";

/** Placeholder for screens not built yet. Names the phase from specs/fyp1-implementation-plan.md. */
export function ComingSoon({ what, milestone }: { what: string; milestone: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card p-8 text-center sm:flex-row sm:text-left">
      <Image src="/avatar/avatar_speaking.png" alt="" width={96} height={105} className="rounded-xl" />
      <div>
        <p className="font-heading font-semibold">{what} is on the way</p>
        <p className="text-sm text-muted-foreground">Planned for {milestone} (see specs/fyp1-implementation-plan.md).</p>
      </div>
    </div>
  );
}
