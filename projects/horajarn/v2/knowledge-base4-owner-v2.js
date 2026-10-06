(function(root){'use strict';

const VERSION='2.27.0-base4-owner-knowledge';
const SOURCE_ID='USER-PRACTITIONER-RULES';
const STATUS='OWNER_VERIFIED';

function freeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
  return v;
}

const RECORDS=freeze([
  {
    value:3,
    kind:'PLANET_INFLUENCE',
    planet:3,
    name:'อังคาร',
    meaning:'ความกล้าหาญ การต่อสู้ พลังงาน และการกระตือรือร้น',
    workContribution:'เพิ่มแรงลงมือ ความกล้าตัดสินใจ และการแก้ปัญหา',
    sourceId:SOURCE_ID,status:STATUS
  },
  {
    value:4,
    kind:'PLANET_INFLUENCE',
    planet:4,
    name:'พุธ',
    meaning:'ปัญญา วาทศิลป์ การเจรจา และความคิดสร้างสรรค์',
    workContribution:'เพิ่มการคิด การสื่อสาร การเจรจา และการเชื่อมข้อมูล',
    sourceId:SOURCE_ID,status:STATUS
  },
  {
    value:5,
    kind:'PLANET_INFLUENCE',
    planet:5,
    name:'พฤหัส',
    meaning:'คุณธรรม สติปัญญา ความรู้ และความเป็นครู',
    workContribution:'เพิ่มเหตุผล ความรู้ การวางหลัก และการให้คำแนะนำ',
    sourceId:SOURCE_ID,status:STATUS
  },
  {
    value:6,
    kind:'PLANET_POWER',
    planet:1,
    name:'กำลังอาทิตย์',
    meaning:'อำนาจ เกียรติยศ ความเป็นผู้นำ และความรุ่งโรจน์',
    workContribution:'เพิ่มความรับผิดชอบ การนำ การตัดสินใจ และการเป็นที่ยอมรับ',
    sourceId:SOURCE_ID,status:STATUS
  },
  {
    value:7,
    kind:'PLANET_INFLUENCE',
    planet:7,
    name:'เสาร์',
    meaning:'ความอดทน ความพยายาม และความมั่นคงระยะยาว',
    workContribution:'เพิ่มความอดทน ความรอบคอบ ระบบ และการทำงานระยะยาว',
    sourceId:SOURCE_ID,status:STATUS
  },
  {
    value:8,
    kind:'PLANET_POWER',
    planet:3,
    name:'กำลังอังคาร',
    meaning:'ความกล้าหาญ การต่อสู้ พลังงาน และการกระตือรือร้น',
    workContribution:'เพิ่มพลังลงมือ ความเข้มข้น และการรับมือปัญหา',
    sourceId:SOURCE_ID,status:STATUS
  },
  {
    value:9,
    kind:'PLANET_INFLUENCE',
    planet:9,
    name:'เกตุ',
    meaning:'สิ่งศักดิ์สิทธิ์ สัญชาตญาณ และพลังเหนือสามัญ',
    workContribution:'เพิ่มสัญชาตญาณ มุมมองละเอียดอ่อน และแนวคิดที่ไม่ตามกรอบ',
    sourceId:SOURCE_ID,status:STATUS
  },
  {
    value:10,
    kind:'PLANET_POWER',
    planet:7,
    name:'กำลังเสาร์',
    meaning:'ความอดทน ความพยายาม และความมั่นคงระยะยาว',
    workContribution:'เพิ่มความรอบคอบ ความอดทน และการสร้างผลระยะยาว',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:11,
    kind:'SPECIAL_INFLUENCE',
    code:'RACHA_CHOK',
    name:'ราชาโชค',
    meaning:'เปิดโอกาสให้ชีวิต โชคลาภเข้ามาได้ง่ายขึ้น และมีผู้ใหญ่หรือคนคอยช่วยเหลือ',
    workContribution:'เพิ่มโอกาส ความช่วยเหลือ และแรงสนับสนุนจากคนรอบตัว',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:12,
    kind:'PLANET_POWER',
    planet:8,
    name:'กำลังราหู',
    meaning:'ความลึกลับ การเปลี่ยนแปลง และโชคลาภแบบพลิกผัน',
    workContribution:'เพิ่มความเปลี่ยนแปลง การพลิกสถานการณ์ และการมองทางเลือกที่ไม่ปกติ',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:13,
    kind:'SPECIAL_INFLUENCE',
    code:'MAHA_UT',
    name:'มหาอุด/มหาอุจ',
    meaning:'เพิ่มศักยภาพและความมั่นคง ยกระดับฐานะ และเพิ่มพลังความกล้าแข็ง',
    workContribution:'เพิ่มศักยภาพ ความมั่นคง และแรงผลักในการยกระดับตนเอง',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:14,
    kind:'SPECIAL_INFLUENCE',
    code:'EMPEROR',
    name:'จักรพรรดิ์',
    meaning:'สร้างอำนาจ บารมี ชื่อเสียง การยอมรับ และความสำเร็จระดับสูง',
    workContribution:'เพิ่มน้ำหนักด้านอำนาจ ความรับผิดชอบ ชื่อเสียง และการยอมรับ',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:15,
    kind:'PLANET_POWER',
    planet:2,
    name:'กำลังจันทร์',
    meaning:'จิตใจ อารมณ์ ความนุ่มนวล และเสน่ห์',
    workContribution:'เพิ่มความละเอียด ความนุ่มนวล การดูแล และการคำนึงถึงผู้คน',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:16,
    kind:'SPECIAL_INFLUENCE',
    code:'SOLA_MONGKOL',
    name:'โสฬสมงคล',
    meaning:'สร้างทรัพย์สินเงินทอง ความมั่งคั่ง และความสำเร็จรอบด้าน',
    workContribution:'เพิ่มแนวโน้มให้ผลงานเชื่อมไปสู่ทรัพย์สิน รายได้ และความสำเร็จที่จับต้องได้',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:17,
    kind:'PLANET_POWER',
    planet:4,
    name:'กำลังพุธ',
    meaning:'ปัญญา วาทศิลป์ การเจรจา และความคิดสร้างสรรค์',
    workContribution:'เพิ่มไหวพริบ การสื่อสาร การวางแผน และการเจรจา',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:18,
    kind:'SPECIAL_INFLUENCE',
    code:'MAHA_EMPEROR',
    name:'มหาจักรพรรดิ์',
    meaning:'รวมพลังและอำนาจเพื่อขับเคลื่อนภารกิจหรือเป้าหมายที่ใหญ่กว่า',
    workContribution:'เพิ่มน้ำหนักให้การรวมคน ทรัพยากร และความรับผิดชอบเพื่อเป้าหมายขนาดใหญ่',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:19,
    kind:'PLANET_POWER',
    planet:5,
    name:'กำลังพฤหัส',
    meaning:'คุณธรรม สติปัญญา ความรู้ และความเป็นครู',
    workContribution:'เพิ่มความรู้ เหตุผล หลักการ และบทบาทการให้คำแนะนำ',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:20,
    kind:'SPECIAL_INFLUENCE',
    code:'URANUS',
    name:'มฤตยู',
    meaning:'การเปลี่ยนแปลง สิ่งเหนือความคาดหมาย ความคิดแปลกใหม่ การประดิษฐ์คิดค้น และสัญชาตญาณ',
    workContribution:'เพิ่มความคิดใหม่ การเปลี่ยนแปลง การประดิษฐ์คิดค้น และการมองทางที่คนอื่นไม่คาดคิด',
    caution:'ระวังความกดดัน อารมณ์แกว่ง การคิดไกลเกินฐานจริง และการเปลี่ยนแปลงฉับพลัน',
    sourceId:SOURCE_ID,status:STATUS
  },

  {
    value:21,
    kind:'PLANET_POWER',
    planet:6,
    name:'กำลังศุกร์',
    meaning:'ความรัก ความสุข การเงิน และศิลปะความงาม',
    workContribution:'เพิ่มการประสานคน การสร้างคุณค่า ความสัมพันธ์ การเงิน และรสนิยม',
    sourceId:SOURCE_ID,status:STATUS
  }
]);

function resolve(value){
  return RECORDS.find(
    x=>x.value===Number(value)
  )||null;
}

function validate(){
  const errors=[];

  for(let n=3;n<=21;n++)
    if(!resolve(n))
      errors.push('missing-'+n);

  if(resolve(15).planet!==2)
    errors.push('moon-15');

  if(resolve(6).planet!==1)
    errors.push('sun-6');

  if(resolve(20).code!=='URANUS')
    errors.push('uranus-20');

  if(RECORDS.some(
    x=>x.sourceId!==SOURCE_ID ||
       x.status!==STATUS
  ))
    errors.push('provenance');

  return {
    ok:errors.length===0,
    errors
  };
}

const API=freeze({
  VERSION,
  SOURCE_ID,
  STATUS,
  RECORDS,
  resolve,
  validate
});

root.HorajarnBase4OwnerKnowledgeV227=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
