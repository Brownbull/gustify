import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Inicio', testId: 'nav-inicio' },
  { to: '/pantry', label: 'Despensa', testId: 'nav-despensa' },
  { to: '/recipes', label: 'Recetas', testId: 'nav-recetas' },
  { to: '/map-items', label: 'Mapear', testId: 'nav-mapear' },
] as const

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-primary/10 bg-surface-light"
      data-testid="bottom-nav"
    >
      <div className="flex">
        {TABS.map(({ to, label, testId }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            data-testid={testId}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-primary-dark/40 hover:text-primary-dark/60'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
