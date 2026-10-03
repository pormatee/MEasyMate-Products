global.window=global;
global.AstroKnowledge={getPlanet:n=>({name:{3:'อังคาร',4:'พุธ',5:'พฤหัสบดี',6:'ศุกร์'}[n]||'ดาว'+n})};
global.HorajarnProfileAdapterV2={toCoreProfile:x=>x};
global.HorajarnIntelligenceV2={};
require('../v2/interpretation-quality-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
function audit(service,house,num,meaning,supportMeaning,conclusion='PARTIAL_SUPPORT'){
 const e1={evidenceId:'E1',role:'PRIMARY',direction:'NEUTRAL',factRefs:['F1'],knowledge:{meaning},effectiveWeight:.7};
 const e2={evidenceId:'E2',role:'SUPPORT',direction:'NEUTRAL',factRefs:['F2'],knowledge:{meaning:supportMeaning},effectiveWeight:.4};
 const e3={evidenceId:'E3',role:'CONTEXT',direction:'SUPPORT',factRefs:['T1'],knowledge:{meaning:'โอกาสและแรงสนับสนุน'},timeScope:'CURRENT_MAIN',timelineVerification:'UNVERIFIED',effectiveWeight:.3};
 return{facts:[{factId:'F1',type:'house_number',house,value:num},{factId:'F2',type:'house_number',house:house+'รอง',value:4}],evidence:[e1,e2,e3],accuracy:{conclusion,confidenceBand:'MODERATE',uncertainty:'NORMAL',rankedEvidence:[e1,e2,e3]},interpretation:{summary:'legacy-system-summary'}};
}
const c=HorajarnInterpretationQualityV2.compose('career',audit('career','กัมมะ',3,'งานช่าง วิศวกรรม และงานแก้ปัญหา','การบริหารและการรับผิดชอบ'));
const f=HorajarnInterpretationQualityV2.compose('finance',audit('finance','ธนัง',4,'รายได้จากการค้า ข้อมูล และการเจรจา','การสร้างฐานทรัพย์ด้วยระบบ'));
const l=HorajarnInterpretationQualityV2.compose('love',audit('love','ปัตนิ',6,'คู่หรือหุ้นส่วนที่ให้ความสำคัญกับความสัมพันธ์','การสื่อสารและความร่วมมือ'));
for(const m of [c,f,l]){
 const v=HorajarnInterpretationQualityV2.validateModel(m);assert(v.ok,v.errors.join(','));
 assert(m.timing.includes('ช่วงวันเปลี่ยนดาวจริงยังอยู่ระหว่างตรวจสอบ'),'timeline-caveat');
 assert(m.scoreIsPredictiveProbability===false,'probability');
}
assert(c.body!==f.body&&f.body!==l.body&&c.body!==l.body,'topic-distinct');
assert(c.body.includes('กัมมะได้ดาว 3 อังคาร'),'career-specific');
assert(f.body.includes('ธนังได้ดาว 4 พุธ'),'finance-specific');
assert(l.body.includes('ปัตนิได้ดาว 6 ศุกร์'),'love-specific');
console.log('HORAJARN_INTELLIGENCE_V2_8_2_QUALITY_UNIT=PASS');
