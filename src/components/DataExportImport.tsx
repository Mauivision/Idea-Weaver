import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Grow,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Close as CloseIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea';

interface DataExportImportProps {
  ideas: Idea[];
  onImport: (ideas: Idea[]) => void;
}

const DataExportImport: React.FC<DataExportImportProps> = ({ ideas, onImport }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(ideas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idea-weaver-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Category', 'Tags', 'Favorite', 'Created', 'Updated', 'Connections', 'Notes Count'];
    const rows = ideas.map(idea => [
      idea.id,
      `"${idea.title.replace(/"/g, '""')}"`,
      `"${(idea.description || '').replace(/"/g, '""')}"`,
      idea.category,
      idea.tags.join(';'),
      idea.isFavorite ? 'Yes' : 'No',
      idea.createdAt.toISOString(),
      idea.updatedAt.toISOString(),
      idea.connections.join(';'),
      idea.notes.length.toString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idea-weaver-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        
        if (!Array.isArray(imported)) {
          throw new Error('Invalid file format');
        }

        // Validate imported data
        const validIdeas = imported.filter((idea: any) => 
          idea.id && idea.title && idea.category
        );

        if (validIdeas.length === 0) {
          throw new Error('No valid ideas found in file');
        }

        // Merge with existing (or replace - user choice)
        if (window.confirm(`Import ${validIdeas.length} ideas? This will add them to your existing ideas.`)) {
          onImport(validIdeas);
          setImportError(null);
          setShowDialog(false);
        }
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to import file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={() => setShowDialog(true)}
        sx={{
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { transform: 'scale(1.03)', boxShadow: 2 },
        }}
      >
        Export/Import
      </Button>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 260 }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ mr: 1 }} />
              Data Export & Import
            </Box>
            <Button
              onClick={() => setShowDialog(false)}
              size="small"
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}

          <Typography variant="h6" gutterBottom>
            Export Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download your ideas in various formats
          </Typography>

          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleExportJSON}>
                <ListItemText
                  primary="Export as JSON"
                  secondary="Full data with all properties (recommended)"
                />
                <FileDownloadIcon />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleExportCSV}>
                <ListItemText
                  primary="Export as CSV"
                  secondary="Spreadsheet-compatible format"
                />
                <FileDownloadIcon />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Import Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import ideas from a JSON file
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <Button
            variant="contained"
            fullWidth
            startIcon={<FileUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose JSON File to Import
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DataExportImport;

