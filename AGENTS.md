# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Idea Weaver** is a client-side React/TypeScript SPA (Create React App) for voice-first note-taking. No backend, no database — all data persists in browser `localStorage`. The only service to run is the CRA dev server on port 3000.

### Running the app

- **Dev server**: `npm start` (port 3000)
- **Build**: `npm run build`
- **Lint**: `npx eslint src --ext .ts,.tsx` (0 errors expected; ~118 warnings from unused imports are pre-existing)
- **Tests**: `npx react-scripts test --watchAll=false --passWithNoTests` (no test files exist yet)
- **Type check**: `npm run type-check`

See `package.json` `scripts` section for the full list.

### Known gotchas

- The `uuid` package was missing from `package.json` but is imported in `src/hooks/useIdeas.ts`. It has been added as a dependency.
- Three runtime errors existed in the original codebase and have been fixed:
  - `QuickActionsMenu.tsx`: PropTypes was referenced before the component was defined (moved after component).
  - `IdeaList.tsx`: Referenced an undefined `handleGridClick` function (replaced with existing `handleNoteClick`).
  - `EnhancedHeader.tsx`: Missing `React` import required for JSX.
- The lint config uses `--max-warnings 0` in `package.json`'s `lint` script, which will fail due to pre-existing unused-import warnings. Use `npx eslint src --ext .ts,.tsx` (without `--max-warnings 0`) for a non-failing lint check.
- CRA dev server shows deprecation warnings for `onAfterSetupMiddleware`/`onBeforeSetupMiddleware` — these are harmless and come from `react-scripts 5.0.1`.
- `react-spring` has peer dependency warnings for React 19 — these are harmless with React 18.
- No `.env` file is required. The app works out of the box with `localStorage`.
- The `project-launcher/` directory is an unrelated CLI tool; it is not part of the main product.
