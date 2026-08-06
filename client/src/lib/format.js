// Money + size pricing helpers.
export const eur = (n) => '€' + Number(n).toLocaleString('en-GB')

// The listed price is for 100 ml. Other sizes scale from it.
export function priceForSize(base, sizeLabel = '') {
  const s = String(sizeLabel)
  if (/15|voyage/i.test(s)) return Math.round((base * 0.34) / 5) * 5
  if (/50/i.test(s)) return Math.round((base * 0.68) / 5) * 5
  return base
}

export const swatchGradient = (c = {}) =>
  `radial-gradient(120% 90% at 26% 14%, ${c.glow || '#e0a857'}55 0%, transparent 52%), linear-gradient(150deg, ${c.from || '#1b1733'}, ${c.via || '#5a2e3e'} 55%, ${c.to || '#c58a3d'})`
