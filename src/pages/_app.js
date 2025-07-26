// src/pages/_app.js
import '@/styles/globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { NotificationProvider } from '@/lib/notifications'

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </ErrorBoundary>
  )
}