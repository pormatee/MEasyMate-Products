/*
 * TalkNow by MEasyMate — Project Notice V1
 * Project ID: talknow
 * Normal notice remains OFF. Test notice: ?test=1
 */
(function(){
  "use strict";
  const TEST=new URLSearchParams(location.search).get("test")==="1";
  window.MEasyMateProjectNotices=[{
    id:"TALKNOW-V1-FREE-TEST-001",
    scope:"talknow",
    type:"info",
    title:"TalkNow V1 FREE",
    message:"English Thai Bridge — Notice Test Mode",
    start_at:null,
    end_at:null,
    priority:99,
    dismissible:true,
    test_only:true,
    enabled:TEST
  }];
})();
