interface UnknownItemDialogProps {
  onMarkUnknownIngredient: () => void
  onMarkUnknownPrepared: () => void
  onCancel: () => void
}

export default function UnknownItemDialog({
  onMarkUnknownIngredient,
  onMarkUnknownPrepared,
  onCancel,
}: UnknownItemDialogProps) {
  return (
    <div className="space-y-2">
      <p className="text-center text-sm font-medium text-primary-dark">
        ¿Qué tipo de item es?
      </p>
      <button
        type="button"
        onClick={onMarkUnknownIngredient}
        className="w-full rounded-md border border-primary/20 bg-surface-light px-3 py-2.5 text-sm font-medium text-primary-dark transition-colors hover:bg-surface"
      >
        ❓ Ingrediente desconocido
      </button>
      <button
        type="button"
        onClick={onMarkUnknownPrepared}
        className="w-full rounded-md border border-primary/20 bg-surface-light px-3 py-2.5 text-sm font-medium text-primary-dark transition-colors hover:bg-surface"
      >
        🍱 Comida preparada desconocida
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="w-full rounded-md px-3 py-2 text-sm text-primary-dark/60 transition-colors hover:text-primary-dark"
      >
        Cancelar
      </button>
    </div>
  )
}
