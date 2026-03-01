import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  Grow,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { Add as AddIcon, Delete as DeleteIcon, NoteAdd as NoteAddIcon } from '@mui/icons-material';
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

const gentleFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
`;

const threadDash = keyframes`
  to { stroke-dashoffset: -12; }
`;

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
<<<<<<< Updated upstream
  const isDark = theme.palette.mode === 'dark';
  const boardRef = useRef<HTMLDivElement>(null);
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [editingNote, setEditingNote] = useState<{ ideaId: string; noteId: string } | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ ideaId: string; noteId: string } | null>(null);
  const [dragging, setDragging] = useState<{ ideaId: string; noteId: string; offsetX: number; offsetY: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [linkMenuAnchor, setLinkMenuAnchor] = useState<{ el: HTMLElement; ideaId: string } | null>(null);
  const [unlinkMenuAnchor, setUnlinkMenuAnchor] = useState<{ el: HTMLElement; ideaId: string } | null>(null);
=======
  const [createOpen, setCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ ideaId: string; noteId: string } | null>(null);
  const [dragging, setDragging] = useState<{ ideaId: string; noteId: string; offsetX: number; offsetY: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDark = theme.palette.mode === 'dark';
  const noteCardBg = isDark
    ? alpha(theme.palette.primary.main, 0.08)
    : alpha(theme.palette.primary.main, 0.04);
  const noteCardBorder = isDark
    ? alpha(theme.palette.primary.main, 0.2)
    : alpha(theme.palette.primary.main, 0.15);
  const noteCardHover = isDark
    ? alpha(theme.palette.primary.main, 0.12)
    : alpha(theme.palette.primary.main, 0.07);

  const getBoardCoords = useCallback((e: { clientX: number; clientY: number }) => {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: e.clientX - r.left + el.scrollLeft,
      y: e.clientY - r.top + el.scrollTop,
    };
  }, []);
>>>>>>> Stashed changes

  const flat: NoteWithMeta[] = [];
  ideas.forEach((idea) => {
    idea.notes.forEach((note) => {
      flat.push({ note, ideaId: idea.id, ideaTitle: idea.title });
    });
  });

  const usedSlots = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((idea) =>
      idea.notes.forEach((note) => {
        if (note.position) {
          set.add(`${Math.round(note.position.x / GRID_CELL)},${Math.round(note.position.y / GRID_CELL)}`);
        }
      })
    );
    return set;
  }, [ideas]);

  const getBoardCoords = useCallback((e: { clientX: number; clientY: number }) => {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left + el.scrollLeft, y: e.clientY - r.top + el.scrollTop };
  }, []);

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

  const handleBoardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement) !== boardRef.current) return;
      if (editingNote) return;
      const coords = getBoardCoords(e);
      const snapped = snap(coords);
      const ideaId = getOrCreateQuickNotesIdea();
      addNote(ideaId, '', snapped);
      const newFlat = ideas.flatMap((idea) => idea.notes.map((n) => ({ ideaId: idea.id, noteId: n.id })));
      setTimeout(() => {
        const allNotes = ideas.flatMap((idea) => idea.notes);
        const newest = allNotes[allNotes.length - 1];
        if (newest) {
          // editing will be set by the re-render
        }
      }, 50);
    },
    [getBoardCoords, getOrCreateQuickNotesIdea, addNote, ideas, editingNote]
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
  }, [editingNote, editContent, updateNote]);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, ideaId: string, noteId: string, note: Note) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if ((e.target as HTMLElement).closest('textarea')) return;
      e.preventDefault();
      const pointer = 'touches' in e ? e.touches[0] : e;
      const pos = note.position ?? { x: 0, y: 0 };
      const bc = getBoardCoords({ clientX: pointer.clientX, clientY: pointer.clientY });
      setDragging({ ideaId, noteId, offsetX: bc.x - pos.x, offsetY: bc.y - pos.y });
      setDragPos({ x: pos.x, y: pos.y });
      dragPosRef.current = { x: pos.x, y: pos.y };
    },
    [getBoardCoords]
  );

  useEffect(() => {
    if (!dragging) return;
    let rafId: number;
    const el = boardRef.current;
    const d = dragging;
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const coords = 'touches' in e ? e.touches[0] : e;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const next = { x: coords.clientX - r.left + el.scrollLeft - d.offsetX, y: coords.clientY - r.top + el.scrollTop - d.offsetY };
        dragPosRef.current = next;
        setDragPos(next);
      });
    };
    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      updateNote(d.ideaId, d.noteId, { position: snap(dragPosRef.current) });
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
    const noteCenter = (n: Note) => ({
      x: (n.position?.x ?? 0) + NOTE_WIDTH / 2,
      y: (n.position?.y ?? 0) + NOTE_MIN_HEIGHT / 2,
    });
    ideas.forEach((idea) => {
      idea.connections.forEach((targetId) => {
        const pairKey = [idea.id, targetId].sort().join('-');
        if (seen.has(pairKey)) return;
        seen.add(pairKey);
        const target = ideas.find((i) => i.id === targetId);
        if (!target) return;
        const srcNote = idea.notes[0];
        const tgtNote = target.notes[0];
        if (!srcNote || !tgtNote) return;
        const s = noteCenter(srcNote);
        const t = noteCenter(tgtNote);
        lines.push({ ...s, x2: t.x, y2: t.y, key: pairKey });
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
      {/* Connection threads */}
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

      {/* Warm, inviting empty state */}
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
<<<<<<< Updated upstream
            <SparkleIcon sx={{ fontSize: 56, mb: 2, opacity: 0.35, color: 'secondary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', opacity: 0.8 }}>
              Your ideas live here
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.7, opacity: 0.65 }}>
              Click anywhere on the canvas to drop a note.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.45, fontStyle: 'italic' }}>
              Drag them around, connect them, watch your thoughts take shape.
            </Typography>
=======
            <NoteAddIcon sx={{ fontSize: 56, mb: 2, opacity: 0.35, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              Your board is waiting
            </Typography>
            <Typography variant="body2" sx={{ mb: 2.5, maxWidth: 340, lineHeight: 1.6 }}>
              Drop your first note here — a thought, a line, a dream. Drag it anywhere, then add more. This space is yours.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ borderRadius: 1, px: 3, py: 1.5 }}
            >
              Add your first note
            </Button>
>>>>>>> Stashed changes
          </BounceIn>
        </Box>
      )}

      {/* Notes */}
      {flat.map(({ note, ideaId, ideaTitle }, index) => {
        const isDraggingThis = dragging?.noteId === note.id && dragging?.ideaId === ideaId;
<<<<<<< Updated upstream
        const isEditing = editingNote?.noteId === note.id && editingNote?.ideaId === ideaId;
        const pos = isDraggingThis && dragPos ? dragPos : note.position ?? { x: 0, y: 0 };
        const palette = pickPalette(index, isDark);
        const canLink = onAddConnection && ideas.filter((i) => i.id !== ideaId && !connections.includes(i.id)).length > 0;
=======
        const pos = isDraggingThis && dragPos ? dragPos : (note.position ?? { x: 0, y: 0 });
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
              elevation={isDraggingThis ? 10 : isEditing ? 6 : 1}
              onMouseDown={(e) => !isEditing && handlePointerDown(e, ideaId, note.id, note)}
              onTouchStart={(e) => !isEditing && handlePointerDown(e, ideaId, note.id, note)}
              onDoubleClick={() => {
                if (!isEditing) startEditing(ideaId, note.id, note.content);
              }}
=======
              elevation={0}
              onMouseDown={(e) => handlePointerDown(e, ideaId, note.id, note)}
              onTouchStart={(e) => handlePointerDown(e, ideaId, note.id, note)}
>>>>>>> Stashed changes
              sx={{
                width: NOTE_WIDTH,
                minHeight: NOTE_MIN_HEIGHT,
                p: 2,
<<<<<<< Updated upstream
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
=======
                cursor: isDraggingThis ? 'grabbing' : 'grab',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'none',
                zIndex: isDraggingThis ? 1300 : 1,
                transition: isDraggingThis ? 'none' : 'box-shadow 0.2s ease',
                backgroundColor: noteCardBg,
                border: '1px solid',
                borderColor: noteCardBorder,
                borderRadius: 1.5,
                boxShadow: isDraggingThis ? '0 4px 20px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
                '&:hover': {
                  boxShadow: isDraggingThis ? undefined : '0 2px 8px rgba(0,0,0,0.08)',
                  backgroundColor: noteCardHover,
>>>>>>> Stashed changes
                },
              }}
            >
              {/* Category label */}
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
<<<<<<< Updated upstream

              {/* Note content — inline editing or display */}
              {isEditing ? (
                <textarea
                  autoFocus
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onBlur={finishEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') finishEditing();
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) finishEditing();
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

              {/* Hoverable action buttons */}
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
                {canLink && (
                  <Tooltip title="Thread to another note">
                    <IconButton
                      size="small"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLinkMenuAnchor({ el: e.currentTarget, ideaId });
                      }}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    >
                      <LinkIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                {onRemoveConnection && connections.length > 0 && (
                  <Tooltip title="Unthread">
                    <IconButton
                      size="small"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnlinkMenuAnchor({ el: e.currentTarget, ideaId });
                      }}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'warning.main' } }}
                    >
                      <LinkOffIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
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
=======
              <Box sx={{ display: 'flex', gap: 0 }}>
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
>>>>>>> Stashed changes
              </Box>

              {/* Connection dot indicator */}
              {connections.length > 0 && (
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

<<<<<<< Updated upstream
      {/* Delete confirmation */}
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
              if (deleteTarget) {
                deleteNote(deleteTarget.ideaId, deleteTarget.noteId);
                setDeleteTarget(null);
=======
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
        <DialogTitle>New note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind?"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCreate();
>>>>>>> Stashed changes
              }
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

<<<<<<< Updated upstream
      {/* Link menu */}
      {linkMenuAnchor && (
        <Menu
          anchorEl={linkMenuAnchor.el}
          open
          onClose={() => setLinkMenuAnchor(null)}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          {ideas
            .filter((i) => i.id !== linkMenuAnchor.ideaId && !ideas.find((x) => x.id === linkMenuAnchor.ideaId)?.connections.includes(i.id))
            .map((target) => (
              <MenuItem
                key={target.id}
                onClick={() => {
                  onAddConnection?.(linkMenuAnchor.ideaId, target.id);
                  setLinkMenuAnchor(null);
                }}
              >
                <ListItemIcon><LinkIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary={`Thread to "${target.title}"`} />
              </MenuItem>
            ))}
        </Menu>
      )}

      {/* Unlink menu */}
      {unlinkMenuAnchor && (
        <Menu
          anchorEl={unlinkMenuAnchor.el}
          open
          onClose={() => setUnlinkMenuAnchor(null)}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          {ideas
            .filter((i) => ideas.find((x) => x.id === unlinkMenuAnchor.ideaId)?.connections.includes(i.id))
            .map((target) => (
              <MenuItem
                key={target.id}
                onClick={() => {
                  onRemoveConnection?.(unlinkMenuAnchor.ideaId, target.id);
                  setUnlinkMenuAnchor(null);
                }}
              >
                <ListItemIcon><LinkOffIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary={`Unthread from "${target.title}"`} />
              </MenuItem>
            ))}
        </Menu>
      )}
=======
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
>>>>>>> Stashed changes
    </Box>
  );
}
