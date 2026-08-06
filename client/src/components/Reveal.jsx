import { Fragment } from 'react'
import { useReveal } from '../lib/hooks.js'

/** Block reveal — heavy fade-up + de-blur as it enters the viewport. */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useReveal()
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--i': delay }} {...rest}>
      {children}
    </Tag>
  )
}

/** A single masked line — content slides up from behind an invisible edge. */
export function Mask({ as: Tag = 'span', i = 0, block = false, className = '', children }) {
  const ref = useReveal()
  return (
    <Tag ref={ref} className={`rw ${block ? 'rw--block' : ''} ${className}`}>
      <span className="rw__i" style={{ '--i': i }}>
        {children}
      </span>
    </Tag>
  )
}

/** Word-by-word masked reveal of a string, staggered under one observer. */
export function Words({ text, as: Tag = 'span', className = '', stagger = 1 }) {
  const ref = useReveal()
  const words = String(text).split(' ')
  return (
    <Tag ref={ref} className={className}>
      {words.map((w, idx) => (
        <Fragment key={idx}>
          <span className="rw rw--word">
            <span className="rw__i" style={{ '--i': idx * stagger }}>
              {w}
            </span>
          </span>
          {idx < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Tag>
  )
}
