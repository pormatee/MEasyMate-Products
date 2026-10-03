(function(root){'use strict';
const KEY='astroProfileV1',VERSION='2.8.4-voice-overview-sync';
const $=id=>document.getElementById(id);
function showRuntimeError(message){const el=$('errorBox');if(!el)return;el.textContent='V2 runtime: '+String(message||'UNKNOWN_ERROR');el.classList.add('show')}
function read(){try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null}catch{return null}}
function setValue(id,v){const el=$(id);if(el&&v!==undefined&&v!==null)el.value=String(v)}
function fill(){const p=read();if(!p)return false;try{const y=Number(p.year),eraButton=(Number.isFinite(y)&&y<=2400)?$('ceBtn'):$('beBtn');if(eraButton&&typeof eraButton.click==='function')eraButton.click();setValue('nickname',p.name||'');setValue('day',p.day);setValue('month',p.month);setValue('year',p.year);setValue('hour',p.hour===''?'':p.hour);setValue('minute',p.minute===''?'':p.minute);return true}catch(e){showRuntimeError(e&&e.message?e.message:e);return false}}
function current(){return{name:($('nickname')?.value||'').trim(),day:Number($('day')?.value),month:Number($('month')?.value),year:Number($('year')?.value),hour:($('hour')?.value||'').trim(),minute:($('minute')?.value||'').trim(),place:''}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(current()));return true}catch(e){showRuntimeError(e&&e.message?e.message:e);return false}}
function mark(){document.documentElement.dataset.horajarnEngine='intelligence-v2.8.4';const box=document.querySelector('.method');if(box&&!box.dataset.v284Marked){box.dataset.v284Marked='1';box.insertAdjacentHTML('afterbegin','<b>HORAJARN INTELLIGENCE V2.8.4 • VOICE SYNC</b><br>')}}
function init(){mark();fill();const open=$('openBtn');if(open)open.addEventListener('click',save);const dayRule=$('dayRule');if(dayRule){dayRule.value='dawn';dayRule.disabled=true}root.addEventListener&&root.addEventListener('error',e=>showRuntimeError(e.error?.message||e.message||'SCRIPT_ERROR'));root.addEventListener&&root.addEventListener('unhandledrejection',e=>showRuntimeError(e.reason?.message||e.reason||'PROMISE_ERROR'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
root.HorajarnUIAdapterV2={VERSION,read,fill,save,current,showRuntimeError,version:VERSION};
})(typeof globalThis!=='undefined'?globalThis:this);
