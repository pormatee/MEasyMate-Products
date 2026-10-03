global.window=global;
global.AstroKnowledge={getPlanet:n=>({name:{2:'จันทร์',3:'อังคาร',4:'พุธ',6:'ศุกร์',7:'เสาร์'}[n]||'ดาว'+n})};
global.HorajarnProfileAdapterV2={toCoreProfile:x=>x};
global.HorajarnIntelligenceV2={};
require('../v2/interpretation-quality-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
function audit(house,num,meaning,supportHouse,supportNum,supportMeaning,conclusion='PARTIAL_SUPPORT'){
 const e1={evidenceId:'E1',role:'PRIMARY',direction:'NEUTRAL',factRefs:['F1'],knowledge:{meaning},effectiveWeight:.7};
 const e2={evidenceId:'E2',role:'SUPPORT',direction:'NEUTRAL',factRefs:['F2'],knowledge:{meaning:supportMeaning},effectiveWeight:.4};
 const e3={evidenceId:'E3',role:'CONTEXT',direction:'SUPPORT',factRefs:['T1'],knowledge:{meaning:'แรงสนับสนุน'},timeScope:'CURRENT_MAIN',timelineVerification:'UNVERIFIED',effectiveWeight:.3};
 return{facts:[{factId:'F1',type:'house_number',house,value:num},{factId:'F2',type:'house_number',house:supportHouse,value:supportNum}],evidence:[e1,e2,e3],accuracy:{conclusion,confidenceBand:'MODERATE',uncertainty:'NORMAL',rankedEvidence:[e1,e2,e3]},interpretation:{summary:'legacy'}};
}
const c=HorajarnInterpretationQualityV2.compose('career',audit('กัมมะ',3,'งานช่าง วิศวกรรม เครื่องจักร และงานแก้ปัญหา','ปิตา',4,'งานบริหาร การตัดสินใจ และความรับผิดชอบ'));
const f=HorajarnInterpretationQualityV2.compose('finance',audit('ธนัง',7,'รายได้จากงานที่ต้องใช้ความอดทนและระบบ','กดุมภะ',4,'การค้า ข้อมูล และการเจรจา'));
const l=HorajarnInterpretationQualityV2.compose('love',audit('ปัตนิ',2,'ความสัมพันธ์ที่ให้ความสำคัญกับความรู้สึกและการดูแล','สหัชชะ',6,'การประสานความสัมพันธ์และรสนิยมร่วมกัน'));
for(const m of [c,f,l]){
 const v=HorajarnInterpretationQualityV2.validateModel(m);assert(v.ok,v.errors.join(','));
 assert(m.timing.includes('วันเปลี่ยนดาวแบบเจาะจงยังอยู่ระหว่างตรวจสอบ'),'timeline-caveat');
 assert(m.scoreIsPredictiveProbability===false,'probability');
 assert(HorajarnInterpretationQualityV2.spokenText(m).includes('คำแนะนำ'),'spoken-advice');
}
assert(c.body.includes('กัมมะมีดาวอังคาร (3)'),'career-format');
assert(f.body.includes('ธนังมีดาวเสาร์ (7)'),'finance-format');
assert(l.body.includes('ปัตนิมีดาวจันทร์ (2)'),'love-format');
assert(!c.body.includes('3 อังคาร'),'old-format-career');
assert(new Set([c.body,f.body,l.body]).size===3,'topic-distinct');
console.log('HORAJARN_INTELLIGENCE_V2_8_3_POLISH_UNIT=PASS');
