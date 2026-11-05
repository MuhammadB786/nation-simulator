const test=require('node:test');
const assert=require('node:assert/strict');
const {load,loadUI}=require('./helpers.cjs');
const plain=x=>JSON.parse(JSON.stringify(x));
const roster=['Pakistan','Germany','United States','China','Saudi Arabia','Brazil'];

test('six authored campaigns replace the selector, not the wider world',()=>{
  const b=load();assert.deepEqual(Array.from(b.NSG.nations(),x=>x.name).sort(),[...roster].sort());
  assert.ok(b.NationData.NATIONS.length>150);
  const fingerprints=new Set();
  for(const name of roster){const g=b.fresh(name),p=b.NSCampaign.PROFILES[name];assert.ok(g.campaign);assert.equal(g.campaign.mandates.length,3);assert.equal(p.actions.length,3);assert.equal(p.projects.length,2);fingerprints.add(Object.keys(g.campaign.meters).join());assert.ok(g.campaign.world.actors.every(a=>a.id!==name));}
  assert.equal(fingerprints.size,6);
  assert.equal(b.fresh('China').demo,false);assert.equal(b.fresh('Saudi Arabia').demo,false);
});

test('signature actions change unique mechanics, consume attention and cannot repeat',()=>{
  const b=load();
  for(const name of roster){const g=b.fresh(name),p=b.NSCampaign.PROFILES[name],a=p.actions[0];const r=b.NSCampaign.act(g,a.id);assert.equal(r.g.ap,g.ap-1);for(const [k,v]of Object.entries(a.meters))assert.equal(r.g.campaign.meters[k],g.campaign.meters[k]+v);const repeat=b.NSCampaign.act(r.g,a.id);assert.ok(repeat.error);assert.equal(repeat.g.ap,r.g.ap);assert.equal(g.campaign.commitments.length,0);assert.equal(r.g.campaign.commitments.length,1);}
});

test('authored political dilemmas enter the real decision-card pipeline',()=>{
  const b=load();
  for(const name of roster){let g=b.NSG.endMonth(b.fresh(name)).g;const ix=g.cur.cards.findIndex(x=>x.data&&x.data.opts.some(o=>o.campaignMeters));assert.ok(ix>=0,name);const before=plain(g.campaign.meters);const chosen=b.NSG.chooseEvent(g,ix,0);assert.ok(chosen.rid,name);assert.notDeepEqual(plain(chosen.g.campaign.meters),before,name);}
});

test('projects require funding, progress over time and apply benefits once',()=>{
  const b=load();
  for(const name of roster){let g=b.fresh(name);const p=b.NSCampaign.PROFILES[name].projects[0];const before=g.s.pdef;g=b.NSCampaign.projectAct(g,p.id,'fund').g;assert.equal(g.ap,2);assert.equal(g.s.pdef,Math.round((before+p.cost)*100)/100);assert.ok(b.NSCampaign.projectAct(g,p.id,'fund').error);assert.equal(g.campaign.projects[0].progress,0);for(let m=1;m<=20&&!g.campaign.projects[0].completed;m++){g.month=m;b.NSCampaign.step(g,[]);}assert.ok(g.campaign.projects[0].completed,name);const mods=plain(g.mods);for(let i=0;i<3;i++){g.month++;b.NSCampaign.step(g,[]);}assert.deepEqual(plain(g.mods),mods,name);assert.ok(b.NSCampaign.projectAct(g,p.id,'expedite').error);}
});

test('procurement interventions trade speed against exposure and respect attention',()=>{
  const b=load();let g=b.NSCampaign.projectAct(b.fresh(),'grid','fund').g;
  const base=g.campaign.projects[0];g=b.NSCampaign.projectAct(g,'grid','expedite').g;
  assert.ok(g.campaign.projects[0].progress>base.progress);assert.ok(g.campaign.projects[0].risk>base.risk);
  assert.ok(b.NSCampaign.projectAct(g,'grid','audit').error);
  g.month++;g.ap=1;const r=b.NSCampaign.projectAct(g,'grid','audit');assert.equal(r.g.ap,0);assert.ok(r.g.campaign.projects[0].risk<g.campaign.projects[0].risk);
});

test('foreign actors maneuver between themselves without player action',()=>{
  const b=load();let g=b.fresh('Germany');
  for(let m=1;m<=8;m++){g.month=m;b.NSCampaign.step(g,[]);}
  assert.ok(g.campaign.world.history.length>5);
  assert.ok(g.campaign.world.history.some(x=>x.actor!==g.nation&&x.target!==g.nation));
  assert.ok(g.campaign.world.actors.some(a=>a.moves>1));
  assert.ok(Object.keys(g.campaign.world.relations).length>2);
  assert.ok(g.campaign.world.history.some(x=>['Bond markets','Shipping consortium','Climate coalition'].includes(x.actor)));
});

test('foreign agendas persist across save/load and seeds change the timeline',()=>{
  const a=load(0.11),b=load(0.83);let g=a.fresh('Brazil'),other=b.fresh('Brazil');
  for(let m=1;m<=4;m++){g.month=m;a.NSCampaign.step(g,[]);other.month=m;b.NSCampaign.step(other,[]);}
  assert.notDeepEqual(plain(g.campaign.world.history),plain(other.campaign.world.history));
  const saved=plain(g);a.NSCampaign.init(saved);assert.deepEqual(saved,plain(g));
});

