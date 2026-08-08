import { useState } from 'react'
import { post } from '../lib/api.js'
import { Reveal, Mask } from '../components/Reveal.jsx'
import ChromaticPlate from '../components/ChromaticPlate.jsx'
import ProductCard from '../components/ProductCard.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import { ArrowRight, Drop } from '../components/Icons.jsx'

const QUESTIONS = [
  {
    key: 'material',
    label: 'Primary Metal',
    q: 'Which material defines your vision?',
    options: [
      { value: 'brass', title: 'Solid Brass', desc: 'Warm, golden, timeless. The foundation of Moradabad casting.', grad: ['#5A2E3E', '#E0A857'] },
      { value: 'iron', title: 'Cast Iron', desc: 'Heavy, industrial, austere. Built for decades.', grad: ['#1A0E0C', '#4A1C20'] },
      { value: 'copper', title: 'Raw Copper', desc: 'Vibrant, oxidizing, alive. For statement pieces.', grad: ['#1A0E2A', '#D17C45'] },
      { value: 'aluminum', title: 'Spun Aluminum', desc: 'Lightweight, modern, versatile. Perfect for volume.', grad: ['#202833', '#CBD4D6'] },
    ],
  },
  {
    key: 'finish',
    label: 'The Finish',
    q: 'How should the metal be treated?',
    options: [
      { value: 'hammered', title: 'Hand Hammered', desc: 'Textured, traditional, reflecting light irregularly.', grad: ['#1B1733', '#C58A3D'] },
      { value: 'polished', title: 'Mirror Polish', desc: 'Sleek, contemporary, flawless.', grad: ['#202833', '#A9B6BC'] },
      { value: 'oxidized', title: 'Flame Oxidized', desc: 'Iridescent, unpredictable, organic.', grad: ['#1A120A', '#E0A23C'] },
      { value: 'powder coat', title: 'Powder Coated', desc: 'Matte, durable, uniform color.', grad: ['#15130F', '#3A2A1E'] },
    ],
  },
  {
    key: 'category',
    label: 'Product Category',
    q: 'What are you looking to manufacture?',
    options: [
      { value: 'vase', title: 'Vases & Planters', desc: 'Holloware and large volume vessels.', grad: ['#2C2A22', '#E4D6A8'] },
      { value: 'furniture', title: 'Accent Furniture', desc: 'Heavy bases, tables, structural decor.', grad: ['#1A0E0C', '#9C5436'] },
      { value: 'lighting', title: 'Lighting & Lanterns', desc: 'Fretwork, glass assemblies, candle stands.', grad: ['#1B1733', '#C9A24B'] },
      { value: 'tableware', title: 'Dining & Tableware', desc: 'Food-safe enamels and serving pieces.', grad: ['#2C2A22', '#F2E6BE'] },
    ],
  },
]

export default function CustomOrders() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('intro') // intro | quiz | loading | result
  const [result, setResult] = useState(null)

  const begin = () => {
    setStep(0)
    setAnswers({})
    setResult(null)
    setPhase('quiz')
  }

  const choose = async (key, value) => {
    if (phase !== 'quiz') return
    const next = { ...answers, [key]: value }
    setAnswers(next)
    if (step < QUESTIONS.length - 1) {
      window.setTimeout(() => setStep((s) => Math.min(QUESTIONS.length - 1, s + 1)), 240)
    } else {
      setPhase('loading')
      try {
        const data = await post('/api/custom-manufacturing', next)
        window.setTimeout(() => {
          setResult(data)
          setPhase('result')
        }, 900)
      } catch {
        setPhase('quiz')
      }
    }
  }

  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className="page page-atelier">
      <header className="container atelier__head">
        <Reveal className="atelier__eyebrow">
          <span className="eyebrow">Custom Manufacturing</span>
        </Reveal>
        <h1 className="atelier__title">
          <Mask block i={0}>Build your</Mask>
          <Mask block i={1}>
            <span className="italic gold">vision</span>.
          </Mask>
        </h1>
      </header>

      <div className="container atelier__stage">
        {phase === 'intro' && (
          <Reveal className="atelier__intro">
            <p className="lead">
              Three questions to define your project requirements. The factory will assess your needs and recommend a base product from our catalogue as a starting point for your bespoke order.
            </p>
            <MagneticButton onClick={begin} variant="gold" label="Begin Consultation" icon={<Drop />} strength={0} />
            <span className="atelier__intro-note muted">Direct to manufacture. ± 45 seconds.</span>
          </Reveal>
        )}

        {phase === 'quiz' && QUESTIONS[step] && (
          <Question
            key={step}
            step={step}
            total={QUESTIONS.length}
            data={QUESTIONS[step]}
            chosen={answers[QUESTIONS[step].key]}
            onChoose={choose}
            onBack={back}
          />
        )}

        {phase === 'loading' && (
          <div className="atelier__loading">
            <div className="atelier__loading-orb" />
            <span className="eyebrow">Assessing manufacturing capabilities…</span>
          </div>
        )}

        {phase === 'result' && result && <Result data={result} onRestart={begin} />}
      </div>
    </div>
  )
}

function Question({ step, total, data, chosen, onChoose, onBack }) {
  return (
    <div className="qstep">
      <div className="qstep__bar">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`qstep__seg ${i <= step ? 'is-on' : ''}`} />
        ))}
      </div>
      <div className="qstep__head">
        <span className="qstep__index">
          {String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {data.label}
        </span>
        {step > 0 && (
          <button className="qstep__back ulink" onClick={onBack} data-cursor>
            ← Back
          </button>
        )}
      </div>
      <h2 className="qstep__q serif">{data.q}</h2>
      <div className="qstep__options">
        {data.options.map((o, i) => (
          <button
            key={o.value}
            className={`qopt ${chosen === o.value ? 'is-chosen' : ''}`}
            style={{ '--i': i, '--sw-a': o.grad[0], '--sw-b': o.grad[1] }}
            onClick={() => onChoose(data.key, o.value)}
            data-cursor
          >
            <span className="qopt__swatch" />
            <span className="qopt__text">
              <span className="qopt__title serif">{o.title}</span>
              <span className="qopt__desc muted">{o.desc}</span>
            </span>
            <span className="qopt__pick">
              <ArrowRight />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Result({ data, onRestart }) {
  const { match, alternates = [], rationale } = data
  return (
    <div className="result">
      <div className="result__main">
        <Reveal className="result__visual">
          <ChromaticPlate chromatic={match.chromatic} ratio="4 / 5" className="result__plate">
            <span className="result__plate-index">{match.index}</span>
          </ChromaticPlate>
        </Reveal>
        <div className="result__body">
          <span className="eyebrow">The factory recommends</span>
          <h2 className="result__name">
            <Mask block i={0}>{match.name}</Mask>
          </h2>
          <Reveal as="p" className="result__family gold" delay={1}>
            {match.family} · {match.category}
          </Reveal>
          <Reveal as="p" className="lead result__rationale" delay={2}>
            {rationale}
          </Reveal>
          <Reveal as="p" className="muted" delay={3}>
            {match.blurb}
          </Reveal>
          <div className="result__actions">
            <MagneticButton to={`/product/${match.slug}`} variant="gold" label={`View Details`} />
            <button className="result__restart ulink" onClick={onRestart} data-cursor>
              Start over
            </button>
          </div>
        </div>
      </div>

      {alternates.length > 0 && (
        <div className="result__alts">
          <span className="eyebrow">Alternative Starting Points</span>
          <div className="result__alts-grid">
            {alternates.map((a, i) => (
              <Reveal key={a.slug} delay={i}>
                <ProductCard p={a} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
