import { useEffect, useMemo, useState } from 'react'
import { get } from '../lib/api.js'
import { fallbackProducts } from '../data/fallback.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Marquee from '../components/Marquee.jsx'
import { Grid, Rows } from '../components/Icons.jsx'

const FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'vase', label: 'Vases & Planters', match: (p) => /vase|planter/i.test(p.family) },
  { key: 'decor', label: 'Decor', match: (p) => /decor/i.test(p.family) },
  { key: 'furniture', label: 'Furniture', match: (p) => /furniture/i.test(p.family) },
  { key: 'tableware', label: 'Tableware', match: (p) => /tableware/i.test(p.family) },
  { key: 'lighting', label: 'Lighting', match: (p) => /lighting/i.test(p.family) },
]

const SORTS = {
  featured: { label: 'Featured', fn: null },
  newest: { label: 'Newest', fn: (a, b) => (b.year || 0) - (a.year || 0) },
  'price-asc': { label: 'Price (Est.) · low to high', fn: (a, b) => a.priceUSD - b.priceUSD },
  'price-desc': { label: 'Price (Est.) · high to low', fn: (a, b) => b.priceUSD - a.priceUSD },
  moq: { label: 'Highest MOQ', fn: (a, b) => (b.moq || 0) - (a.moq || 0) },
}

export default function Catalogue() {
  const [items, setItems] = useState(fallbackProducts)
  const [active, setActive] = useState('all')
  const [sort, setSort] = useState('featured')
  const [view, setView] = useState('grid')

  useEffect(() => {
    get('/api/products').then(setItems).catch(() => {})
  }, [])

  const filter = FILTERS.find((f) => f.key === active) || FILTERS[0]
  const shown = useMemo(() => {
    const arr = items.filter(filter.match)
    const fn = SORTS[sort]?.fn
    return fn ? [...arr].sort(fn) : arr
  }, [items, filter, sort])

  return (
    <div className="page page-collections">
      <header className="section pagehead">
        <div className="container">
          <Reveal className="pagehead__eyebrow"><span className="eyebrow">The Export Catalogue</span></Reveal>
          <h1 className="pagehead__title">
            <Mask block i={0}>Premium</Mask>
            <Mask block i={1}><span className="italic gold">handicrafts</span>.</Mask>
          </h1>
          <Reveal as="p" className="lead pagehead__lede" delay={2}>
            Each piece is cast, hammered, and finished by hand in Moradabad. Read them as material —
            the factory assigns every product a single living hue, drawn from its oxidation or polish.
          </Reveal>
        </div>
      </header>

      <div className="container">
        <div className="collections__bar">
          <div className="collections__filters">
            {FILTERS.map((f) => (
              <button key={f.key} className={`chip ${active === f.key ? 'is-active' : ''}`} onClick={() => setActive(f.key)} data-cursor>
                {f.label}
              </button>
            ))}
          </div>
          <div className="collections__controls">
            <select className="collections__select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <div className="collections__view" role="group" aria-label="View">
              <button className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="Grid view" data-cursor><Grid /></button>
              <button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label="List view" data-cursor><Rows /></button>
            </div>
            <span className="collections__count muted">
              {String(shown.length).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className={`collections__grid ${view === 'list' ? 'is-list' : ''}`}>
          {shown.map((p, i) => (
            <Reveal key={p.slug} className={`collections__cell ${i % 2 ? 'is-offset' : ''}`} delay={i % 3}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      </div>

      <Marquee
        className="collections__marquee"
        items={['Solid Brass & Copper', 'Wholesale Exports', 'Moradabad, India', 'Uncompromising Quality']}
        dir="reverse"
        duration={48}
      />
    </div>
  )
}
