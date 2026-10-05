const assert=require('assert');
const fs=require('fs');

const V=require('../v2/shadow-validation-v2.js');

const gate=V.validate();

assert(
  gate.ok,
  gate.errors.join(',')
);

const r=gate.report;

assert.strictEqual(r.total,14);
assert.strictEqual(r.passed,14);
assert.strictEqual(r.failed,0);

assert.strictEqual(
  r.readiness.career,
  'READY_FOR_CONTROLLED_CUTOVER'
);

assert.strictEqual(
  r.readiness.finance,
  'HOLD_SHADOW_LEGACY_POLICY'
);

assert.strictEqual(
  r.readiness.love,
  'HOLD_SHADOW_LEGACY_POLICY'
);

assert.deepStrictEqual(
  r.readiness.eligibleDomains,
  ['career']
);

assert.strictEqual(
  r.readiness.globalProductionCutoverReady,
  false
);

assert.strictEqual(
  r.safety.productionCutover,
  false
);

assert.strictEqual(
  r.safety.calculationCoreMutation,
  false
);

assert.strictEqual(
  r.safety.provisionalKnowledgeAutoPromoted,
  false
);

assert.strictEqual(
  r.safety.conflictAutoMerged,
  false
);

/*
 V2.24 must have ZERO production runtime cost.
 The production horoscope must not load this module.
*/
const html=fs.readFileSync(
  require.resolve('../horoscope.html'),
  'utf8'
);

assert(
  !html.includes('shadow-validation-v2.js')
);

console.log(
  'HORAJARN_V2_24_SHADOW_VALIDATION=PASS'
);
console.log('SCENARIOS=14/14_PASS');
console.log(
  'CAREER=READY_FOR_CONTROLLED_CUTOVER'
);
console.log(
  'FINANCE=HOLD_SHADOW_LEGACY_POLICY'
);
console.log(
  'LOVE=HOLD_SHADOW_LEGACY_POLICY'
);
console.log(
  'PAIR_2_5_CONFLICT_PRESERVED=PASS'
);
console.log('PROVENANCE_GATE=PASS');
console.log('THIRD_PARTY_GUARD=PASS');
console.log('EXACT_TIMING_GUARD=PASS');
console.log(
  'V2_24_PRODUCTION_RUNTIME_COST=ZERO'
);
console.log('PRODUCTION_CUTOVER=NO');
console.log(
  'CALCULATION_CORE_UNTOUCHED=PASS'
);
