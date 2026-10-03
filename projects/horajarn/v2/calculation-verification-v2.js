(function(root){'use strict';
const VERSION='2.4.0-calculation-verification';
function deps(){if(!root.AstroCore||!root.HorajarnCalculationPolicyV2||!root.HorajarnKnowledgeVerificationV2||!root.HorajarnReferenceCalendarV2)throw new Error('V2_CALC_VERIFY_DEPENDENCY_MISSING')}
function eq(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function boundaryCases(){const P=root.HorajarnCalculationPolicyV2;return [
 {id:'WED-0559',profile:{name:'T',day:7,month:10,year:2569,hour:5,minute:59},planet:3,astro:[2026,10,6]},
 {id:'WED-0600',profile:{name:'T',day:7,month:10,year:2569,hour:6,minute:0},planet:4,astro:[2026,10,7]},
 {id:'WED-1759',profile:{name:'T',day:7,month:10,year:2569,hour:17,minute:59},planet:4,astro:[2026,10,7]},
 {id:'WED-1800',profile:{name:'T',day:7,month:10,year:2569,hour:18,minute:0},planet:8,astro:[2026,10,7]},
 {id:'THU-0559',profile:{name:'T',day:8,month:10,year:2569,hour:5,minute:59},planet:8,astro:[2026,10,7]},
 {id:'THU-0600',profile:{name:'T',day:8,month:10,year:2569,hour:6,minute:0},planet:5,astro:[2026,10,8]}
 ].map(c=>{const f=root.AstroCore.buildFacts(c.profile,new Date(2026,9,8)),ad=f.astroDate,pass=f.birthPlanet===c.planet&&eq([ad.y,ad.m,ad.d],c.astro)&&f.birthPlanet===P.expectedBirthPlanet(f.profile.y,f.profile.m,f.profile.d,f.profile.h);return{...c,actualPlanet:f.birthPlanet,actualAstro:[ad.y,ad.m,ad.d],pass}})}
function structural(){const P=root.HorajarnCalculationPolicyV2,errors=[];if(!eq(root.AstroCore.THAKSA_ORDER,P.TAKSA_ORDER))errors.push('taksa-order');for(const [k,v] of Object.entries(P.MAHATAKSA_STRENGTH))if(Number(root.AstroCore.STRENGTH[k])!==v)errors.push('strength:'+k);const sun=P.schedule(1);if(Math.abs(sun.totalYearsTraditional-6)>1e-12)errors.push('sun-total');const moon=P.schedule(2);if(Math.abs(moon.totalYearsTraditional-15)>1e-12)errors.push('moon-total');return{pass:errors.length===0,errors}}
function claims(){const K=root.HorajarnKnowledgeVerificationV2;const checks={day:K.claim('THAI-ASTRO-DAY-BOUNDARY-06'),wed:K.claim('WEDNESDAY-NIGHT-18'),strength:K.claim('MAHATAKSA-108-STRENGTHS'),ratio:K.claim('MAHATAKSA-SUBPERIOD-RATIO-108'),order:K.claim('MAHATAKSA-SUBPERIOD-ORDER'),timeline:K.claim('MAHATAKSA-GREGORIAN-TIMELINE-MAPPING')};const pass=checks.day.status==='CROSS_CHECKED_CONVENTION'&&checks.wed.status==='CROSS_CHECKED_CONVENTION'&&checks.strength.status==='CROSS_CHECKED'&&checks.ratio.status==='CROSS_CHECKED'&&checks.order.status==='CROSS_CHECKED'&&checks.timeline.status==='UNVERIFIED';return{pass,checks}}
function run(){deps();const b=boundaryCases(),s=structural(),c=claims(),cal=root.HorajarnReferenceCalendarV2.run();return{version:VERSION,pass:b.every(x=>x.pass)&&s.pass&&c.pass&&cal.pass,boundary:b,structure:s,claims:c,calendar:{pass:cal.pass,passed:cal.passed,total:cal.total},timelineMappingStatus:'UNVERIFIED_TIMELINE_MAPPING'}}
const API={VERSION,boundaryCases,structural,claims,run,version:VERSION};root.HorajarnCalculationVerificationV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
