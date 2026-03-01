import React, { useState, useEffect, useCallback } from 'react';
import { 
  CssBaseline, 
  ThemeProvider, 
  Container, 
  Box,
  Typography,
  Paper,
  Alert,
  Snackbar,
  LinearProgress,
  Grow,
  Chip,
} from '@mui/material';
import { useIdeasContext } from './contexts/IdeasContext';
import IdeaList from './components/IdeaList';
import IdeaGraph from './components/IdeaGraph';
import EnhancedHeader from './components/EnhancedHeader';
import ProjectManager from './components/ProjectManager';
import BrainstormSession from './components/BrainstormSession';
import EnhancedMindMap from './components/EnhancedMindMap';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import FlowChart from './components/FlowChart';
import AdvancedSearch from './components/AdvancedSearch';
import BulkOperations from './components/BulkOperations';
import DataExportImport from './components/DataExportImport';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import LoadingSkeleton from './components/LoadingSkeleton';
import DuplicateDetection from './components/DuplicateDetection';
import SmartLinking from './components/SmartLinking';
import IdeaTemplates from './components/IdeaTemplates';
import NoteGridBoard from './components/NoteGridBoard';
import ArchiveDialog from './components/ArchiveDialog';
import IdeaWeave from './components/IdeaWeave';
import { Idea } from './models/Idea';
import AutosaveIndicator from './components/AutosaveIndicator';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import IdeaSprite, { getEncouragement } from './components/IdeaSprite';
import VoiceInputFab from './components/VoiceInputFab';
import { ONBOARDING_FIRST_NOTE_KEY } from './components/OnboardingScreen';
import { createAppTheme } from './theme';
import { exportIdeas } from './lib/exportUtils';
import { getStreak } from './lib/streak';
import { getSoundOn, setSoundOn } from './lib/sound';

