import { Idea } from '../models/Idea';

export function exportIdeas(ideas: Idea[], format: 'json' | 'csv' | 'pdf') {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `idea-weaver-export-${timestamp}`;

  switch (format) {
    case 'json': {
      const jsonData = JSON.stringify(ideas, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);
      break;
    }
    case 'csv': {
      const headers = 'ID,Title,Description,Category,Tags,Favorite,Created,Updated\n';
      const rows = ideas.map(idea =>
        `"${idea.id}","${idea.title}","${idea.description || ''}","${idea.category}","${idea.tags.join(';')}","${idea.isFavorite}","${idea.createdAt.toISOString()}","${idea.updatedAt.toISOString()}"`
      ).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      break;
    }
    case 'pdf': {
      // Plain text export (labeled as PDF in UI for legacy; file is .txt)
      const content = `Idea Weaver Export - ${new Date().toLocaleDateString()}\n\n${ideas.map((idea, i) =>
        `${i + 1}. ${idea.title}\n   Category: ${idea.category}\n   Description: ${idea.description || 'No description'}\n   Tags: ${idea.tags.join(', ') || 'None'}\n   Favorite: ${idea.isFavorite ? 'Yes' : 'No'}\n   Created: ${idea.createdAt instanceof Date ? idea.createdAt.toLocaleDateString() : new Date(idea.createdAt).toLocaleDateString()}\n\n`
      ).join('')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      break;
    }
  }
}
