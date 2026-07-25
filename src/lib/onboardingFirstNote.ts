/**
 * Durable handoff for the first onboarding note.
 * Writes the idea into the main ideas store immediately so a tab close
 * during the onboarding→app transition cannot drop the note after
 * onboarding is marked complete.
 */

export const ONBOARDING_FIRST_NOTE_KEY = 'ideaWeaverOnboardingFirstNote';
const IDEAS_STORAGE_KEY = 'ideaWeaverIdeas';

/** Combine finalized speech with any still-visible interim text. */
export function composeOnboardingNoteText(
  finalTranscript: string,
  interimTranscript = ''
): string {
  return [finalTranscript, interimTranscript]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

interface PersistedNote {
  id: string;
  content: string;
  createdAt: string;
}

interface PersistedIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  notes: PersistedNote[];
  connections: string[];
  position: { x: number; y: number };
}

function createFirstIdea(noteContent: string): PersistedIdea {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: 'First Idea',
    description: '',
    category: 'Uncategorized',
    tags: [],
    isFavorite: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    notes: [
      {
        id: crypto.randomUUID(),
        content: noteContent,
        createdAt: now,
      },
    ],
    connections: [],
    position: {
      x: Math.random() * 400,
      y: Math.random() * 300,
    },
  };
}

/**
 * Persist the first onboarding note into localStorage before leaving onboarding.
 * Falls back to a handoff key if the ideas store is unreadable (avoid wiping it).
 */
export function persistOnboardingFirstNote(noteContent: string): void {
  const trimmed = noteContent.trim();
  if (!trimmed) return;

  try {
    const raw = localStorage.getItem(IDEAS_STORAGE_KEY);
    let ideas: PersistedIdea[] = [];

    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        // Do not overwrite corrupt data; use handoff key for App.tsx recovery.
        localStorage.setItem(ONBOARDING_FIRST_NOTE_KEY, trimmed);
        return;
      }
      ideas = parsed as PersistedIdea[];
    }

    const alreadyPersisted = ideas.some(
      (idea) =>
        idea?.title === 'First Idea' &&
        Array.isArray(idea.notes) &&
        idea.notes.some((note) => note?.content === trimmed)
    );

    if (!alreadyPersisted) {
      ideas.push(createFirstIdea(trimmed));
      localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
    }
  } catch {
    // Keep unreadable ideas data intact; App can still recover via handoff key.
    localStorage.setItem(ONBOARDING_FIRST_NOTE_KEY, trimmed);
  }
}

/** Read and clear the fallback handoff key, if any. */
export function consumeOnboardingFirstNote(): string | null {
  const value = localStorage.getItem(ONBOARDING_FIRST_NOTE_KEY);
  localStorage.removeItem(ONBOARDING_FIRST_NOTE_KEY);
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
