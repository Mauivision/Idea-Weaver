import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Link as LinkIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea.tsx';

interface SmartLinkingProps {
  ideas: Idea[];
  onConnect: (sourceId: string, targetId: string) => void;
  onDismiss?: () => void;
}

const SmartLinking: React.FC<SmartLinkingProps> = ({ ideas, onConnect, onDismiss }) => {
  // Calculate similarity score between two ideas
  const calculateSimilarity = (idea1: Idea, idea2: Idea): number => {
    let score = 0;

    // Title similarity (simple word matching)
    const title1Words = idea1.title.toLowerCase().split(/\s+/);
    const title2Words = idea2.title.toLowerCase().split(/\s+/);
    const commonTitleWords = title1Words.filter(word => title2Words.includes(word));
    score += (commonTitleWords.length / Math.max(title1Words.length, title2Words.length)) * 40;

    // Category match
    if (idea1.category === idea2.category) {
      score += 20;
    }

    // Tag overlap
    const commonTags = idea1.tags.filter(tag => idea2.tags.includes(tag));
    if (commonTags.length > 0) {
      score += commonTags.length * 10;
    }

    // Description similarity (basic keyword matching)
    if (idea1.description && idea2.description) {
      const desc1Words = idea1.description.toLowerCase().split(/\s+/);
      const desc2Words = idea2.description.toLowerCase().split(/\s+/);
      const commonDescWords = desc1Words.filter(word => 
        word.length > 3 && desc2Words.includes(word)
      );
      score += (commonDescWords.length / Math.max(desc1Words.length, desc2Words.length)) * 30;
    }

    // Already connected - reduce score
    if (idea1.connections.includes(idea2.id) || idea2.connections.includes(idea1.id)) {
      score = 0;
    }

    return score;
  };

  // Find similar ideas
  const suggestions = useMemo(() => {
    const pairs: Array<{ idea1: Idea; idea2: Idea; score: number }> = [];

    for (let i = 0; i < ideas.length; i++) {
      for (let j = i + 1; j < ideas.length; j++) {
        const idea1 = ideas[i];
        const idea2 = ideas[j];

        // Skip if already connected
        if (idea1.connections.includes(idea2.id) || idea2.connections.includes(idea1.id)) {
          continue;
        }

        const score = calculateSimilarity(idea1, idea2);
        if (score > 30) { // Threshold for suggestions
          pairs.push({ idea1, idea2, score });
        }
      }
    }

    return pairs
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 suggestions
  }, [ideas]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon color="primary" />
          Smart Linking Suggestions
        </Typography>
        {onDismiss && (
          <IconButton size="small" onClick={onDismiss}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        These ideas might be related based on their content similarity
      </Typography>

      <List dense>
        {suggestions.map((suggestion, index) => (
          <React.Fragment key={`${suggestion.idea1.id}-${suggestion.idea2.id}`}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onConnect(suggestion.idea1.id, suggestion.idea2.id)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {suggestion.idea1.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ↔
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {suggestion.idea2.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${Math.round(suggestion.score)}% match`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {suggestion.idea1.category === suggestion.idea2.category && (
                        <Chip label={`Same category: ${suggestion.idea1.category}`} size="small" />
                      )}
                      {suggestion.idea1.tags.filter(t => suggestion.idea2.tags.includes(t)).length > 0 && (
                        <Chip
                          label={`${suggestion.idea1.tags.filter(t => suggestion.idea2.tags.includes(t)).length} common tag(s)`}
                          size="small"
                        />
                      )}
                    </Box>
                  }
                />
                <Tooltip title="Connect these ideas">
                  <Button size="small" variant="outlined" startIcon={<LinkIcon />}>
                    Connect
                  </Button>
                </Tooltip>
              </ListItemButton>
            </ListItem>
            {index < suggestions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default SmartLinking;

