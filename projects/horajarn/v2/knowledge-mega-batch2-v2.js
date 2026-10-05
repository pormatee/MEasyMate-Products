(function(root){'use strict';

const M=typeof require!=='undefined'
  ? require('./multisource-knowledge-registry-v2.js')
  : root.HorajarnMultiSourceKnowledgeV219;

const S=typeof require!=='undefined'
  ? require('./knowledge-source-registry-v2.1.js')
  : root.HorajarnKnowledgeSourcesV221;

const INGESTION_COMPLETE=false;
const MEGA_BATCH_COMPLETE=true;
const PRODUCTION_CUTOVER=false;
const BOOK_PAGE_KNOWLEDGE_INGESTED=false;

function deepFreeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(deepFreeze);
  }
  return v;
}

const houses=[
['01','อัตตะ','ตัวตน วาสนา และสิ่งของตน','SELF_FORTUNE'],
['02','หินะ','ข้อด้อย ข้อบกพร่อง และโทษ','DEFECT_WEAKNESS'],
['03','ธนัง','เงินออม ทรัพย์ และฐานะ','WEALTH_ASSET'],
['04','ปิตา','บิดา ผู้ใหญ่ชาย และที่พึ่งภายนอก','FATHER_MALE_AUTHORITY'],
['05','มาตา','มารดา ผู้ใหญ่หญิง และที่พึ่งภายใน','MOTHER_FEMALE_SUPPORT'],
['06','โภคา','ทรัพย์ ความเป็นอยู่ และอสังหาริมทรัพย์','PROPERTY_LIVING'],
['07','มัชฌิมา','ภาวะกลาง ปกติ และส่วนรวม','MIDDLE_PUBLIC'],
['08','ตนุ','ตัวตนปัจจุบัน วาสนา และการครองชีพ','CURRENT_SELF'],
['09','กดุมพะ','การเงิน สิ่งที่ได้มา และหลักทรัพย์','FINANCE_ACQUISITION'],
['10','สหัชชะ','สังคม มิตร ข่าวสาร เดินทางใกล้ และพี่น้อง','SOCIAL_COMMUNICATION'],
['11','พันธุ','ครอบครัว บ้าน ที่ดิน ยานพาหนะ และความมั่นคง','FAMILY_HOME'],
['12','ปุตตะ','บุตร ผู้เยาว์ การเริ่มใหม่ ความรักและการเสี่ยง','CHILD_NEW_BEGINNING'],
['13','อริ','ศัตรู อุปสรรค เจ็บป่วย หนี้ และความขัดแย้ง','OBSTACLE_DEBT'],
['14','ปัตนิ','คู่ครอง หุ้นส่วน ความร่วมมือ และฝ่ายตรงข้าม','PARTNER_COOPERATION'],
['15','มรณะ','สูญเสีย รั่วไหล พลัดพราก ล้มเหลว และป่วยหนัก','LOSS_SEPARATION'],
['16','ศุภะ','ก้าวหน้า ต่างถิ่น เดินทางไกล ผู้ใหญ่และอุปถัมภ์','PROGRESS_SUPPORT'],
['17','กัมมะ','อาชีพ การงาน การกระทำ กรรม และโชคเคราะห์','CAREER_ACTION'],
['18','ลาภะ','ลาภ ความหวัง ความสมหวัง และสิ่งเชื่อมโยง','GAIN_HOPE'],
['19','พยายะ','ความเสื่อม เรื่องเร้นลับ ปัญหาคาดไม่ถึง และคดี','HIDDEN_DECLINE'],
['20','ทาสี','เหนื่อยเพื่อตน ผู้ต่ำกว่า และความมุ่งมั่น','SELF_EFFORT_SUBORDINATE'],
['21','ทาสา','เกี่ยวพันผู้อื่น เหนื่อยเพื่อผู้อื่น และความพ่ายแพ้','OTHER_EFFORT']
];

const HOUSE_RECORDS=houses.map(([n,name,meaning,value])=>({
  id:`HOUSE-${n}-MATHHORO-B2`,
  topic:'HOUSES',
  concept:`HOUSE_${n}`,
  house:name,
  meaning,
  sourceId:'MATHHORO-HOUSES-21-2009',
  pageRef:'WEB_ARTICLE_2009-06-24',
  school:'MAHASATTALEK_SECONDARY',
  version:'v2.21-b2',
  verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
  status:'PROVISIONAL',
  claimKey:'HOUSE_CORE_MEANING',
  claimValue:value
}));

