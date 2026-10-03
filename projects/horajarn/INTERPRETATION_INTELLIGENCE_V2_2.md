# HORAJARN Interpretation Intelligence V2.2

Status: side-by-side development. HORAJARN FREE V1 production UI is not switched.

Goals:
- Synthesize evidence instead of concatenating raw meanings.
- Keep major, supporting and time-context signals distinct.
- Collapse duplicate evidence before wording.
- Surface conflict and uncertainty instead of choosing one side silently.
- Every interpretation claim must trace to one or more evidence IDs.
- Confidence describes evidence quality only; it is not predictive probability.

Hard rules:
1. Interpretation cannot create or mutate facts, rules, knowledge or source provenance.
2. A claim without evidenceRefs is invalid.
3. Duplicate evidence is suppressed deterministically and remains auditable.
4. CONFLICTED evidence must be stated as mixed/uncertain, never forced into a positive or negative verdict.
5. Advice stays separate from facts/evidence/interpretation.
6. No new astrology doctrine is introduced in this milestone.
