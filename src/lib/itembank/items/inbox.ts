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
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "inbox-03-release-afternoon",
    type: "INBOX",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 5, informationGaps: 3 },
    targets: ["management.delegation", "management.follow-through", "communication.written-communication"],
    roleFamilies: ["software-engineering"],
    minutes: 15,
    storyPhase: "middle",
    content: {
      en: {
        title: "The release afternoon",
        scenario:
          "You lead a 7-person engineering team at {{company}}, which makes a payments app used by 18,000 small shops. It is 13:45 on Wednesday. Version 4.2 must be submitted to the app stores by 17:00 today, the last slot before the weekend review queue. From 14:00 to 16:30 you are presenting the yearly architecture review to {{exec}} and cannot check messages. {{report2}} is on leave today. 8 messages are waiting, and you have 15 minutes.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "Triage all 8 messages. Put them in the order you will deal with them and, for each one, write one line: what you will do (act now, hand to someone, defer or no action) and by when. Then write full replies to the 2 messages you judge most important.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "a1",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "Regression results for 4.2",
                receivedAt: "Wed 12:50",
                body: "Full regression finished: 412 of 414 tests pass. Failure 1 is the known flaky login-timeout test; it passed on a re-run. Failure 2 is real: on the refund screen, shops whose account currency is set to US dollars see the refund amount shown in local currency, although the correct amount is refunded. About 6% of shops use dollars. I rate it medium. Options: fix it before release, or hide the refund-screen change behind its feature flag and ship.",
              },
              {
                id: "a2",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "Currency bug and the release",
                receivedAt: "Wed 13:20",
                body: "I can fix the refund currency bug in about 2 hours, including a re-test with {{specialist}}. But I'm also running the release at 16:00 because {{report2}} is off today, and store submission closes at 17:00. I can't do both properly. What do you want me to prioritise?",
              },
              {
                id: "a3",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "Before my day off",
                receivedAt: "Wed 07:55",
                body: "I'm away today for a family event and back tomorrow. I updated the release checklist last night; everything is in the shared folder. Good luck with the release!",
                footnote: "Checklist step 6: add version 4.2 to the payment provider's allowed-versions list before store submission. If it is missed, payouts to shops on 4.2 fail until it is added. Provider console access: {{report2}}, {{report1}}, {{peer}}.",
              },
              {
                id: "a4",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "Incident actions: status today",
                receivedAt: "Wed 11:30",
                body: "The audit committee meets on Friday and will ask about the 4 actions from last month's payout incident review. Please send me the status of each one by the end of today. Two of them are yours.",
                footnote: "(1) Alert for failed payouts: owner you, due last Friday. (2) Document rollback steps: owner {{report1}}, done. (3) Weekly review of payout errors: owner you, not started. (4) Provider contact list: owner {{peer}}, done.",
              },
              {
                id: "a5",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "Saturday launch",
                receivedAt: "Wed 09:10",
                body: "Our 40 branches switch on the new loyalty points on Saturday morning, and staff training is booked for Friday. We are relying on version 4.2 being available by Friday. Can you confirm it is still being submitted today?",
              },
              {
                id: "a6",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "API review, and an offer",
                receivedAt: "Tue 17:40",
                body: "Could someone from your team review our new merchant-settings API by Thursday? Also: I'm in the office all of tomorrow afternoon if you need a hand with anything.",
              },
              {
                id: "a7",
                from: { name: "Facilities" },
                subject: "Fire drill at 15:00",
                receivedAt: "Wed 08:30",
                body: "A fire drill takes place today at 15:00. Please leave the building when the alarm sounds. It will take about 15 minutes.",
              },
              {
                id: "a8",
                from: { name: "HR team" },
                subject: "Course request",
                receivedAt: "Tue 16:05",
                body: "Please confirm by Thursday whether you approve {{report2}}'s request to attend a 3-day cloud computing course next month.",
              },
            ],
          },
        },
        probe: { prompt: "Which task did you keep for yourself, and why that one rather than handing it on?" },
        twist: {
          change: "As you finish triaging, {{peer}} replies: 'Sorry, I've just been called to a customer site and can't reply until 18:00.'",
          prompt: "What changes in your plan? Say who now does each release task, and how you will know by 17:00 that it is done.",
        },
        timeLimitSeconds: 900,
      },
      ar: {
        title: "عصر يوم الإصدار",
        scenario:
          "تقود فريقًا هندسيًا من 7 أشخاص في {{company}}، التي تطوّر تطبيق مدفوعات يستخدمه 18,000 متجر صغير. الساعة الآن 13:45 من يوم الأربعاء. يجب تقديم الإصدار 4.2 إلى متاجر التطبيقات قبل الساعة 17:00 اليوم، فهذه آخر فرصة قبل قائمة المراجعة في عطلة نهاية الأسبوع. ومن الساعة 14:00 حتى 16:30 تعرض المراجعة السنوية للبنية التقنية أمام {{exec}}، ولن تتمكن من الاطلاع على الرسائل في أثنائها. و{{report2}} في إجازة اليوم. تنتظرك 8 رسائل، ولديك 15 دقيقة.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "افرز الرسائل الثماني كلها: رتّبها بحسب تسلسل تعاملك معها، واكتب لكل رسالة سطرًا واحدًا يبيّن ما ستفعله (تتصرّف الآن، أو تكلّف بها شخصًا، أو تؤجّلها، أو لا إجراء) وموعد ذلك. ثم اكتب ردًّا كاملًا على الرسالتين اللتين تراهما الأهم.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "a1",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "نتائج اختبارات الانحدار للإصدار 4.2",
                receivedAt: "الأربعاء 12:50",
                body: "اكتملت اختبارات الانحدار: نجح 412 اختبارًا من 414. الإخفاق الأول في اختبار مهلة تسجيل الدخول المعروف بتذبذبه، وقد نجح عند إعادة تشغيله. أما الإخفاق الثاني فحقيقي: في شاشة الاسترداد، تظهر قيمة المبلغ المسترد بالعملة المحلية للمتاجر التي ضُبطت عملة حسابها على الدولار الأمريكي، مع أن المبلغ الصحيح يُسترد فعلًا. ونحو 6% من المتاجر تستخدم الدولار. أصنّفه متوسط الخطورة. الخيارات: إصلاحه قبل الإصدار، أو إخفاء تعديل شاشة الاسترداد خلف مفتاح تفعيل الخاصية ثم الإصدار.",
              },
              {
                id: "a2",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "خلل العملة والإصدار",
                receivedAt: "الأربعاء 13:20",
                body: "أستطيع إصلاح خلل العملة في شاشة الاسترداد خلال ساعتين تقريبًا، بما فيهما إعادة الاختبار مع {{specialist}}. لكن تنفيذ الإصدار الساعة 16:00 من مهامي أيضًا لأن {{report2}} في إجازة اليوم، ويُغلق باب التقديم إلى المتاجر الساعة 17:00. لا أستطيع إنجاز الأمرين كما ينبغي. بأيهما تريدني أن أبدأ؟",
              },
              {
                id: "a3",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "قبل يوم إجازتي",
                receivedAt: "الأربعاء 07:55",
                body: "أنا في إجازة اليوم لمناسبة عائلية، وأعود غدًا. حدّثتُ قائمة خطوات الإصدار مساء أمس، وكل شيء في المجلد المشترك. بالتوفيق في الإصدار!",
                footnote: "الخطوة 6 في القائمة: إضافة الإصدار 4.2 إلى قائمة الإصدارات المسموح بها لدى مزوّد خدمة الدفع قبل التقديم إلى المتاجر. إذا فاتت هذه الخطوة فستفشل التحويلات إلى المتاجر التي تستخدم الإصدار 4.2 إلى أن يُضاف. صلاحية الدخول إلى لوحة تحكم المزوّد: {{report2}} و{{report1}} و{{peer}}.",
              },
              {
                id: "a4",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "إجراءات ما بعد الحادثة: الحالة اليوم",
                receivedAt: "الأربعاء 11:30",
                body: "تجتمع لجنة التدقيق يوم الجمعة، وستسأل عن الإجراءات الأربعة التي خرجت بها مراجعة حادثة التحويلات في الشهر الماضي. أرسل لي حالة كل إجراء قبل نهاية اليوم. اثنان منها مسندان إليك.",
                footnote: "(1) تنبيه عند فشل التحويلات: المسؤول أنت، والموعد الجمعة الماضية. (2) توثيق خطوات التراجع عن الإصدار: المسؤول {{report1}}، منجز. (3) مراجعة أسبوعية لأخطاء التحويلات: المسؤول أنت، لم يبدأ. (4) قائمة جهات الاتصال لدى المزوّد: المسؤول {{peer}}، منجز.",
              },
              {
                id: "a5",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "إطلاق يوم السبت",
                receivedAt: "الأربعاء 09:10",
                body: "تبدأ فروعنا الأربعون العمل بنقاط الولاء الجديدة صباح السبت، وتدريب الموظفين محدد يوم الجمعة. نعتمد على توفر الإصدار 4.2 قبل الجمعة. هل يمكنكم تأكيد أنه سيُقدَّم اليوم كما هو مخطط؟",
              },
              {
                id: "a6",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "مراجعة الواجهة البرمجية، وعرض للمساعدة",
                receivedAt: "الثلاثاء 17:40",
                body: "هل يمكن لأحد من فريقك مراجعة الواجهة البرمجية الجديدة لإعدادات التجار قبل الخميس؟ وللعلم: سأكون في المكتب طوال بعد ظهر الغد إن احتجتم إلى مساعدة في أي أمر.",
              },
              {
                id: "a7",
                from: { name: "إدارة المرافق" },
                subject: "تمرين إخلاء الساعة 15:00",
                receivedAt: "الأربعاء 08:30",
                body: "يُجرى اليوم تمرين إخلاء عند الحريق الساعة 15:00. يرجى مغادرة المبنى عند سماع الإنذار، ويستغرق التمرين نحو 15 دقيقة.",
              },
              {
                id: "a8",
                from: { name: "فريق الموارد البشرية" },
                subject: "طلب حضور دورة",
                receivedAt: "الثلاثاء 16:05",
                body: "يرجى إبلاغنا قبل الخميس بموافقتك أو عدمها على طلب {{report2}} حضور دورة في الحوسبة السحابية لمدة 3 أيام الشهر القادم.",
              },
            ],
          },
        },
        probe: { prompt: "ما المهمة التي احتفظت بها لنفسك، ولماذا هي تحديدًا بدلًا من تكليف غيرك بها؟" },
        twist: {
          change: "بعد أن أنهيت الفرز مباشرة وصلك رد من {{peer}}: «أعتذر، استُدعيت للتو إلى موقع أحد العملاء، ولن أتمكن من الرد قبل الساعة 18:00.»",
          prompt: "ما الذي يتغيّر في خطتك؟ وضّح من سيتولى الآن كل مهمة من مهام الإصدار، وكيف ستتأكد قبل الساعة 17:00 من إنجازها.",
        },
        timeLimitSeconds: 900,
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.delegation",
            anchors: [
              "Keeps critical work for themselves (fixing the bug or running the release between presentation slides) or hands everything to {{report1}} with no priority.",
              "Delegates, but leaves {{report1}} with both the fix and the release, or gives instructions without the authority to decide anything.",
              "Splits the work: one owner for the release, a clear decision on the currency bug (fix or flag), and step 6 given to someone with console access.",
              "Matches tasks to people: uses {{peer}}'s offer and access for step 6, and gives {{report1}} a clear priority plus authority to ship with the flag off if the fix is not re-tested in time.",
              "As level 4, and sets decision rules in advance (e.g., 'not re-tested by 15:30, ship with the flag off') so others can act while they are unreachable, keeping accountability for the outcome.",
            ],
          },
          {
            competencyKey: "management.follow-through",
            anchors: [
              "Makes promises to {{client}} or {{manager}} with no way of checking they are kept, and ignores the overdue incident actions.",
              "Answers the open items but sets no check before the 17:00 submission, or reports the incident actions as if all were done.",
              "Sets a check point (e.g., confirmation at 16:30 that submission and step 6 are done) and gives {{manager}} the true status of all 4 actions, including their own overdue ones.",
              "Owns the two overdue actions openly with new dates, and confirms to {{client}} only once submission is done, saying when {{client}} will hear.",
              "As level 4, and sees that the missing failed-payout alert is exactly what would catch a missed step 6, so arranges a manual payout check for tonight.",
            ],
          },
          {
            competencyKey: "communication.written-communication",
            anchors: [
              "Replies are vague ('please sort the release out'), leaving the reader unsure who does what by when.",
              "Replies hold the facts but bury the action, or leave out the 17:00 deadline or the step 6 detail.",
              "Each reply opens with its purpose, gives the facts the reader needs and states an owner, an action and a time.",
              "Puts decisions and deadlines first, includes exact details others need (step 6, the flag, 17:00) and is short enough to act on at once.",
              "As level 4, and writes for forwarding: the reply to {{client}} commits only to what is certain and says when the next update comes.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots that checklist step 6 must be done before submission and gives it to someone with provider console access.",
            competencyKey: "management.delegation",
            keywords: ["step 6", "allowed versions", "allowed-versions", "payment provider", "provider console", "الخطوة 6", "الإصدارات المسموح", "مزود خدمة الدفع", "مزود الدفع", "لوحة تحكم"],
          },
          {
            text: "Separates the fix from the release, with the feature flag as a fallback so the release is not put at risk.",
            competencyKey: "management.delegation",
            keywords: ["feature flag", "flag off", "behind the flag", "ship without the fix", "مفتاح تفعيل", "مفتاح التفعيل", "إخفاء التعديل", "دون الإصلاح"],
          },
          {
            text: "Owns the two overdue incident actions and gives them new dates.",
            competencyKey: "management.follow-through",
            keywords: ["overdue", "my two actions", "failed payouts", "new date", "not started", "متأخر", "الإجراءين", "فشل التحويلات", "موعد جديد", "لم يبدأ"],
          },
          {
            text: "Sets a time to confirm submission and step 6 before 17:00.",
            competencyKey: "management.follow-through",
            keywords: ["16:30", "confirm to me", "let me know when", "report back", "check at", "الساعة 16:30", "أكد لي", "أبلغني فور", "أتحقق"],
          },
          {
            text: "Writes replies with a named owner, an action and a deadline.",
            competencyKey: "communication.written-communication",
            keywords: ["by 17:00", "by 15:30", "please confirm", "owner", "قبل الساعة 17:00", "قبل الساعة 15:30", "يرجى التأكيد", "المسؤول عن"],
          },
        ],
        redFlags: [
          {
            text: "Plans to do the fix or the release personally during the presentation breaks.",
            competencyKey: "management.delegation",
            keywords: ["i'll fix it myself", "i will run the release myself", "in a break", "سأصلحه بنفسي", "سأنفذ الإصدار بنفسي", "في الاستراحة"],
          },
          {
            text: "Leaves {{report1}} to do both the fix and the release.",
            competencyKey: "management.delegation",
            keywords: ["do both", "fix it and then release", "الأمرين معًا", "تصلحه ثم تنفذ الإصدار"],
          },
          {
            text: "Guarantees {{client}} the release before it is submitted.",
            competencyKey: "management.follow-through",
            keywords: ["guaranteed", "definitely available", "100%", "نضمن", "مؤكد تمامًا", "بكل تأكيد"],
          },
          {
            text: "Reports the incident actions as complete or hides their own overdue items.",
            competencyKey: "management.follow-through",
            keywords: ["all on track", "nothing outstanding", "all done", "كلها منجزة", "لا شيء معلق", "تسير وفق الخطة"],
          },
          {
            text: "Sends replies with no owner, action or deadline.",
            competencyKey: "communication.written-communication",
            keywords: ["sort it out", "deal with it as you see fit", "رتّب الأمر", "افعل ما تراه مناسبًا"],
          },
        ],
        embeddedDetail: {
          description:
            "{{report2}}'s footnote says checklist step 6 (adding 4.2 to the payment provider's allowed-versions list) must be done before submission or payouts to shops on 4.2 fail; only {{report2}}, {{report1}} and {{peer}} have access.",
          location: "footnote of message a3",
          keywords: ["step 6", "allowed versions", "payment provider", "payouts", "الخطوة 6", "الإصدارات المسموح", "مزود خدمة الدفع", "التحويلات"],
        },
        probeTargets: ["management.delegation"],
        twistTargets: ["management.delegation", "management.follow-through"],
      },
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "inbox-04-last-day-before-leave",
    type: "INBOX",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 3, stakes: 3, timePressure: 5, informationGaps: 3 },
    targets: ["management.follow-through", "communication.clarity-structure", "management.planning-prioritisation"],
    roleFamilies: ["finance"],
    minutes: 15,
    storyPhase: "early",
    content: {
      en: {
        title: "The last afternoon before leave",
        scenario:
          "You lead the 5-person accounts team at {{company}}, a chain of 26 pharmacies. It is 16:10 on Thursday, your last working day before 5 days of leave. The month-end close runs while you are away, and the close pack is due to {{manager}} next Wednesday at 12:00. {{report1}} will cover for you. At 16:30 you go into your last meeting and then leave, and you will not check messages while away. 8 messages are waiting.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "Triage all 8 messages. Put them in the order you will deal with them and, for each one, write one line: what you will do (act now, hand to someone, defer or no action) and by when. Then write full replies to the 2 messages you judge most important.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "b1",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "Covering for you",
                receivedAt: "Thu 15:40",
                body: "Happy to cover. Could you send me a list of what is still open, who owns each item and anything I will need to decide? I have never done the supplier rebate accrual, and I don't know where we are with the auditors.",
              },
              {
                id: "b2",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "Bank reconciliation sign-offs",
                receivedAt: "Thu 11:05",
                body: "After last quarter's audit, you agreed to send signed bank reconciliations for the last three months by the 30th. We have not received them yet. The 30th is tomorrow.",
                footnote: "Under the audit agreement, reconciliations must be signed by the accounts team lead or the finance director.",
              },
              {
                id: "b3",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "Supplier rebates will be late",
                receivedAt: "Thu 14:20",
                body: "Heads-up: our two largest suppliers will send their rebate statements on Tuesday, not Friday as planned. Together they are about 70% of the month's rebates.",
              },
              {
                id: "b4",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "Northgate stock count",
                receivedAt: "Thu 13:50",
                body: "The stock count at the Northgate branch shows a shortfall of 38,000. Most branches are under 5,000. I haven't found the cause yet. Should I post it as it is so the close isn't held up?",
              },
              {
                id: "b5",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "Close pack and margin",
                receivedAt: "Thu 09:30",
                body: "Reminder: I need the close pack by Wednesday 12:00 for Thursday's board. Please include a short explanation of why gross margin fell from 31% to 28.5%.",
              },
              {
                id: "b6",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "Invoiced twice",
                receivedAt: "Wed 17:15",
                body: "We have been invoiced twice for the same delivery: invoices 2231 and 2246, 14,600 each. Please credit one before our payment run on Monday, or we will hold the whole payment.",
              },
              {
                id: "b7",
                from: { name: "Finance Systems" },
                subject: "Planned downtime",
                receivedAt: "Wed 10:00",
                body: "The finance system will be read-only from Saturday 20:00 to Sunday 06:00. No action is needed.",
              },
              {
                id: "b8",
                from: { name: "HR team" },
                subject: "Overtime approval",
                receivedAt: "Thu 08:45",
                body: "Please approve {{report2}}'s overtime from last weekend (9 hours) by Friday so that it is included in this month's payroll.",
              },
            ],
          },
        },
        probe: { prompt: "Which item on your handover is most likely to go wrong while you are away, and what have you put in place for it?" },
        twist: {
          change: "As you finish, {{manager}} writes: 'The board has moved to Monday afternoon. I now need the close pack by Monday 12:00.'",
          prompt: "What changes in your handover? Say what now happens to the supplier rebates and the Northgate shortfall.",
        },
        timeLimitSeconds: 900,
      },
      ar: {
        title: "العصر الأخير قبل الإجازة",
        scenario:
          "تقود فريق الحسابات المؤلف من 5 أشخاص في {{company}}، وهي سلسلة من 26 صيدلية. الساعة الآن 16:10 من يوم الخميس، وهو آخر يوم عمل لك قبل إجازة مدتها 5 أيام. سيجري إقفال نهاية الشهر في أثناء غيابك، وملف الإقفال مستحق التسليم إلى {{manager}} يوم الأربعاء القادم الساعة 12:00. وستكون مهامك في غيابك بيد {{report1}}. في الساعة 16:30 تدخل آخر اجتماعاتك ثم تغادر، ولن تطّلع على الرسائل في أثناء الإجازة. تنتظرك 8 رسائل.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "افرز الرسائل الثماني كلها: رتّبها بحسب تسلسل تعاملك معها، واكتب لكل رسالة سطرًا واحدًا يبيّن ما ستفعله (تتصرّف الآن، أو تكلّف بها شخصًا، أو تؤجّلها، أو لا إجراء) وموعد ذلك. ثم اكتب ردًّا كاملًا على الرسالتين اللتين تراهما الأهم.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "b1",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "تولّي مهامك في غيابك",
                receivedAt: "الخميس 15:40",
                body: "يسعدني أن أتولى المهام. هل يمكنك أن ترسل لي قائمة بما لا يزال مفتوحًا، ومن المسؤول عن كل بند، وما القرارات التي سأحتاج إلى اتخاذها؟ لم يسبق لي إعداد استحقاق خصومات الموردين، ولا أعرف أين وصلنا مع المدققين.",
              },
              {
                id: "b2",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "اعتماد التسويات البنكية",
                receivedAt: "الخميس 11:05",
                body: "بعد تدقيق الربع الماضي، وافقتَ على إرسال التسويات البنكية الموقّعة للأشهر الثلاثة الأخيرة قبل يوم 30. لم تصلنا بعد، ويوم 30 هو الغد.",
                footnote: "بموجب اتفاقية التدقيق، يجب أن يوقّع التسويات قائد فريق الحسابات أو المدير المالي.",
              },
              {
                id: "b3",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "تأخر خصومات الموردين",
                receivedAt: "الخميس 14:20",
                body: "للعلم مسبقًا: سيرسل أكبر موردَين لدينا كشوف الخصومات يوم الثلاثاء، لا يوم الجمعة كما كان مقررًا. ويمثّلان معًا نحو 70% من خصومات الشهر.",
              },
              {
                id: "b4",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "جرد مخزون فرع نورثغيت",
                receivedAt: "الخميس 13:50",
                body: "يُظهر جرد المخزون في فرع نورثغيت عجزًا قدره 38,000، بينما يقل العجز في معظم الفروع عن 5,000. لم أعثر على السبب بعد. هل أقيّده كما هو حتى لا يتأخر الإقفال؟",
              },
              {
                id: "b5",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "ملف الإقفال وهامش الربح",
                receivedAt: "الخميس 09:30",
                body: "تذكير: أحتاج إلى ملف الإقفال قبل الساعة 12:00 يوم الأربعاء لاجتماع مجلس الإدارة يوم الخميس. أرجو أن تضمّنه شرحًا موجزًا لانخفاض هامش الربح الإجمالي من 31% إلى 28.5%.",
              },
              {
                id: "b6",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "فاتورتان للتسليم نفسه",
                receivedAt: "الأربعاء 17:15",
                body: "وصلتنا فاتورتان عن التسليم نفسه: الفاتورة 2231 والفاتورة 2246، قيمة كلٍّ منهما 14,600. نرجو إصدار إشعار دائن بإحداهما قبل دورة السداد لدينا يوم الاثنين، وإلا فسنوقف السداد كله.",
              },
              {
                id: "b7",
                from: { name: "أنظمة المالية" },
                subject: "توقف مجدول",
                receivedAt: "الأربعاء 10:00",
                body: "سيكون النظام المالي متاحًا للقراءة فقط من الساعة 20:00 يوم السبت حتى الساعة 06:00 يوم الأحد. لا يلزم اتخاذ أي إجراء.",
              },
              {
                id: "b8",
                from: { name: "فريق الموارد البشرية" },
                subject: "اعتماد العمل الإضافي",
                receivedAt: "الخميس 08:45",
                body: "يرجى اعتماد ساعات العمل الإضافي لـ{{report2}} في عطلة نهاية الأسبوع الماضية (9 ساعات) قبل يوم الجمعة، لتُدرج في رواتب هذا الشهر.",
              },
            ],
          },
        },
        probe: { prompt: "أي بند في خطة التسليم هو الأرجح أن يتعثر في غيابك، وما الذي رتّبته لمواجهته؟" },
        twist: {
          change: "بعد أن أنهيت الفرز وصلتك رسالة من {{manager}}: «تقدّم موعد اجتماع مجلس الإدارة إلى بعد ظهر الاثنين، وأحتاج الآن إلى ملف الإقفال قبل الساعة 12:00 يوم الاثنين.»",
          prompt: "ما الذي يتغيّر في خطة التسليم؟ وضّح ما سيحدث الآن لخصومات الموردين ولعجز فرع نورثغيت.",
        },
        timeLimitSeconds: 900,
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.follow-through",
            anchors: [
              "Leaves for leave with open commitments unowned: the auditor sign-offs, the double invoice or the Northgate shortfall have no owner or date.",
              "Lists the open items for {{report1}} but without owners, dates or what 'done' means, and forgets their own promise to the auditor.",
              "Gives every open item an owner and a date, keeps their own promise by signing the reconciliations before leaving (or asks {{manager}} to), and tells {{specialist}} when they will arrive.",
              "Adds checkpoints others can see, such as {{report1}} sending {{manager}} a status on Monday, and decision rules for items that may change while they are away.",
              "As level 4, and closes each loop with the person waiting: {{client}} hears when the credit will be issued, {{peer}} is asked to send the rebate statements to {{report1}}, and {{manager}} knows what may still move.",
            ],
          },
          {
            competencyKey: "communication.clarity-structure",
            anchors: [
              "The handover reply is a stream of notes with no order, so {{report1}} cannot tell what is urgent or what is theirs to decide.",
              "Has some structure but mixes facts, actions and decisions, or leaves key dates (Monday's payment run, Wednesday 12:00) buried.",
              "Organises the handover into clear groups, such as open items, owners and dates, decisions delegated, and who to call, with the most urgent first.",
              "Leads with what {{report1}} must do first and why, gives each decision the information needed to make it, and keeps it brief enough to use under pressure.",
              "As level 4, and anticipates questions: says what to do if the rebate statements are late again or the Northgate cause is not found, so {{report1}} need not guess.",
            ],
          },
          {
            competencyKey: "management.planning-prioritisation",
            anchors: [
              "Works through messages in arrival order or by seniority and runs out of time before the reconciliations or the handover.",
              "Treats the margin explanation for {{manager}} as most urgent and leaves the next-day audit deadline or Monday's payment run to chance.",
              "Puts the tasks only they can do (signing the reconciliations) and the handover first, then the items with near deadlines (credit before Monday), and marks the downtime notice as no action.",
              "Orders by deadline and consequence, decides how the late rebates will be handled (an estimate, trued up later) and stops the unexplained shortfall being posted as it is.",
              "As level 4, and sees the links: the late rebates and the Northgate shortfall may both affect the margin explanation, so plans the close pack with that in mind.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Notices the reconciliations must be signed by the team lead or finance director, so signs them before leaving or asks {{manager}}.",
            competencyKey: "management.follow-through",
            keywords: ["sign them today", "sign before i leave", "finance director", "only i can sign", "must be signed by", "أوقعها اليوم", "قبل مغادرتي", "المدير المالي", "يجب أن يوقع", "التوقيع"],
          },
          {
            text: "Gives each handover item an owner, a date and a status check with {{manager}}.",
            competencyKey: "management.follow-through",
            keywords: ["owner", "by monday", "status update", "check in", "المسؤول", "قبل الاثنين", "تحديث بالحالة", "متابعة"],
          },
          {
            text: "Structures the handover so {{report1}} sees priorities and delegated decisions at a glance.",
            competencyKey: "communication.clarity-structure",
            keywords: ["first", "decisions for you", "open items", "if the", "أولًا", "قرارات لك", "البنود المفتوحة", "إذا لم"],
          },
          {
            text: "Decides to accrue an estimate for the late rebates and adjust when the statements arrive.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["estimate", "accrue", "last month's", "true up", "adjust", "تقدير", "استحقاق تقديري", "الشهر الماضي", "تسوية لاحقة", "تعديل"],
          },
          {
            text: "Stops the Northgate shortfall being posted unexplained and assigns the investigation.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["investigate", "don't post", "recount", "38,000", "تحقق", "لا تقيده", "إعادة الجرد", "38,000"],
          },
        ],
        redFlags: [
          {
            text: "Hands the auditor sign-offs to {{report1}}, who is not allowed to sign them.",
            competencyKey: "management.follow-through",
            keywords: ["report1 can sign", "please sign the reconciliations", "sign on my behalf", "وقّعها نيابة عني", "يمكنك توقيع التسويات"],
          },
          {
            text: "Tells {{report2}} to post the 38,000 shortfall as it is.",
            competencyKey: "management.planning-prioritisation",
            keywords: ["post it as it is", "just post it", "قيده كما هو", "قيّده كما هو"],
          },
          {
            text: "Leaves {{report1}} a vague handover ('you know what to do').",
            competencyKey: "communication.clarity-structure",
            keywords: ["you know what to do", "use your judgement on everything", "as usual", "تعرف ما يجب فعله", "كالمعتاد"],
          },
        ],
        embeddedDetail: {
          description:
            "The auditor's footnote says only the accounts team lead or the finance director may sign the reconciliations, so the sign-offs due tomorrow cannot be handed to {{report1}}.",
          location: "footnote of message b2",
          keywords: ["team lead or the finance director", "must be signed", "finance director", "المدير المالي", "قائد فريق الحسابات", "يجب أن يوقع"],
        },
        probeTargets: ["management.follow-through"],
        twistTargets: ["management.planning-prioritisation", "management.follow-through"],
      },
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "inbox-05-clinic-monday",
    type: "INBOX",
    difficulty: 5,
    dials: { ambiguity: 5, stakeholders: 5, conflictingConstraints: 4, stakes: 4, timePressure: 5, informationGaps: 5 },
    targets: ["adaptability.comfort-with-ambiguity", "leadership.handling-conflict", "communication.difficult-conversations"],
    roleFamilies: [],
    minutes: 15,
    storyPhase: "late",
    content: {
      en: {
        title: "Monday at the clinic",
        scenario:
          "Three weeks ago you became manager of the 12-person patient services team (reception and bookings) at {{company}}'s outpatient clinic. A new appointment system went live last Thursday. It is 07:50 on Monday. The clinic opens at 08:30, and you are covering the front desk from 08:30 to 10:00 because of a staff shortage. {{manager}} is at a conference abroad this week and replies slowly. 8 messages are waiting, and you have 15 minutes. Some of what you need to know is not known yet.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "Triage all 8 messages. Put them in the order you will deal with them and, for each one, write one line: what you will do (act now, hand to someone, defer or no action) and by when. Then write full replies to the 2 messages you judge most important.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "c1",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "Today's rota",
                receivedAt: "Sun 21:40",
                body: "I've just seen that {{report2}} changed today's front-desk rota without asking me. Two of the four people on the desk haven't been trained on the new system. I have run this rota for 5 years. I'm not going to fix someone else's mess again.",
              },
              {
                id: "c2",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "Front desk",
                receivedAt: "Sun 22:15",
                body: "I moved two people on the rota because {{report1}} keeps telling patients the new system is broken and to complain to management. I didn't want that on the desk with the inspection coming. Sorry for not asking first, but someone had to do something.",
              },
              {
                id: "c3",
                from: { name: "Patient Relations" },
                subject: "Complaint from Thursday",
                receivedAt: "Fri 16:20",
                body: "A patient waited 70 minutes on Thursday and says a receptionist told them: 'This new system is useless, write to management.' The patient did not get the receptionist's name. Please respond within 5 working days.",
              },
              {
                id: "c4",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "Cancelling follow-up appointments",
                receivedAt: "Fri 18:00",
                body: "The guidance for cancelling follow-up appointments isn't finished. For now, please don't cancel follow-ups in the system; note them on paper and we will enter them later. I expect to send the final steps later this week, but I can't give a date yet.",
              },
              {
                id: "c5",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "Pre-approval codes from today",
                receivedAt: "Sun 15:00",
                body: "From today, every visit by our members needs the pre-approval code entered at check-in. Without it, we cannot pay the claim.",
                footnote: "In the new system the code goes in the 'Payer details' field. The field is optional, so the system will let staff check a patient in without it.",
              },
              {
                id: "c6",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "While I'm away",
                receivedAt: "Sun 19:30",
                body: "Sorry to leave you with the new system so early. Use your judgement. The main thing: keep waiting times under 20 minutes this week. The quality inspection is next Tuesday.",
              },
              {
                id: "c7",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "Double bookings in Clinic 4",
                receivedAt: "Mon 07:20",
                body: "Clinic 4's doctors can see 9 patients double-booked this morning in the new system. Can someone sort it out before the 09:00 clinics start?",
              },
              {
                id: "c8",
                from: { name: "Facilities" },
                subject: "Car park",
                receivedAt: "Fri 12:00",
                body: "The car park barrier has been repaired.",
              },
            ],
          },
        },
        probe: { prompt: "Which decision did you take today without having all the information, and what would make you change it?" },
        twist: {
          change: "At 08:15 {{report1}} comes to your desk and says: 'If {{report2}}'s rota stands, I'm going home.'",
          prompt: "Write what you say to {{report1}} in that moment, in 4 to 6 sentences.",
        },
        timeLimitSeconds: 900,
      },
      ar: {
        title: "يوم الاثنين في العيادة",
        scenario:
          "قبل ثلاثة أسابيع أصبحت مديرًا لفريق خدمات المرضى (الاستقبال والحجوزات) في العيادات الخارجية لدى {{company}}، ويضم الفريق 12 شخصًا. بدأ العمل بنظام المواعيد الجديد يوم الخميس الماضي. الساعة الآن 07:50 من يوم الاثنين، وتفتح العيادة أبوابها الساعة 08:30، وستغطي مكتب الاستقبال بنفسك من 08:30 حتى 10:00 بسبب نقص الموظفين. و{{manager}} في مؤتمر خارج البلاد هذا الأسبوع، فيتأخر الرد على الرسائل. تنتظرك 8 رسائل، ولديك 15 دقيقة. وبعض ما تحتاج إلى معرفته لم يتضح بعد.",
        materials: [],
        task: {
          kind: "inbox",
          prompt:
            "افرز الرسائل الثماني كلها: رتّبها بحسب تسلسل تعاملك معها، واكتب لكل رسالة سطرًا واحدًا يبيّن ما ستفعله (تتصرّف الآن، أو تكلّف بها شخصًا، أو تؤجّلها، أو لا إجراء) وموعد ذلك. ثم اكتب ردًّا كاملًا على الرسالتين اللتين تراهما الأهم.",
          inbox: {
            replyCount: 2,
            messages: [
              {
                id: "c1",
                from: { name: "{{report1}}", role: "{{report1.role}}" },
                subject: "جدول مناوبات اليوم",
                receivedAt: "الأحد 21:40",
                body: "رأيت للتو أن جدول مناوبات الاستقبال لهذا اليوم عُدّل على يد {{report2}} دون الرجوع إليّ. اثنان من الأربعة المناوبين على المكتب لم يتدربوا على النظام الجديد. أُعدّ هذا الجدول منذ 5 سنوات، ولن أصلح فوضى غيري مرة أخرى.",
              },
              {
                id: "c2",
                from: { name: "{{report2}}", role: "{{report2.role}}" },
                subject: "مكتب الاستقبال",
                receivedAt: "الأحد 22:15",
                body: "نقلتُ شخصين في الجدول لأن المرضى يسمعون من {{report1}} مرارًا أن النظام الجديد معطّل وأن عليهم الشكوى إلى الإدارة، ولم أرد أن يتكرر ذلك على المكتب والتفتيش على الأبواب. أعتذر لأنني لم أستأذن أولًا، لكن كان لا بد أن يتحرك أحد.",
              },
              {
                id: "c3",
                from: { name: "علاقات المرضى" },
                subject: "شكوى من يوم الخميس",
                receivedAt: "الجمعة 16:20",
                body: "انتظر أحد المرضى 70 دقيقة يوم الخميس، ويقول إن موظفًا في الاستقبال قال له: «هذا النظام الجديد عديم الفائدة، اكتب إلى الإدارة.» ولم يعرف المريض اسم الموظف. يرجى الرد خلال 5 أيام عمل.",
              },
              {
                id: "c4",
                from: { name: "{{specialist}}", role: "{{specialist.role}}" },
                subject: "إلغاء مواعيد المتابعة",
                receivedAt: "الجمعة 18:00",
                body: "لم يكتمل دليل إلغاء مواعيد المتابعة بعد. في الوقت الحالي يرجى عدم إلغاء مواعيد المتابعة في النظام، بل تدوينها ورقيًا وسنُدخلها لاحقًا. أتوقع إرسال الخطوات النهائية في وقت لاحق من هذا الأسبوع، لكن لا أستطيع تحديد موعد بعد.",
              },
              {
                id: "c5",
                from: { name: "{{client}}", role: "{{client.role}}" },
                subject: "رموز الموافقة المسبقة اعتبارًا من اليوم",
                receivedAt: "الأحد 15:00",
                body: "اعتبارًا من اليوم، تحتاج كل زيارة لأحد منتسبينا إلى إدخال رمز الموافقة المسبقة عند تسجيل الوصول، ومن دونه لا يمكننا سداد المطالبة.",
                footnote: "في النظام الجديد يُدخل الرمز في حقل «بيانات الجهة الدافعة». والحقل اختياري، فيسمح النظام للموظفين بتسجيل وصول المريض من دونه.",
              },
              {
                id: "c6",
                from: { name: "{{manager}}", role: "{{manager.role}}" },
                subject: "في أثناء غيابي",
                receivedAt: "الأحد 19:30",
                body: "أعتذر لأنني تركتك مع النظام الجديد في وقت مبكر كهذا. تصرّف بما تراه مناسبًا. الأهم: أن يبقى وقت الانتظار أقل من 20 دقيقة هذا الأسبوع، فتفتيش الجودة يوم الثلاثاء القادم.",
              },
              {
                id: "c7",
                from: { name: "{{peer}}", role: "{{peer.role}}" },
                subject: "حجوزات مزدوجة في العيادة 4",
                receivedAt: "الاثنين 07:20",
                body: "يرى أطباء العيادة 4 في النظام الجديد 9 مرضى محجوزين مرتين هذا الصباح. هل يمكن لأحد معالجة الأمر قبل بدء العيادات الساعة 09:00؟",
              },
              {
                id: "c8",
                from: { name: "إدارة المرافق" },
                subject: "موقف السيارات",
                receivedAt: "الجمعة 12:00",
                body: "أُصلحت بوابة موقف السيارات.",
              },
            ],
          },
        },
        probe: { prompt: "ما القرار الذي اتخذته اليوم دون أن تكتمل لديك المعلومات، وما الذي قد يدفعك إلى تغييره؟" },
        twist: {
          change: "في الساعة 08:15، وعند مكتبك، تسمع من {{report1}} هذه العبارة: «إذا بقي جدول {{report2}} كما هو، فسأعود إلى البيت.»",
          prompt: "اكتب ما تقوله لـ{{report1}} في تلك اللحظة، في 4 إلى 6 جمل.",
        },
        timeLimitSeconds: 900,
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "adaptability.comfort-with-ambiguity",
            anchors: [
              "Waits for {{manager}} or {{specialist}} before deciding anything, or acts as if the new system works fully and the unknowns do not exist.",
              "Acts, but on unstated assumptions, e.g., cancels follow-ups normally or opens the desk with no plan for the pre-approval code.",
              "States a working plan for today despite the gaps (paper log for follow-up cancellations, trained staff on the desk) and names what still needs clarifying.",
              "Takes small, reversible steps, such as a 5-minute team briefing at 08:20 and a check of the pre-approval field at 10:00, while chasing answers on the most important unknowns.",
              "As level 4, and gives the team simple working rules for the week (what to do when the system fails, who decides what) so others can act without waiting for answers.",
            ],
          },
          {
            competencyKey: "leadership.handling-conflict",
            anchors: [
              "Takes one side on the strength of one message (backs {{report2}} and labels {{report1}}, or undoes the change to placate {{report1}}) or ignores the conflict.",
              "Tells both to get along, or sends both the same message, without hearing either side or settling today's desk.",
              "Sets a fair arrangement for today (trained staff on the desk), says it is temporary, and arranges to hear each person separately soon.",
              "Separates the two issues ({{report2}} changing the rota without agreement; the reported comments to patients), addresses each with the right person, then brings both together around shared goals.",
              "As level 4, and fixes the cause: agrees who owns the rota and how changes are made, so the same conflict does not return.",
            ],
          },
          {
            competencyKey: "communication.difficult-conversations",
            anchors: [
              "Avoids raising the patient comment with anyone, or accuses {{report1}} in writing as if it were proven.",
              "Raises the concerns so vaguely that neither person would know what must change, or in a blaming tone.",
              "States the concerns clearly and respectfully: rota changes need agreement; patients must not be told the system is useless. Asks for each person's account.",
              "Separates what is known from what is alleged (the patient did not name the receptionist), stays specific, and invites each person's view before drawing conclusions.",
              "As level 4, and protects the relationship: acknowledges {{report1}}'s 5 years of experience and frustration with the system while being clear about the standard expected.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Sees that the pre-approval field is optional and briefs the desk to fill it in at every check-in.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["pre-approval", "payer details", "optional", "every check-in", "brief the desk", "الموافقة المسبقة", "بيانات الجهة الدافعة", "اختياري", "عند كل تسجيل", "إحاطة"],
          },
          {
            text: "Sets a temporary desk arrangement with trained staff for today.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["trained", "for today", "temporary", "interim", "مدربين", "مدرّبين", "لهذا اليوم", "مؤقت"],
          },
          {
            text: "Plans to hear each person separately before deciding.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["separately", "both sides", "each of you", "hear from", "على حدة", "الطرفين", "كل منكما", "أستمع"],
          },
          {
            text: "Distinguishes the allegation from established fact.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["didn't name", "not named", "your account", "your side", "what happened", "لم يذكر اسم", "روايتك", "وجهة نظرك", "ما الذي حدث"],
          },
          {
            text: "States the standard clearly: rota changes need agreement and patients must not hear the system run down.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["in front of patients", "agree changes", "not acceptable to tell patients", "أمام المرضى", "بالاتفاق", "لا يصح أن يُقال للمرضى"],
          },
          {
            text: "Proceeds on a working plan while chasing the unknowns.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["paper log", "for now", "until we know", "workaround", "ورقيًا", "في الوقت الحالي", "إلى أن نعرف", "حل مؤقت"],
          },
        ],
        redFlags: [
          {
            text: "Puts the blame on one person before hearing them.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["your fault", "you caused this", "خطؤك", "أنت السبب"],
          },
          {
            text: "Tells them to sort it out between themselves.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["sort it out yourselves", "between yourselves", "work it out together", "حلّا الأمر بينكما", "فيما بينكما"],
          },
          {
            text: "Labels {{report1}} instead of describing behaviour.",
            competencyKey: "communication.difficult-conversations",
            keywords: ["unprofessional", "troublemaker", "negative attitude", "غير مهني", "مثير للمشاكل", "سلبي"],
          },
          {
            text: "Defers decisions until {{manager}} or the vendor replies.",
            competencyKey: "adaptability.comfort-with-ambiguity",
            keywords: ["wait for the manager", "wait until the vendor", "until i hear back", "ننتظر المدير", "حتى يرد", "ننتظر المورد"],
          },
        ],
        embeddedDetail: {
          description:
            "{{client}}'s footnote says the pre-approval field is optional in the new system, so staff can check patients in without the code, and every such visit would go unpaid from today.",
          location: "footnote of message c5",
          keywords: ["optional", "payer details", "without it", "pre-approval", "اختياري", "بيانات الجهة الدافعة", "من دونه", "الموافقة المسبقة"],
        },
        probeTargets: ["adaptability.comfort-with-ambiguity"],
        twistTargets: ["leadership.handling-conflict", "communication.difficult-conversations"],
      },
    },
  },
];
