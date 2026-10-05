const assert=require('assert');
const fs=require('fs');

const K=require('../v2/multisource-knowledge-registry-v2.js');

assert(K.validate().ok);
assert.strictEqual(K.INGESTION_COMPLETE,false);
assert.strictEqual(K.PRODUCTION_CUTOVER,false);
assert.strictEqual(K.REGISTRY.all().length,0);

/* Synthetic records only — not astrology knowledge. */
const R=K.createRegistry();

R.add({
  id:'TEST-A',
  topic:'TEST_TOPIC',
  concept:'TEST_CONCEPT',
  meaning:'ตัวอย่างความหมาย A',
  sourceId:'TEST-SOURCE-A',
  pageRef:'p.1',
  school:'TEST',
  version:'1',
  verification:'TEST_ONLY',
  status:'PROVISIONAL',
  claimKey:'TEST_CLAIM',
  claimValue:'VALUE_A'
});

R.add({
  id:'TEST-B',
  topic:'TEST_TOPIC',
  concept:'TEST_CONCEPT',
  meaning:'ตัวอย่างความหมาย A',
  sourceId:'TEST-SOURCE-B',
  pageRef:'p.2',
  school:'TEST',
  version:'1',
  verification:'TEST_ONLY',
  status:'PROVISIONAL',
  claimKey:'TEST_CLAIM',
  claimValue:'VALUE_A'
});

let a=R.analyze('TEST_TOPIC','TEST_CONCEPT');

assert.strictEqual(a.recordCount,2);
assert.strictEqual(a.sourceCount,2);
assert.strictEqual(a.conflicted,false);
assert.strictEqual(a.autoMergeAllowed,false);

R.add({
  id:'TEST-C',
  topic:'TEST_TOPIC',
  concept:'TEST_CONCEPT',
  meaning:'ตัวอย่างความหมาย B',
  sourceId:'TEST-SOURCE-C',
  pageRef:'p.3',
  school:'TEST',
  version:'1',
  verification:'TEST_ONLY',
  status:'PROVISIONAL',
  claimKey:'TEST_CLAIM',
  claimValue:'VALUE_B'
});

a=R.analyze('TEST_TOPIC','TEST_CONCEPT');

assert.strictEqual(a.conflicted,true);
assert.strictEqual(a.resolution,'KEEP_SEPARATE_AND_REVIEW');
assert.strictEqual(a.records.length,3);

assert.throws(()=>R.add({
  id:'TEST-A',
  topic:'X',
  concept:'Y',
  meaning:'Z',
  sourceId:'S',
  pageRef:'p.1',
  school:'TEST',
  version:'1',
  verification:'TEST',
  status:'DRAFT'
}),/KNOWLEDGE_ID_ALREADY_EXISTS/);

const invalid=K.validateRecord({
  id:'BAD',
  topic:'X',
  concept:'Y',
  meaning:'Z',
  sourceId:'S',
  pageRef:'',
  school:'TEST',
  version:'1',
  verification:'TEST',
  status:'DRAFT'
});

assert.strictEqual(invalid.ok,false);
assert(invalid.errors.includes('pageRef:missing'));

const src=fs.readFileSync(
  require.resolve('../v2/multisource-knowledge-registry-v2.js'),
  'utf8'
);

assert(!src.includes('AstroCore.buildFacts('));

const production=fs.readFileSync(
  require.resolve('../horoscope.html'),
  'utf8'
);

assert(
  !production.includes('multisource-knowledge-registry-v2.js'),
  'V2.19 must not cut over production'
);

console.log('HORAJARN_V2_19_MULTISOURCE_REGISTRY=PASS');
console.log('REGISTRY_STARTS_EMPTY=PASS');
console.log('PROVENANCE_REQUIRED=PASS');
console.log('PAGE_REF_REQUIRED=PASS');
console.log('NO_OVERWRITE_POLICY=PASS');
console.log('MULTI_SOURCE_SUPPORT=PASS');
console.log('CONFLICT_GUARD=PASS');
console.log('AUTO_MERGE_KNOWLEDGE=FALSE');
console.log('INGESTION_COMPLETE=NO');
console.log('PRODUCTION_CUTOVER=NO');
console.log('CALCULATION_CORE_UNTOUCHED=PASS');
