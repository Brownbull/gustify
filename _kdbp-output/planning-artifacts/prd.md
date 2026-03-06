---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputDocuments:
  - docs/scope/gustify_prd_20260224.md
  - docs/mydata/claudecookingschema/gustify-integration-analysis.md
  - docs/mydata/claudecookingschema/README.md
workflowType: 'prd'
continuationType: 'evolution'
baseDocument: 'docs/scope/gustify_prd_20260224.md'
classification:
  projectType: web_app
  domain: general
  complexity: medium
  context: brownfield
---

# Product Requirements Document - Gustify

**Author:** Gabe
**Date:** 2026-03-06

## Executive Summary

Gustify is a cooking companion PWA that transforms grocery purchases into guided culinary exploration. It integrates with Gastify (expense tracking) to auto-populate a user's pantry from receipts, suggests recipes based on available ingredients, and guides users on a personalized growth journey — introducing one new cuisine, technique, or ingredient at a time while keeping everything else familiar.

**Target audience:** Home cooks who can make basic meals but feel stuck in a routine. They buy groceries regularly, track expenses in Gastify, and want structured guidance to grow — not overwhelming choice.

**Core problem:** Most people cook the same 10 dishes on rotation. Existing recipe apps offer search, not guidance. There is no product that connects what you buy to what you should try next, with a system that ensures each step forward is achievable.

**Value proposition:** Gustify closes the loop from purchasing to cooking to learning. Gastify tells you what you bought. Gustify figures out what you can make and what you should try next — one safe step at a time.

## What Makes It Special

**Guided exploration with a novelty guarantee.** Every suggestion from the Explore engine introduces exactly one novel element (a new cuisine, technique, or ingredient) while keeping everything else within the user's comfort zone. This is not random discovery — it is a structured growth path derived from cooking history.

**Curated-first, community-expanding data model.** All core data — ingredients, prepared meals, and recipes — lives as a curated corpus on the platform, not generated on the fly:

- **Ingredients:** A fixed canonical dictionary. Items that cannot be classified go to an "unclassifiable" queue reviewed by a dedicated team. The most common unclassifiable items are added to the dictionary over time.
- **Prepared meals:** A fixed curated set. Users can flag missing meals by name for future inclusion.
- **Recipes:** A curated pool stored on the platform. When a user wants a new recipe, Gustify assembles a structured prompt from their context (diet, proficiency, pantry, exploration mode) with the expected output format (YAML/JSON). Two paths to generation: **(1) External** — the user copies the prompt, runs it on any AI of their choice (ChatGPT, Claude, Gemini, etc.), and pastes the structured result back; **(2) Built-in** — Gustify calls the Gemini API directly and returns the recipe. Both paths produce the same structured output. Gustify parses and stores the recipe automatically. Duplicates are detected via name similarity + ingredient matching and consolidated. Users can also enter recipes manually through a step-by-step form. Every contributed recipe grows the pool for all users — the corpus expands through community usage.

**Implicit proficiency model.** The system learns a user's skill level from what they actually cook, not from self-assessment. Proficiency tiers (Principiante through Avanzado) are derived from cooking history, and Skill Stretch mode caps suggestions at one tier above current level.

**Connected ecosystem.** Grocery data flows in from Gastify; shopping suggestions (including "Para explorar" items that unlock new recipes) flow back. One Firebase project, one auth, one loop.

## Project Classification

| Dimension | Value | Notes |
|-----------|-------|-------|
| **Type** | Progressive Web App (PWA) | React 18 + TypeScript, Vite, mobile-first, installable |
| **Domain** | General (food/cooking) | No regulated domain — no healthcare, fintech, or compliance requirements |
| **Complexity** | Medium | AI-agnostic prompt generation, shared Firebase architecture, exploration algorithms, implicit proficiency model, recipe parsing + deduplication |
| **Context** | Brownfield | Active codebase with 6+ issues completed, deployed to staging and production |
| **Markets** | Chile first, then Latin America, Spain, United States | Spanish-first UI, "gusto" works in both Spanish and English |
| **Parent** | Khujta AI | Sister app: Gastify (expense tracking) |

## Success Criteria

### User Success

The product is working when users actively contribute to the data corpus:

| Metric | Target | Validates |
|--------|--------|-----------|
| Ingredients classified per user (first week) | 20+ | Item mapping pipeline works; canonical dictionary is sufficient |
| Prepared meals added per user (first month) | 5+ | Meal logging is usable; curated meal set covers common cases |
| Recipes contributed per user (first 3 months) | 3+ | Recipe generation flow (prompt or manual) works end-to-end |
| Pantry accuracy (user-reported) | 80%+ | Users trust the inventory enough to rely on it |
| 30-day retention | 50%+ | Product is sticky enough to become a habit |

