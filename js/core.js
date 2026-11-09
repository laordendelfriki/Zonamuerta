// ===== LA ORDEN: ÚLTIMO EN PIE — núcleo: utilidades, mundo, colisiones =====
'use strict';
const CITYMODE = window.MAP_MODE === 'city';
const WORLD = CITYMODE ? 1500 : 640, HALF = WORLD / 2, GRID = CITYMODE ? 150 : 160, CELL = WORLD / GRID;
const SQPOI = t => t === 'city' || t === 'town' || t === 'camp';
const IS_TOUCH = ('ontouchstart' in window) || matchMedia('(pointer:coarse)').matches;
// Gestión de color: todos los colores que escribimos están en sRGB y se pasan a lineal para un render realista
{ let depth = 0; for (const k of ['setHex', 'setRGB', 'setHSL', 'setStyle']) { const o = THREE.Color.prototype[k]; THREE.Color.prototype[k] = function () { depth++; try { o.apply(this, arguments); } finally { depth--; } if (depth === 0) this.convertSRGBToLinear(); return this; }; } }

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rand = mulberry32(20261108);
const R = (a, b) => a + (b - a) * rand();
const RI = (a, b) => Math.floor(R(a, b + 1));
const pick = arr => arr[Math.floor(rand() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

// ---------- ruido ----------
const PERM = new Uint8Array(512);
{ const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]; }
function hash2(x, y) { return PERM[(PERM[x & 255] + (y & 255)) & 511] / 255; }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), u = smooth(x - xi), v = smooth(y - yi);
  return lerp(lerp(hash2(xi, yi), hash2(xi + 1, yi), u), lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u), v);
}
function fbm(x, y) { let s = 0, a = 1, f = 1, n = 0; for (let i = 0; i < 4; i++) { s += vnoise(x * f, y * f) * a; n += a; a *= 0.5; f *= 2.03; } return s / n; }

// ---------- lugares de interés ----------
let POIS = [
  { name: 'Pueblo Orden', x: 0, z: 10, r: 46, type: 'town' },
  { name: 'La Llagosta', x: -150, z: -105, r: 40, type: 'town' },
  { name: 'Mercado Booster', x: 140, z: -125, r: 40, type: 'market' },
  { name: 'Granja Mulligan', x: -165, z: 120, r: 36, type: 'farm' },
  { name: 'Faro Foil', x: 175, z: 150, r: 22, type: 'lighthouse' },
  { name: 'Torre Top 8', x: 40, z: 175, r: 24, type: 'tower' },
  { name: 'Bosque del Mazo', x: -30, z: -185, r: 0, type: 'forest' },
  { name: 'Colinas Foil', x: 185, z: 20, r: 0, type: 'hills' },
];
function baseH(x, z) {
  if (CITYMODE) { const d = Math.max(Math.abs(x), Math.abs(z)) / HALF, e = smooth(clamp((d - 0.86) / 0.12, 0, 1)); return 29 + e * (40 + fbm(x * 0.01 + 3, z * 0.01 + 3) * 30); }
  const d = Math.hypot(x * 1.0, z * 1.08) / HALF;
  const n = fbm(x * 0.009 + 10, z * 0.009 + 10);
  const hills = Math.pow(fbm(x * 0.0045 + 50, z * 0.0045 + 50), 2.2) * 70;
  let h = 5 + n * 12 + hills;
  return lerp(h, -9, smooth(clamp((d - 0.6) / 0.3, 0, 1)));
}
let ROADS = [];
if (CITYMODE) {
  POIS = [{ name: 'La Llagosta', x: -30, z: -30, r: 205, type: 'city' },
    { name: 'Martorelles', x: 0, z: 470, r: 95, type: 'town', sp: 55, n: 1 },
    { name: 'Sant Fost de Campsentelles', x: -520, z: 0, r: 95, type: 'town', sp: 55, n: 1 },
    { name: 'Montcada i Reixac', x: -132, z: -480, r: 110, type: 'town', sp: 55, n: 2 },
    { name: 'Santa Perpètua', x: 440, z: -253, r: 110, type: 'town', sp: 55, n: 2, ind: true },
    { name: 'Mollet del Vallès', x: 470, z: 121, r: 130, type: 'town', sp: 55, n: 2 },
    { name: 'Campamento', x: -330, z: 42, r: 30, type: 'camp' }];
  ROADS = [[0, 163, 0, 377], [-229, 0, -427, 0], [-132, -229, -132, -372], [163, -198, 332, -198], [163, 66, 342, 66]];
}
for (const p of POIS) p.h = Math.max(4.5, baseH(p.x, p.z));
function rawH(x, z) {
  let h = baseH(x, z);
  for (const p of POIS) {
    if (!p.r) continue;
    const d = SQPOI(p.type) ? Math.max(Math.abs(x - p.x), Math.abs(z - p.z)) : Math.hypot(x - p.x, z - p.z), R2 = p.r * (SQPOI(p.type) ? 1.85 : 1.7);
    if (d < R2) h = lerp(h, p.h, smooth(clamp((R2 - d) / (p.r * 0.7), 0, 1)));
  }
  return h;
}
// tabla de alturas que coincide exactamente con la malla
const HM = new Float32Array((GRID + 1) * (GRID + 1));
for (let j = 0; j <= GRID; j++) for (let i = 0; i <= GRID; i++) HM[j * (GRID + 1) + i] = rawH(-HALF + i * CELL, -HALF + j * CELL);
function getH(x, z) {
  const gx = (x + HALF) / CELL, gz = (z + HALF) / CELL;
  if (gx < 0 || gz < 0 || gx >= GRID || gz >= GRID) return -9;
  const i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j, W = GRID + 1;
  const h00 = HM[j * W + i], h10 = HM[j * W + i + 1], h01 = HM[(j + 1) * W + i], h11 = HM[(j + 1) * W + i + 1];
  if (fx + fz <= 1) return h00 + (h10 - h00) * fx + (h01 - h00) * fz;
  return h11 + (h01 - h11) * (1 - fx) + (h10 - h11) * (1 - fz);
}
function groundNormal(x, z) {
  const e = 1.2; const n = new THREE.Vector3(getH(x - e, z) - getH(x + e, z), 2 * e, getH(x, z - e) - getH(x, z + e));
  return n.normalize();
}

// ---------- three.js básico ----------
const renderer = new THREE.WebGLRenderer({ antialias: !IS_TOUCH, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, IS_TOUCH ? 1.25 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.physicallyCorrectLights = false;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('game').appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbfe3ff, 160, 720);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 2500);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

// cielo
{
  const g = new THREE.SphereGeometry(1800, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x3b8fe8) }, mid: { value: new THREE.Color(0x86c6ff) }, bot: { value: new THREE.Color(0xe2f4ff) } },
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vp; void main(){ float h=vp.y; vec3 c = h>0.15? mix(mid,top,smoothstep(0.15,0.7,h)) : mix(bot,mid,smoothstep(-0.05,0.15,h)); gl_FragColor=linearToOutputTexel(vec4(c,1.0));}'
  });
  const sky = new THREE.Mesh(g, m); sky.renderOrder = -1; scene.add(sky); scene.userData.sky = sky;
}
const hemi = new THREE.HemisphereLight(0xd6ecff, 0x8a8478, 0.25); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 1.35);
sun.position.set(80, 140, 50); sun.castShadow = true;
sun.shadow.mapSize.set(IS_TOUCH ? 1024 : 2048, IS_TOUCH ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 400 });
sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
scene.add(sun); scene.add(sun.target);
const SUN_OFF = new THREE.Vector3(80, 140, 50);
// iluminación ambiental del cielo (reflejos e IBL)
{
  const es = new THREE.Scene(), g = new THREE.SphereGeometry(100, 32, 16), cols = [], p = g.attributes.position, c = new THREE.Color(), top = new THREE.Color(0x4a90e0), hor = new THREE.Color(0xdcefff), gr = new THREE.Color(0x8a8478);
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 100; if (y > 0) c.copy(hor).lerp(top, Math.pow(y, 0.6)); else c.copy(hor).lerp(gr, Math.min(1, -y * 3)); cols.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  es.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const sunM = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); sunM.material.color.setRGB(5, 4.7, 4.2); sunM.position.copy(SUN_OFF).normalize().multiplyScalar(85); es.add(sunM);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(es, 0.03).texture; pm.dispose();
}

