# QingYun - ชิงยุน (青云)

Project ID: `qingyun`
Edition: `V1 FREE`
Candidate Source: `pormatee/MEasyMate-Products/projects/qingyun/`
Target URL after production promotion: `https://app.measymate.com/qingyun/`

## Positioning

Chinese learning for Thai learners through **QingYun Thai Bridge**:

- Pinyin for Thai learners
- tone and pronunciation practice
- 185-word V1 FREE vocabulary set
- Hanzi memory aids
- starter verified stroke-order pack
- touch writing practice
- SRS review / weak-word review
- dictation / shadowing / Thai-first grammar

## Product policy

V1 FREE is the free foundation release.
Paid editions will extend content and coaching depth without replacing the core UX.

## Data

- Learning progress is stored locally in the browser.
- New storage key: `qingyun_v1_free`
- Legacy progress from `nihao_max_advanced_v1` is migrated automatically when found.
- Backup/Restore remains available.

## Release gate

Current state: `PRE_GIT_AUDIT_PASS / BRANCH_PUSH_READY`

The repository must not be called the product Source of Truth until the live subpath, refresh/reopen, old-data migration, and Android field checks pass.

Do not label this build `PRODUCTION_READY` until real Android/Chrome field validation passes:
1. Pinyin full navigation
2. Chinese TTS
3. SRS persistence after browser restart
4. writing canvas touch
5. user-written strokes persist while stepping stroke order
6. Backup/Restore
7. live HTTPS Notice test with `?test=1`
