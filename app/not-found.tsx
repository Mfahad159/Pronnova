import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <Image src="/avatar/avatar_speaking.png" alt="" width={110} height={120} className="rounded-2xl" />
      <h1 className="font-heading text-2xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="text-muted-foreground">The link may be old, or the lesson was removed.</p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/student/chapters">Go to chapters</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
