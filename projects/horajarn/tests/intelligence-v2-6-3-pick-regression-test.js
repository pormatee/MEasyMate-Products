const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const p=path.join(root,'horoscope-v2-candidate.html');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const s=fs.readFileSync(p,'utf8');

function body(name){
  const n='function '+name+'(',a=s.indexOf(n);
  assert(a>=0,'missing:'+name);
  const b=s.indexOf('{',a);
  let d=0,q=null,e=false;
  for(let i=b;i<s.length;i++){
    const c=s[i];
    if(q){
      if(e){e=false;continue}
      if(c==='\\\\'){e=true;continue}
      if(c===q)q=null;
      continue
    }
    if(c==="'"||c==='"'||c==='`'){q=c;continue}
    if(c==='{')d++;
    else if(c==='}'){d--;if(d===0)return s.slice(b+1,i)}
  }
  throw new Error('unbalanced:'+name);
}

const pickBody=body('pick');
assert(pickBody.includes('AstroCore.pick(rec,name)'),'pick-must-use-rec');
assert(!pickBody.includes('AstroCore.pick(records,name)'),'pick-records-leak');
assert(s.includes("HORAJARN_V2_RUNTIME"),'runtime-guard');
assert(s.includes('INTELLIGENCE V2.6.3'),'version-label');
console.log('HORAJARN_INTELLIGENCE_V2_6_3_PICK_REGRESSION=PASS');
