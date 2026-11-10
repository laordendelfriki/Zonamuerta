// ===== Personas: cuerpo continuo con skinning suave, cabeza esculpida y cara pintada =====
// Sirve para los zombis, el superviviente, los compañeros y el creador de personaje. Los brazos en 1ª persona van aparte (fpArm).
const HUMAN = (() => {
  const hr = mulberry32(4242);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
  // colores en sRGB como enteros (sin pasar por THREE.Color, que convierte a lineal)
  function hex(c) { return typeof c === 'string' ? parseInt(c.replace('#', ''), 16) : c; }
  function mixHex(a, b, t) { a = hex(a); b = hex(b); let o = 0; for (const sh of [16, 8, 0]) { const x = (a >> sh) & 255, y = (b >> sh) & 255; o |= Math.round(x + (y - x) * t) << sh; } return o; }
  const dull = (c, t = 0.35) => mixHex(c, 0x5a5850, t);
  const shade = (c, k) => mixHex(c, k < 0 ? 0x000000 : 0xffffff, Math.abs(k));
  const css = (h, a = 1) => `rgba(${(h >> 16) & 255},${(h >> 8) & 255},${h & 255},${a})`;
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;

  // ---------- cara pintada (ojos, cejas, boca, barba, heridas) ----------
  function paintFace(x, S, pad, o) {
    const W = S - 2 * pad, k = W / 256, PX = u => pad + u * W, PY = v => pad + (1 - v) * W, rnd = mulberry32(o.seed || 7);
    const Z = o.zombie, F = o.sex === 'f', skin = o.skin, dark = mixHex(skin, Z ? 0x1e1a18 : 0x5a2a1e, Z ? 0.6 : 0.45), old = o.age === 2;
    x.fillStyle = css(skin); x.fillRect(0, 0, S, S);
    for (let i = 0; i < 700 * k * k; i++) { x.globalAlpha = 0.05 * rnd(); x.fillStyle = rnd() < 0.5 ? '#fff' : css(dark); x.fillRect(rnd() * S, rnd() * S, 1.6 * k, 1.6 * k); } x.globalAlpha = 1;
    const soft = (u, v, r, col, a) => { const g = x.createRadialGradient(PX(u), PY(v), 0, PX(u), PY(v), r * W); g.addColorStop(0, css(col, a)); g.addColorStop(1, css(col, 0)); x.fillStyle = g; x.fillRect(PX(u) - r * W, PY(v) - r * W, 2 * r * W, 2 * r * W); };
    // volumen
    for (const s of [-1, 1]) { const g = x.createLinearGradient(PX(0.5 + s * 0.5), 0, PX(0.5 + s * 0.2), 0); g.addColorStop(0, css(dark, 0.4)); g.addColorStop(1, css(dark, 0)); x.fillStyle = g; x.fillRect(s < 0 ? 0 : PX(0.7), 0, PX(0.3), S); }
    { const g = x.createLinearGradient(0, PY(0), 0, PY(0.2)); g.addColorStop(0, css(dark, 0.45)); g.addColorStop(1, css(dark, 0)); x.fillStyle = g; x.fillRect(0, PY(0.2), S, S); }
    if (!Z) { const bl = mixHex(skin, 0xd05a5a, 0.5); soft(0.3, 0.45, 0.12, bl, F ? 0.24 : 0.12); soft(0.7, 0.45, 0.12, bl, F ? 0.24 : 0.12); soft(0.5, 0.48, 0.05, bl, 0.14); soft(0.5, 0.84, 0.25, 0xffffff, 0.07); }
    else { soft(0.3, 0.45, 0.13, dark, 0.35); soft(0.7, 0.45, 0.13, dark, 0.35); }
    for (const s of [-1, 1]) soft(0.5 + s * 0.142, 0.615, Z ? 0.125 : 0.09, Z ? 0x100a0c : dark, Z ? 0.9 : 0.32);
    // ---- ojos ----
    for (const s of [-1, 1]) {
      const cx = PX(0.5 + s * 0.142), cy = PY(0.612), ew = (F ? 0.066 : 0.062) * W, eh = (F ? 0.031 : 0.026) * W * (old ? 0.86 : 1) * (Z ? 1.12 : 1);
      const ix = cx - s * ew, ox = cx + s * ew, iy = cy + eh * 0.25, oy = cy - eh * 0.15;
      x.save(); x.beginPath(); x.moveTo(ix, iy); x.quadraticCurveTo(cx - s * ew * 0.1, cy - eh * 1.55, ox, oy); x.quadraticCurveTo(cx + s * ew * 0.1, cy + eh * 1.35, ix, iy); x.closePath(); x.clip();
      const dead = Z && rnd() < 0.25;
      x.fillStyle = dead ? '#3a0c0a' : Z ? '#c4bfa4' : '#f4f2ed'; x.fillRect(cx - ew * 1.2, cy - eh * 2, ew * 2.4, eh * 4);
      if (Z && !dead) { x.strokeStyle = 'rgba(120,20,16,.55)'; x.lineWidth = 0.8 * k; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(cx + (rnd() - 0.5) * ew * 2, cy + (rnd() - 0.5) * eh * 2); x.lineTo(cx + (rnd() - 0.5) * ew, cy + (rnd() - 0.5) * eh); x.stroke(); } }
      const ir = eh * 1.12, icx = cx + (Z ? (rnd() - 0.5) * ew * 0.5 : 0), icy = cy - eh * 0.12, ec = Z ? 0xa8aaa0 : o.eye;
      if (!dead) { const g = x.createRadialGradient(icx, icy, ir * 0.15, icx, icy, ir); g.addColorStop(0, css(mixHex(ec, 0xffffff, Z ? 0.35 : 0.3))); g.addColorStop(0.7, css(ec)); g.addColorStop(1, css(mixHex(ec, 0x000000, Z ? 0.3 : 0.65))); x.fillStyle = g; x.beginPath(); x.arc(icx, icy, ir * (Z ? 0.8 : 1), 0, 7); x.fill();
        x.fillStyle = Z ? 'rgba(70,70,64,.5)' : '#090707'; x.beginPath(); x.arc(icx, icy, ir * (Z ? 0.22 : 0.42), 0, 7); x.fill(); }
      const lg = x.createLinearGradient(0, cy - eh * 1.4, 0, cy + eh * 0.4); lg.addColorStop(0, 'rgba(20,10,10,.6)'); lg.addColorStop(1, 'rgba(20,10,10,0)'); x.fillStyle = lg; x.fillRect(cx - ew * 1.2, cy - eh * 2, ew * 2.4, eh * 3);
      if (!Z) { x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.arc(icx - ir * 0.36, icy - ir * 0.3, ir * 0.2, 0, 7); x.fill(); }
      x.restore();
      x.lineCap = 'round'; x.strokeStyle = css(Z ? 0x140c0e : mixHex(o.brow, 0x140a08, 0.75), 0.95); x.lineWidth = (F ? 3.4 : 2.4) * k;
      x.beginPath(); x.moveTo(ix, iy); x.quadraticCurveTo(cx - s * ew * 0.1, cy - eh * 1.55, ox, oy); x.stroke();
      if (F && !Z) { x.lineWidth = 2.2 * k; x.beginPath(); x.moveTo(ox, oy); x.lineTo(ox + s * ew * 0.3, oy - eh * 0.6); x.stroke(); }
      x.strokeStyle = css(dark, 0.5); x.lineWidth = 1.3 * k; x.beginPath(); x.moveTo(ix, iy); x.quadraticCurveTo(cx + s * ew * 0.1, cy + eh * 1.35, ox, oy); x.stroke();
      x.strokeStyle = css(dark, 0.42); x.beginPath(); x.moveTo(ix + s * ew * 0.15, cy - eh * 1.3); x.quadraticCurveTo(cx, cy - eh * 2.3, ox + s * ew * 0.08, cy - eh * 0.95); x.stroke();
      if (old || Z) { x.strokeStyle = css(dark, Z ? 0.6 : 0.4); x.beginPath(); x.moveTo(ix + s * ew * 0.2, cy + eh * 1.6); x.quadraticCurveTo(cx, cy + eh * 2.6, ox - s * ew * 0.1, cy + eh * 1.4); x.stroke(); }
      if (old) { x.strokeStyle = css(dark, 0.35); for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(ox + s * 3 * k, oy + i * 2 * k); x.lineTo(ox + s * 11 * k, oy + i * 6 * k - 2 * k); x.stroke(); } }
    }
    // ---- cejas ----
    if (!Z || rnd() < 0.5) for (const s of [-1, 1]) {
      const th = (F ? 0.013 : 0.023) * W, tilt = Z ? -0.014 : F ? 0.006 : 0;
      const x0 = PX(0.5 + s * 0.066), y0 = PY(0.69 + tilt), x1 = PX(0.5 + s * 0.24), y1 = PY(0.692), mx = PX(0.5 + s * 0.165), my = PY(0.73 + (F ? 0.008 : 0));
      x.fillStyle = css(Z ? 0x2a2622 : mixHex(o.brow, 0x140a06, 0.3), Z ? 0.55 : 0.96); x.beginPath(); x.moveTo(x0, y0 - th * 0.5); x.quadraticCurveTo(mx, my - th * 0.55, x1, y1); x.quadraticCurveTo(mx, my + th * 0.45, x0, y0 + th * 0.5); x.closePath(); x.fill();
    }
    // ---- nariz ----
    if (o.noNose) { x.fillStyle = '#0c0404'; x.beginPath(); x.ellipse(PX(0.5), PY(0.48), 0.045 * W, 0.06 * W, 0, 0, 7); x.fill(); soft(0.5, 0.48, 0.09, 0x5a0c08, 0.6); }
    else { for (const s of [-1, 1]) { x.fillStyle = css(Z ? 0x0c0606 : mixHex(dark, 0x200808, 0.5), Z ? 0.9 : 0.62); x.beginPath(); x.ellipse(PX(0.5 + s * 0.047), PY(0.436), 0.02 * W, 0.0105 * W, s * 0.3, 0, 7); x.fill(); soft(0.5 + s * 0.075, 0.55, 0.05, dark, 0.14); } soft(0.5, 0.4, 0.07, dark, 0.22); }
    // ---- boca ----
    const my = PY(0.352), mcx = PX(0.5);
    if (!Z) {
      const mw = (F ? 0.098 : 0.108) * W, lh = (F ? 0.03 : 0.021) * W, lipU = mixHex(skin, F ? 0xb0343c : 0x9a4a44, F ? 0.62 : 0.36), lipL = mixHex(skin, F ? 0xc8484e : 0xa85a52, F ? 0.56 : 0.3);
      for (const s of [-1, 1]) { x.strokeStyle = css(dark, old ? 0.42 : 0.17); x.lineWidth = 1.4 * k; x.beginPath(); x.moveTo(PX(0.5 + s * 0.078), PY(0.445)); x.quadraticCurveTo(PX(0.5 + s * 0.13), PY(0.4), PX(0.5 + s * 0.135), PY(0.325)); x.stroke(); }
      x.fillStyle = css(lipU); x.beginPath(); x.moveTo(mcx - mw, my); x.quadraticCurveTo(mcx - mw * 0.45, my - lh * 0.95, mcx - mw * 0.12, my - lh * 0.82); x.quadraticCurveTo(mcx, my - lh * 0.5, mcx + mw * 0.12, my - lh * 0.82); x.quadraticCurveTo(mcx + mw * 0.45, my - lh * 0.95, mcx + mw, my); x.quadraticCurveTo(mcx, my + lh * 0.2, mcx - mw, my); x.fill();
      x.fillStyle = css(lipL); x.beginPath(); x.moveTo(mcx - mw * 0.92, my); x.quadraticCurveTo(mcx, my + lh * 2.3, mcx + mw * 0.92, my); x.quadraticCurveTo(mcx, my + lh * 0.25, mcx - mw * 0.92, my); x.fill();
      soft(0.5, 0.33, 0.035, 0xffffff, F ? 0.22 : 0.1);
      x.strokeStyle = css(mixHex(lipU, 0x200808, 0.7), 0.9); x.lineWidth = 1.7 * k; x.beginPath(); x.moveTo(mcx - mw, my - 1.2 * k); x.quadraticCurveTo(mcx, my + lh * 0.4, mcx + mw, my - 1.2 * k); x.stroke();
      soft(0.5, 0.285, 0.06, dark, 0.22); soft(0.5, 0.4, 0.02, dark, 0.12);
      if (old) { x.strokeStyle = css(dark, 0.3); x.lineWidth = 1.3 * k; for (const v of [0.8, 0.84, 0.88]) { x.beginPath(); x.moveTo(PX(0.3), PY(v)); x.quadraticCurveTo(PX(0.5), PY(v + 0.012), PX(0.7), PY(v)); x.stroke(); } }
      // barba pintada
      const bs = o.beard, bc = mixHex(o.brow, 0x140a06, 0.15);
      if (bs && bs !== 'none') {
        const inB = (u, v) => { const d = Math.abs(u - 0.5); if (v > 0.3 && v < 0.378 && d < 0.118) return false; const mous = v > 0.372 && v < 0.432 && d < 0.14, chin = v < 0.3 && d < 0.2 + (0.3 - v) * 1.1, link = d > 0.11 && d < 0.175 && v > 0.24 && v < 0.4, jaw = v < 0.13 + d * 0.82 && v < 0.5;
          if (bs === 'mous') return mous; if (bs === 'goatee') return mous || (chin && v > 0.1) || link; return mous || chin || link || jaw; };
        const a = bs === 'stub' ? 0.3 : 0.95, step = bs === 'stub' ? 2.3 * k : 1.3 * k; x.fillStyle = css(bc);
        for (let py = PY(0.52); py < S; py += step) for (let px = 0; px < S; px += step) { const u = (px - pad) / W + (rnd() - 0.5) * 0.012, v = 1 - (py - pad) / W + (rnd() - 0.5) * 0.012; if (!inB(u, v)) continue; x.globalAlpha = a * (0.55 + 0.45 * rnd()); x.fillRect(px + (rnd() - 0.5) * step, py + (rnd() - 0.5) * step, step * 1.15, step * 1.5); }
        x.globalAlpha = 1;
      }
    } else {
      // boca abierta con dientes, sangre y podredumbre
      const mh = 0.05 * W * (0.8 + rnd() * 0.5), mw = 0.118 * W, cy = PY(0.342);
      soft(0.5, 0.33, 0.17, 0x4a0806, 0.55);
      x.save(); x.beginPath(); x.ellipse(mcx, cy, mw, mh, 0, 0, 7); x.clip(); x.fillStyle = '#0e0303'; x.fillRect(mcx - mw, cy - mh, mw * 2, mh * 2);
      x.fillStyle = '#521412'; x.fillRect(mcx - mw, cy - mh, mw * 2, mh * 0.42); x.fillRect(mcx - mw, cy + mh * 0.6, mw * 2, mh * 0.4);
      const tw = mw * 0.21; for (let t = -4; t <= 4; t++) { if (rnd() < 0.86) { x.fillStyle = ['#d8cfa8', '#c4b88c', '#e0d8b8', '#b0a47c'][Math.floor(rnd() * 4)]; x.fillRect(mcx + t * tw - tw * 0.42, cy - mh * 0.72, tw * 0.84, mh * 0.62); } if (rnd() < 0.8) { x.fillStyle = ['#c8bf98', '#b4a880', '#a89c74'][Math.floor(rnd() * 3)]; x.fillRect(mcx + t * tw * 0.92 - tw * 0.38, cy + mh * 0.18, tw * 0.76, mh * 0.55); } }
      x.restore();
      for (let i = 0; i < 12; i++) soft(0.5 + (rnd() - 0.5) * 0.3, 0.31 + (rnd() - 0.6) * 0.16, 0.02 + rnd() * 0.04, 0x400806, 0.75);
      x.fillStyle = 'rgba(64,8,6,.85)'; for (let i = 0; i < 5; i++) x.fillRect(PX(0.5 + (rnd() - 0.5) * 0.2), cy, (1.5 + rnd() * 2.5) * k, (0.08 + rnd() * 0.22) * W);
      x.strokeStyle = 'rgba(52,44,70,.5)'; for (let i = 0; i < 9; i++) { let px = PX(0.15 + rnd() * 0.7), py = PY(0.15 + rnd() * 0.75), a = rnd() * 6.28; x.lineWidth = 1.4 * k; x.beginPath(); x.moveTo(px, py); for (let j = 0; j < 9; j++) { a += (rnd() - 0.5) * 1.1; px += Math.cos(a) * 6 * k; py += Math.sin(a) * 6 * k; x.lineTo(px, py); } x.stroke(); }
      for (let i = 0; i < 5; i++) soft(0.2 + rnd() * 0.6, 0.15 + rnd() * 0.7, 0.04 + rnd() * 0.06, [0x4a3a52, 0x5a5a30, 0x3a2a2a][Math.floor(rnd() * 3)], 0.4);
      if (rnd() < 0.6) { const u = 0.25 + rnd() * 0.5, v = 0.75 + rnd() * 0.15; soft(u, v, 0.07, 0x4a0806, 0.9); x.strokeStyle = 'rgba(30,4,4,.9)'; x.lineWidth = 2 * k; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(PX(u - 0.06), PY(v + i * 0.022 + 0.02)); x.lineTo(PX(u + 0.07), PY(v + i * 0.022 - 0.02)); x.stroke(); } }
      if (rnd() < 0.5) { const s = rnd() < 0.5 ? -1 : 1; soft(0.5 + s * 0.24, 0.42, 0.075, 0x3a0605, 0.95); x.fillStyle = '#c8bf98'; for (let t = 0; t < 3; t++) x.fillRect(PX(0.5 + s * (0.2 + t * 0.03)), PY(0.41), 5 * k, 7 * k); }
    }
  }

  // ---------- atlas compartido: ropa, piel, pelo y cabezas de zombi ----------
  const CELL = 256, AW = 2048, AH = 1024, PAD = 5;
  const CI = { jacket: 0, hoodie: 1, track: 2, overalls: 3, military: 4, hivis: 5, shirt: 6, scrubs: 7, sleeve: 8, pants: 9, pelvis: 10, skin: 11, hair: 12, gear: 13, white: 14, zhead: 16 };
  const ZT = [0xa8aa98, 0x98a08c, 0xb4ac9c, 0x8c9484, 0xa49890, 0xbab4a6, 0x948c80, 0x88806e];
  function cellUV(i, u, v) { const cx = (i % 8) * CELL, cy = Math.floor(i / 8) * CELL, W = CELL - 2 * PAD; return [(cx + PAD + u * W) / AW, 1 - (cy + PAD + (1 - v) * W) / AH]; }
  function mkAtlas(zombie) {
    const c = document.createElement('canvas'); c.width = AW; c.height = AH; const x = c.getContext('2d'); x.fillStyle = '#f0eeea'; x.fillRect(0, 0, AW, AH);
    const W = CELL - 2 * PAD, PX = u => PAD + u * W, PY = v => PAD + (1 - v) * W, R = (a, b) => a + (b - a) * hr();
    const cell = (i, fn) => { x.save(); x.translate((i % 8) * CELL, Math.floor(i / 8) * CELL); x.beginPath(); x.rect(0, 0, CELL, CELL); x.clip(); fn(); x.restore(); x.globalAlpha = 1; };
    const line = (pts, w = 1.5, a = 0.4, col = '#000') => { x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(PX(p[0]), PY(p[1])) : x.moveTo(PX(p[0]), PY(p[1]))); x.stroke(); x.globalAlpha = 1; };
    const poly = (pts, a, col = '#000') => { x.globalAlpha = a; x.fillStyle = col; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(PX(p[0]), PY(p[1])) : x.moveTo(PX(p[0]), PY(p[1]))); x.closePath(); x.fill(); x.globalAlpha = 1; };
    const box = (u, v, w, h, a = 0.45, lw = 1.5, fa = 0.07) => { x.globalAlpha = fa; x.fillStyle = '#000'; x.fillRect(PX(u - w / 2), PY(v + h / 2), w * W, h * W); x.globalAlpha = a; x.strokeStyle = '#000'; x.lineWidth = lw; x.strokeRect(PX(u - w / 2), PY(v + h / 2), w * W, h * W); x.globalAlpha = 1; };
    const dot = (u, v, r, a = 0.6, col = '#000') => { x.globalAlpha = a; x.fillStyle = col; x.beginPath(); x.arc(PX(u), PY(v), r, 0, 7); x.fill(); x.globalAlpha = 1; };
    const shd = (u, v, r, a, col = '0,0,0') => { const g = x.createRadialGradient(PX(u), PY(v), 0, PX(u), PY(v), r * W); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(PX(u) - r * W, PY(v) - r * W, 2 * r * W, 2 * r * W); };
    const cloth = (weave = 3) => { x.fillStyle = zombie ? '#e2ded6' : '#f1efeb'; x.fillRect(0, 0, CELL, CELL); x.globalAlpha = 0.055; x.strokeStyle = '#000'; x.lineWidth = 1; for (let i = 0; i < CELL; i += weave) { x.beginPath(); x.moveTo(0, i); x.lineTo(CELL, i); x.moveTo(i, 0); x.lineTo(i, CELL); x.stroke(); } x.globalAlpha = 1; for (let i = 0; i < 700; i++) { x.globalAlpha = 0.35 * hr(); x.fillStyle = ['#ffffff', '#d8d4cc', '#cfcac2'][i % 3]; x.fillRect(hr() * CELL, hr() * CELL, 1.5, 1.5); } x.globalAlpha = 1; };
    const wrinkles = (n, a = 0.13, horiz) => { for (let i = 0; i < n; i++) { const u = R(0.05, 0.95), v = R(0.08, 0.92), du = horiz ? R(0.08, 0.2) : R(-0.05, 0.05), dv = horiz ? R(-0.03, 0.03) : R(0.08, 0.2); x.globalAlpha = a * R(0.5, 1); x.strokeStyle = '#000'; x.lineWidth = R(1, 2.4); x.beginPath(); x.moveTo(PX(u), PY(v)); x.quadraticCurveTo(PX(u + du * 0.5 + R(-0.03, 0.03)), PY(v + dv * 0.5 + R(-0.03, 0.03)), PX(u + du), PY(v + dv)); x.stroke(); } x.globalAlpha = 1; };
    const rot = (k = 1) => { if (!zombie) return;
      for (let i = 0; i < 12 * k; i++) shd(R(0, 1), R(0, 1), R(0.06, 0.18), R(0.12, 0.3), '70,60,44');
      for (let i = 0; i < 7 * k; i++) shd(R(0.05, 0.95), R(0.05, 0.95), R(0.04, 0.13), R(0.55, 0.85), '66,10,6');
      x.fillStyle = 'rgba(66,10,6,.8)'; for (let i = 0; i < 6 * k; i++) x.fillRect(PX(R(0.05, 0.95)), PY(R(0.3, 0.95)), R(1.5, 4), R(15, 70));
      for (let i = 0; i < 6 * k; i++) { const u = R(0.05, 0.95), v = R(0.05, 0.95), r = R(3, 8); dot(u, v, r, 0.9, '#14100c'); for (let j = 0; j < 6; j++) line([[u, v], [u + R(-0.05, 0.05), v + R(-0.05, 0.05)]], 1, 0.6, '#14100c'); }
      for (let i = 0; i < 4 * k; i++) { const u = R(0.1, 0.9), v = R(0.1, 0.9), a = R(0, 3); for (let j = -1; j <= 1; j++) line([[u + j * 0.015, v], [u + j * 0.015 + Math.cos(a) * 0.12, v + Math.sin(a) * 0.12]], 1.6, 0.6, '#2a0806'); } };
    const common = (seams = true) => { if (seams) { line([[0.25, 0], [0.25, 0.86]], 1, 0.2); line([[0.75, 0], [0.75, 0.86]], 1, 0.2); } shd(0.25, 0.97, 0.15, 0.32); shd(0.75, 0.97, 0.15, 0.32); const g = x.createLinearGradient(0, PY(0.3), 0, PY(0)); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.14)'); x.fillStyle = g; x.fillRect(0, PY(0.3), CELL, CELL); };
    const hem = (v = 0.07) => { line([[0, v], [1, v]], 1.4, 0.4); for (let u = 0; u < 1; u += 0.018) line([[u, 0], [u, v]], 1, 0.13); };
    const zip = () => { line([[0.5, 0], [0.5, 0.97]], 3.2, 0.55); for (let v = 0.01; v < 0.97; v += 0.016) line([[0.489, v], [0.511, v]], 1, 0.35, '#fff'); box(0.5, 0.9, 0.022, 0.035, 0.7, 1.2, 0.4); };
    const pocket = (u, v, w, h, flap = true) => { box(u, v, w, h, 0.42, 1.4, 0.05); if (flap) { poly([[u - w / 2, v + h / 2], [u + w / 2, v + h / 2], [u + w / 2, v + h * 0.18], [u, v + h * 0.08], [u - w / 2, v + h * 0.18]], 0.1); line([[u - w / 2, v + h * 0.18], [u, v + h * 0.08], [u + w / 2, v + h * 0.18]], 1.3, 0.45); dot(u, v + h * 0.2, 2, 0.5); } };
    cell(CI.jacket, () => { cloth(); common(); wrinkles(10); hem(); zip(); poly([[0.5, 0.8], [0.4, 1], [0.46, 1]], 0.16); poly([[0.5, 0.8], [0.6, 1], [0.54, 1]], 0.16); line([[0.5, 0.8], [0.4, 1]], 1.6, 0.5); line([[0.5, 0.8], [0.6, 1]], 1.6, 0.5); pocket(0.36, 0.63, 0.12, 0.11); pocket(0.64, 0.63, 0.12, 0.11); line([[0.31, 0.3], [0.37, 0.13]], 1.6, 0.45); line([[0.69, 0.3], [0.63, 0.13]], 1.6, 0.45); line([[0.02, 0.84], [0.25, 0.9]], 1, 0.25); line([[0.98, 0.84], [0.75, 0.9]], 1, 0.25); rot(); });
    cell(CI.hoodie, () => { cloth(2); common(false); wrinkles(12); hem(0.09); shd(0.5, 1.0, 0.24, 0.42); x.globalAlpha = 0.08; x.fillStyle = '#000'; x.beginPath(); x.moveTo(PX(0.33), PY(0.11)); x.lineTo(PX(0.67), PY(0.11)); x.lineTo(PX(0.61), PY(0.37)); x.lineTo(PX(0.39), PY(0.37)); x.closePath(); x.fill(); x.globalAlpha = 1; line([[0.33, 0.11], [0.39, 0.37], [0.61, 0.37], [0.67, 0.11]], 1.6, 0.5); line([[0.35, 0.14], [0.385, 0.3]], 3, 0.25); line([[0.65, 0.14], [0.615, 0.3]], 3, 0.25); for (const s of [-1, 1]) { line([[0.5 + s * 0.03, 0.92], [0.5 + s * 0.04, 0.62]], 4, 0.45); line([[0.5 + s * 0.03, 0.92], [0.5 + s * 0.04, 0.62]], 2, 0.95, '#ffffff'); dot(0.5 + s * 0.04, 0.61, 2.5, 0.7); } rot(); });
    cell(CI.track, () => { cloth(2); common(); wrinkles(8, 0.1); hem(0.08); zip(); x.globalAlpha = 0.2; x.fillStyle = '#000'; x.fillRect(0, PY(0.74), CELL, 0.09 * W); x.globalAlpha = 1; line([[0, 0.76], [1, 0.76]], 1.6, 0.9, '#ffffff'); line([[0, 0.63], [1, 0.63]], 1.6, 0.9, '#ffffff'); for (let u = 0.3; u < 0.7; u += 0.016) line([[u, 0.93], [u, 1]], 1, 0.16); line([[0.3, 0.93], [0.7, 0.93]], 1.3, 0.4); rot(); });
    cell(CI.overalls, () => { cloth(); common(); wrinkles(10); x.globalAlpha = 0.5; x.strokeStyle = '#000'; x.lineWidth = 1.8; x.beginPath(); x.ellipse(PX(0.5), PY(0.99), 0.1 * W, 0.06 * W, 0, 0, Math.PI); x.stroke(); x.globalAlpha = 1; rot(); });
    cell(CI.military, () => { cloth(2); for (let i = 0; i < 46; i++) { x.globalAlpha = R(0.1, 0.24); x.fillStyle = '#000'; x.beginPath(); x.ellipse(R(0, CELL), R(0, CELL), R(8, 26), R(5, 15), R(0, 3), 0, 7); x.fill(); } x.globalAlpha = 1; common(); wrinkles(8); line([[0.485, 0], [0.485, 0.95]], 1.3, 0.4); line([[0.515, 0], [0.515, 0.95]], 1.3, 0.4); for (let v = 0.12; v < 0.9; v += 0.15) dot(0.5, v, 2.2, 0.55); pocket(0.36, 0.66, 0.13, 0.12); pocket(0.64, 0.66, 0.13, 0.12); pocket(0.35, 0.24, 0.14, 0.14); pocket(0.65, 0.24, 0.14, 0.14); poly([[0.47, 0.93], [0.36, 1], [0.44, 1]], 0.18); poly([[0.53, 0.93], [0.64, 1], [0.56, 1]], 0.18); box(0.13, 0.93, 0.1, 0.035, 0.4, 1.2, 0.1); box(0.87, 0.93, 0.1, 0.035, 0.4, 1.2, 0.1); line([[0, 0.06], [1, 0.06]], 5, 0.5); rot(); });
    cell(CI.hivis, () => { cloth(); common(); wrinkles(9); x.globalAlpha = 0.5; x.strokeStyle = '#000'; x.lineWidth = 1.8; x.beginPath(); x.ellipse(PX(0.5), PY(0.99), 0.1 * W, 0.06 * W, 0, 0, Math.PI); x.stroke(); x.globalAlpha = 1; rot(); });
    cell(CI.shirt, () => { cloth(2); common(); wrinkles(12, 0.1); line([[0.482, 0], [0.482, 0.93]], 1.2, 0.35); line([[0.518, 0], [0.518, 0.93]], 1.2, 0.35); for (let v = 0.1; v < 0.92; v += 0.13) { dot(0.5, v, 2.6, 0.55); dot(0.5, v, 1.2, 0.9, '#fff'); } poly([[0.5, 0.9], [0.38, 0.93], [0.42, 1], [0.5, 1]], 0.13); poly([[0.5, 0.9], [0.62, 0.93], [0.58, 1], [0.5, 1]], 0.13); line([[0.5, 0.9], [0.38, 0.93], [0.42, 1]], 1.5, 0.5); line([[0.5, 0.9], [0.62, 0.93], [0.58, 1]], 1.5, 0.5); pocket(0.63, 0.64, 0.11, 0.11, false); line([[0.02, 0.08], [0.25, 0.03], [0.5, 0.08], [0.75, 0.03], [0.98, 0.08]], 1.3, 0.35); rot(); });
    cell(CI.scrubs, () => { cloth(2); common(); wrinkles(10, 0.1); poly([[0.5, 0.74], [0.41, 1], [0.59, 1]], 0.38); line([[0.41, 1], [0.5, 0.74], [0.59, 1]], 2.4, 0.5); line([[0.395, 1], [0.5, 0.7], [0.605, 1]], 1.2, 0.3); pocket(0.37, 0.6, 0.11, 0.1, false); pocket(0.36, 0.2, 0.15, 0.14, false); pocket(0.64, 0.2, 0.15, 0.14, false); line([[0, 0.04], [1, 0.04]], 1.3, 0.35); rot(); });
    cell(CI.sleeve, () => { cloth(); wrinkles(14, 0.14, true); for (let i = 0; i < 7; i++) { const v = R(0.38, 0.52); line([[R(0.3, 0.5), v], [R(0.55, 0.8), v + R(-0.03, 0.03)]], R(1.2, 2.5), 0.2); } line([[0, 0.09], [1, 0.09]], 1.5, 0.45); for (let u = 0; u < 1; u += 0.03) line([[u, 0], [u, 0.09]], 1, 0.13); line([[0, 0.5], [0.02, 0.5]], 1, 0); line([[0.0, 0], [0.0, 1]], 1.2, 0.2); rot(); });
    cell(CI.pants, () => { cloth(2); line([[0.25, 0], [0.25, 1]], 1.3, 0.3); line([[0.75, 0], [0.75, 1]], 1.3, 0.3); line([[0.235, 0], [0.235, 1]], 0.8, 0.18); wrinkles(8, 0.12, true); for (let i = 0; i < 6; i++) { const v = R(0.5, 0.62); line([[R(0.3, 0.45), v], [R(0.55, 0.7), v + R(-0.02, 0.02)]], R(1.2, 2.4), 0.2); } for (let i = 0; i < 4; i++) { const v = R(0.03, 0.14); line([[R(0.1, 0.4), v], [R(0.6, 0.9), v + R(-0.02, 0.02)]], 1.6, 0.2); } line([[0, 0.035], [1, 0.035]], 1.3, 0.4); shd(0.5, 0.56, 0.16, 0.1, '255,255,255'); rot(); });
    cell(CI.pelvis, () => { cloth(2); x.globalAlpha = 0.62; x.fillStyle = '#1a1410'; x.fillRect(0, PY(0.98), CELL, 0.2 * W); x.globalAlpha = 1; line([[0, 0.78], [1, 0.78]], 1.2, 0.5); x.fillStyle = '#b8b4a8'; x.fillRect(PX(0.46), PY(0.965), 0.08 * W, 0.17 * W); x.strokeStyle = 'rgba(0,0,0,.7)'; x.lineWidth = 1.6; x.strokeRect(PX(0.46), PY(0.965), 0.08 * W, 0.17 * W); x.fillStyle = '#1a1410'; x.fillRect(PX(0.485), PY(0.93), 0.03 * W, 0.1 * W); for (const u of [0.33, 0.67, 0.12, 0.88]) box(u, 0.88, 0.025, 0.22, 0.5, 1, 0.25); line([[0.5, 0.78], [0.5, 0.2]], 1.6, 0.4); line([[0.52, 0.76], [0.53, 0.45], [0.5, 0.4]], 1.2, 0.3); line([[0.3, 0.78], [0.33, 0.6], [0.4, 0.52]], 1.5, 0.42); line([[0.7, 0.78], [0.67, 0.6], [0.6, 0.52]], 1.5, 0.42); box(0.1, 0.5, 0.13, 0.26, 0.4, 1.3, 0.05); box(0.9, 0.5, 0.13, 0.26, 0.4, 1.3, 0.05); line([[0.25, 0], [0.25, 0.78]], 1.2, 0.28); line([[0.75, 0], [0.75, 0.78]], 1.2, 0.28); wrinkles(5, 0.1, true); rot(0.6); });
    cell(CI.skin, () => { x.fillStyle = zombie ? '#dedcd4' : '#f6f3ef'; x.fillRect(0, 0, CELL, CELL); for (let i = 0; i < 1500; i++) { x.globalAlpha = 0.3 * hr(); x.fillStyle = zombie ? ['#ffffff', '#c8c8be', '#d0ccc4'][i % 3] : ['#ffffff', '#ece4dc', '#f8f0ea'][i % 3]; x.fillRect(hr() * CELL, hr() * CELL, 1.4, 1.4); } x.globalAlpha = 1;
      if (zombie) { x.strokeStyle = '#3a3a5a'; for (let i = 0; i < 26; i++) { let px = hr() * CELL, py = hr() * CELL, a = hr() * 6.28; x.globalAlpha = 0.5 * R(0.4, 1); x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); for (let j = 0; j < 12; j++) { a += (hr() - 0.5) * 0.9; px += Math.cos(a) * 6; py += Math.sin(a) * 6; x.lineTo(px, py); } x.stroke(); } x.globalAlpha = 1; for (let i = 0; i < 14; i++) shd(R(0, 1), R(0, 1), R(0.05, 0.13), 0.4, ['90,70,96', '110,104,60', '80,62,74'][i % 3]); for (let i = 0; i < 10; i++) shd(R(0, 1), R(0, 1), R(0.02, 0.07), 0.8, '60,10,8'); } });
    cell(CI.hair, () => { x.fillStyle = '#dcdcdc'; x.fillRect(0, 0, CELL, CELL); for (let i = 0; i < 420; i++) { const px = hr() * CELL; x.globalAlpha = hr() < 0.72 ? R(0.08, 0.34) : R(0.3, 0.7); x.strokeStyle = hr() < 0.72 ? '#000' : '#fff'; x.lineWidth = R(0.8, 2.6); x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + R(-10, 10), 80, px + R(-12, 12), 170, px + R(-8, 8), CELL); x.stroke(); } x.globalAlpha = 1; const g = x.createLinearGradient(0, 60, 0, 130); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 60, CELL, 70); if (zombie) { for (let i = 0; i < 8; i++) shd(R(0, 1), R(0, 1), R(0.05, 0.12), 0.5, '50,14,10'); } });
    cell(CI.gear, () => { cloth(4); for (let i = 0; i < 6; i++) line([[0, R(0.1, 0.9)], [1, R(0.1, 0.9)]], 1, 0.12); wrinkles(6, 0.1); line([[0.05, 0.5], [0.95, 0.5]], 1.4, 0.3); for (let u = 0.06; u < 0.95; u += 0.04) line([[u, 0.49], [u + 0.02, 0.49]], 1, 0.5, '#fff'); if (zombie) rot(0.5); });
    cell(CI.white, () => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, CELL, CELL); });
    if (zombie) for (let t = 0; t < 8; t++) { x.save(); x.translate((t % 8) * CELL, 2 * CELL); x.beginPath(); x.rect(0, 0, CELL, CELL); x.clip(); paintFace(x, CELL, PAD, { zombie: true, skin: ZT[t], seed: 100 + t * 17, noNose: t === 3 || t === 6, sex: t % 2 ? 'f' : 'm', brow: 0x2a2622 }); x.restore(); }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }
  const ATZ = mkAtlas(true), ATP = mkAtlas(false);
  const mkMat = (tex, rough, bump) => new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, bumpMap: tex, bumpScale: bump, roughness: rough, metalness: 0, envMapIntensity: 0.4, skinning: true });
  const MAT_Z = mkMat(ATZ, 0.88, 0.01), MAT_P = mkMat(ATP, 0.82, 0.005);
  // tela limpia para los brazos en 1ª persona
  const cleanTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 2500; i++) { x.globalAlpha = 0.4; x.fillStyle = ['#ffffff', '#dcdcdc', '#e8e8e8'][i % 3]; x.fillRect(hr() * 256, hr() * 256, 1.5, 1.5); } x.globalAlpha = 1; const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t; })();

  // ---------- geometría ----------
  const _lc = {};
  const LATHE = (pts, seg = 9) => { const k = seg + JSON.stringify(pts); return _lc[k] || (_lc[k] = (() => { const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg); g.computeVertexNormals(); return g; })()); };
  const G = { box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(1, 10, 7), sphL: new THREE.SphereGeometry(1, 6, 4), cyl: new THREE.CylinderGeometry(1, 1, 1, 7), cylL: new THREE.CylinderGeometry(1, 1, 1, 5), cone: new THREE.ConeGeometry(1, 1, 6), torus: new THREE.TorusGeometry(1, 0.1, 5, 16) };
  // (lo usa fpArm) piezas rígidas pegadas a un grupo
  function part(bone, geo, col, kind, px, py, pz, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
    (bone.userData.parts || (bone.userData.parts = [])).push({ geo, col: hex(col), kind, m: _m.compose(_p.set(px, py, pz), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz)).clone() });
  }
  // normales suaves: promedia las de los vértices que coinciden (costuras) y devuelve sin índice
  function smoothGeo(g) {
    g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, map = new Map();
    for (let i = 0; i < p.count; i++) { const key = Math.round(p.getX(i) * 4e3) + '_' + Math.round(p.getY(i) * 4e3) + '_' + Math.round(p.getZ(i) * 4e3); let a = map.get(key); if (!a) map.set(key, a = [0, 0, 0, []]); a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); a[3].push(i); }
    for (const a of map.values()) { const l = Math.hypot(a[0], a[1], a[2]) || 1; for (const i of a[3]) n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
    return g.toNonIndexed();
  }
  function mkGeo(P, U, I) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); return smoothGeo(g); }
  // tubo de sección elíptica; anillos [y, rx, rz, cx, cz] de arriba abajo
  function tube(R, seg, vfn) {
    R = R.slice().sort((a, b) => b[0] - a[0]); const P = [], U = [], I = [], nr = R.length, y0 = R[nr - 1][0], y1 = R[0][0];
    for (let r = 0; r < nr; r++) { const y = R[r][0], rx = R[r][1], rz = R[r][2], cx = R[r][3] || 0, cz = R[r][4] || 0; for (let j = 0; j <= seg; j++) { const a = j / seg * Math.PI * 2; P.push(cx - rx * Math.sin(a), y, cz + rz * Math.cos(a)); U.push(j / seg, vfn ? vfn(y) : (y - y0) / ((y1 - y0) || 1)); } }
    for (let r = 0; r < nr - 1; r++) for (let j = 0; j < seg; j++) { const a = r * (seg + 1) + j, b = a + 1, c = a + seg + 1, d = c + 1; I.push(a, b, c, b, d, c); }
    return mkGeo(P, U, I);
  }
  function ringAt(R, y) { for (let i = 0; i < R.length - 1; i++) { const a = R[i], b = R[i + 1]; if ((y <= a[0] && y >= b[0]) || (y >= a[0] && y <= b[0])) { const t = (y - a[0]) / ((b[0] - a[0]) || 1); return [y, mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3] || 0, b[3] || 0, t), mix(a[4] || 0, b[4] || 0, t)]; } } const e = Math.abs(y - R[0][0]) < Math.abs(y - R[R.length - 1][0]) ? R[0] : R[R.length - 1]; return [y, e[1], e[2], e[3] || 0, e[4] || 0]; }
  function sub(R, ya, yb, infl = 0) { const lo = Math.min(ya, yb), hi = Math.max(ya, yb), out = [ringAt(R, hi)]; for (const r of R) if (r[0] < hi - 1e-4 && r[0] > lo + 1e-4) out.push([r[0], r[1], r[2], r[3] || 0, r[4] || 0]); out.push(ringAt(R, lo)); for (const r of out) { r[1] += infl; r[2] += infl; } return out; }
  const cap = (r, dy, k = 0.02) => [r[0] + dy, r[1] * k, r[2] * k, r[3] || 0, r[4] || 0];
  // esfera esculpida: fn(dir) -> posición; keep(dir) decide qué triángulos se conservan
  const _sph = {};
  function sculpt(ws, hs, fn, keep) {
    const key = ws + '_' + hs, base = _sph[key] || (_sph[key] = new THREE.SphereGeometry(1, ws, hs)), bp = base.attributes.position, n = bp.count, P = new Float32Array(n * 3), K = keep ? new Uint8Array(n) : null;
    for (let i = 0; i < n; i++) { const dx = bp.getX(i), dy = bp.getY(i), dz = bp.getZ(i), p = fn(dx, dy, dz); P[i * 3] = p[0]; P[i * 3 + 1] = p[1]; P[i * 3 + 2] = p[2]; if (K) K[i] = keep(dx, dy, dz) ? 1 : 0; }
    let idx = base.index.array; if (K) { const out = []; for (let i = 0; i < idx.length; i += 3) if (K[idx[i]] || K[idx[i + 1]] || K[idx[i + 2]]) out.push(idx[i], idx[i + 1], idx[i + 2]); idx = out; if (!idx.length) return null; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('uv', base.attributes.uv.clone()); g.setIndex(Array.from(idx)); return smoothGeo(g);
  }
  const OUTFITS = ['jacket', 'hoodie', 'track', 'overalls', 'military', 'hivis', 'shirt', 'scrubs'];

  // o: { sex, body, height, age, skin, hair, style, beard, eye, glasses, hat, hatc, outfit, top, pants, shoes, backpack, gloves, zombie, seed }
  function build(o) {
    const rnd = mulberry32(o.seed || 1), pk = a => a[Math.floor(rnd() * a.length)], Z = !!o.zombie, F = o.sex === 'f', hi = !Z && !o.lod;
    const bt = o.body || 'normal', BW = { thin: 0.9, normal: 1, strong: 1.07, heavy: 1.14 }[bt] || 1, SH = (F ? 0.9 : 1) * (bt === 'strong' ? 1.09 : bt === 'thin' ? 0.95 : bt === 'heavy' ? 1.04 : 1), BELLY = bt === 'heavy' ? 1.26 : bt === 'thin' ? 0.92 : 1, LIMB = bt === 'strong' ? 1.14 : bt === 'heavy' ? 1.12 : bt === 'thin' ? 0.88 : 1;
    const age = o.age || 0; let zi = 0, skin = hex(o.skin);
    if (Z) { let bd = 1e9; ZT.forEach((t, i) => { const d = Math.abs((t >> 16 & 255) - (skin >> 16 & 255)) + Math.abs((t >> 8 & 255) - (skin >> 8 & 255)) + Math.abs((t & 255) - (skin & 255)); if (d < bd) { bd = d; zi = i; } }); if (o.seed) zi = Math.floor(rnd() * 8); skin = ZT[zi]; }
    const hairBase = hex(o.hair || 0x2a1a10), hair = age === 2 && !Z ? mixHex(hairBase, 0xc8c8c8, 0.55) : hairBase;
    const top = hex(o.top), pants = hex(o.pants), shoes = hex(o.shoes || 0x2a2a2e), outfit = OUTFITS.includes(o.outfit) ? o.outfit : 'jacket', flesh = 0x7a2418, boneC = 0xd8d0b8;
    const root = new THREE.Group();
    const B = n => { const b = new THREE.Bone(); b.name = n; return b; };
    const rig = B('rig'), body = B('body'), head = B('head'), lL = B('lL'), lR = B('lR'), kL = B('kL'), kR = B('kR'), aL = B('aL'), aR = B('aR'), eL = B('eL'), eR = B('eR'), hL = B('handL'), hR = B('hand');
    const bones = [rig, body, head, lL, lR, kL, kR, aL, aR, eL, eR, hL, hR];
    rig.add(lL, lR, body); lL.add(kL); lR.add(kR); body.add(aL, aR, head); aL.add(eL); aR.add(eR); eL.add(hL); eR.add(hR);
    const hipW = (F ? 0.1 : 0.094) * BW, shX = 0.195 * SH, yHead = 1.595, yWr = 0.88;
    lL.position.set(-hipW, 0.93, 0); lR.position.set(hipW, 0.93, 0); kL.position.y = kR.position.y = -0.46;
    body.position.y = 0.93; body.userData.y0 = 0.93; aL.position.set(-shX, 0.5, 0); aR.position.set(shX, 0.5, 0); eL.position.y = eR.position.y = -0.285; hL.position.y = hR.position.y = -0.265; head.position.y = 0.665;
    const P = { rig, body, head, lL, lR, kL, kR, aL, aR, eL, eR, hand: hR, handL: hL };
    const pieces = [], headSkin = [];
    const add = (geo, col, cell, w) => { if (geo) pieces.push({ geo, col: hex(col), cell, w }); };
    const rigid = (bi, geo, col, cell, px, py, pz, sx, sy, sz, rx = 0, ry = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(_m.compose(_p.set(px, py, pz), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz))); add(g, col, cell, bi); };
    const H = (geo, col, cell, px, py, pz, sx, sy, sz, rx, ry, rz) => rigid(2, geo, col, cell, px, py + yHead, pz, sx, sy, sz, rx, ry, rz);
    const up = g => { if (g) g.translate(0, yHead, 0); return g; };
    const sg = hi ? 12 : 8, pv = (F ? 1.07 : 1) * BW, boots = outfit === 'military' || outfit === 'overalls' || outfit === 'hivis';
    // ----- piernas -----
    for (const s of [-1, 1]) {
      const li = s < 0 ? 3 : 4, ki = s < 0 ? 5 : 6, cx = s * hipW, th = (F ? 1.05 : 1) * LIMB, torn = Z && rnd() < 0.3;
      const LR = [[0.97, 0.06 * th, 0.065, cx], [0.9, 0.088 * th, 0.092 * th, cx], [0.8, 0.088 * th, 0.094 * th, cx], [0.66, 0.076 * th, 0.082 * th, cx], [0.53, 0.062 * th, 0.066, cx], [0.47, 0.058, 0.061, cx, -0.004], [0.4, 0.055 * LIMB, 0.058 * LIMB, cx, 0.002], [0.33, 0.056 * LIMB, 0.062 * LIMB, cx, 0.008], [0.2, 0.044, 0.046, cx, 0.004], [0.1, 0.037, 0.04, cx], [0.085, 0.035, 0.038, cx]];
      const wl = (x, y) => [li, ki, sstep(0.54, 0.4, y)], vf = y => (y - 0.085) / 0.885, yCut = torn ? 0.3 + rnd() * 0.14 : 0.085;
      add(tube([cap(LR[0], 0.004), ...sub(LR, 0.97, yCut, 0.003)], sg, vf), pants, CI.pants, wl);
      if (torn) add(tube(sub(LR, yCut + 0.01, 0.085, -0.004), sg, vf), skin, CI.skin, wl);
      if (boots) add(tube(sub(LR, 0.27, 0.085, 0.009), sg), shoes, CI.gear, ki);
      add(sculpt(hi ? 12 : 8, hi ? 8 : 6, (dx, dy, dz) => { let y = 0.052 + dy * 0.052; if (dz < 0) y = 0.014 + (y - 0.014) * (1 + dz * 0.42); return [cx + dx * 0.05 * (1 + Math.max(0, -dz) * 0.08), Math.max(0.012, y), -0.035 + dz * 0.128]; }), shoes, CI.gear, ki);
      rigid(ki, G.box, boots ? shade(shoes, -0.45) : 0x2a2826, CI.white, cx, 0.011, -0.037, 0.098, 0.022, 0.255);
    }
    // ----- pelvis y tronco -----
    add(tube([[0.995, 0.166 * pv, 0.107], [0.93, 0.17 * pv, 0.11], [0.86, 0.172 * pv, 0.113], [0.8, 0.13 * pv, 0.1], [0.765, 0.03, 0.04]], hi ? 18 : 12), pants, CI.pelvis, 1);
    const cb = -(BELLY - 1) * 0.07;
    const T = F ? [[0.955, 0.174 * pv, 0.112], [1.04, 0.142 * BW * BELLY, 0.1 * BELLY, 0, cb], [1.14, 0.14 * BW, 0.102, 0, cb * 0.5], [1.26, 0.153 * SH, 0.12, 0, -0.014], [1.33, 0.16 * SH, 0.112, 0, -0.008], [1.42, 0.158 * SH, 0.092], [1.48, 0.128 * SH, 0.078, 0, 0.004], [1.52, 0.07, 0.058, 0, 0.006], [1.545, 0.046, 0.047, 0, 0.008]]
      : [[0.955, 0.172 * BW * BELLY, 0.112 * BELLY, 0, cb], [1.04, 0.162 * BW * BELLY, 0.106 * BELLY, 0, cb], [1.14, 0.163 * BW, 0.107, 0, cb * 0.4], [1.25, 0.177 * SH, 0.117, 0, -0.004], [1.35, 0.187 * SH, 0.113, 0, -0.002], [1.43, 0.183 * SH, 0.098], [1.485, 0.148 * SH, 0.083, 0, 0.004], [1.52, 0.082, 0.062, 0, 0.006], [1.545, 0.053, 0.053, 0, 0.008]];
    add(tube([...T, cap(T[T.length - 1], 0.003)], hi ? 20 : 12, y => (y - 0.955) / 0.59), top, CI[outfit], 1);
    const patch = (u0, u1, ya, yb, infl, col, cell, nu = 6, nv = 4) => { const Pp = [], U = [], I = [], yT = Math.max(ya, yb), yL = Math.min(ya, yb);
      for (let iv = 0; iv <= nv; iv++) { const r = ringAt(T, yT + (yL - yT) * iv / nv); for (let iu = 0; iu <= nu; iu++) { const a = (u0 + (u1 - u0) * iu / nu) * Math.PI * 2; Pp.push(r[3] - (r[1] + infl) * Math.sin(a), r[0], r[4] + (r[2] + infl) * Math.cos(a)); U.push(iu / nu, 1 - iv / nv); } }
      for (let r = 0; r < nv; r++) for (let j = 0; j < nu; j++) { const a = r * (nu + 1) + j, b = a + 1, c = a + nu + 1, d = c + 1; I.push(a, b, c, b, d, c); } add(mkGeo(Pp, U, I), col, cell, 1); };
    if (outfit === 'overalls') { patch(0, 1, 0.955, 1.05, 0.005, pants, CI.pants, 14, 1); patch(0.33, 0.67, 1.04, 1.34, 0.006, pants, CI.pants); for (const u of [0.37, 0.63, 0.1, 0.9]) patch(u - 0.022, u + 0.022, 1.04, 1.5, 0.007, pants, CI.pants, 1, 5); patch(0.44, 0.56, 1.14, 1.26, 0.009, shade(pants, -0.18), CI.gear, 2, 2); }
    if (outfit === 'hivis') { const v = Z ? 0xc8a020 : 0xe8d020; patch(0.265, 0.485, 0.98, 1.47, 0.006, v, CI.gear, 5, 5); patch(0.515, 0.735, 0.98, 1.47, 0.006, v, CI.gear, 5, 5); patch(0.765, 1.235, 0.98, 1.47, 0.006, v, CI.gear, 8, 5); for (const y of [1.08, 1.24]) { patch(0.265, 0.485, y, y + 0.045, 0.009, 0xc8ccd0, CI.white, 5, 1); patch(0.515, 0.735, y, y + 0.045, 0.009, 0xc8ccd0, CI.white, 5, 1); patch(0.765, 1.235, y, y + 0.045, 0.009, 0xc8ccd0, CI.white, 8, 1); } }
    if (['jacket', 'shirt', 'track', 'military'].includes(outfit)) add(tube([[1.5, 0.078, 0.07, 0, 0.004], [1.548, 0.064, 0.062, 0, 0.007], [1.572, 0.068, 0.066, 0, 0.007], [1.574, 0.055, 0.054, 0, 0.007]], hi ? 14 : 8), shade(top, -0.06), CI.sleeve, 1);
    if (outfit === 'hoodie') add(sculpt(10, 7, (dx, dy, dz) => [dx * 0.12, 1.5 + dy * 0.06, 0.07 + dz * 0.065]), top, CI.sleeve, 1);
    if (o.backpack) { const bp = hex(o.backpack), sq = v => Math.sign(v) * Math.pow(Math.abs(v), 0.55);
      add(sculpt(10, 8, (dx, dy, dz) => [sq(dx) * 0.14, 1.25 + sq(dy) * 0.2, 0.17 + sq(dz) * 0.075]), bp, CI.gear, 1);
      add(sculpt(8, 6, (dx, dy, dz) => [sq(dx) * 0.1, 1.16 + sq(dy) * 0.08, 0.245 + sq(dz) * 0.03]), shade(bp, -0.18), CI.gear, 1);
      rigid(1, G.cyl, 0x6a6a4a, CI.gear, 0, 1.04, 0.18, 0.05, 0.3, 0.05, 0, 0, Math.PI / 2);
      for (const u of [0.365, 0.635]) patch(u - 0.02, u + 0.02, 1.02, 1.5, 0.008, shade(bp, -0.3), CI.gear, 1, 6); }
    // ----- brazos y manos -----
    const shortSleeve = outfit === 'scrubs' || o.sleeves === 'short';
    for (const s of [-1, 1]) {
      const ai = s < 0 ? 7 : 8, ei = s < 0 ? 9 : 10, hi2 = s < 0 ? 11 : 12, cx = s * shX, ua = LIMB * (F ? 0.86 : 1), short = shortSleeve || (Z && rnd() < 0.3), lost = Z && rnd() < 0.1;
      const A = [[1.48, 0.02, 0.02, cx - s * 0.012], [1.463, 0.046 * ua, 0.048 * ua, cx - s * 0.006], [1.43, 0.058 * ua, 0.06 * ua, cx], [1.36, 0.056 * ua, 0.058 * ua, cx], [1.26, 0.05 * ua, 0.052 * ua, cx], [1.17, 0.044 * ua, 0.046 * ua, cx], [1.145, 0.043 * ua, 0.045 * ua, cx], [1.1, 0.045 * ua, 0.046 * ua, cx], [1.0, 0.039 * ua, 0.04 * ua, cx], [0.92, 0.031, 0.03, cx], [0.885, 0.028, 0.025, cx]];
      const wa = (x, y) => y > 1.3 ? [ai, 1, sstep(1.405, 1.48, y) * 0.5] : [ai, ei, sstep(1.21, 1.08, y)], vf = y => (y - 0.885) / 0.6, slc = outfit === 'hivis' ? top : top;
      const yEnd = lost ? 1.04 : 0.885, ySl = short ? 1.27 : Math.max(yEnd, 0.9);
      add(tube(sub(A, 1.48, ySl, 0.004), sg, vf), slc, CI.sleeve, wa);
      if (ySl > yEnd + 0.01) add(tube(sub(A, ySl + 0.012, yEnd), sg, vf), skin, CI.skin, wa);
      if (lost) { add(tube([[1.04, 0.04, 0.04, cx], [1.0, 0.036, 0.036, cx], [0.99, 0.004, 0.004, cx]], sg), flesh, CI.skin, ei); rigid(ei, G.cylL, boneC, CI.white, cx, 0.975, 0, 0.012, 0.07, 0.012); hL.scale.setScalar(s < 0 ? 0.001 : 1); if (s > 0) hR.scale.setScalar(0.001); continue; }
      const glv = o.gloves ? 0x2a2a2c : skin, gc = o.gloves ? CI.gear : CI.skin, hw = F ? 0.9 : 1, cyl = hi ? G.cyl : G.cylL, y0 = yWr;
      rigid(hi2, G.sph, glv, gc, cx, y0 - 0.048, 0, 0.036 * hw, 0.046, 0.0145);
      for (let f = 0; f < 4; f++) { const fx = cx + (f - 1.5) * 0.0172 * hw, L1 = [0.032, 0.036, 0.034, 0.027][f], L2 = L1 * 0.9, cr = Z ? 0.55 : 0.32, r = [0.0082, 0.0086, 0.0082, 0.0074][f];
        rigid(hi2, cyl, glv, gc, fx, y0 - 0.088 - L1 / 2, -0.004, r, L1 + 0.006, r, cr * 0.4, 0, 0);
        rigid(hi2, cyl, o.gloves ? skin : glv, CI.skin, fx, y0 - 0.088 - L1 - L2 * 0.45 * Math.cos(cr), -0.007 - L2 * 0.45 * Math.sin(cr), r * 0.9, L2, r * 0.9, cr, 0, 0);
        if (hi) rigid(hi2, G.sphL, o.gloves ? skin : glv, CI.skin, fx, y0 - 0.088 - L1 - L2 * 0.92 * Math.cos(cr), -0.007 - L2 * 0.92 * Math.sin(cr), r * 0.9, r * 0.9, r * 0.9); }
      rigid(hi2, cyl, glv, gc, cx - s * 0.034 * hw, y0 - 0.045, -0.013, 0.0105, 0.05, 0.0105, -0.5, 0, s * 0.55);
      rigid(hi2, G.sphL, o.gloves ? skin : glv, CI.skin, cx - s * 0.047 * hw, y0 - 0.068, -0.027, 0.0098, 0.012, 0.0098);
    }
    // ----- cuello y cabeza -----
    const nr = F ? 0.046 : 0.054;
    add(tube([[1.5, nr * 1.2, nr * 1.12, 0, 0.008], [1.56, nr, nr, 0, 0.006], [1.63, nr * 0.97, nr, 0, 0.004], [1.67, nr * 0.9, nr * 0.92, 0, 0.004]], hi ? 12 : 8), skin, CI.skin, (x, y) => [1, 2, sstep(1.55, 1.63, y)]);
    const hrx = F ? 0.0765 : 0.081, hry = 0.116, hrz = 0.098, hcy = 0.128, hcz = 0.008;
    const HP = (dx, dy, dz, infl = 0) => {
      const dn = Math.max(0, -dy), upw = Math.max(0, dy), fr = Math.max(0, -dz), bk = Math.max(0, dz);
      const sx = 1 - 0.2 * Math.pow(dn, 1.5) + (F ? 0 : 0.05) * sstep(0.25, 0.6, dn) * (1 - sstep(0.7, 0.95, dn)), sz = 1 - 0.3 * bk * dn;
      let oz = -0.012 * fr * sstep(0.45, 0.85, dn) + 0.009 * fr * sstep(0.5, 0.95, upw), oy = -0.006 * fr * sstep(0.6, 0.95, dn) * (F ? 0.5 : 1);
      if (fr > 0.2) { const px = dx * hrx, py = hcy + dy * hry, g = (cx, cy, a, b) => Math.exp(-((px - cx) * (px - cx)) / (2 * a * a) - ((py - cy) * (py - cy)) / (2 * b * b));
        oz += fr * (-(F ? 0.002 : 0.0045) * g(0, 0.168, 0.05, 0.01) + 0.006 * (g(0.031, 0.149, 0.016, 0.011) + g(-0.031, 0.149, 0.016, 0.011)) - 0.0035 * (g(0.045, 0.12, 0.02, 0.016) + g(-0.045, 0.12, 0.02, 0.016)) - 0.004 * g(0, 0.08, 0.03, 0.013) + 0.003 * g(0, 0.06, 0.03, 0.008)); }
      return [dx * hrx * sx + dx * infl, hcy + dy * hry + oy + dy * infl, hcz + dz * hrz * sz + oz + dz * infl];
    };
    const frontZ = (x, y) => { const dx = x / hrx, dy = (y - hcy) / hry; return HP(dx, dy, -Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)))[2]; };
    const headUV = (g, mode) => { const p = g.attributes.position, nn = g.attributes.normal, uv = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i += 3) { const fr = [0, 1, 2].map(k => mode === 1 || (mode !== 2 && nn.getZ(i + k) < -0.1)), any = fr[0] || fr[1] || fr[2];
        for (let k = 0; k < 3; k++) { const j = i + k, x = p.getX(j); uv[j * 2] = fr[k] ? clamp(0.5 + x / 0.22, 0.02, 0.98) : (any ? (x < 0 ? 0.02 : 0.98) : 0.02); uv[j * 2 + 1] = clamp((p.getY(j) + 0.01) / 0.26, 0.02, 0.98); } }
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g; };
    const noNose = Z && (zi === 3 || zi === 6);
    headSkin.push(headUV(sculpt(hi ? 30 : 18, hi ? 20 : 13, (dx, dy, dz) => HP(dx, dy, dz)), 0));
    if (!noNose) { const nz = frontZ(0, 0.132) + 0.006, nw = F ? 0.88 : 1;
      headSkin.push(headUV(sculpt(hi ? 10 : 8, hi ? 8 : 6, (dx, dy, dz) => { const t = (1 - dy) / 2, w = mix(0.0062, 0.0142, sstep(0.2, 0.9, t)) * nw, dep = mix(0.005, 0.025, sstep(0.1, 0.85, t)) * (1 - 0.3 * sstep(0.85, 1, t)); return [dx * w, 0.133 + dy * 0.031, nz + Math.min(0, dz) * dep + Math.max(0, dz) * 0.004]; }), 1));
      for (const s of [-1, 1]) headSkin.push(headUV(sculpt(6, 5, (dx, dy, dz) => [s * 0.0105 * nw + dx * 0.0075, 0.109 + dy * 0.0062, nz - 0.012 + dz * 0.0075]), 1)); }
    for (const s of [-1, 1]) if (!(Z && rnd() < 0.15)) headSkin.push(headUV(sculpt(6, 6, (dx, dy, dz) => [s * (hrx * 0.97) + dx * 0.008 + s * Math.max(0, dz) * 0.006, 0.13 + dy * 0.025 + Math.max(0, dy) * 0.004, 0.014 + dz * 0.016]), 2));
    // ----- pelo -----
    const stRaw = Z ? pk(['short', 'messy', 'long', 'bald', 'side', 'buzz', 'short']) : (o.style || 'short'), st = ['buzz', 'short', 'side', 'messy', 'long', 'ponytail', 'bun', 'curly', 'afro', 'mohawk', 'bald'].includes(stRaw) ? stRaw : 'short';
    const hat = o.hat && o.hat !== 'none' ? o.hat : null, hlF = (F ? 0.56 : 0.6) + (age === 2 && !F && !Z ? 0.14 : 0) + (Z ? rnd() * 0.2 : 0), patchy = Z ? 0.3 : 0;
    const HL = (dx, dy, dz) => (dz < 0 ? mix(0.12, hlF, sstep(0.12, 0.75, -dz)) : mix(0.12, -0.62, sstep(0, 0.7, dz))) + (patchy ? patchy * Math.sin(dx * 9 + dz * 7) * Math.sin(dy * 8 + dx * 5) : 0);
    const shell = (inf, col, hl = HL, cell = CI.hair, edge = 0.12) => add(up(sculpt(hi ? 26 : 16, hi ? 16 : 11, (dx, dy, dz) => { const m = sstep(0, edge, dy - hl(dx, dy, dz)); return HP(dx, dy, dz, m * inf(dx, dy, dz) - (1 - m) * 0.007); }, (dx, dy, dz) => dy - hl(dx, dy, dz) > -0.02)), col, cell, 2);
    const lim = v => hat ? Math.min(v, 0.016) : v, nz3 = (dx, dy, dz, f) => 0.5 + 0.5 * Math.sin(dx * f + dy * f * 0.7) * Math.sin(dz * f * 0.9 + dy * f * 1.1);
    if (st !== 'bald') {
      if (st === 'buzz' || st === 'mohawk') shell(() => 0.004, mixHex(skin, hair, 0.72));
      else if (st === 'side') shell((dx, dy) => lim(0.013 + 0.008 * Math.max(0, dy) + 0.013 * Math.max(0, dx * 0.9 + 0.25) * Math.max(0, dy)), hair);
      else if (st === 'messy') shell((dx, dy, dz) => lim(0.015 + 0.014 * nz3(dx, dy, dz, 13)), hair);
      else if (st === 'curly') shell((dx, dy, dz) => lim(0.022 + 0.013 * nz3(dx, dy, dz, 22)), hair);
      else if (st === 'afro') shell((dx, dy, dz) => lim(0.05 + 0.012 * nz3(dx, dy, dz, 20)), hair, (dx, dy, dz) => HL(dx, dy, dz) - 0.1, CI.hair, 0.3);
      else shell((dx, dy, dz) => lim(0.012 + 0.008 * Math.max(0, dy) + 0.007 * Math.max(0, -dz) * Math.max(0, dy)), hair);
      if (st === 'long') { const Pp = [], U = [], I = [], nu = hi ? 12 : 8, nv = 5; for (let iv = 0; iv <= nv; iv++) { const t = iv / nv, y = mix(0.17, -0.1, t), rx = mix(0.09, 0.1, sstep(0, 0.6, t)) * (1 - 0.12 * sstep(0.7, 1, t)), rz = mix(0.11, 0.085, t); for (let iu = 0; iu <= nu; iu++) { const a = mix(-0.66, 0.66, iu / nu) * Math.PI; Pp.push(-rx * Math.sin(a), y + yHead, hcz + 0.004 + rz * Math.cos(a)); U.push(iu / nu, 1 - t * 0.9); } }
        for (let r = 0; r < nv; r++) for (let j = 0; j < nu; j++) { const a = r * (nu + 1) + j, b = a + 1, c = a + nu + 1, d = c + 1; I.push(a, b, c, b, d, c, a, c, b, b, c, d); } add(mkGeo(Pp, U, I), hair, CI.hair, 2); }
      if (st === 'ponytail') add(up(tube([[0.19, 0.016, 0.016, 0, 0.093], [0.175, 0.03, 0.03, 0, 0.112], [0.12, 0.03, 0.027, 0, 0.127], [0.04, 0.023, 0.021, 0, 0.133], [-0.04, 0.008, 0.008, 0, 0.13]], 8)), hair, CI.hair, 2);
      if (st === 'bun') H(G.sph, hair, CI.hair, 0, 0.222, 0.078, 0.046, 0.042, 0.046);
      if (st === 'mohawk') add(up(sculpt(8, 8, (dx, dy, dz) => [dx * 0.013, 0.215 + dy * 0.05 - Math.abs(dz) * 0.03, 0.012 + dz * 0.105])), hair, CI.hair, 2);
    }
    if (!Z && o.beard === 'full') shell((dx, dy) => 0.008 + 0.016 * sstep(-0.5, -0.95, dy), mixHex(hair, 0x140a06, 0.1), (dx, dy, dz) => (dz < 0.25 && dy < -0.2 && !(Math.abs(dx) < 0.3 && dy > -0.5 && dz < 0)) ? dy - 1 : 9, CI.hair, 0.3);
    // ----- gorros y gafas -----
    if (hat) { const hc2 = hex(o.hatc || 0x3a4a2a);
      if (hat === 'cap') { shell(() => 0.024, hc2, (dx, dy, dz) => dz < 0 ? 0.36 : 0.22, CI.gear, 0.06); add(up(sculpt(10, 6, (dx, dy, dz) => [dx * 0.078, 0.2 + dy * 0.006 - Math.max(0, -dz) * 0.012, frontZ(0, 0.2) - 0.045 + dz * 0.07])), hc2, CI.gear, 2); H(G.sphL, shade(hc2, -0.2), CI.gear, 0, 0.268, 0.01, 0.012, 0.006, 0.012); }
      if (hat === 'beanie') { const hb = (dx, dy, dz) => dz < 0 ? mix(0.1, 0.42, sstep(0.1, 0.7, -dz)) : mix(0.1, -0.25, sstep(0, 0.7, dz)); shell(() => 0.024, hc2, hb, CI.gear, 0.06); add(up(sculpt(hi ? 22 : 14, hi ? 14 : 10, (dx, dy, dz) => HP(dx, dy, dz, 0.031), (dx, dy, dz) => { const d = dy - hb(dx, dy, dz); return d > 0 && d < 0.22; })), shade(hc2, -0.14), CI.gear, 2); }
      if (hat === 'bandana') { shell(() => 0.013, hc2, (dx, dy, dz) => dz < 0 ? mix(0.1, 0.44, sstep(0.1, 0.7, -dz)) : mix(0.1, -0.05, sstep(0, 0.7, dz)), CI.gear, 0.06); H(G.sphL, hc2, CI.gear, 0, 0.13, 0.112, 0.022, 0.02, 0.016); H(G.cone, hc2, CI.gear, 0.012, 0.085, 0.118, 0.022, 0.08, 0.008, Math.PI * 0.92, 0, 0.15); }
    }
    if (o.glasses && o.glasses !== 'none') { const gc = 0x1a1a1e, gz = frontZ(0.031, 0.149) - 0.014; for (const s of [-1, 1]) { H(G.torus, gc, CI.white, s * 0.032, 0.149, gz, 0.022, 0.018, 0.02); if (o.glasses === 'shades') H(G.cyl, 0x0c0c10, CI.white, s * 0.032, 0.149, gz, 0.021, 0.003, 0.017, Math.PI / 2, 0, 0); H(G.box, gc, CI.white, s * 0.068, 0.152, gz + 0.05, 0.003, 0.005, 0.1); } H(G.box, gc, CI.white, 0, 0.152, gz, 0.022, 0.004, 0.004); }

    { const HSC = F ? 1.08 : 1.06, HDY = -0.022; // cabeza algo mayor y cuello más corto
      const fix = (g, base) => { g.translate(0, -base, 0); g.scale(HSC, HSC, HSC); g.translate(0, base + HDY, 0); };
      for (const p of pieces) if (p.w === 2) fix(p.geo, yHead);
      for (const g of headSkin) fix(g, 0); }
    // ---------- fusionar en una SkinnedMesh ----------
    if (Z) for (const g of headSkin) { g.translate(0, yHead, 0); pieces.push({ geo: g, col: 0xffffff, cell: CI.zhead + zi, w: 2 }); }
    let n = 0; for (const p of pieces) n += p.geo.attributes.position.count;
    const Pp = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), C = new Float32Array(n * 3), SI = new Uint16Array(n * 4), SW = new Float32Array(n * 4); let off = 0;
    for (const p of pieces) { const g = p.geo, cnt = g.attributes.position.count, pos = g.attributes.position, uv = g.attributes.uv; Pp.set(pos.array, off * 3); N.set(g.attributes.normal.array, off * 3); _c.setHex(p.col);
      for (let i = 0; i < cnt; i++) { const k = off + i; C[k * 3] = _c.r; C[k * 3 + 1] = _c.g; C[k * 3 + 2] = _c.b; const t = cellUV(p.cell, uv ? clamp(uv.getX(i), 0, 1) : 0.5, uv ? clamp(uv.getY(i), 0, 1) : 0.5); U[k * 2] = t[0]; U[k * 2 + 1] = t[1];
        if (typeof p.w === 'number') { SI[k * 4] = p.w; SW[k * 4] = 1; } else { const w = p.w(pos.getX(i), pos.getY(i), pos.getZ(i)); SI[k * 4] = w[0]; SI[k * 4 + 1] = w[1]; SW[k * 4] = 1 - w[2]; SW[k * 4 + 1] = w[2]; } }
      off += cnt; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(Pp, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(SW, 4)); geo.computeBoundingSphere(); geo.boundingSphere.radius += 0.7;
    const mesh = new THREE.SkinnedMesh(geo, Z ? MAT_Z : MAT_P); mesh.castShadow = true; mesh.receiveShadow = false;
    mesh.add(rig); root.add(mesh); mesh.bind(new THREE.Skeleton(bones));
    const meshes = [mesh]; let faceTex = null;
    if (!Z) { // cabeza con su propia cara pintada
      let m = 0; for (const g of headSkin) m += g.attributes.position.count; const hp = new Float32Array(m * 3), hn = new Float32Array(m * 3), hu = new Float32Array(m * 2); let o2 = 0;
      for (const g of headSkin) { hp.set(g.attributes.position.array, o2 * 3); hn.set(g.attributes.normal.array, o2 * 3); hu.set(g.attributes.uv.array, o2 * 2); o2 += g.attributes.position.count; }
      const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.BufferAttribute(hp, 3)); hg.setAttribute('normal', new THREE.BufferAttribute(hn, 3)); hg.setAttribute('uv', new THREE.BufferAttribute(hu, 2));
      const cv = document.createElement('canvas'); const FS = o.lod ? 256 : 512; cv.width = cv.height = FS; paintFace(cv.getContext('2d'), FS, 0, { skin, eye: hex(o.eye || 0x3a2a1a), brow: hair, sex: o.sex, age, beard: F ? 'none' : (o.beard || 'none'), seed: (o.seed || 1) + 3 });
      faceTex = new THREE.CanvasTexture(cv); faceTex.encoding = THREE.sRGBEncoding; faceTex.anisotropy = 4;
      const hm = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.72, metalness: 0, envMapIntensity: 0.4 })); hm.castShadow = true; head.add(hm); meshes.push(hm);
    }
    const hs = (o.height || 1) * (F ? 0.95 : 1) * 0.97; rig.scale.setScalar(hs);
    return { root, P, mesh, h: 1.8 * hs, eye: 1.62 * hs / 0.97, r: 0.36, headY: 1.72 * hs, headR: 0.14, dog: false, human: true, meshes, dispose() { geo.dispose(); if (faceTex) { faceTex.dispose(); meshes[1].geometry.dispose(); meshes[1].material.dispose(); } } };
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
