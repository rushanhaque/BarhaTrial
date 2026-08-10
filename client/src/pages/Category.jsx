import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { COLLECTIONS_ITEMS } from '../data/categories.js'
import { get } from '../lib/api.js'
import { fallbackProducts } from '../data/fallback.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Category() {
  const { slug } = useParams()
  const [products, setProducts] = useState(fallbackProducts)

  const categoryData = COLLECTIONS_ITEMS.find((c) => c.slug === slug)
  const categoryName = categoryData?.name || 'Collection'
  const categoryImage = categoryData?.image || '/images/brassware_vessels.png'

  useEffect(() => {
    // In the future, we can filter products by category slug from the API
    get('/api/products')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // For now, just show a subset of products to simulate a category page
          setProducts(data.slice(0, 4))
        }
      })
      .catch(() => {})
  }, [slug])

  return (
    <div className="page page-category">
      {/* Hero Section */}
      <header className="section" style={{ padding: 0, position: 'relative', height: '60vh', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
          <img src={categoryImage} alt={categoryName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(14,12,11,0.2) 0%, rgba(14,12,11,0.9) 100%)' }} />
        </div>
        
        <div className="container" style={{ textAlign: 'center', zIndex: 1, marginTop: '4rem' }}>
          <Reveal className="pagehead__eyebrow">
            <span className="eyebrow gold">Curated Series</span>
          </Reveal>
          <h1 className="pagehead__title" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', textTransform: 'uppercase' }}>
            <Mask block i={0}>{categoryName}</Mask>
          </h1>
        </div>
      </header>

      {/* Products Grid */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '8rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {products.map((product, idx) => (
              <ProductCard key={product.slug + idx} p={product} index={idx} />
            ))}
          </div>
          
          <Reveal delay={2} style={{ textAlign: 'center', marginTop: '6rem' }}>
            <p className="muted">More products for {categoryName} will be added soon.</p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
