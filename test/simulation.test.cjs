const test = require('node:test');
const assert = require('node:assert/strict');
const {load,loadUI} = require('./helpers.cjs');
const plain = value => JSON.parse(JSON.stringify(value));
const policy = {
  summary:'Improve tax collection to fund a small jobs scheme, with businesses bearing compliance costs.',
  effects:{deficit:0.2,approval:1}, mods:{unemp:-0.1}, groups:{business:-4,labour:4},
  risks:['Businesses may oppose the additional reporting requirements.']
};

test('all selectable countries resolve a month with matching next-turn snapshots', () => {
  const b = load();
  for (const n of b.NSG.nations()) {
    const {g, report} = b.NSG.endMonth(b.fresh(n.name));
    assert.equal(report.month, 1, n.name);
    assert.equal(g.month, 2, n.name);
    assert.deepEqual(plain(g.cur.s0), plain(g.s), n.name);
    for (const v of Object.values(g.s)) assert.ok(Number.isFinite(v), n.name);
    assert.equal(g.p9.hist.m.at(-1), 1, 'history records resolved month');
  }
});

test('economic changes are captured before the report and next-turn baseline', () => {
  const b = load(), g = b.fresh();
  g.p9.cb.rate = 30;
  const r = b.NSG.endMonth(g);
  assert.deepEqual(plain(r.g.cur.s0), plain(r.g.s));
  assert.equal(r.g.p9.hist.inf.at(-1), r.g.s.inflation);
  assert.notEqual(g.s.inflation, r.g.s.inflation);
});

test('democratic agenda actions introduce a bill instead of bypassing votes', () => {
  const b = load(), g = b.fresh();
  const next = b.NSG.enact(g,'ag_vat');
  assert.equal(next.laws.length,0);
  assert.equal(next.p9.bills[0].ref,'ag_vat');
  assert.equal(next.ap,g.ap-1);
  const duplicate = b.NSG.enact(next,'ag_vat');
  assert.equal(duplicate.p9.bills.length,1);
  assert.equal(duplicate.ap,next.ap);
});

test('a bill applies effects once on assent and keeps its persistent modifiers', () => {
  const b = load();
  let g = b.NS9.introduce(b.fresh(),'custom',{text:'Fund a jobs and tax administration programme',policy}).g;
  g.p9.bills[0].stage=4;
  g.p9.bills[0].since=0;
  const r=b.NSG.endMonth(g);
  g=r.g;
  assert.equal(g.laws.filter(x=>x.id==='b1').length,1);
  assert.equal(Number((g.mods.unemp-(g.development?.appliedMods.unemp||0)).toFixed(2)),-0.1);
  assert.ok(r.report.results.some(x=>x.rid==='bill-b1'&&x.dlt));
  assert.deepEqual(plain(g.cur.s0),plain(g.s));
  g=b.NSG.endMonth(g).g;
  // The law must persist once while provincial employment can independently
  // improve or deteriorate as transport and construction conditions change.
  assert.equal(Number((g.mods.unemp-(g.development?.appliedMods.unemp||0)).toFixed(2)),-0.1);
  assert.equal(g.laws.filter(x=>x.id==='b1').length,1);
});

test('assenting an agenda bill does not spend next-turn attention or lose snapshots', () => {
  const b=load();let g=b.NS9.introduce(b.fresh(),'agenda',{id:'ag_vat'}).g;
  g.p9.bills[0].stage=4;g.p9.bills[0].since=0;
  const r=b.NSG.endMonth(g);g=r.g;
  assert.ok(g.laws.some(l=>l.id==='ag_vat'));
  assert.equal(g.ap,g.apMax);
  assert.deepEqual(plain(g.cur.s0),plain(g.s));
  assert.ok(r.report.results.some(x=>x.rid==='aag_vat1'));
});

