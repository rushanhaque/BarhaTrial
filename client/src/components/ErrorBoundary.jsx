import { Component } from 'react'

// Isolates a route failure so a single page error never blanks the whole maison.
// Remounted per-route (via key) so navigating away clears the error.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[BARHA] route error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page page-404">
          <div className="container nf">
            <span className="eyebrow">An imperfection</span>
            <h1 className="nf__title serif">
              Something in the
              <br />
              <span className="italic gold">composition</span> broke.
            </h1>
            <p className="lead nf__lede">
              A rare fault in the atelier. Return to the entrance and the house will
              compose itself anew.
            </p>
            <div className="nf__actions">
              <a className="btn btn--primary" href="/">
                <span className="btn__label">Return home</span>
                <span className="btn__icon">↗</span>
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
