import React, { useState } from 'react';
import RecentSearches from './RecentSearches';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Badge,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Switch,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Lightbulb as LightbulbIcon,
  Assignment as AssignmentIcon,
  Psychology as PsychologyIcon,
  AccountTree as AccountTreeIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  Code as CodeIcon,
  AutoGraph as AutoGraphIcon,
  GridOn as GridOnIcon,
  Archive as ArchiveIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';

interface EnhancedHeaderProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showFavoritesOnly: boolean;
  onFavoritesToggle: (show: boolean) => void;
  onNewIdea: () => void;
  onViewModeChange: (mode: 'board' | 'list' | 'graph' | 'projects' | 'brainstorm' | 'mindmap' | 'templates' | 'analytics' | 'flowchart' | 'weave') => void;
  currentViewMode: 'board' | 'list' | 'graph' | 'projects' | 'brainstorm' | 'mindmap' | 'templates' | 'analytics' | 'flowchart' | 'weave';
  onThemeToggle: () => void;
  isDarkMode: boolean;
  onExport: (format: 'json' | 'csv' | 'pdf') => void;
  soundOn?: boolean;
  onSoundToggle?: () => void;
  onOpenArchive?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  onSearch,
  searchTerm,
  categories,
  selectedCategory,
  onCategoryChange,
  showFavoritesOnly,
  onFavoritesToggle,
  onNewIdea,
  onViewModeChange,
  currentViewMode,
  onThemeToggle,
  isDarkMode,
  onExport,
  soundOn = true,
  onSoundToggle,
  onOpenArchive,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleExportOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchor(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    onExport(format);
    handleExportClose();
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            onNewIdea();
            break;
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              onRedo?.();
            } else {
              event.preventDefault();
              onUndo?.();
            }
            break;
          case 'y':
            event.preventDefault();
            onRedo?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewIdea, onUndo, onRedo]);

  const viewModes = [
    { id: 'board', label: 'Notes Board', icon: <GridOnIcon />, description: 'Notes on a snap grid (home)' },
    { id: 'clusters', label: 'Clusters', icon: <HomeIcon />, description: 'Ideas grouped into weavy clusters' },
    { id: 'list', label: 'Idea List', icon: <LightbulbIcon />, description: 'Browse ideas in a list format' },
    { id: 'graph', label: 'Idea Graph', icon: <AccountTreeIcon />, description: 'Visualize idea connections' },
    { id: 'flowchart', label: 'Flow Chart', icon: <AutoGraphIcon />, description: 'Create flowcharts from ideas' },
    { id: 'projects', label: 'Projects', icon: <AssignmentIcon />, description: 'Manage your projects' },
    { id: 'brainstorm', label: 'Brainstorm', icon: <PsychologyIcon />, description: 'Creative brainstorming sessions' },
    { id: 'mindmap', label: 'Mind Map', icon: <AccountTreeIcon />, description: 'Interactive mind mapping' },
    { id: 'templates', label: 'Templates', icon: <DescriptionIcon />, description: 'Reusable templates' },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUpIcon />, description: 'View statistics and insights' },
    { id: 'weave', label: 'Weave', icon: <AutoAwesomeIcon />, description: 'Your notes woven together · AI summary' }
  ];

  const navigationItems = [
    { id: 'board', label: 'Home (Notes Board)', icon: <HomeIcon /> },
    { id: 'clusters', label: 'Clusters', icon: <HomeIcon /> },
    { id: 'list', label: 'Ideas', icon: <LightbulbIcon /> },
    { id: 'projects', label: 'Projects', icon: <AssignmentIcon /> },
    { id: 'brainstorm', label: 'Brainstorm', icon: <PsychologyIcon /> },
    { id: 'mindmap', label: 'Mind Map', icon: <AccountTreeIcon /> },
    { id: 'templates', label: 'Templates', icon: <DescriptionIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUpIcon /> },
    { id: 'weave', label: 'Weave', icon: <AutoAwesomeIcon /> }
  ];

  const quickActions = [
    { label: 'New Idea', icon: <LightbulbIcon />, action: onNewIdea },
    { label: 'New Project', icon: <AssignmentIcon />, action: () => onViewModeChange('projects') },
    { label: 'Start Brainstorm', icon: <PsychologyIcon />, action: () => onViewModeChange('brainstorm') },
    { label: 'Create Mind Map', icon: <AccountTreeIcon />, action: () => onViewModeChange('mindmap') }
  ];

  const notifications = [
    { id: '1', title: 'New idea suggestion', message: 'AI suggests connecting your "Mobile App" and "User Experience" ideas', time: '2 hours ago' },
    { id: '2', title: 'Project milestone', message: 'Your "Product Development" project is 75% complete', time: '1 day ago' },
    { id: '3', title: 'Brainstorm reminder', message: 'You have a scheduled brainstorming session tomorrow', time: '2 days ago' }
  ];

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <LightbulbIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Idea Weaver
            </Typography>
          </Box>

          {/* Search Bar */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, maxWidth: 400, mr: 3 }}>
              <RecentSearches
                onSearch={onSearch}
                searchTerm={searchTerm}
                onSearchChange={onSearch}
                maxItems={5}
              />
            </Box>
          )}

          {/* View Mode Selector */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              {viewModes.map((mode) => (
                <Chip
                  key={mode.id}
                  label={mode.label}
                  icon={mode.icon}
                  onClick={() => onViewModeChange(mode.id as any)}
                  color={currentViewMode === mode.id ? 'primary' : 'default'}
                  variant={currentViewMode === mode.id ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          )}

          {/* Quick Actions */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              <IconButton
                color="inherit"
                onClick={onNewIdea}
                title="New Idea (Ctrl+N)"
              >
                <AddIcon />
              </IconButton>

              {/* Undo/Redo */}
              <IconButton
                color="inherit"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <UndoIcon />
              </IconButton>

              <IconButton
                color="inherit"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                <RedoIcon />
              </IconButton>

              {/* Archive */}
              {onOpenArchive && (
                <IconButton
                  color="inherit"
                  onClick={onOpenArchive}
                  title="Archive ideas"
                >
                  <ArchiveIcon />
                </IconButton>
              )}
              {/* Export */}
              <IconButton
                color="inherit"
                onClick={handleExportOpen}
                title="Export Data"
              >
                <DownloadIcon />
              </IconButton>
            </Box>
          )}

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Theme Toggle */}
          <IconButton
            color="inherit"
            onClick={onThemeToggle}
            sx={{ mr: 1 }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Search Bar */}
      {isMobile && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search ideas, projects, or templates..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {/* Mobile View Mode Selector */}
      {isMobile && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {viewModes.map((mode) => (
              <Chip
                key={mode.id}
                label={mode.label}
                icon={mode.icon}
                onClick={() => onViewModeChange(mode.id as any)}
                color={currentViewMode === mode.id ? 'primary' : 'default'}
                variant={currentViewMode === mode.id ? 'filled' : 'outlined'}
                size="small"
                sx={{ flexShrink: 0 }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Navigation
          </Typography>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    onViewModeChange(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Quick Actions
          </Typography>
          <List>
            {quickActions.map((action, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={action.action}>
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText primary={action.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText>Help & Support</ListItemText>
        </MenuItem>
        <Divider />
        {onSoundToggle != null && (
          <MenuItem onClick={(e) => e.stopPropagation()} dense>
            <ListItemIcon />
            <ListItemText primary="Sound on capture" secondary="Soft sound when adding ideas" />
            <Switch size="small" checked={soundOn} onChange={onSoundToggle} />
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <UploadIcon />
          </ListItemIcon>
          <ListItemText>Import Data</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem key={notification.id} onClick={handleNotificationsClose}>
            <ListItemText
              primary={notification.title}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
              }
            />
          </MenuItem>
        ))}
        {notifications.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No notifications" />
          </MenuItem>
        )}
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={handleExportClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleExport('json'); handleExportClose(); }}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText primary="Download backup (JSON)" secondary="One-click export" />
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')}>
          <ListItemIcon>
            <CodeIcon />
          </ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <TableChartIcon />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <PictureAsPdfIcon />
          </ListItemIcon>
          <ListItemText>Export as plain text (.txt)</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default EnhancedHeader;

