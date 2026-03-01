import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Collapse,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Key as KeyIcon,
  Summarize as SummarizeIcon,
  Category as CategoryIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { Idea } from '../models/Idea';
import { getWeaveApiKey, setWeaveApiKey, weaveSummary, suggestCategory } from '../lib/weaveApi';

interface IdeaWeaveProps {
  ideas: Idea[];
  onUpdateIdea: (idea: Idea) => void;
  showToast?: (msg: string, severity: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function IdeaWeave({ ideas, onUpdateIdea, showToast }: IdeaWeaveProps) {
  const [apiKeyInput, setApiKeyInput] = useState(getWeaveApiKey() || '');
  const [apiKeySaved, setApiKeySaved] = useState(!!getWeaveApiKey());
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizing, setOrganizing] = useState(false);
  const [suggestions, setSuggestions] = useState<{ ideaId: string; title: string; suggested: string }[]>([]);

  const apiKey = getWeaveApiKey();

  const stats = useMemo(() => {
    const total = ideas.length;
    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    ideas.forEach((idea) => {
      categoryCounts[idea.category] = (categoryCounts[idea.category] || 0) + 1;
      idea.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const categories = Object.keys(categoryCounts).filter((c) => c && c !== 'Uncategorized');
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = ideas.filter((i) => new Date(i.updatedAt).getTime() > weekAgo);

    return {
      total,
      categoryCount: categories.length || 1,
      topTags,
      thisWeek: thisWeek.length,
      thisWeekIdeas: thisWeek.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10),
    };
  }, [ideas]);

  const handleSaveKey = useCallback(() => {
    setWeaveApiKey(apiKeyInput);
    setApiKeySaved(!!apiKeyInput.trim());
    showToast?.(apiKeyInput.trim() ? 'API key saved' : 'API key cleared', 'info');
  }, [apiKeyInput, showToast]);

  const handleWeave = useCallback(async () => {
    if (!apiKey) {
      setError('Add and save your OpenAI API key first.');
      return;
    }
    setError(null);
    setSummary(null);
    setLoading(true);
    try {
      const text = await weaveSummary(ideas, apiKey);
      setSummary(text);
      showToast?.('Weave complete', 'success');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate summary';
      setError(message);
      showToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [ideas, apiKey, showToast]);

  const handleSuggestCategories = useCallback(async () => {
    if (!apiKey) {
      setError('Add and save your OpenAI API key first.');
      return;
    }
    const uncategorized = ideas.filter((i) => !i.category || i.category === 'Uncategorized' || i.category === '');
    if (uncategorized.length === 0) {
      showToast?.('All ideas already have categories', 'info');
      return;
    }
    setError(null);
    setSuggestions([]);
    setOrganizing(true);
    try {
      const results: { ideaId: string; title: string; suggested: string }[] = [];
      for (const idea of uncategorized.slice(0, 15)) {
        const suggested = await suggestCategory(idea, apiKey);
        results.push({ ideaId: idea.id, title: idea.title, suggested });
      }
      setSuggestions(results);
      showToast?.(`Suggested categories for ${results.length} ideas`, 'success');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to suggest categories';
      setError(message);
      showToast?.(message, 'error');
    } finally {
      setOrganizing(false);
    }
  }, [ideas, apiKey, showToast]);

  const applySuggestion = useCallback(
    (ideaId: string, suggested: string) => {
      const idea = ideas.find((i) => i.id === ideaId);
      if (idea) {
        onUpdateIdea({ ...idea, category: suggested, updatedAt: new Date() });
        setSuggestions((prev) => prev.filter((s) => s.ideaId !== ideaId));
        showToast?.(`Set "${idea.title}" to ${suggested}`, 'success');
      }
    },
    [ideas, onUpdateIdea, showToast]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 720, mx: 'auto' }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Literata", "Outfit", Georgia, serif',
          fontWeight: 600,
          mb: 1,
          letterSpacing: '-0.02em',
        }}
      >
        Your notes, woven together
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        Ideas that used to get lost now have a place. Here's your weave — and with AI, one summary to see the whole.
      </Typography>

      {/* Auto summary (no AI) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Your weave at a glance
          </Typography>
          <Button
            size="small"
            startIcon={<ContentCopyIcon fontSize="small" />}
            onClick={() => {
              const lines = [
                `${stats.total} ideas across ${stats.categoryCount} categories`,
                stats.topTags.length > 0 ? `Top tags: ${stats.topTags.join(', ')}` : null,
                stats.thisWeek > 0 ? `This week: ${stats.thisWeek} updated` : null,
                stats.thisWeekIdeas.length > 0 ? `Recent: ${stats.thisWeekIdeas.map((i) => i.title).join(', ')}` : null,
              ].filter(Boolean);
              const text = `My weave at a glance\n\n${lines.join('\n')}\n\n— Idea Weaver`;
              navigator.clipboard.writeText(text).then(() => showToast?.('Copied to clipboard', 'success'));
            }}
          >
            Copy
          </Button>
        </Box>
        <Typography variant="body1" sx={{ mb: 1.5 }}>
          <strong>{stats.total}</strong> ideas across <strong>{stats.categoryCount}</strong> categories
          {stats.topTags.length > 0 && (
            <>
              {' · '}
              Top tags: {stats.topTags.map((t) => (
                <Chip key={t} label={t} size="small" sx={{ mr: 0.5, mb: 0.5 }} variant="outlined" />
              ))}
            </>
          )}
          {stats.thisWeek > 0 && (
            <>
              {' · '}
              <strong>This week:</strong> {stats.thisWeek} updated
            </>
          )}
        </Typography>
        {stats.thisWeekIdeas.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Recent
            </Typography>
            <List dense disablePadding>
              {stats.thisWeekIdeas.map((idea) => (
                <ListItem key={idea.id} disablePadding sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={idea.title}
                    secondary={idea.category !== 'Uncategorized' ? idea.category : undefined}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>

      {/* AI section */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, borderColor: 'primary.main', bgcolor: 'action.hover' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AutoAwesomeIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            AI Weave
          </Typography>
        </Box>

        {!apiKeySaved ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Add your OpenAI API key to generate a narrative summary of all your ideas. Stored only on this device.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="sk-..."
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{ startAdornment: <KeyIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
              <Button variant="contained" onClick={handleSaveKey}>
                Save
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            API key saved. Use the buttons below to weave or organize.
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SummarizeIcon />}
            onClick={handleWeave}
            disabled={loading || !apiKey || ideas.length === 0}
          >
            {loading ? 'Weaving…' : 'Weave with AI'}
          </Button>
          <Button
            variant="outlined"
            startIcon={organizing ? <CircularProgress size={18} /> : <CategoryIcon />}
            onClick={handleSuggestCategories}
            disabled={organizing || !apiKey || ideas.length === 0}
          >
            {organizing ? 'Suggesting…' : 'Suggest categories'}
          </Button>
        </Box>

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Collapse>

        {summary && (
          <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Your weave
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon fontSize="small" />}
                onClick={() => {
                  const text = `My ideas, woven together:\n\n${summary}\n\n— Idea Weaver`;
                  navigator.clipboard.writeText(text).then(() => showToast?.('Copied to clipboard', 'success'));
                }}
              >
                Copy
              </Button>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {summary}
            </Typography>
          </Paper>
        )}

        {suggestions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Suggested categories — click to apply
            </Typography>
            <List dense>
              {suggestions.map(({ ideaId, title, suggested }) => (
                <ListItem
                  key={ideaId}
                  secondaryAction={
                    <Button size="small" onClick={() => applySuggestion(ideaId, suggested)}>
                      Apply
                    </Button>
                  }
                >
                  <ListItemText primary={title} secondary={`→ ${suggested}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
