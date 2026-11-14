import type { BankItem } from "@/lib/assessment/item-schema";

/**
 * Forced-choice work-style items. Each pair sets two equally attractive
 * statements from DIFFERENT work styles against each other, so the profile is
 * hard to fake. Across the 8 pairs of an item, every pole of every style
 * appears exactly twice. Scored as styles only, never as better or worse.
 */

const SELF_AWARENESS_RUBRIC = {
  competencyKey: "collaboration.self-awareness",
  anchors: [
    "Picks contradict each other across pairs that tap the same style, so no stable preference appears on any style.",
    "A stable preference appears on one style only; picks on the other styles look random.",
    "Stable preferences appear on most styles, giving a profile that can be reported back.",
    "Picks are consistent on all four styles, giving a clear and coherent profile.",
    "Picks are consistent on all styles and match how the person describes their own approach in open answers elsewhere.",
  ],
};

export const ITEMS: BankItem[] = [
  {
    id: "ws-01-how-you-work",
    type: "FORCED_CHOICE_WORK_STYLE",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 1, conflictingConstraints: 2, stakes: 1, timePressure: 1, informationGaps: 1 },
    targets: ["collaboration.self-awareness"],
    roleFamilies: [],
    minutes: 3,
    storyPhase: "early",
    content: {
      en: {
        title: "How you like to work",
        scenario:
          "This part is about how you prefer to work. Each pair shows two statements. Both describe useful ways of working, and different roles need different styles. Choose the statement that sounds more like you. There are no right or wrong answers: answer as you usually are at work, not as you think you should be.",
        materials: [],
        task: {
          kind: "forced_choice",
          prompt: "For each pair, choose the statement that is more like you at work.",
          forcedChoice: {
            pairs: [
              {
                id: "p1",
                a: { id: "p1a", text: "I prefer methods that have already been shown to work." },
                b: { id: "p1b", text: "I prefer to get started quickly and refine as I go." },
              },
              {
                id: "p2",
                a: { id: "p2a", text: "Before I act, I like to think through the options carefully." },
                b: { id: "p2b", text: "I am willing to try an untested idea when the possible gain is large." },
              },
              {
                id: "p3",
                a: { id: "p3a", text: "I make sure every figure and detail in my work is correct." },
                b: { id: "p3b", text: "I get my best ideas when I think aloud with colleagues." },
              },
              {
                id: "p4",
                a: { id: "p4a", text: "I like to own a piece of work from start to finish on my own." },
                b: { id: "p4b", text: "I keep the overall purpose of the work in view at all times." },
              },
              {
                id: "p5",
                a: { id: "p5a", text: "I enjoy spotting small errors that others have missed." },
                b: { id: "p5b", text: "I would rather take a calculated chance than miss an opportunity." },
              },
              {
                id: "p6",
                a: { id: "p6a", text: "I like to agree the approach with the whole team before starting." },
                b: { id: "p6b", text: "I prefer to have a clear plan before I start a task." },
              },
              {
                id: "p7",
                a: { id: "p7a", text: "I like to see how my work connects to the wider strategy." },
                b: { id: "p7b", text: "I prefer to wait for enough evidence before changing a process that works." },
              },
              {
                id: "p8",
                a: { id: "p8a", text: "I make decisions quickly so that work keeps moving." },
                b: { id: "p8b", text: "I do my best thinking when I can work through a problem alone." },
              },
            ],
          },
        },
      },
      ar: {
        title: "طريقتك في العمل",
        scenario:
          "يتناول هذا الجزء الطريقة التي تفضّل أن تعمل بها. يتضمّن كل زوج عبارتين تصف كلتاهما أسلوبًا مفيدًا في العمل، وتحتاج الأدوار المختلفة إلى أساليب مختلفة. اختر العبارة الأقرب إليك. لا توجد إجابات صحيحة وأخرى خاطئة، فأجب بما تفعله عادةً في العمل، لا بما تظن أنه ينبغي أن تفعله.",
        materials: [],
        task: {
          kind: "forced_choice",
          prompt: "اختر من كل زوج العبارة الأقرب إلى طريقتك في العمل.",
          forcedChoice: {
            pairs: [
              {
                id: "p1",
                a: { id: "p1a", text: "أفضّل الأساليب التي ثبت نجاحها من قبل." },
                b: { id: "p1b", text: "أفضّل أن أبدأ بسرعة ثم أحسّن العمل في أثناء التنفيذ." },
              },
              {
                id: "p2",
                a: { id: "p2a", text: "أحرص على التفكير في البدائل بعناية قبل أن أتصرّف." },
                b: { id: "p2b", text: "أُقدِم على تجربة فكرة لم تُختبر إذا كان المكسب المحتمل كبيرًا." },
              },
              {
                id: "p3",
                a: { id: "p3a", text: "أتأكد من صحة كل رقم وكل تفصيل في عملي." },
                b: { id: "p3b", text: "تأتيني أفضل الأفكار حين أفكّر بصوت مسموع مع زملائي." },
              },
              {
                id: "p4",
                a: { id: "p4a", text: "أحب أن أتولّى المهمة بنفسي من بدايتها إلى نهايتها." },
                b: { id: "p4b", text: "أُبقي الغاية العامة من العمل نصب عينيّ في كل وقت." },
              },
              {
                id: "p5",
                a: { id: "p5a", text: "يسعدني أن ألتقط أخطاء صغيرة فاتت الآخرين." },
                b: { id: "p5b", text: "أفضّل أن أخوض مخاطرة محسوبة على أن تفوتني فرصة." },
              },
              {
                id: "p6",
                a: { id: "p6a", text: "أحب أن نتفق على طريقة العمل مع الفريق كله قبل أن نبدأ." },
                b: { id: "p6b", text: "أفضّل أن تكون لديّ خطة واضحة قبل أن أبدأ أي مهمة." },
              },
              {
                id: "p7",
                a: { id: "p7a", text: "أحب أن أرى كيف يرتبط عملي بالاستراتيجية الأشمل." },
                b: { id: "p7b", text: "أفضّل انتظار أدلة كافية قبل تغيير إجراء ناجح." },
              },
              {
                id: "p8",
                a: { id: "p8a", text: "أتخذ القرارات بسرعة كي لا يتوقف العمل." },
                b: { id: "p8b", text: "أفكّر على أفضل نحو حين أعالج المشكلة بمفردي." },
              },
            ],
          },
        },
      },
    },
    hidden: {
      en: {
        rubric: [SELF_AWARENESS_RUBRIC],
        strongIndicators: [],
        redFlags: [],
        embeddedDetail: null,
        workStyleMap: [
          { pairId: "p1", a: { style: "workstyle.risk", pole: "a" }, b: { style: "workstyle.pace", pole: "b" } },
          { pairId: "p2", a: { style: "workstyle.pace", pole: "a" }, b: { style: "workstyle.risk", pole: "b" } },
          { pairId: "p3", a: { style: "workstyle.focus", pole: "a" }, b: { style: "workstyle.mode", pole: "b" } },
          { pairId: "p4", a: { style: "workstyle.mode", pole: "a" }, b: { style: "workstyle.focus", pole: "b" } },
          { pairId: "p5", a: { style: "workstyle.focus", pole: "a" }, b: { style: "workstyle.risk", pole: "b" } },
          { pairId: "p6", a: { style: "workstyle.mode", pole: "b" }, b: { style: "workstyle.pace", pole: "a" } },
          { pairId: "p7", a: { style: "workstyle.focus", pole: "b" }, b: { style: "workstyle.risk", pole: "a" } },
          { pairId: "p8", a: { style: "workstyle.pace", pole: "b" }, b: { style: "workstyle.mode", pole: "a" } },
        ],
      },
    },
  },
  {
    id: "ws-02-working-preferences",
    type: "FORCED_CHOICE_WORK_STYLE",
    difficulty: 2,
    dials: { ambiguity: 2, stakeholders: 1, conflictingConstraints: 2, stakes: 1, timePressure: 1, informationGaps: 1 },
    targets: ["collaboration.self-awareness"],
    roleFamilies: [],
    minutes: 3,
    storyPhase: "late",
    content: {
      en: {
        title: "Your working preferences",
        scenario:
          "Here are more pairs of statements about how people work. In each pair, both statements describe a strength that some roles need more than others. Choose the one that fits you better, even if both are partly true. Answer quickly and honestly; there are no right or wrong answers.",
        materials: [],
        task: {
          kind: "forced_choice",
          prompt: "For each pair, choose the statement that is more like you at work.",
          forcedChoice: {
            pairs: [
              {
                id: "q1",
                a: { id: "q1a", text: "I enjoy taking on projects where success is not guaranteed." },
                b: { id: "q1b", text: "I prefer to work a problem out myself before asking others." },
              },
              {
                id: "q2",
                a: { id: "q2a", text: "I like to check plans carefully for what could go wrong." },
                b: { id: "q2b", text: "I enjoy solving problems together in a group discussion." },
              },
              {
                id: "q3",
                a: { id: "q3a", text: "I like to reflect on a decision overnight before finalising it." },
                b: { id: "q3b", text: "I naturally think about long-term direction more than daily tasks." },
              },
              {
                id: "q4",
                a: { id: "q4a", text: "I like to act on a decision as soon as I have the main facts." },
                b: { id: "q4b", text: "I keep careful records so that nothing is overlooked." },
              },
              {
                id: "q5",
                a: { id: "q5a", text: "I would rather review all the options than choose quickly." },
                b: { id: "q5b", text: "I am happy to back a new idea before others are convinced." },
              },
              {
                id: "q6",
                a: { id: "q6a", text: "I like to share unfinished work early to get colleagues' input." },
                b: { id: "q6b", text: "I prefer to check the details of a document line by line." },
              },
              {
                id: "q7",
                a: { id: "q7a", text: "I would rather start with a rough version and improve it quickly." },
                b: { id: "q7b", text: "I prefer to follow established procedures when the stakes are high." },
              },
              {
                id: "q8",
                a: { id: "q8a", text: "I like to decide my own approach and timing for my work." },
                b: { id: "q8b", text: "I like to explain the big picture before discussing details." },
              },
            ],
          },
        },
      },
      ar: {
        title: "تفضيلاتك في العمل",
        scenario:
          "إليك أزواجًا أخرى من العبارات عن طرائق الناس في العمل. تصف العبارتان في كل زوج نقطة قوة تحتاج إليها بعض الأدوار أكثر من غيرها. اختر العبارة الأنسب لك، حتى لو صدقت كلتاهما عليك جزئيًا. أجب بسرعة وصدق، فلا توجد إجابات صحيحة وأخرى خاطئة.",
        materials: [],
        task: {
          kind: "forced_choice",
          prompt: "اختر من كل زوج العبارة الأقرب إلى طريقتك في العمل.",
          forcedChoice: {
            pairs: [
              {
                id: "q1",
                a: { id: "q1a", text: "أستمتع بتولّي مشروعات لا يكون نجاحها مضمونًا." },
                b: { id: "q1b", text: "أفضّل أن أحلّ المشكلة بنفسي قبل أن أسأل الآخرين." },
              },
              {
                id: "q2",
                a: { id: "q2a", text: "أحب أن أراجع الخطط بعناية بحثًا عمّا قد يسوء." },
                b: { id: "q2b", text: "أستمتع بحل المشكلات مع الآخرين في نقاش جماعي." },
              },
              {
                id: "q3",
                a: { id: "q3a", text: "أحب أن أتأمّل القرار ليلة كاملة قبل أن أعتمده." },
                b: { id: "q3b", text: "أفكّر تلقائيًا في الاتجاه البعيد المدى أكثر من المهام اليومية." },
              },
              {
                id: "q4",
                a: { id: "q4a", text: "أحب أن أنفّذ القرار بمجرد أن تتوافر لديّ الحقائق الرئيسية." },
                b: { id: "q4b", text: "أحتفظ بسجلات دقيقة حتى لا يفوتني شيء." },
              },
              {
                id: "q5",
                a: { id: "q5a", text: "أفضّل مراجعة البدائل كلها على الاختيار السريع." },
                b: { id: "q5b", text: "لا أتردد في دعم فكرة جديدة قبل أن يقتنع بها الآخرون." },
              },
              {
                id: "q6",
                a: { id: "q6a", text: "أحب أن أعرض العمل على زملائي مبكرًا قبل اكتماله لأستفيد من آرائهم." },
                b: { id: "q6b", text: "أفضّل مراجعة تفاصيل المستند سطرًا سطرًا." },
              },
              {
                id: "q7",
                a: { id: "q7a", text: "أفضّل أن أبدأ بنسخة أولية ثم أحسّنها بسرعة." },
                b: { id: "q7b", text: "أفضّل اتباع الإجراءات المعتمدة حين تكون المخاطر عالية." },
              },
              {
                id: "q8",
                a: { id: "q8a", text: "أحب أن أحدّد بنفسي طريقة عملي وتوقيته." },
                b: { id: "q8b", text: "أحب أن أشرح الصورة الكلية قبل الخوض في التفاصيل." },
              },
            ],
          },
        },
      },
    },
    hidden: {
      en: {
        rubric: [SELF_AWARENESS_RUBRIC],
        strongIndicators: [],
        redFlags: [],
        embeddedDetail: null,
        workStyleMap: [
          { pairId: "q1", a: { style: "workstyle.risk", pole: "b" }, b: { style: "workstyle.mode", pole: "a" } },
          { pairId: "q2", a: { style: "workstyle.risk", pole: "a" }, b: { style: "workstyle.mode", pole: "b" } },
          { pairId: "q3", a: { style: "workstyle.pace", pole: "a" }, b: { style: "workstyle.focus", pole: "b" } },
          { pairId: "q4", a: { style: "workstyle.pace", pole: "b" }, b: { style: "workstyle.focus", pole: "a" } },
          { pairId: "q5", a: { style: "workstyle.pace", pole: "a" }, b: { style: "workstyle.risk", pole: "b" } },
          { pairId: "q6", a: { style: "workstyle.mode", pole: "b" }, b: { style: "workstyle.focus", pole: "a" } },
          { pairId: "q7", a: { style: "workstyle.pace", pole: "b" }, b: { style: "workstyle.risk", pole: "a" } },
          { pairId: "q8", a: { style: "workstyle.mode", pole: "a" }, b: { style: "workstyle.focus", pole: "b" } },
        ],
      },
    },
  },
];
