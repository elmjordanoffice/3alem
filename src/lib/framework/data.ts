// Built-in Aalim competency framework: level names, domains with behavioural anchors, and work styles.

import type { DomainDef, LevelNameDef, WorkStyleDef } from "./types";

export const LEVEL_NAMES: LevelNameDef[] = [
  { level: 1, name: { en: "Emerging", ar: "ناشئ" } },
  { level: 2, name: { en: "Developing", ar: "في طور النمو" } },
  { level: 3, name: { en: "Proficient", ar: "متمكّن" } },
  { level: 4, name: { en: "Advanced", ar: "متقدّم" } },
  { level: 5, name: { en: "Expert", ar: "خبير" } },
];

export const DOMAINS: DomainDef[] = [
  {
    key: "technical",
    order: 1,
    name: { en: "Technical / domain expertise", ar: "الخبرة الفنية والتخصصية" },
    description: {
      en: "Command of the knowledge and methods the role requires, and the ability to apply them to real work problems.",
      ar: "الإلمام بالمعارف والأساليب التي يتطلّبها الدور، والقدرة على تطبيقها في مشكلات العمل الفعلية.",
    },
    highLevel: {
      en: "Diagnoses unfamiliar problems from first principles and knows the limits of their knowledge.",
      ar: "يشخّص المشكلات غير المألوفة انطلاقًا من المبادئ الأساسية، ويدرك حدود معرفته.",
    },
    generatedFromJobDescription: true,
    subSkills: [
      {
        key: "technical.role-knowledge",
        name: { en: "Role knowledge", ar: "المعرفة بمتطلبات الدور" },
        description: {
          en: "Accurate knowledge of the concepts, tools, and standards central to the role.",
          ar: "معرفة دقيقة بالمفاهيم والأدوات والمعايير الجوهرية في الدور.",
        },
        anchors: {
          1: {
            en: "States facts or methods that are incorrect or outdated for the role, or does not draw on role knowledge where the scenario requires it.",
            ar: "يذكر معلومات أو أساليب خاطئة أو متقادمة بالنسبة إلى الدور، أو لا يستند إلى معرفته بالدور حين يتطلّب الموقف ذلك.",
          },
          2: {
            en: "Uses correct terms and standard methods but applies them generically, missing details that matter in this specific scenario.",
            ar: "يستخدم المصطلحات الصحيحة والأساليب المعتادة، لكنه يطبّقها تطبيقًا عامًا ويُغفل تفاصيل مهمة في هذا الموقف تحديدًا.",
          },
          3: {
            en: "Applies accurate, current role knowledge to the scenario and names the specific tools, standards, or methods that fit it.",
            ar: "يطبّق معرفة دقيقة وحديثة بالدور على الموقف، ويسمّي الأدوات أو المعايير أو الأساليب المحددة الملائمة له.",
          },
          4: {
            en: "Explains why the chosen method fits better than alternatives and flags common pitfalls that practitioners in the role often miss.",
            ar: "يوضّح سبب تفضيل الأسلوب المختار على البدائل، وينبّه إلى أخطاء شائعة كثيرًا ما يغفل عنها العاملون في هذا الدور.",
          },
          5: {
            en: "Connects role knowledge to underlying principles, noting where standard practice breaks down in this scenario and what to do instead.",
            ar: "يربط معرفته بالدور بالمبادئ التي تقوم عليها، ويبيّن مواضع قصور الممارسة المعتادة في هذا الموقف والبديل الأنسب.",
          },
        },
      },
      {
        key: "technical.problem-diagnosis",
        name: { en: "Problem diagnosis", ar: "تشخيص المشكلات" },
        description: {
          en: "Working out what is actually wrong in a technical situation before acting.",
          ar: "تحديد الخلل الفعلي في موقف فني قبل الشروع في التصرّف.",
        },
        anchors: {
          1: {
            en: "Jumps to a fix without identifying the cause, or treats the first visible symptom as the problem itself.",
            ar: "ينتقل مباشرة إلى الحل دون تحديد السبب، أو يعدّ أول عَرَض ظاهر هو المشكلة نفسها.",
          },
          2: {
            en: "Names one plausible cause but does not check it against the available information or consider other causes.",
            ar: "يذكر سببًا محتملًا واحدًا، لكنه لا يتحقق منه في ضوء المعلومات المتاحة ولا ينظر في أسباب أخرى.",
          },
          3: {
            en: "Lists several plausible causes, uses the information given to narrow them down, and proposes a sensible next check.",
            ar: "يعدّد عدة أسباب محتملة، ويستعين بالمعلومات المتاحة لتضييقها، ويقترح خطوة تحقق تالية معقولة.",
          },
          4: {
            en: "Orders hypotheses by likelihood and cost to test, and names the result that would confirm or rule out each one.",
            ar: "يرتّب الفرضيات بحسب احتمالها وتكلفة اختبارها، ويحدّد النتيجة التي تؤكد كل فرضية أو تستبعدها.",
          },
          5: {
            en: "Reasons from first principles to explain an unfamiliar failure, spots inconsistent clues others would dismiss, and designs the quickest test that discriminates between causes.",
            ar: "ينطلق من المبادئ الأساسية لتفسير خلل غير مألوف، ويلتقط مؤشرات متعارضة قد يتجاهلها غيره، ويصمّم أسرع اختبار يميّز بين الأسباب المحتملة.",
          },
        },
      },
      {
        key: "technical.applying-knowledge",
        name: { en: "Applying knowledge to new cases", ar: "تطبيق المعرفة على حالات جديدة" },
        description: {
          en: "Transferring known methods to situations that do not match familiar patterns.",
          ar: "نقل الأساليب المعروفة إلى مواقف لا تطابق الأنماط المألوفة.",
        },
        anchors: {
          1: {
            en: "Applies a familiar procedure unchanged even where the scenario differs in ways that make it unsuitable.",
            ar: "يطبّق إجراءً مألوفًا كما هو، حتى حين يختلف الموقف اختلافًا يجعله غير مناسب.",
          },
          2: {
            en: "Notices that the case is different but adapts the approach only superficially or does not explain the adjustment.",
            ar: "يلاحظ أن الحالة مختلفة، لكنه يعدّل النهج تعديلًا سطحيًا أو لا يوضّح سبب التعديل.",
          },
          3: {
            en: "Identifies how the new case differs from the standard one and adjusts the method accordingly, with a stated reason.",
            ar: "يحدّد أوجه اختلاف الحالة الجديدة عن الحالة المعتادة، ويعدّل الأسلوب بناءً عليها مع ذكر السبب.",
          },
          4: {
            en: "Separates which parts of a known method still hold from those that must change, and checks the adapted approach against the new constraints.",
            ar: "يميّز بين ما يظل صالحًا من الأسلوب المعروف وما يجب تغييره، ويختبر النهج المعدَّل في ضوء القيود الجديدة.",
          },
          5: {
            en: "Draws on principles or analogies from adjacent fields to build a workable approach where no standard method exists, and states its risks.",
            ar: "يستعين بمبادئ أو أوجه تشابه من مجالات قريبة لبناء نهج عملي حين لا يوجد أسلوب معتمد، ويبيّن المخاطر المترتبة عليه.",
          },
        },
      },
      {
        key: "technical.calibrated-depth",
        name: { en: "Knowing the limits of one's knowledge", ar: "إدراك حدود المعرفة" },
        description: {
          en: "Matching certainty to actual knowledge and recognising when to verify or seek other expertise.",
          ar: "مواءمة درجة اليقين مع المعرفة الفعلية، وإدراك متى يلزم التحقق أو الاستعانة بخبرة أخرى.",
        },
        anchors: {
          1: {
            en: "States uncertain or incorrect points as settled fact, or declines to give any view where their knowledge would allow one.",
            ar: "يقدّم نقاطًا غير مؤكدة أو خاطئة على أنها حقائق ثابتة، أو يمتنع عن إبداء أي رأي مع أن معرفته تسمح بذلك.",
          },
          2: {
            en: "Acknowledges uncertainty in general terms but does not say which specific points are uncertain or how to resolve them.",
            ar: "يقرّ بوجود عدم يقين بعبارات عامة، لكنه لا يحدّد النقاط غير المؤكدة ولا كيفية حسمها.",
          },
          3: {
            en: "Distinguishes what they know from what they would need to check, and names a reasonable way to verify it.",
            ar: "يميّز بين ما يعرفه وما يحتاج إلى التحقق منه، ويقترح طريقة معقولة للتحقق.",
          },
          4: {
            en: "Indicates different degrees of confidence for different parts of the answer and names the expert or source to consult on the weakest parts.",
            ar: "يبيّن درجات ثقة متفاوتة لأجزاء الإجابة المختلفة، ويحدّد الخبير أو المصدر المناسب لاستشارته في أضعف أجزائها.",
          },
          5: {
            en: "Pinpoints where their expertise ends, explains how errors beyond that point would affect the outcome, and shapes the plan to limit that exposure.",
            ar: "يحدّد بدقة النقطة التي تنتهي عندها خبرته، ويوضّح أثر الأخطاء التي قد تقع خارجها في النتيجة، ويبني الخطة بما يحدّ من هذا الأثر.",
          },
        },
      },
    ],
  },
  {
    key: "critical-thinking",
    order: 2,
    name: { en: "Critical thinking", ar: "التفكير النقدي" },
    description: {
      en: "Analysing information rigorously to reach sound conclusions.",
      ar: "تحليل المعلومات بدقة للوصول إلى استنتاجات سليمة.",
    },
    highLevel: {
      en: "Questions the premise and separates signal from noise.",
      ar: "يراجع المنطلقات التي تقوم عليها المسألة، ويميّز المعلومات المهمة من المشتّتات.",
    },
    subSkills: [
      {
        key: "critical-thinking.evaluating-evidence",
        name: { en: "Evaluating evidence", ar: "تقييم الأدلة" },
        description: {
          en: "Judging how reliable and relevant information is before relying on it.",
          ar: "الحكم على موثوقية المعلومات وصلتها بالموضوع قبل الاعتماد عليها.",
        },
        anchors: {
          1: {
            en: "Accepts all information in the scenario at face value, or treats a single anecdote as proof.",
            ar: "يأخذ كل المعلومات الواردة في الموقف على ظاهرها، أو يعدّ حالة فردية واحدة دليلًا قاطعًا.",
          },
          2: {
            en: "Questions some information but without a clear basis, or treats all sources as equally reliable.",
            ar: "يشكّك في بعض المعلومات دون أساس واضح، أو يعامل جميع المصادر على أنها متساوية في الموثوقية.",
          },
          3: {
            en: "Weighs sources by reliability and relevance, notes gaps in the evidence, and bases the conclusion on the stronger information.",
            ar: "يوازن بين المصادر بحسب موثوقيتها وصلتها، ويشير إلى الثغرات في الأدلة، ويبني استنتاجه على المعلومات الأقوى.",
          },
          4: {
            en: "Names specific weaknesses such as small samples, bias, or missing comparisons, and states what additional evidence would change the conclusion.",
            ar: "يحدّد مواطن ضعف بعينها، مثل صغر العينة أو التحيّز أو غياب المقارنة، ويذكر الأدلة الإضافية التي قد تغيّر استنتاجه.",
          },
          5: {
            en: "Identifies the piece of evidence the conclusion rests on most, tests it against alternative explanations, and states confidence accordingly.",
            ar: "يحدّد الدليل الذي يستند إليه الاستنتاج أكثر من غيره، ويختبره في مقابل التفسيرات البديلة، ويحدّد درجة ثقته بناءً على ذلك.",
          },
        },
      },
      {
        key: "critical-thinking.spotting-assumptions",
        name: { en: "Spotting assumptions", ar: "كشف الافتراضات" },
        description: {
          en: "Recognising the unstated beliefs behind a claim, a plan, or the question itself.",
          ar: "التعرّف على القناعات غير المعلنة التي يقوم عليها ادعاء أو خطة أو السؤال نفسه.",
        },
        anchors: {
          1: {
            en: "Builds the answer on unstated assumptions without noticing them, including assumptions built into the question.",
            ar: "يبني إجابته على افتراضات غير معلنة دون أن ينتبه إليها، بما فيها الافتراضات الكامنة في السؤال نفسه.",
          },
          2: {
            en: "Notices an obvious assumption when it is close to the surface but does not consider whether it holds.",
            ar: "ينتبه إلى افتراض واضح حين يكون ظاهرًا، لكنه لا يتحقق من صحته.",
          },
          3: {
            en: "Names the key assumptions behind a claim or plan and says which ones need to be checked.",
            ar: "يسمّي الافتراضات الرئيسية التي يقوم عليها ادعاء أو خطة، ويحدّد ما يلزم التحقق منه.",
          },
          4: {
            en: "Identifies hidden assumptions that others share without question and explains how the conclusion changes if one proves false.",
            ar: "يكشف افتراضات خفية يتبنّاها الآخرون دون مساءلة، ويوضّح كيف يتغيّر الاستنتاج إذا ثبت خطأ أحدها.",
          },
          5: {
            en: "Questions the premise of the scenario itself, showing when the problem as posed rests on a false assumption, and proposes a better question.",
            ar: "يراجع منطلقات الموقف نفسه، فيبيّن متى تقوم المشكلة كما طُرحت على افتراض خاطئ، ويقترح السؤال الأصوب.",
          },
        },
      },
      {
        key: "critical-thinking.root-cause-analysis",
        name: { en: "Root-cause analysis", ar: "تحليل السبب الجذري" },
        description: {
          en: "Tracing a problem back to its underlying cause rather than stopping at its symptoms.",
          ar: "تتبّع المشكلة حتى سببها الجذري بدلًا من الوقوف عند أعراضها.",
        },
        anchors: {
          1: {
            en: "Addresses only the visible symptom, or assigns blame to a person without examining why the problem occurred.",
            ar: "يعالج العَرَض الظاهر فقط، أو يُلقي اللوم على شخص دون أن يبحث في سبب وقوع المشكلة.",
          },
          2: {
            en: "Looks one step behind the symptom but stops at the first cause found.",
            ar: "يتجاوز العَرَض بخطوة واحدة، لكنه يتوقف عند أول سبب يجده.",
          },
          3: {
            en: "Traces the problem through a chain of causes to an underlying one and proposes a fix aimed at it.",
            ar: "يتتبّع المشكلة عبر سلسلة من الأسباب حتى يصل إلى سبب جذري، ويقترح حلًّا يستهدفه.",
          },
          4: {
            en: "Distinguishes contributing factors from the root cause, checks the causal chain against the facts given, and proposes how to prevent recurrence.",
            ar: "يميّز بين العوامل المساهمة والسبب الجذري، ويتحقق من سلسلة الأسباب في ضوء المعطيات، ويقترح طريقة لمنع تكرار المشكلة.",
          },
          5: {
            en: "Identifies systemic causes, such as incentives or processes, that would produce the same failure elsewhere, and proposes a fix at that level.",
            ar: "يكشف أسبابًا مؤسسية، مثل الحوافز أو الإجراءات، من شأنها أن تُحدث الخلل نفسه في مواضع أخرى، ويقترح حلًّا على هذا المستوى.",
          },
        },
      },
      {
        key: "critical-thinking.logical-reasoning",
        name: { en: "Logical reasoning", ar: "الاستدلال المنطقي" },
        description: {
          en: "Drawing conclusions that follow validly from the information available.",
          ar: "استخلاص نتائج تترتّب ترتيبًا سليمًا على المعلومات المتاحة.",
        },
        anchors: {
          1: {
            en: "Reaches a conclusion that does not follow from the stated reasons, or contradicts earlier points in the same response.",
            ar: "يصل إلى نتيجة لا تترتّب على الأسباب التي ذكرها، أو يناقض نقاطًا سابقة في الإجابة نفسها.",
          },
          2: {
            en: "Gives reasons that mostly support the conclusion but contain gaps, such as treating correlation as cause.",
            ar: "يقدّم أسبابًا تدعم النتيجة في معظمها، لكنها تتضمّن ثغرات، مثل عدّ الارتباط سببًا.",
          },
          3: {
            en: "Links each conclusion to explicit reasons in a consistent sequence, with no contradictions or unsupported leaps.",
            ar: "يربط كل نتيجة بأسباب صريحة في تسلسل متّسق، دون تناقض أو قفزات غير مبرَّرة.",
          },
          4: {
            en: "Identifies flawed reasoning in the scenario, such as false either-or choices or circular arguments, and explains why it fails.",
            ar: "يكشف الاستدلال المعيب في الموقف، مثل حصر الخيارات في بديلين أو الاستدلال الدائري، ويوضّح سبب قصوره.",
          },
          5: {
            en: "Tests the conclusion by asking what else would have to be true if it held, and revises it when those implications do not fit.",
            ar: "يختبر النتيجة بالنظر فيما يجب أن يصحّ أيضًا لو كانت صحيحة، ويراجعها إذا لم تتّسق تلك اللوازم مع المعطيات.",
          },
        },
      },
      {
        key: "critical-thinking.quantitative-reasoning",
        name: { en: "Quantitative reasoning", ar: "الاستدلال الكمّي" },
        description: {
          en: "Using numbers, rates, and estimates correctly to inform a conclusion.",
          ar: "استخدام الأرقام والنسب والتقديرات استخدامًا صحيحًا لدعم الاستنتاج.",
        },
        anchors: {
          1: {
            en: "Ignores numbers that bear on the decision, or misreads them, for example confusing percentages with absolute figures.",
            ar: "يتجاهل أرقامًا تؤثر في القرار أو يسيء قراءتها، كأن يخلط بين النسب المئوية والأرقام المطلقة.",
          },
          2: {
            en: "Uses the numbers given at face value only, without comparing them to a baseline or checking their scale.",
            ar: "يستخدم الأرقام المعطاة على ظاهرها فقط، دون مقارنتها بخط أساس أو التحقق من حجمها.",
          },
          3: {
            en: "Performs the relevant calculations or rough estimates correctly and uses them to support the conclusion.",
            ar: "يُجري الحسابات أو التقديرات التقريبية اللازمة على نحو صحيح، ويستخدمها لدعم استنتاجه.",
          },
          4: {
            en: "Puts figures in context with baselines, rates, or ranges, and points out when a number could mislead.",
            ar: "يضع الأرقام في سياقها بمقارنتها بخطوط الأساس أو المعدلات أو النطاقات، وينبّه حين يكون رقم ما مضلِّلًا.",
          },
          5: {
            en: "Builds a quick estimate to test whether a claim is plausible at all, identifies the variable the outcome is most sensitive to, and states the uncertainty.",
            ar: "يُعدّ تقديرًا سريعًا ليختبر مدى معقولية الادعاء، ويحدّد المتغيّر الأشد تأثيرًا في النتيجة، ويبيّن هامش عدم اليقين.",
          },
        },
      },
    ],
  },
  {
    key: "judgment",
    order: 3,
    name: { en: "Decision-making and judgment", ar: "اتخاذ القرار وحسن التقدير" },
    description: {
      en: "Making sound, proportionate decisions when information is incomplete and the stakes are real.",
      ar: "اتخاذ قرارات سليمة ومتناسبة حين تكون المعلومات ناقصة والعواقب حقيقية.",
    },
    highLevel: {
      en: "Makes proportionate decisions, weighs consequences, and updates when new facts arrive.",
      ar: "يتخذ قرارات متناسبة، ويوازن بين العواقب، ويراجع قراره عند ظهور معطيات جديدة.",
    },
    subSkills: [
      {
        key: "judgment.trade-off-reasoning",
        name: { en: "Trade-off reasoning", ar: "الموازنة بين البدائل" },
        description: {
          en: "Comparing options by what each gains and costs, rather than looking for a cost-free answer.",
          ar: "مقارنة البدائل بما يحققه كل منها وما يكلّفه، بدلًا من البحث عن حل بلا تكلفة.",
        },
        anchors: {
          1: {
            en: "Picks an option without mentioning any downside, or presents the decision as having one obvious answer.",
            ar: "يختار بديلًا دون أن يذكر أي جانب سلبي له، أو يعرض القرار كأن له إجابة واحدة بديهية.",
          },
          2: {
            en: "Lists the pros and cons of options but does not weigh them against each other or explain the final choice.",
            ar: "يعدّد مزايا البدائل وعيوبها، لكنه لا يوازن بينها ولا يوضّح سبب اختياره النهائي.",
          },
          3: {
            en: "Compares options on the factors that matter most in the scenario and explains why the chosen option's costs are acceptable.",
            ar: "يقارن البدائل وفق العوامل الأهم في الموقف، ويوضّح سبب قبول التكاليف المترتبة على البديل المختار.",
          },
          4: {
            en: "Makes the decision criteria explicit, weights them by the goals at stake, and names what would make a different option preferable.",
            ar: "يصرّح بمعايير القرار، ويمنحها أوزانًا بحسب الأهداف المعنية، ويحدّد ما قد يجعل بديلًا آخر أفضل.",
          },
          5: {
            en: "Finds an option that reduces the trade-off itself, such as sequencing or a reversible first step, rather than only choosing between the options given.",
            ar: "يجد بديلًا يخفّف حدة المفاضلة نفسها، كترتيب الخطوات زمنيًا أو البدء بخطوة يمكن التراجع عنها، بدلًا من الاكتفاء بالاختيار بين البدائل المطروحة.",
          },
        },
      },
      {
        key: "judgment.risk-calibration",
        name: { en: "Risk calibration", ar: "تقدير المخاطر" },
        description: {
          en: "Judging the likelihood and impact of what could go wrong and responding in proportion.",
          ar: "تقدير احتمال المخاطر وأثرها، والتعامل معها بقدر متناسب.",
        },
        anchors: {
          1: {
            en: "Ignores clear risks in the scenario, or treats minor risks as reasons not to act at all.",
            ar: "يتجاهل مخاطر واضحة في الموقف، أو يتخذ من مخاطر بسيطة ذريعة للامتناع عن التصرّف كليًا.",
          },
          2: {
            en: "Names risks but does not distinguish likely from unlikely ones or severe from minor ones.",
            ar: "يذكر المخاطر، لكنه لا يميّز المرجّح منها من المستبعد، ولا الجسيم من البسيط.",
          },
          3: {
            en: "Assesses the main risks by likelihood and impact and proposes safeguards proportionate to the most serious ones.",
            ar: "يقيّم المخاطر الرئيسية بحسب احتمالها وأثرها، ويقترح ضمانات تتناسب مع أشدّها خطورة.",
          },
          4: {
            en: "Distinguishes reversible from irreversible risks, sets the level of caution accordingly, and names early warning signs to monitor.",
            ar: "يميّز بين المخاطر القابلة للتدارك وتلك التي لا يمكن تداركها، ويحدّد درجة الحذر بناءً على ذلك، ويسمّي مؤشرات إنذار مبكر للمتابعة.",
          },
          5: {
            en: "Weighs the risk of inaction against the risk of acting, identifies low-probability, high-impact outcomes others overlook, and states uncertainty in proportion to the evidence.",
            ar: "يوازن بين مخاطر عدم التصرّف ومخاطر التصرّف، ويكشف نتائج قليلة الاحتمال شديدة الأثر يغفل عنها الآخرون، ويعبّر عن عدم اليقين بقدر ما تسمح به الأدلة.",
          },
        },
      },
      {
        key: "judgment.deciding-under-ambiguity",
        name: { en: "Deciding under ambiguity", ar: "اتخاذ القرار في ظل الغموض" },
        description: {
          en: "Reaching a workable decision when key facts are missing or unclear.",
          ar: "التوصّل إلى قرار عملي حين تكون معطيات أساسية مفقودة أو غير واضحة.",
        },
        anchors: {
          1: {
            en: "Declines to decide until all information is available, or decides arbitrarily without acknowledging what is unknown.",
            ar: "يرفض اتخاذ القرار حتى تتوافر المعلومات كاملة، أو يقرّر اعتباطًا دون الإقرار بما هو مجهول.",
          },
          2: {
            en: "Makes a decision but does not state the assumptions used to fill the gaps or how to check them.",
            ar: "يتخذ قرارًا، لكنه لا يصرّح بالافتراضات التي سدّ بها الثغرات ولا بكيفية التحقق منها.",
          },
          3: {
            en: "Decides on the best available information, states the key assumptions, and names what to watch to confirm the decision.",
            ar: "يقرّر بناءً على أفضل المعلومات المتاحة، ويصرّح بالافتراضات الرئيسية، ويحدّد ما ينبغي متابعته لتأكيد صحة القرار.",
          },
          4: {
            en: "Separates what must be decided now from what can wait, and seeks only the information that would change the decision.",
            ar: "يفصل بين ما يجب حسمه الآن وما يمكن تأجيله، ولا يسعى من المعلومات إلا إلى ما قد يغيّر القرار.",
          },
          5: {
            en: "Structures the decision so it stays sound across the likely scenarios, with clear points to revisit it as new facts emerge.",
            ar: "يصوغ القرار بحيث يظل سليمًا في مختلف الاحتمالات المرجّحة، مع نقاط مراجعة واضحة كلما ظهرت معطيات جديدة.",
          },
        },
      },
      {
        key: "judgment.ethical-judgment",
        name: { en: "Ethical judgment", ar: "الحكم الأخلاقي" },
        description: {
          en: "Recognising the ethical dimension of a situation and acting with integrity when it conflicts with other goals.",
          ar: "إدراك البعد الأخلاقي في الموقف، والتصرّف بنزاهة حين يتعارض مع أهداف أخرى.",
        },
        anchors: {
          1: {
            en: "Does not notice the ethical issue in the scenario, or proposes a course that harms others or breaks rules to reach a goal.",
            ar: "لا ينتبه إلى المسألة الأخلاقية في الموقف، أو يقترح مسارًا يُلحق الضرر بالآخرين أو يخالف القواعد لبلوغ هدف ما.",
          },
          2: {
            en: "Recognises the ethical issue but resolves it by citing a rule, without considering who is affected.",
            ar: "يدرك المسألة الأخلاقية، لكنه يحسمها بالاستناد إلى قاعدة دون النظر في الأطراف المتأثرة.",
          },
          3: {
            en: "Names the ethical issue, identifies who would be affected and how, and chooses a course that is honest and fair to them.",
            ar: "يسمّي المسألة الأخلاقية، ويحدّد الأطراف المتأثرة ووجه تأثرها، ويختار مسارًا صادقًا ومنصفًا لها.",
          },
          4: {
            en: "Holds an ethical line under pressure from targets or seniority, and proposes a practical way to meet the legitimate goal without crossing it.",
            ar: "يتمسّك بالحدّ الأخلاقي تحت ضغط الأهداف أو السلطة، ويقترح طريقة عملية لتحقيق الهدف المشروع دون تجاوزه.",
          },
          5: {
            en: "Spots ethical risks that are not obvious, such as the precedent a decision sets or effects on people outside the scenario, and addresses them early.",
            ar: "يلتقط مخاطر أخلاقية غير ظاهرة، مثل السابقة التي قد يرسيها القرار أو أثره في أشخاص خارج الموقف، ويعالجها مبكرًا.",
          },
        },
      },
      {
        key: "judgment.second-order-thinking",
        name: { en: "Second-order thinking", ar: "التفكير في العواقب اللاحقة" },
        description: {
          en: "Considering the indirect and later effects of a decision, not only its immediate result.",
          ar: "النظر في الآثار غير المباشرة واللاحقة للقرار، لا في نتيجته الفورية فحسب.",
        },
        anchors: {
          1: {
            en: "Considers only the immediate result of a decision, even where later effects are clearly significant.",
            ar: "لا ينظر إلا في النتيجة الفورية للقرار، حتى حين تكون آثاره اللاحقة مهمة بوضوح.",
          },
          2: {
            en: "Mentions that a decision could have later effects but does not say what they are or how likely they are.",
            ar: "يشير إلى أن للقرار آثارًا لاحقة محتملة، لكنه لا يحدّدها ولا يقدّر احتمالها.",
          },
          3: {
            en: "Identifies the likely follow-on effects of a decision on people, processes, or costs and factors them into the choice.",
            ar: "يحدّد الآثار المرجّحة المترتبة على القرار في الأشخاص أو الإجراءات أو التكاليف، ويأخذها في الحسبان عند الاختيار.",
          },
          4: {
            en: "Traces how others are likely to react to the decision and how those reactions change the outcome over time.",
            ar: "يتتبّع ردود الفعل المرجّحة للآخرين تجاه القرار، وكيف تغيّر هذه الردود النتيجة بمرور الوقت.",
          },
          5: {
            en: "Identifies an unintended consequence others miss, such as an incentive that rewards the wrong behaviour or an unwanted precedent, and adjusts the decision to avoid it.",
            ar: "يكشف عاقبة غير مقصودة يغفل عنها الآخرون، مثل حافز يكافئ سلوكًا غير مرغوب أو سابقة غير مرغوبة، ويعدّل القرار لتفاديها.",
          },
        },
      },
      {
        key: "judgment.knowing-when-to-escalate",
        name: { en: "Knowing when to escalate", ar: "تقدير متى يلزم التصعيد" },
        description: {
          en: "Judging which issues to handle alone and which to raise with others, and when.",
          ar: "تقدير ما يعالجه الفرد بنفسه وما يرفعه إلى غيره، وتوقيت ذلك.",
        },
        anchors: {
          1: {
            en: "Handles alone an issue that clearly exceeds their authority, or escalates routine matters they could resolve themselves.",
            ar: "ينفرد بمعالجة مسألة تتجاوز صلاحياته بوضوح، أو يصعّد أمورًا روتينية يستطيع حلّها بنفسه.",
          },
          2: {
            en: "Escalates appropriate issues but late, or without stating what decision or help is needed.",
            ar: "يصعّد المسائل المناسبة، لكن متأخرًا، أو دون أن يحدّد القرار أو المساعدة المطلوبة.",
          },
          3: {
            en: "Escalates when an issue exceeds their authority or acceptable risk, to the right person, with the facts and a proposed action.",
            ar: "يصعّد حين تتجاوز المسألة صلاحياته أو حدود المخاطر المقبولة، إلى الشخص المناسب، مع عرض الوقائع وإجراء مقترح.",
          },
          4: {
            en: "Takes the immediate steps within their authority to contain the issue while escalating, and states clearly what they need decided.",
            ar: "يتخذ الخطوات الفورية ضمن صلاحياته لاحتواء المسألة بالتوازي مع التصعيد، ويحدّد بوضوح القرار المطلوب من غيره.",
          },
          5: {
            en: "Anticipates when an issue is likely to need escalation and raises it early with options and a recommendation, avoiding both surprise and unnecessary alarm.",
            ar: "يتوقّع متى قد تحتاج مسألة إلى التصعيد، فيطرحها مبكرًا مع بدائل وتوصية، متجنّبًا المفاجأة وإثارة القلق دون داعٍ.",
          },
        },
      },
    ],
  },
  {
    key: "leadership",
    order: 4,
    name: { en: "Leadership", ar: "القيادة" },
    description: {
      en: "Taking responsibility for outcomes and guiding others toward a shared goal, with or without formal authority.",
      ar: "تحمّل المسؤولية عن النتائج وتوجيه الآخرين نحو هدف مشترك، بسلطة رسمية أو دونها.",
    },
    highLevel: {
      en: "Takes responsibility and brings people along.",
      ar: "يتحمّل المسؤولية، ويكسب تأييد الآخرين ومشاركتهم.",
    },
    subSkills: [
      {
        key: "leadership.setting-direction",
        name: { en: "Setting direction", ar: "تحديد الاتجاه" },
        description: {
          en: "Defining a clear goal and the reasons for it so others know what to aim for.",
          ar: "تحديد هدف واضح ومسوّغاته ليعرف الآخرون ما يسعون إليه.",
        },
        anchors: {
          1: {
            en: "Gives no clear goal, or lists tasks without explaining what they are meant to achieve.",
            ar: "لا يحدّد هدفًا واضحًا، أو يعدّد مهام دون أن يوضّح الغاية منها.",
          },
          2: {
            en: "States a goal but in vague terms, or does not connect it to the priorities in the scenario.",
            ar: "يذكر هدفًا بعبارات مبهمة، أو لا يربطه بالأولويات الواردة في الموقف.",
          },
          3: {
            en: "States a clear, specific goal, explains why it matters, and links the team's next steps to it.",
            ar: "يحدّد هدفًا واضحًا ومحددًا، ويوضّح أهميته، ويربط به الخطوات التالية للفريق.",
          },
          4: {
            en: "Defines what success looks like and what is out of scope, so people can make aligned decisions without checking back each time.",
            ar: "يحدّد ملامح النجاح وما يقع خارج النطاق، بما يمكّن الآخرين من اتخاذ قرارات متّسقة دون الرجوع إليه في كل مرة.",
          },
          5: {
            en: "Turns a confused situation into a direction people can act on, and anticipates how that direction must adjust as conditions change.",
            ar: "يحوّل الموقف المرتبك إلى اتجاه واضح يمكن العمل وفقه، ويتوقّع كيف ينبغي تعديله مع تغيّر الظروف.",
          },
        },
      },
      {
        key: "leadership.influence-without-authority",
        name: { en: "Influence without authority", ar: "التأثير دون سلطة رسمية" },
        description: {
          en: "Gaining others' support when one cannot direct them.",
          ar: "كسب تأييد الآخرين حين لا يملك الفرد صلاحية توجيههم.",
        },
        anchors: {
          1: {
            en: "Relies on demands or repeated insistence, or gives up when others do not comply.",
            ar: "يعتمد على المطالبة أو الإلحاح المتكرر، أو يتراجع حين لا يستجيب الآخرون.",
          },
          2: {
            en: "Explains their own position but does not consider what the other party cares about.",
            ar: "يشرح موقفه، لكنه لا ينظر فيما يهمّ الطرف الآخر.",
          },
          3: {
            en: "Identifies what the other party values and frames the request in terms of shared goals or mutual benefit.",
            ar: "يحدّد ما يهمّ الطرف الآخر، ويعرض طلبه في إطار الأهداف المشتركة أو المنفعة المتبادلة.",
          },
          4: {
            en: "Builds support in advance with the people whose backing matters most, and addresses their likely objections before they are raised.",
            ar: "يبني التأييد مسبقًا لدى الأشخاص الأكثر تأثيرًا في القرار، ويعالج اعتراضاتهم المتوقعة قبل طرحها.",
          },
          5: {
            en: "Reshapes the proposal so others see it as partly their own, creating lasting commitment rather than reluctant compliance.",
            ar: "يعيد صياغة المقترح بحيث يراه الآخرون نابعًا منهم جزئيًا، فيتحقق التزام راسخ بدلًا من امتثال على مضض.",
          },
        },
      },
      {
        key: "leadership.ownership",
        name: { en: "Ownership", ar: "تحمّل المسؤولية" },
        description: {
          en: "Taking responsibility for outcomes, including problems and mistakes.",
          ar: "تحمّل المسؤولية عن النتائج، بما فيها المشكلات والأخطاء.",
        },
        anchors: {
          1: {
            en: "Attributes the problem to others or to circumstances and proposes no action of their own.",
            ar: "ينسب المشكلة إلى الآخرين أو إلى الظروف، ولا يقترح أي إجراء من جانبه.",
          },
          2: {
            en: "Accepts responsibility when the problem is clearly theirs but stays passive about shared or unassigned problems.",
            ar: "يتحمّل المسؤولية حين تكون المشكلة من شأنه بوضوح، لكنه يقف موقفًا سلبيًا من المشكلات المشتركة أو غير محددة المسؤولية.",
          },
          3: {
            en: "Acknowledges their part in the problem, commits to specific actions, and follows the issue through to resolution.",
            ar: "يقرّ بدوره في المشكلة، ويلتزم بإجراءات محددة، ويتابع المسألة حتى حلّها.",
          },
          4: {
            en: "Steps in on problems outside their formal remit when no one else is acting, while keeping the responsible people informed.",
            ar: "يبادر إلى معالجة مشكلات تقع خارج نطاق مهامه الرسمية حين لا يتحرك غيره، مع إبقاء المسؤولين عنها على اطلاع.",
          },
          5: {
            en: "Owns the outcome beyond the immediate fix, proposing changes that stop the problem recurring, and shares credit while accepting blame personally.",
            ar: "يتحمّل مسؤولية النتيجة بما يتجاوز الحل الفوري، فيقترح تغييرات تمنع تكرار المشكلة، ويُشرك الآخرين في الفضل بينما يتحمّل اللوم بنفسه.",
          },
        },
      },
      {
        key: "leadership.developing-others",
        name: { en: "Developing others", ar: "تطوير الآخرين" },
        description: {
          en: "Helping colleagues build their capability rather than doing the work for them.",
          ar: "مساعدة الزملاء على بناء قدراتهم بدلًا من إنجاز العمل نيابة عنهم.",
        },
        anchors: {
          1: {
            en: "Takes over the task, or criticises the person without offering guidance on how to improve.",
            ar: "يتولّى المهمة بنفسه، أو ينتقد الشخص دون أن يقدّم إرشادًا للتحسّن.",
          },
          2: {
            en: "Gives instructions on what to do but does not explain why or check the person's understanding.",
            ar: "يقدّم تعليمات بما يجب فعله، لكنه لا يشرح السبب ولا يتحقق من فهم الشخص.",
          },
          3: {
            en: "Gives specific, constructive guidance, explains the reasoning behind it, and offers a chance to practise with support.",
            ar: "يقدّم إرشادًا محددًا وبنّاءً، ويشرح المنطق وراءه، ويتيح فرصة للتطبيق مع الدعم.",
          },
          4: {
            en: "Asks questions that lead the person to find the answer, and matches the level of support to their current ability.",
            ar: "يطرح أسئلة تقود الشخص إلى الوصول إلى الإجابة بنفسه، ويوائم مستوى الدعم مع قدراته الحالية.",
          },
          5: {
            en: "Uses the situation as a deliberate development step, such as a stretch assignment with safeguards, building the person's independence over time.",
            ar: "يستثمر الموقف خطوةً مقصودة في مسار التطوير، كإسناد مهمة تتجاوز القدرات الحالية مع ضمانات مناسبة، بما يعزّز استقلالية الشخص بمرور الوقت.",
          },
        },
      },
      {
        key: "leadership.handling-conflict",
        name: { en: "Handling conflict", ar: "إدارة الخلافات" },
        description: {
          en: "Addressing disagreements between people constructively instead of avoiding or inflaming them.",
          ar: "التعامل مع الخلافات بين الأشخاص تعاملًا بنّاءً، بدلًا من تجنّبها أو تأجيجها.",
        },
        anchors: {
          1: {
            en: "Avoids the disagreement, takes sides without hearing both parties, or increases the tension.",
            ar: "يتجنّب الخلاف، أو ينحاز إلى طرف دون الاستماع إلى الطرفين، أو يزيد التوتر حدة.",
          },
          2: {
            en: "Acknowledges the conflict but pushes for a quick compromise without understanding the underlying issue.",
            ar: "يعترف بوجود الخلاف، لكنه يدفع نحو تسوية سريعة دون فهم المسألة الكامنة وراءه.",
          },
          3: {
            en: "Hears each side, identifies the actual point of disagreement, and guides the parties toward a resolution they can accept.",
            ar: "يستمع إلى كل طرف، ويحدّد نقطة الخلاف الفعلية، ويوجّه الطرفين نحو حل يقبلانه.",
          },
          4: {
            en: "Separates people's stated positions from their underlying interests and proposes options that meet the key interests of both sides.",
            ar: "يميّز بين المواقف المعلنة للأطراف ومصالحهم الكامنة، ويقترح بدائل تلبّي المصالح الأساسية للطرفين.",
          },
          5: {
            en: "Uses the conflict to surface a real problem, such as unclear roles or competing targets, and resolves it so the conflict does not return.",
            ar: "يستثمر الخلاف لكشف مشكلة حقيقية، كغموض الأدوار أو تعارض الأهداف، ويعالجها حتى لا يتكرر الخلاف.",
          },
        },
      },
      {
        key: "leadership.courage",
        name: { en: "Courage", ar: "الشجاعة المهنية" },
        description: {
          en: "Raising difficult issues or unpopular views when the situation calls for it.",
          ar: "طرح المسائل الصعبة أو الآراء غير المرغوبة حين يقتضي الموقف ذلك.",
        },
        anchors: {
          1: {
            en: "Stays silent about a serious problem, or goes along with a decision they have reason to believe is wrong.",
            ar: "يلتزم الصمت إزاء مشكلة جسيمة، أو يجاري قرارًا لديه أسباب للاعتقاد بخطئه.",
          },
          2: {
            en: "Raises concerns indirectly or only after the decision is made, or drops them at the first pushback.",
            ar: "يطرح مخاوفه تلميحًا أو بعد اتخاذ القرار، أو يتخلّى عنها عند أول اعتراض.",
          },
          3: {
            en: "States a concern or disagreement clearly and respectfully to the right person, with reasons, at the time it matters.",
            ar: "يعبّر عن مخاوفه أو اعتراضه بوضوح واحترام أمام الشخص المناسب، مع ذكر الأسباب وفي الوقت المناسب.",
          },
          4: {
            en: "Maintains a well-reasoned position when challenged by someone more senior, while staying open to evidence that would change it.",
            ar: "يتمسّك بموقف مدروس حين يعترض عليه شخص أعلى منصبًا، مع انفتاحه على الأدلة التي قد تغيّره.",
          },
          5: {
            en: "Raises an uncomfortable issue no one else has named, frames it so it can be acted on, and accepts personal risk where the stakes justify it.",
            ar: "يطرح مسألة محرجة لم يسمّها أحد غيره، ويصوغها بما يتيح التصرّف حيالها، ويتقبّل المخاطرة الشخصية حين تستدعي أهمية الأمر ذلك.",
          },
        },
      },
    ],
  },
  {
    key: "management",
    order: 5,
    name: { en: "Management", ar: "الإدارة" },
    description: {
      en: "Organising work, people, and resources so that commitments are delivered.",
      ar: "تنظيم العمل والأفراد والموارد بما يضمن الوفاء بالالتزامات.",
    },
    highLevel: {
      en: "Plans realistically and delegates to the right person.",
      ar: "يخطّط بواقعية، ويفوّض المهام إلى الشخص المناسب.",
    },
    subSkills: [
      {
        key: "management.planning-prioritisation",
        name: { en: "Planning and prioritisation", ar: "التخطيط وتحديد الأولويات" },
        description: {
          en: "Sequencing work realistically and deciding what matters most when not everything can be done.",
          ar: "ترتيب العمل ترتيبًا واقعيًا، وتحديد الأهم حين يتعذّر إنجاز كل شيء.",
        },
        anchors: {
          1: {
            en: "Treats all tasks as equally urgent, or commits to a plan that clearly cannot fit the time or resources available.",
            ar: "يعامل جميع المهام على أنها متساوية في الإلحاح، أو يلتزم بخطة لا تتسع لها المدة أو الموارد المتاحة بوضوح.",
          },
          2: {
            en: "Orders tasks by urgency alone, without considering importance, dependencies, or effort.",
            ar: "يرتّب المهام بحسب إلحاحها فقط، دون مراعاة أهميتها أو الترابط بينها أو الجهد الذي تتطلّبه.",
          },
          3: {
            en: "Ranks tasks by importance and urgency, accounts for dependencies, and states what will be deferred or dropped.",
            ar: "يرتّب المهام بحسب أهميتها وإلحاحها، ويراعي الترابط بينها، ويحدّد ما سيُؤجَّل أو يُستبعَد.",
          },
          4: {
            en: "Builds in time buffers for known risks, identifies the critical path, and explains the priorities to those affected.",
            ar: "يضع هوامش زمنية لمواجهة المخاطر المعروفة، ويحدّد المسار الحرج، ويشرح الأولويات للمتأثرين بها.",
          },
          5: {
            en: "Questions whether lower-value work needs doing at all, and sequences work so that early results reduce the biggest uncertainties first.",
            ar: "يتساءل عن جدوى إنجاز الأعمال قليلة القيمة أصلًا، ويرتّب العمل بحيث تقلّص النتائج المبكرة أكبر جوانب عدم اليقين أولًا.",
          },
        },
      },
      {
        key: "management.delegation",
        name: { en: "Delegation", ar: "التفويض" },
        description: {
          en: "Assigning work to the right person with the clarity and support they need to succeed.",
          ar: "إسناد العمل إلى الشخص المناسب مع ما يحتاج إليه من وضوح ودعم لينجح فيه.",
        },
        anchors: {
          1: {
            en: "Keeps work they should hand off, or assigns tasks without regard to the person's skills or workload.",
            ar: "يحتفظ بأعمال ينبغي أن يفوّضها، أو يُسند المهام دون مراعاة مهارات الشخص أو حجم عمله.",
          },
          2: {
            en: "Assigns tasks to suitable people but leaves expectations about the outcome, deadline, or authority unclear.",
            ar: "يُسند المهام إلى أشخاص مناسبين، لكنه يترك التوقعات بشأن النتيجة أو الموعد أو الصلاحيات غير واضحة.",
          },
          3: {
            en: "Matches tasks to people's skills and capacity, and states the expected outcome, deadline, and level of authority.",
            ar: "يوائم بين المهام ومهارات الأشخاص وطاقتهم، ويحدّد النتيجة المتوقعة والموعد ومستوى الصلاحيات.",
          },
          4: {
            en: "Sets check-in points proportionate to the risk and the person's experience, and avoids taking the task back at the first difficulty.",
            ar: "يحدّد نقاط متابعة تتناسب مع حجم المخاطر وخبرة الشخص، ويتجنّب استعادة المهمة عند أول صعوبة.",
          },
          5: {
            en: "Uses delegation to develop people and spread critical knowledge, choosing assignees so the team does not depend on any one person.",
            ar: "يستثمر التفويض في تطوير الأفراد ونشر المعرفة الحيوية، فيختار المكلَّفين بحيث لا يعتمد الفريق على شخص واحد.",
          },
        },
      },
      {
        key: "management.resource-allocation",
        name: { en: "Resource allocation", ar: "توزيع الموارد" },
        description: {
          en: "Directing limited time, budget, and people to the work where they create the most value.",
          ar: "توجيه الموارد المحدودة من وقت وميزانية وأفراد إلى الأعمال التي تحقق فيها أكبر قيمة.",
        },
        anchors: {
          1: {
            en: "Spreads resources evenly or by habit without reference to goals, or ignores resource limits altogether.",
            ar: "يوزّع الموارد بالتساوي أو وفق العادة دون الرجوع إلى الأهداف، أو يتجاهل محدودية الموارد كليًا.",
          },
          2: {
            en: "Recognises that resources are limited but allocates them to the most visible or urgent request rather than the most valuable.",
            ar: "يدرك محدودية الموارد، لكنه يخصّصها للطلب الأبرز أو الأكثر إلحاحًا لا للطلب الأعلى قيمة.",
          },
          3: {
            en: "Allocates resources according to stated priorities and explains what will be under-resourced as a result.",
            ar: "يخصّص الموارد وفق الأولويات المعلنة، ويوضّح ما سيعاني نقصًا في الموارد نتيجة لذلك.",
          },
          4: {
            en: "Compares the expected return of alternative allocations and keeps some capacity in reserve for likely surprises.",
            ar: "يقارن العائد المتوقع من بدائل التوزيع المختلفة، ويحتفظ بقدر من الطاقة احتياطًا للمفاجآت المحتملة.",
          },
          5: {
            en: "Identifies resources tied up in low-value work and redirects them, accounting for the cost of moving people between tasks.",
            ar: "يكشف موارد مستنزَفة في أعمال قليلة القيمة ويعيد توجيهها، مع مراعاة تكلفة نقل الأفراد بين المهام.",
          },
        },
      },
      {
        key: "management.performance-management",
        name: { en: "Performance management", ar: "إدارة الأداء" },
        description: {
          en: "Setting clear expectations, recognising good work, and addressing underperformance fairly and promptly.",
          ar: "وضع توقعات واضحة، والإشادة بالعمل الجيد، ومعالجة ضعف الأداء بإنصاف ودون تأخير.",
        },
        anchors: {
          1: {
            en: "Ignores a clear performance problem, or responds with blame or threats without understanding its cause.",
            ar: "يتجاهل مشكلة أداء واضحة، أو يتعامل معها باللوم أو التهديد دون فهم سببها.",
          },
          2: {
            en: "Raises the performance issue in general terms, without specific examples or agreed next steps.",
            ar: "يطرح مشكلة الأداء بعبارات عامة، دون أمثلة محددة أو خطوات تالية متفق عليها.",
          },
          3: {
            en: "Describes the gap with specific examples, explores the cause with the person, and agrees clear expectations and a follow-up date.",
            ar: "يصف الفجوة بأمثلة محددة، ويبحث سببها مع الشخص، ويتفق معه على توقعات واضحة وموعد للمتابعة.",
          },
          4: {
            en: "Distinguishes skill gaps from motivation or workload issues, tailors the response to the cause, and acknowledges what the person does well.",
            ar: "يميّز بين نقص المهارة ومشكلات الدافعية أو عبء العمل، ويكيّف معالجته بحسب السبب، ويشيد بما يُحسنه الشخص.",
          },
          5: {
            en: "Checks whether goals, processes, or team conditions contribute to the problem, and addresses those as well as the individual's part.",
            ar: "يتحقق مما إذا كانت الأهداف أو الإجراءات أو ظروف الفريق تسهم في المشكلة، ويعالجها إلى جانب الدور الفردي للشخص.",
          },
        },
      },
      {
        key: "management.follow-through",
        name: { en: "Follow-through", ar: "المتابعة حتى الإنجاز" },
        description: {
          en: "Tracking commitments to completion and acting early when they slip.",
          ar: "متابعة الالتزامات حتى اكتمالها، والتدخّل مبكرًا عند تعثّرها.",
        },
        anchors: {
          1: {
            en: "Makes commitments without saying how progress will be tracked, or loses sight of them once work starts.",
            ar: "يقطع التزامات دون أن يحدّد كيفية متابعة التقدّم فيها، أو يغفل عنها بمجرد بدء العمل.",
          },
          2: {
            en: "Checks progress but acts only after a deadline has already been missed.",
            ar: "يتابع التقدّم، لكنه لا يتحرك إلا بعد فوات الموعد.",
          },
          3: {
            en: "Sets milestones and owners, checks progress against them, and acts when work falls behind.",
            ar: "يحدّد مراحل رئيسية ومسؤولين عنها، ويتابع التقدّم وفقها، ويتدخّل حين يتأخر العمل.",
          },
          4: {
            en: "Spots early signs of slippage and adjusts scope, resources, or timelines before the deadline is at risk, informing those affected.",
            ar: "يلتقط المؤشرات المبكرة للتعثّر، ويعدّل النطاق أو الموارد أو الجداول الزمنية قبل أن يتعرّض الموعد للخطر، مع إبلاغ المتأثرين.",
          },
          5: {
            en: "Confirms after delivery that the intended result was actually achieved, and captures lessons that improve the next plan.",
            ar: "يتأكد بعد التسليم من تحقق النتيجة المقصودة فعلًا، ويستخلص دروسًا تحسّن الخطة التالية.",
          },
        },
      },
    ],
  },
  {
    key: "communication",
    order: 6,
    name: { en: "Communication", ar: "التواصل" },
    description: {
      en: "Conveying information and ideas so the intended audience understands them and can act on them.",
      ar: "نقل المعلومات والأفكار بما يمكّن الجمهور المستهدف من فهمها والتصرّف بناءً عليها.",
    },
    highLevel: {
      en: "Is concise and tailored to the audience, and calms tension instead of raising it.",
      ar: "يتواصل بإيجاز وبما يناسب الجمهور، ويخفّف التوتر بدلًا من تأجيجه.",
    },
    subSkills: [
      {
        key: "communication.clarity-structure",
        name: { en: "Clarity and structure", ar: "الوضوح والتنظيم" },
        description: {
          en: "Organising a message so the main point is easy to find and follow.",
          ar: "تنظيم الرسالة بحيث تسهل معرفة فكرتها الرئيسية ومتابعتها.",
        },
        anchors: {
          1: {
            en: "Leaves the main point unstated or buried in detail, and presents ideas in no clear order.",
            ar: "يُغفل الفكرة الرئيسية أو يطمرها بين التفاصيل، ويعرض الأفكار دون ترتيب واضح.",
          },
          2: {
            en: "States the main point but mixes it with unnecessary detail, so the listener or reader has to work to extract it.",
            ar: "يذكر الفكرة الرئيسية، لكنه يخلطها بتفاصيل غير ضرورية، فيضطر المتلقي إلى بذل جهد لاستخلاصها.",
          },
          3: {
            en: "Leads with the main point, groups supporting points logically, and uses plain words.",
            ar: "يبدأ بالفكرة الرئيسية، ويجمع النقاط الداعمة في ترتيب منطقي، ويستخدم كلمات واضحة.",
          },
          4: {
            en: "Removes everything the audience does not need and makes the requested action or decision explicit.",
            ar: "يحذف كل ما لا يحتاج إليه الجمهور، ويصرّح بالإجراء أو القرار المطلوب.",
          },
          5: {
            en: "Distils a complex issue into a few points that make the decision clear, and answers in advance the questions it will raise.",
            ar: "يختزل مسألة معقدة في نقاط قليلة تجعل القرار جليًا، ويجيب مسبقًا عن الأسئلة التي ستثيرها.",
          },
        },
      },
      {
        key: "communication.adapting-to-audience",
        name: { en: "Adapting to the audience", ar: "مواءمة الرسالة مع الجمهور" },
        description: {
          en: "Adjusting content, detail, and tone to what a particular audience needs.",
          ar: "تكييف المحتوى ومستوى التفصيل والأسلوب بحسب احتياجات جمهور بعينه.",
        },
        anchors: {
          1: {
            en: "Uses the same content and specialist jargon regardless of who the audience is.",
            ar: "يستخدم المحتوى والمصطلحات المتخصصة نفسها أيًّا كان الجمهور.",
          },
          2: {
            en: "Adjusts tone for the audience but keeps detail or jargon that does not suit them.",
            ar: "يكيّف الأسلوب بحسب الجمهور، لكنه يُبقي على تفاصيل أو مصطلحات متخصصة لا تناسبه.",
          },
          3: {
            en: "Selects the detail, terms, and emphasis that fit the audience's role and knowledge, explaining specialist terms where needed.",
            ar: "يختار مستوى التفصيل والمصطلحات ومواطن التركيز بما يلائم دور الجمهور ومعرفته، ويشرح المصطلحات المتخصصة عند الحاجة.",
          },
          4: {
            en: "Frames the message around what the audience cares about, such as cost for finance teams or impact on users for product teams.",
            ar: "يصوغ الرسالة حول ما يهمّ الجمهور، كالتكلفة لفرق المالية أو الأثر في المستخدمين لفرق المنتج.",
          },
          5: {
            en: "Adapts one message for several audiences at once, anticipating how each will interpret it and preventing misunderstanding.",
            ar: "يكيّف رسالة واحدة لعدة فئات من الجمهور في آن واحد، ويتوقّع كيف ستفهمها كل فئة، ويحول دون سوء الفهم.",
          },
        },
      },
      {
        key: "communication.written-communication",
        name: { en: "Written communication", ar: "التواصل الكتابي" },
        description: {
          en: "Producing written messages that are accurate, well organised, and fit for their purpose.",
          ar: "كتابة رسائل دقيقة ومنظّمة وملائمة للغرض منها.",
        },
        anchors: {
          1: {
            en: "Writes a message that omits key facts, mixes unrelated topics, or leaves the reader unsure what to do.",
            ar: "يكتب رسالة تُغفل وقائع أساسية، أو تخلط موضوعات غير مترابطة، أو تترك القارئ حائرًا فيما عليه فعله.",
          },
          2: {
            en: "Includes the necessary facts but in an order that forces the reader to reread, or leaves the request implicit.",
            ar: "يورد الوقائع اللازمة، لكن بترتيب يضطر القارئ إلى إعادة القراءة، أو يترك الطلب ضمنيًا.",
          },
          3: {
            en: "Writes a message with a clear purpose, the needed facts, and an explicit request or next step, in a format suited to the channel.",
            ar: "يكتب رسالة واضحة الغرض، تتضمّن الوقائع اللازمة وطلبًا أو خطوة تالية صريحة، بصيغة تلائم وسيلة التواصل.",
          },
          4: {
            en: "Structures the message so a busy reader gets the essentials from the opening lines, and states deadlines and owners precisely.",
            ar: "ينظّم الرسالة بحيث يدرك القارئ المنشغل جوهرها من الأسطر الأولى، ويحدّد المواعيد والمسؤولين بدقة.",
          },
          5: {
            en: "Anticipates how the message could be misread or forwarded out of context, and words it so it stays accurate and appropriate in either case.",
            ar: "يتوقّع كيف قد يُساء فهم الرسالة أو تُعاد إحالتها خارج سياقها، فيصوغها بحيث تظل دقيقة وملائمة في الحالتين.",
          },
        },
      },
      {
        key: "communication.persuasion",
        name: { en: "Persuasion", ar: "الإقناع" },
        description: {
          en: "Building a case that moves others to agree or act, using reasons and evidence.",
          ar: "بناء حجة تدفع الآخرين إلى الموافقة أو التصرّف، بالاستناد إلى الأسباب والأدلة.",
        },
        anchors: {
          1: {
            en: "Asserts a position without reasons, or relies on pressure or repetition to win agreement.",
            ar: "يطرح موقفه دون أسباب، أو يعتمد على الضغط أو التكرار لانتزاع الموافقة.",
          },
          2: {
            en: "Gives reasons for the position but not the ones most relevant to the audience, and ignores obvious objections.",
            ar: "يقدّم أسبابًا لموقفه، لكنها ليست الأوثق صلة بالجمهور، ويتجاهل اعتراضات واضحة.",
          },
          3: {
            en: "Supports the position with relevant reasons and evidence and addresses the most likely objection.",
            ar: "يدعم موقفه بأسباب وأدلة ذات صلة، ويعالج الاعتراض الأكثر ترجيحًا.",
          },
          4: {
            en: "Builds the case around the audience's own goals, acknowledges the weaknesses of the proposal honestly, and proposes a specific next step.",
            ar: "يبني حجته حول أهداف الجمهور نفسه، ويعترف بأمانة بمواطن ضعف المقترح، ويقترح خطوة تالية محددة.",
          },
          5: {
            en: "Identifies the real reason for resistance, which may differ from the stated objection, and addresses it directly, adjusting the proposal if needed.",
            ar: "يكشف السبب الحقيقي للممانعة، وقد يختلف عن الاعتراض المعلن، فيعالجه مباشرة، ويعدّل المقترح إن لزم الأمر.",
          },
        },
      },
      {
        key: "communication.listening",
        name: { en: "Listening", ar: "الإصغاء" },
        description: {
          en: "Understanding what others say and mean, including concerns they do not state directly.",
          ar: "فهم ما يقوله الآخرون وما يقصدونه، بما في ذلك المخاوف التي لا يصرّحون بها.",
        },
        anchors: {
          1: {
            en: "Responds to a different point than the one the other person raised, or ignores information they provided.",
            ar: "يردّ على نقطة غير التي أثارها الطرف الآخر، أو يتجاهل معلومات قدّمها.",
          },
          2: {
            en: "Responds to the literal content of what was said but misses the concern or need behind it.",
            ar: "يتجاوب مع المضمون الحرفي للكلام، لكنه يغفل عن الهمّ أو الحاجة الكامنة وراءه.",
          },
          3: {
            en: "Accurately restates the other person's key points, asks clarifying questions, and responds to what they actually raised.",
            ar: "يعيد صياغة النقاط الرئيسية للطرف الآخر بدقة، ويطرح أسئلة استيضاحية، ويتجاوب مع ما أثاره فعلًا.",
          },
          4: {
            en: "Identifies concerns that are implied but not stated, checks them with the person, and reflects them in the response.",
            ar: "يلتقط المخاوف الضمنية غير المعلنة، ويتحقق منها مع الشخص، ويأخذها في الحسبان في ردّه.",
          },
          5: {
            en: "Notices what is missing from what people say, such as an avoided topic or a gap between words and actions, and explores it tactfully.",
            ar: "يلاحظ ما يغيب عن كلام الآخرين، كموضوع يتجنّبونه أو فجوة بين الأقوال والأفعال، ويستكشفه بلباقة.",
          },
        },
      },
      {
        key: "communication.difficult-conversations",
        name: { en: "Difficult conversations", ar: "المحادثات الصعبة" },
        description: {
          en: "Handling emotionally charged or high-stakes conversations so they stay productive.",
          ar: "إدارة المحادثات المشحونة عاطفيًا أو عالية الأهمية بحيث تظل مثمرة.",
        },
        anchors: {
          1: {
            en: "Avoids the conversation, delivers the message abruptly, or responds to emotion with defensiveness or blame.",
            ar: "يتجنّب المحادثة، أو يبلّغ الرسالة بجفاء ودون تمهيد، أو يقابل الانفعال بالدفاع عن النفس أو اللوم.",
          },
          2: {
            en: "Delivers the message but softens it so much that the key point is lost, or does not acknowledge the other person's reaction.",
            ar: "يبلّغ الرسالة، لكنه يلطّفها إلى حدّ تضيع معه الفكرة الأساسية، أو لا يعترف بردّ فعل الطرف الآخر.",
          },
          3: {
            en: "States the difficult message clearly and respectfully, acknowledges the other person's feelings, and moves toward next steps.",
            ar: "يبلّغ الرسالة الصعبة بوضوح واحترام، ويعترف بمشاعر الطرف الآخر، ويتّجه نحو الخطوات التالية.",
          },
          4: {
            en: "Calms rising tension by naming it calmly and refocusing on shared goals, while keeping the core message intact.",
            ar: "يخفّف التوتر المتصاعد بتسميته بهدوء وإعادة التركيز على الأهداف المشتركة، مع الحفاظ على جوهر الرسالة.",
          },
          5: {
            en: "Prepares for the likely reactions, chooses timing and setting deliberately, and keeps the working relationship intact or stronger after the conversation.",
            ar: "يستعدّ لردود الفعل المرجّحة، ويختار التوقيت والمكان عن قصد، ويحافظ على علاقة العمل سليمة بعد المحادثة، بل أمتن أحيانًا.",
          },
        },
      },
    ],
  },
  {
    key: "product-thinking",
    order: 7,
    name: { en: "Creativity and product thinking", ar: "الإبداع والتفكير في المنتج" },
    description: {
      en: "Framing problems around real user needs, and generating and shaping solutions that address them.",
      ar: "صياغة المشكلات انطلاقًا من الاحتياجات الفعلية للمستخدمين، وتوليد حلول تعالجها وبلورتها.",
    },
    highLevel: {
      en: "Reframes the problem and designs for real users, not for technical elegance.",
      ar: "يعيد صياغة المشكلة، ويصمّم للمستخدمين الحقيقيين لا لأناقة الحل التقني.",
    },
    subSkills: [
      {
        key: "product-thinking.problem-framing",
        name: { en: "Problem framing", ar: "صياغة المشكلة" },
        description: {
          en: "Defining the problem worth solving before choosing a solution.",
          ar: "تحديد المشكلة الجديرة بالحل قبل اختيار الحل.",
        },
        anchors: {
          1: {
            en: "Starts from a solution or feature request and never states the problem it is meant to solve.",
            ar: "ينطلق من حل أو من طلب لميزة ما، ولا يحدّد المشكلة التي يُفترض أن يعالجها.",
          },
          2: {
            en: "States a problem but too broadly or vaguely to guide a solution.",
            ar: "يحدّد مشكلة، لكن بصيغة واسعة أو مبهمة لا تصلح لتوجيه الحل.",
          },
          3: {
            en: "Defines the problem specifically, including who has it, when it occurs, and how success would be recognised.",
            ar: "يحدّد المشكلة تحديدًا دقيقًا، بما في ذلك من يواجهها ومتى تقع وكيف يُعرف النجاح في حلّها.",
          },
          4: {
            en: "Questions whether the stated problem is the real one and narrows it to the part that matters most.",
            ar: "يتساءل عمّا إذا كانت المشكلة المعلنة هي المشكلة الحقيقية، ويحصرها في الجزء الأهم منها.",
          },
          5: {
            en: "Reframes the problem in a way that opens better options, for example shifting from building a feature to removing the need for it.",
            ar: "يعيد صياغة المشكلة بطريقة تفتح بدائل أفضل، كالانتقال من بناء ميزة جديدة إلى إزالة الحاجة إليها.",
          },
        },
      },
      {
        key: "product-thinking.user-empathy",
        name: { en: "User empathy", ar: "فهم المستخدم" },
        description: {
          en: "Understanding users' goals, context, and frustrations from their point of view.",
          ar: "فهم أهداف المستخدمين وسياقهم ومصادر إحباطهم من منظورهم.",
        },
        anchors: {
          1: {
            en: "Describes users only in terms of what the team wants to build, or assumes users think like the team.",
            ar: "لا يصف المستخدمين إلا من زاوية ما يريد الفريق بناءه، أو يفترض أنهم يفكرون كما يفكر الفريق.",
          },
          2: {
            en: "Mentions users' needs in general terms without considering their specific context or constraints.",
            ar: "يذكر احتياجات المستخدمين بعبارات عامة، دون مراعاة سياقهم أو القيود التي يواجهونها.",
          },
          3: {
            en: "Describes the user's goal, situation, and main frustration concretely and uses them to evaluate the solution.",
            ar: "يصف هدف المستخدم ووضعه ومصدر إحباطه الرئيسي وصفًا ملموسًا، ويعتمد عليها في تقييم الحل.",
          },
          4: {
            en: "Distinguishes user groups whose needs conflict and proposes how to check assumptions with real users.",
            ar: "يميّز بين فئات من المستخدمين تتعارض احتياجاتها، ويقترح طريقة للتحقق من الافتراضات مع مستخدمين حقيقيين.",
          },
          5: {
            en: "Identifies a need users have not expressed by reasoning from their behaviour and context, and explains how to validate it.",
            ar: "يكشف حاجة لم يعبّر عنها المستخدمون بالاستدلال من سلوكهم وسياقهم، ويوضّح كيفية التحقق منها.",
          },
        },
      },
      {
        key: "product-thinking.idea-generation",
        name: { en: "Idea generation", ar: "توليد الأفكار" },
        description: {
          en: "Producing a range of distinct options before settling on one.",
          ar: "طرح مجموعة من البدائل المتمايزة قبل الاستقرار على أحدها.",
        },
        anchors: {
          1: {
            en: "Offers a single idea, or only the most obvious one, without considering alternatives.",
            ar: "يطرح فكرة واحدة، أو الفكرة الأكثر بداهة فقط، دون النظر في بدائل.",
          },
          2: {
            en: "Offers several ideas, but they are variations of the same approach.",
            ar: "يطرح عدة أفكار، لكنها صيغ متقاربة للنهج نفسه.",
          },
          3: {
            en: "Proposes several genuinely different options and gives a reason for preferring one.",
            ar: "يقترح عدة بدائل مختلفة اختلافًا حقيقيًا، ويذكر سبب تفضيله أحدها.",
          },
          4: {
            en: "Generates options by deliberately varying key assumptions, such as cost, user, or channel, and combines strong elements from several.",
            ar: "يولّد البدائل بتغيير افتراضات رئيسية عن قصد، كالتكلفة أو المستخدم أو قناة الوصول، ويجمع العناصر القوية من عدة بدائل.",
          },
          5: {
            en: "Proposes an original, practical option others would not reach, often by borrowing an approach from an unrelated field, and shows how to test it cheaply.",
            ar: "يقترح بديلًا مبتكرًا وعمليًا لا يصل إليه غيره، كثيرًا ما يستعيره من مجال بعيد، ويبيّن كيفية اختباره بتكلفة زهيدة.",
          },
        },
      },
      {
        key: "product-thinking.solution-design",
        name: { en: "Solution design", ar: "تصميم الحلول" },
        description: {
          en: "Turning an idea into a workable solution that fits users, constraints, and goals.",
          ar: "تحويل الفكرة إلى حل قابل للتطبيق يلائم المستخدمين والقيود والأهداف.",
        },
        anchors: {
          1: {
            en: "Describes a solution that ignores stated constraints or that users would struggle to use.",
            ar: "يصف حلًّا يتجاهل القيود المعلنة أو يصعب على المستخدمين استخدامه.",
          },
          2: {
            en: "Describes a workable solution but focuses on technical aspects rather than how users will experience it.",
            ar: "يصف حلًّا قابلًا للتطبيق، لكنه يركّز على الجوانب التقنية لا على تجربة المستخدمين معه.",
          },
          3: {
            en: "Designs a solution that meets the core user need within the stated constraints and describes how users will use it.",
            ar: "يصمّم حلًّا يلبّي الحاجة الأساسية للمستخدم ضمن القيود المعلنة، ويصف كيف سيستخدمه المستخدمون.",
          },
          4: {
            en: "Simplifies the solution to its essential parts, considers edge cases and failure points, and proposes a small first version to test.",
            ar: "يبسّط الحل إلى عناصره الأساسية، ويراعي الحالات الاستثنائية ومواضع الإخفاق، ويقترح نسخة أولى صغيرة للاختبار.",
          },
          5: {
            en: "Chooses a simpler solution over a technically elegant one when it serves users better, and designs it to learn from real use.",
            ar: "يفضّل الحل الأبسط على الحل الأنيق تقنيًا حين يخدم المستخدمين على نحو أفضل، ويصمّمه بحيث يتيح التعلّم من الاستخدام الفعلي.",
          },
        },
      },
      {
        key: "product-thinking.feature-prioritisation",
        name: { en: "Feature prioritisation", ar: "ترتيب أولويات الميزات" },
        description: {
          en: "Deciding which features to build first based on value to users and the business relative to effort.",
          ar: "تحديد الميزات التي تُبنى أولًا بحسب قيمتها للمستخدمين وللمؤسسة مقارنة بالجهد المطلوب.",
        },
        anchors: {
          1: {
            en: "Prioritises by personal preference, the loudest request, or technical interest, without reference to value.",
            ar: "يرتّب الأولويات وفق تفضيله الشخصي أو الطلب الأعلى صوتًا أو الاهتمام التقني، دون الرجوع إلى القيمة.",
          },
          2: {
            en: "Considers either user value or effort, but not both, when ordering features.",
            ar: "يراعي قيمة الميزة للمستخدم أو الجهد المطلوب لها، لا كليهما، عند ترتيب الميزات.",
          },
          3: {
            en: "Ranks features by value to users and the business against effort, and explains what is deferred and why.",
            ar: "يرتّب الميزات بحسب قيمتها للمستخدمين وللمؤسسة مقارنة بالجهد، ويوضّح ما يُؤجَّل وسبب تأجيله.",
          },
          4: {
            en: "Uses evidence of user impact rather than opinion to rank features, and identifies dependencies that change the order.",
            ar: "يعتمد على أدلة الأثر في المستخدمين لا على الآراء في ترتيب الميزات، ويحدّد أوجه الترابط التي تغيّر هذا الترتيب.",
          },
          5: {
            en: "Weighs how each added feature affects existing users and long-term complexity, and cuts scope to what proves the core value fastest.",
            ar: "يزن أثر كل ميزة مضافة في المستخدمين الحاليين وفي تعقيد المنتج على المدى البعيد، ويقلّص النطاق إلى ما يُثبت القيمة الأساسية بأسرع وقت.",
          },
        },
      },
    ],
  },
  {
    key: "collaboration",
    order: 8,
    name: { en: "Collaboration and emotional intelligence", ar: "التعاون والذكاء العاطفي" },
    description: {
      en: "Understanding oneself and others, and working with people effectively toward shared results.",
      ar: "فهم الذات والآخرين، والعمل معهم بفاعلية لتحقيق نتائج مشتركة.",
    },
    highLevel: {
      en: "Reads people accurately and adjusts their approach.",
      ar: "يقرأ الآخرين بدقة، ويكيّف أسلوبه بناءً على ذلك.",
    },
    subSkills: [
      {
        key: "collaboration.self-awareness",
        name: { en: "Self-awareness", ar: "الوعي الذاتي" },
        description: {
          en: "Recognising one's own reactions, biases, and impact on others.",
          ar: "إدراك الفرد لانفعالاته وتحيّزاته وأثره في الآخرين.",
        },
        anchors: {
          1: {
            en: "Describes their own role in the situation as entirely positive and attributes all difficulties to others.",
            ar: "يصف دوره في الموقف بأنه إيجابي تمامًا، وينسب الصعوبات كلها إلى الآخرين.",
          },
          2: {
            en: "Acknowledges a general weakness when prompted but does not link it to the situation at hand.",
            ar: "يقرّ بنقطة ضعف عامة حين يُسأل عنها، لكنه لا يربطها بالموقف الحالي.",
          },
          3: {
            en: "Names how their own reactions or behaviour may be contributing to the situation and what they would do differently.",
            ar: "يحدّد كيف قد تسهم انفعالاته أو تصرفاته في الموقف، وما الذي سيفعله على نحو مختلف.",
          },
          4: {
            en: "Identifies a specific bias or habit likely to affect their judgment here, and describes a concrete way to counter it.",
            ar: "يحدّد تحيّزًا أو عادة بعينها يُرجَّح أن تؤثر في حكمه هنا، ويصف طريقة عملية للحدّ من أثرها.",
          },
          5: {
            en: "Anticipates how others are likely to perceive their actions in this context, and adjusts before a gap between intent and impact causes problems.",
            ar: "يتوقّع كيف سيُنظر إلى تصرفاته في هذا السياق، ويعدّل سلوكه قبل أن تتسبّب الفجوة بين نيّته وأثر تصرفاته في مشكلات.",
          },
        },
      },
      {
        key: "collaboration.empathy",
        name: { en: "Empathy", ar: "التعاطف" },
        description: {
          en: "Understanding others' feelings and perspectives and responding to them appropriately.",
          ar: "فهم مشاعر الآخرين ووجهات نظرهم، والتجاوب معها على نحو ملائم.",
        },
        anchors: {
          1: {
            en: "Ignores or dismisses the feelings of people in the scenario, focusing only on the task.",
            ar: "يتجاهل مشاعر الأشخاص في الموقف أو يستخفّ بها، ويركّز على المهمة وحدها.",
          },
          2: {
            en: "Acknowledges feelings in generic terms without showing understanding of the person's specific situation.",
            ar: "يعترف بالمشاعر بعبارات عامة، دون أن يُظهر فهمًا لوضع الشخص تحديدًا.",
          },
          3: {
            en: "Identifies how the people involved are likely feeling and why, and responds in a way that addresses it.",
            ar: "يحدّد ما يُرجَّح أن يشعر به الأشخاص المعنيون وسبب ذلك، ويتجاوب بطريقة تراعيه.",
          },
          4: {
            en: "Recognises perspectives that differ from their own and explains the other person's position in terms that person would accept.",
            ar: "يدرك وجهات النظر المختلفة عن وجهة نظره، ويشرح موقف الطرف الآخر بعبارات يقبلها ذلك الطرف.",
          },
          5: {
            en: "Balances empathy with the needs of the task, addressing feelings without avoiding necessary decisions, and notices quieter people others overlook.",
            ar: "يوازن بين التعاطف ومتطلبات المهمة، فيراعي المشاعر دون التهرّب من القرارات اللازمة، وينتبه إلى الأشخاص الأقل حضورًا ممن يغفل عنهم الآخرون.",
          },
        },
      },
      {
        key: "collaboration.stakeholder-management",
        name: { en: "Stakeholder management", ar: "إدارة أصحاب المصلحة" },
        description: {
          en: "Identifying the people affected by the work and keeping their interests and expectations in view.",
          ar: "تحديد الأشخاص المتأثرين بالعمل، ومراعاة مصالحهم وتوقعاتهم باستمرار.",
        },
        anchors: {
          1: {
            en: "Considers only the immediate requester and overlooks other people the work clearly affects.",
            ar: "لا يراعي إلا صاحب الطلب المباشر، ويغفل عن أشخاص آخرين يتأثرون بالعمل بوضوح.",
          },
          2: {
            en: "Names the main stakeholders but treats them as having the same interests and needs.",
            ar: "يذكر أصحاب المصلحة الرئيسيين، لكنه يعاملهم كأن مصالحهم واحتياجاتهم متطابقة.",
          },
          3: {
            en: "Identifies the key stakeholders, what each cares about, and how and when to keep each informed or involved.",
            ar: "يحدّد أصحاب المصلحة الرئيسيين وما يهمّ كلًّا منهم، وكيفية إطلاعهم أو إشراكهم وتوقيت ذلك.",
          },
          4: {
            en: "Anticipates where stakeholder interests conflict and manages expectations early rather than surprising anyone later.",
            ar: "يتوقّع مواضع تعارض مصالح أصحاب المصلحة، ويدير توقعاتهم مبكرًا بدلًا من مفاجأتهم لاحقًا.",
          },
          5: {
            en: "Identifies less obvious stakeholders who could block or support the work, and builds relationships with them before they are needed.",
            ar: "يكشف أصحاب مصلحة أقل ظهورًا قد يعرقلون العمل أو يدعمونه، ويبني علاقات معهم قبل الحاجة إليهم.",
          },
        },
      },
      {
        key: "collaboration.taking-feedback",
        name: { en: "Taking feedback", ar: "تقبّل الملاحظات" },
        description: {
          en: "Receiving criticism or input openly and using it to improve.",
          ar: "تلقّي النقد أو الآراء بانفتاح، والاستفادة منها في التحسين.",
        },
        anchors: {
          1: {
            en: "Rejects or explains away critical feedback, or responds to it defensively.",
            ar: "يرفض الملاحظات الناقدة أو يبرّر ما ورد فيها، أو يتلقّاها بموقف دفاعي.",
          },
          2: {
            en: "Accepts feedback politely but does not say what, if anything, they will change.",
            ar: "يتقبّل الملاحظات بلباقة، لكنه لا يحدّد ما سيغيّره بناءً عليها، إن كان سيغيّر شيئًا.",
          },
          3: {
            en: "Acknowledges the feedback, asks questions to understand it, and states a specific change they will make.",
            ar: "يقرّ بالملاحظات، ويطرح أسئلة لفهمها، ويحدّد تغييرًا بعينه سيُجريه.",
          },
          4: {
            en: "Separates valid points from those they disagree with, explains their reasoning without defensiveness, and acts on the valid points.",
            ar: "يميّز بين النقاط الصائبة وتلك التي يختلف معها، ويشرح منطقه دون موقف دفاعي، ويعمل بالنقاط الصائبة.",
          },
          5: {
            en: "Seeks out feedback others might hesitate to give, finds the useful point in poorly delivered criticism, and says how they will check the change worked.",
            ar: "يسعى إلى الملاحظات التي قد يتحرّج الآخرون من تقديمها، ويستخلص الفائدة من النقد حتى لو قُدّم بأسلوب غير ملائم، ويبيّن كيف سيتحقق من نجاح التغيير.",
          },
        },
      },
      {
        key: "collaboration.team-orientation",
        name: { en: "Team orientation", ar: "العمل بروح الفريق" },
        description: {
          en: "Putting shared goals ahead of individual credit and supporting colleagues' success.",
          ar: "تقديم الأهداف المشتركة على الإنجاز الفردي، ودعم نجاح الزملاء.",
        },
        anchors: {
          1: {
            en: "Focuses on their own tasks or credit even where this clearly harms the team's result.",
            ar: "يركّز على مهامه أو على نسبة الفضل إليه، حتى حين يضرّ ذلك بنتائج الفريق بوضوح.",
          },
          2: {
            en: "Cooperates when asked but does not offer help or share information unprompted.",
            ar: "يتعاون حين يُطلب منه، لكنه لا يبادر إلى تقديم المساعدة أو مشاركة المعلومات.",
          },
          3: {
            en: "Offers help, shares relevant information, and coordinates their work with others toward the team's goal.",
            ar: "يبادر إلى تقديم المساعدة، ويشارك المعلومات ذات الصلة، وينسّق عمله مع الآخرين لتحقيق هدف الفريق.",
          },
          4: {
            en: "Adjusts their own priorities when the team's goal requires it, and gives visible credit for others' contributions.",
            ar: "يعدّل أولوياته حين يقتضي هدف الفريق ذلك، ويُبرز إسهامات الآخرين وينسب إليهم الفضل فيها.",
          },
          5: {
            en: "Notices friction or gaps in how the team works together and proposes changes that improve collaboration for everyone.",
            ar: "يلاحظ مواضع الاحتكاك أو الثغرات في طريقة عمل الفريق معًا، ويقترح تغييرات تحسّن التعاون للجميع.",
          },
        },
      },
    ],
  },
  {
    key: "adaptability",
    order: 9,
    name: { en: "Adaptability and learning", ar: "التكيّف والتعلّم" },
    description: {
      en: "Adjusting effectively to new information, pressure, and unfamiliar situations, and learning quickly from experience.",
      ar: "التكيّف بفاعلية مع المعلومات الجديدة والضغوط والمواقف غير المألوفة، والتعلّم السريع من التجربة.",
    },
    highLevel: {
      en: "Gets better as the session goes on.",
      ar: "يتحسّن أداؤه كلما تقدّمت جلسة التقييم.",
    },
    subSkills: [
      {
        key: "adaptability.learning-speed",
        name: { en: "Learning speed", ar: "سرعة التعلّم" },
        description: {
          en: "Applying lessons from earlier scenarios or feedback to later ones within the same session.",
          ar: "تطبيق ما استُفيد من المواقف السابقة أو الملاحظات على المواقف اللاحقة في الجلسة نفسها.",
        },
        anchors: {
          1: {
            en: "Repeats the same approach or error in later scenarios after it proved ineffective or was pointed out.",
            ar: "يكرّر النهج أو الخطأ نفسه في المواقف اللاحقة بعد أن ثبت عدم فاعليته أو نُبّه إليه.",
          },
          2: {
            en: "Corrects a specific error once it is pointed out but does not carry the lesson to similar situations.",
            ar: "يصحّح خطأً بعينه بعد التنبيه إليه، لكنه لا ينقل الدرس إلى مواقف مشابهة.",
          },
          3: {
            en: "Applies lessons from earlier scenarios or feedback to later, similar ones in the session.",
            ar: "يطبّق الدروس المستفادة من المواقف السابقة أو الملاحظات على المواقف اللاحقة المشابهة في الجلسة.",
          },
          4: {
            en: "Generalises a lesson to scenarios that look different on the surface, showing steady improvement across the session.",
            ar: "يعمّم الدرس على مواقف تبدو مختلفة في ظاهرها، ويُظهر تحسّنًا مطّردًا على امتداد الجلسة.",
          },
          5: {
            en: "Extracts the underlying principle from early scenarios, applies it in new ways later, and explicitly refines their own approach as the session goes on.",
            ar: "يستخلص المبدأ العام من المواقف الأولى، ويطبّقه بطرق جديدة لاحقًا، ويصرّح بتنقيح نهجه كلما تقدّمت الجلسة.",
          },
        },
      },
      {
        key: "adaptability.handling-new-information",
        name: { en: "Handling new information", ar: "التعامل مع المعلومات الجديدة" },
        description: {
          en: "Revising views and plans appropriately when new facts emerge.",
          ar: "مراجعة الآراء والخطط على النحو الملائم عند ظهور معطيات جديدة.",
        },
        anchors: {
          1: {
            en: "Keeps the original plan or view despite new information that clearly contradicts it, or ignores the new information.",
            ar: "يتمسّك بخطته أو رأيه الأصلي رغم معلومات جديدة تناقضه بوضوح، أو يتجاهل تلك المعلومات.",
          },
          2: {
            en: "Acknowledges new information but makes only a token change, or abandons the whole plan when only part of it is affected.",
            ar: "يقرّ بالمعلومات الجديدة، لكنه يُجري تعديلًا شكليًا فقط، أو يتخلّى عن الخطة كلها مع أن التأثر يقتصر على جزء منها.",
          },
          3: {
            en: "Assesses what the new information changes and updates the parts of the plan or view it affects.",
            ar: "يقيّم ما تغيّره المعلومات الجديدة، ويحدّث أجزاء الخطة أو الرأي المتأثرة بها.",
          },
          4: {
            en: "Checks the reliability of the new information before acting on it, and explains clearly what changed in their thinking and why.",
            ar: "يتحقق من موثوقية المعلومات الجديدة قبل التصرّف بناءً عليها، ويوضّح ما الذي تغيّر في تفكيره ولماذا.",
          },
          5: {
            en: "Updates in proportion to the strength of the new evidence, and identifies what else the new information implies beyond the immediate question.",
            ar: "يعدّل موقفه بقدر قوة الأدلة الجديدة، ويحدّد ما تستتبعه المعلومات الجديدة من آثار تتجاوز المسألة المطروحة.",
          },
        },
      },
      {
        key: "adaptability.composure-under-pressure",
        name: { en: "Composure under pressure", ar: "الاتزان تحت الضغط" },
        description: {
          en: "Maintaining sound thinking and conduct under time pressure, setbacks, or tension.",
          ar: "الحفاظ على سلامة التفكير والتصرّف في ظل ضيق الوقت أو الانتكاسات أو التوتر.",
        },
        anchors: {
          1: {
            en: "Under the pressure in the scenario, abandons the agreed process, reacts impulsively, or proposes no action at all.",
            ar: "يتخلّى تحت ضغط الموقف عن الإجراءات المتفق عليها، أو يتصرّف باندفاع، أو لا يقترح أي إجراء.",
          },
          2: {
            en: "Proposes action under pressure but loses track of important details or priorities.",
            ar: "يقترح إجراءً تحت الضغط، لكنه يغفل عن تفاصيل أو أولويات مهمة.",
          },
          3: {
            en: "Keeps a clear order of priorities under pressure and addresses the most urgent issue first without neglecting key risks.",
            ar: "يحافظ تحت الضغط على تسلسل واضح للأولويات، ويعالج المسألة الأكثر إلحاحًا أولًا دون إهمال المخاطر الرئيسية.",
          },
          4: {
            en: "Separates what must be done immediately from what can wait, communicates calmly with others, and keeps quality checks in place.",
            ar: "يفصل بين ما يجب فعله فورًا وما يمكن تأجيله، ويتواصل مع الآخرين بهدوء، ويُبقي على ضوابط الجودة.",
          },
          5: {
            en: "Steadies others during the pressure, for example by setting short, clear next steps, and plans recovery once the immediate issue is contained.",
            ar: "يُسهم في تهدئة الآخرين في ظرف الضغط، كأن يحدّد خطوات تالية قصيرة وواضحة، ويخطّط للتعافي بعد احتواء المسألة العاجلة.",
          },
        },
      },
      {
        key: "adaptability.comfort-with-ambiguity",
        name: { en: "Comfort with ambiguity", ar: "التعامل مع الغموض" },
        description: {
          en: "Making progress when goals, roles, or information are unclear.",
          ar: "إحراز التقدّم حين تكون الأهداف أو الأدوار أو المعلومات غير واضحة.",
        },
        anchors: {
          1: {
            en: "Stops at the lack of clarity and asks for full instructions before taking any step, or ignores the ambiguity entirely.",
            ar: "يتوقف عند غياب الوضوح، فيطلب تعليمات كاملة قبل اتخاذ أي خطوة، أو يتجاهل الغموض كليًا.",
          },
          2: {
            en: "Proceeds despite the ambiguity but on an unstated interpretation that may not match what is needed.",
            ar: "يمضي رغم الغموض، لكن وفق تفسير غير معلن قد لا يطابق المطلوب.",
          },
          3: {
            en: "States a reasonable interpretation of the unclear situation, proceeds on it, and identifies what needs clarifying.",
            ar: "يصرّح بتفسير معقول للموقف غير الواضح، ويمضي وفقه، ويحدّد ما يلزم استيضاحه.",
          },
          4: {
            en: "Takes small, reversible steps that produce useful information, while clarifying the most important unknowns with the right people.",
            ar: "يتخذ خطوات صغيرة قابلة للتراجع تُنتج معلومات مفيدة، ويستوضح في الوقت نفسه أهم المجهولات من الأشخاص المناسبين.",
          },
          5: {
            en: "Creates structure for others in the ambiguous situation, such as working assumptions and decision points, and treats the ambiguity as room for new options.",
            ar: "يضع إطارًا يهتدي به الآخرون في الموقف الغامض، كالافتراضات العملية ونقاط القرار، ويرى في الغموض مجالًا لبدائل جديدة.",
          },
        },
      },
    ],
  },
];

