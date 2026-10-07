(function(root){'use strict';

const VERSION='2.29.0-controlled-natal-production-cutover';
const CACHE='2290';
const NATAL_CONTROLLED_CUTOVER=true;
const NATAL_FAIL_OPEN_LEGACY=true;
const EXPECTED_DOMAINS=[
  'identity','speech','mind','home','work','money','partner'
];

const META={
  identity:{icon:'👤',title:'ตัวตน'},
  speech:{icon:'🗣️',title:'คำพูด'},
  mind:{icon:'💭',title:'ใจและความคิด'},
  home:{icon:'🏡',title:'ที่อยู่'},
  work:{icon:'💼',title:'การงาน'},
  money:{icon:'💰',title:'การเงิน'},
  partner:{icon:'🤝',title:'คู่ครองและหุ้นส่วน'}
};

let readyPromise=null;
let requestSeq=0;
let last=null;

function params(search){
  try{
    const s=search!==undefined
      ? String(search||'')
      : (root.location&&root.location.search)||'';
    return new URLSearchParams(s);
  }catch{
    return new URLSearchParams('');
  }
}

function developerPreviewEnabled(search){
  const q=params(search);
  return (
    q.get('natalV228')==='1' ||
    q.get('narrativeV226')==='1' ||
    q.get('narrativeV227')==='1'
  );
}

function cutoverEnabled(search){
  const q=params(search);

  if(developerPreviewEnabled(search))
    return false;

  const v=q.get('natalV229');

  if(v==='0')return false;
  if(v==='1')return true;

  return NATAL_CONTROLLED_CUTOVER;
}

function esc(v){
  return String(v??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function validateComposed(r){
  const errors=[];

  if(!r||r.ok!==true)
    errors.push('COMPOSE_NOT_OK');

  if(
    !r ||
    !Array.isArray(r.ordered) ||
    r.ordered.length!==EXPECTED_DOMAINS.length ||
    r.ordered.some((k,i)=>k!==EXPECTED_DOMAINS[i])
  ){
    errors.push('DOMAIN_ORDER');
  }

  for(const key of EXPECTED_DOMAINS){
    const d=r&&r.domains&&r.domains[key];

    if(!d||d.ok!==true){
      errors.push('DOMAIN_'+key.toUpperCase());
      continue;
    }

    if(
      !Array.isArray(d.paragraphs) ||
      !d.paragraphs.some(x=>String(x||'').trim())
    ){
      errors.push('PARAGRAPHS_'+key.toUpperCase());
    }
  }

  if(r&&r.timingUsed!==false)
    errors.push('TIMING_USED');

  if(r&&r.transitUsed!==false)
    errors.push('TRANSIT_USED');

  if(r&&r.aiRuntimeRequired!==false)
    errors.push('AI_RUNTIME_REQUIRED');

  /*
   Engine V2.28.4 remains a pure interpretation engine.
   Production ownership belongs to this V2.29 adapter.
  */
  if(r&&r.productionCutover!==false)
    errors.push('ENGINE_CUTOVER_MUTATED');

  return {
    ok:errors.length===0,
    errors
  };
}

function cardHtml(key,d){
  const m=META[key]||{icon:'✦',title:key};
  const paras=(d.paragraphs||[])
    .map(x=>String(x||'').trim())
    .filter(Boolean);

  const speech=[
    m.title,
    ...paras
  ].join('. ');

  return (
    '<article class="natal-pro" data-v229-domain="'+esc(key)+'">'+
      '<div class="np-head">'+
        '<div class="np-icon">'+esc(m.icon)+'</div>'+
        '<div class="np-title"><h4>'+esc(m.title)+'</h4></div>'+
      '</div>'+
      paras.map(p=>'<p>'+esc(p)+'</p>').join('')+
      '<button type="button" class="speak-one" data-speech="'+
        esc(encodeURIComponent(speech))+
      '">🔊 ฟังเรื่องนี้</button>'+
    '</article>'
  );
}

function renderHtml(r){
  const check=validateComposed(r);

  if(!check.ok)
    throw new Error(
      'V229_INVALID_COMPOSED:'+check.errors.join(',')
    );

  const cards=EXPECTED_DOMAINS.map(
    key=>cardHtml(key,r.domains[key])
  ).join('');

  return (
    '<article class="card summary natal-intro" data-v229-production="1">'+
      '<div class="tag">พื้นดวง • FULL NATAL READING</div>'+
      '<h3>พื้นดวงของคุณ</h3>'+
      '<p class="lead">อ่าน 7 เรื่องสำคัญจากพื้นดวงและความสัมพันธ์ขององค์ประกอบในดวง โดยยังไม่ใช้ดวงจร</p>'+
    '</article>'+
    '<div class="natal-grid" data-v229-grid="1">'+cards+'</div>'
  );
}

function publicSummaryFrom(r){
  const check=validateComposed(r);
  if(!check.ok)return '';

  return EXPECTED_DOMAINS.map(key=>{
    const m=META[key]||{title:key};
    const d=r.domains[key];
    const text=(d.paragraphs||[])
      .map(x=>String(x||'').trim())
      .filter(Boolean)
      .join(' ');
    return m.title+': '+text;
  }).join('. ');
}

function load(src,test){
  if(test())return Promise.resolve();

  if(!root.document)
    return Promise.reject(
      new Error('DOCUMENT_REQUIRED:'+src)
    );

  return new Promise((resolve,reject)=>{
    const s=root.document.createElement('script');

    s.src=src+(src.includes('?')?'&':'?')+'v='+CACHE;
    s.onload=()=>resolve();
    s.onerror=()=>reject(
      new Error('LOAD_FAIL:'+src)
    );

    root.document.head.appendChild(s);
  });
}

async function boot(){
  await load(
    'v2/knowledge-v1-foundation.js',
    ()=>!!root.HorajarnKnowledgeV1FoundationV218
  );
  await load(
    'v2/multisource-knowledge-registry-v2.js',
    ()=>!!root.HorajarnMultiSourceKnowledgeV219
  );
  await load(
    'v2/knowledge-source-registry-v2.js',
    ()=>!!root.HorajarnKnowledgeSourcesV220
  );
  await load(
    'v2/knowledge-planets-batch1-v2.js',
    ()=>!!root.HorajarnPlanetKnowledgeBatch1V220
  );
  await load(
    'v2/knowledge-source-registry-v2.1.js',
    ()=>!!root.HorajarnKnowledgeSourcesV221
  );
  await load(
    'v2/knowledge-mega-batch2-v2.js',
    ()=>!!root.HorajarnKnowledgeMegaBatch2V221
  );
  await load(
    'rules/rules-v1.js',
    ()=>!!root.AstroRules
  );
  await load(
    'v2/integrated-prediction-engine-v2.js',
    ()=>!!root.HorajarnIntegratedPredictionV222
  );
  await load(
    'v2/relationship-narrative-v2.js',
    ()=>!!root.HorajarnRelationshipNarrativeV226
  );
  await load(
    'v2/natural-narrative-v2.js',
    ()=>!!root.HorajarnNaturalNarrativeV2261
  );
  await load(
    'v2/knowledge-base4-owner-v2.js',
    ()=>!!root.HorajarnBase4OwnerKnowledgeV227
  );
  await load(
    'v2/career-signature-v2.js',
    ()=>!!root.HorajarnCareerSignatureV227
  );
  await load(
    'v2/knowledge-owner-pairs-v2.js',
    ()=>!!root.HorajarnOwnerPairKnowledgeV2271
  );
  await load(
    'v2/contextual-pair-composer-v2.js',
    ()=>!!root.HorajarnContextualPairComposerV2271
  );
  await load(
    'v2/adaptive-career-narrative-v2.js',
    ()=>!!root.HorajarnAdaptiveCareerNarrativeV227
  );
  await load(
    'v2/full-natal-relationship-v2.js',
    ()=>!!root.HorajarnFullNatalRelationshipV228
  );

  return root.HorajarnFullNatalRelationshipV228;
}

function setLast(value){
  last=value;
  root.__HorajarnV229LastCutover=value;
  return value;
}

function failOpen(reason,requestId){
  if(requestId!==requestSeq)
    return {
      applied:false,
      stale:true,
      reason:'STALE_REQUEST'
    };

  return setLast({
    version:VERSION,
    applied:false,
    fallbackLegacy:true,
    productionCutover:false,
    reason:String(reason||'UNKNOWN')
  });
}

function applyAtomic(r,requestId){
  if(requestId!==requestSeq)
    return {
      applied:false,
      stale:true,
      reason:'STALE_REQUEST'
    };

  if(!root.document)
    return failOpen('DOCUMENT_REQUIRED',requestId);

  const host=root.document.getElementById('natalPanel');

  if(!host)
    return failOpen('NATAL_PANEL_MISSING',requestId);

  let html;
  let summary;

  try{
    html=renderHtml(r);
    summary=publicSummaryFrom(r);
  }catch(e){
    return failOpen(
      e&&e.message?e.message:String(e),
      requestId
    );
  }

  /*
   Atomic customer cutover:
   Legacy stays untouched until the complete V2.29 HTML
   is already built and validated.
  */
  host.innerHTML=html;

  return setLast({
    version:VERSION,
    applied:true,
    fallbackLegacy:false,
    productionCutover:true,
    domains:[...EXPECTED_DOMAINS],
    publicSummary:summary
  });
}

async function capture(payload={}){
  const requestId=++requestSeq;

  setLast({
    version:VERSION,
    applied:false,
    fallbackLegacy:true,
    productionCutover:false,
    reason:'PENDING'
  });

  if(!cutoverEnabled()){
    return failOpen(
      developerPreviewEnabled()
        ? 'DEVELOPER_PREVIEW_MODE'
        : 'KILL_SWITCH',
      requestId
    );
  }

  if(
    !payload ||
    !Array.isArray(payload.records) ||
    payload.records.length!==21
  ){
    return failOpen(
      'FACT_RECORDS_INVALID',
      requestId
    );
  }

  try{
    if(!readyPromise)
      readyPromise=boot();

    const api=await readyPromise;

    if(requestId!==requestSeq)
      return {
        applied:false,
        stale:true,
        reason:'STALE_REQUEST'
      };

    if(!api||typeof api.composeAll!=='function')
      throw new Error('FULL_NATAL_ENGINE_MISSING');

    const result=api.composeAll(
      {records:payload.records},
      Array.isArray(payload.natalPro)
        ? payload.natalPro
        : []
    );

    const check=validateComposed(result);

    if(!check.ok)
      throw new Error(
        'COMPOSE_GATE_FAIL:'+check.errors.join(',')
      );

    return applyAtomic(result,requestId);

  }catch(e){
    if(readyPromise && String(
      e&&e.message?e.message:e
    ).startsWith('LOAD_FAIL:')){
      readyPromise=null;
    }

    if(root.console&&root.console.error){
      root.console.error(
        'HORAJARN_V2_29_CUTOVER',
        e
      );
    }

    return failOpen(
      e&&e.message?e.message:String(e),
      requestId
    );
  }
}

function publicSummary(){
  return (
    last &&
    last.applied===true &&
    typeof last.publicSummary==='string'
  ) ? last.publicSummary : '';
}

function snapshot(){
  return last
    ? JSON.parse(JSON.stringify(last))
    : null;
}

function validate(){
  const errors=[];

  if(NATAL_CONTROLLED_CUTOVER!==true)
    errors.push('controlled-cutover');

  if(NATAL_FAIL_OPEN_LEGACY!==true)
    errors.push('fail-open');

  if(EXPECTED_DOMAINS.length!==7)
    errors.push('domain-count');

  return {
    ok:errors.length===0,
    errors
  };
}

const API={
  VERSION,
  NATAL_CONTROLLED_CUTOVER,
  NATAL_FAIL_OPEN_LEGACY,
  EXPECTED_DOMAINS:[...EXPECTED_DOMAINS],
  developerPreviewEnabled,
  cutoverEnabled,
  validateComposed,
  renderHtml,
  publicSummaryFrom,
  capture,
  publicSummary,
  snapshot,
  validate
};

root.HorajarnFullNatalProductionCutoverV229=API;

if(
  root.addEventListener &&
  root.document
){
  root.addEventListener(
    'horajarn:facts-ready',
    ()=>{
      const payload=root.__HorajarnLatestFactPayload;
      if(payload)capture(payload);
    }
  );

  if(root.__HorajarnLatestFactPayload)
    capture(root.__HorajarnLatestFactPayload);
}

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
