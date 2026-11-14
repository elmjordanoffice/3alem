import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  {
    id: "inbox-01-before-the-workshop",
    type: "INBOX",
    difficulty: 3,
    dials: { ambiguity: 2, stakeholders: 4, conflictingConstraints: 3, stakes: 3, timePressure: 5, informationGaps: 2 },
    targets: ["management.planning-prioritisation", "communication.written-communication", "adaptability.composure-under-pressure"],
    roleFamilies: [],
    minutes: 15,
    storyPhase: "early",
    content: {
      en: {
        title: "Fifteen minutes before the workshop",
        scenario:
          "You lead a 6-person customer operations team at {{company}}. It is 08:40 on Tuesday. At 08:55 you leave for an all-day workshop with {{exec}} where phones are not allowed, and you will be back at your desk at 17:00. Your team works normally today. {{report1}}, your most experienced team member, is in the office and can take on work. 8 messages are waiting. Some are urgent and some are not, and you cannot do everything yourself in 15 minutes.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "Triage all 8 messages. Put them in the order you will deal with them and, for each one, write one line: what you will do (act now, hand to someone, defer or no action) and by when. Then write full replies to the 2 messages you judge most important.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "m1",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "Board pack: service results",
                receivedAt: "Tue 07:58",
                body: "Morning. I need 3 bullet points on last month's service results for the board pack: what improved, what got worse, and what we are doing about it. The pack closes at 12:00 today. The figures are in the monthly dashboard.",
              },
              {
                id: "m2",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "I think I made a mistake",
                receivedAt: "Tue 08:21",
                body: "Yesterday at 17:30 I sent the new price list to a customer mailing list. I have just realised it was the list with all 214 customers, not the 12 trial customers. The new prices are not public until the 1st of next month, and some customers will see lower prices than they pay now. I haven't told anyone else yet. I'm really sorry. What should I do?",
              },
              {
                id: "m3",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "Re: Delivery confirmation, order 4471",
                receivedAt: "Mon 18:05",
                body: "Thank you for confirming that the 40 units on order 4471 will arrive on Wednesday morning. Our receiving team will be ready.",
                footnote: "Reminder: from this week all deliveries go to our new site, Building 7, North Industrial Zone. The Old Port Warehouse closed on Friday.",
              },
              {
                id: "m4",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "Quote needed for a new prospect",
                receivedAt: "Mon 16:40",
                body: "We have a strong lead for a contract worth about 3 times our biggest current account. Could your team prepare a service quote by Thursday at 12:00? I will send the requirements later today.",
              },
              {
                id: "m5",
                from: { name: "IT Service Desk" },
                subject: "Planned maintenance on Saturday",
                receivedAt: "Mon 15:00",
                body: "The order system will be unavailable on Saturday from 22:00 to 02:00. No action is needed.",
              },
              {
                id: "m6",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "Reminder: dispatch file closes at 11:00",
                receivedAt: "Tue 07:30",
                body: "The dispatch file for Wednesday's deliveries closes at 11:00 today. After that, delivery addresses cannot be changed; any change needs a new booking with at least 48 hours' delay. Wednesday's list: order 4471, 40 units, Old Port Warehouse; order 4480, 15 units, Central Store; order 4485, 60 units, East Depot.",
              },
              {
                id: "m7",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "Can we talk this week?",
                receivedAt: "Mon 19:10",
                body: "I've been invited to join the new automation project 2 days a week for 3 months. I would really like to do it, but I know it affects the team. Could we talk before Friday? They want an answer by Monday.",
              },
              {
                id: "m8",
                from: { name: "HR team" },
                subject: "Mid-year reviews due Friday",
                receivedAt: "Tue 08:02",
                body: "A reminder that mid-year reviews for your team are due this Friday. You have completed 2 of 6.",
              },
            ],
          },
        },
        probe: { prompt: "Which message did you deal with first, and why that one rather than the next most urgent?" },
        twist: {
          change: "As you finish triaging, {{report1}} messages you: 'Sorry, I'm ill today and won't be able to answer messages.' Your workshop still starts at 08:55.",
          prompt: "What changes in your plan? Say what now happens to each task you had given to {{report1}}.",
        },
        timeLimitSeconds: 900,
      },
      ar: {
        title: "خمس عشرة دقيقة قبل ورشة العمل",
        scenario:
          "تقود فريق عمليات العملاء في {{company}}، ويضم الفريق 6 أشخاص. الساعة الآن 08:40 من يوم الثلاثاء. في الساعة 08:55 تغادر إلى ورشة عمل تستمر طوال اليوم مع {{exec}} ولا يُسمح فيها باستخدام الهواتف، ولن تعود إلى مكتبك قبل الساعة 17:00. يعمل فريقك اليوم كالمعتاد، و{{report1}}، أكثر أعضاء الفريق خبرة، موجود في المكتب ويمكنه تولّي بعض المهام. تنتظرك 8 رسائل، بعضها عاجل وبعضها ليس كذلك، ولا يمكنك إنجاز كل شيء بنفسك في 15 دقيقة.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "افرز الرسائل الثماني كلها: رتّبها بحسب تسلسل تعاملك معها، واكتب لكل رسالة سطرًا واحدًا يبيّن ما ستفعله (تتصرّف الآن، أو تكلّف بها شخصًا، أو تؤجّلها، أو لا إجراء) وموعد ذلك. ثم اكتب ردًّا كاملًا على الرسالتين اللتين تراهما الأهم.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "m1",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "ملف مجلس الإدارة: نتائج الخدمة",
                receivedAt: "الثلاثاء 07:58",
                body: "صباح الخير. أحتاج إلى 3 نقاط موجزة عن نتائج الخدمة في الشهر الماضي لملف مجلس الإدارة: ما الذي تحسّن، وما الذي تراجع، وما الذي نفعله حياله. يُغلق الملف الساعة 12:00 اليوم، والأرقام موجودة في لوحة المؤشرات الشهرية.",
              },
              {
                id: "m2",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "أظن أنني ارتكبت خطأً",
                receivedAt: "الثلاثاء 08:21",
                body: "أمس في الساعة 17:30 أرسلت قائمة الأسعار الجديدة إلى قائمة بريدية للعملاء، وأدركت الآن أنها القائمة التي تضم العملاء جميعًا وعددهم 214، لا العملاء الاثني عشر المشاركين في التجربة. الأسعار الجديدة لن تُعلن قبل اليوم الأول من الشهر القادم، وسيرى بعض العملاء أسعارًا أقل مما يدفعونه الآن. لم أُخبر أحدًا غيرك بعد. أعتذر كثيرًا. ماذا أفعل؟",
              },
              {
                id: "m3",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "رد: تأكيد التسليم، الطلب 4471",
                receivedAt: "الاثنين 18:05",
                body: "شكرًا لتأكيدكم أن الوحدات الأربعين في الطلب 4471 ستصل صباح الأربعاء. فريق الاستلام لدينا سيكون جاهزًا.",
                footnote: "تذكير: اعتبارًا من هذا الأسبوع تُسلَّم جميع الشحنات إلى موقعنا الجديد، المبنى 7، المنطقة الصناعية الشمالية. أُغلق مستودع الميناء القديم يوم الجمعة.",
              },
              {
                id: "m4",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "مطلوب عرض سعر لعميل محتمل جديد",
                receivedAt: "الاثنين 16:40",
                body: "لدينا فرصة قوية لعقد تبلغ قيمته نحو 3 أضعاف أكبر حساباتنا الحالية. هل يمكن لفريقك إعداد عرض سعر للخدمة قبل الساعة 12:00 يوم الخميس؟ سأرسل المتطلبات في وقت لاحق اليوم.",
              },
              {
                id: "m5",
                from: { name: "مكتب خدمة تقنية المعلومات" },
                subject: "صيانة مجدولة يوم السبت",
                receivedAt: "الاثنين 15:00",
                body: "سيتوقف نظام الطلبات يوم السبت من الساعة 22:00 إلى الساعة 02:00. لا يلزم اتخاذ أي إجراء.",
              },
              {
                id: "m6",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "تذكير: ملف الشحن يُغلق الساعة 11:00",
                receivedAt: "الثلاثاء 07:30",
                body: "يُغلق ملف الشحن لتسليمات يوم الأربعاء الساعة 11:00 اليوم. بعد ذلك لا يمكن تعديل عناوين التسليم، وأي تعديل يتطلب حجزًا جديدًا بتأخير لا يقل عن 48 ساعة. قائمة الأربعاء: الطلب 4471، 40 وحدة، مستودع الميناء القديم؛ الطلب 4480، 15 وحدة، المخزن المركزي؛ الطلب 4485، 60 وحدة، المستودع الشرقي.",
              },
              {
                id: "m7",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "هل يمكننا التحدث هذا الأسبوع؟",
                receivedAt: "الاثنين 19:10",
                body: "دُعيت إلى الانضمام إلى مشروع الأتمتة الجديد يومين في الأسبوع لمدة 3 أشهر. أرغب في ذلك كثيرًا، لكنني أعرف أن الأمر يؤثر في الفريق. هل يمكننا التحدث قبل الجمعة؟ يريدون ردًّا قبل يوم الاثنين.",
              },
              {
                id: "m8",
                from: { name: "فريق الموارد البشرية" },
                subject: "موعد تقييمات منتصف العام يوم الجمعة",
                receivedAt: "الثلاثاء 08:02",
                body: "نذكّرك بأن تقييمات منتصف العام لأعضاء فريقك مستحقة يوم الجمعة. أنجزت 2 من 6.",
              },
            ],
          },
        },
        probe: { prompt: "ما الرسالة التي بدأت بها، ولماذا قدّمتها على الرسالة التالية لها في درجة الإلحاح؟" },
        twist: {
          change: "بعد أن أنهيت الفرز مباشرة، وصلتك رسالة من {{report1}}: «أعتذر، لن أحضر اليوم بسبب المرض، ولن أتمكن من الرد على الرسائل.» وما زالت ورشة العمل تبدأ الساعة 08:55.",
          prompt: "ما الذي يتغيّر في خطتك؟ وضّح ما سيحدث الآن لكل مهمة كنت قد كلّفت بها {{report1}}.",
        },
        timeLimitSeconds: 900,
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.planning-prioritisation",
            anchors: [
              "Works through messages in arrival order or by sender seniority; leaves the price-list leak or the 11:00 address change unhandled.",
              "Treats the price-list leak as urgent but handles the delivery messages as routine, or spends the time writing the board bullets.",
              "Handles the price-list leak and the 11:00 address change first, defers non-urgent items with a time, and marks the maintenance notice as no action.",
              "Orders by deadline and harm: leak containment, address fix before 11:00, board bullets by 12:00; gives every deferred item a slot after 17:00.",
              "As level 4, and sees links: the leak may trigger customer calls today, so briefs {{peer}}; plans the project talk with {{report1}} around team cover.",
            ],
          },
          {
            competencyKey: "communication.written-communication",
            anchors: [
              "Replies are vague or leave the reader unsure what to do, for example telling {{report2}} only that it will be sorted out.",
              "Replies contain the needed facts but bury the action, or omit a deadline the reader needs, such as 11:00.",
              "Each reply states its purpose, the facts the reader needs, and an explicit action with an owner and a time.",
              "Puts the action in the first line, names owners and deadlines precisely, and gives {{report2}} clear steps without blame.",
              "As level 4, and anticipates forwarding: the leak reply avoids guessing at blame and says what to tell customers who ask about prices.",
            ],
          },
          {
            competencyKey: "adaptability.composure-under-pressure",
            anchors: [
              "Tries to do everything personally, writes in alarm, or ignores the leak because there is no time.",
              "Handles the urgent items but replies to {{report2}} in a tense or blaming tone, or leaves gaps through haste.",
              "Stays orderly within the time limit: decides quickly, delegates clearly and keeps a calm, supportive tone with {{report2}}.",
              "Makes sound calls in 15 minutes, accepts that some items wait, and leaves a plan others can act on while unreachable.",
              "As level 4, and steadies others: honest with {{report2}} about the seriousness while reassuring, and sets a check-in for 17:00.",
            ],
          },
          {
            competencyKey: "management.delegation",
            anchors: [
              "Drops the tasks given to {{report1}} or assumes they will happen anyway.",
              "Reassigns tasks to whoever is nearest without checking they can do them, or cancels the workshop without weighing it.",
              "Reassigns each of {{report1}}'s tasks to a named person with clear instructions, or handles the critical one personally now.",
              "Matches tasks to ability, gives {{specialist}} the address change directly, and tells {{manager}} what changed for the board bullets.",
              "As level 4, and weighs joining the workshop late to handle the leak, telling {{exec}} the reason rather than arriving late silently.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Treats the price-list email as a confidentiality incident: contains it, informs {{manager}} and sales, and prepares a line for customers who ask.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["price list", "214", "recall", "inform", "customers who ask", "قائمة الأسعار", "استرجاع", "إبلاغ", "السرية", "العملاء الذين يسألون"],
          },
          {
            text: "Connects {{client}}'s new site with order 4471's old address and gets it changed before the 11:00 cut-off.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["new site", "building 7", "old port", "change the address", "before 11:00", "الموقع الجديد", "المبنى 7", "الميناء القديم", "تعديل العنوان", "قبل الساعة 11:00"],
          },
          {
            text: "Gives each delegated task a named owner, the action and the deadline.",
            competencyKey: "communication.written-communication",
            keywords: ["by 11:00", "by 12:00", "please", "deadline", "owner", "قبل الساعة", "الموعد النهائي", "يرجى", "المسؤول"],
          },
          {
            text: "Supports {{report2}} without blame and gives concrete next steps.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["thank you for telling me", "do not send anything else", "we will fix", "شكرًا لإبلاغي", "لا ترسل", "سنعالج", "معًا"],
          },
        ],
        redFlags: [
          {
            text: "Answers messages in arrival order and runs out of time before the urgent ones.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["in the order received", "first come", "بحسب ترتيب الوصول", "الأقدم أولًا"],
          },
          {
            text: "Treats the delivery as confirmed and misses the address change.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["delivery confirmed", "no action needed", "all set", "تم تأكيد التسليم", "لا يلزم إجراء"],
          },
          {
            text: "Blames or scolds {{report2}} for the price-list email.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["careless", "how could you", "unacceptable", "إهمال", "كيف فعلت", "غير مقبول"],
          },
          {
            text: "Tries to do everything personally, including the board bullets, and leaves urgent items without an owner.",
            competencyKey: "communication.written-communication",
            keywords: ["i will do it all", "myself", "سأتولى كل شيء", "بنفسي"],
          },
        ],
        embeddedDetail: {
          description:
            "{{client}}'s footnote says deliveries now go to a new site and the old warehouse has closed, while {{specialist}}'s list shows order 4471 still booked to the Old Port Warehouse; addresses lock at 11:00.",
          location: "footnote of message m3, cross-referenced with the delivery list in message m6",
          keywords: ["new site", "building 7", "old port", "address", "11:00", "الموقع الجديد", "المبنى 7", "الميناء القديم", "العنوان"],
        },
        probeTargets: ["management.planning-prioritisation"],
        twistTargets: ["management.delegation", "adaptability.composure-under-pressure"],
      },
    },
  },
  {
    id: "inbox-02-back-from-leave",
    type: "INBOX",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 5, conflictingConstraints: 4, stakes: 4, timePressure: 5, informationGaps: 3 },
    targets: ["collaboration.stakeholder-management", "judgment.ethical-judgment", "communication.adapting-to-audience"],
    roleFamilies: [],
    minutes: 15,
    storyPhase: "middle",
    content: {
      en: {
        title: "Back from leave",
        scenario:
          "You manage the rollout of {{company}}'s new ordering system for {{client}}'s company, a key account. You are back from 2 days of leave. It is 09:45 on Thursday, and at 10:00 you lead the weekly steering call with {{client}}. Go-live is planned for the 28th, 7 working days from today. While you were away, {{report1}} covered your client calls. 8 messages are waiting, and you have 15 minutes before the call.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "Triage all 8 messages. Put them in the order you will deal with them and, for each one, write one line: what you will do (act now, hand to someone, defer or no action) and by when. Then write full replies to the 2 messages you judge most important.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "n1",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "Today's call",
                receivedAt: "Wed 18:20",
                body: "Our CFO will join today's call for the first time. The CFO wants a clear answer: is go-live on the 28th still realistic? Please be ready to answer that directly.",
              },
              {
                id: "n2",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "Test status: 2 critical defects",
                receivedAt: "Wed 17:05",
                body: "Two critical defects are open in the payment interface: some orders are charged twice when the customer presses 'back'. Fix estimate: 6 working days, then 3 working days of retesting. That takes us 2 working days past the 28th. I do not recommend going live with these open.",
              },
              {
                id: "n3",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "Screenshots for the steering call",
                receivedAt: "Thu 08:50",
                body: "Great to have you back! For today's call, could you show the dashboard from our rollout at the other retail client, so they can see what good looks like? I've put the screenshots in the shared project folder.",
                footnote: "Attached: 6 screenshots of the other client's live 'Customer orders' screen, with customer names, order values and delivery addresses.",
              },
              {
                id: "n4",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "Reporting module",
                receivedAt: "Tue 16:30",
                body: "While you were away I told {{client}} we would include the reporting module in phase 1 at no extra cost. It matters for the relationship. It's about 5 days of work. Please add it to the plan.",
              },
              {
                id: "n5",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "Handover notes",
                receivedAt: "Wed 19:00",
                body: "Notes from the two client calls are in the folder. One thing you should know: their team said their own data migration is running a week late. They didn't seem worried, but it may affect the 28th.",
              },
              {
                id: "n6",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "Training materials late",
                receivedAt: "Thu 08:10",
                body: "I'm sorry, the training materials won't be ready on Friday as planned. I need until Tuesday, because the screens keep changing with the defect fixes.",
              },
              {
                id: "n7",
                from: { name: "Travel team" },
                subject: "Approval needed today",
                receivedAt: "Wed 12:00",
                body: "Your travel booking for next week's on-site visit needs approval by 17:00 today, or the fare will be released.",
              },
              {
                id: "n8",
                from: { name: "{{exec}}", role: "{{exec.role}}" },
                subject: "Success story for Monday",
                receivedAt: "Thu 07:40",
                body: "I hear the rollout is going well. I'd like to mention it at Monday's company meeting as a success story, with the go-live date. Any objection?",
              },
            ],
          },
        },
        probe: { prompt: "What will you say in the first 2 minutes of the 10:00 call, and why in that order?" },
        twist: {
          change: "During the call, the CFO says: 'If go-live moves, we will hold back the next 25% payment until the system is live.'",
          prompt: "Does this change your recommendation on the go-live date? Write the 3 or 4 sentences you say in reply.",
        },
        timeLimitSeconds: 900,
      },
      ar: {
        title: "العودة من الإجازة",
        scenario:
          "تدير مشروع تشغيل نظام الطلبات الجديد من {{company}} لدى شركة {{client}}، وهي من كبار العملاء. عدت للتو من إجازة استمرت يومين. الساعة الآن 09:45 من يوم الخميس، وفي الساعة 10:00 تدير الاجتماع الأسبوعي للجنة التوجيهية مع {{client}}. التشغيل الفعلي مقرر يوم 28، أي بعد 7 أيام عمل من اليوم. تولّى {{report1}} اتصالاتك بالعميل في أثناء غيابك. تنتظرك 8 رسائل، ولديك 15 دقيقة قبل الاجتماع.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "افرز الرسائل الثماني كلها: رتّبها بحسب تسلسل تعاملك معها، واكتب لكل رسالة سطرًا واحدًا يبيّن ما ستفعله (تتصرّف الآن، أو تكلّف بها شخصًا، أو تؤجّلها، أو لا إجراء) وموعد ذلك. ثم اكتب ردًّا كاملًا على الرسالتين اللتين تراهما الأهم.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "n1",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "اجتماع اليوم",
                receivedAt: "الأربعاء 18:20",
                body: "سينضم المدير المالي لدينا إلى اجتماع اليوم لأول مرة، ويريد إجابة واضحة: هل ما زال التشغيل يوم 28 واقعيًا؟ أرجو أن تكون مستعدًا للإجابة عن ذلك مباشرة.",
              },
              {
                id: "n2",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "حالة الاختبار: خللان حرجان",
                receivedAt: "الأربعاء 17:05",
                body: "يوجد خللان حرجان مفتوحان في واجهة الدفع: تُخصم قيمة بعض الطلبات مرتين حين يضغط العميل زر «رجوع». تقدير الإصلاح: 6 أيام عمل، تليها 3 أيام عمل لإعادة الاختبار، وهذا يتجاوز يوم 28 بيومَي عمل. لا أوصي بالتشغيل والخللان قائمان.",
              },
              {
                id: "n3",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "لقطات شاشة لاجتماع اللجنة التوجيهية",
                receivedAt: "الخميس 08:50",
                body: "سعيد بعودتك! هل يمكنك في اجتماع اليوم عرض لوحة المؤشرات من مشروعنا لدى عميل التجزئة الآخر، ليروا كيف يبدو النجاح؟ وضعت لقطات الشاشة في مجلد المشروع المشترك.",
                footnote: "المرفقات: 6 لقطات من شاشة «طلبات العملاء» الحية لدى العميل الآخر، تظهر فيها أسماء العملاء وقيم الطلبات وعناوين التسليم.",
              },
              {
                id: "n4",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "وحدة التقارير",
                receivedAt: "الثلاثاء 16:30",
                body: "في أثناء غيابك أبلغت {{client}} أننا سنضيف وحدة التقارير إلى المرحلة الأولى دون تكلفة إضافية، فهذا مهم للعلاقة. يتطلب الأمر نحو 5 أيام عمل. أرجو إضافتها إلى الخطة.",
              },
              {
                id: "n5",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "ملاحظات التسليم",
                receivedAt: "الأربعاء 19:00",
                body: "ملاحظات الاتصالين مع العميل موجودة في المجلد. أمر ينبغي أن تعرفه: ذكر فريقهم أن ترحيل بياناتهم متأخر أسبوعًا. لم يبدُ عليهم القلق، لكن ذلك قد يؤثر في موعد يوم 28.",
              },
              {
                id: "n6",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "تأخر المواد التدريبية",
                receivedAt: "الخميس 08:10",
                body: "أعتذر، لن تكون المواد التدريبية جاهزة يوم الجمعة كما خُطط. أحتاج إلى مهلة حتى الثلاثاء، لأن الشاشات تتغيّر باستمرار مع إصلاحات الخلل.",
              },
              {
                id: "n7",
                from: { name: "فريق السفر" },
                subject: "مطلوب الاعتماد اليوم",
                receivedAt: "الأربعاء 12:00",
                body: "يحتاج حجز سفرك لزيارة الموقع الأسبوع القادم إلى اعتماد قبل الساعة 17:00 اليوم، وإلا أُلغي السعر المحجوز.",
              },
              {
                id: "n8",
                from: { name: "{{exec}}", role: "{{exec.role}}" },
                subject: "قصة نجاح لاجتماع الاثنين",
                receivedAt: "الخميس 07:40",
                body: "سمعت أن المشروع يسير على نحو جيد. أودّ أن أذكره في اجتماع الشركة يوم الاثنين قصةَ نجاح، مع موعد التشغيل. هل لديك اعتراض؟",
              },
            ],
          },
        },
        probe: { prompt: "ماذا ستقول في أول دقيقتين من اجتماع الساعة 10:00، ولماذا بهذا الترتيب؟" },
        twist: {
          change: "في أثناء الاجتماع قال المدير المالي: «إذا تأجّل التشغيل، فسنحجب الدفعة التالية البالغة 25% إلى أن يعمل النظام فعليًا.»",
          prompt: "هل يغيّر هذا توصيتك بشأن موعد التشغيل؟ اكتب الجمل الثلاث أو الأربع التي تقولها ردًّا على ذلك.",
        },
        timeLimitSeconds: 900,
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Treats each sender in isolation; accepts the scope addition and the success announcement without linking them to the go-live risk.",
              "Notes the go-live risk but tells only {{client}}, leaving {{manager}} and {{exec}} to be surprised later.",
              "Identifies who needs to know about the risk ({{client}}, {{manager}}, {{exec}}) and gives each a timely, suitable update.",
              "Manages conflicting expectations early: asks {{exec}} to hold the announcement and raises the scope addition's effect on the date with {{manager}} before the call.",
              "As level 4, and uses the client's own migration delay to agree a joint, realistic date without blaming either side.",
            ],
          },
          {
            competencyKey: "judgment.ethical-judgment",
            anchors: [
              "Shows or forwards the other client's screenshots without noticing the customer data in them.",
              "Hesitates about the screenshots for presentation reasons only, not because they expose another client's customers.",
              "Declines to use the screenshots because they reveal another client's customer data, and suggests an anonymised alternative.",
              "Declines, explains the confidentiality problem to {{peer}} without blame, and asks for the files to be removed from the shared folder.",
              "As level 4, and checks whether the screenshots were already shared elsewhere, reporting a possible data incident through the proper channel.",
            ],
          },
          {
            competencyKey: "communication.adapting-to-audience",
            anchors: [
              "Plans to open the call with technical defect detail or project jargon, with no direct answer for the CFO.",
              "Gives the CFO an answer but wraps it in technical language, or leaves the business impact unclear.",
              "Opens with a direct answer on the 28th, the reason in plain words, and a proposed new date or decision.",
              "Frames the message around the CFO's concerns, such as double-charged customers, cost and a reliable date, and names the decision needed.",
              "As level 4, and considers how the message lands with {{client}}, the CFO and {{manager}}, avoiding any suggestion that the client's team is at fault.",
            ],
          },
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Agrees to go live on the 28th with the defects open to protect the payment.",
              "Says the date may hold if things go well, avoiding a clear position.",
              "States clearly that going live with double-charging defects is not advisable, even with the payment at stake.",
              "Holds the position respectfully, explains what double charges would cost the client with its own customers, and offers options such as a phased go-live.",
              "As level 4, and proposes tying the payment to a revised, agreed milestone, protecting both companies without hiding the risk.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Recommends against going live on the 28th with critical payment defects and proposes a revised date or phased option.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["not realistic", "revised date", "phased", "charged twice", "غير واقعي", "موعد جديد", "مرحلي", "مرتين", "الخصم المزدوج"],
          },
          {
            text: "Spots the customer data in {{peer}}'s screenshots and refuses to show them.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["customer names", "confidential", "anonymise", "anonymize", "another client", "أسماء العملاء", "سرية", "إخفاء البيانات", "عميل آخر"],
          },
          {
            text: "Asks {{exec}} to hold the success announcement until the date is confirmed.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["hold off", "announcement", "not yet", "after go-live", "تأجيل الإعلان", "ليس الآن", "بعد التشغيل"],
          },
          {
            text: "Opens the call with a direct answer for the CFO, then the reason and the decision needed.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["direct answer", "in short", "decision", "the short answer", "إجابة مباشرة", "باختصار", "القرار"],
          },
          {
            text: "Links {{manager}}'s reporting-module promise to the timeline and raises it before the call.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["reporting module", "5 days", "scope", "phase 2", "وحدة التقارير", "النطاق", "المرحلة الثانية"],
          },
        ],
        redFlags: [
          {
            text: "Confirms the 28th or reports the project as on track despite the open defects.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["on track", "still on schedule", "no change", "وفق الخطة", "في موعده", "لا تغيير"],
          },
          {
            text: "Agrees to show the other client's screenshots.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["i will show the screenshots", "happy to show", "سأعرض اللقطات", "سأعرض الصور"],
          },
          {
            text: "Approves {{exec}}'s success story with the go-live date.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["no objection", "go ahead", "لا مانع", "لا اعتراض"],
          },
          {
            text: "Blames the client's team or {{report2}} in front of the CFO.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["your team is late", "their fault", "بسبب تأخر فريقكم", "خطؤهم"],
          },
        ],
        embeddedDetail: {
          description:
            "{{peer}}'s footnote shows the screenshots contain another client's live customer names, order values and addresses; showing them would breach that client's confidentiality.",
          location: "footnote of message n3",
          keywords: ["customer names", "addresses", "other client", "confidential", "أسماء العملاء", "العناوين", "العميل الآخر", "سرية"],
        },
        probeTargets: ["communication.adapting-to-audience"],
        twistTargets: ["collaboration.stakeholder-management", "leadership.courage"],
      },
    },
  },
];
