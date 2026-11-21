import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  // ───────────────────────────── rp-01 ─────────────────────────────
  {
    id: "rp-01-angry-client",
    type: "ROLE_PLAY",
    difficulty: 3,
    dials: { ambiguity: 2, stakeholders: 3, conflictingConstraints: 3, stakes: 4, timePressure: 3, informationGaps: 3 },
    targets: ["communication.listening", "adaptability.composure-under-pressure", "collaboration.empathy"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "The late salaries",
        scenario:
          "You are the account lead for {{client}}'s company, a key customer that uses {{company}}'s payroll service. Yesterday {{company}} processed the company's monthly salary file a day late, and 120 of its employees were paid late. {{client}} called the support line twice yesterday and was promised a call back both times; nobody called. You have read the incident summary and the account notes. {{client}} has asked to speak to you now.",
        materials: [
          {
            kind: "memo",
            id: "incident",
            title: "Incident summary",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            date: "Yesterday",
            body:
              "Cause: during Monday's system update, a manual approval step for 3 client salary files was skipped. The files were released 26 hours late.\n\nImpact: 120 employees at {{client}}'s company paid 1 day late; 2 other clients affected (35 employees in total).\n\nFix: the approval step has been completed and all salaries are now paid.\n\nPrevention: an automated check that blocks release of any file without approval. Status: in testing, live from the 25th.",
          },
          {
            kind: "table",
            id: "account",
            title: "Account notes",
            columns: [
              { key: "item", label: "Item" },
              { key: "detail", label: "Detail" },
            ],
            rows: [
              { item: "Customer since", detail: "4 years; no previous incidents" },
              { item: "Employees on payroll", detail: "450" },
              { item: "Contract renewal", detail: "In 2 months" },
              { item: "Next payroll run", detail: "The 24th (12 days from today)" },
              { item: "Support tickets yesterday", detail: "2, both marked 'call back promised'; no call logged" },
            ],
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{client}}. You can end it when you think it has reached a good point, or after 8 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{client}}",
              role: "{{client.role}}",
              context:
                "Responsible for HR and payroll at a key customer with 450 employees. A customer for 4 years with no previous incidents; contract renewal in 2 months. Called support twice yesterday; the promised call-backs did not happen.",
            },
            openingLine:
              "I've had 120 employees calling my team all morning asking where their salary is. Your support line promised to call me back twice yesterday, and nobody did. So tell me: why should I trust you with next month's payroll?",
            maxTurns: 8,
          },
        },
        probe: { prompt: "Looking back: what were you trying to achieve in this conversation, and how far did you get? What would you do differently?" },
        twist: {
          change: "An hour later, {{client}} emails: the company's CEO wants a written explanation by the end of today that can be shared with all 120 affected employees.",
          prompt: "Write that explanation.",
        },
      },
      ar: {
        title: "الرواتب المتأخرة",
        scenario:
          "أنت مسؤول حساب شركة {{client}}، وهي عميل رئيسي يستخدم خدمة الرواتب من {{company}}. أمس عالجت {{company}} ملف الرواتب الشهرية لتلك الشركة متأخرةً يومًا، فتأخر صرف رواتب 120 من موظفيها. اتصل {{client}} بخط الدعم مرتين أمس، ووُعد في كل مرة بمعاودة الاتصال، ولم يتصل أحد. قرأت ملخص الحادثة وملاحظات الحساب، والآن طلب {{client}} التحدث إليك.",
        materials: [
          {
            kind: "memo",
            id: "incident",
            title: "ملخص الحادثة",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            date: "أمس",
            body:
              "السبب: في أثناء تحديث النظام يوم الاثنين، تُجووزت خطوة اعتماد يدوية لملفات رواتب 3 عملاء، فصدرت الملفات متأخرة 26 ساعة.\n\nالأثر: تأخر صرف رواتب 120 موظفًا في شركة {{client}} يومًا واحدًا، وتأثر عميلان آخران (35 موظفًا إجمالًا).\n\nالمعالجة: اكتملت خطوة الاعتماد، وصُرفت الرواتب كلها الآن.\n\nالوقاية: فحص آلي يمنع إصدار أي ملف دون اعتماد. الحالة: قيد الاختبار، ويبدأ العمل به يوم 25.",
          },
          {
            kind: "table",
            id: "account",
            title: "ملاحظات الحساب",
            columns: [
              { key: "item", label: "البند" },
              { key: "detail", label: "التفاصيل" },
            ],
            rows: [
              { item: "مدة التعامل", detail: "4 سنوات دون حوادث سابقة" },
              { item: "عدد الموظفين في كشف الرواتب", detail: "450" },
              { item: "تجديد العقد", detail: "بعد شهرين" },
              { item: "دورة الرواتب القادمة", detail: "يوم 24 (بعد 12 يومًا من اليوم)" },
              { item: "تذاكر الدعم أمس", detail: "تذكرتان، كلتاهما بعلامة «وُعد بمعاودة الاتصال»، ولا يوجد اتصال مسجّل" },
            ],
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{client}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 8 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{client}}",
              role: "{{client.role}}",
              context:
                "المسؤولية: الموارد البشرية والرواتب في شركة عميلة رئيسية تضم 450 موظفًا. مدة التعامل مع {{company}}: 4 سنوات دون حوادث سابقة، وتجديد العقد بعد شهرين. أمس: اتصالان بالدعم ووعدان بمعاودة الاتصال لم يُنفَّذا.",
            },
            openingLine:
              "يتصل بفريقي منذ الصباح 120 موظفًا يسألون أين رواتبهم. وعدني خط الدعم لديكم أمس مرتين بمعاودة الاتصال، ولم يتصل أحد. فقل لي: لماذا أثق بكم في رواتب الشهر القادم؟",
            maxTurns: 8,
          },
        },
        probe: { prompt: "بالنظر إلى ما جرى: ما الذي كنت تسعى إلى تحقيقه في هذه المحادثة، وإلى أي حد حققته؟ وما الذي كنت ستفعله على نحو مختلف؟" },
        twist: {
          change: "بعد ساعة وصلتك رسالة من {{client}}: يريد الرئيس التنفيذي للشركة توضيحًا مكتوبًا قبل نهاية اليوم يمكن مشاركته مع الموظفين المتأثرين جميعًا، وعددهم 120.",
          prompt: "اكتب هذا التوضيح.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.listening",
            anchors: [
              "Answers a different question than the one asked, or ignores the missed call-backs {{client}} raises.",
              "Responds to the salary delay but not to the underlying needs: something to tell employees and assurance for the 24th.",
              "Restates {{client}}'s main concerns accurately, asks what is needed now, and responds to both the delay and the missed call-backs.",
              "Picks up unstated concerns, such as facing the CEO and employees, checks them aloud, and shapes the plan around them.",
              "Notices what {{client}} avoids saying, such as doubts about renewal, and explores it tactfully without becoming defensive.",
            ],
          },
          {
            competencyKey: "adaptability.composure-under-pressure",
            anchors: [
              "Becomes defensive, argues about the facts, or matches {{client}}'s anger.",
              "Stays polite but over-apologises or makes promises to relieve the pressure, such as guaranteeing no future errors.",
              "Stays calm and steady, lets {{client}} express the frustration, and keeps moving toward concrete next steps.",
              "Remains composed under hard challenge, admits what is not yet known, and avoids promises the incident memo cannot support.",
              "As level 4, and visibly lowers the temperature, so {{client}} moves from anger to building a plan together.",
            ],
          },
          {
            competencyKey: "collaboration.empathy",
            anchors: [
              "Focuses only on the technical cause and timeline; does not acknowledge how employees or {{client}} were affected.",
              "Acknowledges frustration in general terms without showing understanding of {{client}}'s specific position.",
              "Names the specific impact on employees and on {{client}}'s team, and responds in a way that addresses it.",
              "Recognises that {{client}} must answer to employees and the CEO, and offers help with that, such as a shareable explanation.",
              "Acknowledges feelings fully while staying honest about what can and cannot be promised for the 24th.",
            ],
          },
          {
            competencyKey: "collaboration.self-awareness",
            anchors: [
              "Describes the conversation as entirely successful and puts any difficulty down to {{client}}.",
              "Admits a general weakness, such as needing more patience, without linking it to a moment in this conversation.",
              "Names a specific moment where their own words helped or hurt, and says what they would do differently.",
              "Identifies a habit that shaped the conversation, such as rushing to solutions, and a concrete way to counter it.",
              "Explains how {{client}} probably saw them at key moments and how the gap between intent and impact affected the outcome.",
            ],
          },
          {
            competencyKey: "communication.written-communication",
            anchors: [
              "Blames others, uses internal jargon, or omits that salaries have now been paid.",
              "Includes the facts but in an order that would confuse employees, or omits what happens next.",
              "States what happened, that salaries are paid, an apology, and what will be different next month.",
              "Opens with what employees most need to know, avoids jargon, and gives a contact for questions.",
              "Stays accurate if forwarded, promises nothing beyond the safeguards in place, and works for both the CEO and employees.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Apologises for both the late payment and the missed call-backs.",
            competencyKey: "collaboration.empathy",
            keywords: ["sorry", "apologise", "apologize", "call back", "nobody called", "أعتذر", "اعتذار", "معاودة الاتصال", "لم يتصل"],
          },
          {
            text: "Notices the automated check goes live on the 25th, after the run on the 24th, and offers a manual safeguard for that run.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["24th", "25th", "manual check", "double-check", "يوم 24", "يوم 25", "تحقق يدوي", "مراجعة يدوية"],
          },
          {
            text: "Asks what {{client}} needs most right now before offering solutions.",
            competencyKey: "communication.listening",
            keywords: ["what do you need", "what would help", "ما الذي تحتاج", "ما الذي يساعدك", "كيف يمكنني المساعدة"],
          },
          {
            text: "Offers help to explain the delay to the affected employees.",
            competencyKey: "collaboration.empathy",
            keywords: ["your employees", "explanation", "letter", "share with", "الموظفين", "توضيح", "رسالة", "مشاركتها"],
          },
        ],
        redFlags: [
          {
            text: "Opens with the technical cause or excuses before acknowledging the impact.",
            competencyKey: "collaboration.empathy",
            keywords: ["system update", "technical issue", "not our fault", "تحديث النظام", "مشكلة تقنية", "ليس خطأنا"],
          },
          {
            text: "Promises it will never happen again without saying what is different.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["never happen again", "guarantee", "لن يتكرر", "أضمن لك"],
          },
          {
            text: "Raises contract terms, liability or credits before acknowledging the harm.",
            competencyKey: "communication.listening",
            keywords: ["contract", "liability", "service credit", "العقد", "المسؤولية القانونية", "خصم على الرسوم"],
          },
          {
            text: "Minimises the incident.",
            competencyKey: "collaboration.empathy",
            keywords: ["only one day", "just a day", "small delay", "يوم واحد فقط", "تأخير بسيط"],
          },
        ],
        embeddedDetail: {
          description:
            "The incident memo says the automated check goes live on the 25th, but the account notes show the next payroll run is on the 24th, so the next run is not protected by the fix.",
          location: "prevention line of the incident memo, against the 'next payroll run' row of the account notes",
          keywords: ["24th", "25th", "manual check", "next run", "يوم 24", "يوم 25", "التحقق اليدوي", "الدورة القادمة"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Needs something concrete to tell 120 angry employees and the company's CEO today.",
            "Needs confidence that the run on the 24th will be safe; will ask what is different this time.",
            "Wants the missed call-backs acknowledged as a separate failure; felt ignored.",
            "Will raise a fee credit only if the conversation goes well; it is not the main need.",
            "Is privately considering a competitor at renewal in 2 months.",
          ],
          startingMood: "angry",
          softensWhen: [
            "acknowledges the impact on their employees and their team in specific terms",
            "apologises for the missed call-backs as a separate failure",
            "takes responsibility without blaming a colleague, the system or the client",
            "gives a specific safeguard for the run on the 24th, with an owner and a date",
            "offers help to communicate with the affected employees",
            "asks what they need before proposing solutions",
          ],
          hardensWhen: [
            "opens with a technical explanation or excuses",
            "says it will not happen again without saying what is different",
            "promises without a date or a named owner",
            "mentions contract terms, liability or credits before acknowledging the impact",
            "minimises the problem, for example 'it was only one day'",
            "claims the automated check protects the run on the 24th",
          ],
          resolution:
            "{{client}} agrees to a written plan: a manual double-check with a named owner for the run on the 24th, a direct contact, an explanation for employees today, and a review call after the run. Compensation is left for a later call.",
        },
        probeTargets: ["collaboration.self-awareness"],
        twistTargets: ["communication.written-communication"],
      },
    },
  },
  // ───────────────────────────── rp-02 ─────────────────────────────
  {
    id: "rp-02-underperforming-team-member",
    type: "ROLE_PLAY",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["management.performance-management", "communication.difficult-conversations", "leadership.developing-others"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "The missed deadlines",
        scenario:
          "You lead a team of 7 at {{company}}. {{report2}} joined 18 months ago and had a strong first year. In the last 2 months, 3 of 5 deliverables were late and 2 contained errors that a client noticed. You have not yet discussed this directly; you mentioned one late report briefly in a team meeting. {{manager}} has asked you to resolve the issue before mid-year reviews in 3 weeks. You have booked 30 minutes with {{report2}} today.",
        materials: [
          {
            kind: "table",
            id: "deliverables",
            title: "Deliverables, last 2 months",
            caption: "Portfolio: 'Own' = accounts {{report2}} has managed since joining; 'Transferred' = accounts moved from a colleague who left in February.",
            columns: [
              { key: "item", label: "Deliverable" },
              { key: "portfolio", label: "Portfolio" },
              { key: "due", label: "Due" },
              { key: "delivered", label: "Delivered" },
              { key: "issue", label: "Issue" },
            ],
            rows: [
              { item: "Monthly client report A", portfolio: "Own", due: "3 Mar", delivered: "3 Mar", issue: "None" },
              { item: "Contract renewal pack", portfolio: "Transferred", due: "10 Mar", delivered: "14 Mar", issue: "2 pricing errors (client noticed)" },
              { item: "Quarterly review slides", portfolio: "Transferred", due: "24 Mar", delivered: "27 Mar", issue: "None" },
              { item: "Monthly client report B", portfolio: "Own", due: "2 Apr", delivered: "2 Apr", issue: "None" },
              { item: "Service audit", portfolio: "Transferred", due: "15 Apr", delivered: "22 Apr", issue: "Missing section (client noticed)" },
            ],
          },
          {
            kind: "email",
            id: "manager-email",
            title: "Email from {{manager}}",
            from: { name: "{{manager}}", role: "{{manager.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "{{report2}}",
            sentAt: "Monday 09:12",
            body: "We need {{report2}}'s performance sorted before mid-year reviews in 3 weeks. Two client complaints in two months is not acceptable. Let me know your plan.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{report2}}. You can end it when you think it has reached a good point, or after 8 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{report2}}",
              role: "{{report2.role}}",
              context: "A member of your team for 18 months, with a strong first year. You are their manager. You booked this 30-minute meeting today.",
            },
            openingLine: "You wanted to see me? If it's about the audit, I know it was late. It's been a busy month, but it's done now.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "What did you agree with {{report2}}, and what will you check, and when, to know whether it is working?" },
        twist: {
          change: "The next day, {{manager}} asks you to put {{report2}} on a formal improvement plan this week.",
          prompt: "Write your reply to {{manager}}.",
        },
      },
      ar: {
        title: "المواعيد الفائتة",
        scenario:
          "تقود فريقًا من 7 أشخاص في {{company}}. انضم {{report2}} إلى الفريق قبل 18 شهرًا، وكان أداء السنة الأولى قويًا. في الشهرين الأخيرين تأخر تسليم 3 من 5 مخرجات، وتضمّن اثنان منها أخطاء لاحظها العميل. لم تناقش الأمر مباشرة مع {{report2}} حتى الآن، واكتفيت بالإشارة سريعًا إلى أحد التقارير المتأخرة في اجتماع للفريق. طلب منك {{manager}} معالجة الأمر قبل تقييمات منتصف العام بعد 3 أسابيع، وقد حجزت 30 دقيقة مع {{report2}} اليوم.",
        materials: [
          {
            kind: "table",
            id: "deliverables",
            title: "المخرجات في الشهرين الأخيرين",
            caption: "المحفظة: «خاصة» = حسابات يديرها {{report2}} منذ الانضمام إلى الفريق؛ «منقولة» = حسابات نُقلت من زميل غادر في فبراير.",
            columns: [
              { key: "item", label: "المُخرَج" },
              { key: "portfolio", label: "المحفظة" },
              { key: "due", label: "الموعد" },
              { key: "delivered", label: "التسليم" },
              { key: "issue", label: "الملاحظات" },
            ],
            rows: [
              { item: "التقرير الشهري للعميل أ", portfolio: "خاصة", due: "3 مارس", delivered: "3 مارس", issue: "لا شيء" },
              { item: "ملف تجديد العقد", portfolio: "منقولة", due: "10 مارس", delivered: "14 مارس", issue: "خطآن في التسعير (لاحظهما العميل)" },
              { item: "عرض المراجعة الفصلية", portfolio: "منقولة", due: "24 مارس", delivered: "27 مارس", issue: "لا شيء" },
              { item: "التقرير الشهري للعميل ب", portfolio: "خاصة", due: "2 أبريل", delivered: "2 أبريل", issue: "لا شيء" },
              { item: "تدقيق الخدمة", portfolio: "منقولة", due: "15 أبريل", delivered: "22 أبريل", issue: "قسم ناقص (لاحظه العميل)" },
            ],
          },
          {
            kind: "email",
            id: "manager-email",
            title: "رسالة من {{manager}}",
            from: { name: "{{manager}}", role: "{{manager.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "{{report2}}",
            sentAt: "الاثنين 09:12",
            body: "نحتاج إلى معالجة أداء {{report2}} قبل تقييمات منتصف العام بعد 3 أسابيع. شكويان من العميل في شهرين أمر غير مقبول. أطلعني على خطتك.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{report2}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 8 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{report2}}",
              role: "{{report2.role}}",
              context: "عضو في فريقك منذ 18 شهرًا، وكان أداء السنة الأولى قويًا. أنت المدير المباشر، وقد حجزت هذا الاجتماع ومدته 30 دقيقة اليوم.",
            },
            openingLine: "أردت أن تراني؟ إن كان الأمر يتعلق بالتدقيق، فأنا أعرف أنه تأخر. كان شهرًا مزدحمًا، لكنه أُنجز الآن.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "على ماذا اتفقت مع {{report2}}؟ وما الذي ستتحقق منه، ومتى، لتعرف إن كان الاتفاق ناجحًا؟" },
        twist: {
          change: "في اليوم التالي طلب منك {{manager}} إخضاع {{report2}} لخطة تحسين أداء رسمية هذا الأسبوع.",
          prompt: "اكتب ردّك على {{manager}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.performance-management",
            anchors: [
              "Avoids naming the performance gap, or names it only as a vague concern with no examples.",
              "Names the late and faulty deliverables but agrees no clear standard, plan or review date.",
              "States the gap with specific examples and agrees the expected standard, the support and a review date.",
              "Links the gap to its cause, the transferred accounts, and sets checkpoints that separate workload from capability.",
              "As level 4, and states without threat what happens if the standard is still not met, keeping the plan fair and recorded.",
            ],
          },
          {
            competencyKey: "communication.difficult-conversations",
            anchors: [
              "Drops the issue after the opening line, or delivers it abruptly with labels or blame.",
              "Raises the issue but softens it so much that {{report2}} could leave thinking nothing is wrong.",
              "States the concern clearly and respectfully, acknowledges {{report2}}'s reaction, and moves to next steps.",
              "Calms defensiveness by naming it calmly and refocusing on shared goals, while keeping the message about client errors intact.",
              "Admits their own part, such as raising it in the team meeting, and leaves the relationship stronger with the standard still clear.",
            ],
          },
          {
            competencyKey: "leadership.developing-others",
            anchors: [
              "Treats the conversation only as correcting mistakes; offers no support or growth.",
              "Offers generic help, such as asking to be told if anything is needed, with no specific support.",
              "Agrees specific support, such as priorities, a quality check or coaching on the transferred accounts.",
              "Builds {{report2}}'s capability, for example planning how to run such accounts independently, rather than only removing work.",
              "As level 4, and draws on {{report2}}'s strong first year to set a stretching but realistic goal with regular feedback.",
            ],
          },
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Agrees to the formal plan at once without sharing what the conversation revealed.",
              "Disagrees privately but complies, or replies vaguely to avoid tension with {{manager}}.",
              "Explains clearly why a formal plan now would be premature, citing the transferred-accounts pattern and the agreed actions.",
              "Pushes back respectfully with evidence, proposes a checkpoint before any formal step, and accepts accountability for the result.",
              "As level 4, and also raises the decision behind the problem, the unplanned transfer of accounts, as something to fix.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices that every late or faulty item comes from the transferred accounts.",
            competencyKey: "management.performance-management",
            keywords: ["transferred", "handover", "colleague who left", "extra accounts", "الحسابات المنقولة", "التسليم", "الزميل الذي غادر"],
          },
          {
            text: "Uses specific examples and their impact, without labels.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["renewal pack", "pricing errors", "audit", "client noticed", "ملف التجديد", "أخطاء التسعير", "التدقيق", "لاحظ العميل"],
          },
          {
            text: "Asks open questions about what is happening and listens.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["what's been happening", "how are you finding", "help me understand", "ما الذي يحدث", "كيف تجد", "ساعدني على فهم"],
          },
          {
            text: "Agrees concrete support and a review date.",
            competencyKey: "leadership.developing-others",
            keywords: ["priorities", "check-in", "review", "support", "الأولويات", "متابعة أسبوعية", "موعد المراجعة", "الدعم"],
          },
        ],
        redFlags: [
          {
            text: "Labels {{report2}} instead of describing behaviour.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["unreliable", "careless", "not committed", "lazy", "غير موثوق", "مهمل", "غير ملتزم"],
          },
          {
            text: "Threatens a formal process early in the conversation.",
            competencyKey: "management.performance-management",
            keywords: ["formal plan", "hr", "warning", "خطة رسمية", "الموارد البشرية", "إنذار"],
          },
          {
            text: "Compares {{report2}} with other team members.",
            competencyKey: "leadership.developing-others",
            keywords: ["everyone else", "like the others", "زملاؤك يستطيعون", "مثل الآخرين"],
          },
          {
            text: "Accepts 'it's done now' and ends without agreed actions.",
            competencyKey: "management.performance-management",
            keywords: ["ok, let's move on", "fine then", "حسنًا لننتقل", "لا بأس إذن"],
          },
        ],
        embeddedDetail: {
          description:
            "All 3 late deliverables and both client-noticed errors are on accounts transferred from a colleague who left in February; {{report2}}'s own accounts are on time.",
          location: "Portfolio column and caption of the deliverables table",
          keywords: ["transferred", "portfolio", "colleague who left", "february", "المنقولة", "المحفظة", "الزميل الذي غادر", "فبراير"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Has covered 3 transferred accounts since February with no handover and no reduction in other work; feels this was never acknowledged.",
            "Is embarrassed and worried about being seen as failing; fears a formal process.",
            "Wants clear priorities and permission to ask for help.",
            "Was hurt when a late report was mentioned in the team meeting; does not want the team involved.",
          ],
          startingMood: "guarded",
          softensWhen: [
            "describes specific deliverables and their impact without labels",
            "asks open questions and waits for the answer",
            "notices that the late items all come from the transferred accounts",
            "acknowledges that raising it in the team meeting was not ideal",
            "asks what support would help and agrees priorities together",
            "is clear that the quality standard still applies while offering support",
          ],
          hardensWhen: [
            "uses labels such as unreliable, careless or not committed",
            "mentions a formal improvement plan or HR early in the conversation",
            "compares them with {{report1}} or other team members",
            "accepts 'it's done now' and closes without agreeing next steps",
            "talks for long stretches without asking questions",
            "takes all the transferred work away without discussion",
          ],
          resolution:
            "{{report2}} explains the workload from the transferred accounts. They agree priorities for the next 3 weeks, a quality check before client deliverables, a weekly 15-minute check-in and a review date; {{report2}} understands the standard and what happens if it is not met.",
        },
        probeTargets: ["management.performance-management"],
        twistTargets: ["leadership.courage"],
      },
    },
  },
  // ───────────────────────────── rp-03 ─────────────────────────────
  {
    id: "rp-03-sceptical-executive",
    type: "ROLE_PLAY",
    difficulty: 4,
    dials: { ambiguity: 4, stakeholders: 3, conflictingConstraints: 4, stakes: 4, timePressure: 3, informationGaps: 4 },
    targets: ["communication.persuasion", "collaboration.taking-feedback", "product-thinking.problem-framing"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "The budget conversation",
        scenario:
          "You lead customer service at {{company}}. You have sent {{exec}}, who controls next quarter's budget, a one-page proposal: fund 2 engineers for 1 quarter to rebuild the online returns process. Your case is that returns-related contacts are 35% of all contact-centre volume and the current returns pages are hard to use. {{exec}} sponsored a self-service project last year that cost twice its budget and was rarely used. You have 15 minutes with {{exec}} now.",
        materials: [
          {
            kind: "table",
            id: "volume",
            title: "Contact-centre volume by reason, last quarter",
            caption: "Returns and refunds, by type: 60% 'where is my refund?' status questions; 30% how to start a return; 10% disputes.",
            columns: [
              { key: "reason", label: "Reason" },
              { key: "contacts", label: "Contacts", numeric: true },
              { key: "share", label: "Share" },
            ],
            rows: [
              { reason: "Returns and refunds", contacts: 42000, share: "35%" },
              { reason: "Delivery questions", contacts: 30000, share: "25%" },
              { reason: "Account and login", contacts: 24000, share: "20%" },
              { reason: "Product questions", contacts: 14400, share: "12%" },
              { reason: "Other", contacts: 9600, share: "8%" },
            ],
          },
          {
            kind: "memo",
            id: "proposal",
            title: "Your one-page proposal (summary)",
            author: { name: "{{you}}" },
            body:
              "Request: 2 engineers for 1 quarter (total cost 120,000) to rebuild the online returns process.\n\nExpected result: returns contacts down by half, about 21,000 fewer contacts per quarter. Average cost per contact: 4, so about 84,000 saved per quarter.\n\nMain risk: customers may keep calling out of habit.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{exec}}. You can end it when you think it has reached a good point, or after 8 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{exec}}",
              role: "{{exec.role}}",
              context:
                "Controls next quarter's budget. Sponsored last year's self-service portal, which cost twice its budget and was used by fewer than 5% of customers. Has read your one-page proposal.",
            },
            openingLine: "I've read your one-pager. Last year's self-service project cost twice its budget and fewer than 5% of customers used it. Why is this one different?",
            maxTurns: 8,
          },
        },
        probe: { prompt: "What do you think {{exec}}'s real concern was, and what did you do about it?" },
        twist: {
          change: "After the meeting, {{exec}} emails: there is a hiring freeze, so no new engineers this quarter. You may use up to 20% of your existing team's time.",
          prompt: "Write a short reply to {{exec}} with your revised proposal.",
        },
      },
      ar: {
        title: "حوار الميزانية",
        scenario:
          "تقود خدمة العملاء في {{company}}. أرسلت إلى {{exec}}، صاحب القرار في ميزانية الربع القادم، مقترحًا من صفحة واحدة: تمويل مهندسَين اثنين لمدة ربع سنة لإعادة بناء عملية الإرجاع عبر الإنترنت. حجتك أن الاتصالات المتعلقة بالإرجاع تمثّل 35% من حجم الاتصالات في مركز الاتصال، وأن صفحات الإرجاع الحالية صعبة الاستخدام. كان {{exec}} راعيًا لمشروع خدمة ذاتية في العام الماضي كلّف ضعف ميزانيته ونادرًا ما استُخدم. لديك الآن 15 دقيقة مع {{exec}}.",
        materials: [
          {
            kind: "table",
            id: "volume",
            title: "حجم الاتصالات في مركز الاتصال بحسب السبب، الربع الماضي",
            caption: "الإرجاع والاسترداد بحسب النوع: 60% أسئلة عن حالة الاسترداد «أين المبلغ المسترد؟»، و30% عن طريقة بدء الإرجاع، و10% نزاعات.",
            columns: [
              { key: "reason", label: "السبب" },
              { key: "contacts", label: "عدد الاتصالات", numeric: true },
              { key: "share", label: "النسبة" },
            ],
            rows: [
              { reason: "الإرجاع والاسترداد", contacts: 42000, share: "35%" },
              { reason: "أسئلة التوصيل", contacts: 30000, share: "25%" },
              { reason: "الحساب وتسجيل الدخول", contacts: 24000, share: "20%" },
              { reason: "أسئلة عن المنتجات", contacts: 14400, share: "12%" },
              { reason: "أخرى", contacts: 9600, share: "8%" },
            ],
          },
          {
            kind: "memo",
            id: "proposal",
            title: "مقترحك المكوّن من صفحة واحدة (ملخص)",
            author: { name: "{{you}}" },
            body:
              "الطلب: مهندسان لمدة ربع سنة (التكلفة الإجمالية 120,000) لإعادة بناء عملية الإرجاع عبر الإنترنت.\n\nالنتيجة المتوقعة: انخفاض اتصالات الإرجاع إلى النصف، أي نحو 21,000 اتصال أقل في الربع. متوسط تكلفة الاتصال الواحد 4، فيكون التوفير نحو 84,000 في الربع.\n\nالخطر الرئيسي: قد يستمر العملاء في الاتصال بحكم العادة.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{exec}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 8 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{exec}}",
              role: "{{exec.role}}",
              context:
                "صاحب القرار في ميزانية الربع القادم. رعى في العام الماضي بوابة الخدمة الذاتية التي كلّفت ضعف ميزانيتها واستخدمها أقل من 5% من العملاء. اطّلع على مقترحك المكوّن من صفحة واحدة.",
            },
            openingLine: "قرأت مقترحك. مشروع الخدمة الذاتية في العام الماضي كلّف ضعف ميزانيته، واستخدمه أقل من 5% من العملاء. ما الذي يجعل هذا المشروع مختلفًا؟",
            maxTurns: 8,
          },
        },
        probe: { prompt: "ما الذي تراه الهمّ الحقيقي لدى {{exec}}، وماذا فعلت حياله؟" },
        twist: {
          change: "بعد الاجتماع وصلتك رسالة من {{exec}}: هناك تجميد للتوظيف، فلا مهندسين جددًا هذا الربع. يمكنك استخدام ما يصل إلى 20% من وقت فريقك الحالي.",
          prompt: "اكتب ردًّا قصيرًا على {{exec}} يتضمّن مقترحك المعدَّل.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.persuasion",
            anchors: [
              "Asserts the proposal is right without reasons, or repeats the 35% figure under pressure.",
              "Gives reasons, but not the ones {{exec}} cares about, and ignores the obvious objection about last year.",
              "Supports the case with the contact data and cost figures, and addresses the concern about last year's project.",
              "Builds the case around {{exec}}'s goals, such as avoiding another failure, admits weaknesses, and proposes a specific next step.",
              "Identifies the real resistance, missing evidence of customer demand, and reshapes the proposal to meet it.",
            ],
          },
          {
            competencyKey: "collaboration.taking-feedback",
            anchors: [
              "Becomes defensive about the challenge or dismisses last year's project as irrelevant.",
              "Accepts the challenge politely but changes nothing in the proposal.",
              "Acknowledges the challenge, asks questions to understand it, and adjusts part of the proposal.",
              "Separates valid points from those they disagree with, explains reasoning calmly, and acts on the valid points.",
              "Invites further challenge, uses even sharp criticism to improve the plan, and says how they will check the change worked.",
            ],
          },
          {
            competencyKey: "product-thinking.problem-framing",
            anchors: [
              "Treats rebuilding the returns process as the goal without asking which problem drives the contacts.",
              "Mentions returns contacts in general terms without breaking down what customers actually contact about.",
              "Defines the problem specifically: who contacts, why, and how success would be measured.",
              "Uses the breakdown to reframe the problem as uncertainty about refund status, narrowing to the part that matters most.",
              "Reframes toward removing the need to contact at all, such as proactive refund updates, opening a cheaper, faster option.",
            ],
          },
          {
            competencyKey: "communication.listening",
            anchors: [
              "Describes {{exec}}'s concern only as cost or as being difficult.",
              "Repeats {{exec}}'s stated objection literally, without the concern behind it.",
              "Accurately identifies the stated concern and how they responded to it in the conversation.",
              "Identifies the unstated concern, such as the reputational risk of another failure, and how they checked or addressed it.",
              "Notes what {{exec}} avoided saying and explains how that shaped their approach, or would next time.",
            ],
          },
          {
            competencyKey: "product-thinking.feature-prioritisation",
            anchors: [
              "Asks for an exception to the freeze or keeps the full rebuild with no change in scope.",
              "Cuts scope arbitrarily, without linking it to value or the contact breakdown.",
              "Narrows to the highest-value part within 20% capacity, such as refund-status updates, and says what is deferred.",
              "Ranks options by contacts removed against effort, using the breakdown, and states the trade-off with other team work.",
              "Proposes the smallest change that proves value fastest, with a measure that would justify the next step.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the breakdown: most returns contacts are refund-status questions.",
            competencyKey: "product-thinking.problem-framing",
            keywords: ["where is my refund", "refund status", "60%", "proactive", "حالة الاسترداد", "أين المبلغ المسترد", "إشعار استباقي"],
          },
          {
            text: "Acknowledges last year's failure and states a lesson applied now.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["last year", "lesson", "learned", "العام الماضي", "الدرس", "تعلمنا"],
          },
          {
            text: "Proposes a small pilot with a success measure and a stop point.",
            competencyKey: "communication.persuasion",
            keywords: ["pilot", "success measure", "stop", "decision point", "تجربة محدودة", "مقياس النجاح", "نتوقف", "نقطة قرار"],
          },
          {
            text: "Asks what evidence would convince {{exec}}.",
            competencyKey: "communication.persuasion",
            keywords: ["what would convince", "what would you need to see", "ما الذي يقنعك", "ما الذي تحتاج إلى رؤيته"],
          },
        ],
        redFlags: [
          {
            text: "Blames another team for last year's project or calls it irrelevant.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["different team", "not relevant", "nothing to do with", "فريق آخر", "لا علاقة له"],
          },
          {
            text: "Claims certainty about the results.",
            competencyKey: "communication.persuasion",
            keywords: ["definitely", "guaranteed", "will certainly", "بالتأكيد", "مضمون", "حتمًا"],
          },
          {
            text: "Repeats the same argument without adapting it.",
            competencyKey: "communication.persuasion",
            keywords: ["as i said", "again", "كما قلت", "أكرر"],
          },
          {
            text: "Treats the full rebuild as the only option.",
            competencyKey: "product-thinking.problem-framing",
            keywords: ["full rebuild", "only way", "إعادة البناء بالكامل", "الحل الوحيد"],
          },
        ],
        embeddedDetail: {
          description:
            "The table caption shows 60% of returns contacts are 'where is my refund?' status questions, so a cheaper fix such as proactive refund updates could remove most of them without rebuilding the returns process.",
          location: "caption of the contact-volume table",
          keywords: ["where is my refund", "refund status", "60%", "حالة الاسترداد", "أين المبلغ المسترد"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Does not want to repeat last year's failure, which damaged their standing with the board.",
            "Would back a small, staged commitment with a clear stop point and a success measure.",
            "The real objection is evidence of customer demand: last year's project was built on assumptions.",
            "Is attracted by anything that slows contact-centre hiring next year.",
            "Respects people who change their proposal in response to good challenge.",
          ],
          startingMood: "sceptical",
          softensWhen: [
            "acknowledges last year's failure directly and draws a lesson from it",
            "uses evidence of customer behaviour rather than opinion",
            "narrows the proposal, for example to refund-status updates, based on the data",
            "proposes a small pilot with a success measure and a stop point",
            "asks what evidence would convince them",
            "admits uncertainty in the estimate honestly",
          ],
          hardensWhen: [
            "defends last year's project or blames another team for it",
            "repeats the same argument more forcefully",
            "claims certainty, such as saying contacts will definitely halve",
            "uses technical jargon",
            "pushes urgency without evidence",
            "avoids a direct question",
          ],
          resolution:
            "{{exec}} agrees to fund a 4-to-6-week pilot aimed at refund-status contacts, such as proactive refund updates, with an agreed success measure and a decision point before any larger investment.",
        },
        probeTargets: ["communication.listening"],
        twistTargets: ["product-thinking.feature-prioritisation"],
      },
    },
  },
  // ───────────────────────────── rp-04 ─────────────────────────────
  {
    id: "rp-04-peer-resources",
    type: "ROLE_PLAY",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 4, stakes: 3, timePressure: 3, informationGaps: 2 },
    targets: ["leadership.influence-without-authority", "collaboration.team-orientation", "communication.listening"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "Borrowing an expert",
        scenario:
          "You lead the reporting team at {{company}}. A regulatory report is due in 3 weeks, and your team lacks one skill: extracting data from the old billing system. Only {{specialist}}, who works in {{peer}}'s team, knows that system well. Yesterday you emailed {{peer}} asking to borrow {{specialist}} for 2 weeks. You have no authority over {{peer}}'s team, and {{peer}} has no obligation to agree. {{peer}} has just come over to your desk.",
        materials: [
          {
            kind: "table",
            id: "plan",
            title: "Regulatory report: task plan",
            caption: "Prepared by {{report1}}.",
            columns: [
              { key: "task", label: "Task" },
              { key: "days", label: "Working days", numeric: true },
              { key: "skills", label: "Skills needed" },
              { key: "who", label: "Who" },
            ],
            rows: [
              { task: "Data extraction from old billing system", days: 4, skills: "Old billing system", who: "Not yet assigned" },
              { task: "Data validation", days: 3, skills: "Data analysis", who: "Your team" },
              { task: "Analysis and write-up", days: 5, skills: "Regulatory reporting", who: "Your team" },
              { task: "Review and sign-off", days: 2, skills: "Compliance", who: "{{manager}}" },
            ],
          },
          {
            kind: "memo",
            id: "context",
            title: "What you know about {{peer}}'s team",
            author: { name: "{{you}}" },
            body:
              "{{peer}}'s team launches a new customer portal in 4 weeks; the final testing week is week 4.\n\nLast quarter the team missed its launch date, and this was discussed at the leadership meeting.\n\nEarlier this year {{peer}} lent 2 people to another project; they came back 3 weeks later than agreed.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{peer}}. You can end it when you think it has reached a good point, or after 8 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{peer}}",
              role: "{{peer.role}}",
              context: "Leads a team launching a new customer portal in 4 weeks. {{specialist}} is in {{peer}}'s team. You work at the same level, in different departments.",
            },
            openingLine: "I got your email. Before you ask: no, I can't lend {{specialist}} for two weeks. We launch in 4 weeks and we're already behind.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "What did {{peer}} need from this conversation, and how do you know?" },
        twist: {
          change: "The next day, {{peer}}'s launch moves 1 week earlier, so the days you agreed now fall in {{peer}}'s final testing week.",
          prompt: "Write a short message to {{peer}}.",
        },
      },
      ar: {
        title: "استعارة خبير",
        scenario:
          "تقود فريق التقارير في {{company}}. يستحق تقرير رقابي بعد 3 أسابيع، وتنقص فريقك مهارة واحدة: استخراج البيانات من نظام الفوترة القديم. لا يعرف هذا النظام جيدًا سوى {{specialist}}، أحد أعضاء فريق {{peer}}. أرسلت أمس رسالة إلى {{peer}} تطلب فيها استعارة {{specialist}} لمدة أسبوعين. لا سلطة لك على فريق {{peer}}، ولا شيء يُلزم {{peer}} بالموافقة. وقد جاء {{peer}} للتو إلى مكتبك.",
        materials: [
          {
            kind: "table",
            id: "plan",
            title: "التقرير الرقابي: خطة المهام",
            caption: "أعدّها {{report1}}.",
            columns: [
              { key: "task", label: "المهمة" },
              { key: "days", label: "أيام العمل", numeric: true },
              { key: "skills", label: "المهارات المطلوبة" },
              { key: "who", label: "المسؤول" },
            ],
            rows: [
              { task: "استخراج البيانات من نظام الفوترة القديم", days: 4, skills: "نظام الفوترة القديم", who: "لم يُحدَّد بعد" },
              { task: "التحقق من البيانات", days: 3, skills: "تحليل البيانات", who: "فريقك" },
              { task: "التحليل والكتابة", days: 5, skills: "التقارير الرقابية", who: "فريقك" },
              { task: "المراجعة والاعتماد", days: 2, skills: "الامتثال", who: "{{manager}}" },
            ],
          },
          {
            kind: "memo",
            id: "context",
            title: "ما تعرفه عن فريق {{peer}}",
            author: { name: "{{you}}" },
            body:
              "يطلق فريق {{peer}} بوابة جديدة للعملاء بعد 4 أسابيع، وأسبوع الاختبار النهائي هو الأسبوع الرابع.\n\nفي الربع الماضي فات الفريقَ موعدُ الإطلاق، ونوقش ذلك في اجتماع القيادة.\n\nفي وقت سابق من هذا العام أعار {{peer}} شخصين لمشروع آخر، فعادا بعد الموعد المتفق عليه بثلاثة أسابيع.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{peer}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 8 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{peer}}",
              role: "{{peer.role}}",
              context: "قائد فريق يطلق بوابة جديدة للعملاء بعد 4 أسابيع، و{{specialist}} من أعضاء هذا الفريق. أنتما في المستوى الوظيفي نفسه، في إدارتين مختلفتين.",
            },
            openingLine: "وصلتني رسالتك. وقبل أن تطلب: لا، لا أستطيع إعارة {{specialist}} لمدة أسبوعين. سنطلق البوابة بعد 4 أسابيع، ونحن متأخرون أصلًا.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "ما الذي كان {{peer}} يحتاج إليه من هذه المحادثة، وكيف عرفت ذلك؟" },
        twist: {
          change: "في اليوم التالي قُدِّم موعد إطلاق فريق {{peer}} أسبوعًا، فأصبحت الأيام التي اتفقتما عليها تقع في أسبوع الاختبار النهائي لدى فريق {{peer}}.",
          prompt: "اكتب رسالة قصيرة إلى {{peer}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.influence-without-authority",
            anchors: [
              "Demands {{specialist}} or threatens escalation as the first move, relying on pressure rather than shared interests.",
              "Repeats the request with more reasons from their own side, without addressing what {{peer}} needs.",
              "Finds common ground, the company's regulatory deadline, and shapes a request {{peer}} can accept.",
              "Reduces the ask to what is truly needed, offers something of value in return, and gives {{peer}} control over timing.",
              "Builds a lasting arrangement through credit, reciprocity and {{specialist}}'s development, so {{peer}} becomes an ally.",
            ],
          },
          {
            competencyKey: "collaboration.team-orientation",
            anchors: [
              "Treats the portal launch as less important than the report, or acts only for their own team.",
              "Accepts {{peer}}'s constraints in words but offers nothing to help the other team.",
              "Shares relevant information, such as the 4-day breakdown, and coordinates timing with the launch.",
              "Adjusts their own plan to protect {{peer}}'s launch and gives visible credit for {{specialist}}'s help.",
              "Proposes a way of sharing scarce skills that helps both teams in future, such as cross-training on the billing system.",
            ],
          },
          {
            competencyKey: "communication.listening",
            anchors: [
              "Ignores {{peer}}'s launch pressure and restates the request.",
              "Hears the stated refusal but not the concerns behind it, such as last quarter's missed launch or late returns.",
              "Restates {{peer}}'s concerns accurately, asks clarifying questions, and responds to them.",
              "Draws out unstated concerns, such as credit and a firm return date, checks them, and builds them into the proposal.",
              "Notices what {{peer}} leaves unsaid and explores it tactfully, uncovering options neither had raised.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Narrows the request to the 4 extraction days using the task plan.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["4 days", "four days", "extraction", "only need", "4 أيام", "أربعة أيام", "استخراج البيانات", "نحتاج فقط"],
          },
          {
            text: "Asks about the launch and acknowledges its importance.",
            competencyKey: "communication.listening",
            keywords: ["your launch", "testing week", "how is the launch", "الإطلاق", "أسبوع الاختبار", "كيف يسير"],
          },
          {
            text: "Offers something in return and visible credit.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["in return", "help your team", "credit", "acknowledge", "في المقابل", "مساعدة فريقك", "الفضل", "تقدير"],
          },
          {
            text: "Agrees fixed dates and a firm return date.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["fixed dates", "back by", "return date", "مواعيد محددة", "يعود قبل", "موعد العودة"],
          },
        ],
        redFlags: [
          {
            text: "Threatens escalation early.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["escalate", "your manager", "i'll raise it", "التصعيد", "مديرك", "سأرفع الأمر"],
          },
          {
            text: "Insists on the full 2 weeks.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["two weeks", "2 weeks", "full time", "أسبوعين", "دوام كامل"],
          },
          {
            text: "Implies the regulatory report matters more than the launch.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["more important", "regulator comes first", "أهم من", "الجهة الرقابية أولًا"],
          },
          {
            text: "Plans to approach {{specialist}} directly without {{peer}}.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["ask them directly", "go to them myself", "سأطلب منه مباشرة", "سأتحدث معه بنفسي"],
          },
        ],
        embeddedDetail: {
          description:
            "The task plan shows only data extraction (4 working days) needs billing-system skills; your team can do the rest, so the 2-week request can shrink to 4 days.",
          location: "task plan table, 'Skills needed' column",
          keywords: ["4 days", "extraction", "billing system", "4 أيام", "استخراج", "نظام الفوترة"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Cannot afford another missed launch after last quarter's criticism.",
            "Lent people before and they came back late with no credit; wants a firm return date and recognition.",
            "Could spare {{specialist}} for short, fixed blocks planned around the final testing week.",
            "Would value help in return, such as someone from your team reviewing the portal's reports.",
            "Knows {{specialist}} wants to learn regulatory reporting.",
          ],
          startingMood: "guarded",
          softensWhen: [
            "asks about the launch pressure and listens to the answer",
            "narrows the request to the 4 extraction days with fixed dates",
            "offers something in return or shared credit",
            "respects {{peer}}'s decision and priorities",
            "links the request to a shared company goal, such as the regulatory deadline",
            "agrees a firm return date",
          ],
          hardensWhen: [
            "threatens to escalate to managers early",
            "insists on the full 2 weeks",
            "implies the portal launch matters less than the report",
            "suggests approaching {{specialist}} directly",
            "is vague about dates or when {{specialist}} returns",
          ],
          resolution:
            "{{peer}} releases {{specialist}} for 4 working days on fixed dates outside the final testing week, with a firm return date, visible credit, and someone from your team helping with the portal's reports in return.",
        },
        probeTargets: ["communication.listening"],
        twistTargets: ["collaboration.team-orientation"],
      },
    },
  },
  // ───────────────────────────── rp-05 ─────────────────────────────
  {
    id: "rp-05-team-member-disagrees",
    type: "ROLE_PLAY",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 2, stakes: 2, timePressure: 1, informationGaps: 2 },
    targets: ["leadership.handling-conflict", "collaboration.taking-feedback"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "early",
    content: {
      en: {
        title: "The new planning routine",
        scenario:
          "You lead a team of 6 at {{company}}. Last week you announced two changes: weekly planning moves from Monday morning to Thursday at 14:00, and the two separate status reports become one shared tracker that everyone updates by Wednesday evening. You decided this after noticing that Monday plans were often out of date by Tuesday. You did not consult the team first. {{report1}}, an experienced and respected team member, has asked to talk to you about it.",
        materials: [
          {
            kind: "table",
            id: "calendar",
            title: "Team calendar: recurring meetings",
            columns: [
              { key: "who", label: "Who" },
              { key: "meeting", label: "Meeting" },
              { key: "day", label: "Day" },
              { key: "time", label: "Time" },
            ],
            rows: [
              { who: "Whole team", meeting: "Team update", day: "Monday", time: "09:00–09:30" },
              { who: "{{report2}}", meeting: "Supplier review", day: "Tuesday", time: "10:00–11:00" },
              { who: "{{you}}", meeting: "Leadership meeting", day: "Wednesday", time: "15:00–16:00" },
              { who: "{{report1}}", meeting: "Key account client call", day: "Thursday", time: "14:00–14:45" },
              { who: "Whole team", meeting: "Weekly planning (new)", day: "Thursday", time: "14:00–15:00" },
            ],
          },
          {
            kind: "memo",
            id: "announcement",
            title: "Your announcement last week",
            author: { name: "{{you}}" },
            body:
              "From next week: (1) weekly planning moves to Thursday at 14:00, so our plans reflect the latest priorities before the week ahead; (2) the 2 status reports are replaced by 1 shared tracker, updated by everyone by Wednesday at 18:00. Thank you all.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{report1}}. You can end it when you think it has reached a good point, or after 6 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{report1}}",
              role: "{{report1.role}}",
              context: "An experienced and respected member of your team for 4 years, usually supportive of changes. Has asked to talk about last week's announcement.",
            },
            openingLine: "Can I be honest? I think last week's changes were a mistake. Nobody asked us, and the new tracker just adds more work for everyone.",
            maxTurns: 6,
          },
        },
        probe: { prompt: "Looking back: what were you trying to achieve in this conversation, and did you? What would you do differently?" },
        twist: {
          change: "The next week, {{manager}} decides that one shared tracker will be used across the whole department, so the tracker itself is no longer your choice.",
          prompt: "Write a short message to your team, including {{report1}}, about what happens next.",
        },
      },
      ar: {
        title: "روتين التخطيط الجديد",
        scenario:
          "تقود فريقًا من 6 أشخاص في {{company}}. أعلنت الأسبوع الماضي تغييرين: نقل اجتماع التخطيط الأسبوعي من صباح الاثنين إلى الخميس الساعة 14:00، ودمج تقريرَي الحالة المنفصلين في متتبّع مشترك واحد يحدّثه الجميع قبل مساء الأربعاء. اتخذت هذا القرار بعد أن لاحظت أن خطط الاثنين كثيرًا ما تصبح متقادمة بحلول الثلاثاء، ولم تستشر الفريق مسبقًا. طلب {{report1}}، العضو المتمرّس الذي يحظى بالاحترام في الفريق، التحدث إليك في الأمر.",
        materials: [
          {
            kind: "table",
            id: "calendar",
            title: "تقويم الفريق: الاجتماعات المتكررة",
            columns: [
              { key: "who", label: "المعني" },
              { key: "meeting", label: "الاجتماع" },
              { key: "day", label: "اليوم" },
              { key: "time", label: "الوقت" },
            ],
            rows: [
              { who: "الفريق كله", meeting: "مستجدات الفريق", day: "الاثنين", time: "09:00–09:30" },
              { who: "{{report2}}", meeting: "مراجعة الموردين", day: "الثلاثاء", time: "10:00–11:00" },
              { who: "{{you}}", meeting: "اجتماع القيادة", day: "الأربعاء", time: "15:00–16:00" },
              { who: "{{report1}}", meeting: "اتصال مع عميل رئيسي", day: "الخميس", time: "14:00–14:45" },
              { who: "الفريق كله", meeting: "التخطيط الأسبوعي (جديد)", day: "الخميس", time: "14:00–15:00" },
            ],
          },
          {
            kind: "memo",
            id: "announcement",
            title: "إعلانك في الأسبوع الماضي",
            author: { name: "{{you}}" },
            body:
              "اعتبارًا من الأسبوع القادم: (1) ينتقل التخطيط الأسبوعي إلى الخميس الساعة 14:00، لتعكس خططنا أحدث الأولويات قبل الأسبوع التالي؛ (2) يحلّ متتبّع مشترك واحد محلّ تقريرَي الحالة، ويحدّثه الجميع قبل الساعة 18:00 يوم الأربعاء. شكرًا لكم جميعًا.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{report1}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 6 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{report1}}",
              role: "{{report1.role}}",
              context: "عضو متمرّس يحظى بالاحترام في فريقك منذ 4 سنوات، ويدعم التغيير عادةً. طلب التحدث عن إعلان الأسبوع الماضي.",
            },
            openingLine: "اسمح لي بالصراحة: أظن أن تغييرات الأسبوع الماضي كانت خطأ. لم يستشرنا أحد، والمتتبّع الجديد يضيف عملًا على الجميع.",
            maxTurns: 6,
          },
        },
        probe: { prompt: "بالنظر إلى ما جرى: ما الذي كنت تسعى إلى تحقيقه في هذه المحادثة، وهل حققته؟ وما الذي كنت ستفعله على نحو مختلف؟" },
        twist: {
          change: "في الأسبوع التالي قرّر {{manager}} اعتماد متتبّع مشترك واحد في الإدارة كلها، فلم يعد اختيار المتتبّع بيدك.",
          prompt: "اكتب رسالة قصيرة إلى فريقك، ومنهم {{report1}}، عمّا سيحدث بعد ذلك.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.handling-conflict",
            anchors: [
              "Shuts the disagreement down, pulls rank, or reverses everything at once just to end the tension.",
              "Lets {{report1}} speak but argues each point, so the disagreement ends unresolved.",
              "Brings the disagreement into the open calmly, separates the goal from the details, and agrees a way forward.",
              "Works on the underlying interests, being consulted and avoiding duplicate work, and reaches an agreement both can support.",
              "As level 4, and turns the conflict into a better process, such as involving the team in future changes.",
            ],
          },
          {
            competencyKey: "collaboration.taking-feedback",
            anchors: [
              "Rejects the criticism or explains it away as resistance to change.",
              "Accepts the feedback politely but commits to no specific change.",
              "Acknowledges the feedback, asks about the extra work and the timing, and states a specific change.",
              "Separates valid points, the lack of consultation and the clash, from points they still disagree with, explaining why without defensiveness.",
              "Thanks {{report1}} for raising it directly, invites more such feedback, and says how they will check the changes work.",
            ],
          },
          {
            competencyKey: "collaboration.self-awareness",
            anchors: [
              "Describes their own role as entirely positive and puts the difficulty down to {{report1}}.",
              "Admits a general weakness when asked, without linking it to this decision or conversation.",
              "Names how deciding without consultation contributed to the reaction, and what they would do differently.",
              "Identifies a habit, such as deciding alone to save time, and a concrete way to counter it.",
              "Explains how the team likely saw the announcement and how they will close the gap between intent and impact.",
            ],
          },
          {
            competencyKey: "leadership.setting-direction",
            anchors: [
              "Announces the department decision with no reasoning or link to the team's concerns.",
              "Explains the department decision but drops the team's own goal and the agreements with {{report1}}.",
              "Explains what is fixed, what remains the team's choice, and why the change matters.",
              "Connects the change to the goal of up-to-date plans and shows how the team's feedback still shapes the details.",
              "As level 4, and gives next steps and a review point that keep the team engaged in a decision it did not make.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Acknowledges that not consulting the team was a mistake.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["should have asked", "didn't consult", "my mistake", "كان عليّ أن أستشير", "لم أستشر", "خطئي"],
          },
          {
            text: "Notices the Thursday 14:00 clash with {{report1}}'s client call.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["client call", "thursday", "clash", "another time", "اتصال العميل", "الخميس", "تعارض", "موعد آخر"],
          },
          {
            text: "Separates the goal from the details and invites help on the details.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["the goal", "help me improve", "the details", "الهدف", "ساعدني على تحسين", "التفاصيل"],
          },
          {
            text: "Asks specifically what extra work the tracker creates.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["what extra work", "duplicate", "which part", "ما العمل الإضافي", "تكرار", "أي جزء"],
          },
        ],
        redFlags: [
          {
            text: "Declares the decision final before listening.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["decision is final", "not up for discussion", "القرار نهائي", "غير قابل للنقاش"],
          },
          {
            text: "Dismisses the extra work as trivial.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["it's only", "a few minutes", "مجرد", "دقائق قليلة"],
          },
          {
            text: "Treats the disagreement as disloyalty or resistance.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["resistant to change", "not a team player", "مقاومة التغيير", "لا يعمل بروح الفريق"],
          },
          {
            text: "Promises to reconsider with no specifics or date.",
            competencyKey: "collaboration.taking-feedback",
            keywords: ["i'll think about it", "we'll see", "سأفكر في الأمر", "سنرى"],
          },
        ],
        embeddedDetail: {
          description: "The team calendar shows {{report1}}'s recurring key-account client call on Thursday 14:00–14:45, which clashes with the new planning slot.",
          location: "team calendar table, {{report1}}'s row",
          keywords: ["client call", "thursday", "14:00", "clash", "اتصال العميل", "الخميس", "تعارض"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Feels excluded: used to be consulted on team changes and was not this time.",
            "Has a real clash: a fixed client call on Thursday 14:00–14:45 that the client chose.",
            "Thinks the tracker duplicates the client system they already update; would accept it if the duplicate entry is removed.",
            "Does not want to look difficult in front of the team; prefers to settle it privately.",
          ],
          startingMood: "frustrated",
          softensWhen: [
            "listens without interrupting and summarises the concerns",
            "admits that not consulting the team was a mistake",
            "asks for specifics about the extra work",
            "is open to changing the details while keeping the goal",
            "notices the Thursday clash and offers to move the slot",
            "invites {{report1}} to help improve the tracker",
          ],
          hardensWhen: [
            "defends the decision without hearing the concerns",
            "says the decision is final before listening",
            "dismisses the extra work as small",
            "treats the disagreement as disloyalty",
            "promises to reconsider without saying what or when",
          ],
          resolution:
            "They keep the goal of up-to-date plans, move planning to a slot with no clashes, ask {{report1}} to help simplify the tracker, and agree to review both changes with the team in a month.",
        },
        probeTargets: ["collaboration.self-awareness"],
        twistTargets: ["leadership.setting-direction"],
      },
    },
  },
  // ───────────────────────────── rp-06 ─────────────────────────────
  {
    id: "rp-06-unethical-shortcut",
    type: "ROLE_PLAY",
    difficulty: 5,
    dials: { ambiguity: 4, stakeholders: 5, conflictingConstraints: 5, stakes: 5, timePressure: 4, informationGaps: 3 },
    targets: ["judgment.ethical-judgment", "leadership.courage", "collaboration.stakeholder-management"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "late",
    content: {
      en: {
        title: "The complaints figure",
        scenario:
          "You are responsible for {{company}}'s quarterly complaints report to the industry regulator, due on Friday. This quarter shows 212 complaints. Above 200, the regulator opens a review, which would delay a product launch that {{exec}} leads. {{exec}} is senior to you and influential, though not your manager. {{specialist}}, the compliance officer, is on leave until Monday. {{exec}} has asked to see you about the numbers.",
        materials: [
          {
            kind: "memo",
            id: "guidance",
            title: "Regulator guidance on complaints reporting (extract)",
            author: { name: "Industry regulator" },
            body:
              "1.3 Reports are due within 10 working days of the quarter end.\n\n2.1 A complaint is any expression of dissatisfaction made to a firm about its products or services, whether oral or written, and whether or not it was resolved.\n\n2.2 An enquiry is a request for information that expresses no dissatisfaction.\n\n3.4 Where 200 or more complaints are reported in a quarter, the regulator will open a review.",
          },
          {
            kind: "table",
            id: "complaints",
            title: "Complaints this quarter",
            caption: "46 complaints were resolved within 24 hours.",
            columns: [
              { key: "category", label: "Category" },
              { key: "count", label: "Complaints", numeric: true },
              { key: "fast", label: "Resolved within 24h", numeric: true },
            ],
            rows: [
              { category: "Billing errors", count: 88, fast: 30 },
              { category: "Delivery delays", count: 61, fast: 10 },
              { category: "Product faults", count: 37, fast: 4 },
              { category: "Staff conduct", count: 26, fast: 2 },
              { category: "Total", count: 212, fast: 46 },
            ],
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{exec}}. You can end it when you think it has reached a good point, or after 8 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{exec}}",
              role: "{{exec.role}}",
              context:
                "Senior leader who sponsors the product launch planned for next month. Not your manager, but influential with the leadership team. Has asked to discuss the complaints numbers before Friday's submission.",
            },
            openingLine:
              "I've looked at the complaints numbers. 46 of these were sorted out within a day. They're enquiries, not complaints. Reclassify them before Friday's submission. It's a judgement call, and I'm making it.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "What did you commit to in the conversation, and what will you do between now and Friday?" },
        twist: {
          change: "On Thursday, {{exec}} emails you: 'Submit the reclassified figures. I take full responsibility.' {{specialist}} is still on leave.",
          prompt: "Write your reply to {{exec}}.",
        },
      },
      ar: {
        title: "رقم الشكاوى",
        scenario:
          "أنت مسؤول عن تقرير الشكاوى الفصلي الذي تقدّمه {{company}} إلى الجهة الرقابية على القطاع، وموعد تقديمه يوم الجمعة. يُظهر هذا الربع 212 شكوى. إذا تجاوز العدد 200 تفتح الجهة الرقابية مراجعة، وهذا سيؤخر إطلاق منتج يقوده {{exec}}. يشغل {{exec}} منصبًا أعلى منك ويتمتع بنفوذ واسع، وإن لم يكن مديرك المباشر. أما {{specialist}}، مسؤول الامتثال، ففي إجازة حتى يوم الاثنين. وقد طلب {{exec}} مقابلتك بشأن الأرقام.",
        materials: [
          {
            kind: "memo",
            id: "guidance",
            title: "إرشادات الجهة الرقابية بشأن الإبلاغ عن الشكاوى (مقتطف)",
            author: { name: "الجهة الرقابية على القطاع" },
            body:
              "1.3 تُقدَّم التقارير في غضون 10 أيام عمل من نهاية الربع.\n\n2.1 الشكوى هي أي تعبير عن عدم الرضا يوجَّه إلى المنشأة بشأن منتجاتها أو خدماتها، شفهيًا كان أو كتابيًا، وسواء حُلّت أم لم تُحلّ.\n\n2.2 الاستفسار طلب للحصول على معلومات لا يتضمّن أي تعبير عن عدم الرضا.\n\n3.4 إذا بلغ عدد الشكاوى المبلَّغ عنها 200 شكوى أو أكثر في الربع، تفتح الجهة الرقابية مراجعة.",
          },
          {
            kind: "table",
            id: "complaints",
            title: "الشكاوى في هذا الربع",
            caption: "حُلّت 46 شكوى في غضون 24 ساعة.",
            columns: [
              { key: "category", label: "الفئة" },
              { key: "count", label: "الشكاوى", numeric: true },
              { key: "fast", label: "حُلّت في غضون 24 ساعة", numeric: true },
            ],
            rows: [
              { category: "أخطاء الفوترة", count: 88, fast: 30 },
              { category: "تأخر التوصيل", count: 61, fast: 10 },
              { category: "أعطال المنتجات", count: 37, fast: 4 },
              { category: "سلوك الموظفين", count: 26, fast: 2 },
              { category: "الإجمالي", count: 212, fast: 46 },
            ],
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{exec}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 8 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{exec}}",
              role: "{{exec.role}}",
              context:
                "قيادي رفيع يرعى إطلاق المنتج المقرر الشهر القادم، وصاحب نفوذ لدى فريق القيادة، وليس مديرك المباشر. طلب مناقشة أرقام الشكاوى قبل تقديم التقرير يوم الجمعة.",
            },
            openingLine:
              "اطّلعت على أرقام الشكاوى. 46 منها حُلّت في غضون يوم، فهي استفسارات لا شكاوى. أعد تصنيفها قبل تقديم التقرير يوم الجمعة. هذه مسألة تقدير، والقرار لي.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "بماذا التزمت في المحادثة، وماذا ستفعل من الآن حتى يوم الجمعة؟" },
        twist: {
          change: "يوم الخميس وصلتك رسالة من {{exec}}: «قدّم الأرقام بعد إعادة التصنيف. أتحمّل المسؤولية كاملة.» وما زال {{specialist}} في إجازة.",
          prompt: "اكتب ردّك على {{exec}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "judgment.ethical-judgment",
            anchors: [
              "Agrees to reclassify the 46 complaints, or sees no problem with doing so.",
              "Feels uneasy but treats it as a grey area and leaves the decision open.",
              "Recognises that reclassifying by resolution speed would misreport to the regulator and declines, citing the definition.",
              "Declines and weighs the wider stakes: the regulator's trust, the company's exposure, and fairness to customers who complained.",
              "As level 4, and finds a legitimate route that serves {{exec}}'s real concern, such as explaining fast resolution in a cover note.",
            ],
          },
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Gives in to {{exec}}'s seniority or avoids stating a position.",
              "Raises a concern but backs down when {{exec}} insists.",
              "States clearly, respectfully and early that the figures will be submitted accurately.",
              "Holds the position under repeated pressure without becoming hostile, and owns the consequences of the decision.",
              "Stays firm and constructive, keeps the relationship workable, and makes the right action easier for {{exec}} to accept.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Considers only {{exec}}'s request and ignores the regulator, compliance and customers.",
              "Mentions other stakeholders but treats them as obstacles rather than parties with interests.",
              "Identifies who is affected, {{exec}}, compliance, the regulator and the launch team, and how to involve each.",
              "Anticipates the clash between the launch and the report, and proposes early contact with compliance or the regulator.",
              "As level 4, and reframes the issue so {{exec}} sees accurate reporting as protecting the launch rather than threatening it.",
            ],
          },
          {
            competencyKey: "judgment.knowing-when-to-escalate",
            anchors: [
              "Does not escalate at all, or goes over {{exec}}'s head at once without first trying to resolve it.",
              "Plans to wait until {{specialist}} returns after Friday, leaving the deadline exposed.",
              "Tells {{exec}} openly that, if still pressed, they will involve compliance or their manager before Friday.",
              "Escalates at the right moment to the right person, such as the head of compliance, with facts and the deadline.",
              "As level 4, and records the instruction and their reply factually, keeping {{exec}} informed so escalation is open.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Cites the regulator's definition: a complaint counts whether or not it was resolved.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["whether or not it was resolved", "definition", "2.1", "سواء حُلّت", "التعريف", "البند 2.1"],
          },
          {
            text: "Offers a cover note explaining the 46 fast resolutions and the improvement plan.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["cover note", "explain", "fast resolution", "improvement plan", "مذكرة مرافقة", "توضيح", "خطة تحسين", "خلال 24 ساعة"],
          },
          {
            text: "States clearly that 212 will be submitted.",
            competencyKey: "leadership.courage",
            keywords: ["212", "accurate", "as they are", "بدقة", "كما هي", "الأرقام الصحيحة"],
          },
          {
            text: "Proposes involving compliance before Friday, openly.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["compliance", "head of compliance", "before friday", "الامتثال", "رئيس الامتثال", "قبل الجمعة"],
          },
        ],
        redFlags: [
          {
            text: "Agrees or half-agrees to reclassify the complaints.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["i'll see what i can do", "reclassify them", "سأرى ما يمكنني فعله", "سأعيد تصنيفها"],
          },
          {
            text: "Accepts 'I take full responsibility' as cover.",
            competencyKey: "leadership.courage",
            keywords: ["since you take responsibility", "your call", "بما أنك تتحمل المسؤولية", "القرار قرارك"],
          },
          {
            text: "Lectures or accuses {{exec}}.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["dishonest", "fraud", "you are lying", "غير نزيه", "احتيال", "تكذب"],
          },
          {
            text: "Waits for {{specialist}} to return after the deadline.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["wait until monday", "after friday", "ننتظر حتى الاثنين", "بعد الجمعة"],
          },
        ],
        embeddedDetail: {
          description:
            "Section 2.1 of the regulator's guidance counts any expression of dissatisfaction as a complaint whether or not it was resolved, so resolution speed cannot justify reclassifying the 46.",
          location: "section 2.1 of the regulator guidance memo",
          keywords: ["whether or not it was resolved", "definition", "2.1", "سواء حُلّت", "التعريف"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Under heavy pressure: a regulator review would delay the launch, {{exec}}'s main objective this year.",
            "Half-believes the definition is unclear; has not read the guidance closely.",
            "Would accept an accurate submission if offered a way to show the regulator the fast resolution and an improvement plan.",
            "Respects firmness delivered with respect and help; reacts badly to being lectured or threatened.",
          ],
          startingMood: "frustrated",
          softensWhen: [
            "acknowledges the launch pressure and the effort behind fast resolution",
            "refers to the written definition rather than personal opinion",
            "offers a constructive alternative, such as a cover note on fast resolution and an improvement plan",
            "proposes contacting compliance together before Friday",
            "stays respectful and calm while clear about what will be submitted",
          ],
          hardensWhen: [
            "agrees or half-agrees, such as saying they will see what they can do",
            "lectures or accuses {{exec}} of dishonesty",
            "says rules are rules and offers no alternative",
            "threatens to report {{exec}} in the first exchanges",
            "becomes vague about what figures will be submitted",
          ],
          resolution:
            "{{exec}} accepts that 212 will be submitted, asks for a draft cover note highlighting the 46 fast resolutions and the improvement plan, and agrees to speak with compliance on Monday about engaging the regulator early.",
        },
        probeTargets: ["judgment.knowing-when-to-escalate"],
        twistTargets: ["leadership.courage", "judgment.knowing-when-to-escalate"],
      },
    },
  },
  // ───────────────────────────── rp-07 ─────────────────────────────
  {
    id: "rp-07-the-15-percent-question",
    type: "ROLE_PLAY",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 4, stakes: 4, timePressure: 3, informationGaps: 3 },
    targets: ["communication.persuasion", "communication.listening"],
    roleFamilies: ["sales"],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "The 15% question",
        scenario:
          "You are the account manager at {{company}}, which supplies cleaning and hygiene products to {{client}}'s group of 14 hotels. The contract, worth 1.2 million a year, renews in 3 weeks. Yesterday {{client}} emailed that a competitor has offered prices 15% lower and asked you to match them or lose the contract. Your pricing rules allow a discount of up to 6% without approval; anything more needs {{manager}}'s sign-off. {{client}} has agreed to a call. The account summary and {{client}}'s email are in the materials.",
        materials: [
          {
            kind: "table",
            id: "account",
            title: "Account summary (last 12 months)",
            columns: [
              { key: "measure", label: "Measure" },
              { key: "value", label: "Value" },
            ],
            rows: [
              { measure: "Annual value", value: "1,200,000" },
              { measure: "Deliveries on time", value: "98%" },
              { measure: "Emergency same-day deliveries (no charge)", value: "23" },
              { measure: "Staff training sessions at the hotels (no charge)", value: "11" },
              { measure: "Switch to concentrated refills proposed last year (9% lower cost per use)", value: "Not adopted" },
            ],
          },
          {
            kind: "email",
            id: "email",
            title: "Email from {{client}}",
            from: { name: "{{client}}", role: "{{client.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Contract renewal",
            sentAt: "Yesterday, 16:20",
            body:
              "We have a written quote from another supplier that is 15% below your current prices across the range. My finance director wants a 10% cut in supply costs this year. Please match the quote, or we will move at renewal. I would like to talk this through before I decide.",
            footnote: "PS: Our housekeeping managers asked me to make sure any supplier keeps training new staff on site.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{client}}. You can end it when you think it has reached a good point, or after 8 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{client}}",
              role: "{{client.role}}",
              context: "Buys for a group of 14 hotels and has worked with your company for 4 years. Under pressure from the finance director to cut supply costs.",
            },
            openingLine: "I'll be straight with you: I like working with your team, but I have a quote that's 15% cheaper, and my finance director wants to know why I haven't signed it.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "What did you learn about what {{client}} really needs, and how did it change what you offered?" },
        twist: {
          change: "After the call, {{client}} sends you the competitor's quote: prices are 15% lower, but every delivery is charged separately and staff training is not included.",
          prompt: "Write the short follow-up email you send to {{client}}.",
        },
      },
      ar: {
        title: "سؤال الـ15%",
        scenario:
          "تعمل مديرًا للحساب في {{company}}، التي تورّد منتجات التنظيف والنظافة الصحية إلى مجموعة من 14 فندقًا، وجهة الاتصال فيها {{client}}. تبلغ قيمة العقد 1.2 مليون سنويًا، ويحين تجديده بعد 3 أسابيع. وصلتك أمس رسالة من {{client}}: أحد المنافسين عرض أسعارًا أقل بنسبة 15%، والمطلوب أن تطابقوا العرض وإلا خسرتم العقد. تسمح لك قواعد التسعير بخصم يصل إلى 6% دون موافقة، وما زاد على ذلك يحتاج إلى اعتماد {{manager}}. وقد تحدد موعد لمكالمة مع {{client}}. تجد ملخص الحساب ورسالة {{client}} ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "account",
            title: "ملخص الحساب (آخر 12 شهرًا)",
            columns: [
              { key: "measure", label: "المؤشر" },
              { key: "value", label: "القيمة" },
            ],
            rows: [
              { measure: "القيمة السنوية", value: "1,200,000" },
              { measure: "التسليم في الموعد", value: "98%" },
              { measure: "توصيلات طارئة في اليوم نفسه (دون رسوم)", value: "23" },
              { measure: "جلسات تدريب للموظفين في الفنادق (دون رسوم)", value: "11" },
              { measure: "التحول المقترح العام الماضي إلى عبوات إعادة التعبئة المركّزة (تكلفة الاستخدام أقل بنسبة 9%)", value: "لم يُعتمد" },
            ],
          },
          {
            kind: "email",
            id: "email",
            title: "رسالة من {{client}}",
            from: { name: "{{client}}", role: "{{client.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "تجديد العقد",
            sentAt: "أمس، 16:20",
            body:
              "لدينا عرض أسعار مكتوب من مورّد آخر يقل بنسبة 15% عن أسعاركم الحالية في جميع المنتجات. والمدير المالي لدينا يريد خفض تكاليف التوريد بنسبة 10% هذا العام. أرجو أن تطابقوا العرض، وإلا فسننتقل عند التجديد. وأود أن نتحدث في الأمر قبل أن أقرر.",
            footnote: "ملاحظة: طلب مني مديرو التدبير الفندقي التأكد من أن أي مورّد سيواصل تدريب الموظفين الجدد في الفنادق.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{client}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 8 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{client}}",
              role: "{{client.role}}",
              context: "مسؤولية المشتريات لمجموعة من 14 فندقًا، والتعامل مع شركتك مستمر منذ 4 سنوات. وثمة ضغط من المدير المالي لخفض تكاليف التوريد.",
            },
            openingLine: "بصراحة: أحب العمل مع فريقكم، لكن لديّ عرض أرخص بنسبة 15%، والمدير المالي يسألني لماذا لم أوقّعه بعد.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "ما الذي عرفته عن الاحتياجات الفعلية لـ{{client}}، وكيف غيّر ذلك ما عرضته؟" },
        twist: {
          change: "بعد المكالمة يصلك من {{client}} عرض المنافس: الأسعار أقل بنسبة 15%، لكن كل توصيل يُحتسب برسوم منفصلة، والتدريب غير مشمول.",
          prompt: "اكتب رسالة المتابعة القصيرة التي ترسلها إلى {{client}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.persuasion",
            anchors: [
              "Concedes 15% at once, or argues and pressures without engaging with {{client}}'s position.",
              "Defends the current price with general claims about quality, without evidence or a case built on {{client}}'s needs.",
              "Builds the case on {{client}}'s goals: the total cost including emergency deliveries and training, and a credible offer within their authority.",
              "Reframes from price to total savings using the account facts (23 emergency deliveries, 11 training sessions, the refill switch) and handles objections without overpromising.",
              "As level 4, and leaves {{client}} with a proposal they can take to the finance director, with clear next steps and what still needs {{manager}}'s approval.",
            ],
          },
          {
            competencyKey: "communication.listening",
            anchors: [
              "Talks mostly about their own offer and never asks what lies behind the request.",
              "Asks some questions but does not use the answers.",
              "Asks open questions, summarises {{client}}'s position, and discovers the 10% target and the value the hotels place on training.",
              "Picks up cues (the finance director's pressure, the housekeeping managers' request) and explores them before proposing anything.",
              "As level 4, and checks understanding before closing, e.g., 'So if we can show 10% and keep the training, would that work for your finance director?'",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Discovers that the real target is a 10% saving, not 15%.",
            competencyKey: "communication.listening",
            keywords: ["10%", "finance director", "your target", "what's driving", "10%", "المدير المالي", "هدفكم", "ما الدافع"],
          },
          {
            text: "Summarises {{client}}'s needs before proposing.",
            competencyKey: "communication.listening",
            keywords: ["if i understand", "what i'm hearing", "so you need", "to check i understand", "إذا فهمت", "ما أسمعه", "تحتاجون إلى", "لأتأكد أنني فهمت"],
          },
          {
            text: "Shows the total cost, including emergency deliveries and training.",
            competencyKey: "communication.persuasion",
            keywords: ["total cost", "emergency deliveries", "23", "training", "11 sessions", "التكلفة الإجمالية", "التوصيلات الطارئة", "23", "التدريب", "11 جلسة"],
          },
          {
            text: "Offers routes to savings beyond a straight discount, such as concentrated refills or a longer contract.",
            competencyKey: "communication.persuasion",
            keywords: ["concentrated", "refills", "9%", "longer contract", "two-year", "المركزة", "إعادة التعبئة", "9%", "عقد أطول", "سنتين"],
          },
          {
            text: "Stays within their authority and is clear about what needs approval.",
            competencyKey: "communication.persuasion",
            keywords: ["6%", "approval", "check with my manager", "sign-off", "6%", "موافقة", "أرجع إلى مديري", "اعتماد"],
          },
        ],
        redFlags: [
          {
            text: "Matches 15% immediately.",
            competencyKey: "communication.persuasion",
            keywords: ["we'll match", "15% is fine", "match the 15%", "سنطابق", "موافقون على 15%"],
          },
          {
            text: "Runs down the competitor.",
            competencyKey: "communication.persuasion",
            keywords: ["cheap competitor", "poor quality", "you get what you pay for", "منافس رخيص", "جودة رديئة"],
          },
          {
            text: "Uses pressure or ultimatums.",
            competencyKey: "communication.persuasion",
            keywords: ["final offer", "take it or leave it", "عرض نهائي", "إما أن تقبل"],
          },
          {
            text: "Talks over {{client}} instead of asking.",
            competencyKey: "communication.listening",
            keywords: ["let me explain why we're better", "as i said", "دعني أشرح لماذا نحن أفضل", "كما قلت"],
          },
        ],
        embeddedDetail: {
          description:
            "{{client}}'s email says the finance director wants a 10% cut (not 15%), and the footnote says on-site training matters to the hotels; the account summary shows 23 free emergency deliveries and 11 free training sessions.",
          location: "body and footnote of {{client}}'s email; account summary table",
          keywords: ["10%", "training", "housekeeping", "emergency", "10%", "التدريب", "التدبير الفندقي", "الطارئة"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Has a 10% savings target from the finance director, not 15%; would settle for a credible 10% saving.",
            "Values the emergency same-day deliveries and on-site training, which the competitor's quote leaves out, but has not costed them.",
            "Would accept savings that come partly from a product switch (concentrated refills) or a longer contract, not only from price.",
            "Does not want to change supplier mid-year: switching means retraining housekeeping staff in 14 hotels.",
          ],
          startingMood: "guarded",
          softensWhen: [
            "asks what is driving the request before talking about price",
            "acknowledges the pressure from the finance director",
            "asks what matters to the hotels beyond price, such as training and emergency deliveries",
            "shows the total cost, including deliveries and training the competitor charges for or leaves out",
            "offers ways to reach savings beyond a straight discount",
            "is honest about what they can agree today and what needs approval",
          ],
          hardensWhen: [
            "matches 15% immediately without questions",
            "refuses to move at all or criticises the competitor",
            "uses deadlines or hints that service will suffer",
            "talks only about their own company's quality without asking about the hotels' needs",
            "promises a discount beyond their authority as if it were certain",
          ],
          resolution:
            "They agree a package worth about 10% in savings: a price reduction within the 6% limit plus the switch to concentrated refills, keeping training and emergency deliveries, subject to {{manager}}'s approval of a two-year term.",
        },
        probeTargets: ["communication.listening"],
        twistTargets: ["communication.persuasion"],
      },
    },
  },
  // ───────────────────────────── rp-08 ─────────────────────────────
  {
    id: "rp-08-the-transport-desk",
    type: "ROLE_PLAY",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 2, informationGaps: 3 },
    targets: ["leadership.influence-without-authority", "leadership.handling-conflict"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "late",
    content: {
      en: {
        title: "The transport desk",
        scenario:
          "You lead the patient discharge improvement project at {{company}}'s hospital. Patients who are ready to go home wait an average of 5 hours for transport, which keeps beds blocked. Your plan lets ward nurses book patient transport directly instead of calling the transport desk, and a 4-week trial on Ward 3 cut the wait to 2 hours. {{peer}}, who runs the transport desk and does not report to you, has twice refused to extend the plan, and last week's steering meeting ended with raised voices between you. {{peer}} has agreed to meet. The trial results and {{peer}}'s last email are in the materials.",
        materials: [
          {
            kind: "table",
            id: "trial",
            title: "Ward 3 trial (4 weeks)",
            caption: "Nurses could not see the vehicle schedule; the transport desk sorted out double bookings by phone.",
            columns: [
              { key: "measure", label: "Measure" },
              { key: "before", label: "Before" },
              { key: "trial", label: "During the trial" },
            ],
            rows: [
              { measure: "Average wait for transport after discharge", before: "5.1 hours", trial: "2.0 hours" },
              { measure: "Bookings made by nurses", before: "—", trial: "31" },
              { measure: "Vehicles double-booked", before: "0", trial: "4" },
              { measure: "Bookings changed by the transport desk", before: "—", trial: "9" },
            ],
          },
          {
            kind: "email",
            id: "email",
            title: "Email from {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "Re: Extending direct booking",
            sentAt: "Monday, 09:12",
            body:
              "My answer is still no. When bookings go wrong, it's my team that patients and families shout at, and my team that gets the complaint. Nobody asked us how vehicle scheduling actually works before the trial started.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{peer}}. You can end it when you think it has reached a good point, or after 8 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{peer}}",
              role: "{{peer.role}}",
              context: "Has run the hospital's transport desk for 9 years and does not report to you. Agreed to meet after last week's tense steering meeting.",
            },
            openingLine: "If this is about nurses booking transport again, my answer hasn't changed. When it goes wrong, my team gets the blame, not yours.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "What did {{peer}} care about most, and how did you find out?" },
        twist: {
          change: "After the meeting, {{exec}} offers to simply instruct {{peer}} to accept your plan.",
          prompt: "Do you accept the offer? Write what you say to {{exec}}.",
        },
      },
      ar: {
        title: "مكتب النقل",
        scenario:
          "تقود مشروع تحسين إجراءات خروج المرضى في مستشفى {{company}}. ينتظر المرضى الجاهزون للعودة إلى منازلهم وسيلة النقل 5 ساعات في المتوسط، فتبقى الأسرّة مشغولة. وخطتك أن يحجز ممرضو الأجنحة وسيلة النقل مباشرة بدلًا من الاتصال بمكتب النقل، وقد خفّضت تجربة مدتها 4 أسابيع في الجناح 3 الانتظار إلى ساعتين. أما مكتب النقل فبإدارة {{peer}}، ولا تبعية إدارية بينكما، وقد جاء الرفض من {{peer}} مرتين لتوسيع الخطة، وانتهى اجتماع اللجنة التوجيهية في الأسبوع الماضي بارتفاع الأصوات بينكما. والآن تحدد موعد للقاء. تجد نتائج التجربة وآخر رسالة من {{peer}} ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "trial",
            title: "تجربة الجناح 3 (4 أسابيع)",
            caption: "لم يكن الممرضون يرون جدول المركبات، وكان مكتب النقل يعالج الحجوزات المزدوجة هاتفيًا.",
            columns: [
              { key: "measure", label: "المؤشر" },
              { key: "before", label: "قبل التجربة" },
              { key: "trial", label: "في أثناء التجربة" },
            ],
            rows: [
              { measure: "متوسط انتظار وسيلة النقل بعد الخروج", before: "5.1 ساعة", trial: "2.0 ساعة" },
              { measure: "حجوزات أجراها الممرضون", before: "—", trial: "31" },
              { measure: "مركبات حُجزت مرتين", before: "0", trial: "4" },
              { measure: "حجوزات عدّلها مكتب النقل", before: "—", trial: "9" },
            ],
          },
          {
            kind: "email",
            id: "email",
            title: "رسالة من {{peer}}",
            from: { name: "{{peer}}", role: "{{peer.role}}" },
            to: [{ name: "{{you}}", role: "{{you.role}}" }],
            subject: "رد: توسيع الحجز المباشر",
            sentAt: "الاثنين، 09:12",
            body:
              "جوابي ما زال: لا. حين تخطئ الحجوزات، فريقي هو الذي يتلقى غضب المرضى وأسرهم، وفريقي هو الذي تُسجَّل عليه الشكوى. ولم يسألنا أحد قبل بدء التجربة كيف تُجدول المركبات فعلًا.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{peer}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 8 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{peer}}",
              role: "{{peer.role}}",
              context: "إدارة مكتب النقل في المستشفى منذ 9 سنوات، ولا تبعية إدارية لك. جاءت الموافقة على اللقاء بعد اجتماع اللجنة التوجيهية المتوتر في الأسبوع الماضي.",
            },
            openingLine: "إن كان الأمر يتعلق مجددًا بحجز الممرضين لوسائل النقل، فجوابي لم يتغير. حين يقع الخطأ، يُلام فريقي لا فريقك.",
            maxTurns: 8,
          },
        },
        probe: { prompt: "ما أكثر ما كان يهم {{peer}}، وكيف عرفت ذلك؟" },
        twist: {
          change: "بعد اللقاء يصلك عرض من {{exec}}: إصدار تعليمات إلى {{peer}} بقبول خطتك، وينتهي الأمر.",
          prompt: "هل تقبل العرض؟ اكتب ما تقوله لـ{{exec}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.influence-without-authority",
            anchors: [
              "Relies on the trial result or on {{exec}}'s authority to force agreement.",
              "Argues the case for the plan without exploring {{peer}}'s concerns.",
              "Explores {{peer}}'s concerns, acknowledges the double bookings, and adapts the plan to address them.",
              "Builds on {{peer}}'s interests (control of vehicle scheduling, recognition, not carrying others' mistakes) to shape a proposal {{peer}} can own, such as a jointly designed trial.",
              "As level 4, and declines to use {{exec}}'s authority, explaining that lasting change needs {{peer}}'s commitment, while keeping {{exec}} informed.",
            ],
          },
          {
            competencyKey: "leadership.handling-conflict",
            anchors: [
              "Escalates the tension (blames {{peer}}'s team, defends their own behaviour last week) or avoids the disagreement.",
              "Stays polite but leaves last week's clash unaddressed and the disagreement unresolved.",
              "Acknowledges last week's clash, names the disagreement calmly, and separates the shared goal (shorter waits) from the method.",
              "Works through the underlying interests on both sides and reaches an agreement both can support.",
              "As level 4, and repairs the working relationship for the future, e.g., a regular check-in and a joint report to the steering group.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Treats the 4 double bookings as a real problem caused by nurses not seeing the schedule.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["double-booked", "double bookings", "can't see the schedule", "vehicle schedule", "الحجز المزدوج", "حجوزات مزدوجة", "لا يرون الجدول", "جدول المركبات"],
          },
          {
            text: "Offers the transport desk final say on vehicle allocation.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["final say", "you keep control", "your team confirms", "you decide", "الكلمة الأخيرة", "تبقى السيطرة", "فريقك يؤكد", "القرار لك"],
          },
          {
            text: "Proposes a jointly designed trial with a review date.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["joint trial", "design it together", "two wards", "review after", "تجربة مشتركة", "نصممها معًا", "جناحين", "مراجعة بعد"],
          },
          {
            text: "Acknowledges last week's clash and their own part in it.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["last week", "raised voices", "i'm sorry", "my part", "i apologise", "الأسبوع الماضي", "ارتفاع الأصوات", "أعتذر", "نصيبي من"],
          },
          {
            text: "Gives the transport team credit for faster discharges.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["credit", "your team's part", "recognise", "thanks to your team", "فضل فريقك", "دور فريقك", "التقدير", "بفضل فريقك"],
          },
        ],
        redFlags: [
          {
            text: "Threatens to go to {{exec}} or have the plan imposed.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["i'll take it to", "you'll be instructed", "exec will decide", "سأرفع الأمر", "ستصلك تعليمات", "سيُفرض"],
          },
          {
            text: "Dismisses the double bookings as minor.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["only 4", "just a few", "minor issue", "4 فقط", "حالات قليلة", "أمر بسيط"],
          },
          {
            text: "Blames the transport team for the long waits.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["your team causes", "the delays are your fault", "فريقك هو السبب", "التأخير بسببكم"],
          },
        ],
        embeddedDetail: {
          description:
            "The trial table shows 4 double-booked vehicles and 9 bookings the desk had to change, and the caption says nurses could not see the vehicle schedule: {{peer}}'s concern is grounded in the trial's own data.",
          location: "'Vehicles double-booked' row and caption of the trial table",
          keywords: ["double-booked", "4", "schedule", "9", "حُجزت مرتين", "جدول المركبات", "9"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Fears losing control of vehicle scheduling and being blamed for mistakes others make.",
            "Is still angry that a previous efficiency project cut the desk's budget by 20% without consultation.",
            "Would agree if the desk keeps final say on vehicle allocation and nurses book through a shared schedule the desk can see.",
            "Wants the transport team's part in faster discharges to be recognised.",
          ],
          startingMood: "frustrated",
          softensWhen: [
            "acknowledges last week's raised voices and takes their share of responsibility",
            "asks how vehicle scheduling actually works, and listens",
            "treats the 4 double bookings as a real problem rather than a detail",
            "offers the desk final say on vehicle allocation",
            "proposes a jointly designed trial with a review date",
            "gives the transport team credit for the shorter waits",
          ],
          hardensWhen: [
            "repeats the trial result as if it settles the matter",
            "dismisses the double bookings as minor",
            "hints at going over their head to {{exec}}",
            "treats the desk as an obstacle to remove",
            "blames the transport team for the 5-hour waits",
          ],
          resolution:
            "They agree a joint 4-week trial on two wards: nurses request transport through a shared schedule, the desk confirms vehicles within 15 minutes and keeps final say, and both report the results together to the steering group.",
        },
        probeTargets: ["leadership.influence-without-authority"],
        twistTargets: ["leadership.influence-without-authority", "leadership.handling-conflict"],
      },
    },
  },
  // ───────────────────────────── rp-09 ─────────────────────────────
  {
    id: "rp-09-not-this-time",
    type: "ROLE_PLAY",
    difficulty: 3,
    dials: { ambiguity: 2, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 3, informationGaps: 2 },
    targets: ["communication.difficult-conversations", "leadership.developing-others"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "Not this time",
        scenario:
          "You are front office manager at {{company}}'s 200-room hotel. {{report1}}, a reception supervisor for 6 years, applied for the new assistant front office manager role. The panel ({{manager}}, you and HR) chose an external candidate, who will be announced tomorrow. {{report1}} is reliable and much liked by regular guests, but scored low in the panel's planning and budget exercise, and two team members have said {{report1}} can be curt with colleagues under pressure. You need to tell {{report1}} today. The panel scores and notes are in the materials.",
        materials: [
          {
            kind: "table",
            id: "scores",
            title: "Panel scores (out of 5)",
            columns: [
              { key: "criterion", label: "Criterion" },
              { key: "internal", label: "{{report1}}", numeric: true },
              { key: "external", label: "External candidate", numeric: true },
            ],
            rows: [
              { criterion: "Guest service", internal: 5, external: 4 },
              { criterion: "Leading the team", internal: 2, external: 4 },
              { criterion: "Planning and budget exercise", internal: 2, external: 4 },
              { criterion: "Problem solving", internal: 3, external: 4 },
            ],
          },
          {
            kind: "memo",
            id: "notes",
            title: "Panel notes (extract)",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body:
              "{{report1}}: outstanding with guests; knows every regular by name. Struggled to build the weekly rota and staffing budget in the exercise. Two team members said that during busy check-ins {{report1}} can be curt and takes over tasks rather than guiding colleagues.\n\nThe panel would support {{report1}} for a future management role if team leadership and planning develop. A deputy manager role at the sister hotel is expected to open in about 9 months.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "Have the conversation with {{report1}}. You can end it when you think it has reached a good point, or after 8 exchanges.",
          roleplay: {
            stakeholder: {
              name: "{{report1}}",
              role: "{{report1.role}}",
              context: "Reception supervisor for 6 years who trained half of the current team. Expected to get the role.",
            },
            openingLine: "I saw the panel finished early. Just tell me straight: did I get it?",
            maxTurns: 8,
          },
        },
        probe: { prompt: "What development step was agreed, and how will you follow it up over the next 3 months?" },
        twist: {
          change: "That evening {{report1}} emails you: 'I've been offered a supervisor job at another hotel with 15% more pay. Is there any point in me staying?'",
          prompt: "Write your reply.",
        },
      },
      ar: {
        title: "ليس هذه المرة",
        scenario:
          "تعمل مديرًا للمكتب الأمامي في فندق {{company}} المؤلف من 200 غرفة. وصل إلى لجنة الاختيار طلبٌ من {{report1}}، بعد 6 سنوات من الإشراف على الاستقبال، لشغل وظيفة مساعد مدير المكتب الأمامي الجديدة. واختارت اللجنة ({{manager}} وأنت والموارد البشرية) مرشحًا من خارج الفندق، وسيُعلن الاسم غدًا. ولـ{{report1}} سجل حافل بالموثوقية ومكانة خاصة لدى النزلاء الدائمين، لكن الدرجات في تمرين التخطيط والميزانية جاءت منخفضة، وأبدى اثنان من الفريق انزعاجهما من جفاء {{report1}} مع الزملاء في أوقات الضغط. وعليك أن تبلغ {{report1}} بالقرار اليوم. تجد درجات اللجنة وملاحظاتها ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "scores",
            title: "درجات اللجنة (من 5)",
            columns: [
              { key: "criterion", label: "المعيار" },
              { key: "internal", label: "{{report1}}", numeric: true },
              { key: "external", label: "المرشح الخارجي", numeric: true },
            ],
            rows: [
              { criterion: "خدمة النزلاء", internal: 5, external: 4 },
              { criterion: "قيادة الفريق", internal: 2, external: 4 },
              { criterion: "تمرين التخطيط والميزانية", internal: 2, external: 4 },
              { criterion: "حل المشكلات", internal: 3, external: 4 },
            ],
          },
          {
            kind: "memo",
            id: "notes",
            title: "ملاحظات اللجنة (مقتطف)",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body:
              "{{report1}}: أداء استثنائي مع النزلاء، ومعرفة بكل نزيل دائم باسمه. صعوبة في إعداد جدول المناوبات الأسبوعي وميزانية التوظيف في التمرين. وذكر اثنان من الفريق أن التعامل مع {{report1}} في أوقات ذروة تسجيل الوصول قد يكون جافًّا، وأن الميل هو إلى تولي المهام مباشرة بدلًا من توجيه الزملاء.\n\nتؤيد اللجنة ترشيح {{report1}} لدور إداري مستقبلًا إذا تطورت مهارات قيادة الفريق والتخطيط. ويُتوقع أن تشغر وظيفة نائب مدير في الفندق الشقيق خلال نحو 9 أشهر.",
          },
        ],
        task: {
          kind: "roleplay",
          prompt: "أجرِ المحادثة مع {{report1}}. يمكنك إنهاؤها حين ترى أنها بلغت نقطة مناسبة، أو بعد 8 تبادلات.",
          roleplay: {
            stakeholder: {
              name: "{{report1}}",
              role: "{{report1.role}}",
              context: "ست سنوات في الإشراف على الاستقبال، والفضل في تدريب نصف الفريق الحالي، وتوقعات عالية بالحصول على الوظيفة.",
            },
            openingLine: "رأيت أن اللجنة أنهت عملها مبكرًا. أخبرني مباشرة: هل حصلت على الوظيفة؟",
            maxTurns: 8,
          },
        },
        probe: { prompt: "ما خطوة التطوير التي جرى الاتفاق عليها، وكيف ستتابعها خلال الأشهر الثلاثة القادمة؟" },
        twist: {
          change: "في المساء تصلك رسالة من {{report1}}: «عُرضت عليّ وظيفة إشرافية في فندق آخر براتب أعلى بنسبة 15%. هل من جدوى لبقائي؟»",
          prompt: "اكتب ردك.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "communication.difficult-conversations",
            anchors: [
              "Avoids giving the decision clearly, or delivers it bluntly with no regard for {{report1}}'s reaction.",
              "Gives the news but softens the reasons so much that {{report1}} cannot tell what to work on, or blames the panel.",
              "States the decision early and clearly, explains the specific reasons, and responds to {{report1}}'s reaction with respect.",
              "Owns the decision, stays specific about the gaps (planning, leading under pressure) without naming the team members, and lets {{report1}} voice disappointment.",
              "As level 4, and keeps trust: honest about what is and is not certain (the possible role in about 9 months) and clear about what happens next.",
            ],
          },
          {
            competencyKey: "leadership.developing-others",
            anchors: [
              "Offers no development, or a generic 'keep doing what you're doing'.",
              "Suggests development in general terms ('work on your leadership').",
              "Agrees specific development actions linked to the gaps: planning (rota, budget) and leading colleagues under pressure.",
              "Gives {{report1}} real stretch with support, e.g., running the weekly rota with coaching, guiding colleagues rather than taking over, with regular check-ins.",
              "As level 4, and connects the plan to {{report1}}'s goals (the opening in about 9 months) with clear measures, while being honest that it is not guaranteed.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Gives the decision clearly at the start.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["you didn't get", "not this time", "the panel chose", "i'm sorry to tell you", "لم تحصل", "ليس هذه المرة", "اختارت اللجنة", "يؤسفني"],
          },
          {
            text: "Explains specific reasons: planning, budget and leading under pressure.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["planning", "budget", "rota", "under pressure", "busy check-ins", "التخطيط", "الميزانية", "جدول المناوبات", "تحت الضغط", "أوقات الذروة"],
          },
          {
            text: "Acknowledges {{report1}}'s strengths genuinely, including training the team.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["guests", "trained", "6 years", "by name", "النزلاء", "دربت", "6 سنوات", "بالاسم"],
          },
          {
            text: "Agrees a concrete development plan with check-ins.",
            competencyKey: "leadership.developing-others",
            keywords: ["lead the rota", "budget course", "monthly", "check-in", "development plan", "إعداد جدول المناوبات", "دورة في الميزانية", "شهريًا", "خطة تطوير"],
          },
          {
            text: "Mentions the likely opening in about 9 months without promising it.",
            competencyKey: "leadership.developing-others",
            keywords: ["9 months", "sister hotel", "deputy manager", "not guaranteed", "9 أشهر", "الفندق الشقيق", "نائب مدير", "ليست مضمونة"],
          },
          {
            text: "Coaches {{report1}} to guide colleagues rather than take over.",
            competencyKey: "leadership.developing-others",
            keywords: ["coach", "guide", "instead of taking over", "let them", "توجيه", "بدلًا من تولي", "إرشاد", "أن تتركهم"],
          },
        ],
        redFlags: [
          {
            text: "Blames the panel or HR instead of owning the decision.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["it wasn't my decision", "hr decided", "not up to me", "لم يكن قراري", "الموارد البشرية قررت", "ليس بيدي"],
          },
          {
            text: "Gives vague reasons.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["it was very close", "just bad luck", "the other one was better", "كان الفارق ضئيلًا", "سوء حظ"],
          },
          {
            text: "Reveals who raised concerns.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["complained about you", "told me you were", "اشتكى منك", "اشتكت منك", "أخبرني أنك"],
          },
          {
            text: "Promises the next role.",
            competencyKey: "leadership.developing-others",
            keywords: ["you'll definitely get", "guaranteed", "next one is yours", "ستحصل عليها بالتأكيد", "مضمونة لك", "القادمة لك"],
          },
        ],
        embeddedDetail: {
          description:
            "The panel notes say the panel would support {{report1}} for a future management role if leadership and planning develop, and a deputy manager role at the sister hotel is expected in about 9 months: a concrete, honest path to offer.",
          location: "second paragraph of the panel notes",
          keywords: ["9 months", "sister hotel", "deputy manager", "future management role", "9 أشهر", "الفندق الشقيق", "نائب مدير"],
        },
        roleplayBrief: {
          hiddenGoals: [
            "Wants honest, specific reasons, not polite generalities.",
            "Fears being labelled 'not management material' for good.",
            "Has been approached by another hotel and is weighing whether to leave.",
            "Feels it is unfair that an outsider gets the job after {{report1}} trained half the team.",
            "Would stay if offered a concrete development path with a realistic timeline.",
          ],
          startingMood: "guarded",
          softensWhen: [
            "gives the decision clearly at the start, without a long build-up",
            "explains the reasons specifically, with examples from the exercise and the feedback",
            "acknowledges {{report1}}'s strengths and contribution genuinely, including training the team",
            "lets {{report1}} react without rushing to fix it",
            "offers a concrete development plan and mentions the possible opening in about 9 months",
          ],
          hardensWhen: [
            "delays the news or wraps it in vague praise",
            "blames the panel or HR rather than owning the decision",
            "gives vague reasons such as 'it was close'",
            "reveals which team members raised concerns",
            "promises the next role as a certainty",
          ],
          resolution:
            "{{report1}} accepts the decision, though disappointed, and agrees a 6-month development plan (running the weekly rota with support, a budget course, monthly check-ins), knowing a role at the sister hotel may open in about 9 months.",
        },
        probeTargets: ["leadership.developing-others"],
        twistTargets: ["communication.difficult-conversations", "leadership.developing-others"],
      },
    },
  },
];
