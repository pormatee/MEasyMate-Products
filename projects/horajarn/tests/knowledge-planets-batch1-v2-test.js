const assert=require('assert');
const fs=require('fs');

const S=require('../v2/knowledge-source-registry-v2.js');
const K=require('../v2/knowledge-planets-batch1-v2.js');

const v=K.validate();
assert(v.ok,v.errors.join(','));

assert.strictEqual(K.RECORDS.length,9);
assert.strictEqual(K.BATCH_COMPLETE,true);
assert.strictEqual(K.INGESTION_COMPLETE,false);
assert.strictEqual(K.PRODUCTION_CUTOVER,false);
assert.strictEqual(K.BOOK_PAGE_KNOWLEDGE_INGESTED,false);

for(let i=1;i<=9;i++){
  const x=K.RECORDS.find(r=>r.concept===`PLANET_${i}`);
  assert(x,`PLANET_${i}`);
  assert.strictEqual(x.status,'PROVISIONAL');
  assert(S.getSource(x.sourceId));
  assert.notStrictEqual(x.sourceId,'MAHASATTALEK-3-THANAKORN');
}

assert.strictEqual(
  K.RECORDS.filter(x=>x.sourceId==='MATHHORO-PLANETS-1-7-2009').length,
  7
);

assert.strictEqual(
  K.RECORDS.filter(x=>x.sourceId==='MATHHORO-PLANETS-8-9-2009').length,
  2
);

const book=S.getSource('MAHASATTALEK-3-THANAKORN');
assert(book);
assert.strictEqual(book.contentIngested,false);
assert.strictEqual(book.pageLevelVerified,false);

const src=fs.readFileSync(
  require.resolve('../v2/knowledge-planets-batch1-v2.js'),'utf8'
);
assert(!src.includes('AstroCore.buildFacts('));

const production=fs.readFileSync(
  require.resolve('../horoscope.html'),'utf8'
);
assert(!production.includes('knowledge-planets-batch1-v2.js'));

console.log('HORAJARN_V2_20_KNOWLEDGE_BATCH1=PASS');
console.log('PLANET_RECORDS=9');
console.log('PLANETS_1_9_COVERAGE=PASS');
console.log('SOURCE_REGISTRY=PASS');
console.log('PROVENANCE=PASS');
console.log('PARAPHRASE_POLICY=PASS');
console.log('PROVISIONAL_ONLY=PASS');
console.log('BOOK_PAGE_KNOWLEDGE_INGESTED=NO');
console.log('BATCH_COMPLETE=YES');
console.log('INGESTION_COMPLETE=NO');
console.log('PRODUCTION_CUTOVER=NO');
console.log('CALCULATION_CORE_UNTOUCHED=PASS');
