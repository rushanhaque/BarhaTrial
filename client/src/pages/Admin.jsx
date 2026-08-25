import { useState, useRef, useMemo, useEffect } from 'react'
import '../styles/admin.css'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { COLLECTIONS_ITEMS } from '../data/categories.js'
import ThemeToggle from '../components/ThemeToggle.jsx'

// â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// localStorage is ONLY used for the in-progress draft (unsaved form data) â€”
// it is NEVER the source of truth for the catalogue. On mount we always fetch
// from the server so every device / browser shows the same data.

const EMPTY_PRODUCT = { id: null, name: '', category: '', family: '', blurb: '', image: null, imagePreview: null, isBestSeller: false, materialsPrimary: '', materialsFinish: '' }

// â”€â”€ Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          <button className="pm-icon-btn" onClick={onClose} aria-label="Close">Ã—</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// â”€â”€ Main Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Admin() {
  // Server is the ONLY source of truth. Start empty and load immediately.
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [customSubcategories, setCustomSubcategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddSubcategory, setShowAddSubcategory] = useState(false)
  const [showSubcategories, setShowSubcategories] = useState(false)
  const [showBestWorks, setShowBestWorks] = useState(false)

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

  // Load catalogue from server on mount â€” same data every browser sees.
  useEffect(() => {
    fetch('/api/products-full', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.data)) {
          setProducts(data.data.map(p => {
            const copy = { ...p }
            delete copy.imagePreview
            return copy
          }))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handlePublish = () => {
    const pendingPhotos = products.filter(p => p.image?.startsWith('data:image/')).length
    setConfirmDialog({
      title: 'Save & Publish',
      message: pendingPhotos > 0
        ? `Are you sure? This will commit ${pendingPhotos} new photo${pendingPhotos !== 1 ? 's' : ''} and the updated catalogue to GitHub.`
        : 'Are you sure you want to Save & Publish all changes to the live website?',
      confirmText: 'Publish',
      onConfirm: async () => {
        setConfirmDialog(null)
        setPublishing(true)
        triggerToast(pendingPhotos > 0
          ? `Uploading ${pendingPhotos} photo${pendingPhotos !== 1 ? 's' : ''} and publishing…`
          : "Publishing to GitHub… this may take a few seconds.")
        try {
          const secret = import.meta.env.VITE_ADMIN_SECRET || ''
          const res = await fetch('/api/admin/publish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(secret ? { 'x-admin-secret': secret } : {}),
            },
            body: JSON.stringify({ products })
          })
          const data = await res.json()
          if (data.ok && data.data?.published !== false) {
            try {
              localStorage.removeItem('barira_admin_products')
              localStorage.removeItem('barira_admin_custom_subcategories')
            } catch {}
            const photoMsg = data.data?.photosCommitted > 0 ? ` (${data.data.photosCommitted} photo${data.data.photosCommitted !== 1 ? 's' : ''} committed)` : ''
            triggerToast(`Published! Live on every device.${photoMsg}`)
          } else if (data.ok && data.data?.published === false) {
            triggerToast("Saved locally only. Set GITHUB_TOKEN on Vercel to publish live.")
          } else {
            triggerToast("Failed: " + (data.error || 'Unknown error'))
          }
        } catch (e) {
          triggerToast("Network error publishing. Check your connection.")
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

  // All subcategories across all parents, merged from products + custom list
  const allSubcategories = useMemo(() => {
    const map = {} // parent -> Set of names
    products.forEach(p => {
      if (p.category && p.family && p.family.trim() !== p.category.trim()) {
        if (!map[p.category]) map[p.category] = new Set()
        map[p.category].add(p.family.trim())
      }
    })
    customSubcategories.forEach(s => {
      if (!map[s.parent]) map[s.parent] = new Set()
      map[s.parent].add(s.name.trim())
    })
    return Object.entries(map).map(([parent, names]) => ({
      parent,
      names: Array.from(names).sort()
    })).sort((a, b) => a.parent.localeCompare(b.parent))
  }, [products, customSubcategories])

  const handleDeleteSubcategory = (parent, name) => {
    setConfirmDialog({
      title: 'Delete Subcategory',
      message: `Delete subcategory "${name}" under "${parent}"? Products using it will have their subcategory cleared.`,
      confirmText: 'Delete',
      isDanger: true,
      onConfirm: () => {
        // Remove from custom list
        const updatedCustom = customSubcategories.filter(s => !(s.parent === parent && s.name === name))
        setCustomSubcategories(updatedCustom)
        
        // Clear family on products that use this subcategory
        const updatedProducts = products.map(p =>
          p.category === parent && p.family === name ? { ...p, family: p.category } : p
        )
        setProducts(updatedProducts)
        triggerToast(`Deleted subcategory "${name}"`)
        setConfirmDialog(null)
      }
    })
  }

  const categoryChips = useMemo(() => ['All', ...availableCategories], [availableCategories])

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length }
    products.forEach(p => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [products])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products
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

    const splitCSV = (v) => typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : (v || [])
    const newProd = {
      ...productForm,
      category: trimmedCat,
      family: trimmedFam || trimmedCat,
      index: productForm.index || `BHÂ·${String(products.length + 1).padStart(2, '0')}`,
      slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      id: productForm.id || Date.now(),
      materials: {
        primary: splitCSV(productForm.materialsPrimary),
        secondary: [],
        finish: splitCSV(productForm.materialsFinish),
      },
      chromatic: productForm.chromatic || { from: '#1A1A1A', via: '#505050', to: '#A0A0A0', glow: '#D0D0D0' },
      image: imagePreview || productForm.image || '/images/custom_manufacturing.png',
      imagePreview: undefined,
      materialsPrimary: undefined,
      materialsFinish: undefined,
    }

    let updated
    if (productForm.id) {
      updated = products.map(p => p.id === productForm.id ? newProd : p)
      triggerToast(`Updated draft for "${productForm.name}"`)
    } else {
      updated = [newProd, ...products]
      triggerToast(`Added draft for "${newProd.name}"`)
    }
    setProducts(updated)
    resetForm(); setShowAddProduct(false)
  }

  const handleEdit = p => {
    setProductForm({
      ...EMPTY_PRODUCT,
      id: p.id,
      index: p.index,
      slug: p.slug,
      chromatic: p.chromatic,
      name: p.name || '',
      category: p.category || '',
      family: p.family || '',
      blurb: p.blurb || '',
      isBestSeller: !!p.isBestSeller,
      materialsPrimary: Array.isArray(p.materials?.primary) ? p.materials.primary.join(', ') : (p.materials?.primary || ''),
      materialsFinish: Array.isArray(p.materials?.finish) ? p.materials.finish.join(', ') : (p.materials?.finish || ''),
      image: p.image || null,
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
        setProducts(updated)
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
    
    setShowAddSubcategory(false)
    setNewSubcategory({ parent: '', name: '' })
    triggerToast(`Added Subcategory "${name}"`)
  }

  const toggleBestWork = (id) => {
    const updated = products.map(p =>
      (p.id || p.index) === id ? { ...p, isBestWork: !p.isBestWork } : p
    )
    setProducts(updated)
    
  }

  const bestWorkCount = useMemo(() => products.filter(p => p.isBestWork).length, [products])

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
            <div>
              <span className="pm-admin-tag">Barira Handicrafts Â· Admin /</span>
              <h1 className="pm-title">Product Management</h1>
            </div>
            <ThemeToggle />
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
          {loading ? (
            <div className="pm-empty">
              <p style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>Loading catalogue from server…</p>
            </div>
          ) : filteredProducts.length === 0 ? (
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
                  </div>
                  <div className="pm-card-body">
                    <div className="pm-card-top">
                      <h4>{p.name}</h4>
                    </div>
                    <p className="pm-card-meta">{p.category}</p>
                    {p.blurb && <p className="pm-card-tagline">{p.blurb}</p>}
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
            <button className="pm-btn pm-btn--outline" onClick={() => setShowSubcategories(true)}>
              View Subcategories
              {allSubcategories.length > 0 && (
                <span className="pm-chip-count" style={{ marginLeft: '0.4rem' }}>
                  {allSubcategories.reduce((n, g) => n + g.names.length, 0)}
                </span>
              )}
            </button>
            <button className="pm-btn pm-btn--outline" onClick={() => setShowBestWorks(true)}>
              â˜… Best Works
              {bestWorkCount > 0 && (
                <span className="pm-chip-count" style={{ marginLeft: '0.4rem' }}>{bestWorkCount}</span>
              )}
            </button>
            
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
            {/* Image upload */}
            <label className="pm-upload" htmlFor="pm-file-input">
              {imagePreview ? (
                <div className="pm-upload-preview-container">
                  <img src={imagePreview} alt="Preview" className="pm-upload-preview" style={{ height: '200px' }} />
                  <span className="pm-upload-change">Change Image</span>
                </div>
              ) : (
                <div style={{ height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <UploadIcon />
                  <span>Upload Product Photo</span>
                  <small className="pm-upload-hint">PNG, JPG â€” up to 10 MB</small>
                </div>
              )}
            </label>
            <input id="pm-file-input" ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} hidden />

            <div className="pm-field">
              <label>PRODUCT NAME *</label>
              <input type="text" value={productForm.name} onChange={pf('name')} placeholder="e.g. Aurelia Hammered Vase" required />
            </div>

            <div className="pm-field">
              <label>MATERIAL</label>
              <input type="text" value={productForm.materialsPrimary} onChange={pf('materialsPrimary')} placeholder="e.g. Solid Brass, Copper" />
            </div>

            <div className="pm-field pm-field--textarea">
              <label>DESCRIPTION</label>
              <textarea value={productForm.blurb} onChange={pf('blurb')} rows={3} placeholder="Brief description of the product." />
            </div>

            <div className="pm-field">
              <label>FINISH</label>
              <input type="text" value={productForm.materialsFinish} onChange={pf('materialsFinish')} placeholder="e.g. Antique Unlacquered, Matte Black" />
            </div>

            <div className="pm-modal-actions">
              <button type="button" className="pm-btn pm-btn--ghost" onClick={() => { setShowAddProduct(false); resetForm() }}>Cancel</button>
              <button type="submit" className="pm-btn pm-btn--primary">Save Draft</button>
            </div>
          </form>
        </Modal>
      )}



      {/* Best Works Modal */}
      {showBestWorks && (
        <Modal title="Best Works" onClose={() => setShowBestWorks(false)} wide>
          <div className="pm-form">
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.2rem' }}>
              Select products to feature as your best works. Selected items will be highlighted across the site.
            </p>
            {products.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                No products yet. Add products first.
              </p>
            ) : (
              <div className="pm-bw-grid">
                {products.map(p => {
                  const id = p.id || p.index
                  const selected = !!p.isBestWork
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`pm-bw-card${selected ? ' pm-bw-card--selected' : ''}`}
                      onClick={() => toggleBestWork(id)}
                    >
                      <div className="pm-bw-img">
                        {p.image
                          ? <img src={p.image} alt={p.name} />
                          : <div className="pm-bw-placeholder"><BoxIcon /></div>
                        }
                        {selected && <span className="pm-bw-check">â˜…</span>}
                      </div>
                      <div className="pm-bw-meta">
                        <span className="pm-bw-name">{p.name}</span>
                        <span className="pm-bw-cat">{p.category}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="pm-modal-actions" style={{ marginTop: '1.2rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                {bestWorkCount} product{bestWorkCount !== 1 ? 's' : ''} selected
              </span>
              <button type="button" className="pm-btn pm-btn--primary" onClick={() => setShowBestWorks(false)}>Done</button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Subcategories Modal */}
      {showSubcategories && (
        <Modal title="Subcategories" onClose={() => setShowSubcategories(false)} wide>
          <div className="pm-form">
            {allSubcategories.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                No subcategories yet. Add one using the "Add Subcategory" button.
              </p>
            ) : (
              allSubcategories.map(group => (
                <div key={group.parent} className="pm-subcat-group">
                  <span className="pm-subcat-group-label">{group.parent}</span>
                  <div className="pm-subcat-list">
                    {group.names.map(name => {
                      const productCount = products.filter(p => p.category === group.parent && p.family === name).length
                      return (
                        <div key={name} className="pm-subcat-row">
                          <span className="pm-subcat-name">{name}</span>
                          {productCount > 0 && (
                            <span className="pm-subcat-count">{productCount} product{productCount !== 1 ? 's' : ''}</span>
                          )}
                          <button
                            className="pm-card-btn pm-card-btn--delete"
                            onClick={() => handleDeleteSubcategory(group.parent, name)}
                            title="Delete subcategory"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
            <div className="pm-modal-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="pm-btn pm-btn--ghost" onClick={() => setShowSubcategories(false)}>Close</button>
              <button type="button" className="pm-btn pm-btn--outline" onClick={() => { setShowSubcategories(false); setShowAddSubcategory(true) }}>
                + Add Subcategory
              </button>
            </div>
          </div>
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
