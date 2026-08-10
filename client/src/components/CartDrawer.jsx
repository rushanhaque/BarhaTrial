import { useEffect, useState } from 'react'
import { useWardrobe } from '../lib/wardrobe.jsx'
import { useScroll } from '../lib/SmoothScroll.jsx'
import { useToast } from '../lib/toast.jsx'
import { post } from '../lib/api.js'
import { swatchGradient } from '../lib/format.js'
import TLink from './TLink.jsx'
import { Close, Plus, Minus, Trash, Bag, Heart, ArrowUR, Check } from './Icons.jsx'

const Swatch = ({ chromatic }) => (
  <span className="swatch" style={{ backgroundImage: swatchGradient(chromatic) }} />
)

export default function CartDrawer() {
  const w = useWardrobe()
  const scroll = useScroll()
  const toast = useToast()
  const [view, setView] = useState('cart') // cart | checkout | done
  const [form, setForm] = useState({ name: '', email: '' })
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('idle')

  const open = w?.drawer.open
  const tab = w?.drawer.tab || 'wardrobe'

  useEffect(() => {
    if (open) {
      scroll?.lenis?.stop?.()
      document.documentElement.classList.add('drawer-open')
    } else {
      scroll?.lenis?.start?.()
      document.documentElement.classList.remove('drawer-open')
      // reset checkout state when closing
      setTimeout(() => { setView('cart'); setStatus('idle'); setOrder(null) }, 400)
    }
  }, [open, scroll])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && w?.closeDrawer()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [w])

  if (!w) return null

  const placeOrder = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const data = await post('/api/orders', {
        name: form.name,
        email: form.email,
        items: w.cart.map((l) => ({ slug: l.slug, name: l.name, size: l.size, qty: l.qty })),
        total: w.subtotal,
      })
      setOrder(data)
      setView('done')
      setStatus('idle')
      w.clearCart()
      toast?.push('Your quote request is sent.', { kicker: 'Confirmed' })
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__veil" onClick={() => w.closeDrawer()} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Your quote list">
        <header className="drawer__head">
          <div className="drawer__tabs">
            <button
              className={`drawer__tab ${tab === 'wardrobe' ? 'is-active' : ''}`}
              onClick={() => w.setTab('wardrobe')}
              data-cursor
            >
              Quote List {w.cartCount > 0 && <span className="drawer__tab-n">{w.cartCount}</span>}
            </button>
            <button
              className={`drawer__tab ${tab === 'saved' ? 'is-active' : ''}`}
              onClick={() => w.setTab('saved')}
              data-cursor
            >
              Saved {w.wishCount > 0 && <span className="drawer__tab-n">{w.wishCount}</span>}
            </button>
          </div>
          <button className="drawer__close" onClick={() => w.closeDrawer()} aria-label="Close" data-cursor>
            <Close />
          </button>
        </header>

        {tab === 'wardrobe' && (
          <div className="drawer__body">
            {view === 'cart' && (
              <>
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
                            {l.size === 'one' ? l.family : l.size} · ${l.priceUSD || 0}
                          </span>
                          <div className="wline__qty">
                            <button onClick={() => w.setQty(l.id, l.qty - 10)} aria-label="Decrease" data-cursor>
                              <Minus />
                            </button>
                            <span>{l.qty}</span>
                            <button onClick={() => w.setQty(l.id, l.qty + 10)} aria-label="Increase" data-cursor>
                              <Plus />
                            </button>
                          </div>
                        </div>
                        <div className="wline__right">
                          <span className="wline__total">${(l.priceUSD || 0) * l.qty}</span>
                          <button className="wline__remove" onClick={() => w.removeItem(l.id)} aria-label="Remove" data-cursor>
                            <Trash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {view === 'checkout' && (
              <form className="drawer__checkout" onSubmit={placeOrder}>
                <button type="button" className="drawer__back ulink" onClick={() => setView('cart')} data-cursor>
                  ← Back to quote list
                </button>
                <p className="muted drawer__checkout-note">
                  An export manager will confirm availability and bulk pricing for your requested items. No payment is taken here.
                </p>
                <label className="field">
                  <span className="field__label">Your name</span>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Tariq Mansoor" required />
                </label>
                <label className="field">
                  <span className="field__label">Business email</span>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="buyer@example.com" required />
                </label>
                {status === 'error' && <span className="contact__error">Something went amiss. Please try again.</span>}
              </form>
            )}

            {view === 'done' && order && (
              <div className="drawer__done">
                <span className="drawer__done-mark"><Check /></span>
                <h3 className="serif">Requested.</h3>
                <p className="muted">{order.message}</p>
                <p className="drawer__order-ref">Reference · {order.reference}</p>
                <button className="ulink" onClick={() => { setView('cart'); w.closeDrawer() }} data-cursor>
                  Continue
                </button>
              </div>
            )}

            {w.cart.length > 0 && view !== 'done' && (
              <footer className="drawer__foot">
                <div className="drawer__subtotal">
                  <span className="muted">Est. Total (FOB)</span>
                  <span className="serif drawer__subtotal-val">${w.subtotal}</span>
                </div>
                {view === 'cart' ? (
                  <button className="btn btn--gold drawer__cta" onClick={() => setView('checkout')} data-cursor>
                    <span className="btn__label">Request Quote</span>
                    <span className="btn__icon"><ArrowUR /></span>
                  </button>
                ) : (
                  <button className="btn btn--gold drawer__cta" onClick={placeOrder} data-cursor>
                    <span className="btn__label">{status === 'loading' ? 'Sending…' : 'Submit Request'}</span>
                    <span className="btn__icon"><ArrowUR /></span>
                  </button>
                )}
                <span className="drawer__fineprint muted">A demonstration checkout · no payment is processed</span>
              </footer>
            )}
          </div>
        )}

        {tab === 'saved' && (
          <div className="drawer__body">
            {w.wish.length === 0 ? (
              <EmptyState
                icon={<Heart />}
                title="Nothing saved yet"
                text="Tap the heart on any product to keep it here."
                to="/collections"
                label="Browse the catalogue"
                onGo={() => w.closeDrawer()}
              />
            ) : (
              <div className="drawer__list">
                {w.wish.map((s) => (
                  <div className="sline" key={s.slug}>
                    <Swatch chromatic={s.chromatic} />
                    <div className="sline__info">
                      <span className="wline__name serif">{s.name}</span>
                      <span className="wline__meta">{s.family} · ${s.priceUSD || 0}</span>
                    </div>
                    <div className="sline__actions">
                      <button
                        className="sline__add"
                        onClick={() => { w.addItem({ ...s, size: 'One Size' }); w.setTab('wardrobe'); toast?.push(`${s.name} added`, { kicker: 'Quote List' }) }}
                        data-cursor
                        aria-label="Add to quote list"
                      >
                        <Bag />
                      </button>
                      <button className="sline__remove" onClick={() => w.toggleWish(s)} aria-label="Remove" data-cursor>
                        <Close />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
