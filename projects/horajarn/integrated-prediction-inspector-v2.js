(function(){'use strict';

const E=globalThis.HorajarnIntegratedPredictionV222;
const $=id=>document.getElementById(id);

const H=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสี','ทาสา'
];

function facts(o={}){
  return {
    records:H.map((name,i)=>({
      name,
      num:Object.prototype.hasOwnProperty.call(o,name)
        ? o[name]
        : 100+i,
      base:Math.floor(i/7)+1,
      col:i%7+1
    }))
  };
}

const scenarios=[
  ['งานทั่วไป',
    facts({กัมมะ:1,ทาสา:5,ทาสี:6}),
    {domain:'career'}],

  ['งานใหม่',
    facts({กัมมะ:1,ปุตตะ:4,ทาสา:5,ทาสี:6}),
    {domain:'career',intent:'new_job'}],

  ['กิจการใหม่',
    facts({กัมมะ:1,ปุตตะ:4,ทาสา:5,ทาสี:6}),
    {domain:'career',intent:'new_business'}],

  ['หัวหน้า/ผู้ใหญ่',
    facts({กัมมะ:1,ปิตา:5,ทาสา:4,ทาสี:6}),
    {domain:'career',authority:true}],

  ['การเงิน legacy fallback',
    facts({ธนัง:6,กดุมภะ:5,ลาภะ:1}),
    {domain:'finance'}],

  ['ความรัก legacy fallback',
    facts({ปัตนิ:6,สหัชชะ:4,ปุตตะ:2}),
    {domain:'love'}],

  ['Same Planet งาน↔เงิน',
    facts({กัมมะ:1,ธนัง:1,ทาสา:5,ทาสี:6}),
    {domain:'career'}],

  ['คู่มิตร 1-5',
    facts({กัมมะ:1,ทาสา:5,ทาสี:9}),
    {domain:'career'}],

  ['คู่ศัตรู 1-3',
    facts({กัมมะ:1,ทาสา:3,ทาสี:9}),
    {domain:'career'}],

  ['Exact timing guard',
    facts({กัมมะ:1,ทาสา:5,ทาสี:6}),
    {domain:'career',questionType:'TIMING'}]
];

const v=E.validate();

$('gate').textContent=
  v.ok?'FIELD CHECK PASS':'FIELD CHECK FAIL';
$('gate').className=v.ok?'pass':'fail';

$('status').textContent=
  `INDEX=${E.INDEX.recordCount} • `+
  `SHADOW_MODE=${E.SHADOW_MODE?'YES':'NO'} • `+
  `PRODUCTION_CUTOVER=${E.PRODUCTION_CUTOVER?'YES':'NO'}`;

let passed=0;

const html=scenarios.map(([name,f,s])=>{
  try{
    const r=E.integrate(f,s);

    const ok=
      !r.blocked &&
      r.productionCutover===false &&
      r.timing.exactGregorianPredictionAllowed===false;

    if(ok) passed++;

    return `<article class="card">
      <h2>${ok?'✅':'❌'} ${name}</h2>
      <p><b>${r.policy.mode}</b></p>
      <pre>${r.summary||'(no summary)'}</pre>
      <small>
      PAIRS=${r.pairRelationships.length} •
      LINKS=${r.samePlanetHouseLinks.length} •
      SOURCES=${r.trace.sourceRefs.join(', ')}
      </small>
    </article>`;
  }catch(e){
    return `<article class="card fail">
      <h2>❌ ${name}</h2>
      <p>${e.message}</p>
    </article>`;
  }
}).join('');

$('scenarios').innerHTML=html;

$('scenarioGate').textContent=
  `SCENARIO_GATE=${passed===scenarios.length?'PASS':'FAIL'} `+
  `(${passed}/${scenarios.length})`;

const pf=facts({
  กัมมะ:1,
  ปุตตะ:4,
  ทาสา:5,
  ทาสี:6,
  ธนัง:1
});

const loops=500;
const t0=performance.now();

for(let i=0;i<loops;i++){
  E.integrate(
    pf,
    {domain:'career',intent:'new_job'}
  );
}

const avg=(performance.now()-t0)/loops;

$('performance').textContent=
  `PERFORMANCE_AVG=${avg.toFixed(4)} ms/run • `+
  `BUDGET=<${E.PERFORMANCE_BUDGET_MS_PER_RUN} ms • `+
  `GATE=${avg<E.PERFORMANCE_BUDGET_MS_PER_RUN?'PASS':'FAIL'}`;

})();
