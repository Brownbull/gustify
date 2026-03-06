---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
lastStep: 7
status: 'complete'
completedAt: '2026-03-06'
inputDocuments:
  - _kdbp-output/planning-artifacts/prd.md
  - docs/scope/gustify_prd_20260224.md
workflowType: 'architecture'
project_name: 'Gustify'
user_name: 'Gabe'
date: '2026-03-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Functional Requirements: 48 FRs across 9 capability areas

| Area | FR Count | Highlights |
|------|----------|------------|
| Identity & Access | 6 | Google OAuth shared with Gastify, dietary/allergy profile |
| Ingredient Management | 8 | Canonical dictionary, item mapping, auto-resolve, crowdsourced |
| Pantry Management | 7 | Auto-populated from Gastify, expiry tracking, cooking deduction |
| Recipe Discovery | 9 | Pantry match %, search/filter, allergen exclusion |
| Recipe Contribution | 12 | Dual-path generation (external prompt + built-in Gemini), parsing, dedup, manual entry |
| Recipe Detail | 6 | Ingredient checklist, steps, complexity, "Cooked it!" |
| Cooking & Exploration Tracking | 7 | Cooking log, ratings, exploration profile, proficiency tiers |
| Prepared Meals | 3 | Curated meal types, user flagging |
| Navigation & Views | 3 | Bottom nav, auth guard, Spanish UI |

### Non-Functional Requirements: 17 NFRs across 5 categories

| Category | Count | Key Targets |
|----------|-------|-------------|
| Performance | 7 | <3s initial load, <500ms navigation, <10s Gemini call |
| Security | 9 | Firebase Auth only, user-scoped Firestore rules, server-side API keys |
| Integration | 5 | Shared Firestore with Gastify (read-only), coexisting security rules |
| Internationalization | 4 | Spanish-first UI, English code, bilingual ingredient names |
| Accessibility | 5 | WCAG 2.1 AA, 44px touch targets, screen reader support |

### Technical Constraints

1. **Shared Firebase project** with Gastify — cannot break Gastify's Firestore rules or auth
2. **Brownfield codebase** — Issues #1-6 already implemented (auth, ingredients, mapping, pantry, Gemini recipes)
3. **Solo developer** — architecture must be simple enough for one person to maintain
4. **Mobile-first PWA** — 375px+ primary target, installable
5. **No SQL in MVP** — Firestore only until Phase 2
6. **Gemini API via Cloud Functions** — API key isolated server-side
7. **Curated-first data model** — ingredients, meals, recipes start as fixed sets, grow via contributions

### Scale Assessment: Medium

- General domain (no compliance/regulatory)
- ~48 FRs is moderate scope
- Integration complexity with Gastify adds a layer
- AI integration (dual-path recipe generation) adds novelty
- Single-user model for now (no multi-tenant, no real-time collaboration)

### Key Cross-Cutting Concerns

1. **Data integrity across apps** — Gustify reads Gastify data without modifying it
2. **Allergen safety** — V5: "Health constraints are walls, not suggestions" — strict filtering, no false negatives
3. **Offline support** — Firestore caching for pantry/recipes, graceful degradation for AI features
4. **Spanish-first i18n** — all UI in Spanish, architecture must support future languages
5. **Recipe deduplication** — name similarity + ingredient matching (unresolved design from PRD session)

## Starter Template Evaluation

### Primary Technology Domain: Web Application (PWA/SPA)

Client-heavy single-page application with a thin Cloud Functions backend for API key isolation. Mobile-first, installable PWA served via Firebase Hosting.

### Starter Template: N/A (Brownfield)

Project was scaffolded from scratch with Vite + React + TypeScript. No starter template — appropriate because the shared Firebase project constraint and Gastify integration require custom architecture from day one. Stack mirrors Gastify for ecosystem consistency.

### Architectural Decisions Provided by Stack

