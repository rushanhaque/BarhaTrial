import { useEffect, useState } from 'react'
import { get } from '../lib/api.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import { Plus, Minus, ArrowUR } from '../components/Icons.jsx'

const SEED = [
  { slug: 'the-art-of-sand-casting', kicker: 'Technique', title: 'The Art of Sand Casting', excerpt: 'How we use compacted sand and molten brass to create monumental forms that machines simply cannot replicate.', author: 'Mustafa Ali', readingTime: '6 min', date: '2025-03-18', category: 'Manufacturing', accent: '#C58A3D' },
  { slug: 'patina-the-living-finish', kicker: 'Finishes', title: 'Patina: The Living Finish', excerpt: 'Why we prefer flame-oxidation and chemical patinas over static paint. Allowing the metal to age gracefully over decades.', author: 'Zaid Hussain', readingTime: '8 min', date: '2025-02-02', category: 'Materials', accent: '#A9B6BC' },
  { slug: 'against-planned-obsolescence', kicker: 'Philosophy', title: 'Against Planned Obsolescence', excerpt: 'The industry manufactures for the next season. We manufacture for the next century. A defense of heavy metal decor.', author: 'Tariq Hussain', readingTime: '5 min', date: '2024-12-11', category: 'Philosophy', accent: '#9C5436' },
  { slug: 'a-factory-in-moradabad', kicker: 'Heritage', title: 'A Factory in Moradabad', excerpt: 'Why we remain in the Brass City, drawing on generations of localized expertise rather than outsourcing to automated facilities.', author: 'Tariq Hussain', readingTime: '7 min', date: '2024-10-29', category: 'Heritage', accent: '#B6C24E' },
  { slug: 'the-weight-of-iron', kicker: 'Materials', title: 'The Weight of Iron', excerpt: 'Cast iron is unforgiving, brittle, and incredibly difficult to polish. Why we still use it for our most structural architectural pieces.', author: 'Mustafa Ali', readingTime: '9 min', date: '2024-09-04', category: 'Materials', accent: '#E0A23C' },
]

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default function Blog() {
  const [items, setItems] = useState(SEED)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    get('/api/journal').then(setItems).catch(() => {})
  }, [])

  const [featured, ...rest] = items

  return (
    <div className="page page-journal">
      <header className="section pagehead">
        <div className="container">
          <Reveal className="pagehead__eyebrow">
            <span className="eyebrow">The Blog</span>
          </Reveal>
          <h1 className="pagehead__title">
            <Mask block i={0}>Dispatches</Mask>
            <Mask block i={1}>
              from <span className="italic gold">the factory</span>.
            </Mask>
          </h1>
          <Reveal as="p" className="lead pagehead__lede" delay={2}>
            Field notes on metallurgy, traditional craftsmanship, and the realities of global export. 
            Written rarely, and only when there is something worth saying.
          </Reveal>
        </div>
      </header>

      {featured && (
        <section className="container">
          <Reveal>
            <button
              className="jfeature"
              style={{ '--accent': featured.accent }}
              onClick={() => setOpen(open === featured.slug ? null : featured.slug)}
              data-cursor-label="Read"
            >
              <div className="jfeature__top">
                <span className="jfeature__kicker">{featured.kicker}</span>
                <span className="muted">{fmt(featured.date)}</span>
              </div>
              <h2 className="jfeature__title serif">{featured.title}</h2>
              <p className="jfeature__excerpt lead">{featured.excerpt}</p>
              <div className="jfeature__foot">
                <span className="muted">
                  {featured.author} · {featured.readingTime}
                </span>
                <span className="jfeature__cta">
                  Read the article <ArrowUR />
                </span>
              </div>
            </button>
          </Reveal>
        </section>
      )}

      <section className="container journal__list">
        {rest.map((a, i) => {
          const isOpen = open === a.slug
          return (
            <Reveal as="article" className={`jentry ${isOpen ? 'is-open' : ''}`} key={a.slug} delay={i % 3} style={{ '--accent': a.accent }}>
              <button className="jentry__row" onClick={() => setOpen(isOpen ? null : a.slug)} data-cursor>
                <span className="jentry__index">{String(i + 2).padStart(2, '0')}</span>
                <span className="jentry__kicker">{a.kicker}</span>
                <span className="jentry__title serif">{a.title}</span>
                <span className="jentry__meta muted">{a.readingTime}</span>
                <span className="jentry__toggle">{isOpen ? <Minus /> : <Plus />}</span>
              </button>
              <div className="jentry__panel" style={{ maxHeight: isOpen ? '320px' : '0px' }}>
                <p className="jentry__excerpt">{a.excerpt}</p>
                <div className="jentry__panel-foot muted">
                  {a.author} · {fmt(a.date)} · {a.category}
                </div>
              </div>
            </Reveal>
          )
        })}
      </section>
    </div>
  )
}
