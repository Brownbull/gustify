# Tech Debt Story TD-1-4: Recipe UX Hardening

## Status: done

> **Source:** ECC Code Review (2026-03-06) on story 1-4-recipe-search-filtering
> **Priority:** P3 | **Estimated Effort:** 2 pts

## Story
As a **developer**, I want **cross-store reactivity fixed and modal accessibility improved**, so that **pantry changes reliably update the recipe list cuisines and the recipe detail modal meets basic a11y standards**.

## Acceptance Criteria

### AC-1: Cross-Store Reactivity
- **Given** `RecipesPage` renders with ranked recipes
- **When** pantry items change in `pantryStore`
- **Then** `getRankedRecipes()` re-evaluates and the cuisine list / match percentages update without requiring a page remount

### AC-2: Modal Keyboard Dismiss
- **Given** the recipe detail modal is open
- **When** the user presses Escape
- **Then** the modal closes

### AC-3: Modal Focus Trap
- **Given** the recipe detail modal is open
- **When** the user tabs through interactive elements
- **Then** focus stays within the modal until it is closed

## Tasks / Subtasks

### Task 1: Fix Cross-Store Stale Read (2 subtasks)
- [x] 1.1: Subscribe to `usePantryStore` items within `RecipesPage` so React re-renders when pantry changes (already in place from story 1-5)
- [x] 1.2: Verify `cuisines` memo and match percentages update when pantry items are added/removed (regression test added to recipeStore.test.ts)

### Task 2: Modal Accessibility — N/A
> AC-2 and AC-3 are obsolete: the recipe detail modal was replaced by `RecipeDetailPage` with React Router in story 1-5.
- ~~2.1: Add `useEffect` keydown listener for Escape key to close modal~~
- ~~2.2: Implement focus trap (trap Tab/Shift+Tab within modal, restore focus on close)~~

## Dev Notes
- Source story: [1.4-recipe-search-filtering](./1.4-recipe-search-filtering.md)
- Review findings: #3 (cross-store stale read), #6 (modal keyboard dismiss + focus trap)
- Files affected: `src/pages/RecipesPage.tsx`, `src/stores/recipeStore.ts`
- For focus trap, consider a lightweight hook or library (e.g., `focus-trap-react`) to avoid reinventing
- The modal will be migrated to a dedicated `RecipeDetailPage` in story 1-5; coordinate to avoid throwaway work

## Senior Developer Review (ECC)
- **Date:** 2026-03-07
- **Agents:** code-reviewer (8/10), security-reviewer (9/10)
- **Classification:** STANDARD | **Overall:** 8.5/10 APPROVE
- **Quick fixes:** 0 (no TD-1-4-specific fixes needed)
- **Deferred:** TD-1-7 (E2E cross-store validation + cache key robustness)

| TD Story | Description | Priority | Action |
|----------|-------------|----------|--------|
| TD-1-7 | Cross-store E2E validation + cache robustness | P4 | CREATED |

<!-- CITED: L2-004 (TOCTOU), L2-007 (DB-sourced injection) -->
