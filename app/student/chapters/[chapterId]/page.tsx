import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretRight, CheckCircle, Lock } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel } from "@/features/curriculum/level";
import { LEVEL_ORDER, PASS_SCORE, type ItemView, type LevelView } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { getCurrentStudent } from "@/server/db/demo-user";
import { isUuid } from "@/server/db/queries/curriculum";
import { getStudentLearning } from "@/server/db/queries/learning";

// UC-03 steps 2–6: levels (locked in order, ADR-004) → items. Params and DB reads are request-time
// data, so they're read inside Suspense (Cache Components).
export default function ChapterPage(props: PageProps<"/student/chapters/[chapterId]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChapterContent params={props.params} />
    </Suspense>
  );
}

async function ChapterContent({ params }: { params: PageProps<"/student/chapters/[chapterId]">["params"] }) {
  const { chapterId } = await params;
  if (!isUuid(chapterId)) notFound();
  const student = await getCurrentStudent();
  const { view } = await getStudentLearning(student.id);
  const chapter = view.find((c) => c.id === chapterId);
  if (!chapter) notFound();

  return (
    <>
      <TopBar
        title={chapter.title}
        subtitle={
          chapter.total === 0
            ? `Chapter ${chapter.orderNo}`
            : `Chapter ${chapter.orderNo} · ${chapter.mastered}/${chapter.total} done${chapter.currentLevel ? ` · now on ${levelLabel[chapter.currentLevel]}` : " · completed"}`
        }
      />
      <PageBody>
        {chapter.levels.map((lv, i) => (
          <LevelSection key={lv.level} lv={lv} previous={i > 0 ? LEVEL_ORDER[i - 1] : null} />
        ))}
      </PageBody>
    </>
  );
}

function LevelSection({ lv, previous }: { lv: LevelView; previous: LevelView["level"] | null }) {
  const empty = lv.items.length === 0 && lv.homework.length === 0;
  return (
    <section className="space-y-3" aria-labelledby={`lv-${lv.level}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id={`lv-${lv.level}`} className="font-heading text-lg font-semibold">
          {levelLabel[lv.level]}
        </h2>
        {!lv.unlocked ? (
          <Badge variant="outline" className="gap-1">
            <Lock className="size-3" /> Locked
          </Badge>
        ) : lv.total > 0 ? (
          <span className="text-sm text-muted-foreground">
            {lv.mastered}/{lv.total} done
          </span>
        ) : null}
      </div>

      {!lv.unlocked && previous ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          This level is locked. Score {PASS_SCORE}% or more on every {levelLabel[previous]} exercise to unlock it.
        </p>
      ) : null}

      {empty ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No exercises in this level yet.</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {lv.items.map((item) => (
            <ItemRow key={item.id} item={item} open={lv.unlocked || item.homework} />
          ))}
          {lv.homework.map((item) => (
            <ItemRow key={item.id} item={item} open />
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemRow({ item, open }: { item: ItemView; open: boolean }) {
  const content = (
    <>
      {item.status === "mastered" ? (
        <CheckCircle className="size-5 shrink-0 text-score-excellent" weight="duotone" aria-label="Done" />
      ) : open ? (
        <span className="size-5 shrink-0 rounded-full border-2 border-muted-foreground/30" aria-hidden />
      ) : (
        <Lock className="size-4 shrink-0 text-muted-foreground" aria-label="Locked" />
      )}
      <span className="min-w-0 flex-1 font-medium">{item.text}</span>
      {item.homework ? <Badge className="bg-primary/10 text-primary">Homework</Badge> : null}
      {item.best != null ? (
        <span className={cn("text-xs tabular-nums", item.status === "mastered" ? "text-score-excellent" : "text-score-good")}>
          Best {Math.round(item.best)}%
        </span>
      ) : null}
      <Badge variant="secondary" className="capitalize">
        {item.itemType}
      </Badge>
      {open ? <CaretRight className="size-4 text-muted-foreground" /> : null}
    </>
  );
  return (
    <li>
      {open ? (
        <Link href={`/student/practice/${item.id}`} className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-muted focus-visible:bg-muted">
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 text-muted-foreground" aria-disabled="true">
          {content}
        </div>
      )}
    </li>
  );
}
