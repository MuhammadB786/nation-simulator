/* Party landscapes. Leaders and seat counts reflect the most recent widely reported figures (2024–25); seats are rounded.
   cpi = Transparency International Corruption Perceptions Index 2024 (0 = highly corrupt, 100 = very clean). */
(function(){
const L = (name, short, leader, ideology, seats, role, record) => ({ name, short, leader, ideology, seats, role, record:record || '' });
const DATA = {
  'Pakistan': { cpi:27, chamber:'National Assembly', head:'Prime Minister Shehbaz Sharif', note:'A hybrid order: civilian coalition in office, the army leadership decisive on security, the economy and the selection of governments.', parties:[
    L('Pakistan Muslim League (N)','PML-N','Shehbaz Sharif','Centre-right, Punjab business base',123,'gov','Party founder Nawaz Sharif was disqualified in 2017 over the Panama Papers case.'),
    L('Pakistan Peoples Party','PPP','Bilawal Bhutto Zardari','Centre-left, Sindh base',73,'coalition','Long-running graft cases against party leadership; several dropped or ended in acquittal.'),
    L('Pakistan Tehreek-e-Insaf','PTI','Imran Khan (imprisoned)','Populist, anti-establishment',80,'opp','Founder serving sentences in cases he says are politically motivated; members sat as independents in 2024.'),
    L('Muttahida Qaumi Movement (P)','MQM-P','Khalid Maqbool Siddiqui','Urban Karachi, Mohajir',22,'coalition'),
    L('Jamiat Ulema-e-Islam (F)','JUI-F','Fazl-ur-Rehman','Religious conservative, Deobandi',10,'opp')] },
  'India': { cpi:38, chamber:'Lok Sabha', head:'Prime Minister Narendra Modi', note:'A dominant-party coalition with strong state governments and an assertive federal executive.', parties:[
    L('Bharatiya Janata Party','BJP','Narendra Modi','Hindu nationalist, centre-right',240,'gov','Electoral bonds scheme struck down by the Supreme Court in 2024.'),
    L('Telugu Desam Party','TDP','N. Chandrababu Naidu','Regional, Andhra Pradesh',16,'coalition'),
    L('Janata Dal (United)','JD(U)','Nitish Kumar','Regional, Bihar',12,'coalition'),
    L('Indian National Congress','INC','Mallikarjun Kharge','Centre-left',99,'opp'),
    L('Samajwadi Party','SP','Akhilesh Yadav','Socialist, Uttar Pradesh',37,'opp'),
    L('All India Trinamool Congress','AITC','Mamata Banerjee','Regional, West Bengal',29,'opp')] },
  'Argentina': { cpi:37, chamber:'Chamber of Deputies', head:'President Javier Milei', note:'A minority libertarian presidency governing by decree and veto against a Peronist-weighted Congress and powerful governors.', parties:[
    L('La Libertad Avanza','LLA','Javier Milei','Libertarian, radical austerity',39,'gov'),
    L('PRO','PRO','Mauricio Macri','Centre-right',37,'coalition'),
    L('Unión por la Patria','UxP','Cristina Fernández de Kirchner','Peronist, centre-left',98,'opp','Party leader convicted in the Vialidad public-works fraud case; sentence upheld in 2025.'),
    L('Unión Cívica Radical','UCR','Martín Lousteau','Centrist, radical tradition',34,'opp'),
    L('Hacemos Coalición Federal','HCF','Miguel Ángel Pichetto','Federalist centre',22,'opp')] },
  'Sri Lanka': { cpi:32, chamber:'Parliament', head:'President Anura Kumara Dissanayake', note:'A new government elected on an anti-corruption mandate after the 2022 default, governing inside an IMF programme.', parties:[
    L("National People's Power",'NPP','Anura Kumara Dissanayake','Left, anti-corruption',159,'gov'),
    L('Samagi Jana Balawegaya','SJB','Sajith Premadasa','Centre-right',40,'opp'),
    L('Ilankai Tamil Arasu Kachchi','ITAK','S. Shritharan','Tamil nationalist',8,'opp'),
    L('New Democratic Front','NDF','Ranil Wickremesinghe','Liberal conservative',5,'opp'),
    L('Sri Lanka Podujana Peramuna','SLPP','Mahinda Rajapaksa','Sinhala nationalist',3,'opp','Rajapaksa-era economic management blamed for the 2022 collapse.')] },
  'United Kingdom': { cpi:71, chamber:'House of Commons', head:'Prime Minister Keir Starmer', note:'A large majority government with weak approval, a fragmenting right, and a fiscal rule the Treasury will not break.', parties:[
    L('Labour Party','LAB','Keir Starmer','Centre-left',403,'gov'),
    L('Conservative Party','CON','Kemi Badenoch','Centre-right',121,'opp'),
    L('Liberal Democrats','LD','Ed Davey','Centrist, liberal',72,'opp'),
    L('Reform UK','REF','Nigel Farage','Right-wing populist',5,'opp'),
    L('Scottish National Party','SNP','John Swinney','Scottish independence',9,'opp')] },
  'United States': { cpi:65, chamber:'House of Representatives', head:'President Donald Trump', note:'Unified Republican control with narrow House margins; most fiscal decisions run through reconciliation.', parties:[
    L('Republican Party','GOP','Donald Trump','Conservative, national populist',220,'gov'),
    L('Democratic Party','DEM','Hakeem Jeffries (House)','Centre-left',215,'opp')] },
  'France': { cpi:67, chamber:'Assemblée nationale', head:'President Emmanuel Macron', note:'A hung assembly in three blocs; budgets pass by article 49.3 or not at all.', parties:[
    L('Renaissance','RE','Gabriel Attal','Centrist, liberal',91,'gov'),
    L('Les Républicains','LR','Bruno Retailleau','Centre-right',47,'coalition'),
    L('Rassemblement National','RN','Jordan Bardella','Nationalist right',123,'opp','Marine Le Pen convicted in 2025 for embezzlement of EU parliamentary funds.'),
    L('La France Insoumise','LFI','Jean-Luc Mélenchon','Left populist',71,'opp'),
    L('Parti socialiste','PS','Olivier Faure','Centre-left',66,'opp')] },
  'Germany': { cpi:75, chamber:'Bundestag', head:'Chancellor Friedrich Merz', note:'A grand coalition with a reformed debt brake and a strong opposition on the right.', parties:[
    L('CDU/CSU','UNION','Friedrich Merz','Christian democrat, centre-right',208,'gov'),
    L('Social Democratic Party','SPD','Lars Klingbeil','Centre-left',120,'coalition'),
    L('Alternative für Deutschland','AfD','Alice Weidel','Nationalist right',152,'opp'),
    L('Bündnis 90/Die Grünen','GRÜNE','Felix Banaszak','Green',85,'opp'),
    L('Die Linke','LINKE','Ines Schwerdtner','Left',64,'opp')] },
  'Italy': { cpi:54, chamber:'Camera dei Deputati', head:'Prime Minister Giorgia Meloni', note:'A stable right-wing coalition with high debt and EU recovery funds to spend.', parties:[
    L("Fratelli d'Italia",'FdI','Giorgia Meloni','National conservative',118,'gov'),
    L('Lega','LEGA','Matteo Salvini','Right populist, northern',66,'coalition'),
    L('Forza Italia','FI','Antonio Tajani','Centre-right',45,'coalition'),
    L('Partito Democratico','PD','Elly Schlein','Centre-left',69,'opp'),
    L('Movimento 5 Stelle','M5S','Giuseppe Conte','Populist',52,'opp')] },
  'Turkey': { cpi:34, chamber:'Grand National Assembly', head:'President Recep Tayyip Erdoğan', note:'An executive presidency with a compliant assembly, a jailed opposition mayor and a central bank under orders to stay orthodox.', parties:[
    L('AK Party','AKP','Recep Tayyip Erdoğan','Conservative, Islamist-rooted',268,'gov'),
    L('Nationalist Movement Party','MHP','Devlet Bahçeli','Turkish nationalist',50,'coalition'),
    L("Republican People's Party",'CHP','Özgür Özel','Kemalist, centre-left',127,'opp','Istanbul mayor Ekrem İmamoğlu jailed in 2025 on charges the party calls political.'),
    L('DEM Party','DEM','Tülay Hatimoğulları','Pro-Kurdish left',57,'opp'),
    L('İYİ Party','İYİ','Müsavat Dervişoğlu','Nationalist centre-right',30,'opp')] },
  'Brazil': { cpi:34, chamber:'Câmara dos Deputados', head:'President Luiz Inácio Lula da Silva', note:'A left president with a centrão-controlled Congress that sells its votes in budget amendments.', parties:[
    L("Workers' Party",'PT','Luiz Inácio Lula da Silva','Centre-left',68,'gov','Lula convicted in Lava Jato, later annulled by the Supreme Court.'),
    L('MDB','MDB','Baleia Rossi','Centrist, centrão',44,'coalition'),
    L('PSD','PSD','Gilberto Kassab','Centrist, centrão',45,'coalition'),
    L('Liberal Party','PL','Jair Bolsonaro','Right-wing',99,'opp','Bolsonaro convicted in 2025 over the 2022 coup plot.'),
    L('União Brasil','UNIÃO','Antônio Rueda','Centre-right',59,'opp')] },
  'Mexico': { cpi:26, chamber:'Cámara de Diputados', head:'President Claudia Sheinbaum', note:'A supermajority for the ruling movement, a remade judiciary, and cartels that govern whole municipalities.', parties:[
    L('Morena','MORENA','Claudia Sheinbaum','Left nationalist',253,'gov'),
    L('Partido Verde','PVEM','Karen Castrejón','Allied, green-labelled',62,'coalition'),
    L('Partido del Trabajo','PT','Alberto Anaya','Left',47,'coalition'),
    L('Partido Acción Nacional','PAN','Jorge Romero','Centre-right',72,'opp'),
    L('PRI','PRI','Alejandro Moreno','Centrist, former hegemon',37,'opp'),
    L('Movimiento Ciudadano','MC','Jorge Álvarez Máynez','Social liberal',27,'opp')] },
  'Nigeria': { cpi:26, chamber:'House of Representatives', head:'President Bola Tinubu', note:'A dominant ruling party, governors who control the money, and a fuel subsidy that was removed and keeps returning.', parties:[
    L('All Progressives Congress','APC','Bola Tinubu','Centre-right, big tent',190,'gov'),
    L('Peoples Democratic Party','PDP','Atiku Abubakar','Centrist, big tent',110,'opp'),
    L('Labour Party','LP','Peter Obi','Social democratic, youth',35,'opp'),
    L('New Nigeria Peoples Party','NNPP','Rabiu Kwankwaso','Kano regional',19,'opp')] },
  'South Africa': { cpi:41, chamber:'National Assembly', head:'President Cyril Ramaphosa', note:'A Government of National Unity after the ANC lost its majority, held together by fear of the alternative.', parties:[
    L('African National Congress','ANC','Cyril Ramaphosa','Centre-left',159,'gov','State capture inquiry implicated senior figures of the Zuma era.'),
    L('Democratic Alliance','DA','John Steenhuisen','Liberal',87,'coalition'),
    L('Inkatha Freedom Party','IFP','Velenkosini Hlabisa','KwaZulu-Natal, traditionalist',17,'coalition'),
    L('uMkhonto weSizwe','MK','Jacob Zuma','Populist, Zuma faction',58,'opp'),
    L('Economic Freedom Fighters','EFF','Julius Malema','Radical left',39,'opp')] },
  'Egypt': { cpi:30, chamber:'House of Representatives', head:'President Abdel Fattah el-Sisi', note:'A military-backed presidency; the assembly ratifies, the army builds, and the IMF is a recurring visitor.', parties:[
    L("Nation's Future Party",'NFP','Abdel Wahab Abdel Razek','Pro-government',316,'gov'),
    L("Republican People's Party",'RPP','Hazem Omar','Pro-government',50,'coalition'),
    L('New Wafd Party','WAFD','Abdel Sanad Yamama','Liberal nationalist',26,'opp')] },
  'Indonesia': { cpi:37, chamber:'DPR', head:'President Prabowo Subianto', note:'A grand coalition with almost no formal opposition, built around a former general and a free-meals programme.', parties:[
    L('Gerindra','GER','Prabowo Subianto','Nationalist',86,'gov'),
    L('Golkar','GOLKAR','Bahlil Lahadalia','Centre-right, establishment',102,'coalition'),
    L('NasDem','NASDEM','Surya Paloh','Nationalist',69,'coalition'),
    L('PKB','PKB','Muhaimin Iskandar','Islamic, NU-linked',68,'coalition'),
    L('PDI-P','PDIP','Megawati Sukarnoputri','Nationalist centre-left',110,'opp')] },
  'Japan': { cpi:71, chamber:'House of Representatives', head:'Prime Minister Sanae Takaichi', note:'A long-ruling party that lost its lower-house majority and now governs by deal with smaller parties.', parties:[
    L('Liberal Democratic Party','LDP','Sanae Takaichi','Conservative',191,'gov','2023–24 faction slush-fund scandal over unreported fundraising income.'),
    L('Japan Innovation Party','ISHIN','Hirofumi Yoshimura','Reformist, Osaka',38,'coalition'),
    L('Constitutional Democratic Party','CDP','Yoshihiko Noda','Centre-left',148,'opp'),
    L('Democratic Party for the People','DPFP','Yuichiro Tamaki','Centrist',28,'opp'),
    L('Komeito','KOMEITO','Tetsuo Saito','Buddhist-backed centrist',24,'opp')] },
  'Bangladesh': { cpi:23, chamber:'Jatiya Sangsad', head:'Chief Adviser Muhammad Yunus (interim)', note:'An interim government after the 2024 uprising; parliament dissolved, the former ruling party suspended, elections promised.', parties:[
    L('Bangladesh Nationalist Party','BNP','Tarique Rahman','Centre-right nationalist',0,'opp'),
    L('Jamaat-e-Islami','JI','Shafiqur Rahman','Islamist',0,'opp'),
    L('National Citizen Party','NCP','Nahid Islam','Student-led reformist',0,'gov'),
    L('Awami League','AL','Sheikh Hasina (in exile)','Centre-left, suspended',0,'opp','Former PM sentenced in absentia over the 2024 crackdown.')] },
  'Ghana': { cpi:42, chamber:'Parliament', head:'President John Mahama', note:'A two-party democracy just out of default and inside an IMF programme.', parties:[
    L('National Democratic Congress','NDC','John Mahama','Social democratic',183,'gov'),
    L('New Patriotic Party','NPP','Mahamudu Bawumia','Liberal conservative',88,'opp')] },
  'Russia': { cpi:22, chamber:'State Duma', head:'President Vladimir Putin', note:'A closed system: the Duma ratifies, the security services decide, and the war economy sets the budget.', parties:[
    L('United Russia','UR','Dmitry Medvedev','Pro-Kremlin',324,'gov'),
    L('Communist Party','KPRF','Gennady Zyuganov','Systemic opposition, left',57,'coalition'),
    L('A Just Russia','SRZP','Sergey Mironov','Systemic opposition',28,'coalition'),
    L('LDPR','LDPR','Leonid Slutsky','Nationalist',21,'coalition')] },
  'China': { cpi:43, chamber:'National People’s Congress', head:'General Secretary Xi Jinping', note:'A one-party state. Policy is made in the Politburo Standing Committee and implemented by provinces with their own debts.', parties:[
    L('Communist Party of China','CPC','Xi Jinping','Marxist-Leninist, party-state',2090,'gov','Anti-corruption campaign since 2012 has disciplined over a million officials.')] },
  'Ukraine': { cpi:35, chamber:'Verkhovna Rada', head:'President Volodymyr Zelensky', note:'A wartime government under martial law; elections suspended, budget financed by allies.', parties:[
    L('Servant of the People','SN','Volodymyr Zelensky','Centrist, pro-European',233,'gov'),
    L('European Solidarity','ES','Petro Poroshenko','Centre-right, pro-European',27,'opp'),
    L('Batkivshchyna','BAT','Yulia Tymoshenko','Populist centre',24,'opp')] },
  'Canada': { cpi:75, chamber:'House of Commons', head:'Prime Minister Mark Carney', note:'A minority-sized Liberal government with a trade war on its southern border.', parties:[
    L('Liberal Party','LPC','Mark Carney','Centrist',169,'gov'),
    L('Conservative Party','CPC','Pierre Poilievre','Conservative',144,'opp'),
    L('Bloc Québécois','BQ','Yves-François Blanchet','Quebec nationalist',22,'opp'),
    L('New Democratic Party','NDP','Don Davies (interim)','Social democratic',7,'opp')] },
  'Iran': { cpi:23, chamber:'Islamic Consultative Assembly', head:'Supreme Leader Ali Khamenei', note:'A theocratic system: an elected president governs beneath an unelected clerical leadership and the Revolutionary Guard.', parties:[
    L('Principlists','PRIN','Mohammad Bagher Ghalibaf','Conservative',200,'gov'),
    L('Reformists','REF','Masoud Pezeshkian','Reformist',40,'coalition'),
    L('Independents','IND','—','Various',50,'opp')] }
};
const IDEOS = ['Centre-left','Centre-right','Nationalist','Liberal','Regionalist','Social democratic','Conservative','Populist'];
function landscape(n, regime, WC, hash) {
  if (DATA[n.name]) return JSON.parse(JSON.stringify(DATA[n.name]));
  const names = WC.partiesOf(n, regime);
  const total = Math.round(n.seats || 300);
  let left = total;
  const parties = names.map((nm, i) => {
    const share = i === names.length - 1 ? left : Math.round(total * (i === 0 ? 0.38 + hash(n.name + 'p0') * 0.14 : (0.5 - i * 0.08) * hash(n.name + nm) * 0.6 + 0.04));
    const seats = Math.max(1, Math.min(left, share)); left -= seats;
    return L(nm.replace(/^the /, '').replace(/^./, s => s.toUpperCase()), nm.replace(/^the /, '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4),
      WC.personName(n, 'party' + i, hash), IDEOS[Math.floor(hash(n.name + nm + 'i') * IDEOS.length)], seats, i === 0 ? 'gov' : i === 1 && hash(n.name + 'co') > 0.5 ? 'coalition' : 'opp');
  });
  const cpi = Math.round(Math.max(12, Math.min(88, 78 - (n.difficulty - 1) * 12 + (hash(n.name + 'cpi') - 0.5) * 14)));
  return { cpi, chamber:'Legislature', head:'Head of government', note:'', parties, generated:true };
}
window.Politics = { DATA, landscape };
})();
