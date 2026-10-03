global.window=global;
require('../core/astrology-core.js');
require('../v2/contracts-v2.js');
require('../v2/fact-engine-v2.js');
require('../v2/profile-adapter-v2.js');
require('../v2/horoscope-fact-bridge-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
for(const p of [
{name:'A',day:7,month:10,year:2569,hour:5,minute:59},
{name:'B',day:7,month:10,year:2569,hour:6,minute:0},
{name:'C',day:7,month:10,year:2569,hour:17,minute:59},
{name:'D',day:7,month:10,year:2569,hour:18,minute:0},
{name:'E',d:1,m:3,y:1973,yRaw:2516,h:'12',mi:'00'}
]){const q=HorajarnHoroscopeFactBridgeV2.coreParity(p,new Date(2026,9,7,12));assert(q.ok,q.mismatches.join(','))}
console.log('HORAJARN_INTELLIGENCE_V2_6_1_BRIDGE_PARITY=PASS');
