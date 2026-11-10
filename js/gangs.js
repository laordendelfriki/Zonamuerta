// La Orden: Zona Muerta — otras bandas (bases, negociación y guerra), hordas migratorias y torres del campamento
'use strict';

// ---------- bandas ----------
const GANGS = {
  buitres: { name: 'Los Buitres', ic: '🦅', leader: 'El Rata', role: 'Jefe de Los Buitres', col: '#ff6a4a', trade: 'mech', temper: 0.35, aggr: true, demand: { caps: 30 },
    o: { outfit: 'jacket', top: '#3a2a26', pants: '#2a2a2e', hat: 'bandana', hatc: '#8a2a1a' },
    hello: 'Mira qué tenemos aquí. Carne fresca con mochila.', deal: 'Todo el que cruza nuestro desguace paga. Así de fácil.', ally: 'Eres de los nuestros… mientras sigas pagando.', war: '¡Te vamos a dejar para los muertos!' },
  guardia: { name: 'La Guardia', ic: '🛡️', leader: 'Sargento Vila', role: 'Mando de La Guardia', col: '#8ab4ff', trade: 'guns', temper: 0.5, demand: { ammo9: 12, bandage: 2 },
    o: { outfit: 'military', top: '#2a3a52', pants: '#2a2e3a', hat: 'cap', hatc: '#1e2a3e' },
    hello: 'Alto. Identifícate y las manos donde pueda verlas.', deal: 'Mantenemos el orden en esta zona. Quien colabora con munición y vendas, tiene nuestra protección.', ally: 'Buen trabajo ahí fuera. La Guardia no olvida a los suyos.', war: 'Has elegido el bando equivocado. ¡Fuego a discreción!' },
  germandat: { name: 'La Germandat', ic: '🕯️', leader: 'Mare Remei', role: 'Guía de La Germandat', col: '#d8a0ff', trade: 'farm', temper: 0.6, demand: { medkit: 1, beans: 3 },
    o: { outfit: 'hoodie', top: '#4a2a5a', pants: '#3a3a3a', hat: 'none' },
    hello: 'Bienvenido, caminante. Aquí compartimos lo poco que queda.', deal: 'Quien se sienta a nuestra mesa trae algo a la mesa. Es la única norma.', ally: 'Hermano, nuestra casa es tu casa.', war: 'Nos has roto el corazón. Ahora romperemos el tuyo.' },
  mercaders: { name: 'Mercaders del Besòs', ic: '⚖️', leader: 'La Patrona', role: 'Jefa de los Mercaders', col: '#ffd060', trade: 'shop', temper: 0.7, demand: { caps: 18 },
    o: { outfit: 'shirt', top: '#8a6a2a', pants: '#3a3226', hat: 'none' },
    hello: '¡Pasa, pasa! Aquí todo tiene un precio y todo precio se puede hablar.', deal: 'Una cuota de socio y tendrás los mejores precios del Vallès.', ally: '¡Mi socio favorito! ¿Qué te pongo hoy?', war: 'Mal negocio has hecho. Muy malo.' },
};
const GANG_N = 9;
const gangState = () => ({ rel: 0, dm: 1, st: 0, hag: false, dead: [], met: false, tresp: 0, raidT: 0, gift: 0, ult: 0 });
S.gangs = {};
let gangTalk = null;
function gangSaveData() { const o = {}; for (const id in S.gangs) { const g = S.gangs[id]; o[id] = { rel: g.rel, dm: +g.dm.toFixed(2), st: g.st, hag: g.hag ? 1 : 0, dead: g.dead.map(d => d ? 1 : 0), met: g.met ? 1 : 0, gift: g.gift, ult: g.ult }; } return o; }
function initGangs(sv) {
  S.gangs = {}; S.turret = null; S.tradeMul = 0;
  for (const id in GANGS) { const g = gangState(), o = sv && sv.gangs && sv.gangs[id]; if (o) { g.rel = o.rel; g.dm = o.dm || 1; g.st = o.st || 0; g.hag = !!o.hag; g.dead = (o.dead || []).map(d => !!d); g.met = !!o.met; g.gift = o.gift || 0; g.ult = o.ult || 0; } g.raidT = R(90, 160); g.spawned = false; S.gangs[id] = g; }
  if (sv && sv.npcs && S.npcs) for (const st of sv.npcs) if (st.m) { const n = S.npcs.find(n => n.def.id === st.id); if (n) n.met = true; }
  initMigrHordes(sv && sv.mh);
}
const gangHostile = z => z.raid || (S.gangs[z.gang] && S.gangs[z.gang].rel < 0);
const gangSpot = id => typeof CITY !== 'undefined' && CITY.gangSpots ? CITY.gangSpots[id] : null;
const relTxt = g => g.rel === 1 ? '<span style="color:#9be36a">Aliados</span>' : g.rel === 0 ? 'Neutrales' : g.rel === -1 ? '<span style="color:#ff6a5a">En guerra</span>' : 'Banda eliminada';

