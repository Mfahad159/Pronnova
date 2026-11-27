import Link from "next/link";
import { CalendarBlank, CaretRight, CheckCircle, WarningCircle } from "@phosphor-icons/react/ssr";
import { levelBadge } from "@/components/brand/ui";
import { Progress } from "@/components/ui/progress";
import { PikoSays } from "@/components/brand/piko";
import { WordPicture } from "@/components/brand/word-pictures";
import { levelLabel } from "@/features/curriculum/level";
import { cn } from "@/lib/utils";
import type { HomeworkEntry } from "@/server/db/queries/learning";

// Due dates are plain calendar days (yyyy-mm-dd), so format them in UTC to keep the same day.
const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/**
 * "Your lessons": assigned materials (class + individual, deduplicated) with level, due date
 * (red when overdue, amber when due within 2 days) and progress = items attempted / total.
 * Tapping a card resumes the lesson at the next item (existing practice flow).
 */
export function HomeworkList({ homework }: { homework: HomeworkEntry[] }) {
  if (homework.length === 0) {
    return <PikoSays size="sm" tone="mint" message="No lessons assigned yet. Check back soon." />;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {homework.map((h) => {
        const done = h.itemCount > 0 && h.mastered === h.itemCount;
        const pct = h.itemCount ? Math.round((h.attempted / h.itemCount) * 100) : 0;
        const body = (
          <>
            <div className="flex items-start gap-3">
              <WordPicture text={h.title} size="sm" />
              <div className="min-w-0 flex-1">
                <span className="block font-heading text-lg leading-tight font-bold">{h.title}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className={cn("rounded-full px-2 py-0.5 font-bold", levelBadge[h.level])}>{levelLabel[h.level]}</span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-score-excellent/12 px-2 py-0.5 font-bold text-score-excellent">
                      <CheckCircle className="size-3.5" weight="fill" /> Done
                    </span>
                  ) : h.deadline ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold",
                        h.overdue ? "bg-destructive/10 text-destructive" : h.dueSoon ? "bg-[#ffb000]/20 text-score-good" : "bg-secondary text-primary",
                      )}
                    >
                      {h.overdue ? <WarningCircle className="size-3.5" weight="bold" /> : <CalendarBlank className="size-3.5" weight="bold" />}
                      {h.overdue ? "Overdue · " : "Due "}
                      {dateFmt.format(new Date(`${h.deadline}T00:00:00Z`))}
                    </span>
                  ) : null}
                </span>
              </div>
              {h.nextItemId ? <CaretRight className="mt-1 size-5 shrink-0 text-primary" weight="bold" /> : null}
            </div>
            <div className="mt-3 space-y-1">
              <Progress
                value={pct}
                aria-label={`${h.title}: ${h.attempted} of ${h.itemCount} tried`}
                className="h-2.5 border border-foreground/10 bg-muted [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-score-excellent"
              />
              <p className="text-xs font-semibold text-muted-foreground">
                {h.attempted}/{h.itemCount} tried
              </p>
            </div>
          </>
        );
        const card = cn(
          "block rounded-2xl border-2 bg-card p-4",
          h.overdue ? "border-destructive/30" : h.dueSoon ? "border-[#ffb000]/50" : "border-foreground/12",
        );
        return (
          <li key={h.lessonId}>
            {h.nextItemId ? (
              <Link
                href={`/student/practice/${h.nextItemId}`}
                className={cn(card, "outline-none transition-colors hover:border-primary/40 hover:bg-secondary/30 focus-visible:ring-3 focus-visible:ring-ring/50")}
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
