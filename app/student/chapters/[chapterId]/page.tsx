import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Lock, Star } from "@phosphor-icons/react/ssr";
import { PikoSays } from "@/components/brand/piko";
import { Panel, PanelHeader, levelBadge } from "@/components/brand/ui";
import { WordPicture } from "@/components/brand/word-pictures";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel } from "@/features/curriculum/level";
import { LEVEL_ORDER, PASS_SCORE, type ItemView, type LevelView } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { getCurrentStudentOrPick } from "@/server/db/demo-user";
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
  const student = await getCurrentStudentOrPick();
  const { view } = await getStudentLearning(student);
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
    <section aria-labelledby={`lv-${lv.level}`}>
      <Panel className={cn(!lv.unlocked && "bg-muted/30")}>
        <PanelHeader>
          <div className="flex items-center gap-3">
            <span className={cn("rounded-full px-3 py-1 text-xs font-bold", levelBadge[lv.level])} aria-hidden>
              <Star className="mr-1 inline size-3.5 -translate-y-px" weight="fill" />
              Level
            </span>
            <h2 id={`lv-${lv.level}`} className="font-heading text-xl font-bold">
              {levelLabel[lv.level]}
            </h2>
          </div>
          {!lv.unlocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground/12 bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
              <Lock className="size-3.5" weight="bold" /> Locked
            </span>
          ) : lv.total > 0 ? (
            <span className="rounded-full bg-score-excellent/12 px-3 py-1 text-xs font-bold text-score-excellent">
              {lv.mastered}/{lv.total} done
            </span>
          ) : null}
        </PanelHeader>

        <div className="space-y-4 p-5 sm:p-6">
          {!lv.unlocked && previous ? (
            <PikoSays
              size="sm"
              tone="cream"
              message={`This level is locked. Score ${PASS_SCORE}% or more on every ${levelLabel[previous]} word to unlock it.`}
            />
          ) : null}

          {empty ? (
            <p className="rounded-xl border-2 border-dashed border-foreground/15 p-5 text-center text-sm text-muted-foreground">
              No words in this level yet.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {lv.items.map((item) => (
                <ItemCard key={item.id} item={item} open={lv.unlocked || item.homework} />
              ))}
              {lv.homework.map((item) => (
                <ItemCard key={item.id} item={item} open />
              ))}
            </ul>
          )}
        </div>
      </Panel>
    </section>
  );
}

/** Word card in the landing flashcard style: picture tile, big word, best score / lock. */
function ItemCard({ item, open }: { item: ItemView; open: boolean }) {
  const mastered = item.status === "mastered";
  const content = (
    <>
      <div className="flex w-full items-start justify-between gap-2">
        {item.homework ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[0.7rem] font-bold text-primary-foreground">Homework</span>
        ) : (
          <span className="rounded-full bg-card px-2 py-0.5 text-[0.7rem] font-semibold capitalize text-muted-foreground">
            {item.itemType}
          </span>
        )}
        {mastered ? (
          <CheckCircle className="size-6 shrink-0 text-score-excellent" weight="fill" aria-label="Done" />
        ) : !open ? (
          <Lock className="size-5 shrink-0 text-muted-foreground" weight="bold" aria-label="Locked" />
        ) : null}
      </div>
      <WordPicture text={item.text} size={item.itemType === "word" ? "md" : "sm"} />
      <span
        className={cn(
          "w-full font-heading font-bold break-words",
          item.itemType === "word" ? "text-2xl" : "text-base leading-snug",
        )}
      >
        {item.text}
      </span>
      {item.best != null ? (
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
            mastered ? "bg-score-excellent/12 text-score-excellent" : "bg-score-good/12 text-score-good",
          )}
        >
          Best {Math.round(item.best)}%
        </span>
      ) : open ? (
        <span className="text-xs font-semibold text-primary">Tap to practise</span>
      ) : null}
    </>
  );
  const base =
    "flex h-full flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center";
  return (
    <li>
      {open ? (
        <Link
          href={`/student/practice/${item.id}`}
          className={cn(
            base,
            mastered ? "border-score-excellent/30 bg-tint-mint/60" : "border-primary/15 bg-tint-peach/60",
            "outline-none transition-colors hover:border-primary/45 focus-visible:ring-3 focus-visible:ring-ring",
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={cn(base, "border-foreground/10 bg-muted/50 opacity-70")} aria-disabled="true">
          {content}
        </div>
      )}
    </li>
  );
}
