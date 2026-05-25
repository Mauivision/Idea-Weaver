import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  NoteAdd as NoteAddIcon,
} from '@mui/icons-material';
import {
  alpha,
  keyframes,
} from '@mui/material/styles';
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

const threadDash = keyframes`
  to { stroke-dashoffset: -12; }
`;

interface NoteWithMeta {
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

function snap(pos: { x: number; y: number }) {
  return {
    x: Math.max(0, Math.round(pos.x / GRID_CELL) * GRID_CELL),
    y: Math.max(0, Math.round(pos.y / GRID_CELL) * GRID_CELL),
  };
}

function pickPalette(index: number, isDark: boolean) {
  const list = isDark ? PALETTES_DARK : PALETTES;
  return list[index % list.length];
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

  const [editingNote, setEditingNote] = useState<{ ideaId: string; noteId: string } | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ ideaId: string; noteId: string } | null>(null);
  const [dragging, setDragging] = useState<{ ideaId: string; noteId: string; offsetX: number; offsetY: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const flat = useMemo(
    () =>
      ideas.flatMap((idea) =>
        idea.notes.map((note) => ({
          note,
          ideaId: idea.id,
          ideaTitle: idea.title,
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

  const getBoardCoords = useCallback((event: { clientX: number; clientY: number }) => {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };

    const rect = el.getBoundingClientRect();
    return {
      x: event.clientX - rect.left + el.scrollLeft,
      y: event.clientY - rect.top + el.scrollTop,
    };
  }, []);

  const getOrCreateQuickNotesIdea = useCallback((): string => {
    const existing = ideas.find((idea) => idea.title === QUICK_NOTES_TITLE);
    if (existing) return existing.id;

    return addIdea({
      title: QUICK_NOTES_TITLE,
      description: '',
      category: 'Board',
      tags: [],
      isFavorite: false,
      position: { x: 0, y: 0 },
      isArchived: false,
    }).id;
  }, [addIdea, ideas]);

  const findOpenPosition = useCallback(
    (preferred: { x: number; y: number }) => {
      let position = snap(preferred);
      let step = 0;

      while (usedSlots.has(`${Math.round(position.x / GRID_CELL)},${Math.round(position.y / GRID_CELL)}`)) {
        step += 1;
        position = {
          x: snap(preferred).x + (step % 4) * GRID_CELL,
          y: snap(preferred).y + Math.floor(step / 4) * GRID_CELL,
        };
      }

      return position;
    },
    [usedSlots]
  );

  const createNoteAt = useCallback(
    (position: { x: number; y: number }) => {
      const ideaId = getOrCreateQuickNotesIdea();
      addNote(ideaId, '', findOpenPosition(position));
    },
    [addNote, findOpenPosition, getOrCreateQuickNotesIdea]
  );

  const handleBoardClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target !== boardRef.current || editingNote) return;
      createNoteAt(getBoardCoords(event));
    },
    [createNoteAt, editingNote, getBoardCoords]
  );

  const handleAddButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const el = boardRef.current;
      createNoteAt({
        x: el ? el.scrollLeft + 80 : 80,
        y: el ? el.scrollTop + 80 : 80,
      });
    },
    [createNoteAt]
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

  const handlePointerDown = useCallback(
    (event: React.MouseEvent | React.TouchEvent, ideaId: string, noteId: string, note: Note) => {
      const target = event.target as HTMLElement;
      if (target.closest('button') || target.closest('textarea')) return;

      event.preventDefault();
      const pointer = 'touches' in event ? event.touches[0] : event;
      const pos = note.position ?? { x: 0, y: 0 };
      const boardCoords = getBoardCoords({
        clientX: pointer.clientX,
        clientY: pointer.clientY,
      });

      setDragging({
        ideaId,
        noteId,
        offsetX: boardCoords.x - pos.x,
        offsetY: boardCoords.y - pos.y,
      });
      setDragPos(pos);
      dragPosRef.current = pos;
    },
    [getBoardCoords]
  );

  useEffect(() => {
    if (!dragging) return undefined;

    let rafId = 0;
    const el = boardRef.current;
    const activeDrag = dragging;

    const onMove = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      const pointer = 'touches' in event ? event.touches[0] : event;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const next = {
          x: pointer.clientX - rect.left + el.scrollLeft - activeDrag.offsetX,
          y: pointer.clientY - rect.top + el.scrollTop - activeDrag.offsetY,
        };
        dragPosRef.current = next;
        setDragPos(next);
      });
    };

    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      updateNote(activeDrag.ideaId, activeDrag.noteId, { position: snap(dragPosRef.current) });
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