// material toon compartido
const TOON_GRAD = (() => { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const _matCache = {};
// materiales PBR (estilo cartoon 3D con luz realista)
function _std(extra, base) { const o = Object.assign({}, base, extra || {}); if (o.shininess !== undefined) { o.roughness = clamp(1 - o.shininess / 110, 0.12, 0.85); delete o.shininess; } delete o.specular; return new THREE.MeshStandardMaterial(o); }
function toon(color, extra) { const k = 't' + color + (extra ? JSON.stringify(extra) : ''); return _matCache[k] || (_matCache[k] = _std(extra, { color, roughness: 0.6, metalness: 0, envMapIntensity: 0.7 })); }
// luz de contorno (rim light) para que los personajes destaquen del fondo
function rimify(m, strength = 0.32) {
  m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', '{ float rimF = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0); gl_FragColor.rgb += vec3(0.55, 0.68, 0.9) * pow(rimF, 3.0) * ' + strength.toFixed(2) + '; }\n#include <dithering_fragment>'); };
  m.customProgramCacheKey = () => 'rim' + strength; return m;
}
function skinMat(color) { const k = 's' + color; if (_matCache[k]) return _matCache[k]; const sc = new THREE.Color(color); sc.g *= 0.9; sc.b *= 0.76; return (_matCache[k] = rimify(new THREE.MeshStandardMaterial({ color: sc, roughness: 0.5, metalness: 0, envMapIntensity: 0.75, emissive: new THREE.Color(color).multiplyScalar(0.025) }), 0.14)); }
function hairMat(color) { const k = 'h' + color; return _matCache[k] || (_matCache[k] = rimify(new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.8 }), 0.4)); }
function clothMat(color, extra) { const k = 'c' + color + (extra ? JSON.stringify(extra) : ''); return _matCache[k] || (_matCache[k] = rimify(new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.86, metalness: 0, envMapIntensity: 0.6 }, extra || {})), 0.22)); }
// ---------- estilo dibujo (cel shading + contorno) para personajes ----------
const CEL_GRAD = (() => { const d = new Uint8Array([120, 120, 120, 255, 200, 200, 200, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
const CEL = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: CEL_GRAD, toneMapped: false });
CEL.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', '{ vec3 nv = normalize(vNormal); float gl = smoothstep(0.86, 0.9, dot(nv, normalize(vec3(-0.35, 0.55, 0.76)))); gl_FragColor.rgb += gl * 0.16; float rimF = 1.0 - clamp(dot(nv, vec3(0.0, 0.0, 1.0)), 0.0, 1.0); gl_FragColor.rgb += smoothstep(0.62, 0.7, rimF) * 0.06; }\n#include <dithering_fragment>'); };
CEL.customProgramCacheKey = () => 'cel_char';
const UNLIT = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
const OUTLINE = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, toneMapped: false });
OUTLINE.onBeforeCompile = sh => {
  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * 0.022;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= 0.22;');
};
OUTLINE.customProgramCacheKey = () => 'outline_char';
// fusiona las piezas de cada hueso en una sola malla (rápido) y añade el contorno
function bakeChar(root, bones) {
  root.updateMatrixWorld(true);
  const boneSet = new Set(bones), buckets = new Map(), inv = new THREE.Matrix4(), mm = new THREE.Matrix4();
  const meshes = []; root.traverse(o => { if (o.isMesh && !o.userData.keep) meshes.push(o); });
  for (const o of meshes) {
    let b = o.parent; while (b && !boneSet.has(b)) b = b.parent; if (!b) continue;
    const m = o.material; if (m.transparent) continue;
    const kind = m.isMeshBasicMaterial ? 'u' : 'c';
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    inv.copy(b.matrixWorld).invert(); mm.multiplyMatrices(inv, o.matrixWorld); g.applyMatrix4(mm);
    const n = g.attributes.position.count, col = new Float32Array(n * 3); for (let i = 0; i < n; i++) { col[i * 3] = m.color.r; col[i * 3 + 1] = m.color.g; col[i * 3 + 2] = m.color.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    let bk = buckets.get(b); if (!bk) buckets.set(b, bk = { c: [], u: [] }); bk[kind].push(g);
    o.parent.remove(o);
  }
  const merge = gs => { let n = 0; for (const g of gs) n += g.attributes.position.count; const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3); let o = 0; for (const g of gs) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; } const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.BufferAttribute(P, 3)); r.setAttribute('normal', new THREE.BufferAttribute(N, 3)); r.setAttribute('color', new THREE.BufferAttribute(C, 3)); r.computeBoundingSphere(); return r; };
  for (const [b, bk] of buckets) {
    if (bk.c.length) { const g = merge(bk.c); const me = new THREE.Mesh(g, CEL); me.castShadow = true; b.add(me); const ol = new THREE.Mesh(g, OUTLINE); b.add(ol); }
    if (bk.u.length) { const me = new THREE.Mesh(merge(bk.u), UNLIT); b.add(me); }
  }
}
// geometría de torno cacheada (formas orgánicas: brazos, piernas, torso)
const _lathe = {};
function latheGeo(pts, seg = 18) { const k = seg + JSON.stringify(pts); if (_lathe[k]) return _lathe[k]; const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg); g.computeVertexNormals(); return (_lathe[k] = g); }
function lathe(pts, m, x = 0, y = 0, z = 0, parent, seg) { const me = new THREE.Mesh(latheGeo(pts, seg), m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; if (parent) parent.add(me); return me; }
// materiales con detalle procedural (tablones, tejas, piedra) para edificios
function detailMat(color, kind) {
  const k = 'd' + kind + color; if (_matCache[k]) return _matCache[k];
  const m = new THREE.MeshStandardMaterial({ color, roughness: kind === 'roof' ? 0.55 : 0.8, metalness: 0, envMapIntensity: 0.7 });
  const code = { plank: 'float ln = smoothstep(0.0, 0.06, abs(fract(vWP.y * 2.6) - 0.5) * 2.0 - 0.86); float gr = h21(floor(vWP.y * 2.6) + floor((vWP.x + vWP.z) * 0.7)); diffuseColor.rgb *= (0.86 + 0.14 * (1.0 - ln)) * (0.94 + gr * 0.1);',
    roof: 'float rw = fract(vWP.y * 3.2); float tile = smoothstep(0.0, 0.15, rw) * (0.82 + 0.18 * rw); float cl = h21(floor(vWP.y * 3.2) * 7.0 + floor((vWP.x + vWP.z) * 2.2)); diffuseColor.rgb *= tile * (0.9 + cl * 0.18);',
    stone: 'vec2 q = vec2((vWP.x + vWP.z) * 2.0, vWP.y * 4.0); q.x += floor(q.y) * 0.5; vec2 f = abs(fract(q) - 0.5); float e = smoothstep(0.42, 0.48, max(f.x, f.y)); float c = h21(floor(q)); diffuseColor.rgb *= (1.0 - e * 0.35) * (0.85 + c * 0.25);' }[kind];
  m.onBeforeCompile = sh => {
    sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'varying vec3 vWP;\nfloat h21(float n){ return fract(sin(n * 127.1) * 43758.5453); }\nfloat h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + code);
  };
  m.customProgramCacheKey = () => 'detail_' + kind;
  return (_matCache[k] = m);
}
function lam(color, extra) { const k = 'l' + color + (extra ? JSON.stringify(extra) : ''); return _matCache[k] || (_matCache[k] = new THREE.MeshLambertMaterial(Object.assign({ color }, extra || {}))); }
function basic(color, extra) { const k = 'b' + color + (extra ? JSON.stringify(extra) : ''); return _matCache[k] || (_matCache[k] = new THREE.MeshBasicMaterial(Object.assign({ color }, extra || {}))); }
function box(w, h, d, m, x = 0, y = 0, z = 0, parent) { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; if (parent) parent.add(me); return me; }
function cyl(rt, rb, h, seg, m, x = 0, y = 0, z = 0, parent) { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; if (parent) parent.add(me); return me; }
// caja con esquinas redondeadas (geometrías cacheadas)
const _rbCache = {};
function roundedBoxGeo(w, h, d, r) {
  const k = [w, h, d, r].map(v => v.toFixed(3)).join('_'); if (_rbCache[k]) return _rbCache[k];
  r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const g = new THREE.BoxGeometry(w, h, d, 5, 5, 5), p = g.attributes.position, v = new THREE.Vector3(), inner = new THREE.Vector3();
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); inner.set(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz)); v.sub(inner); if (v.lengthSq() > 1e-10) v.setLength(r); v.add(inner); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return (_rbCache[k] = g);
}
function rbox(w, h, d, m, x = 0, y = 0, z = 0, parent, r) { const me = new THREE.Mesh(roundedBoxGeo(w, h, d, r === undefined ? Math.min(w, h, d) * 0.3 : r), m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; if (parent) parent.add(me); return me; }
function sph(r, m, x = 0, y = 0, z = 0, parent, ws = 16, hs = 12) { const me = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), m); me.position.set(x, y, z); me.castShadow = true; if (parent) parent.add(me); return me; }

