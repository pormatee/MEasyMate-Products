/*
 * QingYun - ชิงยุน (青云) — Project Notice / Promotion V1
 * Project ID: qingyun
 * Data-only configuration. Normal notices remain OFF until explicitly enabled.
 */
(function(){
  "use strict";
  const TEST=new URLSearchParams(location.search).get("test")==="1";
  window.MEasyMateProjectNotices=[
    {
      id:"QINGYUN-V1-FREE-TEST-001",
      scope:"qingyun",
      type:"info",
      title:"QingYun - ชิงยุน (青云) V1 FREE",
      message:"ระบบประกาศ/โปรโมชันของ MEasyMate เชื่อมต่อแล้ว (Test Mode เท่านั้น)",
      start_at:null,
      end_at:null,
      priority:99,
      dismissible:true,
      test_only:true,
      enabled:TEST
    }
  ];
})();
