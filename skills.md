# skills.md — Idea Weaver Project Knowledge & Guidelines

## Project Overview
Idea Weaver is a minimalist, voice-first note-taking application targeted at busy professionals (contractors, tradespeople, field workers).  
Core value: instant voice capture → clean, organized notes → optional sync & premium features.

Business model:  
- Free tier: local-only notes, voice input, basic organization  
- Premium: one-time $1.99 unlock for cross-device sync, unlimited storage, templates, export (PDF/Markdown), future collaboration  

Goal: ship a clean MVP quickly, then iterate toward a sellable product with good UX, reliability, and maintainable code.

## Technology Stack & Conventions
- Framework: React (18+) with TypeScript  
- Build tool: Create React App (react-scripts)  
- Styling: MUI (Material-UI) + Emotion; inline styles for onboarding/standalone screens  
- State management: IdeasContext (React Context) for ideas/notes; Zustand available for global UI state  
- Routing: Single-page with conditional rendering (onboarding gate in `index.tsx`)  
- Persistence: localStorage (free tier); later Supabase / Firebase / Convex for sync (premium)  
- Voice input: Web Speech API (SpeechRecognition) — no external libs initially  
- Payments: Stripe Checkout or Gumroad / Lemon Squeezy (one-time purchase)  
- Deployment: Vercel (primary)  
- Testing: React Testing Library (add gradually)  
- Linting/Formatting: ESLint (react-app config)

File & folder conventions:
- `src/components/` — reusable UI (OnboardingScreen, IdeaList, NoteGridBoard, etc.)
- `src/contexts/` — React Context providers (IdeasContext)
- `src/hooks/` — custom hooks (useIdeas, useAutoSave, useDragAndDrop, etc.)
- `src/models/` — shared TypeScript types (Idea, Project)
- `src/App.tsx` — main app (behind onboarding gate)
- Use kebab-case for folders, PascalCase for components, camelCase for utils/functions

## Code Style & Best Practices
- Always use TypeScript — strict mode, no `any`
- Prefer functional components + hooks
- Components < 200 lines; split when growing
- Follow SOLID principles lightly: single responsibility, avoid god components
- DRY: extract shared logic into hooks/utils
- Mobile-first design (MUI responsive breakpoints, `sx` props)
- Accessibility: semantic HTML, aria-labels on buttons, keyboard navigation
- Error handling: show user-friendly messages; log to console (later Sentry)
- Performance: memoize expensive components, avoid unnecessary re-renders
- Security: never store payment data client-side; validate inputs

Naming:
- Components: PascalCase (OnboardingScreen, VoiceInputButton)
- Hooks: useCamelCase (useSpeechRecognition, useIdeas)
- Types: PascalCase with suffix if needed (Idea, Project)
- Constants: UPPER_SNAKE_CASE (ONBOARDING_STORAGE_KEY)

## Feature-Specific Guidelines

### Onboarding
- Goal: zero friction — value in < 10 seconds
- First screen: full-viewport hero (see `OnboardingScreen.tsx`)
  - Headline: "Capture ideas instantly — from voice to organized notes"
  - Large button: "Start Speaking"
  - No login / email required initially
- Use Web Speech API to show instant transcription
- After first note: subtle premium prompt ("Unlock across devices — $1.99 one-time")
- Completion: set `ideaWeaverOnboardingCompleted` in localStorage → never show onboarding again (handled in `index.tsx`)
- Transition: smooth fade or slide when entering main app

### Voice Input
- Primary input method — make it feel magical
- Use browser-native SpeechRecognition (`window.SpeechRecognition` / `webkitSpeechRecognition`)
- Support: interim results, error handling (no mic, unsupported browser)
- Fallback: textarea for unsupported browsers
- Auto-capitalize, basic punctuation detection if possible
- Language: en-US (configurable later)

### Notes Management
- Data shape: `Idea` model with `notes`, `connections`, `tags`, `category`, etc.
- Free tier: store via `useIdeas` hook → localStorage
- Premium: sync to backend (future)
- UI: NoteGridBoard (board), IdeaList (list), IdeaGraph, EnhancedMindMap, FlowChart
- Support markdown rendering where applicable

### Premium Unlock
- One-time payment — no subscription initially
- Use Stripe Checkout, Gumroad, or Lemon Squeezy
- Flow: click → redirect to payment → on success → set premium flag (localStorage + backend later)
- Placeholder in `OnboardingScreen.tsx` → `handleUnlock()` with TODO comments for real integration
- Show clear value: "Sync notes across devices, unlimited storage, export options"
- After unlock: one-time welcome message ("Welcome! Your notes are now ready to sync across devices.")

### Future-Proofing & Production Readiness
- Prepare for backend integration (Supabase/Convex/Firebase) — abstract storage/sync
- Add basic analytics (PostHog free tier or Vercel Analytics)
- PWA support: manifest, service worker already present
- SEO: meta tags, good titles
- Error boundaries & loading states everywhere
- Keep bundle size small — lazy load non-critical components

## When Generating or Editing Code
- Always think step-by-step: plan → reason → code
- Show plan first if task is > 1 file
- Prefer minimal changes — edit, don't rewrite unrelated code
- Include imports, types, and complete functions
- Add comments for non-obvious logic
- Suggest tests when adding business logic or payments
- Ask for clarification if requirement is ambiguous

This file will be updated as the product evolves.  
Last major update: February 2026
