import React, { useMemo, useState } from 'react';

import {
  Assignment as AssignmentIcon,
  Description as NoteIcon,
  Folder as FolderIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import { Idea } from '../models/Idea';

interface ProjectManagerProps {
  ideas: Idea[];
}

interface IdeaCollection {
  id: string;
  name: string;
  description: string;
  ideas: Idea[];
  noteCount: number;
  favoriteCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UNCATEGORIZED_COLLECTION = 'Uncategorized';

function getCollectionSummary(ideas: Idea[]) {
  const noteCount = ideas.reduce((sum, idea) => sum + idea.notes.length, 0);
  const favoriteCount = ideas.filter((idea) => idea.isFavorite).length;
  const tags = Array.from(new Set(ideas.flatMap((idea) => idea.tags))).slice(0, 6);
  const sortedByCreated = [...ideas].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const sortedByUpdated = [...ideas].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return {
    noteCount,
    favoriteCount,
    tags,
    createdAt: sortedByCreated[0]?.createdAt ?? new Date(),
    updatedAt: sortedByUpdated[0]?.updatedAt ?? new Date(),
  };
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ ideas }) => {
  const [selectedCollection, setSelectedCollection] = useState<IdeaCollection | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const collections = useMemo<IdeaCollection[]>(() => {
    const grouped = new Map<string, Idea[]>();

    ideas.forEach((idea) => {
      const collectionName = idea.category?.trim() || UNCATEGORIZED_COLLECTION;
      grouped.set(collectionName, [...(grouped.get(collectionName) ?? []), idea]);
    });

    return Array.from(grouped.entries())
      .map(([name, collectionIdeas]) => {
        const summary = getCollectionSummary(collectionIdeas);
        return {
          id: name,
          name,
          description: `${collectionIdeas.length} idea${collectionIdeas.length !== 1 ? 's' : ''} and ${summary.noteCount} note${summary.noteCount !== 1 ? 's' : ''}`,
          ideas: collectionIdeas,
          ...summary,
        };
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [ideas]);

  const filteredCollections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return collections;

    return collections.filter((collection) => {
      const searchableText = [
        collection.name,
        collection.description,
        ...collection.tags,
        ...collection.ideas.flatMap((idea) => [
          idea.title,
          idea.description,
          idea.category,
          ...idea.tags,
          ...idea.notes.map((note) => note.content),
        ]),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [collections, searchQuery]);

  const handleOpenCollection = (collection: IdeaCollection) => {
    setSelectedCollection(collection);
    setActiveTab(0);
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Idea Collections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Projects are organized from your live idea collection and the notes inside each idea.
          </Typography>
        </Box>
        <Chip
          icon={<FolderIcon />}
          label={`${collections.length} collection${collections.length !== 1 ? 's' : ''}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search collections, ideas, tags, or note text..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          size="small"
        />
      </Paper>

      {filteredCollections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No idea collections found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? 'Try a different search term.'
              : 'Capture ideas and notes first; this view will organize them by category.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCollections.map((collection) => (
            <Grid item xs={12} sm={6} md={4} key={collection.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {collection.name}
                    </Typography>
                    {collection.favoriteCount > 0 && (
                      <Chip
                        icon={<StarIcon />}
                        label={collection.favoriteCount}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {collection.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip icon={<AssignmentIcon />} label={`${collection.ideas.length} ideas`} size="small" />
                    <Chip icon={<NoteIcon />} label={`${collection.noteCount} notes`} size="small" />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {collection.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Updated {collection.updatedAt.toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button size="small" variant="outlined" onClick={() => handleOpenCollection(collection)}>
                    View ideas and notes
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!selectedCollection} onClose={() => setSelectedCollection(null)} maxWidth="md" fullWidth>
        {selectedCollection && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedCollection.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCollection.description}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Overview" />
                <Tab label="Ideas & Notes" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h5">{selectedCollection.ideas.length}</Typography>
                      <Typography variant="body2" color="text.secondary">Ideas</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h5">{selectedCollection.noteCount}</Typography>
                      <Typography variant="body2" color="text.secondary">Notes</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h5">{selectedCollection.favoriteCount}</Typography>
                      <Typography variant="body2" color="text.secondary">Favorites</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <List disablePadding>
                  {selectedCollection.ideas.map((idea) => (
                    <ListItem key={idea.id} alignItems="flex-start" divider sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {idea.title}
                            </Typography>
                            <Chip label={`${idea.notes.length} note${idea.notes.length !== 1 ? 's' : ''}`} size="small" />
                          </Box>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'block', mt: 1 }}>
                            {idea.description && (
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {idea.description}
                              </Typography>
                            )}
                            {idea.notes.length > 0 ? (
                              idea.notes.map((note) => (
                                <Paper key={note.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {note.content || 'Empty note'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {note.createdAt.toLocaleDateString()}
                                  </Typography>
                                </Paper>
                              ))
                            ) : (
                              <Typography component="span" variant="body2" color="text.secondary">
                                No notes yet.
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCollection(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProjectManager;