### Business Success

| Timeframe | Signal |
|-----------|--------|
| **3 months** | Active users classifying ingredients, logging meals, and contributing recipes. The curated corpus is growing. |
| **12 months** | Recipe pool large enough that most queries return results without needing AI generation. Exploration engine has enough data to make meaningful suggestions. |

### Technical Success

| Metric | Target |
|--------|--------|
| Recipe parse success rate | 90%+ of AI-generated recipes paste and parse correctly on first attempt |
| Deduplication accuracy | False positive rate under 5% (recipes incorrectly merged) |
| Canonical dictionary coverage | 80%+ of Gastify transaction items map to a canonical ingredient without hitting the unclassifiable queue |

## Product Scope

### MVP (Current Phase)

Prove the core loop: pantry tracking + recipe suggestions from curated pool + cooking log.

- Auth (Google OAuth, shared with Gastify)
- Canonical ingredients dictionary (curated, fixed)
- Item mapping from Gastify transactions to canonical ingredients
- Pantry view with expiry tracking
- Curated recipe pool with search and pantry match ranking
- Recipe detail view with ingredient checklist and cooking steps
- Cooking log ("Cooked it!" with rating)
- Exploration profile tracking (cuisines, techniques, ingredients sets)
- Dietary restriction profile and allergen filtering
- Prepared meals as curated set with user flagging for missing entries

**Should-have for MVP (significantly improves experience):**
- Prompt generation for new recipes (external + built-in Gemini paths)
- Recipe parsing, storage, and deduplication
- Manual recipe entry form
- Pantry deduction on cooking
- Auto-resolve item mappings from crowdsourced data

### Growth Features (Post-MVP)

- Explore view with 4 discovery modes and novelty guarantee
- Shopping list with "Para explorar" section
- Home dashboard (proficiency card, expiring items, top suggestions)
- Enriched recipe format (phased cooking method, storage/freezing instructions, nutrition data)
- User preferences (flavor profile, spice tolerance, cooking strategy)
- Pattern-based purchase suggestions from Gastify history

### Vision

- Shared household pantry (Gastify group integration)
- Recipe similarity and consolidation algorithms
- PostgreSQL backend for complex recipe matching and analytics
- Multi-language support (EN, PT)
- Social features (recipe sharing, community contributions)
- Preferences onboarding wizard

## User Journeys

### Journey 1: Camila — The Routine Breaker (Primary User)

**Who:** 28, lives in Santiago, works full-time. Cooks dinner most nights but rotates between the same 6 dishes: pasta with sauce, rice with chicken, salads, scrambled eggs. She tracks groceries in Gastify.

**Situation:** Camila opens Gustify for the first time after seeing it linked from Gastify. She has 3 weeks of grocery history already in the system.

**Opening:** Gustify shows her 14 unmapped items from her recent Gastify transactions. She taps "PECHUGA DE POLLO" and maps it to "Pollo (pechuga)." After 10 minutes, she has mapped 18 items. Three items (a cleaning product, a cosmetic, and an oddly named store brand) land in the unclassifiable queue. Her pantry populates instantly: chicken, rice, tomatoes, onion, garlic, pasta, eggs, lettuce, cheese, olive oil, and more.

**Rising action:** She browses the recipe pool. Gustify shows 12 recipes ranked by pantry match. The top result is "Arroz con Pollo" at 95% match — missing only cumin. She taps it, sees the ingredient checklist (green checks on everything she has, one red item), reads the steps. She cooks it that night.

**Climax:** She taps "Cooked it!", rates it 4 stars. Gustify updates her exploration profile: first cuisine logged (Chilean), first techniques (sofrito, simmering). Her pantry deducts the used ingredients. The next time she opens the app, the recipe suggestions are different — they account for what she used and what's still available.

**Resolution:** After two weeks, Camila has cooked 5 recipes from the pool. She has tried sofrito, poaching, and a simple stir-fry. Her proficiency is Principiante (avg complexity 1.8). She doesn't feel overwhelmed — each recipe used mostly things she already knew.

**Capabilities revealed:** Item mapping, pantry auto-population, recipe browsing by pantry match, ingredient checklist, cooking log, proficiency tracking, pantry deduction.

---

### Journey 2: Roberto — The Recipe Contributor

