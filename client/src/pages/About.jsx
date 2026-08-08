import { useEffect, useState } from 'react'
import { get } from '../lib/api.js'
import { useParallax } from '../lib/hooks.js'
import { Reveal, Mask, Words } from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import Marquee from '../components/Marquee.jsx'
import { Quote, Star4 } from '../components/Icons.jsx'

const SEED = {
  milestones: [
    { year: '1982', title: 'The First Furnace', text: 'Barira Handicrafts is established in Moradabad with a single coal-fired brass casting furnace.' },
    { year: '1995', title: 'Global Export Begins', text: 'The first major container of cast iron and brass decor ships to a wholesaler in the UK.' },
    { year: '2004', title: 'Expansion to Copper & Aluminum', text: 'New facilities are acquired to support sheet metal spinning and advanced flame oxidation.' },
    { year: '2012', title: 'State-of-the-Art Plating', text: 'An in-house electroplating and powder coating facility is established to control finish quality.' },
    { year: '2018', title: 'Sustainable Operations', text: 'Transitioned to 40% solar power and implemented closed-loop water recycling for the plating plant.' },
    { year: '2025', title: 'Digital Catalogue Launch', text: 'Transitioning to a fully digital B2B ordering and cataloguing system.' },
  ],
  people: [
    { name: 'Tariq Hussain', role: 'Founder & Chairman', note: 'A third-generation metalworker who transitioned the family business from local markets to global exports.', initials: 'TH' },
    { name: 'Mustafa Ali', role: 'Master Craftsman, Brass', note: 'Specializes in traditional hand-hammering and sand casting. Over 30 years at the forge.', initials: 'MA' },
    { name: 'Zaid Hussain', role: 'Director of Finishing', note: 'Pioneered the flame-oxidation and patina techniques used in our premium copper lines.', initials: 'ZH' },
  ],
}

export default function About() {
  const [factory, setFactory] = useState(SEED)
  const haze = useParallax(0.1)

  useEffect(() => {
    get('/api/factory')
      .then((d) => setFactory({ milestones: d.milestones, people: d.people }))
      .catch(() => {})
  }, [])

  return (
    <div className="page page-maison">
      <header className="section maison__hero">
        <div className="maison__hero-haze" ref={haze} aria-hidden="true" />
        <div className="container">
          <Reveal className="maison__hero-eyebrow">
            <span className="eyebrow">The Factory · Moradabad, India</span>
          </Reveal>
          <h1 className="maison__hero-title">
            <Mask block i={0}>A legacy built</Mask>
            <Mask block i={1}>on <span className="italic gold">heavy metal</span>.</Mask>
          </h1>
          <Reveal as="p" className="lead maison__hero-lede" delay={2}>
            We are a premier manufacturing facility in the Brass City, forging premium export handicrafts the traditional way — 
            cast, hammered, and finished by the hands of master artisans.
          </Reveal>
        </div>
      </header>

      <section className="section maison__manifest">
        <div className="container maison__manifest-grid">
          <span className="eyebrow maison__manifest-label">Our Conviction</span>
          <Words
            as="p"
            className="maison__manifest-text"
            text="In an era of automated stamping and hollow cores, we remain committed to mass. A piece of decor should have gravity. We manufacture for the decades that follow, when the patina settles and the true quality of the casting reveals itself."
            stagger={0.8}
          />
        </div>
      </section>

      <Marquee items={['Pure Brass', 'Sand Casting', 'Moradabad', 'Export Quality', 'Hand Hammered']} duration={46} />

      <section className="section maison__timeline">
        <div className="container">
          <div className="maison__timeline-head">
            <span className="eyebrow">Heritage</span>
            <h2 className="serif">
              Four decades, <span className="italic gold">told in milestones</span>.
            </h2>
          </div>
          <div className="timeline">
            <span className="timeline__line" aria-hidden="true" />
            {factory.milestones.map((m, i) => (
              <Reveal as="div" className="tline" key={m.year} delay={i % 2}>
                <span className="tline__year serif">{m.year}</span>
                <span className="tline__dot" aria-hidden="true" />
                <div className="tline__body">
                  <h3 className="tline__title">{m.title}</h3>
                  <p className="muted">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section maison__quote">
        <div className="container container--narrow">
          <Reveal className="maison__quote-inner">
            <Quote className="maison__quote-mark" />
            <p className="serif maison__quote-text">
              A machine can replicate a shape a thousand times, but only a human hand can give it a soul.
            </p>
            <cite>— Tariq Hussain, on the factory floor</cite>
          </Reveal>
        </div>
      </section>

      <section className="section maison__people">
        <div className="container">
          <div className="maison__people-head">
            <span className="eyebrow">The Master Artisans</span>
            <h2 className="serif">The hands of the factory.</h2>
          </div>
          <div className="maison__people-grid">
            {factory.people.map((p, i) => (
              <Reveal as="article" className="person" key={p.name} delay={i}>
                <div className="bezel person__bezel">
                  <div className="bezel__core person__core">
                    <span className="person__monogram serif">{p.initials}</span>
                  </div>
                </div>
                <h3 className="person__name serif">{p.name}</h3>
                <span className="person__role gold">{p.role}</span>
                <p className="muted person__note">{p.note}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section maison__cta">
        <div className="container">
          <Reveal className="maison__cta-inner">
            <Star4 className="maison__cta-star" />
            <h2 className="maison__cta-title">
              Visit the factory <span className="italic gold">by appointment</span>.
            </h2>
            <div className="maison__cta-actions">
              <MagneticButton to="/contact" variant="primary" label="Request a visit" />
              <MagneticButton to="/collections" variant="ghost" label="Explore Collections" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
