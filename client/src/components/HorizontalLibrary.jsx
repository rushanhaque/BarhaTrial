import { useEffect, useRef } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { useMediaQuery } from '../lib/hooks.js'
import ChromaticPlate from './ChromaticPlate.jsx'
import TLink from './TLink.jsx'
import { ArrowUR } from './Icons.jsx'

export default function HorizontalLibrary({ items = [] }) {
  const scroll = useScroll()
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const fillRef = useRef(null)
  const countRef = useRef(null)
  const m = useRef({ total: 1, move: 0 })

  const small = useMediaQuery('(max-width: 880px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const pinned = !small && !reduced && items.length > 0

  useEffect(() => {
    if (!pinned) return
    const recalc = () => {
      const sec = sectionRef.current
      const track = trackRef.current
      if (!sec || !track) return
      m.current.total = Math.max(1, sec.offsetHeight - window.innerHeight)
      m.current.move = Math.max(0, track.scrollWidth - window.innerWidth * 0.92)
    }
    const onScroll = () => {
      const sec = sectionRef.current
      const track = trackRef.current
      if (!sec || !track) return
      const top = sec.getBoundingClientRect().top
      const p = Math.min(1, Math.max(0, -top / m.current.total))
      track.style.transform = `translate3d(${(-p * m.current.move).toFixed(2)}px, 0, 0)`
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p.toFixed(3)})`
      if (countRef.current)
        countRef.current.textContent = String(Math.min(items.length, Math.round(p * (items.length - 1)) + 1)).padStart(2, '0')
    }
    recalc()
    onScroll()
    window.addEventListener('resize', recalc)
    const unsub = scroll?.subscribe(onScroll)
    return () => {
      window.removeEventListener('resize', recalc)
      unsub?.()
    }
  }, [pinned, scroll, items])

  const cards = items.map((f) => (
    <TLink
      key={f.slug}
      to={`/fragrance/${f.slug}`}
      className="hcard"
      data-cursor-label="View"
    >
      <ChromaticPlate chromatic={f.chromatic} ratio="4 / 5" className="hcard__plate">
        <span className="hcard__index">{f.index}</span>
        {f.signature && <span className="hcard__sig">Signature</span>}
      </ChromaticPlate>
      <div className="hcard__meta">
        <span className="hcard__family">{f.family}</span>
        <h3 className="hcard__name serif">{f.name}</h3>
        <span className="hcard__tag muted">{f.tagline}</span>
        <span className="hcard__cta">
          Discover <ArrowUR />
        </span>
      </div>
    </TLink>
  ))

  if (!pinned) {
    return (
      <section className="section hlib hlib--flat">
        <div className="container hlib__head">
          <span className="eyebrow">The Olfactory Library</span>
          <h2 className="hlib__title">
            Eight compositions, <span className="italic gold">one philosophy</span>.
          </h2>
        </div>
        <div className="hlib__track hlib__track--flat">{cards}</div>
      </section>
    )
  }

  const height = `${120 + items.length * 24}vh`
  return (
    <section className="hlib" ref={sectionRef} style={{ height }}>
      <div className="hlib__sticky">
        <div className="container hlib__head">
          <span className="eyebrow">The Olfactory Library</span>
          <h2 className="hlib__title">
            Eight compositions,
            <br />
            <span className="italic gold">one philosophy</span>.
          </h2>
        </div>
        <div className="hlib__viewport">
          <div className="hlib__track" ref={trackRef}>
            {cards}
          </div>
        </div>
        <div className="container hlib__foot">
          <div className="hlib__progress">
            <span className="hlib__progress-fill" ref={fillRef} />
          </div>
          <span className="hlib__count">
            <span ref={countRef}>01</span> / {String(items.length).padStart(2, '0')}
          </span>
          <span className="hlib__hint muted">Scroll to traverse</span>
        </div>
      </div>
    </section>
  )
}
