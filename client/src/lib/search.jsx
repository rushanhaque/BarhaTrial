import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { get } from './api.js'
import { useTransition } from './transition.jsx'
import { useScroll } from './SmoothScroll.jsx'
import { fallbackProducts } from '../data/fallback.js'
import { swatchGradient } from './format.js'
import { Search, ArrowUR, Drop } from '../components/Icons.jsx'

const SearchContext = createContext(null)
export const useSearch = () => useContext(SearchContext)

const PAGES = [
  { type: 'page', label: 'The Catalogue', to: '/catalogue', hint: 'All products' },
  { type: 'page', label: 'The Factory', to: '/about', hint: 'Our story' },
  { type: 'page', label: 'Custom Orders', to: '/custom-orders', hint: 'Bespoke manufacturing' },
  { type: 'page', label: 'Trade Fairs', to: '/trade-fairs', hint: 'Meet us' },
  { type: 'page', label: 'The Blog', to: '/blog', hint: 'Editorial' },
  { type: 'page', label: 'Contact & Showrooms', to: '/contact', hint: 'Visit us' },
]

export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [items, setItems] = useState(fallbackProducts)
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const loaded = useRef(false)
  const t = useTransition()
  const scroll = useScroll()

  const openSearch = () => setOpen(true)
  const closeSearch = () => setOpen(false)

  useEffect(() => {
    if (open) {
      scroll?.lenis?.stop?.()
      document.documentElement.classList.add('palette-open')
    } else {
      scroll?.lenis?.start?.()
      document.documentElement.classList.remove('palette-open')
    }
  }, [open, scroll])

  // global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open && !loaded.current) {
      loaded.current = true
      get('/api/products').then(setItems).catch(() => {})
    }
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const prods = items
      .filter((p) =>
        !needle
          ? true
          : [p.name, p.family, p.tagline, ...(p.character || [])].join(' ').toLowerCase().includes(needle)
      )
      .slice(0, needle ? 8 : 4)
      .map((p) => ({ type: 'product', label: p.name, hint: p.family, to: `/product/${p.slug}`, chromatic: p.chromatic }))
    const pages = PAGES.filter((p) => !needle || p.label.toLowerCase().includes(needle))
    return [...prods, ...pages]
  }, [q, items])

  useEffect(() => setActive(0), [q])

  const goTo = (to) => {
    setOpen(false)
    t?.go(to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); const r = results[active]; if (r) goTo(r.to) }
  }

  return (
    <SearchContext.Provider value={{ open, openSearch, closeSearch }}>
      {children}
      <div className={`palette ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="palette__veil" onClick={closeSearch} />
        <div className="palette__panel" role="dialog" aria-modal="true" aria-label="Search the catalogue">
          <div className="palette__inputwrap">
            <Search className="palette__search-icon" />
            <input
              ref={inputRef}
              className="palette__input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search products, materials, pages…"
              aria-label="Search"
            />
            <kbd className="palette__kbd">Esc</kbd>
          </div>
          <div className="palette__results">
            {results.length === 0 && <div className="palette__empty">No match in the catalogue.</div>}
            {results.map((r, i) => (
              <button
                key={r.to + i}
                className={`pres ${i === active ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => goTo(r.to)}
                data-cursor
              >
                <span className="pres__icon">
                  {r.type === 'product' ? (
                    <span className="pres__swatch" style={{ backgroundImage: swatchGradient(r.chromatic) }} />
                  ) : (
                    <Drop />
                  )}
                </span>
                <span className="pres__label">{r.label}</span>
                <span className="pres__hint muted">{r.hint}</span>
                <span className="pres__go"><ArrowUR /></span>
              </button>
            ))}
          </div>
          <div className="palette__foot muted">
            <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to open</span>
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  )
}
