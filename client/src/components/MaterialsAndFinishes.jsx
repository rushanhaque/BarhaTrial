import { useEffect, useRef } from 'react'
import { useScroll } from '../lib/SmoothScroll.jsx'

const MATERIALS_CARDS = [
  { id: 'brass', num: '01', name: 'BRASS', image: '/images/Brass.jpeg' },
  { id: 'copper', num: '02', name: 'COPPER', image: '/images/Copper.jpeg' },
  { id: 'aluminium', num: '03', name: 'ALUMINIUM', image: '/images/Aluminium.jpeg' },
  { id: 'steel', num: '04', name: 'STEEL', image: '/images/Steel.jpeg' },
  { id: 'iron', num: '05', name: 'IRON', image: '/images/Iron.jpeg' },
  { id: 'glass', num: '06', name: 'GLASS', image: '/images/Glass.jpeg' },
  { id: 'ceramic', num: '07', name: 'CERAMIC', image: '/images/Ceramic.jpeg' },
  { id: 'wood', num: '08', name: 'WOOD', image: '/images/Wood.jpeg' }
]

export default function MaterialsAndFinishes() {
  const scroll = useScroll()
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    if (!scroll?.subscribe) return

    const update = () => {
      if (window.innerWidth <= 768) return

      const sec = sectionRef.current
      const track = trackRef.current
      if (!sec || !track) return

      const rect = sec.getBoundingClientRect()
      const totalScroll = sec.offsetHeight - window.innerHeight
      if (totalScroll <= 0) return

      const currentScroll = -rect.top
      const p = Math.max(0, Math.min(1, currentScroll / totalScroll))

      const maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth + 120)
      track.style.transform = `translate3d(-${p * maxTranslate}px, 0, 0)`
    }

    return scroll.subscribe(update)
  }, [scroll])

  return (
    <section className="materials-hsection" ref={sectionRef}>
      <div className="materials-hsection__sticky">
        <div className="container materials-hsection__head" style={{ textAlign: 'center' }}>
          <h2 className="section-heading-unified" style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)' }}>
            MATERIALS & FINISHES
          </h2>
        </div>

        <div className="materials-hsection__viewport" data-lenis-prevent>
          <div className="materials-hsection__track" ref={trackRef}>
            {MATERIALS_CARDS.map((card) => (
              <div key={card.id} className="mcard-plate">
                <img src={card.image} alt={card.name} className="mcard-plate__img mcard-plate__img--base" />
                <div className="mcard-plate__wipe-layer">
                  <img src={card.image} alt="" className="mcard-plate__img mcard-plate__img--vivid" />
                </div>
                <div className="mcard-plate__frame" />
                <div className="mcard-plate__overlay" />
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
