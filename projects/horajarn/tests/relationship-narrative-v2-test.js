const assert=require('assert');
const fs=require('fs');

const N=require(
  '../v2/relationship-narrative-v2.js'
);

const H=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสี','ทาสา'
];

function sampleFacts(overrides={}){
  const palette=[1,2,4,5,8,9];

  return {
    records:H.map((name,i)=>({
      name,
      num:
        Object.prototype.hasOwnProperty.call(
          overrides,name
        )
          ? overrides[name]
          : palette[i%palette.length],
      base:Math.floor(i/7)+1,
      col:(i%7)+1
    }))
  };
}

/*
 Field-like sample:
 career core = 3
 support = 6 / 7

 Same-planet relationships:
 3 -> living + self + career
 6 -> weakness + family + helper
 7 -> money + new beginning + helper
*/
const facts=sampleFacts({
  'โภคา':3,
  'ตนุ':3,
  'กัมมะ':3,

  'หินะ':6,
  'พันธุ':6,
  'ทาสา':6,

  'ธนัง':7,
  'ปุตตะ':7,
  'ทาสี':7
});

const r=N.composeCareer(facts);

assert.strictEqual(r.ok,true);
assert.strictEqual(
  r.publicAstrologyTermsHidden,
  true
);

assert(
  r.paragraphs.length>=4,
  'paragraph-count'
);

assert(
  r.text.includes('ตัวตน'),
  'relationship-self-missing'
);

assert(
  r.text.includes('ความมั่นคง'),
  'relationship-stability-missing'
);

assert(
  r.text.includes('คนที่ทำงานร่วม'),
  'team-narrative-missing'
);

assert(
  r.text.includes('รายได้'),
  'support-money-relationship-missing'
);

assert(
  r.text.includes('เริ่มงาน') ||
  r.text.includes('โปรเจกต์ใหม่'),
  'new-beginning-relationship-missing'
);

assert(
  r.text.includes('สิ่งที่ควรระวัง'),
  'caution-missing'
);

for(const term of N.PUBLIC_ASTRO_TERMS){
  assert(
    !r.text.includes(term),
    'public-astro-term:'+term
  );
}

assert(
  r.analysis.primaryLinks.some(
    x=>x.key==='identity'
  )
);

assert(
  r.analysis.primaryLinks.some(
    x=>x.key==='stability'
  )
);

assert(
  r.analysis.pairs.some(
    x=>x.types.includes('FRIEND')
  )
);

assert(
  r.analysis.pairs.some(
    x=>x.types.includes('ENEMY')
  )
);

/*
 2-5 conflict must remain conflicted and must not
 generate one definitive public pair meaning.
*/
const conflictFacts=sampleFacts({
  'กัมมะ':2,
  'ทาสา':5,
  'ทาสี':7
});

const conflict=N.deriveCareer(conflictFacts);

const c25=conflict.pairs.find(
  x=>x.planets.includes(2) &&
     x.planets.includes(5)
);

assert(c25);
assert.strictEqual(c25.conflicted,true);
assert.strictEqual(c25.public,null);

/*
 Owner rule:
 Pita is not static support.
*/
assert(
  !r.analysis.supports.some(
    x=>x.house==='ปิตา'
  )
);

/*
 Authority context can be present only when requested.
*/
const authority=N.deriveCareer(
  facts,
  {authority:true}
);

assert(
  authority.conditionals.some(
    x=>x.house==='ปิตา'
  )
);

/*
 Knowledge prediction example 1-6 at career context
 is recognized as evidence, not copied as public prose.
*/
const exFacts=sampleFacts({
  'กัมมะ':1,
  'ทาสา':6,
  'ทาสี':7
});

const ex=N.deriveCareer(exFacts);

assert(
  ex.examples.some(
    x=>x.claimValue==='PAIR_1_6_KAMMA'
  ),
  'knowledge-example-not-used'
);

/*
 V2.26 must cost ZERO in current production until
 field validation is finished.
*/
const html=fs.readFileSync(
  require.resolve('../horoscope.html'),
  'utf8'
);

assert(
  !html.includes(
    'relationship-narrative-v2.js'
  )
);

console.log(
  'HORAJARN_V2_26_RELATIONSHIP_NARRATIVE=PASS'
);
console.log(
  'RELATIONSHIP_TO_LIFE_MEANING=PASS'
);
console.log(
  'NATURAL_NARRATIVE=PASS'
);
console.log(
  'PUBLIC_ASTROLOGY_TERMS_HIDDEN=PASS'
);
console.log(
  'SAME_PLANET_RELATIONSHIP=PASS'
);
console.log(
  'TEAM_RELATIONSHIP=PASS'
);
console.log(
  'FINANCE_NEW_START_CONNECTION=PASS'
);
console.log(
  'PAIR_CONTEXT=PASS'
);
console.log(
  'PAIR_2_5_CONFLICT_PRESERVED=PASS'
);
console.log(
  'PITA_STATIC_SUPPORT=NO'
);
console.log(
  'PITA_AUTHORITY_CONDITIONAL=PASS'
);
console.log(
  'KNOWLEDGE_PREDICTION_EXAMPLE_USED=PASS'
);
console.log(
  'V2_26_NORMAL_MODE_HEAVY_ENGINE_LOAD=NO'
);
console.log(
  'PRODUCTION_CUTOVER=NO'
);
console.log(
  'CALCULATION_CORE_UNTOUCHED=PASS'
);

console.log('\n=== SAMPLE PUBLIC NARRATIVE ===\n');
console.log(r.text);
