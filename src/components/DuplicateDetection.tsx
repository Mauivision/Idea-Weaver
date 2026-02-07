import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea.tsx';

interface DuplicateDetectionProps {
  ideas: Idea[];
  onMerge?: (sourceId: string, targetId: string) => void;
  onDelete?: (id: string) => void;
}

const DuplicateDetection: React.FC<DuplicateDetectionProps> = ({ ideas, onMerge, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());

  // Calculate similarity between two ideas
  const calculateSimilarity = (idea1: Idea, idea2: Idea): number => {
    let score = 0;

    // Title similarity (exact match = 100, partial = 50)
    const title1Lower = idea1.title.toLowerCase().trim();
    const title2Lower = idea2.title.toLowerCase().trim();
    if (title1Lower === title2Lower) {
      score += 50;
    } else if (title1Lower.includes(title2Lower) || title2Lower.includes(title1Lower)) {
      score += 25;
    }

    // Category match
    if (idea1.category === idea2.category) {
      score += 20;
    }

    // Tag overlap
    const commonTags = idea1.tags.filter(tag => idea2.tags.includes(tag));
    score += commonTags.length * 10;

    // Description similarity (basic)
    if (idea1.description && idea2.description) {
      const desc1Lower = idea1.description.toLowerCase();
      const desc2Lower = idea2.description.toLowerCase();
      if (desc1Lower === desc2Lower) {
        score += 30;
      } else if (desc1Lower.includes(desc2Lower) || desc2Lower.includes(desc1Lower)) {
        score += 15;
      }
    }

    return score;
  };

  // Find duplicates
  const duplicates = useMemo(() => {
    const pairs: Array<{ idea1: Idea; idea2: Idea; score: number }> = [];

    for (let i = 0; i < ideas.length; i++) {
      for (let j = i + 1; j < ideas.length; j++) {
        const idea1 = ideas[i];
        const idea2 = ideas[j];

        const score = calculateSimilarity(idea1, idea2);
        if (score >= 70) { // High similarity threshold
          pairs.push({ idea1, idea2, score });
        }
      }
    }

    return pairs.sort((a, b) => b.score - a.score);
  }, [ideas]);

  const handleMerge = (sourceId: string, targetId: string) => {
    if (onMerge) {
      onMerge(sourceId, targetId);
      setSelectedDuplicates(new Set([...selectedDuplicates, sourceId, targetId]));
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete && window.confirm('Delete this duplicate idea?')) {
      onDelete(id);
      setSelectedDuplicates(new Set([...selectedDuplicates, id]));
    }
  };

  if (duplicates.length === 0) {
    return null;
  }

  return (
    <>
      <Tooltip title="Found duplicate ideas">
        <Button
          variant="outlined"
          color="warning"
          startIcon={<WarningIcon />}
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', bottom: 80, right: 20, zIndex: 1000 }}
        >
          {duplicates.length} Duplicate{duplicates.length !== 1 ? 's' : ''}
        </Button>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6">Duplicate Ideas Detected</Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Found {duplicates.length} potential duplicate{duplicates.length !== 1 ? 's' : ''}. 
            Review and merge or delete as needed.
          </Alert>

          <List>
            {duplicates.map((dup, index) => {
              const isProcessed = selectedDuplicates.has(dup.idea1.id) || selectedDuplicates.has(dup.idea2.id);
              
              return (
                <ListItem
                  key={`${dup.idea1.id}-${dup.idea2.id}`}
                  disablePadding
                  sx={{
                    mb: 2,
                    opacity: isProcessed ? 0.5 : 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1
                  }}
                >
                  <ListItemButton disabled={isProcessed}>
                    <ListItemText
                      primary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              {dup.idea1.title}
                            </Typography>
                            <Chip label={`${Math.round(dup.score)}% match`} size="small" color="warning" />
                            <Typography variant="body2" color="text.secondary">
                              ↔
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {dup.idea2.title}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {dup.idea1.category === dup.idea2.category && (
                              <Chip label={`Category: ${dup.idea1.category}`} size="small" />
                            )}
                            {dup.idea1.tags.filter(t => dup.idea2.tags.includes(t)).length > 0 && (
                              <Chip
                                label={`${dup.idea1.tags.filter(t => dup.idea2.tags.includes(t)).length} common tag(s)`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMerge(dup.idea1.id, dup.idea2.id);
                            }}
                            disabled={isProcessed}
                          >
                            Merge
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(dup.idea1.id);
                            }}
                            disabled={isProcessed}
                          >
                            Delete First
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(dup.idea2.id);
                            }}
                            disabled={isProcessed}
                          >
                            Delete Second
                          </Button>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DuplicateDetection;

