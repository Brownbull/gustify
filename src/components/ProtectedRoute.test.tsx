import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

let mockAuthState = { user: null as any, loading: true, error: null, signIn: vi.fn(), signOut: vi.fn() }

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthState,
}))

vi.mock('@/pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login</div>,
}))

import ProtectedRoute from './ProtectedRoute'

beforeEach(() => {
  mockAuthState = { user: null, loading: true, error: null, signIn: vi.fn(), signOut: vi.fn() }
})

describe('ProtectedRoute', () => {
  it('shows loading spinner when auth is loading', () => {
    mockAuthState.loading = true

    render(<ProtectedRoute><div>Content</div></ProtectedRoute>)

    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('shows login page when not authenticated', () => {
    mockAuthState.loading = false
    mockAuthState.user = null

    render(<ProtectedRoute><div>Content</div></ProtectedRoute>)

    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockAuthState.loading = false
    mockAuthState.user = { uid: '123', displayName: 'Test' }

    render(<ProtectedRoute><div>Content</div></ProtectedRoute>)

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })
})
