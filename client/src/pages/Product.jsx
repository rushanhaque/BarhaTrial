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
import { Bag } from '../components/Icons.jsx'

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
      <header className="container fragrance__head">
        <TLink to="/collections" className="fragrance__back ulink">← The Collections</TLink>
        <div className="fragrance__head-row">
          <span className="fragrance__family">{p.family}</span>
        </div>
        <h1 className="fragrance__name">
          <Mask block i={0}>{p.name}</Mask>
        </h1>
      </header>

      <section className="container fragrance__main">
        <div className="fragrance__left">
          <div ref={plateRef} className="fragrance__plate-wrap">
            <ChromaticPlate chromatic={p.chromatic} ratio="4 / 5" className="fragrance__plate">
              <span className="fragrance__glare" />
            </ChromaticPlate>
          </div>
        </div>

        <div className="fragrance__right">
          <div className="fragrance__pyramid">
            <span className="eyebrow">Materials & Finish</span>
            
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
            
            <button className="btn btn--gold fragrance__add" onClick={addToWardrobe} data-cursor>
              <span className="btn__label">Add to Quote Request</span>
              <span className="btn__icon"><Bag /></span>
            </button>
          </div>
        </div>
      </section>

      {data.related?.length > 0 && (
        <section className="section fragrance__related">
          <div className="container">
            <div className="fragrance__related-head">
              <h2 className="serif">Similar Items</h2>
            </div>
            <div className="fragrance__related-grid">
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
