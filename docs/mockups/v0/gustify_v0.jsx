import { useState, useEffect, useCallback, useMemo } from "react";

// ============================================
// MOCK DATA
// ============================================

const CANONICAL_INGREDIENTS = [
  { id: "ci_001", nameEs: "Pechuga de pollo", nameEn: "Chicken breast", category: "Protein", unit: "kg", shelfDays: 3, icon: "🍗" },
  { id: "ci_002", nameEs: "Tomate", nameEn: "Tomato", category: "Vegetable", unit: "kg", shelfDays: 7, icon: "🍅" },
  { id: "ci_003", nameEs: "Cebolla", nameEn: "Onion", category: "Vegetable", unit: "units", shelfDays: 30, icon: "🧅" },
  { id: "ci_004", nameEs: "Arroz", nameEn: "Rice", category: "Grain", unit: "kg", shelfDays: 365, icon: "🍚" },
  { id: "ci_005", nameEs: "Leche", nameEn: "Milk", category: "Dairy", unit: "L", shelfDays: 7, icon: "🥛" },
  { id: "ci_006", nameEs: "Huevos", nameEn: "Eggs", category: "Protein", unit: "units", shelfDays: 21, icon: "🥚" },
  { id: "ci_007", nameEs: "Palta", nameEn: "Avocado", category: "Vegetable", unit: "units", shelfDays: 4, icon: "🥑" },
  { id: "ci_008", nameEs: "Limón", nameEn: "Lemon", category: "Fruit", unit: "units", shelfDays: 14, icon: "🍋" },
  { id: "ci_009", nameEs: "Ajo", nameEn: "Garlic", category: "Vegetable", unit: "units", shelfDays: 60, icon: "🧄" },
  { id: "ci_010", nameEs: "Pasta", nameEn: "Pasta", category: "Grain", unit: "kg", shelfDays: 365, icon: "🍝" },
  { id: "ci_011", nameEs: "Queso", nameEn: "Cheese", category: "Dairy", unit: "kg", shelfDays: 14, icon: "🧀" },
  { id: "ci_012", nameEs: "Pan", nameEn: "Bread", category: "Grain", unit: "units", shelfDays: 5, icon: "🍞" },
  { id: "ci_013", nameEs: "Aceite de oliva", nameEn: "Olive oil", category: "Condiment", unit: "L", shelfDays: 365, icon: "🫒" },
  { id: "ci_014", nameEs: "Zanahoria", nameEn: "Carrot", category: "Vegetable", unit: "kg", shelfDays: 21, icon: "🥕" },
  { id: "ci_015", nameEs: "Pimiento", nameEn: "Bell pepper", category: "Vegetable", unit: "units", shelfDays: 7, icon: "🫑" },
  { id: "ci_016", nameEs: "Jengibre", nameEn: "Ginger", category: "Spice", unit: "units", shelfDays: 21, icon: "🫚" },
  { id: "ci_017", nameEs: "Salsa de soya", nameEn: "Soy sauce", category: "Condiment", unit: "mL", shelfDays: 365, icon: "🫙" },
  { id: "ci_018", nameEs: "Cilantro", nameEn: "Cilantro", category: "Herb", unit: "units", shelfDays: 7, icon: "🌿" },
  { id: "ci_019", nameEs: "Curry en polvo", nameEn: "Curry powder", category: "Spice", unit: "g", shelfDays: 365, icon: "🟡" },
  { id: "ci_020", nameEs: "Leche de coco", nameEn: "Coconut milk", category: "Dairy", unit: "mL", shelfDays: 365, icon: "🥥" },
];

const PANTRY_ITEMS = [
  { id: "p1", canonicalId: "ci_001", name: "Pechuga de pollo", qty: 1.2, unit: "kg", purchasedAt: "2026-02-20", expiresAt: "2026-02-23", status: "available", icon: "🍗" },
  { id: "p2", canonicalId: "ci_002", name: "Tomate", qty: 0.8, unit: "kg", purchasedAt: "2026-02-19", expiresAt: "2026-02-26", status: "available", icon: "🍅" },
  { id: "p3", canonicalId: "ci_003", name: "Cebolla", qty: 3, unit: "units", purchasedAt: "2026-02-15", expiresAt: "2026-03-17", status: "available", icon: "🧅" },
  { id: "p4", canonicalId: "ci_004", name: "Arroz", qty: 2, unit: "kg", purchasedAt: "2026-02-10", expiresAt: "2027-02-10", status: "available", icon: "🍚" },
  { id: "p5", canonicalId: "ci_007", name: "Palta", qty: 2, unit: "units", purchasedAt: "2026-02-21", expiresAt: "2026-02-25", status: "expiring", icon: "🥑" },
  { id: "p6", canonicalId: "ci_006", name: "Huevos", qty: 6, unit: "units", purchasedAt: "2026-02-18", expiresAt: "2026-03-11", status: "available", icon: "🥚" },
  { id: "p7", canonicalId: "ci_009", name: "Ajo", qty: 5, unit: "units", purchasedAt: "2026-02-01", expiresAt: "2026-04-02", status: "available", icon: "🧄" },
  { id: "p8", canonicalId: "ci_013", name: "Aceite de oliva", qty: 0.5, unit: "L", purchasedAt: "2026-01-15", expiresAt: "2027-01-15", status: "available", icon: "🫒" },
  { id: "p9", canonicalId: "ci_008", name: "Limón", qty: 3, unit: "units", purchasedAt: "2026-02-19", expiresAt: "2026-03-05", status: "available", icon: "🍋" },
  { id: "p10", canonicalId: "ci_005", name: "Leche", qty: 1, unit: "L", purchasedAt: "2026-02-20", expiresAt: "2026-02-27", status: "available", icon: "🥛" },
  { id: "p11", canonicalId: "ci_010", name: "Pasta", qty: 0.5, unit: "kg", purchasedAt: "2026-02-05", expiresAt: "2027-02-05", status: "available", icon: "🍝" },
  { id: "p12", canonicalId: "ci_011", name: "Queso", qty: 0.3, unit: "kg", purchasedAt: "2026-02-18", expiresAt: "2026-03-04", status: "low", icon: "🧀" },
];

const PANTRY_IDS = new Set(PANTRY_ITEMS.map(p => p.canonicalId));

// Cuisines the user HAS cooked
const COOKED_CUISINES = new Set(["Chilena", "Italiana", "Casera", "Moderna"]);
// Techniques the user HAS used
const COOKED_TECHNIQUES = new Set(["Hervir", "Saltear", "Hornear", "Freír", "Tostar"]);
// Ingredients the user HAS cooked with
const COOKED_INGREDIENTS = new Set(["ci_001", "ci_002", "ci_003", "ci_004", "ci_005", "ci_006", "ci_007", "ci_008", "ci_009", "ci_010", "ci_011", "ci_013"]);

