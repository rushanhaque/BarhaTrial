import { useEffect, useRef, useState } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { useMediaQuery } from '../lib/hooks.js'
import Beams from './Beams.jsx'
import TLink from './TLink.jsx'
import { ArrowUR, ArrowDown } from './Icons.jsx'

const COLLECTIONS_ITEMS = [
  {
    id: 'vases',
    name: 'Vases & Vessels',
    tagline: 'Solid Hammered Brass',
    image: '/images/brass_vase.png',
    slug: 'aurelia-hammered-vase',
    gridPos: { row: 1, col: 1 },
    dx: -90,
    dy: -90
  },
  {
    id: 'tableware',
    name: 'Tableware & Trays',
    tagline: 'Hand-Buffed Finish',
    image: '/images/brass_tray.png',
    slug: 'verona-candle-stand',
    gridPos: { row: 1, col: 2 },
    dx: 0,
    dy: -100
  },
  {
    id: 'decor',
    name: 'Architectural Decor',
    tagline: 'Flame-Oxidized Patina',
    image: '/images/candle_stand.png',
    slug: 'solstice-wall-art',
    gridPos: { row: 1, col: 3 },
    dx: 90,
    dy: -90
  },
  {
    id: 'lighting',
    name: 'Brass Lighting',
    tagline: 'Handcrafted Sconces',
    image: '/images/metal_lantern.png',
    slug: 'helios-lantern',
    gridPos: { row: 2, col: 1 },
    dx: -100,
    dy: 0
  },
  {
    id: 'furniture',
    name: 'Cast Iron Furniture',
    tagline: 'Heavy Foundry Iron',
    image: '/images/end_table.png',
    slug: 'regent-end-table',
    gridPos: { row: 2, col: 3 },
    dx: 100,
    dy: 0
  },
  {
    id: 'kitchenware',
    name: 'Copper Vessels',
    tagline: 'Raw Copper Craft',
    image: '/images/copper_kitchenware.png',
    slug: 'celeste-serving-bowl',
    gridPos: { row: 3, col: 1 },
    dx: -90,
    dy: 90
  },
  {
    id: 'planters',
    name: 'Garden & Planters',
    tagline: 'Weathered Vessels',
    image: '/images/iron_planter.png',
    slug: 'marbella-planter',
    gridPos: { row: 3, col: 2 },
    dx: 0,
    dy: 100
  },
  {
    id: 'metalwork',
    name: 'Custom Metalwork',
    tagline: 'Wholesale & Export',
    image: '/images/architectural_brass.png',
    slug: 'zenith-bookends',
    gridPos: { row: 3, col: 3 },
    dx: 90,
    dy: 90
  }
]