const pairGroups=[
  ['FRIEND','คู่มิตร','เกื้อกูลกัน',[[1,5],[2,4],[3,6],[7,8]]],
  ['ENEMY','คู่ศัตรู','บั่นทอนหรือขัดแย้งกัน',[[1,3],[2,5],[4,8],[6,7]]],
  ['ELEMENT','คู่ธาตุ','สัมพันธ์ลึกและมั่นคง',[[1,7],[2,5],[3,8],[4,6]]],
  ['EQUAL_POWER','คู่สมพล','เพิ่มกำลังเมื่อสัมพันธ์กัน',[[1,6],[2,8],[3,5],[4,7]]]
];

const PAIR_RECORDS=[];
for(const [type,label,meaning,pairs] of pairGroups){
  for(const [a,b] of pairs){
    PAIR_RECORDS.push({
      id:`PAIR-${type}-${a}-${b}-B2`,
      topic:'PLANET_RELATIONSHIPS',
      concept:`PLANETS_${a}_${b}_${type}`,
      planets:[a,b],
      relationshipType:type,
      meaning:`${label}: ${meaning}`,
      sourceId:'MATHHORO-PLANET-PAIRS-2009',
      pageRef:'WEB_ARTICLE_2009-06-26',
      school:'MAHASATTALEK_SECONDARY',
      version:'v2.21-b2',
      verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
      status:'PROVISIONAL',
      claimKey:'PLANET_PAIR_CLASS',
      claimValue:type
    });
  }
}

const HOUSE_RELATIONSHIP_RECORDS=[{
  id:'HOUSE-REL-SAME-PLANET-OWNER-B2',
  topic:'HOUSE_RELATIONSHIPS',
  concept:'SAME_PLANET_MULTI_HOUSE',
  meaning:'เมื่อดาวเดียวกันปรากฏสัมพันธ์กับหลายเรือน ให้เชื่อมเรือนเหล่านั้นจากข้อเท็จจริงของดวงจริง ไม่สร้างรายการ support แบบตายตัว',
  sourceId:'USER-PRACTITIONER-RULES',
  pageRef:'OWNER_RULE_2026-10-03',
  school:'HORAJARN_PRACTITIONER',
  version:'v2.21-b2',
  verification:'OWNER_VERIFIED_V1',
  status:'OWNER_VERIFIED',
  claimKey:'HOUSE_RELATIONSHIP_MODE',
  claimValue:'DERIVE_FROM_ACTUAL_CHART_FACTS'
}];

const METHOD_RECORDS=[
  {
    id:'METHOD-HOUSE-PLANET-POSITIVE-B2',
    topic:'PREDICTION_METHOD',
    concept:'COMBINE_POSITIVE_PLANET_AND_HOUSE',
    meaning:'เมื่อดาวให้คุณ ให้อ่านผลร่วมกันทั้งความหมายของดาวและเรือนที่เกี่ยวข้อง',
    sourceId:'MATHHORO-ANALYSIS-METHOD-2009',
    pageRef:'WEB_ARTICLE_2009-06-17',
    school:'THAI_ASTRO_SECONDARY',
    version:'v2.21-b2',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'INTERPRETATION_METHOD',
    claimValue:'PLANET_PLUS_HOUSE_POSITIVE'
  },
  {
    id:'METHOD-HOUSE-PLANET-NEGATIVE-B2',
    topic:'PREDICTION_METHOD',
    concept:'COMBINE_NEGATIVE_PLANET_AND_HOUSE',
    meaning:'เมื่อดาวให้โทษ ให้อ่านผลเสียร่วมทั้งด้านเรือนและความหมายของดาว',
    sourceId:'MATHHORO-ANALYSIS-METHOD-2009',
    pageRef:'WEB_ARTICLE_2009-06-17',
    school:'THAI_ASTRO_SECONDARY',
    version:'v2.21-b2',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'INTERPRETATION_METHOD',
    claimValue:'PLANET_PLUS_HOUSE_NEGATIVE'
  },
  {
    id:'METHOD-PAIR-CONTEXT-B2',
    topic:'PREDICTION_METHOD',
    concept:'PAIR_MEANING_IN_HOUSE_CONTEXT',
    meaning:'ความสัมพันธ์ของคู่ดาวต้องแปลร่วมกับบริบทเรือน ไม่ใช้ความหมายคู่ดาวโดด ๆ',
    sourceId:'MATHHORO-PLANET-PAIRS-2009',
    pageRef:'WEB_ARTICLE_2009-06-26',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.21-b2',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'INTERPRETATION_METHOD',
    claimValue:'PAIR_PLUS_HOUSE_CONTEXT'
  }
];

