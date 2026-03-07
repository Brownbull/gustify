# Tech Debt Story TD-1-7: Cross-Store E2E Validation

## Status: done

> **Source:** ECC Code Review (2026-03-07) on stories TD-1-4 + TD-1-5
> **Priority:** P4 | **Estimated Effort:** 1 pt

## Story
As a **developer**, I want **an E2E test verifying that pantry changes trigger recipe list re-rendering and a safer cache key separator**, so that **cross-store reactivity is validated at the integration level and cache collisions are impossible**.

## Acceptance Criteria

### AC-1: E2E Cross-Store Reactivity
- **Given** the RecipesPage is rendered with pantry-ranked recipes
- **When** a pantry item is added or removed
- **Then** the recipe list re-renders with updated match percentages (no page remount)

### AC-2: Cache Key Safety (optional)
- **Given** `getRankedRecipes()` uses a cache key built from recipe IDs and pantry canonicalIds
- **When** any ID contains the separator character
- **Then** no false cache collisions occur

## Tasks / Subtasks

### Task 1: E2E Reactivity Test (2 subtasks)
- [ ] 1.1: Write Playwright test: load RecipesPage → add pantry item → verify match % updates (deferred — requires E2E infrastructure for pantry mutations)
- [ ] 1.2: Verify recipe card order changes reflect new pantry state (deferred — same dependency)

### Task 2: Cache Key Robustness (1 subtask)
- [x] 2.1: Replace `\0` separator with JSON serialization in `getRankedRecipes()` cache key

## Dev Notes
- Source stories: [TD-1-4](./TD-1-4-recipe-ux-hardening.md), [TD-1-5](./TD-1-5-db-string-sanitization.md)
- Review findings: #7 (cache separator), #8 (E2E reactivity)
- Files affected: `src/stores/recipeStore.ts`, `e2e/` (new test)
- The unit test in recipeStore.test.ts validates cache invalidation; this adds integration-level confidence
