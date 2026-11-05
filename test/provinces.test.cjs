const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {load,loadUI,root}=require('./helpers.cjs');
const plain=x=>JSON.parse(JSON.stringify(x));
const roster=['Pakistan','Germany','United States','China','Saudi Arabia','Brazil'];

test('every administered province has a unique persistent identity and economy',()=>{
  const b=load();let count=0;
  for(const name of roster){const g=b.fresh(name),data=b.NSProvinceData[name];assert.equal(g.provs.length,data.provinces.length);assert.equal(new Set(g.provs.map(p=>p.id)).size,g.provs.length);assert.ok(Math.abs(g.provs.reduce((s,p)=>s+p.share,0)-1)<1e-9);for(const p of g.provs){assert.ok(p.economy&&p.economy.households.length===3);assert.ok(Number.isFinite(p.economy.output));assert.ok(p.pop>0);}count+=g.provs.length;}
  assert.equal(count,152);
});

test('bundled geometry and the economic roster agree without fetching borders',()=>{
  const b=load();vm.runInContext(fs.readFileSync(path.join(root,'province-geography.js'),'utf8'),b);
  for(const name of roster){const geo=b.NSProvinceGeography[name],g=b.fresh(name);const ids=geo.features.filter(f=>f.properties.controlled!==false).map(f=>f.properties.provinceId);assert.deepEqual([...ids].sort(),Array.from(g.provs,p=>p.id).sort());assert.ok(geo.source.license);}
});

test('legacy six-region saves migrate once and retain matching local political state',()=>{
  const b=load(),g=b.fresh();delete g.development;g.provs=[{name:'Punjab',support:27,unrest:71,gov:'Saved governor'}];
  b.NSProvinces.init(g);const p=g.provs.find(x=>x.name==='Punjab');assert.equal(p.support,27);assert.equal(p.unrest,71);assert.equal(p.gov,'Saved governor');const saved=plain(g);b.NSProvinces.init(g);assert.deepEqual(plain(g),saved);
});

test('funding a building creates a visible site, spends attention and reserves a crew',()=>{
  const b=load(),g=b.fresh(),p=g.provs[0],quote=b.NSProvinces.quote(g,p.id,'power');
  const r=b.NSProvinces.build(g,p.id,'power');assert.equal(r.g.ap,g.ap-1);assert.equal(r.g.s.pdef,Math.round((g.s.pdef+quote)*100)/100);assert.equal(r.g.development.queue[0].provinceId,p.id);assert.equal(r.g.development.queue[0].progress,2);assert.equal(b.NSProvinces.slots(r.g),1);assert.equal(g.development.queue.length,0);
  const ui=loadUI(b);ui.state.g=r.g;ui.state.screen='game';ui.state.ready=true;ui.state.mapMode='provinces';assert.ok(ui.mapData().provs.find(x=>x.id===p.id).sites.length===1);assert.equal(ui.developmentVals(r.g).devSites.length,1);
});

test('construction capacity is shared between provincial and national projects',()=>{
  const b=load();let g=b.fresh();const id=g.provs[0].id;
  g=b.NSProvinces.build(g,id,'power').g;g=b.NSCampaign.projectAct(g,'exports','fund',id).g;
  assert.equal(b.NSProvinces.slots(g),2);assert.ok(b.NSProvinces.build(g,id,'housing').error);assert.ok(b.NSCampaign.projectAct(g,'grid','fund',id).error);
});

test('power completion visibly raises local capacity and industrial output exactly once',()=>{
  const b=load();let g=b.fresh();const id=g.provs[0].id,level=g.provs[0].economy.buildings.power,output=g.provs[0].economy.output;
  g=b.NSProvinces.build(g,id,'power').g;g.development.queue[0].progress=99.9;b.NSProvinces.step(g,[]);
  const p=g.provs.find(x=>x.id===id);assert.equal(p.economy.buildings.power,level+1);assert.ok(p.economy.output>output);assert.ok(g.development.changes.some(x=>x.kind==='completed'&&x.provinceId===id));
  const mods=plain(g.mods);g.month++;b.NSProvinces.step(g,[]);assert.equal(p.economy.buildings.power,level+1);assert.deepEqual(plain(g.mods),mods);
});

test('industrial expansion consumes electricity and creates housing pressure',()=>{
  const b=load(),g=b.fresh(),p=g.provs[0],before=plain(p.economy);
  p.economy.buildings.industry+=2;b.NSProvinces.solve(g,false);
  assert.ok(p.economy.energy<before.energy);assert.ok(p.economy.rent>before.rent);assert.ok(p.economy.energyDemand>before.energyDemand);
  const rent=p.economy.rent;p.economy.buildings.housing++;b.NSProvinces.solve(g,false);assert.ok(p.economy.rent<rent);
});

