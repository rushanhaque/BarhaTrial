import { useEffect, useRef } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'

// Thin progress hairline at the very top. Updated via ref (no React re-render).
export default function ScrollProgress() {
  const scroll = useScroll()
  const fill = useRef(null)
  useEffect(() => {
    if (!scroll?.subscribe) return
    const update = ({ scroll: y }) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 4 ? Math.min(1, Math.max(0, y / max)) : 0
      if (fill.current) fill.current.style.transform = `scaleX(${p.toFixed(4)})`
    }
    update({ scroll: window.scrollY })
    return scroll.subscribe(update)
  }, [scroll])
  return (
    <div className="scrollprog" aria-hidden="true">
      <span ref={fill} className="scrollprog__fill" />
    </div>
  )
}
