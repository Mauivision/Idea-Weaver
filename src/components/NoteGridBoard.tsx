import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  NoteAdd as NoteAddIcon,
} from '@mui/icons-material';

import { Idea, Note } from '../models/Idea';
import { BounceIn, popIn, pulseGlow } from './Animations';

const GRID_CELL = 40;
const QUICK_NOTES_TITLE = 'Quick notes';
const NOTE_WIDTH = 230;
const NOTE_MIN_HEIGHT = 100;

const PALETTES = [
  { bg: '#FFF9C4', border: '#FFE082', shadow: 'rgba(255,224,130,0.4)' },
  { bg: '#F3E5F5', border: '#CE93D8', shadow: 'rgba(206,147,216,0.3)' },
  { bg: '#E0F7FA', border: '#80DEEA', shadow: 'rgba(128,222,234,0.3)' },
  { bg: '#FBE9E7', border: '#FFAB91', shadow: 'rgba(255,171,145,0.3)' },
  { bg: '#E8F5E9', border: '#A5D6A7', shadow: 'rgba(165,214,167,0.3)' },
  { bg: '#E3F2FD', border: '#90CAF9', shadow: 'rgba(144,202,249,0.3)' },
  { bg: '#FCE4EC', border: '#F48FB1', shadow: 'rgba(244,143,177,0.3)' },
  { bg: '#FFF8E1', border: '#FFD54F', shadow: 'rgba(255,213,79,0.3)' },
];

const PALETTES_DARK = [
  { bg: 'rgba(255,249,196,0.08)', border: 'rgba(255,224,130,0.25)', shadow: 'rgba(255,224,130,0.15)' },
  { bg: 'rgba(243,229,245,0.08)', border: 'rgba(206,147,216,0.25)', shadow: 'rgba(206,147,216,0.15)' },
  { bg: 'rgba(224,247,250,0.08)', border: 'rgba(128,222,234,0.25)', shadow: 'rgba(128,222,234,0.15)' },
  { bg: 'rgba(251,233,231,0.08)', border: 'rgba(255,171,145,0.25)', shadow: 'rgba(255,171,145,0.15)' },
  { bg: 'rgba(232,245,233,0.08)', border: 'rgba(165,214,167,0.25)', shadow: 'rgba(165,214,167,0.15)' },
  { bg: 'rgba(227,242,253,0.08)', border: 'rgba(144,202,249,0.25)', shadow: 'rgba(144,202,249,0.15)' },
  { bg: 'rgba(252,228,236,0.08)', border: 'rgba(244,143,177,0.25)', shadow: 'rgba(244,143,177,0.15)' },
  { bg: 'rgba(255,248,225,0.08)', border: 'rgba(255,213,79,0.25)', shadow: 'rgba(255,213,79,0.15)' },
];

const gentleFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
`;

const threadDash = keyframes`
  to { stroke-dashoffset: -12; }
