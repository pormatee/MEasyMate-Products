(function(root){'use strict';

const VERSION='2.25.0-production-shadow-career-cutover';
const PRODUCTION_CUTOVER=false;
const MAIN_THREAD_DISPATCH_BUDGET_MS=5;

/*
 V2.25: only Career Policy is allowed to cut over.
 Finance/Love remain legacy.
 Query kill switch: ?careerV225=0
*/
const CAREER_CONTROLLED_CUTOVER=true;
const CAREER_FAIL_OPEN_LEGACY=true;
const CAREER_CUTOVER_BUDGET_MS=5;

let worker=null;
let last=null;
let lastSignature=null;
let pendingSignature=null;
let requestSeq=0;
let activeRequestId=null;

function now(){
  return root.performance&&typeof root.performance.now==='function'
    ? root.performance.now()
    : Date.now();
}

function normalizeRecords(records){
  if(!Array.isArray(records))return [];

  return records.map(r=>({
    name:String(r.name||''),
    num:Number(r.num),
    base:r.base??null,
    col:r.col??null
  }));
}

function signature(records){
  return records.map(
    r=>`${r.name}:${r.num}:${r.base}:${r.col}`
  ).join('|');
}

function careerCutoverEnabled(){
  try{
    if(typeof location!=='undefined'){
      const v=new URLSearchParams(location.search)
        .get('careerV225');

      if(v==='0')return false;
      if(v==='1')return true;
    }
  }catch{}

  return CAREER_CONTROLLED_CUTOVER;
}

function escapeHtml(v){
  return String(v??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;");
}

function roleThai(role){
  return ({
    PRIMARY:'แกนหลัก',
    SUPPORT:'สนับสนุน',
    CONTEXT:'บริบท',
    CONDITIONAL:'ตามเงื่อนไข'
  })[role]||role;
}

const CAREER_PLANET_NAMES={
  1:'อาทิตย์',
  2:'จันทร์',
  3:'อังคาร',
  4:'พุธ',
  5:'พฤหัสบดี',
  6:'ศุกร์',
  7:'เสาร์',
  8:'ราหู',
  9:'เกตุ'
};

function careerPlanetLabel(n){
  n=Number(n);
  return `${n} ${CAREER_PLANET_NAMES[n]||''}`.trim();
}

function buildCareerPolicyText(view,legacyText=''){
  if(!view||view.ok!==true)
    return String(legacyText||'');

  const byHouse={};

  for(const x of view.positions)
    byHouse[x.house]=x;

  const kamma=byHouse['กัมมะ'];
  const dasa=byHouse['ทาสา'];
  const dasi=byHouse['ทาสี'];

  if(!kamma||!dasa||!dasi)
    return String(legacyText||'');

  /*
    Preserve the useful legacy explanation of Kamma,
    but remove the old static Pita-support sentence.
  */
  let primary=String(legacyText||'').trim();

  const pitaIndex=primary.indexOf('ปิตา');

  if(pitaIndex>=0)
    primary=primary.slice(0,pitaIndex).trim();

  const verified=
    `โครงสร้างการงาน V2.25 ใช้กัมมะเป็นแกนหลัก `+
    `(ดาว ${careerPlanetLabel(kamma.planet)}) `+
    `และใช้ทาสา (ดาว ${careerPlanetLabel(dasa.planet)}) `+
    `กับทาสี (ดาว ${careerPlanetLabel(dasi.planet)}) `+
    `เป็นจุดสนับสนุนเรื่องผู้ช่วย ลูกน้อง และคนร่วมงาน`;

  return [primary,verified]
    .filter(Boolean)
    .join(' ');
}

function buildCareerPolicyView(domains){
  if(!Array.isArray(domains))
    return {ok:false,reason:'DOMAINS_REQUIRED'};

  const c=domains.find(x=>x&&x.domain==='career');

  if(!c)
    return {ok:false,reason:'CAREER_RESULT_MISSING'};

  if(c.mode!=='OWNER_VERIFIED_OVERRIDE')
    return {ok:false,reason:'CAREER_POLICY_NOT_OWNER_VERIFIED'};

  if(!Array.isArray(c.positions))
    return {ok:false,reason:'CAREER_POSITIONS_MISSING'};

  const required=[
    ['กัมมะ','PRIMARY'],
    ['ทาสา','SUPPORT'],
    ['ทาสี','SUPPORT']
  ];

  for(const [house,role] of required){
    if(!c.positions.some(
      x=>x.house===house&&x.role===role
    )){
      return {
        ok:false,
        reason:'CAREER_REQUIRED_POSITION_MISSING:'+
          house+':'+role
      };
    }
  }

  return {
    ok:true,
    positions:c.positions.map(x=>({
      house:x.house,
      role:x.role,
      planet:Number(x.planet)
    })),
    links:Array.isArray(c.samePlanetHouseLinks)
      ? c.samePlanetHouseLinks
      : [],
    sourceRefs:Array.isArray(c.sourceRefs)
      ? c.sourceRefs
      : []
  };
}

function applyCareerCutover(domains){
  if(!careerCutoverEnabled()){
    return {
      applied:false,
      fallbackLegacy:true,
      reason:'CAREER_CUTOVER_DISABLED'
    };
  }

  const view=buildCareerPolicyView(domains);

  if(!view.ok){
    return {
      applied:false,
      fallbackLegacy:true,
      reason:view.reason
    };
  }

  if(typeof document==='undefined'){
    return {
      applied:false,
      fallbackLegacy:true,
      reason:'NO_DOCUMENT',
      view
    };
  }

  const card=document.querySelector(
    '[data-natal-key="work"]'
  );

  if(!card){
    return {
      applied:false,
      fallbackLegacy:true,
      reason:'CAREER_CARD_NOT_READY',
      view
    };
  }

  if(card.dataset.careerEngine==='V2.25'){
    return {
      applied:true,
      fallbackLegacy:false,
      reason:'ALREADY_APPLIED',
      cutoverMs:0,
      view
    };
  }

  const basis=card.querySelector('.np-basis');
  const body=card.querySelector('p');
  const note=card.querySelector('.np-note');

  if(!basis||!body||!note){
    return {
      applied:false,
      fallbackLegacy:true,
      reason:'CAREER_DOM_TARGET_MISSING',
      view
    };
  }

  const originalBasis=basis.innerHTML;
  const originalBody=body.innerHTML;
  const originalBodyText=body.textContent||'';
  const originalNote=note.innerHTML;

  const t0=now();

  basis.innerHTML=view.positions.map(x=>
    '<span>'+
      escapeHtml(x.house)+
      ' • ดาว '+escapeHtml(careerPlanetLabel(x.planet))+
      ' • '+escapeHtml(roleThai(x.role))+
    '</span>'
  ).join('');

  body.textContent=
    buildCareerPolicyText(
      view,
      originalBodyText
    );

  const linkText=view.links.length
    ? ' • พบการเชื่อมเรือนจากดาวเดียวกัน '+
      view.links.map(x=>
        'ดาว '+x.planet+': '+
        x.houses.join(' ↔ ')
      ).join('; ')
    : '';

  note.innerHTML=
    originalNote+
    '<div data-v225-career-note '+
    'style="margin-top:7px;padding-top:7px;'+
    'border-top:1px dashed #e6dbe9">'+
    '<b>Career V2.25:</b> '+
    'ใช้กัมมะเป็นแกนหลัก และใช้ทาสา/ทาสี'+
    'ประกอบเรื่องผู้ช่วย ลูกน้อง และคนร่วมงาน'+
    escapeHtml(linkText)+
    '</div>';

  const cutoverMs=now()-t0;

  if(cutoverMs>=CAREER_CUTOVER_BUDGET_MS){
    basis.innerHTML=originalBasis;
    body.innerHTML=originalBody;
    note.innerHTML=originalNote;

    return {
      applied:false,
      fallbackLegacy:true,
      reason:
        'CAREER_CUTOVER_BUDGET_EXCEEDED:'+
        cutoverMs.toFixed(4),
      cutoverMs,
      view
    };
  }

  card.dataset.careerEngine='V2.25';

  return {
    applied:true,
    fallbackLegacy:false,
    reason:'CAREER_CONTROLLED_CUTOVER',
    cutoverMs,
    view
  };
}

function debugEnabled(){
  try{
    return typeof location!=='undefined' &&
      new URLSearchParams(location.search)
        .get('shadowDebug')==='1';
  }catch{
    return false;
  }
}

function renderDebug(info){
  if(!debugEnabled()||typeof document==='undefined')
    return;

  let el=document.getElementById(
    'horajarnShadowDebugV223'
  );

  if(!el){
    el=document.createElement('div');
    el.id='horajarnShadowDebugV223';

    el.style.cssText=[
      'position:fixed',
      'left:8px',
      'right:8px',
      'bottom:8px',
      'z-index:99999',
      'padding:10px 12px',
      'border-radius:12px',
      'background:#111',
      'color:#fff',
      'font:12px system-ui',
      'box-shadow:0 2px 12px #0005'
    ].join(';');

    document.body.appendChild(el);
  }

  if(info.status==='PASS'){
    el.textContent=
      `V2.25 CONTROLLED PASS • DOMAINS=3/3 • `+
      `MAIN=${info.dispatchMs.toFixed(3)}ms • `+
      `WORKER=${info.workerMs.toFixed(3)}ms • `+
      (
        info.careerCutover&&info.careerCutover.applied
          ? `CAREER=V2.25(`+
            `${Number(info.careerCutover.cutoverMs||0).toFixed(3)}ms) • `
          : `CAREER=LEGACY • `
      )+
      `FINANCE/LOVE=LEGACY • GLOBAL_CUTOVER=NO`;

  }else if(info.status==='RUNNING'){
    el.textContent=
      `V2.25 WORKER RUNNING • `+
      `MAIN_DISPATCH=${info.dispatchMs.toFixed(3)}ms`;

  }else if(info.status==='FAIL'){
    el.textContent=
      `V2.25 SHADOW FAIL • ${info.reason}`;

  }else{
    el.textContent='V2.25 CONTROLLED READY';
  }
}

function schedule(fn){
  if(typeof root.requestIdleCallback==='function'){
    root.requestIdleCallback(fn,{timeout:600});
    return;
  }

  root.setTimeout(fn,0);
}

function fail(reason){
  last={
    version:VERSION,
    status:'FAIL',
    reason:String(reason||'UNKNOWN'),
    productionCutover:false
  };

  if(typeof document!=='undefined')
    document.documentElement.dataset.horajarnShadow='fail';

  renderDebug(last);

  if(root.console&&typeof root.console.warn==='function'){
    root.console.warn(
      'HORAJARN_V2_23_2_SHADOW',
      last.reason
    );
  }
}

function ensureWorker(){
  if(worker)return worker;

  if(typeof Worker==='undefined')
    throw new Error('WEB_WORKER_UNAVAILABLE');

  worker=new Worker(
    'v2/production-shadow-worker-v2.js?v=2251'
  );

  worker.onmessage=function(ev){
    const msg=ev.data||{};

    if(msg.type==='WORKER_BOOT_ERROR'){
      fail('WORKER_BOOT_ERROR:'+msg.error);
      return;
    }

    if(msg.requestId!==activeRequestId)
      return;

    if(msg.type==='SHADOW_ERROR'){
      pendingSignature=null;
      activeRequestId=null;
      fail(msg.error);
      return;
    }

    if(msg.type!=='SHADOW_RESULT')
      return;

    const result=msg.result||{};

    if(
      !result.ok ||
      !Array.isArray(result.domains) ||
      result.domains.length!==3 ||
      result.productionCutover!==false
    ){
      pendingSignature=null;
      activeRequestId=null;
      fail('WORKER_RESULT_INVALID');
      return;
    }

    const dispatchMs=
      last&&Number(last.dispatchMs)||0;

    if(dispatchMs>=MAIN_THREAD_DISPATCH_BUDGET_MS){
      pendingSignature=null;
      activeRequestId=null;

      fail(
        'MAIN_THREAD_DISPATCH_BUDGET_EXCEEDED:'+
        dispatchMs.toFixed(4)
      );
      return;
    }

    lastSignature=pendingSignature;
    pendingSignature=null;
    activeRequestId=null;

    const careerCutover=
      applyCareerCutover(result.domains);

    last={
      version:VERSION,
      status:'PASS',
      dispatchMs,
      workerMs:Number(result.workerMs)||0,
      domains:result.domains,
      productionCutover:false,
      customerFacingOutputChanged:
        careerCutover.applied===true,
      careerCutover
    };

    if(typeof document!=='undefined')
      document.documentElement.dataset.horajarnShadow='pass';

    renderDebug(last);
  };

  worker.onerror=function(e){
    pendingSignature=null;
    activeRequestId=null;

    fail(
      'WORKER_RUNTIME_ERROR:'+
      (e&&e.message?e.message:'UNKNOWN')
    );
  };

  return worker;
}

function capture(input={}){
  const rows=normalizeRecords(input.records);

  if(rows.length!==21){
    fail('FACT_RECORDS_INVALID');

    return {
      scheduled:false,
      reason:'FACT_RECORDS_INVALID'
    };
  }

  const sig=signature(rows);

  if(sig===lastSignature||sig===pendingSignature){
    /*
      Re-rendering the same birth data creates a new DOM card.
      Reapply V2.25 from the cached result without rerunning Worker.
    */
    if(
      sig===lastSignature &&
      last &&
      Array.isArray(last.domains)
    ){
      last.careerCutover=
        applyCareerCutover(last.domains);
    }

    return {
      scheduled:false,
      reason:'DUPLICATE_FACTS'
    };
  }

  pendingSignature=sig;

  schedule(()=>{
    try{
      const w=ensureWorker();

      const requestId=++requestSeq;
      activeRequestId=requestId;

      const t0=now();

      w.postMessage({
        type:'RUN_SHADOW',
        requestId,
        records:rows
      });

      const dispatchMs=now()-t0;

      last={
        version:VERSION,
        status:'RUNNING',
        dispatchMs,
        productionCutover:false
      };

      renderDebug({
        status:'RUNNING',
        dispatchMs
      });

      if(dispatchMs>=MAIN_THREAD_DISPATCH_BUDGET_MS){
        pendingSignature=null;
        activeRequestId=null;

        fail(
          'MAIN_THREAD_DISPATCH_BUDGET_EXCEEDED:'+
          dispatchMs.toFixed(4)
        );
      }

    }catch(e){
      pendingSignature=null;
      activeRequestId=null;

      fail(
        e&&e.message?e.message:String(e)
      );
    }
  });

  return {
    scheduled:true,
    productionCutover:false
  };
}

function snapshot(){
  return last
    ? JSON.parse(JSON.stringify(last))
    : null;
}

function validate(){
  const errors=[];

  if(PRODUCTION_CUTOVER!==false)
    errors.push('production-cutover');

  if(MAIN_THREAD_DISPATCH_BUDGET_MS!==5)
    errors.push('dispatch-budget');

  if(CAREER_CONTROLLED_CUTOVER!==true)
    errors.push('career-cutover');

  if(CAREER_FAIL_OPEN_LEGACY!==true)
    errors.push('career-fail-open');

  if(CAREER_CUTOVER_BUDGET_MS!==5)
    errors.push('career-cutover-budget');

  return {
    ok:errors.length===0,
    errors
  };
}

if(debugEnabled())
  renderDebug({status:'READY'});

const API={
  VERSION,
  PRODUCTION_CUTOVER,
  MAIN_THREAD_DISPATCH_BUDGET_MS,
  CAREER_CONTROLLED_CUTOVER,
  CAREER_FAIL_OPEN_LEGACY,
  CAREER_CUTOVER_BUDGET_MS,
  normalizeRecords,
  buildCareerPolicyView,
  buildCareerPolicyText,
  applyCareerCutover,
  capture,
  snapshot,
  validate
};

root.HorajarnProductionShadowV223=API;

/* Android/mobile load-order guard */
if(root.__HorajarnV223PendingShadow){
  const pending=root.__HorajarnV223PendingShadow;

  try{
    delete root.__HorajarnV223PendingShadow;
  }catch{
    root.__HorajarnV223PendingShadow=null;
  }

  capture(pending);
}

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
