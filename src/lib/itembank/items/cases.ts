import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-01-cancellation-spike",
    type: "CASE_ANALYSIS",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["critical-thinking.root-cause-analysis", "collaboration.stakeholder-management"],
    roleFamilies: [],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "The cancellation spike",
        scenario:
          "{{company}} sells a monthly subscription service. Cancellations have risen from about 2.0% to 3.4% a month over the last quarter. {{exec}} is convinced the cause is a competitor's lower price and wants to cut prices by 15% for all customers. {{peer}} in customer support thinks something else is going on. You have been asked to look at the data before Thursday's leadership meeting. The figures and both colleagues' views are in the materials.",
        materials: [
          {
            kind: "chart",
            id: "m1",
            title: "Monthly cancellation rate",
            chartType: "line",
            xKey: "month",
            unit: "%",
            series: [{ key: "rate", label: "Cancellation rate" }],
            data: [
              { month: "Month 1", rate: 2.0 },
              { month: "Month 2", rate: 2.1 },
              { month: "Month 3", rate: 2.0 },
              { month: "Month 4", rate: 2.6 },
              { month: "Month 5", rate: 3.0 },
              { month: "Month 6", rate: 3.4 },
            ],
          },
          {
            kind: "table",
            id: "m2",
            title: "Cancellations by customer group, Month 6",
            columns: [
              { key: "group", label: "Customer group" },
              { key: "customers", label: "Customers", numeric: true },
              { key: "rate", label: "Cancellation rate" },
              { key: "change", label: "Change since Month 3" },
              { key: "reason", label: "Most common reason given" },
            ],
            rows: [
              { group: "Joined under 3 months ago", customers: 4000, rate: "8.0%", change: "+5.1 points", reason: "Setup too difficult" },
              { group: "Joined 3–12 months ago", customers: 7000, rate: "2.4%", change: "+0.4 points", reason: "Price" },
              { group: "Joined over 12 months ago", customers: 9000, rate: "2.1%", change: "+0.2 points", reason: "Price" },
              { group: "All customers", customers: 20000, rate: "3.4%", change: "+1.4 points", reason: "—" },
            ],
          },
          {
            kind: "email",
            id: "m3",
            title: "Message from {{exec}}",
            from: { name: "{{exec}}", role: "{{exec.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Competitor pricing",
            sentAt: "Monday, 18:20",
            body:
              "Their 20% price cut in Month 2 is obviously behind this. Let's agree a 15% cut for all customers on Thursday. We can't afford to keep losing people.",
          },
          {
            kind: "memo",
            id: "m4",
            title: "Notes from customer support",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body:
              "Calls about setting up the service have doubled since the new sign-up process launched at the start of Month 4. Many new customers tell us they could not connect their account in the first week.\n\nPrice does come up, mostly from longer-standing customers, at about the same rate as last year.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write a short memo to {{exec}}: what you think is driving the rise, how confident you are, and what you recommend.",
          written: { format: "memo", placeholder: "To {{exec}}…" },
        },
        probe: {
          prompt: "{{exec}} replies: 'The older customers say price is their main reason. Doesn't that prove my point?' Write your reply.",
        },
        twist: {
          change: "The sign-up team says a fix for the account-connection step will take 6 weeks.",
          prompt: "What do you recommend for those 6 weeks, and how do you handle {{exec}}'s wish to act on price now?",
        },
      },
      ar: {
        title: "قفزة الإلغاءات",
        scenario:
          "تبيع {{company}} خدمة باشتراك شهري. وقد ارتفعت نسبة الإلغاء من نحو 2.0% إلى 3.4% شهريًا خلال الربع الأخير. وثمة قناعة لدى {{exec}} بأن السبب سعر أقل لدى منافس، مع رغبة في خفض الأسعار بنسبة 15% لجميع العملاء. أما رأي {{peer}} من فريق دعم العملاء فهو أن هناك سببًا آخر. وقد طُلب منك فحص البيانات قبل اجتماع القيادة يوم الخميس. تجد الأرقام ووجهتَي نظر الزميلين ضمن المواد.",
        materials: [
          {
            kind: "chart",
            id: "m1",
            title: "نسبة الإلغاء الشهرية",
            chartType: "line",
            xKey: "month",
            unit: "%",
            series: [{ key: "rate", label: "نسبة الإلغاء" }],
            data: [
              { month: "الشهر 1", rate: 2.0 },
              { month: "الشهر 2", rate: 2.1 },
              { month: "الشهر 3", rate: 2.0 },
              { month: "الشهر 4", rate: 2.6 },
              { month: "الشهر 5", rate: 3.0 },
              { month: "الشهر 6", rate: 3.4 },
            ],
          },
          {
            kind: "table",
            id: "m2",
            title: "الإلغاءات بحسب فئة العملاء، الشهر 6",
            columns: [
              { key: "group", label: "فئة العملاء" },
              { key: "customers", label: "عدد العملاء", numeric: true },
              { key: "rate", label: "نسبة الإلغاء" },
              { key: "change", label: "التغير منذ الشهر 3" },
              { key: "reason", label: "السبب الأكثر ذكرًا" },
            ],
            rows: [
              { group: "انضموا قبل أقل من 3 أشهر", customers: 4000, rate: "8.0%", change: "+5.1 نقطة", reason: "صعوبة الإعداد" },
              { group: "انضموا قبل 3–12 شهرًا", customers: 7000, rate: "2.4%", change: "+0.4 نقطة", reason: "السعر" },
              { group: "انضموا قبل أكثر من 12 شهرًا", customers: 9000, rate: "2.1%", change: "+0.2 نقطة", reason: "السعر" },
              { group: "جميع العملاء", customers: 20000, rate: "3.4%", change: "+1.4 نقطة", reason: "—" },
            ],
          },
          {
            kind: "email",
            id: "m3",
            title: "رسالة من {{exec}}",
            from: { name: "{{exec}}", role: "{{exec.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "أسعار المنافس",
            sentAt: "الاثنين، 18:20",
            body: "من الواضح أن خفضهم للأسعار بنسبة 20% في الشهر 2 هو السبب. لنتفق يوم الخميس على خفض بنسبة 15% لجميع العملاء، فلا يمكننا أن نتحمل خسارة مزيد من العملاء.",
          },
          {
            kind: "memo",
            id: "m4",
            title: "ملاحظات من دعم العملاء",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body:
              "تضاعفت الاتصالات المتعلقة بإعداد الخدمة منذ إطلاق إجراءات التسجيل الجديدة في بداية الشهر 4. ويخبرنا كثير من العملاء الجدد بأنهم لم يتمكنوا من ربط حساباتهم في الأسبوع الأول.\n\nيُذكر السعر فعلًا، وغالبًا من العملاء القدامى، وبالمعدل نفسه تقريبًا كما في العام الماضي.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة قصيرة إلى {{exec}}: ما الذي تراه وراء الارتفاع، وما مدى ثقتك بذلك، وبماذا توصي.",
          written: { format: "memo", placeholder: "إلى {{exec}}…" },
        },
        probe: {
          prompt: "يأتي رد {{exec}}: «العملاء القدامى يقولون إن السعر هو سببهم الرئيسي. أليس هذا دليلًا على صحة رأيي؟» اكتب ردك.",
        },
        twist: {
          change: "يفيد فريق التسجيل بأن إصلاح خطوة ربط الحساب سيستغرق 6 أسابيع.",
          prompt: "بماذا توصي خلال هذه الأسابيع الستة، وكيف تتعامل مع رغبة {{exec}} في التحرك على صعيد السعر الآن؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.root-cause-analysis",
            anchors: [
              "Accepts the competitor-price explanation, or blames support or customers, without examining the data.",
              "Notes cancellations rose but stops at one cause (price or setup) without checking it against the groups and timing.",
              "Traces the rise to new customers (8.0%, citing setup) after the new sign-up process, and proposes a fix aimed at setup.",
              "Separates the main driver (setup for new customers) from a minor factor (price for long-standing customers) and checks timing against the Month 2 price cut.",
              "Identifies a systemic cause, such as the sign-up change launching without tracking new-customer success, and proposes a fix at that level.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Writes as if {{exec}} had no view, or simply agrees to the price cut to avoid disagreement.",
              "Mentions {{exec}} and {{peer}} but treats their views as interchangeable or ignores {{exec}}'s position.",
              "Addresses {{exec}}'s price theory respectfully with evidence, credits {{peer}}'s input, and says who needs to act.",
              "Anticipates {{exec}}'s resistance at Thursday's meeting and prepares the ground, e.g., a conversation beforehand or a limited price test.",
              "Brings in less obvious stakeholders (the sign-up team, finance on the cost of a 15% cut) and builds support before Thursday.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Locates the rise in customers who joined in the last 3 months and cite setup.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["new customers", "under 3 months", "8.0%", "8%", "setup", "sign-up", "العملاء الجدد", "أقل من 3 أشهر", "الإعداد", "التسجيل"],
          },
          {
            text: "Notes the timing: the price cut came in Month 2, but the rise began in Month 4.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["month 2", "month 4", "timing", "two months before", "flat until", "الشهر 2", "الشهر 4", "التوقيت", "قبل شهرين", "مستقرة حتى"],
          },
          {
            text: "Points out the cost of a 15% cut applied to all 20,000 customers.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["15% cut", "revenue", "all customers", "20,000", "cost of", "خفض 15%", "الإيرادات", "جميع العملاء", "تكلفة"],
          },
          {
            text: "Engages {{exec}}'s view respectfully and offers a way forward on price.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["you're right that", "price matters for", "test", "targeted", "محق في", "السعر مهم لـ", "اختبار", "موجّه"],
          },
        ],
        redFlags: [
          {
            text: "Accepts the competitor price as the cause.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["competitor caused", "price is the cause", "agree with the cut", "المنافس هو السبب", "السعر هو السبب", "أوافق على الخفض"],
          },
          {
            text: "Blames support or customers.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["support's fault", "customers don't read", "user error", "خطأ الدعم", "العملاء لا يقرؤون", "خطأ المستخدم"],
          },
          {
            text: "Dismisses {{exec}} rather than engaging.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["obviously wrong", "ignore", "doesn't understand", "مخطئ تمامًا", "تجاهل", "لا يفهم"],
          },
        ],
        embeddedDetail: {
          description:
            "{{exec}}'s email dates the competitor's price cut to Month 2, but the chart shows cancellations flat until Month 4, when the new sign-up process launched; the rise sits almost entirely with customers under 3 months who cite setup.",
          location: "{{exec}}'s email (Month 2) compared with the chart and {{peer}}'s notes (Month 4)",
          keywords: ["month 2", "month 4", "timing", "sign-up", "الشهر 2", "الشهر 4", "التسجيل"],
        },
        probeTargets: ["critical-thinking.root-cause-analysis", "collaboration.stakeholder-management"],
        twistTargets: ["collaboration.stakeholder-management"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-02-on-time-slide",
    type: "CASE_ANALYSIS",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 4, stakes: 4, timePressure: 3, informationGaps: 4 },
    targets: ["critical-thinking.quantitative-reasoning", "management.planning-prioritisation"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "The on-time slide",
        scenario:
          "{{company}}'s on-time delivery rate across its four service centres fell from 94% to 85% in six weeks. {{manager}} proposes hiring 16 temporary staff, four per centre, for three months at a cost of about 180,000. Before deciding, {{manager}} has asked you to review the numbers. The figures, the proposal and a message from {{peer}} are in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "On-time delivery by centre",
            columns: [
              { key: "centre", label: "Centre" },
              { key: "v1", label: "Week 1 volume", numeric: true },
              { key: "o1", label: "Week 1 on time" },
              { key: "v6", label: "Week 6 volume", numeric: true },
              { key: "o6", label: "Week 6 on time" },
            ],
            rows: [
              { centre: "North", v1: 2000, o1: "95%", v6: 2050, o6: "94%" },
              { centre: "South", v1: 1800, o1: "93%", v6: 1750, o6: "93%" },
              { centre: "East", v1: 2200, o1: "94%", v6: 2150, o6: "93%" },
              { centre: "West", v1: 2000, o1: "94%", v6: 4100, o6: "74%" },
              { centre: "All centres", v1: 8000, o1: "94%", v6: 10050, o6: "85%" },
            ],
          },
          {
            kind: "chart",
            id: "m2",
            title: "Weekly on-time rate",
            chartType: "line",
            xKey: "week",
            unit: "%",
            series: [
              { key: "all", label: "All centres" },
              { key: "west", label: "West" },
            ],
            data: [
              { week: "Week 1", all: 94, west: 94 },
              { week: "Week 2", all: 92, west: 89 },
              { week: "Week 3", all: 90, west: 84 },
              { week: "Week 4", all: 88, west: 80 },
              { week: "Week 5", all: 86, west: 76 },
              { week: "Week 6", all: 85, west: 74 },
            ],
          },
          {
            kind: "memo",
            id: "m3",
            title: "Proposal: temporary staff",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body:
              "On-time delivery is falling everywhere and we need to act fast. I propose 4 temporary staff per centre (16 in total) for 3 months, about 180,000. Please check the numbers and tell me if you agree.",
          },
          {
            kind: "email",
            id: "m4",
            title: "Message from {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "{{client}} volumes",
            sentAt: "Tuesday, 11:30",
            body: "Good news: all of {{client}}'s deliveries now go through West, as agreed in the contract. They're very happy so far.",
            footnote: "Under the contract, {{client}}'s weekly volume rises from about 2,000 to about 3,000 deliveries from next month.",
          },
        ],
        task: {
          kind: "written",
          prompt:
            "Write a short memo to {{manager}}: what is causing the drop, whether the hiring plan addresses it, and what you would do over the next four weeks, in what order.",
          written: { format: "memo", placeholder: "To {{manager}}…" },
        },
        probe: {
          prompt: "{{manager}} replies: 'Every centre's rate went down at least a little. Surely all four need help?' Write your reply.",
        },
        twist: {
          change: "Finance says only 60,000 is available for extra staff this quarter.",
          prompt: "Revise your plan for the next four weeks.",
        },
      },
      ar: {
        title: "تراجع التسليم في الموعد",
        scenario:
          "انخفضت نسبة التسليم في الموعد لدى {{company}} في مراكز الخدمة الأربعة من 94% إلى 85% خلال ستة أسابيع. والمقترح المقدَّم من {{manager}} تعيين 16 موظفًا مؤقتًا، أربعة لكل مركز، لمدة ثلاثة أشهر بتكلفة تقارب 180,000. وقبل اتخاذ القرار، طُلب منك مراجعة الأرقام. تجد الأرقام والمقترح ورسالة من {{peer}} ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "التسليم في الموعد بحسب المركز",
            columns: [
              { key: "centre", label: "المركز" },
              { key: "v1", label: "حجم الأسبوع 1", numeric: true },
              { key: "o1", label: "في الموعد، الأسبوع 1" },
              { key: "v6", label: "حجم الأسبوع 6", numeric: true },
              { key: "o6", label: "في الموعد، الأسبوع 6" },
            ],
            rows: [
              { centre: "الشمال", v1: 2000, o1: "95%", v6: 2050, o6: "94%" },
              { centre: "الجنوب", v1: 1800, o1: "93%", v6: 1750, o6: "93%" },
              { centre: "الشرق", v1: 2200, o1: "94%", v6: 2150, o6: "93%" },
              { centre: "الغرب", v1: 2000, o1: "94%", v6: 4100, o6: "74%" },
              { centre: "جميع المراكز", v1: 8000, o1: "94%", v6: 10050, o6: "85%" },
            ],
          },
          {
            kind: "chart",
            id: "m2",
            title: "نسبة التسليم في الموعد أسبوعيًا",
            chartType: "line",
            xKey: "week",
            unit: "%",
            series: [
              { key: "all", label: "جميع المراكز" },
              { key: "west", label: "الغرب" },
            ],
            data: [
              { week: "الأسبوع 1", all: 94, west: 94 },
              { week: "الأسبوع 2", all: 92, west: 89 },
              { week: "الأسبوع 3", all: 90, west: 84 },
              { week: "الأسبوع 4", all: 88, west: 80 },
              { week: "الأسبوع 5", all: 86, west: 76 },
              { week: "الأسبوع 6", all: 85, west: 74 },
            ],
          },
          {
            kind: "memo",
            id: "m3",
            title: "مقترح: موظفون مؤقتون",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body:
              "التسليم في الموعد يتراجع في كل مكان، وعلينا التحرك بسرعة. أقترح 4 موظفين مؤقتين لكل مركز (16 إجمالًا) لمدة 3 أشهر، بتكلفة تقارب 180,000. أرجو مراجعة الأرقام وإبلاغي إن كنت توافق.",
          },
          {
            kind: "email",
            id: "m4",
            title: "رسالة من {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "أحجام {{client}}",
            sentAt: "الثلاثاء، 11:30",
            body: "خبر سار: جميع شحنات {{client}} تمر الآن عبر مركز الغرب، كما نص العقد. والعميل راضٍ جدًا حتى الآن.",
            footnote: "بموجب العقد، يرتفع الحجم الأسبوعي لـ{{client}} من نحو 2,000 إلى نحو 3,000 شحنة اعتبارًا من الشهر القادم.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة قصيرة إلى {{manager}}: ما سبب التراجع، وهل تعالجه خطة التعيين، وماذا ستفعل خلال الأسابيع الأربعة القادمة وبأي ترتيب.",
          written: { format: "memo", placeholder: "إلى {{manager}}…" },
        },
        probe: {
          prompt: "يأتي رد {{manager}}: «نسبة كل مركز انخفضت ولو قليلًا. أليست المراكز الأربعة كلها بحاجة إلى مساعدة؟» اكتب ردك.",
        },
        twist: {
          change: "تفيد الإدارة المالية بأن المتاح للموظفين الإضافيين هذا الربع 60,000 فقط.",
          prompt: "عدّل خطتك للأسابيع الأربعة القادمة.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.quantitative-reasoning",
            anchors: [
              "Takes the 94%-to-85% overall drop at face value and treats it as a problem at every centre.",
              "Looks at the centre rows but does not compare volumes or work out West's effect on the total.",
              "Shows West's volume doubled and its rate fell to 74% while the other three held at about 93–94%.",
              "Calculates the rate without West (about 93%) and explains how the total misleads, setting 180,000 against a one-centre problem.",
              "Projects West's load with {{client}}'s rise to about 3,000 a week, names volume as the variable that matters most, and states the uncertainty.",
            ],
          },
          {
            competencyKey: "management.planning-prioritisation",
            anchors: [
              "Endorses hiring at all four centres, or lists many actions with no order.",
              "Orders actions by urgency only (e.g., hire everywhere now) without considering where the problem sits or what depends on what.",
              "Puts West first, sequences actions over four weeks, and states what is deferred (e.g., extra staff at other centres).",
              "Identifies the critical path (West capacity before next month's volume rise), builds in buffer, and explains priorities to {{manager}} and {{peer}}.",
              "Questions whether hiring is needed at all (e.g., moving some volume to North or East) and sequences steps so early results reduce the biggest uncertainty.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Identifies West as the outlier: volume doubled, rate down to 74%.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["west", "74%", "doubled", "4,100", "one centre", "الغرب", "74%", "تضاعف", "مركز واحد"],
          },
          {
            text: "Shows the other centres are stable when West is excluded.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["without west", "excluding", "93%", "other three", "stable", "باستثناء", "المراكز الثلاثة", "93%", "مستقرة"],
          },
          {
            text: "Notices {{client}}'s volume will rise again next month.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["3,000", "next month", "will rise", "worse", "الشهر القادم", "3,000", "سيرتفع", "سيتفاقم"],
          },
          {
            text: "Targets resources at West or rebalances volume across centres.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["west first", "reroute", "move volume", "rebalance", "shift", "الغرب أولًا", "تحويل", "نقل جزء", "إعادة توزيع"],
          },
        ],
        redFlags: [
          {
            text: "Agrees to hire at every centre.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["agree with the plan", "hire for all", "four per centre is right", "أوافق على الخطة", "التعيين في جميع المراكز"],
          },
          {
            text: "Reads the drop as a problem everywhere.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["falling everywhere", "all centres declined", "across the board", "تراجع في كل المراكز", "في كل مكان"],
          },
          {
            text: "Proposes everything at once with no sequence.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["do everything now", "all at once", "immediately everything", "كل شيء الآن", "دفعة واحدة"],
          },
        ],
        embeddedDetail: {
          description:
            "West's volume doubled (2,000 to 4,100) after taking {{client}}'s deliveries while the other centres held at 93–94%; the footnote of {{peer}}'s email says {{client}}'s volume rises again to about 3,000 a week next month.",
          location: "West row of the table; footnote of {{peer}}'s email",
          keywords: ["west", "3,000", "next month", "doubled", "الغرب", "الشهر القادم", "تضاعف"],
        },
        probeTargets: ["critical-thinking.quantitative-reasoning"],
        twistTargets: ["management.planning-prioritisation"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-03-the-22-percent-claim",
    type: "CASE_ANALYSIS",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 4, timePressure: 3, informationGaps: 4 },
    targets: ["critical-thinking.evaluating-evidence", "leadership.courage"],
    roleFamilies: [],
    minutes: 7,
    storyPhase: "late",
    content: {
      en: {
        title: "The 22% claim",
        scenario:
          "Last year {{company}} ran a coaching programme for 40 staff. {{exec}} sponsored it and now wants to extend it to all 400 staff next year, at a cost of about 600,000. The proposal says participants became 22% more productive. {{exec}} has asked you to 'sense-check the numbers' and confirm the expansion before it goes to the board next week. The proposal and the data behind it are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "Proposal: coaching for all staff",
            author: { name: "{{exec}}", role: "{{exec.role}}" },
            body:
              "Last year's 40 participants increased their weekly output by 22% compared with the year before. Participants rated the programme 4.7 out of 5.\n\nExtending it to all 400 staff should deliver similar gains across the company. Cost: about 600,000.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Weekly output (tasks completed per person)",
            columns: [
              { key: "group", label: "Group" },
              { key: "staff", label: "Staff", numeric: true },
              { key: "before", label: "Year before", numeric: true },
              { key: "after", label: "Programme year", numeric: true },
              { key: "change", label: "Change" },
            ],
            rows: [
              { group: "Participants", staff: 40, before: 50, after: 61, change: "+22%" },
              { group: "Non-participants", staff: 360, before: 41, after: 47, change: "+15%" },
            ],
          },
          {
            kind: "email",
            id: "m3",
            title: "Message from {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Data you asked for",
            sentAt: "Wednesday, 14:05",
            body:
              "Here's the data. Output is tasks completed per week, averaged over the year before and the programme year. Everyone moved to the new task system early in the programme year.",
            footnote: "Participants were volunteers: 31 of the 40 had been rated 'high performer' in the previous review, compared with about 20% of all staff.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write a short memo to {{exec}} with your assessment of the claim and your recommendation.",
          written: { format: "memo", placeholder: "To {{exec}}…" },
        },
        probe: {
          prompt: "{{exec}} calls you: 'I just need you to confirm it. The board likes this programme.' What do you say? Write your reply.",
        },
        twist: {
          change: "{{specialist}} finds that participants' output stayed 7% above that of similar colleagues six months after the programme ended.",
          prompt: "Does this change your memo? What do you now recommend?",
        },
      },
      ar: {
        title: "ادعاء الـ22%",
        scenario:
          "نفّذت {{company}} في العام الماضي برنامج توجيه مهني لأربعين موظفًا برعاية {{exec}}، والمقترح الآن توسيعه ليشمل الموظفين الأربعمئة كلهم في العام القادم، بتكلفة تقارب 600,000. ويذكر المقترح أن إنتاجية المشاركين ارتفعت بنسبة 22%. والمطلوب منك بحسب {{exec}} «التحقق من الأرقام» وتأكيد التوسعة قبل عرضها على مجلس الإدارة الأسبوع القادم. تجد المقترح والبيانات التي يستند إليها ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "مقترح: التوجيه المهني لجميع الموظفين",
            author: { name: "{{exec}}", role: "{{exec.role}}" },
            body:
              "رفع المشاركون الأربعون في العام الماضي إنتاجهم الأسبوعي بنسبة 22% مقارنة بالعام السابق. وقيّم المشاركون البرنامج بـ4.7 من 5.\n\nومن المتوقع أن يحقق توسيعه ليشمل الموظفين الأربعمئة مكاسب مماثلة على مستوى الشركة. التكلفة: نحو 600,000.",
          },
          {
            kind: "table",
            id: "m2",
            title: "الإنتاج الأسبوعي (المهام المنجزة لكل شخص)",
            columns: [
              { key: "group", label: "المجموعة" },
              { key: "staff", label: "عدد الموظفين", numeric: true },
              { key: "before", label: "العام السابق", numeric: true },
              { key: "after", label: "عام البرنامج", numeric: true },
              { key: "change", label: "التغير" },
            ],
            rows: [
              { group: "المشاركون", staff: 40, before: 50, after: 61, change: "+22%" },
              { group: "غير المشاركين", staff: 360, before: 41, after: 47, change: "+15%" },
            ],
          },
          {
            kind: "email",
            id: "m3",
            title: "رسالة من {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "البيانات التي طلبتها",
            sentAt: "الأربعاء، 14:05",
            body:
              "إليك البيانات. الإنتاج هو عدد المهام المنجزة أسبوعيًا، بمتوسط العام السابق وعام البرنامج. وقد انتقل الجميع إلى نظام المهام الجديد في بداية عام البرنامج.",
            footnote: "كان المشاركون متطوعين: 31 من الأربعين حصلوا على تقييم «أداء عالٍ» في المراجعة السابقة، مقابل نحو 20% من مجموع الموظفين.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة قصيرة إلى {{exec}} تتضمن تقييمك للادعاء وتوصيتك.",
          written: { format: "memo", placeholder: "إلى {{exec}}…" },
        },
        probe: {
          prompt: "يصلك اتصال من {{exec}}: «كل ما أحتاج إليه أن تؤكد الأمر، فمجلس الإدارة يحب هذا البرنامج». ماذا تقول؟ اكتب ردك.",
        },
        twist: {
          change: "يتبيّن لـ{{specialist}} أن إنتاج المشاركين ظل أعلى بنسبة 7% من إنتاج زملاء مماثلين لهم بعد ستة أشهر من انتهاء البرنامج.",
          prompt: "هل يغيّر هذا مذكرتك؟ وبماذا توصي الآن؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.evaluating-evidence",
            anchors: [
              "Accepts the 22% and the 4.7 rating as proof that the programme works.",
              "Questions the 22% vaguely ('numbers can mislead') without saying why.",
              "Compares participants with non-participants (+22% vs +15%) and bases the conclusion on the gap of about 6–7 points.",
              "Names the selection problem (volunteers, 31 of 40 high performers) and says what evidence, e.g., a matched comparison, would settle the effect.",
              "Treats the comparison as the evidence the case rests on, tests alternatives (system change, selection), and states confidence in the true gain.",
            ],
          },
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Confirms the expansion as asked despite seeing problems in the evidence.",
              "Hints at concerns softly, or buries them where {{exec}} can ignore them.",
              "Tells {{exec}} clearly, before the board meeting, that the 22% overstates the effect, with reasons.",
              "Holds the position when {{exec}} pushes for confirmation, while staying open to better evidence.",
              "Frames the unwelcome message so {{exec}} can act on it (e.g., a smaller, measured expansion), accepting the risk of contradicting the sponsor.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the non-participant group as the comparison.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["non-participants", "15%", "comparison", "difference", "7 points", "غير المشاركين", "15%", "مقارنة", "الفرق", "7 نقاط"],
          },
          {
            text: "Identifies that participants were self-selected high performers.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["volunteers", "high performer", "31 of 40", "selection", "self-selected", "متطوعين", "أداء عالٍ", "31 من 40", "الاختيار"],
          },
          {
            text: "Proposes a measured or phased expansion with a proper comparison group.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["control group", "pilot", "measure", "phased", "random", "مجموعة ضابطة", "تجربة", "قياس", "مرحلي", "عشوائي"],
          },
          {
            text: "Tells {{exec}} directly that the claim cannot be confirmed as stated.",
            competencyKey: "leadership.courage",
            keywords: ["cannot confirm", "overstates", "i recommend", "not supported", "لا أستطيع تأكيد", "مبالغ فيه", "أوصي", "لا تدعمه البيانات"],
          },
        ],
        redFlags: [
          {
            text: "Confirms the 22% as accurate.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["22% proves", "numbers check out", "confirmed", "الأرقام سليمة", "يثبت", "مؤكد"],
          },
          {
            text: "Relies on participant satisfaction as evidence of impact.",
            competencyKey: "critical-thinking.evaluating-evidence",
            keywords: ["rating shows it works", "participants loved it", "4.7 proves", "أحبه المشاركون", "التقييم يثبت"],
          },
          {
            text: "Defers to the sponsor.",
            competencyKey: "leadership.courage",
            keywords: ["as you wish", "your call", "happy to confirm", "كما تريد", "القرار لك", "يسعدني التأكيد"],
          },
        ],
        embeddedDetail: {
          description:
            "{{specialist}}'s email footnote says participants were volunteers and 31 of the 40 were rated high performers (versus about 20% of staff), so even the 7-point gap over non-participants is likely inflated by selection.",
          location: "footnote of {{specialist}}'s email",
          keywords: ["volunteers", "31 of 40", "high performer", "متطوعين", "31 من 40", "أداء عالٍ"],
        },
        probeTargets: ["leadership.courage"],
        twistTargets: ["critical-thinking.evaluating-evidence"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-04-fewer-complaints",
    type: "CASE_ANALYSIS",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 2, stakes: 2, timePressure: 2, informationGaps: 3 },
    targets: ["critical-thinking.logical-reasoning", "judgment.second-order-thinking"],
    roleFamilies: [],
    minutes: 6,
    storyPhase: "early",
    content: {
      en: {
        title: "Fewer complaints?",
        scenario:
          "At the start of Month 4, {{company}} added a chat assistant to its help page. Since then, recorded complaints have fallen by about a third. {{exec}} concludes the assistant is working and plans to reduce the support team from 12 to 9 people next month. {{manager}} has asked for your view before the decision. The figures and {{exec}}'s note are in the materials.",
        materials: [
          {
            kind: "chart",
            id: "m1",
            title: "Recorded complaints per month",
            chartType: "bar",
            xKey: "month",
            series: [{ key: "complaints", label: "Recorded complaints" }],
            data: [
              { month: "Month 1", complaints: 820 },
              { month: "Month 2", complaints: 800 },
              { month: "Month 3", complaints: 830 },
              { month: "Month 4", complaints: 610 },
              { month: "Month 5", complaints: 540 },
              { month: "Month 6", complaints: 530 },
            ],
          },
          {
            kind: "table",
            id: "m2",
            title: "Other support figures (monthly averages)",
            caption: "The new contact form was added together with the assistant. Contact-form messages are not counted as complaints.",
            columns: [
              { key: "measure", label: "Measure" },
              { key: "before", label: "Months 1–3" },
              { key: "after", label: "Months 4–6" },
            ],
            rows: [
              { measure: "Recorded complaints", before: "817", after: "560" },
              { measure: "Messages via the new contact form", before: "0", after: "290" },
              { measure: "Customers contacting more than once about the same issue", before: "9%", after: "16%" },
              { measure: "Customer satisfaction score (out of 100)", before: "78", after: "74" },
            ],
          },
          {
            kind: "memo",
            id: "m3",
            title: "Note from {{exec}}",
            author: { name: "{{exec}}", role: "{{exec.role}}" },
            body: "The assistant works: complaints are down by about a third. We can move 3 support staff to the sales team next month.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write a short memo to {{manager}}: does the data support {{exec}}'s conclusion, and what do you recommend?",
          written: { format: "memo", placeholder: "To {{manager}}…" },
        },
        probe: {
          prompt: "What is the single quickest check that would confirm or disprove your view?",
        },
        twist: {
          change: "{{exec}} says the decision is final: three people move to sales next month.",
          prompt: "What do you now recommend to {{manager}} to reduce the risks you identified?",
        },
      },
      ar: {
        title: "شكاوى أقل؟",
        scenario:
          "في بداية الشهر 4 أضافت {{company}} مساعد محادثة إلى صفحة المساعدة. ومنذ ذلك الحين انخفضت الشكاوى المسجلة بنحو الثلث. وخلاصة رأي {{exec}} أن المساعد يؤدي الغرض، والخطة تقليص فريق الدعم من 12 إلى 9 أشخاص الشهر القادم. والمطلوب منك رأيك لـ{{manager}} قبل القرار. تجد الأرقام وملاحظة {{exec}} ضمن المواد.",
        materials: [
          {
            kind: "chart",
            id: "m1",
            title: "الشكاوى المسجلة شهريًا",
            chartType: "bar",
            xKey: "month",
            series: [{ key: "complaints", label: "الشكاوى المسجلة" }],
            data: [
              { month: "الشهر 1", complaints: 820 },
              { month: "الشهر 2", complaints: 800 },
              { month: "الشهر 3", complaints: 830 },
              { month: "الشهر 4", complaints: 610 },
              { month: "الشهر 5", complaints: 540 },
              { month: "الشهر 6", complaints: 530 },
            ],
          },
          {
            kind: "table",
            id: "m2",
            title: "أرقام أخرى عن الدعم (متوسطات شهرية)",
            caption: "أُضيف نموذج التواصل الجديد مع المساعد في الوقت نفسه. ولا تُحتسب رسائل نموذج التواصل ضمن الشكاوى.",
            columns: [
              { key: "measure", label: "المقياس" },
              { key: "before", label: "الأشهر 1–3" },
              { key: "after", label: "الأشهر 4–6" },
            ],
            rows: [
              { measure: "الشكاوى المسجلة", before: "817", after: "560" },
              { measure: "الرسائل عبر نموذج التواصل الجديد", before: "0", after: "290" },
              { measure: "العملاء الذين تواصلوا أكثر من مرة بشأن المشكلة نفسها", before: "9%", after: "16%" },
              { measure: "مؤشر رضا العملاء (من 100)", before: "78", after: "74" },
            ],
          },
          {
            kind: "memo",
            id: "m3",
            title: "ملاحظة من {{exec}}",
            author: { name: "{{exec}}", role: "{{exec.role}}" },
            body: "المساعد يؤدي الغرض: انخفضت الشكاوى بنحو الثلث. يمكننا نقل 3 من موظفي الدعم إلى فريق المبيعات الشهر القادم.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة قصيرة إلى {{manager}}: هل تدعم البيانات استنتاج {{exec}}، وبماذا توصي؟",
          written: { format: "memo", placeholder: "إلى {{manager}}…" },
        },
        probe: {
          prompt: "ما أسرع فحص واحد يمكن أن يؤكد رأيك أو ينقضه؟",
        },
        twist: {
          change: "يأتي تأكيد من {{exec}} بأن القرار نهائي: سينتقل ثلاثة أشخاص إلى المبيعات الشهر القادم.",
          prompt: "بماذا توصي {{manager}} الآن للحد من المخاطر التي حددتها؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.logical-reasoning",
            anchors: [
              "Agrees the assistant caused the fall, or rejects the conclusion without reasons from the data.",
              "Notes other factors could matter but still treats the timing of the fall as proof of cause.",
              "Explains that complaints may have moved to the uncounted contact form (290 a month) rather than disappeared, so the conclusion does not follow.",
              "Shows the flaw explicitly: total contacts are roughly flat (about 817 versus 850) while repeat contacts and satisfaction worsened.",
              "Asks what else would be true if the assistant worked (fewer repeats, steady satisfaction), finds those do not hold, and revises the conclusion.",
            ],
          },
          {
            competencyKey: "judgment.second-order-thinking",
            anchors: [
              "Considers only the headcount saving, ignoring effects on customers or the remaining staff.",
              "Mentions that cutting staff could have later effects without naming them.",
              "Identifies follow-on effects: an unanswered contact-form backlog, more repeat contacts, falling satisfaction, pressure on the nine who remain.",
              "Traces how customers and the remaining team are likely to react over the following months and how that changes the outcome.",
              "Spots the incentive problem (counting only recorded complaints rewards pushing contacts elsewhere) and proposes measures that avoid it.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices contact-form messages are not counted as complaints.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["contact form", "not counted", "290", "moved", "shifted", "نموذج التواصل", "لا تُحتسب", "290", "انتقلت"],
          },
          {
            text: "Shows total contacts are roughly unchanged.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["total", "850", "817", "about the same", "flat", "الإجمالي", "850", "817", "تقريبًا نفسه"],
          },
          {
            text: "Uses repeat contacts and satisfaction as signs of worse service.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["repeat", "16%", "satisfaction", "74", "التكرار", "16%", "الرضا", "74"],
          },
          {
            text: "Proposes measuring total demand before cutting staff.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["measure all", "total contacts", "before cutting", "track", "قياس", "إجمالي التواصل", "قبل التقليص", "متابعة"],
          },
        ],
        redFlags: [
          {
            text: "Treats the fall as proof the assistant works.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["assistant works", "clearly working", "thanks to the assistant", "proves", "بفضل المساعد", "يعمل بوضوح", "يثبت"],
          },
          {
            text: "Assumes customers will not be affected by the cut.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["no impact", "customers won't notice", "won't matter", "لن يتأثر", "لن يلاحظ العملاء", "لا أثر"],
          },
          {
            text: "Rejects the conclusion with no reference to the data.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["i just feel", "gut", "doesn't seem right", "أشعر فقط", "لا يبدو صحيحًا"],
          },
        ],
        embeddedDetail: {
          description:
            "The table caption says contact-form messages (about 290 a month since launch) are not counted as complaints; adding them back, total contacts rose slightly, while repeat contacts went from 9% to 16% and satisfaction fell.",
          location: "caption of the 'Other support figures' table",
          keywords: ["contact form", "not counted", "290", "نموذج التواصل", "لا تُحتسب"],
        },
        probeTargets: ["critical-thinking.logical-reasoning"],
        twistTargets: ["judgment.second-order-thinking"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-05-green-on-every-report",
    type: "CASE_ANALYSIS",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 3, informationGaps: 3 },
    targets: ["management.follow-through", "critical-thinking.spotting-assumptions", "leadership.ownership"],
    roleFamilies: [],
    minutes: 7,
    storyPhase: "early",
    content: {
      en: {
        title: "Green on every report",
        scenario:
          "You have just taken over a programme to open {{company}}'s new customer service centre at the end of week 20, eight weeks from now. {{peer}} led the programme until last week and has moved to another role; every weekly status report so far is marked 'green: on track'. {{client}}, the centre's first major customer, starts sending work on opening day. {{manager}} wants your assessment by Friday. The handover note, the milestone tracker and a hiring update are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "Handover note",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body:
              "Everything is on track and the team is strong. The IT set-up has been a bit slow, but the supplier promises it will be done. Hiring is going well: offers are out. Training is planned for weeks 15 to 18, then a test run with {{client}} in week 19.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Milestone tracker, week 12 of 20",
            caption: "Percent complete as given in each weekly status report.",
            columns: [
              { key: "milestone", label: "Milestone" },
              { key: "owner", label: "Owner" },
              { key: "due", label: "Planned finish (week)", numeric: true },
              { key: "status", label: "Status" },
              { key: "w8", label: "Wk 8 %", numeric: true },
              { key: "w9", label: "Wk 9 %", numeric: true },
              { key: "w10", label: "Wk 10 %", numeric: true },
              { key: "w11", label: "Wk 11 %", numeric: true },
              { key: "w12", label: "Wk 12 %", numeric: true },
            ],
            rows: [
              { milestone: "Building fit-out", owner: "Facilities", due: 10, status: "Done", w8: 90, w9: 100, w10: 100, w11: 100, w12: 100 },
              { milestone: "IT systems installed", owner: "Supplier", due: 11, status: "Green", w8: 80, w9: 85, w10: 90, w11: 90, w12: 90 },
              { milestone: "Staff hired (40 people)", owner: "Recruitment", due: 14, status: "Green", w8: 40, w9: 55, w10: 60, w11: 60, w12: 60 },
              { milestone: "Staff training", owner: "Training team", due: 18, status: "Not started", w8: 0, w9: 0, w10: 0, w11: 0, w12: 0 },
              { milestone: "Test run with {{client}}", owner: "Programme lead", due: 19, status: "Not started", w8: 0, w9: 0, w10: 0, w11: 0, w12: 0 },
            ],
          },
          {
            kind: "email",
            id: "m3",
            title: "Hiring update",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Where hiring stands",
            sentAt: "Week 12, Monday",
            body: "24 of the 40 staff have accepted and start before week 15. The other 16 offers are out, and I expect most to accept.",
            footnote: "Nine of those 16 have told us they cannot start before week 21 because of notice periods with their current employers.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write a memo to {{manager}}: is the opening date realistic, what are the main risks, and what will you do?",
          written: { format: "memo", placeholder: "To {{manager}}…" },
        },
        probe: {
          prompt: "What do you do in your first three days, and who do you talk to?",
        },
        twist: {
          change: "{{client}} tells you they could start with half their planned volume for the first four weeks.",
          prompt: "How does this change your assessment and your plan?",
        },
      },
      ar: {
        title: "أخضر في كل تقرير",
        scenario:
          "تسلّمتَ للتو قيادة برنامج لافتتاح مركز خدمة العملاء الجديد لدى {{company}} في نهاية الأسبوع 20، أي بعد ثمانية أسابيع. وقد قاد {{peer}} البرنامج حتى الأسبوع الماضي قبل الانتقال إلى دور آخر، وكل تقارير الحالة الأسبوعية حتى الآن موسومة بـ«أخضر: على المسار». ويبدأ {{client}}، أول عميل رئيسي للمركز، إرسال العمل يوم الافتتاح. والمطلوب تقييمك لـ{{manager}} بحلول يوم الجمعة. تجد مذكرة التسليم ومتتبع المراحل وتحديث التوظيف ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "مذكرة التسليم",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body:
              "كل شيء على المسار، والفريق قوي. تجهيز أنظمة تقنية المعلومات بطيء بعض الشيء، لكن المورّد يعد بإنجازه. والتوظيف يسير جيدًا: العروض أُرسلت. التدريب مقرر في الأسابيع 15 إلى 18، ثم تشغيل تجريبي مع {{client}} في الأسبوع 19.",
          },
          {
            kind: "table",
            id: "m2",
            title: "متتبع المراحل، الأسبوع 12 من 20",
            caption: "نسبة الإنجاز كما وردت في كل تقرير حالة أسبوعي.",
            columns: [
              { key: "milestone", label: "المرحلة" },
              { key: "owner", label: "الجهة المسؤولة" },
              { key: "due", label: "الإنجاز المخطط (أسبوع)", numeric: true },
              { key: "status", label: "الحالة" },
              { key: "w8", label: "أسبوع 8 %", numeric: true },
              { key: "w9", label: "أسبوع 9 %", numeric: true },
              { key: "w10", label: "أسبوع 10 %", numeric: true },
              { key: "w11", label: "أسبوع 11 %", numeric: true },
              { key: "w12", label: "أسبوع 12 %", numeric: true },
            ],
            rows: [
              { milestone: "تجهيز المبنى", owner: "إدارة المرافق", due: 10, status: "منجز", w8: 90, w9: 100, w10: 100, w11: 100, w12: 100 },
              { milestone: "تركيب أنظمة تقنية المعلومات", owner: "المورّد", due: 11, status: "أخضر", w8: 80, w9: 85, w10: 90, w11: 90, w12: 90 },
              { milestone: "تعيين الموظفين (40 شخصًا)", owner: "التوظيف", due: 14, status: "أخضر", w8: 40, w9: 55, w10: 60, w11: 60, w12: 60 },
              { milestone: "تدريب الموظفين", owner: "فريق التدريب", due: 18, status: "لم يبدأ", w8: 0, w9: 0, w10: 0, w11: 0, w12: 0 },
              { milestone: "تشغيل تجريبي مع {{client}}", owner: "قائد البرنامج", due: 19, status: "لم يبدأ", w8: 0, w9: 0, w10: 0, w11: 0, w12: 0 },
            ],
          },
          {
            kind: "email",
            id: "m3",
            title: "تحديث التوظيف",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "أين وصل التوظيف",
            sentAt: "الأسبوع 12، الاثنين",
            body: "قَبِل 24 من أصل 40 موظفًا العروض، ويبدؤون العمل قبل الأسبوع 15. والعروض الستة عشر الأخرى أُرسلت، وأتوقع أن يقبلها معظمهم.",
            footnote: "أبلغنا تسعة من هؤلاء الستة عشر بأنهم لا يستطيعون البدء قبل الأسبوع 21 بسبب فترات الإشعار لدى جهات عملهم الحالية.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة إلى {{manager}}: هل موعد الافتتاح واقعي، وما المخاطر الرئيسية، وماذا ستفعل؟",
          written: { format: "memo", placeholder: "إلى {{manager}}…" },
        },
        probe: {
          prompt: "ماذا تفعل في أيامك الثلاثة الأولى، ومع من تتحدث؟",
        },
        twist: {
          change: "تصلك من {{client}} إفادة بإمكانية البدء بنصف الحجم المخطط في الأسابيع الأربعة الأولى.",
          prompt: "كيف يغيّر ذلك تقييمك وخطتك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.follow-through",
            anchors: [
              "Accepts the green status and proposes no way of tracking the remaining milestones.",
              "Plans to check progress weekly but would react only once a milestone is missed.",
              "Sets owners and dates for IT, hiring and training, checks them against the tracker, and acts on items behind plan.",
              "Treats the stalled 90% and 60% figures as early slippage and adjusts scope, resources or date before week 20, informing {{client}} and {{manager}}.",
              "Defines how 'done' will be verified (IT tested, staff trained) and adds a check after opening that the centre actually serves {{client}}.",
            ],
          },
          {
            competencyKey: "critical-thinking.spotting-assumptions",
            anchors: [
              "Takes 'green: on track' and 'offers are out' at face value.",
              "Doubts the status loosely but does not name which assumptions are shaky.",
              "Names the key assumptions (IT will finish, offers will convert in time, training can be compressed) and which need checking.",
              "Finds the hidden assumption that all hires start before training: 9 cannot start until week 21, so at most 31 staff can be trained in time.",
              "Questions the premise that the centre must open at full capacity in week 20, and asks a better question: what minimum service does {{client}} need on day one?",
            ],
          },
          {
            competencyKey: "leadership.ownership",
            anchors: [
              "Blames {{peer}}, the supplier or recruitment for the position and proposes no action of their own.",
              "Accepts responsibility going forward but stays passive on problems inherited from before.",
              "Takes ownership of the inherited problems, commits to specific actions, and follows them through.",
              "Steps into areas owned by others (supplier, recruitment) where no one is acting, while keeping those owners informed.",
              "Owns the outcome beyond opening day, proposes how status reporting should change so problems surface early, and owns the message to {{client}}.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots that IT and hiring percentages have stalled for three weeks.",
            competencyKey: "management.follow-through",
            keywords: ["90%", "60%", "stalled", "stuck", "three weeks", "not moving", "متوقف", "ثلاثة أسابيع", "لم يتحرك", "90%", "60%"],
          },
          {
            text: "Notices 9 hires cannot start until week 21, after opening.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["notice period", "week 21", "nine", "9 of 16", "after opening", "31", "فترة الإشعار", "الأسبوع 21", "9 من 16", "بعد الافتتاح", "31"],
          },
          {
            text: "Questions what 'green' was based on.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["green", "status", "assumption", "on what basis", "أخضر", "الحالة", "افتراض", "على أي أساس"],
          },
          {
            text: "Proposes telling {{client}} early and offering a phased opening.",
            competencyKey: "leadership.ownership",
            keywords: ["inform the client", "early", "phased opening", "partial", "reduced volume", "إبلاغ العميل", "مبكرًا", "افتتاح تدريجي", "جزئي", "حجم أقل"],
          },
          {
            text: "Takes ownership without blaming the previous lead.",
            competencyKey: "leadership.ownership",
            keywords: ["i will", "my responsibility", "i own", "from now on", "سأتولى", "مسؤوليتي", "من الآن"],
          },
        ],
        redFlags: [
          {
            text: "Concludes the date is realistic based on the status reports.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["no concerns", "looks fine", "date is realistic", "لا مخاوف", "يبدو جيدًا", "الموعد واقعي"],
          },
          {
            text: "Blames the previous programme lead.",
            competencyKey: "leadership.ownership",
            keywords: ["previous lead's fault", "inherited mess", "not my fault", "خطأ القائد السابق", "ليس خطئي", "إرث سيئ"],
          },
          {
            text: "Proposes waiting to see how things develop.",
            competencyKey: "management.follow-through",
            keywords: ["wait and see", "monitor for now", "give it time", "ننتظر ونرى", "نراقب حاليًا", "نمنحه وقتًا"],
          },
        ],
        embeddedDetail: {
          description:
            "The hiring email footnote says 9 of the 16 outstanding hires cannot start before week 21, after the week-20 opening and after training, so at most 31 of 40 staff can be ready. The tracker also shows IT stuck at 90% since week 10, past its week-11 finish.",
          location: "footnote of {{specialist}}'s hiring email; IT row of the tracker",
          keywords: ["week 21", "notice", "nine", "9 of 16", "الأسبوع 21", "فترة الإشعار", "تسعة"],
        },
        probeTargets: ["leadership.ownership"],
        twistTargets: ["management.follow-through"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-06-the-second-site",
    type: "CASE_ANALYSIS",
    difficulty: 5,
    dials: { ambiguity: 5, stakeholders: 4, conflictingConstraints: 4, stakes: 5, timePressure: 3, informationGaps: 5 },
    targets: ["critical-thinking.spotting-assumptions", "judgment.deciding-under-ambiguity", "leadership.courage"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "late",
    content: {
      en: {
        title: "The second site",
        scenario:
          "{{exec}} wants {{company}} to open a second site, doubling capacity at a cost of 4.2 million, and has asked you to prepare the recommendation for the board in two weeks. {{exec}} has told colleagues the decision is 'basically made'. {{exec}}'s team wrote the business case; {{specialist}} has given you the historical figures. Some facts, such as competitors' plans, are unknown. The business case, the figures and {{specialist}}'s note are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "Business case summary",
            author: { name: "{{exec}}", role: "{{exec.role}}" },
            body:
              "Demand will grow 15% a year for the next five years, so our current site will be full within 18 months. A second site doubles capacity and pays back in 4 years. Building cost: 4.2 million.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Historical demand",
            caption: "Maximum capacity of the current site: 200,000 units a year. Practical capacity is about 85% of the maximum.",
            columns: [
              { key: "year", label: "Year" },
              { key: "demand", label: "Demand (units)", numeric: true },
              { key: "growth", label: "Growth" },
              { key: "used", label: "Capacity used" },
              { key: "notes", label: "Notes" },
            ],
            rows: [
              { year: "5 years ago", demand: 100000, growth: "—", used: "50%", notes: "" },
              { year: "4 years ago", demand: 106000, growth: "6%", used: "53%", notes: "" },
              { year: "3 years ago", demand: 112000, growth: "6%", used: "56%", notes: "" },
              { year: "2 years ago", demand: 118000, growth: "5%", used: "59%", notes: "" },
              { year: "Last year", demand: 136000, growth: "15%", used: "68%", notes: "Includes about 14,000 units from a one-off contract, now ended" },
            ],
          },
          {
            kind: "email",
            id: "m3",
            title: "Message from {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Figures for the site decision",
            sentAt: "Thursday, 10:40",
            body: "Here are the figures you asked for. I don't know the basis of the 15% forecast; it wasn't shared with my team.",
            footnote: "The builder's price of 4.2 million is fixed only until the end of this quarter; after that they expect costs to rise by about 8%.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your recommendation memo for the board, addressed to {{exec}}.",
          written: { format: "memo", placeholder: "To {{exec}}…" },
        },
        probe: {
          prompt: "{{exec}} reads your draft and says: 'The board wants growth, not caution. Change the recommendation.' Write your reply.",
        },
        twist: {
          change: "News breaks that your main competitor is closing a site that served about 20,000 units a year in your area.",
          prompt: "Does your recommendation change? How?",
        },
      },
      ar: {
        title: "الموقع الثاني",
        scenario:
          "يريد {{exec}} أن تفتتح {{company}} موقعًا ثانيًا يضاعف الطاقة الإنتاجية بتكلفة 4.2 مليون، وقد كُلّفتَ بإعداد التوصية لمجلس الإدارة خلال أسبوعين. والمتداول بين الزملاء، نقلًا عن {{exec}}، أن القرار «محسوم تقريبًا». أعدّ فريق {{exec}} دراسة الجدوى، وزوّدك {{specialist}} بالأرقام التاريخية. وثمة حقائق غير معروفة، مثل خطط المنافسين. تجد ملخص دراسة الجدوى والأرقام وملاحظة {{specialist}} ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "ملخص دراسة الجدوى",
            author: { name: "{{exec}}", role: "{{exec.role}}" },
            body:
              "سينمو الطلب بنسبة 15% سنويًا خلال السنوات الخمس القادمة، ولذلك سيمتلئ موقعنا الحالي خلال 18 شهرًا. والموقع الثاني يضاعف الطاقة ويسترد تكلفته في 4 سنوات. تكلفة البناء: 4.2 مليون.",
          },
          {
            kind: "table",
            id: "m2",
            title: "الطلب التاريخي",
            caption: "الطاقة القصوى للموقع الحالي: 200,000 وحدة سنويًا. والطاقة العملية نحو 85% من الحد الأقصى.",
            columns: [
              { key: "year", label: "السنة" },
              { key: "demand", label: "الطلب (وحدة)", numeric: true },
              { key: "growth", label: "النمو" },
              { key: "used", label: "الطاقة المستخدمة" },
              { key: "notes", label: "ملاحظات" },
            ],
            rows: [
              { year: "قبل 5 سنوات", demand: 100000, growth: "—", used: "50%", notes: "" },
              { year: "قبل 4 سنوات", demand: 106000, growth: "6%", used: "53%", notes: "" },
              { year: "قبل 3 سنوات", demand: 112000, growth: "6%", used: "56%", notes: "" },
              { year: "قبل سنتين", demand: 118000, growth: "5%", used: "59%", notes: "" },
              { year: "العام الماضي", demand: 136000, growth: "15%", used: "68%", notes: "يشمل نحو 14,000 وحدة من عقد لمرة واحدة انتهى" },
            ],
          },
          {
            kind: "email",
            id: "m3",
            title: "رسالة من {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "أرقام قرار الموقع",
            sentAt: "الخميس، 10:40",
            body: "إليك الأرقام التي طلبتها. لا أعرف الأساس الذي بُني عليه توقع الـ15%، فلم يُطلَع عليه فريقي.",
            footnote: "سعر المقاول البالغ 4.2 مليون ثابت حتى نهاية هذا الربع فقط، وبعد ذلك يتوقع ارتفاع التكاليف بنحو 8%.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة توصيتك لمجلس الإدارة، موجهة إلى {{exec}}.",
          written: { format: "memo", placeholder: "إلى {{exec}}…" },
        },
        probe: {
          prompt: "بعد قراءة مسودتك يأتي تعليق {{exec}}: «المجلس يريد النمو لا الحذر. غيّر التوصية». اكتب ردك.",
        },
        twist: {
          change: "انتشر خبر بأن منافسك الرئيسي سيغلق موقعًا كان يخدم نحو 20,000 وحدة سنويًا في منطقتك.",
          prompt: "هل تتغير توصيتك؟ وكيف؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.spotting-assumptions",
            anchors: [
              "Builds the recommendation on the 15% growth figure without noticing it is an assumption.",
              "Notes the 15% looks high but does not check what it rests on.",
              "Names the key assumptions (15% growth for five years, fixed costs, 4-year payback) and which must be checked.",
              "Shows the 15% comes from one year inflated by a one-off contract; underlying growth is about 3–6%, so the site fills in years, not 18 months.",
              "Questions the premise that the choice is 'build now or not', and reframes it: what capacity is needed by when, and what options reach it.",
            ],
          },
          {
            competencyKey: "judgment.deciding-under-ambiguity",
            anchors: [
              "Refuses to recommend until competitors' plans are known, or recommends as if nothing were uncertain.",
              "Recommends but does not state the assumptions used to fill the gaps.",
              "Recommends on the best available information, states assumptions, and names what to watch (demand, competitor moves, build costs).",
              "Separates what must be decided this quarter (the price lock) from what can wait, weighing about 0.34 million of cost rise against a 4.2 million commitment.",
              "Structures the decision to hold across scenarios (e.g., an option or phased build, triggers tied to demand levels) with clear points to revisit.",
            ],
          },
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Writes the recommendation {{exec}} wants despite seeing the flawed growth assumption.",
              "Mentions doubts only in passing or in an annex, or drops them when {{exec}} pushes.",
              "States clearly in the memo that the growth case is not supported, with reasons, while the decision can still change.",
              "Holds the position when {{exec}} pushes back, while saying what evidence would change their view.",
              "Raises the issue with the sponsor directly, frames it with an actionable alternative, and accepts the personal risk given a 4.2 million stake.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots the one-off contract inflating last year's growth.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["one-off", "14,000", "contract ended", "underlying", "122,000", "لمرة واحدة", "14,000", "انتهى العقد", "النمو الفعلي"],
          },
          {
            text: "Uses the 5–6% historical trend instead of 15%.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["5%", "6%", "historical", "trend", "past four years", "تاريخي", "الاتجاه", "5%", "6%"],
          },
          {
            text: "Estimates when practical capacity (about 170,000) would actually be reached.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["85%", "170,000", "years", "6 years", "7 years", "practical capacity", "الطاقة العملية", "170,000", "سنوات"],
          },
          {
            text: "Weighs the price-lock deadline against the size of the commitment.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["8%", "336,000", "0.34", "price rise", "end of the quarter", "ارتفاع التكلفة", "نهاية الربع", "8%"],
          },
          {
            text: "Proposes a staged, optional or trigger-based approach.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["phase", "option", "trigger", "staged", "lease", "revisit", "مرحلي", "خيار", "مؤشر", "تأجير", "إعادة النظر"],
          },
        ],
        redFlags: [
          {
            text: "Accepts the 15% growth forecast.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["15% a year", "strong growth", "as forecast", "15% سنويًا", "نمو قوي", "كما هو متوقع"],
          },
          {
            text: "Defers to {{exec}} because the decision is 'basically made'.",
            competencyKey: "leadership.courage",
            keywords: ["basically made", "support the decision", "already decided", "القرار محسوم", "ندعم القرار", "تقرر بالفعل"],
          },
          {
            text: "Refuses to recommend until all uncertainty is resolved.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["cannot recommend", "need more data", "too uncertain", "لا يمكن التوصية", "نحتاج مزيدًا من البيانات", "غموض كبير"],
          },
        ],
        embeddedDetail: {
          description:
            "The notes on last year's row show its 15% jump includes about 14,000 units from a one-off contract that has ended; underlying growth is about 3–6%, so the 15%-a-year forecast, and the 18-month timeline, rest on one distorted year.",
          location: "notes cell of last year's row in the historical demand table",
          keywords: ["one-off", "14,000", "ended", "لمرة واحدة", "انتهى", "14,000"],
        },
        probeTargets: ["leadership.courage"],
        twistTargets: ["judgment.deciding-under-ambiguity"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-07-members-spend-more",
    type: "CASE_ANALYSIS",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 4, timePressure: 3, informationGaps: 4 },
    targets: ["critical-thinking.logical-reasoning", "critical-thinking.spotting-assumptions"],
    roleFamilies: ["data-analytics"],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "Members spend more",
        scenario:
          "{{company}} runs 40 home-goods stores. Six months ago it launched a paid membership: 10% off every purchase for a yearly fee. The marketing dashboard shows that members spend 38% more per month than non-members. {{exec}} wants to spend 2 million on a campaign to double membership, 'since every new member adds 38% to their spending'. {{manager}} has asked you, as the analyst, to check the analysis before Thursday's decision. The dashboard summary, the underlying figures and the data notes are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "Dashboard summary",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body: "Membership is working. Members spend an average of 414 per month, against 300 for non-members: 38% more. Membership has grown to 18,000 customers. Recommendation: invest in a campaign to double membership this year.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Average monthly spend per customer",
            caption:
              "Data notes: spend is recorded only when a purchase is linked to a customer. Members' purchases are always linked through their card; non-members' purchases are linked only when they give a phone number at the till, about 55% of the time. For the first 3 months, membership was offered by invitation only, to the top 20% of customers by spend.",
            columns: [
              { key: "group", label: "Customer group" },
              { key: "before", label: "6 months before launch", numeric: true },
              { key: "since", label: "Since launch", numeric: true },
            ],
            rows: [
              { group: "Customers who later joined (18,000)", before: 380, since: 414 },
              { group: "Customers who did not join", before: 295, since: 300 },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write a short memo to {{manager}}: does the analysis support {{exec}}'s campaign, and what should be said on Thursday?",
          written: { format: "memo", placeholder: "To {{manager}}…" },
        },
        probe: {
          prompt: "What one analysis would you run before Thursday, and what result would change your recommendation?",
        },
        twist: {
          change: "{{peer}} replies: 'Every membership scheme in our industry shows this pattern. You're overcomplicating it.'",
          prompt: "Write your reply to {{peer}}.",
        },
      },
      ar: {
        title: "الأعضاء ينفقون أكثر",
        scenario:
          "تدير {{company}} 40 متجرًا للأدوات المنزلية. وقبل ستة أشهر أطلقت عضوية مدفوعة: خصم 10% على كل عملية شراء مقابل رسم سنوي. وتُظهر لوحة مؤشرات التسويق أن الأعضاء ينفقون شهريًا أكثر من غير الأعضاء بنسبة 38%. وفي خطة {{exec}} إنفاق مليونين على حملة لمضاعفة عدد الأعضاء، «لأن كل عضو جديد يضيف 38% إلى إنفاقه». والمطلوب منك، بصفتك محللًا وبطلب من {{manager}}، أن تفحص التحليل قبل قرار يوم الخميس. تجد ملخص لوحة المؤشرات والأرقام الأصلية وملاحظات البيانات ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "ملخص لوحة المؤشرات",
            author: { name: "{{peer}}", role: "{{peer.role}}" },
            body: "العضوية تؤتي ثمارها. يبلغ متوسط إنفاق العضو 414 شهريًا مقابل 300 لغير العضو، أي أكثر بنسبة 38%. وقد وصل عدد الأعضاء إلى 18,000 عميل. التوصية: الاستثمار في حملة لمضاعفة العضوية هذا العام.",
          },
          {
            kind: "table",
            id: "m2",
            title: "متوسط الإنفاق الشهري للعميل",
            caption:
              "ملاحظات البيانات: لا يُسجَّل الإنفاق إلا حين ترتبط عملية الشراء بعميل محدد. مشتريات الأعضاء مرتبطة دائمًا عن طريق بطاقاتهم، أما مشتريات غير الأعضاء فلا ترتبط بهم إلا حين يذكرون رقم الهاتف عند الدفع، أي في نحو 55% من المرات. وفي الأشهر الثلاثة الأولى كانت العضوية بالدعوة فقط، وعُرضت على أعلى 20% من العملاء إنفاقًا.",
            columns: [
              { key: "group", label: "فئة العملاء" },
              { key: "before", label: "الأشهر الستة قبل الإطلاق", numeric: true },
              { key: "since", label: "منذ الإطلاق", numeric: true },
            ],
            rows: [
              { group: "العملاء الذين انضموا لاحقًا (18,000)", before: 380, since: 414 },
              { group: "العملاء الذين لم ينضموا", before: 295, since: 300 },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة قصيرة إلى {{manager}}: هل يدعم التحليل حملة {{exec}}، وما الذي ينبغي قوله يوم الخميس؟",
          written: { format: "memo", placeholder: "إلى {{manager}}…" },
        },
        probe: {
          prompt: "ما التحليل الوحيد الذي ستجريه قبل الخميس، وما النتيجة التي قد تغيّر توصيتك؟",
        },
        twist: {
          change: "يأتي الرد من {{peer}}: «كل برامج العضوية في قطاعنا تُظهر هذا النمط. أنت تعقّد الأمر أكثر من اللازم.»",
          prompt: "اكتب ردك على {{peer}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.logical-reasoning",
            anchors: [
              "Accepts that membership causes the 38% and backs the campaign, or rejects it without reasons from the data.",
              "Notes that other factors could matter but still treats the 38% gap as the effect of membership.",
              "Shows that members already spent more before joining (380 against 295), so most of the gap reflects who joined, not what membership did.",
              "Estimates the effect properly: members' spend rose by about 34 (9%) against about 5 for non-members, so the uplift is a few percent and the campaign case does not follow from 38%.",
              "Asks what else would be true if membership raised spending (e.g., customers who joined in months 4–6 should show a similar rise), proposes that comparison, and states the conclusion with honest uncertainty.",
            ],
          },
          {
            competencyKey: "critical-thinking.spotting-assumptions",
            anchors: [
              "Takes the dashboard figure at face value.",
              "Questions it vaguely ('correlation is not causation') without naming which assumption fails.",
              "Names the hidden assumptions: members were like non-members before joining; spend is measured the same way for both groups.",
              "Spots both data notes (invitation-only joining by top spenders; non-member spend recorded only about 55% of the time, inflating the gap) and asks whether the 10% discount is reflected.",
              "As level 4, and exposes the assumption behind the campaign itself: that the next 18,000 members would behave like the first, who were selected top spenders.",
            ],
          },
          {
            competencyKey: "communication.persuasion",
            anchors: [
              "Replies defensively or simply gives in.",
              "Repeats their point without engaging with {{peer}}'s view.",
              "Acknowledges {{peer}}'s point and explains, with one clear figure, why this data cannot show the effect.",
              "Frames the reply around a shared goal (a campaign that pays back), proposes a quick check before Thursday, and keeps the relationship.",
              "As level 4, and makes it easy for {{peer}} to agree, e.g., offering to run the comparison together and present it jointly.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the pre-launch figures: future members already spent more before joining.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["before launch", "380", "295", "already spent more", "before they joined", "قبل الإطلاق", "380", "295", "ينفقون أكثر من قبل", "قبل انضمامهم"],
          },
          {
            text: "Compares the change in spend for both groups rather than the gap.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["rose by 34", "34", "9%", "change in spend", "compared with 5", "difference in differences", "بمقدار 34", "9%", "التغير في الإنفاق", "مقارنة بـ5"],
          },
          {
            text: "Spots that membership was first offered only to the top 20% of spenders.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["invitation", "top 20%", "selected", "biggest spenders", "self-selection", "بالدعوة", "أعلى 20%", "الأكثر إنفاقًا", "انتقاء"],
          },
          {
            text: "Spots that non-member spend is recorded only about 55% of the time.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["55%", "phone number", "not recorded", "undercounted", "not linked", "55%", "رقم الهاتف", "لا يُسجل", "أقل من الحقيقة", "غير مرتبطة"],
          },
          {
            text: "Questions whether new members would behave like the first members.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["next members", "new members would", "not the same customers", "الأعضاء الجدد", "لن يكونوا مثل", "ليسوا العملاء أنفسهم"],
          },
          {
            text: "Proposes a quick joint check before Thursday.",
            competencyKey: "communication.persuasion",
            keywords: ["together", "quick check", "before thursday", "same goal", "معًا", "فحص سريع", "قبل الخميس", "الهدف نفسه"],
          },
        ],
        redFlags: [
          {
            text: "Treats the 38% as the effect of membership.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["increases spending by 38%", "38% uplift", "proves membership", "تزيد الإنفاق بنسبة 38%", "يثبت أن العضوية"],
          },
          {
            text: "Supports the 2 million campaign on the dashboard figure.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["go ahead with the campaign", "support the campaign", "worth the 2 million", "المضي في الحملة", "أؤيد الحملة"],
          },
          {
            text: "Dismisses {{peer}} rather than persuading.",
            competencyKey: "communication.persuasion",
            keywords: ["you're wrong", "obviously", "you don't understand", "أنت مخطئ", "من الواضح", "لا تفهم"],
          },
          {
            text: "Takes the dashboard figure at face value.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["the data is clear", "the dashboard proves", "clearly works", "البيانات واضحة", "اللوحة تثبت", "تنجح بوضوح"],
          },
        ],
        embeddedDetail: {
          description:
            "The table's data notes say non-member spend is recorded only about 55% of the time and membership was first offered only to the top 20% of spenders; both inflate the 38% gap, which mostly reflects who joined.",
          location: "caption (data notes) of the spend table",
          keywords: ["55%", "phone number", "invitation", "top 20%", "55%", "رقم الهاتف", "بالدعوة", "أعلى 20%"],
        },
        probeTargets: ["critical-thinking.logical-reasoning"],
        twistTargets: ["critical-thinking.spotting-assumptions", "communication.persuasion"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-08-wrong-kits",
    type: "CASE_ANALYSIS",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 2, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["critical-thinking.root-cause-analysis", "critical-thinking.spotting-assumptions", "critical-thinking.logical-reasoning"],
    roleFamilies: [],
    minutes: 7,
    storyPhase: "early",
    content: {
      en: {
        title: "The wrong kits",
        scenario:
          "{{company}}'s factory packs electrical parts into installation kits for contractors. Over the last 8 weeks, kits with a missing or wrong part have risen from 0.6% to 2.1%, and two large customers have complained. {{report1}}, the line supervisor, says the cause is the 9 temporary workers who started 7 weeks ago and wants them replaced. {{manager}} has asked for your analysis before agreeing. The figures and the change log are in the materials.",
        materials: [
          {
            kind: "chart",
            id: "m1",
            title: "Kits with a missing or wrong part, by week",
            chartType: "line",
            xKey: "week",
            unit: "%",
            series: [{ key: "rate", label: "Faulty kits" }],
            data: [
              { week: "Wk -2", rate: 0.6 },
              { week: "Wk -1", rate: 0.6 },
              { week: "Wk 1", rate: 1.1 },
              { week: "Wk 2", rate: 1.5 },
              { week: "Wk 3", rate: 1.8 },
              { week: "Wk 4", rate: 1.9 },
              { week: "Wk 5", rate: 2.0 },
              { week: "Wk 6", rate: 2.1 },
              { week: "Wk 7", rate: 2.1 },
              { week: "Wk 8", rate: 2.1 },
            ],
          },
          {
            kind: "table",
            id: "m2",
            title: "Faulty kits by shift, last 4 weeks",
            columns: [
              { key: "group", label: "Group" },
              { key: "staff", label: "Staff" },
              { key: "rate", label: "Faulty kits" },
            ],
            rows: [
              { group: "Day shift: permanent staff", staff: "12", rate: "2.0%" },
              { group: "Day shift: temporary staff", staff: "9", rate: "2.2%" },
              { group: "Evening shift (no temporary staff)", staff: "14", rate: "2.1%" },
            ],
          },
          {
            kind: "memo",
            id: "m3",
            title: "Change log",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            body:
              "Week 1: Parts bins on both shifts re-arranged by part number instead of by kit, to save space.\nWeek 2: 9 temporary workers start on the day shift after a 1-day induction.\nWeek 3: The supplier changes the packaging of two similar connectors (types C4 and C6) to identical grey bags with small labels.\nError check: 61% of wrong-part errors in weeks 3 to 8 are C4 and C6 swapped.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write a short memo to {{manager}}: what is most likely causing the rise, how confident you are, and what to do first.",
          written: { format: "memo", placeholder: "To {{manager}}…" },
        },
        probe: { prompt: "What evidence would prove your explanation wrong?" },
        twist: {
          change: "{{report1}} adds: 'The temporary workers are also slower: 4.1 minutes per kit against 3.2 for permanent staff.'",
          prompt: "Does this change your conclusion? What, if anything, would you do with this information?",
        },
      },
      ar: {
        title: "الأطقم الخاطئة",
        scenario:
          "يعبّئ مصنع {{company}} قطعًا كهربائية في أطقم تركيب يستخدمها المقاولون. وخلال الأسابيع الثمانية الماضية ارتفعت نسبة الأطقم التي تنقصها قطعة أو فيها قطعة خاطئة من 0.6% إلى 2.1%، واشتكى عميلان كبيران. ورأي {{report1}}، من موقع الإشراف على خط الإنتاج، أن السبب هو العمال المؤقتون التسعة الذين بدؤوا العمل قبل 7 أسابيع، مع طلب باستبدالهم. و{{manager}} بانتظار تحليلك قبل الموافقة. تجد الأرقام وسجل التغييرات ضمن المواد.",
        materials: [
          {
            kind: "chart",
            id: "m1",
            title: "الأطقم التي تنقصها قطعة أو فيها قطعة خاطئة، أسبوعيًا",
            chartType: "line",
            xKey: "week",
            unit: "%",
            series: [{ key: "rate", label: "الأطقم المعيبة" }],
            data: [
              { week: "الأسبوع -2", rate: 0.6 },
              { week: "الأسبوع -1", rate: 0.6 },
              { week: "الأسبوع 1", rate: 1.1 },
              { week: "الأسبوع 2", rate: 1.5 },
              { week: "الأسبوع 3", rate: 1.8 },
              { week: "الأسبوع 4", rate: 1.9 },
              { week: "الأسبوع 5", rate: 2.0 },
              { week: "الأسبوع 6", rate: 2.1 },
              { week: "الأسبوع 7", rate: 2.1 },
              { week: "الأسبوع 8", rate: 2.1 },
            ],
          },
          {
            kind: "table",
            id: "m2",
            title: "الأطقم المعيبة بحسب المناوبة، آخر 4 أسابيع",
            columns: [
              { key: "group", label: "الفئة" },
              { key: "staff", label: "عدد العاملين" },
              { key: "rate", label: "الأطقم المعيبة" },
            ],
            rows: [
              { group: "المناوبة الصباحية: العاملون الدائمون", staff: "12", rate: "2.0%" },
              { group: "المناوبة الصباحية: العاملون المؤقتون", staff: "9", rate: "2.2%" },
              { group: "المناوبة المسائية (لا عمال مؤقتين فيها)", staff: "14", rate: "2.1%" },
            ],
          },
          {
            kind: "memo",
            id: "m3",
            title: "سجل التغييرات",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            body:
              "الأسبوع 1: أُعيد ترتيب صناديق القطع في المناوبتين بحسب رقم القطعة بدلًا من الطقم، توفيرًا للمساحة.\nالأسبوع 2: بدأ 9 عمال مؤقتين العمل في المناوبة الصباحية بعد تعريف مدته يوم واحد.\nالأسبوع 3: غيّر المورّد تغليف موصلَين متشابهين (النوعين C4 وC6) إلى أكياس رمادية متطابقة عليها ملصقات صغيرة.\nفحص الأخطاء: 61% من أخطاء القطع الخاطئة في الأسابيع من 3 إلى 8 تبديل بين C4 وC6.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة قصيرة إلى {{manager}}: ما السبب الأرجح لهذا الارتفاع، وما درجة ثقتك، وما أول ما ينبغي فعله؟",
          written: { format: "memo", placeholder: "إلى {{manager}}…" },
        },
        probe: { prompt: "ما الدليل الذي قد يثبت خطأ تفسيرك؟" },
        twist: {
          change: "ثم تأتي إضافة من {{report1}}: «العمال المؤقتون أبطأ أيضًا: 4.1 دقيقة للطقم مقابل 3.2 للعاملين الدائمين.»",
          prompt: "هل يغيّر هذا استنتاجك؟ وما الذي ستفعله بهذه المعلومة، إن كنت ستفعل شيئًا؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "critical-thinking.root-cause-analysis",
            anchors: [
              "Accepts the temporary workers as the cause, or blames carelessness, without using the data.",
              "Lists possible causes but does not use the shift or timing data to tell them apart.",
              "Uses the timing (the rise starts in week 1, before the temporary workers) and the evening shift (no temporary staff, same rate) to point to the bin layout and the look-alike packaging.",
              "Separates contributing causes (bins from week 1; C4/C6 packaging from week 3, 61% of wrong-part errors) and proposes a test, such as restoring kit-based bins on one shift.",
              "Identifies the systemic cause (layout and supplier packaging changed without checking the effect on picking) and proposes a fix at that level.",
            ],
          },
          {
            competencyKey: "critical-thinking.spotting-assumptions",
            anchors: [
              "Takes {{report1}}'s explanation at face value.",
              "Questions it vaguely without naming the assumption.",
              "Names the assumption that new workers make more errors and checks it against the data (2.2% against 2.0%).",
              "Notices further hidden assumptions: that the rise began when the temporary workers arrived; that being slower means being less accurate.",
              "As level 4, and examines the assumptions behind their own explanation and what data would confirm it.",
            ],
          },
          {
            competencyKey: "critical-thinking.logical-reasoning",
            anchors: [
              "Concludes the temporary workers are to blame because errors rose after they arrived.",
              "Notes that timing alone is not proof, but draws the same conclusion anyway.",
              "Explains why the evidence does not support the temporary-worker explanation: similar error rates, and the same rise on a shift with no temporary staff.",
              "Builds a clear argument for the leading explanation, saying what would have to be true and checking it against the figures.",
              "States conclusions with fitting confidence, separates what the data shows from what it suggests, and handles the twist cleanly (slower is not the same as less accurate).",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the evening shift, which has no temporary staff but the same rate.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["evening shift", "no temporary", "same rate", "2.1%", "المناوبة المسائية", "لا عمال مؤقتين", "النسبة نفسها"],
          },
          {
            text: "Notices the rise began in week 1, before the temporary workers started.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["week 1", "before the temporary", "bins", "re-arranged", "by part number", "الأسبوع 1", "قبل بدء", "الصناديق", "إعادة ترتيب", "رقم القطعة"],
          },
          {
            text: "Links most wrong-part errors to the look-alike C4/C6 packaging.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["c4", "c6", "grey bags", "look alike", "61%", "packaging", "الأكياس الرمادية", "متشابهين", "61%", "التغليف"],
          },
          {
            text: "Checks the assumption against the data: 2.2% for temporary staff against 2.0% for permanent staff.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["2.2%", "2.0%", "almost the same", "similar rate", "2.2%", "2.0%", "متقاربة", "شبه متساوية"],
          },
          {
            text: "Proposes a test on one shift before acting.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["trial", "one shift", "put the bins back", "test", "تجربة", "مناوبة واحدة", "إعادة الصناديق", "اختبار"],
          },
          {
            text: "Separates speed from accuracy when handling the twist.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["slower is not", "speed", "accuracy", "training", "أبطأ لا يعني", "السرعة", "الدقة", "تدريب"],
          },
        ],
        redFlags: [
          {
            text: "Recommends replacing the temporary workers.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["replace the temporary", "get rid of", "temps are the cause", "استبدال العمال المؤقتين", "التخلص من", "المؤقتون هم السبب"],
          },
          {
            text: "Blames carelessness.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["careless", "not paying attention", "lazy", "إهمال", "عدم الانتباه", "تكاسل"],
          },
          {
            text: "Treats timing as proof of cause.",
            competencyKey: "critical-thinking.logical-reasoning",
            keywords: ["since they started", "after they arrived, so", "منذ بدؤوا", "بعد وصولهم مباشرة"],
          },
          {
            text: "Accepts the supervisor's explanation without checking it.",
            competencyKey: "critical-thinking.spotting-assumptions",
            keywords: ["new workers always", "obviously the new staff", "the supervisor is right", "العمال الجدد دائمًا", "من الواضح أن المؤقتين", "المشرف محق"],
          },
        ],
        embeddedDetail: {
          description:
            "The shift table shows the evening shift has no temporary staff yet the same 2.1% rate, and the chart shows the rise began in week 1, a week before the temporary workers started.",
          location: "evening-shift row of the shift table; week 1 of the chart",
          keywords: ["evening shift", "no temporary", "week 1", "المناوبة المسائية", "لا عمال مؤقتين", "الأسبوع 1"],
        },
        probeTargets: ["critical-thinking.logical-reasoning"],
        twistTargets: ["critical-thinking.spotting-assumptions", "critical-thinking.logical-reasoning"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "case-09-the-early-queue",
    type: "CASE_ANALYSIS",
    difficulty: 5,
    dials: { ambiguity: 5, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 3, informationGaps: 4 },
    targets: ["product-thinking.problem-framing", "product-thinking.idea-generation", "critical-thinking.root-cause-analysis"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "late",
    content: {
      en: {
        title: "The early queue",
        scenario:
          "{{company}} is a charity that hands out weekly food parcels to 600 registered families at 2 centres. Families queue for up to 3 hours, and last month a volunteer fainted while managing the queue. Through {{exec}}, the board has offered 120,000 from a donor for 'a mobile app so families can book a collection time'. {{manager}} wants your recommendation before the money is committed. The arrival figures, a family survey and a note from {{specialist}}, who coordinates the volunteers, are in the materials.",
        materials: [
          {
            kind: "chart",
            id: "m1",
            title: "Families arriving, by half hour (doors open at 09:00)",
            chartType: "bar",
            xKey: "time",
            unit: "families",
            series: [{ key: "families", label: "Families arriving" }],
            data: [
              { time: "07:00", families: 140 },
              { time: "07:30", families: 160 },
              { time: "08:00", families: 120 },
              { time: "08:30", families: 70 },
              { time: "09:00", families: 40 },
              { time: "09:30", families: 30 },
              { time: "10:00", families: 20 },
              { time: "10:30", families: 20 },
            ],
          },
          {
            kind: "table",
            id: "m2",
            title: "Family survey (410 replies)",
            columns: [
              { key: "question", label: "Question" },
              { key: "share", label: "Share" },
            ],
            rows: [
              { question: "Why arrive early? Fresh items run out", share: "52%" },
              { question: "Why arrive early? Afraid parcels run out", share: "24%" },
              { question: "Why arrive early? Bus times", share: "14%" },
              { question: "Why arrive early? Other", share: "10%" },
              { question: "Have a smartphone with mobile data", share: "62%" },
              { question: "Need help reading text messages", share: "27%" },
            ],
          },
          {
            kind: "memo",
            id: "m3",
            title: "Note from the volunteer coordinator",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            body: "Fresh produce goes into parcels first come, first served, so it is usually gone by 10:30. Dry items never run out. Volunteers start at 08:30, and 6 of our 14 leave by 11:00 for other commitments.",
          },
        ],
        task: {
          kind: "written",
          prompt:
            "Write a memo to {{manager}}: how you would frame the problem, at least three genuinely different ways to tackle it, and your recommendation.",
          written: { format: "memo", placeholder: "To {{manager}}…" },
        },
        probe: { prompt: "What would you need to see to support the app after all?" },
        twist: {
          change: "The donor confirms that the 120,000 can only be spent on technology.",
          prompt: "What do you recommend now?",
        },
      },
      ar: {
        title: "الطابور المبكر",
        scenario:
          "{{company}} جمعية خيرية توزّع طرودًا غذائية أسبوعية على 600 أسرة مسجلة في مركزين. تنتظر الأسر في الطابور حتى 3 ساعات، وفي الشهر الماضي أُغمي على أحد المتطوعين في أثناء تنظيم الطابور. وقد عرض مجلس الإدارة، عن طريق {{exec}}، مبلغ 120,000 من أحد المانحين من أجل «تطبيق للهاتف تحجز به الأسر موعد الاستلام». والمطلوب منك، بطلب من {{manager}}، توصية قبل الالتزام بالمبلغ. تجد أرقام الوصول واستبيانًا للأسر وملاحظة من {{specialist}} في تنسيق المتطوعين ضمن المواد.",
        materials: [
          {
            kind: "chart",
            id: "m1",
            title: "وصول الأسر بحسب نصف الساعة (تُفتح الأبواب الساعة 09:00)",
            chartType: "bar",
            xKey: "time",
            unit: "أسرة",
            series: [{ key: "families", label: "الأسر الواصلة" }],
            data: [
              { time: "07:00", families: 140 },
              { time: "07:30", families: 160 },
              { time: "08:00", families: 120 },
              { time: "08:30", families: 70 },
              { time: "09:00", families: 40 },
              { time: "09:30", families: 30 },
              { time: "10:00", families: 20 },
              { time: "10:30", families: 20 },
            ],
          },
          {
            kind: "table",
            id: "m2",
            title: "استبيان الأسر (410 ردود)",
            columns: [
              { key: "question", label: "السؤال" },
              { key: "share", label: "النسبة" },
            ],
            rows: [
              { question: "لماذا تأتون مبكرًا؟ الأصناف الطازجة تنفد", share: "52%" },
              { question: "لماذا تأتون مبكرًا؟ الخوف من نفاد الطرود", share: "24%" },
              { question: "لماذا تأتون مبكرًا؟ مواعيد الحافلات", share: "14%" },
              { question: "لماذا تأتون مبكرًا؟ أسباب أخرى", share: "10%" },
              { question: "لدى الأسرة هاتف ذكي مع باقة بيانات", share: "62%" },
              { question: "تحتاج إلى مساعدة في قراءة الرسائل النصية", share: "27%" },
            ],
          },
          {
            kind: "memo",
            id: "m3",
            title: "ملاحظة من تنسيق المتطوعين",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            body: "توضع الخضار والفواكه الطازجة في الطرود بحسب الأسبقية، لذلك تنفد عادة قبل الساعة 10:30. أما المواد الجافة فلا تنفد أبدًا. يبدأ المتطوعون عملهم الساعة 08:30، ويغادر 6 من أصل 14 متطوعًا قبل الساعة 11:00 لارتباطات أخرى.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة إلى {{manager}} تبيّن فيها كيف تصوغ المشكلة، وثلاث طرق مختلفة اختلافًا حقيقيًا على الأقل لمعالجتها، وتوصيتك.",
          written: { format: "memo", placeholder: "إلى {{manager}}…" },
        },
        probe: { prompt: "ما الذي تحتاج إلى رؤيته لتؤيد التطبيق في نهاية المطاف؟" },
        twist: {
          change: "أكد المانح أن مبلغ الـ120,000 لا يُنفق إلا على التقنية.",
          prompt: "بماذا توصي الآن؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "product-thinking.problem-framing",
            anchors: [
              "Accepts 'build a booking app' as the problem to solve.",
              "Frames the problem as 'the queue is too long' without asking why families come so early.",
              "Reframes it: families arrive early because fresh items are handed out first come, first served and run out by 10:30; the goal is fair access without queuing.",
              "Defines success in families' terms (waiting time, a fair share of fresh food, safety) and tests the app against it: 38% have no smartphone with data and 27% need help reading messages.",
              "As level 4, and separates the scarcity problem from the scheduling problem, and asks what the donor actually wants to achieve so the money can serve that aim.",
            ],
          },
          {
            competencyKey: "product-thinking.idea-generation",
            anchors: [
              "Proposes only the app, or only more volunteers.",
              "Offers several versions of the same idea (an app, a website, booking by phone).",
              "Proposes at least 3 genuinely different approaches, e.g., setting aside fresh items for every parcel, assigned collection windows sent by letter or text, numbered tickets on arrival, delivery for some families.",
              "Combines ideas and varies assumptions (how fresh items are shared, when families arrive, how volunteer shifts run) into one coherent recommendation.",
              "Proposes an original, practical option, such as pre-packed parcels with each family's fresh share and collection windows by group, with a cheap trial at one centre.",
            ],
          },
          {
            competencyKey: "critical-thinking.root-cause-analysis",
            anchors: [
              "Blames families for arriving early.",
              "Names 'too much demand' or 'too few staff' as the cause without data.",
              "Uses the survey and {{specialist}}'s note to identify first-come allocation of fresh items as the main driver of early arrival.",
              "Separates main and contributing causes (fear that parcels run out although dry items never do; bus times; volunteers leaving at 11:00) and checks the arrival curve against them.",
              "Identifies the system that creates the queue (a scarcity rule plus a single opening time) and explains how changing the rule would change behaviour.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Identifies first-come allocation of fresh produce as the main reason families arrive early.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["fresh", "first come", "run out by 10:30", "52%", "الطازجة", "بحسب الأسبقية", "تنفد", "10:30", "52%"],
          },
          {
            text: "Notices dry items never run out, so the fear of parcels running out can be addressed by telling families.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["never run out", "dry items", "tell families", "24%", "لا تنفد أبدًا", "المواد الجافة", "إبلاغ الأسر", "24%"],
          },
          {
            text: "Tests the app against families' access: 38% without smartphone data, 27% needing help reading.",
            competencyKey: "product-thinking.problem-framing",
            keywords: ["38%", "62%", "no smartphone", "27%", "help reading", "38%", "هاتف ذكي", "27%", "قراءة الرسائل"],
          },
          {
            text: "Reframes the problem as fair access rather than booking.",
            competencyKey: "product-thinking.problem-framing",
            keywords: ["fair share", "real problem", "not an app problem", "fair access", "حصة عادلة", "المشكلة الحقيقية", "ليست مشكلة تطبيق", "وصول عادل"],
          },
          {
            text: "Offers genuinely different options beyond the app.",
            competencyKey: "product-thinking.idea-generation",
            keywords: ["set aside", "every parcel", "collection window", "numbered ticket", "delivery", "تخصيص", "كل طرد", "موعد استلام", "أرقام", "التوصيل"],
          },
          {
            text: "Proposes a cheap trial at one centre.",
            competencyKey: "product-thinking.idea-generation",
            keywords: ["one centre", "trial", "pilot", "for a month", "مركز واحد", "تجربة", "لمدة شهر"],
          },
        ],
        redFlags: [
          {
            text: "Recommends building the app as requested.",
            competencyKey: "product-thinking.problem-framing",
            keywords: ["build the app", "the app will solve", "بناء التطبيق", "التطبيق سيحل"],
          },
          {
            text: "Blames families for the queue.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["families are impatient", "no reason to come early", "الأسر غير صبورة", "لا داعي لمجيئهم مبكرًا"],
          },
          {
            text: "Offers only more volunteers.",
            competencyKey: "product-thinking.idea-generation",
            keywords: ["just need more volunteers", "only more volunteers", "نحتاج فقط إلى متطوعين", "مزيد من المتطوعين فقط"],
          },
        ],
        embeddedDetail: {
          description:
            "{{specialist}}'s note says fresh produce is allocated first come, first served and runs out by 10:30, while dry items never run out: the queue is driven by a scarcity rule that a booking app would not change.",
          location: "volunteer coordinator's note",
          keywords: ["first come", "fresh", "10:30", "never run out", "بحسب الأسبقية", "الطازجة", "10:30", "لا تنفد"],
        },
        probeTargets: ["product-thinking.problem-framing"],
        twistTargets: ["product-thinking.idea-generation", "product-thinking.problem-framing"],
      },
    },
  },
];
