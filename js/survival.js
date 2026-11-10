// ===== LA ORDEN: ZONA MUERTA — supervivencia con zombis =====
'use strict';
const $ = id => document.getElementById(id);
const V3 = THREE.Vector3;
const DAY = 16 * 60;            // segundos reales que dura un día completo
const START_HOUR = 8;
const S = { view: 'fp', yaw: 0, pitch: 0, phase: 'menu', time: 0, clock: 0, zCount: 8, quality: 1, p: null, zombies: [], ground: [], conts: [], kills: 0, camYaw: Math.PI / 4, zoom: 1, over: false, open: null, invOpen: false, dirty: true, houseIn: null };
const _v = new V3(), _v2 = new V3(), _v3 = new V3();
if (IS_TOUCH) document.body.classList.add('touch');

// ---------- objetos ----------
const ITEMS = {
  beans: { n: 'Lata de judías', ic: '🥫', w: 0.4, food: 35, drink: 2 },
  bread: { n: 'Pan', ic: '🍞', w: 0.3, food: 25 },
  apple: { n: 'Manzana', ic: '🍎', w: 0.2, food: 12, drink: 6 },
  chips: { n: 'Patatas fritas', ic: '🍟', w: 0.2, food: 15, drink: -6 },
  choco: { n: 'Chocolate', ic: '🍫', w: 0.1, food: 12 },
  cereal: { n: 'Cereales', ic: '🥣', w: 0.4, food: 22 },
  water: { n: 'Botella de agua', ic: '💧', w: 0.6, drink: 45, empty: 'bottle' },
  soda: { n: 'Refresco', ic: '🥤', w: 0.4, drink: 25, food: 4 },
  bottle: { n: 'Botella vacía', ic: '🫙', w: 0.1 },
  bandage: { n: 'Venda', ic: '🩹', w: 0.1, heal: 8, stop: true },
  medkit: { n: 'Botiquín', ic: '🧰', w: 0.8, heal: 40, stop: true },
  pills: { n: 'Analgésicos', ic: '💊', w: 0.05, heal: 15 },
  booster: { n: 'Sobre de cartas', ic: '🃏', w: 0.05, booster: true },
  bat: { n: 'Bate de béisbol', ic: '🏏', w: 1.5, melee: 'bat' },
  pan: { n: 'Sartén', ic: '🍳', w: 1.2, melee: 'pan' },
  knife: { n: 'Cuchillo', ic: '🔪', w: 0.3, melee: 'knife' },
  axe: { n: 'Hacha', ic: '🪓', w: 2.5, melee: 'axe' },
  pipe: { n: 'Tubería', ic: '🔧', w: 1.8, melee: 'pipe' },
  pistol: { n: 'Pistola', ic: '🔫', w: 1.0, gun: 'pistol' },
  shotgun: { n: 'Escopeta', ic: '💥', w: 3.0, gun: 'shotgun' },
  hammer: { n: 'Martillo', ic: '🔨', w: 0.8, melee: 'hammer' },
  plank: { n: 'Tablón de madera', ic: '🪵', w: 1.0 },
  nails: { n: 'Clavos', ic: '🔩', w: 0.005, stack: true },
  scrap: { n: 'Chapa metálica', ic: '🔲', w: 1.5 },
  rag: { n: 'Trapos', ic: '🧣', w: 0.1 },
  caps: { n: 'Chapas', ic: '🪙', w: 0, stack: true },
  qitem: { n: 'Objeto de misión', ic: '⭐', w: 0.8 },
  gas: { n: 'Bidón de gasolina', ic: '⛽', w: 2.5, use: true },
  stick: { n: 'Palo', ic: '🥢', w: 0.4 },
  rope: { n: 'Cuerda', ic: '🪢', w: 0.3 },
  stone: { n: 'Piedra', ic: '🪨', w: 0.6 },
  seeds: { n: 'Semillas', ic: '🌱', w: 0.05, stack: true },
  veg: { n: 'Verduras del huerto', ic: '🥬', w: 0.3, food: 20, drink: 5 },
  stew: { n: 'Estofado caliente', ic: '🍲', w: 0.5, food: 75, drink: 10 },
  saxe: { n: 'Hacha de piedra', ic: '🪓', w: 1.6, melee: 'saxe' },
  shiv: { n: 'Pincho de chapa', ic: '🗡️', w: 0.3, melee: 'shiv' },
  xbow: { n: 'Ballesta casera', ic: '🏹', w: 2.2, gun: 'xbow' },
  bolt: { n: 'Virotes', ic: '➶', w: 0.05, stack: true },
  tape: { n: 'Cinta americana', ic: '🧷', w: 0.2 },
  alcohol: { n: 'Alcohol', ic: '🍾', w: 0.5 },
  sandwich: { n: 'Bocadillo', ic: '🥪', w: 0.3, food: 60 },
  club: { n: 'Garrote con clavos', ic: '🏑', w: 1.4, melee: 'club' },
  nailbat: { n: 'Bate con clavos', ic: '🏏', w: 1.7, melee: 'nailbat' },
  spear: { n: 'Lanza', ic: '🔱', w: 1.6, melee: 'spear' },
  molotov: { n: 'Cóctel molotov', ic: '🔥', w: 0.6, thrown: true, stack: true },
  ammo9: { n: 'Balas de 9 mm', ic: '🔸', w: 0.01, stack: true },
  shells: { n: 'Cartuchos', ic: '🔴', w: 0.03, stack: true },
};
const MELEE = {
  fists: { n: 'Puños', dmg: 7, rate: 0.55, range: 1.25, arc: 1.0, push: 5, sta: 3 },
  knife: { dmg: 16, rate: 0.42, range: 1.25, arc: 0.8, push: 1.5, dur: 45, sta: 3 },
  pan: { dmg: 19, rate: 0.75, range: 1.5, arc: 1.1, push: 4, dur: 35, sta: 5 },
  pipe: { dmg: 22, rate: 0.8, range: 1.75, arc: 1.1, push: 4, dur: 60, sta: 6 },
  bat: { dmg: 26, rate: 0.8, range: 1.8, arc: 1.2, push: 5, dur: 40, sta: 6 },
  hammer: { dmg: 15, rate: 0.6, range: 1.3, arc: 0.9, push: 2.5, dur: 90, sta: 4 },
  club: { dmg: 21, rate: 0.72, range: 1.6, arc: 1.1, push: 3.5, dur: 30, sta: 5 },
  nailbat: { dmg: 34, rate: 0.82, range: 1.8, arc: 1.2, push: 5, dur: 45, sta: 6 },
  spear: { dmg: 28, rate: 0.85, range: 2.4, arc: 0.6, push: 2, dur: 35, sta: 5 },
  saxe: { dmg: 30, rate: 0.9, range: 1.6, arc: 1.0, push: 3, dur: 30, sta: 6 },
  shiv: { dmg: 14, rate: 0.4, range: 1.2, arc: 0.8, push: 1.2, dur: 25, sta: 3 },
  axe: { dmg: 42, rate: 1.05, range: 1.7, arc: 1.0, push: 3, dur: 55, sta: 9 },
};
const GUNS = {
  pistol: { dmg: 40, rate: 0.35, mag: 12, ammo: 'ammo9', range: 35, noise: 55, spread: 0.05, pellets: 1, reload: 1.6 },
  xbow: { dmg: 60, rate: 0.9, mag: 1, ammo: 'bolt', range: 34, noise: 3, spread: 0.012, pellets: 1, reload: 1.1 },
  shotgun: { dmg: 24, rate: 1.0, mag: 6, ammo: 'shells', range: 16, noise: 80, spread: 0.2, pellets: 6, reload: 3.0 },
};
function mk(id, n) {
  const d = ITEMS[id], it = { id, n: n || 1 };
  if (d.melee) it.dur = Math.round(MELEE[d.melee].dur * R(0.5, 1));
  if (d.gun) it.mag = RI(0, GUNS[d.gun].mag);
  return it;
}
function wpk(table) { let s = 0; for (const k in table) s += table[k]; let r = rand() * s; for (const k in table) { r -= table[k]; if (r <= 0) return k; } return Object.keys(table)[0]; }
const LOOT = {
  fridge: { alcohol: 0.8, water: 5, soda: 5, apple: 4, bread: 4, beans: 1, cereal: 1 },
  cab: { caps: 0.6, rope: 0.8, seeds: 0.3, rag: 4, tape: 1, alcohol: 1, beans: 6, chips: 4, choco: 4, cereal: 3, bottle: 3, bandage: 5, knife: 2.5, pan: 2.5, pipe: 1.5, bat: 1, axe: 0.5, medkit: 0.8, pistol: 0.35, ammo9: 1.2, shells: 0.6, water: 2 },
  crate: { rope: 1.5, stick: 1, bolt: 0.4, gas: 0.8, rag: 1.2, tape: 1.5, plank: 2, nails: 2, scrap: 1.2, hammer: 0.5, beans: 4, water: 3, bat: 2, pipe: 3, axe: 1.2, ammo9: 2, shells: 1.5, shotgun: 0.4, pistol: 0.4, bandage: 2, medkit: 0.6 },
  friki: { chips: 4, soda: 4, choco: 4, booster: 6, water: 2 },
  friki2: { rag: 1, tape: 0.6, soda: 3, chips: 3, choco: 3, booster: 5, bandage: 1, knife: 0.6, bat: 0.4 },
  super: { seeds: 0.8, alcohol: 1, rag: 0.6, beans: 5, cereal: 4, chips: 3, choco: 3, bread: 2, apple: 2, water: 3, soda: 2 },
  farmacia: { alcohol: 3, rag: 1, bandage: 6, medkit: 2.5, pills: 4, water: 1 },
  ferreteria: { rope: 2.5, seeds: 1.2, stick: 1, gas: 0.6, tape: 3.5, rag: 1, pipe: 2, axe: 1.5, knife: 1.5, bat: 1, pan: 0.6, bottle: 1, hammer: 2.5, nails: 4, plank: 2.5, scrap: 1 },
  bar: { alcohol: 3, rag: 1.2, soda: 4, water: 3, chips: 3, beans: 1, knife: 0.4 },
  forn: { bread: 7, choco: 2, cereal: 1 },
  quiosc: { tape: 0.5, choco: 4, chips: 4, soda: 3, water: 2, booster: 1 },
  policia: { pistol: 1.2, ammo9: 3, shells: 1.5, shotgun: 0.6, bandage: 2, bat: 1 },
  mercat: { seeds: 2.5,  apple: 5, bread: 3, beans: 2, water: 2, cereal: 1 },
  vending: { soda: 5, water: 4, chips: 2, choco: 2 },
  benzinera: { gas: 6, soda: 3, chips: 3, choco: 2, water: 2, rag: 1, tape: 1 },
  taller: { gas: 3, scrap: 3, nails: 3, tape: 2, plank: 1.5, hammer: 1, pipe: 1.5, rope: 1.5 },
  home: { _none: 7, rag: 2, bottle: 1.5, pills: 0.5, tape: 0.4, booster: 0.3, choco: 0.5, rope: 0.4, bandage: 0.4, knife: 0.2 },
  kitchen: { _none: 6, beans: 1, bottle: 1.2, knife: 0.5, pan: 0.5, cereal: 0.6, water: 0.4, alcohol: 0.4 },
  localx: { _none: 6, rag: 1, bottle: 1, chips: 0.6, soda: 0.5, tape: 0.4, scrap: 0.5, nails: 0.5, booster: 0.2 },
  office: { _none: 6, rag: 0.6, tape: 0.6, scrap: 0.4, pills: 0.4, soda: 0.3, choco: 0.3 },
  floor: { caps: 0.8, stick: 2.2, stone: 2, rope: 0.4, rag: 1.2, tape: 0.3, plank: 0.8, nails: 0.6, bottle: 3, chips: 2, apple: 2, soda: 2, pipe: 1, bandage: 1, choco: 1.5, knife: 0.5 },
};
function rollItem(kind) { const id = wpk(LOOT[kind]); if (id === '_none') return null; return mk(id, ITEMS[id].stack ? (id === 'ammo9' ? RI(4, 14) : id === 'nails' ? RI(6, 20) : id === 'seeds' ? RI(2, 5) : RI(2, 6)) : 1); }
function invWeight(p) { let w = 0; for (const it of p.inv) w += ITEMS[it.id].w * it.n; return w; }
const MAX_W = 25;
function addItem(p, it) {
  if (ITEMS[it.id].stack) { const s = p.inv.find(o => o.id === it.id); if (s) { s.n += it.n; return true; } }
  p.inv.push(it); return true;
}

// ---------- audio ----------
let AC = null, master = null, noiseBuf = null;
function initAudio() { if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.32; master.connect(AC.destination); const n = AC.sampleRate * 0.8; noiseBuf = AC.createBuffer(1, n, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; } catch (e) { AC = null; } }
function sfx(kind, vol = 1) {
  if (!AC || vol < 0.03) return;
  try {
    const t = AC.currentTime, g = AC.createGain(); g.connect(master);
    if (kind === 'groan') {
      const o = AC.createOscillator(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; const b = R(70, 110); o.frequency.setValueAtTime(b, t); o.frequency.linearRampToValueAtTime(b * 0.7, t + 0.9); f.type = 'lowpass'; f.frequency.value = 420; o.connect(f); f.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * 0.18, t + 0.2); g.gain.exponentialRampToValueAtTime(0.001, t + 1.0); o.start(t); o.stop(t + 1.05); return;
    }
    if (kind === 'shot' || kind === 'shotgun' || kind === 'thud' || kind === 'swish') {
      const s = AC.createBufferSource(); s.buffer = noiseBuf; const f = AC.createBiquadFilter();
      f.type = kind === 'swish' ? 'bandpass' : 'lowpass'; f.frequency.value = { shot: 3000, shotgun: 1300, thud: 380, swish: 1800 }[kind]; s.connect(f); f.connect(g);
      const dur = { shot: 0.18, shotgun: 0.45, thud: 0.14, swish: 0.12 }[kind];
      g.gain.setValueAtTime(vol * ({ swish: 0.25, thud: 0.9 }[kind] || 0.8), t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.start(t); s.stop(t + dur); return;
    }
    const o = AC.createOscillator(), f = { pick: 660, eat: 300, drink: 520, click: 260, hurt: 180, open: 420 }[kind] || 500;
    o.type = kind === 'hurt' ? 'sawtooth' : 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(kind === 'hurt' ? f * 0.5 : f * 1.5, t + 0.15);
    g.gain.setValueAtTime(vol * 0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); o.connect(g); o.start(t); o.stop(t + 0.2);
  } catch (e) { }
}
function sfxAt(kind, pos) { if (!S.p) return; const d = S.p.pos.distanceTo(pos); if (d < 60) sfx(kind, 1 / (1 + d / 10)); }

// ---------- efectos ----------
const FX = { parts: [], tracers: [], nums: [] };
{
  const pg = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  for (let i = 0; i < 120; i++) { const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })); m.visible = false; scene.add(m); FX.parts.push(m); }
  const tg = new THREE.BoxGeometry(1, 1, 1); tg.translate(0, 0, 0.5);
  for (let i = 0; i < 20; i++) { const m = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ color: 0xfff1a0, transparent: true, depthWrite: false })); m.visible = false; scene.add(m); FX.tracers.push(m); }
}
let _pi = 0, _ti = 0;
function burst(pos, color, n = 6, speed = 3, life = 0.5) { for (let i = 0; i < n; i++) { const m = FX.parts[_pi++ % FX.parts.length]; m.position.copy(pos); m.material.color.setHex(color); m.userData.v = new V3(R(-1, 1), R(0.3, 1.4), R(-1, 1)).multiplyScalar(speed); m.userData.t = m.userData.life = life * R(0.6, 1); m.visible = true; } }
function tracer(a, b) { const m = FX.tracers[_ti++ % FX.tracers.length]; m.position.copy(a); m.lookAt(b); m.scale.set(0.03, 0.03, a.distanceTo(b)); m.userData.t = 0.06; m.visible = true; m.material.opacity = 0.9; }
function dmgNum(pos, val, color) { const el = document.createElement('div'); el.className = 'dn'; el.textContent = val; el.style.color = color; $('nums').appendChild(el); FX.nums.push({ el, pos: pos.clone(), t: 0.8 }); if (FX.nums.length > 20) FX.nums.shift().el.remove(); }
function updateFx(dt) {
  for (const m of FX.parts) if (m.visible) { const u = m.userData; u.t -= dt; u.v.y -= 12 * dt; m.position.addScaledVector(u.v, dt); m.material.opacity = Math.max(0, u.t / u.life); if (u.t <= 0) m.visible = false; }
  for (const m of FX.tracers) if (m.visible) { m.userData.t -= dt; m.material.opacity = Math.max(0, m.userData.t / 0.06); if (m.userData.t <= 0) m.visible = false; }
  for (let i = FX.nums.length - 1; i >= 0; i--) { const n = FX.nums[i]; n.t -= dt; n.pos.y += dt * 1.2; _v.copy(n.pos).project(camera); if (n.t <= 0) { n.el.remove(); FX.nums.splice(i, 1); continue; } n.el.style.left = ((_v.x + 1) / 2 * innerWidth) + 'px'; n.el.style.top = ((1 - _v.y) / 2 * innerHeight) + 'px'; n.el.style.opacity = Math.min(1, n.t * 3); }
}

// ---------- personaje (creador) ----------
const SKINS = ['#f3d9c6', '#eac4a8', '#dcae8a', '#c8946c', '#b07a54', '#8e5e3e', '#6e4630', '#4e3224'];
const HAIRS = ['#16110f', '#2e1f16', '#4a3020', '#6e4a2e', '#a07a4a', '#c8a468', '#8a3a1e', '#9a9a98', '#d8d6d0', '#3a4a7a'];
const EYES = ['#3a2418', '#5a3a1a', '#3a6aa8', '#4a7a5a', '#6a7a8a'];
const CLOTH = ['#2a2a30', '#d8d6d0', '#7a2a2a', '#a85a2a', '#b89a4a', '#3a5a3a', '#2a4a4a', '#2a3a5a', '#4a3a5a', '#8a5a6a', '#5a4030', '#5a6448'];
const STYLES = [['buzz', 'Rapado'], ['short', 'Corto'], ['side', 'Raya al lado'], ['messy', 'Despeinado'], ['long', 'Largo'], ['ponytail', 'Coleta'], ['bun', 'Moño'], ['curly', 'Rizado'], ['afro', 'Afro'], ['mohawk', 'Cresta'], ['bald', 'Calvo']];
const BEARDS = [['none', 'Nada'], ['stub', 'Sin afeitar'], ['goatee', 'Perilla'], ['mous', 'Bigote'], ['short', 'Barba corta'], ['full', 'Barba larga']];
const GLASSES = [['none', 'No'], ['glass', 'Gafas'], ['shades', 'De sol']];
const SEXES = [['m', 'Hombre'], ['f', 'Mujer']], BODIES = [['thin', 'Delgado'], ['normal', 'Normal'], ['strong', 'Fuerte'], ['heavy', 'Grueso']], HEIGHTS = [[0.94, 'Bajo'], [1, 'Normal'], [1.05, 'Alto']], AGES = [[0, 'Joven'], [1, 'Adulto'], [2, 'Mayor']];
const OUTFITS = [['jacket', 'Chaqueta'], ['hoodie', 'Sudadera'], ['track', 'Chándal'], ['overalls', 'Mono de trabajo'], ['military', 'Militar'], ['hivis', 'Chaleco reflectante'], ['shirt', 'Camisa'], ['scrubs', 'Sanitario']];
const HATS = [['none', 'No'], ['cap', 'Gorra'], ['beanie', 'Gorro de lana'], ['bandana', 'Pañuelo']], PACKS = [['', 'No'], ['#4a4a32', 'Verde'], ['#2a2a2e', 'Negra'], ['#6a3a22', 'Marrón'], ['#7a2a2a', 'Roja']];
let CR = { sex: 'm', body: 'normal', height: 1, age: 1, skin: SKINS[2], style: 'short', hair: HAIRS[1], beard: 'stub', glasses: 'none', eye: EYES[0], outfit: 'jacket', top: '#5a6448', pants: '#2a3a5a', shoes: '#5a4030', hat: 'none', hatc: '#3a4a2a', pack: '#4a4a32', gloves: true, name: '' };
try { const sv = JSON.parse(localStorage.getItem('zm_char') || 'null'); if (sv) CR = Object.assign(CR, sv); } catch (e) { }
function crOpts(c) { return { sex: c.sex || 'm', body: c.body || 'normal', height: c.height || 1, age: c.age ?? 1, skin: c.skin, hair: c.hair, style: c.style, beard: c.sex === 'f' ? 'none' : c.beard, glasses: c.glasses, eye: c.eye, outfit: c.outfit || 'jacket', top: c.top, pants: c.pants, shoes: c.shoes, hat: c.hat || (c.cap ? 'cap' : 'none'), hatc: c.hatc || c.capc, backpack: c.pack === undefined ? '#4a4a32' : c.pack, gloves: c.gloves, seed: 7 }; }
function crLook(c) {
  return LK({ skin: c.skin, style: c.style === 'curly' ? 'short' : c.style, curly: c.style === 'curly', hair: c.hair, beard: c.beard === 'full' ? c.hair : null, mous: c.beard === 'mous' ? c.hair : null, stubble: c.beard === 'stub', glasses: c.glasses !== 'none' ? '#1a1a22' : null, shades: c.glasses === 'shades', eye: c.eye, top: c.top, trim: null, pants: c.pants, shoes: c.shoes, shoea: '#f2f2f2', hat: c.cap ? 'capback' : null, hatc: c.capc, hata: '#ffffff', manly: c.build, face: { brow: 'up', mouth: 'smile' } });
}
function zombieOpts() {
  const r = rand(), sex = rand() < 0.45 ? 'f' : 'm';
  const skin = pick(['#a8aa98', '#98a08c', '#b4ac9c', '#8c9484', '#a49890', '#bab4a6', '#948c80', '#7c786c', '#88806e']);
  let outfit = pick(['jacket', 'hoodie', 'track', 'shirt', 'jacket', 'hoodie', 'shirt']), top = pick(['#5a5a5a', '#2a3a5a', '#6a4a3a', '#4a5a3a', '#7a2a24', '#c8c4b8', '#3a3a40', '#4a6a8a', '#8a7a5a', '#5a3a4a', '#8a8a86']), pants = pick(['#2a3a5a', '#2a2a2e', '#5a5040', '#3a4a5a', '#4a4440', '#3a3a50']);
  if (r < 0.08) { outfit = 'hivis'; top = '#5a5a5a'; } else if (r < 0.15) { outfit = 'scrubs'; top = pants = pick(['#7aa0b8', '#6a9a8a']); } else if (r < 0.2) { outfit = 'military'; top = pants = '#4a5038'; } else if (r < 0.25) { outfit = 'overalls'; top = '#8a8a80'; pants = '#2a3a6a'; } else if (r < 0.3) { outfit = 'shirt'; top = '#e8e4dc'; pants = '#2a2a2e'; }
  return { zombie: true, sex, seed: (Math.random() * 1e9) | 0, skin, hair: HUMAN.dull(pick(HAIRS.slice(0, 7)), 0.35), body: pick(['thin', 'normal', 'normal', 'strong', 'heavy']), height: R(0.93, 1.05), age: RI(0, 2), outfit, top: HUMAN.dull(top, 0.25), pants: HUMAN.dull(pants, 0.2), shoes: pick(['#2a2420', '#3a3a3a', '#5a4a3a', '#8a8a8a']) };
}
function zombieLook() {
  const dull = c => '#' + new THREE.Color(c).lerp(new THREE.Color('#6a6a5a'), 0.45).getHexString();
  const st = pick(['short', 'messy', 'long', 'bald', 'curly', 'short']);
  return LK({ skin: pick(['#a3b58a', '#93a77f', '#aeb894', '#8fa27a', '#b2aa8a']), sclera: '#e6dc9a', eye: '#c41414', face: { brow: 'angry', mouth: pick(['open', 'teeth', 'open']) }, style: st === 'curly' ? 'short' : st, curly: st === 'curly', hair: dull(pick(HAIRS.slice(0, 6))), beard: rand() < 0.15 ? dull(pick(HAIRS.slice(0, 4))) : null, top: dull(pick(CLOTH)), pants: dull(pick(['#2a2a32', '#3a4a6a', '#5a4a3a', '#4a5a3a'])), shoes: dull(pick(['#2a2a32', '#5a4a3a', '#cccccc'])), shoea: '#6a6a60', trim: null, blood: '#5a1010', manly: rand() < 0.3 });
}
function swatchRow(label, key, list) {
  const r = document.createElement('div'); r.className = 'row'; r.innerHTML = `<div class="lb">${label}</div><div class="sw"></div>`; const sw = r.lastChild;
  for (const c of list) { const d = document.createElement('div'); d.className = 'c' + (CR[key] === c ? ' sel' : ''); d.style.background = c; d.onclick = () => { CR[key] = c; sw.querySelectorAll('.c').forEach(x => x.classList.toggle('sel', x === d)); refreshPreview(); }; sw.appendChild(d); }
  return r;
}
function optRow(label, key, list) {
  const r = document.createElement('div'); r.className = 'row'; r.innerHTML = `<div class="lb">${label}</div><div class="sw"></div>`; const sw = r.lastChild;
  for (const [v, t] of list) { const d = document.createElement('div'); d.className = 't' + (CR[key] === v ? ' sel' : ''); d.textContent = t; d.onclick = () => { CR[key] = v; sw.querySelectorAll('.t').forEach(x => x.classList.toggle('sel', x === d)); refreshPreview(); }; sw.appendChild(d); }
  return r;
}
function buildCreator() {
  const c = $('creator'); c.innerHTML = '';
  const sec = t => { const d = document.createElement('div'); d.className = 'sec'; d.textContent = t; return d; };
  c.append(sec('Cuerpo'), optRow('Sexo', 'sex', SEXES), optRow('Complexión', 'body', BODIES), optRow('Altura', 'height', HEIGHTS), optRow('Edad', 'age', AGES), swatchRow('Piel', 'skin', SKINS),
    sec('Cara y pelo'), optRow('Peinado', 'style', STYLES), swatchRow('Color de pelo', 'hair', HAIRS), optRow('Vello facial', 'beard', BEARDS), swatchRow('Ojos', 'eye', EYES), optRow('Gafas', 'glasses', GLASSES),
    sec('Ropa y equipo'), optRow('Ropa', 'outfit', OUTFITS), swatchRow('Color de la parte de arriba', 'top', CLOTH), swatchRow('Pantalón', 'pants', CLOTH), swatchRow('Calzado', 'shoes', ['#2a2a2e', '#5a4030', '#3a3a2a', '#d8d6d0', '#6a2a2a', '#2a3a5a']),
    optRow('Cabeza', 'hat', HATS), swatchRow('Color del gorro', 'hatc', CLOTH), optRow('Mochila', 'pack', PACKS), optRow('Guantes', 'gloves', [[false, 'No'], [true, 'Sí']]));
  $('pname').value = CR.name || '';
}
$('rnd').onclick = () => { const sx = rand() < 0.5 ? 'm' : 'f'; CR = Object.assign(CR, { sex: sx, body: pick(BODIES)[0], height: pick(HEIGHTS)[0], age: pick(AGES)[0], outfit: pick(OUTFITS)[0], hat: rand() < 0.3 ? pick(HATS)[0] : 'none', hatc: pick(CLOTH), pack: pick(PACKS)[0], gloves: rand() < 0.5, skin: pick(SKINS), style: pick(STYLES)[0], hair: pick(HAIRS.slice(0, 6)), beard: pick(BEARDS)[0], glasses: rand() < 0.3 ? pick(GLASSES)[0] : 'none', eye: pick(EYES), top: pick(CLOTH), pants: pick(CLOTH), shoes: pick(CLOTH), cap: rand() < 0.3, capc: pick(CLOTH), build: rand() < 0.4 }); buildCreator(); refreshPreview(); };
let preview = null, prevT = 0;
function refreshPreview() { prevT = 0.05; }
function doPreview() {
  if (preview) LOBBY.remove(preview.root);
  preview = HUMAN.build(crOpts(CR)); preview.root.position.set(0, 0.15, 0); LOBBY.add(preview.root);
  try { localStorage.setItem('zm_char', JSON.stringify(CR)); } catch (e) { }
}

