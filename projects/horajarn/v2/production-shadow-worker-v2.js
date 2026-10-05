(function(root){'use strict';

const VERSION='2.23.2-shadow-worker';
const DOMAINS=['career','finance','love'];

function normalizeRecords(records){
  if(!Array.isArray(records)) return [];

  return records.map(r=>({
    name:String(r.name||''),
    num:Number(r.num),
    base:r.base??null,
    col:r.col??null
  }));
}

function summarize(x){
  return {
    domain:x.domain,
    changed:x.changed,
    mode:x.rc.policy.mode,
    productionCutover:x.rc.productionCutover,
    pairCount:x.rc.pairRelationships.length,
    linkCount:x.rc.samePlanetHouseLinks.length,
    sourceCount:x.rc.trace.sourceRefs.length,
    added:[...x.added],
    removed:[...x.removed]
  };
}

function evaluateWithEngine(records,engine){
  const rows=normalizeRecords(records);

  if(rows.length!==21)
    throw new Error('V2_23_2_FACT_RECORDS_INVALID');

  if(!engine||typeof engine.shadowCompare!=='function')
    throw new Error('V2_23_2_ENGINE_REQUIRED');

  const t0=
    typeof performance!=='undefined' &&
    typeof performance.now==='function'
      ? performance.now()
      : Date.now();

  const facts={records:rows};

  const domains=DOMAINS.map(domain=>
    summarize(
      engine.shadowCompare(
        facts,
        {domain}
      )
    )
  );

  const t1=
    typeof performance!=='undefined' &&
    typeof performance.now==='function'
      ? performance.now()
      : Date.now();

  const ok=
    domains.length===3 &&
    domains.every(x=>x.productionCutover===false) &&
    engine.PRODUCTION_CUTOVER===false &&
    engine.SHADOW_MODE===true;

  return {
    ok,
    version:VERSION,
    domains,
    workerMs:t1-t0,
    productionCutover:false,
    customerFacingOutputChanged:false
  };
}

/* Browser Worker runtime */
if(
  typeof importScripts==='function' &&
  typeof document==='undefined'
){
  try{
    importScripts(
      'knowledge-v1-foundation.js',
      'multisource-knowledge-registry-v2.js',
      'knowledge-source-registry-v2.js',
      'knowledge-planets-batch1-v2.js',
      'knowledge-source-registry-v2.1.js',
      'knowledge-mega-batch2-v2.js',
      '../rules/rules-v1.js',
      'integrated-prediction-engine-v2.js'
    );

    root.onmessage=function(ev){
      try{
        const msg=ev.data||{};

        if(msg.type!=='RUN_SHADOW')
          return;

        const result=evaluateWithEngine(
          msg.records,
          root.HorajarnIntegratedPredictionV222
        );

        root.postMessage({
          type:'SHADOW_RESULT',
          requestId:msg.requestId,
          result
        });

      }catch(e){
        root.postMessage({
          type:'SHADOW_ERROR',
          requestId:ev.data&&ev.data.requestId,
          error:e&&e.message?e.message:String(e)
        });
      }
    };

  }catch(e){
    root.postMessage({
      type:'WORKER_BOOT_ERROR',
      error:e&&e.message?e.message:String(e)
    });
  }
}

const API={
  VERSION,
  DOMAINS,
  normalizeRecords,
  evaluateWithEngine
};

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof self!=='undefined'?self:globalThis);
