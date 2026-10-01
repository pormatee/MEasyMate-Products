# ASTRO PLATFORM V1.2 — Knowledge Policy

## หลักการ
1. Calculation Core คำนวณ fact เท่านั้น
2. Knowledge Pack แต่ละสำนักต้องแยกกัน ไม่รวมความหมายจนไม่ทราบที่มา
3. ทุก rule และ knowledge item ต้องมี sourceRefs
4. `verified` ใช้ได้เมื่อเทียบกับแหล่งต้นฉบับ/ตำราที่กำหนดแล้วเท่านั้น
5. `provisional` คือความรู้ที่ใช้เพื่อทดสอบระบบหรือเรียบเรียงจากหลายแหล่ง ยังไม่อ้างว่าเป็นข้อความตรงจากตำรา
6. กฎที่เจ้าของโครงการกำหนดเองเก็บใน source `USER-PRACTITIONER-RULES`
7. คำทำนายด้านสุขภาพใช้คำว่า “ตามคติ...” และไม่วินิจฉัยโรค
8. หน้า User แสดงเฉพาะฐานหลัก ไม่แสดง Rule Chain หรือฐานความรู้เต็ม

## Knowledge packs
- Numerology / Plu Luang: แยก pack ของตนเอง
- Seven Numbers Four Bases: แยก pack ของตนเอง
- Taksa / Maha Taksa: แยก pack ของตนเอง
- Thai Lunar: technical calculation reference
- Practitioner Rules: project-specific rules

## Verification lifecycle
DRAFT -> PROVISIONAL -> CROSS-CHECKED -> VERIFIED -> FROZEN
