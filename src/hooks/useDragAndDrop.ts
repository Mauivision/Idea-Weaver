import { useState, useCallback, useRef, useEffect } from 'react';

interface DragState {
  draggedId: string | null;
  dragOverId: string | null;
  insertPosition: 'before' | 'after' | null;
  dragOffset: { x: number; y: number };
}

interface UseDragAndDropOptions<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (reorderedItems: T[]) => void;
  enableInsertion?: boolean;
}

export function useDragAndDrop<T>({ 
  items, 
  getId, 
  onReorder,
  enableInsertion = true 
}: UseDragAndDropOptions<T>) {
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    dragOverId: null,
    insertPosition: null,
    dragOffset: { x: 0, y: 0 }
  });

  const dragElementRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Calculate drag offset for smooth movement
  const calculateDragOffset = useCallback((e: React.DragEvent) => {
    if (!dragElementRef.current) return { x: 0, y: 0 };
    
    const rect = dragElementRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    };
  }, []);

  // Handle drag start with smooth visual feedback
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    const target = e.currentTarget as HTMLElement;
    dragElementRef.current = target;
    
    // Calculate initial offset
    const offset = calculateDragOffset(e);
    
    setDragState({
      draggedId: itemId,
      dragOverId: null,
      insertPosition: null,
      dragOffset: offset
    });

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
    
    // Create custom drag image with better styling
    const dragImage = target.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.9';
    dragImage.style.transform = 'rotate(2deg) scale(0.95)';
    dragImage.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
    dragImage.style.pointerEvents = 'none';
    document.body.appendChild(dragImage);
    dragImage.style.position = 'absolute';
    dragImage.style.left = '-9999px';
    
    e.dataTransfer.setDragImage(dragImage, offset.x, offset.y);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);

    // Add visual feedback to dragged element
    requestAnimationFrame(() => {
      if (target) {
        target.style.opacity = '0.5';
        target.style.transform = 'rotate(2deg) scale(0.95)';
        target.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        target.style.zIndex = '1000';
      }
    });
  }, [calculateDragOffset]);

  // Handle drag end with smooth reset
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    
    // Smooth reset animation
    if (target) {
      requestAnimationFrame(() => {
        target.style.opacity = '1';
        target.style.transform = 'rotate(0deg) scale(1)';
        target.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        target.style.zIndex = '';
        
        // Reset after animation
        setTimeout(() => {
          target.style.transition = '';
        }, 300);
      });
    }

    // Reset drag state
    setDragState({
      draggedId: null,
      dragOverId: null,
      insertPosition: null,
      dragOffset: { x: 0, y: 0 }
    });
    
    dragElementRef.current = null;
    
    // Cancel animation frame if pending
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Handle drag over with insertion position detection
  const handleDragOver = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragState.draggedId || dragState.draggedId === itemId) {
      return;
    }

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const mouseY = e.clientY;
    const centerY = rect.top + rect.height / 2;
    
    // Determine insertion position (before or after)
    const insertPosition = mouseY < centerY ? 'before' : 'after';
    
    setDragState(prev => ({
      ...prev,
      dragOverId: itemId,
      insertPosition: enableInsertion ? insertPosition : null
    }));

    e.dataTransfer.dropEffect = 'move';
  }, [dragState.draggedId, enableInsertion]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    
    // Only clear if actually leaving the element bounds
    if (
      clientX < rect.left || 
      clientX > rect.right || 
      clientY < rect.top || 
      clientY > rect.bottom
    ) {
      setDragState(prev => ({
        ...prev,
        dragOverId: null,
        insertPosition: null
      }));
    }
  }, []);

  // Handle drop with smart reordering
  const handleDrop = useCallback((e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = dragState.draggedId || e.dataTransfer.getData('text/plain');
    
    if (!draggedId || draggedId === targetItemId || !onReorder) {
      return;
    }

    const draggedIndex = items.findIndex(item => getId(item) === draggedId);
    const targetIndex = items.findIndex(item => getId(item) === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Create new array with reordered items
    const newItems = [...items];
    
    if (enableInsertion && dragState.insertPosition) {
      // Insert-based reordering
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      
      // Adjust target index if dragged item was before target
      let adjustedTargetIndex = targetIndex;
      if (draggedIndex < targetIndex) {
        adjustedTargetIndex = dragState.insertPosition === 'before' 
          ? targetIndex 
          : targetIndex + 1;
      } else {
        adjustedTargetIndex = dragState.insertPosition === 'before' 
          ? targetIndex 
          : targetIndex + 1;
      }
      
      newItems.splice(adjustedTargetIndex, 0, draggedItem);
    } else {
      // Swap-based reordering (fallback)
      [newItems[draggedIndex], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[draggedIndex]
      ];
    }

    // Apply reordering with animation
    requestAnimationFrame(() => {
      onReorder(newItems);
    });

    // Reset drag state
    setDragState({
      draggedId: null,
      dragOverId: null,
      insertPosition: null,
      dragOffset: { x: 0, y: 0 }
    });
  }, [items, getId, onReorder, dragState, enableInsertion]);

  // Get drag state helpers
  const isDragging = dragState.draggedId !== null;
  const isDragged = useCallback((itemId: string) => dragState.draggedId === itemId, [dragState.draggedId]);
  const isDragOver = useCallback((itemId: string) => dragState.dragOverId === itemId, [dragState.dragOverId]);
  const getInsertPosition = useCallback((itemId: string) => {
    return dragState.dragOverId === itemId ? dragState.insertPosition : null;
  }, [dragState]);

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
    isDragged,
    isDragOver,
    getInsertPosition,
    dragState
  };
}

