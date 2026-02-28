import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Grid,
  IconButton,
  Box,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Favorite as FavoriteIcon, 
  FavoriteBorder as FavoriteBorderIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import { Idea } from '../models/Idea.tsx';
import IdeaForm from './IdeaForm.tsx';
import { useDragAndDrop } from '../hooks/useDragAndDrop.ts';
import QuickActionsMenu from './QuickActionsMenu.tsx';
import { FadeIn } from './Animations.tsx';

interface IdeaListProps {
  ideas: Idea[];
  onUpdate: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddNote: (ideaId: string, content: string) => void;
  onDeleteNote: (ideaId: string, noteId: string) => void;
  onRemoveConnection?: (sourceId: string, targetId: string) => void;
  onReorder?: (reorderedIdeas: Idea[]) => void;
  categories: string[];
  selectedIdeas?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
}

// Refactored drag-and-drop in IdeaList with improved visual feedback

const IdeaList: React.FC<IdeaListProps> = React.memo(({
  ideas,
  onUpdate,
  onDelete,
  onToggleFavorite,
  onAddNote,
  onDeleteNote,
  onRemoveConnection,
  onReorder,
  categories,
  selectedIdeas: externalSelectedIdeas,
  onSelectionChange
}) => {
  // Local state for editing, deletion, notes, expansion, and selection
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [connectionsMenuAnchor, setConnectionsMenuAnchor] = useState<{ el: HTMLElement; idea: Idea } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState<{ [key: string]: string }>({});
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(externalSelectedIdeas || new Set());

  // Auto-expand newly created ideas with empty notes
  useEffect(() => {
    const ideaWithEmptyNote = ideas.find(idea => 
      idea.notes.length === 1 && 
      idea.notes[0].content === '' &&
      idea.title === 'New Note'
    );
    
    if (ideaWithEmptyNote && !expandedIdea) {
      setExpandedIdea(ideaWithEmptyNote.id);
      setTimeout(() => {
        const noteInput = document.querySelector(`textarea[placeholder*="Write your note"]`) as HTMLTextAreaElement;
        if (noteInput) {
          noteInput.focus();
        }
      }, 100);
    }
  }, [ideas, expandedIdea]);

  // Drag and drop hook for reordering ideas
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
    isDragged,
    isDragOver,
    getInsertPosition
  } = useDragAndDrop({
    items: ideas,
    getId: (idea) => idea.id,
    onReorder: onReorder || (() => {}),
    enableInsertion: true
  });

  // Sync selected ideas with external state
  useEffect(() => {
    if (externalSelectedIdeas) {
      setSelectedIdeas(externalSelectedIdeas);
    }
  }, [externalSelectedIdeas]);

  // Update selection and notify parent
  const updateSelection = useCallback((newSelection: Set<string>) => {
    setSelectedIdeas(newSelection);
    onSelectionChange?.(newSelection);
  }, [onSelectionChange]);

  const handleEditClick = useCallback((idea: Idea) => {
    setEditingIdea(idea);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setIdeaToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (ideaToDelete) {
      onDelete(ideaToDelete);
      setDeleteDialogOpen(false);
      setIdeaToDelete(null);
    }
  }, [ideaToDelete, onDelete]);

  const handleAddNote = useCallback((ideaId: string) => {
    const content = newNoteContent[ideaId]?.trim();
    if (content) {
      onAddNote(ideaId, content);
      setNewNoteContent(prev => ({
        ...prev,
        [ideaId]: ''
      }));
    }
  }, [newNoteContent, onAddNote]);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return (
    <>
      {/* Selection indicator */}
      {selectedIdeas.size > 0 && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            {selectedIdeas.size} note{selectedIdeas.size > 1 ? 's' : ''} selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => updateSelection(new Set())}
              sx={{ color: 'inherit', borderColor: 'inherit' }}
            >
              Clear
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                selectedIdeas.forEach(id => onDelete(id));
                updateSelection(new Set());
              }}
              sx={{ bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' } }}
            >
              Delete Selected
            </Button>
          </Box>
        </Box>
      )}

      <Grid container spacing={3}>
        {ideas.map((idea, index) => {
          const dragged = isDragged(idea.id);
          const dragOver = isDragOver(idea.id);
          const insertPosition = getInsertPosition(idea.id);
          
          return (
            <FadeIn key={idea.id} delay={index * 50}>
              <Grid item xs={12} md={6}>
                {/* Insertion indicator */}
                {dragOver && insertPosition === 'before' && (
                  <Box
                    sx={{
                      height: '4px',
                      bgcolor: 'primary.main',
                      borderRadius: '2px',
                      mb: 1,
                      mx: 2,
                      boxShadow: '0 2px 8px rgba(46, 125, 50, 0.4)',
                      animation: 'pulse 1s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.6 },
                        '50%': { opacity: 1 }
                      }
                    }}
                  />
                )}
                
                <Card
                  elevation={selectedIdeas.has(idea.id) ? 8 : dragOver ? 8 : dragged ? 4 : 2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: dragged ? 'grabbing' : 'grab',
                    opacity: dragged ? 0.5 : 1,
                    transform: selectedIdeas.has(idea.id)
                      ? 'scale(1.02) translateY(-2px) translateZ(0)'
                      : dragOver
                        ? insertPosition === 'after' 
                          ? 'scale(1.02) translateY(2px) translateZ(0)'
                          : 'scale(1.02) translateY(-2px) translateZ(0)'
                        : 'scale(1) translateZ(0)',
                    transition: dragged ? 'none' : 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: dragged ? 'transform, opacity' : 'auto',
                    backfaceVisibility: 'hidden',
                    WebkitTransform: 'translateZ(0)', // Safari hack
                    border: selectedIdeas.has(idea.id)
                      ? '2px solid #9c27b0'
                      : dragOver
                        ? '2px solid #4caf50'
                        : 'none',
                    backgroundColor: selectedIdeas.has(idea.id)
                      ? 'rgba(156, 39, 176, 0.1)'
                      : dragOver
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'inherit',
                    boxShadow: selectedIdeas.has(idea.id)
                      ? '0 8px 25px rgba(156, 39, 176, 0.3)'
                      : dragOver
                        ? '0 8px 25px rgba(76, 175, 80, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: dragged ? 'none' : 'scale(1.01) translateY(-1px) translateZ(0)',
                      boxShadow: dragged ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.15)',
                      transition: dragged ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                  }}
                  draggable={true}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    handleDragStart(e, idea.id);
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation();
                    handleDragEnd();
                  }}
                  onDragOver={(e) => {
                    e.stopPropagation();
                    handleDragOver(e, idea.id);
                  }}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e, idea.id);
                  }}
                  onClick={(e) => {
                    // Don't trigger click if we just finished dragging
                    if (isDragging) {
                      e.stopPropagation();
                      return;
                    }
                    e.stopPropagation();
                    // Handle multi-selection with Ctrl+click
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      setSelectedIdeas(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(idea.id)) {
                          newSet.delete(idea.id);
                        } else {
                          newSet.add(idea.id);
                        }
                        updateSelection(newSet);
                        return newSet;
                      });
                    } else {
                      // Single selection - clear multi-selection
                      const newSet = new Set([idea.id]);
                      updateSelection(newSet);
                      setSelectedIdeas(newSet);
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h2">
                        {idea.title}
                      </Typography>
                      <IconButton 
                        onClick={() => onToggleFavorite(idea.id)} 
                        color={idea.isFavorite ? 'secondary' : 'default'}
                        size="small"
                      >
                        {idea.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Box>
                    <Chip 
                      label={idea.category} 
                      size="small"
                      color="primary"
                      variant="outlined" 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created: {formatDate(idea.createdAt)}
                      {idea.updatedAt > idea.createdAt && 
                        ` • Updated: ${formatDate(idea.updatedAt)}`}
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                      {idea.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {idea.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <Accordion 
                    expanded={expandedIdea === idea.id}
                    onChange={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                    elevation={0}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2">
                        {idea.notes.length > 0 
                          ? `Notes (${idea.notes.length})` 
                          : 'Add notes'}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {idea.notes.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          {idea.notes.map((note, index) => (
                            <Paper 
                              key={note.id} 
                              elevation={2}
                              sx={{ 
                                p: 2, 
                                mb: 1.5, 
                                position: 'relative',
                                backgroundColor: '#fffacd', // Sticky note yellow
                                background: `linear-gradient(135deg, 
                                  ${['#fffacd', '#ffebcd', '#ffe4e1', '#e6e6fa', '#f0ffff'][index % 5]} 0%, 
                                  ${['#fff8dc', '#ffe4b5', '#ffdab9', '#ddd6fe', '#e0f7fa'][index % 5]} 100%)`,
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                transform: `rotate(${(index % 3 - 1) * 1.5}deg)`,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '2px 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
                                '&:hover': {
                                  transform: `rotate(${(index % 3 - 1) * 1.5}deg) translateY(-2px) scale(1.02)`,
                                  boxShadow: '4px 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
                                  zIndex: 10
                                }
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  pr: 4, 
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  fontFamily: '"Comic Sans MS", "Marker Felt", cursive',
                                  fontSize: '0.95rem',
                                  lineHeight: 1.6,
                                  color: '#333'
                                }}
                              >
                                {note.content}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                display="block" 
                                sx={{ 
                                  mt: 1.5,
                                  fontSize: '0.75rem',
                                  opacity: 0.7
                                }}
                              >
                                {formatDate(note.createdAt)}
                              </Typography>
                              <IconButton
                                onClick={() => onDeleteNote(idea.id, note.id)}
                                size="small"
                                sx={{ 
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  color: 'rgba(0,0,0,0.5)',
                                  '&:hover': { color: 'error.main' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Paper>
                          ))}
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          label="Add a note"
                          size="small"
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Write your note here..."
                          value={newNoteContent[idea.id] || ''}
                          onChange={(e) => setNewNoteContent({ 
                            ...newNoteContent, 
                            [idea.id]: e.target.value
                          })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handleAddNote(idea.id);
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                              }
                            }
                          }}
                        />
                        <Button 
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddNote(idea.id)}
                          disabled={!newNoteContent[idea.id]?.trim()}
                          sx={{ 
                            mt: 0.5,
                            minWidth: '100px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            },
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Add
                        </Button>
                      </Box>
                      {idea.notes.length === 0 && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1, 
                            display: 'block',
                            fontStyle: 'italic'
                          }}
                        >
                          💡 Tip: Press Ctrl+Enter to quickly add a note
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {idea.connections.length > 0 && (
                        <>
                          <Chip
                            label={`${idea.connections.length} connection${idea.connections.length !== 1 ? 's' : ''} (click to unlink)`}
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onRemoveConnection) {
                                setConnectionsMenuAnchor({ el: e.currentTarget, idea });
                              }
                            }}
                            sx={{
                              cursor: onRemoveConnection ? 'pointer' : 'default',
                              '&:hover': onRemoveConnection ? { bgcolor: 'action.hover' } : {},
                            }}
                          />
                          {connectionsMenuAnchor?.idea.id === idea.id && (
                            <Menu
                              anchorEl={connectionsMenuAnchor.el}
                              open={!!connectionsMenuAnchor}
                              onClose={() => setConnectionsMenuAnchor(null)}
                              onClick={(e) => e.stopPropagation()}
                              anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                              transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                            >
                              {idea.connections.map((targetId) => {
                                const target = ideas.find((i) => i.id === targetId);
                                return (
                                  <MenuItem
                                    key={targetId}
                                    onClick={() => {
                                      if (target && onRemoveConnection) {
                                        onRemoveConnection(idea.id, targetId);
                                        setConnectionsMenuAnchor(null);
                                      }
                                    }}
                                  >
                                    <ListItemIcon>
                                      <LinkOffIcon fontSize="small" color="action" />
                                    </ListItemIcon>
                                    <ListItemText primary={`Unlink from "${target?.title ?? 'Unknown'}"`} />
                                  </MenuItem>
                                );
                              })}
                            </Menu>
                          )}
                        </>
                      )}
                    </Box>
                    <QuickActionsMenu
                      idea={idea}
                      onEdit={handleEditClick}
                      onDelete={(id) => {
                        setIdeaToDelete(id);
                        setDeleteDialogOpen(true);
                      }}
                      onToggleFavorite={onToggleFavorite}
                      onDuplicate={(idea) => {
                        const duplicated: Idea = {
                          ...idea,
                          id: `${idea.id}-copy-${Date.now()}`,
                          title: `${idea.title} (Copy)`,
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        onUpdate(duplicated);
                      }}
                    />
                  </CardActions>
                </Card>
                
                {/* Insertion indicator after */}
                {dragOver && insertPosition === 'after' && (
                  <Box
                    sx={{
                      height: '4px',
                      bgcolor: 'primary.main',
                      borderRadius: '2px',
                      mt: 1,
                      mx: 2,
                      boxShadow: '0 2px 8px rgba(46, 125, 50, 0.4)',
                      animation: 'pulse 1s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.6 },
                        '50%': { opacity: 1 }
                      }
                    }}
                  />
                )}
              </Grid>
            </FadeIn>
          );
        })}
      </Grid>
      
      {/* Edit Dialog */}
      {editingIdea && (
        <Dialog 
          open={!!editingIdea} 
          onClose={() => setEditingIdea(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogContent>
            <IdeaForm
              idea={editingIdea}
              onSubmit={(ideaData) => {
                onUpdate({
                  ...editingIdea,
                  ...ideaData,
                });
                setEditingIdea(null);
              }}
              onCancel={() => setEditingIdea(null)}
              categories={categories}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Idea</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this idea? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

// Export the component
export default IdeaList; 