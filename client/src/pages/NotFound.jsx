import { Mask, Reveal } from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'

export default function NotFound() {
  return (
    <div className="page page-404">
      <div className="container nf">
        <span className="eyebrow">Error 404</span>
        <h1 className="nf__title">
          <Mask block i={0}>This page</Mask>
          <Mask block i={1}>
            has <span className="italic gold">evaporated</span>.
          </Mask>
        </h1>
        <Reveal as="p" className="lead nf__lede" delay={2}>
          Like a top note, it was here a moment ago. Let us guide you back to something
          that lingers.
        </Reveal>
        <div className="nf__actions">
          <MagneticButton to="/" variant="primary" label="Return home" />
          <MagneticButton to="/collections" variant="ghost" label="The library" />
        </div>
      </div>
    </div>
  )
}
