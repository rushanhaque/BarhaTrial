import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useScroll } from '../lib/SmoothScroll.jsx'

const FORMSPREE = 'https://formspree.io/f/xeajlrkv'
import TLink from './TLink.jsx'
import MagneticButton from './MagneticButton.jsx'
import { Reveal, Mask } from './Reveal.jsx'
import { ArrowUR, Drop, ArrowRight } from './Icons.jsx'

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/in.barha/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1c6SoZQvD8/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://pin.it/k9gOzj06Q',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.136-1.867 3.136-4.563 0-2.386-1.715-4.054-4.163-4.054-2.836 0-4.5 2.127-4.5 4.327 0 .857.33 1.775.742 2.277a.3.3 0 0 1 .069.286c-.076.313-.244.995-.277 1.134-.044.183-.146.222-.337.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.967-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.522 0 10-4.477 10-10S17.522 2 12 2z"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/919720330779',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    ),
  },
]
import BorderGlow from './ui/BorderGlow.jsx'

const COLS = [
  {
    title: 'The Catalogue',
    links: [
      { label: 'Aurelia Hammered Vase', to: '/product/aurelia-hammered-vase' },
      { label: 'Verona Candle Stand', to: '/product/verona-candle-stand' },
      { label: 'Solstice Wall Art', to: '/product/solstice-wall-art' },
      { label: 'All Products', to: '/collections' },
    ],
  },
  {
    title: 'Navigation',
    links: [
      { label: 'The Collections', to: '/collections' },
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Locations',
    links: [
      { label: 'Head Office (Asalatpura)', to: '/contact' },
      { label: 'Factory (Pandit Nagla)', to: '/contact' },
      { label: 'Rafay@barha.in', to: '/contact' },
      { label: '+91 9720330779', to: '/contact' },
    ],
  },
]

export default function Footer() {
  const scroll = useScroll()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ state: 'idle', msg: '' })
  const isProductPage = location.pathname.startsWith('/product/') || location.pathname === '/admin'

  const subscribe = async (e) => {
    e.preventDefault()
    setStatus({ state: 'loading', msg: '' })
    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _subject: 'Newsletter Subscription — Barira Handicrafts' }),
      })
      if (res.ok) {
        setStatus({ state: 'done', msg: 'You are on the list.' })
        setEmail('')
      } else {
        const data = await res.json()
        setStatus({ state: 'error', msg: data?.errors?.[0]?.message || 'Something went wrong.' })
      }
    } catch {
      setStatus({ state: 'error', msg: 'Network error. Please try again.' })
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        {!isProductPage && (
          <div className="footer__top">
            <div className="footer__lede">
              <span className="eyebrow">Correspondence</span>
              <h2 className="footer__title">
                <Mask block i={0}>Letters from</Mask>
                <Mask block i={1}>
                  the <span className="italic gold">factory floor</span>.
                </Mask>
              </h2>
              <Reveal as="p" className="lead footer__lede-sub" delay={2}>
                New collections, manufacturing updates, and the occasional dispatch from Moradabad.
                Written rarely, and only when there is something worth saying.
              </Reveal>
            </div>

            <form className="footer__form" onSubmit={subscribe}>
              <BorderGlow
                edgeSensitivity={30}
                glowColor="40 80 80"
                backgroundColor="var(--ink)"
                borderRadius={100}
                glowRadius={40}
                glowIntensity={1.0}
                coneSpread={25}
                animated={false}
                colors={['#4a6b84', '#3b586e', '#2b4456']}
              >
                <div className="footer__field" style={{ border: 'none' }}>
                  <Drop className="footer__field-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    aria-label="Email address"
                    required
                  />
                  <button className="footer__submit" type="submit" data-cursor aria-label="Subscribe">
                    <ArrowRight />
                  </button>
                </div>
              </BorderGlow>
              <p className={`footer__status footer__status--${status.state}`}>
                {status.state === 'loading' ? 'One moment…' : status.msg || ' '}
              </p>
            </form>
          </div>
        )}

        <div className="footer__cols">
          {COLS.map((c) => (
            <div className="footer__col" key={c.title}>
              <span className="footer__col-title">{c.title}</span>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <TLink to={l.to} className="footer__link ulink">
                      {l.label}
                    </TLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer__col footer__col--cta">
            <span className="footer__col-title">Bespoke Production</span>
            <p className="muted">Request a bespoke manufacturing quote for your next collection.</p>
            <TLink to="/contact" className="btn btn--ghost btn--sm btn--shine">
              Contact Sales
              <div className="btn__icon">
                <ArrowUR />
              </div>
            </TLink>
            <a
              href="/catalogue.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--gold btn--sm btn--shine"
              style={{ marginTop: '0.6rem' }}
            >
              Product Catalogue
              <div className="btn__icon">
                <ArrowUR />
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="footer__socials">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social"
            aria-label={s.label}
            title={s.label}
          >
            {s.icon}
          </a>
        ))}
      </div>

      <button
        className="footer__wordmark"
        onClick={() => scroll?.scrollTo?.(0, { duration: 1.6 })}
        data-cursor-label="To the top"
        aria-label="Back to top"
      >
        BARIRA HANDICRAFTS
      </button>

    </footer>
  )
}
