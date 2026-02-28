import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Dialog,
  Tooltip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Slider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AutoGraph as AutoGraphIcon,
  AccountTree as AccountTreeIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea.tsx';
import IdeaForm from './IdeaForm.tsx';
import { motion } from 'framer-motion';

interface FlowChartProps {
  ideas: Idea[];
  onUpdate: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddConnection: (sourceId: string, targetId: string) => void;
  onRemoveConnection: (sourceId: string, targetId: string) => void;
  onMoveIdea: (id: string, position: { x: number; y: number }) => void;
  categories: string[];
  onAddIdea: (idea: Partial<Idea>) => void;
}

interface FlowNode {
  idea: Idea;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rectangle' | 'diamond' | 'oval' | 'parallelogram' | 'hexagon';
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;
const NODE_SPACING = 250;

// Auto-layout algorithm for flowchart
const autoLayoutFlowchart = (ideas: Idea[]): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>();
  
  if (ideas.length === 0) return positions;

  // Find root nodes (nodes with no incoming connections)
  const rootNodes = ideas.filter(idea => {
    // A node is a root if no other node connects to it
    return !ideas.some(other => other.connections.includes(idea.id));
  });

  // If no root nodes, use the first idea
  const startingNodes = rootNodes.length > 0 ? rootNodes : [ideas[0]];

  // Level-based layout
  const levels: Idea[][] = [];
  const processed = new Set<string>();

  // Build levels using BFS
  const queue: { idea: Idea; level: number }[] = startingNodes.map(idea => ({ idea, level: 0 }));
  
  while (queue.length > 0) {
    const { idea, level } = queue.shift()!;
    
    if (processed.has(idea.id)) continue;
    processed.add(idea.id);

    // Add to appropriate level
    if (!levels[level]) levels[level] = [];
    levels[level].push(idea);

    // Add connected nodes to next level
    idea.connections.forEach(targetId => {
      const target = ideas.find(i => i.id === targetId);
      if (target && !processed.has(target.id)) {
        queue.push({ idea: target, level: level + 1 });
      }
    });

    // Add nodes that connect to this one (reverse connections)
    ideas.forEach(other => {
      if (other.connections.includes(idea.id) && !processed.has(other.id)) {
        queue.push({ idea: other, level: level + 1 });
      }
    });
  }

  // Position nodes by level
  let startY = 100;
  levels.forEach((levelIdeas, levelIndex) => {
    const levelY = startY + levelIndex * NODE_SPACING;
    const levelWidth = levelIdeas.length * NODE_SPACING;
    const startX = Math.max(100, (window.innerWidth - levelWidth) / 2);

    levelIdeas.forEach((idea, index) => {
      const x = startX + index * NODE_SPACING;
      positions.set(idea.id, { x, y: levelY });
    });
  });

  // Position unprocessed nodes (isolated nodes)
  ideas.forEach(idea => {
    if (!positions.has(idea.id)) {
      const isolatedY = startY + levels.length * NODE_SPACING;
      const isolatedIndex = ideas.filter(i => !positions.has(i.id)).indexOf(idea);
      positions.set(idea.id, { 
        x: 100 + isolatedIndex * NODE_SPACING, 
        y: isolatedY 
      });
    }
  });

  return positions;
};

// Get node shape based on category
const getNodeShape = (category: string): FlowNode['shape'] => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('decision') || categoryLower.includes('question')) {
    return 'diamond';
  } else if (categoryLower.includes('start') || categoryLower.includes('end') || categoryLower.includes('terminate')) {
    return 'oval';
  } else if (categoryLower.includes('process') || categoryLower.includes('action')) {
    return 'rectangle';
  } else if (categoryLower.includes('input') || categoryLower.includes('output')) {
    return 'parallelogram';
  } else if (categoryLower.includes('preparation') || categoryLower.includes('subroutine')) {
    return 'hexagon';
  }
  
  return 'rectangle'; // Default
};

// Render SVG path for different shapes
const renderNodeShape = (
  shape: FlowNode['shape'],
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): React.ReactNode => {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  switch (shape) {
    case 'diamond':
      return (
        <polygon
          points={`${x},${y - halfHeight} ${x + halfWidth},${y} ${x},${y + halfHeight} ${x - halfWidth},${y}`}
          fill={color}
          stroke="#333"
          strokeWidth={2}
        />
      );
    case 'oval':
      return (
        <ellipse
          cx={x}
          cy={y}
          rx={halfWidth}
          ry={halfHeight}
          fill={color}
          stroke="#333"
          strokeWidth={2}
        />
      );
    case 'parallelogram':
      return (
        <polygon
          points={`${x - halfWidth + 20},${y - halfHeight} ${x + halfWidth},${y - halfHeight} ${x + halfWidth - 20},${y + halfHeight} ${x - halfWidth},${y + halfHeight}`}
          fill={color}
          stroke="#333"
          strokeWidth={2}
        />
      );
    case 'hexagon':
      return (
        <polygon
          points={`${x - halfWidth + 15},${y - halfHeight} ${x + halfWidth - 15},${y - halfHeight} ${x + halfWidth},${y} ${x + halfWidth - 15},${y + halfHeight} ${x - halfWidth + 15},${y + halfHeight} ${x - halfWidth},${y}`}
          fill={color}
          stroke="#333"
          strokeWidth={2}
        />
      );
    case 'rectangle':
    default:
      return (
        <rect
          x={x - halfWidth}
          y={y - halfHeight}
          width={width}
          height={height}
          fill={color}
          stroke="#333"
          strokeWidth={2}
          rx={8}
        />
      );
  }
};

