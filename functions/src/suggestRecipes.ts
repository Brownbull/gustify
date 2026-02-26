import { GoogleGenerativeAI } from '@google/generative-ai'
import * as functions from 'firebase-functions'
import {
  SYSTEM_INSTRUCTION,
  buildRecipePrompt,
  RecipePromptInput,
} from './prompts/recipe-suggestions'

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-user, sliding window)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const requestTimestamps = new Map<string, number[]>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const timestamps = requestTimestamps.get(userId) ?? []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) return true
  recent.push(now)
  requestTimestamps.set(userId, recent)
  return false
}

// ---------------------------------------------------------------------------
// Gemini client
// ---------------------------------------------------------------------------
function getGenAI(): GoogleGenerativeAI {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    functions.config().gemini?.api_key
  if (!apiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'GEMINI_API_KEY is not configured'
    )
  }
  return new GoogleGenerativeAI(apiKey)
}

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------
interface SuggestRecipesData {
  pantryItems: { canonicalId: string; name: string; quantity: number; unit: string }[]
  dietPrefs: string[]
  allergies: string[]
  proficiencyTier: string
  avgComplexity: number
}

function validateRequest(data: unknown): SuggestRecipesData {
  const d = data as Record<string, unknown>

  if (!Array.isArray(d.pantryItems) || d.pantryItems.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'pantryItems must be a non-empty array'
    )
  }

  return {
    pantryItems: d.pantryItems as SuggestRecipesData['pantryItems'],
    dietPrefs: Array.isArray(d.dietPrefs) ? (d.dietPrefs as string[]) : [],
    allergies: Array.isArray(d.allergies) ? (d.allergies as string[]) : [],
    proficiencyTier: typeof d.proficiencyTier === 'string' ? d.proficiencyTier : 'Principiante',
    avgComplexity: typeof d.avgComplexity === 'number' ? d.avgComplexity : 1.0,
  }
}

// ---------------------------------------------------------------------------
// Cloud Function
// ---------------------------------------------------------------------------
export const suggestRecipes = functions.https.onCall(
  async (data: unknown, context) => {
    // 1. Auth check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes iniciar sesión para obtener sugerencias de recetas.'
      )
    }

    // 2. Rate limit
    if (checkRateLimit(context.auth.uid)) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.'
      )
    }

    // 3. Validate input
    const request = validateRequest(data)

    // 4. Build prompt
    const promptInput: RecipePromptInput = {
      pantryItems: request.pantryItems.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        unit: p.unit,
      })),
      dietPrefs: request.dietPrefs,
      allergies: request.allergies,
      proficiencyTier: request.proficiencyTier,
      avgComplexity: request.avgComplexity,
    }
    const userPrompt = buildRecipePrompt(promptInput)

    // 5. Call Gemini
    try {
      const genAI = getGenAI()
      const model = genAI.getGenerativeModel(
        {
          model: 'gemini-2.5-flash',
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      )

      const result = await model.generateContent([{ text: userPrompt }])
      const text = result.response.text()

      // 6. Parse response (strip markdown fences if present)
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/^```\s*/i, '')
        .trim()

      const recipes = JSON.parse(cleaned)

      if (!Array.isArray(recipes)) {
        throw new Error('Gemini response is not an array')
      }

      return { recipes }
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error

      console.error('Gemini API error:', error)
      throw new functions.https.HttpsError(
        'internal',
        'No se pudieron generar las sugerencias. Inténtalo de nuevo.'
      )
    }
  }
)
