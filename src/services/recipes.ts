import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  limit,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { StoredRecipeDocSchema } from '@/types/recipe'
import type { StoredRecipe } from '@/types/recipe'

function recipesPath(): string {
  return 'recipes'
}

function docToRecipe(d: QueryDocumentSnapshot<DocumentData>): StoredRecipe | null {
  const result = StoredRecipeDocSchema.safeParse(d.data())
  if (!result.success) {
    console.error('[recipes] Invalid recipe doc', d.id, result.error.issues)
    return null
  }
  return { ...result.data, id: d.id }
}

export async function getAllRecipes(): Promise<StoredRecipe[]> {
  const snapshot = await getDocs(collection(db, recipesPath()))
  return snapshot.docs.map(docToRecipe).filter((r): r is StoredRecipe => r !== null)
}

export async function getRecipeById(
  recipeId: string,
): Promise<StoredRecipe | null> {
  if (!recipeId) return null

  const snapshot = await getDoc(doc(db, recipesPath(), recipeId))

  if (!snapshot.exists()) return null

  const result = StoredRecipeDocSchema.safeParse(snapshot.data())
  if (!result.success) {
    console.error('[recipes] Invalid recipe doc', snapshot.id, result.error.issues)
    return null
  }
  return { ...result.data, id: snapshot.id }
}

const RECIPE_LIMIT = 200

/**
 * Subscribes to real-time updates of the recipes collection.
 * Returns an unsubscribe function.
 */
export function subscribeToRecipes(
  callback: (recipes: StoredRecipe[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(collection(db, recipesPath()), limit(RECIPE_LIMIT))
  return onSnapshot(
    q,
    (snapshot) => {
      const recipes = snapshot.docs.map(docToRecipe).filter((r): r is StoredRecipe => r !== null)
      callback(recipes)
    },
    (error) => {
      if (onError) onError(error)
    },
  )
}
