/*
 * Hanasu V1 FREE — Central Analytics V2 pilot.
 * Anonymous usage only. No lesson text, answers, audio, backup data, or free text.
 */
(function(global){
  "use strict";
  const A=global.MEasyMateAnalytics;
  if(!A)return;

  A.init({
    projectId:"hanasu",
    appVersion:"V1 FREE",
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
