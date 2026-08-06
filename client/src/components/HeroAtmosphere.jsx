import { useEffect, useRef } from 'react'

// Drifting luminous motes — the last light of the blue hour. Sprite-based and
// composited with 'lighter' for cheap glow; paused when offscreen or tab hidden.
export default function HeroAtmosphere() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let visible = true
    const motes = []

    // soft mote sprite
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 64
    const sctx = sprite.getContext('2d')
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(231, 197, 122, 0.9)')
    grad.addColorStop(1, 'rgba(231, 197, 122, 0)')
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 64, 64)

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(16, Math.min(48, Math.round((w * h) / 26000)))
      motes.length = 0
      for (let i = 0; i < n; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 6 + Math.random() * 26,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.06 - Math.random() * 0.16,
          a: 0.05 + Math.random() * 0.16,
          ph: Math.random() * Math.PI * 2,
        })
      }
    }

    const draw = (time) => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
        if (m.y < -40) { m.y = h + 40; m.x = Math.random() * w }
        if (m.x < -40) m.x = w + 40
        else if (m.x > w + 40) m.x = -40
        const s = m.r * 2
        ctx.globalAlpha = m.a * (0.65 + 0.35 * Math.sin(time * 0.0011 + m.ph))
        ctx.drawImage(sprite, m.x - m.r, m.y - m.r, s, s)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }
    const start = () => { if (!raf && visible) raf = requestAnimationFrame(draw) }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }

    resize()
    start()

    const onResize = () => resize()
    const onVis = () => { document.hidden ? stop() : start() }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)
    const io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; visible ? start() : stop() },
      { threshold: 0 }
    )
    io.observe(canvas)

    return () => {
      stop()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="hero__canvas" aria-hidden="true" />
}
