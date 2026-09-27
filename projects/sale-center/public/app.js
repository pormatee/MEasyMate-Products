const $=id=>document.getElementById(id);
const HIST_KEY="measymate_sale_center_v1_history";
let currentResult=null;

function history(){try{return JSON.parse(localStorage.getItem(HIST_KEY))||[]}catch{return[]}}
function saveHistory(v){localStorage.setItem(HIST_KEY,JSON.stringify(v));renderHistory()}
function money(n){return "฿"+Number(n||0).toLocaleString("th-TH")}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
async function api(url,opt={}){
  const r=await fetch(url,{...opt,headers:{"Content-Type":"application/json",...(opt.headers||{})}});
  const j=await r.json().catch(()=>({ok:false,error:"BAD_RESPONSE"}));
  if(!r.ok)throw new Error(j.error||("HTTP_"+r.status));
  return j;
}
function setMsg(id,text,ok=false){const e=$(id);e.textContent=text||"";e.className="msg "+(text?(ok?"good":"bad"):"")}
function showApp(me){
  $("loginView").classList.add("hidden");$("appView").classList.remove("hidden");$("logoutBtn").classList.remove("hidden");
  $("signerState").textContent=me.signerConfigured?"READY":"SETUP";$("keyBadge").textContent=me.keyId||"key —";
  renderHistory();syncPackage();
}
async function boot(){
  try{const me=await api("/api/me",{method:"GET"});showApp(me)}catch{}
}
$("loginBtn").onclick=async()=>{
  setMsg("loginMsg","");
  try{
    await api("/api/login",{method:"POST",body:JSON.stringify({password:$("password").value})});
    const me=await api("/api/me",{method:"GET"});$("password").value="";showApp(me)
  }catch(e){setMsg("loginMsg",e.message==="LOGIN_FAILED"?"รหัสผ่านไม่ถูกต้อง":"เข้าสู่ระบบไม่สำเร็จ: "+e.message)}
};
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")$("loginBtn").click()});
$("logoutBtn").onclick=async()=>{try{await api("/api/logout",{method:"POST",body:"{}"})}catch{}location.reload()};

function checkedCats(){return [...document.querySelectorAll(".cats input:checked")].map(x=>x.value)}
function syncPackage(){
  const p=$("pkg").value;
  const price=p==="2pack"?59:p==="3pack"?69:99;$("price").value=price;
  const needed=p==="2pack"?2:p==="3pack"?3:5;
  $("catHint").textContent=p==="full"?"Full = ครบ 5 หมวดอัตโนมัติ":`เลือกให้ครบ ${needed} หมวด`;
  const inputs=[...document.querySelectorAll(".cats input")];
  if(p==="full"){inputs.forEach(x=>{x.checked=true;x.disabled=true})}else{inputs.forEach(x=>x.disabled=false)}
}
$("pkg").onchange=syncPackage;

$("issueBtn").onclick=async()=>{
  setMsg("issueMsg","");$("resultCard").classList.add("hidden");
  const body={
    installationId:$("installationId").value.trim(),
    package:$("pkg").value,
    categories:checkedCats(),
    customerName:$("customer").value.trim(),
    saleType:$("saleType").value,
    price:Number($("price").value||0),
    note:$("note").value.trim()
  };
  $("issueBtn").disabled=true;$("issueBtn").textContent="กำลังเซ็น...";
  try{
    const r=await api("/api/caption-studio/issue",{method:"POST",body:JSON.stringify(body)});
    currentResult={...r,customer:body.customerName,saleType:body.saleType,price:body.price,note:body.note};
    $("activationCode").value=r.code;
    $("grantInfo").textContent=`${r.grant.label} • ${r.grant.categories.join(", ")} • ${r.grant.installationId} • ${r.grant.keyId}`;
    $("resultCard").classList.remove("hidden");
    const h=history();h.unshift({at:new Date().toISOString(),customer:body.customerName,installationId:body.installationId,package:r.grant.label,categories:r.grant.categories,price:body.price,code:r.code,grantId:r.grant.grantId,keyId:r.grant.keyId});saveHistory(h.slice(0,500));
    setMsg("issueMsg","สร้าง Signed Activation สำเร็จ",true)
  }catch(e){
    const map={SIGNER_NOT_CONFIGURED:"Server ยังไม่ได้ใส่ Signing Key",SIGNER_KEY_MISMATCH:"Signing Key ไม่ตรงกับ cs-prod-2026-00",CATEGORY_COUNT_INVALID:"จำนวนหมวดสินค้าไม่ตรงกับ Package",INSTALLATION_ID_INVALID:"Installation ID ไม่ถูกต้อง"};
    setMsg("issueMsg",map[e.message]||("สร้าง Code ไม่สำเร็จ: "+e.message))
  }finally{$("issueBtn").disabled=false;$("issueBtn").textContent="🔐 สร้าง Activation Code"}
};
$("copyCodeBtn").onclick=()=>copyText($("activationCode").value,"คัดลอก Activation Code แล้ว");
$("copySaleBtn").onclick=()=>{
  if(!currentResult)return;
  const g=currentResult.grant;
  const text=[
    "MEasyMate Caption Studio",
    currentResult.customer?("ลูกค้า: "+currentResult.customer):"",
    "Package: "+g.label,
    "Installation ID: "+g.installationId,
    "",
    "Activation Code:",
    currentResult.code,
    "",
    "นำ Code ไปวางในเมนู Activation แล้วกด Activate"
  ].filter(x=>x!=="").join("\n");
  copyText(text,"คัดลอกข้อความส่งลูกค้าแล้ว")
};
async function copyText(t,msg){try{await navigator.clipboard.writeText(t);setMsg("issueMsg",msg,true)}catch{setMsg("issueMsg","Copy ไม่สำเร็จ")}}

function renderHistory(){
  const h=history();
  $("saleCount").textContent=h.length;
  $("revenue").textContent=money(h.reduce((a,b)=>a+Number(b.price||0),0));
  $("history").innerHTML=h.length?h.slice(0,50).map(x=>`<div class="hist"><b>${esc(x.customer||"ลูกค้า")} • ${esc(x.package)}</b><small>${new Date(x.at).toLocaleString("th-TH")} • ${esc(x.installationId)} • ${money(x.price)} • ${esc(x.keyId)}</small></div>`).join(""):'<div class="muted">ยังไม่มีรายการ</div>'
}
$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify({app:"MEasyMate Sale Center",version:"1.0",exportedAt:new Date().toISOString(),history:history()},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="MEasyMate_Sale_Center_Backup_"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
};
boot();