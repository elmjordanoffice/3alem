import type { Material } from "@/lib/assessment/materials";
import type { AppLocale } from "@/i18n/config";

/**
 * Sample content for the design gallery: the "Northwind Logistics" world from
 * the product brief. Names come from many backgrounds; no idioms.
 */
export function samples(locale: AppLocale) {
  const ar = locale === "ar";
  const materials: Material[] = [
    {
      kind: "email",
      id: "email-lina",
      title: ar ? "رسالة من لينا" : "Email from Lina",
      from: { name: ar ? "لينا حداد" : "Lina Haddad", role: ar ? "مهندسة أولى" : "Senior engineer" },
      to: [{ name: ar ? "أنت" : "You" }],
      cc: [{ name: ar ? "توماس ريّس" : "Tomás Reyes" }],
      subject: ar ? "مشكلة في وحدة الدفع قبل الإطلاق" : "Payment module issue before launch",
      sentAt: ar ? "الاثنين 09:14" : "Mon 09:14",
      body: ar
        ? "وجدت حالة تسابق في وحدة الدفع. تؤثر في معاملة واحدة تقريبًا من كل 2000 معاملة.\n\nالإصلاح الصحيح يحتاج ثمانية أيام. الإطلاق بعد ستة أيام. أردت أن تعرف قبل اجتماع المبيعات."
        : "I found a race condition in the payment module. It affects roughly 1 in 2,000 transactions.\n\nA proper fix takes 8 days. Launch is in 6. I wanted you to know before the sales meeting.",
      footnote: ar
        ? "ملاحظة: العميل الأكبر ذكر في العقد شرطًا عن دقة الفوترة، البند 7.2."
        : "P.S. The largest client's contract has a billing-accuracy clause, section 7.2.",
    },
    {
      kind: "memo",
      id: "memo-launch",
      title: ar ? "خطة الإطلاق" : "Launch plan",
      author: { name: ar ? "أمارا أوكافور" : "Amara Okafor", role: ar ? "مديرة المنتج" : "Product manager" },
      date: ar ? "12 نوفمبر" : "12 November",
      body: ar
        ? "الهدف: إطلاق بوابة العملاء الجديدة لأكبر ثلاثة عملاء.\n\nالمخاطر المعروفة: الترحيل من النظام القديم، وتدريب فريق الدعم."
        : "Goal: launch the new customer portal to our three largest clients.\n\nKnown risks: migration from the old system, and support team training.",
    },
    {
      kind: "table",
      id: "table-orders",
      title: ar ? "الطلبات حسب المنطقة" : "Orders by region",
      caption: ar ? "الأسابيع الستة الأخيرة" : "Last six weeks",
      columns: [
        { key: "region", label: ar ? "المنطقة" : "Region" },
        { key: "orders", label: ar ? "الطلبات" : "Orders", numeric: true },
        { key: "late", label: ar ? "متأخرة" : "Late", numeric: true },
        { key: "refunds", label: ar ? "مستردة" : "Refunds", numeric: true },
      ],
      rows: [
        { region: ar ? "الشمال" : "North", orders: 4210, late: 126, refunds: 38 },
        { region: ar ? "الجنوب" : "South", orders: 3980, late: 119, refunds: 41 },
        { region: ar ? "الشرق" : "East", orders: 4105, late: 512, refunds: 44 },
        { region: ar ? "الغرب" : "West", orders: 3870, late: 108, refunds: 35 },
      ],
    },
    {
      kind: "chart",
      id: "chart-dropoff",
      title: ar ? "إكمال خطوات التسجيل" : "Sign-up step completion",
      caption: ar ? "نسبة المستخدمين الذين أكملوا كل خطوة" : "Share of users completing each step",
      chartType: "bar",
      xKey: "step",
      unit: "%",
      series: [
        { key: "web", label: ar ? "الويب" : "Web" },
        { key: "mobile", label: ar ? "الجوال" : "Mobile" },
      ],
      data: [
        { step: ar ? "1" : "1", web: 100, mobile: 100 },
        { step: ar ? "2" : "2", web: 84, mobile: 81 },
        { step: ar ? "3" : "3", web: 79, mobile: 46 },
        { step: ar ? "4" : "4", web: 74, mobile: 42 },
      ],
    },
  ];

  return {
    materials,
    chapters: ar
      ? ["الأسبوع الأول", "الضغط يتصاعد", "قرار الإطلاق", "ما بعد الإطلاق"]
      : ["Week one", "Pressure builds", "The launch call", "After launch"],
    rankItems: ar
      ? [
          { id: "a", label: "الرد على رسالة لينا", detail: "حالة التسابق في وحدة الدفع" },
          { id: "b", label: "تحضير اجتماع المبيعات", detail: "الساعة 11:00" },
          { id: "c", label: "مراجعة خطة الترحيل", detail: "طلب من أمارا" },
          { id: "d", label: "مقابلة مرشح", detail: "الساعة 14:00" },
          { id: "e", label: "الموافقة على الميزانية", detail: "الموعد النهائي الجمعة" },
          { id: "f", label: "التدريب الأسبوعي للفريق", detail: "يمكن تأجيله" },
        ]
      : [
          { id: "a", label: "Reply to Lina's email", detail: "Payment race condition" },
          { id: "b", label: "Prepare the sales meeting", detail: "At 11:00" },
          { id: "c", label: "Review the migration plan", detail: "Requested by Amara" },
          { id: "d", label: "Interview a candidate", detail: "At 14:00" },
          { id: "e", label: "Approve the budget", detail: "Due Friday" },
          { id: "f", label: "Weekly team coaching", detail: "Can be moved" },
        ],
    allocationRows: ar
      ? [
          { id: "fix", label: "إصلاح وحدة الدفع" },
          { id: "monitor", label: "المراقبة والمطابقة اليدوية" },
          { id: "comms", label: "التواصل مع العميل" },
          { id: "support", label: "تدريب فريق الدعم" },
        ]
      : [
          { id: "fix", label: "Fix the payment module" },
          { id: "monitor", label: "Monitoring and manual reconciliation" },
          { id: "comms", label: "Client communication" },
          { id: "support", label: "Support team training" },
        ],
    stakeholder: {
      name: ar ? "دانيال كيم" : "Daniel Kim",
      role: ar ? "مدير العمليات لدى العميل" : "Client operations director",
      context: ar
        ? "دانيال غاضب لأن ثلاث فواتير وصلت بمبالغ خاطئة هذا الأسبوع. لم يتحدث معك من قبل."
        : "Daniel is upset because three invoices arrived with wrong amounts this week. You have not spoken before.",
    },
    chat: ar
      ? [
          { id: "1", from: "stakeholder" as const, text: "هذه ثالث مرة هذا الأسبوع. فريقي يقضي ساعات في تصحيح فواتيركم." },
          { id: "2", from: "candidate" as const, text: "أنت محق، وهذا ليس مقبولًا. هل يمكنك أن تخبرني بأرقام الفواتير الثلاث حتى أتحقق منها اليوم؟" },
          { id: "3", from: "stakeholder" as const, text: "أرسلتها أمس. لا أريد أن أكرر كل شيء لشخص جديد كل مرة." },
        ]
      : [
          { id: "1", from: "stakeholder" as const, text: "This is the third time this week. My team is spending hours correcting your invoices." },
          { id: "2", from: "candidate" as const, text: "You're right, and that isn't acceptable. Could you give me the three invoice numbers so I can check them today?" },
          { id: "3", from: "stakeholder" as const, text: "I sent them yesterday. I don't want to repeat everything to someone new every time." },
        ],
    candidateName: ar ? "سارة منصور" : "Sara Mansour",
    cast: ar
      ? [
          { name: "لينا حداد", role: "مهندسة أولى" },
          { name: "توماس ريّس", role: "مدير المبيعات" },
          { name: "أمارا أوكافور", role: "مديرة المنتج" },
          { name: "يوكي تاناكا", role: "قائدة الدعم" },
        ]
      : [
          { name: "Lina Haddad", role: "Senior engineer" },
          { name: "Tomás Reyes", role: "Sales director" },
          { name: "Amara Okafor", role: "Product manager" },
          { name: "Yuki Tanaka", role: "Support lead" },
        ],
    evidence: ar
      ? {
          quote: "سأتصل بالعميل اليوم وأشرح الخطر بالأرقام: معاملة واحدة من كل 2000، وما يعنيه ذلك لعقدهم.",
          context: "الفصل 2 · الرد على لينا",
          rationale: "يحدد حجم الخطر بالأرقام ويربطه بأثره على العميل قبل أن يقرر.",
        }
      : {
          quote: "I'll call the client today and explain the risk in numbers: 1 in 2,000 transactions, and what that means for their contract.",
          context: "Chapter 2 · Reply to Lina",
          rationale: "Quantifies the risk and ties it to the client's exposure before deciding.",
        },
    team: ar
      ? ["سارة منصور", "لينا حداد", "توماس ريّس", "يوكي تاناكا", "أوموندي ماينا"]
      : ["Sara Mansour", "Lina Haddad", "Tomás Reyes", "Yuki Tanaka", "Omondi Maina"],
  };
}
