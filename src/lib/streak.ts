const STREAK_KEY = 'ideaWeaverStreak';
const LAST_CAPTURE_KEY = 'ideaWeaverLastCapture';

export interface StreakState {
  count: number;
  lastDate: string; // YYYY-MM-DD
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseStored(): StreakState | null {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StreakState;
    if (typeof parsed.count === 'number' && typeof parsed.lastDate === 'string') return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

/** Call when user captures something (add/update idea or note). Returns new streak count. */
export function recordCapture(): number {
  const now = today();
  const stored = parseStored();
  let count = 1;
  if (stored) {
    const last = stored.lastDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (last === now) {
      count = stored.count; // same day, no change
    } else if (last === yesterdayStr) {
      count = stored.count + 1; // consecutive day
    }
    // else: gap, reset to 1
  }
  const state: StreakState = { count, lastDate: now };
  localStorage.setItem(STREAK_KEY, JSON.stringify(state));
  localStorage.setItem(LAST_CAPTURE_KEY, now);
  return count;
}

/** Get current streak (without recording). */
export function getStreak(): StreakState | null {
  const stored = parseStored();
  if (!stored) return null;
  const now = today();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (stored.lastDate === now || stored.lastDate === yesterdayStr) return stored;
  return null; // streak broken
}
