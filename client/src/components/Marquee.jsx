import { useRef } from 'react'
import { useVelocity } from '../lib/hooks.js'

/**
 * Infinite marquee that skews with scroll velocity for a kinetic, hand-built feel.
 * Track translate is pure CSS; the velocity skew lives on a separate wrapper so the
 * two transforms never fight.
 */
export default function Marquee({ items = [], dir = 'normal', duration = 38, className = '' }) {
  const skRef = useRef(null)
  let raf = useRef(0)
  let target = useRef(0)
  let current = useRef(0)

  useVelocity((v) => {
    target.current = Math.max(-7, Math.min(7, v * 0.32))
    if (!raf.current) {
      const loop = () => {
        current.current += (target.current - current.current) * 0.12
        if (skRef.current) skRef.current.style.transform = `skewX(${current.current.toFixed(2)}deg)`
        if (Math.abs(target.current - current.current) > 0.01) {
          raf.current = requestAnimationFrame(loop)
        } else {
          raf.current = 0
        }
      }
      raf.current = requestAnimationFrame(loop)
    }
  })

  const seq = [...items, ...items]
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee__sk" ref={skRef}>
        <div className="marquee__track" style={{ '--marq-dur': `${duration}s`, '--marq-dir': dir }}>
          {seq.map((it, i) => (
            <span className={`marquee__item ${i % 2 ? 'marquee__item--ghost' : ''}`} key={i}>
              {it}
              <span className="dot" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
