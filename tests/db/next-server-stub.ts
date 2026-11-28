// DB tests call the real query code outside a Next request; connection() only matters inside Next.
export async function connection(): Promise<void> {}

// after() schedules background work (TTS pre-generation for saved materials). DB tests don't run it:
// they check the database, and must not depend on the speech engine running.
export function after(...task: unknown[]): void {
  void task;
}
