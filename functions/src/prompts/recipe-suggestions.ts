/**
 * Prompt template for Gemini recipe suggestions.
 *
 * Inputs: pantry items, dietary prefs, allergies, proficiency tier, avg complexity.
 * Output: structured JSON array of recipe suggestions.
 */

export interface RecipePromptInput {
  pantryItems: { name: string; quantity: number; unit: string }[]
  dietPrefs: string[]
  allergies: string[]
  proficiencyTier: string
  avgComplexity: number
}

export const SYSTEM_INSTRUCTION = `Eres un chef y guía culinario chileno experto. Tu rol es sugerir recetas basadas en los ingredientes disponibles del usuario.

REGLAS:
- Responde SOLO con JSON válido, sin markdown ni texto adicional
- Sugiere entre 3 y 5 recetas
- Prioriza recetas que usen la mayor cantidad de ingredientes disponibles
- Las recetas deben ser apropiadas para el nivel de habilidad del usuario
- Todos los textos (nombres, descripciones, instrucciones) deben estar en español
- La complejidad debe ser un número entero entre 1 y 5
- Incluye cocinas variadas (chilena, latinoamericana, internacional)
- Cada ingrediente debe tener una cantidad y unidad realistas

ESCALA DE COMPLEJIDAD:
1 = Muy fácil (huevos revueltos, ensalada)
2 = Fácil (pasta con salsa, arroz con pollo)
3 = Intermedio (risotto, empanadas)
4 = Avanzado (sushi, mole)
5 = Experto (menú degustación, técnicas avanzadas)`

export function buildRecipePrompt(input: RecipePromptInput): string {
  const { pantryItems, dietPrefs, allergies, proficiencyTier, avgComplexity } = input

  const pantryList = pantryItems
    .map((item) => `- ${item.name}: ${item.quantity} ${item.unit}`)
    .join('\n')

  const dietSection =
    dietPrefs.length > 0
      ? `\nPreferencias dietéticas: ${dietPrefs.join(', ')}`
      : ''

  const allergySection =
    allergies.length > 0
      ? `\nAlergias/restricciones: ${allergies.join(', ')}`
      : ''

  // Cap max complexity based on proficiency tier
  const maxComplexity = Math.min(avgComplexity + 1.5, 5)

  return `Ingredientes disponibles en mi despensa:
${pantryList}
${dietSection}${allergySection}
Nivel de habilidad: ${proficiencyTier} (complejidad promedio: ${avgComplexity.toFixed(1)})

Sugiere recetas con complejidad máxima de ${maxComplexity.toFixed(0)}.

Responde con un JSON array con este esquema exacto:
[
  {
    "name": "string (nombre de la receta)",
    "description": "string (descripción breve, 1-2 oraciones)",
    "cuisine": "string (tipo de cocina: Chilena, Italiana, Mexicana, etc.)",
    "techniques": ["string (técnicas usadas: saltear, hervir, hornear, etc.)"],
    "complexity": number (1-5),
    "prepTime": number (minutos de preparación),
    "cookTime": number (minutos de cocción),
    "servings": number (porciones),
    "ingredients": [
      {
        "name": "string (nombre del ingrediente en español)",
        "quantity": number,
        "unit": "string (unidad: g, kg, ml, L, unidad, cucharada, etc.)"
      }
    ],
    "steps": [
      {
        "order": number (1-based),
        "instruction": "string (instrucción clara y concisa)",
        "duration": number (minutos, opcional)
      }
    ]
  }
]`
}
