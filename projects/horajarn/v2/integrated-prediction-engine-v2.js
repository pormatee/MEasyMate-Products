(function(root){'use strict';

const K=typeof require!=='undefined'
  ? require('./knowledge-v1-foundation.js')
  : root.HorajarnKnowledgeV1FoundationV218;

const P=typeof require!=='undefined'
  ? require('./knowledge-planets-batch1-v2.js')
  : root.HorajarnPlanetKnowledgeBatch1V220;

const B=typeof require!=='undefined'
  ? require('./knowledge-mega-batch2-v2.js')
  : root.HorajarnKnowledgeMegaBatch2V221;

const LEGACY=typeof require!=='undefined'
  ? require('../rules/rules-v1.js')
  : root.AstroRules;

const VERSION='2.22.0-integrated-prediction-rc1';
const SHADOW_MODE=true;
const PRODUCTION_CUTOVER=false;
const PERFORMANCE_BUDGET_MS_PER_RUN=5;

const HOUSE_ALIASES={
  'กดุมภะ':'กดุมพะ',
  'กดุมพะ':'กดุมพะ'
};

function deepFreeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(deepFreeze);
  }
  return v;
}

function canonicalHouse(v){
  v=String(v||'').trim();
  return HOUSE_ALIASES[v]||v;
}

function pairKey(a,b){
  return [Number(a),Number(b)].sort((x,y)=>x-y).join('-');
}

function buildIndex(){
  const planet={};
  const house={};
  const pair={};
  const method={};

  for(const x of P.RECORDS){
    const m=String(x.concept||'').match(/^PLANET_(\d+)$/);
    if(m) planet[m[1]]=x;
  }

  for(const x of B.RECORDS){
    if(x.topic==='HOUSES')
      house[canonicalHouse(x.house)]=x;

    if(x.topic==='PLANET_RELATIONSHIPS'){
      const k=pairKey(x.planets[0],x.planets[1]);
      (pair[k]||(pair[k]=[])).push(x);
    }

    if(x.topic==='PREDICTION_METHOD')
      method[x.concept]=x;
  }

  return deepFreeze({
    planet,
    house,
    pair,
    method,
    recordCount:P.RECORDS.length+B.RECORDS.length
  });
}

const INDEX=buildIndex();

function normalizeSemantic(s={}){
  return deepFreeze({
    domain:String(s.domain||'').toLowerCase(),
    intent:String(s.intent||'').toLowerCase(),
    authority:s.authority===true,
    questionType:String(s.questionType||s.question_type||'OPEN').toUpperCase(),
    actor:s.actor||'self'
  });
}

function legacyPolicy(domain){
  const r=LEGACY&&LEGACY.RULES&&LEGACY.RULES[domain];
  if(!r) return null;

  return deepFreeze({
    topic:domain,
    mode:'LEGACY_FALLBACK',
    ruleId:r.id,
    primary:(r.primary||[]).map(canonicalHouse),
    support:(r.support||[]).map(canonicalHouse),
    context:[],
    conditional:[],
    sourceRefs:[...(r.sourceRefs||[])],
    verification:'LEGACY_PROVISIONAL'
  });
}

function resolvePolicy(input={}){
  const s=normalizeSemantic(input);

  if(s.domain==='career'){
    const p=K.careerPolicy({
      intent:s.intent,
      authority:s.authority
    });

    return deepFreeze({
      topic:'career',
      mode:'OWNER_VERIFIED_OVERRIDE',
      ruleId:'CAREER-KNOWLEDGE-V1',
      primary:[...p.primary].map(canonicalHouse),
      support:[...p.support].map(canonicalHouse),
      context:[...p.context].map(canonicalHouse),
      conditional:[...p.conditional].map(canonicalHouse),
      sourceRefs:['USER-PRACTITIONER-RULES'],
      verification:'OWNER_VERIFIED_V1'
    });
  }

  return legacyPolicy(s.domain)||deepFreeze({
    topic:s.domain||null,
    mode:'NO_POLICY',
    ruleId:null,
    primary:[],
    support:[],
    context:[],
    conditional:[],
    sourceRefs:[],
    verification:'UNVERIFIED'
  });
}

