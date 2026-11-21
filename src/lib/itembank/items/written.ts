import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  // ───────────────────────────── wr-01 ─────────────────────────────
  {
    id: "wr-01-executive-summary",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 2, stakes: 4, timePressure: 3, informationGaps: 3 },
    targets: ["communication.clarity-structure", "communication.adapting-to-audience", "critical-thinking.evaluating-evidence"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "middle",
    content: {
      en: {
        title: "The pilot summary",
        scenario:
          "{{company}} ran a 6-week pilot of a new shift-scheduling tool at 3 of its 12 sites to reduce overtime. {{exec}} must decide next week whether to roll it out to all 12 sites, at a licence cost of 8,000 per site per year. {{exec}} reads summaries on a phone between meetings and has asked you for one that supports the decision. The project memo and the results table are attached.",
        materials: [
          {
            kind: "memo",
            id: "project-memo",
            title: "Pilot project memo",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body:
              "The pilot was a clear success. Across the 3 sites, overtime fell by an average of 27%. Staff feedback was mostly positive, though some team leaders found the tool slow to learn in the first 2 weeks. Average overtime cost is 30 per hour. We recommend immediate rollout to all 12 sites.",
          },
          {
            kind: "table",
            id: "results",
            title: "Pilot results by site (overtime hours per month)",
            caption: "East started 4 weeks late; its 2 live weeks fell in the annual low season.",
            columns: [
              { key: "site", label: "Site" },
              { key: "weeks", label: "Weeks live", numeric: true },
              { key: "before", label: "Before pilot", numeric: true },
              { key: "during", label: "During pilot", numeric: true },
              { key: "change", label: "Change" },
            ],
            rows: [
              { site: "North", weeks: 6, before: 1200, during: 984, change: "-18%" },
              { site: "Central", weeks: 6, before: 1500, during: 1170, change: "-22%" },
              { site: "East", weeks: 2, before: 900, during: 531, change: "-41%" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the summary for {{exec}} in no more than 150 words.",
          written: { format: "memo", placeholder: "To: {{exec}}\nSubject: Scheduling tool pilot: rollout decision" },
        },
        probe: { prompt: "{{exec}} replies: 'Just give me one number I can quote to the board.' Which number do you give, and why?" },
        twist: {
          change: "{{report1}} tells you that Central used extra temporary staff for 3 of its 6 pilot weeks, which also reduced overtime.",
          prompt: "What changes in your summary? Rewrite the recommendation in no more than 3 sentences.",
        },
      },
      ar: {
        title: "ملخص التجربة",
        scenario:
          "أجرت {{company}} تجربة مدتها 6 أسابيع لأداة جديدة لجدولة المناوبات في 3 من مواقعها الـ12 بهدف خفض العمل الإضافي. يجب أن يقرر {{exec}} الأسبوع القادم تعميم الأداة على المواقع الـ12 كلها أو عدمه، بتكلفة ترخيص قدرها 8,000 لكل موقع سنويًا. يقرأ {{exec}} الملخصات على الهاتف بين الاجتماعات، وقد طلب منك ملخصًا يعينه على اتخاذ القرار. مرفق مذكرة المشروع وجدول النتائج.",
        materials: [
          {
            kind: "memo",
            id: "project-memo",
            title: "مذكرة مشروع التجربة",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body:
              "حققت التجربة نجاحًا واضحًا، إذ انخفض العمل الإضافي في المواقع الثلاثة بمتوسط 27%. كانت آراء الموظفين إيجابية في معظمها، وإن وجد بعض قادة الفرق أن تعلّم الأداة كان بطيئًا في الأسبوعين الأولين. متوسط تكلفة ساعة العمل الإضافي 30. نوصي بالتعميم الفوري على المواقع الـ12 كلها.",
          },
          {
            kind: "table",
            id: "results",
            title: "نتائج التجربة بحسب الموقع (ساعات العمل الإضافي شهريًا)",
            caption: "بدأ موقع الشرق متأخرًا 4 أسابيع، ووقع أسبوعا التشغيل فيه في موسم الركود السنوي.",
            columns: [
              { key: "site", label: "الموقع" },
              { key: "weeks", label: "أسابيع التشغيل", numeric: true },
              { key: "before", label: "قبل التجربة", numeric: true },
              { key: "during", label: "في أثناء التجربة", numeric: true },
              { key: "change", label: "التغيّر" },
            ],
            rows: [
              { site: "الشمال", weeks: 6, before: 1200, during: 984, change: "-18%" },
              { site: "الوسط", weeks: 6, before: 1500, during: 1170, change: "-22%" },
              { site: "الشرق", weeks: 2, before: 900, during: 531, change: "-41%" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب الملخص الموجّه إلى {{exec}} في 150 كلمة على الأكثر.",
          written: { format: "memo", placeholder: "إلى: {{exec}}\nالموضوع: تجربة أداة الجدولة: قرار التعميم" },
        },
        probe: { prompt: "ردّ {{exec}}: «أعطني رقمًا واحدًا فقط أستطيع ذكره أمام مجلس الإدارة.» أي رقم تقدّمه، ولماذا؟" },
        twist: {
          change: "أبلغك {{report1}} أن موقع الوسط استعان بموظفين مؤقتين إضافيين في 3 من أسابيع التجربة الستة، وهذا أسهم أيضًا في خفض العمل الإضافي.",
          prompt: "ما الذي يتغيّر في ملخصك؟ أعد كتابة التوصية في 3 جمل على الأكثر.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.clarity-structure",
            anchors: [
              "The recommendation is missing or buried after a long description of the pilot.",
              "States a recommendation but mixes it with detail {{exec}} does not need, such as site-by-site narrative.",
              "Leads with the recommendation, then 2 or 3 supporting points in a logical order, in plain words.",
              "Cuts everything {{exec}} does not need, states the decision requested, and would read easily on a phone.",
              "Distils the case into a few points that make the decision clear and answers in advance the questions on cost and reliability.",
            ],
          },
          {
            competencyKey: "communication.adapting-to-audience",
            anchors: [
              "Writes for a project team: tool features, training detail or jargon, with no business impact.",
              "Keeps an executive tone but includes operational detail or omits the cost and savings {{exec}} needs.",
              "Selects the figures that matter to {{exec}}: the overtime change, licence cost and savings.",
              "Frames the summary around {{exec}}'s decision: rollout cost against savings, risk, and what is asked of {{exec}}.",
              "Anticipates how the board will read the headline figure and words it so it will not be challenged later.",
            ],
          },
          {
            competencyKey: "critical-thinking.evaluating-evidence",
            anchors: [
              "Repeats the 27% average without noticing that East ran only 2 weeks in the low season.",
              "Mentions that the sites differ but still quotes 27% as the headline result.",
              "Flags East as unreliable and uses the full-run sites, about 20%, as the realistic estimate.",
              "Explains why about 20% is more defensible, checks the decision still holds at that figure, and states the main remaining uncertainty.",
              "As level 4, and proposes how to firm up the estimate during rollout, such as tracking East over a full season.",
            ],
          },
          {
            competencyKey: "adaptability.handling-new-information",
            anchors: [
              "Ignores the temporary staff information or keeps the summary unchanged.",
              "Notes the new information but does not say how it changes the estimate or recommendation.",
              "Revises the estimate down and says plainly that Central's result is partly explained by temporary staff.",
              "Re-tests the recommendation on weaker evidence, such as North alone at 18%, and adjusts confidence and the rollout plan.",
              "As level 4, and proposes a staged rollout with measurement that would settle the remaining doubt quickly.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Flags that East ran only 2 weeks in the low season and excludes or discounts it.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["east", "2 weeks", "low season", "exclude", "الشرق", "أسبوعين", "موسم الركود", "استبعاد"],
          },
          {
            text: "Uses about 20% from the full-run sites instead of 27%.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["20%", "18%", "22%", "full 6 weeks", "6 أسابيع كاملة", "نحو 20%"],
          },
          {
            text: "Leads with a clear recommendation and the decision needed.",
            competencyKey: "communication.clarity-structure",
            keywords: ["recommend", "decision", "approve", "أوصي", "القرار", "الموافقة"],
          },
          {
            text: "Compares the licence cost with the overtime savings.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["8,000", "licence", "license", "savings", "per site", "الترخيص", "التوفير", "لكل موقع"],
          },
        ],
        redFlags: [
          {
            text: "Quotes the 27% average as the headline without qualification.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["average of 27%", "27% across", "clear success", "بمتوسط 27%", "نجاح واضح"],
          },
          {
            text: "Describes the tool's features or training in detail.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["features", "interface", "training sessions", "الميزات", "الواجهة", "جلسات التدريب"],
          },
          {
            text: "Opens with background on the pilot before any recommendation.",
            competencyKey: "communication.clarity-structure",
            keywords: ["background", "the pilot started", "خلفية", "بدأت التجربة"],
          },
        ],
        embeddedDetail: {
          description:
            "The caption says East started 4 weeks late and its 2 live weeks fell in the low season, so its -41% inflates the memo's 27% average; the two full-run sites show about 20%.",
          location: "caption of the pilot results table",
          keywords: ["east", "low season", "2 weeks", "started late", "الشرق", "موسم الركود", "أسبوعا", "متأخرًا"],
        },
        probeTargets: ["critical-thinking.evaluating-evidence"],
        twistTargets: ["adaptability.handling-new-information"],
      },
    },
  },
  // ───────────────────────────── wr-02 ─────────────────────────────
  {
    id: "wr-02-bad-news-to-client",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 3,
    dials: { ambiguity: 2, stakeholders: 3, conflictingConstraints: 3, stakes: 4, timePressure: 3, informationGaps: 2 },
    targets: ["communication.written-communication", "collaboration.empathy", "leadership.ownership"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "middle",
    content: {
      en: {
        title: "The delayed order",
        scenario:
          "You manage {{client}}'s account at {{company}}, which is supplying 500 custom display units for the client's new stores. Delivery was promised for the 14th. Yesterday a batch of components failed {{company}}'s own quality test, and the full order will now arrive on the 21st. The client does not know yet. You must write to {{client}} today. The message from {{specialist}} and the client's order confirmation are attached.",
        materials: [
          {
            kind: "email",
            id: "quality",
            title: "Email from {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "Quality failure: display units",
            sentAt: "Yesterday 16:20",
            body:
              "A batch of hinges from our supplier failed the load test, so we cannot ship the units built with them. Replacement hinges arrive on the 17th, and we can complete and ship all 500 by the 21st. We can ship 300 units, already built with good hinges from the earlier batch, by the 15th.",
          },
          {
            kind: "email",
            id: "confirmation",
            title: "Order confirmation from {{client}}",
            from: { name: "{{client}}", role: "{{client.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "Re: Order confirmation",
            sentAt: "3 weeks ago",
            body: "Thanks, confirmed: 500 units, delivery on the 14th. Our installers are booked from the 15th.",
            footnote: "PS: our launch event at the flagship store is on the 18th, and it needs 120 units installed.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the email to {{client}}.",
          written: { format: "email", placeholder: "To: {{client}}\nSubject:" },
        },
        probe: { prompt: "What do you expect {{client}} to feel when reading your email, and what in your email responds to that?" },
        twist: {
          change: "{{client}} replies asking for a 15% discount for the delay. You can approve up to 5% without {{manager}}.",
          prompt: "Write your reply.",
        },
      },
      ar: {
        title: "الطلب المتأخر",
        scenario:
          "تدير حساب {{client}} في {{company}}، التي تورّد 500 وحدة عرض مصممة خصيصًا لمتاجر العميل الجديدة. كان التسليم موعودًا يوم 14. أمس أخفقت دفعة من المكونات في اختبار الجودة الذي تجريه {{company}}، وسيصل الطلب كاملًا الآن يوم 21. لا يعلم العميل بذلك بعد، وعليك أن تكتب إلى {{client}} اليوم. مرفق رسالة {{specialist}} وتأكيد الطلب من العميل.",
        materials: [
          {
            kind: "email",
            id: "quality",
            title: "رسالة من {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "إخفاق في الجودة: وحدات العرض",
            sentAt: "أمس 16:20",
            body:
              "أخفقت دفعة من المفصلات الواردة من مورّدنا في اختبار التحمّل، فلا يمكننا شحن الوحدات المصنوعة بها. تصل مفصلات بديلة يوم 17، ونستطيع إكمال الوحدات الـ500 كلها وشحنها بحلول يوم 21. ويمكننا شحن 300 وحدة مصنوعة أصلًا بمفصلات سليمة من الدفعة السابقة بحلول يوم 15.",
          },
          {
            kind: "email",
            id: "confirmation",
            title: "تأكيد الطلب من {{client}}",
            from: { name: "{{client}}", role: "{{client.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "رد: تأكيد الطلب",
            sentAt: "قبل 3 أسابيع",
            body: "شكرًا، مؤكد: 500 وحدة، والتسليم يوم 14. فرق التركيب لدينا محجوزة اعتبارًا من يوم 15.",
            footnote: "ملاحظة: حفل الإطلاق في متجرنا الرئيسي يوم 18، ويحتاج إلى تركيب 120 وحدة.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب الرسالة إلى {{client}}.",
          written: { format: "email", placeholder: "إلى: {{client}}\nالموضوع:" },
        },
        probe: { prompt: "ما الذي تتوقع أن يشعر به {{client}} عند قراءة رسالتك، وما الذي يتجاوب مع ذلك في رسالتك؟" },
        twist: {
          change: "ردّ {{client}} طالبًا خصمًا بنسبة 15% تعويضًا عن التأخير. يمكنك الموافقة على خصم يصل إلى 5% دون الرجوع إلى {{manager}}.",
          prompt: "اكتب ردّك.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.written-communication",
            anchors: [
              "Omits the new date, hides the delay mid-message, or leaves {{client}} unsure what happens next.",
              "Includes the facts but in an order that forces rereading, or leaves the partial-delivery option unclear.",
              "States the delay, the new date, what {{company}} offers, and a clear next step or question for {{client}}.",
              "Puts the news and options in the opening lines, with exact dates and quantities, and asks for a specific decision.",
              "Stays accurate and fair if forwarded to the client's management, with no blame and no overpromising.",
            ],
          },
          {
            competencyKey: "collaboration.empathy",
            anchors: [
              "Treats the delay as a logistics update and ignores its effect on the client's store openings.",
              "Apologises for the inconvenience in general terms, without showing understanding of the client's plans.",
              "Recognises the specific effect on the client's installers and stores, and addresses it.",
              "Shows understanding of the client's own position, such as the flagship launch, and proposes options that protect it.",
              "Acknowledges the disruption fully while staying honest about what the 300-unit option can and cannot cover.",
            ],
          },
          {
            competencyKey: "leadership.ownership",
            anchors: [
              "Blames the supplier or presents the delay as outside {{company}}'s control.",
              "Accepts the delay but dwells on the supplier's fault rather than what {{company}} will do.",
              "Takes responsibility on behalf of {{company}} and states what is being done to recover.",
              "Owns the problem, offers concrete recovery such as the partial delivery and installer support, and commits to updates.",
              "As level 4, and commits to a specific follow-up, such as confirming the hinges arrive on the 17th, so the client is not surprised again.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Approves 15% without {{manager}}, or refuses flatly with no explanation.",
              "Offers 5% with no link to the client's actual losses or interests.",
              "Explains what can be approved now, involves {{manager}} for anything larger, and gives a time for an answer.",
              "Explores the client's real cost, such as rebooked installers, and proposes remedies for it, not only a discount.",
              "As level 4, and balances the relationship with {{company}}'s margin, aligning with {{manager}} before replying.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Offers 300 units by the 15th to cover the 120 needed for the launch on the 18th.",
            competencyKey: "collaboration.empathy",
            keywords: ["300", "15th", "launch", "flagship", "120", "يوم 15", "حفل الإطلاق", "المتجر الرئيسي", "120 وحدة"],
          },
          {
            text: "States the new date for the full order clearly.",
            competencyKey: "communication.written-communication",
            keywords: ["21st", "full order", "all 500", "يوم 21", "الطلب كاملًا", "الوحدات الـ500"],
          },
          {
            text: "Takes responsibility without blaming the supplier.",
            competencyKey: "leadership.ownership",
            keywords: ["we take responsibility", "our responsibility", "our own checks", "نتحمل المسؤولية", "مسؤوليتنا", "فحوصنا"],
          },
          {
            text: "Asks {{client}} to choose between options and gives a reply time.",
            competencyKey: "communication.written-communication",
            keywords: ["please let me know", "which option", "would you prefer", "يرجى إبلاغي", "أي الخيارين", "تفضّلون"],
          },
        ],
        redFlags: [
          {
            text: "Blames the supplier.",
            competencyKey: "leadership.ownership",
            keywords: ["supplier's fault", "our supplier failed", "outside our control", "خطأ المورد", "خارج عن إرادتنا"],
          },
          {
            text: "Gives a generic apology with no specifics.",
            competencyKey: "collaboration.empathy",
            keywords: ["sorry for any inconvenience", "نعتذر عن أي إزعاج"],
          },
          {
            text: "Buries the delay or omits the new date.",
            competencyKey: "communication.written-communication",
            keywords: ["slight delay", "minor adjustment", "تأخير طفيف", "تعديل بسيط"],
          },
          {
            text: "Promises more than {{specialist}} confirmed.",
            competencyKey: "leadership.ownership",
            keywords: ["all 500 by the 15th", "guarantee", "نضمن", "الوحدات كلها يوم 15"],
          },
        ],
        embeddedDetail: {
          description: "The client's footnote says the flagship launch on the 18th needs 120 units installed; {{specialist}}'s 300 units by the 15th can cover it.",
          location: "footnote of {{client}}'s order confirmation",
          keywords: ["18th", "launch event", "flagship", "120", "يوم 18", "حفل الإطلاق", "المتجر الرئيسي"],
        },
        probeTargets: ["collaboration.empathy"],
        twistTargets: ["collaboration.stakeholder-management"],
      },
    },
  },
  // ───────────────────────────── wr-03 ─────────────────────────────
  {
    id: "wr-03-feedback-to-report",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 3, conflictingConstraints: 2, stakes: 2, timePressure: 2, informationGaps: 1 },
    targets: ["leadership.developing-others", "communication.difficult-conversations", "collaboration.empathy"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "middle",
    content: {
      en: {
        title: "Feedback after the workshop",
        scenario:
          "Last week {{report1}} and {{report2}} ran a client workshop together, and the client praised it highly. During the workshop, {{report1}} interrupted {{report2}} several times, and the night before rewrote {{report2}}'s section of the slides without asking. You want to give {{report1}} feedback in writing today, because you are travelling for the next 4 days. Your notes and a message from {{report2}} are attached.",
        materials: [
          {
            kind: "memo",
            id: "notes",
            title: "Your notes from the workshop",
            author: { name: "{{you}}" },
            body:
              "Workshop with 14 client staff, 3 hours. Strong content; the client lead called it 'the best session this year'.\n\n{{report1}} interrupted {{report2}} 4 times during the pricing section and answered 2 questions addressed to {{report2}}.\n\nSlides: {{report2}}'s section was replaced overnight; {{report2}} saw the new version 10 minutes before the start.\n\nContext: {{report1}} has told you of plans to apply for the team lead role next month.",
          },
          {
            kind: "email",
            id: "report2-email",
            title: "Message from {{report2}}",
            from: { name: "{{report2}}", role: "{{report2.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "Workshop",
            sentAt: "Friday 18:05",
            body: "I don't want to make a big deal of it, but I felt sidelined in the workshop. I had prepared my section for a week.",
            footnote: "PS: please don't tell {{report1}} that I raised this.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the message to {{report1}}. You may propose a conversation, but the message must stand on its own.",
          written: { format: "message" },
        },
        probe: { prompt: "How do you expect {{report1}} to react, and what will you do if the reaction is defensive?" },
        twist: {
          change: "{{report1}} replies: 'Fine, but the client loved the slides. Would you rather we had looked bad?'",
          prompt: "Write your reply.",
        },
      },
      ar: {
        title: "ملاحظات بعد ورشة العمل",
        scenario:
          "أدار {{report1}} و{{report2}} الأسبوع الماضي ورشة عمل مشتركة لأحد العملاء، وأشاد بها العميل كثيرًا. في أثناء الورشة قاطع {{report1}} {{report2}} عدة مرات، وفي الليلة السابقة أعاد كتابة الجزء الخاص بـ{{report2}} في الشرائح دون استئذان. تريد أن تقدّم ملاحظاتك إلى {{report1}} كتابيًا اليوم، لأنك ستكون مسافرًا في الأيام الأربعة القادمة. مرفق ملاحظاتك ورسالة من {{report2}}.",
        materials: [
          {
            kind: "memo",
            id: "notes",
            title: "ملاحظاتك عن ورشة العمل",
            author: { name: "{{you}}" },
            body:
              "ورشة مع 14 موظفًا من العميل، مدتها 3 ساعات. المحتوى قوي، ووصفها قائد فريق العميل بأنها «أفضل جلسة هذا العام».\n\nقاطع {{report1}} {{report2}} 4 مرات في أثناء قسم التسعير، وأجاب عن سؤالين كانا موجّهين إلى {{report2}}.\n\nالشرائح: استُبدل الجزء الخاص بـ{{report2}} في الليلة السابقة، ولم يرَ {{report2}} النسخة الجديدة إلا قبل البدء بعشر دقائق.\n\nالسياق: أخبرك {{report1}} بنيّة التقدّم لوظيفة قائد الفريق الشهر القادم.",
          },
          {
            kind: "email",
            id: "report2-email",
            title: "رسالة من {{report2}}",
            from: { name: "{{report2}}", role: "{{report2.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "ورشة العمل",
            sentAt: "الجمعة 18:05",
            body: "لا أريد تضخيم الأمر، لكنني شعرت بالتهميش في الورشة. كنت قد أعددت الجزء الخاص بي طوال أسبوع.",
            footnote: "ملاحظة: أرجو ألا تخبر {{report1}} بأنني أثرت هذا الموضوع.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب الرسالة إلى {{report1}}. يمكنك أن تقترح محادثة، لكن يجب أن تكون الرسالة مكتملة بذاتها.",
          written: { format: "message" },
        },
        probe: { prompt: "كيف تتوقع أن تكون ردة فعل {{report1}}، وماذا ستفعل إن جاءت دفاعية؟" },
        twist: {
          change: "ردّ {{report1}}: «حسنًا، لكن العميل أُعجب بالشرائح. هل كنت تفضّل أن نظهر بمظهر سيئ؟»",
          prompt: "اكتب ردّك.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.developing-others",
            anchors: [
              "Only praises the workshop, or only criticises, with no path to improvement.",
              "Mentions the behaviour but gives vague advice, such as being more of a team player.",
              "Names the specific behaviours, explains their effect, and suggests a concrete alternative for next time.",
              "Links the feedback to {{report1}}'s team lead ambition, framing sharing the stage as a leadership skill to build.",
              "As level 4, and invites {{report1}} to plan how to support {{report2}} next time, with a follow-up to review progress.",
            ],
          },
          {
            competencyKey: "communication.difficult-conversations",
            anchors: [
              "Avoids the issue or states it harshly, with labels such as arrogant or controlling.",
              "Softens the message so much that {{report1}} could miss that a change is expected.",
              "States the concern clearly and respectfully, acknowledges the strong result, and moves to next steps.",
              "Separates the excellent outcome from the behaviour, keeps the core message intact, and anticipates defensiveness without accusing.",
              "Chooses words and timing that keep trust, such as offering a call, while protecting {{report2}}'s confidence.",
            ],
          },
          {
            competencyKey: "collaboration.empathy",
            anchors: [
              "Ignores how {{report2}} was affected, or reveals that {{report2}} raised the issue.",
              "Mentions {{report2}} in general terms without showing understanding of the impact.",
              "Recognises the effect on {{report2}}, who prepared for a week, while basing the feedback on their own observations.",
              "Understands {{report1}}'s likely intent, protecting the client result, and acknowledges it while explaining the cost.",
              "As level 4, and keeps {{report2}}'s confidence by using only their own observations, balancing both people's needs.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Bases the feedback on their own observations and does not reveal that {{report2}} raised it.",
            competencyKey: "collaboration.empathy",
            keywords: ["i noticed", "i saw", "i observed", "لاحظت", "رأيت", "شاهدت"],
          },
          {
            text: "Names the specific behaviours: interrupting, answering questions meant for {{report2}}, rewriting slides without asking.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["interrupted", "rewrote", "without asking", "slides", "قاطعت", "أعدت كتابة", "دون استئذان", "الشرائح"],
          },
          {
            text: "Acknowledges the strong client result genuinely.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["client loved", "great result", "well done", "أشاد العميل", "نتيجة ممتازة", "أحسنت"],
          },
          {
            text: "Links the feedback to the team lead role and developing others.",
            competencyKey: "leadership.developing-others",
            keywords: ["team lead", "develop", "coach", "قائد الفريق", "تطوير", "توجيه"],
          },
        ],
        redFlags: [
          {
            text: "Reveals that {{report2}} complained.",
            competencyKey: "collaboration.empathy",
            keywords: ["told me", "complained", "felt sidelined", "أخبرني", "اشتكى", "شعر بالتهميش"],
          },
          {
            text: "Uses labels instead of describing behaviour.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["arrogant", "controlling", "selfish", "متعجرف", "متسلط", "أناني"],
          },
          {
            text: "Gives only praise and asks for no change.",
            competencyKey: "leadership.developing-others",
            keywords: ["nothing to change", "keep it up", "لا شيء يتغير", "استمر هكذا"],
          },
        ],
        embeddedDetail: {
          description: "{{report2}}'s footnote asks not to be named as the source, so the feedback must rest on the manager's own observations.",
          location: "footnote of {{report2}}'s message",
          keywords: ["don't tell", "raised this", "my own observations", "ألا تخبر", "ملاحظاتي", "دون ذكر"],
        },
        probeTargets: ["communication.difficult-conversations"],
        twistTargets: ["leadership.developing-others"],
      },
    },
  },
  // ───────────────────────────── wr-04 ─────────────────────────────
  {
    id: "wr-04-unpopular-change",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 3, informationGaps: 3 },
    targets: ["communication.adapting-to-audience", "collaboration.empathy", "leadership.setting-direction"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "late",
    content: {
      en: {
        title: "The weekend rota",
        scenario:
          "You lead {{company}}'s customer support team of 30 people across two sites, South and North. Weekend contact volume has grown 40% this year, and weekend customers now wait over an hour. {{exec}} has decided that from next month every team member will work 1 weekend day in 6 on a rotating rota. The decision is final. You must announce it to the team in writing today, before tomorrow's team meeting. The decision note and team details are attached.",
        materials: [
          {
            kind: "memo",
            id: "decision",
            title: "Weekend rota: decision note",
            author: { name: "{{exec}}", role: "{{exec.role}}" },
            body:
              "Decision: rotating weekend rota from the 1st of next month; each person works 1 weekend day in 6.\n\nPay: 1.5 times the normal daily rate, plus a weekday off in the same week.\n\nSwaps: allowed with team lead approval.\n\nReview: after 3 months.",
          },
          {
            kind: "table",
            id: "sites",
            title: "Team by site",
            caption: "HR note: at North, the new rota replaces the Saturday half-day arrangement, so North staff will work slightly fewer weekend hours than now.",
            columns: [
              { key: "site", label: "Site" },
              { key: "people", label: "People", numeric: true },
              { key: "current", label: "Current weekend work" },
            ],
            rows: [
              { site: "South", people: 22, current: "None" },
              { site: "North", people: 8, current: "Saturday half-day every other week (local agreement)" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the announcement to the team.",
          written: { format: "email", placeholder: "To: Customer support team (South and North)\nSubject:" },
        },
        probe: { prompt: "What reactions do you expect from the team, and what will you do in the 48 hours after sending this?" },
        twist: {
          change: "Before you send it, {{report1}} tells you that 2 of the most experienced team members are considering resigning over weekend work.",
          prompt: "What do you change in the message, and what else do you do?",
        },
      },
      ar: {
        title: "مناوبات نهاية الأسبوع",
        scenario:
          "تقود فريق دعم العملاء في {{company}}، ويضم 30 شخصًا في موقعين: الجنوب والشمال. ارتفع حجم الاتصالات في عطلة نهاية الأسبوع 40% هذا العام، وأصبح العملاء ينتظرون أكثر من ساعة. قرر {{exec}} أن يعمل كل عضو في الفريق اعتبارًا من الشهر القادم يومًا واحدًا من كل 6 أيام عطلة نهاية أسبوع وفق جدول مناوبات دوري. القرار نهائي، وعليك إعلانه للفريق كتابيًا اليوم، قبل اجتماع الفريق غدًا. مرفق مذكرة القرار وبيانات الفريق.",
        materials: [
          {
            kind: "memo",
            id: "decision",
            title: "مناوبات نهاية الأسبوع: مذكرة القرار",
            author: { name: "{{exec}}", role: "{{exec.role}}" },
            body:
              "القرار: جدول مناوبات دوري لعطلة نهاية الأسبوع اعتبارًا من اليوم الأول من الشهر القادم، يعمل فيه كل شخص يومًا واحدًا من كل 6 أيام عطلة.\n\nالأجر: 1.5 ضعف الأجر اليومي المعتاد، إضافة إلى يوم إجازة في أحد أيام الأسبوع نفسه.\n\nالتبديل: مسموح بموافقة قائد الفريق.\n\nالمراجعة: بعد 3 أشهر.",
          },
          {
            kind: "table",
            id: "sites",
            title: "الفريق بحسب الموقع",
            caption: "ملاحظة الموارد البشرية: في موقع الشمال يحلّ جدول المناوبات الجديد محلّ ترتيب نصف يوم السبت، فيعمل موظفو الشمال ساعات أقل قليلًا في عطلة نهاية الأسبوع مما يعملون الآن.",
            columns: [
              { key: "site", label: "الموقع" },
              { key: "people", label: "عدد الأشخاص", numeric: true },
              { key: "current", label: "العمل الحالي في عطلة نهاية الأسبوع" },
            ],
            rows: [
              { site: "الجنوب", people: 22, current: "لا يوجد" },
              { site: "الشمال", people: 8, current: "نصف يوم سبت كل أسبوعين (اتفاق محلي)" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب الإعلان الموجّه إلى الفريق.",
          written: { format: "email", placeholder: "إلى: فريق دعم العملاء (الجنوب والشمال)\nالموضوع:" },
        },
        probe: { prompt: "ما ردود الفعل التي تتوقعها من الفريق، وماذا ستفعل في الساعات الـ48 التي تلي إرسال الإعلان؟" },
        twist: {
          change: "قبل أن ترسل الإعلان، أخبرك {{report1}} أن 2 من أكثر أعضاء الفريق خبرة يفكران في الاستقالة بسبب العمل في عطلة نهاية الأسبوع.",
          prompt: "ما الذي تغيّره في الرسالة، وماذا تفعل غير ذلك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.adapting-to-audience",
            anchors: [
              "Sends one generic message, copying the decision note, with no attention to how different staff are affected.",
              "Softens the tone but treats both sites the same, missing that North's existing arrangement ends.",
              "Covers what matters to staff: start date, frequency, pay, time off, swaps, and what changes for North.",
              "Frames the change around staff concerns and the customer reason, with a specific part for North staff.",
              "Anticipates how South, North and long-serving staff will each read it, preventing rumours and misunderstanding.",
            ],
          },
          {
            competencyKey: "collaboration.empathy",
            anchors: [
              "Ignores the impact on people's weekends and family time, focusing only on the business need.",
              "Acknowledges that the change is unwelcome in a single generic phrase.",
              "Recognises the specific personal impact, such as weekend family commitments, and points to real options such as swaps.",
              "Explains the decision in terms staff would accept, without pretending it is popular, and invites individual concerns.",
              "Addresses feelings honestly without suggesting the decision may be reversed, and notices who may be hit hardest.",
            ],
          },
          {
            competencyKey: "leadership.setting-direction",
            anchors: [
              "States the change with no reason, or hints that the leader also disagrees with it.",
              "Gives a reason but not why it matters to customers or the team.",
              "Explains the customer reason, what is fixed, and what the team can influence, such as how swaps work.",
              "Connects the rota to a shared goal, shorter weekend waits, and owns the decision even though {{exec}} made it.",
              "As level 4, and sets a clear review point and says how feedback will be gathered and used.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Expects no reaction and plans no follow-up.",
              "Plans to answer questions as they come, with no proactive steps.",
              "Plans to talk with each site and key individuals, and to tell {{exec}} the main concerns.",
              "Anticipates who will be most affected, such as staff with caring duties or North's local agreement, and meets them early.",
              "As level 4, and involves respected team members such as {{report1}} to surface concerns and shape swap rules.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Addresses North separately: the rota replaces the Saturday half-day.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["north", "half-day", "replaces", "local agreement", "الشمال", "نصف يوم", "يحل محل", "الاتفاق المحلي"],
          },
          {
            text: "Gives the customer reason with the figures.",
            competencyKey: "leadership.setting-direction",
            keywords: ["40%", "wait", "over an hour", "customers", "الانتظار", "أكثر من ساعة", "العملاء"],
          },
          {
            text: "States the practical facts: start date, 1 in 6, 1.5 times pay, weekday off, swaps.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["1 in 6", "1.5", "weekday off", "swap", "من كل 6", "يوم إجازة", "التبديل"],
          },
          {
            text: "Acknowledges personal impact and invites individual conversations.",
            competencyKey: "collaboration.empathy",
            keywords: ["family", "talk to me", "individually", "your circumstances", "العائلة", "تحدث معي", "بشكل فردي", "ظروفك"],
          },
          {
            text: "Mentions the review after 3 months and how feedback will be used.",
            competencyKey: "leadership.setting-direction",
            keywords: ["review", "3 months", "feedback", "مراجعة", "3 أشهر", "آراءكم"],
          },
        ],
        redFlags: [
          {
            text: "Distances self from the decision or blames {{exec}}.",
            competencyKey: "leadership.setting-direction",
            keywords: ["not my decision", "management decided", "i don't agree", "ليس قراري", "الإدارة قررت", "لا أوافق"],
          },
          {
            text: "Suggests the decision may change if enough people object.",
            competencyKey: "collaboration.empathy",
            keywords: ["might change", "if enough people", "قد يتغير", "إذا اعترض"],
          },
          {
            text: "Copies the decision note with no explanation.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["as per the decision", "please note", "وفقًا للقرار", "يرجى العلم"],
          },
          {
            text: "Dismisses the impact.",
            competencyKey: "collaboration.empathy",
            keywords: ["only one day", "not a big deal", "يوم واحد فقط", "ليس أمرًا كبيرًا"],
          },
        ],
        embeddedDetail: {
          description:
            "The HR note says that at North the rota replaces the Saturday half-day arrangement, so North staff will work slightly fewer weekend hours; one generic message would mislead them.",
          location: "caption of the team-by-site table",
          keywords: ["north", "half-day", "replaces", "local agreement", "الشمال", "نصف يوم", "يحل محل"],
        },
        probeTargets: ["collaboration.stakeholder-management"],
        twistTargets: ["collaboration.empathy"],
      },
    },
  },
  // ───────────────────────────── wr-05 ─────────────────────────────
  {
    id: "wr-05-escalation-note",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 3,
    dials: { ambiguity: 2, stakeholders: 4, conflictingConstraints: 3, stakes: 4, timePressure: 3, informationGaps: 2 },
    targets: ["judgment.knowing-when-to-escalate", "communication.written-communication", "leadership.courage"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "late",
    content: {
      en: {
        title: "The missing interface",
        scenario:
          "You manage the project to launch {{client}}'s new online store, built by {{company}}. Go-live is in 5 weeks. The project depends on a payment interface from {{peer}}'s team, which has missed 2 agreed delivery dates for it; the latest was last Friday. You have raised it with {{peer}} twice, and each time a new date was promised. Without the interface by the end of next week, go-live will slip. You decide to escalate to {{manager}} and {{exec}}.",
        materials: [
          {
            kind: "email",
            id: "peer-email",
            title: "Latest email from {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "Re: Payment interface",
            sentAt: "Monday 17:40",
            body: "Sorry again. We're working on it and should have it to you by the 12th. My team is stretched across 3 projects.",
            footnote: "Out-of-office notice: {{specialist}}, our only engineer who knows the payment platform, is on leave from the 10th to the 24th.",
          },
          {
            kind: "table",
            id: "milestones",
            title: "Payment interface: milestones",
            columns: [
              { key: "milestone", label: "Milestone" },
              { key: "date", label: "Date" },
              { key: "status", label: "Status" },
            ],
            rows: [
              { milestone: "Interface delivery (original date)", date: "15th of last month", status: "Missed" },
              { milestone: "Interface delivery (revised date)", date: "Last Friday", status: "Missed" },
              { milestone: "Interface delivery (new promise)", date: "The 12th", status: "At risk" },
              { milestone: "Integration testing", date: "2 weeks after delivery", status: "Not started" },
              { milestone: "Go-live", date: "In 5 weeks", status: "At risk" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the escalation note to {{manager}} and {{exec}}.",
          written: { format: "email", placeholder: "To: {{manager}}, {{exec}}\nSubject:" },
        },
        probe: { prompt: "Why escalate now rather than give {{peer}} one more week?" },
        twist: {
          change: "{{peer}} sees your note and messages you: 'You've made my team look bad in front of {{exec}}.'",
          prompt: "Write your reply to {{peer}}.",
        },
      },
      ar: {
        title: "الواجهة المفقودة",
        scenario:
          "تدير مشروع إطلاق المتجر الإلكتروني الجديد لـ{{client}}، الذي تبنيه {{company}}. التشغيل بعد 5 أسابيع، ويعتمد المشروع على واجهة دفع يطوّرها فريق {{peer}}. فات هذا الفريقَ موعدا تسليم متفق عليهما لهذه الواجهة، وكان آخرهما يوم الجمعة الماضي. أثرت الأمر مع {{peer}} مرتين، وفي كل مرة وُعدت بموعد جديد. إذا لم تصل الواجهة بنهاية الأسبوع القادم فسيتأخر التشغيل. قررت تصعيد الأمر إلى {{manager}} و{{exec}}.",
        materials: [
          {
            kind: "email",
            id: "peer-email",
            title: "آخر رسالة من {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "رد: واجهة الدفع",
            sentAt: "الاثنين 17:40",
            body: "أعتذر مجددًا. نعمل على الواجهة ونتوقع تسليمها إليك بحلول يوم 12. فريقي موزّع على 3 مشروعات.",
            footnote: "إشعار غياب: {{specialist}}، المهندس الوحيد لدينا الذي يعرف منصة الدفع، في إجازة من يوم 10 إلى يوم 24.",
          },
          {
            kind: "table",
            id: "milestones",
            title: "واجهة الدفع: المراحل الرئيسية",
            columns: [
              { key: "milestone", label: "المرحلة" },
              { key: "date", label: "الموعد" },
              { key: "status", label: "الحالة" },
            ],
            rows: [
              { milestone: "تسليم الواجهة (الموعد الأصلي)", date: "يوم 15 من الشهر الماضي", status: "فات" },
              { milestone: "تسليم الواجهة (الموعد المعدَّل)", date: "الجمعة الماضية", status: "فات" },
              { milestone: "تسليم الواجهة (الوعد الجديد)", date: "يوم 12", status: "معرّض للخطر" },
              { milestone: "اختبار التكامل", date: "بعد أسبوعين من التسليم", status: "لم يبدأ" },
              { milestone: "التشغيل", date: "بعد 5 أسابيع", status: "معرّض للخطر" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة التصعيد إلى {{manager}} و{{exec}}.",
          written: { format: "email", placeholder: "إلى: {{manager}}، {{exec}}\nالموضوع:" },
        },
        probe: { prompt: "لماذا تصعّد الأمر الآن بدلًا من منح {{peer}} أسبوعًا آخر؟" },
        twist: {
          change: "اطّلع {{peer}} على مذكرتك وأرسل إليك: «لقد أظهرت فريقي بمظهر سيئ أمام {{exec}}.»",
          prompt: "اكتب ردّك على {{peer}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "judgment.knowing-when-to-escalate",
            anchors: [
              "Escalates with no clear ask, or frames it as a complaint about {{peer}} rather than a decision needed.",
              "Escalates the problem but asks for help without saying what decision is needed or by when.",
              "Gives the facts, the impact on go-live, what has been tried, and a specific decision needed by a date.",
              "Shows why now: the new date depends on an engineer on leave, so waiting adds risk; offers options such as another engineer or reduced scope.",
              "As level 4, and tells {{peer}} before or as it is sent, so the escalation is open and the working relationship holds.",
            ],
          },
          {
            competencyKey: "communication.written-communication",
            anchors: [
              "Writes a long narrative that buries the risk and the ask.",
              "Includes the facts but leaves the request implicit or the deadline vague.",
              "States purpose, facts, impact and the decision needed, in a form a busy reader can follow.",
              "Gives the essentials in the opening lines and states dates, owners and options precisely.",
              "Stays accurate and fair if forwarded to {{peer}}'s team, avoiding blame while keeping the facts clear.",
            ],
          },
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Avoids escalating clearly, or softens the note until the risk to go-live disappears.",
              "Raises the risk but hedges it, such as calling it a small chance of delay.",
              "States the risk to go-live plainly and asks senior leaders for a decision despite the discomfort.",
              "Names the single-engineer dependency as the real problem, though it reflects on another team's planning, and does so factually.",
              "As level 4, and accepts their own share of responsibility, such as not escalating after the first missed date.",
            ],
          },
          {
            competencyKey: "leadership.handling-conflict",
            anchors: [
              "Responds defensively, blames back, or apologises and withdraws the escalation.",
              "Explains that the escalation was necessary but ignores how {{peer}} feels.",
              "Acknowledges {{peer}}'s reaction, explains the reason calmly, and focuses on solving the problem together.",
              "Reframes the escalation as a request for resources {{peer}}'s team needs, and proposes a joint next step.",
              "As level 4, and offers to present the solution jointly to {{exec}}, repairing trust while keeping the facts intact.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots that the promised date of the 12th falls during {{specialist}}'s leave.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["on leave", "10th", "24th", "only engineer", "إجازة", "يوم 10", "يوم 24", "المهندس الوحيد"],
          },
          {
            text: "Asks for a specific decision by a date.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["decision", "by friday", "we need you to", "approve", "قرار", "قبل الجمعة", "نحتاج منكم", "الموافقة"],
          },
          {
            text: "Opens with the risk to go-live and the ask.",
            competencyKey: "communication.written-communication",
            keywords: ["go-live", "at risk", "5 weeks", "التشغيل", "معرض للخطر", "5 أسابيع"],
          },
          {
            text: "Offers options such as another engineer, external help or reduced scope.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["options", "another engineer", "contractor", "reduce scope", "خيارات", "مهندس آخر", "متعاقد خارجي", "تقليص النطاق"],
          },
          {
            text: "States the facts without blaming {{peer}}.",
            competencyKey: "leadership.courage",
            keywords: ["missed 2", "the facts", "stretched", "فات موعدان", "الوقائع", "موزّع على"],
          },
        ],
        redFlags: [
          {
            text: "Blames {{peer}} personally.",
            competencyKey: "leadership.courage",
            keywords: ["incompetent", "unreliable", "keeps failing", "غير كفء", "لا يُعتمد عليه"],
          },
          {
            text: "Makes a vague request for help.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["please help", "any support", "ساعدونا", "أي دعم"],
          },
          {
            text: "Downplays the risk.",
            competencyKey: "leadership.courage",
            keywords: ["small risk", "probably fine", "خطر بسيط", "على الأرجح لا بأس"],
          },
          {
            text: "Opens with a long narrative before the point.",
            competencyKey: "communication.written-communication",
            keywords: ["as you may know", "background", "كما تعلمون", "خلفية"],
          },
        ],
        embeddedDetail: {
          description:
            "{{peer}}'s footnote shows {{specialist}}, the only engineer who knows the payment platform, is on leave from the 10th to the 24th, so the promised date of the 12th is not credible.",
          location: "footnote of {{peer}}'s latest email",
          keywords: ["on leave", "10th", "24th", "only engineer", "إجازة", "المهندس الوحيد", "يوم 12"],
        },
        probeTargets: ["judgment.knowing-when-to-escalate"],
        twistTargets: ["leadership.handling-conflict"],
      },
    },
  },
  // ───────────────────────────── wr-06 ─────────────────────────────
  {
    id: "wr-06-handover-plan",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 3, conflictingConstraints: 2, stakes: 2, timePressure: 2, informationGaps: 2 },
    targets: ["communication.clarity-structure", "management.delegation", "collaboration.team-orientation"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "late",
    content: {
      en: {
        title: "Before your leave",
        scenario:
          "You lead a small procurement team at {{company}}. Today is the 1st, and tomorrow you start 3 weeks of planned leave, until the 22nd. {{report1}} will cover your role; {{report1}} is capable but has not handled supplier negotiations or budget approvals before. {{report2}} joined 2 months ago and still needs regular guidance. You will not be reachable. Your list of open items is attached.",
        materials: [
          {
            kind: "table",
            id: "open-items",
            title: "Open items",
            caption: "Cleaning contract terms: notice must be given at least 30 days before the end date; otherwise the contract renews automatically for 2 years at the new price list (+8%).",
            columns: [
              { key: "item", label: "Item" },
              { key: "status", label: "Status" },
              { key: "next", label: "Next step" },
              { key: "due", label: "Due" },
            ],
            rows: [
              { item: "Laptop purchase for new hires", status: "Quote approved", next: "Raise purchase order", due: "5th" },
              { item: "Office supplies tender", status: "3 bids received", next: "Evaluate and recommend to {{manager}}", due: "8th" },
              { item: "Cleaning services contract", status: "Current contract ends on the 10th of next month", next: "Decide: renew or re-tender", due: "Not set" },
              { item: "{{report2}}'s first solo supplier review", status: "Scheduled", next: "Support and debrief", due: "12th" },
              { item: "Packaging invoice dispute", status: "Supplier claims 4,200; we accept 3,100", next: "Negotiate a settlement", due: "15th" },
              { item: "Budget approvals over 10,000", status: "Need {{manager}}'s sign-off", next: "Route to {{manager}}", due: "Ongoing" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the handover plan for {{report1}}.",
          written: { format: "plan" },
        },
        probe: { prompt: "What decision are you not handing over to {{report1}}, and why?" },
        twist: {
          change: "{{report1}} will also cover a colleague's work for the first week of your leave, so has about half the time you planned for.",
          prompt: "Adjust your handover: what do you drop, defer or reassign?",
        },
      },
      ar: {
        title: "قبل إجازتك",
        scenario:
          "تقود فريق مشتريات صغيرًا في {{company}}. اليوم هو الأول من الشهر، وتبدأ غدًا إجازة مخطّطًا لها مدتها 3 أسابيع، حتى يوم 22. سيتولى {{report1}} مهامك في أثناء الإجازة، وهو كفء لكنه لم يتولَّ من قبل مفاوضات الموردين أو اعتماد الميزانيات. انضم {{report2}} إلى الفريق قبل شهرين، وما زال يحتاج إلى توجيه منتظم. لن يكون الوصول إليك ممكنًا. مرفق قائمة البنود المفتوحة.",
        materials: [
          {
            kind: "table",
            id: "open-items",
            title: "البنود المفتوحة",
            caption: "شروط عقد التنظيف: يجب تقديم إشعار قبل تاريخ الانتهاء بثلاثين يومًا على الأقل، وإلا تجدّد العقد تلقائيًا لمدة سنتين وفق قائمة الأسعار الجديدة (+8%).",
            columns: [
              { key: "item", label: "البند" },
              { key: "status", label: "الحالة" },
              { key: "next", label: "الخطوة التالية" },
              { key: "due", label: "الموعد" },
            ],
            rows: [
              { item: "شراء حواسيب للموظفين الجدد", status: "عرض السعر معتمد", next: "إصدار أمر الشراء", due: "يوم 5" },
              { item: "مناقصة اللوازم المكتبية", status: "وردت 3 عروض", next: "التقييم ورفع توصية إلى {{manager}}", due: "يوم 8" },
              { item: "عقد خدمات التنظيف", status: "ينتهي العقد الحالي يوم 10 من الشهر القادم", next: "القرار: التجديد أو طرح مناقصة جديدة", due: "لم يُحدَّد" },
              { item: "أول مراجعة مورّد يجريها {{report2}} منفردًا", status: "مجدولة", next: "الدعم وجلسة مراجعة بعدها", due: "يوم 12" },
              { item: "نزاع على فاتورة التغليف", status: "يطالب المورّد بـ4,200 ونقبل 3,100", next: "التفاوض على تسوية", due: "يوم 15" },
              { item: "اعتماد الميزانيات التي تتجاوز 10,000", status: "تحتاج إلى توقيع {{manager}}", next: "إحالتها إلى {{manager}}", due: "مستمر" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب خطة التسليم الموجّهة إلى {{report1}}.",
          written: { format: "plan" },
        },
        probe: { prompt: "ما القرار الذي لن تفوّضه إلى {{report1}}، ولماذا؟" },
        twist: {
          change: "سيتولى {{report1}} أيضًا عمل زميل آخر في الأسبوع الأول من إجازتك، فلن يتوافر له سوى نحو نصف الوقت الذي خططت له.",
          prompt: "عدّل خطة التسليم: ما الذي تحذفه أو تؤجّله أو تُسنده إلى غيره؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.clarity-structure",
            anchors: [
              "Lists items with no priorities or dates, so {{report1}} cannot tell what matters most.",
              "Includes priorities but mixes them with background, so key deadlines are hard to find.",
              "Orders items by deadline or importance, with the action, the date and who to contact for each.",
              "Puts the few critical actions first, such as the cleaning contract notice, and removes what {{report1}} does not need.",
              "Anticipates {{report1}}'s likely questions, such as limits of authority, and answers them within the plan.",
            ],
          },
          {
            competencyKey: "management.delegation",
            anchors: [
              "Hands over everything without guidance, or holds everything back until the return.",
              "Delegates tasks but not the authority or limits, such as how far to go in the invoice negotiation.",
              "Matches tasks to {{report1}}'s experience, states decision limits, and says who approves what.",
              "Gives clear authority where safe, such as a settlement range for the dispute, and routes high-risk decisions to {{manager}}.",
              "Uses the leave to develop {{report1}} with a safety net, and plans a check-in on return to review decisions made.",
            ],
          },
          {
            competencyKey: "collaboration.team-orientation",
            anchors: [
              "Ignores {{report2}} and the rest of the team in the handover.",
              "Mentions {{report2}} but gives {{report1}} no guidance on supporting the review.",
              "Includes support for {{report2}}'s solo supplier review and tells the team who covers what.",
              "Sets the team up to help each other, such as pairing {{report2}} with {{report1}}, and briefs {{manager}} on cover.",
              "As level 4, and recognises the extra load on {{report1}}, removing lower-value work to keep it fair.",
            ],
          },
          {
            competencyKey: "management.planning-prioritisation",
            anchors: [
              "Keeps the handover unchanged or adds more instructions.",
              "Drops items arbitrarily, without regard to deadlines or risk.",
              "Keeps the cleaning notice and other dated items, defers low-risk items, and says so explicitly.",
              "Re-orders by deadline and risk, moves suitable items to {{manager}} or others, and tells affected suppliers of any delay.",
              "As level 4, and sends the cleaning contract notice personally before leaving, removing the biggest risk.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Flags the cleaning contract notice, due by the 10th, during the leave.",
            competencyKey: "communication.clarity-structure",
            keywords: ["notice", "auto-renew", "30 days", "10th", "2 years", "إشعار", "التجديد التلقائي", "30 يومًا", "يوم 10", "سنتين"],
          },
          {
            text: "Sets clear authority limits, such as a settlement range for the invoice dispute.",
            competencyKey: "management.delegation",
            keywords: ["settle", "up to", "range", "authority", "تسوية", "حتى", "نطاق", "صلاحية"],
          },
          {
            text: "States who approves what, such as budget approvals going to {{manager}}.",
            competencyKey: "management.delegation",
            keywords: ["sign-off", "approval", "10,000", "اعتماد", "توقيع", "10,000"],
          },
          {
            text: "Includes support for {{report2}}'s supplier review.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["support", "debrief", "supplier review", "الدعم", "مراجعة المورد", "جلسة مراجعة"],
          },
        ],
        redFlags: [
          {
            text: "Leaves the cleaning contract decision until after the leave.",
            competencyKey: "communication.clarity-structure",
            keywords: ["decide when i'm back", "after my leave", "بعد عودتي", "عند عودتي"],
          },
          {
            text: "Gives no limits of authority.",
            competencyKey: "management.delegation",
            keywords: ["use your judgement", "whatever you think", "تصرف كما تراه", "ما تراه مناسبًا"],
          },
          {
            text: "Asks to be contacted during the leave.",
            competencyKey: "management.delegation",
            keywords: ["call me", "message me if", "اتصل بي", "راسلني"],
          },
          {
            text: "Leaves {{report2}} to manage alone.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["on their own", "can manage alone", "بمفرده", "يستطيع وحده"],
          },
        ],
        embeddedDetail: {
          description:
            "The caption says the cleaning contract renews automatically for 2 years at +8% unless notice is given 30 days before it ends on the 10th of next month, so notice is due by the 10th, during the leave.",
          location: "caption of the open-items table",
          keywords: ["notice", "auto-renew", "30 days", "2 years", "+8%", "إشعار", "تلقائيًا", "30 يومًا", "سنتين"],
        },
        probeTargets: ["management.delegation"],
        twistTargets: ["management.planning-prioritisation"],
      },
    },
  },
  // ───────────────────────────── wr-07 ─────────────────────────────
  {
    id: "wr-07-case-for-the-evening-course",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 3, informationGaps: 3 },
    targets: ["communication.persuasion", "communication.clarity-structure"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "middle",
    content: {
      en: {
        title: "The case for the evening course",
        scenario:
          "You coordinate the adult skills programme at {{company}}, a vocational training institute. To save money next year, the board will close one of two programmes: your evening digital-skills course for job seekers (210,000 a year) or the weekend bookkeeping course (180,000 a year). {{manager}} warns you that the board thinks the digital course 'has a drop-out problem'. {{exec}}, who chairs the board, has asked each coordinator for a one-page memo before Monday's vote. The programme figures are in the materials.",
        materials: [
          {
            kind: "table",
            id: "figures",
            title: "Programme figures (last year)",
            caption:
              "Completion counts only learners who finish within the 12-week term. 31 digital-skills learners paused for job interviews or new jobs and finished in the following term; they are counted as not completed.",
            columns: [
              { key: "measure", label: "Measure" },
              { key: "digital", label: "Digital skills (evening)" },
              { key: "bookkeeping", label: "Bookkeeping (weekend)" },
            ],
            rows: [
              { measure: "Annual cost", digital: "210,000", bookkeeping: "180,000" },
              { measure: "Learners enrolled", digital: "160", bookkeeping: "220" },
              { measure: "Learners not in work when they enrolled", digital: "88%", bookkeeping: "30%" },
              { measure: "Completed within the 12-week term", digital: "58%", bookkeeping: "81%" },
              { measure: "Completers who were not working and found work within 6 months", digital: "41%", bookkeeping: "22%" },
              { measure: "Cost per learner enrolled", digital: "1,313", bookkeeping: "818" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the one-page memo to the board making your case. You may propose an option other than closing one course outright.",
          written: { format: "memo", placeholder: "To the board…" },
        },
        probe: { prompt: "What is the strongest argument against your position, and where in your memo do you deal with it?" },
        twist: {
          change: "{{exec}} replies that the board will keep your course only if its cost falls to 150,000 a year.",
          prompt: "Write a short reply proposing how.",
        },
      },
      ar: {
        title: "حجة الدورة المسائية",
        scenario:
          "تنسّق برنامج مهارات الكبار في {{company}}، وهو معهد للتدريب المهني. ولتوفير النفقات في العام القادم، سيغلق مجلس الإدارة أحد برنامجين: دورتك المسائية في المهارات الرقمية للباحثين عن عمل (210,000 سنويًا)، أو دورة مسك الدفاتر في عطلة نهاية الأسبوع (180,000 سنويًا). وفي تحذير من {{manager}}: المجلس يرى أن في الدورة الرقمية «مشكلة تسرّب». وتطلب رئاسة المجلس، ممثلةً في {{exec}}، من كل منسق مذكرة من صفحة واحدة قبل التصويت يوم الاثنين. تجد أرقام البرنامجين ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "figures",
            title: "أرقام البرنامجين (العام الماضي)",
            caption:
              "لا تشمل نسبة الإتمام إلا المتعلمين الذين أنهوا الدورة خلال الفصل البالغ 12 أسبوعًا. وقد توقف 31 متعلمًا في الدورة الرقمية مؤقتًا بسبب مقابلات عمل أو وظائف جديدة، ثم أنهوا الدورة في الفصل التالي، ويُحتسبون ضمن من لم يُتمّوها.",
            columns: [
              { key: "measure", label: "المؤشر" },
              { key: "digital", label: "المهارات الرقمية (مسائية)" },
              { key: "bookkeeping", label: "مسك الدفاتر (نهاية الأسبوع)" },
            ],
            rows: [
              { measure: "التكلفة السنوية", digital: "210,000", bookkeeping: "180,000" },
              { measure: "المتعلمون المسجلون", digital: "160", bookkeeping: "220" },
              { measure: "المتعلمون الذين لم يكونوا يعملون عند التسجيل", digital: "88%", bookkeeping: "30%" },
              { measure: "أتمّوا الدورة خلال الفصل (12 أسبوعًا)", digital: "58%", bookkeeping: "81%" },
              { measure: "من أتمّوا الدورة ولم يكونوا يعملون ثم وجدوا عملًا خلال 6 أشهر", digital: "41%", bookkeeping: "22%" },
              { measure: "التكلفة لكل متعلم مسجل", digital: "1,313", bookkeeping: "818" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة من صفحة واحدة إلى مجلس الإدارة تعرض فيها حجتك. ويمكنك اقتراح خيار غير إغلاق إحدى الدورتين إغلاقًا تامًا.",
          written: { format: "memo", placeholder: "إلى مجلس الإدارة…" },
        },
        probe: { prompt: "ما أقوى حجة ضد موقفك، وأين تعالجها في مذكرتك؟" },
        twist: {
          change: "يأتي الرد من {{exec}}: لن يُبقي المجلس على دورتك إلا إذا انخفضت تكلفتها إلى 150,000 سنويًا.",
          prompt: "اكتب ردًّا قصيرًا تقترح فيه طريقة تحقيق ذلك.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.persuasion",
            anchors: [
              "Argues from personal belief or attacks the other course, ignoring the board's concern.",
              "Makes the case with selected figures and leaves the drop-out concern unanswered.",
              "Leads with the board's goals, answers the drop-out concern directly with evidence (the 31 learners who paused for work), and makes a clear request.",
              "Anticipates the objections (cost per learner of 1,313 against 818) and answers them honestly, framing the outcomes that matter (job seekers finding work).",
              "As level 4, and offers the board an option it can accept, e.g., savings that keep both courses or a cheaper blended format, without overstating the case.",
            ],
          },
          {
            competencyKey: "communication.clarity-structure",
            anchors: [
              "A loose set of points with no clear recommendation.",
              "Has a recommendation, but it is buried, or evidence and argument are mixed without order.",
              "Opens with the recommendation, follows with reasons and evidence in a logical order, and closes with the decision needed.",
              "Tight and easy to scan within one page: headline, three supporting points with figures, the counter-argument, the request.",
              "As level 4, and every number is framed for the reader (what it means for the decision), with nothing that does not serve the argument.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the caption: counting the 31 learners who finished later lifts completion to about 77%.",
            competencyKey: "communication.persuasion",
            keywords: ["31", "77%", "78%", "paused", "following term", "job interviews", "31", "77%", "توقفوا مؤقتًا", "الفصل التالي", "مقابلات عمل"],
          },
          {
            text: "Frames the course around getting job seekers into work.",
            competencyKey: "communication.persuasion",
            keywords: ["41%", "found work", "job seekers", "88%", "41%", "وجدوا عملًا", "الباحثين عن عمل", "88%"],
          },
          {
            text: "Addresses the higher cost per learner honestly.",
            competencyKey: "communication.persuasion",
            keywords: ["cost per learner", "1,313", "more expensive", "per job", "التكلفة لكل متعلم", "1,313", "أعلى تكلفة"],
          },
          {
            text: "Offers an alternative option, such as reducing cost or keeping both courses.",
            competencyKey: "communication.persuasion",
            keywords: ["blended", "reduce the cost", "both courses", "alternative", "online", "مدمج", "خفض التكلفة", "الدورتين", "بديل", "عن بعد"],
          },
          {
            text: "Opens with the recommendation.",
            competencyKey: "communication.clarity-structure",
            keywords: ["i recommend", "recommendation:", "the board should", "in summary", "أوصي", "التوصية:", "أقترح على المجلس", "باختصار"],
          },
          {
            text: "Ends with the specific decision requested.",
            competencyKey: "communication.clarity-structure",
            keywords: ["decision", "we ask the board", "on monday", "القرار المطلوب", "نطلب من المجلس", "يوم الاثنين"],
          },
        ],
        redFlags: [
          {
            text: "Attacks the other course.",
            competencyKey: "communication.persuasion",
            keywords: ["bookkeeping is useless", "waste of money", "nobody needs bookkeeping", "عديمة الفائدة", "هدر للمال"],
          },
          {
            text: "Denies the drop-out concern without evidence.",
            competencyKey: "communication.persuasion",
            keywords: ["there is no drop-out problem", "the figures are wrong", "لا توجد مشكلة تسرب", "الأرقام خاطئة"],
          },
          {
            text: "Relies on feeling rather than evidence.",
            competencyKey: "communication.persuasion",
            keywords: ["i strongly feel", "it would be a shame", "أشعر بقوة", "سيكون من المؤسف"],
          },
          {
            text: "Never states a clear recommendation or the decision needed.",
            competencyKey: "communication.clarity-structure",
            keywords: ["there are many factors to consider", "hard to say which", "هناك عوامل كثيرة", "يصعب القول"],
          },
        ],
        embeddedDetail: {
          description:
            "The table caption says 31 digital-skills learners paused for job interviews or new jobs and finished the next term but count as not completed; including them, completion is about 77% (124 of 160), close to the bookkeeping course.",
          location: "caption of the programme figures table",
          keywords: ["31", "paused", "following term", "77%", "توقفوا مؤقتًا", "الفصل التالي", "31"],
        },
        probeTargets: ["communication.persuasion"],
        twistTargets: ["communication.persuasion", "communication.clarity-structure"],
      },
    },
  },
  // ───────────────────────────── wr-08 ─────────────────────────────
  {
    id: "wr-08-comments-on-your-draft",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 3, informationGaps: 2 },
    targets: ["collaboration.taking-feedback", "communication.written-communication"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "late",
    content: {
      en: {
        title: "The comments on your draft",
        scenario:
          "You have drafted a proposal to change the shift pattern in {{company}}'s customer contact centre from three 8-hour shifts to a mix of 8- and 10-hour shifts, to cover the evening peak. {{manager}} has returned the draft with blunt written comments. Some seem right to you; others you disagree with. {{manager}} wants your response by tomorrow, and the proposal goes to {{exec}} on Thursday. The comments and your draft's key figures are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "comments",
            title: "Comments on your draft",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body:
              "1. The savings figure is wrong: you used last year's overtime rate. At this year's rate the saving is 51,000, not 64,000.\n2. Nobody from the evening shift was consulted.\n3. Ten-hour shifts will be hard for staff with childcare.\n4. It's 9 pages. {{exec}} won't read past page 2.\n5. Honestly, I'm not convinced this is worth the disruption.\n\nPS: {{exec}} has asked me to cut overtime by 10% this year.",
          },
          {
            kind: "table",
            id: "figures",
            title: "Key figures in your draft",
            columns: [
              { key: "measure", label: "Measure" },
              { key: "current", label: "Current" },
              { key: "proposed", label: "Proposed" },
            ],
            rows: [
              { measure: "Calls answered within 60 seconds, 17:00–21:00", current: "61%", proposed: "85% (forecast)" },
              { measure: "Overtime hours per month", current: "1,150", proposed: "990 (−14%)" },
              { measure: "Annual saving", current: "—", proposed: "64,000" },
              { measure: "Staff consulted", current: "—", proposed: "Day shift: 18 of 22; evening shift: 0 of 14" },
              { measure: "Staff in favour (survey)", current: "—", proposed: "70% of those surveyed" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your reply to {{manager}}: what you will change, what you will not change, and why.",
          written: { format: "email", placeholder: "Hi {{manager}}…" },
        },
        probe: { prompt: "Which comment was hardest to accept, and why?" },
        twist: {
          change: "{{manager}} replies: 'Fine. But if the evening shift doesn't support it, I won't take it to {{exec}}.'",
          prompt: "Write the short message you send to the evening shift's team leaders.",
        },
      },
      ar: {
        title: "الملاحظات على مسودتك",
        scenario:
          "أعددت مسودة مقترح لتغيير نظام المناوبات في مركز التواصل مع العملاء لدى {{company}}، من ثلاث مناوبات مدة كل منها 8 ساعات إلى مزيج من مناوبات بثماني ساعات وأخرى بعشر، لتغطية ذروة المساء. وعادت إليك المسودة من {{manager}} مع ملاحظات مكتوبة صريحة إلى حد الحدة، يبدو لك بعضها صحيحًا وتختلف مع بعضها الآخر. والمطلوب ردك قبل الغد، فالمقترح سيُعرض على {{exec}} يوم الخميس. تجد الملاحظات وأهم أرقام مسودتك ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "comments",
            title: "ملاحظات على مسودتك",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body:
              "1. رقم الوفر خاطئ: استخدمت أجر العمل الإضافي للعام الماضي. وبأجر هذا العام يبلغ الوفر 51,000 لا 64,000.\n2. لم يُستشر أحد من المناوبة المسائية.\n3. المناوبات ذات الساعات العشر ستكون صعبة على الموظفين الذين يرعون أطفالًا.\n4. المقترح في 9 صفحات، وما بعد الصفحة الثانية لن يُقرأ عند {{exec}}.\n5. بصراحة، لم يقنعني أن الأمر يستحق كل هذا الإرباك.\n\nملاحظة: وصلني طلب من {{exec}} بخفض العمل الإضافي بنسبة 10% هذا العام.",
          },
          {
            kind: "table",
            id: "figures",
            title: "أهم الأرقام في مسودتك",
            columns: [
              { key: "measure", label: "المؤشر" },
              { key: "current", label: "الوضع الحالي" },
              { key: "proposed", label: "المقترح" },
            ],
            rows: [
              { measure: "المكالمات التي يُرد عليها خلال 60 ثانية، 17:00–21:00", current: "61%", proposed: "85% (متوقع)" },
              { measure: "ساعات العمل الإضافي شهريًا", current: "1,150", proposed: "990 (−14%)" },
              { measure: "الوفر السنوي", current: "—", proposed: "64,000" },
              { measure: "الموظفون الذين استُشيروا", current: "—", proposed: "المناوبة الصباحية: 18 من 22؛ المناوبة المسائية: 0 من 14" },
              { measure: "المؤيدون (استبيان)", current: "—", proposed: "70% ممن شملهم الاستبيان" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب ردك على {{manager}}: ما الذي ستغيّره، وما الذي لن تغيّره، ولماذا.",
          written: { format: "email", placeholder: "مرحبًا {{manager}}…" },
        },
        probe: { prompt: "أي الملاحظات كان تقبّلها الأصعب عليك، ولماذا؟" },
        twist: {
          change: "يأتي الرد من {{manager}}: «حسنًا. لكن إن لم تؤيد المناوبة المسائية المقترح، فلن أعرضه على {{exec}}.»",
          prompt: "اكتب الرسالة القصيرة التي ترسلها إلى قادة فرق المناوبة المسائية.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "collaboration.taking-feedback",
            anchors: [
              "Defends the draft against every comment, or accepts every comment without thought and drops the proposal.",
              "Accepts the comments politely but commits to no specific change, or argues the uncomfortable ones away.",
              "Accepts the valid points (the overtime rate, no evening-shift consultation, the length) with specific changes, and explains disagreement on others respectfully, with evidence.",
              "Separates fact from opinion: corrects the figure, takes the childcare concern seriously by proposing how to test it, and answers comment 5 by asking what would convince {{manager}}.",
              "As level 4, and thanks {{manager}} for the challenge, links the proposal to {{manager}}'s own goal (the 10% overtime cut), and invites a further review.",
            ],
          },
          {
            competencyKey: "communication.written-communication",
            anchors: [
              "A defensive or rambling reply with no clear structure.",
              "Covers the points, but the reader has to hunt for what will change and when.",
              "Clear and well organised: responds to each comment, says what changes and by when, in a professional tone.",
              "Leads with the main changes and the revised figure, answers each comment concisely, and stays constructive where disagreeing.",
              "As level 4, and is easy to act on, e.g., promises a revised two-page summary by a specific time before Thursday.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Accepts the corrected saving of 51,000.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["51,000", "you're right", "overtime rate", "corrected", "this year's rate", "51,000", "معك حق", "أجر العمل الإضافي", "صححت", "أجر هذا العام"],
          },
          {
            text: "Commits to consulting the evening shift, noting the survey covered only the day shift.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["evening shift", "consult", "0 of 14", "only the day shift", "المناوبة المسائية", "استشارة", "0 من 14", "المناوبة الصباحية فقط"],
          },
          {
            text: "Links the proposal to the 10% overtime target: it cuts overtime by 14%.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["10%", "14%", "overtime target", "cut overtime", "10%", "14%", "خفض العمل الإضافي", "هدف"],
          },
          {
            text: "Disagrees respectfully, with evidence or a proposed test.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["i see it differently", "the data shows", "propose to test", "trial", "أرى الأمر بشكل مختلف", "تُظهر البيانات", "أقترح أن نختبر", "تجربة"],
          },
          {
            text: "Promises a shorter version for {{exec}}.",
            competencyKey: "communication.written-communication",
            keywords: ["two pages", "two-page", "summary", "shorter", "صفحتين", "ملخص", "أقصر"],
          },
          {
            text: "Says what will change and by when.",
            competencyKey: "communication.written-communication",
            keywords: ["by tomorrow", "by wednesday", "revised draft", "before thursday", "قبل الغد", "قبل الأربعاء", "مسودة معدلة", "قبل الخميس"],
          },
        ],
        redFlags: [
          {
            text: "Replies defensively.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["you're wrong", "you didn't read", "that's not fair", "أنت مخطئ", "لم تقرأ", "هذا غير منصف"],
          },
          {
            text: "Dismisses the childcare concern.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["not our problem", "they'll adapt", "ليست مشكلتنا", "سيتأقلمون"],
          },
          {
            text: "Abandons the proposal rather than improving it.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["i'll drop the proposal", "forget it", "withdraw it", "سأتخلى عن المقترح", "انسَ الأمر", "أسحب المقترح"],
          },
          {
            text: "Writes a defensive reply that never says what will change.",
            competencyKey: "communication.written-communication",
            keywords: ["as i explained in the draft", "if you had read", "كما شرحت في المسودة", "لو قرأت"],
          },
        ],
        embeddedDetail: {
          description:
            "{{manager}}'s PS reveals the goal of cutting overtime by 10%, which the proposal exceeds (−14%); the figures table shows the 70% support came only from the day shift, since none of the 14 evening staff were consulted.",
          location: "PS of {{manager}}'s comments; 'Staff consulted' row of the figures table",
          keywords: ["10%", "14%", "0 of 14", "evening shift", "10%", "14%", "0 من 14", "المناوبة المسائية"],
        },
        probeTargets: ["collaboration.taking-feedback"],
        twistTargets: ["communication.written-communication"],
      },
    },
  },
  // ───────────────────────────── wr-09 ─────────────────────────────
  {
    id: "wr-09-the-plan-has-changed",
    type: "WRITTEN_WORK_SAMPLE",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 3, conflictingConstraints: 2, stakes: 2, timePressure: 3, informationGaps: 2 },
    targets: ["adaptability.handling-new-information", "leadership.setting-direction"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "early",
    content: {
      en: {
        title: "The plan has changed",
        scenario:
          "You lead the 9-person team at {{company}}'s largest store. Last week you told the team the store refit would happen over 3 nights next month with the store open as normal, and you gave each person a task. Today {{manager}} told you that head office has changed the plan. Several team members have already booked leave around the old dates. You need to tell the team today. {{manager}}'s email and your announcement from last week are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "announcement",
            title: "Your announcement last week",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "The refit happens over 3 nights, the 12th to the 14th of next month, and the store stays open as normal. Night tasks: {{report1}} leads stock moves; {{report2}} handles the new shelf labels; everyone else works one night each, rota to follow. Please avoid booking leave from the 12th to the 15th.",
          },
          {
            kind: "email",
            id: "newplan",
            title: "Email from {{manager}}",
            from: { name: "{{manager}}", role: "{{manager.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Refit: new plan",
            sentAt: "Today, 10:05",
            body:
              "Head office has changed the refit plan. The store will now close for 5 days, from the 3rd to the 7th of next month. During the closure, staff can either work shifts at the North or Harbour branches or take paid leave. The store's sales target for next month is reduced by 20%. Staff must tell us their choice by Thursday.",
            footnote: "Staff who work at another branch receive a daily travel allowance. Anyone who has not chosen by Thursday will be given paid leave automatically.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the message to your team explaining the change and what happens next.",
          written: { format: "message", placeholder: "Hi team…" },
        },
        probe: { prompt: "Which part of your original plan did you keep, and why?" },
        twist: {
          change: "The next day, {{manager}} tells you the Harbour branch can take only 3 of your staff, not the 6 you expected.",
          prompt: "Write the short follow-up message to your team.",
        },
      },
      ar: {
        title: "تغيّرت الخطة",
        scenario:
          "تقود الفريق المؤلف من 9 أشخاص في أكبر متاجر {{company}}. في الأسبوع الماضي أبلغت الفريق أن تجديد المتجر سيجري على مدى 3 ليالٍ في الشهر القادم مع بقاء المتجر مفتوحًا كالمعتاد، ووزعت المهام على الجميع. واليوم علمت من {{manager}} أن الإدارة العامة غيّرت الخطة. وكان عدد من أعضاء الفريق قد حجزوا إجازاتهم حول المواعيد السابقة. وعليك أن تبلغ الفريق اليوم. تجد رسالة {{manager}} وإعلانك في الأسبوع الماضي ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "announcement",
            title: "إعلانك في الأسبوع الماضي",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "يجري التجديد على مدى 3 ليالٍ، من 12 إلى 14 الشهر القادم، ويبقى المتجر مفتوحًا كالمعتاد. المهام الليلية: نقل المخزون بقيادة {{report1}}، وملصقات الرفوف الجديدة من مسؤولية {{report2}}، ويعمل كل من البقية ليلة واحدة وفق جدول سيصلكم لاحقًا. يرجى تجنب حجز الإجازات من 12 إلى 15.",
          },
          {
            kind: "email",
            id: "newplan",
            title: "رسالة من {{manager}}",
            from: { name: "{{manager}}", role: "{{manager.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "التجديد: الخطة الجديدة",
            sentAt: "اليوم، 10:05",
            body:
              "غيّرت الإدارة العامة خطة التجديد. سيُغلق المتجر الآن 5 أيام، من 3 إلى 7 الشهر القادم. وفي أثناء الإغلاق يمكن للموظفين إما العمل في مناوبات بفرعَي الشمال والميناء، وإما أخذ إجازة مدفوعة. وقد خُفّض هدف المبيعات للمتجر في الشهر القادم بنسبة 20%. وعلى الموظفين إبلاغنا باختيارهم قبل الخميس.",
            footnote: "يحصل من يعمل في فرع آخر على بدل تنقل يومي. ومن لم يحدد اختياره قبل الخميس تُمنح له إجازة مدفوعة تلقائيًا.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب الرسالة إلى فريقك لتشرح التغيير وما سيحدث بعد ذلك.",
          written: { format: "message", placeholder: "مرحبًا بالجميع…" },
        },
        probe: { prompt: "أي جزء من خطتك الأصلية أبقيت عليه، ولماذا؟" },
        twist: {
          change: "في اليوم التالي تعلم من {{manager}} أن فرع الميناء لا يستوعب إلا 3 من موظفيك، لا 6 كما كنت تتوقع.",
          prompt: "اكتب رسالة المتابعة القصيرة إلى فريقك.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "adaptability.handling-new-information",
            anchors: [
              "Repeats last week's plan, or presents the change as if nothing else needs to move.",
              "Announces the new plan but leaves the old instructions (night tasks, leave dates) hanging, so people cannot tell which still apply.",
              "Clearly replaces what changed (dates, closure, tasks), keeps what still holds, and speaks to those who booked leave around the old dates.",
              "Works through the knock-on effects (leave already booked, choices due Thursday, the automatic leave if no choice, the lower target) and gives people what they need to decide.",
              "As level 4, and is open about what is still uncertain (e.g., how many each branch can take) and when the team will hear more.",
            ],
          },
          {
            competencyKey: "leadership.setting-direction",
            anchors: [
              "Passes on the change with no reasoning or sense of what matters now.",
              "Explains the change but gives no clear priorities for the coming weeks.",
              "Explains why the plan changed as far as known, what the new goal is, and what each person needs to do next.",
              "Connects the change to what matters for the team (a smooth reopening, fair choices, the reduced target) and sets clear priorities and deadlines.",
              "As level 4, and keeps the team engaged: invites questions, offers a short meeting and acknowledges the disruption to people's plans.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Highlights the Thursday deadline and the automatic leave if no choice is made.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["thursday", "by thursday", "automatically", "if you don't choose", "الخميس", "قبل الخميس", "تلقائيًا", "إن لم تحددوا"],
          },
          {
            text: "Mentions the travel allowance for working at another branch.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["travel allowance", "allowance", "بدل تنقل", "بدل"],
          },
          {
            text: "Speaks to those who booked leave around the old dates.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["already booked", "leave you booked", "old dates", "12th to the 15th", "الإجازات المحجوزة", "حجزتم", "المواعيد السابقة", "من 12 إلى 15"],
          },
          {
            text: "Clearly cancels the old night tasks.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["no longer", "cancelled", "replaces", "instead of", "لم تعد", "أُلغيت", "تحل محل", "بدلًا من"],
          },
          {
            text: "Explains the reason and sets priorities.",
            competencyKey: "leadership.setting-direction",
            keywords: ["head office", "why", "our priority", "what matters", "reopening", "الإدارة العامة", "السبب", "أولويتنا", "الأهم", "إعادة الافتتاح"],
          },
          {
            text: "Invites questions or a short meeting.",
            competencyKey: "leadership.setting-direction",
            keywords: ["questions", "meet", "talk to me", "huddle", "أسئلة", "اجتماع", "تحدثوا معي", "لقاء قصير"],
          },
        ],
        redFlags: [
          {
            text: "Blames head office or distances themselves from the change.",
            competencyKey: "leadership.setting-direction",
            keywords: ["head office messed up", "not my decision", "don't blame me", "أخطأت الإدارة العامة", "ليس قراري", "لا تلوموني"],
          },
          {
            text: "Assigns branch shifts without offering the choice.",
            competencyKey: "leadership.setting-direction",
            keywords: ["everyone will work at", "you must work", "الجميع سيعمل في", "يجب أن تعملوا"],
          },
          {
            text: "Leaves the team unsure what is happening.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["no idea what's happening", "we'll see what happens", "لا أعرف ما الذي يحدث", "سنرى ما سيحدث"],
          },
        ],
        embeddedDetail: {
          description:
            "{{manager}}'s footnote says staff working at another branch get a travel allowance, and anyone who has not chosen by Thursday is given paid leave automatically: both shape what people should decide.",
          location: "footnote of {{manager}}'s email",
          keywords: ["travel allowance", "automatically", "thursday", "بدل تنقل", "تلقائيًا", "الخميس"],
        },
        probeTargets: ["adaptability.handling-new-information"],
        twistTargets: ["adaptability.handling-new-information", "leadership.setting-direction"],
      },
    },
  },
];