test('invalid or inert AI bill drafts are rejected without spending actions', () => {
  const b=load(),g=b.fresh();
  for(const p of [null,{}, {...policy,effects:{debt:999}}, {...policy,effects:{deficit:Infinity}}, {...policy,effects:{},mods:{}}, {...policy,groups:{unknown:3}}]) {
    const r=b.NS9.introduce(g,'custom',{text:'A proposed law for testing',policy:p});
    assert.ok(r.error);assert.equal(r.g.ap,g.ap);assert.equal(r.g.p9.bills.length,0);
  }
});

test('old custom drafts without effects are held for revision', () => {
  const b=load();let g=b.NS9.introduce(b.fresh(),'custom',{text:'An old custom law for testing',policy}).g;
  delete g.p9.bills[0].policy;g.p9.bills[0].stage=4;g.p9.bills[0].since=0;
  const r=b.NSG.endMonth(g);
  assert.equal(r.g.laws.length,0);
  assert.ok(r.g.p9.bills[0].needsRevision);
  assert.ok(r.report.lines.some(l=>l.t.includes('needs a policy revision')));
});

test('persistent effects retain their assessed precision and reverse on repeal', () => {
  const b=load();const assessed={...policy,mods:{growth:0.15,unemp:-0.12}};
  let g=b.NS9.introduce(b.fresh(),'custom',{text:'A productivity and job placement reform',policy:assessed}).g;
  g.p9.bills[0].stage=4;g.p9.bills[0].since=0;
  g=b.NSG.endMonth(g).g;
  assert.equal(g.mods.growth,0.15);assert.equal(g.mods.unemp,-0.12);
  g=b.NSG.repeal(g,'b1');
  assert.equal(g.mods.growth,0);assert.equal(g.mods.unemp,0);
});

test('repeated exchange-regime selections and same-turn switching cannot farm effects', () => {
  const b=load(),g=b.fresh();g.p9.cb.regime='managed';
  const first=b.NS9.cbAct(g,'regime','float');
  for (const regime of ['float','peg','invalid']) {
    const r=b.NS9.cbAct(first.g,'regime',regime);
    assert.ok(r.error);assert.deepEqual(plain(r.g),plain(first.g));
  }
});

test('rate decisions are explicitly monthly and reject invalid magnitudes', () => {
  const b=load(),g=b.fresh();g.p9.cb.indep=false;
  assert.ok(b.NS9.cbAct(g,'rate',NaN).error);
  assert.ok(b.NS9.cbAct(g,'rate',200).error);
  const first=b.NS9.cbAct(g,'rate',0.5);
  assert.equal(first.g.ap,g.ap); // Independent monthly decision, not cabinet attention.
  assert.ok(b.NS9.cbAct(first.g,'rate',0.5).error);
});

test('AI results are idempotent and cannot be applied twice', () => {
  const b=load();let g=b.NSG.act(b.fresh(),'custom',{area:'ECONOMY',text:'Fund emergency food deliveries'}).g;
  const rid=g.cur.last, ai={effects:{approval:2},outcome:'Food deliveries arrive and residents welcome the emergency response.'};
  g=b.NSG.applyAI(g,rid,ai);
  assert.deepEqual(plain(b.NSG.applyAI(g,rid,ai)),plain(g));
});

test('free-form AI orders cannot create lasting laws around parliament', () => {
  const b=load();let g=b.NSG.act(b.fresh(),'custom',{area:'ECONOMY',text:'Create a new national tax law'}).g;
  g=b.NSG.applyAI(g,g.cur.last,{law:{name:'A national tax law',desc:'A lasting tax change',mods:{growth:0.15}}});
  assert.equal(g.laws.length,0);assert.equal(g.mods.growth,0);
  assert.ok(g.cur.results.at(-1).next.some(x=>x.includes('Legislation required')));
});

