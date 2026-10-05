const assert=require('assert');
const fs=require('fs');

const E=require('../v2/integrated-prediction-engine-v2.js');

const HOUSE_NAMES=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสี','ทาสา'
];

function facts(overrides={}){
  return {
    records:HOUSE_NAMES.map((name,i)=>({
      name,
      num:Object.prototype.hasOwnProperty.call(overrides,name)
        ? overrides[name]
        : 100+i,
      base:Math.floor(i/7)+1,
      col:(i%7)+1
    }))
  };
}

assert(E.validate().ok);
assert.strictEqual(E.INDEX.recordCount,52);
assert.strictEqual(E.SHADOW_MODE,true);
assert.strictEqual(E.PRODUCTION_CUTOVER,false);

/* 1 — career general */
let r=E.integrate(
  facts({'กัมมะ':1,'ทาสา':5,'ทาสี':6}),
  {domain:'career'}
);

assert.deepStrictEqual(
  r.positions.map(x=>x.house),
  ['กัมมะ','ทาสา','ทาสี']
);
assert(!r.positions.some(x=>x.house==='ปิตา'));

/* 2 — new job */
r=E.integrate(
  facts({'กัมมะ':1,'ปุตตะ':4,'ทาสา':5,'ทาสี':6}),
  {domain:'career',intent:'new_job'}
);
assert(r.positions.some(x=>x.house==='ปุตตะ'));

/* 3 — new business */
r=E.integrate(
  facts({'กัมมะ':1,'ปุตตะ':4,'ทาสา':5,'ทาสี':6}),
  {domain:'career',intent:'new_business'}
);
assert(r.positions.some(x=>x.house==='ปุตตะ'));

/* 4 — authority context */
r=E.integrate(
  facts({'กัมมะ':1,'ปิตา':5,'ทาสา':4,'ทาสี':6}),
  {domain:'career',authority:true}
);
assert(r.positions.some(
  x=>x.house==='ปิตา'&&x.role==='CONDITIONAL'
));

/* 5 — finance remains legacy fallback */
r=E.integrate(
  facts({'ธนัง':6,'กดุมภะ':5,'ลาภะ':1}),
  {domain:'finance'}
);
assert.strictEqual(r.policy.mode,'LEGACY_FALLBACK');
assert(r.positions.some(x=>x.house==='กดุมพะ'));
assert(r.positions.find(x=>x.house==='กดุมพะ').aliasApplied);

/* 6 — love remains legacy fallback */
r=E.integrate(
  facts({'ปัตนิ':6,'สหัชชะ':4,'ปุตตะ':2}),
  {domain:'love'}
);
assert.strictEqual(r.policy.mode,'LEGACY_FALLBACK');
assert(r.positions.some(x=>x.house==='ปัตนิ'));

/* 7 — same planet relationship from actual facts */
r=E.integrate(
  facts({'กัมมะ':1,'ธนัง':1,'ทาสา':5,'ทาสี':6}),
  {domain:'career'}
);
assert(r.samePlanetHouseLinks.some(
  x=>x.planet===1 &&
     x.houses.includes('กัมมะ') &&
     x.houses.includes('ธนัง')
));

/* 8 — friend pair */
r=E.integrate(
  facts({'กัมมะ':1,'ทาสา':5,'ทาสี':9}),
  {domain:'career'}
);
assert(r.pairRelationships.some(
  x=>x.planets.includes(1) &&
     x.planets.includes(5) &&
     x.type==='FRIEND'
));

/* 9 — enemy pair */
r=E.integrate(
  facts({'กัมมะ':1,'ทาสา':3,'ทาสี':9}),
  {domain:'career'}
);
assert(r.pairRelationships.some(
  x=>x.planets.includes(1) &&
     x.planets.includes(3) &&
     x.type==='ENEMY'
));

/* 10 — third-party direct prediction guard */
r=E.integrate(
  facts({'กัมมะ':1}),
  {domain:'career',actor:'other'},
  {directPredictionAllowed:false}
);
assert.strictEqual(r.blocked,true);

/* 11 — exact timing guard */
r=E.integrate(
  facts({'กัมมะ':1,'ทาสา':5,'ทาสี':6}),
  {domain:'career',questionType:'TIMING'}
);
assert.strictEqual(
  r.timing.exactGregorianPredictionAllowed,
  false
);

/* shadow comparison verifies old Pita removal */
const s=E.shadowCompare(
  facts({'กัมมะ':1,'ปิตา':5,'ทาสา':4,'ทาสี':6}),
  {domain:'career'}
);
assert.strictEqual(s.changed,true);
assert(s.removed.some(x=>x.startsWith('ปิตา:')));

/* provenance */
assert(r.trace.knowledgeIds.length>0);
assert(r.trace.sourceRefs.length>0);

/* performance gate */
const perfFacts=facts({
  'กัมมะ':1,
  'ปุตตะ':4,
  'ทาสา':5,
  'ทาสี':6,
  'ธนัง':1
});

const loops=500;
const start=process.hrtime.bigint();

for(let i=0;i<loops;i++){
  E.integrate(
    perfFacts,
    {domain:'career',intent:'new_job'}
  );
}

const elapsedMs=
  Number(process.hrtime.bigint()-start)/1e6;

const avgMs=elapsedMs/loops;

assert(
  avgMs<E.PERFORMANCE_BUDGET_MS_PER_RUN,
  `performance ${avgMs.toFixed(4)}ms/run`
);

/* architecture guards */
const engineSrc=fs.readFileSync(
  require.resolve('../v2/integrated-prediction-engine-v2.js'),
  'utf8'
);

assert(!engineSrc.includes('AstroCore.buildFacts('));

const production=fs.readFileSync(
  require.resolve('../horoscope.html'),
  'utf8'
);

assert(
  !production.includes('integrated-prediction-engine-v2.js')
);

console.log('HORAJARN_V2_22_INTEGRATED_ENGINE_RC1=PASS');
console.log('KNOWLEDGE_INDEX_RECORDS=52');
console.log('CAREER_OWNER_OVERRIDE=PASS');
console.log('NEW_JOB_PUTTA_CONTEXT=PASS');
console.log('PITA_CONDITIONAL_ONLY=PASS');
console.log('FINANCE_LEGACY_FALLBACK=PASS');
console.log('LOVE_LEGACY_FALLBACK=PASS');
console.log('HOUSE_ALIAS_TRACE=PASS');
console.log('SAME_PLANET_FACT_RELATIONSHIP=PASS');
console.log('PLANET_PAIR_INTEGRATION=PASS');
console.log('PROVENANCE_TRACE=PASS');
console.log('THIRD_PARTY_GUARD=PASS');
console.log('EXACT_TIMING_GUARD=PASS');
console.log('SHADOW_MODE=YES');
console.log('PRODUCTION_CUTOVER=NO');
console.log('CALCULATION_CORE_UNTOUCHED=PASS');
console.log(
  'PERFORMANCE_AVG_MS='+avgMs.toFixed(4)
);
console.log('PERFORMANCE_GATE=PASS');
