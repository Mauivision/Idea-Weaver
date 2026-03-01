import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea';

interface ArchiveDialogProps {
  open: boolean;
  ideas: Idea[];
  archivedIdeas: Set<string>;
  onArchive: (ids: string[]) => void;
  onUnarchive: (ids: string[]) => void;
  onClose: () => void;
}

const ArchiveDialog: React.FC<ArchiveDialogProps> = ({
  open,
  ideas,
  archivedIdeas,
  onArchive,
  onUnarchive,
  onClose
}) => {
  const [showArchived, setShowArchived] = useState(false);

  const activeIdeas = ideas.filter(idea => !archivedIdeas.has(idea.id));
  const archivedIdeasList = ideas.filter(idea => archivedIdeas.has(idea.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArchiveIcon />
            <Typography variant="h6">Archive Management</Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
            }
            label="Show Archived"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {!showArchived ? (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Active Ideas ({activeIdeas.length})
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
              {activeIdeas.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active ideas
                </Typography>
              ) : (
                activeIdeas.map(idea => (
                  <Box
                    key={idea.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="body1">{idea.title}</Typography>
                    <Button
                      size="small"
                      startIcon={<ArchiveIcon />}
                      onClick={() => onArchive([idea.id])}
                    >
                      Archive
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Archived Ideas ({archivedIdeasList.length})
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
              {archivedIdeasList.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No archived ideas
                </Typography>
              ) : (
                archivedIdeasList.map(idea => (
                  <Box
                    key={idea.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: 0.7
                    }}
                  >
                    <Typography variant="body1">{idea.title}</Typography>
                    <Button
                      size="small"
                      startIcon={<UnarchiveIcon />}
                      onClick={() => onUnarchive([idea.id])}
                    >
                      Unarchive
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArchiveDialog;

