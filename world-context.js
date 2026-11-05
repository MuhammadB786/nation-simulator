/* World context: capitals, first-level regions, culture-appropriate naming,
   entrenched political systems, social blocs, and how other states read you.
   Approximate real-world reference used as simulation context, not live data. */
if (!window.WorldContext) (function(){

const CAP = `Pakistan|Islamabad
India|New Delhi
China|Beijing
United States|Washington
Indonesia|Jakarta
Brazil|Brasília
Nigeria|Abuja
Bangladesh|Dhaka
Russia|Moscow
Mexico|Mexico City
Japan|Tokyo
Ethiopia|Addis Ababa
Philippines|Manila
Egypt|Cairo
Vietnam|Hanoi
Turkey|Ankara
Iran|Tehran
Germany|Berlin
Thailand|Bangkok
United Kingdom|London
France|Paris
Italy|Rome
South Africa|Pretoria
Tanzania|Dodoma
Myanmar|Naypyidaw
Kenya|Nairobi
South Korea|Seoul
Colombia|Bogotá
Spain|Madrid
Uganda|Kampala
Argentina|Buenos Aires
Algeria|Algiers
Sudan|Khartoum
Ukraine|Kyiv
Iraq|Baghdad
Afghanistan|Kabul
Poland|Warsaw
Canada|Ottawa
Morocco|Rabat
Saudi Arabia|Riyadh
Uzbekistan|Tashkent
Peru|Lima
Angola|Luanda
Malaysia|Kuala Lumpur
Mozambique|Maputo
Ghana|Accra
Yemen|Sanaa
Nepal|Kathmandu
Venezuela|Caracas
Madagascar|Antananarivo
Côte d'Ivoire|Yamoussoukro
Cameroon|Yaoundé
Niger|Niamey
Sri Lanka|Colombo
Burkina Faso|Ouagadougou
Mali|Bamako
Romania|Bucharest
Malawi|Lilongwe
Chile|Santiago
Kazakhstan|Astana
Zambia|Lusaka
Ecuador|Quito
Syria|Damascus
Netherlands|Amsterdam
Senegal|Dakar
Cambodia|Phnom Penh
Chad|N'Djamena
Somalia|Mogadishu
Zimbabwe|Harare
Guinea|Conakry
Rwanda|Kigali
Benin|Porto-Novo
Burundi|Gitega
Tunisia|Tunis
Bolivia|La Paz
Belgium|Brussels
Haiti|Port-au-Prince
Jordan|Amman
Dominican Republic|Santo Domingo
Cuba|Havana
Sweden|Stockholm
Honduras|Tegucigalpa
Czechia|Prague
Azerbaijan|Baku
Greece|Athens
Papua New Guinea|Port Moresby
Portugal|Lisbon
Hungary|Budapest
Israel|Jerusalem
Austria|Vienna
Belarus|Minsk
Switzerland|Bern
Togo|Lomé
Sierra Leone|Freetown
Laos|Vientiane
Libya|Tripoli
Kyrgyzstan|Bishkek
Turkmenistan|Ashgabat
Nicaragua|Managua
Serbia|Belgrade
Congo (DRC)|Kinshasa
Congo (Republic)|Brazzaville
Denmark|Copenhagen
Finland|Helsinki
Norway|Oslo
Ireland|Dublin
New Zealand|Wellington
Australia|Canberra
Singapore|Singapore
United Arab Emirates|Abu Dhabi
Qatar|Doha
Kuwait|Kuwait City
Oman|Muscat
Bahrain|Manama
Lebanon|Beirut
Palestine|Ramallah
North Korea|Pyongyang
Mongolia|Ulaanbaatar
Georgia|Tbilisi
Armenia|Yerevan
Bulgaria|Sofia
Croatia|Zagreb
Slovakia|Bratislava
Slovenia|Ljubljana
Lithuania|Vilnius
Latvia|Riga
Estonia|Tallinn
Albania|Tirana
Bosnia and Herzegovina|Sarajevo
North Macedonia|Skopje
Montenegro|Podgorica
Moldova|Chișinău
Botswana|Gaborone
Namibia|Windhoek
Mauritania|Nouakchott
Gabon|Libreville
Eritrea|Asmara
South Sudan|Juba
Central African Republic|Bangui
Liberia|Monrovia
Guinea-Bissau|Bissau
Gambia|Banjul
Lesotho|Maseru
Eswatini|Mbabane
Mauritius|Port Louis
Djibouti|Djibouti City
Equatorial Guinea|Malabo
Cabo Verde|Praia
Comoros|Moroni
Seychelles|Victoria
São Tomé and Príncipe|São Tomé
Timor-Leste|Dili
Brunei|Bandar Seri Begawan
Bhutan|Thimphu
Maldives|Malé
Fiji|Suva
Solomon Islands|Honiara
Vanuatu|Port Vila
Samoa|Apia
Tonga|Nuku'alofa
Guatemala|Guatemala City
El Salvador|San Salvador
Costa Rica|San José
Panama|Panama City
Uruguay|Montevideo
Paraguay|Asunción
Jamaica|Kingston
Trinidad and Tobago|Port of Spain
Guyana|Georgetown
Suriname|Paramaribo
Belize|Belmopan
Bahamas|Nassau
Iceland|Reykjavík
Luxembourg|Luxembourg
Malta|Valletta
Cyprus|Nicosia
Tajikistan|Dushanbe`;

const PROV = `Pakistan|Punjab,Sindh,Khyber Pakhtunkhwa,Balochistan,Gilgit-Baltistan,Azad Kashmir
India|Uttar Pradesh,Maharashtra,Bihar,West Bengal,Tamil Nadu,Assam
China|Guangdong,Sichuan,Henan,Jiangsu,Shandong,Xinjiang
United States|California,Texas,New York,Florida,Ohio,Arizona
Indonesia|West Java,East Java,North Sumatra,South Sulawesi,Papua,East Kalimantan
Brazil|São Paulo,Minas Gerais,Bahia,Rio de Janeiro,Paraná,Amazonas
Nigeria|Lagos,Kano,Rivers,Kaduna,Borno,Oyo
Bangladesh|Dhaka,Chattogram,Khulna,Rajshahi,Sylhet,Rangpur
Russia|Moscow Oblast,Saint Petersburg,Tatarstan,Sverdlovsk,Krasnodar,Primorsky
Mexico|State of México,Jalisco,Nuevo León,Veracruz,Oaxaca,Chiapas
Japan|Kantō,Kansai,Chūbu,Kyūshū,Tōhoku,Hokkaidō
Ethiopia|Oromia,Amhara,Tigray,Somali,Sidama,Afar
Philippines|Metro Manila,Central Luzon,Calabarzon,Cebu,Davao,Bangsamoro
Egypt|Cairo,Alexandria,Giza,Upper Egypt,Nile Delta,North Sinai
Vietnam|Hanoi,Ho Chi Minh City,Da Nang,Mekong Delta,Central Highlands,Northern Uplands
Turkey|Marmara,Central Anatolia,Aegean,Southeastern Anatolia,Black Sea,Mediterranean
Iran|Tehran,Isfahan,Khuzestan,Fars,Sistan and Baluchestan,East Azerbaijan
Germany|Bavaria,North Rhine-Westphalia,Baden-Württemberg,Saxony,Lower Saxony,Hesse
Thailand|Bangkok,Isan,Chiang Mai,Eastern Seaboard,Southern Border Provinces,Central Plains
United Kingdom|London,South East,North West,Scotland,Wales,Northern Ireland
France|Île-de-France,Hauts-de-France,Occitanie,Grand Est,Nouvelle-Aquitaine,Provence
Italy|Lombardy,Lazio,Campania,Sicily,Veneto,Piedmont
South Africa|Gauteng,KwaZulu-Natal,Western Cape,Eastern Cape,Limpopo,Free State
Kenya|Nairobi,Mombasa,Kisumu,Rift Valley,North Eastern,Central
Ukraine|Kyiv,Kharkiv,Odesa,Dnipro,Lviv,Zaporizhzhia
Iraq|Baghdad,Basra,Nineveh,Anbar,Kurdistan Region,Najaf
Argentina|Buenos Aires,Córdoba,Santa Fe,Mendoza,Patagonia,Salta
Colombia|Bogotá,Antioquia,Valle del Cauca,Atlántico,Chocó,Amazonas
Spain|Madrid,Catalonia,Andalusia,Basque Country,Valencia,Galicia
Poland|Masovia,Silesia,Greater Poland,Lesser Poland,Pomerania,Łódź
Canada|Ontario,Quebec,British Columbia,Alberta,Manitoba,Nova Scotia
Saudi Arabia|Riyadh,Makkah,Eastern Province,Asir,Madinah,Tabuk
Morocco|Casablanca-Settat,Rabat-Salé,Marrakesh-Safi,Fès-Meknès,Tanger-Tétouan,Souss-Massa
Malaysia|Selangor,Johor,Penang,Sabah,Sarawak,Kelantan
Kazakhstan|Almaty,Astana,Karaganda,Mangystau,Shymkent,East Kazakhstan
Australia|New South Wales,Victoria,Queensland,Western Australia,South Australia,Tasmania
Peru|Lima,Arequipa,Cusco,Piura,Loreto,Puno
Chile|Santiago,Valparaíso,Antofagasta,Biobío,Araucanía,Magallanes
Congo (DRC)|Kinshasa,Katanga,North Kivu,South Kivu,Kasai,Ituri
Sudan|Khartoum,Darfur,Kordofan,Red Sea,Blue Nile,Northern
Myanmar|Yangon,Mandalay,Rakhine,Shan,Kachin,Ayeyarwady
Sri Lanka|Western,Central,Northern,Eastern,Southern,Uva
Nepal|Bagmati,Madhesh,Koshi,Lumbini,Karnali,Gandaki
Afghanistan|Kabul,Kandahar,Herat,Balkh,Nangarhar,Helmand
South Korea|Seoul,Gyeonggi,Busan,Daegu,Jeolla,Gangwon
Netherlands|North Holland,South Holland,North Brabant,Gelderland,Utrecht,Limburg
Sweden|Stockholm,Västra Götaland,Skåne,Norrbotten,Uppsala,Östergötland
Venezuela|Caracas,Zulia,Miranda,Carabobo,Bolívar,Táchira
Uzbekistan|Tashkent,Samarkand,Fergana,Bukhara,Karakalpakstan,Andijan`;

const NAMES = {
  southAsianMuslim:{ f:['Ayesha','Bilal','Fatima','Hassan','Imran','Kiran','Mahira','Nadia','Omar','Rabia','Saad','Tariq','Usman','Zainab','Hamza','Sana'], l:['Chaudhry','Khan','Qureshi','Sheikh','Malik','Bhutto','Abbasi','Jatoi','Mengal','Achakzai','Gilani','Rashid','Baloch','Durrani'] },
  indic:{ f:['Aditi','Arjun','Deepa','Gaurav','Kavita','Manish','Neha','Prakash','Rohan','Shalini','Vikram','Ananya','Sanjay','Meera'], l:['Sharma','Iyer','Reddy','Banerjee','Patel','Nair','Chatterjee','Singh','Rao','Gogoi','Deshmukh','Verma'] },
  arab:{ f:['Amina','Bashar','Dalia','Fadi','Hala','Ibrahim','Jamila','Karim','Layla','Mustafa','Nour','Rami','Samira','Youssef'], l:['Al-Masri','Haddad','Al-Sabah','Nasser','Al-Amin','Khalidi','Barakat','Al-Rashid','Mansour','Zayed','Al-Fayez'] },
  persian:{ f:['Arash','Darya','Farid','Golnar','Hossein','Kian','Leila','Mehdi','Nasrin','Parvin','Reza','Shirin','Yasmin'], l:['Ahmadi','Rostami','Kazemi','Tehrani','Shirazi','Mousavi','Bakhtiari','Sadeghi','Nouri'] },
  turkic:{ f:['Aylin','Berk','Cemal','Deniz','Emre','Gülnara','Kerem','Leyla','Murat','Nurlan','Selin','Timur','Zarina'], l:['Yılmaz','Demir','Kaya','Aliyev','Nazarbayev','Karimov','Çelik','Doğan','Turgunov','Ergün'] },
  slavic:{ f:['Anastasia','Bohdan','Dmitri','Elena','Ivan','Katarzyna','Miroslav','Natalia','Oleg','Petra','Svetlana','Tomasz','Vera'], l:['Kowalski','Petrov','Novák','Ivanenko','Sokolov','Horvat','Dragović','Kaczmarek','Volkov','Melnyk'] },
  germanic:{ f:['Annika','Bernd','Claudia','Dieter','Elke','Florian','Greta','Hendrik','Ingrid','Jonas','Katrin','Lukas'], l:['Aumann','Vogel','Schneider','Bakker','Weber','de Vries','Hoffmann','Reinholt','Brandt','Maes'] },
  nordic:{ f:['Astrid','Bjørn','Elin','Finn','Hanne','Jonas','Kari','Lars','Mette','Nils','Sigrid','Torvald'], l:['Halvorsen','Bergström','Lindqvist','Jónsdóttir','Nyberg','Rask','Sørensen','Virtanen','Dahl'] },
  romance:{ f:['Alessandra','Bruno','Camille','Diogo','Elena','Fabien','Giulia','Hugo','Isabel','Luca','Mariana','Rafael','Sofia','Thierry'], l:['Vasseur','Moreau','Marchetti','Ferreira','Salvatierra','Duarte','Rossi','Dumont','Barbosa','Coelho'] },
  anglo:{ f:['Alice','Callum','Eleanor','Grace','Harold','Imogen','James','Kelsey','Martin','Naomi','Oliver','Ruth'], l:['Whitfield','Marsden','Okonkwo-Hale','Carrington','Bramley','Nkemdirim','Ashworth','Fenwick','Sloane'] },
  westAfrican:{ f:['Abena','Chinedu','Fatou','Ibrahim','Kwame','Ngozi','Oumar','Sekou','Yaa','Amadou','Folake','Kojo'], l:['Okonjo','Diallo','Mensah','Traoré','Adeyemi','Cissé','Boateng','Nwosu','Keïta','Sanogo'] },
  eastAfrican:{ f:['Amani','Berhane','Chipo','Dawit','Halima','Joseph','Leila','Mwangi','Ngoma','Rehema','Tesfaye','Zuriel'], l:['Mwangi','Bekele','Achieng','Ngoma','Hailu','Mutua','Banda','Nyerere','Kagame','Abera'] },
  sinitic:{ f:['Bo','Chen','Fang','Hui','Jian','Lei','Mei','Ning','Qiang','Wei','Xia','Yan'], l:['Zhang','Wang','Li','Chen','Liu','Huang','Zhao','Wu','Lin','Sun'] },
  japanese:{ f:['Aiko','Daichi','Emi','Haruto','Kaori','Kenji','Mio','Naoki','Rina','Sho','Yuki','Takumi'], l:['Tanaka','Watanabe','Fujimoto','Kobayashi','Nakamura','Ishikawa','Yamashita','Ono'] },
  korean:{ f:['Bora','Doyun','Eunji','Haneul','Jihoon','Minseo','Seojun','Sooyeon','Yerin','Jiwoo'], l:['Kim','Lee','Park','Choi','Jung','Kang','Yoon','Han'] },
  seAsian:{ f:['Anh','Budi','Chariya','Dewi','Fajar','Kanya','Linh','Maria','Nurul','Ratana','Somchai','Thanh'], l:['Nguyen','Wibowo','Santos','Sombat','Tran','Pramoj','Hakim','Reyes','Suryani','Phan'] },
  latam:{ f:['Alejandra','Bruno','Carla','Diego','Elena','Fernando','Gabriela','Hector','Isabela','Joaquín','Lucía','Mateo'], l:['Salvatierra','Quispe','Mendoza','Herrera','Vargas','Castillo','Ocampo','Rivas','Zambrano','Peralta'] },
  pacific:{ f:['Ana','Filipo','Iosefa','Leilani','Mele','Ratu','Sione','Tevita','Vaea'], l:['Tuilagi','Rabuka','Tupou','Havili','Naidu','Sopoaga','Kalou'] }
};

const CULT = {
  Pakistan:'southAsianMuslim', Afghanistan:'southAsianMuslim', Bangladesh:'southAsianMuslim', Maldives:'southAsianMuslim',
  India:'indic', Nepal:'indic', 'Sri Lanka':'indic', Bhutan:'indic', Mauritius:'indic',
  Iran:'persian', Tajikistan:'persian',
  Turkey:'turkic', Azerbaijan:'turkic', Kazakhstan:'turkic', Uzbekistan:'turkic', Turkmenistan:'turkic', Kyrgyzstan:'turkic',
  China:'sinitic', Singapore:'sinitic', Japan:'japanese', 'South Korea':'korean', 'North Korea':'korean', Mongolia:'turkic',
  Israel:'arab', Cyprus:'romance', Georgia:'slavic', Armenia:'slavic',
  Russia:'slavic', Ukraine:'slavic', Belarus:'slavic', Poland:'slavic', Czechia:'slavic', Slovakia:'slavic',
  Serbia:'slavic', Croatia:'slavic', Slovenia:'slavic', 'Bosnia and Herzegovina':'slavic', 'North Macedonia':'slavic',
  Montenegro:'slavic', Bulgaria:'slavic', Moldova:'romance', Romania:'romance', Albania:'slavic', Kosovo:'slavic',
  Germany:'germanic', Austria:'germanic', Switzerland:'germanic', Netherlands:'germanic', Belgium:'germanic',
  Luxembourg:'germanic', Liechtenstein:'germanic',
  Sweden:'nordic', Norway:'nordic', Denmark:'nordic', Finland:'nordic', Iceland:'nordic', Estonia:'nordic',
  Latvia:'nordic', Lithuania:'slavic',
  France:'romance', Italy:'romance', Spain:'romance', Portugal:'romance', Greece:'romance', Malta:'romance',
  Monaco:'romance', 'San Marino':'romance', Andorra:'romance', 'Vatican City':'romance',
  'United Kingdom':'anglo', Ireland:'anglo', 'United States':'anglo', Canada:'anglo', Australia:'anglo',
  'New Zealand':'anglo', Bahamas:'anglo', Jamaica:'anglo', Barbados:'anglo', Guyana:'anglo', Belize:'anglo',
  Nigeria:'westAfrican', Ghana:'westAfrican', Senegal:'westAfrican', Mali:'westAfrican', 'Burkina Faso':'westAfrican',
  Niger:'westAfrican', Guinea:'westAfrican', 'Côte d\'Ivoire':'westAfrican', Benin:'westAfrican', Togo:'westAfrican',
  'Sierra Leone':'westAfrican', Liberia:'westAfrican', Gambia:'westAfrican', 'Guinea-Bissau':'westAfrican',
  Mauritania:'arab', Cameroon:'westAfrican', Chad:'arab', 'Cabo Verde':'romance',
  Ethiopia:'eastAfrican', Kenya:'eastAfrican', Tanzania:'eastAfrican', Uganda:'eastAfrican', Rwanda:'eastAfrican',
  Burundi:'eastAfrican', Somalia:'eastAfrican', Eritrea:'eastAfrican', 'South Sudan':'eastAfrican',
  Zambia:'eastAfrican', Zimbabwe:'eastAfrican', Malawi:'eastAfrican', Mozambique:'eastAfrican',
  'South Africa':'eastAfrican', Botswana:'eastAfrican', Namibia:'eastAfrican', Lesotho:'eastAfrican',
  Eswatini:'eastAfrican', Madagascar:'eastAfrican', 'Congo (DRC)':'eastAfrican', 'Congo (Republic)':'westAfrican',
  Gabon:'westAfrican', 'Equatorial Guinea':'romance', 'Central African Republic':'westAfrican',
  Djibouti:'arab', Comoros:'arab', Seychelles:'eastAfrican', 'São Tomé and Príncipe':'romance',
  Indonesia:'seAsian', Malaysia:'seAsian', Vietnam:'seAsian', Thailand:'seAsian', Philippines:'seAsian',
  Myanmar:'seAsian', Cambodia:'seAsian', Laos:'seAsian', Brunei:'seAsian', 'Timor-Leste':'seAsian',
  'Papua New Guinea':'pacific', Fiji:'pacific', 'Solomon Islands':'pacific', Vanuatu:'pacific', Samoa:'pacific',
  Tonga:'pacific', Kiribati:'pacific', Tuvalu:'pacific', Nauru:'pacific', Palau:'pacific',
  'Marshall Islands':'pacific', Micronesia:'pacific'
};
const BY_REGION = { AF:'westAfrican', AM:'latam', AS:'arab', EU:'romance', OC:'pacific' };

const CLOSED = ['North Korea','Turkmenistan','Eritrea','Afghanistan','Syria','Cuba','Belarus','Myanmar','Nicaragua','Sudan','Libya','Somalia','Yemen','Iran','Venezuela'];
const MILITARY = ['Pakistan','Egypt','Myanmar','Thailand','Algeria','Sudan','Mali','Burkina Faso','Niger','Chad','Zimbabwe','Venezuela','Guinea','Libya','Syria','Iran','Turkey','Indonesia','Bangladesh','Nigeria'];
const DYNASTIC = ['Pakistan','India','Bangladesh','Philippines','Indonesia','Sri Lanka','Nepal','Mexico','Argentina','Lebanon','Iraq','Nigeria','Kenya','Gabon','Togo','Azerbaijan','Turkmenistan','North Korea','Syria','Cambodia','Kazakhstan','Jordan','Morocco','Saudi Arabia','Brunei','Eswatini','Equatorial Guinea','Uganda','Zimbabwe','Tajikistan','Turkey','Italy','Greece','Thailand','Malaysia'];
const SANCTIONED = ['North Korea','Iran','Russia','Syria','Belarus','Myanmar','Venezuela','Cuba','Afghanistan','Eritrea','Sudan','Nicaragua'];
const NUCLEAR = ['United States','Russia','China','France','United Kingdom','India','Pakistan','Israel','North Korea'];

const capitals = {}; CAP.trim().split('\n').forEach(l => { const [a, b] = l.split('|'); capitals[a] = b; });
const provinces = {}; PROV.trim().split('\n').forEach(l => { const [a, b] = l.split('|'); provinces[a] = b.split(','); });

const culture = name => CULT[name] || null;
const cultureOf = n => culture(n.name) || BY_REGION[n.region] || 'anglo';

function personName(n, salt, hash) {
  const bank = NAMES[cultureOf(n)] || NAMES.anglo;
  const a = hash(n.name + salt), b = hash(n.name + salt + '_l');
  return bank.f[Math.floor(a * bank.f.length)] + ' ' + bank.l[Math.floor(b * bank.l.length)];
}

function regionsOf(n, hash) {
  if (provinces[n.name]) return provinces[n.name].slice();
  const cap = capitals[n.name];
  const seed = hash(n.name + 'prov');
  const flavour = [
    ['Northern Province','Southern Province','Eastern Province','Western Province','Central Province'],
    ['North Region','Coast Region','Highland Region','Interior Region','River Region'],
    ['Upper Province','Lower Province','Coastal Province','Frontier Province','Lake Province']
  ][Math.floor(seed * 3)];
  const out = flavour.slice(0, 5);
  out.unshift(cap ? 'Greater ' + cap : 'Capital District');
  return out;
}

// Entrenched system: how power actually works here, regardless of the label.
function regimeOf(n, hash) {
  const r = hash(n.name + 'reg');
  const closed = CLOSED.includes(n.name);
  const military = MILITARY.includes(n.name);
  const dynastic = DYNASTIC.includes(n.name) || n.difficulty >= 4;
  const sanctioned = SANCTIONED.includes(n.name);
  const nuclear = NUCLEAR.includes(n.name);
  let type, legislature, pressFree, coupRisk, patronage;
  if (n.gov === 'AB') {
    type = closed ? 'closed' : 'autocracy';
    legislature = r > 0.5 ? 'rubber-stamp assembly' : 'no legislature';
    pressFree = 0.1; coupRisk = 0.18; patronage = 0.85;
  } else if (n.gov === 'O') {
    type = 'contested';
    legislature = 'suspended or contested';
    pressFree = 0.25; coupRisk = 0.42; patronage = 0.8;
  } else if (n.difficulty >= 4) {
    type = military ? 'hybrid, military-influenced' : 'hybrid regime';
    legislature = 'elected, whipped hard';
    pressFree = 0.45; coupRisk = military ? 0.22 : 0.1; patronage = 0.7;
  } else {
    type = n.gov === 'M' ? 'constitutional monarchy' : 'consolidated democracy';
    legislature = 'elected';
    pressFree = 0.8; coupRisk = 0.02; patronage = 0.3;
  }
  return { type, legislature, pressFree, coupRisk, patronage, closed, military, dynastic, sanctioned, nuclear };
}

// Social blocs that actually react to legislation here.
function blocsOf(n, regime) {
  const cult = cultureOf(n);
  const out = [
    { id:'urban', name:'the urban middle class', wants:'prices and public services' },
    { id:'rural', name:'the rural districts', wants:'input subsidies and roads' }
  ];
  if (regime.dynastic) out.push({ id:'dynasty', name:'the landholding political families', wants:'their seats and their contracts' });
  if (regime.military) out.push({ id:'army', name:'the officer corps', wants:'procurement funded and its business interests untouched' });
  if (['southAsianMuslim','arab','persian','turkic'].includes(cult)) out.push({ id:'clergy', name:'the religious establishment', wants:'legislation checked against doctrine' });
  if (n.sectors.industry > 20) out.push({ id:'unions', name:'the industrial unions', wants:'wage indexation and no plant closures' });
  if (n.perCapita > 25000) out.push({ id:'pensioners', name:'the pensioner bloc', wants:'indexation protected' });
  else out.push({ id:'youth', name:'the youth bloc', wants:'jobs, visas and data prices' });
  if (n.sectors.energy > 8) out.push({ id:'resource', name:'the resource ministries and their contractors', wants:'export licences and no windfall tax' });
  if (regime.patronage > 0.6) out.push({ id:'brokers', name:'the provincial power brokers', wants:'development funds routed through them' });
  return out;
}

// How another state reads you, given your regime and standing.
function perception(you, them, rel, sim) {
  const yr = regimeOf(you, x => 0.5), tr = regimeOf(them, x => 0.5);
  if (tr.closed) return 'Their state media does not mention you. Contact runs through third parties.';
  if (yr.sanctioned && !tr.sanctioned) return 'Their foreign ministry treats you as a compliance problem before it treats you as a country.';
  if (rel > 78) return 'They regard you as an ally and expect to be consulted before you act.';
  if (rel > 55) return 'They regard you as a useful partner and price your goodwill accordingly.';
  if (rel > 32) return 'They regard you as a competitor to be managed, not a threat.';
  if (yr.nuclear) return 'They regard you as a risk that has to be lived with.';
  return 'They regard you as an adversary and legislate as though you were one.';
}


const PARTY_LINES = ["Pakistan|PML-N|PPP|PTI|JUI-F|MQM-P","India|Bharatiya Janata Party|Indian National Congress|Aam Aadmi Party|DMK|Trinamool Congress","Bangladesh|Awami League|Bangladesh Nationalist Party|Jatiya Party|Jamaat-e-Islami","Sri Lanka|National People's Power|Samagi Jana Balawegaya|SLPP|ITAK","Nepal|Nepali Congress|CPN (UML)|CPN (Maoist Centre)|RSP","Afghanistan|Taliban movement|Jamiat-e Islami|Hezb-e Islami","Turkey|AK Party|Republican People's Party|Nationalist Movement Party|DEM Party|İYİ Party","Iran|Principlists|Reformists|Moderation and Development","Iraq|State of Law Coalition|Sadrist Movement|Kurdistan Democratic Party|Taqaddum","Lebanon|Hezbollah|Free Patriotic Movement|Lebanese Forces|Amal Movement","Israel|Likud|Yesh Atid|Shas|Religious Zionism|Labor","Egypt|Mostaqbal Watan|New Wafd|Republican People's Party","Morocco|RNI|PJD|Authenticity and Modernity Party|Istiqlal","Algeria|FLN|RND|Movement of Society for Peace","Tunisia|Ennahda|Free Destourian Party|Independents","Nigeria|All Progressives Congress|Peoples Democratic Party|Labour Party|NNPP","Ghana|New Patriotic Party|National Democratic Congress","Kenya|UDA|Orange Democratic Movement|Jubilee Party|Wiper","South Africa|African National Congress|Democratic Alliance|Economic Freedom Fighters|uMkhonto weSizwe|IFP","Ethiopia|Prosperity Party|Ezema|OFC","Tanzania|Chama Cha Mapinduzi|Chadema|CUF","Uganda|National Resistance Movement|National Unity Platform|FDC","Zimbabwe|ZANU-PF|Citizens Coalition for Change","Angola|MPLA|UNITA","Congo (DRC)|UDPS|PPRD|Ensemble","Senegal|PASTEF|APR|Parti Socialiste","Indonesia|PDI-P|Golkar|Gerindra|PKB|PKS","Philippines|Lakas-CMD|PDP|Nacionalista|Liberal Party","Malaysia|Pakatan Harapan|Barisan Nasional|Perikatan Nasional|GPS","Thailand|Pheu Thai|People's Party|Bhumjaithai|Democrat Party","Vietnam|Communist Party of Vietnam","China|Communist Party of China","Japan|Liberal Democratic Party|Constitutional Democratic Party|Komeito|Ishin","South Korea|Democratic Party|People Power Party|Rebuilding Korea Party","Russia|United Russia|KPRF|LDPR|A Just Russia","Ukraine|Servant of the People|European Solidarity|Batkivshchyna","Kazakhstan|Amanat|Auyl|Respublica","Uzbekistan|Liberal Democratic Party|Milliy Tiklanish","Azerbaijan|New Azerbaijan Party|Musavat","United States|Democratic Party|Republican Party","Canada|Liberal Party|Conservative Party|New Democratic Party|Bloc Québécois","Mexico|Morena|PAN|PRI|Movimiento Ciudadano","Brazil|Workers' Party|Liberal Party|MDB|PSDB|PSOL","Argentina|Unión por la Patria|La Libertad Avanza|PRO|UCR","Colombia|Pacto Histórico|Centro Democrático|Partido Liberal|Cambio Radical","Chile|Socialist Party|Renovación Nacional|Republican Party|Frente Amplio","Peru|Fuerza Popular|Perú Libre|Acción Popular|Renovación Popular","Venezuela|PSUV|Unitary Platform","Bolivia|MAS|Comunidad Ciudadana|Creemos","Ecuador|Revolución Ciudadana|ADN|Pachakutik","United Kingdom|Labour|Conservative Party|Liberal Democrats|Reform UK|SNP","France|Renaissance|Rassemblement National|La France Insoumise|Les Républicains|Parti Socialiste","Germany|CDU/CSU|SPD|Alliance 90/The Greens|AfD|FDP|Die Linke","Italy|Fratelli d'Italia|Partito Democratico|Movimento 5 Stelle|Lega|Forza Italia","Spain|PSOE|Partido Popular|Vox|Sumar|ERC","Poland|Law and Justice|Civic Coalition|Confederation|Left|Third Way","Netherlands|PVV|VVD|GroenLinks-PvdA|NSC|D66","Greece|New Democracy|SYRIZA|PASOK|KKE","Portugal|Socialist Party|Social Democratic Party|Chega","Sweden|Social Democrats|Moderates|Sweden Democrats|Centre Party","Romania|PSD|PNL|AUR|USR","Hungary|Fidesz|Tisza|Democratic Coalition|Jobbik","Czechia|ANO|Spolu|Pirates|SPD","Serbia|SNS|Serbia Against Violence|Socialist Party of Serbia","Australia|Australian Labor Party|Liberal-National Coalition|Australian Greens","New Zealand|Labour Party|National Party|ACT|Green Party"];
const CORRUPT_LINES = ["Pakistan|military-linked commercial holdings|sugar and wheat support cartels|provincial development funds routed through political families","India|opaque party finance|state-level land conversion rackets|procurement in road and rail contracts","Bangladesh|banking-sector insider lending|export incentive fraud|infrastructure cost inflation","Nigeria|fuel subsidy claims against phantom cargoes|crude oil theft with official protection|state security votes","Russia|siloviki protection rents|procurement through connected intermediaries|offshore asset structuring","Argentina|provincial patronage payrolls|arbitrage between official and parallel exchange rates|public works kickbacks","Brazil|construction cartel bidding|congressional amendment budgets|state enterprise appointments","Mexico|security force capture by criminal groups|public works overpricing|fuel theft from state pipelines","Indonesia|forestry and mining licence sales|regional head bribery|state enterprise procurement","Philippines|pork barrel congressional funds|customs undervaluation|police protection rackets","Egypt|military enterprises outside the budget|land allocation to connected developers|customs facilitation","South Africa|state capture of public enterprises|municipal tender fraud|police procurement","Kenya|county procurement|fuel and maize import cartels|ghost worker payrolls","Ukraine|customs undervaluation|defence procurement intermediaries|land and energy transfers","Iraq|ghost soldiers on defence payrolls|oil smuggling networks|ministry posts allocated by party","Lebanon|central bank financial engineering|electricity import contracts|port and customs revenue","Venezuela|state oil procurement|foreign exchange allocation|food import programmes","Turkey|megaproject guarantees|state bank lending to connected firms|customs and licensing","China|local government financing vehicles|land sales|discipline cases used factionally","Vietnam|land conversion licences|state enterprise procurement|customs clearance","Angola|oil revenue transfers offshore|construction contracts to connected firms|diamond concessions","Congo (DRC)|mining concession allocation|customs at eastern border posts|security payroll fraud","Iran|preferential foreign exchange allocation|foundations outside state audit|sanctions-evasion intermediaries","Kazakhstan|resource licence allocation|state fund investments|customs at the union border"];
const CRED_LINES = ["Pakistan|IMF Extended Fund Facility|Chinese policy bank rollovers|Gulf deposits at the central bank","Argentina|IMF Extended Fund Facility|provincial dollar bonds|peso-linked domestic debt","Sri Lanka|restructured bondholder committee|bilateral Chinese and Indian credit|IMF programme conditions","Egypt|IMF programme|Gulf sovereign deposits|treasury bill rollover at high yields","Ghana|Eurobond restructuring committee|IMF programme|domestic debt exchange","Zambia|official creditor committee|Chinese bilateral lenders|Eurobond holders","Kenya|syndicated commercial loans|Eurobond buyback window|IMF programme","Ethiopia|G20 common framework creditors|Chinese policy banks|IMF staff monitoring","Lebanon|defaulted Eurobond holders|central bank losses|unmet IMF preconditions","Turkey|external commercial rollover|Gulf swap lines|FX-protected deposit scheme","Nigeria|Eurobond market|central bank ways and means|World Bank budget support"];
const parseMulti = arr => { const o = {}; arr.forEach(l => { const p = l.split('|'); o[p[0]] = p.slice(1); }); return o; };
const parties = parseMulti(PARTY_LINES);
const corruptionVectors = parseMulti(CORRUPT_LINES);
const creditors = parseMulti(CRED_LINES);
const GENERIC_PARTIES = {
  democracy:['the Governing Party','the Opposition Alliance','the Liberal Bloc','the Social Democrats','the National Front'],
  hybrid:['the Governing Party','the Opposition Alliance','the Regionalist Bloc','the Religious Party'],
  closed:['the ruling party','the state council','the security bureau'],
  monarchy:['the palace bloc','the merchant houses','the reformist ministers'],
  contested:['the transitional council','the armed opposition','the civil coalition']
};
function partiesOf(n, regime) {
  if (parties[n.name]) return parties[n.name].slice();
  const key = regime.closed ? 'closed' : regime.type === 'contested' ? 'contested'
    : n.gov === 'AB' ? 'closed' : n.gov === 'M' ? 'monarchy'
    : regime.type.indexOf('hybrid') === 0 ? 'hybrid' : 'democracy';
  return GENERIC_PARTIES[key].slice();
}
function corruptionOf(n, regime) {
  if (corruptionVectors[n.name]) return corruptionVectors[n.name].slice();
  const out = [];
  if (regime.patronage > 0.6) out.push('development funds routed through political families');
  if (regime.military) out.push('military-linked commercial holdings outside the budget');
  if (n.sectors.energy > 8) out.push('resource licences allocated to connected firms');
  out.push('public procurement in construction contracts');
  out.push('customs clearance and import licensing');
  return out.slice(0, 3);
}
function creditorsOf(n) {
  if (creditors[n.name]) return creditors[n.name].slice();
  const out = [];
  if (n.externalShare > 0.4) out.push('external bondholders');
  if (n.imfHistory) out.push('IMF programme review');
  out.push('domestic banks holding treasury paper');
  if (n.externalShare > 0.3) out.push('bilateral official creditors');
  return out.slice(0, 3);
}

window.WorldContext = { parties, partiesOf, corruptionOf, creditorsOf, capitals, provinces, NAMES, CULT, CLOSED, MILITARY, DYNASTIC, SANCTIONED, NUCLEAR,
  cultureOf, personName, regionsOf, regimeOf, blocsOf, perception };
})();
