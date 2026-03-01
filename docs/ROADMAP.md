# Idea Weaver — Roadmap & TODO

## 🔥 High Priority (Quick Wins)

| Task | Effort | Status |
|------|--------|--------|
| **Archive feature** — Add `isArchived` to Idea model, integrate ArchiveDialog | 1–2h | Pending |
| **TagsAutocomplete** — Replace manual tag input in IdeaForm | 30m | Pending |
| **RecentSearches** — Integrate into EnhancedHeader search bar | 1h | Pending |
| **Clean up warnings** — Unused imports, function order in IdeaGraph | 1h | Pending |

## 🎯 Medium Priority

| Task | Effort | Status |
|------|--------|--------|
| **Enhanced Mind Map** — Radial layout, zoom/pan, drag nodes | 4–6h | Pending |
| **Touch gestures** — Swipe-to-delete, swipe-to-favorite (useTouchGestures hook) | 3–4h | Pending |
| **Better analytics** — Charts (Recharts), trends, category pie | 4–6h | Pending |
| **Improved sharing** — Unique URLs, share preview, QR codes | 3–4h | Pending |
| **Test coverage** — Jest, RTL, E2E with Playwright | 8–12h | Pending |

## 🔮 Future / Larger

| Task | Effort | Status |
|------|--------|--------|
| **AI integration** — GPT suggestions, auto-categorization | 8–12h | Concept |
| **Version history** — Idea snapshots, restore previous | 6–8h | Concept |
| **Collaboration** — Real-time multi-user (backend required) | 10–15h | Concept |
| **Virtual scrolling** — react-window for 1000+ ideas | 2–3h | Not started |
| **Full Project Manager** — Project creation, storage, tasks | 6–8h | Demo only |
| **Full Brainstorm Session** — Timers, session history | 4–6h | Demo only |

## ✅ Done

- Dark mode, keyboard shortcuts, empty states, loading skeletons
- Error boundaries, accessibility, tooltips, confirmation dialogs
- Autosave indicator, hardware-accelerated drag, undo/redo
- Notes Board (no linking on board; linking in List/Graph/FlowChart)
- Voice input, onboarding, premium unlock flow (simulated)

## Must-Fix

- ✅ ESLint passes; TagsAutocomplete in use; RecentSearches wired

## Decision Points

- Full project management vs idea-only?
- AI integration — worth API costs?
- Collaboration — multi-user needed?
- PWA or native mobile?
- Backend for sync (Supabase/Firebase)?
