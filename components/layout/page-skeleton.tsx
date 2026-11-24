import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder shaped like TopBar + PageBody. Used as the Suspense fallback for DB pages. */
export function PageSkeleton({ variant = "list" }: { variant?: "list" | "cards" | "panel" }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3 border-b px-4 py-3 md:px-6">
        <Skeleton className="size-7" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6">
        {variant === "cards" ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-[4/3.6] rounded-2xl" />
            ))}
          </div>
        ) : null}
        {variant === "panel" ? <Skeleton className="h-72 w-full rounded-3xl" /> : null}
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
