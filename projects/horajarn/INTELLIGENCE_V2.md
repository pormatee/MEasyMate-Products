# HORAJARN Intelligence V2 Foundation

Status: development side-by-side with HORAJARN FREE V1. Production UI is not switched by this milestone.

Pipeline:

`astroProfileV1 -> deterministic Fact Adapter -> Knowledge Model -> Rule Match -> Evidence -> Accuracy/Conflict -> Interpretation -> Confidence -> Advice`

Hard boundaries:
- V1 calculation remains the only calculation source during Foundation.
- Interpretation cannot mutate facts.
- Every V2 evidence item carries factRefs, ruleRef, knowledgeRefs and sourceRefs.
- Confidence score is an evidence-quality score, not an empirical probability that a prediction will occur.
- Base 4 is exposed as calculated facts only; no new Base 4 meaning is invented.
- No personal birth/profile/result/question/free text is added to analytics.
- No production page is switched until parity/regression tests and Android Field Gate pass.

Foundation files live in `projects/horajarn/v2/`. Existing FREE V1 files are unchanged.
