(function(root){'use strict';

const M=typeof require!=='undefined'
  ? require('./multisource-knowledge-registry-v2.js')
  : root.HorajarnMultiSourceKnowledgeV219;

const S=typeof require!=='undefined'
  ? require('./knowledge-source-registry-v2.js')
  : root.HorajarnKnowledgeSourcesV220;

const INGESTION_COMPLETE=false;
const BATCH_COMPLETE=true;
const PRODUCTION_CUTOVER=false;
const BOOK_PAGE_KNOWLEDGE_INGESTED=false;

function deepFreeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(deepFreeze);
  }
  return v;
}

const RECORDS=deepFreeze([
  {
    id:'PLANET-1-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_1',
    planet:'อาทิตย์',
    meaning:'อำนาจ ยศศักดิ์ ความโดดเด่น และภาวะร้อนแรง',
    sourceId:'MATHHORO-PLANETS-1-7-2009',
    pageRef:'WEB_ARTICLE_2009-06-24',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'AUTHORITY_STATUS_HEAT'
  },
  {
    id:'PLANET-2-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_2',
    planet:'จันทร์',
    meaning:'ความอ่อนโยน ความละเอียดอ่อน และงานบริการ',
    sourceId:'MATHHORO-PLANETS-1-7-2009',
    pageRef:'WEB_ARTICLE_2009-06-24',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'GENTLENESS_SERVICE'
  },
  {
    id:'PLANET-3-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_3',
    planet:'อังคาร',
    meaning:'ความกล้า ความขยัน ความแข็งแรง และความวู่วาม',
    sourceId:'MATHHORO-PLANETS-1-7-2009',
    pageRef:'WEB_ARTICLE_2009-06-24',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'COURAGE_ENERGY_IMPULSE'
  },
  {
    id:'PLANET-4-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_4',
    planet:'พุธ',
    meaning:'การปรับตัว การสื่อสาร ข่าวสาร และไหวพริบ',
    sourceId:'MATHHORO-PLANETS-1-7-2009',
    pageRef:'WEB_ARTICLE_2009-06-24',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'ADAPT_COMMUNICATION_INTELLECT'
  },
  {
    id:'PLANET-5-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_5',
    planet:'พฤหัสบดี',
    meaning:'คุณธรรม ความรู้ วิชาการ ผู้ใหญ่ ที่พึ่ง และปัญญา',
    sourceId:'MATHHORO-PLANETS-1-7-2009',
    pageRef:'WEB_ARTICLE_2009-06-24',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'ETHICS_KNOWLEDGE_WISDOM'
  },
  {
    id:'PLANET-6-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_6',
    planet:'ศุกร์',
    meaning:'ความรื่นรมย์ ศิลปะ ความงาม ความรัก และการเงิน',
    sourceId:'MATHHORO-PLANETS-1-7-2009',
    pageRef:'WEB_ARTICLE_2009-06-24',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'ART_BEAUTY_LOVE_MONEY'
  },
  {
    id:'PLANET-7-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_7',
    planet:'เสาร์',
    meaning:'ความกังวล ความเหน็ดเหนื่อย ความประหยัด และความสุขุม',
    sourceId:'MATHHORO-PLANETS-1-7-2009',
    pageRef:'WEB_ARTICLE_2009-06-24',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'WORRY_HARDSHIP_PRUDENCE'
  },
  {
    id:'PLANET-8-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_8',
    planet:'ราหู',
    meaning:'ความลุ่มหลง การทำตามอารมณ์ ความแปรปรวน และความเจ้าเล่ห์',
    sourceId:'MATHHORO-PLANETS-8-9-2009',
    pageRef:'WEB_ARCHIVE_2009-06-14',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'OBSESSION_EMOTION_VOLATILITY'
  },
  {
    id:'PLANET-9-MATHHORO-2009-B1',
    topic:'PLANETS_1_9',
    concept:'PLANET_9',
    planet:'เกตุ',
    meaning:'ความคิดแปลกแตกต่าง ไม่เป็นไปตามกรอบ และยากต่อการคาดเดา',
    sourceId:'MATHHORO-PLANETS-8-9-2009',
    pageRef:'WEB_ARCHIVE_2009-06-14',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.20-b1',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'PLANET_CORE_MEANING',
    claimValue:'UNCONVENTIONAL_UNPREDICTABLE'
  }
]);

function buildRegistry(){
  return M.createRegistry(RECORDS);
}

function validate(){
  const errors=[];
  const registry=buildRegistry();

  if(RECORDS.length!==9)errors.push('planet-count');
  if(RECORDS.some(x=>x.status!=='PROVISIONAL'))errors.push('premature-verification');
  if(RECORDS.some(x=>!S.getSource(x.sourceId)))errors.push('missing-source');
  if(RECORDS.some(x=>x.sourceId==='MAHASATTALEK-3-THANAKORN'))
    errors.push('book-content-falsely-ingested');
  if(BOOK_PAGE_KNOWLEDGE_INGESTED!==false)errors.push('book-page-claim');
  if(INGESTION_COMPLETE!==false)errors.push('global-ingestion');
  if(PRODUCTION_CUTOVER!==false)errors.push('production-cutover');
  if(registry.all().length!==9)errors.push('registry-count');

  return {ok:errors.length===0,errors};
}

const API=deepFreeze({
  VERSION:'2.20.0-knowledge-planets-batch1',
  INGESTION_COMPLETE,
  BATCH_COMPLETE,
  PRODUCTION_CUTOVER,
  BOOK_PAGE_KNOWLEDGE_INGESTED,
  RECORDS,
  buildRegistry,
  validate
});

root.HorajarnPlanetKnowledgeBatch1V220=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
