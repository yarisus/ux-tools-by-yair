const fs = require('fs');
const path = require('path');

const outDir = path.join('C:/Users/Yair-/ai-lab/expense-webapp/branding/logo-lab');
const optionsDir = path.join(outDir, 'options');

const BRAND = '#3C499D';
const palettes = [
  ['#3C499D', '#0EA5E9'],
  ['#3C499D', '#16A34A'],
  ['#3C499D', '#F59E0B'],
  ['#3C499D', '#06B6D4'],
  ['#3C499D', '#8B5CF6'],
  ['#3C499D', '#EF4444'],
  ['#3C499D', '#10B981'],
  ['#3C499D', '#6366F1'],
  ['#3C499D', '#14B8A6'],
  ['#3C499D', '#2563EB'],
];

const families = [
  'dcheck',
  'shieldbars',
  'coinring',
  'wallet',
  'housechart',
  'handcoin',
  'linkloop',
  'calendarpeso',
  'pulsecircle',
  'barsd'
];

const styles = ['solid', 'outline', 'twotone', 'badge', 'rounded'];

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const b2 = Math.round(a.b + (b.b - a.b) * t);
  return rgbToHex(r, g, b2);
}

function lighten(hex, amount = 0.86) {
  return mix(hex, '#FFFFFF', amount);
}

function darken(hex, amount = 0.3) {
  return mix(hex, '#000000', amount);
}

function iconBg(style, primary) {
  const soft = lighten(primary, 0.88);
  if (style === 'solid') return `<rect x="2" y="2" width="92" height="92" rx="22" fill="${primary}"/>`;
  if (style === 'outline') return `<rect x="2" y="2" width="92" height="92" rx="22" fill="#FFFFFF" stroke="${primary}" stroke-width="4"/>`;
  if (style === 'twotone') return `<rect x="2" y="2" width="92" height="92" rx="22" fill="${soft}"/>`;
  if (style === 'badge') return `<circle cx="48" cy="48" r="46" fill="${primary}"/>`;
  return `<rect x="2" y="2" width="92" height="92" rx="30" fill="${soft}" stroke="${mix(primary, '#000000', 0.2)}" stroke-width="2"/>`;
}

function colorSet(style, primary, accent) {
  if (style === 'solid' || style === 'badge') {
    return { a: '#FFFFFF', b: lighten(accent, 0.2), c: '#FFFFFF' };
  }
  if (style === 'outline') {
    return { a: primary, b: accent, c: darken(primary, 0.2) };
  }
  if (style === 'twotone') {
    return { a: primary, b: accent, c: darken(primary, 0.15) };
  }
  return { a: darken(primary, 0.1), b: accent, c: darken(accent, 0.25) };
}

