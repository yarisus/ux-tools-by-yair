const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/Yair-/ai-lab/expense-webapp/branding/dinaria-blue-10';
const optDir = path.join(outDir, 'options');

const variants = [
  {id:'B01', name:'Ocean Trust', p:'#1D4ED8', s:'#2563EB', t:'#0F172A', bg:'#F8FAFC', badge:'rounded'},
  {id:'B02', name:'Azure Calm', p:'#1E40AF', s:'#3B82F6', t:'#0F172A', bg:'#F8FAFC', badge:'circle'},
  {id:'B03', name:'Cobalt Core', p:'#1D4ED8', s:'#60A5FA', t:'#0F172A', bg:'#F8FAFC', badge:'none'},
  {id:'B04', name:'Navy Pro', p:'#1E3A8A', s:'#2563EB', t:'#0F172A', bg:'#F8FAFC', badge:'rounded'},
  {id:'B05', name:'Sky Ledger', p:'#0EA5E9', s:'#2563EB', t:'#0F172A', bg:'#F8FAFC', badge:'circle'},
  {id:'B06', name:'Indigo Balance', p:'#3730A3', s:'#3B82F6', t:'#0F172A', bg:'#F8FAFC', badge:'rounded'},
  {id:'B07', name:'Royal Finance', p:'#1D4ED8', s:'#1E3A8A', t:'#0F172A', bg:'#F8FAFC', badge:'square'},
  {id:'B08', name:'Blue Pulse', p:'#2563EB', s:'#0EA5E9', t:'#0F172A', bg:'#F8FAFC', badge:'none'},
  {id:'B09', name:'Deep Horizon', p:'#1E40AF', s:'#38BDF8', t:'#0F172A', bg:'#F8FAFC', badge:'circle'},
  {id:'B10', name:'Trusted Loop', p:'#1D4ED8', s:'#22D3EE', t:'#0F172A', bg:'#F8FAFC', badge:'rounded'},
];

