import Link from "next/link";
import { Play, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScorePill } from "@/features/assessment/score-pill";
import { levelLabel } from "@/features/curriculum/level";
import type { AttemptSummary } from "@/types";

/** Decorative bars derived from the id, so server and client render the same thing. */
function MiniWave({ seed }: { seed: string }) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  // Small pseudo-random sequence (LCG), always 20–90% tall. Unsigned math so heights never go negative.
  const bars = Array.from({ length: 18 }, () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return 20 + (h % 71);
  });
  return (
    <div className="flex h-6 items-center gap-[3px]" aria-hidden>
      {bars.map((v, i) => (
        <span key={i} className="w-[3px] rounded-full bg-muted-foreground/35" style={{ height: `${v}%` }} />
      ))}
    </div>
  );
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Karachi" });

/** Attempt history: play, text + tags, waveform, duration, score, retry (reference table layout). */
export function AttemptsTable({
  attempts,
  showStudent = false,
}: {
  attempts: (AttemptSummary & { studentName?: string })[];
  /** Teacher views: show who made the attempt and hide the student-only "try again" link. */
  showStudent?: boolean;
}) {
  if (attempts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        {showStudent ? "No attempts from your students yet." : "No attempts yet. Pick a chapter and try your first one!"}
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12" />
            {showStudent ? <TableHead>Student</TableHead> : null}
            <TableHead>Text</TableHead>
            <TableHead className="hidden md:table-cell">Recording</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <Button variant="secondary" size="icon" aria-label={`Play recording: ${a.text} (available in Phase 4)`} disabled>
                  <Play />
                </Button>
              </TableCell>
              {showStudent ? <TableCell className="font-medium">{a.studentName}</TableCell> : null}
              <TableCell className="max-w-[16rem] min-w-[10rem] whitespace-normal">
                <p className="line-clamp-1 font-medium">{a.text}</p>
                <p className="text-xs text-muted-foreground">
                  {a.chapterTitle} · {levelLabel[a.level]}
                </p>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-3">
                  <MiniWave seed={a.id} />
                  <span className="text-xs tabular-nums text-muted-foreground">{a.durationSec}s</span>
                </div>
              </TableCell>
              <TableCell>
                {a.status === "failed" ? (
                  <Badge variant="destructive">Not scored</Badge>
                ) : a.status === "pending" ? (
                  <Badge variant="secondary">Scoring…</Badge>
                ) : (
                  <ScorePill score={a.score} />
                )}
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">{dateFmt.format(new Date(a.createdAt))}</TableCell>
              <TableCell>
                {showStudent ? null : (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/student/practice/${a.itemId}`} aria-label={`Try again: ${a.text}`}>
                      <RotateCcw />
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
