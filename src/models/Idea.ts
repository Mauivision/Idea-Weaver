export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  notes: Note[];
  position?: { x: number; y: number };
  connections: string[]; // IDs of connected ideas
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  position?: { x: number; y: number };
}

// Initial idea template
export const createEmptyIdea = (): Idea => ({
  id: '',
  title: '',
  description: '',
  tags: [],
  category: 'Uncategorized',
  isFavorite: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  notes: [],
  position: { x: 0, y: 0 },
  connections: []
}); 