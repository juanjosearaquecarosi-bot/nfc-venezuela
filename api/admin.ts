// Vercel serverless: GET /api/admin  -> lista las tarjetas
//                     PATCH /api/admin -> asigna url/business a un código
// Requiere cookie de sesión válida (la pone /api/login).
// Variables de entorno en Vercel: SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_PASSWORD | SESSION_SECRET
import crypto from 'node:crypto'

const COOKIE = 'nfc_session'

// Debe ser idéntico al hmac() de api/login.ts (mismo formato de firma)
function hmac(exp: number) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '').update(`nfc|${exp}`).digest('base64url')
}

function authed(req: any): boolean {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
  const raw = String(req.headers.cookie || '')
    .split(';')
    .map((s: string) => s.trim())
    .find((s: string) => s.startsWith(`${COOKIE}=`))
  if (!raw || !secret) return false

  const [expStr, sig] = raw.slice(COOKIE.length + 1).split('.')
  const exp = Number(expStr)
  if (!exp || exp < Date.now() || !sig) return false

  const expected = hmac(exp)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export default async function handler(req: any, res: any) {
  if (!authed(req)) return res.status(401).json({ error: 'no autorizado' })

  const base = `${process.env.SUPABASE_URL}/rest/v1/cards`
  const key = process.env.SUPABASE_SERVICE_KEY as string
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  if (req.method === 'GET') {
    const r = await fetch(`${base}?select=*&order=code.asc`, { headers })
    return res.status(r.ok ? 200 : 500).json(await r.json())
  }

  if (req.method === 'PATCH') {
    const digits = String(req.body?.code ?? '').replace(/[^0-9]/g, '')
    if (!digits || digits.length > 3) return res.status(400).json({ error: 'Código inválido' })
    const code = digits.padStart(3, '0')

    const url = String(req.body?.url ?? '').trim() || null
    if (url && !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: 'La URL debe empezar por http:// o https://' })
    }
    const business = String(req.body?.business ?? '').trim() || null

    const r = await fetch(`${base}?code=eq.${code}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ url, business }),
    })
    if (!r.ok) return res.status(500).json({ error: 'Error guardando en Supabase' })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
