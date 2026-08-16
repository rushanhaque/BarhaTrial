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
          poster="https://res.cloudinary.com/djszwbnxp/video/upload/so_0,f_jpg,q_80,w_1200/v1786354702/IMG_0217_mkksta.jpg"
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
            <StatBlock value="1993" label="HERITAGE ESTABLISHED" align="left" />
            <StatBlock target={10} suffix="+" label="EXPORT COUNTRIES" align="left" />
            <StatBlock target={25} suffix="+" label="MASTER ARTISANS" align="left" />
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
  const plate = useParallax(-0.04)
  const moq = product.specs?.moq || product.moq || null
  return (
    <section className="sig2">
      <div className="sig2__inner">

        {/* ── Left: image column ── */}
        <div className="sig2__visual" ref={plate}>
          <div className="sig2__img-frame">
            <img src={product.image} alt={product.name} className="sig2__img" />
            <span className="sig2__index">{product.index || 'BH·01'}</span>
          </div>
        </div>

        {/* ── Right: content column ── */}
        <div className="sig2__content">
          <Reveal as="span" className="sig2__eyebrow" delay={0}>
            Featured Product
          </Reveal>

          <h2 className="sig2__name">
            <Mask block i={0}>
              <ShinyText text={product.name} speed={3} color="var(--bone)" shineColor="#c9a24b" />
            </Mask>
          </h2>

          <Reveal as="div" className="sig2__rule-wrap" delay={1}>
            <span className="sig2__rule" />
            <span className="sig2__fam">{product.family}</span>
          </Reveal>

          <Reveal as="p" className="sig2__lede" delay={2}>
            {product.tagline}{product.blurb ? ` — ${product.blurb}` : ''}
          </Reveal>

          {moq && (
            <Reveal as="div" className="sig2__pills" delay={3}>
              <span className="sig2__pill">MOQ · {moq} units</span>
              <span className="sig2__pill">Factory Direct</span>
              <span className="sig2__pill">Export Ready</span>
            </Reveal>
          )}

          <Reveal as="div" className="sig2__cta" delay={4}>
            <TLink to={`/product/${product.slug}`} className="btn btn--gold btn--shine">
              View Product
              <div className="btn__icon"><ArrowUR /></div>
            </TLink>
            <TLink to="/collections" className="sig2__browse">
              Browse All →
            </TLink>
          </Reveal>
        </div>

      </div>
    </section>
  )
}





/* ──────────────────────── Interactive Catalogue Section ─────────────────────── */

function HomeCatalogueSection({ products }) {
  const wallItems = useMemo(() => {
    // First, filter for Best Sellers. If none exist, fallback to all products.
    let showcaseProducts = products.filter(p => p.isBestSeller)
    if (showcaseProducts.length === 0) showcaseProducts = products

    const sourceList = showcaseProducts.length > 0 ? showcaseProducts : getFallbackProducts()

    let list = [...sourceList]
    while (list.length < 35) {
      // Shuffle each new chunk so the grid looks organic and doesn't have obvious repeating rows
      let shuffledChunk = [...sourceList].sort(() => Math.random() - 0.5)
      list = [...list, ...shuffledChunk]
    }

    return list.map((p, idx) => {
      return {
        image: p.image,
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

