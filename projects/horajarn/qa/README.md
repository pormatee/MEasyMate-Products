# HORAJARN AUTO QA V1

Purpose: deterministic local QA for HORAJARN natal prediction development.

The gate runs:
- Existing regression tests.
- 100 deterministic/synthetic chart scenarios.
- 700 natal domain outputs.
- Base-4 coverage from 3 through 21.
- Pair type coverage: FRIEND / ENEMY / ELEMENT / EQUAL_POWER.
- Same-planet relationship coverage.
- Pair conflict preservation coverage.
- Determinism checks.
- Provenance checks.
- Duplicate / near-duplicate paragraph checks.
- Repeated paragraph opening checks.
- Raw astrology/system language checks.
- Negative system-tone checks.
- Domain-language leak checks.
- Performance measurement.

It does NOT claim real-world predictive accuracy.
It verifies implementation consistency against the encoded rules and language policy.

Run:

```sh
bash projects/horajarn/qa/run-auto-qa.sh
```

Optional report path:

```sh
bash projects/horajarn/qa/run-auto-qa.sh /sdcard/Download/HORAJARN_AUTO_QA_REPORT.json
```

A FAIL is expected while language issues remain. Fix the shared composer rule, then rerun the same gate.
