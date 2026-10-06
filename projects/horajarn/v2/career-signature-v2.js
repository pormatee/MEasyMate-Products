(function(root){'use strict';

const R=typeof require!=='undefined'
  ? require('./relationship-narrative-v2.js')
  : root.HorajarnRelationshipNarrativeV226;

const E=typeof require!=='undefined'
  ? require('./integrated-prediction-engine-v2.js')
  : root.HorajarnIntegratedPredictionV222;

const K4=typeof require!=='undefined'
  ? require('./knowledge-base4-owner-v2.js')
  : root.HorajarnBase4OwnerKnowledgeV227;

const VERSION='2.27.0-career-signature';
const PRODUCTION_CUTOVER=false;

/*
 These numbers rank what the composer talks about first.
 They are NOT astrological strength values.
*/
const COMPOSER_PRIORITY={
  ANCHOR:100,
  BASE4:85,
  SAME_PLANET:75,
  SUPPORT:65,
  PAIR:55
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

function canonicalHouse(v){
  return E.canonicalHouse(v);
}

function sameColumn(records,col){
  return records
    .filter(x=>x.col===col)
    .sort((a,b)=>Number(a.base)-Number(b.base));
}

function resolveBase4(records,position){
  const stack=sameColumn(
    records,
    position.col
  );

  const rows=stack.filter(
    x=>[1,2,3].includes(Number(x.base))
  );

  if(rows.length!==3){
    return {
      ok:false,
      reason:'BASE4_COLUMN_INCOMPLETE',
      col:position.col,
      stack
    };
  }

  const value=rows.reduce(
    (sum,x)=>sum+Number(x.num),
    0
  );

  const knowledge=K4.resolve(value);

  return {
    ok:!!knowledge,
    col:position.col,
    value,
    stack:rows.map(x=>({
      base:Number(x.base),
      col:x.col,
      house:canonicalHouse(x.name),
      planet:Number(x.num)
    })),
    knowledge
  };
}

function pairBetween(a,b){
  if(!Number.isFinite(Number(a)) ||
     !Number.isFinite(Number(b)) ||
     Number(a)===Number(b))
    return [];

  const key=[
    Number(a),
    Number(b)
  ].sort((x,y)=>x-y).join('-');

  return (E.INDEX.pair[key]||[])
    .map(x=>({
      planets:[Number(a),Number(b)],
      type:x.relationshipType,
      knowledgeId:x.id,
      sourceId:x.sourceId,
      status:x.status
    }));
}

function lifeForHouse(a,house){
  return (a.primaryLinks||[])
    .find(x=>x.house===canonicalHouse(house))
    ||null;
}

function samePlanetDetails(facts,a){
  const anchorPlanet=Number(a.primary.planet);
  const anchorHouse=canonicalHouse(
    a.primary.house
  );

  return facts.records
    .filter(x=>
      Number(x.num)===anchorPlanet &&
      canonicalHouse(x.name)!==anchorHouse
    )
    .map(x=>({
      house:canonicalHouse(x.name),
      base:Number(x.base),
      col:x.col,
      planet:Number(x.num),
      life:lifeForHouse(a,x.name)
    }));
}

function pairSignature(rows){
  return rows
    .map(x=>x.type)
    .sort()
    .join('+');
}

function buildCareerSignature(facts,semantic={}){
  const a=R.deriveCareer(
    facts,
    semantic
  );

  if(!a.ok){
    return freeze({
      ok:false,
      reason:a.reason||'CAREER_ANALYSIS_FAILED'
    });
  }

  if(
    !facts ||
    !Array.isArray(facts.records)
  ){
    return freeze({
      ok:false,
      reason:'FACT_RECORDS_REQUIRED'
    });
  }

  const base4=resolveBase4(
    facts.records,
    a.primary
  );

  if(!base4.ok){
    return freeze({
      ok:false,
      reason:base4.reason||'BASE4_RESOLVE_FAILED',
      base4
    });
  }

  const samePlanet=samePlanetDetails(
    facts,
    a
  );

  const modifierPlanet=
    base4.knowledge &&
    Number.isFinite(
      Number(base4.knowledge.planet)
    )
      ? Number(base4.knowledge.planet)
      : null;

  const base4Pairs=
    modifierPlanet
      ? pairBetween(
          a.primary.planet,
          modifierPlanet
        )
      : [];

  const base4PairConflict=
    uniq(
      base4Pairs.map(x=>x.type)
    ).length>1;

  const ranking=[
    {
      type:'ANCHOR',
      priority:COMPOSER_PRIORITY.ANCHOR,
      house:a.primary.house,
      planet:a.primary.planet
    },
    {
      type:'BASE4',
      priority:COMPOSER_PRIORITY.BASE4,
      value:base4.value,
      influence:
        base4.knowledge.code ||
        base4.knowledge.planet ||
        base4.knowledge.name
    },
    ...samePlanet.map(x=>({
      type:'SAME_PLANET',
      priority:COMPOSER_PRIORITY.SAME_PLANET,
      house:x.house,
      planet:x.planet,
      lifeKey:x.life?x.life.key:null
    })),
    ...a.supports.map(x=>({
      type:'SUPPORT',
      priority:COMPOSER_PRIORITY.SUPPORT,
      house:x.house,
      planet:x.planet
    })),
    ...a.pairs.map(x=>({
      type:'PAIR',
      priority:COMPOSER_PRIORITY.PAIR,
      planets:x.planets,
      relationshipTypes:x.types
    }))
  ].sort(
    (x,y)=>y.priority-x.priority
  );

  const sameKey=samePlanet
    .map(x=>`${x.house}:${x.base}`)
    .sort()
    .join(',');

  const supportKey=a.supports
    .map(x=>`${x.house}:${x.planet}`)
    .sort()
    .join(',');

  const pairKey=a.pairs
    .map(x=>
      `${[...x.planets].sort((m,n)=>m-n).join('-')}:${x.types.slice().sort().join('+')}`
    )
    .sort()
    .join(',');

  const b4PairKey=pairSignature(
    base4Pairs
  );

  const signatureKey=[
    `A${a.primary.planet}`,
    `B4-${base4.value}-${base4.knowledge.code||('P'+base4.knowledge.planet)}`,
    `SAME-${sameKey||'NONE'}`,
    `SUP-${supportKey||'NONE'}`,
    `PAIR-${pairKey||'NONE'}`,
    `B4PAIR-${b4PairKey||'NONE'}`
  ].join('|');

  const sourceRefs=new Set(
    a.provenance.sourceRefs||[]
  );

  sourceRefs.add(
    K4.SOURCE_ID
  );

  base4Pairs.forEach(
    x=>sourceRefs.add(x.sourceId)
  );

  return freeze({
    ok:true,
    version:VERSION,
    domain:'career',
    signatureKey,

    anchor:{
      house:a.primary.house,
      planet:a.primary.planet,
      base:a.primary.base,
      col:a.primary.col,
      profile:a.primaryPlanet
    },

    base4:{
      value:base4.value,
      col:base4.col,
      stack:base4.stack,
      kind:base4.knowledge.kind,
      code:base4.knowledge.code||null,
      planet:modifierPlanet,
      name:base4.knowledge.name,
      meaning:base4.knowledge.meaning,
      workContribution:
        base4.knowledge.workContribution,
      caution:
        base4.knowledge.caution||null,
      sourceId:
        base4.knowledge.sourceId,
      status:
        base4.knowledge.status,
      pairRelationships:base4Pairs,
      pairConflict:base4PairConflict
    },

    samePlanet,
    supports:a.supports,
    supportProfiles:a.supportProfiles,
    primaryLinks:a.primaryLinks,
    pairs:a.pairs,

    ranking,

    provenance:{
      sourceRefs:[...sourceRefs],
      knowledgeIds:
        a.provenance.knowledgeIds||[]
    },

    analysis:a,
    productionCutover:false
  });
}

function validate(){
  const errors=[];

  if(!R||!E||!K4)
    errors.push('dependency');

  if(!K4.validate().ok)
    errors.push('base4-knowledge');

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
  COMPOSER_PRIORITY,
  resolveBase4,
  buildCareerSignature,
  validate
});

root.HorajarnCareerSignatureV227=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
