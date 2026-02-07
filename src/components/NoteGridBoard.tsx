import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useTheme,
  Grow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Add as AddIcon, Delete as DeleteIcon, NoteAdd as NoteAddIcon } from '@mui/icons-material';
import { Idea, Note } from '../models/Idea.ts';
import { BounceIn, popIn, pulseGlow } from './Animations.tsx';

const GRID_CELL = 40;
const QUICK_NOTES_TITLE = 'Quick notes';

function snap(pos: { x: number; y: number }) {
  const x = Math.round(pos.x / GRID_CELL) * GRID_CELL;
  const y = Math.round(pos.y / GRID_CELL) * GRID_CELL;
  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
  };
}

function findNextGridSlot(used: Set<string>): { x: number; y: number } {
  for (let gy = 0; gy < 50; gy++) {
    for (let gx = 0; gx < 30; gx++) {
      const key = `${gx},${gy}`;
      if (!used.has(key)) return { x: gx * GRID_CELL, y: gy * GRID_CELL };
    }
  }
  return { x: 0, y: 0 };
}

export interface NoteWithMeta {
  note: Note;
  ideaId: string;
  ideaTitle: string;
}

interface NoteGridBoardProps {
  ideas: Idea[];
  addNote: (ideaId: string, content: string, position?: { x: number; y: number }) => void;
  deleteNote: (ideaId: string, noteId: string) => void;
  updateNote: (ideaId: string, noteId: string, updates: { content?: string; position?: { x: number; y: number } }) => void;
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => Idea;
}

