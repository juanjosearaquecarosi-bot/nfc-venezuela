// Vercel serverless: nfc.com.ve/r/007 -> link de reseñas del negocio asignado a la 007
// Variables de entorno en Vercel: SUPABASE_URL, SUPABASE_SERVICE_KEY (nunca en el frontend)
export default async function handler(req: any, res: any) {
  const code = String(req.query.code || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 20);
  const base = `${process.env.SUPABASE_URL}/rest/v1/cards`;
  const key = process.env.SUPABASE_SERVICE_KEY as string;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  res.setHeader('Cache-Control', 'no-store'); // así cambiar el destino aplica al instante

  try {
    const r = await fetch(`${base}?code=eq.${code}&select=url,scans`, { headers });
    const [card] = await r.json();

    if (!card || !card.url) return res.redirect(302, `/?tarjeta=${code}`); // sin activar -> tu página

    await fetch(`${base}?code=eq.${code}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ scans: card.scans + 1, last_scan: new Date().toISOString() }),
    });
    return res.redirect(302, card.url);
  } catch {
    return res.redirect(302, '/');
  }
}