export default function HorizontalLibrary({ items = [] }) {
  const scroll = useScroll()
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const currentPRef = useRef(0)
  const targetPRef = useRef(0)
  const rafRef = useRef(null)

  const small = useMediaQuery('(max-width: 880px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const disableAnimation = small || reduced

  useEffect(() => {
    if (disableAnimation) return

    const handleScroll = () => {
      const sec = sectionRef.current
      if (!sec) return
      const rect = sec.getBoundingClientRect()
      const maxScroll = sec.offsetHeight - window.innerHeight
      if (maxScroll <= 0) return
      const raw = -rect.top / maxScroll
      targetPRef.current = Math.min(1, Math.max(0, raw))
    }

    const updateLoop = () => {
      // Smooth RAF lerp for silky GSAP-style momentum
      const diff = targetPRef.current - currentPRef.current
      if (Math.abs(diff) > 0.0005) {
        currentPRef.current += diff * 0.12
        setProgress(currentPRef.current)
      }
      rafRef.current = requestAnimationFrame(updateLoop)
    }

    handleScroll()
    window.addEventListener('resize', handleScroll)
    const unsub = scroll?.subscribe(handleScroll)
    rafRef.current = requestAnimationFrame(updateLoop)

    return () => {
      window.removeEventListener('resize', handleScroll)
      unsub?.()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [scroll, disableAnimation])

  // Fallback for mobile / reduced motion
  if (disableAnimation) {
    return (
      <section className="section czoom-flat-section">
        <div className="container" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="eyebrow gold">Collections</span>
          <h2 className="serif" style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>
            Explore Our <span className="italic gold">Collections</span>
          </h2>
        </div>

        <div className="container czoom-flat-grid">
          {COLLECTIONS_ITEMS.map(col => (
            <TLink key={col.id} to="/catalogue" className="czoom-flat-card">
              <img src={col.image} alt={col.name} className="czoom-flat-img" />
              <div className="czoom-flat-meta">
                <h3 className="serif">{col.name}</h3>
                <span className="muted">{col.tagline}</span>
              </div>
            </TLink>
          ))}
        </div>
      </section>
    )
  }

  // Calculate Hero Card scale & position transforms:
  // p = 0: Hero is triple size (scale 3.0, filling full 3x3 grid area)
  // p = 1: Hero shrinks down to 1.0 scale (exact normal size of surrounding cards)
  const p = progress
  const heroScale = Math.max(1, 3.0 - p * 2.0)
  const heroTitleOpacity = Math.max(0, 1 - p * 2.5)
  const heroBadgeOpacity = Math.min(1, Math.max(0, (p - 0.45) * 2.5))

  const handleHeroClick = (e) => {
    if (p < 0.5 && sectionRef.current) {
      e.preventDefault()
      e.stopPropagation()
      const sec = sectionRef.current
      const maxScroll = sec.offsetHeight - window.innerHeight
      const targetScroll = sec.offsetTop + Math.max(0, maxScroll * 0.52)
      window.scrollTo({ top: targetScroll, behavior: 'smooth' })
    }
  }

  return (
    <section className="czoom-section" ref={sectionRef}>
      <div className="czoom-sticky">

        {/* Zoom Matrix Container */}
        <div className="czoom-container">
          <div className="czoom-grid">
            {COLLECTIONS_ITEMS.map((item, idx) => {
              // Calculate staggered entrance for each surrounding card
              const stagger = idx * 0.04
              const rawCardP = Math.min(1, Math.max(0, (p - 0.12 - stagger) / 0.58))
              const cardP = rawCardP * rawCardP * (3 - 2 * rawCardP) // Smooth step

              const opacity = cardP
              const scale = 0.45 + cardP * 0.55
              const translateX = (1 - cardP) * item.dx
              const translateY = (1 - cardP) * item.dy

              return (
                <TLink
                  key={item.id}
                  to="/catalogue"
                  className="czoom-card"
                  style={{
                    gridRow: item.gridPos.row,
                    gridColumn: item.gridPos.col,
                    opacity,
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    pointerEvents: p > 0.4 ? 'auto' : 'none'
                  }}
                  data-cursor-label="Explore"
                >
                  <img src={item.image} alt={item.name} className="czoom-card-img" />
                  <div className="czoom-card-meta">
                    <h3 className="czoom-card-name">{item.name}</h3>
                  </div>
                </TLink>
              )
            })}

            {/* Central Hero Landscape Card */}
            <TLink
              to="/catalogue"
              onClick={handleHeroClick}
              className="czoom-hero-card"
              style={{
                gridRow: 2,
                gridColumn: 2,
                transform: `scale(${heroScale})`,
                zIndex: p < 0.5 ? 12 : 2
              }}
              data-cursor-label={p < 0.6 ? "Scroll to Expand" : "View All"}
            >
              <img src="/images/brass_vase.png" alt="Explore Collections" className="czoom-hero-img" />
              <div className="czoom-hero-overlay" />

              {/* Large Initial Title (fades out as card shrinks) */}
              <div className="czoom-hero-content" style={{ opacity: heroTitleOpacity }}>
                <h2 className="czoom-hero-title">
                  EXPLORE OUR <br />
                  <span className="italic gold">COLLECTIONS</span>
                </h2>
              </div>

              {/* Compact Badge (fades in as card zooms out into grid) */}
              <div
                className="czoom-card-meta"
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  right: '1rem',
                  opacity: heroBadgeOpacity,
                  pointerEvents: 'none'
                }}
              >
                <h3 className="czoom-card-name">All Compositions</h3>
              </div>
            </TLink>
          </div>
        </div>

        {/* Scroll Progress Hint Footer */}
        <div className="czoom-foot" style={{ opacity: Math.max(0, 1 - p * 1.8) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--gold)' }}>
            <span>Scroll to expand collections</span>
            <ArrowDown style={{ width: 14, height: 14, animation: 'bounce 2s infinite' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