// ---------- muebles y contenedores ----------
const FURN = new THREE.Group(); scene.add(FURN);
function placeFurniture() {
  for (const h of HOUSES) {
    const items = [['cab', -h.w / 2 + 1.2, -h.d / 2 + 0.62, 1.1, 0.55], ['fridge', h.w / 2 - 0.75, -h.d / 2 + 0.7, 0.8, 0.7], ['sink', h.w / 2 - 1.95, -h.d / 2 + 0.65, 1.2, 0.6]];
    for (const [k, lx, lz, fw, fd] of items) {
      const m = k === 'cab' ? cabinetModel() : k === 'fridge' ? fridgeModel() : sinkModel();
      m.position.set(lx, 0.06, lz); m.rotation.y = Math.PI; h.g.add(m);
      const a = h.L(lx - fw / 2, lz - fd / 2), b = h.L(lx + fw / 2, lz + fd / 2);
      addBox(Math.min(a[0], b[0]), h.y, Math.min(a[1], b[1]), Math.max(a[0], b[0]), h.y + (k === 'fridge' ? 1.8 : 1), Math.max(a[1], b[1]));
      const w = h.L(lx, lz + fd / 2 + 0.3);
      S.conts.push({ kind: k, name: { cab: 'Armario', fridge: 'Nevera', sink: 'Fregadero' }[k], pos: new V3(w[0], h.y, w[1]), items: [], water: k === 'sink', house: h });
    }
  }
  for (const c of CHEST_SPOTS) {
    if (HOUSES.some(h => c.x > h.x0 && c.x < h.x1 && c.z > h.z0 && c.z < h.z1)) continue;
    const y = getH(c.x, c.z); if (y < 1) continue; const m = crateModel(); m.position.set(c.x, y, c.z); m.rotation.y = c.rot * Math.PI / 2; FURN.add(m); addBox(c.x - 0.5, y, c.z - 0.5, c.x + 0.5, y + 0.8, c.z + 0.5);
    S.conts.push({ kind: 'crate', name: 'Caja', pos: new V3(c.x, y, c.z), items: [] });
  }
  for (const p of POIS) if (p.type === 'town') S.conts.push({ kind: 'fountain', name: 'Fuente', pos: new V3(p.x, p.h, p.z), items: [], water: true, r: 4.3 });
}
placeFurniture();
if (typeof CITY !== 'undefined') for (const c of CITY.conts) S.conts.push({ kind: c.kind, name: c.name, pos: c.pos, items: [], water: c.water, r: c.r, room: c.room, loot: c.loot, model: c.model, box: c.box, dismantle: c.dismantle });
function fillContainers() {
  for (const c of S.conts) {
    c.items = []; const lt = c.loot !== undefined ? c.loot : c.kind; if (!lt || !LOOT[lt]) continue;
    const n = c.kind === 'fridge' ? RI(0, 3) : c.kind === 'crate' ? RI(1, 3) : c.kind === 'shelf' ? RI(1, 4) : RI(0, 3);
    for (let i = 0; i < n; i++) { const it = rollItem(lt); if (it) c.items.push(it); }
  }
}

// ---------- objetos en el suelo ----------
// fusiona las piezas opacas de un grupo en una sola malla (menos llamadas de dibujo)
const FLAT_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.1, envMapIntensity: 0.7 });
const RING_MAT = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false }), RING_GEO = new THREE.RingGeometry(0.22, 0.28, 16);
function flattenInto(group, mat = FLAT_MAT) {
  group.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(group.matrixWorld).invert(), mm = new THREE.Matrix4(), col = new THREE.Color();
  const P = [], N = [], C = [], kill = [];
  group.traverse(o => { if (!o.isMesh || o === group || (o.material && o.material.transparent)) return; const g0 = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); mm.multiplyMatrices(inv, o.matrixWorld); g0.applyMatrix4(mm);
    const n = g0.attributes.position.count, ca = g0.attributes.color, mc = o.material.color || col.setRGB(1, 1, 1), vc = o.material.vertexColors;
    for (let i = 0; i < n; i++) { P.push(g0.attributes.position.getX(i), g0.attributes.position.getY(i), g0.attributes.position.getZ(i)); N.push(g0.attributes.normal.getX(i), g0.attributes.normal.getY(i), g0.attributes.normal.getZ(i)); const r = ca && vc ? ca.getX(i) : 1, gg = ca && vc ? ca.getY(i) : 1, b = ca && vc ? ca.getZ(i) : 1; C.push(r * mc.r, gg * mc.g, b * mc.b); }
    kill.push(o); });
  for (const o of kill) o.parent.remove(o);
  if (!P.length) return null;
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); bg.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  const me = new THREE.Mesh(bg, mat); me.castShadow = true; me.receiveShadow = true; group.add(me); return me;
}
function dropGround(it, x, z, y) {
  const m = propModel(it.id); flattenInto(m); const gy = Math.max(getH(x, z), y !== undefined ? y : -99);
  m.position.set(x, gy + 0.02, z); m.rotation.y = R(0, 6.28); scene.add(m);
  const ring = new THREE.Mesh(RING_GEO, RING_MAT); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; m.add(ring);
  S.ground.push({ it, mesh: m, pos: m.position });
}
function removeGround(g) { scene.remove(g.mesh); S.ground.splice(S.ground.indexOf(g), 1); }

// ---------- superviviente ----------
class Survivor {
  constructor(look, name) {
    this.name = name; this.c = HUMAN.build(crOpts(CR)); this.model = this.c.root; scene.add(this.model);
    this.pos = new V3(); this.vel = new V3(); this.yaw = 0; this.bodyYaw = 0; this.walk = 0;
    this.hp = 100; this.food = 85; this.water = 80; this.sta = 100; this.bleed = 0; this.alive = true; this.cause = '';
    this.inv = []; this.eq = null; this.atkCd = 0; this.swing = 0; this.hitPending = 0; this.reloadT = 0; this.weaponMesh = null; this.wkey = ''; this.sprint = false; this.onGround = true; this.stepT = 0; this.hurtT = 0;
  }
  chest(o) { return o.set(this.pos.x, this.pos.y + this.c.h * 0.55, this.pos.z); }
}
function eqDef(p) { const it = p.eq; if (!it) return { kind: 'melee', d: MELEE.fists, n: 'Puños' }; const d = ITEMS[it.id]; if (d.melee) return { kind: 'melee', d: MELEE[d.melee], n: d.n }; if (d.thrown) return { kind: 'throw', d: MELEE.fists, n: d.n }; return { kind: 'gun', d: GUNS[d.gun], n: d.n }; }
function updateHeld(p) {
  const it = p.eq, key = it ? it.id : '';
  if (key === p.wkey) return; p.wkey = key;
  if (p.weaponMesh) { p.weaponMesh.parent.remove(p.weaponMesh); p.weaponMesh = null; }
  if (!it) return;
  const d = ITEMS[it.id], m = d.gun ? weaponModel(it.id, 0) : meleeModel(d.melee || it.id);
  m.rotation.x = -Math.PI / 2; m.scale.setScalar(0.85); p.c.P.hand.add(m); p.weaponMesh = m;
}

