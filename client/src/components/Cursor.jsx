import { useEffect, useRef, useState } from 'react'

const HOVER_SEL = 'a, button, [data-cursor], input, textarea, select, label'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [label, setLabel] = useState('')
  const state = useRef({ mx: 0, my: 0, rx: 0, ry: 0, scale: 1, down: false })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const s = state.current
    const dot = dotRef.current
    const ring = ringRef.current
    let raf

    const onMove = (e) => {
      s.mx = e.clientX
      s.my = e.clientY
      if (dot) dot.style.transform = `translate(${s.mx}px, ${s.my}px) translate(-50%, -50%)`
    }
    const onOver = (e) => {
      const hit = e.target.closest?.(HOVER_SEL)
      ring.classList.toggle('is-hover', !!hit)
      const lbl = e.target.closest?.('[data-cursor-label]')
      const text = lbl?.getAttribute('data-cursor-label') || ''
      setLabel(text)
      ring.classList.toggle('is-label', !!text)
    }
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    const loop = () => {
      s.rx += (s.mx - s.rx) * 0.17
      s.ry += (s.my - s.ry) * 0.17
      ring.style.transform = `translate(${s.rx}px, ${s.ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div className="cursor-root" aria-hidden="true">
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef}>
        <span className="cursor-label">{label}</span>
      </div>
    </div>
  )
}
