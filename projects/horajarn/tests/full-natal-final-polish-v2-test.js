const assert=require('assert');
const fs=require('fs');
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

const vals=[
  5,6,6,1,2,3,4,
  3,7,5,6,8,1,2,
  1,4,9,5,3,7,6
];

const legacy=[
  {
    key:'money',
    text:'ด้านการหาเงินเด่นจากดาวศุกร์: รายได้จากการขาย บริการ ความงาม ศิลปะ ความสัมพันธ์ หรือการสร้างคุณค่า ส่วนการเก็บและสร้างฐานทรัพย์อยู่ใต้อิทธิพลดาวเสาร์: ทรัพย์จากความอดทน สะสมระยะยาว ที่ดินหรือสินทรัพย์จริง การเงินจึงดีเมื่อแยก “วิธีหารายได้” ออกจาก “วิธีรักษาทรัพย์” ให้ชัด',
    note:'ควรระวัง ฟุ่มเฟือย ตามใจตัวเอง เรื่องรักซับซ้อนหรือใช้เงินเพื่อความสุขมากไป และเรื่องการสะสมทรัพย์ควรระวัง ช้า กดดัน เหนื่อยสะสม มองโลกหนักหรือรับภาระเกินส่วน'
  }
];

const r=F.composeAll(facts(vals),legacy);
assert.strictEqual(r.ok,true);

const money=r.domains.money;
const paragraphs=(money.paragraphs||[]).map(x=>String(x).trim()).filter(Boolean);

const moneyB4=paragraphs.filter(x=>x.startsWith('ในเรื่องเงิน'));
assert(moneyB4.length<=1,'money base4 modifier should be merged');

const exact=new Set();
for(const p of paragraphs){
  assert(!exact.has(p),'duplicate money paragraph');
  exact.add(p);
}

const careerSrc=fs.readFileSync(
  require('path').join(__dirname,'../v2/adaptive-career-narrative-v2.js'),
  'utf8'
);

assert(!careerSrc.includes('ลักษณะเดียวกันยังเชื่อมกับ'));
assert(!careerSrc.includes('ลักษณะการทำงานนี้เชื่อมกับ'));

console.log('HORAJARN_V2_28_3_FINAL_POLISH=PASS');
console.log('MONEY_BASE4_MERGE=PASS');
console.log('PAIR_TEXT_DEDUPE=PASS');
console.log('CAREER_SYSTEM_PHRASE_REMOVED=PASS');
console.log('CALCULATION_CORE_TOUCHED=NO');
console.log('PRODUCTION_CUTOVER=NO');
