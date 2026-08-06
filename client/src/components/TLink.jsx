import { forwardRef } from 'react'
import { useTransition } from '../lib/transition.jsx'

// An accessible anchor that triggers the curtain page-transition.
const TLink = forwardRef(function TLink({ to, children, className = '', onNavigate, ...rest }, ref) {
  const t = useTransition()
  const handle = (e) => {
    // honour modifier-clicks / new-tab behaviour
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
    e.preventDefault()
    onNavigate?.()
    t?.go(to)
  }
  return (
    <a href={to} ref={ref} className={className} onClick={handle} {...rest}>
      {children}
    </a>
  )
})

export default TLink
