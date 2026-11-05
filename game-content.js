/* Nation Sim v6 content: events (one per month), agenda (one per month), concessions and negotiations. */
(function(){
const O = (l, d, fx, gr, x) => Object.assign({ l, d, fx:fx || {}, gr:gr || {} }, x || {});
const E = (id, cat, w, f, x) => Object.assign({ id, cat, w, f }, x || {});
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const CATS = ['ECONOMY','SOCIETY','SECURITY','FOREIGN','POLITICS'];

/* ===================== CONCESSIONS ===================== */
const CONCESSIONS = {
  subsidy:{ name:'End energy subsidies', d:'Fuel and power sold at cost from next month.', v:35, fx:{ deficit:-0.7, approval:-5, inflation:0.8 }, gr:{ labour:-8, urban:-6 }, tags:['austerity'] },
  gst:{ name:'Raise sales tax by two points', d:'Exemptions removed, standard rate up.', v:30, fx:{ deficit:-0.8, approval:-4, inflation:0.4 }, gr:{ urban:-5, business:-3 }, tags:['austerity'] },
  retail_tax:{ name:'Tax retailers and property at market value', d:'The two biggest holes in the tax net.', v:30, fx:{ deficit:-0.5 }, gr:{ business:-8, elites:-6 }, tags:['tax_base'] },
  privatise:{ name:'Sell loss-making state companies', d:'The airline first, then power distribution.', v:25, fx:{ reserves:0.3, deficit:-0.2 }, gr:{ labour:-10, business:4 }, tags:['privatisation'], ok:X => !X.conc('no_layoffs') },
  cbi:{ name:'Central bank independence law', d:'No more central bank lending to the treasury.', v:20, fx:{}, gr:{}, law:true, mods:{ inflation:-0.5 } },
  fx_float:{ name:'Let the currency float', d:'End the managed rate and the queue for dollars.', v:30, fx:{ inflation:2, reserves:0.5, approval:-3 }, gr:{ urban:-4, business:-2 }, ok:X => !X.hard },
  spend_cut:{ name:'Cut development spending by a fifth', d:'Roads and schools wait a year.', v:25, fx:{ deficit:-0.6, growth:-0.3 }, gr:{ rural:-6, elites:-4 }, tags:['austerity'] },
  rate_hike:{ name:'Raise the policy rate by two points', d:'Inflation first, growth later.', v:20, fx:{ inflation:-1, growth:-0.4 }, gr:{ business:-6 } },
  tariff:{ name:'Rebase electricity tariffs to cost', d:'Household bills rise by a third.', v:30, fx:{ deficit:-0.4, approval:-4 }, gr:{ urban:-6, labour:-4 }, tags:['austerity'] },
  tax_target:{ name:'Legislate a revenue target of 1.5% of GDP', d:'A number in law that the Fund can hold you to.', v:25, fx:{ deficit:-0.4 }, gr:{ business:-4 } },
  pension:{ name:'Reform public pensions', d:'New hires move to a contributory scheme.', v:25, fx:{ deficit:-0.3 }, gr:{ labour:-8, army:-4 }, tags:['austerity'] },
  soe_audit:{ name:'Publish audits of every state company', d:'Losses, debts and boards made public.', v:15, fx:{}, gr:{ elites:-5 } },
  defence_budget:{ name:'Guarantee the defence budget for two years', d:'Ring-fenced from any cut.', v:30, fx:{ deficit:0.3 }, gr:{ lenders:-4 } },
  tenure:{ name:'Extend the army chief’s term', d:'A two-year extension by notification.', v:35, fx:{ stability:3, approval:-3 }, gr:{ youth:-3 }, tags:['concession_army'] },
  no_audit:{ name:'Drop the audit of military businesses', d:'Their holdings stay off the budget.', v:25, fx:{}, gr:{ lenders:-4, business:-3 }, tags:['concession_army'] },
  interior:{ name:'Give the interior ministry to a retired general', d:'A uniform at the cabinet table.', v:25, fx:{ unity:-5 }, gr:{}, tags:['concession_army'] },
  amnesty_mil:{ name:'No prosecutions over the troop movements', d:'Nobody answers for what happened.', v:30, fx:{ approval:-4 }, gr:{ youth:-5, urban:-3 }, tags:['concession_army'] },
  military_courts:{ name:'Allow military courts to try civilians', d:'For terrorism and "attacks on the state".', v:25, fx:{}, gr:{ youth:-6, urban:-4 }, tags:['crackdown'] },
  wage_index:{ name:'Index the minimum wage to inflation', d:'Automatic, every January.', v:30, fx:{ deficit:0.15 }, gr:{ business:-8 }, law:true, mods:{ inflation:0.2 } },
  no_layoffs:{ name:'No layoffs in state companies for two years', d:'Makes privatisation impossible.', v:30, fx:{}, gr:{ lenders:-6 } },
  energy_cap:{ name:'Cap household energy bills', d:'The treasury pays the difference.', v:25, fx:{ deficit:0.3, approval:2 }, gr:{ lenders:-6 }, ok:X => !X.conc('subsidy') },
  pension_protect:{ name:'Protect pension indexation', d:'Pensions rise with prices, whatever happens.', v:25, fx:{ deficit:0.15 }, gr:{ lenders:-3 }, ok:X => !X.conc('pension') },
  union_rights:{ name:'Restore union registration rights', d:'Workplaces can organise again.', v:20, fx:{}, gr:{ business:-4 } },
  public_pay:{ name:'A 10% pay rise in the public sector', d:'Teachers, nurses, clerks.', v:30, fx:{ deficit:0.4, approval:2 }, gr:{ lenders:-4 } },
  withdraw_bill:{ name:'Withdraw the contested bill', d:'Sent back to committee, where it will stay.', v:30, fx:{ approval:-1 }, gr:{ youth:-4 } },
  seminary_fund:{ name:'Fund religious schools', d:'Grants and land, no conditions.', v:25, fx:{ deficit:0.05 }, gr:{} },
  religious_ministry:{ name:'Religious affairs ministry to their nominee', d:'A portfolio with a budget and a pulpit.', v:25, fx:{ unity:-3 }, gr:{} },
  no_registration:{ name:'Drop compulsory registration of seminaries', d:'Their finances stay private.', v:25, fx:{}, gr:{ lenders:-3 } },
  faith_assurance:{ name:'A public assurance on religious law', d:'No amendment, ever, said on television.', v:20, fx:{}, gr:{ youth:-4 } },
  tax_holiday:{ name:'Three-year tax holiday for new investment', d:'Revenue forgone now for plants later.', v:30, fx:{ deficit:0.3, growth:0.1 }, gr:{ lenders:-5, labour:-3 } },
  fx_access:{ name:'Guaranteed dollar access for importers', d:'Priority at the official rate.', v:25, fx:{ reserves:-0.4 }, gr:{ lenders:-3 } },
  no_retro:{ name:'A pledge of no retrospective taxes', d:'Written into the finance act.', v:20, fx:{}, gr:{} },
  contracts:{ name:'Priority for local firms on state contracts', d:'Negotiated contracts, not open tenders.', v:25, fx:{}, gr:{ labour:-2, lenders:-3 } },
  power_discount:{ name:'Industrial electricity discount', d:'Exporters pay a third less.', v:25, fx:{ deficit:0.2, growth:0.1 }, gr:{ urban:-3 } },
  ministries:{ name:'Two more cabinet ministries', d:'Portfolios with budgets.', v:30, fx:{ unity:3 }, gr:{} },
  dev_fund:{ name:'A constituency development fund', d:'Money each member spends at home.', v:30, fx:{ deficit:0.2 }, gr:{ lenders:-3 } },
  speaker:{ name:'The speakership', d:'Control of the house calendar.', v:20, fx:{}, gr:{} },
  provincial:{ name:'Their candidate as provincial chief minister', d:'A province of their own.', v:25, fx:{}, gr:{ rural:-3 } },
  deputy_pm:{ name:'The deputy prime ministership', d:'A title and a veto in cabinet.', v:30, fx:{ unity:2 }, gr:{} },
  senate_tickets:{ name:'Senate tickets for their candidates', d:'Three seats in the upper house.', v:25, fx:{}, gr:{} },
  governorship:{ name:'A provincial governorship', d:'A governor of their choosing.', v:25, fx:{}, gr:{ rural:-2 } },
  retired_posts:{ name:'Board seats in state firms for retired officers', d:'Pensions on top of pensions.', v:25, fx:{}, gr:{ lenders:-3 }, tags:['concession_army'] },
  officer_housing:{ name:'Land for an officers’ housing scheme', d:'Prime plots on the edge of the capital.', v:25, fx:{}, gr:{ urban:-3 }, tags:['concession_army'] },
  worker_housing:{ name:'A housing fund for industrial workers', d:'Built near the factories.', v:25, fx:{ deficit:0.15 }, gr:{} },
  health_cover:{ name:'Health insurance for union members', d:'Families included.', v:20, fx:{ deficit:0.1 }, gr:{} },
  curriculum:{ name:'Their say on the school curriculum', d:'A seat on the textbook board.', v:25, fx:{}, gr:{ youth:-5 } },
  sharia_council:{ name:'A stronger role for the religious advisory council', d:'Bills referred before passage.', v:30, fx:{ unity:-2 }, gr:{ youth:-4, urban:-3 } },
  export_rebate:{ name:'Export tax rebates paid on time', d:'Arrears cleared in a quarter.', v:20, fx:{ deficit:0.15 }, gr:{} },
  case_drop:{ name:'Drop corruption cases against their members', d:'The bureau is told to slow down.', v:35, fx:{ approval:-5 }, gr:{ urban:-5, youth:-4 }, tags:['cover_up'] }
};

/* ===================== NEGOTIATIONS ===================== */
const NEGS = {
  imf_new:{ party:'lenders', pick:4, need:100, pool:['subsidy','gst','retail_tax','privatise','cbi','fx_float','tariff','tax_target'],
    who:X => 'the IMF mission', title:() => 'A new IMF programme',
    intro:X => 'The mission chief lays out four prior actions. Your reserves cover ' + X.s.reserves.toFixed(1) + ' months of imports; they know it, and so do you.',
    lever:X => ({ name:'Remind them how large your debt is', d:'Your failure would be their problem too.', v:Math.round(Math.max(0, Math.min(30, (X.s.debt - 45) * 0.6))), cost:{ rate:0.2 } }),
    yes:() => '"We have a staff-level agreement. The board will meet within the month."', no:() => '"Call us when the arithmetic changes."',
    ok:X => ({ imf:'active', fx:{ reserves:1.2, rate:-0.8, stability:2 }, out:'A 37-month programme is approved. The first tranche lands within weeks and spreads narrow.' }),
    fail:X => ({ fx:{ reserves:-0.3, rate:0.5 }, out:'Without a programme, the market prices in the risk of default.', follow:[['reserves_crisis', 2, 5]] }) },
  imf_review:{ party:'lenders', pick:4, need:70, pool:['spend_cut','rate_hike','tariff','tax_target','pension','soe_audit','gst','retail_tax','privatise'],
    who:X => 'the IMF review mission', title:() => 'A waiver for the missed review',
    intro:X => 'The primary balance is ' + (X.s.pdef > 0 ? 'a deficit of ' : 'a surplus of ') + Math.abs(X.s.pdef).toFixed(1) + '% against a target surplus of ' + (-(X.g.imf.target || 0)).toFixed(1) + '%. The mission wants new prior actions before it recommends a waiver.',
    lever:X => ({ name:'Point to your record on the programme', d:'What you have already delivered.', v:Math.min(20, Object.keys(X.g.conceded).length * 5), cost:{} }),
    yes:() => '"With these actions we can recommend a waiver to the board."', no:() => '"Then the review stays open. The tranche stays with us."',
    ok:X => ({ imf:'waiver', fx:{ reserves:0.7 }, out:'The board grants a waiver and releases the delayed tranche.' }),
    fail:X => ({ fx:{ rate:0.4 }, out:'The tranche stays frozen. One more missed review and the programme is suspended.' }) },
  imf_emergency:{ party:'lenders', pick:5, need:120, pool:['subsidy','gst','retail_tax','privatise','cbi','fx_float','tariff','tax_target','spend_cut','pension','rate_hike'],
    who:X => 'the IMF emergency mission', title:() => 'Emergency financing',
    intro:X => 'Reserves are almost gone. The Fund will lend, but only against front-loaded measures. This is the hardest bargain you will face.',
    lever:X => ({ name:'Warn that default is the alternative', d:'Credible, because it is true.', v:Math.round(Math.max(0, Math.min(35, (X.s.debt - 40) * 0.7))), cost:{ rate:0.3 } }),
    yes:() => '"Emergency financing approved. The conditions are not negotiable after today."', no:() => '"We cannot lend into this."',
    ok:X => ({ imf:'active', fx:{ reserves:1.8, rate:-0.5 }, out:'Emergency financing lands. The country steps back from default.' }),
    fail:X => ({ fx:{}, out:'No programme. Default is now a matter of weeks.', follow:[['default_brink', 1, 9]] }) },
  army_terms:{ party:'army', pick:4, need:80, pool:['defence_budget','tenure','no_audit','interior','military_courts','retired_posts','officer_housing'],
    who:X => X.gn('army'), title:() => 'Terms with the high command',
    intro:X => 'The chief receives you in his office, not yours. "The institution is concerned. We would prefer to settle this privately."' + X.recall('civil_military'),
    lever:X => ({ name:'Rally the public behind civilian rule', d:'Works only if they are with you. Approval ' + Math.round(X.s.approval) + '.', v:Math.round((X.s.approval - 40) * 1.2), cost:{ stability:-2 } }),
    yes:() => '"We have an understanding. See that you keep it."', no:() => '"We will find other ways to make our position known."',
    ok:X => ({ fx:{ stability:5 }, out:'The corps commanders stand down. The price is now part of your record.' }),
    fail:X => ({ fx:{ stability:-6 }, out:'The army leaves the room unpersuaded.', follow:[['coup', 2, 8]], tags:['civil_military'] }) },
  army_coup:{ party:'army', pick:5, need:120, pool:['defence_budget','tenure','no_audit','interior','amnesty_mil','military_courts','retired_posts','officer_housing'],
    who:X => X.gn('army'), title:() => 'Terms to stay in office',
    intro:X => 'Troops hold the broadcaster. The chief’s spokesman says you may stay, "with conditions". This is the last negotiation of your government or the first of a weaker one.',
    lever:X => ({ name:'Tell them the crowds are coming', d:'Approval ' + Math.round(X.s.approval) + '. If they do not come, you are finished.', v:Math.round((X.s.approval - 45) * 1.5), cost:{ stability:-4 } }),
    yes:() => '"Troops will return to barracks tonight."', no:() => '"Then we will take responsibility for the nation ourselves."',
    ok:X => ({ fx:{ stability:8, approval:-6 }, out:'You keep the office. You no longer keep all of its powers.', tags:['coup_terms'] }),
    fail:X => ({ fall:'coup', out:'The high command announces a caretaker government.' }) },
  labour_strike:{ party:'labour', pick:4, need:80, pool:['wage_index','no_layoffs','energy_cap','pension_protect','union_rights','public_pay','worker_housing','health_cover'],
    who:X => X.gn('labour'), title:() => 'Ending the general strike',
    intro:X => 'The federation insists the meeting be minuted. "Our members are already paying for this crisis. Tell us why they should pay more."' + X.recall('austerity'),
    lever:X => ({ name:'Go on television and speak to the workers directly', d:'Approval ' + Math.round(X.s.approval) + '.', v:Math.round((X.s.approval - 42) * 1), cost:{} }),
    yes:() => '"The strike is suspended. Keep your word."', no:() => '"Then the ports stay shut."',
    ok:X => ({ fx:{ approval:2, growth:0.1 }, out:'Ports and railways reopen on Monday.' }),
    fail:X => ({ fx:{ growth:-0.6, approval:-3 }, out:'The strike rolls into a second week.', follow:[['strike_return', 3, 3]] }) },
  clergy_march:{ party:'clergy', pick:4, need:75, pool:['withdraw_bill','seminary_fund','religious_ministry','no_registration','faith_assurance','curriculum','sharia_council'],
    who:X => X.gn('clergy'), title:() => 'Calling the march home',
    intro:X => 'Their delegation arrives with a written list. "We are not here to bargain over faith. We are here to hear what you will do."',
    lever:X => ({ name:'Warn that the state will clear the roads', d:'Credible only with a stable state behind you.', v:Math.round((X.s.stability - 45) * 1), cost:{ stability:-2 } }),
    yes:() => '"We will tell the faithful to go home."', no:() => '"The faithful will stay."',
    ok:X => ({ fx:{ stability:3 }, out:'The march disperses after Friday prayers.' }),
    fail:X => ({ fx:{ stability:-6, approval:-2, growth:-0.2 }, out:'The capital is blocked for another week.', follow:[['march_return', 3, 3]] }) },
  business_reset:{ party:'business', pick:4, need:75, pool:['tax_holiday','fx_access','no_retro','contracts','power_discount','export_rebate'],
    who:X => X.gn('business'), title:() => 'Resetting the investment climate',
    intro:X => 'Heads of the six largest groups and a slide deck. "Give us predictability and we will give you investment."',
    lever:X => ({ name:'Threaten tax audits of the largest groups', d:'Leverage, at the cost of the climate.', v:12, cost:{ growth:-0.1 } }),
    yes:() => '"We will announce new investment this quarter."', no:() => '"We will invest elsewhere."',
    ok:X => ({ fx:{ growth:0.3, reserves:0.3 }, out:'Three groups announce new plants.' }),
    fail:X => ({ fx:{ growth:-0.3, reserves:-0.2 }, out:'Investment plans go on hold.' }) },
  coalition:{ party:'elites', pick:4, need:80, pool:['ministries','dev_fund','speaker','provincial','case_drop','deputy_pm','senate_tickets','governorship'],
    who:X => X.partner ? X.partner.name + ' (' + X.partner.leader + ')' : X.gn('elites'), title:X => 'Keeping ' + (X.partner ? X.partner.short : 'the coalition') + ' on board',
    intro:X => (X.partner ? X.partner.leader + ' controls ' + X.partner.seats + ' seats' : 'The barons control the votes you need') + '. "We have been loyal. Loyalty has a price."',
    lever:X => ({ name:'Threaten an early election', d:'Only frightening if you would win it.', v:Math.round((X.s.approval - 42) * 1.3), cost:{} }),
    yes:() => '"You have our votes."', no:() => '"Then count without us."',
    ok:X => ({ fx:{ unity:10 }, out:'The coalition holds.' }),
    fail:X => ({ fx:{ unity:-12 }, seats:X.partner ? -X.partner.seats : -20, out:'The partner crosses the floor. You govern as a minority.' }) }
};

/* ===================== EVENTS ===================== */
const EVENTS = [
  E('ai_dyn', 'POLITICS', X => 0, X => { const d = X.g.dynNow || { title:'A developing situation', body:'', opts:[{ l:'Wait and see', d:'', fx:{}, gr:{}, out:'Nothing comes of it.' }] }; return { title:d.title, body:d.body, why:'CONSEQUENCE OF YOUR DECISIONS', opts:d.opts.map(o => ({ ...o, rem:'chose to ' + o.l.charAt(0).toLowerCase() + o.l.slice(1) })) }; }, { ok:X => !!X.g.dynNow }),
  E('quiet', 'POLITICS', X => 0, X => ({ title:'A quiet month', body:'No crisis has reached your desk. Your chief of staff suggests using the time.', opts:[
    O('Tour ' + X.P, 'Be seen.', { approval:1.5 }, { rural:3 }, { out:'Good pictures, warm crowds.' }),
    O('Hold a cabinet retreat', 'Discipline the team.', { unity:4 }, {}, { out:'Ministers leave with a single message.' }),
    O('Visit the troops', 'A uniform in every frame.', { stability:2 }, { army:4 }, { out:'The General Staff appreciates it.' }) ] })),

  /* --- debt & IMF --- */
  E('imf_ultimatum', 'ECONOMY', X => 0, X => ({ title:'The central bank governor asks to see you tonight', body:'Reserves cover ' + X.s.reserves.toFixed(1) + ' months of imports. The next bond falls due in eleven weeks. Without help, the rating agencies will move within the month.' + (X.PK ? ' This would be Pakistan’s twenty-fifth Fund programme.' : X.AR ? ' Argentina is already the Fund’s largest debtor.' : ''), why:'RESERVES BELOW 2.6 MONTHS', opts:[
    O('Invite the IMF mission', 'Negotiate a programme.', {}, {}, { neg:'imf_new' }),
    O('Ask friendly governments for deposits', 'Buys a few months.', { reserves:1, debt:1 }, { lenders:-3 }, { out:'Deposits arrive from two friendly capitals. They will want them back.', follow:[['deposit_due', 10]], rem:'borrowed central bank deposits from friendly governments', tags:['deposits'] }),
    O('Have the central bank print', 'Fast money, slow poison.', { inflation:3, reserves:0.3 }, { lenders:-15, urban:-4 }, { out:'The treasury is funded. The currency is not.', tags:['monetisation'], rem:'had the central bank print money' }) ] })),
  E('imf_review', 'ECONOMY', X => 0, X => ({ title:'The IMF review has failed', body:'The mission has gone home without signing. The tranche is withheld until new prior actions are taken. The primary balance is ' + (-X.s.pdef).toFixed(1) + '% against a target of ' + (-(X.g.imf.target || 0)).toFixed(1) + '%.', why:'QUARTERLY REVIEW MISSED', opts:[
    O('Negotiate a waiver', 'They will want new actions, not old ones.', {}, {}, { neg:'imf_review' }),
    O('Pass an emergency mini-budget', 'Cuts and taxes, this week.', { deficit:-0.9, approval:-5, growth:-0.2 }, { lenders:8, urban:-5, labour:-4 }, { imf:'waiver', out:'The mini-budget passes at midnight. The Fund signs off.', tags:['austerity'], rem:'passed an emergency mini-budget' }),
    O('Let the programme lapse', 'Sovereignty, and a closed market.', { approval:2, rate:1 }, { lenders:-15 }, { imf:'lapse', out:'The programme lapses. Spreads widen by two points.', rem:'let the IMF programme lapse', tags:['imf_lapse'] }) ] })),
  E('imf_suspended', 'ECONOMY', X => 0, X => ({ title:'The IMF has suspended your programme', body:'Two reviews missed. Disbursements have stopped and the rating agencies have you on watch.', why:'SECOND MISSED REVIEW', opts:[
    O('Request a new programme', 'From a weaker position.', {}, {}, { neg:'imf_new' }),
    O('Go it alone', 'Bilateral friends and hope.', { approval:2, rate:0.5 }, { lenders:-8 }, { out:'You tell the country the Fund is no longer needed. The market disagrees.', imf:'lapse' }) ] })),
  E('reserves_crisis', 'ECONOMY', X => 0, X => ({ title:'Reserves are running out', body:'Import cover is ' + X.s.reserves.toFixed(1) + ' months. Banks are rationing letters of credit; fuel cargoes are waiting offshore.' + X.recall('imf_lapse'), why:'RESERVES BELOW 1.6 MONTHS', opts:[
    O('Emergency talks with the IMF', 'The hardest negotiation you will face.', {}, {}, { neg:'imf_emergency' }),
    O('Impose import controls', 'Only essentials get dollars.', { reserves:0.6, growth:-0.8, inflation:2, approval:-4 }, { business:-10, urban:-5 }, { out:'Queues for medicine and car parts. Reserves stabilise.', rem:'imposed import controls', tags:['controls'] }),
    O('Sell state assets to Gulf funds', 'Cash now, below value.', { reserves:0.8, approval:-2 }, { labour:-8, lenders:3 }, { out:'A stake in the national refinery is sold over a weekend.', rem:'sold state assets in a hurry', tags:['privatisation'] }) ] })),
  E('default_brink', 'ECONOMY', X => 0, X => ({ title:'You cannot make the next payment', body:'A coupon of several hundred million dollars is due on Friday. Reserves will not cover it and fuel imports.', why:'RESERVES EXHAUSTED', opts:[
    O('Default and restructure', 'Two years outside the market.', {}, {}, { defaultNow:true, out:'You suspend payments. The currency loses a third. Creditors are offered a 30% haircut.', rem:'defaulted on the external debt' }),
    O('Last-chance IMF talks', 'Everything on the table.', {}, {}, { neg:'imf_emergency' }),
    O('Pay the bond, ration fuel', 'Honour the debt, darken the country.', { reserves:-0.2, growth:-1.5, approval:-8, stability:-6 }, { lenders:6, urban:-10 }, { out:'The bond is paid. Twelve-hour power cuts begin on Monday.', follow:[['default_brink', 2, 9]] }) ] })),
  E('deposit_due', 'FOREIGN', X => 0, X => ({ title:'The friendly deposits fall due', body:'The central bank deposits you borrowed must be repaid or rolled. The lender has a request: a port concession and a vote at the UN.' + X.recall('deposits'), why:'FOLLOW-UP', opts:[
    O('Roll them over, accept the request', 'Reserves kept; a strategic asset pledged.', { stability:-1 }, { lenders:-2 }, { out:'The deposits roll for a year. The port changes hands quietly.', rem:'pledged a port concession to roll over deposits', tags:['foreign_concession'] }),
    O('Repay from reserves', 'Clean and painful.', { reserves:-1, debt:-1 }, { lenders:4 }, { out:'Repaid in full. Reserves take the hit.' }),
    O('Roll at a higher rate', 'Costlier, fewer strings.', { rate:0.2 }, {}, { out:'Rolled at a premium.' }) ] })),
  E('downgrade', 'ECONOMY', X => 0, X => ({ title:'Rating agency cuts your rating', body:'The agency cites "a weakening policy anchor".' + X.recall('monetisation') + X.recall('default'), why:'RATING DOWNGRADE', opts:[
    O('Announce a consolidation path', 'Markets want an anchor.', { rate:-0.3, deficit:-0.3, approval:-2 }, { lenders:6 }, { out:'A three-year path is published. Spreads stabilise.', tags:['austerity'], rem:'announced a fiscal consolidation path' }),
    O('Attack the agency', 'Popular for a day.', { approval:2, rate:0.2 }, { lenders:-6 }, { out:'Your speech trends. Your bonds fall.' }),
    O('Say nothing', 'The market reprices anyway.', { rate:0.15 }, {}, { out:'Silence, and wider spreads.' }) ] })),
  E('eurobond', 'ECONOMY', X => X.hard ? 0 : (X.s.reserves > 2.5 && X.rate < 11 ? 6 : 0), X => ({ title:'Bankers say the bond window is open', body:'Demand would be three times covered at around ' + (X.rate + 1).toFixed(1) + '%. The last time, the window closed within a month.', opts:[
    O('Issue a dollar bond', 'Reserves up, coupon owed for a decade.', { reserves:1.2, debt:1.2, rate:0.1 }, { lenders:2 }, { out:'Priced and settled. The coupon is now part of every budget until 2036.' }),
    O('Use it to refinance short debt', 'Longer maturity, same stock.', { rate:-0.2 }, { lenders:4 }, { out:'Short debt swapped for ten-year paper.' }),
    O('Pass', 'No new debt.', {}, {}, { out:'The window stays open for someone else.' }) ] })),
  E('fuel_prices', 'ECONOMY', X => 10, X => ({ title:'Oil spikes to a two-year high', body:'Every dollar on a barrel adds to the import bill. Your energy minister wants a decision on pump prices by Friday.' + (X.conc('subsidy') ? ' You ended the fuel subsidy in ' + window.NSG.dateOf(X.g.conceded.subsidy) + '; prices will move automatically unless you intervene.' : ''), opts:[
    O('Absorb it in the budget', 'Prices frozen.', { deficit:0.4, approval:2 }, { lenders:-6, urban:3 }, { out:'Pump prices stay put. The deficit does not.' }),
    O('Pass it on to consumers', 'Prices up 15%.', { inflation:1, approval:-4 }, { lenders:5, labour:-6, urban:-4 }, { out:'Queues at the pumps the night before the rise.', follow:[['general_strike', 2]], tags:['austerity'], rem:'passed oil prices on to consumers' }),
    O('Targeted cash for poor households', 'Prices up, the poorest protected.', { deficit:0.15, inflation:0.6, approval:-1 }, { lenders:2, rural:3 }, { out:'Eight million families receive a top-up by text message.' }) ] })),
  E('capital_flight', 'ECONOMY', X => 0, X => ({ title:'Money is leaving the country', body:'Exporters are holding dollars abroad; households are buying gold. The central bank sold a month of reserves in a week.', why:'BUSINESS CONFIDENCE COLLAPSED', opts:[
    O('Meet the chambers and reset', 'Negotiate.', {}, {}, { neg:'business_reset' }),
    O('Impose capital controls', 'Flight slows, a black market opens.', { reserves:0.6, growth:-0.4 }, { business:-8, lenders:-6 }, { out:'Dollar purchases now need a licence.', law:{ id:'capital_controls', name:'Capital controls', desc:'Licences for foreign exchange.', mods:{ growth:-0.2 } }, rem:'imposed capital controls', tags:['controls'] }),
    O('Raise rates three points', 'Defend the currency.', { inflation:-0.8, growth:-0.8, approval:-3 }, { business:-4, lenders:6 }, { out:'The currency steadies. Builders stop building.' }) ] })),
  E('bank_run', 'ECONOMY', X => X.s.reserves < 2.5 || X.s.stability < 40 ? 4 : 1, X => ({ title:'Queues outside the second-largest bank', body:'A rumour online and a real hole in its balance sheet. The bank holds a tenth of your treasury bills.', opts:[
    O('Guarantee all deposits', 'Queues vanish, liability moves to you.', { debt:2, stability:3 }, { business:4, urban:4 }, { out:'The queues disperse within an hour of the announcement.' }),
    O('Nationalise the bank', 'Shareholders wiped out.', { debt:1, stability:1 }, { business:-6, lenders:-2 }, { out:'The state now owns a bank. And its losses.' }),
    O('Withdrawal limits', 'Panic contained by decree.', { stability:-4, approval:-5 }, { urban:-8, business:-5 }, { out:'Cash machines dispense a fixed amount per week.', tags:['controls'] }) ] })),
  E('tax_amnesty', 'ECONOMY', X => 6, X => ({ title:'Business wants a tax amnesty', body:'Declare hidden assets at 5% and no questions asked.' + (X.tag('amnesty') ? ' This would be your second.' : ''), opts:[
    O('Grant it', 'Revenue now, credibility later.', { deficit:-0.15 }, { business:8, lenders:-6, urban:-3 }, { out:'Collections disappoint. Everyone learns to wait for the next one.', tags:['amnesty'], rem:'granted a tax amnesty' }),
    O('Refuse and fund the tax office', 'Slow enforcement instead.', { deficit:-0.1 }, { business:-5, lenders:4 }, { out:'Five hundred new auditors are hired.' }),
    O('A narrow scheme at 15%, names published', 'The Fund can live with it.', { deficit:-0.1 }, { business:2, lenders:1 }, { out:'Modest take-up, honest numbers.' }) ] })),
  E('min_wage', 'ECONOMY', X => X.has('labour') ? 6 + (X.s.inflation > 8 ? 6 : 0) : 0, X => ({ title:'Minimum wage review due', body:'Prices are up ' + X.s.inflation.toFixed(1) + '% on the year. The unions want 30%. Business wants nothing.' + (X.law('wage_index') ? ' Indexation already covers inflation.' : ''), opts:[
    O('Match inflation', 'Defensible both ways.', { approval:1, deficit:0.05 }, { labour:5, business:-2 }, { out:'The tripartite board agrees in a single session.' }),
    O('Raise it 30%', 'Popular, inflationary.', { approval:4, inflation:0.6, unemp:0.4 }, { labour:12, business:-12, lenders:-4 }, { out:'Celebrations in industrial towns; small firms move workers off the books.', rem:'raised the minimum wage by 30%' }),
    O('Freeze it', 'The Fund approves.', { approval:-3 }, { labour:-12, lenders:4 }, { out:'The unions call it a declaration of war.', follow:[['general_strike', 2]], tags:['austerity'], rem:'froze the minimum wage' }) ] })),
  E('price_cartel', 'ECONOMY', X => 6 + (X.s.inflation > 6 ? 6 : 0), X => ({ title:(X.PK ? 'Sugar' : 'Flour') + ' prices up 40% in a month', body:'The mills are hoarding stock. The competition authority names several owners, some of whom sit on your benches.', opts:[
    O('Raid the warehouses', 'Prices fall; allies are furious.', { inflation:-0.4, approval:4, unity:-5 }, { elites:-10, business:-5, urban:5 }, { out:'Twelve warehouses sealed. Two of your members stop taking your calls.', tags:['reform'], rem:'raided the price cartel' }),
    O('Import duty-free', 'Prices ease, profits kept.', { inflation:-0.25, reserves:-0.2 }, { urban:2 }, { out:'Ships unload in a fortnight.' }),
    O('Do a deal with the mill owners', 'A cap in exchange for export quotas.', { inflation:-0.2 }, { elites:5, business:3, urban:-2 }, { out:'A price cap, and next season’s export permits.' }) ] })),
  E('remittances', 'ECONOMY', X => X.PK || X.LK || X.EG || X.N === 'Bangladesh' || X.N === 'Philippines' ? 6 : 2, X => ({ title:'Remittances move to informal channels', body:'The gap between the official and street rates has widened. Formal inflows are down 15%.', opts:[
    O('Bonus rate for remittances', 'Pay a premium to bring them back.', { deficit:0.05, reserves:0.4 }, {}, { out:'Inflows recover by the next month.' }),
    O('Crack down on hawala dealers', 'Enforcement.', { reserves:0.2 }, { business:-2 }, { out:'Arrests, and a smaller informal market.' }),
    O('Let the rate adjust', 'Close the gap by devaluing.', { inflation:1, reserves:0.5 }, { urban:-3, lenders:4 }, { out:'The gap closes. Prices rise.' }) ] })),
  E('gas_find', 'ECONOMY', X => 3, X => ({ title:'Offshore gas discovery confirmed', body:'Commercially viable, in about six years. Three majors want the licence; the state company wants to keep it.', opts:[
    O('Auction to the majors', 'Fast, foreign profits.', { reserves:0.3, growth:0.2 }, { business:4, lenders:3 }, { out:'Signing bonuses arrive this quarter.', law:{ id:'gas_auction', name:'Offshore gas licences', desc:'Production expected within six years.', mods:{ growth:0.15 } } }),
    O('State company develops it', 'Slow, sovereign.', { approval:2 }, { labour:3 }, { out:'Flags at the press conference. First gas, maybe 2033.' }),
    O('Create a sovereign wealth fund first', 'Rules before money.', { stability:2 }, { lenders:4 }, { out:'A fund law passes before the first barrel.' }) ] })),
  E('pension_bill', 'ECONOMY', X => X.conc('pension') ? 0 : 4, X => ({ title:'The pension bill is the fastest-growing line in the budget', body:'Finance wants new hires on a contributory scheme and a later retirement age.' + (X.has('army') ? ' The army wants its pensions excluded.' : ''), opts:[
    O('Full reform, including the military', 'Biggest saving, most enemies.', { deficit:-0.4, approval:-3 }, { army:-10, labour:-8, lenders:8 }, { out:'Passed by eleven votes.', concede:['pension'], tags:['austerity'], rem:'reformed pensions including the military' }),
    O('Civilians only', 'Half the saving.', { deficit:-0.2, approval:-2 }, { labour:-8, lenders:4 }, { out:'The army is untouched; the unions notice.', concede:['pension'], rem:'reformed civilian pensions' }),
    O('Defer it', 'The bill grows.', { deficit:0.05 }, { lenders:-3 }, { out:'Deferred to next year.' }) ] })),

  /* --- labour, society --- */
  E('general_strike', 'SOCIETY', X => X.has('labour') ? (X.sup('labour') < 35 ? 6 : 1) : 0, X => ({ title:'General strike called for Monday', body:'Ports, railways and power stations, for 48 hours at least.' + X.recall('austerity'), why:X.sup('labour') < 25 ? 'UNIONS HOSTILE' : '', opts:[
    O('Open talks with the federation', 'Find the price of Monday.', {}, {}, { neg:'labour_strike' }),
    O('Essential services order', 'Strikes become illegal.', { stability:-3, growth:-0.2 }, { labour:-18, business:4 }, { out:'Arrests at the docks. The strike breaks, the anger does not.', tags:['crackdown'], rem:'banned strikes by decree', follow:[['strike_return', 4]] }),
    O('Wait it out', 'Strikes end eventually.', { growth:-0.4, approval:-2 }, { labour:-4 }, { out:'Three lost days of output.' }) ] }), { ok:X => X.has('labour') }),
  E('strike_return', 'SOCIETY', X => 0, X => ({ title:'The unions are back, angrier', body:X.gn('labour').charAt(0).toUpperCase() + X.gn('labour').slice(1) + ' say nothing has changed.' + X.recall('crackdown'), why:'FOLLOW-UP', opts:[
    O('Negotiate properly this time', 'They want something new.', {}, {}, { neg:'labour_strike' }),
    O('Arrest the leadership', 'Ends it. Makes martyrs.', { stability:-4, approval:-3 }, { labour:-15, youth:-4 }, { out:'The federation’s leaders are detained.', tags:['crackdown'], rem:'arrested the union leadership' }),
    O('A one-off bonus for public workers', 'Buy a quiet year.', { deficit:0.3, approval:1 }, { labour:8, lenders:-4 }, { out:'The strike is called off.' }) ] }), { ok:X => X.has('labour') }),
  E('public_pay', 'SOCIETY', X => 5 + (X.s.inflation > 7 ? 5 : 0), X => ({ title:'Teachers and nurses walk out', body:'Pay has lost a quarter of its value. Schools in ' + X.P + ' have closed for a week.', opts:[
    O('Award 15%', 'Schools reopen.', { deficit:0.3, approval:3 }, { labour:8, urban:3, lenders:-5 }, { out:'Classrooms open on Monday.' }),
    O('Award 6% with productivity terms', 'A compromise.', { deficit:0.1 }, { labour:2 }, { out:'Accepted, grudgingly.' }),
    O('Nothing this year', 'Hold the line.', { approval:-3 }, { labour:-10, urban:-3, lenders:3 }, { out:'Schools stay shut for a month.', tags:['austerity'], rem:'refused a public pay award' }) ] })),
  E('youth_protest', 'SOCIETY', X => 3 + (X.s.unemp > 9 ? 4 : 0), X => ({ title:'Students occupy the main university', body:'Fees up, jobs gone, visas refused. The youth wing of ' + X.opp.name + ' is there.', opts:[
    O('Meet their representatives', 'A grant scheme announced.', { deficit:0.05, approval:2 }, { youth:8 }, { out:'Scholarships for 50,000 students.' }),
    O('Clear the campus', 'Order restored.', { stability:1, approval:-3 }, { youth:-14, urban:-3 }, { out:'Tear gas on the lawns. The photos travel.', tags:['crackdown'], rem:'cleared a student occupation by force' }),
    O('A youth jobs guarantee', 'Big promise, big bill.', { deficit:0.4, approval:3, unemp:-0.3 }, { youth:12, lenders:-5 }, { out:'Applications open next month.', law:{ id:'youth_jobs', name:'Youth jobs guarantee', desc:'Six months’ paid work for every graduate.', mods:{ unemp:-0.3 } } }) ] })),
  E('epidemic', 'SOCIETY', X => 3, X => ({ title:'Dengue outbreak in ' + X.P, body:'Thirty thousand cases in a fortnight. Hospitals are full.', opts:[
    O('Emergency response', 'Field hospitals and fumigation.', { deficit:0.1, approval:3 }, { urban:4 }, { out:'Cases peak within three weeks.' }),
    O('Leave it to the province', 'Constitutionally correct.', { approval:-3 }, { urban:-4, rural:-3 }, { out:'Cases double.', tags:['neglect'], rem:'left a dengue outbreak to the province', follow:[['neglect_return', 4]] }),
    O('Ask donors for help', 'Slower, cheaper.', { approval:1 }, {}, { out:'Kits arrive in ten days.' }) ] })),
  E('journalist', 'SOCIETY', X => 4, X => ({ title:'A prominent journalist has been detained', body:'Picked up at night, no charges. The journalist had been reporting on ' + (X.has('army') ? 'the army’s businesses' : 'your coalition’s finances') + '.', opts:[
    O('Order the release, publicly', 'The press thanks you.', { approval:2 }, { army:-6, youth:4, urban:3 }, { out:'Released by morning.', rem:'ordered a journalist’s release' }),
    O('Let the courts decide', 'Weeks in custody.', { approval:-1 }, { youth:-2 }, { out:'Bail is granted after a month.' }),
    O('Defend the detention', 'National security.', { approval:-3 }, { army:6, youth:-8, urban:-4 }, { out:'Press unions boycott your briefings.', tags:['crackdown'], rem:'defended a journalist’s detention' }) ] })),
  E('social_reform', 'SOCIETY', X => X.has('clergy') ? 4 : 2, X => ({ title:'Court strikes down a child marriage restriction', body:'The religious bench calls the law un-Islamic; the high court says it binds. Parliament must decide.', opts:[
    O('Legislate a minimum age of 18', 'Right, and contested.', { approval:2 }, { clergy:-12, youth:6, urban:4 }, { out:'Passed with cross-party support.', law:{ id:'marriage_age', name:'Minimum marriage age of 18', desc:'National, enforceable.', mods:{} }, tags:['social_reform'], rem:'legislated a minimum marriage age' }),
    O('Refer it to the religious council', 'Two years minimum.', { approval:-1 }, { clergy:6, youth:-4 }, { out:'Referred.' }),
    O('Leave it to the provinces', 'A patchwork.', {}, {}, { out:'Two provinces legislate, two do not.' }) ] }), { ok:X => /Pakistan|Bangladesh|Egypt|Nigeria|Indonesia|Afghan|Iran|Yemen|Niger|Mali/.test(X.N) }),
  E('march', 'SOCIETY', X => X.has('clergy') ? (X.sup('clergy') < 35 ? 5 : 1) : 0, X => ({ title:'Religious party marches on ' + X.cap, body:'Forty thousand on the expressway with a list of demands. They say they will not leave.' + X.recall('social_reform'), why:X.sup('clergy') < 25 ? 'CLERGY HOSTILE' : '', opts:[
    O('Negotiate with the leadership', 'What will send them home?', {}, {}, { neg:'clergy_march' }),
    O('Clear the expressway', 'Done by morning.', { stability:-4, approval:-2 }, { clergy:-18, urban:3 }, { out:'Remembered for years.', tags:['crackdown'], rem:'cleared a religious march by force' }),
    O('Sign their demands', 'Ends it today.', { approval:-3, unity:-4 }, { clergy:16, youth:-6 }, { out:'Every group in the country reads the price.', tags:['concession_clergy'], rem:'signed a religious march’s demands' }) ] }), { ok:X => X.has('clergy') }),
  E('march_return', 'SOCIETY', X => 0, X => ({ title:'The marchers return', body:'The sit-in resumes outside parliament.', why:'FOLLOW-UP', opts:[
    O('Negotiate', 'A second attempt.', {}, {}, { neg:'clergy_march' }),
    O('Arrest the organisers', 'Decisive.', { stability:-3 }, { clergy:-12 }, { out:'The organisers are detained.', tags:['crackdown'] }),
    O('Concede one demand', 'A face-saver.', { approval:-1 }, { clergy:6 }, { out:'The sit-in ends.' }) ] }), { ok:X => X.has('clergy') }),

  /* --- security --- */
  E('coup_rumour', 'SECURITY', X => 0, X => ({ title:'Corps commanders met without the defence minister', body:'The readout is two lines long. The second line mentions "the direction of the government".' + X.recall('civil_military'), why:'ARMY TRUST BELOW 25', opts:[
    O('Request a meeting with the chief', 'Find out the price.', {}, {}, { neg:'army_terms' }),
    O('Name the meeting in parliament', 'Public opinion as armour.', { approval:X.s.approval > 45 ? 4 : -2, stability:-5 }, { army:-15, youth:5 }, { out:'The house gives you a standing ovation. The General Staff does not.', tags:['civil_military'], rem:'denounced the corps commanders in parliament', follow:X.s.approval < 45 ? [['coup', 3, 8]] : [] }),
    O('Reshuffle the defence ministry', 'Buys a month.', { unity:-3 }, { army:4 }, { out:'A new minister, the same mood.' }) ] }), { ok:X => X.has('army') }),
  E('coup', 'SECURITY', X => 0, X => ({ title:'Troops at the state broadcaster', body:'Test card since four this morning. A brigade holds the airport road. The chief has not appeared; his spokesman asks you to "consider your position".', why:'THE ARMY HAS MOVED', opts:[
    O('Negotiate terms', 'Keep the office, lose powers.', {}, {}, { neg:'army_coup' }),
    O('Call people into the streets', X.s.approval > 50 ? 'They might come.' : 'Approval is ' + Math.round(X.s.approval) + '. They might not.', X.rnd('street') < (X.s.approval - 25) / 50 ? { approval:8, stability:-6 } : {}, X.rnd('street') < (X.s.approval - 25) / 50 ? { army:-25, youth:10 } : {}, X.rnd('street') < (X.s.approval - 25) / 50 ? { out:'The crowds come. The rank and file will not fire. The brigade withdraws.', rem:'faced down a coup with crowds' } : { fall:'coup', out:'The crowds are too small. By evening the chief is on television.' }),
    O('Resign and call elections', 'Constitutional and final.', {}, {}, { fall:'resign', out:'You resign the same night.' }) ] }), { ok:X => X.has('army') }),
  E('chief_tenure', 'SECURITY', X => X.has('army') && X.m >= 5 ? (X.PK ? 14 : 3) : 0, X => ({ title:'The army chief’s term ends in four months', body:'Nobody has asked you formally. Everybody is waiting.' + (X.PK ? ' Every Pakistani prime minister since 1990 has faced this decision; several lost office over it.' : ''), opts:[
    O('Extend him two years', 'Grateful army, angry courts.', { stability:3, approval:-3 }, { army:14, youth:-4 }, { out:'The notification is signed at midnight.', concede:['tenure'], tags:['concession_army'], rem:'extended the army chief’s term' }),
    O('Appoint the senior-most general', 'By the book.', { stability:1 }, { army:-3 }, { out:'Convention holds.' }),
    O('Appoint your own choice', 'A loyal chief, a bypassed corps.', { stability:-3 }, { army:-10 }, { out:'Three generals resign the next day.', tags:['civil_military'], rem:'picked an army chief out of turn', follow:[['coup_rumour', 6]] }) ] }), { once:true, ok:X => X.has('army') }),
  E('border_clash', 'SECURITY', X => 5, X => ({ title:'Exchange of fire on the border', body:'Two soldiers dead. The other side says you fired first.', opts:[
    O('Measured retaliation', 'Rallies the country.', { approval:4, stability:-1 }, { army:8 }, { out:'Artillery for an hour, then silence.' }),
    O('Call their leader', 'Statesmanlike, weak at home.', { approval:-2, stability:2 }, { army:-5 }, { out:'A hotline call defuses it.' }),
    O('Refer it to the UN', 'Slow and safe.', { approval:-1 }, {}, { out:'Observers arrive in a week.' }) ] })),
  E('terror_attack', 'SECURITY', X => X.mil || X.PK || /Nigeria|Afghan|Iraq|Syria|Somalia|Mali|Niger|Burkina|Kenya|Egypt/.test(X.N) ? 7 : 2, X => ({ title:'Bombing at a market in ' + X.P3, body:'Thirty-one dead. A banned group claims it.', opts:[
    O('Launch a military operation', 'Clear the hideouts.', { stability:2, approval:3, deficit:0.15 }, { army:8, rural:-4 }, { out:'Operations begin within 48 hours.', tags:['operation'], rem:'launched a military operation in ' + X.P3 }),
    O('Intelligence-led arrests', 'Quiet and slower.', { stability:1 }, { army:2 }, { out:'Fourteen arrests in three cities.' }),
    O('Talks with tribal elders', 'A political track.', { approval:-2 }, { army:-6, rural:4 }, { out:'Elders agree to hand over suspects.' }) ] })),
  E('insurgency', 'SECURITY', X => X.PK || /Nigeria|India|Myanmar|Ethiopia|Colombia|Philippines|Mali|Sudan|Cameroon|Mozambique/.test(X.N) ? 6 : 1, X => ({ title:'Insurgents ambush a convoy in ' + X.P3, body:'Twenty-two dead on the highway. The group names the province’s grievances as the cause.' + X.recall('operation'), opts:[
    O('Full military operation', 'Clears the highway, fills the camps.', { stability:2, deficit:0.15 }, { army:8, rural:-6 }, { out:'The highway reopens under escort.', tags:['operation','crackdown'], rem:'launched a military operation in ' + X.P3 }),
    O('Development surge for ' + X.P3, 'Roads and jobs, a slow peace.', { deficit:0.25, approval:1 }, { rural:6 }, { out:'Projects announced. Violence dips.', law:{ id:'dev_surge', name:'Development surge for ' + X.P3, desc:'Roads, schools, jobs.', mods:{ growth:0.05 } } }),
    O('Open talks', 'Risky and right.', { approval:-2, stability:1 }, { army:-8 }, { out:'A ceasefire, for now.' }) ] })),
  E('internet', 'SECURITY', X => X.s.stability < 45 ? 5 : 1, X => ({ title:'Interior wants to shut mobile internet', body:'Protest organisers coordinate on messaging apps. A shutdown costs millions a day in commerce.', opts:[
    O('Shut it down', 'Protests lose coordination.', { stability:2, growth:-0.15 }, { youth:-10, business:-5, army:3 }, { out:'Three days dark.', tags:['crackdown'], rem:'shut down the internet' }),
    O('Throttle social media only', 'Half measures.', { growth:-0.05 }, { youth:-4 }, { out:'VPN downloads spike.' }),
    O('Refuse', 'Order is harder.', { stability:-2 }, { youth:4, army:-3 }, { out:'The protests go on, livestreamed.' }) ] })),

  /* --- politics --- */
  E('scandal', 'POLITICS', X => 6, X => ({ title:'Your finance minister named in an offshore leak', body:'Three companies in the Caribbean and a flat in London.', opts:[
    O('Sack the minister', 'Clean, costly.', { approval:3, unity:-5 }, { elites:-6, urban:3 }, { out:'Resignation by lunchtime.', rem:'sacked a minister over a leak' }),
    O('Protect the minister', 'Loyalty rewarded.', { approval:-4 }, { elites:5, urban:-4, youth:-4 }, { out:'The minister stays. The story stays too.', tags:['cover_up'], rem:'protected a minister named in a leak', follow:[['scandal_return', 4]] }),
    O('Independent inquiry', 'Process.', { approval:1, unity:-2 }, {}, { out:'A retired judge is appointed.' }) ] })),
  E('scandal_return', 'POLITICS', X => 0, X => ({ title:'New documents in the minister’s case', body:'Bank statements this time.' + X.recall('cover_up'), why:'FOLLOW-UP', opts:[
    O('Sack him now', 'Late, but done.', { approval:1, unity:-4 }, { elites:-4 }, { out:'Gone. The opposition asks why it took so long.' }),
    O('Keep protecting him', 'Doubling down.', { approval:-6 }, { urban:-6, youth:-6 }, { out:'Protests outside his house.', tags:['cover_up'] }),
    O('Attack the leakers', 'Change the subject.', { approval:-2 }, { youth:-4 }, { out:'It does not change.' }) ] })),
  E('opposition_case', 'POLITICS', X => X.opp && X.opp.seats ? 5 : 0, X => ({ title:X.opp.leader.split(' (')[0] + ' faces a verdict', body:X.opp.name + ' holds ' + X.opp.seats + ' seats. ' + (X.opp.record || 'Its supporters say the case is political.') + ' The prosecutor asks whether the government objects to an expedited hearing.', opts:[
    O('Let the trial run its course', 'Neutral.', { stability:1 }, {}, { out:'The hearing is set for next year.' }),
    O('Push for a fast conviction', 'Removes a rival, creates a martyr.', { approval:-4, stability:-3 }, { army:4, youth:-8 }, { out:'Convicted within a week. Protests in three cities.', tags:['crackdown'], rem:'pushed for the opposition leader’s conviction', follow:[['youth_protest', 2]] }),
    O('Offer dialogue with the opposition', 'Your allies call it weakness.', { approval:3, unity:-4 }, { elites:-4, youth:4 }, { out:'Talks begin on electoral reform.' }) ] })),
  E('coalition_revolt', 'POLITICS', X => X.has('elites') ? 4 + Math.max(0, 50 - X.s.unity) * 0.3 : 0, X => ({ title:(X.partner ? X.partner.short : 'Party barons') + ' threaten to bring you down', body:(X.partner ? X.partner.leader + ' says ' + X.partner.short + ' "can no longer support a government that ignores us".' : 'Senior figures are counting votes for a new leader.'), why:X.s.unity < 30 ? 'PARTY UNITY LOW' : '', opts:[
    O('Negotiate', 'Find the price of loyalty.', {}, {}, { neg:'coalition' }),
    O('Call their bluff', 'Govern without them.', { unity:-8, approval:2 }, { elites:-10 }, { out:'They abstain on the next vote. You survive by four.' }),
    O('Purge the rebels', 'Discipline by force.', { unity:4, stability:-2 }, { elites:-14 }, { out:'Six members expelled.' }) ] }), { ok:X => X.has('elites') }),
  E('governor', 'POLITICS', X => 4, X => ({ title:'The governor of ' + X.P2 + ' in a land scandal', body:'Provincial land allotted to relatives at a tenth of its value. The governor is your appointee.', opts:[
    O('Remove the governor', 'Clean, and a family turns on you.', { approval:2, unity:-3 }, { elites:-6 }, { out:'Removed by notification.' }),
    O('Let the inquiry run', 'Months.', {}, {}, { out:'The file moves slowly.' }),
    O('Protect him', 'Loyalty rewarded.', { approval:-3 }, { elites:5, urban:-3 }, { out:'He stays.', tags:['cover_up'], rem:'protected a governor in a land scandal' }) ] })),
  E('court_clash', 'POLITICS', X => X.g.laws.length ? 4 : 0, X => { const L = X.g.laws[0]; return { title:'The supreme court suspends your ' + (L ? L.name.toLowerCase() : 'law'), body:'A petition says the law exceeds the constitution. The court has issued a stay.', opts:[
    O('Comply and repeal it', 'Respect the court.', { stability:2, unity:-2 }, {}, { repeal:L && L.id, out:'The law is withdrawn.' }),
    O('Pass it again by constitutional amendment', 'Override the bench.', { stability:-5, approval:-1 }, { youth:-4, urban:-3 }, { out:'Amended with a two-thirds vote.', tags:['court_clash'], rem:'overrode the supreme court' }),
    O('Appeal to a larger bench', 'Delay.', {}, {}, { out:'Hearing in six months.' }) ] }; }),
  E('midterm', 'POLITICS', X => 0, X => ({ title:'Provincial elections are next week', body:'Your first test since taking office. Your approval is ' + Math.round(X.s.approval) + '; party unity is ' + Math.round(X.s.unity) + '.', why:'MONTH 24', opts:[
    O('Campaign on the economy', 'Run on the record.', { approval:X.s.growth > 2 ? 3 : -2, seats:Math.round((X.s.approval - 45) * 0.4) }, {}, { out:X.s.approval > 45 ? 'Your party gains ground in the provinces.' : 'Losses in the cities.', rem:'campaigned on the economy' }),
    O('Spend on marginal seats', 'Roads before votes.', { deficit:0.4, approval:3, seats:Math.round((X.s.approval - 40) * 0.5) }, { lenders:-8, elites:5 }, { out:'Ribbon-cutting every day for a fortnight.', tags:['patronage'], rem:'spent public money on marginal seats' }),
    O('Campaign on security and identity', 'Rally the base.', { stability:-2, seats:Math.round((X.s.approval - 42) * 0.45) }, { army:4, youth:-4, clergy:4 }, { out:'Turnout up among your base, and against you.' }) ] })),
  E('election_spend', 'POLITICS', X => X.demo && X.m >= 38 && X.m <= 46 ? 12 : 0, X => ({ title:'The party wants a pre-election budget', body:'Months to the vote: ' + (48 - X.m) + '. Campaign managers want a development fund and a public pay rise.', opts:[
    O('Open the taps', 'Approval up, deficit up.', { deficit:0.8, approval:5 }, { lenders:-12, labour:6, elites:6 }, { out:'Every district gets something.', tags:['patronage'], rem:'opened the taps before the election' }),
    O('Modest targeted relief', 'Defensible.', { deficit:0.2, approval:2 }, { lenders:-2 }, { out:'A cash top-up for poor families.' }),
    O('Hold the line', 'Run on competence.', { approval:-1 }, { lenders:6 }, { out:'The Fund notes your discipline.' }) ] }), { ok:X => X.demo }),
  E('neglect_return', 'POLITICS', X => 0, X => ({ title:X.P + ' remembers', body:'Provincial leaders say the federal government abandoned them.' + X.recall('neglect'), why:'FOLLOW-UP', opts:[
    O('Apologise and fund recovery', 'Late, expensive.', { deficit:0.2, approval:2 }, { rural:6 }, { out:'A recovery package is announced.' }),
    O('Blame the provincial government', 'Deflect.', { approval:-2 }, { rural:-6 }, { out:'The blame game runs for a month.' }),
    O('Visit and listen', 'Cheap, human.', { approval:1 }, { rural:2 }, { out:'The visit goes well. Memories are long.' }) ] })),

  /* --- disasters --- */
  E('flood', 'SOCIETY', X => X.PK || /Bangladesh|India|Nigeria|Philippines|Vietnam|Indonesia|Myanmar|Sri Lanka|Thailand/.test(X.N) ? 7 : 2, X => ({ title:'Floods across ' + X.P, body:'A third of the province under water. Two million displaced. Crops, roads and power lines are gone.', opts:[
    O('Full federal relief', 'Army, budget and you, in boots.', { deficit:0.4, approval:5, growth:-0.3 }, { rural:10, army:3, lenders:-3 }, { out:'Relief camps up within 72 hours.', rem:'led the flood relief in person' }),
    O('Appeal for international aid', 'Donor conference.', { reserves:0.4, approval:-1, growth:-0.3 }, { rural:-2 }, { out:'Pledges arrive. Most of the money comes later.' }),
    O('Leave it to the province', 'Correct, and fatal.', { approval:-5, growth:-0.4 }, { rural:-12 }, { out:'Images of stranded villages lead every bulletin.', tags:['neglect'], rem:'left ' + X.P + ' to handle the floods alone', follow:[['neglect_return', 3]] }) ] })),
  E('heatwave', 'SOCIETY', X => 4, X => ({ title:'Heatwave and twelve-hour power cuts', body:'Forty-nine degrees in ' + X.P2 + '. The grid is shedding load.', opts:[
    O('Households first', 'Factories close.', { growth:-0.3, approval:3 }, { business:-6, urban:4 }, { out:'Homes keep fans running.' }),
    O('Emergency diesel generation', 'Costly, imported.', { deficit:0.15, reserves:-0.2 }, {}, { out:'The cuts shrink to four hours.' }),
    O('Industry first', 'Output holds, streets burn.', { approval:-4, stability:-2 }, { business:6, urban:-8 }, { out:'Protesters attack a grid station.' }) ] })),
  E('crop_failure', 'SOCIETY', X => 4, X => ({ title:'Wheat harvest 20% short', body:'Drought and locusts. The strategic reserve covers six weeks.', opts:[
    O('Import at world prices', 'Bread stays affordable.', { reserves:-0.4, deficit:0.1 }, { urban:3 }, { out:'Ships arrive within the month.' }),
    O('Subsidised flour at state shops', 'Queues, but bread.', { deficit:0.15, approval:1 }, { rural:3 }, { out:'Long queues and a black market in ration cards.' }),
    O('Let prices rise', 'Farmers gain, cities riot.', { inflation:1.2, approval:-4 }, { rural:6, urban:-8 }, { out:'Flour riots in two cities.' }) ] })),
  E('earthquake', 'SOCIETY', X => 2, X => ({ title:'Earthquake in ' + X.P3, body:'Magnitude 7.1. Villages cut off.', opts:[
    O('Army leads the relief', 'Fast. They get the credit.', { approval:2 }, { army:6, rural:4 }, { out:'Helicopters in the valleys by nightfall.' }),
    O('Civilian agency leads', 'Slower, your credit.', { deficit:0.15, approval:3 }, { rural:6 }, { out:'Relief reaches the last village on day five.' }),
    O('International appeal', 'Aid in days.', { reserves:0.3 }, {}, { out:'Teams from six countries arrive.' }) ] })),

  /* --- foreign --- */
  E('corridor', 'FOREIGN', X => 4, X => ({ title:'A great power offers an infrastructure corridor', body:'Roads, a port expansion and two power plants. Loans and equity. Your army would guard the workers.', opts:[
    O('Sign it', 'Construction boom, external debt.', { growth:0.3, debt:2 }, { business:6, army:4, lenders:-4 }, { out:'Ground is broken within three months.', law:{ id:'corridor', name:'Infrastructure corridor', desc:'Loan-financed roads, port and power.', mods:{ growth:0.25 } }, tags:['foreign_concession'], rem:'signed a loan-financed infrastructure corridor' }),
    O('Negotiate better terms', 'They might walk.', {}, {}, { out:'Talks resume next quarter.' }),
    O('Decline', 'Your other partners are relieved.', { stability:1 }, { lenders:3 }, { out:'Declined politely.' }) ] }), { once:true }),
  E('refugees', 'FOREIGN', X => 3, X => ({ title:'Refugees cross the border', body:'Eighty thousand in a month. Camps in ' + X.P2 + ' are full.', opts:[
    O('Open camps with UN support', 'Humane, a precedent.', { deficit:0.05 }, { rural:-3 }, { out:'Camps open with UN funding.' }),
    O('Close the border', 'Popular in the province.', { approval:2 }, { rural:3 }, { out:'Fences and checkpoints.' }),
    O('Deport the undocumented', 'Fast, condemned.', { approval:2, stability:-1 }, { youth:-3 }, { out:'Buses at the border every day.', tags:['crackdown'] }) ] })),
  E('trade_threat', 'FOREIGN', X => 4, X => ({ title:'Your largest export market threatens tariffs', body:'A 25% duty on your textiles unless you open your market to their farm goods.', opts:[
    O('Open the market', 'Exporters saved, farmers hurt.', { growth:0.1 }, { business:6, rural:-10 }, { out:'Tariffs averted. Farm prices fall.' }),
    O('Retaliate', 'Popular, costly.', { approval:3, growth:-0.3 }, { business:-6 }, { out:'Tit-for-tat duties.' }),
    O('Seek new markets', 'Slow.', { growth:-0.1 }, { business:-2 }, { out:'A trade mission sets off for three continents.' }) ] })),
  E('brain_drain', 'FOREIGN', X => 3, X => ({ title:'Record emigration of graduates', body:'Doctors, engineers and coders leaving at twice last year’s rate.', opts:[
    O('Tax incentives for returnees', 'Some come back.', { deficit:0.05 }, { youth:4 }, { out:'A few hundred return.' }),
    O('Bond graduates for five years', 'Resented.', { approval:-2 }, { youth:-10 }, { out:'Passport queues grow anyway.' }),
    O('Encourage it; remittances matter', 'Dollars now.', { reserves:0.2 }, { youth:2 }, { out:'Labour export deals with the Gulf.' }) ] })),
  E('sports', 'SOCIETY', X => 2, X => ({ title:'The national team wins the final', body:'The country is in the streets for a better reason than usual.', opts:[
    O('Meet the team at the airport', 'Photo of the year.', { approval:3 }, { youth:3 }, { out:'The photo is on every front page.' }),
    O('Declare a public holiday', 'Very popular.', { approval:4, growth:-0.05 }, { business:-2 }, { out:'A day of celebration.' }),
    O('Stay away', 'Let them have it.', { approval:1 }, {}, { out:'Graceful.' }) ] })),

  /* --- country specific --- */
  E('pk_circular', 'ECONOMY', X => X.PK ? 8 : 0, X => ({ title:'Power sector arrears pass Rs 2.4 trillion', body:'Unpaid bills, unpaid producers, capacity payments for plants that do not run. Independent producers threaten to stop supply.', opts:[
    O('Renegotiate producer contracts', 'They signed in dollars.', { deficit:-0.3, growth:-0.1 }, { business:-8, lenders:6 }, { out:'Eighteen producers accept lower capacity payments.', rem:'renegotiated power producer contracts', tags:['reform'] }),
    O('Pay arrears from the budget', 'Clears the books once.', { deficit:0.5 }, { business:6, lenders:-6 }, { out:'The arrears clear. They start growing again next month.' }),
    O('Raise tariffs to cost', 'The Fund’s answer.', { deficit:-0.4, approval:-4 }, { urban:-6, labour:-4, lenders:8 }, { out:'Bills rise a third.', concede:['tariff'], tags:['austerity'], rem:'raised power tariffs to cost recovery' }) ] }), { once:true }),
  E('pk_pti', 'POLITICS', X => X.PK ? 7 : 0, X => ({ title:'PTI supporters march for Imran Khan’s release', body:'Convoys from Khyber Pakhtunkhwa head for Islamabad. The interior ministry wants containers on the motorway.', opts:[
    O('Block the roads with containers', 'Contain the march.', { stability:1, approval:-3 }, { youth:-10, army:4 }, { out:'The motorway is sealed for three days.', tags:['crackdown'], rem:'blocked the PTI march with containers' }),
    O('Let them come, protect the red zone', 'A show of confidence.', { stability:-2 }, { youth:4 }, { out:'A huge rally, peaceful, then dispersal.' }),
    O('Open talks on Khan’s case', 'The army will object.', { approval:2, stability:-1 }, { army:-10, youth:8 }, { out:'Negotiators meet in Adiala jail.', tags:['civil_military'], rem:'opened talks with PTI over Imran Khan' }) ] })),
  E('pk_pia', 'ECONOMY', X => X.PK && !X.conc('privatise') ? 6 : 0, X => ({ title:'A single bid for PIA', body:'The national airline loses money every month. The only bid values it at a fraction of its debts.', opts:[
    O('Accept the bid', 'Losses off the books.', { deficit:-0.1, reserves:0.1 }, { labour:-10, lenders:8 }, { out:'PIA is sold. Unions march in Karachi.', concede:['privatise'], tags:['privatisation'], rem:'sold PIA' }),
    O('Restructure in state hands', 'One more turnaround plan.', { deficit:0.05 }, { labour:3, lenders:-4 }, { out:'A new board, the same losses.' }),
    O('Reject the bid', 'The losses continue.', { deficit:0.05 }, { lenders:-3 }, { out:'The sale is relaunched next year.' }) ] }), { once:true }),
  E('ar_peso', 'ECONOMY', X => X.AR ? 8 : 0, X => ({ title:'Pressure on the peso band', body:'The peso is at the weak edge of its band. Exporters are holding back soy dollars. The Treasury wants a decision before the harvest.', opts:[
    O('Float the peso fully', 'One shock, then credibility.', { inflation:3, reserves:0.6, approval:-3 }, { lenders:10, business:4, urban:-6 }, { out:'The peso drops 12% then stabilises.', concede:['fx_float'], rem:'floated the peso' }),
    O('Defend the band with reserves', 'Hold the line.', { reserves:-0.6 }, { lenders:-6 }, { out:'The band holds. Reserves fall.' }),
    O('Cut soy export taxes', 'Bring the dollars in.', { deficit:0.3, reserves:0.5 }, { rural:12, lenders:-2 }, { out:'Farmers sell. The treasury loses revenue.', rem:'cut export taxes on soy' }) ] })),
  E('ar_governors', 'POLITICS', X => X.AR ? 6 : 0, X => ({ title:'Governors demand their share of revenue', body:'Provincial governors control the senators you need for the budget. They want transfers restored.', opts:[
    O('Restore transfers', 'Budget passes.', { deficit:0.3, unity:6 }, { elites:10, lenders:-4 }, { out:'The budget passes the Senate.' }),
    O('Govern by decree', 'Skip Congress.', { stability:-3, unity:-6 }, { elites:-10 }, { out:'A decree of necessity and urgency.', tags:['court_clash'] }),
    O('Offer infrastructure projects', 'Concrete for votes.', { deficit:0.15, unity:3 }, { elites:5 }, { out:'Highways announced in six provinces.' }) ] })),
  E('lk_tamil', 'POLITICS', X => X.LK ? 6 : 0, X => ({ title:'Tamil parties ask for land to be returned', body:'Military-held land in the North, and answers on the disappeared.', opts:[
    O('Return the land', 'Reconciliation.', { approval:1, stability:1 }, { army:-8, rural:4 }, { out:'Three thousand acres handed back.', rem:'returned military-held land in the North' }),
    O('Set up a truth commission', 'Slow, symbolic.', { approval:1 }, { army:-4 }, { out:'Commissioners appointed.' }),
    O('Defer to security concerns', 'The army approves.', { approval:-1 }, { army:6 }, { out:'Nothing changes.' }) ] }), { once:true })
];

/* ===================== AGENDA (one per month) ===================== */
const A = (id, cat, name, d, fx, gr, x) => Object.assign({ id, cat, name, d, fx:fx || {}, gr:gr || {} }, x || {});
const AGENDA = [
  A('ag_retail','ECONOMY','Tax retailers and property','Bring the two biggest untaxed sectors into the net.', { deficit:-0.5 }, { business:-8, elites:-6, lenders:6 }, { concede:['retail_tax'], out:'Revenue rises; shopkeepers strike for a day.', tags:['tax_base'] }),
  A('ag_vat','ECONOMY','Raise sales tax by two points','The fastest revenue there is.', { deficit:-0.8, approval:-4, inflation:0.4 }, { urban:-5, lenders:6 }, { concede:['gst'], out:'Prices tick up across the board.', tags:['austerity'] }),
  A('ag_subsidy','ECONOMY','End energy subsidies','Fuel and power at cost.', { deficit:-0.7, approval:-5, inflation:0.8 }, { labour:-8, urban:-6, lenders:10 }, { concede:['subsidy'], out:'Pump prices up a fifth overnight.', tags:['austerity'], follow:[['general_strike', 2]] }),
  A('ag_cbi','ECONOMY','Make the central bank independent','No more printing for the treasury.', {}, { lenders:6 }, { concede:['cbi'], mods:{ inflation:-0.5 }, out:'The governor gets a fixed term and a single mandate.' }),
  A('ag_corp','ECONOMY','Cut corporate tax by five points','Invest here, not elsewhere.', { deficit:0.4 }, { business:10, labour:-4, lenders:-4 }, { mods:{ growth:0.2 }, out:'Investors cheer. The deficit widens.' }),
  A('ag_infra','ECONOMY','National infrastructure programme','Roads, rail and grid.', { deficit:0.5 }, { business:5, rural:5, lenders:-4 }, { mods:{ growth:0.3, unemp:-0.3 }, out:'Cranes over every city within a year.' }),
  A('ag_privatise','ECONOMY','Sell loss-making state companies','The airline, the steel mill, the power companies.', { reserves:0.3, deficit:-0.2 }, { labour:-10, business:4, lenders:6 }, { concede:['privatise'], ok:X => !X.conc('no_layoffs'), out:'Bids invited. Unions march.', tags:['privatisation'] }),
  A('ag_exportzones','ECONOMY','Special export zones','Tax-free zones on the coast.', { deficit:0.1 }, { business:6, rural:-3 }, { mods:{ growth:0.15 }, out:'Three zones designated.' }),
  A('ag_float','ECONOMY','Float the currency','End the queue for dollars.', { inflation:2, reserves:0.5, approval:-3 }, { lenders:8, urban:-4 }, { concede:['fx_float'], ok:X => !X.hard, out:'The currency finds its level after a week.' }),
  A('ag_farm','ECONOMY','Fertiliser subsidy for small farmers','Cheaper inputs, bigger harvests.', { deficit:0.2 }, { rural:10, lenders:-3 }, { mods:{ growth:0.05 }, out:'Sacks distributed through village councils.' }),
  A('ag_health','SOCIETY','Universal health insurance','A card for every family.', { deficit:0.4, approval:4 }, { urban:5, rural:5, lenders:-4 }, { out:'Ten million cards issued in the first quarter.' }),
  A('ag_cash','SOCIETY','Cash transfers for the poorest women','Paid to mothers, by phone.', { deficit:0.2, approval:3 }, { rural:6, clergy:-2 }, { mods:{ unemp:-0.05 }, out:'Eight million women enrolled.' }),
  A('ag_school','SOCIETY','Free school meals','One hot meal a day.', { deficit:0.15, approval:2 }, { urban:3, rural:4 }, { out:'Attendance rises a tenth.' }),
  A('ag_housing','SOCIETY','Low-cost housing scheme','Five million homes promised.', { deficit:0.3, approval:3 }, { urban:5, business:4 }, { mods:{ growth:0.1 }, out:'Ground broken in eleven cities.' }),
  A('ag_women','SOCIETY','Women’s inheritance rights enforced','Daughters inherit, by law.', { approval:1 }, { clergy:-8, youth:6, urban:3 }, { out:'Courts begin enforcing shares.', tags:['social_reform'] }),
  A('ag_digital','SOCIETY','Cheap data and a digital ID','Connect the young.', { deficit:0.1 }, { youth:8, business:3 }, { mods:{ growth:0.05 }, out:'Data prices halve.' }),
  A('ag_anticorr','SOCIETY','Independent anti-corruption bureau','Teeth, and no ministers on the board.', { approval:3 }, { elites:-10, urban:5, lenders:4 }, { out:'The first case is against a member of your own party.', tags:['reform'] }),
  A('ag_seminary','SOCIETY','Register and audit religious schools','Funding mapped, curriculum agreed.', {}, { clergy:-12, lenders:3, youth:2 }, { ok:X => X.has('clergy'), out:'Registration opens; half the schools refuse.', tags:['social_reform'], follow:[['march', 3]] }),
  A('ag_police','SECURITY','Police reform','Pay, training, an independent complaints body.', { deficit:0.1, stability:2 }, { urban:3 }, { out:'Recruitment drive in every province.' }),
  A('ag_defup','SECURITY','Raise the defence budget','New aircraft, better pay.', { deficit:0.3, stability:2 }, { army:12, lenders:-4 }, { ok:X => X.has('army'), out:'The service chiefs are grateful.' }),
  A('ag_defcut','SECURITY','Cut the defence budget','Money for schools instead.', { deficit:-0.3, stability:-2 }, { army:-14, lenders:4, youth:3 }, { ok:X => X.has('army') && !X.conc('defence_budget'), out:'Procurement is delayed. The General Staff is silent.', tags:['civil_military'] }),
  A('ag_milaudit','SECURITY','Audit military business holdings','Bring them onto the budget.', { deficit:-0.1 }, { army:-12, lenders:5, urban:3 }, { ok:X => X.has('army') && X.mil && !X.conc('no_audit'), out:'Auditors are refused entry to two sites.', tags:['civil_military'] }),
  A('ag_cyber','SECURITY','Create a cyber command','Defend the grid and the banks.', { deficit:0.05 }, { army:3 }, { out:'Stood up within six months.' }),
  A('ag_border','SECURITY','Fence the western border','Steel and cameras.', { deficit:0.1, stability:1 }, { army:4 }, { out:'The first hundred kilometres finished.' }),
  A('ag_amnesty','SECURITY','Amnesty for insurgents who disarm','A way home.', { approval:-1, stability:2 }, { army:-6, rural:4 }, { out:'Four hundred fighters surrender in the first month.' }),
  A('ag_trade','FOREIGN','Regional free trade agreement','Lower tariffs with neighbours.', {}, { business:6, rural:-4 }, { mods:{ growth:0.15 }, out:'Signed at a summit in the capital.' }),
  A('ag_gsp','FOREIGN','Seek EU trade preferences','Duty-free access in return for rights reforms.', { approval:1 }, { business:6, clergy:-3 }, { mods:{ growth:0.1 }, out:'Brussels opens talks.' }),
  A('ag_neighbour','FOREIGN','Normalise relations with your rival neighbour','Trade, visas, a hotline.', { stability:1 }, { army:-8, business:6 }, { ok:X => X.has('army'), mods:{ growth:0.1 }, out:'The border crossing reopens.' }),
  A('ag_gulf','FOREIGN','Labour agreement with the Gulf','Visas for half a million workers.', { reserves:0.4 }, { youth:4 }, { mods:{ unemp:-0.2 }, out:'Recruitment centres open in every district.' }),
  A('ag_climate','FOREIGN','Climate finance push','Loss-and-damage money for adaptation.', { reserves:0.2 }, { lenders:3 }, { out:'Pledges at the summit.' }),
  A('ag_diaspora','FOREIGN','Diaspora bonds','Borrow from your own emigrants.', { reserves:0.5, debt:0.5 }, {}, { out:'Oversubscribed in a week.' }),
  A('ag_reshuffle','POLITICS','Cabinet reshuffle','Fresh faces, settled scores.', { unity:5, approval:1 }, { elites:-3 }, { law:false, out:'Six new ministers sworn in.' }),
  A('ag_devolve','POLITICS','Devolve powers to the provinces','More money and powers to provincial assemblies.', { deficit:0.1, stability:1 }, { rural:5, elites:4 }, { out:'Passed with cross-party support.' }),
  A('ag_press','POLITICS','Press freedom act','No more detentions without charge for journalists.', { approval:2 }, { youth:6, army:-4 }, { out:'Applauded abroad.' }),
  A('ag_ngo','POLITICS','Restrict foreign-funded NGOs','Registration and audits.', { stability:1 }, { army:4, youth:-6, lenders:-3 }, { out:'Two hundred NGOs deregistered.', tags:['crackdown'] }),
  A('ag_electoral','POLITICS','Independent election commission','Fair counting, digital results.', { approval:2, unity:-2 }, { youth:5, elites:-4 }, { ok:X => X.demo, out:'The opposition grudgingly welcomes it.' }),
  A('ag_judges','POLITICS','Judicial appointments commission','Judges picked by a panel, not by you.', { stability:1 }, { urban:3, elites:-3 }, { out:'The bar associations applaud.' }),
  A('ag_patronage','POLITICS','Constituency development funds','Money every member spends at home.', { deficit:0.2, unity:8 }, { elites:10, lenders:-4 }, { concede:['dev_fund'], out:'Members are delighted.', tags:['patronage'] })
];

const HEADLINES = {
  pro:{ good:['{L} delivers on {T}','Decisive action on {T}','A government that acts: {T}','{T}: the country breathes again'], mixed:['Hard but necessary: {T}','{L} chooses responsibility on {T}','No easy options on {T}, and the right call'], bad:['Tough choices on {T}, says government','{L}: "We will not take the easy road"','Sacrifice today on {T}, stability tomorrow'] },
  mid:{ good:['{T} decision wins cautious welcome','Analysts back the move on {T}','Markets and public warm to {T} plan'], mixed:['{T}: winners and losers','What the {T} decision means for you','A calculated gamble on {T}'], bad:['{T} decision leaves the country uneasy','Questions mount over {T}','Critics line up against {T} move'] },
  opp:{ good:['Too little, too late on {T}','{O}: government stole our idea on {T}','Cosmetic change on {T}, says {O}'], mixed:['{L} dithers on {T}','{O} attacks "half measures" on {T}','Who really pays for {T}?'], bad:['{L}’s {T} gamble will cost the country','Betrayal on {T}, says {O}','{T}: the people will remember'] }
};
const PAPERS = {
  'Pakistan':['The Nation','Dawn','The Express Tribune'], 'India':['The Times of India','The Hindu','The Indian Express'], 'Argentina':['La Nación','Infobae','Página/12'],
  'Sri Lanka':['Daily News','The Island','Daily Mirror'], 'United Kingdom':['The Telegraph','The Times','The Guardian'], 'United States':['The New York Post','The Wall Street Journal','The New York Times'],
  'Egypt':['Al-Ahram','Al-Masry Al-Youm','Mada Masr'], 'Nigeria':['Daily Trust','The Guardian Nigeria','Punch'], 'Turkey':['Sabah','Hürriyet','Cumhuriyet'],
  'Brazil':['Estadão','Folha de S.Paulo','O Globo'], 'Mexico':['La Jornada','El Universal','Reforma'], 'France':['Le Figaro','Le Monde','Libération'], 'Germany':['Die Welt','FAZ','Süddeutsche Zeitung']
};
function papers(g) { return PAPERS[g.nation] || ['The ' + g.cap + ' Herald', 'The National Courier', 'The People’s Tribune']; }

const FOLLOW = { general_strike:'The unions may call a strike', strike_return:'The unions will be back', scandal_return:'The leak story is not over', deposit_due:'The friendly deposits fall due', neglect_return:'The province will remember',
  coup:'The army may move', coup_rumour:'The General Staff is watching', march:'The clergy may march', march_return:'The march may return', youth_protest:'Students may take to the streets', reserves_crisis:'Reserves will come under pressure', default_brink:'A payment you cannot make is coming' };
function followText(id, n) { return (FOLLOW[id] || 'A consequence is coming') + (n > 0 ? ' within ' + n + ' month' + (n === 1 ? '' : 's') + '.' : ' soon.'); }

window.NSContent = { CATS, CONCESSIONS, NEGS, EVENTS, AGENDA, HEADLINES, papers, followText };
})();
