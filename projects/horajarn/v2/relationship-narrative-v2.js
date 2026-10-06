(function(root){'use strict';

const E=typeof require!=='undefined'
  ? require('./integrated-prediction-engine-v2.js')
  : root.HorajarnIntegratedPredictionV222;

const B=typeof require!=='undefined'
  ? require('./knowledge-mega-batch2-v2.js')
  : root.HorajarnKnowledgeMegaBatch2V221;

const VERSION='2.26.0-relationship-narrative-rc1';
const PRODUCTION_CUTOVER=false;

const PUBLIC_ASTRO_TERMS=[
  'กัมมะ','ทาสา','ทาสี','ตนุ','โภคา',
  'ธนัง','กดุมพะ','กดุมภะ','ปุตตะ',
  'ปิตา','ลาภะ','เรือน','ดาว'
];

/*
 These are narrative transformations of the existing
 source-tagged planet knowledge. They are NOT new
 astrological claims.
*/
const PLANET_STYLE={
  AUTHORITY_STATUS_HEAT:{
    work:'งานที่ต้องรับผิดชอบ ตัดสินใจ และยืนอยู่ในจุดที่คนมองเห็นผลลัพธ์ชัด',
    strength:'ความชัดเจน ความเป็นผู้นำ และการตัดสินใจ',
    team:'คนที่กล้าตัดสินใจและรับผิดชอบ',
    caution:'แบกความรับผิดชอบมากเกินไป หรือยืนยันความคิดของตนเองจนคนอื่นตามไม่ทัน'
  },
  GENTLENESS_SERVICE:{
    work:'งานที่ต้องดูแลผู้คน ใส่ใจรายละเอียด และปรับตัวตามสถานการณ์',
    strength:'ความละเอียด ความเข้าใจคน และการดูแล',
    team:'คนที่ละเอียด ใส่ใจ และประสานความรู้สึกของคนในทีม',
    caution:'รับภาระความรู้สึกของคนอื่นมากเกินไป หรือลังเลเมื่อควรตัดสินใจ'
  },
  COURAGE_ENERGY_IMPULSE:{
    work:'งานที่ต้องลงมือจริง แก้ปัญหาเฉพาะหน้า ใช้ความรวดเร็ว หรือรับมือแรงกดดัน',
    strength:'ความกล้า พลังในการลงมือ และการแก้ปัญหา',
    team:'คนที่ลงมือเร็วและแก้ปัญหาหน้างานได้ดี',
    caution:'รีบเกินไป รับภาระมากเกินไป หรือปะทะเมื่อเจอแรงกดดัน'
  },
  ADAPT_COMMUNICATION_INTELLECT:{
    work:'งานที่ต้องสื่อสาร เชื่อมข้อมูล เจรจา หรือปรับตัวกับเรื่องที่เปลี่ยนเร็ว',
    strength:'ไหวพริบ การสื่อสาร และการเชื่อมข้อมูล',
    team:'คนที่สื่อสาร เจรจา และจัดการข้อมูลได้ดี',
    caution:'ทำหลายเรื่องพร้อมกันจนกระจาย หรือรีบสรุปก่อนข้อมูลครบ'
  },
  ETHICS_KNOWLEDGE_WISDOM:{
    work:'งานที่ใช้ความรู้ หลักการ การวิเคราะห์ การสอน หรือการให้คำแนะนำ',
    strength:'ความรู้ เหตุผล และความน่าเชื่อถือ',
    team:'คนที่มีความรู้ วางหลัก และให้คำแนะนำได้',
    caution:'คิดรอบคอบนานเกินไป หรือยึดหลักจนปรับตัวช้า'
  },
  ART_BEAUTY_LOVE_MONEY:{
    work:'งานที่ต้องเข้าใจผู้คน คุณค่า ความสัมพันธ์ หรือสิ่งที่ต้องอาศัยรสนิยมและความกลมกลืน',
    strength:'การประสานคน การสร้างคุณค่า และความเข้าใจความต้องการ',
    team:'คนที่ประสานงานดี เข้าใจผู้คนและคุณค่าของงาน',
    caution:'เลี่ยงเรื่องยากเพื่อรักษาบรรยากาศ หรือให้ความสบายมาก่อนสิ่งที่ควรจัดการ'
  },
  WORRY_HARDSHIP_PRUDENCE:{
    work:'งานที่ต้องอดทน วางระบบ รับผิดชอบระยะยาว และค่อย ๆ สร้างผลลัพธ์',
    strength:'ความอดทน ความรอบคอบ และการรักษาความต่อเนื่อง',
    team:'คนที่อดทน รับผิดชอบ และคุมงานระยะยาวได้',
    caution:'แบกภาระมากเกินไป ทำให้เรื่องง่ายกลายเป็นหนัก หรือชะลอเพราะกังวล'
  },
  OBSESSION_EMOTION_VOLATILITY:{
    work:'งานที่ต้องรับมือความเปลี่ยนแปลง เกมที่ซับซ้อน หรือสถานการณ์ที่คนอื่นคาดเดายาก',
    strength:'การพลิกมุมมองและรับมือสถานการณ์ที่ไม่แน่นอน',
    team:'คนที่กล้าเปลี่ยนเกมและรับมือความไม่แน่นอนได้',
    caution:'ตัดสินใจตามแรงกระตุ้น หลงกับโอกาสที่ดูเร็วเกินจริง หรือเปลี่ยนทิศบ่อย'
  },
  UNCONVENTIONAL_UNPREDICTABLE:{
    work:'งานเฉพาะทาง งานที่ต้องค้นคว้า หรือเรื่องที่ต้องมองต่างจากกรอบทั่วไป',
    strength:'การมองมุมที่คนอื่นอาจไม่เห็นและการทำงานเฉพาะด้าน',
    team:'คนที่มองมุมต่างและทำงานเฉพาะทางได้',
    caution:'แยกตัวจากทีมมากเกินไป หรือเปลี่ยนทิศทางโดยคนอื่นตามไม่ทัน'
  }
};

const LIFE_MAP={
  SELF_FORTUNE:{
    key:'identity',
    priority:98
  },
  CURRENT_SELF:{
    key:'identity',
    priority:100
  },
  WEALTH_ASSET:{
    key:'money',
    priority:95
  },
  FINANCE_ACQUISITION:{
    key:'money',
    priority:96
  },
  GAIN_HOPE:{
    key:'gain',
    priority:93
  },
  PROPERTY_LIVING:{
    key:'stability',
    priority:90
  },
  FAMILY_HOME:{
    key:'home',
    priority:86
  },
  CHILD_NEW_BEGINNING:{
    key:'new_start',
    priority:91
  },
  SOCIAL_COMMUNICATION:{
    key:'network',
    priority:84
  },
  PARTNER_COOPERATION:{
    key:'partner',
    priority:88
  },
  PROGRESS_SUPPORT:{
    key:'growth',
    priority:89
  },
  FATHER_MALE_AUTHORITY:{
    key:'authority',
    priority:74
  },
  MOTHER_FEMALE_SUPPORT:{
    key:'care',
    priority:68
  },
  OBSTACLE_DEBT:{
    key:'obstacle',
    priority:80
  },
  DEFECT_WEAKNESS:{
    key:'weakness',
    priority:75
  },
  LOSS_SEPARATION:{
    key:'loss',
    priority:77
  },
  HIDDEN_DECLINE:{
    key:'hidden_risk',
    priority:76
  },
  MIDDLE_PUBLIC:{
    key:'public',
    priority:60
  },
  SELF_EFFORT_SUBORDINATE:{
    key:'team',
    priority:82
  },
  OTHER_EFFORT:{
    key:'team',
    priority:82
  }
};

const PAIR_STYLE={
  FRIEND:{
    tone:'support',
    text:'เมื่อแบ่งบทบาทได้เหมาะ คนในทีมมีแนวโน้มช่วยเสริมกันและทำให้งานเดินคล่องขึ้น'
  },
  ENEMY:{
    tone:'friction',
    text:'ในทีมอาจมีคนที่ทำงานคนละจังหวะกัน จึงควรแบ่งหน้าที่และขอบเขตการตัดสินใจให้ชัด'
  },
  ELEMENT:{
    tone:'stable',
    text:'รูปแบบการทำงานร่วมกันมีแนวโน้มผูกกันค่อนข้างลึก จึงควรวางระบบให้รับผิดชอบต่อกันได้ระยะยาว'
  },
  EQUAL_POWER:{
    tone:'amplify',
    text:'เมื่อคนที่มีจุดแข็งต่างกันทำงานร่วมกัน ผลลัพธ์มีโอกาสชัดขึ้นกว่าการใช้ความสามารถเพียงด้านเดียว'
  }
};

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

function planetProfile(n){
  const row=E.INDEX.planet[String(Number(n))];

  if(!row)return null;

  const style=PLANET_STYLE[row.claimValue];

  if(!style)return null;

  return {
    planet:Number(n),
    knowledgeId:row.id,
    sourceId:row.sourceId,
    status:row.status,
    claimValue:row.claimValue,
    ...style
  };
}

function houseLife(name){
  const h=E.canonicalHouse(name);
  const row=E.INDEX.house[h];

  if(!row)return null;

  const life=LIFE_MAP[row.claimValue];

  if(!life)return null;

  return {
    house:h,
    knowledgeId:row.id,
    sourceId:row.sourceId,
    status:row.status,
    claimValue:row.claimValue,
    ...life
  };
}

function pairKey(planets){
  return [...planets]
    .map(Number)
    .sort((a,b)=>a-b)
    .join('-');
}

function analyzePairs(rc){
  const grouped={};

  for(const p of rc.pairRelationships||[]){
    const k=pairKey(p.planets);

    if(!grouped[k]){
      grouped[k]={
        planets:[...p.planets],
        types:[],
        rows:[]
      };
    }

    grouped[k].types.push(p.type);
    grouped[k].rows.push(p);
  }

  return Object.values(grouped).map(g=>{
    const types=uniq(g.types);
    const conflicted=types.length>1;

    return {
      planets:g.planets,
      types,
      conflicted,
      public:
        conflicted
          ? null
          : PAIR_STYLE[types[0]]||null,
      knowledgeIds:g.rows
        .map(x=>x.knowledgeId)
        .filter(Boolean),
      sourceRefs:uniq(
        g.rows.map(x=>x.sourceId).filter(Boolean)
      )
    };
  });
}

function matchingExamples(rc,pairs){
  const out=[];

  for(const x of B.RECORDS||[]){
    if(x.topic!=='PREDICTION_EXAMPLES')
      continue;

    if(x.claimValue==='PAIR_1_6_KAMMA'){
      const hasPair=pairs.some(p=>
        pairKey(p.planets)==='1-6'
      );

      const hasKamma=rc.positions.some(p=>
        p.house==='กัมมะ' &&
        (p.planet===1||p.planet===6)
      );

      if(hasPair&&hasKamma)out.push(x);
    }

    if(x.claimValue==='PAIR_1_6_LABHA'){
      const hasPair=pairs.some(p=>
        pairKey(p.planets)==='1-6'
      );

      const hasLabha=(rc.samePlanetHouseLinks||[])
        .some(x=>x.houses.includes('ลาภะ'));

      if(hasPair&&hasLabha)out.push(x);
    }
  }

  return out.map(x=>({
    id:x.id,
    sourceId:x.sourceId,
    status:x.status,
    claimValue:x.claimValue
  }));
}

function linkForPosition(rc,pos){
  const g=(rc.samePlanetHouseLinks||[])
    .find(x=>Number(x.planet)===Number(pos.planet));

  if(!g)return [];

  return g.houses
    .filter(h=>h!==pos.house)
    .map(h=>houseLife(h))
    .filter(Boolean)
    .sort((a,b)=>b.priority-a.priority);
}

function deriveCareer(facts,semantic={}){
  const rc=E.integrate(
    facts,
    {
      domain:'career',
      intent:semantic.intent||'',
      authority:semantic.authority===true
    }
  );

  if(rc.blocked){
    return freeze({
      ok:false,
      blocked:true,
      reason:rc.reason
    });
  }

  const primary=rc.positions.find(
    x=>x.role==='PRIMARY'
  );

  if(!primary){
    return freeze({
      ok:false,
      blocked:false,
      reason:'CAREER_PRIMARY_MISSING'
    });
  }

  const supports=rc.positions.filter(
    x=>x.role==='SUPPORT'
  );

  const contexts=rc.positions.filter(
    x=>x.role==='CONTEXT'
  );

  const conditionals=rc.positions.filter(
    x=>x.role==='CONDITIONAL'
  );

  const primaryPlanet=planetProfile(primary.planet);

  const supportProfiles=supports.map(x=>({
    position:x,
    planet:planetProfile(x.planet),
    links:linkForPosition(rc,x)
  }));

  const primaryLinks=linkForPosition(rc,primary);

  const pairs=analyzePairs(rc);
  const examples=matchingExamples(rc,pairs);

  const knowledgeIds=new Set(rc.trace.knowledgeIds||[]);
  const sourceRefs=new Set(rc.trace.sourceRefs||[]);

  if(primaryPlanet){
    knowledgeIds.add(primaryPlanet.knowledgeId);
    sourceRefs.add(primaryPlanet.sourceId);
  }

  for(const x of primaryLinks){
    knowledgeIds.add(x.knowledgeId);
    sourceRefs.add(x.sourceId);
  }

  for(const s of supportProfiles){
    if(s.planet){
      knowledgeIds.add(s.planet.knowledgeId);
      sourceRefs.add(s.planet.sourceId);
    }

    for(const x of s.links){
      knowledgeIds.add(x.knowledgeId);
      sourceRefs.add(x.sourceId);
    }
  }

  for(const p of pairs){
    p.knowledgeIds.forEach(x=>knowledgeIds.add(x));
    p.sourceRefs.forEach(x=>sourceRefs.add(x));
  }

  examples.forEach(x=>{
    knowledgeIds.add(x.id);
    sourceRefs.add(x.sourceId);
  });

  return freeze({
    ok:true,
    domain:'career',
    policyMode:rc.policy.mode,
    verification:rc.policy.verification,
    primary,
    primaryPlanet,
    supports,
    supportProfiles,
    contexts,
    conditionals,
    primaryLinks,
    pairs,
    examples,
    samePlanetHouseLinks:rc.samePlanetHouseLinks,
    provenance:{
      knowledgeIds:[...knowledgeIds],
      sourceRefs:[...sourceRefs]
    }
  });
}

function primaryLinkSentence(x){
  switch(x.key){
    case 'identity':
      return 'งานกับตัวตนของคุณค่อนข้างเชื่อมกัน เมื่อได้ทำสิ่งที่ถนัด ความมั่นใจและพลังในการเดินหน้ามักชัดขึ้น';

    case 'stability':
      return 'ผลจากการทำงานยังสัมพันธ์กับความเป็นอยู่และฐานชีวิต จึงควรมองว่างานนั้นช่วยสร้างความมั่นคงจริงได้มากเพียงใด';

    case 'money':
      return 'ความก้าวหน้าของงานมีแนวโน้มเชื่อมกับรายได้และการสร้างฐานทรัพย์ค่อนข้างตรง';

    case 'gain':
      return 'เมื่อผลงานเดินถูกทาง โอกาส ผลตอบแทน หรือช่องทางใหม่มีแนวโน้มตามมา';

    case 'home':
      return 'เรื่องงานมีโอกาสส่งผลต่อบ้าน ครอบครัว หรือการตัดสินใจเรื่องความมั่นคงของชีวิต';

    case 'new_start':
      return 'การเริ่มงานใหม่ โปรเจกต์ใหม่ หรือการสร้างสิ่งของตัวเองเป็นจุดที่ควรให้ความสำคัญ';

    case 'network':
      return 'การสื่อสาร เครือข่าย และคนที่รู้จักมีส่วนช่วยให้งานขยับได้มากกว่าการทำงานแบบแยกตัว';

    case 'partner':
      return 'หุ้นส่วนหรือคนที่ต้องทำงานใกล้ชิดมีผลต่อทิศทางงานอย่างเห็นได้ชัด';

    case 'growth':
      return 'การเรียนรู้ การขยายขอบเขตงาน และการได้รับแรงสนับสนุนจากคนที่มีประสบการณ์ช่วยเปิดทางให้เติบโต';

    case 'authority':
      return 'ผู้ใหญ่หรือผู้มีอำนาจอาจเข้ามามีบทบาทเมื่อเรื่องงานเกี่ยวข้องกับการอนุมัติ การตัดสินใจ หรือความรับผิดชอบระดับสูง';

    case 'obstacle':
      return 'งานบางช่วงอาจต้องแลกกับการแก้ปัญหา ความขัดแย้ง หรือภาระที่ต้องจัดการอย่างเป็นระบบ';

    case 'weakness':
      return 'จุดอ่อนบางอย่างจะเห็นชัดผ่านเรื่องงาน จึงควรใช้ผลงานจริงเป็นตัวตรวจว่าควรปรับตรงไหน';

    case 'loss':
      return 'ควรระวังงานที่ใช้พลังมากแต่ให้ผลกลับมาไม่คุ้ม หรือทำให้ต้องเสียสิ่งสำคัญเกินจำเป็น';

    case 'hidden_risk':
      return 'ควรเผื่อพื้นที่สำหรับปัญหาที่มองไม่เห็นตั้งแต่ต้น และไม่ตัดสินใจจากข้อมูลเพียงด้านเดียว';

    default:
      return null;
  }
}

function supportGrowthSentence(profile){
  const keys=uniq(
    profile.links.map(x=>x.key)
  );

  const parts=[];

  if(keys.includes('money')||keys.includes('gain')){
    parts.push(
      'คนที่เข้ามาช่วยงานมีโอกาสเป็นตัวแปรสำคัญต่อรายได้ ผลตอบแทน หรือการเปลี่ยนผลงานให้เกิดมูลค่า'
    );
  }

  if(keys.includes('new_start')){
    parts.push(
      'การเริ่มงานหรือโปรเจกต์ใหม่จะเดินได้ง่ายขึ้นเมื่อเลือกคนร่วมงานให้เหมาะกับบทบาทตั้งแต่ต้น'
    );
  }

  if(keys.includes('network')){
    parts.push(
      'เครือข่ายและการประสานคนมีส่วนช่วยขยายโอกาสของงาน'
    );
  }

  if(keys.includes('partner')){
    parts.push(
      'หุ้นส่วนหรือคนที่ร่วมตัดสินใจอาจมีผลต่อความเร็วและคุณภาพของงาน'
    );
  }

  if(keys.includes('growth')){
    parts.push(
      'คนร่วมงานบางคนอาจเป็นทางเชื่อมไปสู่ความรู้ โอกาส หรือพื้นที่ใหม่'
    );
  }

  return parts;
}

function teamParagraph(a){
  if(!a.supportProfiles.length)
    return null;

  const profiles=a.supportProfiles
    .map(x=>x.planet)
    .filter(Boolean);

  const descriptions=profiles
    .map(x=>x.team);

  let text=
    'อีกส่วนที่สำคัญคือคนที่ทำงานร่วมกับคุณ '+
    'คุณอาจเดินงานด้วยตัวเองได้ แต่เมื่อมีทีมที่เหมาะสม '+
    'ผลลัพธ์มีโอกาสไปได้ไกลกว่าเดิม';

  if(descriptions.length===1){
    text+=
      ' คนที่ช่วยได้ดีมักเป็น'+descriptions[0];
  }

  if(descriptions.length>=2){
    text+=
      ' คนบางกลุ่มเด่นในแบบ'+descriptions[0]+
      ' ขณะที่อีกกลุ่มช่วยในแบบ'+descriptions[1]+
      ' การเลือกคนให้เหมาะกับหน้าที่จึงสำคัญกว่าการมีคนจำนวนมาก';
  }

  const publicPairs=a.pairs
    .filter(x=>!x.conflicted&&x.public)
    .filter(x=>{
      const selected=new Set(
        a.supports.map(s=>s.planet)
      );

      selected.add(a.primary.planet);

      return x.planets.every(p=>selected.has(p));
    });

  const supportPair=publicPairs.find(
    x=>x.public.tone==='support' ||
       x.public.tone==='amplify'
  );

  const frictionPair=publicPairs.find(
    x=>x.public.tone==='friction'
  );

  if(supportPair)
    text+=' '+supportPair.public.text;

  if(frictionPair)
    text+=' '+frictionPair.public.text;

  return text;
}

function growthParagraph(a){
  const parts=[];

  for(const p of a.supportProfiles){
    for(const x of supportGrowthSentence(p)){
      if(!parts.includes(x))
        parts.push(x);
    }
  }

  if(!parts.length)
    return null;

  return (
    parts.slice(0,2).join(' ')+
    ' ดังนั้นการพัฒนางานไม่ได้ขึ้นกับความสามารถส่วนตัวเพียงอย่างเดียว '+
    'แต่ขึ้นกับการจัดคนและจังหวะเริ่มต้นให้เหมาะด้วย'
  );
}

function cautionParagraph(a){
  const p=a.primaryPlanet;

  if(!p)return null;

  const hasFriction=a.pairs.some(
    x=>!x.conflicted &&
       x.public &&
       x.public.tone==='friction'
  );

  let text=
    'สิ่งที่ควรระวังคือ'+p.caution;

  if(hasFriction){
    text+=
      ' โดยเฉพาะเมื่อทีมมีคนที่ทำงานต่างจังหวะกัน '+
      'อย่าพยายามแก้ทุกเรื่องด้วยตัวเองในเวลาเดียวกัน';
  }

  text+=
    ' ถ้าแบ่งงานให้ถูกคน ตรวจข้อมูลสำคัญก่อนตัดสินใจ '+
    'และรักษาจังหวะการทำงานให้ต่อเนื่อง ผลลัพธ์จะมั่นคงกว่า';

  return text;
}

function openingParagraph(a){
  const p=a.primaryPlanet;

  if(!p)
    return 'การงานของคุณควรพิจารณาจากวิธีทำงานจริง ผลลัพธ์ และสภาพแวดล้อมที่ช่วยให้ใช้ความสามารถได้เต็มที่';

  return (
    'การงานของคุณมีแนวโน้มไปได้ดีเมื่อได้ใช้'+
    p.strength+
    ' งานที่เหมาะจึงมักเป็น'+
    p.work+
    ' มากกว่างานที่จำกัดวิธีทำงานจนใช้จุดแข็งได้ไม่เต็มที่'
  );
}

function relationshipParagraph(a){
  const lines=[];

  for(const x of a.primaryLinks.slice(0,3)){
    const s=primaryLinkSentence(x);
    if(s&&!lines.includes(s))
      lines.push(s);
  }

  if(!lines.length)
    return null;

  return lines.join(' ');
}

function publicSafe(text){
  return !PUBLIC_ASTRO_TERMS.some(
    x=>String(text).includes(x)
  );
}

function composeCareer(facts,semantic={}){
  const a=deriveCareer(facts,semantic);

  if(!a.ok)
    return freeze({
      ok:false,
      reason:a.reason||'ANALYSIS_FAILED'
    });

  const paragraphs=[
    openingParagraph(a),
    relationshipParagraph(a),
    teamParagraph(a),
    growthParagraph(a),
    cautionParagraph(a)
  ].filter(Boolean);

  const text=paragraphs.join('\n\n');

  return freeze({
    ok:publicSafe(text),
    version:VERSION,
    domain:'career',
    text,
    paragraphs,
    publicAstrologyTermsHidden:publicSafe(text),
    productionCutover:false,
    analysis:a
  });
}

function validate(){
  const errors=[];

  if(!E||!B)errors.push('dependency');
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
  PUBLIC_ASTRO_TERMS,
  deriveCareer,
  composeCareer,
  publicSafe,
  validate
});

root.HorajarnRelationshipNarrativeV226=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
