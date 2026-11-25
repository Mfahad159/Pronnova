import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Plump, squishy kiddy coral CTA button: rounded-rectangle face in brand coral
 * with a clean curved darker-coral bottom lip (0-blur solid offset) and identical
 * press-down animation on hover and active press. The ONLY element allowed depth (ADR-007).
 * Pass `href` for a link, or `onClick`/`type` for a real button.
 */
export function kiddyClasses(size: "sm" | "md" | "lg" = "md", className?: string) {
  return cn(
    "inline-flex w-fit items-center justify-center gap-2 rounded-[0.875rem] bg-brand-coral pt-[2px] font-heading leading-none font-semibold tracking-tight text-white shadow-[0_5px_0_0_var(--primary)] outline-none transition-[transform,box-shadow,filter] duration-150 ease-out hover:translate-y-[3px] hover:shadow-[0_2px_0_0_var(--primary)] hover:brightness-105 focus-visible:ring-3 focus-visible:ring-ring/60 active:translate-y-[3px] active:shadow-[0_2px_0_0_var(--primary)] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 [&_svg]:size-5",
    size === "sm" &&
      "h-10 rounded-[0.65rem] px-5 text-sm shadow-[0_4px_0_0_var(--primary)] hover:translate-y-[2.5px] hover:shadow-[0_1.5px_0_0_var(--primary)] active:translate-y-[2.5px] active:shadow-[0_1.5px_0_0_var(--primary)] [&_svg]:size-4",
    size === "md" && "h-12 px-7 text-base",
    size === "lg" && "h-13.5 rounded-[1rem] px-8 text-lg",
    className,
  );
}

type Common = { children: React.ReactNode; size?: "sm" | "md" | "lg"; className?: string };

export function KiddyButton(
  props: Common & ({ href: string } | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)),
) {
  const { children, size = "md", className } = props;
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={kiddyClasses(size, className)}>
        {children}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { href: _h, size: _s, className: _c, children: _ch, ...rest } = props;
  return (
    <button type="button" {...rest} className={kiddyClasses(size, className)}>
      {children}
    </button>
  );
}
