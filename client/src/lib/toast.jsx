import { createContext, useCallback, useContext, useState } from 'react'
import { Check } from '../components/Icons.jsx'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (message, opts = {}) => {
      const id = ++_id
      setToasts((t) => [...t, { id, message, kicker: opts.kicker }])
      window.setTimeout(() => dismiss(id), opts.duration || 3200)
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toaster" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div className="toast" key={t.id} role="status">
            <span className="toast__mark">
              <Check />
            </span>
            <span className="toast__body">
              {t.kicker && <span className="toast__kicker">{t.kicker}</span>}
              <span className="toast__msg">{t.message}</span>
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
