# Prompt catalogue

Every AI agent has one narrow job, a strict JSON output schema (validated with Zod), a versioned prompt file and logged inputs and outputs (`ai_call_log`: tokens, cost, latency). Deterministic, tested code decides *what* to test next; the model only generates scenarios and scores answers.

Status: **Phase 0 defines the contracts below. The prompts are implemented in Phase 1** (JD Analyst, World Builder, Item Generator, Guessability Checker, Scorer, Report Writer) and later phases (Role-play Actor in 2, Coach in 3).

| Agent | Job | Temperature | Output (summary) | Phase |
|---|---|---|---|---|
| JD Analyst | Job description → role summary, seniority, technical sub-skill map, 9-domain weights, industry for the fictional company. Flags discriminatory or irrelevant requirements (age, gender, nationality, appearance). | 0.2 | `{ summary, seniority, industry, technicalSkills[], domainWeights{}, flags[] }` | 1 |
| World Builder | Fictional company, cast of 5–8 characters, storyline hooks. Names from many cultures; consistent across the session. | 0.8 | `{ companyName, industry, premise, cast[], chapters[], hooks[] }` | 1 |
| Item Generator | One item for a target sub-skill set, difficulty and type, using the world and earlier decisions. Follows every design rule; includes hidden rubric, strong indicators, red flags, embedded detail, probe and twist. | 0.8 | `{ scenario, materials[], task, options[]?, probe, twist, rubric{}, strong_indicators[], red_flags[], embedded_detail }` (`materials` uses `src/lib/assessment/materials.ts`) | 1 |
| Guessability Checker | Acts as a savvy non-expert test-taker and tries to pick the best option. High-confidence identification → regenerate. | 0 | `{ picked, confidence, reasoning }` | 1 |
| Scorer | Scores one response against its rubric. Verbatim evidence or no score. Ignores length, tone, grammar and fluency except for communication sub-skills. Sees only item + response (no halo). High-impact items scored twice; a gap of more than one level triggers a third pass. | 0–0.2 | `[{ sub_skill, level, confidence, evidence_quote, rationale }], embedded_detail_noticed` | 1 |
| Report Writer | Candidate Model → report. Every claim cites evidence; specific, constructive, never judgmental. | 0.3 | Hire / Grow report sections | 1–2 |
| Role-play Actor | Stakeholder with hidden goals and a mood that reacts to how the person communicates. Never breaks character; ends at resolution or turn limit. | 0.7 | `{ reply, mood, goal_progress, should_end }` | 2 |
| Coach | Discusses the report and plans practice. Honest and direct; never flatters. | 0.5 | chat | 3 |

## Versioning rules

- Each prompt lives in `src/lib/ai/prompts/<agent>.v<N>.ts` with its Zod schema. Changing the wording bumps `N`.
- `Item.promptVersion`, `ItemScore.scorerVersion`, `ScenarioWorld.promptVersion` and `Report.writerVersion` record what produced each row.
- Every prompt change runs the 30 simulated personas; profiles must be recovered within one level on at least 80% of sub-skills (Phase 1 acceptance).

## Templates

The Item Generator and Scorer templates from the product brief are the starting point for v1 and are reproduced verbatim in the Phase 1 prompt files.
