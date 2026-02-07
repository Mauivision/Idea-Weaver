import React, { useState, useMemo } from 'react';
import {
  Chip,
  Autocomplete,
  TextField,
  Box,
  Typography,
  Paper
} from '@mui/material';
import { Idea } from '../models/Idea.tsx';

interface TagsAutocompleteProps {
  ideas: Idea[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagsAutocomplete: React.FC<TagsAutocompleteProps> = ({
  ideas,
  selectedTags,
  onChange,
  placeholder = 'Add tags...'
}) => {
  // Get all unique tags from ideas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    ideas.forEach(idea => {
      idea.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [ideas]);

  return (
    <Autocomplete
      multiple
      freeSolo
      options={allTags}
      value={selectedTags}
      onChange={(event, newValue) => {
        onChange(newValue.map(v => typeof v === 'string' ? v : v));
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          size="small"
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option}
            label={option}
            size="small"
            sx={{ mr: 0.5 }}
          />
        ))
      }
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
        },
      }}
    />
  );
};

export default TagsAutocomplete;

