# HORAJARN Intelligence V2.8.7 — Thai Speech Normalizer

Fixes local Thai TTS edge cases where an isolated Thai word may be spelled letter-by-letter.

- `ชอบ` / `ชอบ.` -> speech payload `คำว่า ชอบ`
- `(3)`, `เลข3`, `เลข 3` -> spoken Thai number text
- full Thai sentences remain intact
- UI text is unchanged; only speech payload is normalized
- no astrology calculation/rule/evidence changes
- no cloud TTS added
