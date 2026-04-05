const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/Yair-/ai-lab/expense-webapp/branding/dinaria-concept-v2';
const optDir = path.join(outDir, 'options');

const variants = [
  { id: 'V1', name: 'Core Loop', p1: '#1D4ED8', p2: '#1E40AF', text: '#162351', bg: '#FFFFFF', grad: true, stroke: 18 },
  { id: 'V2', name: 'Calm Flow', p1: '#2563EB', p2: '#60A5FA', text: '#1E3A8A', bg: '#FFFFFF', grad: true, stroke: 17 },
  { id: 'V3', name: 'Solid Trust', p1: '#1E40AF', p2: '#1E40AF', text: '#1E3A8A', bg: '#FFFFFF', grad: false, stroke: 18 },
  { id: 'V4', name: 'Friendly Blue', p1: '#2563EB', p2: '#38BDF8', text: '#1E3A8A', bg: '#FFFFFF', grad: true, stroke: 16 },
  { id: 'V5', name: 'Premium Navy', p1: '#1E3A8A', p2: '#2563EB', text: '#0F1E4D', bg: '#FFFFFF', grad: true, stroke: 18 },
  { id: 'V6', name: 'Flat Modern', p1: '#1D4ED8', p2: '#3B82F6', text: '#1D3B86', bg: '#FFFFFF', grad: false, stroke: 17 }
];

function symbol(v) {
  const fill = v.grad ? `url(#g-${v.id})` : v.p1;
  const sw = v.stroke;
  const s2 = Math.max(9, Math.round(sw * 0.58));
  return `
  <defs>
    <linearGradient id="g-${v.id}" x1="18" y1="20" x2="104" y2="104" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${v.p2}"/>
      <stop offset="100%" stop-color="${v.p1}"/>
    </linearGradient>
  </defs>

  <!-- top arrow arc -->
  <path d="M28 28 H64 C83 28 97 40 97 58" stroke="${fill}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M95 46 L108 58 L95 70" stroke="${fill}" stroke-width="${s2}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- bottom arrow arc -->
  <path d="M92 92 H56 C37 92 23 80 23 62" stroke="${fill}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M25 74 L12 62 L25 50" stroke="${fill}" stroke-width="${s2}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- white D counter-shape -->
  <path d="M40 38 H60 C74 38 84 47 84 60 C84 73 74 82 60 82 H40 L52 70 H60 C66 70 70 66 70 60 C70 54 66 50 60 50 H52 Z" fill="#FFFFFF"/>
  `;
}

function icon(v) {
  return `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" fill="none">${symbol(v)}</svg>`;
}

function lockup(v) {
  return `
<svg width="1200" height="380" viewBox="0 0 1200 380" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="1200" height="380" rx="26" fill="${v.bg}"/>
  <g transform="translate(64 130)">${icon(v)}</g>
  <text x="225" y="208" font-family="Avenir Next, Sora, Poppins, Segoe UI, Arial, sans-serif" font-size="104" font-weight="700" fill="${v.text}">Dinaria</text>
  <text x="228" y="250" font-family="Avenir Next, Sora, Poppins, Segoe UI, Arial, sans-serif" font-size="30" font-weight="500" fill="#52607A">${v.id} · ${v.name}</text>
</svg>`;
}

for (const v of variants) {
  fs.writeFileSync(path.join(optDir, `dinaria-${v.id}.svg`), lockup(v));
  fs.writeFileSync(path.join(optDir, `dinaria-${v.id}-icon.svg`), icon(v));
}

const cols = 2;
const cardW = 620;
const cardH = 265;
const gap = 28;
const rows = Math.ceil(variants.length / cols);
const boardW = gap + cols * cardW + (cols - 1) * gap + gap;
const headH = 132;
const boardH = headH + gap + rows * cardH + (rows - 1) * gap + gap;

let cards = '';
for (let i = 0; i < variants.length; i++) {
  const v = variants[i];
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = gap + col * (cardW + gap);
  const y = headH + gap + row * (cardH + gap);
  cards += `
  <g transform="translate(${x} ${y})">
    <rect width="${cardW}" height="${cardH}" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>
    <g transform="translate(30 72)">${icon(v)}</g>
    <text x="196" y="130" font-family="Avenir Next, Sora, Poppins, Segoe UI, Arial, sans-serif" font-size="66" font-weight="700" fill="${v.text}">Dinaria</text>
    <text x="198" y="170" font-family="Avenir Next, Sora, Poppins, Segoe UI, Arial, sans-serif" font-size="25" fill="#4B5C7A">${v.id} · ${v.name}</text>
    <text x="198" y="206" font-family="Avenir Next, Sora, Poppins, Segoe UI, Arial, sans-serif" font-size="18" fill="#64748B">${v.p1}${v.p2 !== v.p1 ? ` · ${v.p2}` : ''}</text>
  </g>`;
}

const board = `
<svg width="${boardW}" height="${boardH}" viewBox="0 0 ${boardW} ${boardH}" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="${boardW}" height="${boardH}" fill="#EDF2FF"/>
  <text x="${gap}" y="58" font-family="Avenir Next, Sora, Poppins, Segoe UI, Arial, sans-serif" font-size="42" font-weight="700" fill="#0F172A">Dinaria · Ronda nueva (6 opciones pulidas)</text>
  <text x="${gap}" y="94" font-family="Avenir Next, Sora, Poppins, Segoe UI, Arial, sans-serif" font-size="22" fill="#475569">Concepto: D con flechas de flujo · objetivo: serio, limpio, memorable</text>
  ${cards}
</svg>`;
fs.writeFileSync(path.join(outDir, 'dinaria-concept-v2-board.svg'), board);

const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Dinaria V2</title>
<style>
body{margin:0;background:#EDF2FF;font-family:Avenir Next,Sora,Poppins,Segoe UI,Arial,sans-serif;color:#0F172A}
header{position:sticky;top:0;background:#fff;border-bottom:1px solid #E2E8F0;padding:16px 20px;z-index:2}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:14px;padding:16px 20px 24px}
.card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:10px;text-decoration:none;color:inherit}
.card img{width:100%;display:block;border-radius:10px;background:#F8FAFC}
.meta{padding:8px 2px;font-size:14px;color:#334155}
.btn{display:inline-block;padding:10px 14px;border:1px solid #CBD5E1;border-radius:10px;text-decoration:none;color:#1E293B;font-weight:600;background:#fff}
</style></head><body>
<header><h1 style="margin:0 0 8px;font-size:26px">Dinaria · v2</h1><a class="btn" href="dinaria-concept-v2-board.svg" target="_blank">Abrir lamina</a></header>
<section class="grid">
${variants.map(v => `<a class="card" href="options/dinaria-${v.id}.svg" target="_blank"><img src="options/dinaria-${v.id}.svg" alt="${v.id}"/><div class="meta"><strong>${v.id}</strong> · ${v.name}</div></a>`).join('')}
</section></body></html>`;
fs.writeFileSync(path.join(outDir, 'dinaria-concept-v2.html'), html);
console.log('done');
