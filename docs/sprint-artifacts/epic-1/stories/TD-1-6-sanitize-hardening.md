# Tech Debt Story TD-1-6: Sanitize Utility Hardening

## Status: ready-for-dev

> **Source:** ECC Code Review (2026-03-07) on stories TD-1-4 + TD-1-5
> **Priority:** P3 | **Estimated Effort:** 1 pt

## Story
As a **developer**, I want **the sanitize utility to handle multi-layer entity encoding and validate codepoint ranges**, so that **the defense-in-depth layer is robust even if reused outside JSX contexts**.

## Acceptance Criteria

### AC-1: Recursive Decode-Strip Loop
- **Given** input with triple-encoded entities (e.g., `&amp;lt;script&amp;gt;`)
- **When** passed through `sanitizeText`
- **Then** the decode+strip loop runs until output stabilizes, leaving no residual angle brackets

### AC-2: Codepoint Validation
- **Given** numeric entities with out-of-range codepoints (e.g., `&#xFFFFFF;`)
- **When** decoded by `decodeEntities`
- **Then** invalid codepoints are replaced with a safe fallback (e.g., U+FFFD replacement character)

## Tasks / Subtasks

### Task 1: Stabilization Loop (2 subtasks)
- [ ] 1.1: Replace single decode+strip pass with `while (prev !== result)` loop (max 5 iterations)
- [ ] 1.2: Add test cases for double and triple-encoded entities

### Task 2: Codepoint Validation (2 subtasks)
- [ ] 2.1: Clamp decoded codepoints to valid Unicode range (0x0–0x10FFFF), use `String.fromCodePoint`
- [ ] 2.2: Add test cases for out-of-range and supplementary plane codepoints

## Dev Notes
- Source stories: [TD-1-5](./TD-1-5-db-string-sanitization.md)
- Review findings: #3 (triple-encoding), #6 (unbounded codepoints)
- Files affected: `src/lib/sanitize.ts`, `src/lib/sanitize.test.ts`
- Current approach is safe due to React JSX escaping; this hardens for future non-JSX reuse
