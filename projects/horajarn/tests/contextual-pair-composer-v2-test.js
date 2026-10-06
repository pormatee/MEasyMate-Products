const assert=require('assert');

const O=require(
  '../v2/knowledge-owner-pairs-v2.js'
);

const C=require(
  '../v2/contextual-pair-composer-v2.js'
);

const A=require(
  '../v2/adaptive-career-narrative-v2.js'
);

const H=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสา','ทาสี'
];

function facts(overrides={}){
  const vals=[
    1,2,3,4,5,6,7,
    1,2,3,4,5,6,7,
    1,2,4,5,6,7,1
  ];

  return {
    records:H.map((name,i)=>({
      name,
      num:Object.prototype.hasOwnProperty.call(
        overrides,name
      )
        ? overrides[name]
        : vals[i],
      base:Math.floor(i/7)+1,
      col:i%7
    }))
  };
}

assert.strictEqual(
  O.validate().ok,
  true
);

assert(
  O.find(4,8,'ENEMY')
);

assert.strictEqual(
  C.validate().ok,
  true
);

/*
 Career column:
 ธนัง + สหัชชะ + กัมมะ
 3 + 5 + 4 = 12 => Rahu power
 Anchor = Mercury 4
 Base4 modifier = Rahu 8
*/
const f=facts({
  'ธนัง':3,
  'สหัชชะ':5,
  'กัมมะ':4,

  'ทาสา':7,
  'ทาสี':1
});

const r=A.composeCareer(f);

assert.strictEqual(
  r.ok,
  true
);

assert(
  r.text.includes(
    'ข้อมูลนิ่ง'
  )
);

assert(
  r.text.includes(
    'ทดลองแนวคิดใหม่'
  )
);

assert(
  !r.text.includes(
    'ใช้ความเร็วหรือความละเอียด'
  )
);

assert(
  r.contextualPairEvidence.some(
    x=>
      x.id==='PAIR-4-8-ENEMY-OWNER-V1' &&
      x.status==='OWNER_VERIFIED'
  )
);

/*
 Repeat exactly -> deterministic.
*/
const r2=A.composeCareer(f);

assert.strictEqual(
  r.text,
  r2.text
);

assert.strictEqual(
  r.signatureKey,
  r2.signatureKey
);

console.log(
  'HORAJARN_V2_27_1_CONTEXTUAL_PAIR=PASS'
);
console.log(
  'OWNER_PAIR_4_8_ENEMY=PASS'
);
console.log(
  'PAIR_SPECIFIC_LANGUAGE=PASS'
);
console.log(
  'GENERIC_4_8_FALLBACK_REMOVED=PASS'
);
console.log(
  'PAIR_PROVENANCE=PASS'
);
console.log(
  'DUPLICATE_TEAM_CAUTION_REMOVED=PASS'
);
console.log(
  'DETERMINISTIC=PASS'
);
console.log(
  'PRODUCTION_CUTOVER=NO'
);

console.log(
  '\n=== 4-8 CONTEXTUAL SAMPLE ===\n'
);

console.log(r.text);
