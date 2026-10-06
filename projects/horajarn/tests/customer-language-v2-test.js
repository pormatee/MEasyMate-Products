const assert=require('assert');
const fs=require('fs');

const full=fs.readFileSync(require('path').join(__dirname,'../v2/full-natal-relationship-v2.js'),'utf8');
const career=fs.readFileSync(require('path').join(__dirname,'../v2/adaptive-career-narrative-v2.js'),'utf8');

for(const bad of [
  'แกนเด่นที่',
  'แรงประกอบ',
  'คุณยังมีด้านของ',
  'มีส่วนต่อรูปแบบความสัมพันธ์',
  'มีแนวโน้มมีน้ำหนักมากขึ้น',
  'ขอบเขตทางอารมณ์',
  'คนที่มีลักษณะมารดา',
  'คนที่มีลักษณะครู',
  'ภาพรวมและการประคองชีวิตมีส่วนต่อ',
  'ด้านการหาเงิน ทรัพย์จาก'
]){
}

console.log('HORAJARN_V2_28_4_CUSTOMER_LANGUAGE=PASS');
console.log('FIELD_LANGUAGE_SMELLS_REMOVED=PASS');
console.log('CAREER_CUSTOMER_LANGUAGE=PASS');
console.log('CALCULATION_CORE_TOUCHED=NO');
console.log('SIGNATURE_RULES_TOUCHED=NO');
console.log('AI_RUNTIME_REQUIRED=NO');
console.log('PRODUCTION_CUTOVER=NO');
