import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'

function UserHeader() {
  const { user, signOut } = useAuthStore()
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
  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-surface flex flex-col">
        <UserHeader />
        <main className="flex flex-1 flex-col items-center justify-center p-4">
          <p className="text-lg text-primary-dark">Tu companero de cocina</p>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default App
