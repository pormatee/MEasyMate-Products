const assert=require('assert');

const K=require(
  '../v2/knowledge-base4-owner-v2.js'
);

const S=require(
  '../v2/career-signature-v2.js'
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
  const values=[
    1,2,5,4,5,6,7,
    3,2,7,4,5,6,7,
    1,2,3,4,5,6,7
  ];

  return {
    records:H.map((name,i)=>({
      name,
      num:Object.prototype.hasOwnProperty.call(
        overrides,name
      )
        ? overrides[name]
        : values[i],
      base:Math.floor(i/7)+1,
      col:i%7
    }))
  };
}

assert.strictEqual(
  K.validate().ok,
  true
);

for(let n=3;n<=21;n++)
  assert(K.resolve(n),'base4-'+n);

assert.strictEqual(
  K.resolve(15).planet,
  2
);

assert.strictEqual(
  K.resolve(6).planet,
  1
);

assert.strictEqual(
  K.resolve(20).code,
  'URANUS'
);

/*
 Career column = col 2:
 base1 ธนัง + base2 สหัชชะ + base3 กัมมะ

 5 + 7 + 3 = 15 => Moon power.
*/
const moonFacts=facts({
  'ธนัง':5,
  'สหัชชะ':7,
  'กัมมะ':3,

  'ตนุ':3,

  'ทาสา':6,
  'ทาสี':7
});

const moonSig=S.buildCareerSignature(
  moonFacts
);

assert.strictEqual(
  moonSig.ok,
  true
);

assert.strictEqual(
  moonSig.base4.value,
  15
);

assert.strictEqual(
  moonSig.base4.planet,
  2
);

assert(
  moonSig.samePlanet.some(
    x=>x.house==='ตนุ'
  )
);

const moon=A.composeCareer(
  moonFacts
);

assert.strictEqual(
  moon.ok,
  true
);

assert(
  moon.text.includes(
    'ความละเอียด'
  )
);

assert(
  moon.text.includes(
    'ผ่อนความแข็ง'
  )
);

assert(
  moon.text.includes(
    'ตัวตน'
  )
);

/*
 Same anchor, different base4:
 6 + 7 + 3 = 16 => Sola Mongkol.
*/
const wealthFacts=facts({
  'ธนัง':6,
  'สหัชชะ':7,
  'กัมมะ':3,

  'ตนุ':3,

  'ทาสา':6,
  'ทาสี':7
});

const wealthSig=S.buildCareerSignature(
  wealthFacts
);

assert.strictEqual(
  wealthSig.base4.value,
  16
);

assert.strictEqual(
  wealthSig.base4.code,
  'SOLA_MONGKOL'
);

const wealth=A.composeCareer(
  wealthFacts
);

assert(
  wealth.text.includes(
    'ทรัพย์สิน'
  )
);

assert.notStrictEqual(
  moon.signatureKey,
  wealth.signatureKey
);

assert.notStrictEqual(
  moon.text,
  wealth.text
);

/*
 Deterministic:
 same facts -> same signature and same narrative.
*/
const moon2=A.composeCareer(
  moonFacts
);

assert.strictEqual(
  moon.signatureKey,
  moon2.signatureKey
);

assert.strictEqual(
  moon.text,
  moon2.text
);

/*
 Base4 = 20:
 7 + 7 + 6.
*/
const uranusFacts=facts({
  'ธนัง':7,
  'สหัชชะ':7,
  'กัมมะ':6,

  'ทาสา':5,
  'ทาสี':4
});

const uranusSig=S.buildCareerSignature(
  uranusFacts
);

assert.strictEqual(
  uranusSig.base4.value,
  20
);

assert.strictEqual(
  uranusSig.base4.code,
  'URANUS'
);

const uranus=A.composeCareer(
  uranusFacts
);

assert(
  uranus.text.includes(
    'ความคิดใหม่'
  )
);

assert(
  uranus.text.includes(
    'ความกดดัน'
  )
);

/*
 Public text must not expose astrology jargon.
*/
for(const r of [moon,wealth,uranus]){
  assert.strictEqual(
    r.publicAstrologyTermsHidden,
    true
  );
}

console.log(
  'HORAJARN_V2_27_CAREER_SIGNATURE=PASS'
);
console.log(
  'BASE4_3_21_COMPLETE=PASS'
);
console.log(
  'BASE4_15_MOON=PASS'
);
console.log(
  'BASE4_SPECIAL_INFLUENCE=PASS'
);
console.log(
  'SAME_PLANET_MULTI_BASE=PASS'
);
console.log(
  'BASE4_RELATIONSHIP_BLEND=PASS'
);
console.log(
  'SIGNATURE_DIVERSITY=PASS'
);
console.log(
  'DETERMINISTIC_SAME_FACTS=PASS'
);
console.log(
  'PUBLIC_ASTROLOGY_TERMS_HIDDEN=PASS'
);
console.log(
  'AI_RUNTIME_REQUIRED=NO'
);
console.log(
  'PRODUCTION_CUTOVER=NO'
);

console.log(
  '\n=== SAMPLE 3 + BASE4 15 ===\n'
);
console.log(moon.text);

console.log(
  '\n=== SAMPLE 3 + BASE4 16 ===\n'
);
console.log(wealth.text);
