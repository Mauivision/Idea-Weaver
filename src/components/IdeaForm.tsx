import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormHelperText,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { AddCircle as AddCircleIcon, Help as HelpIcon } from '@mui/icons-material';
import TagsAutocomplete from './TagsAutocomplete';
import { Idea, FEELING_OPTIONS } from '../models/Idea';

// Maximum characters for title and description
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_TAG_LENGTH = 25;

interface IdeaFormProps {
  idea?: Partial<Idea>;
  onSubmit: (ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes'>) => void;
  onCancel: () => void;
  categories: string[];
  /** When provided, tags use TagsAutocomplete with suggestions from these ideas */
  ideas?: Idea[];
}

const IdeaForm: React.FC<IdeaFormProps> = ({
  idea = {},
  onSubmit,
  onCancel,
  categories,
  ideas: ideasForTags,
}) => {
  const [title, setTitle] = useState(idea.title || '');
  const [description, setDescription] = useState(idea.description || '');
  const [category, setCategory] = useState(idea.category || 'Uncategorized');
  const [feeling, setFeeling] = useState<string>(idea.feeling || '');
  const [tags, setTags] = useState<string[]>(idea.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  
  // Form validation states
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    tag: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Validate title whenever it changes
  useEffect(() => {
    if (formSubmitted) {
      validateTitle(title);
    }
  }, [title, formSubmitted]);

  // Validates the title field
  const validateTitle = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, title: 'Title is required' }));
      return false;
    } else if (value.length > MAX_TITLE_LENGTH) {
      setErrors(prev => ({ ...prev, title: `Title must be ${MAX_TITLE_LENGTH} characters or less` }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, title: '' }));
      return true;
    }
  };

  // Validates the current tag
  const validateTag = (value: string): boolean => {
    if (tags.includes(value.trim())) {
      setErrors(prev => ({ ...prev, tag: 'Tag already exists' }));
      return false;
    } else if (value.length > MAX_TAG_LENGTH) {
      setErrors(prev => ({ ...prev, tag: `Tag must be ${MAX_TAG_LENGTH} characters or less` }));
      return false; 
    } else {
      setErrors(prev => ({ ...prev, tag: '' }));
      return true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validate all fields
    const isTitleValid = validateTitle(title);
    
    if (isTitleValid) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        feeling: feeling || undefined,
        tags,
        isFavorite: idea.isFavorite || false,
        connections: idea.connections || [],
      });
    }
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (!trimmedTag) return;
    
    if (validateTag(trimmedTag) && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);
    
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      setErrors(prev => ({ ...prev, description: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less` }));
    } else {
      setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentTag(value);
    if (formSubmitted || value.trim()) {
      validateTag(value);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        {idea.id ? 'Edit Idea' : 'Create New Idea'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            error={!!errors.title}
            helperText={errors.title || `${title.length}/${MAX_TITLE_LENGTH}`}
            inputProps={{ maxLength: MAX_TITLE_LENGTH + 10 }} // Allow a bit over to show error
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={handleDescriptionChange}
            error={!!errors.description}
            helperText={errors.description || `${description.length}/${MAX_DESCRIPTION_LENGTH}`}
            inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH + 100 }} // Allow a bit over to show error
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!categoryError}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCategoryError('');
              }}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
              {!categories.includes('Uncategorized') && (
                <MenuItem value="Uncategorized">Uncategorized</MenuItem>
              )}
            </Select>
            {categoryError && <FormHelperText>{categoryError}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="medium">
            <InputLabel id="feeling-label">Feeling (optional)</InputLabel>
            <Select
              labelId="feeling-label"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              label="Feeling (optional)"
            >
              <MenuItem value="">None</MenuItem>
              {FEELING_OPTIONS.map((f) => (
                <MenuItem key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          {ideasForTags != null ? (
            <TagsAutocomplete
              ideas={ideasForTags}
              selectedTags={tags}
              onChange={setTags}
              placeholder="Add tags..."
            />
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TextField
                  label="Add Tags"
                  value={currentTag}
                  onChange={handleTagChange}
                  onKeyDown={handleKeyDown}
                  error={!!errors.tag}
                  helperText={errors.tag || "Press Enter to add a tag"}
                  sx={{ flexGrow: 1 }}
                  inputProps={{ maxLength: MAX_TAG_LENGTH + 5 }}
                />
                <Tooltip title="Add tag">
                  <IconButton 
                    color="primary"
                    onClick={handleAddTag} 
                    disabled={!currentTag.trim() || !!errors.tag}
                    sx={{ mt: 1 }}
                  >
                    <AddCircleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Tags help categorize and find your ideas">
                  <IconButton sx={{ mt: 1 }}>
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </>
          )}
        </Grid>
        
        <Grid item xs={12}>
          {formSubmitted && errors.title && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fix the errors before submitting.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={onCancel} variant="outlined">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={formSubmitted && !!errors.title}
            >
              {idea.id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default IdeaForm; 