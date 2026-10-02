/*
 * MEasyMate Report Pro 2.6.0 - Central Analytics V2.
 * Anonymous usage only.
 * No report content, reporter names, photos, 5W2H data,
 * license data, backups, or free text.
 */
(function(global){
  "use strict";
  const A=global.MEasyMateAnalytics;
  if(!A)return;

  A.init({
    projectId:"report-pro",
    appVersion:"2.6.0",
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
