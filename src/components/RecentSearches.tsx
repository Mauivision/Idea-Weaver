import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Divider
} from '@mui/material';
import {
  History as HistoryIcon,
  Clear as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface RecentSearchesProps {
  onSearch: (term: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  maxItems?: number;
}

const RECENT_SEARCHES_KEY = 'ideaWeaver_recentSearches';

const RecentSearches: React.FC<RecentSearchesProps> = ({ onSearch, searchTerm = '', onSearchChange, maxItems = 5 }) => {
  const isControlled = onSearchChange != null;
  const [internalSearch, setInternalSearch] = useState('');
  const searchInput = isControlled ? searchTerm : internalSearch;

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showDropdown, setShowDropdown] = useState(false);

  // Save to localStorage whenever recent searches change
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }, [recentSearches]);

  const addToRecentSearches = useCallback((term: string) => {
    if (!term.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, maxItems);
    });
  }, [maxItems]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      addToRecentSearches(term);
      onSearch(term);
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isControlled && onSearchChange) onSearchChange(value);
    else setInternalSearch(value);
    setShowDropdown(value.trim().length === 0 && recentSearches.length > 0);
  };

  const handleInputFocus = () => {
    if (recentSearches.length > 0 && !searchInput.trim()) {
      setShowDropdown(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchInput.trim()) handleSearch(searchInput);
      setShowDropdown(false);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  const filteredSearches = recentSearches.filter((search) =>
    search.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        placeholder="Search ideas..."
        value={searchInput}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />

      {showDropdown && filteredSearches.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            boxShadow: 4
          }}
        >
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HistoryIcon fontSize="small" />
              Recent Searches
            </Typography>
            {recentSearches.length > 0 && (
              <IconButton size="small" onClick={clearRecentSearches} title="Clear history">
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Divider />
          <List dense>
            {filteredSearches.map((search, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => handleSearch(search)}>
                  <ListItemText
                    primary={search}
                    primaryTypographyProps={{
                      sx: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default RecentSearches;

