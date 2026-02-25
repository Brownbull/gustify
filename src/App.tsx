import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'
import MapItemsPage from '@/pages/MapItemsPage'
import PantryPage from '@/pages/PantryPage'

type AppView = 'home' | 'pantry' | 'mapItems'

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

function App() {
  const [view, setView] = useState<AppView>('home')

  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-surface flex flex-col">
        <UserHeader />
        <main className="flex flex-1 flex-col pb-16">
          {view === 'home' ? (
            <div className="flex flex-1 flex-col items-center justify-center p-4">
              <p className="text-lg text-primary-dark">Tu compañero de cocina</p>
            </div>
          ) : view === 'pantry' ? (
            <PantryPage onNavigateToMap={() => setView('mapItems')} />
          ) : (
            <MapItemsPage />
          )}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 border-t border-primary/10 bg-surface-light">
          <div className="flex">
            <button
              type="button"
              onClick={() => setView('home')}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                view === 'home'
                  ? 'text-primary'
                  : 'text-primary-dark/40 hover:text-primary-dark/60'
              }`}
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => setView('pantry')}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                view === 'pantry'
                  ? 'text-primary'
                  : 'text-primary-dark/40 hover:text-primary-dark/60'
              }`}
            >
              Despensa
            </button>
            <button
              type="button"
              onClick={() => setView('mapItems')}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                view === 'mapItems'
                  ? 'text-primary'
                  : 'text-primary-dark/40 hover:text-primary-dark/60'
              }`}
            >
              Mapear
            </button>
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  )
}

export default App
