# Git Setup for Idea Weaver

Test versions of the app are stored at:

**https://github.com/Mauivision/Idea-Weaver**

The repo is empty and ready for an initial push. Use it for branches, tags, and test deployments.

## First-time setup (no git yet)

1. **Initialize git and add remote**
   ```bash
   git init
   git remote add origin https://github.com/Mauivision/Idea-Weaver.git
   ```

2. **Stage, commit, and push**
   ```bash
   git add .
   git commit -m "Initial Idea Weaver project"
   git branch -M main
   git push -u origin main
   ```

   If the repo already has content (e.g. a README), pull first:
   ```bash
   git pull origin main --allow-unrelated-histories
   git push -u origin main
   ```

## Pushing test versions

- **Branch per test version** (recommended):
  ```bash
  git checkout -b test/v1.2-snap-grid
  git add .
  git commit -m "Test: snap grid + note create/delete"
  git push -u origin test/v1.2-snap-grid
  ```

- **Tags for releases**:
  ```bash
  git tag -a v1.2.0-test -m "Test release 1.2.0"
  git push origin v1.2.0-test
  ```

- **Regular updates to `main`**:
  ```bash
  git add .
  git commit -m "Your message"
  git push origin main
  ```

## Notes

- `.gitignore` already excludes `node_modules`, `build`, `.env*`, etc.
- Use **Mauivision/Idea-Weaver** for all test builds and versioned snapshots.
