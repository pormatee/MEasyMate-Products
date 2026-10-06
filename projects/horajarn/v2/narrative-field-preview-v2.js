(function(root){'use strict';

const VERSION='2.27.0-field-preview';
const CACHE='2270';

let latest=null;
let readyPromise=null;

function load(src,test){
  if(test())
    return Promise.resolve();

  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');

    s.src=
      src+
      (src.includes('?')?'&':'?')+
      'v='+CACHE;

    s.onload=()=>resolve();

    s.onerror=()=>reject(
      new Error('LOAD_FAIL:'+src)
    );

    document.head.appendChild(s);
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

  return root.HorajarnAdaptiveCareerNarrativeV227;
}

function esc(v){
  return String(v)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

function render(r){
  const host=document.getElementById(
    'natalPanel'
  );

  if(!host)return;

  let box=document.getElementById(
    'horajarn-v227-field-preview'
  );

  if(!box){
    box=document.createElement('section');
    box.id='horajarn-v227-field-preview';

    box.style.cssText=[
      'margin:14px 0',
      'padding:16px',
      'border:2px solid #7c5cff',
      'border-radius:18px',
      'background:#fbfaff',
      'line-height:1.75'
    ].join(';');

    host.prepend(box);
  }

  if(!r||!r.ok){
    box.innerHTML=
      '<b>V2.27 FIELD PREVIEW FAIL</b>'+
      '<div>'+esc(
        r&&r.reason?r.reason:'UNKNOWN'
      )+'</div>';

    return;
  }

  const paragraphs=r.paragraphs
    .map(x=>
      '<p style="margin:0 0 14px">'+
      esc(x)+
      '</p>'
    ).join('');

  const evidence={
    signatureKey:r.signatureKey,
    anchor:r.signature.anchor,
    base4:r.signature.base4,
    samePlanet:r.signature.samePlanet,
    supports:r.signature.supports,
    pairs:r.signature.pairs,
    ranking:r.signature.ranking,
    provenance:r.signature.provenance,
    contextualPairEvidence:r.contextualPairEvidence,
    productionCutover:r.productionCutover
  };

  box.innerHTML=
    '<div style="font-size:12px;font-weight:800;opacity:.65">'+
    'V2.27 • REAL CHART SIGNATURE • DEBUG ONLY'+
    '</div>'+
    '<h3 style="margin:4px 0 12px">'+
    'คำพยากรณ์การงานแบบ Relationship Graph'+
    '</h3>'+
    paragraphs+
    '<details style="margin-top:12px">'+
    '<summary>ดู Prediction Signature</summary>'+
    '<pre style="white-space:pre-wrap;font-size:11px">'+
    esc(JSON.stringify(evidence,null,2))+
    '</pre>'+
    '</details>';

  root.__HorajarnV227LastPreview=r;
}

async function capture(payload){
  latest=payload;

  try{
    if(!readyPromise)
      readyPromise=boot();

    const A=await readyPromise;

    if(
      !latest ||
      !Array.isArray(latest.records)
    )
      throw new Error(
        'FACT_RECORDS_REQUIRED'
      );

    render(
      A.composeCareer({
        records:latest.records
      })
    );

  }catch(e){
    render({
      ok:false,
      reason:e&&e.message
        ? e.message
        : String(e)
    });

    console.error(
      'HORAJARN_V2_27_FIELD_PREVIEW',
      e
    );
  }
}

root.HorajarnNarrativeFieldPreviewV227={
  VERSION,
  capture,
  snapshot:()=>
    root.__HorajarnV227LastPreview||null
};

const pending=
  root.__HorajarnLatestFactPayload ||
  root.__HorajarnV2261PendingNarrative;

if(pending){
  delete root.__HorajarnV2261PendingNarrative;
  capture(pending);
}

})(window);
