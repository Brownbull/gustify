# Gustify — Project Memory

## What is Gustify?

A **cooking companion PWA** that transforms grocery purchases into culinary exploration.
It integrates with **Gastify** (sister expense-tracking app) to auto-populate pantry inventory from receipts, suggests recipes based on what's available, and guides users on a personalized culinary growth journey.

**Brand:** KUJTA AI · Gustify = "gusto" (taste/pleasure) + -ify · mirrors sister app Gastify ("gasto" = expense)
**Markets:** Chile first → Latin America → Spain → United States
**Language:** Spanish-first UI (`es`), i18n later

---

## Current Phase

**Phase 1 — MVP** (in development as of 2026-02-24)

The project foundation has been scaffolded. Planning artifacts are present alongside the initial codebase:
- `docs/scope/gustify_prd_20260224.md` — full PRD (single source of truth)
- `docs/mockups/v0/gustify_v0.jsx` — React prototype (reference only, not production code)

**Issue #1 (Firebase setup) is complete.** The Vite + React 18 + TypeScript + Tailwind CSS scaffold is in place with Firebase configured against the shared `boletapp-d609f` project. Local development uses the `demo-gustify` emulator project.

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React 18 + TypeScript                   |
| Styling      | Tailwind CSS                            |
| State        | Zustand (client) + TanStack Query (server) |
| Auth         | Firebase Auth — Google OAuth (shared with Gastify) |
| Database     | Cloud Firestore (Phase 1 MVP)           |
| AI           | Google Gemini API (gemini-2.5-flash)    |
| Build        | Vite                                    |
| Deployment   | Firebase Hosting                        |
| Database+    | PostgreSQL via Supabase/Neon (Phase 2)  |

**Shared Firebase project with Gastify** — same Auth + same Firestore instance.

---

## Architecture

```
Gastify (receipts) → item mapping → Gustify pantry → recipe suggestions → cooking log → exploration profile
                                                                              ↓
                                                                    Shopping list suggestions
```

Key constraint: **Gastify and Gustify share one Firebase project.** Auth is unified. Pantry is populated by mapping Gastify transaction items to canonical ingredients.

---

## Firestore Schema (Phase 1)

```
users/{userId}
  profile, cookingProfile, settings
  pantry/{ingredientId}       ← from mapped Gastify purchases
  cookedMeals/{mealId}        ← cooking log with ratings
  shoppingList/{listId}

canonicalIngredients/{id}     ← ingredient dictionary (es/en names, shelf life, category)
itemMappings/{hash}           ← Gastify raw item → canonicalId (crowdsource-able)
recipes/{recipeId}            ← curated set or Gemini-generated (Phase 1)
```

---

## Core Features

### Navigation
```
Home | Pantry | ✨ Explore (center, elevated) | Recipes | More
```

### Explore modes (the soul of the app)
- **Nueva Cocina** — cuisine not yet tried
- **Nueva Técnica** — technique not yet mastered
- **Nuevo Ingrediente** — ingredient never cooked with
- **Skill Stretch** — complexity slightly above current avg (capped at +1 tier)

Each mode guarantees **exactly one novel element** per suggestion.

### Proficiency tiers (implicit, derived from cooking history)
| Tier | Avg Complexity |
|------|---------------|
| Principiante | 1.0–2.0 |
| Cómodo | 2.0–3.0 |
| Aventurero | 3.0–4.0 |
| Avanzado | 4.0–5.0 |

### Exploration tracking sets (stored in `cookingProfile`)
```typescript
cookedCuisines: string[]     // cuisines the user has cooked
cookedTechniques: string[]   // techniques the user has used
cookedIngredients: string[]  // canonicalIds of ingredients used
```

---

## Development Setup

### Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Copy `.env.example` to `.env` and fill in values from Firebase Console > Project Settings > Web app (boletapp-d609f)

### Running locally

```bash
# Terminal 1 — Firebase emulators (Auth + Firestore)
npm run emulators          # uses demo-gustify project, ports: Auth 9099, Firestore 8080, UI 4000

# Terminal 2 — Vite dev server
npm run dev                # http://localhost:5173
```

`VITE_E2E_MODE=emulator` in `.env` forces emulator use in dev mode (default when `import.meta.env.DEV` is true).

