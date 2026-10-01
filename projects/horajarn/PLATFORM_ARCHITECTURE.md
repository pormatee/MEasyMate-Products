# โหราจารย์ | HORAJARN — FREE EDITION

HORAJARN เป็นแพลตฟอร์มโหราศาสตร์ไทยแบบ modular โดยรุ่นปัจจุบันเป็น Free Edition
เพื่อทดสอบประสบการณ์ใช้งานและพัฒนาองค์ความรู้ก่อนเปิดบริการรุ่นอื่นในอนาคต

## UX หลัก
- หน้าแรกเป็น “สำนักโหราศาสตร์ส่วนตัว” ไม่ใช่หน้า catalog ทั่วไป
- Profile กลางหนึ่งชุด ใช้กับทุกบริการ
- ห้องพยากรณ์หลัก: ดูดวงของฉัน / การงาน / การเงิน / ความรัก
- เครื่องมือถัดไป: ถามเฉพาะเรื่อง / โชคลาภ / ชื่อมงคล / ฤกษ์ / ปฏิทิน / บ้าน / สุขภาพตามคติ
- ผู้ใช้เห็นเฉพาะหลักสำคัญ ไม่เห็น Rule Chain หรือ Knowledge mapping ภายใน

## Engine Layers
1. `core/astrology-core.js` — calculation facts
2. `sources/source-registry.js` — internal source/provenance registry
3. `knowledge/knowledge-base.js` — structured meanings
4. `rules/rules-v1.js` — topic/transit rules
5. `services/interpretation-engine.js` — internal evidence assembly
6. `services/service-engine.js` — public prediction output

## Edition policy
- Current product: HORAJARN FREE
- No paywall / sales flow in the current UI
- Unfinished services are explicitly marked “กำลังพัฒนา”
- The architecture keeps brand and engine separable for future editions

## HORAJARN FREE V1 Push-Ready UX Release
- Brand: โหราจารย์ | HORAJARN
- Edition: FREE V1
- Latest visual assets integrated locally under `assets/`.
- Enabled navigation: Horoscope, Career, Finance, Love.
- Planned services respond with an explicit in-app development state.
- Profile data remains local via `astroProfileV1`.
- Relative paths are deployment-safe when the whole folder is published together.
