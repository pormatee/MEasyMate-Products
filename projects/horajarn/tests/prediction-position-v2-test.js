'use strict';
const assert=require('assert');
require('../knowledge/knowledge-base.js');
require('../core/astrology-core.js');
require('../rules/rules-v1.js');
const P=require('../v2/prediction-position-v2.js');

const profile={name:'TEST',day:1,month:3,year:2516,hour:12,minute:0};
const target=new Date(2026,9,4,12,0,0);
assert.equal(P.ageYang(profile,target),54);
const facts=globalThis.AstroCore.buildFacts(profile,target);
const annual=P.annualPositionFromFacts(facts,54);
assert.deepEqual({position:annual.position,base:annual.base,col:annual.col,house:annual.house,planet:annual.planet,b4:annual.base4.value},{position:12,base:2,col:5,house:'ปุตตะ',planet:7,b4:14});
const t=P.annualTaksaFromBirthPlanet(5,54);
assert.equal(t.borivan,7);
assert.deepEqual(t.order,[7,5,8,6,1,2,3,4]);
assert.equal(t.roles['ศรี'],6);
assert.equal(t.roles['กาลกิณี'],4);

const career=P.build(profile,{id:'Q1',text:'จะได้งานใหม่ไหม',domain:'career',actor:'self_implicit',object:'job',outcome:'gain',question_type:'FORECAST'},target);
assert.equal(career.houseRule.selectorType,'EXISTING_RULE');
assert.equal(career.houseRule.primary[0],'กัมมะ');
assert.equal(career.predictionPolicy.predictiveEligible,true);
assert.equal(P.validate(career).ok,true);

const health=P.build(profile,{id:'Q2',text:'สุขภาพช่วงนี้ต้องระวังอะไร',domain:'health',actor:'self_implicit',object:'health',outcome:'risk',question_type:'CAUTION'},target);
assert.equal(health.houseRule.selectorType,'STRUCTURAL_META');
assert.equal(health.houseRule.predictiveEligible,false);
assert.equal(health.predictionPolicy.predictiveEligible,false);
assert(health.houseRule.support.includes('อริ'));

const mother=P.build(profile,{id:'Q3',text:'แม่ช่วงนี้สุขภาพเป็นยังไงบ้าง',domain:'health',actor:'family',object:'health',question_type:'OPEN'},target);
assert.equal(mother.subject.scope,'RELATION_CONTEXT_ONLY');
assert.equal(mother.predictionPolicy.externalPersonDirectPredictionBlocked,true);
assert.equal(mother.predictionPolicy.predictiveEligible,false);

const timing=P.build(profile,{id:'Q4',text:'เมื่อไหร่จะเปลี่ยนงาน',domain:'career',actor:'self_implicit',object:'job',outcome:'timing',question_type:'TIMING'},target);
assert.equal(timing.timing.asksTiming,true);
assert.equal(timing.timing.exactGregorianPredictionAllowed,false);
assert.equal(timing.mahaTaksa.status,'CONTEXT_ONLY_UNVERIFIED_TIMELINE_MAPPING');
assert.equal(timing.annualPosition.base4.predictiveEligible,false);

console.log('HORAJARN_V2_17_PREDICTION_POSITION_TEST=PASS');
console.log('AGE_YANG_54_POSITION=12');
console.log('ANNUAL_HOUSE=ปุตตะ');
console.log('ANNUAL_PLANET=7');
console.log('BASE4_COL5=14_NUMERIC_ONLY');
console.log('ANNUAL_BORIVAN=7');
console.log('ANNUAL_SRI=6');
console.log('ANNUAL_KALAKINI=4');
console.log('HOUSE_SELECTION_TRACE=PASS');
console.log('THIRD_PARTY_SCOPE_GUARD=PASS');
console.log('EXACT_TIMING_FALSE_PRECISION_GUARD=PASS');