export const WORK_STYLES: WorkStyleDef[] = [
  {
    key: "risk-appetite",
    name: { en: "Risk appetite", ar: "الميل إلى المخاطرة" },
    description: {
      en: "How readily someone accepts uncertainty in pursuit of a possible gain.",
      ar: "مدى استعداد الفرد لقبول عدم اليقين سعيًا إلى مكسب محتمل.",
    },
    poles: {
      a: { en: "Cautious", ar: "حذِر" },
      b: { en: "Bold", ar: "جريء" },
    },
  },
  {
    key: "pace",
    name: { en: "Pace", ar: "إيقاع العمل" },
    description: {
      en: "Whether someone prefers to take time to consider before acting or to move quickly and adjust along the way.",
      ar: "ما إذا كان الفرد يفضّل التمهّل والتدبّر قبل التصرّف، أم التحرّك بسرعة والتعديل في أثناء العمل.",
    },
    poles: {
      a: { en: "Deliberate", ar: "متمهّل" },
      b: { en: "Fast", ar: "سريع" },
    },
  },
  {
    key: "focus",
    name: { en: "Focus", ar: "نطاق التركيز" },
    description: {
      en: "Whether someone naturally attends first to specifics or to the overall picture.",
      ar: "ما إذا كان الفرد يلتفت تلقائيًا إلى التفاصيل أولًا أم إلى الصورة الكلية.",
    },
    poles: {
      a: { en: "Detail-focused", ar: "مركّز على التفاصيل" },
      b: { en: "Big-picture", ar: "مركّز على الصورة الكلية" },
    },
  },
  {
    key: "working-mode",
    name: { en: "Working mode", ar: "نمط العمل" },
    description: {
      en: "Whether someone prefers to work through problems alone or together with others.",
      ar: "ما إذا كان الفرد يفضّل معالجة المشكلات بمفرده أم بالتعاون مع الآخرين.",
    },
    poles: {
      a: { en: "Independent", ar: "مستقل" },
      b: { en: "Collaborative", ar: "تشاركي" },
    },
  },
];
