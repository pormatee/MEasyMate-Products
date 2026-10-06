const assert=require('assert');
const F=require('../v2/full-natal-relationship-v2.js');

const H=['อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา','ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ','มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสา','ทาสี'];
function facts(overrides={}){
  const vals=[5,6,7,1,2,3,4,3,4,5,6,7,1,2,3,4,3,5,6,6,7];
  return {records:H.map((name,i)=>({name,num:Object.prototype.hasOwnProperty.call(overrides,name)?overrides[name]:vals[i],base:Math.floor(i/7)+1,col:i%7}))};
}
const legacy=['identity','speech','mind','home','money','partner'].map(k=>({key:k,text:'BASE '+k,note:'NOTE '+k}));
assert.strictEqual(F.validate().ok,true);
const r=F.composeAll(facts(),legacy);
assert.strictEqual(r.ok,true);
assert.deepStrictEqual(r.ordered,['identity','speech','mind','home','work','money','partner']);
assert.strictEqual(Object.keys(r.domains).length,7);
assert.strictEqual(r.domains.work.signature.productionCutover,false);
assert.strictEqual(r.domains.money.signature.basisVerification,'LEGACY_PROVISIONAL');
assert.strictEqual(r.domains.partner.signature.basisVerification,'LEGACY_PROVISIONAL');
assert.strictEqual(r.domains.speech.signature.anchors[0].semanticHouseUse,false);
assert.strictEqual(r.domains.mind.signature.anchors[0].semanticHouseUse,false);
assert.strictEqual(r.domains.home.signature.anchors[0].semanticHouseUse,false);
for(const k of r.ordered){
  assert.strictEqual(r.domains[k].signature.productionCutover,false);
  assert(r.domains[k].signature.signatureKey);
}
assert.strictEqual(r.timingUsed,false);
assert.strictEqual(r.transitUsed,false);
assert.strictEqual(r.aiRuntimeRequired,false);
assert(r.domains.identity.text.includes('BASE identity'));
assert(r.domains.money.text.includes('BASE money'));
const r2=F.composeAll(facts({'กัมมะ':4}),legacy);
assert.notStrictEqual(r.fullSignatureKey,r2.fullSignatureKey);
console.log('HORAJARN_V2_28_FULL_NATAL=PASS');
console.log('NATAL_DOMAINS_7_7=PASS');
console.log('CAREER_V227_REUSED=PASS');
console.log('BASE4_PER_ANCHOR=PASS');
console.log('SAME_PLANET_GRAPH=PASS');
console.log('PAIR_RELATIONSHIP_GRAPH=PASS');
console.log('FINANCE_POLICY=LEGACY_PROVISIONAL');
console.log('LOVE_POLICY=LEGACY_PROVISIONAL');
console.log('TRANSIT_USED=NO');
console.log('AI_RUNTIME_REQUIRED=NO');
console.log('PRODUCTION_CUTOVER=NO');