// ---------- zombis ----------
let ZID = 0;
class Zombie {
  constructor(x, z) {
    this.id = ZID++; this.c = HUMAN.build(zombieOpts()); this.model = this.c.root; scene.add(this.model);
    this.pos = new V3(x, getH(x, z), z); this.vel = new V3(); this.yaw = R(0, 6.28); this.bodyYaw = this.yaw; this.walk = R(0, 6);
    this.hp = RI(55, 80); this.alive = true; this.state = 'idle'; this.target = new V3(); this.alertT = 0; this.wanderT = R(0, 4); this.atkCd = 0; this.wind = 0; this.stun = 0;
    this.speed = R(1.0, 1.65); this.think = R(0, 0.3); this.deadT = 0; this.groanT = R(3, 14); this.limp = R(0, 1) < 0.3;
    const t = rand(); this.kind = t < 0.08 ? 'crawl' : 'walk';
    if (this.kind === 'crawl') { this.speed = R(0.55, 0.85); this.c.headY = 0.32; this.legless = rand() < 0.5; if (this.legless) { this.c.P.kL.scale.setScalar(0.001); this.c.P.kR.scale.setScalar(0.001); } }
    if (this.kind === 'run') { this.speed = R(2.7, 3.3); this.hp = RI(45, 60); }
    this.armMode = rand() < 0.55 ? 0 : rand() < 0.6 ? 1 : 2; this.lean = R(0.12, 0.4); this.tilt = R(-0.4, 0.4); this.ph = R(0, 6.28); this.twitchT = R(1, 5); this.tw = 0;
  }
}
function spawnZombies(n, far) {
  const p = S.p; let tries = 0;
  while (S.zombies.length < n && tries++ < 5000) {
    let x, z;
    if (typeof CITY !== 'undefined' && CITY.streetPts.length) { if (rand() < 0.75) { const sp = pick(CITY.streetPts); x = sp[0]; z = sp[1]; } else { const r = pick(CITY.rooms); x = R(r.x0 + 1, r.x1 - 1); z = R(r.z0 + 1, r.z1 - 1); } if (p && Math.hypot(x - p.pos.x, z - p.pos.z) > (far ? 230 : 320) && rand() < 0.85) continue; if (!(x > -240 && x < 170 && z > -240 && z < 175) && rand() < 0.85) continue; }
    else if (rand() < 0.75 && HOUSES.length) { const h = pick(HOUSES); x = h.cx + R(-12, 12); z = h.cz + R(-12, 12); }
    else { x = R(-HALF * 0.75, HALF * 0.75); z = R(-HALF * 0.75, HALF * 0.75); }
    if (getH(x, z) < 1.5) continue; if (p && Math.hypot(x - p.pos.x, z - p.pos.z) < (far ? 70 : 40)) continue;
    const z0 = new Zombie(x, z); collide(z0.pos, 0.38, 1.8); S.zombies.push(z0);
  }
}
let respT = 10;
function respawnZombies(dt) {
  respT -= dt; if (respT > 0) return; respT = 12;
  for (const z of S.zombies.slice()) if (!z.alive && z.deadT > 40) { scene.remove(z.model); if (z.pool) scene.remove(z.pool); S.zombies.splice(S.zombies.indexOf(z), 1); }
  const target = Math.min(220, Math.round((S.zCount + dayNum() * 6) * (dayLight() < 0.2 ? 1.2 : 1))), alive = S.zombies.filter(z => z.alive).length; if (alive > 240) return;
  if (alive < target) { const n0 = S.zombies.length; spawnZombies(n0 + Math.min(6, target - alive), true); }
}
function emitNoise(pos, radius) {
  for (const z of S.zombies) { if (!z.alive) continue; const d = z.pos.distanceTo(pos); if (d < radius) { z.state = 'hunt'; z.target.copy(pos); z.alertT = Math.max(z.alertT, 10); } }
}
function zombieSees(z, p) {
  const dx = p.pos.x - z.pos.x, dz = p.pos.z - z.pos.z, d = Math.hypot(dx, dz);
  const night = 1 - dayLight();
  let range = lerp(17, 8, night); if (p.sprint) range *= 1.3; if (flashlight.visible) range += 5;
  if (d > range) return false;
  if (d > 3) { const ang = Math.atan2(-dx, -dz); if (Math.abs(angDiff(z.yaw, ang)) > 1.15) return false; }
  _v.set(z.pos.x, z.pos.y + 1.2, z.pos.z); _v2.set(p.pos.x, p.pos.y + 1.0, p.pos.z); const dir = _v3.subVectors(_v2, _v); const L = dir.length(); dir.divideScalar(L);
  return rayWorld(_v, dir, L) >= L - 0.5;
}
function updateZombie(z, dt) {
  if (z.alive && S.p && z.state !== 'chase') { const fd = Math.abs(z.pos.x - S.p.pos.x) + Math.abs(z.pos.z - S.p.pos.z); if (fd > 140) { z.lodT = (z.lodT || 0) + dt; if (z.lodT < 0.5) { z.model.visible = false; return; } dt = z.lodT; z.lodT = 0; } }
  if (!z.alive) { z.deadT += dt; if (!z.poolMax) z.poolMax = R(0.6, 1.1); animCorpse(z, dt); if (z.deadT > 45) { z.model.visible = false; if (z.pool) z.pool.visible = false; } return; }
  const p = S.p, night = 1 - dayLight();
  z.atkCd -= dt; z.groanT -= dt; if (z.stun > 0) z.stun -= dt;
  if (z.groanT <= 0) { z.groanT = R(5, 16) * (z.state === 'chase' ? 0.4 : 1); sfxAt('groan', z.pos); }
  z.think -= dt;
  if (z.think <= 0 && p.alive) {
    z.think = R(0.25, 0.4);
    let sees = zombieSees(z, p), tg = null;
    if (S.npcs) { let bd = sees ? Math.hypot(p.pos.x - z.pos.x, p.pos.z - z.pos.z) : 11; for (const n of S.npcs) { if (!n.alive || n.state === 'home') continue; const d = Math.hypot(n.pos.x - z.pos.x, n.pos.z - z.pos.z); if (d < bd) { bd = d; tg = n; } } }
    if (tg) { z.tg = tg; if (z.state !== 'chase') z.groanT = 0; z.state = 'chase'; z.alertT = 10; }
    else if (sees) { z.tg = null; if (z.state !== 'chase') { z.groanT = 0; } z.state = 'chase'; z.target.copy(p.pos); z.alertT = 10; }
    else if (z.state === 'chase') { z.state = 'hunt'; z.tg = null; }
  }
  let mx = 0, mz = 0, spd = z.speed * (1 + night * 0.12) * (z.state === 'chase' ? 1.12 : z.state === 'idle' || z.state === 'wander' ? 0.6 : 1);
  const T = z.tg && z.tg.alive ? z.tg : p;
  if (z.state === 'chase') { z.target.copy(T.pos); }
  if (z.state === 'chase' || z.state === 'hunt') {
    z.alertT -= dt;
    const dx = z.target.x - z.pos.x, dz = z.target.z - z.pos.z, d = Math.hypot(dx, dz);
    if (d > 0.9) { mx = dx / d; mz = dz / d; }
    if (z.state === 'hunt' && (d < 1.5 || z.alertT <= 0)) { z.state = 'idle'; z.wanderT = R(2, 6); }
    // ataque
    if (z.state === 'chase' && T.alive) {
      const pd = Math.hypot(T.pos.x - z.pos.x, T.pos.z - z.pos.z);
      if (pd < 1.15 && z.atkCd <= 0 && z.stun <= 0 && Math.abs(T.pos.y - z.pos.y) < 1.5) { z.wind = 0.4; z.atkCd = 1.5; }
      if (pd < 0.85) { mx = 0; mz = 0; }
    }
  } else {
    z.wanderT -= dt; spd = z.speed * 0.35;
    if (z.wanderT <= 0) { z.wanderT = R(3, 8); if (rand() < 0.5) { const a = R(0, 6.28); z.target.set(z.pos.x + Math.cos(a) * 6, 0, z.pos.z + Math.sin(a) * 6); z.state = 'wander'; } else z.state = 'idle'; }
    if (z.state === 'wander') { const dx = z.target.x - z.pos.x, dz = z.target.z - z.pos.z, d = Math.hypot(dx, dz); if (d > 0.8) { mx = dx / d; mz = dz / d; } else z.state = 'idle'; }
  }
  if (z.wind > 0) {
    z.wind -= dt; mx = mz = 0;
    if (z.wind <= 0 && T.alive) { const pd = Math.hypot(T.pos.x - z.pos.x, T.pos.z - z.pos.z); if (pd < 1.45 && z.stun <= 0) { if (T.isNPC) hurtNPC(T, RI(7, 12)); else hurtPlayer(RI(9, 15), z); } }
  }
  if (z.stun > 0) { mx = mz = 0; }
  if (z.limp) spd *= 0.85 + Math.sin(z.walk * 2) * 0.15;
  z.vel.x = lerp(z.vel.x, mx * spd, Math.min(1, dt * 5)); z.vel.z = lerp(z.vel.z, mz * spd, Math.min(1, dt * 5));
  z.pos.addScaledVector(z.vel, dt);
  // separación entre zombis
  for (const o of S.zombies) { if (o === z || !o.alive) continue; const dx = z.pos.x - o.pos.x, dz = z.pos.z - o.pos.z, d2 = dx * dx + dz * dz; if (d2 < 0.55 && d2 > 1e-6) { const d = Math.sqrt(d2), push = (0.74 - d) * 0.5; z.pos.x += dx / d * push; z.pos.z += dz / d * push; } }
  if (p.alive) { const dx = z.pos.x - p.pos.x, dz = z.pos.z - p.pos.z, d2 = dx * dx + dz * dz; if (d2 < 0.5 && d2 > 1e-6) { const d = Math.sqrt(d2); z.pos.x = p.pos.x + dx / d * 0.71; z.pos.z = p.pos.z + dz / d * 0.71; } }
  const bx0 = z.pos.x, bz0 = z.pos.z;
  collide(z.pos, 0.36, 1.8);
  if ((z.state === 'chase' || z.state === 'hunt') && (mx || mz) && S.built.length) {
    const blocked = Math.hypot(z.pos.x - bx0, z.pos.z - bz0) > 0.0001;
    if (blocked && z.atkCd <= 0) for (const pc of S.built) { if (BUILD[pc.type].floor) continue; const a = pieceAABB(pc.type, pc.x, pc.z, pc.rot); const cx = clamp(z.pos.x, a[0], a[2]), cz = clamp(z.pos.z, a[1], a[3]); if (Math.hypot(cx - z.pos.x, cz - z.pos.z) < 0.55 && !(BUILD[pc.type].door && pc.open)) { z.atkCd = 1.4; z.wind = 0; pc.hp -= RI(8, 14); burst(new V3(cx, z.pos.y + 1.1, cz), 0x8a5a2a, 4, 2, 0.4); sfxAt('thud', z.pos); if (pc.hp <= 0) { destroyPiece(pc); msg(`¡Los zombis han roto: ${BUILD[pc.type].n}!`, 2); } break; } }
  }
  const g = getH(z.pos.x, z.pos.z); if (g < -0.6) { z.pos.addScaledVector(z.vel, -dt * 2); z.state = 'idle'; }
  z.pos.y = Math.max(g, -1.1);
  const sp = Math.hypot(z.vel.x, z.vel.z);
  if (sp > 0.15) z.yaw = Math.atan2(-z.vel.x, -z.vel.z); else if (z.state === 'chase') z.yaw = Math.atan2(-(p.pos.x - z.pos.x), -(p.pos.z - z.pos.z));
  animZombie(z, dt, sp);
}
function animZombie(z, dt, sp) {
  const P = z.c.P, m = z.model;
  const cd = camera.position.distanceTo(z.pos); if (cd > 95) { m.visible = false; return; } m.visible = true;
  const near = cd < 26; if (z.shNear !== near && z.c.meshes) { z.shNear = near; for (const me of z.c.meshes) me.castShadow = near; }
  m.position.copy(z.pos);
  z.bodyYaw += angDiff(z.bodyYaw, z.yaw) * Math.min(1, dt * 5); m.rotation.set(0, z.bodyYaw, 0);
  const t = S.time + z.ph, run = z.kind === 'run', mv = Math.min(1, sp / (run ? 2.5 : 1.3));
  z.walk += sp * dt * (z.kind === 'crawl' ? 3.2 : run ? 2.2 : 2.7);
  z.twitchT -= dt; if (z.twitchT <= 0) { z.twitchT = R(1.5, 6); z.tw = 0.25; } if (z.tw > 0) z.tw -= dt;
  const tw = z.tw > 0 ? Math.sin(z.tw * 60) * 0.12 : 0, w = z.walk;
  if (z.kind === 'crawl') {
    P.rig.rotation.set(-1.42, 0, Math.sin(w) * 0.06); P.rig.position.set(0, 0.2, 0.75);
    P.body.rotation.set(0, Math.sin(w) * 0.1, 0);
    const a = Math.sin(w), b = Math.sin(w + Math.PI);
    P.aL.rotation.set(Math.PI - 0.4 + a * 0.55, 0, -0.25); P.eL.rotation.set(0.3 + Math.max(0, -a) * 0.9, 0, 0);
    P.aR.rotation.set(Math.PI - 0.4 + b * 0.55, 0, 0.25); P.eR.rotation.set(0.3 + Math.max(0, -b) * 0.9, 0, 0);
    P.head.rotation.set(0.9 + tw, Math.sin(t * 0.8) * 0.3, z.tilt * 0.5);
    P.lL.rotation.set(0.05 + Math.sin(w) * 0.08, 0, -0.1); P.lR.rotation.set(0.05 - Math.sin(w) * 0.08, 0, 0.1); P.kL.rotation.x = -0.2; P.kR.rotation.x = -0.35;
    return;
  }
  // piernas con rodillas: la pierna que avanza dobla la rodilla
  const amp = (run ? 0.75 : 0.42) * mv, sL = Math.sin(w), sR = Math.sin(w + Math.PI) * (z.limp ? 0.55 : 1);
  P.lL.rotation.set(sL * amp + (run ? 0.1 : 0), 0, -0.04); P.lR.rotation.set(sR * amp + (run ? 0.1 : 0), 0, 0.04);
  P.kL.rotation.x = -(0.08 + Math.max(0, Math.cos(w)) * (run ? 1.3 : 0.7) * mv); P.kR.rotation.x = -(0.08 + Math.max(0, Math.cos(w + Math.PI)) * (run ? 1.3 : 0.7) * mv * (z.limp ? 0.4 : 1));
  P.rig.position.set(0, -Math.abs(Math.cos(w)) * 0.03 * mv - (z.limp ? Math.max(0, Math.sin(w)) * 0.04 : 0), 0); P.rig.rotation.set(0, 0, 0);
  // tronco encorvado, balanceo y sacudidas
  const idle = 1 - mv;
  P.body.rotation.set(-(z.lean + (run ? 0.25 : 0)) + Math.sin(t * 1.1) * 0.04 * idle + (z.stun > 0 ? 0.35 : 0) + (z.hitT > 0 ? 0.25 : 0), Math.sin(w) * 0.12 * mv + tw, Math.sin(w) * 0.07 * mv + Math.sin(t * 0.7) * 0.05 * idle + (z.limp ? 0.06 : 0));
  // brazos: tendidos hacia delante, uno colgando o ambos colgando
  const reach = z.wind > 0 ? 2.5 - z.wind * 2.2 : 1.35, bob = Math.sin(t * 2.3) * 0.08;
  const armR = (mode, side) => { if (z.wind > 0 || z.state === 'chase' && mode < 2 || mode === 0 || (mode === 1 && side > 0)) return [reach + bob * side, 0.35 + (z.wind > 0 ? 0.2 : 0)]; return [-Math.sin(w) * side * 0.35 * mv + 0.05, 0.15 + Math.sin(t * 1.3 + side) * 0.08]; };
  const [lx, le] = armR(z.armMode, -1), [rx, re] = armR(z.armMode, 1);
  P.aL.rotation.set(lx + (run ? -0.4 : 0), 0, -0.12); P.eL.rotation.set(le, 0, 0); P.aR.rotation.set(rx + (run ? -0.4 : 0), 0, 0.12); P.eR.rotation.set(re, 0, 0);
  if (run && z.wind <= 0) { P.aL.rotation.x = -Math.sin(w) * 1.0 + 0.3; P.aR.rotation.x = Math.sin(w) * 1.0 + 0.3; P.eL.rotation.x = P.eR.rotation.x = 1.2; }
  P.head.rotation.set(0.2 - z.lean * 0.6 + Math.sin(w * 2) * 0.05 * mv + tw, Math.sin(t * 0.9) * 0.3 * idle + tw * 2, z.tilt + Math.sin(t * 0.6) * 0.1);
  if (z.flash > 0) { z.flash -= dt; P.body.position.x = (Math.random() - 0.5) * 0.05; } else P.body.position.x = 0;
  if (z.hitT > 0) z.hitT -= dt;
}
// muerte: se dobla y cae como un peso muerto
const POOL_GEO = new THREE.CircleGeometry(1, 18), POOL_MAT = new THREE.MeshStandardMaterial({ color: 0x3a0504, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
function animCorpse(z, dt) {
  const P = z.c.P, m = z.model, k = Math.min(1, z.deadT * 2.2), e = k * k;
  if (z.fall === undefined) { z.fall = rand() < 0.55 ? 1 : -1; z.dyaw = R(-0.6, 0.6); }
  m.position.copy(z.pos); m.rotation.set(0, z.bodyYaw + z.dyaw * e, 0);
  if (z.kind !== 'crawl') { P.rig.rotation.set(z.fall * -1.5 * e, 0, z.dyaw * 0.3 * e); P.rig.position.set(0, 0.12 * e, 0); P.kL.rotation.x = P.kR.rotation.x = -0.5 * Math.sin(k * Math.PI) - 0.15 * e; P.body.rotation.set(z.fall * -0.15 * e, 0, 0.1 * e); P.aL.rotation.set(z.fall > 0 ? 2.6 * e : 0.4, 0, -0.5 * e); P.aR.rotation.set(z.fall > 0 ? 2.2 * e : 0.3, 0, 0.7 * e); P.eL.rotation.x = P.eR.rotation.x = 0.3; P.head.rotation.set(0, 0.6 * e * z.fall, 0.3); }
  if (k >= 1 && !z.pool) { z.pool = new THREE.Mesh(POOL_GEO, POOL_MAT); z.pool.rotation.x = -Math.PI / 2; z.pool.position.set(z.pos.x - Math.sin(z.bodyYaw) * 0.8 * z.fall, z.pos.y + 0.02, z.pos.z - Math.cos(z.bodyYaw) * 0.8 * z.fall); z.pool.scale.setScalar(0.1); scene.add(z.pool); }
  if (z.pool && z.pool.scale.x < z.poolMax) z.pool.scale.setScalar(Math.min(z.poolMax, z.pool.scale.x + dt * 0.12));
}
function hurtZombie(z, dmg, from, push) {
  if (!z.alive) return;
  z.hp -= dmg; z.flash = 0.15; z.hitT = 0.22; z.state = 'chase'; z.alertT = 10;
  _v.set(z.pos.x, z.pos.y + 1.2, z.pos.z); burst(_v, 0x7a1010, 6, 3, 0.5); dmgNum(_v.clone().setY(_v.y + 0.6), Math.round(dmg), dmg >= 30 ? '#ffd23f' : '#ffffff');
  if (push) { const dx = z.pos.x - from.x, dz = z.pos.z - from.z, d = Math.hypot(dx, dz) || 1; z.vel.set(dx / d * push, 0, dz / d * push); z.stun = Math.max(z.stun, push > 3 ? 0.7 : 0.35); z.wind = 0; }
  if (z.hp <= 0) { z.alive = false; z.deadT = 0; S.kills++; sfxAt('thud', z.pos); if (rand() < 0.18) dropGround(rollItem('floor'), z.pos.x + R(-0.5, 0.5), z.pos.z + R(-0.5, 0.5)); }
}
function hurtPlayer(dmg, z) {
  const p = S.p; if (!p.alive) return;
  if (S.drive && z) { S.drive.hp -= dmg * 0.5; sfx('thud', 0.6); if (Math.random() < 0.15) msg('¡Están golpeando el coche!', 1); return; }
  p.hp -= dmg; p.hurtT = 0.3; $('dmgfx').style.opacity = 0.9; setTimeout(() => $('dmgfx').style.opacity = 0, 250);
  sfx('hurt', 0.9); burst(p.chest(_v), 0xb01818, 6, 3, 0.4);
  if (z && rand() < 0.35) { if (!p.bleed) msg('¡Te han herido! Estás sangrando', 2.5); p.bleed = Math.max(p.bleed, 1); }
  if (p.hp <= 0) die(z ? 'devorado por los zombis' : p.cause);
}

// ---------- combate del jugador ----------
let lastBest = 10;
function attack() {
  const p = S.p; if (!p.alive || p.atkCd > 0 || p.reloadT > 0 || S.invOpen) return;
  const E = eqDef(p);
  if (E.kind === 'gun') {
    const it = p.eq, g = E.d;
    if (it.mag <= 0) { sfx('click', 0.8); if (!startReload()) msg('Sin munición', 1.2); p.atkCd = 0.3; return; }
    it.mag--; p.atkCd = g.rate; p.swing = 0.12;
    const fp = S.view === 'fp', o = fp ? camera.position.clone() : p.chest(new V3()); if (!fp) o.y += 0.15;
    const from = fp ? vmMuzzle() : o;
    for (let k = 0; k < g.pellets; k++) {
      const a = p.yaw + R(-g.spread, g.spread), pt = fp ? S.pitch + R(-g.spread, g.spread) * 0.6 : 0, d = new V3(-Math.sin(a) * Math.cos(pt), Math.sin(pt), -Math.cos(a) * Math.cos(pt));
      let best = rayWorld(o, d, g.range), hz = null, head = false; lastBest = best;
      for (const z of S.zombies) { if (!z.alive) continue; const hy = z.pos.y + z.c.headY, hr = z.c.headR; const th = raySphere(o, d, z.pos.x, hy, z.pos.z, hr); if (th < best) { best = th; hz = z; head = true; } const t = rayCyl(o, d, z.pos.x, z.pos.z, 0.42, z.pos.y, hy - hr * 0.7); if (t < best) { best = t; hz = z; head = false; } }
      const end = o.clone().addScaledVector(d, Math.min(best, g.range)); lastBest = best; if (g.ammo !== 'bolt') tracer(from, end);
      if (hz) { hurtZombie(hz, g.dmg * (head ? 2.2 : 1) * (best < 6 ? 1 : lerp(1, 0.5, clamp((best - 6) / g.range, 0, 1))), p.pos, g.pellets > 1 ? 2 : 1); if (head && !hz.alive && !hz.headless) { hz.headless = true; hz.c.P.head.scale.setScalar(0.001); const hp2 = new V3(hz.pos.x, hz.pos.y + (hz.kind === 'crawl' ? 0.35 : 1.7), hz.pos.z); burst(hp2, 0x6a0a06, 22, 5, 0.8); burst(hp2, 0xc8b8a0, 6, 4, 0.6); } } else burst(end, 0xd8c8a0, 3, 2, 0.3);
    }
    if (g.ammo === 'bolt') { sfx('swish', 1); if (rand() < 0.55) { const e2 = o.clone().addScaledVector(new V3(-Math.sin(p.yaw), 0, -Math.cos(p.yaw)), Math.min(lastBest, g.range) - 0.4); dropGround(mk('bolt'), e2.x, e2.z); } } else sfx(it.id === 'shotgun' ? 'shotgun' : 'shot', 1); emitNoise(p.pos, g.noise);
    if (it.mag <= 0) startReload();
    return;
  }
  if (E.kind === 'throw') { throwMolotov(); return; }
  const m = E.d;
  p.atkCd = m.rate * (p.sta < 10 ? 1.6 : 1); p.swing = 0.32; S.punch = (S.punch || 0) + 1; p.hitPending = 0.13; p.sta = Math.max(0, p.sta - m.sta);
  sfx('swish', 0.7);
}
function resolveMelee() {
  const p = S.p, E = eqDef(p), m = E.d; let hit = false;
  for (const z of S.zombies) {
    if (!z.alive) continue; const dx = z.pos.x - p.pos.x, dz = z.pos.z - p.pos.z, d = Math.hypot(dx, dz);
    if (d > m.range + 0.35) continue; if (Math.abs(angDiff(p.yaw, Math.atan2(-dx, -dz))) > m.arc * 0.6 + (d < 0.8 ? 0.8 : 0)) continue;
    hurtZombie(z, m.dmg * R(0.85, 1.15) * (p.sta < 10 ? 0.6 : 1), p.pos, m.push); hit = true;
  }
  if (!hit) { const dr = lookPiece(m.range + 0.4); if (dr && dr.city && !dr.open) { const dm = m.dmg * (p.eq && p.eq.id === 'axe' ? 2.6 : p.eq && p.eq.id === 'hammer' ? 1.6 : 1) * R(0.85, 1.15); dr.hp -= dm; hit = true; burst(new V3(dr.x, dr.y + 1.1, dr.z), 0x8a6a4a, 6, 3, 0.4); dmgNum(new V3(dr.x, dr.y + 1.8, dr.z), Math.round(dm), '#d8c8a0'); emitNoise(p.pos, 18); if (dr.hp <= 0) { destroyPiece(dr); msg('¡Puerta reventada!', 1.6); saveSoon(); } } }
  if (hit) { sfx('thud', 0.9); emitNoise(p.pos, 7); if (p.eq && p.eq.dur !== undefined) { p.eq.dur--; if (p.eq.dur <= 0) { msg(`¡Se ha roto: ${ITEMS[p.eq.id].n}!`, 2); p.inv.splice(p.inv.indexOf(p.eq), 1); p.eq = null; S.dirty = true; } } }
}
function startReload() {
  const p = S.p, it = p.eq; if (!it || !ITEMS[it.id].gun) return false; const g = GUNS[ITEMS[it.id].gun];
  const am = p.inv.find(o => o.id === g.ammo); if (!am || it.mag >= g.mag) return false;
  p.reloadT = g.reload; p.reloadFor = it; msg('Recargando…', g.reload); return true;
}
function finishReload() { const p = S.p, it = p.reloadFor; if (!it || it !== p.eq) return; const g = GUNS[ITEMS[it.id].gun]; const am = p.inv.find(o => o.id === g.ammo); if (!am) return; const n = Math.min(g.mag - it.mag, am.n); it.mag += n; am.n -= n; if (am.n <= 0) p.inv.splice(p.inv.indexOf(am), 1); S.dirty = true; }

// ---------- usar objetos ----------
function useItem(it) {
  const p = S.p, d = ITEMS[it.id];
  if (d.melee || d.gun || d.thrown) { p.eq = p.eq === it ? null : it; p.reloadT = 0; sfx('click', 0.6); S.dirty = true; return; }
  if (d.food || d.drink) {
    if (d.food) p.food = clamp(p.food + d.food, 0, 100); if (d.drink) p.water = clamp(p.water + d.drink, 0, 100);
    sfx(d.drink > d.food ? 'drink' : 'eat', 0.9); msg(`${d.drink > (d.food || 0) ? 'Bebes' : 'Comes'}: ${d.n}`, 1.4);
    consume(it); if (d.empty) addItem(p, mk(d.empty)); S.dirty = true; return;
  }
  if (it.id === 'gas') { const c = nearCar(S.p, 3.5) || S.drive; if (c) { c.fuel = Math.min(100, c.fuel + 50); consume(it); msg('⛽ Repostas: ' + Math.round(c.fuel) + '%', 1.6); sfx('drink', 0.6); S.dirty = true; } else msg('Acércate a un coche para repostar', 1.5); return; }
  if (d.booster) { const r = pick(['una común… otra vez', 'una rara', '¡una mítica!', '¡una FOIL brillante!', 'una carta de tierra básica', '¡la carta que te faltaba para el mazo!']); msg(`Abres el sobre: ${r}`, 2.5); sfx('pick', 1); consume(it); S.cards = (S.cards || 0) + 1; S.dirty = true; return; }
  if (d.heal) { p.hp = Math.min(100, p.hp + d.heal); if (d.stop && p.bleed) { p.bleed = 0; msg('Herida vendada', 1.5); } else msg(`Usas: ${d.n}`, 1.3); sfx('pick', 0.7); consume(it); S.dirty = true; return; }
  msg('No se puede usar', 1);
}
function consume(it) { const p = S.p; it.n--; if (it.n <= 0) { p.inv.splice(p.inv.indexOf(it), 1); if (p.eq === it) p.eq = null; } }
function dropItem(it) { const p = S.p; p.inv.splice(p.inv.indexOf(it), 1); if (p.eq === it) p.eq = null; if (S.open && S.open.kind !== 'sink' && S.open.kind !== 'fountain') S.open.items.push(it); else dropGround(it, p.pos.x + R(-0.4, 0.4), p.pos.z + R(-0.4, 0.4), p.pos.y); S.dirty = true; }
function takeItem(c, it) { const p = S.p; if (invWeight(p) + ITEMS[it.id].w * it.n > MAX_W) { msg('Llevas demasiado peso', 1.5); return; } c.items.splice(c.items.indexOf(it), 1); addItem(p, it); sfx('pick', 0.6); S.dirty = true; if (!p.eq && (ITEMS[it.id].melee || ITEMS[it.id].gun)) p.eq = it; }
function drinkWater() {
  const p = S.p; p.water = 100; sfx('drink', 1);
  let filled = 0; for (const it of p.inv) if (it.id === 'bottle') { it.id = 'water'; filled++; }
  msg(filled ? `Bebes agua y llenas ${filled} botella${filled > 1 ? 's' : ''}` : 'Bebes agua hasta saciarte', 1.8); S.dirty = true;
}

// ---------- interacción ----------
function findNear() {
  const p = S.p; if (!p || !p.alive) return null;
  let best = null, bd = 1e9;
  for (const g of S.ground) { const d = Math.hypot(g.pos.x - p.pos.x, g.pos.z - p.pos.z); if (d < 1.4 && d < bd && Math.abs(g.pos.y - p.pos.y) < 1.5) { bd = d; best = { k: 'g', g }; } }
  if (best) return best;
  if (S.drive) return { k: 'drive' };
  if (typeof nearNPC === 'function') { const nn = nearNPC(p); if (nn) return { k: 'npc', n: nn }; }
  const pc = lookPiece(2.0); if (pc && (BUILD[pc.type].door || BUILD[pc.type].bed)) return { k: 'piece', pc };
  const nc = nearCar(p); if (nc) return { k: 'car', c: nc };
  for (const c of S.conts) { if (c.gone) continue; if ((c.house && c.house !== S.houseIn) || (c.room && c.room !== S.houseIn)) continue; const d = Math.hypot(c.pos.x - p.pos.x, c.pos.z - p.pos.z); if (d < (c.r || 1.5) && d < bd && Math.abs(c.pos.y - p.pos.y) < 1.8) { bd = d; best = { k: 'c', c }; } }
  return best;
}
function interact() {
  const p = S.p; if (!p || !p.alive || S.phase !== 'game') return;
  if (S.open) { closeInv(); return; }
  const n = findNear(); if (!n) return;
  if (n.k === 'g') { if (invWeight(p) + ITEMS[n.g.it.id].w * n.g.it.n > MAX_W) { msg('Llevas demasiado peso', 1.5); return; } addItem(p, n.g.it); if (!p.eq && (ITEMS[n.g.it.id].melee || ITEMS[n.g.it.id].gun)) p.eq = n.g.it; msg(`Recoges: ${ITEMS[n.g.it.id].n}`, 1.2); removeGround(n.g); sfx('pick', 0.7); S.dirty = true; return; }
  if (n.k === 'drive') { exitCar(); return; }
  if (n.k === 'npc') { talk(n.n); return; }
  if (n.k === 'car') { enterCar(n.c); return; }
  if (n.k === 'piece') { if (BUILD[n.pc.type].door) { if (n.pc.locked && !n.pc.open) { msg('🔒 Cerrada con llave. Rómpela a golpes (un hacha va mejor)', 2.2); sfx('click', 0.8); emitNoise(p.pos, 4); return; } setDoor(n.pc, !n.pc.open); sfx('open', 0.8); emitNoise(p.pos, 5); saveSoon(); } else sleepBed(); return; }
  const c = n.c;
  if (c.water) { drinkWater(); if (c.kind === 'fountain') return; }
  openCont(c);
}
function openCont(c) { if (document.pointerLockElement) document.exitPointerLock(); S.open = c; S.invOpen = true; c.searched = true; S.dirty = true; sfx('open', 0.6); emitNoise(S.p.pos, 3); renderInv(); }
function closeInv() { const was = S.invOpen; S.open = null; S.invOpen = false; $('inv').classList.add('hidden'); if (was && S.phase === 'game' && S.view === 'fp') { mouseL = false; updateLock(); } }
function toggleInv() { if (S.invOpen) closeInv(); else { if (document.pointerLockElement) document.exitPointerLock(); S.invOpen = true; S.open = null; S.dirty = true; renderInv(); } }
function itemRow(it, btns) {
  const d = ITEMS[it.id]; let sub = [];
  if (d.food) sub.push(`🍗+${d.food}`); if (d.drink) sub.push(`💧${d.drink > 0 ? '+' : ''}${d.drink}`); if (d.heal) sub.push(`❤️+${d.heal}`);
  if (it.dur !== undefined) sub.push(`durabilidad ${it.dur}`); if (it.mag !== undefined) sub.push(`cargador ${it.mag}/${GUNS[d.gun].mag}`);
  if (d.melee) sub.push(`daño ${MELEE[d.melee].dmg}`);
  sub.push(`${(d.w * it.n).toFixed(1)} kg`);
  return `<div class="it${S.p.eq === it ? ' eq' : ''}"><span class="ic">${d.ic}</span><span class="nm">${it.name || d.n}${it.n > 1 ? ' ×' + it.n : ''}<small>${sub.join(' · ')}</small></span>${btns}</div>`;
}
function renderInv() {
  if (!S.invOpen) return; S.dirty = false; const p = S.p;
  $('inv').classList.remove('hidden');
  $('wt').textContent = `${invWeight(p).toFixed(1)} / ${MAX_W} kg`;
  const il = $('invl');
  il.innerHTML = p.inv.length ? p.inv.map((it, i) => { const d = ITEMS[it.id]; const use = d.melee || d.gun || d.thrown ? (p.eq === it ? 'Guardar' : 'Equipar') : (d.food || d.drink || d.heal || d.use) ? 'Usar' : ''; return itemRow(it, (use ? `<button class="ib" data-u="${i}">${use}</button>` : '') + `<button class="ib x" data-d="${i}">${S.open && S.open.items ? 'Dejar' : 'Tirar'}</button>`); }).join('') : '<div class="empty">Mochila vacía. Busca en armarios, neveras y cajas.</div>';
  const cp = $('contp'), c = S.open;
  if (c && c.kind !== 'fountain') {
    cp.classList.remove('hidden'); $('contn').textContent = (c.water ? '🚰 ' : '📦 ') + c.name; $('takeall').classList.toggle('hidden', !c.items.length); $('dism').classList.toggle('hidden', !c.dismantle);
    $('contl').innerHTML = (c.water ? '<div class="empty">Has bebido agua del grifo. Las botellas vacías se rellenan solas.</div>' : '') + (c.items.length ? c.items.map((it, i) => itemRow(it, `<button class="ib" data-t="${i}">Coger</button>`)).join('') : (c.water ? '' : '<div class="empty">Aquí no queda nada.</div>'));
  } else if (!c) {
    cp.classList.remove('hidden'); $('contn').textContent = '🛠️ Crear objetos'; $('takeall').classList.add('hidden'); $('dism').classList.add('hidden');
    const ok = RECIPES.map((r, i) => [r, i]).sort((a, b) => recipeOk(p, b[0]) - recipeOk(p, a[0]));
    $('contl').innerHTML = ok.map(([r, i]) => recipeRow(p, r, i)).join('');
  } else cp.classList.add('hidden');
}
$('inv').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const p = S.p;
  if (b.dataset.u !== undefined) useItem(p.inv[+b.dataset.u]);
  else if (b.dataset.d !== undefined) dropItem(p.inv[+b.dataset.d]);
  else if (b.dataset.c !== undefined) craft(+b.dataset.c);
  else if (b.dataset.t !== undefined && S.open) takeItem(S.open, S.open.items[+b.dataset.t]);
  else if (b.id === 'takeall' && S.open) for (const it of S.open.items.slice()) takeItem(S.open, it);
  else if (b.id === 'dism' && S.open) { dismantleFurniture(S.open); return; }
  renderInv();
});
$('binv').onclick = () => toggleInv();
$('invx').onclick = e => { e.stopPropagation(); closeInv(); };
$('prompt').onclick = () => interact();
const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IN_FRAME = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const STANDALONE = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
function fsHelp(failed) {
  const url = location.href.split('#')[0];
  let h = '';
  if (IN_FRAME) h += '<p>El juego está dentro de la página de Claude y el navegador no deja que se ponga a pantalla completa desde aquí.</p><a class="eb" href="' + url + '" target="_blank" rel="noopener">Abrir el juego en una pestaña nueva</a><p style="font-size:12px;opacity:.7">En la pestaña nueva vuelve a pulsar ⛶.</p>';
  else if (failed) h += '<p>Tu navegador no ha permitido la pantalla completa.</p>';
  if (IS_IOS) h += '<p><b>En iPhone/iPad</b> Safari no permite pantalla completa en juegos web. Para verlo sin barras: abre el juego en Safari, pulsa <b>Compartir</b> → <b>Añadir a pantalla de inicio</b> y ábrelo desde ese icono. Gira el móvil en horizontal.</p>';
  else h += '<p><b>En Android</b> también puedes usar el menú de Chrome → <b>Añadir a pantalla de inicio</b> y abrirlo desde el icono: se abre a pantalla completa.</p>';
  $('fstext').innerHTML = h; $('fshelp').classList.remove('hidden'); if (document.pointerLockElement) document.exitPointerLock();
}
$('fsclose').onclick = () => $('fshelp').classList.add('hidden');
function toggleFS() {
  const d = document, el = d.documentElement, on = d.fullscreenElement || d.webkitFullscreenElement;
  if (on) { try { (d.exitFullscreen || d.webkitExitFullscreen).call(d); } catch (e) { } return; }
  const req = el.requestFullscreen || el.webkitRequestFullscreen, can = (d.fullscreenEnabled || d.webkitFullscreenEnabled) && req;
  if (!can) { fsHelp(false); return; }
  try { const pr = req.call(el, { navigationUI: 'hide' }); const ok = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }; if (pr && pr.then) pr.then(ok, () => fsHelp(true)); else setTimeout(() => { if (!(d.fullscreenElement || d.webkitFullscreenElement)) fsHelp(true); else ok(); }, 400); } catch (e) { fsHelp(true); }
}
if (STANDALONE) for (const id of ['fsb', 'fsm']) { const el = $(id); if (el) el.style.display = 'none'; }
for (const id of ['fsb', 'fsm']) { const el = $(id); if (el) el.onclick = e => { e.stopPropagation(); toggleFS(); }; }
document.addEventListener('fullscreenchange', () => setTimeout(() => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }, 100));

// ---------- día y noche ----------
const SKY = scene.userData.sky.material.uniforms;
const DAYC = { top: new THREE.Color(0x56626e), mid: new THREE.Color(0x8e969a), bot: new THREE.Color(0xb4b0a4) };
const DUSKC = { top: new THREE.Color(0x3a3a4a), mid: new THREE.Color(0x9a6a52), bot: new THREE.Color(0xc88a5a) };
const NIGHTC = { top: new THREE.Color(0x05070c), mid: new THREE.Color(0x0b1018), bot: new THREE.Color(0x141a22) };
const flashlight = new THREE.SpotLight(0xfff2d0, 0, 26, 0.55, 0.5, 1.2); flashlight.castShadow = false; scene.add(flashlight); scene.add(flashlight.target); flashlight.visible = false;
const pLight = new THREE.PointLight(0x9ab0ff, 0, 9); scene.add(pLight);
let envMats = null, envCur = -1;
function setEnv(v) {
  if (Math.abs(v - envCur) < 0.02) return; envCur = v;
  if (!envMats) { envMats = new Set(); scene.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) if (m.isMeshStandardMaterial) envMats.add(m); }); for (const m of Object.values(_matCache)) if (m.isMeshStandardMaterial) envMats.add(m); for (const m of envMats) m.userData.envBase = m.envMapIntensity; }
  for (const m of envMats) m.envMapIntensity = m.userData.envBase * v;
}
function hourNow() { return (START_HOUR + S.clock / DAY * 24) % 24; }
function dayNum() { return Math.floor((START_HOUR + S.clock / DAY * 24) / 24) + 1; }
function dayLight() { const h = hourNow(); return clamp(Math.sin((h - 6) / 12 * Math.PI) * 1.6 + 0.15, 0, 1); }
const _sc = new THREE.Color();
function updateDayNight(focus) {
  const h = hourNow(), dl = dayLight(), sunA = (h - 6) / 12 * Math.PI;
  const dusk = clamp(1 - Math.abs(dl - 0.35) / 0.35, 0, 1) * (dl < 0.9 ? 1 : 0);
  const night = dl < 0.02;
  // posición del sol / luna
  const a = night ? sunA + Math.PI : sunA;
  SUN_OFF.set(Math.cos(a) * 140, Math.max(35, Math.abs(Math.sin(a)) * 160), 60);
  sun.intensity = lerp(0.14, 1.05, dl); sun.color.setRGB(1, lerp(0.72, 0.9, dl), lerp(0.5, 0.76, dl)); if (dl < 0.05) sun.color.setRGB(0.6, 0.7, 1);
  hemi.intensity = lerp(0.15, 0.32, dl);
  renderer.toneMappingExposure = lerp(0.55, 1.0, dl);
  setEnv(lerp(0.08, 1, dl));
  for (const k of ['top', 'mid', 'bot']) { _sc.copy(NIGHTC[k]).lerp(DAYC[k], dl); _sc.lerp(DUSKC[k], dusk * 0.6); SKY[k].value.copy(_sc); }
  scene.fog.color.copy(SKY.bot.value); scene.fog.near = lerp(8, 22, dl); scene.fog.far = lerp(48, 230, dl);
  water.material.color.setHSL(0.56, 0.6, lerp(0.15, 0.42, dl));
  if (typeof CITY !== 'undefined' && CITY.lamps) CITY.lamps.material.color.setScalar(dl < 0.4 ? 2.2 : 0.55);
  flashlight.visible = dl < 0.3 && S.p && S.p.alive;
  if (flashlight.visible && S.p) { const p = S.p; flashlight.intensity = 2.6 * (1 - dl / 0.3); if (S.view === 'fp') { flashlight.position.copy(camera.position).add(new V3(0.25, -0.25, 0).applyQuaternion(camera.quaternion)); flashlight.target.position.copy(camera.position).add(new V3(0, 0, -10).applyQuaternion(camera.quaternion)); } else { flashlight.position.set(p.pos.x, p.pos.y + 1.5, p.pos.z); flashlight.target.position.set(p.pos.x - Math.sin(p.yaw) * 8, p.pos.y, p.pos.z - Math.cos(p.yaw) * 8); } pLight.intensity = 0.5 * (1 - dl / 0.3); pLight.position.set(p.pos.x, p.pos.y + 2.5, p.pos.z); } else pLight.intensity = 0;
  sun.target.position.set(focus.x, focus.y, focus.z); sun.position.copy(sun.target.position).add(SUN_OFF);
}

