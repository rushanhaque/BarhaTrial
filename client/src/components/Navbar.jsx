import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { useWardrobe } from '../lib/wardrobe.jsx'
import { useSearch } from '../lib/search.jsx'
import TLink from './TLink.jsx'
import { Magnetic } from './MagneticButton.jsx'
import { ArrowUR, Search, Bag } from './Icons.jsx'

const LINKS = [
  { i: '01', label: 'The Collections', to: '/collections' },
  { i: '02', label: 'About Us', to: '/about' },
  { i: '03', label: 'Contact Us', to: '/contact' },
]

export default function Navbar() {
  const scroll = useScroll()
  const location = useLocation()
  const wardrobe = useWardrobe()
  const search = useSearch()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!scroll?.subscribe) return
    return scroll.subscribe(({ scroll: y }) => {
      setScrolled(y > 40)
      if (open) return setHidden(false)

      const heritageEl = document.querySelector('.heritage-section')
      const collectionsEl = document.querySelector('.czoom-section, .czoom-flat-section')

      let inHeritage = false
      let inCollections = false

      if (heritageEl) {
        const rect = heritageEl.getBoundingClientRect()
        inHeritage = rect.top <= 100 && rect.bottom >= 80
      }

      if (collectionsEl) {
        const rect = collectionsEl.getBoundingClientRect()
        inCollections = rect.top <= 100 && rect.bottom >= 80
      }

      setHidden(inHeritage || inCollections)
    })
  }, [scroll, open, location.pathname])

  useEffect(() => {
    if (open) {
      scroll?.lenis?.stop?.()
      document.documentElement.classList.add('menu-open')
    } else {
      scroll?.lenis?.start?.()
      document.documentElement.classList.remove('menu-open')
    }
  }, [open, scroll])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${hidden ? 'is-hidden' : ''}`}>
        <div className="nav__island">
          <Magnetic strength={0.2}>
            <TLink to="/" className="nav__brand" data-cursor-label="Home">
              <span className="nav__brand-mark">B</span>
              <span className="nav__brand-word">BARHA</span>
            </TLink>
          </Magnetic>

          <nav className="nav__inline">
            {LINKS.slice(0, 4).map((l) => (
              <TLink
                key={l.to}
                to={l.to}
                className={`nav__link ulink ${location.pathname === l.to ? 'is-active' : ''}`}
              >
                {l.label}
              </TLink>
            ))}
          </nav>

          <div className="nav__right">
            <button className="nav__icon" onClick={() => search?.openSearch()} aria-label="Search" data-cursor data-cursor-label="Search">
              <Search />
            </button>
            <button
              className="nav__icon nav__bag"
              onClick={() => wardrobe?.openDrawer('wardrobe')}
              aria-label={`Your quote list${wardrobe?.cartCount ? `, ${wardrobe.cartCount} items` : ''}`}
              data-cursor
              data-cursor-label="Quote List"
            >
              <Bag />
              {wardrobe?.cartCount > 0 && <span className="nav__badge">{wardrobe.cartCount}</span>}
            </button>
            <button
              className={`nav__burger ${open ? 'is-open' : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              data-cursor
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="menu__veil" onClick={() => setOpen(false)} />
        <div className="menu__panel">
          <div className="menu__nav">
            <span className="menu__caption eyebrow">Navigate the Heritage</span>
            <ul className="menu__list">
              {LINKS.map((l, idx) => (
                <li key={l.to} className="menu__item" style={{ '--i': idx }}>
                  <TLink to={l.to} className="menu__link" onNavigate={() => setOpen(false)}>
                    <span className="menu__index">{l.i}</span>
                    <span className="menu__word serif">{l.label}</span>
                    <span className="menu__arrow"><ArrowUR /></span>
                  </TLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="menu__aside">
            <div className="menu__aside-block" style={{ '--i': 0 }}>
              <span className="eyebrow">Global Offices</span>
              <p className="menu__cities">Moradabad · New Delhi · Frankfurt · New York</p>
            </div>
            <div className="menu__aside-block" style={{ '--i': 1 }}>
              <span className="eyebrow">Correspondence</span>
              <a className="menu__mail ulink" href="mailto:exports@barirahandicrafts.example">exports@barirahandicrafts.example</a>
              <p className="muted menu__hours">Mon–Sat, 09h–18h (IST)</p>
            </div>
            <div className="menu__aside-block" style={{ '--i': 2 }}>
              <span className="eyebrow">Follow</span>
              <div className="menu__social">
                <a className="ulink" href="#">LinkedIn</a>
                <a className="ulink" href="#">Instagram</a>
                <a className="ulink" href="#">Pinterest</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
