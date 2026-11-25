// Pronnova doodle icons — drawn for this project (inspired by the playful, hand-drawn style of kids'
// learning sites; no third-party artwork). 24×24, round strokes, slightly wobbly lines.
// Colour = currentColor, so `className="text-primary"` etc. works. Decorative by default (aria-hidden);
// pass `title` to make an icon meaningful to screen readers.
import { cn } from "@/lib/utils";

export type DoodleProps = React.SVGProps<SVGSVGElement> & { title?: string };

function Doodle({ title, className, children, ...props }: DoodleProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={cn("size-6 shrink-0", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Microphone with little sound marks. */
export const MicDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M9.2 5.6c-.1-1.8 1.2-3.1 2.8-3.1 1.7 0 2.9 1.3 2.8 3.1l-.1 5.2c0 1.7-1.2 2.9-2.7 2.9-1.6 0-2.8-1.2-2.8-2.9z" />
    <path d="M6.4 10.3c.2 3.3 2.6 5.6 5.6 5.6 3.1 0 5.4-2.4 5.6-5.6" />
    <path d="M12 16v3.6M9.1 20.4c1.9-.4 3.8-.4 5.8 0" />
    <path d="M19.6 4.5l1.2-.9M20.4 7.6l1.4.1M3.6 4.4l-1.1-.8" />
  </Doodle>
);

/** Open book. */
export const BookDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M12 6.4C10 4.9 6.9 4.5 3.4 5v13.1c3.3-.6 6.3-.2 8.6 1.4" />
    <path d="M12 6.4c2-1.5 5.1-1.9 8.6-1.4v13.1c-3.3-.6-6.3-.2-8.6 1.4z" />
    <path d="M6 8.7c1.2-.1 2.4 0 3.5.4M6 11.6c1.2-.1 2.4 0 3.5.4M14.6 9c1.1-.4 2.3-.5 3.5-.4" />
  </Doodle>
);

/** Star with a sparkle. */
export const StarDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M11.4 3.3l2.2 4.6 5 .6-3.7 3.5.9 5-4.5-2.4-4.4 2.5.8-5L4.1 8.7l5-.7z" />
    <path d="M19.8 17.6l.6 1.6 1.6.5-1.6.6-.6 1.6-.5-1.6-1.6-.6 1.6-.5z" />
  </Doodle>
);

/** Trophy cup. */
export const TrophyDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M7.3 3.8h9.4c.2 4.9-1.5 8.4-4.7 8.6-3.3-.1-4.9-3.7-4.7-8.6z" />
    <path d="M7.4 5.6H4.6c-.1 2.4 1.2 4 3.4 4.3M16.6 5.6h2.8c.1 2.4-1.2 4-3.4 4.3" />
    <path d="M12 12.5v3.6M8.6 20.3c.1-2.4 1.5-3.9 3.4-4 1.9.1 3.4 1.6 3.4 4z" />
    <path d="M7.4 20.4h9.2" />
  </Doodle>
);

/** Rising bar chart with an arrow. */
export const ProgressDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M4.2 19.8V15M9.1 19.8v-7.3M14 19.8v-5M18.9 19.8V9.4" />
    <path d="M3.4 20.3c5.8-.3 11.6-.3 17.3 0" />
    <path d="M4.6 10.4c2.9-.6 6.1-2.4 8.8-5.6M10.6 4.2l2.9.4.1 2.8" />
  </Doodle>
);

/** Teacher at a small board. */
export const TeacherDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M9.5 3.4h11.2v8.9H9.8" />
    <path d="M12.3 6.6c1.6-.1 3.3-.1 5 0M12.3 9.2c1.1 0 2.2 0 3.3.1" />
    <circle cx="5.6" cy="7.4" r="2.2" />
    <path d="M2.4 20.4c-.1-4.4 1.3-7.4 3.3-7.5 1.4 0 2.5 1.2 3.2 2.6l3.1-2.4" />
    <path d="M8.5 20.5c.1-1.9.1-3.6 0-5" />
  </Doodle>
);

/** Arrow going up into a tray. */
export const UploadDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M12.1 15.3c-.2-3.8-.2-7.6 0-11.4" />
    <path d="M8 7.6c1.5-1.6 2.8-3 4.1-4.1 1.3 1.1 2.6 2.4 3.9 4" />
    <path d="M4 14.2c-.2 2.2-.1 4.2.2 6 5.2.4 10.4.4 15.6 0 .3-1.9.4-3.9.2-6" />
  </Doodle>
);

/** Calendar page with a tick. */
export const CalendarDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M4.1 6.4c5.3-.3 10.6-.3 15.9 0 .3 4.4.3 8.9 0 13.5-5.3.3-10.6.3-15.9 0-.3-4.6-.3-9.1 0-13.5z" />
    <path d="M8 3.6v4.2M16 3.6v4.2M4.4 10.6c5-.2 10.1-.2 15.2 0" />
    <path d="M9 15.2l2 1.9 4-4" />
  </Doodle>
);

/** Ear with sound waves (listening). */
export const EarDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M6.3 9.4c0-3.6 2.6-6 5.8-6 3.3 0 5.6 2.5 5.6 5.7 0 3.6-3.4 4.6-3.6 7.4-.2 2.4-1.9 4-4 4-1.6 0-2.7-.8-3.3-2" />
    <path d="M9.6 9.3c.1-1.6 1.2-2.7 2.6-2.6 1.4 0 2.4 1.2 2.3 2.6-.1 1.2-1 1.7-1.8 2.2" />
    <path d="M20.3 7.2c.7 1.6.7 3.3 0 5M2.8 8.3c-.5 1.1-.5 2.3 0 3.4" />
  </Doodle>
);

