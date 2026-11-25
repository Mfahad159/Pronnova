import Link from "next/link";
import { CalendarBlank, CaretRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { levelBadge } from "@/components/brand/ui";
import { PikoSays } from "@/components/brand/piko";
import { levelLabel } from "@/features/curriculum/level";
import { cn } from "@/lib/utils";
import type { HomeworkEntry } from "@/server/db/queries/learning";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Karachi",
});

const card = "flex items-center gap-3.5 rounded-2xl border-2 border-foreground/12 bg-card p-4";

/** UC-03 alt 1B: lessons the teacher assigned, soonest due first. Landing card style (ADR-007). */
export function HomeworkList({ homework }: { homework: HomeworkEntry[] }) {
  if (homework.length === 0) {
    return <PikoSays size="sm" tone="mint" message="No homework right now. Great job! 🎉" />;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {homework.map((h) => {
        const done = h.itemCount > 0 && h.mastered === h.itemCount;
        const body = (
          <>
            <span
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-foreground/10",
                done ? "bg-tint-mint text-score-excellent" : "bg-tint-peach text-primary",
              )}
            >
              {done ? (
                <CheckCircle className="size-6" weight="duotone" />
              ) : (
                <CalendarBlank className="size-6" weight="duotone" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading font-bold">{h.title}</span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("rounded-full px-2 py-0.5 font-bold", levelBadge[h.level])}>{levelLabel[h.level]}</span>
                <span>{h.chapterTitle}</span>
                <span>
                  · {h.mastered}/{h.itemCount} done
                </span>
              </span>
              {done ? (
                <span className="mt-1.5 inline-block rounded-full bg-score-excellent/12 px-2 py-0.5 text-xs font-bold text-score-excellent">
                  Done
                </span>
              ) : h.deadline ? (
                <span
                  className={cn(
                    "mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold",
                    h.overdue ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary",
                  )}
                >
                  {h.overdue ? "Overdue · " : "Due "}
                  {dateFmt.format(new Date(h.deadline))}
                </span>
              ) : null}
            </span>
            {h.firstItemId ? <CaretRight className="size-5 shrink-0 text-primary" weight="bold" /> : null}
          </>
        );
        return (
          <li key={h.lessonId}>
            {h.firstItemId ? (
              <Link
                href={`/student/practice/${h.firstItemId}`}
                className={cn(
                  card,
                  "outline-none transition-colors hover:border-primary/40 hover:bg-secondary/40 focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              >
                {body}
              </Link>
            ) : (
              <div className={card}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
