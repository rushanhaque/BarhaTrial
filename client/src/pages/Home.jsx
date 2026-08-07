import { useEffect, useRef, useState } from 'react'
import { get } from '../lib/api.js'
import { fallbackProducts } from '../data/fallback.js'
import { useParallax, useReveal, useCounter, useTilt } from '../lib/hooks.js'

import { Reveal, Mask, Words } from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import Marquee from '../components/Marquee.jsx'
import HorizontalLibrary from '../components/HorizontalLibrary.jsx'
import FoundryProcess from '../components/FoundryProcess.jsx'
import ChromaticPlate from '../components/ChromaticPlate.jsx'
import Beams from '../components/Beams.jsx'
import RecentlyViewed from '../components/RecentlyViewed.jsx'
import ShinyText from '../components/ShinyText.jsx'
import TLink from '../components/TLink.jsx'
import { ArrowUR, ArrowDown, Drop, Star4, Quote } from '../components/Icons.jsx'

export default function Home({ entered }) {
  const [products, setProducts] = useState(fallbackProducts)
  const [journal, setJournal] = useState([])

  useEffect(() => {
    get('/api/products').then(setProducts).catch(() => { })
    get('/api/journal').then((j) => setJournal(j.slice(0, 3))).catch(() => { })
  }, [])

  const signature = products.find((p) => p.signature) || products[0]

  return (
    <>
      <Hero entered={entered} />

      <Marquee
        className="home-marquee"
        items={['Premium Handicrafts', 'Export Quality', 'Manufactured in Moradabad', 'Cast Iron & Brass', 'Barira Handicrafts']}
        duration={42}
      />

      <Manifesto />

      <HorizontalLibrary items={products} />

      {signature && <Signature product={signature} />}

      <Philosophy />

      <RecentlyViewed title="Recently viewed items" />

      <FoundryProcess />

      <CustomManufacturingBand />

      {journal.length > 0 && <JournalTeaser items={journal} />}
    </>
  )
}

/* ───────────────────────── Hero (Landing Section) ───────────────────────── */
function Hero({ entered }) {
  return (
    <section className={`hero hero--centered ${entered ? 'is-entered' : ''}`}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#85e0ff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>

      <div className="hero__center-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="hero__brand-title">
          Barira Handicrafts
        </h1>
      </div>

      <div className="hero__scroll">
        <span>Scroll to explore</span>
        <ArrowDown className="hero__scroll-icon" />
      </div>
    </section>
  )
}