function roleMap(policy){
  const out={};

  for(const h of policy.primary) out[canonicalHouse(h)]='PRIMARY';
  for(const h of policy.context)
    if(!out[canonicalHouse(h)]) out[canonicalHouse(h)]='CONTEXT';
  for(const h of policy.support)
    if(!out[canonicalHouse(h)]) out[canonicalHouse(h)]='SUPPORT';
  for(const h of policy.conditional)
    if(!out[canonicalHouse(h)]) out[canonicalHouse(h)]='CONDITIONAL';

  return out;
}

function policyHouses(policy){
  const seen=new Set();
  const out=[];

  for(const list of [
    policy.primary,
    policy.context,
    policy.support,
    policy.conditional
  ]){
    for(const raw of list){
      const h=canonicalHouse(raw);
      if(!seen.has(h)){
        seen.add(h);
        out.push(h);
      }
    }
  }
  return out;
}

function selectPositions(facts,policy){
  if(!facts||!Array.isArray(facts.records))
    throw new Error('V2_22_FACT_RECORDS_REQUIRED');

  const roles=roleMap(policy);

  return deepFreeze(policyHouses(policy).map(h=>{
    const r=facts.records.find(
      x=>canonicalHouse(x.name)===h
    );

    if(!r) return null;

    return {
      house:h,
      factHouseName:r.name,
      role:roles[h],
      planet:Number(r.num),
      base:r.base??null,
      col:r.col??null,
      aliasApplied:String(r.name)!==h
    };
  }).filter(Boolean));
}

function planetKnowledge(n){
  return INDEX.planet[String(Number(n))]||null;
}

function houseKnowledge(name){
  return INDEX.house[canonicalHouse(name)]||null;
}

function pairRelationships(positions){
  const planets=[...new Set(
    positions.map(x=>Number(x.planet))
      .filter(n=>Number.isFinite(n))
  )];

  const out=[];

  for(let i=0;i<planets.length;i++){
    for(let j=i+1;j<planets.length;j++){
      const rows=INDEX.pair[pairKey(planets[i],planets[j])]||[];
      for(const r of rows){
        out.push({
          planets:[planets[i],planets[j]],
          type:r.relationshipType,
          meaning:r.meaning,
          knowledgeId:r.id,
          sourceId:r.sourceId,
          status:r.status
        });
      }
    }
  }

  return deepFreeze(out);
}

function samePlanetLinks(facts,positions){
  const selected=new Set(positions.map(x=>canonicalHouse(x.house)));
  const groups={};

  for(const r of facts.records||[]){
    const p=Number(r.num);
    if(!Number.isFinite(p)) continue;
    (groups[p]||(groups[p]=[])).push(canonicalHouse(r.name));
  }

  const out=[];

  for(const [planet,housesRaw] of Object.entries(groups)){
    const houses=[...new Set(housesRaw)];

    if(houses.length<2) continue;
    if(!houses.some(h=>selected.has(h))) continue;

    out.push({
      planet:Number(planet),
      houses,
      rule:'SAME_PLANET_MULTI_HOUSE',
      verification:'OWNER_VERIFIED_V1'
    });
  }

  return deepFreeze(out);
}

function interpretationRows(positions){
  return deepFreeze(positions.map(x=>{
    const pk=planetKnowledge(x.planet);
    const hk=houseKnowledge(x.house);

    return {
      house:x.house,
      role:x.role,
      planet:x.planet,
      planetMeaning:pk?pk.meaning:null,
      houseMeaning:hk?hk.meaning:null,
      planetKnowledgeId:pk?pk.id:null,
      houseKnowledgeId:hk?hk.id:null,
      planetStatus:pk?pk.status:null,
      houseStatus:hk?hk.status:null,
      aliasApplied:x.aliasApplied
    };
  }));
}

function provenance(rows,pairs,links){
  const ids=new Set();
  const sources=new Set();

  for(const r of rows){
    if(r.planetKnowledgeId){
      ids.add(r.planetKnowledgeId);
      const x=INDEX.planet[String(r.planet)];
      if(x) sources.add(x.sourceId);
    }

    if(r.houseKnowledgeId){
      ids.add(r.houseKnowledgeId);
      const x=INDEX.house[canonicalHouse(r.house)];
      if(x) sources.add(x.sourceId);
    }
  }

  for(const p of pairs){
    if(p.knowledgeId) ids.add(p.knowledgeId);
    if(p.sourceId) sources.add(p.sourceId);
  }

  if(links.length)
    sources.add('USER-PRACTITIONER-RULES');

  return deepFreeze({
    knowledgeIds:[...ids],
    sourceRefs:[...sources]
  });
}

