// ===== Personajes de La Orden Brawl en 3D =====
'use strict';
const LK = o => Object.assign({ skin: '#f6cfa8', eye: '#3a2418', hair: '#3a2618', style: 'short', hat: null, hatc: '#222222', hata: null, top: '#3a6ad8', trim: null, pants: '#34405e', shoes: '#3a2a24', shoea: null, pack: null, packa: null, beard: null, face: {} }, o);
const CHARS = [
  { id: 'xavi', name: 'Xavi', role: 'El tendero', emo: '🧢', desc: 'El dueño de La Orden. Gorra hacia atrás y mochila siempre a cuestas.', look: LK({ face: { brow: 'up', mouth: 'open' }, style: 'messy', hair: '#1c1410', hat: 'capback', hatc: '#1a1c28', hata: '#2a6ae8', top: '#1c1c26', trim: '#2a6ae8', pants: '#1e1e28', shoes: '#1e1e2a', shoea: '#2a6ae8', pack: '#1e2030', packa: '#2a6ae8', skin: '#eabf96' }) },
  { id: 'sara', name: 'Sara', role: 'La jefa de La Orden', emo: '👑', desc: 'Copropietaria de La Orden. Esperando a Olivia… y con muy malas pulgas.', look: LK({ face: { brow: 'up', mouth: 'smile' }, style: 'short', hair: '#7a4a2a', top: '#e86a8a', trim: '#ffffff', belly: true, pants: '#3a3a5a', shoes: '#ffffff', shoea: '#e86a8a', skin: '#f4d0b0', eye: '#5a3a24' }) },
  { id: 'xavo', name: 'Xavo', role: 'Top 8', emo: '🏆', desc: 'Cliente habitual y fijo en el Top 8. Rizos, barba y sudadera con zarpazo.', look: LK({ face: { brow: 'angry', mouth: 'grin' }, style: 'messy', curly: true, hair: '#1a1210', beard: '#1a1210', top: '#2c2c32', camo: '#4e4e56', claw: '#e8322a', trim: '#e8322a', pants: '#1e1e24', shoes: '#1a1a20', shoea: '#e8322a', skin: '#eec6a2', eye: '#3a2418' }) },
  { id: 'pelucas', name: 'Pelucas', role: 'El campeón Pokémon', emo: '🤗', desc: 'Campeón de la liga. Melena, gafas de sol, cadena… y abrazos para todos.', look: LK({ face: { brow: 'up', mouth: 'grin' }, style: 'long', manly: true, beard: '#2a1a14', hair: '#2a1a14', top: '#3a3a40', print: '#e8e8ec', chain: true, sleeveless: true, spikes: true, glasses: '#141218', mous: '#2a1a14', ring: true, pants: '#2a2a30', shoes: '#1a1a20', skin: '#f0caa8', eye: '#5a3a24' }) },
  { id: 'geri', name: 'Geri', role: 'Defestamínico', emo: '🌀', desc: 'Rubio, con gafas y siempre con una peonza en el bolsillo.', look: LK({ face: { brow: 'angry', mouth: 'teeth' }, style: 'short', hair: '#e8c46a', glasses: '#2a2a34', top: '#3a6ad8', trim: '#ffd23a', pants: '#2a3048', shoes: '#ffffff', shoea: '#3a6ad8', skin: '#f6d2b0', eye: '#3a6aa8' }) },
  { id: 'dani', name: 'Dani', role: 'Tóxico', emo: '☠️', desc: 'Mirada de pillo y sonrisa torcida. Juega sucio y se nota.', look: LK({ face: { brow: 'sly', mouth: 'smirk' }, style: 'short', hair: '#141016', glasses: '#1a1a22', top: '#2a3a24', trim: '#7ad84a', pants: '#22262a', shoes: '#1a1a1e', shoea: '#7ad84a', skin: '#f0c8a4' }) },
  { id: 'lazuli', name: 'Lazuli', role: 'El Tritones', emo: '🔱', desc: 'Rizos castaños, gafas y una ola de buen rollo… hasta que dispara.', look: LK({ face: { brow: 'happy', mouth: 'open' }, style: 'messy', curly: true, hair: '#6a4428', glasses: '#2a2a34', top: '#1e4a8a', trim: '#7ad0ff', pants: '#22304a', shoes: '#1a1e2a', shoea: '#7ad0ff', skin: '#f2cca8' }) },
  { id: 'victhor', name: 'Victhor', role: 'El que juega a todo', emo: '🎲', desc: 'Pequeño, rápido y con estilo: gorra, tatuajes y anillo.', small: true, look: LK({ face: { brow: 'flat', mouth: 'smirk' }, style: 'short', hair: '#1c1418', hat: 'capback', hatc: '#e8e8ec', hata: '#ff4d8a', top: '#141418', trim: '#ff4d8a', short: true, tattoo: true, ring: true, pants: '#3a3a44', shoes: '#ffffff', shoea: '#ff4d8a', skin: '#f0c4a0' }) },
  { id: 'alex', name: 'Alex', role: 'El del casino', emo: '🎰', desc: 'Traje negro, gafas y diente de oro. Siempre va all in.', look: LK({ face: { brow: 'sly', mouth: 'grin', goldTooth: true }, style: 'short', hair: '#141016', glasses: '#1a1a22', top: '#1a1a22', trim: '#ffbf3c', pants: '#22222a', shoes: '#1a1a1e', shoea: '#ffbf3c', skin: '#9a6a46', eye: '#2a1a10' }) },
  { id: 'joker', name: 'Joker', role: 'Chilvi · el mecánico', emo: '🔧', desc: 'Pelo blanco de punta y mono de taller. Arregla motos y rompe rivales.', look: LK({ face: { brow: 'angry', mouth: 'teeth' }, style: 'spiky', hair: '#eef0f6', top: '#3a4e6a', trim: '#ff9a2a', short: true, pants: '#3a4e6a', shoes: '#1a1a20', shoea: '#ff9a2a', skin: '#f0c8a6', eye: '#3a6aa8', pack: '#5a4a3a', packa: '#ff9a2a' }) },
  { id: 'john', name: 'John', role: 'El papá del carrito', emo: '🍼', desc: 'Papá a tiempo completo. Tranquilo… hasta que le tocan el carrito.', look: LK({ face: { brow: 'up', mouth: 'smile' }, style: 'short', hair: '#141016', skin: '#b07a50', eye: '#2a1a10', top: '#2a9a8a', trim: '#ffffff', pants: '#2a2a3a', shoes: '#ffffff', shoea: '#2a9a8a' }) },
  { id: 'lamine', name: 'Lamine Pajal', role: 'El niño prodigio', emo: '⚽', desc: 'Gafas, bigotillo y mochila. El crack de la tienda.', look: LK({ face: { brow: 'flat', mouth: 'smirk' }, style: 'messy', hair: '#3a2418', glasses: '#1a2244', stubble: true, mous: '#3a2418', top: '#9ab4cc', trim: '#7a94ac', pants: '#2a2e3a', shoes: '#1a1a22', shoea: '#ffffff', pack: '#1a1a22', packa: '#c8a050', skin: '#f4d2b4', eye: '#4a5a6a' }) },
  { id: 'cabrera', name: 'Dani Cabrera', role: 'El del súper', emo: '🛒', desc: 'Uniforme verde del súper y gorra hacia atrás. Aguanta lo que le echen.', look: LK({ face: { brow: 'up', mouth: 'smile' }, style: 'short', hair: '#3a2a1e', stubble: true, hat: 'capback', hatc: '#2a9a4a', hata: '#ffffff', top: '#2a9a4a', trim: '#ffffff', pants: '#2a2a34', shoes: '#1a1a22', shoea: '#2a9a4a', skin: '#e8c09a', eye: '#3a2a1e' }) },
  { id: 'lucas', name: 'Lucas', role: 'El estudiante modelo', emo: '📚', desc: 'Jersey azul, gafas y mochila roja. Saca un 10 en puntería.', look: LK({ face: { brow: 'up', mouth: 'smile' }, style: 'short', hair: '#4a2e1e', glasses: '#1a1a22', sweater: true, top: '#2a3a7a', trim: '#ffffff', pants: '#5a5a6a', shoes: '#3a2414', shoea: '#ffffff', pack: '#c83a3a', packa: '#ffd23a', skin: '#f4d2b4', eye: '#3a6a3a' }) },
  { id: 'mario', name: 'Mario', role: 'El rubito de los rizos', emo: '✨', desc: 'Rizos rubios y camiseta roja. El más rápido de gatillo.', look: LK({ face: { brow: 'sly', mouth: 'grin' }, style: 'short', curly: true, hair: '#f0c850', top: '#e84a5a', trim: '#ffffff', pants: '#3a5a8a', shoes: '#ffffff', shoea: '#e84a5a', skin: '#f6d6b8', eye: '#3a7ad0' }) },
  { id: 'olivia', name: 'Olivia', role: 'La bebé de La Orden', emo: '🎀', desc: 'Pelele rosa con lunares, lazo y chupete. Pequeña y muy difícil de acertar.', baby: true, look: LK({ skin: '#f8d6bc', hair: '#9a6a42', top: '#ffb0d8', pants: '#ffb0d8', shoes: '#ffb0d8', eye: '#4a7ac8', face: { brow: 'up', mouth: 'smile' }, dots: '#ffffff', bow: '#ff4d8a', paci: '#7ad8ff' }) },
  { id: 'thor', name: 'Thor', role: 'El perro de La Orden', emo: '🐕', desc: 'El perro de la tienda: negro, pecho blanco y arnés azul. El más rápido.', dog: true },
];

