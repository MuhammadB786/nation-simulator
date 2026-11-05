/*__wait*/(function __w(){ if (!(window.NationData && window.WorldContext && window.NSContent)) { setTimeout(__w, 15); return; }
/* Living world: partners, relations, rival wars between other states, global shocks, diplomacy and war. */
(function(){
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = v => Math.round(v * 10) / 10;
const H = s => window.NationData.hash(s);
const ND = () => window.NationData;

const CURATED = {
  'Pakistan':{ partners:['China','United States','Saudi Arabia','India','Afghanistan','Iran','United Arab Emirates','Turkey'], rel:{ 'China':86, 'United States':46, 'Saudi Arabia':80, 'India':14, 'Afghanistan':28, 'Iran':45, 'United Arab Emirates':74, 'Turkey':78 }, rival:'India', border:['India','Afghanistan','Iran','China'] },
  'India':{ partners:['United States','Russia','China','Pakistan','Japan','United Arab Emirates','Bangladesh','France'], rel:{ 'United States':70, 'Russia':66, 'China':28, 'Pakistan':14, 'Japan':76, 'United Arab Emirates':72, 'Bangladesh':42, 'France':72 }, rival:'Pakistan', border:['Pakistan','China','Bangladesh'] },
  'Argentina':{ partners:['United States','Brazil','China','Chile','United Kingdom','Spain','Uruguay','Paraguay'], rel:{ 'United States':78, 'Brazil':40, 'China':45, 'Chile':62, 'United Kingdom':30, 'Spain':66, 'Uruguay':64, 'Paraguay':62 }, rival:'United Kingdom', border:['Brazil','Chile','Uruguay','Paraguay'] },
  'Sri Lanka':{ partners:['India','China','Japan','United States','Pakistan','United Kingdom','Saudi Arabia','Maldives'], rel:{ 'India':62, 'China':64, 'Japan':66, 'United States':56 }, rival:null, border:[] },
  'Egypt':{ partners:['Saudi Arabia','United Arab Emirates','United States','Israel','Ethiopia','Sudan','Libya','Russia'], rel:{ 'Saudi Arabia':78, 'United Arab Emirates':80, 'United States':62, 'Israel':38, 'Ethiopia':18, 'Sudan':40, 'Libya':40, 'Russia':55 }, rival:'Ethiopia', border:['Israel','Sudan','Libya'] },
  'Ukraine':{ partners:['Russia','United States','Poland','Germany','United Kingdom','France','Turkey','Belarus'], rel:{ 'Russia':2, 'United States':66, 'Poland':80, 'Germany':78, 'United Kingdom':84, 'France':78, 'Turkey':55, 'Belarus':12 }, rival:'Russia', border:['Russia','Poland','Belarus'], war:'Russia' },
  'Russia':{ partners:['China','Ukraine','United States','India','Belarus','Iran','Turkey','Kazakhstan'], rel:{ 'China':76, 'Ukraine':2, 'United States':14, 'India':64, 'Belarus':88, 'Iran':66, 'Turkey':48, 'Kazakhstan':60 }, rival:'Ukraine', border:['Ukraine','Belarus','China','Kazakhstan'], war:'Ukraine' },
  'Israel':{ partners:['United States','Iran','Egypt','Jordan','Saudi Arabia','Turkey','Germany','United Arab Emirates'], rel:{ 'United States':82, 'Iran':3, 'Egypt':40, 'Jordan':36, 'Saudi Arabia':30, 'Turkey':16, 'Germany':66, 'United Arab Emirates':52 }, rival:'Iran', border:['Egypt','Jordan','Lebanon','Syria'] },
  'Iran':{ partners:['Russia','China','Israel','Saudi Arabia','Iraq','Turkey','United States','Pakistan'], rel:{ 'Russia':66, 'China':66, 'Israel':3, 'Saudi Arabia':30, 'Iraq':62, 'Turkey':44, 'United States':8, 'Pakistan':45 }, rival:'Israel', border:['Iraq','Turkey','Pakistan','Afghanistan'] },
  'China':{ partners:['United States','Russia','Japan','India','Pakistan','Philippines','Vietnam','Germany'], rel:{ 'United States':22, 'Russia':76, 'Japan':28, 'India':28, 'Pakistan':86, 'Philippines':22, 'Vietnam':45, 'Germany':52 }, rival:'United States', border:['India','Russia','Vietnam','Pakistan'] },
  'United States':{ partners:['China','Canada','Mexico','United Kingdom','Japan','Germany','Russia','Israel'], rel:{ 'China':22, 'Canada':58, 'Mexico':48, 'United Kingdom':76, 'Japan':80, 'Germany':66, 'Russia':14, 'Israel':82 }, rival:'China', border:['Canada','Mexico'] },
  'United Kingdom':{ partners:['United States','France','Germany','Ireland','China','Russia','India','Argentina'], rel:{ 'United States':76, 'France':66, 'Germany':70, 'Ireland':64, 'China':34, 'Russia':8, 'India':64, 'Argentina':30 }, rival:'Russia', border:['Ireland'] },
  'Turkey':{ partners:['United States','Russia','Germany','Greece','Iran','Azerbaijan','Syria','Saudi Arabia'], rel:{ 'Greece':30, 'Syria':40, 'Azerbaijan':90 }, rival:'Greece', border:['Greece','Iran','Syria','Iraq'] },
  'Nigeria':{ partners:['United States','China','United Kingdom','Niger','Cameroon','Ghana','Benin','South Africa'], rel:{ 'Niger':34, 'Cameroon':48 }, rival:null, border:['Niger','Cameroon','Benin'] },
  'Ethiopia':{ partners:['Egypt','Eritrea','Sudan','Somalia','Kenya','China','United Arab Emirates','United States'], rel:{ 'Egypt':18, 'Eritrea':16, 'Somalia':30 }, rival:'Eritrea', border:['Eritrea','Sudan','Somalia','Kenya'] },
  'Venezuela':{ partners:['United States','Colombia','Brazil','Guyana','Russia','China','Cuba','Iran'], rel:{ 'United States':6, 'Colombia':36, 'Guyana':10, 'Russia':74, 'China':70, 'Cuba':86 }, rival:'Guyana', border:['Colombia','Brazil','Guyana'] },
  'South Korea':{ partners:['United States','China','Japan','North Korea','Russia','Germany','Vietnam','Australia'], rel:{ 'North Korea':4, 'Japan':52 }, rival:'North Korea', border:['North Korea'] },
  'Armenia':{ partners:['Azerbaijan','Russia','Turkey','Iran','France','Georgia','United States','Germany'], rel:{ 'Azerbaijan':8, 'Turkey':18 }, rival:'Azerbaijan', border:['Azerbaijan','Turkey','Iran','Georgia'] },
  'Azerbaijan':{ partners:['Armenia','Turkey','Russia','Iran','Israel','Georgia','Kazakhstan','United States'], rel:{ 'Armenia':8, 'Turkey':90, 'Israel':70 }, rival:'Armenia', border:['Armenia','Iran','Russia','Georgia'] }
};
const POWERS = ['United States','China','Russia','Germany','United Kingdom','France','Japan','India','Saudi Arabia','Turkey'];
const HOT = [['Russia','Ukraine'],['Israel','Iran'],['India','Pakistan'],['China','Taiwan'],['Ethiopia','Eritrea'],['Sudan','South Sudan'],['Armenia','Azerbaijan'],['Venezuela','Guyana'],['North Korea','South Korea'],['Serbia','Kosovo'],['Saudi Arabia','Yemen'],['Democratic Republic of the Congo','Rwanda'],['Morocco','Algeria'],['Greece','Turkey'],['Thailand','Cambodia']];

function power(name) { const n = ND().BY_NAME[name]; if (!n) return 30; return clamp(Math.round(Math.log10(n.gdp + 1) * 18 + Math.log10(n.pop + 1) * 8 + (window.WorldContext.NUCLEAR && window.WorldContext.NUCLEAR.includes(name) ? 12 : 0)), 10, 100); }
function initWorld(name, seed) {
  const me = ND().BY_NAME[name], cur = CURATED[name];
  let partners = cur ? cur.partners.filter(p => ND().BY_NAME[p]) : null;
  if (!partners) {
    const same = ND().NATIONS.filter(n => n.region === me.region && n.name !== name && n.pop >= 1).sort((a, b) => b.gdp - a.gdp).slice(0, 4).map(n => n.name);
    partners = [...new Set([...same, 'United States', 'China', 'Russia', 'Germany'].filter(p => p !== name))].slice(0, 8);
  }
  const rel = {};
  partners.forEach(p => rel[p] = cur && cur.rel[p] != null ? cur.rel[p] : Math.round(clamp(52 + (H(name + p) - 0.5) * 30, 20, 80)));
  let rival = cur ? cur.rival : null;
  if (!rival) { const lowest = partners.filter(p => !POWERS.includes(p)).sort((a, b) => rel[a] - rel[b])[0]; if (lowest && rel[lowest] < 40) rival = lowest; }
  const border = cur ? cur.border : partners.filter(p => ND().BY_NAME[p] && ND().BY_NAME[p].region === me.region && !POWERS.includes(p)).slice(0, 3);
  const wars = HOT.filter(([a, b]) => a !== name && b !== name && ND().BY_NAME[a] && ND().BY_NAME[b] && H(seed + a + b) < 0.35).slice(0, 2).map(([a, b]) => ({ a, b, since:0, int:Math.round(30 + H(a + b) * 40) }));
  if (H(seed + 'ru') < 0.9 && name !== 'Russia' && name !== 'Ukraine' && !wars.some(w => w.a === 'Russia')) wars.unshift({ a:'Russia', b:'Ukraine', since:-40, int:60 });
  const feed = [...wars.map(x => ({ m:1, t:'Fighting continues between ' + x.a + ' and ' + x.b, d:'No ceasefire is in sight.', tone:'war' })), { m:1, t:'Oil trades near $80 a barrel', d:'Markets watch the Gulf and the Black Sea.', tone:'neutral' }, { m:1, t:'US–China trade talks stall again', d:'Tariffs stay in place on both sides.', tone:'neutral' }];
  if (cur && cur.war) feed.unshift({ m:1, t:'Your country is at war with ' + cur.war, d:'The front has barely moved in months.', tone:'war' });
  return { partners, rel, rival, border, allies:[], sanctions:[], wars, oil:80, feed, war:cur && cur.war ? { enemy:cur.war, front:50, months:12, cas:0, fatigue:20 } : null, hist:[] };
}
const WEV = [
  { id:'oil_up', w:6, f:(W, R) => ({ t:'Oil jumps to $' + (W.oil + 12) + ' after attacks on Gulf shipping', d:'Importers pay more for every barrel.', fx:{ inflation:0.4, growth:-0.1 }, oil:12 }) },
  { id:'oil_down', w:5, f:(W, R) => ({ t:'Oil slides to $' + Math.max(50, W.oil - 10) + ' as OPEC+ raises output', d:'Cheaper imports, weaker petro-states.', fx:{ inflation:-0.3 }, oil:-10 }) },
  { id:'fed_cut', w:4, f:() => ({ t:'US Federal Reserve cuts rates', d:'Emerging-market borrowing costs ease.', fx:{ rate:-0.3 } }) },
  { id:'fed_hike', w:3, f:() => ({ t:'Fed signals higher rates for longer', d:'Dollar strengthens; capital leaves emerging markets.', fx:{ rate:0.4, reserves:-0.1 } }) },
  { id:'china_slow', w:3, f:() => ({ t:'China’s growth slows to its weakest in decades', d:'Commodity demand and export orders fall.', fx:{ growth:-0.15 } }) },
  { id:'grain', w:3, f:() => ({ t:'Black Sea grain corridor disrupted', d:'Wheat prices up 18 per cent.', fx:{ inflation:0.3 } }) },
  { id:'ai_boom', w:3, f:() => ({ t:'Global tech investment surge lifts trade', d:'Export orders rise worldwide.', fx:{ growth:0.1 } }) },
  { id:'coup_abroad', w:3, f:(W, R) => { const p = R.pick(ND().NATIONS.filter(n => n.difficulty >= 4 && n.pop >= 3).map(n => n.name)); return { t:'Military coup in ' + p, d:'The army has dissolved parliament and closed the borders.' }; } },
  { id:'elec_abroad', w:5, f:(W, R) => { const p = R.pick(W.partners); const up = R.r() > 0.5; return { t:(up ? 'Pro-engagement' : 'Nationalist') + ' government wins power in ' + p, d:up ? 'The new leadership wants closer ties with you.' : 'The new leadership is cooler towards you.', rel:{ [p]:up ? 8 : -8 } }; } },
  { id:'summit', w:4, f:(W, R) => { const p = R.pick(['South Africa','United States','India','Brazil','Indonesia']); return { t:'G20 summit in ' + p + ' ends without a joint communiqué', d:'Disagreement over wars and trade.' }; } },
  { id:'quake_abroad', w:2, f:(W, R) => { const p = R.pick(W.partners); return { t:'Deadly earthquake strikes ' + p, d:'Thousands dead. An aid appeal goes out.', ask:{ kind:'aid', who:p } }; } },
  { id:'sanction_abroad', w:3, f:(W, R) => { const [a, b] = R.pick([['United States','Russia'],['United States','Iran'],['United States','China'],['United Kingdom','Russia'],['Germany','Russia'],['China','United States'],['United States','Venezuela'],['France','Russia']]); return { t:a + ' sanctions ' + b + '’s state banks', d:'Third countries are told to pick a side.' }; } },
  { id:'tariff_war', w:3, f:() => ({ t:'US and China raise tariffs again', d:'Global trade forecasts are cut.', fx:{ growth:-0.1 } }) },
  { id:'pandemic_scare', w:1, f:() => ({ t:'WHO warns of a new respiratory virus', d:'Airports introduce screening.', fx:{ growth:-0.05 } }) },
  { id:'partner_crisis', w:3, f:(W, R) => { const p = R.pick(W.partners.filter(x => !POWERS.includes(x))); return p ? { t:'Currency crisis in ' + p, d:'Their imports from you collapse.', fx:{ growth:-0.08 } } : null; } }
];
function rng(seed, m) { let i = 0; return { r:() => H(seed + 'w' + m + (i++)), pick(a) { return a.length ? a[Math.floor(this.r() * a.length)] : null; }, two(a) { const x = this.pick(a); return [x, this.pick(a.filter(y => y !== x))]; } }; }
function stepWorld(g) {
  const W = g.world, R = rng(g.seed, g.month), feed = [], fx = {}, cards = [];
  W.oil = clamp(W.oil + Math.round((R.r() - 0.5) * 6), 50, 140);
  W.wars.forEach(w => {
    w.int = clamp(w.int + Math.round((R.r() - 0.48) * 14), 0, 100);
    if (R.r() < 0.3) feed.push({ t:(w.int > 60 ? 'Heavy fighting between ' : 'Clashes continue between ') + w.a + ' and ' + w.b, d:w.int > 60 ? 'Casualties rise; mediation stalls.' : 'Front lines barely move.', tone:'war' });
  });
  W.wars = W.wars.filter(w => { if (w.int < 8) { feed.push({ t:w.a + ' and ' + w.b + ' agree a ceasefire', d:'Mediators announce a halt to fighting.', tone:'good' }); return false; } return true; });
  if (R.r() < 0.06 && W.wars.length < 4) { const cand = HOT.filter(([a, b]) => a !== g.nation && b !== g.nation && ND().BY_NAME[a] && ND().BY_NAME[b] && !W.wars.some(w => w.a === a && w.b === b)); const p = R.pick(cand); if (p) { W.wars.push({ a:p[0], b:p[1], since:g.month, int:55 }); feed.unshift({ t:'War breaks out between ' + p[0] + ' and ' + p[1], d:'The UN Security Council meets in emergency session.', tone:'war' }); if (W.partners.includes(p[0]) || W.partners.includes(p[1])) cards.push({ id:'w_side', data:{ a:p[0], b:p[1] } }); fx.inflation = (fx.inflation || 0) + 0.2; } }
  const n = 2 + (R.r() > 0.5 ? 1 : 0);
  const tot = WEV.reduce((a, e) => a + e.w, 0);
  const seen = {};
  for (let i = 0; i < n; i++) { let x = R.r() * tot, e = WEV[0]; for (const ev of WEV) { x -= ev.w; if (x <= 0) { e = ev; break; } }
    if (seen[e.id] || (e.id.startsWith('oil') && (seen.oil_up || seen.oil_down))) continue; seen[e.id] = 1;
    const o = e.f(W, R); if (!o) continue; if (feed.some(f => f.t === o.t)) continue;
    feed.push({ t:o.t, d:o.d, tone:o.fx && Object.values(o.fx).some(v => v < 0) ? 'bad' : 'neutral' });
    Object.keys(o.fx || {}).forEach(k => fx[k] = r1((fx[k] || 0) + o.fx[k]));
    if (o.oil) W.oil = clamp(W.oil + o.oil, 50, 140);
    Object.keys(o.rel || {}).forEach(k => { if (W.rel[k] != null) W.rel[k] = clamp(W.rel[k] + o.rel[k], 0, 100); });
    if (o.ask) cards.push({ id:'w_aid', data:o.ask });
  }
  W.partners.forEach(p => { W.rel[p] = clamp(Math.round((W.rel[p] + (50 - W.rel[p]) * 0.01) * 10) / 10, 0, 100); });
  if (W.rival && W.rel[W.rival] < 12 && !W.war && R.r() < 0.25) cards.push({ id:'w_mobilise', data:{ who:W.rival } });
  W.feed = [...feed.map(f => ({ ...f, m:g.month })), ...W.feed].slice(0, 40);
  return { fx, cards, feed };
}
function stepWar(g) {
  const W = g.world, w = W.war; if (!w) return null;
  const mine = g.mil.strength * 0.6 + g.mil.readiness * 0.4 + W.allies.length * 6, theirs = power(w.enemy) * 0.85;
  const R = rng(g.seed, g.month + 'war');
  const shift = r1((mine - theirs) * 0.08 + (R.r() - 0.5) * 8 + (w.push || 0));
  w.push = 0; w.front = clamp(r1(w.front + shift), 0, 100); w.months += 1; w.cas += Math.round(200 + R.r() * 900 * (1 + Math.abs(shift) / 5));
  w.fatigue = clamp(w.fatigue + 3, 0, 100); g.mil.readiness = clamp(g.mil.readiness - 2, 0, 100);
  const fx = { deficit:0.04, growth:-0.05, approval:w.months <= 3 ? 1 : -0.8, reserves:g.base.hard ? 0 : -0.05 };
  let end = null;
  if (w.front >= 85) end = 'victory'; else if (w.front <= 15) end = 'defeat';
  return { shift, fx, end, line:{ t:'War with ' + w.enemy + ': front ' + (shift >= 0 ? 'advances' : 'falls back') + ' (' + (shift >= 0 ? '+' : '') + shift + ')', d:'Control ' + Math.round(w.front) + '/100 · month ' + w.months + ' · ' + w.cas.toLocaleString() + ' casualties so far.', good:shift >= 0 } };
}
window.NSWorld = { CURATED, POWERS, power, initWorld, stepWorld, stepWar };
})();

})();
