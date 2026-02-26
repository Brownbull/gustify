import type { IngredientCategory } from '@/types/ingredient'

export const CATEGORY_ORDER: IngredientCategory[] = [
  'Protein', 'Vegetable', 'Fruit', 'Grain', 'Dairy', 'Spice', 'Herb', 'Condiment', 'Other',
]

export const CATEGORY_META: Record<IngredientCategory, { label: string; icon: string }> = {
  Protein: { label: 'Proteínas', icon: '🥩' },
  Vegetable: { label: 'Verduras', icon: '🥬' },
  Fruit: { label: 'Frutas', icon: '🍎' },
  Grain: { label: 'Cereales', icon: '🌾' },
  Dairy: { label: 'Lácteos', icon: '🥛' },
  Spice: { label: 'Especias', icon: '🌶️' },
  Herb: { label: 'Hierbas', icon: '🌿' },
  Condiment: { label: 'Condimentos', icon: '🫒' },
  Other: { label: 'Otros', icon: '📦' },
}

export const CATEGORY_COLORS: Record<string, string> = {
  Protein: 'bg-red-100 text-red-700',
  Vegetable: 'bg-green-100 text-green-700',
  Fruit: 'bg-yellow-100 text-yellow-700',
  Grain: 'bg-amber-100 text-amber-700',
  Dairy: 'bg-blue-100 text-blue-700',
  Spice: 'bg-orange-100 text-orange-700',
  Herb: 'bg-emerald-100 text-emerald-700',
  Condiment: 'bg-purple-100 text-purple-700',
  Other: 'bg-gray-100 text-gray-700',
}
