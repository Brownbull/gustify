# Tech Debt Story TD-1-2: Seed Script Hardening

## Status: review

> **Source:** ECC Code Review (2026-03-06) on story 1-2
> **Priority:** P3 | **Estimated Effort:** 1 pt

## Story
As a **developer**, I want **the recipe seed script to have retry logic, precise error scoping, and efficient reads**, so that **large-scale seeding is resilient and performant**.

## Acceptance Criteria

### AC-1: Batch Commit Retry with Exponential Backoff
- **Given** a batch commit fails due to a transient error
- **When** the seed script retries
- **Then** it uses exponential backoff (max 3 retries) before giving up on that batch

### AC-2: Efficient Idempotency Check
- **Given** the recipes collection has thousands of documents
- **When** checking for existing IDs
- **Then** use `select()` to fetch only document IDs instead of full documents

### AC-3: Forward-Compatible Category Mapping
- **Given** a new category is added to `CanonicalIngredient`
- **When** `CANONICAL_CATEGORY` map is built
- **Then** it derives from the `IngredientCategory` type rather than a hardcoded string map

## Tasks / Subtasks

### Task 1: Retry Logic (2 subtasks)
- [x] 1.1: Add retry wrapper with exponential backoff (max 3 retries, 1s/2s/4s)
- [x] 1.2: Apply to batch commit calls in `seed-recipes.ts`

### Task 2: Efficient Reads (1 subtask)
- [x] 2.1: Replace `adminDb.collection('recipes').get()` with `.select().get()` for ID-only reads

### Task 3: Category Map (1 subtask)
- [x] 3.1: Derive `CANONICAL_CATEGORY` from `IngredientCategory` type in `seed-recipes-helpers.ts`

## Dev Notes
- Source story: [1-2](./1.2-recipe-seed-script.md)
- Review findings: #2, #3, #5, #7
- Files affected: `scripts/seed-recipes.ts`, `scripts/data/seed-recipes-helpers.ts`
- Low priority — seed script is run-once per environment and can be re-run on failure