### Important: Firestore rules
`firestore.rules` is for **emulator use only** and covers Gustify paths only. It **must not be deployed** to the shared `boletapp-d609f` project — doing so would overwrite Gastify's production rules. A unified rules file must be coordinated with the Gastify project before any production deployment.

### Deploying
```bash
npm run deploy             # builds and deploys to Firebase Hosting target "gustify"
```

---

## Development Conventions

- **Spanish-first:** All UI labels, copy, and user-facing strings in Spanish. Code/variables in English.
- **Canonical ingredients:** Always reference ingredients by `canonicalId`. Never store raw grocery strings in pantry/recipes.
- **Novelty guarantee:** Explore mode filters must ensure exactly one novel element per result.
- **Gemini for Phase 1 recipe suggestions:** No SQL recipe matching in Phase 1. Prompt Gemini with pantry + prefs + exploration mode → structured recipe JSON.
- **Mobile-first PWA:** All layouts designed for 375px+ first.
- **No SQL in Phase 1:** Firestore only until Phase 2 is triggered by query complexity.
- **Complexity scale:** 1–5 (integer). Complexity 1 = scrambled eggs. Complexity 5 = multi-component tasting menu.

---

## Key Files

| Path | Purpose |
|------|---------|
| `docs/scope/gustify_prd_20260224.md` | Full PRD — requirements, schema, roadmap |
| `docs/mockups/v0/gustify_v0.jsx` | UI reference prototype (React, not production) |
| `CLAUDE.md` | This file — project memory for AI tools |
| `src/config/firebase.ts` | Firebase app, Auth, and Firestore initialization; emulator detection via `VITE_E2E_MODE` |
| `src/lib/queryClient.ts` | TanStack Query client with default stale-time and retry config |
| `src/main.tsx` | App entry point — initializes Firebase before React mounts |
| `src/App.tsx` | Root component (placeholder until feature views are added) |
| `firebase.json` | Firebase Hosting config + emulator ports (Auth:9099, Firestore:8080, UI:4000) |
| `.firebaserc` | Firebase project alias — `default` maps to `boletapp-d609f` |
| `firestore.rules` | Firestore security rules — EMULATOR ONLY, do not deploy to production |
| `.env.example` | Required `VITE_FIREBASE_*` env vars template |

---

## MVP Roadmap (Phase 1)

| Priority | Issue | Feature |
|----------|-------|---------|
| P0 | #1 | Firebase project setup (shared with Gastify) |
| P0 | #2 | Auth — Firebase Auth + Google OAuth |
| P0 | #3 | Canonical ingredients dictionary (Firestore collection + seed data) |
| P0 | #4 | Item mapping — Map Gastify transaction items to canonical ingredients |
| P0 | #5 | Pantry view — display ingredients with expiry badges |
| P0 | #6 | Gemini-powered recipe suggestions |
| P1 | #7 | Explore view — 4 discovery modes with novelty guarantee |
| P1 | #8 | Exploration profile tracking (cuisines, techniques, ingredients sets) |
| P1 | #9 | Cooking log — "Cooked it!" button, ingredient deduction, rating |
| P1 | #10 | Recipe detail modal — ingredient checklist, steps, novelty badges |
| P2 | #11 | Shopping list with "Para explorar" section |
| P2 | #12 | Home dashboard — proficiency card, expiring items, top suggestions |
| P2 | #13 | Pattern-based purchase suggestions (frequency analysis) |

---

## GitHub

**Repo:** `https://github.com/Brownbull/gustify`
**Main branch:** `main`
**Issues:** Tasks are tracked as GitHub issues. Use `/next-task` to pick the next one.

---

## Workflow Rules

**`/next-task` runs end-to-end autonomously — it creates the branch, writes the code, opens the PR, and merges it.**

Before running `/ship` manually, always verify there is actually unshipped work:

```bash
git fetch origin
git log origin/main..HEAD --oneline   # empty = already merged, nothing to do
gh pr list --state open               # any open PR for this branch?
gh issue list --state closed          # is the issue already closed?
```

| Situation | Action |
|-----------|--------|
| `/next-task` ran to completion | Nothing — it already shipped |
| `/next-task` was interrupted mid-way | Run `/ship` to finish |
| You wrote code manually on a branch | Run `/ship` |

**Never run `/ship` on a branch whose issue is already closed.**

---

## Related Projects

- **Gastify** (`github.com/Brownbull/gastify` or similar) — sister app, shares Firebase project
- **KUJTA AI** — parent company umbrella
