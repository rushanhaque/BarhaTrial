import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onPointer } from '../lib/usePointer.js'

gsap.registerPlugin(ScrollTrigger)

const TAU = Math.PI * 2
const actives = new Set()
let boost = 1
export function setMeniscusBoost(v) { boost = v }

function blobD(t, amp, rot = 0) {
  const pts = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + rot
    const r = 0.462 + Math.sin(t + i * 1.7) * amp
    pts.push([0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r])
  }
  let d = `M${pts[0][0].toFixed(4)},${pts[0][1].toFixed(4)}`
  for (let i = 0; i < 8; i++) {
    const p0 = pts[(i + 7) % 8], p1 = pts[i], p2 = pts[(i + 1) % 8], p3 = pts[(i + 2) % 8]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${c1x.toFixed(4)},${c1y.toFixed(4)} ${c2x.toFixed(4)},${c2y.toFixed(4)} ${p2[0].toFixed(4)},${p2[1].toFixed(4)}`
  }
  return d + 'Z'
}

let tickerOn = false
let lastTickTime = 0
function ensureTicker() {
  if (tickerOn) return
  tickerOn = true
  lastTickTime = performance.now() / 1000
  gsap.ticker.add(() => {
    if (!actives.size) return
    const now = performance.now() / 1000
    const dt = Math.min(0.05, now - lastTickTime)
    lastTickTime = now
    let i = 0
    for (const m of actives) {
      if (i++ >= 4) break
      if (m.driven) {
        m.amp += (m.tAmp * boost - m.amp) * 0.18
        if (m.path) m.path.setAttribute('d', blobD(m.localT + m.phase, m.amp, m.localT * 0.32))
        continue
      }
      m.localT += dt
      m.amp += (m.tAmp * boost - m.amp) * 0.06
      m.spd += (m.tSpd - m.spd) * 0.06
      if (m.path) m.path.setAttribute('d', blobD(m.localT * m.spd + m.phase, m.amp))
    }
  })
}

let uid = 0

function warpRadii(px, py) {
  const base = 30, max = 54
  const tl = base + (1 - px) * (1 - py) * (max - base)
  const tr = base + px * (1 - py) * (max - base)
  const br = base + px * py * (max - base)
  const bl = base + (1 - px) * py * (max - base)
  return `${tl.toFixed(0)}px ${tr.toFixed(0)}px ${br.toFixed(0)}px ${bl.toFixed(0)}px`
}

const Slab = forwardRef(function Slab(
  { tone = 'brass', label, meta, ratio = '16/10', blob = false, bead = false, warp = true, quietHover = false, img, alt = '', className = '', children },
  fref
) {
  const id = useMemo(() => `men-${++uid}`, [])
  // Hardcode reduced() check to false for now, since it wasn't brought over, or rely on window.matchMedia if needed
  const still = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  const useBlob = blob && !still
  const root = useRef(null)
  const core = useRef(null)
  const pathRef = useRef(null)
  const beadRef = useRef(null)
  const rec = useRef(null)
  const unSub = useRef(null)
  const beadEnd = useRef(false)

  useEffect(() => {
    if (!useBlob) return
    ensureTicker()
    const m = {
      path: pathRef.current,
      amp: 0.012, tAmp: 0.012,
      spd: 0.55, tSpd: 0.55,
      localT: 0,
      driven: false,
      phase: Math.random() * TAU,
    }
    rec.current = m
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'bottom top',
      onToggle(self) { self.isActive ? actives.add(m) : actives.delete(m) },
    })
    return () => { st.kill(); actives.delete(m) }
  }, [useBlob])

  useImperativeHandle(fref, () => ({
    setEdge(a, s) {
      if (rec.current) { rec.current.tAmp = a; rec.current.tSpd = s }
    },
    setPhase(v) {
      const m = rec.current
      if (!m || !m.path) return
      m.driven = true
      m.localT = v
      m.amp += (m.tAmp * boost - m.amp) * 0.25
      m.path.setAttribute('d', blobD(m.localT + m.phase, m.amp, m.localT * 0.32))
    },
    setSpin() {},
    el: root,
  }))

  function enter() {
    if (still) return
    if (rec.current) {
      if (!quietHover) { rec.current.tAmp = 0.026; rec.current.tSpd = 1.3 }
    }
    else if (warp) {
      gsap.to(root.current, { scale: 1.015, duration: 0.5, ease: 'power2.out' })
      const r = root.current.getBoundingClientRect()
      const rx = gsap.quickTo(root.current, 'rotationX', { duration: 0.55, ease: 'power2.out' })
      const ry = gsap.quickTo(root.current, 'rotationY', { duration: 0.55, ease: 'power2.out' })
      gsap.set(root.current, { transformPerspective: 750 })
      unSub.current = onPointer((p) => {
        const px = gsap.utils.clamp(0, 1, (p.x - r.left) / r.width)
        const py = gsap.utils.clamp(0, 1, (p.y - r.top) / r.height)
        core.current.style.borderRadius = warpRadii(px, py)
        rx((0.5 - py) * 6)
        ry((px - 0.5) * 6)
      })
    }
    if (bead && beadRef.current) {
      const w = root.current.offsetWidth - 26
      const h = root.current.offsetHeight - 26
      const fwd = !beadEnd.current
      beadEnd.current = fwd
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      if (fwd) tl.to(beadRef.current, { x: w, duration: 0.3 }).to(beadRef.current, { y: h, duration: 0.26 })
      else tl.to(beadRef.current, { x: 0, duration: 0.3 }).to(beadRef.current, { y: 0, duration: 0.26 })
    }
  }
  function leave() {
    if (still) return
    if (rec.current) {
      if (!quietHover) { rec.current.tAmp = 0.012; rec.current.tSpd = 0.55 }
    }
    else if (warp) {
      gsap.to(root.current, { scale: 1, rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power2.out' })
      if (unSub.current) { unSub.current(); unSub.current = null }
      gsap.to(core.current, { borderRadius: '34px', duration: 0.45, ease: 'power2.out', clearProps: 'borderRadius' })
    }
  }
  useEffect(() => () => { if (unSub.current) unSub.current() }, [])

  return (
    <div
      ref={root}
      className={`slab tone-${tone} ${useBlob ? 'has-blob' : ''} ${img ? 'has-img' : ''} ${className}`}
      style={{ aspectRatio: ratio }}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      {useBlob && (
        <svg className="slab-svg" aria-hidden="true">
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            <path ref={pathRef} d={blobD(0, 0.012)} />
          </clipPath>
        </svg>
      )}
      <div
        ref={core}
        className="slab-core"
        style={useBlob ? { clipPath: `url(#${id})`, WebkitClipPath: `url(#${id})` } : undefined}
      >
        {img && (
          <img
            className="slab-img"
            src={img}
            alt={alt}
            loading="lazy"
            decoding="async"
            aria-hidden={alt ? undefined : 'true'}
          />
        )}
        <span className="slab-sheen" aria-hidden="true"><span className="slab-sheen-i" /></span>
        {label && (
          <span className="slab-label meta">
            <span className="sl-i"><span>{label}</span><span aria-hidden="true">{label}</span></span>
          </span>
        )}
        {meta && <span className="slab-tag meta">{meta}</span>}
        {children}
      </div>
      {bead && <span ref={beadRef} className="bead" aria-hidden="true" />}
    </div>
  )
})

export default Slab
