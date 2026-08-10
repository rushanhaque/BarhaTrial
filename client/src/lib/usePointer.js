import { gsap } from 'gsap'

export const pointer = { x: 0, y: 0, moved: false }
const subs = new Set()
let started = false
let vw = typeof window !== 'undefined' ? window.innerWidth : 1200

export function startPointer() {
  if (started || typeof window === 'undefined') return
  started = true
  pointer.x = vw / 2
  pointer.y = window.innerHeight / 2
  window.addEventListener('resize', () => { vw = window.innerWidth }, { passive: true })
  window.addEventListener(
    'mousemove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.moved = true
    },
    { passive: true }
  )
  gsap.ticker.add(() => {
    if (pointer.moved) {
      pointer.moved = false
      const nx = pointer.x / vw - 0.5
      document.documentElement.style.setProperty('--sheen-x', (nx * 8).toFixed(2) + '%')
    }
    subs.forEach((f) => f(pointer))
  })
}

export const onPointer = (f) => {
  startPointer()
  subs.add(f)
  return () => subs.delete(f)
}
