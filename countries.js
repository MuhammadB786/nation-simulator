/* 195 playable nations (UN 193 + Vatican City + Palestine).
   Figures are approximate real-world baselines used as sim starting conditions:
   gdp = nominal US$bn, pop = millions, debt = % of GDP.
   gov: P presidential · S semi-presidential · PA parliamentary · M constitutional monarchy · AB absolute/one-party · O transitional/contested */
if (!window.NationData) (function(){
const RAW = `
Algeria|247|46.8|55|AF|P|3
Angola|113|36.7|85|AF|P|4
Benin|20|13.7|54|AF|P|3
Botswana|20|2.7|24|AF|PA|2
Burkina Faso|20|23.3|58|AF|O|5
Burundi|3.1|13.2|68|AF|P|5
Cabo Verde|2.6|0.6|113|AF|S|3
Cameroon|51|28.6|43|AF|P|4
Central African Republic|2.8|5.7|56|AF|P|5
Chad|13.5|18.3|53|AF|P|5
Comoros|1.4|0.9|35|AF|P|4
Congo (Republic)|15.5|6.1|97|AF|P|4
Congo (DRC)|73|105|24|AF|S|5
Côte d'Ivoire|87|31.2|58|AF|P|3
Djibouti|4.1|1.1|72|AF|P|4
Egypt|396|113|96|AF|P|4
Equatorial Guinea|12.1|1.7|39|AF|P|4
Eritrea|2.6|3.7|164|AF|P|5
Eswatini|4.9|1.2|43|AF|M|4
Ethiopia|205|126|38|AF|PA|5
Gabon|21|2.4|71|AF|P|4
Gambia|2.5|2.8|72|AF|P|4
Ghana|76|34|83|AF|P|3
Guinea|23|14.2|41|AF|P|4
Guinea-Bissau|2|2.2|80|AF|S|5
Kenya|108|55|73|AF|P|3
Lesotho|2.4|2.3|60|AF|M|4
Liberia|4.4|5.4|55|AF|P|4
Libya|50|6.9|55|AF|O|5
Madagascar|16|30.3|56|AF|S|4
Malawi|13|21|91|AF|P|4
Mali|21|23.3|52|AF|O|5
Mauritania|10.9|4.9|48|AF|P|4
Mauritius|14.4|1.3|80|AF|PA|2
Morocco|152|37.8|70|AF|M|3
Mozambique|21|33.9|96|AF|P|4
Namibia|13|2.6|66|AF|P|3
Niger|17|26.2|52|AF|O|5
Nigeria|253|223|46|AF|P|4
Rwanda|14|14|61|AF|P|3
São Tomé and Príncipe|0.7|0.2|60|AF|S|4
Senegal|31|17.7|81|AF|P|3
Seychelles|2.1|0.1|60|AF|P|2
Sierra Leone|4|8.6|93|AF|P|4
Somalia|11|18|6|AF|P|5
South Africa|381|60.4|74|AF|PA|4
South Sudan|8|11.1|60|AF|P|5
Sudan|29|48|256|AF|O|5
Tanzania|79|67|47|AF|P|3
Togo|9.2|9.1|68|AF|P|4
Tunisia|52|12.5|80|AF|PA|4
Uganda|49|48.6|52|AF|P|3
Zambia|28|20.6|127|AF|P|4
Zimbabwe|35|16.7|98|AF|P|5
Antigua and Barbuda|2|0.09|89|AM|PA|2
Argentina|641|46.2|155|AM|P|5
Bahamas|14|0.4|80|AM|PA|2
Barbados|6.4|0.28|115|AM|PA|3
Belize|3.2|0.4|67|AM|PA|3
Bolivia|46|12.4|84|AM|P|4
Brazil|2170|216|84|AM|P|4
Canada|2140|40|107|AM|PA|2
Chile|335|19.6|38|AM|P|2
Colombia|364|52|55|AM|P|3
Costa Rica|86|5.2|63|AM|P|2
Cuba|107|11.2|60|AM|O|5
Dominica|0.7|0.07|100|AM|PA|3
Dominican Republic|121|11.3|60|AM|P|3
Ecuador|119|18|55|AM|P|4
El Salvador|35|6.4|84|AM|P|3
Grenada|1.3|0.13|75|AM|PA|2
Guatemala|102|18|30|AM|P|3
Guyana|17|0.8|25|AM|P|2
Haiti|20|11.6|30|AM|S|5
Honduras|34|10.6|50|AM|P|4
Jamaica|19|2.8|72|AM|PA|3
Mexico|1790|128|53|AM|P|4
Nicaragua|17|7|45|AM|P|4
Panama|83|4.4|55|AM|P|2
Paraguay|43|6.9|41|AM|P|3
Peru|268|34|33|AM|P|4
Saint Kitts and Nevis|1.1|0.05|60|AM|PA|2
Saint Lucia|2.5|0.18|75|AM|PA|2
Saint Vincent and the Grenadines|1.1|0.1|85|AM|PA|2
Suriname|3.5|0.63|90|AM|P|4
Trinidad and Tobago|28|1.5|53|AM|PA|3
United States|27360|335|123|AM|P|3
Uruguay|77|3.4|62|AM|P|2
Venezuela|102|28.3|150|AM|P|5
Afghanistan|14|42|8|AS|O|5
Armenia|24|2.8|48|AS|PA|4
Azerbaijan|73|10.1|20|AS|P|3
Bahrain|44|1.5|122|AS|M|3
Bangladesh|437|173|39|AS|PA|4
Bhutan|2.7|0.8|125|AS|M|3
Brunei|15|0.45|2|AS|AB|2
Cambodia|32|17|36|AS|M|3
China|17800|1412|84|AS|O|4
Cyprus|32|1.3|73|AS|P|2
Georgia|30|3.7|39|AS|PA|3
India|3730|1428|82|AS|PA|4
Indonesia|1420|277|39|AS|P|3
Iran|401|89|31|AS|O|5
Iraq|264|45|44|AS|PA|5
Israel|510|9.8|62|AS|PA|4
Japan|4210|124|255|AS|PA|3
Jordan|51|11.3|89|AS|M|4
Kazakhstan|262|20|24|AS|P|3
Kuwait|161|4.3|3|AS|M|2
Kyrgyzstan|13|7|48|AS|P|4
Laos|15|7.6|123|AS|O|4
Lebanon|20|5.5|180|AS|PA|5
Malaysia|430|34|67|AS|PA|3
Maldives|6.6|0.52|115|AS|P|3
Mongolia|19|3.4|80|AS|S|3
Myanmar|65|54|60|AS|O|5
Nepal|41|30.9|43|AS|PA|4
North Korea|18|26|0|AS|O|5
Oman|108|4.6|38|AS|AB|2
Pakistan|340|240|75|AS|PA|5
Palestine|17|5.4|50|AS|S|5
Philippines|437|117|57|AS|P|3
Qatar|235|2.7|41|AS|AB|1
Saudi Arabia|1070|36.9|26|AS|AB|2
Singapore|501|5.9|168|AS|PA|1
South Korea|1710|51.7|55|AS|P|3
Sri Lanka|84|22|105|AS|S|5
Syria|9|23|50|AS|O|5
Tajikistan|12|10.1|32|AS|P|4
Thailand|515|71.8|62|AS|M|3
Timor-Leste|2|1.4|15|AS|S|4
Turkmenistan|77|6.5|5|AS|P|3
Turkey|1110|85.3|32|AS|P|4
United Arab Emirates|504|9.5|31|AS|AB|1
Uzbekistan|91|35.6|35|AS|P|3
Vietnam|430|98.9|37|AS|O|3
Yemen|21|34|85|AS|O|5
Albania|23|2.8|60|EU|PA|3
Andorra|3.7|0.08|40|EU|PA|2
Austria|516|9.1|78|EU|PA|2
Belarus|72|9.2|41|EU|P|4
Belgium|633|11.7|105|EU|M|3
Bosnia and Herzegovina|27|3.2|29|EU|PA|4
Bulgaria|101|6.5|23|EU|PA|3
Croatia|82|3.9|63|EU|PA|2
Czechia|331|10.9|44|EU|PA|2
Denmark|405|5.9|30|EU|M|1
Estonia|41|1.4|20|EU|PA|2
Finland|300|5.6|76|EU|S|2
France|3050|68.4|112|EU|S|3
Germany|4460|84.5|64|EU|PA|3
Greece|239|10.4|162|EU|PA|4
Hungary|212|9.6|73|EU|PA|3
Iceland|31|0.39|61|EU|PA|1
Ireland|546|5.2|43|EU|PA|1
Italy|2250|58.9|137|EU|PA|4
Latvia|43|1.9|43|EU|PA|2
Liechtenstein|7.4|0.04|10|EU|M|1
Lithuania|78|2.9|38|EU|S|2
Luxembourg|86|0.66|25|EU|M|1
Malta|21|0.54|50|EU|PA|2
Moldova|16|2.5|35|EU|PA|4
Monaco|8.8|0.04|20|EU|M|1
Montenegro|7.4|0.62|65|EU|PA|3
Netherlands|1120|17.8|47|EU|M|2
North Macedonia|15|1.8|54|EU|PA|3
Norway|486|5.5|42|EU|M|1
Poland|811|36.8|50|EU|PA|3
Portugal|287|10.4|99|EU|S|2
Romania|351|19|49|EU|S|3
Russia|2020|144|20|EU|P|5
San Marino|1.9|0.03|65|EU|PA|2
Serbia|75|6.6|52|EU|PA|4
Slovakia|133|5.4|56|EU|PA|3
Slovenia|68|2.1|69|EU|PA|2
Spain|1580|48.4|107|EU|M|3
Sweden|593|10.5|31|EU|M|2
Switzerland|885|8.8|38|EU|S|1
Ukraine|179|37|84|EU|S|5
United Kingdom|3340|67.7|101|EU|M|3
Vatican City|0.02|0.001|0|EU|AB|1
Australia|1720|26.6|50|OC|PA|2
Fiji|5.5|0.94|80|OC|PA|3
Kiribati|0.28|0.13|20|OC|PA|3
Marshall Islands|0.28|0.04|20|OC|P|3
Micronesia|0.46|0.11|15|OC|P|3
Nauru|0.15|0.012|30|OC|PA|3
New Zealand|253|5.2|46|OC|PA|1
Palau|0.31|0.018|80|OC|P|2
Papua New Guinea|31|10.3|52|OC|PA|4
Samoa|0.94|0.22|45|OC|PA|2
Solomon Islands|1.7|0.74|15|OC|PA|3
Tonga|0.53|0.1|42|OC|M|3
Tuvalu|0.06|0.011|10|OC|PA|3
Vanuatu|1.1|0.33|45|OC|PA|3
`.trim();

const REGIONS = { AF: 'Africa', AM: 'Americas', AS: 'Asia', EU: 'Europe', OC: 'Oceania' };
const GOV = {
  P: 'Presidential republic', S: 'Semi-presidential republic', PA: 'Parliamentary republic',
  M: 'Constitutional monarchy', AB: 'Absolute or single-party state', O: 'Transitional government'
};
const CURRENCY = {
  'United States': '$', Japan: '¥', 'United Kingdom': '£', China: '¥',
  France: '€', Germany: '€', Italy: '€', Spain: '€', Netherlands: '€', Belgium: '€',
  Austria: '€', Portugal: '€', Ireland: '€', Finland: '€', Greece: '€', Slovakia: '€',
  Slovenia: '€', Estonia: '€', Latvia: '€', Lithuania: '€', Luxembourg: '€', Malta: '€',
  Cyprus: '€', Croatia: '€', Monaco: '€', 'San Marino': '€', 'Vatican City': '€', Andorra: '€', Montenegro: '€'
};

// Small states with no polygon at 110m resolution — drawn as markers [lat, lon].
const POINTS = {
  Andorra: [42.5, 1.52], 'Antigua and Barbuda': [17.1, -61.8], Bahrain: [26.03, 50.55],
  Barbados: [13.19, -59.54], 'Cabo Verde': [16, -24], Comoros: [-11.7, 43.3],
  Dominica: [15.41, -61.37], Grenada: [12.12, -61.68], Kiribati: [1.42, 173],
  Liechtenstein: [47.16, 9.55], Maldives: [3.2, 73.22], Malta: [35.9, 14.44],
  'Marshall Islands': [7.13, 171.18], Micronesia: [6.92, 158.16], Monaco: [43.73, 7.42],
  Nauru: [-0.52, 166.93], Palau: [7.5, 134.58], 'Saint Kitts and Nevis': [17.3, -62.73],
  'Saint Lucia': [13.9, -60.98], 'Saint Vincent and the Grenadines': [13.25, -61.19],
  Samoa: [-13.76, -172.1], 'San Marino': [43.94, 12.46], 'São Tomé and Príncipe': [0.34, 6.73],
  Seychelles: [-4.62, 55.45], Singapore: [1.35, 103.82], Tonga: [-21.18, -175.2],
  Tuvalu: [-8.52, 179.2], 'Vatican City': [41.9, 12.45], Mauritius: [-20.35, 57.55],
  Palestine: [31.95, 35.23], Bhutan: [27.5, 90.4]
};

// Natural Earth spellings → our canonical names.
const ALIASES = {
  'United States of America': 'United States', 'Dem. Rep. Congo': 'Congo (DRC)',
  'Democratic Republic of the Congo': 'Congo (DRC)', Congo: 'Congo (Republic)',
  'Republic of the Congo': 'Congo (Republic)', 'Central African Rep.': 'Central African Republic',
  'S. Sudan': 'South Sudan', 'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'Dominican Rep.': 'Dominican Republic', 'Eq. Guinea': 'Equatorial Guinea',
  'Solomon Is.': 'Solomon Islands', 'Ivory Coast': "Côte d'Ivoire", 'Cote d\'Ivoire': "Côte d'Ivoire",
  eSwatini: 'Eswatini', Swaziland: 'Eswatini', Macedonia: 'North Macedonia',
  'Czech Rep.': 'Czechia', 'East Timor': 'Timor-Leste', 'Cape Verde': 'Cabo Verde',
  'Lao PDR': 'Laos', Laos: 'Laos', 'Sao Tome and Principe': 'São Tomé and Príncipe',
  Korea: 'South Korea', 'Republic of Korea': 'South Korea', 'Dem. Rep. Korea': 'North Korea',
  'North Korea': 'North Korea', Burma: 'Myanmar', Türkiye: 'Turkey', Turkiye: 'Turkey',
  'United Rep. of Tanzania': 'Tanzania', 'Russian Federation': 'Russia',
  'Viet Nam': 'Vietnam', 'Brunei Darussalam': 'Brunei', 'Iran (Islamic Rep. of)': 'Iran',
  'Syrian Arab Republic': 'Syria', 'Micronesia (Fed. States of)': 'Micronesia',
  'Fed. States of Micronesia': 'Micronesia', 'Trinidad and Tobago': 'Trinidad and Tobago',
  'Gambia, The': 'Gambia', 'The Gambia': 'Gambia', 'Bahamas, The': 'Bahamas'
};

// Deterministic per-nation variation so every country plays differently but consistently.
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

const ALL = RAW.split('\n').map(line => {
  const [name, gdp, pop, debt, region, gov, diff] = line.split('|');
  const g = +gdp, p = +pop, d = +debt, difficulty = +diff;
  const r1 = hash(name), r2 = hash(name + 'a'), r3 = hash(name + 'b'), r4 = hash(name + 'c');
  const perCapita = (g * 1000) / p; // $k per head
  return {
    name, region, regionName: REGIONS[region], gov, govName: GOV[gov], difficulty,
    gdp: g, pop: p, debt: d, perCapita,
    cur: CURRENCY[name] || '$',
    hasPoint: !!POINTS[name], point: POINTS[name] || null,
    // starting sim state
    approval: Math.round(32 + r1 * 34 - (difficulty - 3) * 3),
    stability: Math.round(88 - difficulty * 9 + r2 * 12),
    influence: Math.round(Math.min(96, 8 + Math.log10(g + 1) * 19 + r3 * 10)),
    gdpGrowth: +(0.2 + r2 * 3.4 - (difficulty - 3) * 0.35).toFixed(1),
    cpi: +(1.2 + r3 * 2.6 + (difficulty - 3) * 0.6).toFixed(1),
    unemployment: +(3.6 + r4 * 7 + (difficulty - 3) * 1.1).toFixed(1),
    deficit: +(0.6 + r1 * 5.4 + (difficulty - 3) * 0.5).toFixed(1),
    rate: +(0.5 + difficulty * 0.5 + r4 * 2).toFixed(2),
    yield10: +(0.9 + difficulty * 0.55 + (d / 100) * 0.9 + r2 * 1.2).toFixed(2),
    seats: Math.max(41, Math.round(80 + Math.log10(p * 1e6) * 55 + r1 * 60)),
    unrest: Math.round(8 + difficulty * 9 + r3 * 14),
    cohesion: Math.round(78 - difficulty * 7 + r4 * 16),
    sectors: (() => {
      const svc = Math.round(38 + (perCapita / 70) * 40 + r1 * 8);
      const ind = Math.round(14 + r2 * 16);
      const eng = Math.round(3 + r3 * 12);
      return { services: Math.min(78, svc), industry: ind, energy: eng, agriculture: Math.max(1, 100 - Math.min(78, svc) - ind - eng) };
    })()
  };
}).sort((a, b) => a.name.localeCompare(b.name));

// Playable set: sovereign states of at least one million people.
const NATIONS = ALL.filter(n => n.pop >= 1);

// Sovereign debt structure — stock, who holds it, and what it costs to roll.
const HARD_CURRENCY = ['United States','Japan','United Kingdom','Switzerland','Denmark','Sweden','Norway','Canada','Australia','New Zealand','Singapore','South Korea','Israel','Czechia','Poland','Iceland'];
const EURO = ['France','Germany','Italy','Spain','Netherlands','Belgium','Austria','Portugal','Ireland','Finland','Greece','Slovakia','Slovenia','Estonia','Latvia','Lithuania','Luxembourg','Malta','Cyprus','Croatia'];
const IMF_HISTORY = ['Pakistan','Argentina','Egypt','Sri Lanka','Ghana','Zambia','Kenya','Ethiopia','Tunisia','Ecuador','Ukraine','Jordan','Bangladesh','Angola','Mozambique','Malawi','Suriname','Lebanon','Zimbabwe','Bolivia','Nigeria','Turkey','Morocco','Senegal','Ivory Coast','Costa Rica','Barbados','Jamaica','Mongolia','Armenia','Georgia','Moldova','Kyrgyzstan','Tajikistan','Uzbekistan','Nepal','Laos','Myanmar','Sudan','Somalia','Chad','Niger','Mali','Burkina Faso','Cameroon','Congo (DRC)','Congo (Republic)','Gabon','Guinea','Sierra Leone','Liberia','Madagascar','Rwanda','Uganda','Tanzania','Benin','Togo','Mauritania','Gambia','Guinea-Bissau','Central African Republic','Burundi','Eritrea','South Sudan','Haiti','Honduras','Nicaragua','El Salvador','Guatemala','Paraguay','Peru','Colombia','Panama','Dominican Republic','Venezuela'];
NATIONS.forEach(n => {
  const r = hash(n.name + 'debt'), r2 = hash(n.name + 'res');
  const hard = HARD_CURRENCY.includes(n.name) || EURO.includes(n.name);
  n.hardCurrency = hard;
  n.euro = EURO.includes(n.name);
  // share of the debt stock owed in foreign currency to external creditors
  n.externalShare = +clamp01(hard ? 0.05 + r * 0.18 : 0.28 + r * 0.42 + (n.difficulty - 3) * 0.06).toFixed(2);
  // import cover, months
  n.reserveMonths = +Math.max(0.4, (hard ? 5 + r2 * 6 : 4.6 + r2 * 4 - (n.difficulty - 3) * 1.5)).toFixed(1);
  // average remaining maturity of the stock, years
  n.avgMaturity = +(hard ? 6.5 + r * 3 : 4.2 + r * 3 - (n.difficulty - 3) * 0.5).toFixed(1);
  n.imfHistory = IMF_HISTORY.includes(n.name);
  n.rating = (() => {
    const score = 100 - n.debt * 0.35 - n.difficulty * 11 + Math.log10(n.gdp + 1) * 7 + (hard ? 14 : 0);
    const scale = ['D','CCC-','CCC','CCC+','B-','B','B+','BB-','BB','BB+','BBB-','BBB','BBB+','A-','A','A+','AA-','AA','AA+','AAA'];
    return scale[clamp(Math.round((score - 8) / 4.4), 0, scale.length - 1)];
  })();
});

function clamp01(v){ return Math.max(0.02, Math.min(0.95, v)); }
function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
const BY_NAME = Object.fromEntries(NATIONS.map(n => [n.name, n]));
const canonical = raw => (BY_NAME[raw] ? raw : ALIASES[raw] || null);

const fmtMoney = (n, cur = '$') => n >= 1000 ? cur + (n / 1000).toFixed(2) + 'T' : cur + n.toFixed(n < 10 ? 1 : 0) + 'bn';
const fmtPop = p => p >= 1 ? p.toFixed(p < 10 ? 1 : 0) + 'M' : (p * 1000).toFixed(0) + 'k';

window.NationData = { NATIONS, ALL, BY_NAME, ALIASES, POINTS, REGIONS, GOV, canonical, fmtMoney, fmtPop, hash };
})();
