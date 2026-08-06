import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { ArrowUp } from './Icons.jsx'

// Appears past ~1.4 viewports. Visibility toggled via ref to avoid re-renders.
export default function BackToTop() {
  const scroll = useScroll()
  const ref = useRef(null)
  const shown = useRef(false)
  const { pathname } = useLocation()
  // Discovery has its own bottom action bar — avoid overlap.
  const hidden = pathname === '/discovery'

  useEffect(() => {
    if (!scroll?.subscribe || hidden) return
    return scroll.subscribe(({ scroll: y }) => {
      const should = y > window.innerHeight * 1.4
      if (should !== shown.current) {
        shown.current = should
        ref.current?.classList.toggle('is-on', should)
      }
    })
  }, [scroll, hidden])

  if (hidden) return null
  return (
    <button
      ref={ref}
      className="backtotop"
      onClick={() => scroll?.scrollTo?.(0, { duration: 1.4 })}
      aria-label="Back to top"
      data-cursor-label="To the top"
    >
      <ArrowUp />
    </button>
  )
}
