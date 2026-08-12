import { useEffect, useRef, useState } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'
import './ScrollCurve.css'

export default function ScrollCurve() {
  const scroll = useScroll()
  const pathRef = useRef(null)
  const [dotPos, setDotPos] = useState({ x: 60, y: 0, progress: 0 })

  useEffect(() => {
    const updateProgress = () => {
      const path = pathRef.current
      if (!path) return

      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      )
      const totalScroll = docHeight - window.innerHeight
      if (totalScroll <= 0) return

      let current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
      if (scroll?.lenis?.scroll !== undefined) {
        current = scroll.lenis.scroll
      }

      const rawProgress = Math.min(1, Math.max(0, current / totalScroll))

      try {
        const totalLength = path.getTotalLength()
        const pt = path.getPointAtLength(rawProgress * totalLength)
        setDotPos({
          x: pt.x,
          y: pt.y,
          progress: rawProgress
        })
      } catch (err) {
        setDotPos(prev => ({ ...prev, progress: rawProgress }))
      }
    }

    updateProgress()

    const handleAnimFrame = () => {
      updateProgress()
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })
    const unsub = scroll?.subscribe(updateProgress)

    // Interval fallback to guarantee high-frequency animation tracking
    const timer = setInterval(updateProgress, 30)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      unsub?.()
      clearInterval(timer)
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

        {/* Outer Light Halo Ring (Matching Strip Line Color) */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="14"
          fill="rgba(178, 213, 229, 0.45)"
          filter="url(#dotGlowFilter)"
        />

        {/* Inner Black Ball with Outline Matching Strip Line Color */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="5.5"
          fill="#000000"
          stroke="#b2d5e5"
          strokeWidth="2.5"
        />
      </svg>
    </aside>
  )
}
