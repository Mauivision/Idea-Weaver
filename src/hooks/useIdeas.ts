import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Idea, Note } from '../models/Idea';
import { recordCapture } from '../lib/streak';
import { playCaptureSound } from '../lib/sound';

const LOCAL_STORAGE_KEY = 'ideaWeaverIdeas';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseStoredDate = (value: unknown): Date => {
  const parsed = value instanceof Date || typeof value === 'string' || typeof value === 'number'
    ? new Date(value)
    : new Date();

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const parsePosition = (value: unknown): { x: number; y: number } | undefined => {
  if (!isRecord(value) || typeof value.x !== 'number' || typeof value.y !== 'number') {
    return undefined;
  }

  return { x: value.x, y: value.y };
};

const parseStoredNote = (value: unknown): Note | null => {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: typeof value.id === 'string' && value.id ? value.id : uuidv4(),
    content: typeof value.content === 'string' ? value.content : '',
    createdAt: parseStoredDate(value.createdAt),
    position: parsePosition(value.position),
  };
};

// Normalize persisted/imported data before the rest of the app reads it.
const parseDates = (value: unknown): Idea => {
  if (!isRecord(value)) {
    throw new Error('Invalid idea record');
  }

  const position = parsePosition(value.position);

  return {
    id: typeof value.id === 'string' && value.id ? value.id : uuidv4(),
    title: typeof value.title === 'string' ? value.title : '',
    description: typeof value.description === 'string' ? value.description : '',
    tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    category: typeof value.category === 'string' && value.category ? value.category : 'Uncategorized',
    feeling: typeof value.feeling === 'string' ? value.feeling : undefined,
    isFavorite: typeof value.isFavorite === 'boolean' ? value.isFavorite : false,
    isArchived: typeof value.isArchived === 'boolean' ? value.isArchived : false,
    createdAt: parseStoredDate(value.createdAt),
    updatedAt: parseStoredDate(value.updatedAt),
    notes: Array.isArray(value.notes)
      ? value.notes.map(parseStoredNote).filter((note): note is Note => note !== null)
      : [],
    position: position || { x: 0, y: 0 },
    connections: Array.isArray(value.connections)
      ? value.connections.filter((connection): connection is string => typeof connection === 'string')
      : [],
  };
};

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canPersist, setCanPersist] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

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
            setCanPersist(true);
          } else {
            console.error('Stored ideas are not in array format');
            setError('Failed to load your ideas. Please export a backup before making changes.');
            setCanPersist(false);
          }
        } else {
          setCanPersist(true);
        }
      } catch (error) {
        console.error('Error loading ideas from local storage:', error);
        setError('Failed to load your ideas. Please export a backup before making changes.');
        setCanPersist(false);
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, []);

  // Save ideas to local storage whenever they change
  useEffect(() => {
    if (!loading && canPersist) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ideas));
      } catch (error) {
        console.error('Error saving ideas to local storage:', error);
        setError('Failed to save your changes. Please check your browser storage settings.');
      }
    }
  }, [ideas, loading, canPersist]);

  // Add a new idea
  const addIdea = useCallback((idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => {
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
    setIdeas(prevIdeas => prevIdeas.map(idea => 
      idea.id === updatedIdea.id 
        ? { ...updatedIdea, updatedAt: new Date() } 
        : idea
    ));
  }, []);

  // Duplicate an idea (copy with new id, notes, position)
  const duplicateIdea = useCallback((idea: Idea) => {
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
    setIdeas(prevIdeas => prevIdeas.map(idea => 
      idea.id === id 
        ? { ...idea, isFavorite: !idea.isFavorite, updatedAt: new Date() } 
        : idea
    ));
  }, []);

  // Add a note to an idea
  const addNote = useCallback((ideaId: string, content: string, position?: { x: number; y: number }) => {
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
    setIdeas(prevIdeas => prevIdeas.map(idea =>
      idea.id === id ? { ...idea, isArchived: archived, updatedAt: new Date() } : idea
    ));
  }, []);

  const importIdeas = useCallback((importedIdeas: unknown[]) => {
    const processedIdeas = importedIdeas.reduce<Idea[]>((acc, importedIdea) => {
      try {
        const parsedIdea = parseDates(importedIdea);
        if (parsedIdea.title.trim().length > 0) {
          acc.push(parsedIdea);
        }
      } catch (error) {
        console.error('Skipping invalid imported idea:', error);
      }

      return acc;
    }, []);

    if (processedIdeas.length === 0) {
      return 0;
    }

    setIdeas(prevIdeas => {
      const importedIds = new Set(processedIdeas.map(idea => idea.id));
      return [
        ...prevIdeas.filter(idea => !importedIds.has(idea.id)),
        ...processedIdeas,
      ];
    });
    setCanPersist(true);

    return processedIdeas.length;
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
    addNote,
    deleteNote,
    updateNote,
    connectIdeas,
    disconnectIdeas,
    updateIdeaPosition,
    importIdeas,
    toggleViewMode
  };
}; 