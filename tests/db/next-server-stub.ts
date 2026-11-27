// DB tests call the real query code outside a Next request; connection() only matters inside Next.
export async function connection(): Promise<void> {}
