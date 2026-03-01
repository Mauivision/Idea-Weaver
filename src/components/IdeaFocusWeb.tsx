import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  TextField,
  Button,
  Tooltip,
  useTheme,
  Fade,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  NoteAdd as NoteAddIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { Idea } from '../models/Idea.ts';

interface IdeaFocusWebProps {
  idea: Idea;
  allIdeas: Idea[];
  onBack: () => void;
  onUpdate: (idea: Idea) => void;
  onToggleFavorite: (id: string) => void;
  onAddNote: (ideaId: string, content: string) => void;
  onDeleteNote: (ideaId: string, noteId: string) => void;
  onAddConnection: (sourceId: string, targetId: string) => void;
  onRemoveConnection: (sourceId: string, targetId: string) => void;
  onFocusIdea: (id: string) => void;
}

const orbitFloat = keyframes`
  0%, 100% { transform: translate(var(--ox), var(--oy)); }
  50% { transform: translate(calc(var(--ox) + 3px), calc(var(--oy) - 4px)); }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.97); opacity: 0.4; }
  50% { transform: scale(1.02); opacity: 0.15; }
  100% { transform: scale(0.97); opacity: 0.4; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const RING_COLORS = [
  '#66BB6A', '#42A5F5', '#FFA726', '#AB47BC',
  '#26C6DA', '#FF7043', '#9CCC65', '#EC407A',
];

function radialPosition(index: number, total: number, radius: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

export default function IdeaFocusWeb({
  idea,
  allIdeas,
  onBack,
  onUpdate,
  onToggleFavorite,
  onAddNote,
  onDeleteNote,
  onAddConnection,
  onRemoveConnection,
  onFocusIdea,
}: IdeaFocusWebProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(idea.title);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState(idea.description);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  const connectedIdeas = useMemo(
    () => allIdeas.filter((i) => idea.connections.includes(i.id)),
    [allIdeas, idea.connections]
  );

  const unlinkedIdeas = useMemo(
    () => allIdeas.filter((i) => i.id !== idea.id && !idea.connections.includes(i.id)),
    [allIdeas, idea]
  );

  const notes = idea.notes;
  const totalSatellites = notes.length + connectedIdeas.length;

  const saveTitle = useCallback(() => {
    if (editTitle.trim() && editTitle !== idea.title) {
      onUpdate({ ...idea, title: editTitle.trim(), updatedAt: new Date() });
    }
    setIsEditingTitle(false);
  }, [editTitle, idea, onUpdate]);

  const saveDesc = useCallback(() => {
    if (editDesc !== idea.description) {
      onUpdate({ ...idea, description: editDesc, updatedAt: new Date() });
    }
    setIsEditingDesc(false);
  }, [editDesc, idea, onUpdate]);

  const handleAddNote = useCallback(() => {
    if (newNoteContent.trim()) {
      onAddNote(idea.id, newNoteContent.trim());
      setNewNoteContent('');
      setShowAddNote(false);
    }
  }, [newNoteContent, idea.id, onAddNote]);

  const bgGradient = isDark
    ? 'radial-gradient(ellipse at center, rgba(46,125,50,0.08) 0%, rgba(18,18,18,0) 70%)'
    : 'radial-gradient(ellipse at center, rgba(46,125,50,0.06) 0%, rgba(245,245,245,0) 70%)';

  const noteRadius = 220;
  const connectionRadius = notes.length > 0 ? 380 : 220;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 140px)',
        overflow: 'auto',
        backgroundImage: bgGradient,
      }}
    >
      {/* Back button */}
      <Box sx={{ position: 'sticky', top: 16, left: 16, zIndex: 10 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          variant="text"
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
          }}
        >
          All ideas
        </Button>
      </Box>

      {/* Canvas */}
      <Box
        sx={{
          position: 'relative',
          minHeight: Math.max(700, connectionRadius * 2 + 300),
          minWidth: Math.max(900, connectionRadius * 2 + 400),
          mx: 'auto',
        }}
      >
        {/* Center coordinates */}
        {(() => {
          const cx = Math.max(450, connectionRadius + 200);
          const cy = Math.max(350, connectionRadius + 150);

          return (
            <>
              {/* Ambient ring */}
              <Box
                sx={{
                  position: 'absolute',
                  left: cx - 160,
                  top: cy - 160,
                  width: 320,
                  height: 320,
                  borderRadius: '50%',
                  border: '1.5px dashed',
                  borderColor: isDark ? 'rgba(102,187,106,0.12)' : 'rgba(46,125,50,0.08)',
                  animation: `${pulseRing} 4s ease-in-out infinite`,
                  pointerEvents: 'none',
                }}
              />

              {/* SVG threads from center to satellites */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              >
                <defs>
                  <linearGradient id="focusThread" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isDark ? 'rgba(129,199,132,0.4)' : 'rgba(46,125,50,0.15)'} />
                    <stop offset="100%" stopColor={isDark ? 'rgba(129,199,132,0.15)' : 'rgba(46,125,50,0.06)'} />
                  </linearGradient>
                </defs>
                {notes.map((_, i) => {
                  const pos = radialPosition(i, notes.length || 1, noteRadius);
                  const tx = cx + pos.x;
                  const ty = cy + pos.y;
                  const mx = (cx + tx) / 2;
                  const my = Math.min(cy, ty) - 30;
                  return (
                    <path
                      key={`note-${i}`}
                      d={`M ${cx} ${cy} Q ${mx} ${my}, ${tx} ${ty}`}
                      fill="none"
                      stroke="url(#focusThread)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                  );
                })}
                {connectedIdeas.map((_, i) => {
                  const pos = radialPosition(i, connectedIdeas.length || 1, connectionRadius);
                  const tx = cx + pos.x;
                  const ty = cy + pos.y;
                  const mx = (cx + tx) / 2;
                  const my = Math.min(cy, ty) - 40;
                  return (
                    <path
                      key={`conn-${i}`}
                      d={`M ${cx} ${cy} Q ${mx} ${my}, ${tx} ${ty}`}
                      fill="none"
                      stroke={RING_COLORS[i % RING_COLORS.length]}
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      opacity={0.3}
                    />
                  );
                })}
              </svg>

              {/* === CENTER: The focused idea === */}
              <Paper
                elevation={4}
                sx={{
                  position: 'absolute',
                  left: cx - 160,
                  top: cy - 100,
                  width: 320,
                  p: 3,
                  borderRadius: 4,
                  backgroundColor: isDark ? alpha('#1b5e20', 0.15) : alpha('#E8F5E9', 0.9),
                  border: '2px solid',
                  borderColor: isDark ? 'rgba(102,187,106,0.3)' : 'rgba(46,125,50,0.2)',
                  zIndex: 5,
                  animation: `${fadeUp} 0.4s ease-out`,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SparkleIcon sx={{ fontSize: 20, color: 'primary.main', opacity: 0.6 }} />
                  <Chip label={idea.category} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                  <IconButton size="small" onClick={() => onToggleFavorite(idea.id)}>
                    {idea.isFavorite ? (
                      <FavoriteIcon sx={{ fontSize: 18, color: 'error.main' }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Box>

                {isEditingTitle ? (
                  <TextField
                    autoFocus
                    fullWidth
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                    variant="standard"
                    inputProps={{ style: { textAlign: 'center', fontSize: '1.3rem', fontWeight: 600 } }}
                  />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, cursor: 'pointer', mb: 1, '&:hover': { color: 'primary.main' } }}
                    onClick={() => { setEditTitle(idea.title); setIsEditingTitle(true); }}
                  >
                    {idea.title}
                  </Typography>
                )}

                {isEditingDesc ? (
                  <TextField
                    autoFocus
                    fullWidth
                    multiline
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    onBlur={saveDesc}
                    variant="standard"
                    inputProps={{ style: { textAlign: 'center', fontSize: '0.85rem' } }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: 'pointer', minHeight: 20, '&:hover': { color: 'text.primary' } }}
                    onClick={() => { setEditDesc(idea.description); setIsEditingDesc(true); }}
                  >
                    {idea.description || (
                      <span style={{ fontStyle: 'italic', opacity: 0.4 }}>Click to add a description...</span>
                    )}
                  </Typography>
                )}

                {idea.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mt: 1.5 }}>
                    {idea.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 22, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
                      />
                    ))}
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <Tooltip title="Add a note">
                    <IconButton size="small" onClick={() => setShowAddNote(true)} color="primary">
                      <NoteAddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Connect to another idea">
                    <IconButton size="small" onClick={() => setShowLinkPicker(true)} color="primary">
                      <LinkIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.35 }}>
                  {notes.length} note{notes.length !== 1 ? 's' : ''} · {connectedIdeas.length} connection{connectedIdeas.length !== 1 ? 's' : ''}
                </Typography>
              </Paper>

              {/* === INNER RING: Notes === */}
              {notes.map((note, i) => {
                const pos = radialPosition(i, notes.length || 1, noteRadius);
                const colors = ['#FFF9C4', '#F3E5F5', '#E0F7FA', '#FBE9E7', '#E8F5E9', '#E3F2FD', '#FCE4EC', '#FFF8E1'];
                const bg = isDark ? alpha(colors[i % colors.length], 0.08) : colors[i % colors.length];

                return (
                  <Paper
                    key={note.id}
                    elevation={1}
                    sx={{
                      position: 'absolute',
                      left: cx + pos.x - 90,
                      top: cy + pos.y - 50,
                      width: 180,
                      minHeight: 80,
                      p: 1.5,
                      borderRadius: 2.5,
                      backgroundColor: bg,
                      border: '1px solid',
                      borderColor: alpha(colors[i % colors.length], isDark ? 0.2 : 0.4),
                      zIndex: 3,
                      cursor: 'default',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      animation: `${fadeUp} 0.4s ease-out`,
                      animationDelay: `${0.1 + i * 0.06}s`,
                      animationFillMode: 'both',
                      '--ox': '0px',
                      '--oy': '0px',
                      '&:hover': {
                        transform: 'scale(1.04)',
                        boxShadow: 3,
                        '& .note-del': { opacity: 1 },
                      },
                    } as any}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Georgia", serif',
                        fontSize: '0.82rem',
                        lineHeight: 1.55,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: isDark ? '#e0e0e0' : '#37474f',
                      }}
                    >
                      {note.content || <span style={{ opacity: 0.35, fontStyle: 'italic' }}>Empty note</span>}
                    </Typography>
                    <IconButton
                      className="note-del"
                      size="small"
                      onClick={() => onDeleteNote(idea.id, note.id)}
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        color: 'text.disabled',
                        '&:hover': { color: 'error.main' },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Paper>
                );
              })}

              {/* === OUTER RING: Connected ideas === */}
              {connectedIdeas.map((conn, i) => {
                const pos = radialPosition(i, connectedIdeas.length || 1, connectionRadius);
                const ringColor = RING_COLORS[i % RING_COLORS.length];

                return (
                  <Paper
                    key={conn.id}
                    elevation={1}
                    onClick={() => onFocusIdea(conn.id)}
                    sx={{
                      position: 'absolute',
                      left: cx + pos.x - 80,
                      top: cy + pos.y - 40,
                      width: 160,
                      p: 1.5,
                      borderRadius: 3,
                      backgroundColor: isDark ? alpha(ringColor, 0.08) : alpha(ringColor, 0.08),
                      border: '1.5px solid',
                      borderColor: alpha(ringColor, 0.3),
                      cursor: 'pointer',
                      zIndex: 2,
                      transition: 'all 0.25s ease',
                      animation: `${fadeUp} 0.4s ease-out`,
                      animationDelay: `${0.2 + i * 0.08}s`,
                      animationFillMode: 'both',
                      '&:hover': {
                        transform: 'scale(1.08)',
                        boxShadow: `0 4px 16px ${alpha(ringColor, 0.25)}`,
                        borderColor: ringColor,
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.25 }}>
                      {conn.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                      {conn.category}
                    </Typography>
                    <Tooltip title="Unlink">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveConnection(idea.id, conn.id);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          opacity: 0.3,
                          '&:hover': { opacity: 1, color: 'warning.main' },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                );
              })}

              {/* No connections prompt */}
              {connectedIdeas.length === 0 && notes.length === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: cx - 120,
                    top: cy + 120,
                    width: 240,
                    textAlign: 'center',
                    animation: `${fadeUp} 0.5s ease-out 0.3s both`,
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.4, fontStyle: 'italic' }}>
                    Add notes and connect ideas to build your brainstorm web
                  </Typography>
                </Box>
              )}
            </>
          );
        })()}
      </Box>

      {/* Add note overlay */}
      <Fade in={showAddNote}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 400,
            maxWidth: '90vw',
            p: 2,
            borderRadius: 3,
            zIndex: 1200,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Add a note to "{idea.title}"</Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={2}
            placeholder="What are you thinking?"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddNote();
              if (e.key === 'Escape') setShowAddNote(false);
            }}
            size="small"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button size="small" onClick={() => setShowAddNote(false)}>Cancel</Button>
            <Button size="small" variant="contained" onClick={handleAddNote} disabled={!newNoteContent.trim()}>
              Add note
            </Button>
          </Box>
        </Paper>
      </Fade>

      {/* Link picker overlay */}
      <Fade in={showLinkPicker}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 400,
            maxWidth: '90vw',
            maxHeight: 300,
            overflow: 'auto',
            p: 2,
            borderRadius: 3,
            zIndex: 1200,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Connect to an idea</Typography>
            <IconButton size="small" onClick={() => setShowLinkPicker(false)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          {unlinkedIdeas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              All ideas are already connected
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {unlinkedIdeas.map((target) => (
                <Button
                  key={target.id}
                  variant="text"
                  size="small"
                  onClick={() => {
                    onAddConnection(idea.id, target.id);
                    setShowLinkPicker(false);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{target.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{target.category}</Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          )}
        </Paper>
      </Fade>
    </Box>
  );
}
