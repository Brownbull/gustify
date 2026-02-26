import { useMemo, useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usePantryStore } from '@/stores/pantryStore'
import { CATEGORY_META, CATEGORY_COLORS, CATEGORY_ORDER } from '@/lib/categories'
import { CUISINE_META, CUISINE_COLORS, CUISINE_ORDER } from '@/lib/cuisines'
import { formatRelativeExpiry } from '@/lib/expiry'
import { updatePantryItemCuisine } from '@/services/pantry'
import type { IngredientCategory } from '@/types/ingredient'
import type { ExpiryStatus, EnrichedPantryItem, PreparedFoodCuisine } from '@/types/pantry'

const EXPIRY_BADGE: Record<ExpiryStatus, { label: string; className: string }> = {
  fresh: { label: 'Fresco', className: 'bg-green-100 text-green-700' },
  'expiring-soon': { label: 'Por vencer', className: 'bg-amber-100 text-amber-700' },
  expired: { label: 'Vencido', className: 'bg-red-100 text-red-700' },
}

const EXPIRY_OPTIONS: { value: ExpiryStatus | 'all'; label: string; dot?: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'fresh', label: 'Fresco', dot: 'bg-green-500' },
  { value: 'expiring-soon', label: 'Por vencer', dot: 'bg-amber-500' },
  { value: 'expired', label: 'Vencido', dot: 'bg-red-500' },
]

interface PantryPageProps {
  onNavigateToMap: () => void
}

