const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const p=path.join(root,'horoscope.html');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const s=fs.readFileSync(p,'utf8');

for(const ref of [
  'core/astrology-core.js',
  'v2/contracts-v2.js',
  'v2/fact-engine-v2.js',
  'v2/profile-adapter-v2.js',
  'v2/horoscope-fact-bridge-v2.js',
  'v2/horoscope-ui-adapter-v2.js'
]) assert(s.includes(ref),'dependency:'+ref);

assert(s.includes('INTELLIGENCE V2.7'),'version-label');
assert(s.includes('id="dayRule" disabled'),'day-rule-lock');
assert(!s.includes('value="civil"'),'civil-day-rule-present');
assert(s.includes("AstroCore.pick(rec,name)"),'pick-scope-regression');
assert(s.includes("const name=AstroCore.roleOfPlanet(t,p),i=t.indexOf(p)"),'role-contract-regression');
assert(s.includes("col:x.col-1"),'position-col-contract-regression');
assert(s.includes("HORAJARN_V2_RUNTIME"),'runtime-guard');

// Privacy: production horoscope page must not send personal reading data over network.
for(const marker of ['fetch(','XMLHttpRequest','sendBeacon(','/v1/events','birth_date','birthDate']) {
  assert(!s.includes(marker),'privacy-network-marker:'+marker);
}
assert(s.includes('astroProfileV1') || fs.readFileSync(path.join(root,'v2/horoscope-ui-adapter-v2.js'),'utf8').includes('astroProfileV1'),'profile-local-key');

console.log('HORAJARN_INTELLIGENCE_V2_7_PRODUCTION_STATIC=PASS');
