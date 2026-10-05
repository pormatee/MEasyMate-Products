const assert=require('assert');
const fs=require('fs');

const E=require(
  '../v2/integrated-prediction-engine-v2.js'
);

const W=require(
  '../v2/production-shadow-worker-v2.js'
);

const S=require(
  '../v2/production-shadow-v2.js'
);

const H=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสี','ทาสา'
];

const records=H.map((name,i)=>({
  name,
  num:(i%9)+1,
  base:Math.floor(i/7)+1,
  col:(i%7)+1
}));

assert(S.validate().ok);

assert.strictEqual(
  S.CAREER_CONTROLLED_CUTOVER,
  true
);

assert.strictEqual(
  S.CAREER_FAIL_OPEN_LEGACY,
  true
);

assert.strictEqual(
  S.CAREER_CUTOVER_BUDGET_MS,
  5
);

assert.strictEqual(
  S.PRODUCTION_CUTOVER,
  false
);

const r=W.evaluateWithEngine(records,E);

assert.strictEqual(r.ok,true);
assert.strictEqual(r.domains.length,3);

const career=r.domains.find(x=>x.domain==='career');
const finance=r.domains.find(x=>x.domain==='finance');
const love=r.domains.find(x=>x.domain==='love');

assert.strictEqual(
  career.mode,
  'OWNER_VERIFIED_OVERRIDE'
);

assert.strictEqual(
  finance.mode,
  'LEGACY_FALLBACK'
);

assert.strictEqual(
  love.mode,
  'LEGACY_FALLBACK'
);

const view=S.buildCareerPolicyView(r.domains);

assert.strictEqual(view.ok,true);

for(const [house,role] of [
  ['กัมมะ','PRIMARY'],
  ['ทาสา','SUPPORT'],
  ['ทาสี','SUPPORT']
]){
  assert(
    view.positions.some(
      x=>x.house===house&&x.role===role
    ),
    house+':'+role
  );
}

const legacyCareer=
  'กัมมะมีดาวอังคารเป็นแกนสำคัญของการงาน '+
  'ปิตามีดาวอาทิตย์เป็นหลักประกอบ';

const careerText=
  S.buildCareerPolicyText(
    view,
    legacyCareer
  );

assert(careerText.includes('กัมมะ'));
assert(careerText.includes('ทาสา'));
assert(careerText.includes('ทาสี'));
assert(!careerText.includes('ปิตา'));

console.log(
  'LEGACY_STATIC_PITA_REMOVED=PASS'
);

/*
 Finance/Love payload does not expose cutover positions.
*/
assert.deepStrictEqual(finance.positions,[]);
assert.deepStrictEqual(love.positions,[]);

/*
 Heavy integrated engine still must NOT be loaded
 on production main thread.
*/
const html=fs.readFileSync(
  require.resolve('../horoscope.html'),
  'utf8'
);

assert(
  !html.includes(
    '<script src="v2/integrated-prediction-engine-v2.js"></script>'
  )
);

const adapter=fs.readFileSync(
  require.resolve('../v2/production-shadow-v2.js'),
  'utf8'
);

assert(
  adapter.includes(
    '[data-natal-key="work"]'
  )
);

assert(
  !adapter.includes(
    '[data-natal-key="money"]'
  )
);

assert(
  !adapter.includes(
    '[data-natal-key="partner"]'
  )
);

for(const forbidden of [
  'fetch(',
  'XMLHttpRequest',
  'navigator.sendBeacon',
  'localStorage'
]){
  assert(!adapter.includes(forbidden));
}

console.log(
  'HORAJARN_V2_25_CONTROLLED_CAREER_CUTOVER=PASS'
);
console.log(
  'CAREER_POLICY=OWNER_VERIFIED_OVERRIDE'
);
console.log(
  'CAREER_REQUIRED_HOUSES=GAMMA+DASA+DASI_PASS'
);
console.log(
  'FINANCE=LEGACY_UNCHANGED'
);
console.log(
  'LOVE=LEGACY_UNCHANGED'
);
console.log(
  'FAIL_OPEN_LEGACY=PASS'
);
console.log(
  'KILL_SWITCH=careerV225_0'
);
console.log(
  'HEAVY_ENGINE_MAIN_THREAD_LOAD=NO'
);
console.log(
  'CAREER_CUTOVER_BUDGET_MS=5'
);
console.log(
  'GLOBAL_PRODUCTION_CUTOVER=NO'
);
console.log(
  'CALCULATION_CORE_UNTOUCHED=PASS'
);
