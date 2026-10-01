# Hanasu by MEasyMate

Project ID: `hanasu`
Edition: `V1 FREE`
Method: `Japanese Thai Bridge`
Candidate Source: `pormatee/MEasyMate-Products/projects/hanasu/`
Target live URL after main deployment: `https://app.measymate.com/hanasu/`

## Product promise

**ภาษาญี่ปุ่นที่คนไทยพูดได้จริง**

Hanasu is conversation-first. The learner chooses a practical goal and Hanasu guides the next mission instead of requiring the learner to choose lessons manually.

## V1 FREE scope

- 3 practical paths: daily life / work / travel
- 9 conversation missions
- 103 starter words
- Hiragana / Katakana / special sounds
- Japanese TTS (`ja-JP`)
- Thai Trap explanations
- conversation turn-taking
- Rescue Phrases
- Kanji memory starter
- starter stroke-order maps
- persistent touch-writing strokes while stepping
- Thai-first grammar
- SRS
- Backup / Restore
- local-first learner state

## Data

Primary localStorage key: `hanasu_v1_free`

Legacy learning progress is migrated when available from:
- `hanasu_jp_v1_free`
- `hikari_jp_v1_free`

## Release gate

Current state: `PRE_GIT_CANDIDATE`

Do not label Hanasu `PRODUCTION_READY` until:
1. compact home UI is verified on real Android Chrome
2. Mission 1–4 step flow passes
3. Japanese TTS passes
4. writing stroke persistence passes
5. refresh/reopen data persistence passes
6. Backup/Restore passes
7. live `/hanasu/` path passes after main deployment
