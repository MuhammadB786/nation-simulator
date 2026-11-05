/*__wait*/(function __w(){ if (!(window.NSContent)) { setTimeout(__w, 15); return; }
/* v8 content: technology & industry, military branches and military tech, ministries, chambers, constitutional reform. */
(function(){
const TECH = [
  { k:'digital', name:'Digital economy', d:'E-commerce, IT exports, freelancing.' },
  { k:'fintech', name:'Fintech & payments', d:'Mobile money, digital banks, instant payments.' },
  { k:'ai', name:'AI & data', d:'Data centres, AI adoption, research.' },
  { k:'chips', name:'Electronics & chips', d:'Assembly, testing, design.' },
  { k:'telecom', name:'Telecom & 5G', d:'Coverage, speeds, spectrum.' },
  { k:'green', name:'Clean energy', d:'Solar, wind, storage, grid.' }
];
const P = (id, k, name, d, fx, gr, boost, x) => Object.assign({ id, k, name, d, fx:fx || {}, gr:gr || {}, boost }, x || {});
const TECH_PROJECTS = [
  P('t_raast','fintech','Instant payment system','A free, 24/7 bank-to-bank rail run by the central bank.', { deficit:0.03 }, { business:3, urban:2 }, { fintech:12 }, { mods:{ growth:0.04 } }),
  P('t_digibank','fintech','Licence digital-only banks','Five licences for app-based banks.', {}, { youth:4, business:-2 }, { fintech:10 }, { mods:{ growth:0.03 }, req:{ fintech:20 } }),
  P('t_cbdc','fintech','Pilot a central bank digital currency','A digital currency for government payments and remittances.', { deficit:0.04 }, { lenders:2, business:-2 }, { fintech:8 }, { req:{ fintech:35 } }),
  P('t_crypto','fintech','Regulate crypto exchanges','Licensing, tax and anti-laundering rules.', { deficit:-0.03 }, { youth:5, clergy:-3, lenders:2 }, { fintech:6 }, {}),
  P('t_wallet','fintech','Benefits paid to mobile wallets','Every transfer by phone, no middlemen.', { deficit:-0.05 }, { rural:4, elites:-3 }, { fintech:8 }, { req:{ fintech:25 } }),
  P('t_itpark','digital','Technology parks in three cities','Power, fibre and tax breaks for IT firms.', { deficit:0.08 }, { youth:5, business:4 }, { digital:12 }, { mods:{ growth:0.06, unemp:-0.05 } }),
  P('t_freelance','digital','Freelancer tax and payment rules','Lower tax and faster dollar payouts for online workers.', { deficit:0.02 }, { youth:6 }, { digital:8 }, { fx2:{ reserves:0.1 } }),
  P('t_egov','digital','Put government services online','Licences, land records and taxes on one app.', { deficit:0.05 }, { urban:4, elites:-4 }, { digital:10 }, { mods:{ growth:0.03 } }),
  P('t_datacentre','ai','Data centre zone','Cheap power and land for hyperscale data centres.', { deficit:0.05 }, { business:5, urban:-2 }, { ai:12 }, { mods:{ growth:0.05 }, req:{ telecom:30 } }),
  P('t_ai','ai','National AI strategy','Compute for universities, AI in health and tax.', { deficit:0.06 }, { youth:4 }, { ai:10 }, { mods:{ growth:0.04 } }),
  P('t_ai_law','ai','AI and data protection law','Rules on data, deepfakes and automated decisions.', {}, { youth:2, business:-2 }, { ai:5 }, {}),
  P('t_chips','chips','Chip assembly and testing incentives','Subsidies for packaging and testing plants.', { deficit:0.12 }, { business:6, labour:3 }, { chips:12 }, { mods:{ growth:0.06 }, req:{ telecom:25 } }),
  P('t_mobile','chips','Local phone manufacturing scheme','Duty cuts for phones assembled at home.', { deficit:0.04 }, { business:4, labour:3 }, { chips:8 }, { mods:{ growth:0.03 } }),
  P('t_5g','telecom','Auction 5G spectrum','Revenue now, faster networks later.', { deficit:-0.15 }, { business:3 }, { telecom:12 }, {}),
  P('t_fibre','telecom','Rural broadband programme','Fibre and towers to every district.', { deficit:0.1 }, { rural:5 }, { telecom:10 }, { mods:{ growth:0.03 } }),
  P('t_solar','green','Rooftop solar with net metering','Households sell power back to the grid.', { deficit:0.04 }, { urban:4, business:-2 }, { green:10 }, { mods:{ inflation:-0.05 } }),
  P('t_wind','green','Wind and solar auctions','Competitive tenders for 5 GW.', { deficit:0.03 }, { business:3 }, { green:10 }, { mods:{ inflation:-0.05, growth:0.02 } }),
  P('t_ev','green','Electric two-wheeler subsidy','Cheaper e-bikes and rickshaws.', { deficit:0.06 }, { urban:4 }, { green:6 }, { fx2:{ reserves:0.05 } })
];
const BRANCH_ACTS = {
  army:[
    { id:'mobilise', l:'Mobilise the reserves', d:'Readiness +15. The economy feels it.' },
    { id:'armour', l:'Buy tanks and artillery', d:'Army +5, paid in dollars.' },
    { id:'coin', l:'Counter-insurgency campaign', d:'Calms the most restive province; locals pay.' },
    { id:'purge', l:'Replace commanders with loyalists', d:'Coups get harder; the army resents it.', bad:true }
  ],
  air:[
    { id:'fighters', arg:'United States', l:'Buy American fighters', d:'Best aircraft, political strings.' },
    { id:'fighters', arg:'China', l:'Buy Chinese fighters', d:'Cheaper, financed, delivered sooner.' },
    { id:'airdef', l:'Integrated air defence', d:'Radars and missile batteries around cities.' },
    { id:'airstrike', l:'Air strikes on enemy positions', d:'Only at war. Pushes the front.', war:true, bad:true }
  ],
  navy:[
    { id:'subs', l:'Order submarines', d:'Navy +6. Expensive, slow, deterrent.' },
    { id:'frigates', l:'Build frigates at home', d:'Navy +4, jobs in the shipyards.' },
    { id:'patrol', l:'Coastal anti-smuggling patrols', d:'Fuel and goods smuggling cut; customs revenue up.' },
    { id:'blockade', l:'Blockade the enemy’s ports', d:'Only at war.', war:true, bad:true }
  ],
  tech:[
    { id:'drones', l:'Armed drone programme', d:'Cheap air power. Rivals take note.' },
    { id:'cyber', l:'Cyber command', d:'Defend the grid and banks; strike back.' },
    { id:'missiles', l:'Long-range missile tests', d:'Deterrence, and a diplomatic storm.', bad:true },
    { id:'satellite', l:'Military satellite launch', d:'Your own eyes in orbit.' }
  ]
};
const LANDLOCKED = ['Afghanistan','Armenia','Austria','Azerbaijan','Belarus','Bolivia','Botswana','Burkina Faso','Burundi','Central African Republic','Chad','Czechia','Czech Republic','Eswatini','Ethiopia','Hungary','Kazakhstan','Kosovo','Kyrgyzstan','Laos','Lesotho','Malawi','Mali','Moldova','Mongolia','Nepal','Niger','North Macedonia','Paraguay','Rwanda','Serbia','Slovakia','South Sudan','Switzerland','Tajikistan','Turkmenistan','Uganda','Uzbekistan','Zambia','Zimbabwe','Bhutan','Liechtenstein','Luxembourg','Andorra','San Marino','Vatican City'];
const MINISTRIES = [
  { k:'finance', name:'Finance', cats:['ECONOMY'] }, { k:'foreign', name:'Foreign Affairs', cats:['FOREIGN'] }, { k:'interior', name:'Interior', cats:['SECURITY','SOCIETY'] },
  { k:'defence', name:'Defence', cats:['SECURITY'] }, { k:'energy', name:'Energy', cats:['ECONOMY'] }, { k:'commerce', name:'Commerce & Trade', cats:['ECONOMY','FOREIGN'] },
  { k:'it', name:'IT & Telecom', cats:['ECONOMY'] }, { k:'health', name:'Health', cats:['SOCIETY'] }, { k:'education', name:'Education', cats:['SOCIETY'] }, { k:'law', name:'Law & Justice', cats:['POLITICS'] }
];
const SENATES = { 'Pakistan':['Senate',96], 'India':['Rajya Sabha',245], 'United States':['Senate',100], 'Argentina':['Senate',72], 'Brazil':['Federal Senate',81], 'Mexico':['Senate',128], 'Nigeria':['Senate',109], 'France':['Sénat',348], 'Italy':['Senato',200], 'Japan':['House of Councillors',248], 'Egypt':['Senate',300], 'Germany':['Bundesrat',69], 'United Kingdom':['House of Lords',800], 'Russia':['Federation Council',170], 'Canada':['Senate',105], 'Indonesia':['DPD',152], 'South Africa':['National Council of Provinces',90], 'Poland':['Senate',100], 'Spain':['Senado',265], 'Australia':['Senate',76], 'Philippines':['Senate',24], 'Colombia':['Senate',108], 'Chile':['Senate',50], 'Malaysia':['Dewan Negara',70], 'Thailand':['Senate',200], 'Ireland':['Seanad',60], 'Czechia':['Senate',81] };
const UNICAMERAL = ['Turkey','Bangladesh','Sri Lanka','Ukraine','Iran','China','South Korea','Ghana','Kenya','Vietnam','Israel','Greece','Portugal','Sweden','Denmark','Finland','Norway','Hungary','New Zealand','Saudi Arabia','Peru','Ecuador','Venezuela','Egypt'];
const R = (id, name, d, fx, gr, set, x) => Object.assign({ id, name, d, fx:fx || {}, gr:gr || {}, set }, x || {});
const REFORMS = [
  R('to_pres','Switch to a presidential system','A directly elected executive who cannot be removed by a confidence vote.', { stability:3, unity:-6 }, { elites:-6, army:3 }, { exec:'Presidential' }, { ok:s => s.exec !== 'Presidential' && s.exec !== 'Military-led' }),
  R('to_parl','Switch to a parliamentary system','The leader answers to parliament and can be removed by it.', { approval:2, stability:-2 }, { elites:5, youth:3 }, { exec:'Parliamentary' }, { ok:s => s.exec !== 'Parliamentary' }),
  R('pr','Adopt proportional representation','Seats match votes. Smaller parties gain; majorities get rarer.', { approval:2, unity:-4 }, { youth:6, elites:-6 }, { electoral:'Proportional' }, { ok:s => s.electoral !== 'Proportional' }),
  R('fptp','Adopt first-past-the-post','Winner takes each seat. Big parties gain.', { unity:4 }, { youth:-5, elites:4 }, { electoral:'First past the post' }, { ok:s => s.electoral !== 'First past the post' }),
  R('abolish_senate','Abolish the upper house','One chamber, faster laws, fewer checks.', { stability:-2 }, { elites:-8, rural:-3 }, { chambers:1 }, { ok:s => s.chambers === 2 }),
  R('create_senate','Create an elected senate','Provinces get equal seats in an upper house.', { stability:2 }, { rural:5, elites:4 }, { chambers:2 }, { ok:s => s.chambers === 1 }),
  R('devolve','Devolve powers to the provinces','Provinces control health, education and a share of taxes.', { stability:2, deficit:0.1 }, { rural:6, elites:4, army:-3 }, { federal:true }, { ok:s => !s.federal }),
  R('centralise','Recentralise power','Provincial powers return to the capital.', { stability:-3 }, { rural:-8, army:4 }, { federal:false }, { ok:s => s.federal }),
  R('term_limits_off','Remove presidential term limits','You may stand again, and again.', { approval:-5, stability:-2 }, { youth:-10, urban:-6, army:4, lenders:-6 }, { termLimits:false }, { ok:s => s.termLimits, tag:'power_grab' }),
  R('term_limits_on','Restore term limits','Two terms, written in stone.', { approval:3 }, { youth:6, urban:4 }, { termLimits:true }, { ok:s => !s.termLimits }),
  R('judiciary_up','Guarantee judicial independence','Judges appointed by a commission, tenure protected.', { approval:2, stability:1 }, { urban:4, elites:-5, lenders:4 }, { judiciary:20 }, { ok:s => s.judiciary < 80 }),
  R('pack_court','Expand and pack the supreme court','Six new judges of your choosing.', { approval:-4, stability:-3 }, { urban:-6, youth:-6, lenders:-6, elites:4 }, { judiciary:-30 }, { ok:s => s.judiciary > 20, tag:'power_grab' }),
  R('vote16','Lower the voting age to 16','Millions of new young voters.', { approval:1 }, { youth:10, clergy:-3 }, { voteAge:16 }, { ok:s => s.voteAge > 16 }),
  R('anti_defection','Anti-defection law','Members who vote against the party lose their seats.', { unity:10 }, { elites:-5 }, { antiDefection:true }, { ok:s => !s.antiDefection }),
  R('emergency','Declare a state of emergency','Parliament suspended for six months. Rule by ordinance.', { stability:5, approval:-6 }, { youth:-12, urban:-8, lenders:-8, army:6 }, { emergency:6 }, { ok:s => !s.emergency, tag:'power_grab' }),
  R('end_emergency','Lift the state of emergency','Parliament returns.', { approval:3, stability:-2 }, { youth:5, lenders:4 }, { emergency:0 }, { ok:s => s.emergency > 0 })
];
window.NSContent8 = { TECH, TECH_PROJECTS, BRANCH_ACTS, LANDLOCKED, MINISTRIES, SENATES, UNICAMERAL, REFORMS };
})();

})();
