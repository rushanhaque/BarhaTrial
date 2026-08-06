import { useEffect, useState } from 'react'

const KEY = 'barha-recent'
const MAX = 8
const EVT = 'barha-recent-change'

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function recordView(summary) {
  if (!summary?.slug) return
  const next = [summary, ...read().filter((x) => x.slug !== summary.slug)].slice(0, MAX)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
  window.dispatchEvent(new CustomEvent(EVT))
}

export function useRecent(excludeSlug) {
  const [items, setItems] = useState(read)
  useEffect(() => {
    const on = () => setItems(read())
    window.addEventListener(EVT, on)
    window.addEventListener('storage', on)
    return () => {
      window.removeEventListener(EVT, on)
      window.removeEventListener('storage', on)
    }
  }, [])
  return excludeSlug ? items.filter((x) => x.slug !== excludeSlug) : items
}
