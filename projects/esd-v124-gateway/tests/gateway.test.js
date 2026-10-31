const test=require('node:test'),assert=require('node:assert/strict');
process.env.ESD_GAS_DEPLOYMENT_URL='https://script.google.com/macros/s/AKfycbyExample123/exec';
process.env.ESD_GATEWAY_SECRET='A'.repeat(40);
process.env.ESD_ALLOWED_ORIGINS='https://app.measymate.com';
const {handle,validTarget}=require('../server');
const {Readable}=require('node:stream');
function mkReq(method,url,body,origin='https://app.measymate.com'){
 const r=Readable.from(body===undefined?[]:[Buffer.from(JSON.stringify(body))]);r.method=method;r.url=url;r.headers={origin};return r;
}
function mkRes(){return {status:0,headers:{},body:'',writeHead(code,h){this.status=code;this.headers=h},end(s){this.body=s||''}}}
async function send(method,url,body,origin){const res=mkRes();await handle(mkReq(method,url,body,origin),res);return res}
test('target URL pinned to Google',()=>{assert.equal(validTarget(),true)});
test('health without leaking secret',async()=>{const res=await send('GET','/health');assert.equal(res.status,200);assert.ok(!res.body.includes('AAA'))});
test('origin denied and protected methods',async()=>{assert.equal((await send('POST','/api',{name:'getPublicData',args:[]},'https://evil.example')).status,403);assert.equal((await send('POST','/api',{name:'setupApp_',args:[]})).status,400);assert.equal((await send('GET','/api')).status,405)});
test('API calls fetch upstream with gateway secret kept server-side',async()=>{const orig=global.fetch;let request;global.fetch=async (_url,opts)=>{request=JSON.parse(opts.body);return {ok:true,text:async()=>JSON.stringify({ok:true,result:{today:'2026-10-31'}})}};
 try{const res=await send('POST','/api',{name:'getPublicData',args:[]});assert.equal(res.status,200);assert.equal(JSON.parse(res.body).result.today,'2026-10-31');assert.equal(request.gatewayKey,'A'.repeat(40));assert.ok(!res.body.includes('A'.repeat(40)));}finally{global.fetch=orig}});
