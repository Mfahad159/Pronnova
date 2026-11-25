import Link from "next/link";
import { ArrowCounterClockwise } from "@phosphor-icons/react/ssr";
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
import { PikoSays } from "@/components/brand/piko";
import { PlayRecordingButton } from "@/features/assessment/play-recording-button";
import { ScorePill } from "@/features/assessment/score-pill";
import { levelLabel } from "@/features/curriculum/level";
import type { AttemptSummary } from "@/types";

/** Decorative bar heights derived from the id, so server and client render the same thing. */
function waveBars(seed: string): number[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  // Small pseudo-random sequence (LCG), always 20–90% tall. Unsigned math so heights never go negative.
  const out: number[] = [];
  for (let i = 0; i < 18; i++) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    out.push(20 + (h % 71));
  }
  return out;
}

function MiniWave({ seed }: { seed: string }) {
  const bars = waveBars(seed);
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
      <PikoSays
        size="sm"
        tone="card"
        message={showStudent ? "No attempts from your students yet." : "No attempts yet. Pick a chapter and try your first one!"}
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 font-heading hover:bg-muted/50">
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
                <PlayRecordingButton attemptId={a.id} text={a.text} hasAudio={a.hasAudio} as={showStudent ? "teacher" : "student"} />
              </TableCell>
              {showStudent ? <TableCell className="font-medium">{a.studentName}</TableCell> : null}
              <TableCell className="max-w-[16rem] min-w-[10rem] whitespace-normal">
                <p className="line-clamp-1 font-heading font-bold">{a.text}</p>
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
                  <Badge variant="destructive" className="rounded-full">Not scored</Badge>
                ) : a.status === "pending" ? (
                  <Badge variant="secondary" className="rounded-full">Scoring…</Badge>
                ) : (
                  <ScorePill score={a.score} />
                )}
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">{dateFmt.format(new Date(a.createdAt))}</TableCell>
              <TableCell>
                {showStudent ? null : (
                  <Button variant="ghost" size="icon" className="rounded-xl text-primary hover:bg-secondary" asChild>
                    <Link href={`/student/practice/${a.itemId}`} aria-label={`Try again: ${a.text}`}>
                      <ArrowCounterClockwise />
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
