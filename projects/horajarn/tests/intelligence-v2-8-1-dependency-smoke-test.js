global.window=global;
require('../core/astrology-core.js');
require('../sources/source-registry.js');
require('../knowledge/knowledge-base.js');
require('../rules/rules-v1.js');

require('../v2/contracts-v2.js');
require('../v2/fact-engine-v2.js');
require('../v2/knowledge-verification-v2.js');
require('../v2/knowledge-model-v2.js');
require('../v2/accuracy-policy-v2.js');
require('../v2/evidence-engine-v2.js');
require('../v2/accuracy-engine-v2.js');
require('../v2/interpretation-policy-v2.js');
require('../v2/interpretation-engine-v2.js');
require('../v2/intelligence-engine-v2.js');
require('../v2/profile-adapter-v2.js');

const assert=(x,m)=>{if(!x)throw new Error(m)};
for(const [name,obj] of Object.entries({
  AstroCore,
  AstroSources,
  AstroKnowledge,
  AstroRules,
  HorajarnContractsV2,
  HorajarnFactEngineV2,
  HorajarnKnowledgeVerificationV2,
  HorajarnKnowledgeV2,
  HorajarnAccuracyPolicyV2,
  HorajarnEvidenceV2,
  HorajarnAccuracyV2,
  HorajarnInterpretationPolicyV2,
  HorajarnInterpretationV2,
  HorajarnIntelligenceV2,
  HorajarnProfileAdapterV2
})) assert(obj,name+':missing');

const p={name:'Smoke',day:1,month:3,year:2516,hour:12,minute:0};
const r=HorajarnIntelligenceV2.analyze('career',p,new Date(2026,9,3,12,0));
assert(r&&r.interpretation&&r.interpretation.summary,'career:analyze');
assert(r.confidence.scoreIsPredictiveProbability===false,'probability-guard');
console.log('HORAJARN_INTELLIGENCE_V2_8_1_DEPENDENCY_SMOKE=PASS');
