import { useState } from 'react'

const steps = [
  {
    id: 'mold',
    title: 'The Sand Mold',
    desc: 'Each piece begins as an impression in tightly packed, fine black sand, a technique unchanged for centuries.',
    image: '/images/foundry_sand_mold.webp',
  },
  {
    id: 'pour',
    title: 'The Pour',
    desc: 'Molten brass, superheated to 1000°C, is poured by hand into the molds, taking on its first raw form.',
    image: '/images/foundry_pour.webp',
  },
  {
    id: 'hammer',
    title: 'The Forging',
    desc: 'The cooled metal is meticulously hammered and shaped by master artisans to build character and strength.',
    image: '/images/foundry_forging.webp',
  },
  {
    id: 'polish',
    title: 'The Refinement',
    desc: 'Hours on the buffing wheel reveal the true luster of the metal, finishing the piece to mirror-like perfection.',
    image: '/images/foundry_refinement.webp',
  },
  {
    id: 'patina',
    title: 'The Patina',
    desc: 'Specialized techniques and natural oxidation are applied by hand to give each piece its distinct, antique character.',
    image: '/images/foundry_patina.webp',
  },
]

export default function FoundryProcess() {
  const [active, setActive] = useState(null)

  return (
    <section className="foundry-process">
      <div className="container foundry-process__head">
        <span className="eyebrow">The Foundry Process</span>
        <h2 className="foundry-process__title">
          From earth and fire, <span className="italic gold">to timeless form</span>.
        </h2>
      </div>

      <div className="foundry-process__accordion" onMouseLeave={() => setActive(null)}>
        {steps.map((step, idx) => {
          const isActive = active === idx
          return (
            <div
              key={step.id}
              className={`foundry-panel ${isActive ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(idx)}
              onTouchStart={() => setActive(idx)}
            >
              <img src={step.image} alt={step.title} className="foundry-panel__img" />
              <div className="foundry-panel__overlay" />
              
              <div className="foundry-panel__content">
                <div className="foundry-panel__header">
                  <span className="foundry-panel__num">0{idx + 1}</span>
                  <h3 className="foundry-panel__heading serif">{step.title}</h3>
                </div>
                <div className="foundry-panel__body">
                  <p className="muted">{step.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
