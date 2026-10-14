import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// El panel de / y /admin es el mismo: login con ADMIN_PASSWORD (cookie firmada server-side).
// Admin.tsx (Supabase Auth) queda en el repo por si se quiere restaurar esa variante.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
