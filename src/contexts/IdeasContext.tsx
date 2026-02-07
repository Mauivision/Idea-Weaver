import React, { createContext, useContext, ReactNode } from 'react';
import { useIdeas } from '../hooks/useIdeas.ts';
import { Idea } from '../models/Idea.tsx';

interface IdeasContextType {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
  viewMode: 'list' | 'graph';
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'connections'>) => Idea;
  updateIdea: (idea: Idea) => void;
  deleteIdea: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addNote: (ideaId: string, content: string, position?: { x: number; y: number }) => void;
  deleteNote: (ideaId: string, noteId: string) => void;
  updateNote: (ideaId: string, noteId: string, updates: { content?: string; position?: { x: number; y: number } }) => void;
  connectIdeas: (sourceId: string, targetId: string) => void;
  disconnectIdeas: (sourceId: string, targetId: string) => void;
  updateIdeaPosition: (ideaId: string, position: { x: number, y: number }) => void;
  toggleViewMode: () => void;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export const IdeasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ideasHook = useIdeas();
  
  return (
    <IdeasContext.Provider value={ideasHook}>
      {children}
    </IdeasContext.Provider>
  );
};

export const useIdeasContext = (): IdeasContextType => {
  const context = useContext(IdeasContext);
  if (context === undefined) {
    throw new Error('useIdeasContext must be used within an IdeasProvider');
  }
  return context;
}; 