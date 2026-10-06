(function(root){'use strict';

const R=typeof require!=='undefined'
  ? require('./relationship-narrative-v2.js')
  : root.HorajarnRelationshipNarrativeV226;

const B=typeof require!=='undefined'
  ? require('./knowledge-mega-batch2-v2.js')
  : root.HorajarnKnowledgeMegaBatch2V221;

const VERSION='2.26.1-natural-narrative-rc1';
const PRODUCTION_CUTOVER=false;

function freeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
  return v;
}

function uniq(a){
  return [...new Set(a)];
}

function knowledgeGuide(a){
  const methods=(B.RECORDS||[])
    .filter(x=>x.topic==='PREDICTION_METHOD');

  const matched=new Set(
    (a.examples||[]).map(x=>x.id)
  );

  const examples=(B.RECORDS||[])
    .filter(x=>
      x.topic==='PREDICTION_EXAMPLES' &&
      matched.has(x.id)
    );

  return {
    methodIds:methods.map(x=>x.id),
    principles:methods.map(x=>x.claimValue),
    exampleIds:examples.map(x=>x.id),
    exampleSignals:examples.map(x=>x.claimValue),
    sourceRefs:uniq([
      ...methods.map(x=>x.sourceId),
      ...examples.map(x=>x.sourceId)
    ])
  };
}

function linkKeys(profile){
  return new Set(
    (profile.links||[]).map(x=>x.key)
  );
}

function rolesForPlanet(a,n){
  const roles=[];

  if(Number(a.primary.planet)===Number(n))
    roles.push('PRIMARY');

  for(const x of a.supports)
    if(Number(x.planet)===Number(n))
      roles.push('SUPPORT');

  for(const x of a.contexts||[])
    if(Number(x.planet)===Number(n))
      roles.push('CONTEXT');

  for(const x of a.conditionals||[])
    if(Number(x.planet)===Number(n))
      roles.push('CONDITIONAL');

  return uniq(roles);
}

function pairNarrative(a){
  const positive=[];
  const friction=[];

  for(const p of a.pairs||[]){
    if(p.conflicted || !p.public)
      continue;

    const ra=rolesForPlanet(a,p.planets[0]);
    const rb=rolesForPlanet(a,p.planets[1]);

    const primarySupport=
      (
        ra.includes('PRIMARY') &&
        rb.includes('SUPPORT')
      ) ||
      (
        rb.includes('PRIMARY') &&
        ra.includes('SUPPORT')
      );

    const supportSupport=
      ra.includes('SUPPORT') &&
      rb.includes('SUPPORT');

    let sentence=null;

    if(primarySupport){
      if(p.types.includes('FRIEND')){
        sentence=
          'จุดแข็งของคุณกับคนช่วยบางกลุ่มมีแนวโน้มหนุนกัน '+
          'จึงทำให้งานเดินง่ายขึ้นเมื่อแบ่งบทบาทชัด';
      }

      if(p.types.includes('EQUAL_POWER')){
        sentence=
          'เมื่อความสามารถของคุณกับคนช่วยทำงานพร้อมกัน '+
          'ผลลัพธ์มีโอกาสเด่นกว่าการพยายามทำทุกอย่างคนเดียว';
      }

      if(p.types.includes('ELEMENT')){
        sentence=
          'ความสัมพันธ์กับคนช่วยบางกลุ่มมีลักษณะต่อเนื่องและพึ่งพากัน '+
          'จึงเหมาะกับการวางระบบร่วมกันระยะยาว';
      }

      if(p.types.includes('ENEMY')){
        sentence=
          'คนช่วยบางกลุ่มอาจมีจังหวะทำงานต่างจากคุณ '+
          'จึงควรตกลงหน้าที่และขอบเขตการตัดสินใจให้ชัด';
      }
    }

    if(supportSupport){
      if(p.types.includes('FRIEND')){
        sentence=
          'คนในทีมบางกลุ่มมีจุดแข็งที่ช่วยเสริมกัน '+
          'จึงควรจัดให้ทำงานต่อเนื่องกันมากกว่าทำซ้ำกัน';
      }

      if(p.types.includes('EQUAL_POWER')){
        sentence=
          'เมื่อคนสองลักษณะนี้แบ่งหน้าที่เหมาะสม '+
          'ทีมจะมีกำลังมากกว่าการให้ทุกคนทำแบบเดียวกัน';
      }

      if(p.types.includes('ELEMENT')){
        sentence=
          'คนในทีมสองลักษณะนี้มีแนวโน้มทำงานเชื่อมกันค่อนข้างมาก '+
          'จึงควรวางความรับผิดชอบให้ส่งต่องานกันได้';
      }

      if(p.types.includes('ENEMY')){
        sentence=
          'อย่างไรก็ตาม คนในทีมบางกลุ่มอาจทำงานคนละจังหวะกัน '+
          'จึงควรแบ่งหน้าที่ให้ชัดเพื่อลดการชนกันโดยไม่จำเป็น';
      }
    }

    if(!sentence)
      continue;

    if(p.types.includes('ENEMY'))
      friction.push(sentence);
    else
      positive.push(sentence);
  }

  return [
    ...uniq(positive).slice(0,1),
    ...uniq(friction).slice(0,1)
  ];
}

function opening(a,guide){
  const p=a.primaryPlanet;

  if(!p)
    return null;

  let text=
    'การงานของคุณมีแนวโน้มไปได้ดีเมื่อได้ใช้'+
    p.strength+
    ' งานที่เหมาะจึงมักเป็น'+
    p.work+
    ' มากกว่างานที่จำกัดวิธีทำงานจนใช้จุดแข็งได้ไม่เต็มที่';

  if(
    guide.exampleSignals.includes(
      'PAIR_1_6_KAMMA'
    )
  ){
    text+=
      ' เมื่อความรับผิดชอบและการสร้างคุณค่าให้ผู้อื่นเดินไปในทิศทางเดียวกัน '+
      'ภาพความก้าวหน้าของงานมีแนวโน้มชัดขึ้น';
  }

  return text;
}

function relationship(a){
  const keys=new Set(
    (a.primaryLinks||[]).map(x=>x.key)
  );

  const out=[];

  if(
    keys.has('identity') &&
    keys.has('stability')
  ){
    out.push(
      'งานกับตัวตนของคุณค่อนข้างเชื่อมกัน '+
      'เมื่อได้ทำสิ่งที่ถนัด ความมั่นใจและพลังในการเดินหน้ามักชัดขึ้น '+
      'ขณะเดียวกันผลจากงานยังโยงกับความเป็นอยู่และฐานชีวิต '+
      'จึงควรมองทั้งความเหมาะกับตัวคุณและความมั่นคงที่งานสร้างได้'
    );
  }else{
    if(keys.has('identity')){
      out.push(
        'งานกับตัวตนของคุณค่อนข้างเชื่อมกัน '+
        'เมื่อได้ใช้ความสามารถในแบบที่เป็นตัวเอง '+
        'ความมั่นใจและแรงผลักดันมักเพิ่มขึ้น'
      );
    }

    if(keys.has('stability')){
      out.push(
        'ผลจากงานมีความสัมพันธ์กับความเป็นอยู่และฐานชีวิต '+
        'จึงควรเลือกเส้นทางที่สร้างความมั่นคงได้จริงในระยะยาว'
      );
    }
  }

  if(
    keys.has('money') ||
    keys.has('gain')
  ){
    out.push(
      'ความก้าวหน้าของงานมีแนวโน้มเชื่อมกับรายได้และผลตอบแทน '+
      'ผลงานที่จับต้องได้จึงสำคัญกว่าภาพลักษณ์เพียงอย่างเดียว'
    );
  }

  if(keys.has('new_start')){
    out.push(
      'จังหวะเริ่มงานใหม่ โปรเจกต์ใหม่ หรือการสร้างสิ่งของตัวเอง '+
      'เป็นส่วนที่ควรพิจารณาอย่างจริงจัง'
    );
  }

  if(keys.has('network')){
    out.push(
      'เครือข่าย การสื่อสาร และคนที่รู้จัก '+
      'มีส่วนช่วยให้งานขยับได้มากกว่าการทำงานแบบแยกตัว'
    );
  }

  if(keys.has('partner')){
    out.push(
      'หุ้นส่วนหรือคนที่ต้องร่วมตัดสินใจใกล้ชิด '+
      'มีผลต่อทิศทางและความเร็วของงาน'
    );
  }

  if(keys.has('growth')){
    out.push(
      'การเรียนรู้ การขยายขอบเขตงาน และแรงสนับสนุนจากคนมีประสบการณ์ '+
      'ช่วยเปิดพื้นที่ให้เติบโต'
    );
  }

  if(keys.has('authority')){
    out.push(
      'เรื่องผู้ใหญ่ อำนาจ หรือการอนุมัติอาจเข้ามาเกี่ยวข้องกับงานเป็นระยะ '+
      'โดยเฉพาะเมื่อคุณต้องรับผิดชอบการตัดสินใจสำคัญ'
    );
  }

  return out.length
    ? out.slice(0,3).join(' ')
    : null;
}

function team(a){
  const profiles=(a.supportProfiles||[])
    .map(x=>x.planet)
    .filter(Boolean);

  if(!profiles.length)
    return null;

  let text=
    'อีกส่วนที่สำคัญคือคนที่ทำงานร่วมกับคุณ '+
    'คุณอาจเดินงานด้วยตัวเองได้ดี '+
    'แต่เมื่อมีทีมที่เหมาะสม ผลลัพธ์มีโอกาสไปได้ไกลกว่าเดิม';

  if(profiles.length===1){
    text+=
      ' คนที่ช่วยได้ดีควรมีจุดแข็งด้าน'+
      profiles[0].strength;
  }

  if(profiles.length>=2){
    text+=
      ' คนกลุ่มหนึ่งช่วยด้าน'+
      profiles[0].strength+
      ' ส่วนอีกกลุ่มช่วยด้าน'+
      profiles[1].strength+
      ' การเลือกคนให้เหมาะกับหน้าที่จึงสำคัญกว่าการมีคนจำนวนมาก';
  }

  const pairs=pairNarrative(a);

  if(pairs.length)
    text+=' '+pairs.join(' ');

  return text;
}

function outcome(a,guide){
  let money=false;
  let start=false;
  let network=false;
  let partner=false;
  let growth=false;

  for(const p of a.supportProfiles||[]){
    const k=linkKeys(p);

    money=
      money ||
      k.has('money') ||
      k.has('gain');

    start=
      start ||
      k.has('new_start');

    network=
      network ||
      k.has('network');

    partner=
      partner ||
      k.has('partner');

    growth=
      growth ||
      k.has('growth');
  }

  const parts=[];

  if(money && start){
    parts.push(
      'คนที่เข้ามาร่วมงานจึงไม่ได้มีผลแค่ทำให้งานเดินง่ายขึ้น '+
      'แต่ยังมีส่วนต่อการเปลี่ยนผลงานให้เกิดรายได้ '+
      'และต่อจังหวะเริ่มต้นสิ่งใหม่ด้วย'
    );
  }else if(money){
    parts.push(
      'คนร่วมงานบางกลุ่มมีส่วนเชื่อมผลงานไปสู่รายได้หรือผลตอบแทน '+
      'จึงควรมองทีมเป็นส่วนหนึ่งของการสร้างมูลค่า'
    );
  }else if(start){
    parts.push(
      'การเริ่มงานหรือโปรเจกต์ใหม่มีแนวโน้มเดินง่ายขึ้น '+
      'เมื่อเลือกคนร่วมงานให้เหมาะตั้งแต่ต้น'
    );
  }

  if(network){
    parts.push(
      'เครือข่ายและการประสานคนสามารถช่วยขยายโอกาสของงาน'
    );
  }

  if(partner){
    parts.push(
      'หุ้นส่วนหรือคนที่ร่วมตัดสินใจมีผลต่อทั้งความเร็วและคุณภาพของงาน'
    );
  }

  if(growth){
    parts.push(
      'คนร่วมงานบางคนอาจเป็นทางเชื่อมไปสู่ความรู้หรือพื้นที่ใหม่'
    );
  }

  if(
    guide.exampleSignals.includes(
      'PAIR_1_6_LABHA'
    )
  ){
    parts.push(
      'เมื่อความรับผิดชอบกับการสร้างคุณค่าเดินร่วมกันได้ดี '+
      'โอกาสและผลตอบแทนมีแนวโน้มเปิดกว้างขึ้น'
    );
  }

  if(!parts.length)
    return null;

  return (
    parts.slice(0,3).join(' ')+
    ' ดังนั้นการพัฒนางานไม่ได้ขึ้นกับความสามารถส่วนตัวเพียงอย่างเดียว '+
    'แต่ขึ้นกับการจัดคนและจังหวะการเดินงานให้เหมาะด้วย'
  );
}

function caution(a){
  const p=a.primaryPlanet;

  if(!p)
    return null;

  const hasFriction=(a.pairs||[]).some(
    x=>
      !x.conflicted &&
      x.public &&
      x.public.tone==='friction'
  );

  let text=
    'สิ่งที่ควรระวังคือ'+
    p.caution;

  if(hasFriction){
    text+=
      ' เมื่อคนในทีมทำงานต่างจังหวะกัน '+
      'อย่าพยายามแก้ทุกเรื่องด้วยตัวเองในเวลาเดียวกัน';
  }

  text+=
    ' ถ้าแบ่งงานให้ถูกคน ตรวจข้อมูลสำคัญก่อนตัดสินใจ '+
    'และรักษาจังหวะการทำงานให้ต่อเนื่อง '+
    'ผลลัพธ์จะมั่นคงกว่า';

  return text;
}

function publicSafe(text){
  return R.publicSafe(text);
}

function composeCareer(facts,semantic={}){
  const a=R.deriveCareer(
    facts,
    semantic
  );

  if(!a.ok){
    return freeze({
      ok:false,
      reason:a.reason||'ANALYSIS_FAILED'
    });
  }

  const guide=knowledgeGuide(a);

  const paragraphs=[
    opening(a,guide),
    relationship(a),
    team(a),
    outcome(a,guide),
    caution(a)
  ].filter(Boolean);

  const text=paragraphs.join('\n\n');

  const safe=publicSafe(text);

  return freeze({
    ok:
      safe &&
      paragraphs.length>=3,

    version:VERSION,
    domain:'career',
    text,
    paragraphs,

    publicAstrologyTermsHidden:safe,

    styleGuide:guide,

    quality:{
      paragraphCount:paragraphs.length,
      relationshipUsed:
        (a.primaryLinks||[]).length>0 ||
        (a.samePlanetHouseLinks||[]).length>0,

      pairContextUsed:
        (a.pairs||[]).length>0,

      knowledgeMethodUsed:
        guide.methodIds.length>0,

      knowledgeExampleUsed:
        guide.exampleIds.length>0
    },

    analysis:a,
    productionCutover:false
  });
}

function validate(){
  const errors=[];

  if(!R||!B)
    errors.push('dependency');

  if(PRODUCTION_CUTOVER!==false)
    errors.push('production-cutover');

  const methods=(B.RECORDS||[])
    .filter(x=>x.topic==='PREDICTION_METHOD');

  if(methods.length<3)
    errors.push('prediction-method-guide');

  return {
    ok:errors.length===0,
    errors
  };
}

const API=freeze({
  VERSION,
  PRODUCTION_CUTOVER,
  composeCareer,
  knowledgeGuide,
  publicSafe,
  validate
});

root.HorajarnNaturalNarrativeV2261=API;

if(
  typeof module!=='undefined' &&
  module.exports
){
  module.exports=API;
}

})(typeof globalThis!=='undefined'?globalThis:this);
