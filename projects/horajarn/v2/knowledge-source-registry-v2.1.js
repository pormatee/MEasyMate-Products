(function(root){'use strict';

const BASE=typeof require!=='undefined'
  ? require('./knowledge-source-registry-v2.js')
  : root.HorajarnKnowledgeSourcesV220;

function deepFreeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(deepFreeze);
  }
  return v;
}

const EXTRA=deepFreeze([
  {
    id:'MATHHORO-HOUSES-21-2009',
    title:'ภูมิพยากรณ์ในมหาสัตตฯ',
    author:'perapon',
    role:'SECONDARY',
    type:'WEB_ARTICLE',
    locator:'https://mathhoro.blogspot.com/2009/06/blog-post_8522.html',
    verification:'SOURCE_TEXT_ACCESSIBLE',
    contentIngested:true
  },
  {
    id:'MATHHORO-PLANET-PAIRS-2009',
    title:'คู่ดาวในมหาสัตตเลข',
    author:'perapon',
    role:'SECONDARY',
    type:'WEB_ARTICLE',
    locator:'https://mathhoro.blogspot.com/2009/06/blog-post_26.html',
    verification:'SOURCE_TEXT_ACCESSIBLE',
    contentIngested:true
  },
  {
    id:'MATHHORO-ANALYSIS-METHOD-2009',
    title:'หลักการวิเคราะห์ดาว',
    author:'perapon',
    role:'SECONDARY',
    type:'WEB_ARTICLE',
    locator:'https://mathhoro.blogspot.com/2009/06/blog-post_6286.html',
    verification:'SOURCE_TEXT_ACCESSIBLE',
    contentIngested:true
  },
  {
    id:'USER-PRACTITIONER-RULES',
    title:'HORAJARN Owner Practitioner Rules',
    author:'PROJECT_OWNER',
    role:'OWNER_VERIFIED',
    type:'PRACTITIONER_RULES',
    locator:'HORAJARN_PROJECT',
    verification:'OWNER_VERIFIED_V1',
    contentIngested:true
  }
]);

const SOURCES=deepFreeze([...BASE.SOURCES,...EXTRA]);

function getSource(id){
  return SOURCES.find(x=>x.id===id)||null;
}

const API=deepFreeze({
  VERSION:'2.21.0-source-registry',
  SOURCES,
  getSource
});

root.HorajarnKnowledgeSourcesV221=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
