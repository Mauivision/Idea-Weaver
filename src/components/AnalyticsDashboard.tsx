import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Link as LinkIcon,
  Favorite as FavoriteIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { Idea } from '../models/Idea';

interface AnalyticsDashboardProps {
  ideas: Idea[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ ideas }) => {
  const stats = useMemo(() => {
    const totalIdeas = ideas.length;
    const favorites = ideas.filter(i => i.isFavorite).length;
    const withConnections = ideas.filter(i => i.connections.length > 0).length;
    const totalConnections = ideas.reduce((sum, idea) => sum + idea.connections.length, 0) / 2;
    const totalNotes = ideas.reduce((sum, idea) => sum + idea.notes.length, 0);

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    ideas.forEach(idea => {
      categoryCounts[idea.category] = (categoryCounts[idea.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Tag distribution
    const tagCounts: Record<string, number> = {};
    ideas.forEach(idea => {
      idea.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Recent activity
    const recentIdeas = [...ideas]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    // Connection strength
    const mostConnected = [...ideas]
      .sort((a, b) => b.connections.length - a.connections.length)
      .slice(0, 5);

    // Average notes per idea
    const avgNotes = totalIdeas > 0 ? (totalNotes / totalIdeas).toFixed(1) : '0';

    return {
      totalIdeas,
      favorites,
      withConnections,
      totalConnections,
      totalNotes,
      avgNotes,
      topCategories,
      topTags,
      recentIdeas,
      mostConnected
    };
  }, [ideas]);

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary' 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  }) => (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ color: `${color}.main`, mr: 1 }}>
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        📊 Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Main Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Ideas"
            value={stats.totalIdeas}
            icon={<TrendingUpIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Favorites"
            value={stats.favorites}
            subtitle={`${stats.totalIdeas > 0 ? ((stats.favorites / stats.totalIdeas) * 100).toFixed(0) : 0}% of total`}
            icon={<FavoriteIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Connections"
            value={stats.totalConnections}
            subtitle={`${stats.withConnections} ideas connected`}
            icon={<LinkIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Notes"
            value={stats.totalNotes}
            subtitle={`Avg: ${stats.avgNotes} per idea`}
            icon={<AccessTimeIcon />}
            color="warning"
          />
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CategoryIcon sx={{ mr: 1 }} />
              Top Categories
            </Typography>
            {stats.topCategories.length > 0 ? (
              <Box>
                {stats.topCategories.map(([category, count]) => (
                  <Box key={category} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{category}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {count} ({stats.totalIdeas > 0 ? ((count / stats.totalIdeas) * 100).toFixed(0) : 0}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.totalIdeas > 0 ? (count / stats.totalIdeas) * 100 : 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No categories yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Top Tags */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              🔖 Top Tags
            </Typography>
            {stats.topTags.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {stats.topTags.map(([tag, count]) => (
                  <Chip
                    key={tag}
                    label={`${tag} (${count})`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tags yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Most Connected Ideas */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LinkIcon sx={{ mr: 1 }} />
              Most Connected Ideas
            </Typography>
            {stats.mostConnected.length > 0 ? (
              <List dense>
                {stats.mostConnected.map((idea, index) => (
                  <React.Fragment key={idea.id}>
                    <ListItem>
                      <ListItemText
                        primary={idea.title}
                        secondary={`${idea.connections.length} connection${idea.connections.length !== 1 ? 's' : ''}`}
                      />
                      <Chip label={`#${index + 1}`} size="small" color="primary" />
                    </ListItem>
                    {index < stats.mostConnected.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No connections yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTimeIcon sx={{ mr: 1 }} />
              Recent Activity
            </Typography>
            {stats.recentIdeas.length > 0 ? (
              <List dense>
                {stats.recentIdeas.map((idea, index) => (
                  <React.Fragment key={idea.id}>
                    <ListItem>
                      <ListItemText
                        primary={idea.title}
                        secondary={`Updated ${new Date(idea.updatedAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                    {index < stats.recentIdeas.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent activity
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;

