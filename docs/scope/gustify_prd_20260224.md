# Gustify — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-02-24  
**Status:** Pre-Development  
**Author:** Gabe (product), Claude (architecture & design assist)

---

## 1. Product Overview

### 1.1 What is Gustify?

Gustify is a **cooking companion PWA** that transforms grocery purchases into culinary exploration. It integrates with Gastify (expense tracking app) to automatically track what ingredients users have, suggests recipes based on available inventory, dietary preferences, and cooking proficiency, and — most importantly — **guides users on a personalized culinary growth journey**.

### 1.2 Brand Identity

| Attribute          | Value                                                              |
| ------------------ | ------------------------------------------------------------------ |
| **Name**           | Gustify                                                            |
| **Root word**      | "Gusto" — taste, pleasure, preference (ES) / enthusiasm, zest (EN) |
| **Syllables**      | 3 (GUS-ti-fy)                                                      |
| **Pattern**        | [Spanish root] + -ify (mirrors Gastify: GASt-ify ↔ GUSt-ify)       |
| **Parent company** | KUJTA AI                                                           |
| **Sister app**     | Gastify (expense tracking, formerly Boletapp)                      |

**Brand ecosystem:**
```
KUJTA AI
├── Gastify  → "gasto" (expense)  → tracks what you spend
└── Gustify  → "gusto" (taste)    → transforms what you bought into what you love
```

**Taglines:**
- "Descubre tu gusto" (Discover your taste)
- "De la boleta al gusto" (From receipt to taste — linking to Gastify)
- "Cocina con gusto" (Cook with pleasure)

### 1.3 Domains

All verified available (no DNS records, no competing brands in food/cooking):

| Domain      | Status      |
| ----------- | ----------- |
| gustify.com | ✅ Available |
| gustify.cl  | ✅ Available |
| gustify.app | ✅ Available |
| gustify.net | ✅ Available |

**Note:** gustify.shop exists (neck fan dropship store — zero brand conflict). @gustify on X is dormant since 2012, never posted. No food/cooking brand uses "Gustify" anywhere.

**Action required:** Register domains on Namecheap/GoDaddy and check @gustify on Instagram/TikTok before launch.

### 1.4 Target Markets

1. **Primary:** Latin America (Chile first)
2. **Secondary:** Europe (Spanish-speaking)
3. **Tertiary:** United States

"Gusto" works identically in Spanish and English, requiring no translation across all target markets.

---

## 2. Vision & Core Concept

### 2.1 The Loop

Gustify closes the loop from purchasing to cooking to learning:

```
Buy → Have → Cook → Learn → Suggest
 ↑                              │
 └──── Shopping List ───────────┘
```

Gastify tells you what you bought. Gustify figures out what you *can* make and what you *should* try next.

### 2.2 The Differentiator: Guided Culinary Exploration

The core insight is that users don't just need a recipe manager — they need **guided discovery**. Most people cook the same 10 dishes on rotation. Gustify breaks that pattern by introducing controlled novelty: one new cuisine, technique, or ingredient at a time, while keeping everything else familiar.

**Success means:** A user who started making scrambled eggs is now confidently making Thai curry six months later — and can trace exactly how they got there.

### 2.3 Core Principles

1. **Exploration over organization** — The app is a culinary growth system, not just a recipe database
2. **One new thing at a time** — Never overwhelm; introduce novelty incrementally
3. **Use what you have** — Recipes prioritize pantry contents; new purchases unlock new possibilities
4. **Implicit proficiency** — The system learns your skill level from what you cook, not what you claim
5. **Connected ecosystem** — Grocery data flows from Gastify; shopping suggestions flow back

---

## 3. Target Users

### 3.1 Primary Persona

**Home cooks who want to grow.** People who can cook basic meals but feel stuck in a routine. They buy groceries regularly (and track expenses in Gastify), want to try new things but don't know where to start, and appreciate guidance over overwhelming choice.

### 3.2 Use Cases