export default function PantryPage({ onNavigateToMap }: PantryPageProps) {
  const user = useAuthStore((s) => s.user)
  const items = usePantryStore((s) => s.items)
  const loading = usePantryStore((s) => s.loading)
  const error = usePantryStore((s) => s.error)
  const activeFilter = usePantryStore((s) => s.activeFilter)
  const expiryFilter = usePantryStore((s) => s.expiryFilter)
  const activeTab = usePantryStore((s) => s.activeTab)
  const cuisineFilter = usePantryStore((s) => s.cuisineFilter)
  const subscribe = usePantryStore((s) => s.subscribe)
  const setFilter = usePantryStore((s) => s.setFilter)
  const setExpiryFilter = usePantryStore((s) => s.setExpiryFilter)
  const setActiveTab = usePantryStore((s) => s.setActiveTab)
  const setCuisineFilter = usePantryStore((s) => s.setCuisineFilter)

  // Split items by type
  const ingredients = useMemo(() => items.filter((i) => i.type !== 'prepared'), [items])
  const preparedItems = useMemo(() => items.filter((i) => i.type === 'prepared'), [items])

  // Filter ingredients by category + expiry
  const filteredIngredients = useMemo(() => {
    let result = ingredients
    if (activeFilter !== 'all') result = result.filter((i) => i.category === activeFilter)
    if (expiryFilter !== 'all') result = result.filter((i) => i.expiryStatus === expiryFilter)
    return result
  }, [ingredients, activeFilter, expiryFilter])

  // Filter prepared items by cuisine + expiry
  const filteredPrepared = useMemo(() => {
    let result = preparedItems
    if (cuisineFilter !== 'all') {
      result = result.filter((i) => (i.cuisine ?? 'unclassified') === cuisineFilter)
    }
    if (expiryFilter !== 'all') result = result.filter((i) => i.expiryStatus === expiryFilter)
    return result
  }, [preparedItems, cuisineFilter, expiryFilter])

  // Available categories (only those with items)
  const availableCategories = useMemo(() => {
    const cats = new Set(ingredients.map((i) => i.category))
    return CATEGORY_ORDER.filter((cat) => cats.has(cat))
  }, [ingredients])

  const categoryCounts = useMemo(() => {
    const counts = new Map<IngredientCategory, number>()
    for (const item of ingredients) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    }
    return counts
  }, [ingredients])

  // Available cuisines (only those with items, treating undefined as 'unclassified')
  const availableCuisines = useMemo(() => {
    const cuisines = new Set(preparedItems.map((i) => i.cuisine ?? 'unclassified'))
    return CUISINE_ORDER.filter((c) => cuisines.has(c))
  }, [preparedItems])

  const cuisineCounts = useMemo(() => {
    const counts = new Map<PreparedFoodCuisine, number>()
    for (const item of preparedItems) {
      const c = item.cuisine ?? 'unclassified'
      counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    return counts
  }, [preparedItems])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-primary-dark/60">Cargando despensa...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <p className="text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => user && subscribe(user.uid)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">🥫</span>
        <h2 className="text-lg font-semibold text-primary-dark">Tu despensa está vacía</h2>
        <p className="max-w-xs text-sm text-primary-dark/60">
          Mapea tus compras de Gastify para llenar tu despensa con ingredientes.
        </p>
        <button
          type="button"
          onClick={onNavigateToMap}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Ir a Mapear
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-primary-dark">Despensa</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {items.length}
          </span>
        </div>
        <ExpiryDropdown value={expiryFilter} onChange={setExpiryFilter} />
      </div>

      {/* Segmented control */}
      <div className="px-4 pb-3">
        <div className="flex rounded-lg border border-primary/20 bg-surface-light p-0.5" data-testid="pantry-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'ingredients'
                ? 'bg-primary text-white shadow-sm'
                : 'text-primary-dark/60 hover:text-primary-dark'
            }`}
          >
            🥬 Ingredientes ({ingredients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prepared')}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'prepared'
                ? 'bg-primary text-white shadow-sm'
                : 'text-primary-dark/60 hover:text-primary-dark'
            }`}
          >
            🍱 Preparadas ({preparedItems.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'ingredients' ? (
          <>
            {/* Category filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-primary-dark/60 hover:bg-primary/10'
                }`}
              >
                Todos ({ingredients.length})
              </button>
              {availableCategories.map((cat) => {
                const meta = CATEGORY_META[cat]
                const count = categoryCounts.get(cat) ?? 0
                const isActive = activeFilter === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilter(isActive ? 'all' : cat)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : `${CATEGORY_COLORS[cat] ?? ''} hover:opacity-80`
                    }`}
                  >
                    {meta.icon} {meta.label} ({count})
                  </button>
                )
              })}
            </div>

            {/* Ingredient item cards */}
            <div className="space-y-2">
              {filteredIngredients.map((item) => (
                <PantryItemCard key={item.id} item={item} />
              ))}
              {filteredIngredients.length === 0 && (
                <p className="py-4 text-center text-sm text-primary-dark/50">
                  Sin ingredientes con estos filtros
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Cuisine filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              <button
                type="button"
                onClick={() => setCuisineFilter('all')}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  cuisineFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-primary-dark/60 hover:bg-primary/10'
                }`}
              >
                Todos ({preparedItems.length})
              </button>
              {availableCuisines.map((cuisine) => {
                const meta = CUISINE_META[cuisine]
                const count = cuisineCounts.get(cuisine) ?? 0
                const isActive = cuisineFilter === cuisine
                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => setCuisineFilter(isActive ? 'all' : cuisine)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : `${CUISINE_COLORS[cuisine] ?? ''} hover:opacity-80`
                    }`}
                  >
                    {meta.icon} {meta.label} ({count})
                  </button>
                )
              })}
            </div>

            {/* Prepared food cards */}
            <div className="space-y-2">
              {filteredPrepared.map((item) => (
                <PreparedItemCard key={item.id} item={item} />
              ))}
              {filteredPrepared.length === 0 && (
                <p className="py-4 text-center text-sm text-primary-dark/50">
                  Sin comidas con estos filtros
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PantryItemCard({ item }: { item: EnrichedPantryItem }) {
  const badge = EXPIRY_BADGE[item.expiryStatus]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-surface-light p-3">
      <span className="text-2xl leading-none">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-primary-dark">{item.name}</p>
        <p className="text-xs text-primary-dark/50">
          {item.quantity} {item.unit} · {formatRelativeExpiry(item.estimatedExpiry)}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    </div>
  )
}

function PreparedItemCard({ item }: { item: EnrichedPantryItem }) {
  const badge = EXPIRY_BADGE[item.expiryStatus]
  const user = useAuthStore((s) => s.user)
  const [showCuisinePicker, setShowCuisinePicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const cuisine = item.cuisine ?? 'unclassified'
  const cuisineMeta = CUISINE_META[cuisine]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCuisinePicker(false)
      }
    }
    if (showCuisinePicker) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCuisinePicker])

  async function handleCuisineSelect(selected: PreparedFoodCuisine) {
    if (!user) return
    setShowCuisinePicker(false)
    await updatePantryItemCuisine(user.uid, item.id, selected)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-surface-light p-3">
      <span className="text-2xl leading-none">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-primary-dark">{item.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-primary-dark/50">
            {item.quantity} {item.unit} · {formatRelativeExpiry(item.estimatedExpiry)}
          </p>
        </div>
        {/* Cuisine tag — tap to change */}
        <div ref={pickerRef} className="relative mt-1">
          <button
            type="button"
            data-testid="cuisine-tag"
            onClick={() => setShowCuisinePicker(!showCuisinePicker)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${CUISINE_COLORS[cuisine]}`}
          >
            {cuisineMeta.icon} {cuisineMeta.label}
            <span className="text-[8px]">▾</span>
          </button>
          {showCuisinePicker && (
            <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-primary/10 bg-surface-light py-1 shadow-lg">
              {CUISINE_ORDER.map((c) => {
                const meta = CUISINE_META[c]
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCuisineSelect(c)}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-primary/5 ${
                      cuisine === c ? 'font-semibold text-primary' : 'text-primary-dark/70'
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    </div>
  )
}

function ExpiryDropdown({
  value,
  onChange,
}: {
  value: ExpiryStatus | 'all'
  onChange: (v: ExpiryStatus | 'all') => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const current = EXPIRY_OPTIONS.find((o) => o.value === value) ?? EXPIRY_OPTIONS[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-testid="expiry-dropdown-trigger"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary-dark/70 transition-colors hover:border-primary/40"
      >
        {current.dot && <span className={`inline-block h-2 w-2 rounded-full ${current.dot}`} />}
        {current.label}
        <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-primary/10 bg-surface-light py-1 shadow-lg">
          {EXPIRY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-primary/5 ${
                value === opt.value ? 'font-semibold text-primary' : 'text-primary-dark/70'
              }`}
            >
              {opt.dot ? (
                <span className={`inline-block h-2 w-2 rounded-full ${opt.dot}`} />
              ) : (
                <span className="inline-block h-2 w-2" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