test('a local household compact ends a stoppage and has a real fiscal cost',()=>{
  const b=load(),g=b.fresh(),p=g.provs[0];p.economy.strikeUntil=5;p.economy.pressure=90;b.NSProvinces.solve(g,false);const output=p.economy.output;
  const r=b.NSProvinces.compact(g,p.id),after=r.g.provs.find(x=>x.id===p.id);assert.equal(after.economy.strikeUntil,0);assert.ok(after.economy.output>output);assert.equal(r.g.ap,g.ap-1);assert.equal(r.g.s.pdef,Math.round((g.s.pdef+0.08)*100)/100);assert.ok(b.NSProvinces.compact(r.g,p.id).error);
});

test('permits and imported inputs offer costly ways through construction bottlenecks',()=>{
  const b=load();let g=b.fresh(),id=g.provs[0].id;g.provs[0].support=20;g=b.NSProvinces.build(g,id,'power').g;
  const stalled=plain(g);b.NSProvinces.step(stalled,[]);
  const agreement=b.NSProvinces.intervene(g,g.development.queue[0].id,'permit');b.NSProvinces.step(agreement.g,[]);assert.ok(agreement.g.development.queue[0].progress>stalled.development.queue[0].progress);
  g.month++;g.ap=1;const imported=b.NSProvinces.intervene(g,g.development.queue[0].id,'import');assert.equal(imported.g.s.debt,Math.round((g.s.debt+0.25)*100)/100);assert.ok(imported.g.development.queue[0].progress>g.development.queue[0].progress);
});

test('national projects improve the province actually selected for construction',()=>{
  const b=load();let g=b.fresh();const id=g.provs[1].id,before=g.provs[1].economy.buildings.power,other=g.provs[0].economy.buildings.power;
  g=b.NSCampaign.projectAct(g,'grid','fund',id).g;g.campaign.projects[0].progress=99.99;b.NSCampaign.step(g,[]);
  assert.equal(g.provs.find(x=>x.id===id).economy.buildings.power,before+1);assert.equal(g.provs[0].economy.buildings.power,other);
});

test('foreign competition creates a factory site at home or a visible development abroad',()=>{
  const b=load();let g=b.fresh(),p=g.provs[0];p.economy.buildings.power=5;p.economy.buildings.logistics=4;b.NSProvinces.solve(g,false);
  g=b.NSProvinces.bid(g,p.id).g;g.development.competition.rivalScore=0;g.development.competition.deadline=g.month;b.NSProvinces.step(g,[]);
  assert.equal(g.development.competition.status,'won');assert.ok(g.development.queue.some(x=>x.private&&x.provinceId===p.id));
  const lost=b.fresh();lost.development.competition.deadline=lost.month;b.NSProvinces.step(lost,[]);assert.equal(lost.development.competition.status,'lost');assert.equal(lost.development.worldBuilds.length,1);
});

test('turn reports identify concrete development changes and preserve new-state snapshots',()=>{
  const b=load();let g=b.fresh();g=b.NSProvinces.build(g,g.provs[0].id,'power').g;g.development.queue[0].progress=99.99;const result=b.NSG.endMonth(g);
  assert.ok(result.report.development.some(x=>x.kind==='completed'));assert.deepEqual(plain(result.g.s),plain(result.g.cur.s0));
});

test('the map refreshes province object bindings rather than painting old state',()=>{
  const b=load();let MapClass;b.HTMLElement=class{};b.customElements={get:()=>null,define:(name,klass)=>{MapClass=klass;}};
  vm.runInContext(fs.readFileSync(path.join(root,'nation-map.js'),'utf8'),b);
  const map=new MapClass(),feature={properties:{provinceId:'p-1'},__name:'Test province'};map.provFeats=[feature];
  map.data={mode:'provinces',provMetric:'power',provs:[{id:'p-1',name:'Test province',energy:0.3}]};map.syncProvinceData();const low=map.provColor(feature),old=feature.__p;
  map.data={mode:'provinces',provMetric:'power',provs:[{id:'p-1',name:'Test province',energy:1}]};map.syncProvinceData();assert.notEqual(feature.__p,old);assert.notEqual(map.provColor(feature),low);assert.equal(feature.__p.energy,1);
});

test('rival investments continue building abroad after the player loses a bid',()=>{
  const b=load(),g=b.fresh();g.development.competition.deadline=1;b.NSProvinces.step(g,[]);
  const rival=g.development.worldBuilds[0];assert.equal(rival.progress,0);
  for(let i=0;i<5;i++){g.month++;b.NSProvinces.step(g,[]);}
  assert.equal(rival.progress,100);assert.equal(rival.stage,'Operating');assert.ok(g.development.changes.some(x=>x.kind==='foreign-completed'));
});
