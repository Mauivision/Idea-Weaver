import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Idea, Note } from '../models/Idea.tsx';

const LOCAL_STORAGE_KEY = 'ideaWeaverIdeas';

// Helper to safely parse dates from JSON
const parseDates = (idea: any): Idea => ({
  ...idea,
  createdAt: new Date(idea.createdAt),
  updatedAt: new Date(idea.updatedAt),
  notes: Array.isArray(idea.notes) 
    ? idea.notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        position: note.position && typeof note.position.x === 'number' && typeof note.position.y === 'number'
          ? { x: note.position.x, y: note.position.y }
          : undefined
      }))
    : [],
  // Ensure connections exists even for older data
  connections: idea.connections || [],
  position: idea.position || { x: 0, y: 0 }
});

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          } else {
            // Handle invalid data format
            console.error('Stored ideas are not in array format');
            setIdeas([]);
          }
        }
      } catch (error) {
        console.error('Error loading ideas from local storage:', error);
        setError('Failed to load your ideas. Please try refreshing the page.');
        // Fallback to empty array on error
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, []);

  // Save ideas to local storage whenever they change
  useEffect(() => {
    if (!loading) {
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
    const now = new Date();
    const newIdea: Idea = {
      ...idea,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      notes: [],
      connections: [],
      position: idea.position || { x: Math.random() * 800, y: Math.random() * 600 }
    };
    
    setIdeas(prevIdeas => [...prevIdeas, newIdea]);
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

  return { 
    ideas, 
    loading,
    error,
    viewMode,
    addIdea, 
    updateIdea, 
    deleteIdea, 
    toggleFavorite,
    addNote,
    deleteNote,
    updateNote,
    connectIdeas,
    disconnectIdeas,
    updateIdeaPosition,
    toggleViewMode
  };
}; 