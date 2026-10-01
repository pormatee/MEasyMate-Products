(function(root){'use strict';
const RULES={
 career:{id:'CAREER-V1.2',label:'การงาน',houses:['กัมมะ','ปิตา','ทาสา','ทาสี'],primary:['กัมมะ'],support:['ปิตา','ทาสา','ทาสี'],transitRoles:['เดช','ศรี','อุตสาหะ','มนตรี','กาลกิณี'],knowledgeField:'work',sourceRefs:['USER-PRACTITIONER-RULES','SEVEN-NUMBER-MAHAMODO'],priority:100},
 finance:{id:'FINANCE-V1.2',label:'การเงิน',houses:['ธนัง','กดุมภะ','ลาภะ','โภคา','พยายะ'],primary:['ธนัง','กดุมภะ'],support:['ลาภะ','โภคา','พยายะ'],transitRoles:['ศรี','มูละ','มนตรี','กาลกิณี'],knowledgeField:'money',sourceRefs:['USER-PRACTITIONER-RULES','SEVEN-NUMBER-MAHAMODO'],priority:100},
 love:{id:'LOVE-V1.2',label:'ความรักและหุ้นส่วน',houses:['ปัตนิ','สหัชชะ','ปุตตะ'],primary:['ปัตนิ'],support:['สหัชชะ','ปุตตะ'],transitRoles:['ศรี','มนตรี','บริวาร','กาลกิณี'],knowledgeField:'partner',sourceRefs:['USER-PRACTITIONER-RULES','SEVEN-NUMBER-MAHAMODO'],priority:100}
};
const TRANSIT_ROLE_MEANINGS={
 'บริวาร':{tone:'context',label:'คนรอบตัว',meaning:'คนรอบตัว ลูกน้อง ครอบครัวหรือผู้ที่เกี่ยวข้องโดยตรง'},
 'อายุ':{tone:'self',label:'ตัวเองและสุขภาพ',meaning:'กำลังชีวิต ความเป็นอยู่และสุขภาพตามคติ'},
 'เดช':{tone:'support',label:'อำนาจและการตัดสินใจ',meaning:'อำนาจ ความกล้า ตำแหน่ง การผลักดันและการตัดสินใจ'},
 'ศรี':{tone:'support',label:'สิ่งดีและโอกาส',meaning:'เสน่ห์ โอกาส ความราบรื่นและสิ่งที่ส่งเสริม'},
 'มูละ':{tone:'support',label:'รากฐานและทรัพย์',meaning:'ทรัพย์สิน รากฐาน เงินทุนหรือสิ่งที่สะสมไว้'},
 'อุตสาหะ':{tone:'effort',label:'ความเพียรและงานหนัก',meaning:'สิ่งที่ต้องลงแรง จัดการ และทำให้สำเร็จด้วยความพยายาม'},
 'มนตรี':{tone:'support',label:'ผู้ช่วยและการอุปถัมภ์',meaning:'ผู้ใหญ่ ที่ปรึกษา คนช่วยเหลือหรือช่องทางสนับสนุน'},
 'กาลกิณี':{tone:'caution',label:'เรื่องต้องระวัง',meaning:'อุปสรรค ความผิดพลาด ความเสียหายหรือสิ่งที่ควรหลีกเลี่ยง'}
};
const POSITION_RULES=root.AstroKnowledge?root.AstroKnowledge.POSITION_RULES:{};
function validate(){const errors=[];const houseSet=new Set(Object.keys((root.AstroKnowledge&&root.AstroKnowledge.HOUSES)||{}));for(const [key,r] of Object.entries(RULES)){for(const h of r.houses)if(!houseSet.has(h))errors.push(`${key}:unknown-house:${h}`);if(!r.primary.length)errors.push(`${key}:no-primary`);if(!r.sourceRefs||!r.sourceRefs.length)errors.push(`${key}:no-source`)}return{ok:errors.length===0,errors}}
const API={RULES,TRANSIT_ROLE_MEANINGS,POSITION_RULES,validate,version:'1.2.0'};root.AstroRules=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
