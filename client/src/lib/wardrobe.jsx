import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const WardrobeContext = createContext(null)
export const useWardrobe = () => useContext(WardrobeContext)

const load = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    return Array.isArray(v) ? v : fallback
  } catch {
    return fallback
  }
}
const lineId = (slug, size) => `${slug}__${size}`

export function WardrobeProvider({ children }) {
  const [cart, setCart] = useState(() => load('barha-cart', []))
  const [wish, setWish] = useState(() => load('barha-wish', []))
  const [drawer, setDrawer] = useState({ open: false, tab: 'wardrobe' })

  useEffect(() => {
    try { localStorage.setItem('barha-cart', JSON.stringify(cart)) } catch {}
  }, [cart])
  useEffect(() => {
    try { localStorage.setItem('barha-wish', JSON.stringify(wish)) } catch {}
  }, [wish])

  // item: { slug, name, family, chromatic, priceUSD, size, qty?, kind? }
  const addItem = (item) => {
    const id = lineId(item.slug, item.size || 'one')
    setCart((c) => {
      const found = c.find((l) => l.id === id)
      // Allow higher limits for B2B ordering (max 999 instead of 9)
      if (found) return c.map((l) => (l.id === id ? { ...l, qty: Math.min(999, l.qty + (item.qty || 1)) } : l))
      return [...c, { ...item, id, qty: item.qty || 1, size: item.size || 'one', kind: item.kind || 'product' }]
    })
  }
  const removeItem = (id) => setCart((c) => c.filter((l) => l.id !== id))
  const setQty = (id, qty) =>
    setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(999, qty)) } : l)))
  const clearCart = () => setCart([])

  const toggleWish = (summary) =>
    setWish((w) => (w.some((x) => x.slug === summary.slug) ? w.filter((x) => x.slug !== summary.slug) : [...w, summary]))
  const isWished = (slug) => wish.some((x) => x.slug === slug)

  const openDrawer = (tab = 'wardrobe') => setDrawer({ open: true, tab })
  const closeDrawer = () => setDrawer((d) => ({ ...d, open: false }))
  const setTab = (tab) => setDrawer((d) => ({ ...d, tab }))

  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart])
  const subtotal = useMemo(() => cart.reduce((n, l) => n + (l.priceUSD || 0) * l.qty, 0), [cart])

  const value = {
    cart, wish, drawer,
    addItem, removeItem, setQty, clearCart,
    toggleWish, isWished,
    openDrawer, closeDrawer, setTab,
    cartCount, subtotal, wishCount: wish.length,
  }
  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>
}
