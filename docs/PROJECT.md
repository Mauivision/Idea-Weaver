# Idea Weaver — Project Overview

A place for your ideas — for heavy note takers, daily writers, and dreamers gathering their thoughts.

**Core value:** instant voice capture → clean, organized notes → optional sync & premium features. Built for everyone.

## Business Model

- **Free tier:** local-only notes, voice input, basic organization
- **Premium:** one-time $1.99 unlock for cross-device sync, unlimited storage, templates, export (PDF/Markdown), future collaboration

**Goal:** ship a clean MVP quickly, then iterate toward a sellable product.

## Technology Stack

| Area | Choice |
|------|--------|
| Framework | React 18+ with TypeScript (strict mode) |
| Build | Create React App (react-scripts) |
| Styling | MUI (Material-UI) + Emotion |
| State | IdeasContext (ideas/notes); Zustand for global UI |
| Routing | Single-page, conditional views (onboarding gate in `index.tsx`) |
| Persistence | localStorage (free); Supabase/Firebase/Convex later (premium) |
| Voice | Web Speech API (SpeechRecognition) |
| Payments | Stripe Checkout or Gumroad / Lemon Squeezy |
| Deploy | Vercel (primary) |
| Testing | React Testing Library |
| Lint | ESLint (react-app) |

## Project Structure

```
src/
├── components/     # UI components
├── contexts/       # React Context (IdeasContext)
├── hooks/          # Custom hooks (useIdeas, useAutoSave, etc.)
├── models/         # Types (Idea, Project)
├── lib/            # Utilities (payment placeholder)
├── App.tsx         # Main app (behind onboarding gate)
└── index.tsx       # Entry + onboarding gate
```

## Conventions

- **Folders:** kebab-case
- **Components:** PascalCase (OnboardingScreen, VoiceInputButton)
- **Hooks:** useCamelCase (useIdeas, useAutoSave)
- **Types:** PascalCase (Idea, Project)
- **Constants:** UPPER_SNAKE_CASE

## Related Docs

- [ROADMAP.md](./ROADMAP.md) — Next steps, enhancements, priorities
- [FEATURES.md](./FEATURES.md) — Feature guide
- [TESTING.md](./TESTING.md) — Testing checklist
- [GIT.md](./GIT.md) — Git setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deploy instructions
