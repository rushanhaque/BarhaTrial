import { useEffect, useRef, useState } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'

const WORD = 'Barha'.split('')
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Preloader({ onDone }) {
  const scroll = useScroll()
  const scrollRef = useRef(scroll)
  scrollRef.current = scroll
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const finished = useRef(false)

  // Pause Lenis as soon as it exists.
  useEffect(() => {
    if (scroll?.lenis && !finished.current) scroll.lenis.stop()
  }, [scroll])

  useEffect(() => {
    document.documentElement.classList.add('is-loading')
    const DUR = 2050

    const finish = () => {
      if (finished.current) return
      finished.current = true
      setCount(100)
      setLeaving(true)
      window.setTimeout(() => {
        document.documentElement.classList.remove('is-loading')
        const sc = scrollRef.current
        sc?.lenis?.start?.()
        sc?.scrollTo?.(0, { immediate: true })
        onDone?.()
      }, 1100)
    }

    if (reduced()) {
      setCount(100)
      window.setTimeout(finish, 200)
      return
    }

    let raf
    let start
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const run = (ts) => {
      if (start == null) start = ts
      const p = Math.min(1, (ts - start) / DUR)
      setCount(Math.round(ease(p) * 100))
      if (p < 1) raf = requestAnimationFrame(run)
      else window.setTimeout(finish, 280)
    }
    raf = requestAnimationFrame(run)
    // Safety: guarantee completion even if rAF is throttled (e.g. background tab),
    // so the experience never stalls with scroll locked.
    const safety = window.setTimeout(finish, DUR + 1600)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(safety)
    }
  }, [])

  return (
    <div className="preloader" data-leaving={leaving} aria-hidden="true">
      <div className="preloader__veil" />
      <div className="preloader__inner">
        <span className="preloader__eyebrow">Maison de Parfum · Grasse · MMXIV</span>
        <h1 className="preloader__mark">
          {WORD.map((c, i) => (
            <span className="preloader__char" key={i} style={{ '--d': `${0.2 + i * 0.07}s` }}>
              {c}
            </span>
          ))}
        </h1>
        <span className="preloader__sub">The Art of Twilight</span>
      </div>
      <div className="preloader__meter">
        <span className="preloader__count">{String(count).padStart(3, '0')}</span>
        <span className="preloader__pct">Entering the maison</span>
      </div>
      <div className="preloader__bar">
        <span style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </div>
  )
}