| Use Case                      | Description                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| "What can I make tonight?"    | See recipes ranked by pantry match %, prioritizing expiring items                        |
| "I want to try something new" | Explore mode suggests recipes with one novel element (cuisine, technique, or ingredient) |
| "What should I buy?"          | Shopping list based on purchase patterns + ingredients that unlock new recipes           |
| "Did I like that dish?"       | Rate cooked meals, building a personal taste profile over time                           |
| "How have I grown?"           | Exploration profile shows cuisines tried, techniques mastered, ingredients used          |

---

## 4. Feature Specification

### 4.1 Navigation Structure

```
Home | Pantry | ✨ Explore (center, elevated) | Recipes | More
```

Explore is the **elevated center button** — not hidden in a submenu. It's the soul of the app.

### 4.2 Views

#### 4.2.1 Home (Inicio)

- **Proficiency card:** Current level, cooking streak, average complexity score
- **Expiring items carousel:** Ingredients about to expire with recipe suggestions to use them
- **Top recipe suggestions:** 3 recipes ranked by pantry match %, diet fit, and proficiency stretch
- **Recent cooking history:** Last cooked meals with ratings
- **Explore CTA card:** "Descubre algo nuevo hoy" linking to Explore view

#### 4.2.2 Pantry (Despensa)

- **All available ingredients** with expiry badges (fresh / expiring soon / expired)
- **Filterable by category:** Proteins, Vegetables, Dairy, Grains, Spices, etc.
- **Shows:** quantity, unit, purchase date, estimated expiry
- **Source:** Automatically populated from mapped Gastify transaction items
- **Consumption tracking:** When user marks a recipe as "cooked," ingredients are deducted

#### 4.2.3 Explore (✨ Central Feature)

Four discovery modes, each introducing controlled novelty:

**🌍 Nueva Cocina (New Cuisine)**
- Filters recipes from cuisines the user hasn't tried yet
- Available cuisines: Japonesa, Medio Oriente, India, Tailandesa, Española, Mexicana, Francesa, etc.
- Uses familiar ingredients from pantry as a bridge into the unknown
- Grouped by cuisine with cultural context

**🔧 Nueva Técnica (New Technique)**
- Introduces cooking techniques the user hasn't mastered
- Tracked techniques: Glasear, Pochar, Guisar, Wok, Risottare, Confitar, Deglasear, Reducir, Emulsionar
- Shows which techniques are "new" vs "mastered"
- Starts with simple applications of each technique

**🧪 Nuevo Ingrediente (New Ingredient)**
- Gradually introduces ingredients the user has never cooked with
- Example ingredients: Jengibre, Leche de coco, Cilantro, Curry, Salsa de soya
- Starts with simple recipes so user learns the ingredient before complex dishes
- Shopping list integration: "Buy ginger to unlock 3 new recipes"

**📈 Skill Stretch**
- Recipes slightly above current proficiency level
- If user's average complexity is 3.2, suggests recipes at complexity 3-4
- Shows progression path from current level to the next tier
- Never more than one tier above current level

**Exploration Profile (top of Explore view):**
- Cuisines tried (progress bar)
- Techniques mastered (progress bar)
- Ingredients used (progress bar)
- Average complexity (numeric)
- Visual cooking map showing growth over time

#### 4.2.4 Recipes (Recetas)

- **Suggestions ranked by pantry match %** (e.g., "92% match — missing only cilantro")
- **Filterable:** by meal type (breakfast, lunch, dinner, snack)
- **Sortable:** by match %, ease, cooking time
- **Recipe detail modal:**
  - Ingredient checklist (green = have it, red = missing, with quantities)
  - Cooking steps
  - Complexity score
  - Badges for new elements: 🌍 new cuisine, 🔧 new technique, "NUEVO" labels on unfamiliar ingredients
  - Rate after cooking (1-5 stars)
  - "Cooked it!" button to log and deduct ingredients

#### 4.2.5 Map Items (Mapear) — Gastify Integration

- Shows unmapped items from Gastify's Productos view
- User taps an item → searches canonical ingredient dictionary → maps it
- Example: "POLLO ASADO FRI..." → maps to "Chicken breast"
- Unmappable items assigned to "Other" category
- Cooking app surfaces "Other" items in a triage queue for new ingredient creation
- Mappings persist: once "TOMATE 1 KG" → "Tomato," all future purchases auto-resolve
- Potential for crowdsourced mappings across users

