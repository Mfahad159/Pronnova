/**
 * Role cards for /onboarding, drawn in the landing hero's style (pronnova-swing-crew.png): chubby kawaii
 * characters, thick warm-dark outlines, rosy cheeks, happy closed eyes, puffy clouds, and the brand
 * palette (coral, peach, sky, mint, cream). Inline SVG: crisp at any size, no image requests.
 * viewBox 640 × 400 (the card's 16:10 picture area). Decorative: the card text names the role.
 */

const INK = "#3a2a22"; // outline (warm dark, like the hero art)
const SKIN = "#ffd9b8";
const CHEEK = "#ff8a7a";
const CORAL = "#ff594b";
const HAIR = "#3b2a24";

const line = { stroke: INK, strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M10 40 C0 40 0 22 14 22 C14 8 34 4 42 16 C48 4 70 6 72 22 C86 22 88 40 74 40 Z"
        fill="#ffffff"
        stroke="#bfe0f5"
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </g>
  );
}

function Sparkle({ x, y, s = 1, color = "#ffc93c" }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -14 C2 -4 4 -2 14 0 C4 2 2 4 0 14 C-2 4 -4 2 -14 0 C-4 -2 -2 -4 0 -14 Z"
      fill={color}
      {...line}
      strokeWidth={3}
    />
  );
}

/** A happy Class 1 student singing into a microphone, with sound waves and letter bubbles. */
export function StudentRoleIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="presentation" aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="640" height="400" fill="#ffe8d6" />
      <circle cx="560" cy="70" r="120" fill="#ffd9c2" />
      <Cloud x={60} y={40} s={1.3} />
      <Cloud x={430} y={70} s={1} />
      <rect y="330" width="640" height="70" fill="#f8d2b4" />
      <path d="M0 330 H640" stroke="#efbf9c" strokeWidth={4} />

      {/* letter bubbles + sound waves */}
      <g>
        <path d="M420 170 q18 30 0 60" fill="none" {...line} stroke={CORAL} strokeWidth={6} />
        <path d="M445 150 q30 50 0 100" fill="none" {...line} stroke={CORAL} strokeWidth={6} opacity={0.75} />
        <path d="M470 130 q42 70 0 140" fill="none" {...line} stroke={CORAL} strokeWidth={6} opacity={0.5} />
        <circle cx="530" cy="150" r="30" fill="#dff3ff" {...line} />
        <text x="530" y="162" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight={700} fontSize="34" fill={INK}>a</text>
        <circle cx="560" cy="245" r="26" fill="#e3f4dc" {...line} />
        <text x="560" y="256" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight={700} fontSize="30" fill={INK}>b</text>
        <Sparkle x={505} y={300} s={0.9} />
      </g>

      {/* body: school shirt + shorts, sitting cross-legged */}
      <path d="M232 334 q-10 -62 40 -86 h96 q50 24 40 86 z" fill="#8ccaf2" {...line} />
      <path d="M296 250 l24 26 l24 -26" fill="#ffffff" {...line} />
      <path d="M250 334 q40 -26 70 -4 q30 -22 70 4 q-6 22 -70 18 q-64 4 -70 -18 z" fill="#5a7fb5" {...line} />
      <ellipse cx="236" cy="336" rx="26" ry="14" fill={CORAL} {...line} />
      <ellipse cx="404" cy="336" rx="26" ry="14" fill={CORAL} {...line} />

      {/* arm + microphone */}
      <path d="M372 268 q34 4 38 -30" fill="none" {...line} strokeWidth={22} stroke={INK} />
      <path d="M372 268 q34 4 38 -30" fill="none" strokeWidth={13} stroke="#8ccaf2" strokeLinecap="round" />
      <rect x="394" y="196" width="16" height="44" rx="6" fill="#6b6b6b" {...line} transform="rotate(14 402 218)" />
      <circle cx="396" cy="186" r="20" fill={CORAL} {...line} />
      <path d="M384 180 h24 M384 190 h24" stroke="#ffb3a8" strokeWidth={3} strokeLinecap="round" />
      <circle cx="404" cy="236" r="15" fill={SKIN} {...line} />

      {/* head */}
      <ellipse cx="300" cy="166" rx="86" ry="80" fill={SKIN} {...line} />
      {/* hair: cap + two puffs with coral bows */}
      <path d="M216 166 q-6 -90 84 -92 q92 2 86 92 q-20 -54 -86 -54 q-64 0 -84 54 z" fill={HAIR} {...line} />
      <circle cx="206" cy="128" r="30" fill={HAIR} {...line} />
      <circle cx="394" cy="128" r="30" fill={HAIR} {...line} />
      <path d="M222 108 l-18 -14 v28 z M222 108 l18 -14 v28 z" fill={CORAL} {...line} strokeWidth={3.5} />
      <path d="M378 108 l-18 -14 v28 z M378 108 l18 -14 v28 z" fill={CORAL} {...line} strokeWidth={3.5} />
      {/* face: happy closed eyes, cheeks, open singing mouth */}
      <path d="M258 168 q12 -14 24 0" fill="none" {...line} />
      <path d="M318 168 q12 -14 24 0" fill="none" {...line} />
      <ellipse cx="248" cy="196" rx="15" ry="10" fill={CHEEK} opacity={0.75} />
      <ellipse cx="352" cy="196" rx="15" ry="10" fill={CHEEK} opacity={0.75} />
      <path d="M282 196 q18 34 36 0 z" fill="#b4342a" {...line} />
      <path d="M290 206 q10 10 20 0" fill="#ff8a7a" />
    </svg>
  );
}

