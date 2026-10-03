(function(root){'use strict';
const VERSION='2.2.0-interpretation';
const TOPIC_LABEL=Object.freeze({career:'การงาน',finance:'การเงิน',love:'ความรักและหุ้นส่วน'});
const MAX=Object.freeze({claims:4,majorSignals:3,minorSignals:3});
const UNCERTAINTY_TEXT=Object.freeze({
 NORMAL:'หลักฐานที่ใช้ตีความสอดคล้องกันในระดับที่ระบบกำหนด',
 NON_DIRECTIONAL:'หลักฐานที่มีอยู่ให้บริบท แต่ยังไม่ชี้ทิศทางช่วงเวลาอย่างชัดเจน',
 PARTIAL_COVERAGE:'หลักฐานแกนหลักยังครอบคลุมไม่ครบ จึงควรอ่านผลแบบมีข้อจำกัด',
 CONFLICTED:'พบหลักสนับสนุนและหลักเตือนที่ขัดกันในกลุ่มเดียวกัน จึงไม่ควรสรุปด้านเดียว',
 INSUFFICIENT:'ข้อมูลหลักฐานยังไม่เพียงพอสำหรับการตีความ'
});
const CONFIDENCE_TEXT=Object.freeze({
 HIGH:'คุณภาพและการตรวจสอบย้อนกลับของหลักฐานอยู่ในระดับสูง',
 MODERATE:'คุณภาพหลักฐานอยู่ในระดับปานกลางและยังมีส่วนที่ควรตรวจทาน',
 LOW:'คุณภาพหลักฐานยังจำกัด ควรใช้เป็นข้อมูลประกอบเท่านั้น',
 INSUFFICIENT:'หลักฐานไม่เพียงพอสำหรับประเมินคุณภาพ'
});
const API={VERSION,TOPIC_LABEL,MAX,UNCERTAINTY_TEXT,CONFIDENCE_TEXT};
root.HorajarnInterpretationPolicyV2=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
