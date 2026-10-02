/*
 * MEasyMate Analytics Core V2
 * Anonymous usage analytics.
 * - Shared anonymous install ID across products for portfolio-level unique installations.
 * - Per-product local statistics to prevent counters from mixing across apps.
 * - Central payload never sends arbitrary/free-text meta.
 * - Transport failures never block product use.
 */
(function(global){
  "use strict";

  const LOCAL_PREFIX="MEasyMateAnalyticsLocalV2:";
  const LEGACY_LOCAL_KEY="MEasyMateAnalyticsLocalV1";
  const INSTALL_KEY="MEasyMateAnalyticsInstallV1";
  const SESSION_KEY="MEasyMateAnalyticsSessionV1";

  let memoryLocal={};
  let memoryInstall="";
  let memorySession="";

  let cfg={
    projectId:"",
    appVersion:"",
    dataSchemaVersion:null,
    localStatsEnabled:true,
    transportEnabled:false,
    endpoint:"",
    includeInstallId:true,
    retentionDays:90,
    allowEvents:[],
    transportAllowEvents:null,
    allowMetaKeys:[]
  };

  function parse(v,f){try{return JSON.parse(v)}catch(_){return f}}
  function randomId(prefix){
    try{if(global.crypto&&crypto.randomUUID)return prefix+crypto.randomUUID()}catch(_){}
    return prefix+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,12);
  }
  function projectLocalKey(){
    const id=String(cfg.projectId||"unknown").replace(/[^A-Za-z0-9_.:-]/g,"_");
    return LOCAL_PREFIX+id;
  }
  function installId(){
    try{
      let v=localStorage.getItem(INSTALL_KEY);
      if(!v){v=randomId("i_");localStorage.setItem(INSTALL_KEY,v)}
      return v;
    }catch(_){
      if(!memoryInstall)memoryInstall=randomId("i_mem_");
      return memoryInstall;
    }
  }
  function sessionId(){
    try{
      let v=sessionStorage.getItem(SESSION_KEY);
      if(!v){v=randomId("s_");sessionStorage.setItem(SESSION_KEY,v)}
      return v;
    }catch(_){
      if(!memorySession)memorySession=randomId("s_mem_");
      return memorySession;
    }
  }
  function dayKey(d){return d.toISOString().slice(0,10)}
  function deviceClass(){
    const ua=navigator.userAgent||"";
    if(/iPad|Tablet|Android(?!.*Mobile)/i.test(ua))return "tablet";
    if(/Mobi|Android|iPhone/i.test(ua))return "mobile";
    return "desktop";
  }
  function browserFamily(){
    const ua=navigator.userAgent||"";
    if(/Edg\//.test(ua))return "edge";
    if(/OPR\//.test(ua))return "opera";
    if(/SamsungBrowser\//.test(ua))return "samsung";
    if(/CriOS|Chrome\//.test(ua))return "chrome";
    if(/FxiOS|Firefox\//.test(ua))return "firefox";
    if(/Safari\//.test(ua)&&!/Chrome|Chromium|Android/.test(ua))return "safari";
    return "other";
  }
  function osFamily(){
    const ua=navigator.userAgent||"";
    if(/Android/i.test(ua))return "android";
    if(/iPhone|iPad|iPod/i.test(ua))return "ios";
    if(/Windows/i.test(ua))return "windows";
    if(/Mac OS X|Macintosh/i.test(ua))return "macos";
    if(/Linux/i.test(ua))return "linux";
    return "other";
  }
  function cloneLocal(v){
    const x=v&&typeof v==="object"?v:{};
    return Object.assign({},x,{
      event_counts:Object.assign({},x.event_counts||{}),
      active_days:Array.isArray(x.active_days)?x.active_days.slice():[]
    });
  }
  function loadLocal(){
    try{
      const key=projectLocalKey();
      const current=parse(localStorage.getItem(key),null);
      if(current&&typeof current==="object")return cloneLocal(current);

      // One-time safe migration only when legacy data explicitly belongs
      // to the currently initialized product.
      const legacy=parse(localStorage.getItem(LEGACY_LOCAL_KEY),null);
      if(legacy&&legacy.project_id===cfg.projectId){
        const migrated=cloneLocal(legacy);
        localStorage.setItem(key,JSON.stringify(migrated));
        return migrated;
      }
      return {};
    }catch(_){
      return cloneLocal(memoryLocal);
    }
  }
  function saveLocal(v){
    memoryLocal=cloneLocal(v);
    try{localStorage.setItem(projectLocalKey(),JSON.stringify(v))}catch(_){}
  }
  function updateLocal(event,now){
    if(!cfg.localStatsEnabled)return;
    const s=loadLocal();
    s.project_id=cfg.projectId;
    s.app_version=cfg.appVersion;
    s.first_seen=s.first_seen||now.toISOString();
    s.last_seen=now.toISOString();
    s.total_events=Number(s.total_events||0)+1;
    s.event_counts=s.event_counts||{};
    s.event_counts[event]=Number(s.event_counts[event]||0)+1;
    const today=dayKey(now);
    let days=Array.isArray(s.active_days)?s.active_days:[];
    if(!days.includes(today))days.push(today);
    s.active_days=days.slice(-Math.max(7,Number(cfg.retentionDays||90)));
    saveLocal(s);
  }
  function payload(event,now){
    const p={
      event,
      project_id:cfg.projectId,
      app_version:cfg.appVersion,
      data_schema_version:cfg.dataSchemaVersion,
      occurred_at:now.toISOString(),
      session_id:sessionId(),
      device_class:deviceClass(),
      browser_family:browserFamily(),
      os_family:osFamily(),
      meta:{}
    };
    if(cfg.includeInstallId)p.install_id=installId();
    return p;
  }
  function isSystemTestMode(){
    try{return new URLSearchParams(global.location.search).get("test")==="1"}catch(_){return false}
  }
  function send(p){
    if(!cfg.transportEnabled||!cfg.endpoint)return false;
    try{
      const headers={"content-type":"application/json"};
      if(isSystemTestMode())headers["x-measymate-synthetic"]="1";
      fetch(cfg.endpoint,{
        method:"POST",
        headers,
        body:JSON.stringify(p),
        keepalive:true,
        credentials:"omit",
        cache:"no-store",
        referrerPolicy:"no-referrer"
      }).catch(()=>{});
      return true;
    }catch(_){return false}
  }
  function init(config){
    cfg=Object.assign({},cfg,config||{});
    cfg.allowEvents=Array.isArray(cfg.allowEvents)?cfg.allowEvents:[];
    cfg.transportAllowEvents=Array.isArray(cfg.transportAllowEvents)
      ? cfg.transportAllowEvents
      : null;
    // Accepted for backward-compatible configs, but V2 never transmits meta values.
    cfg.allowMetaKeys=[];
    global.MEasyMateAnalyticsConfig=Object.assign({},cfg);
    return true;
  }
  function track(event,_meta){
    try{
      if(!event||!cfg.allowEvents.includes(event))return false;
      const now=new Date();
      updateLocal(event,now);
      if(!cfg.transportAllowEvents || cfg.transportAllowEvents.includes(event)){
        send(payload(event,now));
      }
      return true;
    }catch(_){return false}
  }
  function getLocalSummary(){
    const s=loadLocal();
    return {
      project_id:s.project_id||cfg.projectId,
      app_version:s.app_version||cfg.appVersion,
      total_events:Number(s.total_events||0),
      event_counts:Object.assign({},s.event_counts||{}),
      active_days:Array.isArray(s.active_days)?s.active_days.slice():[],
      first_seen:s.first_seen||null,
      last_seen:s.last_seen||null,
      transport_enabled:!!(cfg.transportEnabled&&cfg.endpoint)
    };
  }
  function status(){
    return {
      initialized:!!cfg.projectId,
      project_id:cfg.projectId,
      app_version:cfg.appVersion,
      local_stats_enabled:!!cfg.localStatsEnabled,
      local_storage_scope:"per_product",
      transport_enabled:!!(cfg.transportEnabled&&cfg.endpoint),
      endpoint_configured:!!cfg.endpoint,
      allowed_event_count:(cfg.allowEvents||[]).length,
      privacy_mode:"anonymous_usage_only",
      meta_transport:"disabled"
    };
  }

  global.MEasyMateAnalytics={init,track,getLocalSummary,status};
})(window);
