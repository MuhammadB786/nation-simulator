// Import the same public ADM1 geometry used by the existing map. Run only when
// deliberately refreshing geography; building the game never uses the network.
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const countries={'Pakistan':'PAK','Germany':'DEU','United States':'USA','China':'CHN','Saudi Arabia':'SAU','Brazil':'BRA'};
async function json(url){const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw new Error(url+' '+r.status);return r.json();}
(async()=>{
  const entries=await Promise.all(Object.entries(countries).map(async([name,iso])=>{
    const meta=await json('https://www.geoboundaries.org/api/current/gbOpen/'+iso+'/ADM1/');
    const url=meta.simplifiedGeometryGeoJSON.replace('https://github.com/wmgeolab/geoBoundaries/raw/','https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/');
    const geo=await json(url);
    if(geo.type!=='FeatureCollection'||!Array.isArray(geo.features)||geo.features.length<4)throw new Error('Invalid geometry for '+name);
    for(const f of geo.features){if(typeof f.properties.shapeName!=='string'||!['Polygon','MultiPolygon'].includes(f.geometry.type))throw new Error('Invalid province');}
    return [name,{iso,features:geo.features.map(f=>({type:'Feature',properties:{name:f.properties.shapeName,id:f.properties.shapeID},geometry:f.geometry})),source:{boundaryID:meta.boundaryID,year:meta.boundaryYearRepresented,license:meta.boundaryLicense,source:meta.boundarySource,url:meta.simplifiedGeometryGeoJSON}}];
  }));
  const data=Object.fromEntries(entries);
  fs.writeFileSync(path.join(root,'province-geography.js'),'/* geoBoundaries gbOpen ADM1 geometry. Attribution and source metadata accompany each country. Administrative boundaries are a game map, not a position on territorial claims. */\nwindow.NSProvinceGeography='+JSON.stringify(data)+';\n');
  console.log(entries.map(([name,g])=>name+': '+g.features.length+' provinces').join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1;});