// ---------- colisiones (rejilla espacial) ----------
const COL_CELL = 16, COLGRID = new Map();
const BOXES = [], CIRCLES = [];
function colKey(cx, cz) { return cx * 1000 + cz; }
function addToGrid(obj, x0, z0, x1, z1) {
  for (let cx = Math.floor(x0 / COL_CELL); cx <= Math.floor(x1 / COL_CELL); cx++)
    for (let cz = Math.floor(z0 / COL_CELL); cz <= Math.floor(z1 / COL_CELL); cz++) {
      const k = colKey(cx, cz); let l = COLGRID.get(k); if (!l) COLGRID.set(k, l = []); l.push(obj);
    }
}
function addBox(x0, y0, z0, x1, y1, z1) { const b = { t: 0, x0, y0, z0, x1, y1, z1 }; BOXES.push(b); addToGrid(b, x0, z0, x1, z1); return b; }
function addCircle(x, z, r, y0, y1) { const c = { t: 1, x, z, r, y0, y1 }; CIRCLES.push(c); addToGrid(c, x - r, z - r, x + r, z + r); return c; }
const _near = new Set();
function nearby(x, z, rad = 2) {
  _near.clear();
  const c0x = Math.floor((x - rad) / COL_CELL), c1x = Math.floor((x + rad) / COL_CELL), c0z = Math.floor((z - rad) / COL_CELL), c1z = Math.floor((z + rad) / COL_CELL);
  for (let cx = c0x; cx <= c1x; cx++) for (let cz = c0z; cz <= c1z; cz++) { const l = COLGRID.get(colKey(cx, cz)); if (l) for (const o of l) _near.add(o); }
  return _near;
}
// empuja una entidad (pos = pies) fuera de obstáculos. devuelve true si choca
function collide(pos, r, h) {
  let hit = false;
  for (const o of nearby(pos.x, pos.z, r + 1)) {
    if (pos.y + h <= o.y0 || pos.y >= o.y1 - 0.05) continue;
    if (o.t === 1) {
      const dx = pos.x - o.x, dz = pos.z - o.z, d = Math.hypot(dx, dz), m = r + o.r;
      if (d < m) { hit = true; if (d < 1e-4) { pos.x += m; } else { pos.x = o.x + dx / d * m; pos.z = o.z + dz / d * m; } }
    } else {
      const cx = clamp(pos.x, o.x0, o.x1), cz = clamp(pos.z, o.z0, o.z1), dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        hit = true;
        if (d2 > 1e-8) { const d = Math.sqrt(d2); pos.x = cx + dx / d * r; pos.z = cz + dz / d * r; }
        else { // dentro: salir por el lado más cercano
          const e = [pos.x - o.x0, o.x1 - pos.x, pos.z - o.z0, o.z1 - pos.z], m = Math.min(...e), k = e.indexOf(m);
          if (k === 0) pos.x = o.x0 - r; else if (k === 1) pos.x = o.x1 + r; else if (k === 2) pos.z = o.z0 - r; else pos.z = o.z1 + r;
        }
      }
    }
  }
  return hit;
}
// rayos
function rayBox(o, d, b) {
  let tmin = 0, tmax = Infinity;
  const mins = [b.x0, b.y0, b.z0], maxs = [b.x1, b.y1, b.z1], os = [o.x, o.y, o.z], ds = [d.x, d.y, d.z];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(ds[i]) < 1e-9) { if (os[i] < mins[i] || os[i] > maxs[i]) return Infinity; continue; }
    let t1 = (mins[i] - os[i]) / ds[i], t2 = (maxs[i] - os[i]) / ds[i]; if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) return Infinity;
  }
  return tmin;
}
function rayCyl(o, d, cx, cz, r, y0, y1) {
  const ox = o.x - cx, oz = o.z - cz, a = d.x * d.x + d.z * d.z;
  if (a < 1e-9) return Infinity;
  const b = 2 * (ox * d.x + oz * d.z), c = ox * ox + oz * oz - r * r, disc = b * b - 4 * a * c;
  if (disc < 0) return Infinity;
  const s = Math.sqrt(disc); let t = (-b - s) / (2 * a); if (t < 0) t = (-b + s) / (2 * a); if (t < 0) return Infinity;
  const y = o.y + d.y * t; if (y < y0 || y > y1) return Infinity; return t;
}
function raySphere(o, d, cx, cy, cz, r) {
  const ox = o.x - cx, oy = o.y - cy, oz = o.z - cz, b = ox * d.x + oy * d.y + oz * d.z, c = ox * ox + oy * oy + oz * oz - r * r, disc = b * b - c;
  if (disc < 0) return Infinity; const s = Math.sqrt(disc); let t = -b - s; if (t < 0) t = -b + s; return t < 0 ? Infinity : t;
}
function rayTerrain(o, d, maxT) {
  let prev = 0, step = 1.2;
  for (let t = step; t <= maxT; t += step) {
    const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
    if (y < getH(x, z)) { let a = prev, b = t; for (let k = 0; k < 8; k++) { const m = (a + b) / 2; if (o.y + d.y * m < getH(o.x + d.x * m, o.z + d.z * m)) b = m; else a = m; } return (a + b) / 2; }
    prev = t; if (t > 40) step = 2.5;
  }
  return Infinity;
}
const _raySet = new Set();
function rayWorld(o, d, maxT) {
  let best = rayTerrain(o, d, maxT);
  _raySet.clear();
  const lim = Math.min(maxT, best);
  for (let t = 0; t <= lim + COL_CELL; t += COL_CELL * 0.5) {
    const l = COLGRID.get(colKey(Math.floor((o.x + d.x * t) / COL_CELL), Math.floor((o.z + d.z * t) / COL_CELL)));
    if (l) for (const ob of l) _raySet.add(ob);
  }
  for (const ob of _raySet) {
    const t = ob.t === 0 ? rayBox(o, d, ob) : rayCyl(o, d, ob.x, ob.z, ob.r, ob.y0, ob.y1);
    if (t < best) best = t;
  }
  return best;
}

