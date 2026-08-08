import { useEffect, useMemo, useState } from 'react'
import { get } from '../lib/api.js'
import { fallbackProducts } from '../data/fallback.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import DriftWall from '../components/DriftWall.jsx'
import Marquee from '../components/Marquee.jsx'
import TLink from '../components/TLink.jsx'
import { ArrowUR } from '../components/Icons.jsx'

const CATEGORIES = [
  { key: 'all', label: 'All Catalogue', match: () => true },
  { key: 'vase', label: 'Vases & Vessels', match: (p) => /vase|planter/i.test(p.family) },
  { key: 'decor', label: 'Architectural Decor', match: (p) => /decor/i.test(p.family) },
  { key: 'furniture', label: 'Cast Furniture', match: (p) => /furniture/i.test(p.family) },
  { key: 'tableware', label: 'Tableware & Trays', match: (p) => /tableware/i.test(p.family) },
  { key: 'lighting', label: 'Brass Lighting', match: (p) => /lighting/i.test(p.family) },
]

// Sample placeholder IDs for picsum images as requested
const PICSUM_IDS = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164, 175, 180, 190, 200, 215]

export default function Catalogue() {
  const [products, setProducts] = useState(fallbackProducts)
  const [activeCategory, setActiveCategory] = useState('all')
  const [usePlaceholders, setUsePlaceholders] = useState(true)
  const [columns, setColumns] = useState(5)
  const [speed, setSpeed] = useState(42)
  const [pauseOnHover, setPauseOnHover] = useState(false)
  const [grayscale, setGrayscale] = useState(false)
  const [direction, setDirection] = useState('up')
  const [viewMode, setViewMode] = useState('wall') // 'wall' | 'grid'

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

  // Build DriftWall items with placeholders as requested or product details
  const wallItems = useMemo(() => {
    const sourceList = filteredProducts.length > 0 ? filteredProducts : products

    // Ensure we have enough tiles for a rich drifting wall (duplicate list if short)
    let list = [...sourceList]
    while (list.length < 25) {
      list = [...list, ...sourceList]
    }

    return list.map((p, idx) => {
      const picId = PICSUM_IDS[idx % PICSUM_IDS.length]
      const imageUrl = usePlaceholders
        ? `https://picsum.photos/id/${picId}/600/400`
        : p.image || `https://picsum.photos/id/${picId}/600/400`

      return {
        image: imageUrl,
        title: `${p.name} — ${p.family || 'Barira'}`,
        href: `/product/${p.slug}`,
        id: `${p.slug}-${idx}`,
        rawProduct: p
      }
    })
  }, [filteredProducts, products, usePlaceholders])

  return (
    <div className="page page-catalogue">
      {/* ────────────────── Header Section ────────────────── */}
      <header className="section pagehead pagehead--catalogue" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div>
            <Reveal className="pagehead__eyebrow">
              <span className="eyebrow gold">Interactive Catalogue</span>
            </Reveal>
            <h1 className="pagehead__title" style={{ marginTop: '0.75rem' }}>
              <Mask block i={0}>The Drifting</Mask>{' '}
              <Mask block i={1}>
                <span className="italic gold">Handicraft Wall</span>.
              </Mask>
            </h1>
          </div>
        </div>
      </header>

      {/* ────────────────── Main Catalogue Body ────────────────── */}
      {viewMode === 'wall' ? (
        <section className="catalogue-wall-section" style={{ position: 'relative', width: '100%', height: 'calc(130vh - 200px)', minHeight: '850px', background: 'transparent' }}>
          <DriftWall
            items={wallItems}
            columns={columns}
            tileWidth={286}
            tileHeight={190}
            gap={24}
            radius={14}
            tilt={14}
            turn={-12}
            perspective={1200}
            depth={100}
            speed={speed}
            direction={direction}
            variance={0.45}
            parallax={0.65}
            pauseOnHover={pauseOnHover}
            lift={94}
            fade={0}
            dim={1}
            grayscale={grayscale}
            overlayColor="transparent"
          />
        </section>
      ) : (
        <div className="container" style={{ paddingBlock: '3rem' }}>
          <div className="collections__grid">
            {filteredProducts.map((p, i) => (
              <div key={p.slug} className="hcard" style={{ width: '100%', marginBottom: '1.5rem' }}>
                <TLink to={`/product/${p.slug}`} className="hcard__plate" style={{ display: 'block', borderRadius: '12px', overflow: 'hidden', height: '260px' }}>
                  <img
                    src={usePlaceholders ? `https://picsum.photos/id/${PICSUM_IDS[i % PICSUM_IDS.length]}/600/400` : (p.image || `https://picsum.photos/id/${PICSUM_IDS[i % PICSUM_IDS.length]}/600/400`)}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </TLink>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>{p.family}</span>
                  <h3 className="serif" style={{ fontSize: '1.2rem', margin: '0.2rem 0' }}>{p.name}</h3>
                  <p className="lead" style={{ fontSize: '0.9rem', color: 'var(--gold)' }}>${p.priceUSD} USD</p>
                  <TLink to={`/product/${p.slug}`} className="ulink" style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    View Product <ArrowUR />
                  </TLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marquee Footer */}
      <Marquee
        className="collections__marquee"
        items={['Moradabad Casting', 'Solid Metals', 'Custom Export Fabrication', '3D Drifting Wall', 'Hand Hammered Brass']}
        dir="reverse"
        duration={48}
      />
    </div>
  )
}
