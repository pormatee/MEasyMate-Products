#!/usr/bin/env python3
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[3]
APP=ROOT/"projects/qingyun/one-app"
def arr(name,prefix):
    s=(APP/name).read_text(encoding="utf-8")
    m=re.search(re.escape(prefix)+r"Object\.freeze\((\[.*\])\);",s,re.S)
    assert m,name
    return json.loads(m.group(1))
v=arr("vocab-data.js","window.QingYunVocab=")
m=arr("missions-data.js","window.QingYunMissions=")
h=arr("hanzi-data.js","window.QingYunHanzi=")
assert len(v)==1200
assert len(m)==180
assert len(h)==150
assert sum(x["path"]=="daily" for x in m)==54
assert sum(x["path"]=="travel" for x in m)==54
assert sum(x["path"]=="work" for x in m)==72
assert sum(bool(x.get("limited")) for x in m)==9
for path,total,each in [("daily",54,18),("travel",54,18),("work",72,24)]:
    xs=[x for x in m if x["path"]==path]
    assert len(xs)==total
    assert [sum(x["level"]==n for x in xs) for n in (1,2,3)]==[each,each,each]
idx=(APP/"index.html").read_text(encoding="utf-8")
access=(APP/"access-gate.js").read_text(encoding="utf-8")
assert "QingYunAccess.ready.then" in idx
assert "const KEY='qingyun_one_app_v1';" in idx
assert "LEGACY_KEYS=['qingyun_commercial_v1','qingyun_v1_free','nihao_max_advanced_v1']" in idx
assert "ttsSpeaking" in idx and "speechSynthesis.cancel()" in idx and "450" in idx
assert 'trialDays:7' in access
assert 'qingyun_commercial_license_v1' in access
assert "crypto.subtle.verify" in access
assert '"LIMITED"' in access
assert 'new Set(["127.0.0.1","localhost","::1"])' in access
assert "openPanel(true)" not in access
alltext="\n".join(p.read_text(encoding="utf-8",errors="ignore") for p in APP.rglob("*") if p.is_file())
pem_private="-----BEGIN "+"PRIVATE KEY-----"
pem_ec_private="-----BEGIN "+"EC PRIVATE KEY-----"
assert pem_private not in alltext
assert pem_ec_private not in alltext
manifest=json.loads((APP/"content-manifest.json").read_text(encoding="utf-8"))
assert manifest["full"]=={"vocab":1200,"missions":180,"hanzi":150}
assert manifest["limited"]=={"vocab":185,"missions":9,"hanzi":30}
print("QINGYUN_ONE_APP_STATIC_GATE=PASS")
print("FULL_CONTENT=1200_VOCAB_180_MISSIONS_150_HANZI")
print("LIMITED_CONTENT=185_VOCAB_9_MISSIONS_30_HANZI")
print("TRACKS=GENERAL54_TRAVEL54_WORK72")
print("TRIAL=7_DAYS_FULL_ACCESS")
print("EXPIRED_APP_FUNCTIONS=NORMAL")
print("EXISTING_LICENSE_COMPAT=PASS")
print("TTS_SINGLE_FLIGHT_RETAINED=PASS")
print("ANDROID_REAL_GATE=UNVERIFIED")
print("CUSTOMER_RELEASE=NO")
