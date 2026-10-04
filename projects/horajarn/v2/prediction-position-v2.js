(function(root){'use strict';
const VERSION='2.17.0-prediction-position-foundation';
const AGE_WHEEL_9=[1,9,2,3,4,7,5,8,6];
const THAKSA_ORDER=[1,2,3,4,7,5,8,6];
const THAKSA_NAMES=['บริวาร','อายุ','เดช','ศรี','มูละ','อุตสาหะ','มนตรี','กาลกิณี'];
const SELF_ACTORS=new Set(['self','self_implicit','user',null,undefined,'']);

function freeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
  return v;
}
function clean(v){return v==null?null:String(v).trim()||null}
function normalizeSemantic(q){
  q=q||{};
  const domains=Array.isArray(q.domains)?q.domains.filter(Boolean):[];
  let domain=clean(q.domain);
  const risks=Array.isArray(q.risks)?q.risks.filter(Boolean):[];
  if(!domain){
    if(domains.includes('health')) domain='health';
    else if(domains.includes('career')) domain='career';
    else if(domains.includes('finance')) domain='finance';
    else if(domains.includes('love')) domain='love';
    else if(risks.includes('accident')||risks.includes('illness')) domain='health';
  }
  if(domain==='family' && (q.object==='health'||domains.includes('health'))) domain='health';
  if(domain==='spiritual' && domains.includes('career')) domain='career';
  return freeze({
    id:q.id||null,text:q.text||'',domain,domains,
    actor:clean(q.actor)||'self_implicit',action:clean(q.action),intent:clean(q.intent),
    object:clean(q.object),rawObject:clean(q.raw_object||q.rawObject),outcome:clean(q.outcome),
    questionType:clean(q.question_type||q.questionType)||'OPEN',time:q.time||{scope:null,expression:null},
    risks,references:Array.isArray(q.references)?q.references:[],confidence:Number(q.confidence||0)
  });
}
function subjectScope(semantic, hasSubjectProfile=false){
  const actor=semantic.actor;
  if(SELF_ACTORS.has(actor)) return freeze({scope:'SELF',directPredictionAllowed:true,reason:null});
  if(hasSubjectProfile) return freeze({scope:'SUBJECT_PROFILE',directPredictionAllowed:true,reason:null});
  return freeze({scope:'RELATION_CONTEXT_ONLY',directPredictionAllowed:false,reason:'EXTERNAL_PERSON_PROFILE_REQUIRED'});
}
function resolveHouseRule(semantic){
  if(!root.AstroRules||!root.AstroCore) throw new Error('V2_17_DEPENDENCY_MISSING');
  const topic=semantic.domain;
  const existing=root.AstroRules.RULES&&root.AstroRules.RULES[topic];
  if(existing){
    return freeze({
      topic,selectorType:'EXISTING_RULE',ruleId:existing.id,verification:'PROVISIONAL',
      primary:[...(existing.primary||[])],support:[...(existing.support||[])],
      sourceRefs:[...(existing.sourceRefs||[])],predictiveEligible:true
    });
  }
  if(topic==='health'){
    const meta=root.AstroCore.HOUSE_META||{};
    const candidates=Object.entries(meta).filter(([,v])=>Array.isArray(v)&&v[0]==='health').map(([k])=>k);
    return freeze({
      topic,selectorType:'STRUCTURAL_META',ruleId:'HEALTH-STRUCTURAL-CANDIDATE-V2.17',
      verification:'PROJECT_DERIVED_PROVISIONAL',primary:[],support:candidates,
      sourceRefs:['ASTROCORE-HOUSE-META'],predictiveEligible:false,
      limitation:'Structural candidate houses only; no predictive health rule is activated.'
    });
  }
  return freeze({
    topic,selectorType:'NO_RULE',ruleId:null,verification:'UNVERIFIED',primary:[],support:[],
    sourceRefs:[],predictiveEligible:false,limitation:'No verified/provisional house rule exists for this semantic target.'
  });
}
function ageYang(profile,target){
  const birthBE=Number(profile&&profile.year);
  if(!Number.isFinite(birthBE)) throw new Error('V2_17_BIRTH_YEAR_INVALID');
  const normalizedBirthBE=birthBE>2400?birthBE:birthBE+543;
  const t=target instanceof Date?target:new Date(target||Date.now());
  if(Number.isNaN(t.getTime())) throw new Error('V2_17_TARGET_DATE_INVALID');
  return (t.getFullYear()+543)-normalizedBirthBE+1;
}
function annualPositionFromFacts(facts,ageY){
  if(!facts||!Array.isArray(facts.records)||facts.records.length!==21) throw new Error('V2_17_FACT_RECORDS_INVALID');
  const pos=((Number(ageY)-1)%21+21)%21+1;
  const record=facts.records[pos-1];
  const col=record.col;
  const b4=facts.matrix&&Array.isArray(facts.matrix.sum)?facts.matrix.sum[col-1]:null;
  return freeze({
    ageYang:Number(ageY),position:pos,base:record.base,col:record.col,house:record.name,planet:record.num,
    base4:{column:col,value:b4,meaning:null,predictiveEligible:false,verification:'NUMERIC_ONLY'}
  });
}
function rotateFrom(order,start){
  const idx=order.indexOf(start);
  if(idx<0) return [];
  return order.map((_,i)=>order[(idx+i)%order.length]);
}
function annualTaksaFromBirthPlanet(birthPlanet,ageY){
  const start=AGE_WHEEL_9.indexOf(Number(birthPlanet));
  if(start<0) throw new Error('V2_17_BIRTH_PLANET_INVALID');
  const raw=AGE_WHEEL_9[(start+(Number(ageY)-1))%AGE_WHEEL_9.length];
  const borivan=raw===9?5:raw;
  const planets=rotateFrom(THAKSA_ORDER,borivan);
  const roles={}; THAKSA_NAMES.forEach((name,i)=>roles[name]=planets[i]);
  return freeze({
    ageYang:Number(ageY),rawBorivan:raw,borivan,ketuFallbackApplied:raw===9,
    order:planets,roles,
    verification:'PROJECT_RULE_CONFIRMED',
    limitation:raw===9?'Ket 9 uses Jupiter 5 fallback for transit Borivan.':null
  });
}
function selectHousePositions(facts,rule){
  const names=[...rule.primary,...rule.support];
  return freeze(names.map(name=>{
    const r=facts.records.find(x=>x.name===name);
    return r?{house:name,role:rule.primary.includes(name)?'PRIMARY':'SUPPORT',base:r.base,col:r.col,planet:r.num}:null;
  }).filter(Boolean));
}
function timingPolicy(semantic){
  const asksTiming=semantic.questionType==='TIMING'||semantic.outcome==='timing';
  return freeze({
    asksTiming,
    exactGregorianPredictionAllowed:false,
    mahaTaksaTimelineStatus:'CONTEXT_ONLY_UNVERIFIED_TIMELINE_MAPPING',
    guidance:asksTiming?'Use directional/current-period context only; do not claim an exact Gregorian transition date.':null
  });
}
function build(profile,semanticInput,target=new Date(),options={}){
  if(!root.AstroCore||typeof root.AstroCore.buildFacts!=='function'||!root.AstroRules) throw new Error('V2_17_DEPENDENCY_MISSING');
  const semantic=normalizeSemantic(semanticInput);
  const scope=subjectScope(semantic,!!options.subjectProfile);
  const effectiveProfile=(scope.scope==='SUBJECT_PROFILE'&&options.subjectProfile)?options.subjectProfile:profile;
  const facts=root.AstroCore.buildFacts(effectiveProfile,target);
  const ay=ageYang(effectiveProfile,target);
  const rule=resolveHouseRule(semantic);
  const annual=annualPositionFromFacts(facts,ay);
  const taksa=annualTaksaFromBirthPlanet(facts.birthPlanet,ay);
  const houses=selectHousePositions(facts,rule);
  const natalRoleForAnnualPlanet=typeof facts.helpers?.role==='function'?facts.helpers.role(annual.planet):null;
  const annualRoleForAnnualPlanet=Object.entries(taksa.roles).find(([,p])=>p===annual.planet)?.[0]||null;
  const predictiveEligible=scope.directPredictionAllowed && rule.predictiveEligible;
  return freeze({
    version:VERSION,
    semantic,
    subject:scope,
    houseRule:rule,
    housePositions:houses,
    annualPosition:{...annual,natalTaksaRole:natalRoleForAnnualPlanet,annualTaksaRole:annualRoleForAnnualPlanet},
    annualTaksa:taksa,
    mahaTaksa:{main:facts.mahaTaksa?.main??null,sub:facts.mahaTaksa?.sub??null,status:'CONTEXT_ONLY_UNVERIFIED_TIMELINE_MAPPING'},
    timing:timingPolicy(semantic),
    predictionPolicy:{
      predictiveEligible,
      astrologyDoctrineAdded:false,
      base4MeaningActivated:false,
      externalPersonDirectPredictionBlocked:!scope.directPredictionAllowed,
      reasons:[
        ...(scope.directPredictionAllowed?[]:[scope.reason]),
        ...(rule.predictiveEligible?[]:[rule.selectorType==='STRUCTURAL_META'?'HOUSE_RULE_STRUCTURAL_ONLY':'HOUSE_RULE_NOT_AVAILABLE'])
      ]
    }
  });
}
function validate(result){
  const errors=[];
  if(!result||result.version!==VERSION)errors.push('version');
  if(!result.semantic)errors.push('semantic');
  if(!result.subject)errors.push('subject');
  if(!result.houseRule)errors.push('houseRule');
  if(!result.annualPosition||!Number.isInteger(result.annualPosition.position)||result.annualPosition.position<1||result.annualPosition.position>21)errors.push('annualPosition');
  if(!result.annualTaksa||!result.annualTaksa.roles||Object.keys(result.annualTaksa.roles).length!==8)errors.push('annualTaksa');
  if(result.annualPosition?.base4?.predictiveEligible!==false)errors.push('base4-policy');
  if(result.timing?.exactGregorianPredictionAllowed!==false)errors.push('timing-policy');
  return {ok:errors.length===0,errors};
}
const API={VERSION,AGE_WHEEL_9,THAKSA_ORDER,THAKSA_NAMES,normalizeSemantic,subjectScope,resolveHouseRule,ageYang,annualPositionFromFacts,annualTaksaFromBirthPlanet,timingPolicy,build,validate};
root.HorajarnPredictionPositionV2=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
