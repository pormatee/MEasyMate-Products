const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'horoscope.html'),'utf8');
const quality=fs.readFileSync(path.join(root,'v2/interpretation-quality-v2.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'v2/horoscope-interpretation-ui-v2.js'),'utf8');
const assert=(x,m)=>{if(!x)throw new Error(m)};
assert(html.includes('INTELLIGENCE V2.8.3'),'version');
assert(html.includes('HORAJARN_V2_8_3_VOICE_COPY_HOOK'),'voice-copy-hook');
assert(html.includes('HorajarnInterpretationUIV2.summaryText(items)'),'summary-parity');
assert(ui.includes('b.dataset.speech=encodeURIComponent(speech)'),'card-speech-parity');
assert(ui.includes('summaryText(legacyItems)'),'full-summary-parity');
assert(quality.includes('ดาว${name} (${num})'),'planet-format');
for(const marker of ['fetch(','XMLHttpRequest','sendBeacon(']){
 assert(!quality.includes(marker),'quality-network:'+marker);
 assert(!ui.includes(marker),'ui-network:'+marker);
}
for(const bad of ['ได้ดาว 3 อังคาร','ได้ดาว 7 เสาร์','MODERATE','ไม่ใช่ probability']){
 assert(!ui.includes(bad),'ui-system-language:'+bad);
}
assert(html.includes('AstroCore.pick(rec,name)'),'pick-regression');
assert(html.includes('id="dayRule" disabled'),'day-rule-regression');
assert(!html.includes('value="civil"'),'civil-rule-regression');
console.log('HORAJARN_INTELLIGENCE_V2_8_3_PRODUCTION_STATIC=PASS');
