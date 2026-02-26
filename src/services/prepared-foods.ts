import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { CanonicalPreparedFood } from '@/types/prepared-food'
import type { PreparedFoodCuisine } from '@/types/pantry'

const COLLECTION = 'canonicalPreparedFoods'

function docToPreparedFood(d: QueryDocumentSnapshot<DocumentData>): CanonicalPreparedFood {
  return { ...d.data(), id: d.id } as CanonicalPreparedFood
}

export async function getCanonicalPreparedFoods(): Promise<CanonicalPreparedFood[]> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map(docToPreparedFood)
}

export async function getCanonicalPreparedFood(id: string): Promise<CanonicalPreparedFood | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id))
  if (!snapshot.exists()) return null
  return { ...snapshot.data(), id: snapshot.id } as CanonicalPreparedFood
}

export async function getPreparedFoodsByCuisine(cuisine: PreparedFoodCuisine): Promise<CanonicalPreparedFood[]> {
  const q = query(collection(db, COLLECTION), where('cuisine', '==', cuisine))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(docToPreparedFood)
}
