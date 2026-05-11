import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Idea, Note } from '../models/Idea';
import { recordCapture } from '../lib/streak';
import { playCaptureSound } from '../lib/sound';

const LOCAL_STORAGE_KEY = 'ideaWeaverIdeas';

const parseDate = (value: unknown, fallback: Date): Date => {
  const parsed = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const parsePosition = (position: unknown): { x: number; y: number } | undefined => {
  if (!position || typeof position !== 'object') {
    return undefined;
  }

  const point = position as { x?: unknown; y?: unknown };
  return typeof point.x === 'number' && Number.isFinite(point.x) && typeof point.y === 'number' && Number.isFinite(point.y)
    ? { x: point.x, y: point.y }
    : undefined;
};

// Helper to safely parse dates from JSON
const parseDates = (idea: any): Idea => ({
  ...idea,
  tags: Array.isArray(idea.tags) ? idea.tags.filter((tag: unknown): tag is string => typeof tag === 'string') : [],
  isFavorite: Boolean(idea.isFavorite),
  isArchived: idea.isArchived ?? false,
  createdAt: parseDate(idea.createdAt, new Date()),
  updatedAt: parseDate(idea.updatedAt, new Date()),
  notes: Array.isArray(idea.notes) 
    ? idea.notes.map((note: any) => ({
        ...note,
        id: typeof note.id === 'string' && note.id.trim() ? note.id : uuidv4(),
        content: typeof note.content === 'string' ? note.content : '',
        createdAt: parseDate(note.createdAt, new Date()),
        position: parsePosition(note.position)
      }))
    : [],
  connections: Array.isArray(idea.connections)
    ? idea.connections.filter((connectionId: unknown): connectionId is string => typeof connectionId === 'string')
    : [],
  position: parsePosition(idea.position) || { x: 0, y: 0 }
});

const normalizeImportedIdea = (idea: Idea, id: string, now: Date): Idea => ({
  id,
  title: idea.title,
  description: idea.description || '',
  tags: Array.isArray(idea.tags) ? idea.tags.filter((tag): tag is string => typeof tag === 'string') : [],
  category: idea.category || 'Uncategorized',
  feeling: typeof idea.feeling === 'string' ? idea.feeling : undefined,
  isFavorite: Boolean(idea.isFavorite),
  isArchived: Boolean(idea.isArchived),
  createdAt: parseDate(idea.createdAt, now),
  updatedAt: parseDate(idea.updatedAt, now),
  notes: Array.isArray(idea.notes)
    ? idea.notes.map((note) => ({
        id: typeof note.id === 'string' && note.id.trim() ? note.id : uuidv4(),
        content: typeof note.content === 'string' ? note.content : '',
        createdAt: parseDate(note.createdAt, now),
        position: parsePosition(note.position),
      }))
    : [],
  position: parsePosition(idea.position) || { x: 0, y: 0 },
  connections: Array.isArray(idea.connections)
    ? idea.connections.filter((connectionId): connectionId is string => typeof connectionId === 'string')
    : [],
});

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const isPersistenceBlockedRef = useRef(false);

  // Load ideas from local storage
  useEffect(() => {
    const loadIdeas = () => {
      setLoading(true);
      setError(null);
      
      try {
        const storedIdeas = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (storedIdeas) {
          const parsedIdeas = JSON.parse(storedIdeas);
          
          // Validate and convert dates
          if (Array.isArray(parsedIdeas)) {
            const processedIdeas = parsedIdeas.map(parseDates);
            setIdeas(processedIdeas);
          } else {
            // Handle invalid data format
            console.error('Stored ideas are not in array format');
            isPersistenceBlockedRef.current = true;
            setError('Failed to load your ideas. Please export your browser data before making changes.');
            setIdeas([]);
          }
        }
      } catch (error) {
        console.error('Error loading ideas from local storage:', error);
        setError('Failed to load your ideas. Please try refreshing the page.');
        isPersistenceBlockedRef.current = true;
        // Keep the corrupt/unreadable storage value intact until the user makes an explicit edit.
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, []);

  // Save ideas to local storage whenever they change
  useEffect(() => {
    if (!loading && !isPersistenceBlockedRef.current) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ideas));
      } catch (error) {
        console.error('Error saving ideas to local storage:', error);
        setError('Failed to save your changes. Please check your browser storage settings.');
      }
    }
  }, [ideas, loading]);

  // Add a new idea
  const addIdea = useCallback((idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => {
    isPersistenceBlockedRef.current = false;
    const now = new Date();
    const newIdea: Idea = {
      ...idea,
      id: uuidv4(),
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      notes: [],
      connections: [],
      position: idea.position || { x: Math.random() * 800, y: Math.random() * 600 }
    };
    setIdeas(prevIdeas => [...prevIdeas, newIdea]);
    recordCapture();
    playCaptureSound();
    return newIdea;
  }, []);

  // Update an existing idea
  const updateIdea = useCallback((updatedIdea: Idea) => {
    isPersistenceBlockedRef.current = false;
    setIdeas(prevIdeas => prevIdeas.map(idea => 
      idea.id === updatedIdea.id 
        ? { ...updatedIdea, updatedAt: new Date() } 
        : idea
    ));
  }, []);

  // Duplicate an idea (copy with new id, notes, position)
  const duplicateIdea = useCallback((idea: Idea) => {
    isPersistenceBlockedRef.current = false;
    const now = new Date();
    const newNotes = idea.notes.map(n => ({
      ...n,
      id: uuidv4(),
      createdAt: now,
    }));
    const newIdea: Idea = {
      ...idea,
      id: uuidv4(),
      title: `${idea.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      notes: newNotes,
      connections: [],
      position: {
        x: (idea.position?.x ?? 0) + 40,
        y: (idea.position?.y ?? 0) + 40,
      },
    };
    setIdeas(prevIdeas => [...prevIdeas, newIdea]);
    return newIdea;
  }, []);

  // Delete an idea
  const deleteIdea = useCallback((id: string) => {
    isPersistenceBlockedRef.current = false;
    // First remove any connections to this idea
    setIdeas(prevIdeas => {
      const updatedIdeas = prevIdeas.map(idea => ({
        ...idea,
        connections: idea.connections.filter(connId => connId !== id)
      }));
      
      // Then remove the idea itself
      return updatedIdeas.filter(idea => idea.id !== id);
    });
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((id: string) => {
    isPersistenceBlockedRef.current = false;
    setIdeas(prevIdeas => prevIdeas.map(idea => 
      idea.id === id 
        ? { ...idea, isFavorite: !idea.isFavorite, updatedAt: new Date() } 
        : idea
    ));
  }, []);

  // Add a note to an idea
  const addNote = useCallback((ideaId: string, content: string, position?: { x: number; y: number }) => {
    isPersistenceBlockedRef.current = false;
    const newNote: Note = {
      id: uuidv4(),
      content,
      createdAt: new Date(),
      ...(position && { position })
    };

    setIdeas(prevIdeas => prevIdeas.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            notes: [...idea.notes, newNote],
            updatedAt: new Date()
          } 
        : idea
    ));
    recordCapture();
    playCaptureSound();
    return newNote;
  }, []);

  // Update a note (e.g. position or content)
  const updateNote = useCallback((ideaId: string, noteId: string, updates: Partial<Pick<Note, 'content' | 'position'>>) => {
    isPersistenceBlockedRef.current = false;
    setIdeas(prevIdeas => prevIdeas.map(idea => {
      if (idea.id !== ideaId) return idea;
      return {
        ...idea,
        notes: idea.notes.map(n => 
          n.id === noteId ? { ...n, ...updates } : n
        ),
        updatedAt: new Date()
      };
    }));
  }, []);

  // Delete a note from an idea
  const deleteNote = useCallback((ideaId: string, noteId: string) => {
    isPersistenceBlockedRef.current = false;
    setIdeas(prevIdeas => prevIdeas.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            notes: idea.notes.filter(note => note.id !== noteId),
            updatedAt: new Date()
          } 
        : idea
    ));
  }, []);

  // Connect two ideas
  const connectIdeas = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return; // Don't connect to self
    isPersistenceBlockedRef.current = false;
    
    setIdeas(prevIdeas => {
      return prevIdeas.map(idea => {
        if (idea.id === sourceId && !idea.connections.includes(targetId)) {
          // Add connection to source idea
          return {
            ...idea,
            connections: [...idea.connections, targetId],
            updatedAt: new Date()
          };
        }
        return idea;
      });
    });
  }, []);

  // Disconnect two ideas
  const disconnectIdeas = useCallback((sourceId: string, targetId: string) => {
    isPersistenceBlockedRef.current = false;
    setIdeas(prevIdeas => {
      return prevIdeas.map(idea => {
        if (idea.id === sourceId) {
          // Remove connection from source idea
          return {
            ...idea,
            connections: idea.connections.filter(id => id !== targetId),
            updatedAt: new Date()
          };
        }
        return idea;
      });
    });
  }, []);

  // Update idea position in the graph view
  const updateIdeaPosition = useCallback((ideaId: string, position: { x: number, y: number }) => {
    isPersistenceBlockedRef.current = false;
    setIdeas(prevIdeas => {
      return prevIdeas.map(idea => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            position,
            updatedAt: new Date()
          };
        }
        return idea;
      });
    });
  }, []);

  // Toggle between list and graph view
  const toggleViewMode = useCallback(() => {
    setViewMode(current => current === 'list' ? 'graph' : 'list');
  }, []);

  // Archive / unarchive an idea
  const setIdeaArchived = useCallback((id: string, archived: boolean) => {
    isPersistenceBlockedRef.current = false;
    setIdeas(prevIdeas => prevIdeas.map(idea =>
      idea.id === id ? { ...idea, isArchived: archived, updatedAt: new Date() } : idea
    ));
  }, []);

  const importIdeas = useCallback((importedIdeas: Idea[]) => {
    isPersistenceBlockedRef.current = false;
    setIdeas(prevIdeas => {
      const existingIds = new Set(prevIdeas.map(idea => idea.id));
      const idMap = new Map<string, string>();
      const now = new Date();

      const normalizedIdeas = importedIdeas.reduce<Idea[]>((acc, idea) => {
        if (!idea.title || !idea.category) {
          return acc;
        }

        const sourceId = typeof idea.id === 'string' && idea.id.trim() ? idea.id : uuidv4();
        const id = existingIds.has(sourceId) || idMap.has(sourceId) ? uuidv4() : sourceId;
        existingIds.add(id);
        idMap.set(sourceId, id);
        acc.push(normalizeImportedIdea(idea, id, now));
        return acc;
      }, []);

      const availableIds = new Set([...prevIdeas.map(idea => idea.id), ...normalizedIdeas.map(idea => idea.id)]);
      const remappedIdeas = normalizedIdeas.map(idea => ({
        ...idea,
        connections: idea.connections
          .map(connectionId => idMap.get(connectionId) || connectionId)
          .filter(connectionId => availableIds.has(connectionId)),
      }));

      return [...prevIdeas, ...remappedIdeas];
    });
  }, []);

  const activeIdeas = ideas.filter(idea => !idea.isArchived);
  const archivedIdeas = ideas.filter(idea => idea.isArchived);

  return { 
    ideas: activeIdeas, 
    allIdeas: ideas,
    archivedIdeas,
    loading,
    error,
    viewMode,
    addIdea, 
    updateIdea, 
    duplicateIdea,
    deleteIdea, 
    toggleFavorite,
    setIdeaArchived,
    importIdeas,
    addNote,
    deleteNote,
    updateNote,
    connectIdeas,
    disconnectIdeas,
    updateIdeaPosition,
    toggleViewMode
  };
}; 