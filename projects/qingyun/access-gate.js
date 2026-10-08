(function(){
"use strict";
const CFG=Object.freeze({
  product:"qingyun",edition:"commercial_v1",trialDays:7,priceTHB:79,
  buyUrl:"https://lin.ee/T80LRHU",keyId:"5cfd0fb222332b17",
  publicJwk:{"kty":"EC","crv":"P-256","x":"foTZspxqFk4e8yTXs0uO7qxPbpuWvzsFRABOD68PEMw","y":"O-F7O9DrmXtYaxg3zHU6voPeci-8DwKUhPyaPcL-JmA","ext":true},
  storageKey:"qingyun_commercial_license_v1",clockRollbackToleranceMs:300000
});
const DAY=86400000, qs=new URLSearchParams(location.search);
const LOCAL_TEST_HOSTS=new Set(["127.0.0.1","localhost","::1"]);
const testMode=LOCAL_TEST_HOSTS.has(location.hostname)&&qs.get("test")==="1";
const forcedTrial=testMode?qs.get("trial"):null;
const forcedLicensed=testMode&&qs.get("access")==="licensed";
let state=null, entitlement=null, status="CHECKING", trialCreated=false;
const pendingEvents=[];
function now(){return Date.now()}
function track(e){
  try{if(window.MEasyMateAnalytics?.track)return !!window.MEasyMateAnalytics.track(e)}catch(_){}
  pendingEvents.push(e); return false;
}
function flushEvents(){
  if(!window.MEasyMateAnalytics?.track)return;
  while(pendingEvents.length){
    try{window.MEasyMateAnalytics.track(pendingEvents.shift())}catch(_){break}
  }
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function uuid(){
  if(crypto?.randomUUID)return crypto.randomUUID();
  const a=new Uint8Array(16);crypto.getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
  return [...a].map((b,i)=>(i===4||i===6||i===8||i===10?"-":"")+b.toString(16).padStart(2,"0")).join("");
}
function b64u(s){
  s=String(s).replace(/-/g,"+").replace(/_/g,"/");s+="=".repeat((4-s.length%4)%4);
  const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;
}
function load(){
  try{const v=JSON.parse(localStorage.getItem(CFG.storageKey)||"null");if(v&&v.installId)return v}catch(_){}
  const t=now();trialCreated=true;
  return {schemaVersion:1,installId:uuid(),trialStartedAt:t,trialExpiresAt:t+CFG.trialDays*DAY,lastSeenAt:t,clockRollbackDetected:false,activationCode:""};
}
function save(){localStorage.setItem(CFG.storageKey,JSON.stringify(state))}
function updateClock(){
  const t=now();
  if(Number(state.lastSeenAt)&&t+CFG.clockRollbackToleranceMs<Number(state.lastSeenAt))state.clockRollbackDetected=true;
  if(!Number(state.lastSeenAt)||t>Number(state.lastSeenAt))state.lastSeenAt=t;
  save();
}
function trialActive(){
  if(forcedTrial==="expired")return false;
  if(forcedTrial==="active")return true;
  return !state.clockRollbackDetected&&now()<Number(state.trialExpiresAt||0);
}
function daysRemaining(){
  if(forcedTrial==="expired")return 0;
  if(forcedTrial==="active")return CFG.trialDays;
  return Math.max(0,Math.ceil((Number(state.trialExpiresAt||0)-now())/DAY));
}
async function verifyActivation(code){
  if(!code)throw Error("ไม่พบ Activation Code");
  const p=String(code).trim().split(".");
  if(p.length!==3||p[0]!=="QY1")throw Error("รูปแบบ Activation Code ไม่ถูกต้อง");
  const raw=p[1],sig=b64u(p[2]);
  let payload;
  try{payload=JSON.parse(new TextDecoder().decode(b64u(raw)))}catch(_){throw Error("ข้อมูล License ไม่ถูกต้อง")}
  if(payload.v!==1||payload.product!==CFG.product||payload.edition!==CFG.edition||
     payload.installId!==state.installId||payload.permanentV1!==true||payload.keyId!==CFG.keyId)
    throw Error("License ไม่ตรงกับ QingYun เครื่องนี้");
  if(!crypto?.subtle)throw Error("Browser นี้ไม่รองรับระบบยืนยัน License");
  const key=await crypto.subtle.importKey("jwk",CFG.publicJwk,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
  const ok=await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},key,sig,new TextEncoder().encode(raw));
  if(!ok)throw Error("ตรวจสอบลายเซ็นไม่ผ่าน");
  return payload;
}
function toast(t){
  let e=document.getElementById("qyAccessToast");
  if(!e){e=document.createElement("div");e.id="qyAccessToast";e.style.cssText="position:fixed;z-index:1600;left:50%;bottom:24px;transform:translateX(-50%);background:#18181b;color:#fff;padding:10px 14px;border-radius:12px;font:12px system-ui";document.body.appendChild(e)}
  e.textContent=t;clearTimeout(e._t);e._t=setTimeout(()=>e.remove(),2200);
}
function copyText(t){
  const fallback=()=>{const ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("คัดลอกแล้ว")};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>toast("คัดลอกแล้ว")).catch(fallback);else fallback();
}
function openPanel(){
  document.getElementById("qyAccessPanel")?.remove();
  const full=status==="FULL_LICENSED",trial=status==="FULL_TRIAL";
  const ov=document.createElement("div");ov.id="qyAccessPanel";
  ov.style.cssText="position:fixed;z-index:1500;inset:0;background:rgba(9,9,11,.72);display:grid;place-items:center;padding:16px";
  ov.innerHTML=`<div style="width:min(560px,100%);max-height:92vh;overflow:auto;background:var(--surface,#fff);color:var(--ink,#18181b);border-radius:24px;padding:20px;border:1px solid var(--line,#ddd)">
    <button id="qyAccessClose" style="float:right;border:0;background:transparent;font-size:22px;color:inherit">×</button>
    <div style="font-size:11px;font-weight:900;color:#b91c1c">QINGYUN • FULL PACK</div>
    <h2 style="margin:7px 0">${full?"ปลดล็อกครบแล้ว":trial?`ทดลองเต็มระบบ • เหลือ ${daysRemaining()} วัน`:"เรียนพื้นฐานต่อได้ • ปลดล็อกเมื่อพร้อม"}</h2>
    <p style="line-height:1.6;color:var(--muted,#71717a)">Full Pack: 1,200 คำ • 180 Missions • 150 ตัวอักษรจีน<br>หลังทดลอง 7 วัน หากยังไม่ซื้อ แอปยังใช้ได้ตามปกติที่ 185 คำ • 9 Missions • 30 ตัวอักษรจีน</p>
    <div style="font:11px ui-monospace;word-break:break-all;padding:10px;background:var(--surface2,#fafafa);border-radius:12px">${esc(state.installId)}</div>
    <button id="qyCopyId" style="margin-top:8px;padding:10px;border-radius:12px;border:1px solid var(--line,#ddd);background:var(--surface2,#fafafa);color:inherit">คัดลอก Installation ID</button>
    ${full?"":`<a id="qyBuy" href="${CFG.buyUrl}" target="_blank" rel="noopener" style="display:flex;justify-content:center;margin-top:12px;padding:12px;border-radius:13px;background:#b91c1c;color:white;text-decoration:none;font-weight:900">ปลดล็อก Full Pack • ${CFG.priceTHB} บาท</a>
    <textarea id="qyCode" placeholder="วาง Activation Code" style="width:100%;min-height:86px;margin-top:12px;border:1px solid var(--line,#ddd);border-radius:12px;padding:10px;background:var(--surface2,#fafafa);color:inherit"></textarea>
    <button id="qyActivate" style="width:100%;margin-top:8px;padding:12px;border:0;border-radius:13px;background:#18181b;color:#fff;font-weight:900">Activate</button>
    <div id="qyAccessMsg" style="font-size:12px;margin-top:8px"></div>`}
  </div>`;
  document.body.appendChild(ov);
  document.getElementById("qyAccessClose").onclick=()=>ov.remove();
  document.getElementById("qyCopyId").onclick=()=>copyText(state.installId);
  document.getElementById("qyBuy")?.addEventListener("click",()=>track("buy_click"));
  document.getElementById("qyActivate")?.addEventListener("click",async()=>{
    const msg=document.getElementById("qyAccessMsg");
    try{
      msg.textContent="กำลังตรวจสอบ…";
      const code=document.getElementById("qyCode").value.trim();
      entitlement=await verifyActivation(code);state.activationCode=code;save();status="FULL_LICENSED";track("activation_success");
      msg.textContent="✓ ปลดล็อกสำเร็จ";setTimeout(()=>location.reload(),450);
    }catch(e){msg.textContent=e?.message||"Activation ไม่สำเร็จ"}
  });
}
function renderBar(){
  document.getElementById("qyAccessBar")?.remove();
  if(status==="FULL_LICENSED")return;
  const b=document.createElement("div");b.id="qyAccessBar";
  b.style.cssText="position:static;z-index:60;display:flex;align-items:center;justify-content:space-between;gap:8px;width:min(900px,calc(100% - 20px));margin:5px auto 4px;padding:5px 8px;border:1px solid rgba(170,0,0,.10);border-radius:14px;background:rgba(255,250,250,.97);box-shadow:0 6px 16px rgba(0,0,0,.06);backdrop-filter:blur(8px);font-family:inherit";
  b.innerHTML=status==="FULL_TRIAL"?`<div class="qyTrialBarText"><b>ทดลองเต็ม • เหลือ ${daysRemaining()} วัน</b><span>Full Access</span></div><button>ปลดล็อก</button>`:`<div class="qyTrialBarText"><b>โหมดพื้นฐาน</b><span>185 คำ • 9 Missions • 30 Hanzi</span></div><button>Full Pack</button>`;
  const btn=b.querySelector("button");btn.style.cssText="border:0;border-radius:11px;padding:8px 10px;background:#b91c1c;color:#fff;font-weight:900";
  btn.onclick=()=>{track("unlock_open");openPanel()};const mountBar=()=>{const topbar=document.querySelector(".topbar");if(topbar&&topbar.parentNode){topbar.insertAdjacentElement("afterend",b);return true}const main=document.querySelector("main");if(main&&main.parentNode){main.parentNode.insertBefore(b,main);return true}return false};const bootMount=()=>{if(!mountBar()){requestAnimationFrame(()=>{if(!mountBar())document.body.insertBefore(b,document.body.firstChild)})}};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootMount,{once:true});else bootMount();
}
const ready=(async()=>{
  state=load();updateClock();if(trialCreated)track("trial_started");
  if(forcedLicensed){status="FULL_LICENSED";entitlement={permanentV1:true,freeV2Upgrade:true}}
  else if(state.activationCode){try{entitlement=await verifyActivation(state.activationCode);status="FULL_LICENSED"}catch(_){status=trialActive()?"FULL_TRIAL":"LIMITED"}}
  else status=trialActive()?"FULL_TRIAL":"LIMITED";
  if(status==="LIMITED"&&!state.trialExpiredTrackedAt&&!testMode){state.trialExpiredTrackedAt=now();save();track("trial_expired")}
  if(status==="FULL_LICENSED")track("licensed_open");
  setTimeout(flushEvents,800);
  const show=()=>renderBar();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",show,{once:true});else show();
  return status;
})();
window.QingYunAccess=Object.freeze({
  ready,isFull:()=>status==="FULL_TRIAL"||status==="FULL_LICENSED",status:()=>status,daysRemaining,
  open:openPanel,installId:()=>state?.installId||null,
  counts:()=>({vocab:status==="LIMITED"?185:1200,missions:status==="LIMITED"?9:180,hanzi:status==="LIMITED"?30:150})
});
})();
