import { useEffect } from 'react'
import { Reveal, Mask } from '../components/Reveal.jsx'
import Marquee from '../components/Marquee.jsx'
import TLink from '../components/TLink.jsx'
import { ArrowUR } from '../components/Icons.jsx'
import CollectionsDolly from '../components/CollectionsDolly.jsx'
import { COLLECTIONS_ITEMS } from '../data/categories.js'

export default function Collections() {
  return (
    <div className="page page-collections">
      <header className="section pagehead">
        <div className="container">
          <Reveal className="pagehead__eyebrow">
            <span className="eyebrow gold">Curated Series</span>
          </Reveal>
          <h1 className="pagehead__title">
            <Mask block i={0}>The Master</Mask>{' '}
            <Mask block i={1}>
              <span className="italic gold">Collections</span>.
            </Mask>
          </h1>
          <Reveal as="p" className="lead pagehead__lede" delay={2}>
            Explore our curated catalog of handcrafted metalwork — forged from heavy brass, cast iron, copper, and bronze for export worldwide.
          </Reveal>
        </div>
      </header>

      <CollectionsDolly categories={COLLECTIONS_ITEMS} />

      {/* ────────────────── Export Catalogue Showcase Section ────────────────── */}
      <section className="section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="eyebrow gold">EXPORT CATALOGUE</span>
            <h2 className="serif" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', marginTop: '0.5rem' }}>
              Full Manufacturing Index
            </h2>
            <p className="lead muted" style={{ maxWidth: '650px', margin: '1rem auto 0' }}>
              Browse through our complete export catalogue organized by material, specifications, and wholesale minimum order quantities.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              {
                title: 'Brassware & Vessels',
                image: '/images/brassware_vessels.png',
                desc: 'Hand-hammered vases, urns, candle stands, and architectural bowls finished in unlacquered antique or mirror polished brass.',
                count: '42 Master Items',
                moq: 'MOQ: 25 Pcs'
              },
              {
                title: 'Cast Iron & Steel Decor',
                image: '/images/cast_iron_decor.png',
                desc: 'Heavy cast iron wall art, bookends, pedestal stands, and outdoor decorative fixtures engineered for durability.',
                count: '38 Master Items',
                moq: 'MOQ: 50 Pcs'
              },
              {
                title: 'Copper & Flame Patina',
                image: '/images/copper_patina.png',
                desc: 'Flame-oxidized copper bowls, table planters, and artisan beverage dispensers with natural antique patinas.',
                count: '24 Master Items',
                moq: 'MOQ: 20 Pcs'
              }
            ].map((cat, i) => (
              <Reveal key={cat.title} delay={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '100%', height: '210px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={cat.image}
                      alt={cat.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,12,11,0.85) 0%, transparent 60%)' }} />
                  </div>
                  <div style={{ padding: '1.8rem 1.8rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="eyebrow gold">{cat.count}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--bone-muted)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px' }}>{cat.moq}</span>
                    </div>
                    <h3 className="serif" style={{ fontSize: '1.45rem', marginBottom: '0.75rem' }}>{cat.title}</h3>
                    <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>{cat.desc}</p>
                  </div>
                </div>
                <div style={{ padding: '1.8rem', paddingTop: '1.25rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: '500' }}>Inquire Specs</span>
                  <TLink to="/contact" className="ulink" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    Request Details <ArrowUR />
                  </TLink>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <Marquee
        className="collections__marquee"
        items={['Pure Brass Works', 'Hand Hammered Details', 'Export Standard Metalcraft', 'Cast Iron & Copper', 'Barira Handicrafts']}
        duration={42}
      />
    </div>
  )
}
