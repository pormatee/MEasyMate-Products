(function(root){'use strict';
const VERSION='2.4.0-calendar-crosscheck';
const VECTORS=Object.freeze([
 Object.freeze({id:'CAL-PYTHAIDATE-2000-01-01',date:[2000,1,1],expected:Object.freeze({phase:'แรม',phaseDay:9,month:1,jd:2451545}),sourceRefs:['THAI-LUNAR-PYTHAIDATE'],status:'TECHNICAL_REFERENCE'}),
 Object.freeze({id:'CAL-MYHORA-2021-04-01',date:[2021,4,1],expected:Object.freeze({phase:'แรม',phaseDay:4,month:5}),sourceRefs:['MYHORA-THAI-CALENDAR-2021'],status:'REFERENCE_REVIEWED'}),
 Object.freeze({id:'CAL-CONSENSUS-2022-04-01',date:[2022,4,1],expected:Object.freeze({phase:'แรม',phaseDay:15,month:4}),sourceRefs:['MYHORA-THAI-CALENDAR-2022','THAIRATH-WANPHRA-2022'],status:'CROSS_CHECKED'}),
 Object.freeze({id:'CAL-MYHORA-2023-06-03',date:[2023,6,3],expected:Object.freeze({phase:'ขึ้น',phaseDay:15,month:7}),sourceRefs:['MYHORA-THAI-CALENDAR-2023'],status:'REFERENCE_REVIEWED'}),
 Object.freeze({id:'CAL-MYHORA-2023-08-01-ATHIKAMAT',date:[2023,8,1],expected:Object.freeze({phase:'ขึ้น',phaseDay:15,month:88,monthRaw:88}),sourceRefs:['MYHORA-THAI-CALENDAR-2023'],status:'REFERENCE_REVIEWED'}),
 Object.freeze({id:'CAL-MYHORA-2024-02-24',date:[2024,2,24],expected:Object.freeze({phase:'ขึ้น',phaseDay:15,month:3}),sourceRefs:['MYHORA-THAI-CALENDAR-2024'],status:'REFERENCE_REVIEWED'}),
 Object.freeze({id:'CAL-MYHORA-2024-05-22',date:[2024,5,22],expected:Object.freeze({phase:'ขึ้น',phaseDay:15,month:6}),sourceRefs:['MYHORA-THAI-CALENDAR-2024'],status:'REFERENCE_REVIEWED'}),
 Object.freeze({id:'CAL-MYHORA-2024-07-20',date:[2024,7,20],expected:Object.freeze({phase:'ขึ้น',phaseDay:15,month:8}),sourceRefs:['MYHORA-THAI-CALENDAR-2024'],status:'REFERENCE_REVIEWED'})
]);
const QUARANTINED=Object.freeze([
 Object.freeze({id:'CAL-CONFLICT-TEENEE-2022-04-01',date:[2022,4,1],sourceRef:'TEENEE-100Y-CALENDAR',observed:Object.freeze({phase:'ขึ้น',phaseDay:1,month:5}),consensusVector:'CAL-CONSENSUS-2022-04-01',status:'QUARANTINED_CONFLICT',useAsGolden:false})
]);
function deps(){if(!root.AstroCore||typeof root.AstroCore.thaiLunar!=='function')throw new Error('V2_CALENDAR_DEPENDENCY_MISSING')}
function mismatch(actual,expected){const out=[];for(const [k,v] of Object.entries(expected))if(actual[k]!==v)out.push({field:k,expected:v,actual:actual[k]});return out}
function run(){deps();const results=VECTORS.map(v=>{const a=root.AstroCore.thaiLunar(...v.date),m=mismatch(a,v.expected);return{id:v.id,date:v.date,pass:m.length===0,mismatches:m,sourceRefs:v.sourceRefs,status:v.status}});return{version:VERSION,pass:results.every(x=>x.pass),passed:results.filter(x=>x.pass).length,total:results.length,results,quarantined:QUARANTINED}}
function validate(){const errors=[];for(const q of QUARANTINED){if(q.useAsGolden!==false)errors.push(q.id+':quarantine-bypass');if(VECTORS.some(v=>(v.sourceRefs||[]).includes(q.sourceRef)))errors.push(q.id+':quarantined-source-in-golden')}if(VECTORS.length<8)errors.push('golden-vector-coverage');if(!VECTORS.some(v=>v.expected.month===88))errors.push('athikamat-vector-missing');return{ok:errors.length===0,errors}}
const API={VERSION,VECTORS,QUARANTINED,mismatch,run,validate,version:VERSION};root.HorajarnReferenceCalendarV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