**Who:** 35, lives in Valparaiso, enthusiastic home cook. He already uses Gustify and has a solid pantry, but he wants to make a Thai green curry and the recipe pool has nothing for it.

**Opening:** Roberto searches "curry verde tailandes" in recipes. No results. Gustify offers two options: generate a prompt for an external AI, or use the built-in Gemini generation.

**Rising action (external path):** He taps "Generar prompt." Gustify assembles a prompt that includes his pantry (chicken, coconut milk, basil, rice, garlic, ginger, lime), his proficiency (Comodo, avg complexity 2.5), his dietary preferences (none), and the expected output format in JSON. He copies the prompt, opens ChatGPT, pastes it, and gets back a structured recipe.

**Climax:** He pastes the JSON response back into Gustify. The app parses it successfully: "Curry Verde Tailandes," complexity 3, cuisine Thai, techniques (curry paste, simmering, coconut reduction). Gustify stores the recipe immediately. It shows up in the pool for all users.

**Alternative path (built-in):** Roberto taps "Generar con Gemini" instead. Gustify calls the API with the same prompt. The recipe appears directly — no copy-paste needed. Same result: parsed, stored, available to all.

**Resolution:** The next week, another user in Concepcion searches for Thai recipes and finds Roberto's curry. The corpus grew by one recipe because Roberto needed something that wasn't there.

**Capabilities revealed:** Recipe search, prompt generation (context assembly), external AI path (copy prompt, paste result), built-in Gemini path, recipe parsing and validation, auto-storage, deduplication check, corpus growth.

---

### Journey 3: Marcela — The Batch Cooker

**Who:** 40, lives in Temuco, works long hours. She cooks on Sundays for the entire week. She makes 3-4 dishes in one session, portions them, and refrigerates or freezes for weeknight dinners.

**Opening:** Marcela opens Gustify on Saturday evening to plan her Sunday cooking session. Her pantry shows beef, chicken, potatoes, carrots, onions, rice, beans, bell peppers, and various spices — a big weekly shop logged through Gastify.

**Rising action:** She browses recipes filtering by pantry match. She picks 3 recipes that share overlapping ingredients (all use onion, garlic, and bell peppers) to minimize waste. She checks the ingredient lists side by side to make sure she has enough of everything across all three recipes.

**Climax:** She cooks all three on Sunday. For each, she taps "Cooked it!" and logs the rating. Her pantry deducts ingredients across all three meals. She notes that the recipes with storage and freezing instructions (Growth feature, when available) would help her know which dishes freeze well and which to eat first.

**Resolution:** By Wednesday, she has eaten two of the three dishes. Her pantry accurately reflects what's left. On the next Saturday, Gustify's suggestions account for her remaining ingredients and avoid suggesting dishes that overlap with what she already prepped.

**Capabilities revealed:** Multi-recipe planning in a single session, ingredient overlap awareness, batch cooking log, pantry deduction across multiple meals, storage instructions (Growth), week-over-week pantry continuity.

---

### Journey 4: Don Fernando — The Large Family Cook

**Who:** 55, lives in Rancagua, cooks for a household of 9 (extended family). Every meal is a production. He needs recipes that scale and ingredients that stretch.

**Opening:** Don Fernando's pantry is large — 30+ ingredients from a bulk Gastify shop. He needs dinner for 9 tonight. He browses recipes but most show servings for 4.

**Rising action:** He finds "Cazuela de Pollo" (8 servings, 90% pantry match). The recipe detail shows quantities for 8 servings. He mentally scales to 9 but wishes the app could adjust portions. He checks the ingredient list — he has everything except cilantro for garnish.

**Climax:** He cooks the cazuela. Taps "Cooked it!" and rates it 5 stars. The pantry deducts a large amount of chicken, potatoes, corn, squash. His pantry drops noticeably after one meal — this is normal for his household size.

**Resolution:** Don Fernando's usage pattern is different from Camila's: fewer recipes per week but larger quantities. His exploration profile grows slowly because he repeats family favorites. When he does try something new, it's a big commitment (scaling an unfamiliar recipe for 9). The Skill Stretch mode works well for him — small complexity increases on large batches feel manageable.

**Capabilities revealed:** Serving size display, pantry deduction at scale, recipe filtering for high-serving recipes, bulk ingredient management, conservative exploration pacing for high-stakes cooking.

---

### Journey 5: Sofia — The Health-Constrained Cook

**Who:** 32, lives in Santiago, recently diagnosed with celiac disease. She also has a mild shellfish allergy. She needs to completely rethink how she cooks — many of her go-to recipes use flour or soy sauce (which contains wheat).

