/*
 * HORAJARN FREE V1 - Central Analytics V2.
 * Anonymous usage only.
 * No birth date, profile, astrology results, questions, or free text.
 */
(function(global){
  "use strict";
  const A=global.MEasyMateAnalytics;
  if(!A)return;

  A.init({
    projectId:"horajarn",
    appVersion:"HORAJARN FREE V1",
    dataSchemaVersion:null,
    localStatsEnabled:true,
    transportEnabled:true,
    endpoint:"https://measymate-central-analytics.onrender.com/v1/events",
    includeInstallId:true,
    retentionDays:90,
    allowEvents:["app_open"],
    allowMetaKeys:[]
  });

  A.track("app_open");
})(window);