| Decision | Choice | Status |
|----------|--------|--------|
| Rendering | Client-side SPA (no SSR) | Locked |
| Build | Vite | Locked |
| Language | TypeScript | Locked |
| Styling | Tailwind CSS (utility-first) | Locked |
| Client State | Zustand (lightweight stores) | Locked |
| Server State | TanStack Query (cache, stale-time, retry) | Locked |
| Auth | Firebase Auth (Google OAuth) | Locked — shared with Gastify |
| Database | Firestore (Phase 1), PostgreSQL (Phase 2) | Phase 1 locked |
| Hosting | Firebase Hosting (staging + production) | Locked |
| Backend Logic | Cloud Functions (Node 20, CommonJS) | Locked |
| Unit Testing | Vitest | Locked |
| E2E Testing | Playwright | Locked |
| Package Manager | npm | Locked |

### Open Architectural Questions (for Steps 4-6)

- Component organization pattern (feature-based vs. layer-based)
- Recipe data model for dual-path contribution (external paste vs. built-in Gemini)
- Deduplication algorithm design
- Allergen filtering architecture (client-side vs. Firestore query)
- Offline caching strategy beyond Firestore defaults
- i18n architecture (future-proofing for multi-language)

## Core Architectural Decisions

### Decision Priority Analysis

| Priority | Decision | Category | Status |
|----------|----------|----------|--------|
| Critical | Recipe data model (contribution paths) | Data | Decided |
| Critical | Allergen filtering strategy | Data | Decided |
| Important | Validation library | Data | Decided |
| Important | Component organization | Frontend | Decided |
| Important | Error handling pattern | API/Comms | Decided |
| Important | Routing strategy | Frontend | Decided |
| Important | Recipe write authorization | Security | Decided |
| Important | CI/CD | Infrastructure | Decided |
| Deferrable | i18n framework | Frontend | Deferred to Phase 2+ |
| Deferrable | Monitoring/observability | Infra | Deferred to post-launch |

### 1. Data Architecture

**Validation library: Zod**
- TypeScript-native schema validation with type inference
- Defines recipe schema once — produces both TypeScript types and runtime validation
- Used by both the external paste path (FR-5.4) and built-in Gemini path (FR-5.5)
- Produces field-level error messages for parse failures (FR-5.12)

**Recipe data model: Client-side parse + Cloud Function store**
- External paste path: user pastes JSON -> client validates with Zod (instant feedback) -> sends validated object to Cloud Function for dedup + storage
- Built-in Gemini path: Cloud Function generates + validates + dedup checks + stores in one step
- Both paths produce the same Zod-validated recipe structure
- Rationale: fast feedback on parse errors for external path, single source of truth for storage

**Allergen filtering: Hybrid (Firestore query + client-side exclusion)**
- Firestore handles primary diet tag filtering via `array-contains` queries
- Client-side performs allergen exclusion pass (Firestore `not-in` limited to 10 values)
- Safety layer: no unsafe recipe reaches the UI
- V5: "Health constraints are walls, not suggestions" — strict, auditable filtering
- Performance acceptable with recipe pool <10,000 (NFR-1.3)

### 2. Authentication & Security

**Recipe write authorization: Cloud Function mediates all writes**
- No direct client writes to `recipes/` collection
- All recipe contributions go through Cloud Function for validation + dedup checking (FR-5.8/5.9)
- Provides implicit rate limiting per user
- Firestore rules: `allow write: if false` on `recipes/` (only Cloud Function admin SDK can write)

### 3. API & Communication

**Error handling: Structured error responses**
- Consistent `{ success: boolean, data?: T, errors?: Array<{ field, message }> }` result type
- Used across all service calls (recipe parsing, Gemini calls, mapping operations)
- Zod parse errors naturally produce field-level messages
- Enables clear UI feedback for recipe parsing failures (FR-5.12)

### 4. Frontend Architecture

**Component organization: Layer-based (current structure)**
- Keep existing `components/`, `pages/`, `services/`, `stores/`, `types/` structure
- ~50 files, solo developer — no reorganization needed
- If a feature grows complex (e.g., recipe contribution), create a `features/` folder then
- No preemptive migration

**Routing: React Router v6**
- 5 top-level routes: Home, Pantry, Explore, Recipes, More
- Recipe detail as modal or nested route
- Standard for React SPAs, well-documented

### 5. Infrastructure & Deployment

