const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),p=path.join(root,'horoscope.html');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const s=fs.readFileSync(p,'utf8');
for(const ref of ['sources/source-registry.js','knowledge/knowledge-base.js','rules/rules-v1.js','v2/knowledge-verification-v2.js','v2/knowledge-model-v2.js','v2/accuracy-policy-v2.js','v2/evidence-engine-v2.js','v2/accuracy-engine-v2.js','v2/interpretation-policy-v2.js','v2/interpretation-engine-v2.js','v2/intelligence-engine-v2.js','v2/horoscope-interpretation-ui-v2.js']){
  const needle='<script src="'+ref+'"></script>';
  assert(s.includes(needle),'missing:'+ref);
  assert(s.split(needle).length===2,'duplicate:'+ref);
}
assert(s.includes('data-natal-key="${x.key}"'),'natal-data-key');
assert(s.includes('HORAJARN_V2_8_INTERPRETATION_HOOK'),'hook');
assert(s.includes('HorajarnInterpretationUIV2.apply(v,new Date())'),'apply-hook');
assert(s.includes('INTELLIGENCE V2.8'),'version-label');
assert(s.includes('AstroCore.pick(rec,name)'),'pick-regression');
assert(s.includes('id="dayRule" disabled'),'day-rule');
assert(!s.includes('value="civil"'),'civil-rule');
for(const marker of ['fetch(','XMLHttpRequest','sendBeacon('])assert(!s.includes(marker),'network-marker:'+marker);
const ui=fs.readFileSync(path.join(root,'v2/horoscope-interpretation-ui-v2.js'),'utf8');
assert(!ui.includes('fetch('),'ui-network');
assert(!ui.includes('localStorage'),'ui-profile-storage');
assert(ui.includes('scoreIsPredictiveProbability'),'probability-guard');
console.log('HORAJARN_INTELLIGENCE_V2_8_PRODUCTION_STATIC=PASS');
