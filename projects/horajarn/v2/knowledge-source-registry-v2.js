(function(root){'use strict';

function deepFreeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(deepFreeze);
  }
  return v;
}

const SOURCES=deepFreeze([
  {
    id:'MAHASATTALEK-3-THANAKORN',
    title:'คัมภีร์มหาสัตตเลข ๓',
    author:'ธนกร สินเกษม',
    role:'PRIMARY',
    type:'BOOK_FLIPBOOK',
    locator:'https://pubhtml5.com/zahj/fphc/basic/',
    verification:'SOURCE_IDENTIFIED_PAGE_TEXT_UNAVAILABLE',
    contentIngested:false,
    pageLevelVerified:false,
    notes:[
      'ห้ามสร้าง pageRef จากการคาดเดา',
      'ยังไม่อ้างว่า ingest เนื้อหาหนังสือแล้ว'
    ]
  },
  {
    id:'MATHHORO-PLANETS-1-7-2009',
    title:'ดวงดาวในมหาสัตตเลข',
    author:'perapon',
    role:'SECONDARY',
    type:'WEB_ARTICLE',
    locator:'https://mathhoro.blogspot.com/2009/06/blog-post_24.html',
    verification:'SOURCE_TEXT_ACCESSIBLE',
    contentIngested:true,
    pageLevelVerified:false
  },
  {
    id:'MATHHORO-PLANETS-8-9-2009',
    title:'เกร็ดโหร มิถุนายน 2009',
    author:'perapon',
    role:'SECONDARY',
    type:'WEB_ARTICLE',
    locator:'https://mathhoro.blogspot.com/2009/06/',
    verification:'SOURCE_TEXT_ACCESSIBLE',
    contentIngested:true,
    pageLevelVerified:false
  }
]);

function getSource(id){
  return SOURCES.find(x=>x.id===id)||null;
}

const API=deepFreeze({
  VERSION:'2.20.0-source-registry',
  SOURCES,
  getSource
});

root.HorajarnKnowledgeSourcesV220=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
