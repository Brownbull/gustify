import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

let mockState: Record<string, unknown> = { user: null, loading: true }

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector(mockState),
}))

vi.mock('@/pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login</div>,
}))

import ProtectedRoute from './ProtectedRoute'

beforeEach(() => {
  mockState = { user: null, loading: true }
})

describe('ProtectedRoute', () => {
  it('shows loading spinner when auth is loading', () => {
    mockState = { user: null, loading: true }

    render(<ProtectedRoute><div>Content</div></ProtectedRoute>)

    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('shows login page when not authenticated', () => {
    mockState = { user: null, loading: false }

    render(<ProtectedRoute><div>Content</div></ProtectedRoute>)

    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockState = { user: { uid: '123', displayName: 'Test' }, loading: false }

    render(<ProtectedRoute><div>Content</div></ProtectedRoute>)

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })
})
