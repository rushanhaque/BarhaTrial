import { useTheme } from '../lib/theme.jsx'
import { Moon, Sun } from './Icons.jsx'

export default function ThemeToggle({ className = '' }) {
  const ctx = useTheme()
  if (!ctx) return null
  const { theme, toggle } = ctx
  return (
    <button
      className={`theme-toggle ${className}`}
      data-active={theme}
      onClick={toggle}
      data-cursor
      aria-label={theme === 'dusk' ? 'Switch to day (Aube)' : 'Switch to dusk (Crépuscule)'}
      title={theme === 'dusk' ? 'Aube — day' : 'Crépuscule — dusk'}
    >
      <span className="theme-toggle__knob" aria-hidden="true" />
      <span className="theme-toggle__ico theme-toggle__ico--dusk" aria-hidden="true">
        <Moon />
      </span>
      <span className="theme-toggle__ico theme-toggle__ico--aube" aria-hidden="true">
        <Sun />
      </span>
    </button>
  )
}
