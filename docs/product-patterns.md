# Product patterns for Aalim · أنماط تصميم المنتج في عالم

A designer's brief: patterns taken from language-learning, conversational-AI, hiring and people-analytics products, adapted for Aalim's four users (candidate, employer, manager, self-learner). It follows [design-references.md](design-references.md), which covers the visual language. This file covers flows, behaviour and screens.

**How the research was done.** Every reference below was opened and read; quotes are taken from the page text. Where a page could not be opened, that is said next to it.

**What could not be verified:**
- Medium blocked the Babbel case study (HTTP 403), so its points are paraphrased from search summaries.
- Both Dribbble shots in the brief came back empty, and Dribbble search hit a bot check, so no concept shots are used.
- Refero search pages rendered as empty JavaScript shells.
- Page Flows returned 403 for all four searches.
- Mobbin's public keyword pages load as thumbnails only; anything past them opens a sign-up wall.
- No page that loaded showed a live AI-interviewer turn-taking screen or an Arabic right-to-left assessment. Those two areas rest on Aalim's own design.

Users: **C** candidate · **E** employer · **M** manager · **S** self-learner.

---

## 1. References board · لوحة المراجع

### Onboarding & assessment

| # | Reference | Pattern it shows |
|---|---|---|
| 1 | [Language-learning onboarding teardown](https://screensdesign.com/articles/language-learning-app-onboarding/) (screensdesign, article) | Level labels with plain can-do descriptions and "Offer I am not sure and a short placement activity". The test "states its eight-level scope, approximate length, and easier-or-harder behavior before it starts". "Present the recommended level and let the learner move it". "Do not use a paywall to withhold the placement result after collecting substantial effort." |
| 2 | [Busuu flow](https://screensdesign.com/apps/busuu-language-learning/) (screensdesign, recorded flow; screens locked) | A "Choose Level or Test" step. Article 1 describes it as "choose a known CEFR level or take a ten-minute placement test without losing the alternative." **Anti-pattern:** sign-up comes before any value, and a paywall sits right after the quiz. |
| 3 | [LinkedIn Skill Assessments](https://mobbin.com/explore/web/screens/quiz) (Mobbin, shipped) | One pre-start card: "15 multiple choice questions", "1.5 minutes per question", "You must complete this assessment in one session". It has separate **Practice** and **Start** buttons, plus "Accessibility mode", "Language" and "We won't show your results to anyone without your permission". The question screen shows a thin progress bar, "Q1/15 01:23" and "Something wrong with this question? Give feedback". |
| 4 | [HackerRank: extra time](https://hackerrank-knowledge-base.help.usepylon.com/articles/4811403281) and [onboarding candidates](https://hackerrank-knowledge-base.help.usepylon.com/articles/9695299159-onboarding-candidates) (help centre) | The employer grants extra time as a percentage. "The updated duration appears in the test invite email and on the test landing page." "Candidates can find the sample test on their login page." |

### AI interviewer

| # | Reference | Pattern it shows |
|---|---|---|
| 5 | [Easy Speak](https://screensdesign.com/showcase/english-learning-easy-speak) (screensdesign, recorded flow) | "uses a chat interface for everything from onboarding to lessons". Feedback after each turn "corrects a user's sentence structure but also isolates specific words" for practice. |
| 6 | [Speak](https://screensdesign.com/apps/speak-learn-spanish-french/) (screensdesign, recorded flow) | "a large microphone button", "Tap to start recording" and "a sound wave indicator". There is a silent fallback: "a microphone button and an I can't speak now option". The chat opens with "a welcome message, suggestion cards, and a text input field". |
| 7 | [HireVue AI Explainability Statement 2025](https://www.hirevue.com/wp-content/uploads/2025/10/HV_2025_AI-Explainability-Statement.pdf) (vendor document) | Applicants review an AI consent statement and can "opt in or out of the use of AI"; anyone who opts out is rated by a human on the same scales. The AI "does not use any video analysis or other audio characteristics". Recommended settings: prep time, unlimited retries, candidate feedback report on, numeric score off. |
| 8 | [Maki: how AI is used in my assessment](https://help.makipeople.com/en/articles/659390-how-is-ai-used-in-my-maki-assessment) (help centre, for candidates) | "You have the right to know how AI is involved in this process." The voice agent "does not make any hiring decisions". "Proctoring results do not disqualify you automatically." |

### Report

| # | Reference | Pattern it shows |
|---|---|---|
| 9 | [Ashby AI feedback summaries](https://docs.ashbyhq.com/ai-generated-feedback-summaries) (help centre) | A "Show All Citations" control reveals the source feedback behind each AI-written bullet. There are also "Generate with AI" and "Regenerate" controls. |
| 10 | [TestGorilla product tour](https://testgorilla.com/product-tour) (shipped product page) | "You see exactly why each candidate scored the way they did." Reviewers can override a score. Integrity events are time-stamped: "A flag is context, not a verdict." |
| 11 | [Greenhouse scorecards](https://support.greenhouse.io/hc/en-us/articles/15756249510427-Scorecards-FAQ) (help centre) | Rated focus attributes are linked to specific interview questions. Admins can hide other interviewers' scorecards to prevent bias. |

### Training path

| # | Reference | Pattern it shows |
|---|---|---|
| 12 | [Duolingo: new home path](https://blog.duolingo.com/new-duolingo-home-screen-design/) and [intermediate mini-units](https://blog.duolingo.com/intermediate-mini-units/) (company blog) | One path, "designed as a path that you'll follow step by step". "Practice is also forward progress". Units have descriptive names ("get directions", not "City 3"), and there's a guidebook per unit. Short units introduce a little and "then immediately puts them into use". The reason given: learners "wanted more chances to use language in realistic situations". |
| 13 | [Duolingo: improving the streak](https://blog.duolingo.com/improving-the-streak/), [how streaks keep learners committed](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/) and [widget](https://blog.duolingo.com/widget-feature/) (company blog; habit research only) | **Low bar:** one lesson extends the habit, and the daily goal is separate. Reported effect: "3.3% increase in Day 14 retention". **Weekend protection:** learners were "4% more likely to come back a week later". **Pacing:** learners who binge "were much more likely to abandon". **At-a-glance status:** whether today's practice is done or "at risk". |
| 14 | [Babbel grammar guide case study](https://medium.com/babbeldesign/grammar-guide-case-study-526b45d9680e) (company design blog; blocked, paraphrased from search summaries) | A reference section beside the lessons, not inside them. In a five-person test, learners preferred grouping by level over grouping by topic. Each topic page goes short definition → reference table → examples. |

### Manager dashboard

| # | Reference | Pattern it shows |
|---|---|---|
| 15 | [Lattice: skills and capability gap analysis](https://lattice.com/ai-skills/skills-capability-gap-analysis) (vendor page) | "Build a capability by team heatmap." Every cell carries an evidence label: "Demonstrated at next level", "In progress", "Not evidenced" or "Manager estimate". Team priorities are marked "covered, thin or missing". "It never ranks or scores people." Stretch work is "offered, never assigned". |

**Supporting sources, used in the decisions and pitfalls:**
- NN/g on [mobile onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/), [onboarding tutorials](https://www.nngroup.com/articles/onboarding-tutorials/), [user autonomy](https://www.nngroup.com/articles/increase-user-autonomy/), [autonomy, relatedness and competence](https://www.nngroup.com/articles/autonomy-relatedness-competence/), [explainable AI in chat](https://www.nngroup.com/articles/explainable-ai/), [progress indicators](https://www.nngroup.com/articles/progress-indicators/), [visibility of system status](https://www.nngroup.com/articles/visibility-system-status/), [dashboards](https://www.nngroup.com/articles/dashboards-preattentive/) and [common region](https://www.nngroup.com/articles/common-region/).
- Onboarding teardowns of Duolingo by [Appcues](https://goodux.appcues.com/blog/duolingo-user-onboarding) and [UserGuiding](https://userguiding.com/blog/duolingo-onboarding-ux).
- [Loora](https://screensdesign.com/apps/speak-english-with-loora-ai/?vs=207872) (layered feedback).
- [HackerRank detailed report](https://hackerrank-knowledge-base.help.usepylon.com/articles/8263794320-viewing-a-candidate%27s-detailed-test-report) (answer playback).
- [Uxcel screening](https://uxcel.com/uxcel-screen) (side-by-side skill reports).
- [Pluralsight Role IQ](https://www.pluralsight.com/product/role-iq) (readiness against a target role).
- [Hume voice screens on Mobbin](https://mobbin.com/explore/web/screens/voice-user-interface) (microphone check).

---

## Pattern decisions · قرارات الأنماط

Each pattern gives its source, the pattern itself, how Aalim adapts it and for whom, what to avoid, and how it mirrors for Arabic.

**P1. Two doors to a level.**
- **Source:** [screensdesign onboarding](https://screensdesign.com/articles/language-learning-app-onboarding/), [Busuu](https://screensdesign.com/apps/busuu-language-learning/)
- **Pattern:** pick your level from plain can-do statements, or take a short placement test, with "I'm not sure" as a way in.
- **Aalim (S):** Grow onboarding asks per skill area. The person can choose one of three "I can…" statements or "I'm not sure", which sends them to the adaptive baseline for that area only. A chosen level starts as a wide range and narrows with practice, so choosing never locks anyone in.
- **Avoid:** CEFR-style letter codes or jargon levels; making the test compulsory; labels that sound like grades.
- **RTL:** statements are full sentences, right-aligned; the radio control sits at the start (right).

**P2. Explain the test before it starts.**
- **Source:** [screensdesign onboarding](https://screensdesign.com/articles/language-learning-app-onboarding/), [LinkedIn via Mobbin](https://mobbin.com/explore/web/screens/quiz)
- **Pattern:** state the scope, length and adaptive behaviour up front, along with who sees the results, accessibility and language.
- **Aalim (C, S):** one pre-start card says:
  - roughly how long it takes;
  - "one sitting, answers save as you type" (or "you can pause between chapters");
  - "questions get easier or harder as you answer";
  - who sees the report;
  - the accommodations, language and an "How AI is used" link.
- **Avoid:** carousels, a wall of rules, and threat language about cheating.
- **RTL:** the card's fact list reads right to left. Durations stay in a bidi isolate (`50`), and the pause icon is not mirrored.

**P3. Practise before the clock.**
- **Source:** [LinkedIn via Mobbin](https://mobbin.com/explore/web/screens/quiz) (Practice beside Start), [HackerRank](https://hackerrank-knowledge-base.help.usepylon.com/articles/9695299159-onboarding-candidates) (sample test), [NN/g onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/) ("learn by doing… in a low-stakes environment")
- **Pattern:** one untimed sample item that doesn't count.
- **Aalim (C):** a "Try a practice scene" button on the pre-start card, using the same item types (message, ranking, written answer, interviewer turn) and clearly marked as not scored.
- **Avoid:** a tutorial deck before it. NN/g says tutorials "are dramatically overused".
- **RTL:** same as the real items.

**P4. Accommodations set quietly.**
- **Source:** [HackerRank extra time](https://hackerrank-knowledge-base.help.usepylon.com/articles/4811403281)
- **Pattern:** the employer grants extra time, and the candidate simply sees the adjusted duration.
- **Aalim (C, E):**
  - Candidates choose extra time (×1.25, ×1.5), untimed, or larger text themselves on the pre-start card. This already exists.
  - Employers can also pre-grant extra time per invitation.
  - The report never marks who used an accommodation.
- **Avoid:** making candidates email the company for an accommodation, and badges or labels that single anyone out.
- **RTL:** the multiplier stays as written (`×1.5`).

**P5. A professional AI interviewer.**
- **Source:** [Easy Speak](https://screensdesign.com/showcase/english-learning-easy-speak), [Speak](https://screensdesign.com/apps/speak-learn-spanish-french/), [Hume via Mobbin](https://mobbin.com/explore/web/screens/voice-user-interface)
- **Pattern:** a chat flow, press-to-talk with a listening state, a text fallback, and a microphone check before the call.
- **Aalim (C):** the role-play is a turn-based interview:
  - The interviewer is always labelled "AI interviewer". Turns are numbered ("Question 3 of about 6"), and there's a short prep-time note before each answer.
  - Hold-to-talk shows a live transcript the candidate can read and correct before sending. "Type instead" is always visible.
  - The microphone check and permission come before the first question, and denying access falls back to text.
- **Avoid:** casual chat tone, emoji, typing-dot theatre, a human-like avatar, praise after each answer, and suggestion chips that hint at answers.
- **RTL:** interviewer bubbles sit on the start side (right) and the candidate's on the end side. The send arrow mirrors; the microphone does not. A transcript mixing Arabic and English uses `<bdi>`.

**P6. Say plainly how AI is used.**
- **Source:** [HireVue statement](https://www.hirevue.com/wp-content/uploads/2025/10/HV_2025_AI-Explainability-Statement.pdf), [Maki help](https://help.makipeople.com/en/articles/659390-how-is-ai-used-in-my-maki-assessment), [NN/g explainable AI](https://www.nngroup.com/articles/explainable-ai/)
- **Pattern:** consent, and what AI does and doesn't do. Opting out leads to human review; AI never decides; proctoring never disqualifies automatically.
- **Aalim (C):** a bilingual "How AI is used in this assessment" page and a one-line disclosure by the interviewer's input box. It states what AI scores (the content of answers against written rubrics) and what it never uses (face, voice tone, accent). Recruiters make the decision. A candidate can ask for human-only review.
- **Avoid:** burying this in the terms, "talk to our team" framing that hides the AI, and emotion or voice analysis of any kind.
- **RTL:** page and disclosure written natively in Arabic, not translated word for word.

**P7. Feedback in parts (training only).**
- **Source:** [Easy Speak](https://screensdesign.com/showcase/english-learning-easy-speak), [Loora](https://screensdesign.com/apps/speak-english-with-loora-ai/?vs=207872)
- **Pattern:** feedback after a turn, split into separate parts, with a layered drill-down from overall to specific.
- **Aalim (S):** after a practice answer, three cards (content, structure, communication). Each has "what worked", "a stronger version" and "practise this". A sentence-level view highlights the exact phrase each comment refers to.
- **Avoid:** percentages like "94%", "MORE PRACTICE NEEDED!" style shouting, and showing any feedback during an employer assessment, which would teach to the test.
- **RTL:** cards stack in reading order. The quoted phrase uses « » and the saffron highlight.

**P8. Every claim cites its evidence.**
- **Source:** [Ashby citations](https://docs.ashbyhq.com/ai-generated-feedback-summaries), [TestGorilla](https://testgorilla.com/product-tour), [HackerRank report](https://hackerrank-knowledge-base.help.usepylon.com/articles/8263794320-viewing-a-candidate%27s-detailed-test-report), [NN/g explainable AI](https://www.nngroup.com/articles/explainable-ai/) ("sources directly next to the specific claim")
- **Pattern:** AI summaries show their sources; reviewers see exactly why a score was given and can override it; answers can be replayed.
- **Aalim (E):**
  - Each strength and development point carries citation chips (scene, time). A chip opens the answer at that passage.
  - A reviewer can adjust a skill level but must add a note. The change is logged and shown.
  - Integrity events read "Context for the reviewer, never a verdict".
- **Avoid:** bare plagiarism or match percentages, summaries with no source, and step-by-step "reasoning" that implies certainty (NN/g).
- **RTL:** citation chips follow the sentence they support (at its end, which is the left in Arabic). Scene numbers and times are isolated.

**P9. Structured interview from the gaps.**
- **Source:** [Greenhouse scorecards](https://support.greenhouse.io/hc/en-us/articles/15756249510427-Scorecards-FAQ)
- **Pattern:** rated attributes linked to interview questions, with other interviewers' scorecards hidden to avoid bias.
- **Aalim (E):** the report's interview questions become a short scorecard. Each question is linked to the skill it probes, needs a one-line note with the rating, and other panel members' ratings stay hidden until you submit.
- **Avoid:** pass/fail toggles without evidence.
- **RTL:** rating scales mirror (lowest at the right), and labels are words, not just numbers.

**P10. A candidate feedback page.**
- **Source:** [HireVue](https://www.hirevue.com/wp-content/uploads/2025/10/HV_2025_AI-Explainability-Statement.pdf) (candidate feedback report "Recommended On"), [Uxcel via Mobbin](https://mobbin.com/explore/web/screens/student-performance-dashboard) (result plus recommendations)
- **Pattern:** give candidates something back.
- **Aalim (C):** if the employer turns it on, the candidate gets a short summary:
  - two strengths with their own quoted words;
  - one area to grow, with a suggested practice track in Grow (free).
  - It has no score, no percentile and no comparison.
- **Avoid:** "Share on LinkedIn" badges, percentile ranks and raw scores without a scale.
- **RTL:** native Arabic copy, and the quotes use « ».

**P11. One next step, with review on the path.**
- **Source:** [Duolingo home path](https://blog.duolingo.com/new-duolingo-home-screen-design/), [mini-units](https://blog.duolingo.com/intermediate-mini-units/)
- **Pattern:** a single path where practice counts as progress, units named descriptively, and short units applied in realistic situations.
- **Aalim (S):**
  - Grow's "Today" shows one next step.
  - Tracks are named for situations ("Push back on an unrealistic deadline"), not abstract skills.
  - Each unit is a two-minute guide, then a realistic scene, then review. Review scenes on earlier skills sit on the path as normal steps.
  - Completed steps can be reopened.
- **Avoid:** crowns, trophies, "legendary" levels and a cartoon map.
- **RTL:** the path runs from the start edge (right), and the "jump to current" control mirrors.

**P12. A forgiving rhythm, not a streak.**
- **Source:** [Duolingo streak research](https://blog.duolingo.com/improving-the-streak/), [how streaks work](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/), [widget](https://blog.duolingo.com/widget-feature/)
- **Pattern:** a low bar (one session counts), weekend protection that brought learners back, a warning that binge use predicts dropout, and an at-a-glance "done today" status.
- **Aalim (S):**
  - The person picks a weekly rhythm (for example 3 sessions a week). One session counts, and rest days are built in rather than bought.
  - Home and the weekly strip show "Done today" or "Not yet today".
  - Missing a day loses nothing. The week either is or isn't on track, and "weeks on track" replaces a day counter.
- **Avoid:** loss-aversion copy ("your streak is at risk!"), streak freezes bought with currency, panicking mascots, midnight deadlines and daily push pressure.
- **RTL:** the week strip starts on the right and on the locale's first day of the week (Sunday in Saudi Arabia; settable). Day initials are in Arabic.

**P13. Skill guides beside the path.**
- **Source:** [Babbel grammar guide](https://medium.com/babbeldesign/grammar-guide-case-study-526b45d9680e) (paraphrased)
- **Pattern:** a reference section separate from lessons, grouped by level, with each topic going definition → table → examples.
- **Aalim (S, M):**
  - A "Guides" library next to Tracks, grouped by level (Emerging → Expert).
  - A page such as "Decision-making" runs: a three-line definition; a framework table (for example reversible vs irreversible decisions, or options × criteria); workplace examples set in the region; then "Practise this" into a matching scene.
  - Managers can attach a guide to a development suggestion.
- **Avoid:** long articles and stock illustrations.
- **RTL:** framework tables mirror their column order, and example names and settings are local.

**P14. An evidence-labelled team matrix.**
- **Source:** [Lattice](https://lattice.com/ai-skills/skills-capability-gap-analysis), [Pluralsight Role IQ](https://www.pluralsight.com/product/role-iq)
- **Pattern:** a capability-by-team heatmap with an evidence label on every cell, team priorities shown as covered/thin/missing, no ranking, and stretch work offered rather than assigned. Readiness is measured against a target role, with a loop to reassess.
- **Aalim (M):**
  - Rows are skill areas. By default the matrix shows counts per level; names appear only with each person's consent.
  - Every cell carries a label: "Evidenced at target", "In progress", "Not yet evidenced" or "Not assessed".
  - A target-role selector shows covered, thin or missing for each area.
  - Development suggestions are offered to the person, never assigned.
  - "Reassess in 90 days" closes the loop.
- **Avoid:** ranking people, single "IQ"-style numbers, and red/green colouring.
- **RTL:** skill rows are labelled on the right and columns start at the right. The heatmap legend reads right to left; counts follow the chosen numeral style.

**P15. Value before sign-up.**
- **Source:** [Appcues teardown](https://goodux.appcues.com/blog/duolingo-user-onboarding) ("postponing registration for as long as possible"), [UserGuiding](https://userguiding.com/blog/duolingo-onboarding-ux), [NN/g autonomy](https://www.nngroup.com/articles/increase-user-autonomy/) (don't gate content behind forms)
- **Pattern:** try first; ask for an account at a logical moment.
- **Aalim (S, E):**
  - The marketing site gets "Try one scene": a two-minute scene with split feedback and no account. Only then does it offer "Save your result and get a plan".
  - Employers get a sample report and a preview of the candidate experience before sign-up.
- **Avoid:** paywalling the result after effort, and segmentation questions asked for marketing.
- **RTL:** same as the scene.

---

## 2. Recurring patterns · أنماط متكرّرة

1. **Say what will happen before it happens.** Scope, length, adaptive behaviour, who sees the result, and how AI is involved (LinkedIn, screensdesign, HireVue, Maki).
2. **Learning by doing beats tutorials.** A practice item or sample test instead of explainer decks (LinkedIn, HackerRank, NN/g).
3. **The person stays in control** of their level, pace, order, AI involvement and accommodations (Busuu, NN/g autonomy, HireVue opt-out, HackerRank extra time).
4. **Scores travel with their evidence:** citations, playback and per-attribute notes, plus the right to override (Ashby, TestGorilla, HackerRank, Greenhouse).
5. **Feedback is split and specific.** Separate dimensions, a better version, and a next action (Easy Speak, Loora, Uxcel).
6. **One clear next step**, with review counted as progress (Duolingo path).
7. **The low bar wins on habits**, and protection days help. Pressure and bingeing predict dropout (Duolingo research).
8. **Team views protect people.** Counts by default, evidence labels and no ranking (Lattice).

## 3. Concrete ideas for Aalim · أفكار عملية

1. **"Where are you today?"** (S). Grow onboarding offers three "I can…" statements per area plus "I'm not sure". The result can be adjusted, and the baseline runs only for the areas the person was unsure about. Example statements for decision-making:
   - "I can make a sound call on routine issues when the facts are clear." · «أستطيع اتخاذ قرار سليم في المسائل الروتينية عندما تكون الحقائق واضحة.»
   - "I can weigh trade-offs and say who carries the cost." · «أستطيع الموازنة بين الخيارات وتحديد من سيتحمّل الكلفة.»
   - "I can decide under uncertainty and say what would change my mind." · «أستطيع اتخاذ القرار في ظل عدم اليقين، وتحديد ما الذي قد يغيّر رأيي.»
   - "I'm not sure. Help me find out." · «لست متأكدًا، ساعدني على معرفة ذلك.»
2. **The pre-start card** (C). One screen with time, one sitting, autosave, adaptive behaviour, who sees results, language, accommodations and "How AI is used", plus **Practice** and **Start** side by side. Microphone check here if the assessment has spoken role-play.
3. **The AI interviewer, done formally** (C). Turn counter, prep note, hold-to-talk with an editable transcript, "Type instead", and the label "AI interviewer" · «محاوِر بالذكاء الاصطناعي» on every turn. No praise, no hints, no avatar.
4. **"How AI is used" and human-only review** (C, E). A bilingual page and per-assessment setting. Candidates can ask for human-only review, and employers see a plain record of each request.
5. **Three-part practice feedback** (S): content · المضمون, structure · البنية, communication · التواصل. Each part has "what worked", "a stronger version" and "practise this", with the exact phrase highlighted.
6. **Cited report with accountable overrides** (E). Citation chips on every claim, open-in-context, overrides that need a note and are logged, and integrity shown as "Context for the reviewer, never a verdict" · «سياق للمراجِع، وليس حكمًا أبدًا».
7. **Interview kit from the gaps** (E). Generated questions become a blind, per-skill scorecard that needs a note with each rating. It completes the loop from assessment to interview to decision.
8. **Candidate feedback summary** (C). If the employer enables it, the candidate gets two strengths with their own words and one area to grow, linked to a free Grow track. No scores, no ranks.
9. **Weekly rhythm with rest days** (S). The person chooses sessions per week. "Done today" · «أنجزت اليوم» / "Not yet today" · «لم تتدرّب اليوم بعد». "Weeks on track" replaces a streak, and nothing is lost on missed days.
10. **Skill guides and an evidence-labelled team matrix** (S, M). Guides grouped by level run definition → framework table → regional examples → practise. The manager matrix uses the labels "Evidenced at target" · «مُثبَت عند المستوى المطلوب», "In progress" · «قيد التطوّر», "Not yet evidenced" · «لم يُثبَت بعد» and "Not assessed" · «لم يُقيَّم», against a chosen target role.

## 4. Pitfalls · ما يجب تجنّبه

- **Forced tutorials and intro carousels.** Tutorials "are dramatically overused" and users "frequently skip them". Make help "easy to dismiss (and recall)" ([NN/g, onboarding tutorials](https://www.nngroup.com/articles/onboarding-tutorials/)). Avoid deck-of-cards intros, or give them a "highly visible Skip option" ([NN/g, mobile onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/)).
- **Gating before value.** Don't force "all users to enter personal information before they have access to any details" ([NN/g, user autonomy](https://www.nngroup.com/articles/increase-user-autonomy/)). Never paywall a result after the work is done ([screensdesign](https://screensdesign.com/articles/language-learning-app-onboarding/)).
- **Taking control away.** Wizards "give control to the system and take it away from the user" ([NN/g, ARC](https://www.nngroup.com/articles/autonomy-relatedness-competence/)). An adaptive test is wizard-like by nature, so give autonomy *around* it (when to start, accommodations, pausing between chapters, language) rather than inside it.
- **AI that hides or overclaims.** Put disclaimers "prominently in the main interface" near the input. Avoid "step-by-step explanations that imply certainty", and place "sources directly next to the specific claim" ([NN/g, explainable AI](https://www.nngroup.com/articles/explainable-ai/)). Never let the interviewer pass as a person.
- **Hidden time and progress.** Keep system status visible ([NN/g, visibility of system status](https://www.nngroup.com/articles/visibility-system-status/)). For waits over about ten seconds (report generation), show steps done and steps remaining ([NN/g, progress indicators](https://www.nngroup.com/articles/progress-indicators/)).
- **Colour doing the data's job.** Use position and length first, with colour as a secondary cue ([NN/g, dashboards](https://www.nngroup.com/articles/dashboards-preattentive/)). Never use red/green for people. Don't box everything either ([NN/g, common region](https://www.nngroup.com/articles/common-region/)).
- **Gamification and loss-aversion.** No streak-loss threats, currency-bought freezes, leaderboards, badges or percentile ranks. Duolingo's own data shows bingeing predicts dropout ([source](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)).
- **Unfair signals.** No face, emotion, voice-tone or accent analysis (HireVue says its AI uses none; [statement](https://www.hirevue.com/wp-content/uploads/2025/10/HV_2025_AI-Explainability-Statement.pdf)). No automatic disqualification from proctoring flags. No single opaque number ("IQ", raw scores without a scale).

## 5. Design direction · اتجاه التصميم

**English.** Aalim should feel like a well-run assessment centre, not an app that wants your attention: calm, exact and fair.
- **Tone:** plain and respectful. Every screen says what is happening, why, and what the person controls.
- **Layout:** quiet paper surfaces hold the work (questions, answers, evidence, reports) inside a deep ink frame for navigation and brand moments. Each screen has one filled object: the verdict, today's next step, or the team's biggest gap.
- **Colour:** carries meaning, not decoration. Indigo is for actions and the current selection. Levels use a single-hue ramp, never red or green, which would read as pass/fail. Saffron is reserved for evidence: the person's own words.
- **Arabic and English** are designed together, not translated. The layout mirrors with logical properties, and both scripts share Alexandria for display and IBM Plex for text. Arabic gets taller line height and no letter-spacing. Digits default to Latin, with Arabic-Indic as a personal setting.
- **The report** should read like a careful reviewer's memo. A level is always a range with a confidence, and every claim sits next to the quote that supports it. The interview questions follow from the gaps, and the page says plainly that people make the decision.

**العربية.** ينبغي أن يبدو عالم مثل مركز تقييم يُدار بإتقان، لا تطبيقًا يلاحق انتباهك: هادئ ودقيق وعادل. النبرة بسيطة ومحترمة، وكل شاشة تقول ما يحدث ولماذا وما الذي يتحكم فيه الشخص. التخطيط أسطح ورقية هادئة للعمل نفسه (الأسئلة والإجابات والأدلة والتقارير) داخل إطار حبري عميق للتنقل ولحظات الهوية، مع عنصر بارز واحد في كل شاشة (الحكم، أو خطوة اليوم التالية، أو أكبر فجوة لدى الفريق). اللون يحمل معنى لا زينة: النيلي للإجراءات والاختيار الحالي، وتدرّج من لون واحد للمستويات (لا أحمر ولا أخضر حتى لا تُقرأ نجاحًا أو رسوبًا)، والزعفراني محجوز للأدلة، أي كلمات الشخص نفسه. تُصمَّم العربية والإنجليزية معًا لا بالترجمة: ينعكس التخطيط بالخصائص المنطقية، ويتشارك النصّان خط Alexandria للعناوين وIBM Plex للنصوص، وتحصل العربية على تباعد أسطر أكبر بلا تباعد بين الحروف، والأرقام لاتينية افتراضيًا مع الأرقام العربية المشرقية خيارًا شخصيًا. ويُقرأ التقرير كمذكرة مراجِع متأنٍّ: المستوى دائمًا نطاق مع درجة ثقة، وكل حكم بجانب الاقتباس الذي يسنده، وأسئلة المقابلة تنبع من الفجوات، والصفحة تقول بوضوح إن القرار للبشر.

### RTL rules for patterns from LTR apps · قواعد الاتجاه من اليمين إلى اليسار

| Element | In Arabic (RTL) |
|---|---|
| Progress bars, chapter steps, training path | Fill and advance from the right (the logical start). The current step sits at the reading start. |
| 1–5 skill scale and range bands | Mirror: Emerging at the right, Expert at the left, matching the progress direction. Numbers inside stay left to right (`3.6–4.2` in a bidi isolate). |
| Time-series charts (progress over weeks) | Time runs right to left. Axis labels and values use the person's digits. |
| Bar charts and heatmaps | Category labels on the right; bars grow leftwards; heatmap columns start at the right. |
| Tables | Column order mirrors (first column on the right); numeric columns align to the end. |
| Icons | Mirror directional icons (back, next, send, arrows, chevrons). Never mirror the microphone, clock, check, play or real objects. |
| Timer and durations | `mm:ss` stays left to right in a bidi isolate; the label («الوقت المتبقي») reads RTL around it. |
| Chat (AI interviewer) | Interviewer on the start side, the person on the end side; logical properties swap them. |
| Mixed script | English terms inside Arabic (Excel, KPI) sit in `<bdi>`. Quotes use « » in Arabic. |
| Numerals | Latin digits by default; Arabic-Indic (٠١٢٣) as a per-person setting, applied everywhere, including charts and timers. |
| Week strips | Start on the locale's first day of the week (Sunday in Saudi Arabia), from the right. |
| Type | Alexandria and IBM Plex Sans Arabic. Line height 1.65 for text and 1.32 for display. No letter-spacing, and no all-caps labels; Arabic has no case, so labels must work without it in both languages. |

## 6. Screens for the first version · شاشات الإصدار الأول

Status against the current build: **✓ exists** · **△ change** · **＋ new**.

### Candidate flow · رحلة المرشّح (`/a/[token]`)
1. ✓ Invitation email · رسالة الدعوة. Branded and bilingual, in the candidate's language.
2. △ Pre-start card · بطاقة ما قبل البدء. Add adaptive-behaviour and who-sees-results lines, "How AI is used", a microphone check, and Practice beside Start (P2, P3, P6).
3. ＋ Practice scene · مشهد تدريبي. Untimed, not scored, all item types (P3).
4. ＋ How AI is used · كيف يُستخدم الذكاء الاصطناعي. Includes the human-only review request (P6).
5. ✓ Briefing · الإحاطة. The fictional company and the week ahead.
6. △ Task screens · شاشات المهام: message, ranking, choice, written answer, inbox, chain, role-play. Add a turn counter, editable voice transcript and "Type instead" to role-play (P5).
7. ✓ Between chapters, pause and resume · بين الفصول، الإيقاف المؤقت والاستئناف.
8. △ Finish · الإنهاء. In an adaptive test earlier answers can't be revisited, so say so before the last scene instead of offering a misleading review step.
9. ✓ Complete, feedback and optional fairness questions · الاكتمال والملاحظات وأسئلة العدالة الاختيارية.
10. ＋ Candidate summary · ملخّص المرشّح. If the employer enables it (P10).

### Employer flow · رحلة جهة التوظيف (`/app`)
1. ✓ Home brief · الموجز. What changed, the next action, numbers that drill down.
2. ✓ New assessment from a job description · تقييم جديد من وصف وظيفي: analyse → skills and weights → fairness flags → publish.
3. ✓ Preview as candidate · المعاينة كمرشّح.
4. △ Invite · الدعوة. Add pre-granted extra time per invitation and the candidate-summary switch (P4, P10).
5. ✓ Candidates and pipeline · المرشّحون ومسار التوظيف.
6. △ Report · التقرير. Add citation chips with open-in-context, noted overrides, and "context, never a verdict" integrity (P8).
7. ＋ Interview kit · عُدّة المقابلة. A blind scorecard from the gaps (P9).
8. ✓ Compare candidates · مقارنة المرشّحين.
9. ✓ Share link and PDF · رابط المشاركة وملف PDF.
10. ✓ Fairness monitoring and outcome ratings · مراقبة العدالة وتقييمات النتائج.
11. ＋ Sample report and candidate preview before sign-up · تقرير نموذجي ومعاينة قبل التسجيل (P15).

### Manager dashboard · لوحة المدير (`/app/teams`)
1. ✓ Teams list · قائمة الفرق.
2. ✓ Consent and invitations · الموافقة والدعوات.
3. △ Team matrix · مصفوفة الفريق. Add evidence labels on cells, counts by default and names with consent (P14).
4. ＋ Target-role view · عرض الدور المستهدف. Covered / thin / missing per area (P14).
5. ✓ Leadership readiness and pairing suggestions · الجاهزية للقيادة واقتراحات الإقران.
6. △ Development plan · خطة التطوير. Suggestions are offered to the person, never assigned; guides can be attached (P13, P14).
7. ＋ Reassess cycle · دورة إعادة التقييم. A 90-day reminder and a comparison of ranges over time.

### Self-training mode · وضع التدريب الذاتي (`/app/grow`)
1. △ Onboarding · البداية. Role, goal and weekly rhythm, plus "Where are you today?" with "I can…" statements and "I'm not sure" (P1, P12).
2. ✓ Adaptive baseline · التقييم المرجعي. Runs only for areas marked "not sure" (P1).
3. ＋ Adjust your result · عدّل نتيجتك. Move a level and see the range widen (P1).
4. △ Today · اليوم. One next step plus the weekly rhythm strip (P11, P12).
5. △ Practice scene and feedback · مشهد التدريب والملاحظات. Three-part feedback (P7).
6. △ Tracks · المسارات. Units named by situation, with review steps on the path (P11).
7. ＋ Guides · الأدلة. Grouped by level; definition → framework table → examples → practise (P13).
8. △ Progress · التقدّم. "Weeks on track" and ranges over time; no streak counter (P12).
9. ✓ Coach · المدرّب. With the AI label near the input (P6).
10. ＋ Try one scene before sign-up · جرّب مشهدًا قبل التسجيل (P15).
