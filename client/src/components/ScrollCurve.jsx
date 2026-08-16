import { useEffect, useRef } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'
import './ScrollCurve.css'

export default function ScrollCurve() {
  const scroll = useScroll()
  const pathRef = useRef(null)
  const dotRef = useRef(null)
  const haloRef = useRef(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const update = () => {
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
      const totalScroll = docHeight - window.innerHeight
      if (totalScroll <= 0) return

      const current = scroll?.lenis?.scroll ?? window.scrollY ?? 0
      const p = Math.min(1, Math.max(0, current / totalScroll))

      try {
        const len = path.getTotalLength()
        const pt = path.getPointAtLength(p * len)
        // Direct DOM write — zero React re-renders
        if (dotRef.current) {
          dotRef.current.setAttribute('cx', pt.x)
          dotRef.current.setAttribute('cy', pt.y)
        }
        if (haloRef.current) {
          haloRef.current.setAttribute('cx', pt.x)
          haloRef.current.setAttribute('cy', pt.y)
        }
      } catch (_) {}
    }

    update()
    const unsub = scroll?.subscribe(update)
    window.addEventListener('resize', update, { passive: true })
    return () => {
      unsub?.()
      window.removeEventListener('resize', update)
    }
  }, [scroll])

  // Viewbox 0 0 100 1000 smooth wavy curve along right viewport edge
  const pathD = "M 60 0 C 15 250, 95 500, 50 750 C 20 875, 70 950, 60 1000"

  return (
    <aside className="scroll-curve-wrap" aria-hidden="true">
      <svg
        className="scroll-curve-svg"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="themeCurveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b2d5e5" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#b2d5e5" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#b2d5e5" stopOpacity="0.3" />
          </linearGradient>

          <filter id="dotGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dynamic Curved Path */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="url(#themeCurveGrad)"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />

        {/* Outer Light Halo Ring */}
        <circle
          ref={haloRef}
          cx="60"
          cy="0"
          r="14"
          fill="rgba(178, 213, 229, 0.45)"
          filter="url(#dotGlowFilter)"
        />

        {/* Inner Ball */}
        <circle
          ref={dotRef}
          cx="60"
          cy="0"
          r="5.5"
          fill="#000000"
          stroke="#b2d5e5"
          strokeWidth="2.5"
        />
      </svg>
    </aside>
  )
}
