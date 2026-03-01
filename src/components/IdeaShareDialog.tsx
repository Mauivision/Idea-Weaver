import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Alert
} from '@mui/material';
import {
  Share as ShareIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea';

interface IdeaShareDialogProps {
  open: boolean;
  idea: Idea | null;
  onClose: () => void;
}

const IdeaShareDialog: React.FC<IdeaShareDialogProps> = ({ open, idea, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = idea
    ? `${window.location.origin}/idea/${idea.id}`
    : '';

  const notesText = idea?.notes?.length
    ? idea.notes.map((n) => n.content?.trim()).filter(Boolean).join('\n\n')
    : '';
  const shareText = idea
    ? `${idea.title}\n${idea.category ? `Category: ${idea.category}\n` : ''}\n${idea.description || ''}\n\n${notesText ? `Notes:\n${notesText}\n\n` : ''}${idea.tags.length > 0 ? `Tags: ${idea.tags.join(', ')}\n` : ''}— Idea Weaver`
    : '';

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareText]);

  const handleShare = useCallback(async () => {
    if ('share' in navigator && typeof navigator.share === 'function' && idea) {
      try {
        await navigator.share({
          title: idea.title,
          text: idea.description || '',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    }
  }, [idea, shareUrl]);

  if (!idea) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShareIcon />
            <Typography variant="h6">Share Idea</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Idea Title
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {idea.title}
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Share Link
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              value={shareUrl}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
            >
              Copy
            </Button>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Share Text
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={shareText}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {copied && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Copied to clipboard!
            </Alert>
          )}

          {'share' in navigator && typeof navigator.share === 'function' && (
            <Button
              variant="contained"
              fullWidth
              startIcon={<ShareIcon />}
              onClick={handleShare}
            >
              Share via Device
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCopyText} startIcon={<ContentCopyIcon />}>
          Copy Text
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IdeaShareDialog;

