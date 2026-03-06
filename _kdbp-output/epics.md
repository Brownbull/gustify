---
stepsCompleted: [0, 1, 2, 3, 4, 5, 6, 7]
status: 'complete'
completedAt: '2026-03-06'
inputDocuments:
  - _kdbp-output/planning-artifacts/prd.md
  - _kdbp-output/architecture.md
workflowType: 'epics'
project_name: 'Gustify'
user_name: 'Gabe'
date: '2026-03-06'
hardeningAnalysis:
  patternsApplied: 6
  builtInFindings: 16
  separateStories: 0
  actualMultiplier: 1.22
  targetMultiplier: 1.3
---

# Gustify MVP -- Epics & Stories

## Requirements Inventory

### Functional Requirements: 48 FRs

| Area | IDs | Count | Status |
|------|-----|-------|--------|
| Identity & Access | FR-1.1 to FR-1.3 | 3 | Already implemented |
| Identity & Access | FR-1.4 to FR-1.6 | 3 | Epic 2 |
| Ingredient Management | FR-2.1 | 1 | Already implemented |
| Ingredient Management | FR-2.2 | 1 | Epic 2 |
| Ingredient Management | FR-2.3 to FR-2.5, FR-2.8 | 4 | Already implemented |
| Ingredient Management | FR-2.6 | 1 | Already implemented |
| Ingredient Management | FR-2.7 | 1 | Epic 4 |
| Pantry Management | FR-3.1, FR-3.2, FR-3.5, FR-3.7 | 4 | Already implemented |
| Pantry Management | FR-3.3, FR-3.4 | 2 | Epic 4 |
| Pantry Management | FR-3.6 | 1 | Epic 4 |
| Recipe Discovery | FR-4.1 to FR-4.4, FR-4.6, FR-4.7 | 6 | Epic 1 |
| Recipe Discovery | FR-4.5, FR-4.8 | 2 | Epic 2 |
| Recipe Discovery | FR-4.9 | 1 | Epic 3 |
| Recipe Contribution | FR-5.1 to FR-5.12 | 12 | Epic 3 |
| Recipe Detail | FR-6.1 to FR-6.5 | 5 | Epic 1 |
| Recipe Detail | FR-6.6 | 1 | Epic 4 |
| Cooking & Exploration | FR-7.1 to FR-7.7 | 7 | Epic 4 |
| Prepared Meals | FR-8.1 | 1 | Already implemented |
| Prepared Meals | FR-8.2, FR-8.3 | 2 | Epic 4 |
| Navigation & Views | FR-9.1, FR-9.3 | 2 | Epic 1 + Epic 4 |
| Navigation & Views | FR-9.2 | 1 | Already implemented |