const ALL_RECIPES = [
  // === Familiar recipes (high match, known cuisines) ===
  {
    id: "r1", name: "Pollo al Limón con Arroz", cuisine: "Chilena", complexity: 2, prepTime: 15, cookTime: 35, servings: 4, mealType: "dinner",
    description: "Pollo jugoso marinado en limón con arroz aromático",
    techniques: ["Saltear", "Hervir"],
    ingredients: [
      { canonicalId: "ci_001", name: "Pechuga de pollo", qty: 0.8, unit: "kg", optional: false },
      { canonicalId: "ci_008", name: "Limón", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_004", name: "Arroz", qty: 0.4, unit: "kg", optional: false },
      { canonicalId: "ci_009", name: "Ajo", qty: 3, unit: "units", optional: false },
      { canonicalId: "ci_013", name: "Aceite de oliva", qty: 0.03, unit: "L", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 1, unit: "units", optional: true },
    ],
    steps: ["Marinar pollo en limón y ajo 15 min", "Dorar pollo en aceite", "Cocinar arroz con caldo", "Servir pollo sobre arroz"],
    dietTags: ["gluten-free"],
  },
  {
    id: "r2", name: "Pasta con Salsa de Tomate Fresco", cuisine: "Italiana", complexity: 1, prepTime: 10, cookTime: 20, servings: 2, mealType: "lunch",
    description: "Pasta simple con tomates frescos, ajo y aceite de oliva",
    techniques: ["Hervir", "Saltear"],
    ingredients: [
      { canonicalId: "ci_010", name: "Pasta", qty: 0.25, unit: "kg", optional: false },
      { canonicalId: "ci_002", name: "Tomate", qty: 0.4, unit: "kg", optional: false },
      { canonicalId: "ci_009", name: "Ajo", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_013", name: "Aceite de oliva", qty: 0.02, unit: "L", optional: false },
      { canonicalId: "ci_011", name: "Queso", qty: 0.05, unit: "kg", optional: true },
      { canonicalId: "ci_003", name: "Cebolla", qty: 0.5, unit: "units", optional: true },
    ],
    steps: ["Hervir pasta al dente", "Saltear ajo en aceite", "Agregar tomates picados", "Mezclar con pasta y queso"],
    dietTags: ["vegetarian"],
  },
  {
    id: "r3", name: "Huevos Revueltos con Palta", cuisine: "Chilena", complexity: 1, prepTime: 5, cookTime: 8, servings: 2, mealType: "breakfast",
    description: "Desayuno rápido y nutritivo con palta cremosa",
    techniques: ["Saltear", "Tostar"],
    ingredients: [
      { canonicalId: "ci_006", name: "Huevos", qty: 4, unit: "units", optional: false },
      { canonicalId: "ci_007", name: "Palta", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_012", name: "Pan", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_005", name: "Leche", qty: 0.05, unit: "L", optional: true },
    ],
    steps: ["Batir huevos con leche", "Cocinar a fuego bajo", "Tostar pan", "Servir con palta en rodajas"],
    dietTags: ["vegetarian"],
  },

  // === EXPLORE: New Cuisine suggestions ===
  {
    id: "r10", name: "Pollo Teriyaki con Arroz", cuisine: "Japonesa", complexity: 2, prepTime: 15, cookTime: 25, servings: 2, mealType: "dinner",
    description: "Pollo glaseado en salsa teriyaki dulce-salada, servido sobre arroz blanco",
    techniques: ["Saltear", "Glasear"],
    newCuisine: true,
    ingredients: [
      { canonicalId: "ci_001", name: "Pechuga de pollo", qty: 0.5, unit: "kg", optional: false },
      { canonicalId: "ci_004", name: "Arroz", qty: 0.3, unit: "kg", optional: false },
      { canonicalId: "ci_017", name: "Salsa de soya", qty: 60, unit: "mL", optional: false },
      { canonicalId: "ci_009", name: "Ajo", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_016", name: "Jengibre", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_013", name: "Aceite de oliva", qty: 0.02, unit: "L", optional: false },
    ],
    steps: ["Mezclar soya, miel, ajo y jengibre para salsa", "Cortar pollo en trozos y saltear", "Glasear con salsa teriyaki", "Servir sobre arroz"],
    dietTags: [],
    exploreReason: "Primera receta japonesa — usa tu pollo y arroz de despensa",
  },
  {
    id: "r11", name: "Shakshuka (Huevos en Salsa de Tomate)", cuisine: "Medio Oriente", complexity: 2, prepTime: 10, cookTime: 20, servings: 2, mealType: "breakfast",
    description: "Huevos pochados en salsa de tomate especiada, clásico del desayuno israelí",
    techniques: ["Pochar", "Guisar"],
    newCuisine: true, newTechnique: true,
    ingredients: [
      { canonicalId: "ci_006", name: "Huevos", qty: 4, unit: "units", optional: false },
      { canonicalId: "ci_002", name: "Tomate", qty: 0.5, unit: "kg", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_015", name: "Pimiento", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_009", name: "Ajo", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_019", name: "Curry en polvo", qty: 5, unit: "g", optional: true },
    ],
    steps: ["Saltear cebolla, pimiento y ajo", "Agregar tomates y especias, guisar 10 min", "Hacer huecos y romper huevos", "Tapar y cocinar hasta que huevos cuajen"],
    dietTags: ["vegetarian", "gluten-free"],
    exploreReason: "Nuevo mundo: cocina del Medio Oriente — aprende a pochar huevos en salsa",
  },
  {
    id: "r12", name: "Curry de Pollo Simple", cuisine: "India", complexity: 3, prepTime: 15, cookTime: 30, servings: 4, mealType: "dinner",
    description: "Curry aromático con leche de coco, especias y pollo tierno",
    techniques: ["Guisar", "Tostar especias"],
    newCuisine: true, newTechnique: true,
    ingredients: [
      { canonicalId: "ci_001", name: "Pechuga de pollo", qty: 0.6, unit: "kg", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_002", name: "Tomate", qty: 0.3, unit: "kg", optional: false },
      { canonicalId: "ci_009", name: "Ajo", qty: 3, unit: "units", optional: false },
      { canonicalId: "ci_016", name: "Jengibre", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_019", name: "Curry en polvo", qty: 15, unit: "g", optional: false },
      { canonicalId: "ci_020", name: "Leche de coco", qty: 200, unit: "mL", optional: false },
      { canonicalId: "ci_004", name: "Arroz", qty: 0.3, unit: "kg", optional: true },
    ],
    steps: ["Tostar especias en seco 1 min", "Saltear cebolla, ajo, jengibre", "Agregar pollo y dorar", "Añadir tomate, curry y leche de coco", "Guisar 20 min a fuego bajo"],
    dietTags: ["gluten-free"],
    exploreReason: "Salto a cocina India — técnica nueva: tostar especias en seco",
  },
  {
    id: "r13", name: "Pad Thai Casero", cuisine: "Tailandesa", complexity: 3, prepTime: 20, cookTime: 15, servings: 2, mealType: "dinner",
    description: "Fideos salteados al wok con huevo, vegetales y salsa agridulce",
    techniques: ["Wok / Salteado rápido", "Flamear"],
    newCuisine: true, newTechnique: true,
    ingredients: [
      { canonicalId: "ci_006", name: "Huevos", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_001", name: "Pechuga de pollo", qty: 0.3, unit: "kg", optional: true },
      { canonicalId: "ci_008", name: "Limón", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_017", name: "Salsa de soya", qty: 30, unit: "mL", optional: false },
      { canonicalId: "ci_009", name: "Ajo", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 0.5, unit: "units", optional: false },
    ],
    steps: ["Remojar fideos de arroz", "Preparar salsa: soya, limón, azúcar", "Saltear proteína y vegetales a fuego alto", "Agregar fideos y salsa, mezclar rápido", "Añadir huevo revuelto y servir con limón"],
    dietTags: [],
    exploreReason: "Primera receta tailandesa — aprende técnica de wok a fuego alto",
  },

  // === EXPLORE: New Technique suggestions ===
  {
    id: "r20", name: "Risotto de Queso y Limón", cuisine: "Italiana", complexity: 3, prepTime: 10, cookTime: 30, servings: 2, mealType: "dinner",
    description: "Arroz cremoso cocinado lentamente con técnica de absorción gradual",
    techniques: ["Risottare (absorción gradual)", "Mantecatura"],
    newTechnique: true,
    ingredients: [
      { canonicalId: "ci_004", name: "Arroz", qty: 0.3, unit: "kg", optional: false },
      { canonicalId: "ci_011", name: "Queso", qty: 0.1, unit: "kg", optional: false },
      { canonicalId: "ci_008", name: "Limón", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 0.5, unit: "units", optional: false },
      { canonicalId: "ci_013", name: "Aceite de oliva", qty: 0.02, unit: "L", optional: false },
      { canonicalId: "ci_005", name: "Leche", qty: 0.2, unit: "L", optional: true },
    ],
    steps: ["Saltear cebolla en aceite", "Agregar arroz y nacrar 2 min", "Añadir líquido caliente cucharón a cucharón", "Revolver constantemente 18-20 min", "Fuera del fuego: agregar queso y limón (mantecatura)"],
    dietTags: ["vegetarian", "gluten-free"],
    exploreReason: "Técnica nueva: Risottare — domina la absorción gradual y mantecatura",
  },
  {
    id: "r21", name: "Tortilla Española", cuisine: "Española", complexity: 2, prepTime: 15, cookTime: 25, servings: 4, mealType: "lunch",
    description: "Tortilla gruesa de huevo y cebolla — domina el volteo en sartén",
    techniques: ["Confitar", "Volteo en sartén"],
    newCuisine: true, newTechnique: true,
    ingredients: [
      { canonicalId: "ci_006", name: "Huevos", qty: 6, unit: "units", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_013", name: "Aceite de oliva", qty: 0.1, unit: "L", optional: false },
    ],
    steps: ["Confitar cebolla en abundante aceite a fuego bajo 15 min", "Batir huevos y mezclar con cebolla", "Cocinar en sartén a fuego medio-bajo", "Voltear usando un plato — el momento de la verdad", "Cocinar 2 min más y servir"],
    dietTags: ["vegetarian", "gluten-free"],
    exploreReason: "Técnica icónica: el volteo de tortilla — con tus huevos y cebollas",
  },

  // === EXPLORE: New Ingredient discovery ===
  {
    id: "r30", name: "Arroz con Jengibre y Limón", cuisine: "Asiática Fusión", complexity: 1, prepTime: 5, cookTime: 20, servings: 2, mealType: "lunch",
    description: "Arroz aromático perfumado con jengibre fresco — ingrediente nuevo para ti",
    techniques: ["Hervir"],
    newIngredient: "ci_016",
    ingredients: [
      { canonicalId: "ci_004", name: "Arroz", qty: 0.3, unit: "kg", optional: false },
      { canonicalId: "ci_016", name: "Jengibre", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_008", name: "Limón", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_013", name: "Aceite de oliva", qty: 0.01, unit: "L", optional: false },
    ],
    steps: ["Rallar jengibre fresco", "Cocinar arroz con jengibre rallado", "Agregar ralladura de limón al final", "Servir con un chorrito de aceite"],
    dietTags: ["vegan", "gluten-free"],
    exploreReason: "Introduce: Jengibre 🫚 — empezando simple para conocer su sabor",
  },
  {
    id: "r31", name: "Pollo al Curry de Coco Suave", cuisine: "Fusión", complexity: 2, prepTime: 10, cookTime: 25, servings: 2, mealType: "dinner",
    description: "Descubre la leche de coco en un curry suave para principiantes",
    techniques: ["Guisar"],
    newIngredient: "ci_020",
    ingredients: [
      { canonicalId: "ci_001", name: "Pechuga de pollo", qty: 0.4, unit: "kg", optional: false },
      { canonicalId: "ci_020", name: "Leche de coco", qty: 200, unit: "mL", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_009", name: "Ajo", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_002", name: "Tomate", qty: 0.2, unit: "kg", optional: false },
      { canonicalId: "ci_004", name: "Arroz", qty: 0.3, unit: "kg", optional: true },
    ],
    steps: ["Dorar pollo en cubos", "Saltear cebolla y ajo", "Agregar tomate y leche de coco", "Guisar 15 min a fuego bajo", "Servir con arroz"],
    dietTags: ["gluten-free"],
    exploreReason: "Introduce: Leche de coco 🥥 — cremosidad tropical en un plato familiar",
  },
  {
    id: "r32", name: "Huevos al Cilantro con Limón", cuisine: "Mexicana", complexity: 1, prepTime: 5, cookTime: 10, servings: 2, mealType: "breakfast",
    description: "Huevos revueltos con cilantro fresco — un sabor que cambia todo",
    techniques: ["Saltear"],
    newIngredient: "ci_018", newCuisine: true,
    ingredients: [
      { canonicalId: "ci_006", name: "Huevos", qty: 4, unit: "units", optional: false },
      { canonicalId: "ci_018", name: "Cilantro", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_008", name: "Limón", qty: 1, unit: "units", optional: false },
      { canonicalId: "ci_002", name: "Tomate", qty: 0.2, unit: "kg", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 0.5, unit: "units", optional: true },
    ],
    steps: ["Picar cilantro, tomate y cebolla", "Batir huevos", "Saltear todo junto a fuego medio", "Exprimir limón y servir"],
    dietTags: ["vegetarian", "gluten-free"],
    exploreReason: "Introduce: Cilantro 🌿 — el herb que define la cocina mexicana",
  },

  // === EXPLORE: Skill Stretch ===
  {
    id: "r40", name: "Pollo a la Crema con Pasta", cuisine: "Francesa", complexity: 4, prepTime: 15, cookTime: 30, servings: 2, mealType: "dinner",
    description: "Salsa cremosa estilo francés — un paso arriba en tu nivel",
    techniques: ["Reducción", "Deglasear", "Emulsionar"],
    newTechnique: true, newCuisine: true,
    ingredients: [
      { canonicalId: "ci_001", name: "Pechuga de pollo", qty: 0.5, unit: "kg", optional: false },
      { canonicalId: "ci_010", name: "Pasta", qty: 0.25, unit: "kg", optional: false },
      { canonicalId: "ci_005", name: "Leche", qty: 0.2, unit: "L", optional: false },
      { canonicalId: "ci_009", name: "Ajo", qty: 2, unit: "units", optional: false },
      { canonicalId: "ci_003", name: "Cebolla", qty: 0.5, unit: "units", optional: false },
      { canonicalId: "ci_011", name: "Queso", qty: 0.05, unit: "kg", optional: true },
      { canonicalId: "ci_013", name: "Aceite de oliva", qty: 0.02, unit: "L", optional: false },
    ],
    steps: ["Sellar pollo hasta dorado y reservar", "Deglasear sartén con un poco de agua", "Saltear cebolla y ajo en el fondo", "Reducir leche a fuego medio hasta espesar", "Emulsionar con queso, volver pollo a la salsa", "Servir sobre pasta al dente"],
    dietTags: [],
    exploreReason: "Skill stretch: 3 técnicas nuevas en un plato — deglasear, reducir, emulsionar",
  },
];

const COOKED_HISTORY = [
  { id: "h1", name: "Pasta con Salsa de Tomate", date: "2026-02-21", complexity: 1, rating: 4, cuisine: "Italiana" },
  { id: "h2", name: "Huevos Revueltos con Palta", date: "2026-02-20", complexity: 1, rating: 5, cuisine: "Chilena" },
  { id: "h3", name: "Arroz con Pollo", date: "2026-02-18", complexity: 2, rating: 4, cuisine: "Casera" },
  { id: "h4", name: "Tostadas de Palta", date: "2026-02-16", complexity: 1, rating: 3, cuisine: "Moderna" },
  { id: "h5", name: "Pollo al Limón con Arroz", date: "2026-02-14", complexity: 2, rating: 5, cuisine: "Chilena" },
  { id: "h6", name: "Pasta Carbonara", date: "2026-02-12", complexity: 3, rating: 4, cuisine: "Italiana" },
];

const UNMAPPED_ITEMS = [
  { id: "u1", name: "POLLO ASADO FRIED", price: 6990, merchant: "COMERCIAL MA...", date: "2026-02-20", category: "Prepared" },
  { id: "u2", name: "HELADO CHOCOLATE LUCUMA", price: 2990, merchant: "COMERCIAL MA...", date: "2026-02-20", category: "Ice Cream" },
  { id: "u3", name: "HELADO SAVORY PASAS AL RO", price: 2990, merchant: "COMERCIAL MA...", date: "2026-02-20", category: "Ice Cream" },
  { id: "u4", name: "NECTAR WATTS DAMASCO DES", price: 1899, merchant: "COMERCIAL MA...", date: "2026-02-20", category: "Juice" },
  { id: "u5", name: "TOMATE 1 KG", price: 1404, merchant: "COMERCIAL MA...", date: "2026-02-20", category: "Vegetable" },
  { id: "u6", name: "LECHE COLUN ENTERA 1L", price: 990, merchant: "COMERCIAL MA...", date: "2026-02-18", category: "Dairy" },
  { id: "u7", name: "PAN HALLULLA BOLSA 6 UN", price: 1590, merchant: "COMERCIAL MA...", date: "2026-02-18", category: "Bakery" },
];

const SHOPPING_SUGGESTIONS = [
  { id: "s1", name: "Pan", icon: "🍞", reason: "Compras cada 4 días · Última: hace 4 días", urgency: "overdue", avgQty: "6 units", frequency: "2x/semana" },
  { id: "s2", name: "Leche", icon: "🥛", reason: "Compras cada 5 días · Stock bajo", urgency: "due_soon", avgQty: "2 L", frequency: "semanal" },
  { id: "s3", name: "Huevos", icon: "🥚", reason: "Quedan 6 · Usas ~8/semana", urgency: "due_soon", avgQty: "12 units", frequency: "semanal" },
  { id: "s4", name: "Zanahoria", icon: "🥕", reason: "Necesaria para: Arroz con Pollo y Verduras", urgency: "recipe", avgQty: "0.5 kg", frequency: "receta" },
  { id: "s5", name: "Pimiento", icon: "🫑", reason: "Necesaria para: Arroz con Pollo y Verduras", urgency: "recipe", avgQty: "2 units", frequency: "receta" },
  { id: "s6", name: "Jengibre", icon: "🫚", reason: "Abre 3 recetas nuevas en Explorar", urgency: "explore", avgQty: "1 unit", frequency: "explorar" },
  { id: "s7", name: "Salsa de soya", icon: "🫙", reason: "Abre cocina Japonesa y Tailandesa", urgency: "explore", avgQty: "250 mL", frequency: "explorar" },
];

// ============================================
// UTILITIES
// ============================================

function computeMatchPct(recipe) {
  const required = recipe.ingredients.filter(i => !i.optional);
  const have = required.filter(i => PANTRY_IDS.has(i.canonicalId));
  return required.length === 0 ? 100 : Math.round((have.length / required.length) * 100);
}

// ============================================
// STYLE CONSTANTS
// ============================================

const C = {
  bg: "#faf6f1", bgWarm: "#f5efe6", bgCard: "#ffffff", bgCardHover: "#fefcf9",
  accent: "#c4704b", accentLight: "#e8a987", accentDark: "#9e5536",
  green: "#5a8a5e", greenLight: "#e8f0e8", greenBg: "#f0f7f0",
  yellow: "#c9a84c", yellowLight: "#fdf6e3", yellowBg: "#fef9ed",
  red: "#c25b5b", redLight: "#fde8e8", redBg: "#fef2f2",
  purple: "#7c6bab", purpleBg: "#f3f0fa", purpleLight: "#e8e0f8",
  blue: "#5b8fc2", blueBg: "#eef4fb",
  text: "#3d3529", textMuted: "#8a7e6d", textLight: "#b5a998",
  border: "#e8dfd3", borderLight: "#f0ead9",
};

// ============================================
// SHARED COMPONENTS
// ============================================

const StarRating = ({ rating, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{ fontSize: size, color: s <= rating ? C.yellow : C.borderLight }}>★</span>
    ))}
  </span>
);

const ComplexityDots = ({ level, max = 5 }) => (
  <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%",
        background: i < level ? C.accent : C.borderLight,
      }} />
    ))}
  </span>
);

const Badge = ({ children, color = C.accent, bg = C.bgWarm, style: s = {} }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: "2px 10px",
    borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
    color, background: bg, whiteSpace: "nowrap", ...s,
  }}>{children}</span>
);

