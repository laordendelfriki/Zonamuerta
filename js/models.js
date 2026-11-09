// ===== Modelos: personajes de la tienda, armas, objetos, vehículos =====
'use strict';
// ---------- armas ----------
const RARITY = [
  { n: 'Común', c: '#b5b5b5', hex: 0xb5b5b5 },
  { n: 'Poco común', c: '#5ad15a', hex: 0x5ad15a },
  { n: 'Raro', c: '#3ba8ff', hex: 0x3ba8ff },
  { n: 'Épico', c: '#c05cff', hex: 0xc05cff },
  { n: 'Legendario', c: '#ffa531', hex: 0xffa531 },
];
const WEAPONS = {
  pickaxe: { name: 'Pico', icon: '⛏️', dmg: 20, rate: 0.5, melee: true },
  pistol: { name: 'Pistola', icon: '🔫', dmg: 24, rate: 0.19, mag: 16, ammo: 'light', reload: 1.3, spread: 0.012, pellets: 1, range: 140, head: 2, auto: false, dist: 18 },
  smg: { name: 'Subfusil', icon: '🔫', dmg: 15, rate: 0.075, mag: 30, ammo: 'light', reload: 2.0, spread: 0.032, pellets: 1, range: 100, head: 1.75, auto: true, dist: 12 },
  ar: { name: 'Fusil de asalto', icon: '🔫', dmg: 30, rate: 0.16, mag: 30, ammo: 'medium', reload: 2.2, spread: 0.02, pellets: 1, range: 220, head: 1.5, auto: true, dist: 28 },
  shotgun: { name: 'Escopeta', icon: '🔫', dmg: 11, rate: 0.9, mag: 5, ammo: 'shells', reload: 3.6, spread: 0.075, pellets: 9, range: 45, head: 1.75, auto: false, dist: 6 },
  sniper: { name: 'Francotirador', icon: '🎯', dmg: 105, rate: 1.6, mag: 1, ammo: 'heavy', reload: 2.4, spread: 0.002, pellets: 1, range: 600, head: 2.5, auto: false, scope: true, dist: 70 },
  rocket: { name: 'Lanzacohetes', icon: '🚀', dmg: 95, rate: 1.4, mag: 1, ammo: 'rockets', reload: 3, spread: 0.004, pellets: 1, range: 400, auto: false, proj: true, splash: 6, dist: 35 },
};
const AMMO = { light: { name: 'Munición ligera', c: 0x8fd3ff, n: 30 }, medium: { name: 'Munición media', c: 0x7be36b, n: 30 }, heavy: { name: 'Munición pesada', c: 0xff6b6b, n: 6 }, shells: { name: 'Cartuchos', c: 0xffd23f, n: 8 }, rockets: { name: 'Cohetes', c: 0xb889ff, n: 3 } };
const HEALS = {
  bandage: { name: 'Vendas', icon: '🩹', time: 2.5, hp: 15, max: 75, stack: 15, give: 5, rarity: 0 },
  medkit: { name: 'Botiquín', icon: '💊', time: 6, hp: 100, max: 100, stack: 3, give: 1, rarity: 1 },
  minishield: { name: 'Mini escudo', icon: '🧪', time: 1.5, sh: 25, max: 50, stack: 6, give: 3, rarity: 1 },
  shield: { name: 'Poción de escudo', icon: '🛡️', time: 4, sh: 50, max: 100, stack: 3, give: 1, rarity: 2 },
};
function weaponModel(type, rarity) {
  const g = new THREE.Group(), dark = toon(0x2b2b33), mid = toon(0x4a4a55), acc = toon(RARITY[rarity || 0].hex), wood = toon(0x8a5a33);
  let len = 0.6;
  if (type === 'pickaxe') {
    cyl(0.03, 0.035, 0.9, 8, wood, 0, 0, -0.1, g).rotation.x = Math.PI / 2;
    const h = box(0.08, 0.5, 0.1, toon(0x7b55b8), 0, 0, -0.55, g); const tip = box(0.06, 0.14, 0.08, toon(0xffd23f), 0, 0.3, -0.55, g); const tip2 = box(0.06, 0.14, 0.08, toon(0xffd23f), 0, -0.3, -0.55, g);
    len = 0.6;
  } else if (type === 'pistol') {
    const sl = toon(0x2a2c30, { metalness: 0.75, roughness: 0.32 }), fr = toon(0x1c1c1e, { roughness: 0.7 }), st = toon(0x8a8c90, { metalness: 0.8, roughness: 0.25 });
    rbox(0.034, 0.042, 0.2, sl, 0, 0.055, -0.08, g, 0.006); // corredera
    for (let k = 0; k < 6; k++) box(0.036, 0.03, 0.004, fr, 0, 0.058, 0.0 + k * 0.007, g); // estrías
    box(0.012, 0.012, 0.03, st, 0, 0.08, -0.06, g); box(0.012, 0.01, 0.008, st, 0, 0.08, -0.17, g); box(0.02, 0.012, 0.01, st, 0, 0.081, 0.012, g); // miras
    rbox(0.03, 0.03, 0.18, fr, 0, 0.022, -0.075, g, 0.006); // armazón
    const gr = rbox(0.032, 0.11, 0.05, fr, 0, -0.04, 0.01, g, 0.008); gr.rotation.x = 0.28; // empuñadura
    for (let k = 0; k < 5; k++) { const t = box(0.034, 0.004, 0.044, toon(0x2a2a2c), 0, -0.01 - k * 0.018, 0.018 + k * 0.005, g); t.rotation.x = 0.28; }
    const tg = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 12, Math.PI), fr); tg.rotation.set(0, Math.PI / 2, Math.PI); tg.position.set(0, 0.008, -0.04); g.add(tg);
    box(0.004, 0.02, 0.008, st, 0, 0.0, -0.035, g); // gatillo
    cyl(0.007, 0.007, 0.01, 8, toon(0x0a0a0a), 0, 0.055, -0.181, g).rotation.x = Math.PI / 2; len = 0.19;
  } else if (type === 'smg') {
    box(0.08, 0.13, 0.42, dark, 0, 0.02, -0.15, g); box(0.06, 0.2, 0.07, mid, 0, -0.12, -0.18, g); box(0.06, 0.13, 0.08, mid, 0, -0.08, 0.02, g); box(0.085, 0.035, 0.3, acc, 0, 0.1, -0.15, g); cyl(0.022, 0.022, 0.15, 8, dark, 0, 0.03, -0.43, g).rotation.x = Math.PI / 2; len = 0.5;
  } else if (type === 'ar') {
    box(0.08, 0.13, 0.62, dark, 0, 0.03, -0.25, g); box(0.07, 0.12, 0.25, wood, 0, 0, 0.17, g); box(0.06, 0.22, 0.08, mid, 0, -0.12, -0.25, g).rotation.x = -0.2; box(0.06, 0.13, 0.07, mid, 0, -0.08, -0.02, g); box(0.085, 0.04, 0.4, acc, 0, 0.11, -0.25, g); cyl(0.022, 0.022, 0.25, 8, dark, 0, 0.04, -0.68, g).rotation.x = Math.PI / 2; box(0.05, 0.06, 0.1, mid, 0, 0.15, -0.2, g); len = 0.8;
  } else if (type === 'xbow') {
    const wd = toon(0x7a5232, { roughness: 0.6 }), mt = toon(0x3a3c40, { metalness: 0.6, roughness: 0.4 }), rp = toon(0xc8b890);
    rbox(0.05, 0.06, 0.62, wd, 0, 0.02, -0.18, g, 0.01); const st = rbox(0.045, 0.09, 0.2, wd, 0, -0.02, 0.18, g, 0.01); st.rotation.x = -0.15;
    for (const s2 of [-1, 1]) { const lb = rbox(0.34, 0.03, 0.035, mt, s2 * 0.17, 0.04, -0.44, g, 0.008); lb.rotation.y = s2 * 0.32; }
    for (const s2 of [-1, 1]) { const str = box(0.32, 0.006, 0.006, rp, s2 * 0.16, 0.05, -0.33, g); str.rotation.y = -s2 * 0.55; }
    box(0.012, 0.012, 0.42, toon(0x8a6a4a), 0, 0.065, -0.3, g); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.04, 6), mt); tip.rotation.x = -Math.PI / 2; tip.position.set(0, 0.065, -0.53); g.add(tip);
    box(0.01, 0.03, 0.03, mt, 0, -0.03, -0.05, g); len = 0.52;
  } else if (type === 'shotgun') {
    const bl = toon(0x26282c, { metalness: 0.75, roughness: 0.35 }), wd = toon(0x6a4226, { roughness: 0.55 }), fr = toon(0x1c1c1e);
    rbox(0.05, 0.075, 0.28, bl, 0, 0.03, -0.12, g, 0.01); // cajón de mecanismos
    cyl(0.017, 0.017, 0.62, 12, bl, 0, 0.055, -0.55, g).rotation.x = Math.PI / 2; // cañón
    cyl(0.016, 0.016, 0.5, 12, bl, 0, 0.02, -0.5, g).rotation.x = Math.PI / 2; // depósito
    for (let k = 0; k < 7; k++) { const r = cyl(0.03, 0.03, 0.022, 12, wd, 0, 0.022, -0.42 - k * 0.026, g); r.rotation.x = Math.PI / 2; } // corredera de bombeo
    const stk = rbox(0.045, 0.1, 0.32, wd, 0, -0.01, 0.17, g, 0.012); stk.rotation.x = -0.12; // culata
    const pg = rbox(0.036, 0.09, 0.05, wd, 0, -0.045, 0.04, g, 0.01); pg.rotation.x = 0.35;
    box(0.048, 0.03, 0.01, toon(0x111111), 0, -0.0, 0.33, g);
    const tg = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 6, 12, Math.PI), fr); tg.rotation.set(0, Math.PI / 2, Math.PI); tg.position.set(0, -0.012, -0.02); g.add(tg);
    box(0.008, 0.01, 0.01, toon(0xd8d8d8, { metalness: 0.8 }), 0, 0.075, -0.85, g); len = 0.86;
  } else if (type === 'sniper') {
    box(0.08, 0.12, 0.7, dark, 0, 0.03, -0.25, g); box(0.07, 0.14, 0.3, acc, 0, 0, 0.22, g); cyl(0.022, 0.022, 0.5, 8, dark, 0, 0.04, -0.85, g).rotation.x = Math.PI / 2; cyl(0.05, 0.05, 0.32, 12, mid, 0, 0.15, -0.25, g).rotation.x = Math.PI / 2; box(0.06, 0.13, 0.07, mid, 0, -0.08, -0.02, g); len = 1.1;
  } else if (type === 'rocket') {
    cyl(0.1, 0.1, 1.1, 12, toon(0x3d5a3d), 0, 0.08, -0.25, g).rotation.x = Math.PI / 2; cyl(0.12, 0.12, 0.12, 12, acc, 0, 0.08, -0.8, g).rotation.x = Math.PI / 2; box(0.06, 0.16, 0.07, mid, 0, -0.08, -0.1, g); box(0.06, 0.08, 0.14, mid, 0, 0.22, -0.25, g); len = 0.82;
  }
  const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0.04, -len); g.add(muzzle); g.userData.muzzle = muzzle;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  return g;
}
function healModel(type) {
  const g = new THREE.Group();
  if (type === 'bandage') { cyl(0.16, 0.16, 0.18, 14, toon(0xf5f5f5), 0, 0, 0, g).rotation.z = Math.PI / 2; cyl(0.06, 0.06, 0.19, 10, toon(0xd8b48a), 0, 0, 0, g).rotation.z = Math.PI / 2; }
  if (type === 'medkit') { box(0.5, 0.32, 0.22, toon(0xffffff), 0, 0, 0, g); box(0.24, 0.07, 0.23, toon(0xe33b3b), 0, 0, 0, g); box(0.07, 0.24, 0.23, toon(0xe33b3b), 0, 0, 0, g); }
  if (type === 'minishield') { sph(0.14, toon(0x47b3ff, { emissive: 0x113355 }), 0, 0, 0, g, 12, 10); cyl(0.05, 0.05, 0.12, 8, toon(0xeeeeee), 0, 0.17, 0, g); }
  if (type === 'shield') { const b = cyl(0.17, 0.2, 0.42, 14, toon(0x2f7bff, { emissive: 0x112266 }), 0, 0, 0, g); cyl(0.07, 0.07, 0.14, 10, toon(0xeeeeee), 0, 0.27, 0, g); }
  return g;
}
function ammoModel(type) { const g = new THREE.Group(); box(0.42, 0.24, 0.3, toon(0x5b6b3a), 0, 0, 0, g); box(0.44, 0.08, 0.32, toon(AMMO[type].c), 0, 0.06, 0, g); return g; }

