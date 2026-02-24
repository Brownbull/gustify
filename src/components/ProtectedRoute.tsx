import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import LoginPage from '@/pages/LoginPage'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}
