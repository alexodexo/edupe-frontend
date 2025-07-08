// components/ErrorBoundary.js
import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Etwas ist schief gelaufen
              </h2>
              <p className="text-gray-600 mb-6">
                Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie, die Seite neu zu laden.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}