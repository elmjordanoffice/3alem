// Role families and their technical sub-skill templates.
//
// Used when no language model is available to analyse a job description, and
// as a guard and seed when one is: the JD Analyst can start from the closest
// family's technical sub-skills and domain weights instead of inventing them.

import type { Level, LevelAnchors, LocalizedText } from "./types";

export interface RoleTechnicalSkillDef {
  /** Format: "technical.<family-short>.<slug>". Unique across all families. */
  key: string;
  name: LocalizedText;
  /** One sentence: what this sub-skill is. */
  description: LocalizedText;
  /** Observable behaviour at each level, written so a scorer can match a response to it. */
  anchors: LevelAnchors;
}

export interface RoleFamilyDef {
  /** Stable, kebab-case key, e.g. "software-engineering". */
  key: string;
  name: LocalizedText;
  /** Lower-case keywords (English and Arabic) that suggest this family in a job description. */
  keywords: string[];
  /**
   * Typical domain weights 0–1 for the 9 domain keys (technical, critical-thinking,
   * judgment, leadership, management, communication, product-thinking,
   * collaboration, adaptability).
   */
  domainWeights: Record<string, number>;
  /** 4–6 role-specific technical sub-skills. */
  technicalSkills: RoleTechnicalSkillDef[];
}

type Pair = [en: string, ar: string];
type FiveLevels = [Pair, Pair, Pair, Pair, Pair];

/** Builds a technical sub-skill from [en, ar] pairs; `levels` runs from level 1 to level 5. */
function skill(key: string, name: Pair, description: Pair, levels: FiveLevels): RoleTechnicalSkillDef {
  const anchors = {} as LevelAnchors;
  levels.forEach(([en, ar], i) => {
    anchors[(i + 1) as Level] = { en, ar };
  });
  return {
    key,
    name: { en: name[0], ar: name[1] },
    description: { en: description[0], ar: description[1] },
    anchors,
  };
}

function weights(
  technical: number,
  criticalThinking: number,
  judgment: number,
  leadership: number,
  management: number,
  communication: number,
  productThinking: number,
  collaboration: number,
  adaptability: number,
): Record<string, number> {
  return {
    technical,
    "critical-thinking": criticalThinking,
    judgment,
    leadership,
    management,
    communication,
    "product-thinking": productThinking,
    collaboration,
    adaptability,
  };
}