function App() {
  const { 
    ideas, 
    allIdeas,
    archivedIdeas,
    loading, 
    error,
    addIdea, 
    updateIdea, 
    duplicateIdea,
    deleteIdea, 
    toggleFavorite,
    setIdeaArchived,
    addNote,
    deleteNote,
    updateNote,
    connectIdeas,
    disconnectIdeas,
    updateIdeaPosition,
    toggleViewMode
  } = useIdeasContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'week' | 'favorites' | 'uncategorized'>('all');
  const [errorOpen, setErrorOpen] = useState(!!error);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [currentViewMode, setCurrentViewMode] = useState<'board' | 'list' | 'graph' | 'projects' | 'brainstorm' | 'mindmap' | 'templates' | 'analytics' | 'flowchart' | 'weave'>('board');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [advancedSearchResults, setAdvancedSearchResults] = useState<Idea[]>([]);
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [showSmartLinking, setShowSmartLinking] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [soundOn, setSoundOnState] = useState(getSoundOn);
  const [spriteMessage, setSpriteMessage] = useState<string | null>(null);

  // Update error state when the error changes
  useEffect(() => {
    setErrorOpen(!!error);
  }, [error]);

  // Handle post-onboarding: create first idea from onboarding, show welcome message
  useEffect(() => {
    const justCompleted = sessionStorage.getItem('onboardingJustCompleted');
    const firstNoteContent = sessionStorage.getItem(ONBOARDING_FIRST_NOTE_KEY);
    sessionStorage.removeItem('onboardingJustCompleted');
    sessionStorage.removeItem(ONBOARDING_FIRST_NOTE_KEY);

    if (firstNoteContent?.trim()) {
      const newIdea = addIdea({
        title: 'First Idea',
        description: '',
        category: 'Uncategorized',
        tags: [],
        isFavorite: false,
        position: { x: Math.random() * 400, y: Math.random() * 300 },
      });
      if (newIdea) {
        addNote(newIdea.id, firstNoteContent.trim());
      }
    }

    if (justCompleted === 'unlocked') {
      setSnackbar({
        open: true,
        message: 'Welcome! Your notes are now ready to sync across devices.',
        severity: 'success',
      });
    } else if (justCompleted === 'skipped') {
      setSnackbar({
        open: true,
        message: 'Welcome! Add ideas with + NEW IDEA or the board — for note takers, writers, and dreamers.',
        severity: 'info',
      });
    }
  }, [addIdea, addNote]);

  // Track last save time
  useEffect(() => {
    if (!loading && ideas.length > 0) {
      setIsSaving(true);
      const saveTimer = setTimeout(() => {
        setLastSaved(new Date());
        setIsSaving(false);
      }, 500);
      return () => clearTimeout(saveTimer);
    }
  }, [ideas, loading]);

  const showToast = useCallback((message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleNewIdeaWithNote = useCallback(() => {
    const newIdea = addIdea({
      title: 'New Note',
      description: '',
      category: 'Uncategorized',
      tags: [],
      isFavorite: false,
      position: { x: Math.random() * 800, y: Math.random() * 600 }
    });
    if (newIdea) {
      addNote(newIdea.id, '');
      setSpriteMessage(getEncouragement());
      showToast('New note block created!', 'success');
    }
  }, [addIdea, addNote, showToast]);

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      const title = text.length > 60 ? `${text.slice(0, 57).trim()}…` : text;
      const newIdea = addIdea({
        title: title || 'Voice note',
        description: '',
        category: 'Uncategorized',
        tags: [],
        isFavorite: false,
        position: { x: Math.random() * 400, y: Math.random() * 300 }
      });
      if (newIdea) {
        addNote(newIdea.id, text);
        setSpriteMessage(getEncouragement());
      }
    },
    [addIdea, addNote]
  );

  // Wrappers that show the idea sprite when capturing from the board
  const addIdeaWithSprite = useCallback(
    (idea: Parameters<typeof addIdea>[0]) => {
      const result = addIdea(idea);
      if (result) setSpriteMessage(getEncouragement());
      return result;
    },
    [addIdea]
  );
  const addNoteWithSprite = useCallback(
    (ideaId: string, content: string, position?: { x: number; y: number }) => {
      addNote(ideaId, content, position);
      setSpriteMessage(getEncouragement());
    },
    [addNote]
  );

  const handleDeleteIdea = (id: string) => {
    const idea = ideas.find(i => i.id === id);
    deleteIdea(id);
    if (idea) {
      showToast(`"${idea.title}" deleted`, 'success');
    }
  };

  const handleDisconnectIdeas = (sourceId: string, targetId: string) => {
    const source = ideas.find(i => i.id === sourceId);
    const target = ideas.find(i => i.id === targetId);
    disconnectIdeas(sourceId, targetId);
    if (source && target) {
      showToast(`Unlinked "${source.title}" ↔ "${target.title}"`, 'info');
    }
  };

  const handleConnectIdeas = useCallback((sourceId: string, targetId: string) => {
    const source = ideas.find(i => i.id === sourceId);
    const target = ideas.find(i => i.id === targetId);
    connectIdeas(sourceId, targetId);
    if (source && target) {
      showToast(`Ideas connected ✨ "${source.title}" ↔ "${target.title}"`, 'success');
    }
  }, [ideas, connectIdeas, showToast]);

  const handleAddNoteToIdea = (ideaId: string, content: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    addNote(ideaId, content);
    if (idea) {
      showToast(`Note added to "${idea.title}"`, 'success');
    }
  };

  const handleDeleteNoteFromIdea = (ideaId: string, noteId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    deleteNote(ideaId, noteId);
    if (idea) {
      showToast(`Note deleted from "${idea.title}"`, 'info');
    }
  };

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    exportIdeas(ideas, format);
  };

  // Handle idea reordering in list view
  const handleReorderIdeas = useCallback((reorderedIdeas: Idea[]) => {
    // Batch update all ideas in the new order
    // This ensures the order is preserved in localStorage
    reorderedIdeas.forEach((idea) => {
      if (idea) {
        updateIdea(idea);
      }
    });
    showToast('Ideas reordered!', 'success');
  }, [updateIdea, showToast]);

  const handleViewModeChange = useCallback((mode: 'board' | 'list' | 'graph' | 'projects' | 'brainstorm' | 'mindmap' | 'templates' | 'analytics' | 'flowchart' | 'weave') => {
    setCurrentViewMode(mode);
    if (mode === 'list' || mode === 'graph') {
      toggleViewMode();
    }
  }, [toggleViewMode]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts during input focus
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + N for new idea
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewIdeaWithNote();
      }
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // ? for keyboard help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }

      // View mode shortcuts: 0 = board (home), 1 = list, 2 = graph, 3 = mindmap, 4 = analytics
      if (e.key === '0' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleViewModeChange('board');
      }
      if (e.key === '1' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleViewModeChange('list');
      }
      if (e.key === '2' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleViewModeChange('graph');
      }
      if (e.key === '3' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleViewModeChange('mindmap');
      }
      if (e.key === '4' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleViewModeChange('analytics');
      }
      if (e.key === '5' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleViewModeChange('weave');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleViewModeChange, handleNewIdeaWithNote]);

  // Filter ideas based on search term, category, favorites, and quick filter (memoized)
  const filteredIdeas = React.useMemo(() => {
    if (useAdvancedSearch) return advancedSearchResults;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    return ideas.filter(idea => {
      const matchesSearch =
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === '' || categoryFilter === 'All' || idea.category === categoryFilter;
      const matchesFavorite = !showFavoritesOnly || idea.isFavorite;
      const matchesQuick =
        quickFilter === 'all' ||
        (quickFilter === 'today' && new Date(idea.updatedAt) >= startOfToday) ||
        (quickFilter === 'week' && new Date(idea.updatedAt) >= startOfWeek) ||
        (quickFilter === 'favorites' && idea.isFavorite) ||
        (quickFilter === 'uncategorized' && (idea.category === 'Uncategorized' || !idea.category));
      return matchesSearch && matchesCategory && matchesFavorite && matchesQuick;
    });
  }, [ideas, searchTerm, categoryFilter, showFavoritesOnly, quickFilter, useAdvancedSearch, advancedSearchResults]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleConnectIdea = (projectId: string, ideaId: string) => {
    // TODO: Implement project-idea connection
    console.log('Connecting idea', ideaId, 'to project', projectId);
  };

  // Wrapper for components expecting Partial<Idea>
  const handleAddIdeaPartial = useCallback((ideaData: Partial<Idea>) => {
    // Convert Partial<Idea> to required fields
    if (!ideaData.title || !ideaData.category) {
      return;
    }
    addIdea({
      title: ideaData.title,
      description: ideaData.description || '',
      category: ideaData.category,
      tags: ideaData.tags || [],
      isFavorite: ideaData.isFavorite || false,
      position: ideaData.position || { x: Math.random() * 800, y: Math.random() * 600 }
    });
  }, [addIdea]);

  const handleApplyTemplate = useCallback((template: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => {
    addIdea(template);
    showToast(`Template "${template.title}" applied`, 'success');
  }, [addIdea, showToast]);

  const handleBulkUpdate = useCallback((updatedIdeas: Idea[]) => {
    updatedIdeas.forEach(idea => updateIdea(idea));
    showToast(`Updated ${updatedIdeas.length} idea${updatedIdeas.length !== 1 ? 's' : ''}`, 'success');
  }, [updateIdea, showToast]);

  const handleBulkDelete = useCallback((ids: string[]) => {
    ids.forEach(id => deleteIdea(id));
    setSelectedIdeas(new Set());
    showToast(`Deleted ${ids.length} idea${ids.length !== 1 ? 's' : ''}`, 'success');
  }, [deleteIdea, showToast, setSelectedIdeas]);

  const handleImport = useCallback((importedIdeas: Idea[]) => {
    importedIdeas.forEach(idea => {
      // Validate and add imported idea
      if (idea.id && idea.title && idea.category) {
        addIdea({
          title: idea.title,
          description: idea.description || '',
          category: idea.category,
          tags: idea.tags || [],
          isFavorite: idea.isFavorite || false,
          position: idea.position || { x: Math.random() * 800, y: Math.random() * 600 }
        });
      }
    });
    showToast(`Imported ${importedIdeas.length} idea${importedIdeas.length !== 1 ? 's' : ''}`, 'success');
  }, [addIdea, showToast]);

  // Compute categories from ideas
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>(['All']);
    ideas.forEach(idea => {
      if (idea.category) {
        uniqueCategories.add(idea.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [ideas]);

  return (
    <ThemeProvider theme={createAppTheme(isDarkMode)}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <EnhancedHeader
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
          categories={categories}
          selectedCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesToggle={setShowFavoritesOnly}
          onNewIdea={handleNewIdeaWithNote}
          onViewModeChange={handleViewModeChange}
          currentViewMode={currentViewMode}
          onThemeToggle={handleThemeToggle}
          isDarkMode={isDarkMode}
          onExport={handleExport}
          soundOn={soundOn}
          onSoundToggle={() => {
            const next = !soundOn;
            setSoundOn(next);
            setSoundOnState(next);
          }}
          onOpenArchive={() => setShowArchiveDialog(true)}
        />
        
        {loading && <LinearProgress color="secondary" />}
        
        <Container maxWidth={currentViewMode === 'list' ? 'lg' : false} disableGutters={currentViewMode === 'board' || currentViewMode === 'graph' || currentViewMode === 'mindmap' || currentViewMode === 'flowchart' || currentViewMode === 'weave'} sx={{ mt: 2, mb: 4, flexGrow: 1 }}>
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={3000} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            TransitionComponent={Grow}
          >
            <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
              {snackbar.message}
            </Alert>
          </Snackbar>
          
          {error && (
            <Snackbar 
              open={errorOpen} 
              autoHideDuration={6000} 
              onClose={() => setErrorOpen(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              TransitionComponent={Grow}
            >
              <Alert severity="error" onClose={() => setErrorOpen(false)}>
                {error}
              </Alert>
            </Snackbar>
          )}
          
          {loading ? (
            <Box sx={{ p: 2 }}>
              <LoadingSkeleton count={5} variant="card" />
            </Box>
          ) : (
            <>
              {currentViewMode === 'board' && (
                <Box sx={{ width: '100%' }}>
                  {/* Streak (gentle nudge) */}
                  {(() => {
                    const streak = getStreak();
                    if (!streak || streak.count < 2) return null;
                    return (
                      <Box sx={{ px: 2, pt: 0.5, pb: 0 }}>
                        <Chip
                          size="small"
                          label={`${streak.count}-day streak`}
                          color="primary"
                          variant="outlined"
                          sx={{ fontStyle: 'italic' }}
                        />
                      </Box>
                    );
                  })()}
                  {/* Daily seed prompt */}
                  <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Instrument Serif", Georgia, serif',
                        fontStyle: 'italic',
                        color: 'text.secondary',
                        opacity: 0.9,
                      }}
                    >
                      {[
                        "What's on your mind today?",
                        "One thing you're curious about.",
                        "A dream you're holding.",
                        "What wants to be written?",
                        "Something you don't want to forget.",
                      ][new Date().getDay() % 5]}
                    </Typography>
                  </Box>
                  {/* Continue where you left off + Surprise me */}
                  {ideas.length > 0 && (
                    <Box sx={{ px: 2, pt: 0.5, pb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Continue where you left off
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        {[...ideas]
                          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                          .slice(0, 5)
                          .map((idea) => (
                            <Chip
                              key={idea.id}
                              label={idea.title}
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setCurrentViewMode('list');
                                setSearchTerm('');
                              }}
                              sx={{ cursor: 'pointer' }}
                            />
                          ))}
                        {/* Surprise me — surface a forgotten idea */}
                        {ideas.length > 3 && (() => {
                          const sevenDaysAgo = new Date();
                          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                          const forgotten = ideas.filter((i) => new Date(i.updatedAt) < sevenDaysAgo);
                          const fromForgotten = forgotten.length > 0;
                          const pool = fromForgotten ? forgotten : ideas;
                          const pick = pool[Math.floor(Math.random() * pool.length)];
                          return (
                            <Chip
                              key="surprise"
                              label="Surprise me"
                              size="small"
                              color="secondary"
                              variant="outlined"
                              onClick={() => {
                                setCurrentViewMode('list');
                                setSearchTerm(pick.title);
                                showToast(
                                  fromForgotten
                                    ? `"${pick.title}" — you haven't looked at this in a while ✨`
                                    : `"${pick.title}"`,
                                  'info'
                                );
                              }}
                              sx={{ cursor: 'pointer' }}
                            />
                          );
                        })()}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ height: ideas.length > 0 ? 'calc(100vh - 220px)' : 'calc(100vh - 140px)', width: '100%' }}>
                  <NoteGridBoard
                    ideas={ideas}
                    addNote={addNoteWithSprite}
                    deleteNote={deleteNote}
                    updateNote={updateNote}
                    addIdea={addIdeaWithSprite}
                  />
                  </Box>
                </Box>
              )}

              {currentViewMode === 'list' && (
                <>
                  {/* Quick filters */}
                  <Box sx={{ px: 2, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(['all', 'today', 'week', 'favorites', 'uncategorized'] as const).map((key) => (
                      <Chip
                        key={key}
                        label={
                          key === 'all' ? 'All' :
                          key === 'today' ? 'Today' :
                          key === 'week' ? 'This Week' :
                          key === 'favorites' ? 'Favorites' : 'Uncategorized'
                        }
                        onClick={() => setQuickFilter(key)}
                        color={quickFilter === key ? 'primary' : 'default'}
                        variant={quickFilter === key ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Box>
                  {/* Advanced Search */}
                  <Box sx={{ px: 2, mb: 2 }}>
                    <AdvancedSearch
                      ideas={ideas}
                      onSearch={(results) => {
                        setAdvancedSearchResults(results);
                        setUseAdvancedSearch(results.length !== ideas.length || results.length > 0);
                      }}
                      categories={categories.filter(cat => cat !== 'All')}
                    />
                  </Box>

                  {/* Smart Linking Suggestions */}
                  {showSmartLinking && filteredIdeas.length > 1 && (
                    <Box sx={{ px: 2, mb: 2 }}>
                      <SmartLinking
                        ideas={filteredIdeas}
                        onConnect={handleConnectIdeas}
                        onDismiss={() => setShowSmartLinking(false)}
                      />
                    </Box>
                  )}

                  {/* Bulk Operations */}
                  {selectedIdeas.size > 0 && (
                    <Box sx={{ px: 2, mb: 2 }}>
                      <BulkOperations
                        selectedIdeas={selectedIdeas}
                        ideas={ideas}
                        onUpdate={handleBulkUpdate}
                        onDelete={handleBulkDelete}
                        categories={categories.filter(cat => cat !== 'All')}
                      />
                    </Box>
                  )}

                  {filteredIdeas.length === 0 ? (
                    <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mx: 2 }}>
                      <Typography variant="h6" color="textSecondary">
                        No ideas found yet. Add a note, a thought, or a dream — then watch them gather here.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box sx={{ px: 2 }}>
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
                        <Typography variant="caption">
                          💡 Drag and drop notes to reorder them • Ctrl+click to select multiple • Click connection chips to unlink • Press ? for keyboard shortcuts
                        </Typography>
                      </Box>
                      <IdeaList
                        ideas={filteredIdeas}
                        onUpdate={updateIdea}
                        onDuplicate={(idea) => {
                          duplicateIdea(idea);
                          showToast(`"${idea.title}" duplicated`, 'success');
                        }}
                        onDelete={handleDeleteIdea}
                        onToggleFavorite={toggleFavorite}
                        onAddNote={handleAddNoteToIdea}
                        onDeleteNote={handleDeleteNoteFromIdea}
                        onRemoveConnection={handleDisconnectIdeas}
                        onReorder={handleReorderIdeas}
                        categories={categories.filter(cat => cat !== 'All')}
                        selectedIdeas={selectedIdeas}
                        onSelectionChange={setSelectedIdeas}
                      />
                    </Box>
                  )}
                </>
              )}

              {currentViewMode === 'graph' && (
                <Box sx={{ height: 'calc(100vh - 140px)', width: '100%' }}>
                  <IdeaGraph
                    ideas={filteredIdeas}
                    onUpdate={updateIdea}
                    onDelete={handleDeleteIdea}
                    onToggleFavorite={toggleFavorite}
                    onAddConnection={handleConnectIdeas}
                    onRemoveConnection={handleDisconnectIdeas}
                    onMoveIdea={updateIdeaPosition}
                    categories={categories.filter(cat => cat !== 'All')}
                    onAddIdea={addIdea}
                  />
                </Box>
              )}

              {currentViewMode === 'projects' && (
                <ProjectManager 
                  ideas={filteredIdeas}
                  onConnectIdea={handleConnectIdea}
                />
              )}

              {currentViewMode === 'brainstorm' && (
                <BrainstormSession 
                  ideas={filteredIdeas}
                  onAddIdea={handleAddIdeaPartial}
                />
              )}

              {currentViewMode === 'mindmap' && (
                <EnhancedMindMap 
                  ideas={filteredIdeas}
                  onUpdateIdea={updateIdea}
                  onAddIdea={addIdea}
                  onOpenGraphView={() => handleViewModeChange('graph')}
                />
              )}

              {currentViewMode === 'templates' && (
                <IdeaTemplates 
                  onApply={handleApplyTemplate}
                  categories={categories.filter(cat => cat !== 'All')}
                />
              )}

              {currentViewMode === 'analytics' && (
                <AnalyticsDashboard ideas={ideas} />
              )}

              {currentViewMode === 'weave' && (
                <IdeaWeave
                  ideas={filteredIdeas}
                  onUpdateIdea={updateIdea}
                  showToast={(msg, severity) => setSnackbar({ open: true, message: msg, severity })}
                />
              )}

              {currentViewMode === 'flowchart' && (
                <Box sx={{ height: 'calc(100vh - 140px)', width: '100%' }}>
                  <FlowChart
                    ideas={filteredIdeas}
                    onUpdate={updateIdea}
                    onDelete={handleDeleteIdea}
                    onToggleFavorite={toggleFavorite}
                    onAddConnection={handleConnectIdeas}
                    onRemoveConnection={handleDisconnectIdeas}
                    onMoveIdea={updateIdeaPosition}
                    categories={categories.filter(cat => cat !== 'All')}
                    onAddIdea={handleAddIdeaPartial}
                  />
                </Box>
              )}
            </>
          )}
        </Container>

        {/* Keyboard Shortcuts Help Dialog */}
        <KeyboardShortcutsHelp
          open={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />

        {/* Duplicate Detection */}
        <DuplicateDetection
          ideas={ideas}
          onMerge={(sourceId, targetId) => {
            // Merge ideas by copying notes and connections from source to target
            const source = ideas.find(i => i.id === sourceId);
            const target = ideas.find(i => i.id === targetId);
            if (source && target) {
              const merged: Idea = {
                ...target,
                notes: [...target.notes, ...source.notes],
                connections: [...new Set([...target.connections, ...source.connections])],
                updatedAt: new Date()
              };
              updateIdea(merged);
              deleteIdea(sourceId);
              showToast('Ideas merged successfully', 'success');
            }
          }}
          onDelete={handleDeleteIdea}
        />

        {/* Idea sprite: brief encouragement when you capture an idea */}
        <IdeaSprite
          message={spriteMessage}
          onDismiss={() => setSpriteMessage(null)}
          duration={4}
          isDark={isDarkMode}
        />

        {/* Voice input FAB */}
        <PwaInstallPrompt />
        <VoiceInputFab onTranscript={handleVoiceTranscript} showToast={showToast} />

        {/* Data Export/Import Button */}
        <Box sx={{ position: 'fixed', bottom: 80, right: 20, zIndex: 1000 }}>
          <DataExportImport
            ideas={ideas}
            onImport={handleImport}
          />
        </Box>

        {/* Autosave Indicator */}
        <AutosaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        
        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Idea Weaver — for note takers, writers, and dreamers. © {new Date().getFullYear()}
          </Typography>
        </Box>

        <ArchiveDialog
          open={showArchiveDialog}
          ideas={allIdeas}
          archivedIdeas={new Set(archivedIdeas.map((i) => i.id))}
          onArchive={(ids) => ids.forEach((id) => setIdeaArchived(id, true))}
          onUnarchive={(ids) => ids.forEach((id) => setIdeaArchived(id, false))}
          onClose={() => setShowArchiveDialog(false)}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App; 