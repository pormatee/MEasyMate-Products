(function(root){'use strict';
const SOURCES={
  'PLU-LUANG-BOOK':{
    title:'พื้นฐานของโหราศาสตร์ (ความมหัศจรรย์ของตัวเลข)',author:'พลูหลวง',type:'book',
    authority:'primary-work',verification:'metadata-and-preface-verified',
    note:'ใช้เป็นกรอบอ้างอิงเลขแทนดาวและแนวคิดเลขศาสตร์เชื่อมโหราศาสตร์ รายละเอียดกฎรายข้อยังต้องตรวจจากเนื้อหาเล่มจริงก่อนยกระดับเป็น verified-rule',
    url:'https://www.ookbee.com/shop/book/d164219f-3022-41b1-b727-a8a632958d20/'
  },
  'TAKSA-TABLE-VIBHISHANA':{
    title:'ทักษาปกรณ์ คืออะไร',author:'พิเภก',type:'web-reference',authority:'secondary',verification:'cross-check-ready',
    note:'ใช้ตรวจลำดับดาวในภูมิทักษา 8 ภูมิ',url:'https://vibhishana.com/library/thaksa'
  },
  'MAHATAKSA-MAHAMODO':{
    title:'มหาทักษาพยากรณ์',author:'มหาหมอดู',type:'web-reference',authority:'secondary',verification:'cross-check-ready',
    note:'ใช้ตรวจรูปแบบการพยากรณ์มหาทักษาและภูมิทั้ง 8 ในช่วงเวลา',url:'https://www.mahamodo.com/tamnai/mahataksa_chock.aspx'
  },
  'SEVEN-NUMBER-MAHAMODO':{
    title:'เลข 7 ตัว 4 ฐาน',author:'มหาหมอดู',type:'web-reference',authority:'secondary',verification:'cross-check-ready',
    note:'ใช้เป็นแหล่งตรวจโครงระบบ 7 ตัว 4 ฐาน ไม่ถือเป็นตำราพลูหลวง',url:'https://www.mahamodo.com/tamnai/num74_inputdmy.aspx'
  },
  'THAI-LUNAR-PYTHAIDATE':{
    title:'pythaidate',author:'hmmbug',type:'open-source-reference',authority:'technical',verification:'algorithm-reference',
    note:'ใช้เป็นฐานตรวจอัลกอริทึมปฏิทินจันทรคติไทย/จุลศักราช',url:'https://github.com/hmmbug/pythaidate'
  },
  'USER-PRACTITIONER-RULES':{
    title:'DUANG DEE practitioner rules',author:'project owner',type:'practitioner-rule',authority:'project-defined',verification:'accepted-project-rule',
    note:'กฎการอ่านตำแหน่งเฉพาะที่เจ้าของโครงการกำหนด เช่น ปาก=ตำแหน่ง 4 ฐานวัน ใจ=ตำแหน่ง 4 ฐานเดือน ที่อยู่=ตำแหน่ง 4 ฐานปี'
  },
  'INTERNAL-CURATED-V1':{
    title:'Internal Curated Meanings V1',author:'DUANG DEE project',type:'internal-knowledge',authority:'provisional',verification:'needs-textbook-review',
    note:'คำอธิบายดาว/เลข 1-9 ที่ใช้ทดสอบสถาปัตยกรรม ยังไม่อ้างว่าเป็นข้อความตรงจากตำราใดตำราหนึ่ง'
  }
};
function get(id){return SOURCES[id]||null}
function has(id){return !!SOURCES[id]}
const API={SOURCES,get,has,version:'1.2.0'};root.AstroSources=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
