<!-- DRAFT: references and ideas are filled in from the research rounds. -->
# Product patterns for Aalim · أنماط تصميم المنتج في عالم

## 5. Design direction · اتجاه التصميم

**English.** Aalim should feel like a well-run assessment centre, not an app that wants your attention: calm, exact and fair. Tone is plain and respectful; every screen says what is happening, why, and what the person controls. Layout is quiet paper surfaces for the work (questions, answers, evidence, reports) inside a deep ink frame for navigation and brand moments, with one filled object per screen (the verdict, today's next step, the team's biggest gap). Colour carries meaning, not decoration: indigo for actions and the current selection, a single-hue ramp for levels (never red or green, which would read as pass/fail), and saffron reserved for evidence, meaning the person's own words. Arabic and English are designed together, not translated: the layout mirrors with logical properties, both scripts share Alexandria for display and IBM Plex for text, Arabic gets taller line height and no letter-spacing, and digits default to Latin with Arabic-Indic as a personal setting. The report should read like a careful reviewer's memo: a level is always a range with a confidence, every claim sits next to the quote that supports it, the questions to ask in interview follow from the gaps, and the page says plainly that people make the decision.

**العربية.** ينبغي أن يبدو عالم مثل مركز تقييم يُدار بإتقان، لا تطبيقًا يلاحق انتباهك: هادئ ودقيق وعادل. النبرة بسيطة ومحترمة، وكل شاشة تقول ما يحدث ولماذا وما الذي يتحكم فيه الشخص. التخطيط أسطح ورقية هادئة للعمل نفسه (الأسئلة والإجابات والأدلة والتقارير) داخل إطار حبري عميق للتنقل ولحظات الهوية، مع عنصر بارز واحد في كل شاشة (الحكم، أو خطوة اليوم التالية، أو أكبر فجوة لدى الفريق). اللون يحمل معنى لا زينة: النيلي للإجراءات والاختيار الحالي، وتدرّج من لون واحد للمستويات (لا أحمر ولا أخضر حتى لا تُقرأ نجاحًا أو رسوبًا)، والزعفراني محجوز للأدلة، أي كلمات الشخص نفسه. تُصمَّم العربية والإنجليزية معًا لا بالترجمة: ينعكس التخطيط بالخصائص المنطقية، ويتشارك النصّان خط Alexandria للعناوين وIBM Plex للنصوص، وتحصل العربية على تباعد أسطر أكبر بلا تباعد أحرف، والأرقام لاتينية افتراضيًا مع الأرقام العربية المشرقية خيارًا شخصيًا. ويُقرأ التقرير كمذكرة مراجع متأنٍّ: المستوى دائمًا نطاق مع درجة ثقة، وكل حكم بجانب الاقتباس الذي يسنده، وأسئلة المقابلة تنبع من الفجوات، والصفحة تقول بوضوح إن القرار للبشر.

## RTL rules for patterns from LTR apps · قواعد المحاذاة من اليمين إلى اليسار

| Element | In Arabic (RTL) |
|---|---|
| Progress bars, chapter steps, path | Fill and advance from the right (logical start). The current step sits at the reading start. |
| 1–5 skill scale and range bands | Mirror: Emerging at the right, Expert at the left, matching the progress direction. The numbers inside stay left-to-right (`3.6–4.2` in a bidi isolate). |
| Time-series charts (progress over weeks) | Time runs right to left; axis labels and values use the chosen digits. |
| Categorical bar charts and heatmaps | Category labels on the right; bars grow leftwards. Heatmap columns (skills) start at the right. |
| Tables | Column order mirrors (first column on the right); numeric columns align to the end. |
| Icons | Mirror directional icons (back, next, send, arrows, chevrons, "continue"). Do not mirror the microphone, clock, check, play, or anything that represents a real object. |
| Timer and durations | `mm:ss` stays left-to-right inside a bidi isolate; the label ("الوقت المتبقي") reads RTL around it. |
| Chat (AI interviewer) | Interviewer on the start side, the person on the end side; logical properties swap them automatically. |
| Mixed script | English terms inside Arabic sentences (Excel, KPI) sit in `<bdi>`; quotes use « » in Arabic. |
| Numerals | Latin digits by default; Arabic-Indic (٠١٢٣) as a per-person setting, applied everywhere including charts and timers. |
| Type | Alexandria and IBM Plex Sans Arabic; line height 1.65 for text and 1.32 for display; no letter-spacing; no all-caps labels (they don't exist in Arabic, so labels must work without them in both). |
