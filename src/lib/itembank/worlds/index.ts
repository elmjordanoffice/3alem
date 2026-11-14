import type { BankWorld } from "@/lib/assessment/world-schema";

/**
 * Curated fictional worlds. Each candidate's session is one continuous story
 * set in one of these companies. A world is chosen by matching
 * `industryKeywords` against the job description; cast slots line up with
 * CAST_SLOTS so bank items can reference {{manager}}, {{client.role}} and so on.
 *
 * Chapters use "Day 1 … Day 5" rather than weekday names, because the working
 * week starts on different days in different countries.
 */
export const WORLDS: BankWorld[] = [
  {
    id: "northwind-logistics",
    industryKeywords: [
      "logistics",
      "supply chain",
      "freight",
      "warehouse",
      "shipping",
      "distribution",
      "fleet",
      "inventory",
      "3pl",
      "لوجستي",
      "الإمداد",
      "شحن",
      "مستودع",
      "توزيع",
      "مخزون",
    ],
    en: {
      companyName: "Northwind Logistics",
      industry: "Logistics and supply chain",
      premise:
        "Northwind Logistics runs regional warehouses and freight routes for food, pharmaceutical and retail clients. This week its peak season begins just as its largest client moves onto a new warehouse management system, and one of its three distribution centres is short of staff.",
      yourRole: "Team lead, Operations",
      team: "You lead a team of six coordinators who plan daily shipments and handle exceptions across the three distribution centres.",
      cast: [
        {
          slot: "manager",
          name: "Leila Haddad",
          role: "Head of Operations",
          personality:
            "Sets clear goals and expects you to bring her options rather than problems, but backs your decisions once they are made.",
        },
        {
          slot: "report1",
          name: "Tomás Rivera",
          role: "Senior Shipment Coordinator",
          personality:
            "Reliable under pressure and knows the routes and carriers in detail, though he tends to fix problems himself instead of teaching others.",
        },
        {
          slot: "report2",
          name: "Grace Mensah",
          role: "Shipment Coordinator",
          personality:
            "Careful and well liked, but has fallen behind since the system change and rarely asks for help before a deadline is missed.",
        },
        {
          slot: "peer",
          name: "Arjun Mehta",
          role: "Warehouse Systems Lead, IT",
          personality:
            "Focused on keeping the system rollout on schedule, and pushes back when asked to change his plan at short notice.",
        },
        {
          slot: "client",
          name: "Sofia Lindqvist",
          role: "Supply Chain Director, Alba Foods",
          personality: "Direct and data-driven; she judges partners by how early they report bad news.",
        },
        {
          slot: "exec",
          name: "Kenji Watanabe",
          role: "Regional Managing Director",
          personality:
            "Questions every request for extra spending and wants to see the cost of each option before he agrees to anything.",
        },
        {
          slot: "specialist",
          name: "Fatima Diallo",
          role: "Customs and Compliance Specialist",
          personality: "Precise and patient; she will slow a decision down if she thinks a regulation is being overlooked.",
        },
      ],
      chapters: [
        {
          title: "Day 1: The brief",
          summary: "Leila asks you to keep peak-season deliveries on time while the largest client moves to the new system.",
        },
        {
          title: "Day 2: The first delays",
          summary: "Shipments start leaving one distribution centre late, and the cause is not yet clear.",
        },
        {
          title: "Days 3–4: Competing demands",
          summary: "The client wants answers, leadership wants costs kept flat, and your team is stretched.",
        },
        {
          title: "Day 5: The review",
          summary: "You present what happened, what was decided and what should change next.",
        },
      ],
    },
    ar: {
      companyName: "نورثويند للخدمات اللوجستية",
      industry: "الخدمات اللوجستية وسلاسل الإمداد",
      premise:
        "تدير نورثويند للخدمات اللوجستية مستودعات إقليمية وخطوط شحن لعملاء في قطاعات الأغذية والأدوية والتجزئة. ويبدأ هذا الأسبوع موسم الذروة في الوقت الذي ينتقل فيه أكبر عملائها إلى نظام جديد لإدارة المستودعات، ويعاني أحد مراكز التوزيع الثلاثة نقصًا في الموظفين.",
      yourRole: "قائد فريق العمليات",
      team: "يضم فريقك ستة منسقين يخططون للشحنات اليومية ويعالجون الحالات الاستثنائية في مراكز التوزيع الثلاثة.",
      cast: [
        {
          slot: "manager",
          name: "ليلى حداد",
          role: "رئيسة العمليات",
          personality: "تحدد أهدافًا واضحة وتتوقع منك عرض خيارات عليها لا مشكلات، لكنها تساند قراراتك متى اتُّخذت.",
        },
        {
          slot: "report1",
          name: "توماس ريفيرا",
          role: "منسق شحنات أول",
          personality:
            "يُعتمد عليه تحت الضغط ويعرف المسارات وشركات النقل بالتفصيل، لكنه يميل إلى حل المشكلات بنفسه بدل تعليم زملائه.",
        },
        {
          slot: "report2",
          name: "غريس منساه",
          role: "منسقة شحنات",
          personality:
            "دقيقة ومحبوبة بين زملائها، لكنها تأخرت في عملها منذ تغيير النظام، ونادرًا ما تطلب المساعدة قبل أن يفوتها الموعد النهائي.",
        },
        {
          slot: "peer",
          name: "أرجون ميهتا",
          role: "قائد أنظمة المستودعات في إدارة تقنية المعلومات",
          personality: "يركّز على إنجاز إطلاق النظام في موعده، ويعترض حين يُطلب منه تغيير خطته في مهلة قصيرة.",
        },
        {
          slot: "client",
          name: "صوفيا ليندكفيست",
          role: "مديرة سلسلة الإمداد في ألبا للأغذية",
          personality: "صريحة وتعتمد على البيانات، وتقيّم شركاءها بمدى مبادرتهم إلى الإبلاغ عن الأخبار السيئة مبكرًا.",
        },
        {
          slot: "exec",
          name: "كينجي واتانابي",
          role: "المدير العام الإقليمي",
          personality: "يدقّق في كل طلب لإنفاق إضافي، ولا يوافق على شيء قبل أن يطّلع على تكلفة كل خيار.",
        },
        {
          slot: "specialist",
          name: "فاطمة ديالو",
          role: "أخصائية الجمارك والامتثال",
          personality: "دقيقة وصبورة، وقد تُبطئ اتخاذ القرار إن رأت أن لائحة تنظيمية لم تُراعَ.",
        },
      ],
      chapters: [
        {
          title: "اليوم الأول: الإحاطة",
          summary: "تطلب ليلى الحفاظ على مواعيد التسليم في موسم الذروة أثناء نقل أكبر العملاء إلى النظام الجديد.",
        },
        {
          title: "اليوم الثاني: أولى حالات التأخير",
          summary: "تتأخر الشحنات الصادرة من أحد مراكز التوزيع، ولم يتّضح السبب بعد.",
        },
        {
          title: "اليومان الثالث والرابع: مطالب متعارضة",
          summary: "يريد العميل إجابات، وتريد الإدارة إبقاء التكاليف على حالها، وفريقك مثقل بالعمل.",
        },
        {
          title: "اليوم الخامس: المراجعة",
          summary: "عرض ما حدث والقرارات المتخذة وما ينبغي تغييره بعد ذلك.",
        },
      ],
    },
  },
  {
    id: "lumen-software",
    industryKeywords: [
      "software",
      "saas",
      "cloud",
      "platform",
      "devops",
      "mobile app",
      "web application",
      "tech startup",
      "برمجيات",
      "تقنية المعلومات",
      "سحابي",
      "منصة رقمية",
      "تطبيقات",
      "شركة ناشئة",
    ],
    en: {
      companyName: "Lumen Software",
      industry: "Software and cloud services",
      premise:
        "Lumen Software builds a cloud platform that small and mid-sized businesses use to manage appointments and billing. This week it releases a major new version to all customers, while a security review of the platform is still open and its largest customer is deciding whether to renew.",
      yourRole: "Team lead, Scheduling product",
      team: "You lead a team of seven engineers, analysts and a designer who own the scheduling product.",
      cast: [
        {
          slot: "manager",
          name: "Daniel Okafor",
          role: "Director of Engineering",
          personality:
            "Calm and supportive in one-to-one meetings, but expects commitments to be kept and asks early about anything at risk.",
        },
        {
          slot: "report1",
          name: "Ana Souza",
          role: "Senior Software Engineer",
          personality:
            "Technically strong and quick to spot risks, but can become impatient with colleagues who need more explanation.",
        },
        {
          slot: "report2",
          name: "Lukas Becker",
          role: "Software Engineer",
          personality: "Joined from another team a month ago; he works long hours but hesitates to say when he is stuck.",
        },
        {
          slot: "peer",
          name: "Priya Raman",
          role: "Product Manager",
          personality:
            "Energetic and customer-focused; she tends to agree to customer requests before checking what they will cost the team.",
        },
        {
          slot: "client",
          name: "Min-jun Park",
          role: "Operations Director, Orchard Dental Group",
          personality:
            "Polite and patient in meetings, but escalates quickly to your leadership when a promised date slips.",
        },
        {
          slot: "exec",
          name: "Rania Aziz",
          role: "Chief Operating Officer",
          personality: "Asks pointed questions about evidence and is openly doubtful that the launch date is realistic.",
        },
        {
          slot: "specialist",
          name: "Emre Yilmaz",
          role: "Security Engineer",
          personality:
            "Thorough and plain-spoken; he explains risks in concrete terms and will not approve anything he has not tested.",
        },
      ],
      chapters: [
        {
          title: "Day 1: The launch plan",
          summary: "Daniel confirms the release date and asks for your team's features to be ready and safe to ship.",
        },
        {
          title: "Day 2: An open risk",
          summary: "The security review flags a problem in a feature your team built, and the fix is not simple.",
        },
        {
          title: "Days 3–4: Pressure from every side",
          summary: "The client wants a firm date, product wants one more feature, and leadership doubts the plan.",
        },
        {
          title: "Day 5: Release or wait",
          summary: "You give and explain your release recommendation, then review how the week went.",
        },
      ],
    },
    ar: {
      companyName: "لومن للبرمجيات",
      industry: "البرمجيات والخدمات السحابية",
      premise:
        "تطوّر لومن للبرمجيات منصة سحابية تستخدمها الشركات الصغيرة والمتوسطة لإدارة المواعيد والفوترة. وتُطلق هذا الأسبوع إصدارًا رئيسيًا جديدًا لجميع العملاء، في حين لم تُستكمل بعدُ مراجعة أمنية للمنصة، ويدرس أكبر عملائها تجديد عقده.",
      yourRole: "قائد فريق منتج جدولة المواعيد",
      team: "يضم فريقك سبعة أعضاء بين مهندسين ومحللين ومصمم، ويتولى الفريق منتج جدولة المواعيد.",
      cast: [
        {
          slot: "manager",
          name: "دانيال أوكافور",
          role: "مدير الهندسة",
          personality: "هادئ وداعم في الاجتماعات الفردية، لكنه يتوقع الوفاء بالالتزامات ويسأل مبكرًا عن أي عمل معرّض للتعثّر.",
        },
        {
          slot: "report1",
          name: "آنا سوزا",
          role: "مهندسة برمجيات أولى",
          personality: "متمكنة تقنيًا وسريعة في رصد المخاطر، لكن صبرها قد ينفد مع الزملاء الذين يحتاجون إلى مزيد من الشرح.",
        },
        {
          slot: "report2",
          name: "لوكاس بيكر",
          role: "مهندس برمجيات",
          personality: "انضم من فريق آخر قبل شهر، ويعمل ساعات طويلة لكنه يتردد في الإفصاح حين يتعثّر.",
        },
        {
          slot: "peer",
          name: "بريا رامان",
          role: "مديرة منتج",
          personality: "نشيطة وتركّز على العملاء، وتميل إلى الموافقة على طلباتهم قبل التحقق مما ستكلّفه للفريق.",
        },
        {
          slot: "client",
          name: "مين جون بارك",
          role: "مدير العمليات في مجموعة أوركارد لطب الأسنان",
          personality: "مهذّب وصبور في الاجتماعات، لكنه يصعّد الأمر سريعًا إلى قيادتكم حين يتأخر موعد التُزم به.",
        },
        {
          slot: "exec",
          name: "رانيا عزيز",
          role: "الرئيسة التنفيذية للعمليات",
          personality: "تطرح أسئلة مباشرة عن الأدلة، ولا تخفي شكّها في واقعية موعد الإطلاق.",
        },
        {
          slot: "specialist",
          name: "إمره يلماز",
          role: "مهندس أمن معلومات",
          personality: "دقيق وصريح، يشرح المخاطر بعبارات ملموسة، ولا يعتمد شيئًا لم يختبره.",
        },
      ],
      chapters: [
        {
          title: "اليوم الأول: خطة الإطلاق",
          summary: "يؤكد دانيال موعد الإصدار، ويطلب التأكد من جاهزية ميزات الفريق وأمان إطلاقها.",
        },
        {
          title: "اليوم الثاني: خطر قائم",
          summary: "تكشف المراجعة الأمنية مشكلة في ميزة بناها فريقك، وإصلاحها ليس بسيطًا.",
        },
        {
          title: "اليومان الثالث والرابع: ضغوط من كل جانب",
          summary: "يريد العميل موعدًا مؤكدًا، ويريد فريق المنتج ميزة إضافية، وتشكّك القيادة في الخطة.",
        },
        {
          title: "اليوم الخامس: الإطلاق أو التأجيل",
          summary: "تقديم التوصية بشأن الإصدار وشرح أسبابها، ثم مراجعة مجريات الأسبوع.",
        },
      ],
    },
  },
  {
    id: "cedar-health",
    industryKeywords: [
      "healthcare",
      "hospital",
      "clinic",
      "medical",
      "patient",
      "pharma",
      "nursing",
      "الرعاية الصحية",
      "مستشفى",
      "مستشفيات",
      "عيادة",
      "طبية",
      "المرضى",
      "أدوية",
    ],
    en: {
      companyName: "Cedar Health Group",
      industry: "Healthcare",
      premise:
        "Cedar Health Group runs a network of outpatient clinics and a central pharmacy. This week an external accreditation team arrives to audit the clinics, at the same time as they switch to a new patient booking system.",
      yourRole: "Team lead, Patient services",
      team: "You lead a team of eight coordinators who manage patient bookings, referrals and records across four clinics.",
      cast: [
        {
          slot: "manager",
          name: "Nadia Rahman",
          role: "Director of Clinical Operations",
          personality: "Thoughtful and fair; she listens fully before deciding but dislikes surprises.",
        },
        {
          slot: "report1",
          name: "Yusuf Al-Amin",
          role: "Senior Patient Services Coordinator",
          personality: "Organised and calm with upset patients, and often the first person colleagues ask for help.",
        },
        {
          slot: "report2",
          name: "Chloé Martin",
          role: "Patient Services Coordinator",
          personality:
            "Kind and committed, but recent errors in referral records have shaken her confidence, and she now re-checks so much that her work queue keeps growing.",
        },
        {
          slot: "peer",
          name: "Wei Zhang",
          role: "IT Systems Manager",
          personality:
            "Practical and responsive, though he measures success by whether the system stays up rather than by how staff experience the change.",
        },
        {
          slot: "client",
          name: "Isabel Moreno",
          role: "Provider Relations Manager, Corvane Health Insurance",
          personality: "Friendly but firm about contract terms; she wants written confirmation of anything that affects claims.",
        },
        {
          slot: "exec",
          name: "Kwame Asante",
          role: "Chief Executive",
          personality: "Respected and brief; he doubts the clinics are ready for the audit and wants evidence rather than reassurance.",
        },
        {
          slot: "specialist",
          name: "Elena Popescu",
          role: "Clinical Governance Lead",
          personality: "Exacting about patient safety and documentation, and generous with her time when people ask good questions.",
        },
      ],
      chapters: [
        {
          title: "Day 1: The audit brief",
          summary: "Nadia explains what the accreditation team will review and what your team must have ready.",
        },
        {
          title: "Day 2: The new system goes live",
          summary: "Bookings move to the new system and some patient referrals go missing.",
        },
        {
          title: "Days 3–4: Under inspection",
          summary: "Auditors request records while patients, staff and the insurer all wait for answers.",
        },
        {
          title: "Day 5: The findings",
          summary: "The audit team shares its findings, and you review what your team did well and what must change.",
        },
      ],
    },
    ar: {
      companyName: "مجموعة سيدار الصحية",
      industry: "الرعاية الصحية",
      premise:
        "تدير مجموعة سيدار الصحية شبكة من العيادات الخارجية وصيدلية مركزية. ويصل هذا الأسبوع فريق اعتماد خارجي لتدقيق أعمال العيادات، في الوقت الذي تنتقل فيه إلى نظام جديد لحجز مواعيد المرضى.",
      yourRole: "قائد فريق خدمات المرضى",
      team: "يضم فريقك ثمانية منسقين يديرون حجوزات المرضى والإحالات والسجلات في أربع عيادات.",
      cast: [
        {
          slot: "manager",
          name: "نادية رحمن",
          role: "مديرة العمليات السريرية",
          personality: "متأنية ومنصفة، تُصغي جيدًا قبل أن تقرر، لكنها لا تحب المفاجآت.",
        },
        {
          slot: "report1",
          name: "يوسف الأمين",
          role: "منسق أول لخدمات المرضى",
          personality: "منظّم وهادئ مع المرضى المستائين، وكثيرًا ما يكون أول من يلجأ إليه زملاؤه طلبًا للمساعدة.",
        },
        {
          slot: "report2",
          name: "كلوي مارتان",
          role: "منسقة خدمات المرضى",
          personality:
            "لطيفة وملتزمة، لكن أخطاء وقعت مؤخرًا في سجلات الإحالة هزّت ثقتها بنفسها، فصارت تعيد التحقق من كل شيء حتى تراكمت عليها المهام.",
        },
        {
          slot: "peer",
          name: "وي تشانغ",
          role: "مدير أنظمة تقنية المعلومات",
          personality: "عملي وسريع الاستجابة، لكنه يقيس النجاح باستمرار عمل النظام لا بتجربة الموظفين مع التغيير.",
        },
        {
          slot: "client",
          name: "إيزابيل مورينو",
          role: "مديرة العلاقات مع مقدّمي الخدمات في كورفين للتأمين الصحي",
          personality: "ودودة لكنها حازمة في شروط العقد، وتطلب تأكيدًا مكتوبًا لأي أمر يؤثر في المطالبات.",
        },
        {
          slot: "exec",
          name: "كوامي أسانتي",
          role: "الرئيس التنفيذي",
          personality: "يحظى بالاحترام ويوجز في كلامه، ويشكّ في جاهزية العيادات للتدقيق، ويريد أدلة لا تطمينات.",
        },
        {
          slot: "specialist",
          name: "إيلينا بوبيسكو",
          role: "مسؤولة الحوكمة السريرية",
          personality: "صارمة في كل ما يتصل بسلامة المرضى والتوثيق، ولا تبخل بوقتها على من يطرح أسئلة جيدة.",
        },
      ],
      chapters: [
        {
          title: "اليوم الأول: إحاطة التدقيق",
          summary: "تشرح نادية ما سيراجعه فريق الاعتماد وما يجب أن يجهّزه فريقك.",
        },
        {
          title: "اليوم الثاني: تشغيل النظام الجديد",
          summary: "تنتقل الحجوزات إلى النظام الجديد، وتختفي بعض إحالات المرضى.",
        },
        {
          title: "اليومان الثالث والرابع: تحت التدقيق",
          summary: "يطلب المدققون السجلات، في حين ينتظر المرضى والموظفون وشركة التأمين إجابات.",
        },
        {
          title: "اليوم الخامس: النتائج",
          summary: "يعرض فريق التدقيق نتائجه، وتُراجَع نقاط القوة لدى فريقك وما يجب تغييره.",
        },
      ],
    },
  },
  {
    id: "harbor-finance",
    industryKeywords: [
      "bank",
      "fintech",
      "insurance",
      "payments",
      "financial services",
      "lending",
      "credit",
      "wealth management",
      "بنك",
      "مصرف",
      "تأمين",
      "مدفوعات",
      "الخدمات المالية",
      "التقنية المالية",
      "إقراض",
    ],
    en: {
      companyName: "Harbor Finance",
      industry: "Banking and financial services",
      premise:
        "Harbor Finance is a mid-sized bank serving small businesses and households through its branches and a mobile app. This week it completes its merger with a smaller digital lender, and the regulator has asked for an updated report on how customer complaints are handled.",
      yourRole: "Team lead, Customer operations",
      team: "You lead a team of nine analysts who handle account changes, payment problems and complaints for business customers.",
      cast: [
        {
          slot: "manager",
          name: "Carlos Mendoza",
          role: "Head of Customer Operations",
          personality: "Ambitious and fast-moving; he gives broad direction and expects you to work out the details.",
        },
        {
          slot: "report1",
          name: "Linh Nguyen",
          role: "Senior Operations Analyst",
          personality:
            "Precise and well organised; she spots patterns in complaints early but rarely shares her ideas in large meetings.",
        },
        {
          slot: "report2",
          name: "Ibrahim Sesay",
          role: "Operations Analyst",
          personality:
            "Experienced and dedicated, but finds the merged systems confusing and has started to resist the new processes openly.",
        },
        {
          slot: "peer",
          name: "Hannah Schmidt",
          role: "Risk and Compliance Manager",
          personality: "Careful and principled; she pushes back on shortcuts even when the business is under pressure.",
        },
        {
          slot: "client",
          name: "Ravi Kapoor",
          role: "Finance Director, Brennan Manufacturing",
          personality: "Values speed and direct contact; he calls himself when something goes wrong and remembers who helped.",
        },
        {
          slot: "exec",
          name: "Amira Khalil",
          role: "Managing Director, Business Banking",
          personality: "Sharp and impatient with vague answers; she expects every claim to come with numbers and a named owner.",
        },
        {
          slot: "specialist",
          name: "Marta Kowalska",
          role: "Payments Systems Specialist",
          personality:
            "Patient and methodical; she can trace a failed payment through every system but needs clear priorities when several issues arrive at once.",
        },
      ],
      chapters: [
        {
          title: "Day 1: Merger week begins",
          summary:
            "Carlos asks you to move the digital lender's business customers onto your processes without disrupting service.",
        },
        {
          title: "Day 2: Failed payments",
          summary: "A batch of customer payments fails after the systems are joined, and complaints start to arrive.",
        },
        {
          title: "Days 3–4: The regulator's request",
          summary: "The regulator needs an explanation of how complaints are handled while the backlog is still growing.",
        },
        {
          title: "Day 5: The leadership update",
          summary: "You present the facts, the fixes and the lessons to senior leadership.",
        },
      ],
    },
    ar: {
      companyName: "هاربر المالية",
      industry: "الخدمات المصرفية والمالية",
      premise:
        "هاربر المالية مصرف متوسط الحجم يخدم الشركات الصغيرة والأسر عبر فروعه وتطبيق للهاتف المحمول. ويستكمل المصرف هذا الأسبوع اندماجه مع جهة إقراض رقمية أصغر، وقد طلبت الجهة التنظيمية تقريرًا محدّثًا عن طريقة معالجة شكاوى العملاء.",
      yourRole: "قائد فريق عمليات العملاء",
      team: "يضم فريقك تسعة محللين يتولّون تعديلات الحسابات ومشكلات المدفوعات وشكاوى عملاء قطاع الأعمال.",
      cast: [
        {
          slot: "manager",
          name: "كارلوس ميندوزا",
          role: "رئيس عمليات العملاء",
          personality: "طموح وسريع الإيقاع، يكتفي بتوجيهات عامة ويتوقع منك استكمال التفاصيل.",
        },
        {
          slot: "report1",
          name: "لين نغوين",
          role: "محللة عمليات أولى",
          personality: "دقيقة ومنظّمة، ترصد الأنماط في الشكاوى مبكرًا، لكنها نادرًا ما تطرح أفكارها في الاجتماعات الكبيرة.",
        },
        {
          slot: "report2",
          name: "إبراهيم سيساي",
          role: "محلل عمليات",
          personality: "صاحب خبرة ومخلص في عمله، لكنه يجد الأنظمة المدمجة مربكة، وبدأ يعارض الإجراءات الجديدة علنًا.",
        },
        {
          slot: "peer",
          name: "هانا شميت",
          role: "مديرة المخاطر والامتثال",
          personality: "حذرة وملتزمة بالمبادئ، وتعترض على الحلول المختصرة حتى حين يشتد الضغط على المؤسسة.",
        },
        {
          slot: "client",
          name: "رافي كابور",
          role: "المدير المالي في برينان للصناعات",
          personality: "يقدّر السرعة والتواصل المباشر، ويتصل بنفسه حين يقع خطأ، ويتذكر من ساعده.",
        },
        {
          slot: "exec",
          name: "أميرة خليل",
          role: "المديرة العامة للخدمات المصرفية للشركات",
          personality: "حادّة الذهن ولا تصبر على الإجابات المبهمة، وتتوقع أن يُرفق كل ادعاء بأرقام ومسؤول محدد.",
        },
        {
          slot: "specialist",
          name: "مارتا كوفالسكا",
          role: "أخصائية أنظمة المدفوعات",
          personality:
            "صبورة ومنهجية، تستطيع تتبّع أي دفعة متعثرة عبر جميع الأنظمة، لكنها تحتاج إلى أولويات واضحة حين تصلها عدة مشكلات في وقت واحد.",
        },
      ],
      chapters: [
        {
          title: "اليوم الأول: بداية أسبوع الاندماج",
          summary: "يطلب كارلوس نقل عملاء قطاع الأعمال لدى جهة الإقراض الرقمية إلى إجراءاتكم دون تعطيل الخدمة.",
        },
        {
          title: "اليوم الثاني: تعثّر المدفوعات",
          summary: "تفشل مجموعة من مدفوعات العملاء بعد ربط الأنظمة، وتبدأ الشكاوى في الوصول.",
        },
        {
          title: "اليومان الثالث والرابع: طلب الجهة التنظيمية",
          summary: "تنتظر الجهة التنظيمية توضيحًا لطريقة معالجة الشكاوى، بينما لا تزال الشكاوى المعلّقة تتزايد.",
        },
        {
          title: "اليوم الخامس: إفادة القيادة",
          summary: "عرض الحقائق والحلول والدروس المستفادة على القيادة العليا.",
        },
      ],
    },
  },
  {
    id: "meridian-retail",
    industryKeywords: [
      "retail",
      "e-commerce",
      "ecommerce",
      "consumer goods",
      "marketplace",
      "merchandising",
      "fmcg",
      "omnichannel",
      "تجزئة",
      "التجارة الإلكترونية",
      "متجر",
      "متاجر",
      "استهلاكية",
      "المستهلك",
    ],
    en: {
      companyName: "Meridian Retail",
      industry: "Retail and e-commerce",
      premise:
        "Meridian Retail sells home and lifestyle products through 40 stores and a fast-growing online marketplace. This week it prepares for its biggest annual sale while a new same-day delivery service starts in two cities.",
      yourRole: "Team lead, Commercial operations",
      team: "You lead a team of six planners and analysts who manage stock, pricing and promotions in stores and online.",
      cast: [
        {
          slot: "manager",
          name: "Jing Liu",
          role: "Director of Commercial Operations",
          personality: "Data-minded and direct; she gives quick feedback and changes her mind when shown better evidence.",
        },
        {
          slot: "report1",
          name: "Karim Benali",
          role: "Senior Merchandise Planner",
          personality:
            "Creative and dependable, with a strong sense of what customers will buy, though he sometimes commits to plans before checking stock levels.",
        },
        {
          slot: "report2",
          name: "Sarah Thompson",
          role: "Pricing Analyst",
          personality: "Bright and eager but new to the role; she says yes to every request and is now overloaded.",
        },
        {
          slot: "peer",
          name: "Diego Álvarez",
          role: "Head of E-commerce",
          personality: "Persuasive and fast-moving; he pushes for online-first decisions and can overlook their effect on stores.",
        },
        {
          slot: "client",
          name: "Aditi Sharma",
          role: "Procurement Manager, Vantia Hotels",
          personality: "Professional and well prepared; she negotiates hard on price but keeps her commitments.",
        },
        {
          slot: "exec",
          name: "Joseph Mwangi",
          role: "Chief Financial Officer",
          personality:
            "Experienced and sceptical of new initiatives; he asks how each plan affects profit margins before discussing anything else.",
        },
        {
          slot: "specialist",
          name: "Noor Al-Sayed",
          role: "Demand Forecasting Specialist",
          personality: "Rigorous and candid; she will tell you plainly when a plan ignores the forecast.",
        },
      ],
      chapters: [
        {
          title: "Day 1: The sale plan",
          summary: "Jing sets targets for the annual sale and the first week of same-day delivery.",
        },
        {
          title: "Day 2: Stock problems",
          summary: "Online stock figures do not match what stores report, and the sale starts tomorrow.",
        },
        {
          title: "Days 3–4: The sale opens",
          summary: "Demand is above forecast in some places and below it in others, and every team wants priority.",
        },
        {
          title: "Day 5: The review",
          summary: "You review results with leadership and decide what to keep, fix or stop.",
        },
      ],
    },
    ar: {
      companyName: "ميريديان للتجزئة",
      industry: "التجزئة والتجارة الإلكترونية",
      premise:
        "تبيع ميريديان للتجزئة منتجات المنزل وأسلوب الحياة عبر 40 متجرًا ومنصة تسوّق إلكترونية سريعة النمو. وتستعد هذا الأسبوع لأكبر تخفيضاتها السنوية، في الوقت الذي تنطلق فيه خدمة جديدة للتوصيل في اليوم نفسه في مدينتين.",
      yourRole: "قائد فريق العمليات التجارية",
      team: "يضم فريقك ستة مخططين ومحللين يديرون المخزون والتسعير والعروض الترويجية في المتاجر وعلى المنصة الإلكترونية.",
      cast: [
        {
          slot: "manager",
          name: "جينغ ليو",
          role: "مديرة العمليات التجارية",
          personality: "تعتمد على البيانات وتتحدث بصراحة، تقدّم ملاحظاتها بسرعة، وتغيّر رأيها إذا عُرضت عليها أدلة أقوى.",
        },
        {
          slot: "report1",
          name: "كريم بن علي",
          role: "مخطط بضائع أول",
          personality:
            "مبدع ويُعتمد عليه، ويدرك جيدًا ما سيُقبل عليه العملاء، لكنه يلتزم أحيانًا بخطط قبل التحقق من مستويات المخزون.",
        },
        {
          slot: "report2",
          name: "سارة تومسون",
          role: "محللة تسعير",
          personality: "ذكية ومتحمسة لكنها جديدة في الدور، توافق على كل طلب يصلها حتى أثقلها العمل.",
        },
        {
          slot: "peer",
          name: "دييغو ألفاريز",
          role: "رئيس التجارة الإلكترونية",
          personality: "مقنع وسريع التحرك، يدفع نحو قرارات تقدّم المنصة الإلكترونية على غيرها، وقد يُغفل أثرها في المتاجر.",
        },
        {
          slot: "client",
          name: "أديتي شارما",
          role: "مديرة المشتريات في فنادق فانتيا",
          personality: "محترفة ومستعدة جيدًا، تفاوض بقوة على الأسعار لكنها تفي بالتزاماتها.",
        },
        {
          slot: "exec",
          name: "جوزيف موانغي",
          role: "المدير المالي",
          personality: "صاحب خبرة ويتشكك في المبادرات الجديدة، ويسأل عن أثر كل خطة في هوامش الربح قبل مناقشة أي شيء آخر.",
        },
        {
          slot: "specialist",
          name: "نور السيد",
          role: "أخصائية التنبؤ بالطلب",
          personality: "دقيقة في منهجها وصريحة، وتقول بوضوح متى تتجاهل خطةٌ ما توقعاتِ الطلب.",
        },
      ],
      chapters: [
        {
          title: "اليوم الأول: خطة التخفيضات",
          summary: "تحدد جينغ أهداف التخفيضات السنوية والأسبوع الأول لخدمة التوصيل في اليوم نفسه.",
        },
        {
          title: "اليوم الثاني: مشكلات المخزون",
          summary: "لا تتطابق أرقام المخزون على المنصة الإلكترونية مع ما تُبلغ عنه المتاجر، والتخفيضات تبدأ غدًا.",
        },
        {
          title: "اليومان الثالث والرابع: انطلاق التخفيضات",
          summary: "يفوق الطلب التوقعات في بعض المواقع ويقلّ عنها في مواقع أخرى، وكل فريق يطالب بالأولوية.",
        },
        {
          title: "اليوم الخامس: المراجعة",
          summary: "مراجعة النتائج مع القيادة، وتحديد ما يُستبقى وما يُصلَح وما يُوقَف.",
        },
      ],
    },
  },
  {
    id: "solace-energy",
    industryKeywords: [
      "energy",
      "utilities",
      "renewable",
      "solar",
      "wind farm",
      "power plant",
      "grid",
      "oil and gas",
      "manufacturing",
      "electrical engineering",
      "الطاقة",
      "متجددة",
      "كهرباء",
      "شمسية",
      "تصنيع",
    ],
    en: {
      companyName: "Solace Energy",
      industry: "Renewable energy",
      premise:
        "Solace Energy builds and operates solar and wind farms and sells power to industrial customers. This week a new solar plant is due to connect to the grid, while a safety incident at another site is still under investigation.",
      yourRole: "Team lead, Project operations",
      team: "You lead a team of seven engineers and planners who coordinate construction, testing and handover at new sites.",
      cast: [
        {
          slot: "manager",
          name: "Ingrid Halvorsen",
          role: "Director of Projects",
          personality: "Steady and safety-first; she gives you room to decide but expects to hear about risks the same day.",
        },
        {
          slot: "report1",
          name: "Ahmed Saleh",
          role: "Senior Project Engineer",
          personality:
            "Highly skilled and respected on site; he raises concerns early, sometimes more bluntly than colleagues would like.",
        },
        {
          slot: "report2",
          name: "Lucía Fernández",
          role: "Planning Engineer",
          personality:
            "Capable and well trained, but has struggled to keep the schedule up to date since the incident added extra reporting work.",
        },
        {
          slot: "peer",
          name: "Bilal Qureshi",
          role: "Commercial Manager",
          personality: "Focused on contract deadlines and penalties, and quick to push for speed when revenue is at risk.",
        },
        {
          slot: "client",
          name: "Mariana Costa",
          role: "Energy Manager, Delmont Steel",
          personality: "Practical and well informed; she needs reliable dates to plan production at her plant.",
        },
        {
          slot: "exec",
          name: "Seo-yeon Choi",
          role: "Chief Technical Officer",
          personality:
            "Formal and exacting; she doubts the new plant is ready and challenges any date that has no test data behind it.",
        },
        {
          slot: "specialist",
          name: "Dawit Bekele",
          role: "Health and Safety Lead",
          personality: "Calm and exact; he insists on facts before conclusions and expects incidents to be reported in full.",
        },
      ],
      chapters: [
        {
          title: "Day 1: The connection plan",
          summary: "Ingrid asks you to keep the new plant on schedule for grid connection without reducing safety checks.",
        },
        {
          title: "Day 2: A failed test",
          summary: "A key test at the new plant fails, and the incident investigation needs part of your team's time.",
        },
        {
          title: "Days 3–4: Dates and doubts",
          summary: "The client needs a firm date, the commercial team wants speed and the safety lead wants more checks.",
        },
        {
          title: "Day 5: The decision review",
          summary: "You present your recommendation on the connection date and reflect on the week's decisions.",
        },
      ],
    },
    ar: {
      companyName: "سوليس للطاقة",
      industry: "الطاقة المتجددة",
      premise:
        "تنشئ سوليس للطاقة مزارع للطاقة الشمسية وطاقة الرياح وتشغّلها، وتبيع الكهرباء للعملاء الصناعيين. ومن المقرر أن تُربط هذا الأسبوع محطة طاقة شمسية جديدة بالشبكة الكهربائية، في حين لا يزال التحقيق جاريًا في حادثة سلامة وقعت في موقع آخر.",
      yourRole: "قائد فريق عمليات المشاريع",
      team: "يضم فريقك سبعة مهندسين ومخططين ينسّقون أعمال الإنشاء والاختبار والتسليم في المواقع الجديدة.",
      cast: [
        {
          slot: "manager",
          name: "إنغريد هالفورسن",
          role: "مديرة المشاريع",
          personality: "متزنة وتضع السلامة أولًا، تمنحك مساحة لاتخاذ القرار، لكنها تتوقع إبلاغها بالمخاطر في اليوم نفسه.",
        },
        {
          slot: "report1",
          name: "أحمد صالح",
          role: "مهندس مشاريع أول",
          personality: "ماهر جدًا ويحظى باحترام العاملين في الموقع، ويطرح مخاوفه مبكرًا، وأحيانًا بصراحة تفوق ما يرغب فيه زملاؤه.",
        },
        {
          slot: "report2",
          name: "لوسيا فرنانديز",
          role: "مهندسة تخطيط",
          personality: "كفؤة ومدرَّبة جيدًا، لكنها تجد صعوبة في تحديث الجدول الزمني منذ أن أضافت الحادثة أعباءً إضافية من التقارير.",
        },
        {
          slot: "peer",
          name: "بلال قريشي",
          role: "المدير التجاري",
          personality: "يركّز على المواعيد التعاقدية والغرامات، ويسارع إلى المطالبة بالإسراع حين تكون الإيرادات معرّضة للخطر.",
        },
        {
          slot: "client",
          name: "ماريانا كوستا",
          role: "مديرة الطاقة في ديلمونت للصلب",
          personality: "عملية وواسعة الاطلاع، وتحتاج إلى مواعيد موثوقة لتخطيط الإنتاج في مصنعها.",
        },
        {
          slot: "exec",
          name: "سو يون تشوي",
          role: "الرئيسة التنفيذية للشؤون الفنية",
          personality: "رسمية وصارمة في معاييرها، تشكّ في جاهزية المحطة الجديدة، وتعترض على أي موعد لا تدعمه بيانات الاختبار.",
        },
        {
          slot: "specialist",
          name: "داويت بيكيلي",
          role: "مسؤول الصحة والسلامة",
          personality: "هادئ ودقيق، يصرّ على الحقائق قبل الاستنتاجات، ويتوقع الإبلاغ عن الحوادث كاملة.",
        },
      ],
      chapters: [
        {
          title: "اليوم الأول: خطة الربط",
          summary: "تطلب إنغريد المضيّ في ربط المحطة الجديدة بالشبكة في موعده دون التهاون في فحوص السلامة.",
        },
        {
          title: "اليوم الثاني: اختبار فاشل",
          summary: "يفشل اختبار أساسي في المحطة الجديدة، ويتطلب التحقيق في الحادثة جزءًا من وقت فريقك.",
        },
        {
          title: "اليومان الثالث والرابع: مواعيد وشكوك",
          summary: "يحتاج العميل إلى موعد مؤكد، ويريد الفريق التجاري الإسراع، ويطالب مسؤول السلامة بمزيد من الفحوص.",
        },
        {
          title: "اليوم الخامس: مراجعة القرار",
          summary: "عرض التوصية بشأن موعد الربط، والتأمل في قرارات الأسبوع.",
        },
      ],
    },
  },
];