function polar(cx, cy, r, deg){
  const rad = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const delta = ((endDeg - startDeg) % 360 + 360) % 360;
  const large = delta > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

function arrowHead(cx, cy, r, atDeg, size){
  const tip = polar(cx, cy, r, atDeg);
  const back = polar(cx, cy, r - size*0.9, atDeg);
  const left = polar(back.x, back.y, size*0.55, atDeg + 90);
  const right = polar(back.x, back.y, size*0.55, atDeg - 90);
  return `M ${tip.x.toFixed(2)} ${tip.y.toFixed(2)} L ${left.x.toFixed(2)} ${left.y.toFixed(2)} L ${right.x.toFixed(2)} ${right.y.toFixed(2)} Z`;
}

function badgeShape(type){
  if (type === 'circle') return `<circle cx="60" cy="60" r="54" fill="#EAF2FF"/>`;
  if (type === 'square') return `<rect x="8" y="8" width="104" height="104" rx="18" fill="#EAF2FF"/>`;
  if (type === 'rounded') return `<rect x="8" y="8" width="104" height="104" rx="28" fill="#EAF2FF"/>`;
  return '';
}

function makeIcon(v, idx){
  const r = 33 + (idx % 2);
  const sw = 17 + (idx % 3);
  const start1 = 205 - (idx % 4) * 3;
  const end1 = 18 + (idx % 3) * 2;
  const start2 = 32 + (idx % 2) * 2;
  const end2 = 198 - (idx % 3) * 3;

  const a1 = arcPath(60,60,r,start1,end1);
  const a2 = arcPath(60,60,r,start2,end2);
  const h1 = arrowHead(60,60,r,end1,9);
  const h2 = arrowHead(60,60,r,end2,9);

  const dPath = `
    M 40 30
    H 52
    C 69 30, 81 41, 81 60
    C 81 79, 69 90, 52 90
    H 40
    V 74
    H 50
    C 60 74, 66 68, 66 60
    C 66 52, 60 46, 50 46
    H 40
    Z`;

  return `
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" fill="none">
  ${badgeShape(v.badge)}
  <path d="${a1}" stroke="${v.p}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="${a2}" stroke="${v.s}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="${h1}" fill="${v.p}"/>
  <path d="${h2}" fill="${v.s}"/>
  <path d="${dPath}" fill="#FFFFFF"/>
</svg>`;
}

function lockup(v, idx){
  const icon = makeIcon(v, idx);
  return `
<svg width="1280" height="430" viewBox="0 0 1280 430" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="1280" height="430" rx="28" fill="${v.bg}"/>
  <g transform="translate(78 155)">${icon}</g>
  <text x="245" y="246" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="112" font-weight="700" fill="${v.p}">Dinaria</text>
  <text x="248" y="292" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="30" font-weight="500" fill="#475569">Finanzas claras para todos</text>
  <text x="248" y="334" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="24" font-weight="600" fill="#64748B">${v.id} - ${v.name}</text>
</svg>`;
}

for (let i=0;i<variants.length;i++){
  const v = variants[i];
  fs.writeFileSync(path.join(optDir, `dinaria-${v.id}.svg`), lockup(v, i));
}

const cardW = 580;
const cardH = 250;
const cols = 2;
const gap = 28;
const header = 130;
const rows = Math.ceil(variants.length / cols);
const boardW = gap + cols*cardW + (cols-1)*gap + gap;
const boardH = header + gap + rows*cardH + (rows-1)*gap + gap;

let cards = '';
for (let i=0;i<variants.length;i++){
  const v = variants[i];
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = gap + col*(cardW+gap);
  const y = header + gap + row*(cardH+gap);
  const icon = makeIcon(v, i);
  cards += `
  <g transform="translate(${x} ${y})">
    <rect width="${cardW}" height="${cardH}" rx="20" fill="#FFFFFF" stroke="#E2E8F0"/>
    <g transform="translate(24 58)">${icon}</g>
    <text x="170" y="108" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="58" font-weight="700" fill="${v.p}">Dinaria</text>
    <text x="170" y="144" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="20" font-weight="500" fill="#475569">${v.id} - ${v.name}</text>
    <text x="170" y="178" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="18" fill="#64748B">Primary ${v.p} | Accent ${v.s}</text>
  </g>`;
}

const board = `
<svg width="${boardW}" height="${boardH}" viewBox="0 0 ${boardW} ${boardH}" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="${boardW}" height="${boardH}" fill="#EEF2FF"/>
  <text x="${gap}" y="56" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="42" font-weight="700" fill="#0F172A">Dinaria - 10 propuestas (concepto flechas + D)</text>
  <text x="${gap}" y="92" font-family="Poppins, Montserrat, Segoe UI, Arial, sans-serif" font-size="22" fill="#475569">Direccion: amigable + serio + reproducible | Paleta azul</text>
  ${cards}
</svg>`;

fs.writeFileSync(path.join(outDir, 'dinaria-blue-10-board.svg'), board);

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dinaria Blue 10</title>
<style>
body{margin:0;font-family:Poppins,Segoe UI,Arial,sans-serif;background:#EEF2FF;color:#0F172A}
header{position:sticky;top:0;background:#fff;border-bottom:1px solid #E2E8F0;padding:16px 22px;z-index:2}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:16px;padding:18px}
.card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:10px;text-decoration:none;color:inherit}
.card img{width:100%;border-radius:10px;background:#F8FAFC}
.meta{padding:8px 2px;font-size:13px;color:#334155}
.btn{display:inline-block;padding:10px 14px;border-radius:10px;border:1px solid #CBD5E1;background:#fff;color:#1E293B;text-decoration:none;font-weight:600;margin-right:8px}
</style></head><body>
<header><h1 style="margin:0 0 6px;font-size:26px">Dinaria - 10 propuestas azules</h1><a class="btn" href="dinaria-blue-10-board.svg" target="_blank">Abrir lamina</a></header>
<section class="grid">
${variants.map(v=>`<a class="card" href="options/dinaria-${v.id}.svg" target="_blank"><img src="options/dinaria-${v.id}.svg" alt="${v.id}"><div class="meta"><strong>${v.id}</strong> - ${v.name}</div></a>`).join('\n')}
</section></body></html>`;
fs.writeFileSync(path.join(outDir, 'dinaria-blue-10.html'), html);

console.log('ok');
