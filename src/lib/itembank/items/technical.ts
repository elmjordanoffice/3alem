import type { BankItem } from "@/lib/assessment/item-schema";

const REFUND_CODE = `async function refundOrder(orderId: string, amount: number) {
  const order = await db.orders.findById(orderId);
  if (order.status === "REFUNDED") return;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await payments.createRefund({ chargeId: order.chargeId, amount });
      await db.orders.update(orderId, { status: "REFUNDED" });
      return;
    } catch (err) {
      if (err.code !== "TIMEOUT") throw err;
      await sleep(2000 * attempt);
    }
  }
  throw new Error("Refund failed after 3 attempts");
}`;

export const ITEMS: BankItem[] = [
  // ═════════════════════════ SOFTWARE ENGINEERING ═════════════════════════
  {
    id: "tech-se-01-duplicate-refunds",
    type: "TECHNICAL_TASK",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 2, stakes: 4, timePressure: 3, informationGaps: 3 },
    targets: ["technical.problem-diagnosis", "technical.role-knowledge", "communication.adapting-to-audience"],
    roleFamilies: ["software-engineering"],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "Refunded twice",
        scenario:
          "Last week {{company}}'s order service shipped a change by {{report1}}: when the payment provider times out on a refund, the code now retries up to 3 times. It was meant to fix refunds that 'never arrived'. Since then, support has reported 7 customers who were refunded twice. {{manager}} has asked you to review the code and explain what is happening. The code, the provider's documentation and the support report are attached.",
        materials: [
          {
            kind: "memo",
            id: "code",
            title: "The change: retry refunds on timeout",
            author: { name: "{{report1}}", role: "{{report1.role}}" },
            body: `${REFUND_CODE}\n\nContext: refundOrder is called by the Refund button in the support tool and by the refunds queue worker. The queue delivers each message at least once, so the same message can occasionally arrive twice.`,
          },
          {
            kind: "memo",
            id: "provider-docs",
            title: "Payment provider documentation (extract)",
            author: { name: "Payment provider" },
            body:
              "POST /refunds creates a refund.\n\nTIMEOUT: we did not respond within 10 seconds. The refund may or may not have been created; call GET /refunds?charge={chargeId} to check.\n\nIdempotency: send an Idempotency-Key header to make POST /refunds safe to retry. Requests with the same key within 24 hours are processed once and return the original result.",
          },
          {
            kind: "table",
            id: "support-report",
            title: "Duplicate refunds reported last week (4 of 7 shown)",
            columns: [
              { key: "order", label: "Order" },
              { key: "first", label: "First refund" },
              { key: "second", label: "Second refund" },
              { key: "source", label: "Triggered by" },
            ],
            rows: [
              { order: "10482", first: "09:14:03", second: "09:14:15", source: "Queue (1 message)" },
              { order: "10517", first: "11:02:40", second: "11:02:41", source: "Support tool and queue" },
              { order: "10590", first: "14:20:11", second: "14:20:23", source: "Queue (1 message)" },
              { order: "10611", first: "16:45:02", second: "16:45:02", source: "Queue (same message delivered twice)" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt:
            "Write your review for {{report1}}: what is wrong, why, and the change you recommend. Then add 2 or 3 sentences for {{peer}}, the product manager, on the risk to customers and the business.",
          written: { format: "free" },
        },
        probe: { prompt: "How would you confirm your diagnosis before the fix ships?" },
        twist: {
          change: "The payment provider tells you that idempotency keys are not available on your current contract.",
          prompt: "How do you prevent duplicate refunds now?",
        },
      },
      ar: {
        title: "استرداد مزدوج",
        scenario:
          "في الأسبوع الماضي أطلقت خدمة الطلبات في {{company}} تعديلًا كتبه {{report1}}: حين تنتهي مهلة الاستجابة لدى مزوّد الدفع في عملية استرداد، تعيد الشيفرة المحاولة حتى 3 مرات. كان الهدف معالجة حالات استرداد «لم تصل قط». ومنذ ذلك الحين أبلغ فريق الدعم عن 7 عملاء استردّوا مبالغهم مرتين. طلب منك {{manager}} مراجعة الشيفرة وتفسير ما يحدث. مرفق الشيفرة ووثائق المزوّد وتقرير الدعم.",
        materials: [
          {
            kind: "memo",
            id: "code",
            title: "التعديل: إعادة محاولة الاسترداد عند انتهاء المهلة",
            author: { name: "{{report1}}", role: "{{report1.role}}" },
            body: `${REFUND_CODE}\n\nالسياق: تُستدعى الدالة refundOrder من زر «استرداد» في أداة الدعم، ومن العامل الذي يعالج قائمة انتظار الاسترداد. تسلّم قائمة الانتظار كل رسالة مرة واحدة على الأقل، فقد تصل الرسالة نفسها مرتين أحيانًا.`,
          },
          {
            kind: "memo",
            id: "provider-docs",
            title: "وثائق مزوّد الدفع (مقتطف)",
            author: { name: "مزوّد الدفع" },
            body:
              "ينشئ الطلب POST /refunds عملية استرداد.\n\nTIMEOUT: لم نردّ في غضون 10 ثوانٍ. قد تكون عملية الاسترداد أُنشئت وقد لا تكون؛ استدعِ GET /refunds?charge={chargeId} للتحقق.\n\nعدم التكرار: أرسل الترويسة Idempotency-Key لتصبح إعادة محاولة POST /refunds آمنة. الطلبات التي تحمل المفتاح نفسه في غضون 24 ساعة تُعالج مرة واحدة وتعيد النتيجة الأصلية.",
          },
          {
            kind: "table",
            id: "support-report",
            title: "حالات الاسترداد المزدوج المبلّغ عنها الأسبوع الماضي (4 من 7)",
            columns: [
              { key: "order", label: "الطلب" },
              { key: "first", label: "الاسترداد الأول" },
              { key: "second", label: "الاسترداد الثاني" },
              { key: "source", label: "مصدر الاستدعاء" },
            ],
            rows: [
              { order: "10482", first: "09:14:03", second: "09:14:15", source: "قائمة الانتظار (رسالة واحدة)" },
              { order: "10517", first: "11:02:40", second: "11:02:41", source: "أداة الدعم وقائمة الانتظار" },
              { order: "10590", first: "14:20:11", second: "14:20:23", source: "قائمة الانتظار (رسالة واحدة)" },
              { order: "10611", first: "16:45:02", second: "16:45:02", source: "قائمة الانتظار (الرسالة نفسها سُلّمت مرتين)" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt:
            "اكتب مراجعتك الموجّهة إلى {{report1}}: ما الخلل، ولماذا يحدث، وما التعديل الذي توصي به. ثم أضف جملتين أو ثلاثًا موجّهة إلى {{peer}}، مدير المنتج، عن الخطر على العملاء وعلى الشركة.",
          written: { format: "free" },
        },
        probe: { prompt: "كيف ستتأكد من صحة تشخيصك قبل إطلاق الإصلاح؟" },
        twist: {
          change: "أبلغك مزوّد الدفع أن مفاتيح عدم التكرار (Idempotency keys) غير متاحة في عقدكم الحالي.",
          prompt: "كيف تمنع الاسترداد المزدوج الآن؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.problem-diagnosis",
            anchors: [
              "Says the retry looks fine or blames the provider, without explaining how duplicates arise.",
              "Names the retry as the cause but misses the second pattern: two callers refunding the same order at once.",
              "Explains both mechanisms: a timeout is not a failure, so retries can repeat a refund, and the status check is not atomic.",
              "Uses the timings to match each case to a mechanism: about 12 seconds apart for retries, near-simultaneous for concurrent calls.",
              "As level 4, and spots a further gap: if the refund succeeds but the database update fails, the next call refunds again.",
            ],
          },
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Recommends removing retries or adding longer waits, which does not prevent duplicates.",
              "Suggests a generic fix, such as an in-memory lock, that would not work across several workers.",
              "Recommends an idempotency key derived from the order and an atomic status change, such as a conditional update to a pending state.",
              "Explains why the key must be stable per refund, not per attempt, and how to check refund status after a timeout.",
              "Covers recovery too: reconciling stuck pending refunds against the provider and alerting rather than retrying blindly.",
            ],
          },
          {
            competencyKey: "communication.adapting-to-audience",
            anchors: [
              "Gives {{peer}} code-level detail or jargon with no customer or business impact.",
              "Avoids jargon but leaves the size of the risk unclear.",
              "Tells {{peer}} in plain words what is happening, how many customers are affected and what is being done.",
              "Frames it around {{peer}}'s concerns, money lost, customer trust and whether to pause the change, with any decision needed.",
              "As level 4, and adds what to tell affected customers and how duplicate refunds will be recovered fairly.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "Claims the diagnosis is certain and needs no checking.",
              "Says it should be tested, without saying how.",
              "Proposes a concrete check, such as matching provider refund records and logs for the 7 orders against both mechanisms.",
              "Separates what the evidence shows from what is assumed, and designs a test that reproduces a timeout and a duplicate delivery.",
              "As level 4, and names the result that would point to a different cause, such as duplicates with no timeout or second delivery.",
            ],
          },
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Keeps retrying on timeout without any safeguard.",
              "Removes retries entirely, bringing back the refunds that never arrived.",
              "Replaces blind retries with a status check: after a timeout, query the provider for the charge before deciding to retry.",
              "Combines an atomic pending state, a provider status check before any retry, and a reconciliation job for unclear cases.",
              "As level 4, and states the remaining risk, such as the status endpoint lagging behind, and how to monitor it.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Explains that a timeout does not mean the refund failed, so a retry can repeat it.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["timeout does not mean", "may have been created", "may have succeeded", "duplicate", "قد تكون أُنشئت", "انتهاء المهلة", "تكرار"],
          },
          {
            text: "Identifies the race: two callers can both pass the status check.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["race", "concurrent", "at least once", "atomic", "check-then-act", "تزامن", "ذري", "مرة واحدة على الأقل", "في الوقت نفسه"],
          },
          {
            text: "Recommends an idempotency key per refund.",
            competencyKey: "technical.role-knowledge",
            keywords: ["idempotency key", "idempotency-key", "same key", "مفتاح عدم التكرار", "المفتاح نفسه"],
          },
          {
            text: "Uses a conditional update or pending state to claim the refund before calling the provider.",
            competencyKey: "technical.role-knowledge",
            keywords: ["pending", "conditional update", "compare-and-set", "lock", "قيد التنفيذ", "تحديث مشروط", "قفل"],
          },
          {
            text: "Gives {{peer}} the customer and money impact in plain words.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["refunded twice", "money", "customers", "pause", "مرتين", "خسارة", "العملاء", "إيقاف مؤقت"],
          },
        ],
        redFlags: [
          {
            text: "Increases retries or wait time as the fix.",
            competencyKey: "technical.role-knowledge",
            keywords: ["longer timeout", "more retries", "increase the delay", "زيادة المهلة", "محاولات أكثر"],
          },
          {
            text: "Blames the payment provider.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["provider bug", "their fault", "خطأ المزوّد", "مشكلة لدى المزوّد"],
          },
          {
            text: "Relies on an in-memory flag or lock.",
            competencyKey: "technical.role-knowledge",
            keywords: ["in-memory", "global variable", "في الذاكرة", "متغير عام"],
          },
          {
            text: "Sends code-level jargon to {{peer}}.",
            competencyKey: "communication.adapting-to-audience",
            keywords: ["compare-and-swap", "race condition in the handler", "idempotent post", "المعالج غير الذري"],
          },
        ],
        embeddedDetail: {
          description:
            "The context line says the queue delivers each message at least once and the support tool can also trigger refunds, so two calls can pass the status check at once; the near-simultaneous pairs in the support report show it.",
          location: "context line under the code, matched with the timings in the support report",
          keywords: ["at least once", "twice", "queue", "support tool", "simultaneous", "مرة واحدة على الأقل", "مرتين", "قائمة الانتظار", "أداة الدعم"],
        },
        probeTargets: ["technical.calibrated-depth"],
        twistTargets: ["technical.applying-knowledge"],
      },
    },
  },
  {
    id: "tech-se-02-latency-after-release",
    type: "TECHNICAL_TASK",
    difficulty: 4,
    dials: { ambiguity: 4, stakeholders: 2, conflictingConstraints: 3, stakes: 4, timePressure: 5, informationGaps: 4 },
    targets: ["technical.problem-diagnosis", "technical.calibrated-depth", "technical.applying-knowledge"],
    roleFamilies: ["software-engineering"],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "Slow since the release",
        scenario:
          "Release 4.12 of {{company}}'s web shop went live yesterday at 14:00. Since then the 95th-percentile response time (p95) has risen sharply, and checkout conversions are down. You are on call. The release notes, latency by endpoint, resource metrics and the database driver's upgrade notes are attached. {{manager}} wants your diagnosis and plan within the hour.",
        materials: [
          {
            kind: "memo",
            id: "release-notes",
            title: "Release 4.12 notes",
            author: { name: "{{report1}}", role: "{{report1.role}}" },
            body:
              "1. New 'recommended for you' block on the order details page (loads 5 suggestions for each order line).\n2. Database driver upgraded from 3.1 to 4.0.\n3. Structured logging added to all requests.\n\nConfiguration: unchanged (maxPoolSize = 50).",
          },
          {
            kind: "table",
            id: "latency",
            title: "p95 latency by endpoint (ms)",
            columns: [
              { key: "endpoint", label: "Endpoint" },
              { key: "db", label: "Uses database" },
              { key: "before", label: "Before 14:00", numeric: true },
              { key: "after", label: "After 14:00", numeric: true },
            ],
            rows: [
              { endpoint: "GET /orders/{id}", db: "Yes", before: 180, after: 1450 },
              { endpoint: "GET /orders", db: "Yes", before: 220, after: 900 },
              { endpoint: "GET /products", db: "Yes", before: 120, after: 610 },
              { endpoint: "POST /checkout", db: "Yes", before: 300, after: 1700 },
              { endpoint: "GET /health", db: "No", before: 5, after: 5 },
              { endpoint: "GET /static/config", db: "No", before: 8, after: 9 },
            ],
          },
          {
            kind: "table",
            id: "resources",
            title: "Resource metrics, before and after 14:00",
            columns: [
              { key: "metric", label: "Metric" },
              { key: "before", label: "Before" },
              { key: "after", label: "After" },
            ],
            rows: [
              { metric: "Database CPU", before: "35%", after: "38%" },
              { metric: "Database queries per second", before: "900", after: "1,400" },
              { metric: "App server CPU", before: "40%", after: "42%" },
              { metric: "Open database connections per app server", before: "about 45", after: "10 (never above 10)" },
              { metric: "Wait for a database connection (p95)", before: "2 ms", after: "850 ms" },
            ],
          },
          {
            kind: "memo",
            id: "driver-notes",
            title: "Database driver 4.0: upgrade notes (extract)",
            author: { name: "Driver maintainers" },
            body:
              "Faster query parsing and improved TLS defaults.\n\nBreaking change: the setting maxPoolSize is renamed pool.max. Unrecognised settings are ignored without warning.\n\nDefault pool.max: 10 connections.",
          },
        ],
        task: {
          kind: "written",
          prompt:
            "Write your diagnosis for {{manager}}: the likely causes in order, the evidence for and against each, your next 2 checks, and what you would do right now to protect customers.",
          written: { format: "free" },
        },
        probe: { prompt: "What result would make you drop your top hypothesis?" },
        twist: {
          change: "Rolling back is not possible: the release included a database migration that cannot be reversed.",
          prompt: "What do you do now?",
        },
      },
      ar: {
        title: "بطء منذ الإصدار",
        scenario:
          "أُطلق الإصدار 4.12 من المتجر الإلكتروني لـ{{company}} أمس الساعة 14:00. ومنذ ذلك الحين ارتفع زمن الاستجابة عند المئين 95 (p95) ارتفاعًا حادًا، وتراجعت عمليات الشراء المكتملة. أنت المناوب. مرفق ملاحظات الإصدار، وزمن الاستجابة بحسب نقطة النهاية، ومؤشرات الموارد، وملاحظات ترقية برنامج تشغيل قاعدة البيانات. يريد {{manager}} تشخيصك وخطتك في غضون ساعة.",
        materials: [
          {
            kind: "memo",
            id: "release-notes",
            title: "ملاحظات الإصدار 4.12",
            author: { name: "{{report1}}", role: "{{report1.role}}" },
            body:
              "1. قسم جديد «مقترحات لك» في صفحة تفاصيل الطلب (يحمّل 5 مقترحات لكل بند في الطلب).\n2. ترقية برنامج تشغيل قاعدة البيانات من 3.1 إلى 4.0.\n3. إضافة سجلات منظّمة لجميع الطلبات.\n\nالإعدادات: دون تغيير (maxPoolSize = 50).",
          },
          {
            kind: "table",
            id: "latency",
            title: "زمن الاستجابة p95 بحسب نقطة النهاية (بالمللي ثانية)",
            columns: [
              { key: "endpoint", label: "نقطة النهاية" },
              { key: "db", label: "تستخدم قاعدة البيانات" },
              { key: "before", label: "قبل 14:00", numeric: true },
              { key: "after", label: "بعد 14:00", numeric: true },
            ],
            rows: [
              { endpoint: "GET /orders/{id}", db: "نعم", before: 180, after: 1450 },
              { endpoint: "GET /orders", db: "نعم", before: 220, after: 900 },
              { endpoint: "GET /products", db: "نعم", before: 120, after: 610 },
              { endpoint: "POST /checkout", db: "نعم", before: 300, after: 1700 },
              { endpoint: "GET /health", db: "لا", before: 5, after: 5 },
              { endpoint: "GET /static/config", db: "لا", before: 8, after: 9 },
            ],
          },
          {
            kind: "table",
            id: "resources",
            title: "مؤشرات الموارد قبل الساعة 14:00 وبعدها",
            columns: [
              { key: "metric", label: "المؤشر" },
              { key: "before", label: "قبل" },
              { key: "after", label: "بعد" },
            ],
            rows: [
              { metric: "استخدام معالج قاعدة البيانات", before: "35%", after: "38%" },
              { metric: "استعلامات قاعدة البيانات في الثانية", before: "900", after: "1,400" },
              { metric: "استخدام معالج خادم التطبيق", before: "40%", after: "42%" },
              { metric: "اتصالات قاعدة البيانات المفتوحة لكل خادم تطبيق", before: "نحو 45", after: "10 (لم تتجاوز 10)" },
              { metric: "انتظار اتصال بقاعدة البيانات (p95)", before: "2 مللي ثانية", after: "850 مللي ثانية" },
            ],
          },
          {
            kind: "memo",
            id: "driver-notes",
            title: "برنامج تشغيل قاعدة البيانات 4.0: ملاحظات الترقية (مقتطف)",
            author: { name: "مطوّرو برنامج التشغيل" },
            body:
              "تحليل أسرع للاستعلامات وإعدادات TLS افتراضية محسّنة.\n\nتغيير غير متوافق مع الإصدارات السابقة: أُعيدت تسمية الإعداد maxPoolSize ليصبح pool.max. تُتجاهل الإعدادات غير المعروفة دون أي تحذير.\n\nالقيمة الافتراضية لـpool.max: 10 اتصالات.",
          },
        ],
        task: {
          kind: "written",
          prompt:
            "اكتب تشخيصك الموجّه إلى {{manager}}: الأسباب المرجّحة مرتّبة، والأدلة المؤيدة والمعارضة لكل منها، وخطوتا التحقق التاليتان، وما ستفعله الآن لحماية العملاء.",
          written: { format: "free" },
        },
        probe: { prompt: "ما النتيجة التي ستجعلك تتخلى عن فرضيتك الأولى؟" },
        twist: {
          change: "لا يمكن التراجع عن الإصدار، لأنه تضمّن ترحيلًا لقاعدة البيانات لا يمكن عكسه.",
          prompt: "ماذا تفعل الآن؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.problem-diagnosis",
            anchors: [
              "Blames the most visible change, such as the recommendations block, without checking it against the endpoint data.",
              "Names one plausible cause but ignores evidence against it, such as product and checkout endpoints also slowing.",
              "Lists several causes and narrows them with the data: every database endpoint slowed while the database itself is not busy.",
              "Ranks connection pool exhaustion first, citing the 10-connection ceiling, 850 ms wait and flat database CPU, with the new block as an aggravating factor.",
              "As level 4, and finds the mechanism in the driver notes: the renamed setting is ignored, so the pool fell from 50 to 10.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "States a single cause as certain, or refuses to commit without more data.",
              "Acknowledges uncertainty in general without saying which points are unproven.",
              "Separates what the data shows from what needs checking, and names a check for each hypothesis.",
              "Gives different confidence to different causes and states the result that would confirm or rule out each.",
              "As level 4, and names where to confirm the weakest link, such as the pool size the driver actually loaded at runtime.",
            ],
          },
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Proposes a generic action, such as adding servers, that would not relieve a fixed pool limit.",
              "Proposes a rollback or restart without linking it to the cause.",
              "Proposes an immediate mitigation tied to the diagnosis, such as setting pool.max or rolling back, and a way to verify it.",
              "Sequences actions by risk: configuration fix first, switching off the new block if needed, then verifying p95 and connection wait.",
              "As level 4, and adds a safeguard against recurrence, such as failing startup on unknown settings or alerting on connection wait.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots that the driver ignores the old maxPoolSize setting, so the pool fell to the default of 10.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["maxpoolsize", "pool.max", "renamed", "default 10", "ignored", "أُعيدت تسمية", "القيمة الافتراضية", "10 اتصالات", "تُتجاهل"],
          },
          {
            text: "Notes every database endpoint slowed while non-database endpoints did not.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["all database endpoints", "health", "static", "جميع نقاط النهاية", "قاعدة البيانات", "health"],
          },
          {
            text: "Notes database CPU is flat while connection wait jumped.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["connection wait", "850", "database cpu", "38%", "انتظار الاتصال", "معالج قاعدة البيانات"],
          },
          {
            text: "Treats the recommendations block as an aggravating factor that adds queries.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["n+1", "1,400", "more queries", "recommendations", "استعلامات أكثر", "المقترحات"],
          },
          {
            text: "Proposes an immediate fix and how to verify it.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["set pool.max", "feature flag", "verify", "p95", "ضبط pool.max", "مفتاح الميزة", "التحقق"],
          },
        ],
        redFlags: [
          {
            text: "Blames logging or the new block without checking the evidence.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["logging is the cause", "the new block is the cause", "السجلات هي السبب", "القسم الجديد هو السبب"],
          },
          {
            text: "Proposes scaling up the database.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["bigger database", "scale the database", "قاعدة بيانات أكبر", "توسيع قاعدة البيانات"],
          },
          {
            text: "Claims certainty without any checks.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["definitely", "certainly", "بالتأكيد", "قطعًا"],
          },
        ],
        embeddedDetail: {
          description:
            "The driver notes say maxPoolSize was renamed pool.max and unknown settings are ignored, so the unchanged configuration now gives a pool of 10 instead of 50, matching the 10-connection ceiling.",
          location: "driver 4.0 upgrade notes, read with the configuration line in the release notes",
          keywords: ["maxpoolsize", "pool.max", "renamed", "default 10", "أُعيدت تسمية", "القيمة الافتراضية"],
        },
        probeTargets: ["technical.calibrated-depth"],
        twistTargets: ["technical.applying-knowledge"],
      },
    },
  },
  // ═════════════════════════ DATA ANALYTICS ═════════════════════════
  {
    id: "tech-da-01-conversion-metric",
    type: "TECHNICAL_TASK",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 2, stakes: 3, timePressure: 3, informationGaps: 3 },
    targets: ["technical.problem-diagnosis", "technical.role-knowledge", "critical-thinking.quantitative-reasoning"],
    roleFamilies: ["data-analytics"],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "A 28% lift?",
        scenario:
          "{{company}} launched a new checkout design on 15 March. {{report2}}, an analyst in your team, reports that conversion rose from 3.2% to 4.1%, a 28% lift, and recommends rolling the design out to all markets. {{manager}} asks you to check the analysis before Thursday's decision meeting. {{report2}}'s summary and the underlying figures are attached.",
        materials: [
          {
            kind: "memo",
            id: "summary",
            title: "Checkout redesign: results",
            author: { name: "{{report2}}", role: "{{report2.role}}" },
            body:
              "Metric: conversion = orders divided by visits to the checkout page.\n\nBefore (1–14 March): 3.2%.\nAfter (15–28 March): 4.1%.\n\nLift: +28%. Recommendation: roll out to all markets.",
          },
          {
            kind: "table",
            id: "figures",
            title: "Underlying figures",
            caption: "The new design adds a 'review your basket' page before the checkout page.",
            columns: [
              { key: "period", label: "Period" },
              { key: "sessions", label: "Site sessions", numeric: true },
              { key: "checkout", label: "Checkout page visits", numeric: true },
              { key: "orders", label: "Orders", numeric: true },
            ],
            rows: [
              { period: "1–14 March", sessions: 400000, checkout: 50000, orders: 1600 },
              { period: "15–28 March", sessions: 395000, checkout: 36000, orders: 1476 },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your reply to {{report2}} and {{manager}}: is the conclusion supported? What would you measure instead, and what do you recommend?",
          written: { format: "email" },
        },
        probe: { prompt: "What would change your mind? What data would show the new design is better after all?" },
        twist: {
          change: "{{manager}} says there is no time for a controlled test: the decision on all markets must be made on Thursday.",
          prompt: "What do you recommend, and how do you limit the risk?",
        },
      },
      ar: {
        title: "زيادة بنسبة 28%؟",
        scenario:
          "أطلقت {{company}} تصميمًا جديدًا لصفحة الدفع في 15 مارس. أفاد {{report2}}، أحد المحللين في فريقك، بأن معدل التحويل ارتفع من 3.2% إلى 4.1%، أي بزيادة 28%، وأوصى بتعميم التصميم على جميع الأسواق. طلب منك {{manager}} مراجعة التحليل قبل اجتماع القرار يوم الخميس. مرفق ملخص {{report2}} والأرقام التفصيلية.",
        materials: [
          {
            kind: "memo",
            id: "summary",
            title: "إعادة تصميم صفحة الدفع: النتائج",
            author: { name: "{{report2}}", role: "{{report2.role}}" },
            body:
              "المقياس: معدل التحويل = الطلبات مقسومة على زيارات صفحة الدفع.\n\nقبل (1–14 مارس): 3.2%.\nبعد (15–28 مارس): 4.1%.\n\nالزيادة: +28%. التوصية: التعميم على جميع الأسواق.",
          },
          {
            kind: "table",
            id: "figures",
            title: "الأرقام التفصيلية",
            caption: "يضيف التصميم الجديد صفحة «راجع سلتك» قبل صفحة الدفع.",
            columns: [
              { key: "period", label: "الفترة" },
              { key: "sessions", label: "جلسات الموقع", numeric: true },
              { key: "checkout", label: "زيارات صفحة الدفع", numeric: true },
              { key: "orders", label: "الطلبات", numeric: true },
            ],
            rows: [
              { period: "1–14 مارس", sessions: 400000, checkout: 50000, orders: 1600 },
              { period: "15–28 مارس", sessions: 395000, checkout: 36000, orders: 1476 },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب ردّك على {{report2}} و{{manager}}: هل الاستنتاج مدعوم بالأدلة؟ وما الذي ستقيسه بدلًا من ذلك، وبماذا توصي؟",
          written: { format: "email" },
        },
        probe: { prompt: "ما الذي قد يغيّر رأيك؟ وما البيانات التي قد تُظهر أن التصميم الجديد أفضل فعلًا؟" },
        twist: {
          change: "قال {{manager}} إنه لا وقت لاختبار مضبوط، وإن قرار التعميم على جميع الأسواق يجب أن يُتخذ يوم الخميس.",
          prompt: "بماذا توصي، وكيف تحدّ من المخاطر؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.problem-diagnosis",
            anchors: [
              "Accepts the 28% lift as shown.",
              "Senses something is off, such as the comparison periods, but does not find the denominator problem.",
              "Shows that checkout visits fell because a page was added before checkout, so the rate rose while orders fell.",
              "Quantifies it: orders fell about 8% and orders per session fell from 0.40% to about 0.37%, so the design may be worse.",
              "As level 4, and notes other threats, such as a before-and-after comparison with no control group, and what each would bias.",
            ],
          },
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Suggests no better metric, or one with the same flaw.",
              "Suggests a better metric vaguely, such as overall conversion, without defining it.",
              "Recommends a metric with a stable denominator, such as orders per session or per basket started, and explains why.",
              "Recommends a controlled test with a primary metric, guardrails such as revenue per session, and a sample size check.",
              "As level 4, and adds how to read the funnel step by step to see where the new page loses or gains customers.",
            ],
          },
          {
            competencyKey: "critical-thinking.quantitative-reasoning",
            anchors: [
              "Makes arithmetic errors or repeats the analyst's figures without checking them.",
              "Recomputes one figure correctly but does not compare like with like.",
              "Recomputes orders per session for both periods and the change in orders correctly.",
              "Separates the effect of the changed denominator from any real change, and states the size of each.",
              "As level 4, and considers whether the small change in sessions or seasonality could explain the remaining difference.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "Says nothing could change the conclusion.",
              "Says more data is needed, without saying which.",
              "Names data that would change the view, such as a controlled test showing higher orders per session.",
              "States the result threshold that would change the recommendation and how long a test would need to run.",
              "As level 4, and separates what the funnel already shows from what only a test can show.",
            ],
          },
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Recommends full rollout or full rejection with no risk control.",
              "Recommends delay without offering a decision for Thursday.",
              "Recommends a limited rollout, such as one market or half of traffic, with orders per session as the success measure.",
              "Designs the limited rollout as a quasi-test with a holdout group and a clear rollback trigger.",
              "As level 4, and states what Thursday's decision can and cannot claim, so leaders do not overread early results.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Shows that the added basket-review page shrank the denominator.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["denominator", "checkout visits fell", "basket review", "extra page", "المقام", "صفحة مراجعة السلة", "انخفضت الزيارات"],
          },
          {
            text: "Notes orders fell from 1,600 to 1,476.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["1,476", "1476", "orders fell", "8%", "انخفضت الطلبات"],
          },
          {
            text: "Computes orders per session: 0.40% to about 0.37%.",
            competencyKey: "critical-thinking.quantitative-reasoning",
            keywords: ["per session", "0.4%", "0.37%", "لكل جلسة"],
          },
          {
            text: "Recommends a controlled test with a stable metric.",
            competencyKey: "technical.role-knowledge",
            keywords: ["a/b test", "control group", "orders per session", "اختبار a/b", "مجموعة ضابطة", "الطلبات لكل جلسة"],
          },
        ],
        redFlags: [
          {
            text: "Accepts the 28% lift.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["28% lift", "great result", "زيادة 28%", "نتيجة ممتازة"],
          },
          {
            text: "Focuses only on statistical significance of the new rate.",
            competencyKey: "technical.role-knowledge",
            keywords: ["significant", "p-value", "دلالة إحصائية"],
          },
          {
            text: "Recommends rollout to all markets now.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["all markets now", "roll out everywhere", "جميع الأسواق فورًا"],
          },
        ],
        embeddedDetail: {
          description:
            "The caption says the new design adds a basket-review page before checkout, so fewer people reach the checkout page; the rate rises while orders fall from 1,600 to 1,476.",
          location: "caption of the underlying figures table",
          keywords: ["basket review", "extra page", "denominator", "1,476", "صفحة «راجع سلتك»", "المقام"],
        },
        probeTargets: ["technical.calibrated-depth"],
        twistTargets: ["technical.applying-knowledge"],
      },
    },
  },
  {
    id: "tech-da-02-ab-test-result",
    type: "TECHNICAL_TASK",
    difficulty: 5,
    dials: { ambiguity: 4, stakeholders: 3, conflictingConstraints: 4, stakes: 5, timePressure: 3, informationGaps: 5 },
    targets: ["technical.problem-diagnosis", "technical.role-knowledge", "technical.calibrated-depth"],
    roleFamilies: ["data-analytics"],
    minutes: 7,
    storyPhase: "late",
    content: {
      en: {
        title: "B wins?",
        scenario:
          "{{company}} tested a new pricing page (B) against the current page (A) for 3 weeks. Users were meant to be split 50/50 at random. {{report1}} reports that B wins, with conversion of 4.93% against 4.69%, and recommends switching all traffic to B. {{exec}} plans to announce the new pricing page next week. The test summary and results by device are attached.",
        materials: [
          {
            kind: "memo",
            id: "summary",
            title: "Pricing page test: summary",
            author: { name: "{{report1}}", role: "{{report1.role}}" },
            body:
              "Design: random 50/50 split, 3 weeks.\n\nA: 52,000 users, 2,440 conversions (4.69%).\nB: 46,000 users, 2,270 conversions (4.93%).\n\nRelative lift: +5.1%. p = 0.04 (one-tailed).\n\nRecommendation: switch all traffic to B.",
          },
          {
            kind: "table",
            id: "devices",
            title: "Results by device",
            caption: "Engineering note: variant B loads an extra pricing script; on older mobile browsers, the tracking event fires only after that script finishes loading.",
            columns: [
              { key: "variant", label: "Variant" },
              { key: "device", label: "Device" },
              { key: "users", label: "Users", numeric: true },
              { key: "conversions", label: "Conversions", numeric: true },
              { key: "rate", label: "Rate" },
            ],
            rows: [
              { variant: "A", device: "Desktop", users: 22000, conversions: 1540, rate: "7.0%" },
              { variant: "A", device: "Mobile", users: 30000, conversions: 900, rate: "3.0%" },
              { variant: "B", device: "Desktop", users: 24000, conversions: 1632, rate: "6.8%" },
              { variant: "B", device: "Mobile", users: 22000, conversions: 638, rate: "2.9%" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your assessment for {{report1}} and {{exec}}: can the result be trusted, what is going on, and what do you recommend?",
          written: { format: "email" },
        },
        probe: { prompt: "{{exec}} replies: 'So is B better or not? Yes or no.' Write your answer." },
        twist: {
          change: "Engineering confirms the tracking problem and fixes it. You have 1 week before the pricing decision.",
          prompt: "What do you do with the week? Describe the test you would run.",
        },
      },
      ar: {
        title: "هل فاز B؟",
        scenario:
          "اختبرت {{company}} صفحة أسعار جديدة (B) مقابل الصفحة الحالية (A) لمدة 3 أسابيع، وكان يُفترض توزيع المستخدمين عشوائيًا بنسبة 50/50. أفاد {{report1}} بأن B تفوّقت، بمعدل تحويل 4.93% مقابل 4.69%، وأوصى بتحويل كل الزيارات إلى B. ويعتزم {{exec}} الإعلان عن صفحة الأسعار الجديدة الأسبوع القادم. مرفق ملخص الاختبار والنتائج بحسب الجهاز.",
        materials: [
          {
            kind: "memo",
            id: "summary",
            title: "اختبار صفحة الأسعار: ملخص",
            author: { name: "{{report1}}", role: "{{report1.role}}" },
            body:
              "التصميم: توزيع عشوائي بنسبة 50/50، لمدة 3 أسابيع.\n\nA: 52,000 مستخدم، و2,440 تحويلًا (4.69%).\nB: 46,000 مستخدم، و2,270 تحويلًا (4.93%).\n\nالزيادة النسبية: +5.1%. p = 0.04 (اختبار أحادي الطرف).\n\nالتوصية: تحويل كل الزيارات إلى B.",
          },
          {
            kind: "table",
            id: "devices",
            title: "النتائج بحسب الجهاز",
            caption: "ملاحظة من الفريق الهندسي: تحمّل النسخة B نصًّا برمجيًا إضافيًا للأسعار، وفي متصفحات الجوال القديمة لا يُسجَّل حدث التتبع إلا بعد اكتمال تحميل هذا النص.",
            columns: [
              { key: "variant", label: "النسخة" },
              { key: "device", label: "الجهاز" },
              { key: "users", label: "المستخدمون", numeric: true },
              { key: "conversions", label: "التحويلات", numeric: true },
              { key: "rate", label: "المعدل" },
            ],
            rows: [
              { variant: "A", device: "الحاسوب المكتبي", users: 22000, conversions: 1540, rate: "7.0%" },
              { variant: "A", device: "الجوال", users: 30000, conversions: 900, rate: "3.0%" },
              { variant: "B", device: "الحاسوب المكتبي", users: 24000, conversions: 1632, rate: "6.8%" },
              { variant: "B", device: "الجوال", users: 22000, conversions: 638, rate: "2.9%" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب تقييمك الموجّه إلى {{report1}} و{{exec}}: هل يمكن الوثوق بالنتيجة، وما الذي يحدث فعلًا، وبماذا توصي؟",
          written: { format: "email" },
        },
        probe: { prompt: "ردّ {{exec}}: «إذن هل B أفضل أم لا؟ نعم أو لا.» اكتب إجابتك." },
        twist: {
          change: "أكّد الفريق الهندسي مشكلة التتبع وأصلحها. أمامك أسبوع واحد قبل قرار الأسعار.",
          prompt: "كيف ستستثمر هذا الأسبوع؟ صف الاختبار الذي ستجريه.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.problem-diagnosis",
            anchors: [
              "Accepts B as the winner from the overall rates.",
              "Notices the unequal group sizes but does not explain why they matter.",
              "Flags the sample ratio mismatch, 52,000 against 46,000 on a 50/50 design, as a sign the test is broken.",
              "Shows B is worse on both desktop and mobile; B's overall win comes only from having fewer mobile users, who convert less.",
              "Links the missing mobile users in B to the tracking script note, explaining both the mismatch and the reversal.",
            ],
          },
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Discusses only the p-value or uses statistical terms wrongly.",
              "Uses correct terms but applies them generically, such as saying more data is needed.",
              "Names the relevant concepts, sample ratio mismatch and Simpson's paradox, and what each implies here.",
              "Notes the one-tailed p of 0.04 is about 0.08 two-tailed, and that significance means little while assignment or tracking is broken.",
              "As level 4, and explains how to test a sample ratio mismatch formally and why segment results must be read before the total.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "Declares B better or worse as fact.",
              "Says the result is unclear without saying what is known and unknown.",
              "States that the test cannot support a decision either way, and what is needed to make it trustworthy.",
              "Separates what the data does show, B is not better in either segment, from what it cannot show, B's true effect.",
              "As level 4, and names who to consult and which logs to check to confirm the tracking explanation.",
            ],
          },
          {
            competencyKey: "communication.adapting-to-audience",
            anchors: [
              "Gives {{exec}} statistical jargon with no clear answer.",
              "Gives an answer but hedges it so much that {{exec}} cannot act on it.",
              "Answers directly, not proven and possibly worse, with one plain reason and a recommendation.",
              "Frames it around {{exec}}'s announcement: the risk of announcing a page that may lower conversions, and when a reliable answer is possible.",
              "As level 4, and gives {{exec}} a line to use with others that stays accurate.",
            ],
          },
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Reruns the same test unchanged or ships B anyway.",
              "Proposes a rerun without checking the fix or the sample size.",
              "Proposes a corrected rerun with a check for balanced groups, results by segment and a success metric agreed in advance.",
              "Calculates whether 1 week gives enough users to detect a realistic effect, and adjusts the plan, such as more traffic in the test.",
              "As level 4, and sets a decision rule in advance, including what to do if the week is too short to decide.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Flags the sample ratio mismatch.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["sample ratio", "52,000", "46,000", "unequal", "50/50", "عدم توازن العينة", "غير متساوية", "srm"],
          },
          {
            text: "Shows B is worse on both devices (Simpson's paradox).",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["simpson", "both devices", "desktop and mobile", "6.8%", "2.9%", "مفارقة سيمبسون", "كلا الجهازين", "الجوال والحاسوب"],
          },
          {
            text: "Links the missing mobile users to the tracking script.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["tracking", "script", "older mobile", "missing users", "التتبع", "النص البرمجي", "المتصفحات القديمة"],
          },
          {
            text: "Notes the one-tailed p-value.",
            competencyKey: "technical.role-knowledge",
            keywords: ["one-tailed", "two-tailed", "0.08", "أحادي الطرف", "ثنائي الطرف"],
          },
        ],
        redFlags: [
          {
            text: "Recommends switching to B.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["switch to b", "b wins", "ship b", "اعتماد b", "b هي الأفضل"],
          },
          {
            text: "Relies on the p-value alone.",
            competencyKey: "technical.role-knowledge",
            keywords: ["significant at 0.04", "p < 0.05", "دال إحصائيًا"],
          },
          {
            text: "Declares B definitely worse.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["b is definitely worse", "b أسوأ بالتأكيد"],
          },
        ],
        embeddedDetail: {
          description:
            "The engineering note says B's tracking event fires only after an extra script loads on older mobile browsers, so mobile users drop out of B's data, causing the 52,000 against 46,000 mismatch and the misleading overall win.",
          location: "caption of the results-by-device table",
          keywords: ["tracking", "script", "older mobile", "mismatch", "التتبع", "المتصفحات القديمة", "عدم التوازن"],
        },
        probeTargets: ["communication.adapting-to-audience"],
        twistTargets: ["technical.applying-knowledge"],
      },
    },
  },
  // ═════════════════════════ PRODUCT MANAGEMENT ═════════════════════════
  {
    id: "tech-pm-01-reschedule-spec",
    type: "TECHNICAL_TASK",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 2, stakes: 2, timePressure: 2, informationGaps: 2 },
    targets: ["technical.role-knowledge", "technical.applying-knowledge", "product-thinking.feature-prioritisation"],
    roleFamilies: ["product-management"],
    minutes: 7,
    storyPhase: "early",
    content: {
      en: {
        title: "Move my delivery",
        scenario:
          "{{company}}'s delivery app lets customers track orders but not change them. Support handles about 1,800 calls a month from customers who want to move their delivery date. You are the product manager, and the team can start building next sprint. Write a short spec for letting customers reschedule a delivery in the app. Support data and a note from {{specialist}} in the warehouse are attached.",
        materials: [
          {
            kind: "table",
            id: "calls",
            title: "Reschedule calls to support, last month",
            columns: [
              { key: "reason", label: "Reason" },
              { key: "calls", label: "Calls", numeric: true },
            ],
            rows: [
              { reason: "Not at home on the delivery day", calls: 1050 },
              { reason: "Wants it earlier", calls: 420 },
              { reason: "Also wants to change the address", calls: 210 },
              { reason: "Other", calls: 120 },
            ],
          },
          {
            kind: "email",
            id: "warehouse",
            title: "Note from {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "Rescheduling: warehouse constraints",
            sentAt: "Monday 10:05",
            body:
              "Routes for the next day are fixed at 18:00. Any change after 18:00 the day before cannot be applied. We can offer any day in the next 14 days. Changing the address as well as the date needs a new route check, so please keep that separate for now.",
            footnote: "Also: orders paid by cash on delivery are booked into separate collection slots, so they must still be rescheduled by phone.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write the spec: a user story, 4 to 6 acceptance criteria, and what is out of scope for the first version.",
          written: { format: "plan" },
        },
        probe: { prompt: "Which acceptance criterion is most likely to be missed in testing, and why?" },
        twist: {
          change: "Engineering says the first version can offer only the next 3 days, not the next 14.",
          prompt: "What changes in your spec, and how will you explain it to customers?",
        },
      },
      ar: {
        title: "غيّر موعد التوصيل",
        scenario:
          "يتيح تطبيق التوصيل في {{company}} للعملاء تتبّع طلباتهم دون تعديلها. يتلقى فريق الدعم نحو 1,800 اتصال شهريًا من عملاء يريدون تغيير موعد التوصيل. أنت مدير المنتج، ويستطيع الفريق بدء التطوير في الدورة القادمة. اكتب مواصفات موجزة لميزة تتيح للعملاء تغيير موعد التوصيل من التطبيق. مرفق بيانات الدعم وملاحظة من {{specialist}} في المستودع.",
        materials: [
          {
            kind: "table",
            id: "calls",
            title: "اتصالات تغيير الموعد الواردة إلى الدعم، الشهر الماضي",
            columns: [
              { key: "reason", label: "السبب" },
              { key: "calls", label: "الاتصالات", numeric: true },
            ],
            rows: [
              { reason: "لن يكون في المنزل يوم التوصيل", calls: 1050 },
              { reason: "يريد التوصيل في وقت أبكر", calls: 420 },
              { reason: "يريد تغيير العنوان أيضًا", calls: 210 },
              { reason: "أخرى", calls: 120 },
            ],
          },
          {
            kind: "email",
            id: "warehouse",
            title: "ملاحظة من {{specialist}}",
            from: { name: "{{specialist}}", role: "{{specialist.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "تغيير موعد التوصيل: قيود المستودع",
            sentAt: "الاثنين 10:05",
            body:
              "تُثبَّت مسارات اليوم التالي الساعة 18:00، ولا يمكن تطبيق أي تغيير بعد الساعة 18:00 من اليوم السابق. يمكننا تقديم أي يوم خلال الأيام الأربعة عشر القادمة. أما تغيير العنوان مع التاريخ فيتطلب تدقيقًا جديدًا للمسار، فأرجو فصله في الوقت الحالي.",
            footnote: "وأيضًا: الطلبات المدفوعة نقدًا عند الاستلام تُحجز في مواعيد تحصيل منفصلة، فيجب أن يظل تغيير موعدها عبر الهاتف.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب المواصفات: قصة مستخدم، و4 إلى 6 معايير قبول، وما يقع خارج نطاق النسخة الأولى.",
          written: { format: "plan" },
        },
        probe: { prompt: "أي معايير القبول أكثر عرضة للإغفال في الاختبار، ولماذا؟" },
        twist: {
          change: "أفاد الفريق الهندسي بأن النسخة الأولى لا يمكنها أن تتيح إلا الأيام الثلاثة القادمة، لا الأيام الأربعة عشر.",
          prompt: "ما الذي يتغيّر في مواصفاتك، وكيف ستشرح ذلك للعملاء؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Writes vague requirements, such as letting customers reschedule easily, with no testable criteria.",
              "Writes a user story and criteria, but the criteria are not testable or miss key states.",
              "Writes a clear user story and testable criteria covering the 18:00 cut-off, the 14-day window and confirmation to the customer.",
              "Covers edge cases, such as an order already out for delivery or a change at 17:59, with expected behaviour for each.",
              "As level 4, and adds how success will be measured, such as fewer reschedule calls, and what will be logged to check it.",
            ],
          },
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Ignores the warehouse constraints.",
              "Mentions the constraints but does not turn them into requirements.",
              "Turns the cut-off, the window and the address limit into explicit rules in the criteria.",
              "Notices that cash-on-delivery orders must be excluded, and specifies what those customers see instead.",
              "As level 4, and designs the exclusion so it can be removed later without rework.",
            ],
          },
          {
            competencyKey: "product-thinking.feature-prioritisation",
            anchors: [
              "Includes everything, such as address changes and cash orders, in the first version.",
              "Cuts scope without reasons tied to value or effort.",
              "Keeps the first version to date changes for prepaid orders, which cover most calls, and explains what is deferred.",
              "Uses the call data to justify scope, about 1,470 of 1,800 calls are date-only, and names the next increment.",
              "As level 4, and plans how results from the first version will decide whether address changes come next.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Excludes cash-on-delivery orders and directs those customers to phone support.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["cash on delivery", "by phone", "exclude", "الدفع عند الاستلام", "الهاتف", "استثناء"],
          },
          {
            text: "Includes the 18:00 cut-off on the day before.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["18:00", "cut-off", "day before", "اليوم السابق", "الساعة 18:00"],
          },
          {
            text: "Writes testable criteria in a given-when-then or similar form.",
            competencyKey: "technical.role-knowledge",
            keywords: ["given", "when", "then", "acceptance criteria", "بافتراض", "عندما", "معايير القبول"],
          },
          {
            text: "Puts address changes out of scope, with a reason.",
            competencyKey: "product-thinking.feature-prioritisation",
            keywords: ["out of scope", "address", "later", "خارج النطاق", "العنوان", "لاحقًا"],
          },
        ],
        redFlags: [
          {
            text: "Allows changes up to the delivery day.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["any time", "same day", "أي وقت", "اليوم نفسه"],
          },
          {
            text: "Includes address changes in the first version.",
            competencyKey: "product-thinking.feature-prioritisation",
            keywords: ["change address and date", "address change included", "تغيير العنوان والتاريخ"],
          },
          {
            text: "Writes untestable criteria.",
            competencyKey: "technical.role-knowledge",
            keywords: ["easy to use", "user-friendly", "intuitive", "سهل الاستخدام"],
          },
        ],
        embeddedDetail: {
          description: "{{specialist}}'s footnote says cash-on-delivery orders are booked into separate collection slots and must still be rescheduled by phone.",
          location: "footnote of {{specialist}}'s email",
          keywords: ["cash on delivery", "collection slots", "by phone", "الدفع عند الاستلام", "عبر الهاتف"],
        },
        probeTargets: ["technical.role-knowledge"],
        twistTargets: ["technical.applying-knowledge"],
      },
    },
  },
  {
    id: "tech-pm-02-launch-plan-estimate",
    type: "TECHNICAL_TASK",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 3, conflictingConstraints: 4, stakes: 4, timePressure: 4, informationGaps: 4 },
    targets: ["technical.calibrated-depth", "technical.problem-diagnosis", "judgment.risk-calibration"],
    roleFamilies: ["product-management"],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "Six weeks?",
        scenario:
          "{{company}} plans to launch in-app payments in its mobile app. {{report1}} has drafted the plan and says launch is possible in 6 weeks because the tasks run in parallel. Marketing wants to book a launch campaign based on that date. {{manager}} asks for your view before agreeing. The draft plan and {{report1}}'s notes are attached.",
        materials: [
          {
            kind: "table",
            id: "plan",
            title: "Launch plan (draft)",
            caption: "Draft total: 6 weeks.",
            columns: [
              { key: "id", label: "ID" },
              { key: "task", label: "Task" },
              { key: "weeks", label: "Weeks", numeric: true },
              { key: "depends", label: "Depends on" },
              { key: "owner", label: "Owner" },
            ],
            rows: [
              { id: "T1", task: "Payment integration", weeks: 3, depends: "None", owner: "{{specialist}}" },
              { id: "T2", task: "App screens", weeks: 3, depends: "None", owner: "2 app developers" },
              { id: "T3", task: "Final wording of terms", weeks: 1, depends: "None", owner: "Product" },
              { id: "T4", task: "Legal review of terms", weeks: 1, depends: "T3", owner: "Legal" },
              { id: "T5", task: "Translation into 2 languages", weeks: 2, depends: "T4", owner: "Agency" },
              { id: "T6", task: "Testing", weeks: 2, depends: "T1, T2, T5", owner: "Shared test team" },
            ],
          },
          {
            kind: "email",
            id: "notes",
            title: "Notes from {{report1}}",
            from: { name: "{{report1}}", role: "{{report1.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "Payments launch: notes",
            sentAt: "Tuesday 15:10",
            body:
              "{{specialist}} is our only payments engineer. App store review usually takes 3 to 7 days, and a rejection adds about a week; it is not in the plan yet. The test team is shared with another project.",
            footnote: "PS: {{specialist}} is booked on the company security audit in weeks 3 and 4.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your assessment for {{manager}}: is 6 weeks realistic? Show the critical path, the main risks, and what you propose.",
          written: { format: "memo" },
        },
        probe: { prompt: "Which estimate do you trust least, and how would you firm it up this week?" },
        twist: {
          change: "Marketing has already booked a launch event at the end of week 7, and it cannot move.",
          prompt: "What do you propose now?",
        },
      },
      ar: {
        title: "ستة أسابيع؟",
        scenario:
          "تخطط {{company}} لإطلاق خاصية الدفع داخل تطبيقها للجوال. أعدّ {{report1}} مسودة الخطة، ويرى أن الإطلاق ممكن خلال 6 أسابيع لأن المهام تسير بالتوازي. يريد فريق التسويق حجز حملة إطلاق بناءً على هذا الموعد. يطلب {{manager}} رأيك قبل الموافقة. مرفق مسودة الخطة وملاحظات {{report1}}.",
        materials: [
          {
            kind: "table",
            id: "plan",
            title: "خطة الإطلاق (مسودة)",
            caption: "المدة الإجمالية في المسودة: 6 أسابيع.",
            columns: [
              { key: "id", label: "الرمز" },
              { key: "task", label: "المهمة" },
              { key: "weeks", label: "الأسابيع", numeric: true },
              { key: "depends", label: "تعتمد على" },
              { key: "owner", label: "المسؤول" },
            ],
            rows: [
              { id: "T1", task: "تكامل الدفع", weeks: 3, depends: "لا شيء", owner: "{{specialist}}" },
              { id: "T2", task: "شاشات التطبيق", weeks: 3, depends: "لا شيء", owner: "مطوّرا تطبيقات" },
              { id: "T3", task: "الصياغة النهائية للشروط", weeks: 1, depends: "لا شيء", owner: "فريق المنتج" },
              { id: "T4", task: "المراجعة القانونية للشروط", weeks: 1, depends: "T3", owner: "الفريق القانوني" },
              { id: "T5", task: "الترجمة إلى لغتين", weeks: 2, depends: "T4", owner: "وكالة خارجية" },
              { id: "T6", task: "الاختبار", weeks: 2, depends: "T1، T2، T5", owner: "فريق اختبار مشترك" },
            ],
          },
          {
            kind: "email",
            id: "notes",
            title: "ملاحظات من {{report1}}",
            from: { name: "{{report1}}", role: "{{report1.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "إطلاق خاصية الدفع: ملاحظات",
            sentAt: "الثلاثاء 15:10",
            body:
              "{{specialist}} هو مهندس المدفوعات الوحيد لدينا. تستغرق مراجعة متجر التطبيقات عادةً من 3 إلى 7 أيام، ويضيف الرفض نحو أسبوع، وهذا غير مدرج في الخطة بعد. فريق الاختبار مشترك مع مشروع آخر.",
            footnote: "ملاحظة: {{specialist}} محجوز للتدقيق الأمني للشركة في الأسبوعين 3 و4.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب تقييمك الموجّه إلى {{manager}}: هل مدة 6 أسابيع واقعية؟ وضّح المسار الحرج والمخاطر الرئيسية وما تقترحه.",
          written: { format: "memo" },
        },
        probe: { prompt: "أي تقدير تثق به أقل من غيره، وكيف ستتحقق منه هذا الأسبوع؟" },
        twist: {
          change: "حجز فريق التسويق بالفعل حفل إطلاق في نهاية الأسبوع 7، ولا يمكن تغيير موعده.",
          prompt: "ماذا تقترح الآن؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "Accepts 6 weeks, or rejects it without working out an alternative.",
              "Says the plan is optimistic without quantifying by how much.",
              "Gives a realistic range, about 8 to 9 weeks, and states the main assumptions behind it.",
              "Attaches different confidence to each estimate, flags the least reliable ones such as app store review, and says how to firm them up.",
              "As level 4, and names who to consult on each weak estimate, such as Legal on review time.",
            ],
          },
          {
            competencyKey: "technical.problem-diagnosis",
            anchors: [
              "Does not identify the dependency chain or the missing tasks.",
              "Spots one issue, such as app store review, but misses the dependency chain or {{specialist}}'s booking.",
              "Works out the critical path, wording, legal, translation, then testing, plus app store review, finishing around week 8.",
              "Finds that {{specialist}}'s audit in weeks 3 and 4 pushes payment integration to week 5, and shows how that moves testing.",
              "As level 4, and notes the single-engineer dependency and the shared test team as risks beyond the date itself.",
            ],
          },
          {
            competencyKey: "judgment.risk-calibration",
            anchors: [
              "Ignores risks or treats every risk as equally serious.",
              "Lists risks without judging likelihood or impact.",
              "Ranks the main risks by likelihood and impact, such as an app store rejection adding a week.",
              "Proposes proportionate mitigations, such as an early app store submission, and buffers the date accordingly.",
              "As level 4, and recommends a date marketing can rely on, with a stated confidence and a trigger for revisiting it.",
            ],
          },
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Promises week 7 without changing anything.",
              "Proposes working harder or overtime without changing the plan.",
              "Proposes specific changes to meet week 7, such as starting legal review now or launching in one language first.",
              "Re-plans the critical path, such as moving the audit booking or a limited launch, and states the risk that remains.",
              "As level 4, and proposes a fallback for the event, such as a preview or waiting list, if app store review fails.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots {{specialist}}'s audit booking in weeks 3 and 4.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["security audit", "weeks 3 and 4", "only payments engineer", "التدقيق الأمني", "الأسبوعين 3 و4", "مهندس المدفوعات الوحيد"],
          },
          {
            text: "Identifies the critical path through wording, legal review, translation and testing.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["critical path", "dependency", "legal", "translation", "المسار الحرج", "الاعتمادية", "المراجعة القانونية", "الترجمة"],
          },
          {
            text: "Adds app store review time.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["app store", "review", "rejection", "متجر التطبيقات", "الرفض"],
          },
          {
            text: "Gives a realistic range of about 8 to 9 weeks.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["8 weeks", "9 weeks", "8 to 9", "8 أسابيع", "9 أسابيع"],
          },
        ],
        redFlags: [
          {
            text: "Agrees to 6 weeks.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["6 weeks is fine", "achievable", "6 أسابيع ممكنة", "قابل للتحقيق"],
          },
          {
            text: "Relies on overtime as the main fix.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["overtime", "work weekends", "عمل إضافي", "العمل في العطلات"],
          },
          {
            text: "Treats parallel tasks as independent of each other.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["all in parallel", "independent", "كلها بالتوازي", "مستقلة"],
          },
        ],
        embeddedDetail: {
          description:
            "{{report1}}'s footnote says {{specialist}}, the only payments engineer, is booked on the security audit in weeks 3 and 4, so payment integration cannot finish before week 5.",
          location: "footnote of {{report1}}'s email",
          keywords: ["security audit", "weeks 3 and 4", "التدقيق الأمني", "الأسبوعين 3 و4"],
        },
        probeTargets: ["technical.calibrated-depth"],
        twistTargets: ["technical.applying-knowledge"],
      },
    },
  },
  // ═════════════════════════ OPERATIONS ═════════════════════════
  {
    id: "tech-ops-01-warehouse-bottleneck",
    type: "TECHNICAL_TASK",
    difficulty: 3,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 3, stakes: 3, timePressure: 2, informationGaps: 3 },
    targets: ["technical.problem-diagnosis", "technical.applying-knowledge", "management.resource-allocation"],
    roleFamilies: ["operations"],
    minutes: 7,
    storyPhase: "early",
    content: {
      en: {
        title: "The afternoon queue",
        scenario:
          "{{company}}'s warehouse misses the 17:00 courier cut-off for about 30% of afternoon orders. {{manager}} has noticed that picked orders pile up near the picking area every afternoon and proposes hiring 2 more pickers. You run warehouse operations, and {{manager}} wants your recommendation before anyone is hired. Station capacities, staffing and demand are attached.",
        materials: [
          {
            kind: "table",
            id: "stations",
            title: "Station capacity and staffing",
            columns: [
              { key: "station", label: "Station" },
              { key: "units", label: "People or machines" },
              { key: "rate", label: "Orders per hour, each", numeric: true },
              { key: "hours", label: "Hours staffed" },
            ],
            rows: [
              { station: "Picking", units: "3 pickers", rate: 45, hours: "08:00–17:00" },
              { station: "Packing", units: "Station 1", rate: 55, hours: "08:00–17:00" },
              { station: "Packing", units: "Station 2", rate: 55, hours: "08:00–12:00" },
              { station: "Labelling", units: "1 machine", rate: 200, hours: "08:00–17:00" },
              { station: "Loading", units: "2 loaders", rate: 70, hours: "08:00–17:00" },
            ],
          },
          {
            kind: "table",
            id: "demand",
            title: "Average orders arriving per hour",
            columns: [
              { key: "period", label: "Period" },
              { key: "orders", label: "Orders per hour", numeric: true },
            ],
            rows: [
              { period: "08:00–12:00", orders: 60 },
              { period: "13:00–17:00", orders: 80 },
            ],
          },
          {
            kind: "email",
            id: "manager-note",
            title: "Email from {{manager}}",
            from: { name: "{{manager}}", role: "{{manager.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "Pickers",
            sentAt: "Wednesday 16:40",
            body: "Every afternoon there's a queue of picked totes at the end of the picking area. We clearly need more pickers. Can you confirm so I can raise the hiring request?",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your recommendation to {{manager}}: where is the constraint, what is the evidence, what would you do, and what result do you expect?",
          written: { format: "email" },
        },
        probe: { prompt: "What would you measure on the floor tomorrow to confirm your diagnosis?" },
        twist: {
          change: "There is no budget for new hires. You can move people between stations, and pickers can be trained to pack in 1 day.",
          prompt: "Write your staffing plan for the afternoon.",
        },
      },
      ar: {
        title: "طابور ما بعد الظهر",
        scenario:
          "يفوت مستودعَ {{company}} موعدُ شركة الشحن الساعة 17:00 لنحو 30% من طلبات ما بعد الظهر. لاحظ {{manager}} أن الطلبات المجمّعة تتكدّس قرب منطقة الالتقاط كل يوم بعد الظهر، فاقترح توظيف عاملَي التقاط إضافيين. أنت مسؤول عمليات المستودع، ويريد {{manager}} توصيتك قبل أي توظيف. مرفق طاقة المحطات وتوزيع العاملين والطلب.",
        materials: [
          {
            kind: "table",
            id: "stations",
            title: "طاقة المحطات وتوزيع العاملين",
            columns: [
              { key: "station", label: "المحطة" },
              { key: "units", label: "العاملون أو الآلات" },
              { key: "rate", label: "الطلبات في الساعة لكل وحدة", numeric: true },
              { key: "hours", label: "ساعات التشغيل" },
            ],
            rows: [
              { station: "الالتقاط", units: "3 عمال التقاط", rate: 45, hours: "08:00–17:00" },
              { station: "التغليف", units: "المحطة 1", rate: 55, hours: "08:00–17:00" },
              { station: "التغليف", units: "المحطة 2", rate: 55, hours: "08:00–12:00" },
              { station: "وضع الملصقات", units: "آلة واحدة", rate: 200, hours: "08:00–17:00" },
              { station: "التحميل", units: "عاملا تحميل", rate: 70, hours: "08:00–17:00" },
            ],
          },
          {
            kind: "table",
            id: "demand",
            title: "متوسط الطلبات الواردة في الساعة",
            columns: [
              { key: "period", label: "الفترة" },
              { key: "orders", label: "الطلبات في الساعة", numeric: true },
            ],
            rows: [
              { period: "08:00–12:00", orders: 60 },
              { period: "13:00–17:00", orders: 80 },
            ],
          },
          {
            kind: "email",
            id: "manager-note",
            title: "رسالة من {{manager}}",
            from: { name: "{{manager}}", role: "{{manager.role}}" },
            to: [{ name: "{{you}}" }],
            subject: "عمال الالتقاط",
            sentAt: "الأربعاء 16:40",
            body: "كل يوم بعد الظهر يتشكّل طابور من صناديق الطلبات المجمّعة في نهاية منطقة الالتقاط. واضح أننا نحتاج إلى مزيد من عمال الالتقاط. هل تؤكد ذلك لأرفع طلب التوظيف؟",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب توصيتك إلى {{manager}}: أين يقع القيد، وما الدليل، وماذا ستفعل، وما النتيجة التي تتوقعها؟",
          written: { format: "email" },
        },
        probe: { prompt: "ما الذي ستقيسه في المستودع غدًا لتتأكد من تشخيصك؟" },
        twist: {
          change: "لا توجد ميزانية لتوظيف جديد. يمكنك نقل العاملين بين المحطات، ويمكن تدريب عمال الالتقاط على التغليف في يوم واحد.",
          prompt: "اكتب خطة توزيع العاملين لفترة ما بعد الظهر.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.problem-diagnosis",
            anchors: [
              "Agrees picking is the problem because that is where the queue is visible.",
              "Questions the hiring but does not identify the actual constraint.",
              "Identifies packing as the afternoon constraint: 55 orders an hour against 80 arriving, because Station 2 closes at 12:00.",
              "Explains the queue's location, picked totes waiting for packing, and estimates the afternoon backlog at about 100 orders.",
              "As level 4, and checks the other stations against afternoon demand to show no second constraint appears once packing is fixed.",
            ],
          },
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Recommends hiring pickers, which would make the queue longer.",
              "Recommends more packing capacity in general without a specific change.",
              "Recommends staffing Station 2 in the afternoon, such as moving the shift or a cross-trained picker, with the expected effect.",
              "Shows the new balance, picking 90, packing 110 and demand 80 an hour, and the effect on the morning.",
              "As level 4, and protects the constraint, such as staggered breaks at packing, and monitors the queue.",
            ],
          },
          {
            competencyKey: "management.resource-allocation",
            anchors: [
              "Allocates people by habit or by the most visible symptom.",
              "Moves people without checking the effect on other stations.",
              "Moves capacity to the constraint without new hires, and checks what the move costs elsewhere.",
              "Weighs options by cost and risk, such as shifting hours against cross-training, and picks the most efficient.",
              "As level 4, and sets a rule for moving staff when demand shifts, so the plan holds beyond this month.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "Claims the calculation proves the answer and needs no checking.",
              "Says it should be checked on the floor, without saying how.",
              "Proposes a concrete check, such as counting the tote queue and packing output each hour tomorrow.",
              "Names the result that would contradict the diagnosis, such as packers idle while totes wait, and what it would mean.",
              "As level 4, and notes that hourly averages may hide peaks within the afternoon, and how to measure them.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots that packing Station 2 is staffed only until 12:00.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["station 2", "12:00", "morning only", "afternoon", "المحطة 2", "صباحًا فقط", "بعد الظهر"],
          },
          {
            text: "Identifies packing as the bottleneck.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["bottleneck", "constraint", "packing", "عنق الزجاجة", "القيد", "التغليف"],
          },
          {
            text: "Rejects hiring pickers because it would lengthen the queue.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["not pickers", "no need to hire", "longer queue", "لا حاجة إلى التوظيف", "طابور أطول"],
          },
          {
            text: "Moves a cross-trained picker or the Station 2 shift to afternoon packing.",
            competencyKey: "management.resource-allocation",
            keywords: ["cross-train", "move", "shift", "تدريب", "نقل", "تغيير الوردية"],
          },
        ],
        redFlags: [
          {
            text: "Agrees to hire pickers.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["hire 2 pickers", "agree to hire", "أوافق على التوظيف", "توظيف عاملَي التقاط"],
          },
          {
            text: "Blames workers for being slow.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["work harder", "too slow", "بطء العمال", "يعملون ببطء"],
          },
          {
            text: "Uses daily totals only, missing the afternoon pattern.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["daily average", "per day", "المتوسط اليومي"],
          },
        ],
        embeddedDetail: {
          description: "The staffing table shows packing Station 2 is staffed only 08:00–12:00, so afternoon packing capacity halves to 55 orders an hour against 80 arriving.",
          location: "'Hours staffed' column of the station table",
          keywords: ["station 2", "08:00–12:00", "afternoon", "55", "المحطة 2", "بعد الظهر"],
        },
        probeTargets: ["technical.calibrated-depth"],
        twistTargets: ["technical.applying-knowledge", "management.resource-allocation"],
      },
    },
  },
  {
    id: "tech-ops-02-reorder-point",
    type: "TECHNICAL_TASK",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 2, conflictingConstraints: 3, stakes: 5, timePressure: 2, informationGaps: 4 },
    targets: ["technical.role-knowledge", "technical.calibrated-depth", "judgment.risk-calibration"],
    roleFamilies: ["operations"],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "The drive belt",
        scenario:
          "{{company}}'s production line depends on one spare part, a drive belt. When it runs out, the line stops, costing about 20,000 per day. The part ran out twice last quarter. The current reorder point is 80 units: average daily use of 8 multiplied by a 10-day lead time, with no safety stock. Purchasing switched supplier this year. {{manager}} asks you to review the reorder policy. Usage, order and cost data are attached.",
        materials: [
          {
            kind: "table",
            id: "usage",
            title: "Daily use, last 60 days",
            columns: [
              { key: "measure", label: "Measure" },
              { key: "value", label: "Value" },
            ],
            rows: [
              { measure: "Average use per day", value: "8 units" },
              { measure: "Standard deviation of daily use", value: "3 units" },
              { measure: "Highest single day", value: "16 units" },
            ],
          },
          {
            kind: "table",
            id: "orders",
            title: "Last 6 orders: lead time",
            caption: "Orders 3, 5 and 6 were placed with the new supplier; all future orders go to the new supplier.",
            columns: [
              { key: "order", label: "Order" },
              { key: "lead", label: "Lead time (days)", numeric: true },
            ],
            rows: [
              { order: "1", lead: 10 },
              { order: "2", lead: 11 },
              { order: "3", lead: 17 },
              { order: "4", lead: 12 },
              { order: "5", lead: 18 },
              { order: "6", lead: 16 },
            ],
          },
          {
            kind: "memo",
            id: "targets",
            title: "Service target and costs",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body: "Target: stock should cover demand during the lead time in 99% of order cycles.\n\nEach belt costs 150. Holding cost is about 25% of the item cost per year.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your recommendation to {{manager}}: a new reorder point and safety stock, how you calculated them, your assumptions, and what you would verify.",
          written: { format: "memo" },
        },
        probe: { prompt: "Which assumption in your calculation are you least sure of, and how would you check it?" },
        twist: {
          change: "Warehouse space limits this part to 120 units on site.",
          prompt: "How do you protect the line from stockouts now?",
        },
      },
      ar: {
        title: "سير الإدارة",
        scenario:
          "يعتمد خط الإنتاج في {{company}} على قطعة غيار واحدة هي سير الإدارة. إذا نفدت توقّف الخط، بتكلفة تقارب 20,000 يوميًا. نفدت القطعة مرتين في الربع الماضي. نقطة إعادة الطلب الحالية 80 وحدة: متوسط الاستهلاك اليومي 8 مضروبًا في مهلة توريد مدتها 10 أيام، دون مخزون أمان. غيّرت إدارة المشتريات المورّد هذا العام. يطلب منك {{manager}} مراجعة سياسة إعادة الطلب. مرفق بيانات الاستهلاك والطلبات والتكاليف.",
        materials: [
          {
            kind: "table",
            id: "usage",
            title: "الاستهلاك اليومي في آخر 60 يومًا",
            columns: [
              { key: "measure", label: "المقياس" },
              { key: "value", label: "القيمة" },
            ],
            rows: [
              { measure: "متوسط الاستهلاك اليومي", value: "8 وحدات" },
              { measure: "الانحراف المعياري للاستهلاك اليومي", value: "3 وحدات" },
              { measure: "أعلى استهلاك في يوم واحد", value: "16 وحدة" },
            ],
          },
          {
            kind: "table",
            id: "orders",
            title: "آخر 6 طلبات: مهلة التوريد",
            caption: "قُدّمت الطلبات 3 و5 و6 إلى المورّد الجديد، وجميع الطلبات القادمة ستُقدَّم إليه.",
            columns: [
              { key: "order", label: "الطلب" },
              { key: "lead", label: "مهلة التوريد (بالأيام)", numeric: true },
            ],
            rows: [
              { order: "1", lead: 10 },
              { order: "2", lead: 11 },
              { order: "3", lead: 17 },
              { order: "4", lead: 12 },
              { order: "5", lead: 18 },
              { order: "6", lead: 16 },
            ],
          },
          {
            kind: "memo",
            id: "targets",
            title: "مستوى الخدمة المستهدف والتكاليف",
            author: { name: "{{manager}}", role: "{{manager.role}}" },
            body: "المستهدف: أن يغطي المخزون الطلب خلال مهلة التوريد في 99% من دورات الطلب.\n\nتكلفة السير الواحد 150، وتكلفة الاحتفاظ بالمخزون نحو 25% من تكلفة القطعة سنويًا.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب توصيتك إلى {{manager}}: نقطة إعادة طلب جديدة ومخزون أمان، وطريقة حسابهما، وافتراضاتك، وما ستتحقق منه.",
          written: { format: "memo" },
        },
        probe: { prompt: "أي افتراض في حساباتك أنت أقل يقينًا به، وكيف ستتحقق منه؟" },
        twist: {
          change: "لا تتسع مساحة المستودع لأكثر من 120 وحدة من هذه القطعة.",
          prompt: "كيف تحمي خط الإنتاج من نفاد المخزون الآن؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Keeps the formula without safety stock, or uses an incorrect method.",
              "Adds a rough buffer, such as an extra 20%, without a method.",
              "Calculates safety stock with a standard method using demand variability and lead time, reaching a reorder point of about 160 to 185.",
              "Includes lead-time variability as well as demand variability, and explains why the old formula failed.",
              "As level 4, and compares the extra holding cost with the cost of a line stop to justify the service level.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "Presents the result as exact and certain.",
              "Says the figures are estimates without saying which matter most.",
              "States the key assumptions, such as stable demand and normal variation, and how to verify them.",
              "Notes that 3 orders from the new supplier is a thin basis, and sets a date to recalculate with more data.",
              "As level 4, and names whom to consult, such as the supplier on its committed lead time, to firm up the weakest input.",
            ],
          },
          {
            competencyKey: "judgment.risk-calibration",
            anchors: [
              "Ignores the cost of a stockout or treats it as minor.",
              "Notes stockouts are costly but does not weigh them against holding cost.",
              "Weighs the 20,000-a-day stop against the small cost of extra stock and sets a high service level.",
              "Matches caution to the stakes, such as a larger buffer while the new supplier is unproven, with a plan to reduce it later.",
              "As level 4, and adds early warnings, such as tracking open orders against the supplier's promised dates.",
            ],
          },
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Ignores the space limit or keeps a reorder point above 120.",
              "Lowers the reorder point to fit without addressing the higher risk.",
              "Proposes ways to cut lead time or its variability, such as smaller, more frequent orders or a supplier agreement.",
              "Combines options, such as stock held at the supplier, a second supplier and expediting rules, and checks the 120 limit holds.",
              "As level 4, and states the remaining risk and the trigger for using emergency supply.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the new supplier's lead time, about 17 days, rather than the average of all 6 orders.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["new supplier", "17 days", "orders 3, 5 and 6", "المورد الجديد", "المورّد الجديد", "17 يومًا"],
          },
          {
            text: "Includes demand and lead-time variability in safety stock.",
            competencyKey: "technical.role-knowledge",
            keywords: ["safety stock", "standard deviation", "variability", "z", "مخزون الأمان", "الانحراف المعياري", "التباين"],
          },
          {
            text: "Reaches a reorder point of about 160 to 185.",
            competencyKey: "technical.role-knowledge",
            keywords: ["170", "171", "175", "180", "reorder point", "نقطة إعادة الطلب"],
          },
          {
            text: "Compares holding cost with the cost of a line stop.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["20,000", "holding cost", "line stop", "تكلفة الاحتفاظ", "توقف الخط"],
          },
        ],
        redFlags: [
          {
            text: "Keeps the reorder point at 80.",
            competencyKey: "technical.role-knowledge",
            keywords: ["80 is enough", "keep 80", "80 كافية"],
          },
          {
            text: "Averages all 6 lead times without noting the supplier change.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["average lead time of 14", "14 days", "متوسط 14 يومًا", "14 يومًا"],
          },
          {
            text: "Recommends holding as much stock as possible regardless of cost.",
            competencyKey: "judgment.risk-calibration",
            keywords: ["as much as possible", "fill the warehouse", "أكبر قدر ممكن"],
          },
        ],
        embeddedDetail: {
          description:
            "The order table caption says orders 3, 5 and 6, the slow ones at 16 to 18 days, came from the new supplier, which handles all future orders; planning lead time should be about 17 days, not 10 or the overall average.",
          location: "caption of the last-6-orders table",
          keywords: ["new supplier", "orders 3, 5 and 6", "17", "المورّد الجديد", "الطلبات 3 و5 و6"],
        },
        probeTargets: ["technical.calibrated-depth"],
        twistTargets: ["technical.applying-knowledge"],
      },
    },
  },
  // ═════════════════════════ SALES ═════════════════════════
  {
    id: "tech-sales-01-forecast-review",
    type: "TECHNICAL_TASK",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 2, conflictingConstraints: 2, stakes: 3, timePressure: 2, informationGaps: 2 },
    targets: ["technical.role-knowledge", "technical.problem-diagnosis", "leadership.developing-others"],
    roleFamilies: ["sales"],
    minutes: 7,
    storyPhase: "early",
    content: {
      en: {
        title: "The commit forecast",
        scenario:
          "You manage a sales team at {{company}}. The quarter ends on 30 June. {{report2}} has submitted a commit forecast of 910 for the quarter (figures in thousands), counting every deal rated 80% or higher. You must submit the team forecast to {{manager}} tomorrow. {{report2}}'s pipeline and the company's stage guidelines are attached.",
        materials: [
          {
            kind: "table",
            id: "pipeline",
            title: "{{report2}}'s pipeline (thousands)",
            caption: "CRM note on D4: customer's last email says 'procurement freeze on all new suppliers until further notice'.",
            columns: [
              { key: "deal", label: "Deal" },
              { key: "type", label: "Type" },
              { key: "stage", label: "Stage" },
              { key: "value", label: "Value", numeric: true },
              { key: "prob", label: "Rep's probability" },
              { key: "close", label: "Expected close" },
              { key: "contact", label: "Last contact" },
            ],
            rows: [
              { deal: "D1", type: "Renewal, existing client", stage: "Contract sent", value: 180, prob: "90%", close: "20 Jun", contact: "3 days ago" },
              { deal: "D2", type: "New client", stage: "Discovery", value: 250, prob: "90%", close: "28 Jun", contact: "2 days ago" },
              { deal: "D3", type: "Upsell", stage: "Proposal", value: 120, prob: "60%", close: "15 Jul", contact: "1 week ago" },
              { deal: "D4", type: "New client", stage: "Negotiation", value: 480, prob: "80%", close: "25 Jun", contact: "5 weeks ago" },
              { deal: "D5", type: "Expansion", stage: "Proposal", value: 90, prob: "50%", close: "30 Jun", contact: "4 days ago" },
            ],
          },
          {
            kind: "table",
            id: "stages",
            title: "Company stage guidelines",
            columns: [
              { key: "stage", label: "Stage" },
              { key: "win", label: "Typical win rate" },
              { key: "time", label: "Typical time to close" },
            ],
            rows: [
              { stage: "Discovery", win: "10%", time: "90 days" },
              { stage: "Proposal", win: "30%", time: "45 days" },
              { stage: "Negotiation", win: "60%", time: "30 days" },
              { stage: "Contract sent", win: "85%", time: "10 days" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your feedback to {{report2}} on the forecast, including a revised commit figure and your reasoning.",
          written: { format: "message" },
        },
        probe: { prompt: "Which deal would you review first with {{report2}}, and what question would you ask?" },
        twist: {
          change: "{{manager}} tells you the team is short of target and asks you to submit {{report2}}'s 910 unchanged.",
          prompt: "Write your reply to {{manager}}.",
        },
      },
      ar: {
        title: "توقعات المبيعات المؤكدة",
        scenario:
          "تدير فريق مبيعات في {{company}}. ينتهي الربع في 30 يونيو. قدّم {{report2}} توقعات مؤكدة للربع قيمتها 910 (الأرقام بالآلاف)، احتسب فيها كل صفقة قدّر احتمالها بنسبة 80% أو أكثر. عليك تقديم توقعات الفريق إلى {{manager}} غدًا. مرفق قائمة صفقات {{report2}} وإرشادات المراحل المعتمدة في الشركة.",
        materials: [
          {
            kind: "table",
            id: "pipeline",
            title: "قائمة صفقات {{report2}} (بالآلاف)",
            caption: "ملاحظة في نظام إدارة العملاء عن D4: تقول آخر رسالة من العميل «تجميد المشتريات من جميع المورّدين الجدد حتى إشعار آخر».",
            columns: [
              { key: "deal", label: "الصفقة" },
              { key: "type", label: "النوع" },
              { key: "stage", label: "المرحلة" },
              { key: "value", label: "القيمة", numeric: true },
              { key: "prob", label: "احتمال المندوب" },
              { key: "close", label: "الإغلاق المتوقع" },
              { key: "contact", label: "آخر تواصل" },
            ],
            rows: [
              { deal: "D1", type: "تجديد لعميل حالي", stage: "أُرسل العقد", value: 180, prob: "90%", close: "20 يونيو", contact: "قبل 3 أيام" },
              { deal: "D2", type: "عميل جديد", stage: "الاستكشاف", value: 250, prob: "90%", close: "28 يونيو", contact: "قبل يومين" },
              { deal: "D3", type: "بيع إضافي", stage: "العرض", value: 120, prob: "60%", close: "15 يوليو", contact: "قبل أسبوع" },
              { deal: "D4", type: "عميل جديد", stage: "التفاوض", value: 480, prob: "80%", close: "25 يونيو", contact: "قبل 5 أسابيع" },
              { deal: "D5", type: "توسعة", stage: "العرض", value: 90, prob: "50%", close: "30 يونيو", contact: "قبل 4 أيام" },
            ],
          },
          {
            kind: "table",
            id: "stages",
            title: "إرشادات المراحل المعتمدة في الشركة",
            columns: [
              { key: "stage", label: "المرحلة" },
              { key: "win", label: "معدل الفوز المعتاد" },
              { key: "time", label: "المدة المعتادة حتى الإغلاق" },
            ],
            rows: [
              { stage: "الاستكشاف", win: "10%", time: "90 يومًا" },
              { stage: "العرض", win: "30%", time: "45 يومًا" },
              { stage: "التفاوض", win: "60%", time: "30 يومًا" },
              { stage: "أُرسل العقد", win: "85%", time: "10 أيام" },
            ],
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب ملاحظاتك إلى {{report2}} على التوقعات، متضمّنة رقمًا مؤكدًا معدّلًا وأسبابك.",
          written: { format: "message" },
        },
        probe: { prompt: "أي صفقة ستراجعها أولًا مع {{report2}}، وما السؤال الذي ستطرحه؟" },
        twist: {
          change: "أبلغك {{manager}} أن الفريق دون المستهدف، وطلب منك تقديم رقم {{report2}} البالغ 910 كما هو.",
          prompt: "اكتب ردّك على {{manager}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Accepts the 910 or applies the rep's percentages without question.",
              "Applies stage win rates mechanically without considering deal-specific evidence.",
              "Revises the commit to deals with strong evidence, about 180, and explains each change with stage and date criteria.",
              "Distinguishes commit, best case and pipeline, and uses stage guidance plus recent activity to place each deal.",
              "As level 4, and explains why forecast accuracy matters for planning, so the revised figure is seen as useful, not punitive.",
            ],
          },
          {
            competencyKey: "technical.problem-diagnosis",
            anchors: [
              "Misses the problems with individual deals.",
              "Spots one issue, such as D2's stage, but misses the others.",
              "Identifies D2 as too early, D3 as closing after the quarter, and D4 as stale after 5 weeks without contact.",
              "Finds the procurement freeze note on D4, the largest deal, and explains why it cannot be commit.",
              "As level 4, and spots the pattern: {{report2}} rates deals by hope rather than evidence, especially new clients.",
            ],
          },
          {
            competencyKey: "leadership.developing-others",
            anchors: [
              "Corrects the numbers with no explanation or support.",
              "Explains the changes but offers no way to improve future forecasts.",
              "Explains the reasoning so {{report2}} can apply it, and suggests specific next steps on the at-risk deals.",
              "Coaches {{report2}} to base probabilities on what customers have done, not said, and agrees a check-in.",
              "As level 4, and builds {{report2}}'s confidence while being clear about the standard expected next quarter.",
            ],
          },
          {
            competencyKey: "leadership.courage",
            anchors: [
              "Submits 910 as asked.",
              "Submits 910 with a vague caveat.",
              "Declines to submit 910 and explains the evidence for the revised figure clearly and respectfully.",
              "Gives {{manager}} an honest commit and a best case, and proposes actions to close the gap rather than hide it.",
              "As level 4, and takes accountability for the forecast, making the honest number easier for {{manager}} to use upward.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots the procurement freeze on D4.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["procurement freeze", "freeze", "d4", "تجميد المشتريات", "تجميد"],
          },
          {
            text: "Moves D3 out of the quarter because it closes after 30 June.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["d3", "15 jul", "next quarter", "after the quarter", "الربع القادم", "15 يوليو"],
          },
          {
            text: "Removes D2 from commit because it is only at discovery.",
            competencyKey: "technical.role-knowledge",
            keywords: ["discovery", "d2", "too early", "10%", "الاستكشاف", "مبكر"],
          },
          {
            text: "Gives a revised commit of about 180, with a best case.",
            competencyKey: "technical.role-knowledge",
            keywords: ["180", "best case", "commit", "أفضل الحالات", "المؤكد"],
          },
          {
            text: "Coaches {{report2}} to base probabilities on evidence.",
            competencyKey: "leadership.developing-others",
            keywords: ["evidence", "what the customer has done", "next step", "الأدلة", "ما فعله العميل", "الخطوة التالية"],
          },
        ],
        redFlags: [
          {
            text: "Accepts 910.",
            competencyKey: "technical.role-knowledge",
            keywords: ["910 is fine", "looks good", "910 مقبولة", "تبدو جيدة"],
          },
          {
            text: "Criticises {{report2}} without explaining why.",
            competencyKey: "leadership.developing-others",
            keywords: ["unrealistic again", "careless", "غير واقعي كالعادة", "إهمال"],
          },
          {
            text: "Uses a probability-weighted total as the commit figure.",
            competencyKey: "technical.role-knowledge",
            keywords: ["weighted total", "multiply each deal", "المجموع المرجّح"],
          },
        ],
        embeddedDetail: {
          description: "The CRM note on D4, the largest deal, says the customer has frozen purchases from all new suppliers, and there has been no contact for 5 weeks.",
          location: "caption of the pipeline table",
          keywords: ["procurement freeze", "d4", "5 weeks", "تجميد المشتريات", "5 أسابيع"],
        },
        probeTargets: ["technical.problem-diagnosis"],
        twistTargets: ["leadership.courage"],
      },
    },
  },
  {
    id: "tech-sales-02-discount-request",
    type: "TECHNICAL_TASK",
    difficulty: 4,
    dials: { ambiguity: 3, stakeholders: 4, conflictingConstraints: 4, stakes: 4, timePressure: 3, informationGaps: 3 },
    targets: ["technical.applying-knowledge", "technical.role-knowledge", "communication.persuasion"],
    roleFamilies: ["sales"],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "Twenty-five percent off",
        scenario:
          "{{client}}'s company wants a 3-year contract for {{company}}'s platform at a list price of 200 per year (figures in thousands). {{client}} asks for 25% off for all 3 years. {{report1}}, the account executive, wants to accept to close the deal this quarter. Discounts above 20% need {{exec}}'s approval. You lead the sales team. The deal economics and {{client}}'s latest email are attached.",
        materials: [
          {
            kind: "table",
            id: "economics",
            title: "Deal economics (thousands per year)",
            columns: [
              { key: "item", label: "Item" },
              { key: "value", label: "Value" },
            ],
            rows: [
              { item: "List price", value: "200" },
              { item: "Cost to serve", value: "90" },
              { item: "Discount authority", value: "Up to 10%: account executive; 10–20%: sales manager; above 20%: {{exec}}" },
              { item: "Average discount on 3-year deals last year", value: "12%" },
              { item: "Competitor's estimated price", value: "170–190" },
            ],
          },
          {
            kind: "email",
            id: "client-email",
            title: "Email from {{client}}",
            from: { name: "{{client}}", role: "{{client.role}}" },
            to: [{ name: "{{report1}}", role: "{{report1.role}}" }],
            cc: [{ name: "{{you}}" }],
            subject: "Contract terms",
            sentAt: "Thursday 09:30",
            body: "We like the platform and want to move ahead. To get this approved internally, we need 25% off for all 3 years.",
            footnote: "PS: our budget approved for this financial year is 160; next year's budget is set in March.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your recommendation to {{report1}}: what to offer, why, and how to present it to {{client}}.",
          written: { format: "message" },
        },
        probe: { prompt: "At what point would you walk away from this deal, and why?" },
        twist: {
          change: "{{client}} says a competitor has offered 30% off for 3 years, in writing.",
          prompt: "How do you adjust your recommendation?",
        },
      },
      ar: {
        title: "خصم بنسبة 25%",
        scenario:
          "تريد شركة {{client}} عقدًا لمدة 3 سنوات لمنصة {{company}} بسعر قائمة قدره 200 سنويًا (الأرقام بالآلاف). يطلب {{client}} خصمًا بنسبة 25% على السنوات الثلاث كلها. يريد {{report1}}، مسؤول الحساب، القبول لإغلاق الصفقة في هذا الربع. الخصم الذي يتجاوز 20% يحتاج إلى موافقة {{exec}}. أنت قائد فريق المبيعات. مرفق اقتصاديات الصفقة وآخر رسالة من {{client}}.",
        materials: [
          {
            kind: "table",
            id: "economics",
            title: "اقتصاديات الصفقة (بالآلاف سنويًا)",
            columns: [
              { key: "item", label: "البند" },
              { key: "value", label: "القيمة" },
            ],
            rows: [
              { item: "سعر القائمة", value: "200" },
              { item: "تكلفة تقديم الخدمة", value: "90" },
              { item: "صلاحية الخصم", value: "حتى 10%: مسؤول الحساب؛ من 10% إلى 20%: مدير المبيعات؛ أكثر من 20%: {{exec}}" },
              { item: "متوسط الخصم على عقود السنوات الثلاث في العام الماضي", value: "12%" },
              { item: "السعر التقديري لدى المنافس", value: "170–190" },
            ],
          },
          {
            kind: "email",
            id: "client-email",
            title: "رسالة من {{client}}",
            from: { name: "{{client}}", role: "{{client.role}}" },
            to: [{ name: "{{report1}}", role: "{{report1.role}}" }],
            cc: [{ name: "{{you}}" }],
            subject: "شروط العقد",
            sentAt: "الخميس 09:30",
            body: "أعجبتنا المنصة ونريد المضي قدمًا. ولكي نحصل على الموافقة داخليًا، نحتاج إلى خصم بنسبة 25% على السنوات الثلاث كلها.",
            footnote: "ملاحظة: الميزانية المعتمدة لدينا لهذه السنة المالية 160، وتُحدَّد ميزانية العام القادم في مارس.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب توصيتك إلى {{report1}}: ماذا يعرض، ولماذا، وكيف يقدّم العرض إلى {{client}}.",
          written: { format: "message" },
        },
        probe: { prompt: "متى تنسحب من هذه الصفقة، ولماذا؟" },
        twist: {
          change: "أفاد {{client}} بأن منافسًا عرض خصمًا بنسبة 30% على 3 سنوات، كتابيًا.",
          prompt: "كيف تعدّل توصيتك؟",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.applying-knowledge",
            anchors: [
              "Accepts or rejects 25% without looking at what {{client}} actually needs.",
              "Offers a smaller flat discount, such as 15%, without addressing the budget constraint.",
              "Spots the year-1 budget of 160 and proposes a structure that meets it, such as a ramped price.",
              "Designs the ramp to keep total value and margin, such as 160, 190 and 200, and stays within approval limits.",
              "As level 4, and asks for value in return for the year-1 price, such as a firm 3-year commitment or a reference.",
            ],
          },
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Ignores margin, approval limits or deal value.",
              "Mentions margin or limits but does not calculate the effect.",
              "Calculates the margin effect of 25% against the alternative and respects the approval limits.",
              "Uses the 12% benchmark and the competitor range to judge the ask, and sets a walk-away point.",
              "As level 4, and considers the precedent a 25% discount would set for renewals and other clients.",
            ],
          },
          {
            competencyKey: "communication.persuasion",
            anchors: [
              "Tells {{report1}} what to do without reasons, or offers {{client}} a take-it-or-leave-it price.",
              "Gives reasons from {{company}}'s side only.",
              "Gives {{report1}} reasons and a way to present the offer around {{client}}'s budget need.",
              "Frames the offer around {{client}}'s goal, approval this year, and anticipates the likely objection.",
              "As level 4, and helps {{report1}} confirm whether the 25% is really about budget before presenting the offer.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "Matches 30% immediately, or dismisses the competitor's offer.",
              "Reacts to the offer without checking what it includes.",
              "Asks to see what the competitor's offer covers before responding, and holds the walk-away point.",
              "Compares like with like, such as scope, service and contract length, and states what is known and unknown.",
              "As level 4, and decides in advance what evidence would justify moving, and who must approve it.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Spots the year-1 budget of 160.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["160", "budget", "this financial year", "الميزانية", "هذه السنة المالية"],
          },
          {
            text: "Proposes a ramped price instead of a flat 25%.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["ramp", "year 1", "step up", "تدرّج", "السنة الأولى", "تصاعدي"],
          },
          {
            text: "Calculates the margin or total contract value of the options.",
            competencyKey: "technical.role-knowledge",
            keywords: ["margin", "total value", "450", "550", "cost to serve", "هامش الربح", "القيمة الإجمالية", "تكلفة تقديم الخدمة"],
          },
          {
            text: "Respects the approval limits.",
            competencyKey: "technical.role-knowledge",
            keywords: ["approval", "20%", "authority", "الموافقة", "الصلاحية"],
          },
        ],
        redFlags: [
          {
            text: "Accepts 25% for all 3 years.",
            competencyKey: "technical.applying-knowledge",
            keywords: ["accept 25%", "agree to 25", "قبول 25%", "نوافق على 25"],
          },
          {
            text: "Matches the competitor's price without checking it.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["match 30%", "beat the competitor", "مجاراة 30%", "نتفوق على المنافس"],
          },
          {
            text: "Refuses any discount.",
            competencyKey: "communication.persuasion",
            keywords: ["no discount", "list price only", "لا خصم", "سعر القائمة فقط"],
          },
        ],
        embeddedDetail: {
          description: "{{client}}'s footnote says the budget approved for this financial year is 160, so the real constraint is the year-1 price, 20% off, not 25% off for all 3 years.",
          location: "footnote of {{client}}'s email",
          keywords: ["160", "budget", "this financial year", "march", "الميزانية", "مارس"],
        },
        probeTargets: ["technical.role-knowledge"],
        twistTargets: ["technical.calibrated-depth"],
      },
    },
  },
  // ═════════════════════════ FINANCE ═════════════════════════
  {
    id: "tech-fin-01-budget-variance",
    type: "TECHNICAL_TASK",
    difficulty: 3,
    dials: { ambiguity: 2, stakeholders: 3, conflictingConstraints: 2, stakes: 4, timePressure: 3, informationGaps: 3 },
    targets: ["technical.problem-diagnosis", "technical.role-knowledge", "communication.clarity-structure"],
    roleFamilies: ["finance"],
    minutes: 7,
    storyPhase: "middle",
    content: {
      en: {
        title: "A strong quarter?",
        scenario:
          "{{report2}} has prepared the quarterly variance report for {{company}}'s consumer products unit. It goes to {{exec}} on Friday. The commentary calls it 'a strong quarter, driven by volume'. {{manager}} asks you to review it first. The variance table and the draft commentary are attached (figures in thousands unless stated).",
        materials: [
          {
            kind: "table",
            id: "variance",
            title: "Quarterly results against budget",
            caption: "Units are actual units, not thousands. Actual units include 3,000 units sold in the March promotion at 60 each (list price 100).",
            columns: [
              { key: "line", label: "Line" },
              { key: "budget", label: "Budget", numeric: true },
              { key: "actual", label: "Actual", numeric: true },
              { key: "variance", label: "Variance", numeric: true },
              { key: "fu", label: "F / U" },
            ],
            rows: [
              { line: "Units sold", budget: 10000, actual: 12000, variance: 2000, fu: "F" },
              { line: "Revenue", budget: 1000, actual: 1080, variance: 80, fu: "F" },
              { line: "Cost of goods sold", budget: 600, actual: 720, variance: -120, fu: "U" },
              { line: "Gross margin", budget: 400, actual: 360, variance: -40, fu: "U" },
              { line: "Marketing", budget: 150, actual: 190, variance: 40, fu: "F" },
              { line: "Operating result", budget: 250, actual: 170, variance: -80, fu: "U" },
            ],
          },
          {
            kind: "memo",
            id: "commentary",
            title: "Commentary (draft)",
            author: { name: "{{report2}}", role: "{{report2.role}}" },
            body:
              "A strong quarter, driven by volume. Revenue was 80 above budget as units sold beat budget by 20%. Marketing was 40 favourable. Cost of goods sold rose with volume, as expected.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write a note to {{manager}} before the report goes to {{exec}}: what is wrong, the corrected story, and what you would change in the report.",
          written: { format: "memo" },
        },
        probe: { prompt: "Which figure would you double-check before the report goes out, and with whom?" },
        twist: {
          change: "{{manager}} says the report goes to {{exec}} in 30 minutes, and you can add only 3 lines.",
          prompt: "Write the 3 lines.",
        },
      },
      ar: {
        title: "ربع قوي؟",
        scenario:
          "أعدّ {{report2}} تقرير الانحرافات الفصلي لوحدة المنتجات الاستهلاكية في {{company}}، ويُرفع التقرير إلى {{exec}} يوم الجمعة. يصف التعليق المرافق الربع بأنه «ربع قوي بفضل حجم المبيعات». طلب منك {{manager}} مراجعته أولًا. مرفق جدول الانحرافات ومسودة التعليق (الأرقام بالآلاف ما لم يُذكر غير ذلك).",
        materials: [
          {
            kind: "table",
            id: "variance",
            title: "نتائج الربع مقارنة بالميزانية",
            caption: "الوحدات بالعدد الفعلي لا بالآلاف. تشمل الوحدات الفعلية 3,000 وحدة بيعت في العرض الترويجي لشهر مارس بسعر 60 للوحدة (سعر القائمة 100).",
            columns: [
              { key: "line", label: "البند" },
              { key: "budget", label: "الميزانية", numeric: true },
              { key: "actual", label: "الفعلي", numeric: true },
              { key: "variance", label: "الانحراف", numeric: true },
              { key: "fu", label: "مواتٍ / غير مواتٍ" },
            ],
            rows: [
              { line: "الوحدات المبيعة", budget: 10000, actual: 12000, variance: 2000, fu: "مواتٍ" },
              { line: "الإيرادات", budget: 1000, actual: 1080, variance: 80, fu: "مواتٍ" },
              { line: "تكلفة البضاعة المبيعة", budget: 600, actual: 720, variance: -120, fu: "غير مواتٍ" },
              { line: "مجمل الربح", budget: 400, actual: 360, variance: -40, fu: "غير مواتٍ" },
              { line: "التسويق", budget: 150, actual: 190, variance: 40, fu: "مواتٍ" },
              { line: "النتيجة التشغيلية", budget: 250, actual: 170, variance: -80, fu: "غير مواتٍ" },
            ],
          },
          {
            kind: "memo",
            id: "commentary",
            title: "التعليق (مسودة)",
            author: { name: "{{report2}}", role: "{{report2.role}}" },
            body:
              "ربع قوي بفضل حجم المبيعات. جاءت الإيرادات أعلى من الميزانية بمقدار 80، إذ تجاوزت الوحدات المبيعة الميزانية بنسبة 20%. وكان انحراف التسويق مواتيًا بمقدار 40. وارتفعت تكلفة البضاعة المبيعة مع ارتفاع الحجم كما كان متوقعًا.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مذكرة إلى {{manager}} قبل رفع التقرير إلى {{exec}}: ما الخطأ، وما الصورة الصحيحة، وما الذي ستغيّره في التقرير.",
          written: { format: "memo" },
        },
        probe: { prompt: "أي رقم ستعيد التحقق منه قبل إرسال التقرير، ومع من؟" },
        twist: {
          change: "قال {{manager}} إن التقرير سيُرفع إلى {{exec}} بعد 30 دقيقة، ولا يمكنك إضافة أكثر من 3 أسطر.",
          prompt: "اكتب الأسطر الثلاثة.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.problem-diagnosis",
            anchors: [
              "Accepts the commentary's strong-quarter story.",
              "Spots the marketing label error but misses the price effect behind the revenue figure.",
              "Spots the marketing error and that revenue rose only through promotional units at 60, while full-price units fell.",
              "Splits revenue into volume (+200) and price (-120) effects and shows the operating result is 80 below budget.",
              "As level 4, and shows full-price units fell 10%, signalling weaker demand, and that promotional units earned no gross margin.",
            ],
          },
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Uses incorrect variance conventions, such as treating any positive number as favourable.",
              "Uses correct conventions for some lines but not for cost lines.",
              "Applies correct favourable and unfavourable conventions to revenue and cost lines.",
              "Uses standard price and volume variance analysis and explains it in a way {{exec}} can follow.",
              "As level 4, and recommends reporting margin for promotional and full-price sales separately.",
            ],
          },
          {
            competencyKey: "communication.clarity-structure",
            anchors: [
              "Lists corrections in no order, with the main point unclear.",
              "States the main point but buries it among minor corrections.",
              "Leads with the key message, that it was not a strong quarter, then the corrections in order of importance.",
              "Gives {{manager}} only what is needed: the corrected story, the two errors and the changes to make.",
              "As level 4, and answers in advance the questions {{exec}} will ask, such as why volume beat budget.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "Is certain about every figure and checks nothing.",
              "Says the figures should be checked, without saying which.",
              "Names the figure to check, such as promotional units and price, and the source or person to check with.",
              "Explains which conclusions depend on that figure and how they would change if it were wrong.",
              "As level 4, and separates what the table proves from what needs outside data, such as why full-price sales fell.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Flags that marketing overspent by 40 and is unfavourable, not favourable.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["marketing", "unfavourable", "unfavorable", "overspent", "التسويق", "غير مواتٍ", "تجاوز"],
          },
          {
            text: "Identifies the promotion: 3,000 units at 60.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["promotion", "3,000", "at 60", "العرض الترويجي", "بسعر 60"],
          },
          {
            text: "Splits revenue into volume and price effects.",
            competencyKey: "technical.role-knowledge",
            keywords: ["price variance", "volume variance", "200", "120", "انحراف السعر", "انحراف الحجم"],
          },
          {
            text: "States that the operating result is 80 below budget.",
            competencyKey: "communication.clarity-structure",
            keywords: ["80 below", "operating result", "not a strong quarter", "النتيجة التشغيلية", "ليس ربعًا قويًا", "أقل من الميزانية بمقدار 80"],
          },
          {
            text: "Notes full-price units fell to 9,000.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["9,000", "full price", "fell 10%", "السعر الكامل", "انخفضت 10%"],
          },
        ],
        redFlags: [
          {
            text: "Agrees it was a strong quarter.",
            competencyKey: "technical.problem-diagnosis",
            keywords: ["strong quarter", "driven by volume", "ربع قوي", "بفضل حجم المبيعات"],
          },
          {
            text: "Treats higher marketing spend as favourable.",
            competencyKey: "technical.role-knowledge",
            keywords: ["marketing favourable", "marketing favorable", "التسويق مواتٍ"],
          },
          {
            text: "Lists small corrections without a main message.",
            competencyKey: "communication.clarity-structure",
            keywords: ["minor points", "small corrections", "ملاحظات بسيطة", "تصحيحات صغيرة"],
          },
        ],
        embeddedDetail: {
          description:
            "The table caption says actual units include 3,000 promotional units sold at 60 against a list price of 100, so revenue rose through discounted volume while full-price units fell to 9,000.",
          location: "caption of the variance table",
          keywords: ["promotion", "3,000", "60", "العرض الترويجي"],
        },
        probeTargets: ["technical.calibrated-depth"],
        twistTargets: ["communication.clarity-structure"],
      },
    },
  },
  {
    id: "tech-fin-02-capitalisation",
    type: "TECHNICAL_TASK",
    difficulty: 5,
    dials: { ambiguity: 4, stakeholders: 4, conflictingConstraints: 5, stakes: 5, timePressure: 3, informationGaps: 4 },
    targets: ["technical.role-knowledge", "technical.calibrated-depth", "judgment.ethical-judgment"],
    roleFamilies: ["finance"],
    minutes: 7,
    storyPhase: "late",
    content: {
      en: {
        title: "Capitalise everything?",
        scenario:
          "{{company}} is buying a new customer management system for 2,400 over 3 years (figures in thousands). {{peer}}, who owns the project, has drafted the accounting treatment: capitalise all costs and amortise them over 5 years, which keeps this year's operating expenses within budget. {{manager}} asks you to review the treatment before it goes to the audit committee. The cost breakdown and a contract extract are attached.",
        materials: [
          {
            kind: "table",
            id: "costs",
            title: "Project costs and proposed treatment (thousands)",
            caption: "Proposed: amortise 2,400 over 5 years = 480 a year. This year's operating expense budget for the project: 600.",
            columns: [
              { key: "item", label: "Item" },
              { key: "amount", label: "Amount", numeric: true },
              { key: "timing", label: "Timing" },
              { key: "proposed", label: "Proposed treatment" },
            ],
            rows: [
              { item: "Software subscription, 3 years, paid upfront", amount: 900, timing: "Paid this year", proposed: "Capitalise" },
              { item: "Implementation partner: configuration", amount: 600, timing: "This year", proposed: "Capitalise" },
              { item: "Internal staff time on configuration", amount: 300, timing: "This year", proposed: "Capitalise" },
              { item: "Data migration (cleaning and loading old data)", amount: 250, timing: "This year", proposed: "Capitalise" },
              { item: "Staff training", amount: 150, timing: "After go-live", proposed: "Capitalise" },
              { item: "Support and maintenance, years 1–3, paid upfront", amount: 200, timing: "Paid this year", proposed: "Capitalise" },
            ],
          },
          {
            kind: "memo",
            id: "contract",
            title: "Contract extract",
            author: { name: "Legal team" },
            body:
              "Clause 2.2: Fees are payable annually in advance, or in full in advance at a 5% discount.\n\nClause 3.1: The vendor hosts the software on its own servers. {{company}} receives the right to access the service for 3 years. {{company}} does not receive a copy of the software or the right to run it on its own systems.\n\nClause 3.4: Configuration made by the implementation partner remains within the vendor's platform.",
          },
        ],
        task: {
          kind: "written",
          prompt: "Write your review for {{manager}}: which items you would treat differently and why, the effect on this year's operating expenses, and what you would check.",
          written: { format: "memo" },
        },
        probe: { prompt: "Which item are you least sure about, and who would you check it with?" },
        twist: {
          change: "{{peer}} says the external auditors 'usually accept' this treatment and asks you to keep it as drafted.",
          prompt: "Write your reply to {{peer}}.",
        },
      },
      ar: {
        title: "رسملة كل شيء؟",
        scenario:
          "تشتري {{company}} نظامًا جديدًا لإدارة العملاء بقيمة 2,400 على مدى 3 سنوات (الأرقام بالآلاف). صاغ {{peer}}، مالك المشروع، المعالجة المحاسبية المقترحة: رسملة جميع التكاليف وإطفاؤها على 5 سنوات، وهو ما يُبقي المصروفات التشغيلية لهذا العام ضمن الميزانية. طلب منك {{manager}} مراجعة هذه المعالجة قبل عرضها على لجنة التدقيق. مرفق تفصيل التكاليف ومقتطف من العقد.",
        materials: [
          {
            kind: "table",
            id: "costs",
            title: "تكاليف المشروع والمعالجة المقترحة (بالآلاف)",
            caption: "المقترح: إطفاء 2,400 على 5 سنوات = 480 سنويًا. ميزانية المصروفات التشغيلية للمشروع هذا العام: 600.",
            columns: [
              { key: "item", label: "البند" },
              { key: "amount", label: "المبلغ", numeric: true },
              { key: "timing", label: "التوقيت" },
              { key: "proposed", label: "المعالجة المقترحة" },
            ],
            rows: [
              { item: "اشتراك البرنامج لمدة 3 سنوات، مدفوع مقدمًا", amount: 900, timing: "يُدفع هذا العام", proposed: "رسملة" },
              { item: "شريك التنفيذ: الإعداد والتهيئة", amount: 600, timing: "هذا العام", proposed: "رسملة" },
              { item: "وقت الموظفين الداخليين في الإعداد والتهيئة", amount: 300, timing: "هذا العام", proposed: "رسملة" },
              { item: "ترحيل البيانات (تنظيف البيانات القديمة وتحميلها)", amount: 250, timing: "هذا العام", proposed: "رسملة" },
              { item: "تدريب الموظفين", amount: 150, timing: "بعد التشغيل", proposed: "رسملة" },
              { item: "الدعم والصيانة للسنوات 1–3، مدفوعة مقدمًا", amount: 200, timing: "يُدفع هذا العام", proposed: "رسملة" },
            ],
          },
          {
            kind: "memo",
            id: "contract",
            title: "مقتطف من العقد",
            author: { name: "الفريق القانوني" },
            body:
              "البند 2.2: تُدفع الرسوم سنويًا مقدمًا، أو دفعة واحدة مقدمًا مقابل خصم 5%.\n\nالبند 3.1: يستضيف المورّد البرنامج على خوادمه، وتحصل {{company}} على حق الوصول إلى الخدمة لمدة 3 سنوات، ولا تحصل على نسخة من البرنامج ولا على حق تشغيله على أنظمتها.\n\nالبند 3.4: تبقى أعمال الإعداد والتهيئة التي ينفّذها شريك التنفيذ داخل منصة المورّد.",
          },
        ],
        task: {
          kind: "written",
          prompt: "اكتب مراجعتك الموجّهة إلى {{manager}}: البنود التي ستعالجها على نحو مختلف ولماذا، وأثر ذلك في المصروفات التشغيلية لهذا العام، وما الذي ستتحقق منه.",
          written: { format: "memo" },
        },
        probe: { prompt: "أي بند أنت أقل يقينًا بشأنه، ومع من ستتحقق منه؟" },
        twist: {
          change: "قال {{peer}} إن المدققين الخارجيين «يقبلون عادةً» هذه المعالجة، وطلب منك الإبقاء عليها كما صيغت.",
          prompt: "اكتب ردّك على {{peer}}.",
        },
      },
    },
    hidden: {
      en: {
        rubric: [
          {
            competencyKey: "technical.role-knowledge",
            anchors: [
              "Accepts capitalising everything over 5 years.",
              "Challenges some items, such as training, but still treats the system as an owned software asset.",
              "Uses the contract to identify a hosted service: subscription and support are prepaid over 3 years; training and data migration are expensed.",
              "Explains that nothing can be amortised beyond the 3-year term, and treats configuration under the applicable standard.",
              "As level 4, and contrasts how IFRS and US GAAP guidance treat configuration in hosted arrangements, and what that means here.",
            ],
          },
          {
            competencyKey: "technical.calibrated-depth",
            anchors: [
              "States a treatment for every item as settled fact, or refuses to give a view.",
              "Acknowledges the rules are complex without saying which items are uncertain.",
              "Separates clear items, such as training, from judgement items, such as configuration, and says how to resolve the latter.",
              "Gives a range for this year's expense under the plausible treatments, roughly 1,000 to 1,700, rather than one falsely precise figure.",
              "As level 4, and names the experts to consult, such as technical accounting and the auditors, with the specific questions to ask.",
            ],
          },
          {
            competencyKey: "judgment.ethical-judgment",
            anchors: [
              "Goes along with the treatment because it meets the budget.",
              "Notes the budget motive but treats it as acceptable if the auditors might agree.",
              "States that the treatment must follow the substance of the contract, not the budget target, and corrects it.",
              "Explains the risk of misleading the audit committee and proposes presenting the true expense with options to manage the budget.",
              "As level 4, and handles it constructively with {{peer}}, keeping the relationship while ensuring the committee sees accurate figures.",
            ],
          },
        ],
        strongIndicators: [
          {
            text: "Uses the contract to identify a hosted service, not an owned software asset.",
            competencyKey: "technical.role-knowledge",
            keywords: ["hosted", "saas", "service contract", "no copy", "right to access", "مستضاف", "عقد خدمة", "حق الوصول", "نسخة"],
          },
          {
            text: "Treats subscription and support as prepaid, expensed over 3 years.",
            competencyKey: "technical.role-knowledge",
            keywords: ["prepaid", "3 years", "300 a year", "مدفوع مقدمًا", "3 سنوات", "300 سنويًا"],
          },
          {
            text: "Expenses training and data migration.",
            competencyKey: "technical.role-knowledge",
            keywords: ["training", "expense", "data migration", "التدريب", "مصروف", "ترحيل البيانات"],
          },
          {
            text: "Rejects 5-year amortisation beyond the 3-year term.",
            competencyKey: "technical.role-knowledge",
            keywords: ["5 years", "contract term", "3-year term", "5 سنوات", "مدة العقد"],
          },
          {
            text: "Says the treatment cannot be chosen to meet the budget and recommends accurate reporting to the committee.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["budget target", "substance", "audit committee", "accurate", "هدف الميزانية", "الجوهر", "لجنة التدقيق", "بدقة"],
          },
        ],
        redFlags: [
          {
            text: "Keeps everything capitalised.",
            competencyKey: "technical.role-knowledge",
            keywords: ["capitalise all", "capitalize all", "fine as drafted", "رسملة الكل", "مقبولة كما هي"],
          },
          {
            text: "Defers entirely to what auditors usually accept.",
            competencyKey: "judgment.ethical-judgment",
            keywords: ["auditors usually accept", "if the auditors agree", "المدققون يقبلون عادةً", "إذا وافق المدققون"],
          },
          {
            text: "Gives one precise figure with no caveats on the judgement items.",
            competencyKey: "technical.calibrated-depth",
            keywords: ["exactly", "definitely", "تمامًا", "بالتأكيد"],
          },
        ],
        embeddedDetail: {
          description:
            "Clause 3.1 says the vendor hosts the software and {{company}} only gets access for 3 years, with no copy, so this is a service contract, not an owned asset, and nothing can be amortised over 5 years.",
          location: "clause 3.1 of the contract extract",
          keywords: ["hosts", "right to access", "no copy", "3 years", "يستضيف", "حق الوصول", "نسخة", "3 سنوات"],
        },
        probeTargets: ["technical.calibrated-depth"],
        twistTargets: ["judgment.ethical-judgment"],
      },
    },
  },
];
