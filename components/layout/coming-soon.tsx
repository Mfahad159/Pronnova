import { PikoSays } from "@/components/brand/piko";

/** Placeholder for screens not built yet. Names the phase from specs/fyp1-implementation-plan.md. */
export function ComingSoon({ what, milestone }: { what: string; milestone: string }) {
  return (
    <PikoSays tone="cream" message={`${what} is on the way!`}>
      <p className="text-sm text-muted-foreground">Planned for {milestone}.</p>
    </PikoSays>
  );
}
