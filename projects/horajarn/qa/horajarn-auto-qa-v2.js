'use strict';

const fs=require('fs');
const path=require('path');
const {performance}=require('perf_hooks');

const F=require('../v2/full-natal-relationship-v2.js');
const K4=require('../v2/knowledge-base4-owner-v2.js');

const VERSION='1.0.0-horajarn-auto-qa';
const EXPECTED_DOMAINS=[
  'identity','speech','mind','home','work','money','partner'
];

const HOUSES=[
  'อัตตะ','หินะ','ธนัง','ปิตา','มาตา','โภคา','มัชฌิมา',
  'ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ',
  'มรณะ','ศุภะ','กัมมะ','ลาภะ','พยายะ','ทาสา','ทาสี'
];

const PLANET={
  1:{
    name:'อาทิตย์',
    traits:'มั่นใจ ชัดเจน มีภาวะผู้นำ และกล้ารับผิดชอบ',
    speech:'พูดตรง ชัด และสรุปประเด็นได้เร็ว',
    mind:'ให้ความสำคัญกับศักดิ์ศรีและการยืนด้วยตัวเอง',
    home:'ชอบสภาพแวดล้อมที่เป็นระเบียบและมีพื้นที่ส่วนตัว',
    money:'รายได้จากบทบาทรับผิดชอบ การบริหาร หรือการตัดสินใจ',
    partner:'มีความเป็นผู้นำและต้องการพื้นที่ตัดสินใจของตน',
    people:'คนที่ชัดเจน กล้ารับผิดชอบ และตัดสินใจได้',
    caution:'ดื้อ ทิฐิ ความรีบตัดสินหรือแบกศักดิ์ศรีมากเกินไป'
  },
  2:{
    name:'จันทร์',
    traits:'อ่อนโยน ละเอียด และเข้าใจความรู้สึกของคน',
    speech:'สื่อสารนุ่มนวล รับฟังเก่ง และคำนึงถึงความรู้สึก',
    mind:'รับบรรยากาศและความรู้สึกของคนรอบตัวได้ไว',
    home:'ชอบบ้านที่สงบ อบอุ่น และมีความเป็นส่วนตัว',
    money:'รายได้ที่สัมพันธ์กับการดูแล บริการ หรือความต้องการของผู้คน',
    partner:'อ่อนโยน ใส่ใจครอบครัว และต้องการความมั่นคงทางใจ',
    people:'คนที่อ่อนโยน ดูแลคนรอบตัวเก่ง และใส่ใจความรู้สึก',
    caution:'อารมณ์แปรปรวน ลังเล หรือรับภาระความรู้สึกคนอื่นมากเกินไป'
  },
  3:{
    name:'อังคาร',
    traits:'กล้า เร็ว ตรง ลงมือจริง และแก้ปัญหาเฉพาะหน้าได้ดี',
    speech:'พูดตรง รวดเร็ว และมุ่งแก้ปัญหา',
    mind:'ตัดสินใจเร็วและพร้อมรับแรงกดดัน',
    home:'ชอบสภาพแวดล้อมที่มีกิจกรรมและได้ลงมือ',
    money:'รายได้จากการลงมือจริง งานภาคสนาม เทคนิค หรือการแก้ปัญหา',
    partner:'ขยัน กล้าตัดสินใจ และมีพลังในการลงมือ',
    people:'คนที่กระตือรือร้น กล้าลงมือ และรับมือปัญหาได้',
    caution:'ใจร้อน ปะทะ เสี่ยงอุบัติเหตุหรือหักโหม'
  },
  4:{
    name:'พุธ',
    traits:'คิดไว ปรับตัวเก่ง สื่อสารและเชื่อมข้อมูลได้ดี',
    speech:'อธิบาย เจรจา และเชื่อมข้อมูลได้คล่อง',
    mind:'ช่างคิด วิเคราะห์หลายทาง และต้องการข้อมูล',
    home:'ชอบสภาพแวดล้อมที่เดินทางและติดต่อสะดวก',
    money:'เงินจากการค้า การเจรจา ข้อมูล การเชื่อมคนและหลายช่องทาง',
    partner:'สื่อสารเก่ง คล่องตัว และให้ความสำคัญกับความชัดเจน',
    people:'คนที่คิดไว สื่อสารคล่อง และปรับตัวเก่ง',
    caution:'คิดมาก เปลี่ยนเร็ว พูดเร็ว หรือข้อมูลคลาดเคลื่อน'
  },
  5:{
    name:'พฤหัสบดี',
    traits:'มีเหตุผล รักความรู้ หลักการ คุณธรรม และการถ่ายทอด',
    speech:'พูดมีหลัก มีเหตุผล และอธิบายเป็นระบบ',
    mind:'ยึดหลัก เหตุผล และต้องการทำสิ่งที่เห็นว่าถูกต้อง',
    home:'ชอบสภาพแวดล้อมที่สงบ เป็นระเบียบ และเอื้อต่อการเรียนรู้',
    money:'รายได้จากความรู้ คำปรึกษา การสอน หรือความน่าเชื่อถือ',
    partner:'มีความรู้ เป็นผู้ใหญ่ มีหลักการ และให้คำปรึกษาได้',
    people:'คนที่มีความรู้ มีหลักการ และให้คำแนะนำได้',
    caution:'ยึดหลักมากไป ช้าเพราะคิดรอบคอบ หรือมั่นใจความรู้ตนเองเกินไป'
  },
  6:{
    name:'ศุกร์',
    traits:'รักความสวยงาม ความสัมพันธ์ ศิลปะ ความสบายและคุณค่า',
    speech:'พูดมีเสน่ห์ รู้จังหวะ และสร้างบรรยากาศที่ดี',
    mind:'ให้ความสำคัญกับความกลมกลืน ความสวยงาม และความสัมพันธ์',
    home:'ชอบสภาพแวดล้อมที่สวย สะอาด และให้ความรู้สึกผ่อนคลาย',
    money:'รายได้จากการขาย บริการ ความงาม ศิลปะ ความสัมพันธ์ หรือการสร้างคุณค่า',
    partner:'มีเสน่ห์ รสนิยมดี และให้ความสำคัญกับความสัมพันธ์',
    people:'คนที่ประสานงานเก่ง สร้างคุณค่า และเข้าใจความต้องการของคน',
    caution:'ฟุ่มเฟือย ตามใจตัวเอง เรื่องรักซับซ้อนหรือใช้เงินเพื่อความสุขมากไป'
  },
  7:{
    name:'เสาร์',
    traits:'อดทน จริงจัง รอบคอบ รับผิดชอบ และมองผลระยะยาว',
    speech:'พูดน้อยแต่จริงจังและให้ความสำคัญกับข้อมูลที่แน่ชัด',
    mind:'อดทน รับผิดชอบสูง และคิดถึงผลระยะยาว',
    home:'ชอบสภาพแวดล้อมที่มั่นคง ดูแลง่าย และใช้ได้ระยะยาว',
    money:'ทรัพย์จากความอดทน สะสมระยะยาว ที่ดินหรือสินทรัพย์จริง',
    partner:'จริงจัง อดทน มีความรับผิดชอบ และมองระยะยาว',
    people:'คนที่อดทน รอบคอบ และรักษาความต่อเนื่องได้',
    caution:'ช้า กดดัน เหนื่อยสะสม มองโลกหนักหรือรับภาระเกินส่วน'
  }
};

