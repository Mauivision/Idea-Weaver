import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AccountTree as AccountTreeIcon } from '@mui/icons-material';
import { Idea } from '../models/Idea.ts';
import { FadeIn } from './Animations.tsx';

interface EnhancedMindMapProps {
  ideas: Idea[];
  onUpdateIdea: (idea: Idea) => void;
  onAddIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => void;
  onOpenGraphView?: () => void;
}

const EnhancedMindMap: React.FC<EnhancedMindMapProps> = ({
  ideas,
  onUpdateIdea,
  onAddIdea,
  onOpenGraphView,
}) => {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 140px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        borderRadius: 2,
        p: 3,
      }}
    >
      <FadeIn duration={0.5}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <AccountTreeIcon sx={{ fontSize: 72, color: 'primary.main', opacity: 0.6, mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Mind Map
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            A dedicated mind map view is coming soon. Use the Idea Graph to visualize connections,
            drag nodes, and add ideas on the canvas.
          </Typography>
          {onOpenGraphView && (
            <Button
              variant="contained"
              startIcon={<AccountTreeIcon />}
              onClick={onOpenGraphView}
              sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'scale(1.04)', boxShadow: 4 },
              }}
            >
              Open Graph view
            </Button>
          )}
          {ideas.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              {ideas.length} idea{ideas.length !== 1 ? 's' : ''} available
            </Typography>
          )}
        </Box>
      </FadeIn>
    </Box>
  );
};

export default EnhancedMindMap;
