import React, { useState, useEffect, useRef, useCallback } from 'react';

const ONBOARDING_STORAGE_KEY = 'ideaWeaverOnboardingCompleted';
export const ONBOARDING_FIRST_NOTE_KEY = 'ideaWeaverOnboardingFirstNote';

// SpeechRecognition types (Web Speech API)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onsoundstart: (() => void) | null;
  onspeechstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface OnboardingScreenProps {
  onComplete: (premiumUnlocked?: boolean, firstNoteContent?: string) => void;
  showToast?: (msg: string, severity: 'success' | 'info' | 'warning' | 'error') => void;
}

function usePrefersDark() {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = () => setDark(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return dark;
}

function OnboardingScreen({ onComplete, showToast }: OnboardingScreenProps) {
  const isDark = usePrefersDark();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [hasFirstNote, setHasFirstNote] = useState(false);
  const [isUnlockLoading, setIsUnlockLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTypeInput, setShowTypeInput] = useState(false);
  const autoRestart = false; // Toggle for optional auto-restart after each result
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const SpeechRecognitionClass = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : undefined;
  const isSupported = !!SpeechRecognitionClass;

  const completeFlow = useCallback(
    (premiumUnlocked: boolean, firstNote?: string) => {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      if (firstNote?.trim()) {
        sessionStorage.setItem(ONBOARDING_FIRST_NOTE_KEY, firstNote.trim());
      }
      sessionStorage.setItem('onboardingJustCompleted', premiumUnlocked ? 'unlocked' : 'skipped');
      setIsTransitioning(true);
      setTimeout(() => onComplete(premiumUnlocked, firstNote), 600);
    },
    [onComplete]
  );

  // Handle unlock - placeholder for real payment integration
  const handleUnlock = useCallback(async () => {
    // TODO: Replace with real payment initiation
    // Example (Stripe):
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ priceId: 'price_1.99', amount: 199 })
    // });
    // const { sessionId } = await response.json();
    // stripe.redirectToCheckout({ sessionId });
    //
    // Example (Gumroad/Lemon Squeezy):
    // window.location.href = 'https://gumroad.com/l/idea-weaver-unlock';
    console.log('Would open Stripe / Gumroad / Lemon Squeezy checkout for $1.99');

    setIsUnlockLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1800));
    setIsUnlockLoading(false);
    showToast?.('Premium unlocked – thank you!', 'success');
    completeFlow(true, transcript || undefined);
  }, [transcript, completeFlow, showToast]);

  const handleSkip = useCallback(() => {
    completeFlow(false, transcript || undefined);
  }, [transcript, completeFlow]);

  // Setup and teardown Speech Recognition
  useEffect(() => {
    if (!SpeechRecognitionClass || !isSupported) return;

    const recognition = new SpeechRecognitionClass() as SpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }
      if (finalText) {
        setTranscript(prev => prev ? `${prev} ${finalText}`.trim() : finalText);
        setInterimTranscript('');
        setHasFirstNote(true);
      }
      if (interimText) {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Please allow microphone access');
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        // User didn't speak - optionally restart
        if (autoRestart) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }
      } else {
        setError(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current && autoRestart) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionClass, isSupported, autoRestart]);

  isListeningRef.current = isListening;

  useEffect(() => {
    const current = recognitionRef.current;
    if (!current) return;
    if (isListening) {
      setError(null);
      try {
        current.start();
      } catch (e) {
        setError('Could not start microphone');
        setIsListening(false);
      }
    } else {
      try {
        current.stop();
      } catch {
        // ignore
      }
    }
  }, [isListening]);

  const handleStartStop = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
    }
  };

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const textarea = (e.target as HTMLFormElement).querySelector('textarea');
    const value = textarea?.value?.trim();
    if (value) {
      setTranscript(value);
      setHasFirstNote(true);
      (textarea as HTMLTextAreaElement).value = '';
    }
  };

  const handleTypeFirstIdea = () => {
    setShowTypeInput(true);
  };

  const styles = isDark
    ? {
        bg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#f1f5f9',
        subColor: '#94a3b8',
        cardBg: 'rgba(30, 41, 59, 0.8)',
        border: '#334155',
        inputBg: '#1e293b',
        errorColor: '#f87171',
      }
    : {
        bg: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
        color: '#0f172a',
        subColor: '#475569',
        cardBg: 'rgba(255, 255, 255, 0.9)',
        border: '#cbd5e1',
        inputBg: '#ffffff',
        errorColor: '#dc2626',
      };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        background: styles.bg,
        color: styles.color,
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: 12,
          lineHeight: 1.3,
        }}
      >
        Welcome to Idea Weaver
      </h1>
      <p
        style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
          color: styles.subColor,
          textAlign: 'center',
          marginBottom: 32,
          maxWidth: 560,
        }}
      >
        Capture ideas instantly — speak or type, organize visually. Unlock sync across devices for $1.99 one-time.
      </p>

      {(!isSupported || showTypeInput) ? (
        <div style={{ width: '100%', maxWidth: 400 }}>
          {!isSupported && (
            <p style={{ color: styles.errorColor, marginBottom: 16, textAlign: 'center' }}>
              Voice input not available in this browser. Type instead.
            </p>
          )}
          <form onSubmit={handleTextSubmit}>
            <textarea
              placeholder="Type your idea here..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${styles.border}`,
                background: styles.inputBg,
                color: styles.color,
                fontSize: 16,
                resize: 'vertical',
              }}
            />
            <button
              type="submit"
              style={{
                marginTop: 12,
                width: '100%',
                padding: '14px 28px',
                fontSize: 18,
                fontWeight: 600,
                border: 'none',
                borderRadius: 12,
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Add my first idea
            </button>
          </form>
          {isSupported && showTypeInput && (
            <button
              type="button"
              onClick={() => setShowTypeInput(false)}
              style={{
                marginTop: 12,
                width: '100%',
                padding: 8,
                fontSize: 14,
                border: 'none',
                background: 'transparent',
                color: styles.subColor,
                cursor: 'pointer',
              }}
            >
              ← Back to voice
            </button>
          )}
          <button
            type="button"
            onClick={handleSkip}
            style={{
              marginTop: 24,
              padding: 12,
              fontSize: 14,
              border: 'none',
              background: 'transparent',
            color: styles.subColor,
            cursor: 'pointer',
          }}
        >
          Use without sync – explore the app
        </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <button
              onClick={handleStartStop}
              style={{
                padding: '16px 40px',
                fontSize: 18,
                fontWeight: 600,
                border: 'none',
                borderRadius: 12,
                background: isListening ? '#dc2626' : '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                boxShadow: isListening ? '0 0 20px rgba(220, 38, 38, 0.4)' : '0 4px 14px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              {isListening ? 'Listening...' : 'Start with Voice'}
            </button>
            <button
              type="button"
              onClick={handleTypeFirstIdea}
              style={{
                padding: 8,
                fontSize: 15,
                border: 'none',
                background: 'transparent',
                color: styles.subColor,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Or type your first idea
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            {isListening && (
              <button
                onClick={() => setIsListening(false)}
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  border: '1px solid #64748b',
                  borderRadius: 8,
                background: 'transparent',
                color: styles.subColor,
                cursor: 'pointer',
              }}
            >
              Stop
              </button>
            )}
          </div>

          {isListening && (
            <div
              style={{
                marginTop: 24,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.2)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.6; }
                }
              `}</style>
              <span style={{ color: '#93c5fd' }}>Listening...</span>
            </div>
          )}

          {error && (
            <p style={{ color: styles.errorColor, marginTop: 16, textAlign: 'center' }}>
              {error}
            </p>
          )}

          {(transcript || interimTranscript) && (
            <div
              style={{
                marginTop: 32,
                padding: 24,
                borderRadius: 12,
                background: styles.cardBg,
                border: `1px solid ${styles.border}`,
                width: '100%',
                maxWidth: 480,
              }}
            >
              <p style={{ fontSize: 16, lineHeight: 1.6 }}>
                {transcript}
                {interimTranscript && (
                  <span style={{ color: styles.subColor }}> {interimTranscript}</span>
                )}
              </p>
            </div>
          )}

          {hasFirstNote && !isUnlockLoading && (
            <button
              onClick={handleUnlock}
              style={{
                marginTop: 28,
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 500,
                border: 'none',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#1e293b',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              }}
            >
              Unlock across devices — $1.99 one-time
            </button>
          )}

          {hasFirstNote && isUnlockLoading && (
            <div style={{ marginTop: 28, color: styles.subColor }}>
              Processing…
            </div>
          )}

          <button
            type="button"
            onClick={handleSkip}
            style={{
              marginTop: 32,
              padding: 12,
              fontSize: 14,
              border: 'none',
              background: 'transparent',
              color: styles.subColor,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Use without sync – explore the app
          </button>
        </>
      )}
    </div>
  );
}

export default OnboardingScreen;
export { ONBOARDING_STORAGE_KEY };
