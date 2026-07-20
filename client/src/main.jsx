import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

if (!import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.DEV) {
  console.error('[PrepStack] VITE_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </StrictMode>,
)

