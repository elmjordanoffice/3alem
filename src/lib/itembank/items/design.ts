import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  // ───────────────────────────── ds-01 ─────────────────────────────
  {
    id: "ds-01-funnel-drop-off",
    type: "DESIGN_CHALLENGE",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["product-thinking.problem-framing", "product-thinking.solution-design", "critical-thinking.root-cause-analysis"],
    roleFamilies: [],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "Step 3",
        scenario:
          "{{company}}'s new online account application has 5 steps. Last month 10,000 people started it and only 2,600 submitted. The biggest drop is at step 3, 'Upload documents', where more than half of those who arrive leave. {{manager}} has asked you to design a fix for the next release, in 6 weeks. The funnel, a breakdown by device and a note from {{specialist}} are attached.",
        materials: [
          {
            kind: "chart",
            id: "funnel",
            title: "Application funnel, last month",
            caption: "People who reached each step.",
            chartType: "bar",
            xKey: "step",
            unit: "people",
            series: [{ key: "people", label: "People" }],
            data: [
              { step: "1 Start", people: 10000 },
              { step: "2 Personal details", people: 7800 },
              { step: "3 Upload documents", people: 7400 },
              { step: "4 Review", people: 3100 },
              { step: "5 Submit", people: 2600 },
            ],
          },
          {
            kind: "table",
            id: "devices",
            title: "Step 3 completion by device",
            columns: [
              { key: "device", label: "Device" },
              { key: "reached", label: "Reached step 3", numeric: true },
              { key: "completed", label: "Completed step 3", numeric: true },
              { key: "rate", label: "Completion rate" },
            ],
            rows: [
              { device: "Mobile", reached: 5200, completed: 1300, rate: "25%" },
              { device: "Desktop", reached: 2200, completed: 1800, rate: "82%" },
            ],
          },
          {
            kind: "email",
            id: "support-note",
            title: "Note from {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "Upload errors",
            sentAt: "Tuesday 11:30",
            body: "Support tickets about step 3 doubled this month. Most say 'upload failed' with no explanation. Users can try again, but the page clears the whole form when an upload fails.",
            footnote: "Technical note: the upload limit is 2 MB per file; photos taken on most current phones are 3 to 6 MB.",
          },
        ],
        task: {
          kind: "design",
          prompt: "Design a fix for step 3. Complete each section.",
          design: {
            sections: [
              { id: "problem", label: "The problem", hint: "What exactly is going wrong, for whom, and how will you know it is fixed?" },
              { id: "options", label: "Options", hint: "At least 2 genuinely different ways to address it." },
              { id: "design", label: "Your proposed fix", hint: "What the user experiences, step by step, including when something goes wrong." },
              { id: "measure", label: "How you will test it", hint: "What you will measure, and what result would make you change course." },
            ],
          },
        },
        probe: { prompt: "What would you check first, before building anything, and what result would change your plan?" },
        twist: {
          change: "Legal confirms that the documents must be collected before the application is submitted; the upload cannot move to after submission.",
          prompt: "How does your design change?",
        },
      },
      ar: {
        title: "الخطوة الثالثة",
        scenario:
          "يتكوّن طلب فتح الحساب الإلكتروني الجديد في {{company}} من 5 خطوات. في الشهر الماضي بدأ الطلب 10,000 شخص، ولم يقدّمه سوى 2,600. أكبر تسرّب يقع في الخطوة 3 «رفع المستندات»، إذ يغادر أكثر من نصف من يصلون إليها. طلب منك {{manager}} تصميم حل للإصدار القادم بعد 6 أسابيع. مرفق مسار التحويل، وتوزيع النتائج بحسب الجهاز، وملاحظة من {{specialist}}.",
        materials: [
          {
            kind: "chart",
            id: "funnel",
            title: "مسار التحويل في الطلب، الشهر الماضي",
            caption: "عدد الأشخاص الذين وصلوا إلى كل خطوة.",
            chartType: "bar",
            xKey: "step",
            unit: "شخص",
            series: [{ key: "people", label: "الأشخاص" }],
            data: [
              { step: "1 البدء", people: 10000 },
              { step: "2 البيانات الشخصية", people: 7800 },
              { step: "3 رفع المستندات", people: 7400 },
              { step: "4 المراجعة", people: 3100 },
              { step: "5 التقديم", people: 2600 },
            ],
          },
          {
            kind: "table",
            id: "devices",
            title: "إكمال الخطوة 3 بحسب الجهاز",
            columns: [
              { key: "device", label: "الجهاز" },
              { key: "reached", label: "وصلوا إلى الخطوة 3", numeric: true },
              { key: "completed", label: "أكملوا الخطوة 3", numeric: true },
              { key: "rate", label: "معدل الإكمال" },
            ],
            rows: [
              { device: "الجوال", reached: 5200, completed: 1300, rate: "25%" },
              { device: "الحاسوب المكتبي", reached: 2200, completed: 1800, rate: "82%" },
            ],
          },
          {
            kind: "email",
            id: "support-note",
            title: "ملاحظة من {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "أخطاء رفع الملفات",
            sentAt: "الثلاثاء 11:30",
            body: "تضاعفت تذاكر الدعم المتعلقة بالخطوة 3 هذا الشهر، ويقول معظمها «فشل الرفع» دون أي توضيح. يستطيع المستخدمون إعادة المحاولة، لكن الصفحة تمسح النموذج بالكامل حين يفشل الرفع.",
            footnote: "ملاحظة تقنية: الحد الأقصى لحجم الملف المرفوع 2 ميغابايت، بينما يتراوح حجم الصور الملتقطة بمعظم الهواتف الحالية بين 3 و6 ميغابايت.",
          },
        ],
        task: {
          kind: "design",
          prompt: "صمّم حلًّا للخطوة 3، واملأ كل قسم.",
          design: {
            sections: [
              { id: "problem", label: "المشكلة", hint: "ما الخلل تحديدًا، ومن يواجهه، وكيف ستعرف أنه عولج؟" },
              { id: "options", label: "البدائل", hint: "طريقتان مختلفتان اختلافًا حقيقيًا على الأقل لمعالجته." },
              { id: "design", label: "الحل المقترح", hint: "ما الذي يمرّ به المستخدم خطوة بخطوة، بما في ذلك ما يحدث عند حدوث خطأ." },
              { id: "measure", label: "كيف ستختبره", hint: "ما الذي ستقيسه، وأي نتيجة ستدفعك إلى تغيير المسار." },
            ],
          },
        },
        probe: { prompt: "ما أول ما ستتحقق منه قبل بناء أي شيء، وأي نتيجة ستغيّر خطتك؟" },
        twist: {
          change: "أكّد الفريق القانوني أنه يجب جمع المستندات قبل تقديم الطلب، فلا يمكن نقل خطوة الرفع إلى ما بعد التقديم.",
          prompt: "كيف يتغيّر تصميمك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "product-thinking.problem-framing",
            anchors: [
              "Starts from a feature idea, such as redesigning the page, without stating the problem it solves.",
              "States the problem broadly, such as step 3 being hard, without saying for whom or why.",
              "Defines the problem specifically: mobile users failing uploads at step 3, with step 3 completion as the success measure.",
              "Questions the obvious framing and narrows to what matters most: failed uploads from phones, not page layout.",
              "Reframes to reduce the need, such as in-app document capture or another verification route, opening better options.",
            ],
          },
          {
            competencyKey: "product-thinking.solution-design",
            anchors: [
              "Proposes a fix that ignores the constraints or the mobile context, such as asking users to scan documents.",
              "Describes a workable technical change, such as raising the limit, without how users experience the step.",
              "Designs a fix for the core need within constraints and describes the user's path, including a failed upload.",
              "Simplifies to essentials, covers edge cases such as weak connections or wrong file types, and proposes a small first version.",
              "Prefers the simplest fix that serves users, such as automatic compression and saved progress, built to learn from real use.",
            ],
          },
          {
            competencyKey: "critical-thinking.root-cause-analysis",
            anchors: [
              "Treats the drop-off itself as the cause, or blames users for giving up.",
              "Names one plausible cause, such as page design, without checking it against the device data.",
              "Uses the device split and support tickets to narrow the cause to failed uploads on mobile.",
              "Links the 2 MB limit to phone photo sizes and the cleared form as likely causes, and names a check to confirm.",
              "As level 4, and separates contributing causes, the limit, the missing error message and lost progress, ranking their impact.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Connects the 2 MB limit with phone photos of 3 to 6 MB.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["2 mb", "file size", "phone photos", "compress", "حجم الملف", "2 ميغابايت", "صور الهاتف", "ضغط الصور"],
          },
          {
            text: "Focuses on mobile, where step 3 completion is 25% against 82% on desktop.",
            competencyKey: "product-thinking.problem-framing",
            keywords: ["mobile", "25%", "82%", "phone", "الجوال", "الهاتف"],
          },
          {
            text: "Keeps the user's progress and shows a clear error message when an upload fails.",
            competencyKey: "product-thinking.solution-design",
            keywords: ["save progress", "error message", "don't clear", "retry", "حفظ التقدم", "رسالة خطأ", "إعادة المحاولة"],
          },
          {
            text: "Defines a measure and a test, such as mobile completion of step 3 in a controlled test.",
            competencyKey: "product-thinking.solution-design",
            keywords: ["completion rate", "a/b", "test", "measure", "معدل الإكمال", "اختبار", "قياس"],
          },
        ],
        redFlags: [
          {
            text: "Proposes a full redesign without diagnosing the cause.",
            competencyKey: "product-thinking.problem-framing",
            keywords: ["redesign the whole", "new look", "إعادة تصميم كاملة", "شكل جديد"],
          },
          {
            text: "Blames users for not completing the step.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["users are lazy", "users don't read", "المستخدمون كسالى", "لا يقرؤون"],
          },
          {
            text: "Treats it as a visual layout problem only.",
            competencyKey: "critical-thinking.root-cause-analysis",
            keywords: ["button colour", "button color", "layout", "لون الزر", "تخطيط الصفحة"],
          },
        ],
        embeddedDetail: {
          description:
            "{{specialist}}'s footnote says the upload limit is 2 MB while most phone photos are 3 to 6 MB, which explains why mobile completion is 25% against 82% on desktop.",
          location: "footnote of {{specialist}}'s email",
          keywords: ["2 mb", "3 to 6 mb", "upload limit", "phone photos", "2 ميغابايت", "حد الرفع", "صور الهواتف"],
        },
        probeTargets: ["critical-thinking.root-cause-analysis"],
        twistTargets: ["product-thinking.solution-design"],
      },
    },
  },
  // ───────────────────────────── ds-02 ─────────────────────────────
  {
    id: "ds-02-internal-tool-adoption",
    type: "DESIGN_CHALLENGE",
    difficulty: 4,
    dials: { ambiguity: 4, stakeholders: 5, conflictingConstraints: 3, stakes: 3, timePressure: 3, informationGaps: 3 },
    targets: ["product-thinking.user-empathy", "leadership.influence-without-authority", "collaboration.stakeholder-management"],
    roleFamilies: [],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "The tool nobody uses",
        scenario:
          "Three months ago {{company}} launched a new purchase-request tool to replace requests by email. Only 31% of requests now go through it; the rest are still emailed to {{specialist}} in Finance, who enters them by hand. {{exec}} has asked you to raise tool use to 80% within 2 months. You do not manage any of the departments involved. Adoption figures and survey comments are attached.",
        materials: [
          {
            kind: "table",
            id: "adoption",
            title: "Purchase requests last month, by department",
            columns: [
              { key: "dept", label: "Department" },
              { key: "requests", label: "Requests", numeric: true },
              { key: "tool", label: "Through the tool", numeric: true },
              { key: "share", label: "Share" },
            ],
            rows: [
              { dept: "Finance", requests: 40, tool: 36, share: "90%" },
              { dept: "Operations", requests: 220, tool: 77, share: "35%" },
              { dept: "Sales", requests: 180, tool: 18, share: "10%" },
              { dept: "Marketing", requests: 60, tool: 24, share: "40%" },
              { dept: "Total", requests: 500, tool: 155, share: "31%" },
            ],
          },
          {
            kind: "memo",
            id: "survey",
            title: "Survey comments (selection from 120 responses)",
            author: { name: "Internal survey team" },
            body:
              "'I'm on the road most days. The tool doesn't work properly on my phone.' (Sales)\n\n'I have to fill in 14 fields for a small order.' (Operations)\n\n'I don't know who approves my request or where it is.' (Marketing)\n\n'Emailing is just easier.' (Sales)\n\nNote from the survey team: emailed requests are processed by {{specialist}} within about 1 hour; requests in the tool wait an average of 3 days for approval.",
          },
        ],
        task: {
          kind: "design",
          prompt: "Design your plan to raise use of the tool. Complete each section.",
          design: {
            sections: [
              { id: "causes", label: "Why people are not using it", hint: "The main reasons, by group, based on the evidence." },
              { id: "changes", label: "What you would change", hint: "Changes to the tool, the process or both, and why." },
              { id: "people", label: "Who you need on board, and how", hint: "Whose support you need, what each cares about, and how you will win it." },
              { id: "first-steps", label: "The first 2 weeks", hint: "What you will do first and how you will know it is working." },
            ],
          },
        },
        probe: { prompt: "Which group would you start with, and why?" },
        twist: {
          change: "The Sales director tells you the team will not change anything during the quarter-end sales push, which lasts the next 4 weeks.",
          prompt: "How do you adapt your plan?",
        },
      },
      ar: {
        title: "الأداة التي لا يستخدمها أحد",
        scenario:
          "قبل ثلاثة أشهر أطلقت {{company}} أداة جديدة لطلبات الشراء بديلًا عن الطلبات عبر البريد الإلكتروني. لا يمرّ عبر الأداة اليوم سوى 31% من الطلبات، أما البقية فما زالت تُرسل بالبريد إلى {{specialist}} في الإدارة المالية لإدخالها يدويًا. طلب منك {{exec}} رفع استخدام الأداة إلى 80% في غضون شهرين، ولا تدير أيًّا من الإدارات المعنية. مرفق أرقام الاستخدام وتعليقات الاستبيان.",
        materials: [
          {
            kind: "table",
            id: "adoption",
            title: "طلبات الشراء في الشهر الماضي بحسب الإدارة",
            columns: [
              { key: "dept", label: "الإدارة" },
              { key: "requests", label: "الطلبات", numeric: true },
              { key: "tool", label: "عبر الأداة", numeric: true },
              { key: "share", label: "النسبة" },
            ],
            rows: [
              { dept: "المالية", requests: 40, tool: 36, share: "90%" },
              { dept: "العمليات", requests: 220, tool: 77, share: "35%" },
              { dept: "المبيعات", requests: 180, tool: 18, share: "10%" },
              { dept: "التسويق", requests: 60, tool: 24, share: "40%" },
              { dept: "الإجمالي", requests: 500, tool: 155, share: "31%" },
            ],
          },
          {
            kind: "memo",
            id: "survey",
            title: "تعليقات الاستبيان (مختارات من 120 إجابة)",
            author: { name: "فريق الاستبيان الداخلي" },
            body:
              "«أتنقّل معظم أيام الأسبوع، والأداة لا تعمل جيدًا على هاتفي.» (المبيعات)\n\n«عليّ ملء 14 حقلًا لطلب صغير.» (العمليات)\n\n«لا أعرف من يعتمد طلبي ولا أين وصل.» (التسويق)\n\n«البريد الإلكتروني أسهل ببساطة.» (المبيعات)\n\nملاحظة من فريق الاستبيان: يعالج {{specialist}} الطلبات الواردة بالبريد في غضون ساعة تقريبًا، أما الطلبات المقدّمة عبر الأداة فتنتظر الاعتماد 3 أيام في المتوسط.",
          },
        ],
        task: {
          kind: "design",
          prompt: "صمّم خطتك لرفع استخدام الأداة، واملأ كل قسم.",
          design: {
            sections: [
              { id: "causes", label: "لماذا لا يستخدمها الناس", hint: "الأسباب الرئيسية بحسب كل فئة، استنادًا إلى الأدلة." },
              { id: "changes", label: "ما الذي ستغيّره", hint: "تغييرات في الأداة أو الإجراءات أو كليهما، ولماذا." },
              { id: "people", label: "من تحتاج إلى دعمه، وكيف تكسبه", hint: "من تحتاج إلى دعمهم، وما يهمّ كلًّا منهم، وكيف ستكسب تأييده." },
              { id: "first-steps", label: "الأسبوعان الأولان", hint: "ما الذي ستبدأ به، وكيف ستعرف أنه يحقق النتيجة." },
            ],
          },
        },
        probe: { prompt: "بأي فئة ستبدأ، ولماذا؟" },
        twist: {
          change: "أبلغك مدير المبيعات أن فريقه لن يغيّر شيئًا في أثناء حملة المبيعات في نهاية الربع، وهي تستمر الأسابيع الأربعة القادمة.",
          prompt: "كيف تعدّل خطتك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "product-thinking.user-empathy",
            anchors: [
              "Assumes people avoid the tool out of resistance and proposes only mandates or training.",
              "Mentions user needs in general terms, such as making it easier, without group-specific context.",
              "Describes each group's situation concretely, such as Sales on phones and Operations' long form, and uses it to shape changes.",
              "Recognises that groups need different things and proposes checking assumptions with real users from each.",
              "Sees from the users' side that email is faster, 1 hour against 3 days, and treats approval speed as the real need.",
            ],
          },
          {
            competencyKey: "leadership.influence-without-authority",
            anchors: [
              "Relies on {{exec}} to order departments to comply, or on rules alone.",
              "Plans to persuade with general benefits of the tool rather than what each department gains.",
              "Builds support by showing each department what it gains, such as faster approvals, and finds allies.",
              "Uses early adopters such as Finance and a respected champion in each department to spread use without formal authority.",
              "Makes the tool the easiest choice, so departments adopt it because it serves them rather than because they are told to.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Considers only {{exec}}'s target and overlooks {{specialist}}, approvers and department heads.",
              "Names the departments but treats them as having the same needs.",
              "Identifies key stakeholders, including approvers and {{specialist}}, what each cares about, and how to involve each.",
              "Anticipates conflicts, such as {{specialist}}'s role changing or approvers' workload, and manages them early.",
              "Spots less obvious stakeholders, such as the approvers behind the 3-day wait, and builds support with them first.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices emailed requests are handled in about 1 hour while tool requests wait 3 days for approval.",
            competencyKey: "product-thinking.user-empathy",
            keywords: ["1 hour", "3 days", "approval", "faster by email", "ساعة", "3 أيام", "الاعتماد", "أسرع"],
          },
          {
            text: "Addresses the Sales team's mobile problem.",
            competencyKey: "product-thinking.user-empathy",
            keywords: ["mobile", "phone", "on the road", "الجوال", "الهاتف", "التنقل"],
          },
          {
            text: "Involves {{specialist}} and the approvers, not only department heads.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["approvers", "finance", "who enters the requests", "المعتمدين", "المالية", "إدخال الطلبات"],
          },
          {
            text: "Uses champions or early adopters to influence peers.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["champion", "early adopters", "finance team", "سفير", "المتبنين الأوائل", "فريق المالية"],
          },
        ],
        redFlags: [
          {
            text: "Mandates use, such as rejecting all emailed requests from day one.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["mandatory", "reject emails", "force", "إلزامي", "رفض الرسائل", "إجبار"],
          },
          {
            text: "Proposes training as the only fix.",
            competencyKey: "product-thinking.user-empathy",
            keywords: ["more training", "training sessions", "تدريب إضافي", "دورات تدريبية"],
          },
          {
            text: "Relies on an order from senior management as the main lever.",
            competencyKey: "leadership.influence-without-authority",
            keywords: ["order from the top", "management must enforce", "أمر من الإدارة العليا", "فرض من الإدارة"],
          },
        ],
        embeddedDetail: {
          description:
            "The survey team's note shows emailed requests are processed by {{specialist}} in about 1 hour while tool requests wait 3 days for approval, so the old route is faster than the tool.",
          location: "last paragraph of the survey comments memo",
          keywords: ["1 hour", "3 days", "approval", "workaround", "ساعة", "3 أيام", "الاعتماد"],
        },
        probeTargets: ["collaboration.stakeholder-management"],
        twistTargets: ["leadership.influence-without-authority"],
      },
    },
  },
  // ───────────────────────────── ds-03 ─────────────────────────────
  {
    id: "ds-03-repair-service-process",
    type: "DESIGN_CHALLENGE",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 2 },
    targets: ["product-thinking.idea-generation", "product-thinking.solution-design", "judgment.second-order-thinking"],
    roleFamilies: [],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "Nine days for a repair",
        scenario:
          "{{company}} repairs equipment for business customers. A repair now takes 9 working days on average, and customers call an average of 2.4 times to ask about progress. Complaints about repairs doubled this year. {{manager}} has asked you to redesign the repair process with the current team of 5 technicians. The current process map and a complaints chart are attached.",
        materials: [
          {
            kind: "table",
            id: "process",
            title: "Current repair process (average working days)",
            caption: "Parts approvals are reviewed only at the team lead's weekly meeting on Tuesdays; 70% of approved parts cost less than 200.",
            columns: [
              { key: "step", label: "Step" },
              { key: "owner", label: "Owner" },
              { key: "work", label: "Work time", numeric: true },
              { key: "wait", label: "Waiting time", numeric: true },
            ],
            rows: [
              { step: "Request logged", owner: "Service desk", work: 0.2, wait: 0.5 },
              { step: "Diagnosis", owner: "Technician", work: 0.5, wait: 1.5 },
              { step: "Parts approval", owner: "Team lead", work: 0.1, wait: 3.0 },
              { step: "Parts ordered and received", owner: "Purchasing", work: 0.2, wait: 1.5 },
              { step: "Repair", owner: "Technician", work: 0.5, wait: 0.3 },
              { step: "Return to customer", owner: "Logistics", work: 0.2, wait: 0.5 },
            ],
          },
          {
            kind: "chart",
            id: "complaints",
            title: "Repair complaints by reason, this year",
            chartType: "bar",
            xKey: "reason",
            unit: "complaints",
            series: [{ key: "count", label: "Complaints" }],
            data: [
              { reason: "No update on progress", count: 140 },
              { reason: "Repair took too long", count: 95 },
              { reason: "Fault not fixed first time", count: 40 },
              { reason: "Staff manner", count: 10 },
            ],
          },
        ],
        task: {
          kind: "design",
          prompt: "Redesign the repair process. Complete each section.",
          design: {
            sections: [
              { id: "experience", label: "What customers experience today", hint: "Walk through the process from the customer's side: what they see, wait for and worry about." },
              { id: "ideas", label: "Ideas", hint: "At least 3 genuinely different ideas, with a line on each." },
              { id: "redesign", label: "Your redesigned process", hint: "The new steps, owners and expected times, and why this design." },
              { id: "risks", label: "Risks and how you would test it", hint: "What could go wrong, including knock-on effects, and how you would try it first." },
            ],
          },
        },
        probe: { prompt: "Which idea did you reject, and why?" },
        twist: {
          change: "The team will lose 1 of its 5 technicians next month, with no replacement.",
          prompt: "What changes in your design?",
        },
      },
      ar: {
        title: "تسعة أيام للإصلاح",
        scenario:
          "تصلح {{company}} معدات عملائها من الشركات. يستغرق الإصلاح الآن 9 أيام عمل في المتوسط، ويتصل العملاء 2.4 مرة في المتوسط للسؤال عن سير العمل. تضاعفت الشكاوى المتعلقة بالإصلاح هذا العام. طلب منك {{manager}} إعادة تصميم عملية الإصلاح بالفريق الحالي المكوّن من 5 فنيين. مرفق خريطة العملية الحالية ورسم بياني للشكاوى.",
        materials: [
          {
            kind: "table",
            id: "process",
            title: "عملية الإصلاح الحالية (متوسط أيام العمل)",
            caption: "لا تُراجع طلبات اعتماد قطع الغيار إلا في الاجتماع الأسبوعي لقائد الفريق يوم الثلاثاء، و70% من القطع المعتمدة تقل تكلفتها عن 200.",
            columns: [
              { key: "step", label: "الخطوة" },
              { key: "owner", label: "المسؤول" },
              { key: "work", label: "وقت العمل", numeric: true },
              { key: "wait", label: "وقت الانتظار", numeric: true },
            ],
            rows: [
              { step: "تسجيل الطلب", owner: "مكتب الخدمة", work: 0.2, wait: 0.5 },
              { step: "التشخيص", owner: "الفني", work: 0.5, wait: 1.5 },
              { step: "اعتماد قطع الغيار", owner: "قائد الفريق", work: 0.1, wait: 3.0 },
              { step: "طلب القطع واستلامها", owner: "المشتريات", work: 0.2, wait: 1.5 },
              { step: "الإصلاح", owner: "الفني", work: 0.5, wait: 0.3 },
              { step: "إعادة المعدة إلى العميل", owner: "الخدمات اللوجستية", work: 0.2, wait: 0.5 },
            ],
          },
          {
            kind: "chart",
            id: "complaints",
            title: "شكاوى الإصلاح بحسب السبب، هذا العام",
            chartType: "bar",
            xKey: "reason",
            unit: "شكوى",
            series: [{ key: "count", label: "الشكاوى" }],
            data: [
              { reason: "لا تحديث عن سير العمل", count: 140 },
              { reason: "استغرق الإصلاح وقتًا طويلًا", count: 95 },
              { reason: "لم يُصلَح العطل من المرة الأولى", count: 40 },
              { reason: "أسلوب الموظفين", count: 10 },
            ],
          },
        ],
        task: {
          kind: "design",
          prompt: "أعد تصميم عملية الإصلاح، واملأ كل قسم.",
          design: {
            sections: [
              { id: "experience", label: "ما يمرّ به العملاء اليوم", hint: "تتبّع العملية من جانب العميل: ما يراه، وما ينتظره، وما يقلقه." },
              { id: "ideas", label: "الأفكار", hint: "3 أفكار مختلفة اختلافًا حقيقيًا على الأقل، مع سطر عن كل منها." },
              { id: "redesign", label: "العملية بعد إعادة التصميم", hint: "الخطوات الجديدة والمسؤولون والأوقات المتوقعة، وسبب اختيار هذا التصميم." },
              { id: "risks", label: "المخاطر وطريقة الاختبار", hint: "ما الذي قد يسوء، بما في ذلك الآثار غير المباشرة، وكيف ستجرّب التصميم أولًا." },
            ],
          },
        },
        probe: { prompt: "ما الفكرة التي استبعدتها، ولماذا؟" },
        twist: {
          change: "سيفقد الفريق الشهر القادم 1 من فنييه الخمسة، دون بديل.",
          prompt: "ما الذي يتغيّر في تصميمك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "product-thinking.idea-generation",
            anchors: [
              "Offers one obvious idea, such as hiring more technicians, without alternatives.",
              "Offers several ideas that are variations of one approach, such as different ways to repair faster.",
              "Proposes at least 3 genuinely different ideas, such as an approval limit, progress updates and parts stock, and says why one is preferred.",
              "Varies key assumptions, such as who approves, when customers are told and where parts are held, and combines the best elements.",
              "Proposes an original, practical idea, such as customers tracking repairs themselves, and shows how to test it cheaply.",
            ],
          },
          {
            competencyKey: "product-thinking.solution-design",
            anchors: [
              "Designs a process that ignores the team size or adds steps that slow repairs.",
              "Describes a workable process focused on internal steps, not on what customers experience.",
              "Redesigns the process to cut waiting, with owners and times, and describes how customers are kept informed.",
              "Simplifies to the essential changes, considers failure points such as urgent parts, and proposes a small trial first.",
              "Prefers simple changes, such as an approval limit and automatic updates, over complex systems, and designs them to learn from real use.",
            ],
          },
          {
            competencyKey: "judgment.second-order-thinking",
            anchors: [
              "Considers only the immediate effect of each change.",
              "Notes one knock-on effect but does not adjust the design for it.",
              "Identifies knock-on effects, such as more parts spending without weekly review, and adds a safeguard.",
              "Traces effects across the team, such as faster diagnosis creating a queue at repair, and plans for them.",
              "Anticipates longer-term effects, such as fewer progress calls freeing the service desk, and uses them in the case for change.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots the weekly Tuesday approval meeting as the main wait and proposes an approval limit for low-cost parts.",
            competencyKey: "product-thinking.idea-generation",
            keywords: ["approval limit", "weekly meeting", "tuesday", "under 200", "حد الاعتماد", "الاجتماع الأسبوعي", "الثلاثاء", "أقل من 200"],
          },
          {
            text: "Addresses the top complaint, no update on progress, with proactive updates.",
            competencyKey: "product-thinking.solution-design",
            keywords: ["update", "notify", "status", "tracking", "تحديث", "إشعار", "حالة الطلب", "تتبع"],
          },
          {
            text: "Sees that most of the 9 days is waiting, not work.",
            competencyKey: "product-thinking.solution-design",
            keywords: ["waiting", "wait time", "1.7", "7.3", "الانتظار", "وقت الانتظار"],
          },
          {
            text: "Adds safeguards for knock-on effects, such as a monthly spend review.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["safeguard", "monthly review", "spend", "ضمانة", "مراجعة شهرية", "الإنفاق"],
          },
        ],
        redFlags: [
          {
            text: "Proposes hiring more technicians as the main fix.",
            competencyKey: "product-thinking.idea-generation",
            keywords: ["hire more", "more technicians", "توظيف المزيد", "فنيين إضافيين"],
          },
          {
            text: "Focuses on repair speed, although repair work is only 0.5 days.",
            competencyKey: "product-thinking.solution-design",
            keywords: ["faster repairs", "work faster", "إصلاح أسرع", "العمل بسرعة أكبر"],
          },
          {
            text: "Removes approval entirely with no control.",
            competencyKey: "judgment.second-order-thinking",
            keywords: ["remove approval", "no approval", "إلغاء الاعتماد", "دون اعتماد"],
          },
        ],
        embeddedDetail: {
          description:
            "The caption says parts approvals are reviewed only at a weekly Tuesday meeting and 70% of approved parts cost under 200, which explains the 3-day wait at the approval step.",
          location: "caption of the current process table",
          keywords: ["weekly", "tuesday", "under 200", "70%", "أسبوعي", "الثلاثاء", "أقل من 200"],
        },
        probeTargets: ["product-thinking.idea-generation"],
        twistTargets: ["product-thinking.solution-design", "judgment.second-order-thinking"],
      },
    },
  },
  // ───────────────────────────── ds-04 ─────────────────────────────
  {
    id: "ds-04-new-customer-onboarding",
    type: "DESIGN_CHALLENGE",
    difficulty: 4,
    dials: { ambiguity: 4, stakeholders: 3, conflictingConstraints: 4, stakes: 3, timePressure: 2, informationGaps: 4 },
    targets: ["product-thinking.feature-prioritisation", "product-thinking.user-empathy"],
    roleFamilies: [],
    minutes: 7,
    storyPhase: "late",
    content: {
      en: {
        title: "The first 30 days",
        scenario:
          "{{company}} sells scheduling software to small and medium businesses. 40% of new customers never finish setting it up, and most of those cancel within 3 months. You lead the redesign of the first 30 days for new customers. This quarter the team has about 8 build-weeks, enough for 3 of the 8 proposed improvements. Retention data and the list of proposals are attached.",
        materials: [
          {
            kind: "table",
            id: "retention",
            title: "Customers retained after 6 months, by setup progress in week 1",
            columns: [
              { key: "group", label: "Group" },
              { key: "customers", label: "Customers", numeric: true },
              { key: "retained", label: "Retained after 6 months" },
            ],
            rows: [
              { group: "Connected their calendars in the first 7 days", customers: 1200, retained: "85%" },
              { group: "Did not connect in the first 7 days", customers: 1800, retained: "40%" },
            ],
          },
          {
            kind: "table",
            id: "proposals",
            title: "Proposed improvements",
            caption: "Proposal F: both requesting prospects have more than 500 staff; current customers average 25 staff.",
            columns: [
              { key: "id", label: "ID" },
              { key: "idea", label: "Improvement" },
              { key: "weeks", label: "Build-weeks", numeric: true },
              { key: "from", label: "Requested by" },
              { key: "evidence", label: "Evidence" },
            ],
            rows: [
              { id: "A", idea: "Setup checklist with progress bar", weeks: 2, from: "Product", evidence: "In interviews, new users could not tell what to do next" },
              { id: "B", idea: "Guided, step-by-step calendar connection", weeks: 3, from: "Support", evidence: "35% of setup tickets are about connecting calendars" },
              { id: "C", idea: "Custom reporting dashboard", weeks: 6, from: "Sales", evidence: "Asked for by prospects in sales calls" },
              { id: "D", idea: "Welcome emails on days 1, 3 and 7", weeks: 1, from: "Marketing", evidence: "Common practice in the industry" },
              { id: "E", idea: "Live onboarding call for every new customer", weeks: 1, from: "Customer success", evidence: "Customers who had calls stayed longer (30 customers); needs 2 extra staff" },
              { id: "F", idea: "Integration with payroll software", weeks: 8, from: "Sales", evidence: "Requested by 2 large prospects" },
              { id: "G", idea: "Setup through the mobile app", weeks: 5, from: "Product", evidence: "20% of sign-ups start on mobile" },
              { id: "H", idea: "In-app chat help during setup", weeks: 3, from: "Support", evidence: "Chat users resolve issues faster" },
            ],
          },
        ],
        task: {
          kind: "design",
          prompt: "Design the first 30 days for new customers. Complete each section.",
          design: {
            sections: [
              { id: "customer", label: "The new customer", hint: "Who they are, what they are trying to do in the first 30 days, and where they get stuck." },
              { id: "journey", label: "Your onboarding design", hint: "What the first 30 days look like for the customer, step by step." },
              { id: "priorities", label: "What you build first", hint: "Pick 3 of the 8 proposals (A to H) within about 8 build-weeks; say what you defer and why." },
              { id: "measure", label: "How you will measure success", hint: "The measures you will track, and what result would change your plan." },
            ],
          },
        },
        probe: { prompt: "Sales argues that F must be in your top 3. Write what you tell them." },
        twist: {
          change: "Half of next quarter's new customers will be very small businesses with no IT staff (today: 10%).",
          prompt: "What do you change in your design and priorities?",
        },
      },
      ar: {
        title: "الأيام الثلاثون الأولى",
        scenario:
          "تبيع {{company}} برنامجًا للجدولة للشركات الصغيرة والمتوسطة. لا يُكمل 40% من العملاء الجدد إعداد البرنامج، ويلغي معظم هؤلاء اشتراكهم في غضون 3 أشهر. تقود إعادة تصميم الأيام الثلاثين الأولى للعملاء الجدد. لدى الفريق هذا الربع نحو 8 أسابيع تطوير، تكفي لتنفيذ 3 من 8 تحسينات مقترحة. مرفق بيانات الاحتفاظ بالعملاء وقائمة المقترحات.",
        materials: [
          {
            kind: "table",
            id: "retention",
            title: "العملاء المستمرون بعد 6 أشهر بحسب تقدّم الإعداد في الأسبوع الأول",
            columns: [
              { key: "group", label: "الفئة" },
              { key: "customers", label: "العملاء", numeric: true },
              { key: "retained", label: "المستمرون بعد 6 أشهر" },
            ],
            rows: [
              { group: "ربطوا تقاويمهم في الأيام السبعة الأولى", customers: 1200, retained: "85%" },
              { group: "لم يربطوا تقاويمهم في الأيام السبعة الأولى", customers: 1800, retained: "40%" },
            ],
          },
          {
            kind: "table",
            id: "proposals",
            title: "التحسينات المقترحة",
            caption: "المقترح F: لدى كلٍّ من العميلين المحتملين اللذين طلباه أكثر من 500 موظف، بينما يبلغ متوسط عدد الموظفين لدى العملاء الحاليين 25 موظفًا.",
            columns: [
              { key: "id", label: "الرمز" },
              { key: "idea", label: "التحسين" },
              { key: "weeks", label: "أسابيع التطوير", numeric: true },
              { key: "from", label: "الجهة الطالبة" },
              { key: "evidence", label: "الدليل" },
            ],
            rows: [
              { id: "A", idea: "قائمة مهام للإعداد مع شريط تقدّم", weeks: 2, from: "المنتج", evidence: "في المقابلات لم يعرف المستخدمون الجدد خطوتهم التالية" },
              { id: "B", idea: "ربط التقويم بإرشاد خطوة بخطوة", weeks: 3, from: "الدعم", evidence: "35% من تذاكر الإعداد تتعلق بربط التقاويم" },
              { id: "C", idea: "لوحة تقارير مخصّصة", weeks: 6, from: "المبيعات", evidence: "طلبها عملاء محتملون في مكالمات المبيعات" },
              { id: "D", idea: "رسائل ترحيب في الأيام 1 و3 و7", weeks: 1, from: "التسويق", evidence: "ممارسة شائعة في القطاع" },
              { id: "E", idea: "مكالمة تعريفية مباشرة لكل عميل جديد", weeks: 1, from: "نجاح العملاء", evidence: "استمر العملاء الذين تلقّوا مكالمات مدة أطول (30 عميلًا)؛ تحتاج إلى موظفَين إضافيين" },
              { id: "F", idea: "التكامل مع برامج الرواتب", weeks: 8, from: "المبيعات", evidence: "طلبه عميلان محتملان كبيران" },
              { id: "G", idea: "الإعداد عبر تطبيق الجوال", weeks: 5, from: "المنتج", evidence: "20% من عمليات التسجيل تبدأ من الجوال" },
              { id: "H", idea: "مساعدة عبر المحادثة داخل التطبيق في أثناء الإعداد", weeks: 3, from: "الدعم", evidence: "مستخدمو المحادثة يحلّون مشكلاتهم أسرع" },
            ],
          },
        ],
        task: {
          kind: "design",
          prompt: "صمّم الأيام الثلاثين الأولى للعملاء الجدد، واملأ كل قسم.",
          design: {
            sections: [
              { id: "customer", label: "العميل الجديد", hint: "من هو، وما الذي يسعى إلى إنجازه في الأيام الثلاثين الأولى، وأين يتعثّر." },
              { id: "journey", label: "تصميمك لتجربة البداية", hint: "كيف تبدو الأيام الثلاثون الأولى للعميل خطوة بخطوة." },
              { id: "priorities", label: "ما الذي تبنيه أولًا", hint: "اختر 3 من المقترحات الثمانية (من A إلى H) في حدود 8 أسابيع تطوير تقريبًا، ووضّح ما تؤجّله ولماذا." },
              { id: "measure", label: "كيف ستقيس النجاح", hint: "المقاييس التي ستتابعها، وأي نتيجة ستغيّر خطتك." },
            ],
          },
        },
        probe: { prompt: "يصرّ فريق المبيعات على أن يكون المقترح F ضمن خياراتك الثلاثة الأولى. اكتب ما ستقوله لهم." },
        twist: {
          change: "سيكون نصف العملاء الجدد في الربع القادم شركات صغيرة جدًا لا تضم أي موظفين متخصصين في تقنية المعلومات (النسبة اليوم: 10%).",
          prompt: "ما الذي تغيّره في تصميمك وأولوياتك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "product-thinking.feature-prioritisation",
            anchors: [
              "Picks by who asked loudest or by interest, such as the payroll integration, without reference to value.",
              "Considers value or effort but not both, or exceeds the 8 build-weeks.",
              "Picks 3 items by value against effort within capacity, such as A, B and D, and explains what is deferred.",
              "Uses evidence, such as calendar connection linked to retention and 35% of tickets, and notes dependencies or costs that change the order.",
              "Cuts to what proves the core value fastest and notes the retention link may not be causal, planning to test it.",
            ],
          },
          {
            competencyKey: "product-thinking.user-empathy",
            anchors: [
              "Describes the customer only in terms of features the team wants to build.",
              "Mentions customer needs in general terms, without the context of a small business owner setting up alone.",
              "Describes the new customer's goal, situation and main frustration concretely, such as not knowing the next step, and uses them.",
              "Distinguishes customer types, such as those with and without IT help, and proposes checking assumptions with real customers.",
              "Infers an unspoken need from behaviour, such as fear of disrupting existing calendars, and explains how to validate it.",
            ],
          },
          {
            competencyKey: "communication.persuasion",
            anchors: [
              "Simply refuses Sales, or agrees to include F to avoid conflict.",
              "Gives reasons from the product team's side only, ignoring what Sales cares about.",
              "Explains with evidence why F is deferred, such as 8 weeks for 2 atypical prospects, and addresses Sales' main concern.",
              "Builds the case around Sales' goals, such as fewer early cancellations, admits the cost of deferring, and proposes a next step.",
              "Uncovers Sales' real concern, such as a promise made to a prospect, and offers an option that meets it without derailing onboarding.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Defers F, noting both requesting prospects have more than 500 staff while customers average 25.",
            competencyKey: "product-thinking.feature-prioritisation",
            keywords: ["500", "2 prospects", "average 25", "not our typical", "500 موظف", "عميلان محتملان", "متوسط 25", "تأجيل"],
          },
          {
            text: "Prioritises calendar connection, which is linked to retention.",
            competencyKey: "product-thinking.feature-prioritisation",
            keywords: ["calendar", "connect", "85%", "35%", "ربط التقويم", "التقويم"],
          },
          {
            text: "Stays within about 8 build-weeks.",
            competencyKey: "product-thinking.feature-prioritisation",
            keywords: ["8 weeks", "build-weeks", "capacity", "8 أسابيع", "الطاقة"],
          },
          {
            text: "Describes a busy small business owner setting up alone, without IT help.",
            competencyKey: "product-thinking.user-empathy",
            keywords: ["owner", "no it", "alone", "busy", "صاحب العمل", "دون تقنية معلومات", "بمفرده", "منشغل"],
          },
        ],
        redFlags: [
          {
            text: "Includes F because Sales asked for it.",
            competencyKey: "product-thinking.feature-prioritisation",
            keywords: ["sales asked", "big deals", "payroll integration first", "طلب المبيعات", "صفقات كبيرة"],
          },
          {
            text: "Picks more than 3 items or exceeds capacity.",
            competencyKey: "product-thinking.feature-prioritisation",
            keywords: ["all of them", "everything", "جميعها", "كلها"],
          },
          {
            text: "Treats the retention link as proof that calendar connection causes retention.",
            competencyKey: "product-thinking.feature-prioritisation",
            keywords: ["proves", "guarantees retention", "يثبت", "يضمن الاستمرار"],
          },
          {
            text: "Describes users only by the features they could get.",
            competencyKey: "product-thinking.user-empathy",
            keywords: ["more features", "add features", "المزيد من الميزات"],
          },
        ],
        embeddedDetail: {
          description:
            "The caption shows that proposal F's 2 requesting prospects each have more than 500 staff, while current customers average 25 staff, so F serves a segment outside the target market.",
          location: "caption of the proposed improvements table",
          keywords: ["500", "2 prospects", "average 25", "500 موظف", "متوسط", "25 موظفًا"],
        },
        probeTargets: ["communication.persuasion"],
        twistTargets: ["product-thinking.user-empathy"],
      },
    },
  },
];
