import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Welcome from './Welcome.tsx'
import App from './App.tsx'

const esAdmin = window.location.pathname.replace(/\/$/, '') === '/admin'

// / -> bienvenida pública (con botón de WhatsApp)
// /admin -> panel privado con login (cookie firmada server-side)
createRoot(document.getElementById('root')!).render(
  <StrictMode>{esAdmin ? <App /> : <Welcome />}</StrictMode>,
)