test('failed AI bill generation spends no action and produces no empty bill', async () => {
  const b=load(),ui=loadUI(b);b.claude={complete:async()=>{throw new Error('Service unavailable');}};
  ui.state.g=b.fresh();ui.state.g.ai=true;let message='';ui.toast=t=>{message=t;};
  const ap=ui.state.g.ap;
  await ui.prepareBill('Fund a jobs and tax administration programme',[0,0]);
  assert.equal(ui.state.g.ap,ap);assert.equal(ui.state.g.p9.bills.length,0);
  assert.ok(!ui.state.billReview);assert.ok(message.includes('NO ACTION SPENT'));
  assert.ok(Object.values(ui.state.pend).every(x=>!x));
});

test('geography-load events do not register a simulation mutation handler', () => {
  const b=load(),ui=loadUI(b),handlers={};
  ui.state.g=b.fresh();ui.wait=()=>{};
  ui.rootRef.current={addEventListener:(name,fn)=>{handlers[name]=fn;}};
  const before=plain(ui.state.g);ui.componentDidMount();
  assert.equal(handlers.provinces,undefined);
  assert.deepEqual(plain(ui.state.g),before);
});

test('late AI results never change another career in the same month', async () => {
  const b=load(),ui=loadUI(b);let resolve;
  b.claude={complete:()=>new Promise(r=>{resolve=r;})};
  const g=b.NSG.act(b.fresh(),'custom',{area:'ECONOMY',text:'Fund emergency food deliveries'}).g;
  g.ai=true;ui.state.g=g;ui.save=()=>{};
  const task=ui.runAI(g.cur.last);
  const other=plain(g);other.id='another-career';ui.state.g=other;
  resolve(JSON.stringify({effects:{approval:4},outcome:'A response intended only for the previous government.'}));
  await task;
  assert.deepEqual(plain(ui.state.g),other);
});

test('custom bill UI obtains and confirms a validated AI assessment', async () => {
  const b=load(),ui=loadUI(b);b.claude={complete:async()=>JSON.stringify(policy)};
  ui.state.g=b.fresh();ui.state.g.ai=true;ui.save=()=>{};
  const ap=ui.state.g.ap;
  await ui.prepareBill('Fund a jobs and tax administration programme',[0,0]);
  assert.ok(ui.state.billReview);assert.equal(ui.state.g.ap,ap);
  ui.confirmBill();
  assert.equal(ui.state.g.ap,ap-1);assert.equal(ui.state.g.p9.bills.length,1);
  assert.ok(ui.state.g.p9.bills[0].policy);
});

test('stale assessments cannot introduce policies against changed conditions', async () => {
  const b=load(),ui=loadUI(b);b.claude={complete:async()=>JSON.stringify(policy)};
  ui.state.g=b.fresh();ui.state.g.ai=true;ui.save=()=>{};ui.toast=()=>{};
  await ui.prepareBill('Fund a jobs and tax administration programme',[0,0]);
  ui.state.g.s.debt+=5;ui.confirmBill();
  assert.equal(ui.state.g.p9.bills.length,0);assert.equal(ui.state.billReview,null);
});

test('several seeds and countries complete campaigns with valid final results', () => {
  for(const seed of [0.12,0.47,0.89]) {
    const b=load(seed);
    for(const name of ['Pakistan','Germany','United States','China','Saudi Arabia','Brazil']) {
      let g=b.fresh(name),turns=0;
      while(!g.over&&turns++<48) {
        for(let i=0;i<g.cur.cards.length;i++) {
          const card=g.cur.cards[i];if(card.done)continue;
          const ix=Math.max(0,card.text.opts.findIndex(o=>!o.neg));
          const r=b.NSG.chooseEvent(g,i,ix);
          if(r.g)g=r.g;
          if(r.neg)g=b.NSG.negClose(g,b.NSG.negWalk(g,r.neg));
        }
        g=b.NSG.endMonth(g).g;
        for(const v of Object.values(g.s))assert.ok(Number.isFinite(v),name);
      }
      assert.ok(g.over,name);assert.ok(Number.isFinite(g.final.score),name);
      if(g.p9.elec)assert.equal(g.final.won,g.p9.elec.won,name);
    }
  }
});
