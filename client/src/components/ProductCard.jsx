import ChromaticPlate from './ChromaticPlate.jsx'
import TLink from './TLink.jsx'
import { useWardrobe } from '../lib/wardrobe.jsx'
import { useToast } from '../lib/toast.jsx'
import { useTilt } from '../lib/hooks.js'
import { ArrowUR, Heart, HeartFill, Bag } from './Icons.jsx'

export default function ProductCard({ p, ratio = '4 / 5' }) {
  const w = useWardrobe()
  const toast = useToast()
  const tilt = useTilt(5)
  const wished = w?.isWished(p.slug)
  const summary = {
    slug: p.slug, name: p.name, family: p.family,
    chromatic: p.chromatic, priceUSD: p.priceUSD, index: p.index, tagline: p.tagline,
  }

  const quickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    w?.addItem({ ...summary, qty: p.moq || 10 })
    toast?.push(`${p.name} added to your quote request`, { kicker: 'Quote List' })
  }
  const toggleWish = (e) => {
    e.preventDefault()
    e.stopPropagation()
    w?.toggleWish(summary)
    toast?.push(wished ? `${p.name} removed` : `${p.name} saved`, { kicker: wished ? 'Removed' : 'Saved' })
  }

  return (
    <div className="fcard">
      <TLink to={`/product/${p.slug}`} className="fcard__link" data-cursor-label="View">
        <div className="fcard__tilt" ref={tilt}>
          <ChromaticPlate chromatic={p.chromatic} ratio={ratio} className="fcard__plate">
            <span className="fcard__index">{p.index}</span>
            {p.signature && <span className="fcard__sig">Signature</span>}
            <span className="fcard__view"><ArrowUR /></span>
            <span className="fcard__family-tag">{p.family}</span>
            <span className="fcard__glare" />
          </ChromaticPlate>
        </div>
        <div className="fcard__meta">
          <div className="fcard__line">
            <h3 className="fcard__name serif">{p.name}</h3>
            <span className="fcard__price">${p.priceUSD}</span>
          </div>
          <div className="fcard__line">
            <span className="fcard__tag muted">{p.tagline}</span>
            <span className="fcard__discover">View Details</span>
          </div>
        </div>
      </TLink>
      <div className="fcard__actions">
        <button
          className={`fcard__act ${wished ? 'is-wished' : ''}`}
          onClick={toggleWish}
          aria-label={wished ? 'Remove from saved' : 'Save'}
          aria-pressed={!!wished}
          data-cursor
        >
          {wished ? <HeartFill /> : <Heart />}
        </button>
        <button className="fcard__act" onClick={quickAdd} aria-label="Add to quote request" data-cursor>
          <Bag />
        </button>
      </div>
    </div>
  )
}
