(function(root){'use strict';
const VERSION='2.8.4-voice-overview-sync';
let lastModels=null;
function deps(){if(!root.HorajarnInterpretationQualityV2)throw new Error('V2_8_4_UI_DEPENDENCY_MISSING')}
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function ensureStyle(){
 if(document.getElementById('horajarn-v2-8-4-style'))return;
 const s=document.createElement('style');s.id='horajarn-v2-8-4-style';
 s.textContent='.hi284-overview{margin-top:12px;border:1px solid #d9c99f;background:linear-gradient(180deg,#fffaf0,#f8f1ff);border-radius:18px;padding:13px}.hi284-overview h3{margin:0;font-size:12px}.hi284-overview p{font-size:9px;line-height:1.6;color:#62596a;margin:7px 0 0}.hi284-grid{display:grid;grid-template-columns:1fr;gap:7px;margin-top:9px}.hi284-row{border:1px solid #e7ddce;background:#fff;border-radius:13px;padding:10px}.hi284-row b{font-size:9px;line-height:1.5}.hi284-row small{display:block;margin-top:4px;color:#766d7d;font-size:8px;line-height:1.55}.hi284-note{margin-top:9px;padding-top:9px;border-top:1px dashed #e6dbe9;font-size:.82rem;line-height:1.62;color:#6f6577}.hi284-note strong{color:#59468f}.hi284-timing{margin-top:6px}.hi284-advice{margin-top:6px}.hi284-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.hi284-chip{font-size:7px;padding:4px 6px;border-radius:999px;background:#f6f0e7;border:1px solid #e4d8c7;color:#655b70}.hi284-caveat{margin-top:8px;font-size:7px!important;color:#8a8290!important}.hi284-speak{width:100%;margin-top:10px}@media(min-width:520px){.hi284-grid{grid-template-columns:repeat(3,1fr)}}';
 document.head.appendChild(s);
}
function overviewText(models){
 if(!models)return'';
 const parts=['สรุปเรื่องสำคัญจากหลักฐานของดวงนี้'];
 for(const key of ['work','money','partner']){
   const m=models[key];
   if(m)parts.push([m.headline,m.body].filter(Boolean).join('. '));
 }
 parts.push('ระดับความมั่นใจหมายถึงคุณภาพของหลักฐานและการตรวจย้อนกลับ ไม่ใช่เปอร์เซ็นต์ว่าเหตุการณ์จะเกิด');
 return parts.filter(Boolean).join('. ');
}
function overview(models){
 const box=el('article','hi284-overview intelligence-overview-v2');
 box.appendChild(el('div','tag','HORAJARN INTELLIGENCE • NATURAL SYNTHESIS'));
 box.appendChild(el('h3','', 'สรุปเรื่องสำคัญจากหลักฐานของดวงนี้'));
 box.appendChild(el('p','', 'ระบบเลือกแกนหลัก หลักประกอบ และจังหวะเวลาแยกกันก่อนสรุป เพื่อให้แต่ละเรื่องมีน้ำหนักและภาษาเฉพาะของตนเอง'));
 const grid=el('div','hi284-grid');
 for(const key of ['work','money','partner']){
   const m=models[key],row=el('div','hi284-row');
   row.appendChild(el('b','',m.headline));
   row.appendChild(el('small','',m.body));
   grid.appendChild(row);
 }
 box.appendChild(grid);
 box.appendChild(el('p','hi284-caveat','ระดับความมั่นใจหมายถึงคุณภาพของหลักฐานและการตรวจย้อนกลับ ไม่ใช่เปอร์เซ็นต์ว่าเหตุการณ์จะเกิด'));
 const speak=el('button','speak-one hi284-speak','🔊 ฟังสรุปนี้');
 speak.type='button';
 speak.dataset.speech=encodeURIComponent(overviewText(models));
 box.appendChild(speak);
 return box;
}
function updateSpeakButton(card,m){
 const b=card&&card.querySelector('.speak-one');if(!b)return;
 const speech=root.HorajarnInterpretationQualityV2.spokenText(m);
 b.dataset.speech=encodeURIComponent(speech);
}
function enhanceCard(card,m){
 if(!card)return false;
 card.dataset.intelligence='v2.8.4';
 const p=card.querySelector('p');if(p)p.textContent=m.body;
 let note=card.querySelector('.np-note');if(!note){note=el('div','np-note');card.appendChild(note)}
 note.textContent='';
 const wrap=el('div','hi284-note');
 const strong=el('strong','',m.conclusionText+' • '+m.confidenceText);wrap.appendChild(strong);
 wrap.appendChild(el('div','hi284-timing',m.timing));
 wrap.appendChild(el('div','hi284-advice','คำแนะนำ: '+m.advice));
 if(m.uncertaintyCode!=='NORMAL')wrap.appendChild(el('div','hi284-timing','ข้อจำกัด: '+m.uncertaintyText));
 note.appendChild(wrap);
 const meta=el('div','hi284-meta');
 meta.appendChild(el('span','hi284-chip','หลักฐาน '+m.evidenceCount+' จุด'));
 meta.appendChild(el('span','hi284-chip','ตรวจย้อนกลับ '+m.traceRefs.length+' จุด'));
 note.appendChild(meta);
 updateSpeakButton(card,m);
 return true;
}
function legacySentence(item){
 if(!item)return'';
 const title=String(item.title||'').trim(),text=String(item.text||'').trim(),note=String(item.note||'').trim();
 return [title,text,note].filter(Boolean).join(': ');
}
function summaryText(legacyItems){
 if(!lastModels)return(legacyItems||[]).map(legacySentence).filter(Boolean).join('. ');
 const intelligenceKeys=new Set(['work','money','partner']);
 const out=[];let inserted=false;
 for(const item of legacyItems||[]){
   if(intelligenceKeys.has(item&&item.key)){
     if(!inserted){out.push(overviewText(lastModels));inserted=true}
     continue;
   }
   const s=legacySentence(item);if(s)out.push(s);
 }
 if(!inserted)out.push(overviewText(lastModels));
 return out.filter(Boolean).join('. ');
}
function hasModels(){return !!lastModels}
function getLastModels(){return lastModels}
function apply(profile,target=new Date()){
 deps();ensureStyle();
 const panel=document.getElementById('natalPanel');if(!panel)throw new Error('V2_8_4_NATAL_PANEL_MISSING');
 const models=root.HorajarnInterpretationQualityV2.build(profile,target);
 lastModels=models;
 panel.querySelectorAll('.intelligence-overview-v2').forEach(x=>x.remove());
 const intro=panel.querySelector('.natal-intro');
 if(intro)intro.insertAdjacentElement('afterend',overview(models));else panel.prepend(overview(models));
 let changed=0;
 for(const key of ['work','money','partner']){
   const card=panel.querySelector(`[data-natal-key="${key}"]`);
   if(enhanceCard(card,models[key]))changed++;
 }
 if(changed!==3)throw new Error('V2_8_4_EXPECTED_THREE_CARDS_GOT_'+changed);
 return Object.freeze({ok:true,version:VERSION,changed,models});
}
const API={VERSION,apply,overviewText,summaryText,hasModels,getLastModels,version:VERSION};
root.HorajarnInterpretationUIV2=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
