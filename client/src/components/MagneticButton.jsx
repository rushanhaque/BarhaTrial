import { useMagnetic } from '../lib/hooks.js'
import { ArrowUR } from './Icons.jsx'
import TLink from './TLink.jsx'

/** Wrap any node in a magnetic pull field. */
export function Magnetic({ strength = 0.3, className = '', children, ...rest }) {
  const ref = useMagnetic(strength)
  return (
    <span ref={ref} className={`magnetic ${className}`} style={{ display: 'inline-flex' }} {...rest}>
      {children}
    </span>
  )
}

/**
 * Island button with the button-in-button trailing icon, wrapped in a magnetic
 * field. Renders as a curtain-link (`to`) or a real button (`onClick`).
 */
export default function MagneticButton({
  to,
  onClick,
  type = 'button',
  variant = 'primary',
  label,
  icon,
  sm = false,
  strength = 0.4,
  className = '',
  ...rest
}) {
  const cls = `btn btn--${variant} ${sm ? 'btn--sm' : ''} ${className}`
  const inner = (
    <>
      <span className="btn__label">{label}</span>
      <span className="btn__icon">{icon || <ArrowUR />}</span>
    </>
  )
  return (
    <Magnetic strength={strength} data-cursor>
      {to ? (
        <TLink to={to} className={cls} {...rest}>
          {inner}
        </TLink>
      ) : (
        <button type={type} className={cls} onClick={onClick} {...rest}>
          {inner}
        </button>
      )}
    </Magnetic>
  )
}
