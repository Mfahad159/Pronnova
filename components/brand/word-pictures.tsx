import { cn } from "@/lib/utils";
import {
  AppleIllustration,
  BookIllustration,
  ButterflyIllustration,
  CatIllustration,
  ElephantIllustration,
  SunIllustration,
} from "./illustrations";

// Extra Class 1 word pictures in the SAME style as the landing illustrations (ADR-007):
// 120×120, #100E0E outlines (stroke 4), brand palette fills, friendly faces where it fits.
// All decorative (aria-hidden) — the word itself is always shown as text next to the picture.
const INK = "#100E0E";
const S = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
type P = { className?: string };

function Face({ x = 60, y = 62, gap = 11 }: { x?: number; y?: number; gap?: number }) {
  return (
    <>
      <circle cx={x - gap} cy={y} r="3" fill={INK} />
      <circle cx={x + gap} cy={y} r="3" fill={INK} />
      <path d={`M${x - 7} ${y + 9} Q${x} ${y + 15} ${x + 7} ${y + 9}`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export function BallIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <circle cx="60" cy="62" r="34" fill="#FF594B" {...S} />
      <path d="M28 52 Q60 70 92 52" fill="none" stroke="#FFFBF7" strokeWidth="8" />
      <path d="M28 52 Q60 70 92 52" fill="none" stroke={INK} strokeWidth="3" />
      <path d="M44 34 Q36 52 44 70" fill="none" stroke="#FFE8D6" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function HatIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <ellipse cx="60" cy="82" rx="44" ry="12" fill="#2DB8FF" {...S} />
      <path d="M34 80 C34 44, 44 30, 60 30 C76 30, 86 44, 86 80 Z" fill="#2DB8FF" {...S} />
      <path d="M36 66 L84 66" stroke="#FFB000" strokeWidth="9" />
    </svg>
  );
}

export function PenIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <g transform="rotate(-35 60 60)">
        <rect x="50" y="16" width="20" height="66" rx="5" fill="#FF8D28" {...S} />
        <rect x="50" y="16" width="20" height="14" rx="5" fill="#FF594B" {...S} />
        <path d="M50 82 L60 104 L70 82 Z" fill="#FFE8D6" {...S} />
        <path d="M57 97 L60 104 L63 97 Z" fill={INK} />
      </g>
    </svg>
  );
}

export function DogIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <ellipse cx="30" cy="56" rx="11" ry="22" fill="#A0522D" {...S} transform="rotate(14 30 56)" />
      <ellipse cx="90" cy="56" rx="11" ry="22" fill="#A0522D" {...S} transform="rotate(-14 90 56)" />
      <circle cx="60" cy="62" r="30" fill="#FFE8D6" {...S} />
      <circle cx="49" cy="56" r="3.5" fill={INK} />
      <circle cx="71" cy="56" r="3.5" fill={INK} />
      <ellipse cx="60" cy="68" rx="7" ry="5" fill={INK} />
      <path d="M52 76 Q60 84 68 76" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="70" r="5" fill="#FF594B" opacity="0.5" />
      <circle cx="78" cy="70" r="5" fill="#FF594B" opacity="0.5" />
    </svg>
  );
}

export function FishIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <path d="M86 60 L108 42 L108 78 Z" fill="#FF8D28" {...S} />
      <ellipse cx="56" cy="60" rx="34" ry="24" fill="#FFB000" {...S} />
      <path d="M58 40 Q66 50 58 80" fill="none" stroke="#FF8D28" strokeWidth="4" strokeLinecap="round" />
      <circle cx="38" cy="56" r="4" fill={INK} />
      <path d="M28 66 Q32 70 36 67" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function DuckIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <ellipse cx="62" cy="80" rx="36" ry="20" fill="#FFB000" {...S} />
      <circle cx="46" cy="44" r="20" fill="#FFB000" {...S} />
      <path d="M26 46 L12 50 L26 54 Z" fill="#FF8D28" {...S} />
      <circle cx="44" cy="40" r="3.5" fill={INK} />
      <path d="M70 76 Q84 70 92 78" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="54" cy="50" r="4.5" fill="#FF594B" opacity="0.5" />
    </svg>
  );
}

