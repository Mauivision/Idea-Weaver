const SOUND_PREF_KEY = 'ideaWeaverSoundOn';

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

/** Optional soft "capture" sound. Respects user preference. */
export function playCaptureSound(): void {
  try {
    const pref = localStorage.getItem(SOUND_PREF_KEY);
    if (pref === 'false') return;
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 520;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    /* ignore */
  }
}

export function getSoundOn(): boolean {
  if (typeof localStorage === 'undefined') return true;
  const v = localStorage.getItem(SOUND_PREF_KEY);
  return v !== 'false';
}

export function setSoundOn(on: boolean): void {
  localStorage.setItem(SOUND_PREF_KEY, on ? 'true' : 'false');
}
