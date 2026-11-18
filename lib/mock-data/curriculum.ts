import type {
  Chapter,
  ChapterProgress,
  DifficultyLevel,
  Exercise,
  RecentAttemptSummary,
  StudentProgressOverview,
} from "@/types";

export const SEEDED_CHAPTERS: Chapter[] = [
  {
    id: "everyday-vowels",
    number: 1,
    title: "Everyday Clarity &",
    accentWord: "Vowel Pairs",
    description:
      "Distinguish short and long vowel sounds in familiar everyday words and short sentences.",
    accentTone: "peach",
    focusSounds: ["/ɪ/ vs /iː/", "/æ/ vs /e/"],
    estimatedMinutes: 6,
    exercises: [
      {
        id: "ex-1-1",
        chapterId: "everyday-vowels",
        order: 1,
        title: "Short & Long 'i' Words",
        promptText: "ship, sheep, sit, seat",
        kind: "word",
        level: "basic",
        focusSounds: ["/ɪ/", "/iː/"],
        estimatedMinutes: 2,
        completed: true,
        bestScore: 92,
      },
      {
        id: "ex-1-2",
        chapterId: "everyday-vowels",
        order: 2,
        title: "Morning Greeting Phrase",
        promptText: "Please keep your seat neat and clean.",
        kind: "sentence",
        level: "basic",
        focusSounds: ["/iː/"],
        estimatedMinutes: 2,
        completed: true,
        bestScore: 86,
      },
      {
        id: "ex-1-3",
        chapterId: "everyday-vowels",
        order: 3,
        title: "Contrast Pair Practice",
        promptText: "The green sheep stepped onto the big ship.",
        kind: "sentence",
        level: "medium",
        focusSounds: ["/ɪ/ vs /iː/"],
        estimatedMinutes: 2,
        completed: true,
        bestScore: 78,
      },
      {
        id: "ex-1-4",
        chapterId: "everyday-vowels",
        order: 4,
        title: "Fluency Vowel Check",
        promptText: "Each student brings a pen, a red bag, and a neat sheet.",
        kind: "sentence",
        level: "advanced",
        focusSounds: ["/æ/ vs /e/", "/iː/"],
        estimatedMinutes: 3,
        completed: false,
      },
    ],
  },
  {
    id: "th-sounds",
    number: 2,
    title: "Mastering Clear",
    accentWord: "TH Sounds",
    description:
      "Practice voiced and unvoiced 'th' pronunciation instead of substituting hard 'd' or 't' sounds.",
    accentTone: "sky",
    focusSounds: ["/θ/ (think)", "/ð/ (this)"],
    estimatedMinutes: 7,
    exercises: [
      {
        id: "ex-2-1",
        chapterId: "th-sounds",
        order: 1,
        title: "Soft TH Starter Words",
        promptText: "think, thank, three, thumb",
        kind: "word",
        level: "basic",
        focusSounds: ["/θ/"],
        estimatedMinutes: 2,
        completed: true,
        bestScore: 84,
      },
      {
        id: "ex-2-2",
        chapterId: "th-sounds",
        order: 2,
        title: "Everyday TH Phrase",
        promptText: "This weather is warm on Thursday.",
        kind: "sentence",
        level: "medium",
        focusSounds: ["/ð/", "/θ/"],
        estimatedMinutes: 2,
        completed: true,
        bestScore: 74,
      },
      {
        id: "ex-2-3",
        chapterId: "th-sounds",
        order: 3,
        title: "Mixed TH Sentence",
        promptText: "Both brothers thanked their mother for the three notebooks.",
        kind: "sentence",
        level: "advanced",
        focusSounds: ["/θ/", "/ð/"],
        estimatedMinutes: 3,
        completed: false,
      },
    ],
  },
  {
    id: "v-and-w-distinction",
    number: 3,
    title: "Clear V & W",
    accentWord: "Articulation",
    description:
      "Build crisp lip-and-teeth articulation to separate 'v' and 'w' in spoken English.",
    accentTone: "mint",
    focusSounds: ["/v/ vs /w/"],
    estimatedMinutes: 6,
    exercises: [
      {
        id: "ex-3-1",
        chapterId: "v-and-w-distinction",
        order: 1,
        title: "V & W Word Pairs",
        promptText: "vine, wine, vest, west",
        kind: "word",
        level: "basic",
        focusSounds: ["/v/", "/w/"],
        estimatedMinutes: 2,
        completed: true,
        bestScore: 81,
      },
      {
        id: "ex-3-2",
        chapterId: "v-and-w-distinction",
        order: 2,
        title: "Village Visit Phrase",
        promptText: "We visited a very warm village.",
        kind: "phrase",
        level: "medium",
        focusSounds: ["/w/", "/v/"],
        estimatedMinutes: 2,
        completed: false,
      },
      {
        id: "ex-3-3",
        chapterId: "v-and-w-distinction",
        order: 3,
        title: "Winter Travel Sentence",
        promptText: "Five travellers waved from the white van near the water.",
        kind: "sentence",
        level: "advanced",
        focusSounds: ["/v/ vs /w/"],
        estimatedMinutes: 2,
        completed: false,
      },
    ],
  },
  {
    id: "classroom-phrases",
    number: 4,
    title: "Confident Classroom",
    accentWord: "Phrases",
    description:
      "Speak common classroom questions, answers, and polite requests clearly and naturally.",
    accentTone: "cream",
    focusSounds: ["/p/ vs /f/", "Clear word endings"],
    estimatedMinutes: 5,
    exercises: [
      {
        id: "ex-4-1",
        chapterId: "classroom-phrases",
        order: 1,
        title: "Polite Question",
        promptText: "May I please borrow a pencil?",
        kind: "phrase",
        level: "basic",
        focusSounds: ["/p/"],
        estimatedMinutes: 2,
        completed: false,
      },
      {
        id: "ex-4-2",
        chapterId: "classroom-phrases",
        order: 2,
        title: "Sharing an Answer",
        promptText: "I finished reading the first paragraph carefully.",
        kind: "sentence",
        level: "medium",
        focusSounds: ["/f/", "/p/"],
        estimatedMinutes: 2,
        completed: false,
      },
      {
        id: "ex-4-3",
        chapterId: "classroom-phrases",
        order: 3,
        title: "Group Presentation Line",
        promptText: "Our science project explains how fresh plants prepare food.",
        kind: "sentence",
        level: "advanced",
        focusSounds: ["/p/ vs /f/", "Clusters"],
        estimatedMinutes: 3,
        completed: false,
      },
    ],
  },
  {
    id: "consonant-clusters",
    number: 5,
    title: "Consonant Clusters &",
    accentWord: "Word Endings",
    description:
      "Pronounce beginning and ending consonant blends smoothly without adding extra vowel sounds.",
    accentTone: "peach",
    focusSounds: ["sp-/st-/sk-", "-nd/-st endings"],
    estimatedMinutes: 6,
    exercises: [
      {
        id: "ex-5-1",
        chapterId: "consonant-clusters",
        order: 1,
        title: "Initial S-Blends",
        promptText: "school, star, speak, small",
        kind: "word",
        level: "basic",
        focusSounds: ["sk-", "st-", "sp-"],
        estimatedMinutes: 2,
        completed: false,
      },
      {
        id: "ex-5-2",
        chapterId: "consonant-clusters",
        order: 2,
        title: "Crisp Final Endings",
        promptText: "The fast student found the best desk.",
        kind: "sentence",
        level: "medium",
        focusSounds: ["-st", "-nd", "-sk"],
        estimatedMinutes: 2,
        completed: false,
      },
      {
        id: "ex-5-3",
        chapterId: "consonant-clusters",
        order: 3,
        title: "Schoolyard Story Line",
        promptText: "Students stood straight and spoke clearly on the sports ground.",
        kind: "sentence",
        level: "advanced",
        focusSounds: ["st-", "sp-", "-nd"],
        estimatedMinutes: 3,
        completed: false,
      },
    ],
  },
  {
    id: "reading-fluency",
    number: 6,
    title: "Everyday Reading",
    accentWord: "Fluency",
    description:
      "Combine clear vowels, consonant endings, and steady pacing across full read-aloud sentences.",
    accentTone: "sky",
    focusSounds: ["Mixed vowels", "Steady pacing"],
    estimatedMinutes: 8,
    exercises: [
      {
        id: "ex-6-1",
        chapterId: "reading-fluency",
        order: 1,
        title: "Short Story Opening",
        promptText: "Early in the morning, fresh sunlight filled the quiet garden.",
        kind: "sentence",
        level: "medium",
        focusSounds: ["Steady pacing", "/ð/"],
        estimatedMinutes: 2,
        completed: false,
      },
      {
        id: "ex-6-2",
        chapterId: "reading-fluency",
        order: 2,
        title: "Nature Observation",
        promptText: "Bright birds flew above the green trees near the river bank.",
        kind: "sentence",
        level: "medium",
        focusSounds: ["/v/", "/iː/", "Clusters"],
        estimatedMinutes: 3,
        completed: false,
      },
      {
        id: "ex-6-3",
        chapterId: "reading-fluency",
        order: 3,
        title: "Science Reflection",
        promptText: "Clean water and healthy soil help every village grow strong crops.",
        kind: "sentence",
        level: "advanced",
        focusSounds: ["/v/ vs /w/", "/θ/"],
        estimatedMinutes: 3,
        completed: false,
      },
    ],
  },
];

