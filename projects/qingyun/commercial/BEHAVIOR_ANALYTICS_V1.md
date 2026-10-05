# QingYun Behavior Analytics V1

Purpose: anonymous learning journey + sale funnel signals for V2 decisions.

Privacy: fixed event names only; no free text, answer text, audio, mission IDs, or arbitrary meta. Raw IDs remain hashed by Central Analytics.

Learning: mission_start, mission_complete, mission_answer_retry, level_1..4_complete, practice_open, weak_review_start.

Sale: trial_started, trial_expired, unlock_open, buy_click, activation_success, licensed_open.

Dashboard: select QingYun in /admin/analytics/.

Release: branch-only until Android field test passes.