// ---------- planeador y autobús ----------
function gliderModel(color) {
  const g = new THREE.Group();
  const a = 0.9, r = 2.6;
  const geo = new THREE.CylinderGeometry(r, r, 1.6, 20, 1, true, Math.PI - a, 2 * a); geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, toon(color, { side: THREE.DoubleSide })); m.position.y = 0.6; g.add(m);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.01, r + 0.01, 0.4, 20, 1, true, Math.PI - a, 2 * a).rotateX(Math.PI / 2), toon(0xffd23f, { side: THREE.DoubleSide })); stripe.position.y = 0.6; g.add(stripe);
  const lm = new THREE.LineBasicMaterial({ color: 0x333333 });
  const ex = r * Math.sin(a), ey = 0.6 + r * Math.cos(a);
  const pts = []; for (const s of [-1, 1]) for (const z of [-0.7, 0.7]) { pts.push(new THREE.Vector3(s * 0.3, 1.5, 0), new THREE.Vector3(s * ex, ey, z)); }
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lm));
  return g;
}
function busModel() {
  const g = new THREE.Group();
  const b = box(4, 3.6, 11, toon(0x5a3d8a), 0, 0, 0, g);
  box(4.05, 1, 11.05, toon(0xffd23f), 0, -1.2, 0, g);
  for (let i = -4; i <= 4; i += 1.6) { const w = box(4.1, 1, 1.1, toon(0x9fe3ff, { emissive: 0x223344 }), 0, 0.7, i, g); w.castShadow = false; }
  const sgn = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.4), new THREE.MeshBasicMaterial({ map: textTexture('LA ORDEN', '#5a3d8a', '#ffd23f') }));
  sgn.position.set(2.04, -0.2, 0); sgn.rotation.y = Math.PI / 2; g.add(sgn); const s2 = sgn.clone(); s2.position.x = -2.04; s2.rotation.y = -Math.PI / 2; g.add(s2);
  // globo
  const bal = sph(5.5, toon(0x19b5a5), 0, 9, 0, g, 20, 14); bal.scale.y = 1.15; const st = cyl(5.55, 5.55, 1.2, 20, toon(0xffffff), 0, 9, 0, g);
  const lm = new THREE.LineBasicMaterial({ color: 0x222222 }), pts = [];
  for (const [x, z] of [[-1.8, -5], [1.8, -5], [-1.8, 5], [1.8, 5]]) pts.push(new THREE.Vector3(x, 1.8, z), new THREE.Vector3(x * 1.6, 5, z * 0.6));
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lm));
  // hélices
  const props = [];
  for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(s * 2.4, 0.5, 5); box(0.2, 2.6, 0.12, toon(0x333333), 0, 0, 0, p); p.rotation.z = 0; g.add(p); props.push(p); }
  g.userData.props = props;
  return g;
}

