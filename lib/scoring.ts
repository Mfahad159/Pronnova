import type { Classification } from "@/types";

// SRS 3.2.5. Later these come from the `settings` table.
export const EXCELLENT_MIN = 85;
export const GOOD_MIN = 70;

export function classify(score: number): Classification {
  if (score >= EXCELLENT_MIN) return "excellent";
  if (score >= GOOD_MIN) return "good";
  return "average";
}

export const classificationLabel: Record<Classification, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
};

/** SRS 3.2.6: errors ÷ attempts as a percentage. */
export function errorRate(errors: number, attempts: number): number {
  if (attempts <= 0) return 0;
  return Math.round((errors / attempts) * 1000) / 10;
}
