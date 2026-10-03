global.window = global;

require('../core/astrology-core.js');
require('../sources/source-registry.js');
require('../knowledge/knowledge-base.js');
require('../rules/rules-v1.js');

require('../v2/contracts-v2.js');
require('../v2/fact-engine-v2.js');
require('../v2/knowledge-model-v2.js');
require('../v2/evidence-engine-v2.js');
require('../v2/accuracy-policy-v2.js');
require('../v2/accuracy-engine-v2.js');
require('../v2/interpretation-policy-v2.js');
require('../v2/interpretation-engine-v2.js');
require('../v2/intelligence-engine-v2.js');

const assert=(x,m)=>{if(!x)throw new Error(m)};
const p={name:'Tester',day:1,month:3,year:2516,hour:12,minute:0,place:'Thailand'};
for(const service of ['career','finance','love']){
  const a=HorajarnIntelligenceV2.audit(service,p,new Date(2026,9,1));
  assert(a.engineVersion==='2.2.0-interpretation',service+':version');
  assert(a.facts.length>=39,service+':facts');
  assert(a.facts.some(x=>x.type==='base4_sum'),service+':base4-fact');
  assert(a.evidence.length>=3,service+':evidence');
  assert(a.evidence.every(x=>x.factRefs.length&&x.ruleRef&&Array.isArray(x.sourceRefs)),service+':trace');
  assert(a.accuracy.scoreIsPredictiveProbability===false,service+':probability-guard');
  const pub=HorajarnIntelligenceV2.analyze(service,p,new Date(2026,9,1));
  assert(!('profile' in pub),service+':profile-leak');
  assert(pub.interpretation.claimEvidenceRefs.length>0,service+':claim-trace');
}
const dawn=HorajarnFactEngineV2.build({name:'Dawn',day:2,month:10,year:2569,hour:5,minute:30},new Date(2026,9,2));
assert(dawn.dayBoundaryPolicy==='THAI_ASTRO_DAWN_06','day-policy');
assert(dawn.facts.find(x=>x.factId==='FACT-ASTRO-DATE').value.d===1,'dawn-shift');
const x=HorajarnIntelligenceV2.audit('career',p,new Date(2026,9,1));
const y=HorajarnIntelligenceV2.audit('career',p,new Date(2026,9,1));
assert(JSON.stringify(x)===JSON.stringify(y),'determinism');
console.log('HORAJARN_INTELLIGENCE_V2_FOUNDATION=PASS');
