import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  Box,
  Typography,
  Grow,
} from '@mui/material';
import {
  Close as CloseIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ open, onClose }) => {
  const shortcuts = [
    {
      category: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Focus search' },
        { keys: ['Esc'], description: 'Close dialogs/cancel operations' },
        { keys: ['Ctrl', 'F'], description: 'Center view (graph/mindmap)' },
      ]
    },
    {
      category: 'Ideas',
      shortcuts: [
        { keys: ['N'], description: 'Create new idea' },
        { keys: ['Del'], description: 'Delete selected idea' },
        { keys: ['Ctrl', 'C'], description: 'Connect ideas (graph view)' },
        { keys: ['Ctrl', 'Enter'], description: 'Quick add note' },
      ]
    },
    {
      category: 'Selection',
      shortcuts: [
        { keys: ['Ctrl', 'Click'], description: 'Multi-select ideas' },
        { keys: ['Ctrl', 'A'], description: 'Select all' },
      ]
    },
    {
      category: 'Editing',
      shortcuts: [
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Y'], description: 'Redo' },
        { keys: ['Ctrl', 'S'], description: 'Save (manual)' },
      ]
    },
    {
      category: 'View',
      shortcuts: [
        { keys: ['+'], description: 'Zoom in' },
        { keys: ['-'], description: 'Zoom out' },
        { keys: ['0'], description: 'Notes board (home)' },
        { keys: ['1'], description: 'List view' },
        { keys: ['2'], description: 'Graph view' },
        { keys: ['3'], description: 'Mind map view' },
        { keys: ['4'], description: 'Analytics' },
      ]
    }
  ];

  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span style={{ margin: '0 4px', color: '#999' }}>+</span>}
        <kbd
          style={{
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {key}
        </kbd>
      </React.Fragment>
    ));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Grow}
      TransitionProps={{ timeout: 260 }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <KeyboardIcon sx={{ mr: 1 }} />
            Keyboard Shortcuts
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {shortcuts.map((category, index) => (
          <Box key={category.category} sx={{ mb: index < shortcuts.length - 1 ? 3 : 0 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
              {category.category}
            </Typography>
            <List dense>
              {category.shortcuts.map((shortcut, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemButton>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {formatKeys(shortcut.keys)}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {shortcut.description}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;

