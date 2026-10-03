const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'horoscope.html'),'utf8');
const voice=fs.readFileSync(path.join(root,'v2/natural-voice-v2.js'),'utf8');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const script='<script src="v2/natural-voice-v2.js"></script>';
assert(html.includes(script),'natural-voice-script');assert(html.split(script).length===2,'voice-script-duplicate');assert(html.includes('HORAJARN_V2_8_5_NATURAL_VOICE_HOOK'),'speak-hook');assert(html.includes('HorajarnNaturalVoiceV2.stop(updateVoiceStatus)'),'stop-hook');assert(html.includes('INTELLIGENCE V2.8.5'),'version');assert(html.includes('>ธรรมชาติ</option>'),'natural-rate-label');assert(voice.includes("u.lang='th-TH'"),'thai-locale');assert(voice.includes('pauseAfterMs'),'pause-plan');assert(voice.includes('selectThaiVoice'),'voice-selection');
for(const marker of ['fetch(','XMLHttpRequest','sendBeacon('])assert(!voice.includes(marker),'network:'+marker);
console.log('HORAJARN_INTELLIGENCE_V2_8_5_PRODUCTION_STATIC=PASS');