// ---------- terreno ----------
const PATHS = window.MAP_MODE === 'city' ? [] : [[0, 1], [0, 2], [0, 3], [0, 5], [1, 3], [2, 4], [5, 4], [1, 2]];
function distSeg(px, pz, ax, az, bx, bz) { const vx = bx - ax, vz = bz - az, t = clamp(((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(px - ax - vx * t, pz - az - vz * t); }
function terrainColor(x, z, h, out) {
  const n = groundNormal(x, z).y;
  const v = fbm(x * 0.05, z * 0.05);
  let c;
  if (h < 0.35 && h > -0.5) c = [0.97, 0.95, 0.88];
  else if (h < 1.2) c = [0.93, 0.85, 0.6];
  else if (h < 2.2) c = [0.75, 0.82, 0.45];
  else { const t = v; c = [lerp(0.25, 0.38, t), lerp(0.55, 0.68, t), lerp(0.17, 0.22, t)]; }
  if (n < 0.8 && h > 2) { const t = clamp((0.8 - n) / 0.15, 0, 1); c = [lerp(c[0], 0.55, t), lerp(c[1], 0.55, t), lerp(c[2], 0.58, t)]; }
  if (h > 2) {
    for (const [a, b] of PATHS) { const A = POIS[a], B = POIS[b]; if (distSeg(x, z, A.x, A.z, B.x, B.z) < 3.2) { c = [0.74, 0.62, 0.42]; break; } }
    for (const p of POIS) if (p.r && (SQPOI(p.type) ? Math.max(Math.abs(x - p.x), Math.abs(z - p.z)) < p.r * (p.type === 'town' ? 1.08 : 1.15) : Math.hypot(x - p.x, z - p.z) < p.r * 0.55)) { c = SQPOI(p.type) ? [0.62, 0.6, 0.56] : p.type === 'farm' ? [0.62, 0.52, 0.32] : [0.78, 0.74, 0.66]; break; }
  }
  out[0] = c[0]; out[1] = c[1]; out[2] = c[2];
}
const MINIMAP_IMG = document.createElement('canvas');
{
  const W = GRID + 1, pos = new Float32Array(W * W * 3), col = new Float32Array(W * W * 3), idx = [];
  const MS = CITYMODE ? 512 : 256; MINIMAP_IMG.width = MINIMAP_IMG.height = MS;
  const mctx = MINIMAP_IMG.getContext('2d'), img = mctx.createImageData(MS, MS);
  const tmp = [0, 0, 0];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const k = j * W + i, x = -HALF + i * CELL, z = -HALF + j * CELL, h = HM[k];
    pos.set([x, h, z], k * 3); terrainColor(x, z, h, tmp);
    const c = new THREE.Color(tmp[0], tmp[1], tmp[2]); col.set([c.r, c.g, c.b], k * 3);
  }
  for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) { const a = j * W + i, b = (j + 1) * W + i, c = (j + 1) * W + i + 1, d = j * W + i + 1; idx.push(a, b, d, d, b, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const tm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0, envMapIntensity: 0.7 });
  tm.onBeforeCompile = sh => {
    sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'varying vec3 vWP;\nfloat h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }\n' +
      sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nfloat nz = vn(vWP.xz*0.45)*0.55 + vn(vWP.xz*1.7)*0.3 + vn(vWP.xz*6.0)*0.15;\ndiffuseColor.rgb *= 0.78 + nz*0.42;');
  };
  const terr = new THREE.Mesh(g, tm); terr.receiveShadow = true; scene.add(terr);
  for (let py = 0; py < MS; py++) for (let px = 0; px < MS; px++) {
    const x = -HALF + (px + 0.5) / MS * WORLD, z = -HALF + (py + 0.5) / MS * WORLD, h = getH(x, z), o = (py * MS + px) * 4;
    if (h < 0) { const t = clamp(-h / 8, 0, 1); img.data[o] = lerp(80, 30, t); img.data[o + 1] = lerp(190, 120, t); img.data[o + 2] = lerp(235, 200, t); }
    else { terrainColor(x, z, h, tmp); const sh = 0.85 + 0.25 * clamp(h / 60, 0, 1); img.data[o] = tmp[0] * 255 * sh; img.data[o + 1] = tmp[1] * 255 * sh; img.data[o + 2] = tmp[2] * 255 * sh; }
    img.data[o + 3] = 255;
  }
  mctx.putImageData(img, 0, 0);
}
// agua
const WATER_NORMAL = (() => {
  const N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N; const x = cv.getContext('2d'), im = x.createImageData(N, N);
  const hgt = (i, j) => { let v = 0; for (let k = 0; k < 4; k++) { const f = (k + 1) * 2 * Math.PI / N; v += Math.sin(i * f * (k % 2 ? 1 : 2) + j * f * (k % 2 ? 2 : 1) + k * 1.7) / (k + 1); } return v; };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const dx = hgt(i + 1, j) - hgt(i - 1, j), dz = hgt(i, j + 1) - hgt(i, j - 1), o = (j * N + i) * 4; const v = new THREE.Vector3(-dx * 2, -dz * 2, 1).normalize(); im.data[o] = (v.x * 0.5 + 0.5) * 255; im.data[o + 1] = (v.y * 0.5 + 0.5) * 255; im.data[o + 2] = (v.z * 0.5 + 0.5) * 255; im.data[o + 3] = 255; }
  x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(220, 220); return t;
})();
const water = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000, 1, 1), new THREE.MeshStandardMaterial({ color: 0x1a86c8, roughness: 0.06, metalness: 0.15, transparent: true, opacity: 0.86, normalMap: WATER_NORMAL, normalScale: new THREE.Vector2(0.45, 0.45), envMapIntensity: 1.2 }));
water.rotation.x = -Math.PI / 2; water.position.y = 0; water.receiveShadow = true; scene.add(water);

// nubes
const clouds = new THREE.Group(); scene.add(clouds);
for (let i = 0; i < 28; i++) {
  const c = new THREE.Group(), n = RI(3, 6);
  for (let k = 0; k < n; k++) { const s = sph(R(8, 16), lam(0xffffff, { emissive: 0x888888 }), R(-18, 18), R(-3, 4), R(-8, 8), c, 10, 8); s.castShadow = false; s.scale.y = 0.6; }
  c.position.set(R(-700, 700), R(170, 230), R(-700, 700)); clouds.add(c);
}