function makeSummary(rows,pairs,links){
  const parts=[];

  for(const r of rows){
    const pm=r.planetMeaning||'ยังไม่มีความหมายดาวที่ ingest';
    const hm=r.houseMeaning||'ยังไม่มีความหมายเรือนที่ ingest';

    parts.push(
      `${r.house} (${r.role}) → ดาว ${r.planet}: ${pm} | เรือน: ${hm}`
    );
  }

  if(pairs.length)
    parts.push(
      `พบความสัมพันธ์คู่ดาว ${pairs.map(
        x=>`${x.planets.join('-')} ${x.type}`
      ).join(', ')}`
    );

  if(links.length)
    parts.push(
      `พบการเชื่อมเรือนจากดาวเดียวกัน ${links.map(
        x=>`ดาว ${x.planet}: ${x.houses.join(' ↔ ')}`
      ).join('; ')}`
    );

  return parts.join('\n');
}

function integrate(facts,semanticInput={},options={}){
  const semantic=normalizeSemantic(semanticInput);
  const directAllowed=options.directPredictionAllowed!==false;

  const policy=resolvePolicy(semantic);

  if(!directAllowed){
    return deepFreeze({
      version:VERSION,
      shadowMode:true,
      productionCutover:false,
      blocked:true,
      reason:'DIRECT_PREDICTION_NOT_ALLOWED_FOR_SCOPE',
      semantic,
      policy,
      exactGregorianPredictionAllowed:false
    });
  }

  const positions=selectPositions(facts,policy);
  const rows=interpretationRows(positions);
  const pairs=pairRelationships(positions);
  const links=samePlanetLinks(facts,positions);
  const trace=provenance(rows,pairs,links);

  return deepFreeze({
    version:VERSION,
    shadowMode:SHADOW_MODE,
    productionCutover:PRODUCTION_CUTOVER,
    blocked:false,
    semantic,
    policy,
    positions,
    interpretation:rows,
    pairRelationships:pairs,
    samePlanetHouseLinks:links,
    trace,
    summary:makeSummary(rows,pairs,links),
    timing:{
      requested:semantic.questionType==='TIMING',
      exactGregorianPredictionAllowed:false
    },
    safety:{
      calculationCoreMutation:false,
      autoKnowledgeMerge:false,
      provisionalKnowledgeMayBeUsedForShadow:true,
      customerFacingCutoverAllowed:false
    }
  });
}

function policySignature(p){
  const roles=roleMap(p);
  return policyHouses(p).map(
    h=>`${h}:${roles[h]}`
  );
}

function shadowCompare(facts,semanticInput={},options={}){
  const semantic=normalizeSemantic(semanticInput);
  const rc=integrate(facts,semantic,options);

  const legacy=legacyPolicy(semantic.domain);

  const oldSig=legacy?policySignature(legacy):[];
  const newSig=policySignature(rc.policy);

  return deepFreeze({
    domain:semantic.domain,
    shadowMode:true,
    legacyPolicy:legacy,
    rcPolicy:rc.policy,
    added:newSig.filter(x=>!oldSig.includes(x)),
    removed:oldSig.filter(x=>!newSig.includes(x)),
    changed:JSON.stringify(oldSig)!==JSON.stringify(newSig),
    rc
  });
}

function validate(){
  const errors=[];

  if(!K||!P||!B)errors.push('knowledge-dependency');
  if(INDEX.recordCount!==52)errors.push('index-count');
  if(SHADOW_MODE!==true)errors.push('shadow-mode');
  if(PRODUCTION_CUTOVER!==false)errors.push('production-cutover');

  const c=resolvePolicy({domain:'career'});
  if(c.primary[0]!=='กัมมะ')errors.push('career-primary');
  if(c.support.includes('ปิตา'))errors.push('pita-static-support');

  return {ok:errors.length===0,errors};
}

const API=deepFreeze({
  VERSION,
  SHADOW_MODE,
  PRODUCTION_CUTOVER,
  PERFORMANCE_BUDGET_MS_PER_RUN,
  HOUSE_ALIASES,
  INDEX,
  canonicalHouse,
  normalizeSemantic,
  legacyPolicy,
  resolvePolicy,
  selectPositions,
  pairRelationships,
  samePlanetLinks,
  integrate,
  shadowCompare,
  validate
});

root.HorajarnIntegratedPredictionV222=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