export const ROLE_FAMILIES: RoleFamilyDef[] = [
  // ───────────────────────────────────────── Software engineering
  {
    key: "software-engineering",
    name: { en: "Software engineering", ar: "هندسة البرمجيات" },
    keywords: [
      "software engineer",
      "software developer",
      "software engineering",
      "backend",
      "frontend",
      "full stack",
      "full-stack",
      "devops",
      "programming",
      "javascript",
      "typescript",
      "python",
      "java",
      "microservices",
      "مهندس برمجيات",
      "مطور برمجيات",
      "تطوير البرمجيات",
      "برمجة",
    ],
    domainWeights: weights(1.0, 0.8, 0.6, 0.3, 0.2, 0.5, 0.5, 0.6, 0.6),
    technicalSkills: [
      skill(
        "technical.swe.system-design",
        ["System design", "تصميم الأنظمة"],
        [
          "Structuring services, data and interfaces so a system meets its functional, scale and reliability needs.",
          "هيكلة الخدمات والبيانات والواجهات بحيث يلبّي النظام متطلباته الوظيفية ومتطلبات التوسّع والاعتمادية.",
        ],
        [
          [
            "Proposes components without linking them to the stated requirements, or misses an obvious need such as storing data or handling failure.",
            "يقترح مكوّنات دون ربطها بالمتطلبات المذكورة، أو يُغفل حاجة واضحة مثل تخزين البيانات أو التعامل مع الأعطال.",
          ],
          [
            "Sketches a workable standard design but does not size it against the expected load or explain how the parts communicate.",
            "يرسم تصميمًا معتادًا قابلًا للتنفيذ، لكنه لا يقدّر سعته في ضوء الحِمل المتوقع ولا يوضّح كيفية تواصل أجزائه.",
          ],
          [
            "Designs components, data flow and interfaces that meet the requirements, estimates load, and names the main trade-off in the chosen approach.",
            "يصمّم مكوّنات وتدفّق بيانات وواجهات تلبّي المتطلبات، ويقدّر الحِمل المتوقع، ويحدّد المفاضلة الرئيسية في النهج المختار.",
          ],
          [
            "Compares two viable designs on cost, latency and operability, identifies likely bottlenecks and failure points, and explains how the design would evolve.",
            "يقارن بين تصميمين صالحين من حيث التكلفة وزمن الاستجابة وسهولة التشغيل، ويحدّد نقاط الاختناق والأعطال المحتملة، ويوضّح كيف سيتطوّر التصميم.",
          ],
          [
            "Questions requirements that drive unnecessary complexity, designs for failure modes others overlook, and states which decisions will be hard to reverse.",
            "يراجع المتطلبات التي تفرض تعقيدًا غير ضروري، ويصمّم لأنماط الأعطال التي يغفل عنها غيره، ويبيّن القرارات التي سيصعب التراجع عنها.",
          ],
        ],
      ),
      skill(
        "technical.swe.debugging",
        ["Debugging and incident diagnosis", "تتبّع الأخطاء وتشخيص الأعطال"],
        [
          "Locating the cause of a defect or production incident from logs, metrics and code.",
          "تحديد سبب خلل برمجي أو عطل في بيئة التشغيل من خلال السجلات والمقاييس والشيفرة البرمجية.",
        ],
        [
          [
            "Suggests restarting, rolling back or rewriting code without stating what evidence points to the cause.",
            "يقترح إعادة التشغيل أو التراجع عن التغيير أو إعادة كتابة الشيفرة دون أن يذكر الدليل الذي يشير إلى السبب.",
          ],
          [
            "Checks the obvious places, such as recent changes or error logs, but follows one theory without testing it.",
            "يفحص المواضع البديهية مثل التغييرات الأخيرة أو سجلات الأخطاء، لكنه يتبع فرضية واحدة دون اختبارها.",
          ],
          [
            "Uses logs, metrics and recent changes to form several hypotheses, narrows them with specific checks, and separates mitigation from the permanent fix.",
            "يستعين بالسجلات والمقاييس والتغييرات الأخيرة لصياغة عدة فرضيات، ويضيّقها بفحوص محددة، ويفصل بين الإجراء المؤقت لاحتواء العطل والإصلاح الدائم.",
          ],
          [
            "Reproduces or isolates the fault systematically, explains why each clue fits or contradicts a hypothesis, and proposes monitoring to catch a recurrence.",
            "يعيد إنتاج العطل أو يعزله بطريقة منهجية، ويشرح سبب توافق كل مؤشر مع الفرضية أو تعارضه معها، ويقترح آليات مراقبة لرصد تكراره.",
          ],
          [
            "Notices clues that do not fit, such as timing or partial patterns, traces them to an underlying design weakness, and fixes the whole class of failure.",
            "يلتقط المؤشرات التي لا تتسق مع الصورة، كالتوقيت أو الأنماط الجزئية، ويتتبّعها إلى خلل كامن في التصميم، ويعالج فئة الأعطال كلها لا الحالة وحدها.",
          ],
        ],
      ),
      skill(
        "technical.swe.code-quality",
        ["Code quality and review", "جودة الشيفرة ومراجعتها"],
        [
          "Writing and reviewing code that is correct, readable, tested and maintainable.",
          "كتابة شيفرة برمجية صحيحة ومقروءة ومختبَرة وسهلة الصيانة، ومراجعة شيفرة الآخرين وفق ذلك.",
        ],
        [
          [
            "Accepts or writes code with clear defects, or comments only on formatting while missing logic errors.",
            "يقبل شيفرة فيها عيوب واضحة أو يكتبها، أو يقتصر في ملاحظاته على التنسيق ويُغفل الأخطاء المنطقية.",
          ],
          [
            "Finds some correctness issues but gives vague feedback, or does not consider tests and edge cases.",
            "يكتشف بعض مشكلات الصحة، لكن ملاحظاته مبهمة، أو لا يأخذ في الحسبان الاختبارات والحالات الحدّية.",
          ],
          [
            "Identifies correctness, edge-case and readability issues, suggests specific changes, and checks that tests cover the important paths.",
            "يحدّد مشكلات الصحة والحالات الحدّية والمقروئية، ويقترح تعديلات محددة، ويتحقق من أن الاختبارات تغطي المسارات المهمة.",
          ],
          [
            "Prioritises review comments by risk, explains the reasoning behind each, and spots maintainability or performance problems that will grow over time.",
            "يرتّب ملاحظات المراجعة بحسب درجة الخطورة، ويشرح مبرر كل منها، ويرصد مشكلات في قابلية الصيانة أو الأداء ستتفاقم مع الوقت.",
          ],
          [
            "Identifies hidden risks such as concurrency, security or data-migration issues, and proposes structural changes or team standards that prevent repeat problems.",
            "يكشف مخاطر خفية مثل مشكلات التزامن أو الأمن أو ترحيل البيانات، ويقترح تغييرات هيكلية أو معايير للفريق تمنع تكرار المشكلات.",
          ],
        ],
      ),
      skill(
        "technical.swe.testing-release",
        ["Testing and release safety", "الاختبار وأمان الإصدار"],
        [
          "Planning tests, rollouts and rollbacks so changes reach users safely.",
          "تخطيط الاختبارات وآليات الإطلاق والتراجع بحيث تصل التغييرات إلى المستخدمين بأمان.",
        ],
        [
          [
            "Plans to release without describing how the change will be tested or undone if it fails.",
            "يخطط للإصدار دون أن يبيّن كيف سيُختبر التغيير أو كيف يُتراجع عنه إن فشل.",
          ],
          [
            "Mentions testing in general terms but does not say which tests, or treats all changes as equally risky.",
            "يذكر الاختبار بعبارات عامة دون تحديد الاختبارات المطلوبة، أو يعامل التغييرات كلها على أنها متساوية في درجة الخطورة.",
          ],
          [
            "Chooses unit, integration and end-to-end tests suited to the risk, and plans a staged rollout with a clear rollback path.",
            "يختار اختبارات الوحدات والتكامل والاختبارات الشاملة الملائمة لدرجة الخطورة، ويخطط لإطلاق تدريجي مع مسار واضح للتراجع.",
          ],
          [
            "Defines the signals that would stop a rollout, sets thresholds in advance, and matches test depth to the cost of failure.",
            "يحدّد المؤشرات التي تستدعي إيقاف الإطلاق، ويضع لها حدودًا مسبقًا، ويوائم عمق الاختبار مع تكلفة الفشل.",
          ],
          [
            "Anticipates failures tests cannot catch, such as data or dependency issues in production, and designs safeguards and feature flags that limit harm.",
            "يتوقع أعطالًا لا تكشفها الاختبارات، مثل مشكلات البيانات أو التبعيات في بيئة التشغيل، ويصمّم ضمانات ومفاتيح تفعيل للميزات تحدّ من الضرر.",
          ],
        ],
      ),
      skill(
        "technical.swe.technical-tradeoffs",
        ["Technical debt and trade-offs", "الدَّين التقني والمفاضلات التقنية"],
        [
          "Weighing speed of delivery against long-term cost when making technical choices.",
          "الموازنة بين سرعة التسليم والتكلفة على المدى البعيد عند اتخاذ القرارات التقنية.",
        ],
        [
          [
            "Picks an approach on preference alone, or treats shipping fast and building properly as choices that cannot be combined.",
            "يختار نهجًا بناءً على تفضيله الشخصي فقط، أو يتعامل مع السرعة في التسليم والإتقان على أنهما خياران لا يجتمعان.",
          ],
          [
            "Notes that a shortcut creates technical debt but does not estimate its cost or plan to repay it.",
            "يشير إلى أن الحل المختصر يُنشئ دَينًا تقنيًا، لكنه لا يقدّر تكلفته ولا يخطط لسداده.",
          ],
          [
            "Compares options on delivery time, risk and maintenance cost, recommends one, and records the debt taken on with a plan to address it.",
            "يقارن الخيارات من حيث زمن التسليم والمخاطر وتكلفة الصيانة، ويوصي بأحدها، ويوثّق الدَّين التقني المترتب مع خطة لمعالجته.",
          ],
          [
            "Estimates the effect of debt on future work, explains the trade-off in terms non-engineers can act on, and judges when repayment matters most.",
            "يقدّر أثر الدَّين التقني في العمل المستقبلي، ويشرح المفاضلة بلغة يستطيع غير المهندسين البناء عليها، ويحدّد التوقيت الذي يصبح فيه السداد أكثر أهمية.",
          ],
          [
            "Distinguishes debt that is cheap to carry from debt that compounds, and finds an option that keeps speed now while keeping later choices open.",
            "يميّز بين الدَّين الذي يسهل تحمّله والدَّين الذي يتضاعف أثره، ويجد خيارًا يحافظ على السرعة الآن ويُبقي الخيارات اللاحقة مفتوحة.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Data and analytics
  {
    key: "data-analytics",
    name: { en: "Data and analytics", ar: "البيانات والتحليلات" },
    keywords: [
      "data analyst",
      "data scientist",
      "data engineer",
      "analytics",
      "business intelligence",
      "sql",
      "dashboard",
      "tableau",
      "power bi",
      "statistics",
      "machine learning",
      "محلل بيانات",
      "تحليل البيانات",
      "علم البيانات",
      "ذكاء الأعمال",
    ],
    domainWeights: weights(1.0, 1.0, 0.6, 0.2, 0.2, 0.7, 0.5, 0.5, 0.5),
    technicalSkills: [
      skill(
        "technical.data.sql-querying",
        ["SQL and data querying", "لغة SQL والاستعلام عن البيانات"],
        [
          "Retrieving, joining and aggregating data correctly to answer a business question.",
          "استرجاع البيانات وربطها وتجميعها بطريقة صحيحة للإجابة عن سؤال في العمل.",
        ],
        [
          [
            "Writes or proposes queries with errors that change the answer, such as wrong joins, missing filters or double counting.",
            "يكتب استعلامات أو يقترحها وفيها أخطاء تغيّر النتيجة، مثل الربط الخاطئ بين الجداول أو إغفال عوامل التصفية أو احتساب السجلات مرتين.",
          ],
          [
            "Produces a query that runs and roughly answers the question but ignores nulls, duplicates or the correct grain of the data.",
            "يكتب استعلامًا يعمل ويجيب عن السؤال تقريبيًا، لكنه يتجاهل القيم الفارغة أو السجلات المكررة أو مستوى التفصيل الصحيح للبيانات.",
          ],
          [
            "Writes correct joins, filters and aggregations at the right grain, handles nulls and duplicates, and checks the result against a known total.",
            "يكتب عمليات ربط وتصفية وتجميع صحيحة على مستوى التفصيل المناسب، ويعالج القيم الفارغة والمكررة، ويطابق النتيجة مع إجمالي معروف.",
          ],
          [
            "Uses window functions or staged queries where they simplify logic, states the assumptions in the query, and notes performance concerns on large tables.",
            "يستخدم دوال النوافذ أو الاستعلامات المرحلية حين تبسّط المنطق، ويوضّح الافتراضات التي يقوم عليها الاستعلام، وينبّه إلى مشكلات الأداء في الجداول الكبيرة.",
          ],
          [
            "Detects when the data model itself misleads, such as late-arriving records or changed definitions, and restructures the query to give a trustworthy answer.",
            "يدرك متى يكون نموذج البيانات نفسه مضللًا، كالسجلات المتأخرة في الوصول أو التعريفات المتغيرة، ويعيد بناء الاستعلام للحصول على إجابة موثوقة.",
          ],
        ],
      ),
      skill(
        "technical.data.statistics-experiments",
        ["Statistics and experiment design", "الإحصاء وتصميم التجارب"],
        [
          "Designing tests and applying statistical reasoning to tell real effects from noise.",
          "تصميم التجارب وتطبيق الاستدلال الإحصائي للتمييز بين الأثر الحقيقي والتباين العشوائي.",
        ],
        [
          [
            "Draws conclusions from raw differences or tiny samples without considering chance or how the groups were chosen.",
            "يستخلص نتائج من فروق خام أو عينات صغيرة جدًا دون مراعاة دور الصدفة أو طريقة اختيار المجموعات.",
          ],
          [
            "Mentions significance or sample size but applies them loosely, or confuses correlation with causation.",
            "يذكر الدلالة الإحصائية أو حجم العينة لكنه يطبّقهما تطبيقًا غير دقيق، أو يخلط بين الارتباط والسببية.",
          ],
          [
            "Designs a test with a control group, a primary metric and a sensible sample size, and interprets results with appropriate uncertainty.",
            "يصمّم تجربة بمجموعة ضابطة ومقياس رئيسي وحجم عينة معقول، ويفسّر النتائج مع مراعاة قدر مناسب من عدم اليقين.",
          ],
          [
            "Anticipates threats such as novelty effects, multiple comparisons or uneven groups, and states in advance what result would change the decision.",
            "يتوقع العوامل التي تهدد صحة النتائج، مثل أثر الجِدّة أو المقارنات المتعددة أو عدم تكافؤ المجموعات، ويحدّد مسبقًا النتيجة التي قد تغيّر القرار.",
          ],
          [
            "Recognises when a standard test does not fit, such as with network effects or rare events, and proposes a design that still answers the business question.",
            "يدرك متى لا تلائم التجربة المعتادة الموقف، كما في حالات تأثير الشبكة أو الأحداث النادرة، ويقترح تصميمًا يجيب مع ذلك عن سؤال العمل.",
          ],
        ],
      ),
      skill(
        "technical.data.data-storytelling",
        ["Data storytelling", "سرد القصص بالبيانات"],
        [
          "Turning analysis into a clear message and a recommended action for a specific audience.",
          "تحويل نتائج التحليل إلى رسالة واضحة وإجراء مقترح يناسب جمهورًا محددًا.",
        ],
        [
          [
            "Lists numbers or charts without saying what they mean or what the audience should do.",
            "يسرد أرقامًا أو رسومًا بيانية دون أن يبيّن دلالتها أو ما ينبغي للجمهور فعله.",
          ],
          [
            "States a finding but buries it among less relevant detail, or picks visuals that do not suit the comparison.",
            "يذكر نتيجة لكنه يدفنها بين تفاصيل أقل أهمية، أو يختار عروضًا مرئية لا تناسب المقارنة المطلوبة.",
          ],
          [
            "Leads with the key finding, supports it with the few most relevant figures, and ends with a clear recommendation and its confidence.",
            "يبدأ بالنتيجة الرئيسية، ويدعمها بأهم الأرقام ذات الصلة، ويختم بتوصية واضحة ودرجة الثقة فيها.",
          ],
          [
            "Tailors the message to what the audience cares about, anticipates their likely objections, and shows the alternative explanations already ruled out.",
            "يوائم الرسالة مع اهتمامات الجمهور، ويتوقع اعتراضاته المحتملة، ويعرض التفسيرات البديلة التي استبعدها.",
          ],
          [
            "Frames the data around the decision at stake, presents uncertainty in a way that helps rather than alarms, and surfaces an insight the audience had not asked for.",
            "يبني عرض البيانات حول القرار المطروح، ويقدّم عدم اليقين بطريقة تساعد على اتخاذ القرار لا تثير القلق، ويكشف رؤية لم يطلبها الجمهور.",
          ],
        ],
      ),
      skill(
        "technical.data.data-quality",
        ["Data quality and validation", "جودة البيانات والتحقق منها"],
        [
          "Checking that data is complete, accurate and consistent before relying on it.",
          "التحقق من اكتمال البيانات ودقتها واتساقها قبل الاعتماد عليها.",
        ],
        [
          [
            "Uses data as given without checking it, even when figures look implausible.",
            "يستخدم البيانات كما هي دون فحصها، حتى حين تبدو الأرقام غير منطقية.",
          ],
          [
            "Notices an obvious anomaly but does not investigate its source or its effect on the conclusion.",
            "يلاحظ خللًا واضحًا في البيانات، لكنه لا يبحث في مصدره ولا في أثره في الاستنتاج.",
          ],
          [
            "Checks completeness, duplicates, value ranges and reconciliation to source totals, and states how any issues affect the analysis.",
            "يتحقق من اكتمال البيانات والسجلات المكررة ونطاقات القيم ومطابقتها مع إجماليات المصدر، ويوضّح أثر أي مشكلات في التحليل.",
          ],
          [
            "Traces anomalies to their cause in collection or processing, quantifies their impact, and proposes automated checks to catch them earlier.",
            "يتتبّع مواضع الخلل إلى أسبابها في مرحلة الجمع أو المعالجة، ويقدّر أثرها كميًا، ويقترح فحوصًا آلية لاكتشافها مبكرًا.",
          ],
          [
            "Spots subtle issues such as unannounced definition changes or survivorship bias, and decides when the data is good enough for the decision at hand.",
            "يرصد مشكلات دقيقة مثل تغيّر التعريفات دون إعلان أو تحيّز البقاء، ويقرر متى تكون البيانات كافية للقرار المطروح.",
          ],
        ],
      ),
      skill(
        "technical.data.metric-design",
        ["Metric design", "تصميم المقاييس"],
        [
          "Defining metrics that reflect the goal, are hard to game and can be measured reliably.",
          "تحديد مقاييس تعكس الهدف، ويصعب التلاعب بها، ويمكن قياسها بموثوقية.",
        ],
        [
          [
            "Proposes metrics that do not reflect the goal, or that are easy to improve without real progress.",
            "يقترح مقاييس لا تعكس الهدف، أو يسهل تحسينها دون تقدّم فعلي.",
          ],
          [
            "Picks a reasonable headline metric but leaves its definition vague or ignores side effects.",
            "يختار مقياسًا رئيسيًا معقولًا، لكنه يترك تعريفه مبهمًا أو يتجاهل آثاره الجانبية.",
          ],
          [
            "Defines a primary metric precisely, links it to the goal, and adds guardrail metrics that would reveal harm elsewhere.",
            "يعرّف مقياسًا رئيسيًا تعريفًا دقيقًا، ويربطه بالهدف، ويضيف مقاييس ضابطة تكشف أي ضرر في جوانب أخرى.",
          ],
          [
            "Separates leading from lagging indicators, explains how each could be gamed, and sets targets from baselines rather than guesses.",
            "يميّز بين المؤشرات الاستباقية والمؤشرات اللاحقة، ويوضّح كيف يمكن التلاعب بكل منها، ويضع المستهدفات استنادًا إلى خطوط أساس لا إلى التخمين.",
          ],
          [
            "Designs a small set of metrics that balances competing goals, anticipates how behaviour will change once measured, and plans when to retire metrics.",
            "يصمّم مجموعة صغيرة من المقاييس توازن بين أهداف متعارضة، ويتوقع كيف سيتغير السلوك بمجرد قياسه، ويخطط لموعد الاستغناء عن المقاييس.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Product management
  {
    key: "product-management",
    name: { en: "Product management", ar: "إدارة المنتجات" },
    keywords: [
      "product manager",
      "product management",
      "product owner",
      "product roadmap",
      "product strategy",
      "user stories",
      "backlog",
      "go-to-market",
      "مدير منتج",
      "مدير المنتج",
      "إدارة المنتجات",
      "مالك المنتج",
      "خارطة طريق",
    ],
    domainWeights: weights(0.6, 0.8, 0.8, 0.6, 0.4, 0.8, 1.0, 0.8, 0.6),
    technicalSkills: [
      skill(
        "technical.pm.discovery",
        ["Product discovery", "استكشاف المنتج"],
        [
          "Finding out which customer problems are worth solving before committing to build.",
          "التعرّف على مشكلات العملاء التي تستحق الحل قبل الالتزام بالتطوير.",
        ],
        [
          [
            "Moves straight to a solution based on a single request or opinion, without checking the underlying problem.",
            "ينتقل مباشرة إلى حل استنادًا إلى طلب واحد أو رأي شخصي، دون التحقق من المشكلة الأساسية.",
          ],
          [
            "Suggests talking to customers but asks leading questions or relies on what users say they want.",
            "يقترح التحدث إلى العملاء، لكنه يطرح أسئلة موجِّهة أو يعتمد على ما يقول المستخدمون إنهم يريدونه.",
          ],
          [
            "Defines the problem and target users, combines interviews with usage data, and states which assumptions must be tested before building.",
            "يحدّد المشكلة والمستخدمين المستهدفين، ويجمع بين المقابلات وبيانات الاستخدام، ويبيّن الافتراضات التي يجب اختبارها قبل التطوير.",
          ],
          [
            "Ranks assumptions by risk, designs cheap tests such as prototypes or demand tests, and defines what evidence would stop the idea.",
            "يرتّب الافتراضات بحسب درجة خطورتها، ويصمّم اختبارات منخفضة التكلفة مثل النماذج الأولية أو اختبارات قياس الطلب، ويحدّد الأدلة التي تستدعي التخلي عن الفكرة.",
          ],
          [
            "Reframes the request around a more valuable underlying need, finds evidence others overlooked, and stops or reshapes ideas early with clear reasoning.",
            "يعيد صياغة الطلب حول حاجة أعمق وأعلى قيمة، ويجد أدلة أغفلها غيره، ويوقف الأفكار أو يعيد تشكيلها مبكرًا بحجة واضحة.",
          ],
        ],
      ),
      skill(
        "technical.pm.roadmap-prioritisation",
        ["Roadmap prioritisation", "ترتيب أولويات خارطة الطريق"],
        [
          "Choosing what to build next based on value, effort, risk and strategy.",
          "اختيار ما يُطوَّر تاليًا بناءً على القيمة والجهد والمخاطر والاستراتيجية.",
        ],
        [
          [
            "Orders work by who asked most forcefully or most recently, without stating criteria.",
            "يرتّب الأعمال بحسب من ألحّ في الطلب أكثر أو من طلب مؤخرًا، دون معايير معلنة.",
          ],
          [
            "Applies a scoring method mechanically with unsupported estimates, or ignores dependencies and strategy.",
            "يطبّق أسلوبًا للتقييم بطريقة آلية وبتقديرات غير مدعومة، أو يتجاهل الاعتماديات والاستراتيجية.",
          ],
          [
            "Prioritises using stated criteria such as impact, effort and strategic fit, explains what is deferred and why, and accounts for dependencies.",
            "يرتّب الأولويات وفق معايير معلنة مثل الأثر والجهد والتوافق الاستراتيجي، ويوضّح ما أُرجئ وسبب ذلك، ويراعي الاعتماديات.",
          ],
          [
            "Tests key estimates with evidence, balances short-term requests against long-term bets, and makes the opportunity cost of each choice explicit.",
            "يختبر التقديرات الرئيسية بالأدلة، ويوازن بين الطلبات قصيرة الأجل والرهانات طويلة الأجل، ويوضّح تكلفة الفرصة البديلة لكل خيار.",
          ],
          [
            "Sequences work so early releases reduce the biggest uncertainties, and declines attractive work with reasons stakeholders accept.",
            "يرتّب الأعمال بحيث تقلّص الإصدارات الأولى أكبر مواطن عدم اليقين، ويرفض أعمالًا مغرية بحجج يقبلها أصحاب المصلحة.",
          ],
        ],
      ),
      skill(
        "technical.pm.requirements",
        ["Requirements and specification", "صياغة المتطلبات والمواصفات"],
        [
          "Writing requirements that tell the team what problem to solve, for whom, and how success is judged.",
          "كتابة متطلبات توضّح للفريق المشكلة المطلوب حلها، ولمن، وكيف يُحكم على النجاح.",
        ],
        [
          [
            "Describes features as vague wishes or detailed designs, with no problem statement or success criteria.",
            "يصف الميزات أمنياتٍ مبهمة أو تصاميمَ تفصيلية، دون بيان للمشكلة أو معايير للنجاح.",
          ],
          [
            "States the problem and main feature but leaves out edge cases, constraints or acceptance criteria.",
            "يحدّد المشكلة والميزة الرئيسية، لكنه يُغفل الحالات الحدّية أو القيود أو معايير القبول.",
          ],
          [
            "Specifies the problem, users, scope, acceptance criteria and success metric clearly enough for the team to estimate and build.",
            "يحدّد المشكلة والمستخدمين والنطاق ومعايير القبول ومقياس النجاح بوضوح كافٍ يمكّن الفريق من التقدير والتنفيذ.",
          ],
          [
            "Separates must-haves from options, records open questions and decisions, and leaves the team room to choose the best solution.",
            "يميّز بين المتطلبات الأساسية والاختيارية، ويوثّق الأسئلة المفتوحة والقرارات، ويترك للفريق مساحة لاختيار أفضل حل.",
          ],
          [
            "Anticipates edge cases and operational or compliance impacts others miss, and shapes scope into the smallest release that still delivers value.",
            "يتوقع الحالات الحدّية والآثار التشغيلية وآثار الامتثال التي يغفل عنها غيره، ويصوغ النطاق في أصغر إصدار يحقق قيمة فعلية.",
          ],
        ],
      ),
      skill(
        "technical.pm.product-metrics",
        ["Product metrics and outcomes", "مقاييس المنتج ونتائجه"],
        [
          "Using data to judge whether a product change achieved its intended outcome.",
          "استخدام البيانات للحكم على مدى تحقيق التغيير في المنتج للنتيجة المقصودة.",
        ],
        [
          [
            "Judges success by features delivered or by anecdotes rather than by any measured outcome.",
            "يحكم على النجاح بعدد الميزات المنجزة أو بروايات فردية، لا بأي نتيجة مقيسة.",
          ],
          [
            "Names a relevant metric but sets no baseline or target, or reads a change in it without considering other causes.",
            "يحدّد مقياسًا مناسبًا لكنه لا يضع خط أساس أو مستهدفًا، أو يقرأ التغير فيه دون النظر في أسباب أخرى.",
          ],
          [
            "Sets outcome metrics with baselines and targets before launch, and reviews results against them to decide next steps.",
            "يحدّد مقاييس النتائج مع خطوط الأساس والمستهدفات قبل الإطلاق، ويراجع النتائج في ضوئها لتحديد الخطوات التالية.",
          ],
          [
            "Combines adoption, retention and business metrics, segments results to find where the change worked, and separates its effect from other factors.",
            "يجمع بين مقاييس التبنّي والاحتفاظ بالمستخدمين ومقاييس الأعمال، ويقسّم النتائج إلى شرائح لمعرفة أين نجح التغيير، ويفصل أثره عن العوامل الأخرى.",
          ],
          [
            "Detects when a metric improvement hides harm elsewhere, and links product metrics to the business model so trade-offs can be valued.",
            "يكتشف متى يُخفي تحسّن أحد المقاييس ضررًا في جانب آخر، ويربط مقاييس المنتج بنموذج العمل بحيث يمكن تقدير قيمة المفاضلات.",
          ],
        ],
      ),
      skill(
        "technical.pm.go-to-market",
        ["Launch and go-to-market", "الإطلاق والطرح في السوق"],
        [
          "Planning how a product reaches customers, including positioning, readiness and rollout.",
          "تخطيط وصول المنتج إلى العملاء، بما في ذلك تحديد موقعه في السوق والجاهزية ومراحل الطرح.",
        ],
        [
          [
            "Treats launch as switching the feature on, with no plan for informing customers or preparing internal teams.",
            "يتعامل مع الإطلاق على أنه مجرد تفعيل للميزة، دون خطة لإبلاغ العملاء أو تهيئة الفرق الداخلية.",
          ],
          [
            "Lists launch tasks but does not tailor messaging to customer segments or check that support and sales are ready.",
            "يعدّد مهام الإطلاق، لكنه لا يوائم الرسائل مع شرائح العملاء ولا يتحقق من جاهزية فريقي الدعم والمبيعات.",
          ],
          [
            "Plans positioning, audience, channels, internal readiness and a rollout sequence, with a clear owner and date for each step.",
            "يخطط لموقع المنتج في السوق والجمهور والقنوات والجاهزية الداخلية وتسلسل الطرح، مع مسؤول وموعد واضحين لكل خطوة.",
          ],
          [
            "Stages the launch to learn before scaling, sets success criteria for each stage, and prepares responses to likely customer objections.",
            "يقسّم الإطلاق إلى مراحل للتعلّم قبل التوسّع، ويحدّد معايير نجاح لكل مرحلة، ويُعدّ ردودًا على اعتراضات العملاء المتوقعة.",
          ],
          [
            "Identifies launch risks others miss, such as pricing conflicts or effects on existing customers, and adapts the plan to competitor timing.",
            "يرصد مخاطر الإطلاق التي يغفل عنها غيره، مثل تعارضات التسعير أو الأثر في العملاء الحاليين، ويوائم الخطة مع توقيت المنافسين.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Design (UX/UI)
  {
    key: "design",
    name: { en: "Design (UX/UI)", ar: "التصميم (تجربة المستخدم وواجهاته)" },
    keywords: [
      "ux designer",
      "ui designer",
      "ux/ui",
      "ui/ux",
      "product designer",
      "user experience",
      "user interface",
      "interaction design",
      "usability",
      "wireframe",
      "prototype",
      "figma",
      "تجربة المستخدم",
      "واجهة المستخدم",
      "واجهات المستخدم",
      "مصمم منتجات",
      "تصميم واجهات",
    ],
    domainWeights: weights(1.0, 0.6, 0.5, 0.3, 0.2, 0.7, 1.0, 0.7, 0.6),
    technicalSkills: [
      skill(
        "technical.design.user-research",
        ["User research", "أبحاث المستخدمين"],
        [
          "Planning and interpreting research that reveals how people behave and what they need.",
          "تخطيط الأبحاث التي تكشف سلوك الناس واحتياجاتهم وتفسير نتائجها.",
        ],
        [
          [
            "Designs from personal taste or assumptions about users, with no plan to learn from them.",
            "يصمّم بناءً على ذوقه الشخصي أو افتراضاته عن المستخدمين، دون خطة للتعلّم منهم.",
          ],
          [
            "Proposes research but chooses a method that does not fit the question, or asks users to predict their own behaviour.",
            "يقترح إجراء بحث لكنه يختار أسلوبًا لا يناسب السؤال، أو يطلب من المستخدمين توقّع سلوكهم بأنفسهم.",
          ],
          [
            "Matches the method to the question, recruits relevant participants, and turns findings into clear insights tied to design decisions.",
            "يختار الأسلوب الملائم للسؤال، ويستقطب مشاركين مناسبين، ويحوّل النتائج إلى رؤى واضحة مرتبطة بقرارات التصميم.",
          ],
          [
            "Combines qualitative and quantitative evidence, separates observed behaviour from opinion, and notes the limits of a small sample.",
            "يجمع بين الأدلة النوعية والكمية، ويميّز بين السلوك الملاحَظ والآراء، ويشير إلى حدود العينة الصغيرة.",
          ],
          [
            "Uncovers needs users cannot put into words, notices which users are missing from the research, and changes how the team frames the problem.",
            "يكشف احتياجات لا يستطيع المستخدمون التعبير عنها، وينتبه إلى فئات المستخدمين الغائبة عن البحث، ويغيّر طريقة نظر الفريق إلى المشكلة.",
          ],
        ],
      ),
      skill(
        "technical.design.interaction-design",
        ["Interaction design", "تصميم التفاعل"],
        [
          "Designing flows and controls that let people complete tasks easily and without errors.",
          "تصميم مسارات وعناصر تحكّم تمكّن الناس من إنجاز مهامهم بسهولة ودون أخطاء.",
        ],
        [
          [
            "Describes screens in isolation without considering the user's path, errors or how they recover.",
            "يصف الشاشات كلًّا على حدة، دون مراعاة مسار المستخدم أو الأخطاء أو طريقة تجاوزها.",
          ],
          [
            "Maps the main path but overlooks empty, error and edge states, or adds steps that do not serve the user.",
            "يرسم المسار الرئيسي، لكنه يُغفل حالات الشاشة الفارغة والأخطاء والحالات الحدّية، أو يضيف خطوات لا تخدم المستخدم.",
          ],
          [
            "Designs a complete flow including errors and edge states, follows established patterns, and explains each choice in terms of the user's task.",
            "يصمّم مسارًا متكاملًا يشمل الأخطاء والحالات الحدّية، ويلتزم بالأنماط المعتمدة، ويشرح كل اختيار في ضوء مهمة المستخدم.",
          ],
          [
            "Reduces effort and error with clear defaults, feedback and recovery, and compares alternative flows against the main usability risks.",
            "يقلّل الجهد والأخطاء من خلال إعدادات افتراضية واضحة وتغذية راجعة وسبل للتراجع، ويقارن بين مسارات بديلة في ضوء أبرز مخاطر سهولة الاستخدام.",
          ],
          [
            "Rethinks the task itself to remove steps entirely, anticipates misuse and unusual contexts, and designs for them without adding complexity.",
            "يعيد التفكير في المهمة نفسها لإلغاء خطوات بالكامل، ويتوقع سوء الاستخدام والسياقات غير المعتادة، ويصمّم لها دون إضافة تعقيد.",
          ],
        ],
      ),
      skill(
        "technical.design.visual-design",
        ["Visual and information design", "التصميم المرئي وتنظيم المعلومات"],
        [
          "Using layout, hierarchy, type and colour to make information clear and usable.",
          "توظيف التخطيط والتسلسل البصري والخطوط والألوان لجعل المعلومات واضحة وسهلة الاستخدام.",
        ],
        [
          [
            "Makes visual choices that hide important information or conflict with each other, with no stated rationale.",
            "يتخذ قرارات بصرية تُخفي معلومات مهمة أو تتعارض فيما بينها، دون مبرر معلن.",
          ],
          [
            "Creates a tidy layout but with weak hierarchy, so users cannot tell what matters most.",
            "ينشئ تخطيطًا مرتبًا لكن تسلسله البصري ضعيف، فلا يستطيع المستخدم تمييز الأهم.",
          ],
          [
            "Establishes clear hierarchy, consistent spacing and type, and readable contrast, and explains how the layout supports the main task.",
            "يرسي تسلسلًا بصريًا واضحًا، ومسافات وخطوطًا متسقة، وتباينًا يسهّل القراءة، ويوضّح كيف يدعم التخطيط المهمة الرئيسية.",
          ],
          [
            "Adapts layout across screen sizes and languages, including right-to-left text, and uses the design system while noting where it falls short.",
            "يوائم التخطيط مع أحجام الشاشات واللغات المختلفة، بما فيها الكتابة من اليمين إلى اليسار، ويستخدم نظام التصميم مع الإشارة إلى مواضع قصوره.",
          ],
          [
            "Makes dense or complex information easy to scan and compare, and sets visual principles others can apply consistently.",
            "يجعل المعلومات الكثيفة أو المعقدة سهلة التصفح والمقارنة، ويضع مبادئ بصرية يستطيع الآخرون تطبيقها باتساق.",
          ],
        ],
      ),
      skill(
        "technical.design.usability-testing",
        ["Usability testing and iteration", "اختبار سهولة الاستخدام والتحسين المتكرر"],
        [
          "Testing designs with users and improving them based on what is observed.",
          "اختبار التصاميم مع المستخدمين وتحسينها بناءً على ما يُلاحَظ.",
        ],
        [
          [
            "Considers a design finished once it looks right, or dismisses user difficulties as user error.",
            "يعدّ التصميم مكتملًا بمجرد أن يبدو جيدًا، أو يعزو صعوبات المستخدمين إلى أخطائهم.",
          ],
          [
            "Plans a test but with leading tasks or no clear success measure, and reports opinions rather than observed problems.",
            "يخطط لاختبار لكن بمهام موجِّهة أو دون مقياس واضح للنجاح، وينقل الآراء بدل المشكلات الملاحَظة.",
          ],
          [
            "Writes realistic tasks, observes where users struggle, rates issues by severity, and changes the design to address the most serious ones.",
            "يكتب مهام واقعية، ويلاحظ مواضع تعثّر المستخدمين، ويصنّف المشكلات بحسب خطورتها، ويعدّل التصميم لمعالجة أخطرها.",
          ],
          [
            "Separates the root cause of a usability problem from its symptom, tests fixes again, and knows when more testing will not change the decision.",
            "يميّز بين السبب الجذري لمشكلة في سهولة الاستخدام وأعراضها، ويعيد اختبار الحلول، ويدرك متى لن يغيّر مزيد من الاختبار القرار.",
          ],
          [
            "Chooses the lightest test that answers the riskiest question, spots patterns across studies, and turns them into lasting design guidance.",
            "يختار أخف اختبار يجيب عن أخطر سؤال، ويرصد الأنماط المتكررة عبر الدراسات، ويحوّلها إلى إرشادات تصميم دائمة.",
          ],
        ],
      ),
      skill(
        "technical.design.accessibility",
        ["Accessibility and inclusive design", "إمكانية الوصول والتصميم الشامل"],
        [
          "Making products usable for people with different abilities, languages and contexts.",
          "جعل المنتجات قابلة للاستخدام لأشخاص بقدرات ولغات وسياقات مختلفة.",
        ],
        [
          [
            "Does not consider accessibility, or treats it as a final check after the design is complete.",
            "لا يراعي إمكانية الوصول، أو يتعامل معها على أنها فحص أخير بعد اكتمال التصميم.",
          ],
          [
            "Mentions accessibility standards in general but misses specific issues such as contrast, focus order or text alternatives.",
            "يذكر معايير إمكانية الوصول بوجه عام، لكنه يُغفل مشكلات محددة مثل التباين أو ترتيب التنقل أو النصوص البديلة.",
          ],
          [
            "Applies recognised accessibility guidelines, including contrast, keyboard use, labels and screen reader support.",
            "يطبّق إرشادات إمكانية الوصول المعتمدة، بما في ذلك التباين واستخدام لوحة المفاتيح والتسميات ودعم قارئات الشاشة.",
          ],
          [
            "Builds inclusion into early decisions, considers language, literacy and device limits, and explains the trade-offs when guidelines conflict.",
            "يُدمج الشمول في القرارات المبكرة، ويراعي اللغة ومستوى القراءة وقيود الأجهزة، ويشرح المفاضلات حين تتعارض الإرشادات.",
          ],
          [
            "Identifies groups excluded in ways standards do not cover, and shows how designing for them improves the product for everyone.",
            "يحدّد فئات مستبعدة بطرق لا تغطيها المعايير، ويبيّن كيف يحسّن التصميم لها المنتج للجميع.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Sales
  {
    key: "sales",
    name: { en: "Sales", ar: "المبيعات" },
    keywords: [
      "sales",
      "account executive",
      "business development",
      "sales manager",
      "sales pipeline",
      "quota",
      "prospecting",
      "key account",
      "b2b",
      "مبيعات",
      "تطوير الأعمال",
      "مندوب مبيعات",
      "العملاء المحتملين",
      "كبار العملاء",
    ],
    domainWeights: weights(0.8, 0.5, 0.6, 0.4, 0.3, 1.0, 0.4, 0.7, 0.7),
    technicalSkills: [
      skill(
        "technical.sales.discovery-qualification",
        ["Discovery and qualification", "استكشاف احتياجات العميل وتأهيله"],
        [
          "Uncovering a prospect's needs, decision process and fit before proposing a solution.",
          "الكشف عن احتياجات العميل المحتمل وآلية اتخاذه للقرار ومدى ملاءمته قبل اقتراح أي حل.",
        ],
        [
          [
            "Pitches the product immediately without asking about the customer's situation or needs.",
            "يبدأ بعرض المنتج فورًا دون السؤال عن وضع العميل أو احتياجاته.",
          ],
          [
            "Asks about needs but accepts surface answers, and does not explore budget, timing or who decides.",
            "يسأل عن الاحتياجات لكنه يكتفي بإجابات سطحية، ولا يستكشف الميزانية أو التوقيت أو صاحب القرار.",
          ],
          [
            "Asks open questions that reveal the problem, its cost, the decision process and timeline, and judges whether the opportunity is worth pursuing.",
            "يطرح أسئلة مفتوحة تكشف المشكلة وتكلفتها وآلية اتخاذ القرار والجدول الزمني، ويحكم على جدوى متابعة الفرصة.",
          ],
          [
            "Quantifies the business impact with the customer, maps all stakeholders and their concerns, and disqualifies weak opportunities early.",
            "يقدّر مع العميل الأثر في أعماله بالأرقام، ويحدّد جميع أصحاب المصلحة ومخاوفهم، ويستبعد الفرص الضعيفة مبكرًا.",
          ],
          [
            "Helps the customer see a problem or risk they had not recognised, and reshapes the opportunity around it without overselling.",
            "يساعد العميل على رؤية مشكلة أو خطر لم يكن يدركه، ويعيد صياغة الفرصة حوله دون مبالغة في الوعود.",
          ],
        ],
      ),
      skill(
        "technical.sales.value-proposition",
        ["Value proposition and solution selling", "عرض القيمة والبيع القائم على الحلول"],
        [
          "Linking what is offered to the customer's specific goals and showing the expected return.",
          "ربط ما يُقدَّم بأهداف العميل المحددة وإظهار العائد المتوقع.",
        ],
        [
          [
            "Lists product features without connecting them to anything the customer has said.",
            "يعدّد ميزات المنتج دون ربطها بأي شيء ذكره العميل.",
          ],
          [
            "Links some features to customer needs, but in generic terms that could apply to any customer.",
            "يربط بعض الميزات باحتياجات العميل، لكن بعبارات عامة تصلح لأي عميل.",
          ],
          [
            "Builds the proposal around the customer's stated goals, explains the expected benefit, and supports it with a relevant example or figure.",
            "يبني عرضه حول أهداف العميل المعلنة، ويوضّح الفائدة المتوقعة، ويدعمها بمثال أو رقم ذي صلة.",
          ],
          [
            "Estimates return on investment with the customer's own numbers, tailors the message to each stakeholder, and is honest about limits.",
            "يقدّر العائد على الاستثمار بأرقام العميل نفسه، ويوائم الرسالة مع كل صاحب مصلحة، ويتحدث بصدق عن حدود العرض.",
          ],
          [
            "Differentiates against every alternative, including doing nothing, and frames value around the outcome the buyer will be judged on.",
            "يُبرز ما يميّز العرض عن كل البدائل، بما فيها خيار عدم التغيير، ويصوغ القيمة حول النتيجة التي سيُقيَّم المشتري على أساسها.",
          ],
        ],
      ),
      skill(
        "technical.sales.objection-handling",
        ["Objection handling", "التعامل مع الاعتراضات"],
        [
          "Responding to concerns in a way that builds trust and moves the decision forward.",
          "الرد على مخاوف العميل بطريقة تبني الثقة وتدفع القرار إلى الأمام.",
        ],
        [
          [
            "Argues with the customer, ignores the objection, or offers a discount straight away.",
            "يجادل العميل أو يتجاهل اعتراضه أو يسارع إلى تقديم خصم.",
          ],
          [
            "Acknowledges the objection but answers with a scripted reply that does not address the real concern.",
            "يُقرّ بالاعتراض، لكنه يرد بإجابة محفوظة لا تعالج المخاوف الحقيقية.",
          ],
          [
            "Asks questions to understand the concern behind the objection, responds with relevant evidence, and checks whether it is resolved.",
            "يطرح أسئلة لفهم الدافع وراء الاعتراض، ويرد بأدلة ذات صلة، ويتحقق من زوال المخاوف.",
          ],
          [
            "Separates real blockers from negotiating positions, anticipates objections before they arise, and gives no concession without getting something back.",
            "يميّز بين العوائق الحقيقية والمواقف التفاوضية، ويتوقع الاعتراضات قبل ظهورها، ولا يقدّم تنازلًا دون مقابل.",
          ],
          [
            "Uses objections to uncover new information about the decision, and turns a valid concern into a stronger solution designed with the customer.",
            "يستثمر الاعتراضات للكشف عن معلومات جديدة بشأن القرار، ويحوّل المخاوف المشروعة إلى حل أقوى يصمّمه مع العميل.",
          ],
        ],
      ),
      skill(
        "technical.sales.pipeline-forecasting",
        ["Pipeline management and forecasting", "إدارة مسار المبيعات والتنبؤ بها"],
        [
          "Tracking opportunities and forecasting revenue accurately enough for others to plan.",
          "متابعة الفرص والتنبؤ بالإيرادات بدقة كافية تمكّن الآخرين من التخطيط.",
        ],
        [
          [
            "Forecasts based on hope or the customer's friendliness, with no evidence of buying steps.",
            "يبني تنبؤاته على الأمل أو على ودّ العميل، دون أدلة على تقدّم فعلي في خطوات الشراء.",
          ],
          [
            "Tracks deals by stage but does not question optimistic stages or slipping dates.",
            "يتابع الصفقات بحسب مراحلها، لكنه لا يراجع المراحل المبالغ في تفاؤلها ولا المواعيد التي تتأخر.",
          ],
          [
            "Bases each forecast on verified customer actions, flags at-risk deals, and keeps enough opportunities to reach the target.",
            "يبني كل تنبؤ على إجراءات مؤكدة من العميل، وينبّه إلى الصفقات المعرّضة للخطر، ويحافظ على عدد كافٍ من الفرص لبلوغ المستهدف.",
          ],
          [
            "Uses conversion rates and deal age to test the forecast, explains the range of likely outcomes, and acts early to cover gaps.",
            "يستخدم معدلات التحويل وعمر الصفقات لاختبار التنبؤ، ويوضّح نطاق النتائج المحتملة، ويتصرّف مبكرًا لسدّ الفجوات.",
          ],
          [
            "Detects patterns behind lost or stalled deals, such as a missing stakeholder, and changes the sales approach rather than just the forecast.",
            "يرصد الأنماط وراء الصفقات الخاسرة أو المتعثرة، مثل غياب أحد أصحاب المصلحة، ويغيّر أسلوب البيع لا التنبؤ وحده.",
          ],
        ],
      ),
      skill(
        "technical.sales.negotiation",
        ["Negotiation and closing", "التفاوض وإتمام الصفقات"],
        [
          "Reaching agreements that protect value for both sides and get deals signed.",
          "التوصّل إلى اتفاقات تحفظ القيمة للطرفين وتنتهي بتوقيع الصفقات.",
        ],
        [
          [
            "Concedes on price or terms quickly to close, or makes demands without regard for the customer's position.",
            "يتنازل سريعًا في السعر أو الشروط لإتمام الصفقة، أو يفرض مطالب دون اعتبار لموقف العميل.",
          ],
          [
            "Prepares a target price but has no walk-away point or items to trade.",
            "يحدّد سعرًا مستهدفًا، لكن ليس لديه حدّ للانسحاب ولا بنود قابلة للمبادلة.",
          ],
          [
            "Prepares goals, limits and possible trades in advance, understands the customer's priorities, and closes with clear next steps.",
            "يحدّد مسبقًا أهدافه وحدوده والمبادلات الممكنة، ويفهم أولويات العميل، ويختم بخطوات تالية واضحة.",
          ],
          [
            "Trades low-cost concessions for high-value gains, manages several decision makers, and protects margin while keeping the relationship strong.",
            "يقايض تنازلات منخفضة التكلفة بمكاسب عالية القيمة، ويتعامل مع عدة صانعي قرار، ويحافظ على هامش الربح مع الإبقاء على علاقة قوية.",
          ],
          [
            "Creates options that enlarge the deal for both sides, and recognises when walking away or restructuring serves the business better.",
            "يبتكر خيارات توسّع مكاسب الطرفين في الصفقة، ويدرك متى يكون الانسحاب أو إعادة هيكلة الصفقة أنفع للمؤسسة.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Marketing
  {
    key: "marketing",
    name: { en: "Marketing", ar: "التسويق" },
    keywords: [
      "marketing",
      "brand",
      "campaign",
      "digital marketing",
      "content marketing",
      "growth marketing",
      "demand generation",
      "seo",
      "social media",
      "تسويق",
      "التسويق الرقمي",
      "العلامة التجارية",
      "حملات",
      "التواصل الاجتماعي",
    ],
    domainWeights: weights(0.8, 0.7, 0.5, 0.4, 0.4, 0.9, 0.8, 0.6, 0.7),
    technicalSkills: [
      skill(
        "technical.mkt.audience-positioning",
        ["Audience and positioning", "فهم الجمهور وتحديد الموقع التنافسي"],
        [
          "Defining who the offer is for and why it is the better choice for them.",
          "تحديد الفئة التي يستهدفها العرض، والسبب الذي يجعله الخيار الأفضل لها.",
        ],
        [
          [
            "Targets everyone, or describes the audience only in broad demographics with no insight into their needs.",
            "يستهدف الجميع، أو يصف الجمهور بخصائص ديموغرافية عامة فقط دون فهم لاحتياجاته.",
          ],
          [
            "Defines a target segment but states benefits that competitors could equally claim.",
            "يحدّد شريحة مستهدفة، لكنه يذكر مزايا يستطيع المنافسون ادعاءها بالقدر نفسه.",
          ],
          [
            "Defines a specific segment by needs and behaviour, and states a clear, credible reason for it to choose this offer over alternatives.",
            "يحدّد شريحة بعينها بناءً على احتياجاتها وسلوكها، ويقدّم سببًا واضحًا ومقنعًا لاختيارها هذا العرض دون البدائل.",
          ],
          [
            "Supports positioning with customer and competitor evidence, prioritises segments by value, and tests messages before committing.",
            "يدعم تحديد الموقع التنافسي بأدلة من العملاء والمنافسين، ويرتّب الشرائح بحسب قيمتها، ويختبر الرسائل قبل اعتمادها.",
          ],
          [
            "Finds an underserved segment or unclaimed position others missed, and shows how it can be defended over time.",
            "يكتشف شريحة لا تحظى بخدمة كافية أو موقعًا لم يشغله أحد بعد، ويبيّن كيف يمكن الحفاظ عليه مع الوقت.",
          ],
        ],
      ),
      skill(
        "technical.mkt.campaign-planning",
        ["Campaign planning", "تخطيط الحملات"],
        [
          "Designing campaigns with clear goals, channels, messages and budgets.",
          "تصميم حملات ذات أهداف وقنوات ورسائل وميزانيات واضحة.",
        ],
        [
          [
            "Proposes activities without a goal, audience or way to measure results.",
            "يقترح أنشطة دون هدف أو جمهور محدد أو وسيلة لقياس النتائج.",
          ],
          [
            "Sets a goal and picks channels but does not explain why those channels fit the audience or budget.",
            "يحدّد هدفًا ويختار قنوات، لكنه لا يوضّح سبب ملاءمة هذه القنوات للجمهور أو الميزانية.",
          ],
          [
            "Links goal, audience, message, channels, budget and timeline into a coherent plan with measurable targets.",
            "يربط الهدف والجمهور والرسالة والقنوات والميزانية والجدول الزمني في خطة متماسكة ذات مستهدفات قابلة للقياس.",
          ],
          [
            "Allocates budget by expected return per channel, plans tests within the campaign, and sets rules for shifting spend.",
            "يوزّع الميزانية بحسب العائد المتوقع من كل قناة، ويخطط لاختبارات ضمن الحملة، ويضع قواعد لإعادة توزيع الإنفاق.",
          ],
          [
            "Designs the campaign to build lasting brand or customer value beyond the immediate target, and anticipates competitor and market responses.",
            "يصمّم الحملة لبناء قيمة دائمة للعلامة التجارية أو للعملاء تتجاوز المستهدف الآني، ويتوقع ردود فعل المنافسين والسوق.",
          ],
        ],
      ),
      skill(
        "technical.mkt.marketing-measurement",
        ["Marketing measurement", "قياس الأداء التسويقي"],
        [
          "Measuring marketing results and attributing them fairly to decide where to invest.",
          "قياس نتائج التسويق ونسبتها إلى مصادرها بإنصاف لتحديد مجالات الاستثمار.",
        ],
        [
          [
            "Reports activity such as impressions or clicks as success, without linking it to business outcomes.",
            "يعرض مؤشرات النشاط، مثل مرات الظهور أو النقرات، على أنها نجاح دون ربطها بنتائج الأعمال.",
          ],
          [
            "Tracks conversions but credits the last channel touched, or ignores what would have happened anyway.",
            "يتتبّع التحويلات، لكنه ينسبها إلى آخر قناة تفاعل معها العميل، أو يتجاهل ما كان سيحدث دون الحملة.",
          ],
          [
            "Measures cost per acquisition and return by channel against business goals, and uses the results to adjust spend.",
            "يقيس تكلفة اكتساب العميل والعائد من كل قناة في ضوء أهداف الأعمال، ويستخدم النتائج لتعديل الإنفاق.",
          ],
          [
            "Uses control groups or holdouts to estimate true lift, accounts for customer lifetime value, and explains measurement limits.",
            "يستخدم مجموعات ضابطة أو عينات مستبعدة لتقدير الأثر الفعلي، ويأخذ القيمة الدائمة للعميل في الحسبان، ويوضّح حدود القياس.",
          ],
          [
            "Combines several imperfect measurement methods into a credible picture, and spots when a metric is rewarding the wrong behaviour.",
            "يجمع بين عدة أساليب قياس غير مكتملة لتكوين صورة موثوقة، ويرصد متى يكافئ أحد المقاييس سلوكًا خاطئًا.",
          ],
        ],
      ),
      skill(
        "technical.mkt.content-messaging",
        ["Content and messaging", "المحتوى وصياغة الرسائل"],
        [
          "Creating messages and content that are clear, relevant and consistent with the brand.",
          "إعداد محتوى ورسائل واضحة وملائمة ومتّسقة مع هوية العلامة التجارية.",
        ],
        [
          [
            "Writes messages that are vague, inconsistent with the brand, or make claims the product cannot support.",
            "يكتب رسائل مبهمة أو غير متّسقة مع العلامة التجارية، أو تتضمن ادعاءات لا يستطيع المنتج الوفاء بها.",
          ],
          [
            "Produces clear content but with generic benefits that do not speak to the audience's specific concern.",
            "يُعدّ محتوى واضحًا لكن بمزايا عامة لا تخاطب الهمّ المحدد لدى الجمهور.",
          ],
          [
            "Writes messages that address the audience's need, include a clear call to action, and stay consistent with the brand across channels.",
            "يكتب رسائل تلبّي حاجة الجمهور، وتتضمن دعوة واضحة إلى اتخاذ إجراء، وتبقى متّسقة مع العلامة التجارية عبر القنوات.",
          ],
          [
            "Adapts the core message to each channel and stage of the buying journey, and tests variants to learn what works.",
            "يوائم الرسالة الأساسية مع كل قناة ومرحلة من رحلة الشراء، ويختبر صيغًا مختلفة لمعرفة الأنجع.",
          ],
          [
            "Develops a message framework others can apply consistently, and anticipates how messages may be misread across cultures or contexts.",
            "يطوّر إطارًا للرسائل يستطيع الآخرون تطبيقه باتساق، ويتوقع كيف قد يُساء فهم الرسائل في ثقافات أو سياقات مختلفة.",
          ],
        ],
      ),
      skill(
        "technical.mkt.growth-funnel",
        ["Funnel and growth optimisation", "تحسين مسار التحويل والنمو"],
        [
          "Finding and fixing where potential customers drop out between awareness and purchase.",
          "تحديد المراحل التي يتسرّب فيها العملاء المحتملون بين التعرّف على العرض والشراء، ومعالجتها.",
        ],
        [
          [
            "Proposes more traffic or spend as the answer to every growth problem, without looking at conversion.",
            "يقترح زيادة الزيارات أو الإنفاق حلًّا لكل مشكلة في النمو، دون النظر في معدلات التحويل.",
          ],
          [
            "Identifies a weak stage in the funnel but guesses at the reason rather than investigating it.",
            "يحدّد مرحلة ضعيفة في مسار التحويل، لكنه يخمّن سببها بدل البحث فيه.",
          ],
          [
            "Maps the funnel with conversion rates at each stage, finds the biggest drop-off, and proposes tests to improve it.",
            "يرسم مسار التحويل بمعدلات التحويل في كل مرحلة، ويحدّد أكبر نقطة تسرّب، ويقترح اختبارات لتحسينها.",
          ],
          [
            "Prioritises fixes by expected impact and effort, segments the funnel by channel or customer type, and checks that gains last.",
            "يرتّب الحلول بحسب الأثر المتوقع والجهد المطلوب، ويقسّم مسار التحويل بحسب القناة أو نوع العميل، ويتحقق من استدامة المكاسب.",
          ],
          [
            "Finds growth levers beyond the funnel, such as referral or retention loops, and spots when short-term conversion gains damage long-term value.",
            "يكتشف روافع للنمو خارج مسار التحويل، مثل حلقات الإحالة أو الاحتفاظ بالعملاء، ويدرك متى تضرّ مكاسب التحويل قصيرة الأجل بالقيمة على المدى البعيد.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Operations
  {
    key: "operations",
    name: { en: "Operations", ar: "العمليات" },
    keywords: [
      "operations manager",
      "operations",
      "process improvement",
      "lean",
      "six sigma",
      "supply chain",
      "logistics",
      "quality control",
      "service delivery",
      "kpi",
      "إدارة العمليات",
      "العمليات",
      "تحسين العمليات",
      "سلسلة الإمداد",
      "مراقبة الجودة",
    ],
    domainWeights: weights(0.8, 0.7, 0.8, 0.6, 0.9, 0.6, 0.3, 0.7, 0.7),
    technicalSkills: [
      skill(
        "technical.ops.process-design",
        ["Process design and improvement", "تصميم العمليات وتحسينها"],
        [
          "Mapping how work flows and redesigning it to remove waste, delay and error.",
          "رسم مسار سير العمل وإعادة تصميمه للتخلص من الهدر والتأخير والأخطاء.",
        ],
        [
          [
            "Proposes changes without understanding the current process, or blames people for problems built into the process.",
            "يقترح تغييرات دون فهم العملية الحالية، أو يحمّل الأفراد مسؤولية مشكلات متأصلة في العملية نفسها.",
          ],
          [
            "Describes the current process and suggests improvements, but without data on where time or errors actually occur.",
            "يصف العملية الحالية ويقترح تحسينات، لكن دون بيانات عن المواضع التي يضيع فيها الوقت أو تقع فيها الأخطاء فعلًا.",
          ],
          [
            "Maps the process with volumes and times, identifies the main sources of waste or error, and proposes changes with expected benefits.",
            "يرسم العملية مع الكميات والأزمنة، ويحدّد أبرز مصادر الهدر أو الخطأ، ويقترح تغييرات مع فوائدها المتوقعة.",
          ],
          [
            "Separates root causes from symptoms, pilots changes before scaling, and plans how staff will adopt the new way of working.",
            "يميّز بين الأسباب الجذرية والأعراض، ويجرّب التغييرات على نطاق محدود قبل تعميمها، ويخطط لكيفية تبنّي الموظفين لطريقة العمل الجديدة.",
          ],
          [
            "Redesigns the process end to end across team boundaries, removing whole steps rather than speeding them up, and builds in continuous improvement.",
            "يعيد تصميم العملية من بدايتها إلى نهايتها متجاوزًا الحدود بين الفرق، فيلغي خطوات كاملة بدل تسريعها، ويرسّخ التحسين المستمر.",
          ],
        ],
      ),
      skill(
        "technical.ops.capacity-planning",
        ["Capacity and resource planning", "تخطيط الطاقة الاستيعابية والموارد"],
        [
          "Matching people, equipment and time to expected demand.",
          "مواءمة الأفراد والمعدات والوقت مع الطلب المتوقع.",
        ],
        [
          [
            "Plans without estimating demand, or assumes current staff can absorb any increase.",
            "يخطط دون تقدير للطلب، أو يفترض أن الموظفين الحاليين قادرون على استيعاب أي زيادة.",
          ],
          [
            "Estimates demand roughly but plans for an average day, ignoring peaks and variation.",
            "يقدّر الطلب تقديرًا تقريبيًا، لكنه يخطط ليوم متوسط ويتجاهل أوقات الذروة والتفاوت.",
          ],
          [
            "Forecasts demand including peaks, calculates the capacity needed, and identifies the gap with options to close it.",
            "يتنبأ بالطلب بما في ذلك أوقات الذروة، ويحسب الطاقة الاستيعابية اللازمة، ويحدّد الفجوة مع خيارات لسدّها.",
          ],
          [
            "Identifies the true bottleneck, compares options such as overtime, temporary staff or rescheduling on cost and risk, and plans buffers.",
            "يحدّد نقطة الاختناق الفعلية، ويقارن بين خيارات مثل العمل الإضافي أو العمالة المؤقتة أو إعادة الجدولة من حيث التكلفة والمخاطر، ويخطط لهوامش احتياطية.",
          ],
          [
            "Influences demand as well as supply, for example through scheduling or service levels, and designs capacity that adapts quickly to change.",
            "يؤثر في الطلب لا في العرض وحده، من خلال الجدولة أو مستويات الخدمة مثلًا، ويصمّم طاقة استيعابية تتكيّف سريعًا مع التغيّرات.",
          ],
        ],
      ),
      skill(
        "technical.ops.kpi-management",
        ["Operational metrics and performance", "المؤشرات التشغيلية وإدارة الأداء"],
        [
          "Using operational KPIs to monitor performance and act before problems grow.",
          "استخدام مؤشرات الأداء التشغيلية لمراقبة الأداء والتصرّف قبل تفاقم المشكلات.",
        ],
        [
          [
            "Relies on impressions of how things are going rather than any measured indicator.",
            "يعتمد على انطباعاته عن سير العمل بدل أي مؤشر مقيس.",
          ],
          [
            "Tracks some KPIs but reacts only after targets are missed, or tracks too many to act on.",
            "يتابع بعض مؤشرات الأداء، لكنه لا يتصرف إلا بعد الإخفاق في بلوغ المستهدفات، أو يتابع عددًا كبيرًا منها يتعذّر التصرّف بناءً عليه.",
          ],
          [
            "Tracks a focused set of KPIs covering speed, quality and cost, sets thresholds, and acts when a trend moves the wrong way.",
            "يتابع مجموعة مركّزة من المؤشرات تغطي السرعة والجودة والتكلفة، ويضع حدودًا للتنبيه، ويتصرف حين يتجه أحد المؤشرات في الاتجاه الخاطئ.",
          ],
          [
            "Uses leading indicators to predict problems, investigates variation before reacting, and links KPIs to customer outcomes.",
            "يستعين بالمؤشرات الاستباقية للتنبؤ بالمشكلات، ويحلّل التفاوت قبل التصرف، ويربط المؤشرات بنتائج العملاء.",
          ],
          [
            "Notices when hitting a KPI is hurting the wider operation, and redesigns measures so teams improve the whole system.",
            "يلاحظ متى يضرّ بلوغ أحد المؤشرات بالعمليات الأوسع، ويعيد تصميم المقاييس بحيث تعمل الفرق على تحسين المنظومة بأكملها.",
          ],
        ],
      ),
      skill(
        "technical.ops.risk-continuity",
        ["Operational risk and continuity", "المخاطر التشغيلية واستمرارية الأعمال"],
        [
          "Anticipating disruptions and keeping essential services running when they occur.",
          "توقّع الاضطرابات والحفاظ على استمرار الخدمات الأساسية عند وقوعها.",
        ],
        [
          [
            "Responds to disruptions as they arise with no prior plan, or overlooks obvious single points of failure.",
            "يتعامل مع الاضطرابات عند وقوعها دون خطة مسبقة، أو يُغفل نقاطًا واضحة قد يؤدي تعطّل أيٍّ منها إلى توقف العمل.",
          ],
          [
            "Identifies likely risks but does not assess their impact or prepare specific responses.",
            "يحدّد المخاطر المحتملة، لكنه لا يقيّم أثرها ولا يُعدّ استجابات محددة لها.",
          ],
          [
            "Assesses risks by likelihood and impact, prepares contingency plans for the most serious, and defines who acts and when.",
            "يقيّم المخاطر بحسب احتمال وقوعها وأثرها، ويُعدّ خطط طوارئ لأخطرها، ويحدّد من يتصرف ومتى.",
          ],
          [
            "Tests contingency plans, protects critical customers and services first, and communicates clearly with stakeholders during a disruption.",
            "يختبر خطط الطوارئ، ويعطي الأولوية لحماية العملاء والخدمات الحيوية، ويتواصل بوضوح مع أصحاب المصلحة أثناء الاضطراب.",
          ],
          [
            "Spots hidden dependencies and cascading risks others miss, and builds resilience into the operation rather than relying on response plans.",
            "يرصد الاعتماديات الخفية والمخاطر المتسلسلة التي يغفل عنها غيره، ويبني المرونة في صلب العمليات بدل الاعتماد على خطط الاستجابة وحدها.",
          ],
        ],
      ),
      skill(
        "technical.ops.supplier-management",
        ["Supplier management", "إدارة الموردين"],
        [
          "Selecting, contracting and managing suppliers to meet cost, quality and service needs.",
          "اختيار الموردين والتعاقد معهم وإدارتهم بما يلبّي متطلبات التكلفة والجودة والخدمة.",
        ],
        [
          [
            "Chooses suppliers on price alone, or does not monitor performance after the contract is signed.",
            "يختار الموردين على أساس السعر وحده، أو لا يتابع أداءهم بعد توقيع العقد.",
          ],
          [
            "Compares suppliers on several factors but sets vague service levels that are hard to enforce.",
            "يقارن بين الموردين وفق عدة عوامل، لكنه يضع مستويات خدمة مبهمة يصعب إلزامهم بها.",
          ],
          [
            "Selects suppliers on total cost, quality and reliability, sets clear service levels, and reviews performance regularly.",
            "يختار الموردين بناءً على التكلفة الإجمالية والجودة والموثوقية، ويحدّد مستويات خدمة واضحة، ويراجع الأداء بانتظام.",
          ],
          [
            "Manages supplier risk with backups and contract terms, resolves performance problems through data-based discussion, and builds shared incentives.",
            "يدير مخاطر الموردين ببدائل احتياطية وشروط تعاقدية مناسبة، ويعالج مشكلات الأداء بنقاش قائم على البيانات، ويبني حوافز مشتركة.",
          ],
          [
            "Develops strategic partnerships that create value beyond cost savings, and anticipates market shifts that could weaken the supply base.",
            "يطوّر شراكات استراتيجية تحقق قيمة تتجاوز خفض التكاليف، ويتوقع تحوّلات السوق التي قد تُضعف قاعدة الموردين.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Finance
  {
    key: "finance",
    name: { en: "Finance and accounting", ar: "المالية والمحاسبة" },
    keywords: [
      "finance",
      "financial analyst",
      "accounting",
      "accountant",
      "fp&a",
      "budgeting",
      "financial reporting",
      "audit",
      "controller",
      "ifrs",
      "treasury",
      "محاسب",
      "محاسبة",
      "التخطيط المالي",
      "تحليل مالي",
      "الموازنة",
      "التقارير المالية",
    ],
    domainWeights: weights(1.0, 0.9, 0.8, 0.3, 0.4, 0.6, 0.2, 0.5, 0.5),
    technicalSkills: [
      skill(
        "technical.fin.financial-analysis",
        ["Financial analysis", "التحليل المالي"],
        [
          "Interpreting financial statements and performance to explain what is driving results.",
          "تفسير القوائم المالية والأداء لتوضيح العوامل المحرّكة للنتائج.",
        ],
        [
          [
            "Restates numbers from the statements without explaining what changed or why.",
            "يعيد ذكر الأرقام الواردة في القوائم دون توضيح ما تغيّر أو سبب تغيّره.",
          ],
          [
            "Calculates common ratios correctly but interprets them in isolation, without context or comparison.",
            "يحسب النسب المالية الشائعة بطريقة صحيحة، لكنه يفسّرها بمعزل عن السياق أو المقارنة.",
          ],
          [
            "Analyses trends and ratios against prior periods or peers, identifies the main drivers of results, and states their business implications.",
            "يحلّل الاتجاهات والنسب في ضوء الفترات السابقة أو الشركات المماثلة، ويحدّد أبرز محرّكات النتائج، ويبيّن انعكاساتها على الأعمال.",
          ],
          [
            "Separates one-off items from underlying performance, links profit to cash flow, and quantifies the effect of each driver.",
            "يفصل البنود غير المتكررة عن الأداء الأساسي، ويربط الأرباح بالتدفقات النقدية، ويقدّر أثر كل محرّك بالأرقام.",
          ],
          [
            "Spots warning signs others miss, such as working capital trends or accounting choices that flatter results, and explains what they mean for decisions.",
            "يرصد مؤشرات تحذيرية يغفل عنها غيره، مثل اتجاهات رأس المال العامل أو خيارات محاسبية تُظهر النتائج أفضل من حقيقتها، ويوضّح دلالتها على القرارات.",
          ],
        ],
      ),
      skill(
        "technical.fin.budgeting-forecasting",
        ["Budgeting and forecasting", "إعداد الموازنات والتنبؤ المالي"],
        [
          "Building budgets and forecasts on explicit assumptions and updating them as conditions change.",
          "إعداد الموازنات والتوقعات المالية على افتراضات صريحة، وتحديثها كلما تغيّرت الظروف.",
        ],
        [
          [
            "Copies last year's figures forward or sets numbers without stating any assumptions.",
            "ينقل أرقام العام الماضي كما هي، أو يضع أرقامًا دون ذكر أي افتراضات.",
          ],
          [
            "States assumptions but does not test them, or produces a single figure with no sense of the range.",
            "يذكر الافتراضات لكنه لا يختبرها، أو يقدّم رقمًا واحدًا دون إشارة إلى نطاق النتائج المحتملة.",
          ],
          [
            "Builds the forecast from clear drivers and assumptions, compares actuals to plan, and explains significant variances.",
            "يبني التوقعات على محرّكات وافتراضات واضحة، ويقارن الأرقام الفعلية بالخطة، ويفسّر الانحرافات الجوهرية.",
          ],
          [
            "Runs scenarios on the most sensitive assumptions, updates forecasts as new information arrives, and flags risks to the plan early.",
            "يُعدّ سيناريوهات للافتراضات الأكثر حساسية، ويحدّث التوقعات مع ورود معلومات جديدة، وينبّه مبكرًا إلى المخاطر التي تهدد الخطة.",
          ],
          [
            "Challenges optimistic assumptions from other departments with evidence, and designs forecasts that help leaders decide rather than just report.",
            "يراجع الافتراضات المتفائلة لدى الإدارات الأخرى بالأدلة، ويصمّم توقعات تساعد القادة على اتخاذ القرار لا على إعداد التقارير فحسب.",
          ],
        ],
      ),
      skill(
        "technical.fin.investment-appraisal",
        ["Investment and business case appraisal", "تقييم الاستثمارات ودراسات الجدوى"],
        [
          "Evaluating whether a project or spending decision creates value.",
          "تقييم مدى تحقيق مشروع أو قرار إنفاق لقيمة مضافة.",
        ],
        [
          [
            "Judges a proposal by its headline cost or revenue, ignoring timing, risk or ongoing costs.",
            "يحكم على المقترح من خلال تكلفته أو إيراداته الظاهرة فقط، متجاهلًا التوقيت والمخاطر والتكاليف المستمرة.",
          ],
          [
            "Calculates payback or a simple return but leaves out relevant costs or the time value of money.",
            "يحسب فترة الاسترداد أو عائدًا بسيطًا، لكنه يُغفل تكاليف ذات صلة أو القيمة الزمنية للنقود.",
          ],
          [
            "Compares incremental cash flows using an appropriate method such as net present value, and states the key assumptions and risks.",
            "يقارن التدفقات النقدية الإضافية باستخدام أسلوب مناسب مثل صافي القيمة الحالية، ويبيّن الافتراضات والمخاطر الرئيسية.",
          ],
          [
            "Tests sensitivity to the main assumptions, includes indirect costs and benefits, and compares the proposal with realistic alternatives.",
            "يختبر حساسية النتائج للافتراضات الرئيسية، ويدرج التكاليف والفوائد غير المباشرة، ويقارن المقترح ببدائل واقعية.",
          ],
          [
            "Identifies strategic or option value the numbers miss, and spots bias in how the business case was built.",
            "يحدّد القيمة الاستراتيجية أو قيمة الخيارات المستقبلية التي لا تُظهرها الأرقام، ويرصد التحيّز في طريقة إعداد دراسة الجدوى.",
          ],
        ],
      ),
      skill(
        "technical.fin.controls-compliance",
        ["Financial controls and compliance", "الرقابة المالية والامتثال"],
        [
          "Applying accounting standards and controls so financial information is accurate and protected.",
          "تطبيق المعايير المحاسبية وضوابط الرقابة لضمان دقة المعلومات المالية وحمايتها.",
        ],
        [
          [
            "Overlooks control weaknesses, or accepts an accounting treatment because it is convenient rather than correct.",
            "يتغاضى عن مواطن الضعف في الرقابة، أو يقبل معالجة محاسبية لأنها ملائمة لا لأنها صحيحة.",
          ],
          [
            "Knows the relevant rules but applies them mechanically, missing where a transaction needs professional judgment.",
            "يعرف القواعد ذات الصلة لكنه يطبّقها بطريقة آلية، فيُغفل المعاملات التي تستدعي اجتهادًا مهنيًا.",
          ],
          [
            "Applies the right accounting treatment and controls, documents the reasoning, and raises exceptions with the appropriate people.",
            "يطبّق المعالجة المحاسبية وضوابط الرقابة الصحيحة، ويوثّق مبرراته، ويرفع الحالات الاستثنائية إلى الأشخاص المعنيين.",
          ],
          [
            "Identifies control gaps that create fraud or error risk, proposes proportionate fixes, and explains the audit implications.",
            "يحدّد الثغرات الرقابية التي تُنشئ مخاطر احتيال أو خطأ، ويقترح معالجات متناسبة معها، ويوضّح انعكاساتها على التدقيق.",
          ],
          [
            "Anticipates how new processes or systems will weaken controls, and designs controls that protect accuracy without slowing the business.",
            "يتوقع كيف قد تُضعف العمليات أو الأنظمة الجديدة الضوابط الرقابية، ويصمّم ضوابط تحمي الدقة دون أن تبطئ سير الأعمال.",
          ],
        ],
      ),
      skill(
        "technical.fin.cash-management",
        ["Cash and working capital management", "إدارة النقد ورأس المال العامل"],
        [
          "Managing cash flow, receivables, payables and inventory to keep the business liquid.",
          "إدارة التدفقات النقدية والذمم المدينة والدائنة والمخزون للحفاظ على سيولة المؤسسة.",
        ],
        [
          [
            "Focuses only on profit and does not consider when cash actually comes in or goes out.",
            "يركّز على الأرباح وحدها ولا يراعي توقيت دخول النقد وخروجه فعليًا.",
          ],
          [
            "Notices a cash shortfall but proposes a single fix without assessing its cost or side effects.",
            "يلاحظ عجزًا في النقد، لكنه يقترح حلًا واحدًا دون تقييم تكلفته أو آثاره الجانبية.",
          ],
          [
            "Builds a short-term cash forecast, identifies the drivers of working capital, and proposes practical actions on collections, payments or stock.",
            "يُعدّ توقعات نقدية قصيرة الأجل، ويحدّد محرّكات رأس المال العامل، ويقترح إجراءات عملية في التحصيل أو السداد أو المخزون.",
          ],
          [
            "Weighs the cost of each cash lever, including its effect on supplier and customer relationships, and keeps a suitable buffer for uncertainty.",
            "يوازن بين تكلفة كل أداة لتحسين النقد، بما في ذلك أثرها في العلاقة مع الموردين والعملاء، ويحتفظ بهامش احتياطي مناسب لمواجهة عدم اليقين.",
          ],
          [
            "Detects structural cash problems hidden by growth or timing, and redesigns terms or processes to fix them durably.",
            "يكتشف مشكلات نقدية هيكلية يخفيها النمو أو التوقيت، ويعيد تصميم الشروط أو العمليات لمعالجتها معالجة دائمة.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── People and HR
  {
    key: "people-hr",
    name: { en: "People and HR", ar: "الموارد البشرية" },
    keywords: [
      "human resources",
      "hr manager",
      "hr business partner",
      "hrbp",
      "talent acquisition",
      "recruitment",
      "recruiter",
      "people operations",
      "employee relations",
      "compensation",
      "learning and development",
      "الموارد البشرية",
      "التوظيف",
      "استقطاب المواهب",
      "شؤون الموظفين",
      "علاقات الموظفين",
    ],
    domainWeights: weights(0.8, 0.6, 0.9, 0.5, 0.6, 0.9, 0.3, 0.9, 0.6),
    technicalSkills: [
      skill(
        "technical.hr.talent-acquisition",
        ["Recruitment and selection", "الاستقطاب والاختيار"],
        [
          "Attracting and selecting candidates fairly, using evidence about what the role requires.",
          "استقطاب المرشحين واختيارهم بإنصاف استنادًا إلى أدلة على متطلبات الدور.",
        ],
        [
          [
            "Selects on impressions or similarity to existing staff, with no defined criteria.",
            "يختار المرشحين بناءً على الانطباعات أو مدى تشابههم مع الموظفين الحاليين، دون معايير محددة.",
          ],
          [
            "Defines criteria but uses unstructured interviews or asks candidates different questions.",
            "يحدّد معايير، لكنه يجري مقابلات غير منظّمة أو يطرح أسئلة مختلفة على المرشحين.",
          ],
          [
            "Defines role requirements, uses structured interviews or work samples scored against criteria, and gives every candidate a consistent process.",
            "يحدّد متطلبات الدور، ويستخدم مقابلات منظّمة أو نماذج عمل تُقيَّم وفق معايير محددة، ويُخضع جميع المرشحين لإجراءات متّسقة.",
          ],
          [
            "Identifies and reduces sources of bias, tracks the quality and diversity of hires, and adjusts sourcing where the candidate flow is weak.",
            "يحدّد مصادر التحيّز ويحدّ منها، ويتابع جودة التعيينات وتنوّعها، ويعدّل مصادر الاستقطاب حين يضعف تدفق المرشحين.",
          ],
          [
            "Questions whether the role is defined correctly at all, and designs selection methods that predict performance better than common practice.",
            "يراجع مدى صحة تعريف الدور من الأساس، ويصمّم أساليب اختيار تتنبأ بالأداء على نحو أفضل من الممارسة الشائعة.",
          ],
        ],
      ),
      skill(
        "technical.hr.employee-relations",
        ["Employee relations and casework", "علاقات الموظفين ومعالجة القضايا"],
        [
          "Handling grievances, conduct and performance cases fairly and in line with policy and law.",
          "معالجة التظلمات وقضايا السلوك والأداء بإنصاف ووفق السياسات والقوانين.",
        ],
        [
          [
            "Takes sides early, skips the investigation, or ignores policy and legal requirements.",
            "ينحاز إلى أحد الطرفين مبكرًا، أو يتخطى التحقيق، أو يتجاهل متطلبات السياسات والقوانين.",
          ],
          [
            "Follows the policy steps but does not hear all sides fully or document decisions.",
            "يتبع خطوات السياسة، لكنه لا يستمع إلى جميع الأطراف بالكامل ولا يوثّق القرارات.",
          ],
          [
            "Gathers facts from all parties, applies policy consistently, documents decisions, and keeps the process confidential and timely.",
            "يجمع الحقائق من جميع الأطراف، ويطبّق السياسة باتساق، ويوثّق القرارات، ويحافظ على سرية الإجراءات وإنجازها في وقتها.",
          ],
          [
            "Assesses legal and reputational risk, balances fairness to the individual with team impact, and advises managers on how to act.",
            "يقيّم المخاطر القانونية ومخاطر السمعة، ويوازن بين إنصاف الفرد وأثر القضية في الفريق، ويرشد المديرين إلى طريقة التصرف.",
          ],
          [
            "Spots patterns across cases that point to wider culture or management issues, and addresses those causes rather than single cases.",
            "يرصد أنماطًا متكررة عبر القضايا تشير إلى مشكلات أوسع في ثقافة العمل أو الإدارة، ويعالج تلك الأسباب لا القضايا الفردية وحدها.",
          ],
        ],
      ),
      skill(
        "technical.hr.performance-development",
        ["Performance and development systems", "أنظمة الأداء والتطوير"],
        [
          "Designing goals, reviews and development that help people improve.",
          "تصميم الأهداف والمراجعات وبرامج التطوير التي تساعد الموظفين على التحسّن.",
        ],
        [
          [
            "Treats performance reviews as an annual form to complete, with no link to goals or development.",
            "يتعامل مع تقييم الأداء على أنه نموذج سنوي يجب استكماله، دون ربطه بالأهداف أو التطوير.",
          ],
          [
            "Sets goals and reviews but with vague criteria, so ratings depend mainly on the manager.",
            "يضع أهدافًا ويجري مراجعات، لكن بمعايير مبهمة تجعل التقييمات معتمدة أساسًا على المدير.",
          ],
          [
            "Sets clear, measurable goals, uses evidence-based reviews with regular feedback, and links results to development plans.",
            "يضع أهدافًا واضحة وقابلة للقياس، ويجري مراجعات قائمة على الأدلة مع ملاحظات منتظمة، ويربط النتائج بخطط التطوير.",
          ],
          [
            "Calibrates ratings across managers to reduce bias, targets development at the skills that matter most, and measures whether it works.",
            "يوحّد معايير التقييم بين المديرين للحدّ من التحيّز، ويوجّه التطوير نحو أهم المهارات، ويقيس مدى فاعليته.",
          ],
          [
            "Designs systems that drive real improvement rather than paperwork, and anticipates how incentives will shape behaviour.",
            "يصمّم أنظمة تحقق تحسّنًا فعليًا لا مجرد إجراءات ورقية، ويتوقع كيف ستوجّه الحوافز سلوك الموظفين.",
          ],
        ],
      ),
      skill(
        "technical.hr.reward",
        ["Compensation and reward", "التعويضات والمكافآت"],
        [
          "Setting pay and benefits that are fair, competitive and affordable.",
          "تحديد رواتب ومزايا منصفة وتنافسية وفي حدود الإمكانات.",
        ],
        [
          [
            "Sets pay by negotiation or precedent alone, without reference to market data or internal fairness.",
            "يحدّد الرواتب بالتفاوض أو بالسوابق وحدها، دون الرجوع إلى بيانات السوق أو مراعاة العدالة الداخلية.",
          ],
          [
            "Uses market data but does not check for unfair gaps between people in similar roles.",
            "يستخدم بيانات السوق، لكنه لا يتحقق من وجود فجوات غير منصفة بين أصحاب الأدوار المتشابهة.",
          ],
          [
            "Benchmarks against relevant market data, checks internal equity, and recommends pay within budget with a clear rationale.",
            "يقارن بالبيانات ذات الصلة في السوق، ويتحقق من العدالة الداخلية، ويوصي برواتب ضمن الموازنة مع مبرر واضح.",
          ],
          [
            "Explains the long-term cost and precedent of pay decisions, identifies and closes pay gaps, and balances cash with non-cash reward.",
            "يوضّح التكلفة طويلة الأجل لقرارات الرواتب وما ترسيه من سوابق، ويحدّد فجوات الأجور ويعالجها، ويوازن بين المكافآت النقدية وغير النقدية.",
          ],
          [
            "Designs reward structures that support the strategy, and anticipates unintended behaviour they could encourage.",
            "يصمّم هياكل للمكافآت تدعم الاستراتيجية، ويتوقع السلوكيات غير المقصودة التي قد تشجّع عليها.",
          ],
        ],
      ),
      skill(
        "technical.hr.org-change",
        ["Organisation design and change", "التصميم التنظيمي وإدارة التغيير"],
        [
          "Structuring teams and leading people through organisational change.",
          "هيكلة الفرق وقيادة الموظفين خلال التغيير التنظيمي.",
        ],
        [
          [
            "Announces structural changes without explaining the reasons or considering the effects on people.",
            "يعلن تغييرات هيكلية دون توضيح أسبابها أو مراعاة أثرها في الموظفين.",
          ],
          [
            "Explains the change but plans communication as a single announcement, with little support for those affected.",
            "يشرح التغيير، لكنه يخطط للتواصل في صورة إعلان واحد، مع دعم محدود للمتأثرين به.",
          ],
          [
            "Links the new structure to business goals, plans communication and support for affected staff, and follows legal and policy requirements.",
            "يربط الهيكل الجديد بأهداف الأعمال، ويخطط للتواصل مع الموظفين المتأثرين ودعمهم، ويلتزم بمتطلبات القوانين والسياسات.",
          ],
          [
            "Anticipates resistance and its causes, involves key people early, and tracks adoption and morale after the change.",
            "يتوقع مقاومة التغيير وأسبابها، ويُشرك الأشخاص المؤثرين مبكرًا، ويتابع مدى تبنّي التغيير والروح المعنوية بعده.",
          ],
          [
            "Questions whether structure is the real problem, and designs changes that fix underlying issues such as unclear decision rights.",
            "يتساءل عمّا إذا كان الهيكل هو المشكلة الفعلية، ويصمّم تغييرات تعالج المشكلات الكامنة مثل غموض صلاحيات اتخاذ القرار.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Customer success
  {
    key: "customer-success",
    name: { en: "Customer success and support", ar: "نجاح العملاء ودعمهم" },
    keywords: [
      "customer success",
      "customer support",
      "customer service",
      "customer experience",
      "client services",
      "account manager",
      "onboarding",
      "retention",
      "churn",
      "help desk",
      "نجاح العملاء",
      "خدمة العملاء",
      "دعم العملاء",
      "تجربة العملاء",
      "الاحتفاظ بالعملاء",
    ],
    domainWeights: weights(0.8, 0.6, 0.7, 0.4, 0.4, 1.0, 0.5, 0.8, 0.7),
    technicalSkills: [
      skill(
        "technical.cs.onboarding-adoption",
        ["Onboarding and adoption", "تهيئة العملاء وتعزيز استخدامهم للمنتج"],
        [
          "Helping new customers reach value quickly and use the product well.",
          "مساعدة العملاء الجدد على تحقيق القيمة بسرعة واستخدام المنتج استخدامًا فعّالًا.",
        ],
        [
          [
            "Gives every customer the same generic setup without asking what they want to achieve.",
            "يقدّم لجميع العملاء الإعداد العام نفسه دون أن يسألهم عمّا يريدون تحقيقه.",
          ],
          [
            "Asks about goals but plans onboarding around product features rather than the customer's outcomes.",
            "يسأل عن الأهداف، لكنه يبني خطة التهيئة حول ميزات المنتج لا حول النتائج التي يريدها العميل.",
          ],
          [
            "Agrees success goals with the customer, plans onboarding steps to reach them, and tracks usage to confirm progress.",
            "يتفق مع العميل على أهداف النجاح، ويخطط لخطوات التهيئة اللازمة لبلوغها، ويتابع بيانات الاستخدام للتأكد من التقدّم.",
          ],
          [
            "Identifies the milestones that predict long-term success, removes blockers early, and adapts the approach to the customer's capacity.",
            "يحدّد المحطات التي تُنبئ بالنجاح على المدى البعيد، ويزيل العوائق مبكرًا، ويوائم أسلوبه مع قدرات العميل.",
          ],
          [
            "Spots adoption problems rooted in the customer's own processes or internal politics, and helps them make changes that last.",
            "يرصد مشكلات الاستخدام النابعة من إجراءات العميل نفسه أو من التوازنات الداخلية لديه، ويساعده على إجراء تغييرات دائمة.",
          ],
        ],
      ),
      skill(
        "technical.cs.issue-resolution",
        ["Issue resolution and escalation", "حل المشكلات وتصعيدها"],
        [
          "Resolving customer problems quickly and correctly, and escalating when needed.",
          "حل مشكلات العملاء بسرعة وبطريقة صحيحة، وتصعيدها عند الحاجة.",
        ],
        [
          [
            "Gives a generic answer or promise without understanding the problem or checking whether the promise can be kept.",
            "يقدّم إجابة عامة أو وعدًا دون أن يفهم المشكلة أو يتحقق من إمكانية الوفاء بالوعد.",
          ],
          [
            "Diagnoses the immediate problem but does not set expectations on timing or follow up after handing it on.",
            "يشخّص المشكلة الآنية، لكنه لا يحدّد للعميل توقعات واضحة عن التوقيت، ولا يتابعها بعد إحالتها.",
          ],
          [
            "Clarifies the problem and its impact, resolves or escalates it with full context, and keeps the customer informed until it is closed.",
            "يوضّح المشكلة وأثرها، ويحلّها أو يصعّدها مع تقديم السياق كاملًا، ويُبقي العميل على اطلاع حتى إغلاقها.",
          ],
          [
            "Prioritises by business impact rather than by who complains most, and works with product or engineering to fix the cause.",
            "يرتّب الأولويات بحسب الأثر في أعمال العميل لا بحسب من يشتكي أكثر، ويعمل مع فريق المنتج أو الهندسة لمعالجة السبب.",
          ],
          [
            "Notices patterns across tickets that signal a wider issue, and turns a failure into a chance to strengthen the customer's trust.",
            "يلاحظ أنماطًا متكررة عبر طلبات الدعم تشير إلى مشكلة أوسع، ويحوّل الإخفاق إلى فرصة لتعزيز ثقة العميل.",
          ],
        ],
      ),
      skill(
        "technical.cs.account-health",
        ["Account health and retention", "صحة الحساب والاحتفاظ بالعملاء"],
        [
          "Monitoring signs that a customer may leave and acting before they do.",
          "مراقبة المؤشرات الدالة على احتمال فقدان العميل، والتصرف قبل أن يغادر.",
        ],
        [
          [
            "Learns of risk only when the customer complains or announces they will leave.",
            "لا يعلم بالخطر إلا حين يشتكي العميل أو يعلن نيته المغادرة.",
          ],
          [
            "Watches one signal such as usage, but misses others like a change of sponsor or unresolved issues.",
            "يراقب مؤشرًا واحدًا مثل الاستخدام، لكنه يُغفل مؤشرات أخرى كتغيّر الراعي لدى العميل أو تراكم المشكلات غير المحلولة.",
          ],
          [
            "Tracks several health indicators, identifies at-risk accounts early, and agrees a specific recovery plan for each.",
            "يتابع عدة مؤشرات لصحة الحساب، ويحدّد الحسابات المعرّضة للخطر مبكرًا، ويتفق على خطة تعافٍ محددة لكل منها.",
          ],
          [
            "Distinguishes customers likely to leave from those who need attention, focuses effort where value is highest, and tests what actually reduces churn.",
            "يميّز بين العملاء المرجّح مغادرتهم ومن يحتاجون إلى مزيد من الاهتمام، ويركّز جهوده حيث القيمة أعلى، ويختبر ما يقلّل معدل فقدان العملاء فعلًا.",
          ],
          [
            "Finds the underlying reasons accounts fail, such as poor fit at the point of sale, and influences sales and product teams to prevent them.",
            "يكتشف الأسباب الكامنة وراء تعثّر الحسابات، مثل ضعف الملاءمة منذ البيع، ويؤثر في فريقي المبيعات والمنتج لمنعها.",
          ],
        ],
      ),
      skill(
        "technical.cs.renewal-expansion",
        ["Renewal and expansion", "التجديد والتوسّع"],
        [
          "Securing renewals and growing accounts by demonstrating value.",
          "ضمان تجديد العقود وتوسيع الحسابات من خلال إثبات القيمة.",
        ],
        [
          [
            "Raises renewal or additional sales only at the deadline, with no evidence of value delivered.",
            "لا يطرح التجديد أو البيع الإضافي إلا عند حلول الموعد، ودون أي دليل على القيمة المحققة.",
          ],
          [
            "Presents usage figures at renewal but does not connect them to the customer's goals.",
            "يعرض أرقام الاستخدام عند التجديد، لكنه لا يربطها بأهداف العميل.",
          ],
          [
            "Reviews value against agreed goals well before renewal, and proposes expansion where it meets a real customer need.",
            "يراجع القيمة المحققة في ضوء الأهداف المتفق عليها قبل موعد التجديد بوقت كافٍ، ويقترح التوسّع حيث يلبّي حاجة فعلية لدى العميل.",
          ],
          [
            "Builds relationships with several decision makers, quantifies the customer's return, and handles price discussions without damaging trust.",
            "يبني علاقات مع عدة صانعي قرار، ويقدّر العائد الذي يحققه العميل بالأرقام، ويدير نقاشات الأسعار دون الإضرار بالثقة.",
          ],
          [
            "Identifies new value the customer has not recognised, and declines expansion that would not serve them.",
            "يكشف قيمة جديدة لم يدركها العميل بعد، ويمتنع عن توسّع لا يخدم مصلحته.",
          ],
        ],
      ),
      skill(
        "technical.cs.voice-of-customer",
        ["Voice of the customer", "إيصال صوت العميل"],
        [
          "Turning customer feedback into evidence that improves the product and service.",
          "تحويل ملاحظات العملاء إلى أدلة تُسهم في تحسين المنتج والخدمة.",
        ],
        [
          [
            "Passes on individual complaints as they come, without context or any sense of how common they are.",
            "ينقل الشكاوى الفردية كما تصل، دون سياق أو إشارة إلى مدى شيوعها.",
          ],
          [
            "Groups feedback into themes but without data on frequency or business impact.",
            "يصنّف الملاحظات في محاور، لكن دون بيانات عن تكرارها أو أثرها في الأعمال.",
          ],
          [
            "Summarises feedback themes with frequency, affected customers and revenue at risk, and shares them with the teams who can act.",
            "يلخّص محاور الملاحظات مع تكرارها والعملاء المتأثرين والإيرادات المعرّضة للخطر، ويشاركها مع الفرق القادرة على التصرف.",
          ],
          [
            "Separates what customers ask for from the problem behind the request, and follows up to confirm whether changes solved it.",
            "يميّز بين ما يطلبه العملاء والمشكلة الكامنة وراء طلبهم، ويتابع للتأكد من أن التغييرات عالجتها.",
          ],
          [
            "Detects emerging needs early from weak signals across customers, and shapes product or service priorities with evidence others accept.",
            "يرصد الاحتياجات الناشئة مبكرًا من إشارات ضعيفة لدى عدد من العملاء، ويؤثر في أولويات المنتج أو الخدمة بأدلة يقبلها الآخرون.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── Project management
  {
    key: "project-management",
    name: { en: "Project and programme management", ar: "إدارة المشاريع والبرامج" },
    keywords: [
      "project manager",
      "project management",
      "programme manager",
      "program manager",
      "delivery manager",
      "scrum master",
      "agile",
      "pmp",
      "prince2",
      "pmo",
      "مدير مشروع",
      "مدير مشاريع",
      "إدارة المشاريع",
      "إدارة البرامج",
    ],
    domainWeights: weights(0.7, 0.6, 0.8, 0.6, 1.0, 0.8, 0.3, 0.8, 0.7),
    technicalSkills: [
      skill(
        "technical.proj.scope-planning",
        ["Scope and schedule planning", "تخطيط النطاق والجدول الزمني"],
        [
          "Defining scope, breaking work down and building realistic schedules.",
          "تحديد النطاق وتقسيم العمل وبناء جداول زمنية واقعية.",
        ],
        [
          [
            "Accepts deadlines and scope as given without breaking down the work or checking feasibility.",
            "يقبل المواعيد النهائية والنطاق كما هي، دون تقسيم العمل أو التحقق من إمكانية التنفيذ.",
          ],
          [
            "Lists tasks and dates but ignores dependencies, or uses estimates without input from the people doing the work.",
            "يعدّد المهام والمواعيد، لكنه يتجاهل الاعتماديات، أو يعتمد تقديرات دون الرجوع إلى المنفّذين.",
          ],
          [
            "Defines scope and deliverables, breaks work into estimated tasks with dependencies, and identifies the critical path.",
            "يحدّد النطاق والمخرجات، ويقسّم العمل إلى مهام مقدّرة مع اعتمادياتها، ويحدّد المسار الحرج.",
          ],
          [
            "Builds in contingency based on risk, tests the schedule against resource limits, and agrees clear criteria for scope changes.",
            "يضمّن هوامش احتياطية بناءً على المخاطر، ويختبر الجدول الزمني في ضوء قيود الموارد، ويتفق على معايير واضحة لتغيير النطاق.",
          ],
          [
            "Restructures the plan to deliver value earlier or reduce critical dependencies, and explains schedule confidence in terms leaders can use.",
            "يعيد هيكلة الخطة لتحقيق القيمة في وقت أبكر أو لتقليص الاعتماديات الحرجة، ويشرح مستوى الثقة في الجدول الزمني بعبارات يستطيع القادة البناء عليها.",
          ],
        ],
      ),
      skill(
        "technical.proj.risk-issue",
        ["Risk and issue management", "إدارة المخاطر والمشكلات"],
        [
          "Identifying, tracking and acting on project risks and issues.",
          "تحديد مخاطر المشروع ومشكلاته ومتابعتها والتصرف حيالها.",
        ],
        [
          [
            "Reacts to problems only once they have delayed the project, with no list of risks.",
            "لا يتعامل مع المشكلات إلا بعد أن تؤخر المشروع، ولا يملك قائمة بالمخاطر.",
          ],
          [
            "Keeps a risk list but rates risks vaguely and assigns no owners or actions.",
            "يحتفظ بقائمة للمخاطر، لكنه يقيّمها بصورة مبهمة ولا يحدّد لها مسؤولين أو إجراءات.",
          ],
          [
            "Rates risks by probability and impact, assigns owners and responses, and escalates issues with options and a recommendation.",
            "يقيّم المخاطر بحسب احتمالها وأثرها، ويحدّد لكل منها مسؤولًا واستجابة، ويصعّد المشكلات مع خيارات وتوصية.",
          ],
          [
            "Reviews risks regularly as the project changes, sets trigger points for contingency plans, and links risks to schedule and budget.",
            "يراجع المخاطر بانتظام مع تغيّر المشروع، ويحدّد نقاطًا لتفعيل خطط الطوارئ، ويربط المخاطر بالجدول الزمني والموازنة.",
          ],
          [
            "Spots systemic risks such as overloaded shared resources or habitual optimism, and addresses them before they become issues.",
            "يرصد المخاطر المنهجية، مثل الضغط الزائد على الموارد المشتركة أو التفاؤل المفرط المعتاد، ويعالجها قبل أن تتحول إلى مشكلات.",
          ],
        ],
      ),
      skill(
        "technical.proj.status-governance",
        ["Status reporting and governance", "تقارير الحالة والحوكمة"],
        [
          "Keeping sponsors and stakeholders accurately informed and decisions moving.",
          "إبقاء رعاة المشروع وأصحاب المصلحة على اطلاع دقيق، وضمان اتخاذ القرارات في وقتها.",
        ],
        [
          [
            "Reports the project as on track until problems can no longer be hidden, or gives updates without clear facts.",
            "يُظهر المشروع على أنه يسير وفق الخطة حتى يتعذّر إخفاء المشكلات، أو يقدّم تحديثات دون حقائق واضحة.",
          ],
          [
            "Reports progress against plan accurately but does not highlight the decisions needed from stakeholders.",
            "يعرض التقدّم مقارنة بالخطة بدقة، لكنه لا يُبرز القرارات المطلوبة من أصحاب المصلحة.",
          ],
          [
            "Gives honest status on scope, schedule and budget, highlights risks, and states clearly which decisions are needed and by when.",
            "يقدّم حالة صادقة للمشروع من حيث النطاق والجدول الزمني والموازنة، ويُبرز المخاطر، ويحدّد بوضوح القرارات المطلوبة ومواعيدها.",
          ],
          [
            "Tailors reporting to each audience, raises bad news early with options, and uses governance forums to resolve conflicts quickly.",
            "يوائم التقارير مع كل جمهور، ويطرح الأخبار السيئة مبكرًا مع خيارات للتعامل معها، ويستفيد من منتديات الحوكمة لحسم الخلافات بسرعة.",
          ],
          [
            "Anticipates where stakeholder interests will clash, and designs decision processes that keep the project moving without hiding problems.",
            "يتوقع مواضع تعارض مصالح أصحاب المصلحة، ويصمّم آليات لاتخاذ القرار تُبقي المشروع في تقدّم دون إخفاء المشكلات.",
          ],
        ],
      ),
      skill(
        "technical.proj.delivery-methods",
        ["Delivery methods", "منهجيات التنفيذ"],
        [
          "Choosing and adapting predictive, agile or hybrid methods to fit the project.",
          "اختيار المنهجيات التنبؤية أو الرشيقة أو الهجينة وتكييفها بما يلائم المشروع.",
        ],
        [
          [
            "Applies one method to every project regardless of uncertainty, size or team.",
            "يطبّق منهجية واحدة على كل المشاريع بصرف النظر عن درجة عدم اليقين أو الحجم أو طبيعة الفريق.",
          ],
          [
            "Uses the terms and routines of a method without explaining how they serve this project.",
            "يستخدم مصطلحات المنهجية واجتماعاتها الدورية دون توضيح كيف تخدم هذا المشروع.",
          ],
          [
            "Chooses a method suited to the project's uncertainty and constraints, and explains how planning, review and change control will work.",
            "يختار منهجية تناسب درجة عدم اليقين في المشروع وقيوده، ويوضّح آليات التخطيط والمراجعة وضبط التغيير.",
          ],
          [
            "Adapts the method when conditions change, combines approaches where parts of the project differ, and measures delivery flow.",
            "يكيّف المنهجية حين تتغير الظروف، ويجمع بين أكثر من نهج حين تختلف أجزاء المشروع، ويقيس انسيابية التنفيذ.",
          ],
          [
            "Diagnoses why a method is failing in practice, and redesigns ways of working around the real constraint rather than the textbook model.",
            "يشخّص أسباب إخفاق منهجية ما في التطبيق العملي، ويعيد تصميم أساليب العمل حول القيد الفعلي لا وفق النموذج النظري.",
          ],
        ],
      ),
      skill(
        "technical.proj.budget-resources",
        ["Budget and resource control", "ضبط الموازنة والموارد"],
        [
          "Tracking project cost and people against plan and acting on variances.",
          "متابعة تكلفة المشروع والموارد البشرية مقارنة بالخطة، والتصرف حيال الانحرافات.",
        ],
        [
          [
            "Does not track spending or effort until the budget has been exceeded.",
            "لا يتابع الإنفاق أو الجهد المبذول حتى تُتجاوز الموازنة.",
          ],
          [
            "Tracks spending against budget but does not relate it to progress, so overruns appear late.",
            "يتابع الإنفاق مقارنة بالموازنة، لكنه لا يربطه بالتقدّم المحرز، فلا تظهر التجاوزات إلا متأخرة.",
          ],
          [
            "Compares cost and effort with progress, forecasts the final cost, and acts or escalates when variances appear.",
            "يقارن التكلفة والجهد بالتقدّم المحرز، ويتنبأ بالتكلفة النهائية، ويتصرف أو يصعّد عند ظهور الانحرافات.",
          ],
          [
            "Explains the causes of variances, presents trade-offs between scope, time and cost, and moves people to the critical work.",
            "يوضّح أسباب الانحرافات، ويعرض المفاضلات بين النطاق والوقت والتكلفة، ويعيد توزيع الأفراد على الأعمال الحرجة.",
          ],
          [
            "Detects early signs of hidden cost growth, such as rework or unclear ownership, and corrects them before they reach the forecast.",
            "يرصد العلامات المبكرة لنمو خفي في التكاليف، مثل إعادة العمل أو غموض المسؤوليات، ويعالجها قبل أن تنعكس على التوقعات.",
          ],
        ],
      ),
    ],
  },

  // ───────────────────────────────────────── General management
  {
    key: "general-management",
    name: { en: "General management", ar: "الإدارة العامة" },
    keywords: [
      "general manager",
      "managing director",
      "chief executive",
      "ceo",
      "country manager",
      "business unit",
      "p&l",
      "executive leadership",
      "senior leadership",
      "المدير العام",
      "مدير عام",
      "المدير التنفيذي",
      "الرئيس التنفيذي",
      "الإدارة العليا",
      "الأرباح والخسائر",
    ],
    domainWeights: weights(0.5, 0.8, 1.0, 1.0, 0.9, 0.8, 0.5, 0.7, 0.8),
    technicalSkills: [
      skill(
        "technical.gm.strategy-formulation",
        ["Strategy formulation", "صياغة الاستراتيجية"],
        [
          "Choosing where to compete and how to win, and translating that into priorities.",
          "تحديد مجالات المنافسة وسبل التفوّق فيها، وترجمة ذلك إلى أولويات.",
        ],
        [
          [
            "Describes goals or aspirations as strategy, with no choices about what the business will not do.",
            "يقدّم الأهداف أو التطلعات على أنها استراتيجية، دون أي خيارات بشأن ما لن تفعله المؤسسة.",
          ],
          [
            "Makes strategic choices but does not ground them in analysis of customers, competitors or capabilities.",
            "يتخذ خيارات استراتيجية، لكنه لا يبنيها على تحليل للعملاء أو المنافسين أو القدرات.",
          ],
          [
            "Makes clear choices grounded in market and capability analysis, explains the trade-offs, and turns them into a few measurable priorities.",
            "يتخذ خيارات واضحة مبنية على تحليل السوق والقدرات، ويوضّح المفاضلات، ويترجمها إلى عدد محدود من الأولويات القابلة للقياس.",
          ],
          [
            "Tests the strategy against scenarios and competitor responses, identifies the assumptions it depends on, and sets signals to revisit it.",
            "يختبر الاستراتيجية في ضوء سيناريوهات مختلفة وردود فعل المنافسين، ويحدّد الافتراضات التي تقوم عليها، ويضع مؤشرات تستدعي مراجعتها.",
          ],
          [
            "Sees shifts in the market before they are obvious, and reshapes the business model rather than only adjusting plans.",
            "يستشرف التحوّلات في السوق قبل أن تتضح، ويعيد تشكيل نموذج العمل بدل الاكتفاء بتعديل الخطط.",
          ],
        ],
      ),
      skill(
        "technical.gm.commercial-acumen",
        ["Commercial and financial acumen", "الحسّ التجاري والمالي"],
        [
          "Understanding how the business makes money and how decisions affect profit, cash and risk.",
          "فهم الطريقة التي تحقق بها المؤسسة أرباحها، وأثر القرارات في الربحية والنقد والمخاطر.",
        ],
        [
          [
            "Makes decisions without considering their financial effect, or confuses revenue with profit.",
            "يتخذ القرارات دون مراعاة أثرها المالي، أو يخلط بين الإيرادات والأرباح.",
          ],
          [
            "Considers the cost or revenue of a decision but not its effect on margin, cash or other parts of the business.",
            "يراعي تكلفة القرار أو إيراداته، لكنه لا يراعي أثره في هامش الربح أو النقد أو أجزاء أخرى من المؤسسة.",
          ],
          [
            "Explains how the decision affects revenue, margin and cash, uses the key figures correctly, and weighs return against risk.",
            "يوضّح أثر القرار في الإيرادات وهامش الربح والنقد، ويستخدم الأرقام الرئيسية بطريقة صحيحة، ويوازن بين العائد والمخاطر.",
          ],
          [
            "Identifies the few economic drivers that matter most, quantifies trade-offs across units, and weighs short-term against long-term effects.",
            "يحدّد العدد المحدود من المحرّكات الاقتصادية الأكثر أهمية، ويقدّر بالأرقام المفاضلات بين الوحدات، ويوازن بين الآثار قصيرة الأجل وطويلة الأجل.",
          ],
          [
            "Spots where the economics of the business are shifting or misunderstood, and acts before it shows in the results.",
            "يرصد مواضع تغيّر اقتصاديات العمل أو سوء فهمها، ويتصرف حيالها قبل أن تظهر في النتائج.",
          ],
        ],
      ),
      skill(
        "technical.gm.market-insight",
        ["Market and customer insight", "فهم السوق والعملاء"],
        [
          "Understanding customers, competitors and market forces well enough to guide decisions.",
          "فهم العملاء والمنافسين وقوى السوق فهمًا كافيًا لتوجيه القرارات.",
        ],
        [
          [
            "Relies on personal opinion about the market, with no reference to customer or competitor evidence.",
            "يعتمد على رأيه الشخصي في السوق، دون الرجوع إلى أدلة عن العملاء أو المنافسين.",
          ],
          [
            "Cites market data but does not draw implications for the business or its choices.",
            "يستشهد ببيانات السوق، لكنه لا يستخلص دلالاتها على المؤسسة أو خياراتها.",
          ],
          [
            "Uses customer, competitor and market evidence to explain the business's position, and draws clear implications for decisions.",
            "يستعين بأدلة عن العملاء والمنافسين والسوق لتوضيح موقع المؤسسة، ويستخلص دلالات واضحة على القرارات.",
          ],
          [
            "Segments customers by value and need, anticipates competitor moves, and identifies which trends will matter most for the business.",
            "يقسّم العملاء إلى شرائح بحسب قيمتهم واحتياجاتهم، ويتوقع تحركات المنافسين، ويحدّد الاتجاهات الأكثر تأثيرًا في المؤسسة.",
          ],
          [
            "Identifies threats or opportunities that are not yet visible, such as new entrants or changing customer behaviour, and turns them into early action.",
            "يكتشف تهديدات أو فرصًا غير ظاهرة بعد، مثل دخول منافسين جدد أو تغيّر سلوك العملاء، ويترجمها إلى إجراءات مبكرة.",
          ],
        ],
      ),
      skill(
        "technical.gm.operating-model",
        ["Operating model and execution", "النموذج التشغيلي والتنفيذ"],
        [
          "Aligning structure, processes and resources so the strategy is delivered.",
          "مواءمة الهيكل والعمليات والموارد بما يضمن تنفيذ الاستراتيجية.",
        ],
        [
          [
            "Sets targets without considering whether the organisation has the structure, people or processes to meet them.",
            "يضع المستهدفات دون النظر في امتلاك المؤسسة للهيكل أو الأفراد أو العمليات اللازمة لبلوغها.",
          ],
          [
            "Assigns priorities to teams but leaves decision rights, resources or coordination unclear.",
            "يوزّع الأولويات على الفرق، لكنه يترك صلاحيات القرار أو الموارد أو آليات التنسيق غامضة.",
          ],
          [
            "Links priorities to clear owners, resources and decision rights, and sets a regular rhythm for reviewing progress.",
            "يربط الأولويات بمسؤولين وموارد وصلاحيات قرار واضحة، ويضع إيقاعًا منتظمًا لمراجعة التقدّم.",
          ],
          [
            "Identifies where structure or incentives work against the strategy, reallocates resources decisively, and removes bottlenecks between teams.",
            "يحدّد المواضع التي يعمل فيها الهيكل أو الحوافز ضد الاستراتيجية، ويعيد توزيع الموارد بحزم، ويزيل نقاط الاختناق بين الفرق.",
          ],
          [
            "Designs an operating model that scales and adapts, and stops work that no longer serves the strategy even when it is popular.",
            "يصمّم نموذجًا تشغيليًا قابلًا للتوسّع والتكيّف، ويوقف الأعمال التي لم تعد تخدم الاستراتيجية حتى لو كانت تحظى بالتأييد.",
          ],
        ],
      ),
      skill(
        "technical.gm.governance-risk",
        ["Governance and enterprise risk", "الحوكمة والمخاطر المؤسسية"],
        [
          "Overseeing compliance, reputation and major risks across the business.",
          "الإشراف على الامتثال والسمعة والمخاطر الكبرى على مستوى المؤسسة.",
        ],
        [
          [
            "Overlooks the legal, regulatory or reputational consequences of business decisions.",
            "يُغفل العواقب القانونية أو التنظيمية أو المتعلقة بالسمعة لقرارات العمل.",
          ],
          [
            "Recognises major risks but treats them as someone else's responsibility or as a formality.",
            "يدرك المخاطر الكبرى، لكنه يعدّها مسؤولية غيره أو مجرد إجراء شكلي.",
          ],
          [
            "Identifies the main business risks, ensures each has an owner and mitigation, and keeps the board or leadership informed.",
            "يحدّد أبرز مخاطر العمل، ويتأكد من أن لكل منها مسؤولًا وإجراءً للحدّ منها، ويُبقي مجلس الإدارة أو القيادة على اطلاع.",
          ],
          [
            "Sets a clear risk appetite, balances growth against exposure, and tests controls where failure would be most damaging.",
            "يحدّد مستوى واضحًا لتقبّل المخاطر، ويوازن بين النمو وحجم الانكشاف، ويختبر الضوابط حيث يكون الإخفاق أشدّ ضررًا.",
          ],
          [
            "Anticipates emerging risks such as regulatory change or ethical issues, and builds a culture where problems are raised early.",
            "يستشرف المخاطر الناشئة، مثل التغييرات التنظيمية أو القضايا الأخلاقية، ويبني ثقافة تُطرح فيها المشكلات مبكرًا.",
          ],
        ],
      ),
    ],
  },
];
