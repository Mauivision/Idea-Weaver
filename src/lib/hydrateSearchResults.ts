import { Idea } from '../models/Idea';

/**
 * Replace advanced-search snapshot objects with live idea instances by id.
 * Prevents stale List snapshots from overwriting newer notes/fields on update.
 */
export function hydrateSearchResultsById(
  liveIdeas: Idea[],
  snapshotResults: Idea[]
): Idea[] {
  const byId = new Map(liveIdeas.map((idea) => [idea.id, idea]));
  return snapshotResults
    .map((result) => byId.get(result.id))
    .filter((idea): idea is Idea => idea != null);
}

/**
 * Enable the advanced-search snapshot only when filters actually change the set.
 * Never enable merely because results are non-empty (that pinned a stale snapshot
 * for the whole session after visiting List).
 */
export function shouldEnableAdvancedSearch(
  resultCount: number,
  liveIdeaCount: number
): boolean {
  return resultCount !== liveIdeaCount;
}
