# HORAJARN Intelligence V2.4 — Calculation Accuracy Verification

Status: development side-by-side with HORAJARN FREE V1. Production UI is not switched.

## Verified / cross-checked calculation conventions

- Thai astrological day boundary used by HORAJARN: fixed 06:00 local wall-clock convention.
- Wednesday daytime: 06:00–17:59 -> Mercury (4).
- Wednesday night: 18:00–05:59 -> Rahu (8), spanning into Thursday before 06:00.
- Taksa cycle order: 1,2,3,4,7,5,8,6.
- Maha Taksa strengths: Sun 6, Moon 15, Mars 8, Mercury 17, Saturn 10, Jupiter 19, Rahu 12, Venus 21; total 108.
- Maha Taksa sub-period proportional rule: mainStrength * subStrength / 108 of a year, decomposed traditionally as 12 months/year, 30 days/month, 60 maha-minutes/day.
- Sub-period order rotates from the current main planet through the Taksa cycle.

## Important unresolved item

The legacy core maps age to a continuous Gregorian duration using 365.2425 days/year. The reviewed Maha Taksa references describe traditional year/month/day subdivision but do not establish that exact Gregorian mapping. Therefore exact transition timestamps remain `UNVERIFIED_TIMELINE_MAPPING` even though the 108 structure and sub-period ratio are cross-checked.

## Calendar verification

Golden vectors are expanded to include normal years and an intercalary month (month 88). Conflicting external references remain quarantined and are never used to mutate calculated facts automatically.

## Safety boundaries

- Calculation fact remains deterministic and immutable.
- `CALCULATED` means the code produced the result deterministically; it does not by itself mean every traditional convention is verified.
- No new Base 4 predictive meaning is activated.
- No production page is switched by V2.4.
