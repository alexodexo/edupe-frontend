// src/components/ErrorBoundary.js
import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Oops! Etwas ist schief gelaufen.</h1>
            <p className="text-gray-600 mb-4">Bitte laden Sie die Seite neu.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}