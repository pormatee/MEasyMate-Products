global.window=global;
global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=String(v)}};
require('../v2/natural-voice-v2.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};

assert(HorajarnNaturalVoiceV2.contextualizeChunk('ชอบ')==='คำว่า ชอบ','single-thai-context');
assert(HorajarnNaturalVoiceV2.contextualizeChunk('ชอบ.')==='คำว่า ชอบ.','single-thai-context-punct');
assert(HorajarnNaturalVoiceV2.contextualizeChunk('ฉันชอบเรียนรู้')==='ฉันชอบเรียนรู้','sentence-unchanged');

const n1=HorajarnNaturalVoiceV2.normalizeForSpeech('ดาวอังคาร (3)');
assert(n1.includes('เลขสาม'),'paren-number');
assert(!n1.includes('(3)'),'paren-removed');

const n2=HorajarnNaturalVoiceV2.normalizeForSpeech('ดาวอังคารเลข3');
assert(n2.includes('เลขสาม'),'compact-number');

const seg=HorajarnNaturalVoiceV2.segmentText('ชอบ. ฉันชอบเรียนรู้. ดาวอังคาร (3).');
assert(seg[0]==='คำว่า ชอบ.','segment-context');
assert(seg.join(' ').includes('เลขสาม'),'segment-number');

console.log('HORAJARN_INTELLIGENCE_V2_8_7_SPEECH_UNIT=PASS');
