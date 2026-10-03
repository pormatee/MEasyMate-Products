(function(root){'use strict';
function deps(){if(!root.AstroCore||!root.HorajarnContractsV2)throw new Error('V2_FACT_DEPENDENCY_MISSING')}
function fact(id,type,value,meta={}){return root.HorajarnContractsV2.deepFreeze({factId:id,type,value,certainty:'CALCULATED',calculationVersion:'astro-core-v1.2-adapter',...meta})}
function build(profile,target=new Date()){deps();const f=root.AstroCore.buildFacts(profile,target);const facts=[];
facts.push(fact('FACT-ASTRO-DATE','astro_date',{...f.astroDate},{policy:'THAI_ASTRO_DAWN_06',policyClaimRef:'THAI-ASTRO-DAY-BOUNDARY-06',policyVerification:'CROSS_CHECKED_CONVENTION',policyLimit:'FIXED_06_APPROX_SUNRISE'}));
facts.push(fact('FACT-BIRTH-PLANET','birth_planet',f.birthPlanet,{dependencyClaims:['THAI-ASTRO-DAY-BOUNDARY-06','WEDNESDAY-NIGHT-18'],methodVerification:'CROSS_CHECKED_CONVENTION'}));
facts.push(fact('FACT-LUNAR','thai_lunar',{...f.lunar},{methodClaimRef:'THAI-LUNAR-ALGORITHM-REFERENCE',methodVerification:'TECHNICAL_REFERENCE'}));
for(const r of f.records)facts.push(fact(`FACT-HOUSE-B${r.base}-C${r.col}`,'house_number',r.num,{base:r.base,col:r.col,house:r.name,topic:r.topic}));
for(let i=0;i<(f.matrix.sum||[]).length;i++)facts.push(fact(`FACT-BASE4-C${i+1}`,'base4_sum',f.matrix.sum[i],{base:4,col:i+1,knowledgeAttached:false,predictiveMeaningClaimRef:'BASE4-PREDICTIVE-MEANING',predictiveMeaningVerification:'UNVERIFIED'}));
for(let i=0;i<f.thaksa.length;i++)facts.push(fact(`FACT-TAKSA-${i+1}`,'taksa_role',f.thaksa[i],{role:root.AstroCore.THAKSA_NAMES[i],structureClaimRef:'TAKSA-CYCLE-ORDER',structureVerification:'CROSS_CHECKED'}));
const mahaMeta={methodClaimRef:'MAHATAKSA-108-DURATION-FORMULA',methodVerification:'PARTIAL_VERIFICATION',structureClaims:['MAHATAKSA-108-STRENGTHS','MAHATAKSA-SUBPERIOD-RATIO-108','MAHATAKSA-SUBPERIOD-ORDER'],structureVerification:'CROSS_CHECKED',timelineClaimRef:'MAHATAKSA-GREGORIAN-TIMELINE-MAPPING',timelineVerification:'UNVERIFIED'};
facts.push(fact('FACT-MAHATAKSA-MAIN','mahataksa_planet',f.mahaTaksa.main,{period:'main',...mahaMeta}));
facts.push(fact('FACT-MAHATAKSA-SUB','mahataksa_planet',f.mahaTaksa.sub,{period:'sub',...mahaMeta}));
return root.HorajarnContractsV2.deepFreeze({engineVersion:'2.4.0-calculation',dayBoundaryPolicy:'THAI_ASTRO_DAWN_06',dayBoundaryVerification:'CROSS_CHECKED_CONVENTION',profileCompatibility:'astroProfileV1',legacyFacts:f,facts});}
function get(bundle,id){return bundle.facts.find(x=>x.factId===id)||null}
const API={build,get,version:'2.4.0-calculation'};root.HorajarnFactEngineV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
