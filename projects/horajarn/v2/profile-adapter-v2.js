(function(root){'use strict';
const VERSION='2.5.0-single-brain';
function present(v){return v!==undefined&&v!==null&&String(v)!==''}
function num(v){return present(v)?Number(v):null}
function string(v){return present(v)?String(v):''}
function fromAstroProfileV1(raw){if(!raw||typeof raw!=='object')throw new Error('PROFILE_V2_INPUT_REQUIRED');return Object.freeze({
  name:string(raw.name),day:num(raw.day),month:num(raw.month),year:num(raw.year),
  hour:present(raw.hour)?num(raw.hour):'',minute:present(raw.minute)?num(raw.minute):'',place:string(raw.place)
})}
function fromLegacyHoroscope(raw){if(!raw||typeof raw!=='object')throw new Error('PROFILE_V2_INPUT_REQUIRED');const year=present(raw.yRaw)?num(raw.yRaw):(present(raw.y)?num(raw.y):null);return Object.freeze({
  name:string(raw.name),day:num(raw.d),month:num(raw.m),year,
  hour:present(raw.h)?num(raw.h):'',minute:present(raw.mi)?num(raw.mi):'',place:string(raw.place)
})}
function detect(raw){if(!raw||typeof raw!=='object')throw new Error('PROFILE_V2_INPUT_REQUIRED');if(Object.prototype.hasOwnProperty.call(raw,'day')||Object.prototype.hasOwnProperty.call(raw,'month'))return'astroProfileV1';if(Object.prototype.hasOwnProperty.call(raw,'d')||Object.prototype.hasOwnProperty.call(raw,'m'))return'legacy-horoscope';return'unknown'}
function toCoreProfile(raw){const kind=detect(raw);if(kind==='astroProfileV1')return fromAstroProfileV1(raw);if(kind==='legacy-horoscope')return fromLegacyHoroscope(raw);throw new Error('PROFILE_V2_SHAPE_UNKNOWN')}
function publicDescriptor(raw){const p=toCoreProfile(raw);return Object.freeze({hasName:!!p.name,hasBirthDate:Number.isFinite(p.day)&&Number.isFinite(p.month)&&Number.isFinite(p.year),hasBirthTime:p.hour!==''&&p.hour!==null,hasPlace:!!p.place,shape:detect(raw)});}
const API={VERSION,present,detect,fromAstroProfileV1,fromLegacyHoroscope,toCoreProfile,publicDescriptor,version:VERSION};
root.HorajarnProfileAdapterV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
