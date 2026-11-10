// ===== Ciudad: recreación aproximada de La Llagosta =====
'use strict';
const CITY = { rooms: [], conts: [], spawn: null, streetPts: [], labels: [], lamps: null };
(function () {
  const Y = POIS[0].h;
  // ---------- fusionador de geometría (una malla por material) ----------
  const UB = (() => { const g = new THREE.BoxGeometry(1, 1, 1).toNonIndexed(); return { p: g.attributes.position.array, n: g.attributes.normal.array }; })();
  class Merger {
    constructor() { this.p = []; this.n = []; this.c = []; }
    box(x, y, z, w, h, d, col) { const c = new THREE.Color(col); for (let i = 0; i < UB.p.length; i += 3) { this.p.push(x + UB.p[i] * w, y + UB.p[i + 1] * h, z + UB.p[i + 2] * d); this.n.push(UB.n[i], UB.n[i + 1], UB.n[i + 2]); this.c.push(c.r, c.g, c.b); } }
    geo(g, m4, col) { const gg = g.index ? g.toNonIndexed() : g, P = gg.attributes.position, N = gg.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(m4), v = new THREE.Vector3(), c = new THREE.Color(col); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(m4); this.p.push(v.x, v.y, v.z); v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); this.n.push(v.x, v.y, v.z); this.c.push(c.r, c.g, c.b); } }
    mesh(mat, shadow = true) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.computeBoundingSphere(); const m = new THREE.Mesh(g, mat); m.castShadow = shadow; m.receiveShadow = true; return m; }
  }
  const MAT = {
    solid: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0, envMapIntensity: 0.7 }),
    glass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.05, metalness: 0.7, envMapIntensity: 1.6 }),
    lamp: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
  };
  // ---------- texturas procedurales (dibujadas en canvas, repetibles) ----------
  const tr = mulberry32(777);
  function ctex(size, draw) { const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); draw(x, size); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; }
  function wrapDraw(S, px, py, r, fn) { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const X = px + ox, Yy = py + oy; if (X < -r || X > S + r || Yy < -r || Yy > S + r) continue; fn(X, Yy); } }
  function speck(x, S, n, cols, r0, r1, a) { for (let i = 0; i < n; i++) { const px = tr() * S, py = tr() * S, r = r0 + (r1 - r0) * tr(); x.globalAlpha = a * (0.4 + 0.6 * tr()); x.fillStyle = cols[Math.floor(tr() * cols.length)]; wrapDraw(S, px, py, r, (X, Yy) => { x.beginPath(); x.arc(X, Yy, r, 0, 7); x.fill(); }); } x.globalAlpha = 1; }
  const TX = {
    noise: ctex(256, (x, S) => { x.fillStyle = '#ececec'; x.fillRect(0, 0, S, S); speck(x, S, 900, ['#ffffff', '#d4d4d4', '#c8c8c8'], 0.6, 2.2, 0.5); }),
    asphalt: ctex(512, (x, S) => { x.fillStyle = '#55575c'; x.fillRect(0, 0, S, S); speck(x, S, 260, ['#4a4c50', '#62646a'], 20, 60, 0.25); speck(x, S, 9000, ['#3c3e42', '#6e7074', '#808080', '#2e3034'], 0.5, 1.6, 0.8);
      x.strokeStyle = 'rgba(25,25,28,.65)'; x.lineWidth = 1.6; for (let k = 0; k < 7; k++) { let px = tr() * S, py = tr() * S; x.beginPath(); x.moveTo(px, py); for (let j = 0; j < 9; j++) { px += (tr() - 0.5) * 50; py += (tr() - 0.3) * 40; x.lineTo(px, py); } x.stroke(); }
      x.fillStyle = 'rgba(30,30,32,.35)'; x.fillRect(tr() * S * 0.6, tr() * S * 0.6, 120, 70); }),
    panot: ctex(256, (x, S) => { x.fillStyle = '#c6c0b4'; x.fillRect(0, 0, S, S); speck(x, S, 1500, ['#b4ad9f', '#d6d0c4', '#a8a194'], 0.6, 1.8, 0.6); const T = S / 2;
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { const ox = a * T, oy = b * T; x.strokeStyle = '#8e877a'; x.lineWidth = 4; x.strokeRect(ox + 2, oy + 2, T - 4, T - 4); x.lineWidth = 3; x.strokeStyle = 'rgba(120,112,100,.85)';
        for (const [cx, cy] of [[0, 0], [T, 0], [0, T], [T, T]]) { x.beginPath(); x.arc(ox + cx, oy + cy, T * 0.36, 0, 7); x.stroke(); } x.beginPath(); x.arc(ox + T / 2, oy + T / 2, T * 0.14, 0, 7); x.stroke(); } }),
    plaster: ctex(512, (x, S) => { x.fillStyle = '#f0efec'; x.fillRect(0, 0, S, S); speck(x, S, 120, ['#e2e0dc', '#f8f8f6'], 15, 50, 0.35); speck(x, S, 5000, ['#d8d6d2', '#ffffff'], 0.5, 1.4, 0.5);
      for (let k = 0; k < 14; k++) { const px = tr() * S, w = 3 + tr() * 10, g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, 'rgba(90,80,70,0)'); g.addColorStop(tr(), 'rgba(90,80,70,.10)'); g.addColorStop(1, 'rgba(90,80,70,0)'); x.fillStyle = g; x.fillRect(px, 0, w, S); } }),
    brick: ctex(512, (x, S) => { x.fillStyle = '#cfc6b8'; x.fillRect(0, 0, S, S); const rh = S / 16, bw = S / 6; for (let r = 0; r < 16; r++) for (let c = -1; c < 7; c++) { const ox = c * bw + (r % 2 ? bw / 2 : 0); const v = tr(); x.fillStyle = `rgb(${170 + v * 40 | 0},${78 + v * 30 | 0},${52 + v * 20 | 0})`; x.fillRect(ox + 2, r * rh + 2, bw - 4, rh - 4); } speck(x, S, 4000, ['#7a3a26', '#d88a66', '#5a3020'], 0.5, 1.5, 0.35); }),
    stone: ctex(256, (x, S) => { x.fillStyle = '#d8d2c6'; x.fillRect(0, 0, S, S); speck(x, S, 3000, ['#c4bdb0', '#e6e0d6', '#b0a898'], 0.5, 1.8, 0.6); x.strokeStyle = 'rgba(120,112,100,.5)'; x.lineWidth = 2; for (let r = 0; r <= 2; r++) { x.beginPath(); x.moveTo(0, r * S / 2); x.lineTo(S, r * S / 2); x.stroke(); } for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { x.beginPath(); const px = c * S / 2 + (r ? S / 4 : 0); x.moveTo(px, r * S / 2); x.lineTo(px, r * S / 2 + S / 2); x.stroke(); } }),
    roof: ctex(256, (x, S) => { x.fillStyle = '#8c8882'; x.fillRect(0, 0, S, S); speck(x, S, 7000, ['#6a6660', '#a6a29a', '#5a5650', '#b8b4ac'], 0.6, 2, 0.8); }),
    tile: ctex(256, (x, S) => { const n = 4, T = S / n; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { const v = tr() * 14; x.fillStyle = `rgb(${226 - v | 0},${220 - v | 0},${208 - v | 0})`; x.fillRect(a * T, b * T, T, T); } x.strokeStyle = '#a8a094'; x.lineWidth = 3; for (let k = 0; k <= n; k++) { x.beginPath(); x.moveTo(k * T, 0); x.lineTo(k * T, S); x.moveTo(0, k * T); x.lineTo(S, k * T); x.stroke(); } speck(x, S, 600, ['#ffffff', '#c8c0b4'], 0.5, 1.4, 0.4); }),
    wood: ctex(256, (x, S) => { const n = 6, h = S / n; for (let r = 0; r < n; r++) { const v = tr(); x.fillStyle = `rgb(${150 + v * 40 | 0},${100 + v * 28 | 0},${58 + v * 18 | 0})`; x.fillRect(0, r * h, S, h); x.strokeStyle = 'rgba(70,40,20,.25)'; x.lineWidth = 1; for (let g = 0; g < 6; g++) { x.beginPath(); const yy = r * h + tr() * h; x.moveTo(0, yy); for (let px = 0; px <= S; px += 16) x.lineTo(px, yy + Math.sin(px * 0.05 + g) * 2); x.stroke(); } x.fillStyle = 'rgba(40,22,10,.6)'; x.fillRect(0, r * h, S, 2); } }),
    metal: ctex(256, (x, S) => { for (let i = 0; i < S; i += 16) { const g = x.createLinearGradient(i, 0, i + 16, 0); g.addColorStop(0, '#9a9ca2'); g.addColorStop(0.5, '#d8dade'); g.addColorStop(1, '#8a8c92'); x.fillStyle = g; x.fillRect(i, 0, 16, S); } speck(x, S, 50, ['#8a5a3a', '#6a4a30'], 3, 14, 0.35); speck(x, S, 2000, ['#70727a', '#ffffff'], 0.4, 1, 0.3); }),
    slat: ctex(128, (x, S) => { const n = 12, h = S / n; for (let r = 0; r < n; r++) { const g = x.createLinearGradient(0, r * h, 0, r * h + h); g.addColorStop(0, '#ffffff'); g.addColorStop(0.8, '#cfcfcf'); g.addColorStop(1, '#8a8a8a'); x.fillStyle = g; x.fillRect(0, r * h, S, h); } }),
    bark: ctex(256, (x, S) => { x.fillStyle = '#b8b29a'; x.fillRect(0, 0, S, S); speck(x, S, 160, ['#8a8a6a', '#d8d0b4', '#7a7a5a', '#a0a080'], 6, 22, 0.8); }),
  };
  const _wsN = { n: 0 };
  function wsMat(tex, scale, mult = 1.15, opts = {}) {
    const id = _wsN.n++, m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.86, metalness: 0, envMapIntensity: 0.65 }, opts));
    m.onBeforeCompile = sh => {
      sh.uniforms.uTex = { value: tex }; sh.uniforms.uSc = { value: scale }; sh.uniforms.uY = { value: Y };
      sh.vertexShader = 'varying vec3 vWP2; varying vec3 vWN2;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP2 = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN2 = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = 'uniform sampler2D uTex; uniform float uSc; uniform float uY; varying vec3 vWP2; varying vec3 vWN2;\nfloat h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }\nfloat fbm(vec2 p){ return vn(p) * 0.5 + vn(p * 2.1) * 0.3 + vn(p * 4.3) * 0.2; }\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec3 an = abs(vWN2); vec2 tuv = an.y > 0.55 ? vWP2.xz : (an.x > an.z ? vec2(vWP2.z, vWP2.y) : vec2(vWP2.x, vWP2.y));
        vec3 tc = pow(texture2D(uTex, tuv * uSc).rgb, vec3(2.2));
        diffuseColor.rgb *= tc * ${mult.toFixed(3)};
        if (an.y < 0.55) {
          diffuseColor.rgb *= mix(0.6, 1.0, smoothstep(uY, uY + 1.4, vWP2.y));
          float wc = an.x > an.z ? vWP2.z : vWP2.x;
          float stn = fbm(vec2(wc, vWP2.y) * 0.32), stk = vn(vec2(wc * 2.6, vWP2.y * 0.09));
          diffuseColor.rgb *= mix(1.0, 0.5, smoothstep(0.55, 0.82, stn) * 0.85) * mix(1.0, 0.72, smoothstep(0.55, 0.9, stk));
          float soot = smoothstep(0.68, 0.9, fbm(vec2(wc * 0.08, vWP2.y * 0.05) + 13.0));
          diffuseColor.rgb *= mix(1.0, 0.3, soot * smoothstep(uY + 2.0, uY + 7.0, vWP2.y));
          float moss = smoothstep(uY + 1.3, uY, vWP2.y) * smoothstep(0.45, 0.75, fbm(vec2(wc, vWP2.y) * 1.4));
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.42, 0.52, 0.28), moss * 0.75);
        } else {
          float dd = fbm(vWP2.xz * 0.12), cr = smoothstep(0.62, 0.66, vn(vWP2.xz * 1.7)) * smoothstep(0.5, 0.7, dd);
          diffuseColor.rgb *= mix(1.0, 0.68, smoothstep(0.45, 0.8, dd)) * (1.0 - cr * 0.35);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.55, 0.62, 0.35), smoothstep(0.7, 0.85, fbm(vWP2.xz * 0.5 + 7.0)) * 0.6);
        }
        float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)); diffuseColor.rgb = mix(vec3(lum), diffuseColor.rgb, 0.7) * vec3(1.0, 0.98, 0.93);`);
    };
    m.customProgramCacheKey = () => 'ws' + id; return m;
  }
  const TM = {
    gen: wsMat(TX.noise, 0.6, 1.08), asphalt: wsMat(TX.asphalt, 0.22, 1.0, { roughness: 0.95 }), panot: wsMat(TX.panot, 2.5, 1.12), plaster: wsMat(TX.plaster, 0.22, 1.05),
    brick: wsMat(TX.brick, 0.42, 1.25), stone: wsMat(TX.stone, 0.7, 1.1), roof: wsMat(TX.roof, 0.6, 1.25, { roughness: 1 }), tile: wsMat(TX.tile, 1.1, 1.1, { roughness: 0.4 }),
    wood: wsMat(TX.wood, 0.9, 1.3, { roughness: 0.7 }), metal: wsMat(TX.metal, 1.2, 1.1, { roughness: 0.45, metalness: 0.35 }), slat: wsMat(TX.slat, 2.5, 1.1), bark: wsMat(TX.bark, 1.4, 1.2),
  };
  CITY.TM = TM; CITY.TX = TX;
  // cada zona (ciudad, cada pueblo, carreteras) tiene sus propias mallas fusionadas para poder ocultar lo lejano
  let SOL, GL, LMP, FLAT, ASM, PAN, FAC, BRK, STN, ROOF, TIL, WOD, MET, SLT, BRKT, DEC, INT_P, INT_W, INT_T, INT_F;
  const AREAS = {};
  const mkSet = () => { const o = {}; for (const k of ['SOL', 'GL', 'LMP', 'FLAT', 'ASM', 'PAN', 'FAC', 'BRK', 'STN', 'ROOF', 'TIL', 'WOD', 'MET', 'SLT', 'BRKT', 'DEC', 'INT_P', 'INT_W', 'INT_T', 'INT_F']) o[k] = new Merger(); return o; };
  function useArea(name) { const a = AREAS[name] || (AREAS[name] = mkSet()); ({ SOL, GL, LMP, FLAT, ASM, PAN, FAC, BRK, STN, ROOF, TIL, WOD, MET, SLT, BRKT, DEC, INT_P, INT_W, INT_T, INT_F } = a); }
  useArea('city');
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  const geoSph = new THREE.IcosahedronGeometry(1, 1), geoCyl = new THREE.CylinderGeometry(1, 1, 1, 10);
  // ---------- calles ----------
  const XS = [-198, -132, -66, 0, 66, 132], XW = [10, 10, 10, 16, 10, 10];
  const ZS = [-198, -132, -66, 0, 66, 132], ZW = [10, 10, 10, 10, 10, 10];
  const XN = ['Carrer de Girona', 'Carrer de Caldes', 'Carrer de Sant Josep', 'Avinguda del Primer de Maig', 'Carrer Major', 'Carrer de la Via'];
  const ZN = ['Carrer de Barcelona', "Carrer de l'Estació", 'Carrer de Sant Miquel', 'Carrer de Brutau', "Carrer d'Anselm Clavé", 'Ronda de la Riera Seca'];
  const SW = 2.6, L0 = -224, L1 = 158, LC = (L0 + L1) / 2;
  const ASF = 0x4a4c52, ACERA = 0xb8b2a6, BORD = 0xd8d4cc, LINE = 0xf2f0e8;
  for (let i = 0; i < XS.length; i++) {
    const x = XS[i], w = XW[i];
    ASM.box(x, Y + 0.02, LC, w, 0.04, L1 - L0 + 10, 0xffffff);
    for (const s of [-1, 1]) { PAN.box(x + s * (w / 2 + SW / 2), Y + 0.06, LC, SW, 0.12, L1 - L0 + 10, 0xffffff); STN.box(x + s * (w / 2 + 0.1), Y + 0.08, LC, 0.2, 0.16, L1 - L0 + 10, 0xe8e4dc); }
    for (let z = L0; z < L1; z += 6) if (!ZS.some(zz => Math.abs(z - zz) < 8)) FLAT.box(x, Y + 0.045, z, 0.18, 0.02, 3, LINE);
    CITY.labels.push({ name: XN[i], x, z: L0 + 14, vertical: true });
  }
  for (let j = 0; j < ZS.length; j++) {
    const z = ZS[j], w = ZW[j];
    ASM.box(LC, Y + 0.025, z, L1 - L0 + 10, 0.04, w, 0xffffff);
    for (const s of [-1, 1]) { PAN.box(LC, Y + 0.065, z + s * (w / 2 + SW / 2), L1 - L0 + 10, 0.12, SW, 0xffffff); STN.box(LC, Y + 0.085, z + s * (w / 2 + 0.1), L1 - L0 + 10, 0.16, 0.2, 0xe8e4dc); }
    for (let x = L0; x < L1; x += 6) if (!XS.some(xx => Math.abs(x - xx) < 10)) FLAT.box(x, Y + 0.05, z, 3, 0.02, 0.18, LINE);
    CITY.labels.push({ name: ZN[j], x: L0 + 30, z });
  }
  // pasos de cebra
  for (let i = 0; i < XS.length; i++) for (let j = 0; j < ZS.length; j++) {
    const x = XS[i], z = ZS[j], xw = XW[i], zw = ZW[j];
    for (let k = -3; k <= 3; k++) { for (const s of [-1, 1]) { FLAT.box(x + k * 1.2 * (xw / 10), Y + 0.05, z + s * (zw / 2 + 1.6), 0.6, 0.02, 2.4, LINE); FLAT.box(x + s * (xw / 2 + 1.6), Y + 0.05, z + k * 1.2, 2.4, 0.02, 0.6, LINE); } }
  }
  // ---------- manzanas ----------
  const BX = [], BZ = [];
  const pushRanges = (S, W, out) => { out.push([L0 - 10, S[0] - W[0] / 2 - SW]); for (let i = 0; i < S.length - 1; i++) out.push([S[i] + W[i] / 2 + SW, S[i + 1] - W[i + 1] / 2 - SW]); out.push([S[S.length - 1] + W[S.length - 1] / 2 + SW, L1 + 10]); };
  pushRanges(XS, XW, BX); pushRanges(ZS, ZW, BZ);
  const FACC = [0xe8d8b8, 0xf2e2c4, 0xd8b890, 0xe8c8a0, 0xf4ece0, 0xd89a7a, 0xe8b898, 0xc8b8a8, 0xf0d8a8, 0xdcc8b0, 0xb8a890];
  const SHOPC = [0xc83a3a, 0x2a7a4a, 0x2a5aa8, 0xe8a02a, 0x6a3fb5, 0x2a9a8a, 0x8a4a2a];
  const segs = [];
  function makeSeg(side, x0, z0, x1, z1, c, w, D, floors, block) {
    let fx, fz, nx = 0, nz = 0, tx = 0, tz = 0;
    if (side === 'S') { fx = c; fz = z0; nz = -1; tx = 1; } if (side === 'N') { fx = c; fz = z1; nz = 1; tx = 1; }
    if (side === 'W') { fx = x0; fz = c; nx = -1; tz = 1; } if (side === 'E') { fx = x1; fz = c; nx = 1; tz = 1; }
    return { side, fx, fz, nx, nz, tx, tz, w, D, floors, H: floors * 3.4 + 0.4, col: pick(FACC), brick: tr() < 0.28, block, shop: rand() < 0.45 ? pick(SHOPC) : null, used: false };
  }
  const BL = BX.length - 1, BLZ = BZ.length - 1; const outerSkip = (bi, bj) => bi === BL && bj <= 3 || bj === BLZ; // vía del tren (este, sur) y Riera Seca (norte)
  for (let bi = 0; bi < BX.length; bi++) for (let bj = 0; bj < BZ.length; bj++) {
    const [x0, x1] = BX[bi], [z0, z1] = BZ[bj];
    if (outerSkip(bi, bj)) continue;
    const plaza = bi === 2 && bj === 3; // Plaça Antoni Baqué
    const outer = bi === 0 || bi === BL || bj === 0 || bj === BLZ;
    const D = Math.min(12, (x1 - x0) / 2 - 1, (z1 - z0) / 2 - 1);
    const sides = [];
    if (!plaza) { sides.push(['S', x0, x1], ['N', x0, x1], ['W', z0 + D, z1 - D], ['E', z0 + D, z1 - D]); }
    else sides.push(['N', x0, x1]);
    for (const [side, a, b] of sides) {
      // en manzanas exteriores, solo las fachadas que dan a una calle interior
      if (outer && ((bi === 0 && side === 'W') || (bi === BL && side === 'E') || (bj === 0 && side === 'S') || (bj === BLZ && side === 'N'))) continue;
      let u = a;
      while (u < b - 4) {
        let w = R(8, 14); if (b - u - w < 8) w = b - u;
        const nearAve = Math.abs((side === 'W' || side === 'E' ? (side === 'W' ? x0 : x1) : 999)) < 12;
        const floors = nearAve ? RI(3, 5) : RI(2, 4);
        segs.push(makeSeg(side, x0, z0, x1, z1, u + w / 2, w, D, floors, [bi, bj]));
        u += w;
      }
    }
    if (outer) { const fill = (bx0, bz0, bx1, bz1) => { const h = RI(2, 3) * 3.4; SOL.box((bx0 + bx1) / 2, Y + h / 2, (bz0 + bz1) / 2, bx1 - bx0, h, bz1 - bz0, 0xb8a890); addBox(bx0, Y, bz0, bx1, Y + h, bz1); };
      // cierra el lado sin fachada con naves bajas
      if (bi === 0) fill(x0, z0 + D, x0 + D, z1 - D); if (bj === 0) fill(x0, z0, x1, z0 + D);
    }
  }
  // ---------- tiendas y locales donde se puede entrar ----------
  const SHOPS = [
    { name: 'LA ORDEN DEL FRIKI', kind: 'friki', x: -6, z: -118, side: 'E', bg: '#1a0f08', fg: '#ffb43a', spawn: true },
    { name: 'SUPERMERCAT', kind: 'super', x: 40, z: -127, side: 'S', bg: '#c8202a', fg: '#ffffff', wide: true },
    { name: 'FARMÀCIA', kind: 'farmacia', x: 6, z: -40, side: 'W', bg: '#1a8a3a', fg: '#ffffff' },
    { name: 'FERRETERIA', kind: 'ferreteria', x: -60, z: 30, side: 'E', bg: '#e8a02a', fg: '#1a1a1a' },
    { name: 'BAR LA PLAÇA', kind: 'bar', x: -40, z: 5, side: 'S', bg: '#6a2a1a', fg: '#ffe0a0' },
    { name: 'FORN DE PA', kind: 'forn', x: 6, z: 30, side: 'W', bg: '#c89a5a', fg: '#3a2010' },
    { name: 'QUIOSC', kind: 'quiosc', x: -6, z: 90, side: 'E', bg: '#2a5aa8', fg: '#ffffff' },
    { name: 'POLICIA LOCAL', kind: 'policia', x: -100, z: -60, side: 'N', bg: '#1a2a6a', fg: '#ffffff' },
    { name: 'MERCAT MUNICIPAL', kind: 'mercat', x: 100, z: -127, side: 'S', bg: '#2a6a4a', fg: '#ffffff', wide: true },
    { name: 'AJUNTAMENT', kind: 'ajuntament', x: -33, z: -6, side: 'N', bg: '#6a5a4a', fg: '#ffffff' },
  ];
  SHOPS.push({ name: 'TALLER MECÀNIC', kind: 'taller', x: -190, z: -150, side: 'E', bg: '#3a3a40', fg: '#ffd23f' }, { name: 'CAP LA LLAGOSTA', kind: 'cap', x: -140, z: -190, side: 'N', bg: '#2a8ac8', fg: '#ffffff', wide: true }, { name: 'BENZINERA', kind: 'benzinera', x: -60, z: -205, side: 'S', bg: '#e8a02a', fg: '#1a1a1a' }, { name: 'ESCOLA', kind: 'ajuntament', x: 40, z: -190, side: 'N', bg: '#8a3a2a', fg: '#ffffff', wide: true });
  for (let k = 0; k < 45; k++) SHOPS.push({ name: null, kind: 'piso', x: R(-215, 150), z: R(-215, 120), side: pick(['N', 'S', 'E', 'W']) });
  const signCache = {};
  function signMesh(text, bg, fg, w) { const t = textTexture(text, bg, fg, 1024, 160, 'bold 96px "Luckiest Guy", Impact, sans-serif'); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 160 / 1024), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); return m; }
  for (const sh of SHOPS) {
    let best = null, bd = 1e9;
    for (const sg of segs) { if (sg.used || sg.side !== sh.side || sg.w < (sh.wide ? 12 : 8.5)) continue; const d = Math.hypot(sg.fx - sh.x, sg.fz - sh.z); if (d < bd) { bd = d; best = sg; } }
    if (!best || bd > 60) continue; best.used = true; best.room = sh;
  }
  // ---------- pueblos de alrededor ----------
  const TSHOPS = [['SUPERMERCAT', 'super', '#c8202a', '#ffffff', true], ['FARMÀCIA', 'farmacia', '#1a8a3a', '#ffffff'], ['BAR', 'bar', '#6a2a1a', '#ffe0a0'], ['FERRETERIA', 'ferreteria', '#e8a02a', '#1a1a1a'], ['FORN DE PA', 'forn', '#c89a5a', '#3a2010'],
    ['BENZINERA', 'benzinera', '#e8a02a', '#1a1a1a'], ['TALLER', 'taller', '#3a3a40', '#ffd23f'], ['POLICIA', 'policia', '#1a2a6a', '#ffffff'], ['CAP', 'cap', '#2a8ac8', '#ffffff', true], ['QUIOSC', 'quiosc', '#2a5aa8', '#ffffff'], ['MERCAT', 'mercat', '#2a6a4a', '#ffffff', true]];
  CITY.towns = [];
  for (const T of POIS.filter(p => p.type === 'town')) {
    useArea(T.name);
    const xs = [], zs = []; for (let k = -T.n; k <= T.n; k++) { xs.push(T.x + k * T.sp); zs.push(T.z + k * T.sp); }
    const xw = xs.map(() => 9), zw = zs.map(() => 9), X0 = T.x - T.r, X1 = T.x + T.r, Z0 = T.z - T.r, Z1 = T.z + T.r;
    for (let i = 0; i < xs.length; i++) { const x = xs[i], w = xw[i]; ASM.box(x, Y + 0.02, T.z, w, 0.04, Z1 - Z0, 0xffffff); for (const s2 of [-1, 1]) { PAN.box(x + s2 * (w / 2 + SW / 2), Y + 0.06, T.z, SW, 0.12, Z1 - Z0, 0xffffff); STN.box(x + s2 * (w / 2 + 0.1), Y + 0.08, T.z, 0.2, 0.16, Z1 - Z0, 0xe8e4dc); } for (let z = Z0; z < Z1; z += 6) if (!zs.some(zz => Math.abs(z - zz) < 8)) FLAT.box(x, Y + 0.045, z, 0.18, 0.02, 3, LINE); }
    for (let j = 0; j < zs.length; j++) { const z = zs[j], w = zw[j]; ASM.box(T.x, Y + 0.025, z, X1 - X0, 0.04, w, 0xffffff); for (const s2 of [-1, 1]) { PAN.box(T.x, Y + 0.065, z + s2 * (w / 2 + SW / 2), X1 - X0, 0.12, SW, 0xffffff); STN.box(T.x, Y + 0.085, z + s2 * (w / 2 + 0.1), X1 - X0, 0.16, 0.2, 0xe8e4dc); } for (let x = X0; x < X1; x += 6) if (!xs.some(xx => Math.abs(x - xx) < 8)) FLAT.box(x, Y + 0.05, z, 3, 0.02, 0.18, LINE); }
    const bx = [], bz = [], rng = (S2, W, a, b, out) => { out.push([a, S2[0] - W[0] / 2 - SW]); for (let i = 0; i < S2.length - 1; i++) out.push([S2[i] + W[i] / 2 + SW, S2[i + 1] - W[i + 1] / 2 - SW]); out.push([S2[S2.length - 1] + W[S2.length - 1] / 2 + SW, b]); };
    rng(xs, xw, X0, X1, bx); rng(zs, zw, Z0, Z1, bz);
    const tsegs = [];
    for (let bi = 0; bi < bx.length; bi++) for (let bj = 0; bj < bz.length; bj++) {
      const [x0, x1] = bx[bi], [z0, z1] = bz[bj]; if (x1 - x0 < 10 || z1 - z0 < 10) continue; if (rand() < 0.1) continue; // solar vacío
      const outer = bi === 0 || bi === bx.length - 1 || bj === 0 || bj === bz.length - 1, D = Math.min(T.ind ? 16 : 11, (x1 - x0) / 2 - 1, (z1 - z0) / 2 - 1);
      for (const [side, a, b] of [['S', x0, x1], ['N', x0, x1], ['W', z0 + D, z1 - D], ['E', z0 + D, z1 - D]]) {
        if (outer && ((bi === 0 && side === 'W') || (bi === bx.length - 1 && side === 'E') || (bj === 0 && side === 'S') || (bj === bz.length - 1 && side === 'N'))) continue;
        let u = a; while (u < b - 4) { let w = T.ind ? R(14, 22) : R(8, 13); if (b - u - w < 8) w = b - u; const sg = makeSeg(side, x0, z0, x1, z1, u + w / 2, w, D, T.ind ? RI(1, 2) : RI(1, 3), [bi, bj]); sg.town = T.name; if (T.ind) { sg.col = pick([0xb8b4aa, 0x9aa0a4, 0xc8c0b0]); sg.brick = false; } segs.push(sg); tsegs.push(sg); u += w; }
      }
      if (outer) { const h = RI(1, 2) * 3.4; if (bi === 0) { SOL.box(x0 + D / 2, Y + h / 2, (z0 + z1) / 2, D, h, z1 - z0 - 2 * D, 0xb8a890); addBox(x0, Y, z0 + D, x0 + D, Y + h, z1 - D); } if (bi === bx.length - 1) { SOL.box(x1 - D / 2, Y + h / 2, (z0 + z1) / 2, D, h, z1 - z0 - 2 * D, 0xb8a890); addBox(x1 - D, Y, z0 + D, x1, Y + h, z1 - D); } }
    }
    // locales del pueblo
    const list = TSHOPS.slice().sort(() => rand() - 0.5).slice(0, T.n >= 2 ? 6 : 4); if (T.ind) list.push(['NAU INDUSTRIAL', 'taller', '#4a4a50', '#ffd23f', true], ['NAU INDUSTRIAL', 'ajuntament', '#4a4a50', '#ffffff', true]);
    for (const [nm, kind, bg, fg, wide] of list) { const c = tsegs.filter(sg => !sg.used && sg.w >= (wide ? 11 : 8.5)); if (!c.length) continue; const sg = pick(c); sg.used = true; sg.room = { name: nm, kind, bg, fg }; }
    for (let k = 0; k < (T.n >= 2 ? 10 : 7); k++) { const c = tsegs.filter(sg => !sg.used && sg.w >= 8.5); if (!c.length) break; const sg = pick(c); sg.used = true; sg.room = { name: null, kind: 'piso' }; }
    CITY.labels.push({ name: T.name, x: T.x, z: Z0 - 10, place: true, town: true });
    CITY.towns.push({ T, xs, zs, xw, zw, X0, X1, Z0, Z1 });
  }
  useArea('city');
  // interiores: una malla por material para todos los locales (menos llamadas de dibujo)
  CITY.cull = [];
  const flatModel = grp => { grp.updateMatrixWorld(true); const M = new Merger(); grp.traverse(o => { if (o.isMesh && o.material && o.material.color) { const g = o.geometry; const c = '#' + o.material.color.clone().convertLinearToSRGB().getHexString(); M.geo(g, o.matrixWorld, c); } }); const me = M.mesh(MAT.solid); CITY.cull.push(me); return me; };
  // ---------- construir segmentos ----------
  const W2 = (sg, u, v) => [sg.fx + sg.tx * u - sg.nx * v, sg.fz + sg.tz * u - sg.nz * v];
  const sbox = (M, sg, u, y, v, tw, h, nd, col) => { const [x, z] = W2(sg, u, v); const ax = sg.tx !== 0; M.box(x, y, z, ax ? tw : nd, h, ax ? nd : tw, col); };
  const scol = (sg, u0, v0, u1, v1, y0, y1) => { const a = W2(sg, u0, v0), b = W2(sg, u1, v1); addBox(Math.min(a[0], b[0]), Y + y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), Y + y1, Math.max(a[1], b[1])); };
  const geoBox = new THREE.BoxGeometry(1, 1, 1), _e = new THREE.Euler(), _m2 = new THREE.Matrix4();
  const rbx = (M, x, y, z, w, h, d, col, rx = 0, ry = 0, rz = 0, geo = geoBox) => { m4.compose(ps.set(x, y, z), q.setFromEuler(_e.set(rx, ry, rz)), sc.set(w, h, d)); M.geo(geo, m4, col); };

  // ---------- muebles detallados: una geometría por tipo y muchas copias (instancias) ----------
  const FPROTO = {}, FCELL = new Map(), _fe = new THREE.Euler(0, 0, 0, 'YXZ'), FCS = 56;
  const FM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, metalness: 0.02, envMapIntensity: 0.2 });
  // el color de la copia solo tiñe las partes grises/blancas (telas), no la madera ni el metal
  FM.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>', 'vColor = min(color.xyz * 1.75 + 0.015, vec3(1.0));\n#ifdef USE_INSTANCING_COLOR\n{ float gs = step(abs(color.r - color.g) + abs(color.g - color.b), 0.012); vColor = mix(vColor, vColor * instanceColor.xyz, gs); }\n#endif'); };
  { const geoSoft = new THREE.BoxGeometry(1, 1, 1, 4, 3, 4).toNonIndexed(), gp = geoSoft.attributes.position, gn = geoSoft.attributes.normal, v3 = new THREE.Vector3();
    for (let i = 0; i < gp.count; i++) { v3.fromBufferAttribute(gp, i); const k = (1 - 0.3 * Math.pow(v3.length() / 0.866, 3)) / 0.942; v3.multiplyScalar(k); gp.setXYZ(i, v3.x, v3.y, v3.z); v3.set(Math.pow(Math.abs(v3.x * 2), 3) * Math.sign(v3.x), Math.pow(Math.abs(v3.y * 2), 3) * Math.sign(v3.y), Math.pow(Math.abs(v3.z * 2), 3) * Math.sign(v3.z)).normalize(); gn.setXYZ(i, v3.x, v3.y, v3.z); }
    const geoC = new THREE.CylinderGeometry(1, 1, 1, 10), geoB = new THREE.BoxGeometry(1, 1, 1), e2 = new THREE.Euler();
    const P = name => { const M = new Merger(), put = (geo, x, y, z, w, h, d, c, rx, ry, rz) => { m4.compose(ps.set(x, y, z), q.setFromEuler(e2.set(rx || 0, ry || 0, rz || 0)), sc.set(w, h, d)); M.geo(geo, m4, c); };
      const o = { b: (x, y, z, w, h, d, c, rx, ry, rz) => { put(geoB, x, y, z, w, h, d, c, rx, ry, rz); return o; }, s: (x, y, z, w, h, d, c, rx, ry, rz) => { put(geoSoft, x, y, z, w, h, d, c, rx, ry, rz); return o; }, c: (x, y, z, r, h, c, rx, rz) => { put(geoC, x, y, z, r, h, r, c, rx, 0, rz); return o; },
        legs: (hx, hz, h, t, c) => { for (const a of [-1, 1]) for (const b of [-1, 1]) put(geoB, a * hx, h / 2, b * hz, t, h, t, c); return o; }, end: () => { FPROTO[name] = M.mesh(FM, false).geometry; } }; return o; };
    const WD = 0x7a5638, WD2 = 0x5c3f28, WL = 0xb89468, DK = 0x2a2623, MT = 0x8a8c90, CH = 0x3a3c40, W = 0xffffff, G1 = 0xe2e2e2, G2 = 0xc6c6c6;
    P('sofa').legs(0.95, 0.36, 0.1, 0.07, DK).b(0, 0.24, 0, 2.1, 0.28, 0.9, G2).b(0, 0.6, -0.37, 1.72, 0.56, 0.16, G2).s(-0.96, 0.44, 0, 0.24, 0.52, 0.94, G1).s(0.96, 0.44, 0, 0.24, 0.52, 0.94, G1)
      .s(-0.56, 0.45, 0.09, 0.55, 0.17, 0.68, W).s(0, 0.45, 0.09, 0.55, 0.17, 0.68, W).s(0.56, 0.45, 0.09, 0.55, 0.17, 0.68, W).s(-0.56, 0.7, -0.24, 0.54, 0.4, 0.2, G1).s(0, 0.7, -0.24, 0.54, 0.4, 0.2, G1).s(0.56, 0.7, -0.24, 0.54, 0.4, 0.2, G1)
      .s(0.62, 0.64, 0, 0.34, 0.3, 0.13, 0xc8a05a, 0.2, 0.35, 0.1).end();
    P('armchair').legs(0.38, 0.36, 0.1, 0.07, DK).b(0, 0.24, 0, 0.95, 0.28, 0.9, G2).b(0, 0.6, -0.37, 0.6, 0.56, 0.16, G2).s(-0.39, 0.44, 0, 0.22, 0.52, 0.94, G1).s(0.39, 0.44, 0, 0.22, 0.52, 0.94, G1).s(0, 0.45, 0.09, 0.56, 0.17, 0.68, W).s(0, 0.7, -0.24, 0.56, 0.4, 0.2, G1).end();
    P('ctable').legs(0.46, 0.21, 0.4, 0.05, WD2).b(0, 0.41, 0, 1.05, 0.045, 0.55, WD).b(0, 0.14, 0, 0.92, 0.03, 0.44, WD2).b(0.22, 0.45, 0.05, 0.25, 0.03, 0.18, 0x9a2a22, 0, 0.3, 0).b(0.2, 0.478, 0.04, 0.22, 0.025, 0.16, 0x2a4a7a, 0, -0.2, 0).c(-0.28, 0.48, -0.06, 0.04, 0.09, 0xe8e0d0).b(-0.2, 0.16, 0.05, 0.3, 0.02, 0.22, 0xd8d0c0, 0, 0.5, 0).end();
    P('dtable').legs(0.67, 0.35, 0.72, 0.07, WD2).b(0, 0.69, 0, 1.38, 0.08, 0.73, WD2).b(0, 0.755, 0, 1.52, 0.05, 0.87, WD).c(-0.42, 0.79, 0.16, 0.11, 0.014, 0xf0ece4).c(0.42, 0.79, -0.16, 0.11, 0.014, 0xf0ece4).c(0.05, 0.9, -0.08, 0.036, 0.24, 0x3a6a3a).c(0.05, 1.04, -0.08, 0.014, 0.08, 0x3a6a3a).c(-0.1, 0.83, 0.05, 0.06, 0.09, 0x9a5a3a).b(0.4, 0.785, 0.2, 0.2, 0.01, 0.03, 0xb8bcc0, 0, 0.4, 0).end();
    P('chair').legs(0.18, 0.18, 0.45, 0.04, WD2).b(0, 0.46, 0, 0.43, 0.045, 0.43, WD).b(-0.19, 0.72, -0.195, 0.04, 0.52, 0.04, WD2).b(0.19, 0.72, -0.195, 0.04, 0.52, 0.04, WD2).b(0, 0.93, -0.195, 0.42, 0.1, 0.03, WD).b(0, 0.72, -0.195, 0.42, 0.06, 0.03, WD).s(0, 0.495, 0.01, 0.38, 0.05, 0.38, G1).end();
    P('bed').legs(0.76, 0.96, 0.14, 0.09, WD2).b(0, 0.22, 0, 1.68, 0.2, 2.06, WD).b(0, 0.62, -1.02, 1.74, 1.05, 0.08, WD2).b(0, 0.3, 1.03, 1.74, 0.4, 0.06, WD2).s(0, 0.43, 0, 1.6, 0.24, 1.98, 0xf2eee4).s(-0.4, 0.6, -0.72, 0.62, 0.15, 0.4, 0xfaf8f2).s(0.4, 0.6, -0.72, 0.62, 0.15, 0.4, 0xfaf8f2).s(0, 0.5, 0.3, 1.66, 0.2, 1.4, W).b(0, 0.6, -0.36, 1.62, 0.03, 0.2, G1).end();
    P('bedside').b(0, 0.26, 0, 0.45, 0.52, 0.4, WD).b(0, 0.39, 0.205, 0.39, 0.16, 0.01, WD2).b(0, 0.17, 0.205, 0.39, 0.2, 0.01, WD2).b(0, 0.39, 0.215, 0.1, 0.02, 0.015, MT).b(0, 0.17, 0.215, 0.1, 0.02, 0.015, MT).c(0, 0.56, 0, 0.07, 0.03, CH).c(0, 0.68, 0, 0.012, 0.24, CH).c(0, 0.86, 0, 0.12, 0.16, 0xf0e0b8).end();
    P('wardrobe').b(0, 0.05, 0, 1.2, 0.1, 0.56, WD2).b(0, 1.05, -0.02, 1.2, 1.9, 0.56, WD).b(-0.3, 1.05, 0.265, 0.57, 1.8, 0.03, WL).b(0.3, 1.05, 0.265, 0.57, 1.8, 0.03, WL).b(-0.3, 1.05, 0.285, 0.44, 1.6, 0.012, WD).b(0.3, 1.05, 0.285, 0.44, 1.6, 0.012, WD).b(-0.05, 1.05, 0.3, 0.02, 0.22, 0.03, MT).b(0.05, 1.05, 0.3, 0.02, 0.22, 0.03, MT).b(0, 2.03, 0, 1.26, 0.06, 0.6, WD2).b(0.2, 2.16, 0, 0.5, 0.2, 0.36, 0xb8936a).b(-0.3, 2.12, 0.02, 0.36, 0.12, 0.3, 0x5a6a8a).end();
    { const k = P('kitchen'); k.b(0, 0.06, 0.02, 2.0, 0.12, 0.5, DK).b(0, 0.5, 0, 2.0, 0.78, 0.58, 0xe6e0d4); for (let i = 0; i < 4; i++) { k.b(-0.75 + i * 0.5, 0.5, 0.295, 0.46, 0.7, 0.015, 0xf2ede2).b(-0.75 + i * 0.5, 0.78, 0.31, 0.14, 0.018, 0.02, MT); }
      k.b(0, 0.905, 0.01, 2.06, 0.045, 0.64, 0x3c3c40).b(-0.55, 0.915, 0.02, 0.56, 0.03, 0.4, 0xb8bcc2).b(-0.55, 0.9, 0.02, 0.48, 0.03, 0.32, 0x6a6e74).c(-0.55, 1.03, -0.2, 0.015, 0.2, MT).b(-0.55, 1.12, -0.13, 0.025, 0.025, 0.16, MT)
        .b(0.5, 0.932, 0.02, 0.6, 0.012, 0.5, 0x18181a); for (const a of [-1, 1]) for (const b of [-1, 1]) k.c(0.5 + a * 0.15, 0.942, 0.02 + b * 0.12, 0.07, 0.012, 0x4a4a4e);
      k.b(0, 1.25, -0.275, 2.0, 0.62, 0.02, 0xd8e2e6).b(0, 1.82, -0.12, 2.0, 0.6, 0.34, 0xe6e0d4); for (let i = 0; i < 4; i++) k.b(-0.75 + i * 0.5, 1.82, 0.055, 0.46, 0.54, 0.015, 0xf2ede2).b(-0.75 + i * 0.5, 1.6, 0.07, 0.14, 0.018, 0.02, MT);
      k.c(0.05, 1.0, -0.12, 0.06, 0.16, 0xc83a2a).c(-0.1, 0.97, -0.15, 0.045, 0.1, 0xe8e0d0).b(0.92, 1.0, -0.1, 0.1, 0.16, 0.2, 0x8a6a4a).end(); }
    P('fridge').b(0, 0.92, 0, 0.72, 1.8, 0.66, 0xe4e6e8).b(0, 1.42, 0.335, 0.68, 0.72, 0.02, 0xf2f4f6).b(0, 0.5, 0.335, 0.68, 0.96, 0.02, 0xf2f4f6).b(-0.28, 1.3, 0.36, 0.03, 0.36, 0.03, MT).b(-0.28, 0.75, 0.36, 0.03, 0.36, 0.03, MT).b(0, 0.02, 0, 0.7, 0.04, 0.6, DK).b(0.1, 1.5, 0.35, 0.12, 0.09, 0.005, 0xd8c020).b(-0.05, 1.3, 0.35, 0.09, 0.12, 0.005, 0xc83a2a).end();
    P('tvunit').b(0, 0.25, 0, 1.5, 0.42, 0.42, WD).b(0, 0.02, 0, 1.4, 0.04, 0.36, DK).b(-0.37, 0.25, 0.215, 0.7, 0.34, 0.012, WD2).b(0.37, 0.25, 0.215, 0.7, 0.34, 0.012, WD2).b(0, 0.475, 0, 1.54, 0.03, 0.46, WD2).b(0, 0.51, 0.02, 0.4, 0.03, 0.22, CH).b(0, 0.6, 0.02, 0.06, 0.16, 0.05, CH).b(0, 0.98, 0.02, 1.16, 0.68, 0.05, 0x121214).b(0, 0.98, 0.047, 1.08, 0.6, 0.004, 0x1c2630).b(0.5, 0.52, 0.1, 0.24, 0.05, 0.16, 0x2a2a30).b(-0.52, 0.56, 0.05, 0.12, 0.13, 0.12, 0x4a4a52).end();
    { const k = P('bookshelf'); k.b(-0.44, 0.95, 0, 0.03, 1.9, 0.3, WD).b(0.44, 0.95, 0, 0.03, 1.9, 0.3, WD).b(0, 0.95, -0.14, 0.88, 1.9, 0.02, WD2); const BC = [0x8a2a22, 0x2a4a7a, 0x3a6a3a, 0xc8a030, 0x5a3a6a, 0xd8d0c0, 0x2a2a30, 0xa85a2a]; let sd = 7;
      for (let r = 0; r < 5; r++) { k.b(0, 0.04 + r * 0.46, 0, 0.88, 0.03, 0.3, WD); let x = -0.4; while (x < 0.36) { sd = (sd * 16807) % 2147483647; const t = 0.03 + (sd % 40) / 1000, h = 0.24 + (sd % 13) / 100; if (sd % 9 === 0) { x += 0.1; continue; } k.b(x + t / 2, 0.055 + r * 0.46 + h / 2, 0.01, t, h, 0.2, BC[sd % 8], 0, 0, sd % 7 === 0 ? 0.12 : 0); x += t + 0.004; } } k.b(0, 1.9, 0, 0.9, 0.03, 0.32, WD).end(); }
    P('rug').b(0, 0.012, 0, 2.6, 0.02, 1.8, G2).b(0, 0.016, 0, 2.3, 0.02, 1.5, W).b(0, 0.02, 0, 1.5, 0.02, 0.8, G1).end();
    P('lamp').c(0, 0.015, 0, 0.15, 0.03, CH).c(0, 0.75, 0, 0.014, 1.5, CH).c(0, 1.55, 0, 0.17, 0.26, 0xf0e2c0).end();
    P('plant').c(0, 0.17, 0, 0.17, 0.34, 0xa8623a).c(0, 0.345, 0, 0.15, 0.02, 0x3a2a1c).c(0, 0.6, 0, 0.012, 0.5, 0x4a5a2a).s(0, 0.86, 0, 0.42, 0.36, 0.42, 0x3a7a2e, 0.2, 0.5, 0).s(0.1, 1.08, 0.04, 0.3, 0.3, 0.3, 0x4a8a34, 0.4, 1, 0.2).s(-0.12, 0.72, -0.05, 0.3, 0.22, 0.3, 0x2e6a26, 0, 2, 0.3).end();
    P('picture').b(0, 0, 0, 0.7, 0.5, 0.03, WD2).b(0, 0, 0.012, 0.62, 0.42, 0.02, 0xece6d8).b(0, 0, 0.022, 0.5, 0.3, 0.012, W).b(-0.08, -0.04, 0.03, 0.2, 0.14, 0.006, G2).end();
    P('desk').b(0, 0.74, 0, 1.45, 0.04, 0.72, 0xd8d0c0).b(-0.7, 0.36, 0, 0.04, 0.72, 0.68, 0x6a6e74).b(0.48, 0.38, 0, 0.42, 0.68, 0.66, 0x8a8c92).b(0.48, 0.58, 0.335, 0.38, 0.2, 0.012, 0xa8aab0).b(0.48, 0.34, 0.335, 0.38, 0.2, 0.012, 0xa8aab0).b(0.48, 0.12, 0.335, 0.38, 0.2, 0.012, 0xa8aab0)
      .b(-0.1, 0.775, -0.18, 0.24, 0.02, 0.16, CH).b(-0.1, 0.86, -0.2, 0.04, 0.16, 0.03, CH).b(-0.1, 1.08, -0.2, 0.56, 0.35, 0.03, 0x161618).b(-0.1, 1.08, -0.183, 0.5, 0.29, 0.004, 0x1e2a36).b(-0.1, 0.772, 0.12, 0.42, 0.015, 0.14, 0x2a2a2e).b(0.26, 0.772, 0.12, 0.06, 0.02, 0.1, 0x2a2a2e).c(-0.5, 0.81, 0.1, 0.04, 0.09, 0xf0f0ec).b(0.45, 0.775, -0.1, 0.22, 0.03, 0.3, 0xf4f2ea, 0, 0.2, 0).end();
    { const k = P('ochair'); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; k.b(Math.sin(a) * 0.15, 0.05, Math.cos(a) * 0.15, 0.05, 0.03, 0.32, CH, 0, a, 0).c(Math.sin(a) * 0.29, 0.03, Math.cos(a) * 0.29, 0.03, 0.04, DK, 0, Math.PI / 2); } k.c(0, 0.25, 0, 0.025, 0.4, MT).s(0, 0.48, 0, 0.46, 0.09, 0.46, G1).b(0, 0.66, -0.21, 0.05, 0.3, 0.03, CH).s(0, 0.86, -0.22, 0.42, 0.46, 0.07, G1).b(-0.25, 0.62, 0, 0.04, 0.03, 0.26, CH).b(0.25, 0.62, 0, 0.04, 0.03, 0.26, CH).end(); }
    { const k = P('filecab'); k.b(0, 0.66, 0, 0.48, 1.32, 0.6, 0x8a8e94); for (let i = 0; i < 4; i++) k.b(0, 0.18 + i * 0.32, 0.305, 0.43, 0.29, 0.012, 0xa2a6ac).b(0, 0.22 + i * 0.32, 0.32, 0.14, 0.02, 0.02, 0x5a5c60).b(0, 0.13 + i * 0.32, 0.313, 0.1, 0.05, 0.004, 0xf0f0e8); k.end(); }
    P('boxes').b(0, 0.22, 0, 0.6, 0.44, 0.45, 0xb8936a, 0, 0.15, 0).b(0, 0.445, 0, 0.6, 0.012, 0.07, 0xd8c8a0, 0, 0.15, 0).b(0.06, 0.62, 0.02, 0.46, 0.36, 0.38, 0xa8835a, 0, -0.25, 0).b(0.62, 0.17, 0.1, 0.42, 0.34, 0.36, 0xc8a878, 0, 0.5, 0).b(-0.5, 0.03, 0.4, 0.3, 0.01, 0.21, 0xf0f0ec, 0, 0.7, 0).end();
    { const k = P('rack'); k.legs(0.58, 0.2, 1.9, 0.04, 0x6a6e74); const BC = [0xb8936a, 0xa8835a, 0x3a5a7a, 0x8a3a2a, 0xd8d0c0, 0x4a6a4a]; let sd = 11; for (let r = 0; r < 4; r++) { k.b(0, 0.12 + r * 0.55, 0, 1.2, 0.03, 0.44, 0xa8acb2); for (let i = 0; i < 3; i++) { sd = (sd * 16807) % 2147483647; if (sd % 4 === 0) continue; const w = 0.26 + (sd % 10) / 100, h = 0.2 + (sd % 17) / 100; k.b(-0.38 + i * 0.38, 0.135 + r * 0.55 + h / 2, 0.01, w, h, 0.3, BC[sd % 6], 0, ((sd % 5) - 2) * 0.06, 0); } } k.end(); }
    P('till').b(0, 0.14, 0, 0.36, 0.2, 0.38, 0x2e3036).b(0, 0.3, -0.1, 0.34, 0.16, 0.14, 0x2e3036, -0.35, 0, 0).b(0, 0.33, -0.06, 0.26, 0.1, 0.01, 0x7ab08a, -0.35, 0, 0).b(0, 0.245, 0.08, 0.28, 0.01, 0.16, 0x8a8c90).b(0.4, 0.06, 0.05, 0.22, 0.012, 0.3, 0xf0f0ec, 0, 0.3, 0).c(-0.36, 0.08, 0.05, 0.05, 0.16, 0xe8e0d0).end();
  }
  // tablones clavados en una ventana (sg: segmento, u: posición, y: altura del centro)
  function boardUp(sg, u, y, W = 1.35, H = 1.6) {
    const ang = Math.atan2(sg.tx, sg.tz);
    for (let k = 0; k < 3; k++) { const [x, z] = W2(sg, u, -0.12 - k * 0.02); const rz = (k - 1) * 0.35 + R(-0.15, 0.15); m4.compose(ps.set(x, y + (k - 1) * H * 0.3, z), q.setFromEuler(_e.set(0, ang + Math.PI / 2, rz)), sc.set(0.05, 0.2, W + 0.3)); WOD.geo(geoBox, m4, pick([0xffffff, 0xd8c8b0, 0xb8a890])); }
  }
  // coche con piezas giradas; state: 0 normal, 1 quemado, 2 volcado
  function car(x, z, ang, col, state, tilt = 0) {
    const burnt = state === 1, flip = state === 2, base = new THREE.Matrix4().compose(ps.set(x, Y, z), q.setFromEuler(_e.set(tilt, ang, flip ? Math.PI : 0)), sc.set(1, 1, 1));
    if (flip) base.multiply(_m2.makeTranslation(0, -1.55, 0));
    const P = (M, ox, oy, oz, w, h, d, c, geo = geoBox, rx = 0, rz = 0) => { m4.compose(ps.set(ox, oy, oz), q.setFromEuler(_e.set(rx, 0, rz)), sc.set(w, h, d)); m4.premultiply(base); M.geo(geo, m4, c); };
    const body = burnt ? pick([0x2a2622, 0x3a2a22, 0x4a3022]) : col, dk = burnt ? 0x1a1816 : 0x1c1c20, glass = burnt ? 0x0a0a0a : 0x2a3640;
    P(SOL, 0, 0.58, 0, 1.78, 0.5, 4.3, body); P(SOL, 0, 0.86, -1.42, 1.72, 0.12, 1.4, body, geoBox, 0.06); P(SOL, 0, 0.88, 1.6, 1.72, 0.14, 1.0, body, geoBox, -0.04);
    P(SOL, 0, 1.12, 0.22, 1.62, 0.5, 1.9, body); P(GL, 0, 1.16, 0.22, 1.66, 0.38, 1.7, glass); P(GL, 0, 1.08, -0.82, 1.5, 0.36, 0.5, glass, geoBox, -0.85); P(GL, 0, 1.1, 1.24, 1.5, 0.34, 0.4, glass, geoBox, 0.9);
    for (const sz of [-1, 1]) { P(SOL, 0, 0.42, sz * 2.17, 1.84, 0.22, 0.14, dk); P(SOL, 0.6, 0.7, sz * 2.16, 0.34, 0.12, 0.05, burnt ? dk : sz < 0 ? 0xf0eee0 : 0xc81a1a); P(SOL, -0.6, 0.7, sz * 2.16, 0.34, 0.12, 0.05, burnt ? dk : sz < 0 ? 0xf0eee0 : 0xc81a1a); }
    for (const a of [-1, 1]) for (const b of [-1, 1]) { P(SOL, a * 0.82, 0.34, b * 1.38, 0.68, 0.24, 0.68, burnt ? 0x3a3632 : 0x18181a, geoCyl, 0, Math.PI / 2); if (!burnt) P(SOL, a * 0.95, 0.34, b * 1.38, 0.36, 0.02, 0.36, 0xa8acb2, geoCyl, 0, Math.PI / 2); }
    for (const a of [-1, 1]) P(SOL, a * 0.93, 1.02, -0.62, 0.12, 0.08, 0.16, body);
    if (burnt) for (let k = 0; k < 4; k++) P(SOL, R(-0.85, 0.85), R(0.4, 1.3), R(-2, 2), 0.02, R(0.15, 0.4), R(0.2, 0.6), pick([0x6a3a1a, 0x8a4a22, 0x1a1a1a]));
    const ex = Math.abs(Math.cos(ang)) * 0.9 + Math.abs(Math.sin(ang)) * 2.15, ez = Math.abs(Math.sin(ang)) * 0.9 + Math.abs(Math.cos(ang)) * 2.15;
    addBox(x - ex, Y, z - ez, x + ex, Y + 1.5, z + ez);
  }
  function facadeWindows(M, Gm, sg, fromFloor) {
    const n = Math.max(1, Math.floor((sg.w - 1.5) / 3.2)), step = sg.w / n;
    for (let f = fromFloor; f < sg.floors; f++) {
      const y = Y + f * 3.4 + 1.9;
      for (let k = 0; k < n; k++) {
        const u = -sg.w / 2 + step * (k + 0.5);
        const broken = rand() < 0.3; sbox(Gm, sg, u, y, -0.02, 1.2, 1.55, 0.06, broken ? 0x0c0c0e : pick([0x4a5a66, 0x3a464e, 0x56646c]));
        if (broken && f <= 2 && rand() < 0.4) boardUp(sg, u, y);
        if (sg.town) { sbox(M, sg, u, y, -0.05, 1.3, 1.65, 0.06, 0xf4f0e8); continue; }
        if (!broken && rand() < 0.5) sbox(M, sg, u + (rand() < 0.5 ? -0.32 : 0.32), y, 0.04, 0.5, 1.5, 0.04, pick([0xe8e0d0, 0xc8a080, 0x8a3a3a, 0x6a8aa8, 0xf0e8b0]));
        sbox(M, sg, u, y, -0.05, 0.06, 1.55, 0.08, 0xf4f0e8); sbox(M, sg, u, y + 0.2, -0.05, 1.2, 0.05, 0.08, 0xf4f0e8);
        if (rand() < 0.25) sbox(SLT, sg, u, y + 0.35, -0.08, 1.3, 0.85, 0.06, sg.shutter || 0x6a8a6a);
        if (rand() < 0.06) { sbox(MET, sg, u + 0.9, y - 0.4, -0.25, 0.7, 0.5, 0.4, 0xe8e8ec); }
        sbox(M, sg, u, y - 0.85, -0.08, 1.45, 0.12, 0.18, 0xf4f0e8);
        sbox(M, sg, u, y + 0.84, -0.06, 1.45, 0.1, 0.14, 0xf4f0e8);
        for (const s of [-1, 1]) sbox(SLT, sg, u + s * 0.86, y, -0.06, 0.32, 1.6, 0.08, sg.shutter || (sg.shutter = pick([0x3a7a5a, 0x7a5a3a, 0xe8e0d0, 0x4a6a8a, 0x8a3a2a])));
        if (f > 0 && rand() < 0.35) { sbox(STN, sg, u, y - 0.95, -0.55, 1.9, 0.12, 1.0, 0xf0ece4); if (rand() < 0.5) { const [px, pz] = W2(sg, u + 0.6, -0.8); m4.compose(ps.set(px, y - 0.6, pz), q.identity(), sc.set(0.22, 0.25, 0.22)); M.geo(geoSph, m4, 0x4a8a3a); M.box(px, y - 0.8, pz, 0.3, 0.25, 0.3, 0xb8583a); } sbox(M, sg, u, y - 0.5, -1.02, 1.9, 0.06, 0.06, 0x2a2a30); sbox(M, sg, u, y - 0.72, -1.02, 1.86, 0.4, 0.015, 0x2a2a30); for (const s of [-1, 1]) sbox(M, sg, u + s * 0.93, y - 0.7, -0.55, 0.03, 0.45, 0.95, 0x2a2a30); }
      }
    }
  }
  function roofDetails(M, sg, y, RF = ROOF, ST = STN) {
    sbox(RF, sg, 0, y + 0.03, sg.D / 2, sg.w - 0.1, 0.06, sg.D - 0.1, 0xffffff);
    sbox(ST, sg, 0, y + 0.45, 0.15, sg.w, 0.9, 0.3, 0xf2eee6); sbox(ST, sg, 0, y + 0.45, sg.D - 0.15, sg.w, 0.9, 0.3, 0xf2eee6); sbox(ST, sg, 0, y - 0.1, -0.12, sg.w + 0.1, 0.25, 0.3, 0xf6f2ea);
    if (rand() < 0.5) { const [x, z] = W2(sg, R(-sg.w / 3, sg.w / 3), sg.D / 2); m4.compose(ps.set(x, y + 0.9, z), q.identity(), sc.set(0.7, 1.4, 0.7)); M.geo(geoCyl, m4, 0xe8e8ec); }
    if (rand() < 0.4) { const [x, z] = W2(sg, R(-sg.w / 3, sg.w / 3), sg.D * 0.6); M.box(x, y + 1.2, z, 0.06, 2.4, 0.06, 0x6a6a72); M.box(x, y + 2.2, z, 1.2, 0.05, 0.05, 0x6a6a72); }
  }
  // todos los edificios se pueden visitar: los que no tienen local asignado son viviendas, locales vacíos u oficinas
  for (const sg of segs) if (!sg.room && sg.w >= 6 && sg.D >= 5) sg.room = { name: null, kind: sg.shop || (sg.town && POIS.find(p => p.name === sg.town && p.ind)) ? 'local' : rand() < 0.15 ? 'oficina' : 'casa', generic: true };
  CITY.Y = Y;
  for (const sg of segs) {
    useArea(sg.town || 'city');
    const a = W2(sg, -sg.w / 2, 0), b = W2(sg, sg.w / 2, sg.D);
    const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
    if (!sg.room) {
      (sg.brick ? BRK : FAC).box((x0 + x1) / 2, Y + sg.H / 2, (z0 + z1) / 2, x1 - x0, sg.H, z1 - z0, sg.brick ? 0xffffff : sg.col);
      addBox(x0, Y, z0, x1, Y + sg.H, z1);
      // planta baja
      if (sg.shop) {
        if (rand() < 0.4) { sbox(MET, sg, 0, Y + 1.45, -0.06, sg.w - 1.0, 2.9, 0.08, pick([0xc8c8cc, 0x9aa0a8, 0xb8b0a0])); sbox(SOL, sg, 0, Y + 2.95, -0.18, sg.w - 0.9, 0.3, 0.3, 0x6a6a72); }
        else { sbox(GL, sg, 0, Y + 1.6, -0.04, sg.w - 1.2, 2.4, 0.08, 0x40586a); sbox(SOL, sg, 0, Y + 0.25, -0.06, sg.w - 1.0, 0.5, 0.1, 0x2a2a30); }
        sbox(SOL, sg, 0, Y + 3.1, -0.6, sg.w - 0.6, 0.12, 1.2, sg.shop); sbox(SOL, sg, 0, Y + 3.0, -1.2, sg.w - 0.6, 0.35, 0.05, sg.shop);
        for (let k = 0; k < Math.floor(sg.w / 0.6); k++) sbox(SOL, sg, -sg.w / 2 + 0.4 + k * 0.6, Y + 2.86, -1.21, 0.3, 0.06, 0.04, 0xffffff);
      }
      else { sbox(WOD, sg, R(-sg.w / 4, sg.w / 4), Y + 1.25, -0.04, 1.5, 2.5, 0.1, 0xb07a4a); sbox(STN, sg, 0, Y + 0.5, -0.05, sg.w, 1.0, 0.1, 0xd8d0c4); }
      sbox(SOL, sg, 0, Y + 3.4, -0.06, sg.w, 0.18, 0.14, 0xf4f0e8);
      facadeWindows(SOL, GL, sg, 1); roofDetails(SOL, sg, Y + sg.H);
      continue;
    }
    // ---- local con interior ----
    const sh = sg.room, Hc = 3.6, T = 0.3, w = sg.w, D = sg.D, door = 2.0;
    const RM = INT_P, UP = sg.brick ? BRK : FAC, UG = GL;
    const wallC = sh.kind === 'friki' ? 0xd8c8f0 : 0xf2ede4, FLR = (sh.kind === 'piso' || sh.kind === 'friki' || sh.kind === 'casa' || sh.kind === 'oficina') ? INT_W : INT_T;
    sbox(FLR, sg, 0, Y + 0.03, D / 2, w - 0.1, 0.06, D - 0.1, sh.kind === 'friki' ? 0x7a5a48 : sh.kind === 'piso' ? 0xffffff : 0xffffff);
    // paredes interiores (fondo y laterales)
    sbox(RM, sg, 0, Y + Hc / 2, D - T / 2, w, Hc, T, wallC); scol(sg, -w / 2, D - T, w / 2, D, 0, Hc);
    for (const s of [-1, 1]) { sbox(RM, sg, s * (w / 2 - T / 2), Y + Hc / 2, D / 2, T, Hc, D, wallC); scol(sg, s > 0 ? w / 2 - T : -w / 2, 0, s > 0 ? w / 2 : -w / 2 + T, D, 0, Hc); }
    // fachada: escaparates + puerta
    const side = (w - door) / 2, fc = (sh.kind === 'piso' || sh.kind === 'casa' || sh.kind === 'oficina') ? (sg.brick ? 0x9a5a42 : sg.col) : 0x2a2a30;
    for (const s of [-1, 1]) {
      const uc = s * (door / 2 + side / 2);
      sbox(RM, sg, uc, Y + 0.45, T / 2, side, 0.9, T, fc); sbox(GL, sg, uc, Y + 1.75, T / 2, side - 0.3, 1.7, 0.08, 0x2a4050);
      sbox(RM, sg, s * (w / 2 - 0.15), Y + 1.75, T / 2, 0.3, 1.7, T, fc); sbox(RM, sg, s * (door / 2 + 0.1), Y + 1.75, T / 2, 0.2, 1.7, T, fc);
      scol(sg, s > 0 ? door / 2 : -w / 2, 0, s > 0 ? w / 2 : -door / 2, T, 0, Hc);
    }
    sbox(RM, sg, 0, Y + (2.6 + Hc) / 2, T / 2, w, Hc - 2.6, T, fc); scol(sg, -door / 2, 0, door / 2, T, 2.6, Hc);
    { const [dx, dz] = W2(sg, 0, T / 2); (CITY.doors = CITY.doors || []).push({ x: dx, z: dz, y: Y, rot: sg.tx !== 0 ? 0 : 1, shop: !['piso', 'casa', 'oficina'].includes(sh.kind), generic: !!sh.generic, spawn: !!sh.spawn, name: sh.name }); }
    // pisos superiores (se ocultan en vista cenital)
    const upH = Math.max(0.6, sg.H - Hc);
    sbox(INT_P, sg, 0, Y + Hc - 0.05, D / 2, w, 0.1, D, 0xf4f0ec); // techo interior
    sbox(UP, sg, 0, Y + Hc + upH / 2, D / 2, w, upH, D, sg.brick ? 0xffffff : sg.col); addBox(x0, Y + Hc, z0, x1, Y + sg.H, z1);
    sbox(STN, sg, 0, Y + Hc + 0.1, -0.06, w, 0.2, 0.14, 0xf4f0e8);
    facadeWindows(SOL, UG, sg, 1); roofDetails(SOL, sg, Y + sg.H);
    // rótulo y toldo
    if (sh.name) {
      const sm = signMesh(sh.name, sh.bg, sh.fg, Math.min(w - 1, 9)); const [sx, sz] = W2(sg, 0, -0.22); sm.position.set(sx, Y + 3.05, sz); sm.rotation.y = Math.atan2(-sg.nx, -sg.nz) + Math.PI; scene.add(sm); sm.userData.cd = 160; CITY.cull.push(sm);
      sbox(RM, sg, 0, Y + 3.05, -0.12, Math.min(w - 0.6, 9.4), 0.9, 0.16, 0x1a1a1a);
      if (sh.kind === 'friki') { const lg = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0xff7a1a, toneMapped: false })); const [lx, lz] = W2(sg, -Math.min(w - 1, 9) / 2 - 0.1, -0.24); lg.position.set(lx, Y + 3.05, lz); lg.rotation.y = sm.rotation.y; scene.add(lg); }
    }
    // (los pisos de arriba van fusionados; en vista cenital se recortan con un plano de corte)
    if (sh.generic && sg.shop) { sbox(SOL, sg, 0, Y + 3.1, -0.6, sg.w - 0.6, 0.12, 1.2, sg.shop); sbox(SOL, sg, 0, Y + 3.0, -1.2, sg.w - 0.6, 0.35, 0.05, sg.shop); }
    const room = { name: sh.name || (sh.kind === 'local' ? 'Local' : sh.kind === 'oficina' ? 'Oficina' : 'Piso bajo'), kind: sh.kind, x0, x1, z0, z1, roof: [], y: Y, sg };
    CITY.rooms.push(room);
    // ---- mobiliario y contenedores ----
    const FUR = INT_F;
    const TINT = [0xa84a40, 0x4a6a9a, 0x5a8a5a, 0xb89a6a, 0x7a7a82, 0x8a5a8a, 0xc8a84a, 0x3a6a72, 0xb0683a];
    // F: coloca una copia de un mueble; face = hacia dónde mira ('v+' al fondo, 'v-' a la puerta, 'u+', 'u-')
    const F = (name, u, v, face = 'v-', o = {}) => { const fu = face === 'u+' ? 1 : face === 'u-' ? -1 : 0, fv = face === 'v+' ? 1 : face === 'v-' ? -1 : 0, wx = sg.tx * fu - sg.nx * fv, wz = sg.tz * fu - sg.nz * fv, [x, z] = W2(sg, u, v);
      const key = Math.floor((x0 + x1) / 2 / FCS) + '_' + Math.floor((z0 + z1) / 2 / FCS); let cell = FCELL.get(key); if (!cell) FCELL.set(key, cell = {}); (cell[name] || (cell[name] = [])).push(new THREE.Matrix4().compose(new THREE.Vector3(x, Y + 0.02 + (o.y || 0), z), new THREE.Quaternion().setFromEuler(_fe.set(o.rx || 0, Math.atan2(wx, wz) + (o.ry || 0), o.rz || 0)), new THREE.Vector3(o.s || 1, o.s || 1, o.s || 1)), o.tint === undefined ? 0xffffff : o.tint);
      if (o.col) { const sw = fu !== 0, hw = (sw ? o.col[1] : o.col[0]) / 2, hd = (sw ? o.col[0] : o.col[1]) / 2; scol(sg, u - hw, v - hd, u + hw, v + hd, 0, o.col[2]); } };
    const cont = (u, v, kind, name, loot, water) => { const [x, z] = W2(sg, u, v); CITY.conts.push({ kind, name, loot, water: !!water, pos: new THREE.Vector3(x, Y, z), room }); };
    const shelf = (u, v, len, col, loot, name = 'Estantería', along = true) => {
      const tw = along ? len : 0.5, nd = along ? 0.5 : len;
      // panel trasero, laterales y baldas; los productos quedan a la vista
      const bk = along ? 0.2 : (u > 0 ? 0.2 : -0.2);
      if (along) sbox(FUR, sg, u, Y + 1.0, v + 0.22, tw, 2.0, 0.06, 0x8a8a92); else sbox(FUR, sg, u + bk, Y + 1.0, v, 0.06, 2.0, nd, 0x8a8a92);
      for (const e of [-1, 1]) { if (along) sbox(FUR, sg, u + e * (tw / 2 - 0.03), Y + 1.0, v, 0.06, 2.0, nd, 0x8a8a92); else sbox(FUR, sg, u, Y + 1.0, v + e * (nd / 2 - 0.03), tw, 2.0, 0.06, 0x8a8a92); }
      for (let k = 0; k < 4; k++) sbox(FUR, sg, u, Y + 0.08 + k * 0.5, v, tw, 0.05, nd, 0xd8d8de);
      for (let k = 0; k < 4; k++) for (let m = 0; m < Math.floor((len - 0.2) / 0.3); m++) if (rand() < 0.75) { const off = -len / 2 + 0.25 + m * 0.3; const pc = Array.isArray(col) ? pick(col) : col; const hh = R(0.22, 0.36); sbox(FUR, sg, along ? u + off : u - bk * 0.3, Y + 0.105 + k * 0.5 + hh / 2, along ? v - 0.04 : v + off, along ? 0.24 : 0.3, hh, along ? 0.3 : 0.24, pc); }
      const a2 = W2(sg, u - tw / 2, v - nd / 2), b2 = W2(sg, u + tw / 2, v + nd / 2); addBox(Math.min(a2[0], b2[0]), Y, Math.min(a2[1], b2[1]), Math.max(a2[0], b2[0]), Y + 2, Math.max(a2[1], b2[1]));
      cont(along ? u : u + (u > 0 ? -0.8 : 0.8), along ? v - 0.75 : v, 'shelf', name, loot);
    };
    const counter = (u, v, len, loot, name = 'Mostrador', water) => { sbox(FUR, sg, u, Y + 0.5, v, len, 1.0, 0.7, 0x6a4a3a); sbox(FUR, sg, u, Y + 1.02, v, len + 0.1, 0.06, 0.8, 0xe8e2d6); sbox(FUR, sg, u, Y + 0.5, v - 0.36, len - 0.1, 0.8, 0.02, 0x4a3428); F('till', u + Math.min(0.5, len / 2 - 0.4), v, 'v+', { y: 1.04 }); scol(sg, u - len / 2, v - 0.35, u + len / 2, v + 0.35, 0, 1.05); cont(u, v + 0.9, 'counter', name, loot, water); };
    const table = (u, v) => { F('dtable', u, v, 'v-', { col: [1.5, 0.87, 0.8] }); F('chair', u - 0.4, v - 0.72, 'v+', { ry: R(-0.3, 0.3) }); F('chair', u + 0.4, v + 0.72, 'v-', { ry: R(-0.3, 0.3) }); };
    const CARDS = [0xe83a3a, 0x3a6ad8, 0xf0c43a, 0x3aaa5a, 0x8a3ab8, 0xff7a1a, 0x1a1a1a];
    const FOOD = [0xe8a02a, 0xd83a2a, 0x3a8ae8, 0xf0e04a, 0x5aaa3a, 0xffffff, 0xa86a3a];
    const BV = sh.kind === 'super' || sh.kind === 'mercat';
    if (sh.kind === 'friki') {
      shelf(0, D - 0.65, Math.min(w - 1.6, 6), CARDS, 'friki', 'Estantería de cartas');
      shelf(-w / 2 + 0.65, D / 2, D - 3, CARDS, 'friki', 'Vitrina', false);
      counter(w / 2 - 1.6, 2.6, 2.2, 'friki2', 'Mostrador');
      table(-0.6, D / 2 - 0.4); table(1.4, D / 2 + 1.8);
      // tapetes de juego
      for (const [u, v] of [[-0.6, D / 2 - 0.4], [1.4, D / 2 + 1.8]]) sbox(FUR, sg, u, Y + 0.8, v, 1.3, 0.01, 0.6, 0x2a5a8a);
      if (sh.spawn) { const [x, z] = W2(sg, 0, D / 2); CITY.spawn = new THREE.Vector3(x, Y, z); }
    } else if (BV) {
      const rows = Math.max(1, Math.floor((w - 3) / 3));
      for (let r = 0; r < rows; r++) { const u = -w / 2 + 2 + r * 3; shelf(u, D / 2 + 0.5, D - 4.5, sh.kind === 'mercat' ? [0xd83a2a, 0x5aaa3a, 0xf0c43a, 0xe8822a] : FOOD, sh.kind, sh.kind === 'mercat' ? 'Parada' : 'Estantería', false); }
      shelf(0, D - 0.65, w - 2, [0xffffff, 0x8ad0ff], 'fridge', 'Nevera de bebidas');
      counter(w / 2 - 1.4, 1.8, 1.8, 'quiosc', 'Caja');
    } else if (sh.kind === 'farmacia' || sh.kind === 'cap') { shelf(0, D - 0.65, w - 2, [0xffffff, 0x3aaa5a, 0x8ad0ff], 'farmacia', 'Estantería'); shelf(-w / 2 + 0.65, D / 2, D - 3, [0xffffff, 0xe83a3a], 'farmacia', 'Estantería', false); counter(0, 2.5, w - 3, 'farmacia', 'Mostrador'); }
    else if (sh.kind === 'ferreteria' || sh.kind === 'taller') { shelf(0, D - 0.65, w - 2, [0x8a8a92, 0xe8a02a, 0xc83a2a, 0x6a4a2a], 'ferreteria'); shelf(-w / 2 + 0.65, D / 2, D - 3, [0x8a8a92, 0x2a5aa8], 'ferreteria', 'Estantería', false); counter(w / 2 - 1.6, 2.5, 2.2, 'ferreteria', 'Mostrador'); }
    else if (sh.kind === 'bar') { counter(0, D - 2.2, w - 2.5, 'bar', 'Barra (grifo)', true); shelf(0, D - 0.65, w - 3, [0x3aaa5a, 0x8a3a2a, 0xf0c43a], 'bar', 'Botellero'); table(-w / 4, 2.4); table(w / 4, 2.4); }
    else if (sh.kind === 'forn') { counter(0, 2.6, w - 3, 'forn', 'Mostrador'); shelf(0, D - 0.65, w - 2, [0xd8a050, 0xc88a3a, 0xf0d8a0], 'forn', 'Estantería de pan'); }
    else if (sh.kind === 'benzinera') { shelf(0, D - 0.65, w - 2, [0xe83a3a, 0x3a6ad8, 0xf0c43a, 0x5a3018], 'benzinera', 'Estantería'); counter(0, 2.4, w - 3.5, 'benzinera', 'Caja'); shelf(-w / 2 + 0.65, D / 2, D - 3, [0xc83a2a, 0xe8c43a], 'benzinera', 'Bidones', false); }
    else if (sh.kind === 'quiosc') { shelf(0, D - 0.65, w - 2, [0xe83a3a, 0x3a6ad8, 0xf0c43a, 0x5a3018], 'quiosc'); counter(0, 2.4, w - 3.5, 'quiosc', 'Mostrador'); }
    else if (sh.kind === 'policia') { counter(0, 2.6, w - 3, 'crate', 'Recepción'); shelf(0, D - 0.65, w - 2, [0x3a4a6a, 0x2a2a30], 'policia', 'Taquillas'); }
    else if (sh.kind === 'ajuntament') { counter(0, 2.8, w - 3, 'crate', 'Mostrador'); shelf(0, D - 0.65, w - 2, [0xe8e0c8, 0x8a6a4a], 'crate', 'Archivo'); }
    else if (sh.kind === 'casa') { // vivienda: salón, comedor, cocina y cama según el espacio
      const tint = pick(TINT), vS = clamp(D / 2 - 0.2, 1.9, D - 2.9), L = -w / 2, Rr = w / 2, wide = w >= 7.5;
      F('rug', L + 1.9, vS, 'u+', { tint: pick(TINT) }); F('sofa', L + 0.55, vS, 'u+', { tint, col: [2.1, 0.95, 0.85] }); F('ctable', L + 1.85, vS, 'u+', { col: [1.05, 0.55, 0.45], ry: rand() < 0.3 ? R(-0.3, 0.3) : 0 });
      if (wide) F('tvunit', L + 3.45, vS, 'u-', { col: [1.5, 0.45, 1.3] }); else F('tvunit', Rr - 0.3, clamp(vS, 1.2, D - 3.3), 'u-', { col: [1.5, 0.45, 1.3] });
      F('picture', L + 0.04, vS - 0.5, 'u+', { y: 1.55, tint: pick(TINT) }); F('picture', L + 0.04, vS + 0.55, 'u+', { y: 1.7, tint: pick(TINT), s: 0.7 }); F('lamp', L + 0.4, vS + 1.45, 'u+'); F('plant', L + 0.45, 0.55, 'v+', { ry: R(0, 6), s: R(0.85, 1.15) });
      if (D >= 6.6) F('armchair', L + 1.7, vS - 1.9, 'v+', { tint: pick(TINT), col: [0.95, 0.95, 0.85], ry: -0.3 });
      // cocina al fondo a la derecha, con nevera
      F('kitchen', Rr - 1.15, D - 0.32, 'v-', { col: [2.05, 0.64, 2.1] }); F('fridge', Rr - 2.6, D - 0.36, 'v-', { col: [0.74, 0.7, 1.85] }); cont(Rr - 1.2, D - 1.2, 'cab', 'Cocina', 'kitchen');
      const dx = wide ? Rr - 2.3 : 0.5, dv = D - 2.35; F('dtable', dx, dv, 'v-', { col: [1.5, 0.87, 0.8] });
      F('chair', dx - 0.4, dv - 0.72, 'v+'); F('chair', dx + 0.4, dv + 0.72, 'v-'); if (rand() < 0.5) F('chair', dx - 1.2, dv + 0.3, 'u+', { rx: Math.PI / 2, y: 0.2, ry: R(0, 3) }); else F('chair', dx + 0.45, dv - 0.75, 'v+', { ry: R(-0.5, 0.5) });
      // armario y librería
      F('wardrobe', L + 0.9, D - 0.33, 'v-', { col: [1.22, 0.62, 2.1] }); cont(L + 0.9, D - 1.1, 'cab', 'Armario', 'home'); if (w >= 6.6) F('bookshelf', L + 2.15, D - 0.2, 'v-', { col: [0.92, 0.34, 1.9] });
      if (w > 7) { F('bed', Rr - 1.0, 1.35, 'v+', { tint: pick(TINT), col: [1.72, 2.1, 0.65] }); F('bedside', Rr - 2.15, 0.42, 'v+', { col: [0.46, 0.42, 0.55] }); F('picture', Rr - 1.0, 0.26, 'v+', { y: 1.6, tint: pick(TINT) }); }
      F('boxes', R(-0.5, 1.2), R(0.8, 1.4), 'v+', { ry: R(0, 6) });
      if (D >= 9) { F('bookshelf', Rr - 0.2, D / 2 + 0.6, 'u-', { col: [0.92, 0.34, 1.9] }); F('wardrobe', Rr - 0.33, D / 2 + 2.0, 'u-', { col: [1.22, 0.62, 2.1] }); F('armchair', L + 0.6, vS + 2.4, 'u+', { tint: pick(TINT), col: [0.95, 0.95, 0.85], ry: 0.3 }); F('plant', Rr - 0.5, D / 2 - 0.4, 'v+', { ry: R(0, 6), s: 1.2 }); F('rug', 0.4, D - 2.6, 'v+', { tint: pick(TINT), s: 0.9 }); F('picture', Rr - 0.04, D / 2 - 1.6, 'u-', { y: 1.6, tint: pick(TINT), s: 1.2 }); }
      for (let k = 0; k < 4; k++) sbox(FUR, sg, R(L + 1, Rr - 1), Y + 0.04, R(1, D - 1), R(0.15, 0.4), 0.03, R(0.15, 0.4), pick([0xe8e0c8, 0x6a5a4a, 0x3a3a3a])); // trastos tirados
    } else if (sh.kind === 'local') { // local abandonado: estanterías metálicas, mostrador con caja y cajas apiladas
      const rows = Math.min(2, Math.max(1, Math.floor((w - 3) / 3.2))), nr = Math.max(1, Math.floor((D - 4) / 1.3));
      for (let r = 0; r < rows; r++) { const u = -w / 2 + 2 + r * 3.2; for (let k = 0; k < nr; k++) { if (rand() < 0.12) continue; F('rack', u, 2.6 + k * 1.3 + 0.2, 'u+', { col: [1.24, 0.5, 1.9], ry: rand() < 0.15 ? R(-0.15, 0.15) : 0 }); } if (r === 0) cont(u + 0.8, D / 2, 'shelf', 'Estantería', 'localx'); }
      counter(w / 2 - 1.4, 2.0, 1.8, 'localx', 'Mostrador');
      for (let k = 0; k < 3; k++) F('boxes', R(-w / 2 + 1, w / 2 - 1), R(1.5, D - 1), 'v+', { ry: R(0, 6), s: R(0.9, 1.2) });
      F('rack', 0, D - 0.3, 'v-', { col: [1.24, 0.5, 1.9] }); if (w > 7) F('filecab', -w / 2 + 0.4, D - 0.4, 'v-', { col: [0.5, 0.62, 1.35] });
      for (let k = 0; k < 6; k++) sbox(FUR, sg, R(-w / 2 + 1, w / 2 - 1), Y + 0.04, R(1, D - 1), R(0.15, 0.4), 0.03, R(0.15, 0.4), pick([0xe8e0c8, 0xc83a2a, 0x3a6ad8]));
    } else if (sh.kind === 'oficina') { // oficina: puestos de trabajo, archivadores y sala de espera
      const nd = Math.min(3, Math.floor(w / 2.9)), tint = pick([0x3a4a6a, 0x4a4a52, 0x6a3a3a, 0x3a5a4a]);
      for (let k = 0; k < nd; k++) { const u = -w / 2 + 1.5 + k * 2.8, v = clamp(D / 2 + 0.2, 2.4, D - 2.2); F('desk', u, v, 'v-', { col: [1.45, 0.72, 0.8] }); if (rand() < 0.75) F('ochair', u - 0.1, v - 0.75, 'v+', { tint, ry: R(-0.8, 0.8) }); else F('ochair', u + R(-0.5, 0.5), v - 1.2, 'v+', { tint, rz: Math.PI / 2, y: 0.25, ry: R(0, 6) }); }
      F('filecab', -w / 2 + 0.45, D - 0.36, 'v-', { col: [0.5, 0.62, 1.35] }); F('filecab', -w / 2 + 0.97, D - 0.36, 'v-', { col: [0.5, 0.62, 1.35] }); cont(-w / 2 + 0.7, D - 1.0, 'cab', 'Archivador', 'office');
      F('bookshelf', w / 2 - 0.7, D - 0.2, 'v-', { col: [0.92, 0.34, 1.9] }); F('plant', w / 2 - 0.45, 0.55, 'v+', { ry: R(0, 6) }); F('picture', 0, D - 0.04, 'v-', { y: 1.6, tint: pick(TINT), s: 1.3 });
      if (w >= 7) { F('armchair', -w / 2 + 0.6, 1.2, 'u+', { tint, col: [0.95, 0.95, 0.85] }); F('ctable', -w / 2 + 1.7, 1.2, 'u+', { col: [1.05, 0.55, 0.45] }); }
      F('boxes', R(-1, 1), D - 1.1, 'v+', { ry: R(0, 6) });
      for (let k = 0; k < 8; k++) sbox(FUR, sg, R(-w / 2 + 1, w / 2 - 1), Y + 0.03, R(1, D - 1), 0.21, 0.01, 0.29, 0xf0f0ec); // papeles
    }
    else { // piso
      const fr = flatModel(fridgeModel()), ck = flatModel(cabinetModel()), sk = flatModel(sinkModel());
      const put = (mod, u, v, fw, fd, h, kind, name, water) => { const [x, z] = W2(sg, u, v); mod.position.set(x, Y + 0.06, z); mod.rotation.y = Math.atan2(sg.nx, sg.nz); scene.add(mod); const a2 = W2(sg, u - fw / 2, v - fd / 2), b2 = W2(sg, u + fw / 2, v + fd / 2); const bx = addBox(Math.min(a2[0], b2[0]), Y, Math.min(a2[1], b2[1]), Math.max(a2[0], b2[0]), Y + h, Math.max(a2[1], b2[1])); cont(u, v - fd / 2 - 0.5, kind, name, kind === 'sink' ? null : kind, water); const cc = CITY.conts[CITY.conts.length - 1]; cc.model = mod; cc.box = bx; cc.dismantle = kind === 'cab' ? { plank: 3, nails: 4 } : kind === 'fridge' ? { scrap: 2 } : null; };
      put(fr, w / 2 - 0.8, D - 0.7, 0.8, 0.7, 1.8, 'fridge', 'Nevera'); put(sk, w / 2 - 2.0, D - 0.65, 1.2, 0.6, 1, 'sink', 'Fregadero', true); put(ck, -w / 2 + 1.1, D - 0.62, 1.1, 0.55, 1, 'cab', 'Armario');
      // salón y cama
      { const tint = pick(TINT), vS = clamp(D / 2 - 0.5, 1.9, D - 2.9), L = -w / 2, Rr = w / 2;
        F('rug', L + 1.9, vS, 'u+', { tint: pick(TINT) }); F('sofa', L + 0.55, vS, 'u+', { tint, col: [2.1, 0.95, 0.85] }); F('ctable', L + 1.85, vS, 'u+', { col: [1.05, 0.55, 0.45] }); F('picture', L + 0.04, vS, 'u+', { y: 1.6, tint: pick(TINT) }); F('lamp', L + 0.4, vS + 1.45, 'u+');
        const dx = clamp(w / 4 - 0.2, L + 3.6, Rr - 1.2), dv = D / 2 - 0.5; if (dx - 0.76 > L + 2.5) { F('dtable', dx, dv, 'v-', { col: [1.5, 0.87, 0.8] }); F('chair', dx - 0.4, dv - 0.72, 'v+'); F('chair', dx + 0.4, dv + 0.72, 'v-'); }
        if (w > 7.5) { F('bed', Rr - 1.0, 1.35, 'v+', { tint: pick(TINT), col: [1.72, 2.1, 0.65] }); F('bedside', Rr - 2.15, 0.42, 'v+', { col: [0.46, 0.42, 0.55] }); } else F('plant', Rr - 0.45, 0.55, 'v+', { ry: R(0, 6) }); }
    }
  }
  useArea('city');
  // ---------- Plaça Antoni Baqué ----------
  {
    const [x0, x1] = BX[2], [z0, z1] = BZ[3], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2 - 5;
    FLAT.box(cx, Y + 0.05, cz + 5, x1 - x0, 0.1, z1 - z0, 0xd8ccb4);
    for (let k = -4; k <= 4; k++) FLAT.box(cx + k * 5, Y + 0.105, cz, 0.12, 0.01, 40, 0xb8ac94);
    m4.compose(ps.set(cx, Y + 0.4, cz), q.identity(), sc.set(4, 0.8, 4)); SOL.geo(geoCyl, m4, 0xc8c4bc);
    m4.compose(ps.set(cx, Y + 0.82, cz), q.identity(), sc.set(3.7, 0.05, 3.7)); GL.geo(geoCyl, m4, 0x3a8ac8);
    m4.compose(ps.set(cx, Y + 1.4, cz), q.identity(), sc.set(0.5, 2, 0.5)); SOL.geo(geoCyl, m4, 0xc8c4bc);
    addCircle(cx, cz, 4, Y, Y + 0.9);
    CITY.conts.push({ kind: 'fountain', name: 'Font de la plaça', pos: new THREE.Vector3(cx, Y, cz), water: true, r: 5.2 });
    for (const [bx, bz] of [[-12, -10], [12, -10], [-12, 10], [12, 10], [0, -16], [-18, 0], [18, 0]]) { SOL.box(cx + bx, Y + 0.45, cz + bz, 2.2, 0.12, 0.6, 0x6a4a2a); SOL.box(cx + bx, Y + 0.22, cz + bz, 0.15, 0.45, 0.5, 0x3a3a40); }
    for (const [tx, tz] of [[-20, -18], [20, -18], [-20, 14], [20, 14], [-8, -20], [8, -20]]) { SOL.box(cx + tx, Y + 1.5, cz + tz, 0.35, 3, 0.35, 0x6a4a2a); m4.compose(ps.set(cx + tx, Y + 4, cz + tz), q.identity(), sc.set(2.4, 2.1, 2.4)); SOL.geo(geoSph, m4, 0x4a8a3a); addCircle(cx + tx, cz + tz, 0.4, Y, Y + 3); }
    CITY.labels.push({ name: 'Plaça Antoni Baqué', x: cx, z: cz, place: true });
  }
  // ---------- estación y vía del tren ----------
  {
    const rx = 150;
    for (let z = L0 - 10; z < L1 + 10; z += 1.2) SOL.box(rx, Y + 0.08, z, 3.2, 0.12, 0.3, 0x5a4a3a);
    for (const s of [-1, 1]) SOL.box(rx + s * 0.72, Y + 0.2, LC, 0.1, 0.15, L1 - L0 + 20, 0x8a8a92);
    for (let z = L0 - 10; z < L1 + 10; z += 6) { SOL.box(rx + 3.2, Y + 0.7, z, 0.06, 1.4, 0.06, 0x3a3a40); }
    SOL.box(rx + 3.2, Y + 1.3, LC, 0.04, 0.04, L1 - L0 + 20, 0x3a3a40);
    { const gaps = [-198, 66]; let z0f = L0 - 10; for (const gz of gaps) { addBox(rx + 3.1, Y, z0f, rx + 3.3, Y + 1.4, gz - 6); z0f = gz + 6; } addBox(rx + 3.1, Y, z0f, rx + 3.3, Y + 1.4, L1 + 10); }
    // andén y marquesina
    SOL.box(rx - 4, Y + 0.5, -110, 4, 1.0, 50, 0xc8c4bc); SOL.box(rx - 2.05, Y + 1.02, -110, 0.1, 0.03, 50, 0xf0d020);
    for (let z = -132; z <= -88; z += 8) SOL.box(rx - 5, Y + 2.5, z, 0.2, 3, 0.2, 0x3a5a8a);
    SOL.box(rx - 4.5, Y + 4.05, -110, 4.5, 0.15, 50, 0x3a5a8a);
    CITY.labels.push({ name: 'Estació de la Llagosta', x: rx - 6, z: -110, place: true });
    // edificio de la estación (vestíbulo con máquina expendedora)
    const ex = rx - 12, ez = -104, ew = 10, ed = 8;
    SOL.box(ex, Y + 2.3, ez + ed / 2 - 0.15, ew, 4.6, 0.3, 0xe8dcc8); SOL.box(ex - ew / 2 + 0.15, Y + 2.3, ez, 0.3, 4.6, ed, 0xe8dcc8); SOL.box(ex + ew / 2 - 0.15, Y + 2.3, ez, 0.3, 4.6, ed, 0xe8dcc8);
    SOL.box(ex - 3, Y + 2.3, ez - ed / 2 + 0.15, 4, 4.6, 0.3, 0xe8dcc8); SOL.box(ex + 3, Y + 2.3, ez - ed / 2 + 0.15, 4, 4.6, 0.3, 0xe8dcc8); SOL.box(ex, Y + 3.6, ez - ed / 2 + 0.15, 2, 2, 0.3, 0xe8dcc8);
    SOL.box(ex, Y + 4.7, ez, ew + 0.6, 0.3, ed + 0.6, 0x8a3a2a); SOL.box(ex, Y + 0.03, ez, ew, 0.06, ed, 0xd8d4cc);
    addBox(ex - ew / 2, Y, ez + ed / 2 - 0.3, ex + ew / 2, Y + 4.6, ez + ed / 2); addBox(ex - ew / 2, Y, ez - ed / 2, ex - ew / 2 + 0.3, Y + 4.6, ez + ed / 2); addBox(ex + ew / 2 - 0.3, Y, ez - ed / 2, ex + ew / 2, Y + 4.6, ez + ed / 2);
    addBox(ex - 5, Y, ez - ed / 2, ex - 1, Y + 4.6, ez - ed / 2 + 0.3); addBox(ex + 1, Y, ez - ed / 2, ex + 5, Y + 4.6, ez - ed / 2 + 0.3);
    SOL.box(ex + 3.5, Y + 1, ez + 2.8, 1, 2, 0.8, 0xc8202a); GL.box(ex + 3.5, Y + 1.3, ez + 2.38, 0.7, 0.9, 0.05, 0x8ad0ff); addBox(ex + 3, Y, ez + 2.4, ex + 4, Y + 2, ez + 3.2);
    CITY.conts.push({ kind: 'shelf', name: 'Máquina expendedora', loot: 'vending', pos: new THREE.Vector3(ex + 3.5, Y, ez + 1.7) });
    const sm = signMesh('ESTACIÓ', '#c8202a', '#ffffff', 5); sm.position.set(ex, Y + 4.95, ez - ed / 2 - 0.02); sm.rotation.y = Math.PI; scene.add(sm);
  }
  // ---------- Riera Seca (parque al norte) ----------
  {
    const z0 = BZ[BZ.length - 1][0], z1 = 200;
    FLAT.box(-32, Y + 0.03, (z0 + z1) / 2, 404, 0.05, z1 - z0, 0x6a9a4a);
    FLAT.box(-32, Y + 0.06, z0 + 22, 404, 0.04, 9, 0xc8b490);
    for (let k = 0; k < 70; k++) { const x = R(-228, 165), z = R(z0 + 8, z1 - 15); if (Math.abs(z - (z0 + 22)) < 6) continue; if (Math.abs(x + 120) < 18 && Math.abs(z - 172) < 15) continue; SOL.box(x, Y + 1.4, z, 0.35, 2.8, 0.35, 0x6a4a2a); m4.compose(ps.set(x, Y + 3.8, z), q.identity(), sc.set(R(1.8, 2.8), R(1.6, 2.4), R(1.8, 2.8))); SOL.geo(geoSph, m4, pick([0x4a8a3a, 0x5a9a3a, 0x3a7a3a])); addCircle(x, z, 0.4, Y, Y + 3); }
    for (let k = 0; k < 30; k++) { const x = R(-228, 165), z = z0 + 22 + R(-4, 4); m4.compose(ps.set(x, Y + 0.2, z), q.identity(), sc.set(R(0.3, 0.7), R(0.2, 0.4), R(0.3, 0.7))); SOL.geo(geoSph, m4, 0x9a9488); }
    CITY.labels.push({ name: 'Riera Seca', x: 0, z: z0 + 22, place: true });
  }
  // árbol tipo plátano (el de las calles catalanas) con alcorque
  function planeTree(tx, tz, k = 1) {
    m4.compose(ps.set(tx, Y + 2.2 * k, tz), q.identity(), sc.set(0.2 * k, 4.4 * k, 0.2 * k)); BRKT.geo(geoCyl, m4, 0xffffff);
    for (const [ax, az, ay] of [[0.5, 0.2, 4.4], [-0.4, 0.4, 4.6], [0.1, -0.5, 4.8]]) { m4.compose(ps.set(tx + ax * k * 0.5, Y + (ay - 0.6) * k, tz + az * k * 0.5), q.setFromEuler(new THREE.Euler(az * 0.6, 0, -ax * 0.6)), sc.set(0.11 * k, 1.6 * k, 0.11 * k)); BRKT.geo(geoCyl, m4, 0xffffff); }
    for (let c = 0; c < 6; c++) { const a = c / 6 * 6.28 + tr(), r = (c ? 1.5 : 0) * k; m4.compose(ps.set(tx + Math.cos(a) * r, Y + (5.2 + tr() * 1.2) * k, tz + Math.sin(a) * r), q.identity(), sc.set((1.5 + tr() * 0.5) * k, (1.2 + tr() * 0.4) * k, (1.5 + tr() * 0.5) * k)); SOL.geo(geoSph, m4, pick([0x5a8a3a, 0x6a9a42, 0x4e7e34, 0x7aa04a])); }
    STN.box(tx, Y + 0.13, tz, 1.4, 0.06, 1.4, 0x9a9488); SOL.box(tx, Y + 0.12, tz, 1.2, 0.04, 1.2, 0x5a4a38);
    addCircle(tx, tz, 0.3, Y, Y + 4);
  }
  // ---------- farolas, árboles de la avenida y coches aparcados ----------
  for (let i = 0; i < XS.length; i++) for (let z = L0 + 4; z < L1; z += 22) for (const s of [-1, 1]) {
    if (ZS.some(zz => Math.abs(z - zz) < 9)) continue;
    const x = XS[i] + s * (XW[i] / 2 + 0.6);
    SOL.box(x, Y + 2.6, z, 0.12, 5.2, 0.12, 0x3a3a40); SOL.box(x - s * 0.5, Y + 5.15, z, 1.0, 0.08, 0.1, 0x3a3a40); LMP.box(x - s * 0.95, Y + 5.05, z, 0.45, 0.12, 0.3, 0xfff0c0);
    addCircle(x, z, 0.12, Y, Y + 5);
    if (XW[i] === 16 || (i !== XS.length - 1 && rand() < 0.35)) { const tx = XS[i] + s * (XW[i] / 2 + 1.7), tz = z + 11; planeTree(tx, tz, XW[i] === 16 ? 1 : 0.8); }
  }
  (CITY.carSpots = CITY.carSpots || []).push([-6.6, -111, 0], [-6.6, -126, Math.PI], [6.6, -104, Math.PI], [6.6, -132 + 14, 0]);
  const CARC = [0xd8d8dc, 0x2a2a30, 0x8a2a2a, 0x2a3a6a, 0x6a6a72, 0xb89a3a, 0x2a4a3a, 0x4a2a2a, 0x8a8a90];
  for (let k = 0; k < 110; k++) {
    const alongZ = rand() < 0.5, idx = RI(0, XS.length - 1); let x, z;
    if (alongZ) { x = XS[idx] + (rand() < 0.5 ? -1 : 1) * (XW[idx] / 2 - 1.2); z = R(L0, L1); if (ZS.some(zz => Math.abs(z - zz) < 12)) continue; }
    else { z = ZS[idx] + (rand() < 0.5 ? -1 : 1) * (ZW[idx] / 2 - 1.2); x = R(L0, 140); if (XS.some(xx => Math.abs(x - xx) < 14)) continue; }
    const r = rand(), ang = (alongZ ? 0 : Math.PI / 2) + R(-0.06, 0.06) + (rand() < 0.5 ? Math.PI : 0); if (r >= 0.3 && rand() < 0.5) (CITY.carSpots = CITY.carSpots || []).push([x, z, ang]); else car(x, z, ang, pick(CARC), r < 0.3 ? 1 : 0);
  }
  // coches abandonados en mitad de la calzada, cruzados, quemados o volcados
  for (let k = 0; k < 26; k++) {
    const alongZ = rand() < 0.5, idx = RI(0, XS.length - 1); let x, z;
    if (alongZ) { x = XS[idx] + R(-1.5, 1.5); z = R(L0 + 10, L1 - 10); if (ZS.some(zz => Math.abs(z - zz) < 10)) continue; } else { z = ZS[idx] + R(-1.5, 1.5); x = R(L0 + 10, 140); if (XS.some(xx => Math.abs(x - xx) < 12)) continue; }
    const r = rand(); car(x, z, R(0, 6.28), pick(CARC), r < 0.45 ? 1 : r < 0.62 ? 2 : 0);
  }
  // ---------- mobiliario urbano ----------
  const CONT_C = [0x7a7e84, 0xf0c428, 0x2a6ac8, 0x2a8a4a, 0x8a5a2a];
  for (let i = 0; i < XS.length; i++) for (let z = L0 + 16; z < L1 - 10; z += 44) {
    if (ZS.some(zz => Math.abs(z - zz) < 12)) continue; const sx = rand() < 0.5 ? -1 : 1, x = XS[i] + sx * (XW[i] / 2 - 1.1);
    for (let c = 0; c < 4; c++) { const zz = z + c * 1.9 - 2.8, col = CONT_C[c % CONT_C.length];
      SOL.box(x, Y + 0.75, zz, 1.4, 1.4, 1.7, col); SOL.box(x, Y + 1.5, zz, 1.5, 0.1, 1.8, new THREE.Color(col).multiplyScalar(0.75).getHex()); SOL.box(x + sx * 0.72, Y + 1.1, zz, 0.05, 0.25, 0.9, 0x2a2a30);
      for (const b of [-0.6, 0.6]) SOL.box(x, Y + 0.08, zz + b, 1.2, 0.16, 0.1, 0x1a1a1e); }
    addBox(x - 0.75, Y, z - 3.8, x + 0.75, Y + 1.6, z + 4.0);
  }
  for (let i = 0; i < XS.length; i++) for (let j = 0; j < ZS.length; j++) for (const [ox, oz] of [[1, 1], [-1, -1]]) {
    const x = XS[i] + ox * (XW[i] / 2 + 1.2), z = ZS[j] + oz * (ZW[j] / 2 + 1.2);
    if ((i + j) % 2 === 0) { MET.box(x, Y + 1.7, z, 0.12, 3.4, 0.12, 0x5a5c62); SOL.box(x, Y + 3.3, z, 0.32, 0.9, 0.3, 0x1a1a1e); for (let k = 0; k < 3; k++) LMP.box(x - ox * 0.0, Y + 3.6 - k * 0.27, z + oz * 0.16, 0.18, 0.18, 0.04, [0xff3a2a, 0xffb428, 0x3aff6a][k]); addCircle(x, z, 0.1, Y, Y + 3); }
    else { for (let k = -1; k <= 1; k++) { MET.box(x + k * 0.9 * (i % 2 ? 1 : 0), Y + 0.45, z + k * 0.9 * (i % 2 ? 0 : 1), 0.14, 0.9, 0.14, 0x3a3c42); } }
  }
  for (let k = 0; k < 40; k++) { // bancos y papeleras en las aceras
    const alongZ = rand() < 0.5, idx = RI(0, XS.length - 1); let x, z, rot = 0;
    if (alongZ) { const s2 = rand() < 0.5 ? -1 : 1; x = XS[idx] + s2 * (XW[idx] / 2 + SW - 0.6); z = R(L0 + 5, L1 - 5); if (ZS.some(zz => Math.abs(z - zz) < 10)) continue; }
    else { const s2 = rand() < 0.5 ? -1 : 1; z = ZS[idx] + s2 * (ZW[idx] / 2 + SW - 0.6); x = R(L0 + 5, 135); if (XS.some(xx => Math.abs(x - xx) < 12)) continue; }
    if (rand() < 0.5) { WOD.box(x, Y + 0.48, z, alongZ ? 0.5 : 1.8, 0.08, alongZ ? 1.8 : 0.5, 0xffffff); WOD.box(x + (alongZ ? 0.24 : 0), Y + 0.8, z + (alongZ ? 0 : 0.24), alongZ ? 0.06 : 1.8, 0.45, alongZ ? 1.8 : 0.06, 0xffffff); for (const b of [-0.75, 0.75]) MET.box(x + (alongZ ? 0 : b), Y + 0.24, z + (alongZ ? b : 0), 0.45, 0.48, 0.08, 0x3a3c42); addBox(x - (alongZ ? 0.3 : 0.9), Y, z - (alongZ ? 0.9 : 0.3), x + (alongZ ? 0.3 : 0.9), Y + 0.9, z + (alongZ ? 0.9 : 0.3)); }
    else { m4.compose(ps.set(x, Y + 0.45, z), q.identity(), sc.set(0.25, 0.8, 0.25)); MET.geo(geoCyl, m4, 0x3a6a4a); MET.box(x, Y + 0.45, z, 0.06, 0.9, 0.06, 0x2a2a30); }
  }
  // parada de bus en la avenida
  { const x = XS[3] + XW[3] / 2 + 1.4, z = -40; MET.box(x + 0.9, Y + 1.3, z, 0.06, 2.6, 3.6, 0x8a8c92); GL.box(x + 0.88, Y + 1.5, z, 0.04, 1.8, 3.4, 0x8ab0c8); SOL.box(x + 0.3, Y + 2.65, z, 1.4, 0.1, 3.8, 0xc8202a); WOD.box(x + 0.6, Y + 0.5, z, 0.4, 0.08, 2.6, 0xffffff); addBox(x + 0.85, Y, z - 1.8, x + 0.95, Y + 2.6, z + 1.8); }
  // ---------- ambiente post-apocalíptico ----------
  CITY.anim = [];
  const onStreet = () => rand() < 0.5 ? [pick(XS) + R(-6, 6), R(L0 + 4, L1 - 4)] : [R(L0 + 4, 145), pick(ZS) + R(-5, 5)];
  const sidewalk = () => { if (rand() < 0.5) { const i = RI(0, XS.length - 1), s2 = rand() < 0.5 ? -1 : 1; return [XS[i] + s2 * (XW[i] / 2 + SW * 0.5), R(L0 + 4, L1 - 4), 0]; } const j = RI(0, ZS.length - 1), s2 = rand() < 0.5 ? -1 : 1; return [R(L0 + 4, 145), ZS[j] + s2 * (ZW[j] / 2 + SW * 0.5), 1]; };
  const clearOfCross = (x, z, d = 9) => !(XS.some(a => Math.abs(x - a) < d) && ZS.some(b => Math.abs(z - b) < d));
  // escombros
  for (let k = 0; k < 60; k++) {
    const [x, z] = sidewalk(); if (!clearOfCross(x, z)) continue; const n = RI(5, 12), rr = R(0.8, 1.8);
    for (let m = 0; m < n; m++) { const a = R(0, 6.28), d = R(0, rr), sz = R(0.15, 0.55); m4.compose(ps.set(x + Math.cos(a) * d, Y + sz * 0.4, z + Math.sin(a) * d), q.setFromEuler(_e.set(R(0, 3), R(0, 3), R(0, 3))), sc.set(sz, sz * R(0.5, 1), sz * R(0.7, 1.3))); (rand() < 0.3 ? BRK : SOL).geo(rand() < 0.6 ? geoSph : geoBox, m4, rand() < 0.3 ? 0xffffff : pick([0x8a8680, 0x9a948a, 0x6a6660, 0xb0a898])); }
    if (rr > 1.3) addCircle(x, z, rr * 0.6, Y, Y + 0.6);
  }
  // bolsas de basura
  for (let k = 0; k < 90; k++) { const [x, z] = sidewalk(); const n = RI(2, 6); for (let m = 0; m < n; m++) { const sz = R(0.3, 0.45); m4.compose(ps.set(x + R(-0.7, 0.7), Y + sz * 0.55, z + R(-0.7, 0.7)), q.setFromEuler(_e.set(R(-0.3, 0.3), R(0, 6), R(-0.3, 0.3))), sc.set(sz, sz * 0.8, sz * 1.1)); SOL.geo(geoSph, m4, pick([0x18181c, 0x22222a, 0x2a3a2a, 0x1a1a24])); } }
  // barricadas de la policía y bloques de hormigón
  for (let k = 0; k < 16; k++) {
    const i = RI(0, XS.length - 1), j = RI(0, ZS.length - 1), alongX = rand() < 0.5, x = XS[i] + (alongX ? 0 : R(-14, 14)), z = ZS[j] + (alongX ? R(-14, 14) : 0), ext = alongX ? XW[i] : ZW[j];
    if (Math.abs(x - XS[i]) < 9 && Math.abs(z - ZS[j]) < 9) continue;
    for (let o = -ext / 2 + 1; o < ext / 2; o += 2.2) {
      const bx = alongX ? x + o : x, bz = alongX ? z : z + o;
      if (rand() < 0.5) { SOL.box(bx, Y + 0.45, bz, alongX ? 2.0 : 0.6, 0.9, alongX ? 0.6 : 2.0, 0xb8b4aa); SOL.box(bx, Y + 0.12, bz, alongX ? 2.0 : 0.8, 0.24, alongX ? 0.8 : 2.0, 0xa8a49a); addBox(bx - (alongX ? 1 : 0.4), Y, bz - (alongX ? 0.4 : 1), bx + (alongX ? 1 : 0.4), Y + 0.9, bz + (alongX ? 0.4 : 1)); }
      else { for (let st = 0; st < 2; st++) for (let w = 0; w < 4; w++) SOL.box(bx + (alongX ? -0.75 + w * 0.5 : 0), Y + 0.75 + st * 0.3, bz + (alongX ? 0 : -0.75 + w * 0.5), alongX ? 0.5 : 0.08, 0.2, alongX ? 0.08 : 0.5, w % 2 ? 0xffffff : 0xd82a2a); for (const e of [-0.8, 0.8]) SOL.box(bx + (alongX ? e : 0), Y + 0.5, bz + (alongX ? 0 : e), 0.08, 1.0, 0.08, 0x3a3a40); addBox(bx - (alongX ? 1 : 0.15), Y, bz - (alongX ? 0.15 : 1), bx + (alongX ? 1 : 0.15), Y + 1.0, bz + (alongX ? 0.15 : 1)); }
    }
  }
  // puesto militar con sacos terreros en la avenida
  for (const [cx, cz] of [[XS[3], -66 + 14], [XS[3], 66 - 14], [-132 + 14, ZS[2]]]) {
    const alongX = cx === XS[3];
    for (let st = 0; st < 3; st++) for (let o = -5; o <= 5; o += 0.62) { if (Math.abs(o) < 1.6 && st > 0 && rand() < 0.7) continue; const x = alongX ? cx + o + (st % 2) * 0.3 : cx, z = alongX ? cz : cz + o + (st % 2) * 0.3; m4.compose(ps.set(x, Y + 0.16 + st * 0.27, z), q.setFromEuler(_e.set(0, alongX ? 0 : Math.PI / 2, 0)), sc.set(0.34, 0.15, 0.24)); SOL.geo(geoSph, m4, pick([0xa8946a, 0x9a8860, 0xb4a078])); }
    addBox(alongX ? cx - 5.3 : cx - 0.35, Y, alongX ? cz - 0.35 : cz - 5.3, alongX ? cx + 5.3 : cx + 0.35, Y + 0.85, alongX ? cz + 0.35 : cz + 5.3);
    // tienda de campaña militar
    const tx = alongX ? cx + 3 : cx - 4, tz = alongX ? cz + (cz > 0 ? -4 : 4) : cz + 3;
    m4.compose(ps.set(tx, Y + 1.1, tz), q.setFromEuler(_e.set(0, 0, Math.PI / 4)), sc.set(2.2, 2.2, 3.4)); SOL.geo(geoBox, m4, 0x4a5a3a); SOL.box(tx, Y + 0.02, tz, 3.2, 0.04, 3.4, 0x3a4a2a); addBox(tx - 1.6, Y, tz - 1.7, tx + 1.6, Y + 2.2, tz + 1.7);
    CITY.conts.push({ kind: 'crate', name: 'Caja militar', loot: 'policia', pos: new THREE.Vector3(tx + (alongX ? 2.2 : 0), Y, tz + (alongX ? 0 : 2.2)), room: null });
    WOD.box(tx + (alongX ? 2.2 : 0), Y + 0.35, tz + (alongX ? 0 : 2.2), 1.0, 0.7, 0.6, 0x7a8a5a);
  }
  // bolsas para cadáveres y cuerpos tapados con sábanas
  for (let k = 0; k < 28; k++) { const [x, z] = rand() < 0.6 ? sidewalk() : onStreet(); const a = R(0, 6.28), sheet = rand() < 0.4; m4.compose(ps.set(x, Y + 0.14, z), q.setFromEuler(_e.set(0, a, 0)), sc.set(0.32, 0.13, 0.95)); SOL.geo(geoSph, m4, sheet ? 0xd8d4c8 : pick([0x1a1a1e, 0x2a2a20, 0x3a3a2a])); if (sheet) { m4.compose(ps.set(x + Math.sin(a) * 0.3, Y + 0.18, z + Math.cos(a) * 0.3), q.setFromEuler(_e.set(0, a, 0)), sc.set(0.2, 0.06, 0.25)); SOL.geo(geoSph, m4, 0x6a1010); } }
  // hierbajos en grietas y al pie de las fachadas
  { const WEED = new Merger(), gCone = new THREE.ConeGeometry(1, 1, 4);
    for (let k = 0; k < (IS_TOUCH ? 1200 : 2400); k++) {
      let x, z; if (rand() < 0.65) { const s0 = sidewalk(); x = s0[0] + R(-1.3, 1.3); z = s0[1] + R(-1.3, 1.3); } else { const s0 = onStreet(); x = s0[0]; z = s0[1]; }
      const n = RI(2, 5), col = pick([0x4a5a2a, 0x5a6a30, 0x3a4a22, 0x6a6a3a, 0x7a7a4a]);
      for (let m = 0; m < n; m++) { const h = R(0.15, 0.55); m4.compose(ps.set(x + R(-0.15, 0.15), Y + 0.08 + h / 2, z + R(-0.15, 0.15)), q.setFromEuler(_e.set(R(-0.4, 0.4), R(0, 3), R(-0.4, 0.4))), sc.set(0.03, h, 0.03)); WEED.geo(gCone, m4, col); }
    }
    scene.add(WEED.mesh(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), false));
  }
  // grafitis
  { const msgs = ['ZONA INFECTADA', 'NO ENTRAR', 'SOS', 'ESTÁN DENTRO', 'QUEDAN VIVOS?', 'AL CAMPO DE FUTBOL', 'NO DISPARÉIS', 'DIOS NOS ABANDONÓ', '3 VIVOS AQUÍ', 'CORRE'], cols = ['#c81a1a', '#e8e8e0', '#1a1a1a', '#d8a020'];
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1280; const gx = cv.getContext('2d'); gx.textAlign = 'center'; gx.textBaseline = 'middle';
    msgs.forEach((t, i) => { const cy = i * 128 + 64; gx.save(); gx.translate(512, cy); gx.rotate(R(-0.06, 0.06)); gx.font = `900 ${t.length > 12 ? 70 : 96}px Impact, "Arial Black", sans-serif`; const c = cols[i % cols.length]; gx.shadowColor = c; gx.shadowBlur = 8; gx.fillStyle = c; gx.fillText(t, 0, 0); gx.shadowBlur = 0; for (let d = 0; d < 14; d++) { gx.fillRect(R(-300, 300), R(10, 60), 3, R(10, 40)); } gx.restore(); });
    const gt = new THREE.CanvasTexture(cv), gm = new THREE.MeshStandardMaterial({ map: gt, transparent: true, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -3, depthWrite: false });
    const GPOS = [], GUV = [], GN = [];
    const cands = segs.filter(sg => !sg.room);
    for (let k = 0; k < 70 && cands.length; k++) {
      const sg = pick(cands), i = RI(0, msgs.length - 1), w = R(2.2, 4), h = w / 8 * 1.0, u = R(-sg.w / 2 + w / 2, sg.w / 2 - w / 2), y = Y + R(0.9, 2.4);
      const [cx, cz] = W2(sg, u, -0.07);
      const v0 = 1 - (i + 1) / msgs.length, v1 = 1 - i / msgs.length;
      const corners = [[-1, -1, 0, v0], [1, -1, 1, v0], [1, 1, 1, v1], [-1, -1, 0, v0], [1, 1, 1, v1], [-1, 1, 0, v1]];
      const rx = sg.nz, rz = -sg.nx;
      for (const [a, b, uu, vv] of corners) { GPOS.push(cx + rx * a * w / 2, y + b * h / 2, cz + rz * a * w / 2); GUV.push(uu, vv); GN.push(sg.nx, 0, sg.nz); }
    }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(GPOS, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(GUV, 2)); gg.setAttribute('normal', new THREE.Float32BufferAttribute(GN, 3));
    const gmesh = new THREE.Mesh(gg, gm); gm.side = THREE.DoubleSide; scene.add(gmesh);
  }
  // bidones con fuego (animados)
  { const fmat = new THREE.MeshBasicMaterial({ color: 0xffa030, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), fgeo = new THREE.ConeGeometry(0.16, 0.7, 6);
    for (let k = 0; k < 14; k++) { const [x, z] = sidewalk(); if (!clearOfCross(x, z)) continue; m4.compose(ps.set(x, Y + 0.45, z), q.identity(), sc.set(0.32, 0.9, 0.32)); MET.geo(geoCyl, m4, pick([0x6a3a22, 0x4a3a32, 0x7a4a2a])); addCircle(x, z, 0.35, Y, Y + 0.9);
      const g = new THREE.Group(); g.position.set(x, Y + 0.95, z); const fl = []; for (let m = 0; m < 5; m++) { const f = new THREE.Mesh(fgeo, fmat); f.position.set(R(-0.12, 0.12), 0.2, R(-0.12, 0.12)); f.userData.ph = R(0, 6); g.add(f); fl.push(f); } scene.add(g);
      CITY.anim.push((t) => { for (const f of fl) { const s2 = 0.7 + Math.sin(t * 13 + f.userData.ph) * 0.3; f.scale.set(s2, s2 * (0.8 + Math.sin(t * 9 + f.userData.ph) * 0.35), s2); } }); CITY.fires = (CITY.fires || []).concat([[x, z]]);
    }
  }
  // columnas de humo a lo lejos
  { const sc2 = document.createElement('canvas'); sc2.width = sc2.height = 64; const sx = sc2.getContext('2d'), gr = sx.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 64, 64);
    const st = new THREE.CanvasTexture(sc2);
    for (const [x, z] of [[-210, -60], [120, -200], [60, 150], [-160, 120], [170, 40]]) {
      const parts = []; for (let k = 0; k < 22; k++) { const sm = new THREE.Sprite(new THREE.SpriteMaterial({ map: st, color: 0x3a3634, transparent: true, opacity: 0.5, depthWrite: false, fog: true })); sm.userData.t = k / 22; scene.add(sm); parts.push(sm); }
      CITY.anim.push((t, dt) => { for (const sm of parts) { sm.userData.t = (sm.userData.t + dt * 0.035) % 1; const u = sm.userData.t; sm.position.set(x + Math.sin(u * 5 + x) * 4 + u * 25, Y + 4 + u * 70, z + Math.cos(u * 4) * 3); const sz = 6 + u * 26; sm.scale.set(sz, sz, 1); sm.material.opacity = 0.55 * Math.min(1, u * 6) * (1 - u); } });
    }
  }
  CITY.update = (t, dt) => { for (const f of CITY.anim) f(t, dt); };
  // ---------- suciedad del apocalipsis: hojas, papeles, sangre, alcantarillas ----------
  for (let k = 0; k < 2200; k++) {
    const sp = rand() < 0.5 ? [pick(XS) + R(-7, 7), R(L0, L1)] : [R(L0, 140), pick(ZS) + R(-6, 6)], r = rand();
    if (r < 0.55) DEC.box(sp[0], Y + 0.075 + rand() * 0.01, sp[1], R(0.12, 0.3), 0.01, R(0.08, 0.22), pick([0xa8782a, 0xc8a040, 0x8a5a24, 0xd8c890])); // hojas
    else if (r < 0.8) DEC.box(sp[0], Y + 0.08, sp[1], R(0.2, 0.35), 0.008, R(0.25, 0.4), pick([0xf0f0ec, 0xe8e0c8, 0xd8e0e8])); // papeles
    else if (r < 0.93) { const sz = R(0.4, 1.4); m4.compose(ps.set(sp[0], Y + 0.062, sp[1]), q.setFromEuler(new THREE.Euler(0, rand() * 6, 0)), sc.set(sz, 0.004, sz * R(0.5, 1))); DEC.geo(geoCyl, m4, pick([0x2a0604, 0x3a0806, 0x24100a])); } // sangre
    else { m4.compose(ps.set(sp[0], Y + 0.05, sp[1]), q.identity(), sc.set(0.4, 0.01, 0.4)); DEC.geo(geoCyl, m4, 0x2a2a2e); } // alcantarilla
  }
  
  // ---------- solar en obras (materiales de construcción) ----------
  CITY.matSpots = [];
  { const ox = -120, oz = 172;
    for (let k = -14; k <= 14; k += 2) { MET.box(ox + k, Y + 1, oz - 12, 2, 2, 0.05, 0xc8c8cc); MET.box(ox + k, Y + 1, oz + 12, 2, 2, 0.05, 0xc8c8cc); }
    for (let k = -12; k <= 12; k += 2) { MET.box(ox - 15, Y + 1, oz + k, 0.05, 2, 2, 0xc8c8cc); if (Math.abs(k) > 2) MET.box(ox + 15, Y + 1, oz + k, 0.05, 2, 2, 0xc8c8cc); }
    addBox(ox - 15, Y, oz - 12.05, ox + 15, Y + 2, oz - 11.95); addBox(ox - 15, Y, oz + 11.95, ox + 15, Y + 2, oz + 12.05); addBox(ox - 15.05, Y, oz - 12, ox - 14.95, Y + 2, oz + 12); addBox(ox + 14.95, Y, oz - 12, ox + 15.05, Y + 2, oz - 3); addBox(ox + 14.95, Y, oz + 3, ox + 15.05, Y + 2, oz + 12);
    SOL.box(ox, Y + 0.04, oz, 30, 0.06, 24, 0x9a8a6a);
    for (const [px, pz] of [[-8, -6], [-3, 5], [6, -4], [9, 6]]) { WOD.box(ox + px, Y + 0.08, oz + pz, 1.2, 0.14, 1.2, 0xffffff); for (let l = 0; l < 4; l++) WOD.box(ox + px, Y + 0.2 + l * 0.08, oz + pz, 1.1, 0.06, 0.25, 0xffffff); }
    m4.compose(ps.set(ox - 10, Y + 0.8, oz + 7), q.identity(), sc.set(1.6, 1.6, 1.6)); SOL.geo(geoSph, m4, 0xb8a88a);
    SOL.box(ox + 4, Y + 1.0, oz + 2, 2.4, 2, 6, 0xe8a02a);
    CITY.labels.push({ name: 'Solar en obras', x: ox, z: oz, place: true });
    for (let k = 0; k < 18; k++) CITY.matSpots.push([ox + R(-12, 12), oz + R(-9, 9)]);
  }
  // placas de calle en las esquinas
  for (let i = 0; i < XS.length; i++) for (let j = 0; j < ZS.length; j++) {
    const x = XS[i] + XW[i] / 2 + SW + 0.05, z = ZS[j] + ZW[j] / 2 + SW + 0.05;
    for (const [txt, rot, ox, oz] of [[XN[i], -Math.PI / 2, 0, 1.2], [ZN[j], 0, 1.4, 0]]) {
      const t = signCache[txt] || (signCache[txt] = textTexture(txt, '#f4f4f0', '#1a3a7a', 1024, 160, 'bold 74px Nunito, sans-serif'));
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.25), new THREE.MeshBasicMaterial({ map: t })); m.position.set(x + ox, Y + 3.0, z + oz); m.rotation.y = rot; scene.add(m);
    }
  }
  // ---------- campamento amurallado fuera de la ciudad (carretera de Sant Fost) ----------
  { const C = POIS.find(p => p.type === 'camp');
    if (C) { useArea('road');
      const X0 = C.x - 23, X1 = C.x + 23, Z0 = C.z - 19, Z1 = C.z + 19, H = 3.0, gw = 4.4;
      CITY.campSpot = { x: C.x, z: C.z, X0, X1, Z0, Z1, gate: [C.x, Z0], towers: [[X0 + 1.5, Z0 + 1.5], [X1 - 1.5, Z0 + 1.5], [X0 + 1.5, Z1 - 1.5], [X1 - 1.5, Z1 - 1.5]].map(([x, z]) => ({ x, z, y: Y + 4.2, lx: x + 1.15, lz: z - 1.9 })) };
      SOL.box(C.x, Y + 0.02, C.z, X1 - X0, 0.04, Z1 - Z0, 0x8a8070); // grava
      ASM.box(C.x, Y + 0.02, (Z0 + 3) / 2, 5, 0.04, Z0 - 3, 0xffffff); // camino hasta la puerta
      const wall = (ax, az, bx, bz) => { const alongX = az === bz, len = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2;
        for (let t = 0; t < len; t += 2) { const px = alongX ? Math.min(ax, bx) + t + 1 : ax, pz = alongX ? az : Math.min(az, bz) + t + 1; if (alongX && az === Z0 && Math.abs(px - C.x) < gw / 2 + 0.2) continue; STN.box(px, Y + 0.6, pz, alongX ? 1.96 : 0.7, 1.2, alongX ? 0.7 : 1.96, 0xc8c4b8); MET.box(px, Y + 1.2 + (H - 1.2) / 2, pz + (alongX ? 0.05 : 0), alongX ? 2.0 : 0.06, H - 1.2, alongX ? 0.06 : 2.0, pick([0xa8acb2, 0x8a8c92, 0x9a7a5a])); }
        for (let t = 0; t <= len; t += 4) { const px = alongX ? Math.min(ax, bx) + t : ax, pz = alongX ? az : Math.min(az, bz) + t; WOD.box(px, Y + H / 2 + 0.2, pz, 0.18, H + 0.4, 0.18, 0x7a5a3a); }
        for (let t = 0; t < len; t += 0.5) { const px = alongX ? Math.min(ax, bx) + t : ax, pz = alongX ? az : Math.min(az, bz) + t; if (alongX && az === Z0 && Math.abs(px - C.x) < gw / 2) continue; MET.box(px, Y + H + 0.25, pz, 0.04, 0.5, 0.04, 0x6a6a72); } // alambre
        addBox(Math.min(ax, bx) - (alongX ? 0 : 0.4), Y, Math.min(az, bz) - (alongX ? 0.4 : 0), Math.max(ax, bx) + (alongX ? 0 : 0.4), Y + H + 0.5, Math.max(az, bz) + (alongX ? 0.4 : 0)); };
      wall(X0, Z1, X1, Z1); wall(X0, Z0, X1, Z0 + 0 * 1); wall(X0, Z0, X0, Z1); wall(X1, Z0, X1, Z1);
      // la puerta: abre un hueco en el muro sur
      { const gx0 = C.x - gw / 2, gx1 = C.x + gw / 2; for (let i = BOXES.length - 1; i >= 0; i--) { const b = BOXES[i]; if (Math.abs(b.z0 - (Z0 - 0.4)) < 0.01 && b.x0 <= gx0 && b.x1 >= gx1) { BOXES.splice(i, 1); for (const l of COLGRID.values()) { const j = l.indexOf(b); if (j >= 0) l.splice(j, 1); } addBox(b.x0, b.y0, b.z0, gx0, b.y1, b.z1); addBox(gx1, b.y0, b.z0, b.x1, b.y1, b.z1); break; } } }
      (CITY.doors = CITY.doors || []).push({ x: C.x, z: Z0, y: Y, rot: 0, gate: true, spawn: false, shop: false, name: 'Puerta del campamento' });
      // torres de vigilancia
      for (const [tx, tz] of [[X0 + 1.5, Z0 + 1.5], [X1 - 1.5, Z0 + 1.5], [X0 + 1.5, Z1 - 1.5], [X1 - 1.5, Z1 - 1.5]]) { for (const a of [-1, 1]) for (const b of [-1, 1]) WOD.box(tx + a * 1.1, Y + 2.6, tz + b * 1.1, 0.16, 5.2, 0.16, 0x6a4a32); WOD.box(tx, Y + 4.4, tz, 2.6, 0.12, 2.6, 0xb08050); for (const a of [-1, 1]) { WOD.box(tx + a * 1.25, Y + 4.95, tz, 0.08, 1.0, 2.5, 0xc8a878); WOD.box(tx, Y + 4.95, tz + a * 1.25, 2.5, 1.0, 0.08, 0xc8a878); } SOL.box(tx, Y + 6.0, tz, 3.0, 0.08, 3.0, 0x4a5a3a); for (let k = 0; k < 9; k++) WOD.box(tx + 1.15, Y + 0.3 + k * 0.5, tz - 1.3, 0.5, 0.05, 0.05, 0x8a6a4a); addBox(tx - 1.2, Y, tz - 1.2, tx + 1.2, Y + 2, tz + 1.2); }
      // tiendas de campaña, sacos y bidones
      const geoPrism = new THREE.CylinderGeometry(1, 1, 1, 3); geoPrism.rotateX(Math.PI / 2); geoPrism.rotateZ(Math.PI);
      const rbox = (M, x, y, z, w, h, d, col, rx = 0, ry = 0, rz = 0, geo = geoBox) => { m4.compose(ps.set(x, y, z), q.setFromEuler(_e.set(rx, ry, rz)), sc.set(w, h, d)); M.geo(geo, m4, col); };
      const post = (x, z, h, col = 0x6a4a32, r = 0.16) => { WOD.box(x, Y + h / 2, z, r, h, r, col); addCircle(x, z, 0.14, Y, Y + h); };
      // suelo: caminos de tierra pisada, palés y zona del fuego
      DEC.box(C.x, Y + 0.05, C.z - 10.4, 3.4, 0.01, 17.2, 0x6e6252); DEC.box(C.x - 1.25, Y + 0.05, C.z + 0.5, 28.5, 0.01, 2.6, 0x6e6252); DEC.box(C.x + 14.5, Y + 0.05, C.z - 5.05, 2.6, 0.01, 8.5, 0x6e6252);
      for (let k = 0; k < 9; k++) { const pz = Z0 + 4.5 + k * 1.55; for (let j = 0; j < 5; j++) WOD.box(C.x - 0.72 + j * 0.36 + (k % 2) * 0.03, Y + 0.07, pz, 0.3, 0.05, 1.35, j % 2 ? 0xb89a70 : 0xa88a62); }
      for (let k = 0; k < 28; k++) { const a = rand() * 6.28, r = R(1.2, 3.2); m4.compose(ps.set(C.x - 3 + Math.cos(a) * r, Y + 0.058 + k * 0.0015, C.z - 5 + Math.sin(a) * r), q.identity(), sc.set(R(0.2, 0.6), 0.004, R(0.2, 0.6))); DEC.geo(geoCyl, m4, pick([0x3a342c, 0x4a4238, 0x2a2622])); }
      // tiendas de campaña de verdad (lona a dos aguas, entrada oscura, vientos y piquetas)
      for (const [tx, tz, rot, tc] of [[C.x - 14, C.z + 10, 0, 0x55663a], [C.x - 6, C.z + 12, 0, 0x3a4a5e], [C.x + 12, C.z + 10, 1, 0x6a5238], [C.x + 18, C.z + 13, 1, 0x55663a], [C.x - 19, C.z + 14, 0, 0x8a2a24]]) {
        const ry = rot ? Math.PI / 2 : 0, w = 2.9, h = 1.9, len = 3.8, fx = rot ? 1 : 0, fz = rot ? 0 : 1;
        rbox(SOL, tx, Y + h / 3, tz, w / 1.732, h / 1.5, len, tc, 0, ry, 0, geoPrism); rbox(SOL, tx, Y + h / 3 - 0.02, tz, w / 1.732 * 0.72, h / 1.5 * 0.72, len + 0.06, 0x14140f, 0, ry, 0, geoPrism);
        rbox(WOD, tx, Y + h + 0.02, tz, 0.07, 0.07, len + 0.5, 0x5a4a32, 0, ry, 0); SOL.box(tx, Y + 0.04, tz, rot ? len + 0.5 : w + 0.5, 0.05, rot ? w + 0.5 : len + 0.5, 0x4a4238);
        for (const a of [-1, 1]) for (const b of [-1, 1]) { const px = tx + (rot ? b * (len / 2 - 0.3) : a * (w / 2 + 0.45)), pz = tz + (rot ? a * (w / 2 + 0.45) : b * (len / 2 - 0.3)); WOD.box(px, Y + 0.12, pz, 0.05, 0.24, 0.05, 0x8a6a4a); }
        MET.box(tx + fx * (len / 2 + 0.7), Y + 0.5, tz - fz * (len / 2 + 0.7), 0.12, 0.3, 0.12, 0x8a2a1a); LMP.box(tx + fx * (len / 2 + 0.7), Y + 0.72, tz - fz * (len / 2 + 0.7), 0.1, 0.14, 0.1, 0xffd890);
        addBox(tx - (rot ? len / 2 : w / 2), Y, tz - (rot ? w / 2 : len / 2), tx + (rot ? len / 2 : w / 2), Y + 1.8, tz + (rot ? w / 2 : len / 2)); }
      // dormitorio: cobertizo de chapa sobre las camas
      { const dx = C.x - 14.75, dz = C.z - 2; for (const a of [-1, 1]) for (const b of [-1, 1]) post(dx + a * 3.1, dz + b * 1.9, b > 0 ? 2.9 : 2.4);
        rbox(MET, dx, Y + 2.72, dz, 6.9, 0.07, 4.6, 0x8a8478, -0.13, 0, 0); rbox(MET, dx + 1.2, Y + 2.78, dz + 0.4, 2.2, 0.05, 3.0, 0x9a5a3a, -0.13, 0.1, 0);
        for (let k = 0; k < 6; k++) WOD.box(dx, Y + 0.3 + k * 0.42, dz + 1.95, 6.2, 0.36, 0.06, k % 2 ? 0xa88a62 : 0x98794f); addBox(dx - 3.1, Y, dz + 1.85, dx + 3.1, Y + 2.6, dz + 2.05);
        WOD.box(dx - 2.6, Y + 0.3, dz + 1.3, 0.7, 0.6, 0.6, 0xb8834a); WOD.box(dx + 2.7, Y + 0.25, dz + 1.3, 0.5, 0.5, 0.5, 0x8a6a4a); LMP.box(dx, Y + 2.35, dz + 1.7, 0.16, 0.2, 0.16, 0xffd890); }
      // taller: toldo de lona azul sobre el banco de trabajo
      { const wx = C.x + 7, wz = C.z + 6; for (const a of [-1, 1]) for (const b of [-1, 1]) post(wx + a * 2.3, wz + b * 1.7, b > 0 ? 2.7 : 2.3, 0x5a5a60, 0.1);
        rbox(SOL, wx, Y + 2.55, wz, 5.2, 0.05, 4.0, 0x2a5a8a, -0.11, 0, 0); MET.box(wx + 1.9, Y + 0.45, wz + 1.2, 0.5, 0.9, 0.5, 0x8a2a2a); MET.box(wx - 1.9, Y + 0.3, wz + 1.3, 0.8, 0.6, 0.5, 0x4a5a3a);
        for (let k = 0; k < 4; k++) rbox(MET, wx - 2.6 - k * 0.07, Y + 0.34, wz - 0.3 + k * 0.02, 0.2, 0.66, 0.66, 0x1a1a1c, 0, 0, Math.PI / 2, geoCyl); LMP.box(wx, Y + 2.25, wz, 0.16, 0.2, 0.16, 0xffd890); }
      // troncos para sentarse junto al fuego y olla
      for (const [a, r] of [[0.3, 1.9], [1.9, 2.0], [3.5, 1.9], [5.0, 2.0]]) { const lx = C.x - 3 + Math.cos(a) * r, lz = C.z - 5 + Math.sin(a) * r; rbox(BRKT, lx, Y + 0.2, lz, 0.2, 1.5, 0.2, 0xffffff, 0, -a, Math.PI / 2, geoCyl); }
      for (const a of [0, 2.1, 4.2]) rbox(MET, C.x - 3 + Math.cos(a) * 0.45, Y + 0.75, C.z - 5 + Math.sin(a) * 0.45, 0.03, 1.6, 0.03, 0x2a2a2e, Math.sin(a) * 0.28, 0, -Math.cos(a) * 0.28);
      rbox(MET, C.x - 3, Y + 0.85, C.z - 5, 0.22, 0.26, 0.22, 0x1c1c20, 0, 0, 0, geoCyl);
      // depósito de agua elevado
      { const tx = C.x + 18.5, tz = C.z - 13; for (const a of [-1, 1]) for (const b of [-1, 1]) post(tx + a * 1.1, tz + b * 1.1, 3.4, 0x5a4632, 0.18); WOD.box(tx, Y + 3.45, tz, 2.8, 0.14, 2.8, 0x98794f);
        rbox(MET, tx, Y + 4.5, tz, 1.25, 2.0, 1.25, 0x5a7a8a, 0, 0, 0, geoCyl); rbox(MET, tx, Y + 5.55, tz, 1.32, 0.1, 1.32, 0x3a4a52, 0, 0, 0, geoCyl); for (const y of [3.9, 5.0]) rbox(MET, tx, Y + y, tz, 1.28, 0.08, 1.28, 0x3a3a40, 0, 0, 0, geoCyl);
        for (let k = 0; k < 7; k++) WOD.box(tx - 1.25, Y + 0.3 + k * 0.48, tz + 1.2, 0.5, 0.05, 0.05, 0x8a6a4a); MET.box(tx + 0.9, Y + 1.7, tz + 1.3, 0.07, 3.4, 0.07, 0x3a5a6a); }
      // huerto ampliado con vallita
      { const gx = C.x - 5.5, gz = C.z + 4.6; for (let r = 0; r < 3; r++) { SOL.box(gx, Y + 0.09, gz + r * 0.9, 6.4, 0.12, 0.55, 0x3a2a1c); for (let k = 0; k < 11; k++) { m4.compose(ps.set(gx - 2.9 + k * 0.58 + R(-0.05, 0.05), Y + 0.26, gz + r * 0.9), q.setFromEuler(_e.set(0, R(0, 3), 0)), sc.set(0.16, R(0.14, 0.26), 0.16)); SOL.geo(geoSph, m4, pick([0x3a8a2a, 0x4a9a3a, 0x2a6a22, 0x6a9a2a])); } }
        for (let k = 0; k <= 14; k++) { WOD.box(gx - 3.5 + k * 0.5, Y + 0.4, gz + 2.5, 0.08, 0.8, 0.04, 0xc8b898); if (k % 7 === 0) WOD.box(gx - 3.5 + k * 0.5, Y + 0.45, gz + 2.5, 0.1, 0.9, 0.1, 0x8a6a4a); } WOD.box(gx, Y + 0.6, gz + 2.5, 7.1, 0.06, 0.05, 0xb8a888); WOD.box(gx, Y + 0.25, gz + 2.5, 7.1, 0.06, 0.05, 0xb8a888);
        rbox(WOD, gx + 3.9, Y + 0.55, gz + 1, 0.04, 1.1, 0.04, 0x8a6a4a, 0, 0, 0.2); MET.box(gx + 3.6, Y + 0.18, gz - 0.2, 0.3, 0.36, 0.3, 0x5a7a8a); }
      // tendedero
      { const lx0 = C.x - 20.5, lx1 = C.x - 11, lz = C.z + 4.6; post(lx0, lz, 2.1, 0x8a6a4a, 0.09); post(lx1, lz, 2.1, 0x8a6a4a, 0.09); FLAT.box((lx0 + lx1) / 2, Y + 2.0, lz, lx1 - lx0, 0.02, 0.02, 0xd8d0c0);
        for (let k = 0; k < 8; k++) { const h = R(0.5, 0.95); FLAT.box(lx0 + 0.9 + k * 1.05, Y + 2.0 - h / 2, lz, R(0.5, 0.8), h, 0.03, pick([0xc8c0b0, 0x8a3a3a, 0x3a5a7a, 0x5a7a4a, 0xd8c890, 0x4a4a52])); } }
      // almacén: cajas apiladas, palés, neumáticos, leña y bidones
      for (const [bx, bz, n] of [[X0 + 3.2, C.z + 3, 3], [X0 + 4.5, C.z + 3.3, 2], [X0 + 3.4, C.z + 4.6, 2], [X1 - 3, C.z + 5, 3], [X1 - 4.3, C.z + 5.4, 1]]) { for (let k = 0; k < n; k++) rbox(WOD, bx + R(-0.06, 0.06), Y + 0.42 + k * 0.84, bz + R(-0.06, 0.06), 0.84, 0.82, 0.84, pick([0xb8834a, 0xa87840, 0x98794f, 0x5a6a3a]), 0, R(-0.15, 0.15), 0); addBox(bx - 0.45, Y, bz - 0.45, bx + 0.45, Y + n * 0.84, bz + 0.45); }
      for (const [bx, bz, n] of [[X1 - 3.2, C.z + 0.5, 4], [X1 - 4.5, C.z + 0.2, 3], [X0 + 6, Z0 + 3, 3]]) { for (let k = 0; k < n; k++) rbox(MET, bx + R(-0.05, 0.05), Y + 0.13 + k * 0.26, bz + R(-0.05, 0.05), 0.42, 0.25, 0.42, 0x18181a, 0, 0, 0, geoCyl); addCircle(bx, bz, 0.45, Y, Y + n * 0.26); }
      for (let r = 0; r < 4; r++) for (let k = 0; k < 7 - r; k++) rbox(BRKT, X0 + 9 + k * 0.3 + r * 0.15, Y + 0.14 + r * 0.26, Z1 - 2.2, 0.14, 1.3, 0.14, 0xffffff, Math.PI / 2, 0, 0, geoCyl); addBox(X0 + 8.8, Y, Z1 - 2.9, X0 + 11.2, Y + 1.1, Z1 - 1.5);
      for (const [bx, bz] of [[X1 - 6, Z1 - 2.5], [X1 - 7, Z1 - 2.3], [X1 - 6.4, Z1 - 3.3], [C.x + 3.2, Z0 + 3.4]]) { rbox(MET, bx, Y + 0.45, bz, 0.32, 0.9, 0.32, pick([0x2a5a9a, 0x8a2a2a, 0x4a5a3a, 0xc8a020]), 0, 0, 0, geoCyl); addCircle(bx, bz, 0.35, Y, Y + 0.9); }
      // furgoneta del grupo y mesa de mapas
      car(C.x + 17, C.z + 3.5, 0.25, 0x5a6a4a, 0);
      // guirnaldas de bombillas sobre la plaza central
      { const PL = [[C.x - 9, C.z - 9], [C.x + 9, C.z - 9], [C.x + 9, C.z + 8], [C.x - 9, C.z + 8]]; for (const [px, pz] of PL) post(px, pz, 4.2, 0x4a3a2a, 0.11);
        const run = (ax, az, bx, bz) => { const n = Math.round(Math.hypot(bx - ax, bz - az) / 1.3); for (let k = 1; k < n; k++) { const t = k / n, sag = Math.sin(t * Math.PI) * 0.7, x = ax + (bx - ax) * t, z = az + (bz - az) * t; LMP.box(x, Y + 4.1 - sag, z, 0.15, 0.19, 0.15, pick([0xffe0a0, 0xffd080, 0xfff0c8])); FLAT.box(x, Y + 4.19 - sag, z, 0.03, 0.06, 0.03, 0x1a1a1a); } };
        for (let k = 0; k < 4; k++) run(PL[k][0], PL[k][1], PL[(k + 1) % 4][0], PL[(k + 1) % 4][1]); run(PL[0][0], PL[0][1], C.x, C.z); run(PL[1][0], PL[1][1], C.x, C.z); run(PL[2][0], PL[2][1], C.x, C.z); run(PL[3][0], PL[3][1], C.x, C.z); }
      // arco de entrada con rótulo y estandartes
      { const gx0 = C.x - gw / 2 - 0.35, gx1 = C.x + gw / 2 + 0.35; for (const gx of [gx0, gx1]) { WOD.box(gx, Y + 2.4, Z0, 0.4, 4.8, 0.4, 0x5a4632); FLAT.box(gx, Y + 3.3, Z0 - 0.23, 0.5, 1.5, 0.03, 0x9a1c22); FLAT.box(gx, Y + 3.3, Z0 - 0.25, 0.22, 0.22, 0.02, 0xe8d8a0); MET.box(gx, Y + 4.9, Z0, 0.1, 0.5, 0.1, 0x3a3a40); LMP.box(gx, Y + 5.2, Z0, 0.3, 0.24, 0.3, 0xfff0c0); }
        WOD.box(C.x, Y + 4.45, Z0, gw + 1.2, 0.3, 0.34, 0x6a5238); WOD.box(C.x, Y + 3.9, Z0, gw + 0.4, 0.9, 0.1, 0x3a2a1c);
        for (const s2 of [-1, 1]) { const sm = signMesh('LA ORDEN', '#2a1c12', '#ffb43a', 4.3); sm.position.set(C.x, Y + 3.9, Z0 + s2 * 0.07); sm.rotation.y = s2 < 0 ? Math.PI : 0; scene.add(sm); } }
      // ametralladoras montadas en las torres (se usan subiendo por la escalera)
      for (const t of CITY.campSpot.towers) { const sx = t.x < C.x ? -1 : 1, sz = t.z < C.z ? -1 : 1, ang = Math.atan2(sx, sz); const gxm = t.x + sx * 0.75, gzm = t.z + sz * 0.75;
        rbx(MET, gxm, Y + 5.0, gzm, 0.06, 1.1, 0.06, 0x2a2a2e); rbx(MET, gxm, Y + 5.56, gzm, 0.14, 0.16, 0.7, 0x1c1e22, -0.12, ang, 0); rbx(MET, gxm + Math.sin(ang) * 0.75, Y + 5.65, gzm + Math.cos(ang) * 0.75, 0.035, 0.035, 0.9, 0x101114, -0.12, ang, 0, geoCyl.clone().rotateX(Math.PI / 2));
        rbx(MET, gxm - Math.cos(ang) * 0.2, Y + 5.48, gzm + Math.sin(ang) * 0.2, 0.22, 0.2, 0.3, 0x4a5a3a, 0, ang, 0);
        WOD.box(t.lx, Y + 0.06, t.lz, 0.9, 0.1, 0.9, 0xb89a70); FLAT.box(t.lx, Y + 1.5, t.lz + 0.62, 0.5, 0.3, 0.03, 0xd8c020); }
      // estandartes en las torres y focos
      for (const [tx, tz] of [[X0 + 1.5, Z0 + 1.5], [X1 - 1.5, Z0 + 1.5], [X0 + 1.5, Z1 - 1.5], [X1 - 1.5, Z1 - 1.5]]) { const sx = tx < C.x ? -1 : 1, sz = tz < C.z ? -1 : 1; FLAT.box(tx + sx * 1.33, Y + 3.6, tz, 0.03, 1.5, 0.9, 0x9a1c22); FLAT.box(tx, Y + 3.6, tz + sz * 1.33, 0.9, 1.5, 0.03, 0x9a1c22); MET.box(tx, Y + 6.6, tz, 0.06, 1.2, 0.06, 0x3a3a40); FLAT.box(tx + 0.3, Y + 7.0, tz, 0.6, 0.36, 0.02, 0x9a1c22); LMP.box(tx - sx * 1.1, Y + 5.75, tz - sz * 1.1, 0.3, 0.2, 0.3, 0xfff6d8); for (let k = 0; k < 5; k++) { m4.compose(ps.set(tx + sx * (0.6 - k * 0.3), Y + 4.62, tz + sz * 1.05), q.identity(), sc.set(0.3, 0.14, 0.2)); SOL.geo(geoSph, m4, 0xa8946a); } }
      // estacas afiladas por fuera del muro y chatarra de refuerzo
      { const stake = (x, z, ax, az) => rbox(WOD, x + ax * 0.75, Y + 0.6, z + az * 0.75, 0.11, 1.9, 0.11, pick([0x6a4a32, 0x7a5a3a, 0x5a4028]), az * 0.85, 0, -ax * 0.85);
        for (let x = X0 + 0.6; x < X1; x += 1.15) { stake(x, Z1, 0, 1); if (Math.abs(x - C.x) > gw / 2 + 2.5) stake(x, Z0, 0, -1); } for (let z = Z0 + 0.6; z < Z1; z += 1.15) { stake(X0, z, -1, 0); stake(X1, z, 1, 0); }
        for (let k = 0; k < 26; k++) { const side = RI(0, 3), u = R(0.05, 0.95), x = side < 2 ? X0 + (X1 - X0) * u : side === 2 ? X0 : X1, z = side < 2 ? (side ? Z1 : Z0) : Z0 + (Z1 - Z0) * u; if (side === 0 && Math.abs(x - C.x) < gw / 2 + 1.2) continue; const ax = side < 2; MET.box(x + (ax ? 0 : (side === 2 ? -0.09 : 0.09)), Y + R(1.4, 2.5), z + (ax ? (side ? 0.09 : -0.09) : 0), ax ? R(1, 2.2) : 0.05, R(0.6, 1.3), ax ? 0.05 : R(1, 2.2), pick([0x7a3a2a, 0x4a5a6a, 0x8a8a4a, 0x5a5a5e, 0x9a6a3a])); } }
      // carteles de aviso en el camino
      for (const sx of [-3.4, 3.4]) { WOD.box(C.x + sx, Y + 0.9, Z0 - 7, 0.08, 1.8, 0.08, 0x6a4a32); FLAT.box(C.x + sx, Y + 1.5, Z0 - 7.06, 1.0, 0.6, 0.04, sx < 0 ? 0xd8c020 : 0xe8e0d0); FLAT.box(C.x + sx, Y + 1.5, Z0 - 7.09, 0.7, 0.12, 0.02, 0x1a1a1a); }
      for (let k = -4; k <= 4; k++) for (let st = 0; st < 2; st++) { m4.compose(ps.set(C.x + k * 0.62 + (st % 2) * 0.3, Y + 0.16 + st * 0.27, Z0 + 3.2), q.identity(), sc.set(0.34, 0.15, 0.24)); if (Math.abs(k) > 1) SOL.geo(geoSph, m4, 0xa8946a); }
      for (const [bx, bz] of [[X1 - 4, C.z - 6], [X1 - 4.8, C.z - 5.3], [X0 + 4, C.z - 8]]) { m4.compose(ps.set(bx, Y + 0.45, bz), q.identity(), sc.set(0.32, 0.9, 0.32)); MET.geo(geoCyl, m4, pick([0x2a5a9a, 0x8a2a2a, 0x4a5a3a])); addCircle(bx, bz, 0.35, Y, Y + 0.9); }
      for (const [fx, fz] of [[X0 + 3, Z1 - 3], [X1 - 3, Z1 - 3]]) { MET.box(fx, Y + 2, fz, 0.1, 4, 0.1, 0x3a3a40); LMP.box(fx, Y + 4, fz, 0.6, 0.3, 0.3, 0xfff0c0); }
      WOD.box(C.x + 8, Y + 0.75, C.z - 2, 1.8, 0.06, 0.8, 0xb08050); for (const s2 of [-1, 1]) WOD.box(C.x + 8, Y + 0.45, C.z - 2 + s2 * 0.75, 1.8, 0.05, 0.3, 0xb08050);
      CITY.conts.push({ kind: 'crate', name: 'Caja de suministros', loot: 'crate', pos: new THREE.Vector3(X0 + 3.5, Y, C.z), room: null }); WOD.box(X0 + 2.6, Y + 0.4, C.z, 1.0, 0.8, 0.8, 0xb8834a); addBox(X0 + 2.1, Y, C.z - 0.4, X0 + 3.1, Y + 0.8, C.z + 0.4);
      CITY.labels.push({ name: 'Campamento', x: C.x, z: Z1 + 6, place: true, town: true });
      useArea('city'); }
  }
  // ---------- detalles de los pueblos y carreteras ----------
  for (const tw of CITY.towns) {
    const { T, xs, zs, xw, zw, X0, X1, Z0, Z1 } = tw; useArea(T.name);
    for (let i = 0; i < xs.length; i++) for (let z = Z0 + 6; z < Z1 - 4; z += 26) { if (zs.some(zz => Math.abs(z - zz) < 8)) continue; const x = xs[i] + (xw[i] / 2 + 0.6); SOL.box(x, Y + 2.6, z, 0.12, 5.2, 0.12, 0x3a3a40); SOL.box(x - 0.5, Y + 5.15, z, 1.0, 0.08, 0.1, 0x3a3a40); LMP.box(x - 0.95, Y + 5.05, z, 0.45, 0.12, 0.3, 0xfff0c0); addCircle(x, z, 0.12, Y, Y + 5); }
    for (let k = 0; k < (T.n >= 2 ? 14 : 8); k++) { const along = rand() < 0.5; const x = along ? pick(xs) + R(-3, 3) : R(X0 + 6, X1 - 6), z = along ? R(Z0 + 6, Z1 - 6) : pick(zs) + R(-3, 3); if (xs.some(a => Math.abs(x - a) < 6) && zs.some(b => Math.abs(z - b) < 6)) continue; const r = rand(), ang = along ? R(-0.3, 0.3) + (rand() < 0.5 ? Math.PI : 0) : Math.PI / 2 + R(-0.3, 0.3); if (r >= 0.5 && rand() < 0.6) (CITY.carSpots = CITY.carSpots || []).push([x, z, ang]); else car(x, z, ang, pick(CARC), r < 0.4 ? 1 : r < 0.5 ? 2 : 0); }
    for (let k = 0; k < 160; k++) { const along = rand() < 0.5; CITY.streetPts.push(along ? [pick(xs) + R(-3, 3), R(Z0, Z1)] : [R(X0, X1), pick(zs) + R(-3, 3)]); }
    for (let k = 0; k < 220; k++) { const along = rand() < 0.5, x = along ? pick(xs) + R(-5, 5) : R(X0, X1), z = along ? R(Z0, Z1) : pick(zs) + R(-5, 5), r = rand(); if (r < 0.5) DEC.box(x, Y + 0.075, z, R(0.12, 0.3), 0.01, R(0.08, 0.22), pick([0xa8782a, 0xc8a040, 0x8a5a24])); else if (r < 0.75) DEC.box(x, Y + 0.08, z, R(0.2, 0.35), 0.008, R(0.25, 0.4), 0xe8e0c8); else { const sz = R(0.4, 1.3); m4.compose(ps.set(x, Y + 0.062, z), q.setFromEuler(_e.set(0, rand() * 6, 0)), sc.set(sz, 0.004, sz * R(0.5, 1))); DEC.geo(geoCyl, m4, 0x2a0604); } }
    for (let k = 0; k < 30; k++) { const along = rand() < 0.5, x = along ? pick(xs) + (rand() < 0.5 ? -1 : 1) * 6.2 : R(X0, X1), z = along ? R(Z0, Z1) : pick(zs) + (rand() < 0.5 ? -1 : 1) * 6.2; const n = RI(2, 5); for (let m = 0; m < n; m++) { const sz = R(0.3, 0.45); m4.compose(ps.set(x + R(-0.6, 0.6), Y + sz * 0.55, z + R(-0.6, 0.6)), q.setFromEuler(_e.set(0, R(0, 6), 0)), sc.set(sz, sz * 0.8, sz * 1.1)); SOL.geo(geoSph, m4, pick([0x18181c, 0x22222a, 0x2a3a2a])); } }
  }
  // carreteras entre pueblos
  useArea('road');
  // ---------- bases de otras bandas ----------
  CITY.gangSpots = {};
  { useArea('road'); const geoPr = new THREE.CylinderGeometry(1, 1, 1, 3); geoPr.rotateX(Math.PI / 2); geoPr.rotateZ(Math.PI);
    const THEME = { buitres: { c: 0x8a2a1a, c2: 0x3a3a3e, fg: '#ff5a3a', bg: '#1a1210' }, guardia: { c: 0x2a4a7a, c2: 0x4a5a6a, fg: '#e8f0ff', bg: '#14202e' }, germandat: { c: 0x6a2a7a, c2: 0x5a4a3a, fg: '#f0d890', bg: '#1e1422' }, mercaders: { c: 0xc8922a, c2: 0x6a5a3a, fg: '#ffe9a0', bg: '#2a2010' } };
    for (const G of POIS.filter(p => p.type === 'gang')) {
      const th = THEME[G.gang], [gx, gz] = G.gd, W = 40, D = 34, H = 3.2, gw = 5, fx = -gx, fz = -gz, rx = -fz, rz = fx, ox = G.x + gx * D / 2, oz = G.z + gz * D / 2, alongX = gz !== 0, ry0 = Math.atan2(gx, gz);
      const L = (lx, lz) => [ox + rx * lx + fx * lz, oz + rz * lx + fz * lz];
      const lb = (M, lx, y, lz, w, h, d, col) => { const [x, z] = L(lx, lz); M.box(x, Y + y, z, alongX ? w : d, h, alongX ? d : w, col); };
      const lcol = (lx, lz, w, d, h) => { const [x, z] = L(lx, lz), hw = (alongX ? w : d) / 2, hd = (alongX ? d : w) / 2; addBox(x - hw, Y, z - hd, x + hw, Y + h, z + hd); };
      const lr = (M, lx, y, lz, w, h, d, col, rxx = 0, ryy = 0, rzz = 0, geo) => { const [x, z] = L(lx, lz); rbx(M, x, Y + y, z, w, h, d, col, rxx, ry0 + ryy, rzz, geo); };
      lb(SOL, 0, 0.02, D / 2, W, 0.04, D, 0x857a6a); lb(ASM, 0, 0.035, -4.5, 6, 0.04, 9, 0xffffff); lb(DEC, 0, 0.06, D / 2 - 3, 3.2, 0.01, D - 8, 0x6e6252);
      const wallSeg = (ax, az, bx, bz) => { const len = Math.hypot(bx - ax, bz - az), n = Math.round(len / 2), ux = (bx - ax) / len, uz = (bz - az) / len, lat = ux !== 0, w = len / n;
        for (let k = 0; k < n; k++) { const t = (k + 0.5) * w, lx = ax + ux * t, lz = az + uz * t; lb(STN, lx, 0.5, lz, lat ? w - 0.04 : 0.6, 1.0, lat ? 0.6 : w - 0.04, 0xb8b4a8); lb(MET, lx, 1.0 + (H - 1) / 2, lz, lat ? w : 0.07, H - 1, lat ? 0.07 : w, rand() < 0.3 ? th.c : pick([0x8a8c92, 0x9a7a5a, 0x6a6e74, th.c2])); if (k % 2 === 0) lb(WOD, lx - ux * w / 2, H / 2 + 0.2, lz - uz * w / 2, 0.2, H + 0.4, 0.2, 0x5a4632); if (rand() < 0.6) lb(MET, lx, H + 0.3, lz, lat ? w : 0.05, 0.05, lat ? 0.05 : w, 0x5a5a62); }
        lcol((ax + bx) / 2, (az + bz) / 2, lat ? len : 0.8, lat ? 0.8 : len, H + 0.5); };
      wallSeg(-W / 2, 0, -gw / 2, 0); wallSeg(gw / 2, 0, W / 2, 0); wallSeg(-W / 2, D, W / 2, D); wallSeg(-W / 2, 0, -W / 2, D); wallSeg(W / 2, 0, W / 2, D);
      // arco con rótulo y banderas
      for (const sx of [-1, 1]) { lb(WOD, sx * (gw / 2 + 0.3), 2.5, 0, 0.45, 5.0, 0.45, 0x4a3a2a); lb(FLAT, sx * (gw / 2 + 0.3), 3.4, -0.26, 0.55, 1.6, 0.03, th.c); lb(LMP, sx * (gw / 2 + 0.3), 5.15, 0, 0.3, 0.24, 0.3, 0xffe8b0); }
      lb(WOD, 0, 4.7, 0, gw + 1.4, 0.3, 0.36, 0x5a4632); lb(WOD, 0, 4.1, 0, gw + 0.6, 1.0, 0.1, 0x2a2018);
      for (const s2 of [-1, 1]) { const sm = signMesh(G.name.toUpperCase(), th.bg, th.fg, gw + 0.2); const [sx2, sz2] = L(0, s2 * 0.08); sm.position.set(sx2, Y + 4.1, sz2); sm.rotation.y = ry0 + (s2 > 0 ? Math.PI : 0); scene.add(sm); }
      // torres de las esquinas delanteras
      for (const sx of [-1, 1]) { const tx = sx * (W / 2 - 2), tz = 2; for (const a of [-1, 1]) for (const b of [-1, 1]) lb(WOD, tx + a * 1.1, 2.5, tz + b * 1.1, 0.16, 5.0, 0.16, 0x5a4632); lb(WOD, tx, 4.3, tz, 2.6, 0.12, 2.6, 0xa07a50); for (const a of [-1, 1]) { lb(MET, tx + a * 1.25, 4.85, tz, 0.07, 1.0, 2.5, th.c2); lb(MET, tx, 4.85, tz + a * 1.25, 2.5, 1.0, 0.07, a < 0 ? th.c : th.c2); } lb(MET, tx, 5.95, tz, 3.0, 0.08, 3.0, 0x4a4a52); lb(FLAT, tx, 6.8, tz, 0.05, 1.6, 0.05, 0x2a2a2e); lb(FLAT, tx + 0.35, 7.3, tz, 0.7, 0.45, 0.03, th.c); lcol(tx, tz, 2.4, 2.4, 2); }
      // barracón al fondo
      { const hz = D - 5; lb(WOD, 0, 1.8, hz, 14, 3.6, 6.5, 0x7a6248); for (let k = 0; k < 7; k++) lb(WOD, -6 + k * 2, 1.8, hz - 3.27, 0.12, 3.6, 0.06, 0x5a4632); lb(MET, 0, 3.72, hz, 14.8, 0.14, 7.4, 0x6a6e74); lb(MET, 2, 3.8, hz - 1, 5, 0.1, 3, 0x8a5a3a); lb(WOD, 0, 1.1, hz - 3.28, 1.3, 2.2, 0.08, 0x2a2018); for (const sx of [-4.2, 4.2]) { lb(LMP, sx, 2.0, hz - 3.28, 1.3, 0.9, 0.06, 0xffd890); lb(WOD, sx, 2.0, hz - 3.3, 0.08, 0.9, 0.08, 0x3a2a1c); } lb(FLAT, 0, 3.0, hz - 3.3, 3.2, 0.9, 0.04, th.c); lcol(0, hz, 14, 6.5, 3.6); }
      // tiendas, hoguera, cajas y bidones
      for (const [tx, tz] of [[-13, 11], [-13, 19], [13, 20]]) { lr(SOL, tx, 0.63, tz, 2.9 / 1.732, 1.9 / 1.5, 3.8, pick([0x55663a, 0x6a5238, th.c2]), 0, 0, 0, geoPr); lr(SOL, tx, 0.61, tz, 2.9 / 1.732 * 0.72, 1.9 / 1.5 * 0.72, 3.86, 0x14140f, 0, 0, 0, geoPr); lcol(tx, tz, 2.9, 3.8, 1.8); }
      { const [cx, cz] = L(0, 14); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; rbx(STN, cx + Math.cos(a) * 0.7, Y + 0.12, cz + Math.sin(a) * 0.7, 0.2, 0.2, 0.2, 0x8a8478, 0, a, 0, geoSph); } rbx(LMP, cx, Y + 0.35, cz, 0.3, 0.6, 0.3, 0xff9a2a, 0, 0.6, 0); rbx(LMP, cx + 0.1, Y + 0.3, cz - 0.1, 0.2, 0.4, 0.2, 0xffd040, 0, 0.2, 0); for (const a of [0.4, 2.2, 4.1]) rbx(BRKT, cx + Math.cos(a) * 1.8, Y + 0.2, cz + Math.sin(a) * 1.8, 0.2, 1.5, 0.2, 0xffffff, 0, -a, Math.PI / 2, geoCyl); addCircle(cx, cz, 0.7, Y, Y + 0.5); }
      for (let k = 0; k < 9; k++) { const lx = pick([-1, 1]) * R(15, 18), lz = R(6, D - 9), [x, z] = L(lx, lz), n = RI(1, 3); if (rand() < 0.6) { for (let j = 0; j < n; j++) rbx(WOD, x, Y + 0.42 + j * 0.84, z, 0.84, 0.82, 0.84, pick([0xb8834a, 0xa87840, 0x5a6a3a, th.c]), 0, R(-0.2, 0.2), 0); addBox(x - 0.45, Y, z - 0.45, x + 0.45, Y + n * 0.84, z + 0.45); } else { rbx(MET, x, Y + 0.45, z, 0.32, 0.9, 0.32, pick([0x2a5a9a, 0x8a2a2a, 0x4a5a3a, th.c]), 0, 0, 0, geoCyl); addCircle(x, z, 0.35, Y, Y + 0.9); } }
      // detalles propios de cada banda
      if (G.gang === 'buitres') { for (const [lx, lz, a] of [[10, 8, 0.4], [-8, 26, 1.2], [9, 12.5, 2.0]]) { const [x, z] = L(lx, lz); car(x, z, a, pick([0x4a4a4a, 0x6a3a2a, 0x3a4a5a]), 2); } for (const [lx, lz] of [[6, 5], [-6, 6], [16, 26]]) { const [x, z] = L(lx, lz); for (let j = 0; j < 4; j++) rbx(MET, x, Y + 0.13 + j * 0.26, z, 0.42, 0.25, 0.42, 0x18181a, 0, 0, 0, geoCyl); addCircle(x, z, 0.45, Y, Y + 1); } for (let k = -3; k <= 3; k++) lr(WOD, k * 1.2 + (k >= 0 ? 4 : -4), 0.6, -2.2, 0.12, 1.9, 0.12, 0x5a4028, -0.8, 0, 0); }
      if (G.gang === 'guardia') { for (const [lx, lz] of [[-5.5, -4], [5.5, -4], [0, -9]]) { for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) { const [x, z] = L(lx - 1.1 + k * 0.72 + r * 0.36, lz); rbx(SOL, x, Y + 0.14 + r * 0.24, z, 0.38, 0.14, 0.25, 0xa8946a, 0, alongX ? 0 : Math.PI / 2, 0, geoSph); } lcol(lx, lz, 3, 0.6, 0.8); } for (const sx of [-10, 10]) { lb(MET, sx, 3, 9, 0.12, 6, 0.12, 0x3a3a40); lb(LMP, sx, 6.1, 9, 0.7, 0.3, 0.4, 0xf4f8ff); } }
      if (G.gang === 'germandat') { for (const sx of [-2.6, 2.6]) for (let lz = 4; lz < D - 10; lz += 4.5) { lb(WOD, sx, 0.9, lz, 0.1, 1.8, 0.1, 0x3a2a1c); lb(LMP, sx, 1.9, lz, 0.18, 0.28, 0.18, 0xff9a2a); } lb(FLAT, 0, 2.2, D - 8.32, 0.5, 2.6, 0.03, 0xf0d890); for (const sx of [-6.5, 6.5]) lb(FLAT, sx, 2.0, D - 8.32, 1.2, 2.8, 0.03, th.c); }
      if (G.gang === 'mercaders') { for (const [lx, lz] of [[-8, 7], [8, 7], [-8, 14.5], [8, 14.5]]) { const aw = pick([0xb84a3a, 0x3a6a9a, 0x4a8a4a, 0xc8a83a]); lb(WOD, lx, 0.9, lz, 3.4, 0.1, 1.4, 0xa88a62); for (const a of [-1.6, 1.6]) for (const b of [-0.6, 0.6]) lb(WOD, lx + a, 1.15, lz + b, 0.08, 2.3, 0.08, 0x6a4a32); for (let k = 0; k < 6; k++) lb(SOL, lx - 1.45 + k * 0.58, 2.35, lz, 0.56, 0.06, 1.9, k % 2 ? aw : 0xe8e0d0); for (let k = 0; k < 6; k++) { const [x, z] = L(lx - 1.3 + k * 0.5, lz + R(-0.3, 0.3)); rbx(SOL, x, Y + 1.05, z, 0.13, 0.11, 0.13, pick([0xc83a2a, 0xe8a020, 0x4a9a3a, 0xd8c890]), 0, 0, 0, geoSph); } lcol(lx, lz, 3.4, 1.4, 1); } }
      // poste de parlamento en el camino, fuera del alcance de los guardias
      { const [px, pz] = L(4.3, -26); WOD.box(px, Y + 1.6, pz, 0.14, 3.2, 0.14, 0x5a4632); FLAT.box(px, Y + 2.75, pz, alongX ? 0.9 : 0.03, 0.6, alongX ? 0.03 : 0.9, th.c); WOD.box(px, Y + 1.5, pz, alongX ? 1.3 : 0.06, 0.8, alongX ? 0.06 : 1.3, 0xd8d0b8); MET.box(px, Y + 0.95, pz, 0.3, 0.2, 0.3, 0x2a2a2e); LMP.box(px, Y + 1.08, pz, 0.06, 0.06, 0.06, 0x5aff6a); addCircle(px, pz, 0.2, Y, Y + 3); }
      const cs = [L(-W / 2, 0), L(W / 2, D)];
      CITY.gangSpots[G.gang] = { id: G.gang, name: G.name, x: G.x, z: G.z, X0: Math.min(cs[0][0], cs[1][0]), X1: Math.max(cs[0][0], cs[1][0]), Z0: Math.min(cs[0][1], cs[1][1]), Z1: Math.max(cs[0][1], cs[1][1]), gate: L(0, 0), out: L(0, -9), parley: L(4.3, -26), far: L(0, -40), stash: L(4.5, D - 9.6),
        spots: [L(0, D - 9.8), L(-3.3, 2.6), L(3.3, 2.6), L(-11, 6), L(11, 6), L(-2.6, 13), L(3, 15.5), L(-9, 22), L(9, 25)] };
    }
  }
  for (const [ax, az, bx2, bz2] of ROADS) {
    const alongZ = ax === bx2, cx = (ax + bx2) / 2, cz = (az + bz2) / 2, len = alongZ ? Math.abs(bz2 - az) : Math.abs(bx2 - ax);
    ASM.box(cx, Y + 0.02, cz, alongZ ? 8 : len, 0.04, alongZ ? len : 8, 0xffffff);
    for (const s2 of [-1, 1]) { SOL.box(cx + (alongZ ? s2 * 4.8 : 0), Y + 0.015, cz + (alongZ ? 0 : s2 * 4.8), alongZ ? 1.6 : len, 0.03, alongZ ? len : 1.6, 0x6a6050); FLAT.box(cx + (alongZ ? s2 * 3.7 : 0), Y + 0.045, cz + (alongZ ? 0 : s2 * 3.7), alongZ ? 0.15 : len, 0.02, alongZ ? len : 0.15, LINE); }
    for (let t = 3; t < len; t += 8) FLAT.box(alongZ ? ax : Math.min(ax, bx2) + t, Y + 0.045, alongZ ? Math.min(az, bz2) + t : az, alongZ ? 0.15 : 3, 0.02, alongZ ? 3 : 0.15, LINE);
    for (let t = 10; t < len - 6; t += 18) { if (rand() < 0.35) continue; for (const s2 of [-1, 1]) { const px = alongZ ? ax + s2 * 5.6 : Math.min(ax, bx2) + t, pz = alongZ ? Math.min(az, bz2) + t : az + s2 * 5.6; MET.box(px, Y + 0.6, pz, alongZ ? 0.08 : 4.2, 0.22, alongZ ? 4.2 : 0.08, 0xb8bcc2); MET.box(px, Y + 0.35, pz, 0.1, 0.7, 0.1, 0x8a8c92); } }
    for (let k = 0; k < Math.floor(len / 45); k++) { const t = R(10, len - 10), x = alongZ ? ax + R(-2.5, 2.5) : Math.min(ax, bx2) + t, z = alongZ ? Math.min(az, bz2) + t : az + R(-2.5, 2.5), r = rand(); car(x, z, (alongZ ? 0 : Math.PI / 2) + R(-0.6, 0.6), pick(CARC), r < 0.45 ? 1 : r < 0.6 ? 2 : 0); }
    for (let k = 0; k < len / 6; k++) { const t = R(0, len); CITY.streetPts.push(alongZ ? [ax + R(-3, 3), Math.min(az, bz2) + t] : [Math.min(ax, bx2) + t, az + R(-3, 3)]); }
    const sx = alongZ ? ax + 6.5 : Math.min(ax, bx2) + 12, sz2 = alongZ ? Math.min(az, bz2) + 12 : az + 6.5; MET.box(sx, Y + 1.2, sz2, 0.08, 2.4, 0.08, 0x8a8c92);
  }
  // ---------- ciudad abandonada: vegetación invasora, banderines, vehículos grandes y trastos ----------
  { useArea('city'); const geoLeaf = new THREE.IcosahedronGeometry(1, 0); const GRN = [0x2f5a22, 0x3a6a2a, 0x24481c, 0x4a7a30, 0x567a2a, 0x6a6a2a];
    // hiedra que trepa por las fachadas
    for (const sg of segs) { if (sg.town || (sg.room && sg.room.name) || rand() > 0.42) continue; const n = RI(1, 2);
      for (let c = 0; c < n; c++) { const u0 = R(-sg.w / 2 + 1, sg.w / 2 - 1), top = R(2.5, Math.min(sg.H - 0.5, 11)), wd = R(1.2, 3.2);
        for (let k = 0; k < 15; k++) { const t = Math.pow(rand(), 1.4), y = t * top, sp = wd * (1 - t * 0.75), u = clamp(u0 + R(-sp, sp), -sg.w / 2 + 0.3, sg.w / 2 - 0.3), [ix, iz] = W2(sg, u, -0.04), rw = R(0.45, 0.95), ax = sg.tx !== 0; m4.compose(ps.set(ix, Y + y + 0.3, iz), q.setFromEuler(_e.set(ax ? 0 : R(0, 3), 0, ax ? R(0, 3) : 0)), sc.set(ax ? rw : 0.13, R(0.35, 0.85), ax ? 0.13 : rw)); SOL.geo(geoLeaf, m4, pick(GRN)); }
        for (let k = 0; k < 4; k++) { const [bx, bz] = W2(sg, u0 + R(-wd, wd), -R(0.3, 0.7)); m4.compose(ps.set(bx, Y + 0.3, bz), q.setFromEuler(_e.set(0, R(0, 6), 0)), sc.set(R(0.4, 0.8), R(0.3, 0.6), R(0.4, 0.8))); SOL.geo(geoLeaf, m4, pick(GRN)); } } }
    // arbustos y matojos que rompen el asfalto
    for (let k = 0; k < 110; k++) { const [x, z] = onStreet(); if (!clearOfCross(x, z, 7)) continue; const n = RI(2, 4); for (let j = 0; j < n; j++) { m4.compose(ps.set(x + R(-0.5, 0.5), Y + 0.25, z + R(-0.5, 0.5)), q.setFromEuler(_e.set(0, R(0, 6), 0)), sc.set(R(0.3, 0.6), R(0.25, 0.55), R(0.3, 0.6))); SOL.geo(geoLeaf, m4, pick(GRN)); } DEC.box(x, Y + 0.075 + (k % 9) * 0.002, z, R(1, 2), 0.01, R(1, 2), 0x3a3a30); }
    // banderines descoloridos de la fiesta mayor cruzando las calles
    const BUNT = [0xb84a3a, 0xc8a83a, 0x3a6a9a, 0x4a8a4a, 0xd8d0c0, 0xa85a8a];
    for (let i = 0; i < XS.length; i++) for (let z = L0 + 22; z < L1 - 10; z += R(34, 52)) { if (ZS.some(b => Math.abs(z - b) < 12)) continue; const hw = XW[i] / 2 + SW, yy = Y + R(6.2, 7.2); FLAT.box(XS[i], yy, z, hw * 2, 0.05, 0.05, 0x2a2a2a); for (let x = -hw + 0.5; x < hw; x += 0.62) { if (rand() < 0.25) continue; const sag = (1 - (x / hw) * (x / hw)) * 0.45; rbx(FLAT, XS[i] + x, yy - 0.2 - sag, z, 0.3, 0.3, 0.02, pick(BUNT), 0, 0, Math.PI / 4); } }
    for (let j = 0; j < ZS.length; j++) for (let x = L0 + 22; x < 140; x += R(34, 52)) { if (XS.some(b => Math.abs(x - b) < 14)) continue; const hw = ZW[j] / 2 + SW, yy = Y + R(6.2, 7.2); FLAT.box(x, yy, ZS[j], 0.05, 0.05, hw * 2, 0x2a2a2a); for (let z = -hw + 0.5; z < hw; z += 0.62) { if (rand() < 0.25) continue; const sag = (1 - (z / hw) * (z / hw)) * 0.45; rbx(FLAT, x, yy - 0.2 - sag, ZS[j] + z, 0.02, 0.3, 0.3, pick(BUNT), Math.PI / 4, 0, 0); } }
    // autobuses y camiones militares atravesados (con colisión)
    const bigV = (x, z, ang, kind) => { const base = new THREE.Matrix4().compose(ps.set(x, Y, z), q.setFromEuler(_e.set(0, ang, 0)), sc.set(1, 1, 1));
      const B = (M, ox, oy, oz, w, h, d, c, geo = geoBox, rz = 0) => { m4.compose(ps.set(ox, oy, oz), q.setFromEuler(_e.set(0, 0, rz)), sc.set(w, h, d)); m4.premultiply(base); M.geo(geo, m4, c); };
      const L = kind === 'bus' ? 11 : 7.2;
      if (kind === 'bus') { B(SOL, 0, 1.75, 0, 2.5, 2.7, L, 0xc8c4b4); B(SOL, 0, 0.95, 0, 2.54, 0.9, L + 0.02, 0xa82a22); B(SOL, 0, 3.14, 0, 2.3, 0.12, L - 0.6, 0xa8a498); for (const sx of [-1, 1]) for (let k = 0; k < 7; k++) B(SOL, sx * 1.26, 2.3, -L / 2 + 1.3 + k * 1.42, 0.04, 0.9, 1.2, rand() < 0.3 ? 0x1a1c20 : 0x3a4a56); B(SOL, 0, 2.2, -L / 2 - 0.02, 2.2, 1.2, 0.04, 0x2a3640); B(LMP, 0, 2.95, -L / 2 - 0.03, 1.4, 0.24, 0.04, 0xd8a020); for (let k = 0; k < 6; k++) B(DEC, R(-1, 1), 0.06, R(-L / 2, L / 2), R(0.6, 1.6), 0.01, R(0.6, 1.6), 0x2a0604); }
      else { B(SOL, 0, 1.55, -L / 2 + 1.1, 2.4, 1.9, 2.2, 0x4a5638); B(SOL, 0, 2.0, -L / 2 + 0.02, 2.1, 0.7, 0.05, 0x26303a); B(SOL, 0, 1.0, 1.0, 2.4, 0.5, 5.0, 0x3e4a30); B(SOL, 0, 2.15, 1.0, 2.46, 1.9, 5.0, 0x5a6442); B(SOL, 0, 3.12, 1.0, 2.0, 0.1, 5.0, 0x4e5838); for (let k = 0; k < 4; k++) B(MET, 0, 2.15, -1.2 + k * 1.5, 2.5, 1.94, 0.06, 0x3a4230); B(FLAT, 1.25, 2.3, 1.0, 0.02, 0.5, 0.5, 0xe8e8e0); B(WOD, 0.5, 0.95, 4.0, 0.9, 0.5, 0.7, 0x5a6a3a); }
      const nw = kind === 'bus' ? [-L / 2 + 2, L / 2 - 2.4] : [-L / 2 + 1.1, 1.2, 2.6]; for (const wz of nw) for (const sx of [-1, 1]) B(MET, sx * 1.15, 0.5, wz, 0.5, 0.3, 0.5, 0x141416, geoCyl, Math.PI / 2);
      for (let t = -L / 2 + 1.2; t <= L / 2 - 1.1; t += 1.6) addCircle(x + Math.sin(ang) * t, z + Math.cos(ang) * t, 1.35, Y, Y + 3); };
    bigV(XS[3] + 2, -150, 0.5, 'bus'); bigV(XS[3] - 3, 40, -0.25, 'bus'); bigV(-100, ZS[2] + 1, Math.PI / 2 + 0.3, 'bus'); bigV(95, ZS[3] - 1, Math.PI / 2 - 0.4, 'bus');
    bigV(XS[3] + 3.5, -95, 0.1, 'truck'); bigV(-35, ZS[1] - 1.5, Math.PI / 2 + 0.15, 'truck'); bigV(XS[1] + 1, 95, 0.2, 'truck'); bigV(60, ZS[4] + 1, Math.PI / 2, 'truck');
    // maletas, carritos, conos y cajas tirados en la huida
    for (let k = 0; k < 190; k++) { const side = rand() < 0.6, [x, z] = side ? sidewalk() : onStreet(), r = rand();
      if (r < 0.4) rbx(SOL, x, Y + 0.3, z, R(0.4, 0.7), R(0.35, 0.6), R(0.2, 0.3), pick([0x3a4a6a, 0x7a2a2a, 0x2a2a2e, 0x6a5a3a, 0x4a6a4a, 0xc8a030]), rand() < 0.5 ? Math.PI / 2 : 0, R(0, 6), 0);
      else if (r < 0.6) { rbx(FLAT, x, Y + 0.3, z, 0.16, 0.5, 0.16, 0xe8641a, 0, 0, rand() < 0.4 ? Math.PI / 2 : 0, geoCyl); FLAT.box(x, Y + 0.09, z, 0.4, 0.04, 0.4, 0xe8641a); }
      else if (r < 0.78) { const a = R(0, 6); rbx(MET, x, Y + 0.62, z, 0.55, 0.5, 0.9, 0x9a9ea4, 0, a, rand() < 0.35 ? Math.PI / 2 : 0); rbx(MET, x, Y + 0.25, z, 0.5, 0.05, 0.85, 0x6a6e74, 0, a, 0); }
      else if (r < 0.9) { for (let j = 0; j < RI(1, 3); j++) rbx(WOD, x + R(-0.4, 0.4), Y + 0.25 + (j === 2 ? 0.5 : 0), z + R(-0.4, 0.4), 0.5, 0.5, 0.5, pick([0xb8936a, 0xa8835a, 0xc8a878]), 0, R(0, 3), 0); }
      else { rbx(MET, x, Y + 0.55, z, 0.04, 1.0, 0.55, 0x2a2a30, R(-0.2, 0.2), R(0, 6), Math.PI / 2 - 0.2); for (const w of [-0.5, 0.5]) rbx(MET, x + w, Y + 0.33, z, 0.33, 0.04, 0.33, 0x18181a, Math.PI / 2, R(0, 0.3), 0, geoCyl); } }
    // (sin partículas de ceniza: en pantallas pequeñas centelleaban)
  }
  // ---------- muebles: una malla instanciada por tipo y celda; solo se dibujan las celdas cercanas ----------
  CITY.furCells = [];
  for (const [key, cell] of FCELL) { const g = new THREE.Group(), [ix, iz] = key.split('_').map(Number); let n = 0;
    for (const name in cell) { const a = cell[name], im = new THREE.InstancedMesh(FPROTO[name], FM, a.length / 2), col = new THREE.Color(); for (let i = 0; i < a.length; i += 2) { im.setMatrixAt(i / 2, a[i]); im.setColorAt(i / 2, col.set(a[i + 1])); } im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true; g.add(im); n += a.length / 2; }
    g.visible = false; scene.add(g); CITY.furCells.push([g, (ix + 0.5) * FCS, (iz + 0.5) * FCS]); }
  // ---------- mallas finales ----------
  const DECMAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, envMapIntensity: 0.15, polygonOffset: true, polygonOffsetFactor: -2 });
  CITY.areas = [];
  for (const [name, A] of Object.entries(AREAS)) {
    const g = new THREE.Group(); g.name = 'area_' + name;
    const add = (mg, mt, sh) => { if (mg.p.length) g.add(mg.mesh(mt, sh)); };
    add(A.INT_P, TM.plaster, true); add(A.INT_W, TM.wood, false); add(A.INT_T, TM.tile, false); add(A.INT_F, TM.gen, true);
    add(A.SOL, TM.gen, true); add(A.GL, MAT.glass, false); add(A.FLAT, MAT.solid, false); add(A.DEC, DECMAT, false);
    for (const [k, mt, sh] of [['ASM', TM.asphalt, false], ['PAN', TM.panot, false], ['FAC', TM.plaster, true], ['BRK', TM.brick, true], ['STN', TM.stone, true], ['ROOF', TM.roof, false], ['WOD', TM.wood, true], ['MET', TM.metal, true], ['SLT', TM.slat, false], ['BRKT', TM.bark, true]]) add(A[k], mt, sh);
    if (A.LMP.p.length) { const lm = A.LMP.mesh(MAT.lamp, false); g.add(lm); if (!CITY.lamps) CITY.lamps = lm; }
    scene.add(g);
    const tw = CITY.towns.find(t => t.T.name === name); if (tw) CITY.areas.push({ g, x0: tw.X0, x1: tw.X1, z0: tw.Z0, z1: tw.Z1 });
  }
  CITY.cullTick = (cp) => {
    for (const me of CITY.cull) { if (me.userData.gone) { me.visible = false; continue; } const d = Math.abs(me.position.x - cp.x) + Math.abs(me.position.z - cp.z); me.visible = d < (me.userData.cd || 90); }
    for (const [g, x, z] of CITY.furCells) g.visible = Math.abs(x - cp.x) + Math.abs(z - cp.z) < 96;
    if (CITY.cullUp) for (const [g, x, z] of CITY.cullUp) { if (g.userData.hidden) continue; g.visible = Math.abs(x - cp.x) + Math.abs(z - cp.z) < 300; }
    for (const a of CITY.areas) { const dx = Math.max(a.x0 - cp.x, 0, cp.x - a.x1), dz = Math.max(a.z0 - cp.z, 0, cp.z - a.z1); a.g.visible = Math.hypot(dx, dz) < 260; }
  };
  // puntos de calle para zombis
  for (let k = 0; k < 700; k++) { if (rand() < 0.5) CITY.streetPts.push([pick(XS) + R(-4, 4), R(L0, L1)]); else CITY.streetPts.push([R(L0, 140), pick(ZS) + R(-4, 4)]); }
  // ---------- minimapa ----------
  const ctx = MINIMAP_IMG.getContext('2d'), k = MINIMAP_IMG.width / WORLD, X = x => (x + HALF) * k;
  ctx.fillStyle = '#4a4c52'; for (const [ax, az, bx2, bz2] of ROADS) { const al = ax === bx2; ctx.fillRect(X(Math.min(ax, bx2) - (al ? 4 : 0)), X(Math.min(az, bz2) - (al ? 0 : 4)), (Math.abs(bx2 - ax) + (al ? 8 : 0)) * k, (Math.abs(bz2 - az) + (al ? 0 : 8)) * k); }
  for (const tw of CITY.towns) { ctx.fillStyle = '#8a8478'; ctx.fillRect(X(tw.X0), X(tw.Z0), (tw.X1 - tw.X0) * k, (tw.Z1 - tw.Z0) * k); ctx.fillStyle = '#4a4c52'; for (const x of tw.xs) ctx.fillRect(X(x - 4.5), X(tw.Z0), 9 * k, (tw.Z1 - tw.Z0) * k); for (const z of tw.zs) ctx.fillRect(X(tw.X0), X(z - 4.5), (tw.X1 - tw.X0) * k, 9 * k); }
  ctx.fillStyle = '#8a8478'; ctx.fillRect(X(L0 - 10), X(L0 - 10), (L1 - L0 + 20) * k, (L1 - L0 + 20) * k);
  ctx.fillStyle = '#6a9a4a'; ctx.fillRect(X(-234), X(BZ[BZ.length - 1][0]), 404 * k, (200 - BZ[BZ.length - 1][0]) * k);
  ctx.fillStyle = '#c8b8a0'; for (const sg of segs) { const a = W2(sg, -sg.w / 2, 0), b = W2(sg, sg.w / 2, sg.D); ctx.fillRect(X(Math.min(a[0], b[0])), X(Math.min(a[1], b[1])), Math.abs(a[0] - b[0]) * k, Math.abs(a[1] - b[1]) * k); }
  ctx.fillStyle = '#ffb43a'; for (const r of CITY.rooms) if (r.kind !== 'piso' && !(r.sg.room && r.sg.room.generic)) ctx.fillRect(X(r.x0), X(r.z0), (r.x1 - r.x0) * k, (r.z1 - r.z0) * k);
  ctx.fillStyle = '#4a4c52'; for (let i = 0; i < XS.length; i++) ctx.fillRect(X(XS[i] - XW[i] / 2), X(L0 - 5), XW[i] * k, (L1 - L0 + 10) * k); for (let j = 0; j < ZS.length; j++) ctx.fillRect(X(L0 - 5), X(ZS[j] - ZW[j] / 2), (L1 - L0 + 10) * k, ZW[j] * k);
  ctx.fillStyle = '#5a4a3a'; ctx.fillRect(X(148), X(L0 - 10), 4 * k, (L1 - L0 + 20) * k);
})();