class Ganger {
  constructor(id, idx, x, z, raid) {
    const D = GANGS[id], lead = idx === 0 && !raid, f = !lead && rand() < 0.35;
    this.id = ZID++; this.human = true; this.gang = id; this.idx = idx; this.raid = !!raid;
    this.gun = lead || idx === 1 || idx === 2 || rand() < 0.4;
    this.c = HUMAN.build(Object.assign({ lod: true, sex: lead ? (id === 'germandat' || id === 'mercaders' ? 'f' : 'm') : f ? 'f' : 'm', skin: pick(['#f0d0b4', '#dcae8a', '#c8946a', '#a87850', '#7a5236']), hair: pick(['#1c1410', '#3a2a1e', '#6e4a2e', '#5a5a5a']), style: f ? pick(['long', 'ponytail', 'bun', 'short']) : pick(['short', 'buzz', 'messy', 'bald', 'mohawk']), beard: f ? 'none' : pick(['none', 'stub', 'full', 'short']), body: pick(['normal', 'strong', 'thin', 'heavy']), age: lead ? 2 : pick([0, 1, 1]), gloves: rand() < 0.5, backpack: null, seed: 0 }, D.o, lead ? { style: id === 'germandat' ? 'bun' : id === 'mercaders' ? 'long' : 'buzz', body: 'strong' } : {}));
    this.model = this.c.root; scene.add(this.model);
    const wm = this.gun ? weaponModel(lead || rand() < 0.3 ? 'shotgun' : 'pistol', 0) : meleeModel(pick(['bat', 'pipe', 'nailbat', 'club'])); wm.rotation.x = -Math.PI / 2; wm.scale.setScalar(0.85); this.c.P.hand.add(wm);
    if (lead && typeof npcLabel === 'function') { this.label = npcLabel(D.leader); this.label.position.y = 2.15; this.model.add(this.label); }
    this.pos = new V3(x, getH(x, z), z); this.post = new V3(x, 0, z); this.vel = new V3(); this.yaw = R(0, 6.28); this.bodyYaw = this.yaw; this.walk = R(0, 6); this.ph = R(0, 6.28);
    this.hp = lead ? 150 : RI(70, 100); this.alive = true; this.state = 'idle'; this.target = new V3(); this.alertT = 0; this.atkCd = R(0.5, 1.5); this.wind = 0; this.stun = 0; this.speed = 3.4; this.think = R(0, 0.3); this.deadT = 0; this.kind = 'walk'; this.alert = 0; this.swing = 0; this.patT = R(10, 40); this.stuckT = 0;
  }
}
function spawnGangMembers(id) {
  const Sp = gangSpot(id), G = S.gangs[id]; if (!Sp) return; G.spawned = true;
  for (let i = 0; i < GANG_N; i++) { if (G.dead[i]) continue; const q = Sp.spots[i], z = new Ganger(id, i, q[0], q[1]); z.yaw = z.bodyYaw = Math.atan2(-(Sp.gate[0] - q[0]), -(Sp.gate[1] - q[1])); z.postYaw = z.yaw; S.zombies.push(z); }
}
function gangWar(id, why) {
  const G = S.gangs[id], D = GANGS[id]; if (!G || G.rel < 0) return; G.rel = -1; G.raidT = R(70, 130); G.tresp = 0;
  for (const z of S.zombies) if (z.human && z.gang === id && z.alive) z.alert = 12;
  msg(`⚔️ ${D.name}: «${D.war}» — ahora sois rivales`, 4.5); sfx('hurt', 0.6); if (gangTalk) closeTalk(); saveSoon();
}
function gangHurt(z, quiet) { z.alert = 14; if (!z.raid && S.gangs[z.gang].rel >= 0 && !quiet) gangWar(z.gang, 'hit'); for (const o of S.zombies) if (o.human && o.gang === z.gang && o.alive && o.pos.distanceTo(z.pos) < 45) o.alert = Math.max(o.alert, 10); }
function gangDeath(z) {
  const G = S.gangs[z.gang], D = GANGS[z.gang], Sp = gangSpot(z.gang); if (z.label) z.label.visible = false;
  if (rand() < 0.7) dropGround(mk('caps', RI(2, 7)), z.pos.x + R(-0.5, 0.5), z.pos.z + R(-0.5, 0.5)); if (z.gun && rand() < 0.6) dropGround(mk('ammo9', RI(3, 8)), z.pos.x + R(-0.5, 0.5), z.pos.z + R(-0.5, 0.5));
  if (z.raid) return; G.dead[z.idx] = true;
  let left = 0; for (let i = 0; i < GANG_N; i++) if (!G.dead[i]) left++;
  if (left === 0) { G.rel = -2; msg(`💀 Has acabado con ${D.name}. Su base es tuya: saquea el alijo del barracón.`, 6);
    if (Sp) { const loot = [mk('caps', 60), mk('ammo9', 30), mk('shells', 10), mk('shotgun'), mk('pistol'), mk('medkit'), mk('medkit'), mk('bandage', 3), mk('beans'), mk('beans'), mk('water'), mk('water'), mk('gas'), mk('tape')]; loot[3].mag = GUNS.shotgun.mag; loot[4].mag = GUNS.pistol.mag; loot.forEach((it, k) => dropGround(it, Sp.stash[0] + (k % 5 - 2) * 0.7, Sp.stash[1] + Math.floor(k / 5) * 0.7)); } }
  else if (z.idx === 0) msg(`${D.leader} ha caído. Quedan ${left} de ${D.name}.`, 3.5); else if (left <= 3) msg(`Quedan ${left} de ${D.name}.`, 2.5);
  saveSoon();
}
function spawnRaid(id) {
  const p = S.p, D = GANGS[id], n = RI(3, 5); let made = 0;
  const a0 = R(0, 6.28);
  const pts = CITY.streetPts.filter(q => { const d = Math.hypot(q[0] - p.pos.x, q[1] - p.pos.z); return d > 48 && d < 75; }), q0 = pts.length ? pick(pts) : null, ar = q0 ? Math.atan2(q0[0] - p.pos.x, -(q0[1] - p.pos.z)) : a0;
  for (let i = 0; i < 40 && made < n; i++) { const a = a0 + R(-0.4, 0.4), d = R(52, 70), x = q0 ? q0[0] + R(-3, 3) : p.pos.x + Math.sin(a) * d, z = q0 ? q0[1] + R(-3, 3) : p.pos.z - Math.cos(a) * d; if (getH(x, z) < 1.5) continue; const g = new Ganger(id, 100 + made, x, z, true); collide(g.pos, 0.38, 1.8); if (Math.hypot(g.pos.x - x, g.pos.z - z) > 3) { scene.remove(g.model); continue; } g.alert = 999; S.zombies.push(g); made++; }
  if (made) { msg(`⚔️ ¡${D.name} vienen a por ti desde ${DIRN(ar)}!`, 4); sfx('hurt', 0.5); }
}
const _ga = new V3(), _gb = new V3(), _gd = new V3();
function gangLOS(z, T) { _ga.set(z.pos.x, z.pos.y + 1.45, z.pos.z); _gb.set(T.pos.x, T.pos.y + 1.1, T.pos.z); _gd.subVectors(_gb, _ga); const L = _gd.length(); _gd.divideScalar(L); return rayWorld(_ga, _gd, L) >= L - 0.6; }
function updateGanger(z, dt) {
  const p = S.p, G = S.gangs[z.gang], D = GANGS[z.gang], m = z.model;
  if (!z.alive) { z.deadT += dt; const k = Math.min(1, z.deadT * 3); m.position.set(z.pos.x, z.pos.y + 0.1 * k, z.pos.z); m.rotation.set(-k * Math.PI / 2, z.bodyYaw, 0, 'YXZ'); if (z.deadT > 45) m.visible = false; return; }
  const dp = Math.hypot(p.pos.x - z.pos.x, p.pos.z - z.pos.z);
  if (z.raid && dp > 240) { z.alive = false; z.deadT = 99; m.visible = false; return; }
  if (dp > 170) { m.visible = false; return; }
  m.visible = true; if (z.label) z.label.visible = dp > 3 && dp < 20;
  z.atkCd -= dt; if (z.stun > 0) z.stun -= dt; if (z.swing > 0) z.swing -= dt; if (z.hitT > 0) z.hitT -= dt;
  const hostile = z.raid || G.rel < 0; let mx = 0, mz = 0, spd = 0, T = null, engaged = false, aim = false;
  if (hostile && p.alive) {
    T = p; let td = dp; if (S.npcs) for (const n of S.npcs) { if (!n.alive || n.state === 'home') continue; const d = Math.hypot(n.pos.x - z.pos.x, n.pos.z - z.pos.z); if (d < td && d < 22) { T = n; td = d; } }
    z.think -= dt; if (z.think <= 0) { z.think = 0.3; z.los = td < 48 && gangLOS(z, T); if (td < (z.raid ? 999 : 36) && (z.los || td < 14)) z.alert = Math.max(z.alert, 8);
      for (const o of S.zombies) if (!o.human && o.alive && Math.abs(o.pos.x - z.pos.x) < 2.2 && Math.abs(o.pos.z - z.pos.z) < 2.2) { hurtZombie(o, 45, z.pos, 2, true); break; } }
    if (!z.raid && z.pos.distanceTo(z.post) > 80) z.alert = 0;
    if (z.alert > 0) { z.alert -= dt; engaged = true; const dx = T.pos.x - z.pos.x, dz = T.pos.z - z.pos.z, d = td || 1;
      if (z.gun) { aim = z.los && td < 34; const want = !z.los ? 1 : td > 17 ? 1 : td < 7 ? -0.7 : 0; mx = dx / d * want; mz = dz / d * want; if (want === 0) { const sd = Math.sin(S.time * 0.7 + z.ph) > 0 ? 1 : -1; mx = -dz / d * sd * 0.5; mz = dx / d * sd * 0.5; } spd = 3.0;
        if (aim && z.atkCd <= 0 && z.stun <= 0) { z.atkCd = R(1.6, 2.9); z.swing = 0.12; const onP = T === p; let ch = clamp(0.4 - td * 0.01, 0.07, 0.3); if (onP && (p.sprint || S.turret || S.drive)) ch *= 0.55;
          const hit = rand() < ch; _ga.set(z.pos.x, z.pos.y + 1.45, z.pos.z); _gb.set(T.pos.x + (hit ? 0 : R(-1.2, 1.2)), T.pos.y + (hit ? 1.1 : R(0.3, 2.4)), T.pos.z + (hit ? 0 : R(-1.2, 1.2))); tracer(_ga.clone(), _gb.clone()); sfxAt('shot', z.pos); emitNoise(z.pos, 40);
          if (hit) { if (onP) { p.cause = `abatido por ${D.name}`; hurtPlayer(RI(5, 9), null); } else hurtNPC(T, RI(5, 9)); } } }
      else { if (td > 1.15) { mx = dx / d; mz = dz / d; } spd = 3.8; if (td < 1.5 && z.atkCd <= 0 && z.stun <= 0 && Math.abs(T.pos.y - z.pos.y) < 1.5) { z.wind = 0.3; z.atkCd = 1.15; z.swing = 0.32; } }
      z.faceX = T.pos.x; z.faceZ = T.pos.z; }
  }
  if (!engaged) { // guardia tranquila: en su puesto, con alguna ronda
    if (z.idx > 4 && !z.raid) { z.patT -= dt; if (z.patT <= 0) { z.patT = R(18, 45); const Sp = gangSpot(z.gang); if (Sp) { const q = Sp.spots[RI(5, GANG_N - 1)]; z.post.set(q[0] + R(-1.5, 1.5), 0, q[1] + R(-1.5, 1.5)); } } }
    const dx = z.post.x - z.pos.x, dz = z.post.z - z.pos.z, d = Math.hypot(dx, dz); if (d > 1.0) { mx = dx / d; mz = dz / d; spd = hostile ? 2.6 : 1.5; }
  }
  if (z.wind > 0) { z.wind -= dt; mx = mz = 0; if (z.wind <= 0 && T && T.alive !== false) { const d = Math.hypot(T.pos.x - z.pos.x, T.pos.z - z.pos.z); if (d < 1.75 && z.stun <= 0) { if (T === p) { p.cause = `apaleado por ${D.name}`; hurtPlayer(RI(8, 13), null); sfx('thud', 0.8); } else hurtNPC(T, RI(7, 11)); } } }
  if (z.stun > 0) mx = mz = 0;
  if (z.det > 0 && (mx || mz)) { z.det -= dt; if (z.detAx) { mx = Math.abs(mx) > 0.15 ? Math.sign(mx) : z.detSg; mz = 0; } else { mz = Math.abs(mz) > 0.15 ? Math.sign(mz) : z.detSg; mx = 0; } }
  const px0 = z.pos.x, pz0 = z.pos.z;
  z.vel.x = lerp(z.vel.x, mx * spd, Math.min(1, dt * 6)); z.vel.z = lerp(z.vel.z, mz * spd, Math.min(1, dt * 6)); z.pos.addScaledVector(z.vel, dt);
  const bx = z.pos.x, bz = z.pos.z; collide(z.pos, 0.36, 1.8);
  if (z.raid && engaged && (mx || mz) && Math.hypot(z.pos.x - bx, z.pos.z - bz) > 0.0005 && z.atkCd <= 0 && S.built.length) for (const pc of S.built) { if (BUILD[pc.type].floor || pc.city) continue; const a = pieceAABB(pc.type, pc.x, pc.z, pc.rot), cx = clamp(z.pos.x, a[0], a[2]), cz = clamp(z.pos.z, a[1], a[3]); if (Math.hypot(cx - z.pos.x, cz - z.pos.z) < 0.6 && !(BUILD[pc.type].door && pc.open)) { z.atkCd = 1.2; z.swing = 0.32; pc.hp -= RI(10, 16); burst(new V3(cx, z.pos.y + 1.1, cz), 0x8a5a2a, 4, 2, 0.4); sfxAt('thud', z.pos); if (pc.hp <= 0) { destroyPiece(pc); msg(`¡${D.name} han roto: ${BUILD[pc.type].n}!`, 2); } break; } }
  const g = getH(z.pos.x, z.pos.z); if (g < -0.6) z.pos.addScaledVector(z.vel, -dt * 2); z.pos.y = Math.max(g, -1.1);
  if ((mx || mz) && spd > 1 && Math.hypot(z.pos.x - px0, z.pos.z - pz0) < spd * dt * 0.35) { z.stuckT += dt; if (z.stuckT > 0.3) { z.stuckT = 0; z.detAx = !z.detAx; z.det = R(1.8, 3.2); z.detSg = rand() < 0.5 ? 1 : -1; } } else z.stuckT = Math.max(0, z.stuckT - dt);
  const sp = Math.hypot(z.vel.x, z.vel.z);
  if (engaged && (aim || sp < 0.3 || !z.gun && dp < 3)) z.yaw = Math.atan2(-(z.faceX - z.pos.x), -(z.faceZ - z.pos.z)); else if (sp > 0.2) z.yaw = Math.atan2(-z.vel.x, -z.vel.z); else if (!hostile && dp < 7) z.yaw = Math.atan2(-(p.pos.x - z.pos.x), -(p.pos.z - z.pos.z)); else if (!engaged && z.postYaw !== undefined && z.idx < 5) z.yaw = z.postYaw + Math.sin(S.time * 0.3 + z.ph) * 0.7;
  // animación
  m.position.copy(z.pos); z.bodyYaw += angDiff(z.bodyYaw, z.yaw) * Math.min(1, dt * 10); m.rotation.set(0, z.bodyYaw, 0);
  const P = z.c.P, run = sp > 2.4, mv = Math.min(1, sp / (run ? 3.6 : 1.6)); z.walk += sp * dt * (run ? 2.0 : 2.6); locoPose(P, z.walk, mv, run, S.time, z.ph);
  if (z.gun && (aim || z.swing > 0)) { const kick = z.swing > 0 ? z.swing / 0.12 : 0; P.aR.rotation.set(Math.PI / 2 + kick * 0.25, 0, -0.08); P.eR.rotation.x = 0.06; P.aL.rotation.set(Math.PI / 2 - 0.05, -0.55, 0.35); P.eL.rotation.x = 0.35; P.body.rotation.y = -0.25; P.head.rotation.y = 0.25; }
  else if (z.swing > 0) meleePose(P, 1 - z.swing / 0.32);
  else { P.aR.rotation.x = P.aR.rotation.x * 0.45 + 0.4; P.eR.rotation.x = 0.55; if (!engaged) P.head.rotation.y += Math.sin(S.time * 0.5 + z.ph) * 0.3 * (1 - mv); }
  if (z.hitT > 0) { P.body.rotation.x += 0.25; P.head.rotation.x -= 0.2; }
}

