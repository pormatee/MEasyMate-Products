(function(root){'use strict';

const E=typeof require!=='undefined'
  ? require('./integrated-prediction-engine-v2.js')
  : root.HorajarnIntegratedPredictionV222;

const VERSION='2.24.0-shadow-validation';
const PRODUCTION_CUTOVER=false;

const HOUSES=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสี','ทาสา'
];

function freeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
  return v;
}

function facts(overrides={}){
  return {
    records:HOUSES.map((name,i)=>({
      name,
      num:Object.prototype.hasOwnProperty.call(overrides,name)
        ? Number(overrides[name])
        : (i%9)+1,
      base:Math.floor(i/7)+1,
      col:(i%7)+1
    }))
  };
}

function runCase(name,fn){
  try{
    const detail=fn();
    return {
      name,
      ok:detail===true || (detail&&detail.ok===true),
      detail:detail===true?null:detail
    };
  }catch(e){
    return {
      name,
      ok:false,
      error:e&&e.message?e.message:String(e)
    };
  }
}

function evaluate(){
  const cases=[];

  cases.push(runCase('CAREER_GENERAL',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ทาสา:5,ทาสี:6}),
      {domain:'career'}
    );

    return {
      ok:
        r.policy.mode==='OWNER_VERIFIED_OVERRIDE' &&
        r.positions.map(x=>x.house).join('|')===
          'กัมมะ|ทาสา|ทาสี' &&
        !r.positions.some(x=>x.house==='ปิตา')
    };
  }));

  cases.push(runCase('NEW_JOB_PUTTA',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ปุตตะ:4,ทาสา:5,ทาสี:6}),
      {domain:'career',intent:'new_job'}
    );

    return {
      ok:r.positions.some(
        x=>x.house==='ปุตตะ'&&x.role==='CONTEXT'
      )
    };
  }));

  cases.push(runCase('NEW_BUSINESS_PUTTA',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ปุตตะ:4,ทาสา:5,ทาสี:6}),
      {domain:'career',intent:'new_business'}
    );

    return {
      ok:r.positions.some(
        x=>x.house==='ปุตตะ'&&x.role==='CONTEXT'
      )
    };
  }));

  cases.push(runCase('PITA_CONDITIONAL',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ปิตา:5,ทาสา:4,ทาสี:6}),
      {domain:'career',authority:true}
    );

    return {
      ok:r.positions.some(
        x=>x.house==='ปิตา'&&x.role==='CONDITIONAL'
      )
    };
  }));

  cases.push(runCase('SAME_PLANET_HOUSE_LINK',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ธนัง:1,ทาสา:5,ทาสี:6}),
      {domain:'career'}
    );

    return {
      ok:r.samePlanetHouseLinks.some(
        x=>x.planet===1 &&
           x.houses.includes('กัมมะ') &&
           x.houses.includes('ธนัง')
      )
    };
  }));

  cases.push(runCase('FRIEND_PAIR',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ทาสา:5,ทาสี:9}),
      {domain:'career'}
    );

    return {
      ok:r.pairRelationships.some(
        x=>x.type==='FRIEND' &&
           x.planets.includes(1) &&
           x.planets.includes(5)
      )
    };
  }));

  cases.push(runCase('ENEMY_PAIR',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ทาสา:3,ทาสี:9}),
      {domain:'career'}
    );

    return {
      ok:r.pairRelationships.some(
        x=>x.type==='ENEMY' &&
           x.planets.includes(1) &&
           x.planets.includes(3)
      )
    };
  }));

  cases.push(runCase('PAIR_2_5_CONFLICT_PRESERVED',()=>{
    const r=E.integrate(
      facts({กัมมะ:2,ทาสา:5,ทาสี:9}),
      {domain:'career'}
    );

    const types=r.pairRelationships
      .filter(
        x=>x.planets.includes(2)&&x.planets.includes(5)
      )
      .map(x=>x.type);

    return {
      ok:types.includes('ENEMY') &&
         types.includes('ELEMENT'),
      types
    };
  }));

  cases.push(runCase('FINANCE_LEGACY_HOLD',()=>{
    const r=E.integrate(
      facts({ธนัง:6,กดุมภะ:5,ลาภะ:1}),
      {domain:'finance'}
    );

    return {
      ok:r.policy.mode==='LEGACY_FALLBACK'
    };
  }));

  cases.push(runCase('HOUSE_ALIAS',()=>{
    const r=E.integrate(
      facts({ธนัง:6,กดุมภะ:5,ลาภะ:1}),
      {domain:'finance'}
    );

    return {
      ok:r.positions.some(
        x=>x.house==='กดุมพะ'&&x.aliasApplied===true
      )
    };
  }));

  cases.push(runCase('LOVE_LEGACY_HOLD',()=>{
    const r=E.integrate(
      facts({ปัตนิ:6,สหัชชะ:4,ปุตตะ:2}),
      {domain:'love'}
    );

    return {
      ok:r.policy.mode==='LEGACY_FALLBACK'
    };
  }));

  cases.push(runCase('THIRD_PARTY_GUARD',()=>{
    const r=E.integrate(
      facts({กัมมะ:1}),
      {domain:'career',actor:'other'},
      {directPredictionAllowed:false}
    );

    return {
      ok:r.blocked===true
    };
  }));

  cases.push(runCase('EXACT_TIMING_GUARD',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ทาสา:5,ทาสี:6}),
      {domain:'career',questionType:'TIMING'}
    );

    return {
      ok:
        r.timing &&
        r.timing.exactGregorianPredictionAllowed===false
    };
  }));

  cases.push(runCase('PROVENANCE_TRACE',()=>{
    const r=E.integrate(
      facts({กัมมะ:1,ทาสา:5,ทาสี:6}),
      {domain:'career'}
    );

    return {
      ok:
        r.trace.knowledgeIds.length>0 &&
        r.trace.sourceRefs.length>0
    };
  }));

  const passed=cases.filter(x=>x.ok).length;

  const careerNames=[
    'CAREER_GENERAL',
    'NEW_JOB_PUTTA',
    'NEW_BUSINESS_PUTTA',
    'PITA_CONDITIONAL',
    'SAME_PLANET_HOUSE_LINK',
    'FRIEND_PAIR',
    'ENEMY_PAIR',
    'PAIR_2_5_CONFLICT_PRESERVED',
    'THIRD_PARTY_GUARD',
    'EXACT_TIMING_GUARD',
    'PROVENANCE_TRACE'
  ];

  const careerReady=careerNames.every(
    name=>cases.find(x=>x.name===name)?.ok===true
  );

  return freeze({
    version:VERSION,
    total:cases.length,
    passed,
    failed:cases.length-passed,
    cases,

    readiness:{
      career:
        careerReady
          ? 'READY_FOR_CONTROLLED_CUTOVER'
          : 'HOLD_SHADOW',

      finance:'HOLD_SHADOW_LEGACY_POLICY',
      love:'HOLD_SHADOW_LEGACY_POLICY',

      eligibleDomains:
        careerReady?['career']:[],

      holdDomains:['finance','love'],

      globalProductionCutoverReady:false
    },

    safety:{
      productionCutover:false,
      calculationCoreMutation:false,
      validationRuntimeLoadedInProduction:false,
      provisionalKnowledgeAutoPromoted:false,
      conflictAutoMerged:false
    }
  });
}

function validate(){
  const r=evaluate();
  const errors=[];

  if(r.total!==14)errors.push('case-count');
  if(r.passed!==14)errors.push('case-failure');

  if(
    r.readiness.career!==
      'READY_FOR_CONTROLLED_CUTOVER'
  )errors.push('career-readiness');

  if(
    r.readiness.finance!==
      'HOLD_SHADOW_LEGACY_POLICY'
  )errors.push('finance-policy');

  if(
    r.readiness.love!==
      'HOLD_SHADOW_LEGACY_POLICY'
  )errors.push('love-policy');

  if(
    r.readiness.globalProductionCutoverReady!==false
  )errors.push('global-cutover');

  if(PRODUCTION_CUTOVER!==false)
    errors.push('production-cutover');

  return {
    ok:errors.length===0,
    errors,
    report:r
  };
}

const API=freeze({
  VERSION,
  PRODUCTION_CUTOVER,
  HOUSES,
  facts,
  evaluate,
  validate
});

root.HorajarnShadowValidationV224=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
