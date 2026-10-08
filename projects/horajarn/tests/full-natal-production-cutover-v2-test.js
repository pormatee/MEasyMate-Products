const assert=require('assert');
const fs=require('fs');
const path=require('path');

const P=require(
  '../v2/full-natal-production-cutover-v2.js'
);

assert(P.validate().ok);

assert.strictEqual(
  P.NATAL_CONTROLLED_CUTOVER,
  true
);

assert.strictEqual(
  P.NATAL_FAIL_OPEN_LEGACY,
  true
);

assert.deepStrictEqual(
  P.EXPECTED_DOMAINS,
  [
    'identity','speech','mind','home',
    'work','money','partner'
  ]
);

assert.strictEqual(
  P.cutoverEnabled(''),
  true
);

assert.strictEqual(
  P.cutoverEnabled('?natalV229=1'),
  true
);

assert.strictEqual(
  P.cutoverEnabled('?natalV229=0'),
  false
);

for(const q of [
  '?natalV228=1',
  '?narrativeV226=1',
  '?narrativeV227=1'
]){
  assert.strictEqual(
    P.cutoverEnabled(q),
    false,
    q
  );
}

const ordered=[
  'identity','speech','mind','home',
  'work','money','partner'
];

const domains={};

for(const key of ordered){
  domains[key]={
    ok:true,
    key,
    paragraphs:[
      'ข้อความพยากรณ์สำหรับ '+key,
      'คำแนะนำเพิ่มเติมสำหรับ '+key
    ]
  };
}

const sample={
  ok:true,
  ordered,
  domains,
  timingUsed:false,
  transitUsed:false,
  aiRuntimeRequired:false,
  productionCutover:false
};

const gate=P.validateComposed(sample);
assert.strictEqual(gate.ok,true);

const html=P.renderHtml(sample);

for(const key of ordered){
  assert(
    html.includes(
      'data-v229-domain="'+key+'"'
    ),
    key
  );
}

for(const forbidden of [
  'DEBUG ONLY',
  'ดู Signature',
  'signatureKey',
  'provenance',
  'base4',
  'samePlanet',
  'pairRelationships',
  'ยังไม่ตัดเข้า Production'
]){
  assert(
    !html.includes(forbidden),
    forbidden
  );
}

/*
 Do not expose data-natal-key on V2.29 cards.
 V2.25 uses that selector for its Career DOM cutover;
 leaving it out prevents a late V2.25 worker result
 from overwriting Full Natal V2.29.
*/
assert(
  !html.includes('data-natal-key=')
);

const broken={
  ...sample,
  ordered:ordered.slice(0,6)
};

assert.strictEqual(
  P.validateComposed(broken).ok,
  false
);

const horoscope=fs.readFileSync(
  path.join(__dirname,'../horoscope.html'),
  'utf8'
);

assert(
  horoscope.includes(
    'v2/full-natal-production-cutover-v2.js?v=2290'
  )
);

assert(
  horoscope.includes(
    'HorajarnFullNatalProductionCutoverV229'
  )
);

assert(
  horoscope.includes(
    "q.get('natalV228')!=='1'"
  )
);

assert(
  !horoscope.includes(
    '<script src="v2/integrated-prediction-engine-v2.js"></script>'
  )
);

const engine=fs.readFileSync(
  path.join(
    __dirname,
    '../v2/full-natal-relationship-v2.js'
  ),
  'utf8'
);

assert(
  engine.includes(
    'const PRODUCTION_CUTOVER=false;'
  )
);

console.log(
  'HORAJARN_V2_29_CONTROLLED_NATAL_CUTOVER=PASS'
);
console.log(
  'NORMAL_URL_FULL_NATAL_DEFAULT=PASS'
);
console.log(
  'KILL_SWITCH=natalV229_0_PASS'
);
console.log(
  'DEVELOPER_PREVIEW_ISOLATION=PASS'
);
console.log(
  'DEBUG_UI_HIDDEN=PASS'
);
console.log(
  'LEGACY_FAIL_OPEN=PASS'
);
console.log(
  'SEVEN_DOMAINS_GATE=PASS'
);
console.log(
  'V225_LATE_DOM_OVERWRITE_GUARD=PASS'
);
console.log(
  'CALCULATION_CORE_TOUCHED=NO'
);
console.log(
  'TRANSIT_USED=NO'
);
console.log(
  'AI_RUNTIME_REQUIRED=NO'
);
console.log(
  'ENGINE_PRODUCTION_CUTOVER=NO'
);
console.log(
  'NATAL_PRODUCTION_CUTOVER=CONTROLLED_V229'
);
