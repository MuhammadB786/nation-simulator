/* <nation-map> — game map. Set el.data = { me, mode, rel, blocs, enemy, sanctions, trade:[{to,v}], pins:[{id,label,tone,country,prov}], provs:[{name,support,unrest}], provMetric }
   modes: political | alliances | trade | war | sanctions | provinces
   events (bubbling): nationselect {name} · pinselect {id} · provselect {name} */
if (!window.customElements.get('nation-map')) (function(){
const D3 = 'https://unpkg.com/d3@7.9.0/dist/d3.min.js', D3_HASH = 'sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i';
const TJ = 'https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js', TJ_HASH = 'sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67';
const ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
const RES = () => window.__resources || {};
function loadScript(src, integrity, id) {
  return new Promise((res, rej) => { const el = document.createElement('script');
    if (RES()[id]) el.src = RES()[id]; else { el.src = src; el.integrity = integrity; el.crossOrigin = 'anonymous'; }
    el.onload = res; el.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(el); });
}
let libs;
function ensureLibs() {
  if (!libs) libs = (async () => { if (!window.d3) await loadScript(D3, D3_HASH, 'd3js'); if (!window.topojson) await loadScript(TJ, TJ_HASH, 'topojs'); return fetch(RES().atlas || ATLAS).then(r => r.json()); })();
  return libs;
}
const ISO = {};
('Afghanistan:AFG|Albania:ALB|Algeria:DZA|Angola:AGO|Argentina:ARG|Armenia:ARM|Australia:AUS|Austria:AUT|Azerbaijan:AZE|Bahrain:BHR|Bangladesh:BGD|Belarus:BLR|Belgium:BEL|Benin:BEN|Bhutan:BTN|Bolivia:BOL|Bosnia and Herzegovina:BIH|Botswana:BWA|Brazil:BRA|Bulgaria:BGR|Burkina Faso:BFA|Burundi:BDI|Cambodia:KHM|Cameroon:CMR|Canada:CAN|Central African Republic:CAF|Chad:TCD|Chile:CHL|China:CHN|Colombia:COL|Congo:COG|Republic of the Congo:COG|DR Congo:COD|Democratic Republic of the Congo:COD|Costa Rica:CRI|Croatia:HRV|Cuba:CUB|Cyprus:CYP|Czechia:CZE|Czech Republic:CZE|Denmark:DNK|Djibouti:DJI|Dominican Republic:DOM|Ecuador:ECU|Egypt:EGY|El Salvador:SLV|Eritrea:ERI|Estonia:EST|Eswatini:SWZ|Ethiopia:ETH|Finland:FIN|France:FRA|Gabon:GAB|Gambia:GMB|Georgia:GEO|Germany:DEU|Ghana:GHA|Greece:GRC|Guatemala:GTM|Guinea:GIN|Guinea-Bissau:GNB|Haiti:HTI|Honduras:HND|Hungary:HUN|India:IND|Indonesia:IDN|Iran:IRN|Iraq:IRQ|Ireland:IRL|Israel:ISR|Italy:ITA|Ivory Coast:CIV|Côte d’Ivoire:CIV|Jamaica:JAM|Japan:JPN|Jordan:JOR|Kazakhstan:KAZ|Kenya:KEN|Kosovo:XKX|Kuwait:KWT|Kyrgyzstan:KGZ|Laos:LAO|Latvia:LVA|Lebanon:LBN|Lesotho:LSO|Liberia:LBR|Libya:LBY|Lithuania:LTU|Madagascar:MDG|Malawi:MWI|Malaysia:MYS|Mali:MLI|Mauritania:MRT|Mauritius:MUS|Mexico:MEX|Moldova:MDA|Mongolia:MNG|Montenegro:MNE|Morocco:MAR|Mozambique:MOZ|Myanmar:MMR|Namibia:NAM|Nepal:NPL|Netherlands:NLD|New Zealand:NZL|Nicaragua:NIC|Niger:NER|Nigeria:NGA|North Korea:PRK|North Macedonia:MKD|Norway:NOR|Oman:OMN|Pakistan:PAK|Palestine:PSE|Panama:PAN|Papua New Guinea:PNG|Paraguay:PRY|Peru:PER|Philippines:PHL|Poland:POL|Portugal:PRT|Qatar:QAT|Romania:ROU|Russia:RUS|Rwanda:RWA|Saudi Arabia:SAU|Senegal:SEN|Serbia:SRB|Sierra Leone:SLE|Singapore:SGP|Slovakia:SVK|Slovenia:SVN|Somalia:SOM|South Africa:ZAF|South Korea:KOR|South Sudan:SSD|Spain:ESP|Sri Lanka:LKA|Sudan:SDN|Sweden:SWE|Switzerland:CHE|Syria:SYR|Taiwan:TWN|Tajikistan:TJK|Tanzania:TZA|Thailand:THA|Timor-Leste:TLS|Togo:TGO|Trinidad and Tobago:TTO|Tunisia:TUN|Turkey:TUR|Turkmenistan:TKM|Uganda:UGA|Ukraine:UKR|United Arab Emirates:ARE|United Kingdom:GBR|United States:USA|Uruguay:URY|Uzbekistan:UZB|Venezuela:VEN|Vietnam:VNM|Yemen:YEM|Zambia:ZMB|Zimbabwe:ZWE').split('|').forEach(x => { const [n, c] = x.split(':'); ISO[n] = c; });
const provCache = {};
function loadProvs(iso) {
  const bundled=Object.values(window.NSProvinceGeography||{}).find(g=>g.iso===iso);
  if(bundled)return Promise.resolve({type:'FeatureCollection',features:JSON.parse(JSON.stringify(bundled.features.filter(f=>f.properties.controlled!==false)))});
  if (!provCache[iso]) provCache[iso] = fetch('https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/' + iso + '/ADM1/geoBoundaries-' + iso + '-ADM1_simplified.geojson').then(r => { if (!r.ok) throw new Error('no provinces'); return r.json(); });
  return provCache[iso];
}
const H0 = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/province|state|region|territory|division|governorate|oblast|department|of |the |-|'/g, ' ').replace(/\s+/g, ' ').trim();
const BLOC_C = { NATO:'oklch(0.62 0.14 250)', EU:'oklch(0.7 0.12 220)', BRICS:'oklch(0.72 0.15 55)', SCO:'oklch(0.62 0.17 25)', GCC:'oklch(0.66 0.14 150)', ASEAN:'oklch(0.7 0.11 190)', MERCOSUR:'oklch(0.8 0.13 95)', AU:'oklch(0.55 0.08 320)' };
const relC = v => v >= 65 ? 'oklch(0.66 0.15 150 / .75)' : v >= 50 ? 'oklch(0.7 0.11 150 / .45)' : v >= 35 ? 'oklch(0.76 0.13 85 / .5)' : v >= 20 ? 'oklch(0.64 0.17 35 / .6)' : 'oklch(0.6 0.2 25 / .8)';
const LAND = '#1a222d', LINE = '#04060a', ME = 'oklch(0.7 0.16 250)';
const POLC = ['#5f7f9e','#9e6f5a','#6f9466','#a08c52','#8a6a9a','#5f958f','#a5676f','#7d8a55','#6c7fb0'];
const CSS = '@keyframes nmflow{to{stroke-dashoffset:-24}}@keyframes nmpulse{0%{opacity:.9}50%{opacity:.35}100%{opacity:.9}}@keyframes nmring{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.2);opacity:0}}';

class NationMap extends HTMLElement {
  constructor() { super(); this._d = null; this.ready = false; }
  connectedCallback() {
    if (this._init) return; this._init = true;
    this.style.display = 'block'; this.style.position = 'relative'; this.style.width = '100%'; this.style.height = '100%'; this.style.minHeight = '300px'; this.style.overflow = 'hidden'; this.style.background = '#0b1220';
    if (!document.getElementById('nm-css')) { const st = document.createElement('style'); st.id = 'nm-css'; st.textContent = CSS; document.head.appendChild(st); }
    this.tip = document.createElement('div');
    Object.assign(this.tip.style, { position:'absolute', pointerEvents:'none', background:'rgba(10,12,16,.94)', border:'1px solid rgba(232,234,239,.2)', color:'#e8eaef', padding:'7px 9px', font:'11px/1.4 Helvetica,Arial,sans-serif', opacity:0, transition:'opacity .12s', zIndex:3, maxWidth:'220px' });
    this.appendChild(this.tip);
    ensureLibs().then(topo => { this.topo = topo; this.ready = true; setTimeout(() => this.build(), 0); }).catch(e => { this.textContent = 'Map could not load: ' + e.message; });
    this.ro = new ResizeObserver(() => { if (this.ready) { clearTimeout(this._rt); this._rt = setTimeout(() => this.build(), 120); } }); this.ro.observe(this);
  }
  disconnectedCallback() { if (this.ro) this.ro.disconnect(); }
  set data(v) { const prev = this._d; this._d = v; if (!this.ready) return; if (!this.svg || !prev || prev.me !== v.me || (prev.mode === 'provinces') !== (v.mode === 'provinces')) this.build(); else {this.paint();if(v.mode==='provinces'&&prev.selectedProvince!==v.selectedProvince)this.focusProvince(v.selectedProvince);} }
  get data() { return this._d; }
  canon(n) { const ND = window.NationData; return ND && ND.canonical ? ND.canonical(n) : n; }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail, bubbles:true, composed:true })); }

  build() {
    const d3 = window.d3, topojson = window.topojson, D = this._d || {}, w = this.clientWidth, h = this.clientHeight;
    if (!w || !h) { clearTimeout(this._bt); this._bt = setTimeout(() => this.build(), 100); return; }
    if (this.svg) this.svg.remove();
    this.feats = topojson.feature(this.topo, this.topo.objects.countries).features.filter(f => f.properties.name !== 'Antarctica');
    this.feats.forEach(f => f.__n = this.canon(f.properties.name));
    const meF = this.feats.find(f => f.__n === D.me);
    const proj = d3.geoNaturalEarth1().fitExtent([[8, 8], [w - 8, h - 8]], { type:'Sphere' });
    this.proj = proj; const path = d3.geoPath(proj); this.path = path;
    const svg = d3.select(this).append('svg').attr('width', w).attr('height', h).style('display', 'block').style('cursor', 'grab');
    this.svg = svg;
    const defs = svg.append('defs');
    [['me', '#8fb8ff'], ['en', '#ff8a7a']].forEach(([k, c]) => { const p = defs.append('pattern').attr('id', 'nm-hatch-' + k).attr('patternUnits', 'userSpaceOnUse').attr('width', 4).attr('height', 4).attr('patternTransform', 'rotate(45)'); p.append('rect').attr('width', 4).attr('height', 4).attr('fill', c).attr('opacity', .25); p.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 4).attr('stroke', c).attr('stroke-width', 2.2); });
    const root = svg.append('g'); this.root = root;
    root.append('path').datum({ type:'Sphere' }).attr('d', path).attr('fill', '#0b1220');
    root.append('path').datum(d3.geoGraticule10()).attr('d', path).attr('fill', 'none').attr('stroke', 'rgba(120,160,215,.06)').attr('stroke-width', .5);
    this.cPaths = root.append('g').selectAll('path').data(this.feats).join('path').attr('d', path).attr('stroke', LINE).attr('stroke-width', .5).style('cursor', 'pointer')
      .on('pointermove', (ev, f) => this.hover(ev, f.__n, null)).on('pointerleave', () => this.tip.style.opacity = 0)
      .on('click', (ev, f) => { if (this._drag) return; const r = this.getBoundingClientRect(); this.emit('nationselect', { name:f.__n, x:ev.clientX - r.left, y:ev.clientY - r.top }); })
      .on('contextmenu', (ev, f) => { ev.preventDefault(); const r = this.getBoundingClientRect(); this.tip.style.opacity = 0; this.emit('nationmenu', { name:f.__n, x:ev.clientX - r.left, y:ev.clientY - r.top }); });
    this.provG = root.append('g'); this.fx = root.append('g'); this.pinG = root.append('g');
    this.zoom = d3.zoom().scaleExtent([1, 40]).on('start', () => { this._drag = false; svg.style('cursor', 'grabbing'); }).on('zoom', ev => { this._drag = true; this.k = ev.transform.k; root.attr('transform', ev.transform); this.rescale(); }).on('end', () => { svg.style('cursor', 'grab'); setTimeout(() => this._drag = false, 30); });
    svg.call(this.zoom).on('dblclick.zoom', null);
    this.k = 1;
    if (meF) {
      const [[x0, y0], [x1, y1]] = path.bounds(meF), prov = D.mode === 'provinces';
      const k = Math.min(prov ? 30 : 5, (prov ? 0.82 : 0.32) / Math.max((x1 - x0) / w, (y1 - y0) / h));
      const t = d3.zoomIdentity.translate(w / 2, h / 2).scale(Math.max(1, k)).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
      svg.call(this.zoom.transform, t);
    }
    this.provFeats = null; this.pPaths=null;this.provLbl=null;this.developmentG=null;this.warFeats = {};
    try { const geoms = this.topo.objects.countries.geometries, nb = window.topojson.neighbors(geoms), col = {}, order = geoms.map((_, i) => i).sort((a, b) => nb[b].length - nb[a].length);
      order.forEach(i => { const used = new Set(nb[i].map(j => col[j])); let c = Math.floor(H0(geoms[i].properties.name) * POLC.length); for (let t = 0; t < POLC.length && used.has(c); t++) c = (c + 1) % POLC.length; col[i] = c; });
      this.polCol = {}; geoms.forEach((gm, i) => this.polCol[this.canon(gm.properties.name)] = POLC[col[i]]); } catch (e) { this.polCol = {}; }
    if (D.mode === 'provinces' && ISO[D.me]) loadProvs(ISO[D.me]).then(gj => { if (this._d && this._d.me===D.me && this._d.mode === 'provinces') { this.provFeats = gj.features.map(f => this.rewind(f)); this.drawProvs(); this.paint(); } }).catch(() => { this.provErr = true; this.paint(); });
    if (D.me && ISO[D.me]) loadProvs(ISO[D.me]).then(gj => { if (this._sentProv === D.me) return; this._sentProv = D.me; const names = gj.features.map(f => ({ n:f.properties.shapeName, a:window.d3.geoArea(this.rewind(f)) })).sort((a, b) => b.a - a.a).map(x => x.n); this.emit('provinces', { country:D.me, names }); }).catch(() => {});
    if (D.mode === 'war' && D.enemy) this.loadWar();
    this.paint();
  }
  drawProvs() {
    const D = this._d, list = D.provs || [];
    this.provFeats.forEach((f, i) => { const nm = f.properties.shapeName; const n = norm(nm);
      let p = list.find(x => x.id===f.properties.provinceId) || list.find(x => norm(x.name) === n) || list.find(x => (x.aliases||[]).some(a=>norm(a)===n));
      f.__p = p || null; f.__name = nm; });
    this.provG.selectAll('*').remove();
    this.pPaths = this.provG.selectAll('path').data(this.provFeats).join('path').attr('d', this.path).attr('stroke', 'rgba(232,234,239,.5)').attr('stroke-width', .6).style('cursor', 'pointer')
      .on('pointermove', (ev, f) => this.hover(ev, null, f)).on('pointerleave', () => this.tip.style.opacity = 0)
      .on('click', (ev, f) => { if (!this._drag) this.emit('provselect', { id:f.__p?f.__p.id:null,name:f.__p ? f.__p.name : f.__name }); });
    this.provLbl = this.provG.append('g').selectAll('text').data(this.provFeats.filter(f => this.path.area(f) > 30)).join('text')
      .attr('transform', f => 'translate(' + this.path.centroid(f) + ')').attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,.85)')
      .style('font', '600 9px Helvetica,Arial,sans-serif').style('pointer-events', 'none').style('paint-order', 'stroke').attr('stroke', 'rgba(0,0,0,.6)').attr('stroke-width', 2.5).text(f => f.__name);
    this.rescale();
  }
  loadWar() {
    const D = this._d; [D.me, D.enemy].forEach(c => { if (!ISO[c] || this.warFeats[c]) return; loadProvs(ISO[c]).then(gj => { this.warFeats[c] = gj.features.map(f => this.rewind(f)); this.paint(); }).catch(() => {}); });
  }
  rewind(f) {
    const d3 = window.d3, g = f.geometry; if (!g) return f;
    const fixPoly = rings => rings.map(r => { const t = { type:'Polygon', coordinates:[r] }; return d3.geoArea(t) > 2 * Math.PI ? r.slice().reverse() : r; });
    if (g.type === 'Polygon') g.coordinates = fixPoly(g.coordinates);
    else if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map(fixPoly);
    return f;
  }
  provColor(f) {
    const D = this._d, p = f.__p; if (!p) return 'rgba(140,160,190,.25)';
    const m = D.provMetric || 'support';
    const v=m==='unrest'?100-p.unrest:m==='living'?p.living:m==='power'?p.energy*100:m==='industry'?Math.min(100,p.output/2.5):m==='construction'?(p.sites&&p.sites.length?Math.max(...p.sites.map(s=>s.progress)):p.newAssets?100:15):m==='food'?Math.max(0,100-(p.foodPrice-90)):p.support;
    return v >= 60 ? 'oklch(0.64 0.15 150 / .85)' : v >= 45 ? 'oklch(0.72 0.12 120 / .7)' : v >= 32 ? 'oklch(0.76 0.13 80 / .75)' : 'oklch(0.6 0.19 28 / .85)';
  }
  fill(n) {
    const D = this._d || {}, mode = D.mode || 'political', rel = D.rel || {};
    if (!n) return mode === 'provinces' ? '#141a23' : LAND;
    if (n && n === D.me) return mode === 'provinces' ? 'rgba(80,100,130,.35)' : ME;
    if (D.selecting) return (D.playableColors || {})[n] || '#1a2939';
    if (mode === 'provinces') return '#141a23';
    if (mode === 'political') return this.polCol && this.polCol[n] || LAND;
    if (mode === 'war') { if (n === D.enemy) return 'oklch(0.58 0.2 25 / .85)'; return (D.wars || []).includes(n) ? 'oklch(0.6 0.16 35 / .45)' : LAND; }
    if (mode === 'alliances') { const b = (D.blocs || {})[n]; return b ? BLOC_C[b] : LAND; }
    if (mode === 'sanctions') { if ((D.sanctions || []).includes(n)) return 'oklch(0.58 0.18 25 / .7)'; if ((D.sanctionedBy || []).includes(n)) return 'oklch(0.72 0.14 60 / .6)'; return LAND; }
    if (mode === 'trade') { const t = (D.trade || []).find(x => x.to === n); return t ? 'oklch(0.72 0.13 200 / ' + Math.min(.85, .25 + t.share * 2).toFixed(2) + ')' : LAND; }
    return rel[n] != null ? relC(rel[n]) : LAND; // relations
  }
  centroidOf(n) { const f = this.feats && this.feats.find(x => x.__n === n); return f ? this.path.centroid(f) : null; }
  syncProvinceData(){const list=this._d&&this._d.provs||[];for(const f of this.provFeats||[])f.__p=list.find(p=>p.id===f.properties.provinceId)||list.find(p=>norm(p.name)===norm(f.__name))||null;}
  paint() {
    if (!this.cPaths) return;
    const d3 = window.d3, D = this._d || {}, mode = D.mode || 'political';
    this.cPaths.attr('fill', f => this.fill(f.__n)).attr('stroke', f => f.__n && f.__n === D.me ? '#ffffff' : LINE).attr('stroke-width', f => (f.__n && f.__n === D.me ? 1.6 : .7) / (this.k || 1));
    if (this.pPaths) {
      // Every state update replaces province objects. Rebind by stable ID so
      // the map never keeps painting obsolete economic/support snapshots.
      this.syncProvinceData();
      this.provG.style('display', mode === 'provinces' ? null : 'none');
      this.pPaths.attr('fill', f => this.provColor(f)).attr('stroke',f=>f.__p&&f.__p.id===D.selectedProvince?'#ffe4a3':'rgba(232,234,239,.5)');
      this.drawDevelopment();
    }
    this.fx.selectAll('*').remove();
    const me = this.centroidOf(D.me);
    if (mode === 'trade' && me) (D.trade || []).forEach(t => { const p = this.centroidOf(t.to); if (!p) return;
      const mx = (me[0] + p[0]) / 2, my = (me[1] + p[1]) / 2 - Math.hypot(p[0] - me[0], p[1] - me[1]) * .25;
      this.fx.append('path').attr('d', 'M' + me + 'Q' + mx + ',' + my + ' ' + p).attr('fill', 'none').attr('stroke', 'oklch(0.8 0.12 200)').attr('stroke-opacity', .8).attr('class', 'nm-scale')
        .attr('data-w', 1 + t.share * 10).attr('data-dash', 1).style('animation', 'nmflow 1.2s linear infinite'); });
    if (mode === 'war' && D.enemy && this.topo) {
      const meN = D.me, en = D.enemy, nm = o => this.canon(o.properties.name);
      const mesh = window.topojson.mesh(this.topo, this.topo.objects.countries, (a, b) => (nm(a) === meN && nm(b) === en) || (nm(a) === en && nm(b) === meN));
      if (mesh && mesh.coordinates && mesh.coordinates.length) {
        this.fx.append('path').datum(mesh).attr('d', this.path).attr('fill', 'none').attr('stroke', 'oklch(0.65 0.22 28)').attr('class', 'nm-scale').attr('data-w', 4).style('animation', 'nmpulse 1.6s ease-in-out infinite');
        this.fx.append('path').datum(mesh).attr('d', this.path).attr('fill', 'none').attr('stroke', '#ffd2c2').attr('class', 'nm-scale').attr('data-w', 1).attr('stroke-dasharray', '3 4');
      } else { const p = this.centroidOf(en); if (me && p) this.fx.append('path').attr('d', 'M' + me + 'L' + p).attr('stroke', 'oklch(0.65 0.22 28)').attr('class', 'nm-scale').attr('data-w', 2).attr('stroke-dasharray', '8 5').attr('fill', 'none').style('animation', 'nmflow 1s linear infinite'); }
      const front = typeof D.front === 'number' ? D.front : 0;
      const ep = this.centroidOf(en); if (me && ep) { const t = .5 + front / 220, x = me[0] + (ep[0] - me[0]) * t, y = me[1] + (ep[1] - me[1]) * t;
        this.fx.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('class', 'nm-txt').attr('data-s', 11).attr('fill', '#ffd2c2').style('font-weight', 700).style('paint-order', 'stroke').attr('stroke', 'rgba(0,0,0,.7)').attr('stroke-width', 3).text('⚔ FRONT'); }
    }
    if (mode === 'war' && D.enemy) {
      if (!this.warFeats[D.me] || !this.warFeats[D.enemy]) this.loadWar();
      const draw = (c, n, occCol, fromC) => { const fs = this.warFeats[c]; if (!fs) return; const o = this.centroidOf(fromC) || [0, 0];
        const sorted = fs.map(f => ({ f, d:Math.hypot(this.path.centroid(f)[0] - o[0], this.path.centroid(f)[1] - o[1]) })).sort((a, b) => a.d - b.d);
        sorted.forEach((x, i) => { const occ = i < n; this.fx.append('path').datum(x.f).attr('d', this.path).attr('fill', occ ? 'url(#nm-hatch-' + (occCol === 'me' ? 'me' : 'en') + ')' : 'none').attr('stroke', 'rgba(0,0,0,.55)').attr('class', 'nm-scale').attr('data-w', .5)
          .on('pointermove', ev => this.hover(ev, null, null, '<b>' + x.f.properties.shapeName + '</b><br>' + c + (occ ? '<br>Occupied by ' + (occCol === 'me' ? D.me : D.enemy) : ''))).on('pointerleave', () => this.tip.style.opacity = 0); }); };
      draw(D.enemy, (D.occ && D.occ.held) || 0, 'me', D.me); draw(D.me, (D.occ && D.occ.lost) || 0, 'en', D.enemy);
    }
    this.pinG.selectAll('*').remove();
    (D.pins || []).forEach((pn, i) => {
      let p = null;
      if (pn.prov && this.provFeats) { const f = this.provFeats.find(x => x.__p && x.__p.name === pn.prov); if (f) p = this.path.centroid(f); }
      if (!p) { const c = this.centroidOf(pn.country || D.me); if (!c) return; const a = i * 2.39996, r = pn.country && pn.country !== D.me ? 0 : 7 + (i % 3) * 5; p = [c[0] + Math.cos(a) * r / (this.k || 1), c[1] + Math.sin(a) * r / (this.k || 1)]; }
      const col = pn.tone === 'opp' ? 'oklch(0.78 0.15 150)' : pn.tone === 'war' ? 'oklch(0.66 0.22 28)' : pn.tone === 'world' ? 'oklch(0.8 0.12 250)' : 'oklch(0.78 0.15 70)';
      const gp = this.pinG.append('g').attr('class', 'nm-pin').attr('data-x', p[0]).attr('data-y', p[1]).style('cursor', 'pointer')
        .on('pointermove', ev => this.hover(ev, null, null, pn.label)).on('pointerleave', () => this.tip.style.opacity = 0)
        .on('click', ev => { ev.stopPropagation(); this.emit('pinselect', { id:pn.id }); });
      if (!pn.done) gp.append('circle').attr('r', 9).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 2).style('transform-box', 'fill-box').style('transform-origin', 'center').style('animation', 'nmring 1.8s ease-out infinite');
      gp.append('circle').attr('r', 7).attr('fill', pn.done ? 'rgba(20,24,30,.9)' : col).attr('stroke', '#0a0c10').attr('stroke-width', 1.5);
      gp.append('text').attr('text-anchor', 'middle').attr('dy', 3.5).attr('fill', pn.done ? col : '#0a0c10').style('font', '700 9px Helvetica,Arial').text(pn.glyph || '!');
    });
    this.rescale();
  }
  drawDevelopment(){
    if(this.developmentG)this.developmentG.remove();
    this.developmentG=this.provG.append('g');
    for(const f of this.provFeats||[]){
      const p=f.__p;if(!p)continue;
      const sites=p.sites||[],opened=p.newAssets||0;
      if(!sites.length&&!opened)continue;
      const xy=this.path.centroid(f);if(!xy.every(Number.isFinite))continue;
      const gp=this.developmentG.append('g').attr('class','nm-development').attr('data-x',xy[0]).attr('data-y',xy[1]).style('cursor','pointer').on('click',ev=>{ev.stopPropagation();this.emit('provselect',{id:p.id,name:p.name});});
      const progress=sites.length?Math.max(...sites.map(s=>s.progress)):100,col=sites.length?'#f1c66d':'#78e6b5';
      gp.append('rect').attr('x',-31).attr('y',-15).attr('width',62).attr('height',28).attr('rx',4).attr('fill','#0b1928').attr('stroke',col).attr('stroke-width',1.5);
      gp.append('text').attr('text-anchor','middle').attr('y',-1).attr('fill',col).style('font','700 10px Segoe UI,Arial').text(sites.length?sites[0].short+' '+Math.round(progress)+'%':'CAPACITY +'+opened);
      gp.append('rect').attr('x',-25).attr('y',5).attr('width',50).attr('height',3).attr('fill','#334556');
      gp.append('rect').attr('x',-25).attr('y',5).attr('width',progress/2).attr('height',3).attr('fill',col);
    }
  }
  rescale() {
    const k = this.k || 1;
    if (this.fx) this.fx.selectAll('.nm-scale').attr('stroke-width', function () { return (+this.getAttribute('data-w')) / k; });
    if (this.fx) this.fx.selectAll('[data-dash]').attr('stroke-dasharray', (6 / k) + ' ' + (6 / k)).style('stroke-dashoffset', 0);
    if (this.fx) this.fx.selectAll('.nm-txt').style('font-size', function () { return (+this.getAttribute('data-s')) / k + 'px'; }).attr('stroke-width', 3 / k);
    if (this.pinG) this.pinG.selectAll('.nm-pin').attr('transform', function () { return 'translate(' + this.getAttribute('data-x') + ',' + this.getAttribute('data-y') + ') scale(' + 1 / k + ')'; });
    if (this.provLbl) this.provLbl.style('font-size', (9 / k) + 'px').attr('stroke-width', 2.5 / k);
    if (this.pPaths) this.pPaths.attr('stroke-width', f => (f.__p&&f.__p.id===this._d.selectedProvince?2.8:.7) / k);
    if(this.developmentG)this.developmentG.selectAll('.nm-development').attr('transform',function(){return 'translate('+this.getAttribute('data-x')+','+this.getAttribute('data-y')+') scale('+1/k+')';});
    if (this.cPaths && this._d) this.cPaths.attr('stroke-width', f => (f.__n && f.__n === this._d.me ? 1.6 : .7) / k);
  }
  hover(ev, n, pf, label) {
    const D = this._d || {}, r = this.getBoundingClientRect(); let html = '';
    if (label) html = label;
    else if (pf) { const p = pf.__p; html = '<b>' + pf.__name + '</b>' + (p ? '<br>Support ' + Math.round(p.support) + ' · Unrest ' + Math.round(p.unrest)+(p.living!=null?'<br>Living standards '+p.living+'/100<br>Power '+Math.round(p.energy*100)+'% · Freight '+Math.round(p.freight*100)+'%<br>Food index '+p.foodPrice+' · '+p.bottleneck:'')+(p.sites&&p.sites.length?'<br>'+p.sites.map(s=>s.label+' '+Math.round(s.progress)+'%').join('<br>'):'') : ''); }
    else if (n) { const mode = D.mode; html = '<b>' + n + '</b>';
      if (n === D.me) html += '<br>Your country';
      else if (mode === 'political') html += (D.rel && D.rel[n] != null ? '<br>Relations ' + Math.round(D.rel[n]) + '/100' : '');
      else if (mode === 'alliances') html += '<br>' + (((D.blocList || {})[n]) || 'No major bloc');
      else if (mode === 'trade') { const t = (D.trade || []).find(x => x.to === n); html += t ? '<br>Trade $' + t.v + 'bn · ' + Math.round(t.share * 100) + '% of total' : '<br>Minor trade partner'; }
      else if (mode === 'sanctions') html += (D.sanctions || []).includes(n) ? '<br>Under Western sanctions' : (D.sanctionedBy || []).includes(n) ? '<br>Sanctioning you' : '';
      else if (D.rel && D.rel[n] != null) html += '<br>Relations ' + Math.round(D.rel[n]) + '/100';
      if (mode !== 'provinces') html += '<br><span style="color:rgba(232,234,239,.55)">Click: status · Right-click: actions</span>';
    }
    this.tip.innerHTML = html; this.tip.style.opacity = 1;
    const x = ev.clientX - r.left + 12, y = ev.clientY - r.top + 12;
    this.tip.style.left = Math.min(x, r.width - 230) + 'px'; this.tip.style.top = Math.min(y, r.height - 60) + 'px';
  }
  zoomBy(f) { if (this.svg) this.svg.transition().duration(250).call(this.zoom.scaleBy, f); }
  focusProvince(id){
    const f=(this.provFeats||[]).find(f=>f.__p&&f.__p.id===id);if(!f||!this.svg)return;
    const [[x0,y0],[x1,y1]]=this.path.bounds(f),w=this.clientWidth,h=this.clientHeight;
    const k=Math.min(35,0.65/Math.max((x1-x0)/w,(y1-y0)/h));
    if(!Number.isFinite(k)||k<=0)return;
    const t=window.d3.zoomIdentity.translate(w/2,h/2).scale(Math.max(1,k)).translate(-(x0+x1)/2,-(y0+y1)/2);
    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.svg.transition().duration(reduced?0:350).call(this.zoom.transform,t);
  }
  recenter() { this.build(); }
}
customElements.define('nation-map', NationMap);
})();
