import { useEffect, useMemo, useState } from 'react'
import { get } from '../lib/api.js'
import { fallbackProducts } from '../data/fallback.js'
import { useWardrobe } from '../lib/wardrobe.jsx'
import { useToast } from '../lib/toast.jsx'
import { swatchGradient } from '../lib/format.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import { Check, ArrowUR } from '../components/Icons.jsx'

const MAX = 5

export default function TradeFairs() {
  const [items, setItems] = useState(fallbackProducts)
  const [picked, setPicked] = useState([])
  const w = useWardrobe()
  const toast = useToast()

  useEffect(() => {
    get('/api/products').then(setItems).catch(() => {})
  }, [])

  const toggle = (slug) => {
    setPicked((p) => {
      if (p.includes(slug)) return p.filter((s) => s !== slug)
      if (p.length >= MAX) {
        toast?.push('You can request up to five items for inspection.', { kicker: 'The limit' })
        return p
      }
      return [...p, slug]
    })
  }

  const chosen = useMemo(() => items.filter((p) => picked.includes(p.slug)), [items, picked])

  const requestSamples = () => {
    if (picked.length === 0) return
    const names = chosen.map((p) => p.name).join(', ')
    w?.addItem({
      slug: `fair-request-${picked.slice().sort().join('-')}`,
      name: 'Trade Fair Inspection Request',
      family: `${picked.length} Items — ${names}`,
      chromatic: chosen[0]?.chromatic,
      priceUSD: 0,
      qty: 1,
      kind: 'appointment',
    })
    toast?.push('Inspection request added to your quote list.', { kicker: 'Quote List' })
    w?.openDrawer('wardrobe')
    setPicked([])
  }

  return (
    <div className="page page-discovery">
      <header className="section pagehead">
        <div className="container">
          <Reveal className="pagehead__eyebrow"><span className="eyebrow">Trade Fairs & Showrooms</span></Reveal>
          <h1 className="pagehead__title">
            <Mask block i={0}>Inspect the</Mask>
            <Mask block i={1}>quality, <span className="italic gold">in person</span>.</Mask>
          </h1>
          <Reveal as="p" className="lead pagehead__lede" delay={2}>
            We exhibit annually at Ambiente Frankfurt and IHGF Delhi Fair. 
            Choose up to five products from our catalogue below, and our team will ensure physical samples are prepared for your booth appointment.
          </Reveal>
        </div>
      </header>

      <section className="container discovery">
        <div className="discovery__grid">
          {items.map((p, i) => {
            const on = picked.includes(p.slug)
            return (
              <Reveal as="button" key={p.slug} delay={i % 3} className={`dpick ${on ? 'is-on' : ''}`} onClick={() => toggle(p.slug)} data-cursor>
                <span className="dpick__swatch" style={{ backgroundImage: swatchGradient(p.chromatic) }}>
                  <span className="dpick__check"><Check /></span>
                </span>
                <span className="dpick__info">
                  <span className="dpick__index">{p.index}</span>
                  <span className="dpick__name serif">{p.name}</span>
                  <span className="dpick__family muted">{p.family}</span>
                </span>
              </Reveal>
            )
          })}
        </div>
      </section>

      <div className={`discovery__bar ${picked.length > 0 ? 'is-active' : ''}`}>
        <div className="container discovery__bar-inner">
          <div className="discovery__bar-left">
            <span className="discovery__count">
              <span className="serif">{picked.length}</span> / {MAX} items selected
            </span>
            <span className="discovery__dots">
              {Array.from({ length: MAX }).map((_, i) => (
                <span key={i} className={`discovery__dot ${i < picked.length ? 'is-on' : ''}`} />
              ))}
            </span>
          </div>
          <div className="discovery__bar-right">
            <span className="discovery__total serif" style={{ fontSize: '1rem', marginRight: '2rem' }}>No charge</span>
            <button className="btn btn--gold" onClick={requestSamples} disabled={picked.length === 0} data-cursor>
              <span className="btn__label">Add to Quote List</span>
              <span className="btn__icon"><ArrowUR /></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
