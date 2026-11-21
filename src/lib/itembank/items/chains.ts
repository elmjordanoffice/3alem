import type { BankItem } from "@/lib/assessment/item-schema";

export const ITEMS: BankItem[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "chain-01-evening-outage",
    type: "CONSEQUENCE_CHAIN",
    difficulty: 4,
    dials: { ambiguity: 4, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 5, informationGaps: 4 },
    targets: ["adaptability.composure-under-pressure", "judgment.knowing-when-to-escalate", "collaboration.stakeholder-management"],
    roleFamilies: [],
    minutes: 9,
    storyPhase: "middle",
    content: {
      en: {
        title: "The evening outage",
        scenario:
          "It is 19:40 on a weekday. {{company}}'s online ordering system has started failing for about a third of customers. You are the manager on call this week. {{report1}} is investigating; {{report2}} is handling incoming customer messages. {{manager}} is unreachable until 22:00. {{exec}} receives an automatic alert only if an outage lasts more than an hour. {{client}}, your largest business customer, runs a big order cycle at 21:00. You will make four decisions as the evening unfolds; what happens next depends partly on your choices. The on-call guide and today's change log are in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "On-call guide (extract)",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            body:
              "1. Contain first. If a recent change is the likely cause, roll it back.\n2. Tell customers within 30 minutes of a confirmed outage, using the public status page.\n3. Report major incidents (more than 25% of customers affected, or any risk to payment data) to the executive on duty, {{exec}}, by phone and immediately, whatever the time.\n4. After any major incident, write a factual summary within 12 hours.",
          },
          {
            kind: "table",
            id: "m2",
            title: "Changes released today",
            columns: [
              { key: "time", label: "Time" },
              { key: "change", label: "Change" },
              { key: "owner", label: "Owner" },
            ],
            rows: [
              { time: "14:00", change: "Price list update", owner: "{{peer}}'s team" },
              { time: "18:55", change: "Checkout page update (includes a fix {{client}} asked for)", owner: "{{report1}}" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "In each round, choose what you do and briefly say why.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation:
                  "19:45. {{report1}} says the failures began soon after the 18:55 checkout update but cannot yet be sure it is the cause. Rolling it back takes about 20 minutes and would also remove the fix {{client}} asked for.",
                options: [
                  { id: "r1a", label: "Roll back the update now, before the cause is confirmed." },
                  { id: "r1b", label: "Give {{report1}} 20 more minutes to confirm the cause before deciding." },
                  { id: "r1c", label: "Roll back for all customers except {{client}}'s accounts, which keep the update." },
                ],
                consequences: [
                  { optionId: "r1a", text: "The rollback finishes at 20:05 and failures drop to about 5% of customers. {{client}}'s requested fix is gone, and their operations lead emails to ask why." },
                  { optionId: "r1b", text: "At 20:05 {{report1}} confirms the update is the likely cause. Failures have spread to about 40% of customers. A rollback now would finish around 20:30." },
                  { optionId: "r1c", text: "The partial rollback takes 35 minutes and finishes at 20:20. Failures drop to 5% for most customers, but {{client}}'s accounts still fail about a third of the time." },
                ],
              },
              {
                id: "round2",
                situation:
                  "About 20:15. Customer messages are piling up: {{report2}} has 140 unanswered and asks what to tell people. {{manager}} is still unreachable. Nobody has spoken to {{exec}} yet.",
                options: [
                  { id: "r2a", label: "Call {{exec}} now with a short summary and your plan." },
                  { id: "r2b", label: "Post a public status message and have {{report2}} send a holding reply to everyone; call {{exec}} once the picture is clearer." },
                  { id: "r2c", label: "Ask {{report2}} to reply to customers one by one, starting with the angriest, and brief {{manager}} at 22:00." },
                ],
                consequences: [
                  { optionId: "r2a", text: "{{exec}} answers, asks two sharp questions about {{client}}, and wants an update every 30 minutes. Messages keep piling up while you are on the call." },
                  { optionId: "r2b", text: "Messages slow down after the status post. At 20:40 {{exec}} calls you, having heard about the outage from a customer, and asks why nobody phoned." },
                  { optionId: "r2c", text: "{{report2}} answers 25 messages in 30 minutes while 200 more arrive. Several customers post publicly that {{company}} is ignoring them." },
                ],
              },
              {
                id: "round3",
                situation:
                  "About 20:45. {{client}}'s order cycle starts at 21:00. Their operations lead calls: can they run it safely? {{report1}} estimates about a 1 in 10 chance of some failures during the cycle, but cannot be sure.",
                options: [
                  { id: "r3a", label: "Advise {{client}} to delay their cycle by two hours while you stabilise the system." },
                  { id: "r3b", label: "Give {{client}} the honest odds and let them decide, with {{report1}} watching their orders live." },
                  { id: "r3c", label: "Assure {{client}} it is safe to go ahead, since the main problem has been contained." },
                ],
                consequences: [
                  { optionId: "r3a", text: "{{client}} delays, unhappily: their warehouse staff stay late at {{client}}'s cost. The cycle runs at 23:00 without problems." },
                  { optionId: "r3b", text: "{{client}} runs the cycle at 21:00. About 3% of their orders fail and are re-run by 22:30 with {{report1}}'s help. Their lead thanks you for your honesty but asks for a review meeting." },
                  { optionId: "r3c", text: "The cycle runs. About 3% of orders fail. {{client}}'s lead is angry at having been told it was safe and copies their director into an email to {{exec}}." },
                ],
              },
              {
                id: "round4",
                situation:
                  "22:30. Service is back to normal and {{manager}} is now reachable. {{report1}} and {{report2}} have been working for 14 hours. {{exec}} expects a summary at 09:00 tomorrow, and {{client}} wants answers.",
                options: [
                  { id: "r4a", label: "Send everyone home now, write a brief factual summary yourself tonight, and schedule a review for tomorrow afternoon." },
                  { id: "r4b", label: "Keep {{report1}} for another hour to document the cause while it is fresh; send {{report2}} home." },
                  { id: "r4c", label: "Hand everything over to {{manager}} from here, and go home." },
                ],
                consequences: [
                  { optionId: "r4a", text: "{{exec}} receives your summary at 08:00 and asks for the root cause by noon. The team arrives rested." },
                  { optionId: "r4b", text: "{{report1}} documents the cause clearly but arrives late and tired the next day. The review has precise notes." },
                  { optionId: "r4c", text: "{{manager}} takes over but lacks the details. The 09:00 summary has gaps, and {{manager}} calls you at 07:30 with questions." },
                ],
              },
            ],
          },
        },
        probe: {
          prompt: "Write the short message (three or four lines) you send to {{exec}} at 22:30.",
        },
        twist: {
          change: "Next morning you learn that some of the failed orders charged customers without sending them a confirmation.",
          prompt: "What do you do first, and who do you tell?",
        },
      },
      ar: {
        title: "عطل المساء",
        scenario:
          "الساعة 19:40 في يوم عمل. بدأ نظام الطلبات الإلكترونية لدى {{company}} يتعطل لدى نحو ثلث العملاء، وأنت المدير المناوب هذا الأسبوع. تقصّي المشكلة بيد {{report1}}، ورسائل العملاء الواردة بيد {{report2}}. ولا سبيل إلى الوصول إلى {{manager}} قبل الساعة 22:00. أما التنبيه الآلي إلى {{exec}} فلا يُرسَل إلا إذا استمر العطل أكثر من ساعة. ويبدأ {{client}}، أكبر عملائك من الشركات، دورة طلبات كبيرة في الساعة 21:00. ستتخذ أربعة قرارات مع تطور الأحداث في هذا المساء، وما يحدث بعد كل قرار يتوقف جزئيًا على اختياراتك. تجد دليل المناوبة وسجل تغييرات اليوم ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "دليل المناوبة (مقتطف)",
            author: { name: "{{specialist}}", role: "{{specialist.role}}" },
            body:
              "1. الاحتواء أولًا. إذا كان تغيير حديث هو السبب المرجح، فتراجع عنه.\n2. أبلغ العملاء خلال 30 دقيقة من تأكيد العطل عبر صفحة الحالة العامة.\n3. أبلغ المسؤول التنفيذي المناوب، {{exec}}، بالحوادث الكبرى (تأثر أكثر من 25% من العملاء، أو أي خطر على بيانات الدفع) هاتفيًا وفورًا، أيًّا كان الوقت.\n4. بعد أي حادثة كبرى، اكتب ملخصًا وقائعيًا خلال 12 ساعة.",
          },
          {
            kind: "table",
            id: "m2",
            title: "التغييرات المطبقة اليوم",
            columns: [
              { key: "time", label: "الوقت" },
              { key: "change", label: "التغيير" },
              { key: "owner", label: "المسؤول" },
            ],
            rows: [
              { time: "14:00", change: "تحديث قائمة الأسعار", owner: "فريق {{peer}}" },
              { time: "18:55", change: "تحديث صفحة الدفع (يتضمن إصلاحًا مطلوبًا من {{client}})", owner: "{{report1}}" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "في كل جولة، اختر ما تفعله واذكر السبب باختصار.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation:
                  "الساعة 19:45. بحسب {{report1}}، بدأت الأعطال بعد تحديث صفحة الدفع في الساعة 18:55 بقليل، لكن لا يقين بعد بأنه السبب. والتراجع عن التحديث يستغرق نحو 20 دقيقة، وسيلغي أيضًا الإصلاح المطلوب من {{client}}.",
                options: [
                  { id: "r1a", label: "التراجع عن التحديث الآن، قبل تأكيد السبب." },
                  { id: "r1b", label: "منح {{report1}} عشرين دقيقة أخرى لتأكيد السبب قبل اتخاذ القرار." },
                  { id: "r1c", label: "التراجع عن التحديث لجميع العملاء باستثناء حسابات {{client}}، التي تحتفظ بالتحديث." },
                ],
                consequences: [
                  { optionId: "r1a", text: "ينتهي التراجع في الساعة 20:05، وتنخفض الأعطال إلى نحو 5% من العملاء. لكن الإصلاح المطلوب من {{client}} أُلغي، وتصلك رسالة من مسؤول العمليات لدى {{client}} يسأل فيها عن السبب." },
                  { optionId: "r1b", text: "في الساعة 20:05 يأتي تأكيد من {{report1}} بأن التحديث هو السبب المرجح. وقد امتدت الأعطال إلى نحو 40% من العملاء، والتراجع الآن سينتهي نحو الساعة 20:30." },
                  { optionId: "r1c", text: "يستغرق التراجع الجزئي 35 دقيقة وينتهي في الساعة 20:20. تنخفض الأعطال إلى 5% لدى معظم العملاء، لكن حسابات {{client}} ما زالت تتعطل في نحو ثلث المحاولات." },
                ],
              },
              {
                id: "round2",
                situation:
                  "نحو الساعة 20:15. رسائل العملاء تتراكم: لدى {{report2}} 140 رسالة دون رد، وسؤال عمّا يُقال للناس. وما زال الوصول إلى {{manager}} متعذرًا، ولم يتحدث أحد مع {{exec}} بعد.",
                options: [
                  { id: "r2a", label: "الاتصال بـ{{exec}} الآن بملخص قصير وخطتك." },
                  { id: "r2b", label: "نشر رسالة على صفحة الحالة العامة، وتكليف {{report2}} بإرسال رد مؤقت إلى الجميع، والاتصال بـ{{exec}} حين تتضح الصورة." },
                  { id: "r2c", label: "تكليف {{report2}} بالرد على العملاء واحدًا واحدًا بدءًا بالأكثر غضبًا، وإحاطة {{manager}} في الساعة 22:00." },
                ],
                consequences: [
                  { optionId: "r2a", text: "يأتي الرد من {{exec}}، مع سؤالين حادين عن {{client}} وطلب تحديث كل 30 دقيقة. وتستمر الرسائل في التراكم وأنت على الهاتف." },
                  { optionId: "r2b", text: "تتباطأ الرسائل بعد النشر على صفحة الحالة. وفي الساعة 20:40 يصلك اتصال من {{exec}}: خبر العطل وصل عن طريق أحد العملاء، والسؤال الآن لماذا لم يتصل أحد." },
                  { optionId: "r2c", text: "في 30 دقيقة تحظى 25 رسالة برد من {{report2}}، بينما تصل 200 رسالة أخرى. وينشر عدد من العملاء علنًا أن {{company}} تتجاهلهم." },
                ],
              },
              {
                id: "round3",
                situation:
                  "نحو الساعة 20:45. تبدأ دورة طلبات {{client}} في الساعة 21:00، ويتصل مسؤول العمليات لديه ليسأل: هل يمكن تشغيلها بأمان؟ وتقدير {{report1}} أن احتمال حدوث بعض الأعطال خلال الدورة نحو 1 من 10، دون يقين.",
                options: [
                  { id: "r3a", label: "نصح {{client}} بتأجيل الدورة ساعتين ريثما يستقر النظام." },
                  { id: "r3b", label: "إطلاع {{client}} على الاحتمالات بصراحة وترك القرار للعميل، مع متابعة {{report1}} لطلباته مباشرةً." },
                  { id: "r3c", label: "طمأنة {{client}} بأن المضي آمن، لأن المشكلة الرئيسية احتُويت." },
                ],
                consequences: [
                  { optionId: "r3a", text: "تُؤجَّل الدورة على مضض، ويبقى موظفو مستودع {{client}} حتى وقت متأخر على نفقة {{client}}. وتعمل الدورة في الساعة 23:00 دون مشكلات." },
                  { optionId: "r3b", text: "تنطلق دورة {{client}} في الساعة 21:00. يتعطل نحو 3% من الطلبات، ويُعاد تشغيلها بحلول 22:30 بمساعدة {{report1}}. ويشكرك مسؤول العمليات على صراحتك، لكنه يطلب اجتماع مراجعة." },
                  { optionId: "r3c", text: "تعمل الدورة، ويتعطل نحو 3% من الطلبات. ويغضب مسؤول العمليات لدى {{client}} لأنه قيل له إن الأمر آمن، فيرسل رسالة إلى {{exec}} مع نسخة إلى مديره." },
                ],
              },
              {
                id: "round4",
                situation:
                  "الساعة 22:30. عادت الخدمة إلى طبيعتها، وصار الوصول إلى {{manager}} ممكنًا. مضت 14 ساعة على عمل {{report1}} و{{report2}}. والمنتظر تقديم ملخص لـ{{exec}} في الساعة 09:00 صباح الغد، و{{client}} يريد إجابات.",
                options: [
                  { id: "r4a", label: "صرف الجميع إلى منازلهم الآن، وكتابة ملخص وقائعي موجز بنفسك الليلة، وتحديد موعد مراجعة بعد ظهر الغد." },
                  { id: "r4b", label: "إبقاء {{report1}} ساعة أخرى لتوثيق السبب ما دامت التفاصيل حاضرة، وصرف {{report2}} إلى المنزل." },
                  { id: "r4c", label: "تسليم كل شيء إلى {{manager}} من الآن، والذهاب إلى المنزل." },
                ],
                consequences: [
                  { optionId: "r4a", text: "يصل ملخصك إلى {{exec}} في الساعة 08:00، ومعه طلب بمعرفة السبب الجذري بحلول الظهر. ويصل الفريق مرتاحًا." },
                  { optionId: "r4b", text: "يأتي توثيق {{report1}} للسبب واضحًا، لكن التأخر والإرهاق يظهران في اليوم التالي. وتتوفر للمراجعة ملاحظات دقيقة." },
                  { optionId: "r4c", text: "ينتقل الأمر إلى {{manager}} دون التفاصيل الكافية. ويأتي ملخص الساعة 09:00 ناقصًا، ويصلك اتصال من {{manager}} في الساعة 07:30 محمّلًا بالأسئلة." },
                ],
              },
            ],
          },
        },
        probe: {
          prompt: "اكتب الرسالة القصيرة (ثلاثة أسطر أو أربعة) التي ترسلها إلى {{exec}} في الساعة 22:30.",
        },
        twist: {
          change: "في صباح اليوم التالي تعلم أن بعض الطلبات المتعطلة خصمت مبالغ من العملاء دون أن يصلهم أي تأكيد.",
          prompt: "ماذا تفعل أولًا، ومن تُبلغ؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "adaptability.composure-under-pressure",
            anchors: [
              "Reacts impulsively round to round (e.g., promises {{client}} it is safe, ignores the guide) or freezes and decides nothing.",
              "Acts under pressure but loses an important thread, such as customer messages or {{client}}'s 21:00 cycle.",
              "Keeps a clear priority order each round (contain, communicate, protect {{client}}) and deals with the most urgent issue first.",
              "Separates immediate actions from those that can wait, communicates calmly with {{report1}}, {{report2}} and {{client}}, and keeps checks in place.",
              "Steadies the team with short, clear next steps, watches their fatigue, and plans recovery (summary, review) once service is restored.",
            ],
          },
          {
            competencyKey: "judgment.knowing-when-to-escalate",
            anchors: [
              "Never informs {{exec}}, or hands every decision upward without proposing any action.",
              "Informs {{exec}} late (after 20:40 or only via the automatic alert) or without saying what is needed.",
              "Calls {{exec}} promptly once a third of customers are affected, as the guide requires, with facts and a plan.",
              "Contains the issue within their own authority (rollback, status post) while escalating, and states clearly what they need from {{exec}}.",
              "Anticipates escalation needs, e.g., warns {{exec}} before {{client}}'s cycle with options and a recommendation, avoiding both surprise and alarm.",
            ],
          },
          {
            competencyKey: "collaboration.stakeholder-management",
            anchors: [
              "Focuses on the technical fix and ignores customers, {{client}} or {{exec}}.",
              "Updates stakeholders but treats them alike, e.g., the same message to {{client}} and the public.",
              "Identifies what {{client}}, customers, {{exec}} and the team each need, and keeps each informed at the right time.",
              "Anticipates conflicts (the rollback removing {{client}}'s fix, the 21:00 cycle) and manages expectations before surprises.",
              "Considers less obvious stakeholders ({{client}}'s warehouse staff, customers charged without confirmation) and protects the relationship beyond the evening.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Applies the guide's rule to phone {{exec}} immediately for incidents over 25%.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["25%", "guide", "rule 3", "immediately", "by phone", "a third", "الدليل", "25%", "فورًا", "هاتفيًا", "الثلث"],
          },
          {
            text: "Gives {{client}} honest odds rather than false assurance.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["1 in 10", "honest", "risk", "odds", "can't guarantee", "1 من 10", "بصراحة", "المخاطر", "احتمال", "لا أضمن"],
          },
          {
            text: "Looks after the team's fatigue after 14 hours.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["14 hours", "tired", "rest", "fatigue", "send home", "14 ساعة", "متعبين", "راحة", "إرهاق", "المنزل"],
          },
          {
            text: "Contains first by rolling back the likely cause.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["roll back", "rollback", "contain", "revert", "تراجع", "احتواء", "إلغاء التحديث"],
          },
        ],
        redFlags: [
          {
            text: "Waits for {{manager}} instead of escalating.",
            competencyKey: "judgment.knowing-when-to-escalate",
            keywords: ["wait until 22:00", "wait for the manager", "not urgent enough", "ننتظر المدير", "حتى الساعة 22:00", "ليس عاجلًا"],
          },
          {
            text: "Tells {{client}} it is safe despite the 1-in-10 risk.",
            competencyKey: "collaboration.stakeholder-management",
            keywords: ["it's safe", "guarantee", "no risk", "آمن تمامًا", "أضمن", "لا مخاطر"],
          },
          {
            text: "Focuses on blame during the incident.",
            competencyKey: "adaptability.composure-under-pressure",
            keywords: ["whose fault", "who broke", "blame", "من المسؤول عن الخطأ", "من أفسد", "لوم"],
          },
        ],
        embeddedDetail: {
          description:
            "Rule 3 of the on-call guide requires an immediate phone call to {{exec}} for incidents affecting more than 25% of customers; with about a third affected at 19:40, relying on the one-hour automatic alert breaks the guide.",
          location: "rule 3 of the on-call guide memo",
          keywords: ["25%", "rule 3", "immediately", "by phone", "25%", "فورًا", "هاتفيًا"],
        },
        optionNotes: [
          { optionId: "r1a", defensibleBecause: "Containment first, as the guide says; the timing points to the update.", cost: "Removes {{client}}'s fix without consulting them; the cause is still unconfirmed." },
          { optionId: "r1b", defensibleBecause: "Avoids an unnecessary rollback and keeps {{client}}'s fix if the update is not the cause.", cost: "The outage grows while you wait." },
          { optionId: "r1c", defensibleBecause: "Protects the fix {{client}} specifically asked for.", cost: "Slower and more complex; leaves the largest customer exposed." },
          { optionId: "r2a", defensibleBecause: "Required by the guide; {{exec}} hears it from you first.", cost: "Time away from coordination; adds 30-minute reporting load." },
          { optionId: "r2b", defensibleBecause: "Cuts inbound volume at scale and buys time to understand the picture.", cost: "Breaks the reporting rule; {{exec}} hears from a customer first." },
          { optionId: "r2c", defensibleBecause: "Gives the most upset customers a personal response.", cost: "Does not scale, no public message, no escalation; public criticism grows." },
          { optionId: "r3a", defensibleBecause: "Cautious and protects {{client}}'s orders.", cost: "{{client}}'s staff costs; probably unnecessary given a 9-in-10 chance it runs fine." },
          { optionId: "r3b", defensibleBecause: "Honest; respects {{client}}'s right to decide; live support reduces harm.", cost: "{{client}} carries the decision and some failures; may seem like passing the problem." },
          { optionId: "r3c", defensibleBecause: "Confident, avoids disruption, and is probably right 9 times in 10.", cost: "Misstates the uncertainty; serious loss of trust if failures occur." },
          { optionId: "r4a", defensibleBecause: "Protects the team's wellbeing and meets the 12-hour summary rule.", cost: "Some technical detail may fade overnight; you work late yourself." },
          { optionId: "r4b", defensibleBecause: "Captures the cause while details are fresh.", cost: "Extends a 14-hour day for {{report1}}; fatigue risk next day." },
          { optionId: "r4c", defensibleBecause: "{{manager}} is now available and more senior.", cost: "Context is lost; {{manager}} is unprepared; looks like stepping away from the outcome." },
        ],
        probeTargets: ["judgment.knowing-when-to-escalate", "collaboration.stakeholder-management"],
        twistTargets: ["adaptability.composure-under-pressure"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "chain-02-slipping-deadlines",
    type: "CONSEQUENCE_CHAIN",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["management.performance-management", "adaptability.learning-speed"],
    roleFamilies: [],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "The slipping deadlines",
        scenario:
          "{{report2}} joined your team eight months ago. Recently, deadlines have started slipping, and two colleagues have quietly redone parts of {{report2}}'s work. This chain covers the next four months. In each round you choose what to do; what happens next depends partly on your choice. {{report2}}'s recent record is in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "{{report2}}'s deadlines, last three months",
            caption: "Days are working days of each month.",
            columns: [
              { key: "task", label: "Task" },
              { key: "due", label: "Due" },
              { key: "delivered", label: "Delivered" },
              { key: "notes", label: "Notes" },
            ],
            rows: [
              { task: "Monthly summary for {{client}}", due: "Day 5", delivered: "Day 9", notes: "" },
              { task: "Data check for {{peer}}", due: "Day 12", delivered: "Day 12", notes: "Good quality, according to {{peer}}" },
              { task: "Monthly summary for {{client}}", due: "Day 5", delivered: "Day 11", notes: "" },
              { task: "Process write-up", due: "Day 20", delivered: "Day 26", notes: "" },
              { task: "Monthly summary for {{client}}", due: "Day 5", delivered: "Day 10", notes: "Finance data arrived on Day 6" },
              { task: "Data check for {{peer}}", due: "Day 12", delivered: "Day 11", notes: "" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "In each round, choose what you do and briefly say why.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation: "Month 1. You have not yet discussed the slipping deadlines with {{report2}}. {{report1}} mentions that the team is getting frustrated.",
                options: [
                  { id: "r1a", label: "Meet {{report2}} this week, go through the specific late deliveries, and ask what is getting in the way." },
                  { id: "r1b", label: "Quietly move the monthly summary to {{report1}} for now, and raise the issue with {{report2}} later." },
                  { id: "r1c", label: "Wait for the mid-year review in six weeks and raise it formally, with the full record." },
                ],
                consequences: [
                  { optionId: "r1a", text: "{{report2}} is defensive at first, then says the monthly summary is always hard because some data arrives late. You agree to look into it; {{report2}} commits to warning you early about delays." },
                  { optionId: "r1b", text: "{{report1}} takes the summary on top of a full workload. {{report2}} notices and asks you, hurt, whether something is wrong." },
                  { optionId: "r1c", text: "Nothing changes for six weeks. Two more deadlines slip, and a colleague complains openly in a team meeting." },
                ],
              },
              {
                id: "round2",
                situation: "Month 2. The monthly summary for {{client}} is late again, and {{client}} complains to {{manager}}. {{manager}} asks you what is going on.",
                options: [
                  { id: "r2a", label: "Tell {{manager}} you are working on it with {{report2}}, and take responsibility for the late summary yourself." },
                  { id: "r2b", label: "Explain to {{manager}} that {{report2}} is struggling and that you are dealing with it." },
                  { id: "r2c", label: "Ask {{specialist}} in finance why the data arrives when it does, before you reply to {{manager}}." },
                ],
                consequences: [
                  { optionId: "r2a", text: "{{manager}} accepts this but wants a clear plan by the end of the week." },
                  { optionId: "r2b", text: "{{manager}} asks whether {{report2}} is in the right role. Word gets back to {{report2}} that their name came up." },
                  { optionId: "r2c", text: "{{specialist}} says finance data is never ready before Day 6. {{manager}} is impatient at waiting a day for your reply." },
                ],
              },
              {
                id: "round3",
                situation:
                  "Month 3. It is now clear that finance data is never ready before Day 6, a day after the summary's Day 5 deadline. {{report2}}'s other work is mostly on time, but {{report2}} still rarely warns you in advance when something will be late.",
                options: [
                  { id: "r3a", label: "Move the summary deadline to Day 8 with {{client}}'s agreement, and agree a clear rule with {{report2}}: flag any risk to a deadline at least two days ahead." },
                  { id: "r3b", label: "Keep the Day 5 deadline and ask {{report2}} to send a draft based on estimates, updated when the data arrives." },
                  { id: "r3c", label: "Start a formal improvement plan with {{report2}}, focused on early warnings, with monthly reviews." },
                ],
                consequences: [
                  { optionId: "r3a", text: "{{client}} agrees to Day 8 once you explain why. {{report2}} meets the next two deadlines and flags one risk early." },
                  { optionId: "r3b", text: "{{report2}} sends a draft on Day 5 with two estimated figures that later change. {{client}} asks why the numbers moved." },
                  { optionId: "r3c", text: "{{report2}} is shaken and becomes very cautious, checking everything with you. Work is on time, but your own workload rises." },
                ],
              },
              {
                id: "round4",
                situation:
                  "Month 4. A similar pattern appears elsewhere in your team: {{report1}}'s weekly report is often late, and {{report1}} says it depends on another team's data.",
                options: [
                  { id: "r4a", label: "Check the dependency first: when does the other team's data actually arrive, compared with the deadline?" },
                  { id: "r4b", label: "Talk to {{report1}} directly about the late reports, as you would with anyone, and agree a fix." },
                  { id: "r4c", label: "Let it go for now: {{report1}} is your strongest performer and usually sorts things out." },
                ],
                consequences: [
                  { optionId: "r4a", text: "The data arrives a day after the deadline. One conversation with the other team settles a new timetable." },
                  { optionId: "r4b", text: "{{report1}} agrees to try harder, but the reports keep slipping because the data timing has not changed." },
                  { optionId: "r4c", text: "Two more reports slip. {{report2}} notices that you treated the same problem differently and says so." },
                ],
              },
            ],
          },
        },
        probe: {
          prompt: "Across the four months, what did you learn that you would apply from the start next time?",
        },
        twist: {
          change: "In month 4 you learn that {{report2}} has been caring for a seriously ill family member since month 1 and did not want to tell anyone.",
          prompt: "Looking back, what would you have done differently, and what do you do now?",
        },
      },
      ar: {
        title: "المواعيد التي تفلت",
        scenario:
          "مضت ثمانية أشهر على انضمام {{report2}} إلى فريقك. وفي الآونة الأخيرة بدأت المواعيد تفوت، وأعاد زميلان بهدوء إنجاز أجزاء من عمل {{report2}}. تغطي هذه السلسلة الأشهر الأربعة القادمة. في كل جولة تختار ما تفعله، وما يحدث بعدها يتوقف جزئيًا على اختيارك. تجد سجل {{report2}} الأخير ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "مواعيد {{report2}} خلال الأشهر الثلاثة الماضية",
            caption: "الأيام هي أيام العمل من كل شهر.",
            columns: [
              { key: "task", label: "المهمة" },
              { key: "due", label: "الموعد" },
              { key: "delivered", label: "التسليم" },
              { key: "notes", label: "ملاحظات" },
            ],
            rows: [
              { task: "الملخص الشهري لـ{{client}}", due: "اليوم 5", delivered: "اليوم 9", notes: "" },
              { task: "تدقيق بيانات لـ{{peer}}", due: "اليوم 12", delivered: "اليوم 12", notes: "جودة جيدة بحسب {{peer}}" },
              { task: "الملخص الشهري لـ{{client}}", due: "اليوم 5", delivered: "اليوم 11", notes: "" },
              { task: "توثيق إجراءات العمل", due: "اليوم 20", delivered: "اليوم 26", notes: "" },
              { task: "الملخص الشهري لـ{{client}}", due: "اليوم 5", delivered: "اليوم 10", notes: "وصلت بيانات الإدارة المالية في اليوم 6" },
              { task: "تدقيق بيانات لـ{{peer}}", due: "اليوم 12", delivered: "اليوم 11", notes: "" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "في كل جولة، اختر ما تفعله واذكر السبب باختصار.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation: "الشهر 1. لم تناقش بعد مع {{report2}} مسألة المواعيد الفائتة. وبحسب {{report1}}، بدأ الإحباط يتسلل إلى الفريق.",
                options: [
                  { id: "r1a", label: "لقاء {{report2}} هذا الأسبوع، ومراجعة حالات التأخير المحددة، والسؤال عمّا يعيق العمل." },
                  { id: "r1b", label: "نقل الملخص الشهري بهدوء إلى {{report1}} مؤقتًا، وإثارة المسألة مع {{report2}} لاحقًا." },
                  { id: "r1c", label: "انتظار مراجعة منتصف العام بعد ستة أسابيع وطرح المسألة رسميًا مع السجل الكامل." },
                ],
                consequences: [
                  { optionId: "r1a", text: "يبدأ الحديث متحفظًا، ثم يتضح من كلام {{report2}} أن الملخص الشهري صعب دائمًا لأن بعض البيانات تصل متأخرة. تتفقان على أن تبحث في الأمر، مع التزام من {{report2}} بإبلاغك مبكرًا عن أي تأخير." },
                  { optionId: "r1b", text: "ينتقل الملخص إلى {{report1}} فوق عبء عمل مكتمل. ولا يخفى الأمر على {{report2}}، فيصلك سؤال مُرّ: هل هناك خطب ما؟" },
                  { optionId: "r1c", text: "لا يتغير شيء طوال ستة أسابيع. يفوت موعدان آخران، ويشتكي أحد الزملاء علنًا في اجتماع الفريق." },
                ],
              },
              {
                id: "round2",
                situation: "الشهر 2. يتأخر الملخص الشهري لـ{{client}} مرة أخرى، وتصل شكوى من {{client}} إلى {{manager}}، ثم يصلك سؤال من {{manager}} عمّا يجري.",
                options: [
                  { id: "r2a", label: "إبلاغ {{manager}} بأنك تعمل على الأمر مع {{report2}}، وتحمّل مسؤولية تأخر الملخص بنفسك." },
                  { id: "r2b", label: "شرح الأمر لـ{{manager}}: الصعوبات لدى {{report2}}، وأنت تعالج المسألة." },
                  { id: "r2c", label: "سؤال {{specialist}} في الإدارة المالية عن سبب توقيت وصول البيانات، قبل الرد على {{manager}}." },
                ],
                consequences: [
                  { optionId: "r2a", text: "يأتي القبول من {{manager}}، مع طلب خطة واضحة بنهاية الأسبوع." },
                  { optionId: "r2b", text: "يُطرح من {{manager}} سؤال: هل {{report2}} في الدور المناسب؟ ثم يصل إلى {{report2}} خبر طرح الاسم في النقاش." },
                  { optionId: "r2c", text: "إفادة {{specialist}}: بيانات الإدارة المالية لا تجهز أبدًا قبل اليوم 6. ويظهر نفاد الصبر لدى {{manager}} لانتظار ردك يومًا كاملًا." },
                ],
              },
              {
                id: "round3",
                situation:
                  "الشهر 3. اتضح الآن أن بيانات الإدارة المالية لا تجهز قبل اليوم 6، أي بعد يوم من موعد الملخص في اليوم 5. ومعظم أعمال {{report2}} الأخرى تُسلَّم في موعدها، لكن التنبيه المسبق حين يوشك شيء على التأخر ما زال نادرًا.",
                options: [
                  { id: "r3a", label: "نقل موعد الملخص إلى اليوم 8 بموافقة {{client}}، والاتفاق مع {{report2}} على قاعدة واضحة: التنبيه إلى أي خطر على موعد قبل يومين على الأقل." },
                  { id: "r3b", label: "الإبقاء على موعد اليوم 5، وطلب مسودة من {{report2}} مبنية على تقديرات تُحدَّث حين تصل البيانات." },
                  { id: "r3c", label: "بدء خطة تحسين رسمية مع {{report2}} تركز على التنبيه المبكر، مع مراجعات شهرية." },
                ],
                consequences: [
                  { optionId: "r3a", text: "تأتي موافقة {{client}} على اليوم 8 بعد أن تشرح السبب. ويُسلَّم العمل في الموعدين التاليين، مع تنبيه مبكر من {{report2}} إلى خطر واحد." },
                  { optionId: "r3b", text: "تصل من {{report2}} مسودة في اليوم 5 فيها رقمان تقديريان يتغيران لاحقًا، ثم يأتي سؤال من {{client}}: لماذا تغيرت الأرقام؟" },
                  { optionId: "r3c", text: "تهتز ثقة {{report2}}، ويحل الحذر الشديد ومراجعتك في كل صغيرة وكبيرة. يُسلَّم العمل في موعده، لكن عبء عملك أنت يزداد." },
                ],
              },
              {
                id: "round4",
                situation: "الشهر 4. يظهر نمط مشابه في جزء آخر من فريقك: التقرير الأسبوعي لـ{{report1}} يتأخر كثيرًا، والتفسير المقدَّم أنه يعتمد على بيانات فريق آخر.",
                options: [
                  { id: "r4a", label: "التحقق من الاعتماد أولًا: متى تصل بيانات الفريق الآخر فعلًا مقارنة بالموعد؟" },
                  { id: "r4b", label: "التحدث مع {{report1}} مباشرة عن التقارير المتأخرة كما تفعل مع أي شخص، والاتفاق على حل." },
                  { id: "r4c", label: "ترك الأمر حاليًا: فأداء {{report1}} هو الأفضل في فريقك، والأمور تُحَل عادةً دون تدخل." },
                ],
                consequences: [
                  { optionId: "r4a", text: "تصل البيانات بعد الموعد بيوم. ويكفي حديث واحد مع الفريق الآخر للاتفاق على جدول زمني جديد." },
                  { optionId: "r4b", text: "يأتي وعد من {{report1}} ببذل جهد أكبر، لكن التقارير تواصل التأخر لأن توقيت البيانات لم يتغير." },
                  { optionId: "r4c", text: "يتأخر تقريران آخران. ولا تفوت {{report2}} ملاحظة أنك تعاملت مع المشكلة نفسها بطريقة مختلفة، فيأتي التعليق صريحًا." },
                ],
              },
            ],
          },
        },
        probe: {
          prompt: "على امتداد الأشهر الأربعة، ما الذي تعلمته وستطبقه من البداية في المرة القادمة؟",
        },
        twist: {
          change: "في الشهر 4 تعلم أن على {{report2}} منذ الشهر 1 رعاية فرد من الأسرة مصاب بمرض خطير، مع رغبة في عدم إخبار أحد.",
          prompt: "بالنظر إلى الوراء، ما الذي كنت ستفعله بشكل مختلف، وماذا تفعل الآن؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.performance-management",
            anchors: [
              "Ignores the slipping deadlines, or responds with blame or threats without asking why.",
              "Raises the issue in general terms, without the specific late deliveries or agreed next steps.",
              "Uses specific examples, explores causes with {{report2}}, and agrees expectations (e.g., flag risks early) with a follow-up date.",
              "Separates the system cause (finance data on Day 6) from {{report2}}'s part (not warning early), tailors the response, and recognises good work.",
              "Fixes the team condition (a deadline set before the data exists) as well as {{report2}}'s part, and checks for the same cause elsewhere.",
            ],
          },
          {
            competencyKey: "adaptability.learning-speed",
            anchors: [
              "Repeats in round 4 the approach that failed earlier, treating a data-timing problem as a matter of personal effort.",
              "Corrects course with {{report2}} once the cause is found, but does not carry the lesson to {{report1}}'s similar case.",
              "Applies the lesson from {{report2}}'s case in round 4 by checking the data dependency first.",
              "Generalises the lesson (check dependencies before judging individuals) and treats {{report1}} and {{report2}} consistently.",
              "States the principle learned, refines their approach explicitly across rounds, and proposes a team-wide check of deadlines against data timing.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots that finance data arrives on Day 6, after the Day 5 deadline.",
            competencyKey: "management.performance-management",
            keywords: ["day 6", "finance", "after the deadline", "impossible", "data arrives", "اليوم 6", "المالية", "بعد الموعد", "مستحيل", "وصول البيانات"],
          },
          {
            text: "Uses specific examples and agrees a follow-up.",
            competencyKey: "management.performance-management",
            keywords: ["specific", "example", "follow-up", "agree", "check in", "أمثلة", "محددة", "متابعة", "نتفق"],
          },
          {
            text: "Applies the earlier lesson to {{report1}}'s case in round 4.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["same pattern", "dependency", "check first", "like before", "learned", "النمط نفسه", "الاعتماد", "أتحقق أولًا", "كما في السابق", "تعلمت"],
          },
          {
            text: "Treats both team members by the same standard.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["consistent", "same standard", "fair", "treat both", "الاتساق", "المعيار نفسه", "عادل", "كليهما"],
          },
        ],
        redFlags: [
          {
            text: "Attributes the delays to {{report2}}'s attitude.",
            competencyKey: "management.performance-management",
            keywords: ["lazy", "careless", "attitude", "not committed", "متكاسل", "مهمل", "غير ملتزم", "موقفه"],
          },
          {
            text: "Lets the strong performer off where the struggling one was challenged.",
            competencyKey: "adaptability.learning-speed",
            keywords: ["strongest performer", "let it go", "usually sorts", "الأفضل أداءً", "أتركه", "يتدبر الأمور"],
          },
          {
            text: "Avoids the conversation by moving work quietly.",
            competencyKey: "management.performance-management",
            keywords: ["move it quietly", "avoid", "wait for the review", "أنقل العمل بهدوء", "أتجنب", "أنتظر المراجعة"],
          },
        ],
        embeddedDetail: {
          description:
            "One note in {{report2}}'s record shows finance data arrived on Day 6 for a summary due on Day 5: the deadline falls before the data exists, so the late summaries are partly a system problem, not only a personal one.",
          location: "notes column of the third 'Monthly summary' row",
          keywords: ["day 6", "finance", "day 5", "اليوم 6", "المالية", "اليوم 5"],
        },
        optionNotes: [
          { optionId: "r1a", defensibleBecause: "Specific and timely; seeks the cause before judging.", cost: "May feel confronting; takes time; the cause is not yet known." },
          { optionId: "r1b", defensibleBecause: "Protects the client deliverable immediately.", cost: "Overloads {{report1}}; avoids the conversation; {{report2}} feels sidelined; hides the real problem." },
          { optionId: "r1c", defensibleBecause: "Formal, fair, with a full record.", cost: "Six weeks' delay; the problem grows; team frustration rises." },
          { optionId: "r2a", defensibleBecause: "Owns the issue and protects {{report2}}.", cost: "You absorb the blame; you need a credible plan quickly." },
          { optionId: "r2b", defensibleBecause: "Honest about where the problem shows up.", cost: "Exposes {{report2}} to senior scrutiny; may label them; risks trust." },
          { optionId: "r2c", defensibleBecause: "Checks for a system cause before replying.", cost: "Delays the reply to {{manager}}; can look slow." },
          { optionId: "r3a", defensibleBecause: "Fixes the root cause and sets a clear expectation.", cost: "Needs {{client}}'s agreement; moves a promised date." },
          { optionId: "r3b", defensibleBecause: "Keeps the date {{client}} is used to.", cost: "Estimates cause confusion and extra work; burden falls on {{report2}}." },
          { optionId: "r3c", defensibleBecause: "Gives formal structure to the remaining behaviour gap.", cost: "Heavy-handed for a partly systemic problem; harms confidence; adds to your load." },
          { optionId: "r4a", defensibleBecause: "Applies the lesson: check the system first.", cost: "May delay addressing behaviour if the dependency is not the cause." },
          { optionId: "r4b", defensibleBecause: "Consistent and direct.", cost: "Repeats the earlier mistake of treating a timing problem as personal." },
          { optionId: "r4c", defensibleBecause: "Trusts a strong performer's judgement.", cost: "Inconsistent treatment; the problem persists; fairness suffers." },
        ],
        probeTargets: ["adaptability.learning-speed"],
        twistTargets: ["management.performance-management"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "chain-03-mid-year-cut",
    type: "CONSEQUENCE_CHAIN",
    difficulty: 5,
    dials: { ambiguity: 5, stakeholders: 5, conflictingConstraints: 5, stakes: 5, timePressure: 4, informationGaps: 4 },
    targets: ["management.resource-allocation", "adaptability.handling-new-information", "leadership.setting-direction"],
    roleFamilies: [],
    minutes: 9,
    storyPhase: "late",
    content: {
      en: {
        title: "The mid-year cut",
        scenario:
          "Halfway through the year, {{exec}} tells you your department's remaining budget will be cut by 20%, from next month. You lead three programmes: a customer-app upgrade, a staff-skills programme and a cost-reduction project. Your team of 14 has heard rumours. Over four rounds you will decide how to respond as the situation develops; each choice shapes what follows. The budget figures are in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Remaining budget for the year",
            caption: "Committed amounts are under signed contracts and cannot be reduced.",
            columns: [
              { key: "programme", label: "Programme" },
              { key: "remaining", label: "Remaining", numeric: true },
              { key: "committed", label: "Committed", numeric: true },
              { key: "benefit", label: "Expected benefit" },
            ],
            rows: [
              { programme: "Customer-app upgrade", remaining: 500000, committed: 300000, benefit: "Keeps customers; {{client}} has asked for two of the new features" },
              { programme: "Staff-skills programme", remaining: 200000, committed: 50000, benefit: "Builds team capability" },
              { programme: "Cost-reduction project", remaining: 300000, committed: 100000, benefit: "Saves about 400,000 a year from next year" },
              { programme: "Total", remaining: 1000000, committed: 450000, benefit: "" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "In each round, choose what you do and briefly say why.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation: "Week 1. You must tell {{exec}} by Friday where the 200,000 cut will come from.",
                options: [
                  { id: "r1a", label: "Cut each programme by 20% (100,000; 40,000; 60,000)." },
                  { id: "r1b", label: "Protect the cost-reduction project fully; take 140,000 from the app upgrade and 60,000 from the skills programme." },
                  { id: "r1c", label: "Pause the skills programme's uncommitted 150,000, and take the remaining 50,000 from the app upgrade." },
                ],
                consequences: [
                  { optionId: "r1a", text: "{{exec}} accepts but asks why the cost-reduction project, which pays for itself, was cut. Each programme lead says their plan no longer works at 80%." },
                  { optionId: "r1b", text: "The cost-reduction project stays on track. The app upgrade loses the two features {{client}} asked for, and {{client}}'s account team is worried." },
                  { optionId: "r1c", text: "The app upgrade and cost-reduction project stay largely intact. Three staff due to start training are disappointed; one asks whether development still matters here." },
                ],
              },
              {
                id: "round2",
                situation: "Week 3. The team is anxious. In a team meeting, people ask whether jobs are at risk and what the department's priorities now are.",
                options: [
                  { id: "r2a", label: "Explain the cut openly: what you decided, why, and the three things the department will focus on for the rest of the year." },
                  { id: "r2b", label: "Tell the team you do not expect job losses, and keep the details of the cut between you and the programme leads." },
                  { id: "r2c", label: "Ask each programme lead to brief their own people, using a one-page summary you write." },
                ],
                consequences: [
                  { optionId: "r2a", text: "Questions continue, but rumours die down. Two people volunteer ideas for saving money. One senior person tells you privately they disagree with your priorities." },
                  { optionId: "r2b", text: "The meeting is calm. A week later the details of the cut leak, and some people feel misled." },
                  { optionId: "r2c", text: "Messages differ between leads: one presents the cut as 'temporary', another as 'the new normal'." },
                ],
              },
              {
                id: "round3",
                situation:
                  "Week 6. New information: {{specialist}} reports that the cost-reduction project will save about 250,000 a year, not 400,000, because a supplier price rise was missed. Separately, {{client}} says they will renew a large contract only if the app upgrade includes the two features they asked for.",
                options: [
                  { id: "r3a", label: "Move 100,000 from the cost-reduction project to the app upgrade to deliver the two features." },
                  { id: "r3b", label: "Keep the current allocation, and ask {{client}} whether the features can come three months later." },
                  { id: "r3c", label: "Ask {{exec}} for 100,000 from the central reserve, using {{client}}'s renewal as the case." },
                ],
                consequences: [
                  { optionId: "r3a", text: "The features are on plan. The cost-reduction project slips by two months, and its lead feels the project has been sacrificed twice." },
                  { optionId: "r3b", text: "{{client}} accepts a three-month delay but asks for a 5% discount on the renewal." },
                  { optionId: "r3c", text: "{{exec}} agrees to 60,000, not 100,000, and asks you to show the renewal's value in writing. You must find the other 40,000." },
                ],
              },
              {
                id: "round4",
                situation: "Week 10. {{exec}} asks for a one-page plan for next year, warning that budgets may be cut again.",
                options: [
                  { id: "r4a", label: "Plan for two scenarios, a flat budget and a further 15% cut, with clear triggers for each." },
                  { id: "r4b", label: "Build the plan on a flat budget and argue strongly that a further cut would damage results." },
                  { id: "r4c", label: "Plan for the further cut now, to avoid another painful change mid-year." },
                ],
                consequences: [
                  { optionId: "r4a", text: "{{exec}} calls the plan 'realistic' but asks you to fit it on one page instead of two." },
                  { optionId: "r4b", text: "{{exec}} respects the argument but points out that you have not shown what you would do if the cut came." },
                  { optionId: "r4c", text: "The plan is safe, but the team sees no growth ahead; one strong performer starts looking elsewhere." },
                ],
              },
            ],
          },
        },
        probe: {
          prompt: "Write the three main points you would tell your team about the department's direction for the rest of the year.",
        },
        twist: {
          change: "{{exec}} tells you the 20% cut will be reversed in two months if the company hits its sales target, which is uncertain.",
          prompt: "How, if at all, do you change your plan and your message to the team?",
        },
      },
      ar: {
        title: "تخفيض منتصف العام",
        scenario:
          "في منتصف العام يصلك من {{exec}} أن الميزانية المتبقية لقسمك ستُخفَّض بنسبة 20% اعتبارًا من الشهر القادم. تقود ثلاثة برامج: تطوير تطبيق العملاء، وبرنامج مهارات الموظفين، ومشروع خفض التكاليف. وقد سمع فريقك المكوَّن من 14 شخصًا شائعات. على مدى أربع جولات ستقرر كيف تستجيب مع تطور الموقف، وكل اختيار يشكّل ما يليه. تجد أرقام الميزانية ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "الميزانية المتبقية للعام",
            caption: "المبالغ الملتزم بها مرتبطة بعقود موقّعة ولا يمكن تخفيضها.",
            columns: [
              { key: "programme", label: "البرنامج" },
              { key: "remaining", label: "المتبقي", numeric: true },
              { key: "committed", label: "الملتزم به", numeric: true },
              { key: "benefit", label: "الفائدة المتوقعة" },
            ],
            rows: [
              { programme: "تطوير تطبيق العملاء", remaining: 500000, committed: 300000, benefit: "يحافظ على العملاء؛ ميزتان من الميزات الجديدة مطلوبتان من {{client}}" },
              { programme: "برنامج مهارات الموظفين", remaining: 200000, committed: 50000, benefit: "يبني قدرات الفريق" },
              { programme: "مشروع خفض التكاليف", remaining: 300000, committed: 100000, benefit: "يوفر نحو 400,000 سنويًا اعتبارًا من العام القادم" },
              { programme: "الإجمالي", remaining: 1000000, committed: 450000, benefit: "" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "في كل جولة، اختر ما تفعله واذكر السبب باختصار.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation: "الأسبوع 1. عليك أن تبلغ {{exec}} قبل يوم الجمعة من أين سيأتي التخفيض البالغ 200,000.",
                options: [
                  { id: "r1a", label: "تخفيض كل برنامج بنسبة 20% (100,000؛ و40,000؛ و60,000)." },
                  { id: "r1b", label: "حماية مشروع خفض التكاليف بالكامل، واقتطاع 140,000 من تطوير التطبيق و60,000 من برنامج المهارات." },
                  { id: "r1c", label: "إيقاف المبلغ غير الملتزم به في برنامج المهارات (150,000)، واقتطاع الـ50,000 الباقية من تطوير التطبيق." },
                ],
                consequences: [
                  { optionId: "r1a", text: "تأتي موافقة {{exec}} مع سؤال: لماذا خُفّض مشروع خفض التكاليف، وهو يغطي تكلفته بنفسه؟ ويقول كل قائد برنامج إن خطته لم تعد صالحة بنسبة 80%." },
                  { optionId: "r1b", text: "يبقى مشروع خفض التكاليف على المسار. ويفقد تطوير التطبيق الميزتين المطلوبتين من {{client}}، ويقلق فريق حساب {{client}}." },
                  { optionId: "r1c", text: "يبقى تطوير التطبيق ومشروع خفض التكاليف سليمين إلى حد كبير. ويخيب أمل ثلاثة موظفين كان مقررًا أن يبدؤوا التدريب، ويسأل أحدهم إن كان التطوير المهني ما زال يهم هنا." },
                ],
              },
              {
                id: "round2",
                situation: "الأسبوع 3. القلق يسود الفريق. وفي اجتماع للفريق يسأل الموظفون إن كانت الوظائف مهددة، وما أولويات القسم الآن.",
                options: [
                  { id: "r2a", label: "شرح التخفيض بصراحة: ما الذي قررته ولماذا، والأمور الثلاثة التي سيركز عليها القسم في بقية العام." },
                  { id: "r2b", label: "إبلاغ الفريق بأنك لا تتوقع فقدان وظائف، وإبقاء تفاصيل التخفيض بينك وبين قادة البرامج." },
                  { id: "r2c", label: "تكليف كل قائد برنامج بإحاطة فريقه، استنادًا إلى ملخص من صفحة واحدة تكتبه أنت." },
                ],
                consequences: [
                  { optionId: "r2a", text: "تستمر الأسئلة، لكن الشائعات تخفت. ويتطوع شخصان بأفكار لتوفير المال. ويخبرك أحد كبار الموظفين على انفراد بأنه يختلف مع أولوياتك." },
                  { optionId: "r2b", text: "يمر الاجتماع بهدوء. وبعد أسبوع تتسرب تفاصيل التخفيض، ويشعر بعض الموظفين بأنهم ضُلّلوا." },
                  { optionId: "r2c", text: "تختلف الرسائل بين القادة: أحدهم يقدّم التخفيض على أنه «مؤقت»، وآخر على أنه «الوضع الطبيعي الجديد»." },
                ],
              },
              {
                id: "round3",
                situation:
                  "الأسبوع 6. معلومات جديدة: يفيد تقرير {{specialist}} بأن مشروع خفض التكاليف سيوفر نحو 250,000 سنويًا لا 400,000، لأن زيادة في أسعار أحد الموردين لم تُحتسب. ومن جهة أخرى، يرتبط تجديد عقد كبير مع {{client}} بأن يتضمن تطوير التطبيق الميزتين المطلوبتين.",
                options: [
                  { id: "r3a", label: "نقل 100,000 من مشروع خفض التكاليف إلى تطوير التطبيق لتنفيذ الميزتين." },
                  { id: "r3b", label: "الإبقاء على التوزيع الحالي، وسؤال {{client}} إن كان يمكن تأخير الميزتين ثلاثة أشهر." },
                  { id: "r3c", label: "طلب 100,000 من الاحتياطي المركزي من {{exec}}، مع الاستناد إلى تجديد عقد {{client}}." },
                ],
                consequences: [
                  { optionId: "r3a", text: "تعود الميزتان إلى الخطة. ويتأخر مشروع خفض التكاليف شهرين، ويشعر قائده بأن المشروع ضُحّي به مرتين." },
                  { optionId: "r3b", text: "يأتي قبول {{client}} للتأخير ثلاثة أشهر، مقابل طلب خصم بنسبة 5% على التجديد." },
                  { optionId: "r3c", text: "تأتي موافقة {{exec}} على 60,000 لا 100,000، مع طلب إثبات قيمة التجديد كتابيًا. وعليك أن تجد الـ40,000 الباقية." },
                ],
              },
              {
                id: "round4",
                situation: "الأسبوع 10. يصلك طلب من {{exec}}: خطة من صفحة واحدة للعام القادم، مع تحذير من احتمال تخفيض الميزانيات مجددًا.",
                options: [
                  { id: "r4a", label: "التخطيط لسيناريوهين، ميزانية ثابتة وتخفيض إضافي بنسبة 15%، مع مؤشرات واضحة لكل منهما." },
                  { id: "r4b", label: "بناء الخطة على ميزانية ثابتة، والدفاع بقوة عن أن أي تخفيض إضافي سيضر بالنتائج." },
                  { id: "r4c", label: "التخطيط للتخفيض الإضافي من الآن، تجنبًا لتغيير مؤلم آخر في منتصف العام." },
                ],
                consequences: [
                  { optionId: "r4a", text: "يأتي وصف {{exec}} للخطة بأنها «واقعية»، مع طلب اختصارها إلى صفحة واحدة بدلًا من صفحتين." },
                  { optionId: "r4b", text: "تحظى الحجة بتقدير {{exec}}، لكن الملاحظة أنك لم تبيّن ما ستفعله إن وقع التخفيض." },
                  { optionId: "r4c", text: "الخطة آمنة، لكن الفريق لا يرى أفقًا للنمو، ويبدأ أحد المتميزين في البحث عن عمل آخر." },
                ],
              },
            ],
          },
        },
        probe: {
          prompt: "اكتب النقاط الثلاث الرئيسية التي ستقولها لفريقك عن توجه القسم في بقية العام.",
        },
        twist: {
          change: "تعلم من {{exec}} أن تخفيض الـ20% سيُلغى بعد شهرين إذا حققت الشركة هدف المبيعات، وتحقيقه غير مؤكد.",
          prompt: "هل تغيّر خطتك ورسالتك إلى الفريق؟ وإن غيّرتهما، فكيف؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "management.resource-allocation",
            anchors: [
              "Cuts every programme by 20% by default, ignoring committed spend and expected returns.",
              "Recognises limits but protects the most visible programme rather than the most valuable one.",
              "Allocates the cut by priorities and returns, within the 550,000 that is uncommitted, and states what is under-funded.",
              "Compares the return of alternatives (cost-reduction savings versus {{client}}'s renewal) and keeps something in reserve for surprises.",
              "Sees the cut equals about 36% of uncommitted money, redirects resources from low-value work, and counts the cost of stopping and restarting.",
            ],
          },
          {
            competencyKey: "adaptability.handling-new-information",
            anchors: [
              "Keeps the week-1 allocation after learning savings are 250,000 and {{client}}'s renewal depends on the features.",
              "Notes the new information but makes a token change, or reverses everything.",
              "Assesses what the revised savings and {{client}}'s condition change, and updates the affected parts of the allocation.",
              "Checks the reliability of the revised estimate and of {{client}}'s condition before moving money, and explains what changed in their thinking.",
              "Updates in proportion and draws further implications, e.g., what the missed supplier price rise says about other estimates.",
            ],
          },
          {
            competencyKey: "leadership.setting-direction",
            anchors: [
              "Gives the team no clear priorities after the cut, or lists tasks without purpose.",
              "States priorities vaguely ('we'll do our best with less') without linking them to the cut.",
              "States clear priorities for the rest of the year, why they matter, and how the team's work connects to them.",
              "Defines what is in and out of scope after the cut, so leads can make aligned decisions without checking back.",
              "Turns the confusion into a direction people can act on, and anticipates how it must shift if budgets change again.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Recognises the cut must come from uncommitted money (550,000), about 36% of what is flexible.",
            competencyKey: "management.resource-allocation",
            keywords: ["committed", "uncommitted", "550,000", "contracts", "36%", "الملتزم به", "غير الملتزم", "550,000", "العقود", "36%"],
          },
          {
            text: "Weighs returns: the self-funding project and {{client}}'s renewal.",
            competencyKey: "management.resource-allocation",
            keywords: ["payback", "savings", "renewal", "return", "pays for itself", "العائد", "الوفورات", "التجديد", "يغطي تكلفته"],
          },
          {
            text: "Updates the allocation when savings are revised to 250,000.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["250,000", "revised", "supplier price", "update", "re-check", "250,000", "معدّل", "سعر المورد", "تحديث", "أعيد التحقق"],
          },
          {
            text: "Gives the team clear priorities and what stops.",
            competencyKey: "leadership.setting-direction",
            keywords: ["three priorities", "focus", "why", "what stops", "out of scope", "ثلاث أولويات", "التركيز", "لماذا", "ما سيتوقف", "خارج النطاق"],
          },
          {
            text: "Plans for scenarios with triggers.",
            competencyKey: "leadership.setting-direction",
            keywords: ["scenario", "trigger", "if the budget", "if the target", "سيناريو", "مؤشر", "إذا خُفّضت", "إذا تحقق الهدف"],
          },
        ],
        redFlags: [
          {
            text: "Cuts equally by default to be 'fair'.",
            competencyKey: "management.resource-allocation",
            keywords: ["20% each", "equally", "fair to all", "same for everyone", "20% لكل", "بالتساوي", "عادل للجميع"],
          },
          {
            text: "Gives the team false reassurance.",
            competencyKey: "leadership.setting-direction",
            keywords: ["no jobs at risk", "nothing will change", "don't worry", "لا وظائف مهددة", "لن يتغير شيء", "لا تقلقوا"],
          },
          {
            text: "Ignores new information.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["stick to the plan", "no change", "already decided", "نلتزم بالخطة", "لا تغيير", "تقرر بالفعل"],
          },
        ],
        embeddedDetail: {
          description:
            "The budget table caption says committed amounts are under signed contracts and cannot be reduced, so the 200,000 cut must come from 550,000 of uncommitted money: about 36% of what is flexible, not 20%.",
          location: "caption of the remaining-budget table",
          keywords: ["committed", "cannot be reduced", "550,000", "36%", "الملتزم به", "لا يمكن تخفيضها"],
        },
        optionNotes: [
          { optionId: "r1a", defensibleBecause: "Shares the pain evenly and is simple to explain.", cost: "Ignores returns; cuts a project that pays for itself; every plan is compromised." },
          { optionId: "r1b", defensibleBecause: "Protects the project with the clearest financial return.", cost: "Loses the features {{client}} asked for; skills programme also hit." },
          { optionId: "r1c", defensibleBecause: "Concentrates the cut where little is committed and keeps the value-generating work intact.", cost: "Signals development is expendable; morale and retention risk; long-term capability suffers." },
          { optionId: "r2a", defensibleBecause: "Transparent and gives direction.", cost: "Invites dissent; cannot fully answer the jobs question." },
          { optionId: "r2b", defensibleBecause: "Calms anxiety quickly.", cost: "May be false reassurance; a leak damages trust." },
          { optionId: "r2c", defensibleBecause: "Leads speak to their own people and the message scales.", cost: "Messages diverge; you lose control of the narrative." },
          { optionId: "r3a", defensibleBecause: "Secures a large renewal.", cost: "Delays already-reduced savings; demoralises the cost-reduction lead." },
          { optionId: "r3b", defensibleBecause: "Keeps the allocation and tests {{client}}'s flexibility.", cost: "A 5% discount; risk that {{client}} walks away." },
          { optionId: "r3c", defensibleBecause: "Makes a business case for more resources.", cost: "Uses political capital; partial result; closer scrutiny from {{exec}}." },
          { optionId: "r4a", defensibleBecause: "Robust across scenarios.", cost: "More complex; harder to keep to one page." },
          { optionId: "r4b", defensibleBecause: "Advocates for the team and its results.", cost: "No contingency; looks unprepared if the cut comes." },
          { optionId: "r4c", defensibleBecause: "Avoids another disruptive mid-year change.", cost: "Shuts off growth; morale and retention suffer; may be unnecessary." },
        ],
        probeTargets: ["leadership.setting-direction"],
        twistTargets: ["adaptability.handling-new-information"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "chain-04-the-held-delivery",
    type: "CONSEQUENCE_CHAIN",
    difficulty: 3,
    dials: { ambiguity: 4, stakeholders: 3, conflictingConstraints: 3, stakes: 3, timePressure: 4, informationGaps: 4 },
    targets: ["adaptability.handling-new-information", "judgment.deciding-under-ambiguity", "collaboration.team-orientation"],
    roleFamilies: ["operations"],
    minutes: 8,
    storyPhase: "middle",
    content: {
      en: {
        title: "The held delivery",
        scenario:
          "You run the evening shift (14 staff) at {{company}}'s distribution centre, which supplies 45 pharmacies and clinics; 18 of the pharmacies belong to {{client}}'s chain. Tonight's orders must be loaded by 05:00. A delivery of 30 pallets of fever medicine and flu-season stock, needed for many of those orders, is held at the port. {{report1}} leads picking, {{report2}} runs stock control, and {{peer}} runs the returns team next door. {{manager}} is off tonight and reachable only for emergencies. You will make four decisions as the night unfolds; what happens next depends partly on your choices. The shift plan is in the materials.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "Tonight's shift plan",
            caption:
              "Overtime is limited to 2 hours per person per shift without {{manager}}'s approval. The 6 rural pharmacies on Route 7 receive one delivery a week; all others receive daily deliveries.",
            columns: [
              { key: "time", label: "Time" },
              { key: "activity", label: "Activity" },
            ],
            rows: [
              { time: "15:00", activity: "Shift starts: 14 staff" },
              { time: "15:00–21:00", activity: "Pick and stage regular orders" },
              { time: "21:00–02:00", activity: "Pick medicine orders (needs the port delivery)" },
              { time: "02:00–05:00", activity: "Check and load trucks" },
              { time: "05:00", activity: "Trucks leave for 45 pharmacies and clinics" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "In each round, choose what you do and briefly say why.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation:
                  "15:00. The freight agent says the port's document check should finish 'probably by 18:00, maybe tomorrow morning'. If the pallets arrive by 21:00, the plan still works.",
                options: [
                  { id: "r1a", label: "Pick and stage everything else now and plan the medicine pick as a late wave, asking 4 people to be ready to stay up to 2 hours late." },
                  { id: "r1b", label: "Decide now to send tonight's trucks without the medicines, and arrange a separate van run tomorrow afternoon." },
                  { id: "r1c", label: "Ask {{specialist}} to go to the port and push the document check, and hold the decision until 18:00." },
                ],
                consequences: [
                  { optionId: "r1a", text: "By 20:00, 80% of the regular orders are staged. Two of the four people you asked to stay say they have family commitments and were never asked whether they could." },
                  { optionId: "r1b", text: "The shift runs calmly. At 17:30 {{client}} emails: the fever medicine goes on promotion in {{client}}'s pharmacies at 08:00 tomorrow, and radio advertising is already booked." },
                  { optionId: "r1c", text: "The documents clear at 17:40 and the truck is expected at 21:00. While you waited, staging fell about an hour behind plan." },
                ],
              },
              {
                id: "round2",
                situation:
                  "21:15. The truck arrives. During unloading, 6 of the 30 pallets turn out to have crushed boxes. Sorting what can still be sent needs 2 people for about 90 minutes, and your team is already stretched. {{peer}}'s returns team finishes at 22:00. {{peer}} offers to lend you 3 people for 2 hours, 'if two of yours cover my Saturday shift next week'.",
                options: [
                  { id: "r2a", label: "Accept the offer and agree the Saturday swap now." },
                  { id: "r2b", label: "Decline, move two of your own pickers onto sorting, and accept that some orders may load late." },
                  { id: "r2c", label: "Accept the help tonight and say you will confirm the Saturday swap with {{manager}} tomorrow." },
                ],
                consequences: [
                  { optionId: "r2a", text: "Sorting finishes by 23:00, and 4 of the 6 damaged pallets are usable. Next week two of your staff work Saturday; one says it is their third extra shift this month." },
                  { optionId: "r2b", text: "Sorting finishes by 23:30 and picking is about 40 minutes behind. Your team is tired, but nobody owes anyone a shift." },
                  { optionId: "r2c", text: "The help arrives, with a comment from {{peer}}: 'I thought we could sort this out between us.' Sorting finishes by 23:00, and 4 of the 6 damaged pallets are usable." },
                ],
              },
              {
                id: "round3",
                situation:
                  "00:30. {{report2}} reports that after the damage you have about 20% less fever medicine than ordered. By default, the system cuts every pharmacy's order by 20%. {{client}}'s 18 pharmacies start their promotion at 08:00. The 6 pharmacies on Route 7 are in rural areas.",
                options: [
                  { id: "r3a", label: "Fill {{client}}'s 18 pharmacies in full and take the whole shortfall from the other 27." },
                  { id: "r3b", label: "Keep the system's even 20% cut for everyone, and tell all pharmacies in the morning." },
                  { id: "r3c", label: "Fill the 6 Route 7 pharmacies in full, spread the shortfall across the other 39 including {{client}}'s, and call {{client}} at 07:00 to explain." },
                ],
                consequences: [
                  { optionId: "r3a", text: "{{client}}'s promotion starts with full stock. By 10:00, three independent pharmacies call: they have run out of children's fever medicine, and one has a queue of parents." },
                  { optionId: "r3b", text: "Every pharmacy is short by a fifth. The Route 7 pharmacies will not get another delivery for 7 days. {{client}} complains that the promotion is undersupplied." },
                  { optionId: "r3c", text: "The Route 7 pharmacies get full orders. At 07:00 {{client}} is clearly unhappy, but thanks you for calling before the pharmacies opened and asks when the rest will come." },
                ],
              },
              {
                id: "round4",
                situation:
                  "03:30. A check by {{report2}} finds a counting error: 2 of the pallets marked damaged belong to a different product. The real shortfall is about 8%, not 20%. Re-picking to the new numbers would push loading to about 05:40, so trucks would reach some pharmacies after they open. A top-up van can leave at 10:00.",
                options: [
                  { id: "r4a", label: "Re-pick everything to the new numbers and accept that loading finishes at 05:40." },
                  { id: "r4b", label: "Load as planned at 05:00 and send the extra stock on the 10:00 van to the pharmacies that were cut most." },
                  { id: "r4c", label: "Re-pick only the orders that were cut most, accepting that those trucks leave at about 05:20." },
                ],
                consequences: [
                  { optionId: "r4a", text: "Every pharmacy receives the right quantity, but 11 deliveries arrive after opening, and two pharmacies complain about vans unloading in their busiest hour." },
                  { optionId: "r4b", text: "The trucks leave on time. The 10:00 van reaches the most-cut pharmacies in the early afternoon; some had to turn customers away in the morning." },
                  { optionId: "r4c", text: "The most-cut pharmacies receive full orders 20 minutes late; the rest arrive on time, and the 10:00 van fills the small gaps." },
                ],
              },
            ],
          },
        },
        probe: { prompt: "Now that you know how the night ended, which of your four decisions would you change, and why?" },
        twist: {
          change:
            "The following week, {{peer}}'s returns team falls badly behind after a supplier recall. {{peer}} asks you to lend 3 of your people for two evenings, in a week that is busy for your team too.",
          prompt: "What do you decide, and what do you say to {{peer}} and to your own team?",
        },
      },
      ar: {
        title: "الشحنة المحتجزة",
        scenario:
          "تدير المناوبة المسائية (14 موظفًا) في مركز التوزيع التابع لـ{{company}}، الذي يزوّد 45 صيدلية وعيادة، منها 18 صيدلية تتبع سلسلة {{client}}. يجب تحميل طلبات الليلة قبل الساعة 05:00. وشحنة من 30 منصة نقّالة تحمل أدوية خافضة للحرارة ومخزون موسم الإنفلونزا، تحتاج إليها طلبات كثيرة، محتجزة في الميناء. فريق التجهيز بقيادة {{report1}}، ومراقبة المخزون بيد {{report2}}، وفريق المرتجعات المجاور بقيادة {{peer}}. و{{manager}} خارج الدوام الليلة، والاتصال متاح في الحالات الطارئة فقط. ستتخذ أربعة قرارات مع تطور الأحداث في هذه الليلة، وما يحدث بعد كل قرار يتوقف جزئيًا على اختياراتك. تجد خطة المناوبة ضمن المواد.",
        materials: [
          {
            kind: "table",
            id: "m1",
            title: "خطة مناوبة الليلة",
            caption:
              "لا يتجاوز العمل الإضافي ساعتين للشخص الواحد في المناوبة دون موافقة {{manager}}. وتتسلم الصيدليات الريفية الست على المسار 7 شحنة واحدة في الأسبوع، أما البقية فتتسلم شحنات يومية.",
            columns: [
              { key: "time", label: "الوقت" },
              { key: "activity", label: "النشاط" },
            ],
            rows: [
              { time: "15:00", activity: "بدء المناوبة: 14 موظفًا" },
              { time: "15:00–21:00", activity: "تجهيز الطلبات المعتادة وترتيبها" },
              { time: "21:00–02:00", activity: "تجهيز طلبات الأدوية (تتوقف على شحنة الميناء)" },
              { time: "02:00–05:00", activity: "المراجعة وتحميل الشاحنات" },
              { time: "05:00", activity: "انطلاق الشاحنات إلى 45 صيدلية وعيادة" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "في كل جولة، اختر ما تفعله واذكر السبب باختصار.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation:
                  "الساعة 15:00. يقول وكيل الشحن إن فحص المستندات في الميناء سينتهي «على الأرجح قبل الساعة 18:00، وربما صباح الغد». وإذا وصلت المنصات قبل الساعة 21:00 فالخطة ما زالت ممكنة.",
                options: [
                  { id: "r1a", label: "تجهيز كل الطلبات الأخرى وترتيبها الآن، وتخطيط تجهيز الأدوية في موجة متأخرة، مع الطلب من 4 أشخاص الاستعداد للبقاء حتى ساعتين إضافيتين." },
                  { id: "r1b", label: "تقرير إرسال شاحنات الليلة دون الأدوية من الآن، وترتيب رحلة منفصلة بشاحنة صغيرة بعد ظهر الغد." },
                  { id: "r1c", label: "إرسال {{specialist}} إلى الميناء لمتابعة فحص المستندات وتسريعه، وتأجيل القرار حتى الساعة 18:00." },
                ],
                consequences: [
                  { optionId: "r1a", text: "بحلول الساعة 20:00 تكون 80% من الطلبات المعتادة جاهزة. ويقول اثنان من الأربعة الذين طلبت بقاءهم إن لديهما التزامات عائلية، وإن أحدًا لم يسألهما أصلًا إن كان البقاء ممكنًا." },
                  { optionId: "r1b", text: "تسير المناوبة بهدوء. وفي الساعة 17:30 تصل رسالة من {{client}}: الدواء الخافض للحرارة معروض بسعر ترويجي في صيدليات السلسلة بدءًا من الساعة 08:00 غدًا، وإعلانات الإذاعة محجوزة مسبقًا." },
                  { optionId: "r1c", text: "تُستكمل المستندات الساعة 17:40، ويُتوقع وصول الشاحنة الساعة 21:00. وفي أثناء الانتظار تأخر التجهيز نحو ساعة عن الخطة." },
                ],
              },
              {
                id: "round2",
                situation:
                  "الساعة 21:15. وصلت الشاحنة، وفي أثناء التفريغ تبيّن أن صناديق 6 من المنصات الثلاثين مسحوقة. فرز ما يمكن إرساله يحتاج إلى شخصين نحو 90 دقيقة، وفريقك مثقل أصلًا. ينتهي دوام فريق المرتجعات الساعة 22:00، والعرض من {{peer}}: إعارتك 3 أشخاص لمدة ساعتين، «على أن يغطي اثنان من فريقك مناوبة السبت لدى فريقي الأسبوع القادم».",
                options: [
                  { id: "r2a", label: "قبول العرض والموافقة على تبادل مناوبة السبت الآن." },
                  { id: "r2b", label: "الاعتذار عن العرض، ونقل اثنين من فريق التجهيز إلى الفرز، وتقبّل تأخر تحميل بعض الطلبات." },
                  { id: "r2c", label: "قبول المساعدة الليلة، والقول إنك ستؤكد تبادل مناوبة السبت مع {{manager}} غدًا." },
                ],
                consequences: [
                  { optionId: "r2a", text: "ينتهي الفرز الساعة 23:00، و4 من المنصات الست التالفة صالحة للإرسال. وفي الأسبوع التالي يعمل اثنان من فريقك يوم السبت، ويقول أحدهما إنها المناوبة الإضافية الثالثة هذا الشهر." },
                  { optionId: "r2b", text: "ينتهي الفرز الساعة 23:30، ويتأخر التجهيز نحو 40 دقيقة. فريقك متعب، لكن لا أحد مدين لأحد بمناوبة." },
                  { optionId: "r2c", text: "تصل المساعدة من فريق {{peer}}، ومعها عبارة عتاب: «ظننت أننا نستطيع حل هذا فيما بيننا». ينتهي الفرز الساعة 23:00، و4 من المنصات الست التالفة صالحة للإرسال." },
                ],
              },
              {
                id: "round3",
                situation:
                  "الساعة 00:30. بحسب {{report2}}، صار لديكم بعد التلف أقل بنحو 20% من الكمية المطلوبة من الدواء الخافض للحرارة. والنظام يخفّض تلقائيًا طلب كل صيدلية بنسبة 20%. صيدليات سلسلة {{client}} الثماني عشرة تبدأ العرض الترويجي الساعة 08:00، والصيدليات الست على المسار 7 في مناطق ريفية.",
                options: [
                  { id: "r3a", label: "تلبية طلبات صيدليات {{client}} الثماني عشرة كاملة، وتحميل العجز كله على الصيدليات السبع والعشرين الأخرى." },
                  { id: "r3b", label: "الإبقاء على التخفيض المتساوي بنسبة 20% للجميع كما يقترح النظام، وإبلاغ الصيدليات كلها في الصباح." },
                  { id: "r3c", label: "تلبية طلبات صيدليات المسار 7 الست كاملة، وتوزيع العجز على الصيدليات التسع والثلاثين الأخرى ومنها صيدليات {{client}}، والاتصال بـ{{client}} الساعة 07:00 للشرح." },
                ],
                consequences: [
                  { optionId: "r3a", text: "يبدأ عرض سلسلة {{client}} بمخزون كامل. وبحلول الساعة 10:00 تتصل ثلاث صيدليات مستقلة: نفد لديها الدواء الخافض للحرارة للأطفال، وفي إحداها طابور من الأهالي." },
                  { optionId: "r3b", text: "تنقص كل صيدلية الخُمس، ولن تصل إلى صيدليات المسار 7 شحنة أخرى قبل 7 أيام. وتصل شكوى من {{client}} بأن العرض الترويجي لم يحصل على كفايته." },
                  { optionId: "r3c", text: "تتسلم صيدليات المسار 7 طلباتها كاملة. وفي اتصال الساعة 07:00 يبدو الاستياء واضحًا في صوت {{client}}، ومع ذلك يأتي الشكر على الاتصال قبل فتح الصيدليات، مع سؤال عن موعد وصول بقية الكمية." },
                ],
              },
              {
                id: "round4",
                situation:
                  "الساعة 03:30. يكشف تدقيق {{report2}} خطأً في العد: منصتان من المنصات المصنفة تالفة تخصان منتجًا آخر، فالعجز الفعلي نحو 8% لا 20%. وإعادة التجهيز وفق الأرقام الجديدة ستؤخر التحميل حتى الساعة 05:40 تقريبًا، فتصل الشاحنات إلى بعض الصيدليات بعد فتح أبوابها. ويمكن أن تنطلق شاحنة تكميلية الساعة 10:00.",
                options: [
                  { id: "r4a", label: "إعادة تجهيز كل الطلبات وفق الأرقام الجديدة، وتقبّل انتهاء التحميل الساعة 05:40." },
                  { id: "r4b", label: "التحميل كما هو مخطط الساعة 05:00، وإرسال الكمية الإضافية مع الشاحنة التكميلية الساعة 10:00 إلى الصيدليات الأكثر تضررًا من التخفيض." },
                  { id: "r4c", label: "إعادة تجهيز طلبات الصيدليات الأكثر تضررًا فقط، وتقبّل انطلاق شاحناتها نحو الساعة 05:20." },
                ],
                consequences: [
                  { optionId: "r4a", text: "تتسلم كل صيدلية الكمية الصحيحة، لكن 11 شحنة تصل بعد فتح الصيدليات، وتشتكي صيدليتان من تفريغ الشاحنات في ساعة الذروة." },
                  { optionId: "r4b", text: "تنطلق الشاحنات في موعدها، وتصل الشاحنة التكميلية إلى الصيدليات الأكثر تضررًا في أول ساعات بعد الظهر، وقد اضطر بعضها إلى الاعتذار من زبائن في الصباح." },
                  { optionId: "r4c", text: "تتسلم الصيدليات الأكثر تضررًا طلباتها كاملة بتأخير 20 دقيقة، وتصل البقية في موعدها، وتسد الشاحنة التكميلية الفجوات الصغيرة." },
                ],
              },
            ],
          },
        },
        probe: { prompt: "بعد أن عرفت كيف انتهت الليلة: أي قراراتك الأربعة كنت ستغيّره، ولماذا؟" },
        twist: {
          change:
            "في الأسبوع التالي يتأخر فريق المرتجعات كثيرًا بعد أن سحب أحد الموردين منتجًا من السوق، ويصلك طلب من {{peer}} بإعارة 3 من فريقك لمدة مساءين، في أسبوع مزدحم على فريقك أيضًا.",
          prompt: "ماذا تقرر، وماذا تقول لـ{{peer}} ولفريقك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "adaptability.handling-new-information",
            anchors: [
              "Sticks to the first plan as each update arrives (port delay, damaged pallets, counting error), or throws the whole plan away at every new fact.",
              "Notices the updates but changes the plan only in a token way, or acts on new figures without asking whether they are reliable.",
              "Revisits the plan at each update, changes the parts affected (staffing, allocation, loading) and keeps what still works.",
              "Checks new information before acting on it (e.g., confirms the recount before re-picking) and explains what changed in their reasoning.",
              "Updates in proportion and draws wider implications, such as asking how the counting error happened and whether other pallets were misclassified.",
            ],
          },
          {
            competencyKey: "judgment.deciding-under-ambiguity",
            anchors: [
              "Refuses to commit until the port gives a firm time, or commits to one path as if the outcome were certain.",
              "Decides, but on unstated assumptions, e.g., simply assumes the truck will arrive by 21:00.",
              "Makes a reasonable call on the information available, states the main assumption and when it will be checked (e.g., 18:00).",
              "Prefers options that keep choices open (staging regular orders early, a top-up van) and sets decision points through the night.",
              "Structures the night so the plan works across likely outcomes, naming in advance what would trigger a change and who would be told.",
            ],
          },
          {
            competencyKey: "collaboration.team-orientation",
            anchors: [
              "Treats the night purely as their own team's problem: dismisses {{peer}}'s needs, or loads extra shifts on their own staff without a thought.",
              "Takes or gives help reluctantly, without weighing the cost to the other team or to their own people.",
              "Accepts or offers help on fair terms and asks their own staff before committing their time (overtime, the Saturday swap).",
              "Balances their team's goals with the wider operation: treats pharmacies on every route fairly, keeps {{peer}} informed, and shares the extra shifts out fairly.",
              "As level 4, and builds lasting cooperation, e.g., proposes a standing arrangement with {{peer}}'s team for peak nights and credits the people who helped.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the fact that Route 7 pharmacies get only one delivery a week when allocating the shortfall.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["route 7", "once a week", "one delivery a week", "7 days", "rural", "المسار 7", "مرة في الأسبوع", "شحنة واحدة في الأسبوع", "7 أيام", "الريفية"],
          },
          {
            text: "Sets a decision point or a fallback rather than waiting for certainty.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["by 18:00", "if it arrives", "if not by", "fallback", "plan b", "قبل الساعة 18:00", "إذا وصلت", "إذا لم تصل", "خطة بديلة"],
          },
          {
            text: "Checks the recount before re-planning around it.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["check the count", "verify", "recount", "confirm the figure", "أتحقق", "التحقق من العد", "إعادة العد", "أتأكد من الرقم"],
          },
          {
            text: "Explains what the new information changes and what it does not.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["this changes", "now that", "no longer", "still holds", "هذا يغيّر", "الآن وقد", "لم يعد", "ما زال صالحًا"],
          },
          {
            text: "Asks staff before committing them to overtime or extra shifts, and shares them out fairly.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["ask who can", "volunteers", "fair", "rotate", "share the shifts", "أسأل من يستطيع", "متطوعين", "عادل", "بالتناوب", "توزيع المناوبات"],
          },
          {
            text: "Treats help between teams as two-way and acknowledges {{peer}}'s team.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["thank", "return the favour", "help them back", "we owe", "أشكر", "نردّ الجميل", "نساعدهم", "دين علينا"],
          },
        ],
        redFlags: [
          {
            text: "Refuses to decide until everything is certain.",
            competencyKey: "judgment.deciding-under-ambiguity",
            keywords: ["wait and see", "nothing until we know", "ننتظر لنرى", "لا شيء حتى نعرف"],
          },
          {
            text: "Re-plans on the new count without checking it.",
            competencyKey: "adaptability.handling-new-information",
            keywords: ["no need to check", "re-pick everything straight away", "لا داعي للتحقق", "نعيد التجهيز فورًا"],
          },
          {
            text: "Dismisses the other team's needs as not their problem.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["not my problem", "their problem", "not my team", "ليست مشكلتي", "مشكلتهم", "ليس فريقي"],
          },
          {
            text: "Forces overtime on staff without asking.",
            competencyKey: "collaboration.team-orientation",
            keywords: ["everyone stays", "no choice", "they have to stay", "الجميع يبقى", "لا خيار", "عليهم البقاء"],
          },
        ],
        embeddedDetail: {
          description:
            "The shift-plan caption says the 6 rural Route 7 pharmacies receive only one delivery a week, so any cut to them lasts 7 days, while every other pharmacy can be topped up the next day.",
          location: "caption of the shift-plan table",
          keywords: ["route 7", "once a week", "one delivery a week", "weekly", "المسار 7", "مرة في الأسبوع", "شحنة واحدة في الأسبوع"],
        },
        optionNotes: [
          { optionId: "r1a", defensibleBecause: "Protects the 05:00 deadline whichever way the port goes, and keeps the medicines in tonight's trucks.", cost: "Commits people's evenings without asking; overtime may be wasted if the delivery slips to the morning." },
          { optionId: "r1b", defensibleBecause: "Removes uncertainty early and keeps the shift calm and predictable.", cost: "Misses {{client}}'s promotion and leaves weekly-delivery pharmacies short; the van run costs extra." },
          { optionId: "r1c", defensibleBecause: "Attacks the cause of the delay and keeps both options open.", cost: "Loses an hour of staging while waiting; relies on {{specialist}} being able to speed up the port." },
          { optionId: "r2a", defensibleBecause: "Gets the sorting done on time and repays the help fairly.", cost: "Commits two of your staff to a Saturday without asking; adds to an already heavy month." },
          { optionId: "r2b", defensibleBecause: "Keeps the team self-reliant and avoids a debt to another team.", cost: "Picking falls behind; the team carries the whole load." },
          { optionId: "r2c", defensibleBecause: "Gets the help now and avoids committing staff without approval.", cost: "Looks like hedging to {{peer}}; damages goodwill between the teams." },
          { optionId: "r3a", defensibleBecause: "Protects the largest customer's promotion and the relationship with {{client}}.", cost: "Shifts the whole shortage onto smaller pharmacies, including those with no delivery for a week; children's medicine runs out." },
          { optionId: "r3b", defensibleBecause: "Simple, transparent and treats every pharmacy the same.", cost: "Ignores that Route 7 cannot be topped up for 7 days; {{client}}'s promotion is short." },
          { optionId: "r3c", defensibleBecause: "Protects the pharmacies with no alternative supply and is honest with {{client}} before opening.", cost: "{{client}}'s promotion starts short; risks friction with the biggest customer." },
          { optionId: "r4a", defensibleBecause: "Every pharmacy gets the right quantity in one delivery.", cost: "Late arrivals after opening; tired staff re-picking at the end of a long night." },
          { optionId: "r4b", defensibleBecause: "Keeps the delivery promise to everyone and uses the top-up van for the gap.", cost: "Some pharmacies are short in the morning even though the stock exists." },
          { optionId: "r4c", defensibleBecause: "Targets the extra effort where the shortage hurts most with a small delay.", cost: "Adds complexity late at night; a few trucks leave late." },
        ],
        probeTargets: ["judgment.deciding-under-ambiguity", "adaptability.handling-new-information"],
        twistTargets: ["collaboration.team-orientation"],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "chain-05-two-coordinators",
    type: "CONSEQUENCE_CHAIN",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 4, stakes: 3, timePressure: 2, informationGaps: 4 },
    targets: ["leadership.handling-conflict", "communication.listening", "management.performance-management"],
    roleFamilies: [],
    minutes: 9,
    storyPhase: "late",
    content: {
      en: {
        title: "The two coordinators",
        scenario:
          "You head the hospitality training department at {{company}}, a vocational institute with 340 students. The department depends on two roles working closely together: {{report1}} runs timetabling and exams, and {{report2}} runs student work placements with hotels and restaurants. Over the last month their disagreements have come into the open, and the rest of the team has started taking sides. This chain covers the next ten weeks. In each round you choose what to do; what happens next depends partly on your choice. What you know so far is in the materials.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "What you know so far",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "- The term timetable was published 6 weeks ago. Three exam dates fall inside placement weeks already agreed with employers.\n- {{report2}} has asked twice for those dates to move. {{report1}} replied that exam dates are fixed by the awarding body.\n- Two team members have asked you privately who is actually in charge of dates.\n- Track record: {{report1}} has delivered exam results on time for 3 years; employers rate {{report2}}'s placements 4.6 out of 5.",
          },
          {
            kind: "table",
            id: "m2",
            title: "The three exam dates",
            columns: [
              { key: "date", label: "Date" },
              { key: "exam", label: "Exam" },
              { key: "setBy", label: "Date set by" },
            ],
            rows: [
              { date: "14th", exam: "Practical cookery", setBy: "Awarding body (cannot move)" },
              { date: "21st", exam: "Food safety (theory)", setBy: "Institute (can move)" },
              { date: "28th", exam: "Front office", setBy: "Institute (can move)" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "In each round, choose what you do and briefly say why.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation:
                  "Week 1. In the weekly team meeting, {{report1}} and {{report2}} argue openly about who should set dates during placement weeks. Everyone else goes quiet.",
                options: [
                  { id: "r1a", label: "Stop the discussion and decide in the meeting: {{report1}} sets all dates." },
                  { id: "r1b", label: "Pause the topic, then meet each of them separately this week to hear their side." },
                  { id: "r1c", label: "Ask them to work it out between themselves and bring you a joint proposal by Thursday." },
                ],
                consequences: [
                  { optionId: "r1a", text: "The meeting moves on. For the rest of the week {{report2}} says little and stops copying {{report1}} on emails to employers." },
                  { optionId: "r1b", text: "{{report1}} says placements keep being agreed without checking the exam calendar. {{report2}} says employers were promised dates in good faith and that nothing ever moves. Both mention the same three dates." },
                  { optionId: "r1c", text: "Thursday comes with no joint proposal. You receive two versions, one from each of them, and they cannot both work." },
                ],
              },
              {
                id: "round2",
                situation:
                  "Week 3. {{client}} complains on behalf of a large hotel group: 12 students were pulled from placement for an exam with only 2 days' notice. {{report1}} and {{report2}} each blame the other.",
                options: [
                  { id: "r2a", label: "Bring them together with the date data and agree a shared process for setting dates." },
                  { id: "r2b", label: "Handle {{client}} yourself and leave the process question for later." },
                  { id: "r2c", label: "Ask {{manager}} to mediate between them." },
                ],
                consequences: [
                  { optionId: "r2a", text: "The meeting is tense at first. Once the dates are on the table, two rules are agreed: exams set by the institute will avoid placement weeks, and the exam calendar is checked before any date is confirmed with an employer." },
                  { optionId: "r2b", text: "{{client}}'s complaint settles down. The tension between {{report1}} and {{report2}} continues, and a second clash appears in next term's draft timetable." },
                  { optionId: "r2c", text: "A meeting with {{manager}} is set for next month. Until then, {{report1}} and {{report2}} communicate only by email." },
                ],
              },
              {
                id: "round3",
                situation:
                  "Week 6. {{report2}} tells you privately that {{report1}} makes dismissive comments about the placement team in front of new staff. You have not heard this yourself, and {{report1}} is your most reliable performer.",
                options: [
                  { id: "r3a", label: "Raise it with {{report1}} in a one-to-one this week, saying what you have heard and listening to their account." },
                  { id: "r3b", label: "Watch for two weeks to see it for yourself before saying anything." },
                  { id: "r3c", label: "Remind the whole team at the next meeting that everyone should treat each other with respect." },
                ],
                consequences: [
                  { optionId: "r3a", text: "{{report1}} is defensive at first, then admits being fed up and having made a remark about 'placement people who don't plan'. You agree it was unfair, and {{report1}} offers to talk to the new staff concerned." },
                  { optionId: "r3b", text: "In week 7 you hear {{report1}} call the placement calendar 'a wish list' in front of two new staff. A few days later one of them asks to move to {{report2}}'s side of the team." },
                  { optionId: "r3c", text: "The team nods along. {{report1}} takes the comment to be aimed at {{report2}}, and nothing changes." },
                ],
              },
              {
                id: "round4",
                situation:
                  "Week 10. Mid-year reviews. {{report1}}'s exam work is excellent and the remarks have mostly stopped. {{report2}} missed two employer-reporting deadlines during the weeks of conflict.",
                options: [
                  { id: "r4a", label: "Rate both on results only, and leave the conflict out of the reviews." },
                  { id: "r4b", label: "Include working together as part of both ratings, with specific examples from the term." },
                  { id: "r4c", label: "Mark {{report2}} down for the missed deadlines, noting the conflict as context." },
                ],
                consequences: [
                  { optionId: "r4a", text: "Both ratings are high on results. {{report2}} asks why the missed deadlines were not mentioned when others were marked down for less." },
                  { optionId: "r4b", text: "Both reviews include a goal on working together. {{report1}} questions the collaboration point at first, then accepts the examples; {{report2}} accepts the feedback on deadlines." },
                  { optionId: "r4c", text: "{{report2}} feels the rating is unfair, since much of the lost time went into the conflict, and asks why {{report1}}'s part is not reflected anywhere." },
                ],
              },
            ],
          },
        },
        probe: { prompt: "What did you learn from what each of them told you that changed how you handled the situation?" },
        twist: {
          change:
            "In week 11, {{report1}} tells you about a job offer from another institute and says they will stay only with full control of all dates, including placement weeks.",
          prompt: "What do you do, and what do you say to {{report1}}?",
        },
      },
      ar: {
        title: "المنسقان",
        scenario:
          "ترأس قسم التدريب الفندقي في {{company}}، وهو معهد مهني يدرس فيه 340 طالبًا. ويعتمد القسم على تنسيق وثيق بين ملفين: الجداول والاختبارات من مسؤولية {{report1}}، والتدريب الميداني للطلاب في الفنادق والمطاعم من مسؤولية {{report2}}. وخلال الشهر الماضي خرجت الخلافات بينهما إلى العلن، وبدأ بقية الفريق ينحازون إلى هذا الطرف أو ذاك. تغطي هذه السلسلة الأسابيع العشرة القادمة. في كل جولة تختار ما تفعله، وما يحدث بعدها يتوقف جزئيًا على اختيارك. تجد ما تعرفه حتى الآن ضمن المواد.",
        materials: [
          {
            kind: "memo",
            id: "m1",
            title: "ما تعرفه حتى الآن",
            author: { name: "{{you}}", role: "{{you.role}}" },
            body:
              "- نُشر جدول الفصل قبل 6 أسابيع، وتقع ثلاثة مواعيد اختبارات داخل أسابيع تدريب ميداني اتُّفق عليها مع أصحاب العمل.\n- جاء من {{report2}} طلبان لتغيير هذه المواعيد، وكان الرد من {{report1}} بأن مواعيد الاختبارات تحددها الجهة المانحة للشهادة.\n- سألك اثنان من الفريق على انفراد: من المسؤول فعلًا عن تحديد المواعيد؟\n- سجل الأداء: نتائج الاختبارات من مسؤولية {{report1}} وتُسلَّم في موعدها منذ 3 سنوات، وتقييم أصحاب العمل للتدريب الميداني الذي يقع في مسؤولية {{report2}} يبلغ 4.6 من 5.",
          },
          {
            kind: "table",
            id: "m2",
            title: "مواعيد الاختبارات الثلاثة",
            columns: [
              { key: "date", label: "التاريخ" },
              { key: "exam", label: "الاختبار" },
              { key: "setBy", label: "الجهة التي تحدد الموعد" },
            ],
            rows: [
              { date: "يوم 14", exam: "الطهي العملي", setBy: "الجهة المانحة (لا يمكن تغييره)" },
              { date: "يوم 21", exam: "سلامة الغذاء (نظري)", setBy: "المعهد (يمكن تغييره)" },
              { date: "يوم 28", exam: "المكتب الأمامي", setBy: "المعهد (يمكن تغييره)" },
            ],
          },
        ],
        task: {
          kind: "chain",
          prompt: "في كل جولة، اختر ما تفعله واذكر السبب باختصار.",
          requireJustification: true,
          chain: {
            rounds: [
              {
                id: "round1",
                situation:
                  "الأسبوع 1. في الاجتماع الأسبوعي للفريق يحتدم النقاش علنًا بين {{report1}} و{{report2}} حول صاحب الحق في تحديد المواعيد خلال أسابيع التدريب الميداني، ويلوذ الآخرون بالصمت.",
                options: [
                  { id: "r1a", label: "إيقاف النقاش والحسم في الاجتماع نفسه: تحديد كل المواعيد من صلاحية {{report1}}." },
                  { id: "r1b", label: "تعليق الموضوع، ثم لقاء كلٍّ منهما على حدة هذا الأسبوع للاستماع إلى رواية كل طرف." },
                  { id: "r1c", label: "الطلب منهما حل المسألة فيما بينهما وتقديم مقترح مشترك إليك قبل الخميس." },
                ],
                consequences: [
                  { optionId: "r1a", text: "يمضي الاجتماع إلى بنوده الأخرى. وفي بقية الأسبوع يكاد صوت {{report2}} يغيب، وتتوقف إضافة {{report1}} إلى المراسلات مع أصحاب العمل." },
                  { optionId: "r1b", text: "في حديث {{report1}}: يُتفق على التدريب الميداني دائمًا دون مراجعة تقويم الاختبارات. وفي حديث {{report2}}: وُعد أصحاب العمل بمواعيد بحسن نية، ولا شيء يتحرك أبدًا. ويذكر كلاهما المواعيد الثلاثة نفسها." },
                  { optionId: "r1c", text: "يحل الخميس دون مقترح مشترك. تصلك نسختان، واحدة من كل طرف، ولا يمكن العمل بالاثنتين معًا." },
                ],
              },
              {
                id: "round2",
                situation:
                  "الأسبوع 3. تصل شكوى من {{client}} باسم مجموعة فندقية كبيرة: سُحب 12 طالبًا من التدريب الميداني لأداء اختبار بإشعار قبل يومين فقط. والاتهام متبادل بين {{report1}} و{{report2}}.",
                options: [
                  { id: "r2a", label: "جمعهما معًا مع بيانات المواعيد، والاتفاق على آلية مشتركة لتحديد المواعيد." },
                  { id: "r2b", label: "التعامل مع {{client}} بنفسك، وترك مسألة الآلية لوقت لاحق." },
                  { id: "r2c", label: "الطلب من {{manager}} التوسط بينهما." },
                ],
                consequences: [
                  { optionId: "r2a", text: "يبدأ الاجتماع متوترًا. وحين توضع المواعيد على الطاولة يُتفق على قاعدتين: أن تتجنب الاختبارات التي يحددها المعهد أسابيع التدريب الميداني، وأن يُراجَع تقويم الاختبارات قبل تأكيد أي موعد مع صاحب عمل." },
                  { optionId: "r2b", text: "تهدأ شكوى {{client}}، لكن التوتر بين {{report1}} و{{report2}} يستمر، ويظهر تعارض ثانٍ في مسودة جدول الفصل القادم." },
                  { optionId: "r2c", text: "يتحدد لقاء مع {{manager}} في الشهر القادم، وحتى ذلك الحين يقتصر التواصل بين {{report1}} و{{report2}} على البريد الإلكتروني." },
                ],
              },
              {
                id: "round3",
                situation:
                  "الأسبوع 6. يصلك في حديث خاص من {{report2}} أن تعليقات مستخفّة بفريق التدريب الميداني تصدر عن {{report1}} أمام الموظفين الجدد. لم تسمع شيئًا من ذلك بنفسك، و{{report1}} أكثر أعضاء فريقك موثوقية في الأداء.",
                options: [
                  { id: "r3a", label: "مفاتحة {{report1}} في لقاء فردي هذا الأسبوع بما بلغك، والاستماع إلى الرواية الأخرى." },
                  { id: "r3b", label: "المراقبة أسبوعين لترى الأمر بنفسك قبل أن تقول شيئًا." },
                  { id: "r3c", label: "تذكير الفريق كله في الاجتماع القادم بأن على الجميع التعامل باحترام." },
                ],
                consequences: [
                  { optionId: "r3a", text: "يأتي الرد دفاعيًا في البداية، ثم يأتي الاعتراف: «ضقت ذرعًا»، وقد صدرت فعلًا عبارة عن «أهل التدريب الميداني الذين لا يخططون». وينتهي اللقاء باتفاق على أن العبارة لم تكن منصفة، وبعرض من {{report1}} للحديث مع الموظفين الجدد المعنيين." },
                  { optionId: "r3b", text: "في الأسبوع 7 تسمع بنفسك عبارة «قائمة أمنيات» وصفًا لتقويم التدريب الميداني، على لسان {{report1}}، أمام موظفَين جديدين. وبعد أيام يطلب أحدهما الانتقال إلى الشق التابع لـ{{report2}} في الفريق." },
                  { optionId: "r3c", text: "يومئ الفريق موافقًا. ويُفهم الكلام عند {{report1}} على أنه موجّه إلى {{report2}}، ولا يتغير شيء." },
                ],
              },
              {
                id: "round4",
                situation:
                  "الأسبوع 10. تقييمات منتصف العام. عمل {{report1}} في الاختبارات ممتاز، والتعليقات توقفت في معظمها. وفات {{report2}} موعدان لتقارير أصحاب العمل خلال أسابيع الخلاف.",
                options: [
                  { id: "r4a", label: "تقييم كلٍّ منهما على النتائج فقط، وإبقاء الخلاف خارج التقييم." },
                  { id: "r4b", label: "إدراج العمل المشترك ضمن تقييم كلٍّ منهما، مع أمثلة محددة من الفصل." },
                  { id: "r4c", label: "خفض تقييم {{report2}} بسبب المواعيد الفائتة، مع ذكر الخلاف بوصفه سياقًا." },
                ],
                consequences: [
                  { optionId: "r4a", text: "يأتي التقييمان مرتفعين على النتائج. ويصلك سؤال من {{report2}}: لماذا لم تُذكر المواعيد الفائتة بينما خُفّض تقييم آخرين لأقل من ذلك؟" },
                  { optionId: "r4b", text: "يتضمن التقييمان هدفًا عن العمل المشترك. يواجه بند التعاون اعتراضًا من {{report1}} في البداية، ثم تُقبل الأمثلة، وتُقبل ملاحظة المواعيد لدى {{report2}}." },
                  { optionId: "r4c", text: "يصلك اعتراض من {{report2}}: التقييم غير منصف، فكثير من الوقت ضاع في الخلاف، فلماذا لا ينعكس دور {{report1}} في أي موضع؟" },
                ],
              },
            ],
          },
        },
        probe: { prompt: "ما الذي تعلمته مما قاله لك كل منهما، وغيّر طريقة تعاملك مع الموقف؟" },
        twist: {
          change:
            "في الأسبوع 11 يصلك من {{report1}} خبر عرض عمل من معهد آخر، مع شرط واحد للبقاء: صلاحية كاملة على كل المواعيد، ومنها أسابيع التدريب الميداني.",
          prompt: "ماذا تفعل، وماذا تقول لـ{{report1}}؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "leadership.handling-conflict",
            anchors: [
              "Avoids the conflict, lets it run, or settles it by decree without hearing either side.",
              "Addresses it in a way that leaves the real issue (who sets dates, and how) unresolved, e.g., a general call for respect.",
              "Brings the disagreement into the open, hears both sides, and agrees a practical way forward on dates.",
              "Works on the underlying interests (exam integrity, promises to employers), reaches a shared process both support, and addresses behaviour that harms the team.",
              "As level 4, and changes the system so the conflict does not return, e.g., a joint calendar check before dates are confirmed, with clear ownership.",
            ],
          },
          {
            competencyKey: "communication.listening",
            anchors: [
              "Seeks neither person's view, or acts on the first account heard.",
              "Hears them out but does not use what they said; misses that both mention the same three dates.",
              "Listens to each separately, summarises their concerns accurately and notices the facts they share.",
              "Asks questions that uncover what lies beneath, such as which exam dates are actually fixed, and checks understanding before acting.",
              "As level 4, and listens for what is not said ({{report1}}'s frustration with last-minute changes, the cost of the conflict to {{report2}}'s deadlines) and uses it to shape the solution.",
            ],
          },
          {
            competencyKey: "management.performance-management",
            anchors: [
              "Avoids feedback on the remarks or the missed deadlines, or rates on impressions.",
              "Gives one-sided feedback (results only, or behaviour only) or vague comments.",
              "Gives each specific feedback on results and behaviour, with examples, and sets clear expectations.",
              "Holds both to the same standard: {{report1}}'s remarks and {{report2}}'s deadlines are addressed fairly, with goals and follow-up.",
              "As level 4, and handles the retention threat without trading away standards or fairness, recognising {{report1}}'s value while declining sole control of shared decisions.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Finds that only one of the three dates is fixed by the awarding body.",
            competencyKey: "communication.listening",
            keywords: ["awarding body", "only one", "can move", "set by the institute", "two of the three", "الجهة المانحة", "واحد فقط", "يمكن تغييره", "يحدده المعهد", "اثنان من الثلاثة"],
          },
          {
            text: "Meets each person separately and reflects back what they heard.",
            competencyKey: "communication.listening",
            keywords: ["separately", "hear both", "what i heard", "their side", "على حدة", "الطرفين", "ما سمعته", "ما لدى كل"],
          },
          {
            text: "Agrees a shared process for setting dates rather than picking a winner.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["shared process", "joint calendar", "check the exam calendar", "both agree", "آلية مشتركة", "تقويم مشترك", "مراجعة تقويم الاختبارات", "يتفقان"],
          },
          {
            text: "Addresses the reported remarks directly and specifically, after hearing {{report1}}'s account.",
            competencyKey: "management.performance-management",
            keywords: ["one-to-one", "specific", "in front of new staff", "remarks", "لقاء فردي", "محدد", "أمام الموظفين الجدد", "التعليقات"],
          },
          {
            text: "Applies the same standard to both in the reviews, with examples.",
            competencyKey: "management.performance-management",
            keywords: ["same standard", "both of them", "examples", "fair to both", "المعيار نفسه", "كلٍّ منهما", "أمثلة", "منصف للطرفين"],
          },
        ],
        redFlags: [
          {
            text: "Settles the conflict by decree without hearing either side.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["my decision is final", "because i said so", "end of discussion", "قراري نهائي", "انتهى النقاش"],
          },
          {
            text: "Relies on a general call for respect instead of addressing the issue.",
            competencyKey: "leadership.handling-conflict",
            keywords: ["everyone should be respectful", "remind the team", "على الجميع الاحترام", "تذكير الفريق"],
          },
          {
            text: "Rates on results only and ignores behaviour.",
            competencyKey: "management.performance-management",
            keywords: ["results only", "behaviour doesn't matter", "النتائج فقط", "السلوك لا يهم"],
          },
          {
            text: "Gives in to the ultimatum.",
            competencyKey: "management.performance-management",
            keywords: ["give full control", "whatever it takes to keep", "السيطرة الكاملة", "صلاحية كاملة له", "مهما كان الثمن"],
          },
          {
            text: "Acts on the first account heard without checking the other side.",
            competencyKey: "communication.listening",
            keywords: ["without hearing", "i already know", "no need to ask", "دون الاستماع", "أعرف مسبقًا", "لا داعي لسؤال"],
          },
        ],
        embeddedDetail: {
          description:
            "The dates table shows only the 14th is fixed by the awarding body; the 21st and 28th are set by the institute and can move, so {{report1}}'s claim that all exam dates are fixed is only partly true.",
          location: "'Date set by' column of the exam dates table",
          keywords: ["awarding body", "can move", "21st", "28th", "institute", "الجهة المانحة", "يمكن تغييره", "يوم 21", "يوم 28", "المعهد"],
        },
        optionNotes: [
          { optionId: "r1a", defensibleBecause: "Ends a public argument quickly and gives the team clarity.", cost: "Decides without hearing either side; {{report2}} disengages and the cause stays hidden." },
          { optionId: "r1b", defensibleBecause: "Takes the conflict out of public view and gathers both accounts before acting.", cost: "Slower; the team waits a few more days for clarity." },
          { optionId: "r1c", defensibleBecause: "Treats them as senior professionals who can resolve their own work issues.", cost: "Leaves an escalating conflict unmanaged; likely to fail without facilitation." },
          { optionId: "r2a", defensibleBecause: "Uses facts to move from blame to a shared process.", cost: "A tense meeting; needs your time and skill to facilitate." },
          { optionId: "r2b", defensibleBecause: "Protects the employer relationship quickly.", cost: "Treats the symptom; the clash repeats next term." },
          { optionId: "r2c", defensibleBecause: "Brings in a neutral, more senior person.", cost: "Gives away your role as their leader; a month's delay hardens positions." },
          { optionId: "r3a", defensibleBecause: "Raises a serious concern promptly, while hearing {{report1}}'s side.", cost: "Acts on second-hand information; risks defensiveness from a strong performer." },
          { optionId: "r3b", defensibleBecause: "Avoids acting on hearsay.", cost: "Lets harmful behaviour continue; new staff are affected meanwhile." },
          { optionId: "r3c", defensibleBecause: "Sets a standard without singling anyone out.", cost: "Too general to change anything; may be read as taking sides." },
          { optionId: "r4a", defensibleBecause: "Objective and easy to defend on numbers.", cost: "Ignores behaviour and the missed deadlines; looks inconsistent." },
          { optionId: "r4b", defensibleBecause: "Holds both to the same standard on results and collaboration, with evidence.", cost: "Harder conversations; needs well-documented examples." },
          { optionId: "r4c", defensibleBecause: "Addresses the missed deadlines while recognising context.", cost: "One-sided; ignores {{report1}}'s part in the conflict." },
        ],
        probeTargets: ["communication.listening"],
        twistTargets: ["leadership.handling-conflict", "management.performance-management"],
      },
    },
  },
];
