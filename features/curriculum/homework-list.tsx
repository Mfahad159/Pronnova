import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { levelLabel } from "@/features/curriculum/level";
import type { HomeworkEntry } from "@/server/db/queries/learning";

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Karachi" });

/** UC-03 alt 1B: lessons the teacher assigned, soonest due first. */
export function HomeworkList({ homework }: { homework: HomeworkEntry[] }) {
  if (homework.length === 0) {
    return <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">No homework right now. 🎉</p>;
  }
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {homework.map((h) => {
        const done = h.itemCount > 0 && h.mastered === h.itemCount;
        const overdue = h.overdue;
        const body = (
          <>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarClock className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{h.title}</span>
              <span className="block text-xs text-muted-foreground">
                {h.chapterTitle} · {levelLabel[h.level]} · {h.mastered}/{h.itemCount} done
              </span>
            </span>
            {done ? (
              <Badge className="bg-score-excellent/10 text-score-excellent">Done</Badge>
            ) : h.deadline ? (
              <Badge variant={overdue ? "destructive" : "secondary"}>
                {overdue ? "Overdue · " : "Due "}
                {dateFmt.format(new Date(h.deadline))}
              </Badge>
            ) : null}
            {h.firstItemId ? <ChevronRight className="size-4 text-muted-foreground" /> : null}
          </>
        );
        return (
          <li key={h.lessonId}>
            {h.firstItemId ? (
              <Link href={`/student/practice/${h.firstItemId}`} className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-muted focus-visible:bg-muted">
                {body}
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
