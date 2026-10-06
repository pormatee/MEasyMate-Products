const assert=require('assert');
const F=require('../v2/full-natal-relationship-v2.js');

const H=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสา','ทาสี'
];

function facts(values){
  return {
    records:H.map((name,i)=>({
      name,
      num:values[i],
      base:Math.floor(i/7)+1,
      col:i%7
    }))
  };
}

const legacy=[
  {
    key:'identity',
    text:'แกนในมีลักษณะ มีเหตุผล รักความรู้ หลักการ คุณธรรม และการถ่ายทอด ขณะที่ภาพที่คนอื่นพบเห็นมีด้าน กล้า เร็ว ตรง แข่งขันเก่ง ลงมือจริง จึงเป็นคนที่มีทั้งสองมิติและจะเด่นต่างกันตามสถานการณ์',
    note:'จุดที่ควรบริหาร: ยึดหลักมากไป ช้าเพราะคิดรอบคอบ หรือมั่นใจความรู้ตนเองเกินไป และ ใจร้อน ปะทะ เสี่ยงอุบัติเหตุหรือหักโหม'
  },
  {
    key:'speech',
    text:'พูดมีหลัก มีเหตุผล ชอบอธิบายเป็นระบบและให้คำแนะนำ เหมาะกับการสอน ที่ปรึกษา การประชุมสำคัญ และการสร้างความน่าเชื่อถือ',
    note:'ข้อควรระวังด้านคำพูด: ระวังเทศนามากไป ยึดหลักจนคู่สนทนารู้สึกถูกตัดสิน หรือพูดยาวเกินจำเป็น'
  },
  {
    key:'mind',
    text:'ใจกล้า แข่งขันสูง ตัดสินใจเร็ว แต่ร้อนขึ้นง่ายเมื่อมีแรงกดดัน',
    note:'เมื่อตึงเครียดควรระวังด้าน ใจร้อน ปะทะ เสี่ยงอุบัติเหตุหรือหักโหม'
  },
  {
    key:'home',
    text:'เหมาะกับที่อยู่ใกล้ตลาด ถนน แหล่งค้า สำนักงาน โรงเรียน หรือจุดเดินทางสะดวก',
    note:'ความหมายนี้ใช้ดู “ลักษณะสภาพแวดล้อมที่สอดคล้องกับดวง” ไม่ใช่ระบุที่อยู่จริง'
  },
  {
    key:'money',
    text:'ด้านการหาเงินเด่นจากดาวเสาร์: ทรัพย์จากความอดทน สะสมระยะยาว ที่ดินหรือสินทรัพย์จริง ส่วนการเก็บและสร้างฐานทรัพย์อยู่ใต้อิทธิพลดาวพุธ: เงินจากการค้า การเจรจา ข้อมูล การเชื่อมคนและหลายช่องทาง การเงินจึงดีเมื่อแยก “วิธีหารายได้” ออกจาก “วิธีรักษาทรัพย์” ให้ชัด',
    note:'ควรระวัง ช้า กดดัน เหนื่อยสะสม มองโลกหนักหรือรับภาระเกินส่วน และเรื่องการสะสมทรัพย์ควรระวัง คิดมาก เปลี่ยนเร็ว พูดเร็ว หรือข้อมูลคลาดเคลื่อน'
  },
  {
    key:'partner',
    text:'เรือนปัตนิได้ดาวจันทร์ จึงให้ภาพคู่ครองหรือหุ้นส่วนว่า คู่หรือหุ้นส่วนมักอ่อนโยน ใส่ใจครอบครัว และต้องการความมั่นคงทางอารมณ์ ในการทำงานร่วมกัน คนลักษณะ มารดา ผู้หญิง ผู้ดูแล คนอ่อนไหว มักมีบทบาทกับชีวิต และความสัมพันธ์จะเดินได้ดีเมื่อใช้จุดแข็งด้าน อ่อนโยน รับความรู้สึกเก่ง ปรับตัวและดูแลคน',
    note:'สิ่งที่ต้องบริหารร่วมกัน: อารมณ์แปรปรวน ลังเล หรือรับภาระความรู้สึกคนอื่นมากเกินไป'
  }
];

