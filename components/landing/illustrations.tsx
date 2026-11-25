/**
 * Consistent 2D flat-vector educational illustrations matching Pronnova's coral, orange,
 * sky, and cream palette with #100E0E cartoon outlines. All SVGs are decorative (aria-hidden).
 */

export function AppleIllustration({ className = "size-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {/* Stem & leaf */}
      <path d="M60 32 C60 20, 64 14, 70 14" fill="none" stroke="#100E0E" strokeWidth="4" strokeLinecap="round" />
      <path d="M62 24 C74 14, 88 18, 86 28 C78 32, 68 30, 62 24 Z" fill="#22AD5A" stroke="#100E0E" strokeWidth="3.5" strokeLinejoin="round" />
      {/* Apple body */}
      <path
        d="M60 34 C46 28, 24 38, 24 66 C24 94, 42 106, 54 104 C58 103, 62 103, 66 104 C78 106, 96 94, 96 66 C96 38, 74 28, 60 34 Z"
        fill="#FF594B"
        stroke="#100E0E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Highlight */}
      <path d="M36 56 C36 48, 42 44, 48 44" fill="none" stroke="#FFE8D6" strokeWidth="4" strokeLinecap="round" />
      {/* Friendly face */}
      <circle cx="49" cy="68" r="3" fill="#100E0E" />
      <circle cx="71" cy="68" r="3" fill="#100E0E" />
      <circle cx="42" cy="75" r="5.5" fill="#FF8D28" opacity="0.7" />
      <circle cx="78" cy="75" r="5.5" fill="#FF8D28" opacity="0.7" />
      <path d="M54 76 Q60 82 66 76" fill="none" stroke="#100E0E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function CatIllustration({ className = "size-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {/* Ears */}
      <polygon points="30,52 34,20 56,38" fill="#FF8D28" stroke="#100E0E" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="90,52 86,20 64,38" fill="#FF8D28" stroke="#100E0E" strokeWidth="4" strokeLinejoin="round" />
      {/* Head */}
      <ellipse cx="60" cy="68" rx="34" ry="30" fill="#FFE8D6" stroke="#100E0E" strokeWidth="4" />
      <circle cx="47" cy="64" r="3.5" fill="#100E0E" />
      <circle cx="73" cy="64" r="3.5" fill="#100E0E" />
      <circle cx="38" cy="73" r="6" fill="#FF594B" opacity="0.55" />
      <circle cx="82" cy="73" r="6" fill="#FF594B" opacity="0.55" />
      <polygon points="56,72 64,72 60,77" fill="#FF594B" stroke="#100E0E" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M52 81 Q60 86 68 81" fill="none" stroke="#100E0E" strokeWidth="3" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="20" y1="68" x2="34" y2="70" stroke="#100E0E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="76" x2="34" y2="75" stroke="#100E0E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="68" x2="86" y2="70" stroke="#100E0E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="76" x2="86" y2="75" stroke="#100E0E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ButterflyIllustration({ className = "size-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {/* Upper wings */}
      <ellipse cx="38" cy="48" rx="22" ry="18" transform="rotate(-18 38 48)" fill="#FF8D28" stroke="#100E0E" strokeWidth="4" />
      <ellipse cx="82" cy="48" rx="22" ry="18" transform="rotate(18 82 48)" fill="#FF8D28" stroke="#100E0E" strokeWidth="4" />
      {/* Lower wings */}
      <ellipse cx="42" cy="76" rx="16" ry="14" transform="rotate(15 42 76)" fill="#FFB000" stroke="#100E0E" strokeWidth="4" />
      <ellipse cx="78" cy="76" rx="16" ry="14" transform="rotate(-15 78 76)" fill="#FFB000" stroke="#100E0E" strokeWidth="4" />
      {/* Wing spots */}
      <circle cx="35" cy="46" r="6" fill="#FFFBF7" />
      <circle cx="85" cy="46" r="6" fill="#FFFBF7" />
      {/* Body */}
      <rect x="54" y="38" width="12" height="52" rx="6" fill="#100E0E" />
      <path d="M57 38 Q48 22 40 24" fill="none" stroke="#100E0E" strokeWidth="3" strokeLinecap="round" />
      <path d="M63 38 Q72 22 80 24" fill="none" stroke="#100E0E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ElephantIllustration({ className = "size-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {/* Ears */}
      <ellipse cx="28" cy="62" rx="16" ry="22" fill="#2DB8FF" stroke="#100E0E" strokeWidth="4" />
      <ellipse cx="92" cy="62" rx="16" ry="22" fill="#2DB8FF" stroke="#100E0E" strokeWidth="4" />
      <ellipse cx="28" cy="64" rx="8" ry="13" fill="#FFE8D6" />
      <ellipse cx="92" cy="64" rx="8" ry="13" fill="#FFE8D6" />
      {/* Head */}
      <circle cx="60" cy="60" r="28" fill="#DFF3FF" stroke="#100E0E" strokeWidth="4" />
      {/* Eyes */}
      <circle cx="49" cy="54" r="3" fill="#100E0E" />
      <circle cx="71" cy="54" r="3" fill="#100E0E" />
      <circle cx="41" cy="64" r="5" fill="#FF594B" opacity="0.55" />
      <circle cx="79" cy="64" r="5" fill="#FF594B" opacity="0.55" />
      {/* Trunk */}
      <path d="M54 66 C54 88, 66 96, 76 88 C80 84, 76 78, 71 81" fill="none" stroke="#100E0E" strokeWidth="10" strokeLinecap="round" />
      <path d="M54 66 C54 88, 66 96, 76 88 C80 84, 76 78, 71 81" fill="none" stroke="#DFF3FF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function SunIllustration({ className = "size-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="60"
          y1="14"
          x2="60"
          y2="24"
          stroke="#FF8D28"
          strokeWidth="6"
          strokeLinecap="round"
          transform={`rotate(${deg} 60 60)`}
        />
      ))}
      <circle cx="60" cy="60" r="28" fill="#FFB000" stroke="#100E0E" strokeWidth="4" />
      <circle cx="51" cy="56" r="3" fill="#100E0E" />
      <circle cx="69" cy="56" r="3" fill="#100E0E" />
      <path d="M52 67 Q60 74 68 67" fill="none" stroke="#100E0E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function BookIllustration({ className = "size-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {/* Back cover */}
      <rect x="22" y="28" width="76" height="64" rx="10" fill="#FF594B" stroke="#100E0E" strokeWidth="4" />
      {/* Open pages */}
      <path d="M28 34 L60 40 L92 34 L92 84 L60 90 L28 84 Z" fill="#FFFBF7" stroke="#100E0E" strokeWidth="3.5" strokeLinejoin="round" />
      <line x1="60" y1="40" x2="60" y2="90" stroke="#100E0E" strokeWidth="3.5" />
      {/* Text lines */}
      <line x1="36" y1="50" x2="52" y2="52" stroke="#FF8D28" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="62" x2="52" y2="64" stroke="#100E0E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="68" y1="52" x2="84" y2="50" stroke="#22AD5A" strokeWidth="3" strokeLinecap="round" />
      <line x1="68" y1="64" x2="84" y2="62" stroke="#100E0E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
