import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import './WhyChooseBarira.css'

const PROOFS = [
  {
    num: '01',
    title: 'Direct Manufacturer',
    image: '/images/why_barira_01.png',
    points: ['No intermediaries', 'Factory-direct pricing', 'Full production control'],
    stats: '100% In-House Production'
  },
  {
    num: '02',
    title: 'Pure Materials',
    image: '/images/why_barira_02.png',
    points: ['Solid Brass', 'Pure Copper', 'Cast Iron'],
    stats: 'Premium Grade Metals'
  },
  {
    num: '03',
    title: 'Bespoke Production',
    image: '/images/why_barira_03.png',
    points: ['Custom dimensions', 'Custom finishes', 'OEM / private label', 'Prototype development'],
    stats: 'Tailored to Specification'
  },
  {
    num: '04',
    title: 'Global Export',
    image: '/images/why_barira_04.png',
    points: ['Global shipping to 10+ countries', 'Export documentation', 'Protective packaging', 'Reliable logistics'],
    stats: 'Working with 10+ Countries'
  },
  {
    num: '05',
    title: 'Built to Last',
    image: '/images/why_barira_05.png',
    points: ['Hand-finished', 'Heavy-gauge construction', 'Durable finishes', 'Made to last for decades'],
    stats: 'Generational Durability'
  },
  {
    num: '06',
    title: 'Since 1993',
    image: '/images/why_barira_06.png',
    points: ['Established in 1993', 'Decades of metalworking expertise', 'Traditional techniques & modern production'],
    stats: 'Over 30 Years of Heritage'
  }
]

export default function WhyChooseBarira() {
  const containerRef = useRef(null)
  
  // Track scroll progress through the 600vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  // Map progress (0 to 1) to an active index (0 to 5)
  // We have 6 items. Progress breakpoints are roughly at 0, 0.2, 0.4, 0.6, 0.8, 1
  const activeIndexRaw = useTransform(scrollYProgress, [0, 0.95], [0, 5])
  
  // Use state to hold integer active index so we can trigger React renders
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const unsub = activeIndexRaw.on('change', (v) => {
      setActiveIndex(Math.round(v))
    })
    return () => unsub()
  }, [activeIndexRaw])

  const activeProof = PROOFS[activeIndex]

  return (
    <section className="spec-wall" ref={containerRef}>
      <div className="spec-wall__sticky">
        
        {/* Background images crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProof.num}
            className="spec-wall__bg"
            style={{ backgroundImage: `url(${activeProof.image})` }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>

        <div className="spec-wall__content">
          <div className="spec-wall__left">
            <h3 className="spec-wall__title section-heading-unified">WHY BARIRA</h3>
            <div className="spec-wall__nav">
              {PROOFS.map((proof, i) => (
                <div 
                  key={proof.num} 
                  className={`spec-wall__num ${i === activeIndex ? 'is-active' : ''}`}
                >
                  {proof.num}
                  <div className="spec-wall__num-line"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="spec-wall__right">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProof.num}
                className="spec-wall__panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              >
                <div className="spec-wall__stats">{activeProof.stats}</div>
                <h4 className="spec-wall__panel-title">{activeProof.title}</h4>
                <div className="spec-wall__points">
                  {activeProof.points.map((point, j) => (
                    <motion.div 
                      key={j} 
                      className="spec-wall__point"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (j * 0.1) }}
                    >
                      {point}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
