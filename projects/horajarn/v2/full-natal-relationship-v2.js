(function(root){'use strict';

const E=typeof require!=='undefined'
  ? require('./integrated-prediction-engine-v2.js')
  : root.HorajarnIntegratedPredictionV222;
const S=typeof require!=='undefined'
  ? require('./career-signature-v2.js')
  : root.HorajarnCareerSignatureV227;
const A=typeof require!=='undefined'
  ? require('./adaptive-career-narrative-v2.js')
  : root.HorajarnAdaptiveCareerNarrativeV227;

const VERSION='2.28.4.2-life-language-fix';
const PRODUCTION_CUTOVER=false;

function freeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
  return v;
}
function canon(v){return E.canonicalHouse(v);}
function pairKey(a,b){return [Number(a),Number(b)].sort((x,y)=>x-y).join('-');}
function byHouse(records,name){const h=canon(name);return records.find(x=>canon(x.name)===h)||null;}
function byCoord(records,base,col){return records.find(x=>Number(x.base)===Number(base)&&Number(x.col)===Number(col))||null;}
function toPos(r,role='PRIMARY',semanticHouseUse=true){
  if(!r)return null;
  return {house:canon(r.name),planet:Number(r.num),base:Number(r.base),col:Number(r.col),role,semanticHouseUse};
}
function planetKnowledge(n){return E.INDEX.planet[String(Number(n))]||null;}
function houseKnowledge(name){return E.INDEX.house[canon(name)]||null;}
function pairRows(a,b){
  if(Number(a)===Number(b))return [];
  return (E.INDEX.pair[pairKey(a,b)]||[]).map(x=>({
    planets:[Number(a),Number(b)],type:x.relationshipType,meaning:x.meaning,
    knowledgeId:x.id,sourceId:x.sourceId,status:x.status
  }));
}
function collectPairs(positions){
  const planets=[...new Set(positions.map(x=>Number(x.planet)).filter(Number.isFinite))];
  const out=[];
  for(let i=0;i<planets.length;i++)for(let j=i+1;j<planets.length;j++){
    const rows=pairRows(planets[i],planets[j]);
    if(!rows.length)continue;
    const types=[...new Set(rows.map(x=>x.type))];
    out.push({planets:[planets[i],planets[j]],types,conflicted:types.length>1,rows});
  }
  return out;
}
function base4(records,p){
  const r=S.resolveBase4(records,p);
  if(!r||!r.ok)return null;
  const k=r.knowledge;
  return {
    anchorHouse:p.house,anchorRole:p.role,anchorPlanet:p.planet,
    value:r.value,col:r.col,kind:k.kind,code:k.code||null,
    planet:Number.isFinite(Number(k.planet))?Number(k.planet):null,
    name:k.name,meaning:k.meaning,caution:k.caution||null,
    sourceId:k.sourceId,status:k.status,stack:r.stack
  };
}
function sameLinks(records,p,excluded){
  const ex=new Set(excluded.map(canon));
  const out=[];
  for(const r of records){
    if(Number(r.num)!==Number(p.planet))continue;
    const h=canon(r.name);
    if(ex.has(h))continue;
    const hk=houseKnowledge(h);
    out.push({
      planet:p.planet,anchorHouse:p.house,house:h,base:Number(r.base),col:Number(r.col),
      meaning:hk?hk.meaning:null,claimValue:hk?hk.claimValue:null,
      knowledgeId:hk?hk.id:null,sourceId:hk?hk.sourceId:null,status:hk?hk.status:null,
      verification:'OWNER_VERIFIED_SAME_PLANET_RULE'
    });
  }
  return out;
}

const CONFIG=freeze({
  identity:{label:'ลักษณะนิสัยและตัวตน',mode:'EXISTING_NATAL_BASIS',verification:'EXISTING_PRODUCT_BASIS',houses:[['อัตตะ','PRIMARY'],['ตนุ','PRIMARY']]},
  speech:{label:'คำพูดและวิธีสื่อสาร',mode:'EXISTING_NATAL_COORDINATE_BASIS',verification:'EXISTING_PRODUCT_BASIS',coord:[1,3,'PRIMARY'],semanticHouseUse:false},
  mind:{label:'ความคิดและความรู้สึกภายใน',mode:'EXISTING_NATAL_COORDINATE_BASIS',verification:'EXISTING_PRODUCT_BASIS',coord:[2,3,'PRIMARY'],semanticHouseUse:false},
  home:{label:'ที่อยู่และสภาพแวดล้อม',mode:'EXISTING_NATAL_COORDINATE_BASIS',verification:'EXISTING_PRODUCT_BASIS',coord:[3,3,'PRIMARY'],semanticHouseUse:false},
  money:{label:'การเงิน',mode:'LEGACY_DOMAIN_POLICY',policy:'finance'},
  partner:{label:'คู่ครองและหุ้นส่วน',mode:'LEGACY_DOMAIN_POLICY',policy:'love'}
});

function positionsFor(facts,cfg){
  const records=facts.records;
  if(cfg.houses)return cfg.houses.map(([h,role])=>toPos(byHouse(records,h),role,true)).map(x=>typeof x==='string'?x.trim():x).filter(Boolean);
  if(cfg.coord)return [toPos(byCoord(records,cfg.coord[0],cfg.coord[1]),cfg.coord[2],cfg.semanticHouseUse!==false)].map(x=>typeof x==='string'?x.trim():x).filter(Boolean);
  if(cfg.policy){
    const policy=E.resolvePolicy({domain:cfg.policy});
    return E.selectPositions(facts,policy).map(x=>({
      house:canon(x.house),planet:Number(x.planet),base:Number(x.base),col:Number(x.col),role:x.role,semanticHouseUse:true
    }));
  }
  return [];
}
function provenance(positions,b4,links,pairs,policy){
  const ids=new Set(),sources=new Set(policy?policy.sourceRefs:[]);
  for(const p of positions){
    const pk=planetKnowledge(p.planet),hk=p.semanticHouseUse?houseKnowledge(p.house):null;
    if(pk){ids.add(pk.id);sources.add(pk.sourceId);} if(hk){ids.add(hk.id);sources.add(hk.sourceId);}
  }
  for(const x of b4)if(x&&x.sourceId)sources.add(x.sourceId);
  for(const x of links){if(x.knowledgeId)ids.add(x.knowledgeId);if(x.sourceId)sources.add(x.sourceId);sources.add('USER-PRACTITIONER-RULES');}
  for(const p of pairs)for(const r of p.rows){if(r.knowledgeId)ids.add(r.knowledgeId);if(r.sourceId)sources.add(r.sourceId);}
  return {knowledgeIds:[...ids],sourceRefs:[...sources]};
}
function sigKey(key,anchors,b4s,links,pairs){
  const sort=a=>a.slice().sort().join(',')||'NONE';
  return [
    `D-${key}`,
    `A-${sort(anchors.map(x=>`${x.role}:${x.planet}:${x.base}:${x.col}`))}`,
    `B4-${sort(b4s.map(x=>`${x.value}:${x.code||('P'+x.planet)}`))}`,
    `L-${sort(links.map(x=>`${x.planet}:${x.house}`))}`,
    `P-${sort(pairs.map(x=>`${pairKey(x.planets[0],x.planets[1])}:${x.types.slice().sort().join('+')}`))}`
  ].join('|');
}
function buildSignature(facts,key){
  const cfg=CONFIG[key];
  if(!cfg)return freeze({ok:false,reason:'UNKNOWN_DOMAIN'});
  if(!facts||!Array.isArray(facts.records))return freeze({ok:false,reason:'FACT_RECORDS_REQUIRED'});
  const positions=positionsFor(facts,cfg);
  if(!positions.length)return freeze({ok:false,reason:'NO_POSITIONS'});
  const anchors=positions.filter(x=>x.role==='PRIMARY');
  const anchorList=anchors.length?anchors:positions.slice(0,1);
  const supports=positions.filter(x=>!anchorList.includes(x));
  const selectedHouses=positions.map(x=>x.house);
  const b4s=anchorList.map(x=>base4(facts.records,x)).map(x=>typeof x==='string'?x.trim():x).filter(Boolean);
  const links=[]; for(const a of anchorList)links.push(...sameLinks(facts.records,a,selectedHouses));
  const pairs=collectPairs(positions);
  const policy=cfg.policy?E.resolvePolicy({domain:cfg.policy}):null;
  return freeze({
    ok:true,version:VERSION,domain:key,label:cfg.label,basisMode:cfg.mode,
    basisVerification:policy?policy.verification:cfg.verification,
    policy:policy?{mode:policy.mode,ruleId:policy.ruleId,verification:policy.verification,sourceRefs:policy.sourceRefs}:null,
    anchors:anchorList,supports,base4Modifiers:b4s,samePlanetLinks:links,pairRelationships:pairs,
    pairConflicts:pairs.filter(x=>x.conflicted),
    provenance:provenance(positions,b4s,links,pairs,policy),
    signatureKey:sigKey(key,anchorList,b4s,links,pairs),
    timingUsed:false,transitUsed:false,productionCutover:false
  });
}
function baselineMap(items){const m={};for(const x of items||[])if(x&&x.key)m[x.key]=x;return m;}
function modifierSemanticKey(b){
  if(!b)return 'NONE';
  if(b.code)return `SPECIAL:${b.code}`;
  if(Number.isFinite(Number(b.planet)))return `PLANET:${Number(b.planet)}`;
  return `VALUE:${b.value}:${b.meaning||''}`;
}

function publicModifierMeaning(b){
  if(!b)return null;

  const special={
    RACHA_CHOK:'การมองเห็นโอกาสและการได้รับแรงช่วยเหลือจากคนรอบตัว',
    MAHA_UT:'ความมั่นคง การยกระดับศักยภาพ และความกล้ารับผิดชอบ',
    EMPEROR:'ภาวะผู้นำ ความรับผิดชอบ และการได้รับการยอมรับ',
    SOLA_MONGKOL:'การสร้างคุณค่า ทรัพย์สิน และความมั่นคงที่จับต้องได้',
    MAHA_EMPEROR:'การรวมพลัง คน และทรัพยากรเพื่อเป้าหมายที่ใหญ่ขึ้น',
    URANUS:'ความคิดใหม่ การเปลี่ยนแปลง และการมองมุมที่คนอื่นอาจยังไม่เห็น'
  };

  if(b.code&&special[b.code])
    return special[b.code];

  const planets={
    1:'ความมั่นใจ ภาวะผู้นำ และความชัดเจนในการตัดสินใจ',
    2:'ความละเอียด ความนุ่มนวล และการคำนึงถึงความรู้สึกของคน',
    3:'ความกล้า พลังในการลงมือ และการรับมือกับปัญหา',
    4:'ไหวพริบ การสื่อสาร และการเชื่อมข้อมูล',
    5:'เหตุผล ความรู้ หลักการ และการมองภาพอย่างเป็นระบบ',
    6:'การประสานคน การสร้างคุณค่า และความเข้าใจความต้องการ',
    7:'ความอดทน ความรอบคอบ และการมองผลระยะยาว',
    8:'การมองทางเลือกใหม่ การปรับตัวต่อความเปลี่ยนแปลง และการคิดนอกกรอบ',
    9:'สัญชาตญาณ มุมมองละเอียด และความคิดที่ไม่ตามกรอบ'
  };

  if(Number.isFinite(Number(b.planet))&&planets[Number(b.planet)])
    return planets[Number(b.planet)];

  return b.meaning||null;
}

function modifierText(domain,b){
  const m=publicModifierMeaning(b);
  if(!m)return null;

  const text={
    identity:
      `คุณยังมีด้านของ${m}อยู่ด้วย จึงสามารถปรับวิธีคิดและการวางตัวให้เหมาะกับสถานการณ์ได้มากกว่าการใช้ลักษณะเดิมเพียงด้านเดียว`,

    speech:
      `เวลาสื่อสาร คุณยังใช้${m}มาช่วยเลือกจังหวะและวิธีพูด ทำให้การถ่ายทอดความคิดยืดหยุ่นขึ้นตามคนและสถานการณ์`,

    mind:
      `อีกด้านหนึ่ง คุณมี${m}ช่วยในการรับรู้สถานการณ์ ทำให้มองเรื่องเดียวได้มากกว่าหนึ่งมุมก่อนตัดสินใจ`,

    home:
      `ความรู้สึกมั่นคงของคุณยังสัมพันธ์กับ${m} ทำให้สภาพแวดล้อมที่เหมาะเปิดพื้นที่ให้ทั้งความสบายใจและวิธีใช้ชีวิตของคุณ`,

    money:
      `ในเรื่องเงิน คุณยังใช้${m}ร่วมกับวิธีหาและรักษาทรัพย์เดิม จึงมีทั้งมิติของโอกาสในปัจจุบันและการสร้างความมั่นคงในระยะยาว`,

    partner:
      `ในความสัมพันธ์ คุณยังให้ความสำคัญกับ${m} ทำให้การตัดสินใจร่วมกันไม่ได้ขึ้นอยู่กับความรู้สึกหรือเหตุผลเพียงด้านเดียว`
  };

  return text[domain]||null;
}

const HOUSE_HUMAN=freeze({
  SELF_FORTUNE:'ตัวตน ทิศทางชีวิต และสิ่งที่เป็นของตน',
  DEFECT_WEAKNESS:'เรื่องที่ต้องใช้ความรอบคอบและการดูแลตนเอง',
  WEALTH_ASSET:'เงินออม ทรัพย์ และฐานะ',
  FATHER_MALE_AUTHORITY:'ผู้ใหญ่ฝ่ายชาย อำนาจ และบทบาทการตัดสินใจ',
  MOTHER_FEMALE_SUPPORT:'ผู้ใหญ่ฝ่ายหญิง การดูแล และแรงสนับสนุน',
  PROPERTY_LIVING:'ทรัพย์ ความเป็นอยู่ และฐานชีวิต',
  MIDDLE_PUBLIC:'ภาพรวมและการประคองชีวิต',
  CURRENT_SELF:'ตัวตนปัจจุบันและวิธีดำเนินชีวิต',
  FINANCE_ACQUISITION:'รายรับ การได้มา และการจัดการทรัพย์',
  SOCIAL_COMMUNICATION:'เพื่อน เครือข่าย การติดต่อ และข้อมูล',
  FAMILY_HOME:'ครอบครัว บ้าน และความมั่นคง',
  CHILD_NEW_BEGINNING:'บุตร การสร้างสิ่งใหม่ ความรัก และการเริ่มต้น',
  OBSTACLE_DEBT:'ภาระ เรื่องที่ต้องแก้ไข และข้อจำกัดที่ต้องจัดการ',
  PARTNER_COOPERATION:'คู่ครอง หุ้นส่วน และความร่วมมือ',
  LOSS_SEPARATION:'การเปลี่ยนผ่าน การปล่อยวาง และการเริ่มจัดลำดับชีวิตใหม่',
  PROGRESS_SUPPORT:'การเติบโต การเดินทางไกล และแรงสนับสนุนจากผู้มีประสบการณ์',
  CAREER_ACTION:'งานหลัก หน้าที่ และผลจากการลงมือ',
  GAIN_HOPE:'ผลตอบแทน โอกาส และสิ่งที่คาดหวัง',
  HIDDEN_DECLINE:'ค่าใช้จ่าย เรื่องเบื้องหลัง และเหตุที่คาดเดาได้ยาก',
  SELF_EFFORT_SUBORDINATE:'การลงแรงด้วยตนเอง ผู้ช่วย และคนที่อยู่ใต้การดูแล',
  OTHER_EFFORT:'ภาระหรือผลลัพธ์ที่เกี่ยวข้องกับผู้อื่น งานบริการ และการรับผิดชอบคนอื่น'
});

const DOMAIN_LINK_OVERRIDES=freeze({
  identity:{
    SOCIAL_COMMUNICATION:
      'ผู้คน เครือข่าย การติดต่อ และข้อมูลมีบทบาทต่อวิธีคิดและการตัดสินใจของคุณค่อนข้างมาก',
    HIDDEN_DECLINE:
      'ขณะเดียวกัน คุณมักต้องเผื่อพื้นที่ให้กับค่าใช้จ่าย เรื่องเบื้องหลัง หรือสถานการณ์ที่เปลี่ยนกะทันหัน การเตรียมทางเลือกไว้ล่วงหน้าช่วยให้รับมือได้มั่นคงขึ้น',
    PARTNER_COOPERATION:
      'คู่ครอง หุ้นส่วน หรือคนที่ต้องตัดสินใจร่วมกันมีผลต่อทิศทางชีวิตของคุณพอสมควร',
    CAREER_ACTION:
      'งานและความรับผิดชอบเป็นส่วนสำคัญของวิธีที่คุณมองตัวเองและกำหนดทิศทางชีวิต',
    WEALTH_ASSET:
      'ความมั่นคงด้านเงินและทรัพย์มีผลต่อความมั่นใจและการตัดสินใจในเรื่องสำคัญ',
    PROPERTY_LIVING:
      'ความเป็นอยู่และฐานชีวิตมีผลต่อความมั่นคงทางใจและวิธีที่คุณเลือกเดินต่อ'
  },

  speech:{
    SOCIAL_COMMUNICATION:
      'ผู้คน ข่าวสาร และเครือข่ายมีผลต่อจังหวะการสื่อสารของคุณ การมีข้อมูลที่ชัดช่วยให้ถ่ายทอดความคิดได้ตรงขึ้น',
    CAREER_ACTION:
      'การพูดและการสื่อสารมีบทบาทกับงานและความรับผิดชอบ จึงยิ่งเด่นเมื่อใช้เพื่ออธิบาย ตัดสินใจ หรือประสานงาน',
    PARTNER_COOPERATION:
      'การสื่อสารมีผลโดยตรงต่อความร่วมมือกับคู่ครอง หุ้นส่วน หรือคนที่ต้องตัดสินใจร่วมกัน'
  },

  mind:{
    SOCIAL_COMMUNICATION:
      'ข้อมูลและสิ่งที่ได้ยินจากคนรอบตัวมีผลต่อวิธีคิดของคุณค่อนข้างมาก การมีเวลาคัดกรองข้อมูลช่วยให้ใจนิ่งขึ้น',
    HIDDEN_DECLINE:
      'เรื่องที่ยังไม่ชัดหรือเหตุที่คาดเดาได้ยากอาจกินพื้นที่ความคิดได้ง่าย การแยกสิ่งที่ควบคุมได้ออกจากสิ่งที่ควบคุมไม่ได้ช่วยให้ตัดสินใจชัดขึ้น',
    FAMILY_HOME:
      'ครอบครัว บ้าน และความรู้สึกมั่นคงมีผลต่อสภาพใจและวิธีตัดสินใจของคุณ'
  },

  home:{
    FAMILY_HOME:
      'บ้าน ครอบครัว และความมั่นคงเป็นองค์ประกอบสำคัญต่อความรู้สึกลงตัวของคุณ',
    SOCIAL_COMMUNICATION:
      'สภาพแวดล้อมที่เดินทางและติดต่อผู้คนสะดวกช่วยให้คุณใช้ชีวิตได้คล่องขึ้น',
    CAREER_ACTION:
      'งานและรูปแบบการใช้ชีวิตมีผลต่อการเลือกสภาพแวดล้อมที่เหมาะกับคุณ'
  },

  money:{
    OTHER_EFFORT:
      'รายได้ ภาระ หรือค่าใช้จ่ายบางส่วนสัมพันธ์กับผู้อื่น งานบริการ และการรับผิดชอบแทนคนอื่น',
    SELF_EFFORT_SUBORDINATE:
      'รายได้บางส่วนสัมพันธ์กับการลงแรงด้วยตนเอง ผู้ช่วย ลูกน้อง หรือต้นทุนด้านแรงงาน',
    CHILD_NEW_BEGINNING:
      'เรื่องเงินมีส่วนเกี่ยวกับงานใหม่ โปรเจกต์ใหม่ การลงทุนเริ่มต้น หรือสิ่งที่ต้องใช้ทุนเพื่อเริ่มต้น',
    CAREER_ACTION:
      'รายได้และฐานทรัพย์สัมพันธ์กับงานหลักและผลจากการลงมือค่อนข้างตรง',
    SOCIAL_COMMUNICATION:
      'เครือข่าย การติดต่อ ข้อมูล หรือการประสานคนมีส่วนช่วยเปิดช่องทางรายได้',
    PARTNER_COOPERATION:
      'การตัดสินใจทางการเงินบางส่วนเกี่ยวข้องกับคู่ครอง หุ้นส่วน หรือการวางแผนร่วมกัน',
    GAIN_HOPE:
      'ผลตอบแทนและโอกาสมีส่วนต่อการขยายฐานการเงิน แต่ยังต้องแยกเงินที่ได้มาออกจากเงินที่เก็บรักษาไว้'
  },

  partner:{
    FATHER_MALE_AUTHORITY:
      'ผู้ใหญ่ฝ่ายชาย อำนาจ หรือบทบาทการตัดสินใจอาจมีผลต่อรูปแบบความสัมพันธ์และการตัดสินใจร่วม',
    MOTHER_FEMALE_SUPPORT:
      'การดูแล ความเข้าใจ และแรงสนับสนุนจากผู้ใหญ่ฝ่ายหญิงมีส่วนต่อความมั่นคงทางใจในความสัมพันธ์',
    SELF_FORTUNE:
      'ความสัมพันธ์มีผลต่อทิศทางชีวิตและการมองตัวเองของคุณค่อนข้างมาก',
    CURRENT_SELF:
      'วิธีใช้ชีวิตและตัวตนในปัจจุบันมีผลโดยตรงต่อการเลือกคนและรูปแบบความสัมพันธ์',
    SOCIAL_COMMUNICATION:
      'เพื่อน เครือข่าย และการสื่อสารมีบทบาทต่อการเริ่มต้นและพัฒนาความสัมพันธ์',
    CHILD_NEW_BEGINNING:
      'เรื่องความรัก บุตร หรือการเริ่มต้นสิ่งใหม่มีส่วนต่อการตัดสินใจร่วมกัน',
    CAREER_ACTION:
      'งาน หน้าที่ และความรับผิดชอบมีผลต่อเวลาและรูปแบบการใช้ชีวิตร่วมกัน'
  }
});

function humanHouse(domain,l){
  if(!l)return null;
  const cv=l.claimValue||'';
  const own=DOMAIN_LINK_OVERRIDES[domain]&&DOMAIN_LINK_OVERRIDES[domain][cv];

  if(own)return own;

  const meaning=HOUSE_HUMAN[cv]||l.meaning||null;
  if(!meaning)return null;

  const fallback={
    identity:`${meaning}มีบทบาทต่อวิธีคิดและทิศทางชีวิตของคุณในบางช่วง`,
    speech:`${meaning}มีผลต่อจังหวะการสื่อสารและการรับข้อมูลของคุณ`,
    mind:`${meaning}มีส่วนต่อวิธีคิด ความรู้สึก และการตัดสินใจของคุณ`,
    home:`${meaning}มีส่วนต่อความรู้สึกมั่นคงและรูปแบบการใช้ชีวิตของคุณ`,
    money:`${meaning}มีส่วนต่อวิธีหา ใช้ หรือรักษาทรัพย์ของคุณ`,
    partner:`${meaning}มีส่วนต่อรูปแบบความสัมพันธ์และการตัดสินใจร่วมกัน`
  };

  return fallback[domain]||meaning;
}

function linkText(domain,l){
  return humanHouse(domain,l);
}

function pair48(domain){
  const m={
    identity:
      'คุณมีทั้งด้านที่คิดและปรับตัวเร็วกับด้านที่ชอบมองทางใหม่ การมีจังหวะตรวจข้อเท็จจริงก่อนตัดสินใจเรื่องสำคัญช่วยให้สองด้านนี้ทำงานร่วมกันได้ดี',
    speech:
      'การสื่อสารของคุณอาจเร็วและพลิกมุมไว การแยกช่วงทดลองความคิดออกจากช่วงสรุปหรือรับปากช่วยให้ความคล่องตัวกลายเป็นข้อได้เปรียบ',
    mind:
      'ความคิดมีทั้งด้านวิเคราะห์ข้อมูลและด้านที่อยากเปลี่ยนมุมอย่างรวดเร็ว การกลับมาตรวจข้อเท็จจริงช่วยให้ใช้ความคิดสร้างสรรค์ได้โดยไม่เสียความชัดเจน',
    home:
      'คุณค่อนข้างไวต่อสภาพแวดล้อมที่มีข้อมูลและความเปลี่ยนแปลงมาก การมีพื้นที่ที่ช่วยให้ความคิดนิ่งลงทำให้ใช้ชีวิตได้สมดุลขึ้น',
    money:
      'เรื่องเงินที่อาศัยข้อมูล การเจรจา หรือการตัดสินใจเร็วอาจเปลี่ยนทิศได้ง่าย การตรวจเงื่อนไขและตัวเลขก่อนเปลี่ยนแผนช่วยให้ใช้ความคล่องตัวได้อย่างมั่นคง',
    partner:
      'การสื่อสารและการเปลี่ยนแปลงอาจเกิดเร็วในความสัมพันธ์ การตกลงขอบเขตและตรวจความเข้าใจให้ตรงกันช่วยให้ทั้งสองฝ่ายปรับตัวได้ง่ายขึ้น'
  };
  return m[domain]||null;
}

function pair13(domain){
  const m={
    identity:
      'คุณมีทั้งความต้องการยืนหยัดในสิ่งที่เชื่อและพลังที่พร้อมลงมือทันที การแยกเรื่องศักดิ์ศรีออกจากเรื่องที่ต้องตัดสินใจเร็วช่วยให้ใช้ความเด็ดขาดได้แม่นขึ้น',
    speech:
      'คำพูดมีทั้งน้ำหนักและความตรง การเว้นจังหวะสั้น ๆ ก่อนตอบในเรื่องกดดันช่วยให้ความชัดเจนไม่กลายเป็นความแข็ง',
    mind:
      'คุณมีทั้งแรงที่อยากควบคุมทิศทางและแรงที่อยากลงมือเร็ว การกำหนดให้ชัดว่าเรื่องใดต้องคิดและเรื่องใดถึงเวลาทำช่วยให้ใจนิ่งขึ้น',
    home:
      'คุณต้องการทั้งความเป็นระเบียบและพื้นที่สำหรับการเคลื่อนไหว การจัดสภาพแวดล้อมให้มีทั้งส่วนที่นิ่งและส่วนที่ลงมือได้ช่วยให้ใช้ชีวิตคล่องขึ้น',
    money:
      'การตัดสินใจทางการเงินมีทั้งความเด็ดขาดและความเร็ว การกำหนดวงเงินและเงื่อนไขก่อนขยับช่วยให้พลังการตัดสินใจทำงานอย่างมีกรอบ',
    partner:
      'ทั้งสองฝ่ายอาจมีจังหวะนำและตัดสินใจที่ชัด การตกลงว่าเรื่องใดใครรับผิดชอบหลักช่วยลดการแย่งจังหวะกัน'
  };
  return m[domain]||null;
}

function pair67(domain){
  const m={
    identity:
      'คุณมีทั้งด้านที่ต้องการความกลมกลืนและด้านที่จริงจังกับความรับผิดชอบ การจัดจังหวะพักกับจังหวะทำงานให้ชัดช่วยให้สองด้านนี้เสริมกันได้',
    speech:
      'การพูดของคุณมีทั้งความนุ่มนวลและความหนักแน่น การรักษาความชัดโดยไม่ทำให้บรรยากาศแข็งเกินไปช่วยให้คนรับสารได้ดี',
    mind:
      'ความต้องการความสบายและความรู้สึกว่าต้องรับผิดชอบอาจเกิดพร้อมกัน การแยกเวลาพักออกจากเวลารับภาระช่วยรักษาพลังระยะยาว',
    home:
      'คุณให้ความสำคัญทั้งความสบายและความมั่นคงระยะยาว การจัดบ้านหรือทรัพย์สินให้สวยงามแต่ดูแลง่ายช่วยตอบทั้งสองด้าน',
    money:
      'คุณมีทั้งด้านที่อยากใช้เงินเพื่อความสุขหรือสร้างคุณค่า และด้านที่ต้องการรักษาฐานระยะยาว การแยกงบใช้จ่ายออกจากเงินสะสมทำให้สองเป้าหมายเดินไปพร้อมกันได้',
    partner:
      'ความต้องการความกลมกลืนกับความจริงจังเรื่องหน้าที่อาจเดินต่างจังหวะกัน การคุยทั้งเรื่องความรู้สึกและภาระที่ต้องรับผิดชอบช่วยให้ความสัมพันธ์สมดุลขึ้น'
  };
  return m[domain]||null;
}

function pairDomainText(domain,type){
  const table={
    identity:{
      FRIEND:'คุณสมบัติเด่นสองด้านมีแนวโน้มส่งเสริมกัน ทำให้คุณใช้ศักยภาพได้ง่ายขึ้นเมื่อเลือกจังหวะได้เหมาะ',
      ENEMY:'คุณสมบัติเด่นสองด้านอาจตอบสนองคนละจังหวะ การรู้ว่าเมื่อใดควรใช้ด้านใดเป็นหลักช่วยให้ตัดสินใจได้ชัดขึ้น',
      ELEMENT:'คุณสมบัติสองด้านเชื่อมกันค่อนข้างลึกและมักทำงานเป็นชุดเดียวกัน จึงไม่จำเป็นต้องแยกออกจากกันตลอดเวลา',
      EQUAL_POWER:''
    },
    speech:{
      FRIEND:'วิธีคิดและวิธีพูดสองด้านช่วยกันได้ดี ทำให้การสื่อสารลื่นขึ้นเมื่อข้อมูลชัด',
      ENEMY:'จังหวะคิดกับจังหวะพูดอาจไม่ตรงกันเสมอ การตรวจข้อมูลและเจตนาก่อนสรุปช่วยให้คำพูดแม่นขึ้น',
      ELEMENT:'วิธีคิดและการสื่อสารเชื่อมกันลึก การอ่านทั้งเนื้อหา น้ำเสียง และจังหวะร่วมกันทำให้สื่อสารได้ครบกว่า',
      EQUAL_POWER:'เมื่อจุดเด่นด้านการสื่อสารทำงานพร้อมกัน น้ำหนักของคำพูดและการโน้มน้าวมีแนวโน้มเด่นขึ้น'
    },
    mind:{
      FRIEND:'ความคิดและความรู้สึกสองด้านช่วยประคองกัน ทำให้ตัดสินใจง่ายขึ้นเมื่อใจอยู่ในภาวะสมดุล',
      ENEMY:'ความคิดกับความรู้สึกอาจพาไปคนละทางในบางช่วง การให้เวลาตรวจทั้งเหตุผลและอารมณ์ช่วยให้ตัดสินใจชัดขึ้น',
      ELEMENT:'แรงภายในสองด้านเชื่อมกันลึก การยอมรับทั้งสองด้านช่วยให้เข้าใจตัวเองได้ครบกว่า',
      EQUAL_POWER:'เมื่อแรงภายในสองด้านทำงานพร้อมกัน ความรู้สึกและแรงตัดสินใจมีแนวโน้มเข้มขึ้น'
    },
    home:{
      FRIEND:'ปัจจัยที่เกี่ยวข้องกับบ้านและสภาพแวดล้อมช่วยกันได้ดี ทำให้สร้างความลงตัวได้ง่ายขึ้น',
      ENEMY:'ความต้องการต่อสภาพแวดล้อมสองแบบอาจต่างกัน การจัดพื้นที่ให้รองรับทั้งสองด้านช่วยให้ใช้ชีวิตได้สบายขึ้น',
      ELEMENT:'บ้าน ความมั่นคง และวิถีชีวิตเชื่อมกันค่อนข้างลึก จึงเหมาะกับการวางแผนร่วมกันเป็นภาพเดียว',
      EQUAL_POWER:'เมื่อปัจจัยสองด้านทำงานพร้อมกัน เรื่องบ้าน ความเป็นอยู่ และความมั่นคงมีแนวโน้มเด่นขึ้น'
    },
    money:{
      FRIEND:'วิธีหาเงินและการสร้างฐานทรัพย์มีแนวโน้มช่วยกัน ทำให้ต่อยอดรายได้ไปสู่ความมั่นคงได้ง่ายขึ้น',
      ENEMY:'แรงทางการเงินสองด้านใช้วิธีต่างกัน การแยกเป้าหมายระหว่างหาเงิน ใช้เงิน และรักษาทรัพย์ช่วยให้วางแผนได้ชัดขึ้น',
      ELEMENT:'การหาเงินและการสร้างฐานทรัพย์สัมพันธ์กันลึก การมองทั้งกระแสเงินสดและทรัพย์ระยะยาวร่วมกันช่วยให้ภาพการเงินครบขึ้น',
      EQUAL_POWER:''
    },
    partner:{
      FRIEND:'จุดเด่นของคนสองแบบช่วยกันได้ดี ความร่วมมือจึงเดินง่ายขึ้นเมื่อแบ่งบทบาทเหมาะสม',
      ENEMY:'วิธีคิดหรือวิธีตอบสนองของคนสองแบบอาจต่างกัน การตกลงขอบเขตและวิธีตัดสินใจร่วมทำให้ความสัมพันธ์ชัดขึ้น',
      ELEMENT:'ความรู้สึก หน้าที่ และความร่วมมือสัมพันธ์กันค่อนข้างลึก การดูทั้งสามด้านร่วมกันช่วยให้เข้าใจกันได้มากขึ้น',
      EQUAL_POWER:''
    }
  };

  return table[domain]&&table[domain][type]||null;
}

function pairConflictText(domain,p){
  if(!p||!p.conflicted)return null;

  const types=new Set(p.types||[]);

  if(types.has('ENEMY')&&types.has('ELEMENT')){
    const m={
      identity:
        'คุณสมบัติสองด้านนี้ทั้งผูกกันและดึงกันในบางจังหวะ การดูสถานการณ์จริงก่อนเลือกใช้ด้านใดเป็นหลักช่วยให้เกิดความสมดุล',
      speech:
        'วิธีคิดและการสื่อสารคู่นี้ทั้งช่วยกันและขัดกันได้ การดูบริบทของเรื่องและความพร้อมของข้อมูลก่อนพูดช่วยให้สื่อสารได้แม่นขึ้น',
      mind:
        'ความคิดและความรู้สึกคู่นี้มีทั้งช่วงที่ไปด้วยกันและช่วงที่ตึงกัน การยอมรับทั้งสองด้านช่วยให้ตัดสินใจจากภาพที่ครบขึ้น',
      home:
        'ความต้องการต่อบ้านและวิถีชีวิตมีทั้งส่วนที่เข้ากันและส่วนที่ต่างกัน การจัดพื้นที่ให้รองรับทั้งสองด้านช่วยให้ลงตัวขึ้น',
      money:
        'วิธีหาเงินและวิธีรักษาทรัพย์คู่นี้มีทั้งส่วนที่ส่งเสริมกันและส่วนที่ใช้จังหวะต่างกัน การแยกเป้าหมายและดูตัวเลขจริงช่วยให้ตัดสินใจได้ชัดขึ้น',
      partner:
        'จุดเด่นของทั้งสองฝ่ายมีทั้งส่วนที่เข้ากันและส่วนที่เห็นต่าง การดูทั้งความรู้สึก หน้าที่ และสถานการณ์จริงช่วยให้ตัดสินใจร่วมกันง่ายขึ้น'
    };

    return m[domain]||null;
  }

  return null;
}

function pairText(domain,p){
  if(!p)return null;
  if(p.conflicted)return pairConflictText(domain,p);

  const k=pairKey(p.planets[0],p.planets[1]);

  if(k==='4-8'&&p.types.includes('ENEMY'))return pair48(domain);
  if(k==='1-3'&&p.types.includes('ENEMY'))return pair13(domain);
  if(k==='6-7'&&p.types.includes('ENEMY'))return pair67(domain);

  for(const type of ['FRIEND','ENEMY','ELEMENT','EQUAL_POWER']){
    if(p.types.includes(type))
      return pairDomainText(domain,type);
  }

  return null;
}

const CAUTION_REFRAMES=freeze([
  [
    'ดื้อ ทิฐิ ความรีบตัดสินหรือแบกศักดิ์ศรีมากเกินไป',
    'ความมั่นใจและภาวะผู้นำเป็นข้อดี เมื่อเปิดพื้นที่ให้ข้อมูลและมุมมองจากคนอื่นก่อนตัดสินใจ จุดแข็งนี้จะยิ่งน่าเชื่อถือ'
  ],
  [
    'อารมณ์แปรปรวน ลังเล หรือรับภาระความรู้สึกคนอื่นมากเกินไป',
    'ความละเอียดอ่อนและการเข้าใจคนเป็นจุดแข็ง เมื่อรู้ว่าเรื่องไหนควรช่วยและเรื่องไหนควรให้อีกฝ่ายตัดสินใจเอง คุณจะดูแลความสัมพันธ์ได้โดยไม่รับภาระมากเกินไป'
  ],
  [
    'ใจร้อน ปะทะ เสี่ยงอุบัติเหตุหรือหักโหม',
    'พลังและความกล้าช่วยให้คุณลงมือได้เร็ว การเผื่อจังหวะตรวจความพร้อมก่อนเร่งหรือรับภาระหนักทำให้ใช้พลังนี้ได้เต็มที่กว่า'
  ],
  [
    'คิดมาก เปลี่ยนเร็ว พูดเร็ว หรือข้อมูลคลาดเคลื่อน',
    'ไหวพริบและความเร็วเป็นข้อได้เปรียบ การเผื่อจังหวะตรวจข้อมูลก่อนสรุปช่วยให้ความคิดและการตัดสินใจคมขึ้น'
  ],
  [
    'ยึดหลักมากไป ช้าเพราะคิดรอบคอบ หรือมั่นใจความรู้ตนเองเกินไป',
    'ความรอบคอบและการยึดหลักเป็นจุดแข็ง เมื่อเปิดรับข้อมูลใหม่และกำหนดจังหวะตัดสินใจให้เหมาะ คุณจะใช้ความรู้นั้นได้คล่องขึ้น'
  ],
  [
    'ฟุ่มเฟือย ตามใจตัวเอง เรื่องรักซับซ้อนหรือใช้เงินเพื่อความสุขมากไป',
    'ความสามารถในการสร้างความสุขและคุณค่าเป็นจุดเด่น เมื่อวางขอบเขตเรื่องการใช้จ่ายและความสัมพันธ์ให้ชัด จุดแข็งนี้จะยิ่งมั่นคง'
  ],
  [
    'ช้า กดดัน เหนื่อยสะสม มองโลกหนักหรือรับภาระเกินส่วน',
    'ความอดทนและความรับผิดชอบช่วยให้คุณไปได้ไกล การแบ่งภาระและกำหนดจังหวะพักให้เหมาะช่วยรักษาพลังระยะยาว'
  ],
  [
    'พูดเร็วเกินไป เปลี่ยนเรื่องไว รับปากหลายอย่าง หรือข้อมูลคลาดเคลื่อน',
    'ความคล่องตัวในการพูดเป็นข้อได้เปรียบ การเว้นจังหวะตรวจข้อมูลและสิ่งที่รับปากช่วยให้การสื่อสารน่าเชื่อถือขึ้น'
  ],
  [
    'คำพูดแรง ประชด ตัดบท หรือพูดก่อนคิดเมื่อไม่พอใจ',
    'ความตรงและความเร็วช่วยให้สื่อสารได้ชัด การเว้นจังหวะก่อนตอบในเรื่องที่มีแรงกดดันช่วยให้ความชัดเจนไม่กลายเป็นความแข็ง'
  ],
  [
    'น้ำเสียงแข็ง การยืนยันความคิดตนเองมากไป หรือคำพูดที่ทำให้คนรู้สึกถูกกด',
    'คำพูดที่ชัดและมีน้ำหนักเป็นจุดแข็ง การเปิดพื้นที่ให้คู่สนทนาได้ตอบและเลือกน้ำเสียงให้เหมาะช่วยให้คนรับสารได้ดีขึ้น'
  ]
]);

function positiveGuidance(domain,note){
  const raw=String(note||'').trim();
  if(!raw)return null;

  const hits=[];

  for(const [needle,text] of CAUTION_REFRAMES){
    if(raw.includes(needle)&&!hits.includes(text))
      hits.push(text);
  }

  if(hits.length){
    const lead={
      identity:'จุดเด่นของคุณจะทำงานได้เต็มที่เมื่อใช้แต่ละด้านให้เหมาะกับจังหวะ ',
      speech:'การสื่อสารของคุณจะมีพลังมากขึ้นเมื่อใช้จุดเด่นให้เหมาะกับคนและสถานการณ์ ',
      mind:'ความคิดและความรู้สึกจะทำงานร่วมกันได้ดีเมื่อมีจังหวะให้ทั้งเหตุผลและความรู้สึกได้ทำหน้าที่ ',
      home:'ความรู้สึกมั่นคงจะชัดขึ้นเมื่อสภาพแวดล้อมช่วยรองรับทั้งการพักและการใช้ชีวิตจริง ',
      money:'การเงินจะมั่นคงขึ้นเมื่อใช้จุดแข็งในการหาเงินควบคู่กับวินัยในการรักษาทรัพย์ ',
      partner:'ความสัมพันธ์จะเดินได้ดีเมื่อแต่ละฝ่ายใช้จุดแข็งของตนพร้อมกับเปิดพื้นที่ให้อีกฝ่าย '
    }[domain]||'';

    return lead+hits.slice(0,2).join(' ขณะเดียวกัน ');
  }

  const fallback={
    identity:
      'จุดเด่นของคุณจะทำงานได้เต็มที่เมื่อเลือกใช้ความคิด ความรู้สึก และจังหวะลงมือให้เหมาะกับสถานการณ์',
    speech:
      'การสื่อสารจะได้ผลดีที่สุดเมื่อให้เวลาตรวจทั้งสาระ น้ำเสียง และสิ่งที่ต้องการให้ผู้ฟังเข้าใจก่อนสรุป',
    mind:
      'เมื่อมีแรงกดดัน การให้เวลาตัวเองจัดลำดับความคิดและความรู้สึกช่วยให้ตัดสินใจได้ชัดขึ้น',
    home:
      'สภาพแวดล้อมที่เหมาะช่วยให้คุณพักได้จริงและมีพื้นที่สำหรับสิ่งที่ต้องลงมือในชีวิตประจำวัน',
    money:
      'การเงินจะเดินได้ดีเมื่อแยกเป้าหมายของเงินแต่ละส่วนให้ชัด ทั้งเงินใช้ เงินสำรอง และเงินสำหรับต่อยอด',
    partner:
      'ความสัมพันธ์จะมั่นคงขึ้นเมื่อคุยทั้งความรู้สึก หน้าที่ และสิ่งที่แต่ละฝ่ายคาดหวังให้ชัด'
  };

  return fallback[domain]||null;
}

function naturalizeLegacyText(domain,text){
  let t=String(text||'').trim();
  if(!t)return null;

  if(domain==='identity'){
    let m=t.match(/^แกนในมีลักษณะ (.+?) ขณะที่ภาพที่คนอื่นพบเห็นมีด้าน (.+?) จึงเป็นคนที่มีทั้งสองมิติและจะเด่นต่างกันตามสถานการณ์$/);

    if(m){
      return (
        `โดยพื้นฐานคุณเป็นคน${m[1]} `+
        `ขณะเดียวกันในสถานการณ์ที่ต่างออกไป คุณก็แสดงด้าน${m[2]}ได้ชัด `+
        'จึงเป็นคนที่ปรับวิธีคิดและวิธีตอบสนองให้เข้ากับสถานการณ์ได้หลายแบบ'
      );
    }

    m=t.match(/^ตัวตนข้างในและภาพที่แสดงออกไปในทิศทางเดียวกันอย่างชัดเจน คือ (.+?) จึงเป็นคนที่คนรอบตัวอ่านบุคลิกได้ค่อนข้างตรง$/);

    if(m){
      return (
        `โดยพื้นฐานคุณมีลักษณะ${m[1]} `+
        'และสิ่งที่คิดกับสิ่งที่แสดงออกมักไปในทิศทางเดียวกัน คนรอบตัวจึงเข้าใจท่าทีของคุณได้ค่อนข้างง่าย'
      );
    }
  }

  if(domain==='money'){
    t=t.replace(
      /^ด้านการหาเงินเด่นจากดาว[^:]+:\s*/,
      'ด้านการหาเงิน '
    );

    t=t.replace(
      /ส่วนการเก็บและสร้างฐานทรัพย์อยู่ใต้อิทธิพลดาว[^:]+:\s*/,
      'ส่วนการเก็บและสร้างฐานทรัพย์ '
    );

    t=t.replace(
      /^กระแสรายได้และวิธีสะสมทรัพย์ถูกขับด้วยดาว.+?เหมือนกัน จึงมีรูปแบบการเงินค่อนข้างชัด:\s*/,
      'รูปแบบการเงินค่อนข้างชัด โดย '
    );
  }

  if(domain==='partner'){
    t=t.replace(
      /^เรือนปัตนิได้ดาว\S+\s+จึงให้ภาพคู่ครองหรือหุ้นส่วนว่า\s*/,
      'ในเรื่องคู่ครองหรือหุ้นส่วน '
    );

    t=t.replace(
      /ในการทำงานร่วมกัน คนลักษณะ\s*/,
      'เมื่อใช้ชีวิตหรือทำงานร่วมกัน คนที่มีลักษณะ'
    );
  }

  return t;
}

function customerPolishText(text){
  let t=String(text||'').trim();
  if(!t)return null;

  t=t.replace(
    /^โดยพื้นฐานคุณมีลักษณะ/,
    'โดยพื้นฐานคุณเป็นคน'
  );

  t=t.replace(
    /^โดยพื้นฐานคุณมีด้าน/,
    'โดยพื้นฐานคุณเป็นคน'
  );

  t=t.replace(
    /คุณยังมีด้านของ(.+?)อยู่ด้วย จึงสามารถปรับวิธีคิดและการวางตัวให้เหมาะกับสถานการณ์ได้มากกว่าการใช้ลักษณะเดิมเพียงด้านเดียว/g,
    'นอกจากนี้ $1ยังเป็นอีกด้านหนึ่งของคุณ จึงช่วยให้ปรับวิธีคิดและการวางตัวให้เหมาะกับสถานการณ์ได้ดีขึ้น'
  );

  t=t.replace(
    /^ด้านการหาเงิน\s+(.+?)\s+ส่วนการเก็บและสร้างฐานทรัพย์\s+(.+?)\s+การเงินจึงดีเมื่อแยก “วิธีหารายได้” ออกจาก “วิธีรักษาทรัพย์” ให้ชัด$/,
    (_,a,b)=>{
      const clean=x=>String(x)
        .replace(/^(ทรัพย์จาก|เงินจาก|รายได้จาก)\s*/,'')
        .trim();

      return (
        `ด้านรายได้ คุณเด่นจาก${clean(a)} `+
        `ขณะที่การสร้างฐานทรัพย์อาศัย${clean(b)} `+
        'การแยกเงินที่ใช้สร้างรายได้ออกจากเงินที่ต้องรักษาไว้ช่วยให้วางแผนการเงินได้ชัดขึ้น'
      );
    }
  );

  t=t.replace(
    /^ในเรื่องคู่ครองหรือหุ้นส่วน\s+(.+?)\s+เมื่อใช้ชีวิตหรือทำงานร่วมกัน\s+คนที่มีลักษณะ.+?\s+มักมีบทบาทกับชีวิต\s+และความสัมพันธ์จะเดินได้ดีเมื่อใช้จุดแข็งด้าน\s+(.+)$/,
    (_,a,b)=>
      `คุณมักให้คุณค่ากับคู่ครองหรือหุ้นส่วนที่${String(a).trim()} `+
      `ความสัมพันธ์จะเดินได้ดีเมื่อทั้งสองฝ่ายใช้${String(b).trim()}ให้เป็นประโยชน์ต่อการตัดสินใจร่วมกัน`
  );

  t=t.replace(
    /^ในเรื่องคู่ครองหรือหุ้นส่วน\s+คู่หรือหุ้นส่วนมัก(.+?)\s+เมื่อใช้ชีวิตหรือทำงานร่วมกัน\s+คนที่มีลักษณะ.+?\s+มักมีบทบาทกับชีวิต\s+และความสัมพันธ์จะเดินได้ดีเมื่อใช้จุดแข็งด้าน\s+(.+)$/,
    (_,a,b)=>
      `คุณมักให้คุณค่ากับคู่ครองหรือหุ้นส่วนที่${String(a).trim()} `+
      `ความสัมพันธ์จะเดินได้ดีเมื่อทั้งสองฝ่ายใช้${String(b).trim()}ให้เป็นประโยชน์ต่อการตัดสินใจร่วมกัน`
  );

  t=t.replace(
    'การเติบโต การเดินทางไกล และแรงสนับสนุนจากผู้มีประสบการณ์มีส่วนต่อรูปแบบความสัมพันธ์และการตัดสินใจร่วมกัน',
    'ความสัมพันธ์มักพัฒนาได้ดีเมื่อทั้งสองฝ่ายได้เรียนรู้หรือเปิดประสบการณ์ใหม่ร่วมกัน การเดินทางหรือคำแนะนำจากคนที่มีประสบการณ์อาจช่วยให้มองอนาคตร่วมกันชัดขึ้น'
  );

  t=t.replace(
    'ค่าใช้จ่าย เรื่องเบื้องหลัง และเหตุที่คาดเดาได้ยากมีส่วนต่อรูปแบบความสัมพันธ์และการตัดสินใจร่วมกัน',
    'เรื่องค่าใช้จ่ายหรือสิ่งที่ยังไม่ได้พูดกันตรง ๆ อาจกระทบการตัดสินใจร่วม การคุยให้ชัดก่อนตัดสินใจช่วยลดความกังวลที่ไม่จำเป็น'
  );

  t=t.replace(
    /^(.+?)มีส่วนต่อรูปแบบความสัมพันธ์และการตัดสินใจร่วมกัน$/,
    (_,x)=>`${String(x).trim()}เป็นเรื่องที่ควรคุยให้ชัดเมื่อต้องตัดสินใจร่วมกัน`
  );

  if(
    t.includes(
      'เมื่อจุดเด่นของทั้งสองฝ่ายทำงานพร้อมกัน ความสัมพันธ์หรือการร่วมมือมีแนวโน้มมีน้ำหนักมากขึ้น'
    )
  ){
    return null;
  }

  t=t.replace(
    'เมื่อมีขอบเขตทางอารมณ์ที่ชัด คุณจะใช้ความเข้าใจนี้ได้โดยไม่เหนื่อยเกินไป',
    'เมื่อรู้ว่าเรื่องไหนควรช่วยและเรื่องไหนควรให้อีกฝ่ายตัดสินใจเอง คุณจะดูแลความสัมพันธ์ได้โดยไม่รับภาระมากเกินไป'
  );

  t=t.replace(/คนที่มีลักษณะคนที่/g,'คนที่');
  t=t.replace(/คนที่มีลักษณะมารดา ผู้หญิง ผู้ดูแล คนอ่อนไหว/g,'คนที่อ่อนโยน ดูแลคนรอบตัวเก่ง และใส่ใจความรู้สึก');
  t=t.replace(/คนที่มีลักษณะครู ผู้ใหญ่ นักวิชาการ ที่ปรึกษา ผู้ทรงศีล/g,'คนที่มีวุฒิภาวะ มีความรู้ และให้คำแนะนำได้');


  // V2284_2_LIFE_LANGUAGE_FIX
  // Translate residual graph/house wording into customer-facing life language.

  t=t.replace(
    'ภาพรวมและการประคองชีวิตมีส่วนต่อวิธีคิด ความรู้สึก และการตัดสินใจของคุณ',
    'จังหวะชีวิตโดยรวมมีผลต่อวิธีคิดและการตัดสินใจของคุณ โดยเฉพาะช่วงที่มีหลายเรื่องต้องจัดการพร้อมกัน'
  );

  t=t.replace(
    'ภาพรวมและการประคองชีวิตมีส่วนต่อความรู้สึกมั่นคงและรูปแบบการใช้ชีวิตของคุณ',
    'ความเป็นอยู่โดยรวมมีผลต่อความรู้สึกมั่นคงของคุณ การจัดจังหวะชีวิตให้ไม่เร่งเกินไปช่วยให้บ้านเป็นพื้นที่พักได้จริง'
  );

  t=t.replace(
    'ภาพรวมและการประคองชีวิตมีส่วนต่อวิธีหา ใช้ หรือรักษาทรัพย์ของคุณ',
    'จังหวะชีวิตและภาระโดยรวมมีผลต่อวิธีใช้และเก็บเงิน การกันเงินสำรองไว้ช่วยให้วางแผนได้ยืดหยุ่นขึ้น'
  );

  t=t.replace(
    'ผู้ใหญ่ฝ่ายหญิง การดูแล และแรงสนับสนุนมีส่วนต่อวิธีคิด ความรู้สึก และการตัดสินใจของคุณ',
    'การได้รับความเข้าใจและแรงสนับสนุนจากคนใกล้ตัวช่วยให้คุณตัดสินใจได้มั่นคงขึ้น'
  );

  t=t.replace(
    'เงินออม ทรัพย์ และฐานะมีส่วนต่อวิธีคิด ความรู้สึก และการตัดสินใจของคุณ',
    'ความมั่นคงด้านเงินและทรัพย์มีผลต่อความสบายใจในการตัดสินใจเรื่องสำคัญของคุณ'
  );

  t=t.replace(
    'ตัวตน ทิศทางชีวิต และสิ่งที่เป็นของตนมีส่วนต่อวิธีคิด ความรู้สึก และการตัดสินใจของคุณ',
    'เรื่องที่เกี่ยวกับตัวคุณและทิศทางชีวิตมักอยู่ในความคิดค่อนข้างมาก การเห็นเป้าหมายของตนชัดช่วยให้ตัดสินใจง่ายขึ้น'
  );

  t=t.replace(
    /สภาพแวดล้อมที่เหมาะกับคุณมักเป็นแบบที่ชอบสภาพแวดล้อมที่/g,
    'สภาพแวดล้อมที่เหมาะกับคุณมักเป็นแบบที่'
  );

  t=t.replace(
    'รูปแบบการเงินค่อนข้างชัด โดย รายได้จาก',
    'รูปแบบการเงินของคุณค่อนข้างชัด โดยรายได้เด่นจาก'
  );

  t=t.replace(
    /^ในเรื่องเงิน คุณมีทั้ง(.+?) และ(.+?) ช่วยกำหนดวิธีมองโอกาสและวางแผนทรัพย์ จึงเหมาะกับการใช้ความยืดหยุ่นในปัจจุบันควบคู่กับการรักษาฐานระยะยาว$/,
    (_,a,b)=>
      `เรื่องเงินของคุณได้ทั้ง${String(a).trim()}และ${String(b).trim()}เข้ามาช่วย `+
      'จึงเหมาะกับการมองโอกาสในปัจจุบันควบคู่กับการรักษาฐานระยะยาว'
  );

  t=t.replace(
    /^อีกด้านหนึ่ง คุณมี(.+?)ช่วยในการรับรู้สถานการณ์ ทำให้มองเรื่องเดียวได้มากกว่าหนึ่งมุมก่อนตัดสินใจ$/,
    (_,x)=>
      `อีกด้านหนึ่ง ${String(x).trim()}ช่วยให้คุณมองสถานการณ์ได้มากกว่าหนึ่งมุมก่อนตัดสินใจ`
  );

  return t.trim()||null;
}

function paragraphKey(text){
  return String(text||'')
    .replace(/\s+/g,' ')
    .replace(/[.!?。！？]+$/g,'')
    .trim();
}

function pushUnique(out,seen,text,key){
  if(!text)return;

  text=customerPolishText(text);
  if(!text)return;

  const k=key||paragraphKey(text);
  if(!k||seen.has(k))return;

  seen.add(k);
  out.push(text);
}

function combinedMoneyModifierText(items){
  const meanings=[];

  for(const b of items||[]){
    const m=publicModifierMeaning(b);
    if(m&&!meanings.includes(m))meanings.push(m);
  }

  if(!meanings.length)return null;

  if(meanings.length===1){
    return (
      `ในเรื่องเงิน ${meanings[0]}มีส่วนช่วยกำหนดวิธีมองโอกาสและวางแผนทรัพย์ `+
      'จึงเหมาะกับการใช้จุดแข็งนี้ควบคู่กับการรักษาฐานระยะยาว'
    );
  }

  return (
    `ในเรื่องเงิน คุณมีทั้ง${meanings[0]} และ${meanings[1]} `+
    'ช่วยกำหนดวิธีมองโอกาสและวางแผนทรัพย์ '+
    'จึงเหมาะกับการใช้ความยืดหยุ่นในปัจจุบันควบคู่กับการรักษาฐานระยะยาว'
  );
}

function genericNarrative(signature,legacy){
  const out=[],seen=new Set();

  if(legacy&&legacy.text){
    pushUnique(
      out,
      seen,
      naturalizeLegacyText(signature.domain,legacy.text),
      'LEGACY:TEXT'
    );
  }

  const b4Seen=new Set();
  const b4Items=[];

  for(const b of signature.base4Modifiers){
    const k=modifierSemanticKey(b);
    if(b4Seen.has(k))continue;

    b4Seen.add(k);
    b4Items.push(b);

    if(b4Items.length>=2)break;
  }

  if(signature.domain==='money'){
    pushUnique(
      out,
      seen,
      combinedMoneyModifierText(b4Items),
      'B4:MONEY:COMBINED'
    );
  }else{
    for(const b of b4Items){
      pushUnique(
        out,
        seen,
        modifierText(signature.domain,b),
        'B4:'+modifierSemanticKey(b)
      );
    }
  }

  const linkSeen=new Set();

  for(const l of signature.samePlanetLinks){
    const k=`${l.claimValue||l.house}`;

    if(linkSeen.has(k))continue;

    linkSeen.add(k);

    pushUnique(
      out,
      seen,
      linkText(signature.domain,l),
      'LINK:'+k
    );

    if(linkSeen.size>=2)break;
  }

  let pairCount=0;

  for(const p of signature.pairRelationships){
    const t=pairText(signature.domain,p);
    if(!t)continue;

    const k=
      `${pairKey(p.planets[0],p.planets[1])}:`+
      `${(p.types||[]).slice().sort().join('+')}`;

    pushUnique(
      out,
      seen,
      t,
      'PAIRTXT:'+paragraphKey(t)
    );

    pairCount++;

    if(pairCount>=2)break;
  }

  if(legacy&&legacy.note){
    pushUnique(
      out,
      seen,
      positiveGuidance(signature.domain,legacy.note),
      'GUIDANCE'
    );
  }

  return out;
}
function composeAll(facts,legacyItems=[]){
  const base=baselineMap(legacyItems),domains={};
  for(const key of ['identity','speech','mind','home','money','partner']){
    const signature=buildSignature(facts,key);
    if(!signature.ok)return freeze({ok:false,reason:`${key}:${signature.reason}`});
    domains[key]=freeze({
      ok:true,key,label:signature.label,signature,
      paragraphs:genericNarrative(signature,base[key]),
      text:genericNarrative(signature,base[key]).join('\n\n')
    });
  }
  const work=A.composeCareer(facts);
  if(!work.ok)return freeze({ok:false,reason:'work:'+work.reason});
  domains.work=freeze({ok:true,key:'work',label:'การงาน',signature:work.signature,paragraphs:work.paragraphs,text:work.text});
  const ordered=['identity','speech','mind','home','work','money','partner'];
  return freeze({
    ok:true,version:VERSION,ordered,domains,
    fullSignatureKey:ordered.map(k=>`${k}=${domains[k].signature.signatureKey}`).join('||'),
    timingUsed:false,transitUsed:false,aiRuntimeRequired:false,productionCutover:false
  });
}
function validate(){
  const errors=[];
  if(!E||!S||!A)errors.push('dependency');
  const f=E.resolvePolicy({domain:'finance'}),l=E.resolvePolicy({domain:'love'});
  if(!f||f.verification!=='LEGACY_PROVISIONAL')errors.push('finance-policy');
  if(!l||l.verification!=='LEGACY_PROVISIONAL')errors.push('love-policy');
  if(PRODUCTION_CUTOVER!==false)errors.push('cutover');
  return {ok:errors.length===0,errors};
}

const API=freeze({VERSION,PRODUCTION_CUTOVER,CONFIG,buildSignature,composeAll,validate});
root.HorajarnFullNatalRelationshipV228=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
