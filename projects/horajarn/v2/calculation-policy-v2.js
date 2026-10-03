(function(root){'use strict';
const VERSION='2.4.0-calculation';
const DAY_BOUNDARY=Object.freeze({hour:6,minute:0,status:'CROSS_CHECKED_CONVENTION',claimRef:'THAI-ASTRO-DAY-BOUNDARY-06',caveat:'Fixed 06:00 convention approximates sunrise; some traditions refer to actual sunrise.'});
const WEDNESDAY_NIGHT=Object.freeze({startHour:18,endHour:6,status:'CROSS_CHECKED_CONVENTION',claimRef:'WEDNESDAY-NIGHT-18'});
const TAKSA_ORDER=Object.freeze([1,2,3,4,7,5,8,6]);
const MAHATAKSA_STRENGTH=Object.freeze({1:6,2:15,3:8,4:17,7:10,5:19,8:12,6:21});
const MAHATAKSA=Object.freeze({cycleYears:108,monthsPerYear:12,daysPerMonth:30,mahaMinutesPerDay:60,structureStatus:'CROSS_CHECKED',ratioStatus:'CROSS_CHECKED',timelineMappingStatus:'UNVERIFIED_TIMELINE_MAPPING'});
function hasHour(h){return h!==''&&h!=null&&Number.isFinite(Number(h))}
function astroDayDate(y,m,d,h){const dt=new Date(y,m-1,d);if(hasHour(h)&&Number(h)<DAY_BOUNDARY.hour)dt.setDate(dt.getDate()-1);return{y:dt.getFullYear(),m:dt.getMonth()+1,d:dt.getDate(),weekday:dt.getDay()}}
function expectedBirthPlanet(y,m,d,h){const ad=astroDayDate(y,m,d,h),normal=[1,2,3,4,5,6,7][ad.weekday],hour=Number(h);if(ad.weekday===3&&hasHour(h)&&(hour>=WEDNESDAY_NIGHT.startHour||hour<WEDNESDAY_NIGHT.endHour))return 8;return normal}
function subOrder(main){const i=TAKSA_ORDER.indexOf(Number(main));if(i<0)throw new Error('MAHATAKSA_MAIN_INVALID');return Object.freeze(Array.from({length:8},(_,k)=>TAKSA_ORDER[(i+k)%8]))}
function traditionalSubPeriod(main,sub){const a=MAHATAKSA_STRENGTH[Number(main)],b=MAHATAKSA_STRENGTH[Number(sub)];if(!a||!b)throw new Error('MAHATAKSA_PLANET_INVALID');const totalUnits=a*b*200;let rem=totalUnits;const years=Math.floor(rem/21600);rem%=21600;const months=Math.floor(rem/1800);rem%=1800;const days=Math.floor(rem/60);const mahaMinutes=rem%60;return Object.freeze({main:Number(main),sub:Number(sub),years,months,days,mahaMinutes,totalMahaMinutes:totalUnits,fractionYears:a*b/108})}
function schedule(main){const rows=subOrder(main).map(sub=>traditionalSubPeriod(main,sub));const total=rows.reduce((s,x)=>s+x.totalMahaMinutes,0);return Object.freeze({main:Number(main),strength:MAHATAKSA_STRENGTH[Number(main)],rows,totalMahaMinutes:total,totalYearsTraditional:total/21600})}
function validate(){const errors=[];const sum=Object.values(MAHATAKSA_STRENGTH).reduce((a,b)=>a+b,0);if(sum!==108)errors.push('mahataksa-strength-sum:'+sum);if(new Set(TAKSA_ORDER).size!==8)errors.push('taksa-order-unique');for(const p of TAKSA_ORDER){const s=schedule(p);if(Math.abs(s.totalYearsTraditional-MAHATAKSA_STRENGTH[p])>1e-12)errors.push('subperiod-sum:'+p)}const sun=schedule(1).rows;const expect=[[1,0,4,0,0],[2,0,10,0,0],[3,0,5,10,0],[4,0,11,10,0],[7,0,6,20,0],[5,1,0,20,0],[8,0,8,0,0],[6,1,2,0,0]];sun.forEach((x,i)=>{const e=expect[i];if(x.sub!==e[0]||x.years!==e[1]||x.months!==e[2]||x.days!==e[3]||x.mahaMinutes!==e[4])errors.push('sun-schedule:'+i)});return{ok:errors.length===0,errors}}
const API={VERSION,DAY_BOUNDARY,WEDNESDAY_NIGHT,TAKSA_ORDER,MAHATAKSA_STRENGTH,MAHATAKSA,hasHour,astroDayDate,expectedBirthPlanet,subOrder,traditionalSubPeriod,schedule,validate,version:VERSION};
root.HorajarnCalculationPolicyV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