test('offers have real terms, use attention once and expire when ignored',()=>{
  const b=load(),g=b.fresh();const id=g.campaign.offers[0].id;
  const r=b.NSCampaign.respond(g,id,'accept');assert.equal(r.g.ap,g.ap-1);assert.equal(r.g.s.debt,g.s.debt+1);assert.equal(r.g.s.reserves,Math.round((g.s.reserves+0.4)*100)/100);assert.ok(b.NSCampaign.respond(r.g,id,'accept').error);
  const expired=plain(g);expired.month=4;b.NSCampaign.step(expired,[]);assert.equal(expired.campaign.offers.find(o=>o.id===id).status,'expired');assert.ok(b.NSCampaign.respond(expired,id,'accept').error);
});

test('AI world developments use validated actors and bounded mechanical categories',()=>{
  const b=load(),g=b.fresh();const raw={moves:[{actor:'Germany',target:'Brazil',type:'trade',title:'Trade talks open',detail:'Industrial exporters seek access in exchange for procurement concessions.'},{actor:'Imaginary empire',target:'Pakistan',type:'destroy',title:'Invalid',detail:'Must not be accepted.'}]};
  let staged=b.NSCampaign.stageDirector(g,raw);assert.equal(staged.campaign.director.moves.length,1);b.NSCampaign.step(staged,[]);assert.ok(staged.campaign.world.history.some(x=>x.source==='AI Game Master'&&x.t==='Trade talks open'));assert.ok(!staged.campaign.director);assert.equal(g.campaign.world.history.length,0);
});

test('US midterms alter actual chamber seats and execute only once',()=>{
  const b=load(),g=b.fresh('United States');g.month=24;g.s.approval=30;
  const gov=g.p9.parties.find(p=>p.role==='gov');const before=g.p9.chambers[0].seats[gov.short];const total=Object.values(g.p9.chambers[0].seats).reduce((a,b)=>a+b,0);
  b.NSCampaign.step(g,[]);assert.ok(g.p9.chambers[0].seats[gov.short]<before);assert.equal(Object.values(g.p9.chambers[0].seats).reduce((a,b)=>a+b,0),total);
  const after=g.p9.chambers[0].seats[gov.short];b.NSCampaign.step(g,[]);assert.equal(g.p9.chambers[0].seats[gov.short],after);
});

test('selected promises are tracked and affect the final campaign verdict',()=>{
  const b=load();let g=b.NSG.newGame('Pakistan',{name:'Test',mandates:['credit','reserve','delivery']});g.id='mandate-test';
  assert.deepEqual(Array.from(b.NSCampaign.mandates(g),x=>x.id),['credit','reserve','delivery']);
  g.campaign.meters.credibility=90;g.s.reserves=6;g.month=48;g.demo=false;
  const r=b.NSG.endMonth(g);assert.ok(r.g.final.promises.length===3);assert.equal(r.g.final.mandateBonus,r.g.final.promises.filter(x=>x.done).length*5);
});

test('UI exposes all six identities, goals, actions, projects and world agendas',()=>{
  const b=load(),ui=loadUI(b);ui.state.ready=true;
  assert.equal(ui.pickVals().nationList.length,6);
  for(const name of roster){const g=b.fresh(name),view=ui.campaignVals(g);assert.ok(view.hasCampaign);assert.equal(view.campaignMeters.length,2);assert.equal(view.campaignMandates.length,3);assert.equal(view.campaignActions.length,3);assert.equal(view.campaignProjects.length,2);assert.ok(view.campaignActors.length>=10);}
});

test('end month invokes the AI world director and commits its moves atomically',async()=>{
  const b=load(),ui=loadUI(b);ui.state.g=b.fresh();ui.state.g.ai=true;ui.save=()=>{};ui.toast=()=>{};
  b.claude={complete:async()=>JSON.stringify({moves:[{actor:'Germany',target:'Brazil',type:'trade',title:'Negotiators seek a procurement opening',detail:'Industrial and regional blocs compete over the terms.'}]})};
  await ui.endMonth();assert.equal(ui.state.g.month,2);assert.equal(ui.state.screen,'report');assert.ok(ui.state.g.campaign.world.history.some(x=>x.source==='AI Game Master'));assert.equal(ui._ending,false);
});

test('AI world outage falls back to autonomous moves without blocking the turn',async()=>{
  const b=load(),ui=loadUI(b);ui.state.g=b.fresh();ui.state.g.ai=true;ui.save=()=>{};ui.toast=()=>{};
  b.console={...console,warn:()=>{}};
  b.claude={complete:async()=>{throw new Error('Mock outage');}};
  await ui.endMonth();assert.equal(ui.state.g.month,2);assert.equal(ui._ending,false);assert.ok(Object.values(ui.state.pend).every(v=>!v));
});

test('full UI descriptors render each campaign without missing mechanics',()=>{
  const b=load(),ui=loadUI(b);ui.state.ready=true;ui.state.screen='game';ui.save=()=>{};
  for(const name of roster){ui.state.g=b.fresh(name);const view=ui.renderVals();assert.equal(view.campaignNation,name);assert.ok(view.endMonth);assert.ok(view.campaignDeadline);assert.ok(view.mapModes.length);}
});

test('late world-director results cannot overwrite a newly loaded career',async()=>{
  const b=load(),ui=loadUI(b);ui.state.g=b.fresh();ui.state.g.ai=true;ui.save=()=>{};ui.toast=()=>{};let resolve;
  b.claude={complete:()=>new Promise(r=>{resolve=r;})};
  const task=ui.endMonth();const other=b.fresh('Germany');ui.state.g=other;
  resolve(JSON.stringify({moves:[]}));await task;
  assert.equal(ui.state.g.id,other.id);assert.equal(ui.state.g.month,1);assert.equal(ui._ending,false);
});
