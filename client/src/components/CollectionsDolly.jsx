import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Slab from './Slab.jsx'
import TLink from './TLink.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function CollectionsDolly({ categories }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const stage = root.querySelector('.cd-stage')
      const layers = gsap.utils.toArray(root.querySelectorAll('.cd-layer'))
      const hazes = gsap.utils.toArray(root.querySelectorAll('.cd-haze'))
      const end = root.querySelector('.cd-end')
      const N = layers.length

      /* initial depth stack: nearest (i=0) at scale 1, deeper ones smaller & dim */
      layers.forEach((l, i) => {
        gsap.set(l, {
          scale: 1 / (1 + i * 0.42),
          opacity: i === 0 ? 1 : Math.max(0.25, 1 - i * 0.22),
          zIndex: 2 * (N - i),
          pointerEvents: i === 0 ? 'auto' : 'none',
        })
      })
      gsap.set(hazes, { opacity: (i) => 0.35 + i * 0.18, zIndex: (i) => 2 * (N - i) - 1 })
      gsap.set(end, { opacity: 0, zIndex: 2 * N + 2, pointerEvents: 'none' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          pin: true,
          scrub: 0.7,
          start: 'top top',
          end: '+=3200',
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      const SEG = 1
      layers.forEach((l, i) => {
        const t = i * SEG
        const dir = i % 2 ? 1 : -1
        /* the passing layer: swells past camera, drops zIndex to 0 and pointerEvents to none */
        tl.to(l, {
          scale: 2.35,
          xPercent: dir * 46,
          yPercent: -12,
          opacity: 0,
          zIndex: 0,
          pointerEvents: 'none',
          duration: SEG * 0.9,
          ease: 'power1.in',
        }, t)
        /* every layer behind steps one slot closer */
        for (let j = i + 1; j < N; j++) {
          const depth = j - (i + 1)
          tl.to(layers[j], {
            scale: 1 / (1 + depth * 0.42),
            opacity: depth === 0 ? 1 : Math.max(0.25, 1 - depth * 0.22),
            pointerEvents: depth === 0 ? 'auto' : 'none',
            duration: SEG * 0.9,
            ease: 'power1.inOut',
          }, t)
        }
        /* haze sheet i thins as we push through it */
        if (hazes[i]) {
          tl.to(hazes[i], { opacity: 0, duration: SEG * 0.7, ease: 'none' }, t + SEG * 0.1)
        }
      })
      /* the alley's end */
      tl.to(end, { opacity: 1, pointerEvents: 'auto', duration: SEG * 0.8, ease: 'power1.out' }, (N - 1) * SEG + 0.3)

      return () => tl.scrollTrigger?.kill()
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="cd" style={{ padding: 0, margin: 0 }} ref={rootRef}>
      {/* pinned dolly — ≥900px, motion-ok */}
      <div className="cd-stage only-cd">
        {categories.map((c, i) => {
          return (
            <div className="cd-layer" key={c.slug}>
              <TLink
                className="cd-facade"
                to={`/category/${c.slug}`}
                aria-label={`Open the ${c.name} category`}
              >
                <span className="cd-tag" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <Slab 
                  tone="brass" 
                  label={c.name.toUpperCase()} 
                  ratio="16/10" 
                  bead={false} 
                  warp={false} 
                  quietHover={true}
                  img={c.image} 
                  alt={c.name} 
                />
              </TLink>
            </div>
          )
        })}
        {[0, 1, 2].map((i) => <div className="cd-haze" key={i} aria-hidden="true" />)}
        <div className="cd-end">
          <span className="meta cd-end-kicker">The end of the line — the start of the piece.</span>
          <h2 className="d1 serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>The foundry is open.</h2>
          <p className="lede" style={{ maxWidth: '48ch' }}>
            Bespoke sits past the last collection. Send a drawing, a photograph or a
            sample — a priced quote returns in five working days.
          </p>
          <div className="cd-end-ctas">
            <TLink to="/contact" className="btn" style={{ background: 'var(--gold)', color: '#000', padding: '0.8rem 1.6rem', borderRadius: '4px', border: 'none', fontWeight: '500' }}>Connect</TLink>
          </div>
        </div>
      </div>

      {/* fallback — stacked cards for mobile / reduced motion */}
      <div className="wrap only-fallback" style={{ padding: '0 2rem' }}>
        <div className="cd-fallback">
          {categories.map((c, i) => (
            <TLink
              key={c.slug}
              className="cd-fallback-cell"
              to={`/category/${c.slug}`}
              aria-label={`Open the ${c.name} collection`}
            >
              <Slab 
                tone="brass" 
                label={c.name.toUpperCase()} 
                ratio="16/10" 
                bead={false} 
                warp={false} 
                quietHover={true}
                img={c.image} 
                alt={c.name} 
              />
            </TLink>
          ))}
        </div>
        <div className="cd-end-fallback" style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '3rem' }}>
          <h2 className="d2 serif" style={{ fontSize: '2rem', marginBottom: '1rem' }}>The foundry is open.</h2>
          <p className="lede">Bespoke sits past the last collection — described in a drawing you send.</p>
          <div className="cd-end-ctas" style={{ marginTop: '1.5rem' }}>
            <TLink to="/contact" className="btn" style={{ background: 'var(--gold)', color: '#000', padding: '0.8rem 1.6rem', borderRadius: '4px', border: 'none', fontWeight: '500' }}>Connect</TLink>
          </div>
        </div>
      </div>
    </section>
  )
}
