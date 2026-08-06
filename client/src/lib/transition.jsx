import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const TransitionContext = createContext(null)
export const useTransition = () => useContext(TransitionContext)

const COVER_MS = 640
const REVEAL_MS = 760

/**
 * Curtain page transitions. go(to) raises an ink curtain, swaps the route while
 * the screen is covered, then lifts the curtain to reveal the new room.
 */
export function TransitionProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [phase, setPhase] = useState('idle') // idle | cover | reveal
  const busy = useRef(false)

  const go = useCallback(
    (to) => {
      if (busy.current || to === location.pathname) return
      busy.current = true
      setPhase('cover')
      window.setTimeout(() => {
        navigate(to)
        setPhase('reveal')
      }, COVER_MS)
      window.setTimeout(() => {
        setPhase('idle')
        busy.current = false
      }, COVER_MS + REVEAL_MS)
    },
    [navigate, location.pathname]
  )

  return (
    <TransitionContext.Provider value={{ go, phase }}>
      {children}
      <Curtain phase={phase} />
    </TransitionContext.Provider>
  )
}

function Curtain({ phase }) {
  return (
    <div className="curtain" data-phase={phase} aria-hidden="true">
      <div className="curtain__panel">
        <span className="curtain__mark serif">Barha</span>
      </div>
    </div>
  )
}