#### 4.2.6 Shopping List (Compras)

- **Pattern-based suggestions:** "You buy bread every 4 days" (based on Gastify purchase history)
- **Recipe-based suggestions:** "Need carrots for Arroz con Pollo"
- **✨ "Para explorar" section:** Ingredients that unlock new recipes and cuisines
  - "Buy ginger to unlock 3 Japanese recipes"
  - "Buy coconut milk to unlock 2 Thai recipes"
- Checkable items with quantity
- Exportable / shareable

#### 4.2.7 Settings (in "More")

- Diet preferences (vegetarian, low-carb, no gluten, etc.)
- Allergies (shellfish, nuts, dairy, etc.)
- Locale and currency
- Theme settings
- Account management

### 4.3 Data Tracking

The system tracks the following sets to power exploration recommendations:

```
COOKED_CUISINES     — Set of cuisines the user has cooked
COOKED_TECHNIQUES   — Set of techniques the user has used
COOKED_INGREDIENTS  — Set of ingredients the user has cooked with
```

`getFilteredRecipes(mode)` filters the recipe corpus based on which mode is active, ensuring each suggestion introduces exactly one novel element.

**Color coding:**
- Purple → new cuisine
- Blue → new technique
- Green → new ingredient
- Accent (warm) → skill stretch

---

## 5. Technical Architecture

### 5.1 High-Level Architecture

```
┌─────────────────┐         ┌──────────────────────┐
│   GASTIFY        │         │   GUSTIFY             │
│   (PWA)         │         │   (PWA)               │
│                 │         │                       │
│  Productos ─────┼────────►│  Ingredient Mapper    │
│  (item select)  │  shared │  Pantry View          │
│                 │  Firebase│  Explore              │
│                 │         │  Recipe Suggestions   │
│                 │         │  Cooking Log          │
└────────┬────────┘         └───────┬───────────────┘
         │                          │
         ▼                          ▼
┌─────────────────────────────────────────────────┐
│          FIREBASE (Shared Project)              │
│  Auth │ Firestore (user data, pantry,           │
│       │ groups, cooking history)                │
└─────────────────────────────────────────────────┘
                    │
                    ▼ (Phase 2+)
┌─────────────────────────────────────────────────┐
│     RECIPE KNOWLEDGE BASE                       │
│  PostgreSQL via Supabase/Neon                   │
│                                                 │
│  • Canonical ingredients dictionary             │
│  • Recipe corpus with complexity scores         │
│  • Diet/allergen tags                           │
│  • Substitution mappings                        │
│  • Pattern analysis for shopping lists          │
└─────────────────────────────────────────────────┘
```

### 5.2 Tech Stack (Planned)

Mirrors Gastify's stack for ecosystem consistency:

| Layer                  | Technology                   | Rationale                                    |
| ---------------------- | ---------------------------- | -------------------------------------------- |
| **Frontend**           | React 18 + TypeScript        | Same as Gastify, shared knowledge            |
| **Styling**            | Tailwind CSS                 | Same as Gastify                              |
| **State**              | Zustand + TanStack Query     | Client state + server state, same as Gastify |
| **Auth**               | Firebase Auth (Google OAuth) | Shared with Gastify — same Firebase project  |
| **Database**           | Cloud Firestore (MVP)        | Shared with Gastify, real-time sync          |
| **AI**                 | Google Gemini API            | Recipe suggestions, ingredient normalization |
| **Build**              | Vite                         | Same as Gastify                              |
| **Deployment**         | Firebase Hosting             | Same as Gastify                              |
| **Database (Phase 2)** | PostgreSQL (Supabase/Neon)   | Complex recipe matching, analytics           |

### 5.3 Database Strategy: Hybrid, Phased

**Decision:** Start with Firestore for MVP, add PostgreSQL when query complexity justifies infrastructure.

