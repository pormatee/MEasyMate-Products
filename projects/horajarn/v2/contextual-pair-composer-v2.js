(function(root){'use strict';

const O=typeof require!=='undefined'
  ? require('./knowledge-owner-pairs-v2.js')
  : root.HorajarnOwnerPairKnowledgeV2271;

const VERSION='2.27.1-contextual-pair-composer';

function freeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
  return v;
}

function key(a,b){
  return [Number(a),Number(b)]
    .sort((x,y)=>x-y)
    .join('-');
}

function is48(a,b){
  return key(a,b)==='4-8';
}

function owner48(){
  return O.find(4,8,'ENEMY');
}

function base4(sig){
  const a=Number(sig.anchor.planet);
  const b=Number(sig.base4.planet);

  if(!is48(a,b))
    return null;

  const enemy=(sig.base4.pairRelationships||[])
    .some(x=>x.type==='ENEMY');

  if(!enemy || !owner48())
    return null;

  if(a===4){
    return (
      'ขณะเดียวกันยังมีแรงของความเปลี่ยนแปลงและการมองทางเลือกที่ไม่ปกติเข้ามาประกอบกับความคิดและการสื่อสาร '+
      'จุดนี้ช่วยให้คุณมองทางใหม่ได้เร็ว แต่ในบางช่วงอาจเปลี่ยนแนวคิดหรือสื่อสารก่อนข้อมูลนิ่ง '+
      'จึงควรแยกช่วงทดลองแนวคิดใหม่ออกจากช่วงตัดสินใจเรื่องสำคัญให้ชัด'
    );
  }

  if(a===8){
    return (
      'ขณะเดียวกันความคิดนอกกรอบและการพลิกสถานการณ์ยังถูกถ่วงด้วยเรื่องข้อมูล การสื่อสาร และเหตุผล '+
      'จุดนี้ทำให้คุณสามารถเปลี่ยนเกมได้ดีขึ้นเมื่อข้อมูลชัด แต่ถ้ารีบเปลี่ยนทางก่อนตรวจข้อมูล อาจทำให้การสื่อสารหรือการตัดสินใจคลาดเคลื่อนได้'
    );
  }

  return null;
}

function team(sig,pair){
  if(
    !pair ||
    !is48(pair.planets[0],pair.planets[1]) ||
    !owner48()
  )
    return null;

  const types=pair.types||[];

  if(!types.includes('ENEMY'))
    return null;

  return (
    'หากในทีมมีทั้งคนที่เน้นข้อมูล การสื่อสาร และการวางเหตุผล '+
    'กับคนที่ชอบพลิกแนวทางหรือทดลองสิ่งใหม่ ทั้งสองแบบอาจตัดสินใจต่างจังหวะกัน '+
    'จึงควรกำหนดให้ชัดว่าเรื่องใดอยู่ในช่วงทดลอง และเรื่องใดต้องยึดข้อมูลที่ตรวจแล้วก่อนตัดสินใจ'
  );
}

function evidence(sig){
  const out=[];
  const r=owner48();

  if(!r)
    return out;

  const b4=
    Number.isFinite(Number(sig.base4.planet)) &&
    is48(sig.anchor.planet,sig.base4.planet) &&
    (sig.base4.pairRelationships||[])
      .some(x=>x.type==='ENEMY');

  const selected=(sig.pairs||[])
    .some(x=>
      is48(x.planets[0],x.planets[1]) &&
      (x.types||[]).includes('ENEMY')
    );

  if(b4 || selected){
    out.push({
      id:r.id,
      planets:r.planets,
      relationshipType:r.relationshipType,
      sourceId:r.sourceId,
      verification:r.verification,
      status:r.status
    });
  }

  return out;
}

function validate(){
  const errors=[];

  if(!O || !O.validate().ok)
    errors.push('owner-pair-knowledge');

  return {
    ok:errors.length===0,
    errors
  };
}

const API=freeze({
  VERSION,
  base4,
  team,
  evidence,
  validate
});

root.HorajarnContextualPairComposerV2271=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