export default function NoteGridBoard({
  ideas,
  addNote,
  deleteNote,
  updateNote,
  addIdea,
}: NoteGridBoardProps) {
  const theme = useTheme();
  const [createOpen, setCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ ideaId: string; noteId: string } | null>(null);
  const [dragging, setDragging] = useState<{ ideaId: string; noteId: string; offsetX: number; offsetY: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDark = theme.palette.mode === 'dark';
  const noteCardBg = isDark
    ? alpha(theme.palette.warning.dark, 0.2)
    : alpha(theme.palette.warning.light, 0.5);
  const noteCardBorder = isDark
    ? alpha(theme.palette.warning.main, 0.3)
    : alpha(theme.palette.warning.main, 0.2);

  const getBoardCoords = useCallback((e: { clientX: number; clientY: number }) => {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: e.clientX - r.left + el.scrollLeft,
      y: e.clientY - r.top + el.scrollTop,
    };
  }, []);

  const flat: NoteWithMeta[] = [];
  ideas.forEach((idea) => {
    idea.notes.forEach((note) => {
      flat.push({ note, ideaId: idea.id, ideaTitle: idea.title });
    });
  });

  const usedSlots = useMemo(() => {
    const slotList: string[] = [];
    ideas.forEach((idea) => {
      idea.notes.forEach((note) => {
        if (note.position) {
          const gx = Math.round(note.position.x / GRID_CELL);
          const gy = Math.round(note.position.y / GRID_CELL);
          slotList.push(`${gx},${gy}`);
        }
      });
    });
    return new Set(slotList);
  }, [ideas]);

  const getOrCreateQuickNotesIdea = useCallback((): string => {
    let quick = ideas.find((i) => i.title === QUICK_NOTES_TITLE);
    if (!quick) {
      quick = addIdea({
        title: QUICK_NOTES_TITLE,
        description: '',
        category: 'Board',
        tags: [],
        isFavorite: false,
        position: { x: 0, y: 0 },
      });
    }
    return quick.id;
  }, [ideas, addIdea]);

  const handleCreate = useCallback(() => {
    const content = newContent.trim();
    if (!content) return;
    const ideaId = getOrCreateQuickNotesIdea();
    const pos = findNextGridSlot(usedSlots);
    addNote(ideaId, content, pos);
    setNewContent('');
    setCreateOpen(false);
  }, [newContent, getOrCreateQuickNotesIdea, addNote, usedSlots]);

  const handleDeleteClick = useCallback((ideaId: string, noteId: string) => {
    setDeleteTarget({ ideaId, noteId });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteNote(deleteTarget.ideaId, deleteTarget.noteId);
    setDeleteTarget(null);
  }, [deleteTarget, deleteNote]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const getPointerCoords = useCallback((e: { clientX: number; clientY: number } | Touch) => ({
    clientX: 'clientX' in e ? e.clientX : 0,
    clientY: 'clientY' in e ? e.clientY : 0,
  }), []);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, ideaId: string, noteId: string, note: Note) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      const pointer = 'touches' in e ? e.touches[0] : e;
      const pos = note.position ?? { x: 0, y: 0 };
      const bc = getBoardCoords(getPointerCoords(pointer));
      const offsetX = bc.x - pos.x;
      const offsetY = bc.y - pos.y;
      setDragging({ ideaId, noteId, offsetX, offsetY });
      setDragPos({ x: pos.x, y: pos.y });
      dragPosRef.current = { x: pos.x, y: pos.y };
    },
    [getBoardCoords, getPointerCoords]
  );

  useEffect(() => {
    if (!dragging) return;
    let rafId: number;
    const el = boardRef.current;
    const draggingRef = dragging;

    const applyMove = (clientX: number, clientY: number) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = clientX - r.left + el.scrollLeft - draggingRef.offsetX;
      const y = clientY - r.top + el.scrollTop - draggingRef.offsetY;
      const next = { x, y };
      dragPosRef.current = next;
      setDragPos(next);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const coords = 'touches' in e ? e.touches[0] : e;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => applyMove(coords.clientX, coords.clientY));
    };

    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      const pos = dragPosRef.current;
      const snapped = snap(pos);
      updateNote(draggingRef.ideaId, draggingRef.noteId, { position: snapped });
      setDragging(null);
      setDragPos(null);
    };

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchcancel', onUp);
    };
  }, [dragging, updateNote]);

  const gridLine = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <Box
      ref={boardRef}
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 140px)',
        minWidth: 320,
        overflow: 'auto',
        backgroundImage: `
          linear-gradient(${gridLine} 1px, transparent 1px),
          linear-gradient(90deg, ${gridLine} 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_CELL}px ${GRID_CELL}px`,
        backgroundPosition: '0 0',
        p: 2,
      }}
    >
      {flat.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <BounceIn duration={0.5}>
            <NoteAddIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
            <Typography variant="h6" gutterBottom>
              No notes yet
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, maxWidth: 280 }}>
              Add notes to your board. Drag them around the snap grid and delete anytime.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
            >
              Add your first note
            </Button>
          </BounceIn>
        </Box>
      )}

      {flat.map(({ note, ideaId, ideaTitle }, index) => {
        const isDraggingThis = dragging?.noteId === note.id && dragging?.ideaId === ideaId;
        const pos = isDraggingThis && dragPos ? dragPos : note.position ?? { x: 0, y: 0 };

        return (
          <Box
            key={`${ideaId}-${note.id}`}
            sx={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              willChange: isDraggingThis ? 'left, top' : 'auto',
              animation: isDraggingThis ? 'none' : `${popIn} 0.35s ease-out both`,
              animationDelay: `${index * 0.04}s`,
            }}
          >
            <Paper
              elevation={isDraggingThis ? 8 : 2}
              onMouseDown={(e) => handlePointerDown(e, ideaId, note.id, note)}
              onTouchStart={(e) => handlePointerDown(e, ideaId, note.id, note)}
              sx={{
                width: 220,
                minHeight: 120,
                p: 2,
                cursor: isDraggingThis ? 'grabbing' : 'grab',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'none',
                zIndex: isDraggingThis ? 1300 : 1,
                transition: isDraggingThis ? 'none' : 'box-shadow 0.2s ease',
                backgroundColor: noteCardBg,
                border: '1px solid',
                borderColor: noteCardBorder,
                borderRadius: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, mr: 1 }}>
                {ideaTitle}
              </Typography>
              <IconButton
                size="small"
                aria-label="Delete note"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(ideaId, note.id);
                }}
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              {note.content || 'Empty note'}
            </Typography>
          </Paper>
          </Box>
        );
      })}

      <Fab
        color="primary"
        aria-label="Add note"
        onClick={() => setCreateOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1200,
          animation: `${pulseGlow} 2s ease-in-out infinite`,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.08)',
          },
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 280 }}
      >
        <DialogTitle>Create note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            placeholder="Write your note..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            Ctrl+Enter to add
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newContent.trim()}>
            Add note
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onClose={handleDeleteCancel}
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 220 }}
      >
        <DialogTitle>Delete note?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This note will be removed from the board. This can&apos;t be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