**Why hybrid?**
- User data is event-driven and real-time (pantry updates, group sync) → Firestore's strength
- Recipe corpus and matching logic is read-heavy, relational, and query-complex → SQL's strength
- The "find recipes where I have 80% of ingredients, filtered by diet and proficiency" query is a single elegant SQL statement but a painful client-side computation in Firestore

#### Phase 1 — MVP (Firestore + Gemini)

- Canonical ingredients dictionary in Firestore
- Item mapping from Gastify Productos
- Basic pantry tracking with expiry estimation
- **Gemini API for recipe suggestions** instead of SQL queries (prompt with pantry + prefs, get recipes back)
- Exploration tracking (cuisines, techniques, ingredients sets)
- Cooking log with ratings
- Validates the concept with zero new infrastructure

#### Phase 2 — SQL for Analytics + Matching

- Stand up PostgreSQL via Supabase/Neon
- Cloud Function sync pipeline: Firestore → SQL
- Move recipe corpus to SQL
- Implement the "80% match" query natively
- Pattern-based shopping lists with SQL window functions (LAG, time-series)
- Stats computation in SQL, results pushed back to Firestore for display

#### Phase 3 — Mature Platform

- Full shopping list generation with pattern analysis
- Cross-group recipe suggestions
- Proficiency model refinement based on cooking history
- Potential migration of Gastify analytics queries to SQL backend

### 5.4 Firestore Schema (Phase 1)

```
firestore/
│
├── users/{userId}
│   ├── profile: { name, email, photoUrl, createdAt }
│   ├── cookingProfile: {
│   │     dietPrefs[], allergies[], proficiencyTier,
│   │     avgComplexity, dishesCooked,
│   │     cookedCuisines[], cookedTechniques[], cookedIngredients[]
│   │   }
│   ├── settings: { locale, currency, theme }
│   │
│   ├── pantry/{ingredientId}
│   │   ├── canonicalId, name, quantity, unit
│   │   ├── purchasedAt, estimatedExpiry, sourceTransactionId
│   │   └── status: "available" | "low" | "expired"
│   │
│   ├── cookedMeals/{mealId}
│   │   ├── recipeName, recipeId?, complexity, rating
│   │   ├── ingredientsUsed[], cookedAt
│   │   ├── newCuisine?, newTechnique?, newIngredients[]
│   │   └── groupId? (if cooked for group)
│   │
│   └── shoppingList/{listId}
│       ├── items[]: [{ name, quantity, unit, reason, recipeId? }]
│       ├── explorerItems[]: [{ name, unlocks, category }]
│       └── patternItems[]: [{ name, avgFrequencyDays, lastPurchased }]
│
├── canonicalIngredients/{ingredientId}
│   ├── names: { es: "Pechuga de pollo", en: "Chicken breast" }
│   ├── category: "Protein"
│   ├── defaultUnit: "kg"
│   ├── shelfLifeDays: 3
│   └── substitutions: ["turkey breast", "tofu"]
│
├── itemMappings/{itemNameHash}
│   ├── canonicalId: "chicken_breast"
│   ├── source: "POLLO ASADO FRI..."
│   ├── createdBy: userId
│   └── createdAt: timestamp
│
└── recipes/{recipeId}  (Phase 1: curated set or Gemini-generated)
    ├── name, description, imageUrl
    ├── cuisine: "Japanese"
    ├── techniques[]: ["stir-fry", "julienne"]
    ├── complexity: 3 (1-5 scale)
    ├── prepTime, cookTime, servings
    ├── dietTags[]: ["gluten-free"]
    ├── ingredients[]: [{ canonicalId, quantity, unit, optional? }]
    └── steps[]: [{ order, instruction, technique?, timerMinutes? }]
```

### 5.5 Integration with Gastify

**Shared Firebase project** — same auth, same Firestore instance.

**Data flow:**
1. User buys groceries → Gastify scans receipt → items stored in `transactions/{txId}/items[]`
2. User opens Gustify → Map Items view shows unmapped items
3. User maps item to canonical ingredient → mapping stored in `itemMappings`
4. Mapped item → ingredient added to `pantry/{ingredientId}` with quantity + expiry
5. Pantry data drives recipe suggestions and exploration modes
6. Shopping list suggestions can flow back to guide next purchases