// ---------- personajes estilo dibujo (chibi como La Orden Brawl) ----------
const HR = 0.42; // radio de la cabeza
const FRONT = Math.PI * 1.5;
function strHash(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function shadeHex(hex, k) { const c = new THREE.Color(hex); c.multiplyScalar(k); return c; }
const cm = c => toon(c), um = c => basic(c);
// punto sobre la superficie de la cabeza (centro 0,0,0)
function hp(theta, phi, rr = HR) { return new THREE.Vector3(-rr * Math.sin(theta) * Math.cos(phi), rr * Math.cos(theta), rr * Math.sin(theta) * Math.sin(phi)); }
function surfZ(x, y, rr = HR) { return -Math.sqrt(Math.max(0, rr * rr - x * x - y * y)); }

function addHair(head, L, def, rnd) {
  const hm = cm(L.hair), RR = (a, b) => a + (b - a) * rnd();
  const shell = (r, ps, pl, ts, tl) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 30, 16, ps, pl, ts, tl), hm); head.add(m); return m; };
  const blob = (p, r, sx = 1, sy = 1, sz = 1) => { const m = sph(r, hm, p.x, p.y, p.z, head, 12, 10); m.scale.set(sx, sy, sz); return m; };
  const spike = (theta, phi, len, rad, rr = HR) => { const p = hp(theta, phi, rr), n = p.clone().normalize(); const c = new THREE.Mesh(new THREE.ConeGeometry(rad, len, 8), hm); c.position.copy(p).addScaledVector(n, len * 0.3); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n.clone().add(new THREE.Vector3(RR(-0.15, 0.15), RR(0, 0.25), RR(-0.15, 0.15))).normalize()); head.add(c); return c; };
  const style = def.baby ? 'baby' : L.curly ? 'curly' : L.style, capped = L.hat === 'capback';
  if (style === 'baby') { shell(HR * 1.02, 0, Math.PI * 2, 0, 0.75); const c = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.025, 8, 14, Math.PI * 1.6), hm); c.position.set(0, HR + 0.04, -0.08); c.rotation.y = Math.PI / 2; head.add(c); return; }
  if (style === 'bald') return;
  const R1 = HR * 1.06;
  if (!capped) shell(R1, 0, Math.PI * 2, 0, 1.12);           // casquete
  shell(R1, 0.15, Math.PI - 0.3, 0.9, style === 'long' ? 1.6 : 1.15); // nuca
  for (const sx of [-1, 1]) shell(R1 * 0.995, sx < 0 ? -0.55 : Math.PI - 0.55, 1.1, 1.0, 0.72); // laterales hasta las sienes
  if (!capped && style !== 'spiky') { const fr = shell(R1 * 1.005, FRONT - 1.0, 2.0, 0.85, 0.38); } // flequillo
  if (!capped && (style === 'short' || style === 'messy' || style === 'long')) { // mechón de flequillo de dibujo
    const t1 = blob(hp(1.12, FRONT - 0.35, R1), 0.11, 1.5, 0.55, 0.7); t1.rotation.z = 0.5;
    const t2 = blob(hp(1.08, FRONT + 0.3, R1), 0.1, 1.4, 0.5, 0.7); t2.rotation.z = -0.35;
  }
  if (style === 'messy' && !capped) { for (let i = 0; i < 7; i++) spike(RR(0.1, 0.7), RR(0.2, Math.PI - 0.2) * (i % 3 === 0 ? -1 : 1) + (i % 3 === 0 ? 0 : 0), RR(0.14, 0.2), RR(0.08, 0.1), R1); }
  if (style === 'curly') {
    const n = 34; for (let i = 0; i < n; i++) { const th = Math.acos(1 - (i + 0.5) / n * 1.55), ph = i * 2.399; if (capped && th < 1.05) continue; if (Math.sin(ph) < -0.6 && th > 1.0) continue; blob(hp(th, ph, HR * 1.1), RR(0.1, 0.13)); }
  }
  if (style === 'long') {
    rbox(0.72, 0.62, 0.2, hm, 0, -0.22, 0.28, head, 0.09);
    for (const sx of [-1, 1]) { const lk = rbox(0.13, 0.56, 0.22, hm, sx * 0.41, -0.2, -0.02, head, 0.06); lk.rotation.z = sx * 0.05; }
  }
  if (style === 'spiky') { for (let i = 0; i < 11; i++) spike(RR(0.2, 1.0), i / 11 * Math.PI * 2, RR(0.3, 0.4), RR(0.09, 0.11), R1); spike(0.02, 0, 0.42, 0.12, R1); for (let i = 0; i < 4; i++) spike(1.02, FRONT - 0.6 + i * 0.4, 0.24, 0.07, R1); }
}

