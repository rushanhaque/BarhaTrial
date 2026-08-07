import { useEffect, useRef, useState } from 'react'
import { get } from '../lib/api.js'
import { fallbackProducts } from '../data/fallback.js'
import { useParallax, useReveal, useCounter } from '../lib/hooks.js'

import { Reveal, Mask, Words } from '../components/Reveal.jsx'
import WhyChooseBarira from '../components/WhyChooseBarira.jsx'
import Marquee from '../components/Marquee.jsx'
import HorizontalLibrary from '../components/HorizontalLibrary.jsx'
import FoundryProcess from '../components/FoundryProcess.jsx'
import ChromaticPlate from '../components/ChromaticPlate.jsx'
import Beams from '../components/Beams.jsx'
import RecentlyViewed from '../components/RecentlyViewed.jsx'
import ShinyText from '../components/ShinyText.jsx'
import TLink from '../components/TLink.jsx'
import { ArrowUR, ArrowDown, Drop, Star4, Quote } from '../components/Icons.jsx'

import { DottedGlowBackground } from '../components/ui/dotted-glow-background.jsx'
import BorderGlow from '../components/ui/BorderGlow.jsx'

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
      <DottedGlowBackground
        className="home-dotted-bg"
        gap={18}
        radius={1.4}
        color="rgba(56, 189, 248, 0.22)"
        glowColor="rgba(0, 242, 254, 0.35)"
        opacity={0.32}
        speedMin={0.3}
        speedMax={1.0}
        speedScale={1}
      />

      <Hero entered={entered} />

      <Marquee
        className="home-marquee"
        items={['Premium Handicrafts', 'Export Quality', 'Manufactured in Moradabad', 'Cast Iron & Brass', 'Barira Handicrafts']}
        duration={42}
      />

      <Manifesto />

      <HorizontalLibrary items={products} />

      {signature && <Signature product={signature} />}

      <FoundryProcess />

      <AlchemyOfMetal />

      <RecentlyViewed title="Recently viewed items" />

      <WhyChooseBarira />

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
          <span className="eyebrow" style={{ display: 'flex', marginBottom: '2.5rem' }}>Featured Product</span>
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
            <TLink to={`/product/${product.slug}`} className="btn btn--gold btn--shine">
              View Details
              <div className="btn__icon">
                <ArrowUR />
              </div>
            </TLink>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────── Alchemy of Metal ─────────────────────── */
const ALCHEMY_DATA = {
  material: [
    {
      id: 'brass',
      name: 'BRASS',
      subtitle: 'Warm · Golden · Substantial',
      desc: 'Pure brass with a naturally rich golden character, chosen for its weight, warmth, and ability to develop depth over time.',
      image: '/images/brass_macro.png'
    },
    {
      id: 'copper',
      name: 'COPPER',
      subtitle: 'Reactive · Living · Evolving',
      desc: 'A dynamic metal that oxidizes and ages beautifully with exposure, offering an unparalleled living finish.',
      image: '/images/copper_macro.png'
    },
    {
      id: 'cast-iron',
      name: 'CAST IRON',
      subtitle: 'Dense · Raw · Powerful',
      desc: 'Forged for permanence, our cast iron pieces carry the brutalist weight and textured rawness of the foundry.',
      image: '/images/cast_iron_macro_2.jpg'
    }
  ],
  finish: [
    {
      id: 'polished',
      name: 'POLISHED',
      subtitle: 'Reflective · Clean · Luminous',
      desc: 'Hand-buffed to a mirror shine, reflecting ambient light and highlighting the pristine surface of the metal.',
      image: '/images/polished_macro.jpg'
    },
    {
      id: 'hammered',
      name: 'HAMMERED',
      subtitle: 'Textured · Tactile · Handmade',
      desc: 'Struck repeatedly by master artisans to create a faceted, textured surface that scatters light beautifully.',
      image: '/images/hammered_macro.jpg'
    },
    {
      id: 'oxidized',
      name: 'OXIDIZED',
      subtitle: 'Deep · Iridescent · Atmospheric',
      desc: 'A chemical or thermal patina applied to the surface to darken the metal, creating dramatic contrast and depth.',
      image: '/images/oxidized_macro.jpg'
    }
  ]
}

function AlchemyOfMetal() {
  const [activeTab, setActiveTab] = useState('material')
  const [activeIndex, setActiveIndex] = useState(0)

  const activeCategory = ALCHEMY_DATA[activeTab]
  const activeItem = activeCategory[activeIndex]

  const handleTab = (tab) => {
    setActiveTab(tab)
    setActiveIndex(0)
  }

  return (
    <section className="section alchemy">
      <div className="container">
        <div className="alchemy__head">
          <span className="eyebrow">The Alchemy of Metal</span>
          <div className="alchemy__tabs">
            <button 
              className={`alchemy__tab ${activeTab === 'material' ? 'is-active' : ''}`}
              onClick={() => handleTab('material')}
            >
              MATERIAL
            </button>
            <button 
              className={`alchemy__tab ${activeTab === 'finish' ? 'is-active' : ''}`}
              onClick={() => handleTab('finish')}
            >
              FINISH
            </button>
          </div>
        </div>

        <div className="alchemy__layout">
          <div className="alchemy__list">
            {activeCategory.map((item, idx) => {
              const isActive = activeIndex === idx
              return (
                <button 
                  key={item.id} 
                  className={`alchemy__item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <h3 className="alchemy__item-name">{item.name}</h3>
                  <p className="alchemy__item-sub gold">{item.subtitle}</p>
                </button>
              )
            })}
          </div>

          <div className="alchemy__visual">
            <div className="alchemy__visual-inner">
              <img 
                key={activeItem.id} /* force re-render for css transition */
                src={activeItem.image} 
                alt={activeItem.name} 
                className="alchemy__img"
              />
            </div>
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