function symbol(family, colors, style, seed) {
  const sw = style === 'outline' ? 3.5 : 4;
  const s = seed % 3;
  switch (family) {
    case 'dcheck':
      return `
        <path d="M30 22h17c20 0 32 13 32 34 0 21-12 34-32 34H30V22zm15 ${s===0?10:9}H40v${s===2?36:38}h5c12 0 20-7 20-${s===1?18:19}S57 ${s===2?32:31} 45 ${s===0?32:31}z" fill="${colors.a}"/>
        <path d="M27 71l9 9 16-16" stroke="${colors.b}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'shieldbars':
      return `
        <path d="M48 17l26 8v22c0 20-11 34-26 40-15-6-26-20-26-40V25l26-8z" fill="${colors.a}"/>
        <rect x="36" y="40" width="24" height="6" rx="3" fill="${colors.b}"/>
        <rect x="36" y="51" width="${s===0?16:s===1?18:14}" height="6" rx="3" fill="${colors.b}"/>
      `;
    case 'coinring':
      return `
        <circle cx="48" cy="48" r="26" stroke="${colors.a}" stroke-width="${s===0?10:9}" fill="none"/>
        <path d="M48 22a26 26 0 0 1 22 12" stroke="${colors.b}" stroke-width="${s===0?10:9}" stroke-linecap="round" fill="none"/>
        <path d="M48 74a26 26 0 0 1-22-12" stroke="${colors.c}" stroke-width="${s===0?10:9}" stroke-linecap="round" fill="none"/>
      `;
    case 'wallet':
      return `
        <rect x="20" y="30" width="56" height="38" rx="10" fill="${colors.a}"/>
        <rect x="30" y="25" width="44" height="14" rx="7" fill="${colors.b}"/>
        <circle cx="62" cy="49" r="4" fill="${colors.c}"/>
      `;
    case 'housechart':
      return `
        <path d="M24 46l24-20 24 20v27H24V46z" fill="${colors.a}"/>
        <rect x="35" y="52" width="6" height="14" rx="2" fill="${colors.b}"/>
        <rect x="44" y="47" width="6" height="19" rx="2" fill="${colors.b}"/>
        <rect x="53" y="42" width="6" height="24" rx="2" fill="${colors.b}"/>
      `;
    case 'handcoin':
      return `
        <circle cx="56" cy="31" r="11" fill="${colors.b}"/>
        <path d="M21 59c8-8 18-9 27-9h22c4 0 7 2 7 6s-3 7-7 7H50" stroke="${colors.a}" stroke-width="${sw}" stroke-linecap="round"/>
        <path d="M21 65h38c7 0 12 2 18 6" stroke="${colors.a}" stroke-width="${sw}" stroke-linecap="round"/>
      `;
    case 'linkloop':
      return `
        <rect x="24" y="34" width="26" height="24" rx="12" stroke="${colors.a}" stroke-width="${sw}" fill="none"/>
        <rect x="46" y="34" width="26" height="24" rx="12" stroke="${colors.b}" stroke-width="${sw}" fill="none"/>
        <path d="M44 46h8" stroke="${colors.c}" stroke-width="${sw}" stroke-linecap="round"/>
      `;
    case 'calendarpeso':
      return `
        <rect x="23" y="26" width="50" height="46" rx="9" fill="${colors.a}"/>
        <rect x="23" y="26" width="50" height="12" rx="8" fill="${colors.b}"/>
        <path d="M48 61c4 0 7-2 7-5 0-2-2-4-5-4h-4c-3 0-5-2-5-4 0-3 3-5 7-5" stroke="${colors.c}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M48 45v20" stroke="${colors.c}" stroke-width="3" stroke-linecap="round"/>
      `;
    case 'pulsecircle':
      return `
        <circle cx="48" cy="48" r="28" stroke="${colors.a}" stroke-width="${sw}" fill="none"/>
        <path d="M26 50h10l4-9 8 16 5-11h17" stroke="${colors.b}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      `;
    case 'barsd':
      return `
        <path d="M24 22h18c18 0 30 12 30 30s-12 30-30 30H24V22z" fill="${colors.a}"/>
        <rect x="31" y="58" width="6" height="13" rx="2" fill="${colors.b}"/>
        <rect x="40" y="52" width="6" height="19" rx="2" fill="${colors.b}"/>
        <rect x="49" y="46" width="6" height="25" rx="2" fill="${colors.b}"/>
      `;
    default:
      return '';
  }
}

function makeIcon(family, style, primary, accent, seed) {
  const colors = colorSet(style, primary, accent);
  return `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
      ${iconBg(style, primary)}
      ${symbol(family, colors, style, seed)}
    </svg>
  `;
}

