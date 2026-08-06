import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)

const KEY = 'barha-theme'
const THEMES = ['dusk', 'aube']

function readInitial() {
  if (typeof document === 'undefined') return 'dusk'
  const attr = document.documentElement.getAttribute('data-theme')
  if (THEMES.includes(attr)) return attr
  try {
    const saved = localStorage.getItem(KEY)
    if (THEMES.includes(saved)) return saved
  } catch {}
  return 'dusk'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitial)

  const apply = (t) => {
    document.documentElement.setAttribute('data-theme', t)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', t === 'aube' ? '#F4EEE2' : '#0E0C0B')
    try {
      localStorage.setItem(KEY, t)
    } catch {}
  }

  useEffect(() => {
    apply(theme)
  }, [theme])

  const setTheme = (t) => setThemeState(THEMES.includes(t) ? t : 'dusk')
  const toggle = () => setThemeState((t) => (t === 'dusk' ? 'aube' : 'dusk'))

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
}
