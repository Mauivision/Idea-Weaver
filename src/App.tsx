import React, { useState, useEffect, useCallback } from 'react';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Container, 
  Box,
  Typography,
  Paper,
  Alert,
  Snackbar,
  LinearProgress,
  Grow,
} from '@mui/material';
import { useIdeasContext } from './contexts/IdeasContext.tsx';
import IdeaList from './components/IdeaList.tsx';
import IdeaGraph from './components/IdeaGraph.tsx';
import EnhancedHeader from './components/EnhancedHeader.tsx';
import ProjectManager from './components/ProjectManager.tsx';
import BrainstormSession from './components/BrainstormSession.tsx';
import EnhancedMindMap from './components/EnhancedMindMap.tsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.tsx';
import FlowChart from './components/FlowChart.tsx';
import AdvancedSearch from './components/AdvancedSearch.tsx';
import BulkOperations from './components/BulkOperations.tsx';
import DataExportImport from './components/DataExportImport.tsx';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp.tsx';
import LoadingSkeleton from './components/LoadingSkeleton.tsx';
import DuplicateDetection from './components/DuplicateDetection.tsx';
import SmartLinking from './components/SmartLinking.tsx';
import IdeaTemplates from './components/IdeaTemplates.tsx';
import NoteGridBoard from './components/NoteGridBoard.tsx';
import ClusterGrid from './components/ClusterGrid.tsx';
import IdeaFocusWeb from './components/IdeaFocusWeb.tsx';
import { Idea } from './models/Idea.ts';
import AutosaveIndicator from './components/AutosaveIndicator.tsx';
import VoiceInputFab from './components/VoiceInputFab.tsx';
import { ONBOARDING_FIRST_NOTE_KEY } from './components/OnboardingScreen.tsx';

