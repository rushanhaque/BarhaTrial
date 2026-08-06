import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from '../lib/api.js'
import { useParallax, useTilt } from '../lib/hooks.js'
import { useWardrobe } from '../lib/wardrobe.jsx'
import { useToast } from '../lib/toast.jsx'
import { recordView } from '../lib/recent.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import ChromaticPlate from '../components/ChromaticPlate.jsx'
import ProductCard from '../components/ProductCard.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import RecentlyViewed from '../components/RecentlyViewed.jsx'
import TLink from '../components/TLink.jsx'
import { Star4, Bag, Plus, Minus, Heart, HeartFill, Quote } from '../components/Icons.jsx'

export default function Product() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [size, setSize] = useState(0)
  const [qty, setQty] = useState(1)
  const plateRef = useParallax(-0.05)
  const tiltRef = useTilt(6)
  const w = useWardrobe()
  const toast = useToast()

  useEffect(() => {
    setData(null)
    setError(false)
    setSize(0)
    get(`/api/products/${slug}`)
      .then((res) => {
        setData(res)
        setQty(res.product?.specs?.moq || 1)
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
          <MagneticButton to="/catalogue" variant="ghost" label="Return to the catalogue" />
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
          <div className="skeleton" style={{ height: '1.4rem', width: '38%' }} />
        </header>
        <section className="container fragrance__main">
          <div className="fragrance__left">
            <div className="skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 'var(--r-lg)' }} />
          </div>
          <div className="fragrance__right">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '1rem', width: `${90 - i * 9}%`, marginBottom: '1rem' }} />
            ))}
          </div>
        </section>
      </div>
    )
  }

  const p = data.product
  const accent = p.chromatic?.glow || '#c9a24b'
  const wished = w?.isWished(p.slug)
  const summary = { slug: p.slug, name: p.name, family: p.family, chromatic: p.chromatic, priceUSD: p.priceUSD, index: p.index, tagline: p.tagline }

  const addToWardrobe = () => {
    w?.addItem({ ...summary, priceUSD: p.priceUSD, size: p.sizes[size], qty })
    toast?.push(`${p.name} · ${p.sizes[size]} added to quote`, { kicker: 'Quote List' })
    w?.openDrawer('wardrobe')
  }
  const toggleWish = () => {
    w?.toggleWish(summary)
    toast?.push(wished ? `${p.name} removed` : `${p.name} saved`, { kicker: wished ? 'Removed' : 'Saved' })
  }

  const handleQtyChange = (delta) => {
    setQty((q) => {
      const newQ = q + delta
      return Math.max(1, newQ) // Allow them to order less than MOQ if they want to negotiate
    })
  }

  return (
    <div className="page page-fragrance" style={{ '--accent': accent }}>
      <header className="container fragrance__head">
        <TLink to="/catalogue" className="fragrance__back ulink">← The Catalogue</TLink>
        <div className="fragrance__head-row">
          <span className="index-num">{p.index}</span>
          <span className="fragrance__family">{p.family}</span>
          <span className="index-num">{p.category}</span>
        </div>
        <h1 className="fragrance__name">
          <Mask block i={0}>{p.name}</Mask>
        </h1>
        <Reveal as="p" className="lead fragrance__tagline" delay={1}>{p.tagline}</Reveal>
        {p.rating && (
          <Reveal className="fragrance__rating" delay={2}>
            <Stars value={p.rating} />
            <span className="fragrance__rating-val">{p.rating.toFixed(1)}</span>
            <span className="muted">· {p.votes} buyer reviews</span>
          </Reveal>
        )}
      </header>

      <section className="container fragrance__main">
        <div className="fragrance__left">
          <div ref={plateRef} className="fragrance__plate-wrap">
            <div ref={tiltRef} className="fragrance__tilt">
              <ChromaticPlate chromatic={p.chromatic} ratio="4 / 5" className="fragrance__plate">
                <span className="fragrance__plate-mark">{p.index}</span>
                <span className="fragrance__plate-caption">Material signature</span>
                <span className="fragrance__glare" />
              </ChromaticPlate>
            </div>
          </div>
          <div className="fragrance__buy">
            <div className="fragrance__price-row">
              <span className="fragrance__price serif">${p.priceUSD} <span className="muted" style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '8px' }}>(Est. FOB)</span></span>
            </div>
            <div className="fragrance__sizes">
              {p.sizes.map((s, i) => (
                <button key={s} className={`chip ${size === i ? 'is-active' : ''}`} onClick={() => setSize(i)} data-cursor>{s}</button>
              ))}
            </div>
            <div className="fragrance__buy-row">
              <div className="fragrance__qty">
                <button onClick={() => handleQtyChange(-10)} aria-label="Decrease quantity" data-cursor><Minus /></button>
                <span>{qty}</span>
                <button onClick={() => handleQtyChange(10)} aria-label="Increase quantity" data-cursor><Plus /></button>
              </div>
              <button className="btn btn--gold fragrance__add" onClick={addToWardrobe} data-cursor>
                <span className="btn__label">Add to Quote</span>
                <span className="btn__icon"><Bag /></span>
              </button>
            </div>
            <p className="muted" style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>Minimum Order Quantity (MOQ): {p.specs.moq}</p>
            <button className={`fragrance__wish ${wished ? 'is-on' : ''}`} onClick={toggleWish} data-cursor style={{ marginTop: '1rem' }}>
              {wished ? <HeartFill /> : <Heart />}
              <span>{wished ? 'Saved to your list' : 'Save to your list'}</span>
            </button>
          </div>
        </div>

        <div className="fragrance__right">
          <Reveal as="div" className="fragrance__story"><p>{p.story}</p></Reveal>

          <div className="fragrance__pyramid">
            <span className="eyebrow">Materials & Finish</span>
            
            <Reveal as="div" className="ptier" delay={0}>
              <div className="ptier__head">
                <span className="ptier__label">Primary Metals</span>
              </div>
              <div className="ptier__notes">
                {p.materials.primary.map((n) => (
                  <span className="ptier__chip" key={n}>{n}</span>
                ))}
              </div>
            </Reveal>

            <Reveal as="div" className="ptier" delay={1}>
              <div className="ptier__head">
                <span className="ptier__label">Secondary Elements</span>
              </div>
              <div className="ptier__notes">
                {p.materials.secondary.map((n) => (
                  <span className="ptier__chip" key={n}>{n}</span>
                ))}
              </div>
            </Reveal>

            <Reveal as="div" className="ptier" delay={2}>
              <div className="ptier__head">
                <span className="ptier__label">Final Finish</span>
              </div>
              <div className="ptier__notes">
                {p.materials.finish.map((n) => (
                  <span className="ptier__chip" key={n}>{n}</span>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="fragrance__spec">
            <span className="eyebrow" style={{ display: 'block', marginBottom: '1.5rem' }}>Manufacturing Specifications</span>
            <SpecRow k="Master Artisan" v={p.artisan} />
            <SpecRow k="Year Designed" v={String(p.year)} />
            <SpecRow k="Unit Weight" v={p.specs.weight} />
            <SpecRow k="Lead Time" v={p.specs.leadTime} />
            <SpecRow k="Origin" v={p.origin} />
            <SpecRow k="Design Character" v={p.character.join(' · ')} />
          </div>

          {p.impressions?.length > 0 && (
            <div className="fragrance__impressions">
              <span className="eyebrow">Buyer Impressions</span>
              {p.impressions.map((im, i) => (
                <Reveal as="figure" className="impression" key={i} delay={i}>
                  <Quote className="impression__mark" />
                  <blockquote className="impression__text serif">{im.text}</blockquote>
                  <figcaption className="impression__by muted">{im.by} · {im.role}</figcaption>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {data.related?.length > 0 && (
        <section className="section fragrance__related">
          <div className="container">
            <div className="fragrance__related-head">
              <Star4 className="fragrance__related-star" />
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

      <RecentlyViewed exclude={p.slug} title="Recently viewed items" />
    </div>
  )
}

function Stars({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      <span className="stars__row stars__row--bg">{'★★★★★'}</span>
      <span className="stars__row stars__row--fg" style={{ width: `${pct}%` }}>{'★★★★★'}</span>
    </span>
  )
}

function SpecRow({ k, v }) {
  return (
    <div className="spec">
      <span className="spec__k muted">{k}</span>
      <span className="spec__v">{v}</span>
    </div>
  )
}
