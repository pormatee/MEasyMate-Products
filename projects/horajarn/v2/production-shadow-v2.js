(function(root){'use strict';

const VERSION='2.23.2-production-shadow-worker';
const PRODUCTION_CUTOVER=false;
const MAIN_THREAD_DISPATCH_BUDGET_MS=5;

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
      `V2.23.2 SHADOW PASS • DOMAINS=3/3 • `+
      `MAIN_DISPATCH=${info.dispatchMs.toFixed(3)}ms • `+
      `WORKER=${info.workerMs.toFixed(3)}ms • `+
      `BUDGET=<${MAIN_THREAD_DISPATCH_BUDGET_MS}ms • `+
      `PRODUCTION_CUTOVER=NO`;

  }else if(info.status==='RUNNING'){
    el.textContent=
      `V2.23.2 WORKER RUNNING • `+
      `MAIN_DISPATCH=${info.dispatchMs.toFixed(3)}ms`;

  }else if(info.status==='FAIL'){
    el.textContent=
      `V2.23.2 SHADOW FAIL • ${info.reason}`;

  }else{
    el.textContent='V2.23.2 SHADOW READY';
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
    'v2/production-shadow-worker-v2.js'
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

    last={
      version:VERSION,
      status:'PASS',
      dispatchMs,
      workerMs:Number(result.workerMs)||0,
      domains:result.domains,
      productionCutover:false,
      customerFacingOutputChanged:false
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
  normalizeRecords,
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
