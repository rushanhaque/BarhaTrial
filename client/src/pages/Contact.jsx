import { useEffect, useState } from 'react'
import { get } from '../lib/api.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import { ArrowUR } from '../components/Icons.jsx'

const FORMSPREE = 'https://formspree.io/f/xeajlrkv'

const SEED_OFFICES = [
  { city: 'Head Office (Moradabad)', address: 'Near Mina Masjid, Asalatpura, Moradabad 244001, UP, India', detail: 'Corporate Headquarters & Executive Office.', coords: '28.8386° N, 78.7733° E', hours: 'Mon–Sat, 09h – 18h' },
  { city: 'Factory (Moradabad)', address: 'Qidwai Nagar, Pandit Nagla, Moradabad 244001, UP, India', detail: 'Primary Manufacturing Facility & Workshop.', coords: '28.8386° N, 78.7733° E', hours: 'Mon–Sat, 09h – 18h' },
]

export default function Contact() {
  const [mode, setMode] = useState('enquiry') // enquiry | consultation
  const [offices, setOffices] = useState(SEED_OFFICES)
  const [form, setForm] = useState({ name: '', email: '', city: 'Head Office (Moradabad)', date: '', message: '' })
  const [status, setStatus] = useState({ state: 'idle', msg: '' })

  useEffect(() => {
    get('/api/factory').then((d) => d.offices && setOffices(d.offices)).catch(() => {})
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setStatus({ state: 'loading', msg: '' })
    try {
      const payload = mode === 'enquiry'
        ? { name: form.name, email: form.email, message: form.message, _subject: 'New Enquiry — Barira Handicrafts' }
        : { name: form.name, email: form.email, location: form.city, date: form.date, _subject: 'Appointment Request — Barira Handicrafts' }

      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setStatus({ state: 'done', msg: mode === 'enquiry' ? 'Message received. We will be in touch shortly.' : 'Appointment requested. Our team will confirm your visit.' })
      } else {
        const data = await res.json()
        setStatus({ state: 'error', msg: data?.errors?.[0]?.message || 'Something went wrong. Please try again.' })
      }
    } catch {
      setStatus({ state: 'error', msg: 'Network error. Please try again.' })
    }
  }

  return (
    <div className="page page-contact">
      <header className="section pagehead">
        <div className="container">
          <Reveal className="pagehead__eyebrow">
            <span className="eyebrow">Contact & Locations</span>
          </Reveal>
          <h1 className="pagehead__title">
            <Mask block i={0}>Write to</Mask>
            <Mask block i={1}>
              the <span className="italic gold">factory</span>.
            </Mask>
          </h1>
          <Reveal as="p" className="lead pagehead__lede" delay={2}>
            For wholesale inquiries, B2B appointments, or custom manufacturing quotes — reach out directly to our management team.
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
                <input id="name" value={form.name} onChange={set('name')} placeholder="Abu Rafay" required />
              </Field>
              <Field label="Business email" id="email">
                <input id="email" type="email" value={form.email} onChange={set('email')} placeholder="Rafay@barha.in" required />
              </Field>

              {mode === 'consultation' ? (
                <div className="contact__pair">
                  <Field label="Preferred location" id="city">
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
          <span className="eyebrow">Direct Contact & Locations</span>
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
          <div className="contact__direct-links">
            <a className="contact__mail ulink" href="mailto:Rafay@barha.in">
              Rafay@barha.in <ArrowUR />
            </a>
            <a className="contact__mail ulink" href="tel:9720330779">
              +91 9720330779 <ArrowUR />
            </a>
          </div>
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
