// ===== Personas realistas: esqueleto con rodillas y codos (una sola malla con skinning) =====
// Sirve para los zombis, el superviviente y el creador de personaje. Los brazos en 1ª persona van aparte (fpArm).
const HUMAN = (() => {
  const hr = mulberry32(4242);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
  // colores en sRGB como enteros (sin pasar por THREE.Color, que convierte a lineal)
  function hex(c) { return typeof c === 'string' ? parseInt(c.replace('#', ''), 16) : c; }
  function mixHex(a, b, t) { a = hex(a); b = hex(b); let o = 0; for (const sh of [16, 8, 0]) { const x = (a >> sh) & 255, y = (b >> sh) & 255; o |= Math.round(x + (y - x) * t) << sh; } return o; }
  const dull = (c, t = 0.35) => mixHex(c, 0x5a5850, t);
  const shade = (c, k) => mixHex(c, k < 0 ? 0x000000 : 0xffffff, Math.abs(k));

  // ---------- texturas: atlas tela | piel | blanco ----------
  function blobs(x, X0, W, H, n, cols, r0, r1, a) { for (let i = 0; i < n; i++) { const px = X0 + hr() * W, py = hr() * H, r = r0 + (r1 - r0) * hr(); x.globalAlpha = a * (0.3 + 0.7 * hr()); x.fillStyle = cols[Math.floor(hr() * cols.length)]; x.beginPath(); x.ellipse(px, py, r, r * (0.5 + hr()), hr() * 3, 0, 7); x.fill(); } x.globalAlpha = 1; }
  function veins(x, X0, W, H, n, col, a) { x.strokeStyle = col; for (let i = 0; i < n; i++) { let px = X0 + hr() * W, py = hr() * H, ang = hr() * 6.28; x.globalAlpha = a * (0.4 + hr() * 0.6); x.lineWidth = 1.6; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 14; k++) { ang += (hr() - 0.5) * 0.9; px += Math.cos(ang) * 7; py += Math.sin(ang) * 7; x.lineTo(px, py); if (hr() < 0.25) { x.stroke(); x.lineWidth = Math.max(0.5, x.lineWidth * 0.75); x.beginPath(); x.moveTo(px, py); } } x.stroke(); } x.globalAlpha = 1; }
  function atlas(zombie) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
    // tela
    x.fillStyle = zombie ? '#e2ded6' : '#f0eeea'; x.fillRect(0, 0, 512, 512);
    blobs(x, 0, 512, 512, 4000, ['#ffffff', '#d6d2ca', '#c8c4bc'], 0.5, 1.6, 0.6);
    x.globalAlpha = 0.07; x.strokeStyle = '#000'; for (let i = 0; i < 512; i += 3) { x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); } x.globalAlpha = 1;
    blobs(x, 0, 512, 512, zombie ? 90 : 25, ['#8a8070', '#6a6050', '#9a9080'], 10, 45, zombie ? 0.4 : 0.15);
    if (zombie) {
      blobs(x, 0, 512, 512, 46, ['#4a0a06', '#5a1008', '#3a0804', '#6a1a0e'], 6, 34, 0.85);
      for (let i = 0; i < 30; i++) { const px = hr() * 512, py = hr() * 512, len = 15 + hr() * 80; const g = x.createLinearGradient(px, py, px, py + len); g.addColorStop(0, 'rgba(80,12,6,.9)'); g.addColorStop(1, 'rgba(80,12,6,0)'); x.fillStyle = g; x.fillRect(px, py, 2 + hr() * 4, len); }
      blobs(x, 0, 512, 512, 30, ['#1a1612', '#2a2018'], 4, 14, 0.9); // agujeros
      x.strokeStyle = 'rgba(30,20,14,.7)'; x.lineWidth = 1.2; for (let i = 0; i < 50; i++) { const px = hr() * 512, py = hr() * 512; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (hr() - 0.5) * 40, py + (hr() - 0.5) * 40); x.stroke(); }
    } else blobs(x, 0, 512, 512, 14, ['#8a7a60', '#7a6a50'], 8, 26, 0.2);
    // piel
    x.fillStyle = zombie ? '#dcdad2' : '#f4f0ec'; x.fillRect(512, 0, 492, 512);
    blobs(x, 512, 492, 512, 5000, zombie ? ['#ffffff', '#c8c8be', '#d0ccc4'] : ['#ffffff', '#ece4dc', '#f8f0ea'], 0.4, 1.3, 0.55);
    blobs(x, 512, 492, 512, 60, zombie ? ['#b4b0a4', '#c0b8b0'] : ['#f0d8d0', '#e8dcd4'], 10, 40, 0.35);
    if (zombie) {
      veins(x, 512, 492, 512, 70, '#3a3a5a', 0.55); veins(x, 512, 492, 512, 40, '#4a5a3a', 0.4);
      blobs(x, 512, 492, 512, 40, ['#6a4a6a', '#7a6a4a', '#5a4a5a', '#8a8a5a'], 10, 30, 0.45); // moratones
      blobs(x, 512, 492, 512, 28, ['#3a0806', '#4a0c08', '#2a1a10'], 4, 18, 0.85); // llagas
      blobs(x, 512, 492, 512, 400, ['#2a2018', '#4a3a2a'], 0.6, 2.2, 0.6);
    } else blobs(x, 512, 492, 512, 800, ['#d8b8a8', '#e0c4b4'], 0.5, 1.2, 0.35);
    x.fillStyle = '#ffffff'; x.fillRect(1004, 0, 20, 512);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }
  const ATZ = atlas(true), ATP = atlas(false);
  const mkMat = (tex, rough, bump) => new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, bumpMap: tex, bumpScale: bump, roughness: rough, metalness: 0, envMapIntensity: 0.45, skinning: true });
  const MAT_Z = mkMat(ATZ, 0.86, 0.014), MAT_P = mkMat(ATP, 0.8, 0.006);
  const REG = { c: [0.004, 0.496], s: [0.504, 0.976], w: [0.984, 0.996] };
  // tela limpia para los brazos en 1ª persona
  const cleanTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 2500; i++) { x.globalAlpha = 0.4; x.fillStyle = ['#ffffff', '#dcdcdc', '#e8e8e8'][i % 3]; x.fillRect(hr() * 256, hr() * 256, 1.5, 1.5); } x.globalAlpha = 1; const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t; })();

  // ---------- geometrías base ----------
  const _lc = {};
  const LATHE = (pts, seg = 9) => { const k = seg + JSON.stringify(pts); return _lc[k] || (_lc[k] = (() => { const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg); g.computeVertexNormals(); return g; })()); };
  const G = { box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(1, 9, 7), sphL: new THREE.SphereGeometry(1, 6, 4), cyl: new THREE.CylinderGeometry(1, 1, 1, 7), cylL: new THREE.CylinderGeometry(1, 1, 1, 5), cone: new THREE.ConeGeometry(1, 1, 6),
    capT: new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.56), capH: new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), torus: new THREE.TorusGeometry(1, 0.14, 5, 14), hemiF: new THREE.SphereGeometry(1, 12, 8, Math.PI * 0.5, Math.PI, Math.PI * 0.35, Math.PI * 0.55) };
  // piezas: kind 'c' tela, 's' piel, 'w' liso (ojos, dientes, metal)
  function part(bone, geo, col, kind, px, py, pz, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
    (bone.userData.parts || (bone.userData.parts = [])).push({ geo, col: hex(col), kind, m: _m.compose(_p.set(px, py, pz), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz)).clone() });
  }

  // ---------- conjuntos de ropa ----------
  const OUTFITS = ['jacket', 'hoodie', 'track', 'overalls', 'military', 'hivis', 'shirt', 'scrubs'];

  // o: { sex:'m'|'f', body:'thin'|'normal'|'strong'|'heavy', height, age:0..2, skin, hair, style, beard, eye, glasses, hat, outfit, top, pants, shoes, backpack, gloves, zombie, seed }
  function build(o) {
    const rnd = mulberry32(o.seed || 1), pk = a => a[Math.floor(rnd() * a.length)], Z = !!o.zombie, F = o.sex === 'f';
    const bt = o.body || 'normal', BW = { thin: 0.88, normal: 1, strong: 1.08, heavy: 1.14 }[bt] || 1, SH = (F ? 0.88 : 1) * (bt === 'strong' ? 1.1 : bt === 'thin' ? 0.94 : 1), BELLY = bt === 'heavy' ? 1.28 : bt === 'thin' ? 0.9 : 1, LIMB = bt === 'strong' ? 1.15 : bt === 'heavy' ? 1.12 : bt === 'thin' ? 0.86 : 1;
    const age = o.age || 0, skin = hex(o.skin), hairBase = hex(o.hair || 0x2a1a10), hair = age === 2 && !Z ? mixHex(hairBase, 0xc8c8c8, 0.55) : hairBase;
    const top = hex(o.top), pants = hex(o.pants), shoes = hex(o.shoes || 0x2a2a2e), outfit = o.outfit || 'jacket', blood = 0x4a0a06, flesh = 0x7a2418, bone = 0xd8d0b8;
    const lip = Z ? mixHex(skin, 0x3a2a3a, 0.5) : mixHex(skin, 0xb04a4a, F ? 0.42 : 0.28), sk2 = Z ? mixHex(skin, 0x3a3a30, 0.18) : mixHex(skin, 0x9a5a48, 0.1);
    const root = new THREE.Group();
    const B = n => { const b = new THREE.Bone(); b.name = n; return b; };
    const rig = B('rig'), body = B('body'), head = B('head'), lL = B('lL'), lR = B('lR'), kL = B('kL'), kR = B('kR'), aL = B('aL'), aR = B('aR'), eL = B('eL'), eR = B('eR'), hL = B('handL'), hR = B('hand');
    const bones = [rig, body, head, lL, lR, kL, kR, aL, aR, eL, eR, hL, hR];
    rig.add(lL, lR, body); lL.add(kL); lR.add(kR); body.add(aL, aR, head); aL.add(eL); aR.add(eR); eL.add(hL); eR.add(hR);
    const hipW = (F ? 0.105 : 0.098) * BW;
    lL.position.set(-hipW, 0.93, 0); lR.position.set(hipW, 0.93, 0); kL.position.y = kR.position.y = -0.46;
    body.position.y = 0.93; body.userData.y0 = 0.93;
    const shX = 0.2 * SH * (bt === 'heavy' ? 1.05 : 1); aL.position.set(-shX, 0.5, 0); aR.position.set(shX, 0.5, 0); eL.position.y = eR.position.y = -0.285; hL.position.y = hR.position.y = -0.265;
    head.position.y = 0.665;
    const P = { rig, body, head, lL, lR, kL, kR, aL, aR, eL, eR, hand: hR, handL: hL };
    // ----- piernas -----
    const shorts = outfit === 'scrubs' ? false : false, boots = outfit === 'military' || outfit === 'overalls' || outfit === 'hivis';
    for (const [leg, knee, s] of [[lL, kL, -1], [lR, kR, 1]]) {
      const torn = Z && rnd() < 0.3, th = (F ? 1.06 : 1) * LIMB;
      part(leg, LATHE([[0, 0.04], [0.088 * th, 0.02], [0.092 * th, -0.08], [0.082 * th, -0.24], [0.064 * th, -0.4], [0.056, -0.47], [0, -0.48]]), pants, 'c', 0, 0, 0, 1, 1, 1);
      part(knee, G.sph, pants, 'c', 0, 0.0, -0.008, 0.055, 0.06, 0.058);
      part(knee, LATHE([[0, 0.01], [0.054, 0.0], [0.056 * LIMB, -0.08], [0.05 * LIMB, -0.22], [0.04, -0.36], [0.041, -0.4], [0, -0.41]]), torn ? skin : pants, torn ? 's' : 'c', 0, 0, 0, 1, 1, 1);
      if (torn) { part(knee, LATHE([[0.06, 0.01], [0.062, -0.08], [0.0, -0.1]]), pants, 'c', 0, 0, 0, 1, 1, 1); for (let t = 0; t < 4; t++) part(knee, G.box, pants, 'c', Math.cos(t * 1.6) * 0.055, -0.11, Math.sin(t * 1.6) * 0.055, 0.03, 0.05, 0.004, 0, -t * 1.6, 0); part(knee, G.sph, blood, 'c', s * 0.03, -0.2, -0.03, 0.025, 0.04, 0.015); }
      if (outfit === 'track' || outfit === 'military') for (const v of [-0.15, -0.3]) part(leg, G.box, outfit === 'track' ? 0xf0f0f0 : shade(pants, -0.2), 'c', s * 0.088 * th, v, 0, 0.006, 0.12, 0.02);
      if (outfit === 'military' || outfit === 'overalls') part(leg, G.box, shade(pants, -0.12), 'c', s * 0.09 * th, -0.18, -0.005, 0.012, 0.09, 0.08);
      // calzado
      if (boots) { part(knee, LATHE([[0, -0.26], [0.05, -0.26], [0.052, -0.4], [0, -0.4]]), shoes, 'c', 0, 0, 0, 1, 1, 1); }
      part(knee, G.sph, shoes, 'c', 0, -0.395, -0.04, 0.05, 0.042, 0.115);
      part(knee, G.box, boots ? shade(shoes, -0.4) : 0xe8e6e0, 'w', 0, -0.425, -0.04, 0.098, 0.024, 0.255);
      if (!boots) part(knee, G.box, shade(shoes, 0.3), 'c', 0, -0.385, -0.13, 0.04, 0.008, 0.06);
    }
    // ----- tronco -----
    const tw = BW, pv = (F ? 1.1 : 1) * BW;
    part(body, LATHE([[0, -0.1], [0.15 * pv, -0.09], [0.172 * pv, 0.0], [0.168 * pv, 0.07], [0, 0.07]], 14), pants, 'c', 0, 0, 0, 1, 1, 0.66);
    const TOR = F ? [[0, 0.02], [0.168 * pv, 0.03], [0.14 * tw, 0.14], [0.13 * tw * BELLY, 0.22], [0.15 * tw, 0.33], [0.165 * SH, 0.43], [0.17 * SH, 0.5], [0.14 * SH, 0.56], [0.06, 0.6], [0, 0.61]]
      : [[0, 0.02], [0.17 * tw, 0.03], [0.162 * tw * BELLY, 0.12], [0.152 * tw * BELLY, 0.22], [0.166 * tw, 0.33], [0.19 * SH, 0.43], [0.198 * SH, 0.5], [0.16 * SH, 0.565], [0.07, 0.6], [0, 0.61]];
    part(body, LATHE(TOR, 12), top, 'c', 0, 0, 0, 1, 1, 0.62);
    if (bt === 'heavy') part(body, G.sph, top, 'c', 0, 0.16, -0.05, 0.15, 0.13, 0.08);
    if (F) part(body, G.sph, top, 'c', 0, 0.395, -0.068, 0.105, 0.05, 0.04);
    part(body, G.cyl, shade(pants, -0.55), 'c', 0, 0.045, 0, 0.173 * pv, 0.035, 0.173 * pv * 0.68);
    part(body, G.box, 0xa8a8a0, 'w', 0, 0.045, -0.116, 0.035, 0.026, 0.008);
    part(body, G.cyl, skin, 's', 0, 0.63, -0.005, F ? 0.042 : 0.05, 0.12, F ? 0.042 : 0.05);
    if (!F && !Z) part(body, G.sph, sk2, 's', 0, 0.62, -0.042, 0.014, 0.018, 0.012); // nuez
    for (const s of [-1, 1]) part(body, G.sph, top, 'c', s * shX * 0.85, 0.49, 0, 0.058 * LIMB, 0.06, 0.066);
    // detalles del conjunto (z negativa = delante)
    const fz = -0.108 * tw, inner = outfit === 'jacket' ? 0xd8d4c8 : outfit === 'overalls' ? (Z ? 0x8a8a80 : 0xc8c0b0) : shade(top, -0.2);
    if (outfit === 'jacket') { part(body, G.box, inner, 'c', 0, 0.3, fz - 0.002, 0.07, 0.5, 0.01); for (const s of [-1, 1]) { part(body, G.box, shade(top, -0.08), 'c', s * 0.042, 0.32, fz - 0.004, 0.012, 0.5, 0.008, 0, 0, s * 0.04); part(body, G.box, shade(top, -0.1), 'c', s * 0.08, 0.52, fz + 0.01, 0.06, 0.07, 0.02, 0.3, 0, s * 0.5); part(body, G.box, shade(top, -0.15), 'c', s * 0.1, 0.17, fz + 0.004, 0.06, 0.05, 0.012); } }
    if (outfit === 'hoodie') { part(body, G.capH, top, 'c', 0, 0.56, 0.06, 0.12, 0.1, 0.09, -1.9, 0, 0); part(body, G.box, shade(top, -0.12), 'c', 0, 0.15, fz - 0.004, 0.18, 0.1, 0.012); for (const s of [-1, 1]) part(body, G.cylL, 0xe8e8e0, 'w', s * 0.03, 0.45, fz - 0.01, 0.004, 0.12, 0.004); }
    if (outfit === 'track') { part(body, G.box, shade(top, 0.15), 'c', 0, 0.3, fz - 0.003, 0.012, 0.52, 0.01); part(body, G.box, shade(top, -0.2), 'c', 0, 0.565, -0.02, 0.15, 0.03, 0.13); }
    if (outfit === 'overalls') { part(body, G.box, pants, 'c', 0, 0.22, fz - 0.004, 0.2, 0.3, 0.012); for (const s of [-1, 1]) { part(body, G.box, pants, 'c', s * 0.07, 0.42, -0.06, 0.035, 0.25, 0.1, 0.25, 0, 0); part(body, G.box, 0xb8b8b0, 'w', s * 0.07, 0.36, fz - 0.012, 0.02, 0.02, 0.005); } part(body, G.box, shade(pants, -0.15), 'c', 0, 0.25, fz - 0.012, 0.08, 0.07, 0.006); }
    if (outfit === 'military') { for (const s of [-1, 1]) { part(body, G.box, shade(top, -0.1), 'c', s * 0.07, 0.4, fz - 0.006, 0.07, 0.07, 0.02); part(body, G.box, shade(top, -0.2), 'c', s * 0.07, 0.43, fz - 0.017, 0.072, 0.02, 0.006); } part(body, G.box, shade(top, -0.3), 'c', 0, 0.3, fz - 0.004, 0.012, 0.45, 0.008); part(body, G.cyl, shade(top, -0.35), 'c', 0, 0.06, 0, 0.18 * pv, 0.05, 0.18 * pv * 0.7); }
    if (outfit === 'hivis') { const v = Z ? 0xc8a020 : 0xe8d020; for (const s of [-1, 1]) part(body, G.box, v, 'c', s * 0.07, 0.3, fz - 0.008, 0.09, 0.5, 0.012); part(body, G.cyl, v, 'c', 0, 0.3, 0, 0.17 * tw, 0.5, 0.17 * tw * 0.66); for (const y of [0.18, 0.3]) part(body, G.cyl, 0xc8ccd0, 'w', 0, y, 0, 0.173 * tw, 0.025, 0.173 * tw * 0.67); }
    if (outfit === 'shirt') { part(body, G.box, shade(top, -0.1), 'c', 0, 0.3, fz - 0.003, 0.008, 0.52, 0.006); for (let b = 0; b < 5; b++) part(body, G.sph, 0xe8e4dc, 'w', 0, 0.12 + b * 0.09, fz - 0.007, 0.006, 0.006, 0.003); for (const s of [-1, 1]) part(body, G.box, shade(top, 0.08), 'c', s * 0.04, 0.585, -0.06, 0.06, 0.03, 0.06, 0, 0, s * 0.6); }
    if (outfit === 'scrubs') { part(body, G.cone, skin, 's', 0, 0.565, -0.08, 0.04, 0.08, 0.01, Math.PI, 0, 0); part(body, G.box, shade(top, -0.12), 'c', -0.07, 0.42, fz - 0.004, 0.06, 0.06, 0.008); }
    if (o.backpack) { const bp = hex(o.backpack);
      part(body, G.box, bp, 'c', 0, 0.33, 0.14, 0.27, 0.36, 0.13); part(body, G.box, shade(bp, -0.2), 'c', 0, 0.22, 0.21, 0.22, 0.14, 0.04); part(body, G.cyl, shade(bp, -0.3), 'c', 0, 0.54, 0.14, 0.05, 0.22, 0.05, 0, 0, Math.PI / 2);
      for (const s of [-1, 1]) { part(body, G.box, shade(bp, -0.15), 'c', s * 0.085, 0.36, fz + 0.002, 0.024, 0.32, 0.01); part(body, G.box, shade(bp, -0.25), 'c', s * 0.14, 0.3, 0.14, 0.03, 0.18, 0.1); }
      part(body, G.cyl, 0x6a6a4a, 'c', 0, 0.12, 0.16, 0.05, 0.3, 0.05, 0, 0, Math.PI / 2); part(body, G.box, 0xa8a8a0, 'w', 0.06, 0.4, 0.21, 0.015, 0.06, 0.005); }
    if (Z) { // heridas, tela rasgada y carne a la vista
      const nW = 2 + Math.floor(rnd() * 4);
      for (let i = 0; i < nW; i++) { const a = rnd() * Math.PI * 2, y = 0.08 + rnd() * 0.45, r = 0.163 * tw; part(body, G.sph, pk([blood, 0x2a0402, flesh]), 's', Math.sin(a) * r, y, Math.cos(a) * r * 0.62, 0.03 + rnd() * 0.045, 0.03 + rnd() * 0.06, 0.018); }
      if (rnd() < 0.45) { part(body, G.sph, flesh, 's', 0.06, 0.3, fz + 0.01, 0.06, 0.08, 0.02); for (let r = 0; r < 4; r++) part(body, G.cylL, bone, 'w', 0.06, 0.25 + r * 0.03, fz - 0.004, 0.006, 0.07, 0.006, 0, 0, Math.PI / 2 + 0.2); }
      for (let t = 0; t < 7; t++) { const a = rnd() * 6.28; part(body, G.box, top, 'c', Math.sin(a) * 0.168 * tw, -0.02 - rnd() * 0.06, Math.cos(a) * 0.168 * tw * 0.64, 0.04, 0.06 + rnd() * 0.08, 0.004, rnd() * 0.3, -a, 0); }
      part(body, G.sph, blood, 's', 0.02, 0.58, -0.04, 0.05, 0.05, 0.03);
    }
    // ----- brazos -----
    const sleeveShort = outfit === 'scrubs' || o.sleeves === 'short';
    for (const [arm, el, hand, s] of [[aL, eL, hL, -1], [aR, eR, hR, 1]]) {
      const shortSl = sleeveShort || (Z && rnd() < 0.3), lost = Z && rnd() < 0.1, ua = LIMB * (F ? 0.88 : 1);
      const slc = outfit === 'overalls' ? inner : outfit === 'hivis' ? shade(top, 0) : top;
      part(arm, LATHE([[0, 0.04], [0.058 * ua, 0.02], [0.056 * ua, -0.1], [0.047 * ua, -0.26], [0.044 * ua, -0.31], [0, -0.325]]), shortSl ? skin : slc, shortSl ? 's' : 'c', 0, 0, 0, 1, 1, 1);
      if (shortSl) part(arm, LATHE([[0.066 * ua, 0.04], [0.066 * ua, -0.13], [0.0, -0.13]]), slc, 'c', 0, 0, 0, 1, 1, 1);
      if (outfit === 'track') part(arm, G.box, 0xf0f0f0, 'c', s * 0.055 * ua, -0.13, 0, 0.006, 0.24, 0.015);
      if (outfit === 'military') part(arm, G.box, shade(top, -0.15), 'c', s * 0.058 * ua, -0.08, 0, 0.008, 0.06, 0.05);
      if (lost) { part(el, LATHE([[0.044, 0.02], [0.042, -0.06], [0, -0.08]]), flesh, 's', 0, 0, 0, 1, 1, 1); part(el, G.cyl, bone, 'w', 0, -0.1, 0, 0.012, 0.06, 0.012); hand.scale.setScalar(0.001); continue; }
      
      part(el, LATHE([[0, 0.035], [0.042 * ua, 0.03], [0.045 * ua, 0.0], [0.046 * ua, -0.06], [0.037 * ua, -0.22], [0.03, -0.255], [0, -0.26]]), shortSl ? skin : slc, shortSl ? 's' : 'c', 0, 0, 0, 1, 1, 1);
      if (!shortSl) part(el, LATHE([[0.041, -0.19], [0.041, -0.25], [0.0, -0.25]]), shade(slc, -0.18), 'c', 0, 0, 0, 1, 1, 1);
      else if (Z && rnd() < 0.5) part(el, G.sph, blood, 's', 0, -0.12, -0.03, 0.03, 0.06, 0.02);
      part(el, G.cyl, skin, 's', 0, -0.255, 0, 0.027, 0.04, 0.021);
      // mano
      const glv = o.gloves ? 0x2a2a2c : skin, gk = o.gloves ? 'c' : 's', hw = F ? 0.9 : 1;
      part(hand, G.box, glv, gk, 0, -0.04, 0, 0.07 * hw, 0.085, 0.026);
      part(hand, G.sph, glv, gk, 0, -0.04, 0.004, 0.036 * hw, 0.045, 0.014);
      for (let f = 0; f < 4; f++) { const fx = (f - 1.5) * 0.0175 * hw, len = [0.032, 0.036, 0.034, 0.027][f], cr = Z ? 0.5 : 0.35;
        part(hand, G.cyl, glv, gk, fx, -0.083 - len / 2, -0.004, 0.0085, len, 0.0085, cr * 0.4, 0, 0);
        part(hand, G.cyl, skin, 's', fx, -0.083 - len - len * 0.45 * Math.cos(cr), -0.006 - len * 0.45 * Math.sin(cr), 0.0078, len * 0.9, 0.0078, cr, 0, 0);
        if (!Z) part(hand, G.box, mixHex(skin, 0xffffff, 0.4), 'w', fx, -0.083 - len * 1.7, -0.014 - len * 0.5 * Math.sin(cr), 0.008, 0.01, 0.003, cr, 0, 0); }
      part(hand, G.cyl, glv, gk, -s * 0.036 * hw, -0.04, -0.016, 0.0105, 0.045, 0.0105, -0.55, 0, s * 0.55);
      part(hand, G.sph, skin, 's', -s * 0.047 * hw, -0.06, -0.03, 0.01, 0.012, 0.01);
      if (Z) part(hand, G.sph, pk([blood, 0x3a2a1a]), 's', 0, -0.06, -0.012, 0.03, 0.035, 0.012);
    }
    // ----- cabeza -----
    const HP = F ? [[0, -0.005], [0.042, 0.0], [0.057, 0.02], [0.07, 0.05], [0.08, 0.085], [0.087, 0.12], [0.091, 0.155], [0.087, 0.19], [0.071, 0.218], [0.043, 0.235], [0, 0.241]]
      : [[0, -0.005], [0.046, 0.0], [0.062, 0.02], [0.075, 0.05], [0.085, 0.085], [0.091, 0.12], [0.0945, 0.155], [0.09, 0.19], [0.074, 0.218], [0.045, 0.236], [0, 0.242]];
    part(head, LATHE(HP, 14), skin, 's', 0, 0, 0.006, 0.86, 1, 1.1);
    const jaw = Z ? -0.012 : 0;
    part(head, G.sph, skin, 's', 0, 0.05 + jaw, -0.062, F ? 0.022 : 0.027, 0.022, 0.024); // mentón
    for (const s of [-1, 1]) {
      if (Z) part(head, G.sph, mixHex(skin, 0x6a6a5a, 0.3), 's', s * 0.042, 0.124, -0.072, 0.02, 0.012, 0.012); // pómulo hundido
      if (!(Z && s > 0 && rnd() < 0.25)) { part(head, G.sph, sk2, 's', s * 0.08, 0.13, 0.008, 0.01, 0.03, 0.02); part(head, G.sph, shade(sk2, -0.25), 's', s * 0.085, 0.13, 0.004, 0.005, 0.018, 0.012); }
      else part(head, G.sph, flesh, 's', s * 0.078, 0.13, 0.008, 0.008, 0.02, 0.016);
      part(head, G.sph, Z ? 0x1e1612 : shade(sk2, -0.04), 's', s * 0.031, 0.149, -0.083, 0.017, 0.011, 0.01); // cuenca
      part(head, G.sph, Z ? 0xccc8b4 : 0xf4f2ee, 'w', s * 0.031, 0.148, -0.0865, 0.0118, 0.0082, 0.0105);
      if (!Z) { part(head, G.sph, hex(o.eye || 0x3a2a1a), 'w', s * 0.031, 0.148, -0.0968, 0.0064, 0.0064, 0.0022); part(head, G.sph, 0x080808, 'w', s * 0.031, 0.148, -0.0986, 0.0033, 0.0033, 0.0012); }
      else part(head, G.sph, 0x9a9a88, 'w', s * 0.031, 0.148, -0.0968, 0.0055, 0.0055, 0.002);
      part(head, G.box, Z ? shade(skin, -0.3) : sk2, 's', s * 0.031, 0.157, -0.092, 0.028, 0.005, 0.012, 0.25, 0, 0); // párpado
      if (!Z || rnd() < 0.5) part(head, G.box, Z ? shade(hair, -0.1) : shade(hair, -0.05), 'c', s * 0.032, 0.17, -0.095, F ? 0.028 : 0.032, F ? 0.0045 : 0.0065, 0.008, 0, s * 0.15, s * (F ? 0.12 : 0.06)); // ceja
      if (age === 2 && !Z) part(head, G.box, shade(skin, -0.15), 's', s * 0.058, 0.142, -0.084, 0.012, 0.003, 0.004, 0, s * 0.5, 0.3); // patas de gallo
    }
    part(head, G.box, sk2, 's', 0, 0.165, -0.086, F ? 0.06 : 0.068, 0.014, 0.022); // arco superciliar
    if (age === 2 && !Z) for (const y of [0.188, 0.198]) part(head, G.box, shade(skin, -0.12), 's', 0, y, -0.088, 0.05, 0.002, 0.004);
    const noseGone = Z && rnd() < 0.25;
    if (!noseGone) { part(head, G.box, sk2, 's', 0, 0.132, -0.097, F ? 0.011 : 0.013, 0.04, 0.016, 0.3, 0, 0); part(head, G.sph, sk2, 's', 0, 0.112, -0.104, F ? 0.013 : 0.015, 0.013, 0.015); for (const s of [-1, 1]) part(head, G.sph, sk2, 's', s * 0.012, 0.108, -0.097, 0.009, 0.008, 0.009); part(head, G.box, shade(sk2, -0.4), 's', 0, 0.104, -0.1, 0.014, 0.003, 0.006); }
    else { part(head, G.sph, 0x1a0806, 's', 0, 0.115, -0.096, 0.018, 0.02, 0.01); }
    if (Z) {
      part(head, G.box, 0x1a0402, 'w', 0, 0.072 + jaw / 2, -0.08, 0.042, 0.03, 0.02);
      part(head, G.box, 0x5a1a14, 's', 0, 0.088, -0.084, 0.046, 0.007, 0.012); part(head, G.box, 0x5a1a14, 's', 0, 0.06 + jaw, -0.08, 0.042, 0.007, 0.012);
      for (let t = 0; t < 6; t++) { part(head, G.box, pk([0xc8c09a, 0xb4a880, 0xd8d0b0]), 'w', (t - 2.5) * 0.007, 0.082, -0.088, 0.006, 0.01, 0.005); if (rnd() < 0.8) part(head, G.box, pk([0xc8c09a, 0xa89c74]), 'w', (t - 2.5) * 0.0068, 0.066 + jaw, -0.085, 0.0055, 0.009, 0.005); }
      part(head, G.sph, blood, 's', 0, 0.048 + jaw, -0.07, 0.035, 0.028, 0.02); part(head, G.box, blood, 's', 0.01, 0.02, -0.075, 0.012, 0.05, 0.008);
      if (rnd() < 0.5) part(head, G.sph, flesh, 's', -0.06, 0.1, -0.065, 0.025, 0.03, 0.015);
      if (rnd() < 0.4) part(head, G.sph, blood, 's', 0.03, 0.22, -0.04, 0.035, 0.02, 0.04);
    } else {
      part(head, G.sph, lip, 's', 0, 0.084, -0.086, F ? 0.019 : 0.019, F ? 0.0045 : 0.0035, 0.008); part(head, G.sph, lip, 's', 0, 0.076, -0.084, F ? 0.017 : 0.017, F ? 0.0055 : 0.0045, 0.008); part(head, G.box, shade(lip, -0.4), 's', 0, 0.0805, -0.091, 0.03, 0.0018, 0.004);
      part(head, G.box, sk2, 's', 0, 0.094, -0.091, 0.01, 0.008, 0.004); // surco nasolabial
    }
    // pelo
    const st = Z ? pk(['short', 'messy', 'long', 'bald', 'side', 'buzz']) : (o.style || 'short');
    const scalp = (r, col) => part(head, G.capT, col, 'c', 0, 0.158, 0.014, 0.082 * r, 0.09 * r, 0.104 * r, -0.16, 0, 0);
    if (st !== 'bald') {
      if (st === 'buzz' || st === 'mohawk') scalp(1.02, mixHex(skin, hair, 0.6));
      else { scalp(1.06, hair); part(head, G.sph, hair, 'c', 0, 0.12, 0.05, 0.078, 0.09, 0.07); }
      if (st === 'side') { part(head, G.sph, hair, 'c', 0.02, 0.228, -0.035, 0.07, 0.024, 0.06, 0.15, 0, -0.15); }
      if (st === 'short' || st === 'messy' || st === 'side') { part(head, G.sph, hair, 'c', 0, 0.218, -0.06, 0.066, 0.016, 0.03, 0.35, 0, 0); for (const s of [-1, 1]) part(head, G.box, hair, 'c', s * 0.076, 0.13, -0.018, 0.008, 0.04, 0.03); }
      if (st === 'messy' || Z) for (let i = 0; i < (Z ? 6 : 12); i++) { const a = rnd() * 6.28; part(head, G.sphL, hair, 'c', Math.cos(a) * 0.06, 0.225 + rnd() * 0.025, Math.sin(a) * 0.06 + 0.005, 0.032, 0.018, 0.04, rnd(), rnd(), 0); }
      if (st === 'long' || st === 'ponytail' || st === 'bun') { part(head, G.sph, hair, 'c', 0, 0.212, -0.062, 0.07, 0.02, 0.032, 0.45, 0, 0); }
      if (st === 'long') { part(head, G.sph, hair, 'c', 0, 0.07, 0.055, 0.086, 0.15, 0.062); part(head, G.sph, hair, 'c', 0, -0.04, 0.07, 0.07, 0.09, 0.04); for (const s of [-1, 1]) part(head, G.sph, hair, 'c', s * 0.074, 0.08, 0.0, 0.018, 0.11, 0.055); }
      if (st === 'ponytail') { part(head, G.sph, hair, 'c', 0, 0.16, 0.1, 0.03, 0.03, 0.03); part(head, G.cone, hair, 'c', 0, 0.06, 0.13, 0.035, 0.2, 0.03, Math.PI + 0.25, 0, 0); }
      if (st === 'bun') part(head, G.sph, hair, 'c', 0, 0.23, 0.08, 0.05, 0.045, 0.05);
      if (st === 'curly') for (let i = 0; i < 26; i++) { const a = rnd() * 6.28, r = 0.03 + rnd() * 0.065; part(head, G.sphL, hair, 'c', Math.cos(a) * r, 0.21 + rnd() * 0.04 - r * 0.3, Math.sin(a) * r + 0.012, 0.03, 0.03, 0.03); }
      if (st === 'afro') part(head, G.sph, hair, 'c', 0, 0.2, 0.02, 0.135, 0.12, 0.135);
      if (st === 'mohawk') for (let i = 0; i < 8; i++) part(head, G.cone, hair, 'c', 0, 0.245 - Math.abs(i - 3.5) * 0.004, -0.07 + i * 0.022, 0.012, 0.07, 0.03, -0.3 + i * 0.08, 0, 0);
      if (age === 2 && !Z && st !== 'long') part(head, G.box, skin, 's', 0, 0.226, -0.075, 0.06, 0.02, 0.03, 0.5, 0, 0); // entradas
    }
    const bd = Z ? (rnd() < 0.3 ? 'stub' : 'none') : (o.beard || 'none'), bh = shade(hair, -0.05);
    if (bd === 'stub') { part(head, G.sph, mixHex(skin, hair, 0.3), 's', 0, 0.06, -0.044, 0.07, 0.046, 0.054); }
    if (bd === 'goatee') { part(head, G.box, bh, 'c', 0, 0.058, -0.082, 0.028, 0.03, 0.02); part(head, G.box, bh, 'c', 0, 0.091, -0.093, 0.04, 0.007, 0.01); }
    if (bd === 'mous') part(head, G.box, bh, 'c', 0, 0.091, -0.093, 0.044, 0.01, 0.012);
    if (bd === 'short' || bd === 'full') { part(head, G.sph, bh, 'c', 0, 0.058, -0.045, 0.074, 0.05, 0.058); part(head, G.box, bh, 'c', 0, 0.091, -0.093, 0.046, 0.011, 0.012); for (const s of [-1, 1]) part(head, G.box, bh, 'c', s * 0.07, 0.1, -0.02, 0.012, 0.06, 0.05); }
    if (bd === 'full') part(head, G.cone, bh, 'c', 0, 0.015, -0.075, 0.045, 0.08, 0.04, Math.PI, 0, 0);
    if (o.glasses && o.glasses !== 'none') { const gc = 0x1a1a1e; for (const s of [-1, 1]) { part(head, G.torus, gc, 'w', s * 0.031, 0.149, -0.101, 0.02, 0.017, 0.017); if (o.glasses === 'shades') part(head, G.cyl, 0x0a0a0e, 'w', s * 0.031, 0.149, -0.101, 0.02, 0.003, 0.016, Math.PI / 2, 0, 0); part(head, G.box, gc, 'w', s * 0.066, 0.152, -0.05, 0.003, 0.005, 0.1); } part(head, G.box, gc, 'w', 0, 0.151, -0.101, 0.022, 0.004, 0.004); }
    if (o.hat === 'cap') { const cc = hex(o.hatc || 0x3a4a2a); part(head, G.capT, cc, 'c', 0, 0.158, 0.01, 0.1, 0.098, 0.11, -0.12, 0, 0); part(head, G.box, cc, 'c', 0, 0.192, -0.125, 0.15, 0.01, 0.085, 0.12, 0, 0); }
    if (o.hat === 'beanie') { const cc = hex(o.hatc || 0x3a4a2a); part(head, G.capT, cc, 'c', 0, 0.16, 0.012, 0.102, 0.11, 0.112, -0.2, 0, 0); part(head, G.cyl, shade(cc, -0.15), 'c', 0, 0.175, 0.005, 0.1, 0.035, 0.11, -0.2, 0, 0); }
    if (o.hat === 'bandana') { const cc = hex(o.hatc || 0x7a2a2a); part(head, G.capT, cc, 'c', 0, 0.16, 0.012, 0.099, 0.09, 0.108, -0.32, 0, 0); part(head, G.cone, cc, 'c', 0, 0.16, 0.11, 0.03, 0.08, 0.01, Math.PI * 0.85, 0, 0); }

    // ---------- fusionar en una SkinnedMesh ----------
    rig.updateMatrixWorld(true);
    let n = 0; const list = [];
    bones.forEach((b, bi) => { const ps = b.userData.parts; if (!ps) return; delete b.userData.parts; for (const p of ps) { const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone(); g.applyMatrix4(_m.multiplyMatrices(b.matrixWorld, p.m)); n += g.attributes.position.count; list.push([g, p.col, p.kind, bi]); } });
    const Pp = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), C = new Float32Array(n * 3), SI = new Uint16Array(n * 4), SW = new Float32Array(n * 4); let off = 0;
    for (const [g, col, kind, bi] of list) {
      const cnt = g.attributes.position.count, r = REG[kind] || REG.c, uv = g.attributes.uv; Pp.set(g.attributes.position.array, off * 3); N.set(g.attributes.normal.array, off * 3); _c.setHex(col);
      for (let i = 0; i < cnt; i++) { const k = off + i; C[k * 3] = _c.r; C[k * 3 + 1] = _c.g; C[k * 3 + 2] = _c.b; const u = uv ? uv.getX(i) : 0.5, v = uv ? uv.getY(i) : 0.5; U[k * 2] = r[0] + (u - Math.floor(u === 1 ? 0 : u)) * (r[1] - r[0]); U[k * 2 + 1] = 0.004 + v * 0.992; SI[k * 4] = bi; SW[k * 4] = 1; }
      off += cnt;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(Pp, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(SW, 4)); geo.computeBoundingSphere(); geo.boundingSphere.radius += 0.6;
    const mesh = new THREE.SkinnedMesh(geo, Z ? MAT_Z : MAT_P); mesh.castShadow = true; mesh.receiveShadow = false;
    mesh.add(rig); root.add(mesh); mesh.bind(new THREE.Skeleton(bones));
    const hs = (o.height || 1) * (F ? 0.94 : 1) * 0.97; rig.scale.setScalar(hs);
    return { root, P, mesh, h: 1.8 * hs, eye: 1.62 * hs / 0.97, r: 0.36, headY: 1.72 * hs, headR: 0.14, dog: false, human: true, meshes: [mesh] };
  }

  // brazos en primera persona: manga, muñeca y mano cerrada (agarre)
  function fpArm(group, side, skinC, sleeveC, mk) {
    const skin = hex(skinC), sl = hex(sleeveC), cuff = mixHex(sl, 0x000000, 0.25), dk = mixHex(skin, 0x6a3a2a, 0.18), nail = mixHex(skin, 0xffffff, 0.45);
    const add = (geo, col, px, py, pz, sx, sy, sz, rx = 0, ry = 0, rz = 0) => { part(group, geo, col, 'c', px, py, pz, sx, sy, sz, rx, ry, rz); };
    // manga (antebrazo hacia la cámara, eje +z)
    add(LATHE([[0, 0.0], [0.05, 0.0], [0.056, 0.1], [0.064, 0.3], [0.07, 0.5], [0, 0.5]], 16), sl, 0, -0.012, 0.14, 1, 1, 1, Math.PI / 2, 0, 0);
    add(LATHE([[0.052, -0.005], [0.054, 0.04], [0, 0.04]], 16), cuff, 0, -0.012, 0.13, 1, 1, 1, Math.PI / 2, 0, 0);
    const gl = 0x2c2c2e, gl2 = 0x3c3c3a, strap = 0x1c1c1e;
    add(G.cyl, gl, 0, -0.008, 0.1, 0.04, 0.07, 0.034, Math.PI / 2, 0, 0); // puño del guante
    add(G.box, strap, 0, 0.02, 0.1, 0.07, 0.012, 0.04); // velcro
    add(G.sph, gl, 0, 0, 0.035, 0.05, 0.034, 0.06);
    add(G.box, gl, 0, 0.003, 0.0, 0.09, 0.046, 0.072);
    add(G.box, gl2, 0, 0.027, -0.005, 0.07, 0.006, 0.05); // refuerzo del dorso
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.0215, L = [0.026, 0.03, 0.028, 0.022][f], r = [0.0115, 0.012, 0.0115, 0.01][f];
      add(G.sph, gl2, fx, 0.018, -0.034, r * 1.05, r * 0.85, r * 1.05);
      add(G.cyl, gl, fx, 0.012, -0.036 - L / 2, r, L, r, Math.PI / 2, 0, 0);
      add(G.sph, gl, fx, 0.012, -0.036 - L, r, r, r);
      add(G.cyl, gl, fx, 0.012 - L * 0.5, -0.036 - L * 1.05, r * 0.97, L * 0.95, r * 0.97, 0, 0, 0);
      add(G.sph, skin, fx, 0.012 - L, -0.036 - L * 1.02, r * 0.93, r * 0.93, r * 0.93);
      add(G.cyl, skin, fx, -0.002 - L, -0.036 - L * 0.62, r * 0.88, L * 0.7, r * 0.88, Math.PI / 2 + 0.45, 0, 0);
      add(G.box, nail, fx, -0.003 - L * 1.02, -0.036 - L * 0.38, r * 1.1, r * 0.45, r * 1.2, 0.45, 0, 0);
    }
    add(G.sph, gl, side * 0.046, -0.004, 0.01, 0.019, 0.018, 0.028);
    add(G.cyl, gl, side * 0.04, -0.016, -0.026, 0.013, 0.04, 0.013, Math.PI / 2 - 0.3, 0, side * -0.5);
    add(G.sph, skin, side * 0.024, -0.025, -0.048, 0.012, 0.012, 0.013);
    add(G.box, nail, side * 0.02, -0.029, -0.056, 0.013, 0.005, 0.011, 0, side * 0.4, 0);
    const parts = group.userData.parts; delete group.userData.parts;
    let n = 0; const gs = parts.map(p => { const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone(); g.applyMatrix4(p.m); n += g.attributes.position.count; return [g, p.col]; });
    const Pp = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), C = new Float32Array(n * 3); let o = 0;
    for (const [g, col] of gs) { const c = g.attributes.position.count; Pp.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2); _c.setHex(col); for (let i = 0; i < c; i++) { C[(o + i) * 3] = _c.r; C[(o + i) * 3 + 1] = _c.g; C[(o + i) * 3 + 2] = _c.b; } o += c; }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(Pp, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(N, 3)); bg.setAttribute('uv', new THREE.BufferAttribute(U, 2)); bg.setAttribute('color', new THREE.BufferAttribute(C, 3));
    const m = mk(); const me = new THREE.Mesh(bg, m); me.renderOrder = 20; group.add(me); return me;
  }
  return { build, fpArm, cleanTex, dull, mixHex, OUTFITS };
})();
