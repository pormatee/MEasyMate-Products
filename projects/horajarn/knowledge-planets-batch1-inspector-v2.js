(function(){'use strict';

const K=globalThis.HorajarnPlanetKnowledgeBatch1V220;
const S=globalThis.HorajarnKnowledgeSourcesV220;
const $=id=>document.getElementById(id);

const v=K.validate();

$('gate').textContent=v.ok?'FIELD CHECK PASS':'FIELD CHECK FAIL';
$('gate').className=v.ok?'pass':'fail';

$('status').textContent=
  `PLANETS=${K.RECORDS.length} • `+
  `BATCH_COMPLETE=${K.BATCH_COMPLETE?'YES':'NO'} • `+
  `INGESTION_COMPLETE=${K.INGESTION_COMPLETE?'YES':'NO'} • `+
  `PRODUCTION_CUTOVER=${K.PRODUCTION_CUTOVER?'YES':'NO'}`;

$('book').textContent=
  `PRIMARY: ${S.getSource('MAHASATTALEK-3-THANAKORN').title} • `+
  `BOOK_PAGE_KNOWLEDGE_INGESTED=${K.BOOK_PAGE_KNOWLEDGE_INGESTED?'YES':'NO'}`;

$('list').innerHTML=K.RECORDS.map(x=>{
  const s=S.getSource(x.sourceId);
  return `<article class="card">
    <h2>${x.concept} • ${x.planet}</h2>
    <p>${x.meaning}</p>
    <small>${x.status} • ${x.verification}<br>
    SOURCE=${s.title}<br>
    REF=${x.pageRef}</small>
  </article>`;
}).join('');

})();
