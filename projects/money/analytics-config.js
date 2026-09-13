(function(){
  "use strict";

  const config={
    projectId:"money",
    appVersion:"F2.1.10",
    dataSchemaVersion:3,

    // Local anonymous usage counters are enabled.
    localStatsEnabled:true,

    // Fail-closed production gate:
    // central analytics stays OFF until a verified MEasyMate analytics endpoint is configured.
    transportEnabled:false,
    endpoint:"",

    // Random browser-install ID only; no name/email/account/financial content.
    includeInstallId:true,
    retentionDays:90,

    allowEvents:[
      "app_open",
      "nav_today",
      "nav_bills",
      "nav_future",
      "nav_overview",
      "nav_review",
      "onboarding_started",
      "onboarding_completed",
      "bill_saved",
      "expense_saved",
      "income_saved",
      "reserve_added",
      "reserve_used",
      "saving_added",
      "saving_withdrawn",
      "dream_updated",
      "week_closed",
      "backup_created",
      "restore_used",
      "safety_restore_used",
      "app_reset",
      "runtime_error"
    ],

    // Metadata is intentionally tiny and non-content.
    allowMetaKeys:["view","action","result","kind"]
  };

  window.MEasyMateAnalyticsConfig=config;
  if(window.MEasyMateAnalytics){
    window.MEasyMateAnalytics.init(config);
  }
})();
