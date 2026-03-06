import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import BottomNav from '@/components/BottomNav'
import { useAuthStore } from '@/stores/authStore'
import { usePantryStore } from '@/stores/pantryStore'
import MapItemsPage from '@/pages/MapItemsPage'
import PantryPage from '@/pages/PantryPage'
import RecipesPage from '@/pages/RecipesPage'
import RecipeDetailPage from '@/pages/RecipeDetailPage'

function UserHeader() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  if (!user) return null

  return (
    <header className="flex items-center justify-between border-b border-primary/10 bg-surface-light px-4 py-3">
      <h1 className="text-lg font-bold text-primary">Gustify</h1>
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="h-8 w-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
            {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
          </div>
        )}
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-primary-dark/60 hover:text-primary-dark"
        >
          Salir
        </button>
      </div>
    </header>
  )
}

function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const subscribePantry = usePantryStore((s) => s.subscribe)
  const unsubscribePantry = usePantryStore((s) => s.unsubscribe)

  useEffect(() => {
    if (user) subscribePantry(user.uid)
    return () => unsubscribePantry()
  }, [user, subscribePantry, unsubscribePantry])

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <UserHeader />
      <main className="flex flex-1 flex-col pb-16">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-1 flex-col items-center justify-center p-4">
                <p className="text-lg text-primary-dark">Tu compañero de cocina</p>
              </div>
            }
          />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/map-items" element={<MapItemsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    </BrowserRouter>
  )
}

export default App
