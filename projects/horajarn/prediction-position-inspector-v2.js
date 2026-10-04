(function(){
'use strict';
const CASES={
 career:{label:'งานใหม่',semantic:{id:'Q1',text:'จะได้งานใหม่ไหม',domain:'career',actor:'self_implicit',object:'job',outcome:'gain',question_type:'FORECAST'}},
 finance:{label:'การเงิน',semantic:{id:'Q2',text:'ช่วงนี้การเงินเป็นอย่างไร',domain:'finance',actor:'self_implicit',object:'money',outcome:'result',question_type:'FORECAST',time:{scope:'CURRENT',expression:'ช่วงนี้'}}},
 love:{label:'ความรัก/หุ้นส่วน',semantic:{id:'Q3',text:'ความรักช่วงนี้เป็นอย่างไร',domain:'love',actor:'self_implicit',object:'partner',outcome:'result',question_type:'FORECAST'}},
 health:{label:'สุขภาพตนเอง',semantic:{id:'Q4',text:'สุขภาพช่วงนี้ต้องระวังอะไร',domain:'health',actor:'self_implicit',object:'health',outcome:'risk',question_type:'CAUTION'}},
 mother:{label:'สุขภาพแม่',semantic:{id:'Q5',text:'แม่ช่วงนี้สุขภาพเป็นอย่างไรบ้าง',domain:'health',actor:'family',object:'health',outcome:'information',question_type:'OPEN'}},
 timing:{label:'เมื่อไหร่จะเปลี่ยนงาน',semantic:{id:'Q6',text:'เมื่อไหร่จะเปลี่ยนงาน',domain:'career',actor:'self_implicit',object:'job',outcome:'timing',question_type:'TIMING'}}
};
let selected='career';
const $=id=>document.getElementById(id);
document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.case;document.querySelectorAll('[data-case]').forEach(x=>x.style.outline='');b.style.outline='2px solid #111'}));
function profile(){
 return {name:'FIELD',day:+$('day').value,month:+$('month').value,year:+$('year').value,hour:+$('hour').value,minute:+$('minute').value};
}
function target(){
 const be=+$('targetYear').value;
 return new Date(be-543,9,4,12,0,0);
}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function run(){
 try{
   if(!globalThis.HorajarnPredictionPositionV2) throw new Error('PREDICTION_POSITION_ENGINE_NOT_LOADED');
   const c=CASES[selected], result=globalThis.HorajarnPredictionPositionV2.build(profile(),c.semantic,target());
   const v=globalThis.HorajarnPredictionPositionV2.validate(result);
   const expectedExample=(+$('day').value===1 && +$('month').value===3 && +$('year').value===2516 && +$('targetYear').value===2569);
   const checks=[
     ['ENGINE_VALIDATE',v.ok],
     ['POSITION_RANGE',result.annualPosition.position>=1&&result.annualPosition.position<=21],
     ['TAKSA_8_ROLES',Object.keys(result.annualTaksa.roles||{}).length===8],
     ['BASE4_NUMERIC_ONLY',result.annualPosition.base4.predictiveEligible===false],
     ['EXACT_TIMING_GUARD',result.timing.exactGregorianPredictionAllowed===false]
   ];
   if(selected==='mother') checks.push(['THIRD_PARTY_GUARD',result.predictionPolicy.externalPersonDirectPredictionBlocked===true]);
   if(expectedExample) checks.push(['EXAMPLE_AGE_YANG',result.annualPosition.ageYang===54],['EXAMPLE_POSITION',result.annualPosition.position===12],['EXAMPLE_HOUSE',result.annualPosition.house==='ปุตตะ'],['EXAMPLE_PLANET',result.annualPosition.planet===7],['EXAMPLE_BASE4',result.annualPosition.base4.value===14],['EXAMPLE_SRI',result.annualTaksa.roles['ศรี']===6],['EXAMPLE_KALAKINI',result.annualTaksa.roles['กาลกิณี']===4]);
   const pass=checks.every(x=>x[1]);
   $('status').innerHTML=`<span class="badge ${pass?'good':'fail'}">${pass?'FIELD CHECK PASS':'FIELD CHECK FAIL'}</span><span class="badge">${esc(c.label)}</span>`;
   const houses=(result.housePositions||[]).map(x=>`${x.role}: ${x.house} → ดาว ${x.planet}`).join('<br>')||'ไม่มี predictive house rule';
   $('summary').innerHTML=
     `<p><b>เรือนหลัก/รอง</b><br>${houses}</p>`+
     `<p><b>อายุย่าง</b> ${result.annualPosition.ageYang} • <b>ตำแหน่ง</b> ${result.annualPosition.position} • <b>เรือนปี</b> ${esc(result.annualPosition.house)} • <b>ดาว</b> ${result.annualPosition.planet}</p>`+
     `<p><b>Base4</b> ${result.annualPosition.base4.value} (numeric only) • <b>ศรีจร</b> ${result.annualTaksa.roles['ศรี']} • <b>กาลกิณีจร</b> ${result.annualTaksa.roles['กาลกิณี']}</p>`+
     `<p><b>Predictive eligible</b> ${result.predictionPolicy.predictiveEligible?'YES':'NO'} • <b>Scope</b> ${result.subject.scope}</p>`+
     `<p>${checks.map(x=>`<span class="badge ${x[1]?'good':'fail'}">${x[0]}=${x[1]?'PASS':'FAIL'}</span>`).join(' ')}</p>`;
   $('raw').textContent=JSON.stringify(result,null,2);
 }catch(e){
   $('status').innerHTML='<span class="badge fail">ERROR</span>';
   $('summary').innerHTML='<p>'+esc(e&&e.message||e)+'</p>';
   $('raw').textContent='{}';
 }
}
$('run').addEventListener('click',run);
document.querySelector('[data-case="career"]').style.outline='2px solid #111';
})();
