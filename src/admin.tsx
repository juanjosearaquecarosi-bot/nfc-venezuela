import { useEffect, useState } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

type Card = {
  code: string
  url: string | null
  business: string | null
  scans: number
  last_scan: string | null
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [estado, setEstado] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase
      .from('cards')
      .select('code,url,business,scans,last_scan')
      .order('code')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setCards((data ?? []) as Card[])
      })
  }, [session])

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: clave })
    if (error) setError('Email o clave incorrectos')
  }

  const editar = (code: string, campo: 'url' | 'business', valor: string) =>
    setCards((cs) => cs.map((c) => (c.code === code ? { ...c, [campo]: valor } : c)))

  const guardar = async (c: Card) => {
    const url = c.url?.trim() || null
    if (url && !/^https?:\/\//.test(url)) {
      setEstado((s) => ({ ...s, [c.code]: 'El link debe empezar con https://' }))
      return
    }
    setEstado((s) => ({ ...s, [c.code]: 'Guardando…' }))
    const { data, error } = await supabase
      .from('cards')
      .update({ url, business: c.business?.trim() || null })
      .eq('code', c.code)
      .select()
    const falla = error?.message ?? (!data || data.length === 0 ? 'No se guardó (permiso)' : '')
    setEstado((s) => ({ ...s, [c.code]: falla ? `Error: ${falla}` : 'Guardado ✓' }))
  }

  const caja = { maxWidth: 960, margin: '0 auto', padding: 16, textAlign: 'left' as const }

  if (cargando) return <div style={caja}>Cargando…</div>

  if (!session)
    return (
      <div style={caja}>
        <h2>Panel NFC Venezuela</h2>
        <form onSubmit={entrar} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Clave" value={clave} onChange={(e) => setClave(e.target.value)} />
          <button type="submit">Entrar</button>
          {error && <span style={{ color: 'crimson' }}>{error}</span>}
        </form>
      </div>
    )

  return (
    <div style={caja}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>QR y links</h2>
        <button onClick={() => supabase.auth.signOut()}>Salir</button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {cards.map((c) => (
          <div
            key={c.code}
            style={{ display: 'grid', gap: 6, padding: 10, border: '1px solid #8884', borderRadius: 8 }}
          >
            <b>
              QR {c.code} · {c.scans} escaneos
              {c.last_scan ? ` · último: ${new Date(c.last_scan).toLocaleString('es-VE')}` : ''}
            </b>
            <input
              placeholder="Nombre del negocio (opcional)"
              value={c.business ?? ''}
              onChange={(e) => editar(c.code, 'business', e.target.value)}
            />
            <input
              placeholder="https://search.google.com/local/writereview?placeid=..."
              value={c.url ?? ''}
              onChange={(e) => editar(c.code, 'url', e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => guardar(c)}>Guardar</button>
              <span>{estado[c.code]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
