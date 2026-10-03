(function(root){'use strict';
const VERSION='2.8.7-thai-speech-normalizer';
const PREF_KEY='horajarnVoiceV2';
let token=0,timer=null,voicesCache=[];

const DIGIT_WORD=Object.freeze({
 '0':'ศูนย์','1':'หนึ่ง','2':'สอง','3':'สาม','4':'สี่',
 '5':'ห้า','6':'หก','7':'เจ็ด','8':'แปด','9':'เก้า'
});

function thaiDigits(n){return String(n).split('').map(d=>DIGIT_WORD[d]||d).join(' ')}
function cleanSpaces(s){return String(s==null?'':s).replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/\s*\n+\s*/g,'. ').trim()}
function normalizeNumbers(s){
 s=s.replace(/\((\d{1,2})\)/g,(m,n)=>', เลข'+thaiDigits(n)+', ');
 s=s.replace(/เลข\s*(\d{1,2})/g,(m,n)=>'เลข'+thaiDigits(n));
 return s;
}
function normalizeForSpeech(text){
 let s=cleanSpaces(text);
 s=normalizeNumbers(s);
 s=s.replace(/\s*•\s*/g,'. ');
 s=s.replace(/\s*[→➜]\s*/g,' ไปสู่ ');
 s=s.replace(/\s*[—–]\s*/g,', ');
 s=s.replace(/\bEvidence\b/gi,'หลักฐาน');
 s=s.replace(/\bConfidence\b/gi,'ระดับความมั่นใจ');
 s=s.replace(/\bFact\b/gi,'ข้อเท็จจริง');
 s=s.replace(/\bRule\b/gi,'หลักการ');
 s=s.replace(/\bInterpretation\b/gi,'การตีความ');
 s=s.replace(/\bAdvice\b/gi,'คำแนะนำ');
 s=s.replace(/\s*\/\s*/g,' และ ');
 s=s.replace(/\s*,\s*/g,', ');
 s=s.replace(/\s+/g,' ');
 s=s.replace(/([.!?。！？]){2,}/g,'$1');
 return s.trim();
}

function isStandaloneThaiWord(s){
 return /^[ก-๙]{1,10}[.!?。！？]?$/u.test(String(s||'').trim());
}
function contextualizeChunk(s){
 const x=String(s||'').trim();
 const m=x.match(/^([ก-๙]{1,10})([.!?。！？]?)$/u);
 if(m)return 'คำว่า '+m[1]+m[2];
 return x;
}

function splitLong(sentence,maxLen=120){
 const s=String(sentence||'').trim();
 if(s.length<=maxLen)return s?[s]:[];
 const breaks=[' จึง ',' โดย ',' ขณะที่ ',' ส่วน ',' แต่ ',' และ ',' ซึ่ง ',' เพราะ '];
 const out=[];let rest=s;
 while(rest.length>maxLen){
   let best=-1,bestToken='';
   for(const t of breaks){
     const i=rest.lastIndexOf(t,maxLen);
     if(i>45&&i>best){best=i;bestToken=t}
   }
   if(best<0){
     const i=rest.lastIndexOf(' ',maxLen);
     best=i>45?i:maxLen;
     bestToken='';
   }
   const part=rest.slice(0,best).trim();
   if(part)out.push(part);
   rest=rest.slice(best+(bestToken?bestToken.length:0)).trim();
 }
 if(rest)out.push(rest);
 return out;
}
function segmentText(text){
 const s=normalizeForSpeech(text);
 if(!s)return[];
 const raw=s.split(/(?<=[.!?。！？])\s+|;\s+|:\s+(?=[ก-๙A-Za-z])/u).map(x=>x.trim()).filter(Boolean);
 const out=[];
 for(const x of raw)out.push(...splitLong(x));
 return out.map(contextualizeChunk).filter(Boolean);
}
function kindOf(text){
 const s=String(text||'');
 if(/^(การงาน|การเงิน|ความรัก|ความสัมพันธ์|พื้นดวง|ดวงปี|ดวงเดือน|ดวงรายวัน|สรุป)/.test(s))return'heading';
 if(/^(คำแนะนำ|ควร|ข้อควร|ข้อจำกัด|ระวัง)/.test(s)||/ควรระวัง|ไม่ควร|ข้อจำกัด/.test(s))return'caution';
 if(/ช่วง|จังหวะ|ปัจจุบัน|วันนี้|ปีนี้|เดือนนี้/.test(s))return'timing';
 return'normal';
}
function plan(text,requestedRate=1){
 const base=Math.min(1.08,Math.max(.78,Number(requestedRate)||1));
 return segmentText(text).map((chunk,index)=>{
   const kind=kindOf(chunk);
   const factor=kind==='heading'?.90:kind==='caution'?.87:kind==='timing'?.91:.94;
   const pause=kind==='heading'?360:kind==='caution'?390:kind==='timing'?300:220;
   return Object.freeze({index,kind,text:chunk,rate:Number((base*factor).toFixed(3)),pitch:kind==='heading'?1.01:1,pauseAfterMs:pause});
 });
}

function allVoices(){
 if(!('speechSynthesis'in root)||!root.speechSynthesis.getVoices)return[];
 const v=root.speechSynthesis.getVoices()||[];
 voicesCache=v.slice();return voicesCache;
}
function thaiVoices(){return allVoices().filter(v=>String(v.lang||'').toLowerCase().startsWith('th'))}
function voiceId(v){return [v.name||'',v.lang||'',v.voiceURI||''].join('|||')}
function voiceScore(v){
 if(!v)return-999;
 const lang=String(v.lang||'').toLowerCase(),name=String(v.name||'').toLowerCase();
 if(!lang.startsWith('th'))return-100;
 let score=20;if(lang==='th-th')score+=8;if(v.localService)score+=3;if(/natural|neural|premium|enhanced/.test(name))score+=8;if(/google|samsung|thai|ภาษาไทย/.test(name))score+=4;
 return score;
}
function loadPref(){
 try{const p=JSON.parse(localStorage.getItem(PREF_KEY)||'null');return p&&typeof p==='object'?p:{mode:'system',voiceId:''}}catch{return{mode:'system',voiceId:''}}
}
function savePref(p){try{localStorage.setItem(PREF_KEY,JSON.stringify(p));return true}catch{return false}}
function selectedVoice(){
 const p=loadPref(),voices=thaiVoices();
 if(p.mode==='system')return null;
 if(p.mode==='manual')return voices.find(v=>voiceId(v)===p.voiceId)||null;
 if(p.mode==='auto')return voices.slice().sort((a,b)=>voiceScore(b)-voiceScore(a))[0]||null;
 return null;
}
function selectionInfo(){
 const p=loadPref(),v=selectedVoice(),list=thaiVoices();
 return Object.freeze({mode:p.mode||'system',selected:v?{name:v.name||'',lang:v.lang||'',localService:!!v.localService}:null,thaiVoiceCount:list.length,voices:list.map(x=>({id:voiceId(x),name:x.name||'',lang:x.lang||'',localService:!!x.localService}))});
}
function status(cb,msg){try{if(typeof cb==='function')cb(msg)}catch{}}
function stop(onStatus){
 token++;if(timer){clearTimeout(timer);timer=null}
 if('speechSynthesis'in root)root.speechSynthesis.cancel();
 if(onStatus)status(onStatus,'หยุดเสียงแล้ว');
}
function speak(text,opts={}){
 if(!text||!('speechSynthesis'in root)||typeof root.SpeechSynthesisUtterance!=='function')return false;
 const items=plan(text,opts.rate||1);if(!items.length)return false;
 const my=++token;if(timer){clearTimeout(timer);timer=null}root.speechSynthesis.cancel();
 const voice=selectedVoice(),pref=loadPref();let idx=0;
 function next(){
   if(my!==token)return;
   if(idx>=items.length){status(opts.onStatus,'อ่านจบแล้ว');return}
   const item=items[idx++],u=new root.SpeechSynthesisUtterance(item.text);
   u.lang='th-TH';u.rate=item.rate;u.pitch=item.pitch;
   if(voice)u.voice=voice;
   u.onstart=()=>status(opts.onStatus,(pref.mode==='system'?'System Thai':voice?voice.name:'Thai voice')+' • กำลังอ่าน…');
   u.onerror=()=>status(opts.onStatus,'เสียงไทยของเครื่องอ่านผิดปกติ ลองเปลี่ยน Voice Engine');
   u.onend=()=>{if(my!==token)return;timer=setTimeout(()=>{timer=null;next()},item.pauseAfterMs)};
   root.speechSynthesis.speak(u);
 }
 next();return true;
}

function createOption(value,label){const o=document.createElement('option');o.value=value;o.textContent=label;return o}
function addDiagnosticUI(){
 if(typeof document==='undefined'||document.getElementById('horajarnVoiceEngineBox'))return;
 const rate=document.getElementById('voiceRate');if(!rate)return;
 const parent=rate.parentElement||rate.closest('div')||document.body;
 const box=document.createElement('div');box.id='horajarnVoiceEngineBox';box.style.cssText='margin-top:10px;padding:10px;border:1px solid #e3d8c6;border-radius:14px;background:#fffaf1;font-size:12px';
 const title=document.createElement('b');title.textContent='Voice Engine ภาษาไทย';box.appendChild(title);
 const sel=document.createElement('select');sel.id='horajarnVoiceSelect';sel.style.cssText='width:100%;margin-top:7px;padding:9px;border-radius:10px';
 sel.appendChild(createOption('system','System Thai — ให้ Android เลือกเสียงไทย'));
 sel.appendChild(createOption('auto','Auto — ให้ HORAJARN เลือกเสียงไทย'));
 const voices=thaiVoices();
 for(const v of voices)sel.appendChild(createOption('voice:'+voiceId(v),(v.name||'Thai voice')+' • '+(v.lang||'')));
 const pref=loadPref();
 sel.value=pref.mode==='manual'&&pref.voiceId?'voice:'+pref.voiceId:(pref.mode||'system');

 const test=document.createElement('button');
 test.type='button';test.textContent='🔊 ทดสอบเสียงไทยธรรมชาติ';test.style.cssText='width:100%;margin-top:7px;padding:9px;border-radius:10px';

 const info=document.createElement('div');info.id='horajarnVoiceInfo';info.style.cssText='margin-top:6px;color:#756b7b;font-size:11px;line-height:1.45';
 function renderInfo(){
   const x=selectionInfo(),label=x.mode==='system'?'System Thai':x.selected?(x.selected.name+' • '+x.selected.lang):'ไม่พบเสียงไทยที่เลือก';
   info.textContent='กำลังใช้: '+label+' • พบเสียงไทย '+x.thaiVoiceCount+' เสียง';
 }
 sel.onchange=()=>{
   if(sel.value==='system'||sel.value==='auto')savePref({mode:sel.value,voiceId:''});
   else savePref({mode:'manual',voiceId:sel.value.slice(6)});
   renderInfo();
 };
 test.onclick=()=>speak('คำว่า ชอบ. ฉันชอบเรียนรู้. ดาวอังคาร, เลขสาม.',{rate:1,onStatus:m=>{info.textContent=m}});
 box.appendChild(sel);box.appendChild(test);box.appendChild(info);parent.appendChild(box);renderInfo();
}
function init(){allVoices();addDiagnosticUI()}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 if('speechSynthesis'in root)root.speechSynthesis.onvoiceschanged=()=>{allVoices();const box=document.getElementById('horajarnVoiceEngineBox');if(box){box.remove();addDiagnosticUI()}};
}

const API={VERSION,normalizeForSpeech,isStandaloneThaiWord,contextualizeChunk,segmentText,kindOf,plan,thaiVoices,voiceId,voiceScore,loadPref,savePref,selectedVoice,selectionInfo,speak,stop,addDiagnosticUI,version:VERSION};
root.HorajarnNaturalVoiceV2=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
