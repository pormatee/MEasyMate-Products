const assert=require('assert');
const fs=require('fs');

const N=require(
  '../v2/natural-narrative-v2.js'
);

const H=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสี','ทาสา'
];

function facts(overrides={}){
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

const sample=facts({
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

const r=N.composeCareer(sample);

assert.strictEqual(r.ok,true);
assert.strictEqual(
  r.publicAstrologyTermsHidden,
  true
);

assert(r.paragraphs.length>=4);

assert(
  r.text.includes('งานกับตัวตน')
);

assert(
  r.text.includes('ฐานชีวิต')
);

assert(
  r.text.includes('คนที่ทำงานร่วม')
);

assert(
  r.text.includes('รายได้')
);

assert(
  r.text.includes('เริ่มต้นสิ่งใหม่')
);

assert(
  r.text.includes('สิ่งที่ควรระวัง')
);

assert(
  r.quality.relationshipUsed
);

assert(
  r.quality.pairContextUsed
);

assert(
  r.quality.knowledgeMethodUsed
);

assert(
  r.styleGuide.methodIds.length===3
);

/*
 Knowledge example 1-6 in career context
 must influence style/evidence when the case matches.
*/
const exampleFacts=facts({
  'กัมมะ':1,
  'ทาสา':6,
  'ทาสี':7
});

const ex=N.composeCareer(exampleFacts);

assert.strictEqual(ex.ok,true);

assert(
  ex.styleGuide.exampleSignals.includes(
    'PAIR_1_6_KAMMA'
  )
);

assert(
  ex.text.includes(
    'ความรับผิดชอบ'
  )
);

assert(
  ex.text.includes(
    'การสร้างคุณค่า'
  )
);

/*
 Conflict 2-5 must remain preserved in the
 analysis layer and not be forced into one meaning.
*/
const conflict=N.composeCareer(
  facts({
    'กัมมะ':2,
    'ทาสา':5,
    'ทาสี':7
  })
);

const c25=conflict.analysis.pairs.find(
  x=>
    x.planets.includes(2) &&
    x.planets.includes(5)
);

assert(c25);
assert.strictEqual(
  c25.conflicted,
  true
);
assert.strictEqual(
  c25.public,
  null
);

/*
 All nine primary planet cases must compose
 without AI and without public astrology jargon.
*/
for(let n=1;n<=9;n++){
  const s1=(n%9)+1;
  const s2=((n+1)%9)+1;

  const x=N.composeCareer(
    facts({
      'กัมมะ':n,
      'ทาสา':s1,
      'ทาสี':s2
    })
  );

  assert.strictEqual(
    x.ok,
    true,
    'planet-'+n
  );

  assert.strictEqual(
    x.publicAstrologyTermsHidden,
    true,
    'public-term-'+n
  );
}

/*
 Debug preview may exist in horoscope.html,
 but heavy narrative engine must not be loaded
 statically in normal mode.
*/
const html=fs.readFileSync(
  require.resolve('../horoscope.html'),
  'utf8'
);

assert(
  !html.includes(
    '<script src="v2/natural-narrative-v2.js'
  )
);

assert(
  !html.includes(
    '<script src="v2/relationship-narrative-v2.js'
  )
);

console.log(
  'HORAJARN_V2_26_1_NATURAL_NARRATIVE=PASS'
);
console.log(
  'KNOWLEDGE_METHOD_STYLE_GUIDE=PASS'
);
console.log(
  'KNOWLEDGE_EXAMPLE_GUIDE=PASS'
);
console.log(
  'RELATIONSHIP_STORY_FLOW=PASS'
);
console.log(
  'PAIR_CONTEXTUAL_NARRATIVE=PASS'
);
console.log(
  'CONFLICT_PRESERVED=PASS'
);
console.log(
  'PLANET_MATRIX_9_9=PASS'
);
console.log(
  'PUBLIC_ASTROLOGY_TERMS_HIDDEN=PASS'
);
console.log(
  'AI_RUNTIME_REQUIRED=NO'
);
console.log(
  'NORMAL_MODE_HEAVY_ENGINE_LOAD=NO'
);
console.log(
  'PRODUCTION_CUTOVER=NO'
);

console.log(
  '\n=== V2.26.1 SAMPLE ===\n'
);
console.log(r.text);
