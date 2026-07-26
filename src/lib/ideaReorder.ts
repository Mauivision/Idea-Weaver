import { Idea } from '../models/Idea';

/**
 * Apply a drag-and-drop reorder to the full ideas array.
 *
 * The list UI may pass a filtered subset. We only rearrange items that appear
 * in `reorderedSubset`, filling their existing slots in the new relative order,
 * and leave every other idea (archived, filtered-out) in place.
 *
 * Returns the original array reference when the payload is invalid so callers
 * can skip a no-op state update.
 */
export function applyIdeaReorder(
  currentIdeas: Idea[],
  reorderedSubset: Idea[]
): Idea[] {
  if (!Array.isArray(currentIdeas) || !Array.isArray(reorderedSubset)) {
    return currentIdeas;
  }

  if (reorderedSubset.length === 0) {
    return currentIdeas;
  }

  const orderedIds = reorderedSubset.map((idea) => idea?.id).filter(Boolean) as string[];
  if (orderedIds.length !== reorderedSubset.length) {
    return currentIdeas;
  }

  const orderedIdSet = new Set(orderedIds);
  if (orderedIdSet.size !== orderedIds.length) {
    return currentIdeas;
  }

  const prevById = new Map(currentIdeas.map((idea) => [idea.id, idea]));
  if (!orderedIds.every((id) => prevById.has(id))) {
    return currentIdeas;
  }

  const subsetSlotCount = currentIdeas.reduce(
    (count, idea) => (orderedIdSet.has(idea.id) ? count + 1 : count),
    0
  );
  if (subsetSlotCount !== orderedIds.length) {
    return currentIdeas;
  }

  let cursor = 0;
  return currentIdeas.map((idea) => {
    if (!orderedIdSet.has(idea.id)) {
      return idea;
    }
    const nextId = orderedIds[cursor];
    cursor += 1;
    return prevById.get(nextId) ?? idea;
  });
}
