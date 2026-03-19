# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo for **M365 Copilot Chat on Web App**. Multiple implementation patterns (patternA, patternB, …) live side-by-side so they can be compared and evaluated. Each pattern has its own backend (Express.js) and frontend (Vue.js + Vite) under `patternX/apps/`.

## Commands

```bash
# Install all dependencies (run from root)
npm install

# Lint (all packages)
npm run lint
npm run lint:fix        # with auto-fix
npm run format          # format only

# Test a specific workspace
npm test --workspace=patternA/apps/backend
npm test --workspace=patternA/apps/frontend

# Build all workspaces
npm run build

# Dev server (frontend)
npm run dev --workspace=patternA/apps/frontend
```

## Architecture

- **NPM Workspaces** monorepo. Volta pins Node.js 24.14.0 / npm 11.9.0.
- Each pattern follows this layout:
  ```
  patternX/
  ├── package.json          # aggregates scripts for the pattern
  └── apps/
      ├── backend/          # Express.js, ESM
      └── frontend/         # Vue.js SFC + Vite
  ```
- Backend: `createApp()` factory returns the Express app; `startServer()` is separate for testability.
- Frontend: Vue Single File Components.
- All packages use JavaScript with ESM (`"type": "module"`). TypeScript adoption is per-pattern.

## Code Style (Biome)

Biome (`biome.json`) enforces all formatting and linting — no ESLint/Prettier:
- 2-space indent, double quotes, trailing commas (ES5), 100-char line width
- Import organization enabled

## Testing

- **Vitest** with TDD (Classical School): Red → Green → Refactor.
- Never mix behavior changes and refactoring in the same step.
- Backend tests use **supertest** (no port needed). Frontend tests use **@vue/test-utils** + **happy-dom**.
- Test files go in `src/__tests__/`.

## Adding a New Pattern

1. Create `patternX/apps/backend/` and `patternX/apps/frontend/` with their `package.json` files.
2. Create `patternX/package.json` to aggregate scripts.
3. Add `"patternX"` and `"patternX/apps/*"` to root `workspaces`.
4. Add test/build jobs to `.github/workflows/ci.yml`.
5. See `README.md` and `.github/prompts/add-pattern.prompt.md` for details.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`/`develop`. Currently lint only — each new pattern should add its own test and build jobs.
