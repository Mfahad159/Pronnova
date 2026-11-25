import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CalendarDoodle, CheckDoodle } from "@/components/icons/doodle";
import { levelLabel } from "@/features/curriculum/level";
import type { HomeworkEntry } from "@/server/db/queries/learning";

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Karachi" });
const SHOWN = 3;

/** UC-03 alt 1B: lessons the teacher assigned, soonest due first. Shows 3; the rest fold away. */
export function HomeworkList({ homework }: { homework: HomeworkEntry[] }) {
  if (homework.length === 0) {
    return (
      <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed p-5 text-center text-muted-foreground">
        <CheckDoodle className="size-5 text-score-excellent" /> No homework right now — enjoy free practice!
      </p>
    );
  }
  const first = homework.slice(0, SHOWN);
  const rest = homework.slice(SHOWN);
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <ul className="divide-y">
        {first.map((h) => (
          <HomeworkRow key={h.lessonId} h={h} />
        ))}
      </ul>
      {rest.length > 0 ? (
        <details className="group border-t">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1 px-4 py-3 text-sm font-medium text-primary outline-none hover:bg-muted focus-visible:bg-muted [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show {rest.length} more</span>
            <span className="hidden group-open:inline">Show less</span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
          </summary>
          <ul className="divide-y border-t">
            {rest.map((h) => (
              <HomeworkRow key={h.lessonId} h={h} />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function HomeworkRow({ h }: { h: HomeworkEntry }) {
  const done = h.itemCount > 0 && h.mastered === h.itemCount;
  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <CalendarDoodle className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{h.title}</span>
        <span className="block text-sm text-muted-foreground">
          {h.chapterTitle} · {levelLabel[h.level]} · {h.mastered} of {h.itemCount} done
        </span>
      </span>
      {done ? (
        <Badge className="bg-score-excellent/10 text-score-excellent">Done 🎉</Badge>
      ) : h.deadline ? (
        <Badge variant={h.overdue ? "destructive" : "secondary"} className="shrink-0">
          {h.overdue ? "Late · was due " : "Due "}
          {dateFmt.format(new Date(h.deadline))}
        </Badge>
      ) : null}
      {h.firstItemId ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" /> : null}
    </>
  );
  return (
    <li>
      {h.firstItemId ? (
        <Link href={`/student/practice/${h.firstItemId}`} className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-muted focus-visible:bg-muted">
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">{body}</div>
      )}
    </li>
  );
}
