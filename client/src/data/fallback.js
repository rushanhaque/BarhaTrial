// Static seed shown while the API loads. Never stored in / read from localStorage.
// The API (/api/products) is always the source of truth — every device gets
// the same list the moment Admin publishes.
export const defaultProducts = [
  { index: 'BH·01', slug: 'aurelia-hammered-vase', name: 'Aurelia Hammered Vase', family: 'Vase', signature: true, tagline: 'Timeless hammered brass.', priceUSD: 145, moq: 50, chromatic: { from: '#2A2015', via: '#735832', to: '#C59A53', glow: '#E6BC6B' }, image: '/images/brass_vase.png' },
  { index: 'BH·02', slug: 'verona-candle-stand', name: 'Verona Candle Stand', family: 'Decor', tagline: 'A study in contrasts.', priceUSD: 85, moq: 100, chromatic: { from: '#111111', via: '#2A2A2A', to: '#B39145', glow: '#D4B260' }, image: '/images/brass_tray.png' },
  { index: 'BH·03', slug: 'solstice-wall-art', name: 'Solstice Wall Art', family: 'Wall Decor', tagline: 'Painted with fire.', priceUSD: 220, moq: 20, chromatic: { from: '#1A0E2A', via: '#381C4F', to: '#A4583A', glow: '#D17C45' }, image: '/images/candle_stand.png' },
  { index: 'BH·04', slug: 'marbella-planter', name: 'Marbella Planter', family: 'Garden', tagline: 'Lightweight volume.', priceUSD: 110, moq: 150, chromatic: { from: '#F0F0F0', via: '#E0E0E0', to: '#999999', glow: '#FFFFFF' }, image: '/images/metal_lantern.png' },
  { index: 'BH·05', slug: 'regent-end-table', name: 'Regent End Table', family: 'Furniture', tagline: 'Industrial heritage.', priceUSD: 185, moq: 10, chromatic: { from: '#1A1816', via: '#332921', to: '#5C4431', glow: '#7D5C43' }, image: '/images/end_table.png' },
  { index: 'BH·06', slug: 'celeste-serving-bowl', name: 'Celeste Serving Bowl', family: 'Tableware', tagline: 'Food-safe elegance.', priceUSD: 45, moq: 200, chromatic: { from: '#0C1A30', via: '#1E3866', to: '#B3B3B3', glow: '#E6E6E6' }, image: '/images/copper_kitchenware.png' },
  { index: 'BH·07', slug: 'helios-lantern', name: 'Helios Lantern', family: 'Lighting', tagline: 'Guided by brass.', priceUSD: 165, moq: 80, chromatic: { from: '#1F1810', via: '#4C3B24', to: '#A68449', glow: '#CCAC6A' }, image: '/images/iron_planter.png' },
  { index: 'BH·08', slug: 'zenith-bookends', name: 'Zenith Bookends', family: 'Decor', tagline: 'Weight and grace.', priceUSD: 130, moq: 100, chromatic: { from: '#2A2D33', via: '#525760', to: '#A4AAB5', glow: '#C8CDD5' }, image: '/images/architectural_brass.png' },
  { index: 'BH·09', slug: 'orion-brass-tray', name: 'Orion Brass Tray', family: 'Tableware', tagline: 'Etched by hand.', priceUSD: 95, moq: 120, chromatic: { from: '#302518', via: '#5A462C', to: '#8C6F45', glow: '#AD8B5A' }, image: '/images/custom_manufacturing.png' },
]

export function getFallbackProducts() {
  return defaultProducts
}
