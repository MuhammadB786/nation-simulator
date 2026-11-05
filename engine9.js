/*__wait*/(function __w(){ if (!(window.NationData && window.WorldContext && window.Politics && window.NSContent && window.NSContent7 && window.NSContent8 && window.NSWorld)) { setTimeout(__w, 15); return; }
/* Nation Sim v6 engine: simulation, groups, negotiations, elections. Content lives in game-content.js. */
(function(){
const C = o => JSON.parse(JSON.stringify(o));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = v => Math.round(v * 10) / 10;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TERM = 48;
const dateOf = m => { const i = 9 + m - 1; return MONTHS[i % 12] + ' ' + (2026 + Math.floor(i / 12)); };
const shortDate = m => { const i = 9 + m - 1; return MONTHS[i % 12].slice(0, 3).toUpperCase() + ' ' + (2026 + Math.floor(i / 12)); };
const ND = () => window.NationData, WC = () => window.WorldContext, K = () => window.NSContent;
const H = s => ND().hash(s);

const PRESETS = {
  'Pakistan':  { y10:12.4, effK:0.85, def:6.8, res:2.4, imf:true, lend:52, target:-0.5 },
  'Argentina': { debt:85, y10:11, eff:2.6, def:0.2, res:1.9, imf:true, cpi:24, lend:48, target:-1.6 },
  'Sri Lanka': { y10:10.5, effK:0.85, def:6.6, res:3.4, imf:true, lend:55, target:-1.8 },
  'Egypt':     { y10:16, effK:0.8, def:7, res:5.5, imf:true, cpi:15, lend:50, target:-3 }
};

const GROUPS = {
  army:     { label:'ARMY',     icon:'★', wants:'a protected budget and no civilian interference' },
  clergy:   { label:'CLERGY',   icon:'☾', wants:'laws checked against faith and their schools left alone' },
  business: { label:'BUSINESS', icon:'◆', wants:'stable taxes, dollar access and contracts' },
  labour:   { label:'UNIONS',   icon:'⚒', wants:'wages that keep up with prices and no layoffs' },
  urban:    { label:'CITIES',   icon:'▦', wants:'lower prices, jobs and working services' },
  rural:    { label:'FARMERS',  icon:'❦', wants:'input subsidies, water and roads' },
  youth:    { label:'YOUTH',    icon:'✦', wants:'jobs, cheap data and a say' },
  elites:   { label:'PARTY BARONS', icon:'♜', wants:'ministries, funds and protection from prosecution' },
  lenders:  { label:'IMF & MARKETS', icon:'$', wants:'a primary surplus, reform and repayment' }
};
const PUBLIC = ['urban','rural','youth','labour'];

function titleOf(b) { return ({ P:'President', S:'President', PA:'Prime Minister', M:'Prime Minister', AB:'Leader', O:'Interim Leader' })[b.gov] || 'Leader'; }
function isDemocracy(b, rg) { return !rg.closed && b.gov !== 'AB'; }

function nations() {
  return ND().NATIONS.filter(n => n.pop >= 1).map(n => {
    const pol = window.Politics.DATA[n.name];
    return { name:n.name, region:n.regionName, pop:n.pop, difficulty:n.difficulty, head:pol ? pol.head : titleOf(n), real:!!pol, imf:!!PRESETS[n.name] };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function groupNames(b, rg) {
  const blocs = WC().blocsOf(b, rg) || [];
  const find = id => (blocs.find(x => x.id === id) || {}).name;
  const muslim = /Pakistan|Iran|Egypt|Saudi|Afghan|Bangladesh|Indonesia|Malaysia|Turkey|Iraq|Algeria|Morocco|Nigeria|Jordan|Syria|Yemen|Tunisia|Libya|Sudan|Senegal|Mali|Niger|Somalia/.test(b.name);
  return {
    army: find('army') || 'the army high command', clergy: find('clergy') || (muslim ? 'the ulema councils' : 'the church hierarchy'),
    business: 'the chambers of commerce', labour: find('unions') || 'the trade union federation', urban: find('urban') || 'the urban middle class',
    rural: find('rural') || 'the farming districts', youth: find('youth') || 'young voters', elites: find('dynasty') || find('brokers') || 'the party barons',
    lenders: 'the IMF and bond markets'
  };
}

function newGame(name, ch) {
  ch = ch || {};
  const playerName = ch.name;
  const b = ND().BY_NAME[name], rg = WC().regimeOf(b, ND().hash), pre = PRESETS[name] || {};
  const pol = window.Politics.landscape(b, rg, WC(), ND().hash);
  const prov = WC().regionsOf(b, ND().hash) || [];
  const cap = (WC().capitals || {})[name] || 'the capital';
  const muslimOrCath = /Pakistan|Iran|Egypt|Saudi|Afghan|Bangladesh|Indonesia|Malaysia|Turkey|Iraq|Algeria|Morocco|Nigeria|Italy|Poland|Philippines|Mexico|Brazil|Argentina|Colombia|Peru|Chile|Spain|Ireland|Portugal|Croatia|Senegal|Mali|Niger|Somalia|Sudan|Jordan|Syria|Yemen|Tunisia|Libya|Lebanon/.test(name);
  const present = ['business','labour','urban','rural','youth','lenders'];
  if (rg.military || rg.coupRisk > 0.08 || rg.nuclear || b.difficulty >= 4) present.unshift('army');
  if (muslimOrCath || (WC().blocsOf(b, rg) || []).some(x => x.id === 'clergy')) present.splice(1, 0, 'clergy');
  if (rg.dynastic || rg.patronage > 0.5 || pol.parties.some(x => x.role === 'coalition')) present.push('elites');
  const names = groupNames(b, rg);
  const groups = {};
  present.forEach(k => groups[k] = { s:Math.round(clamp(50 + (H(name + k) - 0.5) * 22, 30, 70)), mem:[] });
  if (pre.lend) groups.lenders.s = pre.lend;
  if (groups.army && rg.military) groups.army.s = Math.max(groups.army.s, 55);
  const debt = pre.debt || b.debt, y10 = pre.y10 || b.yield10, def = pre.def != null ? pre.def : b.deficit;
  const eff = pre.eff || y10 * (pre.effK || 0.85);
  const s = { approval:b.approval, stability:b.stability, unity:b.cohesion || 55, growth:b.gdpGrowth, inflation:pre.cpi || b.cpi, unemp:b.unemployment,
    debt, eff, reserves:pre.res || b.reserveMonths, prem:0, pdef:r1(def - debt * eff / 100) };
  const total = pol.parties.reduce((a, p) => a + p.seats, 0) || 100;
  const govSeats = pol.parties.filter(p => p.role !== 'opp').reduce((a, p) => a + p.seats, 0);
  const g = {
    v:6, nation:name, player:playerName || (pol.head && !pol.generated ? pol.head.replace(/^(Prime Minister|President|Chancellor|General Secretary|Supreme Leader|Chief Adviser)\s+/, '') : 'You'),
    title:pol.head && !pol.generated ? pol.head.split(' ').slice(0, pol.head.startsWith('Prime') || pol.head.startsWith('General Secretary') || pol.head.startsWith('Supreme') || pol.head.startsWith('Chief') ? 2 : 1).join(' ') : titleOf(b),
    cap, prov, month:1, s, s0:null, base:{ growth:b.gdpGrowth, inflation:pre.cpi ? r1(pre.cpi * 0.55) : b.cpi, unemp:b.unemployment, diff:b.difficulty, hard:!!b.hardCurrency, ext:b.externalShare || 0.4, mat:b.avgMaturity || 5 },
    mods:{ growth:0, inflation:0, unemp:0 }, groups, gnames:names, pol, total, govSeats, demo:isDemocracy(b, rg), regime:{ military:!!rg.military, dynastic:!!rg.dynastic },
    imf:pre.imf ? { status:'active', target:pre.target, next:3, fails:0, since:0 } : { status:'none', target:null, next:0, fails:0 },
    laws:[], conceded:{}, tags:{}, queue:[], used:{}, hist:[], cur:null, over:null, defaulted:0, seed:Math.floor(Math.random() * 1e6)
  };
  setupCharacter(g, ch, b, rg);
  g.world = window.NSWorld.initWorld(name, g.seed);
  if (ch.traits && ch.traits.includes('diplomat')) Object.keys(g.world.rel).forEach(k => g.world.rel[k] = clamp(g.world.rel[k] + 8, 0, 100));
  if (ch.flaw === 'hothead' && g.world.rival) g.world.rel[g.world.rival] = clamp(g.world.rel[g.world.rival] - 6, 0, 100);
  const pc = b.perCapita;
  g.budget = { health:r1(clamp(pc / 9000 + 1, 1, 8)), education:r1(clamp(2 + pc / 30000, 2, 5.5)), welfare:r1(clamp(pc / 3500, 1, 16)), defence:r1(rg.military || b.difficulty >= 4 ? 2.8 : 1.6), infra:r1(clamp(4 - pc / 40000, 2, 5)), police:r1(1.2) };
  g.tax = { income:Math.round(clamp(10 + pc / 1500, 10, 45)), corporate:Math.round(clamp(20 + (H(name + 'ct') - 0.5) * 10, 15, 33)), sales:Math.round(clamp(12 + (H(name + 'st') - 0.5) * 10, 5, 22)) };
  g.mil = { strength:clamp(Math.round(window.NSWorld.power(name) * 0.75 + g.budget.defence * 3), 10, 98), readiness:clamp(Math.round(50 + (rg.military ? 15 : 0) + (H(name + 'rd') - 0.5) * 20), 20, 90), nuclear:!!(WC().NUCLEAR && WC().NUCLEAR.includes(name)) };
  g.provs = (g.prov.length ? g.prov : ['North','South','East','West']).slice(0, 6).map((p, i) => ({ name:p, support:Math.round(clamp(g.s.approval + (H(name + p) - 0.5) * 30, 15, 85)), unrest:Math.round(clamp(30 + (H(name + p + 'u') - 0.5) * 50 + (i === 2 ? 10 : 0), 5, 90)) }));
  g.pop = { total:b.pop, urban:Math.round(clamp(30 + Math.log10(pc) * 12, 18, 92)), youth:Math.round(clamp(52 - Math.log10(pc) * 8, 14, 50)), literacy:Math.round(clamp(40 + Math.log10(pc) * 14, 40, 99)), culture:WC().cultureOf(b) };
  g.apMax = ch.traits && ch.traits.includes('workaholic') ? 4 : 3; g.ap = g.apMax;
  setupV8(g, b, rg);
  g.s.prem = r1(y10 - marketRaw(g));
  g.s0 = C(g.s);
  g.s0.govSeats = govSeats;
  return startMonth(g);
}

function setupCharacter(g, ch, b, rg) {
  const C7 = window.NSContent7;
  g.char = { name:ch.name || g.player, age:ch.age || 58, background:ch.background || 'Lawyer', traits:ch.traits || [], flaw:ch.flaw || null, ideology:ch.ideology || 'Centre', party:null };
  g.player = g.char.name;
  const P = g.pol.parties;
  let mine;
  if (ch.party === '__new') {
    const take = Math.round(g.total * 0.36); mine = { name:ch.partyName || 'New Movement', short:(ch.partyName || 'New Movement').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4), leader:g.char.name, ideology:g.char.ideology, seats:take, role:'gov', record:'' };
    P.forEach(p => { const cut = Math.min(p.seats, Math.round(take * p.seats / g.total)); p.seats -= cut; if (p.role === 'gov') p.role = 'opp'; if (p.role === 'coalition') p.role = 'opp'; });
    P.unshift(mine);
  } else {
    mine = P.find(p => p.short === ch.party) || P.find(p => p.role === 'gov') || P[0];
    if (mine && mine.role !== 'gov') { const old = P.find(p => p.role === 'gov'); if (old) { const t = old.seats; old.seats = mine.seats; mine.seats = t; old.role = 'opp'; } P.filter(p => p.role === 'coalition').forEach(p => p.role = 'opp'); mine.role = 'gov'; }
    if (mine) mine.leader = g.char.name;
  }
  g.char.party = mine ? mine.name + ' (' + mine.short + ')' : '';
  g.govSeats = P.filter(p => p.role !== 'opp').reduce((a, p) => a + p.seats, 0);
  if (g.govSeats / g.total < 0.5) { const opps = P.filter(p => p.role === 'opp'); const partner = opps.filter(p => p.seats < g.govSeats).sort((a, b) => b.seats - a.seats)[0] || opps.sort((a, b) => a.seats - b.seats)[0]; if (partner) { partner.role = 'coalition'; g.govSeats += partner.seats; } }
  const bump = gr => Object.keys(gr || {}).forEach(k => { if (g.groups[k]) g.groups[k].s = clamp(g.groups[k].s + gr[k], 5, 95); });
  bump((C7.IDEOLOGIES[g.char.ideology] || {}).gr); bump(C7.BG_FX[g.char.background]);
  g.char.traits.forEach(t => { const T = C7.TRAITS[t]; if (!T) return; bump(T.gr); applyFx(g, T.start || {}); });
  if (g.char.flaw) { const F = C7.FLAWS[g.char.flaw]; if (F) { bump(F.gr); applyFx(g, F.start || {}); } }
}
const RH = s => H(s + '#' + H(s + 'x').toFixed(7) + H('q' + s).toFixed(5));
function setupV8(g, b, rg) {
  const C8 = window.NSContent8, pc = b.perCapita, name = g.nation;
  const lg = Math.log10(Math.max(300, pc));
  g.tech = {}; C8.TECH.forEach(t => g.tech[t.k] = Math.round(clamp((lg - 2.6) * 32 + (H(name + t.k) - 0.5) * 24, 5, 92)));
  const landlocked = C8.LANDLOCKED.includes(name), st = g.mil.strength;
  g.mil.landlocked = landlocked;
  g.mil.army = Math.round(clamp(st + (H(name + 'ar') - 0.4) * 16, 10, 98)); g.mil.air = Math.round(clamp(st + (H(name + 'af') - 0.55) * 20, 8, 98)); g.mil.navy = landlocked ? 0 : Math.round(clamp(st + (H(name + 'nv') - 0.6) * 24, 5, 98));
  g.mil.tech = { drones:Math.round(clamp(st * 0.6 + (H(name + 'dr') - 0.5) * 30, 5, 90)), cyber:Math.round(clamp(st * 0.5 + (H(name + 'cy') - 0.5) * 30, 5, 90)), missiles:Math.round(clamp(st * 0.6 + (g.mil.nuclear ? 25 : 0) + (H(name + 'ms') - 0.5) * 20, 5, 95)), space:Math.round(clamp(st * 0.4 + (H(name + 'sp') - 0.5) * 30, 0, 90)) };
  const govP = g.pol.parties.find(p => p.role === 'gov') || { short:'GOV' }, coP = g.pol.parties.filter(p => p.role === 'coalition');
  g.ministers = C8.MINISTRIES.map((m, i) => { const tech = RH(name + 'mt' + i + g.seed) < 0.25; return { k:m.k, post:m.name, name:WC().personName(b, 'min' + i + '_' + g.seed, RH), party:tech ? 'Technocrat' : (coP.length && RH(name + 'mp' + i + g.seed) < 0.3 ? coP[0].short : govP.short), comp:Math.round(tech ? 65 + RH(name + 'mc' + i + g.seed) * 25 : 25 + RH(name + 'mc' + i + g.seed) * 55), loyal:Math.round(tech ? 35 + RH(name + 'ml' + i + g.seed) * 25 : 50 + RH(name + 'ml' + i + g.seed) * 45), since:1 }; });
  if (g.char) g.ministers[0].note = '';
  const sen = C8.SENATES[name];
  const exec = rg.military && rg.closed ? 'Military-led' : rg.closed ? 'One-party' : ['P','S'].includes(b.gov) ? (b.gov === 'S' ? 'Semi-presidential' : 'Presidential') : 'Parliamentary';
  g.sys = { exec, chambers:sen && !C8.UNICAMERAL.includes(name) ? 2 : C8.UNICAMERAL.includes(name) ? 1 : (b.pop > 30 ? 2 : 1), electoral:/Germany|New Zealand|Japan|Mexico|Pakistan|Hungary|South Korea|Italy/.test(name) ? 'Mixed' : /United States|United Kingdom|India|Canada|Nigeria|Bangladesh|Malaysia|Ghana|Kenya|France/.test(name) ? 'First past the post' : 'Proportional',
    federal:/United States|India|Pakistan|Germany|Brazil|Argentina|Mexico|Nigeria|Russia|Canada|Australia|Malaysia|Ethiopia|Switzerland|Austria|Belgium|Iraq|Somalia|Nepal|Bosnia|Sudan|Venezuela|United Arab Emirates/.test(name),
    termLimits:!rg.closed && !rg.military, judiciary:Math.round(clamp(rg.closed ? 15 : 40 + (lg - 3) * 18 + (H(name + 'jd') - 0.5) * 20, 5, 95)), voteAge:/Austria|Brazil|Argentina|Ecuador|Nicaragua|Cuba|Malta/.test(name) ? 16 : 18, antiDefection:/India|Pakistan|Bangladesh|Nepal|Sri Lanka/.test(name), emergency:0 };
  if (g.sys.chambers === 2) { const nm = sen ? sen[0] : 'Senate', tot = sen ? sen[1] : 100; const share = clamp(g.govSeats / g.total + (H(name + 'sen') - 0.55) * 0.18, 0.2, 0.85); g.senate = { name:nm, total:tot, gov:Math.round(tot * share) }; } else g.senate = null;
}
function ministerFor(g, cat) { const C8 = window.NSContent8; const m = (g.ministers || []).filter(x => (C8.MINISTRIES.find(y => y.k === x.k) || { cats:[] }).cats.includes(cat)); return m[0] || null; }
function chamberShares(g) { const lo = g.govSeats / g.total * 100; const hi = g.senate ? g.senate.gov / g.senate.total * 100 : lo; return { lo:r1(lo), hi:r1(hi) }; }
const hasT = (g, t) => !!(g.char && (g.char.traits.includes(t) || g.char.flaw === t));
function marketRaw(g) {
  const s = g.s, b = g.base;
  return (b.hard ? 2.2 : 4) + s.inflation * 0.35 + Math.max(0, s.debt - 60) * 0.04 + Math.max(0, 3 - s.reserves) * 1.2 + (b.diff - 3) * 1.3
    + (g.imf.status === 'active' ? -1 : g.imf.status === 'suspended' ? 2 : 0) + (g.defaulted ? 6 : 0)
    + (g.groups.lenders.s < 30 ? 1 : g.groups.lenders.s > 70 ? -0.4 : 0);
}
const market = g => r1(clamp(marketRaw(g) + g.s.prem, 0.5, 45));
const interest = g => r1(g.s.debt * g.s.eff / 100);
const deficit = g => r1(g.s.pdef + interest(g));
function rating(g) {
  const s = g.s, b = g.base;
  if (g.defaulted && g.month - g.defaulted < 18) return 'D';
  const sc = 100 - s.debt * 0.35 - Math.max(0, deficit(g)) * 2 - Math.max(0, 6 - s.reserves) * 3 - (b.diff - 1) * 4 + (b.hard ? 12 : 0) + (g.imf.status === 'active' ? 3 : 0) - (g.defaulted ? 10 : 0);
  const L = ['CCC','B-','B','B+','BB-','BB','BB+','BBB-','BBB','BBB+','A-','A','A+','AA-','AA','AA+','AAA'];
  const capIx = b.hard ? 16 : b.diff >= 4 ? 5 : b.diff >= 3 ? 9 : 13;
  return L[clamp(Math.round((sc - 22) / 4.2), 0, Math.min(capIx - (g.defaulted ? 3 : 0), L.length - 1))];
}

/* ---------- context for content ---------- */
function ctx(g) {
  const pol = g.pol, F = g.groups;
  const opp = pol.parties.filter(p => p.role === 'opp').sort((a, b) => b.seats - a.seats)[0] || { name:'the opposition', short:'OPP', leader:'the opposition leader', seats:0 };
  const gov = pol.parties.find(p => p.role === 'gov') || { name:'your party', short:'GOV', leader:g.player, seats:0 };
  const partner = pol.parties.filter(p => p.role === 'coalition').sort((a, b) => b.seats - a.seats)[0] || null;
  const tag = k => (g.tags[k] || []).length;
  const recall = (k, pre) => { const t = (g.tags[k] || [])[0]; return t ? (pre == null ? ' ' : pre) + 'In ' + dateOf(t.m) + ' you ' + t.text + '.' : ''; };
  return {
    g, N:g.nation, cap:g.cap, P:g.prov[0] || 'the largest province', P2:g.prov[1] || 'the second province', P3:g.prov[2] || g.prov[0] || 'the border province',
    opp, gov, partner, has:k => !!F[k], sup:k => F[k] ? F[k].s : 50, s:g.s, m:g.month, tag, recall, title:g.title, me:g.player,
    gn:k => g.gnames[k], law:id => g.laws.some(l => l.id === id), conc:id => !!g.conceded[id], imf:g.imf.status, demo:g.demo,
    PK:g.nation === 'Pakistan', AR:g.nation === 'Argentina', LK:g.nation === 'Sri Lanka', EG:g.nation === 'Egypt',
    def:deficit(g), rate:market(g), rnd:x => H(g.seed + x + g.month), hard:g.base.hard, mil:g.regime.military, rival:g.world && g.world.rival
  };
}

/* ---------- month flow ---------- */
function pickEvent(g, excl) {
  excl = excl || [];
  const X = ctx(g), E = K().EVENTS;
  const due = g.queue.filter(q => q.m <= g.month).sort((a, b) => (b.p || 0) - (a.p || 0));
  for (const q of due) {
    g.queue = g.queue.filter(x => x !== q);
    if (q.data && !excl.includes('ai_dyn')) return { id:'ai_dyn', from:q.from || null, data:q.data };
    if (q.data) { g.queue.push(q); continue; }
    if (excl.includes(q.id)) { g.queue.push(q); continue; }
    if (q.world) return { id:q.id, world:q.world };
    const e = E.find(x => x.id === q.id);
    if (e && (!e.ok || e.ok(X))) return { id:e.id, from:q.from || null };
  }
  const picked = excl.map(id => E.find(x => x.id === id)).filter(Boolean);
  const nOpp = picked.filter(x => x.tone === 'opp').length, nCri = picked.length - nOpp, cats = picked.map(x => x.cat);
  const relax = excl.includes('__');
  const need = relax ? null : nOpp >= 2 ? 'crisis' : (picked.length >= 3 && nCri === 3) || (picked.length >= 2 && nOpp === 0 && nCri >= 2) ? 'opp' : null;
  const wantOpp = need === 'opp';
  const pool = E.filter(e => !excl.includes(e.id) && (!e.ok || e.ok(X)) && (!need || (need === 'opp' ? e.tone === 'opp' : e.tone !== 'opp'))).map(e => ({ e, w:(e.w ? e.w(X) : 0) * (relax || !cats.includes(e.cat) ? 1 : 0.15) * (e.tone === 'opp' ? 0.6 : 1) * (g.used[e.id] != null ? (e.once ? 0 : g.month - g.used[e.id] < 10 ? 0 : 0.5) : 1) })).filter(x => x.w > 0);
  const tot = pool.reduce((a, x) => a + x.w, 0);
  let r = H(g.seed + 'ev' + g.month) * tot;
  for (const x of pool) { r -= x.w; if (r <= 0) return { id:x.e.id }; }
  return pool.length ? { id:pool[0].e.id } : need && !relax ? pickEvent(g, [...excl, '__']) : { id:'quiet' };
}
function offers(g) {
  const X = ctx(g), out = {};
  K().CATS.forEach(cat => {
    const av = K().AGENDA.filter(a => a.cat === cat && !g.laws.some(l => l.id === a.id) && !(a.concede && a.concede.every(c => g.conceded[c])) && (!a.ok || a.ok(X)));
    av.sort((a, b) => H(g.seed + a.id + g.month) - H(g.seed + b.id + g.month));
    out[cat] = av.slice(0, 3).map(a => a.id);
  });
  return out;
}
function cardText(g, card) {
  g.dynNow = card.data || null; g.dynWorld = card.world || null;
  const e = K().EVENTS.find(x => x.id === card.ev);
  return { t:e.f(ctx(g)), e };
}
function startMonth(g) {
  g = C(g);
  g.ap = g.apMax || 3;
  const cards = [], excl = [];
  for (let i = 0; i < 4; i++) {
    const pick = pickEvent(g, excl);
    if (!pick || excl.includes(pick.id)) break;
    excl.push(pick.id); if (pick.id !== 'quiet') g.used[pick.id] = g.month;
    const card = { ev:pick.id, data:pick.data || null, world:pick.world || null, done:null };
    const { t, e } = cardText(g, card);
    card.text = { title:t.title, body:t.body, why:t.why || '', tone:e.tone || 'crisis', cat:pick.id === 'ai_dyn' && pick.data ? pick.data.cat : e.cat, opts:t.opts.map(o => ({ l:o.l, d:o.d, chips:chipsOf(g, o), neg:o.neg || null })) };
    cards.push(card);
    if (pick.id === 'quiet') break;
  }
  g.dynNow = null; g.dynWorld = null;
  g.cur = { cards, offers:offers(g), results:[], s0:C(g.s), g0:Object.fromEntries(Object.keys(g.groups).map(k => [k, g.groups[k].s])) };
  return g;
}

function chipsOf(g, o) {
  const out = [];
  if (o.neg) { const N = K().NEGS[o.neg]; out.push({ t:'NEGOTIATE · ' + GROUPS[N.party].label, c:'neg' }); return out; }
  Object.keys(o.gr || {}).forEach(k => { if (g.groups[k] && Math.abs(o.gr[k]) >= 3) out.push({ t:GROUPS[k].label + (o.gr[k] > 0 ? ' ▲' : ' ▼'), c:o.gr[k] > 0 ? 'up' : 'down' }); });
  const fx = o.fx || {};
  if (fx.approval) out.push({ t:'APPROVAL ' + (fx.approval > 0 ? '▲' : '▼'), c:fx.approval > 0 ? 'up' : 'down' });
  if (fx.deficit) out.push({ t:'DEFICIT ' + (fx.deficit > 0 ? '▲' : '▼'), c:fx.deficit > 0 ? 'down' : 'up' });
  if (fx.reserves) out.push({ t:'RESERVES ' + (fx.reserves > 0 ? '▲' : '▼'), c:fx.reserves > 0 ? 'up' : 'down' });
  if (fx.stability) out.push({ t:'STABILITY ' + (fx.stability > 0 ? '▲' : '▼'), c:fx.stability > 0 ? 'up' : 'down' });
  if (o.law) out.push({ t:'BECOMES LAW', c:'law' });
  Object.keys(o.rel || {}).forEach(k => { if (o.rel[k] && g.world && g.world.rel[k] != null) out.push({ t:k.toUpperCase() + (o.rel[k] > 0 ? ' ▲' : ' ▼'), c:o.rel[k] > 0 ? 'up' : 'down' }); });
  if (o.war) out.push({ t:'WAR', c:'down' });
  return out.slice(0, 5);
}

function remember(g, k, d, text) {
  if (!g.groups[k] || !d) return;
  const G = g.groups[k];
  G.s = clamp(Math.round(G.s + d), 0, 100);
  if (Math.abs(d) >= 4 && text) G.mem = [{ m:g.month, t:text, d:Math.round(d) }, ...G.mem].slice(0, 6);
}
function applyFx(g, fx) {
  const s = g.s;
  fx = { ...(fx || {}) };
  if (fx.approval > 0 && g.char) fx.approval *= hasT(g, 'charismatic') ? 1.25 : hasT(g, 'aloof') ? 0.8 : 1;
  if (fx.deficit < 0 && hasT(g, 'technocrat')) fx.deficit *= 1.15;
  Object.keys(fx || {}).forEach(k => {
    const v = fx[k];
    if (k === 'deficit') s.pdef = r1(s.pdef + v);
    else if (k === 'rate') s.prem = r1(s.prem + v);
    else if (['approval','stability','unity'].includes(k)) s[k] = clamp(r1(s[k] + v), 0, 100);
    else if (k === 'reserves') s.reserves = r1(Math.max(0, s.reserves + v));
    else if (k === 'debt') s.debt = r1(Math.max(0, s.debt + v));
    else if (k === 'inflation') s.inflation = r1(Math.max(-2, s.inflation + v));
    else if (k === 'growth') s.growth = r1(s.growth + v);
    else if (k === 'unemp') s.unemp = r1(clamp(s.unemp + v, 0.5, 40));
  });
}
function scale(fx, k) { const o = {}; Object.keys(fx || {}).forEach(x => o[x] = r1(fx[x] * k)); return o; }

function applyOption(g, o, src) {
  const X = ctx(g);
  if (typeof o.out === 'function') o = { ...o, out:o.out(X) };
  applyFx(g, o.fx);
  if (g.campaign && o.campaignMeters) Object.keys(o.campaignMeters).forEach(k => {
    if (Object.hasOwn(g.campaign.meters,k) && Number.isFinite(o.campaignMeters[k])) g.campaign.meters[k] = clamp(g.campaign.meters[k]+o.campaignMeters[k],0,100);
  });
  const memo = o.rem || ('chose to ' + o.l.charAt(0).toLowerCase() + o.l.slice(1).replace(/\.$/, ''));
  Object.keys(o.gr || {}).forEach(k => remember(g, k, o.gr[k], memo));
  (o.tags || []).forEach(t => { g.tags[t] = [{ m:g.month, text:memo }, ...(g.tags[t] || [])]; });
  if (o.law) addLaw(g, o.law);
  (o.concede || []).forEach(c => { g.conceded[c] = g.month; });
  (o.follow || []).forEach(f => g.queue.push({ id:f[0], m:g.month + f[1], from:memo, p:f[2] || 0 }));
  if (o.repeal) g.laws = g.laws.filter(l => l.id !== o.repeal);
  if (o.imf) imfSet(g, o.imf);
  if (o.seats) g.govSeats = Math.max(0, g.govSeats + o.seats);
  if (o.fall) g.over = { kind:o.fall, m:g.month };
  if (o.defaultNow) doDefault(g);
  if (g.world) {
    Object.keys(o.rel || {}).forEach(k => { if (g.world.rel[k] != null) g.world.rel[k] = clamp(Math.round(g.world.rel[k] + o.rel[k] * (o.rel[k] > 0 && hasT(g, 'diplomat') ? 1.3 : 1)), 0, 100); });
    if (o.war) startWar(g, o.war);
    if (o.warPush && g.world.war) g.world.war.push = (g.world.war.push || 0) + o.warPush + (hasT(g, 'veteran') ? 2 : 0);
    if (o.endWar) endWar(g, o.endWar);
    if (o.ally && !g.world.allies.includes(o.ally)) g.world.allies.push(o.ally);
  }
  if (o.mil && g.mil) { g.mil.strength = clamp(g.mil.strength + (o.mil.strength || 0), 0, 100); g.mil.readiness = clamp(g.mil.readiness + (o.mil.readiness || 0), 0, 100); }
  if (o.prov && g.provs) { const p = g.provs[o.prov.i]; if (p) { p.support = clamp(p.support + (o.prov.support || 0), 0, 100); p.unrest = clamp(p.unrest + (o.prov.unrest || 0), 0, 100); } }
  return memo;
}
function startWar(g, who) {
  if (!g.world || g.world.war) return;
  g.world.war = { enemy:who, front:50, months:0, cas:0, fatigue:0, push:0 };
  g.world.rel[who] = 0; g.tags.war = [{ m:g.month, text:'went to war with ' + who }, ...(g.tags.war || [])];
  applyFx(g, { approval:5, stability:-3, rate:0.8, growth:-0.4 });
  g.world.feed.unshift({ m:g.month, t:g.nation + ' and ' + who + ' are at war', d:'The world reacts with alarm.', tone:'war' });
  g.world.partners.forEach(p => { if (p !== who && window.NSWorld.POWERS.includes(p)) g.world.rel[p] = clamp(g.world.rel[p] - 6, 0, 100); });
}
function endWar(g, kind) {
  const w = g.world.war; if (!w) return;
  applyFx(g, kind === 'victory' ? { approval:10, stability:5 } : kind === 'defeat' ? { approval:-15, stability:-15 } : { approval:w.front >= 50 ? 3 : -3 });
  remember(g, 'army', kind === 'victory' ? 15 : kind === 'defeat' ? -20 : 0, kind === 'victory' ? 'won the war with ' + w.enemy : kind === 'defeat' ? 'lost the war with ' + w.enemy : null);
  g.world.hist.unshift({ enemy:w.enemy, kind, months:w.months, m:g.month, cas:w.cas });
  g.world.feed.unshift({ m:g.month, t:kind === 'victory' ? g.nation + ' declares victory over ' + w.enemy : kind === 'defeat' ? g.nation + ' sues for peace after defeat' : g.nation + ' and ' + w.enemy + ' sign a ceasefire', d:w.months + ' months, ' + w.cas.toLocaleString() + ' casualties.', tone:kind === 'victory' ? 'good' : 'war' });
  g.world.rel[w.enemy] = kind === 'ceasefire' ? 12 : 5;
  g.world.war = null;
}
function addLaw(g, law) {
  if (g.laws.some(l => l.id === law.id)) return;
  g.laws.unshift({ ...law, m:g.month });
  Object.keys(law.mods || {}).forEach(k => { if (Object.hasOwn(g.mods, k)) g.mods[k] = Math.round((g.mods[k] + law.mods[k]) * 100) / 100; });
}

function applyBill(g, bill) {
  const policy = bill.policy;
  if (!policy || g.laws.some(l => l.id === bill.id)) return;
  const before = snapshot(g);
  applyOption(g, { l:bill.name, fx:policy.effects, gr:policy.groups,
    law:{ id:bill.id, name:bill.name, desc:policy.summary, mods:policy.mods, cat:'OWN' } });
  g.cur.results.push({ rid:'bill-' + bill.id, kind:'legislation', title:bill.name,
    choice:'Signed into law', out:policy.summary, dlt:diff(g, before),
    press:[], next:policy.risks, ai:true });
  g.hist.unshift({ m:g.month, title:bill.name, choice:'Enacted after parliament', out:policy.summary, cat:bill.cat });
}
function imfSet(g, kind) {
  if (kind === 'active') g.imf = { status:'active', target:r1(Math.max(-3, g.s.pdef + 0.2)), next:g.month + 3, fails:0, since:g.month };
  else if (kind === 'suspended') g.imf = { ...g.imf, status:'suspended' };
  else if (kind === 'lapse') g.imf = { status:'none', target:null, next:0, fails:0 };
  else if (kind === 'waiver') g.imf = { ...g.imf, status:'active', fails:0, next:g.month + 3, target:r1(Math.max(g.imf.target || -1, g.s.pdef + 0.2)) };
}
function doDefault(g) {
  g.defaulted = g.month; g.s.debt = r1(g.s.debt * 0.72); g.s.reserves = r1(g.s.reserves + 0.8);
  applyFx(g, { growth:-3, inflation:4, approval:-8, stability:-8 });
  remember(g, 'lenders', -35, 'defaulted on the external debt'); remember(g, 'business', -12, 'defaulted on the external debt');
  g.tags.default = [{ m:g.month, text:'defaulted on the external debt' }];
  g.imf = { status:'none', target:null, next:0, fails:0 };
}

function press(g, topic, sent) {
  const P = K().papers(g), me = g.title + ' ' + g.player.split(' ').slice(-1)[0];
  const T = K().HEADLINES;
  const pick = (arr, salt) => arr[Math.floor(H(g.seed + topic + salt + g.month) * arr.length)];
  const key = sent > 1.5 ? 'good' : sent < -1.5 ? 'bad' : 'mixed';
  const sub = s => s.replace(/\{T\}/g, topic).replace(/\{L\}/g, me).replace(/\{O\}/g, ctx(g).opp.leader.split(' (')[0]);
  return [
    { paper:P[0], lean:'PRO-GOVERNMENT', h:sub(pick(T.pro[key], 'a')) },
    { paper:P[1], lean:'INDEPENDENT', h:sub(pick(T.mid[key], 'b')) },
    { paper:P[2], lean:'OPPOSITION', h:sub(pick(T.opp[key], 'c')) }
  ];
}

function snapshot(g) { return { s:C(g.s), gr:Object.fromEntries(Object.keys(g.groups).map(k => [k, g.groups[k].s])) }; }
function diff(g, a) {
  const b = snapshot(g), st = [], gr = [];
  [['approval','Approval',''],['stability','Stability',''],['unity','Party unity',''],['reserves','Reserves',' mo'],['debt','Debt',' %'],['inflation','Inflation',' %'],['growth','Growth',' %']].forEach(([k, l, u]) => {
    const d = r1(b.s[k] - a.s[k]); if (Math.abs(d) >= 0.1) st.push({ l, v:(d > 0 ? '+' : '') + d + u, good:(['debt','inflation'].includes(k) ? d < 0 : d > 0) });
  });
  const dd = r1((b.s.pdef - a.s.pdef)); if (Math.abs(dd) >= 0.05) st.push({ l:'Deficit', v:(dd > 0 ? '+' : '') + dd + ' % GDP', good:dd < 0 });
  Object.keys(b.gr).forEach(k => { const d = Math.round(b.gr[k] - (a.gr[k] || 0)); if (d) gr.push({ l:GROUPS[k].label, v:(d > 0 ? '+' : '') + d, good:d > 0 }); });
  return { st, gr, sent:(b.s.approval - a.s.approval) + (b.s.stability - a.s.stability) * 0.5 };
}

function chooseEvent(g, ci, i) {
  g = C(g);
  const card = g.cur.cards[ci]; if (!card || card.done) return { g };
  const { t, e } = cardText(g, card);
  let o = t.opts[i];
  if (o.neg) { const n = openNeg(g, o.neg, { ev:true, ci, i }); g.dynNow = null; g.dynWorld = null; return { g, neg:n }; }
  if (typeof o.out === 'function') o = { ...o, out:o.out(ctx(g)) };
  const mn = ministerFor(g, card.text.cat);
  if (mn) { const km = 0.85 + mn.comp / 333; const fx = { ...o.fx }; ['approval','growth','stability','reserves'].forEach(k => { if (fx[k] > 0) fx[k] = r1(fx[k] * km); }); o = { ...o, fx }; }
  const a = snapshot(g);
  applyOption(g, o);
  g.dynNow = null; g.dynWorld = null;
  const dlt = diff(g, a);
  const rid = 'c' + ci + '-' + g.month;
  const res = { rid, snap:a, ctx:{ body:card.text.body, desc:o.d }, kind:'event', title:card.text.title, choice:o.l, out:o.out || '', press:press(g, o.topic || e.topic || card.text.title.split(' ').slice(0, 4).join(' '), dlt.sent), dlt, next:(o.follow || []).map(f => K().followText(f[0], f[1])) };
  card.done = res; g.cur.results.push(res);
  g.hist.unshift({ m:g.month, title:card.text.title, choice:o.l, out:o.out || '', cat:e.cat });
  return { g, rid };
}

function enact(g, id, authority) {
  g = authority === 'assent' ? g : C(g);
  delete g.notice;
  if (g.ap <= 0) return g;
  if (g.p9 && g.demo && !(g.sys && g.sys.emergency) && authority !== 'assent') {
    const r = window.NS9.introduce(g, 'agenda', { id });
    if (r.error) r.g.notice = r.error;
    return r.g || g;
  }
  if (g.laws.some(l => l.id === id)) return g;
  if (!K().AGENDA.some(x => x.id === id)) return g;
  g.ap -= 1;
  const A = K().AGENDA.find(x => x.id === id);
  const a = snapshot(g);
  const o = { ...A, l:A.name, rem:A.rem || ('enacted ' + A.name.charAt(0).toLowerCase() + A.name.slice(1)), law:A.mods || A.law !== false ? { id:A.id, name:A.name, desc:A.lawDesc || A.d, mods:A.mods || {}, cat:A.cat } : null };
  applyOption(g, o);
  const dlt = diff(g, a);
  const res = { rid:'a' + id + g.month, snap:a, ctx:{ body:A.d, desc:'Enacted as policy' }, kind:'agenda', title:A.cat + ' · ' + A.name, choice:'Enacted', out:A.out || '', press:press(g, A.topic || A.name, dlt.sent), dlt, next:(A.follow || []).map(f => K().followText(f[0], f[1])) };
  g.cur.results.push(res); g.cur.last = res.rid;
  g.hist.unshift({ m:g.month, title:A.name, choice:'Enacted (' + A.cat.toLowerCase() + ')', out:A.out || '', cat:A.cat });
  return g;
}
function repeal(g, id) {
  g = C(g);
  if (g.ap <= 0) return g;
  g.ap -= 1;
  const L = g.laws.find(l => l.id === id); if (!L) return g;
  const A = K().AGENDA.find(x => x.id === id) || {};
  const a = snapshot(g);
  Object.keys(L.mods || {}).forEach(k => g.mods[k] = Math.round((g.mods[k] - L.mods[k]) * 100) / 100);
  g.laws = g.laws.filter(l => l.id !== id);
  applyFx(g, { unity:-2, ...(A.fx ? scale(A.fx, -0.6) : {}) });
  Object.keys(A.gr || {}).forEach(k => remember(g, k, -A.gr[k] * 0.7, 'repealed ' + L.name.toLowerCase()));
  g.tags.uturn = [{ m:g.month, text:'repealed ' + L.name.toLowerCase() }, ...(g.tags.uturn || [])];
  const dlt = diff(g, a);
  const res = { rid:'r' + id + g.month, snap:a, ctx:{ body:'Repeal of ' + L.name, desc:'Repealed' }, kind:'agenda', title:'REPEAL · ' + L.name, choice:'Repealed', out:'The law enacted in ' + dateOf(L.m) + ' is struck from the statute book. Those who fought for it will remember the U-turn; those who fought against it will want more.', press:press(g, L.name, dlt.sent - 1), dlt, next:[] };
  g.cur.results.push(res); g.cur.last = res.rid;
  g.hist.unshift({ m:g.month, title:'Repealed: ' + L.name, choice:'Repeal', out:res.out, cat:'POLITICS' });
  return g;
}

/* ---------- negotiations ---------- */
function openNeg(g, key, from) {
  const N = K().NEGS[key], X = ctx(g), CON = K().CONCESSIONS;
  const avail = N.pool.filter(id => !g.conceded[id] && (!CON[id].ok || CON[id].ok(X)));
  const ordered = avail.sort((a, b) => H(g.seed + key + a + g.month) - H(g.seed + key + b + g.month)).slice(0, N.pick || 4);
  const credit = N.pool.filter(id => g.conceded[id]).map(id => ({ id, name:CON[id].name, m:g.conceded[id], v:Math.round(CON[id].v * 0.4) }));
  const lev = N.lever ? N.lever(X) : null;
  return { key, from, party:N.party, who:N.who(X), title:N.title(X), intro:N.intro(X), need:N.need, demands:ordered, picked:[], lever:lev, useLever:false, credit, tries:2, msg:null, status:null };
}
function negScore(g, n) {
  const CON = K().CONCESSIONS, sup = n.party === '@war' ? 30 : g.groups[n.party] ? g.groups[n.party].s : 50;
  const base = Math.round((sup - 50) * 0.6) + (hasT(g, 'dealmaker') ? 12 : 0);
  const cr = n.credit.reduce((a, c) => a + c.v, 0);
  const pk = n.picked.reduce((a, id) => a + CON[id].v, 0);
  const lv = n.useLever && n.lever ? n.lever.v : 0;
  return { base, cr, pk, lv, total:base + cr + pk + lv, need:n.need };
}
function negToggle(g, n, id) { n = C(n); if (n.status) return n; if (id === '__lever') n.useLever = !n.useLever; else n.picked = n.picked.includes(id) ? n.picked.filter(x => x !== id) : [...n.picked, id]; n.msg = null; return n; }
function negPropose(g, n) {
  n = C(n); const sc = negScore(g, n);
  if (sc.total >= sc.need) { n.status = 'deal'; n.msg = K().NEGS[n.key].yes(ctx(g)); return n; }
  n.tries -= 1;
  const gap = sc.need - sc.total;
  if (n.tries <= 0) { n.status = 'fail'; n.msg = K().NEGS[n.key].no(ctx(g)); return n; }
  n.msg = (gap > 40 ? '"That is not a serious offer." ' : gap > 15 ? '"We are still far apart." ' : '"Close. Not close enough." ') + 'They will hear one more proposal.';
  return n;
}
function negWalk(g, n) { n = C(n); n.status = 'fail'; n.msg = 'You end the meeting. ' + K().NEGS[n.key].no(ctx(g)); return n; }
function negClose(g, n) {
  g = C(g);
  if (n.from && n.from.act) g.ap = Math.max(0, g.ap - 1);
  if (n.from && n.from.ev) { const cd = g.cur.cards[n.from.ci]; g.dynNow = cd.data; g.dynWorld = cd.world; }
  const N = K().NEGS[n.key], CON = K().CONCESSIONS, X = ctx(g), ok = n.status === 'deal';
  const a = snapshot(g);
  const gave = [];
  if (ok) {
    n.picked.forEach(id => { const c = CON[id]; gave.push(c.name.toLowerCase()); applyOption(g, { l:c.name, fx:c.fx, gr:c.gr, rem:'conceded: ' + c.name.toLowerCase(), law:c.law ? { id, name:c.name, desc:c.d, mods:c.mods || {}, cat:'DEAL' } : null, tags:c.tags || [] }); g.conceded[id] = g.month; });
    if (n.useLever && n.lever) applyFx(g, n.lever.cost || {});
  }
  const r = (ok ? N.ok : N.fail)(X);
  const memo = ok ? 'reached a deal on ' + n.title.toLowerCase() + (gave.length ? ' by conceding ' + gave.join(', ') : '') : 'let talks on ' + n.title.toLowerCase() + ' collapse';
  applyOption(g, { ...r, l:n.title, rem:memo, gr:{ ...(g.groups[n.party] ? { [n.party]:(ok ? 10 : -10) } : {}), ...(r.gr || {}) } });
  g.dynNow = null; g.dynWorld = null;
  const dlt = diff(g, a);
  const title = n.from && n.from.ev ? g.cur.cards[n.from.ci].text.title : n.title;
  const out = (ok ? 'Agreement with ' + n.who + '. You conceded ' + (gave.join('; ') || 'nothing of substance') + '. ' : 'No agreement with ' + n.who + '. ') + (r.out || '');
  const res = { rid:'n' + n.key + g.month, snap:a, ctx:{ body:title + '. Negotiation with ' + n.who + '.', desc:ok ? 'Conceded: ' + (gave.join('; ') || 'nothing') : 'Talks collapsed' }, kind:'event', title, choice:(ok ? 'Deal: ' : 'No deal: ') + n.title, out, press:press(g, n.title, dlt.sent + (ok ? 1 : -2)), dlt, next:(r.follow || []).map(f => K().followText(f[0], f[1])) };
  if (n.from && n.from.ev) g.cur.cards[n.from.ci].done = res;
  g.cur.results.push(res); g.cur.last = res.rid; g.hist.unshift({ m:g.month, title, choice:res.choice, out, cat:'TALKS' });
  return g;
}

/* ---------- month end ---------- */
function endMonth(g) {
  g = C(g);
  const s = g.s, b = g.base, F = g.groups, lines = [], X0 = ctx(g);
  const a = { s:C(g.cur.s0), gr:g.cur.g0 };
  g.cur.cards.forEach(cd => { if (cd.done) return;
    if (cd.text.tone !== 'opp') { applyFx(g, { approval:-1.5, stability:-1.5 }); lines.push({ t:'Ignored: ' + cd.text.title, d:'Left unanswered, the problem festers.', good:false }); g.hist.unshift({ m:g.month, title:cd.text.title, choice:'Ignored', out:'No decision was taken.', cat:cd.text.cat }); }
    else lines.push({ t:'Missed: ' + cd.text.title, d:'The opportunity passes to someone else.', good:false }); });
  const wr = window.NSWorld.stepWorld(g);
  applyFx(g, wr.fx);
  wr.cards.forEach(c => { if (!g.queue.some(q => q.id === c.id)) g.queue.push({ id:c.id, m:g.month + 1, world:c.data, p:3 }); });
  const war = window.NSWorld.stepWar(g);
  if (war) { applyFx(g, war.fx); lines.push(war.line); if (F.army) F.army.s = clamp(F.army.s + (war.shift > 0 ? 1 : -1.5), 0, 100); if (war.end) { endWar(g, war.end); lines.push({ t:war.end === 'victory' ? 'Victory' : 'Defeat', d:war.end === 'victory' ? 'The enemy sues for peace.' : 'Your army collapses at the front. You must accept their terms.', good:war.end === 'victory' }); } }
  const pc = g.budget ? g.budget.defence : 2;
  if (g.mil.army != null) { const tgt = 40 + pc * 5; ['army','air','navy'].forEach(k => { if (!(k === 'navy' && g.mil.landlocked)) g.mil[k] = clamp(r1(g.mil[k] + (tgt - g.mil[k]) * 0.012), 0, 100); });
    const t = g.mil.tech, tb = (t.drones + t.cyber + t.missiles + t.space) / 40; g.mil.strength = clamp(r1((g.mil.landlocked ? g.mil.army * 0.6 + g.mil.air * 0.4 : g.mil.army * 0.45 + g.mil.air * 0.3 + g.mil.navy * 0.25) + tb), 0, 100); }
  if (g.sys && g.sys.emergency > 0) { g.sys.emergency -= 1; if (g.sys.emergency === 0) { g.demo = g.demoWas != null ? g.demoWas : true; lines.push({ t:'State of emergency expires', d:'Parliament reconvenes.', good:true }); } }
  if (g.ministers) { const wob = g.ministers.find(m => m.loyal < 40 && H(g.seed + m.k + g.month) < 0.06); if (wob) { lines.push({ t:wob.post + ' minister ' + wob.name + ' resigns', d:'A resignation letter attacks your leadership. The post is filled by a deputy.', good:false }); applyFx(g, { unity:-4 }); wob.name = WC().personName(ND().BY_NAME[g.nation], 'dep' + wob.k + g.month + g.seed, RH); wob.comp = Math.round(30 + H(wob.name) * 30); wob.loyal = 60; wob.since = g.month; } }
  g.mil.readiness = clamp(r1(g.mil.readiness + ((45 + pc * 6) - g.mil.readiness) * 0.06), 0, 100);
  g.mil.strength = clamp(r1(g.mil.strength + ((window.NSWorld.power(g.nation) * 0.75 + pc * 3) - g.mil.strength) * 0.03), 0, 100);
  let ur = 0;
  g.provs.forEach(p => { const tU = 62 - p.support * 0.5 + Math.max(0, s.inflation - 8) * 0.8 + Math.max(0, s.unemp - 8) * 0.6; p.unrest = clamp(r1(p.unrest + (tU - p.unrest) * 0.08), 0, 100); p.support = clamp(r1(p.support + (s.approval - p.support) * 0.05), 0, 100); ur += p.unrest; });
  ur /= Math.max(1, g.provs.length);
  const hot = g.provs.find(p => p.unrest > 75);
  if (hot && !g.queue.some(q => q.id === 'insurgency')) g.queue.push({ id:'insurgency', m:g.month + 1, p:2 });
  // economy
  const tg = b.growth + g.mods.growth - Math.max(0, market(g) - 12) * 0.08 - (s.reserves < 2 ? 1.2 : 0) - (s.stability < 30 ? 0.8 : 0) + (F.business && F.business.s > 70 ? 0.2 : 0);
  s.growth = r1(s.growth + (tg - s.growth) * 0.22);
  const ti = b.inflation + g.mods.inflation + (s.reserves < 2 ? 3 : 0) + Math.max(0, s.pdef) * 0.15;
  s.inflation = r1(Math.max(-1, s.inflation + (ti - s.inflation) * 0.18));
  const tu = b.unemp + g.mods.unemp - (s.growth - b.growth) * 0.4;
  s.unemp = r1(clamp(s.unemp + (tu - s.unemp) * 0.15, 0.5, 40));
  const mk = market(g);
  s.eff = Math.round((s.eff + (mk - s.eff) / (b.mat * 12)) * 100) / 100;
  const dfc = deficit(g);
  s.debt = r1(Math.max(0, s.debt + (dfc - s.debt * (s.growth + s.inflation) / 100) / 12));
  let dr = (b.diff >= 4 ? -0.03 : b.diff >= 3 ? -0.005 : 0.02) - 0.05 * Math.max(0, dfc - 3) * b.ext + (g.imf.status === 'active' ? 0.02 : 0) - (F.lenders.s < 30 ? 0.06 : 0) - (F.business && F.business.s < 30 ? 0.08 : 0);
  if (b.hard) dr = 0;
  s.reserves = r1(Math.max(0, s.reserves + dr));
  // IMF review
  if (g.imf.status === 'active' && g.month >= g.imf.next) {
    g.imf.next = g.month + 3;
    if (s.pdef <= g.imf.target + 0.05 && F.lenders.s >= 30) {
      s.reserves = r1(s.reserves + 0.5); remember(g, 'lenders', 3, null);
      lines.push({ t:'IMF review passed', d:'Primary balance ' + fmtP(-s.pdef) + ' against a target of ' + fmtP(-g.imf.target) + '. A tranche adds 0.5 months to reserves.', good:true });
    } else {
      g.imf.fails += 1;
      if (g.imf.fails >= 2) { g.imf.status = 'suspended'; lines.push({ t:'IMF programme suspended', d:'Two reviews missed. Disbursements stop and borrowing costs jump.', good:false }); g.queue.push({ id:'imf_suspended', m:g.month + 1, p:5 }); }
      else { lines.push({ t:'IMF review failed', d:'Primary balance ' + fmtP(-s.pdef) + ', target ' + fmtP(-g.imf.target) + '. The tranche is withheld.', good:false }); g.queue.push({ id:'imf_review', m:g.month + 1, p:5 }); }
    }
  }
  // crisis triggers
  const q = (id, p, gap) => { if (!g.queue.some(x => x.id === id) && (g.used[id] == null || g.month - g.used[id] >= (gap || 6))) g.queue.push({ id, m:g.month + 1, p:p || 1 }); };
  if (!b.hard && s.reserves <= 0.4 && !g.defaulted) q('default_brink', 9, 3);
  else if (!b.hard && s.reserves < 1.6) q('reserves_crisis', 7, 4);
  else if (!b.hard && s.reserves < 2.6 && g.imf.status !== 'active') q('imf_ultimatum', 6, 6);
  if (F.army && F.army.s <= (g.loyal ? 5 : 12) && s.stability < 35) q('coup', 8, 6);
  else if (F.army && F.army.s < 25) q('coup_rumour', 4, 8);
  if (F.labour && F.labour.s < 25) q('general_strike', 3, 8);
  if (F.clergy && F.clergy.s < 25) q('march', 3, 8);
  if (F.business && F.business.s < 25) q('capital_flight', 3, 8);
  if (F.elites && (F.elites.s < 22 || s.unity < 25)) q('coalition_revolt', 4, 8);
  if (F.youth && F.youth.s < 22) q('youth_protest', 2, 8);
  const r0 = g.cur.rating || rating({ ...g, s:a.s });
  // groups drift and passive effects
  Object.keys(F).forEach(k => { F[k].s = clamp(Math.round((F[k].s + (50 - F[k].s) * 0.02) * 10) / 10, 0, 100); });
  if (F.army && F.army.s > 70) s.stability = clamp(s.stability + 0.6, 0, 100);
  if (F.elites) s.unity = clamp(r1(s.unity + (F.elites.s - 50) * 0.02), 0, 100);
  // politics drift
  const pub = PUBLIC.filter(k => F[k]).reduce((a2, k) => a2 + F[k].s, 0) / PUBLIC.filter(k => F[k]).length;
  const tA = 44 + (s.growth - b.growth) * 2.5 - Math.max(0, s.inflation - Math.max(4, b.inflation)) * 0.6 - (s.unemp - b.unemp) * 1.2 + (pub - 50) * 0.5;
  s.approval = clamp(r1(s.approval + (tA - s.approval) * 0.07), 0, 100);
  const pw = ['army','business','clergy','elites'].filter(k => F[k]);
  const pwr = pw.length ? pw.reduce((a2, k) => a2 + F[k].s, 0) / pw.length : 50;
  const tS = 50 + (s.approval - 45) * 0.35 + (pwr - 50) * 0.5 - Math.max(0, s.inflation - 15) * 0.4 - Math.max(0, ur - 45) * 0.15 - (g.world.war ? g.world.war.fatigue * 0.08 : 0);
  s.stability = clamp(r1(s.stability + (tS - s.stability) * 0.08), 0, 100);
  const tU = 55 + (s.approval - 45) * 0.3;
  s.unity = clamp(r1(s.unity + (tU - s.unity) * 0.05), 0, 100);
  // Extensions resolve while this is still the ending month. Reports, fall
  // checks and next-month snapshots must all observe the same final state.
  if (window.NSG.resolveMonth) window.NSG.resolveMonth(g, lines);
  // fall checks
  if (!g.over) {
    if (s.stability <= 8) g.over = { kind:F.army && F.army.s < 35 ? 'coup' : 'uprising', m:g.month };
    else if (g.demo && s.unity <= 10) g.over = { kind:'confidence', m:g.month };
  }
  const r1x = rating(g);
  if (r1x !== r0 && ['CCC','B-','B','B+','BB-','BB','BB+','BBB-','BBB','BBB+','A-','A','A+','AA-','AA','AA+','AAA','D'].indexOf(r1x) < ['CCC','B-','B','B+','BB-','BB','BB+','BBB-','BBB','BBB+','A-','A','A+','AA-','AA','AA+','AAA','D'].indexOf(r0) && r1x !== 'D') { lines.push({ t:'Rating cut to ' + r1x, d:'Borrowing gets dearer on every new issue.', good:false }); q('downgrade', 2, 6); }
  else if (r1x !== r0 && r0 !== 'D' && r1x !== 'D') lines.push({ t:'Rating raised to ' + r1x, d:'Markets reward the direction of travel.', good:true });
  lines.unshift({ t:'Debt service', d:'Interest costs ' + fmtP(interest(g)) + ' of GDP this year at an average rate of ' + s.eff.toFixed(1) + '%. New borrowing prices at ' + mk.toFixed(1) + '%.', good:interest(g) < 3 });
  const dlt = diff(g, a);
  const results = g.cur.results.slice();
  const ahead = upcoming(g);
  const report = { month:g.month, date:dateOf(g.month), results, lines, dlt, ahead, over:g.over, feed:wr.feed.concat(g.world.war ? [] : []) };
  if(g.development)report.development=C(g.development.changes.filter(x=>x.m===g.month));
  g.hist = g.hist.slice(0, 200);
  // election
  if (!g.over && g.month === 24 && g.demo) g.queue.push({ id:'midterm', m:25, p:10 });
  if (!g.over && g.month >= TERM) g.over = { kind:g.demo ? 'election' : 'succession', m:g.month };
  if (g.over) {
    if (window.NSG.finishCampaign) window.NSG.finishCampaign(g);
    g.final = finalOf(g); report.over = g.over; return { g, report };
  }
  g.month += 1;
  g.cur = null;
  g = startMonth(g);
  g.cur.rating = r1x;
  return { g, report };
}
const fmtP = v => (v > 0 ? '+' : '') + v.toFixed(1) + '%';

function upcoming(g) {
  const out = [];
  if (g.imf.status === 'active') out.push('IMF review in ' + Math.max(0, g.imf.next - g.month) + ' month' + (g.imf.next - g.month === 1 ? '' : 's') + '. Target primary balance ' + fmtP(-g.imf.target) + ', now ' + fmtP(-g.s.pdef) + '.');
  g.queue.filter(x => x.from).slice(0, 3).forEach(x => out.push(K().followText(x.id, x.m - g.month)));
  if (g.world && g.world.war) out.push('War with ' + g.world.war.enemy + ': control ' + Math.round(g.world.war.front) + '/100.');
  if (g.demo) out.push((g.month < 24 ? 'Provincial elections in ' + (24 - g.month) : 'General election in ' + (TERM - g.month)) + ' months.');
  return out;
}

function seatShare(g) {
  const s = g.s, share0 = g.govSeats / g.total * 100;
  return clamp(r1(50 + (s.approval - 42) * 1.8 + (share0 - 50) * 0.3 + (s.unity - 50) * 0.15 + (s.growth - g.base.growth) * 1.2), 3, 92);
}
function finalOf(g) {
  const s = g.s, o = g.over;
  const big = g.hist.filter(h => h.choice).slice(-200);
  const defining = g.hist.slice().reverse().filter(h => /Deal|No deal|Enacted|Repeal/.test(h.choice) || h.cat === 'TALKS').slice(0, 3).concat(g.hist.slice().reverse().slice(0, 2)).slice(0, 5);
  let head, body, won = false;
  const X = ctx(g);
  if (o.kind === 'election') {
    const election = g.p9 && g.p9.elec;
    const sh = election ? election.govSeats / election.total * 100 : seatShare(g); won = election ? election.won : sh > 50;
    head = won ? 'Re-elected' : 'Defeated at the polls';
    body = 'Your bloc wins ' + Math.round(sh) + '% of seats in the ' + (g.pol.chamber || 'legislature') + '. ' + (won ? 'The country gives you a second term. ' : X.opp.name + ' under ' + X.opp.leader + ' forms the next government. ');
  } else if (o.kind === 'succession') {
    won = s.stability > 40 && (!g.groups.army || g.groups.army.s > 35);
    head = won ? 'Your rule is secured' : 'Edged out by the inner circle';
    body = won ? 'The security services and the party close ranks behind you for another term.' : 'The inner circle settles on a successor. You are thanked for your service and given a residence outside the capital.';
  } else if (o.kind === 'coup') { head = 'Removed by the army'; body = 'Troops took the broadcaster before dawn. ' + g.gnames.army.charAt(0).toUpperCase() + g.gnames.army.slice(1) + ' announced a caretaker administration "to restore stability".'; }
  else if (o.kind === 'uprising') { head = 'Brought down by the streets'; body = 'After weeks of protest your coalition melted away and you resigned on national television.'; }
  else if (o.kind === 'confidence') { head = 'Lost a vote of confidence'; body = 'Your own benches voted with the opposition. Parliament elected a new leader the same evening.'; }
  else if (o.kind === 'resign') { head = 'You resigned'; body = 'You chose to leave office rather than govern on terms you could not accept.'; }
  else { head = 'Your government fell'; body = ''; }
  const promises = window.NSCampaign && g.campaign ? window.NSCampaign.mandates(g) : [];
  const mandateBonus = promises.filter(x=>x.done).length * 5;
  const performance = (won ? 30 : 0) + s.approval * 0.35 + s.stability * 0.2 + clamp((g.s0.debt - s.debt) * 0.4, -10, 10) + clamp((s.growth - g.base.growth) * 2, -8, 8) + Math.min(g.month, TERM) / TERM * 15 - (g.defaulted ? 10 : 0);
  const score = Math.round(clamp(Math.min(promises.length ? 85 : 100, performance) + mandateBonus, 0, 100));
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
  return { head, body, won, grade, score, months:g.month, defining, promises, mandateBonus };
}

function customCard(g, ci, text) {
  g = C(g);
  const card = g.cur.cards[ci]; if (!card || card.done || !text || text.trim().length < 4) return { g };
  const a = snapshot(g), rid = 'c' + ci + '-' + g.month;
  const res = { rid, snap:a, custom:true, ctx:{ body:card.text.body, desc:'The player rejected the listed options and wrote their own response: ' + text.trim().slice(0, 400) }, kind:'event', title:card.text.title, choice:'Your response: ' + text.trim().slice(0, 140), out:'Your instructions go out. Reports are coming in.', press:press(g, card.text.title.split(' ').slice(0, 4).join(' '), 0), dlt:diff(g, a), next:[] };
  card.done = res; g.cur.results.push(res);
  g.hist.unshift({ m:g.month, title:card.text.title, choice:'Own response', out:text.trim().slice(0, 200), cat:card.text.cat });
  return { g, rid };
}
/* ---------- window actions (1 action point each) ---------- */
const ASSETS0 = ['the national airline','the steel mill','power distribution companies','a stake in the state telecom','a stake in the state bank','the national shipping line'];
function budgetFx(g, nb, nt) {
  const C7 = window.NSContent7, fx = {}, gr = {}, mods = {}; let dp = 0, milD = 0;
  C7.BUDGET.forEach(c => { const d = r1((nb[c.k] || 0) - g.budget[c.k]); if (!d) return; dp += d;
    Object.keys(c.fx).forEach(k => fx[k] = r1((fx[k] || 0) + c.fx[k] * d)); Object.keys(c.gr).forEach(k => gr[k] = Math.round((gr[k] || 0) + c.gr[k] * d)); Object.keys(c.mods).forEach(k => mods[k] = r1((mods[k] || 0) + c.mods[k] * d)); if (c.mil) milD += c.mil * d; });
  C7.TAXES.forEach(t => { const d = (nt[t.k] || 0) - g.tax[t.k]; if (!d) return; dp -= t.yield * d;
    Object.keys(t.fx).forEach(k => fx[k] = r1((fx[k] || 0) + t.fx[k] * d)); Object.keys(t.gr).forEach(k => gr[k] = Math.round((gr[k] || 0) + t.gr[k] * d)); Object.keys(t.mods).forEach(k => mods[k] = r1((mods[k] || 0) + t.mods[k] * d)); });
  fx.deficit = r1(dp); gr.lenders = Math.round((gr.lenders || 0) - dp * 4);
  return { fx, gr, mods, milD };
}
function budgetVote(g) { const c = chamberShares(g); const base = g.senate ? Math.min(c.lo, c.hi + 4) : c.lo; return clamp(Math.round(base + (g.s.unity - 50) * 0.5 + (g.s.approval - 45) * 0.3 + (g.sys && g.sys.antiDefection ? 4 : 0)), 0, 100); }
function amendVote(g) { const c = chamberShares(g); return clamp(Math.round(Math.min(c.lo, c.hi) + (g.s.unity - 50) * 0.3), 0, 100); }
function act(g, kind, arg) {
  g = C(g);
  if (g.ap <= 0) return { g, error:'NO ACTIONS LEFT THIS MONTH' };
  const W = g.world, X = ctx(g), a = snapshot(g);
  let title = '', out = '', o = null, err = null, ok = true;
  const nm = arg;
  if (kind === 'imf' || kind === 'ceasefire' || kind === 'pact') {
    const key = kind === 'imf' ? (g.imf.status === 'active' ? 'imf_review' : 'imf_new') : kind === 'ceasefire' ? 'ceasefire' : 'pact_' + arg;
    if (kind === 'ceasefire' && !W.war) return { g, error:'NOT AT WAR' };
    if (kind === 'imf' && g.imf.status === 'active' && g.imf.fails === 0) return { g, error:'PROGRAMME ON TRACK — NOTHING TO NEGOTIATE' };
    if (!K().NEGS[key]) return { g, error:'NO ONE TO NEGOTIATE WITH' };
    return { g, neg:openNeg(g, key, { act:true }) };
  }
  switch (kind) {
    case 'budget': {
      const v = budgetVote(g); const passed = v >= 50 || g.regime.military && g.s.stability > 40 || !g.demo;
      title = 'Budget ' + (passed ? 'passed' : 'defeated');
      if (passed) { const bf = budgetFx(g, arg.budget, arg.tax); o = { l:'Budget', fx:bf.fx, gr:bf.gr, rem:'passed a budget' }; Object.keys(bf.mods).forEach(k => g.mods[k] = r1(g.mods[k] + bf.mods[k])); g.mil.strength = clamp(g.mil.strength + bf.milD, 0, 100); g.budget = { ...arg.budget }; g.tax = { ...arg.tax };
        out = 'The finance bill passes with ' + v + '% backing. The primary balance moves by ' + (bf.fx.deficit > 0 ? '+' : '') + bf.fx.deficit + '% of GDP.'; }
      else { o = { l:'Budget', fx:{ unity:-6, approval:-2 }, gr:{ elites:-4 } }; out = 'The house votes your budget down with only ' + v + '% backing. Your whips are blamed.'; ok = false; }
      break; }
    case 'bond': if (g.defaulted && g.month - g.defaulted < 18 || rating(g) === 'CCC') { err = 'MARKETS ARE CLOSED TO YOU'; break; }
      title = 'Dollar bond issued'; o = { l:title, fx:{ reserves:1, debt:1.2, rate:0.15 }, gr:{ lenders:-2 } }; out = 'A ten-year bond prices at ' + (market(g) + 1).toFixed(1) + '%. Reserves rise; the coupon is owed until 2036.'; break;
    case 'controls': { const on = g.laws.some(l => l.id === 'capital_controls'); title = on ? 'Capital controls lifted' : 'Capital controls imposed';
      o = on ? { l:title, fx:{ inflation:0.6 }, gr:{ business:6, lenders:5 }, repeal:'capital_controls' } : { l:title, fx:{ reserves:0.5 }, gr:{ business:-8, lenders:-6 }, law:{ id:'capital_controls', name:'Capital controls', desc:'Licences for foreign exchange.', mods:{ growth:-0.2 } }, tags:['controls'] };
      if (on) g.mods.growth = r1(g.mods.growth + 0.2);
      out = on ? 'The exchange rate is unified. Business welcomes it.' : 'Dollar purchases now need a licence. A parallel market opens within a week.'; break; }
    case 'asset': { g.assets = g.assets || ASSETS0.slice(); const as = g.assets.shift(); if (!as) { err = 'NOTHING LEFT TO SELL'; break; }
      title = 'Sold ' + as; o = { l:title, fx:{ reserves:0.5, deficit:-0.1, approval:-1 }, gr:{ labour:-10, lenders:6, business:3 }, concede:['privatise'], tags:['privatisation'], rem:'sold ' + as }; out = 'Sold below book value to a consortium. The workforce is promised consultation.'; break; }
    case 'mobilise': title = 'Reserves mobilised'; o = { l:title, fx:{ growth:-0.15, stability:1 }, gr:{ army:4 }, mil:{ readiness:15 } }; out = 'Reservists report to their units. The rival notices.'; if (W.rival) W.rel[W.rival] = clamp(W.rel[W.rival] - 4, 0, 100); break;
    case 'procure': title = 'Arms procurement signed'; o = { l:title, fx:{ deficit:0.15, reserves:-0.15 }, gr:{ army:5 }, mil:{ strength:4 } }; out = 'New armour and air-defence systems ordered.'; break;
    case 'exercise': if (!nm) { err = 'PICK A PARTNER'; break; } title = 'Joint exercises with ' + nm; o = { l:title, fx:{}, gr:{ army:2 }, mil:{ readiness:5 }, rel:{ [nm]:6 } }; out = 'Two weeks of drills with ' + nm + '.'; break;
    case 'purge': title = 'Commanders replaced with loyalists'; g.loyal = true; o = { l:title, fx:{ stability:-3 }, gr:{ army:-8 }, mil:{ readiness:-8 }, tags:['purge'], rem:'replaced army commanders with loyalists' }; out = 'Four corps commanders retired early. A coup is now harder; the army is sullen.'; break;
    case 'declare_war': if (!nm || W.war) { err = W.war ? 'ALREADY AT WAR' : 'NO TARGET'; break; } if ((W.rel[nm] || 50) > 25) { err = 'RELATIONS TOO GOOD TO JUSTIFY WAR'; break; }
      title = 'War declared on ' + nm; o = { l:title, fx:{}, gr:{ army:6, youth:-4 }, war:nm, rem:'declared war on ' + nm }; out = 'Your forces cross the border at dawn.'; break;
    case 'offensive': if (!W.war) { err = 'NOT AT WAR'; break; } title = 'Offensive against ' + W.war.enemy; o = { l:title, fx:{ deficit:0.1 }, gr:{ army:3 }, warPush:6 + Math.round(H(g.seed + 'of' + g.month) * 12) - 3, mil:{ readiness:-10 } }; out = 'A combined-arms offensive begins along the front.'; break;
    case 'visit': title = 'State visit to ' + nm; o = { l:title, fx:{ approval:0.8 }, gr:{}, rel:{ [nm]:8 } }; out = 'Guard of honour, a banquet, and a joint statement.'; break;
    case 'trade': if ((W.rel[nm] || 0) < 50) { err = 'RELATIONS TOO WEAK FOR A TRADE DEAL'; break; } if (g.laws.some(l => l.id === 'fta_' + nm)) { err = 'ALREADY SIGNED'; break; }
      title = 'Trade agreement with ' + nm; o = { l:title, fx:{}, gr:{ business:5, rural:-2 }, rel:{ [nm]:4 }, law:{ id:'fta_' + nm, name:'Trade agreement with ' + nm, desc:'Lower tariffs both ways.', mods:{ growth:0.06 } } }; out = 'Signed at a ceremony in ' + g.cap + '.'; break;
    case 'aid': if ((W.rel[nm] || 0) < 60) { err = 'THEY WILL NOT LEND AT THESE RELATIONS'; break; } if (g.month - ((g.cd || {})['aid' + nm] || -99) < 6) { err = 'ASKED TOO RECENTLY'; break; }
      g.cd = { ...(g.cd || {}), ['aid' + nm]:g.month }; title = 'Financial support from ' + nm; o = { l:title, fx:{ reserves:0.5, debt:0.4 }, gr:{}, rel:{ [nm]:-2 } }; out = nm + ' deposits money at your central bank.'; break;
    case 'alliance': if ((W.rel[nm] || 0) < 70) { err = 'RELATIONS MUST BE ABOVE 70'; break; } if (W.allies.includes(nm)) { err = 'ALREADY ALLIES'; break; }
      title = 'Defence pact with ' + nm; o = { l:title, fx:{ stability:2 }, gr:{ army:3 }, ally:nm, rel:{ [nm]:5 } }; out = 'A mutual defence treaty is signed. ' + nm + ' will come to your aid in war.'; if (W.rival) W.rel[W.rival] = clamp(W.rel[W.rival] - 5, 0, 100); break;
    case 'expel': title = 'Ambassador of ' + nm + ' expelled'; o = { l:title, fx:{ approval:(W.rel[nm] || 50) < 30 ? 1.5 : -1 }, gr:{ army:2 }, rel:{ [nm]:-15 } }; out = 'The ambassador has 72 hours to leave.'; break;
    case 'sanction': title = 'Sanctions on ' + nm; o = { l:title, fx:{ growth:-0.05, approval:nm === W.rival ? 1 : 0 }, gr:{ business:-3 }, rel:{ [nm]:-20 } }; W.sanctions = [...new Set([...(W.sanctions || []), nm])]; out = 'Their state firms are barred from your market.'; break;
    case 'prov_dev': { const p = g.provs[arg]; title = 'Development package for ' + p.name; o = { l:title, fx:{ deficit:0.08 }, gr:{ rural:2 }, prov:{ i:arg, support:12, unrest:-6 } }; out = 'Roads, clinics and a jobs scheme for ' + p.name + '.'; break; }
    case 'prov_visit': { const p = g.provs[arg]; title = 'You tour ' + p.name; o = { l:title, fx:{ approval:0.8 }, gr:{}, prov:{ i:arg, support:6, unrest:-2 } }; out = 'Rallies and town halls across ' + p.name + '.'; break; }
    case 'prov_sec': { const p = g.provs[arg]; title = 'Security operation in ' + p.name; o = { l:title, fx:{ stability:1 }, gr:{ army:2, youth:-2 }, prov:{ i:arg, support:-8, unrest:-15 }, tags:['crackdown'], rem:'sent troops into ' + p.name }; out = 'Checkpoints and raids across ' + p.name + '.'; break; }
    case 'meet': title = 'You meet ' + g.gnames[arg]; o = { l:title, fx:{}, gr:{ [arg]:5 }, rem:'met ' + g.gnames[arg] }; out = 'A long meeting, warm words, no commitments.'; break;
    case 'tech': { const T = window.NSContent8.TECH_PROJECTS.find(x => x.id === arg); if (!T) { err = 'UNKNOWN PROJECT'; break; } if (g.laws.some(l => l.id === T.id)) { err = 'ALREADY DONE'; break; }
      const reqK = Object.keys(T.req || {}).find(k => g.tech[k] < T.req[k]); if (reqK) { err = 'NEEDS ' + reqK.toUpperCase() + ' ' + T.req[reqK] + '+'; break; }
      title = T.name; Object.keys(T.boost).forEach(k => g.tech[k] = clamp(g.tech[k] + T.boost[k], 0, 100));
      o = { l:title, fx:{ ...T.fx, ...(T.fx2 || {}) }, gr:T.gr, law:{ id:T.id, name:T.name, desc:T.d, mods:T.mods || {}, cat:'TECH' } }; out = T.d + ' ' + Object.keys(T.boost).map(k => k + ' +' + T.boost[k]).join(', ') + '.'; break; }
    case 'armour': title = 'Tanks and artillery ordered'; g.mil.army = clamp(g.mil.army + 5, 0, 100); o = { l:title, fx:{ deficit:0.12, reserves:-0.1 }, gr:{ army:5 } }; out = 'Two armoured regiments re-equipped by next year.'; break;
    case 'coin': { const i = g.provs.reduce((bi, p, j) => p.unrest > g.provs[bi].unrest ? j : bi, 0); title = 'Counter-insurgency in ' + g.provs[i].name; o = { l:title, fx:{ stability:2, deficit:0.08 }, gr:{ army:3, rural:-3 }, prov:{ i, unrest:-14, support:-6 }, tags:['operation'], rem:'ran a counter-insurgency campaign in ' + g.provs[i].name }; out = 'Brigades sweep the districts of ' + g.provs[i].name + '.'; break; }
    case 'fighters': title = (arg === 'China' ? 'Chinese' : 'American') + ' fighter jets ordered'; g.mil.air = clamp(g.mil.air + (arg === 'China' ? 5 : 7), 0, 100); o = { l:title, fx:{ deficit:arg === 'China' ? 0.1 : 0.2, reserves:-0.15 }, gr:{ army:6 }, rel:{ [arg]:8, [arg === 'China' ? 'United States' : 'China']:-5 } }; out = 'Two squadrons ordered. Pilots train abroad first.'; break;
    case 'airdef': title = 'Integrated air defence'; g.mil.air = clamp(g.mil.air + 4, 0, 100); o = { l:title, fx:{ deficit:0.1, stability:1 }, gr:{ army:3 } }; out = 'Radar and missile batteries ring the major cities.'; break;
    case 'airstrike': if (!W.war) { err = 'NOT AT WAR'; break; } title = 'Air strikes on ' + W.war.enemy; o = { l:title, fx:{ deficit:0.05 }, gr:{ army:3 }, warPush:Math.round(g.mil.air / 12) + 2 }; out = 'Sorties hit depots and bridges behind the front.'; break;
    case 'subs': if (g.mil.landlocked) { err = 'NO COASTLINE'; break; } title = 'Submarines ordered'; g.mil.navy = clamp(g.mil.navy + 6, 0, 100); o = { l:title, fx:{ deficit:0.15, reserves:-0.15 }, gr:{ army:4 } }; out = 'Four attack submarines, first delivery in three years.'; break;
    case 'frigates': if (g.mil.landlocked) { err = 'NO COASTLINE'; break; } title = 'Frigates laid down at home'; g.mil.navy = clamp(g.mil.navy + 4, 0, 100); o = { l:title, fx:{ deficit:0.1, unemp:-0.05 }, gr:{ army:3, labour:3 } }; out = 'The shipyards hire four thousand workers.'; break;
    case 'patrol': if (g.mil.landlocked) { err = 'NO COASTLINE'; break; } title = 'Coastal anti-smuggling patrols'; o = { l:title, fx:{ deficit:-0.06 }, gr:{ elites:-3, business:2 } }; out = 'Fuel and cigarette smuggling down a third; customs revenue rises.'; break;
    case 'blockade': if (!W.war) { err = 'NOT AT WAR'; break; } if (g.mil.landlocked) { err = 'NO COASTLINE'; break; } title = 'Naval blockade of ' + W.war.enemy; o = { l:title, fx:{}, gr:{ army:3 }, warPush:Math.round(g.mil.navy / 15) + 1 }; out = 'Their ports are closed to shipping. Neutral powers protest.'; W.partners.forEach(p => { if (window.NSWorld.POWERS.includes(p)) W.rel[p] = clamp(W.rel[p] - 2, 0, 100); }); break;
    case 'drones': title = 'Armed drone programme'; g.mil.tech.drones = clamp(g.mil.tech.drones + 10, 0, 100); g.mil.air = clamp(g.mil.air + 2, 0, 100); o = { l:title, fx:{ deficit:0.06 }, gr:{ army:4 }, rel:W.rival ? { [W.rival]:-3 } : {} }; out = 'Licensed production of armed drones begins.'; break;
    case 'cyber': title = 'Cyber command established'; g.mil.tech.cyber = clamp(g.mil.tech.cyber + 12, 0, 100); o = { l:title, fx:{ deficit:0.04, stability:1 }, gr:{ army:2 } }; out = 'A joint command for network defence and offensive operations.'; break;
    case 'missiles': title = 'Long-range missile test'; g.mil.tech.missiles = clamp(g.mil.tech.missiles + 10, 0, 100); o = { l:title, fx:{ approval:1.5 }, gr:{ army:5, lenders:-3 }, rel:Object.fromEntries([...(W.rival ? [[W.rival, -10]] : []), ['United States', -4]]) }; out = 'The missile lands in the ocean 2,000 km away. Condemnation follows.'; break;
    case 'satellite': title = 'Military satellite launched'; g.mil.tech.space = clamp(g.mil.tech.space + 12, 0, 100); o = { l:title, fx:{ deficit:0.05, approval:1 }, gr:{ army:3, youth:3 } }; out = 'Your first reconnaissance satellite reaches orbit.'; break;
    case 'minister': { const m = g.ministers.find(x => x.k === arg.k); if (!m) { err = 'NO SUCH POST'; break; } const tech = arg.kind === 'technocrat', b = ND().BY_NAME[g.nation];
      const nm = WC().personName(b, 'min' + arg.k + g.month + arg.kind + g.seed, RH), old = m.name;
      Object.assign(m, { name:nm, party:tech ? 'Technocrat' : (g.pol.parties.find(p => p.role === 'gov') || { short:'GOV' }).short, comp:Math.round(tech ? 68 + H(nm) * 24 : 35 + H(nm) * 30), loyal:Math.round(tech ? 35 + H(nm + 'l') * 25 : 80 + H(nm + 'l') * 18), since:g.month });
      title = nm + ' becomes ' + m.post + ' minister'; o = { l:title, fx:tech ? { unity:-2 } : { unity:2 }, gr:tech ? { elites:-5, lenders:3 } : { elites:4 } }; out = old + ' is out. ' + (tech ? 'The new minister is a respected outsider with no base in the party.' : 'The new minister is a party loyalist.'); break; }
    case 'reform': { const Rf = window.NSContent8.REFORMS.find(x => x.id === arg.id); if (!Rf || !Rf.ok(g.sys)) { err = 'NOT AVAILABLE'; break; }
      const v = amendVote(g); let pass = false, extra = {}, extraGr = {}, how = arg.how;
      if (how === 'amend') { pass = v >= 67; if (!pass) { err = 'NEEDS TWO-THIRDS · YOU HAVE ' + v + '%'; break; } }
      else if (how === 'referendum') { if (!g.demo) { err = 'NO REFERENDUMS IN THIS SYSTEM'; break; } pass = g.s.approval + (H(g.seed + Rf.id + g.month) - 0.5) * 16 >= 52; if (!pass) extra = { approval:-4, unity:-3 }; }
      else { if (g.demo && !g.sys.emergency) { err = 'DECREE NEEDS EMERGENCY RULE OR A NON-DEMOCRATIC SYSTEM'; break; } pass = true; extra = { stability:-4 }; extraGr = { lenders:-6, youth:-6 }; }
      title = (pass ? '' : 'Referendum lost: ') + Rf.name + (how === 'decree' ? ' (by decree)' : how === 'referendum' && pass ? ' (by referendum)' : '');
      if (pass) { Object.keys(Rf.set).forEach(k => { if (k === 'judiciary') g.sys.judiciary = clamp(g.sys.judiciary + Rf.set[k], 0, 100); else g.sys[k] = Rf.set[k]; });
        if (Rf.set.chambers === 1) g.senate = null; if (Rf.set.chambers === 2 && !g.senate) g.senate = { name:'Senate', total:100, gov:Math.round(100 * clamp(g.govSeats / g.total, 0.25, 0.8)) };
        if (Rf.set.emergency > 0) { g.demoWas = g.demo; g.demo = false; } if (Rf.set.emergency === 0) g.demo = g.demoWas != null ? g.demoWas : true; }
      const fx = pass ? { ...Rf.fx } : {}; Object.keys(extra).forEach(k => fx[k] = (fx[k] || 0) + extra[k]); const gr = pass ? { ...Rf.gr } : {}; Object.keys(extraGr).forEach(k => gr[k] = (gr[k] || 0) + extraGr[k]);
      o = { l:title, fx, gr, tags:pass ? ['constitution', ...(Rf.tag ? [Rf.tag] : [])] : [], rem:pass ? 'changed the constitution: ' + Rf.name.toLowerCase() : 'lost a referendum on ' + Rf.name.toLowerCase() };
      out = pass ? Rf.d + ' The change takes effect immediately.' : 'Voters reject the proposal. Your authority takes a hit.'; break; }
    case 'fx': if (!arg || !arg.title) { err = 'BAD ACTION'; break; } title = arg.title; o = { l:title, fx:arg.fx || {}, gr:arg.gr || {}, tags:arg.tags || [], rem:arg.rem || ('chose to ' + arg.title.toLowerCase()), ...(arg.rel ? { rel:arg.rel } : {}), ...(arg.prov ? { prov:arg.prov } : {}), ...(arg.law ? { law:arg.law } : {}) }; out = arg.out || ''; break;
    case 'custom': if (!arg || !arg.text || arg.text.trim().length < 4) { err = 'WRITE YOUR ORDER FIRST'; break; }
      title = 'Your order (' + arg.area + ')'; o = { l:title, fx:{}, gr:{}, rem:'ordered: ' + arg.text.trim().slice(0, 120) }; out = 'Your order goes out: "' + arg.text.trim().slice(0, 240) + '"'; break;
    default: err = 'UNKNOWN ACTION';
  }
  if (err) return { g, error:err };
  g.ap -= 1;
  applyOption(g, o);
  const dlt = diff(g, a), rid = 'x' + kind + (arg && typeof arg !== 'object' ? arg : '') + g.month + '-' + g.ap;
  const res = { rid, snap:a, ctx:{ body:kind === 'custom' ? 'Free-form order in the ' + arg.area + ' window' : title, desc:kind === 'custom' ? arg.text.trim().slice(0, 400) : 'Action taken from the ' + kind + ' window' }, kind:kind === 'custom' ? 'custom' : 'action', custom:kind === 'custom', title, choice:kind === 'custom' ? arg.text.trim().slice(0, 140) : title, out, press:press(g, title, dlt.sent), dlt, next:[] };
  g.cur.results.push(res); g.cur.last = rid;
  g.hist.unshift({ m:g.month, title, choice:'Action', out, cat:'ACTION' });
  return { g, rid, ok };
}

/* ---------- AI game master ---------- */
const CUSTOM_LIM = { approval:6, stability:6, unity:6, growth:0.5, inflation:1, reserves:0.6, deficit:0.6, debt:3 };
const AI_LIM = { approval:4, stability:4, unity:4, growth:0.4, inflation:0.8, reserves:0.4, deficit:0.3 };
const DYN_LIM = { approval:6, stability:6, unity:6, growth:0.5, inflation:1.2, reserves:0.6, deficit:0.5 };
function clampFx(fx, L) { const o = {}; Object.keys(L).forEach(k => { const v = +((fx || {})[k]); if (isFinite(v) && v) o[k] = r1(clamp(v, -L[k], L[k])); }); return o; }
function clampGr(g, gr, lim) { const o = {}; Object.keys(gr || {}).forEach(k => { const v = Math.round(+gr[k]); if (g.groups[k] && isFinite(v) && v) o[k] = clamp(v, -lim, lim); }); return o; }
function aiPrompt(g, res) {
  const s = g.s, X = ctx(g);
  const gs = Object.keys(g.groups).map(k => k + ' (' + g.gnames[k] + '): ' + Math.round(g.groups[k].s)).join('; ');
  const hist = g.hist.slice(1, 9).map(h => dateOf(h.m) + ': ' + h.title + ' -> ' + h.choice).join('\n') || 'none yet';
  const mem = Object.keys(g.groups).map(k => g.groups[k].mem[0] ? k + ' remembers you ' + g.groups[k].mem[0].t : '').filter(Boolean).join('; ') || 'nothing notable';
  const dl = res.dlt ? res.dlt.st.map(x => x.l + ' ' + x.v).concat(res.dlt.gr.map(x => x.l + ' ' + x.v)).join(', ') : '';
  const system = 'You are the game master of a turn-based political strategy game set in real countries in late 2026. The player governs; you decide how the world actually responds. Outcomes must be plausible for this specific country (real institutions, places, parties, economic conditions), consistent with the player\'s past decisions, and not always as the player intended: sometimes better than expected, sometimes worse, occasionally a backfire. Bad conditions (low support, high inflation, hostile groups) make backfires likelier. Write in plain, matter-of-fact newsroom English, no melodrama. Respond with ONLY a JSON object, no prose.';
  const W = g.world, ch = g.char || {}, C7 = window.NSContent7;
  const lead = 'LEADER: ' + g.player + ', ' + (ch.age || '') + ', former ' + (ch.background || '').toLowerCase() + ', ' + (ch.ideology || '') + ', party ' + (ch.party || '') + '. Traits: ' + (ch.traits || []).map(t => C7.TRAITS[t] ? C7.TRAITS[t].name : t).join(', ') + (ch.flaw && C7.FLAWS[ch.flaw] ? '; flaw: ' + C7.FLAWS[ch.flaw].name : '') + '\n';
  const wl = W ? 'WORLD: relations ' + W.partners.map(p => p + ' ' + Math.round(W.rel[p])).join(', ') + (W.war ? '; AT WAR with ' + W.war.enemy + ' (front ' + Math.round(W.war.front) + '/100)' : '') + (W.allies.length ? '; allies ' + W.allies.join(', ') : '') + '; recent world news: ' + W.feed.slice(0, 3).map(f => f.t).join(' / ') + '\n' : '';
  const user = 'COUNTRY: ' + g.nation + ' | ' + g.title + ' ' + g.player + ' | ' + dateOf(g.month) + ' (month ' + g.month + ' of 48)\n' + lead + wl
    + 'STATE: approval ' + Math.round(s.approval) + ', stability ' + Math.round(s.stability) + ', party unity ' + Math.round(s.unity) + ', growth ' + s.growth + '%, inflation ' + s.inflation + '%, unemployment ' + s.unemp + '%, debt ' + Math.round(s.debt) + '% GDP, deficit ' + deficit(g) + '%, reserves ' + s.reserves + ' months, IMF ' + g.imf.status + '\n'
    + 'GROUP SUPPORT (0-100): ' + gs + '\nGROUP MEMORY: ' + mem + '\nOPPOSITION: ' + X.opp.name + ' led by ' + X.opp.leader + '\nLAWS IN FORCE: ' + (g.laws.map(l => l.name).join('; ') || 'none') + '\nRECENT DECISIONS:\n' + hist + '\n\n'
    + (g.ministers ? 'CABINET: ' + g.ministers.map(m => m.post + ' ' + m.name + ' (competence ' + m.comp + ')').join('; ') + '\n' : '') + (g.sys ? 'SYSTEM: ' + g.sys.exec + ', ' + (g.sys.chambers === 2 ? 'bicameral' : 'unicameral') + ', ' + g.sys.electoral + ', ' + (g.sys.federal ? 'federal' : 'unitary') + ', judicial independence ' + g.sys.judiciary + (g.sys.emergency ? ', STATE OF EMERGENCY' : '') + '\n' : '') + (g.tech ? 'TECH: ' + Object.keys(g.tech).map(k => k + ' ' + g.tech[k]).join(', ') + ' | MILITARY: army ' + g.mil.army + ', air ' + g.mil.air + ', navy ' + g.mil.navy + ', drones ' + g.mil.tech.drones + ', cyber ' + g.mil.tech.cyber + '\n' : '')
    + (res.custom ? 'THE PLAYER WROTE THEIR OWN ORDER. Judge it like a real government would: is it legal, affordable and within the leader\'s powers? Who resists? Unrealistic, illegal or self-defeating orders should fail, be watered down or backfire; clever ones can succeed. There is NO baseline: your effects are the full effects.\n' : '')
    + (g.p9 ? 'POLITICAL PRESSURE: ' + JSON.stringify({ factions:g.p9.factions, coalition:g.p9.parties.map(p => ({party:p.short,role:p.role,trust:p.rel})), opposition:g.p9.opp, bills:g.p9.bills.map(b => ({name:b.name,stage:b.stage,risks:b.policy && b.policy.risks})) }) + '\n' : '')
    + 'UNRESOLVED CONSEQUENCES: ' + JSON.stringify(g.queue.slice(0, 6).map(q => ({event:q.id,due:q.m,cause:q.from}))) + '\n'
    + (g.demo && !(g.sys && g.sys.emergency) ? 'AUTHORITY: lasting laws require parliamentary passage. Free-form orders can implement legal executive measures, but cannot enact a lasting law. If a proposal requires legislation, describe preparatory work and the need to introduce a bill; do not claim the law passed or return a law object.\n' : '')
    + 'THIS DECISION\nSituation: ' + res.title + '. ' + (res.ctx ? res.ctx.body : '') + '\nPlayer chose: ' + res.choice + (res.ctx && res.ctx.desc ? ' (' + res.ctx.desc + ')' : '') + '\nExpected result: ' + (res.out || '') + '\nBaseline effects already applied: ' + (dl || 'none') + '\n\n'
    + 'Return JSON: {"verdict":"as expected"|"better than expected"|"worse than expected"|"backfired","outcome":"at most 3 sentences and under 450 characters, describing what actually happened, naming specific people, places or institutions","effects":{"approval":n,"stability":n,"unity":n,"growth":n,"inflation":n,"reserves":n,"deficit":n},"groups":{"<group key>":n},"headlines":["pro-government headline","independent headline","opposition headline"],"twist":null}\n'
    + 'For free-form orders you may also add "tech":{"digital|fintech|ai|chips|telecom|green":n within +/-8}, "military":{"army|air|navy|readiness":n within +/-6}, and "law":{"name":"","desc":"","mods":{"growth":n,"inflation":n,"unemp":n}} if the order creates a lasting policy; full effect limits are +/-6 (growth +/-0.5, inflation +/-1, reserves +/-0.6, deficit +/-0.6, debt +/-3), groups +/-12.\n' + 'Relations: you may add "relations":{"<country from WORLD list>":n} within +/-10 if the decision plausibly affects a foreign partner.\n' + 'effects and groups are ADDITIONAL adjustments on top of the baseline (approval/stability/unity within +/-4, growth +/-0.4, inflation +/-0.8, reserves +/-0.4 months, deficit +/-0.3 % of GDP; groups within +/-8, only keys from GROUP SUPPORT). Omit unchanged keys. For "as expected" keep adjustments small.\n'
    + 'About one decision in three should create a new situation: set "twist" to {"in":1-3 (months until it arrives),"cat":"ECONOMY|SOCIETY|SECURITY|FOREIGN|POLITICS","title":"short headline","body":"2 sentences","options":[{"label":"","desc":"one line","effects":{},"groups":{},"outcome":"1-2 sentences"}, 3 options]}. Twist option effects within +/-6 (growth +/-0.5, inflation +/-1.2, reserves +/-0.6, deficit +/-0.5), groups within +/-10.';
  return { system, user };
}
function parseAI(text) { const i = text.indexOf('{'), j = text.lastIndexOf('}'); if (i < 0 || j < i) return null; try { return JSON.parse(text.slice(i, j + 1)); } catch (e) { return null; } }
function applyAI(g, rid, ai) {
  g = C(g);
  const res = g.cur.results.find(r => r.rid === rid);
  if (!res || res.ai || !ai || typeof ai !== 'object' || Array.isArray(ai)) return g;
  const fx = clampFx(ai.effects, res.custom ? CUSTOM_LIM : AI_LIM), gr = clampGr(g, ai.groups, res.custom ? 12 : 8);
  if (res.custom && g.tech && ai.tech) Object.keys(ai.tech).forEach(k => { const v = Math.round(+ai.tech[k]); if (g.tech[k] != null && isFinite(v)) g.tech[k] = clamp(g.tech[k] + clamp(v, -8, 8), 0, 100); });
  if (res.custom && g.mil && ai.military) ['army','air','navy','readiness'].forEach(k => { const v = Math.round(+ai.military[k]); if (isFinite(v) && v && g.mil[k] != null) g.mil[k] = clamp(g.mil[k] + clamp(v, -6, 6), 0, 100); });
  if (res.custom && ai.law && ai.law.name) {
    if (g.demo && !(g.sys && g.sys.emergency)) res.next = [...(res.next || []), 'Legislation required: introduce ' + String(ai.law.name).slice(0, 80) + ' through Politics → Bills. No lasting law has been applied.'];
    else { const L = { id:'own_' + g.month + '_' + Math.round(H(ai.law.name) * 1e4), name:String(ai.law.name).slice(0, 80), desc:String(ai.law.desc || '').slice(0, 200), mods:clampFx(ai.law.mods || {}, { growth:0.15, inflation:0.3, unemp:0.2 }), cat:'OWN' }; if (!g.laws.some(l => l.name === L.name)) addLaw(g, L); }
  }
  const memo = 'chose to ' + res.choice.charAt(0).toLowerCase() + res.choice.slice(1);
  applyFx(g, fx);
  Object.keys(gr).forEach(k => remember(g, k, gr[k], memo));
  if (ai.relations && g.world) Object.keys(ai.relations).forEach(k => { const v = Math.round(+ai.relations[k]); if (g.world.rel[k] != null && isFinite(v)) g.world.rel[k] = clamp(g.world.rel[k] + clamp(v, -10, 10), 0, 100); });
  const v = String(ai.verdict || 'as expected').toLowerCase();
  if (typeof ai.outcome === 'string' && ai.outcome.length > 20) { let t = ai.outcome.trim(); if (t.length > 700) { const cut = t.slice(0, 700); const i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? ')); t = i > 120 ? cut.slice(0, i + 1) : cut.replace(/\s+\S*$/, '') + '…'; } res.out = t; }
  res.verdict = /backfire/.test(v) ? 'BACKFIRED' : /worse/.test(v) ? 'WORSE THAN EXPECTED' : /better/.test(v) ? 'BETTER THAN EXPECTED' : 'AS EXPECTED';
  if (Array.isArray(ai.headlines) && ai.headlines.length >= 3) res.press = res.press.map((p, i) => ({ ...p, h:String(ai.headlines[i] || p.h).slice(0, 140) }));
  if (res.snap) res.dlt = diff(g, res.snap);
  const tw = ai.twist;
  if (tw && tw.title && Array.isArray(tw.options) && tw.options.length >= 2 && !g.queue.some(q => q.data) && g.month < TERM) {
    const data = { cat:CATS_OK.includes(tw.cat) ? tw.cat : 'POLITICS', title:String(tw.title).slice(0, 120), body:String(tw.body || '').slice(0, 500),
      opts:tw.options.slice(0, 3).map(o => ({ l:String(o.label || 'Act').slice(0, 90), d:String(o.desc || '').slice(0, 160), fx:clampFx(o.effects, DYN_LIM), gr:clampGr(g, o.groups, 10), out:String(o.outcome || '').slice(0, 400) })) };
    const n = clamp(Math.round(+tw.in || 2), 1, 3);
    g.queue.push({ id:'ai_dyn', m:g.month + n, data, from:res.title, p:4 });
    res.next = [...(res.next || []), 'Developing: ' + data.title + ' (within ' + n + ' month' + (n === 1 ? '' : 's') + ')'];
  }
  res.ai = true; delete res.snap;
  g.cur.cards.forEach(cd => { if (cd.done && cd.done.rid === rid) cd.done = res; });
  const h = g.hist.find(x => x.m === g.month && (x.title === res.title || res.title.endsWith(x.title)));
  if (h) { h.out = res.out; h.choice = h.choice + (res.verdict !== 'AS EXPECTED' ? ' · ' + res.verdict.toLowerCase() : ''); }
  return g;
}
const CATS_OK = ['ECONOMY','SOCIETY','SECURITY','FOREIGN','POLITICS'];

window.NSG = { applyBill, customCard, amendVote, chamberShares, aiPrompt, parseAI, applyAI, act, budgetFx, budgetVote, hasT, C, TERM, GROUPS, MONTHS, dateOf, shortDate, nations, newGame, chooseEvent, enact, repeal, openNeg, negScore, negToggle, negPropose, negWalk, negClose, endMonth, ctx, rating, market, interest, deficit, seatShare, upcoming, fmtP, PRESETS };
})();

})();