// ---------- entrada ----------
const keys = {}; let mouseL = false, mouseNDC = new THREE.Vector2(0, 0), mouseSeen = false;
const touch = { jx: 0, jy: 0, atk: false, run: false, jump: false };
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return; if (e.repeat) return; keys[e.code] = true;
  if (S.phase !== 'game') return;
  if (e.code === 'KeyE' || e.code === 'KeyF') interact();
  if (e.code === 'Tab' || e.code === 'KeyI') { e.preventDefault(); toggleInv(); }
  if (e.code === 'Escape') { if (S.mapOpen) closeMap(); closeInv(); stopPlacing(); closeBuildMenu(); if (S.talkOpen) closeTalk(); }
  if (e.code === 'KeyR') { if (S.placing) rotatePlacing(); else startReload(); }
  if (e.code === 'KeyB') { if (S.placing) stopPlacing(); else if (S.buildOpen) closeBuildMenu(); else openBuildMenu(); }
  if (e.code === 'KeyX') dismantleLooked();
  if (e.code === 'KeyC') openCraft();
  if (e.code === 'KeyM') toggleMap();
  if (e.code === 'KeyV') setView(S.view === 'fp' ? 'top' : 'fp');
  if (e.code === 'KeyQ') S.camYawT = (S.camYawT ?? S.camYaw) + Math.PI / 4;
  if (e.code === 'KeyZ') S.camYawT = (S.camYawT ?? S.camYaw) - Math.PI / 4;
  if (e.code.startsWith('Digit')) { const n = +e.code.slice(5) - 1; const ws = S.p.inv.filter(it => ITEMS[it.id].melee || ITEMS[it.id].gun); if (ws[n]) { S.p.eq = ws[n]; S.dirty = true; sfx('click', 0.5); } }
});
addEventListener('keyup', e => { keys[e.code] = false; });
const cvs = renderer.domElement;
let locked = false;
function requestLock() { if (IS_TOUCH || S.noLock) return; try { const r = cvs.requestPointerLock(); if (r && r.catch) r.catch(() => { S.noLock = true; updateLock(); }); } catch (e) { S.noLock = true; } }
function updateLock() { $('lock').classList.toggle('hidden', !(S.phase === 'game' && S.view === 'fp' && !IS_TOUCH && !locked && !S.noLock && !S.invOpen && !S.buildOpen && !S.talkOpen && !S.mapOpen && S.p && S.p.alive && $('confirm').classList.contains('hidden'))); }
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === cvs; updateLock(); });
document.addEventListener('pointerlockerror', () => { S.noLock = true; updateLock(); });
$('lock').addEventListener('click', () => { initAudio(); requestLock(); });
cvs.addEventListener('mousedown', e => { initAudio(); if (S.phase !== 'game') return; if (S.mapOpen) return; if (S.view === 'fp' && !locked && !S.noLock && !S.invOpen) { requestLock(); return; } if (e.button === 0) { mouseL = true; if (S.invOpen && !S.open) closeInv(); } });
function lookDelta(dx, dy, s) { S.yaw -= dx * s; S.pitch = clamp(S.pitch - dy * s, -1.4, 1.4); }
addEventListener('mouseup', e => { if (e.button === 0) mouseL = false; });
addEventListener('mousemove', e => { if (S.phase === 'game' && S.view === 'fp' && (locked || S.noLock) && !S.invOpen) lookDelta(e.movementX || 0, e.movementY || 0, 0.0022); mouseNDC.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); mouseSeen = true; const a = $('aim'); a.style.left = e.clientX + 'px'; a.style.top = e.clientY + 'px'; });
addEventListener('wheel', e => { if (S.phase === 'game' && !S.invOpen) S.zoom = clamp(S.zoom * (e.deltaY > 0 ? 1.1 : 0.9), 0.55, 1.7); }, { passive: true });
addEventListener('contextmenu', e => e.preventDefault());
if (IS_TOUCH) {
  const joy = $('joy'), knob = joy.firstElementChild; let jid = null, jx0 = 0, jy0 = 0;
  const jz = $('joyz');
  jz.addEventListener('touchstart', e => { e.preventDefault(); initAudio(); const t = e.changedTouches[0]; jid = t.identifier; jx0 = t.clientX; jy0 = t.clientY; joy.style.left = (jx0 - 58) + 'px'; joy.style.top = (jy0 - 58) + 'px'; joy.style.bottom = 'auto'; }, { passive: false });
  jz.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === jid) { let dx = t.clientX - jx0, dy = t.clientY - jy0; const l = Math.hypot(dx, dy), m = 52; if (l > m) { dx *= m / l; dy *= m / l; } touch.jx = dx / m; touch.jy = -dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; } }, { passive: false });
  const je = e => { for (const t of e.changedTouches) if (t.identifier === jid) { jid = null; touch.jx = touch.jy = 0; knob.style.transform = ''; } };
  jz.addEventListener('touchend', je); jz.addEventListener('touchcancel', je);
  $('tAtk').addEventListener('touchstart', e => { e.preventDefault(); initAudio(); touch.atk = true; }, { passive: false });
  $('tAtk').addEventListener('touchend', () => touch.atk = false);
  const tap = (id, fn) => $(id).addEventListener('touchstart', e => { e.preventDefault(); fn(); }, { passive: false });
  tap('tRun', () => { touch.run = !touch.run; $('tRun').classList.toggle('on', touch.run); });
  tap('tRel', () => startReload());
  tap('tRot', () => { S.camYawT = (S.camYawT ?? S.camYaw) + Math.PI / 2; });
  tap('tUse', () => interact());
  tap('tView', () => setView(S.view === 'fp' ? 'top' : 'fp'));
  tap('tJump', () => { touch.jump = true; setTimeout(() => touch.jump = false, 250); });
  tap('tMap', () => openMap());
  const looks = new Map(), lz = $('lookz');
  lz.addEventListener('touchstart', e => { e.preventDefault(); for (const t of e.changedTouches) looks.set(t.identifier, [t.clientX, t.clientY, t.clientX, t.clientY, performance.now()]); }, { passive: false });
  lz.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) { const q = looks.get(t.identifier); if (!q) continue; if (S.view === 'fp') lookDelta(t.clientX - q[0], t.clientY - q[1], 0.006); else S.camYaw -= (t.clientX - q[0]) * 0.006, S.camYawT = S.camYaw; q[0] = t.clientX; q[1] = t.clientY; } }, { passive: false });
  const le = e => { for (const t of e.changedTouches) { const q = looks.get(t.identifier); if (q && e.type === 'touchend' && performance.now() - q[4] < 260 && Math.hypot(t.clientX - q[2], t.clientY - q[3]) < 14 && !$('prompt').classList.contains('hidden')) interact(); looks.delete(t.identifier); } }; lz.addEventListener('touchend', le); lz.addEventListener('touchcancel', le);
}
// ---------- mapa grande ----------
S.mv = { cx: 0, cz: 0, span: 360 };
function openMap() { if (S.phase !== 'game') return; if (document.pointerLockElement) document.exitPointerLock(); S.mapOpen = true; const p = S.p; S.mv.cx = p.pos.x; S.mv.cz = p.pos.z; S.mv.span = S.mv.span || 360; $('mapov').classList.remove('hidden'); mouseL = false; touch.atk = false; updateLock(); sfx('open', 0.4); }
function closeMap() { S.mapOpen = false; $('mapov').classList.add('hidden'); updateLock(); }
function toggleMap() { if (S.mapOpen) closeMap(); else openMap(); }
function cycleMap() { toggleMap(); }
$('mm').addEventListener('click', openMap);
$('mapx').addEventListener('click', closeMap);
$('mapov').addEventListener('click', e => { if (e.target.id === 'mapov') closeMap(); });
{ const bm = $('bigmap'), zoomBy = f => { S.mv.span = clamp(S.mv.span * f, 70, WORLD * 1.05); };
  $('mzIn').onclick = () => zoomBy(0.7); $('mzOut').onclick = () => zoomBy(1.4); $('mzMe').onclick = () => { S.mv.cx = S.p.pos.x; S.mv.cz = S.p.pos.z; S.mv.span = Math.min(S.mv.span, 360); };
  $('mzAll').onclick = () => { S.mv.cx = 0; S.mv.cz = 0; S.mv.span = WORLD * 0.95; };
  bm.addEventListener('wheel', e => { e.preventDefault(); zoomBy(e.deltaY > 0 ? 1.15 : 0.87); }, { passive: false });
  const ptr = new Map(); let pinch0 = 0, span0 = 0;
  bm.addEventListener('pointerdown', e => { bm.setPointerCapture(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]); if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); span0 = S.mv.span; } });
  bm.addEventListener('pointermove', e => { const o = ptr.get(e.pointerId); if (!o) return; if (ptr.size === 1) { const k = S.mv.span / bm.clientWidth; S.mv.cx -= (e.clientX - o[0]) * k; S.mv.cz -= (e.clientY - o[1]) * k; S.mv.cx = clamp(S.mv.cx, -HALF, HALF); S.mv.cz = clamp(S.mv.cz, -HALF, HALF); }
    ptr.set(e.pointerId, [e.clientX, e.clientY]); if (ptr.size === 2 && pinch0) { const [a, b] = [...ptr.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); S.mv.span = clamp(span0 * pinch0 / Math.max(20, d), 70, WORLD * 1.05); } });
  const up = e => { ptr.delete(e.pointerId); if (ptr.size < 2) pinch0 = 0; }; bm.addEventListener('pointerup', up); bm.addEventListener('pointercancel', up); }

// ---------- guía de misión ----------
const ITEM_SHOP = { beans: ['super', 'mercat'], water: ['super', 'bar'], medkit: ['farmacia', 'cap'], bandage: ['farmacia', 'cap'], alcohol: ['farmacia', 'bar'], scrap: ['taller', 'ferreteria'], tape: ['ferreteria', 'taller'], rope: ['ferreteria'], plank: ['ferreteria'], nails: ['ferreteria'], seeds: ['ferreteria', 'mercat'], booster: ['friki', 'quiosc'], gas: ['gasolinera', 'taller'], ammo: ['policia'] };
function questTarget() {
  if (!S.npcs || typeof questDone === 'undefined') return null;
  if (S._qt && S.time - S._qtT < 0.4) return S._qt;
  S._qtT = S.time; S._qt = null;
  const n = S.npcs.find(n => n.def.id === S.track && n.quest === 1 && n.alive) || S.npcs.find(n => n.quest === 1 && n.alive);
  if (!n) { const xv = S.npcs.find(n => n.def.id === 'xavi' && n.quest === 0 && n.alive); if (xv) return S._qt = { x: xv.pos.x, z: xv.pos.z, ic: '💬', title: 'Xavi', label: 'Habla con Xavi en La Orden del Friki' };
    if (S.campKnown && S.camp && !S.campVisited) { if (Math.hypot(S.p.pos.x - S.camp.x, S.p.pos.z - S.camp.z) < 25) S.campVisited = true; else S._qt = { x: S.camp.x, z: S.camp.z, ic: '🚩', title: 'Campamento', label: 'Ve al campamento de Xavi' }; } return S._qt; }
  const q = n.def.quest, p = S.p, base = { n, title: n.def.name, prog: questProgress(n) };
  if (questDone(n)) return S._qt = { ...base, x: n.pos.x, z: n.pos.z, ic: '📜', label: 'Vuelve con ' + n.def.name + ' y entrega la misión' };
  if (q.type === 'fetch') { const g = S.ground.find(g => g.it.id === 'qitem' && g.it.who === n.def.id); if (g) return S._qt = { ...base, x: g.pos.x, z: g.pos.z, ic: '⭐', label: 'Recupera el objeto marcado' }; return S._qt = { ...base, x: n.pos.x, z: n.pos.z, ic: '📜', label: 'Llévaselo a ' + n.def.name }; }
  if (q.type === 'bring') { const miss = Object.keys(q.items).find(k => countItem(p, k) < q.items[k]); const kinds = (miss && ITEM_SHOP[miss]) || [];
    let best = null, bd = 1e9; if (typeof CITY !== 'undefined') for (const r of CITY.rooms) { if (!r.name || !kinds.includes(r.kind)) continue; const x = (r.x0 + r.x1) / 2, z = (r.z0 + r.z1) / 2, d = Math.hypot(x - p.pos.x, z - p.pos.z); if (d < bd) { bd = d; best = { x, z, name: r.name }; } }
    if (best) return S._qt = { ...base, x: best.x, z: best.z, ic: '🎯', label: `Busca ${ITEMS[miss].n.toLowerCase()} en ${best.name}` };
    return S._qt = { ...base, x: null, label: 'Busca ' + (miss ? ITEMS[miss].n.toLowerCase() : 'lo que pide') + ' en casas y tiendas' }; }
  return S._qt = { ...base, x: null, label: 'Mata zombis' };
}
function updateQuestHud() {
  const t = questTarget(), el = $('qtrack');
  if (!t) { if (!el.classList.contains('hidden')) el.classList.add('hidden'); return; }
  const d = t.x != null ? Math.round(Math.hypot(t.x - S.p.pos.x, t.z - S.p.pos.z)) : null;
  const h = `<b>📜 ${t.title}</b><br>${t.label}${d != null ? ` · <b>${d} m</b>` : ''}${t.prog ? `<div class="d">${t.prog}</div>` : ''}`;
  if (el._h !== h) { el.innerHTML = h; el._h = h; } el.classList.remove('hidden');
  if (S.mapOpen) { const mq = $('mapq'); const tx = '📜 ' + t.title + ': ' + t.label + (t.prog ? ' — ' + t.prog : ''); if (mq.textContent !== tx) mq.textContent = tx; }
}
function drawGuide(ctx, W, X, Z, big) {
  const t = questTarget(); if (!t || t.x == null) return;
  const p = S.p, px = X(p.pos.x), pz = Z(p.pos.z); let tx = X(t.x), tz = Z(t.z); const pul = 0.5 + 0.5 * Math.sin(S.time * 5), m = big ? 18 : 12;
  const inside = tx > m && tx < W - m && tz > m && tz < W - m;
  ctx.save(); ctx.setLineDash([6, 5]); ctx.lineDashOffset = -S.time * 20; ctx.strokeStyle = 'rgba(255,210,63,.85)'; ctx.lineWidth = big ? 3 : 2.2;
  let ex = tx, ez = tz; if (!inside) { const dx = tx - px, dz = tz - pz, sc = Math.min(Math.abs((dx > 0 ? W - m - px : m - px) / (dx || 1e-6)), Math.abs((dz > 0 ? W - m - pz : m - pz) / (dz || 1e-6))); ex = px + dx * sc; ez = pz + dz * sc; }
  ctx.beginPath(); ctx.moveTo(px, pz); ctx.lineTo(ex, ez); ctx.stroke(); ctx.setLineDash([]);
  if (inside) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tx, tz, (big ? 10 : 7) + pul * 5, 0, 7); ctx.stroke(); ctx.font = (big ? 20 : 14) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(t.ic, tx, tz + (big ? 7 : 5)); }
  else { const a = Math.atan2(tz - pz, tx - px); ctx.translate(ex, ez); ctx.rotate(a); const s = big ? 14 : 10; ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s * 0.7, s * 0.7); ctx.lineTo(-s * 0.3, 0); ctx.lineTo(-s * 0.7, -s * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
const _ray = new THREE.Raycaster();
function mouseGround(y) { _ray.setFromCamera(mouseNDC, camera); const o = _ray.ray.origin, d = _ray.ray.direction; if (Math.abs(d.y) < 1e-4) return null; const t = (y - o.y) / d.y; return t > 0 ? o.clone().addScaledVector(d, t) : null; }

// ---------- jugador ----------
function updatePlayer(dt) {
  const p = S.p; if (!p.alive) return;
  if (p.atkCd > 0) p.atkCd -= dt; if (p.swing > 0) p.swing -= dt; if (p.hurtT > 0) p.hurtT -= dt;
  if (p.hitPending > 0) { p.hitPending -= dt; if (p.hitPending <= 0) resolveMelee(); }
  if (p.reloadT > 0) { p.reloadT -= dt; if (p.reloadT <= 0) finishReload(); }
  if (S.drive) { updateCar(dt); return; }
  // entrada
  let ix = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + touch.jx, iy = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) + touch.jy;
  const l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; }
  if (S.invOpen && S.open && l > 0.2) closeInv();
  const cy = S.view === 'fp' ? S.yaw : S.camYaw, mx = -Math.sin(cy) * iy + Math.cos(cy) * ix, mz = -Math.cos(cy) * iy - Math.sin(cy) * ix;
  const wantRun = (keys.ShiftLeft || keys.ShiftRight || touch.run) && l > 0.1;
  const heavy = invWeight(p) > MAX_W * 0.8;
  p.sprint = wantRun && p.sta > 2 && !heavy;
  let spd = p.sprint ? 5.6 : 3.3; if (heavy) spd *= 0.75; if (p.hp < 25) spd *= 0.8;
  p.vel.x = lerp(p.vel.x, mx * spd, Math.min(1, dt * 10)); p.vel.z = lerp(p.vel.z, mz * spd, Math.min(1, dt * 10));
  p.pos.x += p.vel.x * dt; p.pos.z += p.vel.z * dt;
  p.pos.x = clamp(p.pos.x, -HALF + 4, HALF - 4); p.pos.z = clamp(p.pos.z, -HALF + 4, HALF - 4);
  // salto
  if ((keys.Space || touch.jump) && !(p.jy > 0) && !p.swim && !S.mapOpen && p.sta > 5) { p.vy = 4.7; p.jy = 0.001; p.sta -= 5; touch.jump = false; sfx('swish', 0.25); }
  if (p.jy > 0) { p.vy -= 13 * dt; p.jy = Math.max(0, p.jy + p.vy * dt); if (p.jy === 0) { p.vy = 0; emitNoise(p.pos, 5); sfx('thud', 0.25); } }
  p.pos.y = getH(p.pos.x, p.pos.z) + (p.jy || 0);
  collide(p.pos, 0.36, p.c.h);
  const g = getH(p.pos.x, p.pos.z); p.swim = g < -0.95 && !(p.jy > 0.3); p.pos.y = p.swim ? -1.1 : g + (p.jy || 0);
  if (p.swim) { p.vel.multiplyScalar(0.92); }
  // orientación: ratón (PC) o movimiento / objetivo cercano (móvil)
  if (S.view === 'fp') { p.yaw = S.yaw; }
  else if (!IS_TOUCH && mouseSeen) { const gp = mouseGround(p.pos.y + 1); if (gp) { p.yaw = Math.atan2(-(gp.x - p.pos.x), -(gp.z - p.pos.z)); } }
  else {
    let tz = null, td = 4; for (const z of S.zombies) { if (!z.alive) continue; const d = z.pos.distanceTo(p.pos); if (d < td) { td = d; tz = z; } }
    if (tz && (touch.atk || td < 2.5)) p.yaw = Math.atan2(-(tz.pos.x - p.pos.x), -(tz.pos.z - p.pos.z));
    else if (l > 0.1) p.yaw = Math.atan2(-mx, -mz);
  }
  if (S.placing) { if (mouseL && !IS_TOUCH && (S.view !== 'fp' || locked || S.noLock)) { mouseL = false; confirmPlace(); } }
  else if (S.drive) { }
  else if (S.mapOpen) { }
  else if ((mouseL && !S.invOpen && !S.buildOpen && !S.talkOpen && (S.view !== 'fp' || locked || S.noLock || IS_TOUCH)) || touch.atk) attack();
  // resistencia y ruido al correr
  if (p.sprint) { p.sta = Math.max(0, p.sta - 5.5 * dt); p.stepT -= dt; if (p.stepT <= 0) { p.stepT = 0.5; emitNoise(p.pos, 8); } }
  else p.sta = Math.min(100, p.sta + (l > 0.1 ? 9 : 15) * dt);
  // necesidades (hambre/sed bajan con el tiempo)
  const k = dt * 24 / DAY; // horas de juego transcurridas
  p.food = Math.max(0, p.food - k * 3.4 * (p.sprint ? 1.6 : 1));
  p.water = Math.max(0, p.water - k * 5.2 * (p.sprint ? 1.8 : 1));
  if (p.food <= 0) { p.hp -= dt * 0.35; p.cause = 'murió de hambre'; }
  if (p.water <= 0) { p.hp -= dt * 0.55; p.cause = 'murió de sed'; }
  if (p.bleed) { p.hp -= dt * 0.5; p.cause = 'se desangró'; }
  if (p.food > 55 && p.water > 55 && !p.bleed && p.hp < 100) p.hp = Math.min(100, p.hp + dt * 0.12);
  if (p.hp <= 0) die(p.cause);
}
function animPlayer(p, dt) {
  const P = p.c.P, m = p.model; m.position.copy(p.pos); m.visible = (S.view !== 'fp' || !p.alive) && !S.drive;
  if (!p.alive) { p.deadT = (p.deadT || 0) + dt; m.rotation.x = -Math.min(1, p.deadT * 3) * Math.PI / 2; return; }
  p.bodyYaw += angDiff(p.bodyYaw, p.yaw) * Math.min(1, dt * 14); m.rotation.set(0, p.bodyYaw, 0);
  updateHeld(p);
  const sp = Math.hypot(p.vel.x, p.vel.z); p.walk += sp * dt * 2.4;
  const sw = Math.sin(p.walk) * Math.min(1, sp / 3) * (p.sprint ? 0.9 : 0.6);
  // piernas: dirección de la marcha respecto a la mirada
  P.lL.rotation.x = sw; P.lR.rotation.x = -sw;
  const mv = Math.min(1, sp / 3);
  if (P.kL) { P.kL.rotation.x = -(0.05 + Math.max(0, Math.cos(p.walk)) * (p.sprint ? 1.2 : 0.75) * mv); P.kR.rotation.x = -(0.05 + Math.max(0, -Math.cos(p.walk)) * (p.sprint ? 1.2 : 0.75) * mv); P.eL.rotation.x = 0.15 + (p.sprint ? 0.9 : 0.25) * mv; P.eR.rotation.x = 0.15 + (p.sprint ? 0.9 : 0.25) * mv; }
  P.rig.position.y = -Math.abs(Math.cos(p.walk)) * 0.025 * mv;
  P.body.rotation.set(p.sprint ? -0.18 : -0.03, 0, 0);
  const E = eqDef(p);
  P.aL.rotation.set(-sw, 0, -0.06); P.aR.rotation.set(sw, 0, 0.06);
  if (P.eR && (E.kind === 'gun' || p.eq)) { P.eR.rotation.x = 0.5; P.eL.rotation.x = 0.5; }
  if (E.kind === 'gun') { P.aR.rotation.set(Math.PI / 2 + (p.swing > 0 ? 0.25 : 0), 0, 0); P.aL.rotation.set(Math.PI / 2, -0.6, 0.35); }
  else if (p.swing > 0) { const t = 1 - p.swing / 0.32; P.aR.rotation.set(2.6 - t * 3.0, 0, 0.3 - t * 0.4); P.body.rotation.y = 0.5 - t * 1.0; if (!p.eq) P.aL.rotation.set(1.4, 0, 0); }
  else if (p.eq) P.aR.rotation.set(0.5, 0, 0.1);
  if (p.hurtT > 0) P.body.position.x = (Math.random() - 0.5) * 0.06; else P.body.position.x = 0;
}
function die(cause) {
  const p = S.p; if (!p.alive) return; if (S.drive) exitCarForce(); p.alive = false; p.cause = cause; p.hp = 0; closeInv(); if (document.pointerLockElement) document.exitPointerLock(); updateLock();
  deleteSave();
  const h = hourNow(), days = dayNum();
  setTimeout(() => {
    $('end').classList.remove('hidden');
    $('endp').innerHTML = `<b style="color:#9be36a">${p.name}</b> ${cause || 'ha muerto'}.<br>Sobreviviste hasta el día ${days} a las ${fmtHour(h)} · ${S.kills} zombi${S.kills === 1 ? '' : 's'} eliminado${S.kills === 1 ? '' : 's'}`;
  }, 1600);
}
function fmtHour(h) { const hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); }

