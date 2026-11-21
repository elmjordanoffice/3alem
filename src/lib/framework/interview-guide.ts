// Structured-interview guide: one behavioural question set per framework skill, for the employer's interview kit.
//
// Each sub-skill entry is written against that sub-skill's behavioural anchors in ./data.ts, so the
// interview measures the same thing the assessment did: `listenFor` paraphrases the level-4 anchor
// (and level 3 where it is the observable core), `watchFor` the level-1 and level-2 anchors.
// Domain keys ("judgment", "communication", ...) have a broader entry used as a fallback when a report
// only has a domain-level gap.
//
// Content rules: `question` asks about one real past situation and the candidate's own actions;
// `situational` is the hypothetical alternative for people with little work experience. Nothing asks
// about protected characteristics or needs a particular industry, degree or culture to answer.
// Arabic is written as an Arabic interviewer would ask it, not translated word for word.

export interface InterviewGuideEntry {
  /** Behavioural ("Tell me about a time…") question for people with work experience. */
  question: { en: string; ar: string };
  /** Situational alternative for people with little work experience ("Imagine…", "What would you do if…"). */
  situational: { en: string; ar: string };
  /** Two follow-ups that dig for the person's own actions, reasons and results. */
  followUps: [{ en: string; ar: string }, { en: string; ar: string }];
  /** Three things a strong answer includes (observable, specific). */
  listenFor: [{ en: string; ar: string }, { en: string; ar: string }, { en: string; ar: string }];
  /** Two warning signs. */
  watchFor: [{ en: string; ar: string }, { en: string; ar: string }];
}

