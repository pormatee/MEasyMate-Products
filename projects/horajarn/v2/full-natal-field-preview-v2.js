(function(root){'use strict';

const VERSION='2.28.4-customer-language-preview';
const CACHE='2284';
let readyPromise=null;
let latest=null;

function load(src,test){
  if(test())return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src+(src.includes('?')?'&':'?')+'v='+CACHE;
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error('LOAD_FAIL:'+src));
    document.head.appendChild(s);
  });
}

async function boot(){
  await load('v2/knowledge-v1-foundation.js',()=>!!root.HorajarnKnowledgeV1FoundationV218);
  await load('v2/multisource-knowledge-registry-v2.js',()=>!!root.HorajarnMultiSourceKnowledgeV219);
  await load('v2/knowledge-source-registry-v2.js',()=>!!root.HorajarnKnowledgeSourcesV220);
  await load('v2/knowledge-planets-batch1-v2.js',()=>!!root.HorajarnPlanetKnowledgeBatch1V220);
  await load('v2/knowledge-source-registry-v2.1.js',()=>!!root.HorajarnKnowledgeSourcesV221);
  await load('v2/knowledge-mega-batch2-v2.js',()=>!!root.HorajarnKnowledgeMegaBatch2V221);
  await load('rules/rules-v1.js',()=>!!root.AstroRules);
  await load('v2/integrated-prediction-engine-v2.js',()=>!!root.HorajarnIntegratedPredictionV222);
  await load('v2/relationship-narrative-v2.js',()=>!!root.HorajarnRelationshipNarrativeV226);
  await load('v2/natural-narrative-v2.js',()=>!!root.HorajarnNaturalNarrativeV2261);
  await load('v2/knowledge-base4-owner-v2.js',()=>!!root.HorajarnBase4OwnerKnowledgeV227);
  await load('v2/career-signature-v2.js',()=>!!root.HorajarnCareerSignatureV227);
  await load('v2/knowledge-owner-pairs-v2.js',()=>!!root.HorajarnOwnerPairKnowledgeV2271);
  await load('v2/contextual-pair-composer-v2.js',()=>!!root.HorajarnContextualPairComposerV2271);
  await load('v2/adaptive-career-narrative-v2.js',()=>!!root.HorajarnAdaptiveCareerNarrativeV227);
  await load('v2/full-natal-relationship-v2.js',()=>!!root.HorajarnFullNatalRelationshipV228);
  return root.HorajarnFullNatalRelationshipV228;
}

function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function title(key){return ({identity:'👤 ตัวตน',speech:'🗣️ คำพูด',mind:'💭 ใจและความคิด',home:'🏡 ที่อยู่',work:'💼 การงาน',money:'💰 การเงิน',partner:'🤝 คู่ครองและหุ้นส่วน'})[key]||key;}

function render(r){
  const host=document.getElementById('natalPanel');
  if(!host)return;
  let box=document.getElementById('horajarn-v228-full-natal-preview');
  if(!box){
    box=document.createElement('section');
    box.id='horajarn-v228-full-natal-preview';
    box.style.cssText='margin:14px 0;padding:16px;border:2px solid #7656d8;border-radius:18px;background:#fcfbff;line-height:1.75';
    host.prepend(box);
  }
  if(!r||!r.ok){box.innerHTML='<b>V2.28.2 NATAL PREVIEW FAIL</b><div>'+esc(r&&r.reason?r.reason:'UNKNOWN')+'</div>';return;}
  const cards=r.ordered.map(key=>{
    const d=r.domains[key];
    const paras=(d.paragraphs||[]).map(x=>'<p style="margin:0 0 10px">'+esc(x)+'</p>').join('');
    const signature=d.signature;
    const trace={signatureKey:signature.signatureKey,basisMode:signature.basisMode||'OWNER_VERIFIED_CAREER_V227',basisVerification:signature.basisVerification||'OWNER_VERIFIED_V1',anchors:signature.anchors||signature.anchor,base4:signature.base4Modifiers||signature.base4,samePlanet:signature.samePlanetLinks||signature.samePlanet,pairs:signature.pairRelationships||signature.pairs,provenance:signature.provenance};
    return '<article style="margin:12px 0;padding:14px;border:1px solid #ddd6ff;border-radius:14px;background:white">'+
      '<h3 style="margin:0 0 8px">'+esc(title(key))+'</h3>'+paras+
      '<details><summary>ดู Signature</summary><pre style="white-space:pre-wrap;font-size:11px">'+esc(JSON.stringify(trace,null,2))+'</pre></details></article>';
  }).join('');
  box.innerHTML='<div style="font-size:12px;font-weight:800;opacity:.65">V2.28.4 • CUSTOMER LANGUAGE COMPOSER • DEBUG ONLY</div><h2 style="margin:4px 0 6px">พื้นดวงแบบ Relationship Intelligence</h2><p style="margin:0 0 12px">ยังไม่ใช้ดวงจร และยังไม่ตัดเข้า Production</p>'+cards;
  root.__HorajarnV228LastPreview=r;
}

async function capture(payload){
  latest=payload;
  try{
    if(!readyPromise)readyPromise=boot();
    const api=await readyPromise;
    if(!latest||!Array.isArray(latest.records))throw new Error('FACT_RECORDS_REQUIRED');
    render(api.composeAll({records:latest.records},latest.natalPro||[]));
  }catch(e){
    render({ok:false,reason:e&&e.message?e.message:String(e)});
    console.error('HORAJARN_V2_28_2_NATAL',e);
  }
}

root.HorajarnFullNatalFieldPreviewV228={VERSION,capture,snapshot:()=>root.__HorajarnV228LastPreview||null};
if(root.__HorajarnLatestFactPayload)capture(root.__HorajarnLatestFactPayload);

})(window);
