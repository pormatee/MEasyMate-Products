(function(root){'use strict';

const VERSION='2.19.0-multisource-knowledge-registry';
const INGESTION_COMPLETE=false;
const PRODUCTION_CUTOVER=false;

const STATUS=new Set([
  'DRAFT','PROVISIONAL','CROSS_CHECKED',
  'VERIFIED','FROZEN','CONFLICTED','OWNER_VERIFIED'
]);

function deepFreeze(v){
  if(v&&typeof v==='object'&&!Object.isFrozen(v)){
    Object.freeze(v);
    Object.values(v).forEach(deepFreeze);
  }
  return v;
}

function clean(v){
  return v==null?'':String(v).trim();
}

function clone(v){
  return JSON.parse(JSON.stringify(v));
}

function validateRecord(item){
  const errors=[];
  const required=[
    'id','topic','concept','meaning',
    'sourceId','pageRef','school',
    'version','verification','status'
  ];

  for(const k of required){
    if(!clean(item&&item[k])) errors.push(k+':missing');
  }

  if(item && !STATUS.has(item.status))
    errors.push('status:invalid');

  if(item && item.sourceId==='MAHASATTALEK-3-THANAKORN' &&
     !clean(item.pageRef))
    errors.push('primary-book-pageRef:required');

  return {ok:errors.length===0,errors};
}

function keyOf(item){
  return `${clean(item.topic)}::${clean(item.concept)}`;
}

function createRegistry(initial=[]){
  const byId=new Map();

  function add(item){
    const v=validateRecord(item);
    if(!v.ok) throw new Error('KNOWLEDGE_RECORD_INVALID:'+v.errors.join(','));

    if(byId.has(item.id))
      throw new Error('KNOWLEDGE_ID_ALREADY_EXISTS:'+item.id);

    const frozen=deepFreeze(clone(item));
    byId.set(frozen.id,frozen);
    return frozen;
  }

  function addMany(items){
    return items.map(add);
  }

  function get(id){
    return byId.get(id)||null;
  }

  function all(){
    return [...byId.values()];
  }

  function query({topic=null,concept=null,sourceId=null}={}){
    return all().filter(x=>
      (!topic || x.topic===topic) &&
      (!concept || x.concept===concept) &&
      (!sourceId || x.sourceId===sourceId)
    );
  }

  function analyze(topic,concept){
    const items=query({topic,concept});

    const sources=[...new Set(items.map(x=>x.sourceId))];

    const meanings=[...new Set(
      items.map(x=>clean(x.meaning).replace(/\s+/g,' '))
    )];

    const claimGroups={};

    for(const x of items){
      if(!clean(x.claimKey)) continue;
      if(!claimGroups[x.claimKey]) claimGroups[x.claimKey]=new Set();
      claimGroups[x.claimKey].add(clean(x.claimValue));
    }

    const conflicts=Object.entries(claimGroups)
      .filter(([,values])=>values.size>1)
      .map(([claimKey,values])=>({
        claimKey,
        values:[...values]
      }));

    return deepFreeze({
      topic,
      concept,
      recordCount:items.length,
      sourceCount:sources.length,
      sources,
      interpretationCount:meanings.length,
      divergentInterpretations:meanings.length>1,
      conflicted:conflicts.length>0,
      conflicts,
      autoMergeAllowed:false,
      resolution:conflicts.length
        ? 'KEEP_SEPARATE_AND_REVIEW'
        : meanings.length>1
          ? 'KEEP_MULTIPLE_INTERPRETATIONS'
          : 'NO_CONFLICT_DETECTED',
      records:items
    });
  }

  for(const item of initial) add(item);

  return deepFreeze({
    add,
    addMany,
    get,
    all,
    query,
    analyze
  });
}

const REGISTRY=createRegistry();

function validate(){
  const errors=[];

  if(INGESTION_COMPLETE!==false)
    errors.push('ingestion-complete-must-be-false');

  if(PRODUCTION_CUTOVER!==false)
    errors.push('production-cutover-must-be-false');

  if(REGISTRY.all().length!==0)
    errors.push('registry-must-start-empty');

  return {ok:errors.length===0,errors};
}

const API={
  VERSION,
  INGESTION_COMPLETE,
  PRODUCTION_CUTOVER,
  STATUS,
  validateRecord,
  createRegistry,
  REGISTRY,
  validate
};

root.HorajarnMultiSourceKnowledgeV219=API;

if(typeof module!=='undefined'&&module.exports)
  module.exports=API;

})(typeof globalThis!=='undefined'?globalThis:this);
