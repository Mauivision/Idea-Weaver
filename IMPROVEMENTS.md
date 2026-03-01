# Idea Weaver — Improvement Report

A focused pass on how to make Idea Weaver better: quick wins, product, code, and performance. Use this alongside [docs/ROADMAP.md](docs/ROADMAP.md) and [TODO.md](TODO.md).

---

## 1. Quick wins (do first)

### 1.1 Fix import paths for `Idea` model

The model file is **`Idea.ts`**, but many files import from **`Idea.tsx`** (e.g. `IdeasContext.tsx`, `useIdeas.ts`, `IdeaForm`, `ArchiveDialog`). That can cause subtle resolution issues.

**Action:** Replace `from '../models/Idea.tsx'` with `from '../models/Idea'` (or `Idea.ts`) everywhere. Same for `Idea.ts` if you prefer explicit extensions. Keep one convention.

### 1.2 Wire Archive (model + UI)

- Add **`isArchived?: boolean`** to `Idea` in `src/models/Idea.ts`. Default `false` in `createEmptyIdea` and in `useIdeas` when creating ideas.
- In **`useIdeas`** (or wherever ideas are loaded/saved): filter out archived ideas from the main list by default; expose something like `archivedIdeas` and `setIdeaArchived(id, value)`.
- Use **`ArchiveDialog`** from the header or list: “Archive” moves idea to archived; add a view or filter “Show archived” to list them and “Restore”.

**Effort:** 1–2 hours. Unblocks a completed component and clearer mental model (active vs archived).

### 1.3 Use TagsAutocomplete in IdeaForm

**`TagsAutocomplete`** exists but IdeaForm uses a manual tag input (chip + text field). Swap to:

- `<TagsAutocomplete ideas={ideas} value={tags} onChange={setTags} />` (or match the component’s actual props).
- Remove duplicate tag logic from IdeaForm and rely on TagsAutocomplete for suggestions and validation.

**Effort:** ~30 min. Better UX and less duplicated logic.

### 1.4 Wire RecentSearches in EnhancedHeader

**RecentSearches** is already imported and used in EnhancedHeader (around line 225). Confirm:

- When the user runs a search, the term is passed to `RecentSearches` so it’s stored (e.g. `onSearch(term)` or equivalent).
- Tapping a recent term fills the search box and applies the filter.

If any of that is missing, connect the search callback so “recent” is populated and clickable.

### 1.5 Fix export “PDF” (actually plain text)

In **`exportUtils.ts`**, the `'pdf'` branch creates a **plain text** blob and downloads a `.txt` file. Either:

- Rename to something like “Plain text export” in the UI and keep `.txt`, or
- Add a real PDF export (e.g. jsPDF or browser print-to-PDF) and keep the label “PDF”.

**Effort:** ~15 min for the rename; 1–2 h if you add real PDF.

### 1.6 Clean lint / type noise

- **IdeaGraph:** Fix function order (define before use or reorder so hooks/components aren’t declared after use). Resolves the ~738 warning.
- **IdeaForm:** Remove unused `TagsAutocomplete` import once the component is wired (or use it as in 1.3).
- Run `npm run lint` and fix remaining unused imports/vars across components.

---

## 2. Product and UX

### 2.1 Voice input

- **Feedback:** Show a clear “Listening…” state (e.g. waveform or pulse) so users know the mic is active.
- **Language:** `recognition.lang` is `'en-US'`. Consider making it configurable (e.g. from user settings or browser locale) for i18n.
- **Continuous mode:** Currently `continuous: false`. For “idea dump” sessions, consider a mode that stays open until the user stops, then creates one idea per segment or one idea with multiple notes.

### 2.2 Onboarding and first run

- First idea is created with title “First Idea” and the onboarding note as content. Consider a short tooltip or one-time hint: “Rename this idea and add more from the board or voice.”
- If the user skips onboarding, the main view could show a single, dismissible “Quick start: press ? for shortcuts, use + for new idea” so power features are discoverable.

### 2.3 Empty and loading states

- You have **LoadingSkeleton**; ensure every main view (board, list, graph, mindmap, flowchart, analytics) has a clear empty state (“No ideas yet — add one with + or use the mic”) and uses the skeleton when loading.
- Empty state could include a CTA that opens the idea form or starts voice input.

### 2.4 Keyboard and focus

- Shortcuts already skip when focus is in input/textarea; good.
- After “New idea” or “Add idea”, focus the title field so the user can type immediately.
- After closing a dialog (e.g. IdeaForm cancel), return focus to the trigger button for accessibility.

---

## 3. Code and architecture

### 3.1 Reduce App.tsx size and responsibility

