import {
  collection,
  doc,
  getDoc,
  getDocs,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { StoredRecipe } from '@/types/recipe'

function recipesPath(): string {
  return 'recipes'
}

function docToRecipe(d: QueryDocumentSnapshot<DocumentData>): StoredRecipe {
  return { ...d.data(), id: d.id } as StoredRecipe
}

export async function getAllRecipes(): Promise<StoredRecipe[]> {
  const snapshot = await getDocs(collection(db, recipesPath()))
  return snapshot.docs.map(docToRecipe)
}

export async function getRecipeById(
  recipeId: string,
): Promise<StoredRecipe | null> {
  const snapshot = await getDoc(doc(db, recipesPath(), recipeId))

  if (!snapshot.exists()) return null

  return { ...snapshot.data(), id: snapshot.id } as StoredRecipe
}
