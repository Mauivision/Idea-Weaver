import React, { useState } from 'react';
import { Box, Fade, CircularProgress, Tooltip } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { popIn } from './Animations.tsx';

interface AutosaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
}

const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ isSaving = false, lastSaved = null }) => {
  const [showTimestamp, setShowTimestamp] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleDateString();
  };

  if (!isSaving && !lastSaved) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 1000,
      }}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      <Fade in>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {isSaving ? (
            <>
              <CircularProgress size={16} />
              <span style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Saving...
              </span>
            </>
          ) : lastSaved ? (
            <Tooltip 
              title={lastSaved.toLocaleString()} 
              placement="right"
              open={showTimestamp}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  animation: `${popIn} 0.35s ease-out both`,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                <span style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  Saved {formatTime(lastSaved)}
                </span>
              </Box>
            </Tooltip>
          ) : null}
        </Box>
      </Fade>
    </Box>
  );
};

export default AutosaveIndicator;

