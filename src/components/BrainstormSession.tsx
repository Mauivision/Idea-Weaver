import React, { useState, useEffect, useRef } from 'react';
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
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Tooltip,
  Fab,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  Group as GroupIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Note as NoteIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { BrainstormSession, BrainstormTechnique } from '../models/Project.tsx';
import { Idea } from '../models/Idea.tsx';

interface BrainstormSessionProps {
  ideas: Idea[];
  onAddIdea: (idea: Partial<Idea>) => void;
}

const BRAINSTORM_TECHNIQUES: BrainstormTechnique[] = [
  {
    id: '1',
    name: 'Free Association',
    description: 'Generate ideas by freely associating words and concepts',
    duration: 10,
    instructions: [
      'Start with a central concept or problem',
      'Write down the first word that comes to mind',
      'Continue associating from that word',
      'Don\'t judge or filter ideas',
      'Keep going for the full duration'
    ],
    isActive: false
  },
  {
    id: '2',
    name: 'SCAMPER',
    description: 'Systematic approach to creative thinking using 7 techniques',
    duration: 20,
    instructions: [
      'Substitute: What can be substituted?',
      'Combine: What can be combined?',
      'Adapt: What can be adapted?',
      'Modify: What can be modified?',
      'Put to other uses: What other uses?',
      'Eliminate: What can be eliminated?',
      'Reverse: What can be reversed?'
    ],
    isActive: false
  },
  {
    id: '3',
    name: 'Mind Mapping',
    description: 'Visual technique to organize and connect ideas',
    duration: 15,
    instructions: [
      'Start with a central topic in the center',
      'Branch out with main categories',
      'Add sub-branches for details',
      'Use colors and images',
      'Connect related ideas with lines'
    ],
    isActive: false
  },
  {
    id: '4',
    name: 'Six Thinking Hats',
    description: 'Parallel thinking using different perspectives',
    duration: 30,
    instructions: [
      'White Hat: Facts and information',
      'Red Hat: Emotions and feelings',
      'Black Hat: Critical thinking and caution',
      'Yellow Hat: Optimism and benefits',
      'Green Hat: Creativity and alternatives',
      'Blue Hat: Process control and overview'
    ],
    isActive: false
  },
  {
    id: '5',
    name: 'Random Word',
    description: 'Use random words to spark new ideas',
    duration: 10,
    instructions: [
      'Generate a random word',
      'Connect it to your problem',
      'Think of how they relate',
      'Generate ideas from the connection',
      'Repeat with new random words'
    ],
    isActive: false
  }
];

