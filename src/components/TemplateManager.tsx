import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Rating,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share as ShareIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ContentCopy as ContentCopyIcon,
  Psychology as PsychologyIcon,
  Assignment as AssignmentIcon,
  AccountTree as AccountTreeIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Template } from '../models/Project.tsx';

interface TemplateManagerProps {
  onApplyTemplate: (template: Template) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onApplyTemplate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Product Development',
          description: 'Complete template for product development projects',
          category: 'Business',
          type: 'project',
          structure: {
            phases: ['Research', 'Design', 'Development', 'Testing', 'Launch'],
            tasks: [
              { name: 'Market Research', phase: 'Research', priority: 'high' },
              { name: 'User Personas', phase: 'Research', priority: 'medium' },
              { name: 'Wireframes', phase: 'Design', priority: 'high' },
              { name: 'Prototype', phase: 'Design', priority: 'medium' },
              { name: 'Frontend Development', phase: 'Development', priority: 'high' },
              { name: 'Backend Development', phase: 'Development', priority: 'high' },
              { name: 'Unit Testing', phase: 'Testing', priority: 'medium' },
              { name: 'User Testing', phase: 'Testing', priority: 'high' },
              { name: 'Launch Planning', phase: 'Launch', priority: 'high' }
            ],
            milestones: [
              { name: 'Research Complete', phase: 'Research' },
              { name: 'Design Approved', phase: 'Design' },
              { name: 'MVP Ready', phase: 'Development' },
              { name: 'Testing Complete', phase: 'Testing' },
              { name: 'Product Launched', phase: 'Launch' }
            ]
          },
          isPublic: true,
          createdBy: 'John Doe',
          createdAt: new Date('2024-01-01'),
          usageCount: 45,
          tags: ['product', 'development', 'agile', 'mvp']
        },
        {
          id: '2',
          name: 'Creative Brainstorming',
          description: 'Structured approach to creative brainstorming sessions',
          category: 'Creative',
          type: 'brainstorm',
          structure: {
            techniques: ['Free Association', 'SCAMPER', 'Mind Mapping', 'Six Thinking Hats'],
            phases: ['Preparation', 'Ideation', 'Evaluation', 'Implementation'],
            timeAllocation: {
              'Free Association': 15,
              'SCAMPER': 30,
              'Mind Mapping': 20,
              'Six Thinking Hats': 45
            }
          },
          isPublic: true,
          createdBy: 'Jane Smith',
          createdAt: new Date('2024-01-05'),
          usageCount: 32,
          tags: ['creativity', 'brainstorming', 'innovation', 'ideation']
        },
        {
          id: '3',
          name: 'Project Mind Map',
          description: 'Visual template for project planning and organization',
          category: 'Planning',
          type: 'mindmap',
          structure: {
            centralNode: 'Project Name',
            mainBranches: ['Goals', 'Resources', 'Timeline', 'Risks', 'Stakeholders'],
            subBranches: {
              'Goals': ['Primary', 'Secondary', 'Stretch'],
              'Resources': ['Human', 'Financial', 'Technical', 'Time'],
              'Timeline': ['Phase 1', 'Phase 2', 'Phase 3', 'Milestones'],
              'Risks': ['Technical', 'Financial', 'Market', 'Operational'],
              'Stakeholders': ['Internal', 'External', 'Customers', 'Partners']
            }
          },
          isPublic: false,
          createdBy: 'Mike Johnson',
          createdAt: new Date('2024-01-10'),
          usageCount: 18,
          tags: ['planning', 'visualization', 'organization', 'project']
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesPublic = !showPublicOnly || template.isPublic;
    
    return matchesSearch && matchesCategory && matchesType && matchesPublic;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const types = ['all', ...Array.from(new Set(templates.map(t => t.type)))];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <AssignmentIcon />;
      case 'brainstorm': return <PsychologyIcon />;
      case 'mindmap': return <AccountTreeIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const handleCreateTemplate = () => {
    setShowCreateDialog(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowEditDialog(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(template => template.id !== templateId));
    }
  };

  const handleApplyTemplate = (template: Template) => {
    onApplyTemplate(template);
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
  };

  const handleDuplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdBy: 'Current User',
      createdAt: new Date(),
      usageCount: 0,
      isPublic: false
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Template Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
        >
          Create Template
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {types.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPublicOnly}
                  onChange={(e) => setShowPublicOnly(e.target.checked)}
                />
              }
              label="Public Templates Only"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Templates Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading templates...</Typography>
        </Box>
      ) : filteredTemplates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No templates found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery || categoryFilter !== 'all' || typeFilter !== 'all' || showPublicOnly
              ? 'Try adjusting your search or filters'
              : 'Create your first template to get started'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTemplate}
          >
            Create Template
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(template.type)}
                      <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        {template.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {template.isPublic ? (
                        <Tooltip title="Public Template">
                          <PublicIcon color="primary" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Private Template">
                          <LockIcon color="action" />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {template.usageCount} uses
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {template.createdBy}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                    {template.tags.length > 3 && (
                      <Chip label={`+${template.tags.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption" color="text.secondary">
                      Created: {template.createdAt.toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  <Box>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      Apply
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Template Detail Dialog */}
      <Dialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedTemplate && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedTemplate.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={selectedTemplate.type}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={selectedTemplate.category}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedTemplate.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Created By</Typography>
                  <Typography variant="body2">{selectedTemplate.createdBy}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Usage Count</Typography>
                  <Typography variant="body2">{selectedTemplate.usageCount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Created Date</Typography>
                  <Typography variant="body2">{selectedTemplate.createdAt.toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Visibility</Typography>
                  <Typography variant="body2">
                    {selectedTemplate.isPublic ? 'Public' : 'Private'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedTemplate.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleApplyTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                }}
              >
                Apply Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a reusable template for projects, brainstorming sessions, or mind maps.
          </Typography>
          <Alert severity="info">
            Template creation form will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowCreateDialog(false);
              // TODO: Implement template creation
            }}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateManager;

