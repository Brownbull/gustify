import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useMappingStore } from '@/stores/mappingStore'
import IngredientPicker from '@/components/IngredientPicker'
import type { CanonicalIngredient } from '@/types/ingredient'

export default function MapItemsPage() {
  const user = useAuthStore((s) => s.user)
  const unmappedItems = useMappingStore((s) => s.unmappedItems)
  const mappedCount = useMappingStore((s) => s.mappedCount)
  const autoResolvedCount = useMappingStore((s) => s.autoResolvedCount)
  const loading = useMappingStore((s) => s.loading)
  const error = useMappingStore((s) => s.error)
  const selectedItem = useMappingStore((s) => s.selectedItem)
  const loadItems = useMappingStore((s) => s.loadItems)
  const mapItem = useMappingStore((s) => s.mapItem)
  const skipItem = useMappingStore((s) => s.skipItem)
  const setSelectedItem = useMappingStore((s) => s.setSelectedItem)
  const clearError = useMappingStore((s) => s.clearError)

  useEffect(() => {
    if (user) {
      loadItems(user.uid)
    }
  }, [user, loadItems])

  function handleSelect(ingredient: CanonicalIngredient) {
    if (!selectedItem || !user) return
    mapItem(selectedItem, ingredient.id, ingredient, user.uid)
  }

  function handleSkip() {
    if (!selectedItem) return
    skipItem(selectedItem)
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-primary-dark/60">
          Cargando transacciones...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => {
            clearError()
            if (user) loadItems(user.uid)
          }}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const hasItems = unmappedItems.length > 0

  return (
    <div className="flex flex-1 flex-col p-4">
      <h2 className="text-lg font-bold text-primary-dark">
        Mapear Ingredientes
      </h2>
      <p className="mt-1 text-sm text-primary-dark/60">
        Asigna tus compras a ingredientes del diccionario
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-yellow-50 p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">
            {unmappedItems.length}
          </p>
          <p className="text-xs text-yellow-600">Pendientes</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{mappedCount}</p>
          <p className="text-xs text-green-600">Mapeados</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">
            {autoResolvedCount}
          </p>
          <p className="text-xs text-blue-600">{`Autom\u00e1ticos`}</p>
        </div>
      </div>

      {!hasItems && (
        <div className="mt-8 flex flex-1 items-center justify-center">
          <p className="text-sm text-primary-dark/50">
            No hay items nuevos para mapear
          </p>
        </div>
      )}

      {hasItems && (
        <ul className="mt-4 space-y-2">
          {unmappedItems.map((item) => (
            <li key={item.normalizedName}>
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedItem?.normalizedName === item.normalizedName
                    ? 'border-primary bg-primary/5'
                    : 'border-primary/10 bg-white hover:border-primary/30'
                }`}
              >
                <p className="font-medium text-primary-dark">
                  {item.originalName}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-primary-dark/50">
                  <span>{item.category}</span>
                  <span>·</span>
                  <span>{item.merchant}</span>
                  <span>·</span>
                  <span>{item.date}</span>
                </div>
              </button>

              {selectedItem?.normalizedName === item.normalizedName && (
                <div className="mt-2">
                  <IngredientPicker
                    itemName={item.originalName}
                    onSelect={handleSelect}
                    onSkip={handleSkip}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