**CI/CD: GitHub Actions (near-term)**
- Set up GitHub Actions with E2E test gating on PRs
- Playwright infrastructure already in place (staging env, test users, custom token auth)
- Pipeline: lint + typecheck + vitest + playwright -> deploy to staging
- Production deploys remain manual (`npm run deploy`) until pipeline is proven

### Decision Impact Analysis

| Decision | Cascading Effect |
|----------|-----------------|
| Zod | Recipe schema defined once -> TS types + runtime validation. Shared by paste path, Gemini path, and manual entry form. |
| Client parse + CF store | Recipe contribution architecture: client validates -> CF dedup checks -> Firestore write. Built-in path: CF does everything. |
| Hybrid allergen filtering | Firestore queries for diet tags, client-side exclusion for allergens. Auditable safety layer. |
| CF mediates recipe writes | No direct client writes to `recipes/`. All contributions validated + deduped server-side. |
| Structured errors | Consistent result type across all service calls. Enables field-level UI feedback. |
| Layer-based structure | No migration cost. Incremental `features/` folders only when complexity warrants. |
| GitHub Actions | E2E tests gate PRs. Catches regressions before merge. |

## Implementation Patterns & Consistency Rules

### 1. Naming Conventions

**Firestore collection paths:** `camelCase`. Subcollections: `users/{userId}/collectionName`.
- Correct: `canonicalIngredients`, `itemMappings`, `users/{userId}/pantry`
- Incorrect: `canonical_ingredients`, `item-mappings`, `Pantry`

**TypeScript interfaces:** PascalCase, no `I` prefix.
- Correct: `PantryItem`, `CanonicalIngredient`, `Recipe`
- Incorrect: `IPantryItem`, `pantryItem`

**Service functions:** `verbNoun` camelCase. Async returns `Promise<T>`. First param `userId` for user-scoped ops.
- Correct: `getUserPantry(userId)`, `addToPantry(userId, ...)`
- Incorrect: `pantryGet(userId)`, `deletePantryItem(id, userId)`

**Zustand stores:** One file per store in `stores/`. Hook: `use{Domain}Store`. State: `{Domain}State`.
- Correct: `useRecipeStore` in `stores/recipeStore.ts`
- Incorrect: `recipeStore` (no `use` prefix), `stores/recipe/index.ts`

**File naming:** `kebab-case.ts` for services/types/libs. `PascalCase.tsx` for components/pages.
- Correct: `services/gastify-transactions.ts`, `pages/PantryPage.tsx`
- Incorrect: `services/GastifyTransactions.ts`, `components/recipe-card.tsx`

### 2. Structural Patterns

**Service layer:** All Firestore operations go through `services/`. Components never import Firestore SDK directly.

**Cloud Function calls:** Client calls via `services/` wrapper using `httpsCallable`. No direct `fetch` to function URLs.

**Test file location:** Co-located. `{filename}.test.ts(x)` next to `{filename}.ts(x)`.

**Type definitions:** All shared types in `types/`. One file per domain concept.

### 3. Data Flow Patterns

**Firestore path helpers:** Each service defines a private `{collection}Path()` function. No hardcoded paths scattered.
```typescript
function pantryPath(userId: string) { return `users/${userId}/pantry` }
```

**Document-to-type conversion:** Each service defines `docTo{Type}()`. Adds `id` from `doc.id`, spreads `doc.data()`.
```typescript
function docToPantryItem(d: QueryDocumentSnapshot) { return { id: d.id, ...d.data() } as PantryItem }
```

**Real-time subscriptions:** `subscribeTo{Collection}(userId, callback, onError?)` returns unsubscribe. Zustand store manages lifecycle.

### 4. API & Error Handling Patterns

**Service result type** for fallible operations:
```typescript
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Array<{ field?: string; message: string }> }
```
Apply to: recipe parsing, recipe contribution, Gemini calls.
Don't apply to: simple Firestore CRUD (throw on failure, caught by store).

**Zod schemas** live in `types/` next to the interface they validate. Schema: `{Type}Schema`. Infer type from schema.
```typescript
// types/recipe.ts
export const RecipeSchema = z.object({ ... })
export type Recipe = z.infer<typeof RecipeSchema>
```

**Error messages:** User-facing in Spanish. Log messages in English.
- Correct: `'Error al generar sugerencias'` (user), `console.error('Failed to fetch', err)` (log)