export const SEEDED_RECENT_ATTEMPTS: RecentAttemptSummary[] = [
  {
    id: "att-105",
    exerciseId: "ex-1-3",
    chapterId: "everyday-vowels",
    chapterTitle: "Everyday Clarity & Vowel Pairs",
    exerciseTitle: "Contrast Pair Practice",
    promptText: "The green sheep stepped onto the big ship.",
    level: "medium",
    score: 78,
    practicedAtLabel: "Today, 10:15 AM",
    flaggedWords: ["sheep", "stepped"],
  },
  {
    id: "att-104",
    exerciseId: "ex-2-2",
    chapterId: "th-sounds",
    chapterTitle: "Mastering Clear TH Sounds",
    exerciseTitle: "Everyday TH Phrase",
    promptText: "This weather is warm on Thursday.",
    level: "medium",
    score: 74,
    practicedAtLabel: "Yesterday, 4:40 PM",
    flaggedWords: ["weather", "Thursday"],
  },
  {
    id: "att-103",
    exerciseId: "ex-3-1",
    chapterId: "v-and-w-distinction",
    chapterTitle: "Clear V & W Articulation",
    exerciseTitle: "V & W Word Pairs",
    promptText: "vine, wine, vest, west",
    level: "basic",
    score: 81,
    practicedAtLabel: "Yesterday, 4:25 PM",
    flaggedWords: ["vest"],
  },
  {
    id: "att-102",
    exerciseId: "ex-1-2",
    chapterId: "everyday-vowels",
    chapterTitle: "Everyday Clarity & Vowel Pairs",
    exerciseTitle: "Morning Greeting Phrase",
    promptText: "Please keep your seat neat and clean.",
    level: "basic",
    score: 86,
    practicedAtLabel: "2 days ago",
    flaggedWords: [],
  },
  {
    id: "att-101",
    exerciseId: "ex-1-1",
    chapterId: "everyday-vowels",
    chapterTitle: "Everyday Clarity & Vowel Pairs",
    exerciseTitle: "Short & Long 'i' Words",
    promptText: "ship, sheep, sit, seat",
    level: "basic",
    score: 92,
    practicedAtLabel: "3 days ago",
    flaggedWords: [],
  },
];

