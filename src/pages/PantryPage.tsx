import { useEffect, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usePantryStore } from '@/stores/pantryStore'
import { CATEGORY_META, CATEGORY_COLORS, CATEGORY_ORDER } from '@/lib/categories'
import { formatRelativeExpiry } from '@/lib/expiry'
import type { IngredientCategory } from '@/types/ingredient'
import type { ExpiryStatus, EnrichedPantryItem } from '@/types/pantry'

const EXPIRY_BADGE: Record<ExpiryStatus, { label: string; className: string }> = {
  fresh: { label: 'Fresco', className: 'bg-green-100 text-green-700' },
  'expiring-soon': { label: 'Por vencer', className: 'bg-amber-100 text-amber-700' },
  expired: { label: 'Vencido', className: 'bg-red-100 text-red-700' },
}

interface PantryPageProps {
  onNavigateToMap: () => void
}

export default function PantryPage({ onNavigateToMap }: PantryPageProps) {
  const user = useAuthStore((s) => s.user)
  const items = usePantryStore((s) => s.items)
  const loading = usePantryStore((s) => s.loading)
  const error = usePantryStore((s) => s.error)
  const activeFilter = usePantryStore((s) => s.activeFilter)
  const subscribe = usePantryStore((s) => s.subscribe)
  const unsubscribe = usePantryStore((s) => s.unsubscribe)
  const setFilter = usePantryStore((s) => s.setFilter)

  useEffect(() => {
    if (user) subscribe(user.uid)
    return () => unsubscribe()
  }, [user, subscribe, unsubscribe])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items
    return items.filter((item) => item.category === activeFilter)
  }, [items, activeFilter])

  const availableCategories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category))
    return CATEGORY_ORDER.filter((cat) => cats.has(cat))
  }, [items])

  const categoryCounts = useMemo(() => {
    const counts = new Map<IngredientCategory, number>()
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    }
    return counts
  }, [items])

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
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-primary-dark">Despensa</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {items.length}
          </span>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface-light text-primary-dark/60 hover:bg-primary/10'
          }`}
        >
          Todos ({items.length})
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

      {/* Item list */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {filteredItems.map((item) => (
          <PantryItemCard key={item.id} item={item} />
        ))}
        {filteredItems.length === 0 && (
          <p className="py-6 text-center text-sm text-primary-dark/50">
            Sin ingredientes en esta categoría
          </p>
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
