const assert=require('assert');
const F=require('../v2/full-natal-relationship-v2.js');

const H=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสา','ทาสี'
];

function facts(values){
  return {records:H.map((name,i)=>({
    name,
    num:values[i],
    base:Math.floor(i/7)+1,
    col:i%7
  }))};
}

const legacy=[
  {key:'identity',text:'BASE identity',note:'NOTE identity'},
  {key:'speech',text:'BASE speech',note:'NOTE speech'},
  {key:'mind',text:'BASE mind',note:'NOTE mind'},
  {key:'home',text:'BASE home',note:'NOTE home'},
  {key:'money',text:'BASE money',note:'NOTE money'},
  {key:'partner',text:'BASE partner',note:'NOTE partner'}
];

/*
  Identity anchors อัตตะ + ตนุ share the same column, therefore they
  resolve to the same Base-4 influence. Public prose must mention it once.
*/
const v1=[5,6,7,1,2,3,4, 6,4,5,6,8,1,2, 3,4,9,5,6,7,1];
const r1=F.composeAll(facts(v1),legacy);
assert.strictEqual(r1.ok,true);
const idBase4Meaning='ภาวะผู้นำ ความรับผิดชอบ และการได้รับการยอมรับ';
assert.strictEqual(
  r1.domains.identity.text.split(idBase4Meaning).length-1,
  1
);

/* Finance prose must be finance-specific, never personality wording. */
assert(!r1.domains.money.text.includes('การแสดงออกไม่จำเป็นต้องมีเพียงด้านเดียว'));
const moneyText=r1.domains.money.text;

assert(
  [
    'เงิน',
    'รายได้',
    'ทรัพย์',
    'ค่าใช้จ่าย',
    'เงินสะสม',
    'รักษาทรัพย์'
  ].some(x=>moneyText.includes(x))
);

/*
  Same-planet money link to ทาสา must be translated into human life meaning,
  not leak the raw provisional phrase "ความพ่ายแพ้".
*/
const v2=[5,6,7,1,2,3,4, 3,4,5,6,8,1,2, 3,4,9,5,6,7,1];
const r2=F.composeAll(facts(v2),legacy);
assert.strictEqual(r2.ok,true);
assert(!r2.domains.money.text.includes('ความพ่ายแพ้'));
assert(
  r2.domains.money.text.includes('งานบริการ') ||
  r2.domains.money.text.includes('รับผิดชอบแทนคนอื่น')
);

/* 6-7 enemy pair in finance gets a finance-specific interpretation. */
const v3=[5,2,7,1,3,4,8, 3,6,5,4,8,1,2, 3,4,9,5,8,1,2];
const r3=F.composeAll(facts(v3),legacy);
assert.strictEqual(r3.ok,true);
assert(r3.domains.money.text.includes('แยกงบใช้จ่ายออกจากเงินสะสม'));
assert(!r3.domains.money.text.includes('จุดเด่นของดาวที่เกี่ยวข้องอาจดึงกันคนละทาง'));

/* Humanized partner link must avoid raw house wording. */
const v4=[5,6,7,2,3,4,8, 3,6,5,4,8,1,2, 3,4,9,5,8,1,2];
const r4=F.composeAll(facts(v4),legacy);
assert.strictEqual(r4.ok,true);
assert(!r4.domains.partner.text.includes('ที่พึ่งภายนอก'));

for(const r of [r1,r2,r3,r4]){
  assert.strictEqual(r.transitUsed,false);
  assert.strictEqual(r.timingUsed,false);
  assert.strictEqual(r.productionCutover,false);
}

console.log('HORAJARN_V2_28_1_NARRATIVE_REFINEMENT=PASS');
console.log('BASE4_SEMANTIC_DEDUPE=PASS');
console.log('DOMAIN_SPECIFIC_BASE4=PASS');
console.log('HOUSE_LINK_HUMANIZED=PASS');
console.log('RAW_DASA_DEFEAT_PHRASE_HIDDEN=PASS');
console.log('FINANCE_PAIR_6_7_CONTEXTUAL=PASS');
console.log('PAIR_GENERIC_ENEMY_FALLBACK_REDUCED=PASS');
console.log('TRANSIT_USED=NO');
console.log('PRODUCTION_CUTOVER=NO');
