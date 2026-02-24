export type IngredientCategory =
  | 'Protein'
  | 'Vegetable'
  | 'Fruit'
  | 'Grain'
  | 'Dairy'
  | 'Spice'
  | 'Herb'
  | 'Condiment'
  | 'Other'

export interface CanonicalIngredient {
  id: string
  names: { es: string; en: string }
  category: IngredientCategory
  defaultUnit: string
  shelfLifeDays: number
  substitutions: string[]
}
