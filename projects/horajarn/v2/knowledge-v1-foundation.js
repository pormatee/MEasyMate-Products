(function(root){'use strict';
const VERSION='2.18.0-knowledge-v1-foundation';
const INGESTION_COMPLETE=false;

function deepFreeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(deepFreeze);
  }
  return v;
}

const PRIMARY_SOURCE=deepFreeze({
  id:'MAHASATTALEK-3-THANAKORN',
  title:'คัมภีร์มหาสัตตเลข ๓',
  author:'ธนกร สินเกษม',
  type:'primary-book',
  authority:'primary-work',
  locator:'https://pubhtml5.com/zahj/fphc/',
  verification:'SOURCE_IDENTIFIED_CONTENT_NOT_FULLY_INGESTED',
  ingestionComplete:false,
  pageRefs:[],
  limitations:[
    'ยังไม่อ้างว่าเก็บเนื้อหาครบทั้งเล่ม',
    'ความรู้จากตำราต้องมี pageRefs ก่อนยกระดับเป็น verified knowledge',
    'ห้ามสร้างความหมายหรือกฎจากการคาดเดา'
  ]
});

const CATEGORIES=deepFreeze([
  'PLANETS_1_9','HOUSES','PLANET_RELATIONSHIPS',
  'HOUSE_RELATIONSHIPS','PREDICTION_METHOD','PREDICTION_EXAMPLES',
  'LIFE_DOMAINS','HEALTH_TRADITION','REMEDIATION',
  'NAMING','NAME_MEANING','BIRTHDAY_DEITY','CASE_EVIDENCE'
].map(id=>({
  id,
  sourceRefs:[PRIMARY_SOURCE.id],
  pageRefs:[],
  status:'NOT_INGESTED',
  verification:'UNVERIFIED_CONTENT'
})));

const OWNER_RULES=deepFreeze({
  CAREER_PRIMARY_KAMMA:{
    verification:'OWNER_VERIFIED_V1',
    sourceRefs:['USER-PRACTITIONER-RULES'],
    primary:['กัมมะ']
  },
  NEW_JOB_PUTTA_CONTEXT:{
    verification:'OWNER_VERIFIED_V1',
    sourceRefs:['USER-PRACTITIONER-RULES'],
    context:['ปุตตะ']
  },
  DASA_DASI_CAREER_SUPPORT:{
    verification:'OWNER_VERIFIED_V1',
    sourceRefs:['USER-PRACTITIONER-RULES'],
    support:['ทาสา','ทาสี']
  },
  PITA_CAREER_SUPPORT:{
    verification:'CONDITIONAL',
    sourceRefs:['USER-PRACTITIONER-RULES'],
    conditional:['ปิตา']
  },
  SAME_PLANET_HOUSE_RELATIONSHIP:{
    verification:'OWNER_VERIFIED_V1',
    sourceRefs:['USER-PRACTITIONER-RULES'],
    relationshipFromFacts:true,
    predeclaredSupportOnly:false,
    calculationMutation:false
  }
});

function careerPolicy(context={}){
  const intent=String(context.intent||'').toLowerCase();
  return deepFreeze({
    topic:'career',
    primary:['กัมมะ'],
    support:['ทาสา','ทาสี'],
    context:['new_job','new_business'].includes(intent)?['ปุตตะ']:[],
    conditional:context.authority===true?['ปิตา']:[],
    relationshipRule:'SAME_PLANET_HOUSE_RELATIONSHIP',
    verification:'OWNER_VERIFIED_V1',
    calculationMutation:false
  });
}

function validate(){
  const errors=[];
  if(INGESTION_COMPLETE!==false)errors.push('ingestion');
  if(CATEGORIES.length!==13)errors.push('categories');
  if(CATEGORIES.some(x=>x.status!=='NOT_INGESTED'))errors.push('premature-ingestion');
  if(careerPolicy({}).primary[0]!=='กัมมะ')errors.push('career-primary');
  if(!careerPolicy({intent:'new_job'}).context.includes('ปุตตะ'))errors.push('putta');
  if(!careerPolicy({authority:true}).conditional.includes('ปิตา'))errors.push('pita');
  if(OWNER_RULES.SAME_PLANET_HOUSE_RELATIONSHIP.calculationMutation!==false)
    errors.push('calculation-mutation');
  return {ok:errors.length===0,errors};
}

const API=deepFreeze({
  VERSION,INGESTION_COMPLETE,PRIMARY_SOURCE,CATEGORIES,
  OWNER_RULES,careerPolicy,validate
});

root.HorajarnKnowledgeV1FoundationV218=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