function scoreConcept(family, style) {
  const trustMap = { dcheck: 9, shieldbars: 10, coinring: 8, wallet: 8, housechart: 8, handcoin: 9, linkloop: 7, calendarpeso: 7, pulsecircle: 8, barsd: 8 };
  const distinctMap = { dcheck: 8, shieldbars: 7, coinring: 7, wallet: 6, housechart: 6, handcoin: 8, linkloop: 8, calendarpeso: 7, pulsecircle: 7, barsd: 8 };
  const reproducMap = { solid: 9, outline: 8, twotone: 8, badge: 8, rounded: 9 };
  const trust = trustMap[family] || 7;
  const distinct = distinctMap[family] || 7;
  const reproduc = reproducMap[style] || 8;
  const total = Math.round((trust * 0.4 + distinct * 0.35 + reproduc * 0.25) * 10) / 10;
  return { trust, distinct, reproduc, total };
}

const concepts = [];
let idx = 1;
for (let r = 0; r < families.length; r++) {
  for (let c = 0; c < styles.length; c++) {
    const family = families[r];
    const style = styles[c];
    const [primary, accent] = palettes[(idx - 1) % palettes.length];
    const id = `C${String(idx).padStart(2, '0')}`;
    concepts.push({ id, idx, family, style, primary, accent, ...scoreConcept(family, style) });
    idx++;
  }
}

function familyLabel(name) {
  const map = {
    dcheck: 'D + check',
    shieldbars: 'Escudo',
    coinring: 'Moneda',
    wallet: 'Billetera',
    housechart: 'Casa + barras',
    handcoin: 'Mano + moneda',
    linkloop: 'Vinculo',
    calendarpeso: 'Calendario $',
    pulsecircle: 'Pulso',
    barsd: 'D + barras',
  };
  return map[name] || name;
}

function styleLabel(name) {
  const map = { solid: 'Solido', outline: 'Outline', twotone: 'Duo', badge: 'Badge', rounded: 'Redondeado' };
  return map[name] || name;
}

const cardW = 296;
const cardH = 220;
const gap = 24;
const cols = 5;
const rows = 10;
const width = 2 * gap + cols * cardW + (cols - 1) * gap;
const headerH = 150;
const height = headerH + gap + rows * cardH + (rows - 1) * gap + gap;

let cards = '';
concepts.forEach((c, i) => {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = gap + col * (cardW + gap);
  const y = headerH + gap + row * (cardH + gap);
  const icon = makeIcon(c.family, c.style, c.primary, c.accent, c.idx);
  cards += `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="20" fill="#FFFFFF" stroke="#E2E8F0"/>
      <text x="18" y="28" font-family="Inter,Segoe UI,Arial" font-size="14" font-weight="700" fill="#334155">${c.id}</text>
      <text x="56" y="28" font-family="Inter,Segoe UI,Arial" font-size="13" font-weight="600" fill="#64748B">${familyLabel(c.family)} | ${styleLabel(c.style)}</text>
      <g transform="translate(100 42)">${icon}</g>
      <text x="148" y="156" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="28" font-weight="800" fill="#0F172A">Dinaria</text>
      <text x="18" y="186" font-family="Inter,Segoe UI,Arial" font-size="12" fill="#64748B">Trust ${c.trust} | Dist ${c.distinct} | Repro ${c.reproduc}</text>
      <text x="245" y="186" text-anchor="end" font-family="Inter,Segoe UI,Arial" font-size="12" font-weight="700" fill="#3C499D">Score ${c.total}</text>
    </g>
  `;

  const iconLarge = makeIcon(c.family, c.style, c.primary, c.accent, c.idx)
    .replace('width="96"', 'width="224"')
    .replace('height="96"', 'height="224"');

  const lockup = `
<svg width="1200" height="420" viewBox="0 0 1200 420" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="1200" height="420" rx="32" fill="#F8FAFC"/>
  <g transform="translate(72 98)">${iconLarge}</g>
  <text x="356" y="206" font-family="Inter,Segoe UI,Arial" font-size="116" font-weight="800" fill="#0F172A">Dinaria</text>
  <text x="360" y="264" font-family="Inter,Segoe UI,Arial" font-size="34" font-weight="500" fill="#475569">Finanzas claras para todos</text>
  <text x="360" y="314" font-family="Inter,Segoe UI,Arial" font-size="24" fill="#64748B">${c.id} | ${familyLabel(c.family)} | ${styleLabel(c.style)} | score ${c.total}</text>
</svg>`;
  fs.writeFileSync(path.join(optionsDir, `dinaria-logo-${String(c.idx).padStart(2,'0')}.svg`), lockup.trim());
});

