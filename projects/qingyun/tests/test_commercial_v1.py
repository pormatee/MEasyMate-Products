#!/usr/bin/env python3
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[3]
free=root/"projects/qingyun/index.html"; com=root/"projects/qingyun/commercial/index.html"; ac=root/"projects/qingyun/commercial/analytics-config.js"
assert subprocess.check_output(["git","hash-object",str(free)],cwd=root,text=True).strip()=="3208b1041e35aa35b30e7da4aaba3530146ce8db"
s=com.read_text(encoding="utf-8"); a=ac.read_text(encoding="utf-8")
assert "const KEY='qingyun_commercial_v1';" in s
assert "LEGACY_KEYS=['qingyun_v1_free','nihao_max_advanced_v1']" in s
assert "COMMERCIAL_LEVELS=" in s
assert s.count('"level":1')==9
assert s.count('"level":2')==6
assert s.count('"level":3')==5
assert s.count('"level":4')==7
ids=["d1","d2","d3","w1","w2","w3","t1","t2","t3","u1","u2","u3","u4","u5","u6","c1","c2","c3","c4","c5","w4","w5","w6","w7","w8","w9","w10"]
for mid in ids: assert f'"id":"{mid}"' in s
assert s.count('"path":"work"')==10
assert "missionStep>=5" in s and "STEP 5 • Review" in s and "seedMissionSrs" in s
assert "ttsSpeaking" in s and "450" in s and "speechSynthesis.cancel()" in s
assert "qingyun-commercial-v1-backup-" in s
assert 'allowEvents:["app_open"]' in a
status=subprocess.check_output(["git","status","--porcelain"],cwd=root,text=True).splitlines()
paths=[x[3:] for x in status if len(x)>=4]
assert all(p.startswith("projects/qingyun/commercial/") or p.startswith("projects/qingyun/tests/") or p.startswith("projects/qingyun/seller/") for p in paths),paths
print("QINGYUN_COMMERCIAL_STATIC_GATE=PASS")
print("FREE_BASELINE_UNTOUCHED=PASS")
print("MISSION_COUNT=27")
print("LEVELS=4")
print("WORK_CHINESE_MISSIONS=10")
print("MISSION_FLOW=5_STEP")
print("TTS_SINGLE_FLIGHT_RETAINED=PASS")
print("COMMERCIAL_STORAGE_ISOLATED=PASS")
print("ANDROID_REAL_GATE=UNVERIFIED")
print("CUSTOMER_RELEASE=NO")
