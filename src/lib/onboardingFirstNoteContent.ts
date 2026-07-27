/**
 * Resolve the onboarding first-note payload from committed speech,
 * visible interim speech, or an unsaved typed textarea draft.
 */
export function resolveOnboardingFirstNoteContent(
  transcript: string,
  interimTranscript: string,
  typedDraft?: string | null
): string | undefined {
  const committed = transcript.trim();
  if (committed) return committed;
  const interim = interimTranscript.trim();
  if (interim) return interim;
  const typed = typedDraft?.trim();
  return typed || undefined;
}
