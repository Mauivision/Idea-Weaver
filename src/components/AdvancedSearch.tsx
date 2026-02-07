import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea.tsx';

interface AdvancedSearchProps {
  ideas: Idea[];
  onSearch: (filteredIdeas: Idea[]) => void;
  categories: string[];
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ ideas, onSearch, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasConnections, setHasConnections] = useState<boolean | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    ideas.forEach(idea => {
      idea.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [ideas]);

  // Apply filters
  const filteredIdeas = useMemo(() => {
    let filtered = [...ideas];

    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(term) ||
        (idea.description?.toLowerCase().includes(term) || false) ||
        idea.category.toLowerCase().includes(term) ||
        idea.tags.some(tag => tag.toLowerCase().includes(term)) ||
        idea.notes.some(note => note.content.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(idea => selectedCategories.includes(idea.category));
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(idea =>
        selectedTags.every(tag => idea.tags.includes(tag))
      );
    }

    // Connections filter
    if (hasConnections !== null) {
      filtered = filtered.filter(idea =>
        hasConnections ? idea.connections.length > 0 : idea.connections.length === 0
      );
    }

    // Favorite filter
    if (isFavorite !== null) {
      filtered = filtered.filter(idea => idea.isFavorite === isFavorite);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(idea => idea.createdAt >= dateRange.start!);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(idea => idea.createdAt <= endDate);
    }

    return filtered;
  }, [ideas, searchTerm, selectedCategories, selectedTags, hasConnections, isFavorite, dateRange]);

  // Update parent when filtered results change
  React.useEffect(() => {
    onSearch(filteredIdeas);
  }, [filteredIdeas, onSearch]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setHasConnections(null);
    setIsFavorite(null);
    setDateRange({ start: null, end: null });
  };

  const activeFiltersCount = [
    searchTerm.trim(),
    selectedCategories.length > 0,
    selectedTags.length > 0,
    hasConnections !== null,
    isFavorite !== null,
    dateRange.start !== null,
    dateRange.end !== null
  ].filter(Boolean).length;

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SearchIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Advanced Search</Typography>
        {activeFiltersCount > 0 && (
          <Chip
            label={`${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} active`}
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        )}
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{ ml: 'auto' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Quick Search */}
      <TextField
        fullWidth
        label="Search ideas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by title, description, tags, or notes..."
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
        }}
      />

      {/* Advanced Filters */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography>Advanced Filters</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Categories */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={selectedCategories}
                  onChange={(e) => setSelectedCategories(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      <Checkbox checked={selectedCategories.indexOf(category) > -1} />
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tags */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tags</InputLabel>
                <Select
                  multiple
                  value={selectedTags}
                  onChange={(e) => setSelectedTags(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {allTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      <Checkbox checked={selectedTags.indexOf(tag) > -1} />
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Boolean Filters */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Has Connections</InputLabel>
                <Select
                  value={hasConnections === null ? 'all' : hasConnections ? 'yes' : 'no'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHasConnections(val === 'all' ? null : val === 'yes');
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Favorite</InputLabel>
                <Select
                  value={isFavorite === null ? 'all' : isFavorite ? 'yes' : 'no'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIsFavorite(val === 'all' ? null : val === 'yes');
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block" gutterBottom>
                Created After
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  start: e.target.value ? new Date(e.target.value) : null
                }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block" gutterBottom>
                Created Before
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  end: e.target.value ? new Date(e.target.value) : null
                }))}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Results Count */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredIdeas.length} of {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AdvancedSearch;

