import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Fab,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Grow,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  MoreVert as MoreVertIcon,
  CreateNewFolder as CreateNewFolderIcon,
  DriveFileRenameOutline as RenameIcon,
  NoteAdd as NoteAddIcon,
  CenterFocusStrong as FocusIcon,
} from '@mui/icons-material';
import { Idea } from '../models/Idea.ts';
import { popIn, pulseGlow } from './Animations.tsx';

interface ClusterGridProps {
  ideas: Idea[];
  onUpdate: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => Idea;
  onAddNote: (ideaId: string, content: string) => void;
  categories: string[];
  onFocusIdea?: (id: string) => void;
}

const CLUSTER_COLORS = [
  { bg: '#E8F5E9', border: '#66BB6A', text: '#2E7D32', accent: '#43A047' },
  { bg: '#E3F2FD', border: '#42A5F5', text: '#1565C0', accent: '#1E88E5' },
  { bg: '#FFF3E0', border: '#FFA726', text: '#E65100', accent: '#FB8C00' },
  { bg: '#F3E5F5', border: '#AB47BC', text: '#6A1B9A', accent: '#8E24AA' },
  { bg: '#E0F7FA', border: '#26C6DA', text: '#00695C', accent: '#00ACC1' },
  { bg: '#FBE9E7', border: '#FF7043', text: '#BF360C', accent: '#F4511E' },
  { bg: '#F1F8E9', border: '#9CCC65', text: '#33691E', accent: '#7CB342' },
  { bg: '#FCE4EC', border: '#EC407A', text: '#880E4F', accent: '#D81B60' },
];

const CLUSTER_COLORS_DARK = [
  { bg: 'rgba(76,175,80,0.10)', border: 'rgba(102,187,106,0.35)', text: '#81C784', accent: '#66BB6A' },
  { bg: 'rgba(33,150,243,0.10)', border: 'rgba(66,165,245,0.35)', text: '#64B5F6', accent: '#42A5F5' },
  { bg: 'rgba(255,152,0,0.10)', border: 'rgba(255,167,38,0.35)', text: '#FFB74D', accent: '#FFA726' },
  { bg: 'rgba(156,39,176,0.10)', border: 'rgba(171,71,188,0.35)', text: '#CE93D8', accent: '#AB47BC' },
  { bg: 'rgba(0,188,212,0.10)', border: 'rgba(38,198,218,0.35)', text: '#4DD0E1', accent: '#26C6DA' },
  { bg: 'rgba(255,87,34,0.10)', border: 'rgba(255,112,67,0.35)', text: '#FF8A65', accent: '#FF7043' },
  { bg: 'rgba(139,195,74,0.10)', border: 'rgba(156,204,101,0.35)', text: '#AED581', accent: '#9CCC65' },
  { bg: 'rgba(233,30,99,0.10)', border: 'rgba(236,64,122,0.35)', text: '#F48FB1', accent: '#EC407A' },
];

const weaveFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

interface ClusterData {
  name: string;
  ideas: Idea[];
  colorIndex: number;
}

