import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea';

interface BulkOperationsProps {
  selectedIdeas: Set<string>;
  ideas: Idea[];
  onUpdate: (ideas: Idea[]) => void;
  onDelete: (ids: string[]) => void;
  categories: string[];
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedIdeas,
  ideas,
  onUpdate,
  onDelete,
  categories
}) => {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const selectedIdeasArray = ideas.filter(idea => selectedIdeas.has(idea.id));

  const handleBulkCategoryChange = () => {
    if (bulkCategory) {
      const updated = ideas.map(idea =>
        selectedIdeas.has(idea.id)
          ? { ...idea, category: bulkCategory, updatedAt: new Date() }
          : idea
      );
      onUpdate(updated);
      setShowBulkEdit(false);
      setBulkCategory('');
    }
  };

  const handleBulkAddTags = () => {
    if (bulkTags.length > 0) {
      const updated = ideas.map(idea => {
        if (selectedIdeas.has(idea.id)) {
          const existingTags = new Set(idea.tags);
          bulkTags.forEach(tag => existingTags.add(tag));
          return {
            ...idea,
            tags: Array.from(existingTags),
            updatedAt: new Date()
          };
        }
        return idea;
      });
      onUpdate(updated);
      setShowBulkEdit(false);
      setBulkTags([]);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIdeas.size} selected idea${selectedIdeas.size !== 1 ? 's' : ''}?`)) {
      onDelete(Array.from(selectedIdeas));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !bulkTags.includes(newTag.trim())) {
      setBulkTags([...bulkTags, newTag.trim()]);
      setNewTag('');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Tooltip title="Bulk Edit">
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setShowBulkEdit(true)}
            disabled={selectedIdeas.size === 0}
          >
            Bulk Edit ({selectedIdeas.size})
          </Button>
        </Tooltip>
        <Tooltip title="Bulk Delete">
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
            disabled={selectedIdeas.size === 0}
          >
            Delete Selected ({selectedIdeas.size})
          </Button>
        </Tooltip>
      </Box>

      <Dialog open={showBulkEdit} onClose={() => setShowBulkEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk Edit {selectedIdeas.size} Idea{selectedIdeas.size !== 1 ? 's' : ''}
          <IconButton
            aria-label="close"
            onClick={() => setShowBulkEdit(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Bulk Category Change */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Change Category</InputLabel>
              <Select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                label="Change Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              fullWidth
              onClick={handleBulkCategoryChange}
              disabled={!bulkCategory}
              sx={{ mb: 3 }}
            >
              Apply Category Change
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Bulk Add Tags */}
            <Typography variant="subtitle2" gutterBottom>
              Add Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Enter tag name"
              />
              <Button variant="outlined" onClick={handleAddTag}>
                Add
              </Button>
            </Box>
            {bulkTags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {bulkTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => setBulkTags(bulkTags.filter(t => t !== tag))}
                  />
                ))}
              </Box>
            )}
            <Button
              variant="contained"
              fullWidth
              onClick={handleBulkAddTags}
              disabled={bulkTags.length === 0}
            >
              Add Tags to Selected
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Selected: {selectedIdeasArray.map(i => i.title).join(', ')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkEdit(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkOperations;

