// Vercel serverless: POST /api/login  -> inicia sesión en el panel
//                     DELETE /api/login -> cierra sesión
// Variables de entorno en Vercel: ADMIN_PASSWORD (y opcionalmente SESSION_SECRET)
import crypto from 'node:crypto'

const COOKIE = 'nfc_session'
const HS = 12 // horas que dura la sesión

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

export function hmac(exp: number) {
  return crypto.createHmac('sha256', secret()).update(`nfc|${exp}`).digest('base64url')
}

export default async function handler(req: any, res: any) {
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
    return res.status(204).end()
  }

  if (req.method !== 'POST') return res.status(405).end()

  const pwd = process.env.ADMIN_PASSWORD
  if (!pwd) {
    return res.status(500).json({ error: 'Falta la variable de entorno ADMIN_PASSWORD en Vercel' })
  }

  const password = String(req.body?.password ?? '')
  const a = Buffer.from(password.padEnd(128, '\0'))
  const b = Buffer.from(pwd.padEnd(128, '\0'))
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b)

  if (!ok) return res.status(401).json({ error: 'Clave incorrecta' })

  // Token: "<vencimiento>.<firma HMAC>" — inmodificable sin el secreto del servidor
  const exp = Date.now() + HS * 3_600_000
  const token = `${exp}.${hmac(exp)}`

  // Secure solo en producción (Vercel es https; en `vercel dev`/localhost sería http)
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${HS * 3600}${secure}`,
  )
  return res.status(200).json({ ok: true })
}
