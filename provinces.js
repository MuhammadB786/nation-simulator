/* Provincial development: authored economies on stable real-world ADM1 identities.
   Capacity, population weights and prices are scenario abstractions, not census data. */
(function waitProvinces(){
  if(!window.NSCampaign||!window.NSProvinceData){setTimeout(waitProvinces,15);return;}
  const N=window.NSG,C=window.NSCampaign,copy=N.C;
  const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v)),r=v=>Math.round(v*100)/100;
  const H=x=>window.NationData.hash(String(x));
  const norm=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const BUILDINGS={
    farms:{name:'Agricultural estates',short:'FOOD',months:3,cost:0.12,desc:'More food supply; fewer price pressures on households.'},
    power:{name:'Power complex',short:'POWER',months:4,cost:0.2,desc:'Electricity unlocks factories and services.'},
    industry:{name:'Industrial district',short:'IND',months:5,cost:0.22,desc:'More production and jobs, with higher power and freight demand.'},
    services:{name:'Services and training',short:'JOBS',months:3,cost:0.14,desc:'Local jobs and skilled capacity; electricity is still required.'},
    logistics:{name:'Rail and freight hub',short:'RAIL',months:4,cost:0.18,desc:'Moves goods and connects provincial shortages to national surpluses.'},
    housing:{name:'Housing and utilities',short:'HOME',months:3,cost:0.15,desc:'Relieves rent pressure as employment expands.'}
  };
  const WEIGHTS={
    Pakistan:{punjab:55,sindh:23,khyberpakhtunkhwa:16,balochistan:6,islamabadcapitalterritory:1,gilgitbaltistan:1,azadkashmir:2},
    Germany:{nordrheinwestfalen:18,bayern:13,badenwurttemberg:11,niedersachsen:8,hessen:6,sachsen:4,berlin:3.7,brandenburg:2.5},
    'United States':{california:39,texas:30,florida:22,newyork:20,pennsylvania:13,illinois:12,ohio:12,georgia:11,northcarolina:11,michigan:10,newjersey:9,virginia:9,washington:8,arizona:7,massachusetts:7,tennessee:7,indiana:7,puertorico:3,guam:0.2,americansamoa:0.06,unitedstatesvirginislands:0.1,commonwealthofthenorthernmarianaislands:0.06,districtofcolumbia:0.7},
    China:{guangdongprovince:12,shandongprovince:10,henanprovince:10,jiangsuprovince:8.5},
    'Saudi Arabia':{riyadhregion:8,makkahregion:8,easternregion:5},
    Brazil:{saopaulo:44,minasgerais:20,riodejaneiro:17,bahia:15,parana:11,riograndedosul:11,pernambuco:9,ceara:9,para:8,maranhao:7}
  };
  // Keys are normalized solely for matching names, never for geographic claims.
  function weight(country,name){
    const k=norm(name),lookup=WEIGHTS[country]||{};
    if(lookup[k])return lookup[k];
    if(country==='China'){
      if(/sichuan/.test(k))return 8;if(/hebei|hunan/.test(k))return 7;
      if(/zhejiang|hubei|anhui|jiangsu/.test(k))return 6;
      if(/tibet|qinghai|ningxia|macau|hongkong/.test(k))return 0.8;
      return 3.2+H(name)*2;
    }
    return country==='United States'?1+H(name)*4:country==='Brazil'?1.5+H(name)*2:country==='Germany'?1.5+H(name)*2:0.8+H(name)*1.2;
  }
  function bulletin(g,title,body,provinceId,kind='development'){
    const item={id:'dev-'+g.month+'-'+g.development.seq++,m:g.month,title,body,provinceId,kind};
    g.development.changes.unshift(item);g.development.changes=g.development.changes.slice(0,30);
    g.world.feed.unshift({m:g.month,t:title,d:body,tone:kind==='warning'?'bad':'good'});g.world.feed=g.world.feed.slice(0,60);
    return item;
  }
  function init(g){
    const data=window.NSProvinceData[g.nation];if(!data)return g;
    if(g.development&&g.development.version===1)return g;
    const old=g.provs||[],base=window.NationData.BY_NAME[g.nation];
    const total=data.provinces.reduce((sum,p)=>sum+weight(g.nation,p.name),0);
    g.provs=data.provinces.map((entry,i)=>{
      const previous=old.find(p=>[entry.name,...entry.aliases].some(n=>norm(n)===norm(p.name)));
      const roll=H(g.nation+entry.id),heavy=weight(g.nation,entry.name)>8;
      const buildings={farms:2+(roll>0.6?1:0),power:1+(roll>0.7?1:0),industry:2+(heavy?1:0),services:2+(roll>0.3?1:0),logistics:1+(roll>0.75?1:0),housing:2};
      if(g.nation==='Pakistan')buildings.farms++;
      else buildings.power++;
      if(g.nation==='Saudi Arabia'){buildings.power++;buildings.farms=1;}
      if(g.nation==='Germany')buildings.logistics++;
      const pop=base.pop*weight(g.nation,entry.name)/total;
      return {...previous,id:entry.id,name:entry.name,aliases:entry.aliases,pop:r(pop),share:pop/base.pop,
        support:previous?previous.support:Math.round(clamp(g.s.approval+(roll-0.5)*22,15,85)),unrest:previous?previous.unrest:Math.round(20+roll*25),
        economy:{buildings,initial:copy(buildings),fertility:r(0.8+H(entry.id+'soil')*0.4),
          baseUnemp:g.s.unemp,baseLiving:clamp(35+Math.log10(Math.max(500,base.perCapita))*6,40,68),
          living:50,unemployment:g.s.unemp,foodPrice:100,rent:100,energy:1,freight:1,output:0,
          pressure:10,reliefUntil:0,strikeUntil:0,used:{},households:[]}};
    }).sort((a,b)=>b.share-a.share);
    g.prov=g.provs.map(p=>p.name);
    g.development={version:1,queue:[],seq:1,changes:[],history:[],worldBuilds:[],appliedMods:{growth:0,inflation:0,unemp:0},capacity:2,focus:g.provs[0].id,competition:null};
    solve(g,false);
    for(const p of g.provs)p.economy.baselineOutput=p.economy.output;
    g.development.baselineOutput=aggregate(g).output;
    g.development.baselineUnemployment=aggregate(g).unemployment;g.development.baselineFood=aggregate(g).foodPrice;
    for(const item of g.campaign.projects){
      if(!item.provinceId)item.provinceId=g.provs[0].id;
      if(item.completed&&!item.localized)completeNational(g,item,{id:item.id,name:item.id});
    }
    openCompetition(g);
    return g;
  }
  function aggregate(g){
    const values={output:0,living:0,unemployment:0,foodPrice:0,energy:0,freight:0};
    for(const p of g.provs)for(const k of Object.keys(values))values[k]+=p.economy[k]*p.share;
    for(const k of Object.keys(values))values[k]=r(values[k]);
    return values;
  }
  function slots(g){return (g.development?g.development.queue.filter(x=>!x.complete).length:0)+(g.campaign?g.campaign.projects.filter(x=>!x.completed).length:0);}
  function canStart(g,provinceId){
    init(g);if(!g.development)return 'THIS SAVE HAS NO PROVINCE ECONOMY';
    if(!g.provs.some(p=>p.id===provinceId))return 'SELECT AN ADMINISTERED PROVINCE';
    if(slots(g)>=g.development.capacity)return 'ALL NATIONAL CONSTRUCTION CREWS ARE COMMITTED';
    return null;
  }
  function build(g,provinceId,type){
    g=copy(g);init(g);const spec=BUILDINGS[type];
    if(g.over)return {g,error:'THIS GOVERNMENT HAS LEFT OFFICE'};
    if(!spec)return {g,error:'UNKNOWN BUILDING'};
    const error=canStart(g,provinceId);if(error)return {g,error};
    if(g.ap<1)return {g,error:'NO CABINET ATTENTION LEFT'};
    if(g.s.pdef>12)return {g,error:'FINANCING PRESSURE BLOCKS NEW CONSTRUCTION'};
    const p=g.provs.find(p=>p.id===provinceId);
    if(g.development.queue.some(x=>!x.complete&&x.provinceId===provinceId&&x.type===type))return {g,error:'THIS PROVINCE ALREADY HAS THAT BUILDING UNDER CONSTRUCTION'};
    if(p.economy.buildings[type]>=8)return {g,error:'PROVINCIAL CAPACITY LIMIT REACHED'};
    const cost=quote(g,p.id,type);
    const item={id:'site-'+g.development.seq++,provinceId,type,progress:2,stage:'Groundworks',started:g.month,cost,complete:false,worked:0,private:false};
    g.development.queue.push(item);g.ap--;g.s.pdef=r(g.s.pdef+cost);
    bulletin(g,spec.name+' breaks ground in '+p.name,'A construction site is now active. Annual primary spending +'+cost+'% GDP; a crew is committed until completion.',provinceId,'started');
    solve(g,false);return {g};
  }
  function quote(g,provinceId,type){const p=g.provs.find(p=>p.id===provinceId),spec=BUILDINGS[type];return p&&spec?r(spec.cost*clamp(Math.sqrt(p.share*g.provs.length),0.5,2)):null;}
  function intervene(g,id,kind){
    g=copy(g);init(g);const item=g.development.queue.find(x=>x.id===id&&!x.complete);
    if(!item)return {g,error:'NO ACTIVE CONSTRUCTION SITE'};
    if(g.over||g.ap<1)return {g,error:'NO CABINET ATTENTION LEFT'};
    if(item.worked===g.month)return {g,error:'THIS SITE HAS ALREADY RECEIVED AN INTERVENTION THIS MONTH'};
    if(kind==='import'){item.progress=Math.min(95,item.progress+16);g.s.debt=r(g.s.debt+0.25);}
    else if(kind==='permit'){const p=g.provs.find(p=>p.id===item.provinceId);p.support=clamp(p.support+8);p.economy.permitUntil=g.month+4;g.s.pdef=r(g.s.pdef+0.06);}
    else return {g,error:'UNKNOWN SITE INTERVENTION'};
    item.worked=g.month;g.ap--;
    const p=g.provs.find(p=>p.id===item.provinceId);
    bulletin(g,kind==='import'?'Materials secured for '+p.name:'Provincial agreement reached in '+p.name,kind==='import'?'Imported inputs accelerate delivery. Debt rises by 0.25% GDP.':'Local concessions protect permits for four months; annual spending rises 0.06% GDP.',p.id,'intervention');
    return {g};
  }
  function compact(g,provinceId){
    g=copy(g);init(g);const p=g.provs.find(p=>p.id===provinceId);
    if(!p||g.over||g.ap<1)return {g,error:'SELECT A PROVINCE AND KEEP ONE CABINET ATTENTION'};
    if(p.economy.used.compact===g.month)return {g,error:'A PROVINCIAL COMPACT IS ALREADY IN FORCE THIS MONTH'};
    p.economy.used.compact=g.month;p.economy.reliefUntil=g.month+3;p.economy.pressure=Math.max(0,p.economy.pressure-35);p.economy.strikeUntil=0;p.unrest=clamp(p.unrest-10);
    g.ap--;g.s.pdef=r(g.s.pdef+0.08);
    bulletin(g,'Household compact in '+p.name,'Three months of household relief and a return to work. Annual primary spending rises 0.08% GDP.',p.id,'intervention');
    solve(g,false);return {g};
  }
  function solve(g,politics){
    if(!g.development)return;
    let newStrike=false;
    let totalFood=0,totalFoodNeed=0,totalEnergy=0,totalEnergyNeed=0;
    for(const p of g.provs){const e=p.economy,b=e.buildings;
      e.foodSupply=b.farms*35*e.fertility;e.energySupply=b.power*48;
      e.foodDemand=88+b.industry*3;e.energyDemand=35+b.industry*22+b.services*9;
      totalFood+=e.foodSupply*p.share;totalFoodNeed+=e.foodDemand*p.share;
      totalEnergy+=e.energySupply*p.share;totalEnergyNeed+=e.energyDemand*p.share;
    }
    const foodPool=totalFood/Math.max(1,totalFoodNeed),powerPool=totalEnergy/Math.max(1,totalEnergyNeed),world=g.campaign.world;
    for(const p of g.provs){const e=p.economy,b=e.buildings,localSites=g.development.queue.filter(x=>!x.complete&&x.provinceId===p.id).length+g.campaign.projects.filter(x=>!x.completed&&x.provinceId===p.id).length;
      const freightNeed=b.industry*26+e.foodSupply*0.22+localSites*16;
      e.freight=r(clamp(b.logistics*65/Math.max(1,freightNeed),0.25,1.2)*clamp(1-(world.freight-40)/180,0.65,1.1));
      e.energy=r(clamp((e.energySupply/e.energyDemand)*0.6+powerPool*0.4*Math.min(1,e.freight),0.2,1.15));
      const imports=clamp(g.s.reserves/8,0,0.3)*Math.min(1,e.freight)*Math.max(0.4,1-(g.world.sanctions||[]).length*0.08);
      const foodAccess=clamp(e.foodSupply/e.foodDemand*0.65+foodPool*0.35*Math.min(1,e.freight)+imports,0.35,1.3);
      const efficiency=Math.min(1,e.energy)*Math.min(1,e.freight)*(e.strikeUntil>g.month?0.65:1);
      e.output=r((b.industry*30*efficiency+b.services*15*Math.min(1,e.energy)+e.foodSupply*0.3));
      const expansion=(b.industry-e.initial.industry)*Math.min(1,e.energy)+(b.services-e.initial.services)*0.8;
      e.unemployment=r(clamp(e.baseUnemp+(1-Math.min(1,e.energy))*3+(1-Math.min(1,e.freight))*2-expansion*1.2-localSites*0.35,1.5,35));
      e.foodPrice=r(clamp(100+(1-foodAccess)*65+(world.freight-40)*0.15,70,180));
      e.rent=r(clamp(100+expansion*9+localSites*3-(b.housing-e.initial.housing)*16,65,175));
      const wages=100+expansion*5+(e.output-(e.baselineOutput||e.output))*0.1;
      const relief=e.reliefUntil>g.month?6:0;
      const workers=clamp(e.baseLiving+(wages-100)*0.45-(e.foodPrice-100)*0.16-(e.rent-100)*0.2-(e.unemployment-e.baseUnemp)*0.8+relief,10,95);
      const farmers=clamp(e.baseLiving+(e.foodPrice-100)*0.09+(b.farms-e.initial.farms)*3+relief,10,95);
      const firms=clamp(e.baseLiving+(efficiency-0.75)*18+(e.output-(e.baselineOutput||e.output))*0.1,10,95);
      e.households=[{key:'workers',name:'Workers & tenants',living:r(workers),income:r(wages),cost:r((e.foodPrice+e.rent)/2)},{key:'farmers',name:'Farm households',living:r(farmers),income:r(100+(e.foodPrice-100)*0.3),cost:e.foodPrice},{key:'firms',name:'Small businesses',living:r(firms),income:r(100+(efficiency-0.75)*35),cost:r(100+(1-e.energy)*30)}];
      e.living=r(workers*0.6+farmers*0.25+firms*0.15);
      e.bottleneck=e.strikeUntil>g.month?'Work stoppage':e.energy<0.8?'Electricity shortage':e.freight<0.8?'Freight bottleneck':e.foodPrice>120?'Food affordability':e.rent>115?'Housing pressure':'Room to expand';
      if(politics){
        const oldPressure=e.pressure;e.pressure=r(clamp(e.pressure+(workers<e.baseLiving-5?3:-1.5)+(e.rent>120?2:0)+(e.reliefUntil>g.month?-5:0)));
        p.unrest=r(clamp(p.unrest+(e.pressure-35)*0.025));
        p.support=r(clamp(p.support+(e.living-e.baseLiving)*0.06));
        if(e.pressure>=85&&oldPressure<85){e.strikeUntil=g.month+3;newStrike=true;bulletin(g,'Work stoppage in '+p.name,'Workers reject worsening living conditions. Industrial output is curtailed for three months unless a household compact is negotiated.',p.id,'warning');}
      }
    }
    if(newStrike){solve(g,false);return;}
    g.development.summary=aggregate(g);
  }
  function construction(g,lines){
    const d=g.development,active=d.queue.filter(x=>!x.complete),crewRatio=Math.min(1,d.capacity/Math.max(1,slots(g)));
    for(const item of active){
      const p=g.provs.find(p=>p.id===item.provinceId),e=p.economy,spec=BUILDINGS[item.type];
      const permit=p.support>=35||e.permitUntil>=g.month;
      const materials=clamp(g.development.summary.output/150,0.45,1.1);
      const pace=100/spec.months*clamp(e.freight,0.3,1)*materials*crewRatio*(permit?1:0.25);
      item.lastProgress=r(pace);item.progress=r(Math.min(100,item.progress+pace));
      item.stage=item.progress<25?'Groundworks':item.progress<75?'Under construction':item.progress<100?'Commissioning':'Operating';
      item.delay=!permit?'Local permits withheld':e.freight<0.7?'Freight bottleneck':materials<0.75?'Industrial input shortage':crewRatio<1?'Construction crews stretched':'';
      if(item.progress>=100){
        item.complete=true;item.finished=g.month;e.buildings[item.type]++;
        g.s.pdef=r(g.s.pdef-item.cost*0.7);
        const note=bulletin(g,spec.name+' opens in '+p.name,'Capacity rises to level '+e.buildings[item.type]+'. Construction spending falls; operating costs remain. The province now uses this asset.',p.id,'completed');
        lines.push({t:note.title,d:note.body,good:true});
      }
    }
    d.queue=d.queue.filter(x=>!x.complete||g.month-x.finished<12);
  }
  function openCompetition(g){
    const d=g.development;if(d.competition&&d.competition.status==='open')return;
    const rival=['India','Vietnam','Mexico','Indonesia'].filter(n=>n!==g.nation)[Math.floor(H(g.seed+'bid'+g.month)*4)%4];
    d.competition={id:'investment-'+g.month,partner:g.nation==='Japan'?'Germany':'Japan',rival,status:'open',deadline:g.month+5,rivalScore:54+Math.floor(H(g.seed+'rival'+g.month)*12),provinceId:null,bid:0,title:'An international manufacturer is choosing a new production base'};
  }
  function bid(g,provinceId){
    g=copy(g);init(g);const p=g.provs.find(p=>p.id===provinceId),c=g.development.competition;
    if(!p||!c||c.status!=='open')return {g,error:'NO OPEN MANUFACTURING COMPETITION'};
    if(g.over||g.ap<1)return {g,error:'KEEP ONE CABINET ATTENTION TO NEGOTIATE'};
    if(c.worked===g.month)return {g,error:'ONE INVESTMENT NEGOTIATION PER MONTH'};
    c.provinceId=p.id;c.bid=Math.min(18,c.bid+6);c.worked=g.month;g.ap--;g.s.pdef=r(g.s.pdef+0.04);
    bulletin(g,p.name+' bids for the manufacturing investment','The proposal is assessed on electricity, freight, industrial depth and stability. Your rival continues negotiating independently.',p.id,'competition');
    return {g};
  }
  function bidScore(g,c){const p=g.provs.find(p=>p.id===c.provinceId);if(!p)return 0;const e=p.economy;return r(e.energy*24+e.freight*20+e.buildings.industry*4+(100-p.unrest)*0.15+c.bid);}
  function competition(g,lines){
    const d=g.development,c=d.competition;
    if(!c)return;
    for(const asset of d.worldBuilds){
      if(asset.complete)continue;asset.progress=Math.min(100,(asset.progress||0)+20);asset.stage=asset.progress>=100?'Operating':'Under construction';
      if(asset.progress>=100){asset.complete=true;asset.finished=g.month;const partner=g.p9.trade.partners.find(p=>p.to===asset.country);if(partner){partner.imp=r(partner.imp*1.03);partner.v=r(partner.exp+partner.imp);}const note=bulletin(g,'A new industrial district opens in '+asset.country,'The rival’s investment is now producing. Connected trade partners gain another source of manufactured imports.',null,'foreign-completed');lines.push({t:note.title,d:note.body,good:false});}
    }
    if(c.status==='open'){
      c.rivalScore=r(c.rivalScore+1+H(g.seed+c.id+g.month)*1.5);
      if(g.month>=c.deadline){
        const score=bidScore(g,c),won=score>=c.rivalScore+(H(g.seed+c.id+'decision')-0.5)*6;
        c.status=won?'won':'lost';c.resolved=g.month;c.playerScore=score;
        const p=g.provs.find(p=>p.id===c.provinceId);
        if(won){d.queue.push({id:'foreign-'+c.id,provinceId:p.id,type:'industry',progress:3,stage:'Groundworks',started:g.month,cost:0,complete:false,private:true,worked:0});}
        else d.worldBuilds.unshift({country:c.rival,type:'industry',m:g.month,progress:0,stage:'Under construction',complete:false,title:'Manufacturing investment secured by '+c.rival});
        const note=bulletin(g,won?'Manufacturing investment secured for '+p.name:c.rival+' wins the manufacturing investment',won?'A privately financed industrial district begins construction. It shares local freight and labor capacity.':'The factory will be built abroad. The investor preferred the rival’s infrastructure and negotiated terms.',p?p.id:null,'competition');
        lines.push({t:note.title,d:note.body,good:won});
      }
    }else if(g.month-c.resolved>=4)openCompetition(g);
    d.worldBuilds=d.worldBuilds.slice(0,8);
  }
  function completeNational(g,item,spec){
    init(g);if(!g.development||item.localized)return;
    const p=g.provs.find(p=>p.id===item.provinceId)||g.provs[0];item.provinceId=p.id;
    const key=/grid|energy/.test(item.id)?'power':/rail|freight|ports|exports/.test(item.id)?'logistics':/housing/.test(item.id)?'housing':/skills|green/.test(item.id)?'services':'industry';
    p.economy.buildings[key]++;item.localized=true;
    bulletin(g,spec.name+' transforms '+p.name,BUILDINGS[key].name+' gains one capacity level. Local households and firms now respond to the new infrastructure.',p.id,'completed');
    solve(g,false);applyMacro(g);
  }
  function applyMacro(g){
    const d=g.development,s=d.summary;
    const desired={growth:r(clamp((s.output/d.baselineOutput-1)*3,-1.5,1.5)),inflation:r(clamp((s.foodPrice-d.baselineFood)*0.025,-1.5,2.5)),unemp:r(clamp(s.unemployment-d.baselineUnemployment,-4,5))};
    for(const k of Object.keys(desired)){g.mods[k]=r((g.mods[k]||0)+desired[k]-(d.appliedMods[k]||0));d.appliedMods[k]=desired[k];}
  }
  function step(g,lines){
    init(g);if(!g.development)return;
    for(const p of g.provs){const e=p.economy;e.previous={living:e.living,output:e.output,energy:e.energy,freight:e.freight,foodPrice:e.foodPrice,unemployment:e.unemployment,buildings:copy(e.buildings)};}
    solve(g,false);construction(g,lines);competition(g,lines);solve(g,true);applyMacro(g);
    const snapshot={m:g.month,...g.development.summary};g.development.history.push(snapshot);g.development.history=g.development.history.slice(-48);
    lines.push({t:'Provincial development',d:'Living standards '+snapshot.living+'/100 · electricity coverage '+Math.round(snapshot.energy*100)+'% · '+slots(g)+' construction commitments. Food price index '+snapshot.foodPrice+' (100 = starting benchmark).',good:snapshot.living>=50});
  }
  const oldNew=N.newGame,oldResolve=N.resolveMonth,oldPrompt=N.aiPrompt;
  N.newGame=(name,ch)=>init(oldNew(name,ch));
  N.resolveMonth=(g,lines)=>{step(g,lines);oldResolve(g,lines);if(g.development){solve(g,false);applyMacro(g);const last=g.development.history.at(-1);if(last&&last.m===g.month)Object.assign(last,g.development.summary);}};
  N.aiPrompt=(g,res)=>{const p=oldPrompt(g,res);if(g.development)p.user+='\nPROVINCE REALITY: '+JSON.stringify({summary:g.development.summary,sites:g.development.queue.filter(x=>!x.complete),competition:g.development.competition,changes:g.development.changes.slice(0,3)})+'\nDo not claim provincial buildings completed or appeared unless recorded in this state. Shortages, construction schedules, household pressures and foreign competition are real constraints.';return p;};
  const oldDirector=C.directorPrompt;
  C.directorPrompt=g=>{const prompt=oldDirector(g);if(g.development){prompt.user+='\nPHYSICAL ECONOMY: '+JSON.stringify({summary:g.development.summary,competition:g.development.competition,foreignConstruction:g.development.worldBuilds,sites:g.development.queue.filter(x=>!x.complete).map(x=>({provinceId:x.provinceId,type:x.type,progress:x.progress}))});prompt.system+=' The engine decides investment competition winners and building completions. You may describe competing bids, pressure and negotiations, but do not announce a winner or a completed asset unless it is recorded in PHYSICAL ECONOMY.';}return prompt;};
  window.NSProvinces={BUILDINGS,init,solve,aggregate,slots,canStart,quote,build,intervene,compact,bid,bidScore,completeNational,step};
})();