**Already implemented:** 17 FRs (Issues #1-6)
**New work:** 31 FRs across 4 epics

### Non-Functional Requirements: 17 NFRs

All NFRs addressed across epic stories or existing implementation.

### Architectural Requirements: 7 key decisions

All locked (Zod, client parse + CF store, hybrid allergen filtering, CF-mediated recipe writes, structured errors, layer-based structure, React Router v6).

---

## FR Coverage Map

| FR | Epic | Story | Status |
|----|------|-------|--------|
| FR-1.1 | -- | -- | Implemented |
| FR-1.2 | -- | -- | Implemented |
| FR-1.3 | -- | -- | Implemented |
| FR-1.4 | 2 | 2.2 | Drafted |
| FR-1.5 | 2 | 2.2 | Drafted |
| FR-1.6 | 2 | 2.2 | Drafted |
| FR-2.1 | -- | -- | Implemented |
| FR-2.2 | 2 | 2.1 | Drafted |
| FR-2.3 | -- | -- | Implemented |
| FR-2.4 | -- | -- | Implemented |
| FR-2.5 | -- | -- | Implemented |
| FR-2.6 | -- | -- | Implemented |
| FR-2.7 | 4 | 4.4 | Drafted |
| FR-2.8 | -- | -- | Implemented |
| FR-3.1 | -- | -- | Implemented |
| FR-3.2 | -- | -- | Implemented |
| FR-3.3 | 4 | 4.4 | Drafted |
| FR-3.4 | 4 | 4.4 | Drafted |
| FR-3.5 | -- | -- | Implemented |
| FR-3.6 | 4 | 4.1 | Drafted |
| FR-3.7 | -- | -- | Implemented |
| FR-4.1 | 1 | 1.3 | Drafted |
| FR-4.2 | 1 | 1.3 | Drafted |
| FR-4.3 | 1 | 1.3 | Drafted |
| FR-4.4 | 1 | 1.4 | Drafted |
| FR-4.5 | 2 | 2.3 | Drafted |
| FR-4.6 | 1 | 1.4 | Drafted |
| FR-4.7 | 1 | 1.4 | Drafted |
| FR-4.8 | 2 | 2.3 | Drafted |
| FR-4.9 | 3 | 3.1 | Drafted |
| FR-5.1 | 3 | 3.1 | Drafted |
| FR-5.2 | 3 | 3.1 | Drafted |
| FR-5.3 | 3 | 3.1 | Drafted |
| FR-5.4 | 3 | 3.1 | Drafted |
| FR-5.5 | 3 | 3.2 | Drafted |
| FR-5.6 | 3 | 3.1 | Drafted |
| FR-5.7 | 3 | 3.2 | Drafted |
| FR-5.8 | 3 | 3.2 | Drafted |
| FR-5.9 | 3 | 3.2 | Drafted |
| FR-5.10 | 3 | 3.3 | Drafted |
| FR-5.11 | 3 | 3.3 | Drafted |
| FR-5.12 | 3 | 3.1 | Drafted |
| FR-6.1 | 1 | 1.5 | Drafted |
| FR-6.2 | 1 | 1.5 | Drafted |
| FR-6.3 | 1 | 1.5 | Drafted |
| FR-6.4 | 1 | 1.5 | Drafted |
| FR-6.5 | 1 | 1.5 | Drafted |
| FR-6.6 | 4 | 4.1 | Drafted |
| FR-7.1 | 4 | 4.1 | Drafted |
| FR-7.2 | 4 | 4.1 | Drafted |
| FR-7.3 | 4 | 4.2 | Drafted |
| FR-7.4 | 4 | 4.2 | Drafted |
| FR-7.5 | 4 | 4.2 | Drafted |
| FR-7.6 | 4 | 4.2 | Drafted |
| FR-7.7 | 4 | 4.3 | Drafted |
| FR-8.1 | -- | -- | Implemented |
| FR-8.2 | 4 | 4.5 | Drafted |
| FR-8.3 | 4 | 4.5 | Drafted |
| FR-9.1 | 1 | 1.5 | Drafted |
| FR-9.2 | -- | -- | Implemented |
| FR-9.3 | 4 | 4.5 | Drafted |

---

## Epic Overview

| Epic | Title | Stories | Points | Dependency |
|------|-------|---------|--------|------------|
| 1 | Recipe Pool & Discovery | 5 | 19 | Foundation |
| 2 | Dietary Safety & Allergen Filtering | 3 | 10 | After Epic 1 |
| 3 | Recipe Contribution Pipeline | 3 | 19 | After Epic 1 |
| 4 | Cooking Log, Exploration & App Completion | 5 | 19 | After Epic 1 |

**Build order:** Epic 1 -> Epic 2 -> Epic 3 -> Epic 4

---

## Epic 1: "Que puedo cocinar?" -- Recipe Pool & Discovery

**User outcome:** Users can browse a persistent recipe pool, see pantry match rankings, search by name/cuisine/ingredient, filter by complexity, and view full recipe details.

### Intent Block
- **WHAT WE'RE DELIVERING:** Users get a recipe library they can browse, search, and filter -- ranked by what's already in their pantry.
- **THE ANALOGY:** A personal cookbook that automatically puts sticky notes on recipes matching what's in your fridge, with tabs for searching and filtering.
- **CONSTRAINT BOX:** IS: persistent recipe pool with search/filter/match | IS NOT: AI generation, cooking log, dietary filtering | DECIDES: recipes live in Firestore, not in memory
- **ONE-LINE HANDLE:** "Your pantry-ranked recipe library"
- **DONE WHEN:** (1) Users browse 50+ seeded recipes ranked by pantry match, (2) Search by name/cuisine returns results in <1s, (3) Recipe detail shows ingredient availability

### Stories

| Key | Title | Size | Points | File |
|-----|-------|------|--------|------|
| 1.1 | Recipe Data Model & Zod Validation | SMALL | 2 | epic-1/stories/1.1-recipe-data-model.md |
| 1.2 | Recipe Seed Script & Initial Pool | MEDIUM | 3 | epic-1/stories/1.2-recipe-seed-script.md |
| 1.3 | Recipe Browsing & Pantry Match Ranking | MEDIUM | 4 | epic-1/stories/1.3-recipe-browsing.md |
| 1.4 | Recipe Search & Filtering | MEDIUM | 4 | epic-1/stories/1.4-recipe-search-filtering.md |
| 1.5 | Recipe Detail View & React Router | LARGE | 6 | epic-1/stories/1.5-recipe-detail-react-router.md |

---

## Epic 2: "Cocina segura" -- Dietary Safety & Allergen Filtering

**User outcome:** Users set dietary restrictions and allergies; recipes containing allergens are strictly excluded from all results.

### Intent Block
- **WHAT WE'RE DELIVERING:** Users with food restrictions see ONLY safe recipes. No unsafe recipe reaches the screen.
- **THE ANALOGY:** A bouncer at the kitchen door -- checks every recipe's ingredient list against the user's restrictions. No exceptions.
- **CONSTRAINT BOX:** IS: dietary profile setup + strict recipe exclusion | IS NOT: recipe recommendations, exploration modes | DECIDES: false negatives are unacceptable
- **ONE-LINE HANDLE:** "No unsafe recipe reaches the screen"
- **DONE WHEN:** (1) User sets gluten-free + shellfish allergy, (2) Zero recipes with those allergens appear, (3) Dietary changes take effect immediately

### Stories

| Key | Title | Size | Points | File |
|-----|-------|------|--------|------|
| 2.1 | Allergen Data Migration | SMALL | 2 | epic-2/stories/2.1-allergen-data-migration.md |
| 2.2 | Dietary Profile Settings UI | MEDIUM | 4 | epic-2/stories/2.2-dietary-profile-ui.md |
| 2.3 | Allergen Filtering in Recipe Discovery | MEDIUM | 4 | epic-2/stories/2.3-allergen-filtering.md |

---

## Epic 3: "Agrega tu receta" -- Recipe Contribution Pipeline

**User outcome:** Users can add new recipes to the pool via AI-assembled prompts (external paste or built-in Gemini), or manual entry -- every contribution grows the corpus.

### Intent Block
- **WHAT WE'RE DELIVERING:** Users get two AI paths and one manual path to fill gaps in the recipe pool. Every recipe enters the shared pool.
- **THE ANALOGY:** A community recipe box at the market -- anyone can drop in a card. A librarian validates and deduplicates before filing.
- **CONSTRAINT BOX:** IS: prompt generation + paste + Gemini + manual + dedup + CF storage | IS NOT: recipe browsing/filtering, cooking log | DECIDES: AI is the tool, not the product
- **ONE-LINE HANDLE:** "Anyone can grow the recipe pool"
- **DONE WHEN:** (1) User pastes AI-generated JSON and it's parsed + stored, (2) Built-in Gemini produces same result, (3) Duplicate detected and consolidated

### Stories

| Key | Title | Size | Points | File |
|-----|-------|------|--------|------|
| 3.1 | Recipe Prompt Assembly & External Paste Path | LARGE | 7 | epic-3/stories/3.1-recipe-prompt-paste.md |
| 3.2 | Built-in Gemini Generation & CF Recipe Storage | LARGE | 7 | epic-3/stories/3.2-gemini-cf-storage.md |
| 3.3 | Manual Recipe Entry Form | MEDIUM | 5 | epic-3/stories/3.3-manual-recipe-entry.md |

---

## Epic 4: "Lo cocine!" -- Cooking Log, Exploration & App Completion

**User outcome:** Users log cooked meals with ratings, see pantry deducted, track culinary growth, and navigate a complete 5-tab app.

### Intent Block
- **WHAT WE'RE DELIVERING:** Users close the cooking loop -- cook, log, grow. Pantry updates. Profile evolves. App becomes complete.
- **THE ANALOGY:** A cooking journal that also restocks your pantry shelves. Every meal logged is a stamp in your passport.
- **CONSTRAINT BOX:** IS: cooking log + pantry deduction + exploration profile + navigation + pantry polish | IS NOT: explore modes, shopping list, home dashboard | DECIDES: proficiency is implicit
- **ONE-LINE HANDLE:** "Cook it, log it, grow from it"
- **DONE WHEN:** (1) User taps "Lo cocine!" and pantry deducts, (2) Exploration profile shows cuisines/techniques/proficiency, (3) 5-tab navigation works

### Stories

| Key | Title | Size | Points | File |
|-----|-------|------|--------|------|
| 4.1 | Cooking Log -- "Lo cocine!" & Rating | MEDIUM | 5 | epic-4/stories/4.1-cooking-log.md |
| 4.2 | Exploration Profile & Proficiency Tracking | MEDIUM | 5 | epic-4/stories/4.2-exploration-profile.md |
| 4.3 | Cooking History View | SMALL | 2 | epic-4/stories/4.3-cooking-history.md |
| 4.4 | Pantry Enhancements | MEDIUM | 4 | epic-4/stories/4.4-pantry-enhancements.md |
| 4.5 | Prepared Meal Logging & Nav Polish | SMALL | 3 | epic-4/stories/4.5-prepared-meals-nav.md |

---

## Hardening Summary

| Metric | Value |
|--------|-------|
| Stories analyzed | 16 |
| Hardening patterns applied | 6 of 6 |
| BUILT-IN findings | 16 (all stories have built-in hardening) |
| SEPARATE hardening stories | 0 |
| Cross-epic findings | 0 additional stories needed |
| Actual multiplier | 1.22x |
| Target multiplier | <1.3x |
