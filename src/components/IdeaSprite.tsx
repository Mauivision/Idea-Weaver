import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const ENCOURAGEMENTS = [
  "Good, you wrote it down.",
  "Saved. It's safe now.",
  "That one's captured.",
  "Another idea in the nest.",
  "Got it.",
  "Safe with us.",
  "Noted.",
  "You're on a roll.",
];

function pickMessage(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

export function getEncouragement(): string {
  return pickMessage();
}

interface IdeaSpriteProps {
  message: string | null;
  onDismiss?: () => void;
  /** Seconds before auto-dismiss. Default 4. */
  duration?: number;
  isDark?: boolean;
}

export default function IdeaSprite({ message, onDismiss, duration = 4, isDark = false }: IdeaSpriteProps) {
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      setDisplayMessage(null);
      return;
    }
    setDisplayMessage(message);
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration * 1000);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!visible || !displayMessage) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        animation: 'spriteIn 0.4s ease-out',
        '@keyframes spriteIn': {
          from: { opacity: 0, transform: 'translateY(8px) scale(0.96)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      }}
    >
      {/* Little sprite: soft blob + lightbulb hint */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(181, 83, 9, 0.12)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(181, 83, 9, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '1.25rem',
            lineHeight: 1,
            opacity: 0.9,
          }}
        >
          ✨
        </Box>
      </Box>
      <Box
        sx={{
          maxWidth: 220,
          py: 1,
          px: 1.5,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.92)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          boxShadow: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontStyle: 'italic',
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {displayMessage}
        </Typography>
      </Box>
    </Box>
  );
}
