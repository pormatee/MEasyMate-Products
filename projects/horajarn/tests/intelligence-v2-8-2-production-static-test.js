const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),s=fs.readFileSync(path.join(root,'horoscope.html'),'utf8');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const q='<script src="v2/interpretation-quality-v2.js"></script>';
assert(s.includes(q),'quality-script');
assert(s.split(q).length===2,'quality-script-duplicate');
assert(s.indexOf(q)<s.indexOf('<script src="v2/horoscope-interpretation-ui-v2.js"></script>'),'quality-before-ui');
assert(s.includes('INTELLIGENCE V2.8.2'),'version');
assert(s.includes('HORAJARN_V2_8_INTERPRETATION_HOOK'),'existing-hook');
for(const marker of ['fetch(','XMLHttpRequest','sendBeacon(']){
 const quality=fs.readFileSync(path.join(root,'v2/interpretation-quality-v2.js'),'utf8');
 assert(!quality.includes(marker),'quality-network:'+marker);
}
const ui=fs.readFileSync(path.join(root,'v2/horoscope-interpretation-ui-v2.js'),'utf8');
for(const bad of ['MODERATE','Evidence ','ไม่ใช่ probability','สอดคล้องกันในระดับที่ระบบกำหนด'])assert(!ui.includes(bad),'public-system-language:'+bad);
console.log('HORAJARN_INTELLIGENCE_V2_8_2_PRODUCTION_STATIC=PASS');