### 5. UI Patterns

**Page components:** One per file in `pages/`. Receives navigation callbacks as props (until React Router). Manages own data via stores/hooks.

**Loading/empty/error states:** Every data view handles 3 states.
```tsx
{loading ? <Spinner /> : items.length === 0 ? <EmptyState /> : <ItemList />}
```

**Tailwind class ordering:** layout -> sizing -> spacing -> typography -> colors -> effects.
```tsx
className="flex items-center gap-3 text-sm font-medium text-primary"
```

**Mobile-first responsive:** Base styles are mobile (375px+). Add `sm:`, `md:` only when needed. Touch targets min `py-3 px-4` (44px+).

### Enforcement Guidelines

| Pattern | Enforced By |
|---------|-------------|
| File naming | Code review + linter |
| Co-located tests | CI check |
| No direct Firestore in components | Code review |
| Spanish user-facing strings | Code review |
| Zod schemas in `types/` | Code review |
| `ServiceResult<T>` for fallible ops | Code review |
| Mobile-first Tailwind | Code review |

## Project Structure & Boundaries

### Directory Structure

```
gustify/
├── src/                        # Client-side application
│   ├── main.tsx                # App entry — Firebase init before React mount
│   ├── App.tsx                 # Root component, routing, bottom nav
│   ├── config/                 # App configuration
│   │   └── firebase.ts         # Firebase app, Auth, Firestore init
│   ├── types/                  # TypeScript interfaces + Zod schemas
│   │   ├── user.ts             # UserProfile, CookingProfile, ProficiencyTier
│   │   ├── ingredient.ts       # CanonicalIngredient, IngredientCategory
│   │   ├── recipe.ts           # Recipe, GeminiRecipe, RecipeIngredient
│   │   ├── pantry.ts           # PantryItem, EnrichedPantryItem
│   │   ├── gastify.ts          # GastifyTransaction, GastifyTransactionItem
│   │   ├── item-mapping.ts     # ItemMapping, normalizeItemName
│   │   ├── prepared-food.ts    # CanonicalPreparedFood
│   │   └── cooking-log.ts      # CookedMeal (future)
│   ├── services/               # Firestore + API operations (data layer)
│   │   ├── auth.ts             # signIn, signOut, ensureUserProfile
│   │   ├── ingredients.ts      # getCanonicalIngredients, getByCategory
│   │   ├── pantry.ts           # addToPantry, getUserPantry, subscribeToPantry
│   │   ├── gastify-transactions.ts  # getUserTransactions, extractCookingItems
│   │   ├── item-mappings.ts    # getAllMappings, getMapping, createMapping
│   │   ├── gemini.ts           # suggestRecipes (Cloud Function callable)
│   │   ├── prepared-foods.ts   # Prepared food queries
│   │   ├── unknown-items.ts    # Unknown item handling
│   │   ├── recipes.ts          # Recipe pool queries (future)
│   │   ├── recipe-contribution.ts  # Parse, validate, submit (future)
│   │   └── cooking-log.ts      # Cooked meals CRUD (future)
│   ├── stores/                 # Zustand state management
│   │   ├── authStore.ts        # useAuthStore
│   │   ├── pantryStore.ts      # usePantryStore
│   │   ├── mappingStore.ts     # useMappingStore
│   │   ├── recipeStore.ts      # useRecipeStore
│   │   ├── cookingLogStore.ts  # useCookingLogStore (future)
│   │   └── explorationStore.ts # useExplorationStore (future)
│   ├── components/             # Reusable UI components
│   ├── pages/                  # View-level components (one per route)
│   │   ├── LoginPage.tsx
│   │   ├── MapItemsPage.tsx
│   │   ├── PantryPage.tsx
│   │   ├── RecipesPage.tsx
│   │   ├── HomePage.tsx        # Home dashboard (future)
│   │   ├── ExplorePage.tsx     # 4 discovery modes (Growth phase)
│   │   ├── RecipeDetailPage.tsx # Full recipe view (future)
│   │   └── MorePage.tsx        # Settings, profile (future)
│   ├── lib/                    # Pure utility functions (no side effects)
│   ├── server/                 # Dev-only server utilities
│   └── test/                   # Test infrastructure
│
├── functions/                  # Cloud Functions (Node 20, CommonJS)
│   └── src/
│       ├── index.ts            # Function exports
│       ├── suggestRecipes.ts   # Gemini recipe suggestion callable
│       ├── contributeRecipe.ts # Dedup + store recipe CF (future)
│       └── prompts/            # Gemini prompt templates
│
├── e2e/                        # Playwright E2E tests
│   ├── fixtures/               # Test users, auth helpers
│   ├── scripts/                # Seed/cleanup scripts
│   └── tests/                  # Test files by feature area
│
├── scripts/                    # CLI utilities (seed data)
└── docs/                       # Documentation
```

