/*
 * MEasyMate Contact Shift 10.4.0 - Central Analytics V2.
 * Anonymous usage only.
 * No names, issue text, team/company data, backups, or free text.
 */
(function(global){
  "use strict";
  const A=global.MEasyMateAnalytics;
  if(!A)return;

  A.init({
    projectId:"contact-shift",
    appVersion:"10.4.0",
    dataSchemaVersion:3,
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
