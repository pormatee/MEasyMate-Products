global.window=global;
require('../core/astrology-core.js');
require('../v2/contracts-v2.js');
require('../v2/fact-engine-v2.js');
require('../v2/profile-adapter-v2.js');
require('../v2/horoscope-fact-bridge-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const vectors=[
 {p:{name:'A',day:7,month:10,year:2569,hour:5,minute:59},label:'0559'},
 {p:{name:'B',day:7,month:10,year:2569,hour:6,minute:0},label:'0600'},
 {p:{name:'C',day:7,month:10,year:2569,hour:17,minute:59},label:'wed1759'},
 {p:{name:'D',day:7,month:10,year:2569,hour:18,minute:0},label:'wed1800'},
 {p:{name:'E',d:1,m:3,y:1973,yRaw:2516,h:'12',mi:'00'},label:'legacy'}
];
for(const v of vectors){
  const q=HorajarnHoroscopeFactBridgeV2.coreParity(v.p,new Date(2026,9,7,12,0));
  assert(q.ok,v.label+':'+q.mismatches.join(','));
}
const d1=HorajarnHoroscopeFactBridgeV2.planetForMoment(new Date(2026,9,7,5,59));
const d2=HorajarnHoroscopeFactBridgeV2.planetForMoment(new Date(2026,9,7,6,0));
assert(d1.astroDate.d!==d2.astroDate.d,'dawn-boundary');
const w1=HorajarnHoroscopeFactBridgeV2.planetForMoment(new Date(2026,9,7,17,59));
const w2=HorajarnHoroscopeFactBridgeV2.planetForMoment(new Date(2026,9,7,18,0));
assert(w1.planet!==8,'wed-before-18');
assert(w2.planet===8,'wed-after-18');
console.log('HORAJARN_INTELLIGENCE_V2_6_BRIDGE_PARITY=PASS');