### Architectural Boundaries

```
pages/ --> stores/ --> services/ --> Firestore
  |            |                       ^
  +--> components/                     |
                                       |
types/ <-- shared across all layers    |
lib/   <-- pure utilities, no deps     |
                                       |
services/ --> Cloud Functions (httpsCallable)
                    |
                    v
              Gemini API
              Firestore (admin SDK writes to recipes/)
```

**Boundary rules:**
1. Pages call stores or services — never Firestore SDK directly
2. Components receive data via props — no direct store/service access
3. Services own all Firestore paths — one service per collection family
4. Cloud Functions own all external API calls and privileged writes
5. Gastify data is read-only — Gustify never writes to Gastify collections
6. Types are shared across all layers

### Firestore Data Ownership

| Collection | Owner | Client Read | Client Write | CF Write |
|------------|-------|-------------|--------------|----------|
| `users/{uid}` (profile doc) | Gustify | Owner only | Owner only | No |
| `users/{uid}/pantry/` | Gustify | Owner only | Owner only | No |
| `users/{uid}/cookedMeals/` | Gustify | Owner only | Owner only | No |
| `users/{uid}/shoppingList/` | Gustify | Owner only | Owner only | No |
| `canonicalIngredients/` | Gustify | All auth | No | Admin only |
| `recipes/` | Gustify | All auth | No | Yes (dedup + validate) |
| `itemMappings/` | Gustify | All auth | Auth (immutable) | No |
| `users/{uid}/transactions/` | Gastify | Read-only | Never | Never |

## Validation Results

### Coherence: Pass
All decisions are compatible. Zod + Cloud Functions + structured errors form a consistent pipeline. Layer-based structure aligns with brownfield codebase.

### Requirements Coverage: Pass (48/48 FRs have architectural homes)

| Area | Status |
|------|--------|
| FR-1 Identity & Access | Covered (auth service + authStore) |
| FR-2 Ingredient Management | Covered (ingredients service + canonical dictionary) |
| FR-3 Pantry Management | Covered (pantry service + pantryStore + real-time) |
| FR-4 Recipe Discovery | Covered (recipes service + hybrid allergen filtering) |
| FR-5 Recipe Contribution | Covered (Zod client parse + contributeRecipe CF) |
| FR-6 Recipe Detail | Covered (RecipeDetailPage + recipe types) |
| FR-7 Cooking & Exploration | Covered (cooking-log service + cookingLogStore) |
| FR-8 Prepared Meals | Covered (prepared-foods service) |
| FR-9 Navigation & Views | Covered (React Router v6 + 5-tab nav) |
| NFR-1 Performance | Covered (Firestore caching, lazy loading) |
| NFR-2 Security | Covered (CF-mediated writes, user-scoped rules) |
| NFR-3 Integration | Covered (shared Firestore, read-only Gastify) |
| NFR-4 i18n | Deferred (Spanish-first, framework post-MVP) |
| NFR-5 Accessibility | Covered (mobile-first, touch targets, semantic HTML) |

### Implementation Readiness: Pass (0 critical gaps)

| Gap | Priority | Resolution |
|-----|----------|------------|
| Recipe dedup algorithm | Important | Normalize name + Jaccard similarity on ingredient canonicalIds, threshold 0.8 |
| React Router migration | Important | Replace state-based routing when adding Explore tab |
| Offline caching | Deferrable | Firestore SDK offline cache sufficient for MVP |
| i18n framework | Deferrable | Phase 2+ |
| Monitoring | Deferrable | Post-launch |