function normalize(s){
  return String(s||'')
    .replace(/\s+/g,' ')
    .replace(/[“”"'`]/g,'')
    .trim();
}

function compact(s){
  return normalize(s)
    .replace(/[.,!?;:()[\]{}\-–—•/\\]/g,'')
    .replace(/\s+/g,'');
}

function charNgrams(s,n=4){
  const x=compact(s);
  const out=new Set();
  for(let i=0;i<=x.length-n;i++)out.add(x.slice(i,i+n));
  return out;
}

function jaccard(a,b){
  const A=charNgrams(a),B=charNgrams(b);
  if(!A.size||!B.size)return 0;
  let hit=0;
  for(const x of A)if(B.has(x))hit++;
  return hit/(A.size+B.size-hit);
}

function prefixKey(s,n=24){
  return compact(s).slice(0,n);
}

function pairKey(a,b){
  return [Number(a),Number(b)].sort((x,y)=>x-y).join('-');
}

function factMap(facts){
  const m={};
  for(const r of facts.records)m[r.name]=Number(r.num);
  return m;
}

function legacyItems(facts){
  const m=factMap(facts);

  const a=PLANET[m['อัตตะ']];
  const t=PLANET[m['ตนุ']];
  const sp=PLANET[facts.records[3].num];
  const mi=PLANET[facts.records[10].num];
  const ho=PLANET[facts.records[17].num];
  const cash=PLANET[m['ธนัง']];
  const asset=PLANET[m['กดุมภะ']];
  const partner=PLANET[m['ปัตนิ']];

  const identityText=
    m['อัตตะ']===m['ตนุ']
      ? `ตัวตนข้างในและภาพที่แสดงออกไปในทิศทางเดียวกันอย่างชัดเจน คือ ${a.traits} จึงเป็นคนที่คนรอบตัวอ่านบุคลิกได้ค่อนข้างตรง`
      : `แกนในมีลักษณะ ${a.traits} ขณะที่ภาพที่คนอื่นพบเห็นมีด้าน ${t.traits} จึงเป็นคนที่มีทั้งสองมิติและจะเด่นต่างกันตามสถานการณ์`;

  const moneyText=
    m['ธนัง']===m['กดุมภะ']
      ? `กระแสรายได้และวิธีสะสมทรัพย์ถูกขับด้วยดาว${cash.name}เหมือนกัน จึงมีรูปแบบการเงินค่อนข้างชัด: ${cash.money} เมื่อใช้จุดแข็งนี้ต่อเนื่องมีโอกาสสร้างฐานทรัพย์ได้เป็นระบบ`
      : `ด้านการหาเงินเด่นจากดาว${cash.name}: ${cash.money} ส่วนการเก็บและสร้างฐานทรัพย์อยู่ใต้อิทธิพลดาว${asset.name}: ${asset.money} การเงินจึงดีเมื่อแยก “วิธีหารายได้” ออกจาก “วิธีรักษาทรัพย์” ให้ชัด`;

  return [
    {
      key:'identity',
      text:identityText,
      note:`จุดที่ควรบริหาร: ${a.caution}${m['อัตตะ']!==m['ตนุ']?` และ ${t.caution}`:''}`
    },
    {
      key:'speech',
      text:`คุณมีแนวทางการสื่อสารที่${sp.speech} และเหมาะกับสถานการณ์ที่ต้องใช้จุดเด่นนี้`,
      note:`ข้อควรระวังด้านคำพูด: ${sp.caution}`
    },
    {
      key:'mind',
      text:`โดยธรรมชาติคุณ${mi.mind}`,
      note:`เมื่อตึงเครียดควรระวังด้าน ${mi.caution}`
    },
    {
      key:'home',
      text:`สภาพแวดล้อมที่เหมาะกับคุณมักเป็นแบบที่${ho.home}`,
      note:'ความหมายนี้ใช้ดู “ลักษณะสภาพแวดล้อมที่สอดคล้องกับดวง” ไม่ใช่ระบุที่อยู่จริง'
    },
    {
      key:'money',
      text:moneyText,
      note:`ควรระวัง ${cash.caution}${m['ธนัง']!==m['กดุมภะ']?` และเรื่องการสะสมทรัพย์ควรระวัง ${asset.caution}`:''}`
    },
    {
      key:'partner',
      text:`เรือนปัตนิได้ดาว${partner.name} จึงให้ภาพคู่ครองหรือหุ้นส่วนว่า ${partner.partner} ในการทำงานร่วมกัน คนลักษณะ ${partner.people} มักมีบทบาทกับชีวิต และความสัมพันธ์จะเดินได้ดีเมื่อใช้จุดแข็งด้าน ${partner.traits}`,
      note:`สิ่งที่ต้องบริหารร่วมกัน: ${partner.caution}`
    }
  ];
}

function recordsFromValues(values){
  return {
    records:HOUSES.map((name,i)=>({
      name,
      num:Number(values[i]),
      base:Math.floor(i/7)+1,
      col:i%7
    }))
  };
}

function tripleForSum(target){
  for(let a=1;a<=7;a++)
    for(let b=1;b<=7;b++)
      for(let c=1;c<=7;c++)
        if(a+b+c===target)return [a,b,c];
  throw new Error('NO_TRIPLE_FOR_SUM_'+target);
}

function targetBase4Scenario(target){
  const t=tripleForSum(target);
  const v=new Array(21);
  for(let col=0;col<7;col++){
    v[col]=t[(col+0)%3];
    v[7+col]=t[(col+1)%3];
    v[14+col]=t[(col+2)%3];
  }
  return {
    id:`B4-${target}`,
    kind:'BASE4_TARGET',
    facts:recordsFromValues(v)
  };
}

function rng(seed){
  let x=seed>>>0;
  return ()=>{
    x=(Math.imul(x,1664525)+1013904223)>>>0;
    return x/4294967296;
  };
}

function randomScenario(seed){
  const r=rng(seed);
  const v=Array.from({length:21},()=>1+Math.floor(r()*7));
  return {
    id:`RND-${String(seed).padStart(3,'0')}`,
    kind:'SEEDED_RANDOM',
    facts:recordsFromValues(v)
  };
}

function specialScenario(id,changes){
  const r=rng(9000+id.length);
  const v=Array.from({length:21},()=>1+Math.floor(r()*7));
  const index=Object.fromEntries(HOUSES.map((x,i)=>[x,i]));
  for(const [house,n] of Object.entries(changes))v[index[house]]=n;
  return {id,kind:'PAIR_TARGET',facts:recordsFromValues(v)};
}

function buildScenarios(){
  const out=[];

  for(let n=3;n<=21;n++)out.push(targetBase4Scenario(n));

  for(let seed=1;seed<=75;seed++)out.push(randomScenario(seed));

  out.push(
    specialScenario('PAIR-4-8-CAREER',{
      'ธนัง':3,'สหัชชะ':5,'กัมมะ':4
    }),
    specialScenario('PAIR-1-3-IDENTITY',{
      'อัตตะ':1,'ตนุ':3
    }),
    specialScenario('PAIR-6-7-FINANCE',{
      'ธนัง':6,'กดุมภะ':7
    }),
    specialScenario('PAIR-2-5-CONFLICT',{
      'อัตตะ':2,'ตนุ':5
    }),
    specialScenario('PAIR-3-6-FRIEND',{
      'อัตตะ':3,'ตนุ':6
    }),
    specialScenario('PAIR-1-6-EQUAL',{
      'อัตตะ':1,'ตนุ':6
    })
  );

  if(out.length!==100)
    throw new Error('SCENARIO_COUNT_'+out.length);

  return out;
}

const HARD_BANNED=[
  'แกนเด่นที่',
  'แรงประกอบ',
  'คุณยังมีด้านของ',
  'มีส่วนต่อรูปแบบความสัมพันธ์',
  'มีแนวโน้มมีน้ำหนักมากขึ้น',
  'ขอบเขตทางอารมณ์',
  'คนที่มีลักษณะมารดา',
  'คนที่มีลักษณะครู',
  'ภาพรวมและการประคองชีวิตมีส่วนต่อ',
  'ด้านการหาเงิน ทรัพย์จาก',
  'แกนใน',
  'ลักษณะเดียวกันยังเชื่อมกับ',
  'รูปแบบการเงินนี้ยังเชื่อมกับ',
  'รูปแบบความสัมพันธ์นี้ยังเชื่อมกับ',
  'จุดที่ควรบริหาร',
  'ข้อควรระวัง',
  'สิ่งที่ต้องบริหาร',
  'แรงประกอบด้าน',
  'เข้ามาปรับน้ำหนัก',
  'การแสดงออกไม่จำเป็นต้องมีเพียงด้านเดียว',
  'สิ่งศักดิ์สิทธิ์',
  'พลังเหนือสามัญ',
  'ความพ่ายแพ้',
  'เรือนปัตนิได้ดาว',
  'ด้านการหาเงินเด่นจากดาว',
  'อยู่ใต้อิทธิพลดาว',
  'OWNER_VERIFIED',
  'LEGACY_PROVISIONAL',
  'PRIMARY',
  'SUPPORT',
  'signatureKey',
  'knowledgeId',
  'Base4',
  'BASE4'
];

const TONE_BANNED=[
  'สิ่งที่ควรระวังคือ',
  'ควรระวัง ',
  'จุดที่ต้องระวัง',
  'ต้องบริหารให้ดี'
];

const RAW_ASTRO_BANNED=[
  'อัตตะ',
  'กดุมภะ',
  'กดุมพะ',
  'กัมมะ',
  'ทาสา',
  'ทาสี',
  'ปัตนิ',
  'พยายะ',
  'คู่ศัตรู',
  'คู่มิตร',
  'คู่ธาตุ',
  'คู่สมพล'
];

const DOMAIN_BANNED={
  money:[
    'บุคลิก',
    'การแสดงออก',
    'มารดา ผู้หญิง ผู้ดูแล'
  ],
  partner:[
    'มารดา ผู้หญิง ผู้ดูแล',
    'บิดา ผู้ใหญ่ชาย และที่พึ่งภายนอก',
    'มารดา ผู้ใหญ่หญิง และที่พึ่งภายใน'
  ]
};

function issue(list,severity,scenario,domain,rule,detail,text){
  list.push({
    severity,
    scenario:scenario.id,
    kind:scenario.kind,
    domain,
    rule,
    detail,
    text:text?String(text).slice(0,500):null
  });
}

function signatureParts(sig){
  const pairs=[];
  const b4=[];
  const links=[];

  if(Array.isArray(sig.pairRelationships))pairs.push(...sig.pairRelationships);
  if(Array.isArray(sig.pairs))pairs.push(...sig.pairs);

  if(Array.isArray(sig.base4Modifiers))b4.push(...sig.base4Modifiers);
  if(sig.base4)b4.push(sig.base4);

  if(Array.isArray(sig.samePlanetLinks))links.push(...sig.samePlanetLinks);
  if(Array.isArray(sig.samePlanet))links.push(...sig.samePlanet);

  return {pairs,b4,links};
}

function pairTypesFrom(sig){
  const out=[];
  const {pairs,b4}=signatureParts(sig);

  for(const p of pairs){
    if(Array.isArray(p.types))out.push(...p.types);
    if(p.type)out.push(p.type);
  }

  for(const b of b4){
    for(const p of b.pairRelationships||[]){
      if(p.type)out.push(p.type);
      if(Array.isArray(p.types))out.push(...p.types);
    }
  }

  return out;
}

function base4ValuesFrom(sig){
  const {b4}=signatureParts(sig);
  return b4.map(x=>Number(x.value)).filter(Number.isFinite);
}

function sourceRefs(sig){
  if(sig.provenance&&Array.isArray(sig.provenance.sourceRefs))
    return sig.provenance.sourceRefs;
  if(sig.trace&&Array.isArray(sig.trace.sourceRefs))
    return sig.trace.sourceRefs;
  return [];
}

function publicText(result){
  return EXPECTED_DOMAINS.map(k=>result.domains[k].text).join('\n\n');
}

function checkParagraphs(issues,scenario,domain,d){
  const paras=(d.paragraphs||[])
    .map(normalize)
    .filter(Boolean);

  const exact=new Map();

  for(const p of paras){
    const k=compact(p);
    if(exact.has(k)){
      issue(
        issues,'FAIL',scenario,domain,
        'DUPLICATE_PARAGRAPH',
        'พบย่อหน้าซ้ำตรงกัน',
        p
      );
    }
    exact.set(k,true);
  }

  const prefixes=new Map();

  for(const p of paras){
    if(compact(p).length<40)continue;
    const k=prefixKey(p,24);
    if(prefixes.has(k)){
      issue(
        issues,'FAIL',scenario,domain,
        'REPEATED_PARAGRAPH_OPENING',
        `ย่อหน้าเริ่มด้วยโครงเดียวกัน: ${k}`,
        p
      );
    }
    prefixes.set(k,true);
  }

  for(let i=0;i<paras.length;i++){
    for(let j=i+1;j<paras.length;j++){
      if(compact(paras[i]).length<70||compact(paras[j]).length<70)continue;
      const sim=jaccard(paras[i],paras[j]);
      if(sim>=0.88){
        issue(
          issues,'FAIL',scenario,domain,
          'NEAR_DUPLICATE_PARAGRAPH',
          `similarity=${sim.toFixed(3)}`,
          paras[i]+' || '+paras[j]
        );
      }
    }
  }
}

function checkLanguage(issues,scenario,domain,text){
  for(const bad of HARD_BANNED){
    if(text.includes(bad)){
      issue(
        issues,'FAIL',scenario,domain,
        'BANNED_SYSTEM_LANGUAGE',
        bad,
        text
      );
    }
  }

  for(const bad of TONE_BANNED){
    if(text.includes(bad)){
      issue(
        issues,'FAIL',scenario,domain,
        'NEGATIVE_SYSTEM_TONE',
        bad,
        text
      );
    }
  }

  for(const bad of RAW_ASTRO_BANNED){
    if(text.includes(bad)){
      issue(
        issues,'FAIL',scenario,domain,
        'RAW_ASTROLOGY_JARGON',
        bad,
        text
      );
    }
  }

  for(const bad of DOMAIN_BANNED[domain]||[]){
    if(text.includes(bad)){
      issue(
        issues,'FAIL',scenario,domain,
        'DOMAIN_LANGUAGE_LEAK',
        bad,
        text
      );
    }
  }
}

function checkStructural(issues,scenario,r){
  if(!r||r.ok!==true){
    issue(
      issues,'FAIL',scenario,'ALL',
      'COMPOSE_FAILED',
      r&&r.reason?r.reason:'UNKNOWN',
      null
    );
    return;
  }

  if(JSON.stringify(r.ordered)!==JSON.stringify(EXPECTED_DOMAINS)){
    issue(
      issues,'FAIL',scenario,'ALL',
      'DOMAIN_ORDER',
      JSON.stringify(r.ordered),
      null
    );
  }

  if(Object.keys(r.domains||{}).length!==7){
    issue(
      issues,'FAIL',scenario,'ALL',
      'DOMAIN_COUNT',
      String(Object.keys(r.domains||{}).length),
      null
    );
  }

  for(const [k,v] of [
    ['timingUsed',r.timingUsed],
    ['transitUsed',r.transitUsed],
    ['aiRuntimeRequired',r.aiRuntimeRequired],
    ['productionCutover',r.productionCutover]
  ]){
    if(v!==false){
      issue(
        issues,'FAIL',scenario,'ALL',
        'SAFETY_FLAG',
        `${k}=${String(v)}`,
        null
      );
    }
  }

  for(const domain of EXPECTED_DOMAINS){
    const d=r.domains[domain];

    if(!d||!d.signature||!d.signature.signatureKey){
      issue(
        issues,'FAIL',scenario,domain,
        'MISSING_SIGNATURE',
        'signatureKey missing',
        null
      );
      continue;
    }

    if(d.signature.productionCutover!==false){
      issue(
        issues,'FAIL',scenario,domain,
        'DOMAIN_CUTOVER_FLAG',
        String(d.signature.productionCutover),
        null
      );
    }

    if(sourceRefs(d.signature).length===0){
      issue(
        issues,'FAIL',scenario,domain,
        'PROVENANCE_EMPTY',
        'sourceRefs empty',
        null
      );
    }
  }

  if(r.domains.money.signature.basisVerification!=='LEGACY_PROVISIONAL'){
    issue(
      issues,'FAIL',scenario,'money',
      'FINANCE_POLICY_ESCALATION',
      String(r.domains.money.signature.basisVerification),
      null
    );
  }

  if(r.domains.partner.signature.basisVerification!=='LEGACY_PROVISIONAL'){
    issue(
      issues,'FAIL',scenario,'partner',
      'LOVE_POLICY_ESCALATION',
      String(r.domains.partner.signature.basisVerification),
      null
    );
  }
}

function run(){
  const scenarios=buildScenarios();
  const issues=[];
  const warnings=[];
  const base4Coverage=new Set();
  const pairCoverage=new Set();
  const signatureSet=new Set();
  const textSet=new Set();
  const signatureToText=new Map();
  const textToSignatures=new Map();
  const durations=[];

  let domainOutputs=0;
  let samePlanetCases=0;
  let pairConflictCases=0;

  const valid=F.validate();
  if(!valid.ok){
    issues.push({
      severity:'FAIL',
      scenario:'BOOT',
      kind:'BOOT',
      domain:'ALL',
      rule:'FULL_NATAL_VALIDATE',
      detail:JSON.stringify(valid.errors),
      text:null
    });
  }

  const k4=K4.validate();
  if(!k4.ok){
    issues.push({
      severity:'FAIL',
      scenario:'BOOT',
      kind:'BOOT',
      domain:'ALL',
      rule:'BASE4_KNOWLEDGE_VALIDATE',
      detail:JSON.stringify(k4.errors),
      text:null
    });
  }

  for(const scenario of scenarios){
    const legacy=legacyItems(scenario.facts);

    const t0=performance.now();
    let r;

    try{
      r=F.composeAll(scenario.facts,legacy);
    }catch(e){
      issue(
        issues,'FAIL',scenario,'ALL',
        'RUNTIME_EXCEPTION',
        e&&e.stack?e.stack:String(e),
        null
      );
      continue;
    }

    durations.push(performance.now()-t0);

    checkStructural(issues,scenario,r);

    if(!r||!r.ok)continue;

    const r2=F.composeAll(scenario.facts,legacy);

    if(r.fullSignatureKey!==r2.fullSignatureKey){
      issue(
        issues,'FAIL',scenario,'ALL',
        'NON_DETERMINISTIC_SIGNATURE',
        `${r.fullSignatureKey} != ${r2.fullSignatureKey}`,
        null
      );
    }

    if(publicText(r)!==publicText(r2)){
      issue(
        issues,'FAIL',scenario,'ALL',
        'NON_DETERMINISTIC_TEXT',
        'same facts produced different text',
        null
      );
    }

    signatureSet.add(r.fullSignatureKey);
    textSet.add(publicText(r));

    const old=signatureToText.get(r.fullSignatureKey);
    if(old!==undefined&&old!==publicText(r)){
      issue(
        issues,'FAIL',scenario,'ALL',
        'SIGNATURE_TEXT_DRIFT',
        'same signature mapped to different public text',
        null
      );
    }else{
      signatureToText.set(r.fullSignatureKey,publicText(r));
    }

    if(!textToSignatures.has(publicText(r)))
      textToSignatures.set(publicText(r),new Set());

    textToSignatures.get(publicText(r)).add(r.fullSignatureKey);

    for(const domain of EXPECTED_DOMAINS){
      domainOutputs++;
      const d=r.domains[domain];

      checkParagraphs(issues,scenario,domain,d);
      checkLanguage(issues,scenario,domain,d.text);

      const parts=signatureParts(d.signature);

      if(parts.links.length)samePlanetCases++;

      if(
        (d.signature.pairConflicts&&d.signature.pairConflicts.length) ||
        parts.pairs.some(x=>x.conflicted)
      )pairConflictCases++;

      for(const n of base4ValuesFrom(d.signature))
        base4Coverage.add(n);

      for(const type of pairTypesFrom(d.signature))
        pairCoverage.add(type);
    }
  }

  for(let n=3;n<=21;n++){
    if(!base4Coverage.has(n)){
      issues.push({
        severity:'FAIL',
        scenario:'COVERAGE',
        kind:'COVERAGE',
        domain:'ALL',
        rule:'BASE4_COVERAGE',
        detail:`missing=${n}`,
        text:null
      });
    }
  }

  for(const type of ['FRIEND','ENEMY','ELEMENT','EQUAL_POWER']){
    if(!pairCoverage.has(type)){
      issues.push({
        severity:'FAIL',
        scenario:'COVERAGE',
        kind:'COVERAGE',
        domain:'ALL',
        rule:'PAIR_TYPE_COVERAGE',
        detail:`missing=${type}`,
        text:null
      });
    }
  }

  if(samePlanetCases===0){
    issues.push({
      severity:'FAIL',
      scenario:'COVERAGE',
      kind:'COVERAGE',
      domain:'ALL',
      rule:'SAME_PLANET_COVERAGE',
      detail:'no same-planet relationship case',
      text:null
    });
  }

  if(pairConflictCases===0){
    issues.push({
      severity:'FAIL',
      scenario:'COVERAGE',
      kind:'COVERAGE',
      domain:'ALL',
      rule:'PAIR_CONFLICT_COVERAGE',
      detail:'no conflict case',
      text:null
    });
  }

  for(const [text,sigs] of textToSignatures.entries()){
    if(sigs.size>1){
      warnings.push({
        severity:'WARN',
        scenario:'DIVERSITY',
        kind:'DIVERSITY',
        domain:'ALL',
        rule:'DIFFERENT_SIGNATURE_SAME_TEXT',
        detail:`signatures=${sigs.size}`,
        text:text.slice(0,500)
      });
    }
  }

  const sorted=durations.slice().sort((a,b)=>a-b);
  const avg=durations.length
    ? durations.reduce((a,b)=>a+b,0)/durations.length
    : 0;
  const p95=sorted.length
    ? sorted[Math.min(sorted.length-1,Math.floor(sorted.length*0.95))]
    : 0;

  if(p95>50){
    warnings.push({
      severity:'WARN',
      scenario:'PERFORMANCE',
      kind:'PERFORMANCE',
      domain:'ALL',
      rule:'P95_COMPOSE_SLOW',
      detail:`p95=${p95.toFixed(3)}ms`,
      text:null
    });
  }

  const report={
    version:VERSION,
    generatedAt:new Date().toISOString(),
    gate:issues.length===0?'PASS':'FAIL',
    summary:{
      chartsTested:scenarios.length,
      domainsTested:domainOutputs,
      failures:issues.length,
      warnings:warnings.length,
      uniqueSignatures:signatureSet.size,
      uniquePublicTexts:textSet.size,
      base4Coverage:[...base4Coverage].sort((a,b)=>a-b),
      pairTypeCoverage:[...pairCoverage].sort(),
      samePlanetCases,
      pairConflictCases,
      performance:{
        avgMs:Number(avg.toFixed(3)),
        p95Ms:Number(p95.toFixed(3)),
        maxMs:Number((sorted[sorted.length-1]||0).toFixed(3))
      }
    },
    failures:issues,
    warnings
  };

  const args=process.argv.slice(2);
  const ix=args.indexOf('--report');

  if(ix>=0&&args[ix+1]){
    const fp=path.resolve(args[ix+1]);
    fs.mkdirSync(path.dirname(fp),{recursive:true});
    fs.writeFileSync(fp,JSON.stringify(report,null,2),'utf8');
    console.log('REPORT='+fp);
  }

  console.log('HORAJARN_AUTO_QA='+report.gate);
  console.log('CHARTS_TESTED='+report.summary.chartsTested);
  console.log('DOMAINS_TESTED='+report.summary.domainsTested);
  console.log('FAILURES='+report.summary.failures);
  console.log('WARNINGS='+report.summary.warnings);
  console.log('UNIQUE_SIGNATURES='+report.summary.uniqueSignatures);
  console.log('UNIQUE_PUBLIC_TEXTS='+report.summary.uniquePublicTexts);
  console.log('BASE4_3_21_COVERAGE='+
    (report.summary.base4Coverage.length===19?'PASS':'FAIL'));
  console.log('PAIR_TYPES_COVERAGE='+
    (report.summary.pairTypeCoverage.length===4?'PASS':'FAIL'));
  console.log('SAME_PLANET_COVERAGE='+
    (samePlanetCases>0?'PASS':'FAIL'));
  console.log('PAIR_CONFLICT_COVERAGE='+
    (pairConflictCases>0?'PASS':'FAIL'));
  console.log('DETERMINISTIC_CHECK='+
    (issues.some(x=>x.rule.startsWith('NON_DETERMINISTIC')||x.rule==='SIGNATURE_TEXT_DRIFT')?'FAIL':'PASS'));
  console.log('PROVENANCE_CHECK='+
    (issues.some(x=>x.rule==='PROVENANCE_EMPTY')?'FAIL':'PASS'));
  console.log('LANGUAGE_QA='+
    (issues.some(x=>
      [
        'BANNED_SYSTEM_LANGUAGE',
        'NEGATIVE_SYSTEM_TONE',
        'RAW_ASTROLOGY_JARGON',
        'DOMAIN_LANGUAGE_LEAK',
        'DUPLICATE_PARAGRAPH',
        'REPEATED_PARAGRAPH_OPENING',
        'NEAR_DUPLICATE_PARAGRAPH'
      ].includes(x.rule)
    )?'FAIL':'PASS'));
  console.log('AI_RUNTIME_REQUIRED=NO');
  console.log('TRANSIT_USED=NO');
  console.log('PRODUCTION_CUTOVER=NO');
  console.log('PERF_AVG_MS='+avg.toFixed(3));
  console.log('PERF_P95_MS='+p95.toFixed(3));

  if(issues.length){
    console.log('\n=== FIRST FAILURES ===');
    for(const x of issues.slice(0,30)){
      console.log(
        `[${x.rule}] ${x.scenario} / ${x.domain} :: ${x.detail}`
      );
      if(x.text)console.log('  '+normalize(x.text).slice(0,260));
    }
  }

  if(warnings.length){
    console.log('\n=== FIRST WARNINGS ===');
    for(const x of warnings.slice(0,15)){
      console.log(
        `[${x.rule}] ${x.scenario} / ${x.domain} :: ${x.detail}`
      );
    }
  }

  process.exitCode=issues.length===0?0:1;
}

run();
