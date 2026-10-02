/*
 * TalkNow V1 FREE — Central Analytics V2.1.
 * Anonymous usage only.
 * No learning progress, vocabulary state, answers, audio,
 * backup data, profile data, or free text.
 */
(function(global){
  "use strict";
  const A=global.MEasyMateAnalytics;
  if(!A)return;

  A.init({
    projectId:"talknow",
    appVersion:"V1 FREE",
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
