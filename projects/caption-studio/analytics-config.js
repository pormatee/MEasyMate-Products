/*
 * MEasyMate Caption Studio V2.13.39 SALE RC25 - Central Analytics V2.
 * Anonymous usage only.
 * No caption text, images, activation data, purchase data, backups, or free text.
 */
(function(global){
  "use strict";
  const A=global.MEasyMateAnalytics;
  if(!A)return;

  A.init({
    projectId:"caption-studio",
    appVersion:"V2.13.39 SALE RC25",
    dataSchemaVersion:9,
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
