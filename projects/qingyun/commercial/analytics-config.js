/* QingYun Commercial V1 — Behavior Analytics V1 */
(function(global){
"use strict";
const A=global.MEasyMateAnalytics;if(!A)return;
const EVENTS=["app_open","mission_start","mission_complete","mission_answer_retry","level_1_complete","level_2_complete","level_3_complete","level_4_complete","practice_open","weak_review_start","trial_started","trial_expired","unlock_open","buy_click","activation_success","licensed_open"];
A.init({projectId:"qingyun",appVersion:"COMMERCIAL V1",dataSchemaVersion:1,localStatsEnabled:true,transportEnabled:true,endpoint:"https://measymate-central-analytics.onrender.com/v1/events",includeInstallId:true,retentionDays:90,allowEvents:EVENTS,allowMetaKeys:[]});
A.track("app_open");
try{
 const q=new URLSearchParams(location.search);
 const local=new Set(["127.0.0.1","localhost","::1"]).has(location.hostname);
 if(local&&q.get("test")==="1"&&q.get("behavior")==="1"){
  const box=document.createElement("pre");box.id="qyBehaviorDebug";
  box.style.cssText="position:fixed;z-index:2200;left:8px;top:8px;max-width:92vw;max-height:42vh;overflow:auto;background:#111;color:#d1fae5;padding:9px;border-radius:10px;font:10px/1.35 monospace;white-space:pre-wrap";
  document.body.appendChild(box);
  const render=()=>{const s=A.getLocalSummary(),c=s.event_counts||{};box.textContent="QINGYUN BEHAVIOR DEBUG\n"+EVENTS.filter(e=>c[e]).map(e=>e+"="+c[e]).join("\n")};
  render();setInterval(render,600);
 }
}catch(_){}
})(window);
