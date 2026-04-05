const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/Yair-/ai-lab/expense-webapp/branding/dinaria-concept-polish';
const optionsDir = path.join(outDir, 'options');

const variants = [
  {
    id: 'P1',
    name: 'Balanced Flow',
    primary: '#1D4ED8',
    secondary: '#2563EB',
    text: '#1E3A8A',
    style: 'balanced'
  },
  {
    id: 'P2',
    name: 'Flat Precision',
    primary: '#1E40AF',
    secondary: '#3B82F6',
    text: '#1E3A8A',
    style: 'flat'
  },
  {
    id: 'P3',
    name: 'Friendly Rounded',
    primary: '#2563EB',
    secondary: '#38BDF8',
    text: '#1E3A8A',
    style: 'rounded'
  }
];

function symbol(v) {
  if (v.style === 'balanced') {
    return `
      <defs>
        <linearGradient id="g-${v.id}" x1="18" y1="20" x2="100" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${v.secondary}"/>
          <stop offset="100%" stop-color="${v.primary}"/>
        </linearGradient>
      </defs>
      <path d="M34 18h53l16 16-12 12-10-10H45l-8 40 12 12-16 16-20-20z" fill="url(#g-${v.id})"/>
      <path d="M31 102h53c19 0 32-12 36-28 3-11 1-23-7-33l-12 12c2 4 2 9 1 14-2 8-9 16-18 16H50l-10-10-16 16z" fill="url(#g-${v.id})"/>
      <path d="M44 42h29c10 0 16 6 16 15 0 4-2 8-4 11l-24 24H40l16-16h9l12-12c1-1 2-3 2-4 0-4-2-7-8-7H44z" fill="#FFFFFF"/>
    `;
  }
  if (v.style === 'flat') {
    return `
      <path d="M35 18h52l16 16-12 12-10-10H46l-8 39 11 11-16 16-20-20z" fill="${v.primary}"/>
      <path d="M30 101h54c18 0 30-11 34-27 3-11 1-23-7-32L99 54c2 3 2 8 1 13-2 8-8 15-17 15H50l-10-10-16 16z" fill="${v.secondary}"/>
      <path d="M45 42h28c10 0 16 6 16 15 0 4-2 8-4 11L61 92H41l15-15h8l12-12c2-2 3-3 3-5 0-4-3-7-9-7H45z" fill="#FFFFFF"/>
    `;
  }
  return `
    <defs>
      <linearGradient id="g-${v.id}" x1="14" y1="16" x2="106" y2="106" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${v.secondary}"/>
        <stop offset="100%" stop-color="${v.primary}"/>
      </linearGradient>
    </defs>
    <path d="M35 18h50c2 0 4 1 6 2l14 14c2 2 2 5 0 7L95 51c-2 2-5 2-7 0l-7-7H47l-7 33 9 9c2 2 2 5 0 7L38 104c-2 2-5 2-7 0L13 86c-2-2-2-4-2-7l11-54c1-4 4-7 8-7z" fill="url(#g-${v.id})"/>
    <path d="M30 102h54c19 0 32-12 36-28 3-10 1-22-6-31-2-3-6-3-9 0L95 53c-2 2-2 4-1 6 2 3 2 7 1 11-2 8-9 15-17 15H51l-8-8c-2-2-5-2-7 0L20 92c-3 3-2 8 1 10 3 1 6 0 9 0z" fill="url(#g-${v.id})"/>
    <path d="M45 43h28c10 0 16 6 16 15 0 5-2 9-5 12L61 93H41l16-16h9l11-11c2-2 3-4 3-6 0-4-3-8-10-8H45z" fill="#FFFFFF"/>
  `;
}

function icon(v) {
  return `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" fill="none">${symbol(v)}</svg>`;
}

function lockup(v) {
  return `
<svg width="1280" height="420" viewBox="0 0 1280 420" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="1280" height="420" rx="30" fill="#F8FAFC"/>
  <g transform="translate(88 150)">${icon(v)}</g>
  <text x="260" y="248" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="110" font-weight="700" fill="${v.text}">Dinaria</text>
  <text x="262" y="294" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="30" font-weight="500" fill="#475569">Finanzas claras para todos</text>
  <text x="262" y="336" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="24" font-weight="600" fill="#64748B">${v.id} - ${v.name}</text>
</svg>`;
}

variants.forEach(v => {
  fs.writeFileSync(path.join(optionsDir, `dinaria-${v.id}.svg`), lockup(v));
  fs.writeFileSync(path.join(optionsDir, `dinaria-${v.id}-icon.svg`), icon(v));
});

const boardW = 1320;
const boardH = 1120;
const cards = variants.map((v, i) => {
  const y = 140 + i * 310;
  return `
    <g transform="translate(20 ${y})">
      <rect width="1280" height="280" rx="24" fill="#FFFFFF" stroke="#E2E8F0"/>
      <g transform="translate(40 80)">${icon(v)}</g>
      <text x="210" y="146" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="84" font-weight="700" fill="${v.text}">Dinaria</text>
      <text x="214" y="186" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="26" fill="#475569">${v.id} - ${v.name}</text>
      <text x="214" y="220" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="20" fill="#64748B">Primary ${v.primary} | Secondary ${v.secondary}</text>
    </g>
  `;
}).join('');

const board = `
<svg width="${boardW}" height="${boardH}" viewBox="0 0 ${boardW} ${boardH}" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="${boardW}" height="${boardH}" fill="#EEF2FF"/>
  <text x="20" y="58" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="44" font-weight="700" fill="#0F172A">Dinaria - 3 variantes pulidas del concepto</text>
  <text x="20" y="95" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="22" fill="#475569">Misma idea (flechas + D), con mejor equilibrio, legibilidad y escalabilidad</text>
  ${cards}
</svg>`;

fs.writeFileSync(path.join(outDir, 'dinaria-concept-polish-board.svg'), board);

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dinaria Concept Polish</title>
<style>
body{margin:0;background:#EEF2FF;font-family:Poppins,Segoe UI,Arial,sans-serif;color:#0F172A}
header{position:sticky;top:0;background:#fff;border-bottom:1px solid #E2E8F0;padding:16px 20px}
.grid{display:grid;grid-template-columns:1fr;gap:14px;padding:16px 20px 24px}
.card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:10px;text-decoration:none;color:inherit}
.card img{width:100%;display:block;border-radius:10px;background:#F8FAFC}
.meta{padding:8px 2px;font-size:14px;color:#334155}
.btn{display:inline-block;padding:10px 14px;border:1px solid #CBD5E1;border-radius:10px;text-decoration:none;color:#1E293B;font-weight:600;background:#fff}
</style></head><body>
<header><h1 style="margin:0 0 8px;font-size:26px">Dinaria - variantes pulidas</h1><a class="btn" href="dinaria-concept-polish-board.svg" target="_blank">Abrir lamina</a></header>
<section class="grid">
${variants.map(v=>`<a class="card" href="options/dinaria-${v.id}.svg" target="_blank"><img src="options/dinaria-${v.id}.svg" alt="${v.id}"><div class="meta"><strong>${v.id}</strong> - ${v.name}</div></a>`).join('')}
</section></body></html>`;
fs.writeFileSync(path.join(outDir, 'dinaria-concept-polish.html'), html);

console.log('created', outDir);
