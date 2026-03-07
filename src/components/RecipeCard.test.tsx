import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RecipeCard from './RecipeCard'
import type { RankedRecipe } from '@/stores/recipeStore'

// Mock matchColor utility
vi.mock('@/lib/matchColor', () => ({
  getMatchColorClass: (pct: number) => {
    if (pct >= 80) return 'bg-green-100 text-green-700'
    if (pct >= 50) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  },
}))

function makeRecipe(overrides: Partial<RankedRecipe> = {}): RankedRecipe {
  return {
    id: 'recipe-1',
    name: 'Empanadas de Pino',
    description: 'Clasicas empanadas chilenas rellenas de pino',
    cuisine: 'Chilena',
    techniques: ['hornear', 'freir'],
    complexity: 3,
    prepTime: 60,
    cookTime: 25,
    servings: 12,
    ingredients: [
      { name: 'Carne molida', quantity: 500, unit: 'g', canonicalId: 'ground_beef' },
      { name: 'Cebolla', quantity: 3, unit: 'unidad', canonicalId: 'onion' },
      { name: 'Huevo', quantity: 2, unit: 'unidad', canonicalId: 'egg' },
    ],
    steps: [
      { order: 1, instruction: 'Preparar el pino' },
      { order: 2, instruction: 'Armar las empanadas' },
    ],
    pantryMatchPct: 67,
    ...overrides,
  }
}

describe('RecipeCard', () => {
  it('renders recipe name', () => {
    render(<RecipeCard recipe={makeRecipe()} onSelect={vi.fn()} />)
    expect(screen.getByText('Empanadas de Pino')).toBeInTheDocument()
  })

  it('renders cuisine', () => {
    render(<RecipeCard recipe={makeRecipe()} onSelect={vi.fn()} />)
    expect(screen.getByText('Chilena')).toBeInTheDocument()
  })

  it('renders pantry match percentage', () => {
    render(<RecipeCard recipe={makeRecipe({ pantryMatchPct: 67 })} onSelect={vi.fn()} />)
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<RecipeCard recipe={makeRecipe()} onSelect={vi.fn()} />)
    expect(screen.getByText('Clasicas empanadas chilenas rellenas de pino')).toBeInTheDocument()
  })

  it('renders complexity label for level 3 (Intermedio)', () => {
    render(<RecipeCard recipe={makeRecipe({ complexity: 3 })} onSelect={vi.fn()} />)
    expect(screen.getByText('Intermedio')).toBeInTheDocument()
  })

  it('renders total time (prepTime + cookTime)', () => {
    render(<RecipeCard recipe={makeRecipe({ prepTime: 60, cookTime: 25 })} onSelect={vi.fn()} />)
    expect(screen.getByText('85 min')).toBeInTheDocument()
  })

  it('renders ingredient count', () => {
    render(<RecipeCard recipe={makeRecipe()} onSelect={vi.fn()} />)
    expect(screen.getByText('3 ing.')).toBeInTheDocument()
  })

  it('calls onSelect with recipe when clicked', () => {
    const onSelect = vi.fn()
    const recipe = makeRecipe()
    render(<RecipeCard recipe={recipe} onSelect={onSelect} />)

    fireEvent.click(screen.getByTestId('recipe-card'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(recipe)
  })

  it('renders all complexity labels correctly', () => {
    const labels = ['Muy facil', 'Facil', 'Intermedio', 'Avanzado', 'Experto']
    labels.forEach((label, idx) => {
      const { unmount } = render(
        <RecipeCard recipe={makeRecipe({ complexity: idx + 1 })} onSelect={vi.fn()} />,
      )
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    })
  })
})