function buildChar(def) {
  if (def.dog) return buildDog(def);
  const L = def.look, F = L.face || {}, rnd = mulberry32(strHash(def.id));
  const root = new THREE.Group(), rig = new THREE.Group(); root.add(rig);
  const P = {}, W = L.manly ? 1.12 : 1;
  const skin = cm(L.skin), top = cm(L.top), pants = cm(L.pants), shoes = cm(L.shoes), trimC = L.trim || shadeHex(L.top, 0.6).getHex(), trim = cm(trimC);
  // ----- piernas -----
  for (const s of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(s * 0.125, 0.42, 0); rig.add(leg);
    lathe([[0, 0.03], [0.088, 0.01], [0.092, -0.1], [0.084, -0.26], [0, -0.29]], pants, 0, 0, 0, leg, 14);
    const sh = sph(1, shoes, 0, -0.32, -0.035, leg, 18, 12); sh.scale.set(0.125, 0.09, 0.165);
    const so = sph(1, cm(L.shoea || '#f2f2f2'), 0, -0.37, -0.035, leg, 18, 10); so.scale.set(0.13, 0.045, 0.17);
    P[s < 0 ? 'lL' : 'lR'] = leg;
  }
  // ----- cuerpo -----
  const body = new THREE.Group(); body.position.y = 0.4; rig.add(body); P.body = body;
  const TOR = [[0, -0.07], [0.22, -0.06], [0.27, 0.03], [0.285, 0.18], [0.272, 0.36], [0.21, 0.48], [0.09, 0.53], [0, 0.54]], DZ = 0.84;
  const tR = y => { for (let i = 1; i < TOR.length; i++) { const a0 = TOR[i - 1], a1 = TOR[i]; if (y <= a1[1]) return lerp(a0[0], a1[0], (y - a0[1]) / (a1[1] - a0[1] || 1)); } return 0; };
  const tor = lathe(TOR, top, 0, 0, 0, body, 26); tor.scale.set(W, 1, DZ);
  const pl = lathe([[0, -0.09], [0.232, -0.08], [0.278, 0.0], [0.285, 0.1], [0, 0.11]], pants, 0, 0, 0, body, 26); pl.scale.set(W * 1.01, 1, DZ * 1.01);
  // tira frontal (cremallera) que sigue la curva
  const strip = (pts, m, phi0, phiL, off = 0.006) => { const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0] + off, p[1])), 3, phi0, phiL); g.computeVertexNormals(); const me = new THREE.Mesh(g, m); me.scale.set(W, 1, DZ); body.add(me); return me; };
  const zipPts = TOR.slice(2, 6).map(p => [p[0], p[1]]); zipPts[0] = [tR(0.12), 0.12];
  const front = Math.PI;
  if (!def.baby && !L.belly) strip(zipPts, trim, front - 0.07, 0.14);
  // dobladillo y cuello
  strip([[tR(0.1), 0.1], [tR(0.15), 0.15]], cm(shadeHex(L.top, 0.72).getHex()), 0, Math.PI * 2, 0.004);
  const col = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 22), trim); col.rotation.x = Math.PI / 2; col.position.y = 0.5; body.add(col);
  if (!def.baby && !L.sleeveless) for (const sx of [-1, 1]) { const d = cyl(0.012, 0.012, 0.1, 6, cm('#f4f4f4'), sx * 0.05, 0.42, -tR(0.42) * DZ - 0.01, body); d.rotation.x = 0.15; }
  // estampados
  const onT = (x, y, sx, sy, m, rz = 0) => { const d = sph(1, m, x, y, -Math.sqrt(Math.max(0, tR(y) * tR(y) - x * x / (W * W))) * DZ - 0.002, body, 12, 8); d.scale.set(sx, sy, 0.012); d.rotation.z = rz; return d; };
  if (L.claw) for (let i = -1; i <= 1; i++) onT(0.1 + i * 0.045, 0.27, 0.013, 0.09, cm(L.claw), 0.35);
  if (L.camo) { const c2 = cm(L.camo); onT(-0.14, 0.32, 0.06, 0.04, c2, 0.4); onT(0.15, 0.18, 0.05, 0.035, c2, -0.3); onT(-0.12, 0.12, 0.04, 0.03, c2); onT(0.16, 0.36, 0.045, 0.03, c2); }
  if (L.print) { onT(0, 0.25, 0.1, 0.1, cm(L.print)); onT(0, 0.25, 0.06, 0.06, top); }
  if (L.sweater) { for (let i = 0; i < 5; i++) onT(-0.16 + i * 0.08, 0.2 + (i % 2) * 0.04, 0.03, 0.03, cm('#ffd23a'), Math.PI / 4); onT(0, 0.42, 0.07, 0.07, cm('#ffffff'), Math.PI / 4); }
  if (L.belly) { const b = sph(0.22, top, 0, 0.2, -0.13, body, 20, 14); b.scale.set(1, 0.95, 0.85); const hz = sph(1, cm('#ffffff'), 0, 0.22, -0.335, body, 12, 8); hz.scale.set(0.07, 0.06, 0.012); }
  if (L.blood) for (let i = 0; i < 7; i++) onT((rnd() - 0.5) * 0.4, 0.04 + rnd() * 0.4, 0.02 + rnd() * 0.04, 0.02 + rnd() * 0.05, cm(L.blood), rnd() * 3);
  if (def.baby) for (let i = 0; i < 9; i++) onT((rnd() - 0.5) * 0.36, 0.05 + rnd() * 0.38, 0.022, 0.022, cm(L.dots));
  if (L.chain) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 6, 22), cm('#ffcf3a')); c.rotation.x = Math.PI / 2 + 0.6; c.position.set(0, 0.43, -0.1); body.add(c); }
  if (L.pack) { rbox(0.38, 0.4, 0.18, cm(L.pack), 0, 0.26, 0.28, body, 0.08); if (L.packa) rbox(0.4, 0.06, 0.19, cm(L.packa), 0, 0.3, 0.28, body, 0.025); }
  // ----- brazos -----
  const upM = L.sleeveless ? skin : top;
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * 0.31 * W, 0.42, 0); body.add(arm);
    if (L.short) { lathe([[0, 0.07], [0.08, 0.05], [0.085, -0.02], [0.08, -0.12], [0, -0.13]], top, 0, 0, 0, arm, 14); lathe([[0, -0.08], [0.066, -0.09], [0.064, -0.22], [0.058, -0.27], [0, -0.28]], skin, 0, 0, 0, arm, 12); }
    else { lathe([[0, 0.07], [0.074, 0.05], [0.078, -0.03], [0.07, -0.22], [0.064, -0.27], [0, -0.28]], upM, 0, 0, 0, arm, 14); if (!L.sleeveless) { const cf = new THREE.Mesh(new THREE.TorusGeometry(0.064, 0.022, 6, 14), trim); cf.rotation.x = Math.PI / 2; cf.position.y = -0.255; arm.add(cf); } }
    if (L.tattoo && s > 0) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.012, 5, 14), cm('#2f3352')); t.rotation.x = Math.PI / 2; t.position.y = -0.18; arm.add(t); }
    if (L.spikes) { const bd = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.024, 6, 14), cm('#141218')); bd.rotation.x = Math.PI / 2; bd.position.y = -0.24; arm.add(bd); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; sph(0.02, cm('#d8d8e0'), Math.cos(a) * 0.09, -0.24, Math.sin(a) * 0.09, arm, 6, 4); } }
    sph(0.085, skin, 0, -0.33, 0, arm, 14, 10);
    if (L.ring && s > 0) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 6, 10), cm('#ffcf3a')); r.position.set(0, -0.36, -0.06); arm.add(r); }
    P[s < 0 ? 'aL' : 'aR'] = arm;
  }
  const hand = new THREE.Group(); hand.position.set(0, -0.33, 0); P.aR.add(hand); P.hand = hand;
  // ----- cabeza -----
  const head = new THREE.Group(); head.position.y = 0.9; body.add(head); P.head = head;
  const hd = sph(HR, skin, 0, 0, 0, head, 32, 24); hd.scale.set(1.04, 0.98, 0.98);
  for (const s of [-1, 1]) { const e = sph(0.075, skin, s * 0.43, -0.02, 0.0, head, 12, 8); e.scale.set(0.55, 1, 0.85); sph(0.035, cm(shadeHex(L.skin, 0.8).getHex()), s * 0.455, -0.02, -0.01, head, 8, 6); }
  // ojos grandes de dibujo
  const ey = 0.02, ex = 0.15;
  for (const s of [-1, 1]) {
    const x = s * ex, z = surfZ(x * 0.96, ey);
    const sc = sph(1, um(L.sclera || '#ffffff'), x, ey, z + 0.035, head, 18, 14); sc.scale.set(0.085, 0.11, 0.05);
    const ir = sph(1, um(L.eye), x + s * 0.004, ey - 0.008, z - 0.008, head, 16, 12); ir.scale.set(0.058, 0.074, 0.02);
    const ir2 = sph(1, um(shadeHex(L.eye, 0.55).getHex()), x + s * 0.004, ey + 0.012, z - 0.011, head, 14, 10); ir2.scale.set(0.05, 0.04, 0.012);
    const pu = sph(1, um('#0a0810'), x + s * 0.004, ey - 0.008, z - 0.014, head, 12, 8); pu.scale.set(0.03, 0.038, 0.012);
    const h1 = sph(1, um('#ffffff'), x - 0.02, ey + 0.03, z - 0.02, head, 8, 6); h1.scale.set(0.02, 0.022, 0.01);
    const h2 = sph(1, um('#ffffff'), x + 0.018, ey - 0.03, z - 0.02, head, 6, 4); h2.scale.set(0.01, 0.01, 0.008);
    // línea del párpado (pestaña de dibujo)
    const lid = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.013, 5, 16, Math.PI * 0.9), um('#2a1a16')); lid.position.set(x, ey + 0.005, z - 0.008); lid.rotation.z = Math.PI * 0.05; lid.scale.set(1, 1.18, 0.4); head.add(lid);
    if (F.brow === 'sly' || F.brow === 'flat' || F.lids) { const ld = sph(1, skin, x, ey + 0.06, z + 0.01, head, 14, 8); ld.scale.set(0.095, 0.06, 0.05); }
    if (def.id === 'sara' || def.baby) for (let k = 0; k < 2; k++) { const ls = rbox(0.012, 0.04, 0.008, um('#2a1a16'), x + s * (0.08 + k * 0.015), ey + 0.07 - k * 0.03, z + 0.005, head, 0.004); ls.rotation.z = -s * (0.9 + k * 0.4); }
    // ceja
    const br = new THREE.Mesh(new THREE.TorusGeometry(0.075, L.manly ? 0.02 : 0.016, 5, 12, Math.PI * 0.55), um(L.beard || L.hair)); br.position.set(x, ey + 0.11, z - 0.0); br.rotation.z = Math.PI * 0.22; br.scale.set(1, 0.55, 0.4); head.add(br);
    const t = F.brow; br.rotation.z += t === 'angry' ? s * 0.45 : t === 'sly' ? (s > 0 ? -0.35 : 0.15) : (t === 'up' || t === 'happy') ? -s * 0.12 : 0; if (t === 'up' || t === 'happy') br.position.y += 0.015;
    // mofletes
    const ck = sph(1, cm('#ff9aa0'), s * 0.25, -0.1, surfZ(s * 0.25, -0.1) + 0.012, head, 12, 8); ck.scale.set(0.055, 0.035, 0.012);
  }
  const nose = sph(0.032, cm(shadeHex(L.skin, 0.92).getHex()), 0, -0.06, surfZ(0, -0.06) - 0.012, head, 10, 8); nose.scale.set(1.2, 0.9, 1);
  // boca
  const mz = surfZ(0, -0.17) - 0.004, mo = F.mouth;
  if (mo === 'open' || mo === 'teeth' || mo === 'grin') {
    const w = mo === 'grin' ? 0.085 : 0.07;
    const mg = new THREE.CircleGeometry(w, 20, Math.PI, Math.PI); const m = new THREE.Mesh(mg, um('#7a1f2b')); m.position.set(0, -0.15, mz); m.rotation.y = Math.PI; m.scale.y = mo === 'grin' ? 0.8 : 1.05; head.add(m);
    const th = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.6, 0.022), um('#ffffff')); th.position.set(0, -0.161, mz - 0.002); th.rotation.y = Math.PI; head.add(th);
    if (mo !== 'grin') { const tg = new THREE.Mesh(new THREE.CircleGeometry(w * 0.55, 14, 0, Math.PI), um('#ff6f86')); tg.position.set(0, -0.15 - w * 0.95, mz - 0.003); tg.rotation.y = Math.PI; tg.scale.y = 0.6; head.add(tg); }
    if (F.goldTooth) { const gt = new THREE.Mesh(new THREE.PlaneGeometry(0.022, 0.024), um('#ffcf3a')); gt.position.set(0.025, -0.162, mz - 0.004); gt.rotation.y = Math.PI; head.add(gt); }
  } else if (mo === 'smirk') { const m = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.011, 5, 12, Math.PI * 0.7), um('#5a1a24')); m.position.set(0.02, -0.14, mz); m.rotation.z = Math.PI * 1.25; head.add(m); }
  else { const m = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 5, 12, Math.PI * 0.8), um('#5a1a24')); m.position.set(0, -0.12, mz); m.rotation.z = Math.PI * 1.1; head.add(m); }
  // vello facial
  if (L.beard) {
    const bm = cm(L.beard), big = def.id === 'pelucas';
    const b = new THREE.Mesh(new THREE.SphereGeometry(HR * 1.05, 28, 16, 0, Math.PI * 2, Math.PI * (big ? 0.5 : 0.56), Math.PI * 0.44), bm); b.position.y = big ? 0.0 : -0.01; head.add(b);
    if (big) { const b2 = sph(0.3, bm, 0, -0.38, -0.12, head, 18, 12); b2.scale.set(1.2, 0.9, 0.8); }
    else { const b2 = sph(0.22, bm, 0, -0.3, -0.12, head, 16, 12); b2.scale.set(1.15, 0.7, 0.7); }
  }
  if (L.stubble) { const st = new THREE.Mesh(new THREE.SphereGeometry(HR * 1.006, 26, 14, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.3), cm(new THREE.Color(L.skin).lerp(new THREE.Color(L.hair), 0.22).getHex())); head.add(st); }
  if (L.mous) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 14, Math.PI), cm(L.mous)); m.position.set(0, -0.11, surfZ(0, -0.11) - 0.012); m.scale.set(1.15, 0.55, 0.5); head.add(m); }
  // gafas
  if (L.glasses) {
    const gm = um(L.glasses);
    for (const s of [-1, 1]) {
      const x = s * ex, z = surfZ(x * 0.96, ey) - 0.04;
      const f = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.016, 6, 22), gm); f.position.set(x, ey, z); head.add(f);
      if (def.id === 'pelucas' || L.shades) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.1, 22), um('#141218')); l.position.set(x, ey, z + 0.002); l.rotation.y = Math.PI; head.add(l); }
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.13), um('#ffffff')); gl.position.set(x + 0.03, ey + 0.01, z - 0.004); gl.rotation.set(0, Math.PI, 0.6); head.add(gl);
      const tp = rbox(0.016, 0.016, 0.32, gm, s * 0.29, ey + 0.03, -0.18, head, 0.006); tp.rotation.y = s * 0.25;
    }
    rbox(0.08, 0.016, 0.016, gm, 0, ey + 0.03, surfZ(0, ey) - 0.04, head, 0.006);
  }
  addHair(head, L, def, rnd);
  if (L.hat === 'capback') {
    const hc = cm(L.hatc), ha = L.hata ? cm(L.hata) : hc;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(HR * 1.08, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hc); dome.position.y = 0.04; dome.scale.y = 0.9; head.add(dome);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(HR * 1.08, HR * 1.08, 0.07, 28, 1, true), hc); band.position.y = 0.04; head.add(band);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.035, 22, 1, false, -Math.PI / 2, Math.PI), ha); brim.position.set(0, 0.03, 0.4); brim.scale.set(1.15, 1, 1.2); brim.rotation.x = -0.1; head.add(brim);
    sph(0.04, ha, 0, HR * 1.08 * 0.9 + 0.05, 0, head, 10, 8);
    rbox(0.14, 0.05, 0.03, ha, 0, 0.07, 0.45, head, 0.012);
  }
  if (def.baby) {
    const bw = cm(L.bow); for (const s of [-1, 1]) { const b = sph(0.1, bw, s * 0.12, HR + 0.02, -0.06, head, 12, 10); b.scale.set(1.3, 0.8, 0.6); } sph(0.055, bw, 0, HR + 0.02, -0.06, head, 10, 8);
    const pc = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 18), cm(L.paci)); pc.rotation.x = Math.PI / 2; pc.position.set(0, -0.16, surfZ(0, -0.16) - 0.015); head.add(pc);
    const pr = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.013, 6, 12), cm('#ff6aa8')); pr.position.set(0, -0.18, surfZ(0, -0.16) - 0.045); head.add(pr);
  }
  bakeChar(root, [P.lL, P.lR, body, P.aL, P.aR, head]);
  P.rig = rig;
  let k = 1; if (def.small) k = 0.88; if (def.baby) k = 0.72;
  rig.scale.setScalar(k);
  return { root, P, h: 1.78 * k, eye: 1.34 * k, r: 0.42 * k, headY: 1.3 * k, headR: 0.44 * k, dog: false };
}
function buildDog(def) {
  const root = new THREE.Group(), P = {}, fur = cm('#2a2732'), wh = cm('#f6f2ec'), har = cm('#2ab8d0');
  const body = new THREE.Group(); body.position.y = 0.48; root.add(body); P.body = body;
  const t = sph(0.27, fur, 0, 0, 0.05, body, 22, 16); t.scale.set(0.95, 0.85, 1.4);
  const ch = sph(0.2, wh, 0, -0.06, -0.2, body, 18, 12); ch.scale.set(0.9, 0.9, 0.8);
  for (const z of [-0.12, 0.14]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.045, 8, 24), har); h.position.z = z; body.add(h); }
  const tag = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 14), cm('#ffcf3a')); tag.rotation.x = Math.PI / 2; tag.position.set(0, -0.12, -0.34); body.add(tag);
  const legs = [];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new THREE.Group(); l.position.set(sx * 0.14, -0.1, sz * 0.24); body.add(l); lathe([[0, 0.06], [0.075, 0.04], [0.07, -0.18], [0, -0.24]], fur, 0, 0, 0, l, 12); const pw = sph(0.075, wh, 0, -0.27, -0.02, l, 12, 8); pw.scale.set(1, 0.6, 1.25); legs.push(l); }
  P.legs = legs;
  const head = new THREE.Group(); head.position.set(0, 0.3, -0.32); body.add(head); P.head = head;
  const sk = sph(0.3, fur, 0, 0.08, 0, head, 26, 20);
  const mz = sph(0.16, wh, 0, -0.04, -0.22, head, 18, 12); mz.scale.set(1, 0.75, 1);
  const bl = sph(0.07, wh, 0, 0.22, -0.24, head, 10, 8); bl.scale.set(0.8, 1.5, 0.5);
  const ns = sph(0.055, um('#141014'), 0, 0.03, -0.37, head, 12, 8); ns.scale.set(1.2, 0.8, 0.8); sph(0.014, um('#ffffff'), -0.015, 0.045, -0.41, head, 6, 4);
  const mo = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16, Math.PI, Math.PI), um('#7a1f2b')); mo.position.set(0, -0.08, -0.37); mo.rotation.y = Math.PI; head.add(mo);
  const tg = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12, Math.PI, Math.PI), um('#ff6f86')); tg.position.set(0, -0.12, -0.372); tg.rotation.y = Math.PI; head.add(tg);
  for (const s of [-1, 1]) {
    const x = s * 0.12, z = -0.24;
    const sc = sph(1, um('#ffffff'), x, 0.15, z, head, 16, 12); sc.scale.set(0.07, 0.085, 0.04);
    const ir = sph(1, um('#3ab8f0'), x, 0.145, z - 0.03, head, 14, 10); ir.scale.set(0.05, 0.06, 0.015);
    const pu = sph(1, um('#0a0810'), x, 0.145, z - 0.04, head, 10, 8); pu.scale.set(0.026, 0.032, 0.01);
    const h1 = sph(1, um('#ffffff'), x - 0.018, 0.17, z - 0.046, head, 6, 4); h1.scale.set(0.016, 0.018, 0.008);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 4), fur); ear.position.set(s * 0.19, 0.36, 0.02); ear.rotation.set(0.1, Math.PI / 4, s * 0.3); ear.scale.z = 0.5; head.add(ear);
    const inn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 4), cm('#d99a9a')); inn.position.set(s * 0.188, 0.35, -0.012); inn.rotation.set(0.1, Math.PI / 4, s * 0.3); inn.scale.z = 0.3; head.add(inn);
  }
  const tail = new THREE.Group(); tail.position.set(0, 0.1, 0.4); body.add(tail); const tl = lathe([[0, 0], [0.05, -0.02], [0.04, -0.18], [0, -0.3]], fur, 0, 0, 0, tail, 10); tl.rotation.x = -Math.PI / 2; tail.rotation.x = -0.7; P.tail = tail;
  const hand = new THREE.Group(); hand.position.set(0.05, -0.08, -0.36); head.add(hand); P.hand = hand;
  bakeChar(root, [body, head, tail, ...legs]);
  return { root, P, h: 1.15, eye: 1.0, r: 0.4, headY: 0.86, headR: 0.32, dog: true };
}
