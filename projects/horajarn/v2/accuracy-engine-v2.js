(function(root){'use strict';
function deps(){if(!root.HorajarnContractsV2||!root.HorajarnAccuracyPolicyV2)throw new Error('V2_ACCURACY_DEPENDENCY_MISSING')}
function round(v){return Number(Number(v||0).toFixed(4))}
function weighted(e){deps();const C=root.HorajarnContractsV2;const role=C.ROLE_WEIGHT[e.role]||.35,time=C.TIME_WEIGHT[e.timeScope]||.5,knowledge=C.verificationScore(e.knowledgeVerification),source=C.clamp(e.sourceQuality),specificity=C.clamp(e.specificity);return C.clamp(role*time*knowledge*source*specificity)}
function groupDirectional(scored){const groups={};for(const e of scored){if(e.direction!=='SUPPORT'&&e.direction!=='CAUTION')continue;const key=e.conflictGroup||'ungrouped';if(!groups[key])groups[key]={group:key,support:0,caution:0,evidenceRefs:[]};groups[key][e.direction==='SUPPORT'?'support':'caution']+=e.effectiveWeight;groups[key].evidenceRefs.push(e.evidenceId)}return Object.values(groups).map(g=>({...g,support:round(g.support),caution:round(g.caution)}))}
function conflictForGroup(g){const P=root.HorajarnAccuracyPolicyV2.CONFLICT,hi=Math.max(g.support,g.caution),lo=Math.min(g.support,g.caution);return hi>=P.minSideWeight&&lo>=P.minSideWeight&&lo/hi>=P.balanceRatio}
function analyze(bundle){deps();const C=root.HorajarnContractsV2,P=root.HorajarnAccuracyPolicyV2;const scored=bundle.evidence.map(e=>({...e,effectiveWeight:weighted(e)}));
let support=0,caution=0,neutral=0;for(const e of scored){if(e.direction==='SUPPORT')support+=e.effectiveWeight;else if(e.direction==='CAUTION')caution+=e.effectiveWeight;else neutral+=e.effectiveWeight}
const groups=groupDirectional(scored),conflictGroups=groups.filter(conflictForGroup),hasConflict=conflictGroups.length>0;
const directional=support+caution,high=Math.max(support,caution),low=Math.min(support,caution);
const expectedPrimary=Math.max(1,(bundle.rule.primary||[]).length),presentPrimary=new Set(scored.filter(e=>e.role==='PRIMARY').flatMap(e=>e.factRefs)).size,coverage=C.clamp(presentPrimary/expectedPrimary);
const knowledge=scored.length?scored.reduce((s,e)=>s+C.verificationScore(e.knowledgeVerification),0)/scored.length:0;
const source=scored.length?scored.reduce((s,e)=>s+C.clamp(e.sourceQuality),0)/scored.length:0;
const specificity=scored.length?scored.reduce((s,e)=>s+C.clamp(e.specificity),0)/scored.length:0;
const traceability=scored.length&&scored.every(e=>Array.isArray(e.factRefs)&&e.factRefs.length&&e.ruleRef&&Array.isArray(e.sourceRefs)&&e.sourceRefs.length&&Array.isArray(e.knowledgeRefs))?1:scored.length?.5:0;
const agreement=directional===0?.5:C.clamp(1-(low/(high||1)));
const parts={knowledge,source,coverage,agreement,traceability,specificity};let quality=0;for(const [k,w] of Object.entries(P.FACTOR_WEIGHT))quality+=parts[k]*w;if(hasConflict)quality=Math.max(0,quality-.10);
let conclusion='CONTEXT_ONLY';if(!scored.length)conclusion='INSUFFICIENT';else if(hasConflict)conclusion='MIXED';else if(directional<P.CONCLUSION.minimumDirectionalWeight)conclusion='CONTEXT_ONLY';else if(support>caution)conclusion=support>=P.CONCLUSION.strongDirectionalWeight?'SUPPORT':'PARTIAL_SUPPORT';else if(caution>support)conclusion=caution>=P.CONCLUSION.strongDirectionalWeight?'CAUTION':'PARTIAL_CAUTION';
let confidenceBand='INSUFFICIENT';if(scored.length){confidenceBand=quality>=P.CONFIDENCE.high?'HIGH':quality>=P.CONFIDENCE.moderate?'MODERATE':'LOW'}
const uncertainty=!scored.length?'INSUFFICIENT':hasConflict?'CONFLICTED':coverage<1?'PARTIAL_COVERAGE':directional===0?'NON_DIRECTIONAL':'NORMAL';
const ranked=[...scored].sort((a,b)=>b.effectiveWeight-a.effectiveWeight||a.evidenceId.localeCompare(b.evidenceId)).map((e,i)=>({...e,rank:i+1,rankReason:{role:e.role,timeScope:e.timeScope,knowledgeVerification:e.knowledgeVerification,sourceQuality:round(e.sourceQuality),specificity:round(e.specificity)}}));
return C.deepFreeze({policyVersion:P.VERSION,conclusion,confidenceBand,uncertainty,qualityScore:round(quality),scoreIsPredictiveProbability:false,totals:{support:round(support),caution:round(caution),neutral:round(neutral),directional:round(directional)},components:{knowledge:round(knowledge),source:round(source),coverage:round(coverage),agreement:round(agreement),traceability:round(traceability),specificity:round(specificity)},conflict:{detected:hasConflict,groups:conflictGroups},directionalGroups:groups,rankedEvidence:ranked});}
const API={weighted,groupDirectional,conflictForGroup,analyze,version:'2.1.0-accuracy'};root.HorajarnAccuracyV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
