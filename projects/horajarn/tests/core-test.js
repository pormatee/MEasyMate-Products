global.window=global;
require('../core/astrology-core.js');
require('../sources/source-registry.js');
require('../knowledge/knowledge-base.js');
require('../rules/rules-v1.js');
require('../services/interpretation-engine.js');
require('../services/service-engine.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
assert(AstroCore.selfTest(),'CORE');
assert(AstroKnowledge.validate().ok,'KNOWLEDGE:'+AstroKnowledge.validate().errors.join(','));
assert(AstroRules.validate().ok,'RULES:'+AstroRules.validate().errors.join(','));
assert(AstroServiceEngine.selfTest(),'SERVICE');
for(const id of ['PLU-LUANG-BOOK','TAKSA-TABLE-VIBHISHANA','MAHATAKSA-MAHAMODO','SEVEN-NUMBER-MAHAMODO','THAI-LUNAR-PYTHAIDATE','USER-PRACTITIONER-RULES','INTERNAL-CURATED-V1'])assert(AstroSources.has(id),'SOURCE:'+id);
const p={name:'Tester',day:1,month:3,year:2516,hour:12,minute:0,place:'Thailand'};
for(const s of ['career','finance','love']){const r=AstroServiceEngine.analyze(s,p,new Date(2026,9,1));assert(r.summary.length>20,s+' summary');assert(r.publicBasis.length>0,s+' basis');assert(!('interpretation' in r),s+' leak');const a=AstroServiceEngine.audit(s,p,new Date(2026,9,1));assert(a.interpretation.sources.length>0,s+' sources');}
const f=AstroCore.buildFacts(p,new Date(2026,9,1));
const speech=AstroInterpretation.positionalReading(f,'speech'),mind=AstroInterpretation.positionalReading(f,'mind'),res=AstroInterpretation.positionalReading(f,'residence');
assert(speech.base===1&&speech.col===4,'speech-pos4');assert(mind.base===2&&mind.col===4,'mind-pos4');assert(res.base===3&&res.col===4,'residence-pos4');
console.log('HORAJARN_FREE_KNOWLEDGE_ACCURACY=PASS');
