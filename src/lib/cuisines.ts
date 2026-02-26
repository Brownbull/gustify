import type { PreparedFoodCuisine } from '@/types/pantry'

export const CUISINE_ORDER: PreparedFoodCuisine[] = [
  'mediterranean', 'chinese', 'indian', 'peruvian', 'chilean', 'other', 'unclassified',
]

export const CUISINE_META: Record<PreparedFoodCuisine, { label: string; icon: string }> = {
  mediterranean: { label: 'Mediterránea', icon: '🫒' },
  chinese: { label: 'China', icon: '🥡' },
  indian: { label: 'India', icon: '🍛' },
  peruvian: { label: 'Peruana', icon: '🇵🇪' },
  chilean: { label: 'Chilena', icon: '🇨🇱' },
  other: { label: 'Otra', icon: '🍽️' },
  unclassified: { label: 'Sin clasificar', icon: '❓' },
}

export const CUISINE_COLORS: Record<PreparedFoodCuisine, string> = {
  mediterranean: 'bg-emerald-100 text-emerald-700',
  chinese: 'bg-red-100 text-red-700',
  indian: 'bg-orange-100 text-orange-700',
  peruvian: 'bg-yellow-100 text-yellow-700',
  chilean: 'bg-blue-100 text-blue-700',
  other: 'bg-purple-100 text-purple-700',
  unclassified: 'bg-gray-100 text-gray-700',
}
