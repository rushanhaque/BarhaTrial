import { useEffect, useMemo, useState } from 'react'
import { get } from '../lib/api.js'
import { fallbackProducts } from '../data/fallback.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Marquee from '../components/Marquee.jsx'
import DriftWall from '../components/DriftWall.jsx'
import TLink from '../components/TLink.jsx'
import { ArrowUR, Star4 } from '../components/Icons.jsx'

const CATEGORIES = [
  { key: 'all', label: 'All Artifacts', match: () => true },
  { key: 'vase', label: 'Vases & Vessels', match: (p) => /vase|planter/i.test(p.family) },
  { key: 'decor', label: 'Architectural Decor', match: (p) => /decor/i.test(p.family) },
  { key: 'furniture', label: 'Cast Furniture', match: (p) => /furniture/i.test(p.family) },
  { key: 'tableware', label: 'Tableware & Trays', match: (p) => /tableware/i.test(p.family) },
  { key: 'lighting', label: 'Brass Lighting', match: (p) => /lighting/i.test(p.family) },
]

const PICSUM_IDS = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164, 175, 180, 190, 200, 215]

export default function Collections() {
  const [products, setProducts] = useState(fallbackProducts)
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'wall'

  useEffect(() => {
    get('/api/products')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data)
        }
      })
      .catch(() => {})
  }, [])

  const currentCategory = CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0]

  const filteredProducts = useMemo(() => {
    return products.filter(currentCategory.match)
  }, [products, currentCategory])

  const wallItems = useMemo(() => {
    const sourceList = filteredProducts.length > 0 ? filteredProducts : products
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
  }, [filteredProducts, products])

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

      {/* Filter and View Mode Toolbar */}
      <section className="container" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="btn btn--sm"
                style={{
                  background: activeCategory === cat.key ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat.key ? '#000' : 'var(--bone)',
                  borderColor: activeCategory === cat.key ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
                  fontSize: '0.825rem',
                  letterSpacing: '0.05em',
                  fontWeight: activeCategory === cat.key ? '600' : '400',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'var(--bone)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Curated Grid
            </button>
            <button
              onClick={() => setViewMode('wall')}
              style={{
                background: viewMode === 'wall' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'var(--bone)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Interactive Wall
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        <section className="container" style={{ paddingBottom: '5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.slug + idx} p={product} index={idx} />
            ))}
          </div>
        </section>
      ) : (
        <section className="catalogue-wall-section" style={{ position: 'relative', width: '100%', height: 'calc(120vh - 200px)', minHeight: '800px', background: 'transparent' }}>
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
        </section>
      )}

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
