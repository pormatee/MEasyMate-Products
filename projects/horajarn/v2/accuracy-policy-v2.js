(function(root){'use strict';
const VERSION='2.1.0-accuracy';
const FACTOR_WEIGHT=Object.freeze({knowledge:.28,source:.24,coverage:.18,agreement:.14,traceability:.10,specificity:.06});
const CONFLICT=Object.freeze({balanceRatio:.30,minSideWeight:.08});
const CONCLUSION=Object.freeze({strongDirectionalWeight:.45,minimumDirectionalWeight:.08});
const CONFIDENCE=Object.freeze({high:.80,moderate:.60});
function sum(o){return Object.values(o).reduce((a,b)=>a+Number(b||0),0)}
if(Math.abs(sum(FACTOR_WEIGHT)-1)>1e-9)throw new Error('ACCURACY_POLICY_WEIGHT_SUM');
const API={VERSION,FACTOR_WEIGHT,CONFLICT,CONCLUSION,CONFIDENCE};
root.HorajarnAccuracyPolicyV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
