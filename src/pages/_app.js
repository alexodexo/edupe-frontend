// src/pages/_app.js
import '@/styles/globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { NotificationProvider } from '@/lib/notifications'
import { AuthProvider } from '@/lib/auth'

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}