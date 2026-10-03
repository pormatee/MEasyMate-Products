global.window=global;
require('../v2/profile-adapter-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const a=HorajarnProfileAdapterV2.toCoreProfile({name:'T',day:1,month:3,year:2516,hour:5,minute:9,place:'Thailand'});
assert(a.day===1&&a.month===3&&a.year===2516,'v1-date');
assert(a.hour===5&&a.minute===9,'v1-time');
const b=HorajarnProfileAdapterV2.toCoreProfile({name:'T',d:1,m:3,y:1973,yRaw:2516,h:'05',mi:'09'});
assert(b.day===1&&b.month===3&&b.year===2516,'legacy-date');
assert(b.hour===5&&b.minute===9,'legacy-time');
assert(HorajarnProfileAdapterV2.publicDescriptor(a).hasBirthDate===true,'descriptor');
let bad=false;try{HorajarnProfileAdapterV2.toCoreProfile({foo:1})}catch(e){bad=e.message==='PROFILE_V2_SHAPE_UNKNOWN'}
assert(bad,'unknown-shape');
console.log('HORAJARN_INTELLIGENCE_V2_5_PROFILE_ADAPTER=PASS');
