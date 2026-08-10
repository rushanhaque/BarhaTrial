import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from '../lib/api.js'
import { useParallax } from '../lib/hooks.js'
import { recordView } from '../lib/recent.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import ChromaticPlate from '../components/ChromaticPlate.jsx'
import TLink from '../components/TLink.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useWardrobe } from '../lib/wardrobe.jsx'
import { useToast } from '../lib/toast.jsx'
import { Star4, Bag } from '../components/Icons.jsx'

export default function Product() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const plateRef = useParallax(-0.05)
  const w = useWardrobe()
  const toast = useToast()

  useEffect(() => {
    setData(null)
    setError(false)
    get(`/api/products/${slug}`)
      .then((res) => {
        setData(res)
      })
      .catch(() => setError(true))
  }, [slug])

  useEffect(() => {
    if (data?.product) {
      const p = data.product
      document.title = `${p.name} — Barira Handicrafts`
      recordView({ slug: p.slug, name: p.name, family: p.family, chromatic: p.chromatic, priceUSD: p.priceUSD, index: p.index, tagline: p.tagline })
    }
  }, [data])

  if (error) {
    return (
      <div className="page page-fragrance">
        <div className="container fragrance__empty">
          <h1 className="serif">No such product.</h1>
          <p className="muted">The item you seek is not in the catalogue.</p>
          <TLink to="/collections" className="btn btn--ghost" style={{ marginTop: '1rem' }}>Return to the collections</TLink>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page page-fragrance">
        <header className="container fragrance__head">
          <div className="skeleton" style={{ height: '0.9rem', width: '7rem', marginBottom: '2.5rem' }} />
          <div className="skeleton" style={{ height: 'clamp(3rem,9vw,7rem)', width: '62%', marginBottom: '1.2rem' }} />
        </header>
        <section className="container fragrance__main">
          <div className="fragrance__left">
            <div className="skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 'var(--r-lg)' }} />
          </div>
          <div className="fragrance__right">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '1rem', width: `${90 - i * 9}%`, marginBottom: '1rem' }} />
            ))}
          </div>
        </section>
      </div>
    )
  }

  const p = data.product
  const accent = p.chromatic?.glow || '#c9a24b'
  const materials = p.materials || { primary: [], secondary: [], finish: [] }
  const summary = { slug: p.slug, name: p.name, family: p.family, chromatic: p.chromatic, priceUSD: p.priceUSD, index: p.index, tagline: p.tagline }

  const addToWardrobe = () => {
    w?.addItem({ ...summary, priceUSD: p.priceUSD, size: 'Standard', qty: p.specs?.moq || p.moq || 10 })
    toast?.push(`${p.name} added to quote`, { kicker: 'Quote List' })
    w?.openDrawer('wardrobe')
  }

  return (
    <div className="page page-fragrance" style={{ '--accent': accent }}>
      <header className="container fragrance__head" style={{ marginBottom: '3rem' }}>
        <TLink to="/collections" className="fragrance__back ulink">← The Collections</TLink>
        <div className="fragrance__head-row">
          <span className="fragrance__family" style={{ fontSize: '1.2rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.family}</span>
        </div>
        <h1 className="fragrance__name">
          <Mask block i={0}>{p.name}</Mask>
        </h1>
      </header>

      <section className="container fragrance__main" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        <div className="fragrance__left">
          <div ref={plateRef} className="fragrance__plate-wrap" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <ChromaticPlate chromatic={p.chromatic} ratio="4 / 5" className="fragrance__plate">
              <span className="fragrance__glare" />
            </ChromaticPlate>
          </div>
        </div>

        <div className="fragrance__right">
          <div className="fragrance__pyramid" style={{ position: 'sticky', top: '120px' }}>
            <span className="eyebrow" style={{ marginBottom: '2rem', display: 'block', fontSize: '1.1rem' }}>Materials & Finish</span>
            
            <Reveal as="div" className="ptier" delay={0}>
              <div className="ptier__head">
                <span className="ptier__label">Primary Metals</span>
              </div>
              <div className="ptier__notes">
                {(materials.primary || []).map((n) => (
                  <span className="ptier__chip" key={n}>{n}</span>
                ))}
              </div>
            </Reveal>

            <Reveal as="div" className="ptier" delay={1}>
              <div className="ptier__head">
                <span className="ptier__label">Secondary Elements</span>
              </div>
              <div className="ptier__notes">
                {(materials.secondary || []).map((n) => (
                  <span className="ptier__chip" key={n}>{n}</span>
                ))}
              </div>
            </Reveal>

            <Reveal as="div" className="ptier" delay={2}>
              <div className="ptier__head">
                <span className="ptier__label">Final Finish</span>
              </div>
              <div className="ptier__notes">
                {(materials.finish || []).map((n) => (
                  <span className="ptier__chip" key={n}>{n}</span>
                ))}
              </div>
            </Reveal>
            
            <div className="fragrance__price-row" style={{ marginTop: '3rem', marginBottom: '1rem' }}>
              <span className="fragrance__price serif" style={{ fontSize: '2rem' }}>${p.priceUSD} <span className="muted" style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '8px' }}>(Est. FOB)</span></span>
            </div>

            <button className="btn btn--gold fragrance__add" onClick={addToWardrobe} data-cursor style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: 'var(--r-md)', background: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer' }}>
              <span className="btn__label" style={{ fontWeight: '600' }}>Add to Quote Request</span>
              <span className="btn__icon"><Bag /></span>
            </button>
          </div>
        </div>
      </section>

      {data.related?.length > 0 && (
        <section className="section fragrance__related" style={{ marginTop: '6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '4rem' }}>
          <div className="container">
            <div className="fragrance__related-head" style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Star4 className="fragrance__related-star" style={{ color: 'var(--gold)', width: '2rem', height: '2rem' }} />
              <h2 className="serif" style={{ fontSize: '2.5rem', margin: 0 }}>Similar Items</h2>
            </div>
            <div className="fragrance__related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {data.related.map((r, i) => (
                <Reveal key={r.slug} delay={i}>
                  <ProductCard p={r} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