const MatchBar = ({ pct }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
    <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.borderLight, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 3, transition: "width 0.6s ease",
        width: `${pct}%`,
        background: pct >= 80 ? C.green : pct >= 50 ? C.yellow : C.red,
      }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 80 ? C.green : pct >= 50 ? C.yellow : C.red, minWidth: 36, textAlign: "right" }}>
      {pct}%
    </span>
  </div>
);

const ExpiryBadge = ({ date }) => {
  const days = Math.ceil((new Date(date) - new Date("2026-02-22")) / 86400000);
  const color = days <= 2 ? C.red : days <= 5 ? C.yellow : C.green;
  const bg = days <= 2 ? C.redBg : days <= 5 ? C.yellowBg : C.greenBg;
  const label = days <= 0 ? "Vencido" : days === 1 ? "1 día" : `${days} días`;
  return <Badge color={color} bg={bg}>{label}</Badge>;
};

const UrgencyBadge = ({ urgency }) => {
  const config = {
    overdue: { label: "Pendiente", color: C.red, bg: C.redBg },
    due_soon: { label: "Pronto", color: C.yellow, bg: C.yellowBg },
    recipe: { label: "Receta", color: C.accent, bg: "#fef0e8" },
    explore: { label: "Explorar", color: C.purple, bg: C.purpleBg },
  };
  const c = config[urgency] || config.due_soon;
  return <Badge color={c.color} bg={c.bg}>{c.label}</Badge>;
};