// ---------- cámara ----------
function updateCamera(dt) {
  const p = S.p;
  let inside = null; if (typeof CITY !== 'undefined') for (const r of CITY.rooms) if (p.pos.x > r.x0 && p.pos.x < r.x1 && p.pos.z > r.z0 && p.pos.z < r.z1) { inside = r; break; }
  if (!inside) for (const h of HOUSES) if (p.pos.x > h.x0 - 0.2 && p.pos.x < h.x1 + 0.2 && p.pos.z > h.z0 - 0.2 && p.pos.z < h.z1 + 0.2) { inside = h; break; }
  const hideRoof = S.view === 'top' ? inside : null;
  if (!!hideRoof !== !!S.clipOn) { S.clipOn = !!hideRoof; renderer.clippingPlanes = hideRoof ? [new THREE.Plane(new THREE.Vector3(0, -1, 0), (CITY.Y || hideRoof.y || 0) + 3.45)] : []; }
  if (hideRoof !== S.roofHidden) { if (S.roofHidden) for (const r of S.roofHidden.roof) { r.visible = true; r.userData.hidden = false; } if (hideRoof) for (const r of hideRoof.roof) { r.visible = false; r.userData.hidden = true; } S.roofHidden = hideRoof; }
  S.houseIn = inside;
  if (S.view === 'fp' && !S.drive) {
    const sp = Math.hypot(p.vel.x, p.vel.z), bob = p.alive ? Math.sin(p.walk * 2) * 0.035 * Math.min(1, sp / 3) : 0;
    const eye = p.alive ? p.c.eye * 1.05 : 0.35;
    camera.position.set(p.pos.x, p.pos.y + eye + bob, p.pos.z);
    camera.rotation.set(S.pitch, S.yaw, p.alive ? Math.sin(p.walk) * 0.006 * Math.min(1, sp / 3) : 0.5, 'YXZ');
    const fov = p.sprint ? 82 : 76; if (Math.abs(camera.fov - fov) > 0.1) { camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 8)); camera.updateProjectionMatrix(); }
    VM.visible = p.alive; updateVM(dt);
    return;
  }
  VM.visible = false;
  if (S.camYawT !== undefined) S.camYaw += (S.camYawT - S.camYaw) * Math.min(1, dt * 8);
  if (S.drive) { const c = S.drive, fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw), back = 6.5 + Math.abs(c.speed) * 0.12; _v.set(c.pos.x - fx * back, c.pos.y + 2.8, c.pos.z - fz * back); camera.position.lerp(_v, Math.min(1, dt * 5)); camera.rotation.order = 'XYZ'; camera.lookAt(c.pos.x + fx * 4, c.pos.y + 1.1, c.pos.z + fz * 4); if (S.shake > 0) { S.shake -= dt; camera.position.x += (Math.random() - 0.5) * S.shake; } const fov = 70 + Math.abs(c.speed) * 0.6; if (Math.abs(camera.fov - fov) > 0.1) { camera.fov = lerp(camera.fov, fov, dt * 3); camera.updateProjectionMatrix(); } return; }
  const city = typeof CITY !== 'undefined', D = (city ? 5 : 13) * S.zoom, H = (city ? 26 : 15) * S.zoom;
  camera.position.set(p.pos.x + Math.sin(S.camYaw) * D, p.pos.y + H, p.pos.z + Math.cos(S.camYaw) * D);
  camera.rotation.order = 'XYZ'; camera.lookAt(p.pos.x, p.pos.y + 0.8, p.pos.z);
  if (camera.fov !== 40) { camera.fov = 40; camera.updateProjectionMatrix(); }
}
// ---------- brazos en primera persona ----------
scene.add(camera);
const VM = new THREE.Group(); camera.add(VM); VM.visible = false;
const vmMats = [];
function vmMat(c) { const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0, depthTest: false, depthWrite: false }); vmMats.push(m); return m; }
const VMR = new THREE.Group(), VML = new THREE.Group(); VM.add(VMR); VM.add(VML);
let vmKey = '', vmWeapon = null, vmSkin = null, vmSleeve = null;
function vmBuildArms(look) {
  for (const g of [VMR, VML]) while (g.children.length) g.remove(g.children[0]);
  const mk = () => { const m = new THREE.MeshStandardMaterial({ vertexColors: true, map: HUMAN.cleanTex, bumpMap: HUMAN.cleanTex, bumpScale: 0.003, roughness: 0.62, metalness: 0, depthTest: false, depthWrite: false }); vmMats.push(m); return m; };
  for (const [g, s] of [[VMR, 1], [VML, -1]]) HUMAN.fpArm(g, -s, CR.skin, CR.top, mk);
  for (const m of [...VMR.children, ...VML.children]) m.renderOrder = 20;
  vmKey = '';
}
function vmMuzzle() { if (vmWeapon && vmWeapon.userData.muzzle) { camera.updateMatrixWorld(true); return vmWeapon.userData.muzzle.getWorldPosition(new V3()); } return camera.position.clone().add(new V3(0, -0.2, 0)); }
function updateVM(dt) {
  const p = S.p, it = p.eq, key = it ? it.id : '';
  if (key !== vmKey) {
    vmKey = key; if (vmWeapon) { if (vmWeapon.parent) vmWeapon.parent.remove(vmWeapon); vmWeapon = null; }
    if (it) {
      const d = ITEMS[it.id]; vmWeapon = d.gun ? weaponModel(it.id, 0) : meleeModel(d.melee || it.id);
      vmWeapon.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.depthTest = false; o.material.depthWrite = false; o.renderOrder = 21; o.castShadow = false; } });
      if (d.gun) { vmWeapon.position.set(0, 0.03, -0.06); vmWeapon.scale.setScalar(d.gun === 'pistol' ? 1.25 : 1.0); } else { vmWeapon.position.set(0, 0, -0.06); vmWeapon.rotation.x = 1.15; vmWeapon.scale.setScalar(0.85); }
      VMR.add(vmWeapon);
    }
  }
  const sp = Math.hypot(p.vel.x, p.vel.z), wb = Math.min(1, sp / 3), t = S.time;
  const bx = Math.cos(p.walk) * 0.018 * wb, by = Math.abs(Math.sin(p.walk)) * 0.02 * wb + Math.sin(t * 1.6) * 0.004;
  const E = eqDef(p);
  VMR.rotation.set(0, 0, 0); VML.rotation.set(0, 0, 0);
  if (E.kind === 'gun') {
    const kick = p.swing > 0 ? p.swing / 0.12 : 0, rl = p.reloadT > 0 ? Math.sin(Math.min(1, (1 - p.reloadT / GUNS[ITEMS[it.id].gun].reload)) * Math.PI) : 0;
    VMR.position.set(0.17 + bx, -0.2 - by - rl * 0.15, -0.36 + kick * 0.06); VMR.rotation.x = kick * 0.18 - rl * 0.6;
    if (ITEMS[it.id].gun === 'pistol') { VML.position.set(0.125 + bx, -0.232 - by - rl * 0.2, -0.345 + kick * 0.05); VML.rotation.set(0.25 + kick * 0.18, -0.15, 1.25); } else { VML.position.set(0.06 + bx, -0.21 - by - rl * 0.2, -0.62 + kick * 0.04); VML.rotation.set(0.2, 0.2, 1.4); }
    VML.visible = true;
  } else if (it) {
    VML.visible = false;
    if (p.swing > 0) { const k = 1 - p.swing / 0.32, e = Math.sin(k * Math.PI); VMR.position.set(0.3 - k * 0.42, -0.22 + e * 0.06, -0.42 - e * 0.12); VMR.rotation.set(-0.2 + e * 0.5, 0.6 - k * 1.3, -0.9 + k * 1.6); }
    else { VMR.position.set(0.28 + bx, -0.27 - by, -0.42); VMR.rotation.set(0.15, 0.3, -0.25); }
  } else {
    VML.visible = true;
    const k = p.swing > 0 ? Math.sin((1 - p.swing / 0.32) * Math.PI) : 0, right = (S.punch || 0) % 2 === 0;
    VMR.position.set(0.2 + bx - (right ? k * 0.06 : 0), -0.25 - by + (right ? k * 0.05 : 0), -0.4 - (right ? k * 0.3 : 0)); VMR.rotation.set(0.25 + (right ? k * 0.2 : 0), 0.25, -0.75 + (right ? k * 0.5 : 0));
    VML.position.set(-0.2 + bx + (!right ? k * 0.06 : 0), -0.25 - by + (!right ? k * 0.05 : 0), -0.4 - (!right ? k * 0.3 : 0)); VML.rotation.set(0.25 + (!right ? k * 0.2 : 0), -0.25, 0.75 - (!right ? k * 0.5 : 0));
  }
}
// ---------- HUD ----------
let msgT = 0;
function msg(t, dur = 2) { const el = $('msg'); el.textContent = t; el.style.opacity = t ? 1 : 0; msgT = dur; }
const hc = {};
function setT(id, t) { if (hc[id] !== t) { hc[id] = t; $(id).innerHTML = t; } }
function updateHUD(dt) {
  const p = S.p;
  $('bHp').style.width = Math.max(0, p.hp) + '%'; $('bFood').style.width = p.food + '%'; $('bWater').style.width = p.water + '%'; $('bSta').style.width = p.sta + '%';
  const h = hourNow(), dl = dayLight();
  setT('clock', `${dl > 0.3 ? '☀️' : '🌙'} Día ${dayNum()} · ${fmtHour(h)}`);
  const st = [];
  if (p.bleed) st.push('🩸 Sangrando'); if (p.food < 25) st.push(p.food <= 0 ? '🍗 Muriendo de hambre' : '🍗 Hambriento'); if (p.water < 25) st.push(p.water <= 0 ? '💧 Muriendo de sed' : '💧 Sediento');
  if (p.sta < 15) st.push('⚡ Agotado'); if (invWeight(p) > MAX_W * 0.8) st.push('🎒 Sobrecargado'); if (p.hp < 30) st.push('❤️ Malherido');
  setT('status', st.map(s => `<div>${s}</div>`).join(''));
  const chasing = S.zombies.filter(z => z.alive && z.state === 'chase').length;
  setT('zn', `🧟 ${S.zombies.filter(z => z.alive).length}${chasing ? ` · <span style="color:#ff6a5a">${chasing} te persigue${chasing > 1 ? 'n' : ''}</span>` : ''} · 💀 ${S.kills}`);
  const E = eqDef(p);
  let eq = `<div class="ic">${p.eq ? ITEMS[p.eq.id].ic : '👊'}</div>${E.n}`;
  if (p.eq && p.eq.dur !== undefined) eq += `<div class="dur"><i style="width:${Math.min(100, p.eq.dur / MELEE[ITEMS[p.eq.id].melee].dur * 100)}%"></i></div>`;
  if (p.eq && p.eq.mag !== undefined) { const g = GUNS[ITEMS[p.eq.id].gun], am = p.inv.find(o => o.id === g.ammo); eq += `<div>${p.eq.mag}/${g.mag} · reserva ${am ? am.n : 0}</div>`; }
  if (p.eq && ITEMS[p.eq.id].thrown) eq += `<div>×${p.eq.n} · clic para lanzar</div>`;
  if (S.drive) { const c = S.drive; eq = `<div class="ic">🚗</div>${Math.round(Math.abs(c.speed) * 3.6)} km/h<div>⛽ ${Math.round(c.fuel)}% · 🔧 ${Math.max(0, Math.round(c.hp))}%</div>`; }
  setT('eqslot', eq);
  if (IS_TOUCH) setT('tAtk', p.eq ? ITEMS[p.eq.id].ic : '👊');
  // aviso de interacción
  const n = findNear(), key = IS_TOUCH ? '' : '<kbd>E</kbd>'; let pt = '';
  if (n && !S.open) { if (n.k === 'drive') pt = `${key}Bajar del coche`; else if (n.k === 'car') pt = n.c.hp <= 0 ? `🚗 Coche destrozado` : `${key}Subir al coche (⛽ ${Math.round(n.c.fuel)}%)`; else if (n.k === 'piece') pt = BUILD[n.pc.type].door ? (n.pc.locked && !n.pc.open ? `${key}🔒 Cerrada con llave (golpéala)` : `${key}${n.pc.open ? 'Cerrar' : 'Abrir'} puerta`) : `${key}Dormir`; else if (n.k === 'npc') pt = `${key}Hablar con ${n.n.def.name}`; else if (n.k === 'g') pt = `${key}Recoger ${ITEMS[n.g.it.id].ic} ${n.g.it.name || ITEMS[n.g.it.id].n}${n.g.it.n > 1 ? ' ×' + n.g.it.n : ''}`; else if (n.k === 'piece') pt = BUILD[n.pc.type].door ? (n.pc.locked && !n.pc.open ? `${key}🔒 Cerrada con llave (golpéala)` : `${key}${n.pc.open ? 'Cerrar' : 'Abrir'} puerta`) : `${key}Dormir`; else if (n.c.kind === 'fountain') pt = `${key}Beber de la fuente`; else if (n.c.kind === 'sink') pt = `${key}Beber del grifo`; else pt = `${key}${n.c.searched ? 'Abrir' : 'Buscar en'} ${n.c.name.toLowerCase()}${n.c.searched && !n.c.items.length ? ' (vacío)' : ''}`; }
  $('prompt').classList.toggle('hidden', !pt); if (pt) setT('prompt', pt);
  if (IS_TOUCH) $('tUse').classList.toggle('hidden', !pt || S.invOpen);
  if (S.dirty && S.invOpen) renderInv();
  if (S.open && S.p.pos.distanceTo(S.open.pos) > (S.open.r || 1.5) + 1.2) closeInv();
  if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('msg').style.opacity = 0; }
  $('aim').classList.toggle('hidden', IS_TOUCH || !mouseSeen || S.invOpen || S.view === 'fp');
  $('cross').classList.toggle('hidden', S.view !== 'fp' || S.invOpen || !p.alive);
  $('quit').classList.toggle('hidden', S.invOpen || S.buildOpen || S.talkOpen);
  if (IS_TOUCH) { $('tRot').classList.toggle('hidden', S.view === 'fp'); }
  // viñeta: oscura de noche, roja con poca vida
  const red = p.hp < 35 ? (35 - p.hp) / 35 : 0;
  $('vign').style.boxShadow = `inset 0 0 ${lerp(160, 260, 1 - dl)}px ${lerp(20, 90, 1 - dl)}px rgba(${Math.round(red * 160)},0,${Math.round((1 - dl) * 20)},${0.35 + (1 - dl) * 0.4 + red * 0.3})`;
  drawMap($('mm').getContext('2d'), $('mm').width, p.pos.x, p.pos.z, 120, false);
  if (S.mapOpen) drawMap($('bigmap').getContext('2d'), $('bigmap').width, S.mv.cx, S.mv.cz, S.mv.span, true);
  updateQuestHud();
}
const SHOP_IC = { friki: '🃏', super: '🛒', mercat: '🛒', farmacia: '💊', cap: '🏥', ferreteria: '🔧', taller: '🔩', bar: '🍺', forn: '🥖', quiosc: '📰', policia: '🚓', ajuntament: '🏛️', gasolinera: '⛽' };
function drawMap(ctx, W, cx, cz, span, big) {
  const k = W / span, X = x => (x - cx) * k + W / 2, Z = z => (z - cz) * k + W / 2;
  ctx.fillStyle = '#1f6f9a'; ctx.fillRect(0, 0, W, W); ctx.drawImage(MINIMAP_IMG, X(-HALF), Z(-HALF), WORLD * k, WORLD * k);
  ctx.fillStyle = 'rgba(0,10,30,' + (0.5 * (1 - dayLight())) + ')'; ctx.fillRect(0, 0, W, W);
  ctx.fillStyle = 'rgba(80,60,40,.9)'; for (const h of HOUSES) ctx.fillRect(X(h.x0), Z(h.z0), Math.max(2, (h.x1 - h.x0) * k), Math.max(2, (h.z1 - h.z0) * k));
  if (big && typeof CITY !== 'undefined') { ctx.textAlign = 'center'; for (const l of CITY.labels) { if (span > 600 && !l.town && l.name !== 'Riera Seca') continue; ctx.save(); ctx.translate(X(l.x), Z(l.z)); if (l.vertical) ctx.rotate(-Math.PI / 2); ctx.font = l.place ? 'bold 12px Nunito, sans-serif' : '10px Nunito, sans-serif'; ctx.fillStyle = l.place ? '#ffe08a' : '#ffffff'; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 3; ctx.strokeText(l.name, 0, 4); ctx.fillText(l.name, 0, 4); ctx.restore(); } for (const r of CITY.rooms) if (r.kind !== 'piso') { ctx.font = 'bold 9px Nunito'; ctx.fillStyle = '#ffb43a'; ctx.strokeText(r.name, X((r.x0 + r.x1) / 2), Z((r.z0 + r.z1) / 2)); ctx.fillText(r.name, X((r.x0 + r.x1) / 2), Z((r.z0 + r.z1) / 2)); } }
  else if (big) { ctx.font = 'bold 13px Nunito, sans-serif'; ctx.textAlign = 'center'; for (const p of POIS) { ctx.fillStyle = 'rgba(0,0,0,.55)'; const tw = ctx.measureText(p.name).width + 8; ctx.fillRect(X(p.x) - tw / 2, Z(p.z) - 10, tw, 18); ctx.fillStyle = '#fff'; ctx.fillText(p.name, X(p.x), Z(p.z) + 4); } }
  if (S.npcs) for (const n of S.npcs) { if (!n.alive) continue; const x2 = X(n.pos.x), z2 = Z(n.pos.z); if (x2 < -6 || x2 > W + 6 || z2 < -6 || z2 > W + 6) continue; ctx.fillStyle = n.state === 'home' ? (n.quest === 1 ? '#ffd23f' : '#f0f0f0') : '#9be36a'; ctx.beginPath(); ctx.arc(x2, z2, big ? 5 : 3.5, 0, 7); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke(); if (big) { ctx.font = 'bold 11px Nunito'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(n.def.name, x2, z2 - 8); } }
  for (const g of S.ground) if (g.it.id === 'qitem') { ctx.font = (big ? 18 : 13) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⭐', X(g.pos.x), Z(g.pos.z) + 5); }
  if (S.camp && S.campKnown) { ctx.font = (big ? 18 : 13) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🚩', X(S.camp.x), Z(S.camp.z) + 5); }
  ctx.fillStyle = '#4ab0ff'; for (const c of S.cars) if (c.hp > 0) { const cx2 = X(c.pos.x), cz2 = Z(c.pos.z); if (cx2 > -5 && cx2 < W + 5 && cz2 > -5 && cz2 < W + 5) ctx.fillRect(cx2 - 2.5, cz2 - 2.5, 5, 5); }
  for (const z of S.zombies) if (z.alive && z.state === 'chase') { ctx.fillStyle = '#ff4a3a'; ctx.beginPath(); ctx.arc(X(z.pos.x), Z(z.pos.z), 3, 0, 7); ctx.fill(); }
  if (big && typeof CITY !== 'undefined' && span < 700) { ctx.textAlign = 'center'; for (const r of CITY.rooms) { if (!r.name || !SHOP_IC[r.kind]) continue; const x2 = X((r.x0 + r.x1) / 2), z2 = Z((r.z0 + r.z1) / 2); if (x2 < -20 || x2 > W + 20 || z2 < -20 || z2 > W + 20) continue; ctx.font = '13px sans-serif'; ctx.fillText(SHOP_IC[r.kind] || '🏪', x2, z2 + 4); if (span < 420) { ctx.font = 'bold 10px Nunito, sans-serif'; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 3; ctx.strokeText(r.name, x2, z2 + 17); ctx.fillStyle = '#bff0ff'; ctx.fillText(r.name, x2, z2 + 17); } } }
  drawGuide(ctx, W, X, Z, big);
  const p = S.p; ctx.save(); ctx.translate(X(p.pos.x), Z(p.pos.z)); ctx.rotate(-p.yaw); ctx.fillStyle = '#9be36a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; const s = 9;
  ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.7, s * 0.7); ctx.lineTo(0, s * 0.3); ctx.lineTo(-s * 0.7, s * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

// ---------- construcción de la base ----------
const BUILD = {
  wall: { n: 'Pared de madera', ic: '🧱', cost: { plank: 3, nails: 4 }, w: 2.0, h: 2.6, d: 0.2, hp: 260, mat: 'wood' },
  metal: { n: 'Pared de chapa', ic: '🔲', cost: { scrap: 2, nails: 4 }, w: 2.0, h: 2.5, d: 0.14, hp: 480, mat: 'metal' },
  door: { n: 'Puerta', ic: '🚪', cost: { plank: 4, nails: 4 }, w: 1.3, h: 2.3, d: 0.16, hp: 220, door: true, mat: 'wood' },
  barricade: { n: 'Barricada', ic: '🪵', cost: { plank: 2, nails: 3 }, w: 2.0, h: 1.15, d: 0.35, hp: 200, mat: 'wood' },
  box: { n: 'Caja de almacenaje', ic: '📦', cost: { plank: 3, nails: 2 }, w: 1.1, h: 0.8, d: 0.7, hp: 140, storage: true, mat: 'wood' },
  floor: { n: 'Suelo de madera', ic: '🟫', cost: { plank: 2, nails: 2 }, w: 2.0, h: 0.08, d: 2.0, hp: 999, floor: true, mat: 'wood' },
  gate: { n: 'Puerta del campamento', ic: '🚪', cost: {}, w: 4.4, h: 3.0, d: 0.22, hp: 1200, door: true, mat: 'wood', city: true },
  cdoor: { n: 'Puerta', ic: '🚪', cost: {}, w: 1.96, h: 2.55, d: 0.1, hp: 170, door: true, mat: 'wood', city: true },
  bench: { n: 'Banco de trabajo', ic: '🛠️', cost: { plank: 4, nails: 6, scrap: 1 }, w: 1.7, h: 0.95, d: 0.8, hp: 220, mat: 'wood', info: 'desbloquea mejoras y la ballesta' },
  campfire: { n: 'Hoguera', ic: '🔥', cost: { stick: 3, stone: 4 }, w: 1.1, h: 0.35, d: 1.1, hp: 999, floor: true, fire: true, mat: 'wood', info: 'luz, descanso y cocinar' },
  wallR: { n: 'Pared reforzada', ic: '🧱', cost: { plank: 3, scrap: 2, nails: 6 }, near: 'bench', w: 2.0, h: 2.6, d: 0.26, hp: 650, mat: 'wood' },
  doorR: { n: 'Puerta reforzada', ic: '🚪', cost: { plank: 3, scrap: 2, nails: 6 }, near: 'bench', w: 1.3, h: 2.3, d: 0.2, hp: 520, door: true, mat: 'wood' },
  spikes: { n: 'Barricada de pinchos', ic: '🦔', cost: { stick: 4, nails: 6 }, near: 'bench', w: 2.0, h: 0.95, d: 0.8, hp: 240, spikes: true, mat: 'wood', info: 'hiere a los zombis que la tocan' },
  collector: { n: 'Recolector de agua', ic: '🛢️', cost: { plank: 2, scrap: 2, rope: 1 }, near: 'bench', w: 1.0, h: 1.6, d: 1.0, hp: 150, storage: true, produce: 'water', every: 70, max: 4, mat: 'wood', info: 'llena botellas de agua con el tiempo' },
  garden: { n: 'Huerto', ic: '🥬', cost: { plank: 3, nails: 2, seeds: 2 }, w: 2.0, h: 0.4, d: 1.4, hp: 999, floor: true, storage: true, produce: 'veg', every: 110, max: 5, mat: 'wood', info: 'da verduras con el tiempo' },
  alarm: { n: 'Alarma de latas', ic: '🔔', cost: { rope: 1, scrap: 1 }, w: 2.0, h: 1.0, d: 0.1, hp: 60, floor: true, alarm: true, mat: 'wood', info: 'avisa si un zombi se acerca' },
  flag: { n: 'Bandera del campamento', ic: '🚩', cost: { plank: 2, rag: 2 }, w: 0.7, h: 3.0, d: 0.7, hp: 300, storage: true, flag: true, mat: 'wood', info: 'crea tu asentamiento; tus compañeros pueden quedarse aquí' },
  bed: { n: 'Cama', ic: '🛏️', cost: { plank: 4, nails: 4 }, w: 1.1, h: 0.55, d: 2.1, hp: 160, bed: true, mat: 'wood' },
};
S.built = [];
function countItem(p, id) { let n = 0; for (const it of p.inv) if (it.id === id) n += it.n; return n; }
function takeItems(p, id, n) { for (const it of p.inv.slice()) { if (it.id !== id || n <= 0) continue; const k = Math.min(it.n, n); it.n -= k; n -= k; if (it.n <= 0) { p.inv.splice(p.inv.indexOf(it), 1); if (p.eq === it) p.eq = null; } } }
function canAfford(p, def) { for (const k in def.cost) if (countItem(p, k) < def.cost[k]) return false; return true; }
function hasHammer(p) { return p.inv.some(it => it.id === 'hammer'); }
function colorBox(w, h, d, col) { const g = new THREE.BoxGeometry(w, h, d), c = new THREE.Color(col), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }
function pieceMesh(type) {
  const d = BUILD[type], g = new THREE.Group(), TMs = typeof CITY !== 'undefined' ? CITY.TM : null;
  const W = TMs ? TMs.wood : toon(0xb07a48), M = TMs ? TMs.metal : toon(0xa8acb2);
  const add = (w, h, dd, x, y, z, mat, col = 0xffffff) => { const m = new THREE.Mesh(TMs ? colorBox(w, h, dd, col) : new THREE.BoxGeometry(w, h, dd), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  if (type === 'wall') { for (let k = 0; k < 5; k++) add(d.w, d.h / 5 - 0.03, d.d, 0, d.h / 10 + k * d.h / 5, 0, W, k % 2 ? 0xf0e0d0 : 0xffffff); for (const s of [-1, 1]) add(0.14, d.h, d.d + 0.06, s * (d.w / 2 - 0.07), d.h / 2, 0, W, 0xc8a080); add(d.w, 0.12, d.d + 0.05, 0, d.h * 0.5, 0, W, 0xa08060); }
  if (type === 'metal') { add(d.w, d.h, d.d, 0, d.h / 2, 0, M, 0xffffff); for (const s of [-1, 1]) add(0.1, d.h, d.d + 0.06, s * (d.w / 2 - 0.05), d.h / 2, 0, W, 0x8a6a4a); }
  if (type === 'door') { const leaf = new THREE.Group(); leaf.position.set(-d.w / 2, 0, 0); g.add(leaf); for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(TMs ? colorBox(d.w / 4 - 0.02, d.h, d.d, 0xffffff) : new THREE.BoxGeometry(d.w / 4 - 0.02, d.h, d.d), W); m.position.set(d.w / 8 + k * d.w / 4, d.h / 2, 0); m.castShadow = true; leaf.add(m); } const hb = new THREE.Mesh(TMs ? colorBox(d.w, 0.12, d.d + 0.04, 0xa08060) : new THREE.BoxGeometry(d.w, 0.12, d.d + 0.04), W); hb.position.set(d.w / 2, d.h * 0.5, 0); leaf.add(hb); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), toon(0xd8c27a, { metalness: 0.7, roughness: 0.3 })); kn.position.set(d.w - 0.15, 1.05, -0.1); leaf.add(kn); g.userData.leaf = leaf; for (const s of [-1, 1]) add(0.12, d.h + 0.15, d.d + 0.08, s * (d.w / 2 + 0.06), (d.h + 0.15) / 2, 0, W, 0x8a6a4a); add(d.w + 0.24, 0.14, d.d + 0.08, 0, d.h + 0.08, 0, W, 0x8a6a4a); }
  if (type === 'gate') { const leaf = new THREE.Group(); leaf.position.set(-d.w / 2, 0, 0); g.add(leaf); const L = (w, h, dd, x, y, z, mat, col) => { const m = new THREE.Mesh(TMs ? colorBox(w, h, dd, col) : new THREE.BoxGeometry(w, h, dd), mat); m.position.set(x, y, z); leaf.add(m); }; for (let k = 0; k < 11; k++) L(d.w / 11 - 0.02, d.h, d.d, d.w / 22 + k * d.w / 11, d.h / 2, 0, W, k % 2 ? 0xd8c8b0 : 0xc8b8a0); for (const y of [0.5, 1.5, 2.5]) L(d.w, 0.2, 0.04, d.w / 2, y, -d.d / 2 - 0.02, M, 0x6a6a72); const br = new THREE.Mesh(TMs ? colorBox(0.15, 4.6, 0.05, 0x8a6a4a) : new THREE.BoxGeometry(0.15, 4.6, 0.05), W); br.position.set(d.w / 2, d.h / 2, d.d / 2 + 0.03); br.rotation.z = 0.95; leaf.add(br); flattenInto(leaf, W); g.userData.leaf = leaf; }
  if (type === 'cdoor') { const leaf = new THREE.Group(); leaf.position.set(-d.w / 2, 0, 0); g.add(leaf); const shop = g.userData.shop = !!pieceMesh.shop;
    const L = (w, h, dd, x, y, z, mat, col = 0xffffff) => { const m = new THREE.Mesh(TMs ? colorBox(w, h, dd, col) : new THREE.BoxGeometry(w, h, dd), mat); m.position.set(x, y, z); m.castShadow = true; leaf.add(m); return m; };
    if (shop) { const fr = toon(0x3a3c42, { metalness: 0.6, roughness: 0.4 }); L(d.w, 0.12, d.d, d.w / 2, 0.06, 0, fr); L(d.w, 0.12, d.d, d.w / 2, d.h - 0.06, 0, fr); L(0.1, d.h, d.d, 0.05, d.h / 2, 0, fr); L(0.1, d.h, d.d, d.w - 0.05, d.h / 2, 0, fr); L(d.w, 0.08, d.d, d.w / 2, 1.0, 0, fr);
      const gl = new THREE.Mesh(new THREE.BoxGeometry(d.w - 0.2, d.h - 0.24, 0.03), toon(0x30404a, { roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.55 })); gl.position.set(d.w / 2, d.h / 2, 0); leaf.add(gl); L(0.04, 0.5, 0.06, d.w - 0.25, 1.15, -0.08, fr); }
    else { L(d.w, d.h, d.d, d.w / 2, d.h / 2, 0, W, pick([0x8a5a3a, 0xa87a4a, 0x6a4a32, 0xd8d0c0])); for (const yy of [0.7, 1.75]) for (const xx of [0.5, 1.46]) L(0.7, 0.75, 0.03, xx, yy, -d.d / 2 - 0.01, W, 0xc8b8a0); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), toon(0xd8c27a, { metalness: 0.7, roughness: 0.3 })); kn.position.set(d.w - 0.15, 1.05, -0.1); leaf.add(kn); const kn2 = kn.clone(); kn2.position.z = 0.1; leaf.add(kn2); }
    flattenInto(leaf, shop ? FLAT_MAT : W); g.userData.leaf = leaf; }
  if (type === 'flag') { add(0.09, 3.0, 0.09, 0, 1.5, 0, W, 0x8a6a4a); const cl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.65, 6, 3), toon(0xb8202a, { side: THREE.DoubleSide })); cl.position.set(0.52, 2.6, 0); g.add(cl); add(0.9, 0.6, 0.6, 0.2, 0.3, 0.5, W, 0xb8834a); add(0.92, 0.06, 0.62, 0.2, 0.62, 0.5, W, 0x8a6a4a); for (let k = 0; k < 6; k++) { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), toon(0x7a7670)); st.position.set(Math.cos(k) * 0.3, 0.06, Math.sin(k) * 0.3); g.add(st); } }
  if (type === 'bench') { add(d.w, 0.08, d.d, 0, d.h - 0.04, 0, W, 0xd8b890); for (const a of [-1, 1]) for (const b of [-1, 1]) add(0.08, d.h - 0.08, 0.08, a * (d.w / 2 - 0.08), (d.h - 0.08) / 2, b * (d.d / 2 - 0.08), W, 0x8a6a4a); add(d.w - 0.2, 0.04, d.d - 0.2, 0, 0.3, 0, W, 0xa08060); add(0.18, 0.12, 0.14, d.w / 2 - 0.2, d.h + 0.06, -0.2, M, 0x6a6a72); add(0.25, 0.04, 0.05, -0.3, d.h + 0.02, 0.1, M, 0x9a9aa2); add(0.06, 0.05, 0.2, -0.3, d.h + 0.03, 0.1, W, 0xb08050); add(d.w, 0.6, 0.04, 0, d.h + 0.32, d.d / 2 - 0.02, W, 0xc8a878); }
  if (type === 'campfire') { for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28; const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), toon(0x7a7670)); st.position.set(Math.cos(a) * 0.42, 0.08, Math.sin(a) * 0.42); st.rotation.set(k, k * 2, 0); st.castShadow = true; g.add(st); } for (let k = 0; k < 3; k++) { const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.7, 7), toon(0x4a3020)); lg.rotation.set(Math.PI / 2 - 0.35, k * 2.1, 0); lg.position.y = 0.14; g.add(lg); }
    const ember = new THREE.Mesh(new THREE.CircleGeometry(0.3, 14), new THREE.MeshBasicMaterial({ color: 0xff5a1a })); ember.rotation.x = -Math.PI / 2; ember.position.y = 0.04; g.add(ember);
    const fl = new THREE.Group(); fl.position.y = 0.12; const fm = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }); for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.07 + Math.random() * 0.05, 0.35 + Math.random() * 0.3, 6), fm); f.position.set((Math.random() - 0.5) * 0.25, 0.15, (Math.random() - 0.5) * 0.25); f.userData.ph = Math.random() * 6; fl.add(f); } g.add(fl); g.userData.flames = fl; }
  if (type === 'wallR') { for (let k = 0; k < 5; k++) add(d.w, d.h / 5 - 0.03, d.d, 0, d.h / 10 + k * d.h / 5, 0, W, k % 2 ? 0xe0d0c0 : 0xf0e8e0); for (const y of [0.5, 1.4, 2.2]) add(d.w * 0.9, 0.35, 0.03, 0, y, -d.d / 2 - 0.016, M, 0x9a9ca2); const br = add(0.1, d.h * 1.1, 0.06, 0, d.h / 2, d.d / 2 + 0.03, W, 0x8a6a4a); br.rotation.z = 0.68; for (const s2 of [-1, 1]) add(0.16, d.h, d.d + 0.08, s2 * (d.w / 2 - 0.08), d.h / 2, 0, M, 0x6a6a72); }
  if (type === 'spikes') { add(d.w, 0.18, 0.2, 0, 0.12, 0.2, W, 0x8a6a4a); for (let k = 0; k < 7; k++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.05, 1.05, 6), W); sp.position.set(-d.w / 2 + 0.15 + k * (d.w - 0.3) / 6, 0.45, -0.05); sp.rotation.x = -0.55; sp.castShadow = true; g.add(sp); } for (const s2 of [-1, 1]) { const x2 = add(0.08, 0.9, 0.08, s2 * 0.8, 0.35, 0.15, W, 0x6a4a32); x2.rotation.x = 0.4; } }
  if (type === 'collector') { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.85, 14), toon(0x2a5a9a, { roughness: 0.5 })); bar.position.y = 0.43; bar.castShadow = true; g.add(bar); const fun = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.45, 12, 1, true), toon(0x3a5a3a, { side: THREE.DoubleSide })); fun.rotation.x = Math.PI; fun.position.y = 1.15; g.add(fun); for (const a of [0, 1, 2, 3]) add(0.05, 1.4, 0.05, Math.cos(a * 1.57 + 0.78) * 0.45, 0.7, Math.sin(a * 1.57 + 0.78) * 0.45, W, 0x8a6a4a); }
  if (type === 'garden') { add(d.w, 0.25, d.d, 0, 0.12, 0, W, 0x4a3020); for (const s2 of [-1, 1]) { add(d.w + 0.06, 0.3, 0.05, 0, 0.15, s2 * d.d / 2, W, 0xb08050); add(0.05, 0.3, d.d, s2 * d.w / 2, 0.15, 0, W, 0xb08050); } for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) { const pl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), toon(a % 2 ? 0x4a8a3a : 0x5a9a3a)); pl.scale.y = 0.7; pl.position.set(-0.7 + a * 0.47, 0.32, -0.45 + b * 0.45); g.add(pl); } }
  if (type === 'alarm') { for (const s2 of [-1, 1]) add(0.06, 1.0, 0.06, s2 * 0.95, 0.5, 0, W, 0x8a6a4a); add(d.w, 0.01, 0.01, 0, 0.8, 0, W, 0xc8b890); for (let k = 0; k < 6; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 8), toon(0xa8aab0, { metalness: 0.7 })); c.position.set(-0.75 + k * 0.3, 0.7, 0); g.add(c); } }
  if (type === 'doorR') { const leaf = new THREE.Group(); leaf.position.set(-d.w / 2, 0, 0); g.add(leaf); const L = (w, h, dd, x, y, z, mat, col) => { const m = new THREE.Mesh(TMs ? colorBox(w, h, dd, col) : new THREE.BoxGeometry(w, h, dd), mat); m.position.set(x, y, z); m.castShadow = true; leaf.add(m); }; for (let k = 0; k < 4; k++) L(d.w / 4 - 0.02, d.h, d.d, d.w / 8 + k * d.w / 4, d.h / 2, 0, W, 0xe8d8c8); for (const y of [0.45, 1.15, 1.85]) L(d.w - 0.1, 0.3, 0.03, d.w / 2, y, -d.d / 2 - 0.016, M, 0x8a8c92); L(0.06, 0.06, 0.12, d.w - 0.15, 1.05, -0.12, M, 0x5a5a62); flattenInto(leaf, W); g.userData.leaf = leaf; for (const s2 of [-1, 1]) add(0.14, d.h + 0.15, d.d + 0.08, s2 * (d.w / 2 + 0.07), (d.h + 0.15) / 2, 0, M, 0x6a6a72); add(d.w + 0.28, 0.14, d.d + 0.08, 0, d.h + 0.08, 0, M, 0x6a6a72); }
  if (type === 'barricade') { for (let k = 0; k < 3; k++) { const m = add(d.w + 0.3, 0.2, 0.06, 0, 0.25 + k * 0.33, 0, W, 0xffffff); m.rotation.z = (k - 1) * 0.12; } for (const s of [-1, 1]) { const m = add(0.12, d.h, 0.12, s * 0.8, d.h / 2, 0.08, W, 0xc8a080); m.rotation.x = -0.2; } }
  if (type === 'box') { add(d.w, d.h - 0.08, d.d, 0, (d.h - 0.08) / 2, 0, W, 0xffffff); add(d.w + 0.04, 0.08, d.d + 0.04, 0, d.h - 0.04, 0, W, 0xc8a080); for (const s of [-1, 1]) add(0.06, d.h, d.d + 0.04, s * (d.w / 2 - 0.03), d.h / 2, 0, W, 0x8a6a4a); }
  if (type === 'floor') { for (let k = 0; k < 5; k++) add(d.w, d.h, d.d / 5 - 0.02, 0, d.h / 2, -d.d / 2 + d.d / 10 + k * d.d / 5, W, k % 2 ? 0xf0e0d0 : 0xffffff); }
  if (type === 'bed') { add(d.w, 0.3, d.d, 0, 0.25, 0, W, 0xffffff); add(d.w - 0.08, 0.16, d.d - 0.1, 0, 0.47, 0.03, toon(0xe8e0f0), 0xffffff).material = toon(0xe8e8f0); add(d.w - 0.1, 0.1, 0.4, 0, 0.6, d.d / 2 - 0.3, toon(0xffffff)); add(d.w - 0.06, 0.06, d.d * 0.6, 0, 0.57, -d.d * 0.15, toon(0x3a6ad8)); add(d.w, 0.7, 0.08, 0, 0.45, d.d / 2, W, 0xc8a080); }
  if (!d.door && !d.fire && type !== 'collector' && type !== 'flag') flattenInto(g, d.mat === 'metal' ? M : W);
  return g;
}
function pieceAABB(type, x, z, rot) { const d = BUILD[type], hw = (rot % 2 ? d.d : d.w) / 2, hd = (rot % 2 ? d.w : d.d) / 2; return [x - hw, z - hd, x + hw, z + hd]; }
function removeBox(b) { if (!b) return; const i = BOXES.indexOf(b); if (i >= 0) BOXES.splice(i, 1); for (const l of COLGRID.values()) { const j = l.indexOf(b); if (j >= 0) l.splice(j, 1); } }
function addPiece(type, x, z, rot, y, hp, open, items, shop) {
  pieceMesh.shop = shop; const d = BUILD[type], m = pieceMesh(type); pieceMesh.shop = false; m.position.set(x, y, z); m.rotation.y = rot * Math.PI / 2; scene.add(m);
  const pc = { type, x, z, y, rot, hp: hp !== undefined ? hp : d.hp, open: !!open, mesh: m, box: null, cont: null };
  if (!d.floor) { const a = pieceAABB(type, x, z, rot); pc.box = addBox(a[0], y, a[1], a[2], y + d.h, a[3]); }
  if (d.storage) { pc.cont = { kind: 'storage', name: d.n, pos: new V3(x, y, z), items: items || [], r: 1.4, built: pc, searched: true }; S.conts.push(pc.cont); }
  if (d.door) setDoor(pc, pc.open);
  if (d.flag) { S.camp = { x, z, pc }; pc.cont.name = 'Almacén del campamento'; if (S.phase === 'game') S.campKnown = true; }
  S.built.push(pc); return pc;
}
function setDoor(pc, open) { pc.open = open; const leaf = pc.mesh.userData.leaf; if (leaf) leaf.rotation.y = open ? -1.5 : 0; if (pc.box) pc.box.y1 = open ? pc.box.y0 : pc.box.y0 + BUILD[pc.type].h; }
function destroyPiece(pc, silent) {
  if (BUILD[pc.type].flag && S.camp && S.camp.pc === pc) { S.camp = null; if (S.npcs) for (const n of S.npcs) if (n.state === 'camp') n.state = 'stay'; if (!silent) msg('🚩 ¡Han destruido la bandera del campamento!', 2.5); }
  if (pc.city) { pc.broken = true; if (!silent) { burst(new V3(pc.x, pc.y + 1.2, pc.z), 0x6a4a2a, 22, 5, 0.9); sfx('thud', 1); sfx('shotgun', 0.25); } }
  scene.remove(pc.mesh); removeBox(pc.box); S.built.splice(S.built.indexOf(pc), 1);
  if (pc.cont) { for (const it of pc.cont.items) dropGround(it, pc.x + R(-0.5, 0.5), pc.z + R(-0.5, 0.5), pc.y); S.conts.splice(S.conts.indexOf(pc.cont), 1); if (S.open === pc.cont) closeInv(); }
  if (!silent) { burst(new V3(pc.x, pc.y + 1, pc.z), 0x8a5a2a, 14, 4, 0.8); sfxAt('thud', new V3(pc.x, pc.y, pc.z)); }
}
// colocación
const ghostMatOk = new THREE.MeshBasicMaterial({ color: 0x5aff6a, transparent: true, opacity: 0.4, depthWrite: false }), ghostMatBad = new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, opacity: 0.4, depthWrite: false });
let ghost = null;
function startPlacing(type) {
  const p = S.p; if (!hasHammer(p)) { msg('Necesitas un martillo para construir', 2); return; }
  if (BUILD[type].flag && S.camp) { msg('Ya tienes un campamento. Desmonta la bandera para moverlo.', 2.2); return; }
  if (BUILD[type].near && !nearPiece(BUILD[type].near, 6)) { msg(`Tienes que estar junto a un ${NEAR_N[BUILD[type].near]}`, 2); return; }
  if (!canAfford(p, BUILD[type])) { msg('Te faltan materiales', 1.5); return; }
  closeBuildMenu(); S.placing = { type, rot: S.placing ? S.placing.rot : 0 };
  if (ghost) scene.remove(ghost); ghost = pieceMesh(type); ghost.traverse(o => { if (o.isMesh) { o.material = ghostMatOk; o.castShadow = false; } }); scene.add(ghost);
  if (S.view === 'fp' && !IS_TOUCH) requestLock();
  $('bplace').classList.remove('hidden'); updateBuildHint();
}
function stopPlacing() { S.placing = null; if (ghost) { scene.remove(ghost); ghost = null; } $('bplace').classList.add('hidden'); }
function updateBuildHint() { if (!S.placing) return; const d = BUILD[S.placing.type]; setT('bhint', `${d.ic} <b>${d.n}</b> · ${costTxt(d)}<br><small>${IS_TOUCH ? 'Toca ✔ para colocar, ⟳ para girar' : 'Clic: colocar · R: girar · B o Esc: salir'}</small>`); }
function costTxt(d) { return Object.entries(d.cost).map(([k, v]) => `${ITEMS[k].ic}${countItem(S.p, k)}/${v}`).join(' '); }
function placeTarget() {
  const p = S.p; let pt = null;
  if (S.view === 'fp' || IS_TOUCH) { if (S.view === 'fp' && S.pitch < -0.08) { const t = (p.c.eye * 1.05) / Math.tan(-S.pitch); if (t < 5) pt = new V3(p.pos.x - Math.sin(S.yaw) * t, 0, p.pos.z - Math.cos(S.yaw) * t); } if (!pt) pt = new V3(p.pos.x - Math.sin(p.yaw) * 2.6, 0, p.pos.z - Math.cos(p.yaw) * 2.6); }
  else { pt = mouseGround(p.pos.y); if (pt && Math.hypot(pt.x - p.pos.x, pt.z - p.pos.z) > 6) { const a = Math.atan2(pt.x - p.pos.x, pt.z - p.pos.z); pt.set(p.pos.x + Math.sin(a) * 6, 0, p.pos.z + Math.cos(a) * 6); } }
  if (!pt) return null; pt.x = Math.round(pt.x * 2) / 2; pt.z = Math.round(pt.z * 2) / 2; pt.y = getH(pt.x, pt.z); return pt;
}
function placementValid(type, x, z, rot, y) {
  const d = BUILD[type], a = pieceAABB(type, x, z, rot), p = S.p;
  if (getH(x, z) < -0.3) return false;
  if (d.floor) return true;
  const m = 0.02; const hit = (cx, cz, r) => cx + r > a[0] + m && cx - r < a[2] - m && cz + r > a[1] + m && cz - r < a[3] - m;
  if (hit(p.pos.x, p.pos.z, 0.38)) return false;
  for (const zb of S.zombies) if (zb.alive && hit(zb.pos.x, zb.pos.z, 0.36)) return false;
  for (const o of nearby((a[0] + a[2]) / 2, (a[1] + a[3]) / 2, 3)) { if (y + d.h <= o.y0 + 0.05 || y >= o.y1 - 0.05) continue; if (o.t === 1) { if (hit(o.x, o.z, o.r)) return false; } else if (o.x1 > a[0] + m && o.x0 < a[2] - m && o.z1 > a[1] + m && o.z0 < a[3] - m) return false; }
  return true;
}
function updatePlacing() {
  if (!S.placing || !ghost) return; const pt = placeTarget(); if (!pt) { ghost.visible = false; return; }
  ghost.visible = true; ghost.position.copy(pt); ghost.rotation.y = S.placing.rot * Math.PI / 2;
  S.placing.pt = pt; S.placing.ok = placementValid(S.placing.type, pt.x, pt.z, S.placing.rot, pt.y) && canAfford(S.p, BUILD[S.placing.type]);
  const mt = S.placing.ok ? ghostMatOk : ghostMatBad; ghost.traverse(o => { if (o.isMesh) o.material = mt; });
}
function confirmPlace() {
  const pl = S.placing; if (!pl || !pl.pt) return; if (!pl.ok) { msg(canAfford(S.p, BUILD[pl.type]) ? 'No cabe ahí' : 'Te faltan materiales', 1.2); return; }
  const d = BUILD[pl.type]; for (const k in d.cost) takeItems(S.p, k, d.cost[k]);
  addPiece(pl.type, pl.pt.x, pl.pt.z, pl.rot, pl.pt.y); sfx('thud', 0.9); setTimeout(() => sfx('thud', 0.6), 150); emitNoise(S.p.pos, 12); S.dirty = true;
  if (!canAfford(S.p, d)) { stopPlacing(); msg('Se acabaron los materiales', 1.5); } else updateBuildHint();
  saveSoon();
}
function rotatePlacing() { if (S.placing) { S.placing.rot = (S.placing.rot + 1) % 4; } }
function lookPiece(maxD = 2.6, own) { const p = S.p; let best = null, bd = maxD; for (const pc of S.built) { if (own && pc.city) continue; const a = pieceAABB(pc.type, pc.x, pc.z, pc.rot); const cx = clamp(p.pos.x, a[0], a[2]), cz = clamp(p.pos.z, a[1], a[3]), d = Math.hypot(cx - p.pos.x, cz - p.pos.z); const ang = Math.abs(angDiff(p.yaw, Math.atan2(-(pc.x - p.pos.x), -(pc.z - p.pos.z)))); if (d < bd && (ang < 1.0 || d < 0.6)) { bd = d; best = pc; } } return best; }
function dismantleLooked() {
  const p = S.p, pc = lookPiece(2.6, true); if (!pc) { msg('Mira a algo que hayas construido', 1.5); return; }
  if (!hasHammer(p)) { msg('Necesitas un martillo', 1.5); return; }
  const d = BUILD[pc.type]; for (const k in d.cost) { const n = Math.floor(d.cost[k] / 2); if (n) addItem(p, mk(k, n)); }
  destroyPiece(pc); msg(`Desmontado: ${d.n} (recuperas la mitad)`, 1.8); S.dirty = true; closeBuildMenu(); saveSoon();
}
const UPG = { wall: 'wallR', door: 'doorR', barricade: 'spikes', metal: 'wallR' };
function upgradeLooked() {
  const p = S.p, pc = lookPiece(2.6, true); if (!pc) { msg('Mira a algo que hayas construido', 1.5); return; }
  const to = UPG[pc.type]; if (!to) { msg('Eso no se puede mejorar', 1.5); return; }
  if (!hasHammer(p)) { msg('Necesitas un martillo', 1.5); return; } if (!nearPiece('bench', 12)) { msg('Necesitas un banco de trabajo cerca', 1.8); return; }
  const need = to === 'spikes' ? { stick: 3, nails: 4 } : { scrap: 2, nails: 4 }; for (const k in need) if (countItem(p, k) < need[k]) { msg('Te faltan: ' + Object.entries(need).map(([a, b]) => ITEMS[a].ic + '×' + b).join(' '), 2); return; }
  for (const k in need) takeItems(p, k, need[k]); const { x, z, y, rot } = pc; destroyPiece(pc, true); addPiece(to, x, z, rot, y); sfx('thud', 1); setTimeout(() => sfx('thud', 0.7), 160); msg(`Mejorado: ${BUILD[to].n}`, 1.6); closeBuildMenu(); emitNoise(p.pos, 10); saveSoon();
}
function dismantleFurniture(c) {
  const p = S.p; if (!hasHammer(p)) { msg('Necesitas un martillo para desmontar', 1.5); return; }
  for (const k in c.dismantle) addItem(p, mk(k, c.dismantle[k]));
  for (const it of c.items) dropGround(it, p.pos.x + R(-0.4, 0.4), p.pos.z + R(-0.4, 0.4), p.pos.y);
  if (c.model) { c.model.visible = false; c.model.userData.gone = true; } removeBox(c.box); c.gone = true; c.items = []; closeInv(); sfx('thud', 1); emitNoise(p.pos, 10);
  msg(`Desmontas: ${c.name} → ${Object.entries(c.dismantle).map(([k, v]) => ITEMS[k].ic + '×' + v).join(' ')}`, 2.2); S.dirty = true; saveSoon();
}
function openBuildMenu() {
  const p = S.p; if (!p || !p.alive) return; stopPlacing(); closeInv(); if (document.pointerLockElement) document.exitPointerLock();
  S.buildOpen = true; const ham = hasHammer(p);
  $('buildl').innerHTML = (ham ? '' : '<div class="empty">🔨 Necesitas un <b>martillo</b> (búscalo en la ferretería o en el solar en obras).</div>') + Object.entries(BUILD).filter(([k, d]) => !d.city).map(([k, d]) => { const nb = !d.near || nearPiece(d.near, 6), ok = ham && canAfford(p, d) && nb; return `<div class="it"><span class="ic">${d.ic}</span><span class="nm">${d.n}<small>${costTxt(d)}${d.near ? ` · <span style="color:${nb ? '#9be36a' : '#ff8a6a'}">junto al banco</span>` : ''}${d.info ? ' · ' + d.info : d.storage ? ' · guarda objetos' : d.door ? ' · se abre con E' : d.bed ? ' · dormir hasta el día' : d.floor ? ' · decorativo' : ' · aguanta ' + d.hp}</small></span><button class="ib" data-b="${k}" ${ok ? '' : 'disabled style="opacity:.4"'}>Construir</button></div>`; }).join('') +
    `<div class="it"><span class="ic">⬆️</span><span class="nm">Mejorar lo que miro<small>Pared → reforzada · Puerta → reforzada · Barricada → pinchos (junto al banco)</small></span><button class="ib" data-b="__up">Mejorar</button></div><div class="it"><span class="ic">🪓</span><span class="nm">Desmontar lo que miro<small>Recuperas la mitad de los materiales</small></span><button class="ib x" data-b="__dis">Desmontar</button></div>`;
  $('build').classList.remove('hidden'); updateLock();
}
function closeBuildMenu() { S.buildOpen = false; $('build').classList.add('hidden'); updateLock(); }
$('build').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'buildx') { closeBuildMenu(); return; } const k = b.dataset.b; if (k === '__dis') dismantleLooked(); else if (k === '__up') upgradeLooked(); else if (k) startPlacing(k); });
$('bok').onclick = () => confirmPlace(); $('brot').onclick = () => rotatePlacing(); $('bcan').onclick = () => stopPlacing();
$('bbuild').onclick = () => { if (S.buildOpen) closeBuildMenu(); else openBuildMenu(); };
function makeCDoor(d, st, hp) {
  if (d.gate && st === 'broken') st = 'closed'; if (d.gate && st === 'locked') st = 'closed';
  if (st === 'broken') return { d, broken: true };
  const pc = addPiece(d.gate ? 'gate' : 'cdoor', d.x, d.z, d.rot, d.y, hp, st === 'open', null, d.shop); pc.city = true; pc.locked = st === 'locked'; pc.d = d; return pc;
}
function sleepBed() {
  const p = S.p; const near = S.zombies.some(z => z.alive && z.pos.distanceTo(p.pos) < 25 && (z.state === 'chase' || z.state === 'hunt'));
  if (near) { msg('No puedes dormir con zombis cerca', 1.8); return; }
  const h = hourNow(); if (h > 7 && h < 19) { msg('Solo puedes dormir de noche (de 19:00 a 07:00)', 2); return; }
  const hours = (31 - h) % 24, k = hours; S.clock += hours / 24 * DAY;
  p.food = Math.max(0, p.food - k * 2.2); p.water = Math.max(0, p.water - k * 3.2); p.sta = 100; p.hp = Math.min(100, p.hp + (p.food > 20 && p.water > 20 ? 20 : 0));
  msg(`Duermes ${Math.round(hours)} horas. ¡Buenos días!`, 2.5); sfx('pick', 0.6); saveSoon();
}
// ---------- la base cobra vida: recolectores, huerto, hoguera, pinchos, alarma ----------
function updateBase(dt) {
  const p = S.p;
  for (const b of S.built) {
    const d = BUILD[b.type];
    if (d.produce && b.cont) { b.prodT = (b.prodT ?? d.every) - dt * (d.produce === 'veg' && S.npcs && S.npcs.some(n => n.alive && n.state === 'camp' && n.def.skill === 'farmer') ? 2 : 1); if (b.prodT <= 0) { b.prodT = d.every * R(0.85, 1.15); const n = b.cont.items.filter(i => i.id === d.produce).length; if (n < d.max) { b.cont.items.push(mk(d.produce)); if (Math.hypot(b.x - p.pos.x, b.z - p.pos.z) < 30) msg(d.produce === 'water' ? '🛢️ El recolector tiene agua' : '🥬 Hay verduras en el huerto', 1.6); } } }
    if (d.fire && b.mesh.userData.flames && b.mesh.visible) for (const f of b.mesh.userData.flames.children) { const k = 0.75 + Math.sin(S.time * 12 + f.userData.ph) * 0.25; f.scale.set(k, k * (0.8 + Math.sin(S.time * 8 + f.userData.ph) * 0.4), k); }
    if (d.fire && p.alive && Math.hypot(b.x - p.pos.x, b.z - p.pos.z) < 3) { p.sta = Math.min(100, p.sta + 10 * dt); if (p.food > 25 && p.water > 25) p.hp = Math.min(100, p.hp + 0.6 * dt); }
    if (d.spikes) { for (const z of S.zombies) { if (!z.alive) continue; const a = pieceAABB(b.type, b.x, b.z, b.rot); const cx = clamp(z.pos.x, a[0], a[2]), cz = clamp(z.pos.z, a[1], a[3]); if (Math.hypot(cx - z.pos.x, cz - z.pos.z) < 0.6) { z.spikeT = (z.spikeT || 0) - dt; if (z.spikeT <= 0) { z.spikeT = 0.6; hurtZombie(z, 9, new V3(b.x, b.y, b.z), 1.2); b.hp -= 2; if (b.hp <= 0) { destroyPiece(b); break; } } } } }
    if (d.alarm) { b.alT = (b.alT || 0) - dt; if (b.alT <= 0) for (const z of S.zombies) if (z.alive && Math.hypot(z.pos.x - b.x, z.pos.z - b.z) < 4.5) { b.alT = 15; sfxAt('click', new V3(b.x, b.y, b.z)); setTimeout(() => sfx('click', 0.8), 120); setTimeout(() => sfx('click', 0.8), 260); msg('🔔 ¡La alarma de latas está sonando!', 2.2); break; } }
  }
}
// ---------- hordas ----------
const DIRN = a => { const deg = (Math.atan2(Math.sin(a), -Math.cos(a)) * 180 / Math.PI + 360) % 360; return ['el norte', 'el noreste', 'el este', 'el sureste', 'el sur', 'el suroeste', 'el oeste', 'el noroeste'][Math.round(deg / 45) % 8]; };
function spawnHorde(n, big) {
  const p = S.p; if (!p.alive) return; const a = R(0, 6.28), d0 = R(62, 85), cx = p.pos.x + Math.sin(a) * d0, cz = p.pos.z - Math.cos(a) * d0;
  let pts = (typeof CITY !== 'undefined' ? CITY.streetPts : []).filter(q => Math.hypot(q[0] - cx, q[1] - cz) < 30 && Math.hypot(q[0] - p.pos.x, q[1] - p.pos.z) > 45);
  let made = 0;
  for (let i = 0; i < n * 3 && made < n; i++) { const q = pts.length ? pick(pts) : [cx + R(-8, 8), cz + R(-8, 8)]; const x = q[0] + R(-2, 2), z = q[1] + R(-2, 2); if (getH(x, z) < 1.5) continue; const zz = new Zombie(x, z); collide(zz.pos, 0.38, 1.8); zz.horde = true; zz.state = 'hunt'; zz.target.copy(p.pos); zz.alertT = 999; S.zombies.push(zz); made++; }
  if (made) { msg(`🧟 ${big ? '¡Una gran horda' : 'Un grupo de zombis'} se acerca desde ${DIRN(a)}!`, 3.5); sfx('groan', 1); S.hordeAng = a; S.hordeT2 = 8; }
}
function updateHordes(dt) {
  const h = hourNow(), day = dayNum();
  if (h >= 21.5 && S.lastHordeDay !== day) { S.lastHordeDay = day; spawnHorde(Math.min(30, 10 + day * 3), true); }
  S.smallHordeT = (S.smallHordeT ?? R(200, 320)) - dt; if (S.smallHordeT <= 0) { S.smallHordeT = R(220, 380); spawnHorde(RI(4, 7) + Math.min(6, day), false); }
  if ((S.hordeTick = (S.hordeTick || 0) - dt) <= 0) { S.hordeTick = 3; for (const z of S.zombies) if (z.alive && z.horde && z.state !== 'chase') { z.state = 'hunt'; z.target.copy(S.p.pos); z.alertT = 999; } }
  if (S.hordeT2 > 0) S.hordeT2 -= dt;
}
// ---------- guardar y cargar ----------
const SAVE_KEY = 'zm_save_v1';
let saveT = 0;
function saveSoon() { saveT = Math.min(saveT, 1); }
function saveGame() {
  const p = S.p; if (!p || !p.alive || S.phase !== 'game') return;
  try {
    const d = { v: 1, clock: S.clock, kills: S.kills, lhd: S.lastHordeDay || 0, ck: !!S.campKnown, cv: !!S.campVisited, cards: S.cards || 0, zCount: S.zCount, cr: CR, p: { pos: p.pos.toArray(), yaw: p.yaw, hp: p.hp, food: p.food, water: p.water, sta: p.sta, bleed: p.bleed, inv: p.inv, eq: p.inv.indexOf(p.eq) },
      conts: S.conts.map((c, i) => (!c.built && (c.searched || c.gone)) ? [i, c.items, c.gone ? 1 : 0] : null).filter(Boolean),
      ground: S.ground.map(g => [g.it, +g.pos.x.toFixed(2), +g.pos.y.toFixed(2), +g.pos.z.toFixed(2)]),
      built: S.built.filter(b => !b.city).map(b => [b.type, b.x, b.z, b.y, b.rot, Math.round(b.hp), b.open ? 1 : 0, b.cont ? b.cont.items : null]),
      npcs: typeof npcSaveData === 'function' ? npcSaveData() : [],
      cars: S.cars.map(c => [+c.pos.x.toFixed(1), +c.pos.z.toFixed(1), +c.yaw.toFixed(2), Math.round(c.fuel), Math.round(c.hp), c.col]),
      doors: (S.cdoors || []).map(c => c.broken ? 'b' : [c.open ? 1 : 0, c.locked ? 1 : 0, Math.round(c.hp)]),
      zombies: S.zombies.filter(z => z.alive).map(z => [+z.pos.x.toFixed(1), +z.pos.z.toFixed(1), z.hp]) };
    localStorage.setItem(SAVE_KEY, JSON.stringify(d)); S.savedAt = S.time;
  } catch (e) { }
}
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; } }
function deleteSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
addEventListener('pagehide', () => saveGame());