    ideas.forEach((idea) => {
      idea.connections.forEach((targetId) => {
        const key = [idea.id, targetId].sort().join('-');
        if (seen.has(key)) return;

        seen.add(key);
        const target = ideas.find((candidate) => candidate.id === targetId);
        const sourceNote = idea.notes[0];
        const targetNote = target?.notes[0];
        if (!target || !sourceNote || !targetNote) return;

        lines.push({
          x1: (sourceNote.position?.x ?? 0) + NOTE_WIDTH / 2,
          y1: (sourceNote.position?.y ?? 0) + NOTE_MIN_HEIGHT / 2,
          x2: (targetNote.position?.x ?? 0) + NOTE_WIDTH / 2,
          y2: (targetNote.position?.y ?? 0) + NOTE_MIN_HEIGHT / 2,
          key,
        });
      });
    });

    return lines;
  }, [ideas]);

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
              strokeDasharray="6 6"
              strokeWidth={2}
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
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', opacity: 0.8 }}>
              Your ideas live here
            </Typography>
            <Typography variant="body1" sx={{ mb: 2.5, lineHeight: 1.7, opacity: 0.65 }}>
              Click anywhere on the canvas to drop a note, then drag it where it belongs.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddButtonClick}
              sx={{ borderRadius: 1, px: 3, py: 1.5 }}
            >
              Add your first note
            </Button>
          </BounceIn>
        </Box>
      )}

      {flat.map(({ note, ideaId, ideaTitle }: NoteWithMeta, index) => {
        const isDraggingThis = dragging?.noteId === note.id && dragging?.ideaId === ideaId;
        const isEditing = editingNote?.noteId === note.id && editingNote?.ideaId === ideaId;
        const pos = isDraggingThis && dragPos ? dragPos : note.position ?? { x: 0, y: 0 };
        const palette = pickPalette(index, isDark);
        const connectionCount = ideas.find((idea) => idea.id === ideaId)?.connections.length ?? 0;

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
              onDoubleClick={() => {
                if (!isEditing) startEditing(ideaId, note.id, note.content);
              }}
              onMouseDown={(event) => !isEditing && handlePointerDown(event, ideaId, note.id, note)}
              onTouchStart={(event) => !isEditing && handlePointerDown(event, ideaId, note.id, note)}
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
                  onBlur={finishEditing}
                  onChange={(event) => setEditContent(event.target.value)}
                  onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (event.key === 'Escape') finishEditing();
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) finishEditing();
                  }}
                  placeholder="What's on your mind?"
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
                />
              ) : (
                <Typography
                  onClick={(event) => {
                    event.stopPropagation();
                    startEditing(ideaId, note.id, note.content);
                  }}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteTarget({ ideaId, noteId: note.id });
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {connectionCount > 0 && (
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
                    animation: `${pulseGlow} 3s ease-in-out infinite`,
                  }}
                />
              )}
            </Paper>
          </Box>
        );
      })}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} TransitionComponent={Grow} TransitionProps={{ timeout: 220 }}>
        <DialogTitle>Remove this note?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">This note will disappear from your canvas.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Keep it</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (!deleteTarget) return;
              deleteNote(deleteTarget.ideaId, deleteTarget.noteId);
              setDeleteTarget(null);
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
