(function(root){'use strict';
const VERSION='2.8.3-final-polish';

const TOPICS=Object.freeze({
 career:{key:'work',label:'การงาน'},
 finance:{key:'money',label:'การเงิน'},
 love:{key:'partner',label:'ความรักและหุ้นส่วน'}
});

const CONCLUSION_TEXT=Object.freeze({
 SUPPORT:'จังหวะหนุนเด่น',
 PARTIAL_SUPPORT:'มีแรงสนับสนุนบางส่วน',
 CAUTION:'ควรเดินอย่างรอบคอบ',
 PARTIAL_CAUTION:'มีจุดที่ควรระวัง',
 MIXED:'มีทั้งแรงหนุนและแรงต้าน',
 CONTEXT_ONLY:'พื้นดวงชัดกว่าจังหวะเวลา',
 INSUFFICIENT:'ข้อมูลยังไม่พอสำหรับสรุป'
});

const CONFIDENCE_TEXT=Object.freeze({
 HIGH:'หลักฐานหลักครบและตรวจย้อนกลับได้ดี',
 MODERATE:'หลักฐานใช้ประกอบได้ แต่บางส่วนยังอยู่ระหว่างตรวจทาน',
 LOW:'หลักฐานยังจำกัด ควรอ่านเป็นแนวโน้ม',
 INSUFFICIENT:'ข้อมูลหลักฐานยังไม่พอ'
});

const UNCERTAINTY_TEXT=Object.freeze({
 NORMAL:'หลักฐานสำคัญไม่ได้ขัดกันในประเด็นหลัก',
 NON_DIRECTIONAL:'พื้นดวงให้ภาพลักษณะชัดกว่าเรื่องจังหวะเวลา',
 PARTIAL_COVERAGE:'หลักฐานแกนหลักยังครอบคลุมไม่ครบ จึงไม่ควรสรุปกว้างเกินข้อมูล',
 CONFLICTED:'พบทั้งหลักสนับสนุนและหลักเตือนในกลุ่มเดียวกัน จึงควรอ่านสองด้านร่วมกัน',
 INSUFFICIENT:'ข้อมูลยังไม่พอสำหรับการตีความที่ละเอียดขึ้น'
});

function deps(){
 if(!root.HorajarnIntelligenceV2||!root.HorajarnProfileAdapterV2||!root.AstroKnowledge)
   throw new Error('V2_8_3_QUALITY_DEPENDENCY_MISSING');
}
function txt(v){return String(v==null?'':v).replace(/\s+/g,' ').trim()}
function uniq(items){
 const seen=new Set(),out=[];
 for(const x of items||[]){const v=txt(x);if(v&&!seen.has(v)){seen.add(v);out.push(v)}}
 return out;
}
function factIndex(audit){
 const m=new Map();
 for(const f of (audit&&audit.facts)||[])if(f&&f.factId)m.set(f.factId,f);
 return m;
}
function evidenceIndex(audit){
 const m=new Map();
 for(const e of (audit&&audit.evidence)||[])if(e&&e.evidenceId)m.set(e.evidenceId,e);
 return m;
}
function planetName(n){
 try{const p=root.AstroKnowledge.getPlanet(Number(n));return p&&p.name?txt(p.name):''}catch{return''}
}
function planetLabel(n,name){
 const num=Number(n);
 if(name&&Number.isFinite(num))return `ดาว${name} (${num})`;
 if(name)return `ดาว${name}`;
 if(Number.isFinite(num))return `ดาวหมายเลข ${num}`;
 return'';
}
function enrichSignal(signal,audit){
 const facts=factIndex(audit),evs=evidenceIndex(audit);
 const e=evs.get(signal.evidenceId)||signal;
 const refs=uniq([signal.evidenceId,...(signal.mergedEvidenceRefs||[])]);
 let house='',number=null,planet='';
 for(const id of e.factRefs||[]){
   const f=facts.get(id);
   if(f&&f.type==='house_number'){
     house=txt(f.house);number=f.value;planet=planetName(f.value);break;
   }
 }
 return Object.freeze({
   evidenceId:signal.evidenceId,
   refs,
   role:signal.role||e.role||'',
   direction:signal.direction||e.direction||'NEUTRAL',
   timeScope:e.timeScope||'',
   meaning:txt(signal.meaning||(e.knowledge&&e.knowledge.meaning)),
   house,number,planet,
   planetLabel:planetLabel(number,planet),
   timelineVerification:e.timelineVerification||'',
   effectiveWeight:Number(signal.effectiveWeight||e.effectiveWeight||0)
 });
}
function rankedSignals(audit){
 const a=audit&&audit.accuracy;
 if(!a||!Array.isArray(a.rankedEvidence))return[];
 return a.rankedEvidence.map(x=>enrichSignal(x,audit));
}
function locationText(s){
 if(!s)return'';
 const p=s.planetLabel?`มี${s.planetLabel}`:'';
 if(s.house&&p)return `${s.house}${p}`;
 if(s.house)return s.house;
 if(p)return p;
 return'หลักพื้นดวง';
}
function foundationSentence(topic,s){
 if(!s||!s.meaning)return'';
 const where=locationText(s);
 if(topic==='career')return `${where}เป็นแกนสำคัญของการงาน ภาพหลักจึงเด่นกับ ${s.meaning}`;
 if(topic==='finance')return `${where}เป็นแกนสำคัญของกระแสการเงิน ภาพหลักจึงสะท้อน ${s.meaning}`;
 return `${where}เป็นแกนสำคัญของคู่ครองและหุ้นส่วน ภาพหลักจึงสะท้อน ${s.meaning}`;
}
function supportSentence(topic,s,primary){
 if(!s||!s.meaning)return'';
 const where=locationText(s);
 if(primary&&txt(primary.meaning)===txt(s.meaning)){
   if(topic==='career')return `${where}ย้ำแนวเดียวกับแกนงานหลัก จึงเพิ่มน้ำหนักให้ภาพการทำงานนี้`;
   if(topic==='finance')return `${where}ย้ำแนวเดียวกับแกนการเงินหลัก จึงเพิ่มน้ำหนักให้รูปแบบการเงินนี้`;
   return `${where}ย้ำแนวเดียวกับแกนความสัมพันธ์หลัก จึงเพิ่มน้ำหนักให้ภาพคู่หรือหุ้นส่วนนี้`;
 }
 if(topic==='career')return `${where}เป็นหลักประกอบ ทำให้ภาพการงานเพิ่มมิติด้าน ${s.meaning}`;
 if(topic==='finance')return `${where}เป็นหลักประกอบ ทำให้ภาพการเงินเพิ่มมิติด้าน ${s.meaning}`;
 return `${where}เป็นหลักประกอบ ทำให้ภาพความสัมพันธ์เพิ่มมิติด้าน ${s.meaning}`;
}
function timingSentence(audit,signals){
 const acc=audit&&audit.accuracy||{};
 const directional=signals.filter(s=>s.direction==='SUPPORT'||s.direction==='CAUTION');
 if(!directional.length)return'จังหวะเวลาที่มีอยู่ยังทำหน้าที่เป็นบริบท มากกว่าจะชี้ทิศทางชัดเจน';
 const hasSupport=directional.some(s=>s.direction==='SUPPORT');
 const hasCaution=directional.some(s=>s.direction==='CAUTION');
 let lead='จังหวะเวลาปัจจุบันยังเป็นบริบทประกอบ';
 if(acc.conclusion==='MIXED'||(hasSupport&&hasCaution))lead='จังหวะเวลาที่ตรวจมีทั้งแรงหนุนและแรงเตือน จึงควรพิจารณาสองด้านร่วมกัน';
 else if(hasCaution)lead='จังหวะเวลาที่ตรวจมีสัญญาณให้เพิ่มความรอบคอบก่อนตัดสินใจ';
 else if(hasSupport)lead='จังหวะเวลาที่ตรวจมีแรงสนับสนุนให้ใช้จุดแข็งของพื้นดวงต่อยอด';
 const timelineUnverified=directional.some(s=>s.timelineVerification==='UNVERIFIED');
 if(timelineUnverified)lead+=' ส่วนวันเปลี่ยนดาวแบบเจาะจงยังอยู่ระหว่างตรวจสอบ จึงไม่ใช้ข้อความนี้ฟันธงวัน';
 return lead;
}
function headline(topic,conclusion){
 const c=CONCLUSION_TEXT[conclusion]||CONCLUSION_TEXT.CONTEXT_ONLY;
 if(topic==='career')return `การงาน • ${c}`;
 if(topic==='finance')return `การเงิน • ${c}`;
 return `ความรักและหุ้นส่วน • ${c}`;
}
function publicAdvice(topic,conclusion){
 if(conclusion==='MIXED'||conclusion==='CAUTION'||conclusion==='PARTIAL_CAUTION'){
   if(topic==='career')return'ใช้ข้อมูลจริงของงาน เงื่อนไข และคนที่เกี่ยวข้องประกอบก่อนเร่งตัดสินใจ';
   if(topic==='finance')return'ตรวจสภาพคล่อง รายจ่าย และเงื่อนไขทางการเงินจริงก่อนรับความเสี่ยงใหม่';
   return'คุยความคาดหวังให้ชัด และดูการกระทำจริงก่อนสรุปแทนอีกฝ่าย';
 }
 if(conclusion==='SUPPORT'||conclusion==='PARTIAL_SUPPORT'){
   if(topic==='career')return'ใช้จุดแข็งเดิมให้เต็มที่ แต่ยังตรวจข้อมูลสำคัญก่อนขยับงาน';
   if(topic==='finance')return'ต่อยอดช่องทางที่เข้ากับพื้นดวง และแยกการหารายได้ออกจากการรักษาฐานทรัพย์ให้ชัด';
   return'ใช้จังหวะที่ดีเพื่อสื่อสารและสร้างความร่วมมือ โดยไม่เร่งความสัมพันธ์เกินข้อมูลจริง';
 }
 return'ใช้คำพยากรณ์เป็นข้อมูลประกอบ และให้น้ำหนักกับข้อเท็จจริงในชีวิตจริงเป็นหลัก';
}
function compose(service,audit){
 deps();
 const cfg=TOPICS[service];if(!cfg)throw new Error('V2_8_3_TOPIC_UNKNOWN:'+service);
 if(!audit||!audit.accuracy||!audit.interpretation)throw new Error('V2_8_3_AUDIT_INVALID:'+service);
 const signals=rankedSignals(audit);
 const natal=signals.filter(s=>s.role==='PRIMARY'||s.role==='SUPPORT');
 const primary=natal.find(s=>s.role==='PRIMARY'&&s.meaning)||natal.find(s=>s.meaning)||null;
 const secondary=natal.find(s=>s.meaning&&(!primary||s.evidenceId!==primary.evidenceId))||null;
 const parts=uniq([foundationSentence(service,primary),supportSentence(service,secondary,primary)]);
 const body=parts.join(' ');
 const conclusion=audit.accuracy.conclusion||'CONTEXT_ONLY';
 const confidenceBand=audit.accuracy.confidenceBand||'INSUFFICIENT';
 const uncertainty=audit.accuracy.uncertainty||'INSUFFICIENT';
 const timing=timingSentence(audit,signals);
 const refs=uniq([
   ...(primary?primary.refs:[]),
   ...(secondary?secondary.refs:[]),
   ...signals.filter(s=>s.direction==='SUPPORT'||s.direction==='CAUTION').slice(0,2).flatMap(s=>s.refs)
 ]);
 return Object.freeze({
   version:VERSION,
   service,key:cfg.key,label:cfg.label,
   headline:headline(service,conclusion),
   basis:primary?Object.freeze({house:primary.house,number:primary.number,planet:primary.planet,label:primary.planetLabel}):null,
   body:body||txt(audit.interpretation.summary)||'ข้อมูลยังไม่พอสำหรับสรุป',
   timing,
   advice:publicAdvice(service,conclusion),
   conclusion,
   conclusionText:CONCLUSION_TEXT[conclusion]||CONCLUSION_TEXT.CONTEXT_ONLY,
   confidenceBand,
   confidenceText:CONFIDENCE_TEXT[confidenceBand]||CONFIDENCE_TEXT.INSUFFICIENT,
   uncertaintyCode:uncertainty,
   uncertaintyText:UNCERTAINTY_TEXT[uncertainty]||UNCERTAINTY_TEXT.INSUFFICIENT,
   evidenceCount:(audit.evidence||[]).length,
   traceRefs:refs,
   scoreIsPredictiveProbability:false
 });
}
function build(profile,target=new Date()){
 deps();
 const p=root.HorajarnProfileAdapterV2.toCoreProfile(profile),out={};
 for(const [service,cfg] of Object.entries(TOPICS)){
   const audit=root.HorajarnIntelligenceV2.audit(service,p,target);
   out[cfg.key]=compose(service,audit);
 }
 return Object.freeze(out);
}
function spokenText(m){
 if(!m)return'';
 return uniq([
   m.headline,
   m.body,
   m.timing,
   m.uncertaintyCode!=='NORMAL'?'ข้อจำกัด '+m.uncertaintyText:'',
   'คำแนะนำ '+m.advice
 ]).join('. ');
}
function validateModel(m){
 const errors=[];
 if(!m||!m.headline)errors.push('headline');
 if(!m||!m.body)errors.push('body');
 if(!m||!m.timing)errors.push('timing');
 if(!m||!Array.isArray(m.traceRefs)||!m.traceRefs.length)errors.push('traceRefs');
 if(m&&m.scoreIsPredictiveProbability!==false)errors.push('probability-guard');
 for(const bad of ['สอดคล้องกันในระดับที่ระบบกำหนด','คะแนนนี้สะท้อนคุณภาพหลักฐาน','ไม่ใช่ probability','ได้ดาว 3 อังคาร','ได้ดาว 7 เสาร์']){
   if(JSON.stringify(m||{}).includes(bad))errors.push('public-language:'+bad);
 }
 return{ok:errors.length===0,errors};
}
const API={VERSION,TOPICS,CONCLUSION_TEXT,CONFIDENCE_TEXT,UNCERTAINTY_TEXT,planetLabel,compose,build,spokenText,validateModel,version:VERSION};
root.HorajarnInterpretationQualityV2=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