const vals=[
  5,6,7,1,2,3,4,
  3,4,5,6,8,1,2,
  1,4,9,5,3,7,6
];

const r=F.composeAll(facts(vals),legacy);
assert.strictEqual(r.ok,true);

const id=r.domains.identity.text;

assert(id.includes('โดยพื้นฐานคุณ'));
assert(id.includes('สัญชาตญาณ'));
assert(id.includes('ผู้คน เครือข่าย การติดต่อ และข้อมูล'));
assert(
  [
    'ผู้คน เครือข่าย การติดต่อ และข้อมูล',
    'ผลตอบแทน โอกาส และสิ่งที่คาดหวัง',
    'ค่าใช้จ่าย เรื่องเบื้องหลัง',
    'สถานการณ์ที่เปลี่ยนกะทันหัน'
  ].some(x=>id.includes(x))
);

for(const banned of [
  'แกนใน',
  'ลักษณะเดียวกันยังเชื่อมกับ',
  'จุดที่ควรบริหาร',
  'แรงประกอบด้าน',
  'เข้ามาปรับน้ำหนัก',
  'สิ่งศักดิ์สิทธิ์',
  'พลังเหนือสามัญ'
]){
  assert(!id.includes(banned),`identity banned: ${banned}`);
}

assert(
  id.includes('ความรอบคอบและการยึดหลักเป็นจุดแข็ง')
);

assert(
  id.includes('พลังและความกล้าช่วยให้คุณลงมือได้เร็ว')
);

const money=r.domains.money.text;

assert(!money.includes('ด้านการหาเงินเด่นจากดาว'));
assert(!money.includes('อยู่ใต้อิทธิพลดาว'));
assert(!money.includes('การแสดงออกไม่จำเป็นต้องมีเพียงด้านเดียว'));
assert(!money.includes('ความพ่ายแพ้'));

const partner=r.domains.partner.text;

assert(!partner.includes('เรือนปัตนิได้ดาว'));
assert(!partner.includes('สิ่งที่ต้องบริหารร่วมกัน'));
assert(partner.includes('ความสัมพันธ์จะเดินได้ดี'));

const publicText=r.ordered.map(k=>r.domains[k].text).join('\n');

for(const banned of [
  'จุดที่ควรบริหาร:',
  'ลักษณะเดียวกันยังเชื่อมกับ',
  'แรงประกอบด้าน'
]){
  assert(!publicText.includes(banned),`public banned: ${banned}`);
}

assert.strictEqual(r.transitUsed,false);
assert.strictEqual(r.timingUsed,false);
assert.strictEqual(r.aiRuntimeRequired,false);
assert.strictEqual(r.productionCutover,false);

const r2=F.composeAll(facts(vals),legacy);

assert.strictEqual(
  r.fullSignatureKey,
  r2.fullSignatureKey
);

assert.strictEqual(
  r.domains.identity.text,
  r2.domains.identity.text
);

console.log('HORAJARN_V2_28_2_NATURAL_LANGUAGE=PASS');
console.log('SYSTEM_LANGUAGE_REMOVED=PASS');
console.log('BALANCED_POSITIVE_GUIDANCE=PASS');
console.log('BASE4_PUBLIC_LANGUAGE_SAFE=PASS');
console.log('HOUSE_RELATIONSHIP_NATURALIZED=PASS');
console.log('FINANCE_ASTRO_JARGON_REDUCED=PASS');
console.log('PARTNER_ASTRO_JARGON_REDUCED=PASS');
console.log('DETERMINISTIC_NARRATIVE=PASS');
console.log('AI_RUNTIME_REQUIRED=NO');
console.log('TRANSIT_USED=NO');
console.log('PRODUCTION_CUTOVER=NO');
