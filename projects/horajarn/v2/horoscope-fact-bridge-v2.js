(function(root){'use strict';
const VERSION='2.6.1-android-runtime-fix';
function deps(){if(!root.AstroCore||!root.HorajarnFactEngineV2||!root.HorajarnProfileAdapterV2||!root.HorajarnContractsV2)throw new Error('V2_SINGLE_BRAIN_DEPENDENCY_MISSING')}
function normalizedProfile(rawProfile){deps();return root.AstroCore.normalizeProfile(root.HorajarnProfileAdapterV2.toCoreProfile(rawProfile))}
function build(rawProfile,target=new Date()){deps();const profile=root.HorajarnProfileAdapterV2.toCoreProfile(rawProfile);return root.HorajarnFactEngineV2.build(profile,target)}
function compatibilityView(rawProfile,target=new Date()){const b=build(rawProfile,target),f=b.legacyFacts;return root.HorajarnContractsV2.deepFreeze({
engineVersion:VERSION,source:'HorajarnFactEngineV2',profile:f.profile,astroDate:f.astroDate,lunar:f.lunar,birthPlanet:f.birthPlanet,
thaksa:f.thaksa,matrix:f.matrix,records:f.records,mahaTaksa:f.mahaTaksa,target:f.target})}
function planetForMoment(date=new Date()){deps();if(!(date instanceof Date)||Number.isNaN(date.getTime()))throw new Error('V2_MOMENT_INVALID');const raw={name:'_moment_',day:date.getDate(),month:date.getMonth()+1,year:date.getFullYear(),hour:date.getHours(),minute:date.getMinutes(),place:''};const p=normalizedProfile(raw),bp=root.AstroCore.birthPlanet(p);return root.HorajarnContractsV2.deepFreeze({planet:bp.planet,astroDate:bp.ad,engineVersion:VERSION})}
function coreParity(rawProfile,target=new Date()){deps();const profile=root.HorajarnProfileAdapterV2.toCoreProfile(rawProfile),core=root.AstroCore.buildFacts(profile,target),bridge=compatibilityView(profile,target);const pairs={astroDate:[core.astroDate,bridge.astroDate],lunar:[core.lunar,bridge.lunar],birthPlanet:[core.birthPlanet,bridge.birthPlanet],thaksa:[core.thaksa,bridge.thaksa],matrix:[core.matrix,bridge.matrix],records:[core.records,bridge.records],mahaTaksa:[core.mahaTaksa,bridge.mahaTaksa]};const mismatches=[];for(const [key,[a,b]] of Object.entries(pairs))if(JSON.stringify(a)!==JSON.stringify(b))mismatches.push(key);return root.HorajarnContractsV2.deepFreeze({ok:mismatches.length===0,mismatches,checked:Object.keys(pairs),engineVersion:VERSION})}
const API={VERSION,normalizedProfile,build,compatibilityView,planetForMoment,coreParity,version:VERSION};
root.HorajarnHoroscopeFactBridgeV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