// ---------- vehículos ----------
function vehicleModel(type) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const wheels = [];
  const wheelG = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 14); wheelG.rotateZ(Math.PI / 2);
  const tire = toon(0x222222), rim = toon(0xcccccc);
  if (type === 'kart') {
    box(1.9, 0.4, 3.2, toon(0xe94f37), 0, 0.55, 0, body);
    box(1.6, 0.5, 1.2, toon(0xe94f37), 0, 0.9, -1.0, body);
    box(0.9, 0.7, 0.2, toon(0x222222), 0, 1.1, 0.6, body);
    box(0.9, 0.15, 0.8, toon(0x333333), 0, 0.8, 0.2, body);
    const bar = cyl(0.05, 0.05, 1.4, 6, toon(0xcccccc), 0, 1.5, 0.75, body); bar.rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) cyl(0.05, 0.05, 1, 6, toon(0xcccccc), s * 0.7, 1.15, 0.75, body);
    box(1.95, 0.12, 0.3, toon(0xffd23f), 0, 0.78, -1.62, body);
    for (const [x, z] of [[-1, -1.1], [1, -1.1], [-1, 1.1], [1, 1.1]]) { const w = new THREE.Mesh(wheelG, tire); w.position.set(x, 0.45, z); w.castShadow = true; g.add(w); wheels.push(w); }
  } else {
    box(1.1, 0.45, 2.0, toon(0x3d8bfd), 0, 0.75, 0, body);
    box(0.7, 0.25, 0.8, toon(0x222222), 0, 1.05, 0.2, body);
    box(1.4, 0.12, 0.6, toon(0x3d8bfd), 0, 0.95, -0.85, body);
    box(1.4, 0.12, 0.6, toon(0x3d8bfd), 0, 0.95, 0.85, body);
    const hb = cyl(0.04, 0.04, 1.1, 6, toon(0x222222), 0, 1.25, -0.55, body); hb.rotation.z = Math.PI / 2;
    for (const [x, z] of [[-0.75, -0.8], [0.75, -0.8], [-0.75, 0.8], [0.75, 0.8]]) { const w = new THREE.Mesh(wheelG, tire); w.scale.set(1.1, 1, 1); w.position.set(x, 0.45, z); w.castShadow = true; g.add(w); wheels.push(w); }
  }
  g.userData.wheels = wheels; g.userData.body = body;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function chestModel() {
  const g = new THREE.Group(), gold = toon(0xf6c445, { emissive: 0x553300 }), wood = toon(0x9a5b2a);
  box(1.1, 0.55, 0.7, wood, 0, 0.28, 0, g);
  box(1.14, 0.1, 0.74, gold, 0, 0.5, 0, g);
  const lid = new THREE.Group(); lid.position.set(0, 0.55, 0.35); g.add(lid);
  const lt = box(1.1, 0.28, 0.7, wood, 0, 0.14, -0.35, lid); box(1.14, 0.08, 0.74, gold, 0, 0.1, -0.35, lid); box(0.18, 0.2, 0.06, gold, 0, 0.05, -0.72, lid);
  g.userData.lid = lid;
  return g;
}