**Opening:** Sofia sets up her Gustify profile with dietary restrictions: gluten-free, shellfish allergy. She maps her Gastify items to the pantry. She has rice, chicken, potatoes, vegetables, eggs, cheese — all safe staples.

**Rising action:** She browses recipes. Gustify filters the pool by her dietary constraints — recipes containing wheat flour, soy sauce, breadcrumbs, shellfish, and related ingredients are excluded. The pool is smaller but every result is safe. She sees "Pollo al Horno con Papas" at 100% pantry match, gluten-free, no allergens.

**Climax:** She cooks it. It's simple but safe. Over the next month, she works through 8 gluten-free recipes. Her confidence rebuilds. She discovers that many cuisines she never considered (Thai with rice noodles, Mexican with corn tortillas) are naturally gluten-free. The exploration engine starts suggesting these.

**What could go wrong:** A user-contributed recipe is labeled gluten-free but contains soy sauce (which has wheat). The recipe detail view must clearly list all ingredients with allergen flags. Dietary filtering must be strict — false negatives (showing unsafe recipes) are unacceptable.

**Resolution:** Sofia's health constraints become walls in the system, not suggestions. Every recipe she sees has been filtered. She grows as a cook within safe boundaries. Her exploration profile shows 3 new cuisines tried in 2 months — all naturally compatible with her restrictions.

**Capabilities revealed:** Dietary restriction setup, strict allergen filtering, ingredient-level allergen flags, safe exploration within constraints, cuisine discovery through dietary compatibility.

---

### Journey 6: Andres — The Gastify Cross-User

**Who:** 30, lives in Concepcion, has used Gastify for 6 months to track expenses. He has rich purchase history but has never thought about cooking systematically.

**Opening:** Andres sees a "Gustify" link in Gastify (or hears about it from a friend). He signs in — same Google account, same auth, instant access. Gustify immediately shows 45 unmapped items from his last 2 months of Gastify transactions.

**Rising action:** He maps items in batches. Some auto-resolve because other users already mapped "TOMATE 1KG" to "Tomate." After 15 minutes, his pantry has 25 ingredients. He's surprised — he didn't realize he had this much variety available.

**Climax:** Gustify shows him 18 recipe matches. He picks the simplest one (complexity 1, 100% pantry match). He cooks it. It's the first time he's cooked something from a recipe rather than improvising. He taps "Cooked it!" and sees his exploration profile start from zero.

**Resolution:** Andres transitions from "person who buys groceries" to "person who cooks with intent." The Gastify integration made onboarding instant — no manual pantry setup. His existing purchase history gave him a head start.

**Capabilities revealed:** Cross-app auth (shared Firebase), bulk item mapping, auto-resolve from crowdsourced mappings, zero-setup pantry from purchase history, onboarding from existing Gastify data.

---

### Journey Requirements Summary

| Journey | Key Capabilities Required |
|---------|--------------------------|
| **Camila (Routine Breaker)** | Item mapping, pantry population, recipe browsing by match %, ingredient checklist, cooking log, proficiency tracking, pantry deduction |
| **Roberto (Recipe Contributor)** | Recipe search, prompt generation with user context, external copy/paste path, built-in Gemini path, recipe parsing/validation, auto-storage, deduplication |
| **Marcela (Batch Cooker)** | Multi-recipe selection, ingredient overlap view, batch cooking log, storage/freezing info (Growth), week-over-week pantry continuity |
| **Don Fernando (Large Family)** | Serving size display, recipe scaling awareness, bulk pantry deduction, high-serving recipe filtering |
| **Sofia (Health-Constrained)** | Dietary restriction profile, strict allergen filtering, ingredient-level allergen flags, safe exploration within constraints |
| **Andres (Gastify Cross-User)** | Shared auth, bulk item mapping, auto-resolve mappings, instant pantry from purchase history, zero-friction onboarding |

## Innovation Analysis

*Domain requirements skipped — general domain, no compliance or regulatory concerns.*

### Innovation Area 1: Prompt-as-Feature (AI-Agnostic Recipe Generation)

**What:** Instead of embedding a single AI provider, Gustify generates a structured prompt containing the user's full context (pantry, diet, proficiency, exploration mode, output format spec) and offers two paths: copy the prompt to any external AI, or use the built-in Gemini call. The prompt is the product — the AI is interchangeable.

**Why it matters:** Most cooking apps either have no AI or are locked to one provider. Gustify decouples the intelligence layer from the platform. Users who prefer Claude, ChatGPT, or a local model can use their tool of choice. Users who want simplicity tap one button for Gemini. Both paths produce identical structured output that Gustify can parse.