/** Globe (UK and US English). */
export const GlobeDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M12 3.2c4.9-.1 8.8 3.8 8.8 8.8 0 4.9-3.9 8.8-8.8 8.8-4.9.1-8.8-3.9-8.8-8.8 0-4.9 3.9-8.8 8.8-8.8z" />
    <path d="M3.6 9.4c5.5.3 11.1.3 16.7 0M3.7 14.6c5.5-.3 11.1-.3 16.6 0" />
    <path d="M12 3.3c-2.4 2.4-3.6 5.3-3.6 8.7 0 3.4 1.2 6.3 3.6 8.7 2.4-2.4 3.6-5.3 3.6-8.7 0-3.4-1.2-6.3-3.6-8.7z" />
  </Doodle>
);

/** Padlock. */
export const LockDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M5.1 10.6c4.6-.3 9.2-.3 13.8 0 .3 3.2.3 6.3 0 9.6-4.6.3-9.2.3-13.8 0-.3-3.3-.3-6.4 0-9.6z" />
    <path d="M8 10.4V7.6c.1-2.5 1.7-4.2 4-4.2s3.9 1.7 4 4.2v2.8" />
    <path d="M12 14.3v2.4" />
  </Doodle>
);

/** Three sparkles (decorative). */
export const SparkleDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M9.2 3.6c.6 3.4 2 5 5.4 5.6-3.4.6-4.8 2.2-5.4 5.6-.6-3.4-2.1-5-5.5-5.6 3.4-.6 4.9-2.2 5.5-5.6z" />
    <path d="M17.5 13.3c.3 1.8 1.1 2.7 2.9 3-1.8.3-2.6 1.2-2.9 3-.3-1.8-1.1-2.7-2.9-3 1.8-.3 2.6-1.2 2.9-3z" />
    <path d="M18.3 3.4v2.4M17.1 4.6h2.4" />
  </Doodle>
);

/** House. */
export const HomeDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M3.3 11.4c2.9-2.9 5.8-5.5 8.7-7.9 2.9 2.4 5.8 5 8.7 7.9" />
    <path d="M5.6 9.6c-.2 3.6-.2 7.1 0 10.6 4.3.3 8.6.3 12.8 0 .2-3.5.2-7 0-10.6" />
    <path d="M10 20.2c-.1-1.9 0-3.7.2-5.4h3.6c.2 1.7.3 3.5.2 5.4" />
  </Doodle>
);

/** Stack of books (chapters). */
export const ChaptersDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M4.3 4.2c1.3-.2 2.5-.2 3.8 0 .2 5.3.2 10.5 0 15.6-1.3.2-2.5.2-3.8 0-.2-5.1-.2-10.3 0-15.6z" />
    <path d="M8.2 6.4c1.2-.2 2.4-.2 3.6 0 .2 4.5.2 9 0 13.4-1.2.2-2.4.2-3.6 0" />
    <path d="M13.3 7.5l3.3-1 4 13.2-3.3 1z" />
    <path d="M5.4 7.4h1.6M9.3 9.4h1.4" />
  </Doodle>
);

/** Two students. */
export const StudentsDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M8.6 4.1c1.7 0 2.9 1.3 2.9 2.9 0 1.7-1.2 3-2.9 3-1.6 0-2.9-1.3-2.9-3 0-1.6 1.3-2.9 2.9-2.9z" />
    <path d="M2.8 19.8c.1-3.8 2.5-6.6 5.8-6.6s5.8 2.8 5.8 6.6" />
    <path d="M15.9 5.3c1.4 0 2.4 1.1 2.4 2.5 0 1.3-1 2.4-2.4 2.4" />
    <path d="M16.6 13.3c2.6.4 4.5 2.9 4.6 6.4" />
  </Doodle>
);

/** Hand-drawn tick in a circle. */
export const CheckDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M12 3.3c4.8 0 8.7 3.9 8.7 8.7 0 4.9-3.9 8.8-8.8 8.8-4.8-.1-8.6-4-8.6-8.8 0-4.8 3.9-8.7 8.7-8.7z" />
    <path d="M7.8 12.3c1.1 1.1 2.2 2.2 3.2 3.4 1.6-2.6 3.3-4.8 5.4-6.7" />
  </Doodle>
);

/** Speech bubble with sound bars (speaking). */
export const SpeakDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M4 5.2c5.3-.4 10.7-.4 16 0 .3 3.3.3 6.6 0 9.8-3.4.3-6.8.3-10.2.2-1.5 1.6-3.2 2.9-5.1 3.9.3-1.3.4-2.6.3-4C4.6 12 3.7 8.6 4 5.2z" />
    <path d="M8.3 9.1v2.6M11 8v4.8M13.7 9.1v2.6M16.4 9.9v1" />
  </Doodle>
);

/** Target with an arrow (practise / aim). */
export const TargetDoodle = (p: DoodleProps) => (
  <Doodle {...p}>
    <path d="M11.4 4c4.4-.2 8 3.2 8.1 7.6.1 4.4-3.4 8.1-7.8 8.2-4.4.1-8-3.4-8.1-7.8" />
    <path d="M11.5 8.1c2.1 0 3.8 1.6 3.8 3.7s-1.7 3.8-3.8 3.8c-2 0-3.7-1.7-3.7-3.7" />
    <path d="M11.6 11.8l8.7-8.6M17.3 3.4l3 .2.2 3" />
  </Doodle>
);

/** Soft tinted blob behind an icon (the "sticker" look). */
export function IconBlob({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-12 items-center justify-center rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-primary/10 text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