// ===== Supervivencia: armas cuerpo a cuerpo, objetos y muebles =====
function meleeModel(type) {
  const g = new THREE.Group(), wood = toon(0x9a6a3a), metal = toon(0x9aa0aa, { metalness: 0.6, roughness: 0.35 }), dark = toon(0x2a2a30);
  if (type === 'bat') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.025, 0.85, 12), wood); b.rotation.x = Math.PI / 2; b.position.z = -0.38; g.add(b); const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10), dark); gr.rotation.x = Math.PI / 2; gr.position.z = 0.02; g.add(gr); }
  if (type === 'pan') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.32, 8), dark); h.rotation.x = Math.PI / 2; h.position.z = -0.1; g.add(h); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.05, 20), dark); p.position.set(0, 0, -0.42); p.rotation.z = Math.PI / 2; g.add(p); }
  if (type === 'knife') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8), dark); h.rotation.x = Math.PI / 2; g.add(h); box(0.012, 0.045, 0.2, metal, 0, 0.005, -0.15, g); }
  if (type === 'axe') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.75, 8), wood); h.rotation.x = Math.PI / 2; h.position.z = -0.3; g.add(h); box(0.04, 0.2, 0.12, metal, 0, 0.08, -0.62, g); box(0.035, 0.05, 0.06, toon(0xb8202a), 0, -0.05, -0.62, g); }
  if (type === 'hammer') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.42, 8), wood); h.rotation.x = Math.PI / 2; h.position.z = -0.17; g.add(h); box(0.05, 0.07, 0.07, metal, 0, 0, -0.4, g); box(0.035, 0.05, 0.16, metal, 0, 0.0, -0.4, g).rotation.x = Math.PI / 2; }
  if (type === 'pipe') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 10), metal); h.rotation.x = Math.PI / 2; h.position.z = -0.35; g.add(h); const e = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.06, 10), metal); e.rotation.x = Math.PI / 2; e.position.z = -0.74; g.add(e); }
  if (type === 'saxe') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.7, 7), wood); h.rotation.x = Math.PI / 2; h.position.z = -0.28; g.add(h); const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.07, 0), toon(0x7a7670)); st.scale.set(0.6, 1.3, 1); st.position.set(0, 0.06, -0.58); g.add(st); for (let k = 0; k < 3; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 4, 10), toon(0xc8b890)); r.position.set(0, 0, -0.56 + k * 0.025); g.add(r); } }
  if (type === 'shiv') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.11, 7), toon(0x8a7a6a)); h.rotation.x = Math.PI / 2; g.add(h); const bl = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.2, 4), metal); bl.rotation.x = -Math.PI / 2; bl.position.z = -0.15; bl.scale.z = 0.3; g.add(bl); }
  if (type === 'club') { const h = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.75), wood); h.position.z = -0.32; g.add(h); for (let k = 0; k < 7; k++) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4), metal); n.position.set((k % 2 ? 1 : -1) * 0.04, 0, -0.45 - k * 0.035); n.rotation.z = Math.PI / 2; g.add(n); } box(0.075, 0.055, 0.12, dark, 0, 0, -0.02, g); }
  if (type === 'nailbat') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.025, 0.85, 12), wood); b.rotation.x = Math.PI / 2; b.position.z = -0.38; g.add(b); const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10), dark); gr.rotation.x = Math.PI / 2; gr.position.z = 0.02; g.add(gr); for (let k = 0; k < 14; k++) { const a = k * 2.4, z = -0.5 - (k % 5) * 0.06; const n = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.07, 4), metal); n.position.set(Math.cos(a) * 0.075, Math.sin(a) * 0.075, z); n.rotation.z = a + Math.PI / 2; g.add(n); } }
  if (type === 'spear') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 1.3, 8), wood); h.rotation.x = Math.PI / 2; h.position.z = -0.5; g.add(h); box(0.012, 0.05, 0.2, metal, 0, 0, -1.24, g); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.12, 8), toon(0x8a8a90)); t.rotation.x = Math.PI / 2; t.position.z = -1.12; g.add(t); }
  if (type === 'molotov') { const g0 = g; const g2 = new THREE.Group(); g2.rotation.x = -Math.PI / 2; g2.position.z = -0.05; g0.add(g2); const glass = toon(0x6ab86a, { transparent: true, opacity: 0.85 }); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), glass); b.position.y = 0.09; g2.add(b); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.08, 8), glass); n.position.y = 0.22; g2.add(n); const r = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), toon(0xe8e0c8)); r.position.y = 0.3; g2.add(r); const f = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffa020 })); f.position.y = 0.36; g2.add(f); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function propModel(id) {
  const g = new THREE.Group();
  const can = (c, h = 0.16, r = 0.06) => cyl(r, r, h, 12, toon(c), 0, h / 2, 0, g);
  switch (id) {
    case 'beans': can(0xd85a2a); break;
    case 'soda': can(0xe8202a, 0.18, 0.045); break;
    case 'water': case 'bottle': { const b = cyl(0.05, 0.05, 0.24, 12, toon(id === 'water' ? 0x7ac8ff : 0xcfe8f0, { transparent: true, opacity: 0.85 }), 0, 0.12, 0, g); cyl(0.02, 0.02, 0.05, 8, toon(0x2a6ad8), 0, 0.26, 0, g); break; }
    case 'bread': { const b = sph(0.12, toon(0xd8a050), 0, 0.07, 0, g, 12, 8); b.scale.set(1.5, 0.6, 0.8); break; }
    case 'apple': sph(0.07, toon(0xd8202a), 0, 0.07, 0, g, 12, 8); break;
    case 'chips': box(0.16, 0.2, 0.06, toon(0xf0c020), 0, 0.1, 0, g); break;
    case 'choco': box(0.16, 0.03, 0.08, toon(0x5a3018), 0, 0.02, 0, g); break;
    case 'cereal': box(0.16, 0.24, 0.07, toon(0x3a8ae8), 0, 0.12, 0, g); break;
    case 'bandage': cyl(0.06, 0.06, 0.08, 12, toon(0xf5f5f5), 0, 0.04, 0, g); break;
    case 'medkit': box(0.26, 0.16, 0.12, toon(0xffffff), 0, 0.08, 0, g); box(0.12, 0.04, 0.125, toon(0xe33b3b), 0, 0.08, 0, g); box(0.04, 0.12, 0.125, toon(0xe33b3b), 0, 0.08, 0, g); break;
    case 'plank': box(1.2, 0.05, 0.2, toon(0xb07a48), 0, 0.03, 0, g); break;
    case 'nails': box(0.14, 0.08, 0.1, toon(0x7a7a82), 0, 0.04, 0, g); break;
    case 'scrap': box(0.9, 0.03, 0.6, toon(0xa8acb2, { metalness: 0.5, roughness: 0.4 }), 0, 0.02, 0, g); break;
    case 'rag': { const r = box(0.24, 0.03, 0.2, toon(0xc8b8a0), 0, 0.02, 0, g); r.rotation.y = 0.4; box(0.18, 0.03, 0.14, toon(0x8a6a5a), 0.03, 0.05, 0.02, g); break; }
    case 'tape': { const t = cyl(0.07, 0.07, 0.05, 14, toon(0x9a9aa2), 0, 0.03, 0, g); cyl(0.035, 0.035, 0.052, 10, toon(0xd8c8a0), 0, 0.03, 0, g); break; }
    case 'alcohol': { cyl(0.05, 0.055, 0.22, 12, toon(0x5a8a3a, { transparent: true, opacity: 0.85 }), 0, 0.11, 0, g); cyl(0.02, 0.025, 0.08, 8, toon(0x5a8a3a), 0, 0.26, 0, g); box(0.08, 0.06, 0.005, toon(0xf0e8d0), 0, 0.11, 0.053, g); break; }
    case 'sandwich': { const b = box(0.24, 0.06, 0.08, toon(0xd8a050), 0, 0.04, 0, g); box(0.25, 0.02, 0.075, toon(0xc85a3a), 0, 0.075, 0, g); box(0.24, 0.04, 0.08, toon(0xd8a050), 0, 0.1, 0, g); break; }
    case 'stick': { const t = cyl(0.025, 0.03, 0.9, 6, toon(0x6a4a30), 0, 0.03, 0, g); t.rotation.z = Math.PI / 2; break; }
    case 'rope': { const t = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 14), toon(0xc8b890)); t.rotation.x = Math.PI / 2; t.position.y = 0.03; g.add(t); break; }
    case 'stone': { const t = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 0), toon(0x7a7670)); t.position.y = 0.07; g.add(t); break; }
    case 'seeds': box(0.1, 0.12, 0.03, toon(0x6a8a3a), 0, 0.06, 0, g); break;
    case 'veg': sph(0.08, toon(0x4a8a3a), 0, 0.07, 0, g, 8, 6); sph(0.05, toon(0xc84a2a), 0.08, 0.05, 0, g, 8, 6); break;
    case 'stew': cyl(0.1, 0.08, 0.08, 12, toon(0x4a4a4a), 0, 0.04, 0, g); cyl(0.09, 0.09, 0.01, 12, toon(0x8a4a2a), 0, 0.08, 0, g); break;
    case 'bolt': for (let k = 0; k < 3; k++) { const t = box(0.012, 0.012, 0.35, toon(0x8a6a4a), -0.02 + k * 0.02, 0.02, 0, g); } break;
    case 'gas': box(0.22, 0.3, 0.12, toon(0xc8202a), 0, 0.15, 0, g); cyl(0.025, 0.025, 0.06, 8, toon(0x1a1a1a), 0.07, 0.33, 0, g); box(0.12, 0.03, 0.03, toon(0x1a1a1a), -0.03, 0.31, 0, g); break;
    case 'xbow': { const m = weaponModel('xbow', 0); m.position.y = 0.06; g.add(m); break; }
    case 'ammo9': case 'shells': box(0.18, 0.1, 0.12, toon(id === 'ammo9' ? 0x8a8a3a : 0xc83a2a), 0, 0.05, 0, g); break;
    case 'pistol': case 'shotgun': { const m = weaponModel(id, 0); m.position.y = 0.06; g.add(m); break; }
    default: { const m = meleeModel(id); m.position.y = 0.05; g.add(m); }
  }
  return g;
}
function fridgeModel() { const g = new THREE.Group(), w = toon(0xf2f4f6); rbox(0.8, 1.8, 0.7, w, 0, 0.9, 0, g, 0.06); box(0.82, 0.02, 0.6, toon(0xb0b4ba), 0, 1.15, -0.06, g); box(0.04, 0.4, 0.05, toon(0xb0b4ba), 0.3, 1.45, -0.37, g); box(0.04, 0.4, 0.05, toon(0xb0b4ba), 0.3, 0.75, -0.37, g); return g; }
function cabinetModel() { const g = new THREE.Group(), w = toon(0x9a6a3a); box(1.1, 1.0, 0.55, w, 0, 0.5, 0, g); for (const y of [0.3, 0.7]) { box(1.0, 0.34, 0.03, toon(0xb07a48), 0, y, -0.28, g); box(0.18, 0.04, 0.04, toon(0xd8c27a), 0, y, -0.31, g); } return g; }
function sinkModel() { const g = new THREE.Group(); box(1.2, 0.9, 0.6, toon(0xe8e2d6), 0, 0.45, 0, g); box(1.24, 0.06, 0.64, toon(0x6a6a72), 0, 0.92, 0, g); box(0.5, 0.05, 0.36, toon(0x9aa0aa, { metalness: 0.5, roughness: 0.3 }), 0, 0.93, -0.02, g); const t = cyl(0.025, 0.025, 0.25, 8, toon(0xc0c4ca, { metalness: 0.7, roughness: 0.3 }), 0, 1.06, 0.2, g); return g; }
function crateModel() { const g = new THREE.Group(), w = toon(0xb8834a); box(1.0, 0.8, 0.8, w, 0, 0.4, 0, g); for (const z of [-0.41, 0.41]) { box(1.02, 0.08, 0.02, toon(0x7a5428), 0, 0.2, z, g); box(1.02, 0.08, 0.02, toon(0x7a5428), 0, 0.6, z, g); } return g; }