export default function ClusterGrid({
  ideas,
  onUpdate,
  onDelete,
  onToggleFavorite,
  onAddIdea,
  onAddNote,
  categories,
  onFocusIdea,
}: ClusterGridProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = isDark ? CLUSTER_COLORS_DARK : CLUSTER_COLORS;
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [newClusterOpen, setNewClusterOpen] = useState(false);
  const [newClusterName, setNewClusterName] = useState('');
  const [renameOpen, setRenameOpen] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [editIdea, setEditIdea] = useState<Idea | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [cardMenu, setCardMenu] = useState<{ anchor: HTMLElement; idea: Idea } | null>(null);
  const [draggedIdea, setDraggedIdea] = useState<{ idea: Idea; fromCluster: string } | null>(null);
  const [dragOverCluster, setDragOverCluster] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ x1: number; y1: number; x2: number; y2: number; key: string }[]>([]);

  const clusters: ClusterData[] = (() => {
    const map = new Map<string, Idea[]>();
    ideas.forEach((idea) => {
      const cat = idea.category || 'Uncategorized';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(idea);
    });
    const result: ClusterData[] = [];
    let colorIdx = 0;
    map.forEach((clusterIdeas, name) => {
      result.push({ name, ideas: clusterIdeas, colorIndex: colorIdx % colors.length });
      colorIdx++;
    });
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  })();

  const updateConnectionLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
    const seen = new Set<string>();

    clusters.forEach((cluster) => {
      cluster.ideas.forEach((idea) => {
        idea.connections.forEach((targetId) => {
          const pairKey = [idea.id, targetId].sort().join('-');
          if (seen.has(pairKey)) return;
          seen.add(pairKey);

          const targetCluster = clusters.find((c) => c.ideas.some((i) => i.id === targetId));
          if (!targetCluster || targetCluster.name === cluster.name) return;

          const sourceEl = clusterRefs.current.get(cluster.name);
          const targetEl = clusterRefs.current.get(targetCluster.name);
          if (!sourceEl || !targetEl) return;

          const sr = sourceEl.getBoundingClientRect();
          const tr = targetEl.getBoundingClientRect();

          lines.push({
            x1: sr.left + sr.width / 2 - containerRect.left + scrollLeft,
            y1: sr.top + sr.height / 2 - containerRect.top + scrollTop,
            x2: tr.left + tr.width / 2 - containerRect.left + scrollLeft,
            y2: tr.top + tr.height / 2 - containerRect.top + scrollTop,
            key: pairKey,
          });
        });
      });
    });

    setConnections(lines);
  }, [clusters]);

  useEffect(() => {
    const timer = setTimeout(updateConnectionLines, 100);
    window.addEventListener('resize', updateConnectionLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateConnectionLines);
    };
  }, [updateConnectionLines]);

  const handleCreateCluster = () => {
    const name = newClusterName.trim();
    if (!name) return;
    onAddIdea({
      title: 'New Idea',
      description: '',
      category: name,
      tags: [],
      isFavorite: false,
      position: { x: 0, y: 0 },
    });
    setNewClusterName('');
    setNewClusterOpen(false);
  };

  const handleRename = (oldName: string) => {
    const newName = renameValue.trim();
    if (!newName || newName === oldName) {
      setRenameOpen(null);
      return;
    }
    const cluster = clusters.find((c) => c.name === oldName);
    if (cluster) {
      cluster.ideas.forEach((idea) => {
        onUpdate({ ...idea, category: newName, updatedAt: new Date() });
      });
    }
    setRenameOpen(null);
  };

  const handleAddIdeaToCluster = (clusterName: string) => {
    onAddIdea({
      title: 'New Idea',
      description: '',
      category: clusterName,
      tags: [],
      isFavorite: false,
      position: { x: 0, y: 0 },
    });
  };

  const handleEditOpen = (idea: Idea) => {
    setEditIdea(idea);
    setEditTitle(idea.title);
    setEditDesc(idea.description || '');
    setEditTags(idea.tags.join(', '));
    setCardMenu(null);
  };

  const handleEditSave = () => {
    if (!editIdea) return;
    onUpdate({
      ...editIdea,
      title: editTitle.trim() || editIdea.title,
      description: editDesc,
      tags: editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: new Date(),
    });
    setEditIdea(null);
  };

  const handleDragStart = (idea: Idea, clusterName: string) => {
    setDraggedIdea({ idea, fromCluster: clusterName });
  };

  const handleDragOver = (e: React.DragEvent, clusterName: string) => {
    e.preventDefault();
    setDragOverCluster(clusterName);
  };

  const handleDragLeave = () => {
    setDragOverCluster(null);
  };

  const handleDrop = (e: React.DragEvent, targetCluster: string) => {
    e.preventDefault();
    setDragOverCluster(null);
    if (draggedIdea && draggedIdea.fromCluster !== targetCluster) {
      onUpdate({
        ...draggedIdea.idea,
        category: targetCluster,
        updatedAt: new Date(),
      });
    }
    setDraggedIdea(null);
  };

  const handleDragEnd = () => {
    setDraggedIdea(null);
    setDragOverCluster(null);
  };

  const gridBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 140px)',
        overflow: 'auto',
        p: 3,
        backgroundImage: `radial-gradient(circle, ${gridBg} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* SVG connection lines between clusters */}
      <svg
        ref={svgRef}
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
          <linearGradient id="weaveLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? 'rgba(102,187,106,0.3)' : 'rgba(46,125,50,0.15)'} />
            <stop offset="50%" stopColor={isDark ? 'rgba(102,187,106,0.5)' : 'rgba(46,125,50,0.25)'} />
            <stop offset="100%" stopColor={isDark ? 'rgba(102,187,106,0.3)' : 'rgba(46,125,50,0.15)'} />
          </linearGradient>
        </defs>
        {connections.map(({ x1, y1, x2, y2, key }) => {
          const mx = (x1 + x2) / 2;
          const my = Math.min(y1, y2) - 40;
          return (
            <path
              key={key}
              d={`M ${x1} ${y1} Q ${mx} ${my}, ${x2} ${y2}`}
              fill="none"
              stroke="url(#weaveLine)"
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.8}
            />
          );
        })}
      </svg>

      {/* Empty state */}
      {clusters.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: 2,
          }}
        >
          <CreateNewFolderIcon sx={{ fontSize: 64, opacity: 0.3, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            No clusters yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, textAlign: 'center' }}>
            Create your first cluster to start organizing ideas. Each cluster groups related ideas together.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNewClusterOpen(true)}>
            Create first cluster
          </Button>
        </Box>
      )}

      {/* Cluster grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fill, minmax(320px, 1fr))',
          },
          gap: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {clusters.map((cluster) => {
          const palette = colors[cluster.colorIndex];
          const isOver = dragOverCluster === cluster.name;

          return (
            <Box
              key={cluster.name}
              ref={(el: HTMLDivElement | null) => {
                if (el) clusterRefs.current.set(cluster.name, el);
              }}
              onDragOver={(e) => handleDragOver(e, cluster.name)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, cluster.name)}
              sx={{
                animation: `${popIn} 0.4s ease-out both`,
                animationDelay: `${cluster.colorIndex * 0.06}s`,
              }}
            >
              <Paper
                elevation={isOver ? 6 : 1}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: isOver ? palette.accent : palette.border,
                  backgroundColor: palette.bg,
                  transition: 'all 0.25s ease',
                  transform: isOver ? 'scale(1.02)' : 'scale(1)',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                {/* Cluster header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: alpha(palette.border, 0.3),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: palette.accent,
                        flexShrink: 0,
                        animation: `${weaveFloat} 3s ease-in-out infinite`,
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: palette.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cluster.name}
                    </Typography>
                    <Chip
                      label={cluster.ideas.length}
                      size="small"
                      sx={{
                        height: 22,
                        minWidth: 28,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: alpha(palette.accent, isDark ? 0.25 : 0.12),
                        color: palette.text,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Rename cluster">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setRenameValue(cluster.name);
                          setRenameOpen(cluster.name);
                        }}
                        sx={{ color: palette.text, opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <RenameIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add idea to cluster">
                      <IconButton
                        size="small"
                        onClick={() => handleAddIdeaToCluster(cluster.name)}
                        sx={{ color: palette.text, opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Idea cards inside cluster */}
                <Box
                  sx={{
                    p: 1.5,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 1.5,
                    minHeight: 80,
                  }}
                >
                  {cluster.ideas.length === 0 && (
                    <Box
                      sx={{
                        gridColumn: '1 / -1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: palette.text, opacity: 0.5 }}>
                        Drop ideas here
                      </Typography>
                    </Box>
                  )}

                  {cluster.ideas.map((idea, idx) => (
                    <Paper
                      key={idea.id}
                      draggable
                      onDragStart={() => handleDragStart(idea, cluster.name)}
                      onDragEnd={handleDragEnd}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        cursor: 'grab',
                        backgroundColor: isDark
                          ? alpha(theme.palette.background.paper, 0.6)
                          : alpha('#fff', 0.85),
                        border: '1px solid',
                        borderColor: isDark
                          ? alpha(palette.border, 0.2)
                          : alpha(palette.border, 0.15),
                        transition: 'all 0.2s ease',
                        animation: `${popIn} 0.3s ease-out both`,
                        animationDelay: `${idx * 0.03}s`,
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'translateY(-2px)',
                          borderColor: palette.accent,
                        },
                        '&:active': {
                          cursor: 'grabbing',
                        },
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Accent bar */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          backgroundColor: palette.accent,
                          opacity: 0.5,
                          borderRadius: '8px 8px 0 0',
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            flex: 1,
                            mr: 0.5,
                            mt: 0.5,
                          }}
                        >
                          {idea.title}
                        </Typography>
                        <Box sx={{ display: 'flex', flexShrink: 0, mt: 0.3 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(idea.id);
                            }}
                            sx={{
                              p: 0.3,
                              color: idea.isFavorite ? 'error.main' : 'text.disabled',
                            }}
                          >
                            {idea.isFavorite ? (
                              <FavoriteIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardMenu({ anchor: e.currentTarget, idea });
                            }}
                            sx={{ p: 0.3, color: 'text.secondary' }}
                          >
                            <MoreVertIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      {idea.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                            fontSize: '0.72rem',
                          }}
                        >
                          {idea.description}
                        </Typography>
                      )}

                      {idea.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                          {idea.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                backgroundColor: alpha(palette.accent, isDark ? 0.2 : 0.1),
                                color: palette.text,
                              }}
                            />
                          ))}
                          {idea.tags.length > 3 && (
                            <Chip
                              label={`+${idea.tags.length - 3}`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                backgroundColor: alpha(palette.accent, isDark ? 0.15 : 0.07),
                                color: palette.text,
                              }}
                            />
                          )}
                        </Box>
                      )}

                      {idea.notes.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <NoteAddIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                            {idea.notes.length} note{idea.notes.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}

                      {idea.connections.length > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 4,
                            right: 6,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: palette.accent,
                            opacity: 0.6,
                          }}
                        />
                      )}
                    </Paper>
                  ))}
                </Box>
              </Paper>
            </Box>
          );
        })}
      </Box>

      {/* FAB to create new cluster */}
      <Fab
        color="primary"
        aria-label="New cluster"
        onClick={() => setNewClusterOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1200,
          animation: `${pulseGlow} 2s ease-in-out infinite`,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'scale(1.08)' },
        }}
      >
        <AddIcon />
      </Fab>

      {/* New cluster dialog */}
      <Dialog
        open={newClusterOpen}
        onClose={() => setNewClusterOpen(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Grow}
      >
        <DialogTitle>Create a new cluster</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Cluster name"
            placeholder="e.g. Marketing Ideas, Product Features..."
            value={newClusterName}
            onChange={(e) => setNewClusterName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateCluster();
              }
            }}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Each cluster groups related ideas together. You can drag ideas between clusters.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewClusterOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCluster} disabled={!newClusterName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename cluster dialog */}
      <Dialog
        open={!!renameOpen}
        onClose={() => setRenameOpen(null)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Grow}
      >
        <DialogTitle>Rename cluster</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="New name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renameOpen) {
                e.preventDefault();
                handleRename(renameOpen);
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => renameOpen && handleRename(renameOpen)} disabled={!renameValue.trim()}>
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit idea dialog */}
      <Dialog
        open={!!editIdea}
        onClose={() => setEditIdea(null)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Grow}
      >
        <DialogTitle>Edit Idea</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="design, priority, v2..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditIdea(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Card context menu */}
      <Menu
        anchorEl={cardMenu?.anchor}
        open={!!cardMenu}
        onClose={() => setCardMenu(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            if (cardMenu) handleEditOpen(cardMenu.idea);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {onFocusIdea && (
          <MenuItem
            onClick={() => {
              if (cardMenu) {
                onFocusIdea(cardMenu.idea.id);
                setCardMenu(null);
              }
            }}
          >
            <ListItemIcon>
              <FocusIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Brainstorm this</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (cardMenu) {
              onAddNote(cardMenu.idea.id, '');
              setCardMenu(null);
            }
          }}
        >
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add note</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (cardMenu) {
              onDelete(cardMenu.idea.id);
              setCardMenu(null);
            }
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