// ---------- parlamento: comerciar, aliarse, regatear o guerra ----------
function demandOf(id, mul = 1) { const D = GANGS[id], G = S.gangs[id], o = {}; for (const k in D.demand) o[k] = Math.max(1, Math.ceil(D.demand[k] * G.dm * mul)); return o; }
const demandTxt = o => Object.entries(o).map(([k, v]) => `${v} × ${ITEMS[k].ic} ${ITEMS[k].n.toLowerCase()}`).join(' y ');
const canPay = o => Object.entries(o).every(([k, v]) => countItem(S.p, k) >= v);
const payUp = o => { for (const k in o) takeItems(S.p, k, o[k]); S.dirty = true; };
const truceMul = id => 1.6 + 0.2 * S.gangs[id].dead.filter(Boolean).length;
function nearGangThing(p) {
  if (typeof CITY === 'undefined') return null;
  if (CITY.campSpot && CITY.campSpot.towers) for (const t of CITY.campSpot.towers) if (Math.hypot(p.pos.x - t.lx, p.pos.z - t.lz) < 1.5) return { k: 'tower', t };
  if (CITY.gangSpots) for (const id in CITY.gangSpots) { const Sp = CITY.gangSpots[id]; if (Math.hypot(p.pos.x - Sp.parley[0], p.pos.z - Sp.parley[1]) < 2.4 && S.gangs[id] && S.gangs[id].rel > -2) return { k: 'parley', id }; }
  return null;
}
function openParley(id) {
  const G = S.gangs[id]; if (!G) return; G.met = true; gangTalk = id; talkN = { gang: id, mul: G.rel === 1 ? 0.85 : 1.3, def: { name: GANGS[id].name, trade: GANGS[id].trade }, stock: G.stock, stockDay: G.stockDay };
  if (document.pointerLockElement) document.exitPointerLock(); S.talkOpen = true; updateLock(); renderParley(id); $('npcp').classList.remove('hidden'); sfx('click', 0.6);
}
function renderParley(id) {
  const G = S.gangs[id], D = GANGS[id]; let body = '', btn = [];
  if (G.rel === 0) { const dm = demandOf(id); body = `<p>«${D.hello}»</p><p>«${D.deal}»</p><p class="q">🤝 Piden <b>${demandTxt(dm)}</b> para ser aliados.${canPay(dm) ? '' : ' <span style="opacity:.7">(no te llega)</span>'}</p>${G.st ? '<p style="opacity:.75;font-size:12px">Ya están molestos contigo: otro desaire y habrá guerra.</p>' : ''}`;
    btn.push(['pay', '🤝 Pagar y aliarse']); if (!G.hag) btn.push(['haggle', '🗣️ Regatear']); btn.push(['trade', '🪙 Comerciar (precios caros)'], ['refuse', '✋ Rechazar el trato (rivalidad)'], ['war', '⚔️ Declarar la guerra']); }
  else if (G.rel === 1) { body = `<p>«${D.ally}»</p><p class="sk">Aliados: mejores precios, podéis entrar en su base y no os atacarán.</p>`; btn.push(['trade', '🪙 Comerciar (precio de aliado)']); if (dayNum() >= G.gift) btn.push(['gift', '🎁 Pedir suministros']); btn.push(['war', '⚔️ Romper la alianza']); }
  else if (G.rel === -1) { const dm = demandOf(id, truceMul(id)); body = `<p>«${D.war}»</p><p class="q">🏳️ Aceptarían una tregua por <b>${demandTxt(dm)}</b>.${canPay(dm) ? '' : ' <span style="opacity:.7">(no te llega)</span>'}</p><p style="opacity:.75;font-size:12px">Si no, la guerra sigue: mandarán grupos a por ti hasta que acabes con todos (quedan ${GANG_N - G.dead.filter(Boolean).length}).</p>`; btn.push(['truce', '🏳️ Pagar la tregua']); }
  else body = '<p>Solo se oye estática. Aquí ya no queda nadie.</p>';
  btn.push(['bye', 'Adiós']);
  $('npcn').innerHTML = `${D.ic} ${D.leader}<small>${D.role} · ${relTxt(G)}</small>`; $('npcb').innerHTML = body; $('npcbt').innerHTML = btn.map(([k, t]) => `<button class="pb ${k === 'bye' ? 'x' : ''}" data-a="${k}">${t}</button>`).join('');
}
function gangAction(id, a) {
  const G = S.gangs[id], D = GANGS[id], p = S.p;
  if (a === 'bye') { G.stock = talkN.stock; G.stockDay = talkN.stockDay; gangTalk = null; closeTalk(); return; }
  if (a === 'trade') { talkN.mul = G.rel === 1 ? 0.85 : 1.3; openTrade(talkN); G.stock = talkN.stock; G.stockDay = talkN.stockDay; return; }
  if (a === 'pay') { const dm = demandOf(id); if (!canPay(dm)) { msg('No tienes lo que piden', 1.8); return; } payUp(dm); G.rel = 1; G.st = 0; G.gift = dayNum(); msg(`🤝 Ahora eres aliado de ${D.name}`, 3.5); sfx('pick', 1); }
  if (a === 'haggle') { G.hag = true; if (rand() < D.temper) { G.dm *= 0.6; msg(`🗣️ ${D.leader} acepta rebajar el precio`, 2.5); } else { G.st++; G.dm *= 1.25; if (G.st >= 2) { gangTalk = null; closeTalk(); gangWar(id, 'talk'); return; } msg(`🗣️ A ${D.leader} no le ha gustado: sube el precio`, 2.8); } }
  if (a === 'refuse' || a === 'war') { gangTalk = null; closeTalk(); gangWar(id, a); return; }
  if (a === 'truce') { const dm = demandOf(id, truceMul(id)); if (!canPay(dm)) { msg('No tienes lo que piden', 1.8); return; } payUp(dm); G.rel = 0; G.st = 0; G.hag = false; G.dm = 1; G.tresp = 0; for (const z of S.zombies) if (z.human && z.gang === id) { z.alert = 0; if (z.raid && z.alive) { z.alive = false; z.deadT = 99; z.model.visible = false; } } msg(`🏳️ Tregua con ${D.name}. No entres en su base sin permiso.`, 3.5); }
  if (a === 'gift') { G.gift = dayNum() + 2; const list = STOCK[D.trade]; for (let i = 0; i < 3; i++) { const k = pick(list.filter(x => !ITEMS[x].gun)); addItem(p, mk(k, ITEMS[k].stack ? (k === 'ammo9' ? 8 : 2) : 1)); } S.dirty = true; msg(`🎁 ${D.name} te dan suministros`, 2.5); sfx('pick', 0.9); }
  renderParley(id); saveSoon();
}
let gangTick = 0;
function updateGangs(dt) {
  if (typeof CITY === 'undefined' || !CITY.gangSpots) return; const p = S.p; if (!p.alive) return;
  if (gangTalk && !S.talkOpen) gangTalk = null;
  gangTick -= dt; const tick = gangTick <= 0; if (tick) gangTick = 0.5;
  if (tick && S.npcs) for (const n of S.npcs) if (!n.met && n.alive && Math.abs(n.pos.x - p.pos.x) + Math.abs(n.pos.z - p.pos.z) < 30) n.met = true;
  for (const id in GANGS) { const Sp = CITY.gangSpots[id], G = S.gangs[id], D = GANGS[id]; if (!Sp || !G || G.rel === -2) continue;
    if (tick) { const d = Math.hypot(p.pos.x - Sp.x, p.pos.z - Sp.z);
      if (!G.met && d < 120) { G.met = true; msg(`📍 Has encontrado la base de ${D.name}. Hay un poste con radio en el camino para parlamentar.`, 5); saveSoon(); }
      if (!G.spawned && d < 240) spawnGangMembers(id);
      if (D.aggr && G.rel === 0 && G.met) { const day = dayNum(); if (!G.ult && day >= 3) { G.ult = day + 2; msg(`📻 ${D.name} exigen tributo. Ve a su poste antes del día ${G.ult} o habrá guerra.`, 6); } else if (G.ult && day >= G.ult) gangWar(id, 'ult'); } }
    const inside = p.pos.x > Sp.X0 && p.pos.x < Sp.X1 && p.pos.z > Sp.Z0 && p.pos.z < Sp.Z1;
    if (inside && G.rel === 0) { G.tresp += dt; if (!G.warned) { G.warned = true; msg(`⚠️ «¡Eh, tú! Esto es de ${D.name}. Fuera o disparamos.»`, 3.5); sfx('click', 0.9); } if (G.tresp > 7) gangWar(id, 'tresp'); }
    else if (!inside && G.tresp > 0) { G.tresp = Math.max(0, G.tresp - dt * 0.4); if (!G.tresp) G.warned = false; }
    if (G.rel === -1) { G.raidT -= dt; if (G.raidT <= 0) { G.raidT = R(240, 400); spawnRaid(id); } }
  }
}
function drawGangMap(ctx, W, X, Z, big, span) {
  if (typeof CITY === 'undefined' || !CITY.gangSpots) return; const p = S.p; ctx.textAlign = 'center';
  for (const id in CITY.gangSpots) { const G = S.gangs[id]; if (!G || !G.met) continue; const Sp = CITY.gangSpots[id], D = GANGS[id], x = X(Sp.x), z = Z(Sp.z); if (x < -30 || x > W + 30 || z < -30 || z > W + 30) continue;
    const col = G.rel === 1 ? '#9be36a' : G.rel === 0 ? '#f0f0f0' : G.rel === -1 ? '#ff5a4a' : '#8a8a8a', k = W / span;
    ctx.fillStyle = 'rgba(40,36,30,.85)'; ctx.strokeStyle = col; ctx.lineWidth = big ? 2.5 : 1.5; ctx.fillRect(X(Sp.X0), Z(Sp.Z0), (Sp.X1 - Sp.X0) * k, (Sp.Z1 - Sp.Z0) * k); ctx.strokeRect(X(Sp.X0), Z(Sp.Z0), (Sp.X1 - Sp.X0) * k, (Sp.Z1 - Sp.Z0) * k);
    ctx.font = (big ? 20 : 13) + 'px sans-serif'; ctx.fillText(G.rel === -2 ? '☠️' : D.ic, x, z + (big ? 7 : 5));
    if (big) { ctx.font = 'bold 12px Nunito, sans-serif'; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 3; const t = D.name + (G.rel === 1 ? ' · aliados' : G.rel === -1 ? ' · en guerra' : G.rel === -2 ? ' · eliminados' : ''); ctx.strokeText(t, x, z + 24); ctx.fillStyle = col; ctx.fillText(t, x, z + 24); if (span < 500 && G.rel > -2) { ctx.font = '13px sans-serif'; ctx.fillText('📻', X(Sp.parley[0]), Z(Sp.parley[1]) + 4); } } }
  for (const z of S.zombies) if (z.human && z.alive && z.alert > 0 && gangHostile(z)) { ctx.fillStyle = '#ff9a2a'; ctx.beginPath(); ctx.arc(X(z.pos.x), Z(z.pos.z), 3, 0, 7); ctx.fill(); }
  if (S.mh) for (const h of S.mh) { const d = Math.hypot(h.x - p.pos.x, h.z - p.pos.z); if (d > 300) continue; const x = X(h.x), z = Z(h.z); if (x < -10 || x > W + 10 || z < -10 || z > W + 10) continue; const r = (big ? 9 : 6) + Math.sqrt(h.n); ctx.fillStyle = 'rgba(190,30,20,.38)'; ctx.beginPath(); ctx.arc(x, z, r, 0, 7); ctx.fill(); ctx.font = (big ? 15 : 11) + 'px sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('🧟', x, z + 4); if (big) { ctx.font = 'bold 11px Nunito, sans-serif'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText('Horda ~' + Math.round(h.n / 5) * 5, x, z + r + 12); ctx.fillStyle = '#ff8a7a'; ctx.fillText('Horda ~' + Math.round(h.n / 5) * 5, x, z + r + 12); } }
}

// ---------- hordas que recorren el mapa y se juntan ----------
let MHID = 1, mhT = 0;
function hordeDest() { const r = rand(), p = S.p; if (r < 0.15 && p) return [p.pos.x + R(-30, 30), p.pos.z + R(-30, 30)]; if (r < 0.27 && S.campKnown && S.camp) return [S.camp.x + R(-25, 25), S.camp.z - 30 + R(-10, 10)]; const c = pick(POIS.filter(q => q.type === 'city' || q.type === 'town' || q.type === 'gang')); const e = c.type === 'gang' ? 45 : c.r * 0.8; return [c.x + R(-e, e), c.z + R(-e, e)]; }
function newMigrHorde() { const p = S.p; for (let i = 0; i < 30; i++) { const q = typeof CITY !== 'undefined' && CITY.streetPts.length ? pick(CITY.streetPts) : [R(-HALF * 0.7, HALF * 0.7), R(-HALF * 0.7, HALF * 0.7)]; if (p && Math.hypot(q[0] - p.pos.x, q[1] - p.pos.z) < 280) continue; const t = hordeDest(); S.mh.push({ id: MHID++, x: q[0], z: q[1], tx: t[0], tz: t[1], n: RI(9, 16) + Math.min(10, dayNum() * 2), live: false }); return; } }
function initMigrHordes(saved) { S.mh = []; mhT = 0; if (saved && saved.length) for (const [x, z, tx, tz, n] of saved) S.mh.push({ id: MHID++, x, z, tx, tz, n, live: false }); else for (let i = 0; i < 6; i++) newMigrHorde(); }
function hordeAdd(h, n, x0, z0) { const p = S.p; let made = 0; const rad = 3 + Math.sqrt(n) * 1.5;
  for (let i = 0; i < n * 4 && made < n; i++) { const a = R(0, 6.28), r = Math.sqrt(rand()) * rad, x = x0 + Math.cos(a) * r, z = z0 + Math.sin(a) * r; if (getH(x, z) < 1.5 || Math.hypot(x - p.pos.x, z - p.pos.z) < 40) continue; const zz = new Zombie(x, z); collide(zz.pos, 0.38, 1.8); zz.mh = h.id; zz.ox = R(-rad, rad); zz.oz = R(-rad, rad); zz.speed = R(1.15, 1.5); zz.state = 'hunt'; zz.target.set(h.tx + zz.ox, 0, h.tz + zz.oz); zz.alertT = 30; S.zombies.push(zz); made++; } return made; }
function updateMigrHordes(dt) {
  if (!S.mh) return; mhT += dt; if (mhT < 0.5) return; const T = mhT; mhT = 0; const p = S.p;
  for (const h of S.mh.slice()) {
    const dpl = Math.hypot(h.x - p.pos.x, h.z - p.pos.z);
    if (!h.live) { const dx = h.tx - h.x, dz = h.tz - h.z, d = Math.hypot(dx, dz); if (d < 12) { const t = hordeDest(); h.tx = t[0]; h.tz = t[1]; } else { h.x += dx / d * 1.15 * T; h.z += dz / d * 1.15 * T; }
      if (dpl < 118 && dpl > 50) { const made = hordeAdd(h, h.n, h.x, h.z); if (made) { h.live = true; h.n = made; const a = Math.atan2(h.x - p.pos.x, -(h.z - p.pos.z)); msg(`🧟 Una horda de unos ${Math.max(5, Math.round(made / 5) * 5)} cruza la zona por ${DIRN(a)}. Mejor que no te oigan.`, 4.5); sfx('groan', 0.9); } } }
    else { let cx = 0, cz = 0, n = 0, chase = false; for (const z of S.zombies) if (z.mh === h.id && z.alive) { cx += z.pos.x; cz += z.pos.z; n++; if (z.state === 'chase') chase = true; else { z.state = 'hunt'; z.target.set(h.tx + z.ox, 0, h.tz + z.oz); z.alertT = 30; } }
      if (!n) { S.mh.splice(S.mh.indexOf(h), 1); msg('💀 Has aniquilado una horda entera', 3); continue; }
      h.x = cx / n; h.z = cz / n; h.n = n; if (Math.hypot(h.tx - h.x, h.tz - h.z) < 16) { const t = hordeDest(); h.tx = t[0]; h.tz = t[1]; }
      if (dpl > 200 && !chase) { for (const z of S.zombies.slice()) if (z.mh === h.id) { scene.remove(z.model); if (z.pool) scene.remove(z.pool); if (z.c.dispose) z.c.dispose(); S.zombies.splice(S.zombies.indexOf(z), 1); } h.live = false; } }
  }
  // dos hordas que se cruzan se juntan
  for (let i = 0; i < S.mh.length; i++) for (let j = S.mh.length - 1; j > i; j--) { const a = S.mh[i], b = S.mh[j]; if (Math.hypot(a.x - b.x, a.z - b.z) > 34) continue;
    const near = Math.hypot(a.x - p.pos.x, a.z - p.pos.z) < 300;
    if (!a.live && !b.live) { a.n = Math.min(60, a.n + b.n); S.mh.splice(j, 1); }
    else if (a.live && b.live) { for (const z of S.zombies) if (z.mh === b.id) z.mh = a.id; S.mh.splice(j, 1); }
    else { const L = a.live ? a : b, V = a.live ? b : a; hordeAdd(L, Math.min(V.n, 60 - L.n), V.x, V.z); S.mh.splice(S.mh.indexOf(V), 1); }
    if (near) msg('🧟 Dos hordas se han juntado cerca de aquí…', 3.5); break; }
  if (S.mh.length < 6 && rand() < 0.02) newMigrHorde();
}

// ---------- torres del campamento con ametralladora ----------
function mgModel() { const g = new THREE.Group(), dark = new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.6, metalness: 0.5 }), grn = new THREE.MeshStandardMaterial({ color: 0x4a5a3a, roughness: 0.8 });
  const b = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); g.add(me); return me; };
  b(0.09, 0.11, 0.55, dark, 0, 0, -0.1); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 8), dark); br.rotation.x = Math.PI / 2; br.position.set(0, 0.015, -0.65); g.add(br);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), dark); sh.rotation.x = Math.PI / 2; sh.position.set(0, 0.015, -0.5); g.add(sh);
  b(0.07, 0.07, 0.12, grn, -0.075, -0.03, -0.12); b(0.03, 0.05, 0.03, dark, 0, 0.08, -0.3); b(0.05, 0.12, 0.05, dark, 0.06, -0.08, 0.14); b(0.05, 0.12, 0.05, dark, -0.06, -0.08, 0.14); b(0.04, 0.4, 0.04, dark, 0, -0.26, -0.15); return g; }