// ---------- vegetación y rocas (instanciadas) ----------
const GRASS = [], GRASS_TIME = { value: 0 };
function inPOI(x, z, extra = 0) { for (const p of POIS) if (p.r && (SQPOI(p.type) ? Math.max(Math.abs(x - p.x), Math.abs(z - p.z)) < p.r * 1.2 + extra : Math.hypot(x - p.x, z - p.z) < p.r + extra)) return p; return null; }
function nearPath(x, z) { for (const r of ROADS) if (distSeg(x, z, r[0], r[1], r[2], r[3]) < 9) return true; for (const [a, b] of PATHS) { const A = POIS[a], B = POIS[b]; if (distSeg(x, z, A.x, A.z, B.x, B.z) < 5) return true; } return false; }
{
  const trees = [], pines = [];
  let tries = 0;
  while (trees.length + pines.length < (CITYMODE ? 850 : 520) && tries++ < 40000) {
    let x = R(-HALF, HALF), z = R(-HALF, HALF);
    const forest = POIS[6];
    if (forest && forest.type === 'forest' && rand() < 0.3) { x = forest.x + R(-70, 70); z = forest.z + R(-45, 45); }
    const h = getH(x, z); if (h < 2.5) continue;
    if (inPOI(x, z, 6) || nearPath(x, z)) continue;
    if (groundNormal(x, z).y < 0.82) continue;
    (h > 35 ? pines : trees).push([x, h, z, R(0.8, 1.35)]);
  }
  const trunkG = new THREE.CylinderGeometry(0.28, 0.42, 3.4, 7); trunkG.translate(0, 1.7, 0);
  const crownG = new THREE.IcosahedronGeometry(2.4, 1); crownG.translate(0, 4.6, 0);
  const crown2 = new THREE.IcosahedronGeometry(1.7, 1); crown2.translate(0.6, 6.3, 0.3);
  const pineG = new THREE.ConeGeometry(2.2, 6.5, 8); pineG.translate(0, 5.2, 0);
  const all = trees.concat(pines);
  const trunk = new THREE.InstancedMesh(trunkG, toon(0x8a5a33), all.length);
  const crA = new THREE.InstancedMesh(crownG, toon(0xffffff), trees.length);
  const crB = new THREE.InstancedMesh(crown2, toon(0xffffff), trees.length);
  const pn = new THREE.InstancedMesh(pineG, toon(0xffffff), Math.max(1, pines.length));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();
  all.forEach((t, i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6.28); s.set(t[3], t[3], t[3]); p.set(t[0], t[1] - 0.2, t[2]); m.compose(p, q, s); trunk.setMatrixAt(i, m); addCircle(t[0], t[2], 0.55 * t[3], t[1] - 1, t[1] + 8 * t[3]); });
  trees.forEach((t, i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6.28); s.set(t[3], t[3], t[3]); p.set(t[0], t[1] - 0.2, t[2]); m.compose(p, q, s); crA.setMatrixAt(i, m); crB.setMatrixAt(i, m); col.setHSL(R(0.24, 0.33), R(0.5, 0.65), R(0.32, 0.43)); crA.setColorAt(i, col); { const hh = R(0.24, 0.33); col.setHSL(hh + 0.01, 0.6, 0.45); } crB.setColorAt(i, col); });
  pines.forEach((t, i) => { s.set(t[3], t[3], t[3]); p.set(t[0], t[1] - 0.2, t[2]); m.compose(p, q.identity(), s); pn.setMatrixAt(i, m); col.setHSL(R(0.3, 0.38), 0.5, R(0.25, 0.35)); pn.setColorAt(i, col); });
  for (const im of [trunk, crA, crB, pn]) { if (im === pn && !pines.length) continue; if (im.count === 0) continue; im.castShadow = true; im.receiveShadow = true; scene.add(im); }
  // rocas
  const rocks = []; tries = 0;
  while (rocks.length < 110 && tries++ < 5000) { const x = R(-HALF, HALF), z = R(-HALF, HALF), h = getH(x, z); if (h < 1.5 || inPOI(x, z, 4) || nearPath(x, z)) continue; rocks.push([x, h, z, R(0.8, 2.8)]); }
  const rockG = new THREE.DodecahedronGeometry(1, 0);
  const rk = new THREE.InstancedMesh(rockG, toon(0xffffff), rocks.length);
  rocks.forEach((t, i) => { q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3)); s.set(t[3] * 1.2, t[3] * 0.8, t[3]); p.set(t[0], t[1] + t[3] * 0.25, t[2]); m.compose(p, q, s); rk.setMatrixAt(i, m); col.setHSL(0.6, 0.06, R(0.5, 0.65)); rk.setColorAt(i, col); addCircle(t[0], t[2], t[3] * 1.05, t[1] - 1, t[1] + t[3]); });
  rk.castShadow = rk.receiveShadow = true; scene.add(rk);
  // arbustos (decorativos, sin colisión)
  const bushes = []; tries = 0;
  while (bushes.length < 260 && tries++ < 6000) { const x = R(-HALF, HALF), z = R(-HALF, HALF), h = getH(x, z); if (h < 2 || inPOI(x, z, 2) || nearPath(x, z)) continue; bushes.push([x, h, z, R(0.6, 1.2)]); }
  const bg = new THREE.IcosahedronGeometry(1, 1); bg.scale(1, 0.75, 1);
  const bu = new THREE.InstancedMesh(bg, toon(0xffffff), bushes.length);
  bushes.forEach((t, i) => { s.set(t[3], t[3], t[3]); p.set(t[0], t[1] + 0.3 * t[3], t[2]); m.compose(p, q.identity(), s); bu.setMatrixAt(i, m); col.setHSL(R(0.25, 0.32), 0.6, R(0.32, 0.42)); bu.setColorAt(i, col); });
  bu.castShadow = true; scene.add(bu);
  // hierba con viento
  const bladeG = new THREE.BufferGeometry();
  { const P = [], C = [], N = [], base = [0.22, 0.46, 0.14], tip = [0.6, 0.86, 0.36];
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + k * 0.7, rr = 0.06 + (k % 3) * 0.07, cx = Math.cos(a) * rr, cz = Math.sin(a) * rr, hh = 0.32 + ((k * 37) % 10) / 10 * 0.3, lean = 0.12, w = 0.045, px = -Math.sin(a) * w, pz = Math.cos(a) * w;
      P.push(cx - px, 0, cz - pz, cx + px, 0, cz + pz, cx + Math.cos(a) * lean, hh, cz + Math.sin(a) * lean); C.push(...base.map(v => Math.pow(v, 2.2)), ...base.map(v => Math.pow(v, 2.2)), ...tip.map(v => Math.pow(v, 2.2))); N.push(0, 1, 0, 0, 1, 0, 0, 1, 0); }
    bladeG.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); bladeG.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); bladeG.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); }
  const grassMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85, metalness: 0, envMapIntensity: 0.7 });
  grassMat.onBeforeCompile = sh => { sh.uniforms.uTime = GRASS_TIME; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat ph = instanceMatrix[3].x * 0.21 + instanceMatrix[3].z * 0.17;\ntransformed.x += sin(uTime * 2.2 + ph) * 0.12 * position.y;\ntransformed.z += cos(uTime * 1.7 + ph) * 0.08 * position.y;\n#endif'); };
  const grass = []; tries = 0;
  while (grass.length < (CITYMODE ? (IS_TOUCH ? 4000 : 9000) : (IS_TOUCH ? 9000 : 18000)) && tries++ < 60000) {
    const x = R(-HALF, HALF), z = R(-HALF, HALF), h = getH(x, z); if (h < 2.3 || h > 45) continue;
    const pp = inPOI(x, z, 0); if (pp && (SQPOI(pp.type) ? Math.max(Math.abs(x - pp.x), Math.abs(z - pp.z)) < pp.r * 1.25 : Math.hypot(x - pp.x, z - pp.z) < pp.r * 0.6)) continue; if (nearPath(x, z) && rand() < 0.85) continue;
    if (groundNormal(x, z).y < 0.84) continue; grass.push([x, h, z]);
  }
  const gm = new THREE.InstancedMesh(bladeG, grassMat, grass.length);
  grass.forEach((t, i) => { const sc = R(0.6, 1.15); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6.28); s.set(sc, sc * R(0.8, 1.3), sc); p.set(t[0], t[1] - 0.05, t[2]); m.compose(p, q, s); gm.setMatrixAt(i, m); col.setHSL(R(0.22, 0.3), R(0.5, 0.75), R(0.75, 1)); gm.setColorAt(i, col); });
  gm.receiveShadow = true; scene.add(gm); GRASS.push(gm);
  // flores
  const fl = []; tries = 0;
  while (fl.length < 900 && tries++ < 20000) { const x = R(-HALF, HALF), z = R(-HALF, HALF), h = getH(x, z); if (h < 2.5 || h > 40 || inPOI(x, z, 2) || nearPath(x, z)) continue; fl.push([x, h, z]); }
  const flG = new THREE.IcosahedronGeometry(0.11, 0); flG.translate(0, 0.42, 0);
  const stG = new THREE.CylinderGeometry(0.015, 0.015, 0.42, 4); stG.translate(0, 0.21, 0);
  const fm = new THREE.InstancedMesh(flG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), fl.length), sm = new THREE.InstancedMesh(stG, new THREE.MeshStandardMaterial({ color: 0x3f8f2e, roughness: 0.8 }), fl.length);
  const FC = [0xffffff, 0xffe14d, 0xff7ab8, 0xb88cff, 0xff6a4d];
  fl.forEach((t, i) => { p.set(t[0], t[1], t[2]); m.compose(p, q.identity(), s.set(1, 1, 1)); fm.setMatrixAt(i, m); sm.setMatrixAt(i, m); col.setHex(FC[i % FC.length]); fm.setColorAt(i, col); });
  scene.add(fm); scene.add(sm); GRASS.push(fm, sm);
}

