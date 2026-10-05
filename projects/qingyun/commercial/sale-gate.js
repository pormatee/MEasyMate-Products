/* QingYun Commercial V1 — Sale Gate V1
 * 7-day full trial + offline signed activation.
 * This layer is intentionally separate from the learning engine.
 */
(function(){
  "use strict";

  const CFG=Object.freeze({
    product:"qingyun",
    edition:"commercial_v1",
    trialDays:7,
    priceTHB:79,
    campaign:"LAUNCH_79",
    freeV2Upgrade:true,
    buyUrl:"https://lin.ee/T80LRHU",
    keyId:"5cfd0fb222332b17",
    publicJwk:{"kty":"EC","crv":"P-256","x":"foTZspxqFk4e8yTXs0uO7qxPbpuWvzsFRABOD68PEMw","y":"O-F7O9DrmXtYaxg3zHU6voPeci-8DwKUhPyaPcL-JmA","ext":true},
    storageKey:"qingyun_commercial_license_v1",
    clockRollbackToleranceMs:5*60*1000
  });

  const DAY=24*60*60*1000;
  const qs=new URLSearchParams(location.search);
  const LOCAL_TEST_HOSTS=new Set(["127.0.0.1","localhost","::1"]);
  const testMode=LOCAL_TEST_HOSTS.has(location.hostname)&&qs.get("test")==="1";
  const forcedTrial=testMode?qs.get("trial"):null;
  let state=null;
  let entitlement=null;
  let status="CHECKING";

  function now(){return Date.now()}
  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function uuid(){
    if(crypto&&typeof crypto.randomUUID==="function")return crypto.randomUUID();
    const a=new Uint8Array(16);crypto.getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
    return [...a].map((b,i)=>(i===4||i===6||i===8||i===10?"-":"")+b.toString(16).padStart(2,"0")).join("");
  }
  function b64uToBytes(s){
    s=String(s).replace(/-/g,"+").replace(/_/g,"/");
    s+="=".repeat((4-s.length%4)%4);
    const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;
  }
  function bytesToText(u){return new TextDecoder().decode(u)}
  function load(){
    try{
      const v=JSON.parse(localStorage.getItem(CFG.storageKey)||"null");
      if(v&&typeof v==="object"&&v.installId)return v;
    }catch(_){}
    const t=now();
    return {schemaVersion:1,installId:uuid(),trialStartedAt:t,trialExpiresAt:t+CFG.trialDays*DAY,lastSeenAt:t,clockRollbackDetected:false,activationCode:""};
  }
  function save(){localStorage.setItem(CFG.storageKey,JSON.stringify(state))}
  function updateClock(){
    const t=now();
    if(Number(state.lastSeenAt)&&t+CFG.clockRollbackToleranceMs<Number(state.lastSeenAt))state.clockRollbackDetected=true;
    if(!Number(state.lastSeenAt)||t>Number(state.lastSeenAt))state.lastSeenAt=t;
    save();
  }
  function trialIsActive(){
    if(forcedTrial==="expired")return false;
    if(forcedTrial==="active")return true;
    return !state.clockRollbackDetected && now()<Number(state.trialExpiresAt||0);
  }
  function daysRemaining(){
    if(forcedTrial==="expired")return 0;
    if(forcedTrial==="active")return CFG.trialDays;
    return Math.max(0,Math.ceil((Number(state.trialExpiresAt||0)-now())/DAY));
  }
  async function verifyActivation(code){
    if(!code||typeof code!=="string")throw new Error("ไม่พบ Activation Code");
    const p=code.trim().split(".");
    if(p.length!==3||p[0]!=="QY1")throw new Error("รูปแบบ Activation Code ไม่ถูกต้อง");
    const payloadB64=p[1],sig=b64uToBytes(p[2]);
    if(sig.length!==64)throw new Error("ลายเซ็นไม่ถูกต้อง");
    let payload;
    try{payload=JSON.parse(bytesToText(b64uToBytes(payloadB64)))}catch(_){throw new Error("ข้อมูล License ไม่ถูกต้อง")}
    if(payload.v!==1||payload.product!==CFG.product||payload.edition!==CFG.edition)throw new Error("License ไม่ตรงกับ QingYun Commercial V1");
    if(payload.installId!==state.installId)throw new Error("Activation Code นี้เป็นของ Installation ID อื่น");
    if(payload.permanentV1!==true)throw new Error("License ไม่มีสิทธิ์ V1 ถาวร");
    if(payload.keyId!==CFG.keyId)throw new Error("License key version ไม่ตรงกัน");
    if(!crypto?.subtle)throw new Error("Browser นี้ไม่รองรับระบบยืนยัน License");
    const key=await crypto.subtle.importKey("jwk",CFG.publicJwk,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
    const ok=await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},key,sig,new TextEncoder().encode(payloadB64));
    if(!ok)throw new Error("ตรวจสอบลายเซ็น Activation ไม่ผ่าน");
    return payload;
  }
  async function refreshEntitlement(){
    entitlement=null;
    if(state.activationCode){
      try{entitlement=await verifyActivation(state.activationCode)}catch(_){entitlement=null}
    }
    status=entitlement?"ACTIVATED":trialIsActive()?"TRIAL":"EXPIRED";
    render();
    return status;
  }
  function copyText(text,msg){
    const fallback=()=>{const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast(msg)};
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>toast(msg)).catch(fallback);else fallback();
  }
  function orderMessage(){
    return `QingYun Commercial V1\nโปรโมชั่น ${CFG.priceTHB} บาท\nInstallation ID: ${state.installId}\nสิทธิ์ V1 ถาวร + อัปเกรด V2 ฟรี`;
  }
  function toast(text){
    let el=document.getElementById("qySaleToast");
    if(!el){el=document.createElement("div");el.id="qySaleToast";document.body.appendChild(el)}
    el.textContent=text;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),2200);
  }
  function injectStyle(){
    if(document.getElementById("qySaleStyle"))return;
    const st=document.createElement("style");st.id="qySaleStyle";st.textContent=`
      #qySaleBar{position:fixed;z-index:1190;left:50%;transform:translateX(-50%);bottom:calc(max(env(safe-area-inset-bottom),14px) + 78px);width:min(900px,calc(100% - 24px));background:color-mix(in srgb,var(--surface,#fff) 97%,transparent);border:1px solid var(--line,#e4e4e7);box-shadow:0 12px 34px rgba(0,0,0,.16);border-radius:16px;padding:9px 11px;display:flex;gap:9px;align-items:center;justify-content:space-between;font-family:system-ui,-apple-system,"Noto Sans Thai",sans-serif}
      #qySaleBar .txt{min-width:0;font-size:11px;line-height:1.35;color:var(--ink,#18181b)}#qySaleBar .txt b{display:block;font-size:12px}#qySaleBar button{border:0;border-radius:11px;padding:8px 10px;background:#b91c1c;color:#fff;font-weight:900;white-space:nowrap}
      #qySaleOverlay{position:fixed;z-index:1300;inset:0;background:rgba(9,9,11,.76);backdrop-filter:blur(10px);display:grid;place-items:center;padding:18px;font-family:system-ui,-apple-system,"Noto Sans Thai",sans-serif}
      #qySaleOverlay .panel{width:min(560px,100%);max-height:92vh;overflow:auto;background:var(--surface,#fff);color:var(--ink,#18181b);border:1px solid var(--line,#e4e4e7);border-radius:24px;padding:20px;box-shadow:0 24px 80px rgba(0,0,0,.35)}
      #qySaleOverlay h2{margin:4px 0 7px;font-size:24px}#qySaleOverlay p{font-size:13px;line-height:1.6;color:var(--muted,#71717a)}
      #qySaleOverlay .hero{padding:15px;border-radius:18px;background:linear-gradient(145deg,#7f1d1d,#b91c1c 55%,#ea580c);color:#fff;margin-bottom:14px}#qySaleOverlay .hero p{color:#fff;margin:5px 0 0;opacity:.92}
      #qySaleOverlay .grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}#qySaleOverlay .box{padding:12px;border:1px solid var(--line,#e4e4e7);border-radius:15px;background:var(--surface2,#fafafa)}#qySaleOverlay .box b{display:block;font-size:18px}#qySaleOverlay .box span{font-size:10.5px;color:var(--muted,#71717a)}
      #qySaleOverlay textarea{width:100%;min-height:92px;border:1px solid var(--line,#e4e4e7);border-radius:14px;background:var(--surface2,#fafafa);color:var(--ink,#18181b);padding:11px;font:12px ui-monospace,SFMono-Regular,monospace}
      #qySaleOverlay .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#qySaleOverlay button,#qySaleOverlay a.btn{min-height:43px;border:0;border-radius:13px;padding:10px 13px;font-weight:900;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
      #qySaleOverlay .primary{background:#b91c1c;color:#fff}#qySaleOverlay .soft{background:var(--surface2,#fafafa);color:var(--ink,#18181b);border:1px solid var(--line,#e4e4e7)}
      #qySaleOverlay .full{width:100%}#qySaleOverlay .id{font:11px ui-monospace,SFMono-Regular,monospace;word-break:break-all;padding:9px;border-radius:11px;background:var(--surface2,#fafafa);border:1px solid var(--line,#e4e4e7)}
      #qySaleMsg{font-size:12px;margin-top:8px;min-height:18px}.ok{color:#047857}.err{color:#be123c}
      #qySaleToast{position:fixed;z-index:1500;left:50%;bottom:28px;transform:translate(-50%,20px);opacity:0;pointer-events:none;background:#18181b;color:#fff;padding:10px 14px;border-radius:12px;font:12px system-ui;transition:.2s}#qySaleToast.show{opacity:1;transform:translate(-50%,0)}
      @media(max-width:520px){#qySaleOverlay .grid{grid-template-columns:1fr 1fr}#qySaleBar{bottom:calc(max(env(safe-area-inset-bottom),10px) + 76px)}}
    `;document.head.appendChild(st);
  }
  function removeOverlay(){document.getElementById("qySaleOverlay")?.remove()}
  function openPanel(lock=false){
    removeOverlay();
    const activated=status==="ACTIVATED";
    const trial=status==="TRIAL";
    const title=activated?"ปลดล็อกแล้ว":trial?`ทดลองเต็มระบบ • เหลือ ${daysRemaining()} วัน`:"หมดช่วงทดลอง 7 วันแล้ว";
    const sub=activated?"QingYun Commercial V1 ใช้งานถาวร และมีสิทธิ์อัปเกรด V2 ฟรี":trial?"ใช้ครบ 27 Missions / 4 Levels / Work Chinese ได้เต็มระบบ":"ความก้าวหน้ายังอยู่ • Activate แล้วเรียนต่อจากจุดเดิมได้ทันที";
    const ov=document.createElement("div");ov.id="qySaleOverlay";
    ov.innerHTML=`<div class="panel">
      <div class="hero"><div style="font-size:10px;font-weight:900;letter-spacing:.06em">QINGYUN COMMERCIAL V1</div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div>
      <div class="grid"><div class="box"><b>${CFG.priceTHB} บาท</b><span>ราคาเปิดตัว • จ่ายครั้งเดียว</span></div><div class="box"><b>V2 ฟรี</b><span>สิทธิ์โปรโมชันสำหรับผู้ซื้อ V1</span></div></div>
      <div style="font-size:12px;font-weight:900;margin:12px 0 6px">Installation ID</div><div class="id">${esc(state.installId)}</div>
      <div class="row"><button class="soft" id="qyCopyId">คัดลอก ID</button><button class="soft" id="qyCopyOrder">คัดลอกข้อความสั่งซื้อ</button></div>
      ${activated?`<div id="qySaleMsg" class="ok">✓ V1 ถาวร • V2 Upgrade Entitlement = ${entitlement?.freeV2Upgrade===true?"YES":"NO"}</div>`:
      `<a class="btn primary full" style="margin-top:12px" href="${esc(CFG.buyUrl)}" target="_blank" rel="noopener">ติดต่อซื้อผ่าน LINE • ${CFG.priceTHB} บาท</a>
       <div style="font-size:12px;font-weight:900;margin:15px 0 6px">มี Activation Code แล้ว</div>
       <textarea id="qyActivationInput" placeholder="วาง Activation Code ที่ได้รับหลังชำระเงิน"></textarea>
       <button class="primary full" id="qyActivateBtn" style="margin-top:8px">Activate QingYun</button>
       <div id="qySaleMsg"></div>`}
      ${(!lock||activated)?`<button class="soft full" id="qyCloseSale" style="margin-top:10px">${activated?"ปิด":"กลับไปทดลองต่อ"}</button>`:""}
      <div style="font-size:10px;color:var(--muted,#71717a);margin-top:12px;line-height:1.5">License ผูกกับ Installation ID นี้ • Progress การเรียนไม่ถูกลบเมื่อ Trial หมด</div>
    </div>`;
    document.body.appendChild(ov);
    document.getElementById("qyCopyId")?.addEventListener("click",()=>copyText(state.installId,"คัดลอก Installation ID แล้ว"));
    document.getElementById("qyCopyOrder")?.addEventListener("click",()=>copyText(orderMessage(),"คัดลอกข้อความสั่งซื้อแล้ว"));
    document.getElementById("qyCloseSale")?.addEventListener("click",removeOverlay);
    document.getElementById("qyActivateBtn")?.addEventListener("click",async()=>{
      const input=document.getElementById("qyActivationInput"),msg=document.getElementById("qySaleMsg"),code=input.value.trim();
      msg.className="";msg.textContent="กำลังตรวจสอบ...";
      try{
        const ent=await verifyActivation(code);
        state.activationCode=code;save();entitlement=ent;status="ACTIVATED";msg.className="ok";msg.textContent="✓ Activate สำเร็จ • V1 ถาวร + V2 ฟรี";
        setTimeout(()=>{removeOverlay();render()},500);
      }catch(e){msg.className="err";msg.textContent=e?.message||"Activation ไม่สำเร็จ"}
    });
  }
  function renderBar(){
    document.getElementById("qySaleBar")?.remove();
    if(status==="EXPIRED"){openPanel(true);return}
    const bar=document.createElement("div");bar.id="qySaleBar";
    if(status==="ACTIVATED"){
      bar.innerHTML=`<div class="txt"><b>✓ QingYun Commercial V1 • Activated</b>V1 ถาวร • V2 ฟรี</div><button type="button">สิทธิ์ของฉัน</button>`;
    }else{
      bar.innerHTML=`<div class="txt"><b>ทดลองเต็มระบบ • เหลือ ${daysRemaining()} วัน</b>${CFG.priceTHB} บาทครั้งเดียว • ซื้อ V1 รับ V2 ฟรี</div><button type="button">ปลดล็อก</button>`;
    }
    bar.querySelector("button").addEventListener("click",()=>openPanel(false));
    document.body.appendChild(bar);
  }
  function render(){injectStyle();renderBar()}
  function publicStatus(){
    return {status,installId:state?.installId||null,trialDaysRemaining:status==="TRIAL"?daysRemaining():0,priceTHB:CFG.priceTHB,campaign:CFG.campaign,permanentV1:!!entitlement?.permanentV1,freeV2Upgrade:!!entitlement?.freeV2Upgrade,keyId:CFG.keyId};
  }

  async function init(){
    injectStyle();state=load();updateClock();await refreshEntitlement();
    window.QingYunSale=Object.freeze({open:()=>openPanel(status==="EXPIRED"),status:publicStatus,installId:()=>state.installId,refresh:refreshEntitlement});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();