**Item normalization pipeline:**
1. Gustify maintains `canonicalIngredients` collection (the dictionary)
2. Gastify Productos view gets a "Map to ingredient" action
3. User taps item → searchable list from dictionary → selects match
4. Mapping stored: `itemMappings/{hash}` → `{canonicalId, source}`
5. Once mapped, all future purchases of that item auto-resolve
6. Unmapped → "Other" → cooking app triage queue

### 5.6 AI Integration (Gemini)

**Phase 1 use cases:**
- **Recipe suggestion:** Prompt with pantry list + diet prefs + proficiency level + exploration mode → structured recipe JSON
- **Ingredient normalization assist:** When user maps items, Gemini can suggest the canonical match
- **Recipe generation:** On-the-fly recipe creation based on available ingredients and desired novelty

**Model:** Gemini 2.5-flash (fast, multimodal, cost-effective ~$0.01 per call)

---

## 6. Proficiency Model

### 6.1 How It Works

Proficiency is **implicit** — derived from cooking history, not self-reported.

**Inputs:**
- Complexity scores of cooked meals (1-5 scale)
- Ratings given (did they enjoy it?)
- Recency bias (recent meals weighted more)
- Variety (breadth of cuisines, techniques, ingredients)

**Tiers:**
| Tier         | Avg Complexity | Description                        |
| ------------ | -------------- | ---------------------------------- |
| Principiante | 1.0-2.0        | Basic recipes, simple techniques   |
| Cómodo       | 2.0-3.0        | Comfortable with fundamentals      |
| Aventurero   | 3.0-4.0        | Trying new cuisines and techniques |
| Avanzado     | 4.0-5.0        | Complex multi-step dishes          |

**Skill Stretch rule:** Suggestions are capped at **one tier above** current level. A "Cómodo" user sees "Aventurero" recipes in Skill Stretch mode, never "Avanzado."

### 6.2 Exploration Tracking

```typescript
type ExplorationProfile = {
  cuisinesTried: Set<string>;      // e.g., {"Chilean", "Japanese", "Italian"}
  techniquesMastered: Set<string>; // e.g., {"sauté", "boil", "roast"}
  ingredientsUsed: Set<string>;    // e.g., {"chicken", "rice", "tomato", ...}
  avgComplexity: number;           // running weighted average
  totalDishesCooked: number;
  cookingStreak: number;           // consecutive days
};
```

Each exploration mode filters recipes to ensure **exactly one novel element**:
- Nueva Cocina → recipe's cuisine ∉ cuisinesTried
- Nueva Técnica → recipe requires a technique ∉ techniquesMastered
- Nuevo Ingrediente → recipe uses an ingredient ∉ ingredientsUsed
- Skill Stretch → recipe.complexity > avgComplexity (capped at +1 tier)

---

## 7. Shared Groups (Future)

When a household shares a Gastify group:

- Each member's grocery purchases feed into a **shared pantry**
- Gustify shows the combined pantry and suggests recipes for the household
- When any member cooks, ingredients are deducted and everyone sees the update
- Recipe suggestions consider dietary restrictions of **all** group members (intersection)
- Firestore real-time listeners handle group sync natively

---

## 8. UX Design Decisions

### 8.1 Aesthetic

- **Warm, organic palette** — earth tones, greens, ambers (not clinical/cold)
- **Chilean context in mock data** — CLP prices, local products, Chilean recipes
- **Spanish-first UI** — all labels in Spanish for primary market, i18n later
- **Mobile-first PWA** — installable, works offline with Firestore cache

### 8.2 Exploration is Elevated

- Explore button is **center of nav, visually elevated** (✨ icon)
- Not buried in a submenu — it's the primary call to action
- Home view includes an Explore CTA card to drive engagement
- Shopping list includes "Para explorar" section connecting purchases to discovery

### 8.3 Recipe Recommendations are Explained

Every recipe suggestion includes context on **why** it's recommended:
- "92% pantry match — missing only cilantro"
- "Uses 3 ingredients expiring this week"
- "Your first Japanese recipe! Uses familiar ingredients"
- "New technique: deglasear. Everything else you already know"

