# Prompt catalogue

Every AI agent has one narrow job, a strict output schema (Zod, sent as a structured-output format and validated on return), a versioned prompt file, and logged inputs and outputs (`ai_call_log`: tokens, cost, latency, version). Deterministic, tested code decides *what* to test next; the model only generates content and scores answers.

All agents run through `runAgent()` (`src/lib/ai/run.ts`), which picks the provider, retries once on a schema failure and logs the call. Model: Claude Opus 5.5 (`AALIM_MODEL` overrides), with server-side fallback enabled. Effort replaces temperature (D-023).

| Agent | File | Effort | Job | Offline fallback |
|---|---|---|---|---|
| JD Analyst | `jd-analyst.ts` | medium | Job description → role summary, seniority, role family, technical sub-skills with anchors, 9-domain weights and importance, industry. Flags discriminatory or irrelevant requirements (age, gender, nationality, native-speaker, appearance), and publishing is blocked until they're reviewed. | Keyword analysis + role-family library |
| World Builder | `world-builder.ts` | low | Fictional company, cast of 5–8 people with names from many cultures, three chapters, storyline hooks. Kept consistent across the session. | One of 6 curated worlds |
| Item Generator | `item-generator.ts` | medium | One item for target sub-skills, type, difficulty and purpose (calibrate, explore, validate, stress), set in the world and aware of earlier decisions. Follows the 10 design rules and includes a hidden rubric, strong indicators, red flags, embedded detail, probe and twist. | Best-matching curated bank item |
| Guessability Checker | `guessability.ts` | low | Plays a savvy non-expert and tries to pick the "right" option. High confidence → the item is regenerated. | Not needed for curated items |
| Scorer | `scorer.ts` | high | Scores one answer against its rubric. Verbatim evidence or no score. Ignores length, tone and fluency except for communication sub-skills. Sees only the item and answer (no halo). High-impact items are scored twice, with a third pass on gaps of more than a level. | Rubric-and-signal scorer |
| Role-play Actor | `roleplay-actor.ts` | low | A stakeholder with hidden goals and a mood that reacts to how the person communicates. Never breaks character; ends at resolution or the turn limit. | Scripted actor driven by signals |
| Report Writer | `report-writer.ts` | medium | Candidate model → narrative for the Hire report (summary, strengths, development areas, interview questions) or the Grow report and plan. Every claim cites evidence ids; specific, constructive, never judgemental. Role fit is computed in code, not by the writer. | Template narrative from the model |
| Practice Feedback | `practice-feedback.ts` | medium | Grow practice: what the answer did well, what an expert would also consider, and a twist to try. | Rubric-based feedback |
| Coach | `coach.ts` | medium | Talks through the person's report and practice and plans next steps. Honest, direct, never flattering, never diagnostic. | Template replies grounded in the profile |

## Versioning rules

- Each agent's `version` string (e.g. `scorer.v1`) is recorded on what it produced: `Item.promptVersion` (or `bank:<id>` for curated items), `ItemScore.scorerVersion`, `ScenarioWorld.promptVersion`, `Report.writerVersion`.
- Changing a prompt's wording bumps its version.
- Every engine or scorer change runs the 30 simulated personas (`npm test`): profiles must be recovered within one level on at least 80% of sub-skills.

## Templates

The Item Generator and Scorer prompts start from the templates in the product brief, extended with the world context, the embedded-detail rule and the verbatim-evidence contract.
