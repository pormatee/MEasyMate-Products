global.window=global;
require('../core/astrology-core.js');
require('../v2/contracts-v2.js');
require('../v2/calculation-policy-v2.js');
require('../v2/fact-engine-v2.js');
require('../v2/profile-adapter-v2.js');
require('../v2/horoscope-fact-bridge-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
function check(p,target,label){const q=HorajarnHoroscopeFactBridgeV2.coreParity(p,target);assert(q.ok,label+':'+q.mismatches.join(','));return HorajarnHoroscopeFactBridgeV2.compatibilityView(p,target)}
const target=new Date(2026,9,3,12,0,0);
const samples=[
  {name:'A',day:1,month:3,year:2516,hour:12,minute:0},
  {name:'B',day:7,month:10,year:2569,hour:17,minute:59},
  {name:'C',day:7,month:10,year:2569,hour:18,minute:0},
  {name:'D',day:8,month:10,year:2569,hour:5,minute:59},
  {name:'E',day:8,month:10,year:2569,hour:6,minute:0},
  {name:'F',day:29,month:2,year:2567,hour:0,minute:1},
  {name:'G',day:31,month:12,year:2542,hour:23,minute:59},
  {name:'H',day:1,month:1,year:2543,hour:0,minute:0}
];
samples.forEach((p,i)=>check(p,target,'sample-'+i));
const wedBefore=check(samples[1],target,'wed-before'),wedNight=check(samples[2],target,'wed-night'),preDawn=check(samples[3],target,'pre-dawn'),dawn=check(samples[4],target,'dawn');
assert(wedBefore.birthPlanet===4,'wed-17:59-must-be-mercury');
assert(wedNight.birthPlanet===8,'wed-18:00-must-be-rahu');
assert(preDawn.astroDate.d===7&&preDawn.birthPlanet===8,'thu-05:59-must-use-wed-night');
assert(dawn.astroDate.d===8&&dawn.birthPlanet===5,'thu-06:00-must-use-thursday');
const legacy={name:'Legacy',d:8,m:10,y:2026,yRaw:2569,h:'05',mi:'59'};
const lc=check(legacy,target,'legacy-shape');
assert(lc.astroDate.d===7&&lc.birthPlanet===8,'legacy-profile-parity');
const r1=check(samples[0],target,'determinism-a'),r2=check(samples[0],target,'determinism-b');
assert(JSON.stringify(r1)===JSON.stringify(r2),'determinism');
console.log('HORAJARN_INTELLIGENCE_V2_5_SINGLE_BRAIN_PARITY=PASS');
