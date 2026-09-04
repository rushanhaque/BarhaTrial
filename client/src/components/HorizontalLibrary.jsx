import { useEffect, useRef, useState } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { useMediaQuery } from '../lib/hooks.js'
import TLink from './TLink.jsx'
import { ArrowUR, ArrowDown } from './Icons.jsx'

import { COLLECTIONS_ITEMS } from '../data/categories.js'

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
            <TLink key={col.id} to={`/category/${col.slug}`} className="czoom-flat-card">
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
  const heroTitleOpacity = Math.max(0, 1 - Math.max(0, (p - 0.85) * 10))
  const heroBadgeOpacity = Math.min(1, Math.max(0, (p - 0.85) * 10))

  const handleHeroClick = (e) => {
    if (p < 0.95 && sectionRef.current) {
      e.preventDefault()
      e.stopPropagation()
      const sec = sectionRef.current
      const maxScroll = sec.offsetHeight - window.innerHeight
      const targetScroll = sec.offsetTop + Math.max(0, maxScroll)
      
      if (scroll && scroll.scrollTo) {
        scroll.scrollTo(targetScroll)
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="czoom-section" ref={sectionRef}>
      <div className="czoom-sticky">

        {/* Section Heading (fades in when zoomed out) */}
        <div className="czoom-head" style={{ opacity: heroBadgeOpacity, pointerEvents: 'none', width: '100%' }}>
          <h2 className="section-heading-unified" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', color: '#fff' }}>
            Explore Our Collections
          </h2>
        </div>

        {/* Zoom Matrix Container */}
        <div className="czoom-container" style={{ transform: `translateY(${p * 6}vh)` }}>
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
                  to={`/category/${item.slug}`}
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
              to="/collections"
              onClick={handleHeroClick}
              className="czoom-hero-card"
              style={{
                gridRow: 2,
                gridColumn: 2,
                transform: `scale(${heroScale})`,
                zIndex: p < 0.5 ? 12 : 2
              }}
              data-cursor-label={p < 0.95 ? "Scroll to Expand" : "Explore"}
            >
              <img 
                src="/images/explore_collections_hero.webp" 
                alt="Explore Collections" 
                className="czoom-hero-img" 
              />
              <div className="czoom-hero-overlay" />

              {/* Title scales down with card, remains visible */}
              <div className="czoom-hero-content">
                <h2 className="czoom-hero-title">
                  EXPLORE OUR <br />
                  <span className="italic gold">COLLECTIONS</span>
                </h2>
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
