# Tech Debt Story TD-1-1: Recipe Data Model Hardening

## Status: ready-for-dev

> **Source:** ECC Code Review (2026-03-06) on story 1-1
> **Priority:** P2 | **Estimated Effort:** 2 pts

## Story
As a **developer**, I want **runtime Zod validation at the Firestore boundary and type derivation from schemas**, so that **malformed documents surface errors early and client types stay in sync with stored shapes**.

## Acceptance Criteria

### AC-1: Runtime Zod Validation in Recipe Service
- **Given** a Firestore document in the `recipes/` collection
- **When** `docToRecipe()` or `getRecipeById()` converts it
- **Then** the document is validated via `RecipeSchema.parse()` (or `.safeParse()` with error logging)

### AC-2: Separate Stored vs Hydrated Schema
- **Given** `RecipeSchema` currently includes `id` in the schema
- **When** a doc is read from Firestore (where `id` is `doc.id`, not in the document body)
- **Then** `id` is omitted from the stored schema and added after parse: `StoredRecipeSchema.omit({ id })` for parsing, full `RecipeSchema` for the hydrated type

### AC-3: Client Types Derived from Zod
- **Given** `RecipeIngredient` and `RecipeStep` interfaces duplicate Zod schema fields
- **When** the schema changes
- **Then** client types are derived from Zod types (`z.infer<typeof RecipeIngredientSchema> & { inPantry: boolean }`) to prevent drift

## Tasks / Subtasks

### Task 1: Add Runtime Validation (2 subtasks)
- [ ] 1.1: Update `docToRecipe()` to use `RecipeSchema.safeParse()` with error logging for invalid docs
- [ ] 1.2: Update `getRecipeById()` return path to use schema validation

### Task 2: Refactor Schema ID Handling (2 subtasks)
- [ ] 2.1: Create `StoredRecipeDocSchema` (without `id`) for Firestore document shape
- [ ] 2.2: Add `id` post-parse in converter functions

### Task 3: Derive Client Types from Zod (2 subtasks)
- [ ] 3.1: Derive `RecipeIngredient` from `RecipeIngredientSchema` + `inPantry`
- [ ] 3.2: Derive `RecipeStep` from `RecipeStepSchema`

## Dev Notes
- Source story: [1-1](./1.1-recipe-data-model.md)
- Review findings: #1, #2, #4
- Files affected: `src/types/recipe.ts`, `src/services/recipes.ts`, `src/types/recipe.test.ts`, `src/services/recipes.test.ts`