// ---------- coches que se pueden conducir ----------
S.cars = []; S.drive = null;
const CAR_COLS = [0x8a2a2a, 0x2a3a6a, 0xd8d8dc, 0x2a2a30, 0x4a5a3a, 0x8a7a5a, 0x5a6a7a];
function carMesh(col) {
  const g = new THREE.Group(), body = toon(col, { roughness: 0.35, metalness: 0.45 }), dk = toon(0x1c1c20), gl = toon(0x1a2630, { roughness: 0.05, metalness: 0.8 }), chrome = toon(0xb8bcc2, { metalness: 0.9, roughness: 0.25 });
  const B = (w, h, d, m, x, y, z, rx = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.rotation.x = rx; g.add(me); return me; };
  B(1.8, 0.5, 4.3, body, 0, 0.6, 0); B(1.74, 0.12, 1.4, body, 0, 0.88, -1.42, 0.06); B(1.74, 0.14, 1.0, body, 0, 0.9, 1.6, -0.04);
  B(1.62, 0.5, 1.9, body, 0, 1.13, 0.22); B(1.66, 0.38, 1.7, gl, 0, 1.17, 0.22); B(1.5, 0.36, 0.5, gl, 0, 1.08, -0.84, -0.85); B(1.5, 0.34, 0.42, gl, 0, 1.1, 1.26, 0.9);
  for (const sz of [-1, 1]) { B(1.84, 0.22, 0.14, dk, 0, 0.44, sz * 2.17); for (const sx of [-0.6, 0.6]) B(0.34, 0.12, 0.05, toon(sz < 0 ? 0xf8f6e8 : 0xc81a1a, { emissive: sz < 0 ? 0x333322 : 0x330000 }), sx, 0.72, sz * 2.17); }
  B(0.6, 0.12, 0.05, chrome, 0, 0.5, -2.25);
  for (const sx of [-1, 1]) B(0.12, 0.08, 0.16, body, sx * 0.93, 1.04, -0.62);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12), dk); t.rotation.z = Math.PI / 2; t.position.set(sx * 0.82, 0.34, sz * 1.38); g.add(t); const r = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.25, 8), chrome); r.rotation.z = Math.PI / 2; r.position.set(sx * 0.82, 0.34, sz * 1.38); g.add(r); }
  flattenInto(g); const wheels = [];
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return { g, wheels };
}
function carAABB(c) { const ex = Math.abs(Math.cos(c.yaw)) * 0.9 + Math.abs(Math.sin(c.yaw)) * 2.15, ez = Math.abs(Math.sin(c.yaw)) * 0.9 + Math.abs(Math.cos(c.yaw)) * 2.15; return [c.pos.x - ex, c.pos.z - ez, c.pos.x + ex, c.pos.z + ez]; }
function carSolid(c, on) { if (c.box) { removeBox(c.box); c.box = null; } if (on) { const a = carAABB(c); c.box = addBox(a[0], c.pos.y, a[1], a[2], c.pos.y + 1.45, a[3]); } }
function addCar(x, z, yaw, fuel, hp, col) {
  const { g, wheels } = carMesh(col ?? pick(CAR_COLS)); const c = { mesh: g, wheels, pos: new V3(x, getH(x, z), z), yaw, speed: 0, steer: 0, fuel: fuel ?? R(10, 55), hp: hp ?? 100, box: null, col };
  g.position.copy(c.pos); g.rotation.y = yaw; scene.add(g); carSolid(c, true); S.cars.push(c); return c;
}
function spawnCars() {
  if (typeof CITY === 'undefined' || !CITY.carSpots) return;
  const sp = CITY.spawn;
  for (const [x, z, ang] of CITY.carSpots) {
    const q = new V3(x, getH(x, z), z), t = q.clone(); collide(t, 0.8, 1.4); if (t.distanceTo(q) > 0.05) continue;
    if (S.cars.some(c => Math.hypot(c.pos.x - x, c.pos.z - z) < 5)) continue;
    const near = sp && Math.hypot(x - sp.x, z - sp.z) < 45, r = rand();
    addCar(x, z, ang, near ? R(45, 70) : r < 0.3 ? 0 : R(8, 65), near ? 100 : R(45, 100));
  }
}
function nearCar(p, d = 3.0) { let best = null, bd = d; for (const c of S.cars) { const dd = Math.hypot(c.pos.x - p.pos.x, c.pos.z - p.pos.z); if (dd < bd) { bd = dd; best = c; } } return best; }
let engine = null;
function engineSound(on) {
  if (!AC) return; if (on && !engine) { const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 320; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(master); o.start(); o2.start(); engine = { o, o2, g }; }
  if (!on && engine) { try { engine.o.stop(); engine.o2.stop(); } catch (e) { } engine = null; }
}
function enterCar(c) {
  const p = S.p; if (c.hp <= 0) { msg('Este coche está destrozado', 1.6); return; }
  if (c.fuel <= 0.5) { if (countItem(p, 'gas')) { takeItems(p, 'gas', 1); c.fuel = Math.min(100, c.fuel + 50); msg('Repostas el coche con el bidón ⛽', 1.8); sfx('drink', 0.6); } else { msg('No tiene gasolina. Busca un bidón ⛽ (gasolineras, talleres)', 2.4); return; } }
  closeInv(); S.drive = c; carSolid(c, false); p.model.visible = false; sfx('open', 0.9); engineSound(true); msg('🚗 W/S acelerar y frenar · A/D girar · E bajar', 2.5); S.dirty = true;
}
function exitCar() {
  const c = S.drive, p = S.p; if (!c) return; if (Math.abs(c.speed) > 3) { msg('Frena antes de bajar', 1); return; }
  const rx = Math.cos(c.yaw), rz = -Math.sin(c.yaw);
  for (const s2 of [-1, 1, 0]) { const q = s2 ? new V3(c.pos.x - rx * 1.9 * s2, c.pos.y, c.pos.z - rz * 1.9 * s2) : new V3(c.pos.x + Math.sin(c.yaw) * 3, c.pos.y, c.pos.z + Math.cos(c.yaw) * 3); const t = q.clone(); collide(t, 0.36, 1.8); if (t.distanceTo(q) < 0.05) { p.pos.copy(q); break; } }
  c.speed = 0; S.drive = null; carSolid(c, true); engineSound(false); sfx('open', 0.8); saveSoon();
}
function exitCarForce() { const c = S.drive; if (!c) return; c.speed = 0; const p = S.p; p.pos.set(c.pos.x + Math.cos(c.yaw) * 1.9, c.pos.y, c.pos.z - Math.sin(c.yaw) * 1.9); collide(p.pos, 0.36, 1.8); S.drive = null; carSolid(c, true); engineSound(false); }
function updateCar(dt) {
  const c = S.drive, p = S.p;
  let thr = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) + touch.jy, st = (keys.KeyA || keys.ArrowLeft ? 1 : 0) - (keys.KeyD || keys.ArrowRight ? 1 : 0) - touch.jx;
  thr = clamp(thr, -1, 1); st = clamp(st, -1, 1); if (c.fuel <= 0 || c.hp <= 0) thr = 0;
  const brake = keys.Space || touch.atk ? 1 : 0;
  let acc = 0; if (thr > 0) acc = c.speed < -0.5 ? 14 : 7.5 * thr; else if (thr < 0) acc = c.speed > 0.5 ? -14 : -4.5; else acc = -Math.sign(c.speed) * 2.5;
  if (thr < 0 && c.speed <= 0.5) acc = -4.5;
  if (brake) acc = -Math.sign(c.speed) * 18;
  c.speed = clamp(c.speed + acc * dt, -6, 17); if (thr === 0 && !brake && Math.abs(c.speed) < 0.15) c.speed = 0;
  c.steer = lerp(c.steer, st * 0.55 * (1 - Math.min(0.55, Math.abs(c.speed) / 30)), Math.min(1, dt * 6));
  c.yaw += c.speed * Math.tan(c.steer) / 2.7 * dt;
  const fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw), np = c.pos.clone(); np.x += fx * c.speed * dt; np.z += fz * c.speed * dt;
  np.x = clamp(np.x, -HALF + 8, HALF - 8); np.z = clamp(np.z, -HALF + 8, HALF - 8);
  // colisión: dos círculos (morro y maletero)
  let push = 0; for (const off of [1.45, 0, -1.45]) { const q = new V3(np.x + fx * off, np.y, np.z + fz * off), q0 = q.clone(); collide(q, 0.95, 1.4); const dx = q.x - q0.x, dz = q.z - q0.z; if (dx || dz) { np.x += dx; np.z += dz; push = Math.max(push, Math.hypot(dx, dz)); } }
  if (push > 0.02) { if (Math.abs(c.speed) > 4) { c.hp -= Math.abs(c.speed) * 1.1; sfx('thud', Math.min(1, Math.abs(c.speed) / 12)); S.shake = 0.3; emitNoise(np, 25); } c.speed *= -0.25; }
  c.pos.copy(np); c.pos.y = getH(c.pos.x, c.pos.z);
  // atropellos
  for (const z of S.zombies) { if (!z.alive) continue; const dx = z.pos.x - c.pos.x, dz = z.pos.z - c.pos.z; const lf = dx * fx + dz * fz, ls = Math.abs(dx * fz - dz * fx); if (Math.abs(lf) < 2.5 && ls < 1.2) { if (Math.abs(c.speed) > 3) { hurtZombie(z, Math.abs(c.speed) * 6, c.pos, Math.abs(c.speed) * 0.5); c.hp -= 1.2; c.speed *= 0.9; burst(new V3(z.pos.x, z.pos.y + 1, z.pos.z), 0x6a0a06, 10, 4, 0.6); } else { z.pos.x += (dx / (Math.hypot(dx, dz) || 1)) * 0.06; z.pos.z += (dz / (Math.hypot(dx, dz) || 1)) * 0.06; } } }
  c.fuel = Math.max(0, c.fuel - Math.abs(c.speed) * dt * 0.04 - (thr ? 0.004 : 0.001));
  if ((c.noiseT = (c.noiseT || 0) - dt) <= 0) { c.noiseT = 0.6; emitNoise(c.pos, 14 + Math.abs(c.speed) * 1.6); }
  if (c.hp <= 0 && !c.dead) { c.dead = true; msg('💥 ¡El coche ha reventado!', 2); burst(new V3(c.pos.x, c.pos.y + 1.2, c.pos.z), 0x3a3a3a, 30, 4, 1.5); c.mesh.children[0].material = toon(0x2a2622); c.speed = 0; exitCar(); return; }
  // malla, ruedas y jugador
  c.mesh.position.copy(c.pos); c.mesh.rotation.y = c.yaw; for (const w of c.wheels) { w.children[0].rotation.x += c.speed * dt / 0.34; w.children[1].rotation.x = w.children[0].rotation.x; w.rotation.y = w.userData.front ? c.steer : 0; }
  p.pos.copy(c.pos); p.vel.set(fx * c.speed, 0, fz * c.speed); p.yaw = c.yaw; p.sprint = false; p.sta = Math.min(100, p.sta + 8 * dt);
  if (engine) { const sp = Math.abs(c.speed); engine.o.frequency.value = 38 + sp * 6 + (thr ? 8 : 0); engine.o2.frequency.value = 19 + sp * 3; engine.g.gain.value = 0.09 + Math.min(0.12, sp * 0.008); }
  if (fuelWarn(c)) msg('⛽ ¡Te quedas sin gasolina!', 2);
}
function fuelWarn(c) { if (c.fuel < 8 && !c.warned) { c.warned = true; return true; } if (c.fuel > 15) c.warned = false; return false; }

