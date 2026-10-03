(function(root){'use strict';
const VERSION='2.3.0-knowledge-pack';
function deps(){if(!root.HorajarnKnowledgeVerificationV2)throw new Error('V2_KNOWLEDGE_PACK_DEPENDENCY_MISSING')}
function taksa(){deps();return root.HorajarnKnowledgeVerificationV2.claim('TAKSA-ROLE-NAMES').value.map(role=>root.HorajarnKnowledgeVerificationV2.taksaRole(role))}
function sevenNumberStructure(){deps();const c=root.HorajarnKnowledgeVerificationV2.claim('SEVEN-NUMBER-FOUR-BASE-STRUCTURE');return Object.freeze({knowledgeId:'K-SEVEN-NUMBER-FOUR-BASE-STRUCTURE',moduleId:'SEVEN_NUMBER',version:VERSION,school:'THAI_SEVEN_NUMBER_FOUR_BASE',concept:'four_base_structure',context:'structure',bases:Object.freeze([{base:1,label:'ฐานวัน'},{base:2,label:'ฐานเดือน'},{base:3,label:'ฐานปี'},{base:4,label:'ฐานรวม'}]),sourceRefs:[...c.sourceRefs],verification:c.status,predictive:false,limitations:['Structural knowledge only. No Base 4 predictive meaning is activated in V2.3.']})}
function gaps(){deps();return root.HorajarnKnowledgeVerificationV2.gaps()}
function validate(){deps();const errors=[];const t=taksa();if(t.length!==8)errors.push('taksa-count');if(t.some(x=>x.verification!=='CROSS_CHECKED'))errors.push('taksa-not-crosschecked');const s=sevenNumberStructure();if(s.predictive!==false)errors.push('seven-number-structure-predictive');if(!gaps().some(x=>x.claimId==='BASE4-PREDICTIVE-MEANING'))errors.push('base4-gap-missing');return{ok:errors.length===0,errors}}
const API={VERSION,taksa,sevenNumberStructure,gaps,validate,version:VERSION};root.HorajarnKnowledgePackV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
