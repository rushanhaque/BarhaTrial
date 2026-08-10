import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { post } from '../lib/api.js'
import { useScroll } from '../lib/SmoothScroll.jsx'
import TLink from './TLink.jsx'
import MagneticButton from './MagneticButton.jsx'
import { Reveal, Mask } from './Reveal.jsx'
import { ArrowUR, Drop, ArrowRight } from './Icons.jsx'
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
    title: 'Global Offices',
    links: [
      { label: 'Moradabad', to: '/contact' },
      { label: 'New Delhi', to: '/contact' },
      { label: 'Frankfurt', to: '/contact' },
      { label: 'New York', to: '/contact' },
    ],
  },
]

export default function Footer() {
  const scroll = useScroll()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ state: 'idle', msg: '' })
  const isProductPage = location.pathname.startsWith('/product/')

  const subscribe = async (e) => {
    e.preventDefault()
    setStatus({ state: 'loading', msg: '' })
    try {
      const data = await post('/api/newsletter', { email })
      setStatus({ state: 'done', msg: data.message })
      setEmail('')
    } catch (err) {
      setStatus({ state: 'error', msg: err.message })
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
          </div>
        </div>
      </div>

      <button
        className="footer__wordmark"
        onClick={() => scroll?.scrollTo?.(0, { duration: 1.6 })}
        data-cursor-label="To the top"
        aria-label="Back to top"
      >
        BARIRA HANDICRAFTS
      </button>

      <div className="container">
        <div className="footer__base">
          <span className="muted">© MMXXV Barira Handicrafts — Moradabad, India</span>
          <span className="muted footer__credit">
            A demonstration experience · Crafted with intent
          </span>
          <div className="footer__legal">
            <a className="ulink" href="#">Terms</a>
            <a className="ulink" href="#">Privacy</a>
            <a className="ulink" href="#">Wholesale Policies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
