import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Dialog,
  Tooltip,
  Popper,
  Fade
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  CenterFocusWeak as CenterFocusWeakIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  AccountTree as AccountTreeIcon,
  ArrowRightAlt as ArrowRightAltIcon,
  LinkOff as UnlinkIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea';
import IdeaForm from './IdeaForm';

interface IdeaNodeProps {
  idea: Idea;
  position: { x: number; y: number };
  onMove: (id: string, position: { x: number; y: number }) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onEdit: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUnlink: (id: string) => void;
  scale: number;
  panOffset: { x: number; y: number };
}

const IdeaNode: React.FC<IdeaNodeProps> = React.memo(({
  idea,
  position,
  onMove,
  onSelect,
  isSelected,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUnlink,
  scale,
  panOffset
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (nodeRef.current && onSelect) {
      try {
        // Calculate offset from click point to element center for perfect dragging
        const rect = nodeRef.current.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) {
          console.warn('Invalid element bounds, skipping drag');
          return;
        }

        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        setDragOffset({
          x: e.clientX - elementCenterX,
          y: e.clientY - elementCenterY,
          startX: elementCenterX,
          startY: elementCenterY
        });
        setIsDragging(true);
        onSelect(idea.id);
        e.stopPropagation();
        e.preventDefault();
      } catch (error) {
        console.error('Error in handleMouseDown:', error);
      }
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && onMove) {
        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
          try {
            // Safety check: ensure scale is not zero
            if (scale === 0) {
              console.warn('Scale is zero, skipping move');
              return;
            }

            // Calculate the new position based on mouse position minus the offset from element center
            // This ensures the element moves exactly with the mouse cursor
            const newVisualX = e.clientX - (dragOffset?.x ?? 0);
            const newVisualY = e.clientY - (dragOffset?.y ?? 0);

            // Convert from screen coordinates back to logical coordinates (accounting for pan and scale)
            const newX = (newVisualX - (panOffset?.x ?? 0)) / scale;
            const newY = (newVisualY - (panOffset?.y ?? 0)) / scale;

            // Safety check: ensure we have valid coordinates
            if (isNaN(newX) || isNaN(newY) || !isFinite(newX) || !isFinite(newY)) {
              console.warn('Invalid coordinates calculated, skipping move');
              return;
            }

            onMove(idea.id, { x: newX, y: newY });
          } catch (error) {
            console.error('Error in handleMouseMove:', error);
            setIsDragging(false);
          }
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, idea.id, onMove, scale, panOffset]);

  // Calculate a color based on category or use default theme color
  const getCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      'Market': 'rgba(63, 81, 181, 0.15)',
      'Art': 'rgba(156, 39, 176, 0.15)',
      'Network': 'rgba(0, 150, 136, 0.15)',
      'Grow': 'rgba(76, 175, 80, 0.15)',
      'Bloom': 'rgba(255, 152, 0, 0.15)',
      'Vibe': 'rgba(233, 30, 99, 0.15)',
      'Automate': 'rgba(3, 169, 244, 0.15)'
    };
    
    return categories[category] || 'rgba(46, 125, 50, 0.07)';
  };
  
  // Get border color based on category but stronger
  const getBorderColor = (category: string) => {
    const categories: Record<string, string> = {
      'Market': 'rgb(63, 81, 181)',
      'Art': 'rgb(156, 39, 176)',
      'Network': 'rgb(0, 150, 136)',
      'Grow': 'rgb(76, 175, 80)',
      'Bloom': 'rgb(255, 152, 0)',
      'Vibe': 'rgb(233, 30, 99)',
      'Automate': 'rgb(3, 169, 244)'
    };
    
    return categories[category] || '#2e7d32';
  };

  return (
    <Box
      ref={nodeRef}
        sx={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          zIndex: isSelected ? 10 : 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother easing
          willChange: isDragging ? 'transform' : 'auto', // Optimize for GPU
          backfaceVisibility: 'hidden', // Prevent flicker during transforms
          userSelect: 'none', // Prevent text selection during drag
          '&:hover': {
            transform: 'translate(-50%, -50%) scale(1.05)', // Subtle hover scale
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'brightness(1.1)', // Slight brightness increase on hover
          },
        }}
      onMouseDown={handleMouseDown}
      onClick={() => setShowActions(!showActions)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Paper
        elevation={isSelected ? 12 : isHovered ? 8 : 4}
        sx={{
          p: 2,
          borderRadius: '16px',
          minWidth: '150px',
          maxWidth: '220px',
          bgcolor: isSelected
            ? 'rgba(46, 125, 50, 0.15)'
            : getCategoryColor(idea.category),
          border: isSelected
            ? `2px solid ${getBorderColor(idea.category)}`
            : isHovered
              ? `1px solid ${getBorderColor(idea.category)}`
              : 'none',
          boxShadow: isHovered && !isSelected
            ? '0px 8px 20px rgba(0,0,0,0.15), 0px 0px 0px 1px rgba(46, 125, 50, 0.1)'
            : isSelected
              ? '0px 12px 24px rgba(0,0,0,0.2), 0px 0px 0px 2px rgba(46, 125, 50, 0.3)'
              : '0px 4px 12px rgba(0,0,0,0.1)',
          transform: isHovered && !isSelected ? 'translateY(-4px) scale(1.02)' : 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            boxShadow: isSelected
              ? '0px 16px 32px rgba(0,0,0,0.25), 0px 0px 0px 3px rgba(46, 125, 50, 0.4)'
              : '0px 12px 24px rgba(0,0,0,0.18), 0px 0px 0px 1px rgba(46, 125, 50, 0.15)',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '1rem', 
              fontWeight: 'bold',
              wordBreak: 'break-word',
              color: isSelected ? getBorderColor(idea.category) : 'inherit'
            }}
          >
            {idea.title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(idea.id);
            }}
            sx={{ 
              color: idea.isFavorite ? 'secondary.main' : 'action.disabled',
              transition: 'transform 0.2s ease',
              transform: idea.isFavorite ? 'scale(1.2)' : 'scale(1)'
            }}
          >
            {idea.isFavorite ? <FavoriteIcon color="secondary" /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
        
        <Chip 
          label={idea.category} 
          size="small" 
          variant="outlined" 
          sx={{ 
            mb: 1, 
            mt: 0.5,
            border: `1px solid ${getBorderColor(idea.category)}`,
            color: getBorderColor(idea.category)
          }}
        />
        
        {idea.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, mb: 1 }}>
            {idea.tags.slice(0, 2).map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                sx={{ 
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }} 
              />
            ))}
            {idea.tags.length > 2 && (
              <Chip 
                label={`+${idea.tags.length - 2}`} 
                size="small" 
                variant="outlined" 
                sx={{ 
                  fontSize: '0.7rem',
                  borderColor: 'rgba(0,0,0,0.3)',
                  color: 'text.secondary'
                }}
              />
            )}
          </Box>
        )}

        {idea.description && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1, 
              fontSize: '0.8rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'text.secondary'
            }}
          >
            {idea.description}
          </Typography>
        )}
        
        {/* Connection count indicator */}
        {idea.connections.length > 0 && (
          <Box sx={{ 
            mt: 1, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}>
            <LinkIcon fontSize="small" />
            <Typography variant="caption">
              {idea.connections.length} connection{idea.connections.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
        
        {(showActions || isSelected) && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            mt: 1,
            pt: 1,
            borderTop: '1px solid rgba(0,0,0,0.1)' 
          }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                onEdit(idea);
              }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                onDelete(idea.id);
              }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Unlink">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlink(idea.id);
                }}
                disabled={idea.connections.length === 0}
              >
                <UnlinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Paper>
    </Box>
  );
});

