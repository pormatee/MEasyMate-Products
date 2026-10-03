const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),candidate=path.join(root,'horoscope-v2-candidate.html');
const assert=(x,m)=>{if(!x)throw new Error(m)};
assert(fs.existsSync(candidate),'candidate-missing');
const s=fs.readFileSync(candidate,'utf8');
for(const ref of ['core/astrology-core.js','v2/contracts-v2.js','v2/fact-engine-v2.js','v2/profile-adapter-v2.js','v2/horoscope-fact-bridge-v2.js','v2/horoscope-candidate-adapter-v2.js'])assert(s.includes(ref),'script:'+ref);
assert(s.includes('id="dayRule" disabled'),'day-rule-not-locked');
assert(!s.includes('value="civil"'),'civil-rule-still-present');
const delegates={
 thaiLunar:'AstroCore.thaiLunar(y,m,d)',
 astroDate:'HorajarnHoroscopeFactBridgeV2.compatibilityView',
 birthPlanet:'HorajarnHoroscopeFactBridgeV2.compatibilityView',
 thaksaFor:'AstroCore.thaksaFor(p)',
 roleOfPlanet:'AstroCore.roleOfPlanet(t,p)',
 mahasatta:'HorajarnHoroscopeFactBridgeV2.normalizedProfile',
 positionRecords:'AstroCore.positionRecords(m)',
 pick:'AstroCore.pick(records,name)',
 mahaTaksaAt:'AstroCore.mahaTaksaAt',
 dailyPlanetNow:'HorajarnHoroscopeFactBridgeV2.planetForMoment'
};
function body(name){
  const n='function '+name+'(',a=s.indexOf(n);assert(a>=0,'fn:'+name);
  const b=s.indexOf('{',a);let d=0,q=null,e=false;
  for(let i=b;i<s.length;i++){
    const c=s[i];
    if(q){if(e){e=false;continue}if(c==='\\\\'){e=true;continue}if(c===q)q=null;continue}
    if(c==="'"||c==='"'||c==='`'){q=c;continue}
    if(c==='{')d++;else if(c==='}'){d--;if(d===0)return s.slice(b+1,i)}
  }
  throw new Error('unbalanced:'+name)
}
for(const [name,marker] of Object.entries(delegates))assert(body(name).includes(marker),'delegate:'+name);
assert(s.includes('INTELLIGENCE V2 CANDIDATE'),'candidate-label');
console.log('HORAJARN_INTELLIGENCE_V2_6_CANDIDATE_STATIC=PASS');
