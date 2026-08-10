import { useEffect, useMemo, useRef, useState } from 'react'
import { get } from '../lib/api.js'
import { getFallbackProducts } from '../data/fallback.js'
import { useParallax, useReveal, useCounter } from '../lib/hooks.js'

import { Reveal, Mask, Words } from '../components/Reveal.jsx'
import WhyChooseBarira from '../components/WhyChooseBarira.jsx'
import Marquee from '../components/Marquee.jsx'
import HorizontalLibrary from '../components/HorizontalLibrary.jsx'
import ChromaticPlate from '../components/ChromaticPlate.jsx'

import DriftWall from '../components/DriftWall.jsx'
import MaskedHeading from '../components/MaskedHeading.jsx'
import MaterialsAndFinishes from '../components/MaterialsAndFinishes.jsx'
import ShinyText from '../components/ShinyText.jsx'
import TLink from '../components/TLink.jsx'
import { ArrowUR, ArrowDown, Drop, Star4, Quote } from '../components/Icons.jsx'
export default function Home({ entered }) {
  const [products, setProducts] = useState(getFallbackProducts)

  useEffect(() => {
    get('/api/products').then(setProducts).catch(() => { })
  }, [])

  const signature = products.find((p) => p.signature) || products[0]

  return (
    <>
      <Hero entered={entered} />

      <HorizontalLibrary items={products} />

      <Marquee
        className="home-marquee"
        items={['Premium Handicrafts', 'Export Quality', 'Manufactured in Moradabad', 'Cast Iron & Brass', 'Barira Handicrafts']}
        duration={42}
      />

      {signature && <Signature product={signature} />}

      <Heritage />

      <HomeCatalogueSection products={products} />



      <MaterialsAndFinishes />

      <WhyChooseBarira />
    </>
  )
}

