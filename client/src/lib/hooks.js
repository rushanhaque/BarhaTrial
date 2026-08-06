import { useEffect, useRef, useState } from 'react'
import { useScroll } from './SmoothScroll.jsx'

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const coarse = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/* ---- Shared IntersectionObserver for reveals (one observer, many targets) ---- */
let _io = null
function observer() {
  if (_io) return _io
  _io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          _io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.14 }
  )
  return _io
}

/** Attach to any element with a `.reveal` / mask base class. Adds `is-in` once. */
export function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced()) {
      el.classList.add('is-in')
      return
    }
    const ob = observer()
    ob.observe(el)
    return () => ob.unobserve(el)
  }, [])
  return ref
}

/** Magnetic pull toward the cursor. Apply to a WRAPPER, not the styled element. */
export function useMagnetic(strength = 0.32, ease = 0.16) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || coarse() || reduced()) return
    let raf
    let tx = 0
    let ty = 0
    let dx = 0
    let dy = 0
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      dx = (e.clientX - (r.left + r.width / 2)) * strength
      dy = (e.clientY - (r.top + r.height / 2)) * strength
    }
    const onLeave = () => {
      dx = 0
      dy = 0
    }
    const loop = () => {
      tx += (dx - tx) * ease
      ty += (dy - ty) * ease
      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    loop()
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength, ease])
  return ref
}

/** Vertical parallax driven by the shared Lenis signal. `speed` ~ -0.3..0.3 */
export function useParallax(speed = 0.16) {
  const ref = useRef(null)
  const scroll = useScroll()
  useEffect(() => {
    const el = ref.current
    if (!el || !scroll?.subscribe || reduced()) return
    const update = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const off = r.top + r.height / 2 - vh / 2
      el.style.transform = `translate3d(0, ${(-off * speed).toFixed(2)}px, 0)`
    }
    update()
    return scroll.subscribe(update)
  }, [speed, scroll])
  return ref
}

/** Count up to a value once visible. Returns [ref, displayValue]. */
export function useCounter(target = 100, duration = 1800) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced()) {
      setVal(target)
      return
    }
    let raf
    let start
    let done = false
    const ease = (t) => 1 - Math.pow(1 - t, 4)
    const run = (ts) => {
      if (start == null) start = ts
      const p = Math.min(1, (ts - start) / duration)
      setVal(Math.round(ease(p) * target))
      if (p < 1) raf = requestAnimationFrame(run)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done) {
          done = true
          raf = requestAnimationFrame(run)
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [target, duration])
  return [ref, val]
}

/** Track scroll velocity (for marquee skew / direction). Returns a ref-mutating callback. */
export function useVelocity(onTick) {
  const scroll = useScroll()
  useEffect(() => {
    if (!scroll?.subscribe) return
    return scroll.subscribe(({ velocity }) => onTick(velocity || 0))
  }, [scroll, onTick])
}

/** Subtle 3D tilt toward the cursor. rAF runs only while interacting (perf). */
export function useTilt(max = 7) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || coarse() || reduced()) return
    let raf = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    const tick = () => {
      tx += (cx - tx) * 0.12
      ty += (cy - ty) * 0.12
      if (cx === 0 && cy === 0 && Math.abs(tx) < 0.04 && Math.abs(ty) < 0.04) {
        el.style.transform = '' // back at rest — drop the layer
        raf = 0
        return
      }
      el.style.transform = `perspective(900px) rotateX(${tx.toFixed(2)}deg) rotateY(${ty.toFixed(2)}deg)`
      if (Math.abs(cx - tx) > 0.01 || Math.abs(cy - ty) > 0.01) raf = requestAnimationFrame(tick)
      else raf = 0
    }
    const ensure = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      cx = (py - 0.5) * -2 * max
      cy = (px - 0.5) * 2 * max
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      el.classList.add('is-tilting')
      ensure()
    }
    const onLeave = () => {
      cx = 0
      cy = 0
      el.classList.remove('is-tilting')
      ensure()
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [max])
  return ref
}

export function useMediaQuery(query) {
  const [match, setMatch] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}
