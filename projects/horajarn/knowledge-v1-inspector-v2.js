(function(){'use strict';

const K=globalThis.HorajarnKnowledgeV1FoundationV218;
const $=id=>document.getElementById(id);

function policy(){
  const mode=$('mode').value;
  const p=
    mode==='new_job' ? K.careerPolicy({intent:'new_job'}) :
    mode==='authority' ? K.careerPolicy({authority:true}) :
    K.careerPolicy({});
  $('policy').textContent=JSON.stringify(p,null,2);
}

function render(){
  const v=K.validate();

  $('gate').textContent=v.ok?'FIELD CHECK PASS':'FIELD CHECK FAIL';
  $('gate').className=v.ok?'pass':'fail';

  $('source').textContent=
    `${K.PRIMARY_SOURCE.title} — ${K.PRIMARY_SOURCE.author}`;

  $('status').textContent=
    `INGESTION_COMPLETE=${K.INGESTION_COMPLETE?'YES':'NO'}`;

  $('categories').innerHTML=K.CATEGORIES.map(x=>
    `<li><b>${x.id}</b> — ${x.status} — ${x.verification}</li>`
  ).join('');

  $('rules').innerHTML=Object.entries(K.OWNER_RULES).map(([id,x])=>
    `<li><b>${id}</b> — ${x.verification}</li>`
  ).join('');

  policy();
}

$('mode').addEventListener('change',policy);
render();
})();
