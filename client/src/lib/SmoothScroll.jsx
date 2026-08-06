import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'

const ScrollContext = createContext(null)
export const useScroll = () => useContext(ScrollContext)

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Provides one Lenis instance + a single rAF loop. Components subscribe to the
 * smoothed scroll signal (for parallax / velocity) rather than spinning up their
 * own scroll listeners.
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null)
  const subs = useRef(new Set())
  const [ctx, setCtx] = useState(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (prefersReduced()) {
      // Still expose a no-op-ish API driven by native scroll.
      const onScroll = () => subs.current.forEach((fn) => fn({ scroll: window.scrollY, velocity: 0, direction: 0 }))
      window.addEventListener('scroll', onScroll, { passive: true })
      setCtx({
        lenis: null,
        subscribe: (fn) => {
          subs.current.add(fn)
          return () => subs.current.delete(fn)
        },
        scrollTo: (t, o) => window.scrollTo({ top: typeof t === 'number' ? t : 0, behavior: o?.immediate ? 'auto' : 'smooth' }),
      })
      return () => window.removeEventListener('scroll', onScroll)
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      lerp: 0.1,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ({ scroll, velocity, direction }) => {
      subs.current.forEach((fn) => fn({ scroll, velocity, direction }))
    })

    let raf
    const loop = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    setCtx({
      lenis,
      subscribe: (fn) => {
        subs.current.add(fn)
        return () => subs.current.delete(fn)
      },
      scrollTo: (target, opts) => lenis.scrollTo(target, opts),
    })

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Reset to top on route change (instant — the curtain hides the jump).
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return <ScrollContext.Provider value={ctx}>{children}</ScrollContext.Provider>
}
