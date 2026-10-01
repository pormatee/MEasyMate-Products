/*
 * Hanasu by MEasyMate — Project Notice V1
 * Project ID: hanasu
 * Normal notice remains OFF. Test notice: ?test=1
 */
(function(){
  "use strict";
  const TEST=new URLSearchParams(location.search).get("test")==="1";
  window.MEasyMateProjectNotices=[
    {
      id:"HANASU-V1-FREE-TEST-001",
      scope:"hanasu",
      type:"info",
      title:"Hanasu V1 FREE",
      message:"Japanese Thai Bridge — Notice Test Mode",
      start_at:null,
      end_at:null,
      priority:99,
      dismissible:true,
      test_only:true,
      enabled:TEST
    }
  ];
})();