**App.tsx** holds a lot: view mode, filters, search, theme, keyboard shortcuts, bulk selection, export, import, and many callbacks. Consider:

- **View state:** Move `currentViewMode` (and maybe view-mode-specific state) into a small context or a custom hook like `useViewMode()`.
- **Filters:** A hook `useFilters()` that returns `{ searchTerm, categoryFilter, showFavoritesOnly, setSearchTerm, ... }` and the filtered list.
- **Snackbar / toasts:** A tiny context or hook (e.g. `useToast()`) so children can show messages without prop drilling.
- Keep **App** as the composition root: theme, layout, header, and the current view. Logic lives in hooks/context.

This will make App easier to read and test.

### 3.2 Idea model and persistence

- **Dates:** `createdAt` / `updatedAt` are `Date` in the type; localStorage will serialize them as strings. In **useIdeas** (or wherever you hydrate from storage), ensure you parse them back to `Date` (e.g. `new Date(idea.createdAt)`) so comparisons and formatting stay correct.
- **Connections:** When you delete an idea, remove its id from every other idea’s `connections` array so the graph doesn’t reference missing nodes. Do this in `deleteIdea` in useIdeas.

### 3.3 Error boundary and recovery

- You have error boundaries; ensure they wrap the main content and show a simple “Something went wrong” plus a “Reload” or “Clear data and restart” option so the app never leaves the user stuck.

---

## 4. Performance

### 4.1 Large lists

- For 1000+ ideas, list and graph can get heavy. **react-window** (or similar) for the list view will keep DOM nodes bounded and scroll smooth.
- In the graph view, consider only rendering nodes in viewport (or within a radius) if you add zoom/pan; same for flowchart if it grows.

### 4.2 Re-renders

- **filteredIdeas** is computed on every render. Memoize with `useMemo` (you may already in places); ensure the dependency array is correct so filtering only recomputes when `ideas`, `searchTerm`, `categoryFilter`, or `showFavoritesOnly` change.
- If any child component receives large props (e.g. full `ideas`), consider passing IDs and letting the child read from context or a store to avoid unnecessary re-renders.

---

## 5. Accessibility and mobile

### 5.1 A11y

- **Voice FAB:** Give it an `aria-label` (“Start voice input” / “Stop voice input”) and `aria-pressed={isListening}`. When unsupported, show a short message and don’t rely only on a disabled button.
- **Dialogs:** Ensure focus is trapped inside the dialog and restored on close (MUI usually does this; verify for ArchiveDialog, IdeaForm in modal, etc.).
- **Keyboard help:** The “?” shortcut is great; ensure the help dialog is focusable and can be closed with Escape.

### 5.2 Touch and small screens

- **useTouchGestures** is in the roadmap for swipe-to-delete / favorite. When you add it, keep tap targets at least 44px and avoid double-use of horizontal swipe (e.g. if you have horizontal scroll elsewhere).
- **NoteGridBoard** and **FlowChart:** Test drag on touch devices; add touch-action CSS if needed so scroll and drag don’t fight.

---

## 6. Prioritized action list

| Priority | Action | Effort |
|----------|--------|--------|
| 1 | Fix Idea import path (Idea.ts vs Idea.tsx) everywhere | 15 min |
| 2 | Add isArchived to Idea, filter in useIdeas, wire ArchiveDialog | 1–2 h |
| 3 | Use TagsAutocomplete in IdeaForm; remove manual tag duplication | 30 min |
| 4 | Fix export “PDF” label or implement real PDF | 15 min – 1 h |
| 5 | IdeaGraph function order + IdeaForm unused import + lint pass | 1 h |
| 6 | Confirm RecentSearches is wired in EnhancedHeader | 15 min |
| 7 | Memoize filteredIdeas in App (if not already) | 15 min |
| 8 | Parse Idea dates from localStorage in useIdeas | 30 min |
| 9 | Clean up App.tsx (extract useFilters, useToast, useViewMode) | 2–3 h |
| 10 | Voice: “Listening…” indicator, optional lang setting | 1 h |

---

## Summary

- **Quick wins:** Import path, archive (model + UI), TagsAutocomplete in IdeaForm, export label/layout, lint and function order. These unblock existing work and reduce confusion.
- **Product:** Voice feedback and options, onboarding hint, empty states, focus management.
- **Code:** Smaller App, consistent Idea typing and dates, connection cleanup on delete, error recovery.
- **Performance:** Virtual list for large lists, memoized filtering.
- **A11y and mobile:** Labels and state for voice, focus and keyboard, touch targets and gestures.

Tackle the top six items first; then iterate on product and structure. Idea Weaver is already feature-rich; these changes will make it more consistent, maintainable, and pleasant to use.
