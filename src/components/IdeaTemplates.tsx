import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea.tsx';

interface IdeaTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
}

interface IdeaTemplatesProps {
  onApply: (template: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => void;
  categories: string[];
}

const IdeaTemplates: React.FC<IdeaTemplatesProps> = ({ onApply, categories }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState<IdeaTemplate>({
    id: '',
    name: '',
    category: categories[0] || '',
    description: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  // Default templates
  const defaultTemplates: IdeaTemplate[] = [
    {
      id: 'project',
      name: 'Project Idea',
      category: 'Projects',
      description: 'A new project idea with goals and milestones',
      tags: ['project', 'planning']
    },
    {
      id: 'feature',
      name: 'Feature Request',
      category: 'Features',
      description: 'A feature idea or enhancement request',
      tags: ['feature', 'enhancement']
    },
    {
      id: 'bug',
      name: 'Bug Report',
      category: 'Issues',
      description: 'A bug or issue that needs to be tracked',
      tags: ['bug', 'issue']
    },
    {
      id: 'research',
      name: 'Research Topic',
      category: 'Research',
      description: 'Something to research or investigate further',
      tags: ['research', 'investigation']
    },
    {
      id: 'meeting',
      name: 'Meeting Notes',
      category: 'Meetings',
      description: 'Ideas or action items from a meeting',
      tags: ['meeting', 'action-items']
    }
  ];

  const [customTemplates, setCustomTemplates] = useState<IdeaTemplate[]>(() => {
    const saved = localStorage.getItem('ideaTemplates');
    return saved ? JSON.parse(saved) : [];
  });

  const allTemplates = [...defaultTemplates, ...customTemplates];

  const handleApplyTemplate = (template: IdeaTemplate) => {
    onApply({
      title: template.name,
      category: template.category,
      description: template.description,
      tags: template.tags,
      isFavorite: false,
      position: { x: Math.random() * 800, y: Math.random() * 600 }
    });
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name.trim()) return;

    const template: IdeaTemplate = {
      ...newTemplate,
      id: `custom-${Date.now()}`
    };

    const updated = [...customTemplates, template];
    setCustomTemplates(updated);
    localStorage.setItem('ideaTemplates', JSON.stringify(updated));
    setShowCreateDialog(false);
    setNewTemplate({
      id: '',
      name: '',
      category: categories[0] || '',
      description: '',
      tags: []
    });
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('ideaTemplates', JSON.stringify(updated));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newTemplate.tags.includes(newTag.trim())) {
      setNewTemplate({
        ...newTemplate,
        tags: [...newTemplate.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbIcon />
          Idea Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {allTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">{template.name}</Typography>
                {template.id.startsWith('custom-') && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTemplate(template.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Chip label={template.category} size="small" sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {template.description}
              </Typography>
              {template.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {template.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleApplyTemplate(template)}
              >
                Use Template
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create New Template
          <IconButton
            onClick={() => setShowCreateDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Template Name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag}>Add</Button>
            </Box>
            {newTemplate.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {newTemplate.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => {
                      setNewTemplate({
                        ...newTemplate,
                        tags: newTemplate.tags.filter(t => t !== tag)
                      });
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained" disabled={!newTemplate.name.trim()}>
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IdeaTemplates;

