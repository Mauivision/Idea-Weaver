# Idea Weaver — Deployment

## Quick Deploy

```bash
npm run deploy              # Full deploy (tests + build + Vercel)
npm run deploy:skip-tests   # Skip tests
npm run deploy:local        # Build only, no Vercel
npm run serve:build         # Serve build locally (npx serve -s build)
```

## Vercel (primary)

- `deploy.sh` runs tests, build, then `vercel --prod`
- Requires Vercel CLI: `npm install -g vercel`
- First run: `vercel link` to link project

## GitHub Pages

```bash
./deploy-github-pages.sh   # Creates docs/ from build
# Then: Settings > Pages > Source: docs folder
```

## Environment (optional)

`.env.local`:
- `REACT_APP_API_URL` — Deployed URL
- `REACT_APP_VERSION` — App version
- `REACT_APP_GA_ID` — Google Analytics
- `REACT_APP_SENTRY_DSN` — Error tracking