**Validation approach:** Track the ratio of external vs. built-in usage. If 80%+ use built-in, the external path is a nice-to-have. If 30%+ use external, the AI-agnostic approach has real demand.

**Risk:** The external path adds friction (copy, switch apps, paste, switch back). If the parse failure rate is high, users abandon the flow. Mitigation: strict output format spec in the prompt, clear error messages on parse failure, example output shown to the user.

### Innovation Area 2: Curated-First, Community-Expanding Corpus

**What:** All data (ingredients, meals, recipes) starts as a curated, fixed set. The corpus grows only through user contributions — either AI-generated recipes that are auto-stored, or manually entered recipes. Every contribution becomes a permanent platform asset available to all users.

**Why it matters:** This avoids the "cold start" problem of pure AI generation (inconsistent quality, no curation) and the "stale corpus" problem of pure editorial curation (slow growth, limited coverage). The hybrid model seeds quality and scales through usage.

**Validation approach:** Track corpus growth rate vs. "no results found" rate. Success = the percentage of queries that return at least one recipe increases month over month without editorial intervention.

**Risk:** Low initial corpus may disappoint early users. Mitigation: seed the recipe pool with 50-100 curated recipes covering common Chilean home cooking before launch. Quality of user-contributed recipes may vary — deduplication and future consolidation algorithms help normalize over time.

### Innovation Area 3: Novelty Guarantee in Exploration

**What:** The exploration engine algorithmically ensures that every suggestion introduces exactly one novel element (new cuisine, new technique, or new ingredient) while keeping everything else within the user's demonstrated comfort zone.

**Why it matters:** Existing recipe apps either overwhelm with choice or suggest randomly. The "one new thing, rest familiar" constraint (behavior V1) is a psychologically grounded approach to building cooking confidence. It transforms recipe discovery from browsing into a structured growth path.

**Validation approach:** Track whether users who engage with Explore mode show broader cooking profiles (more cuisines, techniques, ingredients) over 3 months compared to users who only browse recipes. The novelty guarantee should correlate with sustained engagement and exploration growth.

**Risk:** If the recipe pool is too small, the novelty filter may return zero results for advanced users who have already tried most available options. Mitigation: the prompt generation flow lets users create recipes that fill gaps, and those recipes enter the pool for future exploration suggestions.

## Web App Specific Requirements

### Application Type

Single-page application (SPA) built with React 18 + TypeScript + Vite. Progressive Web App (PWA) — installable on mobile home screens, works with Firestore offline cache.

### Browser Support

| Browser | Support Level |
|---------|--------------|
| Chrome (mobile + desktop) | Full — primary target |
| Safari (iOS) | Full — required for Chilean market (high iPhone share) |
| Firefox | Full |
| Edge | Full |
| IE | Not supported |

### SEO

Not required. The entire application is behind authentication. No public-facing content pages to index.

### Real-Time Data

Firestore real-time listeners power:
- Pantry updates (ingredients added/removed reflect immediately)
- Recipe pool updates (new community-contributed recipes appear without refresh)
- Cooking log sync (cooked meals update exploration profile in real-time)

### Accessibility

WCAG 2.1 AA baseline. No legal mandate for this domain, but good practice:
- Sufficient color contrast for expiry badges (fresh/expiring/expired)
- Screen reader support for ingredient checklists and recipe steps
- Touch targets minimum 44x44px (mobile-first)
- Keyboard navigation for recipe browsing and cooking log

### Offline Behavior

Firestore SDK caches data locally. Users can browse their pantry and saved recipes offline. Recipe generation (both paths) requires network connectivity. Cooking log entries queue locally and sync when reconnected.

### Deployment

Firebase Hosting with two targets:
- **Staging:** `boletapp-staging` (local dev, testing)
- **Production:** `boletapp-d609f` (deployed at gustify.web.app)

## Project Scoping & Phased Development

### MVP Strategy: Problem-Solving

Solve one problem perfectly: **"What can I cook with what I have?"** The pantry-to-recipe loop must work end-to-end before anything else matters. Exploration, batch cooking optimization, and advanced preferences are Growth features.

### Feature Prioritization (MoSCoW)

**Must-Have (MVP fails without these):**
- Auth (Google OAuth, shared with Gastify)
- Canonical ingredients dictionary
- Item mapping from Gastify transactions
- Pantry view with expiry tracking
- Curated recipe pool with search and pantry match ranking
- Recipe detail with ingredient checklist and steps
- Cooking log ("Cooked it!" + rating)
- Exploration profile tracking (cuisines, techniques, ingredients)
- Dietary restriction profile and allergen filtering
- Prepared meals as curated set