function mountTurret(t) {
  const p = S.p; if (S.turret || S.drive) return; S.turret = t; t.heat = 0; t.jam = false; t.prevEq = p.eq; t.prevView = S.view; t.item = t.item || { id: 'mg', n: 1, mag: 99 };
  p.eq = t.item; p.reloadT = 0; if (S.view !== 'fp') setView('fp'); p.pos.set(t.x, t.y, t.z); p.vel.set(0, 0, 0); p.jy = 0; msg('Ametralladora de torre: dispara a ráfagas, que se calienta. ' + (IS_TOUCH ? '✋' : 'E') + ' para bajar.', 4); sfx('click', 0.8); S.dirty = true;
}
function leaveTurret() { const p = S.p, t = S.turret; if (!t) return; S.turret = null; p.eq = t.prevEq && p.inv.includes(t.prevEq) ? t.prevEq : null; p.pos.set(t.lx, getH(t.lx, t.lz), t.lz); p.atkCd = 0.3; if (t.prevView !== 'fp') setView(t.prevView); S.dirty = true; }
function updateTurret(dt) {
  const p = S.p, t = S.turret; p.pos.set(t.x, t.y, t.z); p.vel.set(0, 0, 0); p.yaw = S.yaw; p.eq = t.item; t.item.mag = 99; p.sprint = false; p.sta = Math.min(100, p.sta + 8 * dt);
  t.heat = Math.max(0, t.heat - dt * 0.22); if (t.jam && t.heat < 0.35) t.jam = false;
  if ((mouseL || touch.atk) && !S.mapOpen && !S.invOpen && !S.talkOpen && !t.jam && p.atkCd <= 0) { attack(); t.heat += 0.034; if (t.heat >= 1) { t.jam = true; msg('🔥 ¡Sobrecalentada! Espera a que enfríe', 2); sfx('click', 1); } }
}
