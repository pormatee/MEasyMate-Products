(function(root){'use strict';
const VERSION='2.0.0-foundation';
const VERIFICATION_SCORE=Object.freeze({FROZEN:1,VERIFIED:.95,CROSS_CHECKED:.82,PROVISIONAL:.6,LEGACY_UNATTRIBUTED:.35,UNKNOWN:.25});
const ROLE_WEIGHT=Object.freeze({PRIMARY:1,SUPPORT:.68,CONTEXT:.52,MINOR:.35});
const TIME_WEIGHT=Object.freeze({NATAL:1,CURRENT_MAIN:.82,CURRENT_SUB:.66,REFERENCE:.5});
const DIRECTION=Object.freeze({SUPPORT:'SUPPORT',CAUTION:'CAUTION',NEUTRAL:'NEUTRAL',MIXED:'MIXED'});
function clamp(v,min=0,max=1){v=Number(v);return Number.isFinite(v)?Math.min(max,Math.max(min,v)):min}
function deepFreeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.freeze(value);Object.keys(value).forEach(k=>deepFreeze(value[k]));return value}
function verificationScore(v){return VERIFICATION_SCORE[String(v||'UNKNOWN').toUpperCase()]||VERIFICATION_SCORE.UNKNOWN}
function validateEvidence(e){const errors=[];['evidenceId','topic','ruleRef','role','direction'].forEach(k=>{if(!e||!e[k])errors.push(k+':missing')});if(!Array.isArray(e.factRefs)||!e.factRefs.length)errors.push('factRefs:missing');if(!Array.isArray(e.sourceRefs))errors.push('sourceRefs:not-array');if(!Object.prototype.hasOwnProperty.call(ROLE_WEIGHT,e.role))errors.push('role:invalid');if(!Object.values(DIRECTION).includes(e.direction))errors.push('direction:invalid');return{ok:errors.length===0,errors}}
const API={VERSION,VERIFICATION_SCORE,ROLE_WEIGHT,TIME_WEIGHT,DIRECTION,clamp,deepFreeze,verificationScore,validateEvidence};
root.HorajarnContractsV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
