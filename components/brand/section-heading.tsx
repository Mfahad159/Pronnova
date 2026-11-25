import Link from "next/link";

/** Section title row used on app pages (landing section heading, smaller). */
export function SectionHeading({
  id,
  title,
  href,
  linkLabel = "See all",
}: {
  id?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="font-heading text-xl font-bold tracking-tight">
        {title}
      </h2>
      {href ? (
        <Link href={href} className="text-sm font-semibold text-primary hover:underline">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