const Hoverable = ({ children, style, ...props }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}
      style={{
        ...style,
        borderColor: hovered ? C.accentLight : (style?.borderColor || C.borderLight),
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 4px 12px rgba(196,112,75,0.08)" : "none",
        transition: "all 0.15s",
      }}
      {...props}
    >{children}</div>
  );
};

// ============================================
// NAV BAR
// ============================================

const NavBar = ({ view, setView }) => {
  const items = [
    { id: "home", icon: "🏠", label: "Inicio" },
    { id: "pantry", icon: "🥘", label: "Despensa" },
    { id: "explore", icon: "✨", label: "Explorar", center: true },
    { id: "recipes", icon: "📖", label: "Recetas" },
    { id: "more", icon: "•••", label: "Más" },
  ];

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
      borderTop: `1px solid ${C.borderLight}`,
      display: "flex", justifyContent: "space-around", alignItems: "flex-end",
      padding: "0 0 max(6px, env(safe-area-inset-bottom))",
      maxWidth: 480, margin: "0 auto",
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => setView(item.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none", padding: item.center ? "0 12px 6px" : "10px 12px 6px",
          cursor: "pointer", position: "relative",
          color: view === item.id ? C.accent : C.textMuted,
        }}>
          {item.center ? (
            <span style={{
              width: 52, height: 52, borderRadius: "50%",
              background: view === item.id
                ? `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`
                : `linear-gradient(135deg, ${C.purple}, #6556a0)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, marginTop: -20,
              boxShadow: "0 4px 16px rgba(124,107,171,0.3)",
              border: "3px solid white",
            }}>{item.icon}</span>
          ) : (
            <span style={{ fontSize: 20, filter: view === item.id ? "none" : "grayscale(0.5)" }}>{item.icon}</span>
          )}
          <span style={{
            fontSize: 10,
            fontWeight: view === item.id ? 700 : 500,
            letterSpacing: 0.3,
            color: item.center && view !== item.id ? C.purple : undefined,
          }}>{item.label}</span>
          {view === item.id && !item.center && <span style={{
            position: "absolute", top: 0, width: 24, height: 2, borderRadius: 1, background: C.accent,
          }} />}
        </button>
      ))}
    </nav>
  );
};

// ============================================
// RECIPE DETAIL MODAL
// ============================================

const RecipeDetail = ({ recipe, onClose }) => {
  if (!recipe) return null;
  const matchPct = computeMatchPct(recipe);
  const hasNewTech = recipe.techniques?.some(t => !COOKED_TECHNIQUES.has(t));
  const isNewCuisine = !COOKED_CUISINES.has(recipe.cuisine);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.bg, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px",
        maxWidth: 480, width: "100%", maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 16px" }} />

        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>{recipe.name}</h2>
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>{recipe.description}</p>

        {/* Explore badges */}
        {(recipe.exploreReason || isNewCuisine || hasNewTech) && (
          <div style={{
            padding: "10px 14px", borderRadius: 12, marginBottom: 14,
            background: `linear-gradient(135deg, ${C.purpleBg}, ${C.blueBg})`,
            border: `1px solid ${C.purpleLight}`,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.purple, margin: 0 }}>
              ✨ {recipe.exploreReason || "Algo nuevo para explorar"}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <Badge>{recipe.cuisine}</Badge>
          <Badge>{recipe.prepTime + recipe.cookTime} min</Badge>
          <Badge>{recipe.servings} porciones</Badge>
          {isNewCuisine && <Badge color={C.purple} bg={C.purpleBg}>🌍 Nueva cocina</Badge>}
          {hasNewTech && <Badge color={C.blue} bg={C.blueBg}>🔧 Técnica nueva</Badge>}
        </div>

        <MatchBar pct={matchPct} />

        {/* Techniques */}
        {recipe.techniques && (
          <>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "16px 0 8px" }}>Técnicas</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
              {recipe.techniques.map((t, i) => {
                const isNew = !COOKED_TECHNIQUES.has(t);
                return (
                  <Badge key={i} color={isNew ? C.blue : C.textMuted} bg={isNew ? C.blueBg : C.bgWarm}>
                    {isNew ? "🆕 " : ""}{t}
                  </Badge>
                );
              })}
            </div>
          </>
        )}

        {/* Ingredients */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "16px 0 8px" }}>Ingredientes</h3>
        {recipe.ingredients.map((ing, i) => {
          const inPantry = PANTRY_IDS.has(ing.canonicalId);
          const isNew = !COOKED_INGREDIENTS.has(ing.canonicalId);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 4,
              borderRadius: 10,
              background: inPantry ? C.greenBg : ing.optional ? C.bgWarm : C.redBg,
              border: isNew ? `1px dashed ${C.purple}` : "1px solid transparent",
            }}>
              <span style={{ fontSize: 16 }}>{inPantry ? "✅" : ing.optional ? "➖" : "❌"}</span>
              <span style={{ flex: 1, fontSize: 13, color: C.text }}>
                {ing.name}
                {isNew && <span style={{ fontSize: 10, color: C.purple, marginLeft: 6, fontWeight: 600 }}>NUEVO</span>}
              </span>
              <span style={{ fontSize: 12, color: C.textMuted }}>{ing.qty} {ing.unit}</span>
            </div>
          );
        })}

        {/* Steps */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "16px 0 8px" }}>Preparación</h3>
        {recipe.steps.map((step, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, padding: "10px 0",
            borderBottom: i < recipe.steps.length - 1 ? `1px solid ${C.borderLight}` : "none",
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: "50%", background: C.accent, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>{i + 1}</span>
            <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{step}</p>
          </div>
        ))}

        <button style={{
          width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
          color: "white", fontSize: 15, fontWeight: 700, marginTop: 20,
        }}>👨‍🍳 ¡Voy a cocinar esto!</button>
      </div>
    </div>
  );
};

// ============================================
// HOME VIEW
// ============================================

const HomeView = ({ setView }) => {
  const expiring = PANTRY_ITEMS.filter(p => {
    const days = Math.ceil((new Date(p.expiresAt) - new Date("2026-02-22")) / 86400000);
    return days <= 3 && days > 0;
  });
  const topRecipes = ALL_RECIPES.filter(r => computeMatchPct(r) >= 80).slice(0, 3);

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Domingo, 22 Feb</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>
          Hola, Gabriel 👨‍🍳
        </h1>
      </div>

      {/* Proficiency */}
      <div style={{
        background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`,
        borderRadius: 16, padding: "18px 20px", marginBottom: 16, color: "white",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>Tu nivel</p>
            <p style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>Comfortable</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>47</p>
            <p style={{ fontSize: 11, opacity: 0.8 }}>platos cocinados</p>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
          <div><p style={{ fontSize: 11, opacity: 0.7 }}>Complejidad avg</p><p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>3.2 / 5</p></div>
          <div><p style={{ fontSize: 11, opacity: 0.7 }}>Racha</p><p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>🔥 5 días</p></div>
          <div><p style={{ fontSize: 11, opacity: 0.7 }}>Cocinas</p><p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>4 tipos</p></div>
        </div>
      </div>

      {/* Explore CTA */}
      <button onClick={() => setView("explore")} style={{
        width: "100%", padding: "16px 18px", borderRadius: 16, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${C.purpleBg}, ${C.blueBg})`,
        marginBottom: 16, textAlign: "left",
        boxShadow: `inset 0 0 0 1px ${C.purpleLight}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>✨</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.purple, margin: 0 }}>¿Listo para algo nuevo?</p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>3 cocinas nuevas y 5 técnicas por descubrir con lo que tienes</p>
          </div>
          <span style={{ fontSize: 18, color: C.purple }}>→</span>
        </div>
      </button>

      {/* Expiring */}
      {expiring.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>⏰ Por vencer</h2>
            <button onClick={() => setView("pantry")} style={{ fontSize: 12, color: C.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todo →</button>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {expiring.map(item => (
              <div key={item.id} style={{
                minWidth: 110, background: C.bgCard, borderRadius: 14, padding: "12px 14px",
                border: `1px solid ${C.redLight}`, textAlign: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <p style={{ fontSize: 12, fontWeight: 600, margin: "6px 0 4px", color: C.text }}>{item.name}</p>
                <ExpiryBadge date={item.expiresAt} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Recipes */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 10px" }}>🍳 Puedes cocinar ahora</h2>
        {topRecipes.map(r => (
          <Hoverable key={r.id} style={{
            background: C.bgCard, borderRadius: 14, padding: "14px 16px", marginBottom: 8,
            border: `1px solid ${C.borderLight}`, cursor: "pointer",
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{r.name}</p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 8px" }}>{r.cuisine} · {r.prepTime + r.cookTime} min</p>
            <MatchBar pct={computeMatchPct(r)} />
          </Hoverable>
        ))}
      </div>

      {/* History */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 10px" }}>📝 Cocinado reciente</h2>
        {COOKED_HISTORY.slice(0, 3).map(meal => (
          <div key={meal.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", borderBottom: `1px solid ${C.borderLight}`,
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{meal.name}</p>
              <p style={{ fontSize: 11, color: C.textMuted, margin: "2px 0 0" }}>{meal.date} · {meal.cuisine}</p>
            </div>
            <StarRating rating={meal.rating} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// EXPLORE VIEW — THE CORE FEATURE
// ============================================

const EXPLORE_MODES = [
  {
    id: "cuisine", icon: "🌍", title: "Nueva Cocina",
    subtitle: "Descubre sabores del mundo",
    description: "Recetas de cocinas que aún no has probado, usando ingredientes que ya tienes",
    color: C.purple, bg: C.purpleBg,
    stat: "4 cocinas dominadas · 6+ por descubrir",
  },
  {
    id: "technique", icon: "🔧", title: "Nueva Técnica",
    subtitle: "Aprende haciendo",
    description: "Cada receta introduce una técnica nueva que expande tu repertorio",
    color: C.blue, bg: C.blueBg,
    stat: "5 técnicas dominadas · 8+ por aprender",
  },
  {
    id: "ingredient", icon: "🧪", title: "Nuevo Ingrediente",
    subtitle: "Expande tu paladar",
    description: "Ingredientes que nunca has cocinado, introducidos en recetas simples primero",
    color: C.green, bg: C.greenBg,
    stat: "12 ingredientes usados · 8+ por probar",
  },
  {
    id: "stretch", icon: "📈", title: "Skill Stretch",
    subtitle: "Sube de nivel",
    description: "Recetas ligeramente por encima de tu nivel actual para crecer como cocinero",
    color: C.accent, bg: "#fef0e8",
    stat: "Nivel actual: Comfortable (3.2/5)",
  },
];

const ExploreView = ({ setSelectedRecipe }) => {
  const [mode, setMode] = useState(null);

  const getFilteredRecipes = (modeId) => {
    switch (modeId) {
      case "cuisine":
        return ALL_RECIPES.filter(r => r.newCuisine || !COOKED_CUISINES.has(r.cuisine));
      case "technique":
        return ALL_RECIPES.filter(r => r.newTechnique || r.techniques?.some(t => !COOKED_TECHNIQUES.has(t)));
      case "ingredient":
        return ALL_RECIPES.filter(r => r.newIngredient || r.ingredients.some(i => !COOKED_INGREDIENTS.has(i.canonicalId) && !i.optional));
      case "stretch":
        return ALL_RECIPES.filter(r => r.complexity >= 3).sort((a, b) => a.complexity - b.complexity);
      default:
        return [];
    }
  };

  const filteredRecipes = mode ? getFilteredRecipes(mode) : [];
  const currentMode = EXPLORE_MODES.find(m => m.id === mode);

  // Cuisine map for the cuisine mode
  const cuisineGroups = useMemo(() => {
    if (mode !== "cuisine") return {};
    const groups = {};
    filteredRecipes.forEach(r => {
      if (!groups[r.cuisine]) groups[r.cuisine] = [];
      groups[r.cuisine].push(r);
    });
    return groups;
  }, [mode, filteredRecipes]);

  // Technique map
  const newTechniques = useMemo(() => {
    if (mode !== "technique") return [];
    const techs = new Set();
    filteredRecipes.forEach(r => r.techniques?.forEach(t => {
      if (!COOKED_TECHNIQUES.has(t)) techs.add(t);
    }));
    return [...techs];
  }, [mode, filteredRecipes]);

  // New ingredients available
  const newIngredientsList = useMemo(() => {
    if (mode !== "ingredient") return [];
    const ids = new Set();
    filteredRecipes.forEach(r => {
      if (r.newIngredient) ids.add(r.newIngredient);
      r.ingredients.forEach(i => {
        if (!COOKED_INGREDIENTS.has(i.canonicalId) && !i.optional) ids.add(i.canonicalId);
      });
    });
    return [...ids].map(id => CANONICAL_INGREDIENTS.find(c => c.id === id)).filter(Boolean);
  }, [mode, filteredRecipes]);

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 12px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>
          ✨ Explorar
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
          {mode ? (
            <button onClick={() => setMode(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontWeight: 600, fontSize: 13, padding: 0 }}>
              ← Volver a modos
            </button>
          ) : "Descubre algo nuevo cada vez que cocinas"}
        </p>
      </div>

      {/* ===== MODE SELECTION ===== */}
      {!mode && (
        <>
          {/* Your Exploration Profile */}
          <div style={{
            background: `linear-gradient(135deg, #3d2c5e 0%, #5a4580 100%)`,
            borderRadius: 16, padding: "18px 20px", marginBottom: 20, color: "white",
          }}>
            <p style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Tu mapa de exploración</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 12px" }}>
                <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>4</p>
                <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>Cocinas probadas</p>
                <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                  {["🇨🇱", "🇮🇹", "🏠", "🆕"].map((f, i) => <span key={i} style={{ fontSize: 14 }}>{f}</span>)}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 12px" }}>
                <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>5</p>
                <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>Técnicas dominadas</p>
                <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                  <div style={{ width: "38%", height: "100%", borderRadius: 2, background: "rgba(255,255,255,0.6)" }} />
                </div>
                <p style={{ fontSize: 9, opacity: 0.5, margin: "4px 0 0" }}>5 de ~13 básicas</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 12px" }}>
                <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>12</p>
                <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>Ingredientes usados</p>
                <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                  <div style={{ width: "60%", height: "100%", borderRadius: 2, background: "rgba(255,255,255,0.6)" }} />
                </div>
                <p style={{ fontSize: 9, opacity: 0.5, margin: "4px 0 0" }}>12 de 20 disponibles</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 12px" }}>
                <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>3.2</p>
                <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>Complejidad promedio</p>
                <ComplexityDots level={3} />
                <p style={{ fontSize: 9, opacity: 0.5, margin: "4px 0 0" }}>Próximo desafío: nivel 4</p>
              </div>
            </div>
          </div>

          {/* Mode Cards */}
          {EXPLORE_MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              width: "100%", textAlign: "left", background: C.bgCard,
              borderRadius: 16, padding: "16px 18px", marginBottom: 10,
              border: `1px solid ${C.borderLight}`, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: m.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
                }}>{m.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{m.title}</p>
                    <span style={{ fontSize: 16, color: m.color }}>→</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: m.color, margin: "2px 0" }}>{m.subtitle}</p>
                  <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0", lineHeight: 1.4 }}>{m.description}</p>
                  <p style={{ fontSize: 11, color: C.textLight, margin: "6px 0 0", fontStyle: "italic" }}>{m.stat}</p>
                </div>
              </div>
            </button>
          ))}
        </>
      )}

      {/* ===== CUISINE MODE ===== */}
      {mode === "cuisine" && (
        <>
          <div style={{
            background: C.purpleBg, borderRadius: 14, padding: "14px 16px", marginBottom: 16,
            border: `1px solid ${C.purpleLight}`,
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.purple, margin: 0 }}>
              🌍 Has cocinado: {[...COOKED_CUISINES].join(", ")}
            </p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>
              Estas recetas te llevan a cocinas nuevas usando ingredientes familiares
            </p>
          </div>
          {Object.entries(cuisineGroups).map(([cuisine, recipes]) => (
            <div key={cuisine} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Badge color={C.purple} bg={C.purpleBg}>🆕 {cuisine}</Badge>
                <span style={{ fontSize: 12, color: C.textMuted }}>{recipes.length} receta{recipes.length > 1 ? "s" : ""}</span>
              </div>
              {recipes.map(r => (
                <RecipeExploreCard key={r.id} recipe={r} onSelect={setSelectedRecipe} accentColor={C.purple} />
              ))}
            </div>
          ))}
        </>
      )}

      {/* ===== TECHNIQUE MODE ===== */}
      {mode === "technique" && (
        <>
          <div style={{
            background: C.blueBg, borderRadius: 14, padding: "14px 16px", marginBottom: 16,
            border: `1px solid #c8ddf0`,
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.blue, margin: 0 }}>
              🔧 Dominas: {[...COOKED_TECHNIQUES].join(", ")}
            </p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>
              Técnicas nuevas por descubrir: {newTechniques.join(", ")}
            </p>
          </div>
          {filteredRecipes.map(r => (
            <RecipeExploreCard key={r.id} recipe={r} onSelect={setSelectedRecipe} accentColor={C.blue}
              highlight={r.techniques?.filter(t => !COOKED_TECHNIQUES.has(t)).map(t => `🆕 ${t}`)}
            />
          ))}
        </>
      )}

      {/* ===== INGREDIENT MODE ===== */}
      {mode === "ingredient" && (
        <>
          <div style={{
            background: C.greenBg, borderRadius: 14, padding: "14px 16px", marginBottom: 16,
            border: `1px solid ${C.greenLight}`,
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.green, margin: 0 }}>
              🧪 Ingredientes nuevos por descubrir
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {newIngredientsList.map(ing => (
                <span key={ing.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
                  borderRadius: 20, background: "white", fontSize: 12, fontWeight: 600, color: C.text,
                  border: `1px dashed ${C.green}`,
                }}>
                  {ing.icon} {ing.nameEs}
                </span>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, fontStyle: "italic" }}>
            Cada receta introduce un ingrediente nuevo de forma gradual — empezando simple
          </p>
          {filteredRecipes
            .sort((a, b) => a.complexity - b.complexity)
            .map(r => {
              const newIng = CANONICAL_INGREDIENTS.find(c => c.id === r.newIngredient);
              return (
                <RecipeExploreCard key={r.id} recipe={r} onSelect={setSelectedRecipe} accentColor={C.green}
                  highlight={newIng ? [`${newIng.icon} Introduce: ${newIng.nameEs}`] : undefined}
                />
              );
            })}
        </>
      )}

      {/* ===== STRETCH MODE ===== */}
      {mode === "stretch" && (
        <>
          <div style={{
            background: "#fef0e8", borderRadius: 14, padding: "14px 16px", marginBottom: 16,
            border: `1px solid ${C.accentLight}`,
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.accent, margin: 0 }}>
              📈 Tu complejidad promedio: 3.2 / 5
            </p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>
              Estas recetas son nivel 3-4 — un escalón arriba para seguir creciendo
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>Tu nivel:</span>
              <ComplexityDots level={3} />
              <span style={{ fontSize: 11, color: C.textMuted, margin: "0 4px" }}>→</span>
              <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>Objetivo:</span>
              <ComplexityDots level={4} />
            </div>
          </div>
          {filteredRecipes.map(r => (
            <RecipeExploreCard key={r.id} recipe={r} onSelect={setSelectedRecipe} accentColor={C.accent}
              highlight={r.techniques?.filter(t => !COOKED_TECHNIQUES.has(t)).map(t => `🆕 ${t}`)}
            />
          ))}
        </>
      )}
    </div>
  );
};

const RecipeExploreCard = ({ recipe, onSelect, accentColor, highlight }) => {
  const matchPct = computeMatchPct(recipe);
  const missingRequired = recipe.ingredients.filter(i => !PANTRY_IDS.has(i.canonicalId) && !i.optional);

  return (
    <Hoverable onClick={() => onSelect(recipe)} style={{
      background: C.bgCard, borderRadius: 16, padding: "16px 18px", marginBottom: 10,
      border: `1px solid ${C.borderLight}`, cursor: "pointer",
    }}>
      {/* Explore reason banner */}
      {recipe.exploreReason && (
        <div style={{
          padding: "6px 10px", borderRadius: 8, marginBottom: 10,
          background: `linear-gradient(135deg, ${C.purpleBg}, ${C.blueBg})`,
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: accentColor, margin: 0 }}>
            ✨ {recipe.exploreReason}
          </p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>{recipe.name}</p>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0" }}>{recipe.description}</p>
        </div>
      </div>

      <MatchBar pct={matchPct} />

      {/* Highlight badges */}
      {highlight && highlight.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {highlight.map((h, i) => (
            <Badge key={i} color={accentColor} bg={`${accentColor}15`}>{h}</Badge>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Badge color={C.textMuted} bg={C.bgWarm}>{recipe.cuisine}</Badge>
        <Badge color={C.textMuted} bg={C.bgWarm}>{recipe.prepTime + recipe.cookTime} min</Badge>
        <Badge color={C.textMuted} bg={C.bgWarm}>{recipe.servings} porc.</Badge>
        <div style={{ marginLeft: "auto" }}><ComplexityDots level={recipe.complexity} /></div>
      </div>

      {/* Missing ingredients */}
      {missingRequired.length > 0 && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: C.yellowBg, borderRadius: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.yellow, margin: 0 }}>
            🛒 Te falta: {missingRequired.map(i => i.name).join(", ")}
          </p>
        </div>
      )}
    </Hoverable>
  );
};

// ============================================
// PANTRY VIEW
// ============================================

const PantryView = () => {
  const [filter, setFilter] = useState("all");
  const categories = [...new Set(CANONICAL_INGREDIENTS.map(i => i.category))];
  const sorted = [...PANTRY_ITEMS].sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
  const filtered = filter === "all" ? sorted : sorted.filter(p => {
    const ci = CANONICAL_INGREDIENTS.find(c => c.id === p.canonicalId);
    return ci?.category === filter;
  });

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 12px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>🥘 Mi Despensa</h1>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>{PANTRY_ITEMS.length} ingredientes disponibles</p>
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12 }}>
        {["all", ...categories].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
            background: filter === cat ? C.accent : C.bgCard,
            color: filter === cat ? "white" : C.textMuted,
            boxShadow: filter === cat ? "none" : `inset 0 0 0 1px ${C.border}`,
          }}>{cat === "all" ? "Todos" : cat}</button>
        ))}
      </div>
      {filtered.map(item => (
        <div key={item.id} style={{
          background: C.bgCard, borderRadius: 14, padding: "14px 16px", marginBottom: 8,
          border: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 32, width: 44, textAlign: "center" }}>{item.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{item.name}</p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "3px 0 0" }}>{item.qty} {item.unit} · {item.purchasedAt}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <ExpiryBadge date={item.expiresAt} />
            {item.status === "low" && <Badge color={C.yellow} bg={C.yellowBg}>Stock bajo</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// RECIPES VIEW
// ============================================

const RecipesView = ({ setSelectedRecipe }) => {
  const [filterMeal, setFilterMeal] = useState("all");
  const [sortBy, setSortBy] = useState("match");

  const withMatch = ALL_RECIPES.map(r => ({ ...r, matchPct: computeMatchPct(r) }));
  const filtered = withMatch.filter(r => filterMeal === "all" || r.mealType === filterMeal);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "match") return b.matchPct - a.matchPct;
    if (sortBy === "complexity") return a.complexity - b.complexity;
    if (sortBy === "time") return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
    return 0;
  });

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 12px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>📖 Todas las Recetas</h1>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>{ALL_RECIPES.length} recetas · Basado en despensa y preferencias</p>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
        {[{ id: "all", l: "Todas" }, { id: "breakfast", l: "🌅 Desayuno" }, { id: "lunch", l: "☀️ Almuerzo" }, { id: "dinner", l: "🌙 Cena" }].map(f => (
          <button key={f.id} onClick={() => setFilterMeal(f.id)} style={{
            padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
            background: filterMeal === f.id ? C.accent : C.bgCard,
            color: filterMeal === f.id ? "white" : C.textMuted,
            boxShadow: filterMeal === f.id ? "none" : `inset 0 0 0 1px ${C.border}`,
          }}>{f.l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: 0.5 }}>ORDENAR:</span>
        {[{ id: "match", l: "Match" }, { id: "complexity", l: "Facilidad" }, { id: "time", l: "Tiempo" }].map(s => (
          <button key={s.id} onClick={() => setSortBy(s.id)} style={{
            padding: "4px 10px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
            background: sortBy === s.id ? C.greenBg : "transparent",
            color: sortBy === s.id ? C.green : C.textMuted,
          }}>{s.l}</button>
        ))}
      </div>
      {sorted.map(r => (
        <RecipeExploreCard key={r.id} recipe={r} onSelect={setSelectedRecipe} accentColor={C.purple} />
      ))}
    </div>
  );
};

// ============================================
// MORE VIEW (Map + Shop + Profile)
// ============================================

const MoreView = ({ setView }) => {
  const sections = [
    { id: "map", icon: "🔗", title: "Mapear Items", desc: "Conecta items de Boletapp con ingredientes", badge: `${UNMAPPED_ITEMS.length} pendientes`, badgeColor: C.yellow },
    { id: "shop", icon: "🛒", title: "Lista de Compras", desc: "Sugerencias basadas en patrones y recetas", badge: `${SHOPPING_SUGGESTIONS.length} sugerencias`, badgeColor: C.green },
  ];

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>••• Más</h1>
      </div>
      {sections.map(s => (
        <button key={s.id} onClick={() => setView(s.id)} style={{
          width: "100%", textAlign: "left", background: C.bgCard,
          borderRadius: 14, padding: "16px 18px", marginBottom: 10,
          border: `1px solid ${C.borderLight}`, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 28 }}>{s.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{s.title}</p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{s.desc}</p>
          </div>
          <Badge color={s.badgeColor} bg={`${s.badgeColor}20`}>{s.badge}</Badge>
        </button>
      ))}

      {/* Cooking History */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "20px 0 10px" }}>📝 Historial completo</h3>
      {COOKED_HISTORY.map(meal => (
        <div key={meal.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 0", borderBottom: `1px solid ${C.borderLight}`,
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{meal.name}</p>
            <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>{meal.date}</span>
              <Badge color={C.textMuted} bg={C.bgWarm}>{meal.cuisine}</Badge>
              <ComplexityDots level={meal.complexity} />
            </div>
          </div>
          <StarRating rating={meal.rating} />
        </div>
      ))}
    </div>
  );
};

// ============================================
// MAP & SHOP VIEWS (kept from v1, minor tweaks)
// ============================================

const MapItemsView = ({ setView }) => {
  const [items, setItems] = useState(UNMAPPED_ITEMS);
  const [mappingItem, setMappingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [mapped, setMapped] = useState([]);

  const filteredIngredients = CANONICAL_INGREDIENTS.filter(ci =>
    ci.nameEs.toLowerCase().includes(search.toLowerCase()) || ci.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  const handleMap = (item, canonical) => {
    setMapped(prev => [...prev, { item, canonical }]);
    setItems(prev => prev.filter(i => i.id !== item.id));
    setMappingItem(null); setSearch("");
  };

  const handleSkip = (item) => {
    setMapped(prev => [...prev, { item, canonical: { nameEs: "Otro (sin mapear)", icon: "❓" } }]);
    setItems(prev => prev.filter(i => i.id !== item.id));
    setMappingItem(null);
  };

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 12px" }}>
        <button onClick={() => setView("more")} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontWeight: 600, fontSize: 13, padding: 0, marginBottom: 8, display: "block" }}>← Volver</button>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>🔗 Mapear Items</h1>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Conecta items de Boletapp con ingredientes</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: C.yellowBg, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: C.yellow, margin: 0 }}>{items.length}</p>
          <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Pendientes</p>
        </div>
        <div style={{ flex: 1, background: C.greenBg, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: C.green, margin: 0 }}>{mapped.length}</p>
          <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Mapeados</p>
        </div>
      </div>

      {mappingItem && (
        <div style={{ background: C.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, border: `2px solid ${C.accent}`, boxShadow: "0 8px 24px rgba(196,112,75,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: C.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Mapeando</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.accent, margin: "4px 0 0" }}>{mappingItem.name}</p>
              <p style={{ fontSize: 11, color: C.textMuted }}>${mappingItem.price.toLocaleString()} · {mappingItem.category}</p>
            </div>
            <button onClick={() => { setMappingItem(null); setSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.textMuted }}>✕</button>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ingrediente..."
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", background: C.bg, marginBottom: 10, boxSizing: "border-box" }}
          />
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {filteredIngredients.map(ci => (
              <button key={ci.id} onClick={() => handleMap(mappingItem, ci)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
                background: "none", border: "none", borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", textAlign: "left",
              }} onMouseOver={e => e.currentTarget.style.background = C.bgWarm} onMouseOut={e => e.currentTarget.style.background = "none"}>
                <span style={{ fontSize: 22 }}>{ci.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{ci.nameEs}</p>
                  <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>{ci.category} · {ci.unit}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => handleSkip(mappingItem)} style={{
            width: "100%", padding: "10px", borderRadius: 10, border: `1px dashed ${C.border}`,
            background: "none", cursor: "pointer", fontSize: 12, color: C.textMuted, marginTop: 8, fontWeight: 600,
          }}>❓ Asignar a "Otro"</button>
        </div>
      )}

      {items.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>Items sin mapear</h3>
          {items.map(item => (
            <button key={item.id} onClick={() => { setMappingItem(item); setSearch(""); }} style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              background: C.bgCard, borderRadius: 12, padding: "12px 14px", marginBottom: 6,
              border: `1px solid ${C.borderLight}`, cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: C.yellowBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>❓</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                <p style={{ fontSize: 11, color: C.textMuted, margin: "2px 0 0" }}>{item.merchant} · {item.date}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>${item.price.toLocaleString()}</p>
                <Badge color={C.textMuted} bg={C.bgWarm}>{item.category}</Badge>
              </div>
            </button>
          ))}
        </>
      )}
      {mapped.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.green, margin: "20px 0 8px" }}>✅ Mapeados</h3>
          {mapped.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 4, background: C.greenBg, borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}>{m.canonical.icon || "❓"}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0, textDecoration: "line-through" }}>{m.item.name}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.green, margin: 0 }}>→ {m.canonical.nameEs}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const ShoppingView = ({ setView }) => {
  const [checked, setChecked] = useState(new Set());
  const toggle = id => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const renderItem = item => (
    <div key={item.id} onClick={() => toggle(item.id)} style={{
      display: "flex", alignItems: "center", gap: 12,
      background: checked.has(item.id) ? C.greenBg : C.bgCard,
      borderRadius: 12, padding: "12px 14px", marginBottom: 6,
      border: `1px solid ${checked.has(item.id) ? C.green : C.borderLight}`,
      cursor: "pointer", opacity: checked.has(item.id) ? 0.7 : 1,
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${checked.has(item.id) ? C.green : C.border}`,
        background: checked.has(item.id) ? C.green : "white", color: "white", fontSize: 12,
      }}>{checked.has(item.id) ? "✓" : ""}</span>
      <span style={{ fontSize: 26 }}>{item.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, textDecoration: checked.has(item.id) ? "line-through" : "none" }}>{item.name}</p>
          <UrgencyBadge urgency={item.urgency} />
        </div>
        <p style={{ fontSize: 11, color: C.textMuted, margin: "3px 0 0" }}>{item.reason}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.accent, margin: 0 }}>{item.avgQty}</p>
        <p style={{ fontSize: 10, color: C.textMuted, margin: 0 }}>{item.frequency}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 12px" }}>
        <button onClick={() => setView("more")} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontWeight: 600, fontSize: 13, padding: 0, marginBottom: 8, display: "block" }}>← Volver</button>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>🛒 Lista de Compras</h1>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Sugerencias basadas en patrones, recetas y exploración</p>
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>Por patrones de compra</h3>
      {SHOPPING_SUGGESTIONS.filter(s => s.urgency !== "recipe" && s.urgency !== "explore").map(renderItem)}

      <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, margin: "20px 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>Para completar recetas</h3>
      {SHOPPING_SUGGESTIONS.filter(s => s.urgency === "recipe").map(renderItem)}

      <h3 style={{ fontSize: 13, fontWeight: 700, color: C.purple, margin: "20px 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>✨ Para explorar</h3>
      <p style={{ fontSize: 11, color: C.textMuted, margin: "-4px 0 8px", fontStyle: "italic" }}>Compra estos para desbloquear nuevas recetas y cocinas</p>
      {SHOPPING_SUGGESTIONS.filter(s => s.urgency === "explore").map(renderItem)}

      <div style={{ marginTop: 20, background: C.bgWarm, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>
            {checked.size}/{SHOPPING_SUGGESTIONS.length} marcados
          </p>
          <button style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: C.accent, color: "white", fontSize: 12, fontWeight: 700 }}>📋 Compartir</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function CookingApp() {
  const [view, setView] = useState("home");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleSetView = useCallback((v) => { setView(v); setSelectedRecipe(null); }, []);

  // Map nav "more" sub-views
  const navView = ["map", "shop"].includes(view) ? "more" : view;

  return (
    <div style={{
      maxWidth: 480, margin: "0 auto", minHeight: "100vh",
      background: C.bg, fontFamily: "'DM Sans', sans-serif", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
        body { margin: 0; background: ${C.bg}; }
      `}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(250,246,241,0.92)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.borderLight}`,
        padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🍳</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.accent, fontFamily: "'Playfair Display', serif", letterSpacing: -0.5 }}>CocinaApp</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted, fontWeight: 600 }}>👥 Mi Grupo</button>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>GC</div>
        </div>
      </header>

      {view === "home" && <HomeView setView={handleSetView} />}
      {view === "pantry" && <PantryView />}
      {view === "explore" && <ExploreView setSelectedRecipe={setSelectedRecipe} />}
      {view === "recipes" && <RecipesView setSelectedRecipe={setSelectedRecipe} />}
      {view === "more" && <MoreView setView={handleSetView} />}
      {view === "map" && <MapItemsView setView={handleSetView} />}
      {view === "shop" && <ShoppingView setView={handleSetView} />}

      <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      <NavBar view={navView} setView={handleSetView} />
    </div>
  );
}