// Create a theme
const createAppTheme = (isDark: boolean) => createTheme({
  palette: {
    mode: isDark ? 'dark' : 'light',
    primary: {
      main: '#2e7d32', // Forest green
    },
    secondary: {
      main: '#f57c00', // Orange
    },
    background: {
      default: isDark ? '#121212' : '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
  },
});

function App() {
  const { 
    ideas, 
    loading, 
    error,
    addIdea, 
    updateIdea, 
    deleteIdea, 
    toggleFavorite,
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
  const [errorOpen, setErrorOpen] = useState(!!error);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [currentViewMode, setCurrentViewMode] = useState<'board' | 'list' | 'graph' | 'projects' | 'brainstorm' | 'mindmap' | 'templates' | 'analytics' | 'flowchart' | 'clusters'>('board');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [advancedSearchResults, setAdvancedSearchResults] = useState<Idea[]>([]);
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [showSmartLinking, setShowSmartLinking] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedIdeaId, setFocusedIdeaId] = useState<string | null>(null);

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
        message: 'Welcome to Idea Weaver! Add ideas with + NEW IDEA or use the board.',
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
      }
    },
    [addIdea, addNote]
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

  // Export functionality
  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `idea-weaver-export-${timestamp}`;

    switch (format) {
      case 'json':
        const jsonData = JSON.stringify(ideas, null, 2);
        const jsonBlob = new Blob([jsonData], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `${filename}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);
        break;

      case 'csv':
        const csvHeaders = 'ID,Title,Description,Category,Tags,Favorite,Created,Updated\n';
        const csvData = ideas.map(idea =>
          `"${idea.id}","${idea.title}","${idea.description || ''}","${idea.category}","${idea.tags.join(';')}","${idea.isFavorite}","${idea.createdAt.toISOString()}","${idea.updatedAt.toISOString()}"`
        ).join('\n');
        const csvContent = csvHeaders + csvData;
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `${filename}.csv`;
        csvLink.click();
        URL.revokeObjectURL(csvUrl);
        break;

      case 'pdf':
        // For PDF export, we'll create a simple text-based PDF-like format
        const pdfContent = `Idea Weaver Export - ${new Date().toLocaleDateString()}\n\n${ideas.map((idea, index) =>
          `${index + 1}. ${idea.title}\n   Category: ${idea.category}\n   Description: ${idea.description || 'No description'}\n   Tags: ${idea.tags.join(', ') || 'None'}\n   Favorite: ${idea.isFavorite ? 'Yes' : 'No'}\n   Created: ${idea.createdAt.toLocaleDateString()}\n\n`
        ).join('')}`;
        const pdfBlob = new Blob([pdfContent], { type: 'text/plain' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const pdfLink = document.createElement('a');
        pdfLink.href = pdfUrl;
        pdfLink.download = `${filename}.txt`;
        pdfLink.click();
        URL.revokeObjectURL(pdfUrl);
        break;
    }
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

  const handleViewModeChange = useCallback((mode: 'board' | 'list' | 'graph' | 'projects' | 'brainstorm' | 'mindmap' | 'templates' | 'analytics' | 'flowchart' | 'clusters') => {
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

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleViewModeChange]);

  // Filter ideas based on search term, category, and favorites
  const filteredIdeas = useAdvancedSearch 
    ? advancedSearchResults 
    : ideas.filter(idea => {
        const matchesSearch = 
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = categoryFilter === '' || categoryFilter === 'All' || idea.category === categoryFilter;
        
        const matchesFavorite = !showFavoritesOnly || idea.isFavorite;
        
        return matchesSearch && matchesCategory && matchesFavorite;
      });

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
        />
        
        {loading && <LinearProgress color="secondary" />}
        
        <Container maxWidth={currentViewMode === 'list' ? 'lg' : false} disableGutters={currentViewMode === 'board' || currentViewMode === 'graph' || currentViewMode === 'mindmap' || currentViewMode === 'flowchart' || currentViewMode === 'clusters'} sx={{ mt: 2, mb: 4, flexGrow: 1 }}>
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
                <Box sx={{ height: 'calc(100vh - 140px)', width: '100%' }}>
                  <NoteGridBoard
                    ideas={ideas}
                    addNote={addNote}
                    deleteNote={deleteNote}
                    updateNote={updateNote}
                    addIdea={addIdea}
                    onAddConnection={connectIdeas}
                    onRemoveConnection={handleDisconnectIdeas}
                  />
                </Box>
              )}

              {currentViewMode === 'clusters' && (
                <Box sx={{ height: 'calc(100vh - 140px)', width: '100%' }}>
                  <ClusterGrid
                    ideas={ideas}
                    onUpdate={updateIdea}
                    onDelete={handleDeleteIdea}
                    onToggleFavorite={toggleFavorite}
                    onAddIdea={addIdea}
                    onAddNote={handleAddNoteToIdea}
                    categories={categories.filter(cat => cat !== 'All')}
                    onFocusIdea={setFocusedIdeaId}
                  />
                </Box>
              )}

              {currentViewMode === 'list' && (
                <>
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
                        onConnect={connectIdeas}
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
                        No ideas found. Create a new idea to get started!
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
                    onAddConnection={connectIdeas}
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

              {currentViewMode === 'flowchart' && (
                <Box sx={{ height: 'calc(100vh - 140px)', width: '100%' }}>
                  <FlowChart
                    ideas={filteredIdeas}
                    onUpdate={updateIdea}
                    onDelete={handleDeleteIdea}
                    onToggleFavorite={toggleFavorite}
                    onAddConnection={connectIdeas}
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
        
        {/* Focus Web overlay */}
        {focusedIdeaId && (() => {
          const focusedIdea = ideas.find(i => i.id === focusedIdeaId);
          if (!focusedIdea) return null;
          return (
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100, bgcolor: 'background.default' }}>
              <IdeaFocusWeb
                idea={focusedIdea}
                allIdeas={ideas}
                onBack={() => setFocusedIdeaId(null)}
                onUpdate={updateIdea}
                onToggleFavorite={toggleFavorite}
                onAddNote={handleAddNoteToIdea}
                onDeleteNote={handleDeleteNoteFromIdea}
                onAddConnection={connectIdeas}
                onRemoveConnection={(s, t) => { disconnectIdeas(s, t); }}
                onFocusIdea={setFocusedIdeaId}
              />
            </Box>
          );
        })()}

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

        {/* Voice input FAB */}
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
        
        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Idea Weaver - Organize your thoughts and inspiration
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 