const assert=require('assert');
const fs=require('fs');

const K=require('../v2/knowledge-mega-batch2-v2.js');
const S=require('../v2/knowledge-source-registry-v2.1.js');

const v=K.validate();
assert(v.ok,v.errors.join(','));

assert.strictEqual(K.RECORDS.length,43);
assert.strictEqual(K.count('HOUSES'),21);
assert.strictEqual(K.count('PLANET_RELATIONSHIPS'),16);
assert.strictEqual(K.count('HOUSE_RELATIONSHIPS'),1);
assert.strictEqual(K.count('PREDICTION_METHOD'),3);
assert.strictEqual(K.count('PREDICTION_EXAMPLES'),2);

assert.strictEqual(K.MEGA_BATCH_COMPLETE,true);
assert.strictEqual(K.INGESTION_COMPLETE,false);
assert.strictEqual(K.PRODUCTION_CUTOVER,false);
assert.strictEqual(K.BOOK_PAGE_KNOWLEDGE_INGESTED,false);

for(const x of K.RECORDS){
  assert(S.getSource(x.sourceId),x.id);
}

const owner=K.RECORDS.find(
  x=>x.concept==='SAME_PLANET_MULTI_HOUSE'
);
assert(owner);
assert.strictEqual(owner.status,'OWNER_VERIFIED');
assert.strictEqual(
  owner.claimValue,
  'DERIVE_FROM_ACTUAL_CHART_FACTS'
);

const pairTypes=['FRIEND','ENEMY','ELEMENT','EQUAL_POWER'];
for(const t of pairTypes){
  assert.strictEqual(
    K.RECORDS.filter(
      x=>x.topic==='PLANET_RELATIONSHIPS' &&
         x.relationshipType===t
    ).length,
    4
  );
}

const src=fs.readFileSync(
  require.resolve('../v2/knowledge-mega-batch2-v2.js'),
  'utf8'
);
assert(!src.includes('AstroCore.buildFacts('));

const production=fs.readFileSync(
  require.resolve('../horoscope.html'),
  'utf8'
);

assert(!production.includes('knowledge-mega-batch2-v2.js'));

console.log('HORAJARN_V2_21_MEGA_BATCH2=PASS');
console.log('TOTAL_RECORDS=43');
console.log('HOUSES=21_PASS');
console.log('PLANET_RELATIONSHIPS=16_PASS');
console.log('HOUSE_RELATIONSHIPS=1_OWNER_VERIFIED_PASS');
console.log('PREDICTION_METHOD=3_PASS');
console.log('PREDICTION_EXAMPLES=2_PASS');
console.log('PROVENANCE=PASS');
console.log('CONFLICT_SAFE_REGISTRY=PASS');
console.log('BOOK_PAGE_KNOWLEDGE_INGESTED=NO');
console.log('INGESTION_COMPLETE=NO');
console.log('PRODUCTION_CUTOVER=NO');
console.log('CALCULATION_CORE_UNTOUCHED=PASS');
