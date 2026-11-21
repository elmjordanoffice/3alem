/**
 * Shared candidate copy that the web app's messages/*.json gained after this
 * app was branched (candidate.complete.recap, commit "Candidates finish with a
 * recap of their week"). It is consulted only when messages/*.json lacks a key,
 * so once both are on the same branch the shared copy wins and this file can
 * be deleted.
 */
const recapEn = {
  title: "Your week, in short",
  scenes: "{n, plural, one {scene} other {scenes}}",
  followUps: "{n, plural, one {follow-up} other {follow-ups}}",
  words: "{n, plural, one {word} other {words}}",
  minutes: "{n, plural, one {minute} other {minutes}}",
  habitsTitle: "What showed up in your answers",
  note: "A description of your own words, not a score. {org} reviews your full report with a person.",
  habits: {
    reasons: { title: "You explained why", body: "You gave the reason behind your choices, so a reader can follow your thinking." },
    ownership: { title: "You took it on yourself", body: "You said what you would do, in your own voice, rather than what should happen." },
    checking: { title: "You checked before deciding", body: "You looked at the numbers and the evidence before you committed." },
    tradeoffs: { title: "You named the cost", body: "You said what a choice would give up, not only what it would gain." },
    perspective: { title: "You saw it from their side", body: "You acknowledged how the other people involved would see it." },
    specifics: { title: "You put a time on it", body: "Your next steps had days and times, so people know what happens when." },
    contingency: { title: "You planned for change", body: "You said what you would do if things went differently." },
    options: { title: "You offered choices", body: "You gave people options instead of a single answer." },
    calibration: { title: "You were honest about certainty", body: "You said how sure you were instead of sounding sure about everything." },
    learning: { title: "You looked for the lesson", body: "You said what you would carry into next time." },
    people: { title: "You kept people in mind", body: "You thought about who each decision affects." },
  },
};

const recapAr: typeof recapEn = {
  title: "أسبوعك باختصار",
  scenes: "{n, plural, one {مشهد} two {مشهدان} few {مشاهد} many {مشهدًا} other {مشهد}}",
  followUps: "{n, plural, one {سؤال متابعة} two {سؤالا متابعة} few {أسئلة متابعة} many {سؤال متابعة} other {سؤال متابعة}}",
  words: "{n, plural, one {كلمة} two {كلمتان} few {كلمات} many {كلمة} other {كلمة}}",
  minutes: "{n, plural, one {دقيقة} two {دقيقتان} few {دقائق} many {دقيقة} other {دقيقة}}",
  habitsTitle: "ما ظهر في إجاباتك",
  note: "وصف لكلماتك أنت، وليس درجة. تراجع {org} تقريرك الكامل مع شخص من فريقها.",
  habits: {
    reasons: { title: "شرحت السبب", body: "ذكرت السبب وراء اختياراتك، فيستطيع القارئ أن يتابع تفكيرك." },
    ownership: { title: "تحمّلت المسؤولية بنفسك", body: "قلت ما ستفعله أنت، لا ما ينبغي أن يحدث فحسب." },
    checking: { title: "تحقّقت قبل أن تقرّر", body: "نظرت في الأرقام والأدلة قبل أن تلتزم بقرار." },
    tradeoffs: { title: "سمّيت الثمن", body: "ذكرت ما سيتنازل عنه كل خيار، لا ما سيكسبه فقط." },
    perspective: { title: "رأيت الأمر من جهتهم", body: "أقررت بالطريقة التي سيرى بها الآخرون الموقف." },
    specifics: { title: "حدّدت موعدًا", body: "جاءت خطواتك التالية بأيام وأوقات، فيعرف الجميع ما سيحدث ومتى." },
    contingency: { title: "خطّطت لما قد يتغيّر", body: "قلت ما ستفعله إن سارت الأمور على نحو مختلف." },
    options: { title: "عرضت خيارات", body: "قدّمت للناس خيارات بدلًا من إجابة واحدة." },
    calibration: { title: "كنت صادقًا بشأن مدى يقينك", body: "ذكرت مدى ثقتك بدلًا من أن تبدو واثقًا من كل شيء." },
    learning: { title: "بحثت عن الدرس", body: "قلت ما ستأخذه معك إلى المرة القادمة." },
    people: { title: "وضعت الناس في حسابك", body: "فكّرت في من يتأثر بكل قرار." },
  },
};

export const sharedFallbackEn = { candidate: { complete: { recap: recapEn } } };
export const sharedFallbackAr = { candidate: { complete: { recap: recapAr } } };
