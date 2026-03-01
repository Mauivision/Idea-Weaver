import { useState, useCallback, useRef, useEffect } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(
  initialState: T,
  maxHistorySize: number = 50
) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const isUndoingRef = useRef(false);
  const isRedoingRef = useRef(false);

  // Update present state
  const setState = useCallback((newState: T) => {
    if (isUndoingRef.current || isRedoingRef.current) {
      return;
    }

    setHistory(prev => {
      const newPast = [...prev.past, prev.present].slice(-maxHistorySize);
      return {
        past: newPast,
        present: newState,
        future: []
      };
    });
  }, [maxHistorySize]);

  // Undo function
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      isUndoingRef.current = true;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      setTimeout(() => {
        isUndoingRef.current = false;
      }, 0);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);

  // Redo function
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      isRedoingRef.current = true;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      setTimeout(() => {
        isRedoingRef.current = false;
      }, 0);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory({
      past: [],
      present: history.present,
      future: []
    });
  }, [history.present]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  };
}