**Should-Have (significantly improves MVP experience):**
- Prompt generation for new recipes (external + built-in paths)
- Recipe parsing, storage, and deduplication
- Manual recipe entry form
- Pantry deduction on cooking
- Auto-resolve item mappings from crowdsourced data

**Could-Have (nice for launch, not essential):**
- Serving size display and scaling awareness
- Recipe sorting by cooking time, complexity
- Unclassifiable item flagging UI

**Won't-Have Yet (explicitly deferred):**
- Explore view with 4 discovery modes (Growth)
- Shopping list with "Para explorar" section (Growth)
- Home dashboard (Growth)
- Enriched recipe format — phased method, storage, nutrition (Growth)
- User preferences — flavor profile, spice tolerance (Growth)
- Household pantry sharing (Vision)
- Recipe consolidation algorithms (Vision)
- PostgreSQL backend (Vision)

### Phased Delivery

**Phase 1 — MVP:** Prove the pantry-to-recipe loop. Users map ingredients, browse recipes by match, cook, log, and rate. Dietary constraints filter the pool. Recipe contribution (prompt + manual) lets users fill gaps. Target: launch with 50-100 seeded recipes.

**Phase 2 — Growth:** Exploration engine with novelty guarantee. Shopping list. Home dashboard. Enriched recipe format (phased cooking, storage, nutrition). User preferences. This is where Gustify becomes a growth system, not just a recipe finder.

**Phase 3 — Expansion:** Household sharing, recipe consolidation, PostgreSQL for analytics, social features, multi-language.

### Risk-Based Scoping

| Risk | Type | Mitigation |
|------|------|------------|
| Initial recipe pool too small | Market | Seed 50-100 curated Chilean recipes before launch |
| Recipe parse failures frustrate users | Technical | Strict output format spec, clear error messages, fallback to manual entry |
| Item mapping friction causes drop-off | Market | Prioritize auto-resolve from crowdsourced mappings; minimize manual mapping |
| Allergen filtering false negatives | Safety | Ingredient-level allergen data on canonical dictionary; strict filtering logic |
| Gastify dependency for onboarding | Platform | Allow manual pantry entry as alternative (no Gastify required) |

## Functional Requirements

### 1. Identity & Access

| ID | Requirement |
|----|-------------|
| FR-1.1 | Users can sign in with Google OAuth using the same account as Gastify |
| FR-1.2 | Users can sign out and re-authenticate without data loss |
| FR-1.3 | A user profile is automatically created on first sign-in with name, email, and photo from Google |
| FR-1.4 | Users can set dietary restrictions on their profile (e.g., gluten-free, vegetarian, low-carb) |
| FR-1.5 | Users can set food allergies on their profile (e.g., shellfish, nuts, dairy) |
| FR-1.6 | Users can update their dietary restrictions and allergies at any time |

### 2. Ingredient Management

| ID | Requirement |
|----|-------------|
| FR-2.1 | The system maintains a canonical ingredients dictionary with Spanish and English names, category, default unit, and shelf life |
| FR-2.2 | Each canonical ingredient has allergen data (e.g., contains gluten, contains shellfish) |
| FR-2.3 | Users can view unmapped items from their Gastify transaction history |
| FR-2.4 | Users can map a Gastify transaction item to a canonical ingredient via a searchable picker |
| FR-2.5 | Once an item is mapped, all future purchases of that item auto-resolve to the same canonical ingredient |
| FR-2.6 | Mappings created by any user are available for auto-resolution across all users (crowdsourced) |
| FR-2.7 | Items that cannot be classified are marked as unclassifiable and queued for admin review (outside the app) |
| FR-2.8 | Users can skip items that are not food (cleaning products, cosmetics, etc.) |

### 3. Pantry Management

| ID | Requirement |
|----|-------------|
| FR-3.1 | When a Gastify item is mapped to a canonical ingredient, the ingredient is added to the user's pantry with quantity, unit, and purchase date |
| FR-3.2 | Users can view all pantry ingredients with estimated expiry status (fresh, expiring soon, expired) |
| FR-3.3 | Users can filter pantry ingredients by category (proteins, vegetables, dairy, grains, spices, etc.) |
| FR-3.4 | Users can manually add ingredients to their pantry without a Gastify transaction |
| FR-3.5 | Users can manually remove ingredients from their pantry |
| FR-3.6 | When a user logs a cooked meal, the recipe's ingredients are deducted from the pantry |
| FR-3.7 | Expiry estimates are derived from the canonical ingredient's shelf life and the purchase date |