const EXAMPLE_RECORDS=[
  {
    id:'EXAMPLE-1-6-KAMMA-B2',
    topic:'PREDICTION_EXAMPLES',
    concept:'PAIR_1_6_AT_KAMMA',
    meaning:'ตัวอย่างจากแหล่ง: คู่สมพล 1–6 เมื่อสัมพันธ์กับกัมมะ ใช้ประกอบการอ่านว่าด้านการงานมีกำลังเด่นขึ้น',
    sourceId:'MATHHORO-PLANET-PAIRS-2009',
    pageRef:'WEB_ARTICLE_2009-06-26',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.21-b2',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'EXAMPLE_CONTEXT',
    claimValue:'PAIR_1_6_KAMMA'
  },
  {
    id:'EXAMPLE-1-6-LABHA-B2',
    topic:'PREDICTION_EXAMPLES',
    concept:'PAIR_1_6_AT_LABHA',
    meaning:'ตัวอย่างจากแหล่ง: คู่สมพล 1–6 เมื่อสัมพันธ์กับลาภะ ใช้ประกอบการอ่านด้านความสำเร็จหรือลาภที่เด่นขึ้น',
    sourceId:'MATHHORO-PLANET-PAIRS-2009',
    pageRef:'WEB_ARTICLE_2009-06-26',
    school:'MAHASATTALEK_SECONDARY',
    version:'v2.21-b2',
    verification:'PARAPHRASED_SOURCE_ACCESSIBLE',
    status:'PROVISIONAL',
    claimKey:'EXAMPLE_CONTEXT',
    claimValue:'PAIR_1_6_LABHA'
  }
];

const RECORDS=deepFreeze([
  ...HOUSE_RECORDS,
  ...PAIR_RECORDS,
  ...HOUSE_RELATIONSHIP_RECORDS,
  ...METHOD_RECORDS,
  ...EXAMPLE_RECORDS
]);

function buildRegistry(){
  return M.createRegistry(RECORDS);
}

function count(topic){
  return RECORDS.filter(x=>x.topic===topic).length;
}

function validate(){
  const errors=[];
  const registry=buildRegistry();

  if(RECORDS.length!==43)errors.push('record-count');
  if(count('HOUSES')!==21)errors.push('houses');
  if(count('PLANET_RELATIONSHIPS')!==16)errors.push('planet-rel');
  if(count('HOUSE_RELATIONSHIPS')!==1)errors.push('house-rel');
  if(count('PREDICTION_METHOD')!==3)errors.push('methods');
  if(count('PREDICTION_EXAMPLES')!==2)errors.push('examples');

  if(RECORDS.some(x=>!S.getSource(x.sourceId)))
    errors.push('missing-source');

  if(HOUSE_RECORDS.some(x=>x.status!=='PROVISIONAL'))
    errors.push('house-premature-verification');

  if(PAIR_RECORDS.some(x=>x.status!=='PROVISIONAL'))
    errors.push('pair-premature-verification');

  if(HOUSE_RELATIONSHIP_RECORDS[0].status!=='OWNER_VERIFIED')
    errors.push('owner-rule-status');

  if(RECORDS.some(x=>x.sourceId==='MAHASATTALEK-3-THANAKORN'))
    errors.push('book-content-falsely-ingested');

  if(INGESTION_COMPLETE!==false)errors.push('global-ingestion');
  if(PRODUCTION_CUTOVER!==false)errors.push('production-cutover');
  if(BOOK_PAGE_KNOWLEDGE_INGESTED!==false)errors.push('book-page-claim');
  if(registry.all().length!==43)errors.push('registry-count');

  return {ok:errors.length===0,errors};
}

const API=deepFreeze({
  VERSION:'2.21.0-knowledge-mega-batch2',
  INGESTION_COMPLETE,
  MEGA_BATCH_COMPLETE,
  PRODUCTION_CUTOVER,
  BOOK_PAGE_KNOWLEDGE_INGESTED,
  RECORDS,
  buildRegistry,
  count,
  validate
});

root.HorajarnKnowledgeMegaBatch2V221=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
