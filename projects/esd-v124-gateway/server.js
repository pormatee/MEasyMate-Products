// MEasyMate ESD V1.2.4 gateway candidate – no dependencies, no stored employee data.
'use strict';
const http=require('node:http');
const {URL}=require('node:url');
const PORT=Number(process.env.PORT||8788);
const GAS_URL=String(process.env.ESD_GAS_DEPLOYMENT_URL||'');
const KEY=String(process.env.ESD_GATEWAY_SECRET||'');
const ORIGINS=new Set(String(process.env.ESD_ALLOWED_ORIGINS||'https://app.measymate.com').split(',').map(x=>x.trim()).filter(Boolean));
const ALLOWED=new Set(['getPublicData','lookupEmployee','searchEmployees','recordCheck','adminLogin','adminLogout','dashboardData','adminMaster','saveEmployee','deactivateEmployee','saveMachine','saveGroup','saveSupervisor','saveAttendance','updateReview','activateAllVerified','employeeHistory']);
function validTarget(){try{const u=new URL(GAS_URL);return u.protocol==='https:'&&u.hostname==='script.google.com'&&/^\/macros\/s\/[-_a-zA-Z0-9]+\/exec$/.test(u.pathname)&&!u.search}catch{return false}}
function headers(origin){const h={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
 if(origin&&ORIGINS.has(origin)){h['Access-Control-Allow-Origin']=origin;h['Vary']='Origin';h['Access-Control-Allow-Methods']='POST, OPTIONS';h['Access-Control-Allow-Headers']='Content-Type';}return h}
function send(res,code,data,origin){res.writeHead(code,headers(origin));res.end(JSON.stringify(data))}
async function handle(req,res){
 const origin=req.headers.origin||'';
 if(req.url==='/health'&&req.method==='GET')return send(res,200,{ok:true,configured:validTarget()&&KEY.length>=32},origin);
 if(req.url!=='/api')return send(res,404,{ok:false,error:'NOT_FOUND'},origin);
 if(origin&&!ORIGINS.has(origin))return send(res,403,{ok:false,error:'ORIGIN_DENIED'},origin);
 if(req.method==='OPTIONS') {if(!origin)return send(res,403,{ok:false,error:'ORIGIN_REQUIRED'},origin);res.writeHead(204,headers(origin));return res.end()}
 if(req.method!=='POST')return send(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'},origin);
 if(!validTarget()||KEY.length<32)return send(res,503,{ok:false,error:'API_NOT_CONFIGURED'},origin);
 let length=0,chunks=[];
 try{for await(const c of req){length+=c.length;if(length>64000)throw Error('REQUEST_TOO_LARGE');chunks.push(c)}}catch{return send(res,413,{ok:false,error:'REQUEST_TOO_LARGE'},origin)}
 let p;try{p=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{return send(res,400,{ok:false,error:'INVALID_JSON'},origin)}
 if(!p||!ALLOWED.has(p.name)||!Array.isArray(p.args)||p.args.length>5)return send(res,400,{ok:false,error:'METHOD_OR_ARGS_NOT_ALLOWED'},origin);
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),50000);
 try{
  const upstream=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:p.name,args:p.args,gatewayKey:KEY}),signal:ctl.signal,redirect:'follow'});
  if(!upstream.ok)return send(res,502,{ok:false,error:'GOOGLE_HTTP_'+upstream.status},origin);
  const raw=await upstream.text();if(raw.length>2_000_000)return send(res,502,{ok:false,error:'UPSTREAM_TOO_LARGE'},origin);
  let result;try{result=JSON.parse(raw)}catch{return send(res,502,{ok:false,error:'GOOGLE_INVALID_JSON'},origin)}
  if(!result||typeof result.ok!=='boolean')return send(res,502,{ok:false,error:'GOOGLE_INVALID_RESPONSE'},origin);
  return send(res,200,result,origin);
 }catch{return send(res,502,{ok:false,error:'GOOGLE_UNREACHABLE'},origin)}
 finally{clearTimeout(timer)}
}
if(require.main===module){http.createServer((req,res)=>{handle(req,res).catch(()=>send(res,500,{ok:false,error:'SERVER_ERROR'},req.headers.origin||''))}).listen(PORT,'0.0.0.0')}
module.exports={handle,validTarget,headers};
