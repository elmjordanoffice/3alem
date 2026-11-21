import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-01-billing-double-charge",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 4, informationGaps: 3 },
    targets: ["judgment.risk-calibration", "critical-thinking.quantitative-reasoning", "leadership.ownership"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "middle",
    content: {
      en: {
        title: "The billing defect",
        scenario:
          "You lead a team of five. The new billing feature goes live for {{client}} in 6 days. This morning {{report1}}, your most experienced team member, sent you a private note: the feature has a timing defect that affects roughly 1 in 2,000 transactions, and a full fix needs 8 days of work. Sales promised the launch date to {{client}}, which alone brings in 30% of {{company}}'s revenue. {{manager}} is on leave until after the launch, and the decision is yours. {{report1}}'s note and {{client}}'s volume forecast are in the materials.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "Note from {{report1}}",
            from: { name: "{{report1}}", role: "{{report1.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Billing defect: what I found",
            sentAt: "Today, 08:12",
            body:
              "I reproduced the defect 11 times in 22,000 test transactions, so roughly 1 in 2,000. It happens when two requests for the same account arrive within a fraction of a second.\n\nI can build a partial fix in 2 days that blocks the most common path; I estimate it removes about 70% of cases. The full fix needs 8 days, mostly testing.\n\nI don't think we should launch as planned, but it's your call.",
            footnote:
              "Affected transactions are not lost: the customer is charged twice, and sees two identical charges until someone reverses one by hand.",
          },
          {
            kind: "table",
            id: "m2",
            title: "{{client}} launch volume forecast",
            caption: "Forecast from {{client}}'s operations team.",
            columns: [
              { key: "period", label: "Period" },
              { key: "transactions", label: "Transactions per day", numeric: true },
            ],
            rows: [
              { period: "Day 1 (launch promotion)", transactions: 48000 },
              { period: "Day 2", transactions: 31000 },
              { period: "Day 3", transactions: 26000 },
              { period: "Days 4–7 (average)", transactions: 22000 },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            {
              id: "a",
              label: "Launch on time with close monitoring and a daily manual check that reverses duplicate charges; ship the full fix afterwards.",
            },
            { id: "b", label: "Delay the launch by 2 days, ship the partial fix, and tell {{client}} about the remaining risk." },
            {
              id: "c",
              label: "Launch on time without the new billing feature; {{client}} keeps the old billing process until the full fix is ready.",
            },
            { id: "d", label: "Explain the defect and the options to {{client}} today, and let them choose." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt:
            "{{report1}} strongly disagrees with your choice and says they will raise it with {{exec}}. Write your reply to {{report1}}.",
        },
        twist: {
          change:
            "Day 3: you learn that {{client}} works in a regulated sector, where every duplicate charge must be reported to the regulator within 24 hours.",
          prompt: "Does your plan change? What do you do now, and who do you tell?",
        },
      },
      ar: {
        title: "خلل الفوترة",
        scenario:
          "تقود فريقًا من خمسة أشخاص، وتنطلق خاصية الفوترة الجديدة لدى {{client}} بعد 6 أيام. وصلتك صباح اليوم رسالة خاصة من {{report1}}، أكثر أعضاء فريقك خبرة، تفيد بأن في الخاصية خللًا في التوقيت يصيب نحو عملية واحدة من كل 2,000 عملية، وأن الإصلاح الكامل يحتاج إلى 8 أيام عمل. وقد وعد فريق المبيعات {{client}} بموعد الإطلاق، وهذا العميل وحده يدرّ 30% من إيرادات {{company}}. أما {{manager}} ففي إجازة حتى ما بعد الإطلاق، والقرار بيدك. تجد رسالة {{report1}} وتوقعات حجم العمليات لدى {{client}} ضمن المواد.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "رسالة من {{report1}}",
            from: { name: "{{report1}}", role: "{{report1.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "خلل الفوترة: ما توصلت إليه",
            sentAt: "اليوم، 08:12",
            body:
              "أعدتُ إنتاج الخلل 11 مرة في 22,000 عملية تجريبية، أي بمعدل عملية واحدة تقريبًا من كل 2,000. ويحدث الخلل حين يصل طلبان للحساب نفسه في جزء من الثانية.\n\nأستطيع إعداد إصلاح جزئي خلال يومين يسدّ المسار الأكثر شيوعًا، وأقدّر أنه يعالج نحو 70% من الحالات. أما الإصلاح الكامل فيحتاج إلى 8 أيام، معظمها للاختبار.\n\nلا أرى أن نطلق الخاصية كما هو مخطط، لكن القرار لك.",
            footnote: "العمليات المتأثرة لا تضيع، بل يُخصم المبلغ من العميل مرتين، فيرى خصمين متطابقين إلى أن يُلغى أحدهما يدويًا.",
          },
          {
            kind: "table",
            id: "m2",
            title: "توقعات حجم العمليات عند الإطلاق لدى {{client}}",
            caption: "توقعات أعدّها فريق العمليات لدى {{client}}.",
            columns: [
              { key: "period", label: "الفترة" },
              { key: "transactions", label: "العمليات يوميًا", numeric: true },
            ],
            rows: [
              { period: "اليوم 1 (عرض الإطلاق)", transactions: 48000 },
              { period: "اليوم 2", transactions: 31000 },
              { period: "اليوم 3", transactions: 26000 },
              { period: "الأيام 4–7 (المتوسط)", transactions: 22000 },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "الإطلاق في الموعد مع مراقبة دقيقة وفحص يدوي يومي يُلغي الخصومات المكررة، ثم إصدار الإصلاح الكامل لاحقًا." },
            { id: "b", label: "تأجيل الإطلاق يومين، وإصدار الإصلاح الجزئي، وإطلاع {{client}} على المخاطر المتبقية." },
            { id: "c", label: "الإطلاق في الموعد دون خاصية الفوترة الجديدة، على أن تستمر طريقة الفوترة القديمة لدى {{client}} حتى يجهز الإصلاح الكامل." },
            { id: "d", label: "عرض الخلل والخيارات المتاحة على {{client}} اليوم، وترك القرار للعميل." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "يصلك اعتراض شديد من {{report1}} على اختيارك، مع نيّة معلنة لرفع الأمر إلى {{exec}}. اكتب ردك على {{report1}}.",
        },
        twist: {
          change: "في اليوم الثالث تعلم أن نشاط {{client}} يقع في قطاع خاضع للرقابة، ويلزم فيه إبلاغ الجهة الرقابية بكل خصم مكرر خلال 24 ساعة.",
          prompt: "هل تتغير خطتك؟ ماذا تفعل الآن، ومن تُبلغ؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "judgment.risk-calibration",
            anchors: [
              "Ignores the duplicate-charge risk, or treats it as a reason to cancel everything, without weighing how likely or harmful it is.",
              "Calls the defect risky but does not separate how often it happens from how much harm each case causes.",
              "Weighs frequency against harm (customers charged twice, manual reversal) and proposes proportionate safeguards such as a daily duplicate check.",
              "Notes the harm is reversible but visible to customers, sets caution accordingly, and names warning signs with a trigger to pause.",
              "Compares the risk of delay with the risk of launching, flags severe low-probability outcomes at a 30% client, and states confidence in the 1-in-2,000 estimate.",
            ],
          },
          {
            competencyKey: "critical-thinking.quantitative-reasoning",
            anchors: [
              "Ignores the volume forecast, or calls 1 in 2,000 negligible without converting it into affected customers.",
              "Repeats the 1-in-2,000 rate without applying it to the forecast volumes.",
              "Converts the rate into expected cases (about 24 on day 1, roughly 100 in week 1) and uses that in the choice.",
              "Compares options numerically (the partial fix still leaves about 30 cases in week 1) and notes the rate rests on 22,000 test transactions.",
              "Identifies what the outcome is most sensitive to (day-1 promotion volume, the true rate), checks plausibility, and states an uncertainty range.",
            ],
          },
          {
            competencyKey: "leadership.ownership",
            anchors: [
              "Defers the decision to {{manager}}, sales or {{client}} without owning a recommendation, or blames sales for the promise.",
              "Takes the decision but leaves duplicate reversals, client communication or the full fix without a named owner.",
              "Owns the decision openly and commits to specific actions: who reverses duplicates, who tells {{client}}, when the fix ships.",
              "Takes responsibility for telling {{client}} even though sales made the promise, keeps sales informed, and treats {{report1}}'s challenge as legitimate.",
              "Owns the outcome beyond launch: proposes how such defects get caught earlier, credits {{report1}} for raising it, and accepts accountability personally.",
            ],
          },
          {
            competencyKey: "adaptability.handling-new-information",
            anchors: [
              "Keeps the original plan unchanged after learning each duplicate must be reported within 24 hours.",
              "Acknowledges the reporting duty but makes a token change, or drops the whole launch without asking which parts still work.",
              "Re-evaluates the chosen option given the reporting duty and updates the affected parts: monitoring, reporting route, client communication.",
              "Checks exactly what must be reported and by whom before acting, and explains what changed in their reasoning.",
              "Updates in proportion: notes every duplicate now triggers a report, reconsiders even the partial fix, and spots effects on {{client}}'s standing with the regulator.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Converts the defect rate into expected affected customers using the forecast volumes.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["24", "48,000", "first week", "per day", "expected", "about 100", "الأسبوع الأول", "يوميًا", "متوقع", "عدد العملاء", "24 عميلًا"],
          },
          {
            text: "Notices that affected customers are charged twice, a visible harm needing manual reversal.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["charged twice", "double charge", "duplicate", "reverse", "refund", "مرتين", "خصم مكرر", "مكرر", "استرداد", "إلغاء الخصم"],
          },
          {
            text: "Sets a threshold or trigger at which the launch is paused or rolled back.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["threshold", "trigger", "pause", "roll back", "stop if", "حد", "إيقاف", "تراجع", "نوقف إذا"],
          },
          {
            text: "Owns the call and the communication to {{client}} and the team, crediting {{report1}}.",
            competencyKey: "leadership.ownership",
            keywords: ["my decision", "i take responsibility", "i will tell", "thank you for raising", "قراري", "مسؤوليتي", "سأبلغ", "شكرًا على"],
          },
        ],
        redFlags: [
          {
            text: "Dismisses 1 in 2,000 as negligible without converting it into customers.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["negligible", "tiny", "rare", "no big deal", "ignore", "ضئيل", "نادر", "لا يُذكر", "تجاهل"],
          },
          {
            text: "Blames sales or waits for {{manager}} rather than owning the decision.",
            competencyKey: "leadership.ownership",
            keywords: ["sales promised", "not my decision", "wait for", "when my manager returns", "ليس قراري", "وعد المبيعات", "ننتظر", "عودة المدير"],
          },
          {
            text: "Plans to keep the defect from {{client}}.",
            competencyKey: "leadership.ownership",
            keywords: ["don't tell", "keep quiet", "no need to inform", "quietly", "لا داعي لإبلاغ", "إخفاء", "دون إبلاغ", "بهدوء"],
          },
        ],
        embeddedDetail: {
          description:
            "{{report1}}'s footnote says affected transactions are charged twice (not lost), so each case is a customer-visible harm needing manual reversal. The Day 1 promotion volume (48,000) means about 24 duplicates on the first day alone.",
          location: "footnote of {{report1}}'s email; Day 1 row of the forecast table",
          keywords: ["charged twice", "double", "duplicate", "two identical charges", "48,000", "مرتين", "مكرر", "خصمين", "48,000"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Keeps the promise to a 30%-of-revenue client; duplicates are detectable and reversible, and a daily check caps the harm.",
            cost: "Roughly 100 customers double-charged in week 1 (about 24 on day 1); reputational harm to {{client}}; manual load on the team; the check may miss cases.",
          },
          {
            optionId: "b",
            defensibleBecause: "Cuts expected duplicates by about 70% for a short delay, and transparency protects trust.",
            cost: "Breaks the date sales promised and may miss {{client}}'s launch promotion; about 30 duplicates still expected in week 1.",
          },
          {
            optionId: "c",
            defensibleBecause: "No customer is double-charged and the rest of the launch keeps its date.",
            cost: "{{client}} may have planned its promotion around the feature; the old process may not cope with launch volumes; looks like partial delivery.",
          },
          {
            optionId: "d",
            defensibleBecause: "{{client}} bears the consequences and knows its customers best; respects their right to decide with full information.",
            cost: "Can look like passing responsibility; {{client}} may lack the basis to judge; invites contract pressure late in the cycle.",
          },
        ],
        probeTargets: ["leadership.ownership"],
        twistTargets: ["adaptability.handling-new-information"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-02-inflated-score",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 3, informationGaps: 3 },
    targets: ["judgment.ethical-judgment", "leadership.courage", "critical-thinking.evaluating-evidence"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "middle",
    content: {
      en: {
        title: "The inflated score",
        scenario:
          "Your team's quarterly bonus depends on its customer-satisfaction score reaching 80. This quarter's reported score is 84, and {{exec}} has praised the team for it. Yesterday {{specialist}} found a survey setting error: customers who left the support chat before it ended were never sent the survey, and those customers usually score lower. {{specialist}}'s first estimate puts the true score somewhere between 75 and 82. Bonuses are paid in 5 days; an exact recalculation takes about 2 weeks. Your team worked long hours this quarter and does not yet know about the error. The estimate and the weekly data are in the materials.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "Email from {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Survey setting: first estimate",
            sentAt: "Yesterday, 17:40",
            body:
              "The survey was not sent to customers who closed the chat early. In past quarters those customers gave an average score of about 62 and made up 15–25% of responses.\n\nIf I add them back across the quarter, the score lands between 75 and 82, depending on how many there were. I can only get the exact count by rebuilding the logs, which takes about 2 weeks.",
            footnote:
              "I checked the change history: the setting was switched on in week 7, when the survey tool was updated. Weeks 1–6 were collected normally.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Weekly satisfaction score",
            columns: [
              { key: "week", label: "Week" },
              { key: "responses", label: "Responses", numeric: true },
              { key: "score", label: "Score", numeric: true },
            ],
            rows: [
              { week: "1", responses: 402, score: 81 },
              { week: "2", responses: 395, score: 82 },
              { week: "3", responses: 410, score: 80 },
              { week: "4", responses: 398, score: 83 },
              { week: "5", responses: 401, score: 81 },
              { week: "6", responses: 394, score: 82 },
              { week: "7", responses: 331, score: 86 },
              { week: "8", responses: 328, score: 87 },
              { week: "9", responses: 335, score: 86 },
              { week: "10", responses: 326, score: 88 },
              { week: "11", responses: 330, score: 86 },
              { week: "12", responses: 333, score: 87 },
              { week: "13", responses: 327, score: 86 },
              { week: "Quarter", responses: 4710, score: 84 },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            { id: "a", label: "Tell {{exec}} and the team now that the score is in doubt, and ask for bonuses to be held until the recalculation is done." },
            {
              id: "b",
              label: "Let bonuses go out as planned, fix the setting today, and report the error with the exact figure once the 2-week recalculation is finished.",
            },
            {
              id: "c",
              label: "Tell {{exec}} now, share the 75–82 range, and propose paying bonuses on condition they are recovered if the corrected score falls below 80.",
            },
            { id: "d", label: "Spend the next 3 days with {{specialist}} on a faster partial check, then decide what to report before bonuses are paid." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "This afternoon {{exec}} calls you to congratulate the team again on the score. Write the first few sentences of what you say.",
        },
        twist: {
          change: "{{specialist}} finishes a quick check: the true score is between 79 and 81.",
          prompt: "What do you do now, and what do you tell your team?",
        },
      },
      ar: {
        title: "النتيجة المتضخمة",
        scenario:
          "ترتبط المكافأة الربعية لفريقك ببلوغ مؤشر رضا العملاء 80 نقطة. وقد بلغت النتيجة المعلنة لهذا الربع 84، ونال الفريق عليها إشادة من {{exec}}. وأمس كشف فحصٌ أجراه {{specialist}} عن خطأ في إعدادات الاستبيان: فالعملاء الذين غادروا محادثة الدعم قبل انتهائها لم يُرسَل إليهم الاستبيان أصلًا، وهؤلاء يمنحون عادةً تقييمات أدنى. ويضع التقدير الأولي النتيجةَ الحقيقية بين 75 و82. تُصرف المكافآت بعد 5 أيام، أما إعادة الحساب الدقيقة فتستغرق نحو أسبوعين. وقد عمل فريقك ساعات طويلة هذا الربع، ولا يعلم بالخطأ بعد. تجد التقدير والبيانات الأسبوعية ضمن المواد.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "رسالة من {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "إعدادات الاستبيان: تقدير أولي",
            sentAt: "أمس، 17:40",
            body:
              "لم يُرسَل الاستبيان إلى العملاء الذين أغلقوا المحادثة مبكرًا. وفي الأرباع السابقة كان متوسط تقييم هؤلاء نحو 62، وكانوا يمثلون 15–25% من الردود.\n\nإذا أضفتهم على امتداد الربع كله، تقع النتيجة بين 75 و82 بحسب عددهم. ولا سبيل إلى معرفة العدد الدقيق إلا بإعادة بناء السجلات، وهذا يستغرق نحو أسبوعين.",
            footnote: "راجعتُ سجل التغييرات: فُعِّل هذا الإعداد في الأسبوع 7 عند تحديث أداة الاستبيان. أما الأسابيع 1–6 فجُمعت بياناتها على النحو المعتاد.",
          },
          {
            kind: "table",
            id: "m2",
            title: "مؤشر الرضا الأسبوعي",
            columns: [
              { key: "week", label: "الأسبوع" },
              { key: "responses", label: "عدد الردود", numeric: true },
              { key: "score", label: "النتيجة", numeric: true },
            ],
            rows: [
              { week: "1", responses: 402, score: 81 },
              { week: "2", responses: 395, score: 82 },
              { week: "3", responses: 410, score: 80 },
              { week: "4", responses: 398, score: 83 },
              { week: "5", responses: 401, score: 81 },
              { week: "6", responses: 394, score: 82 },
              { week: "7", responses: 331, score: 86 },
              { week: "8", responses: 328, score: 87 },
              { week: "9", responses: 335, score: 86 },
              { week: "10", responses: 326, score: 88 },
              { week: "11", responses: 330, score: 86 },
              { week: "12", responses: 333, score: 87 },
              { week: "13", responses: 327, score: 86 },
              { week: "الربع كاملًا", responses: 4710, score: 84 },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "إبلاغ {{exec}} والفريق الآن بأن النتيجة موضع شك، وطلب تعليق المكافآت حتى تكتمل إعادة الحساب." },
            { id: "b", label: "صرف المكافآت كما هو مقرر، وتصحيح الإعداد اليوم، ثم الإبلاغ عن الخطأ بالرقم الدقيق بعد انتهاء إعادة الحساب خلال أسبوعين." },
            { id: "c", label: "إبلاغ {{exec}} الآن وعرض النطاق 75–82، واقتراح صرف المكافآت بشرط استردادها إذا جاءت النتيجة المصحَّحة دون 80." },
            { id: "d", label: "قضاء الأيام الثلاثة القادمة مع {{specialist}} في فحص جزئي أسرع، ثم تقرير ما يُبلَّغ عنه قبل صرف المكافآت." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "بعد ظهر اليوم يصلك اتصال من {{exec}} لتهنئة الفريق مجددًا على النتيجة. اكتب الجمل الأولى مما ستقوله.",
        },
        twist: {
          change: "تصل نتيجة فحص سريع أجراه {{specialist}}: النتيجة الحقيقية تقع بين 79 و81.",
          prompt: "ماذا تفعل الآن، وماذا تقول لفريقك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "judgment.ethical-judgment",
            anchors: [
              "Does not treat the inflated score as an integrity issue, or proposes staying quiet so the bonus is paid.",
              "Says the error must be reported because rules require it, without considering the team, {{exec}} or anyone relying on the figure.",
              "Names the integrity issue, weighs fairness to the team against {{exec}}'s reliance on the figure, and chooses an honest course.",
              "Holds to disclosure despite bonus pressure, and proposes a practical way to protect the team's legitimate interest, such as conditional payment.",
              "Spots the precedent (paying on known-wrong numbers, or punishing teams for tool errors) and downstream uses of the score, and addresses both early.",
            ],
          },
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Avoids telling {{exec}} or the team, or waits for someone else to discover the error.",
              "Plans to mention the error only after bonuses are paid, or in vague terms that hide its size.",
              "Tells {{exec}} clearly and promptly that the score is in doubt, with the range and what is being done.",
              "Keeps the position when {{exec}} or the team pushes back, while staying open to {{specialist}}'s new evidence.",
              "Raises the point directly even while {{exec}} is praising the team, pairs it with a clear proposal, and accepts the cost of reversing good news.",
            ],
          },
          {
            competencyKey: "critical-thinking.evaluating-evidence",
            anchors: [
              "Takes the 75–82 range at face value, or treats the reported 84 as accurate.",
              "Doubts the estimate without a clear basis, or treats the range and the reported score as equally reliable.",
              "Notes what the range rests on (share and score of the missed customers) and checks it against the weekly data.",
              "Uses the week-7 change and the fall in weekly responses (about 400 to 330) to narrow the estimate, and says what would settle it.",
              "Sees the range assumes the whole quarter was affected, re-estimates for weeks 7–13 only (about 81–82), and states confidence accordingly.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices only weeks 7–13 were affected, so the specialist's range is too pessimistic.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["week 7", "weeks 1-6", "weeks 1–6", "half the quarter", "only affected", "الأسبوع 7", "الأسابيع 1", "نصف الربع", "فقط"],
          },
          {
            text: "Uses the drop in weekly responses to estimate how many customers were missed.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["responses dropped", "400", "330", "fewer responses", "70 a week", "انخفض عدد الردود", "عدد الردود", "330", "400"],
          },
          {
            text: "Tells {{exec}} promptly, with the range, before bonuses are paid.",
            competencyKey: "leadership.courage",
            keywords: ["tell", "today", "before bonuses", "transparent", "inform", "أبلغ", "اليوم", "قبل صرف", "شفافية", "بصراحة"],
          },
          {
            text: "Protects the team fairly: the error is the tool's, not the team's, and effort is recognised.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["not the team's fault", "conditional", "recognise", "effort", "fair", "ليس خطأ الفريق", "مشروط", "الجهد", "عادل", "إنصاف"],
          },
        ],
        redFlags: [
          {
            text: "Pays the bonus and keeps the error quiet.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["no one will notice", "keep it quiet", "after the bonus", "don't mention", "لن يلاحظ", "بعد صرف المكافآت", "لا داعي لذكر", "نتكتم"],
          },
          {
            text: "Treats {{specialist}}'s range as certain proof the target was missed.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["definitely below", "true score is 75", "clearly missed", "بالتأكيد أقل", "النتيجة 75", "لم نحقق الهدف قطعًا"],
          },
          {
            text: "Drops the concern when {{exec}} is pleased.",
            competencyKey: "leadership.courage",
            keywords: ["thank you", "not the right time", "spoil", "ليس الوقت المناسب", "لا أريد إفساد"],
          },
        ],
        embeddedDetail: {
          description:
            "{{specialist}}'s footnote says the setting was switched on in week 7; weeks 1–6 were normal. The 75–82 range assumes the whole quarter was affected. The table shows responses falling from about 400 to about 330 from week 7; correcting only weeks 7–13 puts the score near 81–82, likely still above 80.",
          location: "footnote of {{specialist}}'s email; weeks 7–13 rows of the weekly table",
          keywords: ["week 7", "weeks 1-6", "weeks 1–6", "responses fell", "330", "الأسبوع 7", "الأسابيع 1", "انخفاض الردود"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Fully transparent; no risk of paying a bonus that was not earned.",
            cost: "Team loses or waits for a bonus over a tool error it did not cause; may be an overreaction if the true score is above 80; {{exec}}'s praise is reversed publicly.",
          },
          {
            optionId: "b",
            defensibleBecause: "The estimate is uncertain and may still clear 80; reporting an exact figure avoids alarming people with a guess.",
            cost: "Bonuses paid on a number known to be doubtful; if the true score is below 80 it looks like concealment; {{exec}} keeps using an inflated figure for 2 weeks.",
          },
          {
            optionId: "c",
            defensibleBecause: "Honest and timely while not punishing the team for an uncertain gap.",
            cost: "Recovering bonuses later is painful and may be impractical; sets a precedent of paying on disputed numbers.",
          },
          {
            optionId: "d",
            defensibleBecause: "Better evidence before a consequential disclosure, still before the payout.",
            cost: "Delays disclosure while {{exec}} keeps praising the figure; the check may be inconclusive; can look like buying time to shape the message.",
          },
        ],
        probeTargets: ["leadership.courage"],
        twistTargets: ["judgment.ethical-judgment"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-03-who-leads-pilot",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 3, stakes: 2, timePressure: 2, informationGaps: 2 },
    targets: ["management.delegation", "judgment.second-order-thinking"],
    roleFamilies: [],
    minutes: 4,
    storyPhase: "early",
    content: {
      en: {
        title: "Who leads the pilot",
        scenario:
          "A three-month pilot with {{client}} starts in two weeks, and someone on your team must lead it day to day. {{report1}} is the obvious choice: experienced and trusted by {{client}}, but already carrying two projects and working evenings. {{report2}} has asked twice for a chance to lead something; their work this year has been uneven, careful on analysis but slow on deadlines. You could lead the pilot yourself, but that would delay the team plan {{manager}} asked you to deliver this quarter. The team's workload and {{client}}'s pilot outline are in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Team workload this quarter",
            columns: [
              { key: "person", label: "Person" },
              { key: "projects", label: "Current projects" },
              { key: "hours", label: "Hours per week committed", numeric: true },
              { key: "notes", label: "Notes" },
            ],
            rows: [
              { person: "{{report1}}", projects: "2 (both client-facing)", hours: 46, notes: "Has asked to drop one project by month end" },
              { person: "{{report2}}", projects: "1", hours: 32, notes: "Missed 2 of 6 deadlines this year; strong analysis reviews" },
              { person: "{{you}}", projects: "Team plan + 1", hours: 44, notes: "Team plan due to {{manager}} in 10 weeks" },
              { person: "New hire", projects: "None yet", hours: 0, notes: "Starts in 3 weeks; needs onboarding" },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "Pilot outline",
            author: { name: "{{client}}", role: "{{client.role}}" },
            body:
              "Weeks 1–4: set-up. Agree data sources, access and reporting format; weekly calls with our team.\n\nWeeks 5–12: steady running. The core work is a weekly data review and a short written summary for our managers. Meetings every two weeks.\n\nWe would like one named lead on your side throughout.",
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose who leads the pilot, and briefly explain why.",
          options: [
            { id: "a", label: "Give the pilot to {{report1}} and move one of their current projects to someone else." },
            { id: "b", label: "Give the pilot to {{report2}}, with weekly check-ins with you and {{report1}} as an adviser for the first month." },
            { id: "c", label: "Lead the pilot yourself and ask {{manager}} to move the team-plan deadline by a month." },
            { id: "d", label: "Have {{report1}} lead the four-week set-up, then hand over to {{report2}} for the remaining eight weeks." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "Whatever you chose, write the message you send to {{report2}} about the decision.",
        },
        twist: {
          change: "A week later, {{report1}} tells you they have accepted an internal transfer and will leave the team in six weeks.",
          prompt: "How does this change your plan for the pilot and for the team?",
        },
      },
      ar: {
        title: "من يقود التجربة؟",
        scenario:
          "تبدأ بعد أسبوعين تجربة مع {{client}} مدتها ثلاثة أشهر، ولا بد أن يتولى أحد أعضاء فريقك قيادتها يومًا بيوم. يبدو {{report1}} الخيار البديهي: خبرة واسعة وثقة لدى {{client}}، لكن مع مشروعين قائمين وعمل يمتد إلى المساء. وقد صدر عن {{report2}} طلبان لفرصة قيادة عمل ما، وجاء الأداء هذا العام متفاوتًا: دقة في التحليل وبطء في الالتزام بالمواعيد. ويمكنك أن تقود التجربة بنفسك، لكن ذلك سيؤخر خطة الفريق التي طلبها {{manager}} هذا الربع. تجد عبء العمل في الفريق ومخطط التجربة الذي أرسله {{client}} ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "عبء العمل في الفريق هذا الربع",
            columns: [
              { key: "person", label: "الشخص" },
              { key: "projects", label: "المشاريع الحالية" },
              { key: "hours", label: "الساعات الملتزم بها أسبوعيًا", numeric: true },
              { key: "notes", label: "ملاحظات" },
            ],
            rows: [
              { person: "{{report1}}", projects: "2 (كلاهما مع عملاء)", hours: 46, notes: "طلبٌ مقدَّم للتخلي عن أحد المشروعين بحلول نهاية الشهر" },
              { person: "{{report2}}", projects: "1", hours: 32, notes: "موعدان فائتان من أصل 6 هذا العام؛ مراجعات تحليلية قوية" },
              { person: "{{you}}", projects: "خطة الفريق + مشروع", hours: 44, notes: "خطة الفريق مستحقة لـ{{manager}} بعد 10 أسابيع" },
              { person: "موظف جديد", projects: "لا يوجد بعد", hours: 0, notes: "يبدأ بعد 3 أسابيع؛ يحتاج إلى تهيئة" },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "مخطط التجربة",
            author: { name: "{{client}}", role: "{{client.role}}" },
            body:
              "الأسابيع 1–4: الإعداد. الاتفاق على مصادر البيانات وصلاحيات الوصول وشكل التقارير، مع اتصالات أسبوعية مع فريقنا.\n\nالأسابيع 5–12: التشغيل المنتظم. يتمثل العمل الأساسي في مراجعة أسبوعية للبيانات وملخص مكتوب قصير لمديرينا، مع اجتماع كل أسبوعين.\n\nنرغب في وجود قائد واحد مسمّى من جانبكم طوال المدة.",
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر من يقود التجربة، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "إسناد التجربة إلى {{report1}}، ونقل أحد المشروعين الحاليين لـ{{report1}} إلى شخص آخر." },
            { id: "b", label: "إسناد التجربة إلى {{report2}}، مع لقاءات متابعة أسبوعية معك، وأن يكون {{report1}} مستشارًا في الشهر الأول." },
            { id: "c", label: "قيادة التجربة بنفسك، وطلب تأجيل موعد خطة الفريق شهرًا من {{manager}}." },
            { id: "d", label: "قيادة {{report1}} لمرحلة الإعداد ذات الأسابيع الأربعة، ثم تسليم القيادة إلى {{report2}} في الأسابيع الثمانية الباقية." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "أيًّا كان اختيارك، اكتب الرسالة التي ترسلها إلى {{report2}} بشأن القرار.",
        },
        twist: {
          change: "بعد أسبوع تصلك من {{report1}} رسالة تفيد بقبول انتقال داخلي ومغادرة الفريق بعد ستة أسابيع.",
          prompt: "كيف يغيّر ذلك خطتك للتجربة وللفريق؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.delegation",
            anchors: [
              "Keeps the pilot by default, or assigns it without regard to {{report1}}'s load or {{report2}}'s record.",
              "Picks a suitable lead but leaves the expected outcome, decision rights or check-ins unclear.",
              "Matches the pilot to skills and capacity, and states the outcome, deadlines and what the lead may decide alone.",
              "Sets check-ins proportionate to {{report2}}'s deadline record or the risk, and plans support without taking the pilot back.",
              "Uses the pilot to build {{report2}}'s capability and reduce reliance on {{report1}}, with explicit safeguards on the deadline-sensitive set-up.",
            ],
          },
          {
            competencyKey: "judgment.second-order-thinking",
            anchors: [
              "Considers only who can deliver the pilot, ignoring effects on workload, development or the team plan.",
              "Says the choice may affect the team later but does not say how.",
              "Identifies follow-on effects ({{report1}}'s overload, {{report2}}'s motivation, the team plan's delay) and factors them in.",
              "Traces how {{report1}}, {{report2}} and {{client}} are likely to react over three months and how that shapes the pilot.",
              "Spots a less obvious effect, such as signalling that only {{report1}} gets important work, and adjusts the decision to avoid it.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices {{report1}} has already asked to drop a project and is at 46 hours.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["asked to drop", "overloaded", "burnout", "46 hours", "already stretched", "طلب التخلي", "عبء", "إرهاق", "46 ساعة", "مثقل"],
          },
          {
            text: "Sets clear expectations: outcome, deadlines, decision rights and check-ins.",
            competencyKey: "management.delegation",
            keywords: ["check-in", "weekly", "decision rights", "deadline", "success looks like", "متابعة أسبوعية", "صلاحيات", "موعد", "النتيجة المتوقعة"],
          },
          {
            text: "Matches pilot phases to strengths, noting weeks 5–12 are analysis-heavy.",
            competencyKey: "management.delegation",
            keywords: ["data review", "analysis", "set-up", "weeks 5", "strength", "مراجعة البيانات", "تحليل", "الإعداد", "الأسابيع 5", "نقاط القوة"],
          },
          {
            text: "Considers the risk of depending on one person.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["depend on", "single point", "spread knowledge", "backup", "الاعتماد على", "شخص واحد", "نقل المعرفة", "بديل"],
          },
        ],
        redFlags: [
          {
            text: "Writes {{report2}} off as unreliable.",
            competencyKey: "management.delegation",
            keywords: ["not ready", "can't be trusted", "unreliable", "غير جاهز", "لا يمكن الاعتماد", "غير موثوق"],
          },
          {
            text: "Takes the work on personally because it is easier.",
            competencyKey: "management.delegation",
            keywords: ["do it myself", "easier to do it", "faster if i", "سأتولاه بنفسي", "أسهل أن", "أسرع لو"],
          },
          {
            text: "Adds load to {{report1}} without addressing it.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["can handle it", "just add", "used to it", "يستطيع التحمل", "إضافة مشروع", "معتاد"],
          },
        ],
        embeddedDetail: {
          description:
            "The notes column shows {{report1}} has already asked to drop one project by month end, so giving them the pilot ignores that request. The pilot outline shows weeks 5–12 are mostly weekly data review, which fits {{report2}}'s analysis strength.",
          location: "{{report1}}'s notes cell in the workload table; weeks 5–12 in {{client}}'s pilot outline",
          keywords: ["asked to drop", "drop one project", "data review", "weeks 5", "طلب التخلي", "مراجعة البيانات", "الأسابيع 5"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Lowest delivery risk, and {{client}} already trusts {{report1}}.",
            cost: "Ignores {{report1}}'s request to reduce load; moving a project disrupts another client; {{report2}} gets no development; deepens reliance on one person.",
          },
          {
            optionId: "b",
            defensibleBecause: "Develops {{report2}}, whose analysis strength fits the core weekly work, and frees {{report1}}.",
            cost: "Deadline risk on a client-facing pilot; {{client}} may question the choice; your check-in time; {{report1}} still carries adviser load.",
          },
          {
            optionId: "c",
            defensibleBecause: "You control quality and the client relationship directly.",
            cost: "Delays the plan {{manager}} asked for; neither team member develops; you become the bottleneck.",
          },
          {
            optionId: "d",
            defensibleBecause: "Uses {{report1}}'s client trust where risk is highest and {{report2}}'s analysis strength later.",
            cost: "Mid-pilot handover risks continuity and conflicts with {{client}}'s wish for one lead; {{report1}} overloaded for another month; {{report2}} may feel second choice.",
          },
        ],
        probeTargets: ["management.delegation"],
        twistTargets: ["judgment.second-order-thinking"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-04-renewal-deadline",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 4, informationGaps: 2 },
    targets: ["judgment.knowing-when-to-escalate", "management.resource-allocation", "adaptability.composure-under-pressure"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "middle",
    content: {
      en: {
        title: "The 17:00 renewal",
        scenario:
          "It is 13:30. The supplier of your team's main software tool says the current price holds only if the renewal is signed by 17:00 today. Renewing all 60 licences costs 54,000 a year; from tomorrow the same renewal costs 60,480. You may approve spending up to 50,000 on your own. {{manager}}, who can approve more, is on a 14-hour flight with no connection. {{exec}}, {{manager}}'s manager, is available but has not been involved and tends to question spending. {{peer}} has just messaged you about their own team's plans. The supplier's offer, {{peer}}'s message and the licence usage report are in the materials.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "Renewal offer",
            from: { name: "Account team", role: "Software supplier" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Your renewal: price held until 17:00 today",
            sentAt: "Today, 11:05",
            body:
              "Thank you for working with us. Your renewal: 60 licences at 900 each, 54,000 per year. This price holds if signed by 17:00 today.\n\nFrom tomorrow, the list price of 1,008 per licence applies (60,480 for 60 licences).\n\nYou may change the number of licences at renewal. Licences added during the year are charged at list price.",
          },
          {
            kind: "email",
            id: "m2",
            title: "Message from {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Licences for our new starters?",
            sentAt: "Today, 13:12",
            body: "Heads-up: we are hiring 8 people next quarter and they will need the tool. Could they use licences from your contract, as my team does now?",
          },
          {
            kind: "table",
            id: "m3",
            title: "Licence usage, last 6 months",
            columns: [
              { key: "group", label: "Group" },
              { key: "licences", label: "Licences", numeric: true },
              { key: "active", label: "Active users (monthly average)", numeric: true },
              { key: "notes", label: "Notes" },
            ],
            rows: [
              { group: "Your team", licences: 38, active: 37, notes: "" },
              { group: "Shared with {{peer}}'s team", licences: 10, active: 9, notes: "" },
              { group: "Former project team", licences: 12, active: 0, notes: "Project closed 5 months ago; no log-ins since" },
              { group: "Total", licences: 60, active: 46, notes: "" },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            { id: "a", label: "Sign today for fewer licences so the total stays within your 50,000 limit, and sort out any extra licences later." },
            { id: "b", label: "Sign the full 60-licence renewal at 54,000 now, and explain to {{manager}} when they land." },
            { id: "c", label: "Ask the supplier for a 48-hour extension so {{manager}} can decide, accepting that they may refuse." },
            { id: "d", label: "Call {{exec}} now, explain the situation briefly, and ask for approval of the full renewal." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "What do you do in the next 30 minutes, in order?",
        },
        twist: {
          change: "At 15:45 {{manager}}'s flight is delayed on the ground, and {{manager}} can take a 5-minute call.",
          prompt: "What do you say in those 5 minutes?",
        },
      },
      ar: {
        title: "تجديد الساعة 17:00",
        scenario:
          "الساعة الآن 13:30. يفيد مورّد الأداة البرمجية الرئيسية لفريقك بأن السعر الحالي لا يسري إلا إذا وُقّع التجديد قبل الساعة 17:00 اليوم. تجديد التراخيص الستين كلها يكلّف 54,000 سنويًا، ومن الغد يرتفع التجديد نفسه إلى 60,480. ويحق لك اعتماد إنفاق يصل إلى 50,000 وحدك. أما {{manager}}، صاحب صلاحية اعتماد مبالغ أكبر، فعلى متن رحلة جوية مدتها 14 ساعة دون اتصال. و{{exec}}، مدير {{manager}}، متاح، لكن لم يسبق إشراك {{exec}} في الموضوع، والمعروف عن {{exec}} ميلٌ إلى التشكيك في النفقات. وقد وصلتك للتو رسالة من {{peer}} عن خطط فريقه. تجد عرض المورّد ورسالة {{peer}} وتقرير استخدام التراخيص ضمن المواد.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "عرض التجديد",
            from: { name: "فريق الحسابات", role: "مورّد البرمجيات" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "تجديدكم: السعر ثابت حتى الساعة 17:00 اليوم",
            sentAt: "اليوم، 11:05",
            body:
              "شكرًا لتعاملكم معنا. تفاصيل التجديد: 60 ترخيصًا بسعر 900 للترخيص الواحد، أي 54,000 سنويًا. ويسري هذا السعر إذا وُقّع العقد قبل الساعة 17:00 اليوم.\n\nومن الغد يُطبَّق سعر القائمة البالغ 1,008 للترخيص (60,480 لستين ترخيصًا).\n\nيمكنكم تعديل عدد التراخيص عند التجديد، أما التراخيص المضافة خلال العام فتُحتسب بسعر القائمة.",
          },
          {
            kind: "email",
            id: "m2",
            title: "رسالة من {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "تراخيص لموظفينا الجدد؟",
            sentAt: "اليوم، 13:12",
            body: "للعلم: سنعيّن 8 موظفين في الربع القادم وسيحتاجون إلى الأداة. هل يمكنهم استخدام تراخيص من عقدكم، كما يفعل فريقي حاليًا؟",
          },
          {
            kind: "table",
            id: "m3",
            title: "استخدام التراخيص خلال الأشهر الستة الماضية",
            columns: [
              { key: "group", label: "المجموعة" },
              { key: "licences", label: "التراخيص", numeric: true },
              { key: "active", label: "المستخدمون النشطون (متوسط شهري)", numeric: true },
              { key: "notes", label: "ملاحظات" },
            ],
            rows: [
              { group: "فريقك", licences: 38, active: 37, notes: "" },
              { group: "مشتركة مع فريق {{peer}}", licences: 10, active: 9, notes: "" },
              { group: "فريق المشروع السابق", licences: 12, active: 0, notes: "أُغلق المشروع قبل 5 أشهر؛ لا تسجيل دخول منذ ذلك الحين" },
              { group: "الإجمالي", licences: 60, active: 46, notes: "" },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "التوقيع اليوم على عدد أقل من التراخيص بحيث يبقى الإجمالي ضمن حدّك البالغ 50,000، ومعالجة أي تراخيص إضافية لاحقًا." },
            { id: "b", label: "توقيع التجديد الكامل للتراخيص الستين بمبلغ 54,000 الآن، وشرح الأمر لـ{{manager}} بعد هبوط الطائرة." },
            { id: "c", label: "طلب مهلة 48 ساعة من المورّد ليتخذ {{manager}} القرار، مع قبول احتمال الرفض." },
            { id: "d", label: "الاتصال بـ{{exec}} الآن، وشرح الموقف باختصار، وطلب اعتماد التجديد الكامل." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "ماذا تفعل في الدقائق الثلاثين القادمة، وبأي ترتيب؟",
        },
        twist: {
          change: "في الساعة 15:45 تتأخر رحلة {{manager}} على أرض المطار، ويتاح اتصال مع {{manager}} لمدة 5 دقائق.",
          prompt: "ماذا تقول في هذه الدقائق الخمس؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "judgment.knowing-when-to-escalate",
            anchors: [
              "Signs above the 50,000 limit as if it were routine, or escalates without knowing what decision they want.",
              "Plans to escalate but late (close to 17:00) or without stating the decision needed and the options.",
              "Recognises 54,000 exceeds their authority and takes it to the right person with facts and a proposed action.",
              "Acts within authority first (checks usage, asks the supplier about terms) while escalating a clear, specific request.",
              "Frames a crisp escalation with options and a recommendation, and avoids escalating at all where a within-limit option meets the goal.",
            ],
          },
          {
            competencyKey: "management.resource-allocation",
            anchors: [
              "Renews 60 licences by habit without looking at usage, or cuts licences without regard to need.",
              "Sees cost matters but focuses only on locking the price, not on how many licences are needed.",
              "Sizes the renewal to actual use (about 46–48 active users) and states what will be short as a result.",
              "Compares options numerically, e.g., 48 now plus 8 later at list price versus 60 now, and keeps a small reserve.",
              "Treats the 12 idle licences as capacity tied up in no work, redirects them (e.g., to {{peer}}'s starters), and prices in later additions.",
            ],
          },
          {
            competencyKey: "adaptability.composure-under-pressure",
            anchors: [
              "Under the deadline, signs or refuses impulsively, or does nothing until the price lapses.",
              "Acts quickly but loses a key detail, such as the authority limit or {{peer}}'s hiring plans.",
              "Sets a clear order of steps before 17:00 and handles the deadline without neglecting authority or usage.",
              "Separates what must happen before 17:00 from what can wait, deals calmly with the supplier and {{peer}}, and checks figures before signing.",
              "Gives others short, clear next steps, has a fallback if the supplier refuses, and plans the follow-up with {{manager}}.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices the 12 licences with no log-ins since the project closed.",
            competencyKey: "management.resource-allocation",
            keywords: ["12", "unused", "no log-ins", "idle", "former project", "48 licences", "غير مستخدمة", "12 ترخيصًا", "المشروع السابق", "48 ترخيصًا"],
          },
          {
            text: "Prices the alternatives, including adding licences later at list price.",
            competencyKey: "management.resource-allocation",
            keywords: ["43,200", "49,500", "list price", "1,008", "8,064", "add later", "سعر القائمة", "لاحقًا", "43,200", "49,500"],
          },
          {
            text: "Stays within authority or escalates with a specific recommendation.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["within my limit", "authority", "50,000", "approve", "recommend", "صلاحيتي", "ضمن حدود", "موافقة", "أوصي", "اعتماد"],
          },
          {
            text: "Checks {{peer}}'s needs before changing the licence count.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["check with", "8 people", "starters", "before signing", "hiring", "التنسيق مع", "8 موظفين", "قبل التوقيع", "التعيين"],
          },
        ],
        redFlags: [
          {
            text: "Signs over the limit as routine, planning to explain afterwards.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["just sign", "sort it out later", "ask forgiveness", "nobody will mind", "أوقّع وننتهي", "نسوّي الأمر لاحقًا", "لن يمانع أحد"],
          },
          {
            text: "Renews all 60 without looking at usage.",
            competencyKey: "management.resource-allocation",
            keywords: ["all 60", "same as last year", "renew everything", "الستين كلها", "كما في العام الماضي", "تجديد الكل"],
          },
          {
            text: "Lets the deadline pass without a decision.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["nothing i can do", "let it lapse", "wait until he lands", "لا أستطيع فعل شيء", "ندع المهلة تنتهي", "ننتظر وصوله"],
          },
        ],
        embeddedDetail: {
          description:
            "The usage table shows 12 licences belonging to a project that closed 5 months ago, with no log-ins since. Renewing about 48 licences (43,200) fits within the 50,000 authority; {{peer}}'s 8 starters could be added later at list price (8,064), still below the 60-licence renewal.",
          location: "'Former project team' row of the licence usage table",
          keywords: ["12", "former project", "no log-ins", "unused", "48", "غير مستخدمة", "المشروع السابق", "48"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Stays within authority; usage data supports fewer licences and saves money.",
            cost: "Licences for {{peer}}'s starters later cost list price; cutting without consulting {{peer}} strains the relationship; risk of under-counting need.",
          },
          {
            optionId: "b",
            defensibleBecause: "Locks the price and avoids a 6,480 rise; {{manager}} would probably agree.",
            cost: "Exceeds authority by 4,000; sets a precedent; pays for 12 idle licences; {{manager}} or {{exec}} may see it as overstepping.",
          },
          {
            optionId: "c",
            defensibleBecause: "Respects the authority limit; supplier deadlines are often negotiable.",
            cost: "May lose the price (6,480 more a year); depends on the supplier's goodwill; pushes the decision to the last minute again.",
          },
          {
            optionId: "d",
            defensibleBecause: "The right level of authority, reachable now.",
            cost: "{{exec}} lacks context and tends to question spending, so may refuse or delay; uses senior time; still pays for idle licences.",
          },
        ],
        probeTargets: ["adaptability.composure-under-pressure"],
        twistTargets: ["judgment.knowing-when-to-escalate"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-05-cannot-say-yet",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 4,
    dials: { ambiguity: 4, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 3, informationGaps: 4 },
    targets: ["leadership.setting-direction", "judgment.ethical-judgment", "adaptability.comfort-with-ambiguity"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "late",
    content: {
      en: {
        title: "What you cannot say yet",
        scenario:
          "{{exec}} told you in confidence that {{company}} will announce a merger in three weeks. Your team's function will be combined with the other company's, and roles may change; nothing has been decided about individuals. You agreed not to discuss it. Rumours are spreading. Today {{report1}} told you they have a job offer elsewhere and must answer by Friday. In this morning's team meeting, {{report2}} asked you, in front of everyone, whether 'something big' is happening. Meanwhile your team has a major delivery due in four weeks. {{exec}}'s briefing and the team's questions are in the materials.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "Confidential briefing",
            from: { name: "{{exec}}", role: "{{exec.role}}" },
            to: [{ name: "Managers' group" }],
            subject: "Confidential: managers' briefing",
            sentAt: "Monday, 09:00",
            body:
              "The merger will be announced in three weeks. Until then, please do not discuss it with your teams. If asked, say you cannot comment on rumours.\n\nDecisions about roles will be made after the announcement, through a fair selection process. You may tell your teams that this quarter's delivery plans stand.",
            footnote:
              "Exceptions: if keeping this confidential would cause serious harm to a team member, ask me for written approval before saying anything to them.",
          },
          {
            kind: "memo",
            id: "m2",
            title: "Team question box: this week",
            author: { name: "Team question box" },
            body:
              "- Are we being merged or sold?\n- Should I delay a major personal commitment until things are clearer?\n- Is the delivery next month still going ahead?\n- Why are senior managers in so many closed meetings?\n- Will we hear news from our manager first, or from outside?",
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            {
              id: "a",
              label: "Tell the team you cannot comment on rumours, confirm the delivery plan stands, and say nothing more to anyone until the announcement.",
            },
            {
              id: "b",
              label:
                "Tell the team openly that changes are coming that you cannot discuss yet, that nothing has been decided about individuals, and that you will tell them as soon as you can.",
            },
            { id: "c", label: "Ask {{exec}} for written approval to brief {{report1}} privately before Friday, and keep to the agreed line with everyone else." },
            {
              id: "d",
              label: "Tell {{report1}} privately, without approval, that something is coming and advise them not to decide before the announcement.",
            },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "At the next team meeting, {{report2}} repeats the question. Write exactly what you say.",
        },
        twist: {
          change: "The announcement is brought forward: it will happen in 5 days, and you may brief your team one day before it.",
          prompt: "How do you use the next 5 days, and what do you say on the briefing day?",
        },
      },
      ar: {
        title: "ما لا تستطيع قوله بعد",
        scenario:
          "علمتَ من {{exec}} بصفة سرية أن {{company}} ستعلن اندماجًا بعد ثلاثة أسابيع، وأن الوظيفة التي يؤديها فريقك ستُدمج مع نظيرتها في الشركة الأخرى، وقد تتغير الأدوار، ولم يُتخذ أي قرار بشأن الأفراد. وقد التزمتَ بعدم الحديث في الأمر. الشائعات تنتشر، واليوم علمتَ من {{report1}} بوجود عرض عمل خارجي ينبغي الرد عليه قبل يوم الجمعة. وفي اجتماع الفريق هذا الصباح وُجّه إليك سؤال من {{report2}} أمام الجميع: هل يجري «أمر كبير»؟ وفي الوقت نفسه ينتظر فريقك تسليمًا رئيسيًا بعد أربعة أسابيع. تجد إحاطة {{exec}} وأسئلة الفريق ضمن المواد.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "إحاطة سرية",
            from: { name: "{{exec}}", role: "{{exec.role}}" },
            to: [{ name: "مجموعة المديرين" }],
            subject: "سري: إحاطة للمديرين",
            sentAt: "الاثنين، 09:00",
            body:
              "سيُعلَن الاندماج بعد ثلاثة أسابيع. وإلى ذلك الحين يُرجى عدم مناقشة الأمر مع فرقكم، وإذا سُئلتم فقولوا إنكم لا تستطيعون التعليق على الشائعات.\n\nستُتخذ القرارات المتعلقة بالأدوار بعد الإعلان، من خلال عملية اختيار عادلة. ويمكنكم إبلاغ فرقكم بأن خطط التسليم لهذا الربع قائمة.",
            footnote: "الاستثناءات: إذا كان الحفاظ على السرية سيُلحق ضررًا جسيمًا بأحد أعضاء الفريق، فاطلبوا موافقتي الكتابية قبل قول أي شيء له.",
          },
          {
            kind: "memo",
            id: "m2",
            title: "صندوق أسئلة الفريق: هذا الأسبوع",
            author: { name: "صندوق أسئلة الفريق" },
            body:
              "- هل ستُدمج شركتنا أو تُباع؟\n- هل أؤجل التزامًا شخصيًا كبيرًا حتى تتضح الأمور؟\n- هل ما زال التسليم المقرر الشهر القادم قائمًا؟\n- لماذا يكثر المديرون الكبار من الاجتماعات المغلقة؟\n- هل سنسمع الأخبار من مديرنا أولًا أم من الخارج؟",
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "إبلاغ الفريق بأنك لا تستطيع التعليق على الشائعات، وتأكيد أن خطة التسليم قائمة، وعدم قول المزيد لأي أحد حتى الإعلان." },
            { id: "b", label: "إبلاغ الفريق صراحةً بأن تغييرات قادمة لا يمكنك مناقشتها بعد، وأنه لم يُتخذ أي قرار بشأن الأفراد، وأنك ستطلعهم في أقرب وقت ممكن." },
            { id: "c", label: "طلب موافقة كتابية من {{exec}} لإطلاع {{report1}} على انفراد قبل يوم الجمعة، والالتزام بالموقف المتفق عليه مع الباقين." },
            { id: "d", label: "إخبار {{report1}} على انفراد ودون موافقة بأن أمرًا ما قادم، وتقديم نصيحة بعدم حسم القرار قبل الإعلان." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "في اجتماع الفريق التالي يتكرر السؤال نفسه من {{report2}}. اكتب ما ستقوله حرفيًا.",
        },
        twist: {
          change: "قُدِّم موعد الإعلان: سيكون بعد 5 أيام، ويُسمح لك بإحاطة فريقك قبله بيوم واحد.",
          prompt: "كيف تستثمر الأيام الخمسة القادمة، وماذا تقول يوم الإحاطة؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.setting-direction",
            anchors: [
              "Gives the team no clear focus amid the rumours, or repeats 'no comment' without saying what to work on.",
              "Says the delivery matters but vaguely, without linking it to what the team can control now.",
              "States a clear focus (the delivery in four weeks), why it still matters, and next steps, while being honest about what is unknown.",
              "Defines what the team should keep doing and which decisions can wait until the announcement, so people can act without checking back.",
              "Turns uncertainty into a direction people can act on and anticipates how plans and messages must shift once the merger is announced.",
            ],
          },
          {
            competencyKey: "judgment.ethical-judgment",
            anchors: [
              "Breaks the confidence casually, or misleads the team, for example by denying anything is happening.",
              "Keeps the confidence by citing the agreement, without considering {{report1}}'s decision or the team's wellbeing.",
              "Names the conflict between confidentiality and fairness to {{report1}} and the team, and chooses a course that involves no lie.",
              "Holds the confidentiality line under pressure while using a legitimate route, such as {{exec}}'s exception, to reduce harm to {{report1}}.",
              "Notices fairness effects beyond {{report1}} (others with pending decisions, the precedent of selective briefing) and raises them with {{exec}}.",
            ],
          },
          {
            competencyKey: "adaptability.comfort-with-ambiguity",
            anchors: [
              "Freezes until the announcement, or acts as if nothing were uncertain.",
              "Proceeds on an unstated assumption, such as that roles will not change or that {{report1}} will stay.",
              "States a working interpretation (roles may change; the delivery stands), proceeds, and names what to clarify with {{exec}}.",
              "Takes small steps that reduce uncertainty, like asking {{exec}} what can be said and when, while keeping the delivery moving.",
              "Creates structure for the team, such as working assumptions and dates when they will hear more, and uses the time to prepare.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices and uses {{exec}}'s written-approval exception for serious harm.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["written approval", "exception", "serious harm", "ask for approval", "موافقة كتابية", "استثناء", "ضرر جسيم", "طلب الموافقة"],
          },
          {
            text: "Avoids lying: declines to comment without denying.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["won't deny", "can't comment", "honest", "won't lie", "لن أنكر", "لا أستطيع التعليق", "صادق", "لن أكذب"],
          },
          {
            text: "Focuses the team on the delivery and what it can control.",
            competencyKey: "leadership.setting-direction",
            keywords: ["delivery", "focus", "what we can control", "plan stands", "التسليم", "نركز", "ما يمكننا التحكم", "الخطة قائمة"],
          },
          {
            text: "Clarifies with {{exec}} what can be said and when.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["clarify", "when we can share", "timeline", "what i can say", "توضيح", "متى يمكن", "موعد الإعلان", "ما يمكنني قوله"],
          },
        ],
        redFlags: [
          {
            text: "Denies that anything is happening.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["nothing is happening", "just rumours", "no changes", "لا يحدث شيء", "مجرد شائعات", "لا تغييرات"],
          },
          {
            text: "Shares merger details with the team without approval.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["tell them about the merger", "share the details", "they deserve to know everything", "أخبرهم بالاندماج", "أشارك التفاصيل", "من حقهم معرفة كل شيء"],
          },
          {
            text: "Pauses work until the announcement.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["pause the delivery", "wait until the announcement", "stop work", "إيقاف العمل", "ننتظر الإعلان", "تجميد"],
          },
        ],
        embeddedDetail: {
          description:
            "{{exec}}'s email footnote allows managers to ask for written approval to brief a team member where confidentiality would cause serious harm: a legitimate route for {{report1}}'s Friday deadline.",
          location: "footnote of {{exec}}'s briefing email",
          keywords: ["written approval", "exception", "serious harm", "موافقة كتابية", "استثناء", "ضرر جسيم"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Keeps your word to {{exec}}, avoids leaks and treats everyone the same.",
            cost: "May lose {{report1}} on Friday; the team may sense evasion; anxiety may hurt the delivery.",
          },
          {
            optionId: "b",
            defensibleBecause: "Honest about uncertainty without revealing details; may calm rumours.",
            cost: "Effectively confirms the rumour, arguably breaking the confidence; may raise anxiety and attrition; {{exec}} may see it as a breach.",
          },
          {
            optionId: "c",
            defensibleBecause: "Uses the legitimate exception route; balances confidentiality with fairness to {{report1}}.",
            cost: "Singles out {{report1}} when others may also face decisions; {{exec}} may refuse; others may feel excluded if it emerges.",
          },
          {
            optionId: "d",
            defensibleBecause: "May keep a key person and acts out of care for them.",
            cost: "Breaks your agreement; unfair to others; if roles change, {{report1}} may give up a good offer on your hint; personal risk.",
          },
        ],
        probeTargets: ["leadership.setting-direction"],
        twistTargets: ["adaptability.comfort-with-ambiguity"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-06-batch-on-the-dock",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 4, stakes: 3, timePressure: 3, informationGaps: 3 },
    targets: ["judgment.trade-off-reasoning", "critical-thinking.evaluating-evidence", "collaboration.stakeholder-management"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "middle",
    content: {
      en: {
        title: "The shipment on the dock",
        scenario:
          "A shipment of 12,000 units is due to leave for {{client}}'s stores tomorrow morning, in time for their product launch on Monday. Today's quality sample found an overall defect rate of 1.8%, against a normal 0.4%. The defect is cosmetic: a misaligned label, so the product works. {{specialist}} can inspect units by hand, but checking all 12,000 takes 4 days. {{client}} has strict quality terms and has complained twice this year. {{peer}} in sales says missing the launch would put next year's contract at risk. The sample results and messages are in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Today's quality sample",
            caption: "Sample taken from each production line.",
            columns: [
              { key: "line", label: "Production line" },
              { key: "units", label: "Units in shipment", numeric: true },
              { key: "sampled", label: "Sampled", numeric: true },
              { key: "defects", label: "Defects", numeric: true },
              { key: "rate", label: "Defect rate" },
            ],
            rows: [
              { line: "Line 1", units: 4000, sampled: 150, defects: 1, rate: "0.7%" },
              { line: "Line 2", units: 4000, sampled: 150, defects: 0, rate: "0.0%" },
              { line: "Line 3", units: 4000, sampled: 150, defects: 7, rate: "4.7%" },
              { line: "Total", units: 12000, sampled: 450, defects: 8, rate: "1.8%" },
            ],
          },
          {
            kind: "email",
            id: "m2",
            title: "Message from {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Sample results",
            sentAt: "Today, 15:20",
            body: "Sampling is done; results attached. My team can hand-check about 3,000 units a day, so the full shipment would take 4 days. Tell me what you need.",
          },
          {
            kind: "email",
            id: "m3",
            title: "Message from {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Please don't hold the shipment",
            sentAt: "Today, 15:45",
            body:
              "If we miss Monday, {{client}} will rethink next year's contract. Their quality terms let them reject a whole shipment if the defect rate is above 1%, but I really don't think they'll check that closely during a launch.",
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            {
              id: "a",
              label: "Ship all 12,000 units tomorrow, tell {{client}} about the label issue, and offer to replace any defective units at your cost.",
            },
            { id: "b", label: "Hold the whole shipment for full inspection and deliver in 4 days, after the launch, with every unit checked." },
            { id: "c", label: "Ship part of the order tomorrow and send the rest once it has been inspected." },
            { id: "d", label: "Call {{client}} tonight, explain the defect and the options, and let them decide." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "What do you check or ask before you commit, and why?",
        },
        twist: {
          change: "{{client}}'s store manager tells you that only units from the first delivery will be on display for launch week; anything later goes into storage.",
          prompt: "Does this change your plan? How?",
        },
      },
      ar: {
        title: "الشحنة على رصيف التحميل",
        scenario:
          "من المقرر أن تنطلق صباح الغد شحنة من 12,000 وحدة إلى متاجر {{client}}، لتصل في الوقت المناسب لإطلاق منتجهم يوم الاثنين. وقد كشفت عينة الجودة اليوم عن نسبة عيوب إجمالية تبلغ 1.8%، مقابل 0.4% في الأحوال العادية. والعيب شكلي، إذ إن الملصق غير مستقيم، والمنتج يعمل. يمكن لفريق {{specialist}} فحص الوحدات يدويًا، لكن فحص الوحدات الـ12,000 كلها يستغرق 4 أيام. ولدى {{client}} شروط جودة صارمة، وقد سُجّلت منه شكويان هذا العام. وبحسب {{peer}} من فريق المبيعات، فإن تفويت الإطلاق سيعرّض عقد العام القادم للخطر. تجد نتائج العينة والرسائل ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "عينة الجودة اليوم",
            caption: "عينة مأخوذة من كل خط إنتاج.",
            columns: [
              { key: "line", label: "خط الإنتاج" },
              { key: "units", label: "الوحدات في الشحنة", numeric: true },
              { key: "sampled", label: "حجم العينة", numeric: true },
              { key: "defects", label: "العيوب", numeric: true },
              { key: "rate", label: "نسبة العيوب" },
            ],
            rows: [
              { line: "الخط 1", units: 4000, sampled: 150, defects: 1, rate: "0.7%" },
              { line: "الخط 2", units: 4000, sampled: 150, defects: 0, rate: "0.0%" },
              { line: "الخط 3", units: 4000, sampled: 150, defects: 7, rate: "4.7%" },
              { line: "الإجمالي", units: 12000, sampled: 450, defects: 8, rate: "1.8%" },
            ],
          },
          {
            kind: "email",
            id: "m2",
            title: "رسالة من {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "نتائج العينة",
            sentAt: "اليوم، 15:20",
            body: "انتهى أخذ العينات، والنتائج مرفقة. يستطيع فريقي فحص نحو 3,000 وحدة يدويًا في اليوم، أي أن الشحنة كاملة تحتاج إلى 4 أيام. أخبرني بما تحتاج إليه.",
          },
          {
            kind: "email",
            id: "m3",
            title: "رسالة من {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "أرجو ألا نحتجز الشحنة",
            sentAt: "اليوم، 15:45",
            body:
              "إذا فاتنا موعد الاثنين فسيُعاد النظر في عقد العام القادم لدى {{client}}. تسمح لهم شروط الجودة برفض الشحنة كاملة إذا تجاوزت نسبة العيوب 1%، لكنني لا أظن أنهم سيدققون إلى هذا الحد في أثناء الإطلاق.",
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "شحن الوحدات الـ12,000 كلها غدًا، وإبلاغ {{client}} بمشكلة الملصق، وعرض استبدال أي وحدة معيبة على نفقتكم." },
            { id: "b", label: "احتجاز الشحنة كلها للفحص الكامل وتسليمها بعد 4 أيام، أي بعد الإطلاق، وكل وحدة فيها مفحوصة." },
            { id: "c", label: "شحن جزء من الطلب غدًا، وإرسال الباقي بعد فحصه." },
            { id: "d", label: "الاتصال بـ{{client}} الليلة، وشرح العيب والخيارات المتاحة، وترك القرار للعميل." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "ما الذي تتحقق منه أو تسأل عنه قبل أن تلتزم بقرارك، ولماذا؟",
        },
        twist: {
          change: "يخبرك مدير متجر لدى {{client}} بأن الوحدات المعروضة في أسبوع الإطلاق ستقتصر على الدفعة الأولى، وأن ما يصل بعدها سيذهب إلى المخزن.",
          prompt: "هل يغيّر هذا خطتك؟ وكيف؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "judgment.trade-off-reasoning",
            anchors: [
              "Picks ship or hold without naming the downside, as if one answer were obvious.",
              "Lists pros and cons of shipping versus holding but does not weigh them or explain the final choice.",
              "Compares launch timing, visible defects and the 1% rejection term, and explains why the chosen option's costs are acceptable.",
              "Makes criteria explicit (contract risk, defects in stores, launch sales), weighs them, and names what would change the choice.",
              "Reduces the trade-off itself, e.g., ships Lines 1–2 tomorrow and inspects only Line 3's 4,000 units in about 1.3 days.",
            ],
          },
          {
            competencyKey: "critical-thinking.evaluating-evidence",
            anchors: [
              "Treats the 1.8% overall rate as spread evenly across the shipment.",
              "Questions the sample without a clear basis, or ignores where the defects came from.",
              "Notes the defects cluster in Line 3 (7 of 8) and bases the decision on that.",
              "Notes the small samples (150 per line), says what further check would confirm Line 3 as the source, and how that would change the plan.",
              "Treats Line 3's rate as the key evidence, tests alternatives (chance versus a real fault), and states confidence in Lines 1–2 accordingly.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Considers only the shipping deadline, ignoring {{client}}, {{peer}} or {{specialist}}.",
              "Names {{client}} and {{peer}} but treats their interests as the same: getting goods out.",
              "Identifies what {{client}} (quality, launch), {{peer}} (contract) and {{specialist}} (inspection capacity) each need, and how to inform each.",
              "Anticipates the clash between {{peer}}'s urgency and {{client}}'s quality terms, and sets {{client}}'s expectations before shipping.",
              "Considers less obvious stakeholders, such as {{client}}'s store staff handling defects, and plans so the relationship survives a third issue.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots that the defects cluster in Line 3.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["line 3", "7 of 8", "4.7%", "one line", "lines 1 and 2", "الخط 3", "7 من 8", "خط واحد", "الخطين 1 و2"],
          },
          {
            text: "Works out that inspecting only Line 3 takes about a day and a half.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["4,000 units", "1.3 days", "a day and a half", "inspect line 3", "فحص الخط 3", "يوم ونصف", "4,000 وحدة"],
          },
          {
            text: "Uses the 1% rejection term in the reasoning.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["1%", "reject", "rejection", "quality terms", "رفض الشحنة", "شروط الجودة", "1%"],
          },
          {
            text: "Informs {{client}} before shipping rather than hoping they won't check.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["inform the client", "before shipping", "transparent", "tell them", "إبلاغ العميل", "قبل الشحن", "بشفافية", "نخبرهم"],
          },
        ],
        redFlags: [
          {
            text: "Ships without telling {{client}}, relying on them not checking.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["they won't check", "they won't notice", "no need to tell", "لن يدققوا", "لن يلاحظوا", "لا داعي لإبلاغ"],
          },
          {
            text: "Treats the defect as uniform across all lines.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["spread across", "whole shipment is defective", "all lines", "الشحنة بأكملها معيبة", "كل الخطوط"],
          },
          {
            text: "Presents the choice as having no real cost.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["no choice", "only option", "obviously", "لا خيار", "الخيار الوحيد", "بديهي"],
          },
        ],
        embeddedDetail: {
          description:
            "Seven of the eight defects come from Line 3 (4.7%); Lines 1–2 together are at about 0.3%, under the 1% rejection term. At 3,000 units a day, inspecting only Line 3's 4,000 units takes about 1.3 days.",
          location: "Line 3 row of the sample table; inspection rate in {{specialist}}'s email",
          keywords: ["line 3", "7 of 8", "4.7%", "3,000 a day", "الخط 3", "7 من 8", "3,000 وحدة"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Keeps the launch date, is transparent, and replacement limits harm to {{client}}.",
            cost: "1.8% overall exceeds the 1% term, so {{client}} could reject everything; around 200 visibly defective units in stores; a third quality complaint this year.",
          },
          {
            optionId: "b",
            defensibleBecause: "Guarantees quality and fully respects {{client}}'s strict terms.",
            cost: "Misses the launch and endangers next year's contract; 4 days of inspection cost; {{client}}'s shelves empty at launch.",
          },
          {
            optionId: "c",
            defensibleBecause: "Balances the launch date against quality.",
            cost: "{{client}} has less stock at launch; split logistics cost more; unless the split follows the lines, defects still go out.",
          },
          {
            optionId: "d",
            defensibleBecause: "{{client}} owns its launch trade-off; transparency builds trust after two complaints.",
            cost: "Puts the burden on {{client}}; surfaces a third quality issue; may look as if you have no plan of your own.",
          },
        ],
        probeTargets: ["critical-thinking.evaluating-evidence"],
        twistTargets: ["judgment.trade-off-reasoning"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-07-training-cut",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 3, stakes: 2, timePressure: 2, informationGaps: 2 },
    targets: ["leadership.courage", "critical-thinking.logical-reasoning", "management.resource-allocation"],
    roleFamilies: [],
    minutes: 4,
    storyPhase: "middle",
    content: {
      en: {
        title: "The training cut",
        scenario:
          "{{company}} is rolling out a new scheduling tool across all nine sites next month, and you manage the rollout. {{exec}} has cut the rollout's training budget by 40% to pay for extra licences, saying: 'The pilot site adopted the tool with almost no training, so the other sites will too.' {{exec}} has already announced this in a leadership meeting. You think the cut is a mistake. You have a 15-minute slot with {{exec}} tomorrow. The pilot report and the revised budget are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "Pilot site report",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            date: "Last month",
            body:
              "Result: 85% of staff at the pilot site used the tool every week after 6 weeks.\n\nTraining given: one 1-hour session.\n\nNotes: the pilot site was chosen because its staff volunteered. Four of its team members had used a similar tool in previous jobs and helped colleagues informally during the first weeks.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Rollout budget",
            columns: [
              { key: "item", label: "Item" },
              { key: "original", label: "Original", numeric: true },
              { key: "revised", label: "Revised", numeric: true },
            ],
            rows: [
              { item: "Licences", original: 130000, revised: 150000 },
              { item: "Training", original: 50000, revised: 30000 },
              { item: "Support desk", original: 20000, revised: 20000 },
              { item: "Total", original: 200000, revised: 200000 },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            { id: "a", label: "Accept the decision and make the reduced budget work: train one volunteer per site to coach the others." },
            { id: "b", label: "Use the 15 minutes to ask {{exec}} to reverse the cut, using the pilot report to show why the result may not repeat." },
            {
              id: "c",
              label: "Propose a compromise: keep the cut for the sites most like the pilot, and restore training for the others by delaying some licences.",
            },
            {
              id: "d",
              label: "Accept the cut, but ask {{exec}} to agree a checkpoint: if weekly use is below 60% after 6 weeks, the training money is restored.",
            },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "Write the first two or three sentences you say to {{exec}} in the 15-minute slot.",
        },
        twist: {
          change: "{{exec}} replies: 'I hear you, but the licence order is already signed and cannot be reduced.'",
          prompt: "What do you do now with the budget you have?",
        },
      },
      ar: {
        title: "تقليص ميزانية التدريب",
        scenario:
          "تطلق {{company}} الشهر القادم أداة جدولة جديدة في مواقعها التسعة كلها، وأنت تدير عملية الإطلاق. وقد صدر عن {{exec}} قرار بخفض ميزانية التدريب المخصصة للإطلاق بنسبة 40% لتمويل تراخيص إضافية، مع هذا التعليل: «اعتمد موقع التجربة الأداةَ دون تدريب يُذكر، وكذلك ستفعل المواقع الأخرى». وأُعلن القرار في اجتماع للقيادة. أنت ترى أن التخفيض خطأ، ولديك موعد مدته 15 دقيقة مع {{exec}} غدًا. تجد تقرير موقع التجربة والميزانية المعدّلة ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "تقرير موقع التجربة",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            date: "الشهر الماضي",
            body:
              "النتيجة: استخدم 85% من موظفي موقع التجربة الأداةَ أسبوعيًا بعد 6 أسابيع.\n\nالتدريب المقدَّم: جلسة واحدة مدتها ساعة.\n\nملاحظات: اختير موقع التجربة لأن موظفيه تطوعوا. وكان أربعة من أعضاء فريقه قد استخدموا أداة مشابهة في وظائف سابقة، وساعدوا زملاءهم بصورة غير رسمية في الأسابيع الأولى.",
          },
          {
            kind: "table",
            id: "m2",
            title: "ميزانية الإطلاق",
            columns: [
              { key: "item", label: "البند" },
              { key: "original", label: "الأصلية", numeric: true },
              { key: "revised", label: "المعدّلة", numeric: true },
            ],
            rows: [
              { item: "التراخيص", original: 130000, revised: 150000 },
              { item: "التدريب", original: 50000, revised: 30000 },
              { item: "مكتب الدعم", original: 20000, revised: 20000 },
              { item: "الإجمالي", original: 200000, revised: 200000 },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "قبول القرار والعمل بالميزانية المخفّضة: تدريب متطوع واحد في كل موقع ليتولى توجيه الآخرين." },
            { id: "b", label: "استثمار الدقائق الخمس عشرة في مطالبة {{exec}} بالتراجع عن التخفيض، مستعينًا بتقرير التجربة لبيان أن النتيجة قد لا تتكرر." },
            { id: "c", label: "اقتراح حل وسط: إبقاء التخفيض في المواقع الأشبه بموقع التجربة، وإعادة التدريب للمواقع الأخرى بتأجيل بعض التراخيص." },
            { id: "d", label: "قبول التخفيض مع مطالبة {{exec}} بالاتفاق على نقطة مراجعة: إذا قلّ الاستخدام الأسبوعي عن 60% بعد 6 أسابيع، تُعاد أموال التدريب." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "اكتب الجملتين أو الجمل الثلاث الأولى التي ستقولها لـ{{exec}} في موعد الدقائق الخمس عشرة.",
        },
        twist: {
          change: "يأتي رد {{exec}}: «أفهم وجهة نظرك، لكن طلب التراخيص وُقّع ولا يمكن تقليصه».",
          prompt: "ماذا تفعل الآن بالميزانية المتاحة لديك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Goes along with the cut without raising the concern, though they believe it is a mistake.",
              "Raises the concern indirectly, or plans to drop it as soon as {{exec}} pushes back.",
              "States the concern to {{exec}} clearly and respectfully in the slot, with the pilot evidence as the reason.",
              "Holds the reasoned position when {{exec}} resists, while staying open to evidence that the cut could work.",
              "Names the uncomfortable point (the decision rests on a flawed premise) in a way {{exec}} can act on without losing face, accepting personal risk.",
            ],
          },
          {
            competencyKey: "critical-thinking.logical-reasoning",
            anchors: [
              "Accepts 'the pilot needed little training, so others will too' without question, or argues against it with unrelated points.",
              "Senses the pilot may differ but does not explain why the conclusion fails to follow.",
              "Explains that the pilot's volunteers and experienced staff mean its result may not apply to the other eight sites.",
              "Names the flaw (an unrepresentative site generalised to all) and states what would need to be true for {{exec}}'s claim to hold.",
              "Tests the claim by asking what else should be true if it held, and proposes a quick check (e.g., early use at a non-volunteer site).",
            ],
          },
          {
            competencyKey: "management.resource-allocation",
            anchors: [
              "Spreads the reduced training money evenly by habit, or ignores the budget limit.",
              "Sees the budget is limited but directs training to the largest or loudest sites, not where it matters most.",
              "Directs the reduced budget to sites least like the pilot and states which sites will get less support.",
              "Compares uses (sessions, peer coaches, support desk) by expected adoption gain and holds some money back for struggling sites.",
              "Finds money tied up in low-value spending, such as licences ahead of need, and redirects it, counting the cost of later catch-up training.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices the pilot staff volunteered and four had used a similar tool.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["volunteer", "volunteered", "similar tool", "experienced", "not representative", "متطوع", "تطوعوا", "أداة مشابهة", "ليس ممثلًا", "خبرة سابقة"],
          },
          {
            text: "States the disagreement directly and respectfully.",
            competencyKey: "leadership.courage",
            keywords: ["i disagree", "my concern", "respectfully", "i need to be honest", "أختلف", "قلقي", "مع احترامي", "بصراحة"],
          },
          {
            text: "Proposes a measurable checkpoint for adoption.",
            competencyKey: "management.resource-allocation",
            keywords: ["checkpoint", "weekly use", "60%", "measure", "restore", "نقطة مراجعة", "الاستخدام الأسبوعي", "60%", "قياس"],
          },
          {
            text: "Targets limited training at the sites least like the pilot.",
            competencyKey: "management.resource-allocation",
            keywords: ["sites without", "prioritise", "most at risk", "unlike the pilot", "الأولوية", "الأكثر عرضة", "المواقع التي لا", "على خلاف موقع التجربة"],
          },
        ],
        redFlags: [
          {
            text: "Complies silently despite disagreeing.",
            competencyKey: "leadership.courage",
            keywords: ["not my place", "already decided", "just do it", "ليس من شأني", "القرار اتُّخذ", "ننفّذ فقط"],
          },
          {
            text: "Generalises from the pilot uncritically.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["pilot proves", "worked there so", "same everywhere", "التجربة تثبت", "نجحت هناك إذن", "الأمر نفسه في كل مكان"],
          },
          {
            text: "Attacks {{exec}} personally rather than the reasoning.",
            competencyKey: "leadership.courage",
            keywords: ["doesn't understand", "careless", "out of touch", "لا يفهم", "مستهتر", "بعيد عن الواقع"],
          },
        ],
        embeddedDetail: {
          description:
            "The pilot report notes the site's staff volunteered and four had used a similar tool before and coached colleagues informally, so the low-training result is unlikely to repeat at the other eight sites.",
          location: "'Notes' paragraph of the pilot site report",
          keywords: ["volunteered", "similar tool", "helped colleagues", "تطوعوا", "أداة مشابهة", "ساعدوا زملاءهم"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Respects a decision already announced; the peer-coach model copies what worked at the pilot.",
            cost: "Assumes each site has an experienced volunteer, which the pilot report suggests is unusual; you stay silent about a flaw you can see.",
          },
          {
            optionId: "b",
            defensibleBecause: "Challenges a flawed premise directly, with evidence, before money is spent.",
            cost: "Asks a senior leader to reverse a public announcement; may strain the relationship; 15 minutes may not be enough.",
          },
          {
            optionId: "c",
            defensibleBecause: "Tailors support to real differences between sites and keeps most of {{exec}}'s decision.",
            cost: "More complex; you may not know which sites resemble the pilot; delaying licences may slow the rollout; may read as a reversal by another name.",
          },
          {
            optionId: "d",
            defensibleBecause: "Lets data decide while preserving {{exec}}'s authority.",
            cost: "Six weeks of poor adoption at some sites; habits form and retraining later costs more; the checkpoint may be ignored.",
          },
        ],
        probeTargets: ["leadership.courage"],
        twistTargets: ["management.resource-allocation"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-08-two-sets-of-priorities",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 5,
    dials: { ambiguity: 5, stakeholders: 5, conflictingConstraints: 5, stakes: 4, timePressure: 4, informationGaps: 4 },
    targets: ["adaptability.comfort-with-ambiguity", "management.planning-prioritisation", "collaboration.stakeholder-management"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "early",
    content: {
      en: {
        title: "Two sets of priorities",
        scenario:
          "You took over a team of six last week after a reorganisation. Nobody has written down the team's goals. {{manager}} wants the team to halve customer response times this quarter. {{exec}}, who sponsors the reorganisation, wants the team to build a new partner-reporting process first, and calls it 'non-negotiable'. Each goal needs most of the team for the whole quarter, and {{manager}} and {{exec}} have not discussed this with each other. Your first progress update is due in three weeks, and {{peer}}'s team depends on the partner reports. The two requests and your capacity estimate are in the materials.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "Message from {{manager}}",
            from: { name: "{{manager}}", role: "{{manager.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Response times: this quarter",
            sentAt: "Monday, 08:30",
            body: "Our average response time is 26 hours; I need it under 13 by the end of the quarter. This is the measure the leadership team will judge us on.",
          },
          {
            kind: "email",
            id: "m2",
            title: "Message from {{exec}}",
            from: { name: "{{exec}}", role: "{{exec.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Partner reporting",
            sentAt: "Monday, 10:15",
            body: "The new partner-reporting process must be live this quarter. Partners have been waiting too long. This is non-negotiable.",
            footnote: "The first partner reports are due on the 30th of next month. A manual version would be acceptable for that first cycle.",
          },
          {
            kind: "table",
            id: "m3",
            title: "Capacity estimate for the quarter",
            caption: "Estimates in person-weeks.",
            columns: [
              { key: "item", label: "Item" },
              { key: "weeks", label: "Person-weeks", numeric: true },
            ],
            rows: [
              { item: "Available after routine work and leave", weeks: 58 },
              { item: "Halve response times (estimate)", weeks: 48 },
              { item: "Partner-reporting process, full build (estimate)", weeks: 52 },
              { item: "Total requested", weeks: 100 },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            {
              id: "a",
              label: "Commit fully to {{exec}}'s partner-reporting process, since it is 'non-negotiable', and tell {{manager}} response times will improve next quarter.",
            },
            { id: "b", label: "Split the team roughly in half and pursue both goals, accepting that neither may be fully met." },
            { id: "c", label: "Bring {{manager}} and {{exec}} together this week with the capacity figures, and ask them to agree the priority before you commit." },
            { id: "d", label: "Put most of the team on response times now, and build the smallest partner-reporting version that meets the first deadline." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "What do you do in your first two days, and what do you need to find out?",
        },
        twist: {
          change: "{{manager}} tells you they will be away for the next month; you will report to {{exec}} directly in the meantime.",
          prompt: "How does this change your approach and your plan?",
        },
      },
      ar: {
        title: "مجموعتان من الأولويات",
        scenario:
          "تسلّمتَ الأسبوع الماضي قيادة فريق من ستة أشخاص بعد إعادة هيكلة، ولم يدوّن أحد أهداف الفريق. يريد {{manager}} أن يخفّض الفريق زمن الرد على العملاء إلى النصف هذا الربع. أما {{exec}}، راعي إعادة الهيكلة، فيريد أن يبني الفريق أولًا عملية جديدة لتقارير الشركاء، ويصفها بأنها «غير قابلة للتفاوض». ويحتاج كل هدف إلى معظم الفريق طوال الربع، ولم يجرِ أي نقاش بين {{manager}} و{{exec}} في هذا الأمر. أول تقرير لك عن سير العمل مستحق بعد ثلاثة أسابيع، وفريق {{peer}} يعتمد على تقارير الشركاء. تجد الطلبين وتقدير الطاقة المتاحة ضمن المواد.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "رسالة من {{manager}}",
            from: { name: "{{manager}}", role: "{{manager.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "زمن الرد: هذا الربع",
            sentAt: "الاثنين، 08:30",
            body: "متوسط زمن الرد لدينا 26 ساعة، وأحتاج إلى خفضه إلى أقل من 13 ساعة بنهاية الربع. هذا هو المقياس الذي سيحكم به فريق القيادة على أدائنا.",
          },
          {
            kind: "email",
            id: "m2",
            title: "رسالة من {{exec}}",
            from: { name: "{{exec}}", role: "{{exec.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "تقارير الشركاء",
            sentAt: "الاثنين، 10:15",
            body: "يجب أن تعمل العملية الجديدة لتقارير الشركاء خلال هذا الربع، فقد طال انتظار الشركاء. هذا أمر غير قابل للتفاوض.",
            footnote: "أول تقارير الشركاء مستحقة يوم 30 من الشهر القادم، ويمكن قبول نسخة يدوية في تلك الدورة الأولى.",
          },
          {
            kind: "table",
            id: "m3",
            title: "تقدير الطاقة المتاحة خلال الربع",
            caption: "التقديرات بوحدة أسبوع عمل للشخص.",
            columns: [
              { key: "item", label: "البند" },
              { key: "weeks", label: "أسابيع عمل", numeric: true },
            ],
            rows: [
              { item: "المتاح بعد العمل الروتيني والإجازات", weeks: 58 },
              { item: "خفض زمن الرد إلى النصف (تقدير)", weeks: 48 },
              { item: "عملية تقارير الشركاء، بناء كامل (تقدير)", weeks: 52 },
              { item: "إجمالي المطلوب", weeks: 100 },
            ],
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "الالتزام الكامل بعملية تقارير الشركاء التي يريدها {{exec}} لأنها «غير قابلة للتفاوض»، وإبلاغ {{manager}} بأن زمن الرد سيتحسن في الربع القادم." },
            { id: "b", label: "تقسيم الفريق إلى نصفين تقريبًا والعمل على الهدفين معًا، مع قبول احتمال ألا يتحقق أيٌّ منهما كاملًا." },
            { id: "c", label: "جمع {{manager}} و{{exec}} هذا الأسبوع وعرض أرقام الطاقة المتاحة عليهما، وطلب اتفاقهما على الأولوية قبل أن تلتزم بشيء." },
            { id: "d", label: "توجيه معظم الفريق إلى زمن الرد الآن، وبناء أصغر نسخة من تقارير الشركاء تفي بالموعد الأول." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "ماذا تفعل في يومَيك الأولين، وما الذي تحتاج إلى معرفته؟",
        },
        twist: {
          change: "تصلك من {{manager}} رسالة تفيد بالغياب طوال الشهر القادم، وبأنك سترفع تقاريرك إلى {{exec}} مباشرة في هذه الأثناء.",
          prompt: "كيف يغيّر ذلك نهجك وخطتك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "adaptability.comfort-with-ambiguity",
            anchors: [
              "Waits for {{manager}} and {{exec}} to agree before doing anything, or ignores that the goals conflict.",
              "Proceeds on an unstated reading, such as that 'non-negotiable' means a full build, that may not match what is needed.",
              "States a working interpretation of each request, proceeds on it, and names what to clarify and with whom.",
              "Takes small reversible steps (e.g., checks what the first partner reports really need) while clarifying the main unknowns.",
              "Creates structure for the team and both sponsors: working assumptions, a decision date, and options that use the ambiguity to reshape the work.",
            ],
          },
          {
            competencyKey: "management.planning-prioritisation",
            anchors: [
              "Commits to both full goals despite 100 person-weeks requested against 58 available.",
              "Orders work by who pushed hardest or the nearest date, without considering effort or dependencies.",
              "Uses the capacity figures to rank the work, accounts for {{peer}}'s dependency on partner reports, and states what is deferred.",
              "Identifies the critical path (the first partner-report date), builds a buffer, and explains priorities to {{manager}}, {{exec}} and {{peer}}.",
              "Questions whether all of either goal is needed this quarter, and sequences work so early results reduce the biggest uncertainty first.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Considers only one sponsor's request and overlooks the other or {{peer}}'s team.",
              "Names {{manager}} and {{exec}} but treats them as wanting the same thing.",
              "Identifies what {{manager}}, {{exec}} and {{peer}} each care about, and how and when to involve each.",
              "Anticipates the clash between the two sponsors and settles expectations before the three-week update.",
              "Brings in less obvious stakeholders (customers waiting on responses, partners receiving reports) and builds support before it is needed.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the capacity figures to show both goals cannot be done in full.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["58", "100", "person-weeks", "capacity", "not enough", "الطاقة المتاحة", "أسابيع عمل", "لا تكفي", "58", "100"],
          },
          {
            text: "Notices a manual first cycle is acceptable, shrinking the partner-reporting work.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["manual", "first cycle", "30th", "minimum", "smallest version", "يدوية", "الدورة الأولى", "الحد الأدنى", "يوم 30"],
          },
          {
            text: "Gets both sponsors to agree the priority explicitly.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["both", "together", "align", "agree the priority", "joint", "معًا", "توافق", "الاتفاق على الأولوية", "كليهما"],
          },
          {
            text: "Considers {{peer}}'s team's dependency on the partner reports.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["depends on", "dependency", "partner reports", "other team", "يعتمد على", "تقارير الشركاء", "الفريق الآخر"],
          },
        ],
        redFlags: [
          {
            text: "Promises both goals in full by working harder.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["do both", "work harder", "overtime", "everything", "كلاهما بالكامل", "ساعات إضافية", "نعمل أكثر", "كل شيء"],
          },
          {
            text: "Waits passively for the sponsors to sort it out.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["wait for them", "until they decide", "not my call", "ننتظرهما", "حتى يقررا", "ليس قراري"],
          },
          {
            text: "Picks a sponsor purely on seniority without telling the other.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["more senior", "seniority", "outranks", "الأعلى منصبًا", "الأقدم", "الأعلى رتبة"],
          },
        ],
        embeddedDetail: {
          description:
            "{{exec}}'s email footnote says a manual version is acceptable for the first partner-report cycle (due the 30th of next month), so the 'non-negotiable' goal needs far less than the 52-person-week full build this quarter.",
          location: "footnote of {{exec}}'s email",
          keywords: ["manual version", "first cycle", "acceptable", "30th", "يدوية", "الدورة الأولى", "مقبولة"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Aligns with the most senior sponsor and avoids defying a 'non-negotiable' request.",
            cost: "Your direct manager's goal, the measure you are judged on, goes unmet; {{manager}} may feel bypassed; may over-build what partners need now.",
          },
          {
            optionId: "b",
            defensibleBecause: "Shows progress on both and keeps both sponsors partly satisfied.",
            cost: "58 available against 100 requested makes missing both likely; diluted focus; postpones a clear decision.",
          },
          {
            optionId: "c",
            defensibleBecause: "Puts the conflict in front of the people who own it, rather than choosing between seniors yourself.",
            cost: "May look like you cannot decide in your second week; their meeting may be slow; {{exec}} may resent being challenged.",
          },
          {
            optionId: "d",
            defensibleBecause: "Uses limited capacity on both goals while meeting the hard date.",
            cost: "Rests on an assumption about what 'minimum' means to {{exec}}; {{exec}} may see it as not taking the request seriously; possible rework later.",
          },
        ],
        probeTargets: ["adaptability.comfort-with-ambiguity"],
        twistTargets: ["collaboration.stakeholder-management"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-09-before-the-standard",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 5,
    dials: { ambiguity: 5, stakeholders: 4, conflictingConstraints: 5, stakes: 5, timePressure: 4, informationGaps: 5 },
    targets: ["adaptability.comfort-with-ambiguity", "judgment.deciding-under-ambiguity"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "late",
    content: {
      en: {
        title: "Before the standard is published",
        scenario:
          "You run operations for {{company}}, a chain of 26 pharmacies. A new rule on electronic prescription records takes effect in 10 weeks. The regulator has published the principle but not the technical standard, which is 'expected within 4 to 6 weeks'. Your systems vendor needs 8 weeks to build any change. Missing the deadline risks fines and a possible suspension of dispensing controlled medicines. {{manager}} wants your decision today. A note from {{specialist}} and the vendor's email are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "What we know and don't know",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            body:
              "Known: from week 10, every prescription must be stored electronically with an audit log and reported to the regulator daily.\nUnknown: the data format for the daily reports, and whether paper prescriptions must be scanned.\nThe regulator circulated an informal draft last month but says it 'may change'. Two other pharmacy chains are asking the industry association to request a transition period.",
          },
          {
            kind: "email",
            id: "m2",
            title: "Email from the vendor",
            from: { name: "Vendor account team" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Build options and timing",
            sentAt: "Today, 09:40",
            body:
              "We can start building now from the informal draft, or wait for the final standard. If we start now and the standard changes, rework will cost extra and may add 2 to 3 weeks. If we wait for the final standard (week 4 to 6), the earliest go-live is week 12 to 14.",
            footnote: "Across every version of the draft we have seen, about 70% of the work (record storage and the audit log) is the same. The uncertain 30% is the daily report format.",
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            { id: "a", label: "Start the full build now from the informal draft, accepting rework if the final standard differs." },
            { id: "b", label: "Wait for the final standard, and ask the regulator now for a transition period." },
            { id: "c", label: "Run a manual stopgap (scanning and a spreadsheet log) from week 10, and start the system build once the standard is final." },
            { id: "d", label: "Join the other chains through the industry association to agree a common interpretation and a shared build, starting in 2 weeks." },
          ],
          requireJustification: true,
        },
        probe: { prompt: "What would you need to learn in the next two weeks to know whether your choice is still right?" },
        twist: {
          change: "Week 4: the regulator publishes the standard. The daily report format differs from the draft, and patient consent must now be recorded for every electronic prescription.",
          prompt: "What do you do now, and who do you tell?",
        },
      },
      ar: {
        title: "قبل صدور المعيار",
        scenario:
          "تدير العمليات في {{company}}، وهي سلسلة من 26 صيدلية. يبدأ العمل بقاعدة جديدة لسجلات الوصفات الإلكترونية بعد 10 أسابيع. وقد نشرت الجهة الرقابية المبدأ العام دون المعيار التقني، الذي «يُتوقع صدوره خلال 4 إلى 6 أسابيع». ويحتاج مورّد الأنظمة إلى 8 أسابيع لبناء أي تعديل. وتفويت الموعد يعرّض السلسلة لغرامات، وربما لإيقاف صرف الأدوية الخاضعة للرقابة. و{{manager}} بانتظار قرارك اليوم. تجد ملاحظة من {{specialist}} ورسالة المورّد ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "ما نعرفه وما لا نعرفه",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            body:
              "ما نعرفه: اعتبارًا من الأسبوع 10 يجب حفظ كل وصفة إلكترونيًا مع سجل تدقيق، وإرسال تقرير يومي إلى الجهة الرقابية.\nما لا نعرفه: صيغة البيانات في التقارير اليومية، وهل يجب مسح الوصفات الورقية ضوئيًا.\nوزّعت الجهة الرقابية مسودة غير رسمية في الشهر الماضي، لكنها تقول إنها «قد تتغير». وتسعى سلسلتا صيدليات أخريان إلى أن تطلب الجمعية المهنية فترة انتقالية.",
          },
          {
            kind: "email",
            id: "m2",
            title: "رسالة من المورّد",
            from: { name: "فريق حسابات المورّد" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "خيارات البناء ومواعيده",
            sentAt: "اليوم، 09:40",
            body:
              "يمكننا البدء في البناء الآن وفق المسودة غير الرسمية، أو انتظار المعيار النهائي. إذا بدأنا الآن وتغيّر المعيار، فستكلّف إعادة العمل مبلغًا إضافيًا وقد تضيف 2 إلى 3 أسابيع. وإذا انتظرنا المعيار النهائي (الأسبوع 4 إلى 6)، فأقرب موعد للتشغيل هو الأسبوع 12 إلى 14.",
            footnote: "في كل نسخ المسودة التي اطلعنا عليها، نحو 70% من العمل (حفظ السجلات وسجل التدقيق) ثابت لا يتغير. أما الـ30% غير المؤكدة فهي صيغة التقرير اليومي.",
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "البدء الآن في البناء الكامل وفق المسودة غير الرسمية، وتقبّل إعادة العمل إن جاء المعيار النهائي مختلفًا." },
            { id: "b", label: "انتظار المعيار النهائي، ومطالبة الجهة الرقابية الآن بفترة انتقالية." },
            { id: "c", label: "تشغيل حل يدوي مؤقت (مسح الوصفات ضوئيًا وسجل في جدول بيانات) بدءًا من الأسبوع 10، والبدء في بناء النظام حين يصدر المعيار النهائي." },
            { id: "d", label: "الانضمام إلى السلسلتين الأخريين عبر الجمعية المهنية للاتفاق على تفسير موحد وبناء مشترك، يبدأ بعد أسبوعين." },
          ],
          requireJustification: true,
        },
        probe: { prompt: "ما الذي تحتاج إلى معرفته خلال الأسبوعين القادمين لتعرف إن كان اختيارك ما زال صائبًا؟" },
        twist: {
          change: "الأسبوع 4: نشرت الجهة الرقابية المعيار. وصيغة التقرير اليومي تختلف عن المسودة، وصار تسجيل موافقة المريض واجبًا في كل وصفة إلكترونية.",
          prompt: "ماذا تفعل الآن، ومن تُبلغ؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "adaptability.comfort-with-ambiguity",
            anchors: [
              "Freezes until the standard is published, or acts as if the informal draft were final.",
              "Chooses an option but on an unstated assumption, such as that the draft will hold or that the regulator will grant extra time.",
              "States a working interpretation, chooses on it, and names what needs clarifying and from whom.",
              "Takes reversible steps that produce information: starts the 70% common work now, holds the uncertain 30%, and clarifies key unknowns with the regulator.",
              "As level 4, and creates structure for others: working assumptions, decision dates (e.g., week 6, standard or not) and a fallback that keeps dispensing legal.",
            ],
          },
          {
            competencyKey: "judgment.deciding-under-ambiguity",
            anchors: [
              "Refuses to decide today, or decides without weighing the options' risks.",
              "Decides but does not say how they would know the decision was wrong.",
              "Makes a reasonable decision on the available information, stating the main assumption and when it will be checked.",
              "Combines options to keep choices open (start the common 70%, prepare a manual stopgap, support the transition request) and sets decision points.",
              "Structures the plan so it holds whether the standard arrives on time, late or different, with explicit triggers for switching.",
            ],
          },
          {
            competencyKey: "adaptability.handling-new-information",
            anchors: [
              "Carries on as planned after the standard is published.",
              "Acknowledges the change but makes only a token adjustment.",
              "Re-plans the affected parts (report format, consent recording), keeps what still holds, and tells the vendor, {{manager}} and the pharmacies.",
              "Checks the new requirements carefully before acting (what consent covers and from when) and explains what changed in the plan and timeline.",
              "Updates in proportion and draws implications: whether week 10 is still reachable, whether the manual stopgap must record consent, and what to ask the regulator.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the vendor's footnote: about 70% of the work is the same in every draft and can start now.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["70%", "storage", "audit log", "common part", "same in every", "start now", "70%", "حفظ السجلات", "سجل التدقيق", "الجزء الثابت", "نبدأ الآن"],
          },
          {
            text: "Clarifies the unknowns with the regulator or through the industry association.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["ask the regulator", "clarify", "transition period", "industry association", "نسأل الجهة الرقابية", "استيضاح", "فترة انتقالية", "الجمعية المهنية"],
          },
          {
            text: "Sets a decision point tied to the standard's publication.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["week 6", "if the standard", "decision point", "by week", "الأسبوع 6", "إذا صدر المعيار", "نقطة قرار", "بحلول الأسبوع"],
          },
          {
            text: "Prepares a fallback that keeps dispensing legal from week 10.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["stopgap", "manual", "fallback", "spreadsheet", "week 10", "حل مؤقت", "يدوي", "خطة بديلة", "جدول بيانات", "الأسبوع 10"],
          },
          {
            text: "Re-plans for the new report format and consent requirement and tells the people affected.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["consent", "report format", "re-plan", "tell the vendor", "الموافقة", "صيغة التقرير", "إعادة التخطيط", "أبلغ المورد"],
          },
        ],
        redFlags: [
          {
            text: "Waits for full clarity before doing anything.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["wait until it's published", "do nothing until", "ننتظر حتى يصدر", "لا نفعل شيئًا حتى"],
          },
          {
            text: "Treats the informal draft as final.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["the draft is final", "it won't change", "المسودة نهائية", "لن تتغير"],
          },
          {
            text: "Assumes the regulator will extend the deadline.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["they'll give us more time", "surely they'll extend", "سيمنحوننا وقتًا", "سيمددون حتمًا"],
          },
          {
            text: "Carries on unchanged after the standard is published.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["carry on as planned", "no change needed", "نستمر كما خططنا", "لا حاجة إلى التغيير"],
          },
        ],
        embeddedDetail: {
          description:
            "The vendor's footnote says about 70% of the work (record storage and audit log) is the same in every draft; only the daily report format is uncertain, so a partial start now is low-risk.",
          location: "footnote of the vendor's email",
          keywords: ["70%", "audit log", "storage", "same", "70%", "سجل التدقيق", "حفظ السجلات", "ثابت"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "The only option that can meet week 10 with a built system if the draft holds; most of the work is common anyway.",
            cost: "Rework cost and 2 to 3 weeks' delay if the standard changes; commits budget on an unofficial document.",
          },
          {
            optionId: "b",
            defensibleBecause: "Avoids building to the wrong specification; a transition period may well be granted given industry pressure.",
            cost: "Go-live at week 12 to 14 misses the deadline unless the extension comes; relies on a decision outside your control.",
          },
          {
            optionId: "c",
            defensibleBecause: "Keeps dispensing legal from week 10 whatever the standard says, and builds the system only once.",
            cost: "Manual work across 26 pharmacies, error risk in daily reports, and staff time for weeks or months.",
          },
          {
            optionId: "d",
            defensibleBecause: "Shares cost and interpretation risk, and gives a stronger voice with the regulator.",
            cost: "Coordination slows decisions; a 2-week delay to start; dependent on other chains' priorities.",
          },
        ],
        probeTargets: ["judgment.deciding-under-ambiguity"],
        twistTargets: ["adaptability.handling-new-information", "adaptability.comfort-with-ambiguity"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dil-10-lending-your-best-writer",
    type: "TRADE_OFF_DILEMMA",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 3, informationGaps: 2 },
    targets: ["collaboration.team-orientation", "judgment.trade-off-reasoning"],
    roleFamilies: [],
    minutes: 4,
    storyPhase: "early",
    content: {
      en: {
        title: "Lending your best writer",
        scenario:
          "You lead a team of 4 in {{company}}'s marketing department. {{peer}}'s team must submit a large tender by Thursday at 12:00, and their main writer is off sick. {{peer}} asks to borrow {{report1}}, your strongest writer, for Tuesday and Wednesday. Your team's quarterly customer report is due to {{manager}} on Wednesday, and {{report1}} has written most of it. {{manager}} is travelling and hard to reach. {{peer}}'s email and {{manager}}'s note about the report are in the materials.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "Email from {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Could we borrow {{report1}}?",
            sentAt: "Monday, 17:30",
            body:
              "Our tender for a patient-communication contract with the regional health authority is due on Thursday at 12:00. It is worth about 2.4 million a year, and we think our chance is about 40%. Our writer is off sick until next week. Could {{report1}} join us on Tuesday and Wednesday? I know it's a big ask.",
            footnote: "Tender rules: late submissions are rejected without review.",
          },
          {
            kind: "memo",
            id: "m2",
            title: "Note from {{manager}} (last week)",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body: "Please have the quarterly customer report with me by Wednesday evening. I'll use it at Thursday's 09:00 review with {{client}}, our largest account.",
          },
        ],
        task: {
          kind: "choice",
          prompt: "Choose what you will do, and briefly explain why.",
          options: [
            { id: "a", label: "Lend {{report1}} for both days, and tell {{manager}} the report will be a day or two late." },
            { id: "b", label: "Lend {{report1}} for Tuesday only, and finish more of the report yourself in the evenings." },
            { id: "c", label: "Keep {{report1}} on the report, and offer to review the tender's final draft yourself on Wednesday evening." },
            { id: "d", label: "Ask {{peer}} to take the request to {{exec}}, who can decide between the two teams' priorities." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "{{report1}} tells you: 'I'd rather not be lent out. I want to finish the report I started.' What do you say?",
        },
        twist: {
          change: "Wednesday morning: the tender deadline is extended to Sunday, and {{peer}} asks for {{report1}} for a third day.",
          prompt: "Does your decision change? What do you do?",
        },
      },
      ar: {
        title: "إعارة أفضل كتّابك",
        scenario:
          "تقود فريقًا من 4 أشخاص في إدارة التسويق لدى {{company}}. على فريق {{peer}} تقديم مناقصة كبيرة قبل الساعة 12:00 يوم الخميس، والكاتب الرئيسي في ذلك الفريق في إجازة مرضية. ويصلك طلب من {{peer}} بإعارة {{report1}}، أقوى كتّاب فريقك، يومَي الثلاثاء والأربعاء. والتقرير الفصلي عن العملاء الذي يعدّه فريقك مستحق التسليم إلى {{manager}} يوم الأربعاء، ومعظمه بقلم {{report1}}. والتواصل مع {{manager}} صعب بسبب السفر. تجد رسالة {{peer}} وملاحظة {{manager}} عن التقرير ضمن المواد.",
        materials: [
          {
            kind: "email",
            id: "m1",
            title: "رسالة من {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "هل يمكننا الاستعانة بـ{{report1}}؟",
            sentAt: "الاثنين، 17:30",
            body:
              "موعد تقديم مناقصتنا لعقد التواصل مع المرضى لدى هيئة الصحة الإقليمية هو الساعة 12:00 يوم الخميس. تبلغ قيمة العقد نحو 2.4 مليون سنويًا، ونقدّر فرصتنا بنحو 40%. والكاتب لدينا في إجازة مرضية حتى الأسبوع القادم. هل يمكن الاستعانة بـ{{report1}} يومَي الثلاثاء والأربعاء؟ أعرف أنه طلب كبير.",
            footnote: "شروط المناقصة: العروض المتأخرة تُرفض دون دراسة.",
          },
          {
            kind: "memo",
            id: "m2",
            title: "ملاحظة من {{manager}} (الأسبوع الماضي)",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body: "أرجو أن يصلني التقرير الفصلي عن العملاء قبل مساء الأربعاء، فسأستخدمه في مراجعة الساعة 09:00 يوم الخميس مع {{client}}، أكبر عملائنا.",
          },
        ],
        task: {
          kind: "choice",
          prompt: "اختر ما ستفعله، واشرح سبب اختيارك باختصار.",
          options: [
            { id: "a", label: "إعارة {{report1}} يومين كاملين، وإبلاغ {{manager}} بأن التقرير سيتأخر يومًا أو يومين." },
            { id: "b", label: "إعارة {{report1}} يوم الثلاثاء فقط، وإكمال جزء أكبر من التقرير بنفسك في المساء." },
            { id: "c", label: "إبقاء {{report1}} على التقرير، وعرض مراجعة المسودة النهائية للمناقصة بنفسك مساء الأربعاء." },
            { id: "d", label: "الطلب من {{peer}} رفع الطلب إلى {{exec}}، ليكون الحسم في المفاضلة بين أولويات الفريقين بيد {{exec}}." },
          ],
          requireJustification: true,
        },
        probe: {
          prompt: "تسمع من {{report1}}: «أفضّل ألا أُعار إلى فريق آخر، فأنا أريد إنهاء التقرير الذي بدأته.» ماذا تقول؟",
        },
        twist: {
          change: "صباح الأربعاء: مُدّد موعد المناقصة إلى يوم الأحد، ويصلك طلب من {{peer}} بإعارة {{report1}} يومًا ثالثًا.",
          prompt: "هل يتغيّر قرارك؟ وماذا تفعل؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "collaboration.team-orientation",
            anchors: [
              "Treats the request purely as a threat to their own team's deliverable, or gives {{report1}} away without thinking about their own commitments.",
              "Helps or refuses without exploring options or talking to the people affected.",
              "Weighs the organisation's interest (a 2.4 million tender) against their own commitment, and offers real help on terms they can keep.",
              "Looks for a solution that serves both teams (split days, reviewing the tender, re-sequencing the report work) and involves {{report1}} in the decision.",
              "As level 4, and protects the wider relationship: keeps {{manager}} and {{peer}} informed, credits {{report1}} for helping, and suggests how to avoid single points of failure in future.",
            ],
          },
          {
            competencyKey: "judgment.trade-off-reasoning",
            anchors: [
              "Picks an option without naming what it costs.",
              "Names only one side of the trade-off, the tender or the report.",
              "Compares the options on what each gains and costs, including {{manager}}'s 09:00 review with {{client}} on Thursday.",
              "Weighs size and likelihood (a 40% chance at 2.4 million a year against a review with the largest account) and reversibility, and explains why the chosen cost is acceptable.",
              "As level 4, and reduces the cost of the chosen option (e.g., a shorter report in time for Thursday's review) and states what would change their mind.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices the report is needed for Thursday's 09:00 review with {{client}}, so 'a day late' is not harmless.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["09:00", "thursday's review", "largest account", "before the review", "الساعة 09:00", "مراجعة الخميس", "أكبر عملائنا", "قبل المراجعة"],
          },
          {
            text: "Weighs the tender's value and chance of success.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["40%", "2.4 million", "960,000", "expected value", "40%", "2.4 مليون", "960,000", "القيمة المتوقعة"],
          },
          {
            text: "Notes that late tenders are rejected, so the tender deadline is absolute.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["rejected", "hard deadline", "late submissions", "تُرفض", "موعد نهائي", "العروض المتأخرة"],
          },
          {
            text: "Finds a way to help both teams.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["one day", "review the draft", "split", "both teams", "يوم واحد", "مراجعة المسودة", "تقسيم", "الفريقين"],
          },
          {
            text: "Involves {{report1}} and keeps {{manager}} informed.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["talk it through", "involve", "let my manager know", "inform", "أتحدث مع", "أشرك", "أبلغ مديري", "إبلاغ"],
          },
        ],
        redFlags: [
          {
            text: "Dismisses the other team's need.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["not my problem", "their problem", "ليست مشكلتي", "مشكلتهم"],
          },
          {
            text: "Assumes a late report costs nothing.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["a day late won't matter", "it can wait", "no harm", "يوم تأخير لن يضر", "يمكن أن ينتظر", "لا ضرر"],
          },
          {
            text: "Passes the decision upward without a recommendation.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["not my call", "let them decide", "ليس قراري", "ليقرروا هم"],
          },
        ],
        embeddedDetail: {
          description:
            "{{manager}}'s note says the report is needed for Thursday's 09:00 review with {{client}}, the largest account, so delaying it to Friday is not a harmless slip.",
          location: "{{manager}}'s note about the report",
          keywords: ["09:00", "review with", "largest account", "thursday", "الساعة 09:00", "مراجعة", "أكبر عملائنا", "الخميس"],
        },
        optionNotes: [
          {
            optionId: "a",
            defensibleBecause: "Gives the tender, worth far more, the best chance; the organisation's interest comes first.",
            cost: "The report misses {{manager}}'s Thursday 09:00 review with the largest account; {{manager}} is told rather than asked.",
          },
          {
            optionId: "b",
            defensibleBecause: "Helps the tender on its most important day while protecting the report.",
            cost: "Half-help may not be enough for {{peer}}; you work late; both pieces of work may suffer.",
          },
          {
            optionId: "c",
            defensibleBecause: "Keeps your commitment to {{manager}} and still adds senior help to the tender.",
            cost: "The tender team still lacks a writer for two days; a late review may come too late to fix much.",
          },
          {
            optionId: "d",
            defensibleBecause: "The trade-off is between two teams' priorities, which {{exec}} is placed to judge.",
            cost: "Slow with a hard deadline; looks like avoiding a call you could make; adds to {{exec}}'s load.",
          },
        ],
        probeTargets: ["collaboration.team-orientation"],
        twistTargets: ["judgment.trade-off-reasoning"],
      },
    },
  },
];
