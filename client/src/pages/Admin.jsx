import { useState, useRef, useMemo, useEffect } from 'react'
import '../styles/admin.css'
import { useScroll } from '../lib/SmoothScroll.jsx'

/* ---------------------------------------------------------------
   Admin · Product Management — Barira Handicrafts Design System
   Fonts: var(--font-display) Moara · var(--font-sans) Plus Jakarta Sans
   Palette: var(--noir) · var(--bone) · var(--gold) · var(--line)
--------------------------------------------------------------- */

// ── Icons ──────────────────────────────────────────────────
function BoxIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
      <path d="M20 5 L34 12 V28 L20 35 L6 28 V12 Z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M6 12 L20 19 L34 12" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M20 19 V35" stroke="var(--gold)" strokeWidth="1.3" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 14V3" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 7.5 11 3l4.5 4.5" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v2.2c0 1 .8 1.8 1.8 1.8h10.4c1 0 1.8-.8 1.8-1.8V15" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── Helpers ────────────────────────────────────────────────
function load(key, fallback) {
  try { const v = localStorage.getItem('barira_admin_' + key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function save(key, val) {
  try { localStorage.setItem('barira_admin_' + key, JSON.stringify(val)) } catch {}
}

// ── Seed products ──────────────────────────────────────────
const SEED_PRODUCTS = [
  { id: 1, name: 'Aurelia Hammered Vase', category: 'Decorative Vases', tagline: 'Timeless hammered brass.', description: 'A monumental hand-hammered vase raised from a single sheet of solid brass.', price: 145, moq: 50, imagePreview: '/images/brass_vase.png', signature: true },
  { id: 2, name: 'Verona Candle Stand', category: 'Tableware & Serveware', tagline: 'A study in contrasts.', description: 'A sculptural candle stand pairing a blackened iron column with a mirror-polished brass cup.', price: 85, moq: 100, imagePreview: '/images/brass_tray.png', signature: false },
  { id: 3, name: 'Solstice Wall Art', category: 'Home Décor', tagline: 'Painted with fire.', description: 'A radiant wall disc finished with a hand-controlled flame patina.', price: 220, moq: 20, imagePreview: '/images/candle_stand.png', signature: false },
  { id: 4, name: 'Marbella Planter', category: 'Garden & Planters', tagline: 'Lightweight volume.', description: 'A spun-aluminium planter with generous volume and a durable brushed finish.', price: 110, moq: 150, imagePreview: '/images/metal_lantern.png', signature: false },
  { id: 5, name: 'Regent End Table', category: 'Furniture', tagline: 'Industrial heritage.', description: 'A substantial cast-iron end table built for a lifetime of use.', price: 185, moq: 10, imagePreview: '/images/end_table.png', signature: false },
  { id: 6, name: 'Celeste Serving Bowl', category: 'Kitchenware', tagline: 'Food-safe elegance.', description: 'A double-walled copper serving bowl with a food-safe tin lining.', price: 45, moq: 200, imagePreview: '/images/copper_kitchenware.png', signature: false },
  { id: 7, name: 'Helios Lantern', category: 'Lighting', tagline: 'Guided by brass.', description: 'An architectural brass lantern with hand-pierced panels.', price: 165, moq: 80, imagePreview: '/images/iron_planter.png', signature: false },
  { id: 8, name: 'Zenith Bookends', category: 'Architectural Metalwork', tagline: 'Weight and grace.', description: 'A geometric pair of nickel-finished bookends.', price: 130, moq: 100, imagePreview: '/images/architectural_brass.png', signature: false },
  { id: 9, name: 'Orion Brass Tray', category: 'Custom Manufacturing', tagline: 'Etched by hand.', description: 'A decorative brass serving tray with hand-etched detailing.', price: 95, moq: 120, imagePreview: '/images/custom_manufacturing.png', signature: false },
]

const EMPTY_PRODUCT = { id: null, name: '', category: '', tagline: '', description: '', price: '', moq: '', image: null, imagePreview: null, signature: false }

// ── Modal ──────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  const scroll = useScroll()
  useEffect(() => {
    scroll?.lenis?.stop?.()
    return () => scroll?.lenis?.start?.()
  }, [scroll])

  return (
    <div className="pm-overlay" onMouseDown={onClose}>
      <div className={`pm-modal${wide ? ' pm-modal--wide' : ''}`} onMouseDown={e => e.stopPropagation()}>
        <div className="pm-modal-head">
          <h2>{title}</h2>
          <button className="pm-icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Main Admin ─────────────────────────────────────────────
export default function Admin() {
  const [products, setProducts] = useState(() => load('products', SEED_PRODUCTS))
  const [customCategories, setCustomCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const [newCategory, setNewCategory] = useState('')

  // Toast
  const [toast, setToast] = useState(null)
  const triggerToast = msg => { setToast(msg) }
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // Categories derived from products + custom ones added
  const availableCategories = useMemo(() => {
    const set = new Set(customCategories)
    products.forEach(p => { if (p.category?.trim()) set.add(p.category.trim()) })
    return Array.from(set)
  }, [customCategories, products])

  const categoryChips = useMemo(() => ['All', ...availableCategories], [availableCategories])

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length }
    products.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1 })
    return counts
  }, [products])

  const filteredProducts = useMemo(() => {
    return activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)
  }, [products, activeCategory])

  // Product form handlers
  const resetForm = () => {
    setProductForm(EMPTY_PRODUCT)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImageChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setProductForm(f => ({ ...f, image: file }))
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = e => {
    e.preventDefault()
    if (!productForm.name.trim()) return

    const trimmedCat = productForm.category.trim()
    if (trimmedCat && !customCategories.includes(trimmedCat)) {
      setCustomCategories(prev => [...prev, trimmedCat])
    }

    let updated
    if (productForm.id) {
      updated = products.map(p => p.id === productForm.id
        ? { ...productForm, category: trimmedCat, imagePreview: imagePreview || p.imagePreview }
        : p
      )
      triggerToast(`Updated "${productForm.name}"`)
    } else {
      const newProd = { ...productForm, category: trimmedCat, id: Date.now(), imagePreview, price: +productForm.price || 0, moq: +productForm.moq || 1 }
      updated = [newProd, ...products]
      triggerToast(`Added "${newProd.name}"`)
    }
    setProducts(updated); save('products', updated)
    resetForm(); setShowAddProduct(false)
  }

  const handleEdit = prod => {
    setProductForm(prod)
    setImagePreview(prod.imagePreview || null)
    setShowAddProduct(true)
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    const updated = products.filter(p => p.id !== id)
    setProducts(updated); save('products', updated)
    triggerToast(`Deleted "${name}"`)
  }

  const handleAddCategory = e => {
    e.preventDefault()
    const cat = newCategory.trim()
    if (!cat || customCategories.includes(cat) || availableCategories.includes(cat)) return
    setCustomCategories(prev => [...prev, cat])
    triggerToast(`Category "${cat}" added`)
    setNewCategory('')
    setShowAddCategory(false)
  }

  const pf = k => e => setProductForm(f => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }))

  return (
    <div className="pm-root">

      {/* Toast */}
      {toast && (
        <div className="pm-toast">
          <CheckIcon />
          <span>{toast}</span>
        </div>
      )}

      <div className="pm-container">

        {/* Header */}
        <div className="pm-top-section">
          <header className="pm-header">
            <span className="pm-admin-tag">Barira Handicrafts · Admin /</span>
            <h1 className="pm-title">Product Management</h1>
          </header>

          {/* Category chips */}
          <div className="pm-chips-bar">
            <div className="pm-chips">
              {categoryChips.map(cat => (
                <button
                  key={cat}
                  className={`pm-chip${activeCategory === cat ? ' pm-chip--active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{cat}</span>
                  {(categoryCounts[cat] || 0) > 0 && (
                    <span className="pm-chip-count">{categoryCounts[cat]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Datalist for category autocomplete */}
        <datalist id="pm-cat-list">
          {availableCategories.map(c => <option key={c} value={c} />)}
        </datalist>

        {/* Product Grid */}
        <div style={{ height: '4rem', flexShrink: 0 }} />
        <div className="pm-scrollable-content">
          {filteredProducts.length === 0 ? (
            <div className="pm-empty">
              <div className="pm-empty-icon"><BoxIcon /></div>
              <h3>No products found</h3>
              <p>
                {activeCategory === 'All'
                  ? 'Start by adding your first product below.'
                  : `No products in "${activeCategory}" yet.`}
              </p>
            </div>
          ) : (
            <div className="pm-grid">
              {filteredProducts.map(p => (
                <div className="pm-card" key={p.id}>
                  <div className="pm-card-image">
                    {p.imagePreview
                      ? <img src={p.imagePreview} alt={p.name} />
                      : <div className="pm-card-placeholder"><BoxIcon /></div>
                    }
                    {p.signature && <div className="pm-card-sig-badge">Featured</div>}
                  </div>
                  <div className="pm-card-body">
                    <div className="pm-card-top">
                      <h4>{p.name}</h4>
                      {p.price > 0 && <span className="pm-price">${p.price}</span>}
                    </div>
                    <p className="pm-card-meta">
                      {p.category}
                      {p.moq > 0 && ` · MOQ ${p.moq}`}
                    </p>
                    {p.tagline && <p className="pm-card-tagline">{p.tagline}</p>}
                  </div>
                  <div className="pm-card-actions">
                    <button className="pm-card-btn pm-card-btn--edit" onClick={() => handleEdit(p)} title="Edit"><EditIcon /></button>
                    <button className="pm-card-btn pm-card-btn--delete" onClick={() => handleDelete(p.id, p.name)} title="Delete"><TrashIcon /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="pm-bottom-bar">
          <div className="pm-bottom-actions">
            <button className="pm-btn pm-btn--primary" onClick={() => { resetForm(); setShowAddProduct(true) }}>
              <span className="pm-plus">+</span> Add Product
            </button>
            <button className="pm-btn pm-btn--outline" onClick={() => setShowAddCategory(true)}>
              <span className="pm-plus">+</span> Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddProduct && (
        <Modal
          title={productForm.id ? 'Edit Product' : 'Add Product'}
          onClose={() => { setShowAddProduct(false); resetForm() }}
          wide
        >
          <form className="pm-form" onSubmit={handleSave}>
            {/* Image upload */}
            <label className="pm-upload" htmlFor="pm-file-input">
              {imagePreview ? (
                <div className="pm-upload-preview-container">
                  <img src={imagePreview} alt="Preview" className="pm-upload-preview" />
                  <span className="pm-upload-change">Change Image</span>
                </div>
              ) : (
                <>
                  <UploadIcon />
                  <span>Upload Product Image</span>
                  <small className="pm-upload-hint">PNG, JPG — up to 10 MB</small>
                </>
              )}
            </label>
            <input id="pm-file-input" ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} hidden />

            {/* Name */}
            <div className="pm-field">
              <label>PRODUCT NAME *</label>
              <input type="text" value={productForm.name} onChange={pf('name')} placeholder="e.g. Aurelia Hammered Vase" required />
            </div>

            {/* Category + Tagline */}
            <div className="pm-field-row">
              <div className="pm-field">
                <label>CATEGORY</label>
                <input type="text" list="pm-cat-list" value={productForm.category} onChange={pf('category')} placeholder="e.g. Decorative Vases" />
              </div>
              <div className="pm-field">
                <label>TAGLINE</label>
                <input type="text" value={productForm.tagline} onChange={pf('tagline')} placeholder="e.g. Timeless hammered brass." />
              </div>
            </div>

            {/* Price + MOQ */}
            <div className="pm-field-row">
              <div className="pm-field">
                <label>PRICE (USD)</label>
                <input type="number" min="0" value={productForm.price} onChange={pf('price')} placeholder="e.g. 145" />
              </div>
              <div className="pm-field">
                <label>MIN ORDER QTY</label>
                <input type="number" min="1" value={productForm.moq} onChange={pf('moq')} placeholder="e.g. 50" />
              </div>
            </div>

            <div className="pm-field">
              <label>DESCRIPTION</label>
              <textarea value={productForm.description} onChange={pf('description')} rows={2} placeholder="Short product description shown on the catalogue page." />
            </div>

            {/* Signature toggle */}
            <label className="pm-checkbox-row">
              <input type="checkbox" checked={!!productForm.signature} onChange={pf('signature')} />
              <span>Mark as <strong>Featured / Signature</strong> product (shown highlighted on homepage)</span>
            </label>

            <div className="pm-modal-actions">
              <button type="button" className="pm-btn pm-btn--ghost" onClick={() => { setShowAddProduct(false); resetForm() }}>Cancel</button>
              <button type="submit" className="pm-btn pm-btn--primary">{productForm.id ? 'Update Product' : 'Save Product'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <Modal title="Add Category" onClose={() => setShowAddCategory(false)}>
          <form className="pm-form" onSubmit={handleAddCategory}>
            <div className="pm-field">
              <label>CATEGORY NAME *</label>
              <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g. Wall Art" required autoFocus />
            </div>
            <div className="pm-modal-actions">
              <button type="button" className="pm-btn pm-btn--ghost" onClick={() => setShowAddCategory(false)}>Cancel</button>
              <button type="submit" className="pm-btn pm-btn--primary">Create Category</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