interface EdgeProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  isSelected: boolean;
  onClick: () => void;
  isBidirectional: boolean;
  onHover: (isHovering: boolean) => void;
}

const Edge: React.FC<EdgeProps> = React.memo(({ start, end, isSelected, onClick, isBidirectional, onHover }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate the line path
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate control point for a more natural curve
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const curvature = Math.min(0.4, distance * 0.1); // Dynamic curvature based on distance
  const offsetX = -dy * curvature;
  const offsetY = dx * curvature;
  const controlX = midX + offsetX;
  const controlY = midY + offsetY;

  return (
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
        {/* Gradient for connection lines */}
        <linearGradient id={`gradient-${start.x}-${start.y}-${end.x}-${end.y}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isSelected || isHovered ? '#ff6b6b' : '#4ecdc4'} stopOpacity={0.8} />
          <stop offset="50%" stopColor={isSelected || isHovered ? '#4ecdc4' : '#45b7d1'} stopOpacity={0.9} />
          <stop offset="100%" stopColor={isSelected || isHovered ? '#45b7d1' : '#96ceb4'} stopOpacity={0.8} />
        </linearGradient>

        {/* Arrow marker */}
        <marker
          id={`arrow-${isSelected || isHovered ? 'highlighted' : 'normal'}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={isSelected || isHovered ? '#ff5722' : '#666'}
            stroke="none"
            opacity={0.9}
          />
        </marker>
      </defs>

      {/* Curved connection line with gradient */}
      <path
        d={`M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`}
        stroke={`url(#gradient-${start.x}-${start.y}-${end.x}-${end.y})`}
        strokeWidth={isSelected || isHovered ? 4 : 2.5}
        fill="none"
        strokeDasharray={isHovered && !isSelected ? "8,4" : "0"}
        strokeLinecap="round"
        onMouseEnter={() => {
          setIsHovered(true);
          onHover(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHover(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: isHovered ? 'drop-shadow(0px 0px 4px rgba(255, 87, 34, 0.3))' : 'none'
        }}
      />

      {/* Interactive area in the middle of the edge - larger hit target */}
      <circle
        cx={midX}
        cy={midY}
        r={12}
        fill={isHovered ? 'rgba(255, 87, 34, 0.1)' : 'transparent'}
        stroke={isHovered ? 'rgba(255, 87, 34, 0.3)' : 'transparent'}
        strokeWidth={2}
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          onHover(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHover(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      />

      {/* Connection strength indicator */}
      {isHovered && (
        <circle
          cx={midX}
          cy={midY}
          r={6}
          fill="#ff5722"
          style={{
            pointerEvents: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Apply the marker to the path */}
      <path
        d={`M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`}
        stroke="transparent"
        fill="none"
        markerEnd={`url(#arrow-${isSelected || isHovered ? 'highlighted' : 'normal'})`}
        style={{ pointerEvents: 'none' }}
      />

      {/* Second arrow for bidirectional connections */}
      {isBidirectional && (
        <>
          <path
            d={`M ${end.x} ${end.y} Q ${controlX} ${controlY} ${start.x} ${start.y}`}
            stroke="transparent"
            fill="none"
            markerEnd={`url(#arrow-${isSelected || isHovered ? 'highlighted' : 'normal'})`}
            style={{ pointerEvents: 'none' }}
          />
          {/* Second connection strength indicator */}
          {isHovered && (
            <circle
              cx={midX}
              cy={midY}
              r={4}
              fill="#4ecdc4"
              style={{
                pointerEvents: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          )}
        </>
      )}
    </svg>
  );
});

interface IdeaGraphProps {
  ideas: Idea[];
  onUpdate: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddConnection: (sourceId: string, targetId: string) => void;
  onRemoveConnection: (sourceId: string, targetId: string) => void;
  onMoveIdea: (ideaId: string, position: { x: number; y: number }) => void;
  categories: string[];
  onAddIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => void;
}

const IdeaGraph: React.FC<IdeaGraphProps> = ({
  ideas,
  onUpdate,
  onDelete,
  onToggleFavorite,
  onAddConnection,
  onRemoveConnection,
  onMoveIdea,
  categories,
  onAddIdea
}) => {
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [showForm, setShowForm] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);
  const [hoveredConnection, setHoveredConnection] = useState<{
    source: Idea,
    target: Idea,
    position: { x: number, y: number }
  } | null>(null);
  
  // Add a new idea at the clicked position
  const handleAddIdea = (position: { x: number; y: number }) => {
    // Calculate position relative to graph with panning and scaling
    const adjustedX = (position.x - panOffset.x) / scale;
    const adjustedY = (position.y - panOffset.y) / scale;
    
    setShowForm(true);
    
    // When submitting the form, use this position
    const handleSubmit = (ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => {
      onAddIdea({
        ...ideaData,
        position: { x: adjustedX, y: adjustedY }
      });
      setShowForm(false);
    };
    
    // We'll store the data we need for the form
    return { 
      position: { x: adjustedX, y: adjustedY }, 
      onSubmit: handleSubmit 
    };
  };

  // Add this new function to handle unlinking individual nodes
  const handleUnlinkNode = useCallback((ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    
    // Remove all connections from this idea
    const updatedIdea = {
      ...idea,
      connections: []
    };
    
    // Also remove this idea from other ideas' connections
    const updatedIdeas = ideas.map(i => {
      if (i.connections.includes(ideaId)) {
        return {
          ...i,
          connections: i.connections.filter(id => id !== ideaId)
        };
      }
      return i;
    });
    
    // Update the current idea
    const finalIdeas = updatedIdeas.map(i => 
      i.id === ideaId ? updatedIdea : i
    );
    
    // Update all affected ideas
    finalIdeas.forEach(ideaToUpdate => {
      onUpdate(ideaToUpdate);
    });
  }, [ideas, onUpdate]);

  // Canvas/graph interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === graphRef.current) {
      setIsPanning(true);
      setStartPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - startPanPoint.x;
      const dy = e.clientY - startPanPoint.y;
      setPanOffset({
        x: panOffset.x + dx,
        y: panOffset.y + dy
      });
      setStartPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => Math.max(0.2, Math.min(3, prevScale * scaleFactor)));
  };

  // Handle clicking the canvas to add a new idea
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === graphRef.current && !isPanning) {
      if (connectingFrom) {
        // Cancel connecting mode when clicking canvas
        setConnectingFrom(null);
      } else {
        // Add new idea at this position
        const result = handleAddIdea({
          x: e.clientX,
          y: e.clientY
        });

        // In a real app, we'd use this data
        console.log("Adding idea at position:", result.position);
      }
    }
  };

  // Start connecting from the selected idea (defined before handleKeyDown)
  const startConnecting = useCallback(() => {
    if (selectedIdea) {
      setConnectingFrom(selectedIdea);
    }
  }, [selectedIdea]);

  // Center the view on all ideas (defined before handleKeyDown)
  const centerView = useCallback(() => {
    if (ideas.length === 0 || !graphRef.current) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    ideas.forEach(idea => {
      const pos = idea.position || { x: 0, y: 0 };
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    });
    const width = graphRef.current.clientWidth;
    const height = graphRef.current.clientHeight;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setPanOffset({
      x: width / 2 - centerX * scale,
      y: height / 2 - centerY * scale
    });
  }, [ideas, scale]);

  // Keyboard shortcuts for better UX
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedIdea) {
          event.preventDefault();
          onDelete(selectedIdea);
          setSelectedIdea(null);
        }
        break;
      case 'c':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (selectedIdea) startConnecting();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setConnectingFrom(null);
        setSelectedIdea(null);
        break;
      case 'f':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          centerView();
        }
        break;
      case '+':
      case '=':
        event.preventDefault();
        setScale(prev => Math.min(prev * 1.2, 3));
        break;
      case '-':
        event.preventDefault();
        setScale(prev => Math.max(prev * 0.8, 0.2));
        break;
    }
  }, [selectedIdea, onDelete, startConnecting, centerView]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle selecting nodes for connections
  const handleSelectIdea = (id: string) => {
    if (connectingFrom) {
      // If we're in connecting mode, create connection and exit the mode
      if (connectingFrom !== id) {
        onAddConnection(connectingFrom, id);
      }
      setConnectingFrom(null);
    } else {
      setSelectedIdea(id === selectedIdea ? null : id);
    }
  };

  // Remove a connection
  const removeConnection = (sourceId: string, targetId: string) => {
    onRemoveConnection(sourceId, targetId);
  };

  // Function to auto-arrange ideas in a radial layout
  const arrangeIdeasRadially = () => {
    if (ideas.length === 0) return;
    
    // Find the center idea (most connected or first idea if none)
    const centerIdea = ideas.reduce((prev, current) => 
      (current.connections.length > prev.connections.length) ? current : prev, ideas[0]);
    
    const centerX = 400; // Center of the canvas
    const centerY = 300;
    const radius = Math.min(ideas.length * 25, 300); // Adjust based on number of ideas
    
    // First, position the center idea
    onMoveIdea(centerIdea.id, { x: centerX, y: centerY });
    
    // Then position all other ideas in a circle around it
    const otherIdeas = ideas.filter(idea => idea.id !== centerIdea.id);
    const angleStep = (2 * Math.PI) / otherIdeas.length;
    
    otherIdeas.forEach((idea, index) => {
      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      onMoveIdea(idea.id, { x, y });
    });
    
    // Center the view on the arrangement
    centerView();
  };
  
  // Function to arrange ideas in a mind map tree layout
  const arrangeMindMapLayout = () => {
    if (ideas.length === 0) return;
    
    // Find or select a root idea (most connected or first)
    const rootIdea = ideas.reduce((prev, current) => 
      (current.connections.length > prev.connections.length) ? current : prev, ideas[0]);
    
    const centerX = 400;
    const centerY = 300;
    const horizontalGap = 200;
    const verticalGap = 100;
    
    // Position the root idea
    onMoveIdea(rootIdea.id, { x: centerX, y: centerY });
    
    // Helper function to get direct children
    const getDirectChildren = (parentId: string) => {
      return ideas.filter(idea => parentId !== idea.id && rootIdea.connections.includes(idea.id));
    };
    
    // Position first level children
    const firstLevelIdeas = getDirectChildren(rootIdea.id);
    const firstLevelStep = firstLevelIdeas.length > 0 ? verticalGap : 0;
    
    firstLevelIdeas.forEach((idea, index) => {
      const y = centerY - ((firstLevelIdeas.length - 1) * firstLevelStep / 2) + (index * firstLevelStep);
      onMoveIdea(idea.id, { x: centerX + horizontalGap, y });
    });
    
    // Center the view
    centerView();
  };
  
  return (
    <Box
      sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Control buttons */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Paper elevation={3} sx={{ p: 1 }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Zoom In">
            <IconButton onClick={() => setScale(s => Math.min(s * 1.2, 3))}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={() => setScale(s => Math.max(s * 0.8, 0.2))}>
              <span style={{ fontSize: '24px', lineHeight: '24px' }}>−</span>
            </IconButton>
          </Tooltip>
          <Tooltip title="Center View">
            <IconButton onClick={centerView}>
              <CenterFocusWeakIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        <Paper elevation={3} sx={{ p: 1 }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Arrange Radially">
            <IconButton onClick={arrangeIdeasRadially}>
              <RadioButtonCheckedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mind Map Layout">
            <IconButton onClick={arrangeMindMapLayout}>
              <AccountTreeIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        {selectedIdea && (
          <Paper elevation={3} sx={{ p: 1 }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Connect to another idea">
              <IconButton
                color={connectingFrom ? "secondary" : "default"}
                onClick={startConnecting}
              >
                <LinkIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        )}
      </Box>

      {/* The graph canvas */}
      <Box
        ref={graphRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '600px',
          backgroundColor: '#f9f9f9',
          overflow: 'hidden',
          cursor: hoveredConnection ? 'pointer' : (isPanning ? 'grabbing' : 'default'),
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={(e) => {
          e.stopPropagation();
          handleCanvasClick(e);
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Draw connections/edges first so they appear behind nodes */}
          {ideas.map(idea => (
            idea.connections.map(targetId => {
              const target = ideas.find(i => i.id === targetId);
              if (!target) return null;

              // Calculate midpoint of the connection for hover details
              const midpoint = {
                x: ((idea.position?.x || 0) + (target.position?.x || 0)) / 2,
                y: ((idea.position?.y || 0) + (target.position?.y || 0)) / 2
              };

              return (
                <Edge
                  key={`${idea.id}-${targetId}`}
                  start={idea.position || { x: 0, y: 0 }}
                  end={target.position || { x: 0, y: 0 }}
                  isSelected={selectedIdea === idea.id && target.connections.includes(idea.id)}
                  onClick={() => {
                    // Provide visual feedback and unlink
                    console.log(`Unlinked ${idea.title} ↔ ${target.title}`);
                    removeConnection(idea.id, targetId);
                    setHoveredConnection(null);
                  }}
                  isBidirectional={target.connections.includes(idea.id)}
                  onHover={(isHovering) => {
                    if (isHovering) {
                      setHoveredConnection({
                        source: idea,
                        target,
                        position: midpoint
                      });
                    } else if (hoveredConnection?.source.id === idea.id &&
                              hoveredConnection?.target.id === target.id) {
                      setHoveredConnection(null);
                    }
                  }}
                />
              );
            })
          ))}

          {/* Draw idea nodes */}
          {ideas.map(idea => (
            <IdeaNode
              key={idea.id}
              idea={idea}
              position={idea.position || { x: 0, y: 0 }}
              onMove={onMoveIdea}
              onSelect={handleSelectIdea}
              isSelected={selectedIdea === idea.id || connectingFrom === idea.id}
              onEdit={setEditingIdea}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onUnlink={handleUnlinkNode}
              scale={scale}
              panOffset={panOffset}
            />
          ))}
        </Box>
        
        {/* Connection guidance text */}
        {connectingFrom && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              zIndex: 1000,
            }}
          >
            <Typography variant="body2">
              Click another idea to connect, or click empty space to cancel
            </Typography>
          </Box>
        )}

        {/* Keyboard shortcuts hint */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            ⌨️ Del: Delete • Ctrl+C: Connect • Click Connections: Unlink • Ctrl+F: Center • +/-: Zoom • Esc: Cancel
          </Typography>
        </Box>
      </Box>

      {/* Connection hover details */}
      {hoveredConnection && (
        <Popper
          open={!!hoveredConnection}
          anchorEl={null}
          placement="top"
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, -10],
              },
            },
          ]}
          style={{
            position: 'absolute',
            left: (hoveredConnection.position.x + panOffset.x) * scale,
            top: (hoveredConnection.position.y + panOffset.y) * scale,
            zIndex: 1500,
          }}
        >
          <Fade in={!!hoveredConnection}>
            <Paper elevation={8} sx={{ p: 2, maxWidth: 350, border: '2px solid #ff5722' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ff5722' }}>
                🔗 Connection - Click to Unlink
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {hoveredConnection.source.title}
                </Typography>
                <ArrowRightAltIcon fontSize="small" color="error" />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {hoveredConnection.target.title}
                </Typography>
              </Box>

              {hoveredConnection.source.connections.includes(hoveredConnection.target.id) &&
               hoveredConnection.target.connections.includes(hoveredConnection.source.id) && (
                <Chip
                  label="Bidirectional"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}

              <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                Click the connection line to unlink these notes
              </Typography>
            </Paper>
          </Fade>
        </Popper>
      )}
      
      {/* Edit idea dialog */}
      <Dialog open={!!editingIdea} onClose={() => setEditingIdea(null)} maxWidth="md" fullWidth>
        {editingIdea && (
          <Box sx={{ p: 2 }}>
            <IdeaForm
              idea={editingIdea}
              onSubmit={(updatedIdeaData) => {
                onUpdate({
                  ...editingIdea,
                  ...updatedIdeaData,
                });
                setEditingIdea(null);
              }}
              onCancel={() => setEditingIdea(null)}
              categories={categories}
              ideas={ideas}
            />
          </Box>
        )}
      </Dialog>

      {/* Create new idea dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 2 }}>
          <IdeaForm
            onSubmit={(newIdeaData) => {
              onAddIdea(newIdeaData);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
            categories={categories}
            ideas={ideas}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default IdeaGraph; 