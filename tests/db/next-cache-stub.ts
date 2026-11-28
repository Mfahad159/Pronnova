// DB tests run outside Next: caching is a no-op there (every call hits the database).
export const cacheLife = () => {};
export const cacheTag = () => {};
export const revalidateTag = () => {};
