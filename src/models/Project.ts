export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  progress: number; // 0-100
  tags: string[];
  category: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  ideaIds: string[]; // Connected ideas
  tasks: Task[];
  milestones: Milestone[];
  teamMembers: TeamMember[];
  notes: ProjectNote[];
  attachments: Attachment[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  subtasks: Task[];
  dependencies: string[]; // Task IDs this task depends on
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  tasks: string[]; // Task IDs
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinedDate: Date;
  isActive: boolean;
}

export interface ProjectNote {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isImportant: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link' | 'image';
  url: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
}

export interface BrainstormSession {
  id: string;
  title: string;
  description: string;
  participants: string[];
  ideas: string[]; // Idea IDs
  techniques: BrainstormTechnique[];
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notes: string;
  outcomes: string[];
}

export interface BrainstormTechnique {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  instructions: string[];
  isActive: boolean;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'idea' | 'project' | 'task' | 'note';
  x: number;
  y: number;
  connections: string[];
  color?: string;
  size?: number;
  isExpanded: boolean;
  children: string[];
  parent?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'project' | 'brainstorm' | 'mindmap';
  structure: any; // Template structure
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  tags: string[];
}