const board = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="${width}" height="${height}" fill="#EEF2FF"/>
  <text x="${gap}" y="56" font-family="Inter,Segoe UI,Arial" font-size="42" font-weight="800" fill="#0F172A">Dinaria - Logo Lab (50 exploraciones)</text>
  <text x="${gap}" y="92" font-family="Inter,Segoe UI,Arial" font-size="20" fill="#475569">Base cromatica #3C499D | objetivo: confianza + cercania + reproducibilidad</text>
  <text x="${gap}" y="122" font-family="Inter,Segoe UI,Arial" font-size="16" fill="#64748B">Metodologia: 10 familias de simbolo x 5 estilos = 50 variantes</text>
  ${cards}
</svg>
`;

fs.writeFileSync(path.join(outDir, 'dinaria-logo-lab-50.svg'), board.trim());

const top = [...concepts].sort((a,b)=>b.total-a.total).slice(0, 8);
const report = {
  generatedAt: new Date().toISOString(),
  brand: 'Dinaria',
  colorBase: BRAND,
  totalConcepts: concepts.length,
  top8: top,
  files: {
    board: path.join(outDir, 'dinaria-logo-lab-50.svg'),
    optionsDir
  }
};
fs.writeFileSync(path.join(outDir, 'dinaria-logo-lab-report.json'), JSON.stringify(report, null, 2));

const htmlCards = concepts.map(c => {
  const f = `options/dinaria-logo-${String(c.idx).padStart(2,'0')}.svg`;
  return `<a class="tile" href="${f}" target="_blank"><img src="${f}" alt="${c.id}"/><div><strong>${c.id}</strong> | ${familyLabel(c.family)} | ${styleLabel(c.style)} | score ${c.total}</div></a>`;
}).join('\n');

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Dinaria Logo Lab</title>
<style>
body{font-family:Inter,Segoe UI,Arial,sans-serif;background:#EEF2FF;margin:0;color:#0F172A}
header{padding:24px 28px;background:white;position:sticky;top:0;border-bottom:1px solid #E2E8F0;z-index:10}
h1{margin:0 0 8px;font-size:28px} p{margin:0;color:#475569}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding:20px 24px 28px}
.tile{display:block;background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:10px;text-decoration:none;color:inherit}
.tile img{width:100%;height:auto;display:block;border-radius:12px;background:#F8FAFC}
.tile div{font-size:12px;color:#334155;padding:8px 4px 4px}
.actions{display:flex;gap:12px;margin-top:12px}
.btn{padding:10px 14px;border-radius:10px;border:1px solid #CBD5E1;background:#fff;color:#1E293B;text-decoration:none;font-weight:600;font-size:14px}
.btn.primary{background:#3C499D;color:#fff;border-color:#3C499D}
</style></head><body>
<header><h1>Dinaria - 50 pruebas de logo</h1><p>Exploraciones con foco en confianza, legibilidad y escalabilidad.</p><div class="actions"><a class="btn" href="dinaria-logo-lab-50.svg" target="_blank">Abrir lamina completa</a><a class="btn primary" href="dinaria-logo-lab-report.json" target="_blank">Ver top 8</a></div></header>
<section class="grid">${htmlCards}</section>
</body></html>`;

fs.writeFileSync(path.join(outDir, 'dinaria-logo-lab.html'), html);
console.log('Generated', concepts.length, 'concepts');
console.log(path.join(outDir, 'dinaria-logo-lab.html'));
console.log(path.join(outDir, 'dinaria-logo-lab-50.svg'));
