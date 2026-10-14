// Pantalla pública de bienvenida de nfc.com.ve
// Panel privado: /admin
const WHATSAPP = 'https://wa.me/584168747251'

export default function Welcome() {
  const tarjeta = new URLSearchParams(window.location.search).get('tarjeta')

  return (
    <main className="welcome">
      <div className="welcome-card">
        <div className="welcome-logo" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="72" height="72" role="img" aria-label="NFC">
            <defs>
              <linearGradient id="nfcGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#4f8cff" />
                <stop offset="1" stopColor="#22a06b" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="30" fill="none" stroke="url(#nfcGrad)" strokeWidth="3" />
            <text
              x="32"
              y="40"
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
              fill="url(#nfcGrad)"
              fontFamily="monospace"
            >
              NFC
            </text>
            <path
              d="M22 18c-6 6-6 22 0 28 M47 18c6 6 6 22 0 28"
              stroke="url(#nfcGrad)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1>NFC Táchira</h1>
        <p className="welcome-sub">
          Tarjetas NFC para negocios: tu cliente acerca la tarjeta a su teléfono y deja su reseña
          en Google en segundos.
        </p>

        <ol className="welcome-steps">
          <li>
            <span aria-hidden="true">📲</span> Acerca el teléfono a la tarjeta
          </li>
          <li>
            <span aria-hidden="true">⭐</span> Se abre Google Maps con tu negocio
          </li>
          <li>
            <span aria-hidden="true">✍️</span> Reseña lista en dos toques
          </li>
        </ol>

        {tarjeta && (
          <p className="welcome-tarjeta">
            La tarjeta <strong>{tarjeta}</strong> aún no está activada. Si la acabas de comprar,
            escríbenos por WhatsApp para dejarla lista.
          </p>
        )}

        <a className="wa-btn" href={WHATSAPP} target="_blank" rel="noreferrer">
          <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M16.04 4c-6.63 0-12 5.38-12 12 0 2.11.55 4.17 1.6 5.99L4 28l6.18-1.62a12 12 0 0 0 5.86 1.6c6.62 0 12-5.38 12-12s-5.38-12-12-12zm0 21.93c-1.85 0-3.66-.5-5.24-1.43l-.38-.22-3.87 1.02 1.03-3.77-.25-.4a9.86 9.86 0 0 1-1.51-5.28c0-5.5 4.47-9.97 9.97-9.97 5.5 0 9.97 4.47 9.97 9.97s-4.47 10.08-9.72 10.08z" />
            <path d="M11.5 9.5c-.28-.66-.58-.67-.85-.68l-.72-.01c-.25 0-.66.09-1 .49-.34.4-1.31 1.27-1.31 3.1 0 1.82 1.34 3.58 1.53 3.83.19.25 2.6 3.98 6.3 5.58 3.11 1.34 3.75 1.07 4.42 1.01.67-.06 2.17-.89 2.48-1.75.31-.86.31-1.6.22-1.75-.09-.16-.34-.25-.72-.44s-2.17-1.07-2.51-1.19c-.34-.12-.58-.19-.83.19-.25.37-.94 1.19-1.16 1.44-.21.25-.42.28-.78.1-.37-.19-1.56-.58-2.97-1.84-1.1-.98-1.84-2.19-2.06-2.56-.21-.37-.02-.57.16-.76.17-.17.37-.44.56-.66.19-.22.25-.37.37-.62.13-.25.06-.47-.03-.66-.09-.19-.81-2.02-1.1-2.77z" />
          </svg>
          Contáctanos por WhatsApp
        </a>

        <footer className="welcome-footer">
          <span>© NFC Táchira</span>
          <a href="/admin">Panel</a>
        </footer>
      </div>
    </main>
  )
}
