import { useRecent } from '../lib/recent.js'
import { swatchGradient } from '../lib/format.js'
import { Reveal } from './Reveal.jsx'
import TLink from './TLink.jsx'

export default function RecentlyViewed({ exclude, title = 'Recently viewed' }) {
  const items = useRecent(exclude)
  if (items.length === 0) return null
  return (
    <section className="section recent">
      <div className="container">
        <div className="recent__head" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="eyebrow gold" style={{ letterSpacing: '0.12em', fontWeight: 700 }}>RECENTLY VIEWED ITEMS</span>
        </div>
        <div className="recent__strip">
          {items.map((f, i) => (
            <Reveal as={TLink} to={`/product/${f.slug}`} className="rchip" key={f.slug} delay={i} data-cursor-label="View">
              <span className="rchip__swatch" style={{ backgroundImage: swatchGradient(f.chromatic) }} />
              <span className="rchip__info">
                <span className="rchip__name serif">{f.name}</span>
                <span className="rchip__family muted">{f.family}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