const BrainstormSessionComponent: React.FC<BrainstormSessionProps> = ({ ideas, onAddIdea }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sessions, setSessions] = useState<BrainstormSession[]>([]);
  const [currentSession, setCurrentSession] = useState<BrainstormSession | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTechniqueDialog, setShowTechniqueDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState<BrainstormTechnique | null>(null);
  const [newIdea, setNewIdea] = useState('');
  const [sessionIdeas, setSessionIdeas] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      handleSessionComplete();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const loadSessions = async () => {
    // Mock data - replace with actual API call
    const mockSessions: BrainstormSession[] = [
      {
        id: '1',
        title: 'Mobile App Features',
        description: 'Brainstorming new features for our mobile application',
        participants: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        ideas: ['idea1', 'idea2', 'idea3'],
        techniques: [BRAINSTORM_TECHNIQUES[0], BRAINSTORM_TECHNIQUES[1]],
        startTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T11:30:00'),
        status: 'completed',
        notes: 'Great session! Generated 15 new feature ideas.',
        outcomes: ['User authentication improvements', 'Social sharing features', 'Offline mode']
      }
    ];
    setSessions(mockSessions);
  };

  const handleStartSession = (technique: BrainstormTechnique) => {
    setCurrentTechnique(technique);
    setTimeRemaining(technique.duration * 60); // Convert minutes to seconds
    setIsRunning(true);
    setStep(1);
  };

  const handlePauseSession = () => {
    setIsRunning(false);
  };

  const handleResumeSession = () => {
    setIsRunning(true);
  };

  const handleStopSession = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    setCurrentTechnique(null);
    setStep(0);
    setSessionIdeas([]);
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    setCurrentTechnique(null);
    setStep(2);
    // Save session results
  };

  const handleAddIdea = () => {
    if (newIdea.trim()) {
      const ideaData = {
        title: newIdea.trim(),
        description: `Generated during ${currentTechnique?.name} brainstorming session`,
        tags: ['brainstorm', currentTechnique?.name.toLowerCase() || ''],
        category: 'Brainstorming',
        isFavorite: false
      };
      onAddIdea(ideaData);
      setSessionIdeas(prev => [...prev, newIdea.trim()]);
      setNewIdea('');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
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
          Brainstorm Sessions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          New Session
        </Button>
      </Box>

      {/* Active Session */}
      {currentSession && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            Active Session: {currentSession.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {currentSession.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon />
              <Typography variant="h6">
                {formatTime(timeRemaining)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isRunning ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PauseIcon />}
                  onClick={handlePauseSession}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleResumeSession}
                >
                  Resume
                </Button>
              )}
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<StopIcon />}
                onClick={handleStopSession}
              >
                Stop
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Technique Selection */}
      {step === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Choose a Brainstorming Technique
          </Typography>
          <Grid container spacing={2}>
            {BRAINSTORM_TECHNIQUES.map((technique) => (
              <Grid item xs={12} sm={6} md={4} key={technique.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  onClick={() => setShowTechniqueDialog(true)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {technique.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {technique.description}
                    </Typography>
                    <Chip
                      label={`${technique.duration} min`}
                      size="small"
                      color="primary"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Active Technique */}
      {currentTechnique && step === 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {currentTechnique.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {currentTechnique.description}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Instructions:
            </Typography>
            <List dense>
              {currentTechnique.instructions.map((instruction, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${index + 1}. ${instruction}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Add Ideas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Enter your idea..."
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddIdea()}
              />
              <Button
                variant="contained"
                onClick={handleAddIdea}
                disabled={!newIdea.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>

          {sessionIdeas.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Ideas Generated ({sessionIdeas.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sessionIdeas.map((idea, index) => (
                  <Chip
                    key={index}
                    label={idea}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Session Results */}
      {step === 2 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Session Complete!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Great job! You generated {sessionIdeas.length} ideas.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ideas Generated:
            </Typography>
            <List>
              {sessionIdeas.map((idea, index) => (
                <ListItem key={index}>
                  <ListItemText primary={idea} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setStep(0);
                setSessionIdeas([]);
                setNewIdea('');
              }}
            >
              Start New Session
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Export Ideas
            </Button>
          </Box>
        </Paper>
      )}

      {/* Session History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session History
        </Typography>
        {sessions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No previous sessions. Start your first brainstorming session!
          </Typography>
        ) : (
          <List>
            {sessions.map((session) => (
              <ListItem key={session.id}>
                <ListItemText
                  primary={session.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {session.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={session.status}
                          color={getStatusColor(session.status)}
                          size="small"
                        />
                        <Chip
                          label={`${session.ideas.length} ideas`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={session.startTime.toLocaleDateString()}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton>
                    <VisibilityIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Technique Detail Dialog */}
      <Dialog
        open={showTechniqueDialog}
        onClose={() => setShowTechniqueDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Brainstorming Technique</DialogTitle>
        <DialogContent>
          {currentTechnique && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {currentTechnique.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {currentTechnique.description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Duration: {currentTechnique.duration} minutes
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Instructions:
              </Typography>
              <List dense>
                {currentTechnique.instructions.map((instruction, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${index + 1}. ${instruction}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTechniqueDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowTechniqueDialog(false);
              if (currentTechnique) {
                handleStartSession(currentTechnique);
              }
            }}
          >
            Start Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrainstormSessionComponent;

