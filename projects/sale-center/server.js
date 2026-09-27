const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 8787);
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "");
const SESSION_SECRET = String(process.env.SESSION_SECRET || "");
const CAPTION_KEY_ID = String(process.env.CAPTION_KEY_ID || "cs-prod-2026-00");
const CAPTION_SIGNING_KEY_JWK_B64 = String(process.env.CAPTION_SIGNING_KEY_JWK_B64 || "");

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const PUBLIC_DIR = path.join(__dirname, "public");

const CAPTION_PUBLIC_KEYS = {
  "cs-prod-2026-00": {
    kty:"EC", crv:"P-256",
    x:"paEmdz0AdkZ-A1dmtsXax9KpVpw71Yfe8S_TQKVBBDc",
    y:"9gzjFcuZtR1jPdyzo1qXYU41mTIMXeEJ_lXpsZk847o"
  }
};

const CATEGORIES = ["fashion","beauty","food","home","general"];
const loginAttempts = new Map();

function b64url(buf){
  return Buffer.from(buf).toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function b64urlJson(obj){ return b64url(Buffer.from(JSON.stringify(obj), "utf8")); }
function fromB64Any(s){
  let v = String(s || "").trim().replace(/-/g,"+").replace(/_/g,"/");
  while(v.length % 4) v += "=";
  return Buffer.from(v, "base64");
}
function safeEqual(a,b){
  const aa=Buffer.from(String(a)), bb=Buffer.from(String(b));
  return aa.length===bb.length && crypto.timingSafeEqual(aa,bb);
}
function signSession(payload){
  const body=b64urlJson(payload);
  const sig=b64url(crypto.createHmac("sha256",SESSION_SECRET).update(body).digest());
  return body+"."+sig;
}
function verifySession(token){
  try{
    if(!SESSION_SECRET || !token) return null;
    const parts=String(token).split(".");
    if(parts.length!==2) return null;
    const expected=b64url(crypto.createHmac("sha256",SESSION_SECRET).update(parts[0]).digest());
    if(!safeEqual(parts[1],expected)) return null;
    const p=JSON.parse(fromB64Any(parts[0]).toString("utf8"));
    if(!p || p.role!=="admin" || !p.exp || Date.now()>p.exp) return null;
    return p;
  }catch{return null}
}
function parseCookies(req){
  const out={};
  String(req.headers.cookie||"").split(";").forEach(x=>{
    const i=x.indexOf("="); if(i>0) out[x.slice(0,i).trim()]=decodeURIComponent(x.slice(i+1).trim());
  });
  return out;
}
function sessionFromReq(req){ return verifySession(parseCookies(req).msc_session); }

function securityHeaders(extra={}){
  return Object.assign({
    "X-Content-Type-Options":"nosniff",
    "X-Frame-Options":"DENY",
    "Referrer-Policy":"no-referrer",
    "Permissions-Policy":"camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    "Cache-Control":"no-store"
  },extra);
}
function send(res,status,body,headers={}){
  const isBuf=Buffer.isBuffer(body);
  res.writeHead(status,securityHeaders(Object.assign({
    "Content-Type":isBuf?"application/octet-stream":"text/plain; charset=utf-8"
  },headers)));
  res.end(body);
}
function json(res,status,obj,headers={}){
  res.writeHead(status,securityHeaders(Object.assign({"Content-Type":"application/json; charset=utf-8"},headers)));
  res.end(JSON.stringify(obj));
}
function readJson(req,limit=32768){
  return new Promise((resolve,reject)=>{
    let size=0, chunks=[];
    req.on("data",c=>{size+=c.length;if(size>limit){reject(new Error("too_large"));req.destroy();return}chunks.push(c)});
    req.on("end",()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}"))}catch{reject(new Error("bad_json"))}});
    req.on("error",reject);
  });
}
function sameOrigin(req){
  const origin=req.headers.origin;
  if(!origin) return true;
  try{
    const u=new URL(origin);
    return u.host===req.headers.host && (u.protocol==="https:" || u.hostname==="localhost" || u.hostname==="127.0.0.1");
  }catch{return false}
}
function clientIp(req){ return String(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"").split(",")[0].trim(); }
function canTryLogin(ip){
  const now=Date.now(), rec=loginAttempts.get(ip)||[];
  const recent=rec.filter(t=>now-t<10*60*1000);
  loginAttempts.set(ip,recent);
  return recent.length<8;
}
function noteBadLogin(ip){ const a=loginAttempts.get(ip)||[]; a.push(Date.now()); loginAttempts.set(ip,a); }

function loadCaptionPrivateJwk(){
  if(!CAPTION_SIGNING_KEY_JWK_B64) throw new Error("SIGNER_NOT_CONFIGURED");
  let jwk;
  try{ jwk=JSON.parse(fromB64Any(CAPTION_SIGNING_KEY_JWK_B64).toString("utf8")); }
  catch{ throw new Error("SIGNER_KEY_INVALID"); }
  const pub=CAPTION_PUBLIC_KEYS[CAPTION_KEY_ID];
  if(!pub) throw new Error("SIGNER_KEY_ID_UNSUPPORTED");
  if(jwk.kty!=="EC" || jwk.crv!=="P-256" || !jwk.d || jwk.x!==pub.x || jwk.y!==pub.y) throw new Error("SIGNER_KEY_MISMATCH");
  return jwk;
}
function signerStatus(){
  try{loadCaptionPrivateJwk();return {configured:true,keyId:CAPTION_KEY_ID}}
  catch(e){return {configured:false,keyId:CAPTION_KEY_ID,reason:e.message}}
}
function normalizeCategories(pkg,categories){
  let cats=Array.isArray(categories)?categories.map(String):[];
  cats=[...new Set(cats)].filter(x=>CATEGORIES.includes(x));
  if(pkg==="full") return CATEGORIES.slice();
  const needed=pkg==="2pack"?2:pkg==="3pack"?3:0;
  if(!needed || cats.length!==needed) throw new Error("CATEGORY_COUNT_INVALID");
  return cats;
}
function issueCaptionActivation(input){
  const installationId=String(input.installationId||"").trim();
  const pkg=String(input.package||"").trim();
  if(!/^[A-Za-z0-9._:-]{8,160}$/.test(installationId)) throw new Error("INSTALLATION_ID_INVALID");
  if(!["2pack","3pack","full"].includes(pkg)) throw new Error("PACKAGE_INVALID");
  const categories=normalizeCategories(pkg,input.categories);
  const label=pkg==="2pack"?"2 PACK":pkg==="3pack"?"3 PACK":"FULL";
  const grant={
    productId:"caption-studio",
    entitlementVersion:1,
    grantId:"sale-"+Date.now().toString(36)+"-"+crypto.randomBytes(5).toString("hex"),
    label,
    categories,
    features:{},
    installationId,
    keyId:CAPTION_KEY_ID,
    licenseType:"lifetime-offline",
    issuedAt:new Date().toISOString()
  };
  const payloadBytes=Buffer.from(JSON.stringify(grant),"utf8");
  const privateKey=crypto.createPrivateKey({key:loadCaptionPrivateJwk(),format:"jwk"});
  const signature=crypto.sign("sha256",payloadBytes,{key:privateKey,dsaEncoding:"ieee-p1363"});
  const payloadB64=b64url(payloadBytes), signatureB64=b64url(signature);
  return {
    code:`MMCSA1.${payloadB64}.${signatureB64}`,
    envelope:{payloadB64,signatureB64},
    grant
  };
}
function requireAdmin(req,res){
  const s=sessionFromReq(req);
  if(!s){json(res,401,{ok:false,error:"AUTH_REQUIRED"});return null}
  return s;
}

const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",".png":"image/png",".svg":"image/svg+xml"
};
function serveStatic(req,res){
  let p=req.url.split("?")[0];
  if(p==="/") p="/index.html";
  const file=path.normalize(path.join(PUBLIC_DIR,p));
  if(!file.startsWith(PUBLIC_DIR)) return send(res,403,"Forbidden");
  fs.readFile(file,(err,data)=>{
    if(err)return send(res,404,"Not found");
    res.writeHead(200,securityHeaders({"Content-Type":mime[path.extname(file)]||"application/octet-stream","Cache-Control":"no-cache"}));
    res.end(data);
  });
}

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,"http://localhost");
    if(url.pathname.startsWith("/api/") && req.method!=="GET" && !sameOrigin(req)) return json(res,403,{ok:false,error:"ORIGIN_REJECTED"});

    if(url.pathname==="/api/health" && req.method==="GET"){
      const s=signerStatus();
      return json(res,200,{ok:true,service:"MEasyMate Sale Center",version:"1.0.0",signerConfigured:s.configured,keyId:s.keyId});
    }
    if(url.pathname==="/api/login" && req.method==="POST"){
      if(!ADMIN_PASSWORD || !SESSION_SECRET) return json(res,503,{ok:false,error:"ADMIN_NOT_CONFIGURED"});
      const ip=clientIp(req);
      if(!canTryLogin(ip)) return json(res,429,{ok:false,error:"TOO_MANY_ATTEMPTS"});
      const body=await readJson(req);
      if(!safeEqual(String(body.password||""),ADMIN_PASSWORD)){noteBadLogin(ip);return json(res,401,{ok:false,error:"LOGIN_FAILED"})}
      loginAttempts.delete(ip);
      const token=signSession({role:"admin",exp:Date.now()+SESSION_TTL_MS});
      return json(res,200,{ok:true},{
        "Set-Cookie":`msc_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.floor(SESSION_TTL_MS/1000)}`
      });
    }
    if(url.pathname==="/api/logout" && req.method==="POST"){
      return json(res,200,{ok:true},{"Set-Cookie":"msc_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"});
    }
    if(url.pathname==="/api/me" && req.method==="GET"){
      const s=requireAdmin(req,res); if(!s)return;
      const signer=signerStatus();
      return json(res,200,{ok:true,role:"admin",signerConfigured:signer.configured,keyId:signer.keyId});
    }
    if(url.pathname==="/api/caption-studio/issue" && req.method==="POST"){
      const s=requireAdmin(req,res); if(!s)return;
      const body=await readJson(req);
      try{
        const result=issueCaptionActivation(body);
        return json(res,200,{ok:true,...result});
      }catch(e){
        const known=["SIGNER_NOT_CONFIGURED","SIGNER_KEY_INVALID","SIGNER_KEY_MISMATCH","SIGNER_KEY_ID_UNSUPPORTED",
          "INSTALLATION_ID_INVALID","PACKAGE_INVALID","CATEGORY_COUNT_INVALID"];
        return json(res,known.includes(e.message)?400:500,{ok:false,error:known.includes(e.message)?e.message:"ISSUE_FAILED"});
      }
    }
    if(url.pathname.startsWith("/api/")) return json(res,404,{ok:false,error:"NOT_FOUND"});
    return serveStatic(req,res);
  }catch(e){
    return json(res,500,{ok:false,error:"SERVER_ERROR"});
  }
});

server.listen(PORT,"0.0.0.0",()=>{
  const s=signerStatus();
  console.log(`MEasyMate Sale Center V1 listening on ${PORT}`);
  console.log(`Caption signer: ${s.configured?"READY":"NOT_CONFIGURED"} (${s.keyId})`);
});
