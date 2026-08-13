import { useEffect, useState } from 'react'
import ChromaticPlate from './ChromaticPlate.jsx'
import TLink from './TLink.jsx'
import LaserFlow from './LaserFlow.jsx'
import { useWardrobe } from '../lib/wardrobe.jsx'
import { useToast } from '../lib/toast.jsx'
import { ArrowUR, Heart, HeartFill, Bag } from './Icons.jsx'
import GlareHover from './GlareHover.jsx'
export default function ProductCard({ p, ratio = '4 / 5', showLaserFlow = false, laserColor = '#3b5f78', index = 0 }) {
  const w = useWardrobe()
  const toast = useToast()
  const wished = w?.isWished(p.slug)
  const summary = {
    slug: p.slug, name: p.name, family: p.family,
    chromatic: p.chromatic, priceUSD: p.priceUSD, index: p.index, tagline: p.tagline,
  }

  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Calculate serial phase offset so laser flows from card 0 to card N as user scrolls
  const cardDelay = index * 0.45;
  const scrollOffset = scrollY * 0.0015;
  const totalPhase = (scrollOffset + cardDelay) % 3.0;
  const beamX = -0.3 + (totalPhase / 3.0) * 0.6;
  const flowSpeedValue = 0.4 + (index % 3) * 0.08;

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
    <div className={`fcard ${showLaserFlow ? 'laser-flow-card' : ''}`}>
      {showLaserFlow && (
        <div className="fcard__laser-top">
          <LaserFlow
            color={laserColor}
            horizontalBeamOffset={beamX}
            verticalBeamOffset={-0.48}
            horizontalSizing={0.85}
            verticalSizing={4.0}
            wispDensity={1.5}
            wispSpeed={20.0}
            wispIntensity={6.5}
            fogIntensity={0.65}
            fogScale={0.35}
            flowSpeed={flowSpeedValue}
          />
        </div>
      )}
      <TLink to={`/product/${p.slug}`} className="fcard__link" data-cursor-label="View">
        <GlareHover width="100%" height="100%" background="transparent" borderColor="transparent" borderRadius="var(--r-md)" glareColor="#ffffff" glareOpacity={0.15}>
          <ChromaticPlate chromatic={p.chromatic} ratio={ratio} className="fcard__plate" style={{ width: '100%', height: '100%' }}>
            {p.image && <img src={p.image} alt={p.name} className="fcard__img" />}
            <span className="fcard__index">{p.index}</span>
            <span className="fcard__view"><ArrowUR /></span>
            <span className="fcard__family-tag">
              {p.category && p.family && p.category !== p.family ? (
                <>{p.category} <span style={{ opacity: 0.5 }}>·</span> <span style={{ color: 'var(--bone)' }}>{p.family}</span></>
              ) : (p.family || p.category)}
            </span>
            <span className="fcard__glare" />
            <div className="fcard__actions">
              <button className="fcard__act" onClick={quickAdd} aria-label="Add to quote request" data-cursor>
                <Bag />
              </button>
            </div>
          </ChromaticPlate>
        </GlareHover>
        <div className="fcard__meta">
          <h3 className="fcard__name serif">{p.name}</h3>
          <div className="fcard__line">
            <span className="fcard__tag muted">{p.tagline}</span>
            <span className="fcard__discover">View Details</span>
          </div>
        </div>
      </TLink>
    </div>
  )
}