`;

function snap(pos: { x: number; y: number }) {
  return {
    x: Math.max(0, Math.round(pos.x / GRID_CELL) * GRID_CELL),
    y: Math.max(0, Math.round(pos.y / GRID_CELL) * GRID_CELL),
  };
}

function pickPalette(index: number, dark: boolean) {
  const list = dark ? PALETTES_DARK : PALETTES;
  return list[index % list.length];
}

export interface NoteWithMeta {
  note: Note;
  ideaId: string;
  ideaTitle: string;
  ideaConnections: string[];
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
  const isDark = theme.palette.mode === 'dark';
  const boardRef = useRef<HTMLDivElement>(null);
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [createOpen, setCreateOpen] = useState(false);
  const [createPosition, setCreatePosition] = useState<{ x: number; y: number }>({ x: GRID_CELL, y: GRID_CELL });
  const [newContent, setNewContent] = useState('');
  const [editingNote, setEditingNote] = useState<{ ideaId: string; noteId: string } | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ ideaId: string; noteId: string } | null>(null);
  const [dragging, setDragging] = useState<{ ideaId: string; noteId: string; offsetX: number; offsetY: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const flat = useMemo<NoteWithMeta[]>(
    () =>
      ideas.flatMap((idea) =>
        idea.notes.map((note) => ({
          note,
          ideaId: idea.id,
          ideaTitle: idea.title,
          ideaConnections: idea.connections,
        }))
      ),
    [ideas]
  );

  const usedSlots = useMemo(() => {
    const set = new Set<string>();
    flat.forEach(({ note }) => {
      if (note.position) {
        set.add(`${Math.round(note.position.x / GRID_CELL)},${Math.round(note.position.y / GRID_CELL)}`);
      }
    });
    return set;
  }, [flat]);

  const getBoardCoords = useCallback((e: { clientX: number; clientY: number }) => {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();

    return {
      x: e.clientX - rect.left + el.scrollLeft,
      y: e.clientY - rect.top + el.scrollTop,
    };
  }, []);

  const findOpenSlot = useCallback(() => {
    for (let row = 1; row < 20; row += 1) {
      for (let col = 1; col < 20; col += 1) {
        if (!usedSlots.has(`${col},${row}`)) {
          return { x: col * GRID_CELL, y: row * GRID_CELL };
        }
      }
    }

    return { x: GRID_CELL, y: GRID_CELL };
  }, [usedSlots]);

  const getOrCreateQuickNotesIdea = useCallback((): string => {
    const quick = ideas.find((idea) => idea.title === QUICK_NOTES_TITLE);
    if (quick) return quick.id;

    const newIdea = addIdea({
      title: QUICK_NOTES_TITLE,
      description: '',
      category: 'Board',
      tags: [],
      isFavorite: false,
      position: { x: 0, y: 0 },
    });

    return newIdea.id;
  }, [addIdea, ideas]);

  const openCreateDialog = useCallback(
    (position?: { x: number; y: number }) => {
      setCreatePosition(position ?? findOpenSlot());
      setNewContent('');
      setCreateOpen(true);
    },
    [findOpenSlot]
  );

  const handleCreate = useCallback(() => {
    const content = newContent.trim();
    if (!content) return;

    const ideaId = getOrCreateQuickNotesIdea();
    addNote(ideaId, content, createPosition);
    setNewContent('');
    setCreateOpen(false);
  }, [addNote, createPosition, getOrCreateQuickNotesIdea, newContent]);

  const handleBoardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement) !== boardRef.current || editingNote || dragging) return;

      openCreateDialog(snap(getBoardCoords(e)));
    },
    [dragging, editingNote, getBoardCoords, openCreateDialog]
  );

  const startEditing = useCallback((ideaId: string, noteId: string, currentContent: string) => {
    setEditingNote({ ideaId, noteId });
    setEditContent(currentContent);
  }, []);

  const finishEditing = useCallback(() => {
    if (!editingNote) return;

    updateNote(editingNote.ideaId, editingNote.noteId, { content: editContent });
    setEditingNote(null);
    setEditContent('');
  }, [editContent, editingNote, updateNote]);

  const cancelEditing = useCallback(() => {
    setEditingNote(null);
    setEditContent('');
  }, []);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, ideaId: string, noteId: string, note: Note) => {
      if (editingNote) return;
      if ((e.target as HTMLElement).closest('button, textarea')) return;

      e.preventDefault();
      const pointer = 'touches' in e ? e.touches[0] : e;
      const pos = note.position ?? { x: 0, y: 0 };
      const boardCoords = getBoardCoords({ clientX: pointer.clientX, clientY: pointer.clientY });

      setDragging({ ideaId, noteId, offsetX: boardCoords.x - pos.x, offsetY: boardCoords.y - pos.y });
      setDragPos(pos);
      dragPosRef.current = pos;
    },
    [editingNote, getBoardCoords]
  );

  useEffect(() => {
    if (!dragging) return undefined;

    let rafId = 0;
    const el = boardRef.current;
    const currentDrag = dragging;

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const coords = 'touches' in e ? e.touches[0] : e;
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const next = {
          x: coords.clientX - rect.left + el.scrollLeft - currentDrag.offsetX,
          y: coords.clientY - rect.top + el.scrollTop - currentDrag.offsetY,
        };

        dragPosRef.current = next;
        setDragPos(next);
      });
    };

    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      updateNote(currentDrag.ideaId, currentDrag.noteId, { position: snap(dragPosRef.current) });
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

  const connectionLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
    const seen = new Set<string>();

    const noteCenter = (note: Note) => ({
      x: (note.position?.x ?? 0) + NOTE_WIDTH / 2,
      y: (note.position?.y ?? 0) + NOTE_MIN_HEIGHT / 2,
    });

    ideas.forEach((idea) => {
      idea.connections.forEach((targetId) => {
        const pairKey = [idea.id, targetId].sort().join('-');
        if (seen.has(pairKey)) return;
        seen.add(pairKey);

        const target = ideas.find((candidate) => candidate.id === targetId);
        const srcNote = idea.notes[0];
        const targetNote = target?.notes[0];
        if (!srcNote || !targetNote) return;

        const sourceCenter = noteCenter(srcNote);
        const targetCenter = noteCenter(targetNote);
        lines.push({
          x1: sourceCenter.x,
          y1: sourceCenter.y,
          x2: targetCenter.x,
          y2: targetCenter.y,
          key: pairKey,
        });
      });
    });

    return lines;
  }, [ideas]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    deleteNote(deleteTarget.ideaId, deleteTarget.noteId);
    setDeleteTarget(null);
  }, [deleteNote, deleteTarget]);

  const dotColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const threadColor = isDark ? 'rgba(165,214,167,0.35)' : 'rgba(46,125,50,0.18)';

  return (
    <Box
      ref={boardRef}
      onClick={handleBoardClick}
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 140px)',
        minWidth: 320,
        overflow: 'auto',
        cursor: 'crosshair',
        backgroundImage: `radial-gradient(circle, ${dotColor} 1.2px, transparent 1.2px)`,
        backgroundSize: `${GRID_CELL}px ${GRID_CELL}px`,
        p: 2,
      }}
    >
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      >
        {connectionLines.map(({ x1, y1, x2, y2, key }) => {
          const mx = (x1 + x2) / 2;
          const my = Math.min(y1, y2) - 50;

          return (
            <path
              key={key}
              d={`M ${x1} ${y1} Q ${mx} ${my}, ${x2} ${y2}`}
              fill="none"
              stroke={threadColor}
              strokeWidth={2}
              strokeDasharray="6 6"
              style={{ animation: `${threadDash} 1.5s linear infinite` }}
            />
          );
        })}
      </svg>

      {flat.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'text.secondary',
            maxWidth: 360,
          }}
        >
          <BounceIn duration={0.5}>
            <NoteAddIcon sx={{ fontSize: 56, mb: 2, opacity: 0.35, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              Your board is waiting
            </Typography>
            <Typography variant="body2" sx={{ mb: 2.5, maxWidth: 340, lineHeight: 1.6 }}>
              Drop your first note here — a thought, a line, a dream. Drag it anywhere, then add more.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openCreateDialog()}
              sx={{ borderRadius: 1, px: 3, py: 1.5 }}
            >
              Add your first note
            </Button>
          </BounceIn>
        </Box>
      )}

      {flat.map(({ note, ideaId, ideaTitle, ideaConnections }, index) => {
        const isDraggingThis = dragging?.noteId === note.id && dragging?.ideaId === ideaId;
        const isEditing = editingNote?.noteId === note.id && editingNote?.ideaId === ideaId;
        const pos = isDraggingThis && dragPos ? dragPos : note.position ?? { x: 0, y: 0 };
        const palette = pickPalette(index, isDark);

        return (
          <Box
            key={`${ideaId}-${note.id}`}
            sx={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              zIndex: isDraggingThis ? 1300 : isEditing ? 100 : 1,
              willChange: isDraggingThis ? 'left, top' : 'auto',
              animation: isDraggingThis ? 'none' : `${popIn} 0.35s ease-out both`,
              animationDelay: `${index * 0.04}s`,
            }}
          >
            <Paper
              elevation={isDraggingThis ? 10 : isEditing ? 6 : 1}
              onMouseDown={(e) => handlePointerDown(e, ideaId, note.id, note)}
              onTouchStart={(e) => handlePointerDown(e, ideaId, note.id, note)}
              onDoubleClick={() => {
                if (!isEditing) startEditing(ideaId, note.id, note.content);
              }}
              sx={{
                width: NOTE_WIDTH,
                minHeight: NOTE_MIN_HEIGHT,
                p: 2,
                pt: 1,
                cursor: isEditing ? 'text' : isDraggingThis ? 'grabbing' : 'grab',
                userSelect: isEditing ? 'text' : 'none',
                WebkitUserSelect: isEditing ? 'text' : 'none',
                touchAction: isEditing ? 'auto' : 'none',
                transition: isDraggingThis ? 'none' : 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
                backgroundColor: palette.bg,
                border: '1.5px solid',
                borderColor: isEditing ? palette.border : alpha(palette.border, 0.5),
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
                '&:hover': isDraggingThis
                  ? {}
                  : {
                      boxShadow: `0 6px 20px ${palette.shadow}`,
                      transform: 'translateY(-3px)',
                      borderColor: palette.border,
                      '& .note-actions': { opacity: 1 },
                    },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 16,
                  right: 16,
                  height: '3px',
                  borderRadius: '0 0 4px 4px',
                  backgroundColor: palette.border,
                  opacity: 0.6,
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  color: isDark ? alpha(palette.border, 0.8) : alpha('#000', 0.35),
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  mb: 0.5,
                  mt: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {ideaTitle}
              </Typography>

              {isEditing ? (
                <textarea
                  autoFocus
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onBlur={finishEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEditing();
                    }
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      finishEditing();
                    }
                  }}
                  style={{
                    width: '100%',
                    minHeight: 60,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    resize: 'vertical',
                    fontFamily: '"Georgia", "Palatino", serif',
                    fontSize: '0.92rem',
                    lineHeight: 1.65,
                    color: isDark ? '#e0e0e0' : '#37474f',
                    padding: 0,
                  }}
                  placeholder="What's on your mind?"
                />
              ) : (
                <Typography
                  sx={{
                    fontFamily: '"Georgia", "Palatino", serif',
                    fontSize: '0.92rem',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: isDark ? '#e0e0e0' : '#37474f',
                    minHeight: 40,
                    cursor: 'text',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(ideaId, note.id, note.content);
                  }}
                >
                  {note.content || (
                    <span style={{ opacity: 0.35, fontStyle: 'italic' }}>
                      Click to write...
                    </span>
                  )}
                </Typography>
              )}

              <Box
                className="note-actions"
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: -8,
                  display: 'flex',
                  gap: 0.25,
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  backgroundColor: isDark ? '#333' : '#fff',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  p: 0.25,
                }}
              >
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ ideaId, noteId: note.id });
                    }}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {ideaConnections.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: palette.border,
                    opacity: 0.5,
                    animation: `${gentleFloat} 3s ease-in-out infinite`,
                  }}
                />
              )}
            </Paper>
          </Box>
        );
      })}

      <Tooltip title="Add note">
        <IconButton
          color="primary"
          aria-label="Add note"
          onClick={() => openCreateDialog()}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            width: 56,
            height: 56,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            animation: `${pulseGlow} 2s ease-in-out infinite`,
            transition: 'transform 0.2s, background-color 0.2s',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.08)',
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 220 }}
      >
        <DialogTitle>New note</DialogTitle>
        <DialogContent>
          <textarea
            autoFocus
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="What's on your mind?"
            style={{
              width: '100%',
              minHeight: 120,
              marginTop: 8,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
              borderRadius: 8,
              padding: 12,
              resize: 'vertical',
              font: 'inherit',
              color: 'inherit',
              background: 'transparent',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newContent.trim()}>
            Add note
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} TransitionComponent={Grow} TransitionProps={{ timeout: 220 }}>
        <DialogTitle>Remove this note?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">This note will disappear from your canvas.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Keep it</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
