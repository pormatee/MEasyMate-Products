global.window=global;
global.HorajarnInterpretationQualityV2={spokenText:m=>[m.headline,m.body,m.timing,'คำแนะนำ '+m.advice].join('. '),build:()=>({})};
require('../v2/horoscope-interpretation-ui-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const models={
 work:{headline:'การงาน • มีแรงหนุน',body:'งานเฉพาะบุคคล'},
 money:{headline:'การเงิน • มีแรงหนุน',body:'เงินเฉพาะบุคคล'},
 partner:{headline:'ความรัก • มีแรงหนุน',body:'รักเฉพาะบุคคล'}
};
const o=HorajarnInterpretationUIV2.overviewText(models);
assert(o.includes('สรุปเรื่องสำคัญจากหลักฐานของดวงนี้'),'overview-title');
assert(o.includes('งานเฉพาะบุคคล')&&o.includes('เงินเฉพาะบุคคล')&&o.includes('รักเฉพาะบุคคล'),'overview-three-topics');
console.log('HORAJARN_INTELLIGENCE_V2_8_4_VOICE_UNIT=PASS');