/** A friendly teacher with round glasses pointing at a small board that says "cat". */
export function TeacherRoleIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 400" className={className} role="presentation" aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="640" height="400" fill="#dff3ff" />
      <circle cx="90" cy="70" r="120" fill="#cfeafb" />
      <Cloud x={480} y={40} s={1.2} />
      <Cloud x={250} y={30} s={0.8} />
      <rect y="336" width="640" height="64" fill="#cfe6c4" />
      <path d="M0 336 H640" stroke="#b9d8ab" strokeWidth={4} />

      {/* board on an easel */}
      <path d="M110 336 l40 -120 M250 336 l-40 -120" {...line} strokeWidth={9} stroke={INK} />
      <path d="M110 336 l40 -120 M250 336 l-40 -120" stroke="#c98a54" strokeWidth={5} strokeLinecap="round" />
      <rect x="70" y="110" width="220" height="150" rx="16" fill="#c98a54" {...line} />
      <rect x="86" y="126" width="188" height="118" rx="10" fill="#3f6b55" {...line} strokeWidth={4} />
      <text x="180" y="200" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight={700} fontSize="48" fill="#ffffff">cat</text>
      <path d="M128 222 q52 14 104 0" fill="none" stroke="#ffc93c" strokeWidth={5} strokeLinecap="round" />
      <Sparkle x={256} y={146} s={0.8} />

      {/* body: coral cardigan over a cream top */}
      <path d="M352 336 q-14 -88 56 -108 h64 q70 20 56 108 z" fill="#ff8a5c" {...line} />
      <path d="M418 228 h44 l-6 108 h-32 z" fill="#f8f1d8" {...line} />
      <circle cx="440" cy="262" r="5" fill={INK} />
      <circle cx="440" cy="292" r="5" fill={INK} />

      {/* arm with pointer towards the board */}
      <path d="M376 262 q-40 -6 -70 -34" fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" />
      <path d="M376 262 q-40 -6 -70 -34" fill="none" stroke="#ff8a5c" strokeWidth={15} strokeLinecap="round" />
      <path d="M306 228 L262 190" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M306 228 L262 190" stroke="#ffc93c" strokeWidth={4} strokeLinecap="round" />
      <circle cx="304" cy="226" r="15" fill={SKIN} {...line} />

      {/* other arm holding a book */}
      <rect x="486" y="250" width="58" height="44" rx="6" fill={CORAL} {...line} transform="rotate(-10 515 272)" />
      <path d="M496 262 h36" stroke="#ffd2cc" strokeWidth={4} strokeLinecap="round" transform="rotate(-10 515 272)" />
      <circle cx="492" cy="286" r="14" fill={SKIN} {...line} />

      {/* head */}
      <ellipse cx="440" cy="150" rx="78" ry="74" fill={SKIN} {...line} />
      {/* hair: side part + bun */}
      <circle cx="440" cy="66" r="30" fill={HAIR} {...line} />
      <path d="M362 160 q-8 -86 78 -86 q86 0 78 86 q-14 -40 -46 -50 q-26 18 -74 12 q-26 10 -36 38 z" fill={HAIR} {...line} />
      {/* round glasses + happy eyes */}
      <circle cx="410" cy="158" r="22" fill="#ffffff" fillOpacity={0.35} {...line} strokeWidth={4.5} />
      <circle cx="470" cy="158" r="22" fill="#ffffff" fillOpacity={0.35} {...line} strokeWidth={4.5} />
      <path d="M432 158 h16" {...line} strokeWidth={4.5} />
      <path d="M400 160 q10 -11 20 0" fill="none" {...line} strokeWidth={4.5} />
      <path d="M460 160 q10 -11 20 0" fill="none" {...line} strokeWidth={4.5} />
      <ellipse cx="392" cy="190" rx="13" ry="9" fill={CHEEK} opacity={0.75} />
      <ellipse cx="488" cy="190" rx="13" ry="9" fill={CHEEK} opacity={0.75} />
      <path d="M424 190 q16 20 32 0" fill="#b4342a" {...line} strokeWidth={4.5} />
    </svg>
  );
}