// ---------- edificios ----------
const LOOT_SPOTS = [], CHEST_SPOTS = [], VEHICLE_SPOTS = [], HOUSES = [];
function textTexture(text, bg, fg, w = 512, h = 128, font = 'bold 70px "Luckiest Guy", Impact, sans-serif') {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
// casa con puerta, ventanas y tejado; rot 0 => puerta hacia +z, 1 => +x, 2 => -z, 3 => -x
function makeHouse(cx, cz, w, d, rot, wallC, roofC, sign) {
  const y = getH(cx, cz), H = 4, T = 0.3, g = new THREE.Group();
  const sw = rot % 2 ? d : w, sd = rot % 2 ? w : d; // tamaño en mundo
  g.position.set(cx, y, cz); g.rotation.y = -rot * Math.PI / 2; scene.add(g);
  const wm = detailMat(wallC, 'plank'), door = 1.9, wood = toon(0x6b4423), white = toon(0xf4f1ea);
  // paredes locales (puerta en +z)
  box(w, H, T, wm, 0, H / 2, -d / 2 + T / 2, g);
  box(T, H, d, wm, -w / 2 + T / 2, H / 2, 0, g);
  box(T, H, d, wm, w / 2 - T / 2, H / 2, 0, g);
  const side = (w - door) / 2;
  box(side, H, T, wm, -w / 2 + side / 2, H / 2, d / 2 - T / 2, g);
  box(side, H, T, wm, w / 2 - side / 2, H / 2, d / 2 - T / 2, g);
  box(door, H - 2.6, T, wm, 0, 2.6 + (H - 2.6) / 2, d / 2 - T / 2, g);
  // zócalo de piedra y esquinas de madera
  const st = detailMat(0xa9a49a, 'stone');
  box(w + 0.12, 0.5, 0.12, st, 0, 0.25, -d / 2 - 0.02, g); box(0.12, 0.5, d + 0.12, st, -w / 2 - 0.02, 0.25, 0, g); box(0.12, 0.5, d + 0.12, st, w / 2 + 0.02, 0.25, 0, g);
  box(side + 0.06, 0.5, 0.12, st, -w / 2 + side / 2, 0.25, d / 2 + 0.02, g); box(side + 0.06, 0.5, 0.12, st, w / 2 - side / 2, 0.25, d / 2 + 0.02, g);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.28, H, 0.28, white, sx * (w / 2), H / 2, sz * (d / 2), g);
  // marco de puerta
  box(0.16, 2.7, 0.4, wood, -door / 2 - 0.02, 1.35, d / 2 - T / 2, g); box(0.16, 2.7, 0.4, wood, door / 2 + 0.02, 1.35, d / 2 - T / 2, g); box(door + 0.36, 0.18, 0.4, wood, 0, 2.66, d / 2 - T / 2, g);
  // ventanas con marco y contraventanas
  const glass = toon(0xa8e4ff, { emissive: 0x1b3a4f, roughness: 0.1, metalness: 0.2 });
  const shutC = toon(new THREE.Color(roofC).getHex());
  const win = (x, z, faceZ, ww) => {
    const gz = z + faceZ * 0.02, wn = box(ww, 1, 0.05, glass, x, 2.1, gz, g); wn.castShadow = false;
    box(ww + 0.2, 0.12, 0.12, white, x, 2.66, gz, g); box(ww + 0.3, 0.12, 0.2, white, x, 1.54, gz + faceZ * 0.05, g);
    box(0.08, 1, 0.08, white, x, 2.1, gz, g); box(ww, 0.06, 0.07, white, x, 2.1, gz, g);
    for (const sx of [-1, 1]) box(ww * 0.5, 1.1, 0.06, shutC, x + sx * (ww * 0.75 + 0.1), 2.1, gz, g);
  };
  win(-(w / 2 - side / 2), d / 2, 1, 1.0); win(w / 2 - side / 2, d / 2, 1, 1.0); win(0, -d / 2, -1, 1.3);
  // suelo y tejado
  const fl = box(w - 0.1, 0.12, d - 0.1, detailMat(0xb08a5a, 'plank'), 0, 0.02, 0, g); fl.castShadow = false;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.SQRT2 / 2, 1, 4, 1), detailMat(roofC, 'roof'));
  roof.rotation.y = Math.PI / 4; roof.scale.set(w + 1.2, 2.4, d + 1.2); roof.position.y = H + 1.25; roof.castShadow = true; roof.receiveShadow = true; g.add(roof);
  const trim = box(w + 0.5, 0.25, d + 0.5, white, 0, H, 0, g); trim.castShadow = false;
  // chimenea
  const chx = w * 0.22, chz = -d * 0.15; const ch1 = box(0.7, 2.2, 0.7, st, chx, H + 1.6, chz, g), ch2 = box(0.86, 0.18, 0.86, toon(0x6a6a6a), chx, H + 2.75, chz, g);
  if (sign) { const s = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshBasicMaterial({ map: textTexture(sign, '#2a1747', '#ffd23f') })); s.position.set(0, 3.25, d / 2 + 0.17); g.add(s); }
  // colisiones (mundo)
  const L = (lx, lz) => { const c = Math.cos(-rot * Math.PI / 2), s = Math.sin(-rot * Math.PI / 2); return [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
  const wallBox = (lx0, lz0, lx1, lz1, y0 = 0, y1 = H) => { const a = L(lx0, lz0), b = L(lx1, lz1); addBox(Math.min(a[0], b[0]), y + y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + y1 + 2.5, Math.max(a[1], b[1])); };
  wallBox(-w / 2, -d / 2, w / 2, -d / 2 + T);
  wallBox(-w / 2, -d / 2, -w / 2 + T, d / 2);
  wallBox(w / 2 - T, -d / 2, w / 2, d / 2);
  wallBox(-w / 2, d / 2 - T, -w / 2 + side, d / 2);
  wallBox(w / 2 - side, d / 2 - T, w / 2, d / 2);
  wallBox(-door / 2, d / 2 - T, door / 2, d / 2, 2.6, H);
  { const cs = [L(-w / 2, -d / 2), L(w / 2, d / 2)]; HOUSES.push({ cx, cz, y, w, d, rot, L, g, roof: [roof, trim, ch1, ch2], x0: Math.min(cs[0][0], cs[1][0]), x1: Math.max(cs[0][0], cs[1][0]), z0: Math.min(cs[0][1], cs[1][1]), z1: Math.max(cs[0][1], cs[1][1]) }); }
  // botín
  CHEST_SPOTS.push({ x: L(-w / 2 + 1.2, -d / 2 + 1.1)[0], z: L(-w / 2 + 1.2, -d / 2 + 1.1)[1], rot });
  LOOT_SPOTS.push(L(w / 4, 0), L(-w / 4, d / 4));
  return g;
}
function makeContainer(cx, cz, rot, color) {
  const y = getH(cx, cz), g = new THREE.Group(); g.position.set(cx, y, cz); g.rotation.y = rot ? Math.PI / 2 : 0; scene.add(g);
  box(6, 2.6, 2.5, toon(color), 0, 1.3, 0, g);
  for (let i = -2; i <= 2; i++) box(0.08, 2.4, 2.56, toon(new THREE.Color(color).multiplyScalar(0.75).getHex()), i * 1.2, 1.3, 0, g);
  const [hw, hd] = rot ? [1.25, 3] : [3, 1.25]; addBox(cx - hw, y, cz - hd, cx + hw, y + 2.6, cz + hd);
}
function makeCrate(x, z) { const y = getH(x, z); box(1.4, 1.4, 1.4, toon(0xb8834a), x, y + 0.7, z); addBox(x - 0.7, y, z - 0.7, x + 0.7, y + 1.4, z + 0.7); }
const WALL_COLS = [0xf2e3c6, 0xffd6a5, 0xcde7ff, 0xd9f2c4, 0xf7c6d9, 0xe8d5ff, 0xfff1a8];
const ROOF_COLS = [0xd9534f, 0x3f6fb5, 0x7a4fa0, 0x2f8f5b, 0xe07b39];
const SIGNS = ['LA ORDEN', 'TCG', 'BOOSTERS', 'TORNEOS', 'CARTAS', 'DADOS', 'FRIKI'];
for (const p of POIS) {
  if (p.type === 'town' && !CITYMODE) {
    const n = p.name === 'Pueblo Orden' ? 9 : 7;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + 0.3, rr = p.r * (i % 2 ? 0.62 : 0.78);
      const x = p.x + Math.cos(a) * rr, z = p.z + Math.sin(a) * rr;
      // puerta mirando al centro
      const dx = p.x - x, dz = p.z - z; const rot = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 1 : 3) : (dz > 0 ? 0 : 2);
      makeHouse(x, z, RI(7, 9), RI(7, 9), rot, pick(WALL_COLS), pick(ROOF_COLS), i === 0 ? (p.name === 'Pueblo Orden' ? 'LA ORDEN' : pick(SIGNS)) : (rand() < 0.4 ? pick(SIGNS) : null));
    }
    // fuente en el centro
    const y = p.h; cyl(3, 3.3, 0.8, 20, toon(0xcfd6e0), p.x, y + 0.4, p.z); const wtr = cyl(2.7, 2.7, 0.1, 20, toon(0x47b8ff), p.x, y + 0.75, p.z); wtr.castShadow = false;
    cyl(0.4, 0.5, 2.4, 10, toon(0xcfd6e0), p.x, y + 1.2, p.z); addCircle(p.x, p.z, 3.3, y, y + 0.8);
    for (let k = 0; k < 6; k++) LOOT_SPOTS.push([p.x + R(-p.r * 0.4, p.r * 0.4), p.z + R(-p.r * 0.4, p.r * 0.4)]);
    VEHICLE_SPOTS.push([p.x + p.r * 0.35, p.z - p.r * 0.2]);
  } else if (p.type === 'market') {
    const cols = [0xe94f37, 0x3d8bfd, 0xf6c445, 0x41b883, 0xa05cff];
    for (let i = 0; i < 12; i++) { const x = p.x + R(-p.r * 0.7, p.r * 0.7), z = p.z + R(-p.r * 0.7, p.r * 0.7); if (Math.hypot(x - p.x, z - p.z) < 8) continue; makeContainer(x, z, rand() < 0.5, pick(cols)); LOOT_SPOTS.push([x + 4.2, z]); }
    makeHouse(p.x, p.z, 12, 10, 0, 0xffe08a, 0x7a4fa0, 'BOOSTERS');
    makeHouse(p.x - 18, p.z + 20, 8, 8, 1, 0xcde7ff, 0xd9534f, 'TCG');
    for (let k = 0; k < 8; k++) makeCrate(p.x + R(-p.r * 0.8, p.r * 0.8), p.z + R(-p.r * 0.8, p.r * 0.8));
    for (let k = 0; k < 4; k++) CHEST_SPOTS.push({ x: p.x + R(-p.r * 0.6, p.r * 0.6), z: p.z + R(-p.r * 0.6, p.r * 0.6), rot: RI(0, 3) });
    VEHICLE_SPOTS.push([p.x + 6, p.z + 14], [p.x - 10, p.z - 16]);
  } else if (p.type === 'farm') {
    makeHouse(p.x, p.z, 14, 10, 0, 0xc0392b, 0x5d3a1a, 'GRANJA');
    makeHouse(p.x + 18, p.z - 10, 8, 7, 3, 0xf2e3c6, 0x3f6fb5, null);
    makeHouse(p.x - 16, p.z - 14, 7, 7, 1, 0xfff1a8, 0x2f8f5b, null);
    for (let k = 0; k < 10; k++) { const x = p.x + R(-p.r, p.r), z = p.z + R(8, p.r); const y = getH(x, z); const hb = cyl(1, 1, 1.4, 12, toon(0xe8c35a), x, y + 0.7, z); hb.rotation.z = Math.PI / 2; addCircle(x, z, 1, y, y + 1.6); }
    // silo
    const sy = getH(p.x - 10, p.z + 4); cyl(2.6, 2.6, 12, 16, toon(0xd8d8e0), p.x - 12, sy + 6, p.z + 6); sph(2.6, toon(0x7a4fa0), p.x - 12, sy + 12, p.z + 6); addCircle(p.x - 12, p.z + 6, 2.6, sy, sy + 14);
    for (let k = 0; k < 5; k++) LOOT_SPOTS.push([p.x + R(-p.r * 0.6, p.r * 0.6), p.z + R(-p.r * 0.6, p.r * 0.6)]);
    VEHICLE_SPOTS.push([p.x + 10, p.z + 14], [p.x - 4, p.z + 18]);
  } else if (p.type === 'lighthouse') {
    const y = p.h;
    for (let k = 0; k < 6; k++) cyl(2.4 - k * 0.2, 2.6 - k * 0.2, 3, 16, toon(k % 2 ? 0xffffff : 0xe03c31), p.x, y + 1.5 + k * 3, p.z);
    cyl(1.8, 1.8, 2, 12, toon(0xfff3a0, { emissive: 0xaa8800 }), p.x, y + 19, p.z); const cap = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2, 12), toon(0xe03c31)); cap.position.set(p.x, y + 21, p.z); scene.add(cap);
    addCircle(p.x, p.z, 2.6, y, y + 22);
    makeHouse(p.x + 9, p.z - 6, 7, 6, 3, 0xcde7ff, 0x3f6fb5, null);
    for (let k = 0; k < 4; k++) LOOT_SPOTS.push([p.x + R(-12, 12), p.z + R(-12, 12)]);
    CHEST_SPOTS.push({ x: p.x - 4, z: p.z + 3, rot: 0 });
  } else if (p.type === 'tower') {
    const y = p.h;
    box(8, 26, 8, toon(0x5a3d8a), p.x, y + 13, p.z); addBox(p.x - 4, y, p.z - 4, p.x + 4, y + 26, p.z + 4);
    for (let k = 0; k < 6; k++) { const w = box(8.06, 0.8, 8.06, toon(0xffd23f, { emissive: 0x554400 }), p.x, y + 3 + k * 4, p.z); w.castShadow = false; }
    const s = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.8), new THREE.MeshBasicMaterial({ map: textTexture('TOP 8', '#2a1747', '#ffd23f') })); s.position.set(p.x, y + 24, p.z + 4.05); scene.add(s);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.6; makeHouse(p.x + Math.cos(a) * 15, p.z + Math.sin(a) * 15, 7, 7, (k + 2) % 4, pick(WALL_COLS), pick(ROOF_COLS), null); }
    VEHICLE_SPOTS.push([p.x + 6, p.z - 12]);
  }
}
// cofres y botín por el mapa
{ let n = 0, tries = 0; while (n < 45 && tries++ < 3000) { const x = R(-HALF * 0.8, HALF * 0.8), z = R(-HALF * 0.8, HALF * 0.8); if (getH(x, z) < 2.5 || inPOI(x, z, 3)) continue; LOOT_SPOTS.push([x, z]); n++; if (n % 4 === 0) CHEST_SPOTS.push({ x: x + 2, z, rot: RI(0, 3) }); } }
{ let n = 0, tries = 0; while (n < 6 && tries++ < 2000) { const x = R(-200, 200), z = R(-200, 200); if (getH(x, z) < 3 || inPOI(x, z, 3) || groundNormal(x, z).y < 0.9) continue; VEHICLE_SPOTS.push([x, z]); n++; } }

