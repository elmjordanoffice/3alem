import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "rank-01-first-morning-back",
    type: "RANKING_ALLOCATION",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 2, stakes: 2, timePressure: 3, informationGaps: 2 },
    targets: ["management.planning-prioritisation", "leadership.ownership"],
    roleFamilies: [],
    minutes: 4,
    storyPhase: "early",
    content: {
      en: {
        title: "Your first morning back",
        scenario:
          "You are back after three days away. It is 08:30 on Tuesday, and you have about five free hours before an afternoon workshop you are running. Six things are waiting for you. You cannot do all of them today, and some may not need you at all. {{report1}}'s summary and a forwarded message are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "While you were away",
            author: { name: "{{report1}}", role: "{{report1.role}}" },
            date: "Monday evening",
            body:
              "Quick summary of what's waiting:\n\n1. {{client}} emailed yesterday afternoon about a wrong amount on last month's invoice. Annoyed, but not urgent in tone.\n2. {{exec}} wants five slides on our quarter for Thursday's meeting.\n3. The contractor who left last Friday still has access to our customer system. IT says the removal request must come from the contractor's manager, who has also left.\n4. {{peer}} forwarded the equipment rental contract for you to look at.\n5. {{report2}} asked whether your mid-year conversation is still on; it has been moved twice.\n6. Your workshop materials are about 80% ready.",
          },
          {
            kind: "email",
            id: "m2",
            title: "Forwarded by {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "FW: Equipment rental agreement",
            sentAt: "Friday, 16:50",
            body: "Forwarding as discussed. We hardly use most of this equipment, so I think we should cancel or reduce it. Have a look when you have a minute.",
            footnote: "From the supplier's original message: the agreement renews automatically for 12 months unless written notice is received by 17:00 on Wednesday.",
          },
        ],
        task: {
          kind: "ranking",
          prompt: "Rank the six items in the order you will deal with them, with 1 first.",
          rankItems: [
            { id: "r1", label: "Reply to {{client}}'s complaint about an invoice error", detail: "Sent yesterday afternoon." },
            { id: "r2", label: "Prepare the five slides {{exec}} asked for", detail: "Needed for Thursday's meeting." },
            { id: "r3", label: "Get system access removed for the contractor who left", detail: "Nobody has made the request yet." },
            { id: "r4", label: "Review the equipment rental agreement {{peer}} forwarded", detail: "'Have a look when you have a minute.'" },
            { id: "r5", label: "Hold the mid-year conversation with {{report2}}", detail: "Already postponed twice." },
            { id: "r6", label: "Finish preparing this afternoon's workshop", detail: "About an hour of work left." },
          ],
        },
        probe: {
          prompt: "Which items, if any, will you hand to someone else, postpone or decline? For each, say who you hand it to or what you tell them.",
        },
        twist: {
          change: "At 09:15 {{exec}} messages you: Thursday's meeting has moved to tomorrow morning.",
          prompt: "Re-rank if needed, and say what you drop or move as a result.",
        },
      },
      ar: {
        title: "صباحك الأول بعد العودة",
        scenario:
          "عدتَ بعد غياب ثلاثة أيام. الساعة الآن 08:30 من يوم الثلاثاء، ولديك نحو خمس ساعات متاحة قبل ورشة عمل تديرها بعد الظهر. تنتظرك ست مهام، ولا يمكنك إنجازها كلها اليوم، وبعضها قد لا يحتاج إليك أصلًا. تجد ملخص {{report1}} ورسالة محوَّلة ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "في أثناء غيابك",
            author: { name: "{{report1}}", role: "{{report1.role}}" },
            date: "مساء الاثنين",
            body:
              "ملخص سريع لما ينتظرك:\n\n1. وصلتنا بعد ظهر أمس رسالة من {{client}} بشأن مبلغ خاطئ في فاتورة الشهر الماضي. النبرة منزعجة لكنها ليست عاجلة.\n2. طلبٌ من {{exec}}: خمس شرائح عن أداء الربع لاجتماع يوم الخميس.\n3. ما زال المتعاقد الذي غادر يوم الجمعة الماضي يملك صلاحية الدخول إلى نظام العملاء. ويقول قسم تقنية المعلومات إن طلب إلغاء الصلاحية يجب أن يصدر عن مدير المتعاقد، وقد غادر هو الآخر.\n4. وصلك من {{peer}} عقد استئجار المعدات لتطّلع عليه.\n5. وصل سؤال من {{report2}}: هل ما زال لقاء منتصف العام معك قائمًا؟ فقد أُجّل مرتين.\n6. مواد ورشتك جاهزة بنسبة 80% تقريبًا.",
          },
          {
            kind: "email",
            id: "m2",
            title: "رسالة محوَّلة من {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "للاطلاع: اتفاقية استئجار المعدات",
            sentAt: "الجمعة، 16:50",
            body: "أحوّلها إليك كما اتفقنا. نحن بالكاد نستخدم معظم هذه المعدات، وأرى أن نلغي الاتفاقية أو نقلّصها. اطّلع عليها حين يتسع وقتك.",
            footnote: "من رسالة المورّد الأصلية: تتجدد الاتفاقية تلقائيًا لمدة 12 شهرًا ما لم يصل إشعار كتابي قبل الساعة 17:00 يوم الأربعاء.",
          },
        ],
        task: {
          kind: "ranking",
          prompt: "رتّب المهام الست بحسب الترتيب الذي ستتعامل به معها، بحيث يكون رقم 1 أولها.",
          rankItems: [
            { id: "r1", label: "الرد على شكوى {{client}} بشأن خطأ في الفاتورة", detail: "أُرسلت بعد ظهر أمس." },
            { id: "r2", label: "إعداد الشرائح الخمس التي طلبها {{exec}}", detail: "مطلوبة لاجتماع الخميس." },
            { id: "r3", label: "إلغاء صلاحية الدخول للمتعاقد الذي غادر", detail: "لم يقدّم أحد الطلب بعد." },
            { id: "r4", label: "مراجعة اتفاقية استئجار المعدات التي حوّلها {{peer}}", detail: "«اطّلع عليها حين يتسع وقتك»." },
            { id: "r5", label: "عقد لقاء منتصف العام مع {{report2}}", detail: "أُجّل مرتين من قبل." },
            { id: "r6", label: "إكمال التحضير لورشة بعد الظهر", detail: "بقي نحو ساعة من العمل." },
          ],
        },
        probe: {
          prompt: "ما المهام التي ستسندها إلى غيرك أو تؤجلها أو تعتذر عنها، إن وُجدت؟ اذكر لكل منها من ستسندها إليه أو ما ستقوله.",
        },
        twist: {
          change: "في الساعة 09:15 تصلك رسالة من {{exec}}: نُقل اجتماع الخميس إلى صباح الغد.",
          prompt: "أعد الترتيب إن لزم، واذكر ما ستتخلى عنه أو تنقله نتيجة لذلك.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.planning-prioritisation",
            anchors: [
              "Ranks in the order received or treats all six as equally urgent, leaving no protected time for the workshop.",
              "Ranks by apparent urgency only, missing that the rental agreement renews tomorrow at 17:00.",
              "Ranks by importance and urgency, protects the workshop preparation, and states what moves to later in the week.",
              "Puts quick, high-risk items (contractor access, rental notice) first, keeps a buffer before the workshop, and tells people about delays.",
              "Questions which items need them at all (e.g., delegates slide drafting or the rental review) and orders work so the biggest risks close earliest.",
            ],
          },
          {
            competencyKey: "leadership.ownership",
            anchors: [
              "Leaves the contractor's access for 'someone else' or IT, proposing no action.",
              "Acts on items that are clearly theirs but stays passive on the unowned access issue.",
              "Takes responsibility for getting the contractor's access removed although it is not formally theirs, and follows it to completion.",
              "Steps in on the access gap and the rental notice while keeping IT and {{peer}} informed of what they did.",
              "Closes the gap and proposes a change, such as a leaver checklist with a named owner, so access is not left open again.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices the rental agreement renews automatically unless notice is given by 17:00 Wednesday.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["tomorrow", "17:00", "auto-renew", "renews automatically", "12 months", "notice", "غدًا", "يتجدد تلقائيًا", "12 شهرًا", "إشعار", "الأربعاء"],
          },
          {
            text: "Treats the departed contractor's open access as an urgent risk.",
            competencyKey: "leadership.ownership",
            keywords: ["access", "contractor", "security", "revoke", "remove", "صلاحية", "المتعاقد", "أمن", "إلغاء الصلاحية"],
          },
          {
            text: "Protects time to finish the workshop preparation.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["workshop", "this afternoon", "protect", "block time", "الورشة", "بعد الظهر", "أخصص وقتًا"],
          },
          {
            text: "Proposes a process fix so leavers' access is always removed.",
            competencyKey: "leadership.ownership",
            keywords: ["leaver", "checklist", "process", "named owner", "so it doesn't happen", "قائمة تحقق", "إجراء", "مسؤول محدد", "حتى لا يتكرر"],
          },
          {
            text: "Delegates or hands off items that do not need them personally.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["delegate", "hand over", "first draft", "ask", "أفوّض", "أسند", "مسودة أولى", "أطلب من"],
          },
        ],
        redFlags: [
          {
            text: "Leaves the access issue to IT or others.",
            competencyKey: "leadership.ownership",
            keywords: ["not my job", "it department's job", "someone else", "ليس من مسؤوليتي", "مسؤولية تقنية المعلومات", "شخص آخر"],
          },
          {
            text: "Tries to do everything today.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["all urgent", "do everything today", "all of them today", "كلها عاجلة", "أنجز كل شيء اليوم", "جميعها اليوم"],
          },
          {
            text: "Sacrifices the workshop preparation without a plan.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["skip the workshop prep", "wing it", "cancel the workshop", "أرتجل الورشة", "إلغاء الورشة"],
          },
        ],
        embeddedDetail: {
          description:
            "The footnote of {{peer}}'s forwarded email says the rental agreement renews automatically for 12 months unless written notice arrives by 17:00 on Wednesday (tomorrow), so the 'when you have a minute' item has the hardest deadline.",
          location: "footnote of {{peer}}'s forwarded email",
          keywords: ["renews automatically", "17:00", "wednesday", "12 months", "يتجدد تلقائيًا", "الأربعاء", "12 شهرًا"],
        },
        probeTargets: ["management.planning-prioritisation", "leadership.ownership"],
        twistTargets: ["management.planning-prioritisation"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "rank-02-which-risks-to-fund",
    type: "RANKING_ALLOCATION",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 4, stakes: 4, timePressure: 2, informationGaps: 4 },
    targets: ["critical-thinking.quantitative-reasoning", "judgment.risk-calibration"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "middle",
    content: {
      en: {
        title: "Which risks to fund",
        scenario:
          "You run a six-month programme to move {{company}}'s customer records to a new system. You have 40,000 to spend on reducing risks, and the steering group chaired by {{exec}} wants your funding order by tomorrow. {{specialist}} has listed six risks with estimated likelihood, impact and the cost of reducing each one. You will probably be able to fund three or four. The risk register is in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Risk register",
            caption:
              "Impact is the estimated cost if the risk happens. All impacts are one-off totals except R-E, which is per day of outage; outages in past switchovers of this size lasted 3 to 5 days.",
            columns: [
              { key: "id", label: "Risk" },
              { key: "risk", label: "Description" },
              { key: "likelihood", label: "Likelihood" },
              { key: "impact", label: "Impact", numeric: true },
              { key: "cost", label: "Mitigation cost", numeric: true },
              { key: "effect", label: "Effect of mitigation" },
            ],
            rows: [
              { id: "R-A", risk: "Key data specialist leaves mid-programme", likelihood: "20%", impact: 90000, cost: 12000, effect: "Document the work and train a backup: halves the impact" },
              { id: "R-B", risk: "Data errors found after go-live", likelihood: "40%", impact: 120000, cost: 18000, effect: "Extra test cycle: likelihood falls to 10%" },
              { id: "R-C", risk: "Supplier delivers 4 weeks late", likelihood: "30%", impact: 60000, cost: 8000, effect: "Weekly reviews and a penalty clause: likelihood falls to 15%" },
              { id: "R-D", risk: "Staff resist the new system", likelihood: "50%", impact: 40000, cost: 10000, effect: "Champions in each team: likelihood halves" },
              { id: "R-E", risk: "Outage during the switchover", likelihood: "25%", impact: 20000, cost: 6000, effect: "Full rehearsal: likelihood falls to 5%" },
              { id: "R-F", risk: "Regulator questions how data was handled", likelihood: "5%", impact: 500000, cost: 15000, effect: "External review: likelihood falls to 1%" },
            ],
          },
        ],
        task: {
          kind: "ranking",
          prompt: "Rank the six risks in the order you would fund their mitigation, with 1 funded first.",
          rankItems: [
            { id: "ra", label: "R-A: Key data specialist leaves mid-programme", detail: "Mitigation costs 12,000." },
            { id: "rb", label: "R-B: Data errors found after go-live", detail: "Mitigation costs 18,000." },
            { id: "rc", label: "R-C: Supplier delivers 4 weeks late", detail: "Mitigation costs 8,000." },
            { id: "rd", label: "R-D: Staff resist the new system", detail: "Mitigation costs 10,000." },
            { id: "re", label: "R-E: Outage during the switchover", detail: "Mitigation costs 6,000." },
            { id: "rf", label: "R-F: Regulator questions how data was handled", detail: "Mitigation costs 15,000." },
          ],
        },
        probe: {
          prompt: "Which of your top three are you least sure about, and what would change its place?",
        },
        twist: {
          change: "The steering group cuts your risk budget to 25,000.",
          prompt: "Which mitigations do you keep, and what do you tell {{exec}} about the risks left unfunded?",
        },
      },
      ar: {
        title: "أي المخاطر نموّل؟",
        scenario:
          "تدير برنامجًا مدته ستة أشهر لنقل سجلات عملاء {{company}} إلى نظام جديد. لديك 40,000 لإنفاقها على الحد من المخاطر، وتنتظر اللجنة التوجيهية برئاسة {{exec}} ترتيبك لأولويات التمويل بحلول الغد. وتضم قائمة أعدّها {{specialist}} ست مخاطر، مع احتمال كل منها وأثرها وتكلفة الحد منها. والأرجح أنك ستستطيع تمويل ثلاث أو أربع منها فقط. تجد سجل المخاطر ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "سجل المخاطر",
            caption:
              "الأثر هو التكلفة المقدّرة إذا وقع الخطر. جميع قيم الأثر إجمالية لمرة واحدة، باستثناء R-E فقيمته لكل يوم من أيام التوقف؛ وقد استمر التوقف في عمليات انتقال سابقة بهذا الحجم من 3 إلى 5 أيام.",
            columns: [
              { key: "id", label: "الخطر" },
              { key: "risk", label: "الوصف" },
              { key: "likelihood", label: "الاحتمال" },
              { key: "impact", label: "الأثر", numeric: true },
              { key: "cost", label: "تكلفة الحد منه", numeric: true },
              { key: "effect", label: "أثر إجراء الحد" },
            ],
            rows: [
              { id: "R-A", risk: "مغادرة اختصاصي البيانات الرئيسي في منتصف البرنامج", likelihood: "20%", impact: 90000, cost: 12000, effect: "توثيق العمل وتدريب بديل: ينخفض الأثر إلى النصف" },
              { id: "R-B", risk: "اكتشاف أخطاء في البيانات بعد التشغيل", likelihood: "40%", impact: 120000, cost: 18000, effect: "دورة اختبار إضافية: ينخفض الاحتمال إلى 10%" },
              { id: "R-C", risk: "تأخر المورّد في التسليم 4 أسابيع", likelihood: "30%", impact: 60000, cost: 8000, effect: "مراجعات أسبوعية وبند جزائي: ينخفض الاحتمال إلى 15%" },
              { id: "R-D", risk: "مقاومة الموظفين للنظام الجديد", likelihood: "50%", impact: 40000, cost: 10000, effect: "مناصرون للنظام في كل فريق: ينخفض الاحتمال إلى النصف" },
              { id: "R-E", risk: "توقف الخدمة في أثناء الانتقال", likelihood: "25%", impact: 20000, cost: 6000, effect: "تمرين كامل مسبق: ينخفض الاحتمال إلى 5%" },
              { id: "R-F", risk: "استفسار الجهة الرقابية عن طريقة التعامل مع البيانات", likelihood: "5%", impact: 500000, cost: 15000, effect: "مراجعة خارجية: ينخفض الاحتمال إلى 1%" },
            ],
          },
        ],
        task: {
          kind: "ranking",
          prompt: "رتّب المخاطر الست بحسب أولوية تمويل إجراءات الحد منها، بحيث يكون رقم 1 أول ما يُموَّل.",
          rankItems: [
            { id: "ra", label: "R-A: مغادرة اختصاصي البيانات الرئيسي في منتصف البرنامج", detail: "تكلفة الحد منه 12,000." },
            { id: "rb", label: "R-B: اكتشاف أخطاء في البيانات بعد التشغيل", detail: "تكلفة الحد منه 18,000." },
            { id: "rc", label: "R-C: تأخر المورّد في التسليم 4 أسابيع", detail: "تكلفة الحد منه 8,000." },
            { id: "rd", label: "R-D: مقاومة الموظفين للنظام الجديد", detail: "تكلفة الحد منه 10,000." },
            { id: "re", label: "R-E: توقف الخدمة في أثناء الانتقال", detail: "تكلفة الحد منه 6,000." },
            { id: "rf", label: "R-F: استفسار الجهة الرقابية عن طريقة التعامل مع البيانات", detail: "تكلفة الحد منه 15,000." },
          ],
        },
        probe: {
          prompt: "أي المخاطر الثلاثة الأولى في ترتيبك أنت أقل ثقة بموقعه، وما الذي قد يغيّر مكانه؟",
        },
        twist: {
          change: "خفّضت اللجنة التوجيهية ميزانية المخاطر لديك إلى 25,000.",
          prompt: "أي إجراءات الحد تُبقي عليها، وماذا تقول لـ{{exec}} عن المخاطر التي بقيت دون تمويل؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.quantitative-reasoning",
            anchors: [
              "Ranks by impact or likelihood alone, or reads R-E's per-day figure as a one-off total.",
              "Uses the figures at face value without combining likelihood and impact or comparing with mitigation cost.",
              "Computes expected loss and its reduction per mitigation (e.g., R-B removes about 36,000 for 18,000) and ranks on value for money.",
              "Notices R-E is per day, scales it by the 3–5 day outages (about 60,000–100,000), and explains how this moves R-E up.",
              "Builds the best set within 40,000 (e.g., R-E, R-B, R-F at 39,000), names the estimate the ranking is most sensitive to, and states uncertainty.",
            ],
          },
          {
            competencyKey: "judgment.risk-calibration",
            anchors: [
              "Dismisses the regulator risk as too unlikely, or treats every risk as one that must be funded.",
              "Names the risks but does not separate likely-but-minor from unlikely-but-severe ones.",
              "Weighs likelihood and impact for each risk and funds safeguards proportionate to the most serious exposures.",
              "Distinguishes recoverable losses (delay, resistance) from hard-to-reverse ones (regulator, data errors) and names warning signs for unfunded risks.",
              "Weighs the cost of leaving risks unfunded, highlights the low-probability, high-impact regulator risk, and states how reliable the likelihoods are.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Combines likelihood and impact into expected loss and compares the reduction with cost.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["expected", "likelihood times impact", "expected loss", "value for money", "36,000", "القيمة المتوقعة", "الخسارة المتوقعة", "الاحتمال مضروبًا", "مقابل التكلفة"],
          },
          {
            text: "Notices R-E's impact is per day and scales it by the likely outage length.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["per day", "3 to 5 days", "3-5 days", "80,000", "100,000", "لكل يوم", "3 إلى 5 أيام", "80,000"],
          },
          {
            text: "Keeps the funded set within the 40,000 budget.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["40,000", "39,000", "within budget", "fits", "ضمن الميزانية", "39,000", "40,000"],
          },
          {
            text: "Treats the regulator risk as low-probability but severe and hard to reverse.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["regulator", "low probability", "high impact", "irreversible", "reputation", "الجهة الرقابية", "احتمال منخفض", "أثر كبير", "لا يمكن تداركه", "السمعة"],
          },
          {
            text: "Plans monitoring or contingency for risks left unfunded.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["monitor", "warning sign", "contingency", "watch", "مراقبة", "مؤشر إنذار", "خطة بديلة", "متابعة"],
          },
        ],
        redFlags: [
          {
            text: "Ranks by size of impact only.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["biggest impact first", "highest impact", "largest number", "الأثر الأكبر أولًا", "أعلى أثر", "أكبر رقم"],
          },
          {
            text: "Dismisses the regulator risk because it is only 5%.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["only 5%", "too unlikely", "won't happen", "5% فقط", "مستبعد", "لن يحدث"],
          },
          {
            text: "Proposes funding everything regardless of budget.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["fund all", "all six", "ask for more money", "تمويل الجميع", "المخاطر الست كلها"],
          },
        ],
        embeddedDetail: {
          description:
            "The table caption says R-E's impact (20,000) is per day of outage and past outages lasted 3–5 days, so the true impact is about 60,000–100,000. That makes its 6,000 rehearsal one of the best-value mitigations rather than one of the worst.",
          location: "caption of the risk register table",
          keywords: ["per day", "3 to 5 days", "3-5 days", "outage", "لكل يوم", "3 إلى 5 أيام", "التوقف"],
        },
        probeTargets: ["judgment.risk-calibration"],
        twistTargets: ["critical-thinking.quantitative-reasoning"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "rank-03-why-returns-rose",
    type: "RANKING_ALLOCATION",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 3, stakes: 3, timePressure: 3, informationGaps: 4 },
    targets: ["critical-thinking.root-cause-analysis", "judgment.deciding-under-ambiguity", "adaptability.handling-new-information"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "middle",
    content: {
      en: {
        title: "Why returns rose",
        scenario:
          "Customer returns at {{company}} have risen from 4% to almost 7% of orders over the last two months. {{manager}} wants a recommendation within a week, and your team can properly investigate only two or three explanations in that time. Colleagues have suggested six possible causes. Some evidence is in the materials, but none of it is conclusive.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Returns by reason (% of orders)",
            columns: [
              { key: "reason", label: "Reason given" },
              { key: "m1", label: "3 months ago" },
              { key: "m2", label: "2 months ago" },
              { key: "m3", label: "Last month" },
            ],
            rows: [
              { reason: "Damaged on arrival", m1: "0.8%", m2: "0.9%", m3: "1.0%" },
              { reason: "Not as described", m1: "1.0%", m2: "2.2%", m3: "3.1%" },
              { reason: "Wrong size", m1: "1.2%", m2: "1.3%", m3: "1.4%" },
              { reason: "Arrived late", m1: "0.4%", m2: "0.5%", m3: "0.5%" },
              { reason: "Changed mind", m1: "0.6%", m2: "0.7%", m3: "0.8%" },
              { reason: "Total", m1: "4.0%", m2: "5.6%", m3: "6.8%" },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "Changes in the last ten weeks",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body:
              "- 9 weeks ago: product photos updated for all items (new studio, brighter lighting and more editing).\n- 8 weeks ago: new packaging introduced for all orders.\n- 7 weeks ago: new supplier for the kitchenware line (about 15% of orders).\n- 6 weeks ago: delivery partner changed in the North region (about 20% of orders).\n- Last week: new returns policy; free returns extended from 14 to 30 days.",
          },
        ],
        task: {
          kind: "ranking",
          prompt: "Rank the six explanations in the order you would investigate them, with 1 investigated first.",
          rankItems: [
            { id: "h1", label: "The new packaging damages products in transit." },
            { id: "h2", label: "The new kitchenware supplier's quality is lower." },
            { id: "h3", label: "The updated product photos make items look different from what arrives." },
            { id: "h4", label: "The more generous returns policy makes returning easier." },
            { id: "h5", label: "The new delivery partner in the North region delivers late." },
            { id: "h6", label: "Customers order several sizes and return the extras." },
          ],
        },
        probe: {
          prompt: "For the explanation you ranked first, what result would make you drop it?",
        },
        twist: {
          change:
            "{{specialist}} reports that 'not as described' returns rose by about the same amount in every product line, including lines with no supplier change.",
          prompt: "Re-rank if needed, and explain what changed in your thinking.",
        },
      },
      ar: {
        title: "لماذا ارتفعت المرتجعات؟",
        scenario:
          "ارتفعت مرتجعات العملاء لدى {{company}} من 4% إلى نحو 7% من الطلبات خلال الشهرين الماضيين. يريد {{manager}} توصية في غضون أسبوع، ولا يستطيع فريقك أن يتقصى بجدية سوى تفسيرين أو ثلاثة في هذه المدة. وقد اقترح الزملاء ستة أسباب محتملة. تجد بعض الأدلة ضمن المواد، لكن أيًّا منها ليس حاسمًا.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "المرتجعات بحسب السبب (% من الطلبات)",
            columns: [
              { key: "reason", label: "السبب المذكور" },
              { key: "m1", label: "قبل 3 أشهر" },
              { key: "m2", label: "قبل شهرين" },
              { key: "m3", label: "الشهر الماضي" },
            ],
            rows: [
              { reason: "وصل تالفًا", m1: "0.8%", m2: "0.9%", m3: "1.0%" },
              { reason: "غير مطابق للوصف", m1: "1.0%", m2: "2.2%", m3: "3.1%" },
              { reason: "مقاس غير مناسب", m1: "1.2%", m2: "1.3%", m3: "1.4%" },
              { reason: "وصل متأخرًا", m1: "0.4%", m2: "0.5%", m3: "0.5%" },
              { reason: "عدول عن الشراء", m1: "0.6%", m2: "0.7%", m3: "0.8%" },
              { reason: "الإجمالي", m1: "4.0%", m2: "5.6%", m3: "6.8%" },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "التغييرات خلال الأسابيع العشرة الماضية",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body:
              "- قبل 9 أسابيع: تحديث صور جميع المنتجات (استوديو جديد، وإضاءة أسطع، وتعديل أكثر على الصور).\n- قبل 8 أسابيع: اعتماد تغليف جديد لجميع الطلبات.\n- قبل 7 أسابيع: مورّد جديد لخط أدوات المطبخ (نحو 15% من الطلبات).\n- قبل 6 أسابيع: تغيير شريك التوصيل في المنطقة الشمالية (نحو 20% من الطلبات).\n- الأسبوع الماضي: سياسة إرجاع جديدة؛ تمديد الإرجاع المجاني من 14 إلى 30 يومًا.",
          },
        ],
        task: {
          kind: "ranking",
          prompt: "رتّب التفسيرات الستة بحسب الترتيب الذي ستتقصاها به، بحيث يكون رقم 1 أول ما تتقصاه.",
          rankItems: [
            { id: "h1", label: "التغليف الجديد يُتلف المنتجات في أثناء النقل." },
            { id: "h2", label: "جودة منتجات المورّد الجديد لأدوات المطبخ أدنى." },
            { id: "h3", label: "الصور المحدَّثة تُظهر المنتجات بشكل يختلف عمّا يصل فعلًا." },
            { id: "h4", label: "سياسة الإرجاع الأكثر سخاءً تسهّل الإرجاع." },
            { id: "h5", label: "شريك التوصيل الجديد في المنطقة الشمالية يتأخر في التسليم." },
            { id: "h6", label: "العملاء يطلبون عدة مقاسات ويعيدون الزائد منها." },
          ],
        },
        probe: {
          prompt: "بالنسبة إلى التفسير الذي وضعته أولًا، ما النتيجة التي تجعلك تستبعده؟",
        },
        twist: {
          change: "يفيد تقرير {{specialist}} بأن مرتجعات «غير مطابق للوصف» ارتفعت بالقدر نفسه تقريبًا في كل خطوط المنتجات، ومنها خطوط لم يتغير موردها.",
          prompt: "أعد الترتيب إن لزم، واشرح ما الذي تغيّر في تفكيرك.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.root-cause-analysis",
            anchors: [
              "Ranks by gut feel, or blames customers ('they abuse returns') without using the reason data.",
              "Uses the total rise but stops at the first plausible cause without checking which reasons moved.",
              "Links the rise to 'not as described' (1.0% to 3.1%) and puts explanations that could produce it (photos, supplier) first.",
              "Separates the main driver from small contributors (damage, size), checks timing against the change log, and proposes a test for the leading cause.",
              "Points to a systemic cause, such as how product content changes are approved, that would recur elsewhere, and proposes a fix at that level.",
            ],
          },
          {
            competencyKey: "judgment.deciding-under-ambiguity",
            anchors: [
              "Refuses to rank without more data, or ranks arbitrarily without acknowledging uncertainty.",
              "Ranks but does not state the assumptions behind the order or how to check them.",
              "Ranks on the available evidence, states key assumptions, and names what each investigation should look for.",
              "Chooses investigations that best tell the leading explanations apart, deferring those that would not change the recommendation.",
              "Structures the week so the recommendation holds across likely results, with clear points to re-rank as findings arrive.",
            ],
          },
          {
            competencyKey: "adaptability.handling-new-information",
            anchors: [
              "Keeps the supplier explanation first despite evidence that the rise is in every line.",
              "Acknowledges the new evidence but makes a token change, or discards all earlier reasoning.",
              "Moves the supplier explanation down and the photo change up, explaining what a rise across all lines implies.",
              "Checks the new split is comparable (same period, same definitions) before re-ranking, and says what changed in their thinking.",
              "Updates in proportion and draws further implications, such as which photo changes to test first or another cause common to all lines.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the reason breakdown to locate the rise in 'not as described'.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["not as described", "3.1%", "reason", "tripled", "غير مطابق للوصف", "3.1%", "السبب", "تضاعف"],
          },
          {
            text: "Notices the returns policy changed only last week, after the rise began.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["policy", "last week", "too recent", "after the rise", "can't explain", "السياسة", "الأسبوع الماضي", "حديثة جدًا", "بعد الارتفاع", "لا تفسر"],
          },
          {
            text: "Notes the supplier covers only about 15% of orders, too few to explain the whole jump alone.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["15%", "only kitchenware", "one line", "too small", "خط واحد", "أدوات المطبخ فقط", "15%"],
          },
          {
            text: "Defines tests and results that would rule an explanation out.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["test", "compare", "rule out", "if we find", "اختبار", "مقارنة", "استبعاد", "إذا وجدنا"],
          },
          {
            text: "States explicitly what changed after the new evidence.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["changed my", "moves down", "re-rank", "now more likely", "غيّرت", "أعدت الترتيب", "أصبح أرجح", "ينزل"],
          },
        ],
        redFlags: [
          {
            text: "Blames customers for abusing returns.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["abusing", "fraud", "cheating", "يستغلون", "احتيال", "تحايل"],
          },
          {
            text: "Names the returns policy as the main cause despite its date.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["policy is the cause", "because of the new policy", "generous policy caused", "السياسة هي السبب", "بسبب السياسة الجديدة"],
          },
          {
            text: "Refuses to rank without more data.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["need more data before", "can't rank", "impossible to say", "لا يمكن الترتيب", "نحتاج بيانات أكثر قبل", "يستحيل القول"],
          },
        ],
        embeddedDetail: {
          description:
            "The change log shows the new returns policy started only last week, after the two-month rise had already happened, so it cannot explain most of the increase despite being a natural suspect.",
          location: "last line of {{peer}}'s change log",
          keywords: ["policy", "last week", "too recent", "السياسة", "الأسبوع الماضي"],
        },
        probeTargets: ["judgment.deciding-under-ambiguity"],
        twistTargets: ["adaptability.handling-new-information"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "rank-04-improvement-budget",
    type: "RANKING_ALLOCATION",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["management.resource-allocation", "judgment.trade-off-reasoning", "critical-thinking.evaluating-evidence"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "middle",
    content: {
      en: {
        title: "Splitting the improvement budget",
        scenario:
          "You hold next quarter's improvement budget for your department and must split it across five proposals. Each comes from a different team, and each team lead believes theirs matters most. Together they ask for 130% of the budget. {{exec}} has asked for a split that 'shows clear returns'. The proposals, their estimated benefits and how each estimate was made are in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Improvement proposals",
            columns: [
              { key: "proposal", label: "Proposal" },
              { key: "requested", label: "Requested (% of budget)", numeric: true },
              { key: "benefit", label: "Estimated yearly benefit" },
              { key: "basis", label: "Basis of estimate" },
              { key: "confidence", label: "Team's confidence" },
            ],
            rows: [
              { proposal: "Automate monthly reporting", requested: 25, benefit: "60,000 in staff time", basis: "Time logs from 12 staff over 3 months", confidence: "High" },
              { proposal: "Customer self-service portal", requested: 40, benefit: "250,000 from fewer support calls", basis: "Pilot with 9 customers over 2 weeks", confidence: "High" },
              { proposal: "Training in the new quality process", requested: 20, benefit: "80,000 from less rework", basis: "Rework records from last year", confidence: "Medium" },
              { proposal: "Replace the support team's ageing laptops", requested: 15, benefit: "Not estimated", basis: "Team reports losing 3–4 hours per person per month (20 people)", confidence: "—" },
              { proposal: "Pilot a new pricing approach with key accounts", requested: 30, benefit: "0 to 400,000 in extra revenue", basis: "Expert judgement; no data yet", confidence: "Low" },
            ],
          },
        ],
        task: {
          kind: "allocation",
          prompt: "Split 100 points across the five proposals, where each point is 1% of the budget. A proposal may get zero.",
          allocation: {
            total: 100,
            rows: [
              { id: "p1", label: "Automate monthly reporting" },
              { id: "p2", label: "Customer self-service portal" },
              { id: "p3", label: "Training in the new quality process" },
              { id: "p4", label: "Replace the support team's ageing laptops" },
              { id: "p5", label: "Pilot a new pricing approach with key accounts" },
            ],
          },
        },
        probe: {
          prompt: "What evidence would make you move 10 points from one proposal to another? Be specific.",
        },
        twist: {
          change: "{{exec}} announces that, at mid-quarter, funding will be cut by 30% for any proposal that cannot show a measurable result by then.",
          prompt: "Does your split change? How, and why?",
        },
      },
      ar: {
        title: "توزيع ميزانية التحسين",
        scenario:
          "بين يديك ميزانية التحسين لقسمك للربع القادم، وعليك توزيعها على خمسة مقترحات. يأتي كل مقترح من فريق مختلف، وكل قائد فريق يرى أن مقترحه هو الأهم. ومجموع ما تطلبه المقترحات 130% من الميزانية. وقد طلب {{exec}} توزيعًا «يُظهر عائدًا واضحًا». تجد المقترحات والفوائد المقدّرة لكل منها وطريقة إعداد كل تقدير ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "مقترحات التحسين",
            columns: [
              { key: "proposal", label: "المقترح" },
              { key: "requested", label: "المطلوب (% من الميزانية)", numeric: true },
              { key: "benefit", label: "الفائدة السنوية المقدّرة" },
              { key: "basis", label: "أساس التقدير" },
              { key: "confidence", label: "ثقة الفريق" },
            ],
            rows: [
              { proposal: "أتمتة التقارير الشهرية", requested: 25, benefit: "60,000 من وقت الموظفين", basis: "سجلات وقت 12 موظفًا على مدى 3 أشهر", confidence: "عالية" },
              { proposal: "بوابة الخدمة الذاتية للعملاء", requested: 40, benefit: "250,000 من تقليل اتصالات الدعم", basis: "تجربة مع 9 عملاء على مدى أسبوعين", confidence: "عالية" },
              { proposal: "التدريب على إجراءات الجودة الجديدة", requested: 20, benefit: "80,000 من تقليل إعادة العمل", basis: "سجلات إعادة العمل للعام الماضي", confidence: "متوسطة" },
              { proposal: "استبدال الحواسيب القديمة لفريق الدعم", requested: 15, benefit: "لم تُقدَّر", basis: "يفيد الفريق بضياع 3–4 ساعات للشخص شهريًا (20 شخصًا)", confidence: "—" },
              { proposal: "تجربة نهج تسعير جديد مع كبار العملاء", requested: 30, benefit: "من 0 إلى 400,000 إيرادات إضافية", basis: "تقدير الخبراء؛ لا بيانات بعد", confidence: "منخفضة" },
            ],
          },
        ],
        task: {
          kind: "allocation",
          prompt: "وزّع 100 نقطة على المقترحات الخمسة، علمًا بأن كل نقطة تعادل 1% من الميزانية. يمكن أن ينال مقترحٌ صفرًا.",
          allocation: {
            total: 100,
            rows: [
              { id: "p1", label: "أتمتة التقارير الشهرية" },
              { id: "p2", label: "بوابة الخدمة الذاتية للعملاء" },
              { id: "p3", label: "التدريب على إجراءات الجودة الجديدة" },
              { id: "p4", label: "استبدال الحواسيب القديمة لفريق الدعم" },
              { id: "p5", label: "تجربة نهج تسعير جديد مع كبار العملاء" },
            ],
          },
        },
        probe: {
          prompt: "ما الدليل الذي يجعلك تنقل 10 نقاط من مقترح إلى آخر؟ كن محددًا.",
        },
        twist: {
          change: "صدر إعلان من {{exec}}: تمويل أي مقترح لا يُظهر نتيجة قابلة للقياس بحلول منتصف الربع سيُخفَّض بنسبة 30%.",
          prompt: "هل يتغير توزيعك؟ كيف، ولماذا؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.resource-allocation",
            anchors: [
              "Spreads points evenly or in proportion to what each team asked for, without reference to returns.",
              "Favours the biggest headline number (the portal's 250,000) without weighing cost or the strength of the estimate.",
              "Allocates by expected return relative to cost and evidence, and states which proposals are under-funded and what that means.",
              "Compares the expected return of alternative splits and keeps a reserve or staged release for uncertain proposals.",
              "Uses staged funding (e.g., a larger portal pilot first) so money follows results, and accounts for the cost of starting and stopping work.",
            ],
          },
          {
            competencyKey: "judgment.trade-off-reasoning",
            anchors: [
              "Presents the split as obvious, with no mention of what is given up.",
              "Lists pros and cons of proposals but does not explain why the final split balances them.",
              "Explains what each allocation gains and costs (e.g., certain small savings versus uncertain large upside) and why the balance is acceptable.",
              "Makes criteria explicit (return, strength of evidence, reversibility, {{exec}}'s 'clear returns'), weights them, and names what would change the split.",
              "Reduces the trade-off by sequencing, e.g., funding a proper test now with further money released on measured results.",
            ],
          },
          {
            competencyKey: "critical-thinking.evaluating-evidence",
            anchors: [
              "Takes every team's estimate and confidence rating at face value.",
              "Doubts some estimates without a clear basis, or treats all bases (time logs, a 9-customer pilot, expert judgement) as equal.",
              "Weighs estimates by their basis and favours those built on stronger evidence, noting the portal rests on a 9-customer, 2-week pilot.",
              "Names specific weaknesses (tiny sample, self-rated confidence, no data for pricing) and says what evidence would change the allocation.",
              "Sees the portal estimate drives most of the claimed return, tests its plausibility (e.g., against support call volumes), and sets confidence accordingly.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices the portal's large benefit rests on a 9-customer, 2-week pilot.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["9 customers", "two weeks", "2 weeks", "small pilot", "sample", "9 عملاء", "أسبوعين", "عينة صغيرة", "تجربة صغيرة"],
          },
          {
            text: "Distinguishes the strength of the different evidence bases.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["time logs", "rework records", "expert judgement", "no data", "self-rated", "سجلات الوقت", "سجلات إعادة العمل", "تقدير الخبراء", "لا بيانات"],
          },
          {
            text: "Uses staged or conditional funding for uncertain proposals.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["stage", "phase", "release", "test first", "on results", "مراحل", "مرحليًا", "اختبار أولًا", "بناءً على النتائج"],
          },
          {
            text: "Puts a value on the laptop proposal from the hours lost.",
            competencyKey: "management.resource-allocation",
            keywords: ["hours", "840", "60 to 80 hours", "lost time", "per month", "ساعات", "الوقت الضائع", "شهريًا", "840"],
          },
        ],
        redFlags: [
          {
            text: "Splits evenly to be fair to all teams.",
            competencyKey: "management.resource-allocation",
            keywords: ["20 each", "equally", "evenly", "fair share", "بالتساوي", "20 لكل", "حصة عادلة"],
          },
          {
            text: "Funds the biggest claimed benefit without questioning it.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["250,000 is the biggest", "highest benefit", "biggest return", "الأعلى عائدًا", "أكبر فائدة"],
          },
          {
            text: "Treats estimates as certain.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["guaranteed", "certain", "definitely", "مضمون", "مؤكد", "بالتأكيد"],
          },
        ],
        embeddedDetail: {
          description:
            "The portal's 250,000 benefit, by far the largest, is based on a pilot with only 9 customers over 2 weeks, yet the team rates its confidence as High.",
          location: "'Basis of estimate' cell of the self-service portal row",
          keywords: ["9 customers", "2 weeks", "pilot", "9 عملاء", "أسبوعين"],
        },
        probeTargets: ["critical-thinking.evaluating-evidence"],
        twistTargets: ["judgment.trade-off-reasoning"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "rank-05-staffing-the-recovery",
    type: "RANKING_ALLOCATION",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 4, informationGaps: 3 },
    targets: ["management.delegation", "adaptability.composure-under-pressure", "judgment.trade-off-reasoning"],
    roleFamilies: [],
    minutes: 5,
    storyPhase: "middle",
    content: {
      en: {
        title: "Staffing the recovery",
        scenario:
          "A data error at {{company}} has sent wrong statements to about 3,000 customers. It is Monday morning. {{exec}} wants every affected customer contacted and corrected within 10 working days. Your team still has its normal work: a quarterly report due to {{client}} on Friday and the daily queue. Your team of six has 60 person-days over the next two weeks. The team list and {{specialist}}'s effort estimates are in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Your team for the next two weeks",
            columns: [
              { key: "person", label: "Person" },
              { key: "strengths", label: "Strengths" },
              { key: "days", label: "Days available", numeric: true },
              { key: "notes", label: "Notes" },
            ],
            rows: [
              { person: "{{report1}}", strengths: "Data analysis; knows the statement system well", days: 10, notes: "Approved leave on Thursday and Friday of week 2" },
              { person: "{{report2}}", strengths: "Patient and clear with customers; slower with data", days: 10, notes: "" },
              { person: "Analyst A", strengths: "Data analysis; new to the statement system", days: 10, notes: "" },
              { person: "Analyst B", strengths: "Reporting; prepared the last two {{client}} reports", days: 10, notes: "" },
              { person: "Support specialist C", strengths: "Customer calls; daily queue", days: 10, notes: "" },
              { person: "Support specialist D", strengths: "Customer calls; daily queue", days: 10, notes: "" },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "Effort estimates",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            date: "Monday, 08:00",
            body:
              "- About 2,600 customers can be corrected with a bulk adjustment and a standard letter: about 3 person-days to prepare and check.\n- About 400 customers have complex accounts and need a personal call: around 30 minutes each, so roughly 27 person-days.\n- Finding and fixing the cause: about 8 person-days. It needs someone who knows the statement system.\n- The {{client}} quarterly report usually takes 8 person-days.\n- The daily queue needs about 1 person-day per working day.",
          },
        ],
        task: {
          kind: "allocation",
          prompt: "Allocate the 60 person-days across the workstreams. Put any days you want to keep unassigned into 'Buffer'.",
          allocation: {
            total: 60,
            rows: [
              { id: "w1", label: "Customer contact and corrections" },
              { id: "w2", label: "Finding and fixing the cause of the error" },
              { id: "w3", label: "Quarterly report for {{client}} (due Friday)" },
              { id: "w4", label: "Daily queue" },
              { id: "w5", label: "Buffer (unassigned)" },
            ],
          },
        },
        probe: {
          prompt: "Write the short message you send to the person you put in charge of customer contact.",
        },
        twist: {
          change: "Wednesday: {{specialist}} finds that the error also affected another 1,200 customers, most of them simple cases.",
          prompt: "How do you change the allocation, and what do you tell {{exec}} and {{client}}?",
        },
      },
      ar: {
        title: "توزيع الفريق على التعافي",
        scenario:
          "تسبّب خطأ في البيانات لدى {{company}} في إرسال كشوف حساب خاطئة إلى نحو 3,000 عميل. نحن صباح الاثنين، والمطلوب بحسب {{exec}} التواصل مع كل عميل متأثر وتصحيح وضعه خلال 10 أيام عمل. وما زال على فريقك عمله المعتاد: تقرير ربعي مستحق لـ{{client}} يوم الجمعة، وقائمة الطلبات اليومية. لدى فريقك المكوَّن من ستة أشخاص 60 يوم عمل خلال الأسبوعين القادمين. تجد قائمة الفريق وتقديرات الجهد التي أعدّها {{specialist}} ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "فريقك خلال الأسبوعين القادمين",
            columns: [
              { key: "person", label: "الشخص" },
              { key: "strengths", label: "نقاط القوة" },
              { key: "days", label: "الأيام المتاحة", numeric: true },
              { key: "notes", label: "ملاحظات" },
            ],
            rows: [
              { person: "{{report1}}", strengths: "تحليل البيانات؛ معرفة جيدة بنظام الكشوف", days: 10, notes: "إجازة معتمدة يومي الخميس والجمعة من الأسبوع الثاني" },
              { person: "{{report2}}", strengths: "صبر ووضوح مع العملاء؛ أبطأ في التعامل مع البيانات", days: 10, notes: "" },
              { person: "المحلل أ", strengths: "تحليل البيانات؛ حديث العهد بنظام الكشوف", days: 10, notes: "" },
              { person: "المحلل ب", strengths: "إعداد التقارير؛ أعدّ آخر تقريرين لـ{{client}}", days: 10, notes: "" },
              { person: "اختصاصي الدعم ج", strengths: "اتصالات العملاء؛ قائمة الطلبات اليومية", days: 10, notes: "" },
              { person: "اختصاصي الدعم د", strengths: "اتصالات العملاء؛ قائمة الطلبات اليومية", days: 10, notes: "" },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "تقديرات الجهد",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            date: "الاثنين، 08:00",
            body:
              "- نحو 2,600 عميل يمكن تصحيح أوضاعهم بتعديل جماعي ورسالة موحّدة: نحو 3 أيام عمل للإعداد والتدقيق.\n- نحو 400 عميل لديهم حسابات معقدة ويحتاجون إلى اتصال شخصي: قرابة 30 دقيقة لكل منهم، أي نحو 27 يوم عمل.\n- تحديد سبب الخطأ وإصلاحه: نحو 8 أيام عمل، ويحتاج إلى شخص يعرف نظام الكشوف.\n- يستغرق التقرير الربعي لـ{{client}} عادةً 8 أيام عمل.\n- تحتاج قائمة الطلبات اليومية إلى نحو يوم عمل واحد عن كل يوم.",
          },
        ],
        task: {
          kind: "allocation",
          prompt: "وزّع أيام العمل الستين على مسارات العمل. ضع أي أيام تريد إبقاءها دون تخصيص في خانة «الاحتياطي».",
          allocation: {
            total: 60,
            rows: [
              { id: "w1", label: "التواصل مع العملاء وتصحيح أوضاعهم" },
              { id: "w2", label: "تحديد سبب الخطأ وإصلاحه" },
              { id: "w3", label: "التقرير الربعي لـ{{client}} (مستحق يوم الجمعة)" },
              { id: "w4", label: "قائمة الطلبات اليومية" },
              { id: "w5", label: "الاحتياطي (غير مخصص)" },
            ],
          },
        },
        probe: {
          prompt: "اكتب الرسالة القصيرة التي ترسلها إلى الشخص الذي كلّفته بمسؤولية التواصل مع العملاء.",
        },
        twist: {
          change: "يوم الأربعاء يتبيّن لـ{{specialist}} أن الخطأ أصاب أيضًا 1,200 عميل آخرين، معظم حالاتهم بسيطة.",
          prompt: "كيف تعدّل التوزيع، وماذا تقول لـ{{exec}} و{{client}}؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.delegation",
            anchors: [
              "Assigns people without regard to strengths (e.g., {{report2}} on the root cause), or keeps all coordination to themselves.",
              "Matches people sensibly but leaves outcome, deadline or authority unclear for each workstream lead.",
              "Matches work to strengths and capacity ({{report1}} on the cause, {{report2}} on calls, Analyst B on the report) and states outcomes and authority.",
              "Sets check-ins matched to risk (daily numbers for customer contact) and plans around {{report1}}'s leave without pulling work back.",
              "Spreads critical knowledge, e.g., pairs Analyst A with {{report1}} on the statement system, so the team does not depend on one person.",
            ],
          },
          {
            competencyKey: "adaptability.composure-under-pressure",
            anchors: [
              "Allocates impulsively (everyone on calls) or abandons the {{client}} report and queue without thought.",
              "Acts quickly but loses an important detail, such as {{report1}}'s leave or the need to fix the cause.",
              "Keeps a clear priority order (stop the error, correct customers, keep committed work) and handles the most urgent first.",
              "Separates what must happen this week from what can slip, communicates calmly with {{exec}} and {{client}}, and keeps checks on corrections.",
              "Steadies the team with short daily targets and clear next steps, and plans recovery for any slipped work once corrections are done.",
            ],
          },
          {
            competencyKey: "judgment.trade-off-reasoning",
            anchors: [
              "Fills all 60 days with no buffer and no mention of what suffers.",
              "Notes some work will suffer but does not weigh which or why.",
              "Explains what each allocation costs (slower queue, report at risk) and why that is acceptable.",
              "Makes criteria explicit (customer harm, contractual dates, recurrence of the error) and names what would change the split.",
              "Reduces the trade-off: bulk letters for simple cases, fixing the cause first to stop new errors, or asking {{client}} early for a short extension.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices {{report1}}'s leave, so real capacity is 58 days and the system expert is away late in week 2.",
            competencyKey: "management.delegation",
            keywords: ["leave", "thursday", "58", "only 8 days", "away", "إجازة", "الخميس", "58", "8 أيام فقط", "غياب"],
          },
          {
            text: "Uses {{specialist}}'s estimates to size the workstreams.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["30 days", "27", "bulk", "400 customers", "56", "يوم عمل", "27", "التعديل الجماعي", "400 عميل", "56"],
          },
          {
            text: "Fixes the cause early so the error does not keep happening.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["root cause", "stop the error", "fix first", "recurrence", "السبب", "إيقاف الخطأ", "أولًا", "تكرار"],
          },
          {
            text: "Gives workstream leads clear ownership and daily check-ins.",
            competencyKey: "management.delegation",
            keywords: ["in charge", "owner", "daily", "report back", "مسؤول", "يوميًا", "يبلغني", "متابعة يومية"],
          },
          {
            text: "Warns {{client}} or {{exec}} early about any slippage.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["early", "extension", "inform the client", "heads-up", "مبكرًا", "تمديد", "إبلاغ العميل", "تنبيه"],
          },
        ],
        redFlags: [
          {
            text: "Puts everyone on calls and relies on overtime.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["everyone on calls", "all hands", "overtime", "weekends", "الجميع على الاتصالات", "ساعات إضافية", "عطلة نهاية الأسبوع"],
          },
          {
            text: "Ignores the cause of the error.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["fix later", "just call everyone", "cause can wait", "نصلح لاحقًا", "السبب يمكن أن ينتظر"],
          },
          {
            text: "Takes the work on personally instead of delegating.",
            competencyKey: "management.delegation",
            keywords: ["i'll handle it all", "do it myself", "سأتولى كل شيء", "بنفسي"],
          },
        ],
        embeddedDetail: {
          description:
            "{{report1}} is listed with 10 available days, but the notes show approved leave on Thursday and Friday of week 2, so real capacity is 58 person-days, and the only person who knows the statement system is away for part of the recovery. The estimates total about 56 days, leaving almost no buffer.",
          location: "{{report1}}'s notes cell in the team table",
          keywords: ["leave", "thursday", "58", "8 days", "إجازة", "الخميس", "58"],
        },
        probeTargets: ["management.delegation"],
        twistTargets: ["adaptability.composure-under-pressure"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "rank-06-where-your-time-goes",
    type: "RANKING_ALLOCATION",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 3, stakes: 2, timePressure: 2, informationGaps: 2 },
    targets: ["management.performance-management", "judgment.trade-off-reasoning"],
    roleFamilies: [],
    minutes: 4,
    storyPhase: "middle",
    content: {
      en: {
        title: "Where your time goes",
        scenario:
          "Next month you have about 100 hours outside your fixed meetings, and five things compete for them. {{report2}}'s work has slipped since a team change three months ago. {{manager}} wants progress on a process redesign you lead. {{client}} keeps calling you directly with small problems. Two open roles on your team need filling. And {{report1}} has asked for your help preparing for a promotion panel. {{report2}}'s recent record and your notes from last month are in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "{{report2}}'s work, last four months",
            columns: [
              { key: "month", label: "Month" },
              { key: "completed", label: "Tasks completed", numeric: true },
              { key: "returned", label: "Returned for errors", numeric: true },
              { key: "notes", label: "Notes" },
            ],
            rows: [
              { month: "Month 1", completed: 22, returned: 2, notes: "" },
              { month: "Month 2", completed: 19, returned: 6, notes: "Took over {{peer}}'s former accounts after the team change" },
              { month: "Month 3", completed: 17, returned: 7, notes: "" },
              { month: "Month 4 (last month)", completed: 20, returned: 2, notes: "Worked alongside {{report1}} for two weeks" },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "My notes on last month",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "- {{client}} called me 14 times (about 9 hours in total). Most questions could have been answered by the account team.\n- Hiring: 60 applications are waiting to be screened. The roles have been open for 7 weeks and the team is covering the gap with overtime.\n- Redesign: {{manager}} expects a first draft in 6 weeks. I estimate 40 hours to get there.\n- {{report1}}'s promotion panel is in 5 weeks.",
          },
        ],
        task: {
          kind: "allocation",
          prompt: "Split 100 points across the five, where each point is one hour of your time next month.",
          allocation: {
            total: 100,
            rows: [
              { id: "t1", label: "Supporting {{report2}}'s performance" },
              { id: "t2", label: "Process redesign for {{manager}}" },
              { id: "t3", label: "Handling {{client}}'s direct calls" },
              { id: "t4", label: "Hiring for the two open roles" },
              { id: "t5", label: "Helping {{report1}} prepare for the promotion panel" },
            ],
          },
        },
        probe: {
          prompt: "What exactly will you do in your first conversation with {{report2}} next week?",
        },
        twist: {
          change: "{{exec}} asks you to join a cross-company project that would take 30 hours of your month.",
          prompt: "Do you accept? If so, how does your split change, and who do you tell?",
        },
      },
      ar: {
        title: "أين يذهب وقتك؟",
        scenario:
          "لديك الشهر القادم نحو 100 ساعة خارج اجتماعاتك الثابتة، وتتنافس عليها خمسة أمور. فقد تراجع عمل {{report2}} منذ تغيير في الفريق قبل ثلاثة أشهر. ويريد {{manager}} تقدمًا في مشروع إعادة تصميم إجراءات تقوده. ولا تنقطع اتصالات {{client}} المباشرة بك بشأن مشكلات صغيرة. وفي فريقك وظيفتان شاغرتان تحتاجان إلى تعيين. كما تلقيتَ من {{report1}} طلب مساعدة في الاستعداد لمقابلة ترقية. تجد سجل عمل {{report2}} الأخير وملاحظاتك عن الشهر الماضي ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "عمل {{report2}} خلال الأشهر الأربعة الماضية",
            columns: [
              { key: "month", label: "الشهر" },
              { key: "completed", label: "المهام المنجزة", numeric: true },
              { key: "returned", label: "المعادة بسبب أخطاء", numeric: true },
              { key: "notes", label: "ملاحظات" },
            ],
            rows: [
              { month: "الشهر 1", completed: 22, returned: 2, notes: "" },
              { month: "الشهر 2", completed: 19, returned: 6, notes: "تسلُّم حسابات {{peer}} السابقة بعد تغيير الفريق" },
              { month: "الشهر 3", completed: 17, returned: 7, notes: "" },
              { month: "الشهر 4 (الماضي)", completed: 20, returned: 2, notes: "العمل جنبًا إلى جنب مع {{report1}} لمدة أسبوعين" },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "ملاحظاتي عن الشهر الماضي",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "- اتصل بي {{client}} 14 مرة (نحو 9 ساعات إجمالًا). وكان بإمكان فريق الحسابات الإجابة عن معظم الأسئلة.\n- التعيين: 60 طلب توظيف بانتظار الفرز. الوظيفتان شاغرتان منذ 7 أسابيع، ويسد الفريق النقص بساعات عمل إضافية.\n- إعادة التصميم: ينتظر {{manager}} مسودة أولى بعد 6 أسابيع، وأقدّر أنها تحتاج إلى 40 ساعة.\n- مقابلة الترقية الخاصة بـ{{report1}} بعد 5 أسابيع.",
          },
        ],
        task: {
          kind: "allocation",
          prompt: "وزّع 100 نقطة على الأمور الخمسة، علمًا بأن كل نقطة تعادل ساعة من وقتك الشهر القادم.",
          allocation: {
            total: 100,
            rows: [
              { id: "t1", label: "دعم أداء {{report2}}" },
              { id: "t2", label: "إعادة تصميم الإجراءات لصالح {{manager}}" },
              { id: "t3", label: "التعامل مع اتصالات {{client}} المباشرة" },
              { id: "t4", label: "التعيين في الوظيفتين الشاغرتين" },
              { id: "t5", label: "مساعدة {{report1}} في الاستعداد لمقابلة الترقية" },
            ],
          },
        },
        probe: {
          prompt: "ماذا ستفعل تحديدًا في أول حديث لك مع {{report2}} الأسبوع القادم؟",
        },
        twist: {
          change: "يصلك طلب من {{exec}} للانضمام إلى مشروع على مستوى الشركة يستهلك 30 ساعة من شهرك.",
          prompt: "هل تقبل؟ وإن قبلت، كيف يتغير توزيعك، ومن تُبلغ؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.performance-management",
            anchors: [
              "Gives {{report2}} no time, or plans to warn them about consequences without asking why the work slipped.",
              "Plans to discuss {{report2}}'s performance in general terms, without specific examples or agreed next steps.",
              "Plans a conversation using the error figures, explores causes (the inherited accounts), and agrees expectations and a follow-up date.",
              "Distinguishes workload and unfamiliar accounts from motivation, builds on the improvement while paired with {{report1}}, and recognises what {{report2}} does well.",
              "Checks whether team conditions (the account handover after the team change) caused the slip, and fixes those as well as {{report2}}'s part.",
            ],
          },
          {
            competencyKey: "judgment.trade-off-reasoning",
            anchors: [
              "Splits time evenly or by habit, with no mention of what gets less.",
              "Notes some things get less time but does not weigh the consequences.",
              "Explains what each allocation gains and costs (e.g., fewer client calls handled personally, slower hiring) and why that is acceptable.",
              "States criteria (team capability, {{manager}}'s deadline, the overtime cost of open roles) and what would change the split.",
              "Reduces the trade-off, e.g., routes {{client}}'s calls to the account team, or has {{report1}} coach {{report2}} as part of promotion preparation.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices errors fell back to 2 when {{report2}} worked alongside {{report1}}.",
            competencyKey: "management.performance-management",
            keywords: ["alongside", "paired", "pairing", "errors dropped", "month 4", "جنبًا إلى جنب", "العمل المشترك", "انخفضت الأخطاء", "الشهر 4"],
          },
          {
            text: "Links the slip to the inherited accounts rather than to motivation.",
            competencyKey: "management.performance-management",
            keywords: ["took over", "inherited", "former accounts", "workload", "team change", "تسلّم", "الحسابات السابقة", "عبء العمل", "تغيير الفريق"],
          },
          {
            text: "Redirects {{client}}'s routine calls to the account team.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["account team", "redirect", "route", "delegate", "فريق الحسابات", "تحويل", "تفويض", "توجيه الاتصالات"],
          },
          {
            text: "Combines {{report1}}'s development with support for {{report2}}.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["coach", "mentor", "promotion", "both", "يدرّب", "يوجّه", "الترقية", "كليهما"],
          },
        ],
        redFlags: [
          {
            text: "Treats {{report2}}'s slip as a motivation problem requiring a warning.",
            competencyKey: "management.performance-management",
            keywords: ["warning", "final chance", "lazy", "not trying", "إنذار", "فرصة أخيرة", "متكاسل", "لا يبذل جهدًا"],
          },
          {
            text: "Splits time evenly.",
            competencyKey: "judgment.trade-off-reasoning",
            keywords: ["20 each", "equally", "evenly", "بالتساوي", "20 لكل"],
          },
          {
            text: "Leaves {{report2}} without support.",
            competencyKey: "management.performance-management",
            keywords: ["no time for", "they need to sort it", "not my priority", "لا وقت لـ", "عليه أن يتدبر", "ليس من أولوياتي"],
          },
        ],
        embeddedDetail: {
          description:
            "{{report2}}'s returned-for-error count jumped after taking over {{peer}}'s former accounts (month 2) and fell back to 2 in month 4 while working alongside {{report1}}, pointing to unfamiliar workload rather than motivation, and to pairing as a cheap remedy.",
          location: "notes column for months 2 and 4 in {{report2}}'s work table",
          keywords: ["alongside", "took over", "month 4", "month 2", "جنبًا إلى جنب", "تسلّم", "الشهر 4"],
        },
        probeTargets: ["management.performance-management"],
        twistTargets: ["judgment.trade-off-reasoning"],
      },
    },
  },
];
