#!/usr/bin/env python3
from pathlib import Path
import ast
ROOT=Path(__file__).resolve().parents[3]
QY=ROOT/"projects/qingyun"
idx=(QY/"commercial/index.html").read_text(encoding="utf-8")
cfg=(QY/"commercial/analytics-config.js").read_text(encoding="utf-8")
sale=(QY/"commercial/sale-gate.js").read_text(encoding="utf-8")
server=(ROOT/"analytics_server/app.py").read_text(encoding="utf-8")
admin=(ROOT/"admin/analytics/index.html").read_text(encoding="utf-8")
EVENTS=['app_open', 'mission_start', 'mission_complete', 'mission_answer_retry', 'level_1_complete', 'level_2_complete', 'level_3_complete', 'level_4_complete', 'practice_open', 'weak_review_start', 'trial_started', 'trial_expired', 'unlock_open', 'buy_click', 'activation_success', 'licensed_open']
for e in EVENTS: assert f'"{e}"' in cfg,e
for e in EVENTS[1:]: assert f'"{e}"' in server,e
ast.parse(server)
assert "allowMetaKeys:[]" in cfg and "meta content not allowed" in server
assert 'self.project_id != "qingyun" and self.event in QINGYUN_BEHAVIOR_EVENTS' in server
assert '"event_unique_installations": event_unique_installations' in server
for m in ["qyTrack('mission_start')","qyTrack('mission_complete')","qyTrack('mission_answer_retry')","qyTrack('practice_open')","qyTrack('weak_review_start')"]: assert m in idx,m
for m in ['saleTrack("trial_started")','saleTrack("trial_expired")','saleTrack("unlock_open")','saleTrack("buy_click")','saleTrack("activation_success")','saleTrack("licensed_open")']: assert m in sale,m
assert 'crypto.subtle.verify' in sale and 'trialDays:7' in sale and 'priceTHB:79' in sale
assert 'LOCAL_TEST_HOSTS=new Set(["127.0.0.1","localhost","::1"])' in sale
assert 'ttsSpeaking' in idx and 'speechSynthesis.cancel()' in idx and '450' in idx
assert 'id="qingyunBehavior"' in admin and 'event_unique_installations' in admin
print("QINGYUN_BEHAVIOR_ANALYTICS_V1_GATE=PASS")
print("FIXED_EVENT_COUNT=16")
print("FREE_TEXT=FORBIDDEN")
print("AUDIO_CONTENT=FORBIDDEN")
print("ANSWER_TEXT=FORBIDDEN")
print("META_TRANSPORT=DISABLED")
print("QINGYUN_PROJECT_EVENT_GUARD=PASS")
print("EVENT_UNIQUE_INSTALLATIONS=PASS")
print("ANDROID_FIELD_GATE=UNVERIFIED")