const FlowChart: React.FC<FlowChartProps> = ({
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
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [autoLayout, setAutoLayout] = useState(true);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [shapeMode, setShapeMode] = useState<'auto' | 'rectangle' | 'diamond' | 'oval'>('auto');
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate node positions
  const nodePositions = useMemo(() => {
    if (autoLayout) {
      return autoLayoutFlowchart(ideas);
    } else {
      // Use existing positions
      const positions = new Map<string, { x: number; y: number }>();
      ideas.forEach(idea => {
        positions.set(idea.id, idea.position || { x: 200, y: 200 });
      });
      return positions;
    }
  }, [ideas, autoLayout]);

  // Get node info
  const flowNodes: FlowNode[] = useMemo(() => {
    return ideas.map(idea => {
      const pos = nodePositions.get(idea.id) || { x: 200, y: 200 };
      const shape = shapeMode === 'auto' 
        ? getNodeShape(idea.category) 
        : (shapeMode as FlowNode['shape']);
      
      return {
        idea,
        x: pos.x,
        y: pos.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        shape
      };
    });
  }, [ideas, nodePositions, shapeMode]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.3, Math.min(2, prev * delta)));
  }, []);

  // Handle panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setStartPanPoint({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPanPoint.x,
        y: e.clientY - startPanPoint.y
      });
    }
  }, [isPanning, startPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNode(null);
  }, []);

  // Handle node drag
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = flowNodes.find(n => n.idea.id === nodeId);
    if (node) {
      setDraggingNode(nodeId);
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - (node.x * scale + panOffset.x + rect.left),
          y: e.clientY - (node.y * scale + panOffset.y + rect.top)
        });
      }
    }
  }, [flowNodes, scale, panOffset]);

  useEffect(() => {
    if (draggingNode) {
      const handleMouseMove = (e: MouseEvent) => {
        const node = flowNodes.find(n => n.idea.id === draggingNode);
        if (node && svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const newX = (e.clientX - rect.left - panOffset.x - dragOffset.x) / scale;
          const newY = (e.clientY - rect.top - panOffset.y - dragOffset.y) / scale;
          onMoveIdea(draggingNode, { x: newX, y: newY });
        }
      };

      const handleMouseUp = () => {
        setDraggingNode(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingNode, flowNodes, panOffset, dragOffset, scale, onMoveIdea]);

  // Fit to screen
  const handleFitToScreen = useCallback(() => {
    if (flowNodes.length === 0) return;

    const bounds = flowNodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.x - node.width / 2),
        maxX: Math.max(acc.maxX, node.x + node.width / 2),
        minY: Math.min(acc.minY, node.y - node.height / 2),
        maxY: Math.max(acc.maxY, node.y + node.height / 2)
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

    const scaleX = (containerWidth * 0.9) / width;
    const scaleY = (containerHeight * 0.9) / height;
    const newScale = Math.min(scaleX, scaleY, 1.5);

    setScale(newScale);
    setPanOffset({
      x: containerWidth / 2 - ((bounds.minX + bounds.maxX) / 2) * newScale,
      y: containerHeight / 2 - ((bounds.minY + bounds.maxY) / 2) * newScale
    });
  }, [flowNodes]);

  // Get node color
  const getNodeColor = (idea: Idea): string => {
    if (idea.isFavorite) return '#ffd700';
    const colors: Record<string, string> = {
      'Uncategorized': '#e3f2fd',
      'Project': '#f3e5f5',
      'Task': '#fff3e0',
      'Note': '#e8f5e9',
      'Idea': '#fff9c4'
    };
    return colors[idea.category] || '#f5f5f5';
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Controls */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minWidth: 200
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={() => setScale(prev => Math.min(2, prev * 1.2))}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={() => setScale(prev => Math.max(0.3, prev * 0.8))}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit to Screen">
            <IconButton size="small" onClick={handleFitToScreen}>
              <FitScreenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Auto Layout">
            <IconButton size="small" onClick={() => setAutoLayout(!autoLayout)}>
              <AutoGraphIcon color={autoLayout ? 'primary' : 'inherit'} />
            </IconButton>
          </Tooltip>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={autoLayout}
              onChange={(e) => setAutoLayout(e.target.checked)}
              size="small"
            />
          }
          label="Auto Layout"
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Node Shape</InputLabel>
          <Select
            value={shapeMode}
            label="Node Shape"
            onChange={(e) => setShapeMode(e.target.value as any)}
          >
            <MenuItem value="auto">Auto (by Category)</MenuItem>
            <MenuItem value="rectangle">Rectangle</MenuItem>
            <MenuItem value="diamond">Diamond</MenuItem>
            <MenuItem value="oval">Oval</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          size="small"
        >
          Add Node
        </Button>
      </Paper>

      {/* SVG Canvas */}
      <Box
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          width: '100%',
          height: '100%',
          cursor: isPanning ? 'grabbing' : draggingNode ? 'move' : 'default',
          overflow: 'hidden'
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{
            background: 'radial-gradient(circle, #f5f5f5 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${scale})`}>
            {/* Draw connections */}
            {flowNodes.map(node => {
              return node.idea.connections.map(targetId => {
                const targetNode = flowNodes.find(n => n.idea.id === targetId);
                if (!targetNode) return null;

                const dx = targetNode.x - node.x;
                const dy = targetNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const unitX = dx / distance;
                const unitY = dy / distance;

                // Calculate connection points based on node shape
                const startX = node.x + unitX * (node.width / 2);
                const startY = node.y + unitY * (node.height / 2);
                const endX = targetNode.x - unitX * (targetNode.width / 2);
                const endY = targetNode.y - unitY * (targetNode.height / 2);

                return (
                  <motion.g
                    key={`${node.idea.id}-${targetId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#666"
                      strokeWidth={2}
                      markerEnd="url(#arrowhead)"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onRemoveConnection(node.idea.id, targetId)}
                    />
                  </motion.g>
                );
              });
            })}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#666" />
              </marker>
            </defs>

            {/* Draw nodes */}
            {flowNodes.map(node => (
              <motion.g
                key={node.idea.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <g
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{
                    cursor: draggingNode === node.idea.id ? 'move' : 'pointer'
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.idea.id)}
                  onClick={() => setSelectedIdea(node.idea.id)}
                >
                  {renderNodeShape(
                    node.shape,
                    0,
                    0,
                    node.width,
                    node.height,
                    getNodeColor(node.idea)
                  )}
                  
                  {/* Node content */}
                  <foreignObject
                    x={-node.width / 2 + 8}
                    y={-node.height / 2 + 8}
                    width={node.width - 16}
                    height={node.height - 16}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        padding: '4px'
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 'bold',
                          fontSize: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          marginBottom: '4px'
                        }}
                      >
                        {node.idea.title}
                      </div>
                      {node.idea.category !== 'Uncategorized' && (
                        <div
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            marginTop: '2px'
                          }}
                        >
                          {node.idea.category}
                        </div>
                      )}
                    </div>
                  </foreignObject>

                </g>
              </motion.g>
            ))}
          </g>
        </svg>
      </Box>

      {/* Node Actions Overlay - positioned absolutely */}
      {selectedIdea && (() => {
        const selectedNode = flowNodes.find(n => n.idea.id === selectedIdea);
        if (!selectedNode) return null;
        
        const screenX = selectedNode.x * scale + panOffset.x;
        const screenY = selectedNode.y * scale + panOffset.y - selectedNode.height / 2;

        return (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              left: `${screenX + selectedNode.width / 2 + 10}px`,
              top: `${screenY}px`,
              zIndex: 1000,
              display: 'flex',
              gap: 0.5,
              p: 0.5,
              transform: 'translateX(-50%)'
            }}
          >
            <IconButton
              size="small"
              onClick={() => setEditingIdea(selectedNode.idea)}
              title="Edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onToggleFavorite(selectedNode.idea.id)}
              title="Toggle Favorite"
            >
              {selectedNode.idea.isFavorite ? (
                <FavoriteIcon fontSize="small" color="error" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(selectedNode.idea.id)}
              title="Delete"
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Paper>
        );
      })()}

      {/* Edit Dialog */}
      <Dialog open={!!editingIdea} onClose={() => setEditingIdea(null)} maxWidth="sm" fullWidth>
        {editingIdea && (
          <Box sx={{ p: 3 }}>
            <IdeaForm
              idea={editingIdea}
              onSubmit={(ideaData) => {
                onUpdate({ ...editingIdea, ...ideaData, updatedAt: new Date() });
                setEditingIdea(null);
              }}
              onCancel={() => setEditingIdea(null)}
              categories={categories}
            />
          </Box>
        )}
      </Dialog>

      {/* Add Idea Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <IdeaForm
            onSubmit={(ideaData) => {
              const centerX = window.innerWidth / 2;
              const centerY = window.innerHeight / 2;
              const adjustedX = (centerX - panOffset.x) / scale;
              const adjustedY = (centerY - panOffset.y) / scale;
              
              onAddIdea({
                ...ideaData,
                position: { x: adjustedX, y: adjustedY }
              });
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
            categories={categories}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default FlowChart;

