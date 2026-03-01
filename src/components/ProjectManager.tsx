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
  LinearProgress,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Project } from '../models/Project';
import { Idea } from '../models/Idea';

interface ProjectManagerProps {
  ideas: Idea[];
  onConnectIdea: (projectId: string, ideaId: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ ideas, onConnectIdea }) => {
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('sm'));
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by setShowEditDialog
  const [, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Mobile App Development',
          description: 'Building a revolutionary mobile application for idea management',
          status: 'active',
          priority: 'high',
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-06-30'),
          progress: 65,
          tags: ['mobile', 'react-native', 'innovation'],
          category: 'Development',
          isFavorite: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          ideaIds: ['idea1', 'idea2'],
          tasks: [
            {
              id: 'task1',
              title: 'Design UI/UX',
              description: 'Create wireframes and mockups',
              status: 'completed',
              priority: 'high',
              dueDate: new Date('2024-01-15'),
              completedDate: new Date('2024-01-14'),
              estimatedHours: 40,
              actualHours: 42,
              tags: ['design', 'ui'],
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-14'),
              subtasks: [],
              dependencies: []
            },
            {
              id: 'task2',
              title: 'Implement Authentication',
              description: 'Set up user authentication system',
              status: 'in-progress',
              priority: 'high',
              dueDate: new Date('2024-02-01'),
              estimatedHours: 20,
              tags: ['backend', 'security'],
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-15'),
              subtasks: [],
              dependencies: ['task1']
            }
          ],
          milestones: [
            {
              id: 'milestone1',
              title: 'MVP Launch',
              description: 'Minimum viable product ready for testing',
              dueDate: new Date('2024-03-31'),
              status: 'upcoming',
              tasks: ['task1', 'task2']
            }
          ],
          teamMembers: [
            {
              id: 'member1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'Lead Developer',
              joinedDate: new Date('2024-01-01'),
              isActive: true
            }
          ],
          notes: [],
          attachments: []
        }
      ];
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'default';
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'on-hold': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <ScheduleIcon />;
      case 'active': return <PlayArrowIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'on-hold': return <PauseIcon />;
      case 'cancelled': return <StopIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const handleCreateProject = () => {
    setShowCreateDialog(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(project => project.id !== projectId));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for status dropdown
  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            status: newStatus as any,
            completedDate: newStatus === 'completed' ? new Date() : undefined,
            updatedAt: new Date()
          }
        : project
    ));
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
          Project Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
        >
          New Project
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on-hold">On Hold</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading projects...</Typography>
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first project to get started'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
          >
            Create Project
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                      {project.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status)}
                        size="small"
                        icon={getStatusIcon(project.status)}
                      />
                      <Chip
                        label={project.priority}
                        color={getPriorityColor(project.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{project.progress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      color={project.progress > 80 ? 'success' : project.progress > 50 ? 'primary' : 'warning'}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GroupIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AssignmentIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                    {project.tags.length > 3 && (
                      <Chip label={`+${project.tags.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>
                  
                  {project.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary">
                        Due: {project.dueDate.toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditProject(project)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  <Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setSelectedProject(project)}
                    >
                      View
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Project Detail Dialog */}
      <Dialog
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedProject.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={selectedProject.status}
                    color={getStatusColor(selectedProject.status)}
                    size="small"
                  />
                  <Chip
                    label={selectedProject.priority}
                    color={getPriorityColor(selectedProject.priority)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Overview" />
                <Tab label="Tasks" />
                <Tab label="Team" />
                <Tab label="Ideas" />
              </Tabs>
              
              <TabPanel value={activeTab} index={0}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedProject.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Progress</Typography>
                  <LinearProgress variant="determinate" value={selectedProject.progress} />
                  <Typography variant="caption">{selectedProject.progress}% complete</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Start Date</Typography>
                    <Typography variant="body2">
                      {selectedProject.startDate?.toLocaleDateString() || 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Due Date</Typography>
                    <Typography variant="body2">
                      {selectedProject.dueDate?.toLocaleDateString() || 'Not set'}
                    </Typography>
                  </Grid>
                </Grid>
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                <List>
                  {selectedProject.tasks.map((task) => (
                    <ListItem key={task.id}>
                      <ListItemText
                        primary={task.title}
                        secondary={task.description}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={task.status}
                          size="small"
                          color={task.status === 'completed' ? 'success' : 'default'}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
              
              <TabPanel value={activeTab} index={2}>
                <List>
                  {selectedProject.teamMembers.map((member) => (
                    <ListItem key={member.id}>
                      <Avatar sx={{ mr: 2 }}>
                        {member.name.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={member.name}
                        secondary={member.role}
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
              
              <TabPanel value={activeTab} index={3}>
                <Typography variant="body2" color="text.secondary">
                  Connected ideas will appear here. You can connect ideas from the main idea list.
                </Typography>
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedProject(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by creating a new project. You can connect ideas and manage tasks later.
          </Typography>
          <Alert severity="info">
            This will redirect you to the project creation form.
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
              // TODO: Implement project creation form
            }}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManager;

