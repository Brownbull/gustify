# Tech Debt Story TD-1-5: DB-Sourced String Sanitization

## Status: ready-for-dev

> **Source:** ECC Code Review (2026-03-06) on story 1-5-recipe-detail-react-router
> **Priority:** P2 | **Estimated Effort:** 2 pts

## Story
As a **developer**, I want **all DB-sourced strings sanitized before rendering**, so that **stored XSS via Gemini-generated or user-contributed recipe content is prevented**.

## Acceptance Criteria

### AC-1: Shared Sanitize Utility
- **Given** a new `sanitizeText` utility in `src/lib/sanitize.ts`
- **When** called with any string
- **Then** it strips dangerous HTML/script content while preserving safe text

### AC-2: Recipe Detail Sanitization
- **Given** RecipeDetailPage renders a recipe
- **When** `recipe.name`, `recipe.description`, `step.instruction`, or `ing.name` contain HTML or script tags
- **Then** they are sanitized before rendering (defense-in-depth beyond React's JSX escaping)

### AC-3: Recipe Card Sanitization
- **Given** RecipeCard renders recipe data
- **When** recipe fields contain potentially dangerous content
- **Then** they are passed through `sanitizeText` at the rendering boundary

## Tasks / Subtasks

### Task 1: Create Sanitize Utility (2 subtasks)
- [ ] 1.1: Create `src/lib/sanitize.ts` with `sanitizeText(input: string, opts?: { maxLength?: number }): string`
- [ ] 1.2: Add unit tests for sanitize utility (HTML tags, script injection, normal text passthrough)

### Task 2: Apply to Recipe Rendering (2 subtasks)
- [ ] 2.1: Apply `sanitizeText` to DB-sourced fields in `RecipeDetailPage.tsx` (name, description, instructions, ingredient names)
- [ ] 2.2: Apply `sanitizeText` to DB-sourced fields in `RecipeCard.tsx`

## Dev Notes
- Source story: [1.5-recipe-detail-react-router](./1.5-recipe-detail-react-router.md)
- Review findings: #2 (DB-sourced value injection prevention — project pattern #7)
- Files affected: `src/lib/sanitize.ts` (CREATE), `src/pages/RecipeDetailPage.tsx`, `src/components/RecipeCard.tsx`
- React's JSX escaping already prevents most XSS, but project pattern #7 requires explicit sanitization as defense-in-depth
- Recipes are Gemini-generated (Phase 1) and may become user-contributed (Phase 2+)
