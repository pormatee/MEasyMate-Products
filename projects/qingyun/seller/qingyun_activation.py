#!/usr/bin/env python3
"""QingYun Commercial V1 offline activation-code generator.
Private key is intentionally stored outside the Git repository.
"""
from __future__ import annotations
import argparse, base64, datetime as dt, hashlib, json, os, subprocess, sys
from pathlib import Path

PRODUCT="qingyun"
EDITION="commercial_v1"
CAMPAIGN="LAUNCH_79"
PRICE_THB=79
KEY_ID="5cfd0fb222332b17"
DEFAULT_KEY=Path.home()/".measymate/keys/qingyun-commercial-v1-private.pem"
LEDGER=Path.home()/".measymate/qingyun-sales/activations.jsonl"

def b64u(b:bytes)->str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")

def der_to_raw(sig:bytes, size:int=32)->bytes:
    # Minimal strict parser for DER SEQUENCE(INTEGER r, INTEGER s)
    if len(sig)<8 or sig[0]!=0x30:
        raise ValueError("bad DER ECDSA signature")
    i=1
    if sig[i]&0x80:
        n=sig[i]&0x7f; i+=1
        total=int.from_bytes(sig[i:i+n],"big"); i+=n
    else:
        total=sig[i]; i+=1
    end=i+total
    vals=[]
    for _ in range(2):
        if i>=len(sig) or sig[i]!=0x02: raise ValueError("bad DER integer")
        i+=1
        if sig[i]&0x80:
            n=sig[i]&0x7f; i+=1
            ln=int.from_bytes(sig[i:i+n],"big"); i+=n
        else:
            ln=sig[i]; i+=1
        v=sig[i:i+ln]; i+=ln
        while len(v)>1 and v[0]==0: v=v[1:]
        if len(v)>size: raise ValueError("ECDSA integer too large")
        vals.append(v.rjust(size,b"\0"))
    if i!=end: raise ValueError("unexpected DER trailing data")
    return vals[0]+vals[1]

def raw_to_der(raw:bytes)->bytes:
    if len(raw)!=64: raise ValueError("raw signature must be 64 bytes")
    def enc_int(x:bytes)->bytes:
        x=x.lstrip(b"\0") or b"\0"
        if x[0]&0x80: x=b"\0"+x
        return b"\x02"+bytes([len(x)])+x
    body=enc_int(raw[:32])+enc_int(raw[32:])
    return b"\x30"+bytes([len(body)])+body

def sign_payload(payload_b64:str,key:Path)->tuple[str,bytes]:
    p=subprocess.run(["openssl","dgst","-sha256","-sign",str(key)],
                     input=payload_b64.encode("ascii"),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:
        raise SystemExit("OPENSSL_SIGN=FAIL\n"+p.stderr.decode(errors="replace"))
    raw=der_to_raw(p.stdout)
    return b64u(raw),p.stdout

def make_code(install_id:str,order_ref:str|None,key:Path)->tuple[str,dict,bytes]:
    issued=dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")
    payload={
        "v":1,"product":PRODUCT,"edition":EDITION,"installId":install_id,
        "permanentV1":True,"freeV2Upgrade":True,"campaign":CAMPAIGN,
        "priceTHB":PRICE_THB,"issuedAt":issued,"keyId":KEY_ID
    }
    if order_ref: payload["orderRef"]=order_ref
    raw=json.dumps(payload,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf-8")
    pb64=b64u(raw)
    sb64,der=sign_payload(pb64,key)
    return f"QY1.{pb64}.{sb64}",payload,der

def append_ledger(payload:dict,code:str):
    LEDGER.parent.mkdir(parents=True,exist_ok=True)
    rec={
        "issuedAt":payload["issuedAt"],"installId":payload["installId"],"orderRef":payload.get("orderRef"),
        "campaign":payload["campaign"],"priceTHB":payload["priceTHB"],"keyId":payload["keyId"],
        "codeSha256":hashlib.sha256(code.encode()).hexdigest()
    }
    with LEDGER.open("a",encoding="utf-8") as f:
        f.write(json.dumps(rec,ensure_ascii=False,separators=(",",":"))+"\n")

def self_test(key:Path)->int:
    code,payload,der=make_code("00000000-0000-4000-8000-000000000001","SELFTEST",key)
    parts=code.split(".")
    raw=base64.urlsafe_b64decode(parts[2]+"==")
    if raw_to_der(raw)!=der:
        print("SELF_TEST=FAIL raw/der"); return 1
    pub=key.with_name("qingyun-commercial-v1-public-selftest.pem")
    try:
        p=subprocess.run(["openssl","pkey","-in",str(key),"-pubout","-out",str(pub)],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        if p.returncode: print("SELF_TEST=FAIL public_key"); return 1
        sigfile=key.with_name(".qy-selftest.sig"); msgfile=key.with_name(".qy-selftest.msg")
        sigfile.write_bytes(der); msgfile.write_text(parts[1],encoding="ascii")
        v=subprocess.run(["openssl","dgst","-sha256","-verify",str(pub),"-signature",str(sigfile),str(msgfile)],
                         stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
        ok=v.returncode==0 and "Verified OK" in v.stdout
        print("SELF_TEST="+("PASS" if ok else "FAIL"))
        print("KEY_ID="+KEY_ID)
        return 0 if ok else 1
    finally:
        for x in [pub,key.with_name(".qy-selftest.sig"),key.with_name(".qy-selftest.msg")]:
            try:x.unlink()
            except FileNotFoundError:pass

def main():
    ap=argparse.ArgumentParser(description="Generate QingYun Commercial V1 activation code")
    ap.add_argument("--install-id")
    ap.add_argument("--order-ref",default=None)
    ap.add_argument("--key",default=str(DEFAULT_KEY))
    ap.add_argument("--self-test",action="store_true")
    args=ap.parse_args()
    key=Path(args.key).expanduser()
    if not key.exists():
        raise SystemExit(f"PRIVATE_KEY_NOT_FOUND={key}")
    if args.self_test:
        raise SystemExit(self_test(key))
    iid=(args.install_id or "").strip()
    if len(iid)<8 or len(iid)>128 or any(c not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._" for c in iid):
        raise SystemExit("INSTALL_ID_INVALID")
    code,payload,_=make_code(iid,(args.order_ref or "").strip() or None,key)
    append_ledger(payload,code)
    print("QINGYUN_ACTIVATION=PASS")
    print("INSTALL_ID="+iid)
    print("CAMPAIGN="+CAMPAIGN)
    print("PRICE_THB="+str(PRICE_THB))
    print("PERMANENT_V1=YES")
    print("FREE_V2_UPGRADE=YES")
    print("ACTIVATION_CODE="+code)

if __name__=="__main__":
    main()
