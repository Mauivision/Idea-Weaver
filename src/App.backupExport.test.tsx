import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';

import App from './App';
import { useIdeasContext } from './contexts/IdeasContext';
import { exportIdeas } from './lib/exportUtils';
import { Idea } from './models/Idea';

jest.mock('./contexts/IdeasContext', () => ({
  useIdeasContext: jest.fn(),
}));

jest.mock('./lib/exportUtils', () => ({
  exportIdeas: jest.fn(),
}));

jest.mock('./components/EnhancedHeader', () => {
  return function MockEnhancedHeader({
    onExport,
  }: {
    onExport: (format: 'json' | 'csv' | 'pdf') => void;
  }) {
    return (
      <button type="button" data-testid="header-export-json" onClick={() => onExport('json')}>
        Export JSON
      </button>
    );
  };
});

jest.mock('./components/NoteGridBoard', () => {
  return function MockNoteGridBoard({
    onAddConnection,
    onRemoveConnection,
  }: {
    onAddConnection?: unknown;
    onRemoveConnection?: unknown;
  }) {
    return (
      <div
        data-testid="note-grid-board"
        data-has-add-connection={String(Boolean(onAddConnection))}
        data-has-remove-connection={String(Boolean(onRemoveConnection))}
      />
    );
  };
});

jest.mock('./components/DataExportImport', () => {
  return function MockDataExportImport({ ideas }: { ideas: Idea[] }) {
    return <div data-testid="data-export-import-count">{ideas.length}</div>;
  };
});

jest.mock('./components/IdeaList', () => () => <div />);
jest.mock('./components/IdeaGraph', () => () => <div />);
jest.mock('./components/ProjectManager', () => () => <div />);
jest.mock('./components/BrainstormSession', () => () => <div />);
jest.mock('./components/EnhancedMindMap', () => () => <div />);
jest.mock('./components/AnalyticsDashboard', () => () => <div />);
jest.mock('./components/FlowChart', () => () => <div />);
jest.mock('./components/AdvancedSearch', () => () => <div />);
jest.mock('./components/BulkOperations', () => () => <div />);
jest.mock('./components/KeyboardShortcutsHelp', () => () => <div />);
jest.mock('./components/LoadingSkeleton', () => () => <div />);
jest.mock('./components/DuplicateDetection', () => () => <div />);
jest.mock('./components/SmartLinking', () => () => <div />);
jest.mock('./components/IdeaTemplates', () => () => <div />);
jest.mock('./components/ArchiveDialog', () => () => <div />);
jest.mock('./components/IdeaWeave', () => () => <div />);
jest.mock('./components/AutosaveIndicator', () => () => <div />);
jest.mock('./components/PwaInstallPrompt', () => () => <div />);
jest.mock('./components/IdeaSprite', () => ({
  __esModule: true,
  default: () => <div />,
  getEncouragement: () => 'Keep going',
}));
jest.mock('./components/VoiceInputFab', () => () => <div />);
jest.mock('./lib/streak', () => ({
  getStreak: () => null,
}));
jest.mock('./lib/sound', () => ({
  getSoundOn: () => true,
  setSoundOn: jest.fn(),
}));

const mockUseIdeasContext = useIdeasContext as jest.MockedFunction<typeof useIdeasContext>;
const mockExportIdeas = exportIdeas as jest.MockedFunction<typeof exportIdeas>;

function makeIdea(overrides: Partial<Idea>): Idea {
  return {
    id: 'idea-1',
    title: 'Active idea',
    description: '',
    tags: [],
    category: 'Uncategorized',
    isFavorite: false,
    isArchived: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    notes: [],
    connections: [],
    ...overrides,
  };
}

describe('App backup export', () => {
  let container: HTMLDivElement;
  let root: Root;

  const activeIdea = makeIdea({ id: 'active-idea' });
  const archivedIdea = makeIdea({
    id: 'archived-idea',
    title: 'Archived idea',
    isArchived: true,
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();

    mockUseIdeasContext.mockReturnValue({
      ideas: [activeIdea],
      allIdeas: [activeIdea, archivedIdea],
      archivedIdeas: [archivedIdea],
      loading: false,
      error: null,
      viewMode: 'list',
      addIdea: jest.fn(),
      updateIdea: jest.fn(),
      duplicateIdea: jest.fn(),
      deleteIdea: jest.fn(),
      toggleFavorite: jest.fn(),
      setIdeaArchived: jest.fn(),
      addNote: jest.fn(),
      deleteNote: jest.fn(),
      updateNote: jest.fn(),
      connectIdeas: jest.fn(),
      disconnectIdeas: jest.fn(),
      updateIdeaPosition: jest.fn(),
      toggleViewMode: jest.fn(),
    });
  });

  afterEach(() => {
    flushSync(() => {
      root.unmount();
    });
    container.remove();
  });

  it('uses all persisted ideas for backup/export paths', () => {
    flushSync(() => {
      root.render(<App />);
    });

    const exportButton = container.querySelector('[data-testid="header-export-json"]');
    expect(exportButton).not.toBeNull();

    flushSync(() => {
      exportButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockExportIdeas).toHaveBeenCalledWith([activeIdea, archivedIdea], 'json');
    expect(container.querySelector('[data-testid="data-export-import-count"]')?.textContent).toBe('2');
  });

  it('passes board connection callbacks to the default board view', () => {
    flushSync(() => {
      root.render(<App />);
    });

    const board = container.querySelector('[data-testid="note-grid-board"]');
    expect(board?.getAttribute('data-has-add-connection')).toBe('true');
    expect(board?.getAttribute('data-has-remove-connection')).toBe('true');
  });
});
