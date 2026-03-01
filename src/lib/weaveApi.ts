/**
 * AI Weave — summarize and organize ideas via OpenAI.
 * API key stored in localStorage: ideaWeaver_openai_api_key
 */

import { Idea } from '../models/Idea';

const STORAGE_KEY = 'ideaWeaver_openai_api_key';

export function getWeaveApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setWeaveApiKey(key: string): void {
  if (key.trim()) localStorage.setItem(STORAGE_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY);
}

function ideaToText(idea: Idea): string {
  const notes = idea.notes.map((n) => n.content).filter(Boolean).join(' | ');
  const parts = [idea.title];
  if (idea.description?.trim()) parts.push(idea.description);
  if (notes) parts.push(`Notes: ${notes.slice(0, 200)}${notes.length > 200 ? '…' : ''}`);
  if (idea.tags?.length) parts.push(`Tags: ${idea.tags.join(', ')}`);
  parts.push(`Category: ${idea.category}`);
  return parts.join('\n');
}

/**
 * Call OpenAI to generate a short narrative summary of all ideas ("weave").
 */
export async function weaveSummary(ideas: Idea[], apiKey: string): Promise<string> {
  if (ideas.length === 0) return 'Add some ideas first — then I can weave them into a summary.';

  const ideasText = ideas
    .slice(0, 100)
    .map((idea, i) => `[${i + 1}] ${ideaToText(idea)}`)
    .join('\n\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: `You are a thoughtful assistant that helps the user see their ideas as a woven whole. Write a short, warm narrative paragraph (2-4 sentences) that summarizes the themes and connections in their ideas. Write in second person ("Your ideas..."). Be concise and encouraging. Do not list bullet points; write flowing prose.`,
        },
        {
          role: 'user',
          content: `Here are my ideas:\n\n${ideasText}\n\nWeave them into a short summary paragraph.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  return text || 'Could not generate summary.';
}

/**
 * Suggest a category for one idea based on its content (for auto-organizer).
 */
export async function suggestCategory(idea: Idea, apiKey: string): Promise<string> {
  const text = ideaToText(idea);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 30,
      messages: [
        {
          role: 'system',
          content:
            'Reply with only a single short category name (1-3 words) for this idea. Examples: Work, Personal, Learning, Creative, Health. No quotes or explanation.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const category = data.choices?.[0]?.message?.content?.trim() || idea.category;
  return category.replace(/^["']|["']$/g, '');
}
