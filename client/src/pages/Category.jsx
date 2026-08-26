import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { COLLECTIONS_ITEMS } from '../data/categories.js'
import { get } from '../lib/api.js'
import { getFallbackProducts } from '../data/fallback.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Category() {
  const { slug } = useParams()
  const [products, setProducts] = useState([])

  const categoryData = COLLECTIONS_ITEMS.find((c) => c.slug === slug)
  const categoryName = categoryData?.name || 'Collection'
  const categoryImage = categoryData?.image || '/images/brassware_vessels.webp'

  useEffect(() => {
    get('/api/products')
      .then((data) => {
        if (Array.isArray(data)) {
          const matchedProducts = data.filter(p => p.family === categoryName || p.category === categoryName)
          setProducts(matchedProducts)
        }
      })
      .catch(() => {})
  }, [slug, categoryName])

  return (
    <div className="page page-category">
      <header className="category__hero">
        <div className="category__hero-bg">
          <img src={categoryImage} alt={categoryName} className="category__hero-img" />
          <div className="category__hero-overlay" />
        </div>
        <div className="container category__hero-content">
          <Reveal className="pagehead__eyebrow">
            <span className="eyebrow gold">Curated Series</span>
          </Reveal>
          <h1 className="category__hero-title serif">
            <Mask block i={0}>{categoryName}</Mask>
          </h1>
        </div>
      </header>

      <section className="section category__products">
        <div className="container">
          <div className="category__grid">
            {products.map((product, idx) => (
              <ProductCard key={product.slug + idx} p={product} index={idx} />
            ))}
          </div>
          <Reveal delay={2} className="category__empty-note">
            <p className="muted">More products for {categoryName} will be added soon.</p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
