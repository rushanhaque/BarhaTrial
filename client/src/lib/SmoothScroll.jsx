import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
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
  const navType = useNavigationType()

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

  // Tell the browser not to mess with our manual scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Save scroll position before leaving the current route
  useEffect(() => {
    return () => {
      const currentScroll = lenisRef.current ? lenisRef.current.scroll : window.scrollY;
      sessionStorage.setItem(`scroll-${pathname}`, currentScroll.toString());
    };
  }, [pathname]);

  // Restore scroll on POP or if returning to homepage
  useEffect(() => {
    const applyScroll = (target) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { immediate: true });
      } else {
        window.scrollTo(0, target);
      }
    };

    const saved = sessionStorage.getItem(`scroll-${pathname}`);
    // Restore if we have a saved position AND (it's a back navigation OR we are going to the homepage)
    const target = (saved && (navType === 'POP' || pathname === '/')) ? Number(saved) : 0;
    
    if (target > 0) {
      // Fire immediately
      applyScroll(target);
      // And fire repeatedly for a short window to ensure it sticks as the DOM renders
      let attempts = 0;
      const interval = setInterval(() => {
        applyScroll(target);
        attempts++;
        if (attempts >= 5) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    } else {
      applyScroll(0);
    }
  }, [pathname, navType]);

  return <ScrollContext.Provider value={ctx}>{children}</ScrollContext.Provider>
}
