/**
 * Calibration answers for the offline scorer: realistic strong, average and
 * weak answers to real bank items, written the way people actually write, not
 * built from the items' keyword lists. tests/unit/scorer-calibration.test.ts
 * checks that the scorer ranks them in the right order and spreads them across
 * the scale. Add a case whenever the scorer misjudges a real answer.
 */
export interface CalibrationCase {
  itemId: string;
  lang: "en" | "ar";
  quality: "strong" | "average" | "weak";
  text: string;
}

export const CALIBRATION: CalibrationCase[] = [
  // dil-01: a billing defect six days before launch.
  {
    itemId: "dil-01-billing-double-charge",
    lang: "en",
    quality: "strong",
    text: "I'd go with b: delay by 2 days, ship the partial fix, and tell {{client}} myself today. 1 in 2,000 sounds small, but the forecast says about 48,000 transactions on day one of their promotion, so that's roughly 24 customers charged twice on the first day, and more every day after. A duplicate charge shows up on the customer's statement, so a manual reversal job doesn't make it OK. Two days costs us a promise, but explaining a short delay is easier than explaining double charges to their customers. I'd agree a clear stop rule with the team: if we see more than 5 duplicates in a day after launch, we pause the feature and roll back to the old billing. This is my decision while my manager is away and I'll own it with sales and the client. I'll also thank {{report1}} for raising it early.",
  },
  {
    itemId: "dil-01-billing-double-charge",
    lang: "en",
    quality: "average",
    text: "I would choose option b. A short delay is better than launching something with a known defect, and 2 days should be acceptable to the client if we explain it. The partial fix reduces the risk and we can finish the full fix after launch. I would let the client know about the remaining risk so they are not surprised, and keep an eye on it after go-live.",
  },
  {
    itemId: "dil-01-billing-double-charge",
    lang: "en",
    quality: "weak",
    text: "Option a. The defect only affects 1 in 2,000 transactions so it's really rare, and sales promised the date so we can't move it. We can fix any issues manually after launch. No need to worry the client about something this small, we'll quietly reverse anything that goes wrong.",
  },
  {
    itemId: "dil-01-billing-double-charge",
    lang: "ar",
    quality: "strong",
    text: "سأختار الخيار ب: نؤجّل الإطلاق يومين ونطلق الإصلاح الجزئي، وسأبلغ {{client}} بنفسي اليوم. نسبة 1 من كل 2,000 تبدو صغيرة، لكن التوقعات تشير إلى نحو 48,000 معاملة في اليوم الأول من العرض الترويجي، أي قرابة 24 عميلًا سيُخصم منهم المبلغ مرتين في اليوم الأول وحده. الخصم المكرر يراه العميل في كشف حسابه، والاسترداد اليدوي لا يمحو أثره. سأتفق مع الفريق على معيار واضح: إذا تجاوزت الحالات المكررة 5 في اليوم بعد الإطلاق نوقف الميزة ونعود إلى نظام الفوترة القديم. القرار قراري في غياب مديري، وأتحمّل مسؤوليته أمام المبيعات والعميل، وسأشكر {{report1}} على تنبيهه المبكر.",
  },
  {
    itemId: "dil-01-billing-double-charge",
    lang: "ar",
    quality: "average",
    text: "أختار الخيار ب. التأجيل القصير أفضل من إطلاق ميزة فيها خلل معروف، ويومان مدة يمكن أن يقبلها العميل إذا شرحنا له السبب. الإصلاح الجزئي يقلل المخاطرة، ويمكننا استكمال الإصلاح الكامل بعد الإطلاق. سأخبر العميل بالمخاطر المتبقية حتى لا يتفاجأ، وسنراقب الوضع بعد التشغيل.",
  },
  {
    itemId: "dil-01-billing-double-charge",
    lang: "ar",
    quality: "weak",
    text: "الخيار أ. الخلل يصيب معاملة واحدة من كل 2,000، وهذا نادر جدًا، والمبيعات وعدت العميل بالموعد فلا يمكن تغييره. سنعالج أي مشكلة يدويًا بعد الإطلاق، ولا داعي لإقلاق العميل بأمر بهذا الحجم.",
  },

  // case-01: cancellations rising; the executive blames a competitor's price.
  {
    itemId: "case-01-cancellation-spike",
    lang: "en",
    quality: "strong",
    text: "Summary: I don't think price is the main driver; the rise is concentrated in new customers. Customers in their first 3 months now cancel at about 8% a month, while longer-standing customers are roughly where they were. The timing also points away from the competitor: their price cut was in Month 2, but our cancellations stayed flat until Month 4, the month the new sign-up process went live. Most new leavers mention setup problems. Confidence: medium to high; I'd want to check the setup complaints with support before Thursday. Recommendation: don't cut prices for all 20,000 customers, which would cost about 15% of revenue to solve a problem most of them don't have. Fix the sign-up step first and add a guided setup call for new customers. You're right that price matters for some older customers, so I'd test a targeted retention offer for them rather than a blanket cut.",
  },
  {
    itemId: "case-01-cancellation-spike",
    lang: "en",
    quality: "average",
    text: "I looked at the data and I'm not sure price is the only cause. New customers seem to be cancelling more than older ones, and support has mentioned setup issues. I would recommend looking into the onboarding process before cutting prices, because a 15% cut is expensive. We could also run a survey to understand why people leave. I'm fairly confident but we need more data.",
  },
  {
    itemId: "case-01-cancellation-spike",
    lang: "en",
    quality: "weak",
    text: "I agree with the competitor price explanation. Customers always go where it's cheaper and the competitor is now cheaper than us. I recommend we cut prices by 15% as soon as possible to stop the cancellations. Support's view is probably because they hear from customers who don't read the instructions.",
  },

  // wr-02: telling a client their order will be a week late.
  {
    itemId: "wr-02-bad-news-to-client",
    lang: "en",
    quality: "strong",
    text: "Subject: Your display units: new delivery date and a plan for the 18th\n\nDear {{client}},\n\nI'm sorry to tell you that the full order of 500 display units will arrive on the 21st, not the 14th as we promised. Yesterday a batch of components failed our own quality test, and we won't ship units that don't meet it. That is on us, not on you.\n\nI know the flagship opening on the 18th is what matters most. We can deliver 300 finished units by the 15th, which covers the 120 you need installed for the launch with time to spare. The remaining 200 would follow on the 21st.\n\nWould you prefer this split delivery, or one delivery of all 500 on the 21st? Please let me know by Thursday at 12:00 so we can book the transport. I'll call you this afternoon to talk it through.\n\nKind regards",
  },
  {
    itemId: "wr-02-bad-news-to-client",
    lang: "en",
    quality: "average",
    text: "Dear {{client}},\n\nI'm writing to let you know that unfortunately there will be a delay with your order. Due to a quality issue with some components, the delivery will now be on the 21st instead of the 14th. We apologise for the inconvenience this may cause. We are doing everything we can to make sure this doesn't happen again. Please let me know if you have any questions.\n\nBest regards",
  },
  {
    itemId: "wr-02-bad-news-to-client",
    lang: "en",
    quality: "weak",
    text: "Hi, just a quick note that there will be a slight delay on the display units due to a problem with our supplier, which is outside our control. We'll keep you posted on the new date. Sorry for any inconvenience.",
  },
  {
    itemId: "wr-02-bad-news-to-client",
    lang: "ar",
    quality: "strong",
    text: "الموضوع: موعد التسليم الجديد لوحدات العرض وخطة ليوم 18\n\nالسيد/ة {{client}} المحترم/ة،\n\nيؤسفني إبلاغكم بأن الطلب الكامل، أي 500 وحدة عرض، سيصل يوم 21 بدلًا من يوم 14 كما وعدناكم. فقد أخفقت أمس دفعة من المكوّنات في اختبار الجودة الخاص بنا، ولن نشحن وحدات لا تستوفي معاييرنا. المسؤولية في ذلك تقع علينا.\n\nأعلم أن افتتاح المتجر الرئيسي يوم 18 هو الأهم بالنسبة إليكم. يمكننا تسليم 300 وحدة جاهزة بحلول يوم 15، وهي تغطي الوحدات الـ120 التي تحتاجون إلى تركيبها للافتتاح، على أن تصل الوحدات الـ200 المتبقية يوم 21.\n\nهل تفضّلون هذا التسليم على دفعتين، أم تسليم الوحدات الـ500 كلها يوم 21؟ أرجو إبلاغي بقراركم قبل الساعة 12:00 يوم الخميس لنحجز النقل. وسأتصل بكم بعد ظهر اليوم لمناقشة الأمر.\n\nمع خالص التحية",
  },
  {
    itemId: "wr-02-bad-news-to-client",
    lang: "ar",
    quality: "average",
    text: "السيد/ة {{client}} المحترم/ة،\n\nأكتب إليكم لإبلاغكم بأن هناك تأخيرًا في طلبكم للأسف. بسبب مشكلة في جودة بعض المكوّنات، سيكون التسليم يوم 21 بدلًا من يوم 14. نعتذر عن أي إزعاج قد يسببه ذلك، ونبذل كل ما في وسعنا لضمان عدم تكرار ذلك. لا تترددوا في التواصل معي إن كانت لديكم أي أسئلة.\n\nمع التحية",
  },
  {
    itemId: "wr-02-bad-news-to-client",
    lang: "ar",
    quality: "weak",
    text: "مرحبًا، أردت إبلاغكم بأن هناك تأخيرًا بسيطًا في وحدات العرض بسبب مشكلة لدى المورّد، وهو أمر خارج عن إرادتنا. سنبلغكم بالموعد الجديد لاحقًا. نعتذر عن أي إزعاج.",
  },

  // refl-01: looking back on a launch that slipped three weeks.
  {
    itemId: "refl-01-launch-that-slipped",
    lang: "en",
    quality: "strong",
    text: "Three changes. First, I should have mapped who was waiting on whom at the start. The guide depended on screenshots of the finished screens, and when {{report2}} mentioned in week 3 that they were still waiting for them, I treated it as a passing comment instead of an early warning. Second, nobody owned sending the user list to IT, so it fell between two people. That's my responsibility as the lead: every hand-off needs a named owner and a date. Third, I'd replace our loose check-ins with a weekly 15-minute review against four milestones (screens frozen, guide updated, access ready, user list sent), so a slip shows up in week 3, not week 8. The lesson I'd carry beyond this launch is that the gaps between people's tasks are the leader's job.",
  },
  {
    itemId: "refl-01-launch-that-slipped",
    lang: "en",
    quality: "average",
    text: "I would plan better from the start and make a more realistic timeline. I'd have more regular check-ins with the team so I know where things are, and I'd make sure the guide is updated before launch. I'd also communicate better with staff so they know what to expect when the tool arrives.",
  },
  {
    itemId: "refl-01-launch-that-slipped",
    lang: "en",
    quality: "weak",
    text: "Honestly the main problem was the manager's late feedback in week 4, which changed the screens and threw everything off. The team should have told me sooner that they were behind. Next time I'd ask everyone to communicate better and work harder near the deadline.",
  },
];
