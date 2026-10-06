(function(root){'use strict';

const S=typeof require!=='undefined'
  ? require('./career-signature-v2.js')
  : root.HorajarnCareerSignatureV227;

const N=typeof require!=='undefined'
  ? require('./natural-narrative-v2.js')
  : root.HorajarnNaturalNarrativeV2261;

const R=typeof require!=='undefined'
  ? require('./relationship-narrative-v2.js')
  : root.HorajarnRelationshipNarrativeV226;

const C=typeof require!=='undefined'
  ? require('./contextual-pair-composer-v2.js')
  : root.HorajarnContextualPairComposerV2271;

const VERSION='2.27.1-adaptive-career-narrative';
const PRODUCTION_CUTOVER=false;

function freeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
  return v;
}

function unique(a){
  return [...new Set(a)];
}

function base4PlanetNarrative(sig){
  const b=sig.base4;
  const anchor=Number(
    sig.anchor.planet
  );

  if(
    !Number.isFinite(Number(b.planet))
  )
    return null;

  const contextual=C.base4(sig);

  if(contextual)
    return contextual;

  let text=
    'ขณะเดียวกันยังมีคุณสมบัติเสริมที่'+
    b.workContribution;

  if(anchor===3 && Number(b.planet)===2){
    text+=
      ' สำหรับลักษณะงานที่เด่นเรื่องความเร็วและการลงมือ '+
      'แรงด้านความละเอียดและความนุ่มนวลนี้ช่วยผ่อนความแข็งลงในบางสถานการณ์ '+
      'ทำให้คุณไม่ได้ใช้ความเด็ดขาดเพียงด้านเดียว';
  }

  if(anchor===3 && Number(b.planet)===7){
    text+=
      ' จึงช่วยถ่วงความเร็วของการตัดสินใจด้วยความอดทนและการมองผลระยะยาว';
  }

  if(anchor===3 && Number(b.planet)===4){
    text+=
      ' ทำให้การลงมือมีมิติของการคิด การสื่อสาร และการเจรจาเข้ามาช่วยมากขึ้น';
  }

  if(anchor===4 && Number(b.planet)===7){
    text+=
      ' จึงช่วยให้ความคิดที่เร็วมีกรอบ มีความรอบคอบ และเดินเป็นระบบมากขึ้น';
  }

  if(anchor===4 && Number(b.planet)===3){
    text+=
      ' ทำให้ความคิดและการสื่อสารถูกผลักไปสู่การลงมือจริงได้เร็วขึ้น';
  }

  const types=unique(
    (b.pairRelationships||[])
      .map(x=>x.type)
  );

  if(!b.pairConflict){
    if(types.includes('FRIEND')){
      text+=
        ' จุดแข็งสองด้านนี้มีแนวโน้มช่วยส่งเสริมกันเมื่อใช้ในบริบทเดียวกัน';
    }else if(types.includes('ENEMY')){
      text+=
        ' อย่างไรก็ตาม สองแรงนี้อาจดึงกันคนละจังหวะ จึงต้องเลือกว่าจะใช้ความเร็วหรือความละเอียดตามสถานการณ์';
    }else if(types.includes('EQUAL_POWER')){
      text+=
        ' เมื่อสองด้านทำงานพร้อมกัน พลังของเรื่องงานมีโอกาสเด่นขึ้น';
    }else if(types.includes('ELEMENT')){
      text+=
        ' สองด้านนี้มีแนวโน้มเชื่อมกันค่อนข้างลึกและควรอ่านร่วมกัน';
    }
  }

  return text;
}

function base4SpecialNarrative(sig){
  const b=sig.base4;

  switch(b.code){
    case 'RACHA_CHOK':
      return (
        'เส้นทางงานยังมีโอกาสได้รับแรงสนับสนุนจากคนรอบตัว '+
        'จึงไม่ควรมองเฉพาะความสามารถส่วนตัว แต่ควรเปิดพื้นที่ให้ผู้ใหญ่ คนรู้จัก หรือโอกาสที่เข้ามาช่วยต่อยอด'
      );

    case 'MAHA_UT':
      return (
        'ขณะเดียวกัน คุณยังมีศักยภาพ ความมั่นคง และการยกระดับฐานะ '+
        'จึงเหมาะกับการใช้ความสามารถหลักเพื่อขยับงานไปสู่ระดับที่แข็งแรงกว่าเดิม'
      );

    case 'EMPEROR':
      return (
        'งานของคุณยังเกี่ยวข้องกับอำนาจ ความรับผิดชอบ ชื่อเสียง และการยอมรับ '+
        'บทบาทที่ต้องนำ ตัดสินใจ หรือรับผิดชอบผลลัพธ์สำคัญจึงอาจเด่นขึ้น'
      );

    case 'SOLA_MONGKOL':
      return (
        'ผลงานของคุณสามารถต่อยอดไปสู่ทรัพย์สิน รายได้ และความสำเร็จที่จับต้องได้ '+
        'จึงควรให้ความสำคัญกับการเปลี่ยนความสามารถให้กลายเป็นมูลค่าหรือฐานะที่มั่นคง'
      );

    case 'MAHA_EMPEROR':
      return (
        'ความสามารถด้านงานของคุณยังเหมาะกับการรวมคน ทรัพยากร และความรับผิดชอบหลายด้าน '+
        'จึงมีโอกาสเหมาะกับภารกิจหรือเป้าหมายที่ใหญ่กว่างานย่อยเฉพาะหน้า'
      );

    case 'URANUS':
      return (
        'อีกด้านหนึ่งมีแรงของความคิดใหม่ การเปลี่ยนแปลง และสิ่งที่อยู่นอกกรอบเดิม '+
        'งานที่เปิดโอกาสให้คิดค้น ทดลอง หรือแก้โจทย์ที่คนอื่นยังไม่เห็นทางอาจดึงศักยภาพออกมาได้ดี'
      );

    default:
      return null;
  }
}

function base4Narrative(sig){
  if(
    sig.base4.kind==='SPECIAL_INFLUENCE'
  )
    return base4SpecialNarrative(sig);

  return base4PlanetNarrative(sig);
}

function linkSentence(x){
  const key=x.life&&x.life.key;

  switch(key){
    case 'identity':
      return (
        'งานและตัวตนของคุณสัมพันธ์กันค่อนข้างชัด '+
        'เมื่อได้ทำสิ่งที่ใช้ความสามารถแบบเดียวกับนิสัยพื้นฐาน คุณมักรู้สึกมีแรงและมีทิศทางมากขึ้น'
      );

    case 'stability':
      return (
        'งานยังเชื่อมกับความเป็นอยู่และฐานชีวิต '+
        'ผลจากการทำงานจึงมีน้ำหนักต่อความมั่นคงในชีวิตมากกว่าการเป็นเพียงหน้าที่ประจำ'
      );

    case 'money':
      return (
        'ความสามารถในการทำงานเชื่อมกับเรื่องรายได้และการสร้างฐานทรัพย์ '+
        'ผลงานที่จับต้องได้จึงมีผลต่อความมั่นคงทางการเงินค่อนข้างตรง'
      );

    case 'gain':
      return (
        'เมื่อผลงานเดินถูกทาง โอกาสหรือผลตอบแทนมีแนวโน้มตามมาเป็นส่วนต่อเนื่องของงาน'
      );

    case 'new_start':
      return (
        'อีกด้านหนึ่ง งานยังมีส่วนเกี่ยวข้องกับการเริ่มต้นสิ่งใหม่ '+
        'งานใหม่ โปรเจกต์ใหม่ หรือสิ่งที่สร้างขึ้นด้วยตัวเองจึงมีความสำคัญเป็นพิเศษ'
      );

    case 'network':
      return (
        'การสื่อสาร เครือข่าย และคนที่รู้จักยังเชื่อมกับเรื่องงาน '+
        'โอกาสบางส่วนจึงอาจเกิดจากการประสานคนมากกว่าการทำงานแบบแยกตัว'
      );

    case 'partner':
      return (
        'งานยังมีความสัมพันธ์กับหุ้นส่วนหรือคนที่ต้องตัดสินใจร่วมกัน '+
        'การเลือกคนร่วมทางจึงมีผลต่อทิศทางงานโดยตรง'
      );

    case 'growth':
      return (
        'งานเชื่อมกับการเรียนรู้ การขยายขอบเขต และแรงสนับสนุนจากคนมีประสบการณ์ '+
        'การเติบโตจึงเกิดได้ดีเมื่อไม่หยุดพัฒนาความรู้'
      );

    case 'authority':
      return (
        'เรื่องผู้ใหญ่ อำนาจ หรือการอนุมัติมีความสัมพันธ์กับเส้นทางงาน '+
        'โดยเฉพาะเมื่อภาระงานขยับไปสู่ระดับที่ต้องรับผิดชอบการตัดสินใจมากขึ้น'
      );

    default:
      return null;
  }
}

function samePlanetNarrative(sig){
  const out=[];

  for(const x of sig.samePlanet){
    const s=linkSentence(x);

    if(s&&!out.includes(s))
      out.push(s);
  }

  return out.slice(0,3).join(' ');
}

function teamNarrative(sig){
  const profiles=(sig.supportProfiles||[])
    .map(x=>x.planet)
    .filter(Boolean);

  if(!profiles.length)
    return null;

  let text=
    'คนที่ทำงานร่วมกับคุณมีผลต่อภาพการงานค่อนข้างมาก';

  if(profiles.length>=1){
    text+=
      ' คนกลุ่มหนึ่งช่วยด้าน'+
      profiles[0].strength;
  }

  if(profiles.length>=2){
    text+=
      ' ขณะที่อีกกลุ่มช่วยด้าน'+
      profiles[1].strength;
  }

  text+=
    ' การจัดคนให้ตรงกับจุดแข็งจึงสำคัญกว่าการให้ทุกคนทำหน้าที่คล้ายกัน';

  const selected=new Set([
    Number(sig.anchor.planet),
    ...sig.supports.map(x=>Number(x.planet))
  ]);

  const publicPairs=(sig.pairs||[])
    .filter(x=>
      !x.conflicted &&
      x.public &&
      x.planets.every(
        p=>selected.has(Number(p))
      )
    );

  const good=publicPairs.find(x=>
    ['support','amplify','stable']
      .includes(x.public.tone)
  );

  const friction=publicPairs.find(x=>
    x.public.tone==='friction'
  );

  if(good)
    text+=' '+good.public.text;

  if(friction){
    const contextual=C.team(
      sig,
      friction
    );

    text+=' '+
      (contextual||friction.public.text);
  }

  return text;
}

function supportOutcome(sig){
  const keys=new Set();

  for(const p of sig.supportProfiles||[])
    for(const x of p.links||[])
      if(x.key)keys.add(x.key);

  const out=[];

  if(keys.has('money')||keys.has('gain')){
    out.push(
      'คนร่วมงานบางกลุ่มมีส่วนเชื่อมผลงานไปสู่รายได้หรือผลตอบแทน'
    );
  }

  if(keys.has('new_start')){
    out.push(
      'การเริ่มงานหรือโปรเจกต์ใหม่มีแนวโน้มเดินได้ดีขึ้นเมื่อเลือกคนให้เหมาะตั้งแต่ต้น'
    );
  }

  if(keys.has('network')){
    out.push(
      'เครือข่ายและการประสานคนช่วยขยายโอกาสของงาน'
    );
  }

  if(keys.has('partner')){
    out.push(
      'หุ้นส่วนหรือคนที่ร่วมตัดสินใจมีผลต่อทั้งความเร็วและคุณภาพของงาน'
    );
  }

  if(!out.length)
    return null;

  return out.slice(0,3).join(' ')+'';
}

function careerPositiveGuidance(sig){
  const planet=Number(sig.anchor&&sig.anchor.planet);

  const guide={
    1:
      'ความชัดเจนและภาวะผู้นำเป็นข้อได้เปรียบ เมื่อเปิดพื้นที่ให้ข้อมูลและมุมมองจากคนอื่นก่อนตัดสินใจ ความเด็ดขาดของคุณจะยิ่งน่าเชื่อถือ',
    2:
      'ความละเอียดและการเข้าใจคนช่วยให้งานเดินอย่างราบรื่น เมื่อกำหนดขอบเขตของภาระและความรู้สึกให้ชัด คุณจะดูแลทั้งงานและคนได้โดยไม่ใช้พลังเกินจำเป็น',
    3:
      'พลังและความกล้าช่วยให้คุณตัดสินใจและลงมือได้เร็ว หากเผื่อจังหวะตรวจข้อมูลสำคัญก่อนเร่งหรือรับภาระหนัก จุดแข็งนี้จะทำงานได้เต็มที่ขึ้น',
    4:
      'ไหวพริบและความเร็วช่วยให้คุณรับมือเรื่องที่เปลี่ยนไวได้ดี การเผื่อจังหวะตรวจข้อมูลก่อนสรุปหรือรับปากช่วยให้การตัดสินใจคมและน่าเชื่อถือขึ้น',
    5:
      'ความรู้และการยึดหลักช่วยสร้างความน่าเชื่อถือ เมื่อเปิดรับข้อมูลใหม่และกำหนดจังหวะตัดสินใจให้เหมาะ คุณจะใช้ความรอบคอบได้โดยไม่เสียโอกาส',
    6:
      'การประสานคนและสร้างคุณค่าเป็นจุดแข็ง เมื่อวางขอบเขตเรื่องเวลา งบประมาณ และความคาดหวังให้ชัด คุณจะรักษาความสัมพันธ์พร้อมกับผลลัพธ์ของงานได้ดี',
    7:
      'ความอดทนและความรับผิดชอบช่วยให้คุณสร้างผลระยะยาวได้ดี การแบ่งภาระและกำหนดจังหวะพักให้เหมาะช่วยให้รักษาคุณภาพของงานได้ต่อเนื่อง',
    8:
      'ความสามารถในการปรับตัวและมองทางเลือกใหม่ช่วยให้คุณพลิกสถานการณ์ได้ดี เมื่อกำหนดจุดตรวจข้อมูลก่อนเปลี่ยนทิศ คุณจะใช้ความยืดหยุ่นนี้ได้อย่างมั่นคง',
    9:
      'สัญชาตญาณและมุมมองที่แตกต่างช่วยให้คุณเห็นสิ่งที่คนอื่นอาจมองข้าม เมื่อใช้ร่วมกับข้อมูลที่ตรวจสอบได้ คุณจะเปลี่ยนความคิดเฉพาะตัวให้เป็นข้อได้เปรียบในการทำงาน'
  };

  const out=[];

  if(guide[planet])
    out.push(guide[planet]);

  if(sig.base4&&sig.base4.code==='URANUS'){
    out.push(
      'เมื่อมีความคิดใหม่หรือสถานการณ์เปลี่ยนกะทันหัน การแยกช่วงทดลองออกจากช่วงตัดสินใจจริงช่วยให้คุณรักษาความคล่องตัวโดยไม่เสียความชัดเจน'
    );
  }

  return unique(out).join(' ');
}

function caution(sig){
  const text=careerPositiveGuidance(sig);

  if(text)
    return text;

  return (
    'จุดแข็งของคุณจะทำงานได้เต็มที่เมื่อมีข้อมูลที่ชัด '+
    'กำหนดจังหวะตัดสินใจให้เหมาะ และจัดคนหรือภาระให้สอดคล้องกับลักษณะของงาน'
  );
}

function opening(sig){
  const p=sig.anchor.profile;

  if(!p)
    return null;

  return (
    'ด้านการงาน คุณเด่นเรื่อง'+
    p.strength+
    ' งานที่เหมาะจึงมักเป็น'+
    p.work+
    ' เพราะเป็นงานที่เปิดโอกาสให้คุณใช้จุดแข็งได้เต็มที่'
  );
}

function composeCareer(facts,semantic={}){
  const sig=S.buildCareerSignature(
    facts,
    semantic
  );

  if(!sig.ok){
    return freeze({
      ok:false,
      reason:sig.reason
    });
  }

  const guide=N.knowledgeGuide(
    sig.analysis
  );

  const paragraphs=[
    [
      opening(sig),
      base4Narrative(sig)
    ].filter(Boolean).join(' '),

    samePlanetNarrative(sig),

    teamNarrative(sig),

    supportOutcome(sig),

    caution(sig)
  ].filter(Boolean);

  const text=paragraphs.join('\n\n');
  const safe=R.publicSafe(text);

  return freeze({
    ok:safe&&paragraphs.length>=3,
    version:VERSION,
    domain:'career',
    text,
    paragraphs,
    signature:sig,
    signatureKey:sig.signatureKey,
    styleGuide:guide,
    contextualPairEvidence:C.evidence(sig),
    publicAstrologyTermsHidden:safe,
    productionCutover:false
  });
}

function validate(){
  const errors=[];

  if(!S||!N||!R||!C)
    errors.push('dependency');

  if(!S.validate().ok)
    errors.push('signature');

  if(!C.validate().ok)
    errors.push('contextual-pair');

  if(PRODUCTION_CUTOVER!==false)
    errors.push('production-cutover');

  return {
    ok:errors.length===0,
    errors
  };
}

const API=freeze({
  VERSION,
  PRODUCTION_CUTOVER,
  composeCareer,
  validate
});

root.HorajarnAdaptiveCareerNarrativeV227=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
