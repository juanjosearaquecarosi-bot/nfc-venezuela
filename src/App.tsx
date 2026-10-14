import { useEffect, useState } from 'react'
import './admin.css'

type Card = {
  code: string
  url: string | null
  business: string | null
  scans: number
  last_scan: string | null
  created_at: string
}

type Draft = { url: string; business: string }
type View = 'checking' | 'login' | 'panel'

const APP_URL = 'https://nfc.com.ve' // cámbialo si cambia el dominio

function App() {
  const [view, setView] = useState<View>('checking')
  const [cards, setCards] = useState<Card[]>([])
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [saving, setSaving] = useState('')
  const [saved, setSaved] = useState('')

  async function loadCards() {
    const r = await fetch('/api/admin')
    if (r.status === 401) {
      setView('login')
      return
    }
    if (!r.ok) {
      setLoginError('Error cargando datos. ¿Configuraste SUPABASE_URL y SUPABASE_SERVICE_KEY?')
      setView('login')
      return
    }
    const data: Card[] = await r.json()
    setCards(data)
    setDrafts(
      Object.fromEntries(
        data.map((c) => [c.code, { url: c.url ?? '', business: c.business ?? '' }]),
      ),
    )
    setView('panel')
  }

  useEffect(() => {
    loadCards().catch(() => setView('login'))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        setLoginError(data.error || 'Clave incorrecta')
        return
      }
      setPassword('')
      await loadCards()
    } catch {
      setLoginError('No se pudo conectar con el servidor')
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/login', { method: 'DELETE' })
    setCards([])
    setDrafts({})
    setView('login')
  }

  async function saveCard(c: Card) {
    const d = drafts[c.code]
    setSaving(c.code)
    setSaved('')
    try {
      const r = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: c.code, url: d.url, business: d.business }),
      })
      if (r.ok) {
        setCards((prev) =>
          prev.map((x) => (x.code === c.code ? { ...x, url: d.url || null, business: d.business || null } : x)),
        )
        setSaved(c.code)
        setTimeout(() => setSaved(''), 2500)
      } else {
        const data = await r.json().catch(() => ({}))
        alert(data.error || 'Error guardando')
      }
    } finally {
      setSaving('')
    }
  }

  function setDraft(code: string, field: keyof Draft, value: string) {
    setDrafts((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }))
  }

  if (view === 'checking') {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (view === 'login') {
    return (
      <div className="center-screen">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="lock">🔒</div>
          <h1>Panel NFC</h1>
          <p className="muted">Área restringida · asignación de QRs</p>
          <input
            type="password"
            placeholder="Clave de acceso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
          {loginError && <p className="error">{loginError}</p>}
          <button type="submit" disabled={loggingIn || !password}>
            {loggingIn ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  const active = cards.filter((c) => c.url).length

  return (
    <div className="panel">
      <header className="panel-header">
        <div>
          <h1>Panel NFC — Asignación de QRs</h1>
          <p className="muted">
            {active} de {cards.length} tarjetas activas
          </p>
        </div>
        <button className="ghost" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="cards">
        {cards.map((c) => (
          <section key={c.code} className={`card ${c.url ? 'is-active' : ''}`}>
            <div className="card-top">
              <span className="code">{c.code}</span>
              <span className={`badge ${c.url ? 'on' : 'off'}`}>{c.url ? 'Activa' : 'Sin activar'}</span>
            </div>

            <label>
              Negocio
              <input
                value={drafts[c.code]?.business ?? ''}
                onChange={(e) => setDraft(c.code, 'business', e.target.value)}
                placeholder="Nombre del negocio"
              />
            </label>

            <label>
              Link de reseñas (Google)
              <input
                value={drafts[c.code]?.url ?? ''}
                onChange={(e) => setDraft(c.code, 'url', e.target.value)}
                placeholder="https://g.page/r/XXXX/review"
                inputMode="url"
              />
            </label>

            <p className="muted small">
              Destino del QR: <code>{`${APP_URL}/r/${c.code}`}</code>
              {c.scans > 0 && <> · {c.scans} escaneos</>}
            </p>

            <button
              className={saved === c.code ? 'done' : ''}
              disabled={saving === c.code}
              onClick={() => saveCard(c)}
            >
              {saving === c.code ? 'Guardando…' : saved === c.code ? 'Guardado ✓' : 'Guardar'}
            </button>
          </section>
        ))}
      </div>
    </div>
  )
}

export default App