Transparency builds trust and helps users understand their culinary journey.

---

## 9. Existing Artifacts

These files were created during the brainstorming sessions and are available for reference:

| File                             | Description                                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db_architecture_comparison.md`  | Full database architecture analysis: domain model, NoSQL/SQL/Hybrid schemas with code examples, 13-criteria comparison matrix, phased recommendation                          |
| `cooking-app-prototype.jsx`      | React PWA prototype v1: 5 views (Home, Pantry, Recipes, Map Items, Shopping List), warm organic aesthetic, Chilean context mock data                                          |
| `cooking-app-v2.jsx`             | Enhanced prototype v2: Explore as central feature with 4 discovery modes, exploration profile, shopping list "Para explorar" section, recipe detail modal with novelty badges |
| `cooking-app-naming-analysis.md` | First naming analysis: 15+ candidates evaluated, domain research, three-tier ranking                                                                                          |
| `cooking-app-naming-v2.md`       | Final naming analysis: 3-syllable constraint, Gustify as winner with full rationale                                                                                           |

---

## 10. Open Questions & Future Considerations

| Question                              | Notes                                                                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Recipe data source**                | Phase 1: Gemini-generated on-the-fly. Phase 2: curated SQL corpus. Consider Spoonacular/Edamam APIs as supplementary sources.     |
| **Ingredient normalization accuracy** | Riskiest assumption. Need to validate with 50+ real Gastify transactions before building full pipeline.                           |
| **Offline recipe access**             | Firestore SDK caches locally. Gemini-generated recipes would need explicit caching.                                               |
| **Monetization**                      | Not defined yet. Possible: freemium (basic pantry/recipes free, exploration modes premium), or bundled with Gastify subscription. |
| **Social features**                   | Recipe sharing, "I cooked this" posts, community-contributed recipes. Deferred to post-MVP.                                       |
| **Trademark**                         | Need USPTO/INAPI (Chile) search for "Gustify" in software/food categories before launch.                                          |

---

## 11. Development Roadmap

### MVP Scope (Phase 1)

**Goal:** Validate the core loop — pantry tracking + recipe suggestions + exploration.

| Priority | Feature                                      | Complexity |
| -------- | -------------------------------------------- | ---------- |
| P0       | Firebase project setup (shared with Gastify) | Low        |
| P0       | Auth (shared Firebase Auth, Google OAuth)    | Low        |
| P0       | Canonical ingredients dictionary (Firestore) | Medium     |
| P0       | Item mapping from Gastify (Map Items view)   | Medium     |
| P0       | Pantry view with expiry tracking             | Medium     |
| P0       | Gemini-powered recipe suggestions            | Medium     |
| P1       | Explore view with 4 discovery modes          | High       |
| P1       | Exploration profile tracking                 | Medium     |
| P1       | Cooking log with ratings                     | Medium     |
| P1       | Recipe detail with novelty badges            | Medium     |
| P2       | Shopping list with "Para explorar" section   | Medium     |
| P2       | Home dashboard view                          | Medium     |
| P2       | Pattern-based purchase suggestions           | High       |

### Post-MVP

- PostgreSQL integration for recipe matching (Phase 2)
- Shared groups / household pantry
- Social features
- Advanced proficiency model
- Multi-language support (EN, PT)

---

## 12. Success Metrics

| Metric                              | Target           | Rationale                        |
| ----------------------------------- | ---------------- | -------------------------------- |
| Items mapped (first week)           | 20+ per user     | Validates normalization pipeline |
| Recipes cooked (first month)        | 8+ per user      | ~2 per week shows engagement     |
| New cuisines tried (first 3 months) | 3+ per user      | Validates exploration feature    |
| Exploration mode engagement         | 40%+ of sessions | Validates core differentiator    |
| Pantry accuracy (user-reported)     | 80%+             | Users trust the inventory        |
| Retention (30-day)                  | 50%+             | Sticky enough to become a habit  |

---

*This PRD captures all decisions made across 4 brainstorming sessions (2026-02-22 to 2026-02-24). It serves as the single source of truth for starting Gustify development.*
