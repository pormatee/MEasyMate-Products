# HORAJARN Intelligence V2.5 — Single-Brain Parity

Status: development bridge. Production UI is not switched by this milestone.

Goal: make every HORAJARN surface consume one deterministic calculation source instead of maintaining page-local copies.

Canonical calculation path:

`astroProfileV1 -> ProfileAdapterV2 -> AstroCore -> FactEngineV2 -> HoroscopeFactBridgeV2 -> consumer`

Rules:
- `AstroCore` remains the only calculation implementation during migration.
- The bridge may reshape facts for a UI, but may not recalculate them.
- `horoscope.html` legacy inline calculation is treated as migration debt until the production switch milestone.
- 05:59/06:00 and Wednesday 17:59/18:00 are mandatory parity boundaries.
- Production UI, analytics and FREE V1 files are unchanged in V2.5.
- No birth/profile fields are added to public Intelligence output or analytics.

V2.5 creates the compatibility bridge and parity gates. A later migration milestone may switch `horoscope.html` only after parity + regression + Android field validation.
