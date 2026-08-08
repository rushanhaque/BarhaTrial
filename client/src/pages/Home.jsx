import { useEffect, useMemo, useRef, useState } from 'react'
import { get } from '../lib/api.js'
import { fallbackProducts } from '../data/fallback.js'
import { useParallax, useReveal, useCounter } from '../lib/hooks.js'

import { Reveal, Mask, Words } from '../components/Reveal.jsx'
import WhyChooseBarira from '../components/WhyChooseBarira.jsx'
import Marquee from '../components/Marquee.jsx'
import HorizontalLibrary from '../components/HorizontalLibrary.jsx'
import ChromaticPlate from '../components/ChromaticPlate.jsx'
import RecentlyViewed from '../components/RecentlyViewed.jsx'
import DriftWall from '../components/DriftWall.jsx'
import MaskedHeading from '../components/MaskedHeading.jsx'
import MaterialsAndFinishes from '../components/MaterialsAndFinishes.jsx'
import ShinyText from '../components/ShinyText.jsx'
import TLink from '../components/TLink.jsx'
import { ArrowUR, ArrowDown, Drop, Star4, Quote } from '../components/Icons.jsx'
export default function Home({ entered }) {
  const [products, setProducts] = useState(fallbackProducts)

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

      <RecentlyViewed title="Recently viewed items" />

      <MaterialsAndFinishes />

      <WhyChooseBarira />
    </>
  )
}

/* ───────────────────────── Hero (Landing Section) ───────────────────────── */
function Hero({ entered }) {
  return (
    <section className={`hero hero--centered ${entered ? 'is-entered' : ''}`}>
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
          src="/videos/heritage_bg.mp4"
        />
        <div className="heritage__overlay" />
      </div>

      <div className="container heritage__container">
        <div className="heritage__top">
          <MaskedHeading
            text="THE HERITAGE"
            mediaType="video"
            src="/videos/heritage_bg.mp4"
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
        src="/videos/heritage_bg.mp4"
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
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
      </div>
    </section>
  )
}





/* ──────────────────────── Interactive Catalogue Section ─────────────────────── */
const PICSUM_IDS = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164, 175, 180, 190, 200, 215]

function HomeCatalogueSection({ products }) {
  const wallItems = useMemo(() => {
    const sourceList = products.length > 0 ? products : fallbackProducts

    let list = [...sourceList]
    while (list.length < 25) {
      list = [...list, ...sourceList]
    }

    return list.map((p, idx) => {
      const picId = PICSUM_IDS[idx % PICSUM_IDS.length]
      return {
        image: `https://picsum.photos/id/${picId}/600/400`,
        title: `${p.name} — ${p.family || 'Barira'}`,
        href: `/product/${p.slug}`,
        id: `${p.slug}-${idx}`,
        rawProduct: p
      }
    })
  }, [products])

  return (
    <section className="section home-catalogue-section" style={{ paddingTop: '6rem', paddingBottom: '2rem' }}>
      <div className="container" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div>
          <h2 className="section-heading-unified" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
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
          tilt={14}
          turn={-12}
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