/* ───────────────────────── Hero (Landing Section) ───────────────────────── */
function Hero({ entered }) {
  return (
    <section className={`hero hero--centered ${entered ? 'is-entered' : ''}`}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          src="https://res.cloudinary.com/djszwbnxp/video/upload/v1786354702/IMG_0217_mkksta.mp4"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
      </div>

      <div className="hero__center-wrap" style={{ position: 'relative', zIndex: 1, marginTop: 'auto', marginBottom: '12vh' }}>
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

/* ──────────────────────── Heritage + stats ─────────────────────── */
function Heritage() {
  return (
    <section className="section heritage-section manifesto">
      {/* Background Video (with fallback poster overlay) */}
      <div className="heritage__video-wrap">
        <video
          className="heritage__video-bg"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/brass_vase.png"
          src="/videos/HeritageBG.mp4"
        />
        <div className="heritage__overlay" />
      </div>

      <div className="container heritage__container">
        <div className="heritage__top">
          <MaskedHeading
            text="THE HERITAGE"
            mediaType="video"
            src="/videos/HeritageBG.mp4"
            poster="/images/brass_vase.png"
            fillScale={1.35}
            parallax={32}
            brightness={1.05}
            saturation={1.0}
            reveal="wipe"
            trigger="view"
            textScale={0.092}
            weight={900}
            tracking={0.035}
            lineHeight={1.0}
            align="center"
          />
        </div>

        <div className="heritage__bottom">
          <div className="manifesto__stats manifesto__stats--4col">
            <StatBlock value="1982" label="HERITAGE ESTABLISHED" align="left" />
            <StatBlock target={45} prefix="+" label="EXPORT COUNTRIES" align="left" />
            <StatBlock target={200} prefix="OVER " label="MASTER ARTISANS" align="left" />
            <StatBlock target={100} suffix="%" label="QUALITY INSPECTED" align="right" />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatBlock({ value, target, prefix = '', suffix = '', label, align = 'left' }) {
  const [ref, n] = useCounter(target || 0)
  const reveal = useReveal()
  const valStr = target ? `${prefix}${n}${suffix}` : value

  return (
    <div className={`stat reveal stat--align-${align}`} ref={reveal} style={{ textAlign: align }}>
      <MaskedHeading
        text={valStr}
        mediaType="video"
        src="/videos/HeritageBG.mp4"
        poster="/images/brass_vase.png"
        fillScale={1.3}
        parallax={18}
        brightness={1.05}
        saturation={1.0}
        textScale={0.16}
        weight={900}
        tracking={0.01}
        lineHeight={1.0}
        align={align}
        reveal="none"
      />
      <span className="stat__label" ref={target ? ref : null}>{label}</span>
    </div>
  )
}

/* ──────────────────────── Signature spotlight ─────────────────────── */
function Signature({ product }) {
  const plate = useParallax(-0.05)
  return (
    <section className="section signature">
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2.4rem' }}>
          <h2 className="section-heading-unified" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            FEATURED PRODUCT
          </h2>
        </div>

        <div className="signature__grid">
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
            <div className="signature__body-top">
              <h3 className="signature__name">
                <Mask block i={0}>
                  <ShinyText text={product.name} speed={3} color="var(--bone)" shineColor="#b2d5e5" />
                </Mask>
              </h3>
              <Reveal as="p" className="signature__fam gold" delay={1}>
                {product.family} · Premium Handicraft
              </Reveal>
              <Reveal as="p" className="lead signature__lede" delay={2}>
                {product.tagline} {product.blurb}
              </Reveal>
            </div>

            <div className="signature__feature-grid">
              {[1, 2, 3, 4].map((i) => (
                <Reveal as="div" key={i} className="signature__feature-card" delay={i}>
                  <span>Detail {i}</span>
                </Reveal>
              ))}
            </div>

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
      </div>
    </section>
  )
}





/* ──────────────────────── Interactive Catalogue Section ─────────────────────── */
// Real material & foundry imagery interleaved with the products for visual texture.
const WALL_TEXTURES = [
  '/images/brass_macro.png', '/images/copper_macro.png', '/images/hammered_macro.jpg',
  '/images/foundry_pour.png', '/images/foundry_mold.png', '/images/foundry_patina.png',
  '/images/cast_iron_macro_2.jpg', '/images/oxidized_macro.jpg', '/images/polished_macro.jpg',
]

function HomeCatalogueSection({ products }) {
  const wallItems = useMemo(() => {
    const sourceList = products.length > 0 ? products : getFallbackProducts()

    let list = [...sourceList]
    while (list.length < 25) {
      list = [...list, ...sourceList]
    }

    return list.map((p, idx) => {
      // Every third tile shows a material/foundry texture for rhythm; the rest show the product.
      const useTexture = idx % 3 === 2
      const image = useTexture ? WALL_TEXTURES[idx % WALL_TEXTURES.length] : p.image
      return {
        image,
        title: `${p.name} — ${p.family || 'Barira'}`,
        href: `/product/${p.slug}`,
        id: `${p.slug}-${idx}`,
        rawProduct: p
      }
    })
  }, [products])

  return (
    <section className="section home-catalogue-section" style={{ paddingTop: '6rem', paddingBottom: '2rem' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10, marginBottom: '2.5rem', textAlign: 'center', pointerEvents: 'none' }}>
        <div>
          <h2 className="section-heading-unified" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', pointerEvents: 'auto' }}>
            OUR BEST SELLERS
          </h2>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 'calc(110vh - 150px)', minHeight: '750px', background: 'transparent' }}>
        <DriftWall
          items={wallItems}
          columns={5}
          tileWidth={286}
          tileHeight={190}
          gap={24}
          radius={14}
          tilt={0}
          turn={0}
          perspective={1200}
          depth={100}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.65}
          pauseOnHover={false}
          lift={94}
          fade={0}
          dim={1}
          grayscale={false}
          overlayColor="transparent"
        />
      </div>
    </section>
  )
}

