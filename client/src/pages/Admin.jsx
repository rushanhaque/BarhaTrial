import { useState, useRef, useMemo, useEffect } from 'react'
import '../styles/admin.css'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { COLLECTIONS_ITEMS } from '../data/categories.js'

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

function PublishIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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

const EMPTY_PRODUCT = { id: null, name: '', category: '', family: '', tagline: '', blurb: '', story: '', priceUSD: '', moq: '', image: null, imagePreview: null, signature: false, isBestSeller: false, artisan: '', origin: 'Moradabad, India', year: new Date().getFullYear(), sizes: '', specsWeight: '', specsLeadTime: '', materialsPrimary: '', materialsSecondary: '', materialsFinish: '', character: '' }

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
  const [products, setProducts] = useState(() => load('products', []))
  const [publishing, setPublishing] = useState(false)
  const [customSubcategories, setCustomSubcategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddSubcategory, setShowAddSubcategory] = useState(false)

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const [newSubcategory, setNewSubcategory] = useState({ parent: '', name: '' })

  const [confirmDialog, setConfirmDialog] = useState(null)

  // Toast
  const [toast, setToast] = useState(null)
  const triggerToast = msg => { setToast(msg) }
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // Sync with backend on first load if no products in draft
  useEffect(() => {
    const local = load('products', null)
    
    const normalize = p => {
      if (p.imagePreview && !p.image) p.image = p.imagePreview;
      delete p.imagePreview;
      return p;
    }

    if (!local || local.length === 0) {
      fetch('/api/products-full')
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.data) {
            const normalizedData = data.data.map(normalize)
            setProducts(normalizedData)
            save('products', normalizedData)
          }
        })
        .catch(console.error)
    } else {
      // If we already have local drafts, normalize them in place to fix any broken images
      const normalizedLocal = local.map(normalize)
      setProducts(normalizedLocal)
      save('products', normalizedLocal)
    }
  }, [])

  const handlePublish = () => {
    setConfirmDialog({
      title: 'Save & Publish',
      message: 'Are you sure you want to Save & Publish all changes to the live website?',
      confirmText: 'Publish',
      onConfirm: async () => {
        setConfirmDialog(null)
        setPublishing(true)
        triggerToast("Publishing to GitHub... this may take a few seconds.")
        try {
          const res = await fetch('/api/admin/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products })
          })
          const data = await res.json()
          if (data.ok) {
            triggerToast("Successfully published!")
          } else {
            triggerToast("Failed: " + data.error)
          }
        } catch (e) {
          triggerToast("Error publishing.")
        }
        setPublishing(false)
      }
    })
  }

  // Categories strictly derived from actual collections
  const availableCategories = useMemo(() => {
    return COLLECTIONS_ITEMS.map(c => c.name)
  }, [])

  // Subcategories specific to the currently selected parent category in the form
  const availableSubcategories = useMemo(() => {
    const parentCat = productForm.category
    if (!parentCat) return []
    const set = new Set()
    products.forEach(p => { 
      if (p.category === parentCat && p.family?.trim() && p.family !== parentCat) {
        set.add(p.family.trim()) 
      }
    })
    customSubcategories.forEach(s => { 
      if (s.parent === parentCat) set.add(s.name.trim()) 
    })
    return Array.from(set)
  }, [productForm.category, products, customSubcategories])

  const categoryChips = useMemo(() => ['All', '⭐ Showcase Wall', ...availableCategories], [availableCategories])

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length, '⭐ Showcase Wall': 0 }
    products.forEach(p => { 
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1 
      if (p.isBestSeller) counts['⭐ Showcase Wall'] += 1
    })
    return counts
  }, [products])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products
    if (activeCategory === '⭐ Showcase Wall') return products.filter(p => p.isBestSeller)
    return products.filter(p => p.category === activeCategory)
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
    const reader = new FileReader()
    reader.onload = ev => {
      setImagePreview(ev.target.result)
      setProductForm(f => ({ ...f, image: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = e => {
    e.preventDefault()
    if (!productForm.name.trim()) return

    const trimmedCat = productForm.category.trim()
    const trimmedFam = productForm.family ? productForm.family.trim() : ''

    // Auto-save new subcategories
    if (trimmedCat && trimmedFam && trimmedFam !== trimmedCat) {
      if (!customSubcategories.some(s => s.parent === trimmedCat && s.name === trimmedFam)) {
        setCustomSubcategories(prev => [...prev, { parent: trimmedCat, name: trimmedFam }])
      }
    }

    const newProd = {
      ...productForm,
      category: trimmedCat,
      family: trimmedFam || trimmedCat,
      index: productForm.index || `BH·${String(products.length + 1).padStart(2, '0')}`,
      slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      id: productForm.id || Date.now(),
      priceUSD: +productForm.priceUSD || 0,
      moq: +productForm.moq || 1,
      year: +productForm.year || new Date().getFullYear(),
      sizes: typeof productForm.sizes === 'string' ? productForm.sizes.split(',').map(s=>s.trim()).filter(Boolean) : (productForm.sizes || []),
      character: typeof productForm.character === 'string' ? productForm.character.split(',').map(s=>s.trim()).filter(Boolean) : (productForm.character || []),
      specs: { moq: +productForm.moq || 1, weight: productForm.specsWeight || '', leadTime: productForm.specsLeadTime || '' },
      materials: {
        primary: typeof productForm.materialsPrimary === 'string' ? productForm.materialsPrimary.split(',').map(s=>s.trim()).filter(Boolean) : (productForm.materialsPrimary || []),
        secondary: typeof productForm.materialsSecondary === 'string' ? productForm.materialsSecondary.split(',').map(s=>s.trim()).filter(Boolean) : (productForm.materialsSecondary || []),
        finish: typeof productForm.materialsFinish === 'string' ? productForm.materialsFinish.split(',').map(s=>s.trim()).filter(Boolean) : (productForm.materialsFinish || []),
      },
      chromatic: productForm.chromatic || { from: '#1A1A1A', via: '#505050', to: '#A0A0A0', glow: '#D0D0D0' },
      image: imagePreview || productForm.image || '/images/custom_manufacturing.png',
      // clean up flat form fields
      imagePreview: undefined,
      specsWeight: undefined,
      specsLeadTime: undefined,
      materialsPrimary: undefined,
      materialsSecondary: undefined,
      materialsFinish: undefined
    }

    let updated
    if (productForm.id) {
      updated = products.map(p => p.id === productForm.id ? newProd : p)
      triggerToast(`Updated draft for "${productForm.name}"`)
    } else {
      updated = [newProd, ...products]
      triggerToast(`Added draft for "${newProd.name}"`)
    }
    setProducts(updated); save('products', updated)
    resetForm(); setShowAddProduct(false)
  }

  const handleEdit = p => {
    setProductForm({
      ...p,
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes,
      character: Array.isArray(p.character) ? p.character.join(', ') : p.character,
      specsWeight: p.specs?.weight || '',
      specsLeadTime: p.specs?.leadTime || '',
      materialsPrimary: Array.isArray(p.materials?.primary) ? p.materials.primary.join(', ') : p.materials?.primary,
      materialsSecondary: Array.isArray(p.materials?.secondary) ? p.materials.secondary.join(', ') : p.materials?.secondary,
      materialsFinish: Array.isArray(p.materials?.finish) ? p.materials.finish.join(', ') : p.materials?.finish,
    })
    setImagePreview(p.image || null)
    setShowAddProduct(true)
  }

  const handleDelete = (id, name) => {
    setConfirmDialog({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${name}" from your draft?`,
      confirmText: 'Delete',
      isDanger: true,
      onConfirm: () => {
        const updated = products.filter(p => p.id !== id && p.index !== id)
        setProducts(updated); save('products', updated)
        triggerToast(`Deleted draft for "${name}"`)
        setConfirmDialog(null)
      }
    })
  }

  const handleAddSubcategory = e => {
    e.preventDefault()
    const parent = newSubcategory.parent.trim()
    const name = newSubcategory.name.trim()
    
    if (!parent || !name) return
    
    // Prevent duplicates
    if (customSubcategories.some(s => s.parent === parent && s.name === name)) return
    
    setCustomSubcategories(prev => [...prev, { parent, name }])
    save('custom_subcategories', [...customSubcategories, { parent, name }])
    setShowAddSubcategory(false)
    setNewSubcategory({ parent: '', name: '' })
    triggerToast(`Added Subcategory "${name}"`)
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

        {/* Datalist for subcategory autocomplete */}
        <datalist id="pm-subcat-list">
          {availableSubcategories.map(c => <option key={c} value={c} />)}
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
                <div className="pm-card" key={p.id || p.index}>
                  <div className="pm-card-image">
                    {p.image
                      ? <img src={p.image} alt={p.name} />
                      : <div className="pm-card-placeholder"><BoxIcon /></div>
                    }
                    {p.signature && <div className="pm-card-sig-badge">Featured</div>}
                    {p.isBestSeller && <div className="pm-card-bs-badge" title="Showcase Wall">★</div>}
                  </div>
                  <div className="pm-card-body">
                    <div className="pm-card-top">
                      <h4>{p.name}</h4>
                      {p.priceUSD > 0 && <span className="pm-price">${p.priceUSD}</span>}
                    </div>
                    <p className="pm-card-meta">
                      {p.category}
                      {p.moq > 0 && ` · MOQ ${p.moq}`}
                    </p>
                    {p.tagline && <p className="pm-card-tagline">{p.tagline}</p>}
                  </div>
                  <div className="pm-card-actions">
                    <button className="pm-card-btn pm-card-btn--edit" onClick={() => handleEdit(p)} title="Edit"><EditIcon /></button>
                    <button className="pm-card-btn pm-card-btn--delete" onClick={() => handleDelete(p.id || p.index, p.name)} title="Delete"><TrashIcon /></button>
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
            <button className="pm-btn pm-btn--outline" onClick={() => setShowAddSubcategory(true)}>
              <span className="pm-plus">+</span> Add Subcategory
            </button>
            
            <div style={{ flex: 1 }} />
            
            <button 
              className="pm-btn pm-btn--primary" 
              style={{ background: 'var(--gold)', color: '#000', borderColor: 'var(--gold)' }} 
              onClick={handlePublish}
              disabled={publishing}
            >
              <span className="pm-plus"><PublishIcon /></span> {publishing ? 'Publishing...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Modal title={confirmDialog.title} onClose={() => setConfirmDialog(null)}>
          <div className="pm-form" style={{ marginTop: '0.5rem' }}>
            <p style={{ color: 'var(--bone-soft)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
              {confirmDialog.message}
            </p>
            <div className="pm-modal-actions">
              <button type="button" className="pm-btn pm-btn--ghost" onClick={() => setConfirmDialog(null)}>Cancel</button>
              <button 
                type="button" 
                className="pm-btn pm-btn--primary" 
                style={confirmDialog.isDanger ? { background: '#e07070', color: '#111', borderColor: '#e07070' } : {}}
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Product Modal */}
      {showAddProduct && (
        <Modal
          title={productForm.id || productForm.index ? 'Edit Product' : 'Add Product'}
          onClose={() => { setShowAddProduct(false); resetForm() }}
          wide
        >
          <form className="pm-form" onSubmit={handleSave}>
            <div className="pm-form-grid">
              {/* Left Column */}
              <div className="pm-form-col-left">
                {/* Image upload */}
                <label className="pm-upload" htmlFor="pm-file-input">
                  {imagePreview ? (
                    <div className="pm-upload-preview-container">
                      <img src={imagePreview} alt="Preview" className="pm-upload-preview" style={{ height: '200px' }} />
                      <span className="pm-upload-change">Change Image</span>
                    </div>
                  ) : (
                    <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <UploadIcon />
                      <span>Upload Product Image</span>
                      <small className="pm-upload-hint">PNG, JPG — up to 10 MB</small>
                    </div>
                  )}
                </label>
                <input id="pm-file-input" ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} hidden />

                {/* Visibility Toggles */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="pm-checkbox-row">
                    <input type="checkbox" checked={!!productForm.signature} onChange={pf('signature')} />
                    <span>Mark as <strong>Featured / Signature</strong> product</span>
                  </label>
                  <label className="pm-checkbox-row">
                    <input type="checkbox" checked={!!productForm.isBestSeller} onChange={pf('isBestSeller')} />
                    <span>Show on <strong>⭐ Best Sellers</strong> Wall (Homepage)</span>
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div className="pm-form-col-right">
                {/* Name */}
                <div className="pm-field">
                  <label>PRODUCT NAME *</label>
                  <input type="text" value={productForm.name} onChange={pf('name')} placeholder="e.g. Aurelia Hammered Vase" required />
                </div>

                {/* Category + Tagline */}
                <div className="pm-field-row">
                  <div className="pm-field">
                    <label>PARENT CATEGORY *</label>
                    <select value={productForm.category} onChange={pf('category')} required>
                      <option value="">Select Category...</option>
                      {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="pm-field">
                    <label>SUBCATEGORY</label>
                    <input type="text" list="pm-subcat-list" value={productForm.family} onChange={pf('family')} placeholder="e.g. Birthday Candles" />
                  </div>
                </div>

                <div className="pm-field">
                  <label>TAGLINE</label>
                  <input type="text" value={productForm.tagline} onChange={pf('tagline')} placeholder="e.g. Timeless hammered brass." />
                </div>

                <div className="pm-field pm-field--textarea">
                  <label>DESCRIPTION (BLURB) *</label>
                  <textarea value={productForm.blurb} onChange={pf('blurb')} rows={2} placeholder="Used on catalogue cards." />
                </div>

                <div className="pm-field">
                  <label>FULL STORY / DESCRIPTION</label>
                  <textarea value={productForm.story} onChange={pf('story')} rows={2} placeholder="Full story shown on the product details page." />
                </div>

                {/* Price + MOQ */}
                <div className="pm-field-row">
                  <div className="pm-field">
                    <label>PRICE (USD)</label>
                    <input type="number" min="0" value={productForm.priceUSD} onChange={pf('priceUSD')} placeholder="e.g. 145" />
                  </div>
                  <div className="pm-field">
                    <label>MIN ORDER QTY</label>
                    <input type="number" min="1" value={productForm.moq} onChange={pf('moq')} placeholder="e.g. 50" />
                  </div>
                </div>
                
                {/* Specs */}
                <div className="pm-field-row">
                  <div className="pm-field">
                    <label>WEIGHT (e.g. 2.4 kg)</label>
                    <input type="text" value={productForm.specsWeight} onChange={pf('specsWeight')} />
                  </div>
                  <div className="pm-field">
                    <label>LEAD TIME (e.g. 4-6 weeks)</label>
                    <input type="text" value={productForm.specsLeadTime} onChange={pf('specsLeadTime')} />
                  </div>
                </div>
                
                {/* Materials */}
                <div className="pm-field-row">
                  <div className="pm-field">
                    <label>PRIMARY MATERIALS</label>
                    <input type="text" value={productForm.materialsPrimary} onChange={pf('materialsPrimary')} placeholder="e.g. Solid Brass" />
                  </div>
                  <div className="pm-field">
                    <label>FINISHES</label>
                    <input type="text" value={productForm.materialsFinish} onChange={pf('materialsFinish')} placeholder="e.g. Antique Unlacquered" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pm-modal-actions">
              <button type="button" className="pm-btn pm-btn--ghost" onClick={() => { setShowAddProduct(false); resetForm() }}>Cancel</button>
              <button type="submit" className="pm-btn pm-btn--primary">Save Draft</button>
            </div>
          </form>
        </Modal>
      )}



      {/* Add Subcategory Modal */}
      {showAddSubcategory && (
        <Modal title="Add Subcategory" onClose={() => setShowAddSubcategory(false)}>
          <form className="pm-form" onSubmit={handleAddSubcategory}>
            <div className="pm-field">
              <label>PARENT CATEGORY *</label>
              <select value={newSubcategory.parent} onChange={e => setNewSubcategory(s => ({ ...s, parent: e.target.value }))} required>
                <option value="">Select Category...</option>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="pm-field">
              <label>SUBCATEGORY NAME *</label>
              <input autoFocus type="text" value={newSubcategory.name} onChange={e => setNewSubcategory(s => ({ ...s, name: e.target.value }))} placeholder="e.g. Birthday Candles" required />
            </div>
            <div className="pm-modal-actions">
              <button type="button" className="pm-btn pm-btn--ghost" onClick={() => setShowAddSubcategory(false)}>Cancel</button>
              <button type="submit" className="pm-btn pm-btn--primary">Save Subcategory</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
