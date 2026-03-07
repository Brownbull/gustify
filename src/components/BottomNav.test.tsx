import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import BottomNav from './BottomNav'

function renderNav(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <BottomNav />
    </MemoryRouter>,
  )
}

describe('BottomNav', () => {
  it('renders 4 navigation tabs', () => {
    renderNav()
    expect(screen.getByTestId('nav-inicio')).toBeInTheDocument()
    expect(screen.getByTestId('nav-despensa')).toBeInTheDocument()
    expect(screen.getByTestId('nav-recetas')).toBeInTheDocument()
    expect(screen.getByTestId('nav-mapear')).toBeInTheDocument()
  })

  it('has correct labels', () => {
    renderNav()
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Despensa')).toBeInTheDocument()
    expect(screen.getByText('Recetas')).toBeInTheDocument()
    expect(screen.getByText('Mapear')).toBeInTheDocument()
  })

  it('marks Inicio as active on / route', () => {
    renderNav('/')
    const inicio = screen.getByTestId('nav-inicio')
    const recetas = screen.getByTestId('nav-recetas')
    expect(inicio.className).toContain('text-primary')
    expect(recetas.className).toContain('text-primary-dark/40')
  })

  it('marks Recetas as active on /recipes route', () => {
    renderNav('/recipes')
    const recetasLink = screen.getByTestId('nav-recetas')
    expect(recetasLink.className).toContain('text-primary')
  })

  it('marks Despensa as active on /pantry route', () => {
    renderNav('/pantry')
    const despensaLink = screen.getByTestId('nav-despensa')
    expect(despensaLink.className).toContain('text-primary')
  })

  it('has bottom-nav data-testid on the nav element', () => {
    renderNav()
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument()
  })

  it('links point to correct routes', () => {
    renderNav()
    expect(screen.getByTestId('nav-inicio')).toHaveAttribute('href', '/')
    expect(screen.getByTestId('nav-despensa')).toHaveAttribute('href', '/pantry')
    expect(screen.getByTestId('nav-recetas')).toHaveAttribute('href', '/recipes')
    expect(screen.getByTestId('nav-mapear')).toHaveAttribute('href', '/map-items')
  })
})
