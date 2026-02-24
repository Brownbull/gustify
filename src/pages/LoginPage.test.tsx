import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSignIn = vi.fn()
let mockState: Record<string, unknown> = {}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector(mockState),
}))

import LoginPage from './LoginPage'

beforeEach(() => {
  vi.clearAllMocks()
  mockState = { signIn: mockSignIn, error: null }
})

describe('LoginPage', () => {
  it('renders branding and sign-in button', () => {
    render(<LoginPage />)

    expect(screen.getByText('Gustify')).toBeInTheDocument()
    expect(screen.getByText('Tu compañero de cocina')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión con google/i })).toBeInTheDocument()
  })

  it('calls signIn when button is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /iniciar sesión con google/i }))

    expect(mockSignIn).toHaveBeenCalledOnce()
  })

  it('shows error message when error is present', () => {
    mockState = { signIn: mockSignIn, error: 'auth/popup-closed-by-user' }

    render(<LoginPage />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo iniciar sesión. Intenta de nuevo.')
  })

  it('does not show error message when there is no error', () => {
    mockState = { signIn: mockSignIn, error: null }

    render(<LoginPage />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
