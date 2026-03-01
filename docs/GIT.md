# Git Setup — Idea Weaver

Repo: **https://github.com/Mauivision/Idea-Weaver**

## First-time setup (no git yet)

```bash
git init
git remote add origin https://github.com/Mauivision/Idea-Weaver.git
git add .
git commit -m "Initial Idea Weaver project"
git branch -M main
git push -u origin main
```

If repo has content:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Pushing test versions

**Branch per test:**
```bash
git checkout -b test/v1.2-feature-name
git add .
git commit -m "Test: feature description"
git push -u origin test/v1.2-feature-name
```

**Tags for releases:**
```bash
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin v1.2.0
```