export const INTERVIEW_GUIDE: Record<string, InterviewGuideEntry> = {
  // ─── Technical / domain expertise ────────────────────────────────────────────
  technical: {
    question: {
      en: "Tell me about a difficult problem in your work or studies that you solved yourself. What did you do, step by step?",
      ar: "حدّثنا عن مشكلة صعبة واجهتها في عملك أو دراستك وحللتها بنفسك. ما الذي فعلته خطوةً بخطوة؟",
    },
    situational: {
      en: "Imagine you are given a task in your field that needs a method you have never used. How would you approach it?",
      ar: "لنفترض أنك كُلّفت بمهمة في مجالك تتطلب أسلوبًا لم يسبق لك استخدامه. كيف تتعامل معها؟",
    },
    followUps: [
      {
        en: "What did you try that did not work, and how did you know?",
        ar: "ما الذي جرّبته ولم ينجح، وكيف عرفت ذلك؟",
      },
      {
        en: "Which part were you least sure about, and how did you check it?",
        ar: "ما الجزء الذي كنت أقلّ يقينًا بشأنه، وكيف تحققت منه؟",
      },
    ],
    listenFor: [
      {
        en: "Separates the symptom from the cause and says how they confirmed it",
        ar: "يميّز العَرَض من السبب، ويذكر كيف تأكد منه",
      },
      {
        en: "Names the specific method or tool used and why it fit",
        ar: "يسمّي الأسلوب أو الأداة التي استخدمها ولماذا كانت مناسبة",
      },
      {
        en: "Says clearly what they did not know and how they checked it",
        ar: "يذكر بوضوح ما لم يكن يعرفه وكيف تحقق منه",
      },
    ],
    watchFor: [
      {
        en: "Describes the fix but cannot explain why it worked",
        ar: "يصف الحل لكنه لا يستطيع تفسير سبب نجاحه",
      },
      {
        en: "States guesses as facts, or blames the tool without checking",
        ar: "يقدّم التخمينات على أنها حقائق، أو يلوم الأداة دون تحقق",
      },
    ],
  },

  "technical.role-knowledge": {
    question: {
      en: "Tell me about a time you had to choose which method, tool or standard to use for a piece of work. What did you choose, and on what basis?",
      ar: "حدّثنا عن موقف كان عليك فيه اختيار أسلوب أو أداة أو معيار لإنجاز عمل ما. ماذا اخترت، وعلامَ بنيت اختيارك؟",
    },
    situational: {
      en: "Imagine a new colleague asks which approach to use for a common task in your field. What would you advise, and what mistakes would you warn about?",
      ar: "لنفترض أن زميلًا جديدًا سألك عن الأسلوب الأنسب لمهمة شائعة في مجالك. بماذا تنصحه، ومن أي أخطاء تحذّره؟",
    },
    followUps: [
      {
        en: "What other options did you consider, and why did you rule them out?",
        ar: "ما البدائل الأخرى التي نظرت فيها، ولماذا استبعدتها؟",
      },
      {
        en: "What do people new to this kind of work usually get wrong?",
        ar: "ما الأخطاء التي يقع فيها المبتدئون عادةً في هذا النوع من العمل؟",
      },
    ],
    listenFor: [
      {
        en: "Names the exact method, tool or standard used, with case-specific details",
        ar: "يسمّي الأسلوب أو الأداة أو المعيار بدقة، مع تفاصيل تخص الحالة",
      },
      {
        en: "Explains why it fit better than at least one named alternative",
        ar: "يوضّح سبب تفضيله على بديل واحد على الأقل يذكره بالاسم",
      },
      {
        en: "Points out a common pitfall and how they avoided it",
        ar: "ينبّه إلى خطأ شائع ويذكر كيف تجنّبه",
      },
    ],
    watchFor: [
      {
        en: "Uses the right terms but gives no details specific to that case",
        ar: "يستخدم المصطلحات الصحيحة لكن دون أي تفاصيل خاصة بالحالة",
      },
      {
        en: "Justifies the choice only by habit, or describes outdated practice",
        ar: "لا يبرّر اختياره إلا بالعادة، أو يصف ممارسات متقادمة",
      },
    ],
  },

  "technical.problem-diagnosis": {
    question: {
      en: "Tell me about a time something stopped working and the cause was not obvious. How did you narrow down what was wrong?",
      ar: "حدّثنا عن موقف تعطّل فيه شيء ولم يكن سببه واضحًا. كيف ضيّقت الاحتمالات حتى عرفت موضع الخلل؟",
    },
    situational: {
      en: "Imagine a report you produce every week suddenly shows numbers that look wrong, and nothing obvious has changed. How would you find out what happened?",
      ar: "لنفترض أن تقريرًا تُعدّه كل أسبوع أظهر فجأة أرقامًا تبدو غير صحيحة، دون أي تغيير واضح. كيف تكتشف ما حدث؟",
    },
    followUps: [
      {
        en: "What possible causes did you consider, and which did you check first? Why that one?",
        ar: "ما الأسباب المحتملة التي فكّرت فيها، وبأيها بدأت التحقق؟ ولماذا هذا تحديدًا؟",
      },
      {
        en: "What result would have told you that your first guess was wrong?",
        ar: "ما النتيجة التي كانت ستدلّك على أن تخمينك الأول خاطئ؟",
      },
    ],
    listenFor: [
      {
        en: "Names several possible causes before trying a fix",
        ar: "يذكر عدة أسباب محتملة قبل أن يجرّب أي حل",
      },
      {
        en: "Explains why they checked one cause first, e.g. likelier or quicker to test",
        ar: "يوضّح لماذا بدأ بسبب معيّن، كأن يكون الأرجح أو الأسرع اختبارًا",
      },
      {
        en: "States what result would confirm or rule out each cause",
        ar: "يحدد النتيجة التي تؤكد كل سبب أو تستبعده",
      },
    ],
    watchFor: [
      {
        en: "Went straight to a fix without finding the cause",
        ar: "انتقل مباشرةً إلى الحل دون أن يحدد السبب",
      },
      {
        en: "Settled on the first cause without checking it against the facts",
        ar: "اكتفى بأول سبب خطر له دون التحقق منه في ضوء الوقائع",
      },
    ],
  },

  "technical.applying-knowledge": {
    question: {
      en: "Tell me about a time a method you knew well did not quite fit the situation. What did you change, and what did you keep?",
      ar: "حدّثنا عن موقف لم يكن فيه أسلوب تتقنه مناسبًا تمامًا للحالة. ما الذي غيّرته فيه، وما الذي أبقيت عليه؟",
    },
    situational: {
      en: "Imagine you must apply a process you know well to a task that differs from the usual in important ways. How would you decide what to adjust?",
      ar: "لنفترض أنك كُلّفت بتطبيق إجراء تعرفه جيدًا على مهمة تختلف عن المعتاد في جوانب مهمة. كيف تقرر ما يحتاج إلى تعديل؟",
    },
    followUps: [
      {
        en: "What exactly was different about this case, and how did you notice it?",
        ar: "ما الذي كان مختلفًا في هذه الحالة تحديدًا، وكيف انتبهت إليه؟",
      },
      {
        en: "How did you check that the adjusted approach actually worked?",
        ar: "كيف تأكدت من أن النهج بعد التعديل أدّى الغرض فعلًا؟",
      },
    ],
    listenFor: [
      {
        en: "Names the specific difference that made the usual method unsuitable",
        ar: "يحدد الاختلاف الذي جعل الأسلوب المعتاد غير مناسب",
      },
      {
        en: "Says which steps they kept and which they changed, and why",
        ar: "يبيّن الخطوات التي أبقاها والتي غيّرها، وسبب ذلك",
      },
      {
        en: "Describes how they tested the adapted approach against the new constraints",
        ar: "يصف كيف اختبر النهج المعدَّل في ضوء القيود الجديدة",
      },
    ],
    watchFor: [
      {
        en: "Applied the usual procedure unchanged despite clear differences",
        ar: "طبّق الإجراء المعتاد كما هو رغم وجود اختلافات واضحة",
      },
      {
        en: "Mentions changes but cannot explain why they were needed",
        ar: "يذكر تعديلات لكنه لا يستطيع تفسير الحاجة إليها",
      },
    ],
  },

  "technical.calibrated-depth": {
    question: {
      en: "Tell me about a time you were asked something at the edge of what you knew. What did you say, and what did you do next?",
      ar: "حدّثنا عن موقف سُئلت فيه عن أمر يقع عند حدود معرفتك. بماذا أجبت، وماذا فعلت بعد ذلك؟",
    },
    situational: {
      en: "Imagine your manager asks for your view on a question where you know part of the answer but not all of it. What would you tell them?",
      ar: "لنفترض أن مديرك طلب رأيك في مسألة تعرف جزءًا من إجابتها لا كلها. ماذا تقول له؟",
    },
    followUps: [
      {
        en: "Which parts were you confident about, and which not? How did you show the difference?",
        ar: "في أي الأجزاء كانت ثقتك عالية، وفي أيها لم تكن كذلك؟ وكيف أوضحت الفرق؟",
      },
      {
        en: "Who or what did you turn to for the parts that stayed uncertain?",
        ar: "إلى من رجعت، أو إلى أي مصدر، لحسم النقاط التي بقيت غير مؤكدة؟",
      },
    ],
    listenFor: [
      {
        en: "Gives different confidence levels for different parts of the answer",
        ar: "يبيّن درجات ثقة مختلفة لأجزاء مختلفة من إجابته",
      },
      {
        en: "Names the specific person or source they consulted on weak points",
        ar: "يسمّي الشخص أو المصدر الذي رجع إليه في النقاط الضعيفة",
      },
      {
        en: "Explains how they verified uncertain parts before relying on them",
        ar: "يشرح كيف تحقق من النقاط غير المؤكدة قبل الاعتماد عليها",
      },
    ],
    watchFor: [
      {
        en: "Presented guesses as settled facts, or refused to give any view",
        ar: "قدّم تخمينات على أنها حقائق ثابتة، أو امتنع عن إبداء أي رأي",
      },
      {
        en: "Admits uncertainty only vaguely, without saying which points or why",
        ar: "يقرّ بعدم اليقين بعبارات عامة دون تحديد النقاط أو أسبابها",
      },
    ],
  },

  // ─── Critical thinking ───────────────────────────────────────────────────────
  "critical-thinking": {
    question: {
      en: "Tell me about a time you had to reach a conclusion from information that was messy or conflicting. How did you work out what to believe?",
      ar: "حدّثنا عن موقف اضطررت فيه إلى الوصول إلى استنتاج من معلومات مشوّشة أو متعارضة. كيف حددت ما يمكن الوثوق به؟",
    },
    situational: {
      en: "Imagine two colleagues give you opposite explanations for why a project is late, each with some evidence. How would you decide which is closer to the truth?",
      ar: "لنفترض أن زميلين قدّما لك تفسيرين متناقضين لتأخر مشروع، ولدى كل منهما بعض الأدلة. كيف تحدد أيهما أقرب إلى الحقيقة؟",
    },
    followUps: [
      {
        en: "Which piece of information did you rely on most, and why that one?",
        ar: "ما المعلومة التي اعتمدت عليها أكثر من غيرها، ولماذا هي بالذات؟",
      },
      {
        en: "What would have made you reach a different conclusion?",
        ar: "ما الذي كان سيجعلك تصل إلى استنتاج مختلف؟",
      },
    ],
    listenFor: [
      {
        en: "Explains why some sources were more reliable than others",
        ar: "يشرح لماذا كانت بعض المصادر أوثق من غيرها",
      },
      {
        en: "Names an assumption they questioned and what they found",
        ar: "يذكر افتراضًا راجعه وما الذي توصّل إليه",
      },
      {
        en: "Links the conclusion to specific facts, step by step",
        ar: "يربط استنتاجه بوقائع محددة، خطوةً بخطوة",
      },
    ],
    watchFor: [
      {
        en: "Accepted the first explanation they heard without checking it",
        ar: "قبِل أول تفسير سمعه دون التحقق منه",
      },
      {
        en: "Conclusion does not follow from the reasons given",
        ar: "استنتاجه لا يترتب على الأسباب التي ذكرها",
      },
    ],
  },

  "critical-thinking.evaluating-evidence": {
    question: {
      en: "Tell me about a time you were given information to act on and had doubts about it. What made you doubt it, and what did you do?",
      ar: "حدّثنا عن موقف وصلتك فيه معلومات لتتصرف بناءً عليها، لكنك شككت فيها. ما الذي أثار شكّك، وماذا فعلت؟",
    },
    situational: {
      en: "Imagine a colleague says a new way of working is better because three people who tried it liked it. Before adopting it, what would you want to know?",
      ar: "لنفترض أن زميلًا يرى أن طريقة عمل جديدة أفضل لأن ثلاثة ممن جرّبوها أُعجبوا بها. قبل اعتمادها، ما الذي تريد معرفته؟",
    },
    followUps: [
      {
        en: "How did you judge whether the source could be trusted?",
        ar: "كيف حكمت على مدى موثوقية المصدر؟",
      },
      {
        en: "What extra evidence would have changed your mind?",
        ar: "ما الدليل الإضافي الذي كان سيغيّر رأيك؟",
      },
    ],
    listenFor: [
      {
        en: "Names a specific weakness, such as a small sample, bias or no comparison",
        ar: "يحدد موطن ضعف بعينه، كصغر العينة أو التحيّز أو غياب المقارنة",
      },
      {
        en: "Says what they checked and where, not only that they doubted it",
        ar: "يذكر ما تحقق منه وأين، لا مجرد أنه شكّ في المعلومة",
      },
      {
        en: "States what further evidence would have changed their conclusion",
        ar: "يذكر الدليل الإضافي الذي كان سيغيّر استنتاجه",
      },
    ],
    watchFor: [
      {
        en: "Treated a single story or opinion as proof",
        ar: "عدّ قصة واحدة أو رأيًا واحدًا دليلًا قاطعًا",
      },
      {
        en: "Trusts or doubts sources with no clear reason",
        ar: "يثق بالمصادر أو يشكّك فيها دون سبب واضح",
      },
    ],
  },

  "critical-thinking.spotting-assumptions": {
    question: {
      en: "Tell me about a time you realised a plan or decision rested on an assumption nobody had checked. What was it, and what did you do?",
      ar: "حدّثنا عن موقف أدركت فيه أن خطة أو قرارًا يقوم على افتراض لم يتحقق منه أحد. ما هذا الافتراض، وماذا فعلت؟",
    },
    situational: {
      en: "Imagine your team is about to start a project based on the belief that people will welcome the change. What would you check before agreeing to start?",
      ar: "لنفترض أن فريقك على وشك بدء مشروع انطلاقًا من قناعة بأن الناس سيرحّبون بالتغيير. ما الذي تتحقق منه قبل الموافقة على البدء؟",
    },
    followUps: [
      {
        en: "Why do you think nobody had questioned that assumption before?",
        ar: "برأيك، لماذا لم يتوقف أحد عند هذا الافتراض من قبل؟",
      },
      {
        en: "If the assumption had turned out false, what would have changed?",
        ar: "لو تبيّن أن الافتراض خاطئ، ما الذي كان سيتغيّر؟",
      },
    ],
    listenFor: [
      {
        en: "States the assumption in plain words, as a specific belief",
        ar: "يصوغ الافتراض بكلمات واضحة على أنه قناعة محددة",
      },
      {
        en: "Explains how the outcome changes if the assumption is false",
        ar: "يشرح كيف تتغير النتيجة إذا ثبت خطأ الافتراض",
      },
      {
        en: "Describes how they tested the assumption or got it tested",
        ar: "يصف كيف اختبر الافتراض أو دفع إلى اختباره",
      },
    ],
    watchFor: [
      {
        en: "Cannot name any assumption behind the plan",
        ar: "لا يستطيع تحديد أي افتراض تقوم عليه الخطة",
      },
      {
        en: "Spots an assumption but never asks whether it holds",
        ar: "يلاحظ الافتراض لكنه لا يتساءل عن صحته",
      },
    ],
  },

  "critical-thinking.root-cause-analysis": {
    question: {
      en: "Tell me about a problem that kept coming back until you found out why. How did you trace it to its cause?",
      ar: "حدّثنا عن مشكلة ظلّت تتكرر إلى أن عرفت سببها. كيف تتبّعتها حتى وصلت إلى أصلها؟",
    },
    situational: {
      en: "Imagine the same mistake keeps appearing in your team's work every month, even after people are reminded. How would you find out why it keeps happening?",
      ar: "لنفترض أن الخطأ نفسه يتكرر في عمل فريقك كل شهر رغم تذكير الجميع به. كيف تكتشف سبب تكراره؟",
    },
    followUps: [
      {
        en: "What did you first think the cause was, and what made you look further?",
        ar: "ما السبب الذي ظننته في البداية، وما الذي دفعك إلى البحث أبعد من ذلك؟",
      },
      {
        en: "What did you change so it would not happen again, and did it hold?",
        ar: "ما الذي غيّرته كي لا تتكرر المشكلة، وهل صمد هذا التغيير؟",
      },
    ],
    listenFor: [
      {
        en: "Describes a chain of causes, not only the first one found",
        ar: "يصف سلسلة من الأسباب، لا أول سبب وجده فقط",
      },
      {
        en: "Separates contributing factors from the underlying cause",
        ar: "يميّز العوامل المساهمة من السبب الجذري",
      },
      {
        en: "Names a change aimed at preventing recurrence, and whether it worked",
        ar: "يذكر تغييرًا يمنع تكرار المشكلة، وهل نجح",
      },
    ],
    watchFor: [
      {
        en: "Fixed the symptom only, and the problem returned",
        ar: "عالج العَرَض فقط، فعادت المشكلة",
      },
      {
        en: "Blames a person without asking why the error happened",
        ar: "يلقي اللوم على شخص دون أن يسأل لماذا وقع الخطأ",
      },
    ],
  },

  "critical-thinking.logical-reasoning": {
    question: {
      en: "Tell me about a time you noticed a flaw in an argument that others were accepting. What was the flaw, and what did you do?",
      ar: "حدّثنا عن موقف لاحظت فيه خللًا في حجة كان الآخرون يتقبّلونها. ما هذا الخلل، وماذا فعلت؟",
    },
    situational: {
      en: "Imagine a colleague says: 'Mistakes dropped after we started the morning meeting, so the meeting caused it.' What would you say, and why?",
      ar: "لنفترض أن زميلًا قال: «قلّت الأخطاء منذ بدأنا الاجتماع الصباحي، إذن الاجتماع هو السبب». بماذا تردّ، ولماذا؟",
    },
    followUps: [
      {
        en: "How did you explain the flaw so that others could see it?",
        ar: "كيف شرحت الخلل بحيث يراه الآخرون؟",
      },
      {
        en: "What would have had to be true for the argument to hold?",
        ar: "ما الذي كان يجب أن يكون صحيحًا حتى تصمد تلك الحجة؟",
      },
    ],
    listenFor: [
      {
        en: "Names the specific flaw, e.g. correlation taken as cause, or a false choice",
        ar: "يسمّي الخلل بعينه، كالخلط بين الارتباط والسببية أو حصر الخيارات في اثنين",
      },
      {
        en: "Explains step by step why the conclusion does not follow",
        ar: "يشرح خطوةً بخطوة لماذا لا يترتب الاستنتاج على المقدمات",
      },
      {
        en: "Offers another explanation that fits the same facts",
        ar: "يقترح تفسيرًا آخر يتفق مع الوقائع نفسها",
      },
    ],
    watchFor: [
      {
        en: "Their own account jumps to conclusions or contradicts itself",
        ar: "روايته نفسها تقفز إلى استنتاجات أو يناقض بعضها بعضًا",
      },
      {
        en: "Says the argument 'felt wrong' but cannot say why",
        ar: "يقول إن الحجة «لم تقنعه» دون أن يحدد السبب",
      },
    ],
  },

  "critical-thinking.quantitative-reasoning": {
    question: {
      en: "Tell me about a decision you made or influenced where numbers played an important part. How did you use them?",
      ar: "حدّثنا عن قرار اتخذته أو أسهمت فيه وكان للأرقام دور مهم فيه. كيف استخدمتها؟",
    },
    situational: {
      en: "Imagine you hear that complaints rose 50% this month and everyone wants urgent action. What would you check before reacting?",
      ar: "لنفترض أنك سمعت أن الشكاوى ارتفعت بنسبة 50% هذا الشهر، والجميع يطالب بإجراء عاجل. ما الذي تتحقق منه قبل أن تتصرف؟",
    },
    followUps: [
      {
        en: "What did you compare the numbers against, and why that baseline?",
        ar: "بماذا قارنت هذه الأرقام، ولماذا اخترت هذا الأساس للمقارنة؟",
      },
      {
        en: "Was there a number that could have misled people? How did you handle it?",
        ar: "هل كان هناك رقم قد يضلّل الآخرين؟ وكيف تعاملت معه؟",
      },
    ],
    listenFor: [
      {
        en: "Compares figures to a baseline, an earlier period or the total",
        ar: "يقارن الأرقام بأساس مرجعي أو بفترة سابقة أو بالمجموع الكلي",
      },
      {
        en: "Distinguishes percentages from absolute numbers",
        ar: "يميّز بين النسب المئوية والأرقام المطلقة",
      },
      {
        en: "Points out a figure that could mislead, and why",
        ar: "ينبّه إلى رقم قد يكون مضلّلًا، ويوضّح السبب",
      },
    ],
    watchFor: [
      {
        en: "Takes numbers at face value without checking scale or source",
        ar: "يأخذ الأرقام على ظاهرها دون التحقق من حجمها أو مصدرها",
      },
      {
        en: "Confuses rates, percentages and totals, or avoids the numbers",
        ar: "يخلط بين المعدلات والنسب والمجاميع، أو يتجنّب الأرقام",
      },
    ],
  },

  // ─── Decision-making and judgment ────────────────────────────────────────────
  judgment: {
    question: {
      en: "Tell me about a difficult decision you were responsible for at work or in your studies. How did you make it, and how did it turn out?",
      ar: "حدّثنا عن قرار صعب كان عليك اتخاذه في عملك أو دراستك. كيف اتخذته، وما الذي ترتّب عليه؟",
    },
    situational: {
      en: "Imagine you must choose between delivering a task on time with known flaws or delivering it complete but late. How would you decide?",
      ar: "لنفترض أن عليك الاختيار بين تسليم مهمة في موعدها وفيها عيوب معروفة، وتسليمها كاملة لكن متأخرة. كيف تتخذ قرارك؟",
    },
    followUps: [
      {
        en: "What did you weigh, and which factor mattered most?",
        ar: "ما العوامل التي وازنت بينها، وأيها كان الأهم؟",
      },
      {
        en: "Knowing what you know now, would you decide the same way?",
        ar: "بما تعرفه الآن، هل كنت ستتخذ القرار نفسه؟",
      },
    ],
    listenFor: [
      {
        en: "States the options and what each would cost",
        ar: "يذكر الخيارات المتاحة وثمن كل منها",
      },
      {
        en: "Names the risks and how they limited the serious ones",
        ar: "يسمّي المخاطر وكيف حدّ من أخطرها",
      },
      {
        en: "Describes what they watched afterwards and whether they adjusted",
        ar: "يصف ما راقبه بعد القرار وهل عدّل مساره",
      },
    ],
    watchFor: [
      {
        en: "Presents the decision as obvious, with no downside",
        ar: "يقدّم القرار على أنه بديهي ولا سلبيات له",
      },
      {
        en: "Ignores who else the decision affected and what came later",
        ar: "يغفل أثر القرار في الآخرين وعواقبه اللاحقة",
      },
    ],
  },

  "judgment.trade-off-reasoning": {
    question: {
      en: "Tell me about a time you had to choose between two options that both had real drawbacks. What did you choose, and why?",
      ar: "حدّثنا عن موقف اضطررت فيه إلى الاختيار بين خيارين لكل منهما عيوب حقيقية. ماذا اخترت، ولماذا؟",
    },
    situational: {
      en: "Imagine you can fix a recurring problem properly, which takes two weeks, or patch it in a day. How would you decide which to do?",
      ar: "لنفترض أن أمامك خيارين لمعالجة مشكلة متكررة: حل جذري يستغرق أسبوعين، أو حل مؤقت يُنجز في يوم. كيف تختار بينهما؟",
    },
    followUps: [
      {
        en: "What did you give up with your choice, and why was that acceptable?",
        ar: "ما الذي تنازلت عنه باختيارك، ولماذا رأيت ذلك مقبولًا؟",
      },
      {
        en: "What would have made the other option the better one?",
        ar: "ما الذي كان سيجعل الخيار الآخر هو الأفضل؟",
      },
    ],
    listenFor: [
      {
        en: "Names the criteria they used and which mattered most",
        ar: "يحدد المعايير التي اعتمدها وأيها كان الأهم",
      },
      {
        en: "Says plainly what they gave up and why it was acceptable",
        ar: "يذكر بوضوح ما تنازل عنه ولماذا كان ذلك مقبولًا",
      },
      {
        en: "States what would have made the other option better",
        ar: "يذكر الظروف التي كانت ستجعل الخيار الآخر أفضل",
      },
    ],
    watchFor: [
      {
        en: "Mentions no downside to the chosen option",
        ar: "لا يذكر أي سلبية للخيار الذي اختاره",
      },
      {
        en: "Lists pros and cons but never explains the final choice",
        ar: "يعدّد الإيجابيات والسلبيات دون أن يفسّر اختياره النهائي",
      },
    ],
  },

  "judgment.risk-calibration": {
    question: {
      en: "Tell me about a task where a serious mistake was possible. How did you judge the risks, and how did you deal with them?",
      ar: "حدّثنا عن مهمة كان من الممكن أن تنتهي بخطأ جسيم. كيف قدّرت المخاطر، وكيف تعاملت معها؟",
    },
    situational: {
      en: "Imagine you are about to make a change that would be hard to undo, and a colleague warns it might cause problems. What would you do?",
      ar: "لنفترض أنك على وشك إجراء تغيير يصعب التراجع عنه، ونبّهك زميل إلى أنه قد يسبب مشكلات. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "Which risks did you take seriously, and which did you accept? Why?",
        ar: "أي المخاطر تعاملت معها بجدية، وأيها قبلتها؟ ولماذا؟",
      },
      {
        en: "What early signs did you watch for that things were going wrong?",
        ar: "ما العلامات المبكرة التي راقبتها لتعرف أن الأمور بدأت تنحرف؟",
      },
    ],
    listenFor: [
      {
        en: "Separates likely from unlikely risks, and severe from minor ones",
        ar: "يميّز المخاطر المرجّحة من المستبعدة، والجسيمة من البسيطة",
      },
      {
        en: "Takes more care with what is hard to undo than with what is reversible",
        ar: "يتعامل بحذر أكبر مع ما يصعب التراجع عنه",
      },
      {
        en: "Names specific early warning signs they monitored",
        ar: "يسمّي علامات إنذار مبكر محددة راقبها",
      },
    ],
    watchFor: [
      {
        en: "Ignored an obvious risk, or let small risks stop all action",
        ar: "تجاهل خطرًا واضحًا، أو جعل المخاطر الصغيرة تعطّل أي تصرف",
      },
      {
        en: "Lists risks without saying which mattered most",
        ar: "يعدّد المخاطر دون أن يحدد أيها الأهم",
      },
    ],
  },

  "judgment.deciding-under-ambiguity": {
    question: {
      en: "Tell me about a time you had to decide before key facts were available. How did you decide, and what did you do about the gaps?",
      ar: "حدّثنا عن موقف اضطررت فيه إلى اتخاذ قرار قبل أن تتضح معلومات أساسية. كيف قررت، وكيف تعاملت مع ما كان ناقصًا؟",
    },
    situational: {
      en: "Imagine you must decide by tomorrow how to run an event, but you do not yet know how many people will attend. What would you do?",
      ar: "لنفترض أن عليك أن تحسم غدًا ترتيبات فعالية ما، ولم يتضح بعد عدد الحضور. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "What did you assume to fill the gaps, and how did you check those assumptions later?",
        ar: "ما الافتراضات التي سددت بها النقص، وكيف تحققت منها لاحقًا؟",
      },
      {
        en: "What did you decide straight away, and what did you leave until later? Why?",
        ar: "ما الذي حسمته فورًا، وما الذي أجّلته؟ ولماذا؟",
      },
    ],
    listenFor: [
      {
        en: "States the assumptions they used to fill the gaps",
        ar: "يذكر صراحةً الافتراضات التي سدّ بها النقص",
      },
      {
        en: "Separates what had to be decided now from what could wait",
        ar: "يميّز ما لزم حسمه فورًا مما يحتمل التأجيل",
      },
      {
        en: "Sought only the information that could change the decision",
        ar: "لم يسعَ إلا إلى المعلومات التي قد تغيّر القرار",
      },
    ],
    watchFor: [
      {
        en: "Waited for complete information while the deadline passed",
        ar: "انتظر اكتمال المعلومات حتى فات الموعد",
      },
      {
        en: "Decided without stating what was unknown or assumed",
        ar: "قرّر دون أن يحدد ما كان مجهولًا أو مفترضًا",
      },
    ],
  },

  "judgment.ethical-judgment": {
    question: {
      en: "Tell me about a time you were under pressure to cut a corner or bend a rule. What did you do, and why?",
      ar: "حدّثنا عن موقف ضُغط عليك فيه لتتجاوز قاعدة أو تتساهل في إجراء ما. ماذا فعلت، ولماذا؟",
    },
    situational: {
      en: "Imagine your manager asks you to leave a known problem out of a report so that a target looks met. What would you do?",
      ar: "لنفترض أن مديرك طلب منك إغفال مشكلة معروفة في تقرير كي يبدو الهدف متحققًا. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "Who would have been affected by each choice, and how?",
        ar: "من كان سيتأثر بكل خيار من الخيارات، وكيف؟",
      },
      {
        en: "How did you still try to meet the legitimate goal behind the request?",
        ar: "كيف حاولت مع ذلك تحقيق الهدف المشروع من وراء الطلب؟",
      },
    ],
    listenFor: [
      {
        en: "Names who would be harmed and how, not only the rule",
        ar: "يحدد من كان سيتضرر وكيف، ولا يكتفي بذكر القاعدة",
      },
      {
        en: "Held their position when pressed by targets or seniority",
        ar: "ثبت على موقفه رغم ضغط الأهداف أو أصحاب المناصب الأعلى",
      },
      {
        en: "Proposed a practical, honest way to meet the real goal",
        ar: "اقترح طريقة عملية ونزيهة لتحقيق الهدف الحقيقي",
      },
    ],
    watchFor: [
      {
        en: "Did not see a problem, or went along to hit the target",
        ar: "لم يرَ مشكلة، أو جارى الطلب لبلوغ الهدف",
      },
      {
        en: "Cites the rule only, with no thought for those affected",
        ar: "يكتفي بالاستشهاد بالقاعدة دون التفكير في المتضررين",
      },
    ],
  },

  "judgment.second-order-thinking": {
    question: {
      en: "Tell me about a decision you made where the later effects mattered as much as the immediate result. How did you think those effects through?",
      ar: "حدّثنا عن قرار اتخذته كانت عواقبه اللاحقة لا تقل أهمية عن نتيجته المباشرة. كيف فكّرت في تلك العواقب؟",
    },
    situational: {
      en: "Imagine your team starts rewarding whoever closes the most tasks each week. What effects might that have over the following months?",
      ar: "لنفترض أن فريقك قرر مكافأة من يُنجز أكبر عدد من المهام كل أسبوع. ما الآثار التي قد تترتب على ذلك خلال الأشهر التالية؟",
    },
    followUps: [
      {
        en: "How did you expect people to react, and did they react that way?",
        ar: "كيف توقعت أن يتفاعل الآخرون مع القرار، وهل جاء تفاعلهم كما توقعت؟",
      },
      {
        en: "Was there an effect you did not foresee? What did you do about it?",
        ar: "هل ظهر أثر لم تتوقعه؟ وماذا فعلت حياله؟",
      },
    ],
    listenFor: [
      {
        en: "Names specific follow-on effects on people, processes or costs",
        ar: "يسمّي آثارًا لاحقة محددة على الأشخاص أو الإجراءات أو التكاليف",
      },
      {
        en: "Describes how others were likely to react, and why",
        ar: "يصف كيف كان الآخرون سيتفاعلون مع القرار ولماذا",
      },
      {
        en: "Adjusted the decision to avoid an unwanted effect",
        ar: "عدّل القرار لتجنّب أثر غير مرغوب",
      },
    ],
    watchFor: [
      {
        en: "Talks only about the immediate result",
        ar: "لا يتحدث إلا عن النتيجة المباشرة",
      },
      {
        en: "Says there 'could be side effects' but names none",
        ar: "يقول إنه «قد تكون هناك آثار جانبية» دون أن يسمّي أيًّا منها",
      },
    ],
  },

  "judgment.knowing-when-to-escalate": {
    question: {
      en: "Tell me about a time you had to decide whether to handle a problem yourself or raise it with someone else. What did you do?",
      ar: "حدّثنا عن موقف احتجت فيه إلى أن تقرر: هل تعالج مشكلة بنفسك أم تصعّدها إلى غيرك؟ ماذا فعلت؟",
    },
    situational: {
      en: "Imagine you spot an error that will affect others by tomorrow, fixing it is outside your role, and your manager is away. What would you do?",
      ar: "لنفترض أنك اكتشفت خطأً سيؤثر في آخرين بحلول الغد، وإصلاحه خارج صلاحياتك، ومديرك غائب. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "What did you do yourself before or while raising it?",
        ar: "ما الذي فعلته بنفسك قبل التصعيد أو في أثنائه؟",
      },
      {
        en: "Who did you raise it with, when, and what exactly did you ask for?",
        ar: "إلى من صعّدت الأمر، ومتى، وما الذي طلبته تحديدًا؟",
      },
    ],
    listenFor: [
      {
        en: "Names who they told, when, and what they asked for",
        ar: "يذكر من أبلغ، ومتى، وما الذي طلبه",
      },
      {
        en: "Took steps within their authority to contain the problem first",
        ar: "اتخذ ما في صلاحيته من خطوات لاحتواء المشكلة أولًا",
      },
      {
        en: "Explains why the issue was beyond their authority or acceptable risk",
        ar: "يوضّح لماذا تجاوزت المسألة صلاحياته أو حدود المخاطرة المقبولة",
      },
    ],
    watchFor: [
      {
        en: "Handled alone something beyond their authority, or escalated routine matters",
        ar: "تصرّف منفردًا في أمر يتجاوز صلاحياته، أو صعّد أمورًا روتينية",
      },
      {
        en: "Raised it late, or without saying what they needed",
        ar: "صعّد الأمر متأخرًا، أو دون أن يحدد ما يحتاج إليه",
      },
    ],
  },

  // ─── Leadership ──────────────────────────────────────────────────────────────
  leadership: {
    question: {
      en: "Tell me about a time you took the lead on something, with or without a formal role. What did you do to bring others with you?",
      ar: "حدّثنا عن موقف تولّيت فيه زمام المبادرة في أمر ما، سواء أكان لك دور رسمي أم لم يكن. ماذا فعلت لتكسب تعاون الآخرين؟",
    },
    situational: {
      en: "Imagine a group project has stalled because nobody is taking charge. What would you do in the first week?",
      ar: "لنفترض أن مشروعًا جماعيًا تعثّر لأن أحدًا لم يتولَّ قيادته. ماذا تفعل في الأسبوع الأول؟",
    },
    followUps: [
      {
        en: "Who was hardest to bring along, and how did you handle them?",
        ar: "من كان الأصعب إقناعًا، وكيف تعاملت معه؟",
      },
      {
        en: "What happened in the end, and what was your own part in it?",
        ar: "كيف انتهى الأمر، وما دورك أنت في ذلك؟",
      },
    ],
    listenFor: [
      {
        en: "Describes a clear goal they set and why it mattered",
        ar: "يصف هدفًا واضحًا حدّده وسبب أهميته",
      },
      {
        en: "Names steps they took personally, not only what the team did",
        ar: "يذكر خطوات اتخذها بنفسه، لا ما فعله الفريق فقط",
      },
      {
        en: "Owns the result, including what did not work",
        ar: "يتحمل مسؤولية النتيجة، بما فيها ما لم ينجح",
      },
    ],
    watchFor: [
      {
        en: "Says 'we' throughout, so their own part stays unclear",
        ar: "يتحدث بصيغة «نحن» طوال الوقت، فيبقى دوره غامضًا",
      },
      {
        en: "Cannot describe what others thought or how they responded",
        ar: "لا يستطيع وصف آراء الآخرين أو تفاعلهم",
      },
    ],
  },

  "leadership.setting-direction": {
    question: {
      en: "Tell me about a time you had to make clear to a group what they were aiming for. What did you say, and how did it change their work?",
      ar: "حدّثنا عن موقف احتجت فيه إلى توضيح الهدف لمجموعة من الأشخاص. ماذا قلت لهم، وكيف غيّر ذلك طريقة عملهم؟",
    },
    situational: {
      en: "Imagine you join a team where everyone is busy but nobody agrees on what the project is for. What would you do first?",
      ar: "لنفترض أنك انضممت إلى فريق يعمل أفراده بجد، لكنهم لا يتفقون على الغاية من المشروع. ما خطوتك الأولى؟",
    },
    followUps: [
      {
        en: "How did you define success, and what did you leave out of scope?",
        ar: "كيف حددت معيار النجاح، وما الذي أخرجته من نطاق العمل؟",
      },
      {
        en: "How could you tell that people were making decisions in line with that goal?",
        ar: "كيف عرفت أن الآخرين صاروا يتخذون قراراتهم بما يخدم ذلك الهدف؟",
      },
    ],
    listenFor: [
      {
        en: "States the goal they set in specific terms and why it mattered",
        ar: "يصوغ الهدف الذي حدّده بعبارات محددة ويبيّن سبب أهميته",
      },
      {
        en: "Defined what success meant and what was out of scope",
        ar: "حدّد معيار النجاح وما يقع خارج نطاق العمل",
      },
      {
        en: "Gives an example of someone deciding alone in line with the goal",
        ar: "يضرب مثالًا على شخص اتخذ قرارًا بمفرده منسجمًا مع الهدف",
      },
    ],
    watchFor: [
      {
        en: "Describes a task list with no goal behind it",
        ar: "يصف قائمة مهام لا يقف وراءها هدف",
      },
      {
        en: "The goal stays vague, e.g. 'do our best' or 'improve things'",
        ar: "يبقى الهدف فضفاضًا، مثل «نبذل قصارى جهدنا» أو «نحسّن الوضع»",
      },
    ],
  },

  "leadership.influence-without-authority": {
    question: {
      en: "Tell me about a time you needed help or agreement from someone you had no authority over. How did you get it?",
      ar: "حدّثنا عن موقف احتجت فيه إلى مساعدة شخص أو موافقته دون أن تكون لك سلطة عليه. كيف حصلت عليها؟",
    },
    situational: {
      en: "Imagine you need another team to change their schedule so your work can finish on time, but they gain nothing obvious. How would you approach them?",
      ar: "لنفترض أنك تحتاج إلى أن يعدّل فريق آخر جدوله كي تُنجز عملك في موعده، دون أن يعود ذلك عليه بفائدة واضحة. كيف تفاتحه في الأمر؟",
    },
    followUps: [
      {
        en: "What did that person care about, and how did you find out?",
        ar: "ما الذي كان يهمّ ذلك الشخص، وكيف عرفت ذلك؟",
      },
      {
        en: "What objection did you expect, and how did you deal with it before it was raised?",
        ar: "ما الاعتراض الذي توقعته، وكيف عالجته قبل أن يُطرح؟",
      },
    ],
    listenFor: [
      {
        en: "Describes what the other person valued and how they learned it",
        ar: "يصف ما كان يهمّ الطرف الآخر وكيف عرف ذلك",
      },
      {
        en: "Framed the request around shared goals or mutual benefit",
        ar: "صاغ طلبه على أساس هدف مشترك أو منفعة متبادلة",
      },
      {
        en: "Talked to key people early and addressed objections in advance",
        ar: "تحدّث مبكرًا مع الأشخاص المؤثرين وعالج اعتراضاتهم مسبقًا",
      },
    ],
    watchFor: [
      {
        en: "Kept insisting, went over their head, or gave up",
        ar: "ظلّ يُلحّ، أو تخطّى الشخص إلى رئيسه، أو استسلم",
      },
      {
        en: "Explains only their own position, never the other side's",
        ar: "لا يشرح إلا موقفه هو، ولا يتطرق إلى موقف الطرف الآخر",
      },
    ],
  },

  "leadership.ownership": {
    question: {
      en: "Tell me about a time something went wrong and part of it was your responsibility. What did you do?",
      ar: "حدّثنا عن موقف ساءت فيه الأمور وكان جزء من المسؤولية يقع عليك. ماذا فعلت؟",
    },
    situational: {
      en: "Imagine you notice a problem that affects your team but is not clearly anyone's job, and nobody is acting on it. What would you do?",
      ar: "لنفترض أنك لاحظت مشكلة تمسّ فريقك، لكنها ليست من مهام أحد بعينه، ولا أحد يتحرك لحلها. ماذا تفعل؟",
    },
    followUps: [
      {
        en: "What was your own part in what went wrong?",
        ar: "ما نصيبك أنت مما حدث؟",
      },
      {
        en: "How did you follow it through, and who did you keep informed?",
        ar: "كيف تابعت الأمر حتى النهاية، ومن أبقيته على اطلاع؟",
      },
    ],
    listenFor: [
      {
        en: "Names their own part in the problem without excuses",
        ar: "يحدد نصيبه من المشكلة دون أعذار",
      },
      {
        en: "Describes specific actions they took and followed through",
        ar: "يصف خطوات محددة اتخذها وتابعها حتى النهاية",
      },
      {
        en: "Stepped in beyond their role while keeping the owners informed",
        ar: "تدخّل فيما يتجاوز دوره مع إبقاء المسؤولين على اطلاع",
      },
    ],
    watchFor: [
      {
        en: "Puts the problem down to others or to circumstances",
        ar: "يردّ المشكلة إلى الآخرين أو إلى الظروف",
      },
      {
        en: "Took no action because it 'was not their job'",
        ar: "لم يتحرك لأن الأمر «ليس من مهامه»",
      },
    ],
  },

  "leadership.developing-others": {
    question: {
      en: "Tell me about a time you helped someone get better at something, rather than doing it for them. What did you do?",
      ar: "حدّثنا عن موقف ساعدت فيه شخصًا على تحسين أدائه في أمر ما، بدل أن تؤديه عنه. ماذا فعلت؟",
    },
    situational: {
      en: "Imagine a new colleague keeps making the same mistake on a task you could do quickly yourself. What would you do?",
      ar: "لنفترض أن زميلًا جديدًا يكرر الخطأ نفسه في مهمة تستطيع أنت إنجازها بسرعة. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "How did you decide how much help to give?",
        ar: "كيف حددت مقدار المساعدة المناسب له؟",
      },
      {
        en: "How did you know they had actually learned it?",
        ar: "كيف عرفت أنه تعلّم الأمر فعلًا؟",
      },
    ],
    listenFor: [
      {
        en: "Asked questions that led the person to the answer",
        ar: "طرح أسئلة قادت الشخص إلى الإجابة بنفسه",
      },
      {
        en: "Matched the level of support to the person's current ability",
        ar: "قدّم دعمًا يتناسب مع مستوى الشخص الحالي",
      },
      {
        en: "Explained the reasons, then checked understanding or progress",
        ar: "شرح الأسباب، ثم تأكد من الفهم أو التقدم",
      },
    ],
    watchFor: [
      {
        en: "Took the task over, or criticised without guidance",
        ar: "تولّى المهمة بنفسه، أو انتقد دون توجيه",
      },
      {
        en: "Gave instructions but never explained why or checked understanding",
        ar: "أعطى تعليمات دون شرح أسبابها أو التحقق من الفهم",
      },
    ],
  },

  "leadership.handling-conflict": {
    question: {
      en: "Tell me about a time two people you worked with disagreed and it was affecting the work. What did you do?",
      ar: "حدّثنا عن موقف نشب فيه خلاف بين زميلين لك وبدأ يؤثر في سير العمل. ماذا فعلت؟",
    },
    situational: {
      en: "Imagine two teammates keep clashing over how to do a shared task, and the deadline is near. What would you do?",
      ar: "لنفترض أن زميلين في فريقك يختلفان باستمرار على طريقة أداء مهمة مشتركة، والموعد النهائي يقترب. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "What did each person actually need, beyond what they were saying?",
        ar: "ما الذي كان يحتاج إليه كل منهما فعلًا، بعيدًا عمّا كان يقوله؟",
      },
      {
        en: "How did it end, and did the disagreement come back?",
        ar: "كيف انتهى الخلاف، وهل تجدّد بعد ذلك؟",
      },
    ],
    listenFor: [
      {
        en: "Heard each side before acting and states each view fairly",
        ar: "استمع إلى الطرفين قبل أن يتصرف، ويعرض رأي كل منهما بإنصاف",
      },
      {
        en: "Separates what each person demanded from what they needed",
        ar: "يميّز ما طالب به كل طرف مما كان يحتاج إليه فعلًا",
      },
      {
        en: "Proposed an option that met both sides' key interests",
        ar: "اقترح حلًا يلبّي المصالح الأساسية للطرفين",
      },
    ],
    watchFor: [
      {
        en: "Avoided the issue, took sides early, or raised the tension",
        ar: "تجنّب المشكلة، أو انحاز مبكرًا، أو زاد التوتر",
      },
      {
        en: "Pushed a quick compromise without finding the real disagreement",
        ar: "فرض حلًا وسطًا سريعًا دون أن يحدد جوهر الخلاف",
      },
    ],
  },

  "leadership.courage": {
    question: {
      en: "Tell me about a time you disagreed with a decision made by someone more senior. What did you do?",
      ar: "حدّثنا عن موقف لم تتفق فيه مع قرار اتخذه من هو أعلى منك منصبًا. ماذا فعلت؟",
    },
    situational: {
      en: "Imagine everyone in a meeting supports a plan, but you have good reason to think it will fail. What would you do?",
      ar: "لنفترض أن جميع الحاضرين في اجتماع يؤيدون خطة، ولديك أسباب وجيهة للاعتقاد بأنها ستفشل. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "When and how did you raise it, and with whom?",
        ar: "متى أثرت الأمر، وكيف، ومع من؟",
      },
      {
        en: "What happened when you were challenged? What would have changed your mind?",
        ar: "ماذا حدث حين واجهت اعتراضًا؟ وما الذي كان سيغيّر رأيك؟",
      },
    ],
    listenFor: [
      {
        en: "Raised the concern directly with the right person, before the decision",
        ar: "أثار اعتراضه مباشرةً مع الشخص المعني قبل اتخاذ القرار",
      },
      {
        en: "Gave clear reasons and stayed respectful",
        ar: "قدّم أسبابًا واضحة والتزم الاحترام",
      },
      {
        en: "Held the position when challenged, while open to new evidence",
        ar: "ثبت على موقفه حين اعتُرض عليه، مع انفتاحه على أدلة جديدة",
      },
    ],
    watchFor: [
      {
        en: "Stayed silent or went along despite serious doubts",
        ar: "التزم الصمت أو جارى القرار رغم شكوك جدية",
      },
      {
        en: "Raised it only afterwards, or dropped it at the first pushback",
        ar: "لم يُثر الأمر إلا بعد فوات الأوان، أو تراجع عند أول اعتراض",
      },
    ],
  },

  // ─── Management ──────────────────────────────────────────────────────────────
  management: {
    question: {
      en: "Tell me about a time you were responsible for getting a piece of work done with other people. How did you organise it?",
      ar: "حدّثنا عن موقف تولّيت فيه مسؤولية إنجاز عمل مع آخرين. كيف نظّمت العمل؟",
    },
    situational: {
      en: "Imagine you are given a project with three people, a fixed deadline and more work than time. How would you organise it?",
      ar: "لنفترض أنك كُلّفت بمشروع مع ثلاثة أشخاص، وموعده النهائي ثابت، والعمل المطلوب أكبر من الوقت المتاح. كيف تنظّمه؟",
    },
    followUps: [
      {
        en: "How did you keep track of progress, and what did you do when something slipped?",
        ar: "كيف تابعت سير العمل، وماذا فعلت حين تأخر جزء منه؟",
      },
      {
        en: "What would you organise differently next time?",
        ar: "ما الذي كنت ستنظّمه بطريقة مختلفة لو تكرر الأمر؟",
      },
    ],
    listenFor: [
      {
        en: "Explains how they set priorities and what they deferred",
        ar: "يشرح كيف حدّد الأولويات وما الذي أجّله",
      },
      {
        en: "Matched tasks to people and made expectations clear",
        ar: "وزّع المهام بحسب قدرات الأشخاص ووضّح المطلوب من كل منهم",
      },
      {
        en: "Tracked progress and acted before deadlines were missed",
        ar: "تابع التقدم وتدخّل قبل فوات المواعيد",
      },
    ],
    watchFor: [
      {
        en: "Did all the work themselves instead of involving others",
        ar: "أنجز العمل كله بنفسه بدل إشراك الآخرين",
      },
      {
        en: "Cannot say who was doing what, or by when",
        ar: "لا يستطيع أن يحدد من كان يتولى ماذا، ولا متى",
      },
    ],
  },

  "management.planning-prioritisation": {
    question: {
      en: "Tell me about a time you had more to do than time allowed. How did you decide what came first and what to drop?",
      ar: "حدّثنا عن موقف كان فيه العمل المطلوب منك أكبر من الوقت المتاح. كيف حددت ما يأتي أولًا وما يمكن الاستغناء عنه؟",
    },
    situational: {
      en: "Imagine you have five tasks due this week, two depend on other people, and you can only finish three. How would you plan the week?",
      ar: "لنفترض أن لديك خمس مهام يحين موعدها هذا الأسبوع، اثنتان منها تعتمدان على آخرين، ولا يتسع وقتك إلا لثلاث. كيف تخطط لأسبوعك؟",
    },
    followUps: [
      {
        en: "What did you defer or drop, and who did you tell?",
        ar: "ما الذي أجّلته أو تخليت عنه، ومن أبلغت بذلك؟",
      },
      {
        en: "What risks did you plan for, and did any of them happen?",
        ar: "ما المخاطر التي حسبت حسابها في خطتك، وهل وقع شيء منها؟",
      },
    ],
    listenFor: [
      {
        en: "Ranks tasks by importance and urgency, not urgency alone",
        ar: "يرتّب المهام بحسب أهميتها وإلحاحها معًا، لا بحسب الإلحاح وحده",
      },
      {
        en: "Accounts for dependencies and leaves time for known risks",
        ar: "يراعي الترابط بين المهام ويترك هامشًا زمنيًا للمخاطر المعروفة",
      },
      {
        en: "Says what was deferred or dropped and who was told",
        ar: "يذكر ما أجّله أو تخلّى عنه ومن أبلغ بذلك",
      },
    ],
    watchFor: [
      {
        en: "Treats every task as top priority, or overcommits",
        ar: "يعامل كل مهمة على أنها أولوية قصوى، أو يلتزم بما يفوق طاقته",
      },
      {
        en: "Works in order of who asked loudest or last",
        ar: "يُنجز المهام بحسب من يُلحّ أكثر أو من طلب أخيرًا",
      },
    ],
  },

  "management.delegation": {
    question: {
      en: "Tell me about a time you handed a task to someone else. How did you choose them, and what did you tell them?",
      ar: "حدّثنا عن موقف أوكلت فيه مهمة إلى شخص آخر. كيف اخترته، وماذا قلت له؟",
    },
    situational: {
      en: "Imagine you lead a small group project and must give an important task to a member who has never done it before. How would you hand it over?",
      ar: "لنفترض أنك تقود مشروعًا جماعيًا صغيرًا، وعليك إسناد مهمة أساسية إلى عضو لم يؤدّها من قبل. كيف تسلّمه إياها؟",
    },
    followUps: [
      {
        en: "How did you agree on the outcome, the deadline and how much they could decide alone?",
        ar: "كيف اتفقتما على النتيجة المطلوبة والموعد وحدود ما يقرره بمفرده؟",
      },
      {
        en: "What did you do when they ran into difficulty?",
        ar: "ماذا فعلت حين واجه صعوبة؟",
      },
    ],
    listenFor: [
      {
        en: "Chose the person based on skills and current workload",
        ar: "اختار الشخص بناءً على مهاراته وحجم العمل الذي بين يديه",
      },
      {
        en: "Stated the expected outcome, deadline and level of authority",
        ar: "حدّد النتيجة المطلوبة والموعد ومستوى الصلاحية",
      },
      {
        en: "Set check-ins suited to the risk without taking the task back",
        ar: "حدّد مواعيد متابعة تتناسب مع المخاطر، دون أن يسترد المهمة",
      },
    ],
    watchFor: [
      {
        en: "Kept work they should have handed off, or picked whoever was free",
        ar: "احتفظ بعمل كان ينبغي أن يُسنده، أو أوكله لأول شخص متفرغ",
      },
      {
        en: "Left the outcome or authority unclear, then took the task back",
        ar: "ترك النتيجة المطلوبة أو حدود الصلاحية غامضة، ثم استرد المهمة",
      },
    ],
  },

  "management.resource-allocation": {
    question: {
      en: "Tell me about a time you had limited time, money or people and several things competing for them. How did you decide where they went?",
      ar: "حدّثنا عن موقف كانت فيه مواردك من وقت أو مال أو أفراد محدودة، وتتنافس عليها أعمال عدة. كيف قررت توزيعها؟",
    },
    situational: {
      en: "Imagine you have a small budget and three requests, each worth doing, but you can fully fund only one. How would you decide?",
      ar: "لنفترض أن لديك ميزانية صغيرة وثلاثة طلبات كلها جديرة بالتنفيذ، ولا يكفي المال إلا لتمويل واحد منها بالكامل. كيف تقرر؟",
    },
    followUps: [
      {
        en: "What did you expect each option to deliver, and how did you compare them?",
        ar: "ما العائد الذي توقعته من كل خيار، وكيف قارنت بينها؟",
      },
      {
        en: "What ended up under-resourced as a result, and how did you handle that?",
        ar: "ما الذي نقصت موارده نتيجة لذلك، وكيف تعاملت مع هذا النقص؟",
      },
    ],
    listenFor: [
      {
        en: "Ties the allocation to stated priorities or goals",
        ar: "يربط التوزيع بأولويات أو أهداف محددة",
      },
      {
        en: "Compares what each option would return before choosing",
        ar: "يقارن العائد المتوقع من كل خيار قبل الاختيار",
      },
      {
        en: "Kept some capacity in reserve for likely surprises",
        ar: "احتفظ بجزء من الموارد احتياطًا للمفاجآت المحتملة",
      },
    ],
    watchFor: [
      {
        en: "Split resources evenly or by habit, without reference to goals",
        ar: "وزّع الموارد بالتساوي أو بحكم العادة، دون ربطها بالأهداف",
      },
      {
        en: "Gave resources to the loudest or most visible request",
        ar: "منح الموارد للطلب الأعلى صوتًا أو الأكثر ظهورًا",
      },
    ],
  },

  "management.performance-management": {
    question: {
      en: "Tell me about a time a colleague's or team member's work fell short of what was needed. How did you deal with it?",
      ar: "حدّثنا عن موقف جاء فيه عمل أحد زملائك أو أعضاء فريقك دون المستوى المطلوب. كيف تعاملت مع ذلك؟",
    },
    situational: {
      en: "Imagine a teammate has missed several deadlines lately, the team is getting frustrated, and you are asked to talk to them. What would you do?",
      ar: "لنفترض أن زميلًا في الفريق تكرّر تأخره في التسليم مؤخرًا، وبدأ الاستياء يسود الفريق، وطُلب منك أن تتحدث إليه. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "What specific examples did you use, and what did you agree on?",
        ar: "ما الأمثلة المحددة التي استندت إليها، وعلامَ اتفقتما؟",
      },
      {
        en: "What did you find was behind the problem, and how did that shape your approach?",
        ar: "ما الذي تبيّن لك أنه وراء المشكلة، وكيف أثّر ذلك في طريقة تعاملك معها؟",
      },
    ],
    listenFor: [
      {
        en: "Used specific examples of the gap, not general complaints",
        ar: "استند إلى أمثلة محددة على القصور، لا إلى شكاوى عامة",
      },
      {
        en: "Explored whether the cause was skill, motivation or workload",
        ar: "بحث في السبب: نقص في المهارة أم في الدافع أم ضغط في العمل",
      },
      {
        en: "Agreed clear expectations and a follow-up date",
        ar: "اتفق على توقعات واضحة وموعد للمتابعة",
      },
    ],
    watchFor: [
      {
        en: "Ignored the problem, or went straight to blame or threats",
        ar: "تجاهل المشكلة، أو لجأ مباشرةً إلى اللوم أو التهديد",
      },
      {
        en: "Spoke in general terms, with no examples or next steps",
        ar: "تحدّث بعبارات عامة دون أمثلة أو خطوات تالية",
      },
    ],
  },

  "management.follow-through": {
    question: {
      en: "Tell me about a piece of work you committed to that started to fall behind. When did you notice, and what did you do?",
      ar: "حدّثنا عن عمل التزمت بإنجازه ثم بدأ يتأخر عن موعده. متى انتبهت إلى ذلك، وماذا فعلت؟",
    },
    situational: {
      en: "Imagine you promised a piece of work in two weeks, and after one week you are only a quarter done. What would you do?",
      ar: "لنفترض أنك وعدت بتسليم عمل خلال أسبوعين، ومضى أسبوع ولم تُنجز إلا ربعه. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "How were you tracking progress, and what was the first sign of trouble?",
        ar: "ما الطريقة التي تابعت بها سير العمل، وما أول مؤشر نبّهك إلى المشكلة؟",
      },
      {
        en: "After delivery, how did you check the work achieved what was intended?",
        ar: "بعد التسليم، كيف تأكدت من أن العمل حقق الغرض منه؟",
      },
    ],
    listenFor: [
      {
        en: "Describes the milestones or checkpoints they set, and who owned each",
        ar: "يصف المراحل أو نقاط المراجعة التي حدّدها ومن يتولى كلًّا منها",
      },
      {
        en: "Noticed slippage early and changed scope, resources or timing",
        ar: "انتبه إلى التأخر مبكرًا فعدّل النطاق أو الموارد أو التوقيت",
      },
      {
        en: "Told affected people before the deadline was at risk",
        ar: "أبلغ المتأثرين قبل أن يصبح الموعد مهددًا",
      },
    ],
    watchFor: [
      {
        en: "Had no way of tracking progress once work started",
        ar: "لم تكن لديه وسيلة لمتابعة التقدم بعد بدء العمل",
      },
      {
        en: "Acted only after the deadline was already missed",
        ar: "لم يتحرك إلا بعد فوات الموعد",
      },
    ],
  },

  // ─── Communication ───────────────────────────────────────────────────────────
  communication: {
    question: {
      en: "Tell me about a time it was important that someone understood you clearly and acted on it. How did you get your message across?",
      ar: "حدّثنا عن موقف كان من المهم فيه أن يفهمك شخص ما بوضوح ويتصرف بناءً على كلامك. كيف أوصلت رسالتك؟",
    },
    situational: {
      en: "Imagine you must explain a change in plans to people who will be unhappy about it. How would you prepare, and what would you say?",
      ar: "لنفترض أن عليك شرح تغيير في الخطة لأشخاص لن يرضيهم هذا التغيير. كيف تستعد، وماذا تقول؟",
    },
    followUps: [
      {
        en: "How did you know they had understood what you meant?",
        ar: "كيف عرفت أنهم فهموا ما تقصده؟",
      },
      {
        en: "What did you adjust for that audience, and why?",
        ar: "ما الذي عدّلته في رسالتك لتناسب ذلك الجمهور، ولماذا؟",
      },
    ],
    listenFor: [
      {
        en: "Led with the main point and the action needed",
        ar: "بدأ بالفكرة الرئيسة والإجراء المطلوب",
      },
      {
        en: "Adjusted the detail and wording to the listener",
        ar: "كيّف مستوى التفاصيل والصياغة بحسب المتلقي",
      },
      {
        en: "Checked understanding, e.g. asked them to restate or confirm",
        ar: "تأكد من الفهم، كأن طلب من المتلقي إعادة الفكرة أو تأكيدها",
      },
    ],
    watchFor: [
      {
        en: "Cannot sum up the main point of their own message",
        ar: "لا يستطيع تلخيص الفكرة الرئيسة لرسالته",
      },
      {
        en: "Gives every audience the same message, unchanged",
        ar: "يوجّه الرسالة نفسها إلى كل جمهور دون تعديل",
      },
    ],
  },

  "communication.clarity-structure": {
    question: {
      en: "Tell me about a time you had to explain something complicated in a short time. How did you organise what you said?",
      ar: "حدّثنا عن موقف اضطررت فيه إلى شرح أمر معقّد في وقت قصير. كيف رتّبت كلامك؟",
    },
    situational: {
      en: "Imagine you have two minutes to update a busy manager on a problem and get a decision. How would you use those two minutes?",
      ar: "لنفترض أن أمامك دقيقتين فقط لإطلاع مدير مشغول على مشكلة والحصول على قرار منه. كيف ترتّب هاتين الدقيقتين؟",
    },
    followUps: [
      {
        en: "What did you leave out, and how did you decide?",
        ar: "ما الذي حذفته، وكيف قررت ذلك؟",
      },
      {
        en: "If I asked your audience now, what would they say your main point was?",
        ar: "لو سألنا جمهورك الآن، ماذا سيقولون عن فكرتك الرئيسة؟",
      },
    ],
    listenFor: [
      {
        en: "Opened with the main point, then gave supporting points",
        ar: "بدأ بالفكرة الرئيسة ثم قدّم ما يدعمها",
      },
      {
        en: "Cut detail the audience did not need, and says what",
        ar: "حذف التفاصيل التي لا يحتاج إليها الجمهور، ويذكر ما حذفه",
      },
      {
        en: "Asked explicitly for the decision or action they wanted",
        ar: "طلب القرار أو الإجراء الذي يريده صراحةً",
      },
    ],
    watchFor: [
      {
        en: "Their answer in the interview itself rambles or buries the point",
        ar: "إجابته في المقابلة نفسها مسهبة أو تضيع فيها الفكرة",
      },
      {
        en: "Includes every detail, so the listener has to dig for the point",
        ar: "يذكر كل التفاصيل، فيضطر السامع إلى البحث عن الفكرة",
      },
    ],
  },

  "communication.adapting-to-audience": {
    question: {
      en: "Tell me about a time you explained the same thing to two very different audiences. What did you change between them?",
      ar: "حدّثنا عن موقف شرحت فيه الأمر نفسه لجمهورين مختلفين تمامًا. ما الذي غيّرته بين المرتين؟",
    },
    situational: {
      en: "Imagine you must explain a technical delay to a customer and then to your own team. How would the two explanations differ?",
      ar: "لنفترض أن عليك شرح سبب تأخر فني لأحد العملاء، ثم لفريقك. بماذا سيختلف الشرحان؟",
    },
    followUps: [
      {
        en: "How did you work out what each audience cared about?",
        ar: "كيف عرفت ما يهمّ كل جمهور منهما؟",
      },
      {
        en: "Which terms did you explain or avoid, and why?",
        ar: "ما المصطلحات التي شرحتها أو تجنّبتها، ولماذا؟",
      },
    ],
    listenFor: [
      {
        en: "Names what each audience cared about, e.g. cost, time or impact on users",
        ar: "يحدد ما كان يهمّ كل جمهور، كالتكلفة أو الوقت أو الأثر في المستخدمين",
      },
      {
        en: "Changed the content and level of detail, not just the tone",
        ar: "غيّر المحتوى ومستوى التفاصيل، لا النبرة فقط",
      },
      {
        en: "Explained or replaced specialist terms for non-specialists",
        ar: "شرح المصطلحات المتخصصة لغير المتخصصين أو استعاض عنها بكلمات بسيطة",
      },
    ],
    watchFor: [
      {
        en: "Used the same content and jargon with everyone",
        ar: "استخدم المحتوى والمصطلحات نفسها مع الجميع",
      },
      {
        en: "Changed only the tone, keeping detail the audience did not need",
        ar: "غيّر النبرة فقط، وأبقى تفاصيل لا يحتاج إليها الجمهور",
      },
    ],
  },

  "communication.written-communication": {
    question: {
      en: "Tell me about an important email or written message you sent that needed someone to act. How did you write it, and what happened?",
      ar: "حدّثنا عن رسالة مكتوبة مهمة كان الهدف منها أن يتخذ أحدهم إجراءً. كيف صغتها، وما الذي حدث بعدها؟",
    },
    situational: {
      en: "Imagine you must email five people about a problem: two must act by Thursday, three only need to know. How would you write it?",
      ar: "لنفترض أن عليك مراسلة خمسة أشخاص بشأن مشكلة: اثنان منهم مطالبان بإجراء بحلول الخميس، والثلاثة الآخرون يكفي أن يعلموا بها. كيف تكتب الرسالة؟",
    },
    followUps: [
      {
        en: "What did you put in the first lines, and why?",
        ar: "ماذا وضعت في السطور الأولى، ولماذا؟",
      },
      {
        en: "Did anyone misunderstand or need to ask again? What did you learn from that?",
        ar: "هل أساء أحد فهم الرسالة أو احتاج إلى الاستفسار مجددًا؟ وما الذي تعلمته من ذلك؟",
      },
    ],
    listenFor: [
      {
        en: "Put the purpose and the request in the opening lines",
        ar: "وضع الغرض والطلب في السطور الأولى",
      },
      {
        en: "Stated precisely who had to do what, and by when",
        ar: "حدّد بدقة من عليه أن يفعل ماذا، ومتى",
      },
      {
        en: "Chose a format suited to the channel and the reader",
        ar: "اختار صيغة تناسب الوسيلة والقارئ",
      },
    ],
    watchFor: [
      {
        en: "The message mixed topics or left readers unsure what to do",
        ar: "خلط بين موضوعات عدة أو ترك القراء حائرين فيما عليهم فعله",
      },
      {
        en: "The request was only implied, or key facts were missing",
        ar: "جاء الطلب ضمنيًا، أو غابت حقائق أساسية",
      },
    ],
  },

  "communication.persuasion": {
    question: {
      en: "Tell me about a time you persuaded someone to change their mind or try something new. How did you make your case?",
      ar: "حدّثنا عن موقف أقنعت فيه شخصًا بتغيير رأيه أو بتجربة شيء جديد. كيف عرضت حجتك؟",
    },
    situational: {
      en: "Imagine you think your team should stop using a tool everyone is used to, and most of them are against it. How would you make the case?",
      ar: "لنفترض أنك ترى أن على فريقك التخلي عن أداة اعتادها الجميع، ومعظمهم يعارضون ذلك. كيف تقنعهم؟",
    },
    followUps: [
      {
        en: "What objection did you hear, and how did you respond?",
        ar: "ما الاعتراض الذي سمعته، وكيف رددت عليه؟",
      },
      {
        en: "What weakness in your proposal did you admit, and how?",
        ar: "ما نقطة الضعف التي اعترفت بها في مقترحك، وكيف عرضتها؟",
      },
    ],
    listenFor: [
      {
        en: "Built the case around the other person's goals",
        ar: "بنى حجته على أهداف الطرف الآخر",
      },
      {
        en: "Used evidence and addressed the main objection",
        ar: "استند إلى أدلة وتناول الاعتراض الرئيس",
      },
      {
        en: "Admitted a weakness honestly and proposed a specific next step",
        ar: "اعترف بنقطة ضعف بصراحة واقترح خطوة تالية محددة",
      },
    ],
    watchFor: [
      {
        en: "Relied on insistence, repetition or rank",
        ar: "اعتمد على الإلحاح أو التكرار أو سلطة المنصب",
      },
      {
        en: "Gave reasons that mattered to them, not to the audience",
        ar: "قدّم أسبابًا تهمّه هو لا تهمّ جمهوره",
      },
    ],
  },

  "communication.listening": {
    question: {
      en: "Tell me about a time you realised someone's real concern was different from what they first said. How did you find out?",
      ar: "حدّثنا عن موقف أدركت فيه أن ما يقلق شخصًا ما في الحقيقة يختلف عمّا قاله في البداية. كيف اكتشفت ذلك؟",
    },
    situational: {
      en: "Imagine a colleague keeps asking for small changes to your work, though each one seems minor. How would you find out what is really going on?",
      ar: "لنفترض أن زميلًا يطلب منك باستمرار تعديلات صغيرة على عملك، وكل منها يبدو بسيطًا. كيف تعرف حقيقة ما يشغله؟",
    },
    followUps: [
      {
        en: "What questions did you ask, and what did you learn from them?",
        ar: "ما الأسئلة التي طرحتها، وما الذي عرفته منها؟",
      },
      {
        en: "How did you check you had understood them correctly?",
        ar: "كيف تأكدت من أنك فهمته على النحو الصحيح؟",
      },
    ],
    listenFor: [
      {
        en: "Describes specific clarifying questions they asked",
        ar: "يذكر أسئلة استيضاحية محددة طرحها",
      },
      {
        en: "Picked up an unstated concern and checked it with the person",
        ar: "التقط قلقًا غير معلن وتحقق منه مع صاحبه",
      },
      {
        en: "Changed their response to address the real concern",
        ar: "عدّل ردّه ليعالج مصدر القلق الحقيقي",
      },
    ],
    watchFor: [
      {
        en: "Answered a different point from the one raised",
        ar: "ردّ على نقطة غير التي طُرحت",
      },
      {
        en: "Took the words literally and missed the need behind them",
        ar: "أخذ الكلام بحرفيته وغابت عنه الحاجة الكامنة وراءه",
      },
    ],
  },

  "communication.difficult-conversations": {
    question: {
      en: "Tell me about a time you had to tell someone something they did not want to hear. How did you handle the conversation?",
      ar: "حدّثنا عن موقف اضطررت فيه إلى إبلاغ شخص بأمر لا يرغب في سماعه. كيف أدرت الحديث؟",
    },
    situational: {
      en: "Imagine you must tell a colleague that their part of a project has to be redone, and they are likely to be upset. What would you do?",
      ar: "لنفترض أن عليك إبلاغ زميل بأن الجزء الذي أنجزه من المشروع يجب أن يُعاد، ومن المتوقع أن يستاء. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "How did they react, and what did you say then?",
        ar: "كيف كان ردّ فعله، وبماذا أجبته حينها؟",
      },
      {
        en: "How was your working relationship afterwards?",
        ar: "كيف أصبحت علاقة العمل بينكما بعد ذلك؟",
      },
    ],
    listenFor: [
      {
        en: "Stated the core message clearly and kept it intact",
        ar: "عرض الرسالة الأساسية بوضوح ولم يتنازل عن جوهرها",
      },
      {
        en: "Acknowledged the person's feelings in specific terms",
        ar: "أقرّ بمشاعر الطرف الآخر بعبارات تخص موقفه",
      },
      {
        en: "Calmed tension by naming it and refocusing on shared goals",
        ar: "خفّف التوتر بتسميته بهدوء ثم العودة إلى الأهداف المشتركة",
      },
    ],
    watchFor: [
      {
        en: "Avoided the talk, was abrupt, or became defensive",
        ar: "تهرّب من الحديث، أو كان فظًّا، أو اتخذ موقفًا دفاعيًا",
      },
      {
        en: "Softened the message so much that the point was lost",
        ar: "لطّف الرسالة حتى ضاعت الفكرة الأساسية",
      },
    ],
  },

  // ─── Creativity and product thinking ─────────────────────────────────────────
  "product-thinking": {
    question: {
      en: "Tell me about something you designed or improved for the people who use it, such as a product, service or process. How did you decide what to do?",
      ar: "حدّثنا عن شيء صمّمته أو طوّرته لمن يستخدمونه، كمنتج أو خدمة أو إجراء. كيف حددت ما ينبغي فعله؟",
    },
    situational: {
      en: "Imagine users of a service you run say it is 'too complicated'. How would you work out what to change?",
      ar: "لنفترض أن مستخدمي خدمة تشرف عليها يصفونها بأنها «معقّدة جدًا». كيف تحدد ما يجب تغييره؟",
    },
    followUps: [
      {
        en: "What did you learn about the users, and how?",
        ar: "ما الذي عرفته عن المستخدمين، وكيف عرفته؟",
      },
      {
        en: "What options did you consider before settling on one?",
        ar: "ما الخيارات التي درستها قبل أن تستقر على أحدها؟",
      },
    ],
    listenFor: [
      {
        en: "Defines the problem: who has it, when, and how success shows",
        ar: "يحدد المشكلة: من تواجهه، ومتى، وكيف يُعرف النجاح",
      },
      {
        en: "Gives evidence from real users that shaped the decision",
        ar: "يقدّم أدلة من مستخدمين فعليين أثّرت في القرار",
      },
      {
        en: "Compared distinct options and tested a small version first",
        ar: "قارن بين خيارات مختلفة وجرّب نسخة صغيرة أولًا",
      },
    ],
    watchFor: [
      {
        en: "Starts from a feature idea and never states the problem",
        ar: "ينطلق من فكرة ميزة ولا يذكر المشكلة أبدًا",
      },
      {
        en: "Cannot say how they knew the solution worked for users",
        ar: "لا يعرف كيف تحقق من أن الحل نفع المستخدمين",
      },
    ],
  },

  "product-thinking.problem-framing": {
    question: {
      en: "Tell me about a time you were asked to build or deliver something and first questioned what problem it was meant to solve. What happened?",
      ar: "حدّثنا عن موقف طُلب منك فيه تنفيذ شيء ما، فتوقفت أولًا عند المشكلة التي يُفترض أن يحلها. ماذا حدث؟",
    },
    situational: {
      en: "Imagine you are asked to set up weekly reminder emails because people keep missing deadlines. What would you want to understand before starting?",
      ar: "لنفترض أنك كُلّفت بإرسال رسائل تذكير أسبوعية لأن كثيرين يتأخرون عن المواعيد النهائية. ما الذي تريد فهمه قبل أن تبدأ؟",
    },
    followUps: [
      {
        en: "How did you describe the problem: who had it, and when?",
        ar: "كيف وصفت المشكلة: من يواجهها، ومتى؟",
      },
      {
        en: "Did the problem turn out to be different from the original request? How?",
        ar: "هل تبيّن أن المشكلة تختلف عن الطلب الأصلي؟ وكيف؟",
      },
    ],
    listenFor: [
      {
        en: "States the problem specifically: who has it and when it occurs",
        ar: "يصف المشكلة بدقة: من يواجهها، ومتى تظهر",
      },
      {
        en: "Questioned whether the requested solution fit the real problem",
        ar: "تساءل عمّا إذا كان الحل المطلوب يعالج المشكلة الحقيقية",
      },
      {
        en: "Narrowed the problem to the part that mattered most",
        ar: "ضيّق المشكلة إلى الجزء الأهم منها",
      },
    ],
    watchFor: [
      {
        en: "Talks only about the requested solution, never the problem",
        ar: "لا يتحدث إلا عن الحل المطلوب، ولا يذكر المشكلة",
      },
      {
        en: "Describes the problem too broadly to guide any choice",
        ar: "يصف المشكلة بعبارات واسعة لا تساعد على أي اختيار",
      },
    ],
  },

  "product-thinking.user-empathy": {
    question: {
      en: "Tell me about a time you learned something about the people your work served that changed how you worked. How did you learn it?",
      ar: "حدّثنا عن موقف اكتشفت فيه أمرًا عن المستفيدين من عملك فغيّر طريقتك في العمل. كيف اكتشفته؟",
    },
    situational: {
      en: "Imagine you are improving a form that both first-time visitors and daily expert users fill in. How would you find out what each group needs?",
      ar: "لنفترض أنك تعمل على تحسين نموذج يملؤه زوار جدد ومستخدمون متمرسون يستخدمونه يوميًا. كيف تعرف ما تحتاج إليه كل فئة؟",
    },
    followUps: [
      {
        en: "What did you assume about them at first that turned out to be wrong?",
        ar: "ما الذي افترضته عنهم في البداية ثم تبيّن أنه خطأ؟",
      },
      {
        en: "Did different groups need different things? How did you handle that?",
        ar: "هل اختلفت احتياجات الفئات المختلفة؟ وكيف تعاملت مع ذلك؟",
      },
    ],
    listenFor: [
      {
        en: "Describes a user's goal, situation and main frustration concretely",
        ar: "يصف بدقة هدف المستخدم وظرفه وأكثر ما يضايقه",
      },
      {
        en: "Learned from real users, e.g. by watching, asking or testing",
        ar: "تعلّم من مستخدمين فعليين، بالملاحظة أو السؤال أو التجربة",
      },
      {
        en: "Notices where different user groups' needs conflict",
        ar: "ينتبه إلى تعارض احتياجات فئات المستخدمين",
      },
    ],
    watchFor: [
      {
        en: "Assumes users think and work like the team",
        ar: "يفترض أن المستخدمين يفكرون ويعملون مثل الفريق",
      },
      {
        en: "Speaks of 'users' in general, with no specific context",
        ar: "يتحدث عن «المستخدمين» عمومًا دون سياق محدد",
      },
    ],
  },

  "product-thinking.idea-generation": {
    question: {
      en: "Tell me about a time you came up with several different ways to solve a problem before choosing one. What were they?",
      ar: "حدّثنا عن موقف طرحت فيه عدة طرق مختلفة لحل مشكلة قبل أن تختار إحداها. ما هذه الطرق؟",
    },
    situational: {
      en: "Imagine fewer people attend your team's training sessions each month. What different ideas would you come up with to fix it?",
      ar: "لنفترض أن عدد حضور الدورات التدريبية التي ينظمها فريقك يتناقص كل شهر. ما الأفكار المختلفة التي تقترحها لمعالجة ذلك؟",
    },
    followUps: [
      {
        en: "How were the options genuinely different from each other?",
        ar: "بمَ تختلف هذه الخيارات فيما بينها اختلافًا حقيقيًا؟",
      },
      {
        en: "Did you combine parts of different ideas? Why did you pick the one you did?",
        ar: "هل جمعت عناصر من أفكار مختلفة؟ ولماذا اخترت ما اخترته؟",
      },
    ],
    listenFor: [
      {
        en: "Describes options that differ in approach, not just in detail",
        ar: "يصف خيارات تختلف في نهجها لا في تفاصيلها فقط",
      },
      {
        en: "Varied an assumption, such as cost, user or channel, to find options",
        ar: "غيّر افتراضًا ما، كالتكلفة أو المستخدم أو القناة، ليصل إلى خيارات جديدة",
      },
      {
        en: "Combined strong parts of several ideas, with a reason for the choice",
        ar: "جمع أفضل ما في عدة أفكار، وعلّل اختياره",
      },
    ],
    watchFor: [
      {
        en: "Offered one idea, or only the obvious one",
        ar: "قدّم فكرة واحدة، أو الفكرة البديهية وحدها",
      },
      {
        en: "The ideas are variations of the same approach",
        ar: "أفكاره صور متعددة للنهج نفسه",
      },
    ],
  },

  "product-thinking.solution-design": {
    question: {
      en: "Tell me about a time you turned an idea into something people actually used. What did the first version look like, and why?",
      ar: "حدّثنا عن موقف حوّلت فيه فكرة إلى شيء استخدمه الناس فعلًا. كيف كانت النسخة الأولى، ولماذا صمّمتها هكذا؟",
    },
    situational: {
      en: "Imagine you have one month and a small budget to give new staff a way to find answers to common questions. What would you build first?",
      ar: "لنفترض أن لديك شهرًا واحدًا وميزانية محدودة لتوفير وسيلة يجد بها الموظفون الجدد إجابات عن الأسئلة الشائعة. بماذا تبدأ؟",
    },
    followUps: [
      {
        en: "What did you leave out of the first version, and why?",
        ar: "ما الذي استبعدته من النسخة الأولى، ولماذا؟",
      },
      {
        en: "Where could users get stuck, and how did you plan for it?",
        ar: "أين كان يمكن أن يتعثر المستخدمون، وكيف استعددت لذلك؟",
      },
    ],
    listenFor: [
      {
        en: "Explains step by step how people would actually use it",
        ar: "يشرح خطوةً بخطوة كيف سيستخدمه الناس فعليًا",
      },
      {
        en: "Cut the solution to its essentials within the constraints",
        ar: "اختصر الحل إلى عناصره الأساسية ضمن القيود المتاحة",
      },
      {
        en: "Names edge cases or failure points, and a small first test",
        ar: "يذكر الحالات الاستثنائية أو نقاط الإخفاق، وتجربة أولى صغيرة",
      },
    ],
    watchFor: [
      {
        en: "Ignored stated constraints, or built something hard to use",
        ar: "تجاهل القيود المعلنة، أو صمّم شيئًا يصعب استخدامه",
      },
      {
        en: "Talks about technical features, not how users experience it",
        ar: "يتحدث عن الجوانب التقنية لا عن تجربة المستخدمين",
      },
    ],
  },

  "product-thinking.feature-prioritisation": {
    question: {
      en: "Tell me about a time you had to pick, from a long list, which improvements came first. How did you rank them?",
      ar: "حدّثنا عن موقف كان عليك فيه أن تختار من قائمة طويلة التحسينات التي تأتي أولًا. كيف رتّبتها؟",
    },
    situational: {
      en: "Imagine you have ten requested improvements and time for three. The most senior person wants one that few users would notice. How would you decide?",
      ar: "لنفترض أن أمامك عشرة تحسينات مطلوبة، ولا يتسع الوقت إلا لثلاثة، وصاحب أعلى منصب يريد تحسينًا لن يلاحظه إلا قليل من المستخدمين. كيف تقرر؟",
    },
    followUps: [
      {
        en: "What evidence did you use for the value of each item?",
        ar: "ما الأدلة التي اعتمدت عليها في تقدير قيمة كل بند؟",
      },
      {
        en: "What did you defer, and how did you explain that to the people who asked for it?",
        ar: "ما الذي أجّلته، وكيف شرحت ذلك لمن طلبوه؟",
      },
    ],
    listenFor: [
      {
        en: "Weighs value to users and the organisation against effort",
        ar: "يوازن بين القيمة للمستخدمين والمؤسسة من جهة والجهد من جهة أخرى",
      },
      {
        en: "Uses evidence of impact on users, not opinion or rank",
        ar: "يستند إلى أدلة على الأثر في المستخدمين، لا إلى الرأي أو المنصب",
      },
      {
        en: "Spots dependencies that change the order",
        ar: "ينتبه إلى الترابطات التي تغيّر الترتيب",
      },
    ],
    watchFor: [
      {
        en: "Ranked by personal preference, the loudest request or seniority",
        ar: "رتّب بحسب تفضيله الشخصي أو أعلى الأصوات أو أصحاب المناصب",
      },
      {
        en: "Considered value or effort, but not both",
        ar: "نظر إلى القيمة أو إلى الجهد، لا إلى كليهما",
      },
    ],
  },

  // ─── Collaboration and emotional intelligence ────────────────────────────────
  collaboration: {
    question: {
      en: "Tell me about a time working with others was harder than the work itself. What did you do?",
      ar: "حدّثنا عن موقف كان فيه التعامل مع الآخرين أصعب من العمل نفسه. ماذا فعلت؟",
    },
    situational: {
      en: "Imagine a teammate seems frustrated with you, but you do not know why. What would you do?",
      ar: "لنفترض أن زميلًا في الفريق يبدو مستاءً منك، ولا تعرف السبب. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "How do you think the other person saw the situation?",
        ar: "كيف كان الطرف الآخر يرى الموقف في رأيك؟",
      },
      {
        en: "What did you learn about yourself from it?",
        ar: "ما الذي تعلمته عن نفسك من هذه التجربة؟",
      },
    ],
    listenFor: [
      {
        en: "Explains what the others needed and how they adjusted to it",
        ar: "يشرح ما كان يحتاج إليه الآخرون وكيف تكيّف مع ذلك",
      },
      {
        en: "Names their own part in the difficulty",
        ar: "يحدد نصيبه هو من الصعوبة",
      },
      {
        en: "Describes a specific step they took to improve the working relationship",
        ar: "يصف خطوة محددة اتخذها لتحسين علاقة العمل",
      },
    ],
    watchFor: [
      {
        en: "Blames others entirely and sees their own role as faultless",
        ar: "يلقي اللوم كله على الآخرين ويرى دوره بلا أخطاء",
      },
      {
        en: "Cannot describe how others experienced working with them",
        ar: "لا يستطيع وصف تجربة الآخرين في العمل معه",
      },
    ],
  },

  "collaboration.self-awareness": {
    question: {
      en: "Tell me about a time you realised your own behaviour was making a situation worse. What did you notice, and what did you do?",
      ar: "حدّثنا عن موقف أدركت فيه أن تصرفك يزيد الأمور سوءًا. ما الذي لاحظته، وماذا فعلت؟",
    },
    situational: {
      en: "Imagine you get impatient in long meetings and a colleague tells you it shows. What would you do about it?",
      ar: "لنفترض أنك تفقد صبرك في الاجتماعات الطويلة، وأخبرك زميل بأن ذلك يظهر عليك. ماذا تفعل حيال ذلك؟",
    },
    followUps: [
      {
        en: "Which habit or tendency of yours played a part?",
        ar: "أي عاداتك أو ميولك أسهم في ذلك؟",
      },
      {
        en: "What have you done differently since then?",
        ar: "ما الذي تغيّر في طريقة عملك منذ ذلك الحين؟",
      },
    ],
    listenFor: [
      {
        en: "Names a specific habit or reaction of their own, unprompted",
        ar: "يسمّي عادة أو ردّ فعل محددًا لديه، دون أن يُطلب منه ذلك",
      },
      {
        en: "Links it to how it affected the situation and other people",
        ar: "يربط ذلك بأثره في الموقف وفي الآخرين",
      },
      {
        en: "Describes a concrete way they now counter it",
        ar: "يصف طريقة عملية يعتمدها الآن للحدّ من ذلك",
      },
    ],
    watchFor: [
      {
        en: "Describes their own role as entirely positive",
        ar: "يصف دوره على أنه إيجابي تمامًا",
      },
      {
        en: "Offers a generic weakness unrelated to the situation",
        ar: "يذكر نقطة ضعف عامة لا صلة لها بالموقف",
      },
    ],
  },

  "collaboration.empathy": {
    question: {
      en: "Tell me about a time a colleague was upset by a decision you supported. How did you understand their view, and what did you do?",
      ar: "حدّثنا عن موقف استاء فيه زميل من قرار أيّدته. كيف فهمت وجهة نظره، وماذا فعلت؟",
    },
    situational: {
      en: "Imagine a quiet team member's idea was dismissed in a meeting, and they have said little since. What would you do?",
      ar: "لنفترض أن فكرة طرحها زميل هادئ في الفريق قوبلت بالتجاهل في اجتماع، ومنذ ذلك الحين قلّما يتكلم. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "How would they describe their view, in their own words?",
        ar: "كيف كان سيصف وجهة نظره لو تحدث بنفسه؟",
      },
      {
        en: "How did you respond to their feelings without dropping what had to be done?",
        ar: "كيف تعاملت مع مشاعره دون أن تتخلى عمّا كان يجب إنجازه؟",
      },
    ],
    listenFor: [
      {
        en: "Describes specifically how the person felt, and why",
        ar: "يصف بدقة ما شعر به الشخص ولماذا",
      },
      {
        en: "States the other view in terms that person would accept",
        ar: "يعرض وجهة النظر الأخرى بعبارات يقبلها صاحبها",
      },
      {
        en: "Addressed feelings without avoiding the necessary decision",
        ar: "تعامل مع المشاعر دون أن يتهرب من القرار اللازم",
      },
    ],
    watchFor: [
      {
        en: "Dismisses feelings and focuses only on the task",
        ar: "يستخفّ بالمشاعر ولا يهتم إلا بالمهمة",
      },
      {
        en: "Uses generic phrases like 'I understood', with no specifics",
        ar: "يكتفي بعبارات عامة مثل «تفهّمت موقفه» دون تفاصيل",
      },
    ],
  },

  "collaboration.stakeholder-management": {
    question: {
      en: "Tell me about a piece of work that affected several groups of people. How did you work out who needed what, and keep them informed?",
      ar: "حدّثنا عن عمل كان يمسّ عدة فئات من الأشخاص. كيف عرفت ما يحتاج إليه كل طرف، وكيف أبقيتهم على اطلاع؟",
    },
    situational: {
      en: "Imagine you are replacing a tool several teams rely on, and one team will lose a feature they like. How would you handle it?",
      ar: "لنفترض أنك تتولى استبدال أداة تعتمد عليها عدة فرق، وسيخسر أحدها ميزة يفضّلها. كيف تدير الأمر؟",
    },
    followUps: [
      {
        en: "Where did the groups want different things, and how did you handle that?",
        ar: "أين تعارضت مطالب هذه الفئات، وكيف تعاملت مع ذلك؟",
      },
      {
        en: "Was anyone surprised or unhappy late on? What would you do differently?",
        ar: "هل فوجئ أحد أو استاء في مرحلة متأخرة؟ وما الذي كنت ستفعله بطريقة مختلفة؟",
      },
    ],
    listenFor: [
      {
        en: "Names the stakeholders and what each cared about",
        ar: "يسمّي أصحاب المصلحة وما كان يهمّ كلًّا منهم",
      },
      {
        en: "Spotted conflicting interests early and set expectations",
        ar: "رصد تعارض المصالح مبكرًا وضبط التوقعات",
      },
      {
        en: "Describes how and when they kept each group informed",
        ar: "يصف كيف أبقى كل فئة على اطلاع ومتى",
      },
    ],
    watchFor: [
      {
        en: "Considered only the person who asked for the work",
        ar: "لم يراعِ إلا من طلب العمل",
      },
      {
        en: "Treats all stakeholders as wanting the same thing",
        ar: "يتعامل مع أصحاب المصلحة كأنهم يريدون الشيء نفسه",
      },
    ],
  },

  "collaboration.taking-feedback": {
    question: {
      en: "Tell me about a time you received criticism you did not fully agree with. What did you do with it?",
      ar: "حدّثنا عن موقف تلقيت فيه انتقادًا لم تتفق معه تمامًا. كيف تعاملت معه؟",
    },
    situational: {
      en: "Imagine your manager says your work is good but your reports are hard to follow, and you think they are clear. What would you do?",
      ar: "لنفترض أن مديرك أثنى على عملك، لكنه قال إن تقاريرك يصعب فهمها، وأنت ترى أنها واضحة. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "Which parts did you accept, and which did you push back on? Why?",
        ar: "ما الذي قبلته من الانتقاد، وما الذي اعترضت عليه؟ ولماذا؟",
      },
      {
        en: "What did you change, and how did you check it made a difference?",
        ar: "ما الذي غيّرته، وكيف تأكدت من أن التغيير أحدث فرقًا؟",
      },
    ],
    listenFor: [
      {
        en: "Asked questions to understand the feedback before responding",
        ar: "طرح أسئلة ليفهم الملاحظات قبل أن يرد",
      },
      {
        en: "Calmly separates valid points from ones they disagree with",
        ar: "يميّز بهدوء النقاط الصائبة من تلك التي لا يتفق معها",
      },
      {
        en: "Names a specific change they made and how they checked it",
        ar: "يذكر تغييرًا محددًا أجراه وكيف تحقق من أثره",
      },
    ],
    watchFor: [
      {
        en: "Explains the criticism away, or still sounds defensive",
        ar: "يتنصّل من الانتقاد بالتبريرات، أو ما زال يتحدث بنبرة دفاعية",
      },
      {
        en: "Accepted it politely but cannot say what changed",
        ar: "تقبّل الملاحظات بأدب لكنه لا يذكر ما الذي تغيّر",
      },
    ],
  },

  "collaboration.team-orientation": {
    question: {
      en: "Tell me about a time you put your own work aside to help the team reach a shared goal. What did you do?",
      ar: "حدّثنا عن موقف أجّلت فيه عملك الخاص لمساعدة الفريق على بلوغ هدف مشترك. ماذا فعلت؟",
    },
    situational: {
      en: "Imagine you finish your part of a project early while a teammate is clearly behind, and nobody has asked you to help. What would you do?",
      ar: "لنفترض أنك أنهيت الجزء المسند إليك من مشروع مبكرًا، بينما يبدو زميلك متأخرًا بوضوح، ولم يطلب منك أحد المساعدة. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "What did it cost you, and why did you decide it was worth it?",
        ar: "ماذا كلّفك ذلك، ولماذا رأيت أنه يستحق؟",
      },
      {
        en: "How did you make sure others' contributions were recognised?",
        ar: "كيف حرصت على أن تحظى إسهامات الآخرين بالتقدير؟",
      },
    ],
    listenFor: [
      {
        en: "Offered help or information without being asked",
        ar: "عرض المساعدة أو شارك المعلومات دون أن يُطلب منه",
      },
      {
        en: "Changed their own priorities for the team's goal, and says what it cost",
        ar: "عدّل أولوياته من أجل هدف الفريق، ويذكر ما كلّفه ذلك",
      },
      {
        en: "Credits others' contributions by name and specifically",
        ar: "ينسب الفضل في إسهامات الآخرين إلى أصحابها بالتحديد",
      },
    ],
    watchFor: [
      {
        en: "Focuses on their own tasks or credit, even at the team's expense",
        ar: "ينشغل بمهامه أو بالفضل لنفسه، حتى على حساب الفريق",
      },
      {
        en: "Helped only when asked",
        ar: "لم يساعد إلا حين طُلب منه ذلك",
      },
    ],
  },

  // ─── Adaptability and learning ───────────────────────────────────────────────
  adaptability: {
    question: {
      en: "Tell me about a time your plans or responsibilities changed suddenly. What did you do in the first few days?",
      ar: "حدّثنا عن موقف تغيّرت فيه خططك أو مهامك فجأة. ماذا فعلت في الأيام الأولى؟",
    },
    situational: {
      en: "Imagine that halfway through a task you are told the goal has changed but the deadline stays the same. What would you do?",
      ar: "لنفترض أنك في منتصف مهمة، وأُبلغت بأن الهدف تغيّر بينما بقي الموعد النهائي كما هو. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "How did you set your priorities after the change?",
        ar: "كيف حددت أولوياتك بعد التغيير؟",
      },
      {
        en: "What did you learn from it that you have used since?",
        ar: "ما الذي تعلمته من ذلك واستفدت منه لاحقًا؟",
      },
    ],
    listenFor: [
      {
        en: "Worked out what the change affected before acting",
        ar: "قدّر ما يمسّه التغيير قبل أن يتصرف",
      },
      {
        en: "Kept working calmly and set clear priorities",
        ar: "واصل العمل بهدوء وحدّد أولويات واضحة",
      },
      {
        en: "Kept others informed of what the change meant for them",
        ar: "أبقى الآخرين على اطلاع بما يعنيه التغيير لهم",
      },
    ],
    watchFor: [
      {
        en: "Stuck to the old plan, or stopped until told what to do",
        ar: "تمسّك بالخطة القديمة، أو توقف حتى يُقال له ما يفعل",
      },
      {
        en: "Describes only the stress, not what they did",
        ar: "يتحدث عن الضغط الذي شعر به لا عمّا فعله",
      },
    ],
  },

  "adaptability.learning-speed": {
    question: {
      en: "Tell me about a mistake you made or feedback you received, and a later situation where you used that lesson. What did you do differently?",
      ar: "حدّثنا عن خطأ وقعت فيه أو ملاحظة تلقيتها، ثم عن موقف لاحق استفدت فيه من هذا الدرس. ما الذي فعلته بطريقة مختلفة؟",
    },
    situational: {
      en: "Imagine your first attempt at a new type of task comes back with corrections in several places. How would you make sure the next attempt is better?",
      ar: "لنفترض أن محاولتك الأولى في نوع جديد من المهام أعيدت إليك مع تصحيحات في مواضع عدة. كيف تضمن أن تكون محاولتك التالية أفضل؟",
    },
    followUps: [
      {
        en: "How was the later situation different from the first one on the surface?",
        ar: "بمَ اختلف الموقف اللاحق عن الأول في ظاهره؟",
      },
      {
        en: "What general principle did you take from it?",
        ar: "ما المبدأ العام الذي استخلصته من ذلك؟",
      },
    ],
    listenFor: [
      {
        en: "Names the specific lesson, not a general 'I learned a lot'",
        ar: "يحدد الدرس بعينه، لا عبارة عامة مثل «تعلمت الكثير»",
      },
      {
        en: "Applied it to a situation that looked different on the surface",
        ar: "طبّقه على موقف يبدو مختلفًا في ظاهره",
      },
      {
        en: "Describes, with an example, how their approach improved over time",
        ar: "يصف بمثال كيف تحسّن أسلوبه مع الوقت",
      },
    ],
    watchFor: [
      {
        en: "Repeated the same mistake after it was pointed out",
        ar: "كرّر الخطأ نفسه بعد أن نُبّه إليه",
      },
      {
        en: "Fixed the one error but did not carry the lesson further",
        ar: "صحّح الخطأ المحدد لكنه لم يعمّم الدرس",
      },
    ],
  },

  "adaptability.handling-new-information": {
    question: {
      en: "Tell me about a time new information showed that your plan or view was wrong. What did you do?",
      ar: "حدّثنا عن موقف كشفت فيه معلومات جديدة أن خطتك أو رأيك لم يكن صائبًا. ماذا فعلت؟",
    },
    situational: {
      en: "Imagine you spent weeks preparing a proposal, and the day before presenting you learn a key figure in it is outdated. What would you do?",
      ar: "لنفترض أنك أمضيت أسابيع في إعداد مقترح، وقبل عرضه بيوم اكتشفت أن رقمًا أساسيًا فيه لم يعد صحيحًا. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "How did you check the new information could be trusted?",
        ar: "كيف تأكدت من أن المعلومات الجديدة جديرة بالثقة؟",
      },
      {
        en: "Which parts of the plan did you change, which did you keep, and why?",
        ar: "ما أجزاء الخطة التي غيّرتها، وما التي أبقيتها، ولماذا؟",
      },
    ],
    listenFor: [
      {
        en: "Checked that the new information was reliable before acting",
        ar: "تحقق من موثوقية المعلومات الجديدة قبل أن يتصرف",
      },
      {
        en: "Changed only the parts the new information affected",
        ar: "لم يغيّر إلا الأجزاء التي تأثرت بالمعلومات الجديدة",
      },
      {
        en: "Explains clearly what changed in their thinking, and why",
        ar: "يوضّح ما الذي تغيّر في تفكيره ولماذا",
      },
    ],
    watchFor: [
      {
        en: "Kept the original view despite clear contrary evidence",
        ar: "تمسّك برأيه الأول رغم أدلة واضحة تناقضه",
      },
      {
        en: "Made a token change, or threw out the whole plan",
        ar: "أجرى تغييرًا شكليًا، أو تخلّى عن الخطة كلها",
      },
    ],
  },

  "adaptability.composure-under-pressure": {
    question: {
      en: "Tell me about a time you were under heavy time pressure and something went wrong. What did you do in the moment?",
      ar: "حدّثنا عن موقف كنت فيه تحت ضغط وقت شديد، ثم حدث خطأ ما. ماذا فعلت في تلك اللحظة؟",
    },
    situational: {
      en: "Imagine an important delivery is due in two hours and you discover an error that affects part of it. What would you do?",
      ar: "لنفترض أن أمامك ساعتين لتسليم عمل مهم، واكتشفت خطأً يمسّ جزءًا منه. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "What did you deal with first, and what did you leave for later?",
        ar: "بماذا بدأت، وما الذي تركته لوقت لاحق؟",
      },
      {
        en: "Which checks did you keep in place, and how did you keep others informed?",
        ar: "ما خطوات التحقق التي حافظت عليها، وكيف أبقيت الآخرين على اطلاع؟",
      },
    ],
    listenFor: [
      {
        en: "Separated what had to happen now from what could wait",
        ar: "فصل بين ما يجب فعله في الحال وما يمكن أن ينتظر",
      },
      {
        en: "Kept quality checks in place despite the rush",
        ar: "حافظ على خطوات التحقق من الجودة رغم ضيق الوقت",
      },
      {
        en: "Updated others calmly, with clear next steps",
        ar: "أطلع الآخرين بهدوء على الخطوات التالية بوضوح",
      },
    ],
    watchFor: [
      {
        en: "Skipped agreed steps, acted on impulse, or froze",
        ar: "تجاوز الخطوات المتفق عليها، أو تصرّف باندفاع، أو تجمّد",
      },
      {
        en: "Lost track of key details or priorities in the rush",
        ar: "أغفل تفاصيل أو أولويات مهمة تحت الضغط",
      },
    ],
  },

  "adaptability.comfort-with-ambiguity": {
    question: {
      en: "Tell me about a time you were given a task with unclear goals or instructions. How did you make progress?",
      ar: "حدّثنا عن موقف كُلّفت فيه بمهمة أهدافها أو تعليماتها غير واضحة. كيف تقدّمت فيها؟",
    },
    situational: {
      en: "Imagine you are asked to 'improve how new staff are welcomed', with no further detail, and your manager is hard to reach. What would you do?",
      ar: "لنفترض أنه طُلب منك «تحسين تهيئة الموظفين الجدد» دون أي تفاصيل أخرى، ويصعب التواصل مع مديرك. كيف تتصرف؟",
    },
    followUps: [
      {
        en: "How did you interpret the task, and did you check that with anyone?",
        ar: "كيف فهمت المهمة، وهل تحققت من فهمك مع أحد؟",
      },
      {
        en: "What small steps did you take first, and what did they tell you?",
        ar: "ما الخطوات الصغيرة التي بدأت بها، وما الذي كشفته لك؟",
      },
    ],
    listenFor: [
      {
        en: "States their interpretation of the task openly",
        ar: "يعلن فهمه للمهمة صراحةً",
      },
      {
        en: "Took small, reversible steps that produced useful information",
        ar: "اتخذ خطوات صغيرة قابلة للتراجع كشفت معلومات مفيدة",
      },
      {
        en: "Clarified the most important unknowns with the right people",
        ar: "استوضح أهم الأمور المجهولة من الأشخاص المعنيين",
      },
    ],
    watchFor: [
      {
        en: "Waited for full instructions before doing anything",
        ar: "انتظر تعليمات كاملة قبل أن يفعل أي شيء",
      },
      {
        en: "Pressed on with an unstated interpretation that was never checked",
        ar: "مضى في العمل بفهم لم يصرّح به ولم يتحقق منه",
      },
    ],
  },
};

/** The interview-guide entry for a sub-skill or domain key, or null when the key has none. */
export function guideFor(skillKey: string): InterviewGuideEntry | null {
  if (!Object.hasOwn(INTERVIEW_GUIDE, skillKey)) return null;
  return INTERVIEW_GUIDE[skillKey] ?? null;
}
