(function(root){'use strict';

const VERSION='2.27.1-owner-pairs';
const SOURCE_ID='USER-PRACTITIONER-RULES';

function freeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
  return v;
}

const RECORDS=freeze([
  {
    id:'PAIR-4-8-ENEMY-OWNER-V1',
    planets:[4,8],
    relationshipType:'ENEMY',
    meaning:'พุธกับราหูเป็นคู่ศัตรูกัน',
    sourceId:SOURCE_ID,
    pageRef:'OWNER_RULE_2026-10-06',
    school:'HORAJARN_PRACTITIONER',
    verification:'OWNER_VERIFIED_V1',
    status:'OWNER_VERIFIED',
    claimKey:'PLANET_PAIR_CLASS',
    claimValue:'ENEMY_4_8'
  }
]);

function key(a,b){
  return [Number(a),Number(b)]
    .sort((x,y)=>x-y)
    .join('-');
}

function find(a,b,type){
  const k=key(a,b);

  return RECORDS.find(x=>
    key(x.planets[0],x.planets[1])===k &&
    (!type || x.relationshipType===type)
  )||null;
}

function validate(){
  const errors=[];

  const r=find(4,8,'ENEMY');

  if(!r)
    errors.push('pair-4-8');

  if(r && r.status!=='OWNER_VERIFIED')
    errors.push('owner-status');

  return {
    ok:errors.length===0,
    errors
  };
}

const API=freeze({
  VERSION,
  SOURCE_ID,
  RECORDS,
  find,
  validate
});

root.HorajarnOwnerPairKnowledgeV2271=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