export function CowIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <path d="M32 40 L22 24" {...S} />
      <path d="M88 40 L98 24" {...S} />
      <ellipse cx="60" cy="56" rx="32" ry="28" fill="#FFFBF7" {...S} />
      <ellipse cx="46" cy="44" rx="9" ry="7" fill={INK} />
      <ellipse cx="60" cy="82" rx="22" ry="14" fill="#FFB4B0" {...S} />
      <circle cx="52" cy="82" r="3" fill={INK} />
      <circle cx="68" cy="82" r="3" fill={INK} />
      <circle cx="49" cy="58" r="3.5" fill={INK} />
      <circle cx="71" cy="58" r="3.5" fill={INK} />
    </svg>
  );
}

export function MoonIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <path d="M74 18 C48 22, 32 44, 36 70 C40 92, 62 104, 86 98 C64 92, 52 74, 56 52 C58 38, 64 26, 74 18 Z" fill="#FFE08A" {...S} />
      <circle cx="56" cy="60" r="3" fill={INK} />
      <path d="M52 72 Q58 76 64 72" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="88" cy="40" r="3" fill="#FFB000" />
      <circle cx="96" cy="64" r="2.5" fill="#FFB000" />
    </svg>
  );
}

export function StarIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <path
        d="M60 14 L72 44 L104 46 L79 66 L88 98 L60 80 L32 98 L41 66 L16 46 L48 44 Z"
        fill="#FFB000"
        {...S}
      />
      <Face y={58} gap={9} />
    </svg>
  );
}

export function TreeIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <rect x="52" y="68" width="16" height="36" rx="4" fill="#A0522D" {...S} />
      <circle cx="60" cy="48" r="32" fill="#22AD5A" {...S} />
      <circle cx="48" cy="40" r="5" fill="#FF594B" />
      <circle cx="72" cy="52" r="5" fill="#FF594B" />
      <circle cx="58" cy="62" r="5" fill="#FF594B" />
    </svg>
  );
}

export function VanIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <path d="M14 46 Q14 34 26 34 L78 34 Q88 34 94 44 L106 60 L106 82 L14 82 Z" fill="#2DB8FF" {...S} />
      <rect x="24" y="44" width="22" height="16" rx="3" fill="#DFF3FF" {...S} />
      <rect x="52" y="44" width="22" height="16" rx="3" fill="#DFF3FF" {...S} />
      <path d="M80 44 L90 44 L98 60 L80 60 Z" fill="#DFF3FF" {...S} />
      <circle cx="36" cy="84" r="10" fill={INK} />
      <circle cx="86" cy="84" r="10" fill={INK} />
      <circle cx="36" cy="84" r="4" fill="#FFFBF7" />
      <circle cx="86" cy="84" r="4" fill="#FFFBF7" />
    </svg>
  );
}

export function FanIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <rect x="56" y="62" width="8" height="34" fill="#FFE8D6" {...S} />
      <ellipse cx="60" cy="100" rx="22" ry="6" fill="#FF594B" {...S} />
      <circle cx="60" cy="46" r="34" fill="#DFF3FF" {...S} />
      {[0, 120, 240].map((d) => (
        <ellipse key={d} cx="60" cy="30" rx="9" ry="16" fill="#FF8D28" {...S} transform={`rotate(${d} 60 46)`} />
      ))}
      <circle cx="60" cy="46" r="6" fill={INK} />
    </svg>
  );
}

function NumberTile({ n, className = "size-20" }: { n: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <rect x="18" y="18" width="84" height="84" rx="20" fill="#FFE8D6" {...S} />
      <text x="60" y="86" textAnchor="middle" fontSize="64" fontWeight="800" fill="#FF594B" stroke={INK} strokeWidth="3" fontFamily="system-ui, sans-serif">
        {n}
      </text>
    </svg>
  );
}

