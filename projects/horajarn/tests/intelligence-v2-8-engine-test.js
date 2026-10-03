global.window=global;
require('../core/astrology-core.js');
require('../sources/source-registry.js');
require('../knowledge/knowledge-base.js');
require('../rules/rules-v1.js');
require('../v2/contracts-v2.js');
require('../v2/fact-engine-v2.js');
require('../v2/knowledge-verification-v2.js');
require('../v2/knowledge-model-v2.js');
require('../v2/evidence-engine-v2.js');
require('../v2/accuracy-policy-v2.js');
require('../v2/accuracy-engine-v2.js');
require('../v2/interpretation-policy-v2.js');
require('../v2/interpretation-engine-v2.js');
require('../v2/intelligence-engine-v2.js');
require('../v2/profile-adapter-v2.js');
require('../v2/horoscope-interpretation-ui-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const legacy={name:'มม',d:30,m:9,y:2026,yRaw:2569,h:'18',mi:'00'};
const p=HorajarnProfileAdapterV2.toCoreProfile(legacy);
for(const service of ['career','finance','love']){
  const r=HorajarnIntelligenceV2.analyze(service,p,new Date(2026,9,3,12,0));
  assert(r.interpretation.summary.length>20,service+':summary');
  assert(r.interpretation.claimEvidenceRefs.length>0,service+':trace');
  assert(r.confidence.scoreIsPredictiveProbability===false,service+':probability');
  assert(['HIGH','MODERATE','LOW','INSUFFICIENT'].includes(r.confidence.band),service+':confidence');
}
const models=HorajarnInterpretationUIV2.buildModels(legacy,new Date(2026,9,3,12,0));
assert(Object.keys(models).length===3,'model-count');
for(const k of ['work','money','partner']){
  assert(models[k].summary.length>20,k+':ui-summary');
  assert(models[k].scoreIsPredictiveProbability===false,k+':ui-probability');
}
console.log('HORAJARN_INTELLIGENCE_V2_8_ENGINE=PASS');
