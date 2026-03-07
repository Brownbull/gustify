# Tech Debt Story TD-1-3: Recipe Browsing Component Tests

## Status: done

> **Source:** ECC Code Review (2026-03-06) on story 1-3-recipe-browsing
> **Priority:** P2 | **Estimated Effort:** 2 pts

## Story
As a **developer**, I want **component-level tests for RecipesPage UI states**, so that **loading, empty, and error states (AC-3/4/5) are verified at the rendering layer, not just through store/service unit tests**.

## Acceptance Criteria

### AC-1: Loading State Component Test
- **Given** `recipeStore.loading` is `true`
- **When** `RecipesPage` renders
- **Then** a loading spinner with `data-testid="recipe-loading-state"` is visible

### AC-2: Empty State Component Test
- **Given** `recipeStore.loading` is `false` and `recipes` is empty
- **When** `RecipesPage` renders
- **Then** the empty state message with `data-testid="recipe-empty-state"` is visible

### AC-3: Error State Component Test
- **Given** `recipeStore.error` is a non-null string
- **When** `RecipesPage` renders
- **Then** an error message with `data-testid="recipe-error-state"` and a "Reintentar" button are visible
- **When** the retry button is clicked
- **Then** `unsubscribe()` and `subscribe()` are called in sequence

### AC-4: Zero Results State Component Test
- **Given** filters are active and `getFilteredRecipes()` returns an empty array
- **When** `RecipesPage` renders
- **Then** "No se encontraron recetas" message with `data-testid="recipe-no-results"` is visible

### AC-5: Recipe List Renders in Ranked Order
- **Given** `recipeStore` has recipes with different pantry match percentages
- **When** `RecipesPage` renders
- **Then** `RecipeCard` components appear in descending match % order

## Tasks / Subtasks

### Task 1: Create RecipesPage.test.tsx (4 subtasks)
- [x] 1.1: Set up test file with Zustand store mocks for recipeStore and pantryStore
- [x] 1.2: Test loading state renders spinner
- [x] 1.3: Test empty state renders message
- [x] 1.4: Test error state renders message and retry button triggers re-subscription
- [x] 1.5: Test zero-results state shows "No se encontraron recetas" when filters active but no matches

### Task 1.5: subscribeToRecipes Service Test (2 subtasks)
- [x] 1.5.1: Test subscribeToRecipes filters invalid docs via docToRecipe and logs errors
- [x] 1.5.2: Test subscribeToRecipes onError callback invocation on Firestore error

### Task 2: RecipeCard Component Test (2 subtasks)
- [x] 2.1: Test RecipeCard renders name, cuisine, match %, complexity, cook time
- [x] 2.2: Test RecipeCard click calls onSelect with recipe

## Dev Notes
- Source story: [1-3-recipe-browsing](./1.3-recipe-browsing.md)
- Review findings: #3 (TDD guide: AC-3/4/5 missing component tests), 1-4 review #8 (AC-6 zero-results UI test), TD-1-1 review #1 (subscribeToRecipes service untested)
- Files affected: `src/pages/RecipesPage.tsx`, `src/components/RecipeCard.tsx`
- Use `@testing-library/react` for component rendering
- Mock Zustand stores to control state per test case

### Review Quick Fixes Applied (2026-03-06)
- #1: Refactored `setStoreState` to accept `filteredRecipes` param — eliminates fragile double-setter pattern
- #3: Replaced complexity label forEach loop with `it.each` for clarity

### Deferred Items
| # | Finding | Reason Deferred |
|---|---------|-----------------|
| 2 | Duplicate `makeRankedRecipe` factory across test files | LOW severity, test-only DRY concern — not worth separate story |
