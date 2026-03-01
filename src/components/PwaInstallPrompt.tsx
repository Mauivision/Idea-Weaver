import React, { useState, useEffect } from 'react';
import { Box, Snackbar, Button, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon, GetApp as GetAppIcon } from '@mui/icons-material';

const DISMISSED_KEY = 'ideaWeaverPwaInstallDismissed';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => Promise<{ outcome: string }> } | null>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt: () => Promise<{ outcome: string }> });
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (deferredPrompt && !dismissed) setOpen(true);
  }, [deferredPrompt, dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setOpen(false);
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setOpen(false);
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'background.paper',
          color: 'text.primary',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 360,
        }}
      >
        <GetAppIcon color="primary" />
        <Typography variant="body2" sx={{ flex: 1 }}>
          Install Idea Weaver for quick access and offline use
        </Typography>
        <Button size="small" variant="contained" onClick={handleInstall}>
          Install
        </Button>
        <IconButton size="small" onClick={handleClose} aria-label="Dismiss">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
