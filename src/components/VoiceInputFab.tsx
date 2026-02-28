import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';

// SpeechRecognition types (Web Speech API)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
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
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface VoiceInputFabProps {
  onTranscript: (text: string) => void;
  showToast?: (msg: string, severity: 'success' | 'info' | 'warning' | 'error') => void;
}

const SpeechRecognitionClass =
  typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : undefined;

export default function VoiceInputFab({ onTranscript, showToast }: VoiceInputFabProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = !!SpeechRecognitionClass;

  useEffect(() => {
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass() as SpeechRecognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const text = last[0].transcript.trim();
        if (text) {
          onTranscript(text);
          showToast?.('Idea captured!', 'success');
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Microphone access denied');
        showToast?.('Please allow microphone access', 'warning');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [onTranscript, showToast]);

  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      setError(null);
      try {
        rec.start();
      } catch {
        setIsListening(false);
      }
    } else {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, [isListening]);

  const toggle = useCallback(() => {
    if (!isSupported) {
      showToast?.('Voice input not supported in this browser', 'warning');
      return;
    }
    setIsListening((prev) => !prev);
  }, [isSupported, showToast]);

  if (!isSupported) return null;

  return (
    <Tooltip
      title={error || (isListening ? 'Listening… click to stop' : 'Capture idea with voice')}
      placement="left"
    >
      <Fab
        color={isListening ? 'error' : 'secondary'}
        aria-label={isListening ? 'Stop listening' : 'Capture with voice'}
        onClick={toggle}
        sx={{
          position: 'fixed',
          bottom: 80,
          left: 20,
          zIndex: 1000,
          animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.7 },
          },
        }}
      >
        {isListening ? <MicOffIcon /> : <MicIcon />}
      </Fab>
    </Tooltip>
  );
}