// ---------- crafteo ----------
const RECIPES = [
  { out: 'bandage', cost: { rag: 2 }, d: 'Venda hecha con trapos limpios' },
  { out: 'rope', cost: { rag: 3 }, d: 'Trenzas trapos hasta hacer una cuerda' },
  { out: 'shiv', cost: { scrap: 1, rag: 1 }, d: 'Chapa afilada con mango de trapo' },
  { out: 'saxe', cost: { stick: 1, stone: 1, rope: 1 }, d: 'Piedra atada a un palo: pega fuerte' },
  { out: 'spear', cost: { stick: 1, scrap: 1, rope: 1 }, d: 'Gran alcance: golpea antes de que te toquen' },
  { out: 'club', cost: { plank: 1, nails: 6 }, tool: 'hammer', d: 'Garrote barato y resistente' },
  { out: 'nailbat', cost: { bat: 1, nails: 10 }, tool: 'hammer', d: 'El clásico: mucho más daño que un bate' },
  { out: 'xbow', cost: { plank: 1, stick: 2, rope: 2, nails: 4 }, tool: 'hammer', near: 'bench', d: 'Arma a distancia silenciosa (no atrae zombis)' },
  { out: 'bolt', n: 4, cost: { stick: 1, nails: 4 }, d: 'Munición para la ballesta (a veces se recuperan)' },
  { out: 'molotov', cost: { bottle: 1, alcohol: 1, rag: 1 }, d: 'Lánzalo: incendia el suelo y quema a los zombis' },
  { out: 'molotov', cost: { bottle: 1, gas: 1, rag: 1 }, d: 'Molotov con gasolina' },
  { out: 'plank', cost: { stick: 3, nails: 2 }, tool: 'hammer', d: 'Tablón improvisado con palos' },
  { out: 'nails', n: 8, cost: { scrap: 1 }, tool: 'hammer', d: 'Saca clavos de una chapa metálica' },
  { out: 'medkit', cost: { bandage: 2, alcohol: 1, pills: 1 }, d: 'Botiquín casero: cura mucho y corta hemorragias' },
  { out: 'sandwich', cost: { bread: 1, beans: 1 }, tool: 'knife', d: 'Quita mucha más hambre que comer por separado' },
  { out: 'stew', cost: { beans: 1, veg: 1 }, near: 'campfire', d: 'Cocinado en la hoguera: llena muchísimo' },
  { out: 'water', cost: { bottle: 1 }, near: 'campfire', d: 'Hierves agua de lluvia en la hoguera' },
  { repair: true, cost: { tape: 1 }, d: 'Repara tu arma cuerpo a cuerpo equipada (+60%)' },
];
const NEAR_N = { bench: 'banco de trabajo', campfire: 'hoguera' };
function nearPiece(type, r = 3.5) { const p = S.p; return S.built.some(b => b.type === type && Math.hypot(b.x - p.pos.x, b.z - p.pos.z) < r); }
function recipeOk(p, r) {
  if (r.tool && countItem(p, r.tool) < 1) return false;
  if (r.near && !nearPiece(r.near)) return false;
  for (const k in r.cost) { let have = countItem(p, k); if (r.tool === k) have--; if (have < r.cost[k]) return false; }
  if (r.repair) { const it = p.eq; if (!it || it.dur === undefined || it.dur >= MELEE[ITEMS[it.id].melee].dur) return false; }
  return true;
}
function recipeRow(p, r, i) {
  const ok = recipeOk(p, r), d = r.repair ? { ic: '🛠️', n: 'Reparar arma' } : ITEMS[r.out];
  const parts = Object.entries(r.cost).map(([k, v]) => { const h = countItem(p, k); return `<span style="color:${h >= v ? '#9be36a' : '#ff8a6a'}">${ITEMS[k].ic}${h}/${v}</span>`; });
  if (r.tool) parts.push(`<span style="color:${countItem(p, r.tool) ? '#9be36a' : '#ff8a6a'}">${ITEMS[r.tool].ic} herramienta</span>`);
  if (r.repair) parts.push(`<span style="color:${p.eq && p.eq.dur !== undefined ? '#9be36a' : '#ff8a6a'}">arma equipada</span>`);
  if (r.near) parts.push(`<span style="color:${nearPiece(r.near) ? '#9be36a' : '#ff8a6a'}">junto a ${NEAR_N[r.near]}</span>`);
  return `<div class="it"><span class="ic">${d.ic}</span><span class="nm">${d.n}${r.n ? ' ×' + r.n : ''}<small>${parts.join(' ')}</small><small>${r.d}</small></span><button class="ib" data-c="${i}" ${ok ? '' : 'disabled style="opacity:.35"'}>Crear</button></div>`;
}
function craft(i) {
  const p = S.p, r = RECIPES[i]; if (!r || !recipeOk(p, r)) { msg('Te faltan cosas', 1.2); return; }
  for (const k in r.cost) takeItems(p, k, r.cost[k]);
  if (r.repair) { const it = p.eq, mx = MELEE[ITEMS[it.id].melee].dur; it.dur = Math.min(mx, Math.round(it.dur + mx * 0.6)); msg(`Reparado: ${ITEMS[it.id].n}`, 1.6); }
  else { const it = mk(r.out, r.n || 1); if (it.dur !== undefined) it.dur = MELEE[ITEMS[r.out].melee].dur; addItem(p, it); msg(`Has creado: ${ITEMS[r.out].ic} ${ITEMS[r.out].n}`, 1.6); if (!p.eq && (ITEMS[r.out].melee || ITEMS[r.out].thrown)) p.eq = it; }
  sfx('thud', 0.5); setTimeout(() => sfx('pick', 0.8), 120); emitNoise(p.pos, 4); S.dirty = true; saveSoon();
}
function openCraft() { if (S.invOpen && !S.open) { closeInv(); return; } closeInv(); toggleInv(); }
// ---------- molotov y fuego ----------
S.throws = []; S.fires = [];
const fireTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(255,230,140,1)'); g.addColorStop(0.35, 'rgba(255,140,30,0.85)'); g.addColorStop(0.7, 'rgba(200,50,10,0.45)'); g.addColorStop(1, 'rgba(60,10,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,${120 + Math.random() * 100 | 0},20,${Math.random() * 0.4})`; const a = Math.random() * 6.28, r = Math.random() * 50; x.beginPath(); x.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 3 + Math.random() * 8, 0, 6.28); x.fill(); } return new THREE.CanvasTexture(c); })();
const fireDiscMat = new THREE.MeshBasicMaterial({ map: fireTex, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb03a, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
const flameGeo = new THREE.ConeGeometry(0.3, 1.3, 7), discGeo = new THREE.CircleGeometry(1, 20);
function throwMolotov() {
  const p = S.p, it = p.eq; if (!it || it.n <= 0) return;
  p.atkCd = 0.9; p.swing = 0.32; sfx('swish', 0.9);
  const fp = S.view === 'fp', o = fp ? camera.position.clone().add(new V3(0, -0.15, 0)) : p.chest(new V3());
  const pt = fp ? S.pitch : 0.25, d = new V3(-Math.sin(p.yaw) * Math.cos(pt), Math.sin(pt), -Math.cos(p.yaw) * Math.cos(pt));
  const m = meleeModel('molotov'); m.position.copy(o); scene.add(m);
  S.throws.push({ m, pos: o.clone().addScaledVector(d, 0.5), vel: d.multiplyScalar(13).add(new V3(0, 3.2, 0)), t: 0 });
  consume(it); if (!p.eq) { const nx = p.inv.find(o => o.id === 'molotov'); if (nx) p.eq = nx; } S.dirty = true;
}
function igniteAt(pos) {
  const g = new THREE.Group(); g.position.copy(pos); g.position.y = getH(pos.x, pos.z) + 0.04;
  const disc = new THREE.Mesh(discGeo, fireDiscMat.clone()); disc.rotation.x = -Math.PI / 2; disc.scale.setScalar(2.6); g.add(disc);
  const fl = []; for (let k = 0; k < 18; k++) { const f = new THREE.Mesh(flameGeo, flameMat.clone()); f.material.color.setHex(pick([0xffb03a, 0xff7a1a, 0xffd060])); const a = R(0, 6.28), r = Math.sqrt(R(0, 1)) * 2.1; f.position.set(Math.cos(a) * r, 0.4, Math.sin(a) * r); f.userData.ph = R(0, 6); g.add(f); fl.push(f); }
  scene.add(g); S.fires.push({ g, fl, disc, pos: g.position.clone(), t: 9, tick: 0 });
  sfxAt('shotgun', pos); burst(g.position.clone().setY(g.position.y + 0.5), 0xffa030, 20, 6, 0.7); emitNoise(pos, 45);
}
function updateFire(dt) {
  for (const th of S.throws.slice()) {
    th.t += dt; th.vel.y -= 14 * dt; th.pos.addScaledVector(th.vel, dt); th.m.position.copy(th.pos); th.m.rotation.x += dt * 12;
    let hit = th.pos.y <= getH(th.pos.x, th.pos.z) + 0.05 || th.t > 3;
    if (!hit) for (const z of S.zombies) if (z.alive && Math.hypot(z.pos.x - th.pos.x, z.pos.z - th.pos.z) < 0.5 && th.pos.y < z.pos.y + 1.9) { hit = true; break; }
    if (!hit && nearby(th.pos.x, th.pos.z, 0.5).size) for (const o of nearby(th.pos.x, th.pos.z, 0.5)) { if (th.pos.y < o.y0 || th.pos.y > o.y1) continue; if (o.t === 1 ? Math.hypot(th.pos.x - o.x, th.pos.z - o.z) < o.r : th.pos.x > o.x0 && th.pos.x < o.x1 && th.pos.z > o.z0 && th.pos.z < o.z1) { hit = true; th.pos.addScaledVector(th.vel, -dt * 2); break; } }
    if (hit) { scene.remove(th.m); S.throws.splice(S.throws.indexOf(th), 1); burst(th.pos.clone(), 0xcfe8f0, 8, 3, 0.4); igniteAt(th.pos); }
  }
  for (const f of S.fires.slice()) {
    f.t -= dt; f.tick -= dt; const k = Math.min(1, f.t / 1.5);
    for (const fl of f.fl) { const s = (0.7 + Math.sin(S.time * 14 + fl.userData.ph) * 0.3) * k; fl.scale.set(s, s * (0.8 + Math.sin(S.time * 9 + fl.userData.ph) * 0.4), s); fl.position.y = 0.6 * fl.scale.y; fl.material.opacity = 0.8 * k; }
    f.disc.material.opacity = 0.85 * k + Math.sin(S.time * 20) * 0.08; f.disc.rotation.z += dt * 0.3;
    if (Math.random() < dt * 20) burst(f.pos.clone().add(new V3(R(-2, 2), 0.6, R(-2, 2))), Math.random() < 0.5 ? 0xff6a1a : 0x4a4a4a, 1, 1.5, 0.6);
    if (f.tick <= 0) { f.tick = 0.5;
      for (const z of S.zombies) if (z.alive && Math.hypot(z.pos.x - f.pos.x, z.pos.z - f.pos.z) < 2.7) { hurtZombie(z, 13, f.pos, 0); z.stun = Math.max(z.stun, 0.15); }
      const p = S.p; if (p.alive && Math.hypot(p.pos.x - f.pos.x, p.pos.z - f.pos.z) < 2.4 && Math.abs(p.pos.y - f.pos.y) < 1.5) { hurtPlayer(6); msg('¡Te estás quemando!', 1); }
      for (const pc of S.built.slice()) if (BUILD[pc.type].mat === 'wood' && !BUILD[pc.type].floor && Math.hypot(pc.x - f.pos.x, pc.z - f.pos.z) < 2.6) { pc.hp -= 6; if (pc.hp <= 0) destroyPiece(pc); }
    }
    if (f.t <= 0) { scene.remove(f.g); S.fires.splice(S.fires.indexOf(f), 1); }
  }
}

// ---------- partida ----------
function clearWorld() {
  if (S.p) scene.remove(S.p.model);
  for (const z of S.zombies) { scene.remove(z.model); if (z.pool) scene.remove(z.pool); }
  for (const g of S.ground) scene.remove(g.mesh);
  for (const pc of S.built.slice()) destroyPiece(pc, true); S.built = []; for (const c of S.conts) if (c.gone) { c.gone = false; if (c.model) { c.model.visible = true; c.model.userData.gone = false; } if (c.box && BOXES.indexOf(c.box) < 0) { const b = c.box; BOXES.push(b); addToGrid(b, b.x0, b.z0, b.x1, b.z1); } }
  stopPlacing(); closeBuildMenu(); renderer.clippingPlanes = []; S.clipOn = false;
  if (S.npcs) for (const n of S.npcs) scene.remove(n.model); S.npcs = []; S.camp = null; if (S.talkOpen && typeof closeTalk === 'function') closeTalk();
  engineSound(false); S.drive = null; for (const c of S.cars) { scene.remove(c.mesh); carSolid(c, false); } S.cars = [];
  for (const t of S.throws) scene.remove(t.m); for (const f of S.fires) scene.remove(f.g); S.throws = []; S.fires = [];
  S.zombies = []; S.ground = []; S.kills = 0;
  if (S.roofHidden) for (const r of S.roofHidden.roof) { r.visible = true; r.userData.hidden = false; } S.roofHidden = null; S.houseIn = null;
}
function startGame(sv) {
  if (LOBBY.userData.fire) LOBBY.userData.fire.intensity = 0;
  clearWorld(); rand = mulberry32((Math.random() * 1e9) | 0);
  if (sv) { CR = Object.assign(CR, sv.cr); } else { deleteSave(); CR.name = ($('pname').value || '').trim() || 'Superviviente'; } try { localStorage.setItem('zm_char', JSON.stringify(CR)); } catch (e) { }
  const lk = crLook(CR); S.p = new Survivor(lk, CR.name); vmBuildArms(lk);
  // aparece dentro de una casa de un pueblo
  const towns = HOUSES.filter(h => POIS.some(q => q.type === 'town' && Math.hypot(h.cx - q.x, h.cz - q.z) < q.r + 5));
  if (typeof CITY !== 'undefined' && CITY.spawn) { S.p.pos.copy(CITY.spawn); } else { const h = pick(towns.length ? towns : HOUSES); S.p.pos.set(h.cx, h.y, h.cz); }
  S.p.yaw = 0; S.yaw = Math.PI / 2; S.pitch = -0.05;
  S.clock = 0; S.over = false; S.cards = 0;
  fillContainers();
  S.cdoors = [];
  if (typeof CITY !== 'undefined' && CITY.doors) for (const d of CITY.doors) { const r = rand(); let st = d.gate ? 'closed' : d.spawn ? 'closed' : d.generic ? (r < 0.35 ? 'open' : r < 0.75 ? 'closed' : r < 0.92 ? 'locked' : 'broken') : d.shop ? (r < 0.25 ? 'open' : r < 0.6 ? 'closed' : r < 0.85 ? 'locked' : 'broken') : (r < 0.1 ? 'open' : r < 0.4 ? 'closed' : r < 0.9 ? 'locked' : 'broken'); S.cdoors.push(makeCDoor(d, st)); }
  if (typeof CITY !== 'undefined' && CITY.matSpots && !sv) { const mats = ['plank', 'plank', 'plank', 'scrap', 'nails', 'plank', 'scrap']; CITY.matSpots.forEach(([x, z], i) => dropGround(i === 0 ? mk('hammer') : mk(mats[i % mats.length], mats[i % mats.length] === 'nails' ? RI(8, 16) : 1), x, z)); }
  for (const [x, z] of LOOT_SPOTS) if (rand() < 0.22) dropGround(rollItem('floor'), x, z);
  if (typeof CITY !== 'undefined') for (let i = 0; i < 40; i++) { const sp = pick(CITY.streetPts); dropGround(rollItem('floor'), sp[0] + R(-3, 3), sp[1] + R(-3, 3)); }
  if (sv) {
    S.clock = sv.clock; S.kills = sv.kills; S.lastHordeDay = sv.lhd || 0; S.campKnown = !!sv.ck; S.campVisited = !!sv.cv; S.smallHordeT = R(200, 320); S.cards = sv.cards || 0;
    const P = sv.p, p = S.p; p.pos.fromArray(P.pos); p.yaw = P.yaw; S.yaw = P.yaw; p.hp = P.hp; p.food = P.food; p.water = P.water; p.sta = P.sta; p.bleed = P.bleed; p.inv = P.inv; p.eq = P.eq >= 0 ? p.inv[P.eq] : null;
    for (const [i, items, gone] of sv.conts) { const c = S.conts[i]; if (!c || c.built) continue; c.items = items; c.searched = true; if (gone) { c.gone = true; if (c.model) { c.model.visible = false; c.model.userData.gone = true; } removeBox(c.box); } }
    for (const g of S.ground.slice()) removeGround(g);
    for (const [it, x, y, z] of sv.ground) dropGround(it, x, z, y);
    if (sv.doors && S.cdoors) sv.doors.forEach((st, i) => { const c = S.cdoors[i]; if (!c) return; if (st === 'b') { if (!c.broken) destroyPiece(c, true); S.cdoors[i] = { d: c.d, broken: true }; } else if (!c.broken) { setDoor(c, !!st[0]); c.locked = !!st[1]; c.hp = st[2]; } else { S.cdoors[i] = makeCDoor(c.d, st[0] ? 'open' : st[1] ? 'locked' : 'closed', st[2]); } });
    if (sv.cars) for (const [x, z, yw, f, h, col] of sv.cars) addCar(x, z, yw, f, h, col); else spawnCars();
    if (typeof spawnNPCs === 'function') spawnNPCs(sv.npcs || null);
    for (const b of sv.built) addPiece(b[0], b[1], b[2], b[4], b[3], b[5], b[6], b[7]);
    for (const [x, z, hp] of sv.zombies) { const zz = new Zombie(x, z); zz.hp = hp; S.zombies.push(zz); }
  } else {
    // mochila inicial: kit básico de superviviente
    const kit = [mk('bat'), mk('pistol'), mk('ammo9', 18), mk('water'), mk('water'), mk('beans'), mk('choco'), mk('bandage'), mk('bandage'), mk('rag'), mk('rag')];
    kit[0].dur = MELEE.bat.dur; kit[1].mag = GUNS.pistol.mag; for (const it of kit) addItem(S.p, it); S.p.eq = S.p.inv[0];
    S.lastHordeDay = 0; S.smallHordeT = R(260, 360);
    spawnZombies(S.zCount); spawnCars();
    S.campKnown = false; S.campVisited = false; S.track = null; S._qt = null; closeMap();
    if (typeof CITY !== 'undefined' && CITY.campSpot) { const c = CITY.campSpot, y = getH(c.x, c.z); addPiece('flag', c.x, c.z, 0, y); addPiece('campfire', c.x - 3, c.z - 5, 0, y); addPiece('bench', c.x + 7, c.z + 6, 0, y); addPiece('bed', c.x - 16, c.z - 2, 0, y); addPiece('bed', c.x - 13.5, c.z - 2, 0, y); addPiece('collector', c.x + 15, c.z - 9, 0, y); addPiece('garden', c.x - 4, c.z + 2.5, 0, y); for (const z of S.zombies) if (z.pos.x > c.X0 - 5 && z.pos.x < c.X1 + 5 && z.pos.z > c.Z0 - 5 && z.pos.z < c.Z1 + 5) z.pos.x += 40; }
    if (typeof spawnNPCs === 'function') spawnNPCs(null);
  }
  saveT = 5;
  S.phase = 'game'; S.camYaw = Math.PI / 4; S.camYawT = S.camYaw; S.zoom = IS_TOUCH ? 0.9 : 1;
  $('menu').classList.add('hidden'); $('end').classList.add('hidden'); $('hud').classList.remove('hidden'); if (IS_TOUCH) $('touch').classList.remove('hidden');
  if (preview) preview.root.visible = false;
  msg(sv ? `Día ${dayNum()} · ¡Bienvenido de vuelta, ${CR.name}!` : typeof CITY !== 'undefined' ? `Estás en La Orden del Friki. Habla con Xavi (${IS_TOUCH ? '✋' : 'E'}): tiene un plan.` : 'Busca comida y agua en las casas. Evita a los zombis.', 4.5);
  if (S.view === 'fp' && !IS_TOUCH) requestLock();
}
function toMenu() {
  if (S.drive) exitCarForce(); saveGame(); engineSound(false);
  if (document.pointerLockElement) document.exitPointerLock();
  clearWorld(); closeInv(); S.phase = 'menu'; S.p = null; VM.visible = false; updateLock();
  $('menu').classList.remove('hidden'); $('end').classList.add('hidden'); $('hud').classList.add('hidden'); $('touch').classList.add('hidden');
  if (preview) preview.root.visible = true; refreshContinue();
  renderer.toneMappingExposure = 1; envMats = null; setEnv(1); envCur = -1; for (const k of ['top', 'mid', 'bot']) SKY[k].value.copy(DAYC[k]); scene.fog.color.copy(DAYC.bot); scene.fog.near = 140; scene.fog.far = 520; sun.intensity = 1.35; sun.color.setRGB(1, 0.94, 0.85); hemi.intensity = 0.25; flashlight.visible = false; pLight.intensity = 0;
}
$('again').onclick = toMenu;
$('quit').onclick = () => { closeInv(); if (document.pointerLockElement) document.exitPointerLock(); $('confirm').classList.remove('hidden'); updateLock(); };
$('cno').onclick = () => { $('confirm').classList.add('hidden'); updateLock(); };
$('cyes').onclick = () => { $('confirm').classList.add('hidden'); toMenu(); };
function setView(v) { S.view = v; try { localStorage.setItem('zm_v', v === 'fp' ? 0 : 1); } catch (e) { } document.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('sel', +x.dataset.v === (v === 'fp' ? 0 : 1))); if (S.phase === 'game') { if (v === 'fp') { S.yaw = S.p.yaw; S.pitch = -0.05; requestLock(); } else if (document.pointerLockElement) document.exitPointerLock(); } updateLock(); }
$('play').onclick = () => { initAudio(); if (loadSave() && !confirmNew()) return; startGame(); };
$('cont').onclick = () => { initAudio(); const sv = loadSave(); if (sv) startGame(sv); };
function confirmNew() { return $('play').dataset.sure === '1' || ($('play').dataset.sure = '1', $('play').textContent = '¿BORRAR Y EMPEZAR?', setTimeout(() => { $('play').dataset.sure = ''; $('play').textContent = 'NUEVA PARTIDA'; }, 3000), false); }
function refreshContinue() { const sv = loadSave(); $('cont').classList.toggle('hidden', !sv); $('play').textContent = sv ? 'NUEVA PARTIDA' : 'SOBREVIVIR'; $('play').classList.toggle('small', !!sv); if (sv) $('cont').innerHTML = `CONTINUAR<small>${sv.cr.name} · día ${Math.floor((START_HOUR + sv.clock / DAY * 24) / 24) + 1}</small>`; }
function updateGame(dt) {
  S.clock += dt;
  if (typeof CITY !== 'undefined' && CITY.update) CITY.update(S.time, dt);
  if ((S.cullT = (S.cullT || 0) - dt) <= 0) { S.cullT = 0.5; const cp = camera.position; if (typeof CITY !== 'undefined' && CITY.cullTick) CITY.cullTick(cp); for (const g of S.ground) g.mesh.visible = Math.abs(g.pos.x - cp.x) + Math.abs(g.pos.z - cp.z) < 70; for (const b of S.built) b.mesh.visible = Math.abs(b.x - cp.x) + Math.abs(b.z - cp.z) < (b.city ? 80 : 160); for (const c of S.cars) c.mesh.visible = c === S.drive || Math.abs(c.pos.x - cp.x) + Math.abs(c.pos.z - cp.z) < 130; }
  respawnZombies(dt);
  saveT -= dt; if (saveT <= 0) { saveT = 20; saveGame(); }
  updatePlacing(); updateFire(dt); updateBase(dt); updateHordes(dt); if (typeof updateNPCs === 'function') updateNPCs(dt);
  updatePlayer(dt); animPlayer(S.p, dt);
  for (const z of S.zombies) updateZombie(z, dt);
  for (const g of S.ground) g.mesh.rotation.y += dt * 0.6;
  updateCamera(dt); updateDayNight(S.p.pos); updateHUD(dt);
}
function updateLobby(dt) {
  if (prevT > 0) { prevT -= dt; if (prevT <= 0) doPreview(); }
  const p = preview; if (!p) return;
  p.root.rotation.y = Math.PI + (S.prevRot || 0) + (S.prevDrag ? 0 : Math.sin(S.time * 0.4) * 0.15) - 0.25;
  const br = Math.sin(S.time * 2); p.P.body.position.y = (p.P.body.userData.y0 || 0.4) + br * 0.01; p.P.head.rotation.y = Math.sin(S.time * 0.7) * 0.25; p.P.aL.rotation.z = -0.1; p.P.aR.rotation.z = 0.1;
  p.P.eL.rotation.x = 0.12; p.P.eR.rotation.x = 0.12; p.P.kL.rotation.x = -0.03; p.P.kR.rotation.x = -0.08; p.P.lR.rotation.z = 0.04; p.P.body.rotation.z = Math.sin(S.time * 0.5) * 0.015;
  if (LOBBY.userData.flame) { for (const f of LOBBY.userData.flame.children) { const k = 0.75 + Math.sin(S.time * 13 + f.userData.ph) * 0.25; f.scale.set(k, k * (0.8 + Math.sin(S.time * 9 + f.userData.ph) * 0.4), k); f.position.y = 0.12 * f.scale.y + 0.05; } LOBBY.userData.fire.intensity = 1.3 + Math.sin(S.time * 11) * 0.3; }
  const narrow = innerWidth / innerHeight < 1, zf = S.prevZoom ? 1 : 0; S.prevZ = (S.prevZ ?? zf) + (zf - (S.prevZ ?? zf)) * Math.min(1, dt * 5);
  const zz = S.prevZ, ph = preview ? preview.h : 1.75, dist = lerp(4.4, 0.95, zz), hy = lerp(1.15, ph * 0.92 + 0.29, zz), off = narrow ? 0 : 1.1 * dist / 4.4;
  camera.position.set(LOBBY.position.x - off, LOBBY.position.y + hy + lerp(0.15, 0.02, zz), LOBBY.position.z + dist); camera.lookAt(LOBBY.position.x - off, LOBBY.position.y + hy, LOBBY.position.z);
  if (camera.fov !== 45) { camera.fov = 45; camera.updateProjectionMatrix(); }
  sun.target.position.copy(LOBBY.position); sun.position.copy(LOBBY.position).add(SUN_OFF.set(80, 140, 50));
}

// ---------- calidad y postproceso ----------
let composer = null;
function setupPost() {
  if (composer) return true;
  if (!THREE.EffectComposer || !THREE.UnrealBloomPass || !THREE.ShaderPass || !THREE.RenderPass) return false;
  try {
    const gl2 = renderer.capabilities.isWebGL2, sz = renderer.getDrawingBufferSize(new THREE.Vector2());
    const opts = { format: THREE.RGBAFormat, type: gl2 ? THREE.HalfFloatType : THREE.UnsignedByteType };
    const rt = gl2 && THREE.WebGLMultisampleRenderTarget ? new THREE.WebGLMultisampleRenderTarget(sz.x, sz.y, opts) : new THREE.WebGLRenderTarget(sz.x, sz.y, opts);
    if (rt.samples !== undefined) rt.samples = 4;
    const c = new THREE.EffectComposer(renderer, rt);
    c.addPass(new THREE.RenderPass(scene, camera));
    c.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.3, 0.5, 0.88));
    const gp = new THREE.ShaderPass({ uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv;\nvec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }\nvoid main(){ vec3 c = toSRGB(clamp(texture2D(tDiffuse, vUv).rgb, 0.0, 1.0)); float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, 0.82); c = (c - 0.5) * 1.08 + 0.5; c *= mix(vec3(0.92, 1.0, 0.98), vec3(1.04, 1.0, 0.92), smoothstep(0.2, 0.8, l)); vec2 q = vUv - 0.5; c *= 1.0 - dot(q, q) * 0.9; float n = fract(sin(dot(vUv * 913.7 + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453); c += (n - 0.5) * 0.035; gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0); }' }); c.addPass(gp); S.gradePass = gp;
    c.setPixelRatio(renderer.getPixelRatio()); c.setSize(innerWidth, innerHeight); composer = c; return true;
  } catch (e) { composer = null; return false; }
}
addEventListener('resize', () => { if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(innerWidth, innerHeight); } });
function setQuality(q) {
  S.quality = q; sun.castShadow = q >= 1;
  renderer.setPixelRatio(q === 0 ? (IS_TOUCH ? 0.85 : 1) : q === 1 ? Math.min(devicePixelRatio, IS_TOUCH ? 1.25 : 1.5) : Math.min(devicePixelRatio, IS_TOUCH ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight); clouds.visible = q >= 1 && typeof CITY === 'undefined'; for (const g of GRASS) g.visible = q >= 1;
  if (q === 2 && !setupPost()) S.quality = 1;
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(innerWidth, innerHeight); }
}
function initMenu() {
  buildCreator(); doPreview();
  const opt = (attr, fn, def) => { let v = def; try { const s = localStorage.getItem('zm_' + attr); if (s !== null) v = +s; } catch (e) { } document.querySelectorAll(`[data-${attr}]`).forEach(el => { el.classList.toggle('sel', +el.dataset[attr] === v); el.onclick = () => { document.querySelectorAll(`[data-${attr}]`).forEach(x => x.classList.remove('sel')); el.classList.add('sel'); fn(+el.dataset[attr]); try { localStorage.setItem('zm_' + attr, el.dataset[attr]); } catch (e) { } }; }); fn(v); };
  S.zCount = 150; opt('v', v => { S.view = v === 0 ? 'fp' : 'top'; }, 0); opt('q', v => setQuality(v), IS_TOUCH ? 1 : 2);
}
// bucle
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; S.time += dt;
  try {
    if (S.phase === 'menu') updateLobby(dt); else if (S.phase === 'game') updateGame(dt);
    updateFx(dt); WATER_NORMAL.offset.set(S.time * 0.012, S.time * 0.007); clouds.position.x = (S.time * 2) % 400; if (S.gradePass) S.gradePass.uniforms.uTime.value = S.time; GRASS_TIME.value = S.time;
  } catch (e) { console.error(e); }
  scene.userData.sky.position.copy(camera.position);
  if (S.quality === 2 && composer) composer.render(); else renderer.render(scene, camera);
}
initMenu(); refreshContinue();
{ const mn = $('menu'); let dx = null;
  mn.addEventListener('pointerdown', e => { if (e.target.closest('.mcol') || e.target.closest('button') || e.target.closest('#pzoom')) return; dx = e.clientX; S.prevDrag = true; });
  addEventListener('pointermove', e => { if (dx === null) return; S.prevRot = (S.prevRot || 0) + (e.clientX - dx) * 0.01; dx = e.clientX; });
  addEventListener('pointerup', () => { dx = null; S.prevDrag = false; });
  document.querySelectorAll('#pzoom [data-zoom]').forEach(b => b.onclick = () => { S.prevZoom = +b.dataset.zoom; document.querySelectorAll('#pzoom [data-zoom]').forEach(x => x.classList.toggle('sel', x === b)); });
}
requestAnimationFrame(loop);
window.__S = S; window.__step = (n, dt) => { for (let i = 0; i < n; i++) { S.time += dt; updateGame(dt); updateFx(dt); } };
