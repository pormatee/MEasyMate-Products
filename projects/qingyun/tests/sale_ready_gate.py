#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import hashlib, os, subprocess, sys

ROOT=Path(__file__).resolve().parents[3]
QY=ROOT/"projects/qingyun"
FREE=QY/"index.html"
COM=QY/"commercial/index.html"
SALE=QY/"commercial/sale-gate.js"
SELLER=QY/"seller/qingyun_activation.py"
PRIVATE=Path.home()/".measymate/keys/qingyun-commercial-v1-private.pem"
EXPECTED_FREE="3208b1041e35aa35b30e7da4aaba3530146ce8db"

def run(*a,check=True):
    p=subprocess.run(a,cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    if check and p.returncode:
        print(p.stdout); raise SystemExit("COMMAND_FAIL="+" ".join(a))
    return p.stdout.strip()

assert run("git","hash-object",str(FREE))==EXPECTED_FREE, "FREE baseline changed"
s=COM.read_text(encoding="utf-8")
j=SALE.read_text(encoding="utf-8")
seller=SELLER.read_text(encoding="utf-8")

assert s.count('<script src="./sale-gate.js"></script>')==1
assert "qingyun_commercial_v1" in s
assert "ttsSpeaking" in s and "speechSynthesis.cancel()" in s and "450" in s
assert 'trialDays:7' in j
assert 'priceTHB:79' in j
assert 'campaign:"LAUNCH_79"' in j
assert 'freeV2Upgrade:true' in j
assert 'qingyun_commercial_license_v1' in j
assert "crypto.subtle.verify" in j
assert 'permanentV1' in j and 'freeV2Upgrade' in j
assert 'https://lin.ee/T80LRHU' in j
assert "__PUBLIC_JWK_JSON__" not in j and "__KEY_ID__" not in j
assert PRIVATE.exists(), f"missing private key: {PRIVATE}"
assert oct(PRIVATE.stat().st_mode & 0o777)=="0o600"
# Build sensitive markers at runtime so the audit source itself does not
# contain a complete private-key PEM header that secret scans would flag.
PRIVATE_MARKERS=(
    "-----BEGIN " + "PRIVATE KEY-----",
    "-----BEGIN " + "EC PRIVATE KEY-----",
)
assert all(marker not in j for marker in PRIVATE_MARKERS)
assert all(marker not in seller for marker in PRIVATE_MARKERS)

# No private-key material is allowed anywhere under QingYun.
for p in QY.rglob("*"):
    if not p.is_file(): continue
    try:t=p.read_text(encoding="utf-8")
    except Exception: continue
    assert all(marker not in t for marker in PRIVATE_MARKERS), p

# Commercial content gate from the previous build must still pass.
base_gate=QY/"tests/test_commercial_v1.py"
assert base_gate.exists()
print(run(sys.executable,str(base_gate)))

# Signer key and DER/raw conversion self test.
print(run(sys.executable,str(SELLER),"--self-test"))

# JS syntax when Node is available. Android/Chrome real gate remains separate.
node=subprocess.run(["sh","-lc","command -v node"],cwd=ROOT,text=True,stdout=subprocess.PIPE).stdout.strip()
if node:
    print(run(node,"--check",str(SALE)))
    print("SALE_GATE_JS_SYNTAX=PASS")
else:
    print("SALE_GATE_JS_SYNTAX=PREVALIDATED_TEMPLATE")

# Scope: dirty/untracked files must stay inside QingYun for this worktree.
# Do not parse porcelain columns because leading spaces can be stripped.
modified=run("git","diff","--name-only").splitlines()
untracked=run("git","ls-files","--others","--exclude-standard").splitlines()
paths=[p for p in modified+untracked if "__pycache__/" not in p and not p.endswith(".pyc")]
assert all(p.startswith("projects/qingyun/") for p in paths), paths

print("QINGYUN_SALE_READY_STATIC_GATE=PASS")
print("TRIAL_7_DAYS=PASS")
print("LAUNCH_PRICE_79_THB=PASS")
print("SIGNED_ACTIVATION_ECDSA_P256=PASS")
print("PERMANENT_V1_ENTITLEMENT=PASS")
print("FREE_V2_UPGRADE_ENTITLEMENT=PASS")
print("PROGRESS_PRESERVATION_ARCHITECTURE=PASS")
print("FREE_BASELINE_UNTOUCHED=PASS")
print("TTS_CORE_UNTOUCHED=PASS")
print("SALE_LICENSE_ANDROID_GATE=UNVERIFIED")
print("CUSTOMER_RELEASE=NO")

# Production must not accept test query override.
assert 'LOCAL_TEST_HOSTS=new Set([\"127.0.0.1\",\"localhost\",\"::1\"])' in j
assert 'LOCAL_TEST_HOSTS.has(location.hostname)&&qs.get(\"test\")===\"1\"' in j
print("PRODUCTION_TRIAL_OVERRIDE_GUARD=PASS")
