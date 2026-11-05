/*__wait*/(function __w(){ if (!(window.NSContent)) { setTimeout(__w, 15); return; }
/* v7 content: character traits, ideologies, opportunities, world and war cards, group pacts, budget lines, window actions. */
(function(){
const K = window.NSContent;
const O = (l, d, fx, gr, x) => Object.assign({ l, d, fx:fx || {}, gr:gr || {} }, x || {});
const E = (id, cat, tone, w, f, x) => Object.assign({ id, cat, tone, w, f }, x || {});

const TRAITS = {
  charismatic:{ name:'Charismatic', d:'Approval gains are a quarter larger.', start:{ approval:5 } },
  technocrat:{ name:'Technocrat', d:'Markets trust you. Fiscal savings go further.', gr:{ lenders:10, business:4 } },
  strongman:{ name:'Strongman', d:'The army respects you. The young fear you.', start:{ stability:5 }, gr:{ army:10, youth:-8 } },
  dealmaker:{ name:'Dealmaker', d:'Every negotiation starts 12 points closer.' },
  reformer:{ name:'Reformer', d:'Cities believe you; the barons do not.', gr:{ urban:6, youth:4, elites:-8 } },
  populist:{ name:'Populist', d:'Ordinary voters love you. Lenders do not.', gr:{ urban:5, rural:5, labour:5, lenders:-8 } },
  diplomat:{ name:'Diplomat', d:'Relations start warmer and improve faster.' },
  veteran:{ name:'Former soldier', d:'The army trusts you and fights better under you.', gr:{ army:12 } },
  pious:{ name:'Devout', d:'The clergy see you as one of theirs.', gr:{ clergy:12, youth:-4 } },
  workaholic:{ name:'Workaholic', d:'Four actions a month instead of three.' }
};
const FLAWS = {
  hothead:{ name:'Hot-headed', d:'Rivals provoke you; the AI makes rash moves backfire more.', rel:-6 },
  scandal:{ name:'Old scandal', d:'A past case follows you everywhere.', start:{ approval:-4 } },
  inexperienced:{ name:'Inexperienced', d:'Your party doubts you at first.', start:{ unity:-8 } },
  aloof:{ name:'Aloof', d:'Approval gains are a fifth smaller.' },
  cronies:{ name:'Cronies', d:'Loyal friends with expensive habits.', gr:{ elites:10, lenders:-6 }, start:{ approval:-3 } }
};
const IDEOLOGIES = {
  'Left':{ gr:{ labour:10, urban:4, business:-10, lenders:-6 } }, 'Centre-left':{ gr:{ labour:6, urban:4, business:-3 } }, 'Centre':{ gr:{} },
  'Centre-right':{ gr:{ business:6, rural:3, labour:-4 } }, 'Right':{ gr:{ business:10, army:5, labour:-8, youth:-3 } }, 'Religious conservative':{ gr:{ clergy:14, rural:5, youth:-8, urban:-3 } },
  'Nationalist':{ gr:{ army:8, rural:6, lenders:-4, youth:-2 } }, 'Liberal':{ gr:{ youth:8, urban:6, clergy:-8, business:3 } }, 'Green':{ gr:{ youth:10, business:-6, rural:-3 } }
};
const BACKGROUNDS = ['Lawyer','Economist','General','Businessman','Union leader','Cleric','Doctor','Journalist','Political dynasty','Academic','Cricketer'];
const BG_FX = { 'Lawyer':{}, 'Economist':{ lenders:5 }, 'General':{ army:8 }, 'Businessman':{ business:8 }, 'Union leader':{ labour:8 }, 'Cleric':{ clergy:8 }, 'Doctor':{ urban:3 }, 'Journalist':{ youth:4 }, 'Political dynasty':{ elites:10, youth:-4 }, 'Academic':{ youth:3 }, 'Cricketer':{ youth:6, urban:4 } };

/* ---- concessions for pacts ---- */
Object.assign(K.CONCESSIONS, {
  fert_subsidy:{ name:'Fertiliser subsidy', d:'Cheaper inputs every season.', v:30, fx:{ deficit:0.2 }, gr:{ lenders:-3 } },
  crop_price:{ name:'Guaranteed wheat support price', d:'The state buys at a floor.', v:30, fx:{ deficit:0.15, inflation:0.2 }, gr:{ urban:-3 } },
  water:{ name:'Priority canal water for their districts', d:'Other provinces will notice.', v:25, fx:{}, gr:{} },
  rural_roads:{ name:'A rural roads programme', d:'Farm to market.', v:25, fx:{ deficit:0.2 }, gr:{ business:2 } },
  free_data:{ name:'Free mobile data for students', d:'Paid to the operators.', v:25, fx:{ deficit:0.05 }, gr:{} },
  student_loans:{ name:'Interest-free student loans', d:'Repaid after employment.', v:30, fx:{ deficit:0.1 }, gr:{} },
  youth_seats:{ name:'Youth quota on party tickets', d:'A fifth of candidates under 35.', v:25, fx:{ unity:-3 }, gr:{ elites:-4 } },
  transit:{ name:'Subsidised city transit', d:'Metro and bus fares halved.', v:25, fx:{ deficit:0.15 }, gr:{} },
  price_control:{ name:'Price controls on staples', d:'Flour, sugar, cooking oil.', v:30, fx:{ inflation:-0.3, growth:-0.05 }, gr:{ business:-6, rural:-3 } },
  city_power:{ name:'No load-shedding in the big cities', d:'Rural feeders take the cuts.', v:25, fx:{}, gr:{ rural:-5 } }
});
const PACTS = {
  army:['defence_budget','tenure','no_audit','interior','retired_posts','officer_housing'], clergy:['seminary_fund','religious_ministry','no_registration','faith_assurance','curriculum','sharia_council'],
  business:['tax_holiday','fx_access','no_retro','contracts','power_discount','export_rebate'], labour:['wage_index','no_layoffs','energy_cap','pension_protect','union_rights','public_pay','worker_housing','health_cover'],
  urban:['transit','price_control','city_power','energy_cap','public_pay'], rural:['fert_subsidy','crop_price','water','rural_roads'], youth:['free_data','student_loans','youth_seats','union_rights'],
  elites:['ministries','dev_fund','speaker','provincial','case_drop','deputy_pm','senate_tickets','governorship'],
  lenders:['spend_cut','rate_hike','tariff','tax_target','pension','soe_audit','gst','retail_tax','privatise','cbi']
};
const PACT_WIN = { army:{ stability:6 }, clergy:{ stability:4 }, business:{ growth:0.3 }, labour:{ growth:0.1, stability:2 }, urban:{ approval:3 }, rural:{ approval:2, stability:1 }, youth:{ approval:2 }, elites:{ unity:12 }, lenders:{ rate:-0.4, reserves:0.3 } };
Object.keys(PACTS).forEach(k => {
  if (k === 'lenders') return;
  K.NEGS['pact_' + k] = { party:k, pick:4, need:75, pool:PACTS[k],
    who:X => X.gn(k), title:X => 'A pact with ' + X.gn(k),
    intro:X => 'You invite ' + X.gn(k) + ' to talk. They come with a list. Support for you stands at ' + Math.round(X.sup(k)) + '.' + (X.g.groups[k] && X.g.groups[k].mem[0] ? ' They remind you that you ' + X.g.groups[k].mem[0].t + '.' : ''),
    lever:X => ({ name:'Appeal to the national interest on television', d:'Approval ' + Math.round(X.s.approval) + '.', v:Math.round((X.s.approval - 45) * 0.8), cost:{} }),
    yes:() => '"We have an understanding."', no:() => '"Come back with something real."',
    ok:X => ({ fx:PACT_WIN[k], out:'A pact is signed. ' + X.gn(k).charAt(0).toUpperCase() + X.gn(k).slice(1) + ' will back you for now.' }),
    fail:X => ({ fx:{}, out:'No pact. They leave unhappy.' }) };
});
K.NEGS.ceasefire = { party:'@war', pick:4, need:90, pool:['cf_border','cf_prisoners','cf_reparations','cf_observers','cf_demilitarise','cf_trade'],
  who:X => 'envoys of ' + X.g.world.war.enemy, title:X => 'Ceasefire with ' + X.g.world.war.enemy,
  intro:X => 'Mediators host both delegations. The front stands at ' + Math.round(X.g.world.war.front) + '/100 in your favour; the stronger side sets the terms.',
  lever:X => ({ name:'Point to the battlefield', d:'Your position at the front.', v:Math.round((X.g.world.war.front - 50) * 1.2), cost:{} }),
  yes:() => '"The guns fall silent at midnight."', no:() => '"Then we will settle it at the front."',
  ok:X => ({ endWar:'ceasefire', fx:{ stability:4 }, out:'A ceasefire is signed. Both sides claim victory.' }), fail:X => ({ fx:{}, out:'The war goes on.' }) };
Object.assign(K.CONCESSIONS, {
  cf_border:{ name:'Accept the current line of control', d:'Lost ground stays lost.', v:35, fx:{ approval:-4 }, gr:{ army:-8 } },
  cf_prisoners:{ name:'Release all prisoners of war', d:'Including the commanders.', v:20, fx:{}, gr:{ army:-3 } },
  cf_reparations:{ name:'Pay reconstruction costs', d:'A fund for the border districts.', v:30, fx:{ deficit:0.3 }, gr:{} },
  cf_observers:{ name:'Admit UN observers', d:'Foreign monitors on your soil.', v:20, fx:{}, gr:{ army:-4 } },
  cf_demilitarise:{ name:'Withdraw heavy weapons 30 km', d:'A buffer zone.', v:25, fx:{}, gr:{ army:-6 } },
  cf_trade:{ name:'Reopen trade crossings', d:'Business resumes.', v:20, fx:{ growth:0.1 }, gr:{ business:3 } }
});

/* ---- budget ---- */
const BUDGET = [
  { k:'health', name:'Health', fx:{ approval:1.2 }, gr:{ urban:2, rural:2 }, mods:{} },
  { k:'education', name:'Education', fx:{ approval:0.6 }, gr:{ youth:3 }, mods:{ growth:0.05 } },
  { k:'welfare', name:'Welfare & pensions', fx:{ approval:1 }, gr:{ labour:3, rural:2, lenders:-2 }, mods:{} },
  { k:'defence', name:'Defence', fx:{ stability:0.6 }, gr:{ army:6, lenders:-1 }, mods:{}, mil:5 },
  { k:'infra', name:'Infrastructure', fx:{}, gr:{ business:2, rural:2 }, mods:{ growth:0.07, unemp:-0.05 } },
  { k:'police', name:'Police & justice', fx:{ stability:1.2 }, gr:{ urban:1 }, mods:{} }
];
const TAXES = [
  { k:'income', name:'Income tax', yield:0.22, gr:{ urban:-2, business:-1 }, fx:{ approval:-0.6 }, mods:{ growth:-0.01 }, min:0, max:50 },
  { k:'corporate', name:'Corporate tax', yield:0.12, gr:{ business:-4, labour:1 }, fx:{}, mods:{ growth:-0.03 }, min:5, max:45 },
  { k:'sales', name:'Sales tax / VAT', yield:0.32, gr:{ urban:-2, labour:-1 }, fx:{ approval:-0.5, inflation:0.15 }, mods:{}, min:0, max:27 }
];

/* ---- opportunities and new crises ---- */
const MORE = [
  E('o_investor', 'ECONOMY', 'opp', X => 7, X => ({ title:'A Gulf sovereign fund wants to invest $' + (2 + Math.round(X.rnd('inv') * 6)) + 'bn', body:'They want a port, a refinery or farmland, and they want an answer before a rival country offers more.', opts:[
    O('Offer the refinery stake', 'Fast money for a strategic asset.', { reserves:0.6, growth:0.2 }, { business:5, labour:-4, lenders:4 }, { out:'Signed in a week. The unions call it a sell-off.', rel:{ 'Saudi Arabia':6, 'United Arab Emirates':6 } }),
    O('Offer farmland on long leases', 'Food security for them, jobs for you.', { reserves:0.4, growth:0.1 }, { rural:-6, army:3 }, { out:'Half a million acres leased for 30 years.' }),
    O('Insist on a joint venture with local firms', 'Smaller deal, local ownership.', { reserves:0.2, growth:0.1 }, { business:6 }, { out:'A smaller deal, with local partners.' }),
    O('Decline', 'Keep the assets.', { approval:1 }, { lenders:-2 }, { out:'The fund invests next door instead.' }) ] })),
  E('o_tech', 'ECONOMY', 'opp', X => 6, X => ({ title:'A global tech firm is choosing between you and a rival for a chip plant', body:'Ten thousand jobs. They want tax breaks, cheap power and visas for engineers.', opts:[
    O('Match every demand', 'Win the plant at any price.', { deficit:0.2, growth:0.3, unemp:-0.2 }, { business:8, youth:6, lenders:-3 }, { out:'The plant is yours. So is the bill.', law:{ id:'chip_plant', name:'Semiconductor plant deal', desc:'Tax breaks and power for a foreign chip plant.', mods:{ growth:0.15 } } }),
    O('Offer a balanced package', 'Some breaks, real conditions.', { growth:0.1 }, { business:3 }, { out:X => X.rnd('tech') > 0.5 ? 'They accept, with a smaller plant.' : 'They go to your rival.' }),
    O('Let it go', 'No race to the bottom.', {}, { youth:-4 }, { out:'The rival wins it.' }) ] })),
  E('o_diaspora', 'ECONOMY', 'opp', X => 5, X => ({ title:'Diaspora billionaires offer to fund a development bank', body:'They want board seats and tax-free status for their contributions.', opts:[
    O('Accept their terms', 'Capital and influence for them.', { reserves:0.5, growth:0.1 }, { elites:-4, business:4 }, { out:'The bank opens with $3bn.' }),
    O('Accept, with public oversight', 'Smaller fund.', { reserves:0.3 }, { urban:3 }, { out:'A smaller fund, fully audited.' }),
    O('Decline', 'No private interests in policy.', {}, {}, { out:'They fund hospitals instead.' }) ] })),
  E('o_harvest', 'ECONOMY', 'opp', X => 5, X => ({ title:'A record harvest in ' + X.P, body:'Granaries are full and prices are falling. Farmers want the state to buy; exporters want permits.', opts:[
    O('Buy for the strategic reserve', 'Protect farmers, store food.', { deficit:0.1, inflation:-0.2 }, { rural:8 }, { out:'The reserve fills for two years.' }),
    O('Open exports', 'Dollars in.', { reserves:0.4, growth:0.1 }, { rural:5, urban:-2 }, { out:'Cargoes leave for the Gulf and Africa.' }),
    O('Let prices fall', 'Cheaper bread in cities.', { inflation:-0.4 }, { urban:4, rural:-8 }, { out:'Bread is cheaper; farmers are angry.' }) ] })),
  E('o_tourism', 'ECONOMY', 'opp', X => 4, X => ({ title:'A travel guide names your country the year’s top destination', body:'Airlines want landing rights and hotels want visas on arrival.', opts:[
    O('Visa on arrival for 90 countries', 'Open the doors.', { growth:0.15, reserves:0.2 }, { business:5, clergy:-2 }, { out:'Arrivals up a third.', law:{ id:'visa_open', name:'Visa on arrival', desc:'Tourist visas at the border.', mods:{ growth:0.08 } } }),
    O('A tourism promotion campaign', 'Spend to build on it.', { deficit:0.05, growth:0.05 }, { business:3 }, { out:'Ads in six markets.' }),
    O('Nothing special', 'Let it run.', {}, {}, { out:'A modest bump.' }) ] })),
  E('o_mineral', 'ECONOMY', 'opp', X => 4, X => ({ title:'Lithium and copper found in ' + X.P3, body:'Western and Chinese miners both want the concession. Locals want a share.', opts:[
    O('Western consortium', 'Aligned with Washington.', { reserves:0.4, growth:0.2 }, { business:4, rural:-4 }, { out:'A 30-year concession.', rel:{ 'United States':8, 'China':-6 } }),
    O('Chinese state miner', 'Faster, bigger cheque.', { reserves:0.6, growth:0.2 }, { rural:-4 }, { out:'Construction starts within months.', rel:{ 'China':8, 'United States':-6 } }),
    O('State company with local royalties', 'Slow, sovereign, popular.', { approval:2 }, { rural:8, lenders:-2 }, { out:'Royalties for ' + X.P3 + ' written into law.' }) ] })),
  E('o_imf_praise', 'ECONOMY', 'opp', X => X.g.imf.status === 'active' && X.sup('lenders') > 55 ? 6 : 0, X => ({ title:'The IMF offers to raise your programme’s size', body:'Your performance has impressed the board. They can add a tranche, with one more reform.', opts:[
    O('Accept and add a reform', 'More money, one more condition.', { reserves:0.8 }, { lenders:6, labour:-3 }, { out:'An augmented programme is approved.' }),
    O('Decline politely', 'Signal independence.', { approval:1 }, { lenders:-2 }, { out:'You take credit at home.' }) ] })),
  E('o_peace', 'FOREIGN', 'opp', X => X.g.world.rival && X.g.world.rel[X.g.world.rival] > 25 && !X.g.world.war ? 5 : 0, X => ({ title:X.g.world.rival + ' signals it wants talks', body:'A back channel says their leadership wants a thaw: trade, visas, a hotline.', opts:[
    O('Open formal talks', 'A historic opening.', { stability:2, approval:-1 }, { army:-8, business:6 }, { out:'Foreign ministers meet in a neutral capital.', rel:{ [X.g.world.rival]:14 } }),
    O('Quiet back-channel only', 'Test them first.', {}, { army:-2 }, { out:'Envoys meet in secret.', rel:{ [X.g.world.rival]:6 } }),
    O('Rebuff them publicly', 'Popular with hawks.', { approval:2 }, { army:5 }, { out:'Your statement closes the door.', rel:{ [X.g.world.rival]:-8 } }) ] })),
  E('o_summit', 'FOREIGN', 'opp', X => 5, X => { const p = X.g.world.partners[Math.floor(X.rnd('sum') * X.g.world.partners.length)]; return { title:'You are invited to a summit in ' + p, body:'A chance for photographs, deals and a bilateral meeting with their leader.', opts:[
    O('Attend and push a trade deal', 'Come back with something.', { growth:0.05 }, { business:3 }, { out:'A memorandum on trade is signed.', rel:{ [p]:10 } }),
    O('Attend and ask for financial support', 'Money for reserves.', { reserves:0.3 }, {}, { out:'A deposit is pledged.', rel:{ [p]:4 } }),
    O('Send the foreign minister', 'Stay home and govern.', { approval:1 }, {}, { out:'A lower-key visit.', rel:{ [p]:-3 } }) ] }; }),
  E('o_arms', 'SECURITY', 'opp', X => 5, X => ({ title:'Two powers compete to sell you fighter jets', body:'One offers better aircraft, the other better financing.', opts:[
    O('Buy American', 'Better jets, political strings.', { deficit:0.2, reserves:-0.2 }, { army:8 }, { out:'Deliveries in three years.', mil:{ strength:6 }, rel:{ 'United States':8, 'China':-5 } }),
    O('Buy Chinese', 'Cheaper, financed.', { deficit:0.1 }, { army:6 }, { out:'Deliveries next year.', mil:{ strength:5 }, rel:{ 'China':8, 'United States':-5 } }),
    O('Build a domestic industry', 'Slow, sovereign.', { deficit:0.15 }, { army:3, business:3 }, { out:'A state aerospace firm is founded.', mil:{ strength:2 } }),
    O('Buy nothing', 'Save the money.', { deficit:-0.05 }, { army:-6 }, { out:'The air force is unhappy.' }) ] })),
  E('o_un', 'FOREIGN', 'opp', X => 3, X => ({ title:'Your country is nominated for a UN Security Council seat', body:'Winning needs votes from blocs you have neglected.', opts:[
    O('Campaign hard', 'Promise aid and votes.', { deficit:0.05 }, {}, { out:X => X.rnd('un') > 0.4 ? 'You win the seat. Prestige up.' : 'You lose narrowly.', rel:{} }),
    O('Withdraw', 'Not worth the cost.', {}, {}, { out:'You back a neighbour instead.' }) ] })),
  E('o_reform_window', 'POLITICS', 'opp', X => X.s.approval > 52 ? 6 : 0, X => ({ title:'Your approval gives you a rare window', body:'Advisers say you have political capital for one big, unpopular reform.', opts:[
    O('Broaden the tax base', 'The hardest, most important reform.', { deficit:-0.6, approval:-4 }, { business:-6, elites:-6, lenders:10 }, { out:'Passed while you could.', concede:['retail_tax'], tags:['reform'] }),
    O('Reform the civil service', 'Merit over patronage.', { approval:-2 }, { elites:-10, urban:4 }, { out:'Appointments move to a public commission.', law:{ id:'civil_service', name:'Civil service reform', desc:'Merit-based appointments.', mods:{ growth:0.08 } }, tags:['reform'] }),
    O('Spend the capital on a popular programme', 'Bank the goodwill.', { approval:3, deficit:0.2 }, { urban:4, rural:4 }, { out:'A popular programme launches.' }) ] })),
  E('o_defector', 'POLITICS', 'opp', X => X.opp && X.opp.seats ? 5 : 0, X => ({ title:'Twelve ' + X.opp.short + ' members want to cross the floor', body:'They want ministries or development funds in return.', opts:[
    O('Take them, with posts', 'A bigger majority.', { unity:-3 }, { elites:-4 }, { out:'Twelve new members on your benches.', seats:12 }),
    O('Take them, no posts', 'They might change their minds.', {}, {}, { out:X => X.rnd('def') > 0.5 ? 'Seven come over.' : 'They stay put.', seats:X.rnd('def') > 0.5 ? 7 : 0 }),
    O('Refuse; no turncoats', 'Principle.', { approval:2, unity:2 }, {}, { out:'Praised as principled.' }) ] })),
  E('o_youth', 'SOCIETY', 'opp', X => 4, X => ({ title:'A young founder’s app becomes a global hit', body:'She wants a startup visa programme and a venture fund. Investors are watching.', opts:[
    O('Create a $500m venture fund', 'Bet on the young.', { deficit:0.1, growth:0.1 }, { youth:10, business:4 }, { out:'Applications from 4,000 startups.', law:{ id:'startup_fund', name:'National venture fund', desc:'Public money for startups.', mods:{ growth:0.06, unemp:-0.05 } } }),
    O('Fix the rules instead', 'Easier company registration, digital payments.', { growth:0.05 }, { youth:6 }, { out:'Registration now takes a day.' }),
    O('A photo opportunity', 'Cheap.', { approval:1 }, { youth:1 }, { out:'Good pictures.' }) ] })),
  E('o_aid', 'FOREIGN', 'opp', X => 3, X => ({ title:'Donors offer a climate adaptation package', body:'Grants for dams, sea walls and early-warning systems, if you meet governance benchmarks.', opts:[
    O('Accept with benchmarks', 'Free money, real audits.', { reserves:0.3 }, { lenders:4, elites:-4 }, { out:'The first grants arrive.' }),
    O('Accept without benchmarks', 'Smaller package.', { reserves:0.1 }, {}, { out:'A smaller cheque.' }),
    O('Decline', 'No conditions on sovereignty.', {}, {}, { out:'Declined.' }) ] })),

  /* world-driven */
  E('w_side', 'FOREIGN', 'crisis', X => 0, X => { const d = X.g.dynWorld || { a:'A', b:'B' }; return { title:'War between ' + d.a + ' and ' + d.b + ': both want your support', body:'Your ambassador at the UN must vote on a resolution tonight. Both capitals are calling.', why:'WORLD EVENT', opts:[
    O('Back ' + d.a, 'Pick a side.', {}, {}, { out:'You vote with ' + d.a + '.', rel:{ [d.a]:12, [d.b]:-18 } }),
    O('Back ' + d.b, 'Pick the other side.', {}, {}, { out:'You vote with ' + d.b + '.', rel:{ [d.b]:12, [d.a]:-18 } }),
    O('Abstain and call for a ceasefire', 'Neutrality.', {}, {}, { out:'Both sides are mildly disappointed.', rel:{ [d.a]:-3, [d.b]:-3 } }) ] }; }),
  E('w_aid', 'FOREIGN', 'opp', X => 0, X => { const d = X.g.dynWorld || { who:'a partner' }; return { title:d.who + ' appeals for disaster aid', body:'The earthquake has left thousands homeless. Your response will be remembered.', why:'WORLD EVENT', opts:[
    O('Send rescue teams and $50m', 'Generous.', { deficit:0.03, approval:1 }, {}, { out:'Your rescuers are filmed pulling survivors from the rubble.', rel:{ [d.who]:12 } }),
    O('Send tents and medicine', 'Modest.', {}, {}, { out:'A cargo plane leaves the next morning.', rel:{ [d.who]:5 } }),
    O('Condolences only', 'Nothing to spare.', {}, {}, { out:'Noted in their capital.', rel:{ [d.who]:-4 } }) ] }; }),
  E('w_mobilise', 'SECURITY', 'crisis', X => 0, X => { const d = X.g.dynWorld || { who:X.g.world.rival }; return { title:d.who + ' masses troops on the border', body:'Satellite images show armour moving to the frontier. Their state media accuse you of provocation. Relations are at ' + Math.round(X.g.world.rel[d.who] || 0) + '.', why:'RELATIONS COLLAPSED', opts:[
    O('Mobilise and warn them', 'Deterrence.', { stability:-2 }, { army:8 }, { out:'Both armies dig in.', mil:{ readiness:15 }, rel:{ [d.who]:-4 } }),
    O('Strike first', 'War.', {}, { army:6 }, { out:'Your forces cross the line at dawn.', war:d.who }),
    O('Ask a great power to mediate', 'Climb down.', { approval:-2 }, { army:-4 }, { out:'Washington and Beijing both call. Troops pull back.', rel:{ [d.who]:8 } }) ] }; }),
  E('war_month', 'SECURITY', 'crisis', X => X.g.world.war ? 14 : 0, X => { const w = X.g.world.war; return { title:'The war with ' + w.enemy + ': the generals want a decision', body:'The front stands at ' + Math.round(w.front) + '/100 in your favour after ' + w.months + ' months. War fatigue is ' + Math.round(w.fatigue) + '.', why:'AT WAR', opts:[
    O('Launch a major offensive', 'Gamble for a breakthrough.', { deficit:0.1 }, { army:4 }, { out:'Armour moves at dawn.', warPush:8 + Math.round(X.rnd('off') * 10 - 4), mil:{ readiness:-8 } }),
    O('Hold the lines', 'Bleed them slowly.', {}, {}, { out:'Trenches deepen.', warPush:1 }),
    O('Seek a ceasefire', 'Negotiate.', {}, {}, { neg:'ceasefire' }) ] }; })
];
K.EVENTS.push(...MORE);
K.EVENTS.forEach(e => { if (!e.tone) e.tone = ['gas_find','eurobond','sports','corridor','remittances'].includes(e.id) ? 'opp' : 'crisis'; });

window.NSContent7 = { TRAITS, FLAWS, IDEOLOGIES, BACKGROUNDS, BG_FX, BUDGET, TAXES, PACTS };
})();

})();
