import type { PreparedFoodCuisine } from './pantry'

export interface CanonicalPreparedFood {
  id: string
  names: { es: string; en: string }
  cuisine: PreparedFoodCuisine
  icon: string
  shelfLifeDays: number
}
