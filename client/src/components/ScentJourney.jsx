import { useReveal } from '../lib/hooks.js'

// A perceptual curve of how the composition unfolds on skin — top fades fast,
// heart blooms, base lingers. Shape is tinted + scaled by the fragrance's wear.
const W = 620
const H = 220
const BASE = 174
const PAD = 12

const bump = (t, c, w, h) => h * Math.exp(-((t - c) * (t - c)) / (2 * w * w))

function phase(c, w, h) {
  const N = 64
  const pts = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = PAD + t * (W - 2 * PAD)
    const y = BASE - bump(t, c, w, h)
    pts.push([x, y])
  }
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `M${PAD},${BASE} ${pts.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} L${W - PAD},${BASE} Z`
  const peakX = PAD + c * (W - 2 * PAD)
  const peakY = BASE - bump(c, c, w, h)
  return { line, area, peakX, peakY }
}

export default function ScentJourney({ wear = {}, accent = '#c9a24b', notes = {} }) {
  const ref = useReveal()
  const { sillage = 3, longevity = 4, intensity = 3 } = wear

  const top = phase(0.12, 0.07, 64 + intensity * 14)
  const heart = phase(0.37, 0.12, 74 + intensity * 12)
  const base = phase(0.58 + longevity * 0.02, 0.13 + longevity * 0.028, 64 + sillage * 12)

  const head = (arr) => (arr && arr[0]) || ''
  const labels = [
    { x: top.peakX, y: top.peakY, t: 'Tête', n: head(notes.top) },
    { x: heart.peakX, y: heart.peakY, t: 'Cœur', n: head(notes.heart) },
    { x: base.peakX, y: base.peakY, t: 'Fond', n: head(notes.base) },
  ]

  return (
    <div className="journey reveal" ref={ref}>
      <div className="journey__head">
        <span className="eyebrow">The Evolution</span>
        <span className="journey__legend muted">First minutes → many hours on skin</span>
      </div>
      <svg className="journey__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="How the fragrance evolves over time">
        <defs>
          <linearGradient id="jgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.34" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} className="journey__base" />
        {[top, heart, base].map((p, i) => (
          <g className="journey__phase" style={{ '--i': i }} key={i}>
            <path d={p.area} fill="url(#jgrad)" opacity={0.5 + i * 0.16} />
            <path d={p.line} fill="none" stroke={accent} strokeWidth="1.4" strokeOpacity={0.55 + i * 0.18} />
            <circle cx={p.peakX} cy={p.peakY} r="3" fill={accent} />
          </g>
        ))}
      </svg>
      <div className="journey__labels">
        {labels.map((l) => (
          <span className="journey__label" key={l.t} style={{ left: `${(l.x / W) * 100}%` }}>
            <span className="journey__label-t">{l.t}</span>
            {l.n && <span className="journey__label-n muted">{l.n}</span>}
          </span>
        ))}
      </div>
      <div className="journey__axis muted">
        <span>Now</span>
        <span>1 h</span>
        <span>4 h</span>
        <span>8 h +</span>
      </div>
    </div>
  )
}
