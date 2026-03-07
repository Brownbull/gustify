# Tech Debt Story TD-1-4: Recipe UX Hardening

## Status: review

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
