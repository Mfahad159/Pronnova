import Image from "next/image";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { OutlineLink } from "@/components/brand/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-28 items-center justify-center rounded-2xl border-2 border-foreground/12 bg-tint-peach p-2">
        <Image src="/hero/piko-portrait.png" alt="" width={419} height={420} sizes="112px" className="size-full object-contain" />
      </div>
      <h1 className="font-heading text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="text-muted-foreground">The link may be old, or the lesson was removed.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <KiddyButton href="/student/chapters">Go to chapters</KiddyButton>
        <OutlineLink href="/" className="h-12">
          Home
        </OutlineLink>
      </div>
    </main>
  );
}