export function getAllChapters(): Chapter[] {
  return SEEDED_CHAPTERS;
}

export function getChapterById(chapterId: string): Chapter | undefined {
  return SEEDED_CHAPTERS.find((chapter) => chapter.id === chapterId);
}

export function getExerciseById(
  exerciseId: string
): { chapter: Chapter; exercise: Exercise } | undefined {
  for (const chapter of SEEDED_CHAPTERS) {
    const exercise = chapter.exercises.find((item) => item.id === exerciseId);
    if (exercise) {
      return { chapter, exercise };
    }
  }
  return undefined;
}

export function getAllExercises(): Exercise[] {
  return SEEDED_CHAPTERS.flatMap((chapter) => chapter.exercises);
}

export function getChapterLevels(chapter: Chapter): DifficultyLevel[] {
  const order: DifficultyLevel[] = ["basic", "medium", "advanced"];
  const set = new Set(chapter.exercises.map((ex) => ex.level));
  return order.filter((level) => set.has(level));
}

export function getChapterProgress(chapter: Chapter): ChapterProgress {
  const totalCount = chapter.exercises.length;
  const completed = chapter.exercises.filter((ex) => ex.completed);
  const scored = completed.filter((ex) => typeof ex.bestScore === "number");
  const averageScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, ex) => sum + (ex.bestScore ?? 0), 0) / scored.length
        )
      : null;

  const latestAttempt = SEEDED_RECENT_ATTEMPTS.find(
    (attempt) => attempt.chapterId === chapter.id
  );

  return {
    chapterId: chapter.id,
    completedCount: completed.length,
    totalCount,
    percentage: totalCount > 0 ? Math.round((completed.length / totalCount) * 100) : 0,
    averageScore,
    lastPracticedLabel: latestAttempt?.practicedAtLabel ?? null,
  };
}

export function getRecommendedChapters(excludeChapterId: string, limit = 3): Chapter[] {
  return SEEDED_CHAPTERS.filter((chapter) => chapter.id !== excludeChapterId).slice(
    0,
    limit
  );
}

export function getRecentAttempts(): RecentAttemptSummary[] {
  return SEEDED_RECENT_ATTEMPTS;
}

export function getStudentProgressOverview(): StudentProgressOverview {
  const exercises = getAllExercises();
  const completed = exercises.filter((ex) => ex.completed);
  const scored = completed.filter((ex) => typeof ex.bestScore === "number");
  const averageAccuracy =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, ex) => sum + (ex.bestScore ?? 0), 0) / scored.length
        )
      : 0;

  return {
    studentName: "Amina",
    totalAttempts: SEEDED_RECENT_ATTEMPTS.length,
    completedExercises: completed.length,
    totalExercises: exercises.length,
    averageAccuracy,
    focusSoundsToPractice: ["/θ/ & /ð/", "/v/ vs /w/", "/ɪ/ vs /iː/"],
  };
}
