import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../config/firebase'
import type { SuggestRecipesRequest, SuggestRecipesResponse } from '../types/recipe'

const functions = getFunctions(app)

/**
 * Calls the suggestRecipes Cloud Function.
 * Gemini API call happens server-side for security.
 */
export async function suggestRecipes(
  request: SuggestRecipesRequest
): Promise<SuggestRecipesResponse> {
  try {
    const fn = httpsCallable<SuggestRecipesRequest, SuggestRecipesResponse>(
      functions,
      'suggestRecipes'
    )
    const result = await fn(request)
    return result.data
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const functionsError = error as { code: string; message?: string }

      if (functionsError.code === 'functions/unauthenticated') {
        throw new Error('Debes iniciar sesión para obtener sugerencias.')
      }
      if (functionsError.code === 'functions/invalid-argument') {
        throw new Error('Datos inválidos. Inténtalo de nuevo.')
      }
      if (functionsError.code === 'functions/resource-exhausted') {
        throw new Error('Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.')
      }
      if (functionsError.message) {
        throw new Error(functionsError.message)
      }
    }
    throw new Error('No se pudieron generar las sugerencias. Inténtalo de nuevo.')
  }
}
