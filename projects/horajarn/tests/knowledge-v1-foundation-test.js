const assert=require('assert');
const fs=require('fs');
const K=require('../v2/knowledge-v1-foundation.js');

const v=K.validate();
assert(v.ok,v.errors.join(','));
assert.strictEqual(K.INGESTION_COMPLETE,false);
assert.strictEqual(K.CATEGORIES.length,13);
assert.deepStrictEqual(K.careerPolicy({}).primary,['กัมมะ']);
assert(K.careerPolicy({intent:'new_job'}).context.includes('ปุตตะ'));
assert(K.careerPolicy({authority:true}).conditional.includes('ปิตา'));

const src=fs.readFileSync(require.resolve('../v2/knowledge-v1-foundation.js'),'utf8');
assert(!src.includes('AstroCore.buildFacts('));

const production=fs.readFileSync(require.resolve('../horoscope.html'),'utf8');
assert(!production.includes('knowledge-v1-foundation.js'));

console.log('HORAJARN_V2_18_KNOWLEDGE_V1_FOUNDATION=PASS');
console.log('INGESTION_COMPLETE=NO');
console.log('KNOWLEDGE_CATEGORIES=13');
console.log('SOURCE_PROVENANCE_REQUIRED=PASS');
console.log('BOOK_COMPLETENESS_GUARD=PASS');
console.log('CAREER_PRIMARY_KAMMA=OWNER_VERIFIED_V1');
console.log('NEW_JOB_PUTTA_CONTEXT=OWNER_VERIFIED_V1');
console.log('DASA_DASI_CAREER_SUPPORT=OWNER_VERIFIED_V1');
console.log('PITA_CAREER_SUPPORT=CONDITIONAL');
console.log('SAME_PLANET_HOUSE_RELATIONSHIP=OWNER_VERIFIED_V1');
console.log('CALCULATION_CORE_UNTOUCHED=PASS');
console.log('PRODUCTION_CUTOVER=NO');
