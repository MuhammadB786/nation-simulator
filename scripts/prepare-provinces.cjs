const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),box={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'province-geography.js'),'utf8'),box);
const geography=box.window.NSProvinceGeography;
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const corrections={'Guangzhou Province':'Guangdong Province','Ningxia Ningxia Hui Autonomous Region':'Ningxia Hui Autonomous Region','Rio Granda do Norte':'Rio Grande do Norte','Rio de Jeneiro':'Rio de Janeiro'};
const roster={};
for(const [country,geo]of Object.entries(geography)){
  roster[country]={iso:geo.iso,source:geo.source,provinces:[]};
  for(const f of geo.features){
    const original=f.properties.name,name=corrections[original]||original;
    const id=geo.iso.toLowerCase()+'-'+norm(name);
    const controlled=!(country==='China'&&original==='Taiwan Province');
    f.properties={...f.properties,shapeName:name,provinceId:id,controlled};
    const rounded=x=>typeof x==='number'?Math.round(x*10000)/10000:x.map(rounded);
    f.geometry.coordinates=rounded(f.geometry.coordinates);
    if(!controlled)continue;
    roster[country].provinces.push({id,name,aliases:[original],geoId:f.properties.id});
  }
}
fs.writeFileSync(path.join(root,'province-geography.js'),'/* Bundled geoBoundaries gbOpen ADM1 geometry; source and license metadata accompany each country. See GEOGRAPHY.md. */\nwindow.NSProvinceGeography='+JSON.stringify(geography)+';\n');
fs.writeFileSync(path.join(root,'province-data.js'),'/* Stable province identities derived from the bundled ADM1 geometry. Economic values are authored simulation abstractions, not census measurements. */\nwindow.NSProvinceData='+JSON.stringify(roster)+';\n');
console.log(Object.entries(roster).map(([n,v])=>n+': '+v.provinces.length+' administered units').join('\n'));