### 4. Recipe Discovery

| ID | Requirement |
|----|-------------|
| FR-4.1 | Users can browse all recipes in the curated pool |
| FR-4.2 | Each recipe displays a pantry match percentage based on the user's current pantry |
| FR-4.3 | Recipes are ranked by pantry match percentage by default (highest match first) |
| FR-4.4 | Users can search recipes by name, cuisine, or ingredient |
| FR-4.5 | Users can filter recipes by dietary compatibility (matching their profile restrictions) |
| FR-4.6 | Users can filter recipes by cuisine type |
| FR-4.7 | Users can filter recipes by complexity level (1-5) |
| FR-4.8 | Recipes that contain allergens matching the user's allergy profile are excluded from results |
| FR-4.9 | When no recipes match the user's search or filter criteria, the system offers recipe generation options (see FR-5) |

### 5. Recipe Contribution

| ID | Requirement |
|----|-------------|
| FR-5.1 | Users can request a recipe generation prompt assembled from their context (pantry, dietary restrictions, proficiency level, desired cuisine or ingredients) |
| FR-5.2 | The generated prompt includes the expected output format specification (structured JSON/YAML) so any AI can produce a parseable result |
| FR-5.3 | Users can copy the generated prompt to use with any external AI of their choice |
| FR-5.4 | Users can paste a structured recipe response (from any external AI) back into the app for parsing |
| FR-5.5 | Users can generate a recipe directly via the built-in Gemini API using the same prompt |
| FR-5.6 | The system parses structured recipe responses and validates required fields (name, ingredients, steps, cuisine, complexity, servings) |
| FR-5.7 | Successfully parsed recipes are stored in the recipe pool and available to all users |
| FR-5.8 | The system checks for duplicate recipes before storage using name similarity and ingredient matching |
| FR-5.9 | Duplicate recipes are consolidated rather than stored separately |
| FR-5.10 | Users can enter a recipe manually through a step-by-step form (name, ingredients, steps, cuisine, complexity, servings) |
| FR-5.11 | Manually entered recipes are formatted, stored, and available to all users |
| FR-5.12 | When parsing fails, the system displays a clear error message indicating what was missing or malformed, with the option to retry or enter manually |

### 6. Recipe Detail

| ID | Requirement |
|----|-------------|
| FR-6.1 | Users can view a recipe's full detail: name, description, cuisine, complexity, prep time, cook time, servings |
| FR-6.2 | The ingredient list shows each ingredient with quantity and unit, color-coded by pantry availability (have / missing) |
| FR-6.3 | The cooking steps are displayed in sequential order with clear instructions |
| FR-6.4 | Each recipe displays its complexity score (1-5) |
| FR-6.5 | Each recipe displays the techniques involved |
| FR-6.6 | Users can mark a recipe as "Cooked it!" to log the meal |

### 7. Cooking & Exploration Tracking

| ID | Requirement |
|----|-------------|
| FR-7.1 | When a user logs a cooked meal, the system records the recipe name, date, and complexity |
| FR-7.2 | Users can rate a cooked meal (1-5 stars) |
| FR-7.3 | The system updates the user's exploration profile after each cooked meal: cuisines tried, techniques used, ingredients cooked with |
| FR-7.4 | The system calculates the user's average complexity from their cooking history |
| FR-7.5 | The system derives the user's proficiency tier from their average complexity (Principiante 1.0-2.0, Comodo 2.0-3.0, Aventurero 3.0-4.0, Avanzado 4.0-5.0) |
| FR-7.6 | Users can view their exploration profile: cuisines tried, techniques used, total dishes cooked, average complexity, proficiency tier |
| FR-7.7 | Users can view their cooking history (list of cooked meals with dates and ratings) |

### 8. Prepared Meals

| ID | Requirement |
|----|-------------|
| FR-8.1 | The system maintains a curated set of prepared meal types (e.g., "Almuerzo", "Cena", "Once") |
| FR-8.2 | Users can log a cooked meal against a prepared meal type |
| FR-8.3 | When a user cannot find a matching prepared meal type, they can submit its name for future inclusion |

### 9. Navigation & Views

| ID | Requirement |
|----|-------------|
| FR-9.1 | The app provides bottom navigation with access to primary views |
| FR-9.2 | Unauthenticated users see only the login page |
| FR-9.3 | All UI labels and user-facing text are in Spanish |

