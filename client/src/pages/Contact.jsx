import { useEffect, useState } from 'react'
import { get, post } from '../lib/api.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import { ArrowUR } from '../components/Icons.jsx'

const SEED_OFFICES = [
  { city: 'Moradabad', address: 'Sector 4, Export Zone, UP', detail: 'Headquarters & Primary Manufacturing Facility.', coords: '28.8386° N, 78.7733° E', hours: 'Mon–Sat, 09h – 18h' },
  { city: 'New Delhi', address: 'Okhla Industrial Area, Phase II', detail: 'Corporate Sales & International Logistics.', coords: '28.5273° N, 77.2785° E', hours: 'Mon–Fri, 10h – 18h' },
  { city: 'Frankfurt', address: 'Messe Frankfurt Exhibition Grounds', detail: 'Seasonal EU Showroom & Distribution Hub.', coords: '50.1109° N, 8.6821° E', hours: 'By Appointment Only' },
  { city: 'New York', address: '230 Fifth Avenue', detail: 'Americas B2B Showroom.', coords: '40.7440° N, 73.9877° W', hours: 'Mon–Fri, 09h – 17h' },
]

export default function Contact() {
  const [mode, setMode] = useState('enquiry') // enquiry | consultation
  const [offices, setOffices] = useState(SEED_OFFICES)
  const [form, setForm] = useState({ name: '', email: '', city: 'Moradabad', date: '', message: '' })
  const [status, setStatus] = useState({ state: 'idle', msg: '' })

  useEffect(() => {
    get('/api/factory').then((d) => d.offices && setOffices(d.offices)).catch(() => {})
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setStatus({ state: 'loading', msg: '' })
    try {
      const data =
        mode === 'enquiry'
          ? await post('/api/contact', { name: form.name, email: form.email, message: form.message })
          : await post('/api/appointments', { name: form.name, email: form.email, city: form.city, date: form.date })
      setStatus({ state: 'done', msg: data.message })
    } catch (err) {
      setStatus({ state: 'error', msg: err.message })
    }
  }

  return (
    <div className="page page-contact">
      <header className="section pagehead">
        <div className="container">
          <Reveal className="pagehead__eyebrow">
            <span className="eyebrow">Contact & Showrooms</span>
          </Reveal>
          <h1 className="pagehead__title">
            <Mask block i={0}>Write to</Mask>
            <Mask block i={1}>
              the <span className="italic gold">factory</span>.
            </Mask>
          </h1>
          <Reveal as="p" className="lead pagehead__lede" delay={2}>
            For wholesale inquiries, B2B appointments, or questions regarding manufacturing capabilities — our export team replies to every letter, usually within two working days.
          </Reveal>
        </div>
      </header>

      <section className="container contact__grid">
        <div className="contact__form-wrap">
          <div className="contact__tabs">
            <button className={`contact__tab ${mode === 'enquiry' ? 'is-active' : ''}`} onClick={() => setMode('enquiry')} data-cursor>
              General enquiry
            </button>
            <button className={`contact__tab ${mode === 'consultation' ? 'is-active' : ''}`} onClick={() => setMode('consultation')} data-cursor>
              Book appointment
            </button>
          </div>

          {status.state === 'done' ? (
            <Reveal className="contact__success">
              <span className="contact__success-mark">✓</span>
              <p className="serif contact__success-text">{status.msg}</p>
              <button className="ulink" onClick={() => setStatus({ state: 'idle', msg: '' })} data-cursor>
                Send another
              </button>
            </Reveal>
          ) : (
            <form className="contact__form" onSubmit={submit}>
              <Field label="Your name" id="name">
                <input id="name" value={form.name} onChange={set('name')} placeholder="Tariq Mansoor" required />
              </Field>
              <Field label="Business email" id="email">
                <input id="email" type="email" value={form.email} onChange={set('email')} placeholder="buyer@example.com" required />
              </Field>

              {mode === 'consultation' ? (
                <div className="contact__pair">
                  <Field label="Preferred showroom" id="city">
                    <select id="city" value={form.city} onChange={set('city')}>
                      {offices.map((o) => (
                        <option key={o.city}>{o.city}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Preferred date" id="date">
                    <input id="date" type="date" value={form.date} onChange={set('date')} required />
                  </Field>
                </div>
              ) : (
                <Field label="Your message" id="message">
                  <textarea id="message" rows={4} value={form.message} onChange={set('message')} placeholder="How may the factory be of service?" required />
                </Field>
              )}

              <div className="contact__submit">
                <MagneticButton
                  type="submit"
                  variant="gold"
                  label={status.state === 'loading' ? 'Sending…' : mode === 'enquiry' ? 'Send enquiry' : 'Request appointment'}
                  strength={0.25}
                />
                {status.state === 'error' && <span className="contact__error">{status.msg}</span>}
              </div>
            </form>
          )}
        </div>

        <aside className="contact__boutiques">
          <span className="eyebrow">Global Offices</span>
          <div className="contact__boutique-list">
            {offices.map((o, i) => (
              <Reveal as="div" className="boutique" key={o.city} delay={i}>
                <div className="boutique__top">
                  <h3 className="boutique__city serif">{o.city}</h3>
                  <span className="boutique__coords">{o.coords}</span>
                </div>
                <p className="boutique__address">{o.address}</p>
                <p className="muted boutique__detail">{o.detail}</p>
                <span className="boutique__hours">{o.hours}</span>
              </Reveal>
            ))}
          </div>
          <a className="contact__mail ulink" href="mailto:exports@barirahandicrafts.example">
            exports@barirahandicrafts.example <ArrowUR />
          </a>
        </aside>
      </section>
    </div>
  )
}

function Field({ label, id, children }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      {children}
    </label>
  )
}
