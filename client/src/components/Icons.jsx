// Ultra-light line icons (≈1px stroke). No icon library.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const ArrowUR = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
)

export const ArrowRight = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

export const ArrowDown = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 4v15" />
    <path d="m6 13 6 6 6-6" />
  </svg>
)

export const ArrowUp = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 20V5" />
    <path d="m6 11 6-6 6 6" />
  </svg>
)

export const Plus = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const Minus = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
)

export const Close = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

// A single distilled drop — the maison's recurring glyph.
export const Drop = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3c3.6 4.3 6 7.5 6 10.5a6 6 0 0 1-12 0C6 10.5 8.4 7.3 12 3Z" />
  </svg>
)

// A four-point compass star used as a divider mark.
export const Star4 = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 2c.6 5.4 4 8.8 9.4 10-5.4 1.2-8.8 4.6-9.4 10-.6-5.4-4-8.8-9.4-10C8 10.8 11.4 7.4 12 2Z" />
  </svg>
)

export const Moon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
  </svg>
)

export const Sun = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
  </svg>
)

export const Search = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const Bag = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
)

export const Heart = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.6 12 20 12 20Z" />
  </svg>
)

export const HeartFill = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
    <path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.6 12 20 12 20Z" />
  </svg>
)

export const Trash = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 7h14M10 7V5h4v2M6 7l1 12h10l1-12" />
  </svg>
)

export const Check = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
)

export const Grid = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </svg>
)

export const Rows = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const Quote = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M9 7c-2.8 1-4.5 3.4-4.5 6.4 0 2.3 1.4 3.9 3.4 3.9 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.1-2.9-2.7-2.9-.3 0-.6 0-.8.1.3-1.4 1.6-2.6 3.2-3.2L9 7Zm9 0c-2.8 1-4.5 3.4-4.5 6.4 0 2.3 1.4 3.9 3.4 3.9 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.1-2.9-2.7-2.9-.3 0-.6 0-.8.1.3-1.4 1.6-2.6 3.2-3.2L18 7Z" />
  </svg>
)
