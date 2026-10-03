# HORAJARN Accuracy Intelligence V2.1

V2.1 separates four concepts that must not be conflated:

1. Deterministic fact certainty.
2. Knowledge/source verification quality.
3. Directional evidence (support/caution/neutral).
4. Interpretation confidence/uncertainty.

The numeric `qualityScore` is an internal evidence-quality score only. It is explicitly **not** an empirical probability that an astrological prediction will occur.

Conflict is evaluated inside `conflictGroup`, not across unrelated evidence groups. This prevents unrelated support and caution signals from being falsely treated as direct contradictions.

Evidence ranking is deterministic and traceable. Each ranked item retains fact refs, rule ref, knowledge refs, source refs, role, time scope, and the factors used in its weight.

V2.1 does not add new astrology doctrine and does not assign positive/negative direction to natal meanings unless a sourced rule explicitly provides that direction.
