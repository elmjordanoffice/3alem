import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "refl-01-launch-that-slipped",
    type: "REFLECTION",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 2, stakes: 2, timePressure: 1, informationGaps: 2 },
    targets: ["leadership.ownership", "management.follow-through", "adaptability.learning-speed"],
    roleFamilies: [],
    minutes: 3,
    storyPhase: "late",
    content: {
      en: {
        title: "The launch that slipped",
        scenario:
          "Nine weeks ago you planned the launch of a new internal booking tool with your team, and you led the work. The launch slipped by three weeks, and staff were confused when the tool finally arrived. The timeline of what happened is in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "What happened",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "Week 1: You set the launch for week 6 and split the work: {{report1}} would build the tool, {{report2}} would write the staff guide, and {{peer}}'s team would set up access for users.\nWeek 2: You agreed to check in 'when needed'. Everyone said things were fine.\nWeek 3: In passing, {{report2}} mentioned that the guide was waiting for screenshots of the finished tool.\nWeek 4: {{report1}} changed two screens after feedback from {{manager}}. Nobody told {{report2}}.\nWeek 5: {{peer}}'s team said they had never received the list of users who needed access.\nWeek 6 (launch day): Access was not ready. The launch moved by three weeks.\nWeek 9: The tool launched. The guide showed the old screens, and 60 staff called for help.",
          },
        ],
        task: {
          kind: "written",
          prompt: "What would you do differently? Name the two or three changes that would have made the biggest difference, and say why.",
          written: { format: "free", placeholder: "Next time I would…" },
        },
        probe: {
          prompt: "Which of your changes is most within your own control, and how would you make sure you actually do it next time?",
        },
        twist: {
          change: "Suppose {{manager}}'s feedback had arrived in week 5 instead of week 4, one week before launch.",
          prompt: "What would you have done then?",
        },
      },
      ar: {
        title: "الإطلاق الذي تأخر",
        scenario:
          "قبل تسعة أسابيع خططتَ مع فريقك لإطلاق أداة حجز داخلية جديدة، وتوليتَ قيادة العمل. تأخر الإطلاق ثلاثة أسابيع، وحين وصلت الأداة أخيرًا ساد الارتباك بين الموظفين. تجد التسلسل الزمني لما حدث ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "ما الذي حدث",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "الأسبوع 1: حددتَ الإطلاق في الأسبوع 6 ووزعت العمل: بناء الأداة على {{report1}}، ودليل الموظفين على {{report2}}، وإعداد صلاحيات وصول المستخدمين على فريق {{peer}}.\nالأسبوع 2: اتفقتم على المتابعة «عند الحاجة». وقال الجميع إن الأمور تسير على ما يرام.\nالأسبوع 3: ورد عرضًا في حديث {{report2}} أن الدليل بانتظار لقطات شاشة من الأداة في صيغتها النهائية.\nالأسبوع 4: عُدّلت شاشتان في الأداة على يد {{report1}} بناءً على ملاحظات {{manager}}، ولم يُبلَّغ {{report2}}.\nالأسبوع 5: أفاد فريق {{peer}} بأنه لم يتسلم قط قائمة المستخدمين الذين يحتاجون إلى صلاحيات.\nالأسبوع 6 (يوم الإطلاق): لم تكن الصلاحيات جاهزة، فأُجّل الإطلاق ثلاثة أسابيع.\nالأسبوع 9: أُطلقت الأداة. وكان الدليل يعرض الشاشات القديمة، واتصل 60 موظفًا طلبًا للمساعدة.",
          },
        ],
        task: {
          kind: "written",
          prompt: "ما الذي كنت ستفعله بشكل مختلف؟ اذكر التغييرين أو التغييرات الثلاثة التي كانت ستُحدث الفرق الأكبر، واشرح السبب.",
          written: { format: "free", placeholder: "في المرة القادمة…" },
        },
        probe: {
          prompt: "أي هذه التغييرات أكثرها خضوعًا لسيطرتك أنت، وكيف تضمن أنك ستطبقه فعلًا في المرة القادمة؟",
        },
        twist: {
          change: "لنفترض أن ملاحظات {{manager}} وصلت في الأسبوع 5 بدلًا من الأسبوع 4، أي قبل الإطلاق بأسبوع.",
          prompt: "ماذا كنت ستفعل حينها؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.ownership",
            anchors: [
              "Attributes the slip to {{report1}}, {{report2}}, {{peer}}'s team or {{manager}}'s feedback, and proposes nothing of their own.",
              "Accepts some responsibility in general terms but focuses on what others should have done.",
              "Names their own part (vague check-ins, no owner for the user list) and specific actions they would take instead.",
              "Treats the gaps between people's tasks (the screenshot dependency, the user list) as the leader's job, not just their direct tasks.",
              "Proposes changes that stop recurrence (e.g., a dependency map, a launch checklist) and credits the team while accepting the blame personally.",
            ],
          },
          {
            competencyKey: "management.follow-through",
            anchors: [
              "Suggests no way of tracking progress beyond setting the launch date.",
              "Suggests checking in more often but without milestones or owners.",
              "Sets milestones and owners (screens frozen, guide updated, user list sent, access ready) with regular checks against them.",
              "Spots early signs such as {{report2}}'s week-3 remark and acts on them, adjusting scope or date and informing those affected.",
              "Adds a check after launch that staff can actually use the tool, and captures lessons for the next rollout.",
            ],
          },
          {
            competencyKey: "adaptability.learning-speed",
            anchors: [
              "Describes what went wrong but draws no lesson, or one unrelated to the events.",
              "Draws a lesson about one specific slip (e.g., 'tell {{report2}} about screen changes') without generalising.",
              "Draws lessons that would apply to a similar launch, such as tracking the dependencies between people's tasks.",
              "Generalises beyond launches (any work handed between people needs a named owner and a check) and shows how they would apply it.",
              "States the underlying principle, how they would change their own habits to apply it, and how they would know it had worked.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Picks out {{report2}}'s week-3 remark as a missed early warning.",
            competencyKey: "management.follow-through",
            keywords: ["week 3", "screenshots", "waiting", "early warning", "missed signal", "الأسبوع 3", "لقطات الشاشة", "بانتظار", "إنذار مبكر", "إشارة"],
          },
          {
            text: "Identifies dependencies and hand-offs between people's tasks as the core problem.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["dependency", "hand-off", "handover", "between tasks", "depends on", "الاعتماد", "التسليم", "بين المهام", "يعتمد على"],
          },
          {
            text: "Notes nobody owned sending the user list.",
            competencyKey: "leadership.ownership",
            keywords: ["owner", "user list", "no one was assigned", "nobody owned", "مسؤول", "قائمة المستخدمين", "لم يُكلَّف أحد"],
          },
          {
            text: "Takes personal accountability.",
            competencyKey: "leadership.ownership",
            keywords: ["i should have", "my responsibility", "i didn't", "i failed to", "كان عليّ", "مسؤوليتي", "لم أقم", "قصّرت"],
          },
          {
            text: "Sets milestones and regular check-ins.",
            competencyKey: "management.follow-through",
            keywords: ["milestone", "weekly check", "checkpoint", "status", "مراحل", "متابعة أسبوعية", "نقطة مراجعة"],
          },
        ],
        redFlags: [
          {
            text: "Blames others for the slip.",
            competencyKey: "leadership.ownership",
            keywords: ["their fault", "should have told me", "they didn't", "خطؤهم", "كان عليهم إخباري", "لم يقوموا"],
          },
          {
            text: "Offers vague lessons that would not change behaviour.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["communicate better", "work harder", "be more careful", "تواصل أفضل", "العمل بجد", "الحرص أكثر"],
          },
          {
            text: "Puts the slip down to {{manager}}'s late feedback.",
            competencyKey: "leadership.ownership",
            keywords: ["late feedback", "manager changed", "because of the feedback", "الملاحظات المتأخرة", "بسبب ملاحظات"],
          },
        ],
        embeddedDetail: {
          description:
            "In week 3, {{report2}} mentioned in passing that the guide was waiting for screenshots of the finished tool: an early warning of the dependency that later produced a guide showing old screens.",
          location: "week 3 line of the timeline memo",
          keywords: ["week 3", "screenshots", "waiting", "الأسبوع 3", "لقطات"],
        },
        probeTargets: ["adaptability.learning-speed"],
        twistTargets: ["management.follow-through"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "refl-02-complaint-that-grew",
    type: "REFLECTION",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 2 },
    targets: ["judgment.knowing-when-to-escalate", "collaboration.stakeholder-management", "adaptability.learning-speed"],
    roleFamilies: [],
    minutes: 3,
    storyPhase: "late",
    content: {
      en: {
        title: "The complaint that grew",
        scenario:
          "Last month a complaint from {{client}} turned into a serious problem: {{client}} has now asked for a review of the whole contract. You handled the complaint from the start. The sequence of events is in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "Sequence of events",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "Day 1: {{client}}'s operations lead emailed about three delayed orders. You replied the same day with an apology and a promise to look into it.\nDay 3: You found the delays came from a stock problem in {{company}}'s warehouse, which {{peer}}'s team runs. {{peer}} said it would be fixed 'soon'.\nDay 4: You told {{client}} it was being fixed. You did not give a date.\nDay 8: Two more orders were delayed. {{client}}'s operations lead wrote: 'This is now affecting our own customers.'\nDay 9: You asked {{peer}} again; still no date. You decided to handle it yourself rather than bother {{manager}}.\nDay 12: {{client}}'s director called {{exec}} directly. {{exec}} asked {{manager}}, who had not heard of the problem.\nDay 13: {{client}} asked for a review of the contract.",
          },
        ],
        task: {
          kind: "written",
          prompt: "What would you do differently? Name the two or three changes that matter most, and say why.",
          written: { format: "free", placeholder: "Next time I would…" },
        },
        probe: {
          prompt: "At exactly which point should you have involved {{manager}}, and what would you have said?",
        },
        twist: {
          change: "Suppose {{manager}} had been on leave for the whole period.",
          prompt: "Who would you have involved instead, and when?",
        },
      },
      ar: {
        title: "الشكوى التي كبرت",
        scenario:
          "في الشهر الماضي تحولت شكوى من {{client}} إلى مشكلة جدية، إذ وصل من {{client}} الآن طلب بمراجعة العقد بأكمله. وقد توليتَ الشكوى منذ البداية. تجد تسلسل الأحداث ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "تسلسل الأحداث",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "اليوم 1: وصلتك رسالة من مسؤول العمليات لدى {{client}} بشأن ثلاثة طلبات متأخرة. رددتَ في اليوم نفسه باعتذار ووعد بالبحث في الأمر.\nاليوم 3: وجدتَ أن التأخير ناتج عن مشكلة في المخزون في مستودع {{company}} الذي يديره فريق {{peer}}. وكان الرد من {{peer}} أن المشكلة ستُحل «قريبًا».\nاليوم 4: أبلغتَ {{client}} بأن المشكلة قيد الحل، دون تحديد موعد.\nاليوم 8: تأخر طلبان آخران. وكتب مسؤول العمليات لدى {{client}}: «هذا الأمر يؤثر الآن في عملائنا نحن».\nاليوم 9: سألتَ {{peer}} مجددًا، ولا موعد بعد. وقررتَ معالجة الأمر بنفسك بدلًا من «إزعاج» {{manager}}.\nاليوم 12: اتصل مدير لدى {{client}} بـ{{exec}} مباشرة. فانتقل السؤال من {{exec}} إلى {{manager}}، ولم يكن لدى {{manager}} علم بالمشكلة.\nاليوم 13: وصل من {{client}} طلب بمراجعة العقد.",
          },
        ],
        task: {
          kind: "written",
          prompt: "ما الذي كنت ستفعله بشكل مختلف؟ اذكر التغييرين أو التغييرات الثلاثة الأهم، واشرح السبب.",
          written: { format: "free", placeholder: "في المرة القادمة…" },
        },
        probe: {
          prompt: "في أي لحظة تحديدًا كان عليك إشراك {{manager}}، وماذا كنت ستقول؟",
        },
        twist: {
          change: "لنفترض أن إجازة {{manager}} امتدت طوال تلك المدة.",
          prompt: "من كنت ستشرك بدلًا من ذلك، ومتى؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "judgment.knowing-when-to-escalate",
            anchors: [
              "Sees no need to have escalated, or blames {{peer}} and {{exec}}'s involvement without reflecting on timing.",
              "Says they should have escalated 'earlier' without naming when, to whom, or what they would have asked for.",
              "Names a specific point (Day 8 or Day 9 at the latest) to involve {{manager}}, with the facts and a proposed action.",
              "Describes containing what they could (pressing {{peer}} for a date, offering {{client}} interim options) while escalating with a clear request.",
              "Sees the Day 3 dependency on another team as the moment to give {{manager}} an early heads-up with options, avoiding both surprise and alarm.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Considers only {{client}}'s operations lead and ignores {{manager}}, {{exec}} or {{peer}}.",
              "Names the stakeholders but treats them as needing the same updates.",
              "Identifies what {{client}}, {{peer}}, {{manager}} and {{exec}} each needed and when each should have been informed.",
              "Sees that the Day 4 promise without a date created false expectations, and describes managing {{client}} with honest timelines.",
              "Identifies less obvious stakeholders ({{client}}'s own customers and director) and how to build those relationships before a crisis.",
            ],
          },
          {
            competencyKey: "adaptability.learning-speed",
            anchors: [
              "Retells events without drawing a lesson.",
              "Draws a narrow lesson ('reply faster') that would not have changed the outcome.",
              "Draws lessons that apply to similar complaints, such as giving dates and escalating blockers owned by other teams.",
              "Generalises (e.g., 'my reluctance to bother my manager hides problems') and shows how they would act differently elsewhere.",
              "States the underlying principle, how they would check themselves next time, and which signal would trigger escalation.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Recognises the Day 8 message as the signal the problem had outgrown a routine complaint.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["day 8", "own customers", "affecting their customers", "اليوم 8", "عملائنا", "يؤثر في عملائهم"],
          },
          {
            text: "Would have told {{manager}} early, naming a specific day.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["tell my manager", "escalate", "day 3", "day 9", "earlier", "أصعّد", "أبلغ مديري", "اليوم 3", "اليوم 9", "مبكرًا"],
          },
          {
            text: "Commits to honest dates rather than open-ended reassurance.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["date", "timeline", "no date", "honest", "realistic", "موعد", "جدول زمني", "دون موعد", "بصراحة", "واقعي"],
          },
          {
            text: "Reflects on their own reluctance to 'bother' {{manager}}.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["bother", "reluctant", "didn't want to", "i assumed", "إزعاج", "تردد", "لم أرغب", "افترضت"],
          },
        ],
        redFlags: [
          {
            text: "Blames the warehouse team.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["warehouse's fault", "their delay", "other team's fault", "خطأ المستودع", "تأخيرهم", "خطأ الفريق الآخر"],
          },
          {
            text: "Sees nothing to change in their own handling.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["handled it well", "nothing to change", "did everything right", "تعاملت جيدًا", "لا شيء لأغيره", "فعلت كل شيء صحيحًا"],
          },
          {
            text: "Offers vague lessons.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["communicate more", "be faster", "try harder", "تواصل أكثر", "أسرع", "أبذل جهدًا أكبر"],
          },
        ],
        embeddedDetail: {
          description:
            "On Day 8 {{client}}'s operations lead wrote that the delays were 'now affecting our own customers': the signal that the problem had outgrown a routine complaint and needed {{manager}}'s involvement.",
          location: "Day 8 line of the sequence memo",
          keywords: ["day 8", "own customers", "اليوم 8", "عملائنا"],
        },
        probeTargets: ["judgment.knowing-when-to-escalate"],
        twistTargets: ["collaboration.stakeholder-management"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "refl-03-process-nobody-used",
    type: "REFLECTION",
    difficulty: 4,
    dials: { ambiguity: 4, stakeholders: 4, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["leadership.setting-direction", "judgment.second-order-thinking", "adaptability.learning-speed"],
    roleFamilies: [],
    minutes: 3,
    storyPhase: "late",
    content: {
      en: {
        title: "The process nobody used",
        scenario:
          "Three months ago you introduced a new approval process to cut the time it takes to approve customer discounts from five days to one. You designed and led the change. Today approvals take six days on average, and several teams have found ways around the process. The sequence of events and the latest figures are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "Sequence of events",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "Month 1, week 1: You announced the new process by email: every discount above 5% now needs approval from one approver, {{specialist}}, within 24 hours.\nMonth 1, week 2: Sales staff asked why the change was needed. You replied that it was 'to speed things up'.\nMonth 1, week 4: {{specialist}} was handling about 60 requests a day instead of the 20 you had expected, because the 5% threshold caught most deals.\nMonth 2: Sales teams began splitting deals into smaller orders to stay below 5%. {{peer}} raised this in a meeting; you said you would look into it.\nMonth 3: {{specialist}} took two weeks' leave. No backup approver had been named, and approvals stopped.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Discount approvals",
            columns: [
              { key: "period", label: "Period" },
              { key: "requests", label: "Requests per month", numeric: true },
              { key: "days", label: "Average days to approve", numeric: true },
              { key: "split", label: "Deals split to stay below 5%" },
            ],
            rows: [
              { period: "Before the change", requests: 400, days: 5, split: "—" },
              { period: "Month 1", requests: 1200, days: 2, split: "10" },
              { period: "Month 2", requests: 900, days: 4, split: "140" },
              { period: "Month 3", requests: 700, days: 6, split: "260" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "What would you do differently? Name the changes that would have made the biggest difference, and say why.",
          written: { format: "free", placeholder: "Next time I would…" },
        },
        probe: {
          prompt: "If you introduced the same change again next month, what would you do in the first week?",
        },
        twist: {
          change: "Suppose {{exec}} insists that every discount above 5% must still be approved by someone.",
          prompt: "How would you design the rollout within that constraint?",
        },
      },
      ar: {
        title: "الإجراء الذي لم يستخدمه أحد",
        scenario:
          "قبل ثلاثة أشهر أطلقتَ إجراءً جديدًا للموافقات بهدف تقليص مدة اعتماد خصومات العملاء من خمسة أيام إلى يوم واحد، وكنت أنت من صمّم التغيير وقاده. واليوم يستغرق الاعتماد ستة أيام في المتوسط، ووجدت عدة فرق طرقًا للالتفاف على الإجراء. تجد تسلسل الأحداث وأحدث الأرقام ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "تسلسل الأحداث",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "الشهر 1، الأسبوع 1: أعلنتَ الإجراء الجديد عبر البريد الإلكتروني: كل خصم يتجاوز 5% يحتاج الآن إلى موافقة معتمد واحد، هو {{specialist}}، خلال 24 ساعة.\nالشهر 1، الأسبوع 2: سأل موظفو المبيعات عن سبب التغيير، فأجبتَ بأنه «لتسريع الأمور».\nالشهر 1، الأسبوع 4: صار حجم ما يصل إلى {{specialist}} نحو 60 طلبًا يوميًا بدلًا من 20 كما توقعت، لأن عتبة الـ5% شملت معظم الصفقات.\nالشهر 2: بدأت فرق المبيعات تقسيم الصفقات إلى طلبات أصغر لتبقى دون 5%. وطُرحت المسألة من {{peer}} في أحد الاجتماعات، فقلتَ إنك ستنظر فيها.\nالشهر 3: بدأت إجازة {{specialist}} لمدة أسبوعين، ولم يكن قد سُمّي معتمد بديل، فتوقفت الموافقات.",
          },
          {
            kind: "table",
            id: "m2",
            title: "اعتماد الخصومات",
            columns: [
              { key: "period", label: "الفترة" },
              { key: "requests", label: "الطلبات شهريًا", numeric: true },
              { key: "days", label: "متوسط أيام الاعتماد", numeric: true },
              { key: "split", label: "صفقات قُسّمت لتبقى دون 5%" },
            ],
            rows: [
              { period: "قبل التغيير", requests: 400, days: 5, split: "—" },
              { period: "الشهر 1", requests: 1200, days: 2, split: "10" },
              { period: "الشهر 2", requests: 900, days: 4, split: "140" },
              { period: "الشهر 3", requests: 700, days: 6, split: "260" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "ما الذي كنت ستفعله بشكل مختلف؟ اذكر التغييرات التي كانت ستُحدث الفرق الأكبر، واشرح السبب.",
          written: { format: "free", placeholder: "في المرة القادمة…" },
        },
        probe: {
          prompt: "لو أطلقتَ التغيير نفسه مجددًا الشهر القادم، ماذا ستفعل في الأسبوع الأول؟",
        },
        twist: {
          change: "لنفترض إصرار {{exec}} على أن كل خصم يتجاوز 5% يجب أن يعتمده شخص ما.",
          prompt: "كيف ستصمم عملية الإطلاق ضمن هذا القيد؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.setting-direction",
            anchors: [
              "Does not see the missing goal or rationale as part of the problem.",
              "Says the purpose should have been explained better, in vague terms.",
              "States the goal they should have set (one-day approvals while protecting margins), why it mattered, and how teams' steps connect to it.",
              "Describes defining success and scope (which discounts, who decides, what is out of scope) so teams could act without checking back.",
              "Describes building a shared direction with sales and {{specialist}} and how they would have adjusted it as the early figures came in.",
            ],
          },
          {
            competencyKey: "judgment.second-order-thinking",
            anchors: [
              "Treats the outcome as bad luck or others' resistance, ignoring how the design produced it.",
              "Notes the change had side effects without explaining how the design caused them.",
              "Identifies follow-on effects of the design: overload on one approver, deal-splitting, no backup.",
              "Traces how sales teams reacted to the threshold over time and how that undermined the goal.",
              "Identifies the incentive the 5% rule created (split deals) and redesigns to avoid it, e.g., tiered thresholds or delegated approval.",
            ],
          },
          {
            competencyKey: "adaptability.learning-speed",
            anchors: [
              "Retells events without a lesson, or blames sales for 'gaming' the process.",
              "Draws only narrow lessons, such as 'name a backup approver'.",
              "Draws lessons that apply to similar changes, such as testing volumes and involving users before launch.",
              "Generalises to other changes they might lead (anticipate how people respond to rules) and shows how they would apply it.",
              "States the underlying principle, how they would change their own approach, and which early signal (like {{peer}}'s month-2 warning) they would act on.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices the threshold tripled the approval load from the start.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["60", "20 expected", "threshold", "most deals", "1,200", "عتبة", "60 طلبًا", "معظم الصفقات", "1,200"],
          },
          {
            text: "Identifies deal-splitting as an incentive the rule created.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["split", "incentive", "below 5%", "workaround", "260", "تقسيم", "حافز", "دون 5%", "الالتفاف", "260"],
          },
          {
            text: "Would explain the purpose and involve sales and the approver in the design.",
            competencyKey: "leadership.setting-direction",
            keywords: ["why", "purpose", "involve", "consult", "sales", "لماذا", "الهدف", "إشراك", "استشارة", "المبيعات"],
          },
          {
            text: "Would pilot the process and plan for a backup.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["pilot", "backup", "test", "trial", "تجربة", "بديل", "اختبار", "تجريبي"],
          },
          {
            text: "Would act on {{peer}}'s early warning.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["raised", "warning", "month 2", "acted on", "listened", "تحذير", "الشهر 2", "أثار", "استمعت"],
          },
        ],
        redFlags: [
          {
            text: "Blames sales for gaming the process.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["gamed", "cheating", "resist change", "sales are the problem", "تحايل المبيعات", "يقاومون التغيير", "المشكلة في المبيعات"],
          },
          {
            text: "Sees only a narrow fix.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["just add a backup", "only problem was the leave", "فقط معتمد بديل", "المشكلة كانت الإجازة فقط"],
          },
          {
            text: "Defends the original design.",
            competencyKey: "leadership.setting-direction",
            keywords: ["process was fine", "good design", "people didn't follow", "الإجراء كان سليمًا", "التصميم جيد", "لم يلتزموا"],
          },
        ],
        embeddedDetail: {
          description:
            "In month 1, week 4, {{specialist}} was handling about 60 requests a day against the 20 expected, because the 5% threshold caught most deals: the design overloaded a single approver from the start, before any resistance appeared.",
          location: "month 1, week 4 line of the sequence memo; 'Month 1' row of the approvals table",
          keywords: ["60", "20", "threshold", "5%", "single approver", "عتبة", "60 طلبًا", "معتمد واحد"],
        },
        probeTargets: ["leadership.setting-direction"],
        twistTargets: ["judgment.second-order-thinking"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "refl-04-feedback-set-aside",
    type: "REFLECTION",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 2, stakes: 3, timePressure: 1, informationGaps: 2 },
    targets: ["collaboration.taking-feedback", "collaboration.self-awareness", "communication.listening"],
    roleFamilies: [],
    minutes: 3,
    storyPhase: "late",
    content: {
      en: {
        title: "The feedback you set aside",
        scenario:
          "Six months ago you received 360-degree feedback from six colleagues. Some of it was hard to hear, and at the time you put it down to people being unhappy about a recent decision. Since then, things have happened in your team that you did not expect. {{manager}} has asked you to reflect before the next feedback round. The feedback summary and what happened next are in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Your 360 feedback, six months ago",
            columns: [
              { key: "statement", label: "Statement about you" },
              { key: "agreed", label: "Colleagues who agreed (of 6)", numeric: true },
            ],
            rows: [
              { statement: "Decides quickly and gets results", agreed: 5 },
              { statement: "Explains the reasons behind decisions", agreed: 4 },
              { statement: "Often finishes other people's sentences or cuts discussion short", agreed: 3 },
              { statement: "Is hard to disagree with in meetings", agreed: 3 },
              { statement: "Asks for my ideas before deciding", agreed: 1 },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "What happened next",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "Month 0: You received the report and told {{manager}} the critical comments came from people unhappy with the new shift pattern.\nMonth 1: In a meeting, {{report1}} suggested combining deliveries with {{peer}}'s team. You said 'we tried that two years ago' and moved to the next item. {{report1}} later emailed the idea to {{manager}}.\nMonth 2: In the team survey, 'I can raise concerns with my manager' fell from 78% to 55%.\nMonth 3: {{report2}} stopped speaking in planning meetings. You assumed {{report2}} was simply busy.\nMonth 4: {{peer}}'s team tried {{report1}}'s idea on their own and cut their delivery costs by 12%.\nMonth 5: {{report1}} moved to {{peer}}'s team, saying in the exit conversation: 'I didn't feel my ideas were heard here.'",
          },
        ],
        task: {
          kind: "written",
          prompt: "What would you do differently? Name the two or three changes that matter most, and say why.",
          written: { format: "free", placeholder: "Next time I would…" },
        },
        probe: {
          prompt: "How would you find out, within the next month, whether your team now experiences you differently?",
        },
        twist: {
          change: "Suppose that in your next one-to-one, {{report2}} says: 'Honestly, the comments in that report were right, and nothing has changed.'",
          prompt: "What do you say in that conversation?",
        },
      },
      ar: {
        title: "الملاحظات التي تجاهلتها",
        scenario:
          "قبل ستة أشهر تلقيت تقييمًا شاملًا (360 درجة) من ستة من زملائك. كان سماع بعض ما فيه صعبًا، وعزوته حينها إلى استياء بعضهم من قرار اتخذته مؤخرًا. ومنذ ذلك الحين وقعت في فريقك أمور لم تتوقعها. والمطلوب منك الآن، بطلب من {{manager}}، أن تتأمل ما جرى قبل جولة التقييم القادمة. تجد ملخص الملاحظات وما حدث بعدها ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "تقييمك الشامل قبل ستة أشهر",
            columns: [
              { key: "statement", label: "العبارة التي تصفك" },
              { key: "agreed", label: "الزملاء الموافقون (من 6)", numeric: true },
            ],
            rows: [
              { statement: "يحسم القرار بسرعة ويحقق النتائج", agreed: 5 },
              { statement: "يشرح الأسباب وراء قراراته", agreed: 4 },
              { statement: "كثيرًا ما يكمل جمل الآخرين أو يقطع النقاش", agreed: 3 },
              { statement: "يصعب الاختلاف معه في الاجتماعات", agreed: 3 },
              { statement: "يسألني عن أفكاري قبل أن يقرر", agreed: 1 },
            ],
          },
          {
            kind: "memo",
            id: "m2",
            title: "ما حدث بعدها",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "الشهر 0: تسلّمت التقرير، وقلت لـ{{manager}} إن التعليقات الناقدة جاءت من أشخاص مستائين من نظام المناوبات الجديد.\nالشهر 1: في أحد الاجتماعات جاء من {{report1}} اقتراح بدمج عمليات التوصيل مع فريق {{peer}}. فقلت: «جرّبنا ذلك قبل سنتين»، وانتقلت إلى البند التالي. ولاحقًا وصلت الفكرة إلى {{manager}} في رسالة من {{report1}}.\nالشهر 2: في استبيان الفريق انخفضت نسبة الموافقة على عبارة «أستطيع أن أطرح مخاوفي على مديري» من 78% إلى 55%.\nالشهر 3: غاب صوت {{report2}} عن اجتماعات التخطيط، وافترضت أن السبب كثرة الانشغال.\nالشهر 4: جرّب فريق {{peer}} فكرة {{report1}} من تلقاء نفسه، فخفّض تكاليف التوصيل لديه بنسبة 12%.\nالشهر 5: انتقال {{report1}} إلى فريق {{peer}}، وفي مقابلة المغادرة: «لم أشعر بأن أفكاري تلقى آذانًا صاغية هنا».",
          },
        ],
        task: {
          kind: "written",
          prompt: "ما الذي كنت ستفعله بشكل مختلف؟ اذكر التغييرين أو التغييرات الثلاثة الأهم، واشرح السبب.",
          written: { format: "free", placeholder: "في المرة القادمة…" },
        },
        probe: {
          prompt: "كيف ستعرف خلال الشهر القادم إن كان فريقك يلمس تغييرًا في تعاملك؟",
        },
        twist: {
          change: "لنفترض أنك سمعت في لقائك الفردي القادم مع {{report2}} هذه العبارة: «بصراحة، التعليقات في ذلك التقرير كانت صحيحة، ولم يتغير شيء.»",
          prompt: "ماذا تقول في تلك المحادثة؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "collaboration.taking-feedback",
            anchors: [
              "Still dismisses the feedback, or explains it away as resentment about the shift pattern.",
              "Accepts the feedback in general terms ('I should listen more') without linking it to what happened.",
              "Accepts the specific points (cutting discussion short, hard to disagree with) and names concrete changes, such as asking for ideas before giving a view.",
              "Separates the message from the messengers, treats the survey drop and {{report1}}'s exit as confirming evidence, and plans to seek more feedback.",
              "As level 4, and makes the change visible: tells the team what they heard and what will change, and invites them to point it out when it slips.",
            ],
          },
          {
            competencyKey: "collaboration.self-awareness",
            anchors: [
              "Describes their style as wholly positive and treats the events as other people's problems.",
              "Admits a general weakness without linking it to their own reactions in these events.",
              "Names how their own behaviour contributed: dismissing {{report1}}'s idea, assuming {{report2}} was busy, blaming the shift decision.",
              "Identifies the underlying pattern (speed valued over hearing others; only 1 of 6 felt asked for ideas) and the situations where it shows up.",
              "Explains the gap between intent (being decisive) and impact (people stop speaking up) and how they will watch for it in themselves.",
            ],
          },
          {
            competencyKey: "communication.listening",
            anchors: [
              "Proposes no change in how they listen.",
              "Proposes to 'listen more' with no specific practice.",
              "Names specific listening behaviours: letting people finish, asking for views before giving their own, summarising back.",
              "Plans to notice quieter people such as {{report2}} and draw them out, and to explore ideas before judging them ('what would be different this time?').",
              "As level 4, and creates ways to be heard beyond meetings (one-to-ones, written input before decisions) and checks that they work.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Recognises that the idea they dismissed later cut {{peer}}'s delivery costs by 12%.",
            competencyKey: "communication.listening",
            keywords: ["12%", "tried that", "dismissed the idea", "it worked", "جربنا ذلك", "رفضت الفكرة", "نجحت", "12%"],
          },
          {
            text: "Treats the survey drop as evidence that the feedback was accurate.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["78%", "55%", "survey", "raise concerns", "الاستبيان", "55%", "أطرح مخاوفي", "طرح المخاوف"],
          },
          {
            text: "Takes ownership of their own reactions rather than blaming others.",
            competencyKey: "collaboration.self-awareness",
            keywords: ["i dismissed", "i assumed", "i was wrong", "my reaction", "i blamed", "تجاهلت", "افترضت", "كنت مخطئًا", "ردة فعلي", "عزوت"],
          },
          {
            text: "Names concrete listening practices.",
            competencyKey: "communication.listening",
            keywords: ["let people finish", "ask for views first", "summarise", "before giving my view", "ask the quieter", "أترك الآخرين يكملون", "أسأل عن آرائهم أولًا", "ألخص", "قبل أن أبدي رأيي", "الأقل كلامًا"],
          },
          {
            text: "Plans to ask for ongoing feedback and check whether anything has changed.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["ask for feedback", "ask the team", "pulse", "check in", "tell me if", "أطلب ملاحظات", "أسأل الفريق", "استبيان قصير", "أخبروني إذا"],
          },
        ],
        redFlags: [
          {
            text: "Still explains the feedback away.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["unfair", "they were upset", "because of the shift", "just disgruntled", "غير منصفة", "كانوا مستائين", "بسبب المناوبات", "مجرد استياء"],
          },
          {
            text: "Blames {{report1}} for going to {{manager}} or for leaving.",
            competencyKey: "collaboration.self-awareness",
            keywords: ["went behind my back", "should have spoken up", "disloyal", "من وراء ظهري", "تجاوزني", "غير وفي"],
          },
          {
            text: "Offers only vague intentions.",
            competencyKey: "communication.listening",
            keywords: ["listen more", "be more open", "communicate better", "أستمع أكثر", "أكون أكثر انفتاحًا", "تواصل أفضل"],
          },
        ],
        embeddedDetail: {
          description:
            "In month 4, {{peer}}'s team tried the idea {{report1}} had suggested in month 1 and cut delivery costs by 12%: the dismissed idea was right, and the cost of not listening is measurable.",
          location: "month 4 line of the 'What happened next' memo",
          keywords: ["12%", "month 4", "tried the idea", "الشهر 4", "12%", "جرّب فريق"],
        },
        probeTargets: ["collaboration.taking-feedback"],
        twistTargets: ["communication.listening", "collaboration.taking-feedback"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "refl-05-group-that-stalled",
    type: "REFLECTION",
    difficulty: 4,
    dials: { ambiguity: 4, stakeholders: 5, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["leadership.influence-without-authority", "adaptability.comfort-with-ambiguity", "collaboration.team-orientation"],
    roleFamilies: [],
    minutes: 3,
    storyPhase: "late",
    content: {
      en: {
        title: "The working group that stalled",
        scenario:
          "Last quarter {{exec}} asked you to lead a working group from six departments to cut the time it takes to set up a new supplier, then 45 days. None of the members reported to you, and the brief was one line long. After 12 weeks the group stopped meeting without agreeing any change. The sequence of events and the latest figures are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "Sequence of events",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "Week 1: {{exec}}'s brief: 'Fix supplier set-up.' No target, no budget. You waited two weeks for a fuller brief, which never came.\nWeek 3: First meeting. {{peer}}, representing procurement, and {{specialist}}, representing finance, each said the delay came from the other's checks. You presented a new approval form you had designed alone. Nobody committed to it.\nWeek 5: Two departments sent junior deputies. You asked {{exec}} to 'make people attend'.\nWeek 7: {{specialist}} shared data showing that most of the delay was spent waiting for suppliers' documents. You noted it and kept working on the form.\nWeek 9: You presented the form to {{exec}}. {{peer}} said procurement had never agreed to it.\nWeek 12: The group stopped meeting. Supplier set-up now takes 44 days.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Where the 44 days go (average)",
            columns: [
              { key: "stage", label: "Stage" },
              { key: "days", label: "Days", numeric: true },
              { key: "owner", label: "Who it depends on" },
            ],
            rows: [
              { stage: "Waiting for supplier documents", days: 26, owner: "Supplier (chased by procurement)" },
              { stage: "Finance checks (bank details, tax)", days: 8, owner: "Finance" },
              { stage: "Procurement approval", days: 6, owner: "Procurement" },
              { stage: "IT system set-up", days: 4, owner: "IT" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "What would you do differently? Name the changes that would have made the biggest difference, and say why.",
          written: { format: "free", placeholder: "Next time I would…" },
        },
        probe: {
          prompt: "Who in the group would you have spoken to first, one to one, and what would you have asked them?",
        },
        twist: {
          change: "Suppose {{exec}} had refused to add anything to the one-line brief, and had asked for a first improvement within 4 weeks.",
          prompt: "How would you have started?",
        },
      },
      ar: {
        title: "فريق العمل الذي توقف",
        scenario:
          "في الربع الماضي جاءك تكليف من {{exec}} بقيادة فريق عمل من ست إدارات لتقليص المدة اللازمة لاعتماد مورّد جديد، وكانت آنذاك 45 يومًا. لم يكن أي من الأعضاء تابعًا لك، وجاء التكليف في سطر واحد. وبعد 12 أسبوعًا توقف الفريق عن الاجتماع دون الاتفاق على أي تغيير. تجد تسلسل الأحداث وأحدث الأرقام ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "تسلسل الأحداث",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "الأسبوع 1: نص التكليف من {{exec}}: «أصلحوا إجراءات اعتماد الموردين». لا هدف محدد ولا ميزانية. انتظرت أسبوعين تكليفًا أوفى لم يصل قط.\nالأسبوع 3: الاجتماع الأول. جاء من {{peer}} عن المشتريات ومن {{specialist}} عن المالية اتهام متبادل: كل طرف يرى أن التأخير سببه فحوص الطرف الآخر. وعرضتَ نموذج اعتماد جديدًا صممته وحدك، فلم يلتزم به أحد.\nالأسبوع 5: أرسلت إدارتان موظفَين مبتدئَين بالنيابة. وطلبتَ من {{exec}} «إلزام الناس بالحضور».\nالأسبوع 7: عُرضت بيانات من {{specialist}} تُظهر أن معظم التأخير يقع في انتظار مستندات الموردين. دوّنت ذلك، وواصلت العمل على النموذج.\nالأسبوع 9: عرضتَ النموذج على {{exec}}، فجاء اعتراض من {{peer}}: إدارة المشتريات لم توافق عليه قط.\nالأسبوع 12: توقف الفريق عن الاجتماع. واعتماد المورّد يستغرق الآن 44 يومًا.",
          },
          {
            kind: "table",
            id: "m2",
            title: "أين تذهب الأيام الـ44 (متوسط)",
            columns: [
              { key: "stage", label: "المرحلة" },
              { key: "days", label: "الأيام", numeric: true },
              { key: "owner", label: "الجهة المعنية" },
            ],
            rows: [
              { stage: "انتظار مستندات المورّد", days: 26, owner: "المورّد (بمتابعة المشتريات)" },
              { stage: "فحوص المالية (البيانات المصرفية والضريبية)", days: 8, owner: "المالية" },
              { stage: "موافقة المشتريات", days: 6, owner: "المشتريات" },
              { stage: "الإعداد في الأنظمة", days: 4, owner: "تقنية المعلومات" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "ما الذي كنت ستفعله بشكل مختلف؟ اذكر التغييرات التي كانت ستُحدث الفرق الأكبر، واشرح السبب.",
          written: { format: "free", placeholder: "في المرة القادمة…" },
        },
        probe: {
          prompt: "بمن كنت ستبدأ من أعضاء الفريق في لقاء فردي، وما الأسئلة التي كنت ستطرحها؟",
        },
        twist: {
          change: "لنفترض أن الرد من {{exec}} كان رفض إضافة أي شيء إلى التكليف المكتوب في سطر واحد، مع طلب أول تحسين خلال 4 أسابيع.",
          prompt: "كيف كنت ستبدأ؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.influence-without-authority",
            anchors: [
              "Relies on {{exec}}'s authority ('make people attend') or blames the members for not cooperating.",
              "Recognises they needed buy-in but proposes only more meetings or a better presentation of the form.",
              "Describes building support before proposing solutions: one-to-ones with {{peer}} and {{specialist}} to understand what each department needed.",
              "Uses shared evidence (26 of the 44 days are spent waiting for suppliers) to create a common goal, and gives members a stake in designing the fix.",
              "As level 4, and builds a coalition deliberately: early allies, parts of the solution owned by others, and {{exec}}'s backing used sparingly to remove blockers rather than compel attendance.",
            ],
          },
          {
            competencyKey: "adaptability.comfort-with-ambiguity",
            anchors: [
              "Sees the vague brief as the reason for failure and would wait for clarity again.",
              "Would push {{exec}} harder for a complete brief before starting anything.",
              "Would set a working goal (e.g., under 30 days within 6 months), check it with {{exec}}, and start.",
              "Takes small, reversible steps that produce information early (map the 45 days in week 1, trial one fix with a few suppliers) while clarifying the key unknowns.",
              "As level 4, and creates structure for the group: working assumptions, decision points and a way to adjust the goal as data arrives.",
            ],
          },
          {
            competencyKey: "collaboration.team-orientation",
            anchors: [
              "Treats the group as an audience for their own plan.",
              "Invites input but keeps ownership of the solution to themselves.",
              "Treats members as joint owners: a shared goal, agreed roles and shared credit.",
              "Puts the group's goal above their own design (drops the form once the week 7 data pointed elsewhere) and credits contributions such as {{specialist}}'s data.",
              "As level 4, and builds lasting cooperation between departments, e.g., a shared measure each department owns part of.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the week 7 data: most of the delay is waiting for supplier documents, not internal checks.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["26 days", "supplier documents", "waiting for suppliers", "most of the delay", "26 يومًا", "مستندات المورد", "مستندات الموردين", "معظم التأخير"],
          },
          {
            text: "Would meet members one to one before proposing anything.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["one-to-one", "one to one", "individually", "before the first meeting", "what they need", "لقاءات فردية", "لقاء فردي", "قبل الاجتماع الأول", "ما يحتاجون إليه"],
          },
          {
            text: "Would set a working goal and start despite the vague brief.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["working goal", "propose a target", "start anyway", "30 days", "first step", "هدف مبدئي", "أقترح هدفًا", "أبدأ دون انتظار", "30 يومًا", "خطوة أولى"],
          },
          {
            text: "Would design the solution with the group and share the credit.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["design it together", "co-design", "share the credit", "their ideas", "together", "نصممه معًا", "ننسب الفضل", "أفكارهم", "معًا"],
          },
          {
            text: "Admits designing the form alone and sticking with it.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["designed it alone", "my own plan", "stuck to my form", "صممته وحدي", "خطتي الخاصة", "تمسكت بالنموذج"],
          },
        ],
        redFlags: [
          {
            text: "Relies on authority to force cooperation.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["make them attend", "force them", "instruct them", "order them", "إلزامهم", "أجبرهم", "أوامر"],
          },
          {
            text: "Puts the failure down to the vague brief.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["impossible without a clear brief", "exec's fault", "مستحيل دون تكليف واضح", "الذنب ذنب الإدارة"],
          },
          {
            text: "Blames the departments for not cooperating.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["they didn't cooperate", "they were the problem", "lack of commitment from them", "لم يتعاونوا", "هم المشكلة", "عدم التزامهم"],
          },
        ],
        embeddedDetail: {
          description:
            "In week 7 {{specialist}} showed that most of the delay (26 of 44 days) is waiting for suppliers' documents, yet the group kept working on an internal approval form that addressed at most a few of the remaining days.",
          location: "week 7 line of the sequence memo; first row of the days table",
          keywords: ["26", "supplier documents", "week 7", "waiting", "26", "مستندات", "الأسبوع 7", "انتظار"],
        },
        probeTargets: ["leadership.influence-without-authority"],
        twistTargets: ["adaptability.comfort-with-ambiguity"],
      },
    },
  },
];
