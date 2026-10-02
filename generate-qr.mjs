// Uso: npm i qrcode && node generate-qr.mjs
// Genera qr/001.svg ... y qr/hoja.html (hoja imprimible con el número bajo cada QR)
import QRCode from 'qrcode';
import { mkdirSync, writeFileSync } from 'node:fs';

const DOMAIN = 'https://nfc.com.ve'; // confirma que ya funciona antes de imprimir
const TOTAL = 24;
mkdirSync('qr', { recursive: true });

let cells = '';
for (let n = 1; n <= TOTAL; n++) {
  const code = String(n).padStart(3, '0');
  const svg = await QRCode.toString(`${DOMAIN}/r/${code}`, {
    type: 'svg', errorCorrectionLevel: 'H', margin: 1,
  });
  writeFileSync(`qr/${code}.svg`, svg);
  cells += `<div class="c">${svg}<b>${code}</b></div>`;
}

writeFileSync('qr/hoja.html', `<!doctype html><meta charset="utf-8"><title>QR NFC Venezuela</title>
<style>
  body{font-family:sans-serif;margin:10mm}
  .g{display:grid;grid-template-columns:repeat(4,1fr);gap:8mm}
  .c{text-align:center}.c svg{width:30mm;height:30mm}
  .c b{display:block;font-size:12pt;letter-spacing:1px}
</style><div class="g">${cells}</div>`);

console.log(`Listo: ${TOTAL} QR en ./qr (abre qr/hoja.html)`);
