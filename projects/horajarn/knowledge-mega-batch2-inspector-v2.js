(function(){'use strict';

const K=globalThis.HorajarnKnowledgeMegaBatch2V221;
const $=id=>document.getElementById(id);

const v=K.validate();

$('gate').textContent=v.ok?'FIELD CHECK PASS':'FIELD CHECK FAIL';
$('gate').className=v.ok?'pass':'fail';

$('summary').textContent=
  `TOTAL=${K.RECORDS.length} • `+
  `HOUSES=${K.count('HOUSES')} • `+
  `PAIRS=${K.count('PLANET_RELATIONSHIPS')} • `+
  `HOUSE_REL=${K.count('HOUSE_RELATIONSHIPS')} • `+
  `METHOD=${K.count('PREDICTION_METHOD')} • `+
  `EXAMPLES=${K.count('PREDICTION_EXAMPLES')}`;

$('guard').textContent=
  `BOOK_PAGE_KNOWLEDGE_INGESTED=${K.BOOK_PAGE_KNOWLEDGE_INGESTED?'YES':'NO'} • `+
  `INGESTION_COMPLETE=${K.INGESTION_COMPLETE?'YES':'NO'} • `+
  `PRODUCTION_CUTOVER=${K.PRODUCTION_CUTOVER?'YES':'NO'}`;

const groups=[
  ['HOUSES','เรือน 21'],
  ['PLANET_RELATIONSHIPS','คู่ดาว'],
  ['HOUSE_RELATIONSHIPS','Relationship ระหว่างเรือน'],
  ['PREDICTION_METHOD','วิธีพยากรณ์'],
  ['PREDICTION_EXAMPLES','ตัวอย่างพยากรณ์']
];

$('content').innerHTML=groups.map(([topic,title])=>{
  const rows=K.RECORDS.filter(x=>x.topic===topic);
  return `<section class="card">
    <h2>${title} (${rows.length})</h2>
    ${rows.map(x=>`
      <p><b>${x.house||x.concept}</b><br>
      ${x.meaning}<br>
      <small>${x.status} • ${x.sourceId}</small></p>
    `).join('')}
  </section>`;
}).join('');

})();
