import { useEffect } from 'react'
import { useWardrobe } from '../lib/wardrobe.jsx'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { swatchGradient } from '../lib/format.js'
import TLink from './TLink.jsx'
import { Close, Trash, Bag, ArrowUR } from './Icons.jsx'

const WHATSAPP_NUMBER = '923001234567' // replace with actual number
const BUSINESS_EMAIL = 'info@barirahandicrafts.com' // replace with actual email

function buildEnquiryText(cart) {
  const lines = cart.map((l) => `• ${l.name} (${l.size === 'one' ? l.family : l.size})`).join('\n')
  return `Hello, I would like to enquire about the following items:\n\n${lines}\n\nPlease share availability and pricing.`
}

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const Swatch = ({ chromatic }) => (
  <span className="swatch" style={{ backgroundImage: swatchGradient(chromatic) }} />
)

export default function CartDrawer() {
  const w = useWardrobe()
  const scroll = useScroll()

  const open = w?.drawer.open

  useEffect(() => {
    if (open) {
      scroll?.lenis?.stop?.()
      document.documentElement.classList.add('drawer-open')
    } else {
      scroll?.lenis?.start?.()
      document.documentElement.classList.remove('drawer-open')
    }
  }, [open, scroll])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && w?.closeDrawer()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [w])

  if (!w) return null

  const enquireWhatsApp = () => {
    const text = encodeURIComponent(buildEnquiryText(w.cart))
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener')
  }

  const enquireEmail = () => {
    const body = encodeURIComponent(buildEnquiryText(w.cart))
    window.open(`mailto:${BUSINESS_EMAIL}?subject=Product%20Enquiry&body=${body}`, '_blank')
  }

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__veil" onClick={() => w.closeDrawer()} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Your quote list">
        <header className="drawer__head">
          <span className="drawer__title serif">
            Quote List {w.cartCount > 0 && <span className="drawer__tab-n">{w.cartCount}</span>}
          </span>
          <button className="drawer__close" onClick={() => w.closeDrawer()} aria-label="Close" data-cursor>
            <Close />
          </button>
        </header>

        <div className="drawer__body">
          {w.cart.length === 0 ? (
            <EmptyState
              icon={<Bag />}
              title="Your quote list is empty"
              text="Products you request a quote for will gather here."
              to="/collections"
              label="Browse the catalogue"
              onGo={() => w.closeDrawer()}
            />
          ) : (
            <div className="drawer__list">
              {w.cart.map((l) => (
                <div className="wline" key={l.id}>
                  <Swatch chromatic={l.chromatic} />
                  <div className="wline__info">
                    <span className="wline__name serif">{l.name}</span>
                    <span className="wline__meta">
                      {l.size === 'one' ? l.family : l.size}
                    </span>
                  </div>
                  <div className="wline__right">
                    <button className="wline__remove" onClick={() => w.removeItem(l.id)} aria-label="Remove" data-cursor>
                      <Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {w.cart.length > 0 && (
            <footer className="drawer__foot">
              <button className="btn drawer__cta drawer__cta--whatsapp" onClick={enquireWhatsApp} data-cursor>
                <span className="btn__icon"><WhatsAppIcon /></span>
                <span className="btn__label">Enquire on WhatsApp</span>
              </button>
              <button className="btn drawer__cta drawer__cta--email" onClick={enquireEmail} data-cursor>
                <span className="btn__icon"><EmailIcon /></span>
                <span className="btn__label">Enquire via Email</span>
              </button>
            </footer>
          )}
        </div>
      </aside>
    </div>
  )
}

function EmptyState({ icon, title, text, to, label, onGo }) {
  return (
    <div className="drawer__empty">
      <span className="drawer__empty-icon">{icon}</span>
      <h3 className="serif">{title}</h3>
      <p className="muted">{text}</p>
      <TLink to={to} className="btn btn--ghost btn--sm" onNavigate={onGo} data-cursor>
        <span className="btn__label">{label}</span>
        <span className="btn__icon"><ArrowUR /></span>
      </TLink>
    </div>
  )
}
