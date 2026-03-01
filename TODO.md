# Idea Weaver — TODO

Quick reference for next tasks. See [docs/ROADMAP.md](./docs/ROADMAP.md) and [POPULARITY-ROADMAP.md](./POPULARITY-ROADMAP.md).

## Do First (High Priority)

- [x] Integrate Archive feature (`ArchiveDialog`, add `isArchived` to Idea model) — **Done**
- [x] Integrate TagsAutocomplete in IdeaForm — **Done**
- [x] Integrate RecentSearches in EnhancedHeader (searchTerm, onSearchChange) — **Done**
- [x] Clean up ESLint warnings (unused imports, etc.) — **Done**
- [x] Quick filters (Today, Week, Favorites, Uncategorized) — **Done**
- [x] Duplicate idea action — **Done**
- [x] Continue-where-you-left-off on home — **Done**
- [x] Quick category change from list card — **Done**
- [x] Cream theme, dark mode — **Done**
- [x] Positioning for everyone (note takers, writers, dreamers) — **Done**

## Then (Medium Priority)

- [x] PWA (installable, offline) — service worker v2, manifest cream theme, install prompt
- [x] Daily streak + optional sound on capture + one-click export backup
- [ ] Share single idea (link or image)
- [ ] **Mind Map** — see [Mind Map](#mind-map) below
- [ ] Touch gestures (useTouchGestures in IdeaList)
- [ ] Better analytics (charts)
- [ ] Test coverage (Jest, RTL)

## Mind Map

- [ ] **Layout** — Radial/tree from one root or free canvas; auto-layout option.
- [ ] **Zoom & pan** — Pinch/scroll zoom; drag canvas to pan (like IdeaGraph).
- [ ] **Nodes** — One node per idea; drag to reposition; click to edit title/notes.
- [ ] **Connections** — Draw edges from idea connections; optional curved/bezier.
- [ ] **Add node** — Click empty space or “+” to add idea; link to selected node.
- [ ] **Root** — Pick “center idea” or “most connected”; re-root without losing data.
- [ ] **Keyboard** — Arrow keys to move focus; Enter to edit; Delete to remove.
- [ ] **Touch** — Drag node, pinch zoom; large hit targets (soul: low friction).

## Later (POPULARITY-ROADMAP)

- [ ] Landing page + demo
- [ ] Backend + sync (Supabase)
- [ ] Product Hunt launch
