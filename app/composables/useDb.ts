// Typed helpers live in domain models; client stays flexible with select joins.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDb(): any {
  return useSupabaseClient()
}
