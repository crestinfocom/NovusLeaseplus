// Tiny pub/sub bus so the shared topbar search can reach whichever admin
// table view is currently mounted.

type SearchHandler = (query: string) => void;

const subscribers = new Set<SearchHandler>();

export function onAdminSearch(fn: SearchHandler): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function emitAdminSearch(query: string): void {
  const q = query.trim().toLowerCase();
  for (const fn of subscribers) fn(q);
}

export function clearAdminSearch(): void {
  emitAdminSearch("");
}