/* ──────────────────────── Manifesto + stats ─────────────────────── */
function Manifesto() {
  return (
    <section className="section section--flush-top manifesto">
      <div className="container">
        <Reveal className="manifesto__eyebrow">
          <span className="eyebrow">The Factory</span>
        </Reveal>
        <Words
          as="h2"
          className="manifesto__statement"
          text="We do not compromise on mass. We manufacture for the decades that follow — using pure metals and traditional casting techniques where a product finally proves its worth."
          stagger={1}
        />
        <div className="manifesto__row">
          <Reveal as="p" className="manifesto__body muted" delay={1}>
            Barira Handicrafts was founded with a single coal-fired brass furnace in Moradabad.
            Today, every piece is still finished by hand, utilizing techniques passed down through
            generations of master artisans.
          </Reveal>
          <div className="manifesto__stats">
            <StatBlock value="1982" label="Factory Established" />
            <StatBlock target={45} prefix="+" label="Export Countries" />
            <StatBlock target={200} prefix="over " label="Master Artisans" />
            <StatBlock target={100} suffix="%" label="Quality Inspected" />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatBlock({ value, target, prefix = '', suffix = '', label }) {
  const [ref, n] = useCounter(target || 0)
  const reveal = useReveal()
  return (
    <div className="stat reveal" ref={reveal}>
      <span className="stat__value serif" ref={target ? ref : null}>
        {target ? `${prefix}${n}${suffix}` : value}
      </span>
      <span className="stat__label">{label}</span>
    </div>
  )
}

/* ──────────────────────── Signature spotlight ─────────────────────── */
function Signature({ product }) {
  const plate = useParallax(-0.05)
  return (
    <section className="section signature">
      <div className="container signature__grid">
        <div className="signature__visual">
          <div ref={plate} className="signature__plate-wrap">
            <div style={{ position: 'relative' }}>
              <img 
                src={product.image} 
                alt={product.name} 
                className="signature__img" 
              />
            </div>
          </div>
        </div>

        <div className="signature__body">
          <span className="eyebrow">Featured Product</span>
          <h2 className="signature__name">
            <Mask block i={0}>
              <ShinyText text={product.name} speed={3} color="var(--bone)" shineColor="#85e0ff" />
            </Mask>
          </h2>
          <Reveal as="p" className="signature__fam gold" delay={1}>
            {product.family} · Premium Handicraft
          </Reveal>
          <Reveal as="p" className="lead signature__lede" delay={2}>
            {product.tagline} {product.blurb}
          </Reveal>

          <ul className="signature__notes">
            {[
              { k: 'Primary Material', v: 'Solid Brass Sheet' },
              { k: 'Manufacturing', v: 'Hand Hammered' },
              { k: 'Finish', v: 'Antique Unlacquered' },
            ].map((row, i) => (
              <Reveal as="li" key={row.k} className="signature__note" delay={i}>
                <span className="signature__note-k">{row.k}</span>
                <span className="signature__note-v">{row.v}</span>
              </Reveal>
            ))}
          </ul>

          <div className="signature__cta">
            <MagneticButton to={`/product/${product.slug}`} variant="gold" label={`View Details`} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────── Philosophy / chromatic concept ─────────────────────── */
function Philosophy() {
  const quoteRef = useReveal()
  return (
    <section className="section philosophy">
      <div className="container philosophy__grid">
        <div className="philosophy__head">
          <span className="eyebrow">The Alchemy of Metal</span>
          <h2 className="philosophy__title">
            <Mask block i={0}>A form has no color</Mask>
            <Mask block i={1}>until it meets the <span className="italic gold">fire</span>.</Mask>
          </h2>
        </div>
        <div className="philosophy__text">
          <Reveal as="p" className="lead" delay={0}>
            Instead of simply photographing a silhouette, we assign every piece a
            <em> chromatic signature</em> — a single living color gradient, drawn directly from
            its thermal oxidation, patina, or polished finish.
          </Reveal>
          <Reveal as="p" className="muted philosophy__p" delay={1}>
            It is how we ask you to understand our materials: through light and heat.
            The golden warmth of the Aurelia Brass. The deep iridescence of flame-oxidized Copper.
            The stark, cold shadow of matte iron. The finish is the only honest portrait of the metal.
          </Reveal>

          <blockquote className="philosophy__quote reveal" ref={quoteRef}>
            <Quote className="philosophy__quote-mark" />
            <p className="serif">
              “True craftsmanship leaves a mark. Whether it's the strike of a hammer or the wash of a flame, the metal remembers.”
            </p>
            <cite>— Tariq Hussain, Founder</cite>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────── Custom Orders CTA band ─────────────────────── */
function CustomManufacturingBand() {
  const ref = useReveal()
  return (
    <section className="section atelier-band">
      <div className="container">
        <div className="atelier-band__inner reveal" ref={ref}>
          <div className="atelier-band__glow" aria-hidden="true" />
          <div className="atelier-band__content">
            <span className="eyebrow eyebrow--bare">Bespoke Production</span>
            <h2 className="atelier-band__title">
              Let the factory build <span className="italic gold">your</span> vision.
            </h2>
            <p className="lead muted">
              Submit your materials, finishes, and design requirements for a rapid B2B prototyping consultation. No intermediaries, direct to manufacture.
            </p>
            <MagneticButton to="/custom-orders" variant="primary" label="Inquire for Custom Manufacturing" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────── Journal teaser ─────────────────────── */
function JournalTeaser({ items }) {
  return (
    <section className="section journal-teaser">
      <div className="container">
        <div className="journal-teaser__head">
          <span className="eyebrow">The Blog</span>
          <TLink to="/blog" className="journal-teaser__all ulink">
            All articles <ArrowUR />
          </TLink>
        </div>
        <div className="journal-teaser__list">
          {items.map((a, i) => (
            <Reveal
              as={TLink}
              key={a.slug}
              to="/blog"
              className="jrow"
              delay={i}
              data-cursor-label="Read"
            >
              <span className="jrow__index">{String(i + 1).padStart(2, '0')}</span>
              <span className="jrow__kicker" style={{ color: a.accent }}>
                {a.kicker}
              </span>
              <span className="jrow__title serif">{a.title}</span>
              <span className="jrow__meta muted">
                {a.readingTime} · {a.author}
              </span>
              <span className="jrow__arrow">
                <ArrowUR />
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

