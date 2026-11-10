// ===== Supervivientes (NPC): la gente de La Orden repartida por el mapa =====
// Misiones, comercio con chapas, se unen a ti, te siguen y forman un campamento.
const NPC_DEFS = [
  { id: 'xavi', name: 'Xavi', role: 'El tendero de La Orden', skill: 'trader', trade: 'shop', first: true, where: ['LA ORDEN DEL FRIKI'], o: { sex: 'm', skin: '#dcae8a', hair: '#1c1410', style: 'messy', beard: 'stub', hat: 'cap', hatc: '#1a1c28', top: '#2a3a5a', pants: '#2a2a2e', outfit: 'hoodie', backpack: '#3a3a2a' },
    quest: { type: 'bring', items: { beans: 3 }, text: 'Aquí no aguantamos ni dos noches. Antes de irnos necesito comida: tráeme 3 latas de judías del Supermercat, que está aquí al lado. Luego te cuento mi plan.' }, hello: '¡Por fin! Pensaba que estaba solo en la tienda con los sobres.' },
  { id: 'sara', name: 'Sara', role: 'Jefa de La Orden · médica', skill: 'medic', where: ['FARMÀCIA'], o: { sex: 'f', skin: '#eac4a8', hair: '#7a4a2a', style: 'ponytail', top: '#a85a6a', pants: '#2a3a5a', outfit: 'hoodie', body: 'normal', age: 1 },
    quest: { type: 'bring', items: { medkit: 1 }, text: 'Con todo esto voy a necesitar un botiquín de verdad… por Olivia. Tráeme uno y me vengo contigo.' }, hello: 'Menos mal que estás vivo. Esto es una locura.' },
  { id: 'cabrera', name: 'Dani Cabrera', role: 'El del súper · comerciante', skill: 'trader', trade: 'food', where: ['SUPERMERCAT'], o: { sex: 'm', skin: '#dcae8a', hair: '#3a2a1e', style: 'short', beard: 'stub', top: '#3a6a3a', pants: '#2a2a2e', outfit: 'shirt', hat: 'cap', hatc: '#3a6a3a' },
    quest: { type: 'kill', n: 10, text: 'El súper está rodeado. Si me quitas de encima a 10 de esos bichos, te sigo a donde sea.' }, hello: '¿Vienes a comprar? Acepto chapas, y cartas Pokémon si son buenas.' },
  { id: 'joker', name: 'Chilvi', role: 'El mecánico', skill: 'mechanic', trade: 'mech', where: ['TALLER MECÀNIC', 'TALLER'], o: { sex: 'm', skin: '#e8c0a0', hair: '#e8e8ea', style: 'mohawk', top: '#3a4e6a', pants: '#3a4e6a', outfit: 'overalls', body: 'strong' },
    quest: { type: 'bring', items: { scrap: 3, tape: 1 }, text: 'Si me traes 3 chapas metálicas y cinta americana, te pongo a punto cualquier coche. Y me apunto a tu grupo.' }, hello: '¿Tienes algo con ruedas? Yo lo hago andar.' },
  { id: 'alex', name: 'Alex', role: 'El del casino · armas', skill: 'fighter', gun: true, trade: 'guns', where: ['BAR LA PLAÇA', 'BAR'], o: { sex: 'm', skin: '#e8c0a0', hair: '#141016', style: 'side', glasses: 'shades', top: '#1a1a1e', pants: '#1a1a1e', outfit: 'shirt' },
    quest: { type: 'bring', items: { booster: 2 }, text: 'El mundo se acaba y yo sigo queriendo abrir sobres. Tráeme 2 sobres de cartas y soy tuyo, all in.' }, hello: 'Todo tiene un precio, amigo. Hasta las balas.' },
  { id: 'xavo', name: 'Xavo', role: 'Top 8 · constructor', skill: 'builder', where: ['FERRETERIA'], o: { sex: 'm', skin: '#dcae8a', hair: '#1a1210', style: 'curly', beard: 'short', top: '#4a4a52', pants: '#2a3a5a', outfit: 'hoodie' },
    quest: { type: 'bring', items: { plank: 4 }, text: 'Quiero tapiar esta ferretería. Tráeme 4 tablones y luego te ayudo a montar tu base.' }, hello: 'Con un martillo y clavos yo aguanto lo que sea.' },
  { id: 'pelucas', name: 'Pelucas', role: 'Campeón Pokémon · huerto', skill: 'farmer', trade: 'farm', where: ['MERCAT MUNICIPAL', 'MERCAT'], o: { sex: 'm', skin: '#c8946c', hair: '#2a1a14', style: 'long', beard: 'full', glasses: 'shades', top: '#c8a03a', pants: '#2a2a2e', outfit: 'jacket', body: 'heavy' },
    quest: { type: 'bring', items: { seeds: 3 }, text: '¡Abrazo! Si encuentras 3 semillas, monto un huerto que da de comer a todo el grupo.' }, hello: '¿Un abrazo? Bueno… mejor después de comprobar que no estás mordido.' },
  { id: 'dani', name: 'Dani', role: 'Tóxico · tirador', skill: 'fighter', gun: true, where: ['POLICIA LOCAL', 'POLICIA'], o: { sex: 'm', skin: '#eac4a8', hair: '#141016', style: 'buzz', glasses: 'glass', top: '#2a3a24', pants: '#2a2a2e', outfit: 'military' },
    quest: { type: 'kill', n: 15, text: 'Demuéstrame que no eres un paquete: mata a 15 zombis y te cubro las espaldas.' }, hello: 'Aquí se juega sucio o no se juega.' },
  { id: 'lucas', name: 'Lucas', role: 'Estudiante · rebuscador', skill: 'scavenger', where: ['ESCOLA', 'AJUNTAMENT'], o: { sex: 'm', skin: '#f3d9c6', hair: '#4a2e1e', style: 'short', glasses: 'glass', top: '#3a5aa8', pants: '#3a3a42', outfit: 'jacket', body: 'thin', age: 0, backpack: '#a83a2a' },
    quest: { type: 'bring', items: { tape: 1, rope: 1 }, text: 'Necesito cinta americana y una cuerda para bajar al sótano. Luego te ayudo a buscar provisiones.' }, hello: 'He calculado que nos quedan… mejor no te lo digo.' },
  { id: 'lamine', name: 'Lamine Pajal', role: 'El crack · explorador', skill: 'scavenger', where: ['__station'], o: { sex: 'm', skin: '#8e5e3e', hair: '#3a2418', style: 'messy', beard: 'mous', glasses: 'glass', top: '#c84a2a', pants: '#2a2a2e', outfit: 'track', body: 'thin', age: 0, backpack: '#2a2a2e' },
    quest: { type: 'fetch', text: 'Perdí mi mochila huyendo. Está marcada en tu mapa con una ⭐. Tráemela y corro contigo.' }, hello: '¡Ey! Tú corres, yo regateo zombis.' },
  { id: 'john', name: 'John', role: 'Papá del carrito · cocinero', skill: 'cook', where: ['__park'], o: { sex: 'm', skin: '#b07a54', hair: '#141016', style: 'short', beard: 'short', top: '#5a6a7a', pants: '#2a3a5a', outfit: 'jacket' },
    quest: { type: 'bring', items: { water: 2 }, text: 'Necesito agua limpia para el bebé. Dos botellas y te cocino lo que quieras.' }, hello: 'Shhh… que se despierta.' },
  { id: 'geri', name: 'Geri', role: 'Defestamínico · luchador', skill: 'fighter', where: ['@Martorelles'], o: { sex: 'm', skin: '#eac4a8', hair: '#e8c46a', style: 'short', glasses: 'glass', top: '#3a6ad8', pants: '#2a2a2e', outfit: 'track' },
    quest: { type: 'kill', n: 8, text: 'Este pueblo está infestado. Mata a 8 conmigo mirando y me uno.' }, hello: 'Tengo la peonza preparada. Bueno, y un bate.' },
  { id: 'lazuli', name: 'Lazuli', role: 'El Tritones · sanitario', skill: 'medic', where: ['@Montcada i Reixac'], o: { sex: 'm', skin: '#dcae8a', hair: '#6a4428', style: 'curly', glasses: 'glass', top: '#7aa0b8', pants: '#7aa0b8', outfit: 'scrubs' },
    quest: { type: 'bring', items: { alcohol: 2 }, text: 'Me falta alcohol para desinfectar. Tráeme 2 botellas y curo a quien haga falta.' }, hello: 'Buen rollo ante todo… pero no me toques sin desinfectar.' },
  { id: 'victhor', name: 'Victhor', role: 'El que juega a todo · gasolina', skill: 'trader', trade: 'gas', where: ['@Santa Perpètua'], o: { sex: 'm', skin: '#dcae8a', hair: '#1c1418', style: 'short', hat: 'cap', hatc: '#1a1a1e', top: '#2a2a30', pants: '#2a2a2e', outfit: 'hoodie', height: 0.94 },
    quest: { type: 'kill', n: 12, text: 'Tengo gasolina de sobra, pero no puedo salir con esos fuera. Limpia 12 y te vienes con el depósito lleno.' }, hello: 'Gasolina, cartas, lo que sea. Todo se negocia.' },
  { id: 'mario', name: 'Mario', role: 'Rubito de los rizos · tirador', skill: 'fighter', gun: true, where: ['@Mollet del Vallès'], o: { sex: 'm', skin: '#f3d9c6', hair: '#d8b850', style: 'curly', top: '#a83a3a', pants: '#2a3a5a', outfit: 'jacket', age: 0 },
    quest: { type: 'fetch', text: 'Mi pistola se me cayó en la huida. Está en tu mapa con una ⭐. Si me la traes, voy contigo.' }, hello: 'El más rápido del gatillo… sin pistola, eso sí.' },
];
const SKILL_TXT = { medic: '🩹 Cura al grupo y prepara vendas', trader: '🪙 Comercia en el campamento', mechanic: '🔧 Repara y llena de gasolina los coches del campamento', fighter: '🔫 Defiende el campamento', builder: '🔨 Repara las defensas de la base', farmer: '🥬 El huerto da el doble', cook: '🍲 Cocina estofados', scavenger: '🎒 Sale a rebuscar y trae cosas' };
// supervivientes anónimos que deambulan por las calles (generados siempre igual)
{ let sd = 90210; const rr = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296, pk = a => a[Math.floor(rr() * a.length)];
  const MN = ['Marc', 'Pol', 'Jordi', 'Sergi', 'Oriol', 'Iván', 'Rubén', 'Toni', 'Quim', 'Nil', 'Hugo', 'Adri', 'Biel', 'Pau', 'Raúl', 'Óscar', 'Edu'], FN = ['Laia', 'Marta', 'Núria', 'Carla', 'Júlia', 'Aina', 'Mireia', 'Paula', 'Noa', 'Irene', 'Sílvia', 'Ona', 'Berta', 'Clara'];
  const SK = [['scavenger', 'Rebusca en las ruinas'], ['scavenger', 'Conoce todos los atajos'], ['fighter', 'Sabe pelear'], ['fighter', 'No se arruga'], ['cook', 'Cocina con lo que hay'], ['farmer', 'Tiene mano con las plantas'], ['builder', 'Arregla lo que sea'], ['medic', 'Sabe de primeros auxilios'], ['trader', 'Vende de todo']];
  const HELLO = ['¡No dispares! Estoy vivo.', 'Hacía días que no veía a nadie con pulso.', '¿Tienes algo de comer? Bueno, da igual.', 'Cuidado, por esa calle hay un montón.', 'Yo antes iba a los torneos de La Orden, ¿sabes?', 'Dicen que al oeste hay un campamento con muros.', 'No hagas ruido, que vienen en manada.', 'De noche no salgas. Hazme caso.', 'Si ves un coche con gasolina, no lo sueltes.', 'Ya no me fío ni de mi sombra.'];
  const BR = [['water', 1], ['beans', 1], ['bandage', 1], ['bread', 1], ['soda', 2], ['choco', 2], ['rag', 3], ['chips', 2]];
  const SKIN = ['#f0d0b4', '#eac4a8', '#dcae8a', '#c8946a', '#a87850', '#7a5236'], HAIR = ['#1c1410', '#3a2a1e', '#6e4a2e', '#8a6a3a', '#c8a060', '#5a5a5a', '#7a2a1a'], TOP = ['#5a2a2a', '#2a3a5a', '#3a5a3a', '#6a5a3a', '#4a4a52', '#7a6a2a', '#3a2a4a', '#8a8478', '#2a2a2e'], PANT = ['#2a2a2e', '#2a3a5a', '#4a4236', '#3a3a3a', '#5a5246'];
  const places = []; for (let i = 0; i < 16; i++) places.push('__street'); for (const t of POIS) if (t.type === 'town') places.push('@@' + t.name, '@@' + t.name);
  const used = new Set(NPC_DEFS.map(d => d.name.split(' ')[0]));
  places.forEach((w, i) => { const f = rr() < 0.45; let name; for (let k = 0; k < 20; k++) { name = pk(f ? FN : MN); if (!used.has(name)) break; } used.add(name);
    const [skill, role] = pk(SK), kill = rr() < 0.3, br = pk(BR), nk = 4 + Math.floor(rr() * 5);
    NPC_DEFS.push({ id: 'sv' + i, name, role: 'Superviviente · ' + role.toLowerCase(), skill, trade: skill === 'trader' ? pk(['food', 'shop', 'mech']) : rr() < 0.5 ? 'food' : 'farm', roam: true, gun: skill === 'fighter' && rr() < 0.3, where: [w],
      o: { lod: true, sex: f ? 'f' : 'm', skin: pk(SKIN), hair: pk(HAIR), style: f ? pk(['long', 'ponytail', 'bun', 'short', 'curly']) : pk(['short', 'buzz', 'messy', 'side', 'curly', 'bald']), beard: f ? 'none' : pk(['none', 'none', 'stub', 'short', 'full']), top: pk(TOP), pants: pk(PANT), outfit: pk(HUMAN.OUTFITS.filter(x => x !== 'scrubs')), body: pk(['thin', 'normal', 'normal', 'strong', 'heavy']), age: pk([0, 1, 1, 2]), hat: rr() < 0.3 ? pk(['cap', 'beanie', 'bandana']) : 'none', hatc: pk(TOP), backpack: rr() < 0.6 ? pk(['#3a3a2a', '#4a2a2a', '#2a3a4a', '#5a4a2a']) : null, gloves: rr() < 0.3 },
      quest: kill ? { type: 'kill', n: nk, text: `Quítame de encima a ${nk} de esos y me uno a tu grupo.` } : { type: 'bring', items: { [br[0]]: br[1] }, text: `Llevo días aguantando con nada. Si me traes ${br[1]} × ${ITEMS[br[0]].n.toLowerCase()}, voy contigo a donde sea.` }, hello: pk(HELLO) }); });
}
const VALUE = { beans: 5, bread: 4, apple: 2, chips: 2, choco: 2, cereal: 4, water: 4, soda: 3, bottle: 1, bandage: 4, medkit: 16, pills: 5, booster: 12, bat: 8, pan: 5, knife: 6, axe: 22, pipe: 6, pistol: 35, shotgun: 60, hammer: 8, plank: 3, nails: 0.3, scrap: 3, ammo9: 1, shells: 2, rag: 1, tape: 4, alcohol: 4, sandwich: 8, club: 6, nailbat: 14, spear: 10, molotov: 8, gas: 12, stick: 1, rope: 3, stone: 0.5, seeds: 1, veg: 3, stew: 10, saxe: 8, shiv: 4, xbow: 30, bolt: 1.5 };
const val = id => VALUE[id] ?? 2;
const STOCK = {
  shop: ['booster', 'booster', 'booster', 'bandage', 'water', 'beans', 'tape', 'rope', 'choco', 'soda'],
  food: ['beans', 'beans', 'bread', 'water', 'water', 'soda', 'cereal', 'choco', 'chips', 'apple'],
  mech: ['gas', 'gas', 'scrap', 'scrap', 'nails', 'tape', 'hammer', 'pipe', 'rope'],
  guns: ['ammo9', 'ammo9', 'shells', 'pistol', 'shotgun', 'knife', 'axe', 'bandage'],
  farm: ['seeds', 'seeds', 'veg', 'veg', 'apple', 'bread', 'water'],
  gas: ['gas', 'gas', 'gas', 'molotov', 'water', 'soda', 'tape'],
};
S.npcs = []; S.camp = null;
function npcLabel(name) { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.font = '900 30px Nunito, sans-serif'; x.textAlign = 'center'; x.lineWidth = 6; x.strokeStyle = 'rgba(0,0,0,.8)'; x.strokeText(name, 128, 42); x.fillStyle = '#9be36a'; x.fillText(name, 128, 42); const t = new THREE.CanvasTexture(c); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: true, transparent: true })); sp.scale.set(1.6, 0.4, 1); return sp; }
function findHome(def) {
  if (typeof CITY === 'undefined') return [0, 0];
  for (const w of def.where) {
    if (w === '__street') { const pts = CITY.streetPts.filter(q => Math.abs(q[0]) < 215 && Math.abs(q[1]) < 215 && Math.hypot(q[0] + 14, q[1] + 103) > 30); const q = pts[Math.floor(rand() * pts.length)]; return [q[0], q[1]]; }
    if (w.startsWith('@@')) { const tw = CITY.towns.find(t => t.T.name === w.slice(2)); if (tw) { const pts = CITY.streetPts.filter(q => q[0] > tw.X0 && q[0] < tw.X1 && q[1] > tw.Z0 && q[1] < tw.Z1); if (pts.length) { const q = pts[Math.floor(rand() * pts.length)]; return [q[0], q[1]]; } return [tw.T.x + 6, tw.T.z + 6]; } continue; }
    if (w === '__station') return [138, -110];
    if (w === '__park') return [40, 168];
    if (w[0] === '@') { const tw = CITY.towns.find(t => t.T.name === w.slice(1)); if (tw) { const rs = CITY.rooms.filter(r => r.sg.town === tw.T.name && r.kind !== 'casa'); const r = rs.length ? rs[Math.floor(rand() * rs.length)] : null; return r ? [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2] : [tw.T.x + 6, tw.T.z + 6]; } }
    const r = CITY.rooms.find(r => r.name === w && !r.sg.town) || CITY.rooms.find(r => r.name === w); if (r) return def.first ? [(r.x0 + r.x1) / 2 + (r.x1 - r.x0) * 0.22, (r.z0 + r.z1) / 2 + (r.z1 - r.z0) * 0.22] : [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2];
  }
  const sp = pick(CITY.streetPts); return [sp[0], sp[1]];
}
function makeNPC(def, st) {
  const c = HUMAN.build(Object.assign({ seed: strHash(def.id), backpack: def.o.backpack }, def.o));
  scene.add(c.root);
  const [hx, hz] = st && st.home ? st.home : findHome(def);
  const n = { def, c, model: c.root, home: [hx, hz], pos: new V3(hx, getH(hx, hz), hz), vel: new V3(), yaw: R(0, 6.28), bodyYaw: 0, walk: 0, hp: 100, alive: true, state: 'home', quest: 0, qBase: 0, atkCd: 0, swing: 0, stuckT: 0, lastP: new V3(), jobT: R(30, 90), wpn: null, isNPC: true };
  n.label = npcLabel(def.name); n.label.position.y = 2.15; c.root.add(n.label);
  const wm = def.gun ? weaponModel('pistol', 0) : meleeModel(pick(['bat', 'pipe', 'axe']).replace('axe', 'bat')); wm.rotation.x = -Math.PI / 2; wm.scale.setScalar(0.85); c.P.hand.add(wm);
  if (st) { Object.assign(n, { state: st.state, hp: st.hp, quest: st.quest, qBase: st.qBase || 0, qSpot: st.qSpot, gotGun: st.gotGun }); n.pos.set(st.x, getH(st.x, st.z), st.z); if (st.stay) n.stay = new V3(st.stay[0], 0, st.stay[1]); if (!n.alive || st.hp <= 0) n.alive = false; }
  if (n.hp <= 0) { n.alive = false; n.model.rotation.x = -Math.PI / 2; n.model.position.copy(n.pos); }
  S.npcs.push(n); return n;
}
function spawnNPCs(saved) {
  for (const n of S.npcs) scene.remove(n.model); S.npcs = [];
  for (const def of NPC_DEFS) { const st = saved && saved.find(s => s.id === def.id); makeNPC(def, st); }
  for (const n of S.npcs) if (n.def.quest.type === 'fetch' && n.quest === 1 && !S.ground.some(g => g.it.id === 'qitem' && g.it.who === n.def.id) && !S.p.inv.some(i => i.id === 'qitem' && i.who === n.def.id)) placeQuestItem(n, saved ? n.qSpot : null);
}
function placeQuestItem(n, spot) {
  let sp = spot; if (!sp) { const pts = CITY.streetPts.filter(q => { const d = Math.hypot(q[0] - n.home[0], q[1] - n.home[1]); return d > 60 && d < 130; }); sp = pts.length ? pick(pts) : [n.home[0] + 70, n.home[1]]; }
  n.qSpot = sp; const it = mk('qitem'); it.who = n.def.id; it.name = n.def.id === 'mario' ? 'Pistola de Mario' : 'Mochila de ' + n.def.name.split(' ')[0]; dropGround(it, sp[0], sp[1]);
}
// ---------- diálogo ----------
let talkN = null;
function talk(n) {
  if (!n.alive) return; talkN = n; if (document.pointerLockElement) document.exitPointerLock(); S.talkOpen = true; updateLock(); renderTalk(); $('npcp').classList.remove('hidden');
}
function closeTalk() { S.talkOpen = false; talkN = null; $('npcp').classList.add('hidden'); $('trade').classList.add('hidden'); updateLock(); }
function questDone(n) {
  const q = n.def.quest, p = S.p;
  if (q.type === 'kill') return S.kills - n.qBase >= q.n;
  if (q.type === 'bring') return Object.entries(q.items).every(([k, v]) => countItem(p, k) >= v);
  if (q.type === 'fetch') return p.inv.some(i => i.id === 'qitem' && i.who === n.def.id);
}
function questProgress(n) { const q = n.def.quest, p = S.p; if (q.type === 'kill') return `Zombis: ${Math.min(q.n, S.kills - n.qBase)}/${q.n}`; if (q.type === 'bring') return Object.entries(q.items).map(([k, v]) => `${ITEMS[k].ic} ${ITEMS[k].n}: ${Math.min(v, countItem(p, k))}/${v}`).join(' · '); return questDone(n) ? 'La llevas encima' : 'Búscala en el mapa (⭐)'; }
function renderTalk() {
  const n = talkN; if (!n) return; const d = n.def, q = d.quest; let body = '', btn = [];
  const joined = n.state === 'follow' || n.state === 'stay' || n.state === 'camp';
  if (!joined) {
    if (n.quest === 0) { body = `<p>«${d.hello}»</p><p class="q">📜 ${q.text}</p>`; btn.push(['accept', 'Aceptar la misión']); }
    else if (n.quest === 1) { body = `<p class="q">📜 ${q.text}</p><p><b>${questProgress(n)}</b></p>`; if (questDone(n)) btn.push(['turnin', '✔ Entregar']); }
    else { body = `<p>«Gracias. Cuando quieras, voy contigo.»</p><p class="sk">${SKILL_TXT[d.skill]}</p>`; btn.push(['join', '🤝 Únete a mí']); }
  } else if (n.campTalk) {
    n.campTalk = false; body = `<p>«Escucha: en la carretera de Sant Fost, saliendo de La Llagosta por el oeste, hay un campamento de Protección Civil. Tiene muros, torres y puerta. Ahí podemos montar nuestra base y traer a más gente.»</p><p>«Yo me voy para allá ahora mismo. Te lo he marcado en el mapa con la 🚩. Busca a los demás de La Orden y diles que vengan.»</p><p class="sk">${SKILL_TXT[d.skill]}</p>`;
  } else {
    body = `<p>«${n.state === 'follow' ? '¿A dónde vamos?' : n.state === 'camp' ? 'Aquí en el campamento estoy bien.' : 'Te espero aquí.'}»</p><p class="sk">${SKILL_TXT[d.skill]}</p><p>❤️ ${Math.round(n.hp)}%</p>`;
    if (n.state !== 'follow') btn.push(['follow', '🚶 Sígueme']);
    if (n.state !== 'stay') btn.push(['stay', '✋ Espera aquí']);
    if (S.camp && S.campKnown && n.state !== 'camp') btn.push(['camp', '🚩 Ve al campamento']);
    if (!S.camp || !S.campKnown) body += '<p style="opacity:.7;font-size:12px">Habla con Xavi en La Orden del Friki para saber dónde montar el campamento.</p>';
  }
  if (d.trade) btn.push(['trade', '🪙 Comerciar']);
  btn.push(['bye', 'Adiós']);
  $('npcn').innerHTML = `${d.name}<small>${d.role}</small>`; $('npcb').innerHTML = body; $('npcbt').innerHTML = btn.map(([k, t]) => `<button class="pb ${k === 'bye' ? 'x' : ''}" data-a="${k}">${t}</button>`).join('');
}
function talkAction(a) {
  const n = talkN, p = S.p; if (!n) return; const q = n.def.quest;
  if (a === 'bye') { closeTalk(); return; }
  if (a === 'accept') { n.quest = 1; n.qBase = S.kills; S.track = n.def.id; S._qt = null; if (q.type === 'fetch') placeQuestItem(n); msg('📜 Misión aceptada: ' + n.def.name + ' — sigue la guía amarilla del minimapa', 2.6); sfx('pick', 0.8); }
  if (a === 'turnin' && questDone(n)) {
    if (q.type === 'bring') for (const [k, v] of Object.entries(q.items)) takeItems(p, k, v);
    if (q.type === 'fetch') { const it = p.inv.find(i => i.id === 'qitem' && i.who === n.def.id); p.inv.splice(p.inv.indexOf(it), 1); if (n.def.id === 'mario') n.gotGun = true; }
    n.quest = 2; addItem(p, mk('caps', 15 + RI(0, 10))); msg(`✔ ${n.def.name}: ¡gracias! (+chapas)`, 2); sfx('pick', 1);
    if (n.def.first && S.camp) { S.campKnown = true; n.state = 'camp'; n.stay = new V3(S.camp.x + 2, 0, S.camp.z - 3); n.campTalk = true; msg('🚩 Campamento marcado en el mapa (carretera de Sant Fost, al oeste)', 4); }
  }
  if (a === 'join') { n.state = 'follow'; msg(`🤝 ${n.def.name} se une a tu grupo`, 2); sfx('pick', 1); }
  if (a === 'follow') { n.state = 'follow'; n.stay = null; msg(`${n.def.name} te sigue`, 1.4); }
  if (a === 'stay') { n.state = 'stay'; n.stay = n.pos.clone(); msg(`${n.def.name} se queda aquí`, 1.4); }
  if (a === 'camp' && S.camp) { n.state = 'camp'; n.stay = new V3(S.camp.x + R(-4, 4), 0, S.camp.z + R(-4, 4)); msg(`${n.def.name} va al campamento`, 1.6); }
  if (a === 'trade') { openTrade(n); return; }
  renderTalk(); saveSoon();
}
$('npcp').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.a) talkAction(b.dataset.a); });
// ---------- comercio con chapas ----------
function restock(n) { const day = dayNum(); if (n.stockDay === day) return; n.stockDay = day; n.stock = []; const list = STOCK[n.def.trade] || STOCK.food; for (let i = 0; i < 7; i++) { const id = pick(list); n.stock.push(mk(id, ITEMS[id].stack ? (id === 'ammo9' ? 12 : id === 'shells' ? 5 : id === 'nails' ? 15 : 3) : 1)); } }
function priceOf(it, buy) { const v = val(it.id) * it.n * (it.dur !== undefined ? 0.5 + 0.5 * it.dur / MELEE[ITEMS[it.id].melee].dur : 1); return Math.max(1, Math.round(buy ? v * 1.25 : v * 0.6)); }
function openTrade(n) { restock(n); talkN = n; $('npcp').classList.add('hidden'); $('trade').classList.remove('hidden'); renderTrade(); }
function renderTrade() {
  const n = talkN, p = S.p; if (!n) return; const caps = countItem(p, 'caps');
  $('trn').innerHTML = `🪙 Comerciar con ${n.def.name}<small>Tienes ${caps} chapas</small>`;
  $('trmine').innerHTML = p.inv.filter(i => i.id !== 'caps' && i.id !== 'qitem').map(it => itemRow(it, `<button class="ib" data-s="${p.inv.indexOf(it)}">Vender ${priceOf(it, false)}🪙</button>`)).join('') || '<div class="empty">No tienes nada que vender</div>';
  $('trtheirs').innerHTML = n.stock.map((it, i) => itemRow(it, `<button class="ib" data-b="${i}" ${caps >= priceOf(it, true) ? '' : 'disabled style="opacity:.4"'}>Comprar ${priceOf(it, true)}🪙</button>`)).join('') || '<div class="empty">No le queda nada</div>';
}
$('trade').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const n = talkN, p = S.p;
  if (b.id === 'trx') { closeTalk(); return; } if (b.id === 'trback') { $('trade').classList.add('hidden'); $('npcp').classList.remove('hidden'); renderTalk(); return; }
  if (b.dataset.s !== undefined) { const it = p.inv[+b.dataset.s]; if (!it) return; const pr = priceOf(it, false); p.inv.splice(p.inv.indexOf(it), 1); if (p.eq === it) p.eq = null; n.stock.push(it); addItem(p, mk('caps', pr)); sfx('pick', 0.7); }
  if (b.dataset.b !== undefined) { const it = n.stock[+b.dataset.b]; if (!it) return; const pr = priceOf(it, true); if (countItem(p, 'caps') < pr) return; takeItems(p, 'caps', pr); n.stock.splice(n.stock.indexOf(it), 1); addItem(p, it); sfx('pick', 0.9); }
  S.dirty = true; renderTrade(); saveSoon();
});
// ---------- comportamiento ----------
function nearNPC(p, d = 2.6) { let best = null, bd = d; for (const n of S.npcs) { if (!n.alive) continue; const dd = Math.hypot(n.pos.x - p.pos.x, n.pos.z - p.pos.z); if (dd < bd) { bd = dd; best = n; } } return best; }
function hurtNPC(n, dmg) { if (!n.alive) return; n.hp -= dmg; burst(new V3(n.pos.x, n.pos.y + 1.2, n.pos.z), 0xb01818, 6, 3, 0.4); if (n.hp <= 0) { n.alive = false; n.hp = 0; n.deadT = 0; msg(`💀 ${n.def.name} ha muerto…`, 3); sfx('hurt', 1); n.label.visible = false; saveSoon(); } else if (n.state !== 'home' && Math.random() < 0.2) msg(`¡${n.def.name} necesita ayuda!`, 1.2); }
function npcFight(n, dt, guardPos, radius) {
  let best = null, bd = radius; for (const z of S.zombies) { if (!z.alive) continue; const d = z.pos.distanceTo(guardPos || n.pos); if (d < bd) { bd = d; best = z; } }
  if (!best) return null;
  const d = best.pos.distanceTo(n.pos), gun = n.def.gun && (n.def.id !== 'mario' || n.gotGun);
  if (gun && d < 16 && d > 2.2) { if (n.atkCd <= 0) { n.atkCd = 0.9; n.swing = 0.12; const dmg = 28; hurtZombie(best, dmg * R(0.8, 1.2), n.pos, 1); sfxAt('shot', n.pos); emitNoise(n.pos, 35); tracer(new V3(n.pos.x, n.pos.y + 1.45, n.pos.z), new V3(best.pos.x, best.pos.y + 1.3, best.pos.z)); } return { face: best, move: null }; }
  if (d < 1.4) { if (n.atkCd <= 0) { n.atkCd = 0.9; n.swing = 0.32; n.hitT = 0.13; n.hitZ = best; } return { face: best, move: null }; }
  return { face: best, move: best.pos };
}
function npcMoveTo(n, dt, tgt, spd, stopD = 1.2) {
  const dx = tgt.x - n.pos.x, dz = tgt.z - n.pos.z, d = Math.hypot(dx, dz);
  if (d < stopD) { n.vel.multiplyScalar(0.8); return d; }
  let mx = dx / d, mz = dz / d;
  if (n.stuckT > 0.8) { const s = n.sideS || 1; const t = mx; mx = mx * 0.3 - mz * s; mz = mz * 0.3 + t * s; }
  n.vel.x = lerp(n.vel.x, mx * spd, Math.min(1, dt * 8)); n.vel.z = lerp(n.vel.z, mz * spd, Math.min(1, dt * 8));
  const b = n.pos.clone(); n.pos.x += n.vel.x * dt; n.pos.z += n.vel.z * dt; collide(n.pos, 0.34, 1.8);
  const moved = n.pos.distanceTo(b); if (moved < spd * dt * 0.3) { n.stuckT += dt; if (n.stuckT > 2.5) { n.stuckT = 0; n.sideS = -(n.sideS || 1); } } else n.stuckT = Math.max(0, n.stuckT - dt);
  n.yaw = Math.atan2(-n.vel.x, -n.vel.z); return d;
}
function updateNPCs(dt) {
  const p = S.p; if (!p) return;
  for (const n of S.npcs) {
    const cd = Math.abs(n.pos.x - camera.position.x) + Math.abs(n.pos.z - camera.position.z);
    if (n.state === 'home' && n.hp < 100) n.hp = 100;
    if (!n.alive) { n.deadT = (n.deadT || 0) + dt; n.model.position.copy(n.pos); n.model.rotation.x = -Math.min(1, n.deadT * 2.5) * Math.PI / 2; n.model.visible = cd < 120; continue; }
    if (n.atkCd > 0) n.atkCd -= dt; if (n.swing > 0) n.swing -= dt;
    if (n.hitT > 0) { n.hitT -= dt; if (n.hitT <= 0 && n.hitZ && n.hitZ.alive && n.hitZ.pos.distanceTo(n.pos) < 1.8) { hurtZombie(n.hitZ, 22 * R(0.85, 1.15), n.pos, 3); sfxAt('thud', n.pos); } }
    let act = null, spd = 0;
    if (n.state === 'follow') {
      const dd = n.pos.distanceTo(p.pos);
      if (S.drive) { n.pos.copy(S.drive.pos); n.model.visible = false; n.label.visible = false; continue; }
      if (dd > 45) { n.pos.set(p.pos.x + Math.sin(p.yaw) * 2.5, p.pos.y, p.pos.z + Math.cos(p.yaw) * 2.5); collide(n.pos, 0.34, 1.8); }
      act = npcFight(n, dt, p.pos, 10);
      if (act && act.move) spd = npcMoveTo(n, dt, act.move, 4.2, 1.0);
      else if (!act) { const fx = p.pos.x + Math.sin(p.yaw) * 2.2 + Math.cos(p.yaw) * (S.npcs.indexOf(n) % 2 ? 1.2 : -1.2), fz = p.pos.z + Math.cos(p.yaw) * 2.2 - Math.sin(p.yaw) * (S.npcs.indexOf(n) % 2 ? 1.2 : -1.2); const d = npcMoveTo(n, dt, new V3(fx, 0, fz), dd > 8 ? 5.4 : 3.4, 0.8); spd = d; }
    } else if (n.state === 'stay' || n.state === 'camp') {
      const home = n.stay || n.pos; act = npcFight(n, dt, home, n.state === 'camp' && n.def.skill === 'fighter' ? 22 : 12);
      if (act && act.move) npcMoveTo(n, dt, act.move, 4, 1.0);
      else if (!act) { if (n.pos.distanceTo(home) > 1.5) { const cs = typeof CITY !== 'undefined' && CITY.campSpot, inCamp = q => cs && q.x > cs.X0 && q.x < cs.X1 && q.z > cs.Z0 && q.z < cs.Z1; const blocked = (inCamp(home) && !inCamp(n.pos) && n.pos.distanceTo(home) < 35) || n.stuckT > 2.2; if ((n.pos.distanceTo(home) > 60 || blocked) && n.pos.distanceTo(p.pos) > 18) { n.pos.set(home.x, getH(home.x, home.z), home.z); n.stuckT = 0; } else npcMoveTo(n, dt, home, 3.4, 1.2); } else { n.vel.multiplyScalar(0.85); n.wanderT = (n.wanderT || R(4, 9)) - dt; if (n.wanderT <= 0) { n.wanderT = R(5, 12); n.stay = new V3((S.camp && n.state === 'camp' ? S.camp.x : home.x) + R(-4, 4), 0, (S.camp && n.state === 'camp' ? S.camp.z : home.z) + R(-4, 4)); } } }
      if (n.state === 'camp') campJob(n, dt);
    } else if (n.def.roam && cd > 170) { n.model.visible = false; continue;
    } else if (n.def.roam && !S.talkOpen) { // deambula por las calles cerca de su zona
      act = npcFight(n, dt, n.pos, 7); const dd = n.pos.distanceTo(p.pos);
      if (act && act.move) npcMoveTo(n, dt, act.move, 3.8, 1.0);
      else if (!act) { if (dd < 4.5) { n.vel.multiplyScalar(0.8); n.yaw = Math.atan2(-(p.pos.x - n.pos.x), -(p.pos.z - n.pos.z)); }
        else { n.roamT = (n.roamT ?? R(0, 6)) - dt; if (!n.goal || n.roamT <= 0 || n.stuckT > 2) { n.roamT = R(14, 30); n.stuckT = 0; const pts = CITY.streetPts; let best = null; for (let k = 0; k < 12; k++) { const q = pts[RI(0, pts.length - 1)]; if (Math.hypot(q[0] - n.home[0], q[1] - n.home[1]) < 45 && Math.hypot(q[0] - n.pos.x, q[1] - n.pos.z) > 6) { best = q; break; } } n.goal = best ? new V3(best[0], 0, best[1]) : null; n.rest = R(2, 7); }
          if (n.goal) { if (npcMoveTo(n, dt, n.goal, 1.5, 1.2) < 1.2) { n.rest -= dt; if (n.rest <= 0) n.goal = null; } } else n.vel.multiplyScalar(0.8); } }
    } else { // en su refugio
      act = npcFight(n, dt, n.pos, 6); if (act && act.move) npcMoveTo(n, dt, act.move, 3.6, 1.0); else { n.vel.multiplyScalar(0.8); const dd = n.pos.distanceTo(p.pos); if (dd < 7) n.yaw = Math.atan2(-(p.pos.x - n.pos.x), -(p.pos.z - n.pos.z)); }
    }
    if (n.state !== 'camp') n.job = false;
    if (act && act.face) n.yaw = Math.atan2(-(act.face.pos.x - n.pos.x), -(act.face.pos.z - n.pos.z));
    if (!act && n.hp < 100) n.hp = Math.min(100, n.hp + dt * 0.5);
    n.pos.y = getH(n.pos.x, n.pos.z);
    animNPC(n, dt, cd);
  }
}
function animNPC(n, dt, cd) {
  const m = n.model; m.visible = cd < 110; n.label.visible = cd > 4 && cd < 22; if (!m.visible) return;
  m.position.copy(n.pos); n.bodyYaw += angDiff(n.bodyYaw, n.yaw) * Math.min(1, dt * 10); m.rotation.set(0, n.bodyYaw, 0);
  const P = n.c.P, sp = Math.hypot(n.vel.x, n.vel.z), run = sp > 4.3, mv = Math.min(1, sp / (run ? 4.5 : 2.6)), t = S.time, ph = n.ph || (n.ph = n.def.id.length * 1.7 + n.home[0]); n.walk += sp * dt * (run ? 1.95 : 2.6);
  locoPose(P, n.walk, mv, run, t, ph);
  const idle = 1 - mv, gun = n.def.gun && (n.def.id !== 'mario' || n.gotGun);
  // mira alrededor; si el jugador está cerca le mira y le saluda
  const pd = S.p ? Math.hypot(S.p.pos.x - n.pos.x, S.p.pos.z - n.pos.z) : 99;
  if (pd < 7 && n.state === 'home') { if (!n.near) { n.near = true; n.greet = 1.5; } } else if (pd > 10) n.near = false;
  P.head.rotation.y += Math.sin(t * 0.6 + ph) * 0.3 * idle * (pd < 7 ? 0.2 : 1); P.head.rotation.x += Math.sin(t * 0.37 + ph) * 0.06 * idle;
  if (gun && n.atkCd > 0.45) { const kick = n.swing > 0 ? n.swing / 0.12 : 0; P.aR.rotation.set(Math.PI / 2 + kick * 0.25, 0, -0.08); P.eR.rotation.x = 0.06; P.aL.rotation.set(Math.PI / 2 - 0.05, -0.55, 0.35); P.eL.rotation.x = 0.35; P.body.rotation.y = -0.25; P.head.rotation.y = 0.25; }
  else if (n.swing > 0 && !gun) meleePose(P, 1 - n.swing / 0.32);
  else { P.aR.rotation.x = P.aR.rotation.x * 0.45 + 0.4; P.eR.rotation.x = 0.55; }
  if (n.greet > 0) { n.greet -= dt; const g = Math.sin(Math.min(1, (1.5 - n.greet) * 4) * Math.PI / 2) * Math.min(1, n.greet * 5); P.aL.rotation.set(2.75 * g, 0, -0.35 * g - 0.07); P.eL.rotation.x = 0.5 * g + Math.sin(t * 11) * 0.3 * g; }
  else if (n.job && idle > 0.8) { const k = Math.sin(t * 5 + ph); P.body.rotation.x = -0.45; P.aL.rotation.set(0.9 + k * 0.25, 0, 0.1); P.aR.rotation.set(0.9 - k * 0.25, 0, -0.1); P.eL.rotation.x = P.eR.rotation.x = 0.7; P.kL.rotation.x = P.kR.rotation.x = -0.5; P.lL.rotation.x = P.lR.rotation.x = 0.5; }
}
// trabajos en el campamento
function campBox() { return S.camp && S.camp.pc && S.camp.pc.cont; }
function campJob(n, dt) {
  const p = S.p, box = campBox(), sk = n.def.skill; if (!S.camp) return;
  n.wk = (n.wk ?? R(5, 20)) - dt; if (n.wk < -5) n.wk = R(10, 25); n.job = n.wk < 0 && sk !== 'fighter' && sk !== 'trader';
  const pIn = Math.hypot(p.pos.x - S.camp.x, p.pos.z - S.camp.z) < 12;
  if (sk === 'medic' && pIn && p.alive) { if (p.hp < 100) p.hp = Math.min(100, p.hp + 2 * dt); if (p.bleed) { p.bleed = 0; msg(`${n.def.name} te ha vendado la herida`, 1.6); } for (const o of S.npcs) if (o.alive && o.state === 'camp' && o.hp < 100) o.hp = Math.min(100, o.hp + 3 * dt); }
  if (sk === 'mechanic') for (const c of S.cars) if (Math.hypot(c.pos.x - S.camp.x, c.pos.z - S.camp.z) < 18 && c !== S.drive) { c.fuel = Math.min(100, c.fuel + dt * 0.4); if (c.hp > 0) c.hp = Math.min(100, c.hp + dt * 0.6); }
  if (sk === 'builder') for (const b of S.built) { if (b.city || BUILD[b.type].floor) continue; if (Math.hypot(b.x - S.camp.x, b.z - S.camp.z) < 25 && b.hp < BUILD[b.type].hp) b.hp = Math.min(BUILD[b.type].hp, b.hp + 4 * dt); }
  n.jobT -= dt; if (n.jobT > 0 || !box) return; n.jobT = R(140, 220);
  const add = id => { if (box.items.length < 24) { box.items.push(mk(id, ITEMS[id].stack ? RI(2, 5) : 1)); if (pIn) msg(`📦 ${n.def.name} ha dejado ${ITEMS[id].ic} ${ITEMS[id].n} en el almacén`, 2); } };
  if (sk === 'medic') add('bandage'); else if (sk === 'cook') add('stew'); else if (sk === 'farmer') add('veg'); else if (sk === 'mechanic') add(rand() < 0.5 ? 'gas' : 'scrap'); else if (sk === 'scavenger') add(pick(['plank', 'nails', 'rag', 'rope', 'beans', 'water', 'scrap', 'stick', 'ammo9'])); else if (sk === 'trader') add('caps'); else if (sk === 'builder') add(rand() < 0.5 ? 'plank' : 'nails');
}
function npcSaveData() { return S.npcs.map(n => ({ id: n.def.id, state: n.state, x: +n.pos.x.toFixed(1), z: +n.pos.z.toFixed(1), hp: Math.round(n.hp), quest: n.quest, qBase: n.qBase, home: n.home, stay: n.stay ? [+n.stay.x.toFixed(1), +n.stay.z.toFixed(1)] : null, gotGun: !!n.gotGun, qSpot: n.qSpot || null })); }
