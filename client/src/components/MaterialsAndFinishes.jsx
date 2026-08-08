import { useEffect, useRef, useState } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { Reveal, Mask } from './Reveal.jsx'

const MATERIALS_CARDS = [
  { id: 'solid-brass', num: '01', name: 'SOLID BRASS', image: '/images/brass_macro.png' },
  { id: 'cast-iron', num: '02', name: 'CAST IRON', image: '/images/cast_iron_macro_2.jpg' },
  { id: 'raw-copper', num: '03', name: 'RAW COPPER', image: '/images/copper_macro.png' },
  { id: 'hand-hammered', num: '04', name: 'HAND HAMMERED', image: '/images/hammered_macro.jpg' },
  { id: 'mirror-polish', num: '05', name: 'MIRROR POLISH', image: '/images/polished_macro.jpg' },
  { id: 'flame-oxidized', num: '06', name: 'FLAME OXIDIZED', image: '/images/oxidized_macro.jpg' }
]

export default function MaterialsAndFinishes() {
  const scroll = useScroll()
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!scroll?.subscribe) return

    return scroll.subscribe(() => {
      const sec = sectionRef.current
      const track = trackRef.current
      if (!sec || !track) return

      const rect = sec.getBoundingClientRect()
      const totalScroll = sec.offsetHeight - window.innerHeight
      if (totalScroll <= 0) return

      const currentScroll = -rect.top
      const p = Math.max(0, Math.min(1, currentScroll / totalScroll))
      setProgress(p)
    })
  }, [scroll])

  const maxScroll = trackRef.current ? Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 120) : 0
  const translateX = progress * maxScroll

  return (
    <section className="materials-hsection" ref={sectionRef}>
      <div className="materials-hsection__sticky">
        {/* Top Floating Header */}
        <div className="container materials-hsection__head" style={{ textAlign: 'center' }}>
          <h2 className="section-heading-unified" style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)' }}>
            MATERIALS & FINISHES
          </h2>
        </div>

        {/* Sideways Scrolling Track of 4:5 Photo Cards */}
        <div className="materials-hsection__viewport">
          <div
            className="materials-hsection__track"
            ref={trackRef}
            style={{ transform: `translate3d(-${translateX}px, 0, 0)` }}
          >
            {MATERIALS_CARDS.map((card) => (
              <div key={card.id} className="mcard-plate">
                {/* Photo Layer 1 (Base Grayscale / Subtle Darkened Metal) */}
                <img src={card.image} alt={card.name} className="mcard-plate__img mcard-plate__img--base" />

                {/* Photo Layer 2 (Molten Light Diagonal Wipe Shimmer) */}
                <div className="mcard-plate__wipe-layer">
                  <img src={card.image} alt="" className="mcard-plate__img mcard-plate__img--vivid" />
                </div>

                {/* Precision Corner Frame Brackets */}
                <div className="mcard-plate__frame" />

                <div className="mcard-plate__overlay" />

                {/* Typography Overlay */}
                <div className="mcard-plate__caption">
                  <span className="mcard-plate__num">{card.num}</span>
                  <div className="mcard-plate__name-wrap">
                    <h3 className="mcard-plate__name mcard-plate__name--stroke">{card.name}</h3>
                    <h3 className="mcard-plate__name mcard-plate__name--fill">{card.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
