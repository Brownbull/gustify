# Meal Planning Application — Schema Documentation

## Overview

This schema system powers a meal planning application that integrates with:
- **Gustify** for ingredient sourcing and pantry tracking
- **LLM APIs** (Gemini, Claude, etc.) for recipe generation
- **A recipe store** for saving, searching, and managing recipes

The system is built around a **batch cooking workflow**: cook in bulk, vacuum seal, freeze, and reheat individual portions as needed.

---

## File Structure

```
schemas/
├── README.md                          # This file
├── household_profile.schema.yaml      # Schema definition for household profiles
├── household_profile.instance.yaml    # Your actual household data & constraints
├── recipe.schema.yaml                 # Schema definition for recipes
├── example_recipe.paprikash.yaml      # Example: Hungarian Chicken Paprikash
└── api_prompt_template.yaml           # Template for LLM API calls
```

---

## How It Works

### 1. Profile → Constraints
The **household profile** defines who you are, what you eat, how you cook, and what rules must be followed. It contains:

- **Household members** with individual preferences (Gabe prefers meat-heavy and bold; partner prefers balanced with more legumes)
- **Dietary framework** (dirty keto + Mediterranean, weight loss goals, sugar reduction)
- **Cooking system** (batch cook → vacuum seal → freeze → reheat via water bath/oven/stovetop)
- **Hard constraints** (no frying, no processed foods, cream only at reheat, etc.)
- **Soft constraints** (prefer bold flavors, international cuisines, dual-member flexibility)
- **Ingredient availability** (what's accessible in Villarrica, Chilean cut names)

### 2. Profile + Request → LLM API → Recipe
When you want a new recipe:

1. The app loads the household profile
2. The profile is injected into the system prompt (see `api_prompt_template.yaml`)
3. Your request becomes the user message (e.g., "Make me a Korean bulgogi with posta negra")
4. The LLM responds with a structured YAML recipe
5. The app validates it against the recipe schema and constraints
6. Valid recipes are saved to the recipe store

### 3. Recipe → Pantry Tracking
When you cook a recipe:

1. Ingredients are decremented from the pantry (Gustify integration)
2. The recipe's `pantry` section is updated (times cooked, frozen portions, etc.)
3. As you consume frozen portions, the count is decremented
4. Ratings and cooking notes accumulate over time

---

## Key Design Decisions

### Why YAML over JSON?
YAML is more readable for humans and supports comments. Both are interchangeable — the schemas use JSON Schema draft 2020-12 syntax and work with either format. The app can internally use JSON while displaying YAML to humans.

### Ingredient `freeze_exclude` flag
The most critical constraint in the system. Ingredients marked `freeze_exclude: true` must appear in `storage.freezing.freeze_without` with instructions for when/how to add them. This prevents the #1 batch cooking mistake: freezing cream and getting grainy sauce.

### Phase-based method with pause points
Recipes are structured as phases (not just a flat step list) so the app can identify natural stopping points for batch cooking. A phase with `is_pause_point: true` means: "You can stop here, portion, and freeze."

### `member_suitability` scoring
Each recipe rates how well it serves each household member, enabling the app to suggest recipes that work for both of you or flag when one person might need a modification.

### `pantry` section is app-managed
The `pantry` field on recipes is populated and updated by the application, not by the recipe author or AI. It tracks real-world usage data.

---

## Validation Checklist

When importing or generating a recipe, validate:

- [ ] Valid YAML with all required fields
- [ ] No forbidden cooking methods (deep_frying, shallow_frying)
- [ ] No forbidden ingredients (cucumber, watermelon, melon)
- [ ] Cream/cheese/fresh herbs marked `freeze_exclude: true`
- [ ] `storage.freezing.freeze_without` matches all `freeze_exclude` ingredients
- [ ] `storage.reheating` includes `water_bath` as first option
- [ ] At least one phase has `is_pause_point: true`
- [ ] `servings.base_yield >= 4`
- [ ] All quantities in metric units
- [ ] `dietary_profile.diets_compatible` includes at least one target diet

---

## Extending the Schema

### Adding a new household member
Add a new entry to `household.members` in the profile with their preferences.

### Adding new constraints
Add to `constraints.hard` (non-negotiable) or `constraints.soft` (preferences).

### Supporting new cuisines
Add specialty ingredients to `ingredient_availability.specialty_requires_sourcing` so the app knows what needs special sourcing.

### Migrating existing recipes from the Claude project
Use the example recipe as a template. The key sections to fill for each existing recipe:
1. `meta` (title, cuisine, tags, dietary info)
2. `ingredients` (grouped, with freeze_exclude flags)
3. `method` (phased, with pause points)
4. `storage` (freezing + reheating instructions)
