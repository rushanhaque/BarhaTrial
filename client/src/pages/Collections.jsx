import { useEffect } from 'react'
import { Reveal, Mask } from '../components/Reveal.jsx'
import Marquee from '../components/Marquee.jsx'
import TLink from '../components/TLink.jsx'
import { ArrowUR } from '../components/Icons.jsx'
import CollectionsDolly from '../components/CollectionsDolly.jsx'
import { COLLECTIONS_ITEMS } from '../data/categories.js'

export default function Collections() {
  return (
    <div className="page page-collections">
      <header className="section pagehead">
        <div className="container">
          <Reveal className="pagehead__eyebrow">
            <span className="eyebrow gold">Curated Series</span>
          </Reveal>
          <h1 className="pagehead__title">
            <Mask block i={0}>The Master</Mask>{' '}
            <Mask block i={1}>
              <span className="italic gold">Collections</span>.
            </Mask>
          </h1>
          <Reveal as="p" className="lead pagehead__lede" delay={2}>
            Explore our curated catalog of handcrafted metalwork — forged from heavy brass, cast iron, copper, and bronze for export worldwide.
          </Reveal>
        </div>
      </header>

      <CollectionsDolly categories={COLLECTIONS_ITEMS} />


      {/* Footer Banner */}
      <Marquee
        className="collections__marquee"
        items={['Pure Brass Works', 'Hand Hammered Details', 'Export Standard Metalcraft', 'Cast Iron & Copper', 'Barira Handicrafts']}
        duration={42}
      />
    </div>
  )
}
