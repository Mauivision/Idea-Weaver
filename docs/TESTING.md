# Idea Weaver — Testing Checklist

Run `npm start` and open **http://localhost:3000**.

## 1. Onboarding Flow

- [ ] First visit shows "Welcome to Idea Weaver"
- [ ] **Start with Voice** starts microphone (allow when prompted)
- [ ] Speech is transcribed in real time
- [ ] **Or type your first idea** shows text input
- [ ] After first note: **Unlock across devices — $1.99** button appears
- [ ] **Use without sync** skips to main app
- [ ] Unlock simulates payment → transitions to app
- [ ] Reload: onboarding is skipped (localStorage)

## 2. Notes Board (Home)

- [ ] Add note via + FAB
- [ ] Drag note: position updates smoothly
- [ ] Delete note: confirmation dialog, then removal

## 3. Voice Input (Main App)

- [ ] Floating mic (bottom-left) visible
- [ ] Click mic → starts listening
- [ ] Speak → new idea created with transcript
- [ ] Toast: "Idea captured!"

## 4. List View

- [ ] Switch to List view
- [ ] Ideas shown as expandable cards
- [ ] Connection chip: click → unlink menu
- [ ] Drag to reorder ideas

## 5. Idea Graph

- [ ] Switch to Graph view
- [ ] Nodes draggable
- [ ] Ctrl+C on node → connect mode
- [ ] Click another node → connection created
- [ ] Click connection line → unlink

## 6. FlowChart View

- [ ] Switch to FlowChart
- [ ] Connections shown as arrows
- [ ] Click connection line → unlink

## 7. Other Views

- [ ] Mind Map: placeholder + "Open Graph view"
- [ ] Templates, Analytics, Brainstorm: load without error

## 8. Export / Import

- [ ] Export button (bottom-right)
- [ ] Export JSON → file downloads
- [ ] Import JSON → ideas load

## 9. Keyboard Shortcuts

- [ ] Press `?` → shortcuts help
- [ ] `0`–`4` → switch views

## 10. Dark Mode

- [ ] Theme toggle in header
- [ ] UI switches between light/dark

---

**Reset onboarding (console):**
```javascript
localStorage.removeItem('ideaWeaverOnboardingCompleted');
location.reload();
```