export function WebIllustration({ className = "size-20" }: P) {
  // Spider web with a small friendly spider.
  const spokes = [0, 45, 90, 135].map((deg) => {
    const r = (deg * Math.PI) / 180;
    const dx = Math.cos(r) * 40;
    const dy = Math.sin(r) * 40;
    return `M${60 - dx} ${60 - dy} L${60 + dx} ${60 + dy}`;
  });
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <circle cx="60" cy="60" r="40" fill="#E6F4FF" {...S} />
      <path d={spokes.join(" ")} fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="60" r="27" fill="none" stroke={INK} strokeWidth="2.5" />
      <circle cx="60" cy="60" r="14" fill="none" stroke={INK} strokeWidth="2.5" />
      <path d="M82 30 L82 46" stroke={INK} strokeWidth="2.5" />
      <circle cx="82" cy="52" r="8" fill="#100E0E" />
      <circle cx="79" cy="51" r="1.8" fill="#FFFBF7" />
      <circle cx="85" cy="51" r="1.8" fill="#FFFBF7" />
    </svg>
  );
}

export function VestIllustration({ className = "size-20" }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <path
        d="M42 24 L50 24 Q60 44 70 24 L78 24 L80 40 Q90 46 90 58 L90 96 L30 96 L30 58 Q30 46 40 40 Z"
        fill="#2DB8FF"
        {...S}
      />
      <path d="M60 46 L60 96" stroke={INK} strokeWidth="3" />
      <circle cx="66" cy="62" r="3" fill={INK} />
      <circle cx="66" cy="78" r="3" fill={INK} />
    </svg>
  );
}

export function WetIllustration({ className = "size-20" }: P) {
  // A rain cloud with drops: "wet".
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <path
        d="M34 66 Q20 66 22 52 Q24 40 38 42 Q42 26 58 28 Q72 28 76 40 Q92 38 96 52 Q98 66 84 66 Z"
        fill="#FFFBF7"
        {...S}
      />
      <Face x={59} y={48} gap={9} />
      {[36, 60, 84].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${78 + (i % 2) * 6} q-7 11 0 15 q7 -4 0 -15 Z`}
          fill="#2DB8FF"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

const PICTURES: Record<string, (p: P) => React.ReactNode> = {
  apple: AppleIllustration,
  ball: BallIllustration,
  book: BookIllustration,
  butterfly: ButterflyIllustration,
  cat: CatIllustration,
  cow: CowIllustration,
  dog: DogIllustration,
  duck: DuckIllustration,
  elephant: ElephantIllustration,
  fan: FanIllustration,
  fish: FishIllustration,
  hat: HatIllustration,
  moon: MoonIllustration,
  pen: PenIllustration,
  pens: PenIllustration,
  star: StarIllustration,
  sun: SunIllustration,
  tree: TreeIllustration,
  van: VanIllustration,
  vest: VestIllustration,
  web: WebIllustration,
  wet: WetIllustration,
  three: (p) => <NumberTile n={3} {...p} />,
  five: (p) => <NumberTile n={5} {...p} />,
};

/** Words we have a picture for (used by tests and the seed check). */
export const PICTURE_WORDS = Object.keys(PICTURES);

/** Finds the picture for a word or a phrase/sentence (last word with a picture wins: "a red ball" → ball). */
export function pictureFor(text: string) {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  for (let i = words.length - 1; i >= 0; i--) {
    if (PICTURES[words[i]]) return PICTURES[words[i]];
  }
  return null;
}

/**
 * The picture tile used on flashcards and word cards (landing flashcard style).
 * Falls back to a big first-letter tile for teacher-uploaded words without a picture.
 */
export function WordPicture({ text, size = "md", className }: { text: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const Pic = pictureFor(text);
  const box = { sm: "size-14 rounded-xl", md: "size-20 rounded-xl", lg: "size-32 rounded-2xl border-2" }[size];
  const pic = { sm: "size-11", md: "size-16", lg: "size-24" }[size];
  return (
    <div className={cn("flex shrink-0 items-center justify-center border border-foreground/10 bg-card", box, className)}>
      {Pic ? (
        // Plain render functions (no hooks), so call them instead of mounting a dynamic component.
        Pic({ className: pic })
      ) : (
        <span aria-hidden className={cn("font-heading font-bold text-primary uppercase", size === "lg" ? "text-6xl" : size === "md" ? "text-4xl" : "text-2xl")}>
          {text.trim().charAt(0) || "?"}
        </span>
      )}
    </div>
  );
}
