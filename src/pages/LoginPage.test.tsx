import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSignIn = vi.fn()
let mockError: string | null = null

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    signIn: mockSignIn,
    error: mockError,
  }),
}))

import LoginPage from './LoginPage'

beforeEach(() => {
  vi.clearAllMocks()
  mockError = null
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
    mockError = 'auth/popup-closed-by-user'

    render(<LoginPage />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('does not show error message when there is no error', () => {
    mockError = null

    render(<LoginPage />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