### Traceability Matrix

| Capability Area | Source Journeys | MVP Priority |
|----------------|----------------|--------------|
| Identity & Access | All journeys | Must-Have |
| Ingredient Management | Camila, Andres | Must-Have |
| Pantry Management | Camila, Marcela, Don Fernando, Andres | Must-Have |
| Recipe Discovery | Camila, Marcela, Don Fernando, Sofia | Must-Have |
| Recipe Contribution | Roberto | Should-Have |
| Recipe Detail | All journeys | Must-Have |
| Cooking & Exploration Tracking | Camila, Marcela, Don Fernando | Must-Have |
| Prepared Meals | All journeys | Must-Have |
| Navigation & Views | All journeys | Must-Have |

## Non-Functional Requirements

*Categories covered: Performance, Security, Integration, Internationalization, Accessibility. Scalability deferred to Firebase platform capabilities. Compliance not applicable (general domain).*

### 1. Performance

| ID | Requirement |
|----|-------------|
| NFR-1.1 | Initial app load completes in under 3 seconds on a 4G mobile connection |
| NFR-1.2 | Navigation between views renders in under 500ms (client-side routing) |
| NFR-1.3 | Recipe search results return in under 1 second for a pool of up to 10,000 recipes |
| NFR-1.4 | Pantry match percentage calculation completes in under 500ms per recipe result set |
| NFR-1.5 | Recipe prompt generation (context assembly) completes in under 1 second |
| NFR-1.6 | Recipe parsing (structured response validation) completes in under 2 seconds |
| NFR-1.7 | Built-in Gemini API call returns a recipe in under 10 seconds (network-dependent) |

### 2. Security

| ID | Requirement |
|----|-------------|
| NFR-2.1 | Authentication is handled exclusively through Firebase Auth with Google OAuth; no custom credential storage |
| NFR-2.2 | All Firestore data access is governed by security rules enforcing user-scoped reads and writes (users can only access their own pantry, cooking log, and profile) |
| NFR-2.3 | The canonical ingredients dictionary and recipe pool are read-accessible to all authenticated users |
| NFR-2.4 | Recipe writes (contributions) are allowed for all authenticated users but validated server-side for required fields |
| NFR-2.5 | Item mappings are writable by any authenticated user but cannot be deleted or modified after creation |
| NFR-2.6 | The Gemini API key is stored server-side (Cloud Functions environment) and never exposed to the client |
| NFR-2.7 | All data in transit is encrypted via HTTPS (enforced by Firebase Hosting) |
| NFR-2.8 | No personally identifiable information is stored beyond what Firebase Auth provides (name, email, photo) |
| NFR-2.9 | User-contributed recipes do not contain the contributor's identity in the stored recipe document |

### 3. Integration

| ID | Requirement |
|----|-------------|
| NFR-3.1 | Gustify reads Gastify transaction data from the shared Firestore instance without modifying Gastify's collections |
| NFR-3.2 | Gustify and Gastify share Firebase Auth — a single Google sign-in grants access to both apps |
| NFR-3.3 | Firestore security rules for Gustify paths must coexist with Gastify rules in the shared project without conflict |
| NFR-3.4 | The built-in Gemini API integration is implemented via Cloud Functions to isolate API keys and rate limiting from the client |
| NFR-3.5 | If the Gemini API is unavailable, the built-in generation path fails gracefully with a clear message; the external prompt path remains fully functional |

### 4. Internationalization

| ID | Requirement |
|----|-------------|
| NFR-4.1 | All UI labels, copy, and user-facing strings are in Spanish (es) for MVP |
| NFR-4.2 | Code variables, function names, and comments are in English |
| NFR-4.3 | The canonical ingredients dictionary stores names in both Spanish and English |
| NFR-4.4 | The architecture supports adding additional languages (i18n keys) without structural changes, but multi-language UI is deferred to Vision phase |

### 5. Accessibility

| ID | Requirement |
|----|-------------|
| NFR-5.1 | The app meets WCAG 2.1 AA color contrast requirements (minimum 4.5:1 for normal text, 3:1 for large text) |
| NFR-5.2 | All interactive elements have minimum 44x44px touch targets |
| NFR-5.3 | Ingredient checklists and recipe steps are compatible with screen readers (semantic HTML, aria labels where needed) |
| NFR-5.4 | All primary flows (mapping, browsing, cooking log) are navigable via keyboard |
| NFR-5.5 | Expiry badges (fresh/expiring/expired) use both color and text/icon to convey status (not color alone) |
