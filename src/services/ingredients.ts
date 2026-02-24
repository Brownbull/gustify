import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { CanonicalIngredient, IngredientCategory } from '@/types/ingredient'

const COLLECTION = 'canonicalIngredients'

export async function getCanonicalIngredients(): Promise<CanonicalIngredient[]> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as CanonicalIngredient)
}

export async function getCanonicalIngredient(
  id: string,
): Promise<CanonicalIngredient | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id))

  if (!snapshot.exists()) return null

  return { id: snapshot.id, ...snapshot.data() } as CanonicalIngredient
}

export async function getIngredientsByCategory(
  category: IngredientCategory,
): Promise<CanonicalIngredient[]> {
  const q = query(
    collection(db, COLLECTION),
    where('category', '==', category),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as CanonicalIngredient)
}
