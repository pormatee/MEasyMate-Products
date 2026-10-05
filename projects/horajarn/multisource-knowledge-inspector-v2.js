(function(){'use strict';

const K=globalThis.HorajarnMultiSourceKnowledgeV219;
const $=id=>document.getElementById(id);

function buildDemo(conflict=false){
  const R=K.createRegistry();

  R.add({
    id:'DEMO-A',
    topic:'DEMO_PLANET',
    concept:'PLANET_1',
    meaning:'ตัวอย่างความหมายจากแหล่ง A',
    sourceId:'DEMO-SOURCE-A',
    pageRef:'p.1',
    school:'DEMO',
    version:'1',
    verification:'DEMO_ONLY',
    status:'PROVISIONAL',
    claimKey:'DEMO_CLAIM',
    claimValue:'A'
  });

  R.add({
    id:'DEMO-B',
    topic:'DEMO_PLANET',
    concept:'PLANET_1',
    meaning:conflict
      ? 'ตัวอย่างความหมายจากแหล่ง B'
      : 'ตัวอย่างความหมายจากแหล่ง A',
    sourceId:'DEMO-SOURCE-B',
    pageRef:'p.2',
    school:'DEMO',
    version:'1',
    verification:'DEMO_ONLY',
    status:'PROVISIONAL',
    claimKey:'DEMO_CLAIM',
    claimValue:conflict?'B':'A'
  });

  return R.analyze('DEMO_PLANET','PLANET_1');
}

function render(){
  const base=K.validate();
  $('gate').textContent=base.ok?'FIELD CHECK PASS':'FIELD CHECK FAIL';
  $('gate').className=base.ok?'pass':'fail';

  $('status').textContent=
    `INGESTION_COMPLETE=${K.INGESTION_COMPLETE?'YES':'NO'} • `+
    `PRODUCTION_CUTOVER=${K.PRODUCTION_CUTOVER?'YES':'NO'}`;

  const conflict=$('mode').value==='conflict';
  const a=buildDemo(conflict);

  $('result').textContent=JSON.stringify(a,null,2);

  $('summary').textContent=
    `sources=${a.sourceCount} • conflicted=${a.conflicted} • `+
    `resolution=${a.resolution}`;
}

$('mode').addEventListener('change',render);
render();

})();
