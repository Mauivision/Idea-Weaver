import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  InputAdornment,
  alpha,
  Tooltip,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useIdeasContext } from '../contexts/IdeasContext';

interface HeaderProps {
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showFavoritesOnly: boolean;
  onFavoritesToggle: (value: boolean) => void;
  onNewIdea: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  searchTerm,
  categories,
  selectedCategory,
  onCategoryChange,
  showFavoritesOnly,
  onFavoritesToggle,
  onNewIdea
}) => {
  const { viewMode, toggleViewMode } = useIdeasContext();

  return (
    <AppBar position="static" color="primary" elevation={3}>
      <Toolbar sx={{ flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <LightbulbIcon sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap>
            Idea Weaver
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, flexWrap: 'wrap', my: 1 }}>
          <TextField
            placeholder="Search ideas..."
            size="small"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            sx={{
              backgroundColor: alpha('#fff', 0.15),
              borderRadius: 1,
              '&:hover': {
                backgroundColor: alpha('#fff', 0.25),
              },
              minWidth: 200,
              maxWidth: 300
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'white' }} />
                </InputAdornment>
              ),
              sx: { color: 'white' }
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150, maxWidth: 200 }}>
            <InputLabel id="category-label" sx={{ color: 'white' }}>Category</InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              label="Category"
              sx={{
                backgroundColor: alpha('#fff', 0.15),
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.5),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.8),
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showFavoritesOnly}
                onChange={(e) => onFavoritesToggle(e.target.checked)}
                sx={{
                  '.MuiSwitch-thumb': {
                    color: '#fff',
                  },
                  '.MuiSwitch-track': {
                    backgroundColor: alpha('#fff', 0.5),
                  },
                }}
              />
            }
            label="Favorites Only"
            sx={{ color: 'white' }}
          />

          {/* View toggle buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="List View">
              <IconButton 
                onClick={() => viewMode === 'graph' && toggleViewMode()} 
                sx={{ color: viewMode === 'list' ? 'secondary.main' : 'white' }}
              >
                <ViewListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mind Map View">
              <IconButton 
                onClick={() => viewMode === 'list' && toggleViewMode()} 
                sx={{ color: viewMode === 'graph' ? 'secondary.main' : 'white' }}
              >
                <AccountTreeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onNewIdea}
          sx={{ ml: 1 }}
        >
          New Idea
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 