// ---------- plataforma del lobby ----------
const LOBBY = new THREE.Group(); LOBBY.position.set(0, 400, 1200); scene.add(LOBBY);
{
  // escenario del creador: callejón en ruinas
  const tex = (draw, rep) => { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); draw(x); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.encoding = THREE.sRGBEncoding; return t; };
  const lr = mulberry32(99), dots = (x, n, cols, r0, r1, a) => { for (let i = 0; i < n; i++) { x.globalAlpha = a * lr(); x.fillStyle = cols[Math.floor(lr() * cols.length)]; x.beginPath(); x.arc(lr() * 512, lr() * 512, r0 + lr() * (r1 - r0), 0, 7); x.fill(); } x.globalAlpha = 1; };
  const conc = tex(x => { x.fillStyle = '#7a7670'; x.fillRect(0, 0, 512, 512); dots(x, 9000, ['#6a6660', '#8a8680', '#5a5650'], 0.5, 1.8, 0.8); dots(x, 60, ['#4a4640', '#5a5045'], 20, 70, 0.25); x.strokeStyle = 'rgba(30,30,30,.6)'; for (let k = 0; k < 6; k++) { x.beginPath(); let px = lr() * 512, py = lr() * 512; x.moveTo(px, py); for (let j = 0; j < 8; j++) { px += (lr() - 0.5) * 70; py += (lr() - 0.5) * 70; x.lineTo(px, py); } x.stroke(); } }, [4, 4]);
  const brick = tex(x => { x.fillStyle = '#5a5048'; x.fillRect(0, 0, 512, 512); for (let r = 0; r < 16; r++) for (let c = -1; c < 7; c++) { const v = lr(); x.fillStyle = `rgb(${110 + v * 40 | 0},${58 + v * 22 | 0},${44 + v * 16 | 0})`; x.fillRect(c * 85 + (r % 2 ? 42 : 0) + 2, r * 32 + 2, 81, 28); } dots(x, 5000, ['#3a2a22', '#8a6a5a'], 0.5, 1.6, 0.5); dots(x, 30, ['#2a2622', '#3a3028'], 20, 50, 0.18); const g = x.createLinearGradient(0, 300, 0, 512); g.addColorStop(0, 'rgba(20,20,10,0)'); g.addColorStop(1, 'rgba(20,24,10,.5)'); x.fillStyle = g; x.fillRect(0, 300, 512, 212); }, [3, 1.5]);
  { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'); x.font = '900 70px Impact, sans-serif'; x.fillStyle = 'rgba(170,20,16,.85)'; x.shadowColor = 'rgba(170,20,16,.8)'; x.shadowBlur = 6; x.fillText('QUEDAN VIVOS?', 18, 88); for (let d = 0; d < 18; d++) x.fillRect(30 + lr() * 440, 88, 3, 8 + lr() * 30); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const gp = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.9 })); gp.position.set(-2.2, 2.6, -2.99); gp.rotation.z = 0.03; LOBBY.add(gp); }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 40), new THREE.MeshStandardMaterial({ map: conc, roughness: 0.95, color: 0xb8b4ae })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; LOBBY.add(floor);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 0.4), new THREE.MeshStandardMaterial({ map: brick, roughness: 0.9, color: 0xc8c0b8 })); wall.position.set(-1, 3, -3.2); wall.receiveShadow = true; LOBBY.add(wall);
  const side = wall.clone(); side.scale.set(0.6, 1, 1); side.rotation.y = Math.PI / 2.4; side.position.set(4.6, 3, -0.6); LOBBY.add(side);
  const M = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
  // bidón con fuego, palés, neumático y valla
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), new THREE.MeshStandardMaterial({ color: 0x6a3a22, roughness: 0.6, metalness: 0.5 })); barrel.position.set(2.2, 0.45, -1.6); barrel.castShadow = true; LOBBY.add(barrel);
  const fl = new THREE.Group(); fl.position.set(2.2, 0.92, -1.6); LOBBY.add(fl); LOBBY.userData.flame = fl; { const fm = new THREE.MeshBasicMaterial({ color: 0xff9a3a, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }); for (let k = 0; k < 7; k++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.06 + lr() * 0.05, 0.25 + lr() * 0.25, 6), fm); f.position.set((lr() - 0.5) * 0.3, 0.15, (lr() - 0.5) * 0.3); f.userData.ph = lr() * 6; fl.add(f); } }
  const fire = new THREE.PointLight(0xff8a3a, 1.6, 7, 2); fire.position.set(2.2, 1.5, -1.4); LOBBY.add(fire); LOBBY.userData.fire = fire;
  for (let k = 0; k < 3; k++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.0), M(0x8a6a48)); pl.position.set(-3.4, 0.07 + k * 0.15, -2.2); pl.rotation.y = k * 0.1; pl.castShadow = true; LOBBY.add(pl); }
  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.12, 10, 20), M(0x1a1a1a)); tire.rotation.x = Math.PI / 2; tire.position.set(-2.4, 0.12, -1.2); tire.castShadow = true; LOBBY.add(tire);
  for (let k = 0; k < 8; k++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15 + lr() * 0.25, 0), M(0x7a7670)); r.position.set(-4 + lr() * 8, 0.1, -2.6 + lr() * 1.2); r.rotation.set(lr() * 3, lr() * 3, 0); r.castShadow = true; LOBBY.add(r); }
}
